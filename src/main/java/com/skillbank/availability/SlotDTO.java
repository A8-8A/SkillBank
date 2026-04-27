package com.skillbank.availability;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SlotDTO {
    private String dayOfWeek;
    private int hour;
    private boolean booked;

    public SlotDTO(String dayOfWeek, int hour) {
        this.dayOfWeek = dayOfWeek;
        this.hour = hour;
        this.booked = false;
    }
}
