package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.Club;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Transactional
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
                .filter(u -> u.getRole() == null || (!u.getRole().equalsIgnoreCase("CLUB_ADMIN") 
                        && !u.getRole().equalsIgnoreCase("SUPER_ADMIN") 
                        && !u.getRole().equalsIgnoreCase("ADMIN")))
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("username", u.getUsername());
                    m.put("role", u.getRole() != null ? u.getRole() : "STUDENT");
                    m.put("mobile", u.getMobile());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("gender", u.getGender());
                    m.put("enabled", u.isEnabled());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/club-admins")
    public ResponseEntity<List<Map<String, Object>>> listClubAdmins() {
        List<Map<String, Object>> clubAdmins = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase("CLUB_ADMIN"))
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("clubAdminId", u.getUsername());
                    m.put("username", u.getUsername());
                    m.put("facultyName", u.getFullName() != null ? u.getFullName() : u.getUsername());
                    m.put("fullName", u.getFullName() != null ? u.getFullName() : u.getUsername());
                    m.put("role", "CLUB_ADMIN");
                    m.put("mobile", u.getMobile());
                    m.put("email", u.getEmail());
                    m.put("gender", u.getGender());
                    m.put("adminClubId", u.getAdminClubId());
                    m.put("enabled", u.isEnabled());

                    String clubId = u.getAdminClubId();
                    if (clubId == null || clubId.isBlank()) {
                        List<ClubAdmin> cas = clubAdminRepository.findByUsernameIgnoreCase(u.getUsername());
                        if (!cas.isEmpty()) {
                            clubId = cas.get(0).getClubId();
                            m.put("adminClubId", clubId);
                        }
                    }

                    if (clubId != null && !clubId.isBlank()) {
                        clubRepository.findById(clubId).ifPresent(c -> {
                            m.put("clubName", c.getName());
                            m.put("clubCategory", c.getCategory());
                        });
                    }

                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(clubAdmins);
    }

    @PostMapping("/club-admins")
    public ResponseEntity<?> createClubAdmin(@RequestBody Map<String, String> payload) {
        try {
            String clubAdminId = payload.get("clubAdminId");
            if (clubAdminId == null || clubAdminId.isBlank()) {
                clubAdminId = payload.get("username");
            }
            String facultyName = payload.get("facultyName");
            if (facultyName == null || facultyName.isBlank()) {
                facultyName = payload.get("fullName");
            }
            String clubId = payload.get("clubId");
            if (clubId == null || clubId.isBlank()) {
                clubId = payload.get("adminClubId");
            }
            String email = payload.get("email");
            String mobile = payload.get("mobile");

            if (clubAdminId == null || clubAdminId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Club Admin ID is required (e.g. CODINGCLUB01)"));
            }
            if (facultyName == null || facultyName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Faculty / Lecturer Name is required"));
            }
            if (clubId == null || clubId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Assigned Club selection is required"));
            }
            if (mobile == null || mobile.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Faculty phone/mobile number is required to generate the initial temporary password"));
            }

            // Extract first meaningful name and last 4 digits of phone
            String firstName = extractFirstName(facultyName);
            String last4Digits = extractLast4DigitsOfPhone(mobile);
            String tempPassword = firstName + "@" + last4Digits;

            final String normalizedId = clubAdminId.trim().toUpperCase();

            // 1. Uniqueness check for Club Admin ID across all users
            if (userRepository.existsByUsernameIgnoreCase(normalizedId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Club Admin ID '" + normalizedId + "' is already taken. Please choose a unique ID."));
            }

            final String assignedClubId = clubId;

            // 2. Club existence check
            Club club = clubRepository.findById(assignedClubId)
                    .orElseThrow(() -> new RuntimeException("Selected club does not exist."));

            // 3. Strict 1 Club Admin per Club enforcement
            boolean clubAlreadyHasAdmin = userRepository.findAll().stream()
                    .anyMatch(u -> "CLUB_ADMIN".equalsIgnoreCase(u.getRole()) 
                            && assignedClubId.equals(u.getAdminClubId()) 
                            && u.isEnabled());
            if (clubAlreadyHasAdmin || clubAdminRepository.countByClubIdAndEnabledTrue(assignedClubId) > 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Club '" + club.getName() + "' already has an assigned active Club Admin. Each club can have only 1 Club Admin."));
            }

            // 4. Create separate Lecturer Club Admin User with hashed temp password and mustChangePassword = true
            User adminUser = new User();
            adminUser.setUsername(normalizedId);
            adminUser.setFullName(facultyName.trim());
            adminUser.setPassword(passwordEncoder.encode(tempPassword));
            adminUser.setRole("CLUB_ADMIN");
            adminUser.setAdminClubId(assignedClubId);
            adminUser.setEmail(email != null ? email.trim() : "");
            adminUser.setMobile(mobile != null ? mobile.trim() : "");
            adminUser.setEnabled(true);
            adminUser.setMustChangePassword(true);
            User saved = userRepository.save(adminUser);

            // 5. Create/sync ClubAdmin entity
            ClubAdmin clubAdmin = new ClubAdmin(normalizedId, clubId);
            clubAdmin.setEnabled(true);
            clubAdminRepository.save(clubAdmin);

            Map<String, Object> resp = new java.util.LinkedHashMap<>();
            resp.put("message", "Lecturer Club Admin '" + normalizedId + "' created for '" + club.getName() + "' successfully");
            resp.put("id", saved.getId());
            resp.put("clubAdminId", saved.getUsername());
            resp.put("username", saved.getUsername());
            resp.put("facultyName", saved.getFullName());
            resp.put("role", "CLUB_ADMIN");
            resp.put("adminClubId", clubId);
            resp.put("clubName", club.getName());
            resp.put("temporaryPassword", tempPassword);
            resp.put("mustChangePassword", true);
            resp.put("enabled", saved.isEnabled());

            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private String extractFirstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "Faculty";
        }
        String[] tokens = fullName.trim().split("\\s+");
        java.util.Set<String> titlePrefixes = java.util.Set.of(
                "dr.", "dr", "prof.", "prof", "mr.", "mr", "mrs.", "mrs", "ms.", "ms", "shri", "smt", "er.", "er", "doctor", "professor"
        );
        for (String token : tokens) {
            String cleanToken = token.replaceAll("[^a-zA-Z]", "");
            if (!cleanToken.isBlank() && !titlePrefixes.contains(token.toLowerCase()) && !titlePrefixes.contains(cleanToken.toLowerCase())) {
                return cleanToken.substring(0, 1).toUpperCase() + (cleanToken.length() > 1 ? cleanToken.substring(1).toLowerCase() : "");
            }
        }
        return "Faculty";
    }

    private String extractLast4DigitsOfPhone(String mobile) {
        if (mobile == null || mobile.isBlank()) {
            throw new RuntimeException("Phone number is required");
        }
        String digits = mobile.replaceAll("\\D+", "");
        if (digits.length() < 4) {
            throw new RuntimeException("Phone number must contain at least 4 digits");
        }
        return digits.substring(digits.length() - 4);
    }

    @PatchMapping("/club-admins/{id}/enabled")
    public ResponseEntity<?> setClubAdminEnabled(@NonNull @PathVariable String id, @RequestBody Map<String, Object> payload) {
        Object enabledObj = payload.get("enabled");
        if (!(enabledObj instanceof Boolean enabled)) {
            return ResponseEntity.badRequest().body(Map.of("message", "enabled must be boolean"));
        }

        // Try lookup by User ID first, then by ClubAdmin ID
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEnabled(enabled);
            userRepository.save(user);

            // Sync with club_admins table
            List<ClubAdmin> cas = clubAdminRepository.findByUsernameIgnoreCase(user.getUsername());
            for (ClubAdmin ca : cas) {
                ca.setEnabled(enabled);
                clubAdminRepository.save(ca);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Club Admin status updated successfully",
                    "id", user.getId(),
                    "clubAdminId", user.getUsername(),
                    "enabled", user.isEnabled()
            ));
        }

        return clubAdminRepository.findById(id)
                .map(ca -> {
                    ca.setEnabled(enabled);
                    clubAdminRepository.save(ca);
                    userRepository.findByUsernameIgnoreCase(ca.getUsername()).ifPresent(u -> {
                        u.setEnabled(enabled);
                        userRepository.save(u);
                    });
                    return ResponseEntity.ok(Map.of(
                            "message", "Club Admin status updated successfully",
                            "clubAdminId", ca.getUsername(),
                            "enabled", ca.isEnabled()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/club-admins/{id}")
    public ResponseEntity<?> deleteClubAdmin(@NonNull @PathVariable String id) {
        // Safe removal of admin account without touching events, registrations, or winners
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            if ("CLUB_ADMIN".equalsIgnoreCase(u.getRole())) {
                clubAdminRepository.deleteByUsernameIgnoreCase(u.getUsername());
                userRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Club Admin account removed successfully. All event records remain preserved."));
            }
        }

        return clubAdminRepository.findById(id)
                .map(ca -> {
                    String username = ca.getUsername();
                    clubAdminRepository.deleteById(id);
                    userRepository.findByUsernameIgnoreCase(username).ifPresent(u -> {
                        if ("CLUB_ADMIN".equalsIgnoreCase(u.getRole())) {
                            userRepository.deleteById(u.getId());
                        }
                    });
                    return ResponseEntity.ok(Map.of("message", "Club Admin account removed successfully. All event records remain preserved."));
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

    @PatchMapping("/users/{id}/enabled")
    public ResponseEntity<?> setUserEnabled(@NonNull @PathVariable String id, @RequestBody Map<String, Object> payload) {
        Object enabledObj = payload.get("enabled");
        if (!(enabledObj instanceof Boolean enabled)) {
            return ResponseEntity.badRequest().body(Map.of("message", "enabled must be boolean"));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if ("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) || "ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Super Admin accounts cannot be disabled"));
        }

        user.setEnabled(enabled);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "User status updated successfully",
                "id", user.getId(),
                "username", user.getUsername(),
                "enabled", user.isEnabled()
        ));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@NonNull @PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if ("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) || "ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Super Admin accounts cannot be deleted"));
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Student account deleted successfully"));
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
