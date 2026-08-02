package com.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.backend.entity.AdoptionRecord;

@Repository
public interface AdoptionRecordRepository extends JpaRepository<AdoptionRecord, Long> {
    List<AdoptionRecord> findByUser_UserId(Long userId);
    List<AdoptionRecord> findByUser_Email(String email);
}
