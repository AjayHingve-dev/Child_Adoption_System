package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.AdoptionRequest;
import com.backend.entity.RequestStatus;

public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {

    boolean existsByUserUserIdAndChildChildId(Long userId, Long childId);

    boolean existsByUserUserIdAndChildChildIdAndStatus(
            Long userId,
            Long childId,
            RequestStatus status
    );

    Optional<AdoptionRequest> findByApplicationNumber(String applicationNumber);
    
    List<AdoptionRequest> findByUserUserId(Long userId);

    List<AdoptionRequest> findByUserUserIdOrderByRequestDateDesc(Long userId);
}