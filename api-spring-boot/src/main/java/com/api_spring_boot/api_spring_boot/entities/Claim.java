package com.api_spring_boot.api_spring_boot.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long claimNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ClaimStatus status = ClaimStatus.PENDING;

    private LocalDate accidentDate;

    private String location;

    @Column(length = 2000)
    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vehicle_id")
    private Vehicule vehicle;
}
