package com.api_spring_boot.api_spring_boot.repositories;

import com.api_spring_boot.api_spring_boot.entities.ContratAssurance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContratAssuranceRepository extends JpaRepository<ContratAssurance, String> {

    // Liste des contrats du client connecté
    List<ContratAssurance> findByClientIdOrderByDateDesc(Long clientId);

    boolean existsByVehiculeMatricule(String matricule);
    Optional<ContratAssurance> findByVehiculeMatriculeAndClientId(String matricule, Long clientId);
}
