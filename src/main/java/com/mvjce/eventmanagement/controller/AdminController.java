package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.UserRepository;
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
                    m.put("adminClubId", u.getAdminClubId());
                    m.put("enabled", u.isEnabled());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
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
                    userRepository.deleteById(id);
                    return ResponseEntity.ok(Map.of("message", "User deleted"));
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
}
