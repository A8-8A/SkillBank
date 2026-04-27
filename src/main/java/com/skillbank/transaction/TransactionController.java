package com.skillbank.transaction;

import com.skillbank.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TimeTransactionRepository transactionRepo;
    private final EscrowService escrowService;

    @GetMapping("/my")
    public ResponseEntity<List<TimeTransaction>> getMyTransactions(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                transactionRepo.findByToUserIdOrFromUserIdOrderByCreatedAtDesc(
                        currentUser.getId(), currentUser.getId())
        );
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, BigDecimal>> getBalance(@AuthenticationPrincipal User currentUser) {
        BigDecimal balance = escrowService.getBalance(currentUser.getId());
        return ResponseEntity.ok(Map.of("balance", balance));
    }
}
