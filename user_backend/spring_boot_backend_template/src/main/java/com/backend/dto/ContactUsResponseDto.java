package com.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactUsResponseDto {
    private Long contactId;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private LocalDateTime createdAt;
}
