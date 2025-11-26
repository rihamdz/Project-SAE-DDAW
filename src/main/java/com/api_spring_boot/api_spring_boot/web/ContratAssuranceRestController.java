package com.api_spring_boot.api_spring_boot.web;

import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.ContratAssurance;
import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import com.api_spring_boot.api_spring_boot.repositories.ClientRepository;
import com.api_spring_boot.api_spring_boot.repositories.ContratAssuranceRepository;
import com.api_spring_boot.api_spring_boot.repositories.VehiculeRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/contrats")
@CrossOrigin("*")
public class ContratAssuranceRestController {

    private final ContratAssuranceRepository contratRepository;
    private final ClientRepository clientRepository;
    private final VehiculeRepository vehiculeRepository;

    public ContratAssuranceRestController(ContratAssuranceRepository contratRepository,
                                          ClientRepository clientRepository,
                                          VehiculeRepository vehiculeRepository) {
        this.contratRepository = contratRepository;
        this.clientRepository = clientRepository;
        this.vehiculeRepository = vehiculeRepository;
    }

    // ------------------ CRUD classique JSON ------------------

    @GetMapping
    public List<ContratAssurance> getContratsValides() {
        return contratRepository.findByValideTrue();
    }

    @GetMapping("/all")
    public List<ContratAssurance> getAllContrats() {
        return contratRepository.findAll();
    }

    @GetMapping("/{numContrat}")
    public ContratAssurance getContrat(@PathVariable String numContrat) {
        return contratRepository.findById(numContrat)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));
    }

    @PostMapping("/client/{clientId}/vehicule/{matricule}")
    public ContratAssurance createContrat(@PathVariable Long clientId,
                                          @PathVariable String matricule,
                                          @RequestBody ContratAssurance contrat) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Vehicule vehicule = vehiculeRepository.findById(matricule)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        contrat.setClient(client);
        contrat.setVehicule(vehicule);
        contrat.setValide(true);

        return contratRepository.save(contrat);
    }

    @PutMapping("/{numContrat}")
    public ContratAssurance updateContrat(@PathVariable String numContrat,
                                          @RequestBody ContratAssurance contrat) {
        ContratAssurance c = contratRepository.findById(numContrat)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));

        c.setType(contrat.getType());
        c.setDate(contrat.getDate());

        return contratRepository.save(c);
    }

    @DeleteMapping("/{numContrat}")
    public void deleteContrat(@PathVariable String numContrat) {
        ContratAssurance c = contratRepository.findById(numContrat)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));

        c.setValide(false);
        contratRepository.save(c);
    }

    // ------------------ CRUD via URL parameters ------------------

    @PostMapping("/add")
    public ContratAssurance addContratByParams(
            @RequestParam String numContrat,
            @RequestParam String type,
            @RequestParam String date,
            @RequestParam Long clientId,
            @RequestParam String matricule
    ) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Vehicule vehicule = vehiculeRepository.findById(matricule)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        ContratAssurance c = new ContratAssurance();
        c.setNumContrat(numContrat);
        c.setType(type);
        c.setDate(LocalDate.parse(date));
        c.setClient(client);
        c.setVehicule(vehicule);
        c.setValide(true);

        return contratRepository.save(c);
    }

    @PutMapping("/update/{numContrat}")
    public ContratAssurance updateContratByParams(
            @PathVariable String numContrat,
            @RequestParam String type,
            @RequestParam String date
    ) {
        ContratAssurance c = contratRepository.findById(numContrat)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));

        c.setType(type);
        c.setDate(LocalDate.parse(date));

        return contratRepository.save(c);
    }

    @DeleteMapping("/delete/{numContrat}")
    public void deleteContratByParams(@PathVariable String numContrat) {
        ContratAssurance c = contratRepository.findById(numContrat)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));

        c.setValide(false);
        contratRepository.save(c);
    }
}