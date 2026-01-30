package com.api_spring_boot.api_spring_boot.claims.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public record AddOtherVehicleRequest(
    @NotNull String matricule,
    @JsonProperty("marque") String brand,
    @JsonProperty("modele") String model,
    @NotNull String ownerName,
    String ownerPhone,
    String ownerEmail,
    String insuranceNumber
) {}
