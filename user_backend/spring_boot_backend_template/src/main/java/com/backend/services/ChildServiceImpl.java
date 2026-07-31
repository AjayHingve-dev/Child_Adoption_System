package com.backend.services;

import com.backend.dto.ChildResponseDto;
import com.backend.entity.Child;
import com.backend.entity.ChildStatus;
import com.backend.entity.Gender;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.ChildRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
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

    @Override
    public Page<ChildResponseDto> getAvailableChildren(Pageable pageable) {
        Page<Child> childrenPage = childRepository.findByStatus(ChildStatus.AVAILABLE, pageable);
        return childrenPage.map(this::mapToResponseDto);
    }

    @Override
    public ChildResponseDto getChildById(Long id) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Child not found with id: " + id));

        return mapToResponseDto(child);
    }

    @Override
    public List<ChildResponseDto> searchChildrenByGender(Gender gender) {
        List<Child> children = childRepository.findByGender(gender);

        return children.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private ChildResponseDto mapToResponseDto(Child child) {
        if (child == null) return null;

        ChildResponseDto dto = new ChildResponseDto();
        dto.setChildId(child.getChildId());

        String fullName = (child.getFirstName() != null ? child.getFirstName() : "")
                + (child.getLastName() != null ? " " + child.getLastName() : "");
        dto.setName(fullName.trim());
        dto.setFirstName(child.getFirstName());
        dto.setLastName(child.getLastName());

        dto.setGender(child.getGender());
        dto.setDob(child.getDob());
        dto.setAge(calculateAge(child.getDob()));
        dto.setBloodGroup(child.getBloodGroup());

        dto.setDescription(child.getDescription());
        dto.setMedicalSummary(child.getMedicalNotes());
        dto.setMedicalNotes(child.getMedicalNotes());

        dto.setImage(child.getProfilePhoto());
        dto.setProfilePhoto(child.getProfilePhoto());

        dto.setEducation(child.getEducation());
        dto.setHobbies(child.getHobbies());
        dto.setSpecialNeeds(child.getSpecialNeeds());
        dto.setStatus(child.getStatus());

        return dto;
    }

    private Integer calculateAge(LocalDate dob) {
        if (dob == null) return null;
        return Period.between(dob, LocalDate.now()).getYears();
    }
}
