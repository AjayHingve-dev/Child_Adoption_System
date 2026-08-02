package com.backend.services;

import com.backend.dto.ContactUsRequestDto;
import com.backend.dto.ContactUsResponseDto;

public interface ContactUsService {
    ContactUsResponseDto createContactUs(ContactUsRequestDto requestDto);
}
