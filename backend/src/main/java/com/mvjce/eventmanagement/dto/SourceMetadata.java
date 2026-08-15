package com.mvjce.eventmanagement.dto;

public class SourceMetadata {
    private String type; // "EVENT", "CLUB", "WINNER", "KNOWLEDGE"
    private String id;
    private String title;

    public SourceMetadata() {}

    public SourceMetadata(String type, String id, String title) {
        this.type = type;
        this.id = id;
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
