package com.backend.services;

import java.util.List;

import com.backend.dto.AdoptionRequestDetailsResponseDto;
import com.backend.dto.AdoptionRequestDto;
import com.backend.dto.AdoptionResponseDto;
import com.backend.dto.ApplicationStatusTrackingResponseDto;

public interface AdoptionRequestService {
    AdoptionResponseDto submitAdoptionRequest(AdoptionRequestDto requestDto);
    
    AdoptionResponseDto submitAdoptionRequest(AdoptionRequestDto requestDto, Long userId, String email);
    
    List<AdoptionResponseDto> getRequestsByUser(Long userId);

    List<AdoptionResponseDto> getMyRequests(Long userId, String email);
    
    AdoptionRequestDetailsResponseDto getRequestDetails(Long requestId);
    
    ApplicationStatusTrackingResponseDto getApplicationStatusTracking(String idOrAppNumber);
    
    void withdrawRequest(Long requestId);
}
