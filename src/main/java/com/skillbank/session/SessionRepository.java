package com.skillbank.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByTeacherIdOrderByScheduledAtDesc(Long teacherId);

    List<Session> findByLearnerIdOrderByScheduledAtDesc(Long learnerId);

    List<Session> findByTeacherIdAndStatus(Long teacherId, SessionStatus status);

    @Query("""
        SELECT s FROM Session s
        WHERE s.status = 'CONFIRMED'
          AND NOT EXISTS (
              SELECT 1 FROM DisputeReport d
              WHERE d.session.id = s.id AND d.status = 'OPEN'
          )
        """)
    List<Session> findConfirmedWithNoOpenDispute();

    @Query("SELECT s FROM Session s WHERE s.status = 'PENDING' AND s.scheduledAt <= :cutoff")
    List<Session> findPendingSessionsApproachingDeadline(@Param("cutoff") LocalDateTime cutoff);

    @Query("""
        SELECT s FROM Session s
        WHERE (s.teacher.id = :userId OR s.learner.id = :userId)
        ORDER BY s.scheduledAt DESC
        """)
    List<Session> findAllByUserId(@Param("userId") Long userId);
}
