package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.UserRepository;
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

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("username", u.getUsername());
                    m.put("role", u.getRole());
                    m.put("mobile", u.getMobile());
                    m.put("enabled", u.isEnabled());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
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

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }

        if (!role.equals("USER") && !role.equals("ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("message", "role must be USER or ADMIN"));
        }

        User user = new User();
        user.setUsername(username);
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
