package com.mvjce.eventmanagement.repository;

import com.mvjce.eventmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);

    long countByRoleAndAdminClubId(String role, String adminClubId);

    long countByRoleAndAdminClubIdAndEnabledTrue(String role, String adminClubId);

    List<User> findByRoleIgnoreCase(String role);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_roles WHERE user_id = ?1", nativeQuery = true)
    void deleteUserRoles(String userId);
}
