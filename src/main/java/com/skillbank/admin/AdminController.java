package com.skillbank.admin;

import com.skillbank.session.SessionRepository;
import com.skillbank.skill.SkillRepository;
import com.skillbank.skill.UserSkillRepository;
import com.skillbank.transaction.EscrowService;
import com.skillbank.transaction.TimeTransactionRepository;
import com.skillbank.transaction.TransactionType;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final EscrowService escrowService;
    private final SessionRepository sessionRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final TimeTransactionRepository transactionRepository;

    @PostMapping("/credits/add")
    public ResponseEntity<Map<String, Object>> addCredits(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            BigDecimal amount = new BigDecimal(body.get("amount").toString());

            Optional<User> optUser = userRepository.findByEmail(email);
            if (optUser.isEmpty()) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "User not found: " + email);
                return ResponseEntity.badRequest().body(err);
            }

            User user = optUser.get();
            escrowService.purchaseCredits(user, amount);

            BigDecimal newBalance = escrowService.getBalance(user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Added " + amount + " credits to " + email);
            response.put("newBalance", newBalance);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/credits/deduct")
    public ResponseEntity<Map<String, Object>> deductCredits(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            BigDecimal amount = new BigDecimal(body.get("amount").toString());

            Optional<User> optUser = userRepository.findByEmail(email);
            if (optUser.isEmpty()) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "User not found: " + email);
                return ResponseEntity.badRequest().body(err);
            }

            User user = optUser.get();
            BigDecimal currentBalance = escrowService.getBalance(user.getId());

            if (currentBalance.compareTo(amount) < 0) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "User only has " + currentBalance + " credits, cannot deduct " + amount);
                return ResponseEntity.badRequest().body(err);
            }

            escrowService.deductCredits(user, amount);

            BigDecimal newBalance = escrowService.getBalance(user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Deducted " + amount + " credits from " + email);
            response.put("newBalance", newBalance);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long totalSessions = sessionRepository.count();
        long totalSkills = skillRepository.count();
        long totalUserSkills = userSkillRepository.count();
        long totalTransactions = transactionRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalSessions", totalSessions);
        stats.put("totalSkills", totalSkills);
        stats.put("totalUserSkills", totalUserSkills);
        stats.put("totalTransactions", totalTransactions);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("city", u.getCity());
            map.put("role", u.getRole().name());
            map.put("emailVerified", u.isEmailVerified());
            map.put("createdAt", u.getCreatedAt());
            map.put("balance", escrowService.getBalance(u.getId()));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> getAllSessions() {
        return ResponseEntity.ok(
            sessionRepository.findAll().stream().map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("teacher", s.getTeacher().getName());
                map.put("teacherEmail", s.getTeacher().getEmail());
                map.put("learner", s.getLearner().getName());
                map.put("learnerEmail", s.getLearner().getEmail());
                map.put("skill", s.getSkill().getName());
                map.put("status", s.getStatus().name());
                map.put("scheduledAt", s.getScheduledAt());
                map.put("createdAt", s.getCreatedAt());
                return map;
            }).collect(Collectors.toList())
        );
    }
}
