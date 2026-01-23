package com.api_spring_boot.api_spring_boot.auth.dto;


import com.api_spring_boot.api_spring_boot.entities.Role;

public record AuthResponse(
        String token,
        UserDto user
) {
    public record UserDto(Long id, String email, String fullName, Role role) {}
}
