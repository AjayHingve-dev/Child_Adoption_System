package com.backend.dto;

import java.time.LocalDateTime;

import com.backend.entity.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
	private Long userId;
	private String firstName;
	private String lastName;
	private String email;
	private String phone;
	private UserStatus status;
	private LocalDateTime createdAt;
	
	
	
}
