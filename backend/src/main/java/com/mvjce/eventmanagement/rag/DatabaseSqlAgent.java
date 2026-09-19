package com.mvjce.eventmanagement.rag;

import com.mvjce.eventmanagement.dto.SourceMetadata;
import com.mvjce.eventmanagement.model.*;
import com.mvjce.eventmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
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
        return retrieveTargetedContext(query, authenticatedUsername, intent, matchedClub, matchedEvent, null);
    }

    public QueryResult retrieveTargetedContext(String query, String authenticatedUsername, QueryProcessor.Intent intent, String matchedClub, String matchedEvent, String targetDepartment) {
        StringBuilder context = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Calculate rolling 7-day window (NOW to NOW + 7 DAYS)
        LocalDateTime sevenDaysLater = now.plusDays(7);

        // 0. Personal Achievements / Winnings
        if (intent == QueryProcessor.Intent.MY_ACHIEVEMENTS) {
            return getStudentAchievementsContext(authenticatedUsername);
        }

        // 1. Private Student Data / Participation Queries (LEVEL 1)
        if (intent == QueryProcessor.Intent.PRIVATE_STUDENT_DATA) {
            return getStudentParticipationContext(authenticatedUsername);
        }

        // 2. Latest Event Winner Queries
        if (intent == QueryProcessor.Intent.LATEST_EVENT_WINNER) {
            return getLatestEventWinnerContext(targetDepartment);
        }

        // 3. Latest Winner Queries
        if (intent == QueryProcessor.Intent.LATEST_WINNER) {
            return getLatestWinnerContext(targetDepartment);
        }

        // 4. Winner Results & Event Participant Queries (LEVEL 2/3)
        if (intent == QueryProcessor.Intent.WINNERS) {
            QueryResult winnerResult = getWinnersContext(query, matchedEvent, targetDepartment);
            if (!winnerResult.getContext().isBlank()) {
                return winnerResult;
            }
        }

        // 5. This Week - Recommendations ("What should I register for this week?")
        if (intent == QueryProcessor.Intent.RECOMMENDED_REGISTRATIONS_THIS_WEEK) {
            return getRecommendedRegistrationsContext(authenticatedUsername, now, sevenDaysLater);
        }

        // 6. This Week - Registration Opening in the Next 7 Days
        if (intent == QueryProcessor.Intent.REGISTRATION_OPENING_THIS_WEEK) {
            return getRegistrationsOpeningThisWeekContext(now, sevenDaysLater);
        }

        // 7. This Week - Registration Closing in the Next 7 Days
        if (intent == QueryProcessor.Intent.REGISTRATION_CLOSING_THIS_WEEK) {
            return getRegistrationsClosingThisWeekContext(now, sevenDaysLater);
        }

        // 8. This Week - Calendar Discovery (Rolling 7-day 3-Section Discovery)
        if (intent == QueryProcessor.Intent.EVENTS_THIS_WEEK) {
            return getEventsThisWeekContext(now, sevenDaysLater);
        }

        // 9. Club Specific Events (LEVEL 2)
        if (intent == QueryProcessor.Intent.CLUB_EVENTS || matchedClub != null) {
            return getClubEventsContext(query, matchedClub, now);
        }

        // 10. Available Clubs List (LEVEL 3)
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

        // 11. Specific Event Detail (LEVEL 2)
        if (intent == QueryProcessor.Intent.EVENT_DETAIL || matchedEvent != null) {
            List<Event> allEvents = eventRepository.findAll();
            Event e = findBestMatchingEvent(allEvents, query, matchedEvent);
            if (e != null) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                context.append("📌 Event Information:\n");
                appendEventDetails(context, e);
                return new QueryResult(context.toString(), sources);
            }
        }

        // 12. Global Ended / Past Events (LEVEL 3)
        if (intent == QueryProcessor.Intent.EVENTS_ENDED) {
            return getEndedEventsContext(now);
        }

        // 13. Ongoing Events (LEVEL 3 - registration open and active right now)
        if (intent == QueryProcessor.Intent.EVENTS_ONGOING) {
            return getActiveEventsContext(now);
        }

        // 14. Upcoming Events (LEVEL 3 - scheduled in the future by actual eventDate)
        if (intent == QueryProcessor.Intent.EVENTS_UPCOMING) {
            return getUpcomingEventsContext(now);
        }

        // 15. All Active Events (LEVEL 3)
        if (intent == QueryProcessor.Intent.EVENTS_ACTIVE) {
            return getActiveEventsContext(now);
        }

        return new QueryResult("", Collections.emptyList());
    }

    private QueryResult getLatestEventWinnerContext(String targetDepartment) {
        List<Event> allEvents = eventRepository.findAll();
        List<Winner> allWinners = winnerRepository.findAll();
        if (allEvents.isEmpty() || allWinners.isEmpty()) {
            return new QueryResult("No declared winners are available for any completed event yet.", Collections.emptyList());
        }

        Map<String, List<Winner>> winnersByEvent = allWinners.stream()
                .collect(Collectors.groupingBy(Winner::getEventId));

        // Identify events that actually have declared winner records
        List<Event> eventsWithWinners = allEvents.stream()
                .filter(e -> winnersByEvent.containsKey(e.getId()) && !winnersByEvent.get(e.getId()).isEmpty())
                .sorted((a, b) -> {
                    LocalDateTime da = a.getEventDate() != null ? a.getEventDate() : (a.getRegEnd() != null ? a.getRegEnd() : (a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.MIN));
                    LocalDateTime db = b.getEventDate() != null ? b.getEventDate() : (b.getRegEnd() != null ? b.getRegEnd() : (b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.MIN));
                    return db.compareTo(da); // Newest eventDate first
                })
                .collect(Collectors.toList());

        if (eventsWithWinners.isEmpty()) {
            return new QueryResult("No declared winners are available for any completed event yet.", Collections.emptyList());
        }

        Event latestEventWithWinners = eventsWithWinners.get(0);
        List<Winner> eventWinners = winnersByEvent.get(latestEventWithWinners.getId());

        // Department-aware filtering if specified
        if (targetDepartment != null && !targetDepartment.isBlank()) {
            String normDept = UsnDepartmentResolver.normalizeDepartmentCode(targetDepartment);
            eventWinners = eventWinners.stream()
                    .filter(w -> {
                        String dept = UsnDepartmentResolver.resolveDepartment(w.getUsername());
                        return dept != null && dept.equalsIgnoreCase(normDept);
                    })
                    .collect(Collectors.toList());
            if (eventWinners.isEmpty()) {
                return new QueryResult("No winner records found for the " + normDept + " department in " + latestEventWithWinners.getName() + ".", Collections.emptyList());
            }
        }

        List<SourceMetadata> sources = new ArrayList<>();
        sources.add(new SourceMetadata("EVENT", latestEventWithWinners.getId(), latestEventWithWinners.getName()));

        StringBuilder sb = new StringBuilder();
        sb.append("🏆 Winners for the Latest Event (").append(latestEventWithWinners.getName()).append("):\n");
        for (Winner w : eventWinners) {
            sources.add(new SourceMetadata("WINNER", w.getId(), latestEventWithWinners.getName() + " - " + w.getPosition().getDisplayName()));
            sb.append("• ").append(w.getPosition().getDisplayName()).append(": ").append(w.getFullName()).append("\n");
        }

        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getLatestWinnerContext(String targetDepartment) {
        List<Winner> allWinners = winnerRepository.findAll();
        if (allWinners.isEmpty()) {
            return new QueryResult("No declared winner is available yet.", Collections.emptyList());
        }

        if (targetDepartment != null && !targetDepartment.isBlank()) {
            String normDept = UsnDepartmentResolver.normalizeDepartmentCode(targetDepartment);
            allWinners = allWinners.stream()
                    .filter(w -> {
                        String dept = UsnDepartmentResolver.resolveDepartment(w.getUsername());
                        return dept != null && dept.equalsIgnoreCase(normDept);
                    })
                    .collect(Collectors.toList());
            if (allWinners.isEmpty()) {
                return new QueryResult("No declared winner records are available for the " + normDept + " department.", Collections.emptyList());
            }
        }

        // Sort winners descending by createdAt timestamp
        List<Winner> sortedWinners = new ArrayList<>(allWinners);
        sortedWinners.sort((a, b) -> {
            LocalDateTime da = a.getCreatedAt() != null ? a.getCreatedAt() : (a.getUpdatedAt() != null ? a.getUpdatedAt() : LocalDateTime.MIN);
            LocalDateTime db = b.getCreatedAt() != null ? b.getCreatedAt() : (b.getUpdatedAt() != null ? b.getUpdatedAt() : LocalDateTime.MIN);
            return db.compareTo(da);
        });

        Winner latest = sortedWinners.get(0);
        Optional<Event> evOpt = eventRepository.findById(latest.getEventId());
        String eventName = evOpt.map(Event::getName).orElse("Event");

        List<SourceMetadata> sources = new ArrayList<>();
        if (evOpt.isPresent()) {
            sources.add(new SourceMetadata("EVENT", evOpt.get().getId(), eventName));
        }
        sources.add(new SourceMetadata("WINNER", latest.getId(), eventName + " - " + latest.getPosition().getDisplayName()));

        StringBuilder sb = new StringBuilder();
        sb.append("🏆 Latest Declared Winner:\n")
          .append("• Event: ").append(eventName).append("\n")
          .append("• Position: ").append(latest.getPosition().getDisplayName()).append("\n")
          .append("• Winner: ").append(latest.getFullName()).append("\n");

        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getEventsThisWeekContext(LocalDateTime now, LocalDateTime sevenDaysLater) {
        List<Event> allEvents = eventRepository.findAll();
        List<SourceMetadata> sources = new ArrayList<>();
        StringBuilder sb = new StringBuilder();

        // 1. Events happening in the next 7 days (actual eventDate within now -> now + 7 days)
        List<Event> happeningEvents = allEvents.stream()
                .filter(e -> !e.isResultPublished() && e.getEventDate() != null &&
                             !e.getEventDate().isBefore(now) && !e.getEventDate().isAfter(sevenDaysLater))
                .sorted(Comparator.comparing(Event::getEventDate))
                .collect(Collectors.toList());

        // 2. Registrations opening in the next 7 days
        List<Event> openingEvents = allEvents.stream()
                .filter(e -> e.getRegStart() != null &&
                             !e.getRegStart().isBefore(now) && !e.getRegStart().isAfter(sevenDaysLater))
                .sorted(Comparator.comparing(Event::getRegStart))
                .collect(Collectors.toList());

        // 3. Registrations closing in the next 7 days
        List<Event> closingEvents = allEvents.stream()
                .filter(e -> e.getRegEnd() != null &&
                             !e.getRegEnd().isBefore(now) && !e.getRegEnd().isAfter(sevenDaysLater))
                .sorted(Comparator.comparing(Event::getRegEnd))
                .collect(Collectors.toList());

        // Section 1
        sb.append("📅 Events Happening in the Next 7 Days:\n");
        if (happeningEvents.isEmpty()) {
            sb.append("No events are happening in the next 7 days.\n");
        } else {
            for (Event e : happeningEvents) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                appendEventDetails(sb, e);
            }
        }

        // Section 2
        sb.append("\n🟢 Registrations Opening in the Next 7 Days:\n");
        if (openingEvents.isEmpty()) {
            sb.append("No registrations are opening in the next 7 days.\n");
        } else {
            for (Event e : openingEvents) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                appendEventDetails(sb, e);
            }
        }

        // Section 3
        sb.append("\n🔴 Registrations Closing in the Next 7 Days:\n");
        if (closingEvents.isEmpty()) {
            sb.append("No registrations are closing in the next 7 days.\n");
        } else {
            for (Event e : closingEvents) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                appendEventDetails(sb, e);
            }
        }

        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getRegistrationsOpeningThisWeekContext(LocalDateTime now, LocalDateTime sevenDaysLater) {
        List<Event> allEvents = eventRepository.findAll();
        List<Event> openingEvents = allEvents.stream()
                .filter(e -> e.getRegStart() != null && !e.getRegStart().isBefore(now) && !e.getRegStart().isAfter(sevenDaysLater))
                .sorted(Comparator.comparing(Event::getRegStart))
                .collect(Collectors.toList());

        if (openingEvents.isEmpty()) {
            return new QueryResult("No event registrations are opening in the next 7 days.", Collections.emptyList());
        }

        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        sb.append("🟢 Event Registrations Opening in the Next 7 Days:\n");
        for (Event e : openingEvents) {
            sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
            appendEventDetails(sb, e);
        }

        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getRegistrationsClosingThisWeekContext(LocalDateTime now, LocalDateTime sevenDaysLater) {
        List<Event> allEvents = eventRepository.findAll();
        List<Event> closingEvents = allEvents.stream()
                .filter(e -> e.getRegEnd() != null && !e.getRegEnd().isBefore(now) && !e.getRegEnd().isAfter(sevenDaysLater))
                .sorted(Comparator.comparing(Event::getRegEnd))
                .collect(Collectors.toList());

        if (closingEvents.isEmpty()) {
            return new QueryResult("No event registrations are closing in the next 7 days.", Collections.emptyList());
        }

        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        sb.append("🔴 Event Registrations Closing in the Next 7 Days:\n");
        for (Event e : closingEvents) {
            sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
            appendEventDetails(sb, e);
        }

        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getRecommendedRegistrationsContext(String authenticatedUsername, LocalDateTime now, LocalDateTime sevenDaysLater) {
        List<Event> allEvents = eventRepository.findAll();
        List<Event> openEvents = allEvents.stream()
                .filter(e -> !e.isResultPublished() &&
                             (e.getRegStart() == null || !e.getRegStart().isAfter(now)) &&
                             (e.getRegEnd() == null || e.getRegEnd().isAfter(now)))
                .collect(Collectors.toList());

        if (authenticatedUsername != null && !authenticatedUsername.isBlank() && !authenticatedUsername.equalsIgnoreCase("anonymousUser")) {
            String uname = authenticatedUsername.trim();
            // Filter out events where the user is already registered individually or via team
            openEvents = openEvents.stream()
                    .filter(e -> {
                        boolean indivReg = (e.getRegistrations() != null && e.getRegistrations().stream().anyMatch(r -> r.getUsername() != null && r.getUsername().equalsIgnoreCase(uname)));
                        boolean teamReg = teamMemberRepository.existsByEventIdAndUserId(e.getId(), uname);
                        return !indivReg && !teamReg;
                    })
                    .collect(Collectors.toList());
        }

        if (openEvents.isEmpty()) {
            return new QueryResult("There are no open event registrations available for you to register at the moment.", Collections.emptyList());
        }

        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        sb.append("🎯 Recommended Events with Open Registration:\n");
        for (Event e : openEvents) {
            sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
            appendEventDetails(sb, e);
        }

        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getUpcomingEventsContext(LocalDateTime now) {
        List<Event> allEvents = eventRepository.findAll();

        // 1. Dated upcoming events: actual eventDate strictly in the future, and result not published
        List<Event> datedUpcoming = allEvents.stream()
                .filter(e -> !e.isResultPublished() && e.getEventDate() != null && e.getEventDate().isAfter(now))
                .sorted(Comparator.comparing(Event::getEventDate))
                .collect(Collectors.toList());

        // 2. TBD upcoming events: eventDate is null, and registration has not ended yet / result not published
        List<Event> tbdUpcoming = allEvents.stream()
                .filter(e -> !e.isResultPublished() && e.getEventDate() == null && (e.getRegEnd() == null || e.getRegEnd().isAfter(now)))
                .collect(Collectors.toList());

        if (datedUpcoming.isEmpty() && tbdUpcoming.isEmpty()) {
            return new QueryResult("There are no upcoming events at the moment.", Collections.emptyList());
        }

        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();

        if (!datedUpcoming.isEmpty()) {
            sb.append("📅 Upcoming Events:\n");
            for (Event e : datedUpcoming) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                appendEventDetails(sb, e);
            }
        }

        if (!tbdUpcoming.isEmpty()) {
            if (sb.length() > 0) sb.append("\n");
            sb.append("📌 Upcoming Events — Date TBD:\n");
            for (Event e : tbdUpcoming) {
                sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
                appendEventDetails(sb, e);
            }
        }

        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getEndedEventsContext(LocalDateTime now) {
        List<Event> allEvents = eventRepository.findAll();
        List<Event> endedEvents = allEvents.stream()
                .filter(e -> e.isResultPublished() ||
                             (e.getEventDate() != null && e.getEventDate().isBefore(now)) ||
                             (e.getEventDate() == null && e.getRegEnd() != null && e.getRegEnd().isBefore(now)))
                .sorted((a, b) -> {
                    LocalDateTime da = a.getEventDate() != null ? a.getEventDate() : (a.getRegEnd() != null ? a.getRegEnd() : LocalDateTime.MIN);
                    LocalDateTime db = b.getEventDate() != null ? b.getEventDate() : (b.getRegEnd() != null ? b.getRegEnd() : LocalDateTime.MIN);
                    return db.compareTo(da); // Newest ended first
                })
                .collect(Collectors.toList());

        if (endedEvents.isEmpty()) {
            return new QueryResult("No ended events were found.", Collections.emptyList());
        }

        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        sb.append("🔴 Ended / Past Events:\n");
        for (Event e : endedEvents) {
            sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
            appendEventDetails(sb, e);
        }
        return new QueryResult(sb.toString(), sources);
    }

    private QueryResult getActiveEventsContext(LocalDateTime now) {
        List<Event> allEvents = eventRepository.findAll();
        List<Event> activeEvents = allEvents.stream()
                .filter(e -> !e.isResultPublished() &&
                             (e.getRegStart() == null || !e.getRegStart().isAfter(now)) &&
                             (e.getRegEnd() == null || e.getRegEnd().isAfter(now)))
                .collect(Collectors.toList());

        if (activeEvents.isEmpty()) {
            return new QueryResult("No events are currently active.", Collections.emptyList());
        }

        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        sb.append("🟢 Active Events (Registration Currently Open):\n");
        for (Event e : activeEvents) {
            sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
            appendEventDetails(sb, e);
        }
        return new QueryResult(sb.toString(), sources);
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

        if (matchedClub == null) {
            return new QueryResult("I couldn't identify that club. Please specify the club name.", Collections.emptyList());
        }

        sources.add(new SourceMetadata("CLUB", matchedClub.getId(), matchedClub.getName()));
        List<Event> clubEvents = eventRepository.findByClubId(matchedClub.getId());

        if (clubEvents.isEmpty()) {
            return new QueryResult("No events were found for " + matchedClub.getName() + ".", sources);
        }

        sb.append("🏛️ Club: ").append(matchedClub.getName());
        if (matchedClub.getDescription() != null && !matchedClub.getDescription().isBlank()) {
            sb.append(" - ").append(matchedClub.getDescription());
        }
        sb.append("\n");

        boolean upcomingOnly = query.contains("upcoming") || query.contains("future") || query.contains("coming");
        boolean endedOnly = query.contains("ended") || query.contains("past") || query.contains("completed") || query.contains("concluded");
        boolean activeOnly = query.contains("active") || query.contains("ongoing") || query.contains("now");

        List<Event> filteredEvents;
        if (upcomingOnly) {
            filteredEvents = clubEvents.stream()
                    .filter(e -> (e.getEventDate() != null && e.getEventDate().isAfter(now)) ||
                                 (e.getEventDate() == null && e.getRegStart() != null && e.getRegStart().isAfter(now)))
                    .sorted(Comparator.comparing(e -> e.getEventDate() != null ? e.getEventDate() : (e.getRegStart() != null ? e.getRegStart() : LocalDateTime.MAX)))
                    .collect(Collectors.toList());
            if (filteredEvents.isEmpty()) {
                return new QueryResult("No upcoming events were found for " + matchedClub.getName() + ".", sources);
            }
            sb.append("\n📅 Upcoming Events:\n");
        } else if (endedOnly) {
            filteredEvents = clubEvents.stream()
                    .filter(e -> (e.getRegEnd() != null && e.getRegEnd().isBefore(now)) ||
                                 (e.getEventDate() != null && e.getEventDate().isBefore(now)) ||
                                 e.isResultPublished())
                    .collect(Collectors.toList());
            if (filteredEvents.isEmpty()) {
                return new QueryResult("No ended events were found for " + matchedClub.getName() + ".", sources);
            }
            sb.append("\n🔴 Past / Concluded Events:\n");
        } else if (activeOnly) {
            filteredEvents = clubEvents.stream()
                    .filter(e -> (e.getRegStart() == null || !e.getRegStart().isAfter(now)) &&
                                 (e.getRegEnd() == null || e.getRegEnd().isAfter(now)))
                    .collect(Collectors.toList());
            if (filteredEvents.isEmpty()) {
                return new QueryResult("No active events are currently running for " + matchedClub.getName() + ".", sources);
            }
            sb.append("\n🟢 Ongoing / Active Events:\n");
        } else {
            filteredEvents = clubEvents;
            sb.append("\n📅 Events:\n");
        }

        for (Event e : filteredEvents) {
            sources.add(new SourceMetadata("EVENT", e.getId(), e.getName()));
            appendEventDetails(sb, e);
        }

        return new QueryResult(sb.toString(), sources);
    }

    public QueryResult getStudentAchievementsContext(String authenticatedUsername) {
        if (authenticatedUsername == null || authenticatedUsername.isBlank() || authenticatedUsername.equalsIgnoreCase("anonymousUser")) {
            return new QueryResult("Please log in with your student account to view your achievements.", Collections.emptyList());
        }

        String username = authenticatedUsername.trim();
        List<Winner> myWinnings;
        try {
            myWinnings = winnerRepository.findByUsernameIgnoreCase(username);
        } catch (Exception e) {
            myWinnings = winnerRepository.findAll().stream()
                    .filter(w -> w.getUsername() != null && w.getUsername().trim().equalsIgnoreCase(username))
                    .collect(Collectors.toList());
        }

        if (myWinnings == null || myWinnings.isEmpty()) {
            return new QueryResult("You have no recorded winning achievements yet.", Collections.emptyList());
        }

        myWinnings = new ArrayList<>(myWinnings);
        myWinnings.sort((a, b) -> {
            if (a.getPosition() != null && b.getPosition() != null) {
                return a.getPosition().compareTo(b.getPosition());
            }
            return 0;
        });

        List<SourceMetadata> sources = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        sb.append("🏆 Your Achievements:\n\n");

        for (Winner w : myWinnings) {
            Optional<Event> evOpt = eventRepository.findById(w.getEventId());
            String eventName = evOpt.map(Event::getName).orElse("Event");
            String pos = (w.getPosition() != null) ? w.getPosition().getDisplayName() : "Winner";
            sources.add(new SourceMetadata("WINNER", w.getId(), eventName + " Winner"));
            sb.append("• ").append(eventName).append(" — ").append(pos).append("\n");
        }

        return new QueryResult(sb.toString().trim(), sources);
    }

    private QueryResult getStudentParticipationContext(String authenticatedUsername) {
        if (authenticatedUsername == null || authenticatedUsername.isBlank() || authenticatedUsername.equalsIgnoreCase("anonymousUser")) {
            return new QueryResult("Please log in with your student account to view your participation.", Collections.emptyList());
        }

        String username = authenticatedUsername.trim();
        List<TeamMember> myMemberships = teamMemberRepository.findByUserId(username);
        List<Event> allEvents = eventRepository.findAll();
        List<SourceMetadata> sources = new ArrayList<>();
        StringBuilder sb = new StringBuilder();

        // 1. Individual Registrations
        List<EventRegistration> individualRegs = new ArrayList<>();
        for (Event ev : allEvents) {
            if (ev.getRegistrations() != null) {
                for (EventRegistration reg : ev.getRegistrations()) {
                    if (reg.getUsername() != null && reg.getUsername().trim().equalsIgnoreCase(username)) {
                        individualRegs.add(reg);
                    }
                }
            }
        }

        boolean hasTeamRegs = (myMemberships != null && !myMemberships.isEmpty());
        boolean hasIndivRegs = !individualRegs.isEmpty();

        if (!hasTeamRegs && !hasIndivRegs) {
            return new QueryResult("You have not registered for or participated in any events yet.", Collections.emptyList());
        }

        sb.append("👤 Participation History for Student (").append(username).append("):\n");
        sb.append("📅 Registered Events:\n");

        for (EventRegistration reg : individualRegs) {
            Event ev = reg.getEvent();
            String eventName = ev != null ? ev.getName() : "Event";
            sources.add(new SourceMetadata("PARTICIPATION", reg.getId(), eventName + " Registration"));
            String dateStr = reg.getRegistrationTime() != null ? reg.getRegistrationTime().format(DATE_FORMATTER) : "N/A";
            sb.append("• ").append(eventName)
              .append(" [Type: Individual, Registered on: ").append(dateStr).append("]")
              .append("\n");
        }

        if (myMemberships != null) {
            for (TeamMember tm : myMemberships) {
                Team team = tm.getTeam();
                if (team != null && team.getEventId() != null) {
                    Optional<Event> evOpt = eventRepository.findById(team.getEventId());
                    String eventName = evOpt.map(Event::getName).orElse("Event");
                    if (evOpt.isPresent()) {
                        sources.add(new SourceMetadata("PARTICIPATION", tm.getId(), eventName + " Team Registration"));
                    }

                    String dateStr = tm.getJoinedAt() != null ? tm.getJoinedAt().format(DATE_FORMATTER) : "N/A";
                    sb.append("• ").append(eventName)
                      .append(" [Team: ").append(team.getTeamName() != null ? team.getTeamName() : "Solo")
                      .append(", Registered on: ").append(dateStr).append("]")
                      .append("\n");
                }
            }
        }
        sb.append("\nYou can view full details in the 'My Participation' tab.\n");

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

    private QueryResult getWinnersContext(String query, String matchedEventName, String targetDepartment) {
        StringBuilder sb = new StringBuilder();
        List<SourceMetadata> sources = new ArrayList<>();
        List<Event> allEvents = eventRepository.findAll();

        Event matchedEvent = findBestMatchingEvent(allEvents, query, matchedEventName);

        // 1. Department-Specific Winner Queries (e.g. "What has CS won?", "What did CS win in Hackathon2026?")
        if (targetDepartment != null && !targetDepartment.isBlank()) {
            String normDept = UsnDepartmentResolver.normalizeDepartmentCode(targetDepartment);
            if (normDept == null) {
                // If department is unrecognized or uncertain, never do semantic fallback or broad dump
                return new QueryResult("No winner records are available for the specified department.", Collections.emptyList());
            }

            // Case A: Event + Department (e.g. "What did CS win in Hackathon2026?")
            if (matchedEvent != null) {
                List<Winner> eventWinners = winnerRepository.findByEventId(matchedEvent.getId());
                List<Winner> deptEventWinners = eventWinners.stream()
                        .filter(w -> w.getUsername() != null && UsnDepartmentResolver.matchesDepartment(w.getUsername(), normDept))
                        .collect(Collectors.toList());

                sources.add(new SourceMetadata("EVENT", matchedEvent.getId(), matchedEvent.getName()));
                if (deptEventWinners.isEmpty()) {
                    return new QueryResult("No winner records found for the " + normDept + " department in " + matchedEvent.getName() + ".", sources);
                }

                sb.append("🏆 Winners from ").append(normDept).append(" Department for ").append(matchedEvent.getName()).append(":\n");
                for (Winner w : deptEventWinners) {
                    sources.add(new SourceMetadata("WINNER", w.getId(), matchedEvent.getName() + " - " + w.getPosition().getDisplayName()));
                    sb.append("• ").append(w.getPosition().getDisplayName()).append(": ").append(w.getFullName()).append("\n");
                }
                return new QueryResult(sb.toString(), sources);
            }

            // Case B: Department-Only Query (e.g. "What has CS won?", "What are the winnings of CS?")
            List<Winner> allWinners = winnerRepository.findAll();
            for (Winner w : allWinners) {
                String resolvedDept = UsnDepartmentResolver.resolveDepartment(w.getUsername());
                System.out.println("[Winner USN Resolution] " + w.getUsername() + " → " + resolvedDept + " (Target: " + normDept + ")");
            }
            List<Winner> deptWinners = allWinners.stream()
                    .filter(w -> w.getUsername() != null && UsnDepartmentResolver.matchesDepartment(w.getUsername(), normDept))
                    .collect(Collectors.toList());

            if (deptWinners.isEmpty()) {
                return new QueryResult("No winner records are available for the " + normDept + " department.", Collections.emptyList());
            }

            sb.append("🏆 Official Winners from ").append(normDept).append(" Department:\n");
            Map<String, List<Winner>> winnersByEvent = deptWinners.stream().collect(Collectors.groupingBy(Winner::getEventId));
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

        // 2. Event-Only Winner Queries (e.g. "Who won Hackathon2026?")
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

        // 3. Ambiguous queries with neither Event nor Department are blocked from dumping all winners
        return new QueryResult("", Collections.emptyList());
    }

    private void appendEventDetails(StringBuilder sb, Event e) {
        LocalDateTime now = LocalDateTime.now();

        // Distinct Event Lifecycle Status
        String eventStatus;
        if (e.isResultPublished() || (e.getEventDate() != null && e.getEventDate().isBefore(now))) {
            eventStatus = "Ended";
        } else if (e.getEventDate() != null && e.getEventDate().isAfter(now)) {
            eventStatus = "Upcoming";
        } else if (e.getEventDate() != null && e.getEventDate().isEqual(now)) {
            eventStatus = "Ongoing";
        } else {
            eventStatus = "Date TBD";
        }

        // Distinct Registration Status
        String regStatus;
        if (e.getRegEnd() != null && e.getRegEnd().isBefore(now)) {
            regStatus = "Closed";
        } else if (e.getRegStart() != null && e.getRegStart().isAfter(now)) {
            regStatus = "Not Open Yet (Opens: " + e.getRegStart().format(DATE_FORMATTER) + ")";
        } else {
            regStatus = "Open";
        }

        String regStartStr = (e.getRegStart() != null) ? e.getRegStart().format(DATE_FORMATTER) : "N/A";
        String regEndStr = (e.getRegEnd() != null) ? e.getRegEnd().format(DATE_FORMATTER) : "N/A";
        String eventDateStr = (e.getEventDate() != null) ? e.getEventDate().format(DATE_FORMATTER) : "TBD";
        String venueStr = (e.getVenue() != null && !e.getVenue().isBlank()) ? e.getVenue() : "Campus Main Center";
        String desc = (e.getDescription() != null) ? e.getDescription() : "No description provided.";

        sb.append("\n• Event Name: ").append(e.getName())
          .append("\n  - Event Date: ").append(eventDateStr)
          .append("\n  - Event Status: ").append(eventStatus)
          .append("\n  - Registration Status: ").append(regStatus)
          .append("\n  - Venue: ").append(venueStr)
          .append("\n  - Registration Period: ").append(regStartStr).append(" to ").append(regEndStr)
          .append("\n  - Description: ").append(desc)
          .append("\n  - Category/Type: ").append(e.getType() != null ? e.getType() : "General")
          .append("\n");
    }

    private Event findBestMatchingEvent(List<Event> allEvents, String query, String matchedEventName) {
        if (allEvents == null || allEvents.isEmpty()) return null;

        // Priority 0: Explicit matchedEventName exact match
        if (matchedEventName != null && !matchedEventName.isBlank()) {
            for (Event e : allEvents) {
                if (e.getName().equalsIgnoreCase(matchedEventName.trim())) {
                    return e;
                }
            }
        }

        if (query == null || query.isBlank()) return null;
        String normQuery = query.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").replaceAll("\\s+", " ").trim();

        // Sort descending by name length so specific full names (e.g. "IExample2026") take priority over substrings ("Examp")
        List<Event> sorted = new ArrayList<>(allEvents);
        sorted.sort((a, b) -> Integer.compare(b.getName().length(), a.getName().length()));

        // Priority 1: Exact full-name match with word boundary
        for (Event e : sorted) {
            String normName = e.getName().toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
            if (!normName.isEmpty()) {
                if (normQuery.equals(normName) || normQuery.matches(".*\\b" + Pattern.quote(normName) + "\\b.*")) {
                    return e;
                }
            }
        }

        // Priority 2: Full name substring match
        for (Event e : sorted) {
            String normName = e.getName().toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
            if (!normName.isEmpty() && normQuery.contains(normName)) {
                return e;
            }
        }

        // Priority 3: Multi-word exact token match
        for (Event e : sorted) {
            String[] words = e.getName().toLowerCase().split("\\s+");
            if (words.length > 1) {
                boolean allFound = true;
                for (String w : words) {
                    String cleanW = w.replaceAll("[^a-zA-Z0-9]", "");
                    if (cleanW.length() >= 4 && !normQuery.matches(".*\\b" + Pattern.quote(cleanW) + "\\b.*")) {
                        allFound = false;
                        break;
                    }
                }
                if (allFound) {
                    return e;
                }
            }
        }

        // Priority 4: Safe heuristic fallback
        for (Event e : sorted) {
            String normName = e.getName().toLowerCase();
            if (normName.contains("hack") && normQuery.matches(".*\\b(hackathon2026|hackathon|hackthon)\\b.*")) {
                return e;
            }
        }

        return null;
    }
}
