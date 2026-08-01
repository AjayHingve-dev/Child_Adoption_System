package com.backend.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backend.dto.UpdateUserDocumentRequestDto;
import com.backend.dto.UserDocumentRequestDto;
import com.backend.dto.UserDocumentResponseDto;
import com.backend.entity.AdoptionRequest;
import com.backend.entity.User;
import com.backend.entity.UserDocument;
import com.backend.entity.VerificationStatus;
import com.backend.repository.AdoptionRequestRepository;
import com.backend.repository.UserDocumentRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserDocumentServiceImpl implements UserDocumentService {

    private final UserRepository userRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final UserDocumentRepository userDocumentRepository;

    private static final String UPLOAD_DIR = "uploads/documents/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of 5MB");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String lowerCaseName = originalFileName.toLowerCase();
        if (!lowerCaseName.endsWith(".pdf") &&
            !lowerCaseName.endsWith(".jpg") &&
            !lowerCaseName.endsWith(".jpeg") &&
            !lowerCaseName.endsWith(".png")) {
            throw new IllegalArgumentException("Invalid file format. Only PDF, JPG, and PNG files are allowed");
        }
    }

    private User resolveRegisteredUser(Long userId, String email) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && email != null && !email.trim().isEmpty()) {
            user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        }
        if (user == null) {
            throw new IllegalArgumentException("Only registered parent users can upload or access documents. Please log in or create a parent account.");
        }
        return user;
    }

    @Override
    public UserDocumentResponseDto uploadDocument(UserDocumentRequestDto dto, MultipartFile file) {
        return uploadDocument(dto.getUserId(), null, dto.getDocumentType(), file, dto.getRequestId());
    }

    @Override
    public UserDocumentResponseDto uploadDocument(Long userId, String email, String documentType, MultipartFile file, Long requestId) {
        validateFile(file);

        if (documentType == null || documentType.trim().isEmpty()) {
            throw new IllegalArgumentException("Document type must be specified");
        }

        User user = resolveRegisteredUser(userId, email);

        AdoptionRequest request = null;
        if (requestId != null) {
            request = adoptionRequestRepository.findById(requestId).orElse(null);
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID() + "_" + originalFileName;
            Path filePath = uploadPath.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Optional<UserDocument> existingDocOpt = userDocumentRepository
                    .findByUserUserIdAndDocumentType(user.getUserId(), documentType);

            UserDocument document;
            if (existingDocOpt.isPresent()) {
                document = existingDocOpt.get();
                if (document.getFilePath() != null) {
                    try {
                        Files.deleteIfExists(Paths.get(document.getFilePath()));
                    } catch (Exception ignored) {}
                }
            } else {
                document = new UserDocument();
                document.setUser(user);
                document.setDocumentType(documentType);
            }

            if (request != null) {
                document.setRequest(request);
            }

            document.setFileName(originalFileName);
            document.setFilePath(filePath.toString().replace("\\", "/"));
            document.setVerificationStatus(VerificationStatus.PENDING);
            document.setUploadedAt(LocalDateTime.now());

            UserDocument saved = userDocumentRepository.save(document);

            return mapToResponseDto(saved, "Document uploaded successfully.");

        } catch (IOException e) {
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDocumentResponseDto> getUserDocuments(Long userId, String email) {
        User user = resolveRegisteredUser(userId, email);
        List<UserDocument> documents = userDocumentRepository.findByUserUserId(user.getUserId());
        return documents.stream()
                .map(doc -> mapToResponseDto(doc, null))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteDocument(Long documentId) {
        deleteDocument(documentId, null, null);
    }

    @Override
    public void deleteDocument(Long documentId, Long userId, String email) {
        UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));

        User user = resolveRegisteredUser(userId, email);
        if (!document.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized to delete this document");
        }

        if (document.getVerificationStatus() == VerificationStatus.VERIFIED) {
            throw new RuntimeException("Verified documents cannot be deleted.");
        }

        if (document.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(document.getFilePath()));
            } catch (IOException e) {
                System.err.println("Warning: Unable to delete physical file: " + document.getFilePath());
            }
        }

        userDocumentRepository.delete(document);
    }

    @Override
    public UserDocumentResponseDto updateDocument(Long documentId, UpdateUserDocumentRequestDto requestDto) {
        MultipartFile file = requestDto.getFile();
        String documentType = requestDto.getDocumentType();
        validateFile(file);

        UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));

        if (document.getVerificationStatus() == VerificationStatus.VERIFIED) {
            throw new RuntimeException("Verified document cannot be updated.");
        }

        try {
            if (document.getFilePath() != null) {
                Files.deleteIfExists(Paths.get(document.getFilePath()));
            }

            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String newFileName = UUID.randomUUID() + "_" + originalFileName;
            Path filePath = uploadPath.resolve(newFileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            if (documentType != null && !documentType.trim().isEmpty()) {
                document.setDocumentType(documentType);
            }
            document.setFileName(originalFileName);
            document.setFilePath(filePath.toString().replace("\\", "/"));
            document.setUploadedAt(LocalDateTime.now());
            document.setVerificationStatus(VerificationStatus.PENDING);

            UserDocument updated = userDocumentRepository.save(document);

            return mapToResponseDto(updated, "Document updated successfully.");

        } catch (IOException e) {
            throw new RuntimeException("Failed to update document: " + e.getMessage(), e);
        }
    }

    private UserDocumentResponseDto mapToResponseDto(UserDocument doc, String message) {
        UserDocumentResponseDto response = new UserDocumentResponseDto();
        response.setDocumentId(doc.getDocumentId());
        if (doc.getUser() != null) {
            response.setUserId(doc.getUser().getUserId());
        }
        if (doc.getRequest() != null) {
            response.setRequestId(doc.getRequest().getRequestId());
        }
        response.setDocumentType(doc.getDocumentType());
        response.setFileName(doc.getFileName());
        response.setFilePath(doc.getFilePath());
        response.setVerificationStatus(doc.getVerificationStatus());
        response.setUploadedAt(doc.getUploadedAt());
        response.setMessage(message);
        return response;
    }
}