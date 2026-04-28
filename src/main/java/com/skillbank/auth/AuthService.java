package com.skillbank.auth;

import com.skillbank.auth.dto.AuthResponse;
import com.skillbank.auth.dto.LoginRequest;
import com.skillbank.auth.dto.RegisterRequest;
import com.skillbank.config.JwtUtil;
import com.skillbank.email.EmailService;
import com.skillbank.transaction.EscrowService;
import com.skillbank.user.Role;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EscrowService escrowService;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        String verificationToken = UUID.randomUUID().toString();
        String referralCode = generateReferralCode(request.getName());

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .bio(request.getBio())
                .city(request.getCity())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.USER)
                .emailVerified(false)
                .verificationToken(verificationToken)
                .referralCode(referralCode)
                .build();

        // Handle referral
        if (request.getReferralCode() != null && !request.getReferralCode().isBlank()) {
            Optional<User> referrer = userRepository.findByReferralCode(request.getReferralCode().trim());
            referrer.ifPresent(r -> user.setReferredBy(r.getId()));
        }

        user = userRepository.save(user);
        escrowService.seedNewUser(user);

        // Credit referral bonus
        if (user.getReferredBy() != null) {
            User referrer = userRepository.findById(user.getReferredBy()).orElse(null);
            if (referrer != null) {
                escrowService.purchaseCredits(referrer, BigDecimal.ONE);
                escrowService.purchaseCredits(user, BigDecimal.ONE);
                emailService.notifyReferralBonus(referrer.getEmail(), referrer.getName(), user.getName());
            }
        }

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationToken);

        return new AuthResponse(null, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (!user.isEmailVerified()) {
            throw new IllegalStateException("EMAIL_NOT_VERIFIED");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public String verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalStateException("Invalid or expired verification link"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return "Email verified successfully. You can now log in.";
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetToken);
        });
    }

    @Transactional
    public String resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalStateException("Invalid or expired reset link"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Reset link has expired. Please request a new one.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return "Password reset successfully. You can now log in.";
    }

    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalStateException("Email is already verified");
        }

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationToken);
    }

    private String generateReferralCode(String name) {
        String prefix = name.replaceAll("[^a-zA-Z]", "").toUpperCase();
        if (prefix.length() > 4) prefix = prefix.substring(0, 4);
        if (prefix.isEmpty()) prefix = "USER";
        String code = prefix + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        while (userRepository.findByReferralCode(code).isPresent()) {
            code = prefix + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }
        return code;
    }
}
