package com.backend.services;

import java.util.List;

import com.backend.dto.AdoptionRequestDetailsResponseDto;
import com.backend.dto.AdoptionRequestDto;
import com.backend.dto.AdoptionResponseDto;

public interface AdoptionRequestService {
	 AdoptionResponseDto submitAdoptionRequest(AdoptionRequestDto requestDto);
	 
	 List<AdoptionResponseDto> getRequestsByUser(Long userId);
	 
	 AdoptionRequestDetailsResponseDto getRequestDetails(Long requestId);
	 
	 void withdrawRequest(Long requestId);
}
