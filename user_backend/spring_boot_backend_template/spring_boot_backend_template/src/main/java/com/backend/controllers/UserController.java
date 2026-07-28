package com.backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.dto.ChangePasswordRequestDto;
import com.backend.dto.LoginRequestDto;
import com.backend.dto.UserRegisterRequestDto;
import com.backend.dto.UserResponseDto;
import com.backend.dto.UserUpdateRequestDto;
import com.backend.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> registerUser(
            @Valid @RequestBody UserRegisterRequestDto userRequestDto) {

        UserResponseDto response = userService.registerUser(userRequestDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(
            @Valid @RequestBody LoginRequestDto loginRequestDto) {

        String response = userService.loginUser(loginRequestDto);

        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequestDto dto) {

        UserResponseDto response = userService.updateUser(id, dto);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequestDto dto) {

        String message = userService.changePassword(dto);

        return ResponseEntity.ok(message);
    }

}