package com.skillbank.skill;

import com.skillbank.skill.dto.AddUserSkillRequest;
import com.skillbank.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepo;
    private final SkillCategoryRepository categoryRepo;
    private final TagRepository tagRepo;
    private final UserSkillRepository userSkillRepo;

    @Transactional(readOnly = true)
    public List<SkillCategory> getAllCategories() {
        return categoryRepo.findAll();
    }

    @Transactional(readOnly = true)
    public List<Skill> getSkillsByCategory(Long categoryId) {
        return skillRepo.findByCategoryId(categoryId);
    }

    @Transactional(readOnly = true)
    public List<Skill> searchSkills(String query) {
        return skillRepo.searchByName(query);
    }

    @Transactional
    public UserSkill addUserSkill(User user, AddUserSkillRequest request) {
        SkillCategory category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        Skill skill = skillRepo.findByNameIgnoreCaseAndCategoryId(request.getSkillName(), category.getId())
                .orElseGet(() -> createCustomSkill(request.getSkillName(), category, user));

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            Set<Tag> tags = resolveOrCreateTags(request.getTags());
            skill.getTags().addAll(tags);
            skillRepo.save(skill);
        }

        if (userSkillRepo.existsByUserIdAndSkillIdAndType(user.getId(), skill.getId(), request.getType())) {
            throw new IllegalStateException("You already have this skill listed as " + request.getType());
        }

        UserSkill userSkill = UserSkill.builder()
                .user(user)
                .skill(skill)
                .type(request.getType())
                .level(request.getLevel())
                .description(request.getDescription())
                .build();

        return userSkillRepo.save(userSkill);
    }

    @Transactional(readOnly = true)
    public List<UserSkill> getUserSkills(Long userId) {
        return userSkillRepo.findByUserId(userId);
    }

    @Transactional
    public void removeUserSkill(User user, Long userSkillId) {
        UserSkill userSkill = userSkillRepo.findById(userSkillId)
                .orElseThrow(() -> new EntityNotFoundException("Skill entry not found"));

        if (!userSkill.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You can only remove your own skills");
        }

        userSkillRepo.delete(userSkill);
    }

    private Skill createCustomSkill(String name, SkillCategory category, User createdBy) {
        return skillRepo.save(Skill.builder()
                .name(name)
                .category(category)
                .custom(true)
                .createdBy(createdBy)
                .build());
    }

    private Set<Tag> resolveOrCreateTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        for (String name : tagNames) {
            String normalized = name.trim().toLowerCase();
            Tag tag = tagRepo.findByNameIgnoreCase(normalized)
                    .orElseGet(() -> tagRepo.save(Tag.builder().name(normalized).build()));
            tags.add(tag);
        }
        return tags;
    }
}
