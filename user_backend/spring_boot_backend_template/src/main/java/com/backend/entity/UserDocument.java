package com.backend.entity;


import java.time.LocalDateTime;


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
@Table(name="user_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentId;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="request_id")
    private AdoptionRequest request;

    private String documentType;

    private String fileName;

    private String filePath;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    private LocalDateTime uploadedAt;
}
