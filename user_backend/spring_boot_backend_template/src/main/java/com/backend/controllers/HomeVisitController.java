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
import com.backend.dto.SocialWorkerHomeVisitDto;
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
    public ResponseEntity<ApiResponse<?>> getMyHomeVisits(
            @RequestParam(value = "userId", required = false) Long userIdParam,
            @RequestParam(value = "socialWorkerId", required = false) Long socialWorkerIdParam,
            @RequestParam(value = "role", required = false) String roleParam,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        boolean isSocialWorker = false;
        Long socialWorkerId = socialWorkerIdParam;
        Long parentUserId = userIdParam;
        String email = null;

        if (userPrincipal != null) {
            email = userPrincipal.getUsername();
            boolean hasWorkerRole = userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_SOCIAL_WORKER") 
                                || a.getAuthority().equalsIgnoreCase("SOCIAL_WORKER"));
            if (hasWorkerRole) {
                isSocialWorker = true;
                if (socialWorkerId == null) {
                    socialWorkerId = userPrincipal.getId();
                }
            } else if (parentUserId == null) {
                parentUserId = userPrincipal.getId();
            }
        }

        if ("SOCIAL_WORKER".equalsIgnoreCase(roleParam) || socialWorkerIdParam != null) {
            isSocialWorker = true;
        }

        if (isSocialWorker) {
            List<SocialWorkerHomeVisitDto> visits = homeVisitService.getSocialWorkerHomeVisits(socialWorkerId, email);
            return ResponseEntity.ok(ApiResponse.ok(visits, "Social worker home visits retrieved successfully"));
        } else {
            List<ParentHomeVisitDto> visits = homeVisitService.getMyHomeVisits(parentUserId, email);
            return ResponseEntity.ok(ApiResponse.ok(visits, "Parent home visits retrieved successfully"));
        }
    }
}
