package com.api_spring_boot.api_spring_boot.vehicles;

import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.ContratAssurance;
import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import com.api_spring_boot.api_spring_boot.repositories.ContratAssuranceRepository;
import com.api_spring_boot.api_spring_boot.repositories.VehiculeRepository;
import com.api_spring_boot.api_spring_boot.security.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/clients/me/vehicles")
public class VehicleController {

    private final CurrentUserService currentUser;
    private final VehiculeRepository vehiculeRepo;
    private final ContratAssuranceRepository contratRepo;

    public VehicleController(CurrentUserService currentUser,
                             VehiculeRepository vehiculeRepo,
                             ContratAssuranceRepository contratRepo) {
        this.currentUser = currentUser;
        this.vehiculeRepo = vehiculeRepo;
        this.contratRepo = contratRepo;
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
}
