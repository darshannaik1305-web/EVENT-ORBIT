package com.mvjce.eventmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mvjce.eventmanagement.controller.ChatResponse;
import com.mvjce.eventmanagement.dto.SourceMetadata;
import com.mvjce.eventmanagement.rag.DatabaseSqlAgent;
import com.mvjce.eventmanagement.rag.KnowledgeChunker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class ChatService {

    public static final String GROUNDED_UNAVAILABLE_MESSAGE = 
        "I don't have that specific information in my records right now. Please contact the department or check official notices.";

    @Autowired
    private DatabaseSqlAgent databaseSqlAgent;

    @Autowired
    private KnowledgeChunker knowledgeChunker;

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:google/gemini-2.0-flash-lite-preview-02-05:free}")
    private String model;

    @Value("${openai.connect.timeout.ms:5000}")
    private int connectTimeoutMs;

    @Value("${openai.read.timeout.ms:10000}")
    private int readTimeoutMs;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatResponse processQuery(String rawQuery, String authenticatedUsername) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return new ChatResponse(GROUNDED_UNAVAILABLE_MESSAGE, Collections.emptyList());
        }

        String query = rawQuery.trim();
        String lowerQuery = query.toLowerCase();

        // 0. Greeting Handler
        if (lowerQuery.matches("^(hi|hello|hey|hola|greetings|good morning|good afternoon|good evening|help|sup)$")) {
            return new ChatResponse(
                "Hello! 👋 I am your EventOrbit Smart Assistant. How can I help you today? You can ask me about upcoming events, club registrations, winner results, or scholarship guidelines!",
                Collections.emptyList()
            );
        }

        // 1. Retrieve Targeted Relational Context via Parameterized JPA Queries
        DatabaseSqlAgent.QueryResult dbResult = databaseSqlAgent.retrieveTargetedContext(query, authenticatedUsername);

        // 2. Retrieve Verified Document Knowledge Chunks ONLY if DB didn't handle it or if query is general
        List<KnowledgeChunker.MatchResult> docMatches = Collections.emptyList();
        if (dbResult.getContext().isBlank()) {
            docMatches = knowledgeChunker.search(query, 2);
        }

        // 3. Assemble Consolidated Context and Sources
        List<SourceMetadata> sourcesList = new ArrayList<>(dbResult.getSources());
        StringBuilder combinedContext = new StringBuilder();

        if (!dbResult.getContext().isBlank()) {
            combinedContext.append("=== EventOrbit Database Records ===\n")
                    .append(dbResult.getContext())
                    .append("\n\n");
        }

        if (!docMatches.isEmpty()) {
            combinedContext.append("=== Official College Knowledge Base ===\n");
            for (KnowledgeChunker.MatchResult match : docMatches) {
                sourcesList.add(match.getChunk().getMetadata());
                combinedContext.append("Title: ").append(match.getChunk().getTitle()).append("\n")
                        .append(match.getChunk().getContent()).append("\n\n");
            }
        }

        String contextText = combinedContext.toString().trim();
        List<SourceMetadata> uniqueSources = deduplicateSources(sourcesList);

        // If no context was found at all in DB or knowledge base, return standard anti-hallucination response
        if (contextText.isBlank()) {
            return new ChatResponse(GROUNDED_UNAVAILABLE_MESSAGE, Collections.emptyList());
        }

        // 4. Attempt Configured LLM API Execution (OpenRouter / Gemini API)
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_OPENAI_API_KEY")) {
            String llmAnswer = callLlmWithStrictGrounding(query, contextText);
            if (llmAnswer != null && !llmAnswer.isBlank()) {
                return new ChatResponse(llmAnswer, uniqueSources);
            }
        }

        // 5. Fallback Engine: Return clean deterministic context response
        String fallbackAnswer = formatDeterministicFallback(dbResult.getContext(), docMatches);
        return new ChatResponse(fallbackAnswer, uniqueSources);
    }

    private String callLlmWithStrictGrounding(String query, String context) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                    .build();

            String systemPrompt = 
                "You are EventOrbit AI Assistant, a college event management assistant. " +
                "STRICT GROUNDING INSTRUCTIONS:\n" +
                "1. Answer ONLY using the facts provided in the Context below.\n" +
                "2. If the answer cannot be directly derived from the Context, respond EXACTLY with:\n" +
                "\"" + GROUNDED_UNAVAILABLE_MESSAGE + "\"\n" +
                "3. Do NOT invent, speculate, or infer information outside the Context.\n" +
                "4. Format the answer cleanly with clear headings and bullet points where helpful.\n\n" +
                "Context:\n" + context + "\n\n" +
                "Question: " + query;

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
            } else {
                System.err.println("LLM API Error Code " + response.statusCode() + ": " + response.body());
            }
        } catch (Exception e) {
            System.err.println("LLM Exception / Timeout: " + e.getMessage());
        }
        return null;
    }

    private String formatDeterministicFallback(String dbContext, List<KnowledgeChunker.MatchResult> docMatches) {
        if (dbContext != null && !dbContext.isBlank()) {
            return dbContext;
        }
        if (docMatches != null && !docMatches.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (KnowledgeChunker.MatchResult match : docMatches) {
                sb.append("📌 ").append(match.getChunk().getTitle()).append("\n\n")
                  .append(match.getChunk().getContent()).append("\n\n");
            }
            return sb.toString().trim();
        }
        return GROUNDED_UNAVAILABLE_MESSAGE;
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
