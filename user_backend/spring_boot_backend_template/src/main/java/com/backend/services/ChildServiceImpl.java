package com.backend.services;



import com.backend.dto.ChildResponseDto;
import com.backend.entity.BloodGroup;
import com.backend.entity.Child;
import com.backend.entity.ChildStatus;
import com.backend.entity.Gender;
import com.backend.repository.ChildRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChildServiceImpl implements ChildService {

    private final ChildRepository childRepository;
    
    
    @Override
    public List<ChildResponseDto> getAvailableChildren() {

        List<Child> children = childRepository.findByStatus(ChildStatus.AVAILABLE);

        return children.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private ChildResponseDto mapToResponseDto(Child child) {

        ChildResponseDto dto = new ChildResponseDto();
        //we have to use instead of this code used modelMapper
        dto.setChildId(child.getChildId());
        dto.setFirstName(child.getFirstName());
        dto.setGender(child.getGender());
        dto.setDob(child.getDob());
        dto.setBloodGroup(child.getBloodGroup());
        dto.setProfilePhoto(child.getProfilePhoto());
        dto.setStatus(child.getStatus());

        return dto;
    }
    
    @Override
    public List<ChildResponseDto> searchChildrenByGender(Gender gender) {

        List<Child> children = childRepository.findByGender(gender);

        return children.stream()
                .map(child -> {
                    ChildResponseDto dto = new ChildResponseDto();
                    BeanUtils.copyProperties(child, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
