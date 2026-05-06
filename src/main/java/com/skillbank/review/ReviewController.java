package com.skillbank.review;

import com.skillbank.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitReview(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, Object> body) {
        Long sessionId = Long.parseLong(body.get("sessionId").toString());
        int rating = Integer.parseInt(body.get("rating").toString());
        String comment = (String) body.get("comment");
        Boolean teacherOnTime = body.get("teacherOnTime") != null ? (Boolean) body.get("teacherOnTime") : null;
        Boolean contentUseful = body.get("contentUseful") != null ? (Boolean) body.get("contentUseful") : null;
        Boolean wouldRecommend = body.get("wouldRecommend") != null ? (Boolean) body.get("wouldRecommend") : null;

        Review review = reviewService.submitReview(currentUser, sessionId, rating, comment,
                teacherOnTime, contentUseful, wouldRecommend);

        return ResponseEntity.ok(Map.of("message", "Review submitted", "id", review.getId()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewDTOs(userId));
    }

    @GetMapping("/user/{userId}/teaching")
    public ResponseEntity<List<ReviewDTO>> getTeachingReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewDTOsByType(userId, ReviewType.TEACHING));
    }

    @GetMapping("/user/{userId}/learning")
    public ResponseEntity<List<ReviewDTO>> getLearningReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewDTOsByType(userId, ReviewType.LEARNING));
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getUserReviewStats(userId));
    }

    @GetMapping("/check/{sessionId}")
    public ResponseEntity<Map<String, Boolean>> checkReview(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(Map.of("reviewed", reviewService.hasReviewed(sessionId, currentUser.getId())));
    }
}
