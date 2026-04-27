package com.skillbank.dispute;

import com.skillbank.dispute.dto.FileDisputeRequest;
import com.skillbank.dispute.dto.ResolveDisputeRequest;
import com.skillbank.session.Session;
import com.skillbank.session.SessionRepository;
import com.skillbank.session.SessionStatus;
import com.skillbank.transaction.EscrowService;
import com.skillbank.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepo;
    private final SessionRepository sessionRepo;
    private final EscrowService escrowService;

    @Transactional
    public DisputeReport fileDispute(User learner, FileDisputeRequest request) {
        Session session = sessionRepo.findById(request.getSessionId())
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        if (!session.getLearner().getId().equals(learner.getId())) {
            throw new IllegalStateException("Only the learner can file a dispute");
        }
        if (session.getStatus() != SessionStatus.CONFIRMED) {
            throw new IllegalStateException("Disputes can only be filed on CONFIRMED sessions");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(session.getScheduledAt()) || now.isAfter(session.getEndTime())) {
            throw new IllegalStateException("Disputes can only be filed during the session window");
        }

        if (disputeRepo.existsBySessionIdAndStatus(session.getId(), DisputeStatus.OPEN)) {
            throw new IllegalStateException("A dispute is already open for this session");
        }

        session.setStatus(SessionStatus.DISPUTED);
        sessionRepo.save(session);

        return disputeRepo.save(DisputeReport.builder()
                .session(session)
                .filedBy(learner)
                .reason(request.getReason())
                .status(DisputeStatus.OPEN)
                .build());
    }

    @Transactional
    public DisputeReport resolve(User admin, ResolveDisputeRequest request) {
        DisputeReport dispute = disputeRepo.findById(request.getDisputeId())
                .orElseThrow(() -> new EntityNotFoundException("Dispute not found"));

        if (dispute.getStatus() != DisputeStatus.OPEN) {
            throw new IllegalStateException("Dispute is already resolved");
        }

        if (request.getResolution() == DisputeStatus.RESOLVED_REFUND) {
            escrowService.refundToLearner(dispute.getSession());
            dispute.getSession().setStatus(SessionStatus.REFUNDED);
        } else if (request.getResolution() == DisputeStatus.RESOLVED_RELEASE) {
            escrowService.releaseToTeacher(dispute.getSession());
        } else {
            throw new IllegalArgumentException("Invalid resolution status");
        }

        dispute.setStatus(request.getResolution());
        dispute.setAdminNotes(request.getAdminNotes());
        dispute.setResolvedBy(admin);
        dispute.setResolvedAt(LocalDateTime.now());

        sessionRepo.save(dispute.getSession());
        return disputeRepo.save(dispute);
    }

    @Transactional(readOnly = true)
    public List<DisputeReport> getOpenDisputes() {
        return disputeRepo.findByStatus(DisputeStatus.OPEN);
    }

    @Transactional(readOnly = true)
    public DisputeReport getDisputeForSession(Long sessionId) {
        return disputeRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("No dispute found for session " + sessionId));
    }
}
