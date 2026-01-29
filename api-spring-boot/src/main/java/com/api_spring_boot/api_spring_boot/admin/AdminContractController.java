package com.api_spring_boot.api_spring_boot.admin;

import com.api_spring_boot.api_spring_boot.admin.dto.AdminContractDto;
import com.api_spring_boot.api_spring_boot.entities.ContratAssurance;
import com.api_spring_boot.api_spring_boot.repositories.ContratAssuranceRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contracts")
public class AdminContractController {

	private final ContratAssuranceRepository contratRepo;

	public AdminContractController(ContratAssuranceRepository contratRepo) {
		this.contratRepo = contratRepo;
	}

	@GetMapping("/pending")
	public List<AdminContractDto> pending() {
		return contratRepo.findByValideFalseOrValideIsNullOrderByDateDesc()
				.stream().map(this::toDto).toList();
	}

	@GetMapping
	public List<AdminContractDto> all() {
		return contratRepo.findAll().stream().map(this::toDto).toList();
	}

	@GetMapping("/{num}/pdf")
	public ResponseEntity<byte[]> downloadPdf(@PathVariable String num) {
		ContratAssurance c = contratRepo.findById(num)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrat introuvable"));

		if (c.getPdfData() == null || c.getPdfData().length == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun PDF");
		}

		MediaType mt;
		try { mt = MediaType.parseMediaType(c.getPdfContentType()); }
		catch (Exception e) { mt = MediaType.APPLICATION_PDF; }

		return ResponseEntity.ok()
				.contentType(mt)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						"inline; filename=\"" + safe(c.getPdfFileName()) + "\"")
				.body(c.getPdfData());
	}

	@PatchMapping("/{num}/validate")
	public AdminContractDto validate(@PathVariable String num) {
		ContratAssurance c = contratRepo.findById(num)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrat introuvable"));
		c.setValide(true);
		return toDto(contratRepo.save(c));
	}

	@PatchMapping("/{num}/reject")
	public AdminContractDto reject(@PathVariable String num) {
		ContratAssurance c = contratRepo.findById(num)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrat introuvable"));
		c.setValide(false);
		return toDto(contratRepo.save(c));
	}

	private AdminContractDto toDto(ContratAssurance c) {
		return new AdminContractDto(
				c.getNumContrat(),
				c.getType(),
				c.getDate(),
				c.getValide(),
				c.getClient() == null ? null : c.getClient().getEmail(),
				c.getVehicule() == null ? null : c.getVehicule().getMatricule(),
				c.getPdfFileName(),
				c.getPdfContentType()
		);
	}

	private String safe(String s) {
		if (s == null) return "contract.pdf";
		return s.replaceAll("[\\r\\n\"]", "_");
	}
}
