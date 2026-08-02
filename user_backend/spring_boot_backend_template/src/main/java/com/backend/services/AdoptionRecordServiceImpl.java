package com.backend.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.AdoptionRecordResponseDto;
import com.backend.entity.AdoptionRecord;
import com.backend.entity.AdoptionRequest;
import com.backend.entity.Child;
import com.backend.entity.RequestStatus;
import com.backend.entity.User;
import com.backend.repository.AdoptionRecordRepository;
import com.backend.repository.AdoptionRequestRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AdoptionRecordServiceImpl implements AdoptionRecordService {

    private final AdoptionRecordRepository adoptionRecordRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdoptionRecordResponseDto> getMyAdoptionRecords(Long userId, String email) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && email != null && !email.trim().isEmpty()) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        List<AdoptionRecord> records = new ArrayList<>();
        if (user != null) {
            records = adoptionRecordRepository.findByUser_UserId(user.getUserId());
        } else if (email != null && !email.trim().isEmpty()) {
            records = adoptionRecordRepository.findByUser_Email(email);
        }

        if (records != null && !records.isEmpty()) {
            return records.stream().map(this::mapToDto).collect(Collectors.toList());
        }

        // Fallback: Check approved adoption requests if direct records table entry is pending
        if (user != null) {
            List<AdoptionRequest> requests = adoptionRequestRepository.findByUserUserId(user.getUserId());
            if (requests != null) {
                List<AdoptionRecordResponseDto> approvedFromRequests = requests.stream()
                        .filter(req -> req.getStatus() == RequestStatus.APPROVED)
                        .map(this::mapApprovedRequestToDto)
                        .collect(Collectors.toList());
                if (!approvedFromRequests.isEmpty()) {
                    return approvedFromRequests;
                }
            }
        }

        return new ArrayList<>();
    }

    private AdoptionRecordResponseDto mapToDto(AdoptionRecord record) {
        Child child = record.getChild();
        AdoptionRequest request = record.getRequest();

        String firstName = child != null ? child.getFirstName() : "";
        String lastName = child != null ? child.getLastName() : "";
        String fullName = (firstName + " " + (lastName != null ? lastName : "")).trim();

        return AdoptionRecordResponseDto.builder()
                .adoptionId(record.getAdoptionId())
                .requestId(request != null ? request.getRequestId() : null)
                .applicationNumber(request != null ? request.getApplicationNumber() : null)
                .childId(child != null ? child.getChildId() : null)
                .childFirstName(firstName)
                .childLastName(lastName)
                .childFullName(fullName)
                .childGender(child != null && child.getGender() != null ? child.getGender().name() : null)
                .childDob(child != null ? child.getDob() : null)
                .childProfilePhoto(child != null ? child.getProfilePhoto() : null)
                .adoptionDate(record.getAdoptionDate())
                .certificateNumber(record.getCertificateNumber())
                .status("APPROVED")
                .build();
    }

    private AdoptionRecordResponseDto mapApprovedRequestToDto(AdoptionRequest request) {
        Child child = request.getChild();

        String firstName = child != null ? child.getFirstName() : "";
        String lastName = child != null ? child.getLastName() : "";
        String fullName = (firstName + " " + (lastName != null ? lastName : "")).trim();

        return AdoptionRecordResponseDto.builder()
                .adoptionId(request.getRequestId())
                .requestId(request.getRequestId())
                .applicationNumber(request.getApplicationNumber())
                .childId(child != null ? child.getChildId() : null)
                .childFirstName(firstName)
                .childLastName(lastName)
                .childFullName(fullName)
                .childGender(child != null && child.getGender() != null ? child.getGender().name() : null)
                .childDob(child != null ? child.getDob() : null)
                .childProfilePhoto(child != null ? child.getProfilePhoto() : null)
                .adoptionDate(request.getStatusUpdatedAt() != null ? request.getStatusUpdatedAt().toLocalDate() : (request.getRequestDate() != null ? request.getRequestDate().toLocalDate() : null))
                .certificateNumber("CERT-" + request.getApplicationNumber())
                .status("APPROVED")
                .build();
    }
}
