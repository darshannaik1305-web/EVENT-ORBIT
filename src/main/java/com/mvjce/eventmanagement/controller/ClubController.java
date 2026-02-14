package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.Club;
import com.mvjce.eventmanagement.repository.ClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class ClubController {

    @Autowired
    private ClubRepository clubRepository;

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
    public ResponseEntity<Void> deleteClub(@NonNull @PathVariable String id) {
        if (clubRepository.existsById(id)) {
            clubRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
