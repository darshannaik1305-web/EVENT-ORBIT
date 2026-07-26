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
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class ClubController {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WinnerRepository winnerRepository;

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        List<Club> clubs = clubRepository.findAll();
        return ResponseEntity.ok(clubs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@NonNull @PathVariable String id) {
        return clubRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
                    existingClub.setName(club.getName());
                    existingClub.setImageUrl(club.getImageUrl());

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
