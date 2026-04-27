package com.skillbank.user;

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

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findById(userId);
        BigDecimal balance = escrowService.getBalance(userId);
        return toResponse(user, balance);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(User currentUser) {
        BigDecimal balance = escrowService.getBalance(currentUser.getId());
        return toResponse(currentUser, balance);
    }

    @Transactional
    public UserProfileResponse updateProfile(User currentUser, String bio, String city, String name, String phoneNumber) {
        if (name != null && !name.isBlank()) currentUser.setName(name);
        if (bio != null) currentUser.setBio(bio);
        if (city != null) currentUser.setCity(city);
        if (phoneNumber != null) currentUser.setPhoneNumber(phoneNumber);
        userRepository.save(currentUser);
        BigDecimal balance = escrowService.getBalance(currentUser.getId());
        return toResponse(currentUser, balance);
    }

    @Transactional
    public void purchaseCredits(User currentUser, BigDecimal hours) {
        escrowService.purchaseCredits(currentUser, hours);
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }

    private UserProfileResponse toResponse(User user, BigDecimal balance) {
        return new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(),
                user.getBio(), user.getCity(), user.getPhoneNumber(),
                user.getRole().name(), balance, user.getCreatedAt()
        );
    }
}
