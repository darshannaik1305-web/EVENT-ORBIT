package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.Club;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClubRepository extends MongoRepository<Club, String> {
    Optional<Club> findByName(String name);
    boolean existsByName(String name);
}
