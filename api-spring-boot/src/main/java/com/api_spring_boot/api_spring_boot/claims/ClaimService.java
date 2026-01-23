package com.api_spring_boot.api_spring_boot.claims;

import com.api_spring_boot.api_spring_boot.claims.dto.CreateClaimRequest;
import com.api_spring_boot.api_spring_boot.entities.Claim;
import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import com.api_spring_boot.api_spring_boot.repositories.ClaimRepository;
import com.api_spring_boot.api_spring_boot.repositories.VehiculeRepository;
import com.api_spring_boot.api_spring_boot.security.CurrentUserService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepo;
    private final VehiculeRepository vehiculeRepo;
    private final CurrentUserService currentUser;

    public ClaimService(ClaimRepository claimRepo,
                        VehiculeRepository vehiculeRepo,
                        CurrentUserService currentUser) {
        this.claimRepo = claimRepo;
        this.vehiculeRepo = vehiculeRepo;
        this.currentUser = currentUser;
    }

    public Claim create(Authentication auth, CreateClaimRequest req) {
        Client client = currentUser.getClientOrThrow(auth);

        Vehicule vehicle = vehiculeRepo.findById(req.vehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        Claim claim = new Claim();
        claim.setClient(client);
        claim.setVehicle(vehicle);
        claim.setAccidentDate(LocalDate.parse(req.accidentDate()));
        claim.setLocation(req.location());
        claim.setDescription(req.description());

        return claimRepo.save(claim);
    }

    public List<Claim> myClaims(Authentication auth) {
        Client client = currentUser.getClientOrThrow(auth);
        return claimRepo.findByClientId(client.getId());
    }
}
