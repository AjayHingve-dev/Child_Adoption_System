package com.backend.entity;

import java.math.BigDecimal;
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
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate dob;

    @Column(unique = true)
    private String aadhaarNumber;

    @Enumerated(EnumType.STRING)
    private MaritalStatus maritalStatus;

    private String occupation;

    private BigDecimal annualIncome;

    @Column(columnDefinition="TEXT")
    private String address;

    private String city;

    private String state;

    private String pincode;

    @Column(columnDefinition="LONGTEXT")
    private String profilePhoto;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy="user")
    private List<AdoptionRequest> requests;

    @OneToMany(mappedBy="user")
    private List<UserDocument> documents;

    @OneToMany(mappedBy="user")
    private List<AdoptionRecord> adoptionRecords;
}
