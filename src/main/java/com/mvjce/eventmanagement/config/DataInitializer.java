package com.mvjce.eventmanagement.config;

import com.mvjce.eventmanagement.model.Club;
import com.mvjce.eventmanagement.model.Event;
import com.mvjce.eventmanagement.model.User;
import com.mvjce.eventmanagement.repository.ClubRepository;
import com.mvjce.eventmanagement.repository.EventRepository;
import com.mvjce.eventmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User admin = userRepository.findByUsernameIgnoreCase("admin").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setMobile("9999999999");
        }
        if (admin.getRole() == null || !admin.getRole().equals("ADMIN")) {
            admin.setRole("ADMIN");
        }
        admin.setEnabled(true);
        if (admin.getPassword() == null || admin.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode("admin123"));
        }
        userRepository.save(admin);

        User student = userRepository.findByUsernameIgnoreCase("student").orElse(null);
        if (student == null) {
            student = new User();
            student.setUsername("student");
            student.setMobile("1234567890");
        }
        if (student.getRole() == null || student.getRole().isBlank()) {
            student.setRole("USER");
        }
        student.setEnabled(true);
        if (student.getPassword() == null || student.getPassword().isBlank()) {
            student.setPassword(passwordEncoder.encode("1234"));
        }
        userRepository.save(student);

        // Initialize clubs if not exists
        if (clubRepository.count() == 0) {
            Club[] clubs = {
                new Club("AAKRITI", "https://mvjce.edu.in/wp-content/uploads/2024/03/Aakriti.jpg"),
                new Club("SAAHITYA", "https://mvjce.edu.in/wp-content/uploads/2024/03/Saahitya.jpg"),
                new Club("DHWANI", "https://mvjce.edu.in/wp-content/uploads/2024/03/Dhwani.jpg"),
                new Club("INSCRIBE", "https://mvjce.edu.in/wp-content/uploads/2024/03/inscribe-create-design.jpg"),
                new Club("NRITYATRIX", "https://mvjce.edu.in/wp-content/uploads/2024/03/NRITYATRIX.jpg"),
                new Club("SOFTWARE DEVELOPMENT CLUB", "https://mvjce.edu.in/wp-content/uploads/2024/03/Software-Development-Club.jpg"),
                new Club("TOASTMASTERS", "https://mvjce.edu.in/wp-content/uploads/2024/03/toastmaster.jpg"),
                new Club("RAAGABINAYA", "https://mvjce.edu.in/wp-content/uploads/2024/03/THEATRE.jpg")
            };

            for (Club club : clubs) {
                club.setCreatedBy("system");
                club.setCreatedAt(LocalDateTime.now());
                club.setUpdatedBy("system");
                club.setUpdatedAt(LocalDateTime.now());
                clubRepository.save(club);
            }
        }

        // Initialize sample events if not exists
        if (eventRepository.count() == 0) {
            Club aakriti = clubRepository.findByName("AAKRITI").orElse(null);
            Club saahitya = clubRepository.findByName("SAAHITYA").orElse(null);
            Club dhwani = clubRepository.findByName("DHWANI").orElse(null);
            Club inscribe = clubRepository.findByName("INSCRIBE").orElse(null);
            Club nrityatrix = clubRepository.findByName("NRITYATRIX").orElse(null);
            
            // AAKRITI Events
            if (aakriti != null && aakriti.getId() != null) {
                Event event1 = new Event();
                event1.setName("Art Workshop");
                event1.setDescription("Learn various art techniques from professional artists");
                event1.setClubId(aakriti.getId());
                event1.setRegStart(LocalDateTime.now().minusDays(1));
                event1.setRegEnd(LocalDateTime.now().plusDays(7));
                event1.setBgImageUrl("");
                event1.setCreatedBy("system");
                event1.setCreatedAt(LocalDateTime.now());
                event1.setUpdatedBy("system");
                event1.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event1);

                Event event2 = new Event();
                event2.setName("Painting Competition");
                event2.setDescription("Showcase your painting skills and win exciting prizes");
                event2.setClubId(aakriti.getId());
                event2.setRegStart(LocalDateTime.now().minusDays(2));
                event2.setRegEnd(LocalDateTime.now().plusDays(5));
                event2.setBgImageUrl("");
                event2.setCreatedBy("system");
                event2.setCreatedAt(LocalDateTime.now());
                event2.setUpdatedBy("system");
                event2.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event2);
            }

            // SAAHITYA Events
            if (saahitya != null && saahitya.getId() != null) {
                Event event3 = new Event();
                event3.setName("Poetry Competition");
                event3.setDescription("Showcase your poetic talent and win exciting prizes");
                event3.setClubId(saahitya.getId());
                event3.setRegStart(LocalDateTime.now().minusDays(2));
                event3.setRegEnd(LocalDateTime.now().plusDays(5));
                event3.setBgImageUrl("");
                event3.setCreatedBy("system");
                event3.setCreatedAt(LocalDateTime.now());
                event3.setUpdatedBy("system");
                event3.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event3);

                Event event4 = new Event();
                event4.setName("Story Writing Workshop");
                event4.setDescription("Learn the art of storytelling from renowned authors");
                event4.setClubId(saahitya.getId());
                event4.setRegStart(LocalDateTime.now().plusDays(1));
                event4.setRegEnd(LocalDateTime.now().plusDays(8));
                event4.setBgImageUrl("");
                event4.setCreatedBy("system");
                event4.setCreatedAt(LocalDateTime.now());
                event4.setUpdatedBy("system");
                event4.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event4);
            }

            // DHWANI Events
            if (dhwani != null && dhwani.getId() != null) {
                Event event5 = new Event();
                event5.setName("Music Concert");
                event5.setDescription("Enjoy performances by talented musicians");
                event5.setClubId(dhwani.getId());
                event5.setRegStart(LocalDateTime.now().minusDays(3));
                event5.setRegEnd(LocalDateTime.now().plusDays(4));
                event5.setBgImageUrl("");
                event5.setCreatedBy("system");
                event5.setCreatedAt(LocalDateTime.now());
                event5.setUpdatedBy("system");
                event5.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event5);
            }

            // INSCRIBE Events
            if (inscribe != null && inscribe.getId() != null) {
                Event event6 = new Event();
                event6.setName("Logo Design Competition");
                event6.setDescription("Design creative logos and win recognition");
                event6.setClubId(inscribe.getId());
                event6.setRegStart(LocalDateTime.now().plusDays(2));
                event6.setRegEnd(LocalDateTime.now().plusDays(10));
                event6.setBgImageUrl("");
                event6.setCreatedBy("system");
                event6.setCreatedAt(LocalDateTime.now());
                event6.setUpdatedBy("system");
                event6.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event6);
            }

            // NRITYATRIX Events
            if (nrityatrix != null && nrityatrix.getId() != null) {
                Event event7 = new Event();
                event7.setName("Dance Workshop");
                event7.setDescription("Learn various dance forms from professional choreographers");
                event7.setClubId(nrityatrix.getId());
                event7.setRegStart(LocalDateTime.now().minusDays(1));
                event7.setRegEnd(LocalDateTime.now().plusDays(6));
                event7.setBgImageUrl("");
                event7.setCreatedBy("system");
                event7.setCreatedAt(LocalDateTime.now());
                event7.setUpdatedBy("system");
                event7.setUpdatedAt(LocalDateTime.now());
                eventRepository.save(event7);
            }
        }
    }
}
