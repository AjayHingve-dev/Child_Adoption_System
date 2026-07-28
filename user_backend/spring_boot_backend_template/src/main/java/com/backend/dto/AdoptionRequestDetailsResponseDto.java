package com.backend.dto;

import java.time.LocalDateTime;

import com.backend.entity.RequestStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdoptionRequestDetailsResponseDto {

    private Long requestId;

    private String applicationNumber;

    private Long childId;

    private String childName;

    private Integer childAge;

    private String childGender;

    private LocalDateTime requestDate;

    private RequestStatus status;

    private String adminRemark;

}
