package com.api_spring_boot.api_spring_boot.repositories;

import com.api_spring_boot.api_spring_boot.entities.Claim;
import com.api_spring_boot.api_spring_boot.entities.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByClientId(Long clientId);
    List<Claim> findByClientOrderByCreatedAtDesc(Client client);
        long countByVehicleMatricule(String matricule);
    List<Claim> findByStatusOrderByCreatedAtDesc(com.api_spring_boot.api_spring_boot.entities.ClaimStatus status);
}