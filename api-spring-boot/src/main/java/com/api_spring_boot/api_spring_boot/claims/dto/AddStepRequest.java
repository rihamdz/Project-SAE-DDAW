package com.api_spring_boot.api_spring_boot.claims.dto;

import com.api_spring_boot.api_spring_boot.entities.StepStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddStepRequest(
        @NotBlank String stepName,
        @NotNull StepStatus stepStatus,
        String comment
) {}
