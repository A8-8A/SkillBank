package com.skillbank.availability;

import com.skillbank.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<SlotDTO>> getSlots(@PathVariable Long userId) {
        return ResponseEntity.ok(availabilityService.getSlots(userId));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggle(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> body) {
        DayOfWeek day = DayOfWeek.valueOf(body.get("dayOfWeek").toUpperCase());
        int hour = Integer.parseInt(body.get("hour"));
        try {
            boolean available = availabilityService.toggleSlot(currentUser, day, hour);
            return ResponseEntity.ok(Map.of("available", available, "dayOfWeek", day.name(), "hour", hour));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
