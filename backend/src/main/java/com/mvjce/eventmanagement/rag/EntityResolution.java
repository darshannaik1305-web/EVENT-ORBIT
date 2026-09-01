package com.mvjce.eventmanagement.rag;

import java.util.Objects;

/**
 * Canonical EntityResolution value object for the EventOrbit Hybrid-RAG architecture.
 * Decouples entity identity, entity type, and resolution certainty from query intent and requested attributes.
 */
public class EntityResolution {

    public enum EntityType {
        DEPARTMENT,
        EVENT,
        CLUB,
        CAMPUS_FACILITY,
        SCHOLARSHIP,
        STUDENT,
        GLOBAL
    }

    private final EntityType type;
    private final String canonicalName;
    private final String identifier;
    private final boolean deterministic;
    private final double confidence;

    public EntityResolution(EntityType type, String canonicalName, String identifier, boolean deterministic, double confidence) {
        this.type = type != null ? type : EntityType.GLOBAL;
        this.canonicalName = canonicalName != null ? canonicalName.trim() : "";
        this.identifier = identifier != null ? identifier.trim() : null;
        this.deterministic = deterministic;
        this.confidence = confidence;
    }

    public EntityResolution(EntityType type, String canonicalName) {
        this(type, canonicalName, null, true, 1.0);
    }

    public EntityType getType() {
        return type;
    }

    public String getCanonicalName() {
        return canonicalName;
    }

    public String getIdentifier() {
        return identifier;
    }

    public boolean isDeterministic() {
        return deterministic;
    }

    public double getConfidence() {
        return confidence;
    }

    public boolean isEmpty() {
        return canonicalName.isEmpty() || type == EntityType.GLOBAL;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EntityResolution that = (EntityResolution) o;
        return deterministic == that.deterministic &&
                Double.compare(that.confidence, confidence) == 0 &&
                type == that.type &&
                Objects.equals(canonicalName, that.canonicalName) &&
                Objects.equals(identifier, that.identifier);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, canonicalName, identifier, deterministic, confidence);
    }

    @Override
    public String toString() {
        return "EntityResolution{" +
                "type=" + type +
                ", canonicalName='" + canonicalName + '\'' +
                ", identifier='" + identifier + '\'' +
                ", deterministic=" + deterministic +
                ", confidence=" + confidence +
                '}';
    }
}
