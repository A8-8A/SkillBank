package com.skillbank.dispute.dto;

import com.skillbank.dispute.DisputeStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResolveDisputeRequest {

    @NotNull
    private Long disputeId;

    @NotNull
    private DisputeStatus resolution;

    private String adminNotes;
}
