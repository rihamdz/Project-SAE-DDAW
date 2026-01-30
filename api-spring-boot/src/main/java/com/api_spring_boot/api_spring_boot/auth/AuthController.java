package com.api_spring_boot.api_spring_boot.auth;

import com.api_spring_boot.api_spring_boot.auth.dto.*;
import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.Role;
import com.api_spring_boot.api_spring_boot.entities.UserAccount;
import com.api_spring_boot.api_spring_boot.repositories.ClientRepository;
import com.api_spring_boot.api_spring_boot.repositories.UserAccountRepository;
import com.api_spring_boot.api_spring_boot.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserAccountRepository userRepo;
    private final JwtService jwtService;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authManager,
                          UserAccountRepository userRepo,
                          JwtService jwtService,
                          ClientRepository clientRepository,
                          PasswordEncoder passwordEncoder) {
        this.authManager = authManager;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.clientRepository = clientRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        var user = userRepo.findByEmail(req.email()).orElseThrow();

        String token = jwtService.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "userId", user.getId())
        );

        return new AuthResponse(token,
                new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole())
        );
    }

    @GetMapping("/me")
    public AuthResponse.UserDto me(Authentication authentication) {
                if (authentication == null || authentication.getName() == null) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
                }

                String email = authentication.getName();
                var user = userRepo.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                return new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
    @PostMapping("/register")
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {

        if (userRepo.existsByEmail(req.email())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        Client client = new Client();
        client.setNom(req.fullName()); // adapte si tu as prénom/nom séparés
        Client savedClient = clientRepository.save(client);
        // 2️Créer UserAccount
        UserAccount user = UserAccount.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .role(Role.CLIENT)
                .clientId(savedClient.getId())
                .build();

        userRepo.save(user);

        // 3️⃣ Générer token
        String token = jwtService.generateToken(
                user.getEmail(),
                Map.of(
                        "role", user.getRole().name(),
                        "userId", user.getId()
                )
        );

        return new AuthResponse(
                token,
                new AuthResponse.UserDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole()
                )
        );
    }

}
