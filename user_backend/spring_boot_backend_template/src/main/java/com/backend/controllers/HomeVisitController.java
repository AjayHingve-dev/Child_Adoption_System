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
import com.backend.dto.ParentHomeVisitDto;
import com.backend.security.UserPrincipal;
import com.backend.services.HomeVisitService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/home-visits")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HomeVisitController {

    private final HomeVisitService homeVisitService;

    // GET /api/home-visits/my
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ParentHomeVisitDto>>> getMyHomeVisits(
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

        List<ParentHomeVisitDto> visits = homeVisitService.getMyHomeVisits(effectiveUserId, email);
        return ResponseEntity.ok(ApiResponse.ok(visits, "Parent home visits retrieved successfully"));
    }
}
