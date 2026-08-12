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

        List<com.mvjce.eventmanagement.model.ClubAdmin> adminEntries = clubAdminRepository.findByUsernameIgnoreCase(user.getUsername());
        List<String> clubIds = adminEntries.stream()
                .map(com.mvjce.eventmanagement.model.ClubAdmin::getClubId)
                .collect(java.util.stream.Collectors.toList());

        if (clubIds.isEmpty() && user.getAdminClubId() != null && !user.getAdminClubId().isBlank()) {
            clubIds.add(user.getAdminClubId());
        }

        List<Club> clubs = clubRepository.findAllById(clubIds);
        return ResponseEntity.ok(clubs);
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
                        
                        // Step 2: Delete the club admin associated with this club
                        try {
                            List<User> clubAdmins = userRepository.findByRoleIgnoreCase("CLUB_ADMIN");
                            for (User admin : clubAdmins) {
                                if (id.equals(admin.getAdminClubId())) {
                                    userRepository.deleteById(admin.getId());
                                    break;
                                }
                            }
                        } catch (Exception e) {
                            // Continue even if admin delete fails
                            System.out.println("Warning: Could not delete club admin: " + e.getMessage());
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
