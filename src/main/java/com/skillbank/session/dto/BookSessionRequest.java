package com.skillbank.session.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookSessionRequest {

    @NotNull
    private Long teacherId;

    @NotNull
    private Long skillId;

    @NotNull
    @Future
    private LocalDateTime scheduledAt;

    @NotNull
    @Min(30)
    private Integer durationMinutes;

    private String notes;
}
