package com.mvjce.eventmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mvjce.eventmanagement.controller.ChatResponse;
import com.mvjce.eventmanagement.dto.SourceMetadata;
import com.mvjce.eventmanagement.rag.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpConnectTimeoutException;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
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

    @Value("${openai.api.url:https://generativelanguage.googleapis.com/v1beta}")
    private String apiUrl;

    @Value("${openai.model:gemini-2.0-flash}")
    private String model;

    @Value("${openai.connect.timeout.ms:10000}")
    private int connectTimeoutMs;

    @Value("${openai.read.timeout.ms:15000}")
    private int readTimeoutMs;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class ConversationContext {
        private final List<EntityResolution> resolvedEntities;
        private final String previousEvent;
        private final String previousDepartment;
        private final String previousClub;
        private final QueryProcessor.RequestedAttribute previousAttribute;
        private final long timestamp;

        public ConversationContext(List<EntityResolution> resolvedEntities, String previousEvent,
                                   String previousDepartment, String previousClub,
                                   QueryProcessor.RequestedAttribute previousAttribute) {
            this.resolvedEntities = (resolvedEntities != null) ? new ArrayList<>(resolvedEntities) : Collections.emptyList();
            this.previousEvent = previousEvent;
            this.previousDepartment = previousDepartment;
            this.previousClub = previousClub;
            this.previousAttribute = previousAttribute;
            this.timestamp = System.currentTimeMillis();
        }

        public List<EntityResolution> getResolvedEntities() { return resolvedEntities; }
        public String getPreviousEvent() { return previousEvent; }
        public String getPreviousDepartment() { return previousDepartment; }
        public String getPreviousClub() { return previousClub; }
        public QueryProcessor.RequestedAttribute getPreviousAttribute() { return previousAttribute; }
        public long getTimestamp() { return timestamp; }
    }

    private final Map<String, ConversationContext> userContexts = new ConcurrentHashMap<>();

    public void clearUserContext(String username) {
        if (username != null) {
            userContexts.remove(username.toLowerCase());
        }
    }

    public void clearAllContexts() {
        userContexts.clear();
    }

    public ConversationContext getUserContext(String username) {
        return (username != null) ? userContexts.get(username.toLowerCase()) : null;
    }

    private void saveUserContext(String username, ConversationContext context) {
        if (username != null && !username.isBlank() && !username.equalsIgnoreCase("anonymousUser")) {
            userContexts.put(username.toLowerCase(), context);
        }
    }

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

        // Contextual Reference / Pronoun Resolution
        boolean isPronounOrReference = queryProcessor.isPronounQuery(processed.getNormalizedQuery()) ||
                processed.getNormalizedQuery().startsWith("where is it") ||
                processed.getNormalizedQuery().startsWith("who won it") ||
                processed.getNormalizedQuery().startsWith("tell me about it");

        boolean hasExplicitEntity = (!processed.getExtractedEntities().isEmpty() ||
                processed.getTargetDepartment() != null ||
                processed.getTargetEventName() != null ||
                processed.getTargetClubName() != null);

        if (isPronounOrReference && !hasExplicitEntity) {
            ConversationContext userCtx = getUserContext(authenticatedUsername);
            if (userCtx == null || userCtx.getResolvedEntities().isEmpty()) {
                return new ChatResponse("I’m not sure what you’re referring to. Please specify the department, event, or facility.", Collections.emptyList());
            }

            if (userCtx.getResolvedEntities().size() > 1) {
                String e1 = userCtx.getResolvedEntities().get(0).getCanonicalName();
                String e2 = userCtx.getResolvedEntities().get(1).getCanonicalName();
                return new ChatResponse("Please specify whether you mean " + e1 + " or " + e2 + ".", Collections.emptyList());
            }

            EntityResolution candidate = userCtx.getResolvedEntities().get(0);
            QueryProcessor.RequestedAttribute reqAttr = processed.getRequestedAttribute();

            if (reqAttr == QueryProcessor.RequestedAttribute.LOCATION) {
                if (candidate.getType() == EntityResolution.EntityType.DEPARTMENT ||
                    candidate.getType() == EntityResolution.EntityType.CAMPUS_FACILITY) {
                    processed = queryProcessor.process("where is " + candidate.getCanonicalName());
                    intent = processed.getIntent();
                } else {
                    return new ChatResponse("Please specify the department or facility you are looking for.", Collections.emptyList());
                }
            } else if (reqAttr == QueryProcessor.RequestedAttribute.WINNER) {
                if (candidate.getType() == EntityResolution.EntityType.EVENT) {
                    processed = queryProcessor.process("who won in " + candidate.getCanonicalName());
                    intent = processed.getIntent();
                } else if (candidate.getType() == EntityResolution.EntityType.DEPARTMENT) {
                    if (processed.getNormalizedQuery().contains("what has it won") ||
                        processed.getNormalizedQuery().contains("what did it win") ||
                        processed.getNormalizedQuery().contains("winnings of it") ||
                        processed.getNormalizedQuery().contains("achievements of it")) {
                        processed = queryProcessor.process("what has " + candidate.getCanonicalName() + " won");
                        intent = processed.getIntent();
                    } else {
                        return new ChatResponse("Please specify the event you are asking about.", Collections.emptyList());
                    }
                } else {
                    return new ChatResponse("Please specify the event or department you are asking about.", Collections.emptyList());
                }
            } else {
                if (candidate.getType() == EntityResolution.EntityType.EVENT) {
                    processed = queryProcessor.process("tell me about event " + candidate.getCanonicalName());
                    intent = processed.getIntent();
                } else if (candidate.getType() == EntityResolution.EntityType.DEPARTMENT) {
                    processed = queryProcessor.process("where is " + candidate.getCanonicalName());
                    intent = processed.getIntent();
                } else if (candidate.getType() == EntityResolution.EntityType.CLUB) {
                    if (processed.getNormalizedQuery().contains("upcoming") || processed.getNormalizedQuery().contains("future")) {
                        processed = queryProcessor.process("upcoming events in " + candidate.getCanonicalName());
                    } else if (processed.getNormalizedQuery().contains("ended") || processed.getNormalizedQuery().contains("past")) {
                        processed = queryProcessor.process("ended events in " + candidate.getCanonicalName());
                    } else if (processed.getNormalizedQuery().contains("active") || processed.getNormalizedQuery().contains("ongoing")) {
                        processed = queryProcessor.process("active events in " + candidate.getCanonicalName());
                    } else {
                        processed = queryProcessor.process("events in " + candidate.getCanonicalName());
                    }
                    intent = processed.getIntent();
                } else {
                    return new ChatResponse("Please specify the department, event, or facility.", Collections.emptyList());
                }
            }
        }

        // LEVEL 1: Ambiguous Query Clarification (Do not dump all data)
        if (processed.isAmbiguous() && processed.getClarificationMessage() != null) {
            return new ChatResponse(processed.getClarificationMessage(), Collections.emptyList());
        }

        // Update / record conversation context for authenticated users
        recordConversationContext(authenticatedUsername, processed);

        // LEVEL 1: Student Private Data (Strict Security & JPA DB Context Only)
        if (intent == QueryProcessor.Intent.PRIVATE_STUDENT_DATA) {
            DatabaseSqlAgent.QueryResult dbResult = databaseSqlAgent.retrieveTargetedContext(
                    processed.getNormalizedQuery(), authenticatedUsername, intent, null, null);

            List<SourceMetadata> sources = deduplicateSources(dbResult.getSources());
            String context = dbResult.getContext();

            if (context != null && !context.isBlank()) {
                if (hasValidApiKey()) {
                    logSafeLlmRequest(intent, 1, context.length());
                    String llmAnswer = callLlmWithStrictGrounding(processed.getOriginalQuery(), context, "STUDENT_PRIVATE_DATA");
                    if (llmAnswer != null && !llmAnswer.isBlank()) {
                        return new ChatResponse(llmAnswer, sources);
                    }
                }
                return new ChatResponse(context, sources);
            }
            return new ChatResponse(GROUNDED_UNAVAILABLE_MESSAGE, Collections.emptyList());
        }

        // LEVEL 1: Compound Multi-Query (Independent SubQuery Execution to prevent context bleed)
        if (processed.getSubQueries().size() > 1) {
            return processCompoundQuery(processed, authenticatedUsername);
        }

        // LEVEL 2/3: Dynamic Database Intents
        boolean isDatabaseIntent = (intent == QueryProcessor.Intent.CLUB_EVENTS ||
                intent == QueryProcessor.Intent.WINNERS ||
                intent == QueryProcessor.Intent.LATEST_WINNER ||
                intent == QueryProcessor.Intent.LATEST_EVENT_WINNER ||
                intent == QueryProcessor.Intent.EVENTS_THIS_WEEK ||
                intent == QueryProcessor.Intent.REGISTRATION_OPENING_THIS_WEEK ||
                intent == QueryProcessor.Intent.REGISTRATION_CLOSING_THIS_WEEK ||
                intent == QueryProcessor.Intent.RECOMMENDED_REGISTRATIONS_THIS_WEEK ||
                intent == QueryProcessor.Intent.CLUBS_LIST ||
                intent == QueryProcessor.Intent.PRIVATE_STUDENT_DATA ||
                intent == QueryProcessor.Intent.EVENT_DETAIL ||
                intent == QueryProcessor.Intent.EVENTS_ONGOING ||
                intent == QueryProcessor.Intent.EVENTS_UPCOMING ||
                intent == QueryProcessor.Intent.EVENTS_ACTIVE ||
                intent == QueryProcessor.Intent.EVENTS_ENDED);

        String targetDepartment = processed.getTargetDepartment();
        if ("MY_DEPARTMENT".equalsIgnoreCase(targetDepartment)) {
            if (authenticatedUsername == null || authenticatedUsername.isBlank() || authenticatedUsername.equalsIgnoreCase("anonymousUser")) {
                return new ChatResponse("Please log in with your student account to view your department's winnings.", Collections.emptyList());
            }
            targetDepartment = UsnDepartmentResolver.resolveDepartment(authenticatedUsername);
            if (targetDepartment == null) {
                return new ChatResponse("Unable to determine department from your student account (" + authenticatedUsername + ").", Collections.emptyList());
            }
        }

        if (isDatabaseIntent || (processed.getPrimarySource() == QueryProcessor.DataSource.DATABASE && (processed.getTargetClubName() != null || processed.getTargetEventName() != null || targetDepartment != null))) {
            DatabaseSqlAgent.QueryResult dbResult = (targetDepartment != null)
                    ? databaseSqlAgent.retrieveTargetedContext(
                            processed.getNormalizedQuery(), authenticatedUsername, intent,
                            processed.getTargetClubName(), processed.getTargetEventName(), targetDepartment)
                    : databaseSqlAgent.retrieveTargetedContext(
                            processed.getNormalizedQuery(), authenticatedUsername, intent,
                            processed.getTargetClubName(), processed.getTargetEventName());

            String context = (dbResult != null) ? dbResult.getContext() : null;
            if (context != null && !context.isBlank()) {
                List<SourceMetadata> sources = deduplicateSources(dbResult.getSources());
                if (hasValidApiKey()) {
                    logSafeLlmRequest(intent, sources.size(), context.length());
                    String llmAnswer = callLlmWithStrictGrounding(processed.getOriginalQuery(), context, "DATABASE_DATA");
                    if (llmAnswer != null && !llmAnswer.isBlank()) {
                        return new ChatResponse(llmAnswer, sources);
                    }
                }
                return new ChatResponse(context, sources);
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

        // Semantic Embedding Search (using vector index / active engine)
        long semanticStart = System.currentTimeMillis();
        Map<String, Double> semanticScores = Collections.emptyMap();
        if (embeddingEngine.getStatus() == SemanticEmbeddingEngine.EngineStatus.VERIFIED) {
            float[] queryVector = embeddingEngine.embedText(processed.getNormalizedQuery());
            if (queryVector != null) {
                semanticScores = knowledgeChunker.searchSemantic(queryVector, embeddingEngine);
            }
        }
        long semanticLatencyMs = System.currentTimeMillis() - semanticStart;

        // Dynamic Context Sizing based on Query Specificity
        int maxResults = 2;
        if (intent == QueryProcessor.Intent.KNOWLEDGE_DEPARTMENT_LOCATION && processed.getExtractedEntities().size() == 1) {
            maxResults = 1; // Specific single-entity factual query -> strictly 1 precise chunk
        } else if (processed.getExtractedEntities().size() >= 2) {
            maxResults = Math.min(4, processed.getExtractedEntities().size()); // Multi-entity query -> allow all requested entities
        }

        // Hybrid Reranking with Entity/Attribute-Aware Filtering
        long rankingStart = System.currentTimeMillis();
        List<HybridReranker.ScoredChunk> rankedChunks = hybridReranker.rerank(
                lexicalMatches,
                semanticScores,
                knowledgeChunker.getAllChunks(),
                intent,
                processed.getRequestedAttribute(),
                processed.getExtractedEntities(),
                maxResults
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
            String context = knowledgeContext.toString().trim();

            if (hasValidApiKey()) {
                logSafeLlmRequest(intent, rankedChunks.size(), context.length());
                String llmAnswer = callLlmWithStrictGrounding(processed.getOriginalQuery(), context, "KNOWLEDGE");
                
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    // Post-Generation Validation: Check for cross-entity contamination
                    if (isResponseContaminated(llmAnswer, processed.getExtractedEntities())) {
                        System.out.println("⚠️ [Grounding Validator] LLM response contained unrequested entities. Using deterministic grounded answer.");
                        String cleanAnswer = extractCleanContent(rankedChunks);
                        logLatencyMetrics(lexicalLatencyMs, semanticLatencyMs, rankingLatencyMs, totalStartTime);
                        return new ChatResponse(cleanAnswer, uniqueSources);
                    }

                    logLatencyMetrics(lexicalLatencyMs, semanticLatencyMs, rankingLatencyMs, totalStartTime);
                    return new ChatResponse(llmAnswer, uniqueSources);
                }
            }

            // Deterministic Grounded Answer: Format top knowledge chunks cleanly
            String fallbackAnswer = extractCleanContent(rankedChunks);
            logLatencyMetrics(lexicalLatencyMs, semanticLatencyMs, rankingLatencyMs, totalStartTime);
            return new ChatResponse(fallbackAnswer, uniqueSources);
        }

        // LEVEL 5: Grounded Fallback (No context found, do not invoke LLM)
        logLatencyMetrics(lexicalLatencyMs, semanticLatencyMs, rankingLatencyMs, totalStartTime);
        return new ChatResponse(GROUNDED_UNAVAILABLE_MESSAGE, Collections.emptyList());
    }

    private void recordConversationContext(String username, QueryProcessor.ProcessedQuery processed) {
        if (username == null || username.isBlank() || username.equalsIgnoreCase("anonymousUser")) {
            return;
        }

        List<EntityResolution> entities = new ArrayList<>();
        if (processed.getSubQueries().size() > 1) {
            for (QueryProcessor.SubQuery sq : processed.getSubQueries()) {
                if (sq.getEntity() != null && !sq.getEntity().isBlank()) {
                    entities.add(new EntityResolution(
                            sq.getEntityType(),
                            sq.getEntity(),
                            null,
                            true,
                            1.0
                    ));
                }
            }
        } else {
            if (processed.getTargetDepartment() != null) {
                entities.add(new EntityResolution(EntityResolution.EntityType.DEPARTMENT, processed.getTargetDepartment(), null, true, 1.0));
            } else if (processed.getTargetEventName() != null) {
                entities.add(new EntityResolution(EntityResolution.EntityType.EVENT, processed.getTargetEventName(), null, true, 1.0));
            } else if (processed.getTargetClubName() != null) {
                entities.add(new EntityResolution(EntityResolution.EntityType.CLUB, processed.getTargetClubName(), null, true, 1.0));
            } else if (!processed.getExtractedEntities().isEmpty()) {
                for (String ent : processed.getExtractedEntities()) {
                    EntityResolution.EntityType type = QueryProcessor.mapScopeToEntityType(processed.getPrimaryScope());
                    entities.add(new EntityResolution(type, ent, null, true, 1.0));
                }
            }
        }

        if (!entities.isEmpty()) {
            saveUserContext(username, new ConversationContext(
                    entities,
                    processed.getTargetEventName(),
                    processed.getTargetDepartment(),
                    processed.getTargetClubName(),
                    processed.getRequestedAttribute()
            ));
        }
    }

    private String extractCleanContent(List<HybridReranker.ScoredChunk> rankedChunks) {
        StringBuilder sb = new StringBuilder();
        for (HybridReranker.ScoredChunk sc : rankedChunks) {
            String content = sc.getChunk().getContent();
            if (content.contains("A:")) {
                sb.append(content.substring(content.indexOf("A:") + 2).trim()).append("\n\n");
            } else {
                sb.append(content.trim()).append("\n\n");
            }
        }
        return sb.toString().trim();
    }

    private static final List<String> TRACKED_ENTITIES = List.of(
            "CG", "CS", "ISE", "ECE", "AIML", "Placement Cell", "Library", "Sports Complex", "College Auditorium", "Principal Office"
    );

    private boolean isResponseContaminated(String llmAnswer, List<String> requestedEntities) {
        if (requestedEntities == null || requestedEntities.isEmpty() || llmAnswer == null) {
            return false;
        }

        String answerLower = llmAnswer.toLowerCase();
        for (String tracked : TRACKED_ENTITIES) {
            boolean isRequested = requestedEntities.stream().anyMatch(r -> r.equalsIgnoreCase(tracked));
            if (!isRequested) {
                // If unrequested entity appears in the answer, flag as contaminated
                if (tracked.equals("CG") && answerLower.matches(".*\\b(cg|computer graphics)\\b.*")) return true;
                if (tracked.equals("CS") && answerLower.matches(".*\\b(cs|cse|computer science)\\b.*")) return true;
                if (tracked.equals("ISE") && answerLower.matches(".*\\b(ise|information science)\\b.*")) return true;
                if (tracked.equals("ECE") && answerLower.matches(".*\\b(ece|electronics and communication)\\b.*")) return true;
                if (tracked.equals("AIML") && answerLower.matches(".*\\b(aiml|ai ml|artificial intelligence)\\b.*")) return true;
            }
        }
        return false;
    }

    private boolean hasValidApiKey() {
        return apiKey != null && !apiKey.isBlank() && 
               !apiKey.equalsIgnoreCase("YOUR_OPENAI_API_KEY") && 
               !apiKey.equalsIgnoreCase("YOUR_API_KEY");
    }

    private void logSafeLlmRequest(QueryProcessor.Intent intent, int contextChunks, int promptLength) {
        System.out.println("🤖 [LLM REQUEST]");
        System.out.println("Intent: " + intent);
        System.out.println("Context chunks: " + contextChunks);
        System.out.println("Prompt length: " + promptLength);
        System.out.println("Prompt empty: " + (promptLength <= 0));
    }

    private void logLatencyMetrics(long lexicalMs, long semanticMs, long rankingMs, long totalStartMs) {
        long totalMs = System.currentTimeMillis() - totalStartMs;
        if (System.getProperty("rag.debug") != null || System.getenv("RAG_DEBUG") != null) {
            System.out.println("📊 RAG Latency Metrics -> Lexical: " + lexicalMs + "ms | Semantic: " + semanticMs +
                    "ms | Hybrid Ranking: " + rankingMs + "ms | Total: " + totalMs + "ms");
        }
    }

    private HttpClient createResilientHttpClient() {
        return HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .proxy(ProxySelector.getDefault())
                .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                .build();
    }

    private boolean isGeminiApi() {
        return (apiUrl != null && apiUrl.contains("generativelanguage.googleapis.com")) ||
               (model != null && model.toLowerCase().contains("gemini"));
    }

    private String callLlmWithStrictGrounding(String query, String context, String contextType) {
        if (context == null || context.isBlank()) {
            return null;
        }

        try {
            HttpClient client = createResilientHttpClient();

            String systemPrompt = 
                "You are EventOrbit AI Assistant, a college event management assistant.\n" +
                "STRICT GROUNDING & PRECISION INSTRUCTIONS:\n" +
                "1. Answer ONLY the exact question asked using ONLY facts explicitly provided in the Context below.\n" +
                "2. Context Type: " + contextType + ".\n" +
                "3. If the user asks about a specific entity, department, or office, answer ONLY about that entity.\n" +
                "4. Do NOT mention other entities, departments, or locations unless the user explicitly requested them.\n" +
                "5. Do NOT add related, extra, or 'helpful' information that was not requested.\n" +
                "6. Do NOT infer, speculate, or borrow information from similar entities.\n" +
                "7. Keep simple factual answers concise and direct.\n" +
                "8. If answering registration procedure questions, provide a clear, concise numbered step-by-step guide.\n" +
                "9. If answering event or club queries, present the events clearly with dates, venue, and status.\n" +
                "10. Never expose student USNs in public responses or results.\n" +
                "11. If the answer cannot be directly derived from the Context, respond EXACTLY with:\n" +
                "\"" + GROUNDED_UNAVAILABLE_MESSAGE + "\"\n" +
                "12. Do NOT invent, speculate, or infer information outside the Context.\n\n" +
                "Context:\n" + context + "\n\n" +
                "Question: " + query;

            if (isGeminiApi()) {
                // Google Gemini Native GenerateContent API Format
                String mod = model != null && !model.isBlank() ? model.replace("models/", "") : "gemini-2.0-flash";
                String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + mod + ":generateContent?key=" + apiKey;

                String geminiBody = objectMapper.createObjectNode()
                        .set("contents", objectMapper.createArrayNode()
                                .add(objectMapper.createObjectNode()
                                        .put("role", "user")
                                        .set("parts", objectMapper.createArrayNode()
                                                .add(objectMapper.createObjectNode()
                                                        .put("text", systemPrompt)))))
                        .toString();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(geminiUrl))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofMillis(readTimeoutMs))
                        .POST(HttpRequest.BodyPublishers.ofString(geminiBody))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    JsonNode root = objectMapper.readTree(response.body());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && candidates.size() > 0) {
                        JsonNode parts = candidates.get(0).path("content").path("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            String answer = parts.get(0).path("text").asText().trim();
                            if (!answer.isBlank()) {
                                return answer;
                            }
                        }
                    }
                } else if (response.statusCode() >= 400 && response.statusCode() < 500) {
                    System.err.println("Gemini LLM API [HTTP_" + response.statusCode() + "]: " + response.body());
                } else if (response.statusCode() >= 500) {
                    System.err.println("Gemini LLM Server Error [HTTP_" + response.statusCode() + "]: " + response.body());
                }
            } else {
                // OpenAI / OpenRouter Standard Format
                String requestBody = objectMapper.createObjectNode()
                        .put("model", model)
                        .set("messages", objectMapper.createArrayNode()
                                .add(objectMapper.createObjectNode()
                                        .put("role", "system")
                                        .put("content", systemPrompt)))
                        .toString();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(apiUrl))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("HTTP-Referer", "http://localhost:7070")
                        .header("X-Title", "EventOrbit")
                        .timeout(Duration.ofMillis(readTimeoutMs))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

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
                } else if (response.statusCode() >= 400 && response.statusCode() < 500) {
                    System.err.println("OpenAI LLM API [HTTP_" + response.statusCode() + "]: " + response.body());
                } else if (response.statusCode() >= 500) {
                    System.err.println("OpenAI LLM Server Error [HTTP_" + response.statusCode() + "]: " + response.body());
                }
            }
        } catch (HttpConnectTimeoutException e) {
            System.err.println("LLM Connection Timeout [CONNECT_TIMEOUT]: " + e.getMessage());
        } catch (HttpTimeoutException e) {
            System.err.println("LLM Read Timeout [READ_TIMEOUT]: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("LLM Exception: " + e.getMessage());
        }
        return null;
    }

    private ChatResponse processCompoundQuery(QueryProcessor.ProcessedQuery processed, String authenticatedUsername) {
        StringBuilder combinedReply = new StringBuilder();
        List<SourceMetadata> combinedSources = new ArrayList<>();

        for (QueryProcessor.SubQuery sq : processed.getSubQueries()) {
            if (sq.getSource() == QueryProcessor.DataSource.DATABASE) {
                QueryProcessor.ProcessedQuery subProc = queryProcessor.process(sq.getText());
                QueryProcessor.Intent subIntent = subProc.getIntent();
                String dept = sq.getTargetDepartment() != null ? sq.getTargetDepartment() : subProc.getTargetDepartment();
                if ("MY_DEPARTMENT".equalsIgnoreCase(dept)) {
                    if (authenticatedUsername != null && !authenticatedUsername.isBlank() && !authenticatedUsername.equalsIgnoreCase("anonymousUser")) {
                        dept = UsnDepartmentResolver.resolveDepartment(authenticatedUsername);
                    } else {
                        dept = null;
                    }
                }
                String evt = sq.getTargetEvent() != null ? sq.getTargetEvent() : subProc.getTargetEventName();
                String club = sq.getEntity() != null && sq.getScope() == QueryProcessor.EntityScope.CLUB ? sq.getEntity() : subProc.getTargetClubName();

                DatabaseSqlAgent.QueryResult dbRes = (dept != null)
                        ? databaseSqlAgent.retrieveTargetedContext(
                                subProc.getNormalizedQuery(), authenticatedUsername, subIntent, club, evt, dept)
                        : databaseSqlAgent.retrieveTargetedContext(
                                subProc.getNormalizedQuery(), authenticatedUsername, subIntent, club, evt);
                if (dbRes != null && !dbRes.getContext().isBlank()) {
                    combinedSources.addAll(dbRes.getSources());
                    combinedReply.append(dbRes.getContext().trim()).append("\n\n");
                }
            } else if (sq.getSource() == QueryProcessor.DataSource.KNOWLEDGE_BASE) {
                List<KnowledgeChunker.MatchResult> matches = knowledgeChunker.search(sq.getText(), 3);
                List<KnowledgeChunker.KnowledgeChunk> allChunks = knowledgeChunker.getAllChunks();
                List<String> entities = (sq.getEntity() != null) ? List.of(sq.getEntity()) : Collections.emptyList();
                List<HybridReranker.ScoredChunk> ranked = hybridReranker.rerank(
                        matches, Collections.emptyMap(), allChunks,
                        QueryProcessor.Intent.KNOWLEDGE_DEPARTMENT_LOCATION,
                        sq.getAttribute(), entities, 1);
                if (!ranked.isEmpty()) {
                    combinedSources.add(ranked.get(0).getChunk().getMetadata());
                    combinedReply.append(extractCleanContent(ranked)).append("\n\n");
                }
            }
        }

        if (combinedReply.length() > 0) {
            List<SourceMetadata> uniqueSources = deduplicateSources(combinedSources);
            String fullContext = combinedReply.toString().trim();
            if (hasValidApiKey()) {
                String llmAnswer = callLlmWithStrictGrounding(processed.getOriginalQuery(), fullContext, "COMPOUND_DATA");
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    return new ChatResponse(llmAnswer, uniqueSources);
                }
            }
            return new ChatResponse(fullContext, uniqueSources);
        }

        return new ChatResponse(GROUNDED_UNAVAILABLE_MESSAGE, Collections.emptyList());
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
