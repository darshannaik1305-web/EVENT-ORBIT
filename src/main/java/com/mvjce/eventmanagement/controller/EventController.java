package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.ClubAdmin;
import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.EventRegistration;
import com.mvjce.eventmanagement.model.EventType;
import com.mvjce.eventmanagement.model.Team;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.ClubAdminRepository;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.TeamRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
import com.mvjce.eventmanagement.repository.WinnerRepository;
import com.mvjce.eventmanagement.service.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private WinnerRepository winnerRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private ClubAdminRepository clubAdminRepository;

    private User getActorUser() {
        // First try to get user from Spring Security context (for regular users)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actorUsername = auth != null ? auth.getName() : null;
        if (actorUsername != null && !actorUsername.isBlank() && !actorUsername.equals("anonymousUser")) {
            return userRepository.findByUsernameIgnoreCase(actorUsername.trim()).orElse(null);
        }
        
        // If no Spring Security context, try to get from Authorization header
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String authHeader = request.getHeader("Authorization");
                return getActorUserFromToken(authHeader);
            }
        } catch (Exception e) {
            // Ignore and return null
        }
        return null;
    }

    private User getActorUserFromToken(@RequestHeader(value = "Authorization", required = false) String authorization) {
        System.out.println("DEBUG: Authorization header: " + (authorization != null ? authorization.substring(0, Math.min(20, authorization.length())) + "..." : "null"));
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            try {
                // Extract username from token
                String username = jwtService.extractUsername(token);
                System.out.println("DEBUG: Extracted username from token: " + username);
                if (username != null && !username.isBlank()) {
                    User user = userRepository.findByUsernameIgnoreCase(username).orElse(null);
                    System.out.println("DEBUG: Found user: " + (user != null ? user.getUsername() : "null"));
                    return user;
                }
            } catch (Exception e) {
                // Token validation failed
                System.out.println("DEBUG: Token validation failed: " + e.getMessage());
                e.printStackTrace();
                return null;
            }
        }
        return null;
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
            // Check if user is admin for this specific club using ClubAdmin entries
            if (event == null || event.getClubId() == null) {
                return false;
            }
            List<ClubAdmin> clubAdmins = clubAdminRepository.findByUsernameIgnoreCaseAndEnabledTrue(actor.getUsername());
            return clubAdmins.stream().anyMatch(ca -> ca.getClubId().equals(event.getClubId()));
        }
        return false;
    }


    private boolean isEventFull(Event event) {
        int count = 0;
        if (EventType.GROUP.equals(event.getType())) {
            List<Team> teams = teamRepository.findByEventId(event.getId());
            count = teams != null ? teams.size() : 0;
        } else {
            count = event.getRegistrations() != null ? event.getRegistrations().size() : 0;
        }
        event.setParticipantCount(count);

        if (event.getCapacity() == null || event.getCapacity() <= 0) {
            return false; // Unlimited capacity
        }
        return count >= event.getCapacity();
    }

    private boolean isEventExpiredOrFull(Event event, LocalDateTime now) {
        // Check if registration deadline passed
        boolean deadlineExpired = event.getRegEnd() != null && now.isAfter(event.getRegEnd());
        // Check if capacity is full
        boolean capacityFull = isEventFull(event);
        return deadlineExpired || capacityFull;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        // Filter out expired and full events for regular users
        events = events.stream()
                .filter(event -> !isEventExpiredOrFull(event, now))
                .collect(Collectors.toList());
        
        events.sort(Comparator.comparing(Event::getRegStart, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Event>> getActiveEvents(@RequestParam(required = false) String clubId) {
        List<Event> events = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        // Filter by clubId if provided
        if (clubId != null && !clubId.isBlank()) {
            events = events.stream()
                    .filter(event -> clubId.equals(event.getClubId()))
                    .collect(Collectors.toList());
        }
        
        // Only return active events (not expired and not full)
        events = events.stream()
                .filter(event -> !isEventExpiredOrFull(event, now))
                .collect(Collectors.toList());
        
        events.sort(Comparator.comparing(Event::getRegStart, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/expired")
    public ResponseEntity<List<Event>> getExpiredEvents(@RequestHeader(value = "Authorization", required = false) String authorization, 
                                                          @RequestParam(required = false) String clubId) {
        User actorUser = getActorUserFromToken(authorization);
        if (actorUser == null || (!isGlobalAdmin(actorUser) && !isClubAdmin(actorUser))) {
            return ResponseEntity.status(403).build();
        }

        List<Event> events = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        // Filter by clubId if provided
        if (clubId != null && !clubId.isBlank()) {
            events = events.stream()
                    .filter(event -> clubId.equals(event.getClubId()))
                    .collect(Collectors.toList());
        }
        
        // Only return expired events OR full events
        events = events.stream()
                .filter(event -> isEventExpiredOrFull(event, now))
                .collect(Collectors.toList());
        
        // If club admin and no clubId provided, filter by their club
        if (isClubAdmin(actorUser) && (clubId == null || clubId.isBlank())) {
            List<ClubAdmin> clubAdmins = clubAdminRepository.findByUsernameIgnoreCaseAndEnabledTrue(actorUser.getUsername());
            List<String> allowedClubIds = clubAdmins.stream().map(ClubAdmin::getClubId).collect(Collectors.toList());
            events = events.stream()
                    .filter(event -> allowedClubIds.contains(event.getClubId()))
                    .collect(Collectors.toList());
        }
        
        events.sort(Comparator.comparing(Event::getRegEnd, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
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
    public ResponseEntity<Event> createEvent(@RequestBody Event event, @RequestHeader(value = "Authorization", required = false) String authorization) {
        System.out.println("DEBUG: Creating event with auth header: " + (authorization != null ? "present" : "null"));
        User actorUser = getActorUserFromToken(authorization);
        System.out.println("DEBUG: actorUser from token: " + (actorUser != null ? actorUser.getUsername() : "null"));
        if (actorUser == null) {
            // Try regular authentication
            actorUser = getActorUser();
            System.out.println("DEBUG: actorUser from Spring Security: " + (actorUser != null ? actorUser.getUsername() : "null"));
        }
        String actor = actorUser != null ? actorUser.getUsername() : "unknown";
        System.out.println("DEBUG: Final actor: " + actor);

        if (actorUser == null) {
            System.out.println("DEBUG: No actor user found, returning 403");
            return ResponseEntity.status(403).<Event>build();
        }

        if (actorUser != null && isClubAdmin(actorUser)) {
            System.out.println("DEBUG: User is CLUB_ADMIN, checking club permissions");
            System.out.println("DEBUG: event.clubId = " + event.getClubId());
            System.out.println("DEBUG: actorUser.adminClubId = " + actorUser.getAdminClubId());
            // Check if user is admin for this specific club using ClubAdmin entries
            List<ClubAdmin> clubAdmins = clubAdminRepository.findByUsernameIgnoreCaseAndEnabledTrue(actorUser.getUsername());
            boolean hasAccess = clubAdmins.stream().anyMatch(ca -> ca.getClubId().equals(event.getClubId()));
            if (!hasAccess) {
                System.out.println("DEBUG: Club admin permission check FAILED - returning 403");
                return ResponseEntity.status(403).<Event>build();
            }
            System.out.println("DEBUG: Club admin permission check PASSED");
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
                    existingEvent.setType(event.getType());
                    existingEvent.setMinMembers(event.getMinMembers());
                    existingEvent.setMaxMembers(event.getMaxMembers());

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

    @org.springframework.transaction.annotation.Transactional
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

        // 1. Delete all winners associated with this event
        winnerRepository.deleteByEventId(id);

        // 2. Delete all teams associated with this event
        // We fetch and delete one-by-one to trigger cascade deletion of team members
        List<Team> teams = teamRepository.findByEventId(id);
        if (teams != null && !teams.isEmpty()) {
            teamRepository.deleteAll(teams);
        }

        // 3. Delete the event itself
        // This will also delete registrations due to CascadeType.ALL on event.registrations
        eventRepository.delete(existingOpt.get());
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@NonNull @PathVariable String id) {
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

                    // Check if user is already registered (by username only - each user has unique USN)
                    boolean alreadyRegistered = event.getRegistrations().stream()
                            .anyMatch(reg -> reg.getUsername() != null && reg.getUsername().equalsIgnoreCase(username));
                    
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
    @GetMapping("/my-registrations")
    public ResponseEntity<?> getMyRegistrations(@RequestParam String username) {
        try {
            // Find all events where user is registered individually
            List<Event> events = eventRepository.findAll();
            List<Event> myEvents = events.stream().filter(e -> 
                e.getRegistrations() != null && e.getRegistrations().stream()
                    .anyMatch(reg -> reg.getUsername().trim().equalsIgnoreCase(username))
            ).collect(Collectors.toList());
            
            return ResponseEntity.ok(myEvents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
