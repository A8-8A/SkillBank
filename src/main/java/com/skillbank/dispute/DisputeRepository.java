package com.skillbank.dispute;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DisputeRepository extends JpaRepository<DisputeReport, Long> {

    Optional<DisputeReport> findBySessionId(Long sessionId);

    List<DisputeReport> findByStatus(DisputeStatus status);

    boolean existsBySessionIdAndStatus(Long sessionId, DisputeStatus status);

    List<DisputeReport> findBySessionIdIn(List<Long> sessionIds);

    @Modifying
    @Query("UPDATE DisputeReport d SET d.resolvedBy = null WHERE d.resolvedBy.id = :userId")
    void nullifyResolvedBy(@Param("userId") Long userId);
}
