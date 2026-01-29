// package com.api_spring_boot.api_spring_boot.claims;

// import com.api_spring_boot.api_spring_boot.claims.dto.*;
// import com.api_spring_boot.api_spring_boot.entities.*;
// import com.api_spring_boot.api_spring_boot.repositories.*;
// import jakarta.validation.Valid;
// import org.springframework.web.bind.annotation.*;

// import java.time.LocalDateTime;
// import java.util.List;

// @RestController
// @RequestMapping("/api/admin/claims")
// @CrossOrigin("*")
// public class AdminClaimController {

//     private final ClaimRepository claimRepo;
//     private final ClaimStepRepository stepRepo;

//     public AdminClaimController(ClaimRepository claimRepo, ClaimStepRepository stepRepo) {
//         this.claimRepo = claimRepo;
//         this.stepRepo = stepRepo;
//     }

//     @GetMapping
//     public List<ClaimDto> listAll() {
//         return claimRepo.findAll().stream().map(this::toDto).toList();
//     }

//     @GetMapping("/{id}")
//     public ClaimDto getOne(@PathVariable Long id) {
//         return toDto(claimRepo.findById(id).orElseThrow());
//     }

//     @PatchMapping("/{id}/status")
//     public ClaimDto updateStatus(@PathVariable Long id, @RequestBody @Valid UpdateStatusRequest req) {
//         Claim claim = claimRepo.findById(id).orElseThrow();
//         claim.setStatus(req.status());
//         Claim saved = claimRepo.save(claim);
//         return toDto(saved);
//     }

//     @GetMapping("/{id}/steps")
//     public List<ClaimStepDto> steps(@PathVariable Long id) {
//         Claim claim = claimRepo.findById(id).orElseThrow();
//         return stepRepo.findByClaimOrderByCreatedAtAsc(claim)
//                 .stream()
//                 .map(s -> new ClaimStepDto(s.getId(), s.getStepName(), s.getStepStatus(), s.getComment(), s.getCreatedAt().toString()))
//                 .toList();
//     }

//     @PostMapping("/{id}/steps")
//     public ClaimStepDto addStep(@PathVariable Long id, @RequestBody @Valid AddStepRequest req) {
//         Claim claim = claimRepo.findById(id).orElseThrow();

//         ClaimStep step = ClaimStep.builder()
//                 .claim(claim)
//                 .stepName(req.stepName())
//                 .stepStatus(req.stepStatus())
//                 .comment(req.comment())
//                 .createdAt(LocalDateTime.now())
//                 .build();

//         ClaimStep saved = stepRepo.save(step);

//         return new ClaimStepDto(saved.getId(), saved.getStepName(), saved.getStepStatus(), saved.getComment(), saved.getCreatedAt().toString());
//     }

//     private ClaimDto toDto(Claim c) {
//         return new ClaimDto(
//                 c.getId(),
//                 c.getClaimNumber(),
//                 c.getStatus(),
//                 c.getAccidentDate(),
//                 c.getLocation(),
//                 c.getDescription(),
//                 c.getVehicle().getMatricule()
//         );
//     }
// }
