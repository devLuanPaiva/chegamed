CREATE TYPE patient_registration_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE patient_registration_requests (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    name VARCHAR(120) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    birth_date DATE NOT NULL,
    contact VARCHAR(20),
    address VARCHAR(255),
    email VARCHAR(180) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status patient_registration_request_status NOT NULL DEFAULT 'PENDING',
    reviewed_by_user_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uk_patient_registration_requests_pending_cpf
    ON patient_registration_requests (company_id, cpf) WHERE status = 'PENDING';

CREATE INDEX idx_patient_registration_requests_company_status
    ON patient_registration_requests (company_id, status);
