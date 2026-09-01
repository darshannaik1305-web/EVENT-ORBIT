package com.mvjce.eventmanagement.rag;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UsnDepartmentResolver {

    // Validates standard college USN structure: 1 digit + 2 letters + 2 digits (year) + 2-4 letters (department) + 3-4 digits (roll number)
    // Example: 1MJ23CS200, 1MJ23CG011, 1MJ25CD400, 1MJ24EC163, 1MJ21ME409, 1MJ45IS890
    private static final Pattern USN_PATTERN = Pattern.compile(
            "^\\s*\\d{1}[a-zA-Z]{2}\\d{2}([a-zA-Z]{2,4})\\d+\\s*$"
    );

    // Canonical department codes verified from project data and QueryProcessor definitions
    private static final Set<String> KNOWN_DEPARTMENT_CODES = Set.of(
            "CS", "CG", "CD", "EC", "ECE", "IS", "ISE", "AI", "AIML", "ME"
    );

    // Explicit alias mappings defined in project QueryProcessor
    private static final Map<String, String> CANONICAL_ALIASES = new HashMap<>();
    static {
        CANONICAL_ALIASES.put("CS", "CS");
        CANONICAL_ALIASES.put("CSE", "CS");
        CANONICAL_ALIASES.put("COMPUTER SCIENCE", "CS");

        CANONICAL_ALIASES.put("CG", "CG");
        CANONICAL_ALIASES.put("COMPUTER GRAPHICS", "CG");

        CANONICAL_ALIASES.put("CD", "CD");

        CANONICAL_ALIASES.put("EC", "EC");
        CANONICAL_ALIASES.put("ECE", "EC");
        CANONICAL_ALIASES.put("ELECTRONICS", "EC");

        CANONICAL_ALIASES.put("IS", "IS");
        CANONICAL_ALIASES.put("ISE", "IS");
        CANONICAL_ALIASES.put("INFORMATION SCIENCE", "IS");

        CANONICAL_ALIASES.put("AI", "AIML");
        CANONICAL_ALIASES.put("AIML", "AIML");
        CANONICAL_ALIASES.put("ARTIFICIAL INTELLIGENCE", "AIML");

        CANONICAL_ALIASES.put("ME", "ME");
        CANONICAL_ALIASES.put("MECH", "ME");
    }

    /**
     * Deterministically resolves the department code from a student USN.
     * Returns null if the USN format is invalid, missing, or uncertain.
     * Never guesses or relies on an LLM.
     */
    public static String resolveDepartment(String usn) {
        if (usn == null || usn.isBlank()) {
            return null;
        }

        String cleanUsn = usn.trim();
        Matcher matcher = USN_PATTERN.matcher(cleanUsn);
        if (matcher.matches()) {
            String deptToken = matcher.group(1).toUpperCase();
            return normalizeDepartmentCode(deptToken);
        }

        return null;
    }

    /**
     * Normalizes a department name or code to its canonical representation.
     * Returns null if the department is unrecognized.
     */
    public static String normalizeDepartmentCode(String input) {
        if (input == null || input.isBlank()) {
            return null;
        }

        String upper = input.trim().toUpperCase();
        if (CANONICAL_ALIASES.containsKey(upper)) {
            return CANONICAL_ALIASES.get(upper);
        }

        if (KNOWN_DEPARTMENT_CODES.contains(upper)) {
            return upper;
        }

        return null;
    }

    /**
     * Checks if a department code/alias is recognized by the system.
     */
    public static boolean isKnownDepartment(String dept) {
        return normalizeDepartmentCode(dept) != null;
    }

    /**
     * Deterministically checks if a USN belongs to the requested department.
     * Strict: returns false if either USN or requestedDept cannot be parsed/recognized.
     */
    public static boolean matchesDepartment(String usn, String requestedDept) {
        if (usn == null || requestedDept == null || usn.isBlank() || requestedDept.isBlank()) {
            return false;
        }

        String usnDept = resolveDepartment(usn);
        if (usnDept == null) {
            return false;
        }

        String targetDept = normalizeDepartmentCode(requestedDept);
        if (targetDept == null) {
            return false;
        }

        return usnDept.equalsIgnoreCase(targetDept);
    }
}
