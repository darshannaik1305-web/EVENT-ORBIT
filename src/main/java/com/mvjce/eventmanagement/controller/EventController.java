package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.EventRegistration;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    private User getActorUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actorUsername = auth != null ? auth.getName() : null;
        if (actorUsername == null || actorUsername.isBlank()) {
            return null;
        }
        return userRepository.findByUsernameIgnoreCase(actorUsername.trim()).orElse(null);
    }

    private boolean isGlobalAdmin(User user) {
        return user != null && user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN");
    }

    private boolean isClubAdmin(User user) {
        return user != null && user.getRole() != null && user.getRole().equalsIgnoreCase("CLUB_ADMIN");
    }

    private boolean canManageEvent(User actor, Event event) {
        if (isGlobalAdmin(actor)) {
            return true;
        }
        if (isClubAdmin(actor)) {
            return actor.getAdminClubId() != null
                    && event != null
                    && event.getClubId() != null
                    && actor.getAdminClubId().equals(event.getClubId());
        }
        return false;
    }

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
        User actorUser = getActorUser();
        String actor = actorUser != null ? actorUser.getUsername() : "unknown";

        if (actorUser != null && isClubAdmin(actorUser)) {
            if (event.getClubId() == null || actorUser.getAdminClubId() == null || !actorUser.getAdminClubId().equals(event.getClubId())) {
                return ResponseEntity.status(403).<Event>build();
            }
        }

        if (event.getCapacity() != null && event.getCapacity() < 0) {
            return ResponseEntity.badRequest().build();
        }

        event.setCreatedBy(actor);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedBy(actor);
        event.setUpdatedAt(LocalDateTime.now());
        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@NonNull @PathVariable String id, @RequestBody Event event) {
        if (event.getCapacity() != null && event.getCapacity() < 0) {
            return ResponseEntity.badRequest().build();
        }
        return eventRepository.findById(id)
                .map(existingEvent -> {
                    User actorUser = getActorUser();
                    if (!canManageEvent(actorUser, existingEvent)) {
                        return ResponseEntity.status(403).<Event>build();
                    }

                    existingEvent.setName(event.getName());
                    existingEvent.setDescription(event.getDescription());
                    existingEvent.setRegStart(event.getRegStart());
                    existingEvent.setRegEnd(event.getRegEnd());
                    existingEvent.setBgImageUrl(event.getBgImageUrl());
                    existingEvent.setCapacity(event.getCapacity());

                    String actor = actorUser != null ? actorUser.getUsername() : "unknown";
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
                    User actorUser = getActorUser();
                    if (!canManageEvent(actorUser, existingEvent)) {
                        return ResponseEntity.status(403).build();
                    }

                    existingEvent.setRegEnd(newRegEnd);

                    String actor = actorUser != null ? actorUser.getUsername() : "unknown";
                    existingEvent.setUpdatedBy(actor);
                    existingEvent.setUpdatedAt(LocalDateTime.now());

                    eventRepository.save(existingEvent);
                    return ResponseEntity.ok(existingEvent);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@NonNull @PathVariable String id) {
        var existingOpt = eventRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User actorUser = getActorUser();
        if (!canManageEvent(actorUser, existingOpt.get())) {
            return ResponseEntity.status(403).build();
        }

        eventRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@NonNull @PathVariable String id, @RequestBody Map<String, String> registration) {
        return eventRepository.findById(id)
                .map(event -> {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    String actorUsername = auth != null ? auth.getName() : null;
                    if (actorUsername == null || actorUsername.isBlank()) {
                        return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
                    }

                    User user = userRepository.findByUsernameIgnoreCase(actorUsername.trim()).orElse(null);
                    if (user == null) {
                        return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
                    }

                    String username = user.getUsername();
                    String fullName = user.getFullName();
                    String email = user.getEmail();
                    String mobile = user.getMobile();

                    if (username == null || username.isBlank()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "USN is missing for this user"));
                    }
                    if (fullName == null || fullName.isBlank()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Full name is missing for this user"));
                    }
                    if (email == null || email.isBlank()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Email is missing for this user"));
                    }
                    if (mobile == null || !mobile.matches("\\d{10}")) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Mobile number is missing or invalid for this user"));
                    }
                    
                    if (event.getRegistrations() == null) {
                        event.setRegistrations(new java.util.ArrayList<>());
                    }

                    // Check if user is already registered (by username or mobile)
                    boolean alreadyRegistered = event.getRegistrations().stream()
                            .anyMatch(reg -> (reg.getUsername() != null && reg.getUsername().equalsIgnoreCase(username))
                                    || (reg.getMobile() != null && reg.getMobile().equals(mobile)));
                    
                    if (alreadyRegistered) {
                        return ResponseEntity.badRequest().body(Map.of("message", "You are already registered for this event"));
                    }

                    Integer cap = event.getCapacity();
                    if (cap != null && cap > 0) {
                        int currentCount = event.getRegistrations() != null ? event.getRegistrations().size() : 0;
                        if (currentCount >= cap) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Event is full"));
                        }
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
                    event.getRegistrations().add(new EventRegistration(event, username, fullName, email, mobile));
                    eventRepository.save(event);
                    
                    return ResponseEntity.ok(Map.of("message", "Registration successful"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<?> listRegistrations(@NonNull @PathVariable String id) {
        return eventRepository.findById(id)
                .map(event -> {
                    User actorUser = getActorUser();
                    if (!canManageEvent(actorUser, event)) {
                        return ResponseEntity.status(403).build();
                    }
                    return ResponseEntity.ok(event.getRegistrations() == null ? List.of() : event.getRegistrations());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{eventId}/registrations/{registrationId}")
    public ResponseEntity<?> removeRegistration(@NonNull @PathVariable String eventId, @NonNull @PathVariable String registrationId) {
        return eventRepository.findById(eventId)
                .map(event -> {
                    User actorUser = getActorUser();
                    if (!canManageEvent(actorUser, event)) {
                        return ResponseEntity.status(403).build();
                    }

                    if (event.getRegistrations() == null || event.getRegistrations().isEmpty()) {
                        return ResponseEntity.notFound().build();
                    }

                    boolean removed = event.getRegistrations().removeIf(r -> registrationId.equals(r.getId()));
                    if (!removed) {
                        return ResponseEntity.notFound().build();
                    }

                    eventRepository.save(event);
                    return ResponseEntity.ok(Map.of("message", "Participant removed"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
