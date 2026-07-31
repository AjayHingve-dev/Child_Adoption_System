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

    private String name;

    private String firstName;

    private String lastName;

    private Gender gender;

    private Integer age;

    private LocalDate dob;

    private BloodGroup bloodGroup;

    private String description;

    private String medicalSummary;

    private String medicalNotes;

    private String image;

    private String profilePhoto;

    private String education;

    private String hobbies;

    private Boolean specialNeeds;

    private ChildStatus status;

}