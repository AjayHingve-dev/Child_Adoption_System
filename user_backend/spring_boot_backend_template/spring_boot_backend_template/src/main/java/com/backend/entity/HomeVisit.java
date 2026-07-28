package com.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="home_visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long homeVisitId;

    @Column(unique=true)
    private String visitCode;

    @ManyToOne
    @JoinColumn(name="request_id")
    private AdoptionRequest request;

    @ManyToOne
    @JoinColumn(name="social_worker_id")
    private SocialWorker socialWorker;

    private LocalDate scheduledDate;

    private LocalTime scheduledTime;

    @Enumerated(EnumType.STRING)
    private HomeVisitStatus status;

    @Enumerated(EnumType.STRING)
    private OverallImpression overallImpression;

    private String familyEnvironment;

    private String financialStability;

    private String familySupport;

    @Enumerated(EnumType.STRING)
    private ConcernStatus anyConcern;

    @Column(columnDefinition="TEXT")
    private String remarks;

    private LocalDateTime completedAt;

    private LocalDateTime createdAt;
}