package com.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.backend.entity.ConcernStatus;
import com.backend.entity.HomeVisitStatus;
import com.backend.entity.OverallImpression;
import com.fasterxml.jackson.annotation.JsonProperty;

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
public class SocialWorkerHomeVisitDto {

    private Long homeVisitId;
    private String visitCode;

    // Visit Date (Return required by API)
    @JsonProperty("visitDate")
    private LocalDate visitDate;

    @JsonProperty("scheduledDate")
    private LocalDate scheduledDate;

    // Visit Time (Return required by API)
    @JsonProperty("visitTime")
    private LocalTime visitTime;

    @JsonProperty("scheduledTime")
    private LocalTime scheduledTime;

    // Parent Name (Return required by API)
    @JsonProperty("parentName")
    private String parentName;

    // Address (Return required by API)
    @JsonProperty("address")
    private String address;

    // Status (Return required by API)
    @JsonProperty("status")
    private HomeVisitStatus status;

    // Additional Visit & Application details
    private String remarks;
    private Long requestId;
    private String applicationNumber;
    private String childName;

    private OverallImpression overallImpression;
    private String familyEnvironment;
    private String financialStability;
    private String familySupport;
    private ConcernStatus anyConcern;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
