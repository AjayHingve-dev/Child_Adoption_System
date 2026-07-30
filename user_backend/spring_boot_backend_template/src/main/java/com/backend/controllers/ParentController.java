package com.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.AuthResponse;
import com.backend.dto.ParentProfileResponse;
import com.backend.dto.ParentProfileUpdateRequest;
import com.backend.dto.ParentRegisterRequest;
import com.backend.security.UserPrincipal;
import com.backend.services.ParentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/parents")
@CrossOrigin(origins = "*")
public class ParentController {

    @Autowired
    private ParentService parentService;

    // Registration API: POST /api/parents/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerParent(
            @Valid @RequestBody ParentRegisterRequest request) {

        AuthResponse authResponse = parentService.registerParent(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(authResponse, "Parent registered successfully"));
    }

    // View Profile API: GET /api/parents/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ParentProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        ParentProfileResponse profile = parentService.getParentProfile(userPrincipal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(profile, "Parent profile retrieved successfully"));
    }

    // Update Profile API: PUT /api/parents/profile
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<ParentProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ParentProfileUpdateRequest request) {

        ParentProfileResponse updated = parentService.updateParentProfile(userPrincipal.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Parent profile updated successfully"));
    }
}
