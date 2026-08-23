package com.mvjce.eventmanagement.rag;

import com.mvjce.eventmanagement.dto.SourceMetadata;
import com.mvjce.eventmanagement.model.*;
import com.mvjce.eventmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DatabaseSqlAgent {

    public static class QueryResult {
        private final String context;
        private final List<SourceMetadata> sources;

        public QueryResult(String context, List<SourceMetadata> sources) {
            this.context = context != null ? context : "";
            this.sources = sources != null ? sources : Collections.emptyList();
        }

        public String getContext() { return context; }
        public List<SourceMetadata> getSources() { return sources; }
    }

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private WinnerRepository winnerRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public QueryResult retrieveTargetedContext(String query, String authenticatedUsername, QueryProcessor.Intent intent, String matchedClub, String matchedEvent) {
        StringBuilder context = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // 1. Private Student Data Queries (LEVEL 1)
        if (intent == QueryProcessor.Intent.PRIVATE_STUDENT_DATA) {
            return getStudentParticipationContext(authenticatedUsername);
        }

        // 2. Winner Results & Event Participant Queries (LEVEL 2/3)
        if (intent == QueryProcessor.Intent.WINNERS || (matchedEvent != null && (query.contains("participat") || query.contains("who")))) {
            QueryResult winnerResult = getWinnersContext(query, matchedEvent);
            if (!winnerResult.getContext().isBlank()) {
                return winnerResult;
            }
        }

        // 3. Club Specific Events (LEVEL 2)
        if (intent == QueryProcessor.Intent.CLUB_EVENTS || matchedClub != null) {
            QueryResult clubResult = getClubEventsContext(query, matchedClub, now);
            if (!clubResult.getContext().isBlank()) {
                return clubResult;
            }
        }

        // 4. Available Clubs List (LEVEL 3)
        if (intent == QueryProcessor.Intent.CLUBS_LIST) {
            List<Club> allClubs = clubRepository.findAll();
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

        // 5. Specific Event Detail (LEVEL 2)
        if (intent == QueryProcessor.Intent.EVENT_DETAIL || matchedEvent != null) {
            List<Event> allEvents = eventRepository.findAll();
            for (Event e : allEvents) {
                if (matchedEvent != null && e.getName().equalsIgnoreCase(matchedEvent) ||
                        query.contains(e.getName().toLowerCase()) || isKeywordMatch(query, e.getName().toLowerCase())) {
                    sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                    context.append("📌 Event Information:\n");
                    appendEventDetails(context, e);
                    return new QueryResult(context.toString(), sources);
                }
            }
        }

        // 6. Global Ended / Past Events (LEVEL 3)
        if (intent == QueryProcessor.Intent.EVENTS_ENDED) {
            List<Event> allEvents = eventRepository.findAll();
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

        // 7. Active / Upcoming Events (LEVEL 3)
        if (intent == QueryProcessor.Intent.EVENTS_ACTIVE) {
            List<Event> allEvents = eventRepository.findAll();
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

    private QueryResult getClubEventsContext(String query, String matchedClubName, LocalDateTime now) {
        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        List<Club> allClubs = clubRepository.findAll();

        Club matchedClub = null;
        for (Club c : allClubs) {
            if ((matchedClubName != null && c.getName().equalsIgnoreCase(matchedClubName)) ||
                    query.contains(c.getName().toLowerCase()) ||
                    c.getName().toLowerCase().contains(query.replace("events", "").replace("club", "").trim())) {
                matchedClub = c;
                break;
            }
        }

        if (matchedClub != null) {
            sources.add(new SourceMetadata("CLUB", matchedClub.getId(), matchedClub.getName()));
            List<Event> clubEvents = eventRepository.findByClubId(matchedClub.getId());

            sb.append("🏛️ Club: ").append(matchedClub.getName());
            if (matchedClub.getDescription() != null && !matchedClub.getDescription().isBlank()) {
                sb.append(" - ").append(matchedClub.getDescription());
            }
            sb.append("\n");

            if (clubEvents.isEmpty()) {
                sb.append("There are currently no events registered for ").append(matchedClub.getName()).append(".\n");
                return new QueryResult(sb.toString(), sources);
            }

            List<Event> ongoingEvents = clubEvents.stream()
                    .filter(e -> e.getRegEnd() == null || e.getRegEnd().isAfter(now))
                    .collect(Collectors.toList());

            List<Event> pastEvents = clubEvents.stream()
                    .filter(e -> e.getRegEnd() != null && e.getRegEnd().isBefore(now))
                    .collect(Collectors.toList());

            if (!ongoingEvents.isEmpty()) {
                sb.append("\n🟢 Ongoing / Upcoming Events:\n");
                for (Event e : ongoingEvents) {
                    sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                    appendEventDetails(sb, e);
                }
            }

            if (!pastEvents.isEmpty()) {
                sb.append("\n🔴 Past / Concluded Events:\n");
                for (Event e : pastEvents) {
                    sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                    appendEventDetails(sb, e);
                }
            }

            return new QueryResult(sb.toString(), sources);
        }

        return new QueryResult("", Collections.emptyList());
    }

    private QueryResult getStudentParticipationContext(String authenticatedUsername) {
        if (authenticatedUsername == null || authenticatedUsername.isBlank() || authenticatedUsername.equalsIgnoreCase("anonymousUser")) {
            return new QueryResult("Please log in with your student account to view your event registrations and winnings.", Collections.emptyList());
        }

        String username = authenticatedUsername.trim();
        List<TeamMember> myMemberships = teamMemberRepository.findByUserId(username);
        List<SourceMetadata> sources = new ArrayList<>();
        StringBuilder sb = new StringBuilder();

        sb.append("👤 Participation History for Student (").append(username).append("):\n");

        if (myMemberships == null || myMemberships.isEmpty()) {
            sb.append("You have not registered for any events yet in EventOrbit.\n");
        } else {
            sb.append("📅 Registered Events:\n");
            for (TeamMember tm : myMemberships) {
                Team team = tm.getTeam();
                if (team != null && team.getEventId() != null) {
                    Optional<Event> evOpt = eventRepository.findById(team.getEventId());
                    String eventName = evOpt.map(Event::getName).orElse("Event");
                    if (evOpt.isPresent()) {
                        sources.add(new SourceMetadata("PARTICIPATION", tm.getId(), eventName + " Registration"));
                    }

                    String dateStr = tm.getJoinedAt() != null ? tm.getJoinedAt().format(DATE_FORMATTER) : "N/A";
                    sb.append("• ").append(eventName)
                      .append(" [Team: ").append(team.getTeamName() != null ? team.getTeamName() : "Solo")
                      .append(", Registered on: ").append(dateStr).append("]")
                      .append("\n");
                }
            }
            sb.append("\nYou can view details in the 'My Participation' tab.\n");
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

    private QueryResult getWinnersContext(String query, String matchedEventName) {
        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        List<Event> allEvents = eventRepository.findAll();

        Event matchedEvent = null;
        for (Event e : allEvents) {
            if ((matchedEventName != null && e.getName().equalsIgnoreCase(matchedEventName)) ||
                    query.contains(e.getName().toLowerCase()) ||
                    isKeywordMatch(query, e.getName().toLowerCase())) {
                matchedEvent = e;
                break;
            }
        }

        if (matchedEvent != null) {
            List<Winner> winners = winnerRepository.findByEventId(matchedEvent.getId());
            sources.add(new SourceMetadata("EVENT", matchedEvent.getId(), matchedEvent.getName()));
            if (winners.isEmpty()) {
                return new QueryResult("📌 Results for " + matchedEvent.getName() + ": Winners have not been announced yet. (Note: Participant rosters are private to protect student privacy).", sources);
            }
            sb.append("🏆 Winners for ").append(matchedEvent.getName()).append(":\n");
            for (Winner w : winners) {
                sources.add(new SourceMetadata("WINNER", w.getId(), matchedEvent.getName() + " - " + w.getPosition().getDisplayName()));
                // Strictly DO NOT expose student USNs in public winner responses
                sb.append("• ").append(w.getPosition().getDisplayName()).append(": ").append(w.getFullName()).append("\n");
            }
            return new QueryResult(sb.toString(), sources);
        }

        List<Winner> allWinners = winnerRepository.findAll();
        if (allWinners.isEmpty()) {
            return new QueryResult("No event winners have been announced yet in EventOrbit.", Collections.emptyList());
        }

        sb.append("🏆 Official EventOrbit Winners Podium:\n");
        Map<String, List<Winner>> winnersByEvent = allWinners.stream().collect(Collectors.groupingBy(Winner::getEventId));
        for (Map.Entry<String, List<Winner>> entry : winnersByEvent.entrySet()) {
            Optional<Event> evOpt = eventRepository.findById(entry.getKey());
            String eventName = evOpt.map(Event::getName).orElse("Event (" + entry.getKey() + ")");
            sb.append("\n• Event: ").append(eventName).append("\n");
            for (Winner w : entry.getValue()) {
                sources.add(new SourceMetadata("WINNER", w.getId(), eventName + " - " + w.getPosition().getDisplayName()));
                sb.append("  - ").append(w.getPosition().getDisplayName()).append(": ").append(w.getFullName()).append("\n");
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
            if (w.length() >= 4 && (eventName.contains(w) || (w.length() >= 6 && eventName.contains(w.substring(0, 5))))) {
                return true;
            }
            if (w.startsWith("hack") && eventName.contains("hack")) {
                return true;
            }
        }
        return false;
    }
}
