package com.api_spring_boot.api_spring_boot.admin;

import com.api_spring_boot.api_spring_boot.entities.Role;
import com.api_spring_boot.api_spring_boot.entities.UserAccount;
import com.api_spring_boot.api_spring_boot.repositories.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSetup {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public AdminSetup(UserAccountRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureAdmin() {
        boolean exists = userRepo.findByEmail(adminEmail).isPresent();
        if (!exists) {
            UserAccount admin = UserAccount.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName("Administrator")
                    .role(Role.ADMIN)
                    .clientId(null)
                    .build();

            userRepo.save(admin);
            System.out.println("Created admin user: " + adminEmail);
        }
    }
}
