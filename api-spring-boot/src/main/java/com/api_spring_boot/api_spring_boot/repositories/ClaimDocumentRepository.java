package com.api_spring_boot.api_spring_boot.repositories;

import com.api_spring_boot.api_spring_boot.entities.Claim;
import com.api_spring_boot.api_spring_boot.entities.ClaimDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, Long> {
    List<ClaimDocument> findByClaimOrderByUploadedAtDesc(Claim claim);
}
