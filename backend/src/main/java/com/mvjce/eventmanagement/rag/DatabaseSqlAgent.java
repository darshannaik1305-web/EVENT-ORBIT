package com.mvjce.eventmanagement.rag;

import com.mvjce.eventmanagement.dto.SourceMetadata;
import com.mvjce.eventmanagement.model.Club;
import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.Winner;
import com.mvjce.eventmanagement.repository.ClubRepository;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.TeamRepository;
import com.mvjce.eventmanagement.repository.WinnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DatabaseSqlAgent {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private WinnerRepository winnerRepository;

    @Autowired
    private TeamRepository teamRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH);

    public static class QueryResult {
        private final String context;
        private final List<SourceMetadata> sources;

        public QueryResult(String context, List<SourceMetadata> sources) {
            this.context = context;
            this.sources = (sources != null) ? sources : new ArrayList<>();
        }

        public String getContext() { return context; }
        public List<SourceMetadata> getSources() { return sources; }
    }

    public QueryResult retrieveTargetedContext(String rawQuery, String authenticatedUsername) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return new QueryResult("", Collections.emptyList());
        }

        String query = rawQuery.toLowerCase().trim();
        StringBuilder context = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // 1. Check Student-Specific Private Queries (ONLY for authenticatedUsername)
        if (isUserPrivateQuery(query)) {
            return getAuthenticatedUserPrivateContext(authenticatedUsername);
        }

        // 2. Check Winners Intent
        if (query.contains("winner") || query.contains("who won") || query.contains("results")) {
            QueryResult winnerResult = getWinnersContext(query);
            if (!winnerResult.getContext().isBlank()) {
                return winnerResult;
            }
        }

        // 3. Check Club Specific Events Intent
        List<Club> allClubs = clubRepository.findAll();
        for (Club club : allClubs) {
            if (query.contains(club.getName().toLowerCase()) || (club.getCategory() != null && query.contains(club.getCategory().toLowerCase()))) {
                sources.add(new SourceMetadata("CLUB", club.getId(), club.getName()));
                List<Event> clubEvents = eventRepository.findByClubId(club.getId());
                
                boolean wantOngoing = query.contains("ongoing") || query.contains("active") || query.contains("running") || query.contains("upcoming");
                boolean wantEnded = query.contains("ended") || query.contains("past") || query.contains("completed") || query.contains("expired") || query.contains("closed");

                List<Event> filteredEvents = clubEvents;
                String statusHeader = "Events hosted by " + club.getName();

                if (wantOngoing) {
                    filteredEvents = clubEvents.stream()
                            .filter(e -> e.getRegEnd() == null || e.getRegEnd().isAfter(now))
                            .collect(Collectors.toList());
                    statusHeader = "🟢 Ongoing & Upcoming Events hosted by " + club.getName();
                } else if (wantEnded) {
                    filteredEvents = clubEvents.stream()
                            .filter(e -> e.getRegEnd() != null && e.getRegEnd().isBefore(now))
                            .collect(Collectors.toList());
                    statusHeader = "🔴 Ended & Past Events hosted by " + club.getName();
                }

                context.append("🏛️ Club: ").append(club.getName()).append("\n");
                if (club.getDescription() != null) {
                    context.append("Description: ").append(club.getDescription()).append("\n");
                }

                if (!filteredEvents.isEmpty()) {
                    context.append(statusHeader).append(":\n");
                    for (Event e : filteredEvents) {
                        sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                        appendEventDetails(context, e);
                    }
                } else {
                    if (wantOngoing) {
                        context.append("No ongoing or upcoming events currently registered for ").append(club.getName()).append(".\n");
                    } else if (wantEnded) {
                        context.append("No ended or past events currently recorded for ").append(club.getName()).append(".\n");
                    } else {
                        context.append("No events found for this club.\n");
                    }
                }
                return new QueryResult(context.toString(), sources);
            }
        }

        // 4. Check Available Clubs List Intent
        if (query.contains("list clubs") || query.contains("available clubs") || query.contains("which clubs") || query.contains("all clubs")) {
            if (allClubs.isEmpty()) {
                return new QueryResult("No clubs registered in EventOrbit at the moment.", Collections.emptyList());
            }
            context.append("📋 Available Clubs in EventOrbit:\n");
            for (Club c : allClubs) {
                sources.add(new SourceMetadata("CLUB", c.getId(), c.getName()));
                context.append("• ").append(c.getName());
                if (c.getCategory() != null && !c.getCategory().isBlank()) {
                    context.append(" (Category: ").append(c.getCategory()).append(")");
                }
                context.append("\n");
            }
            return new QueryResult(context.toString(), sources);
        }

        // 5. Check Target Event Detail Intent (Match by event name)
        List<Event> allEvents = eventRepository.findAll();
        List<Event> matchedEvents = new ArrayList<>();

        for (Event e : allEvents) {
            String nameLower = e.getName().toLowerCase();
            if (query.contains(nameLower) || isKeywordMatch(query, nameLower)) {
                matchedEvents.add(e);
            }
        }

        if (!matchedEvents.isEmpty()) {
            context.append("📌 Event Information:\n");
            for (Event e : matchedEvents) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                appendEventDetails(context, e);
            }
            return new QueryResult(context.toString(), sources);
        }

        // 6. Check Global Ended / Past Events Intent
        if (query.contains("ended events") || query.contains("past events") || query.contains("completed events") || query.contains("expired events")) {
            List<Event> endedEvents = allEvents.stream()
                    .filter(e -> e.getRegEnd() != null && e.getRegEnd().isBefore(now))
                    .collect(Collectors.toList());

            if (endedEvents.isEmpty()) {
                return new QueryResult("Currently, there are no ended or past events in the records.", Collections.emptyList());
            }

            context.append("🔴 Ended & Past Events:\n");
            for (Event e : endedEvents) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                appendEventDetails(context, e);
            }
            return new QueryResult(context.toString(), sources);
        }

        // 7. Check Active / Upcoming Events Intent
        if (query.contains("upcoming") || query.contains("active") || query.contains("ongoing") || query.contains("happening") || query.contains("available events") || query.contains("list events") || query.contains("events this week")) {
            List<Event> activeEvents = allEvents.stream()
                    .filter(e -> e.getRegEnd() == null || e.getRegEnd().isAfter(now))
                    .collect(Collectors.toList());

            if (activeEvents.isEmpty()) {
                return new QueryResult("Currently, there are no active or upcoming events available for registration.", Collections.emptyList());
            }

            context.append("🟢 Active & Upcoming Events:\n");
            for (Event e : activeEvents) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                appendEventDetails(context, e);
            }
            return new QueryResult(context.toString(), sources);
        }

        return new QueryResult("", Collections.emptyList());
    }

    private boolean isUserPrivateQuery(String q) {
        // How-To / Guidance / FAQ questions must NOT be intercepted as private DB data dumps
        if (q.startsWith("how ") || q.startsWith("where ") || q.startsWith("can i ") || q.startsWith("what ") ||
            q.contains("how do") || q.contains("how can") || q.contains("how to") || q.contains("where can") ||
            q.contains("where do") || q.contains("where is") || q.contains("steps to") || q.contains("process to") ||
            q.contains("can i cancel") || q.contains("can i register") || q.contains("can i view")) {
            return false;
        }

        if (q.contains("my event") || q.contains("my registration") || q.contains("my participation") ||
            q.contains("my winning") || q.contains("my result") || q.contains("my team") ||
            q.contains("did i win") || q.contains("have i registered") || q.contains("am i participating") ||
            q.contains("i am participating") || q.contains("i joined") || q.contains("i registered") ||
            q.contains("i participated") || q.contains("i signed up") || q.contains("i entered")) {
            return true;
        }
        if ((q.contains(" i ") || q.startsWith("i ") || q.contains("my ")) &&
            (q.contains("participat") || q.contains("register") || q.contains("join") || q.contains("event") || q.contains("win"))) {
            return true;
        }
        return false;
    }

    private QueryResult getAuthenticatedUserPrivateContext(String username) {
        if (username == null || username.isBlank() || username.equalsIgnoreCase("anonymousUser")) {
            return new QueryResult("You need to be logged in to view your private registrations and participation status.", Collections.emptyList());
        }

        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();

        // Fetch student's registered events using JPA
        List<Event> allEvents = eventRepository.findAll();
        List<Event> myRegisteredEvents = allEvents.stream()
                .filter(e -> e.getRegistrations() != null && e.getRegistrations().stream()
                        .anyMatch(r -> r.getUsername() != null && r.getUsername().trim().equalsIgnoreCase(username)))
                .collect(Collectors.toList());

        sb.append("👤 Personal Participation for Student [").append(username).append("]:\n\n");

        if (myRegisteredEvents.isEmpty()) {
            sb.append("• You have not registered for any events yet.\n");
        } else {
            sb.append("📋 Events You Registered For:\n");
            for (Event e : myRegisteredEvents) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                sb.append("• ").append(e.getName())
                  .append(" | Venue: ").append(e.getVenue() != null && !e.getVenue().isBlank() ? e.getVenue() : "Campus Main Center")
                  .append(" | Event Date: ").append(e.getEventDate() != null ? e.getEventDate().format(DATE_FORMATTER) : "TBD")
                  .append("\n");
            }
        }

        // Fetch student's winnings
        List<Winner> allWinners = winnerRepository.findAll();
        List<Winner> myWinnings = allWinners.stream()
                .filter(w -> w.getUsername() != null && w.getUsername().trim().equalsIgnoreCase(username))
                .collect(Collectors.toList());

        if (!myWinnings.isEmpty()) {
            sb.append("\n🏆 Your Winnings:\n");
            for (Winner w : myWinnings) {
                Optional<Event> evOpt = eventRepository.findById(w.getEventId());
                String eventName = evOpt.map(Event::getName).orElse("Event (" + w.getEventId() + ")");
                if (evOpt.isPresent()) {
                    sources.add(new SourceMetadata("WINNER", w.getId(), eventName + " Winner"));
                }
                sb.append("• ").append(eventName)
                  .append(" - Position: ").append(w.getPosition() != null ? w.getPosition().getDisplayName() : "Winner")
                  .append("\n");
            }
        }

        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getWinnersContext(String query) {
        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        List<Event> allEvents = eventRepository.findAll();

        Event matchedEvent = null;
        for (Event e : allEvents) {
            if (query.contains(e.getName().toLowerCase())) {
                matchedEvent = e;
                break;
            }
        }

        if (matchedEvent != null) {
            List<Winner> winners = winnerRepository.findByEventId(matchedEvent.getId());
            sources.add(new SourceMetadata("EVENT", matchedEvent.getId(), matchedEvent.getName()));
            if (winners.isEmpty()) {
                return new QueryResult("📌 Results for " + matchedEvent.getName() + ": Winners have not been announced yet.", sources);
            }
            sb.append("🏆 Winners for ").append(matchedEvent.getName()).append(":\n");
            for (Winner w : winners) {
                sources.add(new SourceMetadata("WINNER", w.getId(), matchedEvent.getName() + " - " + w.getPosition().getDisplayName()));
                sb.append("• ").append(w.getPosition().getDisplayName()).append(": ").append(w.getFullName()).append(" (").append(w.getUsername()).append(")\n");
            }
            return new QueryResult(sb.toString(), sources);
        }

        List<Winner> allWinners = winnerRepository.findAll();
        if (allWinners.isEmpty()) {
            return new QueryResult("No event winners have been announced yet in EventOrbit.", Collections.emptyList());
        }

        sb.append("🏆 Recently Announced Event Winners:\n");
        Map<String, List<Winner>> groupedByEvent = allWinners.stream()
                .collect(Collectors.groupingBy(Winner::getEventId));

        for (Map.Entry<String, List<Winner>> entry : groupedByEvent.entrySet()) {
            Optional<Event> evOpt = eventRepository.findById(entry.getKey());
            String eventName = evOpt.map(Event::getName).orElse("Event " + entry.getKey());
            if (evOpt.isPresent()) {
                sources.add(new SourceMetadata("EVENT", evOpt.get().getId(), eventName));
            }
            sb.append("\n📌 ").append(eventName).append(":\n");
            for (Winner w : entry.getValue()) {
                sb.append("  - ").append(w.getPosition() != null ? w.getPosition().getDisplayName() : "Winner")
                  .append(": ").append(w.getFullName()).append(" (").append(w.getUsername()).append(")\n");
            }
        }

        return new QueryResult(sb.toString(), sources);
    }

    private void appendEventDetails(StringBuilder sb, Event e) {
        LocalDateTime now = LocalDateTime.now();
        boolean isEnded = (e.getRegEnd() != null && e.getRegEnd().isBefore(now));

        String statusBadge = isEnded ? "🔴 Status: Ended / Closed" : "🟢 Status: Active / Registration Open";
        String regStartStr = (e.getRegStart() != null) ? e.getRegStart().format(DATE_FORMATTER) : "N/A";
        String regEndStr = (e.getRegEnd() != null) ? e.getRegEnd().format(DATE_FORMATTER) : "N/A";
        String eventDateStr = (e.getEventDate() != null) ? e.getEventDate().format(DATE_FORMATTER) : "TBD";
        String venueStr = (e.getVenue() != null && !e.getVenue().isBlank()) ? e.getVenue() : "Campus Main Center";
        String desc = (e.getDescription() != null) ? e.getDescription() : "No description provided.";

        sb.append("\n• Event Name: ").append(e.getName())
          .append("\n  - ").append(statusBadge)
          .append("\n  - Description: ").append(desc)
          .append("\n  - Venue: ").append(venueStr)
          .append("\n  - Event Date: ").append(eventDateStr)
          .append("\n  - Registration Period: ").append(regStartStr).append(" to ").append(regEndStr)
          .append("\n  - Category/Type: ").append(e.getType() != null ? e.getType() : "General")
          .append("\n");
    }

    private boolean isKeywordMatch(String query, String eventName) {
        String[] queryWords = query.split("\\s+");
        for (String w : queryWords) {
            if (w.length() >= 4 && eventName.contains(w)) {
                return true;
            }
        }
        return false;
    }
}
