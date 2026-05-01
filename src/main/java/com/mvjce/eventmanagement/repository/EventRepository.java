package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findByClubId(String clubId);
    List<Event> findByClubIdOrderByRegStartDesc(String clubId);
    List<Event> findByRegStartBeforeOrderByRegStartDesc(LocalDateTime date);
    List<Event> findByClubIdAndId(String clubId, String eventId);
    boolean existsByNameIgnoreCase(String name);

@Modifying
@Query("DELETE FROM Event e WHERE e.clubId = :clubId")
void deleteByClubId(@Param("clubId") String clubId);
}
