package com.api_spring_boot.api_spring_boot.repositories;

import com.api_spring_boot.api_spring_boot.entities.OtherVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtherVehicleRepository extends JpaRepository<OtherVehicle, Long> {
    Optional<OtherVehicle> findByMatricule(String matricule);
}
