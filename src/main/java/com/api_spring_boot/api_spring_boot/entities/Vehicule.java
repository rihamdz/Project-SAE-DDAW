package com.api_spring_boot.api_spring_boot.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Vehicule {

    @Id
    private String matricule;   // id du véhicule

    private String modele;
    private String marque;
    private Integer annee;

    // Appartient : N véhicules -> 1 client
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "client_id")
    private Client proprietaire;

    // Couvert : 1 véhicule <-> 1 contrat
    @OneToOne(mappedBy = "vehicule")
    @JsonIgnore
    private ContratAssurance contrat;

    // Concerne : ManyToMany avec Accident
    @ManyToMany(mappedBy = "vehicules")
    @JsonIgnore
    private List<Accident> accidents;

    // ----- Getters/Setters -----

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }

    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }

    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer annee) { this.annee = annee; }

    public Client getProprietaire() { return proprietaire; }
    public void setProprietaire(Client proprietaire) { this.proprietaire = proprietaire; }

    public ContratAssurance getContrat() { return contrat; }
    public void setContrat(ContratAssurance contrat) { this.contrat = contrat; }

    public List<Accident> getAccidents() { return accidents; }
    public void setAccidents(List<Accident> accidents) { this.accidents = accidents; }
}
