package com.backend.services;


import com.backend.dto.ChildResponseDto;
import com.backend.entity.BloodGroup;
import com.backend.entity.Gender;

import java.util.List;

public interface ChildService {
    
    List<ChildResponseDto> getAvailableChildren();
    
    List<ChildResponseDto> searchChildrenByGender(Gender gender);
}