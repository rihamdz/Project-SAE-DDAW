package com.api_spring_boot.api_spring_boot.web;

import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import com.api_spring_boot.api_spring_boot.repositories.ClientRepository;
import com.api_spring_boot.api_spring_boot.repositories.VehiculeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/vehicules")
@CrossOrigin("*")
public class VehiculeRestController {

    private final VehiculeRepository vehiculeRepository;
    private final ClientRepository clientRepository;

    public VehiculeRestController(VehiculeRepository vehiculeRepository,
                                  ClientRepository clientRepository) {
        this.vehiculeRepository = vehiculeRepository;
        this.clientRepository = clientRepository;
    }

    // ------------------ CRUD classique JSON ------------------

    @GetMapping
    public List<Vehicule> getAllVehicules() {
        return vehiculeRepository.findAll();
    }

    @GetMapping("/{matricule}")
    public Vehicule getVehicule(@PathVariable String matricule) {
        return vehiculeRepository.findById(matricule)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));
    }

    @PostMapping("/client/{clientId}")
    public Vehicule createVehiculeForClient(@PathVariable Long clientId,
                                            @RequestBody Vehicule vehicule) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        vehicule.setProprietaire(client);
        return vehiculeRepository.save(vehicule);
    }

    @PutMapping("/{matricule}")
    public Vehicule updateVehicule(@PathVariable String matricule,
                                   @RequestBody Vehicule vehicule) {
        Vehicule v = vehiculeRepository.findById(matricule)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        v.setModele(vehicule.getModele());
        v.setMarque(vehicule.getMarque());
        v.setAnnee(vehicule.getAnnee());

        return vehiculeRepository.save(v);
    }

    @DeleteMapping("/{matricule}")
    public void deleteVehicule(@PathVariable String matricule) {
        vehiculeRepository.deleteById(matricule);
    }

    // ------------------ CRUD via URL params ------------------

    @PostMapping("/add")
    public Vehicule addVehiculeByParams(
            @RequestParam String matricule,
            @RequestParam String modele,
            @RequestParam String marque,
            @RequestParam Integer annee,
            @RequestParam Long clientId
    ) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Vehicule v = new Vehicule();
        v.setMatricule(matricule);
        v.setModele(modele);
        v.setMarque(marque);
        v.setAnnee(annee);
        v.setProprietaire(client);

        return vehiculeRepository.save(v);
    }

    @PutMapping("/update/{matricule}")
    public Vehicule updateVehiculeByParams(
            @PathVariable String matricule,
            @RequestParam String modele,
            @RequestParam String marque,
            @RequestParam Integer annee
    ) {
        Vehicule v = vehiculeRepository.findById(matricule)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        v.setModele(modele);
        v.setMarque(marque);
        v.setAnnee(annee);

        return vehiculeRepository.save(v);
    }

    @DeleteMapping("/delete/{matricule}")
    public void deleteVehiculeByParams(@PathVariable String matricule) {
        vehiculeRepository.deleteById(matricule);
    }
}
