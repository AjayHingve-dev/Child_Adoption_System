package com.backend.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.AdoptionRequestDetailsResponseDto;
import com.backend.dto.AdoptionRequestDto;
import com.backend.dto.AdoptionResponseDto;
import com.backend.dto.ApplicationStatusTrackingResponseDto;
import com.backend.entity.AdoptionRequest;
import com.backend.entity.Child;
import com.backend.entity.ChildStatus;
import com.backend.entity.HomeVisit;
import com.backend.entity.RequestStatus;
import com.backend.entity.User;
import com.backend.entity.UserDocument;
import com.backend.repository.AdoptionRequestRepository;
import com.backend.repository.ChildRepository;
import com.backend.repository.HomeVisitRepository;
import com.backend.repository.UserDocumentRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionRequestServiceImpl implements AdoptionRequestService {

    private final AdoptionRequestRepository adoptionRequestRepository;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final HomeVisitRepository homeVisitRepository;

    private User resolveRegisteredUser(Long userId, String email) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && email != null && !email.trim().isEmpty()) {
            user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }
        if (user == null) {
            throw new IllegalArgumentException("Only registered parent users can submit adoption requests. Please log in or register your account.");
        }
        return user;
    }

    @Override
    public AdoptionResponseDto submitAdoptionRequest(AdoptionRequestDto dto) {
        return submitAdoptionRequest(dto, dto.getUserId(), null);
    }

    @Override
    public AdoptionResponseDto submitAdoptionRequest(AdoptionRequestDto dto, Long userId, String email) {
        Long targetUserId = dto != null && dto.getUserId() != null ? dto.getUserId() : userId;
        User user = resolveRegisteredUser(targetUserId, email);

        if (dto == null || dto.getChildId() == null) {
            throw new IllegalArgumentException("Child ID must be provided.");
        }

        Child child = childRepository.findById(dto.getChildId())
                .orElseThrow(() -> new IllegalArgumentException("Child not found with ID: " + dto.getChildId()));

        // Rule 1: Child status must be AVAILABLE
        if (child.getStatus() != ChildStatus.AVAILABLE) {
            throw new IllegalArgumentException("Child is not currently available for adoption.");
        }

        // Rule 2: Parent cannot apply twice for the same child
        boolean alreadyApplied = adoptionRequestRepository.existsByUserUserIdAndChildChildId(user.getUserId(), child.getChildId());
        if (alreadyApplied) {
            throw new IllegalArgumentException("You have already applied for this child.");
        }

        // Rule 3: Parent must upload required documents first
        List<UserDocument> userDocs = userDocumentRepository.findByUserUserId(user.getUserId());
        if (userDocs == null || userDocs.isEmpty()) {
            throw new IllegalArgumentException("You must upload required documents (Aadhaar, PAN, Income, Marriage, Medical certificates) before submitting an adoption request.");
        }

        // Create request with initial status PENDING
        AdoptionRequest request = AdoptionRequest.builder()
                .applicationNumber(generateApplicationNumber())
                .user(user)
                .child(child)
                .requestDate(LocalDateTime.now())
                .status(RequestStatus.PENDING)
                .statusUpdatedAt(LocalDateTime.now())
                .build();

        AdoptionRequest saved = adoptionRequestRepository.save(request);

        String childFullName = (child.getFirstName() + " " + (child.getLastName() != null ? child.getLastName() : "")).trim();
        String userFullName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();

        return AdoptionResponseDto.builder()
                .requestId(saved.getRequestId())
                .applicationNumber(saved.getApplicationNumber())
                .userId(user.getUserId())
                .userName(userFullName)
                .childId(child.getChildId())
                .childName(childFullName)
                .requestDate(saved.getRequestDate())
                .status(saved.getStatus())
                .message("Adoption request submitted successfully.")
                .build();
    }

    private String generateApplicationNumber() {
        return "APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdoptionResponseDto> getRequestsByUser(Long userId) {
        return getMyRequests(userId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdoptionResponseDto> getMyRequests(Long userId, String email) {
        User user = resolveRegisteredUser(userId, email);
        List<AdoptionRequest> requests = adoptionRequestRepository.findByUserUserIdOrderByRequestDateDesc(user.getUserId());
        return requests.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private AdoptionResponseDto mapToResponseDto(AdoptionRequest request) {
        String childFullName = request.getChild() != null ?
                (request.getChild().getFirstName() + " " + (request.getChild().getLastName() != null ? request.getChild().getLastName() : "")).trim() : "Unknown Child";
        String userFullName = request.getUser() != null ?
                (request.getUser().getFirstName() + " " + (request.getUser().getLastName() != null ? request.getUser().getLastName() : "")).trim() : "Unknown User";

        return AdoptionResponseDto.builder()
                .requestId(request.getRequestId())
                .applicationNumber(request.getApplicationNumber())
                .userId(request.getUser() != null ? request.getUser().getUserId() : null)
                .userName(userFullName)
                .childId(request.getChild() != null ? request.getChild().getChildId() : null)
                .childName(childFullName)
                .requestDate(request.getRequestDate())
                .status(request.getStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdoptionRequestDetailsResponseDto getRequestDetails(Long requestId) {
        AdoptionRequest request = adoptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption request not found with ID: " + requestId));

        AdoptionRequestDetailsResponseDto dto = new AdoptionRequestDetailsResponseDto();
        dto.setRequestId(request.getRequestId());
        dto.setApplicationNumber(request.getApplicationNumber());

        if (request.getChild() != null) {
            dto.setChildId(request.getChild().getChildId());
            String childName = (request.getChild().getFirstName() + " " + (request.getChild().getLastName() != null ? request.getChild().getLastName() : "")).trim();
            dto.setChildName(childName);
            if (request.getChild().getGender() != null) {
                dto.setChildGender(request.getChild().getGender().name());
            }
        }

        dto.setRequestDate(request.getRequestDate());
        dto.setStatus(request.getStatus());
        dto.setAdminRemark(request.getAdminRemark());

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationStatusTrackingResponseDto getApplicationStatusTracking(String idOrAppNumber) {
        if (idOrAppNumber == null || idOrAppNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Application ID or number must be provided");
        }

        AdoptionRequest request = null;
        try {
            Long requestId = Long.parseLong(idOrAppNumber.trim());
            request = adoptionRequestRepository.findById(requestId).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (request == null) {
            request = adoptionRequestRepository.findByApplicationNumber(idOrAppNumber.trim())
                    .orElseThrow(() -> new IllegalArgumentException("Adoption request not found with ID or application number: " + idOrAppNumber));
        }

        String childName = request.getChild() != null ?
                (request.getChild().getFirstName() + " " + (request.getChild().getLastName() != null ? request.getChild().getLastName() : "")).trim() : "N/A";
        String childGender = (request.getChild() != null && request.getChild().getGender() != null) ?
                request.getChild().getGender().name() : "N/A";

        // Query home visit info if available
        Optional<HomeVisit> homeVisitOpt = homeVisitRepository.findFirstByRequestRequestIdOrderByCreatedAtDesc(request.getRequestId());
        String socialWorkerName = null;
        String visitDate = null;
        String visitTime = null;
        String visitStatus = null;

        if (homeVisitOpt.isPresent()) {
            HomeVisit visit = homeVisitOpt.get();
            if (visit.getSocialWorker() != null) {
                socialWorkerName = (visit.getSocialWorker().getFirstName() + " " + (visit.getSocialWorker().getLastName() != null ? visit.getSocialWorker().getLastName() : "")).trim();
            }
            if (visit.getScheduledDate() != null) {
                visitDate = visit.getScheduledDate().toString();
            }
            if (visit.getScheduledTime() != null) {
                visitTime = visit.getScheduledTime().toString();
            }
            if (visit.getStatus() != null) {
                visitStatus = visit.getStatus().name();
            }
        }

        RequestStatus currentStatus = request.getStatus();
        List<ApplicationStatusTrackingResponseDto.TimelineStepDto> timeline = new ArrayList<>();

        // Step 1: PENDING
        boolean isPendingDone = true;
        boolean isPendingCurrent = (currentStatus == RequestStatus.PENDING);
        timeline.add(ApplicationStatusTrackingResponseDto.TimelineStepDto.builder()
                .stepKey("PENDING")
                .label("Application Submitted")
                .completed(isPendingDone)
                .current(isPendingCurrent)
                .updatedAt(request.getRequestDate())
                .description("Your application has been registered successfully.")
                .build());

        // Step 2: UNDER_REVIEW
        boolean isReviewDone = currentStatus != RequestStatus.PENDING;
        boolean isReviewCurrent = (currentStatus == RequestStatus.UNDER_REVIEW);
        timeline.add(ApplicationStatusTrackingResponseDto.TimelineStepDto.builder()
                .stepKey("UNDER_REVIEW")
                .label("Under Review")
                .completed(isReviewDone)
                .current(isReviewCurrent)
                .updatedAt(isReviewDone ? (request.getStatusUpdatedAt() != null ? request.getStatusUpdatedAt() : request.getRequestDate()) : null)
                .description("Initial document and background check review.")
                .build());

        // Step 3: HOME_VISIT
        boolean isHomeVisitDone = (currentStatus == RequestStatus.HOME_VISIT || currentStatus == RequestStatus.APPROVED || currentStatus == RequestStatus.COMPLETED);
        boolean isHomeVisitCurrent = (currentStatus == RequestStatus.HOME_VISIT);
        String visitDesc = visitDate != null ? "Home visit scheduled on " + visitDate + (visitTime != null ? " at " + visitTime : "") : "Social worker home visit assessment.";
        timeline.add(ApplicationStatusTrackingResponseDto.TimelineStepDto.builder()
                .stepKey("HOME_VISIT")
                .label("Home Visit")
                .completed(isHomeVisitDone)
                .current(isHomeVisitCurrent)
                .updatedAt(isHomeVisitDone ? (homeVisitOpt.map(HomeVisit::getCompletedAt).orElse(request.getStatusUpdatedAt())) : null)
                .description(visitDesc)
                .build());

        // Step 4: APPROVED / REJECTED
        boolean isDecisionDone = (currentStatus == RequestStatus.APPROVED || currentStatus == RequestStatus.REJECTED || currentStatus == RequestStatus.COMPLETED);
        boolean isDecisionCurrent = (currentStatus == RequestStatus.APPROVED || currentStatus == RequestStatus.REJECTED);
        String decisionLabel = currentStatus == RequestStatus.REJECTED ? "Rejected" : "Approved";
        String decisionDesc = request.getAdminRemark() != null ? request.getAdminRemark() : (currentStatus == RequestStatus.REJECTED ? "Application was rejected after review." : "Application approved by adoption committee.");
        timeline.add(ApplicationStatusTrackingResponseDto.TimelineStepDto.builder()
                .stepKey(currentStatus == RequestStatus.REJECTED ? "REJECTED" : "APPROVED")
                .label(decisionLabel)
                .completed(isDecisionDone)
                .current(isDecisionCurrent)
                .updatedAt(isDecisionDone ? request.getStatusUpdatedAt() : null)
                .description(decisionDesc)
                .build());

        // Step 5: COMPLETED
        boolean isCompletedDone = (currentStatus == RequestStatus.COMPLETED);
        timeline.add(ApplicationStatusTrackingResponseDto.TimelineStepDto.builder()
                .stepKey("COMPLETED")
                .label("Completed")
                .completed(isCompletedDone)
                .current(isCompletedDone)
                .updatedAt(isCompletedDone ? request.getStatusUpdatedAt() : null)
                .description("Final adoption placement and documentation completed.")
                .build());

        return ApplicationStatusTrackingResponseDto.builder()
                .requestId(request.getRequestId())
                .applicationNumber(request.getApplicationNumber())
                .childId(request.getChild() != null ? request.getChild().getChildId() : null)
                .childName(childName)
                .childGender(childGender)
                .status(request.getStatus())
                .requestDate(request.getRequestDate())
                .statusUpdatedAt(request.getStatusUpdatedAt())
                .adminRemark(request.getAdminRemark())
                .socialWorkerName(socialWorkerName)
                .visitDate(visitDate)
                .visitTime(visitTime)
                .visitStatus(visitStatus)
                .timeline(timeline)
                .build();
    }

    @Override
    public void withdrawRequest(Long requestId) {
        AdoptionRequest request = adoptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be withdrawn.");
        }

        adoptionRequestRepository.delete(request);
    }
}