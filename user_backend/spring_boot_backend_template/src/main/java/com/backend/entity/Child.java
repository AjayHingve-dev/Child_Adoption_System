package com.backend.entity;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="children")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long childId;

    private String firstName;

    private String lastName;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    private BloodGroup bloodGroup;

    @Column(columnDefinition="TEXT")
    private String medicalNotes;

    private Boolean specialNeeds;

    private String education;

    private String hobbies;

    @Column(columnDefinition="TEXT")
    private String description;

    private String profilePhoto;

    @Enumerated(EnumType.STRING)
    private ChildStatus status;

    private LocalDateTime createdAt;
    
    private LocalDate admission_date;

    @OneToMany(mappedBy="child")
    private List<AdoptionRequest> requests;

    @OneToMany(mappedBy="child")
    private List<AdoptionRecord> adoptionRecords;

    @OneToMany(mappedBy="child")
    private List<ChildMedicalHistory> medicalHistory;
}
