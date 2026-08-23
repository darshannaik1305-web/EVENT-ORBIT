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

        for (String id : candidateIds) {
            KnowledgeChunker.KnowledgeChunk chunk = chunkMap.get(id);
            if (chunk == null) continue;

            // 1. Normalized Lexical Score [0.0, 1.0]
            double rawLexical = lexicalMap.getOrDefault(id, 0.0);
            double normLexical = Math.min(1.0, rawLexical / maxLexical);

            // 2. Normalized Semantic Score [0.0, 1.0]
            double rawSemantic = semanticScores.getOrDefault(id, 0.0);
            double normSemantic = Math.max(0.0, Math.min(1.0, rawSemantic));

            // 3. Intent Compatibility Scoring
            double intentScore = calculateIntentCompatibility(chunk, intent);

            // 4. Selective Domain Entity Boost
            double appliedBoost = 0.0;
            if (detectedEntities != null && !detectedEntities.isEmpty()) {
                String titleLower = chunk.getTitle().toLowerCase();
                String contentLower = chunk.getContent().toLowerCase();
                for (String entity : detectedEntities) {
                    if (entity.length() >= 3 && (titleLower.contains(entity) || contentLower.contains(entity))) {
                        appliedBoost = entityBoostValue;
                        break;
                    }
                }
            }

            // 5. Final Score Fusion
            double finalScore = (lexicalWeight * normLexical) + (semanticWeight * normSemantic) +
                    (intentWeight * intentScore) + appliedBoost;

            // Strict Relevance Filter: Chunk must pass minimum threshold
            if (finalScore >= 0.25 && intentScore >= 0.0) {
                scoredList.add(new ScoredChunk(chunk, normLexical, normSemantic, intentScore, appliedBoost, finalScore));
            }
        }

        // Sort descending by finalScore
        scoredList.sort((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()));

        // Deduplicate overlapping / redundant chunks
        List<ScoredChunk> deduplicated = new ArrayList<>();
        Set<String> seenTopics = new HashSet<>();
        for (ScoredChunk sc : scoredList) {
            String catKey = sc.getChunk().getCategory().name();
            // Allow at most 2 chunks per category to avoid spamming multiple identical FAQ chunks
            long countInCat = deduplicated.stream().filter(d -> d.getChunk().getCategory() == sc.getChunk().getCategory()).count();
            if (countInCat < 2) {
                deduplicated.add(sc);
            }
            if (deduplicated.size() >= maxResults) break;
        }

        return deduplicated;
    }

    private double calculateIntentCompatibility(KnowledgeChunker.KnowledgeChunk chunk, QueryProcessor.Intent intent) {
        KnowledgeChunker.ChunkCategory cat = chunk.getCategory();

        if (intent == QueryProcessor.Intent.KNOWLEDGE_REGISTRATION) {
            if (cat == KnowledgeChunker.ChunkCategory.REGISTRATION_PROCEDURE) return 1.0;
            if (cat == KnowledgeChunker.ChunkCategory.ELIGIBILITY) return -1.0; // Heavily suppress eligibility for procedure queries
            return 0.0;
        }

        if (intent == QueryProcessor.Intent.KNOWLEDGE_ELIGIBILITY) {
            if (cat == KnowledgeChunker.ChunkCategory.ELIGIBILITY) return 1.0;
            return -0.2;
        }

        if (intent == QueryProcessor.Intent.KNOWLEDGE_SCHOLARSHIP) {
            if (cat == KnowledgeChunker.ChunkCategory.SCHOLARSHIP) return 1.0;
            return -0.5;
        }

        if (intent == QueryProcessor.Intent.KNOWLEDGE_RULES) {
            if (cat == KnowledgeChunker.ChunkCategory.RULES) return 1.0;
            return 0.0;
        }

        return 0.2;
    }
}
