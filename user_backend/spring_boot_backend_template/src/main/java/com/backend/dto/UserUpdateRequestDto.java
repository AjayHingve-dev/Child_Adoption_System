package com.backend.dto;


import com.backend.entity.MaritalStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserUpdateRequestDto {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    private String phone;

    private MaritalStatus maritalStatus;

    private String occupation;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String profilePhoto;
}
