package com.skillbank.email;

import com.skillbank.session.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.url:http://localhost:5173}")
    private String appUrl;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("EEEE, MMM d yyyy 'at' h:mm a");

    // ── CRITICAL EMAILS (synchronous — no @Async) ──────────────────────

    public void sendVerificationEmail(String to, String name, String token) {
        log.info("Attempting verification email → {} | appUrl={}", to, appUrl);
        send(to, "Verify your SkillBank email",
            """
            Hi %s,

            Welcome to SkillBank! Please verify your email by clicking the link below:

            %s/verify?token=%s

            This link will remain valid until used.

            — SkillBank
            """.formatted(name, appUrl, token));
    }

    public void sendPasswordResetEmail(String to, String name, String token) {
        log.info("Attempting password reset email → {}", to);
        send(to, "Reset your SkillBank password",
            """
            Hi %s,

            We received a request to reset your password. Click the link below to set a new one:

            %s/reset-password?token=%s

            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.

            — SkillBank
            """.formatted(name, appUrl, token));
    }

    // ── NOTIFICATION EMAILS (async — fire and forget) ──────────────────

    @Async
    public void sendSessionReminder(Session session) {
        String skillName = session.getSkill().getName();
        String dateStr = session.getScheduledAt().format(FMT);

        send(session.getTeacher().getEmail(),
            "Reminder: Session in 2 hours — " + skillName,
            """
            Hi %s,

            Friendly reminder — you have a session coming up in about 2 hours.

              Skill:   %s
              Learner: %s
              Time:    %s

            Make sure you're ready. Good luck!

            — SkillBank
            """.formatted(session.getTeacher().getName(), skillName,
                session.getLearner().getName(), dateStr));

        send(session.getLearner().getEmail(),
            "Reminder: Session in 2 hours — " + skillName,
            """
            Hi %s,

            Friendly reminder — you have a session coming up in about 2 hours.

              Skill:   %s
              Teacher: %s
              Time:    %s

            Get ready to learn something new!

            — SkillBank
            """.formatted(session.getLearner().getName(), skillName,
                session.getTeacher().getName(), dateStr));
    }

    @Async
    public void notifyReferralBonus(String referrerEmail, String referrerName, String newUserName) {
        send(referrerEmail, "You earned a referral credit!",
            """
            Hi %s,

            %s just joined SkillBank using your referral code. You've both received 1 bonus credit!

            Keep sharing your code to earn more.

            — SkillBank
            """.formatted(referrerName, newUserName));
    }

    @Async
    public void notifyTeacherOfNewBooking(Session session) {
        send(session.getTeacher().getEmail(),
            "New session request — " + session.getSkill().getName(),
            """
            Hi %s,

            %s has requested a 1-hour session with you.

              Skill:  %s
              Date:   %s
              Notes:  %s

            Log in to confirm or reject it.
            You have until 24 hours before the session to respond, otherwise it will be automatically cancelled.

            — SkillBank
            """.formatted(session.getTeacher().getName(), session.getLearner().getName(),
                session.getSkill().getName(), session.getScheduledAt().format(FMT),
                session.getNotes() != null ? session.getNotes() : "None"));
    }

    @Async
    public void notifyLearnerSessionConfirmed(Session session) {
        send(session.getLearner().getEmail(),
            "Session confirmed — " + session.getSkill().getName(),
            """
            Hi %s,

            %s has confirmed your session. You're all set!

              Skill:  %s
              Date:   %s

            1 credit has been held and will be released to the teacher after the session.

            — SkillBank
            """.formatted(session.getLearner().getName(), session.getTeacher().getName(),
                session.getSkill().getName(), session.getScheduledAt().format(FMT)));
    }

    @Async
    public void notifyLearnerSessionRejected(Session session) {
        send(session.getLearner().getEmail(),
            "Session request declined — " + session.getSkill().getName(),
            """
            Hi %s,

            %s has declined your session request.

              Skill:  %s
              Date:   %s

            Your 1 credit has been returned to your balance.

            — SkillBank
            """.formatted(session.getLearner().getName(), session.getTeacher().getName(),
                session.getSkill().getName(), session.getScheduledAt().format(FMT)));
    }

    @Async
    public void notifyBothAutoCancelled(Session session) {
        send(session.getTeacher().getEmail(),
            "Session auto-cancelled — " + session.getSkill().getName(),
            """
            Hi %s,

            A session request was automatically cancelled because it was not confirmed within the required window.

              Skill:   %s
              Learner: %s
              Date:    %s

            — SkillBank
            """.formatted(session.getTeacher().getName(), session.getSkill().getName(),
                session.getLearner().getName(), session.getScheduledAt().format(FMT)));

        send(session.getLearner().getEmail(),
            "Session auto-cancelled — " + session.getSkill().getName(),
            """
            Hi %s,

            Your session was automatically cancelled because the teacher did not confirm in time.

              Skill:   %s
              Teacher: %s
              Date:    %s

            Your 1 credit has been returned to your balance.

            — SkillBank
            """.formatted(session.getLearner().getName(), session.getSkill().getName(),
                session.getTeacher().getName(), session.getScheduledAt().format(FMT)));
    }

    // ── CORE SEND METHOD ───────────────────────────────────────────────

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            if (fromAddress != null && !fromAddress.isBlank()) {
                msg.setFrom(fromAddress);
            }
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Email sent → {} | {}", to, subject);
        } catch (Exception e) {
            log.error("EMAIL FAILED → to={} | subject={} | error={}", to, subject, e.getMessage());
            log.error("Full email error stack trace:", e);
        }
    }
}
