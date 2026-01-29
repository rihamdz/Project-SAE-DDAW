package com.api_spring_boot.api_spring_boot.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;

import java.util.List;

@Entity
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;          // CLIENT_ID

    public Client(Long id, String adresse) {
        this.id = id;
        this.adresse = adresse;
    }
    public Client() {
        //TODO Auto-generated constructor stub
    }
    private String nom;
    private String prenom;
    private String adresse;
    private String telephone;

    // 1 Client -> N Véhicules
    @OneToMany(mappedBy = "proprietaire")
    private List<Vehicule> vehicules;

    // 1 Client -> N Contrats
    @OneToMany(mappedBy = "client")
    @JsonIgnore
    private List<ContratAssurance> contrats;

    // ----- Getters/Setters -----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public List<Vehicule> getVehicules() { return vehicules; }
    public void setVehicules(List<Vehicule> vehicules) { this.vehicules = vehicules; }

    public List<ContratAssurance> getContrats() { return contrats; }
    public void setContrats(List<ContratAssurance> contrats) { this.contrats = contrats; }
}
