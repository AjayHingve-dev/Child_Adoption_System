package com.backend.repository;

import com.backend.entity.Child;
import com.backend.entity.ChildStatus;
import com.backend.entity.Gender;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildRepository extends JpaRepository<Child, Long> {

    List<Child> findByStatus(ChildStatus status);

    Page<Child> findByStatus(ChildStatus status, Pageable pageable);

    Optional<Child> findByChildIdAndStatus(Long childId, ChildStatus status);

    List<Child> findByGender(Gender gender);
}