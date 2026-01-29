package com.api_spring_boot.api_spring_boot.admin.dto;

import java.time.LocalDate;

public record AdminContractDto(
	String numContrat,
	String type,
	LocalDate date,
	Boolean valide,
	String clientEmail,
	String vehiculeMatricule,
	String pdfFileName,
	String pdfContentType
) {}
