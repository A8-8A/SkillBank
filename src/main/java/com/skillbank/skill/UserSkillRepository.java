package com.skillbank.skill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUserIdAndType(Long userId, SkillType type);

    List<UserSkill> findByUserId(Long userId);

    boolean existsByUserIdAndSkillIdAndType(Long userId, Long skillId, SkillType type);

    @Query("""
        SELECT DISTINCT u FROM UserSkill u
        WHERE u.type = 'OFFER'
          AND u.skill.id IN (
              SELECT seek.skill.id FROM UserSkill seek
              WHERE seek.user.id = :requestingUserId AND seek.type = 'SEEK'
          )
          AND u.user.id != :requestingUserId
        """)
    List<UserSkill> findOffersMatchingMySeeks(@Param("requestingUserId") Long requestingUserId);

    @Query("""
        SELECT DISTINCT match_offer.user FROM UserSkill match_offer
        JOIN UserSkill my_seek
            ON my_seek.skill.id = match_offer.skill.id
           AND my_seek.user.id = :userId
           AND my_seek.type = 'SEEK'
        JOIN UserSkill match_seek ON match_seek.user.id = match_offer.user.id
           AND match_seek.type = 'SEEK'
        JOIN UserSkill my_offer
            ON my_offer.skill.id = match_seek.skill.id
           AND my_offer.user.id = :userId
           AND my_offer.type = 'OFFER'
        WHERE match_offer.type = 'OFFER'
          AND match_offer.user.id != :userId
        """)
    List<com.skillbank.user.User> findMutualMatches(@Param("userId") Long userId);

    @Query("""
        SELECT DISTINCT seeker.user FROM UserSkill seeker
        WHERE seeker.type = 'SEEK'
          AND seeker.user.id != :userId
          AND seeker.skill.id IN (
              SELECT offer.skill.id FROM UserSkill offer
              WHERE offer.user.id = :userId AND offer.type = 'OFFER'
          )
        """)
    List<com.skillbank.user.User> findUsersSeekingMySkills(@Param("userId") Long userId);
}
