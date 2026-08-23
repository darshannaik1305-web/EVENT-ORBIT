package com.mvjce.eventmanagement;

import com.mvjce.eventmanagement.rag.KnowledgeChunker;
import com.mvjce.eventmanagement.rag.SemanticEmbeddingEngine;
import com.mvjce.eventmanagement.rag.SemanticVectorIndex;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SemanticEmbeddingEngineTest {

    private SemanticEmbeddingEngine embeddingEngine;
    private SemanticVectorIndex vectorIndex;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        embeddingEngine = new SemanticEmbeddingEngine();
        vectorIndex = new SemanticVectorIndex();
        ReflectionTestUtils.setField(vectorIndex, "cacheDir", tempDir.toString());
        ReflectionTestUtils.setField(vectorIndex, "embeddingEngine", embeddingEngine);
    }

    @Test
    @DisplayName("1. Verify missing API key sets UNCONFIGURED status without throwing exceptions")
    void testMissingApiKeyStatus() {
        ReflectionTestUtils.setField(embeddingEngine, "apiKey", "");
        embeddingEngine.init();
        assertEquals(SemanticEmbeddingEngine.EngineStatus.UNCONFIGURED, embeddingEngine.getStatus());
        assertNull(embeddingEngine.embedText("Sample text"));
    }

    @Test
    @DisplayName("2. Verify unsupported / invalid model sets INCOMPATIBLE_MODEL or API_ERROR status gracefully")
    void testUnsupportedModel() {
        ReflectionTestUtils.setField(embeddingEngine, "apiKey", "dummy-key");
        ReflectionTestUtils.setField(embeddingEngine, "provider", "gemini");
        ReflectionTestUtils.setField(embeddingEngine, "model", "models/non-existent-embedding-model-xyz");
        ReflectionTestUtils.setField(embeddingEngine, "apiUrl", "https://generativelanguage.googleapis.com/v1beta");
        
        boolean ok = embeddingEngine.verifyModelCompatibility();
        assertFalse(ok);
        assertNotEquals(SemanticEmbeddingEngine.EngineStatus.VERIFIED, embeddingEngine.getStatus());
        assertNotNull(embeddingEngine.getCompatibilityErrorMessage());
    }

    @Test
    @DisplayName("3. Verify Cosine Similarity computation correctness")
    void testCosineSimilarityMath() {
        // Identical orthogonal vectors
        float[] v1 = new float[]{1.0f, 0.0f, 0.0f};
        float[] v2 = new float[]{1.0f, 0.0f, 0.0f};
        assertEquals(1.0, embeddingEngine.cosineSimilarity(v1, v2), 0.0001);

        // Orthogonal vectors (similarity = 0.0)
        float[] v3 = new float[]{0.0f, 1.0f, 0.0f};
        assertEquals(0.0, embeddingEngine.cosineSimilarity(v1, v3), 0.0001);

        // Opposite vectors (similarity = -1.0)
        float[] v4 = new float[]{-1.0f, 0.0f, 0.0f};
        assertEquals(-1.0, embeddingEngine.cosineSimilarity(v1, v4), 0.0001);

        // Null / empty handling
        assertEquals(0.0, embeddingEngine.cosineSimilarity(null, v1));
        assertEquals(0.0, embeddingEngine.cosineSimilarity(v1, new float[]{}));
    }

    @Test
    @DisplayName("4. Verify vector cache invalidation when model or provider changes")
    void testVectorCacheInvalidationOnModelChange() {
        ReflectionTestUtils.setField(embeddingEngine, "provider", "gemini");
        ReflectionTestUtils.setField(embeddingEngine, "model", "models/embedding-001");

        KnowledgeChunker.KnowledgeChunk chunk = new KnowledgeChunker.KnowledgeChunk("KNOW-1", "Rules", "College rules content", KnowledgeChunker.ChunkCategory.RULES);
        chunk.setVector(new float[]{0.1f, 0.2f, 0.3f});

        // Index and save chunk
        vectorIndex.indexChunks(List.of(chunk));

        File cacheFile = tempDir.resolve("knowledge_embeddings.json").toFile();

        // Now simulate changing the embedding model to openrouter / text-embedding-3-small
        ReflectionTestUtils.setField(embeddingEngine, "provider", "openrouter");
        ReflectionTestUtils.setField(embeddingEngine, "model", "text-embedding-3-small");

        // Reload from disk should detect mismatch and clear outdated vectors
        KnowledgeChunker.KnowledgeChunk newChunk = new KnowledgeChunker.KnowledgeChunk("KNOW-1", "Rules", "College rules content", KnowledgeChunker.ChunkCategory.RULES);
        vectorIndex.indexChunks(List.of(newChunk));

        // Incompatible cached vector was not reused
        assertNull(newChunk.getVector());
    }

    @Test
    @DisplayName("5. Verify SHA-256 content hashing detects modified content")
    void testSha256ContentHash() {
        String hash1 = vectorIndex.computeSha256("Registration Process 1. Login");
        String hash2 = vectorIndex.computeSha256("Registration Process 1. Login");
        String hash3 = vectorIndex.computeSha256("Registration Process 2. Register");

        assertEquals(hash1, hash2);
        assertNotEquals(hash1, hash3);
    }
}
