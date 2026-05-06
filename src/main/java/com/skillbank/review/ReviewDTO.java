package com.skillbank.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private String type;
    private int rating;
    private String comment;
    private Boolean teacherOnTime;
    private Boolean contentUseful;
    private Boolean wouldRecommend;
    private LocalDateTime createdAt;

    // Reviewer info
    private Long reviewerId;
    private String reviewerName;
    private String reviewerProfilePicUrl;

    // Reviewee info
    private Long revieweeId;
    private String revieweeName;

    // Session info
    private Long sessionId;
    private String skillName;
    private LocalDateTime sessionDate;
}
