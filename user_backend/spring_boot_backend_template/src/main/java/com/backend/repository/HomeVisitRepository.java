package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.entity.HomeVisit;

@Repository
public interface HomeVisitRepository extends JpaRepository<HomeVisit, Long> {
    List<HomeVisit> findByRequestRequestId(Long requestId);
    Optional<HomeVisit> findFirstByRequestRequestIdOrderByCreatedAtDesc(Long requestId);
    List<HomeVisit> findByRequestUserUserIdOrderByScheduledDateDescScheduledTimeDesc(Long userId);
    List<HomeVisit> findByRequestUserEmailOrderByScheduledDateDescScheduledTimeDesc(String email);
}

