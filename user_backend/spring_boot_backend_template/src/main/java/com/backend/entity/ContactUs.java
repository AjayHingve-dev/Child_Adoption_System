package com.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="contact_us")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactUs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contactId;

    private String name;

    private String email;

    private String phone;

    private String subject;

    @Column(columnDefinition="TEXT")
    private String message;

    private LocalDateTime createdAt;
}
