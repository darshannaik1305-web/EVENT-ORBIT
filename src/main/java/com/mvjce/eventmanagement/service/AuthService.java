package com.mvjce.eventmanagement.service;

import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTService jwtService;

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
        return Map.of(
                "token", token,
                "username", user.getUsername(),
                "role", role
        );
    }

    public User getUserByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return userOpt.get();
    }

    public User register(String username, String password, String mobile) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER");
        user.setMobile(mobile);
        user.setEnabled(true);
        
        return userRepository.save(user);
    }
}
