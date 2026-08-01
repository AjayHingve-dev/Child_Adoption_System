package com.backend.dto;

import com.backend.entity.BloodGroup;
import com.backend.entity.ChildStatus;
import com.backend.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChildDetailDto {
    private Long childId;
    private String name;
    private String firstName;
    private String lastName;
    private Integer age;
    private Gender gender;
    private String description;
    private String medicalSummary;
    private String image;
    private String profilePhoto;
    private LocalDate dob;
    private BloodGroup bloodGroup;
    private String education;
    private String hobbies;
    private Boolean specialNeeds;
    private ChildStatus status;
}
