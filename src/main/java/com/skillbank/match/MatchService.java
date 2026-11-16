package com.skillbank.match;

import com.skillbank.match.dto.MatchDTO;
import com.skillbank.skill.SkillType;
import com.skillbank.skill.UserSkill;
import com.skillbank.skill.UserSkillRepository;
import com.skillbank.user.Role;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final UserSkillRepository userSkillRepo;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MatchDTO> getMutualMatches(User currentUser) {
        List<User> matches = userSkillRepo.findMutualMatches(currentUser.getId());
        return matches.stream()
                .filter(u -> u.isEmailVerified() && u.getRole() != Role.ADMIN)
                .map(this::buildMatchDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchDTO> getOneWayMatches(User currentUser) {
        Map<Long, List<UserSkill>> matchingOffersByTeacher = userSkillRepo
                .findOffersMatchingMySeeks(currentUser.getId()).stream()
                .filter(offer -> offer.getUser().isEmailVerified() && offer.getUser().getRole() != Role.ADMIN)
                .collect(Collectors.groupingBy(offer -> offer.getUser().getId()));

        return matchingOffersByTeacher.values().stream()
                .map(offers -> {
                    long matchedSkillCount = offers.stream()
                            .map(offer -> offer.getSkill().getId())
                            .distinct()
                            .count();
                    return new RankedTeacher(offers.get(0).getUser(), matchedSkillCount);
                })
                .sorted(Comparator.comparingLong(RankedTeacher::matchedSkillCount)
                        .reversed()
                        .thenComparingLong(match -> match.teacher().getId()))
                .map(match -> buildMatchDTO(match.teacher()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchDTO> getUsersSeekingMySkills(User currentUser) {
        List<User> seekers = userSkillRepo.findUsersSeekingMySkills(currentUser.getId());
        return seekers.stream()
                .filter(u -> u.isEmailVerified() && u.getRole() != Role.ADMIN)
                .map(this::buildMatchDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchDTO> searchAllUsers(User currentUser, String query) {
        List<User> users;

        if (query == null || query.isBlank()) {
            users = userRepository.findAll();
        } else {
            users = userRepository.searchByNameOrSkillOrCategoryOrTag(query.trim().toLowerCase());
        }

        return users.stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .filter(u -> u.isEmailVerified())
                .filter(u -> u.getRole() != Role.ADMIN)
                .map(this::buildMatchDTO)
                .toList();
    }

    private MatchDTO buildMatchDTO(User user) {
        List<UserSkill> skills = userSkillRepo.findByUserId(user.getId());

        List<String> offers = skills.stream()
                .filter(s -> s.getType() == SkillType.OFFER)
                .map(s -> s.getSkill().getName())
                .toList();

        List<String> seeks = skills.stream()
                .filter(s -> s.getType() == SkillType.SEEK)
                .map(s -> s.getSkill().getName())
                .toList();

        return new MatchDTO(user.getId(), user.getName(), user.getCity(), user.getBio(),
                user.getProfilePicUrl(), offers, seeks);
    }

    private record RankedTeacher(User teacher, long matchedSkillCount) {}
}
