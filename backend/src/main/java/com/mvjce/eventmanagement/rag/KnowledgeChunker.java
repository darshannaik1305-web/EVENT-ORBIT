package com.mvjce.eventmanagement.rag;

import com.mvjce.eventmanagement.dto.SourceMetadata;
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

    public static class KnowledgeChunk {
        private final String id;
        private final String title;
        private final String content;
        private final SourceMetadata metadata;

        public KnowledgeChunk(String id, String title, String content) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.metadata = new SourceMetadata("KNOWLEDGE", id, title);
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getContent() { return content; }
        public SourceMetadata getMetadata() { return metadata; }
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

    private final List<KnowledgeChunk> chunks = new ArrayList<>();

    @PostConstruct
    public void init() {
        loadKnowledgeChunks();
    }

    public synchronized void loadKnowledgeChunks() {
        chunks.clear();
        try {
            ClassPathResource resource = new ClassPathResource("knowledge.txt");
            if (!resource.exists()) return;

            InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            String text = FileCopyUtils.copyToString(reader);

            String[] sections = text.split("### ");
            int index = 1;
            for (String sec : sections) {
                if (sec.isBlank()) continue;
                String[] lines = sec.split("\\n", 2);
                String title = lines[0].trim();
                String body = (lines.length > 1) ? lines[1].trim() : "";
                
                if (!title.isEmpty() && !body.isEmpty()) {
                    String id = "KNOW-" + index++;
                    chunks.add(new KnowledgeChunk(id, title, body));
                }
            }
        } catch (Exception e) {
            System.err.println("KnowledgeChunker init error: " + e.getMessage());
        }
    }

    public List<MatchResult> search(String query, int maxResults) {
        if (query == null || query.isBlank() || chunks.isEmpty()) {
            return Collections.emptyList();
        }

        String lowerQuery = query.toLowerCase().trim();

        // Ignore generic short words like "hi", "hello", "hey"
        if (lowerQuery.matches("^(hi|hello|hey|hola|greetings|help|sup|ss)$")) {
            return Collections.emptyList();
        }

        String[] queryWords = lowerQuery.split("\\W+");
        List<MatchResult> results = new ArrayList<>();

        for (KnowledgeChunk chunk : chunks) {
            double score = calculateScore(chunk, queryWords, lowerQuery);
            if (score >= 5.0) { // Require minimum threshold
                results.add(new MatchResult(chunk, score));
            }
        }

        results.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        return results.stream()
                .limit(maxResults)
                .collect(Collectors.toList());
    }

    private double calculateScore(KnowledgeChunk chunk, String[] queryWords, String fullQuery) {
        double score = 0.0;
        String titleLower = chunk.getTitle().toLowerCase();
        String contentLower = chunk.getContent().toLowerCase();

        // Check exact title match or full query match for queries >= 4 chars
        if (fullQuery.length() >= 4 && titleLower.contains(fullQuery)) {
            score += 15.0;
        }

        for (String word : queryWords) {
            if (word.length() < 3) continue; // Ignore 1 and 2 letter tokens

            // Word boundary match in title
            if (titleLower.matches(".*\\b" + Pattern.quote(word) + "\\b.*")) {
                score += 10.0;
            } else if (titleLower.contains(word)) {
                score += 4.0;
            }

            // Word boundary match in content
            if (contentLower.matches(".*\\b" + Pattern.quote(word) + "\\b.*")) {
                score += 5.0;
            }
        }

        return score;
    }

    public List<KnowledgeChunk> getAllChunks() {
        return Collections.unmodifiableList(chunks);
    }
}
