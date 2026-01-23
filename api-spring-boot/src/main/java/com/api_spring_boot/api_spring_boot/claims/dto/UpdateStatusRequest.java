package com.api_spring_boot.api_spring_boot.claims.dto;

import com.api_spring_boot.api_spring_boot.entities.ClaimStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull ClaimStatus status) {}
