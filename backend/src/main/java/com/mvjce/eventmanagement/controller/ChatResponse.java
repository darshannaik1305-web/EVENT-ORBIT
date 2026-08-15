package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.dto.SourceMetadata;
import java.util.ArrayList;
import java.util.List;

public class ChatResponse {
    private String reply;
    private List<SourceMetadata> sources = new ArrayList<>();

    public ChatResponse() {}

    public ChatResponse(String reply) {
        this.reply = reply;
        this.sources = new ArrayList<>();
    }

    public ChatResponse(String reply, List<SourceMetadata> sources) {
        this.reply = reply;
        this.sources = (sources != null) ? sources : new ArrayList<>();
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    // Alias for backward compatibility
    public String getResponse() {
        return reply;
    }

    public void setResponse(String response) {
        this.reply = response;
    }

    public List<SourceMetadata> getSources() {
        return sources;
    }

    public void setSources(List<SourceMetadata> sources) {
        this.sources = sources;
    }
}
