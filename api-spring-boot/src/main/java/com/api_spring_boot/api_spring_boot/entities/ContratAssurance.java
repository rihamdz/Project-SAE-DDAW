package com.api_spring_boot.api_spring_boot.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class ContratAssurance {

    @Id
    private String numContrat;      // id du contrat

    private String type;

    private LocalDate date;

    private Boolean valide;

    // -------- PDF du contrat --------
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] pdfData;

    private String pdfFileName;

    private String pdfContentType;

    private LocalDateTime pdfUploadedAt;
    // --------------------------------

    // Signe : N contrats -> 1 client
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    // Couvert : 1 contrat -> 1 véhicule
    @OneToOne
    @JoinColumn(name = "vehicule_id", unique = true)
    private Vehicule vehicule;

    // ----- Getters / Setters -----

    public String getNumContrat() { return numContrat; }
    public void setNumContrat(String numContrat) { this.numContrat = numContrat; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Boolean getValide() { return valide; }
    public void setValide(Boolean valide) { this.valide = valide; }

    // ----- PDF getters/setters -----
    public byte[] getPdfData() { return pdfData; }
    public void setPdfData(byte[] pdfData) { this.pdfData = pdfData; }

    public String getPdfFileName() { return pdfFileName; }
    public void setPdfFileName(String pdfFileName) { this.pdfFileName = pdfFileName; }

    public String getPdfContentType() { return pdfContentType; }
    public void setPdfContentType(String pdfContentType) { this.pdfContentType = pdfContentType; }

    public LocalDateTime getPdfUploadedAt() { return pdfUploadedAt; }
    public void setPdfUploadedAt(LocalDateTime pdfUploadedAt) { this.pdfUploadedAt = pdfUploadedAt; }
    // --------------------------------

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public Vehicule getVehicule() { return vehicule; }
    public void setVehicule(Vehicule vehicule) { this.vehicule = vehicule; }
}
