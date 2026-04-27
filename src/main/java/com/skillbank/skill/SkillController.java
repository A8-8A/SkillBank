package com.skillbank.skill;

import com.skillbank.skill.dto.AddUserSkillRequest;
import com.skillbank.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping("/categories")
    public ResponseEntity<List<SkillCategory>> getCategories() {
        return ResponseEntity.ok(skillService.getAllCategories());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Skill>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(skillService.getSkillsByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Skill>> search(@RequestParam String q) {
        return ResponseEntity.ok(skillService.searchSkills(q));
    }

    @GetMapping("/my")
    public ResponseEntity<List<UserSkill>> getMySkills(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(skillService.getUserSkills(currentUser.getId()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserSkill>> getUserSkills(@PathVariable Long userId) {
        return ResponseEntity.ok(skillService.getUserSkills(userId));
    }

    @PostMapping("/my")
    public ResponseEntity<UserSkill> addSkill(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AddUserSkillRequest request) {
        return ResponseEntity.ok(skillService.addUserSkill(currentUser, request));
    }

    @DeleteMapping("/my/{userSkillId}")
    public ResponseEntity<Void> removeSkill(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userSkillId) {
        skillService.removeUserSkill(currentUser, userSkillId);
        return ResponseEntity.noContent().build();
    }
}
