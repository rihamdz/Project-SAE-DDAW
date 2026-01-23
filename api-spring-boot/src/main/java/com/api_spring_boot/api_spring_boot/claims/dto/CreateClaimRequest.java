package com.api_spring_boot.api_spring_boot.claims.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


       public record CreateClaimRequest(
        @NotNull String vehicleId,
        @NotBlank String accidentDate,
        @NotBlank String location,
        @NotBlank String description
) {}

