package com.skillbank.scheduler;

import com.skillbank.email.EmailService;
import com.skillbank.session.Session;
import com.skillbank.session.SessionRepository;
import com.skillbank.transaction.EscrowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionScheduler {

    private final SessionRepository sessionRepo;
    private final EscrowService escrowService;
    private final EmailService emailService;

    @Scheduled(fixedDelay = 60_000)
    public void cancelUnconfirmedSessions() {
        LocalDateTime cutoff = LocalDateTime.now().plusHours(24);
        List<Session> expiring = sessionRepo.findPendingSessionsApproachingDeadline(cutoff);

        if (!expiring.isEmpty()) {
            log.info("Auto-cancelling {} unconfirmed sessions past the 24h deadline", expiring.size());
        }

        for (Session session : expiring) {
            try {
                session.setStatus(com.skillbank.session.SessionStatus.CANCELLED);
                sessionRepo.save(session);
                escrowService.refundToLearner(session);
                emailService.notifyBothAutoCancelled(session);
            } catch (Exception e) {
                log.error("Failed to auto-cancel session {}: {}", session.getId(), e.getMessage());
            }
        }
    }

    @Scheduled(fixedDelay = 60_000)
    public void releaseCompletedSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<Session> due = sessionRepo.findConfirmedWithNoOpenDispute().stream()
                .filter(s -> !s.getEndTime().isAfter(now))
                .toList();

        if (!due.isEmpty()) {
            log.info("Auto-releasing {} completed sessions", due.size());
        }

        for (Session session : due) {
            try {
                escrowService.releaseToTeacher(session);
            } catch (Exception e) {
                log.error("Failed to release session {}: {}", session.getId(), e.getMessage());
            }
        }
    }
}
