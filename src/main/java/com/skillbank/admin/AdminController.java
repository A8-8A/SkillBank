package com.skillbank.admin;

import com.skillbank.transaction.EscrowService;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final EscrowService escrowService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/credits/add")
    public ResponseEntity<Map<String, Object>> addCredits(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));

        escrowService.purchaseCredits(user, amount);

        BigDecimal newBalance = escrowService.getBalance(user.getId());
        return ResponseEntity.ok(Map.of(
                "message", "Added " + amount + " credits to " + email,
                "newBalance", newBalance
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/credits/deduct")
    public ResponseEntity<Map<String, Object>> deductCredits(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));

        BigDecimal currentBalance = escrowService.getBalance(user.getId());
        if (currentBalance.compareTo(amount) < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "User only has " + currentBalance + " credits"));
        }

        escrowService.deductCredits(user, amount);

        BigDecimal newBalance = escrowService.getBalance(user.getId());
        return ResponseEntity.ok(Map.of(
                "message", "Deducted " + amount + " credits from " + email,
                "newBalance", newBalance
        ));
    }
}
