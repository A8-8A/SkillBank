package com.skillbank.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsBySessionIdAndReviewerId(Long sessionId, Long reviewerId);

    List<Review> findByRevieweeIdAndTypeOrderByCreatedAtDesc(Long revieweeId, ReviewType type);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.type = :type")
    Double getAverageRating(@Param("userId") Long userId, @Param("type") ReviewType type);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId AND r.type = :type")
    long countByRevieweeAndType(@Param("userId") Long userId, @Param("type") ReviewType type);

    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    @Query("SELECT r FROM Review r WHERE r.reviewer.id = :userId OR r.reviewee.id = :userId")
    List<Review> findAllByUserId(@Param("userId") Long userId);
}
