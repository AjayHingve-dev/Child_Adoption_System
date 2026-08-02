package com.backend.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.AuthResponse;
import com.backend.dto.LoginRequest;
import com.backend.dto.ParentProfileResponse;
import com.backend.dto.ParentProfileUpdateRequest;
import com.backend.dto.ParentRegisterRequest;
import com.backend.entity.User;
import com.backend.entity.UserStatus;
import com.backend.exception.ConflictException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.UserRepository;
import com.backend.security.JwtUtils;

@Service
@Transactional
public class ParentServiceImpl implements ParentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.backend.repository.AdoptionRequestRepository adoptionRequestRepository;

    @Autowired
    private com.backend.repository.HomeVisitRepository homeVisitRepository;

    @Autowired
    private com.backend.repository.UserDocumentRepository userDocumentRepository;

    @Autowired
    private com.backend.repository.ChildRepository childRepository;

    @Override
    public AuthResponse registerParent(ParentRegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Parent user with this email address already exists.");
        }

        if (userRepository.existsByPhone(phone)) {
            throw new ConflictException("Parent user with this phone number already exists.");
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName() != null ? request.getLastName().trim() : null)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getUserId(), "PARENT");
        String fullName = (savedUser.getFirstName() + " " + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getUserId())
                .fullName(fullName)
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role("PARENT")
                .build();
    }

    @Override
    public AuthResponse loginParent(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        String token = jwtUtils.generateToken(authentication);
        String fullName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .fullName(fullName)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role("PARENT")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ParentProfileResponse getParentProfile(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found."));

        return mapToProfileResponse(user);
    }

    @Override
    public ParentProfileResponse updateParentProfile(String email, ParentProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found."));

        if (request.getPhone() != null && !request.getPhone().trim().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone().trim())) {
                throw new ConflictException("Phone number is already used by another user account.");
            }
            user.setPhone(request.getPhone().trim());
        }

        if (request.getAadhaarNumber() != null && !request.getAadhaarNumber().trim().isEmpty() &&
            !request.getAadhaarNumber().trim().equals(user.getAadhaarNumber())) {
            if (userRepository.existsByAadhaarNumber(request.getAadhaarNumber().trim())) {
                throw new ConflictException("Aadhaar number is already registered.");
            }
            user.setAadhaarNumber(request.getAadhaarNumber().trim());
        }

        user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) user.setLastName(request.getLastName().trim());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getDob() != null) user.setDob(request.getDob());
        if (request.getMaritalStatus() != null) user.setMaritalStatus(request.getMaritalStatus());
        if (request.getOccupation() != null) user.setOccupation(request.getOccupation().trim());
        if (request.getAnnualIncome() != null) user.setAnnualIncome(request.getAnnualIncome());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        if (request.getCity() != null) user.setCity(request.getCity().trim());
        if (request.getState() != null) user.setState(request.getState().trim());
        if (request.getPincode() != null) user.setPincode(request.getPincode().trim());
        if (request.getProfilePhoto() != null) user.setProfilePhoto(request.getProfilePhoto().trim());

        User updatedUser = userRepository.save(user);
        return mapToProfileResponse(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public com.backend.dto.ParentDashboardResponseDto getParentDashboard(Long userId, String email) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && email != null && !email.trim().isEmpty()) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        if (user == null) {
            throw new ResourceNotFoundException("Parent user not found.");
        }

        Long uid = user.getUserId();

        // 1. Applications & Current Status (Indexed query)
        java.util.List<com.backend.entity.AdoptionRequest> requests = adoptionRequestRepository.findByUserUserIdOrderByRequestDateDesc(uid);
        long applicationCount = requests != null ? requests.size() : 0;
        com.backend.entity.AdoptionRequest latestRequest = (requests != null && !requests.isEmpty()) ? requests.get(0) : null;

        String currentStatus = latestRequest != null && latestRequest.getStatus() != null 
                ? latestRequest.getStatus().name() 
                : (user.getStatus() != null ? user.getStatus().name() : "REGISTERED");

        String latestAppNum = latestRequest != null ? latestRequest.getApplicationNumber() : null;
        String latestChildName = latestRequest != null && latestRequest.getChild() != null 
                ? (latestRequest.getChild().getFirstName() + " " + (latestRequest.getChild().getLastName() != null ? latestRequest.getChild().getLastName() : "")).trim()
                : null;

        // 2. Upcoming / Latest Home Visit (Indexed query)
        java.util.List<com.backend.entity.HomeVisit> visits = homeVisitRepository.findByRequestUserUserIdOrderByScheduledDateDescScheduledTimeDesc(uid);
        com.backend.entity.HomeVisit latestVisit = (visits != null && !visits.isEmpty()) ? visits.get(0) : null;
        com.backend.dto.ParentHomeVisitDto upcomingVisitDto = null;
        String assignedWorker = null;

        if (latestVisit != null) {
            String swName = latestVisit.getSocialWorker() != null 
                    ? (latestVisit.getSocialWorker().getFirstName() + " " + (latestVisit.getSocialWorker().getLastName() != null ? latestVisit.getSocialWorker().getLastName() : "")).trim()
                    : "Assigned Social Worker";
            assignedWorker = swName;

            upcomingVisitDto = com.backend.dto.ParentHomeVisitDto.builder()
                    .homeVisitId(latestVisit.getHomeVisitId())
                    .visitCode("HV-" + latestVisit.getHomeVisitId())
                    .visitDate(latestVisit.getScheduledDate())
                    .visitTime(latestVisit.getScheduledTime())
                    .assignedSocialWorker(swName)
                    .socialWorker(swName)
                    .status(latestVisit.getStatus())
                    .remarks(latestVisit.getRemarks())
                    .applicationNumber(latestVisit.getRequest() != null ? latestVisit.getRequest().getApplicationNumber() : null)
                    .childName(latestVisit.getRequest() != null && latestVisit.getRequest().getChild() != null ? (latestVisit.getRequest().getChild().getFirstName() + " " + (latestVisit.getRequest().getChild().getLastName() != null ? latestVisit.getRequest().getChild().getLastName() : "")).trim() : null)
                    .build();
        }

        // 3. Document Verification Status Summary
        java.util.List<com.backend.entity.UserDocument> documents = userDocumentRepository.findByUserUserId(uid);
        int totalDocs = documents != null ? documents.size() : 0;
        int verifiedDocs = 0;
        int pendingDocs = 0;
        int rejectedDocs = 0;

        if (documents != null) {
            for (com.backend.entity.UserDocument doc : documents) {
                if (doc.getVerificationStatus() == com.backend.entity.VerificationStatus.VERIFIED) verifiedDocs++;
                else if (doc.getVerificationStatus() == com.backend.entity.VerificationStatus.REJECTED) rejectedDocs++;
                else pendingDocs++;
            }
        }

        com.backend.dto.ParentDashboardResponseDto.DocumentStatusSummaryDto docSummary = com.backend.dto.ParentDashboardResponseDto.DocumentStatusSummaryDto.builder()
                .totalUploaded(totalDocs)
                .verifiedCount(verifiedDocs)
                .pendingCount(pendingDocs)
                .rejectedCount(rejectedDocs)
                .summaryText(totalDocs > 0 ? verifiedDocs + " of " + totalDocs + " documents verified" : "No documents uploaded yet")
                .build();

        // 4. Notifications
        java.util.List<com.backend.dto.ParentDashboardResponseDto.DashboardNotificationDto> notifications = new java.util.ArrayList<>();
        if (latestRequest != null) {
            notifications.add(com.backend.dto.ParentDashboardResponseDto.DashboardNotificationDto.builder()
                    .id("NOTIF-1")
                    .title("Application Status: " + latestRequest.getStatus())
                    .message("Application #" + latestRequest.getApplicationNumber() + " is currently " + latestRequest.getStatus())
                    .type("INFO")
                    .status("UNREAD")
                    .timestamp(latestRequest.getStatusUpdatedAt() != null ? latestRequest.getStatusUpdatedAt() : latestRequest.getRequestDate())
                    .build());
        }
        if (latestVisit != null) {
            notifications.add(com.backend.dto.ParentDashboardResponseDto.DashboardNotificationDto.builder()
                    .id("NOTIF-2")
                    .title("Home Visit: " + latestVisit.getStatus())
                    .message("Home visit scheduled on " + latestVisit.getScheduledDate() + (latestVisit.getScheduledTime() != null ? " at " + latestVisit.getScheduledTime() : ""))
                    .type("SUCCESS")
                    .status("UNREAD")
                    .timestamp(latestVisit.getCreatedAt() != null ? latestVisit.getCreatedAt() : java.time.LocalDateTime.now())
                    .build());
        }
        if (notifications.isEmpty()) {
            notifications.add(com.backend.dto.ParentDashboardResponseDto.DashboardNotificationDto.builder()
                    .id("NOTIF-WELCOME")
                    .title("Welcome to Aashray")
                    .message("Complete your profile and upload documents to begin the adoption process.")
                    .type("INFO")
                    .status("READ")
                    .timestamp(java.time.LocalDateTime.now())
                    .build());
        }

        // 5. Recommended Available Children (Top 4 available)
        java.util.List<com.backend.entity.Child> availableChildren = childRepository.findByStatus(com.backend.entity.ChildStatus.AVAILABLE);
        java.util.List<com.backend.dto.ParentDashboardResponseDto.ChildSummaryDto> recommendedChildren = new java.util.ArrayList<>();
        if (availableChildren != null) {
            recommendedChildren = availableChildren.stream()
                    .limit(4)
                    .map(c -> com.backend.dto.ParentDashboardResponseDto.ChildSummaryDto.builder()
                            .childId(c.getChildId())
                            .firstName(c.getFirstName())
                            .lastName(c.getLastName())
                            .fullName((c.getFirstName() + " " + (c.getLastName() != null ? c.getLastName() : "")).trim())
                            .gender(c.getGender() != null ? c.getGender().name() : null)
                            .dob(c.getDob())
                            .profilePhoto(c.getProfilePhoto())
                            .description(c.getDescription())
                            .build())
                    .collect(java.util.stream.Collectors.toList());
        }

        // 6. Profile Completion Percentage
        int profileScore = 40;
        if (user.getPhone() != null && !user.getPhone().isEmpty()) profileScore += 10;
        if (user.getAadhaarNumber() != null && !user.getAadhaarNumber().isEmpty()) profileScore += 15;
        if (user.getOccupation() != null && !user.getOccupation().isEmpty()) profileScore += 10;
        if (user.getAddress() != null && !user.getAddress().isEmpty()) profileScore += 15;
        if (totalDocs > 0) profileScore += 10;

        String fullName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();

        return com.backend.dto.ParentDashboardResponseDto.builder()
                .parentName(fullName)
                .parentEmail(user.getEmail())
                .applicationCount(applicationCount)
                .currentStatus(currentStatus)
                .profileCompletionPercentage(Math.min(profileScore, 100))
                .latestApplicationNumber(latestAppNum)
                .latestChildName(latestChildName)
                .assignedSocialWorker(assignedWorker)
                .upcomingHomeVisit(upcomingVisitDto)
                .documentStatus(docSummary)
                .recentNotifications(notifications)
                .recommendedChildren(recommendedChildren)
                .build();
    }

    private static ParentProfileResponse mapToProfileResponse(User user) {
        return ParentProfileResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dob(user.getDob())
                .aadhaarNumber(user.getAadhaarNumber())
                .maritalStatus(user.getMaritalStatus())
                .occupation(user.getOccupation())
                .annualIncome(user.getAnnualIncome())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .profilePhoto(user.getProfilePhoto())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
