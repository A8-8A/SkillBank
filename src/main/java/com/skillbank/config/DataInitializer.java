package com.skillbank.config;

import com.skillbank.skill.SkillCategory;
import com.skillbank.skill.SkillCategoryRepository;
import com.skillbank.user.ReferralCodeService;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final SkillCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ReferralCodeService referralCodeService;

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
    @Transactional
    public void run(ApplicationArguments args) {
        backfillReferralCodes();

        long existing = categoryRepository.count();
        if (existing > 0) return;

        CATEGORIES.forEach(name ->
            categoryRepository.save(SkillCategory.builder().name(name).build())
        );

        log.info("Seeded {} skill categories", CATEGORIES.size());
    }

    private void backfillReferralCodes() {
        List<User> usersWithoutReferralCodes = userRepository.findUsersMissingReferralCode();
        usersWithoutReferralCodes.forEach(user ->
                user.setReferralCode(referralCodeService.generateForName(user.getName()))
        );

        if (!usersWithoutReferralCodes.isEmpty()) {
            userRepository.saveAll(usersWithoutReferralCodes);
            log.info("Backfilled referral codes for {} users", usersWithoutReferralCodes.size());
        }
    }
}
