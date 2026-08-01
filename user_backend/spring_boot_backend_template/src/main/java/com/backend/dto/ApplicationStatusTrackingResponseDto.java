package com.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.backend.entity.RequestStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatusTrackingResponseDto {
    private Long requestId;
    private String applicationNumber;
    private Long childId;
    private String childName;
    private String childGender;
    private RequestStatus status;
    private LocalDateTime requestDate;
    private LocalDateTime statusUpdatedAt;
    private String adminRemark;

    // Home visit info if applicable
    private String socialWorkerName;
    private String visitDate;
    private String visitTime;
    private String visitStatus;

    // Timeline steps with updated dates
    private List<TimelineStepDto> timeline;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelineStepDto {
        private String stepKey; // PENDING, UNDER_REVIEW, HOME_VISIT, APPROVED, REJECTED, COMPLETED
        private String label;
        private boolean completed;
        private boolean current;
        private LocalDateTime updatedAt;
        private String description;
    }
}
