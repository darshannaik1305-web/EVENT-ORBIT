package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.ClubAdmin;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.ClubAdminRepository;
import com.mvjce.eventmanagement.repository.ClubRepository;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
import com.mvjce.eventmanagement.repository.WinnerRepository;
import com.mvjce.eventmanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Autowired
    private WinnerRepository winnerRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ClubAdminRepository clubAdminRepository;

    @Autowired
    private ClubRepository clubRepository;

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("username", u.getUsername());
                    m.put("role", u.getRole());
                    m.put("mobile", u.getMobile());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("gender", u.getGender());
                    m.put("adminClubId", u.getAdminClubId());
                    m.put("enabled", u.isEnabled());
                    // For club admins, include clubs array
                    if (u.getRole() != null && u.getRole().equalsIgnoreCase("CLUB_ADMIN")) {
                        List<ClubAdmin> clubAdmins = clubAdminRepository.findByUsernameIgnoreCase(u.getUsername());
                        List<Map<String, Object>> clubs = clubAdmins.stream()
                                .map(ca -> {
                                    Map<String, Object> cm = new HashMap<>();
                                    cm.put("clubAdminId", ca.getId());
                                    cm.put("clubId", ca.getClubId());
                                    cm.put("enabled", ca.isEnabled());
                                    return cm;
                                })
                                .collect(Collectors.toList());
                        m.put("clubs", clubs);
                    }
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/club-admins")
    public ResponseEntity<List<Map<String, Object>>> listClubAdmins() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase("CLUB_ADMIN"))
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("username", u.getUsername());
                    m.put("role", u.getRole());
                    m.put("mobile", u.getMobile());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("gender", u.getGender());
                    // Get all clubs this admin manages
                    List<ClubAdmin> clubAdmins = clubAdminRepository.findByUsernameIgnoreCase(u.getUsername());
                    List<Map<String, Object>> clubs = clubAdmins.stream()
                            .map(ca -> {
                                Map<String, Object> cm = new HashMap<>();
                                cm.put("clubAdminId", ca.getId());
                                cm.put("clubId", ca.getClubId());
                                cm.put("enabled", ca.isEnabled());
                                return cm;
                            })
                            .collect(Collectors.toList());
                    m.put("clubs", clubs);
                    m.put("enabled", u.isEnabled());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/club-admins/pending")
    public ResponseEntity<List<Map<String, Object>>> listPendingClubAdmins() {
        // Get all pending ClubAdmin entries
        List<ClubAdmin> pendingClubAdmins = clubAdminRepository.findAll().stream()
                .filter(ca -> !ca.isEnabled())
                .collect(Collectors.toList());

        List<Map<String, Object>> result = pendingClubAdmins.stream()
                .map(ca -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("clubAdminId", ca.getId());
                    m.put("username", ca.getUsername());
                    m.put("clubId", ca.getClubId());
                    m.put("enabled", ca.isEnabled());
                    // Get user details
                    userRepository.findByUsernameIgnoreCase(ca.getUsername()).ifPresent(user -> {
                        m.put("userId", user.getId());
                        m.put("fullName", user.getFullName());
                        m.put("mobile", user.getMobile());
                        m.put("email", user.getEmail());
                        m.put("gender", user.getGender());
                    });
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/club-admins")
    public ResponseEntity<?> createClubAdmin(@RequestBody Map<String, String> payload) {
        try {
            String usn = payload.get("usn");
            String fullName = payload.get("fullName");
            String password = payload.get("password");
            String mobile = payload.get("mobile");
            String email = payload.get("email");
            String gender = payload.get("gender");
            String clubId = payload.get("clubId");

            User saved = authService.registerAdmin(usn, fullName, password, mobile, email, gender, clubId);
            return ResponseEntity.ok(Map.of(
                    "message", "Club admin created",
                    "id", saved.getId(),
                    "username", saved.getUsername(),
                    "role", saved.getRole(),
                    "adminClubId", saved.getAdminClubId(),
                    "enabled", saved.isEnabled()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@NonNull @PathVariable String id) {
        return userRepository.findById(id)
                .map(u -> {
                    if (u.getRole() != null && u.getRole().equalsIgnoreCase("ADMIN")) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete global admin"));
                    }
                    // Delete related records in order to avoid foreign key constraints
                    try {
                        // Delete user roles first
                        userRepository.deleteUserRoles(id);
                        // Delete ClubAdmin entries for this user
                        clubAdminRepository.deleteByUsernameIgnoreCase(u.getUsername());
                        // Finally delete the user
                        userRepository.deleteById(id);
                        return ResponseEntity.ok(Map.of("message", "User deleted"));
                    } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of("message", "Error deleting user: " + e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/enabled")
    public ResponseEntity<?> setUserEnabled(@NonNull @PathVariable String id, @RequestBody Map<String, Object> payload) {
        Object enabledObj = payload.get("enabled");
        if (!(enabledObj instanceof Boolean enabled)) {
            return ResponseEntity.badRequest().body(Map.of("message", "enabled must be boolean"));
        }

        return userRepository.findById(id)
                .map(user -> {
                    if (!enabled && user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN")) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Cannot disable global admin"));
                    }
                    user.setEnabled(enabled);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "message", "User updated",
                            "id", user.getId(),
                            "enabled", user.isEnabled()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/club-admins/{clubAdminId}/enabled")
    public ResponseEntity<?> setClubAdminEnabled(@NonNull @PathVariable String clubAdminId, @RequestBody Map<String, Object> payload) {
        Object enabledObj = payload.get("enabled");
        if (!(enabledObj instanceof Boolean enabled)) {
            return ResponseEntity.badRequest().body(Map.of("message", "enabled must be boolean"));
        }

        return clubAdminRepository.findById(clubAdminId)
                .map(ca -> {
                    ca.setEnabled(enabled);
                    clubAdminRepository.save(ca);

                    // If this is the first enabled club for this user, also enable the user
                    if (enabled) {
                        List<ClubAdmin> enabledClubs = clubAdminRepository.findByUsernameIgnoreCaseAndEnabledTrue(ca.getUsername());
                        userRepository.findByUsernameIgnoreCase(ca.getUsername()).ifPresent(user -> {
                            if (!user.isEnabled()) {
                                user.setEnabled(true);
                                userRepository.save(user);
                            }
                        });
                    }

                    return ResponseEntity.ok(Map.of(
                            "message", "Club admin updated",
                            "clubAdminId", ca.getId(),
                            "enabled", ca.isEnabled()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/club-admins/{clubAdminId}")
    public ResponseEntity<?> deleteClubAdmin(@NonNull @PathVariable String clubAdminId) {
        return clubAdminRepository.findById(clubAdminId)
                .map(ca -> {
                    clubAdminRepository.deleteById(clubAdminId);
                    return ResponseEntity.ok(Map.of("message", "Club admin mapping deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        String mobile = payload.get("mobile");
        String role = payload.getOrDefault("role", "USER");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "username and password are required"));
        }

        if (mobile != null && !mobile.isBlank() && !mobile.matches("\\d{10}")) {
            return ResponseEntity.badRequest().body(Map.of("message", "mobile must be a valid 10-digit number"));
        }

        String normalizedUsername = username.trim().toUpperCase();
        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }

        if (!role.equals("USER") && !role.equals("ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("message", "role must be USER or ADMIN"));
        }

        User user = new User();
        user.setUsername(normalizedUsername);
        user.setPassword(passwordEncoder.encode(password));
        user.setMobile(mobile);
        user.setRole(role);
        user.setEnabled(true);
        User saved = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "User created",
                "id", saved.getId(),
                "username", saved.getUsername(),
                "role", saved.getRole(),
                "enabled", saved.isEnabled()
        ));
    }

    @PostMapping("/cleanup-winners")
    public ResponseEntity<?> cleanupOrphanedWinners() {
        List<com.mvjce.eventmanagement.model.Winner> allWinners = winnerRepository.findAll();
        int deletedCount = 0;
        
        for (com.mvjce.eventmanagement.model.Winner winner : allWinners) {
            // Check if the event still exists
            if (!eventRepository.existsById(winner.getEventId())) {
                winnerRepository.deleteById(winner.getId());
                deletedCount++;
            }
        }
        
        return ResponseEntity.ok(Map.of(
                "message", "Cleanup completed",
                "deletedCount", deletedCount,
                "deletedWinners", deletedCount + " orphaned winner(s) removed"
        ));
    }

    @PostMapping("/cleanup-events")
    public ResponseEntity<?> cleanupOrphanedEvents() {
        List<com.mvjce.eventmanagement.model.Event> allEvents = eventRepository.findAll();
        int deletedCount = 0;
        
        for (com.mvjce.eventmanagement.model.Event event : allEvents) {
            // Check if the club still exists
            if (event.getClubId() != null && !clubRepository.existsById(event.getClubId())) {
                // Delete winners for this orphaned event first
                winnerRepository.deleteByEventId(event.getId());
                // Delete the event
                eventRepository.deleteById(event.getId());
                deletedCount++;
            }
        }
        
        return ResponseEntity.ok(Map.of(
                "message", "Cleanup completed",
                "deletedEvents", deletedCount
        ));
    }
}
