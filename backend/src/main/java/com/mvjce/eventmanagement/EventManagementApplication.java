package com.mvjce.eventmanagement;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class EventManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventManagementApplication.class, args);
    }

    @Bean
    public CommandLineRunner updateTableSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE clubs MODIFY COLUMN image_url LONGTEXT");
                jdbcTemplate.execute("ALTER TABLE clubs MODIFY COLUMN banner_url LONGTEXT");
                jdbcTemplate.execute("ALTER TABLE events MODIFY COLUMN bg_image_url LONGTEXT");
            } catch (Exception e) {
                System.out.println("Notice: Table column alteration info: " + e.getMessage());
            }
        };
    }
}
