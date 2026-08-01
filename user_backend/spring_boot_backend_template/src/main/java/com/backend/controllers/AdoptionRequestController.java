package com.backend.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.AdoptionRequestDetailsResponseDto;
import com.backend.dto.AdoptionRequestDto;
import com.backend.dto.AdoptionResponseDto;
import com.backend.dto.ApplicationStatusTrackingResponseDto;
import com.backend.security.UserPrincipal;
import com.backend.services.AdoptionRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/adoption-requests")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdoptionRequestController {

    private final AdoptionRequestService adoptionRequestService;

    // POST /api/adoption-requests
    @PostMapping
    public ResponseEntity<ApiResponse<AdoptionResponseDto>> submitAdoptionRequest(
            @Valid @RequestBody AdoptionRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long effectiveUserId = requestDto.getUserId();
        String email = null;
        if (userPrincipal != null) {
            if (effectiveUserId == null) effectiveUserId = userPrincipal.getId();
            email = userPrincipal.getUsername();
        }

        AdoptionResponseDto response = adoptionRequestService.submitAdoptionRequest(requestDto, effectiveUserId, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Adoption request submitted successfully"));
    }

    // GET /api/adoption-requests/my
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AdoptionResponseDto>>> getMyRequests(
            @RequestParam(value = "userId", required = false) Long userIdParam,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long effectiveUserId = userIdParam;
        String email = null;
        if (userPrincipal != null) {
            if (effectiveUserId == null) effectiveUserId = userPrincipal.getId();
            email = userPrincipal.getUsername();
        }

        List<AdoptionResponseDto> requests = adoptionRequestService.getMyRequests(effectiveUserId, email);
        return ResponseEntity.ok(ApiResponse.ok(requests, "Adoption requests retrieved successfully"));
    }

    // GET /api/adoption-requests/status/{id}
    @GetMapping("/status/{id}")
    public ResponseEntity<ApiResponse<ApplicationStatusTrackingResponseDto>> getApplicationStatusTracking(
            @PathVariable("id") String id) {

        ApplicationStatusTrackingResponseDto tracking = adoptionRequestService.getApplicationStatusTracking(id);
        return ResponseEntity.ok(ApiResponse.ok(tracking, "Application status tracking retrieved successfully"));
    }

    // GET /api/adoption-requests/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AdoptionResponseDto>>> getRequestsByUser(
            @PathVariable Long userId) {

        List<AdoptionResponseDto> requests = adoptionRequestService.getRequestsByUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(requests, "Adoption requests retrieved successfully"));
    }

    // GET /api/adoption-requests/{requestId}
    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<AdoptionRequestDetailsResponseDto>> getRequestDetails(
            @PathVariable Long requestId) {

        AdoptionRequestDetailsResponseDto response = adoptionRequestService.getRequestDetails(requestId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Adoption request details retrieved successfully"));
    }

    // DELETE /api/adoption-requests/{requestId}
    @DeleteMapping("/{requestId}")
    public ResponseEntity<ApiResponse<String>> withdrawRequest(
            @PathVariable Long requestId) {

        adoptionRequestService.withdrawRequest(requestId);
        return ResponseEntity.ok(ApiResponse.ok("Adoption request withdrawn successfully.", "Adoption request withdrawn successfully."));
    }
}