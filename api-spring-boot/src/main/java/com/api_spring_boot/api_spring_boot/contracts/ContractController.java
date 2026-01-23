package com.api_spring_boot.api_spring_boot.contracts;

import com.api_spring_boot.api_spring_boot.contracts.dto.ContractDto;
import com.api_spring_boot.api_spring_boot.entities.Client;
import com.api_spring_boot.api_spring_boot.entities.ContratAssurance;
import com.api_spring_boot.api_spring_boot.entities.Vehicule;
import com.api_spring_boot.api_spring_boot.repositories.ContratAssuranceRepository;
import com.api_spring_boot.api_spring_boot.security.CurrentUserService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final CurrentUserService currentUser;
    private final ContratAssuranceRepository contratRepo;

    public ContractController(CurrentUserService currentUser, ContratAssuranceRepository contratRepo) {
        this.currentUser = currentUser;
        this.contratRepo = contratRepo;
    }

    // ✅ 1) Voir tous mes contrats
    @GetMapping("/me")
    public List<ContractDto> myContracts(Authentication auth) {
        Client client = currentUser.getClientOrThrow(auth);

        return contratRepo.findByClientIdOrderByDateDesc(client.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ✅ 2) Voir le contrat d'une voiture (par matricule)
    @GetMapping("/vehicle/{matricule}")
    public ContractDto contractForVehicle(Authentication auth, @PathVariable String matricule) {
        ContratAssurance contrat = getContractForCurrentClientAndVehicleOrThrow(auth, matricule);
        return toDto(contrat);
    }

    // ✅ 3) Upload / replace le PDF du contrat
    @PutMapping(value = "/vehicle/{matricule}/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ContractDto uploadPdf(Authentication auth,
                                 @PathVariable String matricule,
                                 @RequestParam("file") MultipartFile file) throws IOException {

        ContratAssurance contrat = getContractForCurrentClientAndVehicleOrThrow(auth, matricule);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }

        // Vérif PDF (content-type parfois null, donc on accepte aussi par extension)
        String ct = file.getContentType();
        String name = file.getOriginalFilename();

        boolean looksPdf = (ct != null && ct.equalsIgnoreCase("application/pdf")) ||
                (name != null && name.toLowerCase().endsWith(".pdf"));

        if (!looksPdf) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }

        // --- IMPORTANT: il faut ajouter ces champs dans ContratAssurance ---
        // pdfData (byte[]), pdfFileName, pdfContentType, pdfUploadedAt (LocalDateTime)
        contrat.setPdfData(file.getBytes());
        contrat.setPdfFileName(name == null ? "contract.pdf" : name);
        contrat.setPdfContentType(ct == null ? "application/pdf" : ct);
        contrat.setPdfUploadedAt(LocalDateTime.now());

        ContratAssurance saved = contratRepo.save(contrat);
        return toDto(saved);
    }

    // ✅ 4) Télécharger le PDF du contrat
    @GetMapping("/vehicle/{matricule}/pdf")
    public ResponseEntity<byte[]> downloadPdf(Authentication auth, @PathVariable String matricule) {
        ContratAssurance contrat = getContractForCurrentClientAndVehicleOrThrow(auth, matricule);

        if (contrat.getPdfData() == null || contrat.getPdfData().length == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract PDF not found");
        }

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(
                    contrat.getPdfContentType() == null ? "application/pdf" : contrat.getPdfContentType()
            );
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_PDF;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + safeFilename(contrat.getPdfFileName()) + "\"")
                .body(contrat.getPdfData());
    }

    // ----------------- helpers -----------------

    private ContratAssurance getContractForCurrentClientAndVehicleOrThrow(Authentication auth, String matricule) {
        Client client = currentUser.getClientOrThrow(auth);

        return contratRepo.findByVehiculeMatriculeAndClientId(matricule, client.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Contract not found for this vehicle (or not your vehicle)"
                ));
    }

    private ContractDto toDto(ContratAssurance c) {
        Vehicule v = c.getVehicule();

        boolean hasPdf = c.getPdfData() != null && c.getPdfData().length > 0;

        return new ContractDto(
                c.getNumContrat(),
                c.getType(),
                c.getDate() == null ? null : c.getDate().toString(),
                c.getValide(),
                v == null ? null : v.getMatricule(),
                v == null ? null : v.getMarque(),
                v == null ? null : v.getModele(),
                v == null ? null : v.getAnnee(),
                hasPdf,
                c.getPdfFileName(),
                c.getPdfUploadedAt() == null ? null : c.getPdfUploadedAt().toString()
        );
    }

    private String safeFilename(String name) {
        if (name == null) return "contract.pdf";
        return name.replaceAll("[\\r\\n\"]", "_");
    }
}
