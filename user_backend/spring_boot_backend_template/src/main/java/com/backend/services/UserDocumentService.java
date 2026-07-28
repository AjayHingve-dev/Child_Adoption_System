package com.backend.services;
import org.springframework.web.multipart.MultipartFile;

import com.backend.dto.UpdateUserDocumentRequestDto;
import com.backend.dto.UserDocumentRequestDto;
import com.backend.dto.UserDocumentResponseDto;

public interface UserDocumentService {

	 UserDocumentResponseDto uploadDocument(
	            UserDocumentRequestDto dto,
	            MultipartFile file);
	 
	 void deleteDocument(Long documentId);
	 
	 UserDocumentResponseDto updateDocument(
		        Long documentId,
		        UpdateUserDocumentRequestDto requestDto);
}
