package com.skillbank.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByVerificationToken(String verificationToken);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByReferralCode(String referralCode);

    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN UserSkill us ON us.user.id = u.id
        LEFT JOIN us.skill s
        LEFT JOIN s.category c
        LEFT JOIN s.tags t
        WHERE LOWER(u.name) LIKE %:query%
           OR LOWER(s.name) LIKE %:query%
           OR LOWER(c.name) LIKE %:query%
           OR LOWER(t.name) LIKE %:query%
        """)
    List<User> searchByNameOrSkillOrCategoryOrTag(@Param("query") String query);
}
