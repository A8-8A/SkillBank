package com.skillbank.skill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByCategoryId(Long categoryId);

    Optional<Skill> findByNameIgnoreCaseAndCategoryId(String name, Long categoryId);

    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Skill> searchByName(@Param("query") String query);

    @Query("SELECT s FROM Skill s JOIN s.tags t WHERE t.name = :tag")
    List<Skill> findByTag(@Param("tag") String tag);
}
