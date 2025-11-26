package com.api_spring_boot.api_spring_boot.web;

import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.repositories.ClientRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/clients")
@CrossOrigin("*")
public class ClientRestController {

    private final ClientRepository clientRepository;

    public ClientRestController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    // ------------------ CRUD classique JSON ------------------

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @GetMapping("/{id}")
    public Client getClient(@PathVariable Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
    }

    @PostMapping
    public Client createClient(@RequestBody Client client) {
        return clientRepository.save(client);
    }

    @PutMapping("/{id}")
    public Client updateClient(@PathVariable Long id, @RequestBody Client client) {
        Client c = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        c.setNom(client.getNom());
        c.setPrenom(client.getPrenom());
        c.setAdresse(client.getAdresse());
        c.setTelephone(client.getTelephone());

        return clientRepository.save(c);
    }

    @DeleteMapping("/{id}")
    public void deleteClient(@PathVariable Long id) {
        clientRepository.deleteById(id);
    }

    // ------------------ CRUD via URL param ------------------

    @PostMapping("/add")
    public Client addClientByParams(
            @RequestParam String nom,
            @RequestParam String prenom,
            @RequestParam String adresse,
            @RequestParam String telephone
    ) {
        Client c = new Client();
        c.setNom(nom);
        c.setPrenom(prenom);
        c.setAdresse(adresse);
        c.setTelephone(telephone);
        return clientRepository.save(c);
    }

    @PutMapping("/update/{id}")
    public Client updateClientByParams(
            @PathVariable Long id,
            @RequestParam String nom,
            @RequestParam String prenom,
            @RequestParam String adresse,
            @RequestParam String telephone
    ) {
        Client c = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        c.setNom(nom);
        c.setPrenom(prenom);
        c.setAdresse(adresse);
        c.setTelephone(telephone);

        return clientRepository.save(c);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteClientByParams(@PathVariable Long id) {
        clientRepository.deleteById(id);
    }
}