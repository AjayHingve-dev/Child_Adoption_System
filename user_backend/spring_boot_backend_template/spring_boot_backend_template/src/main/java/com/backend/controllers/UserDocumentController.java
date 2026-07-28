package com.backend.controllers;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.backend.dto.UserDocumentRequestDto;
import com.backend.dto.UserDocumentResponseDto;
import com.backend.services.UserDocumentService;
import org.springframework.http.MediaType;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-documents")
@RequiredArgsConstructor
public class UserDocumentController {

    private final UserDocumentService userDocumentService;

    @PostMapping(
    	    value = "/upload",
    	    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    	)
    	public ResponseEntity<UserDocumentResponseDto> uploadDocument(

    	        @RequestParam Long userId,
    	        @RequestParam Long requestId,
    	        @RequestParam String documentType,
    	        @RequestParam("file") MultipartFile file

    	) {
    	    UserDocumentRequestDto dto = new UserDocumentRequestDto();

    	    dto.setUserId(userId);
    	    dto.setRequestId(requestId);
    	    dto.setDocumentType(documentType);

    	    UserDocumentResponseDto response =
    	            userDocumentService.uploadDocument(dto, file);

    	    return new ResponseEntity<>(response, HttpStatus.CREATED);
    	}
}
