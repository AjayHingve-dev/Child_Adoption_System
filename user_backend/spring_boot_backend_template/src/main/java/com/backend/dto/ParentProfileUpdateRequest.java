package com.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.backend.entity.Gender;
import com.backend.entity.MaritalStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
public class ParentProfileUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    private String firstName;

    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    private String lastName;

    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must contain 10 to 15 digits")
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
}
