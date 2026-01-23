package com.api_spring_boot.api_spring_boot.clients;

import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import com.api_spring_boot.api_spring_boot.repositories.VehiculeRepository;
import com.api_spring_boot.api_spring_boot.security.CurrentUserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients/me")
@CrossOrigin(origins = "http://localhost:5173")
public class ClientMeController {

    private final CurrentUserService currentUserService;
    private final VehiculeRepository vehiculeRepository;

    public ClientMeController(CurrentUserService currentUserService,
                              VehiculeRepository vehiculeRepository) {
        this.currentUserService = currentUserService;
        this.vehiculeRepository = vehiculeRepository;
    }

    @GetMapping("/vehicles")
    public List<Vehicule> myVehicles(Authentication auth) {
        Client client = currentUserService.getClientOrThrow(auth);
        return client.getVehicules();
    }

    // ✅ DTO request (simple)
    public record CreateVehicleRequest(
            @NotBlank String matricule,
            @NotBlank String marque,
            @NotBlank String modele,
            @NotNull Integer annee
    ) {}

    
    
}
