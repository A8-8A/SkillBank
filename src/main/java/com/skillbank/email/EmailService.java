package com.skillbank.email;

import com.skillbank.session.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("EEEE, MMM d yyyy 'at' h:mm a");

    @Async
    public void notifyTeacherOfNewBooking(Session session) {
        send(
            session.getTeacher().getEmail(),
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
            """.formatted(
                session.getTeacher().getName(),
                session.getLearner().getName(),
                session.getSkill().getName(),
                session.getScheduledAt().format(FMT),
                session.getNotes() != null ? session.getNotes() : "None"
            )
        );
    }

    @Async
    public void notifyLearnerSessionConfirmed(Session session) {
        send(
            session.getLearner().getEmail(),
            "Session confirmed — " + session.getSkill().getName(),
            """
            Hi %s,

            %s has confirmed your session. You're all set!

              Skill:  %s
              Date:   %s

            1 credit has been held and will be released to the teacher after the session.

            — SkillBank
            """.formatted(
                session.getLearner().getName(),
                session.getTeacher().getName(),
                session.getSkill().getName(),
                session.getScheduledAt().format(FMT)
            )
        );
    }

    @Async
    public void notifyLearnerSessionRejected(Session session) {
        send(
            session.getLearner().getEmail(),
            "Session request declined — " + session.getSkill().getName(),
            """
            Hi %s,

            %s has declined your session request.

              Skill:  %s
              Date:   %s

            Your 1 credit has been returned to your balance.

            — SkillBank
            """.formatted(
                session.getLearner().getName(),
                session.getTeacher().getName(),
                session.getSkill().getName(),
                session.getScheduledAt().format(FMT)
            )
        );
    }

    @Async
    public void notifyBothAutoCancelled(Session session) {
        send(
            session.getTeacher().getEmail(),
            "Session auto-cancelled — " + session.getSkill().getName(),
            """
            Hi %s,

            A session request was automatically cancelled because it was not confirmed within the required window.

              Skill:   %s
              Learner: %s
              Date:    %s

            — SkillBank
            """.formatted(
                session.getTeacher().getName(),
                session.getSkill().getName(),
                session.getLearner().getName(),
                session.getScheduledAt().format(FMT)
            )
        );

        send(
            session.getLearner().getEmail(),
            "Session auto-cancelled — " + session.getSkill().getName(),
            """
            Hi %s,

            Your session was automatically cancelled because the teacher did not confirm in time.

              Skill:   %s
              Teacher: %s
              Date:    %s

            Your 1 credit has been returned to your balance.

            — SkillBank
            """.formatted(
                session.getLearner().getName(),
                session.getSkill().getName(),
                session.getTeacher().getName(),
                session.getScheduledAt().format(FMT)
            )
        );
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Email sent → {} | {}", to, subject);
        } catch (Exception e) {
            log.error("Email failed → {} | {} | {}", to, subject, e.getMessage());
        }
    }
}
