package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"*"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Auth controller is working!");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            Map<String, Object> response = authService.login(username, password);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg == null || msg.isBlank()) {
                msg = "Login failed";
            }
            Map<String, String> error = new HashMap<>();
            error.put("error", msg);
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg == null || msg.isBlank()) {
                msg = "Server error";
            }
            Map<String, String> error = new HashMap<>();
            error.put("error", msg);
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        try {
            String usn = payload.get("usn");
            String fullName = payload.get("fullName");
            String password = payload.get("password");
            String mobile = payload.get("mobile");
            String email = payload.get("email");
            String gender = payload.get("gender");

            User registeredUser = authService.register(
                usn,
                fullName,
                password,
                mobile,
                email,
                gender
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("username", registeredUser.getUsername());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload) {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            String username = auth != null ? auth.getName() : null;
            if (username == null || username.isBlank() || username.equals("anonymousUser")) {
                username = payload.get("username");
            }
            if (username == null || username.isBlank()) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            String currentPassword = payload.get("currentPassword");
            String newPassword = payload.get("newPassword");

            authService.changePassword(username, currentPassword, newPassword);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

}
