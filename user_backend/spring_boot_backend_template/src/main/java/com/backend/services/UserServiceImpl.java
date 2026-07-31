package com.backend.services;



import java.time.LocalDateTime;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.backend.dto.ChangePasswordRequestDto;
import com.backend.dto.LoginRequestDto;
import com.backend.dto.UserRegisterRequestDto;
import com.backend.dto.UserResponseDto;
import com.backend.dto.UserUpdateRequestDto;
import com.backend.entity.User;
import com.backend.entity.UserStatus;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDto registerUser(UserRegisterRequestDto dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }

        if (userRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("Phone number already exists.");
        }

        if (userRepository.existsByAadhaarNumber(dto.getAadhaarNumber())) {
            throw new RuntimeException("Aadhaar number already exists.");
        }

        User user = new User();

        BeanUtils.copyProperties(dto, user);

        if (dto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        UserResponseDto response = new UserResponseDto();
        BeanUtils.copyProperties(savedUser, response);

        return response;
    }

    @Override
    public String loginUser(LoginRequestDto dto) {

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Email"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword()) && !user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        return "Login Successful";
    }
    
    @Override
    public UserResponseDto updateUser(Long userId, UserUpdateRequestDto dto) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Phone uniqueness check
        if (!user.getPhone().equals(dto.getPhone())
                && userRepository.existsByPhone(dto.getPhone())) {

            throw new RuntimeException("Phone number already exists");
        }

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setMaritalStatus(dto.getMaritalStatus());
        user.setOccupation(dto.getOccupation());
        user.setAddress(dto.getAddress());
        user.setCity(dto.getCity());
        user.setState(dto.getState());
        user.setPincode(dto.getPincode());
        user.setProfilePhoto(dto.getProfilePhoto());

        User updatedUser = userRepository.save(user);

        UserResponseDto response = new UserResponseDto();
        BeanUtils.copyProperties(updatedUser, response);

        return response;
    }
    
    @Override
    public String changePassword(ChangePasswordRequestDto dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        // Check old password
        if (!user.getPassword().equals(dto.getOldPassword())) {
            throw new RuntimeException("Old password is incorrect.");
        }

        // Check new password and confirm password
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match.");
        }

        // Prevent reusing the same password
        if (dto.getOldPassword().equals(dto.getNewPassword())) {
            throw new RuntimeException("New password cannot be the same as the old password.");
        }

        // Update password
        user.setPassword(dto.getNewPassword());

        userRepository.save(user);

        return "Password changed successfully.";

    }
}
