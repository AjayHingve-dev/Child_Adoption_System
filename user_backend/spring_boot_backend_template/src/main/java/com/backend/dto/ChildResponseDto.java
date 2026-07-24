package com.backend.dto;

import com.backend.entity.BloodGroup;
import com.backend.entity.ChildMedicalHistory;
import com.backend.entity.ChildStatus;
import com.backend.entity.Gender;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChildResponseDto {

    private Long childId;

    private String firstName;

    private Gender gender;

    private LocalDate dob;

    private BloodGroup bloodGroup;

    private ChildStatus status;
    
    private String profilePhoto;

}