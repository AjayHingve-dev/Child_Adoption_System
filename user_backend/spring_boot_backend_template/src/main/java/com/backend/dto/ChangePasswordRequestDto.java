package com.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChangePasswordRequestDto {

    private Long userId;

    private String oldPassword;

    private String newPassword;

    private String confirmPassword;

}
