package com.backend.dto;

import java.time.LocalDate;

import com.backend.entity.BloodGroup;
import com.backend.entity.ChildStatus;
import com.backend.entity.Gender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChildDto {

    private Long childId;
    private String name;
    private String firstName;
    private String lastName;
    private Integer age;
    private Gender gender;
    private LocalDate dob;
    private String description;
    private String medicalSummary;
    private String medicalNotes;
    private String image;
    private String profilePhoto;
    private ChildStatus status;
    private BloodGroup bloodGroup;
    private String education;
    private String hobbies;
    private Boolean specialNeeds;
}
