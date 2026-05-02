package com.skillbank.session;

import com.skillbank.email.EmailService;
import com.skillbank.session.dto.BookSessionRequest;
import com.skillbank.skill.Skill;
import com.skillbank.skill.SkillRepository;
import com.skillbank.transaction.EscrowService;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepo;
    private final UserRepository userRepo;
    private final SkillRepository skillRepo;
    private final EscrowService escrowService;
    private final EmailService emailService;

    @Transactional
    public Session book(User learner, BookSessionRequest request) {
        if (learner.getId().equals(request.getTeacherId())) {
            throw new IllegalArgumentException("You cannot book a session with yourself");
        }
        if (request.getScheduledAt().isBefore(LocalDateTime.now().plusHours(24))) {
            throw new IllegalArgumentException("Sessions must be booked at least 24 hours in advance");
        }

        User teacher = userRepo.findById(request.getTeacherId())
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found"));

        Skill skill = skillRepo.findById(request.getSkillId())
                .orElseThrow(() -> new EntityNotFoundException("Skill not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime requestedStart = request.getScheduledAt();
        int requestedDuration = request.getDurationMinutes();

        // Check teacher has no overlapping session
        for (Session existing : sessionRepo.findActiveSessionsByTeacherId(teacher.getId(), now)) {
            if (overlaps(requestedStart, requestedDuration, existing.getScheduledAt(), existing.getDurationMinutes())) {
                throw new IllegalStateException(
                    "The teacher already has a session booked at this time. Please choose a different time.");
            }
        }

        // Check learner has no overlapping session (prevents same person booking two sessions at once)
        for (Session existing : sessionRepo.findActiveSessionsByLearnerId(learner.getId(), now)) {
            if (overlaps(requestedStart, requestedDuration, existing.getScheduledAt(), existing.getDurationMinutes())) {
                throw new IllegalStateException(
                    "You already have a session booked at this time. Please choose a different time.");
            }
        }

        Session session = Session.builder()
                .learner(learner)
                .teacher(teacher)
                .skill(skill)
                .scheduledAt(request.getScheduledAt())
                .durationMinutes(request.getDurationMinutes())
                .notes(request.getNotes())
                .status(SessionStatus.PENDING)
                .build();

        session = sessionRepo.save(session);
        escrowService.holdEscrow(session);
        emailService.notifyTeacherOfNewBooking(session);
        return session;
    }

    private boolean overlaps(LocalDateTime start1, int duration1, LocalDateTime start2, int duration2) {
        LocalDateTime end1 = start1.plusMinutes(duration1);
        LocalDateTime end2 = start2.plusMinutes(duration2);
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    @Transactional
    public Session confirm(User teacher, Long sessionId) {
        Session session = getSession(sessionId);

        if (!session.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalStateException("Only the teacher can confirm this session");
        }
        if (session.getStatus() != SessionStatus.PENDING) {
            throw new IllegalStateException("Session is not in PENDING state");
        }

        session.setStatus(SessionStatus.CONFIRMED);
        session = sessionRepo.save(session);
        emailService.notifyLearnerSessionConfirmed(session);
        return session;
    }

    @Transactional
    public Session cancel(User teacher, Long sessionId) {
        Session session = getSession(sessionId);

        if (!session.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalStateException("Only the teacher can cancel this session");
        }
        if (session.getStatus() != SessionStatus.PENDING && session.getStatus() != SessionStatus.CONFIRMED) {
            throw new IllegalStateException("Only PENDING or CONFIRMED sessions can be cancelled");
        }

        session.setStatus(SessionStatus.CANCELLED);
        sessionRepo.save(session);
        escrowService.refundToLearner(session);
        emailService.notifyLearnerSessionRejected(session);
        return session;
    }

    @Transactional(readOnly = true)
    public List<Session> getMySessionsAsTeacher(User teacher) {
        return sessionRepo.findByTeacherIdOrderByScheduledAtDesc(teacher.getId());
    }

    @Transactional(readOnly = true)
    public List<Session> getMySessionsAsLearner(User learner) {
        return sessionRepo.findByLearnerIdOrderByScheduledAtDesc(learner.getId());
    }

    @Transactional(readOnly = true)
    public List<Session> getAllMySessions(User user) {
        return sessionRepo.findAllByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public Session getSession(Long sessionId) {
        return sessionRepo.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found: " + sessionId));
    }
}
