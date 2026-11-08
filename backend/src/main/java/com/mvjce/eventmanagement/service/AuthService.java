package com.mvjce.eventmanagement.service;

import com.mvjce.eventmanagement.model.ClubAdmin;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.ClubAdminRepository;
import com.mvjce.eventmanagement.repository.ClubRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private ClubAdminRepository clubAdminRepository;

    public Map<String, Object> login(String username, String password) {
        User user = getUserByUsername(username);

        String role = user.getRole();
        if (role == null || role.isBlank()) {
            role = "STUDENT";
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String normalizedRole = role.toUpperCase();
        if ("USER".equals(normalizedRole)) normalizedRole = "STUDENT";
        if ("ADMIN".equals(normalizedRole)) normalizedRole = "SUPER_ADMIN";

        List<String> rolesList = new ArrayList<>();
        if ("STUDENT".equals(normalizedRole)) {
            rolesList.add("STUDENT");
        } else if ("CLUB_ADMIN".equals(normalizedRole)) {
            rolesList.add("CLUB_ADMIN");
        } else if ("SUPER_ADMIN".equals(normalizedRole)) {
            rolesList.add("SUPER_ADMIN");
        } else {
            rolesList.add(normalizedRole);
        }

        String token = jwtService.generateToken(user.getUsername(), normalizedRole);

        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("username", user.getUsername());
        resp.put("role", normalizedRole);
        resp.put("roles", rolesList);
        resp.put("fullName", user.getFullName() != null ? user.getFullName() : user.getUsername());
        resp.put("email", user.getEmail() != null ? user.getEmail() : "");
        resp.put("mobile", user.getMobile() != null ? user.getMobile() : "");
        resp.put("mustChangePassword", user.isMustChangePassword());

        if (rolesList.contains("CLUB_ADMIN")) {
            String adminClubId = user.getAdminClubId();
            if (adminClubId == null || adminClubId.isBlank()) {
                List<ClubAdmin> adminClubs = clubAdminRepository.findByUsernameIgnoreCase(user.getUsername());
                if (!adminClubs.isEmpty()) {
                    adminClubId = adminClubs.get(0).getClubId();
                }
            }
            if (adminClubId != null && !adminClubId.isBlank()) {
                resp.put("adminClubId", adminClubId);
                resp.put("adminClubIds", List.of(adminClubId));
                clubRepository.findById(adminClubId).ifPresent(c -> resp.put("adminClubName", c.getName()));
            }
        }

        return resp;
    }

    public User getUserByUsername(String username) {
        if (username == null) {
            throw new RuntimeException("User not found");
        }

        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(username.trim());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return userOpt.get();
    }

    public User register(String usn, String fullName, String password, String mobile, String email, String gender) {
        if (usn == null || usn.isBlank()) {
            throw new RuntimeException("USN is required");
        }
        String normalizedUsn = usn.trim().toUpperCase();
        if (!normalizedUsn.matches("[A-Z0-9]+")) {
            throw new RuntimeException("USN is invalid");
        }
        if (!normalizedUsn.matches("^1MJ[A-Z0-9]{7}$")) {
            throw new RuntimeException("USN must be in format 1MJ******* (all capital letters)");
        }
        if (fullName == null || fullName.isBlank()) {
            throw new RuntimeException("Full name is required");
        }
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is required");
        }
        if (mobile == null || !mobile.matches("\\d{10}")) {
            throw new RuntimeException("mobile must be a valid 10-digit number");
        }
        if (email == null || email.isBlank() || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new RuntimeException("email is invalid");
        }
        if (gender == null || gender.isBlank()) {
            throw new RuntimeException("gender is required");
        }
        String g = gender.trim().toUpperCase();
        if (!g.equals("MALE") && !g.equals("FEMALE") && !g.equals("OTHER")) {
            throw new RuntimeException("gender must be MALE, FEMALE or OTHER");
        }

        if (userRepository.existsByUsernameIgnoreCase(normalizedUsn)) {
            throw new RuntimeException("USN already exists");
        }
        
        User user = new User();
        user.setUsername(normalizedUsn);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("STUDENT");
        user.setMobile(mobile);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setGender(g);
        user.setEnabled(true);
        user.setMustChangePassword(false);
        
        return userRepository.save(user);
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("User not authenticated");
        }
        if (currentPassword == null || currentPassword.isBlank()) {
            throw new RuntimeException("Current password is required");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("New password is required");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        User user = getUserByUsername(username);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }
}
