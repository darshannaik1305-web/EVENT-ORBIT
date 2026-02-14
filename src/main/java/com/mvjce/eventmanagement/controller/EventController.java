package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        events.sort(Comparator.comparing(Event::getRegStart, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<Event>> getEventsByClub(@NonNull @PathVariable String clubId) {
        List<Event> events = eventRepository.findByClubIdOrderByRegStartDesc(clubId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@NonNull @PathVariable String id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actor = auth != null ? auth.getName() : "unknown";
        event.setCreatedBy(actor);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedBy(actor);
        event.setUpdatedAt(LocalDateTime.now());
        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@NonNull @PathVariable String id, @RequestBody Event event) {
        return eventRepository.findById(id)
                .map(existingEvent -> {
                    existingEvent.setName(event.getName());
                    existingEvent.setDescription(event.getDescription());
                    existingEvent.setRegStart(event.getRegStart());
                    existingEvent.setRegEnd(event.getRegEnd());
                    existingEvent.setBgImageUrl(event.getBgImageUrl());

                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    String actor = auth != null ? auth.getName() : "unknown";
                    existingEvent.setUpdatedBy(actor);
                    existingEvent.setUpdatedAt(LocalDateTime.now());

                    return ResponseEntity.ok(eventRepository.save(existingEvent));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/extend-reg-end")
    public ResponseEntity<?> extendRegistrationEnd(@NonNull @PathVariable String id, @RequestBody Map<String, String> payload) {
        String regEndStr = payload.get("regEnd");
        if (regEndStr == null || regEndStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "regEnd is required"));
        }

        LocalDateTime newRegEnd;
        try {
            newRegEnd = LocalDateTime.parse(regEndStr);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "regEnd must be ISO-8601 format like 2026-02-08T18:30:00"));
        }

        return eventRepository.findById(id)
                .map(existingEvent -> {
                    existingEvent.setRegEnd(newRegEnd);

                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    String actor = auth != null ? auth.getName() : "unknown";
                    existingEvent.setUpdatedBy(actor);
                    existingEvent.setUpdatedAt(LocalDateTime.now());

                    eventRepository.save(existingEvent);
                    return ResponseEntity.ok(existingEvent);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@NonNull @PathVariable String id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@NonNull @PathVariable String id, @RequestBody Map<String, String> registration) {
        return eventRepository.findById(id)
                .map(event -> {
                    String username = registration.get("username");
                    String mobile = registration.get("mobile");
                    
                    // Validate mobile number (must be exactly 10 digits)
                    if (mobile == null || !mobile.matches("\\d{10}")) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid 10-digit mobile number"));
                    }
                    
                    // Check if user is already registered (by mobile number only)
                    boolean alreadyRegistered = event.getRegistrations().stream()
                            .anyMatch(reg -> reg.getMobile().equals(mobile));
                    
                    if (alreadyRegistered) {
                        return ResponseEntity.badRequest().body(Map.of("message", "This mobile number is already registered for this event"));
                    }
                    
                    // Check registration period
                    LocalDateTime now = LocalDateTime.now();
                    if (now.isBefore(event.getRegStart())) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Registration has not started yet"));
                    }
                    if (now.isAfter(event.getRegEnd())) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Registration has ended"));
                    }
                    
                    // Add registration
                    event.getRegistrations().add(new Event.EventRegistration(username, mobile));
                    eventRepository.save(event);
                    
                    return ResponseEntity.ok(Map.of("message", "Registration successful"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
