package com.skillbank.match;

import com.skillbank.match.dto.MatchDTO;
import com.skillbank.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/mutual")
    public ResponseEntity<List<MatchDTO>> getMutualMatches(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(matchService.getMutualMatches(currentUser));
    }

    @GetMapping("/one-way")
    public ResponseEntity<List<MatchDTO>> getOneWayMatches(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(matchService.getOneWayMatches(currentUser));
    }

    @GetMapping("/seeking-me")
    public ResponseEntity<List<MatchDTO>> getUsersSeekingMySkills(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(matchService.getUsersSeekingMySkills(currentUser));
    }

    @GetMapping("/all")
    public ResponseEntity<List<MatchDTO>> searchAllUsers(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(matchService.searchAllUsers(currentUser, q));
    }
}
