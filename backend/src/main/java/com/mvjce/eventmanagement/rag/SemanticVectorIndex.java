package com.mvjce.eventmanagement.rag;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SemanticVectorIndex {

    public static class CachedChunkData {
        private final String chunkId;
        private final String contentHash;
        private final float[] vector;

        public CachedChunkData(String chunkId, String contentHash, float[] vector) {
            this.chunkId = chunkId;
            this.contentHash = contentHash;
            this.vector = vector;
        }

        public String getChunkId() { return chunkId; }
        public String getContentHash() { return contentHash; }
        public float[] getVector() { return vector; }
    }

    @Value("${rag.vector.cache.dir:data/vector-cache}")
    private String cacheDir;

    @Autowired
    private SemanticEmbeddingEngine embeddingEngine;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, CachedChunkData> index = new ConcurrentHashMap<>();

    public String computeSha256(String text) {
        if (text == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return String.valueOf(text.hashCode());
        }
    }

    /**
     * Synchronizes chunk vectors with cache and embedding engine.
     */
    public synchronized void indexChunks(List<KnowledgeChunker.KnowledgeChunk> chunks) {
        if (chunks == null || chunks.isEmpty()) return;

        // 1. Try loading persistent cache from disk
        loadFromDisk();

        // 2. Determine if model/provider is verified
        boolean canEmbed = (embeddingEngine.getStatus() == SemanticEmbeddingEngine.EngineStatus.VERIFIED);

        boolean updated = false;
        Set<String> currentChunkIds = new HashSet<>();

        for (KnowledgeChunker.KnowledgeChunk chunk : chunks) {
            currentChunkIds.add(chunk.getId());
            String text = chunk.getTitle() + "\n" + chunk.getContent();
            String hash = computeSha256(text);

            CachedChunkData cached = index.get(chunk.getId());
            if (cached != null && hash.equals(cached.getContentHash()) && cached.getVector() != null) {
                // Chunk is up-to-date in cache
                chunk.setVector(cached.getVector());
                continue;
            }

            // Generate new embedding if API is active
            if (canEmbed) {
                float[] vector = embeddingEngine.embedText(text);
                if (vector != null) {
                    CachedChunkData newData = new CachedChunkData(chunk.getId(), hash, vector);
                    index.put(chunk.getId(), newData);
                    chunk.setVector(vector);
                    updated = true;
                }
            }
        }

        // Clean up removed chunk IDs
        index.keySet().removeIf(id -> !currentChunkIds.contains(id));

        // 3. Save to disk if updated
        if (updated) {
            saveToDisk();
        }
    }

    public float[] getVector(String chunkId) {
        CachedChunkData data = index.get(chunkId);
        return data != null ? data.getVector() : null;
    }

    private synchronized void loadFromDisk() {
        try {
            Path cachePath = Paths.get(cacheDir, "knowledge_embeddings.json");
            File file = cachePath.toFile();
            if (!file.exists()) {
                return;
            }

            String json = Files.readString(cachePath, StandardCharsets.UTF_8);
            JsonNode root = objectMapper.readTree(json);

            // Verify cache metadata: provider, model, dimension
            String cachedProvider = root.path("provider").asText("");
            String cachedModel = root.path("model").asText("");

            if (!cachedModel.equals(embeddingEngine.getModel()) || !cachedProvider.equals(embeddingEngine.getProvider())) {
                System.out.println("🔄 SemanticVectorIndex: Embedding model or provider changed. Invalidating outdated vector cache.");
                index.clear();
                return;
            }

            JsonNode chunksNode = root.path("chunks");
            if (chunksNode.isArray()) {
                for (JsonNode item : chunksNode) {
                    String id = item.path("chunkId").asText();
                    String hash = item.path("contentHash").asText();
                    JsonNode vecArray = item.path("vector");
                    if (!id.isBlank() && vecArray.isArray() && vecArray.size() > 0) {
                        float[] vector = new float[vecArray.size()];
                        for (int i = 0; i < vecArray.size(); i++) {
                            vector[i] = (float) vecArray.get(i).asDouble();
                        }
                        index.put(id, new CachedChunkData(id, hash, vector));
                    }
                }
                System.out.println("💾 SemanticVectorIndex: Loaded " + index.size() + " cached embedding vectors from " + cachePath);
            }
        } catch (Exception e) {
            System.err.println("⚠️ SemanticVectorIndex: Error reading vector cache: " + e.getMessage());
        }
    }

    private synchronized void saveToDisk() {
        try {
            Path dirPath = Paths.get(cacheDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            Path cachePath = dirPath.resolve("knowledge_embeddings.json");

            ObjectNode root = objectMapper.createObjectNode();
            root.put("provider", embeddingEngine.getProvider());
            root.put("model", embeddingEngine.getModel());
            root.put("vectorDimension", embeddingEngine.getVectorDimension());
            root.put("lastSaved", System.currentTimeMillis());

            ArrayNode chunksArray = root.putArray("chunks");
            for (CachedChunkData chunkData : index.values()) {
                if (chunkData.getVector() == null) continue;
                ObjectNode item = objectMapper.createObjectNode();
                item.put("chunkId", chunkData.getChunkId());
                item.put("contentHash", chunkData.getContentHash());
                ArrayNode vecNode = item.putArray("vector");
                for (float v : chunkData.getVector()) {
                    vecNode.add(v);
                }
                chunksArray.add(item);
            }

            Files.writeString(cachePath, objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root), StandardCharsets.UTF_8);
            System.out.println("💾 SemanticVectorIndex: Successfully persisted " + index.size() + " embedding vectors to " + cachePath);
        } catch (Exception e) {
            System.err.println("⚠️ SemanticVectorIndex: Failed to save vector cache: " + e.getMessage());
        }
    }

    public int getIndexedCount() {
        return index.size();
    }
}
