package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);

    long countByRoleAndAdminClubId(String role, String adminClubId);

    long countByRoleAndAdminClubIdAndEnabledTrue(String role, String adminClubId);
}
