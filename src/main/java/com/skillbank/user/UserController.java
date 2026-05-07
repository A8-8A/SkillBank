package com.skillbank.user;

import com.skillbank.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getMyProfile(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(userService.updateProfile(
                currentUser,
                updates.get("bio"),
                updates.get("city"),
                updates.get("name"),
                updates.get("phoneNumber"),
                updates.get("contactEmail"),
                updates.get("linkedinUrl"),
                updates.get("socialMediaUrl"),
                updates.get("profilePicUrl")
        ));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password field required");
        }
        try {
            userService.deleteAccount(currentUser, password);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/purchase")
    public ResponseEntity<Map<String, Object>> purchaseCredits(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, BigDecimal> body) {
        BigDecimal hours = body.get("hours");
        if (hours == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "hours field required"));
        }
        userService.purchaseCredits(currentUser, hours);
        return ResponseEntity.ok(Map.of("message", "Credits purchased", "hours", hours));
    }
}
