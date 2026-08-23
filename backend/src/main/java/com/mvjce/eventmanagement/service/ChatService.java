package com.mvjce.eventmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mvjce.eventmanagement.controller.ChatResponse;
import com.mvjce.eventmanagement.dto.SourceMetadata;
import com.mvjce.eventmanagement.rag.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    public static final String GROUNDED_UNAVAILABLE_MESSAGE = 
        "I don't have that specific information in my records right now. Please contact the department or check official notices.";

    public static final String PRIVACY_REFUSAL_MESSAGE =
        "I can only access your own participation information. I can't provide another student's private data.";

    @Autowired
    private DatabaseSqlAgent databaseSqlAgent;

    @Autowired
    private KnowledgeChunker knowledgeChunker;

    @Autowired
    private QueryProcessor queryProcessor;

    @Autowired
    private SemanticEmbeddingEngine embeddingEngine;

    @Autowired
    private HybridReranker hybridReranker;

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://generativelanguage.googleapis.com/v1beta/openai/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:gemini-2.0-flash}")
    private String model;

    @Value("${openai.connect.timeout.ms:5000}")
    private int connectTimeoutMs;

    @Value("${openai.read.timeout.ms:10000}")
    private int readTimeoutMs;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatResponse processQuery(String rawQuery, String authenticatedUsername) {
        long totalStartTime = System.currentTimeMillis();

        if (rawQuery == null || rawQuery.isBlank()) {
            return new ChatResponse(GROUNDED_UNAVAILABLE_MESSAGE, Collections.emptyList());
        }

        // 1. Query Normalization, Intent Classification & Domain Entity Extraction
        QueryProcessor.ProcessedQuery processed = queryProcessor.process(rawQuery);
        QueryProcessor.Intent intent = processed.getIntent();

        // LEVEL 1: Greeting
        if (intent == QueryProcessor.Intent.GREETING) {
            return new ChatResponse(
                "Hello! 👋 I am your EventOrbit Smart Assistant. How can I help you today? You can ask me about upcoming events, club registrations, winner results, or scholarship guidelines!",
                Collections.emptyList()
            );
        }

        // LEVEL 1: Privacy / Prompt Injection Protection
        if (intent == QueryProcessor.Intent.PRIVACY_ATTACK) {
            return new ChatResponse(PRIVACY_REFUSAL_MESSAGE, Collections.emptyList());
        }

        // LEVEL 1: Student Private Data (Strict Security & JPA DB Context Only)
        if (intent == QueryProcessor.Intent.PRIVATE_STUDENT_DATA) {
            DatabaseSqlAgent.QueryResult dbResult = databaseSqlAgent.retrieveTargetedContext(
                    processed.getNormalizedQuery(), authenticatedUsername, intent, null, null);

            List<SourceMetadata> sources = deduplicateSources(dbResult.getSources());
            if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_OPENAI_API_KEY")) {
                String llmAnswer = callLlmWithStrictGrounding(processed.getOriginalQuery(), dbResult.getContext(), "PRIVATE_DATA");
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    return new ChatResponse(llmAnswer, sources);
                }
            }
            return new ChatResponse(dbResult.getContext(), sources);
        }

        // LEVEL 2 & 3: Database Entity & Live Application Data (Clubs, Winners, Events)
        boolean isDatabaseIntent = (intent == QueryProcessor.Intent.CLUB_EVENTS ||
                intent == QueryProcessor.Intent.WINNERS ||
                intent == QueryProcessor.Intent.CLUBS_LIST ||
                intent == QueryProcessor.Intent.EVENT_DETAIL ||
                intent == QueryProcessor.Intent.EVENTS_ACTIVE ||
                intent == QueryProcessor.Intent.EVENTS_ENDED);

        if (isDatabaseIntent || processed.getTargetClubName() != null || processed.getTargetEventName() != null) {
            DatabaseSqlAgent.QueryResult dbResult = databaseSqlAgent.retrieveTargetedContext(
                    processed.getNormalizedQuery(), authenticatedUsername, intent,
                    processed.getTargetClubName(), processed.getTargetEventName());

            if (!dbResult.getContext().isBlank()) {
                List<SourceMetadata> sources = deduplicateSources(dbResult.getSources());
                if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_OPENAI_API_KEY")) {
                    String llmAnswer = callLlmWithStrictGrounding(processed.getOriginalQuery(), dbResult.getContext(), "DATABASE_DATA");
                    if (llmAnswer != null && !llmAnswer.isBlank()) {
                        return new ChatResponse(llmAnswer, sources);
                    }
                }
                return new ChatResponse(dbResult.getContext(), sources);
            }
        }

        // LEVEL 4: Knowledge Base Retrieval (RAG with Intent Compatibility & Semantic Embeddings)
        long lexicalStart = System.currentTimeMillis();
        Map<String, KnowledgeChunker.MatchResult> candidateMatches = new LinkedHashMap<>();

        for (KnowledgeChunker.MatchResult m : knowledgeChunker.search(processed.getNormalizedQuery(), 5)) {
            candidateMatches.put(m.getChunk().getId(), m);
        }

        if (!processed.getRetrievalVariants().isEmpty()) {
            for (String variant : processed.getRetrievalVariants()) {
                for (KnowledgeChunker.MatchResult vm : knowledgeChunker.search(variant, 3)) {
                    candidateMatches.merge(vm.getChunk().getId(), vm, (existing, incoming) ->
                            existing.getScore() >= incoming.getScore() ? existing : incoming);
                }
            }
        }

        List<KnowledgeChunker.MatchResult> lexicalMatches = new ArrayList<>(candidateMatches.values());
        long lexicalLatencyMs = System.currentTimeMillis() - lexicalStart;

        // Semantic Embedding Search
        long semanticStart = System.currentTimeMillis();
        Map<String, Double> semanticScores = Collections.emptyMap();
        if (embeddingEngine.getStatus() == SemanticEmbeddingEngine.EngineStatus.VERIFIED) {
            float[] queryVector = embeddingEngine.embedText(processed.getNormalizedQuery());
            if (queryVector != null) {
                semanticScores = knowledgeChunker.searchSemantic(queryVector, embeddingEngine);
            }
        }
        long semanticLatencyMs = System.currentTimeMillis() - semanticStart;

        // Hybrid Reranking with Intent Matching
        long rankingStart = System.currentTimeMillis();
        List<HybridReranker.ScoredChunk> rankedChunks = hybridReranker.rerank(
                lexicalMatches,
                semanticScores,
                knowledgeChunker.getAllChunks(),
                intent,
                processed.getExtractedEntities(),
                2
        );
        long rankingLatencyMs = System.currentTimeMillis() - rankingStart;

        if (!rankedChunks.isEmpty()) {
            List<SourceMetadata> sourcesList = rankedChunks.stream()
                    .map(sc -> sc.getChunk().getMetadata())
                    .collect(Collectors.toList());

            StringBuilder knowledgeContext = new StringBuilder();
            knowledgeContext.append("=== Official College Knowledge Base & FAQs ===\n");
            for (HybridReranker.ScoredChunk sc : rankedChunks) {
                knowledgeContext.append("Topic: ").append(sc.getChunk().getTitle()).append("\n")
                        .append(sc.getChunk().getContent()).append("\n\n");
            }

            List<SourceMetadata> uniqueSources = deduplicateSources(sourcesList);

            if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_OPENAI_API_KEY")) {
                String llmAnswer = callLlmWithStrictGrounding(processed.getOriginalQuery(), knowledgeContext.toString().trim(), "KNOWLEDGE");
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    logLatencyMetrics(lexicalLatencyMs, semanticLatencyMs, rankingLatencyMs, totalStartTime);
                    return new ChatResponse(llmAnswer, uniqueSources);
                }
            }

            // Fallback: Format top knowledge chunks cleanly
            StringBuilder fallbackSb = new StringBuilder();
            for (HybridReranker.ScoredChunk sc : rankedChunks) {
                fallbackSb.append(sc.getChunk().getContent()).append("\n\n");
            }
            logLatencyMetrics(lexicalLatencyMs, semanticLatencyMs, rankingLatencyMs, totalStartTime);
            return new ChatResponse(fallbackSb.toString().trim(), uniqueSources);
        }

        // LEVEL 5: Grounded Fallback
        logLatencyMetrics(lexicalLatencyMs, semanticLatencyMs, rankingLatencyMs, totalStartTime);
        return new ChatResponse(GROUNDED_UNAVAILABLE_MESSAGE, Collections.emptyList());
    }

    private void logLatencyMetrics(long lexicalMs, long semanticMs, long rankingMs, long totalStartMs) {
        long totalMs = System.currentTimeMillis() - totalStartMs;
        if (System.getProperty("rag.debug") != null || System.getenv("RAG_DEBUG") != null) {
            System.out.println("📊 RAG Latency Metrics -> Lexical: " + lexicalMs + "ms | Semantic: " + semanticMs +
                    "ms | Hybrid Ranking: " + rankingMs + "ms | Total: " + totalMs + "ms");
        }
    }

    private String callLlmWithStrictGrounding(String query, String context, String contextType) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                    .build();

            String systemPrompt = 
                "You are EventOrbit AI Assistant, a college event management assistant.\n" +
                "STRICT GROUNDING INSTRUCTIONS:\n" +
                "1. Answer ONLY using the facts provided in the Context below.\n" +
                "2. Context Type: " + contextType + ".\n" +
                "3. If answering registration procedure questions, provide a clear, concise numbered step-by-step guide.\n" +
                "4. If answering event or club queries, present the events clearly with dates, venue, and status.\n" +
                "5. Never expose student USNs in public responses or results.\n" +
                "6. If the answer cannot be directly derived from the Context, respond EXACTLY with:\n" +
                "\"" + GROUNDED_UNAVAILABLE_MESSAGE + "\"\n" +
                "7. Do NOT invent, speculate, or infer information outside the Context.\n\n" +
                "Context:\n" + context + "\n\n" +
                "Question: " + query;

            String requestBody = objectMapper.createObjectNode()
                    .put("model", model)
                    .set("messages", objectMapper.createArrayNode()
                            .add(objectMapper.createObjectNode()
                                    .put("role", "system")
                                    .put("content", systemPrompt)))
                    .toString();

            String targetUrl = apiUrl;
            if (apiUrl.contains("generativelanguage.googleapis.com") && !apiUrl.contains("key=")) {
                targetUrl = apiUrl + (apiUrl.contains("?") ? "&" : "?") + "key=" + apiKey;
            }

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("HTTP-Referer", "http://localhost:7070")
                    .header("X-Title", "EventOrbit")
                    .timeout(Duration.ofMillis(readTimeoutMs))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody));

            HttpRequest request = reqBuilder.build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    String answer = choices.get(0).path("message").path("content").asText().trim();
                    if (!answer.isBlank()) {
                        return answer;
                    }
                }
            } else {
                System.err.println("LLM API Error Code " + response.statusCode() + ": " + response.body());
            }
        } catch (Exception e) {
            System.err.println("LLM Exception / Timeout: " + e.getMessage());
        }
        return null;
    }

    private List<SourceMetadata> deduplicateSources(List<SourceMetadata> rawSources) {
        Map<String, SourceMetadata> map = new LinkedHashMap<>();
        for (SourceMetadata s : rawSources) {
            if (s != null && s.getType() != null && s.getId() != null) {
                String key = s.getType() + ":" + s.getId();
                map.putIfAbsent(key, s);
            }
        }
        return new ArrayList<>(map.values());
    }
}
