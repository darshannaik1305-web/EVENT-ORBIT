package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.model.Winner;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
import com.mvjce.eventmanagement.repository.WinnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/winners")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class WinnerController {

    @Autowired
    private WinnerRepository winnerRepository;

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

    private boolean canManageWinners(User actor, Event event) {
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

    @PostMapping
    public ResponseEntity<?> addWinner(@RequestBody Map<String, Object> payload) {
        try {
            String eventId = (String) payload.get("eventId");
            String username = (String) payload.get("username");
            String positionStr = (String) payload.get("position");

            if (eventId == null || username == null || positionStr == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "eventId, username, and position are required"));
            }

            Winner.Position position;
            try {
                position = Winner.Position.valueOf(positionStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid position. Must be FIRST, SECOND, or THIRD"));
            }

            // Check if event exists
            Event event = eventRepository.findById(eventId).orElse(null);
            if (event == null) {
                return ResponseEntity.notFound().build();
            }

            // Check if user can manage winners for this event
            User actorUser = getActorUser();
            if (!canManageWinners(actorUser, event)) {
                return ResponseEntity.status(403).body(Map.of("message", "You don't have permission to manage winners for this event"));
            }

            // Check if position is already taken for this event
            if (winnerRepository.existsByEventIdAndPosition(eventId, position)) {
                return ResponseEntity.badRequest().body(Map.of("message", "This position is already assigned for this event"));
            }

            // Check if user is already a winner for this event
            if (winnerRepository.existsByEventIdAndUsername(eventId, username.trim())) {
                return ResponseEntity.badRequest().body(Map.of("message", "This user is already a winner for this event"));
            }

            // Get user details
            User winnerUser = userRepository.findByUsernameIgnoreCase(username.trim()).orElse(null);
            if (winnerUser == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }

            // Check if user is registered for this event
            boolean isRegistered = event.getRegistrations() != null && 
                    event.getRegistrations().stream()
                            .anyMatch(reg -> reg.getUsername() != null && 
                                    reg.getUsername().equalsIgnoreCase(username.trim()));
            if (!isRegistered) {
                return ResponseEntity.badRequest().body(Map.of("message", "This user is not registered for this event"));
            }

            // Validate user details
            if (winnerUser.getFullName() == null || winnerUser.getFullName().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Winner's full name is missing"));
            }
            if (winnerUser.getEmail() == null || winnerUser.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Winner's email is missing"));
            }
            if (winnerUser.getMobile() == null || !winnerUser.getMobile().matches("\\d{10}")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Winner's mobile number is missing or invalid"));
            }

            // Create winner
            Winner winner = new Winner(
                    eventId,
                    event.getClubId(),
                    winnerUser.getUsername(),
                    winnerUser.getFullName(),
                    winnerUser.getEmail(),
                    winnerUser.getMobile(),
                    position
            );

            String actor = actorUser != null ? actorUser.getUsername() : "unknown";
            winner.setCreatedBy(actor);
            winner.setCreatedAt(LocalDateTime.now());
            winner.setUpdatedBy(actor);
            winner.setUpdatedAt(LocalDateTime.now());

            Winner savedWinner = winnerRepository.save(winner);
            return ResponseEntity.ok(Map.of(
                    "message", "Winner added successfully",
                    "winner", savedWinner
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error adding winner: " + e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Map<String, Object>>> getWinnersByEvent(@NonNull @PathVariable String eventId) {
        List<Winner> winners = winnerRepository.findByEventIdOrderByPositionAsc(eventId);
        
        List<Map<String, Object>> result = winners.stream()
                .map(winner -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", winner.getId());
                    map.put("eventId", winner.getEventId());
                    map.put("clubId", winner.getClubId());
                    map.put("username", winner.getUsername());
                    map.put("fullName", winner.getFullName());
                    map.put("email", winner.getEmail());
                    map.put("mobile", winner.getMobile());
                    map.put("position", winner.getPosition().name());
                    map.put("positionDisplayName", winner.getPosition().getDisplayName());
                    map.put("createdAt", winner.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<Map<String, Object>>> getWinnersByClub(@NonNull @PathVariable String clubId) {
        List<Winner> winners = winnerRepository.findByClubIdOrderByCreatedAtDesc(clubId);
        
        List<Map<String, Object>> result = winners.stream()
                .map(winner -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", winner.getId());
                    map.put("eventId", winner.getEventId());
                    map.put("clubId", winner.getClubId());
                    map.put("username", winner.getUsername());
                    map.put("fullName", winner.getFullName());
                    map.put("email", winner.getEmail());
                    map.put("mobile", winner.getMobile());
                    map.put("position", winner.getPosition().name());
                    map.put("positionDisplayName", winner.getPosition().getDisplayName());
                    map.put("createdAt", winner.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllWinners() {
        List<Winner> winners = winnerRepository.findAll();
        
        List<Map<String, Object>> result = winners.stream()
                .map(winner -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", winner.getId());
                    map.put("eventId", winner.getEventId());
                    map.put("clubId", winner.getClubId());
                    map.put("username", winner.getUsername());
                    map.put("fullName", winner.getFullName());
                    map.put("email", winner.getEmail());
                    map.put("mobile", winner.getMobile());
                    map.put("position", winner.getPosition().name());
                    map.put("positionDisplayName", winner.getPosition().getDisplayName());
                    map.put("createdAt", winner.getCreatedAt());
                    
                    // Get event name
                    String eventId = winner.getEventId();
                    if (eventId != null) {
                        eventRepository.findById(eventId).ifPresent(event -> {
                            map.put("eventName", event.getName());
                        });
                    }
                    
                    return map;
                })
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWinner(@NonNull @PathVariable String id, @RequestBody Map<String, Object> payload) {
        return winnerRepository.findById(id)
                .map(winner -> {
                    // Get event to check permissions
                    String eventId = winner.getEventId();
                    if (eventId == null) {
                        return ResponseEntity.notFound().build();
                    }
                    Event event = eventRepository.findById(eventId).orElse(null);
                    if (event == null) {
                        return ResponseEntity.notFound().build();
                    }

                    User actorUser = getActorUser();
                    if (!canManageWinners(actorUser, event)) {
                        return ResponseEntity.status(403).body(Map.of("message", "You don't have permission to update this winner"));
                    }

                    String username = (String) payload.get("username");
                    String positionStr = (String) payload.get("position");

                    if (username != null) {
                        User newWinnerUser = userRepository.findByUsernameIgnoreCase(username.trim()).orElse(null);
                        if (newWinnerUser == null) {
                            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
                        }
                        winner.setUsername(newWinnerUser.getUsername());
                        winner.setFullName(newWinnerUser.getFullName());
                        winner.setEmail(newWinnerUser.getEmail());
                        winner.setMobile(newWinnerUser.getMobile());
                    }

                    if (positionStr != null) {
                        Winner.Position newPosition;
                        try {
                            newPosition = Winner.Position.valueOf(positionStr.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Invalid position. Must be FIRST, SECOND, or THIRD"));
                        }

                        // Check if new position is already taken (excluding current winner)
                        if (!newPosition.equals(winner.getPosition()) && 
                            winnerRepository.existsByEventIdAndPosition(winner.getEventId(), newPosition)) {
                            return ResponseEntity.badRequest().body(Map.of("message", "This position is already assigned for this event"));
                        }
                        winner.setPosition(newPosition);
                    }

                    String actor = actorUser != null ? actorUser.getUsername() : "unknown";
                    winner.setUpdatedBy(actor);
                    winner.setUpdatedAt(LocalDateTime.now());

                    Winner savedWinner = winnerRepository.save(winner);
                    return ResponseEntity.ok(Map.of(
                            "message", "Winner updated successfully",
                            "winner", savedWinner
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWinner(@NonNull @PathVariable String id) {
        return winnerRepository.findById(id)
                .map(winner -> {
                    // Get event to check permissions
                    String eventId = winner.getEventId();
                    if (eventId == null) {
                        return ResponseEntity.notFound().build();
                    }
                    Event event = eventRepository.findById(eventId).orElse(null);
                    if (event == null) {
                        return ResponseEntity.notFound().build();
                    }

                    User actorUser = getActorUser();
                    if (!canManageWinners(actorUser, event)) {
                        return ResponseEntity.status(403).body(Map.of("message", "You don't have permission to delete this winner"));
                    }

                    winnerRepository.deleteById(id);
                    return ResponseEntity.ok(Map.of("message", "Winner deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/clubs-with-winners")
    public ResponseEntity<List<Map<String, Object>>> getClubsWithWinners() {
        List<String> clubIds = winnerRepository.findAllClubIdsWithWinners();
        
        List<Map<String, Object>> result = clubIds.stream()
                .map(clubId -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("clubId", clubId);
                    
                    // Get club name
                    eventRepository.findAll().stream()
                            .filter(event -> clubId.equals(event.getClubId()))
                            .findFirst()
                            .ifPresent(event -> {
                                // You might want to fetch club name from club repository
                                map.put("clubName", "Club " + clubId.substring(0, Math.min(8, clubId.length())));
                            });
                    
                    return map;
                })
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(result);
    }
}
