package com.api_spring_boot.api_spring_boot.claims;

import com.api_spring_boot.api_spring_boot.claims.dto.*;
import com.api_spring_boot.api_spring_boot.entities.*;
import com.api_spring_boot.api_spring_boot.repositories.*;
import com.api_spring_boot.api_spring_boot.security.CurrentUserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/clients/me/claims")
@Validated
public class ClaimController {

    private final CurrentUserService currentUser;
    private final ClaimRepository claimRepo;
    private final ClaimStepRepository stepRepo;
    private final ClaimDocumentRepository docRepo;
    private final VehiculeRepository vehiculeRepo;
    private final OtherVehicleRepository otherVehicleRepo;
    private final ObjectMapper objectMapper;

    public ClaimController(CurrentUserService currentUser,
                           ClaimRepository claimRepo,
                           ClaimStepRepository stepRepo,
                           ClaimDocumentRepository docRepo,
                           VehiculeRepository vehiculeRepo,
                           OtherVehicleRepository otherVehicleRepo,
                           ObjectMapper objectMapper) {
        this.currentUser = currentUser;
        this.claimRepo = claimRepo;
        this.stepRepo = stepRepo;
        this.docRepo = docRepo;
        this.vehiculeRepo = vehiculeRepo;
        this.otherVehicleRepo = otherVehicleRepo;
        this.objectMapper = objectMapper;
    }

    //  Mes claims
    @GetMapping
    public List<ClaimDto> myClaims(Authentication auth) {
        Client client = currentUser.getClientOrThrow(auth);
        return claimRepo.findByClientOrderByCreatedAtDesc(client)
                .stream().map(this::toDto).toList();
    }

    //  Détail d’un claim
    @GetMapping("/{id}")
    public ClaimDto getOne(Authentication auth, @PathVariable Long id) {
        return toDto(getClaimForCurrentClientOrThrow(auth, id));
    }
    //  Étapes d'un claim
    @GetMapping("/{id}/steps")
    public List<ClaimStepDto> getSteps(Authentication auth, @PathVariable Long id) {
        Claim claim = getClaimForCurrentClientOrThrow(auth, id);
        return stepRepo.findByClaimOrderByCreatedAtAsc(claim)
                .stream()
                .map(s -> new ClaimStepDto(
                        s.getId(),
                        s.getStepName(),
                        s.getStepStatus(),
                        s.getComment(),
                        s.getCreatedAt() == null ? null : s.getCreatedAt().toString()
                ))
                .toList();
    }
    // Créer claim + document OBLIGATOIRE (multipart)
    // IMPORTANT: on reçoit "data" en String pour éviter 415, puis on parse en JSON
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ClaimDto create(Authentication auth,
                           @RequestPart("data") String data,
                           @RequestPart("file") MultipartFile file) throws IOException {

        Client client = currentUser.getClientOrThrow(auth);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document obligatoire");
        }

        //  parse JSON -> CreateClaimRequest
        CreateClaimRequest req;
        try {
            req = objectMapper.readValue(data, CreateClaimRequest.class);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Champ 'data' invalide (JSON attendu). Exemple: {\"vehicleId\":\"AA-123-75\",...}"
            );
        }

        //  validations manuelles (car on n'a plus @Valid automatique ici)
        if (req.vehicleId() == null || req.vehicleId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vehicleId obligatoire");
        }
        if (req.accidentDate() == null || req.accidentDate().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "accidentDate obligatoire");
        }

        Vehicule veh = vehiculeRepo.findById(req.vehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        // Contrat obligatoire + actif (valide == true)
        ContratAssurance contrat = veh.getContrat();
        if (contrat == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Contrat non valide - Aucun contrat associé à ce véhicule");
        }
        if (contrat.getValide() == null || !contrat.getValide()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Contrat non valide - Contrat inactif : déclaration impossible");
        }

        Claim claim = Claim.builder()
                .client(client)
                .vehicle(veh)
                .status(ClaimStatus.DECLARED)
                .accidentDate(parseDateOrThrow(req.accidentDate()))
                .location(req.location() == null ? "" : req.location())
                .description(req.description() == null ? "" : req.description())
                .createdAt(LocalDateTime.now())
                .build();

        Claim saved = claimRepo.save(claim);

        // step initial
        stepRepo.save(ClaimStep.builder()
                .claim(saved)
                .stepName("Déclaration")
                .stepStatus(StepStatus.DONE)
                .comment("Déclaration créée par le client")
                .createdAt(LocalDateTime.now())
                .build());

        //  sauvegarde doc (obligatoire)
        ClaimDocument doc = ClaimDocument.builder()
                .claim(saved)
                .fileName(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename())
                .contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                .data(file.getBytes())
                .uploadedAt(LocalDateTime.now())
                .build();

        docRepo.save(doc);

        return toDto(saved);
    }

    //  Liste docs
    @GetMapping("/{id}/documents")
    public List<DocumentDto> listDocuments(Authentication auth, @PathVariable Long id) {
        Claim claim = getClaimForCurrentClientOrThrow(auth, id);

        return docRepo.findByClaimOrderByUploadedAtDesc(claim)
                .stream()
                .map(d -> new DocumentDto(
                        d.getId(),
                        d.getFileName(),
                        d.getContentType(),
                        d.getUploadedAt() == null ? null : d.getUploadedAt().toString()
                ))
                .toList();
    }

    // Télécharger doc
    @GetMapping("/{id}/documents/{docId}")
    public ResponseEntity<byte[]> download(Authentication auth,
                                           @PathVariable Long id,
                                           @PathVariable Long docId) {

        Claim claim = getClaimForCurrentClientOrThrow(auth, id);

        ClaimDocument doc = docRepo.findById(docId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (!doc.getClaim().getId().equals(claim.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bad document");
        }

        MediaType mediaType;
        try { mediaType = MediaType.parseMediaType(doc.getContentType()); }
        catch (Exception e) { mediaType = MediaType.APPLICATION_OCTET_STREAM; }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + safeFilename(doc.getFileName()) + "\"")
                .body(doc.getData());
    }

    // (optionnel) ajouter d’autres docs après
    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentDto uploadMore(Authentication auth,
                                  @PathVariable Long id,
                                  @RequestPart("file") MultipartFile file) throws IOException {

        Claim claim = getClaimForCurrentClientOrThrow(auth, id);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File required");
        }

        ClaimDocument doc = ClaimDocument.builder()
                .claim(claim)
                .fileName(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename())
                .contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                .data(file.getBytes())
                .uploadedAt(LocalDateTime.now())
                .build();

        ClaimDocument saved = docRepo.save(doc);

        return new DocumentDto(
                saved.getId(),
                saved.getFileName(),
                saved.getContentType(),
                saved.getUploadedAt() == null ? null : saved.getUploadedAt().toString()
        );
    }

    // ========== TIERS IMPLIQUÉS (Other Vehicles) ==========

    // Lister les tiers impliqués d'un accident
    @GetMapping("/{id}/other-vehicles")
    public List<OtherVehicleDto> getOtherVehicles(Authentication auth, @PathVariable Long id) {
        Claim claim = getClaimForCurrentClientOrThrow(auth, id);
        return claim.getOtherVehicles().stream()
                .map(this::otherVehicleToDto)
                .toList();
    }

    // Ajouter un tiers impliqué à un accident
    @PostMapping("/{id}/other-vehicles")
    public OtherVehicleDto addOtherVehicle(Authentication auth,
                                           @PathVariable Long id,
                                           @RequestBody AddOtherVehicleRequest req) {
        Claim claim = getClaimForCurrentClientOrThrow(auth, id);

        if (req.matricule() == null || req.matricule().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Matricule obligatoire");
        }

        if (req.ownerName() == null || req.ownerName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom du propriétaire obligatoire");
        }

        // Chercher ou créer le tiers
        OtherVehicle otherVehicle = otherVehicleRepo.findByMatricule(req.matricule())
                .orElseGet(() -> OtherVehicle.builder()
                        .matricule(req.matricule())
                        .marque(req.brand())
                        .modele(req.model())
                        .ownerName(req.ownerName())
                        .ownerPhone(req.ownerPhone())
                        .ownerEmail(req.ownerEmail())
                        .insuranceNumber(req.insuranceNumber())
                        .build());

        // Ajouter à la relation many-to-many
        if (!claim.getOtherVehicles().contains(otherVehicle)) {
            claim.getOtherVehicles().add(otherVehicle);
            claimRepo.save(claim);
        }

        return otherVehicleToDto(otherVehicle);
    }

    // Retirer un tiers impliqué d'un accident
    @DeleteMapping("/{id}/other-vehicles/{vehicleId}")
    public void removeOtherVehicle(Authentication auth,
                                   @PathVariable Long id,
                                   @PathVariable Long vehicleId) {
        Claim claim = getClaimForCurrentClientOrThrow(auth, id);

        OtherVehicle otherVehicle = otherVehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tiers not found"));

        claim.getOtherVehicles().remove(otherVehicle);
        claimRepo.save(claim);
    }

    // ========== HELPERS ==========

    private Claim getClaimForCurrentClientOrThrow(Authentication auth, Long claimId) {
        Client client = currentUser.getClientOrThrow(auth);

        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found"));

        if (claim.getClient() == null || claim.getClient().getId() == null
                || !claim.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }
        return claim;
    }

    private ClaimDto toDto(Claim c) {
        return new ClaimDto(
                c.getId(),
                c.getClaimNumber(),
                c.getStatus(),
                c.getAccidentDate(),
                c.getLocation(),
                c.getDescription(),
                c.getVehicle() == null ? null : c.getVehicle().getMatricule()
        );
    }

    private OtherVehicleDto otherVehicleToDto(OtherVehicle ov) {
        return new OtherVehicleDto(
                ov.getId(),
                ov.getMatricule(),
                ov.getMarque(),
                ov.getModele(),
                ov.getOwnerName(),
                ov.getOwnerPhone(),
                ov.getOwnerEmail(),
                ov.getInsuranceNumber()
        );
    }

    private LocalDate parseDateOrThrow(String value) {
        try { return LocalDate.parse(value); }
        catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid accidentDate format (expected YYYY-MM-DD)"
            );
        }
    }

    private String safeFilename(String name) {
        if (name == null) return "file";
        return name.replaceAll("[\\r\\n\"]", "_");
    }
}
