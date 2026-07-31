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
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.ChildDto;
import com.backend.dto.ChildResponseDto;
import com.backend.dto.PageResponseDto;
import com.backend.entity.Child;
import com.backend.entity.ChildStatus;
import com.backend.entity.Gender;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.ChildRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChildServiceImpl implements ChildService {

    private final ChildRepository childRepository;

    @Override
    public PageResponseDto<ChildDto> getAvailableChildren(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("childId").descending());
        Page<Child> childPage = childRepository.findByStatus(ChildStatus.AVAILABLE, pageable);

        List<ChildDto> content = childPage.getContent().stream()
                .map(this::mapToChildDto)
                .collect(Collectors.toList());

        return PageResponseDto.<ChildDto>builder()
                .content(content)
                .pageNo(childPage.getNumber())
                .pageSize(childPage.getSize())
                .totalElements(childPage.getTotalElements())
                .totalPages(childPage.getTotalPages())
                .last(childPage.isLast())
                .build();
    }

    @Override
    public ChildDto getAvailableChildById(Long id) {
        Child child = childRepository.findByChildIdAndStatus(id, ChildStatus.AVAILABLE)
                .orElseThrow(() -> new ResourceNotFoundException("Child not found or not available for adoption with id: " + id));

        return mapToChildDto(child);
    }

    @Override
    public List<ChildResponseDto> getAvailableChildren() {
        List<Child> children = childRepository.findByStatus(ChildStatus.AVAILABLE);
        return children.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChildResponseDto> searchChildrenByGender(Gender gender) {
        List<Child> children = childRepository.findByGender(gender);
        return children.stream()
                .filter(c -> c.getStatus() == ChildStatus.AVAILABLE)
                .map(child -> {
                    ChildResponseDto dto = new ChildResponseDto();
                    BeanUtils.copyProperties(child, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private ChildDto mapToChildDto(Child child) {
        String fullName = (child.getFirstName() + " " + (child.getLastName() != null ? child.getLastName() : "")).trim();
        Integer age = null;
        if (child.getDob() != null) {
            age = Period.between(child.getDob(), LocalDate.now()).getYears();
        }

        return ChildDto.builder()
                .childId(child.getChildId())
                .name(fullName)
                .firstName(child.getFirstName())
                .lastName(child.getLastName())
                .age(age)
                .gender(child.getGender())
                .dob(child.getDob())
                .description(child.getDescription())
                .medicalSummary(child.getMedicalNotes())
                .medicalNotes(child.getMedicalNotes())
                .image(child.getProfilePhoto())
                .profilePhoto(child.getProfilePhoto())
                .status(child.getStatus())
                .bloodGroup(child.getBloodGroup())
                .education(child.getEducation())
                .hobbies(child.getHobbies())
                .specialNeeds(child.getSpecialNeeds())
                .build();
    }

    private ChildResponseDto mapToResponseDto(Child child) {
        ChildResponseDto dto = new ChildResponseDto();
        dto.setChildId(child.getChildId());
        dto.setFirstName(child.getFirstName());
        dto.setGender(child.getGender());
        dto.setDob(child.getDob());
        dto.setBloodGroup(child.getBloodGroup());
        dto.setProfilePhoto(child.getProfilePhoto());
        dto.setStatus(child.getStatus());
        return dto;
    }
}

