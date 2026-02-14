package com.mvjce.eventmanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "events")
public class Event {
    @Id
    private String id;
    private String name;
    private String description;
    private String clubId;
    private LocalDateTime regStart;
    private LocalDateTime regEnd;
    private String bgImageUrl;
    private List<EventRegistration> registrations = new ArrayList<>();

    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;

    // Constructors
    public Event() {}

    public Event(String name, String description, String clubId, LocalDateTime regStart, LocalDateTime regEnd, String bgImageUrl) {
        this.name = name;
        this.description = description;
        this.clubId = clubId;
        this.regStart = regStart;
        this.regEnd = regEnd;
        this.bgImageUrl = bgImageUrl;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClubId() {
        return clubId;
    }

    public void setClubId(String clubId) {
        this.clubId = clubId;
    }

    public LocalDateTime getRegStart() {
        return regStart;
    }

    public void setRegStart(LocalDateTime regStart) {
        this.regStart = regStart;
    }

    public LocalDateTime getRegEnd() {
        return regEnd;
    }

    public void setRegEnd(LocalDateTime regEnd) {
        this.regEnd = regEnd;
    }

    public String getBgImageUrl() {
        return bgImageUrl;
    }

    public void setBgImageUrl(String bgImageUrl) {
        this.bgImageUrl = bgImageUrl;
    }

    public List<EventRegistration> getRegistrations() {
        return registrations;
    }

    public void setRegistrations(List<EventRegistration> registrations) {
        this.registrations = registrations;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Inner class for event registrations
    public static class EventRegistration {
        private String username;
        private String mobile;
        private LocalDateTime registrationTime;

        public EventRegistration() {}

        public EventRegistration(String username, String mobile) {
            this.username = username;
            this.mobile = mobile;
            this.registrationTime = LocalDateTime.now();
        }

        // Getters and Setters
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getMobile() {
            return mobile;
        }

        public void setMobile(String mobile) {
            this.mobile = mobile;
        }

        public LocalDateTime getRegistrationTime() {
            return registrationTime;
        }

        public void setRegistrationTime(LocalDateTime registrationTime) {
            this.registrationTime = registrationTime;
        }
    }
}
