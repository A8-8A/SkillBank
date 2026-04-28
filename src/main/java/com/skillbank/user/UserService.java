package com.skillbank.user;

import com.skillbank.review.ReviewRepository;
import com.skillbank.review.ReviewType;
import com.skillbank.session.SessionRepository;
import com.skillbank.session.SessionStatus;
import com.skillbank.transaction.EscrowService;
import com.skillbank.user.dto.UserProfileResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EscrowService escrowService;
    private final ReviewRepository reviewRepository;
    private final SessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findById(userId);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(User currentUser) {
        return toResponse(currentUser);
    }

    @Transactional
    public UserProfileResponse updateProfile(User currentUser, String bio, String city, String name, String phoneNumber, String profilePicUrl) {
        if (name != null && !name.isBlank()) currentUser.setName(name);
        if (bio != null) currentUser.setBio(bio);
        if (city != null) currentUser.setCity(city);
        if (phoneNumber != null) currentUser.setPhoneNumber(phoneNumber);
        if (profilePicUrl != null) currentUser.setProfilePicUrl(profilePicUrl);
        userRepository.save(currentUser);
        return toResponse(currentUser);
    }

    @Transactional
    public void purchaseCredits(User currentUser, BigDecimal hours) {
        escrowService.purchaseCredits(currentUser, hours);
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }

    private UserProfileResponse toResponse(User user) {
        BigDecimal balance = escrowService.getBalance(user.getId());

        Double teachAvg = reviewRepository.getAverageRating(user.getId(), ReviewType.TEACHING);
        Double learnAvg = reviewRepository.getAverageRating(user.getId(), ReviewType.LEARNING);
        long teachCount = reviewRepository.countByRevieweeAndType(user.getId(), ReviewType.TEACHING);
        long learnCount = reviewRepository.countByRevieweeAndType(user.getId(), ReviewType.LEARNING);

        long sessionsTaught = sessionRepository.findByTeacherIdOrderByScheduledAtDesc(user.getId()).stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED).count();
        long sessionsLearned = sessionRepository.findByLearnerIdOrderByScheduledAtDesc(user.getId()).stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED).count();

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .city(user.getCity())
                .phoneNumber(user.getPhoneNumber())
                .profilePicUrl(user.getProfilePicUrl())
                .role(user.getRole().name())
                .balance(balance)
                .createdAt(user.getCreatedAt())
                .referralCode(user.getReferralCode())
                .teachingRating(teachAvg != null ? Math.round(teachAvg * 10.0) / 10.0 : 0)
                .teachingReviewCount(teachCount)
                .learningRating(learnAvg != null ? Math.round(learnAvg * 10.0) / 10.0 : 0)
                .learningReviewCount(learnCount)
                .sessionsTaught(sessionsTaught)
                .sessionsLearned(sessionsLearned)
                .build();
    }
}
