package com.api_spring_boot.api_spring_boot.contracts.dto;


public record ContractDto(
        String numContrat,
        String type,
        String date,          // "YYYY-MM-DD"
        Boolean valide,
        String vehicleMatricule,
        String vehicleMarque,
        String vehicleModele,
        Integer vehicleAnnee,
        boolean hasPdf,
        String pdfFileName,
        String pdfUploadedAt  // ISO string
) {}
