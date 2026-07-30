USE child_adoption_system;

-- Run only when upgrading an older database that does not yet contain these columns.
ALTER TABLE children
    ADD COLUMN IF NOT EXISTS health_status VARCHAR(255) NULL AFTER medical_notes,
    ADD COLUMN IF NOT EXISTS admission_date DATE NULL AFTER profile_photo;

UPDATE children
SET admission_date = DATE(created_at)
WHERE admission_date IS NULL;
