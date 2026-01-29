package com.api_spring_boot.api_spring_boot.admin;

import com.api_spring_boot.api_spring_boot.admin.dto.AdminClaimDto;
import com.api_spring_boot.api_spring_boot.entities.*;
import com.api_spring_boot.api_spring_boot.repositories.ClaimDocumentRepository;
import com.api_spring_boot.api_spring_boot.repositories.ClaimRepository;
import com.api_spring_boot.api_spring_boot.repositories.ClaimStepRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/claims")
public class AdminClaimController {

	private final ClaimRepository claimRepo;
	private final ClaimStepRepository stepRepo;
	private final ClaimDocumentRepository docRepo;

	public AdminClaimController(ClaimRepository claimRepo,
								ClaimStepRepository stepRepo,
								ClaimDocumentRepository docRepo) {
		this.claimRepo = claimRepo;
		this.stepRepo = stepRepo;
		this.docRepo = docRepo;
	}

	@GetMapping("/{id}")
	public AdminClaimDto getOne(@PathVariable Long id) {
		Claim c = claimRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim introuvable"));
		return toDto(c);
	}

	@GetMapping("/{id}/steps")
	public List<com.api_spring_boot.api_spring_boot.claims.dto.ClaimStepDto> getSteps(@PathVariable Long id) {
		Claim claim = claimRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim introuvable"));
		return stepRepo.findByClaimOrderByCreatedAtAsc(claim).stream().map(s -> new com.api_spring_boot.api_spring_boot.claims.dto.ClaimStepDto(
			s.getId(),
			s.getStepName(),
			s.getStepStatus(),
			s.getComment(),
			s.getCreatedAt() == null ? null : s.getCreatedAt().toString()
		)).toList();
	}

	@PostMapping("/{id}/steps")
	public com.api_spring_boot.api_spring_boot.claims.dto.ClaimStepDto addStep(@PathVariable Long id, @RequestBody com.api_spring_boot.api_spring_boot.claims.dto.AddStepRequest req) {
		Claim claim = claimRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim introuvable"));

		ClaimStep step = ClaimStep.builder()
				.claim(claim)
				.stepName(req.stepName())
				.stepStatus(req.stepStatus())
				.comment(req.comment())
				.createdAt(java.time.LocalDateTime.now())
				.build();

		ClaimStep saved = stepRepo.save(step);

		return new com.api_spring_boot.api_spring_boot.claims.dto.ClaimStepDto(
			saved.getId(),
			saved.getStepName(),
			saved.getStepStatus(),
			saved.getComment(),
			saved.getCreatedAt() == null ? null : saved.getCreatedAt().toString()
		);
	}

	@GetMapping
	public List<AdminClaimDto> all() {
		return claimRepo.findAll().stream().map(this::toDto).toList();
	}

	@GetMapping("/by-status/{status}")
	public List<AdminClaimDto> byStatus(@PathVariable ClaimStatus status) {
		return claimRepo.findByStatusOrderByCreatedAtDesc(status).stream().map(this::toDto).toList();
	}

	@PatchMapping("/{id}/status")
	public AdminClaimDto updateStatus(@PathVariable Long id,
									  @RequestBody com.api_spring_boot.api_spring_boot.claims.dto.UpdateStatusRequest req,
									  @RequestParam(value = "comment", required = false) String comment) {
		Claim claim = claimRepo.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim introuvable"));

		claim.setStatus(req.status());
		Claim saved = claimRepo.save(claim);

		// trace étape
		stepRepo.save(ClaimStep.builder()
			.claim(saved)
			.stepName("Admin update")
			.stepStatus(StepStatus.DONE)
			.comment(comment == null ? ("Statut => " + req.status()) : comment)
			.createdAt(LocalDateTime.now())
			.build());

		return toDto(saved);
	}

	@PostMapping(value = "/{id}/treatment-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public void uploadTreatmentDoc(@PathVariable Long id,
								   @RequestParam("file") MultipartFile file) throws IOException {
		Claim claim = claimRepo.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim introuvable"));

		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier obligatoire");
		}

		ClaimDocument doc = ClaimDocument.builder()
				.claim(claim)
				.fileName(file.getOriginalFilename())
				.contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
				.data(file.getBytes())
				.uploadedAt(LocalDateTime.now())
				// si tu ajoutes type:
				// .type(ClaimDocumentType.ADMIN_TREATMENT)
				.build();

		docRepo.save(doc);
	}

	    @GetMapping("/{id}/documents")
	    public List<com.api_spring_boot.api_spring_boot.claims.dto.DocumentDto> listDocuments(@PathVariable Long id) {
		Claim claim = claimRepo.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim introuvable"));

		return docRepo.findByClaimOrderByUploadedAtDesc(claim)
			.stream()
			.map(d -> new com.api_spring_boot.api_spring_boot.claims.dto.DocumentDto(
				d.getId(),
				d.getFileName(),
				d.getContentType(),
				d.getUploadedAt() == null ? null : d.getUploadedAt().toString()
			))
			.toList();
	    }

	    @GetMapping("/{id}/documents/{docId}")
	    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id, @PathVariable Long docId) {
		Claim claim = claimRepo.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim introuvable"));

		ClaimDocument doc = docRepo.findById(docId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document introuvable"));

		if (doc.getClaim() == null || !doc.getClaim().getId().equals(claim.getId())) {
		    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mauvais document");
		}

		MediaType mediaType;
		try { mediaType = MediaType.parseMediaType(doc.getContentType()); }
		catch (Exception e) { mediaType = MediaType.APPLICATION_OCTET_STREAM; }

		return ResponseEntity.ok()
			.contentType(mediaType)
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFilename(doc.getFileName()) + "\"")
			.body(doc.getData());
	    }

	private AdminClaimDto toDto(Claim c) {
		return new AdminClaimDto(
				c.getId(),
				c.getClaimNumber(),
				c.getStatus(),
				c.getAccidentDate(),
				c.getLocation(),
				c.getDescription(),
				c.getVehicle() == null ? null : c.getVehicle().getMatricule(),
				c.getClient() == null ? null : c.getClient().getEmail()
		);
	}

	private String safeFilename(String name) {
		if (name == null) return "file";
		return name.replaceAll("[\\r\\n\"]", "_");
	}
}
