package com.api_spring_boot.api_spring_boot.repositories;

import com.api_spring_boot.api_spring_boot.entities.Claim;
import com.api_spring_boot.api_spring_boot.entities.ClaimStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimStepRepository extends JpaRepository<ClaimStep, Long> {
    List<ClaimStep> findByClaimOrderByCreatedAtAsc(Claim claim);
}
