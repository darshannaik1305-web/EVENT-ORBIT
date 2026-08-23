package com.mvjce.eventmanagement.rag;

import com.mvjce.eventmanagement.dto.SourceMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import jakarta.annotation.PostConstruct;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class KnowledgeChunker {

    public enum ChunkCategory {
        REGISTRATION_PROCEDURE,
        ELIGIBILITY,
        RULES,
        SCHOLARSHIP,
        FAQ_GENERAL,
        OTHER
    }

    public static class KnowledgeChunk {
        private final String id;
        private final String title;
        private final String content;
        private final ChunkCategory category;
        private final SourceMetadata metadata;
        private float[] vector;

        public KnowledgeChunk(String id, String title, String content, ChunkCategory category) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.category = category;
            this.metadata = new SourceMetadata("KNOWLEDGE", id, title);
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getContent() { return content; }
        public ChunkCategory getCategory() { return category; }
        public SourceMetadata getMetadata() { return metadata; }
        public float[] getVector() { return vector; }
        public void setVector(float[] vector) { this.vector = vector; }
    }

    public static class MatchResult {
        private final KnowledgeChunk chunk;
        private final double score;

        public MatchResult(KnowledgeChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }

        public KnowledgeChunk getChunk() { return chunk; }
        public double getScore() { return score; }
    }

    @Autowired(required = false)
    private SemanticVectorIndex vectorIndex;

    private final List<KnowledgeChunk> chunks = new ArrayList<>();
    private long lastLoadedTime = 0;

    @PostConstruct
    public void init() {
        loadKnowledgeChunks();
    }

    public synchronized void loadKnowledgeChunks() {
        try {
            java.io.File srcFile = new java.io.File("src/main/resources/knowledge.txt");
            java.io.File targetFile = new java.io.File("target/classes/knowledge.txt");

            java.io.File fileToRead = null;
            if (srcFile.exists()) {
                fileToRead = srcFile;
            } else if (targetFile.exists()) {
                fileToRead = targetFile;
            }

            if (fileToRead != null) {
                long modTime = fileToRead.lastModified();
                if (modTime > lastLoadedTime || chunks.isEmpty()) {
                    String text = java.nio.file.Files.readString(fileToRead.toPath(), StandardCharsets.UTF_8);
                    parseAndLoadChunks(text);
                    lastLoadedTime = modTime;
                    if (vectorIndex != null) {
                        vectorIndex.indexChunks(chunks);
                    }
                }
            } else {
                ClassPathResource resource = new ClassPathResource("knowledge.txt");
                if (resource.exists()) {
                    long modTime = System.currentTimeMillis();
                    if (chunks.isEmpty() || modTime - lastLoadedTime > 5000) {
                        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
                        String text = FileCopyUtils.copyToString(reader);
                        parseAndLoadChunks(text);
                        lastLoadedTime = modTime;
                        if (vectorIndex != null) {
                            vectorIndex.indexChunks(chunks);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("KnowledgeChunker load error: " + e.getMessage());
        }
    }

    public synchronized void parseAndLoadChunks(String text) {
        chunks.clear();
        if (text == null || text.isBlank()) return;

        String[] sections = text.split("### ");
        int index = 1;
        for (String sec : sections) {
            if (sec.isBlank()) continue;
            String[] lines = sec.split("\\n", 2);
            String title = lines[0].trim();
            String body = (lines.length > 1) ? lines[1].trim() : "";

            if (!title.isEmpty() && !body.isEmpty()) {
                ChunkCategory cat = categorizeSection(title, body);
                String id = "KNOW-" + index++;
                chunks.add(new KnowledgeChunk(id, title, body, cat));

                // Extract individual FAQ Q&A entries as dedicated high-priority chunks
                if (body.contains("Q:") || body.contains("Q.")) {
                    String[] faqItems = body.split("(?=Q[:.])");
                    for (String item : faqItems) {
                        item = item.trim();
                        if (item.startsWith("Q:") || item.startsWith("Q.")) {
                            String[] qLines = item.split("\\n", 2);
                            String qTitle = qLines[0].replaceAll("^Q[:.]\\s*", "").trim();
                            if (!qTitle.isEmpty()) {
                                ChunkCategory faqCat = categorizeFaq(qTitle);
                                chunks.add(new KnowledgeChunk("FAQ-" + index++, qTitle, item, faqCat));
                            }
                        }
                    }
                }
            }
        }
    }

    private ChunkCategory categorizeSection(String title, String body) {
        String lower = (title + " " + body).toLowerCase();
        if (lower.contains("registration process") || lower.contains("how to register")) {
            return ChunkCategory.REGISTRATION_PROCEDURE;
        } else if (lower.contains("scholarship") || lower.contains("ssp") || lower.contains("nsp")) {
            return ChunkCategory.SCHOLARSHIP;
        } else if (lower.contains("rules") || lower.contains("code of conduct")) {
            return ChunkCategory.RULES;
        }
        return ChunkCategory.OTHER;
    }

    private ChunkCategory categorizeFaq(String question) {
        String lower = question.toLowerCase();
        if (lower.contains("who can participate") || lower.contains("who is eligible")) {
            return ChunkCategory.ELIGIBILITY;
        } else if (lower.contains("registered events") || lower.contains("see my") || lower.contains("cancel my")) {
            return ChunkCategory.REGISTRATION_PROCEDURE;
        }
        return ChunkCategory.FAQ_GENERAL;
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
            "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were",
            "will", "with", "which", "what", "who", "where", "how", "when", "why", "i",
            "me", "my", "am", "do", "does", "did", "can", "there", "any", "this", "should"
    );

    public List<MatchResult> search(String query, int maxResults) {
        loadKnowledgeChunks();

        if (query == null || query.isBlank() || chunks.isEmpty()) {
            return Collections.emptyList();
        }

        String lowerQuery = query.toLowerCase().trim();

        if (lowerQuery.matches("^(hi|hello|hey|hola|greetings|help|sup|ss)$")) {
            return Collections.emptyList();
        }

        String[] queryWords = lowerQuery.split("\\W+");
        List<MatchResult> results = new ArrayList<>();

        for (KnowledgeChunk chunk : chunks) {
            double score = calculateScore(chunk, queryWords, lowerQuery);
            if (score >= 6.0) {
                results.add(new MatchResult(chunk, score));
            }
        }

        results.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        return results.stream()
                .limit(maxResults)
                .collect(Collectors.toList());
    }

    public Map<String, Double> searchSemantic(float[] queryVector, SemanticEmbeddingEngine engine) {
        if (queryVector == null || engine == null || chunks.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Double> scoreMap = new HashMap<>();

        for (KnowledgeChunk chunk : chunks) {
            float[] chunkVec = chunk.getVector();
            if (chunkVec == null && vectorIndex != null) {
                chunkVec = vectorIndex.getVector(chunk.getId());
                chunk.setVector(chunkVec);
            }

            if (chunkVec != null) {
                double sim = engine.cosineSimilarity(queryVector, chunkVec);
                if (sim >= 0.25) {
                    scoreMap.put(chunk.getId(), sim);
                }
            }
        }

        return scoreMap;
    }

    private double calculateScore(KnowledgeChunk chunk, String[] queryWords, String fullQuery) {
        double score = 0.0;
        String titleLower = chunk.getTitle().toLowerCase();
        String contentLower = chunk.getContent().toLowerCase();

        // Exact or strong substring match on title or full query
        if (fullQuery.length() >= 4 && (titleLower.contains(fullQuery) || fullQuery.contains(titleLower))) {
            score += 30.0;
        }

        int meaningfulMatches = 0;

        for (String word : queryWords) {
            if (word.length() < 3 || STOP_WORDS.contains(word)) continue;

            String stem = word.length() > 5 ? word.substring(0, word.length() - 2) : word;

            if (titleLower.matches(".*\\b" + Pattern.quote(word) + "\\b.*")) {
                score += 14.0;
                meaningfulMatches++;
            } else if (titleLower.contains(stem)) {
                score += 8.0;
                meaningfulMatches++;
            }

            if (contentLower.matches(".*\\b" + Pattern.quote(word) + "\\b.*")) {
                score += 5.0;
                meaningfulMatches++;
            } else if (contentLower.contains(stem)) {
                score += 3.0;
                meaningfulMatches++;
            }
        }

        if (score < 6.0 || meaningfulMatches == 0) {
            return 0.0;
        }

        return score;
    }

    public List<KnowledgeChunk> getAllChunks() {
        return Collections.unmodifiableList(chunks);
    }
}
