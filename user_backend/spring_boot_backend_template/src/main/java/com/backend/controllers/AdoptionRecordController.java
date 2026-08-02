package com.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.AdoptionRecordResponseDto;
import com.backend.security.UserPrincipal;
import com.backend.services.AdoptionRecordService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/adoption-records")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdoptionRecordController {

    private final AdoptionRecordService adoptionRecordService;

    // GET /api/adoption-records/my
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AdoptionRecordResponseDto>>> getMyAdoptionRecords(
            @RequestParam(value = "userId", required = false) Long userIdParam,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long effectiveUserId = userIdParam;
        String email = null;

        if (userPrincipal != null) {
            if (effectiveUserId == null) {
                effectiveUserId = userPrincipal.getId();
            }
            email = userPrincipal.getUsername();
        }

        List<AdoptionRecordResponseDto> records = adoptionRecordService.getMyAdoptionRecords(effectiveUserId, email);
        return ResponseEntity.ok(ApiResponse.ok(records, "Adoption records retrieved successfully"));
    }
}
