UPDATE prescription_items SET treatment_type = 'CONTINUOUS' WHERE treatment_type = 'LONG_TERM';

ALTER TYPE treatment_type RENAME TO treatment_type_old;

CREATE TYPE treatment_type AS ENUM (
    'CONTINUOUS',
    'SHORT_TERM'
);

ALTER TABLE prescription_items
    ALTER COLUMN treatment_type TYPE treatment_type USING treatment_type::text::treatment_type;

DROP TYPE treatment_type_old;
