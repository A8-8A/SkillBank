package com.skillbank.match;

import com.skillbank.match.dto.MatchDTO;
import com.skillbank.skill.Skill;
import com.skillbank.skill.SkillType;
import com.skillbank.skill.UserSkill;
import com.skillbank.skill.UserSkillRepository;
import com.skillbank.user.Role;
import com.skillbank.user.User;
import com.skillbank.user.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MatchServiceTest {

    private final UserSkillRepository userSkillRepo = mock(UserSkillRepository.class);
    private final MatchService service = new MatchService(userSkillRepo, mock(UserRepository.class));
    private final User learner = verifiedUser(1L, "Learner");
    private final Skill java = Skill.builder().id(10L).name("Java").build();
    private final Skill sql = Skill.builder().id(11L).name("SQL").build();

    @Test
    void ranksTeachersByNumberOfRequestedSkillsTheyOffer() {
        User javaTeacher = verifiedUser(2L, "Java teacher");
        User javaAndSqlTeacher = verifiedUser(3L, "Java and SQL teacher");
        UserSkill javaOnlyOffer = offer(javaTeacher, java);
        UserSkill matchingJavaOffer = offer(javaAndSqlTeacher, java);
        UserSkill matchingSqlOffer = offer(javaAndSqlTeacher, sql);
        Skill react = Skill.builder().id(12L).name("React").build();
        Skill python = Skill.builder().id(13L).name("Python").build();

        when(userSkillRepo.findOffersMatchingMySeeks(learner.getId()))
                .thenReturn(List.of(javaOnlyOffer, matchingJavaOffer, matchingSqlOffer));
        when(userSkillRepo.findByUserId(javaTeacher.getId()))
                .thenReturn(List.of(javaOnlyOffer, offer(javaTeacher, react), offer(javaTeacher, python)));
        when(userSkillRepo.findByUserId(javaAndSqlTeacher.getId()))
                .thenReturn(List.of(matchingJavaOffer, matchingSqlOffer));

        List<MatchDTO> matches = service.getOneWayMatches(learner);

        assertThat(matches).extracting(MatchDTO::getUserId).containsExactly(3L, 2L);
        assertThat(matches.get(1).getSkillsTheyOffer()).containsExactly("Java", "React", "Python");
    }

    @Test
    void countsEachSkillOnceAndBreaksTiesByTeacherId() {
        User firstTeacher = verifiedUser(15L, "First teacher");
        User secondTeacher = verifiedUser(16L, "Second teacher");

        when(userSkillRepo.findOffersMatchingMySeeks(learner.getId()))
                .thenReturn(List.of(offer(secondTeacher, java), offer(secondTeacher, java), offer(firstTeacher, java)));

        assertThat(service.getOneWayMatches(learner))
                .extracting(MatchDTO::getUserId).containsExactly(15L, 16L);
    }

    @Test
    void excludesUnverifiedUsersAndAdmins() {
        User visibleTeacher = verifiedUser(2L, "Visible teacher");
        User unverifiedTeacher = User.builder().id(3L).name("Unverified teacher").build();
        User admin = User.builder().id(4L).name("Admin").role(Role.ADMIN).emailVerified(true).build();

        when(userSkillRepo.findOffersMatchingMySeeks(learner.getId()))
                .thenReturn(List.of(offer(unverifiedTeacher, java), offer(admin, java), offer(visibleTeacher, java)));

        assertThat(service.getOneWayMatches(learner))
                .extracting(MatchDTO::getUserId).containsExactly(2L);
    }

    @Test
    void returnsNoTeachersWhenThereAreNoMatchingOffers() {
        when(userSkillRepo.findOffersMatchingMySeeks(learner.getId())).thenReturn(List.of());

        assertThat(service.getOneWayMatches(learner)).isEmpty();
    }

    private static User verifiedUser(long id, String name) {
        return User.builder().id(id).name(name).emailVerified(true).build();
    }

    private static UserSkill offer(User teacher, Skill skill) {
        return UserSkill.builder().user(teacher).skill(skill).type(SkillType.OFFER).build();
    }
}
