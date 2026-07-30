package com.backend.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.AuthResponse;
import com.backend.dto.LoginRequest;
import com.backend.dto.ParentProfileResponse;
import com.backend.dto.ParentProfileUpdateRequest;
import com.backend.dto.ParentRegisterRequest;
import com.backend.entity.User;
import com.backend.entity.UserStatus;
import com.backend.exception.ConflictException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.UserRepository;
import com.backend.security.JwtUtils;

@Service
@Transactional
public class ParentServiceImpl implements ParentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public AuthResponse registerParent(ParentRegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Parent user with this email address already exists.");
        }

        if (userRepository.existsByPhone(phone)) {
            throw new ConflictException("Parent user with this phone number already exists.");
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName() != null ? request.getLastName().trim() : null)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getUserId(), "PARENT");
        String fullName = (savedUser.getFirstName() + " " + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getUserId())
                .fullName(fullName)
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role("PARENT")
                .build();
    }

    @Override
    public AuthResponse loginParent(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        String token = jwtUtils.generateToken(authentication);
        String fullName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .fullName(fullName)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role("PARENT")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ParentProfileResponse getParentProfile(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found."));

        return mapToProfileResponse(user);
    }

    @Override
    public ParentProfileResponse updateParentProfile(String email, ParentProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found."));

        if (request.getPhone() != null && !request.getPhone().trim().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone().trim())) {
                throw new ConflictException("Phone number is already used by another user account.");
            }
            user.setPhone(request.getPhone().trim());
        }

        if (request.getAadhaarNumber() != null && !request.getAadhaarNumber().trim().isEmpty() &&
            !request.getAadhaarNumber().trim().equals(user.getAadhaarNumber())) {
            if (userRepository.existsByAadhaarNumber(request.getAadhaarNumber().trim())) {
                throw new ConflictException("Aadhaar number is already registered.");
            }
            user.setAadhaarNumber(request.getAadhaarNumber().trim());
        }

        user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) user.setLastName(request.getLastName().trim());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getDob() != null) user.setDob(request.getDob());
        if (request.getMaritalStatus() != null) user.setMaritalStatus(request.getMaritalStatus());
        if (request.getOccupation() != null) user.setOccupation(request.getOccupation().trim());
        if (request.getAnnualIncome() != null) user.setAnnualIncome(request.getAnnualIncome());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        if (request.getCity() != null) user.setCity(request.getCity().trim());
        if (request.getState() != null) user.setState(request.getState().trim());
        if (request.getPincode() != null) user.setPincode(request.getPincode().trim());
        if (request.getProfilePhoto() != null) user.setProfilePhoto(request.getProfilePhoto().trim());

        User updatedUser = userRepository.save(user);
        return mapToProfileResponse(updatedUser);
    }

    private static ParentProfileResponse mapToProfileResponse(User user) {
        return ParentProfileResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dob(user.getDob())
                .aadhaarNumber(user.getAadhaarNumber())
                .maritalStatus(user.getMaritalStatus())
                .occupation(user.getOccupation())
                .annualIncome(user.getAnnualIncome())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .profilePhoto(user.getProfilePhoto())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
