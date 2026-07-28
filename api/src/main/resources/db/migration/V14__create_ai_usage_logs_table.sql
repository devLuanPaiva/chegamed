CREATE TYPE ai_usage_operation_type AS ENUM (
    'ESUS_PRESCRIPTION_EXTRACTION',
    'DIGITALIZED_PRESCRIPTION_EXTRACTION',
    'BARCODE_EXTRACTION',
    'MEDICINE_NAME_EXTRACTION'
);

CREATE TYPE ai_usage_content_type AS ENUM (
    'IMAGE',
    'CHAT_MESSAGE'
);

CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    model VARCHAR(60) NOT NULL,
    operation_type ai_usage_operation_type NOT NULL,
    content_type ai_usage_content_type NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    candidates_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    estimated_cost_usd NUMERIC(12, 6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs (created_at);
CREATE INDEX idx_ai_usage_logs_model ON ai_usage_logs (model);
CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs (user_id);
