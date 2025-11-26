package com.api_spring_boot.api_spring_boot.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
public class Accident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long numAccident;   // PK

    private LocalDate date;

    // Concerne : ManyToMany avec Vehicule
    @ManyToMany
    @JoinTable(
            name = "accident_vehicule",
            joinColumns = @JoinColumn(name = "accident_id"),
            inverseJoinColumns = @JoinColumn(name = "vehicule_id")
    )
    private List<Vehicule> vehicules;

    // ----- Getters/Setters -----

    public Long getNumAccident() { return numAccident; }
    public void setNumAccident(Long numAccident) { this.numAccident = numAccident; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<Vehicule> getVehicules() { return vehicules; }
    public void setVehicules(List<Vehicule> vehicules) { this.vehicules = vehicules; }
}
