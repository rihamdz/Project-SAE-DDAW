package com.api_spring_boot.api_spring_boot.web;

import com.api_spring_boot.api_spring_boot.entities.Accident;
import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import com.api_spring_boot.api_spring_boot.repositories.AccidentRepository;
import com.api_spring_boot.api_spring_boot.repositories.VehiculeRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/accidents")
@CrossOrigin("*")
public class AccidentRestController {

    private final AccidentRepository accidentRepository;
    private final VehiculeRepository vehiculeRepository;

    public AccidentRestController(AccidentRepository accidentRepository,
                                  VehiculeRepository vehiculeRepository) {
        this.accidentRepository = accidentRepository;
        this.vehiculeRepository = vehiculeRepository;
    }

    // ------------------ CRUD classique JSON ------------------

    @GetMapping
    public List<Accident> getAllAccidents() {
        return accidentRepository.findAll();
    }

    @GetMapping("/{id}")
    public Accident getAccident(@PathVariable Long id) {
        return accidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Accident non trouvé"));
    }

    @PostMapping
    public Accident createAccident(@RequestBody Accident accident) {
        return accidentRepository.save(accident);
    }

    @PutMapping("/{id}")
    public Accident updateAccident(@PathVariable Long id,
                                   @RequestBody Accident accident) {
        Accident a = accidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Accident non trouvé"));

        a.setDate(accident.getDate());
        a.setVehicules(accident.getVehicules());

        return accidentRepository.save(a);
    }

    @DeleteMapping("/{id}")
    public void deleteAccident(@PathVariable Long id) {
        accidentRepository.deleteById(id);
    }

    // ------------------ CRUD via URL params ------------------

    @PostMapping("/add")
    public Accident addAccidentByParams(
            @RequestParam String date,
            @RequestParam String vehicules // ex: "208TU1234,CLIO2022AA"
    ) {
        List<Vehicule> vehList = Arrays.stream(vehicules.split(","))
                .map(id -> vehiculeRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Véhicule introuvable : " + id)))
                .toList();

        Accident a = new Accident();
        a.setDate(LocalDate.parse(date));
        a.setVehicules(vehList);

        return accidentRepository.save(a);
    }

    @PutMapping("/update/{id}")
    public Accident updateAccidentByParams(
            @PathVariable Long id,
            @RequestParam String date,
            @RequestParam String vehicules
    ) {
        Accident a = accidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Accident non trouvé"));

        List<Vehicule> vehList = Arrays.stream(vehicules.split(","))
                .map(idVeh -> vehiculeRepository.findById(idVeh)
                        .orElseThrow(() -> new RuntimeException("Véhicule introuvable : " + idVeh)))
                .toList();

        a.setDate(LocalDate.parse(date));
        a.setVehicules(vehList);

        return accidentRepository.save(a);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteAccidentByParams(@PathVariable Long id) {
        accidentRepository.deleteById(id);
    }
}
