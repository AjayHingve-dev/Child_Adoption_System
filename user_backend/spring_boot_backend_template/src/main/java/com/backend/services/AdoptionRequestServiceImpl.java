package com.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.dto.AdoptionRequestDetailsResponseDto;
import com.backend.dto.AdoptionRequestDto;
import com.backend.dto.AdoptionResponseDto;
import com.backend.entity.AdoptionRequest;
import com.backend.entity.Child;
import com.backend.entity.ChildStatus;
import com.backend.entity.RequestStatus;
import com.backend.entity.User;
import com.backend.repository.AdoptionRequestRepository;
import com.backend.repository.ChildRepository;
import com.backend.repository.UserRepository;
import com.backend.services.AdoptionRequestService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdoptionRequestServiceImpl implements AdoptionRequestService {

    private final AdoptionRequestRepository adoptionRequestRepository;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;

    @Override
    public AdoptionResponseDto submitAdoptionRequest(AdoptionRequestDto dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Child child = childRepository.findById(dto.getChildId())
                .orElseThrow(() -> new RuntimeException("Child not found"));

        if (child.getStatus() != ChildStatus.AVAILABLE) {
            throw new RuntimeException("Child is not available for adoption.");
        }

        boolean exists = adoptionRequestRepository
                .existsByUserUserIdAndChildChildIdAndStatus(
                        dto.getUserId(),
                        dto.getChildId(),
                        RequestStatus.PENDING);

        if (exists) {
            throw new RuntimeException("You have already submitted a request for this child.");
        }

        AdoptionRequest request = AdoptionRequest.builder()
                .applicationNumber(generateApplicationNumber())
                .user(user)
                .child(child)
                .requestDate(LocalDateTime.now())
                .status(RequestStatus.PENDING)
                .statusUpdatedAt(LocalDateTime.now())
                .build();

        AdoptionRequest saved = adoptionRequestRepository.save(request);

        return AdoptionResponseDto.builder()
                .requestId(saved.getRequestId())
                .applicationNumber(saved.getApplicationNumber())
                .userId(user.getUserId())
                .userName(user.getFirstName() + " " + user.getLastName())
                .childId(child.getChildId())
                .childName(child.getFirstName())
                .requestDate(saved.getRequestDate())
                .status(saved.getStatus())
                .message("Adoption request submitted successfully.")
                .build();
    }

    private String generateApplicationNumber() {
        return "APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    @Override
    public List<AdoptionResponseDto> getRequestsByUser(Long userId) {

        List<AdoptionRequest> requests =
                adoptionRequestRepository.findByUserUserId(userId);

        return requests.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private AdoptionResponseDto mapToResponseDto(AdoptionRequest request) {

        return AdoptionResponseDto.builder()
                .requestId(request.getRequestId())
                .applicationNumber(request.getApplicationNumber())
                .userId(request.getUser().getUserId())
                .userName(request.getUser().getFirstName() + " " + request.getUser().getLastName())
                .childId(request.getChild().getChildId())
                .childName(request.getChild().getFirstName()) // Change to getName() if applicable
                .requestDate(request.getRequestDate())
                .status(request.getStatus())
                .build();
    }
    
    @Override
    public AdoptionRequestDetailsResponseDto getRequestDetails(Long requestId) {

        AdoptionRequest request = adoptionRequestRepository.findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException("Adoption request not found"));

        AdoptionRequestDetailsResponseDto dto =
                new AdoptionRequestDetailsResponseDto();


        dto.setRequestId(request.getRequestId());
        dto.setApplicationNumber(request.getApplicationNumber());

        dto.setChildId(request.getChild().getChildId());
        dto.setChildName(request.getChild().getFirstName());

        dto.setChildGender(request.getChild().getGender().name());

        dto.setRequestDate(request.getRequestDate());

        dto.setStatus(request.getStatus());

        dto.setAdminRemark(request.getAdminRemark());

        return dto;
    }
    
    @Override
    public void withdrawRequest(Long requestId) {

        AdoptionRequest request = adoptionRequestRepository.findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException("Adoption request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException(
                    "Only pending requests can be withdrawn.");
        }

        adoptionRequestRepository.delete(request);
    }
}