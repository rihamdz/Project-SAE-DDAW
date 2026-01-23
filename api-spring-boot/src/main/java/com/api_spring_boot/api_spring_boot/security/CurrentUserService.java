package com.api_spring_boot.api_spring_boot.security;

import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.UserAccount;
import com.api_spring_boot.api_spring_boot.repositories.ClientRepository;
import com.api_spring_boot.api_spring_boot.repositories.UserAccountRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserAccountRepository userRepo;
    private final ClientRepository clientRepo;

    public CurrentUserService(UserAccountRepository userRepo,
                              ClientRepository clientRepo) {
        this.userRepo = userRepo;
        this.clientRepo = clientRepo;
    }

    public Client getClientOrThrow(Authentication auth) {
        String email = auth.getName(); // email depuis JWT

        UserAccount user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getClientId() == null) {
            throw new RuntimeException("User has no client linked");
        }

        return clientRepo.findById(user.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
    }
}
