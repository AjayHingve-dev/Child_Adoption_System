package com.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.AuthResponse;
import com.backend.dto.ParentRegisterRequest;
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
}
