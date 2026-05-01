package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.Winner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WinnerRepository extends JpaRepository<Winner, String> {
    
    List<Winner> findByEventId(String eventId);
    
    List<Winner> findByEventIdOrderByPositionAsc(String eventId);
    
    List<Winner> findByClubIdOrderByCreatedAtDesc(String clubId);
    
    Optional<Winner> findByEventIdAndPosition(String eventId, Winner.Position position);
    
    @Query("SELECT w FROM Winner w WHERE w.eventId = :eventId ORDER BY w.position")
    List<Winner> findWinnersByEventId(@Param("eventId") String eventId);
    
    @Query("SELECT DISTINCT w.clubId FROM Winner w")
    List<String> findAllClubIdsWithWinners();
    
    boolean existsByEventIdAndPosition(String eventId, Winner.Position position);
    
    boolean existsByEventIdAndUsername(String eventId, String username);

    @Modifying
    @Query("DELETE FROM Winner w WHERE w.eventId = :eventId")
    void deleteByEventId(@Param("eventId") String eventId);
}
