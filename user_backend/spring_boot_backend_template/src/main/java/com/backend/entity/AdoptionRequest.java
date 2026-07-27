package com.backend.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name="adoption_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @Column(unique=true)
    private String applicationNumber;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="child_id")
    private Child child;

    private LocalDateTime requestDate;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private LocalDateTime statusUpdatedAt;

    @ManyToOne
    @JoinColumn(name="reviewed_by_admin_id")
    private Admin reviewedByAdmin;

    @Column(columnDefinition="TEXT")
    private String adminRemark;

    @OneToOne(mappedBy="request")
    private AdoptionRecord adoptionRecord;

    @OneToMany(mappedBy="request")
    private List<HomeVisit> homeVisits;

    @OneToMany(mappedBy="request")
    private List<UserDocument> documents;
}
