package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.entity.UserDocument;

@Repository
public interface UserDocumentRepository
        extends JpaRepository<UserDocument, Long> {

    List<UserDocument> findByUserUserId(Long userId);

    Optional<UserDocument> findByUserUserIdAndDocumentType(Long userId, String documentType);
}