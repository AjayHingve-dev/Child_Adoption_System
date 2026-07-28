package com.backend.dto;

import lombok.Data;

@Data

public class UserDocumentRequestDto {

    private Long userId;

    private Long requestId;

    private String documentType;

}