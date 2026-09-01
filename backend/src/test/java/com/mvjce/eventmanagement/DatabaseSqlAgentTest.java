package com.mvjce.eventmanagement;

import com.mvjce.eventmanagement.model.Club;
import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.Winner;
import com.mvjce.eventmanagement.rag.DatabaseSqlAgent;
import com.mvjce.eventmanagement.rag.QueryProcessor;
import com.mvjce.eventmanagement.rag.UsnDepartmentResolver;
import com.mvjce.eventmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class DatabaseSqlAgentTest {

    @InjectMocks
    private DatabaseSqlAgent databaseSqlAgent;

    @Mock
    private WinnerRepository winnerRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private ClubRepository clubRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    private Event hackathon;
    private Event robowars;

    private Winner winnerCs;
    private Winner winnerCg;
    private Winner winnerEc;
    private Winner winnerMe;

    @BeforeEach
    void setUp() {
        hackathon = new Event();
        hackathon.setId("EV-HACK");
        hackathon.setName("Hackathon2026");

        robowars = new Event();
        robowars.setId("EV-ROBO");
        robowars.setName("RoboWars");

        when(eventRepository.findAll()).thenReturn(List.of(hackathon, robowars));
        when(eventRepository.findById("EV-HACK")).thenReturn(Optional.of(hackathon));
        when(eventRepository.findById("EV-ROBO")).thenReturn(Optional.of(robowars));

        // Test winners with validated department USNs
        winnerCs = new Winner("EV-HACK", "CLUB-1", "1MJ23CS200", "Darshan CS", "cs@mvjce.edu.in", "9999999991", Winner.Position.FIRST);
        winnerCg = new Winner("EV-HACK", "CLUB-1", "1MJ23CG011", "Priya CG", "cg@mvjce.edu.in", "9999999992", Winner.Position.SECOND);
        winnerEc = new Winner("EV-ROBO", "CLUB-2", "1MJ24EC163", "Rahul EC", "ec@mvjce.edu.in", "9999999993", Winner.Position.FIRST);
        winnerMe = new Winner("EV-ROBO", "CLUB-2", "1MJ21ME409", "Vikram ME", "me@mvjce.edu.in", "9999999994", Winner.Position.SECOND);

        when(winnerRepository.findAll()).thenReturn(List.of(winnerCs, winnerCg, winnerEc, winnerMe));
        when(winnerRepository.findByEventId("EV-HACK")).thenReturn(List.of(winnerCs, winnerCg));
        when(winnerRepository.findByEventId("EV-ROBO")).thenReturn(List.of(winnerEc, winnerMe));
    }

    @Test
    @DisplayName("1. UsnDepartmentResolver correctly resolves all project USN formats and rejects invalid USNs")
    void testUsnDepartmentResolver() {
        assertEquals("CS", UsnDepartmentResolver.resolveDepartment("1MJ23CS200"));
        assertEquals("CG", UsnDepartmentResolver.resolveDepartment("1MJ23CG011"));
        assertEquals("CD", UsnDepartmentResolver.resolveDepartment("1MJ25CD400"));
        assertEquals("EC", UsnDepartmentResolver.resolveDepartment("1MJ24EC163"));
        assertEquals("ME", UsnDepartmentResolver.resolveDepartment("1MJ21ME409"));
        assertEquals("IS", UsnDepartmentResolver.resolveDepartment("1MJ45IS890"));

        // Case-insensitivity & whitespace trimming
        assertEquals("CS", UsnDepartmentResolver.resolveDepartment("  1mj23cs200  "));

        // Invalid USNs
        assertNull(UsnDepartmentResolver.resolveDepartment("invalidUser"));
        assertNull(UsnDepartmentResolver.resolveDepartment("anonymousUser"));
        assertNull(UsnDepartmentResolver.resolveDepartment("1MJ999999"));
        assertNull(UsnDepartmentResolver.resolveDepartment(""));
        assertNull(UsnDepartmentResolver.resolveDepartment(null));
    }

    @Test
    @DisplayName("2. Department winner query for CS returns ONLY CS winners and ZERO CG/EC winners")
    void testCsDepartmentWinnerIsolation() {
        DatabaseSqlAgent.QueryResult res = databaseSqlAgent.retrieveTargetedContext(
                "what has CS won", "anonymousUser", QueryProcessor.Intent.WINNERS, null, null, "CS");

        assertNotNull(res);
        String context = res.getContext();

        // Must contain CS winner
        assertTrue(context.contains("Darshan CS"), "Must contain CS winner: " + context);

        // Must NOT contain CG, EC, or ME winners
        assertFalse(context.contains("Priya CG"), "Contamination: CS query contained CG winner!");
        assertFalse(context.contains("Rahul EC"), "Contamination: CS query contained EC winner!");
        assertFalse(context.contains("Vikram ME"), "Contamination: CS query contained ME winner!");

        // Must NOT expose student USN
        assertFalse(context.contains("1MJ23CS200"), "Must NOT expose student USN!");
    }

    @Test
    @DisplayName("3. Department winner query for CG returns ONLY CG winners and ZERO CS/EC winners")
    void testCgDepartmentWinnerIsolation() {
        DatabaseSqlAgent.QueryResult res = databaseSqlAgent.retrieveTargetedContext(
                "what has CG won", "anonymousUser", QueryProcessor.Intent.WINNERS, null, null, "CG");

        assertNotNull(res);
        String context = res.getContext();

        // Must contain CG winner
        assertTrue(context.contains("Priya CG"), "Must contain CG winner: " + context);

        // Must NOT contain CS, EC, or ME winners
        assertFalse(context.contains("Darshan CS"), "Contamination: CG query contained CS winner!");
        assertFalse(context.contains("Rahul EC"), "Contamination: CG query contained EC winner!");
        assertFalse(context.contains("Vikram ME"), "Contamination: CG query contained ME winner!");
    }

    @Test
    @DisplayName("4. Event + Department query applies BOTH filters (CS in Hackathon2026)")
    void testEventAndDepartmentFiltering() {
        DatabaseSqlAgent.QueryResult res = databaseSqlAgent.retrieveTargetedContext(
                "what did CS win in Hackathon2026", "anonymousUser", QueryProcessor.Intent.WINNERS, null, "Hackathon2026", "CS");

        assertNotNull(res);
        String context = res.getContext();

        // Must contain Hackathon CS winner
        assertTrue(context.contains("Darshan CS"));
        // Must NOT contain Hackathon CG winner
        assertFalse(context.contains("Priya CG"));
        // Must NOT contain RoboWars winners
        assertFalse(context.contains("Rahul EC"));
    }

    @Test
    @DisplayName("5. Department with no winners returns grounded no-record response with ZERO cross-department fallback")
    void testNoCrossDepartmentFallback() {
        DatabaseSqlAgent.QueryResult res = databaseSqlAgent.retrieveTargetedContext(
                "what has CD won", "anonymousUser", QueryProcessor.Intent.WINNERS, null, null, "CD");

        assertNotNull(res);
        String context = res.getContext();

        // Must state no records available for CD
        assertTrue(context.toLowerCase().contains("no winner records are available for the cd department"));

        // Must NEVER return CS, CG, EC, or ME winners as fallback
        assertFalse(context.contains("Darshan CS"));
        assertFalse(context.contains("Priya CG"));
        assertFalse(context.contains("Rahul EC"));
        assertFalse(context.contains("Vikram ME"));
        assertTrue(res.getSources().isEmpty());
    }

    @Test
    @DisplayName("6. Unrecognized or uncertain department returns grounded unavailable message without dumping database")
    void testUnrecognizedDepartmentNoDump() {
        DatabaseSqlAgent.QueryResult res = databaseSqlAgent.retrieveTargetedContext(
                "what has XYZ won", "anonymousUser", QueryProcessor.Intent.WINNERS, null, null, "XYZ");

        assertNotNull(res);
        String context = res.getContext();

        assertTrue(context.contains("No winner records are available for the specified department."));
        assertFalse(context.contains("Darshan CS"));
        assertFalse(context.contains("Priya CG"));
        assertTrue(res.getSources().isEmpty());
    }

    @Test
    @DisplayName("7. Exact Event Matching Priority: IExample2026 must resolve to IExample2026 and not be overridden by Examp substring")
    void testExactEventMatchingPriorityIExampleVsExamp() {
        Event examp = new Event();
        examp.setId("EV-EXAMP");
        examp.setName("Examp");

        Event iexample = new Event();
        iexample.setId("EV-IEXAMPLE");
        iexample.setName("IExample2026");

        Event musicConcert = new Event();
        musicConcert.setId("EV-MUSIC");
        musicConcert.setName("Music Concert");

        Winner vigneshCs = new Winner("EV-IEXAMPLE", "CLUB-1", "1MJ23CS101", "vignesh", "vignesh@mvjce.edu.in", "9999999995", Winner.Position.FIRST);
        Winner priyaCg = new Winner("EV-MUSIC", "CLUB-1", "1MJ23CG011", "Priya CG", "priya@mvjce.edu.in", "9999999992", Winner.Position.SECOND);

        when(eventRepository.findAll()).thenReturn(List.of(examp, iexample, musicConcert));
        when(eventRepository.findById("EV-EXAMP")).thenReturn(Optional.of(examp));
        when(eventRepository.findById("EV-IEXAMPLE")).thenReturn(Optional.of(iexample));
        when(eventRepository.findById("EV-MUSIC")).thenReturn(Optional.of(musicConcert));

        when(winnerRepository.findByEventId("EV-IEXAMPLE")).thenReturn(List.of(vigneshCs));
        when(winnerRepository.findByEventId("EV-MUSIC")).thenReturn(List.of(priyaCg));
        when(winnerRepository.findByEventId("EV-EXAMP")).thenReturn(Collections.emptyList());

        // Test 1: "What has CS won in IExample2026?" -> Resolves to IExample2026 (NOT Examp), returns vignesh
        DatabaseSqlAgent.QueryResult res1 = databaseSqlAgent.retrieveTargetedContext(
                "What has CS won in IExample2026?", "anonymousUser", QueryProcessor.Intent.WINNERS, null, null, "CS");
        assertNotNull(res1);
        String context1 = res1.getContext();
        assertTrue(context1.contains("IExample2026"), "Must match IExample2026, got: " + context1);
        assertTrue(context1.contains("vignesh"), "Must contain vignesh: " + context1);
        assertFalse(context1.contains("Examp."), "Must not resolve to Examp!");

        // Test 2: "What has CG won in IExample2026?" -> No CG winners in IExample2026, must not return Music Concert CG winner
        DatabaseSqlAgent.QueryResult res2 = databaseSqlAgent.retrieveTargetedContext(
                "What has CG won in IExample2026?", "anonymousUser", QueryProcessor.Intent.WINNERS, null, null, "CG");
        assertNotNull(res2);
        String context2 = res2.getContext();
        assertTrue(context2.contains("No winner records found for the CG department in IExample2026."));
        assertFalse(context2.contains("Priya CG"), "Contamination: Music Concert CG winner returned for IExample2026!");

        // Test 3: "What has CS won in Music Concert?" -> No CS winners in Music Concert, must not return IExample2026 CS winner
        DatabaseSqlAgent.QueryResult res3 = databaseSqlAgent.retrieveTargetedContext(
                "What has CS won in Music Concert?", "anonymousUser", QueryProcessor.Intent.WINNERS, null, null, "CS");
        assertNotNull(res3);
        String context3 = res3.getContext();
        assertTrue(context3.contains("No winner records found for the CS department in Music Concert."));
        assertFalse(context3.contains("vignesh"), "Contamination: IExample2026 CS winner returned for Music Concert!");
    }

    @Test
    @DisplayName("8. Event Lifecycle: Upcoming dated in chronological order, TBD separate, and ended excluded")
    void testEventLifecycleStatus() {
        LocalDateTime now = LocalDateTime.now();

        Event upcomingNear = new Event();
        upcomingNear.setId("EV-NEAR");
        upcomingNear.setName("AI Summit Early");
        upcomingNear.setEventDate(now.plusDays(5));
        upcomingNear.setRegStart(now.minusDays(2));
        upcomingNear.setRegEnd(now.plusDays(4));

        Event upcomingFar = new Event();
        upcomingFar.setId("EV-FAR");
        upcomingFar.setName("Tech Conference Late");
        upcomingFar.setEventDate(now.plusDays(25));
        upcomingFar.setRegStart(now.plusDays(10));
        upcomingFar.setRegEnd(now.plusDays(20));

        Event tbdEvent = new Event();
        tbdEvent.setId("EV-TBD");
        tbdEvent.setName("Examp TBD Event");
        tbdEvent.setEventDate(null); // Date TBD
        tbdEvent.setRegStart(now.plusDays(1));
        tbdEvent.setRegEnd(now.plusDays(10));

        Event endedEv = new Event();
        endedEv.setId("EV-ENDED");
        endedEv.setName("Past Coding Clash");
        endedEv.setEventDate(now.minusDays(10));
        endedEv.setRegEnd(now.minusDays(11));
        endedEv.setResultPublished(true);

        when(eventRepository.findAll()).thenReturn(List.of(upcomingFar, tbdEvent, upcomingNear, endedEv));

        // 1. Upcoming events: dated events first in ascending chronological order, TBD separate, ended omitted
        DatabaseSqlAgent.QueryResult upcomingRes = databaseSqlAgent.retrieveTargetedContext(
                "Show upcoming events", "anonymousUser", QueryProcessor.Intent.EVENTS_UPCOMING, null, null);
        String upContext = upcomingRes.getContext();
        assertTrue(upContext.contains("AI Summit Early"));
        assertTrue(upContext.contains("Tech Conference Late"));
        assertTrue(upContext.contains("📌 Upcoming Events — Date TBD:"));
        assertTrue(upContext.contains("Examp TBD Event"));
        assertTrue(upContext.contains("Event Date: TBD"));
        assertFalse(upContext.contains("Past Coding Clash"), "Ended event must not appear in upcoming events!");

        // Verify chronological order of dated events
        int idxNear = upContext.indexOf("AI Summit Early");
        int idxFar = upContext.indexOf("Tech Conference Late");
        assertTrue(idxNear < idxFar, "Upcoming dated events must be sorted chronologically ascending!");

        // 2. Ended events
        DatabaseSqlAgent.QueryResult endedRes = databaseSqlAgent.retrieveTargetedContext(
                "Which events are ended?", "anonymousUser", QueryProcessor.Intent.EVENTS_ENDED, null, null);
        assertTrue(endedRes.getContext().contains("Past Coding Clash"));
        assertFalse(endedRes.getContext().contains("AI Summit Early"));
    }

    @Test
    @DisplayName("9. Rolling 7-Day Window: 3 Independent Sections, Next-Month Event Exclusion, Multi-Section Legitimacy")
    void testRollingSevenDayDiscovery() {
        LocalDateTime now = LocalDateTime.now();

        // Event A: Happens in 3 days, registration closes in 2 days (happening + closing)
        Event eventA = new Event();
        eventA.setId("EV-A");
        eventA.setName("Hackathon This Week");
        eventA.setEventDate(now.plusDays(3));
        eventA.setRegStart(now.minusDays(2));
        eventA.setRegEnd(now.plusDays(2)); // closing in 2 days

        // Event B: Happens next month, registration opens in 4 days (opening only, NOT happening)
        Event eventB = new Event();
        eventB.setId("EV-B");
        eventB.setName("RoboWars Next Month");
        eventB.setEventDate(now.plusDays(35)); // next month
        eventB.setRegStart(now.plusDays(4));   // opening in 4 days
        eventB.setRegEnd(now.plusDays(20));

        // Event C: Happens next month, registration closes in 5 days (closing only, NOT happening)
        Event eventC = new Event();
        eventC.setId("EV-C");
        eventC.setName("Designathon Next Month");
        eventC.setEventDate(now.plusDays(40)); // next month
        eventC.setRegStart(now.minusDays(5));
        eventC.setRegEnd(now.plusDays(5));    // closing in 5 days

        // Event D: Date TBD (NOT happening this week)
        Event eventD = new Event();
        eventD.setId("EV-D");
        eventD.setName("Mystery Quest");
        eventD.setEventDate(null);
        eventD.setRegStart(now.plusDays(10));
        eventD.setRegEnd(now.plusDays(20));

        when(eventRepository.findAll()).thenReturn(List.of(eventA, eventB, eventC, eventD));

        DatabaseSqlAgent.QueryResult weekRes = databaseSqlAgent.retrieveTargetedContext(
                "What is happening this week?", "anonymousUser", QueryProcessor.Intent.EVENTS_THIS_WEEK, null, null);
        String ctx = weekRes.getContext();

        // Must have 3 separate sections
        assertTrue(ctx.contains("📅 Events Happening in the Next 7 Days:"));
        assertTrue(ctx.contains("🟢 Registrations Opening in the Next 7 Days:"));
        assertTrue(ctx.contains("🔴 Registrations Closing in the Next 7 Days:"));

        // Event A: appears in Happening AND Closing
        assertTrue(ctx.contains("Hackathon This Week"));

        // Event B: appears under Opening, but NOT under Happening in Next 7 Days
        int happeningStart = ctx.indexOf("📅 Events Happening in the Next 7 Days:");
        int openingStart = ctx.indexOf("🟢 Registrations Opening in the Next 7 Days:");
        int closingStart = ctx.indexOf("🔴 Registrations Closing in the Next 7 Days:");

        String happeningSection = ctx.substring(happeningStart, openingStart);
        String openingSection = ctx.substring(openingStart, closingStart);
        String closingSection = ctx.substring(closingStart);

        assertTrue(happeningSection.contains("Hackathon This Week"));
        assertFalse(happeningSection.contains("RoboWars Next Month"), "Next month event must NOT appear in Happening Next 7 Days!");
        assertFalse(happeningSection.contains("Designathon Next Month"), "Next month event must NOT appear in Happening Next 7 Days!");
        assertFalse(happeningSection.contains("Mystery Quest"), "TBD event must NOT appear in Happening Next 7 Days!");

        assertTrue(openingSection.contains("RoboWars Next Month"));
        assertFalse(openingSection.contains("Hackathon This Week"));

        assertTrue(closingSection.contains("Hackathon This Week"));
        assertTrue(closingSection.contains("Designathon Next Month"));
    }

    @Test
    @DisplayName("10. Latest Winner and Latest Event Winner retrieval")
    void testLatestWinnerRetrieval() {
        Event pastEvent1 = new Event();
        pastEvent1.setId("EV-PAST-1");
        pastEvent1.setName("Hackathon 2025");
        pastEvent1.setEventDate(LocalDateTime.now().minusMonths(2));

        Event pastEvent2 = new Event();
        pastEvent2.setId("EV-PAST-2");
        pastEvent2.setName("AI Challenge 2026");
        pastEvent2.setEventDate(LocalDateTime.now().minusDays(2)); // More recent event

        Winner oldWinner = new Winner("EV-PAST-1", "CLUB-1", "1MJ23CS200", "Darshan CS", "cs@mvjce.edu.in", "9999999991", Winner.Position.FIRST);
        oldWinner.setCreatedAt(LocalDateTime.now().minusMonths(2));

        Winner recentWinner = new Winner("EV-PAST-2", "CLUB-2", "1MJ23CG011", "Priya CG", "cg@mvjce.edu.in", "9999999992", Winner.Position.FIRST);
        recentWinner.setCreatedAt(LocalDateTime.now().minusDays(1)); // More recently created winner

        when(eventRepository.findAll()).thenReturn(List.of(pastEvent1, pastEvent2));
        when(eventRepository.findById("EV-PAST-1")).thenReturn(Optional.of(pastEvent1));
        when(eventRepository.findById("EV-PAST-2")).thenReturn(Optional.of(pastEvent2));
        when(winnerRepository.findAll()).thenReturn(List.of(oldWinner, recentWinner));
        when(winnerRepository.findByEventId("EV-PAST-2")).thenReturn(List.of(recentWinner));

        // 1. Latest Winner
        DatabaseSqlAgent.QueryResult resLatestWinner = databaseSqlAgent.retrieveTargetedContext(
                "Who is the latest winner?", "anonymousUser", QueryProcessor.Intent.LATEST_WINNER, null, null);
        assertTrue(resLatestWinner.getContext().contains("Priya CG"));
        assertTrue(resLatestWinner.getContext().contains("AI Challenge 2026"));

        // 2. Latest Event Winner
        DatabaseSqlAgent.QueryResult resLatestEvWinner = databaseSqlAgent.retrieveTargetedContext(
                "Who won the latest event?", "anonymousUser", QueryProcessor.Intent.LATEST_EVENT_WINNER, null, null);
        assertTrue(resLatestEvWinner.getContext().contains("AI Challenge 2026"));
        assertTrue(resLatestEvWinner.getContext().contains("Priya CG"));
    }

    @Test
    @DisplayName("11. Club Event Filtering and Unknown Club Handling")
    void testClubEventFilteringAndUnknownClub() {
        Club aakriti = new Club("AAKRITI", "Cultural Club");
        aakriti.setId("CLUB-AAKRITI");
        aakriti.setCategory("Cultural");

        Club coding = new Club("Coding Club", "Tech Club");
        coding.setId("CLUB-CODING");
        coding.setCategory("Technical");

        Event ev1 = new Event("Dance Fest", "Dance Comp", "CLUB-AAKRITI", LocalDateTime.now(), LocalDateTime.now().plusDays(2), null);
        ev1.setId("EV-DANCE");

        when(clubRepository.findAll()).thenReturn(List.of(aakriti, coding));
        when(eventRepository.findByClubId("CLUB-AAKRITI")).thenReturn(List.of(ev1));
        when(eventRepository.findByClubId("CLUB-CODING")).thenReturn(Collections.emptyList());

        // Known club with events
        DatabaseSqlAgent.QueryResult res1 = databaseSqlAgent.retrieveTargetedContext(
                "What events are in AAKRITI?", "anonymousUser", QueryProcessor.Intent.CLUB_EVENTS, "AAKRITI", null);
        assertTrue(res1.getContext().contains("Dance Fest"));
        assertFalse(res1.getContext().contains("Coding"));

        // Known club without events
        DatabaseSqlAgent.QueryResult res2 = databaseSqlAgent.retrieveTargetedContext(
                "What events are in Coding Club?", "anonymousUser", QueryProcessor.Intent.CLUB_EVENTS, "Coding Club", null);
        assertTrue(res2.getContext().contains("No events were found for Coding Club."));

        // Unknown club
        DatabaseSqlAgent.QueryResult res3 = databaseSqlAgent.retrieveTargetedContext(
                "What events are in UnknownClub?", "anonymousUser", QueryProcessor.Intent.CLUB_EVENTS, "UnknownClub", null);
        assertTrue(res3.getContext().contains("I couldn't identify that club. Please specify the club name."));
    }

    @Test
    @DisplayName("12. Student Participation: Individual + Team Registrations with Auth Isolation")
    void testStudentParticipationIsolation() {
        Event ev1 = new Event();
        ev1.setId("EV-1");
        ev1.setName("Solo Coding");

        Event ev2 = new Event();
        ev2.setId("EV-2");
        ev2.setName("Team Hackathon");

        com.mvjce.eventmanagement.model.EventRegistration reg1 = new com.mvjce.eventmanagement.model.EventRegistration(
                ev1, "1MJ23CS200", "Darshan CS", "cs@mvjce.edu.in", "9999999991");
        ev1.setRegistrations(List.of(reg1));

        com.mvjce.eventmanagement.model.Team team = new com.mvjce.eventmanagement.model.Team("EV-2", "CodeCrafters", "1MJ23CS200");
        com.mvjce.eventmanagement.model.TeamMember tm = new com.mvjce.eventmanagement.model.TeamMember(
                team, "1MJ23CS200", "Darshan CS", "cs@mvjce.edu.in", "9999999991");

        when(eventRepository.findAll()).thenReturn(List.of(ev1, ev2));
        when(eventRepository.findById("EV-1")).thenReturn(Optional.of(ev1));
        when(eventRepository.findById("EV-2")).thenReturn(Optional.of(ev2));
        when(teamMemberRepository.findByUserId("1MJ23CS200")).thenReturn(List.of(tm));
        when(teamMemberRepository.findByUserId("1MJ23CG011")).thenReturn(Collections.emptyList());

        // Authenticated user with registrations
        DatabaseSqlAgent.QueryResult res1 = databaseSqlAgent.retrieveTargetedContext(
                "Show my participation", "1MJ23CS200", QueryProcessor.Intent.PRIVATE_STUDENT_DATA, null, null);
        assertTrue(res1.getContext().contains("Solo Coding"));
        assertTrue(res1.getContext().contains("Team Hackathon"));

        // Authenticated user without registrations
        DatabaseSqlAgent.QueryResult res2 = databaseSqlAgent.retrieveTargetedContext(
                "Show my participation", "1MJ23CG011", QueryProcessor.Intent.PRIVATE_STUDENT_DATA, null, null);
        assertTrue(res2.getContext().contains("You have not registered for or participated in any events yet."));

        // Anonymous user
        DatabaseSqlAgent.QueryResult res3 = databaseSqlAgent.retrieveTargetedContext(
                "Show my participation", "anonymousUser", QueryProcessor.Intent.PRIVATE_STUDENT_DATA, null, null);
        assertTrue(res3.getContext().contains("Please log in with your student account to view your participation."));
    }
}
