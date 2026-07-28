package com.backend.dto;



import java.time.LocalDateTime;

import com.backend.entity.RequestStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdoptionResponseDto {

    private Long requestId;

    private String applicationNumber;

    private Long userId;

    private String userName;

    private Long childId;

    private String childName;

    private LocalDateTime requestDate;

    private RequestStatus status;

    private String message;
}
