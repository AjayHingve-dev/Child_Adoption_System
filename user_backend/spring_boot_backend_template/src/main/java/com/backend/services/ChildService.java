package com.backend.services;

import com.backend.dto.ChildResponseDto;
import com.backend.entity.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChildService {
    
    List<ChildResponseDto> getAvailableChildren();

    Page<ChildResponseDto> getAvailableChildren(Pageable pageable);

    ChildResponseDto getChildById(Long id);
    
    List<ChildResponseDto> searchChildrenByGender(Gender gender);
}