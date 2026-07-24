package com.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.backend.entity.Gender;
import com.backend.entity.MaritalStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserRegisterRequestDto {
	private String firstName;
	private String lastName;
	private String email;
	private String password;
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
