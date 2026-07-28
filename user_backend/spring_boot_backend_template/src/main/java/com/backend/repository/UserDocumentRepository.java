package com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.entity.UserDocument;

@Repository
public interface UserDocumentRepository
        extends JpaRepository<UserDocument, Long> {

}