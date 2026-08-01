package com.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.backend.entity.ConcernStatus;
import com.backend.entity.HomeVisitStatus;
import com.backend.entity.OverallImpression;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentHomeVisitDto {
    private Long homeVisitId;
    private String visitCode;
    
    // Visit Date & Time (as required)
    private LocalDate visitDate;
    private LocalTime visitTime;
    
    // Assigned Social Worker details
    private String assignedSocialWorker;
    private String socialWorker;
    private String socialWorkerPhone;
    private String socialWorkerEmail;
    
    // Status & Remarks
    private String remarks;
    private HomeVisitStatus status;
    
    // Application & Child Details
    private Long requestId;
    private String applicationNumber;
    private String childName;
    
    // Additional Visit Assessment Details
    private OverallImpression overallImpression;
    private String familyEnvironment;
    private String financialStability;
    private String familySupport;
    private ConcernStatus anyConcern;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
