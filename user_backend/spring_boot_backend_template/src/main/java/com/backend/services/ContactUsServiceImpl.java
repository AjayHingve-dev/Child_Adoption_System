package com.backend.services;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.ContactUsRequestDto;
import com.backend.dto.ContactUsResponseDto;
import com.backend.entity.ContactUs;
import com.backend.repository.ContactUsRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ContactUsServiceImpl implements ContactUsService {

    private final ContactUsRepository contactUsRepository;

    @Override
    public ContactUsResponseDto createContactUs(ContactUsRequestDto requestDto) {
        ContactUs entity = ContactUs.builder()
                .name(requestDto.getName().trim())
                .email(requestDto.getEmail().trim())
                .phone(requestDto.getPhone() != null ? requestDto.getPhone().trim() : null)
                .subject(requestDto.getSubject().trim())
                .message(requestDto.getMessage().trim())
                .createdAt(LocalDateTime.now())
                .build();

        ContactUs saved = contactUsRepository.save(entity);

        return ContactUsResponseDto.builder()
                .contactId(saved.getContactId())
                .name(saved.getName())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .subject(saved.getSubject())
                .message(saved.getMessage())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
