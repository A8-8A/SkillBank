package com.skillbank.skill.dto;

import com.skillbank.skill.SkillLevel;
import com.skillbank.skill.SkillType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AddUserSkillRequest {

    @NotNull
    private Long categoryId;

    @NotBlank
    private String skillName;

    @NotNull
    private SkillType type;

    private SkillLevel level;

    private String description;

    private List<String> tags;
}
