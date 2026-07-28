package com.backend.services;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
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
public class UserDocumentServiceImpl implements UserDocumentService {

    private final UserRepository userRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final UserDocumentRepository userDocumentRepository;

    private static final String UPLOAD_DIR = "uploads/documents/";

    @Override
    public UserDocumentResponseDto uploadDocument(
            UserDocumentRequestDto dto,
            MultipartFile file) {

        try {

            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AdoptionRequest request = adoptionRequestRepository
                    .findById(dto.getRequestId())
                    .orElseThrow(() ->
                            new RuntimeException("Request not found"));

            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String originalFileName = file.getOriginalFilename();

            String fileName =
                    UUID.randomUUID() + "_" + originalFileName;

            Path path = Paths.get(UPLOAD_DIR, fileName);

            Files.copy(file.getInputStream(),
                    path,
                    StandardCopyOption.REPLACE_EXISTING);

            UserDocument document = new UserDocument();

            document.setUser(user);
            document.setRequest(request);
            document.setDocumentType(dto.getDocumentType());
            document.setFileName(fileName);
            document.setFilePath(path.toString());
            document.setVerificationStatus(
                    VerificationStatus.PENDING);
            document.setUploadedAt(LocalDateTime.now());

            UserDocument saved =
                    userDocumentRepository.save(document);

            UserDocumentResponseDto response =
                    new UserDocumentResponseDto();

            response.setDocumentId(saved.getDocumentId());
            response.setUserId(user.getUserId());
            response.setRequestId(request.getRequestId());
            response.setDocumentType(saved.getDocumentType());
            response.setFileName(saved.getFileName());
            response.setFilePath(saved.getFilePath());
            response.setVerificationStatus(
                    saved.getVerificationStatus());
            response.setUploadedAt(saved.getUploadedAt());
            response.setMessage(
                    "Document uploaded successfully.");

            return response;

        } catch (IOException e) {
            throw new RuntimeException("File upload failed.");
        }

    }
    
    @Override
    public void deleteDocument(Long documentId) {

        UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException("Document not found"));

        if (document.getVerificationStatus() == VerificationStatus.VERIFIED) {
            throw new RuntimeException(
                    "Verified documents cannot be deleted.");
        }

        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (IOException e) {
            throw new RuntimeException("Unable to delete file.");
        }

        userDocumentRepository.delete(document);
    }

    @Override
    public UserDocumentResponseDto updateDocument(
    		Long documentId,
            UpdateUserDocumentRequestDto requestDto) {

        MultipartFile file = requestDto.getFile();
        String documentType = requestDto.getDocumentType();

        UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException("Document not found"));

        if (document.getVerificationStatus() == VerificationStatus.VERIFIED) {
            throw new RuntimeException(
                    "Verified document cannot be updated.");
        }

        try {

            Files.deleteIfExists(Paths.get(document.getFilePath()));

            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String originalFileName = file.getOriginalFilename();

            String newFileName =
                    UUID.randomUUID() + "_" + originalFileName;

            Path path = Paths.get(UPLOAD_DIR, newFileName);

            Files.copy(
                    file.getInputStream(),
                    path,
                    StandardCopyOption.REPLACE_EXISTING);

            document.setDocumentType(documentType);
            document.setFileName(newFileName);
            document.setFilePath(path.toString());
            document.setUploadedAt(LocalDateTime.now());
            document.setVerificationStatus(VerificationStatus.PENDING);

            UserDocument updated =
                    userDocumentRepository.save(document);

            UserDocumentResponseDto response =
                    new UserDocumentResponseDto();

            response.setDocumentId(updated.getDocumentId());
            response.setUserId(updated.getUser().getUserId());
            response.setRequestId(updated.getRequest().getRequestId());
            response.setDocumentType(updated.getDocumentType());
            response.setFileName(updated.getFileName());
            response.setFilePath(updated.getFilePath());
            response.setVerificationStatus(updated.getVerificationStatus());
            response.setUploadedAt(updated.getUploadedAt());
            response.setMessage("Document updated successfully.");

            return response;

        } catch (IOException e) {
            throw new RuntimeException("Failed to update document.", e);
        }
    }
}