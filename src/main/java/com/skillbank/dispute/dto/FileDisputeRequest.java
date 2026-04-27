package com.skillbank.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FileDisputeRequest {

    @NotNull
    private Long sessionId;

    @NotBlank
    private String reason;
}
