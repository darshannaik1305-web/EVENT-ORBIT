package com.mvjce.eventmanagement.service;

import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.Winner;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.WinnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private WinnerRepository winnerRepository;

    @Autowired
    private com.mvjce.eventmanagement.repository.TeamRepository teamRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);

    public String processQuery(String query, String username) {
        if (query == null || query.isBlank()) {
            return "I don't have that information right now.";
        }

        query = query.toLowerCase().trim();

        // 1. Event Discovery
        if (query.contains("list all events") || query.contains("available events") || query.equals("what events are available?")) {
            return listAllEvents();
        }

        // 2. Winners
        if (query.contains("who won") || query.contains("winner of")) {
            return findWinner(query);
        }

        // 3. Event Details (Match by name)
        String eventDetails = findEventDetails(query);
        if (eventDetails != null) {
            return eventDetails;
        }

        // 4. Participation / My events
        if (query.contains("my events") || query.contains("events did i join") || query.contains("events i joined") || query.contains("what events i participated")) {
            return listMyEvents(username);
        }

        // 5. Registration Help / General Queries (Static knowledge)
        String staticInfo = findStaticInfo(query);
        if (staticInfo != null) {
            return staticInfo;
        }

        return "I don't have that information right now.";
    }

    private String listAllEvents() {
        List<Event> events = eventRepository.findAll();
        if (events.isEmpty()) {
            return "📋 List:\n• No events available at the moment.";
        }

        StringBuilder sb = new StringBuilder("📋 List:\n");
        for (Event e : events) {
            sb.append("• ").append(e.getName()).append("\n");
        }
        return sb.toString();
    }

    private String findWinner(String query) {
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
            if (query.contains(event.getName().toLowerCase())) {
                List<Winner> winners = winnerRepository.findByEventId(event.getId());
                if (winners.isEmpty()) {
                    return "I don't have information about the winner for " + event.getName() + " right now.";
                }
                
                StringBuilder sb = new StringBuilder("📌 " + event.getName() + " Winners\n\n");
                sb.append("📋 List:\n");
                for (Winner w : winners) {
                    String displayName = "";
                    if (com.mvjce.eventmanagement.model.EventType.GROUP.equals(event.getType())) {
                        displayName = teamRepository.findByEventId(event.getId()).stream()
                            .filter(t -> t.getLeaderId() != null && t.getLeaderId().equalsIgnoreCase(w.getUsername()))
                            .map(com.mvjce.eventmanagement.model.Team::getTeamName)
                            .findFirst()
                            .orElse(w.getFullName() + "(" + w.getUsername() + ")");
                    } else {
                        displayName = w.getFullName() + "(" + w.getUsername() + ")";
                    }
                    sb.append("• ").append(w.getPosition().getDisplayName()).append(": ").append(displayName).append("\n");
                }
                return sb.toString();
            }
        }
        return "I don't have that information right now.";
    }

    private String findEventDetails(String query) {
        // Look for keywords like "when is", "where is", "details of"
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
            String name = event.getName().toLowerCase();
            if (query.contains(name)) {
                return formatEventDetails(event);
            }
        }
        return null;
    }

    private String formatEventDetails(Event event) {
        String date = event.getRegStart() != null ? event.getRegStart().format(DATE_FORMATTER) : "TBD";
        return String.format("📌 %s\n\n📅 Date: %s\n📍 Location: College Campus\n📝 Description: %s", 
                event.getName(), date, event.getDescription());
    }

    private String listMyEvents(String username) {
        if (username == null || username.isBlank() || username.equals("anonymousUser")) {
            return "I don't have that information right now. Please login to see your events.";
        }

        List<Event> allEvents = eventRepository.findAll();
        List<Event> myEvents = allEvents.stream().filter(e -> 
            e.getRegistrations() != null && e.getRegistrations().stream()
                .anyMatch(reg -> reg.getUsername().trim().equalsIgnoreCase(username))
        ).collect(Collectors.toList());

        if (myEvents.isEmpty()) {
            return "📋 List:\n• You haven't joined any events yet.";
        }

        StringBuilder sb = new StringBuilder("📋 List:\n");
        for (Event e : myEvents) {
            sb.append("• ").append(e.getName()).append("\n");
        }
        return sb.toString();
    }

    private String findStaticInfo(String query) {
        try {
            ClassPathResource resource = new ClassPathResource("knowledge.txt");
            InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            String knowledge = FileCopyUtils.copyToString(reader);

            // Simple search logic
            if (query.contains("how to register") || query.contains("participate") || query.contains("registration process")) {
                return extractSection(knowledge, "REGISTRATION PROCESS");
            }
            if (query.contains("rules") || query.contains("code of conduct")) {
                return extractSection(knowledge, "COLLEGE RULES");
            }
            if (query.contains("guidelines")) {
                return extractSection(knowledge, "GUIDELINES");
            }
            if (query.contains("faq") || query.contains("question") || query.contains("can i")) {
                return extractSection(knowledge, "FAQS");
            }
            if (query.contains("scholarship")) {
                return extractSection(knowledge, "SCHOLARSHIP INFO");
            }

        } catch (Exception e) {
            return null;
        }
        return null;
    }

    private String extractSection(String knowledge, String sectionTitle) {
        String[] sections = knowledge.split("### ");
        for (String section : sections) {
            if (section.startsWith(sectionTitle)) {
                String content = section.substring(sectionTitle.length()).trim();
                // Format steps if possible
                if (content.contains("1. ")) {
                    return "🎯 Steps:\n\n" + content;
                } else {
                    return "📋 List:\n\n" + content;
                }
            }
        }
        return null;
    }
}
