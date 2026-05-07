package com.skillbank.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String city;
    private String phoneNumber;
    private String contactEmail;
    private String linkedinUrl;
    private String socialMediaUrl;
    private String profilePicUrl;
    private String role;
    private BigDecimal balance;
    private LocalDateTime createdAt;
    private String referralCode;
    private double teachingRating;
    private long teachingReviewCount;
    private double learningRating;
    private long learningReviewCount;
    private long sessionsTaught;
    private long sessionsLearned;
}
