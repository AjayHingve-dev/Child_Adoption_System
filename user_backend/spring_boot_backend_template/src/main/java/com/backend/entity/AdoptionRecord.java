package com.backend.entity;


import java.time.LocalDate;
import java.time.LocalDateTime;


import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="adoption_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adoptionId;

    @OneToOne
    @JoinColumn(name="request_id")
    private AdoptionRequest request;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="child_id")
    private Child child;

    private LocalDate adoptionDate;

    private String certificateNumber;
}