package com.api_spring_boot.api_spring_boot.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtherVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String matricule;

    private String marque;

    private String modele;

    @Column(nullable = false)
    private String ownerName;

    private String ownerPhone;

    private String ownerEmail;

    private String insuranceNumber;

    // Relation many-to-many: un tiers peut être impliqué dans plusieurs accidents
    @ManyToMany(mappedBy = "otherVehicles", cascade = CascadeType.ALL)
    private Set<Claim> claims = new HashSet<>();
}
