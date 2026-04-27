package com.skillbank.availability;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SlotDTO {
    private String dayOfWeek;
    private int hour;
}
