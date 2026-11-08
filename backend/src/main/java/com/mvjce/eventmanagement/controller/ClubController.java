package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.Club;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.ClubRepository;
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

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ClubController {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WinnerRepository winnerRepository;

    @Autowired
    private com.mvjce.eventmanagement.repository.ClubAdminRepository clubAdminRepository;

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        List<Club> clubs = clubRepository.findAll();
        return ResponseEntity.ok(clubs);
    }

    @GetMapping("/my-clubs")
    public ResponseEntity<List<Club>> getMyClubs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        if (username == null || username.isBlank() || username.equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByUsernameIgnoreCase(username.trim()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        if ("ADMIN".equalsIgnoreCase(user.getRole()) || "SUPER_ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.ok(clubRepository.findAll());
        }

        if (!"CLUB_ADMIN".equalsIgnoreCase(user.getRole()) || !user.isEnabled()) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }

        String assignedClubId = user.getAdminClubId();
        if (assignedClubId == null || assignedClubId.isBlank()) {
            List<com.mvjce.eventmanagement.model.ClubAdmin> adminEntries = clubAdminRepository.findByUsernameIgnoreCaseAndEnabledTrue(user.getUsername());
            if (!adminEntries.isEmpty()) {
                assignedClubId = adminEntries.get(0).getClubId();
            }
        }

        if (assignedClubId != null && !assignedClubId.isBlank()) {
            return clubRepository.findById(assignedClubId)
                    .map(c -> ResponseEntity.ok(List.of(c)))
                    .orElse(ResponseEntity.ok(java.util.Collections.emptyList()));
        }

        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@NonNull @PathVariable String id) {
        return clubRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<com.mvjce.eventmanagement.model.Event>> getEventsByClub(@NonNull @PathVariable String id) {
        List<com.mvjce.eventmanagement.model.Event> events = eventRepository.findByClubIdOrderByRegStartDesc(id);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}/winners")
    public ResponseEntity<List<com.mvjce.eventmanagement.model.Winner>> getWinnersByClub(@NonNull @PathVariable String id) {
        List<com.mvjce.eventmanagement.model.Event> events = eventRepository.findByClubIdOrderByRegStartDesc(id);
        List<String> eventIds = events.stream().map(com.mvjce.eventmanagement.model.Event::getId).collect(java.util.stream.Collectors.toList());
        List<com.mvjce.eventmanagement.model.Winner> winners = winnerRepository.findAll().stream()
                .filter(w -> eventIds.contains(w.getEventId()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(winners);
    }

    @PostMapping
    public ResponseEntity<Club> createClub(@RequestBody Club club) {
        if (clubRepository.existsByName(club.getName())) {
            return ResponseEntity.badRequest().build();
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actor = auth != null ? auth.getName() : "unknown";
        club.setCreatedBy(actor);
        club.setCreatedAt(LocalDateTime.now());
        club.setUpdatedBy(actor);
        club.setUpdatedAt(LocalDateTime.now());

        Club savedClub = clubRepository.save(club);
        return ResponseEntity.ok(savedClub);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Club> updateClub(@NonNull @PathVariable String id, @RequestBody Club club) {
        return clubRepository.findById(id)
                .map(existingClub -> {
                    if (club.getName() != null) existingClub.setName(club.getName());
                    if (club.getDescription() != null) existingClub.setDescription(club.getDescription());
                    if (club.getCategory() != null) existingClub.setCategory(club.getCategory());
                    if (club.getImageUrl() != null) existingClub.setImageUrl(club.getImageUrl());
                    if (club.getBannerUrl() != null) existingClub.setBannerUrl(club.getBannerUrl());

                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    String actor = auth != null ? auth.getName() : "unknown";
                    existingClub.setUpdatedBy(actor);
                    existingClub.setUpdatedAt(LocalDateTime.now());

                    return ResponseEntity.ok(clubRepository.save(existingClub));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClub(@NonNull @PathVariable String id) {
        return clubRepository.findById(id)
                .map(club -> {
                    try {
                        // Step 1: Find all events of this club and delete their winners and events
                        List<com.mvjce.eventmanagement.model.Event> events = eventRepository.findByClubIdOrderByRegStartDesc(id);
                        for (com.mvjce.eventmanagement.model.Event event : events) {
                            if (event.getId() != null) {
                                // Delete winners for this event
                                List<com.mvjce.eventmanagement.model.Winner> winners = winnerRepository.findByEventIdOrderByPositionAsc(event.getId());
                                for (com.mvjce.eventmanagement.model.Winner winner : winners) {
                                    winnerRepository.deleteById(winner.getId());
                                }
                                // Delete the event
                                eventRepository.deleteById(event.getId());
                            }
                        }
                        
                        // Step 2: Revoke ClubAdmin entries for this club and demote affected users if no remaining clubs
                        try {
                            List<com.mvjce.eventmanagement.model.ClubAdmin> clubAdminEntries = clubAdminRepository.findByClubId(id);
                            for (com.mvjce.eventmanagement.model.ClubAdmin ca : clubAdminEntries) {
                                String username = ca.getUsername();
                                clubAdminRepository.deleteById(ca.getId());

                                List<com.mvjce.eventmanagement.model.ClubAdmin> remaining = clubAdminRepository.findByUsernameIgnoreCase(username);
                                if (remaining.isEmpty()) {
                                    userRepository.findByUsernameIgnoreCase(username).ifPresent(user -> {
                                        user.setRole("USER");
                                        user.setAdminClubId(null);
                                        userRepository.save(user);
                                    });
                                } else {
                                    userRepository.findByUsernameIgnoreCase(username).ifPresent(user -> {
                                        user.setAdminClubId(remaining.get(0).getClubId());
                                        userRepository.save(user);
                                    });
                                }
                            }
                        } catch (Exception e) {
                            System.out.println("Warning: Could not update club admins: " + e.getMessage());
                        }
                        
                        // Step 3: Delete the club
                        clubRepository.deleteById(id);
                        
                        return ResponseEntity.ok(Map.of(
                                "message", "Club deleted successfully",
                                "deletedEvents", events.size(),
                                "clubName", club.getName()
                        ));
                    } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.status(500).body(Map.of(
                                "message", "Error deleting club: " + e.getMessage(),
                                "error", e.getClass().getSimpleName()
                        ));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
