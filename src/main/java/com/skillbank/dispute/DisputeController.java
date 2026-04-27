package com.skillbank.dispute;

import com.skillbank.dispute.dto.FileDisputeRequest;
import com.skillbank.dispute.dto.ResolveDisputeRequest;
import com.skillbank.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    public ResponseEntity<DisputeReport> fileDispute(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody FileDisputeRequest request) {
        return ResponseEntity.ok(disputeService.fileDispute(currentUser, request));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<DisputeReport> getDisputeForSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(disputeService.getDisputeForSession(sessionId));
    }

    @GetMapping("/open")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DisputeReport>> getOpenDisputes() {
        return ResponseEntity.ok(disputeService.getOpenDisputes());
    }

    @PostMapping("/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DisputeReport> resolve(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ResolveDisputeRequest request) {
        return ResponseEntity.ok(disputeService.resolve(currentUser, request));
    }
}
