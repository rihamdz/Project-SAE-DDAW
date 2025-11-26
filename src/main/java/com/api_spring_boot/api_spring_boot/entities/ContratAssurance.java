package com.api_spring_boot.api_spring_boot.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class ContratAssurance {

    @Id
    private String numContrat;      // id du contrat

    private String type;

    private LocalDate date;


     private Boolean valide;

    // Signe : N contrats -> 1 client
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    // Couvert : 1 contrat -> 1 véhicule
    @OneToOne
    @JoinColumn(name = "vehicule_id", unique = true)
    private Vehicule vehicule;

    // ----- Getters/Setters -----

    public String getNumContrat() { return numContrat; }
    public void setNumContrat(String numContrat) { this.numContrat = numContrat; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public Vehicule getVehicule() { return vehicule; }
    public void setVehicule(Vehicule vehicule) { this.vehicule = vehicule; }

    public Boolean getValide() {
        return valide;
    }

    public void setValide(Boolean valide) {
        this.valide = valide;
    }
}