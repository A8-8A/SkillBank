package com.skillbank.availability;

import com.skillbank.session.Session;
import com.skillbank.session.SessionRepository;
import com.skillbank.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private static final int[] VALID_HOURS = {6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,1};
    private final AvailabilityRepository availabilityRepo;
    private final SessionRepository sessionRepo;

    @Transactional(readOnly = true)
    public List<SlotDTO> getSlots(Long userId) {
        Set<String> bookedKeys = getBookedSlotKeys(userId);

        return availabilityRepo.findByUserId(userId).stream()
                .map(s -> {
                    String key = s.getDayOfWeek().name() + "_" + s.getHour();
                    return new SlotDTO(s.getDayOfWeek().name(), s.getHour(), bookedKeys.contains(key));
                })
                .toList();
    }

    @Transactional
    public boolean toggleSlot(User user, DayOfWeek dayOfWeek, int hour) {
        validateHour(hour);
        Optional<AvailabilitySlot> existing =
                availabilityRepo.findByUserIdAndDayOfWeekAndHour(user.getId(), dayOfWeek, hour);

        if (existing.isPresent()) {
            // Check if this slot has an active booking
            if (isSlotBooked(user.getId(), dayOfWeek, hour)) {
                throw new IllegalStateException("Cannot remove this slot — it has an active booking. Reject or wait for the session to be cancelled first.");
            }
            availabilityRepo.delete(existing.get());
            return false;
        } else {
            availabilityRepo.save(AvailabilitySlot.builder()
                    .user(user)
                    .dayOfWeek(dayOfWeek)
                    .hour(hour)
                    .build());
            return true;
        }
    }

    private boolean isSlotBooked(Long teacherId, DayOfWeek dayOfWeek, int hour) {
        String key = dayOfWeek.name() + "_" + hour;
        return getBookedSlotKeys(teacherId).contains(key);
    }

    private Set<String> getBookedSlotKeys(Long teacherId) {
        List<Session> activeSessions = sessionRepo.findActiveSessionsByTeacherId(teacherId, LocalDateTime.now());
        Set<String> bookedKeys = new HashSet<>();

        for (Session session : activeSessions) {
            LocalDateTime scheduledAt = session.getScheduledAt();
            String key = scheduledAt.getDayOfWeek().name() + "_" + scheduledAt.getHour();
            bookedKeys.add(key);
        }

        return bookedKeys;
    }

    private void validateHour(int hour) {
        for (int valid : VALID_HOURS) {
            if (valid == hour) return;
        }
        throw new IllegalArgumentException("Slots are only available between 6 AM and 1 AM");
    }
}
