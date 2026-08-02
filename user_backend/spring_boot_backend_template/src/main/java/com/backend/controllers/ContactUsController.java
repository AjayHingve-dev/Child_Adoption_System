package com.backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.ContactUsRequestDto;
import com.backend.dto.ContactUsResponseDto;
import com.backend.services.ContactUsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contact-us")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContactUsController {

    private final ContactUsService contactUsService;

    // POST /api/contact-us
    @PostMapping
    public ResponseEntity<ApiResponse<ContactUsResponseDto>> createContactUs(
            @Valid @RequestBody ContactUsRequestDto requestDto) {
        ContactUsResponseDto response = contactUsService.createContactUs(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Thank you for contacting us. Your message has been received."));
    }
}
