package com.api_spring_boot.api_spring_boot.repositories;

import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculeRepository extends JpaRepository<Vehicule, String> {
}
