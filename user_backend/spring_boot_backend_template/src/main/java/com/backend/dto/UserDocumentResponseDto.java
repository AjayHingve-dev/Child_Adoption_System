package com.backend.dto;

import java.time.LocalDateTime;

import com.backend.entity.VerificationStatus;

import lombok.Data;

@Data
public class UserDocumentResponseDto {

    private Long documentId;

    private Long userId;

    private Long requestId;

    private String documentType;

    private String fileName;

    private String filePath;

    private VerificationStatus verificationStatus;

    private LocalDateTime uploadedAt;

    private String message;

}
