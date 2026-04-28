package com.skillbank.match;

import com.skillbank.match.dto.MatchDTO;
import com.skillbank.skill.SkillType;
import com.skillbank.skill.UserSkill;
import com.skillbank.skill.UserSkillRepository;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final UserSkillRepository userSkillRepo;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MatchDTO> getMutualMatches(User currentUser) {
        List<User> matches = userSkillRepo.findMutualMatches(currentUser.getId());
        return matches.stream().map(u -> buildMatchDTO(u, currentUser.getId())).toList();
    }

    @Transactional(readOnly = true)
    public List<MatchDTO> getOneWayMatches(User currentUser) {
        List<UserSkill> offers = userSkillRepo.findOffersMatchingMySeeks(currentUser.getId());
        return offers.stream()
                .map(us -> buildMatchDTO(us.getUser(), currentUser.getId()))
                .distinct()
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchDTO> getUsersSeekingMySkills(User currentUser) {
        List<User> seekers = userSkillRepo.findUsersSeekingMySkills(currentUser.getId());
        return seekers.stream().map(u -> buildMatchDTO(u, currentUser.getId())).toList();
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
                .map(u -> buildMatchDTO(u, currentUser.getId()))
                .toList();
    }

    private MatchDTO buildMatchDTO(User user, Long forUserId) {
        List<UserSkill> skills = userSkillRepo.findByUserId(user.getId());

        List<String> offers = skills.stream()
                .filter(s -> s.getType() == SkillType.OFFER)
                .map(s -> s.getSkill().getName())
                .toList();

        List<String> seeks = skills.stream()
                .filter(s -> s.getType() == SkillType.SEEK)
                .map(s -> s.getSkill().getName())
                .toList();

        return new MatchDTO(user.getId(), user.getName(), user.getCity(), user.getBio(), offers, seeks);
    }
}
