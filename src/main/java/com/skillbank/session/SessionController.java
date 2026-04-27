package com.skillbank.session;

import com.skillbank.session.dto.BookSessionRequest;
import com.skillbank.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<Session> book(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody BookSessionRequest request) {
        return ResponseEntity.ok(sessionService.book(currentUser, request));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Session> confirm(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(sessionService.confirm(currentUser, id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Session> cancel(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(sessionService.cancel(currentUser, id));
    }

    @GetMapping
    public ResponseEntity<List<Session>> getMySessions(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(sessionService.getAllMySessions(currentUser));
    }

    @GetMapping("/teaching")
    public ResponseEntity<List<Session>> getTeachingSessions(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(sessionService.getMySessionsAsTeacher(currentUser));
    }

    @GetMapping("/learning")
    public ResponseEntity<List<Session>> getLearningSessions(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(sessionService.getMySessionsAsLearner(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Session> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSession(id));
    }
}
