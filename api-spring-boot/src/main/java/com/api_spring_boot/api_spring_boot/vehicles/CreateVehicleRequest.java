package com.api_spring_boot.api_spring_boot.vehicles;

public record CreateVehicleRequest(
        String matricule,
        String marque,
        String modele,
        Integer annee,
        String typeContrat   // optionnel
) {}
