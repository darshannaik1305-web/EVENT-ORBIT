package com.mvjce.eventmanagement.service;

import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.EventType;
import com.mvjce.eventmanagement.model.Team;
import com.mvjce.eventmanagement.model.TeamMember;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.TeamMemberRepository;
import com.mvjce.eventmanagement.repository.TeamRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Team registerTeam(String eventId, String teamName, List<String> memberUserIds, String leaderId) throws IllegalArgumentException {
        // Validate event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        // Check if event is a GROUP event
        if (event.getType() != EventType.GROUP) {
            throw new IllegalArgumentException("This is not a group event");
        }

        // Check registration period
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getRegStart())) {
            throw new IllegalArgumentException("Registration has not started yet");
        }
        if (now.isAfter(event.getRegEnd())) {
            throw new IllegalArgumentException("Registration has ended");
        }

        // Validate team size
        int minMembers = event.getMinMembers() != null ? event.getMinMembers() : 1;
        int maxMembers = event.getMaxMembers() != null ? event.getMaxMembers() : Integer.MAX_VALUE;
        int teamSize = memberUserIds.size() + 1; // +1 for leader

        if (teamSize < minMembers) {
            throw new IllegalArgumentException("Team must have at least " + minMembers + " members (including leader)");
        }
        if (teamSize > maxMembers) {
            throw new IllegalArgumentException("Team can have at most " + maxMembers + " members (including leader)");
        }

        // Check if team name is unique for this event
        if (teamRepository.existsByEventIdAndTeamNameIgnoreCase(eventId, teamName)) {
            throw new IllegalArgumentException("Team name '" + teamName + "' is already taken for this event. Please choose a different name.");
        }

        // Check for duplicate USNs in the team
        Set<String> uniqueUserIds = new HashSet<>();
        uniqueUserIds.add(leaderId.toUpperCase());
        for (String userId : memberUserIds) {
            String normalizedUserId = userId.trim().toUpperCase();
            if (!uniqueUserIds.add(normalizedUserId)) {
                throw new IllegalArgumentException("Duplicate USN in team: " + normalizedUserId);
            }
        }

        // Check if any member (including leader) is already registered in this event
        // Check leader
        if (teamMemberRepository.existsByEventIdAndUserId(eventId, leaderId)) {
            throw new IllegalArgumentException("You are already registered for this event in another team");
        }

        // Also check if leader is registered as individual
        if (event.getRegistrations().stream()
                .anyMatch(reg -> reg.getUsername().trim().equalsIgnoreCase(leaderId))) {
            throw new IllegalArgumentException("You are already registered for this event");
        }

        // Check all team members
        for (String userId : memberUserIds) {
            String normalizedUserId = userId.trim().toUpperCase();

            // Check if user is already in another team for this event
            if (teamMemberRepository.existsByEventIdAndUserId(eventId, normalizedUserId)) {
                throw new IllegalArgumentException("Member " + normalizedUserId + " is already registered for this event in another team");
            }

            // Check if user is registered as individual for this event
            if (event.getRegistrations().stream()
                    .anyMatch(reg -> reg.getUsername().trim().equalsIgnoreCase(normalizedUserId))) {
                throw new IllegalArgumentException("Member " + normalizedUserId + " is already registered for this event");
            }
        }

        // Create the team
        Team team = new Team(eventId, teamName, leaderId);
        team = teamRepository.save(team);

        // Add the leader as a team member
        User leader = userRepository.findByUsernameIgnoreCase(leaderId)
                .orElseThrow(() -> new IllegalArgumentException("Leader not found: " + leaderId));
        TeamMember leaderMember = new TeamMember(team, leaderId, leader.getFullName(), leader.getEmail(), leader.getMobile());
        teamMemberRepository.save(leaderMember);

        // Add all other team members
        for (String userId : memberUserIds) {
            String normalizedUserId = userId.trim().toUpperCase();
            User member = userRepository.findByUsernameIgnoreCase(normalizedUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Member not found: " + normalizedUserId));
            TeamMember teamMember = new TeamMember(team, normalizedUserId, member.getFullName(), member.getEmail(), member.getMobile());
            teamMemberRepository.save(teamMember);
        }

        return team;
    }

    public List<Team> getTeamsByEvent(String eventId) {
        return teamRepository.findByEventId(eventId);
    }

    public Optional<Team> getTeamById(String teamId) {
        return teamRepository.findById(teamId);
    }

    @Transactional
    public void deleteTeam(String teamId) {
        teamRepository.deleteById(teamId);
    }

    public boolean isUserRegisteredForEvent(String eventId, String userId) {
        return teamMemberRepository.existsByEventIdAndUserId(eventId, userId);
    }

    public List<TeamMember> getTeamMembersByUserId(String userId) {
        return teamMemberRepository.findByUserId(userId);
    }
}
