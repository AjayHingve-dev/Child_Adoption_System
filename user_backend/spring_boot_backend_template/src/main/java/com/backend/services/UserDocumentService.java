package com.backend.services;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.backend.dto.UpdateUserDocumentRequestDto;
import com.backend.dto.UserDocumentRequestDto;
import com.backend.dto.UserDocumentResponseDto;

public interface UserDocumentService {

    UserDocumentResponseDto uploadDocument(
            UserDocumentRequestDto dto,
            MultipartFile file);

    UserDocumentResponseDto uploadDocument(
            Long userId,
            String email,
            String documentType,
            MultipartFile file,
            Long requestId);

    List<UserDocumentResponseDto> getUserDocuments(Long userId, String email);

    void deleteDocument(Long documentId);

    void deleteDocument(Long documentId, Long userId, String email);

    UserDocumentResponseDto updateDocument(
            Long documentId,
            UpdateUserDocumentRequestDto requestDto);
}
