package com.api_spring_boot.api_spring_boot.claims.dto;

public record OtherVehicleDto(
    Long id,
    String matricule,
    String marque,
    String modele,
    String ownerName,
    String ownerPhone,
    String ownerEmail,
    String insuranceNumber
) {}
