package com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.AdoptionRequest;

public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest,Long> {

}
