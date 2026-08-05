package com.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.entity.SocialWorker;

@Repository
public interface SocialWorkerRepository extends JpaRepository<SocialWorker, Long> {
    Optional<SocialWorker> findByEmail(String email);
    Optional<SocialWorker> findBySocialWorkerCode(String code);
}
