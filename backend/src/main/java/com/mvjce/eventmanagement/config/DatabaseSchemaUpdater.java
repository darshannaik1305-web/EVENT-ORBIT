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
        } catch (Exception e) {
            System.out.println("Notice: Table column alteration info: " + e.getMessage());
        }
    }
}
