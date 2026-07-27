package com.backend.services;


import com.backend.dto.ChangePasswordRequestDto;
import com.backend.dto.LoginRequestDto;
import com.backend.dto.UserRegisterRequestDto;
import com.backend.dto.UserResponseDto;
import com.backend.dto.UserUpdateRequestDto;

public interface UserService {

    UserResponseDto registerUser(UserRegisterRequestDto userRequestDto);

    String loginUser(LoginRequestDto loginRequestDto);

    UserResponseDto updateUser(Long userId, UserUpdateRequestDto dto);
    
    String changePassword(ChangePasswordRequestDto dto);

}