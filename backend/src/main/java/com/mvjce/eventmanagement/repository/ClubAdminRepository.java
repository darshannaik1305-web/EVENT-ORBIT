package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.ClubAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubAdminRepository extends JpaRepository<ClubAdmin, String> {
    List<ClubAdmin> findByUsernameIgnoreCase(String username);
    List<ClubAdmin> findByUsernameIgnoreCaseAndEnabledTrue(String username);
    List<ClubAdmin> findByClubId(String clubId);
    List<ClubAdmin> findByClubIdAndEnabledTrue(String clubId);
    long countByClubIdAndEnabledTrue(String clubId);
    boolean existsByUsernameIgnoreCaseAndClubId(String username, String clubId);
    Optional<ClubAdmin> findByUsernameIgnoreCaseAndClubId(String username, String clubId);
    void deleteByUsernameIgnoreCase(String username);
}
