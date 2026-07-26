package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, String> {
    List<TeamMember> findByTeamId(String teamId);
    Optional<TeamMember> findByTeamIdAndUserId(String teamId, String userId);
    boolean existsByTeamIdAndUserId(String teamId, String userId);

    @Query("SELECT tm FROM TeamMember tm JOIN tm.team t WHERE t.eventId = :eventId AND tm.userId = :userId")
    Optional<TeamMember> findByEventIdAndUserId(@Param("eventId") String eventId, @Param("userId") String userId);

    @Query("SELECT CASE WHEN COUNT(tm) > 0 THEN true ELSE false END FROM TeamMember tm JOIN tm.team t WHERE t.eventId = :eventId AND tm.userId = :userId")
    boolean existsByEventIdAndUserId(@Param("eventId") String eventId, @Param("userId") String userId);

    List<TeamMember> findByUserId(String userId);
}
