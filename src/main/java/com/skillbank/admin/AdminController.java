package com.skillbank.admin;

import com.skillbank.exception.InsufficientBalanceException;
import com.skillbank.transaction.EscrowService;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final EscrowService escrowService;

    @PostMapping("/credits/add")
    public ResponseEntity<Map<String, Object>> addCredits(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));

        escrowService.purchaseCredits(user, amount);

        BigDecimal newBalance = escrowService.getBalance(user.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Added " + amount + " credits to " + email);
        response.put("newBalance", newBalance);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/credits/deduct")
    public ResponseEntity<Map<String, Object>> deductCredits(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));

        try {
            escrowService.deductCredits(user, amount);
        } catch (InsufficientBalanceException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        BigDecimal newBalance = escrowService.getBalance(user.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Deducted " + amount + " credits from " + email);
        response.put("newBalance", newBalance);
        return ResponseEntity.ok(response);
    }
}
