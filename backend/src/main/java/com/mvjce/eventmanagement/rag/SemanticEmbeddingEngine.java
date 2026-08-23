package com.mvjce.eventmanagement.rag;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Component
public class SemanticEmbeddingEngine {

    public enum EngineStatus {
        UNCONFIGURED,
        VERIFIED,
        INCOMPATIBLE_MODEL,
        API_ERROR
    }

    @Value("${embedding.provider:gemini}")
    private String provider;

    @Value("${embedding.model:text-embedding-004}")
    private String model;

    @Value("${embedding.api.url:https://generativelanguage.googleapis.com/v1beta}")
    private String apiUrl;

    @Value("${embedding.api.key:${openai.api.key:}}")
    private String apiKey;

    @Value("${embedding.connect.timeout.ms:5000}")
    private int connectTimeoutMs;

    @Value("${embedding.read.timeout.ms:10000}")
    private int readTimeoutMs;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private EngineStatus status = EngineStatus.UNCONFIGURED;
    private String compatibilityErrorMessage = null;
    private int vectorDimension = -1;
    private String discoveredGeminiModel = null;

    public String getProvider() { return provider; }
    public String getModel() { return model; }
    public String getApiUrl() { return apiUrl; }
    public EngineStatus getStatus() { return status; }
    public String getCompatibilityErrorMessage() { return compatibilityErrorMessage; }
    public int getVectorDimension() { return vectorDimension; }

    public void setProvider(String provider) { this.provider = provider; }
    public void setModel(String model) { this.model = model; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_OPENAI_API_KEY") && !apiKey.equalsIgnoreCase("YOUR_API_KEY")) {
            boolean ok = verifyModelCompatibility();
            if (ok) {
                System.out.println("🚀 [SEMANTIC EMBEDDINGS ACTIVE] Provider: " + provider + " | Model: " + model + " (Dimension: " + vectorDimension + ")");
            } else {
                System.out.println("⚠️ [SEMANTIC EMBEDDINGS UNAVAILABLE — USING LEXICAL FALLBACK]\nReason: " + compatibilityErrorMessage);
            }
        } else {
            status = EngineStatus.UNCONFIGURED;
            System.out.println("ℹ️ [SEMANTIC EMBEDDINGS UNAVAILABLE — USING LEXICAL FALLBACK]\nReason: No API key configured.");
        }
    }

    private boolean isGeminiProvider() {
        return (provider != null && provider.equalsIgnoreCase("gemini")) ||
               (apiUrl != null && apiUrl.contains("generativelanguage.googleapis.com"));
    }

    public synchronized boolean verifyModelCompatibility() {
        if (apiKey == null || apiKey.isBlank() || apiKey.equalsIgnoreCase("YOUR_OPENAI_API_KEY") || apiKey.equalsIgnoreCase("YOUR_API_KEY")) {
            status = EngineStatus.UNCONFIGURED;
            compatibilityErrorMessage = "No API key configured.";
            return false;
        }

        try {
            if (isGeminiProvider()) {
                discoverAvailableGeminiEmbeddingModel();
            }

            float[] probeVec = embedText("EventOrbit Verification Probe");
            if (probeVec != null && probeVec.length > 0) {
                this.vectorDimension = probeVec.length;
                this.status = EngineStatus.VERIFIED;
                this.compatibilityErrorMessage = null;
                return true;
            }

            if (this.status == EngineStatus.UNCONFIGURED || this.status == EngineStatus.VERIFIED) {
                this.status = EngineStatus.API_ERROR;
            }
            return false;
        } catch (Exception e) {
            this.status = EngineStatus.API_ERROR;
            this.compatibilityErrorMessage = "Exception during verification: " + e.getMessage();
            return false;
        }
    }

    private void discoverAvailableGeminiEmbeddingModel() {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                    .build();

            String listUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(listUrl))
                    .timeout(Duration.ofMillis(readTimeoutMs))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode modelsNode = root.path("models");
                if (modelsNode.isArray()) {
                    for (JsonNode mNode : modelsNode) {
                        String name = mNode.path("name").asText(""); // e.g. "models/text-embedding-004"
                        JsonNode methods = mNode.path("supportedGenerationMethods");
                        if (methods.isArray()) {
                            for (JsonNode meth : methods) {
                                if (meth.asText().equalsIgnoreCase("embedContent")) {
                                    this.discoveredGeminiModel = name;
                                    this.model = name.replace("models/", "");
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    public float[] embedText(String text) {
        if (text == null || text.isBlank() || apiKey == null || apiKey.isBlank()) {
            return null;
        }

        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                    .build();

            if (isGeminiProvider()) {
                return executeGeminiEmbedding(client, text.trim());
            } else {
                return executeOpenAiStandardEmbedding(client, text.trim());
            }
        } catch (Exception e) {
            this.status = EngineStatus.API_ERROR;
            this.compatibilityErrorMessage = "Embedding request error: " + e.getMessage();
        }
        return null;
    }

    private float[] executeGeminiEmbedding(HttpClient client, String text) {
        try {
            List<String> modelsToTry = new ArrayList<>();
            if (discoveredGeminiModel != null) {
                modelsToTry.add(discoveredGeminiModel);
            }
            String baseModel = model != null && !model.isBlank() ? model : "text-embedding-004";
            if (!baseModel.startsWith("models/")) {
                modelsToTry.add("models/" + baseModel);
            } else {
                modelsToTry.add(baseModel);
            }
            modelsToTry.add("models/text-embedding-004");
            modelsToTry.add("models/embedding-001");

            for (String mod : modelsToTry) {
                String targetUrl = "https://generativelanguage.googleapis.com/v1beta/" + mod + ":embedContent?key=" + apiKey;

                String requestBody = objectMapper.createObjectNode()
                        .put("model", mod)
                        .set("content", objectMapper.createObjectNode()
                                .set("parts", objectMapper.createArrayNode()
                                        .add(objectMapper.createObjectNode()
                                                .put("text", text))))
                        .toString();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(targetUrl))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofMillis(readTimeoutMs))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    JsonNode root = objectMapper.readTree(response.body());
                    JsonNode valuesNode = root.path("embedding").path("values");
                    if (valuesNode.isArray() && valuesNode.size() > 0) {
                        float[] vector = new float[valuesNode.size()];
                        for (int i = 0; i < valuesNode.size(); i++) {
                            vector[i] = (float) valuesNode.get(i).asDouble();
                        }
                        this.discoveredGeminiModel = mod;
                        this.model = mod.replace("models/", "");
                        return vector;
                    }
                } else {
                    this.compatibilityErrorMessage = "HTTP " + response.statusCode() + " for [" + mod + "]: " + response.body();
                }
            }
            this.status = EngineStatus.INCOMPATIBLE_MODEL;

        } catch (Exception e) {
            this.status = EngineStatus.API_ERROR;
            this.compatibilityErrorMessage = "Gemini embedding error: " + e.getMessage();
        }
        return null;
    }

    private float[] executeOpenAiStandardEmbedding(HttpClient client, String text) {
        try {
            String targetUrl = (apiUrl != null && !apiUrl.isBlank()) ? apiUrl : "https://openrouter.ai/api/v1/embeddings";

            String requestBody = objectMapper.createObjectNode()
                    .put("model", model)
                    .put("input", text)
                    .toString();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
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
                JsonNode dataNode = root.path("data");
                if (dataNode.isArray() && dataNode.size() > 0) {
                    JsonNode emb = dataNode.get(0).path("embedding");
                    if (emb.isArray()) {
                        float[] vector = new float[emb.size()];
                        for (int i = 0; i < emb.size(); i++) {
                            vector[i] = (float) emb.get(i).asDouble();
                        }
                        return vector;
                    }
                }
            }

            this.status = (response.statusCode() == 400 || response.statusCode() == 404 || response.statusCode() == 422)
                    ? EngineStatus.INCOMPATIBLE_MODEL : EngineStatus.API_ERROR;
            this.compatibilityErrorMessage = "HTTP " + response.statusCode() + " from " + targetUrl + ": " + response.body();

        } catch (Exception e) {
            this.status = EngineStatus.API_ERROR;
            this.compatibilityErrorMessage = "OpenAI standard embedding error: " + e.getMessage();
        }
        return null;
    }

    public double cosineSimilarity(float[] v1, float[] v2) {
        if (v1 == null || v2 == null || v1.length == 0 || v1.length != v2.length) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            normA += v1[i] * v1[i];
            normB += v2[i] * v2[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(-1.0, Math.min(1.0, similarity));
    }
}
