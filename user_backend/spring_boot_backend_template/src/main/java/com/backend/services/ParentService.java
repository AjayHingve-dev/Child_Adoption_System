package com.backend.services;

import com.backend.dto.AuthResponse;
import com.backend.dto.LoginRequest;
import com.backend.dto.ParentRegisterRequest;

public interface ParentService {
    AuthResponse registerParent(ParentRegisterRequest request);
    AuthResponse loginParent(LoginRequest request);
}
