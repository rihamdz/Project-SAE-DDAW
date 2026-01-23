package com.api_spring_boot.api_spring_boot.claims.dto;

public record DocumentDto(
        Long id,
        String fileName,
        String contentType,
        String uploadedAt
) {}
