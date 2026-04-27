package com.skillbank.dispute;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DisputeRepository extends JpaRepository<DisputeReport, Long> {

    Optional<DisputeReport> findBySessionId(Long sessionId);

    List<DisputeReport> findByStatus(DisputeStatus status);

    boolean existsBySessionIdAndStatus(Long sessionId, DisputeStatus status);
}
