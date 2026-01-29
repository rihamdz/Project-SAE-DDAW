package com.api_spring_boot.api_spring_boot.admin.dto;

import com.api_spring_boot.api_spring_boot.entities.ClaimStatus;

import java.time.LocalDate;

public record AdminClaimDto(
	Long id,
	Long claimNumber,
	ClaimStatus status,
	LocalDate accidentDate,
	String location,
	String description,
	String vehicleMatricule,
	String clientEmail
) {}
