package com.api_spring_boot.api_spring_boot.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "vehicule")
public class Vehicule {

    @Id
    @Column(name = "matricule", nullable = false, unique = true)
    private String matricule;   // id du véhicule

    private String modele;
    private String marque;
    private Integer annee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "client_id")
    private Client proprietaire;

    @OneToOne(mappedBy = "vehicule", fetch = FetchType.LAZY)
    @JsonIgnore
    private ContratAssurance contrat;

    // ----- Getters/Setters -----

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    // ✅ Alias ID
    public String getId() {
        return this.matricule;
    }

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
}
