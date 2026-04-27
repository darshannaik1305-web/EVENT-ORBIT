package com.mvjce.eventmanagement.controller;

import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.Team;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
import com.mvjce.eventmanagement.service.JWTService;
import com.mvjce.eventmanagement.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class TeamController {

    @Autowired
    private TeamService teamService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTService jwtService;

    private User getActorUserFromToken(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            try {
                String username = jwtService.extractUsername(token);
                if (username != null && !username.isBlank()) {
                    return userRepository.findByUsernameIgnoreCase(username).orElse(null);
                }
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerTeam(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        final User currentUser;
        User userFromToken = getActorUserFromToken(authorization);
        if (userFromToken != null) {
            currentUser = userFromToken;
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth != null ? auth.getName() : null;
            if (username != null && !username.isBlank()) {
                currentUser = userRepository.findByUsernameIgnoreCase(username.trim()).orElse(null);
            } else {
                currentUser = null;
            }
        }

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String eventId = (String) payload.get("eventId");
        String teamName = (String) payload.get("teamName");
        @SuppressWarnings("unchecked")
        List<String> memberUsns = (List<String>) payload.get("memberUsns");

        if (eventId == null || eventId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Event ID is required"));
        }
        if (teamName == null || teamName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Team name is required"));
        }
        if (memberUsns == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Member list is required"));
        }

        try {
            Team team = teamService.registerTeam(eventId, teamName, memberUsns, currentUser.getUsername());
            return ResponseEntity.ok(Map.of(
                    "message", "Team registered successfully",
                    "teamId", team.getId(),
                    "teamName", team.getTeamName()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getTeamsByEvent(@PathVariable String eventId) {
        try {
            List<Team> teams = teamService.getTeamsByEvent(eventId);
            return ResponseEntity.ok(teams);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<?> deleteTeam(
            @PathVariable String teamId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        
        User actorUser = getActorUserFromToken(authorization);
        if (actorUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        
        if (!"ADMIN".equals(actorUser.getRole()) && !"CLUB_ADMIN".equals(actorUser.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        
        try {
            teamService.deleteTeam(teamId);
            return ResponseEntity.ok(Map.of("message", "Team deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check-registration/{eventId}")
    public ResponseEntity<?> checkUserRegistration(
            @PathVariable String eventId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        final User currentUser;
        User userFromToken = getActorUserFromToken(authorization);
        if (userFromToken != null) {
            currentUser = userFromToken;
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth != null ? auth.getName() : null;
            if (username != null && !username.isBlank()) {
                currentUser = userRepository.findByUsernameIgnoreCase(username.trim()).orElse(null);
            } else {
                currentUser = null;
            }
        }

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        try {
            boolean isRegistered = teamService.isUserRegisteredForEvent(eventId, currentUser.getUsername());

            // Also check individual registration
            Event event = eventRepository.findById(eventId).orElse(null);
            boolean isIndividualRegistered = false;
            if (event != null && event.getRegistrations() != null) {
                isIndividualRegistered = event.getRegistrations().stream()
                        .anyMatch(reg -> reg.getUsername().trim().equalsIgnoreCase(currentUser.getUsername()));
            }

            return ResponseEntity.ok(Map.of(
                    "isRegistered", isRegistered || isIndividualRegistered,
                    "teamRegistered", isRegistered,
                    "individualRegistered", isIndividualRegistered
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-teams")
    public ResponseEntity<?> getMyTeams(@RequestParam String username) {
        try {
            // Find all TeamMember entries for this user
            List<com.mvjce.eventmanagement.model.TeamMember> memberships = teamService.getTeamMembersByUserId(username);
            java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
            
            for (com.mvjce.eventmanagement.model.TeamMember tm : memberships) {
                Team t = tm.getTeam();
                Event e = eventRepository.findById(t.getEventId()).orElse(null);
                if (e == null) continue; // Skip teams for deleted events
                
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", t.getId());
                map.put("teamName", t.getTeamName());
                map.put("eventId", t.getEventId());
                map.put("eventName", e != null ? e.getName() : "Unknown Event");
                result.add(map);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
