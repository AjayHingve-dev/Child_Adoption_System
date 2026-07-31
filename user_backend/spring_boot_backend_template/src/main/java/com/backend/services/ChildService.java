package com.backend.services;


import com.backend.dto.ChildResponseDto;
import com.backend.entity.BloodGroup;
import com.backend.entity.Gender;

import java.util.List;

import com.backend.dto.ChildDto;
import com.backend.dto.ChildResponseDto;
import com.backend.dto.PageResponseDto;
import com.backend.entity.Gender;

public interface ChildService {

    PageResponseDto<ChildDto> getAvailableChildren(int page, int size);

    ChildDto getAvailableChildById(Long id);

    List<ChildResponseDto> getAvailableChildren();

    List<ChildResponseDto> searchChildrenByGender(Gender gender);
}