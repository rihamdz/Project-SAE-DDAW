package com.api_spring_boot.api_spring_boot.repositories;

import com.api_spring_boot.api_spring_boot.entities.ContratAssurance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContratAssuranceRepository
        extends JpaRepository<ContratAssurance, String> {

    // Pour l'affichage : uniquement les contrats valides
    List<ContratAssurance> findByValideTrue();
}
