package com.mvjce.eventmanagement.service;

import com.mvjce.eventmanagement.model.ClubAdmin;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.ClubAdminRepository;
import com.mvjce.eventmanagement.repository.ClubRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
            role = "USER";
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getUsername(), role);

        if ("CLUB_ADMIN".equalsIgnoreCase(role)) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("username", user.getUsername());
            resp.put("role", role);
            // Fetch all clubs this admin manages (including pending approval)
            List<ClubAdmin> adminClubs = clubAdminRepository.findByUsernameIgnoreCase(user.getUsername());
            List<String> clubIds = adminClubs.stream()
                    .map(ClubAdmin::getClubId)
                    .collect(Collectors.toList());
            if (!clubIds.isEmpty()) {
                resp.put("adminClubIds", clubIds);
                // For backwards compatibility, also include first club
                resp.put("adminClubId", clubIds.get(0));
            }
            return resp;
        }
        if ("ADMIN".equalsIgnoreCase(role)) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("username", user.getUsername());
            resp.put("role", role);
            return resp;
        }

        return Map.of(
                "token", token,
                "username", user.getUsername(),
                "role", role,
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "email", user.getEmail() != null ? user.getEmail() : ""
        );
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
        user.setRole("USER");
        user.setMobile(mobile);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setGender(g);
        user.setEnabled(true);
        
        return userRepository.save(user);
    }

    public User registerAdmin(String usn, String fullName, String password, String mobile, String email, String gender, String adminClubId) {
        if (adminClubId == null || adminClubId.isBlank()) {
            throw new RuntimeException("club is required");
        }
        final String normalizedClubId = Objects.requireNonNull(adminClubId).trim();
        if (!clubRepository.existsById(Objects.requireNonNull(normalizedClubId))) {
            throw new RuntimeException("club is invalid");
        }

        // Check admin limit per club using ClubAdminRepository
        long currentAdmins = clubAdminRepository.countByClubIdAndEnabledTrue(normalizedClubId);
        if (currentAdmins >= 2) {
            throw new RuntimeException("Only two admins are allowed per club");
        }

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

        // Check if this user is already an admin for this specific club
        if (clubAdminRepository.existsByUsernameIgnoreCaseAndClubId(normalizedUsn, normalizedClubId)) {
            throw new RuntimeException("This USN is already an admin for this club");
        }

        Optional<User> existingUserOpt = userRepository.findByUsernameIgnoreCase(normalizedUsn);
        User user;

        if (existingUserOpt.isPresent()) {
            // User exists - check if they can be added as admin for another club
            user = existingUserOpt.get();

            // Verify password matches
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new RuntimeException("USN already exists with a different password");
            }

            // Verify details match (case-insensitive, trimmed)
            if (!Objects.equals(user.getFullName() != null ? user.getFullName().trim() : null, fullName.trim())) {
                throw new RuntimeException("USN already exists with different name");
            }

            // Update role to CLUB_ADMIN if not already
            if (!"CLUB_ADMIN".equalsIgnoreCase(user.getRole())) {
                user.setRole("CLUB_ADMIN");
                user = userRepository.save(user);
            }
        } else {
            // Create new user
            user = new User();
            user.setUsername(normalizedUsn);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole("CLUB_ADMIN");
            user.setMobile(mobile);
            user.setFullName(fullName);
            user.setEmail(email);
            user.setGender(g);
            user.setEnabled(false);
            user = userRepository.save(user);
        }

        // Create ClubAdmin mapping entry
        ClubAdmin clubAdmin = new ClubAdmin();
        clubAdmin.setUsername(normalizedUsn);
        clubAdmin.setClubId(normalizedClubId);
        clubAdmin.setEnabled(false); // Needs superadmin approval
        clubAdminRepository.save(clubAdmin);

        return user;
    }
}
