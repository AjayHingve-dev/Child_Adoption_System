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
public class VisitReportResponseDto {
    private Long homeVisitId;
    private String visitCode;
    private Long requestId;
    private Long socialWorkerId;
    private String homeCondition;
    private String financialStatus;
    private String familyBackground;
    private String observations;
    private String remarks;
    private String recommendation;
    private LocalDateTime completedAt;
}
