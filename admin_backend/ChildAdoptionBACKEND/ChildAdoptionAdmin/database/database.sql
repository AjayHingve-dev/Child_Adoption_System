-- ==========================================
-- DATABASE
-- ==========================================

DROP DATABASE IF EXISTS child_adoption_system;
CREATE DATABASE child_adoption_system;
USE child_adoption_system;

-- ==========================================
-- ADMINS TABLE
-- ==========================================

CREATE TABLE admins (
    admin_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',      -- ADMIN | SUPER_ADMIN
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',    -- ACTIVE | INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SOCIAL WORKERS TABLE (new)
-- ==========================================

CREATE TABLE social_workers (
    social_worker_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    social_worker_code VARCHAR(20) NOT NULL UNIQUE,   -- e.g. SW-001
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    district VARCHAR(100),
    area VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',     -- ACTIVE | INACTIVE
    created_by_admin_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_socialworker_admin
        FOREIGN KEY (created_by_admin_id)
        REFERENCES admins(admin_id)
        ON DELETE SET NULL
);

-- ==========================================
-- USERS TABLE (Parents / Adoptive Applicants)
-- ==========================================

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    gender VARCHAR(10),
    dob DATE,
    aadhaar_number VARCHAR(12) UNIQUE,
    marital_status VARCHAR(20),
    occupation VARCHAR(100),
    annual_income DECIMAL(12,2),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    profile_photo VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE',              -- ACTIVE | VERIFIED | INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CHILDREN TABLE
-- ==========================================

CREATE TABLE children (
    child_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    gender VARCHAR(10),
    dob DATE,
    blood_group VARCHAR(5),
    medical_notes TEXT,
    health_status VARCHAR(255),
    special_needs BOOLEAN DEFAULT FALSE,
    education VARCHAR(100),
    hobbies VARCHAR(255),
    description TEXT,
    profile_photo VARCHAR(255),
    admission_date DATE,
    status VARCHAR(20) DEFAULT 'AVAILABLE',           -- AVAILABLE | RESERVED | ADOPTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ADOPTION REQUESTS (APPLICATIONS)
-- ==========================================

CREATE TABLE adoption_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_number VARCHAR(20) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    child_id BIGINT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',             -- PENDING | UNDER_REVIEW | APPROVED | REJECTED
    status_updated_at TIMESTAMP NULL,
    reviewed_by_admin_id BIGINT NULL,
    admin_remark TEXT,

    CONSTRAINT fk_request_user
        FOREIGN KEY (user_id) REFERENCES users(user_id),

    CONSTRAINT fk_request_child
        FOREIGN KEY (child_id) REFERENCES children(child_id),

    CONSTRAINT fk_request_admin
        FOREIGN KEY (reviewed_by_admin_id) REFERENCES admins(admin_id)
        ON DELETE SET NULL
);

-- ==========================================
-- HOME VISITS (new)
-- ==========================================

CREATE TABLE home_visits (
    home_visit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_code VARCHAR(20) NOT NULL UNIQUE,           -- e.g. HV-031
    request_id BIGINT NOT NULL,
    social_worker_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',    -- PENDING | COMPLETED | CANCELLED
    overall_impression VARCHAR(20),                   -- Good | Average | Poor
    family_environment VARCHAR(20),
    financial_stability VARCHAR(20),
    family_support VARCHAR(20),
    any_concern VARCHAR(10),                          -- Yes | No
    home_condition TEXT,
    financial_status TEXT,
    family_background TEXT,
    observations TEXT,
    remarks TEXT,
    recommendation VARCHAR(50),                       -- APPROVED | REJECTED | NEED_MORE_INFORMATION
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_visit_request
        FOREIGN KEY (request_id) REFERENCES adoption_requests(request_id),

    CONSTRAINT fk_visit_social_worker
        FOREIGN KEY (social_worker_id) REFERENCES social_workers(social_worker_id)
);

-- ==========================================
-- USER DOCUMENTS
-- ==========================================

CREATE TABLE user_documents (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    request_id BIGINT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_user
        FOREIGN KEY (user_id) REFERENCES users(user_id),

    CONSTRAINT fk_document_request
        FOREIGN KEY (request_id) REFERENCES adoption_requests(request_id)
        ON DELETE SET NULL
);

-- ==========================================
-- ADOPTION RECORDS
-- ==========================================

CREATE TABLE adoption_records (
    adoption_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    child_id BIGINT NOT NULL,
    adoption_date DATE NOT NULL,
    certificate_number VARCHAR(50) UNIQUE,

    CONSTRAINT fk_record_request
        FOREIGN KEY (request_id) REFERENCES adoption_requests(request_id),

    CONSTRAINT fk_record_user
        FOREIGN KEY (user_id) REFERENCES users(user_id),

    CONSTRAINT fk_record_child
        FOREIGN KEY (child_id) REFERENCES children(child_id)
);

-- ==========================================
-- CHILD MEDICAL HISTORY
-- ==========================================

CREATE TABLE child_medical_history (
    medical_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    disease VARCHAR(100),
    allergy VARCHAR(100),
    treatment TEXT,
    doctor_name VARCHAR(100),

    CONSTRAINT fk_medical_child
        FOREIGN KEY (child_id) REFERENCES children(child_id)
);

-- ==========================================
-- VACCINATIONS
-- ==========================================

CREATE TABLE vaccinations (
    vaccination_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccine_date DATE,

    CONSTRAINT fk_vaccination_child
        FOREIGN KEY (child_id) REFERENCES children(child_id)
);

-- ==========================================
-- FEEDBACK
-- ==========================================

CREATE TABLE feedback (
    feedback_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_feedback_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ==========================================
-- CONTACT US
-- ==========================================

CREATE TABLE contact_us (
    contact_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SYSTEM SETTINGS (new, simple key/value store for "System Settings" screen)
-- ==========================================

CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- The API startup seeder creates/repairs the default super-admin.
-- Login: admin@cdac.org / Admin@123
