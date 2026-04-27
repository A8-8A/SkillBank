package com.skillbank.availability;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByUserId(Long userId);
    Optional<AvailabilitySlot> findByUserIdAndDayOfWeekAndHour(Long userId, DayOfWeek dayOfWeek, int hour);
}
