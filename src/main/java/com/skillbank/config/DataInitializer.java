package com.skillbank.config;

import com.skillbank.skill.SkillCategory;
import com.skillbank.skill.SkillCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final SkillCategoryRepository categoryRepository;

    private static final List<String> CATEGORIES = List.of(
        "Technology & Programming",
        "Engineering",
        "Science & Mathematics",
        "Languages",
        "Music",
        "Sports & Fitness",
        "Arts & Crafts",
        "Design & Architecture",
        "Cooking & Nutrition",
        "Business & Finance",
        "Writing & Literature",
        "Photography & Video",
        "Board Games & Chess",
        "Health & Wellness",
        "DIY & Home Improvement",
        "Education & Tutoring",
        "History & Culture",
        "Performing Arts",
        "Outdoor Skills",
        "Social Sciences"
    );

    @Override
    public void run(ApplicationArguments args) {
        long existing = categoryRepository.count();
        if (existing > 0) return;

        CATEGORIES.forEach(name ->
            categoryRepository.save(SkillCategory.builder().name(name).build())
        );

        log.info("Seeded {} skill categories", CATEGORIES.size());
    }
}
