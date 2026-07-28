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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name="social_workers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialWorker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long socialWorkerId;

    @Column(unique = true)
    private String socialWorkerCode;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(unique = true)
    private String phone;

    private String district;

    private String area;

    @Enumerated(EnumType.STRING)
    private SocialWorkerStatus status;

    @ManyToOne
    @JoinColumn(name="created_by_admin_id")
    private Admin createdByAdmin;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "socialWorker")
    private List<HomeVisit> homeVisits;
}
