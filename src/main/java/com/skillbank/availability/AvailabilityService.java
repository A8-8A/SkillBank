package com.skillbank.availability;

import com.skillbank.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private static final int[] VALID_HOURS = {6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,1};
    private final AvailabilityRepository availabilityRepo;

    @Transactional(readOnly = true)
    public List<SlotDTO> getSlots(Long userId) {
        return availabilityRepo.findByUserId(userId).stream()
                .map(s -> new SlotDTO(s.getDayOfWeek().name(), s.getHour()))
                .toList();
    }

    @Transactional
    public boolean toggleSlot(User user, DayOfWeek dayOfWeek, int hour) {
        validateHour(hour);
        Optional<AvailabilitySlot> existing =
                availabilityRepo.findByUserIdAndDayOfWeekAndHour(user.getId(), dayOfWeek, hour);

        if (existing.isPresent()) {
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

    private void validateHour(int hour) {
        for (int valid : VALID_HOURS) {
            if (valid == hour) return;
        }
        throw new IllegalArgumentException("Slots are only available between 6 AM and 1 AM");
    }
}
