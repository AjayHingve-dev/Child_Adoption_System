package com.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class UpdateUserDocumentRequestDto {

    private String documentType;

    private MultipartFile file;

}
