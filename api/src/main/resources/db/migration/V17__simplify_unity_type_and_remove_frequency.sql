
UPDATE prescription_items SET unity_type = 'BOTTLE' WHERE unity_type::text NOT IN ('BOTTLE');

ALTER TYPE unity_type RENAME TO unity_type_old;

CREATE TYPE unity_type AS ENUM (
    'BOTTLE',
    'CREAM',
    'LIQUID'
);

ALTER TABLE prescription_items
    ALTER COLUMN unity_type TYPE unity_type USING unity_type::text::unity_type;

DROP TYPE unity_type_old;

ALTER TABLE prescription_items
    DROP COLUMN frequency,
    DROP COLUMN frequency_type;

DROP TYPE frequency_type;
