package com.skillbank.review;

import com.skillbank.session.Session;
import com.skillbank.session.SessionRepository;
import com.skillbank.session.SessionStatus;
import com.skillbank.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final SessionRepository sessionRepo;

    @Transactional
    public Review submitReview(User reviewer, Long sessionId, int rating, String comment,
                               Boolean teacherOnTime, Boolean contentUseful, Boolean wouldRecommend) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        if (session.getStatus() != SessionStatus.COMPLETED) {
            throw new IllegalStateException("Can only review completed sessions");
        }

        boolean isTeacher = session.getTeacher().getId().equals(reviewer.getId());
        boolean isLearner = session.getLearner().getId().equals(reviewer.getId());

        if (!isTeacher && !isLearner) {
            throw new IllegalStateException("You are not part of this session");
        }

        if (reviewRepo.existsBySessionIdAndReviewerId(sessionId, reviewer.getId())) {
            throw new IllegalStateException("You have already reviewed this session");
        }

        User reviewee;
        ReviewType type;

        if (isLearner) {
            reviewee = session.getTeacher();
            type = ReviewType.TEACHING;
        } else {
            reviewee = session.getLearner();
            type = ReviewType.LEARNING;
        }

        // Save all 3 feedback fields for both review types
        return reviewRepo.save(Review.builder()
                .session(session)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .type(type)
                .rating(rating)
                .comment(comment)
                .teacherOnTime(teacherOnTime)
                .contentUseful(contentUseful)
                .wouldRecommend(wouldRecommend)
                .build());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserReviewStats(Long userId) {
        Double teachingAvg = reviewRepo.getAverageRating(userId, ReviewType.TEACHING);
        Double learningAvg = reviewRepo.getAverageRating(userId, ReviewType.LEARNING);
        long teachingCount = reviewRepo.countByRevieweeAndType(userId, ReviewType.TEACHING);
        long learningCount = reviewRepo.countByRevieweeAndType(userId, ReviewType.LEARNING);

        long sessionsTaught = sessionRepo.findByTeacherIdOrderByScheduledAtDesc(userId).stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED).count();
        long sessionsLearned = sessionRepo.findByLearnerIdOrderByScheduledAtDesc(userId).stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED).count();

        return Map.of(
                "teachingRating", teachingAvg != null ? Math.round(teachingAvg * 10.0) / 10.0 : 0,
                "learningRating", learningAvg != null ? Math.round(learningAvg * 10.0) / 10.0 : 0,
                "teachingReviewCount", teachingCount,
                "learningReviewCount", learningCount,
                "sessionsTaught", sessionsTaught,
                "sessionsLearned", sessionsLearned
        );
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewDTOs(Long userId) {
        return reviewRepo.findByRevieweeIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewDTOsByType(Long userId, ReviewType type) {
        return reviewRepo.findByRevieweeIdAndTypeOrderByCreatedAtDesc(userId, type).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean hasReviewed(Long sessionId, Long reviewerId) {
        return reviewRepo.existsBySessionIdAndReviewerId(sessionId, reviewerId);
    }

    private ReviewDTO toDTO(Review r) {
        return ReviewDTO.builder()
                .id(r.getId())
                .type(r.getType().name())
                .rating(r.getRating())
                .comment(r.getComment())
                .teacherOnTime(r.getTeacherOnTime())
                .contentUseful(r.getContentUseful())
                .wouldRecommend(r.getWouldRecommend())
                .createdAt(r.getCreatedAt())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getName())
                .reviewerProfilePicUrl(r.getReviewer().getProfilePicUrl())
                .revieweeId(r.getReviewee().getId())
                .revieweeName(r.getReviewee().getName())
                .sessionId(r.getSession().getId())
                .skillName(r.getSession().getSkill().getName())
                .sessionDate(r.getSession().getScheduledAt())
                .build();
    }
}
