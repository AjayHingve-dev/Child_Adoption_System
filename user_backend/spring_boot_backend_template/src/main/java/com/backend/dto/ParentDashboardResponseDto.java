package com.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentDashboardResponseDto {
    private String parentName;
    private String parentEmail;
    private long applicationCount;
    private String currentStatus;
    private int profileCompletionPercentage;

    // Latest Application Summary
    private String latestApplicationNumber;
    private String latestChildName;
    private String assignedSocialWorker;

    // Upcoming Home Visit
    private ParentHomeVisitDto upcomingHomeVisit;

    // Document Verification Status
    private DocumentStatusSummaryDto documentStatus;

    // Recent Notifications
    private List<DashboardNotificationDto> recentNotifications;

    // Recommended Available Children
    private List<ChildSummaryDto> recommendedChildren;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DocumentStatusSummaryDto {
        private int totalUploaded;
        private int verifiedCount;
        private int pendingCount;
        private int rejectedCount;
        private String summaryText;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardNotificationDto {
        private String id;
        private String title;
        private String message;
        private String type; // e.g. "INFO", "WARNING", "SUCCESS"
        private String status;
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChildSummaryDto {
        private Long childId;
        private String firstName;
        private String lastName;
        private String fullName;
        private String gender;
        private LocalDate dob;
        private String profilePhoto;
        private String description;
    }
}
