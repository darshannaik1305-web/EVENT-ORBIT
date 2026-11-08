package com.mvjce.eventmanagement.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaUpdater implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE clubs MODIFY COLUMN image_url LONGTEXT");
            jdbcTemplate.execute("ALTER TABLE clubs MODIFY COLUMN banner_url LONGTEXT");
            jdbcTemplate.execute("ALTER TABLE events MODIFY COLUMN bg_image_url LONGTEXT");
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE");
            } catch (Exception ignored) {
                // Column may already exist
            }

            // Safe, idempotent migration: identify and demote ONLY legacy Student USN accounts (pattern: ^1[A-Za-z0-9]{9}$)
            // Real Lecturer Club Admin IDs (e.g. CODINGCLUB01, ROBOTICSCLUB01) will NEVER be affected.
            int updatedLegacyUsers = jdbcTemplate.update(
                "UPDATE users SET role = 'STUDENT', admin_club_id = NULL " +
                "WHERE role = 'CLUB_ADMIN' AND username REGEXP '^1[a-zA-Z0-9]{9}$'"
            );
            if (updatedLegacyUsers > 0) {
                System.out.println("Migration: Demoted " + updatedLegacyUsers + " legacy student account(s) back to standard STUDENT role.");
            }

            int deletedLegacyMappings = jdbcTemplate.update(
                "DELETE FROM club_admins WHERE username REGEXP '^1[a-zA-Z0-9]{9}$'"
            );
            if (deletedLegacyMappings > 0) {
                System.out.println("Migration: Cleaned up " + deletedLegacyMappings + " legacy student mapping(s) from club_admins.");
            }
        } catch (Exception e) {
            System.out.println("Notice: Database schema/migration info: " + e.getMessage());
        }
    }
}
