package com.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitReportRequestDto {
    private String homeCondition;
    private String financialStatus;
    private String familyBackground;
    private String observations;
    private String remarks;
    private String recommendation;
}
