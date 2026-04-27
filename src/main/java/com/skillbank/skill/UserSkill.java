package com.skillbank.skill;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.skillbank.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_skills",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "skill_id", "type"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillType type;

    @Enumerated(EnumType.STRING)
    private SkillLevel level;

    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
