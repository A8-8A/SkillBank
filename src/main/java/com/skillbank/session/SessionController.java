package com.skillbank.session;

import com.skillbank.session.dto.BookSessionRequest;
import com.skillbank.session.dto.SessionDTO;
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
    public ResponseEntity<SessionDTO> book(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody BookSessionRequest request) {
        Session session = sessionService.book(currentUser, request);
        return ResponseEntity.ok(SessionDTO.from(session, currentUser.getId()));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<SessionDTO> confirm(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        Session session = sessionService.confirm(currentUser, id);
        return ResponseEntity.ok(SessionDTO.from(session, currentUser.getId()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<SessionDTO> cancel(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        Session session = sessionService.cancel(currentUser, id);
        return ResponseEntity.ok(SessionDTO.from(session, currentUser.getId()));
    }

    @GetMapping
    public ResponseEntity<List<SessionDTO>> getMySessions(@AuthenticationPrincipal User currentUser) {
        List<SessionDTO> dtos = sessionService.getAllMySessions(currentUser).stream()
                .map(s -> SessionDTO.from(s, currentUser.getId()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/teaching")
    public ResponseEntity<List<SessionDTO>> getTeachingSessions(@AuthenticationPrincipal User currentUser) {
        List<SessionDTO> dtos = sessionService.getMySessionsAsTeacher(currentUser).stream()
                .map(s -> SessionDTO.from(s, currentUser.getId()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/learning")
    public ResponseEntity<List<SessionDTO>> getLearningSessions(@AuthenticationPrincipal User currentUser) {
        List<SessionDTO> dtos = sessionService.getMySessionsAsLearner(currentUser).stream()
                .map(s -> SessionDTO.from(s, currentUser.getId()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDTO> getSession(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        Session session = sessionService.getSession(id);
        return ResponseEntity.ok(SessionDTO.from(session, currentUser.getId()));
    }
}
