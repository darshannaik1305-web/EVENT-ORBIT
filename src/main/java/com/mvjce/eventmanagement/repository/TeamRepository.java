package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByEventId(String eventId);
    Optional<Team> findByEventIdAndLeaderId(String eventId, String leaderId);
    boolean existsByEventIdAndLeaderId(String eventId, String leaderId);
    long countByEventId(String eventId);
}
