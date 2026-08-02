package com.backend.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionRecordResponseDto {
    private Long adoptionId;
    private Long requestId;
    private String applicationNumber;

    // Child Details
    private Long childId;
    private String childFirstName;
    private String childLastName;
    private String childFullName;
    private String childGender;
    private LocalDate childDob;
    private String childProfilePhoto;

    // Approval Date & Certificate & Status
    private LocalDate adoptionDate;
    private String certificateNumber;
    private String status;
}
