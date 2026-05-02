package com.skillbank.session.dto;

import com.skillbank.session.Session;
import com.skillbank.user.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SessionDTO {

    public record UserSummary(Long id, String name, String email, String profilePicUrl) {
        public static UserSummary from(User u) {
            if (u == null) return null;
            return new UserSummary(u.getId(), u.getName(), u.getEmail(), u.getProfilePicUrl());
        }
    }

    private Long id;
    private UserSummary teacher;
    private UserSummary learner;
    private String skillName;
    private String status;
    private LocalDateTime scheduledAt;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String notes;
    private LocalDateTime createdAt;
    private boolean reminderSent;
    private String role; // "TEACHER" or "LEARNER" relative to the requesting user

    public static SessionDTO from(Session s, Long currentUserId) {
        String role = null;
        if (s.getTeacher() != null && s.getTeacher().getId().equals(currentUserId)) {
            role = "TEACHER";
        } else if (s.getLearner() != null && s.getLearner().getId().equals(currentUserId)) {
            role = "LEARNER";
        }

        return SessionDTO.builder()
                .id(s.getId())
                .teacher(UserSummary.from(s.getTeacher()))
                .learner(UserSummary.from(s.getLearner()))
                .skillName(s.getSkill() != null ? s.getSkill().getName() : null)
                .status(s.getStatus() != null ? s.getStatus().name() : null)
                .scheduledAt(s.getScheduledAt())
                .endTime(s.getEndTime())
                .durationMinutes(s.getDurationMinutes())
                .notes(s.getNotes())
                .createdAt(s.getCreatedAt())
                .reminderSent(s.isReminderSent())
                .role(role)
                .build();
    }
}
