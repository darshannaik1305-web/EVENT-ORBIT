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
        EVENTS_ONGOING,
        EVENTS_UPCOMING,
        EVENTS_ACTIVE,
        EVENTS_ENDED,
        EVENT_DETAIL,
        KNOWLEDGE_REGISTRATION,
        KNOWLEDGE_ELIGIBILITY,
        KNOWLEDGE_SCHOLARSHIP,
        KNOWLEDGE_RULES,
        KNOWLEDGE_DEPARTMENT_LOCATION,
        KNOWLEDGE_GUIDANCE,
        AMBIGUOUS_QUERY,
        GENERAL
    }

    public enum EntityScope {
        DEPARTMENT,
        EVENT,
        CLUB,
        STUDENT,
        CAMPUS_FACILITY,
        SCHOLARSHIP,
        GLOBAL
    }

    public enum DataSource {
        DATABASE,
        KNOWLEDGE_BASE,
        SYSTEM
    }

    public enum RequestedAttribute {
        LOCATION,
        DATE_TIME,
        WINNER,
        ELIGIBILITY,
        REGISTRATION_PROCEDURE,
        SCHOLARSHIP,
        RULES,
        EVENT_LIST,
        CLUB_LIST,
        PARTICIPATION_STATUS,
        GENERAL
    }

    public static class SubQuery {
        private final String text;
        private final String entity;
        private final EntityScope scope;
        private final RequestedAttribute attribute;
        private final DataSource source;
        private final boolean ambiguous;
        private final String clarificationPrompt;
        private final EntityResolution resolvedEntity;
        private final String targetDepartment;
        private final String targetEvent;

        public SubQuery(String text, String entity, EntityScope scope,
                        RequestedAttribute attribute, DataSource source,
                        boolean ambiguous, String clarificationPrompt,
                        EntityResolution resolvedEntity, String targetDepartment, String targetEvent) {
            this.text = text != null ? text : "";
            this.entity = entity;
            this.scope = scope != null ? scope : EntityScope.GLOBAL;
            this.attribute = attribute != null ? attribute : RequestedAttribute.GENERAL;
            this.source = source != null ? source : DataSource.KNOWLEDGE_BASE;
            this.ambiguous = ambiguous;
            this.clarificationPrompt = clarificationPrompt;
            this.resolvedEntity = resolvedEntity != null ? resolvedEntity : new EntityResolution(mapScopeToEntityType(this.scope), entity != null ? entity : "");
            this.targetDepartment = targetDepartment;
            this.targetEvent = targetEvent;
        }

        public SubQuery(String text, String entity, EntityScope scope,
                        RequestedAttribute attribute, DataSource source,
                        boolean ambiguous, String clarificationPrompt) {
            this(text, entity, scope, attribute, source, ambiguous, clarificationPrompt, null,
                    (attribute == RequestedAttribute.WINNER && scope == EntityScope.DEPARTMENT) ? entity : null, null);
        }

        public SubQuery(String text, String entity, EntityScope scope,
                        RequestedAttribute attribute, DataSource source) {
            this(text, entity, scope, attribute, source, false, null);
        }

        public String getText() { return text; }
        public String getEntity() { return entity; }
        public EntityScope getScope() { return scope; }
        public RequestedAttribute getAttribute() { return attribute; }
        public DataSource getSource() { return source; }
        public boolean isAmbiguous() { return ambiguous; }
        public String getClarificationPrompt() { return clarificationPrompt; }
        public EntityResolution getResolvedEntity() { return resolvedEntity; }
        public EntityResolution.EntityType getEntityType() { return resolvedEntity != null ? resolvedEntity.getType() : mapScopeToEntityType(scope); }
        public String getTargetDepartment() { return targetDepartment; }
        public String getTargetEvent() { return targetEvent; }

        @Override
        public String toString() {
            return "SubQuery{entity='" + entity + '\'' +
                    ", scope=" + scope +
                    ", attribute=" + attribute +
                    ", source=" + source +
                    ", targetEvent='" + targetEvent + '\'' +
                    ", ambiguous=" + ambiguous + '}';
        }
    }

    public static class ProcessedQuery {
        private final String originalQuery;
        private final String normalizedQuery;
        private final Intent intent;
        private final RequestedAttribute requestedAttribute;
        private final List<String> extractedEntities;
        private final List<String> retrievalVariants;
        private final String targetClubName;
        private final String targetEventName;
        private final String targetDepartment;
        private final List<SubQuery> subQueries;
        private final boolean ambiguous;
        private final String clarificationMessage;
        private final EntityScope primaryScope;
        private final DataSource primarySource;
        private final EntityResolution resolvedEntity;

        public ProcessedQuery(String originalQuery, String normalizedQuery, Intent intent,
                              RequestedAttribute requestedAttribute,
                              List<String> extractedEntities, List<String> retrievalVariants,
                              String targetClubName, String targetEventName,
                              String targetDepartment,
                              List<SubQuery> subQueries, boolean ambiguous,
                              String clarificationMessage, EntityScope primaryScope,
                              DataSource primarySource, EntityResolution resolvedEntity) {
            this.originalQuery = originalQuery;
            this.normalizedQuery = normalizedQuery;
            this.intent = intent;
            this.requestedAttribute = requestedAttribute != null ? requestedAttribute : RequestedAttribute.GENERAL;
            this.extractedEntities = extractedEntities != null ? extractedEntities : Collections.emptyList();
            this.retrievalVariants = retrievalVariants != null ? retrievalVariants : Collections.emptyList();
            this.targetClubName = targetClubName;
            this.targetEventName = targetEventName;
            this.targetDepartment = targetDepartment;
            this.subQueries = subQueries != null ? subQueries : Collections.emptyList();
            this.ambiguous = ambiguous;
            this.clarificationMessage = clarificationMessage;
            this.primaryScope = primaryScope != null ? primaryScope : EntityScope.GLOBAL;
            this.primarySource = primarySource != null ? primarySource : DataSource.KNOWLEDGE_BASE;
            this.resolvedEntity = resolvedEntity != null ? resolvedEntity :
                    new EntityResolution(mapScopeToEntityType(this.primaryScope),
                            (targetDepartment != null) ? targetDepartment :
                            (targetEventName != null) ? targetEventName :
                            (targetClubName != null) ? targetClubName :
                            (!this.extractedEntities.isEmpty()) ? this.extractedEntities.get(0) : "");
        }

        public ProcessedQuery(String originalQuery, String normalizedQuery, Intent intent,
                              RequestedAttribute requestedAttribute,
                              List<String> extractedEntities, List<String> retrievalVariants,
                              String targetClubName, String targetEventName,
                              String targetDepartment,
                              List<SubQuery> subQueries, boolean ambiguous,
                              String clarificationMessage, EntityScope primaryScope,
                              DataSource primarySource) {
            this(originalQuery, normalizedQuery, intent, requestedAttribute, extractedEntities,
                    retrievalVariants, targetClubName, targetEventName, targetDepartment,
                    subQueries, ambiguous, clarificationMessage, primaryScope, primarySource, null);
        }

        public ProcessedQuery(String originalQuery, String normalizedQuery, Intent intent,
                              RequestedAttribute requestedAttribute,
                              List<String> extractedEntities, List<String> retrievalVariants,
                              String targetClubName, String targetEventName,
                              List<SubQuery> subQueries, boolean ambiguous,
                              String clarificationMessage, EntityScope primaryScope,
                              DataSource primarySource) {
            this(originalQuery, normalizedQuery, intent, requestedAttribute, extractedEntities,
                    retrievalVariants, targetClubName, targetEventName,
                    (primaryScope == EntityScope.DEPARTMENT && !extractedEntities.isEmpty()) ? extractedEntities.get(0) : null,
                    subQueries, ambiguous, clarificationMessage, primaryScope, primarySource);
        }

        public ProcessedQuery(String originalQuery, String normalizedQuery, Intent intent,
                              RequestedAttribute requestedAttribute,
                              List<String> extractedEntities, List<String> retrievalVariants,
                              String targetClubName, String targetEventName) {
            this(originalQuery, normalizedQuery, intent, requestedAttribute, extractedEntities,
                    retrievalVariants, targetClubName, targetEventName, null, Collections.emptyList(),
                    false, null, EntityScope.GLOBAL, DataSource.KNOWLEDGE_BASE);
        }

        public ProcessedQuery(String originalQuery, String normalizedQuery, Intent intent,
                              List<String> extractedEntities, List<String> retrievalVariants,
                              String targetClubName, String targetEventName) {
            this(originalQuery, normalizedQuery, intent, RequestedAttribute.GENERAL, extractedEntities,
                    retrievalVariants, targetClubName, targetEventName);
        }

        public String getOriginalQuery() { return originalQuery; }
        public String getNormalizedQuery() { return normalizedQuery; }
        public Intent getIntent() { return intent; }
        public RequestedAttribute getRequestedAttribute() { return requestedAttribute; }
        public List<String> getExtractedEntities() { return extractedEntities; }
        public List<String> getRetrievalVariants() { return retrievalVariants; }
        public String getTargetClubName() { return targetClubName; }
        public String getTargetEventName() { return targetEventName; }
        public String getTargetDepartment() { return targetDepartment; }
        public List<SubQuery> getSubQueries() { return subQueries; }
        public boolean isAmbiguous() { return ambiguous; }
        public String getClarificationMessage() { return clarificationMessage; }
        public EntityScope getPrimaryScope() { return primaryScope; }
        public DataSource getPrimarySource() { return primarySource; }
        public EntityResolution getResolvedEntity() { return resolvedEntity; }
        public EntityResolution.EntityType getEntityType() { return resolvedEntity != null ? resolvedEntity.getType() : mapScopeToEntityType(primaryScope); }
    }

    public static EntityResolution.EntityType mapScopeToEntityType(EntityScope scope) {
        if (scope == null) return EntityResolution.EntityType.GLOBAL;
        switch (scope) {
            case DEPARTMENT: return EntityResolution.EntityType.DEPARTMENT;
            case EVENT: return EntityResolution.EntityType.EVENT;
            case CLUB: return EntityResolution.EntityType.CLUB;
            case CAMPUS_FACILITY: return EntityResolution.EntityType.CAMPUS_FACILITY;
            case SCHOLARSHIP: return EntityResolution.EntityType.SCHOLARSHIP;
            case STUDENT: return EntityResolution.EntityType.STUDENT;
            default: return EntityResolution.EntityType.GLOBAL;
        }
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

    // Natural Paraphrases Patterns for Attributes
    private static final Pattern WINNER_PATTERN = Pattern.compile(
            "\\b(winner|winners|win|wins|won|winnings?|victory|victories|achievement|achievements|winning\\s+records?|podium|results?|ranks?|first\\s+place|2nd\\s+place|3rd\\s+place|who\\s+won|who\\s+came\\s+first)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern LOCATION_PATTERN = Pattern.compile(
            "\\b(where|location|located|which\\s+floor|which\\s+block|which\\s+building|floor|building|block|place|situated|address|room)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern DATE_TIME_PATTERN = Pattern.compile(
            "\\b(when|date|time|timing|schedule|deadline)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern REGISTRATION_PATTERN = Pattern.compile(
            "\\b(how\\s+(do|can)\\s+i\\s+register|how\\s+to\\s+register|registration\\s+process|how\\s+(to|can\\s+i)\\s+apply|apply\\s+for\\s+events?|procedure|steps\\s+to|process\\s+to|process\\s+of|sign\\s+up|how\\s+to\\s+join|how\\s+can\\s+i\\s+join)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ELIGIBILITY_PATTERN = Pattern.compile(
            "\\b(who\\s+can\\s+participate|who\\s+is\\s+eligible|eligibility|can\\s+anyone\\s+participate|who\\s+is\\s+allowed|allowed\\s+to\\s+participate)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SCHOLARSHIP_PATTERN = Pattern.compile(
            "\\b(scholarship|ssp|nsp|state\\s+scholarship|national\\s+scholarship)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern RULES_PATTERN = Pattern.compile(
            "\\b(rule|rules|conduct|code\\s+of\\s+conduct|id\\s+card|dress\\s+code|discipline|ragging)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern MY_DEPARTMENT_PATTERN = Pattern.compile(
            "\\b(my\\s+department|our\\s+department)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // Canonical Campus & Department Entities with strict word-boundary patterns
    private static final Map<String, Pattern> ACADEMIC_DEPARTMENTS = new LinkedHashMap<>();
    static {
        ACADEMIC_DEPARTMENTS.put("CG", Pattern.compile("\\b(cg|computer graphics|computer graphics and engineering|computer graphics & engineering)\\b", Pattern.CASE_INSENSITIVE));
        ACADEMIC_DEPARTMENTS.put("CS", Pattern.compile("\\b(cs|cse|computer science|computer science and engineering|computer science & engineering)\\b", Pattern.CASE_INSENSITIVE));
        ACADEMIC_DEPARTMENTS.put("ISE", Pattern.compile("\\b(ise|information science|information science and engineering|information science & engineering)\\b", Pattern.CASE_INSENSITIVE));
        ACADEMIC_DEPARTMENTS.put("ECE", Pattern.compile("\\b(ece|electronics and communication|electronics & communication)\\b", Pattern.CASE_INSENSITIVE));
        ACADEMIC_DEPARTMENTS.put("AIML", Pattern.compile("\\b(aiml|ai ml|ai and ml|ai & ml|artificial intelligence)\\b", Pattern.CASE_INSENSITIVE));
        ACADEMIC_DEPARTMENTS.put("CD", Pattern.compile("\\b(cd department|computer science and design|data science)\\b", Pattern.CASE_INSENSITIVE));
        ACADEMIC_DEPARTMENTS.put("ME", Pattern.compile("\\b(mechanical|mech|mechanical engineering|me department)\\b", Pattern.CASE_INSENSITIVE));
    }

    private static final Map<String, Pattern> CAMPUS_FACILITIES = new LinkedHashMap<>();
    static {
        CAMPUS_FACILITIES.put("Placement Cell", Pattern.compile("\\b(placement cell|training and placement cell|training & placement cell|placement)\\b", Pattern.CASE_INSENSITIVE));
        CAMPUS_FACILITIES.put("Library", Pattern.compile("\\b(library|central library)\\b", Pattern.CASE_INSENSITIVE));
        CAMPUS_FACILITIES.put("Sports Complex", Pattern.compile("\\b(sports complex|gymnasium|indoor badminton|badminton courts)\\b", Pattern.CASE_INSENSITIVE));
        CAMPUS_FACILITIES.put("College Auditorium", Pattern.compile("\\b(auditorium|college auditorium|dr m v jayaraman auditorium|jayaraman auditorium)\\b", Pattern.CASE_INSENSITIVE));
        CAMPUS_FACILITIES.put("Principal Office", Pattern.compile("\\b(principal office|principal s office|principal office|principal)\\b", Pattern.CASE_INSENSITIVE));
        CAMPUS_FACILITIES.put("Administration Office", Pattern.compile("\\b(admin office|administration office|college administration office|administrative block)\\b", Pattern.CASE_INSENSITIVE));
    }

    public ProcessedQuery process(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return new ProcessedQuery("", "", Intent.GENERAL, RequestedAttribute.GENERAL,
                    Collections.emptyList(), Collections.emptyList(), null, null);
        }

        String original = rawQuery.trim();
        String normalized = normalize(original);

        // 1. Check Privacy / Injection Attack
        if (isPrivacyAttack(normalized)) {
            SubQuery sq = new SubQuery(original, null, EntityScope.GLOBAL, RequestedAttribute.GENERAL, DataSource.SYSTEM);
            return new ProcessedQuery(original, normalized, Intent.PRIVACY_ATTACK, RequestedAttribute.GENERAL,
                    Collections.emptyList(), Collections.emptyList(), null, null, null,
                    List.of(sq), false, null, EntityScope.GLOBAL, DataSource.SYSTEM);
        }

        // 2. Check Greeting
        if (normalized.matches("^(hi|hello|hey|hola|greetings|good morning|good afternoon|good evening|help|sup)$")) {
            SubQuery sq = new SubQuery(original, null, EntityScope.GLOBAL, RequestedAttribute.GENERAL, DataSource.SYSTEM);
            return new ProcessedQuery(original, normalized, Intent.GREETING, RequestedAttribute.GENERAL,
                    Collections.emptyList(), Collections.emptyList(), null, null, null,
                    List.of(sq), false, null, EntityScope.GLOBAL, DataSource.SYSTEM);
        }

        // 3. Multi-Query / Compound Query Decomposition (e.g. "location of CG and what has CS won")
        List<SubQuery> subQueries = decomposeSubQueries(original, normalized);

        // 4. Primary Attribute & Entity Resolution
        RequestedAttribute primaryAttribute = detectRequestedAttribute(normalized);
        String matchedClub = findMatchedClub(normalized);
        String matchedEvent = extractOriginalCasing(original, findMatchedEvent(normalized));
        List<String> campusEntities = extractCampusEntities(normalized);

        // 5. Determine Primary Entity & Scope & Target Department
        String primaryEntity = null;
        EntityScope primaryScope = EntityScope.GLOBAL;
        String targetDepartment = null;

        if (MY_DEPARTMENT_PATTERN.matcher(normalized).find()) {
            primaryEntity = "MY_DEPARTMENT";
            primaryScope = EntityScope.DEPARTMENT;
            if (primaryAttribute == RequestedAttribute.WINNER) {
                targetDepartment = "MY_DEPARTMENT";
            }
        } else {
            String winnerDept = extractDepartmentFromWinnerQuery(normalized);
            if (winnerDept != null) {
                primaryEntity = winnerDept;
                primaryScope = EntityScope.DEPARTMENT;
                targetDepartment = winnerDept;
            } else if (!campusEntities.isEmpty()) {
                primaryEntity = campusEntities.get(0);
                primaryScope = isAcademicDepartment(primaryEntity) ? EntityScope.DEPARTMENT : EntityScope.CAMPUS_FACILITY;
                if (primaryScope == EntityScope.DEPARTMENT && primaryAttribute == RequestedAttribute.WINNER) {
                    targetDepartment = primaryEntity;
                }
            } else if (matchedEvent != null) {
                primaryEntity = matchedEvent;
                primaryScope = EntityScope.EVENT;
            } else if (matchedClub != null) {
                primaryEntity = matchedClub;
                primaryScope = EntityScope.CLUB;
            }
        }

        // 6. Check Ambiguity (e.g. "Who won?", "Which department won?", "Tell me the winners" without any target event, club, or department)
        boolean isAmbiguous = false;
        String clarificationMessage = null;
        if (primaryAttribute == RequestedAttribute.WINNER && primaryEntity == null && targetDepartment == null && matchedEvent == null &&
                !isUserPrivateQuery(normalized)) {
            boolean isFaq = normalized.contains("how are") || normalized.contains("how do they announce") ||
                            normalized.contains("when are winners") || normalized.contains("where are winners published");
            if (!isFaq) {
                isAmbiguous = true;
                clarificationMessage = "Please specify the event or department you would like to see the winners for (e.g., 'Who won Hackathon?' or 'What has the CS department won?').";
            }
        }

        // 7. Determine Primary Intent & Data Source
        Intent intent = detectIntent(normalized, matchedClub, matchedEvent, primaryAttribute, campusEntities, primaryScope, primaryEntity, isAmbiguous);
        DataSource primarySource = determineDataSource(intent, primaryAttribute, primaryScope);

        // 8. Extract all entities and retrieval variants for RAG
        List<String> entities = extractEntities(normalized, matchedClub, matchedEvent, campusEntities, primaryEntity);
        List<String> variants = generateRetrievalVariants(normalized, intent, entities, primaryAttribute);

        EntityResolution.EntityType entityType = mapScopeToEntityType(primaryScope);
        EntityResolution primaryResolvedEntity = new EntityResolution(
                entityType,
                (targetDepartment != null) ? targetDepartment :
                (matchedEvent != null) ? matchedEvent :
                (matchedClub != null) ? matchedClub :
                (primaryEntity != null) ? primaryEntity : "",
                null,
                true,
                1.0
        );

        return new ProcessedQuery(
                original, normalized, intent, primaryAttribute, entities, variants,
                matchedClub, matchedEvent, targetDepartment, subQueries, isAmbiguous, clarificationMessage,
                primaryScope, primarySource, primaryResolvedEntity
        );
    }

    private static final Pattern PRONOUN_PATTERN = Pattern.compile(
            "\\b(it|this|that|they|them)\\b", Pattern.CASE_INSENSITIVE
    );

    public boolean isPronounQuery(String normalized) {
        return normalized != null && PRONOUN_PATTERN.matcher(normalized).find();
    }

    private String extractDepartmentFromWinnerQuery(String normalized) {
        Pattern p1 = Pattern.compile("\\b(?:what\\s+has|winnings?\\s+of|achievements?\\s+of|victories\\s+of|did|has|for|from|tell\\s+me)\\s+(?:the\\s+)?([a-zA-Z]{2,4})(?:\\s+department|\\s+dept)?\\s*(?:won|win|winners?|winnings?|records?|achievements?|podium|in|$)");
        Matcher m1 = p1.matcher(normalized);
        if (m1.find()) {
            String token = m1.group(1).toUpperCase();
            if (UsnDepartmentResolver.isKnownDepartment(token)) {
                return UsnDepartmentResolver.normalizeDepartmentCode(token);
            }
        }

        Pattern p2 = Pattern.compile("\\b([a-zA-Z]{2,4})\\s+(?:department\\s+)?(?:won|winnings?|achievements?|winning\\s+records?|podium)\\b");
        Matcher m2 = p2.matcher(normalized);
        if (m2.find()) {
            String token = m2.group(1).toUpperCase();
            if (UsnDepartmentResolver.isKnownDepartment(token)) {
                return UsnDepartmentResolver.normalizeDepartmentCode(token);
            }
        }

        return null;
    }

    private List<SubQuery> decomposeSubQueries(String original, String normalized) {
        List<SubQuery> list = new ArrayList<>();
        // Split on common coordinating conjunctions separating independent clauses
        String[] parts = original.split("(?i)\\s+(and|as well as|&)\\s+");

        if (parts.length > 1) {
            for (String part : parts) {
                String normPart = normalize(part);
                if (normPart.isBlank()) continue;

                RequestedAttribute attr = detectRequestedAttribute(normPart);
                String club = findMatchedClub(normPart);
                String event = extractOriginalCasing(part, findMatchedEvent(normPart));
                List<String> campusEnts = extractCampusEntities(normPart);

                String entity = null;
                EntityScope scope = EntityScope.GLOBAL;

                if (MY_DEPARTMENT_PATTERN.matcher(normPart).find()) {
                    entity = "MY_DEPARTMENT";
                    scope = EntityScope.DEPARTMENT;
                } else {
                    String winnerDept = extractDepartmentFromWinnerQuery(normPart);
                    if (winnerDept != null) {
                        entity = winnerDept;
                        scope = EntityScope.DEPARTMENT;
                    } else if (!campusEnts.isEmpty()) {
                        entity = campusEnts.get(0);
                        scope = isAcademicDepartment(entity) ? EntityScope.DEPARTMENT : EntityScope.CAMPUS_FACILITY;
                    } else if (event != null) {
                        entity = event;
                        scope = EntityScope.EVENT;
                    } else if (club != null) {
                        entity = club;
                        scope = EntityScope.CLUB;
                    }
                }

                DataSource source = (attr == RequestedAttribute.WINNER) ? DataSource.DATABASE :
                        (attr == RequestedAttribute.LOCATION) ? DataSource.KNOWLEDGE_BASE : DataSource.KNOWLEDGE_BASE;

                String targetDept = (attr == RequestedAttribute.WINNER && scope == EntityScope.DEPARTMENT) ? entity : null;
                String targetEvt = event;
                EntityResolution resEnt = new EntityResolution(mapScopeToEntityType(scope), entity != null ? entity : "", null, true, 1.0);

                list.add(new SubQuery(part.trim(), entity, scope, attr, source, false, null, resEnt, targetDept, targetEvt));
            }
        }

        if (list.isEmpty()) {
            RequestedAttribute attr = detectRequestedAttribute(normalized);
            String club = findMatchedClub(normalized);
            String event = extractOriginalCasing(original, findMatchedEvent(normalized));
            List<String> campusEnts = extractCampusEntities(normalized);

            String entity = null;
            EntityScope scope = EntityScope.GLOBAL;
            if (MY_DEPARTMENT_PATTERN.matcher(normalized).find()) {
                entity = "MY_DEPARTMENT";
                scope = EntityScope.DEPARTMENT;
            } else if (!campusEnts.isEmpty()) {
                entity = campusEnts.get(0);
                scope = isAcademicDepartment(entity) ? EntityScope.DEPARTMENT : EntityScope.CAMPUS_FACILITY;
            } else if (event != null) {
                entity = event;
                scope = EntityScope.EVENT;
            } else if (club != null) {
                entity = club;
                scope = EntityScope.CLUB;
            }

            DataSource source = (attr == RequestedAttribute.WINNER || club != null || event != null) ?
                    DataSource.DATABASE : DataSource.KNOWLEDGE_BASE;

            String targetDept = (attr == RequestedAttribute.WINNER && scope == EntityScope.DEPARTMENT) ? entity : null;
            String targetEvt = event;
            EntityResolution resEnt = new EntityResolution(mapScopeToEntityType(scope), entity != null ? entity : "", null, true, 1.0);

            list.add(new SubQuery(original, entity, scope, attr, source, false, null, resEnt, targetDept, targetEvt));
        }

        return list;
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

        Pattern pattern = Pattern.compile("\\b([a-zA-Z]{3,20})\\s+club\\b");
        Matcher matcher = pattern.matcher(normalized);
        if (matcher.find()) {
            String word = matcher.group(1);
            if (!word.equals("the") && !word.equals("which") && !word.equals("all") && !word.equals("this")) {
                return Character.toUpperCase(word.charAt(0)) + word.substring(1) + " Club";
            }
        }

        if (normalized.contains("coding club") || (normalized.contains("coding") && normalized.contains("club"))) {
            return "Coding Club";
        }

        return null;
    }

    private String findMatchedEvent(String normalized) {
        if (normalized == null || normalized.isBlank()) return null;

        if (eventRepository != null) {
            try {
                List<Event> events = eventRepository.findAll();
                if (events != null && !events.isEmpty()) {
                    List<Event> sorted = new ArrayList<>(events);
                    // Sort descending by name length so specific full names (e.g. "IExample2026") precede substrings ("Examp")
                    sorted.sort((a, b) -> Integer.compare(b.getName().length(), a.getName().length()));

                    // Priority 1: Exact full-name match with word boundary
                    for (Event event : sorted) {
                        String normName = event.getName().toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
                        if (!normName.isEmpty()) {
                            if (normalized.equals(normName) || normalized.matches(".*\\b" + Pattern.quote(normName) + "\\b.*")) {
                                return event.getName();
                            }
                        }
                    }

                    // Priority 2: Full name substring match
                    for (Event event : sorted) {
                        String normName = event.getName().toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
                        if (!normName.isEmpty() && normalized.contains(normName)) {
                            return event.getName();
                        }
                    }

                    // Priority 3: Multi-word exact token match
                    for (Event event : sorted) {
                        String[] words = event.getName().toLowerCase().split("\\s+");
                        if (words.length > 1) {
                            boolean allFound = true;
                            for (String w : words) {
                                String cleanW = w.replaceAll("[^a-zA-Z0-9]", "");
                                if (cleanW.length() >= 4 && !normalized.matches(".*\\b" + Pattern.quote(cleanW) + "\\b.*")) {
                                    allFound = false;
                                    break;
                                }
                            }
                            if (allFound) {
                                return event.getName();
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // Heuristic fallback for common event names
        if (normalized.matches(".*\\b(hackathon2026|hackathon|hackthon)\\b.*")) {
            return "Hackathon";
        }
        if (normalized.matches(".*\\b(music\\s+concert)\\b.*")) {
            return "Music Concert";
        }
        if (normalized.matches(".*\\b(algorithm\\s+arena|arena)\\b.*")) {
            return "Algorithm Arena";
        }
        if (normalized.matches(".*\\b(robowars|robotics)\\b.*")) {
            return "RoboWars";
        }

        Pattern eventInPattern = Pattern.compile("\\b(?:in|for|at|during|about|of|event)\\s+([a-zA-Z0-9_-]{4,30})\\b");
        Matcher em = eventInPattern.matcher(normalized);
        if (em.find()) {
            String candidate = em.group(1);
            if (!candidate.equalsIgnoreCase("the") && !candidate.equalsIgnoreCase("this") &&
                !candidate.equalsIgnoreCase("that") && !candidate.equalsIgnoreCase("department") &&
                !candidate.equalsIgnoreCase("dept") && !candidate.equalsIgnoreCase("college") &&
                !candidate.equalsIgnoreCase("campus") && !isAcademicDepartment(candidate)) {
                return candidate;
            }
        }

        return null;
    }

    private String extractOriginalCasing(String raw, String matched) {
        if (raw == null || matched == null) return matched;
        Pattern p = Pattern.compile("\\b" + Pattern.quote(matched) + "\\b", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(raw);
        if (m.find()) {
            return m.group();
        }
        return matched;
    }

    private RequestedAttribute detectRequestedAttribute(String normalized) {
        if (SCHOLARSHIP_PATTERN.matcher(normalized).find()) {
            return RequestedAttribute.SCHOLARSHIP;
        }
        if (WINNER_PATTERN.matcher(normalized).find()) {
            return RequestedAttribute.WINNER;
        }
        if (LOCATION_PATTERN.matcher(normalized).find()) {
            return RequestedAttribute.LOCATION;
        }
        if (DATE_TIME_PATTERN.matcher(normalized).find()) {
            return RequestedAttribute.DATE_TIME;
        }
        if (ELIGIBILITY_PATTERN.matcher(normalized).find()) {
            return RequestedAttribute.ELIGIBILITY;
        }
        if (REGISTRATION_PATTERN.matcher(normalized).find()) {
            return RequestedAttribute.REGISTRATION_PROCEDURE;
        }
        if (RULES_PATTERN.matcher(normalized).find()) {
            return RequestedAttribute.RULES;
        }
        return RequestedAttribute.GENERAL;
    }

    private List<String> extractCampusEntities(String normalized) {
        List<String> found = new ArrayList<>();
        for (Map.Entry<String, Pattern> entry : ACADEMIC_DEPARTMENTS.entrySet()) {
            if (entry.getValue().matcher(normalized).find()) {
                found.add(entry.getKey());
            }
        }
        for (Map.Entry<String, Pattern> entry : CAMPUS_FACILITIES.entrySet()) {
            if (entry.getValue().matcher(normalized).find()) {
                found.add(entry.getKey());
            }
        }
        return found;
    }

    private boolean isAcademicDepartment(String entityName) {
        return entityName != null && (ACADEMIC_DEPARTMENTS.containsKey(entityName) || entityName.equals("MY_DEPARTMENT"));
    }

    private Intent detectIntent(String normalized, String matchedClub, String matchedEvent,
                                 RequestedAttribute requestedAttribute, List<String> campusEntities,
                                 EntityScope primaryScope, String primaryEntity, boolean isAmbiguous) {
        // 1. Private Student Data Queries (LEVEL 1)
        if (isUserPrivateQuery(normalized)) {
            return Intent.PRIVATE_STUDENT_DATA;
        }

        // 2. Winners & Achievements Queries (LEVEL 2/3 Database Intent)
        // Works for: Events ("who won hackathon"), Departments ("what has CS won", "winnings of CS", "what has my department won"), or Ambiguous queries
        if (requestedAttribute == RequestedAttribute.WINNER) {
            return Intent.WINNERS;
        }

        // 3. Scholarships (SSP / NSP) - MUST CHECK BEFORE GENERAL EVENT REGISTRATION
        if (requestedAttribute == RequestedAttribute.SCHOLARSHIP) {
            return Intent.KNOWLEDGE_SCHOLARSHIP;
        }

        // 4. Campus Department / Location Questions (LEVEL 4 Knowledge Intent)
        // Only routes to department location knowledge chunks when attribute is LOCATION or about campus information (not winnings/events!)
        if (requestedAttribute == RequestedAttribute.LOCATION || !campusEntities.isEmpty() ||
                normalized.contains("department") || normalized.contains("placement cell") ||
                normalized.contains("library") || normalized.contains("sports complex") ||
                normalized.contains("auditorium") || normalized.contains("principal office")) {
            if (requestedAttribute == RequestedAttribute.LOCATION || !campusEntities.isEmpty() ||
                    normalized.contains("where is") || normalized.contains("where are") ||
                    normalized.contains("location") || normalized.contains("tell me about")) {
                return Intent.KNOWLEDGE_DEPARTMENT_LOCATION;
            }
        }

        // 5. Club-Specific Events (LEVEL 2)
        if (matchedClub != null && (normalized.contains("event") || normalized.contains("host") ||
                normalized.contains("organize") || normalized.contains("conduct") || normalized.contains("show") ||
                normalized.contains("what") || normalized.contains("which") || normalized.contains("hosted by") ||
                normalized.contains("from"))) {
            return Intent.CLUB_EVENTS;
        }

        // 6. Available Clubs List
        if (normalized.contains("all club") || normalized.contains("all clubs") ||
                normalized.contains("club name") || normalized.contains("club names") ||
                normalized.contains("list club") || normalized.contains("list clubs") ||
                normalized.contains("list of club") || normalized.contains("list of clubs") ||
                normalized.contains("available club") || normalized.contains("available clubs") ||
                normalized.contains("which club") || normalized.contains("which clubs") ||
                normalized.contains("what club") || normalized.contains("what clubs") ||
                normalized.contains("show club") || normalized.contains("show clubs") ||
                normalized.contains("tell club") || normalized.contains("tell me club") ||
                normalized.contains("give club") || normalized.contains("give all club") ||
                normalized.contains("names of club") || normalized.contains("names of clubs") ||
                normalized.equals("clubs") || normalized.equals("clubs list") || normalized.equals("club list") ||
                normalized.matches(".*\\b(list|all|show|give|what|which|tell|available|names?|get)\\b.*\\b(clubs?|societies|groups?)\\b.*")) {
            return Intent.CLUBS_LIST;
        }

        // 7. Ended / Past Events (MUST BE BEFORE ACTIVE/ONGOING/UPCOMING)
        if (normalized.contains("ended") || normalized.contains("past event") || normalized.contains("past events") ||
                normalized.contains("completed event") || normalized.contains("completed events") ||
                normalized.contains("expired event") || normalized.contains("expired events") ||
                normalized.contains("closed event") || normalized.contains("closed events") ||
                normalized.contains("previous event") || normalized.contains("previous events") ||
                normalized.contains("concluded")) {
            return Intent.EVENTS_ENDED;
        }

        // 8. Ongoing Events (Events with registration currently active / live right now)
        if (normalized.contains("ongoing") || normalized.contains("happening now") ||
                normalized.contains("current event") || normalized.contains("current events") ||
                normalized.contains("live event") || normalized.contains("live events")) {
            return Intent.EVENTS_ONGOING;
        }

        // 9. Upcoming Events (Events in the future / scheduled soon)
        if (normalized.contains("upcoming") || normalized.contains("future event") || normalized.contains("future events") ||
                normalized.contains("coming event") || normalized.contains("coming events") ||
                normalized.contains("coming up") || normalized.contains("next week") || normalized.contains("next month")) {
            return Intent.EVENTS_UPCOMING;
        }

        // 10. Registration Process / Procedure (Semantic Paraphrases)
        if (requestedAttribute == RequestedAttribute.REGISTRATION_PROCEDURE || normalized.contains("register") ||
                normalized.contains("apply") || normalized.contains("applying") ||
                normalized.contains("take part") || normalized.contains("sign up") ||
                normalized.contains("procedure") || normalized.contains("steps to") || normalized.contains("process to") ||
                normalized.contains("process of") || normalized.contains("how do i") || normalized.contains("how can i") ||
                normalized.contains("how to") || normalized.contains("what should i do")) {
            return Intent.KNOWLEDGE_REGISTRATION;
        }

        // 11. Specific Event Information
        if (matchedEvent != null && !normalized.contains("register") && !normalized.contains("apply") && !normalized.contains("how to") && !normalized.contains("procedure")) {
            return Intent.EVENT_DETAIL;
        }

        // 12. Active / All Events
        if (normalized.contains("active") || normalized.contains("available events") ||
                normalized.contains("list events") || normalized.contains("what events") ||
                normalized.contains("which events") || normalized.contains("all events") ||
                normalized.contains("show events") || normalized.contains("tell me events") ||
                normalized.contains("any events") || normalized.contains("events available") ||
                normalized.contains("events scheduled") ||
                normalized.equals("events") || normalized.equals("show events") ||
                normalized.matches(".*\\b(what|which|show|list|tell|any|are\\s+there)\\s+.*(events?|competitions?|fests?|workshops?).*")) {
            return Intent.EVENTS_ACTIVE;
        }

        // 13. Eligibility vs Procedure
        if (requestedAttribute == RequestedAttribute.ELIGIBILITY || normalized.contains("who can participate") ||
                normalized.contains("who is eligible") || normalized.contains("eligibility") ||
                normalized.contains("can anyone participate") || normalized.contains("who is allowed")) {
            return Intent.KNOWLEDGE_ELIGIBILITY;
        }

        // 14. Rules & Regulations
        if (requestedAttribute == RequestedAttribute.RULES || normalized.contains("rule") ||
                normalized.contains("conduct") || normalized.contains("id card") || normalized.contains("dress code")) {
            return Intent.KNOWLEDGE_RULES;
        }

        return Intent.GENERAL;
    }

    private DataSource determineDataSource(Intent intent, RequestedAttribute attribute, EntityScope scope) {
        if (intent == Intent.PRIVACY_ATTACK || intent == Intent.GREETING || intent == Intent.AMBIGUOUS_QUERY) {
            return DataSource.SYSTEM;
        }
        if (intent == Intent.WINNERS || intent == Intent.CLUB_EVENTS || intent == Intent.CLUBS_LIST ||
                intent == Intent.EVENTS_ONGOING || intent == Intent.EVENTS_UPCOMING ||
                intent == Intent.EVENTS_ACTIVE || intent == Intent.EVENTS_ENDED ||
                intent == Intent.EVENT_DETAIL || intent == Intent.PRIVATE_STUDENT_DATA) {
            return DataSource.DATABASE;
        }
        if (attribute == RequestedAttribute.WINNER) {
            return DataSource.DATABASE;
        }
        return DataSource.KNOWLEDGE_BASE;
    }

    private List<String> extractEntities(String normalized, String matchedClub, String matchedEvent,
                                        List<String> campusEntities, String primaryEntity) {
        List<String> entities = new ArrayList<>();
        if (matchedClub != null) entities.add(matchedClub);
        if (matchedEvent != null) entities.add(matchedEvent);
        if (campusEntities != null) {
            entities.addAll(campusEntities);
        }
        if (primaryEntity != null && !entities.contains(primaryEntity)) {
            entities.add(primaryEntity);
        }

        for (String entity : KNOWN_STATIC_ENTITIES) {
            if (normalized.contains(entity) && !entities.contains(entity)) {
                entities.add(entity);
            }
        }
        return entities;
    }

    private List<String> generateRetrievalVariants(String normalized, Intent intent, List<String> entities, RequestedAttribute attribute) {
        Set<String> variants = new LinkedHashSet<>();
        variants.add(normalized);

        if (intent == Intent.KNOWLEDGE_DEPARTMENT_LOCATION) {
            for (String entity : entities) {
                variants.add("Where is " + entity + " department");
                variants.add(entity + " department location");
                variants.add(entity + " building floor");
            }
        } else if (intent == Intent.KNOWLEDGE_REGISTRATION) {
            variants.add("registration process");
            variants.add("how can i register for an event");
            variants.add("how to apply for events");
            variants.add("steps to participate in college events");
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
