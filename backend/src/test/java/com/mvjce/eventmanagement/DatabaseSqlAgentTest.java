package com.mvjce.eventmanagement;

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
}
