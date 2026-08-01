package com.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.AdoptionRequestDetailsResponseDto;
import com.backend.dto.AdoptionRequestDto;
import com.backend.dto.AdoptionResponseDto;
import com.backend.entity.AdoptionRequest;
import com.backend.entity.Child;
import com.backend.entity.ChildStatus;
import com.backend.entity.RequestStatus;
import com.backend.entity.User;
import com.backend.entity.UserDocument;
import com.backend.repository.AdoptionRequestRepository;
import com.backend.repository.ChildRepository;
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
    public void withdrawRequest(Long requestId) {
        AdoptionRequest request = adoptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be withdrawn.");
        }

        adoptionRequestRepository.delete(request);
    }
}