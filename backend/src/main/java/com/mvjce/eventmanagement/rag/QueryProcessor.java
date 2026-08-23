package com.mvjce.eventmanagement.rag;

import com.mvjce.eventmanagement.model.Club;
import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.repository.ClubRepository;
import com.mvjce.eventmanagement.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class QueryProcessor {

    public enum Intent {
        GREETING,
        PRIVACY_ATTACK,
        PRIVATE_STUDENT_DATA,
        CLUB_EVENTS,
        WINNERS,
        CLUBS_LIST,
        EVENTS_ACTIVE,
        EVENTS_ENDED,
        EVENT_DETAIL,
        KNOWLEDGE_REGISTRATION,
        KNOWLEDGE_ELIGIBILITY,
        KNOWLEDGE_SCHOLARSHIP,
        KNOWLEDGE_RULES,
        KNOWLEDGE_GUIDANCE,
        GENERAL
    }

    public static class ProcessedQuery {
        private final String originalQuery;
        private final String normalizedQuery;
        private final Intent intent;
        private final List<String> extractedEntities;
        private final List<String> retrievalVariants;
        private final String targetClubName;
        private final String targetEventName;

        public ProcessedQuery(String originalQuery, String normalizedQuery, Intent intent,
                              List<String> extractedEntities, List<String> retrievalVariants,
                              String targetClubName, String targetEventName) {
            this.originalQuery = originalQuery;
            this.normalizedQuery = normalizedQuery;
            this.intent = intent;
            this.extractedEntities = extractedEntities != null ? extractedEntities : Collections.emptyList();
            this.retrievalVariants = retrievalVariants != null ? retrievalVariants : Collections.emptyList();
            this.targetClubName = targetClubName;
            this.targetEventName = targetEventName;
        }

        public String getOriginalQuery() { return originalQuery; }
        public String getNormalizedQuery() { return normalizedQuery; }
        public Intent getIntent() { return intent; }
        public List<String> getExtractedEntities() { return extractedEntities; }
        public List<String> getRetrievalVariants() { return retrievalVariants; }
        public String getTargetClubName() { return targetClubName; }
        public String getTargetEventName() { return targetEventName; }
    }

    @Autowired(required = false)
    private ClubRepository clubRepository;

    @Autowired(required = false)
    private EventRepository eventRepository;

    private static final List<String> KNOWN_STATIC_ENTITIES = List.of(
            "ssp scholarship", "nsp scholarship", "ssp", "nsp",
            "state scholarship portal", "national scholarship portal",
            "college rules", "code of conduct", "registration process",
            "cancellation", "participation"
    );

    public ProcessedQuery process(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return new ProcessedQuery("", "", Intent.GENERAL, Collections.emptyList(), Collections.emptyList(), null, null);
        }

        String original = rawQuery.trim();
        String normalized = normalize(original);

        // 1. Check Privacy / Injection Attack
        if (isPrivacyAttack(normalized)) {
            return new ProcessedQuery(original, normalized, Intent.PRIVACY_ATTACK, Collections.emptyList(), Collections.emptyList(), null, null);
        }

        // 2. Check Greeting
        if (normalized.matches("^(hi|hello|hey|hola|greetings|good morning|good afternoon|good evening|help|sup)$")) {
            return new ProcessedQuery(original, normalized, Intent.GREETING, Collections.emptyList(), Collections.emptyList(), null, null);
        }

        // 3. Check Private Student Queries (LEVEL 1 Priority - Only for personal status checks)
        if (isUserPrivateQuery(normalized)) {
            return new ProcessedQuery(original, normalized, Intent.PRIVATE_STUDENT_DATA, List.of("private_student_data"), Collections.emptyList(), null, null);
        }

        // 4. Resolve Database Entities (Clubs & Events)
        String matchedClub = findMatchedClub(normalized);
        String matchedEvent = findMatchedEvent(normalized);

        // 5. Detect Intent
        Intent intent = detectIntent(normalized, matchedClub, matchedEvent);

        // 6. Extract Entities & Generate Retrieval Variants
        List<String> entities = extractEntities(normalized, matchedClub, matchedEvent);
        List<String> variants = generateRetrievalVariants(normalized, intent);

        return new ProcessedQuery(original, normalized, intent, entities, variants, matchedClub, matchedEvent);
    }

    public String normalize(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean isPrivacyAttack(String q) {
        return (q.contains("another student") || q.contains("someone else") || q.contains("other student") ||
                q.contains("other user") || q.contains("another user") || q.contains("others registration") ||
                q.contains("other registrations") || q.contains("someone s registration") ||
                q.contains("someone else s") || q.contains("another user s")) &&
                (q.contains("show") || q.contains("give") || q.contains("tell") || q.contains("get") || q.contains("view") || q.contains("ignore"));
    }

    private boolean isUserPrivateQuery(String q) {
        // Exclude general guidance, questions starting with how/what should i do/process/procedure
        if (q.startsWith("how ") || q.startsWith("where ") || q.startsWith("what is the procedure") ||
                q.startsWith("what is the process") || q.startsWith("what are the steps") ||
                q.contains("what should i do") || q.contains("how do i") || q.contains("how can i") ||
                q.contains("how to") || q.contains("process to") || q.contains("steps to") ||
                q.contains("procedure to") || q.contains("can i cancel") || q.contains("can anyone") ||
                q.contains("who can") || q.contains("i want to") || q.contains("i would like to")) {
            return false;
        }

        if (q.contains("my event") || q.contains("my registration") || q.contains("my participation") ||
                q.contains("my winning") || q.contains("my result") || q.contains("my team") ||
                q.contains("did i win") || q.contains("have i registered") || q.contains("am i participating") ||
                q.contains("events did i participate") || q.contains("events have i joined") ||
                q.contains("what did i register") || q.contains("what did i participate") ||
                q.contains("what are my registrations") || q.contains("show my participation") ||
                q.contains("show my registrations") || q.contains("my joined events") ||
                q.contains("which events did i") || q.contains("which events have i")) {
            return true;
        }

        return false;
    }

    private String findMatchedClub(String normalized) {
        // 1. Try resolving from ClubRepository
        if (clubRepository != null) {
            try {
                List<Club> clubs = clubRepository.findAll();
                for (Club club : clubs) {
                    String cName = club.getName().toLowerCase();
                    if (normalized.contains(cName)) {
                        return club.getName();
                    }
                    String rootName = cName.replace("club", "").trim();
                    if (rootName.length() >= 4 && normalized.matches(".*\\b" + Pattern.quote(rootName) + "\\b.*")) {
                        return club.getName();
                    }
                }
            } catch (Exception ignored) {}
        }

        // 2. Pattern-based club extraction (e.g. "coding club", "robotics club", "music club")
        Pattern pattern = Pattern.compile("\\b([a-zA-Z]{3,20})\\s+club\\b");
        Matcher matcher = pattern.matcher(normalized);
        if (matcher.find()) {
            String word = matcher.group(1);
            if (!word.equals("the") && !word.equals("which") && !word.equals("all") && !word.equals("this")) {
                return Character.toUpperCase(word.charAt(0)) + word.substring(1) + " Club";
            }
        }

        if (normalized.contains("coding")) {
            return "Coding Club";
        }

        return null;
    }

    private String findMatchedEvent(String normalized) {
        if (eventRepository != null) {
            try {
                List<Event> events = eventRepository.findAll();
                for (Event event : events) {
                    String eName = event.getName().toLowerCase();
                    if (normalized.contains(eName)) {
                        return event.getName();
                    }
                    String[] words = eName.split("\\s+");
                    for (String w : words) {
                        if (w.length() >= 5 && normalized.matches(".*\\b" + Pattern.quote(w) + "\\b.*")) {
                            return event.getName();
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private Intent detectIntent(String normalized, String matchedClub, String matchedEvent) {
        // Winners (LEVEL 2/3)
        if (normalized.contains("winner") || normalized.contains("who won") || normalized.contains("who came first") ||
                normalized.contains("results") || normalized.contains("result")) {
            return Intent.WINNERS;
        }

        // Club-Specific Events (LEVEL 2)
        if (matchedClub != null && (normalized.contains("event") || normalized.contains("host") ||
                normalized.contains("organize") || normalized.contains("conduct") || normalized.contains("show") ||
                normalized.contains("what") || normalized.contains("which") || normalized.contains("hosted by") ||
                normalized.contains("from"))) {
            return Intent.CLUB_EVENTS;
        }

        // Available Clubs List
        if (normalized.contains("list clubs") || normalized.contains("available clubs") ||
                normalized.contains("which clubs") || normalized.contains("all clubs") || normalized.contains("clubs available")) {
            return Intent.CLUBS_LIST;
        }

        // Specific Event Information
        if (matchedEvent != null && !normalized.contains("register") && !normalized.contains("participat") && !normalized.contains("how")) {
            return Intent.EVENT_DETAIL;
        }

        // Active/Upcoming Events
        if (normalized.contains("upcoming") || normalized.contains("active") || normalized.contains("ongoing") ||
                normalized.contains("events this week") || normalized.contains("happening this week") ||
                normalized.contains("available events") || normalized.contains("list events") ||
                normalized.equals("events") || normalized.equals("show events")) {
            return Intent.EVENTS_ACTIVE;
        }

        // Ended Events
        if (normalized.contains("ended events") || normalized.contains("past events") ||
                normalized.contains("completed events") || normalized.contains("expired events")) {
            return Intent.EVENTS_ENDED;
        }

        // Eligibility vs Procedure
        if (normalized.contains("who can participate") || normalized.contains("who is eligible") ||
                normalized.contains("eligibility") || normalized.contains("can anyone participate") ||
                normalized.contains("who is allowed")) {
            return Intent.KNOWLEDGE_ELIGIBILITY;
        }

        // Registration Process / Procedure (Semantic Paraphrases)
        if (normalized.contains("register") || normalized.contains("participat") || normalized.contains("take part") ||
                normalized.contains("sign up") || normalized.contains("join") || normalized.contains("enroll") ||
                normalized.contains("procedure") || normalized.contains("steps to") || normalized.contains("process to") ||
                normalized.contains("process of") || normalized.contains("how do i") || normalized.contains("how can i") ||
                normalized.contains("how to") || normalized.contains("what should i do")) {
            return Intent.KNOWLEDGE_REGISTRATION;
        }

        // Scholarships
        if (normalized.contains("scholarship") || normalized.contains("ssp") || normalized.contains("nsp")) {
            return Intent.KNOWLEDGE_SCHOLARSHIP;
        }

        // Rules & Regulations
        if (normalized.contains("rule") || normalized.contains("conduct") || normalized.contains("id card") || normalized.contains("dress code")) {
            return Intent.KNOWLEDGE_RULES;
        }

        return Intent.GENERAL;
    }

    private List<String> extractEntities(String normalized, String matchedClub, String matchedEvent) {
        List<String> entities = new ArrayList<>();
        if (matchedClub != null) entities.add(matchedClub);
        if (matchedEvent != null) entities.add(matchedEvent);

        for (String entity : KNOWN_STATIC_ENTITIES) {
            if (normalized.contains(entity)) {
                entities.add(entity);
            }
        }
        return entities;
    }

    private List<String> generateRetrievalVariants(String normalized, Intent intent) {
        Set<String> variants = new LinkedHashSet<>();
        variants.add(normalized);

        if (intent == Intent.KNOWLEDGE_REGISTRATION) {
            variants.add("registration process");
            variants.add("how to register for event");
            variants.add("steps to participate in college events");
            variants.add("how can i see my registered events");
        } else if (intent == Intent.KNOWLEDGE_ELIGIBILITY) {
            variants.add("who can participate in events");
            variants.add("eligibility for college events");
        } else if (intent == Intent.KNOWLEDGE_SCHOLARSHIP) {
            variants.add("ssp scholarship application process");
            variants.add("nsp national scholarship portal");
            variants.add("scholarship eligibility and documents");
        }

        return new ArrayList<>(variants);
    }
}
