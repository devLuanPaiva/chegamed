ALTER TABLE patient_registration_requests
    ADD COLUMN requested_by_user_id UUID REFERENCES users(id);

ALTER TABLE patient_registration_requests ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE patient_registration_requests
    ADD CONSTRAINT ck_patient_registration_requests_credentials
    CHECK (password_hash IS NOT NULL OR requested_by_user_id IS NOT NULL);

CREATE UNIQUE INDEX uk_patient_registration_requests_pending_requester
    ON patient_registration_requests (requested_by_user_id) WHERE status = 'PENDING';
