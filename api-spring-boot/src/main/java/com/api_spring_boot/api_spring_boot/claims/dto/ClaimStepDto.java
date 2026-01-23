package com.api_spring_boot.api_spring_boot.claims.dto;

import com.api_spring_boot.api_spring_boot.entities.StepStatus;

public record ClaimStepDto(
        Long id,
        String stepName,
        StepStatus stepStatus,
        String comment,
        String createdAt
) {}
