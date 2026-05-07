package com.skillbank.user;

import com.skillbank.availability.AvailabilityRepository;
import com.skillbank.dispute.DisputeRepository;
import com.skillbank.review.ReviewRepository;
import com.skillbank.review.ReviewType;
import com.skillbank.session.Session;
import com.skillbank.session.SessionRepository;
import com.skillbank.session.SessionStatus;
import com.skillbank.skill.SkillRepository;
import com.skillbank.skill.UserSkillRepository;
import com.skillbank.transaction.EscrowService;
import com.skillbank.transaction.TimeTransactionRepository;
import com.skillbank.user.dto.UserProfileResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final EscrowService escrowService;
    private final ReviewRepository reviewRepository;
    private final SessionRepository sessionRepository;
    private final UserSkillRepository userSkillRepository;
    private final AvailabilityRepository availabilityRepository;
    private final DisputeRepository disputeRepository;
    private final TimeTransactionRepository timeTransactionRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReferralCodeService referralCodeService;

    @Transactional
    public UserProfileResponse getProfile(Long userId) {
        User user = findById(userId);
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse getMyProfile(User currentUser) {
        return toResponse(currentUser);
    }

    @Transactional
    public UserProfileResponse updateProfile(User currentUser, String bio, String city, String name, String phoneNumber,
                                             String contactEmail, String linkedinUrl, String socialMediaUrl,
                                             String profilePicUrl) {
        if (name != null && !name.isBlank()) currentUser.setName(name);
        if (bio != null) currentUser.setBio(bio);
        if (city != null) currentUser.setCity(city);
        if (phoneNumber != null) currentUser.setPhoneNumber(phoneNumber);
        if (contactEmail != null) currentUser.setContactEmail(contactEmail);
        if (linkedinUrl != null) currentUser.setLinkedinUrl(linkedinUrl);
        if (socialMediaUrl != null) currentUser.setSocialMediaUrl(socialMediaUrl);
        if (profilePicUrl != null) currentUser.setProfilePicUrl(profilePicUrl);
        userRepository.save(currentUser);
        return toResponse(currentUser);
    }

    @Transactional
    public void purchaseCredits(User currentUser, BigDecimal hours) {
        escrowService.purchaseCredits(currentUser, hours);
    }

    @Transactional
    public void deleteAccount(User currentUser, String password) {
        if (!passwordEncoder.matches(password, currentUser.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password");
        }

        Long userId = currentUser.getId();

        // Nullify resolved_by in disputes this admin resolved (nullable column)
        disputeRepository.nullifyResolvedBy(userId);

        // Delete disputes on sessions involving this user
        List<Session> sessions = sessionRepository.findAllByUserId(userId);
        List<Long> sessionIds = sessions.stream().map(Session::getId).toList();
        if (!sessionIds.isEmpty()) {
            disputeRepository.deleteAll(disputeRepository.findBySessionIdIn(sessionIds));
        }

        // Nullify transaction references (nullable columns preserve other users' balance history)
        timeTransactionRepository.nullifyFromUser(userId);
        timeTransactionRepository.nullifyToUser(userId);
        skillRepository.nullifyCreatedBy(userId);
        if (!sessionIds.isEmpty()) {
            timeTransactionRepository.nullifySessionBySessionIdIn(sessionIds);
        }

        // Delete rows that reference this user before deleting the user row itself.
        reviewRepository.deleteAll(reviewRepository.findAllByUserId(userId));
        sessionRepository.deleteAll(sessions);
        userSkillRepository.deleteAll(userSkillRepository.findByUserId(userId));
        availabilityRepository.deleteAll(availabilityRepository.findByUserId(userId));

        userRepository.delete(currentUser);
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }

    private UserProfileResponse toResponse(User user) {
        ensureReferralCode(user);
        BigDecimal balance = escrowService.getBalance(user.getId());

        double teachingRating = 0;
        long teachingReviewCount = 0;
        double learningRating = 0;
        long learningReviewCount = 0;
        long sessionsTaught = 0;
        long sessionsLearned = 0;

        try {
            Double teachAvg = reviewRepository.getAverageRating(user.getId(), ReviewType.TEACHING);
            Double learnAvg = reviewRepository.getAverageRating(user.getId(), ReviewType.LEARNING);
            teachingReviewCount = reviewRepository.countByRevieweeAndType(user.getId(), ReviewType.TEACHING);
            learningReviewCount = reviewRepository.countByRevieweeAndType(user.getId(), ReviewType.LEARNING);
            teachingRating = teachAvg != null ? Math.round(teachAvg * 10.0) / 10.0 : 0;
            learningRating = learnAvg != null ? Math.round(learnAvg * 10.0) / 10.0 : 0;
        } catch (Exception e) {
            log.warn("Failed to load review stats for user {}: {}", user.getId(), e.getMessage());
        }

        try {
            sessionsTaught = sessionRepository.findByTeacherIdOrderByScheduledAtDesc(user.getId()).stream()
                    .filter(s -> s.getStatus() == SessionStatus.COMPLETED).count();
            sessionsLearned = sessionRepository.findByLearnerIdOrderByScheduledAtDesc(user.getId()).stream()
                    .filter(s -> s.getStatus() == SessionStatus.COMPLETED).count();
        } catch (Exception e) {
            log.warn("Failed to load session counts for user {}: {}", user.getId(), e.getMessage());
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .city(user.getCity())
                .phoneNumber(user.getPhoneNumber())
                .contactEmail(user.getContactEmail())
                .linkedinUrl(user.getLinkedinUrl())
                .socialMediaUrl(user.getSocialMediaUrl())
                .profilePicUrl(user.getProfilePicUrl())
                .role(user.getRole().name())
                .balance(balance)
                .createdAt(user.getCreatedAt())
                .referralCode(user.getReferralCode())
                .teachingRating(teachingRating)
                .teachingReviewCount(teachingReviewCount)
                .learningRating(learningRating)
                .learningReviewCount(learningReviewCount)
                .sessionsTaught(sessionsTaught)
                .sessionsLearned(sessionsLearned)
                .build();
    }

    private void ensureReferralCode(User user) {
        if (user.getReferralCode() != null && !user.getReferralCode().isBlank()) {
            return;
        }

        user.setReferralCode(referralCodeService.generateForName(user.getName()));
        userRepository.save(user);
    }
}
