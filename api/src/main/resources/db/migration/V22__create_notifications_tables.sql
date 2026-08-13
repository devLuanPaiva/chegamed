CREATE TYPE notification_type AS ENUM (
    'DELIVERY_DISPATCHED',
    'DELIVERY_ON_THE_WAY',
    'DELIVERY_COMPLETED',
    'PRESCRIPTION_ITEM_CANCELED'
);

CREATE TYPE device_platform AS ENUM (
    'ANDROID',
    'IOS',
    'WEB'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_id UUID NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(120) NOT NULL,
    body VARCHAR(400) NOT NULL,
    prescription_item_id UUID,
    delivery_id UUID,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_prescription_item
        FOREIGN KEY (prescription_item_id)
        REFERENCES prescription_items(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_delivery
        FOREIGN KEY (delivery_id)
        REFERENCES deliveries(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_notifications_recipient_created_at
    ON notifications (recipient_id, created_at DESC);

CREATE INDEX idx_notifications_recipient_unread
    ON notifications (recipient_id)
    WHERE read_at IS NULL;

CREATE TABLE device_push_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL,
    platform device_platform NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_device_push_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_device_push_tokens_token
        UNIQUE (token)
);

CREATE INDEX idx_device_push_tokens_user ON device_push_tokens (user_id);
