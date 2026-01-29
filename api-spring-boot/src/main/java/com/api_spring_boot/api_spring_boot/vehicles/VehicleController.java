package com.api_spring_boot.api_spring_boot.vehicles;

import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.ContratAssurance;
import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import com.api_spring_boot.api_spring_boot.repositories.ClaimRepository;
import com.api_spring_boot.api_spring_boot.repositories.ContratAssuranceRepository;
import com.api_spring_boot.api_spring_boot.repositories.VehiculeRepository;
import com.api_spring_boot.api_spring_boot.security.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


import java.time.LocalDate;

@RestController
@RequestMapping("/api/clients/me/vehicles")
public class VehicleController {
    private final ClaimRepository claimRepo;
    private final CurrentUserService currentUser;
    private final VehiculeRepository vehiculeRepo;
    private final ContratAssuranceRepository contratRepo;
    

    public VehicleController(CurrentUserService currentUser,
                             VehiculeRepository vehiculeRepo,
                             ContratAssuranceRepository contratRepo,
                            ClaimRepository claimRepo) {
        this.currentUser = currentUser;
        this.vehiculeRepo = vehiculeRepo;
        this.contratRepo = contratRepo;
        this.claimRepo=claimRepo;
    }

    @PostMapping
    public ResponseEntity<?> createVehicle(Authentication auth, @RequestBody CreateVehicleRequest req) {
        Client client = currentUser.getClientOrThrow(auth);

        // 1) Créer + sauvegarder le véhicule
        Vehicule v = new Vehicule();
        v.setMatricule(req.matricule());
        v.setMarque(req.marque());
        v.setModele(req.modele());
        v.setAnnee(req.annee());
        v.setProprietaire(client);

        Vehicule savedVeh = vehiculeRepo.save(v);

        // 2) Créer le contrat automatiquement si pas déjà existant
        if (!contratRepo.existsByVehiculeMatricule(savedVeh.getMatricule())) {
            ContratAssurance c = new ContratAssurance();
            c.setNumContrat(generateContractNumber(savedVeh.getMatricule()));
            c.setType(req.typeContrat() == null ? "STANDARD" : req.typeContrat());
            c.setDate(LocalDate.now());
            c.setValide(false);
            c.setClient(client);
            c.setVehicule(savedVeh);

            contratRepo.save(c);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedVeh);
    }

    private String generateContractNumber(String matricule) {
        return "CTR-" + matricule + "-" + System.currentTimeMillis();
    }


 @DeleteMapping("/{matricule}")
public ResponseEntity<Void> deleteVehicle(Authentication auth, @PathVariable String matricule) {
    Client client = currentUser.getClientOrThrow(auth);

    Vehicule v = vehiculeRepo.findById(matricule)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

    if (v.getProprietaire() == null || v.getProprietaire().getId() == null
            || !v.getProprietaire().getId().equals(client.getId())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
    }

    // Soft-delete: mark vehicle as inactive and set contract valide = false
    ContratAssurance c = v.getContrat();
    if (c != null) {
        c.setValide(false);
        contratRepo.save(c);
    }

    v.setActive(false);
    vehiculeRepo.save(v);

    return ResponseEntity.noContent().build();
}
}
