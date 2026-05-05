package com.mvjce.eventmanagement.service;

import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.Winner;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.WinnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.concurrent.ConcurrentHashMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class ChatService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private WinnerRepository winnerRepository;

    @Autowired
    private com.mvjce.eventmanagement.repository.TeamRepository teamRepository;

    @Value("${openai.api.key:YOUR_OPENAI_API_KEY}")
    private String apiKey;

    @Value("${openai.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:google/gemini-2.0-flash-lite-preview-02-05:free}")
    private String model;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> lastEventContext = new ConcurrentHashMap<>();

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
        if (query.matches(".*(who won|winner|winners|results).*")) {
            String winnerResult = findWinner(query, username);
            if (winnerResult != null) return winnerResult;
        }

        // 3. Event Details (Match by name)
        String eventDetails = findEventDetails(query, username);
        if (eventDetails != null) {
            return eventDetails;
        }

        // 4. Participation / My events
        if (query.contains("my events") || query.contains("events did i join") || query.contains("events i joined") || query.contains("what events i participated")) {
            return listMyEvents(username);
        }

        // 5. Registration Help / General Queries (Static knowledge)
        List<String> matchedSections = findStaticInfo(query);
        if (!matchedSections.isEmpty()) {
            if (matchedSections.size() == 1) {
                String staticInfo = formatSection(matchedSections.get(0));
                String aiRefined = askAI(query, staticInfo);
                return aiRefined != null ? aiRefined : staticInfo;
            } else {
                // Multiple sections found - ask for clarification
                StringBuilder context = new StringBuilder("I found multiple relevant topics. Please specify which one you are interested in:\n");
                for (String s : matchedSections) {
                    String title = s.split("\\n")[0].trim();
                    context.append("- ").append(title).append("\n");
                }
                String aiClarification = askAI("The user asked '" + query + "'. Please ask them to choose from these options: " + context.toString(), "Ambiguity Handling");
                return aiClarification != null ? aiClarification : context.toString();
            }
        }

        // 6. Super Fallback (AI with full knowledge context)
        String fullKnowledge = loadFullKnowledge();
        if (fullKnowledge != null && !fullKnowledge.isBlank()) {
            String aiAnswer = askAI(query, fullKnowledge);
            if (aiAnswer != null && !aiAnswer.isBlank() && !aiAnswer.toLowerCase().contains("don't know")) {
                return aiAnswer;
            }
        }

        return "I don't have that information right now. Please try asking about specific events like 'Dance' or 'Coding'.";
    }

    private String loadFullKnowledge() {
        try {
            ClassPathResource resource = new ClassPathResource("knowledge.txt");
            InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            return FileCopyUtils.copyToString(reader);
        } catch (Exception e) {
            return null;
        }
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

    private String findWinner(String query, String username) {
        List<Event> allEvents = eventRepository.findAll();
        
        // Priority 1: Exact Match (after cleaning noise)
        String cleanQuery = query.toLowerCase().replaceAll("\\b(who|won|winner|the|of|for|results)\\b", "").trim();
        for (Event event : allEvents) {
            if (cleanQuery.equalsIgnoreCase(event.getName().toLowerCase())) {
                lastEventContext.put(username, event.getId());
                return getWinnerInfo(event);
            }
        }

        // Priority 2: Contextual Match (if query is just "who won")
        if (cleanQuery.isBlank() || cleanQuery.matches("who|won|winner|winners|results")) {
            String lastEventId = lastEventContext.get(username);
            if (lastEventId != null) {
                return eventRepository.findById(lastEventId)
                    .map(this::getWinnerInfo)
                    .orElse(null);
            }
        }

        List<Event> matchedEvents = new ArrayList<>();
        
        String[] queryWords = query.toLowerCase().split("\\s+");
        
        for (Event event : allEvents) {
            String name = event.getName().toLowerCase();
            boolean match = false;
            
            if (query.contains(name)) match = true;
            else {
                for (String word : queryWords) {
                    if (word.length() < 3 || word.matches("who|won|winner|the|of|for")) continue;
                    if (name.contains(word) || word.contains(name)) {
                        match = true;
                        break;
                    }
                    // Fuzzy match
                    String[] nameWords = name.split("\\s+");
                    for (String nw : nameWords) {
                        if (calculateSimilarity(word, nw) > 0.8) {
                            match = true;
                            break;
                        }
                    }
                    if (match) break;
                }
            }
            if (match) {
                matchedEvents.add(event);
                if (matchedEvents.size() == 1) lastEventContext.put(username, event.getId());
            }
        }

        if (matchedEvents.isEmpty()) return null;

        if (matchedEvents.size() > 1) {
            StringBuilder options = new StringBuilder();
            for (Event e : matchedEvents) options.append("- ").append(e.getName()).append("\n");
            
            String prompt = "The user asked about winners but their query matches multiple events: " + options.toString() + 
                            ". Please ask them to choose one specifically so you can provide the winners.";
            String aiClarification = askAI(prompt, "Winner Ambiguity Handling");
            return aiClarification != null ? aiClarification : "I found multiple related events. Which one did you mean?\n" + options.toString();
        }

        return getWinnerInfo(matchedEvents.get(0));
    }

    private String getWinnerInfo(Event event) {
        List<Winner> winners = winnerRepository.findByEventId(event.getId());
        if (winners.isEmpty()) {
            return "📌 " + event.getName() + ": No winners announced yet.";
        }
        
        StringBuilder sb = new StringBuilder("📌 " + event.getName() + " Winners\n");
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

    private String findEventDetails(String query, String username) {
        List<Event> allEvents = eventRepository.findAll();
        
        // Priority 1: Exact Match (after cleaning noise)
        String cleanQuery = query.toLowerCase().replaceAll("\\b(when|where|details|about|info|the|for)\\b", "").trim();
        for (Event event : allEvents) {
            if (cleanQuery.equalsIgnoreCase(event.getName().toLowerCase())) {
                lastEventContext.put(username, event.getId());
                return formatEventDetails(event);
            }
        }

        // Priority 2: Contextual Match
        if (cleanQuery.isBlank() || cleanQuery.matches("when|where|details|about|info")) {
            String lastEventId = lastEventContext.get(username);
            if (lastEventId != null) {
                return eventRepository.findById(lastEventId)
                    .map(this::formatEventDetails)
                    .orElse(null);
            }
        }

        List<Event> matchedEvents = new ArrayList<>();
        String[] queryWords = query.toLowerCase().split("\\s+");

        for (Event event : allEvents) {
            String name = event.getName().toLowerCase();
            if (query.contains(name)) matchedEvents.add(event);
            else {
                for (String word : queryWords) {
                    if (word.length() < 3 || word.matches("when|where|details|about|info")) continue;
                    if (name.contains(word)) {
                        matchedEvents.add(event);
                        break;
                    }
                }
            }
        }

        if (matchedEvents.isEmpty()) return null;
        if (matchedEvents.size() > 1) {
            StringBuilder options = new StringBuilder();
            for (Event e : matchedEvents) options.append("- ").append(e.getName()).append("\n");
            
            String prompt = "The user asked for event details but their query matches multiple events: " + options.toString() + 
                            ". Please ask them to choose one specifically.";
            String aiClarification = askAI(prompt, "Event Detail Ambiguity Handling");
            return aiClarification != null ? aiClarification : "I found multiple events. Which one are you looking for?\n" + options.toString();
        }

        return formatEventDetails(matchedEvents.get(0));
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

    private List<String> findStaticInfo(String query) {
        try {
            ClassPathResource resource = new ClassPathResource("knowledge.txt");
            InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            String knowledge = FileCopyUtils.copyToString(reader);

            String[] sections = knowledge.split("### ");
            List<String> matches = new ArrayList<>();
            int highestScore = 0;

            String[] queryWords = query.toLowerCase().split("\\s+");

            // First pass: find highest score
            Map<String, Integer> scores = new HashMap<>();
            for (String section : sections) {
                if (section.isBlank()) continue;

                String[] lines = section.split("\\n", 2);
                String title = lines[0].trim().toLowerCase();
                String content = lines.length > 1 ? lines[1].trim().toLowerCase() : "";

                int score = 0;
                for (String word : queryWords) {
                    if (word.length() < 3) continue; 
                    
                    if (title.contains(word)) score += 10;
                    else if (content.contains(word)) score += 2;
                    else {
                        String[] titleWords = title.split("\\s+");
                        for (String tw : titleWords) {
                            if (tw.length() < 3) continue;
                            if (calculateSimilarity(word, tw) > 0.7) {
                                score += 8;
                                break;
                            }
                        }
                    }
                }
                if (score > 0) {
                    scores.put(section, score);
                    if (score > highestScore) highestScore = score;
                }
            }

            // Second pass: collect sections close to highest score
            if (highestScore > 5) {
                for (Map.Entry<String, Integer> entry : scores.entrySet()) {
                    if (entry.getValue() >= highestScore - 2) {
                        matches.add(entry.getKey());
                    }
                }
            }
            return matches;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String formatSection(String section) {
        String[] lines = section.split("\\n", 2);
        String title = lines[0].trim();
        String content = lines.length > 1 ? lines[1].trim() : "";
        
        String icon = "📋";
        if (title.contains("PROCESS") || title.contains("STEP") || title.contains("HOW TO")) icon = "🎯";
        else if (title.contains("RULES") || title.contains("GUIDELINES")) icon = "⚖️";
        else if (title.contains("FAQ")) icon = "❓";
        else if (title.contains("SCHOLARSHIP")) icon = "🎓";

        return String.format("%s %s\n\n%s", icon, title, content);
    }

    private double calculateSimilarity(String s1, String s2) {
        int distance = levenshteinDistance(s1, s2);
        return 1.0 - ((double) distance / Math.max(s1.length(), s2.length()));
    }

    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++) dp[0][j] = j;
        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
            }
        }
        return dp[s1.length()][s2.length()];
    }

    private String askAI(String query, String context) {
        if (apiKey == null || apiKey.equals("YOUR_OPENAI_API_KEY") || apiKey.isBlank()) {
            return null; // Skip AI if no key
        }

        try {
            String prompt = String.format(
                "You are an assistant for EventOrbit, a college event management system. " +
                "Use the following context to answer the student's question accurately and politely. " +
                "If the answer is not in the context, say you don't know.\n\n" +
                "Context: %s\n\nQuestion: %s\n\nAnswer:", 
                context, query
            );

            String requestBody = objectMapper.createObjectNode()
                .put("model", model)
                .set("messages", objectMapper.createArrayNode()
                    .add(objectMapper.createObjectNode()
                        .put("role", "user")
                        .put("content", prompt)))
                .toString();

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost:7070") // Optional, for OpenRouter
                .header("X-Title", "EventOrbit") // Optional, for OpenRouter
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                String answer = root.path("choices").get(0).path("message").path("content").asText().trim();
                return answer.isBlank() ? null : answer;
            } else {
                System.err.println("AI API Error: " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            System.err.println("AI Exception: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }
}
