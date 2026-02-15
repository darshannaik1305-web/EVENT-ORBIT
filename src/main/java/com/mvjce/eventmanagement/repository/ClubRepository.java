package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, String> {
    Optional<Club> findByName(String name);
    boolean existsByName(String name);
}
