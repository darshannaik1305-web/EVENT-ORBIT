package com.mvjce.eventmanagement.rag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class HybridReranker {

    public static class ScoredChunk {
        private final KnowledgeChunker.KnowledgeChunk chunk;
        private final double lexicalScore;
        private final double semanticScore;
        private final double intentScore;
        private final double entityBoost;
        private final double finalScore;

        public ScoredChunk(KnowledgeChunker.KnowledgeChunk chunk, double lexicalScore,
                           double semanticScore, double intentScore, double entityBoost, double finalScore) {
            this.chunk = chunk;
            this.lexicalScore = lexicalScore;
            this.semanticScore = semanticScore;
            this.intentScore = intentScore;
            this.entityBoost = entityBoost;
            this.finalScore = finalScore;
        }

        public KnowledgeChunker.KnowledgeChunk getChunk() { return chunk; }
        public double getLexicalScore() { return lexicalScore; }
        public double getSemanticScore() { return semanticScore; }
        public double getIntentScore() { return intentScore; }
        public double getEntityBoost() { return entityBoost; }
        public double getFinalScore() { return finalScore; }
    }

    @Value("${rag.hybrid.lexical.weight:0.4}")
    private double lexicalWeight;

    @Value("${rag.hybrid.semantic.weight:0.6}")
    private double semanticWeight;

    @Value("${rag.hybrid.entity.boost:0.35}")
    private double entityBoostValue;

    @Value("${rag.hybrid.intent.weight:0.5}")
    private double intentWeight;

    public List<ScoredChunk> rerank(List<KnowledgeChunker.MatchResult> lexicalMatches,
                                    Map<String, Double> semanticScores,
                                    List<KnowledgeChunker.KnowledgeChunk> allChunks,
                                    QueryProcessor.Intent intent,
                                    List<String> detectedEntities,
                                    int maxResults) {
        return rerank(lexicalMatches, semanticScores, allChunks, intent, QueryProcessor.RequestedAttribute.GENERAL, detectedEntities, maxResults);
    }

    public List<ScoredChunk> rerank(List<KnowledgeChunker.MatchResult> lexicalMatches,
                                    Map<String, Double> semanticScores,
                                    List<KnowledgeChunker.KnowledgeChunk> allChunks,
                                    QueryProcessor.Intent intent,
                                    QueryProcessor.RequestedAttribute requestedAttribute,
                                    List<String> detectedEntities,
                                    int maxResults) {
        Map<String, Double> lexicalMap = new HashMap<>();
        double maxLexical = 1.0;
        for (KnowledgeChunker.MatchResult m : lexicalMatches) {
            lexicalMap.put(m.getChunk().getId(), m.getScore());
            if (m.getScore() > maxLexical) {
                maxLexical = m.getScore();
            }
        }

        Map<String, KnowledgeChunker.KnowledgeChunk> chunkMap = new HashMap<>();
        for (KnowledgeChunker.KnowledgeChunk c : allChunks) {
            chunkMap.put(c.getId(), c);
        }

        Set<String> candidateIds = new LinkedHashSet<>();
        lexicalMatches.forEach(m -> candidateIds.add(m.getChunk().getId()));
        candidateIds.addAll(semanticScores.keySet());

        List<ScoredChunk> scoredList = new ArrayList<>();
        boolean isDebug = System.getProperty("rag.debug") != null || System.getenv("RAG_DEBUG") != null;

        if (isDebug) {
            System.out.println("🔍 [RAG Reranker] Intent: " + intent + " | Attribute: " + requestedAttribute + " | Entities: " + detectedEntities);
        }

        for (String id : candidateIds) {
            KnowledgeChunker.KnowledgeChunk chunk = chunkMap.get(id);
            if (chunk == null) continue;

            // 1. Entity-Aware Hard Filtering for Entity-Specific Queries
            boolean entityMismatch = checkEntityMismatch(chunk, detectedEntities, intent);
            if (entityMismatch) {
                if (isDebug) {
                    System.out.println("   ❌ Chunk [" + chunk.getTitle() + "] -> rejected: entity mismatch");
                }
                continue;
            }

            // 2. Normalized Lexical Score [0.0, 1.0]
            double rawLexical = lexicalMap.getOrDefault(id, 0.0);
            double normLexical = Math.min(1.0, rawLexical / maxLexical);

            // 3. Normalized Semantic Score [0.0, 1.0]
            double rawSemantic = semanticScores.getOrDefault(id, 0.0);
            double normSemantic = Math.max(0.0, Math.min(1.0, rawSemantic));

            // 4. Intent & Attribute Compatibility Scoring
            double intentScore = calculateIntentCompatibility(chunk, intent, requestedAttribute);

            // 5. Selective Domain Entity Boost
            double appliedBoost = 0.0;
            if (detectedEntities != null && !detectedEntities.isEmpty()) {
                String titleLower = chunk.getTitle().toLowerCase();
                String contentLower = chunk.getContent().toLowerCase();
                for (String entity : detectedEntities) {
                    if (entityMatchesText(entity, titleLower, contentLower)) {
                        appliedBoost = entityBoostValue;
                        break;
                    }
                }
            }

            // 6. Final Score Fusion
            double finalScore = (lexicalWeight * normLexical) + (semanticWeight * normSemantic) +
                    (intentWeight * intentScore) + appliedBoost;

            // Strict Relevance Filter
            if (finalScore >= 0.20 && intentScore >= 0.0) {
                if (isDebug) {
                    System.out.println("   ✅ Chunk [" + chunk.getTitle() + "] -> accepted (Score: " + String.format("%.3f", finalScore) + ")");
                }
                scoredList.add(new ScoredChunk(chunk, normLexical, normSemantic, intentScore, appliedBoost, finalScore));
            } else if (isDebug) {
                System.out.println("   ⚠️ Chunk [" + chunk.getTitle() + "] -> below threshold (Score: " + String.format("%.3f", finalScore) + ")");
            }
        }

        // Sort descending by finalScore
        scoredList.sort((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()));

        // Deduplicate overlapping / redundant chunks
        List<ScoredChunk> deduplicated = new ArrayList<>();
        for (ScoredChunk sc : scoredList) {
            long countInCat = deduplicated.stream().filter(d -> d.getChunk().getCategory() == sc.getChunk().getCategory()).count();
            if (countInCat < 2 || sc.getEntityBoost() > 0) {
                deduplicated.add(sc);
            }
            if (deduplicated.size() >= maxResults) break;
        }

        if (isDebug) {
            System.out.println("📦 [RAG Reranker] Final context chunks: " + deduplicated.size());
        }

        return deduplicated;
    }

    private static final List<String> KNOWN_CAMPUS_ENTITIES = List.of(
            "CG", "CS", "ISE", "ECE", "AIML",
            "Placement Cell", "Library", "Sports Complex", "College Auditorium",
            "Principal Office", "Administration Office"
    );

    private boolean checkEntityMismatch(KnowledgeChunker.KnowledgeChunk chunk, List<String> detectedEntities, QueryProcessor.Intent intent) {
        if (detectedEntities == null || detectedEntities.isEmpty()) {
            return false;
        }

        // Only enforce strict entity exclusion for department/location or entity-specific knowledge queries
        if (intent != QueryProcessor.Intent.KNOWLEDGE_DEPARTMENT_LOCATION &&
            chunk.getCategory() != KnowledgeChunker.ChunkCategory.DEPARTMENT_LOCATION) {
            return false;
        }

        String titleLower = chunk.getTitle().toLowerCase();
        String contentLower = chunk.getContent().toLowerCase();

        // Check which campus entities this chunk describes
        List<String> chunkEntities = new ArrayList<>();
        for (String entity : KNOWN_CAMPUS_ENTITIES) {
            if (entityMatchesText(entity, titleLower, contentLower)) {
                chunkEntities.add(entity);
            }
        }

        // If chunk is not about any specific campus entity, don't filter it out
        if (chunkEntities.isEmpty()) {
            return false;
        }

        // If chunk describes campus entities, at least ONE must match what the user asked for
        for (String cEnt : chunkEntities) {
            for (String dEnt : detectedEntities) {
                if (cEnt.equalsIgnoreCase(dEnt)) {
                    return false; // Valid match, accept!
                }
            }
        }

        // Chunk describes a different entity from what the user requested -> Reject!
        return true;
    }

    private boolean entityMatchesText(String entity, String titleLower, String contentLower) {
        String entLower = entity.toLowerCase();
        if (entLower.equals("cg")) {
            return titleLower.matches(".*\\b(cg|computer graphics)\\b.*") || contentLower.matches(".*\\b(cg|computer graphics)\\b.*");
        }
        if (entLower.equals("cs")) {
            return titleLower.matches(".*\\b(cs|cse|computer science)\\b.*") || contentLower.matches(".*\\b(cs|cse|computer science)\\b.*");
        }
        if (entLower.equals("ise")) {
            return titleLower.matches(".*\\b(ise|information science)\\b.*") || contentLower.matches(".*\\b(ise|information science)\\b.*");
        }
        if (entLower.equals("ece")) {
            return titleLower.matches(".*\\b(ece|electronics and communication|electronics & communication)\\b.*") ||
                   contentLower.matches(".*\\b(ece|electronics and communication|electronics & communication)\\b.*");
        }
        if (entLower.equals("aiml")) {
            return titleLower.matches(".*\\b(aiml|ai ml|artificial intelligence)\\b.*") ||
                   contentLower.matches(".*\\b(aiml|ai ml|artificial intelligence)\\b.*");
        }
        if (entLower.contains("placement")) {
            return titleLower.contains("placement") || contentLower.contains("placement");
        }
        if (entLower.contains("library")) {
            return titleLower.contains("library") || contentLower.contains("library");
        }
        if (entLower.contains("sports")) {
            return titleLower.contains("sports") || contentLower.contains("sports") || contentLower.contains("gymnasium");
        }
        if (entLower.contains("auditorium")) {
            return titleLower.contains("auditorium") || contentLower.contains("auditorium");
        }
        if (entLower.contains("principal")) {
            return titleLower.contains("principal") || contentLower.contains("principal");
        }
        if (entLower.contains("admin")) {
            return titleLower.contains("admin") || contentLower.contains("admin");
        }

        return titleLower.matches(".*\\b" + java.util.regex.Pattern.quote(entLower) + "\\b.*") ||
               contentLower.matches(".*\\b" + java.util.regex.Pattern.quote(entLower) + "\\b.*");
    }

    private double calculateIntentCompatibility(KnowledgeChunker.KnowledgeChunk chunk,
                                                QueryProcessor.Intent intent,
                                                QueryProcessor.RequestedAttribute requestedAttribute) {
        KnowledgeChunker.ChunkCategory cat = chunk.getCategory();

        if (intent == QueryProcessor.Intent.KNOWLEDGE_DEPARTMENT_LOCATION || requestedAttribute == QueryProcessor.RequestedAttribute.LOCATION) {
            if (cat == KnowledgeChunker.ChunkCategory.DEPARTMENT_LOCATION) return 1.0;
            if (cat == KnowledgeChunker.ChunkCategory.CAMPUS_INFO) return 0.7;
            if (cat == KnowledgeChunker.ChunkCategory.REGISTRATION_PROCEDURE || cat == KnowledgeChunker.ChunkCategory.SCHOLARSHIP || cat == KnowledgeChunker.ChunkCategory.RULES) {
                return -1.0; // Heavily suppress unrelated registration/rules chunks
            }
            return 0.0;
        }

        if (intent == QueryProcessor.Intent.KNOWLEDGE_REGISTRATION || requestedAttribute == QueryProcessor.RequestedAttribute.REGISTRATION_PROCEDURE) {
            if (cat == KnowledgeChunker.ChunkCategory.REGISTRATION_PROCEDURE) {
                String tLower = chunk.getTitle().toLowerCase();
                if (tLower.contains("process") || tLower.contains("how can i register") || tLower.contains("how do i register")) {
                    return 1.2;
                }
                return 1.0;
            }
            if (cat == KnowledgeChunker.ChunkCategory.ELIGIBILITY) return -1.0; // Heavily suppress eligibility for procedure queries
            if (cat == KnowledgeChunker.ChunkCategory.DEPARTMENT_LOCATION) return -1.0;
            return 0.0;
        }

        if (intent == QueryProcessor.Intent.KNOWLEDGE_ELIGIBILITY || requestedAttribute == QueryProcessor.RequestedAttribute.ELIGIBILITY) {
            if (cat == KnowledgeChunker.ChunkCategory.ELIGIBILITY) return 1.0;
            if (cat == KnowledgeChunker.ChunkCategory.DEPARTMENT_LOCATION) return -1.0;
            return -0.2;
        }

        if (intent == QueryProcessor.Intent.KNOWLEDGE_SCHOLARSHIP || requestedAttribute == QueryProcessor.RequestedAttribute.SCHOLARSHIP) {
            if (cat == KnowledgeChunker.ChunkCategory.SCHOLARSHIP) return 1.5;
            if (cat == KnowledgeChunker.ChunkCategory.REGISTRATION_PROCEDURE) return -1.0;
            if (cat == KnowledgeChunker.ChunkCategory.ELIGIBILITY) return -1.0;
            if (cat == KnowledgeChunker.ChunkCategory.DEPARTMENT_LOCATION) return -1.0;
            return -0.5;
        }

        if (intent == QueryProcessor.Intent.KNOWLEDGE_RULES || requestedAttribute == QueryProcessor.RequestedAttribute.RULES) {
            if (cat == KnowledgeChunker.ChunkCategory.RULES) return 1.0;
            if (cat == KnowledgeChunker.ChunkCategory.DEPARTMENT_LOCATION) return -1.0;
            return 0.0;
        }

        return 0.2;
    }
}
