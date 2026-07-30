package com.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.backend.entity.Gender;
import com.backend.entity.MaritalStatus;
import com.backend.entity.UserStatus;

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
public class ParentProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Gender gender;
    private LocalDate dob;
    private String aadhaarNumber;
    private MaritalStatus maritalStatus;
    private String occupation;
    private BigDecimal annualIncome;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String profilePhoto;
    private UserStatus status;
    private LocalDateTime createdAt;
}
