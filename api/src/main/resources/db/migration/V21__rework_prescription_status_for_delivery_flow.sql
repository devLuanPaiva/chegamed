CREATE TEMPORARY TABLE legacy_status_columns AS
SELECT
    table_schema,
    table_name,
    column_name,
    udt_schema AS enum_schema,
    udt_name AS enum_type,
    column_default
FROM information_schema.columns
WHERE udt_name IN ('prescription_status', 'prescription_item_status')
  AND table_schema NOT IN ('pg_catalog', 'information_schema');


DO $$
DECLARE
    target RECORD;
    converted_rows BIGINT;
    total_converted_rows BIGINT := 0;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM legacy_status_columns) THEN
        RAISE EXCEPTION 'V21: nenhuma coluna encontrada para os tipos prescription_status/prescription_item_status';
    END IF;

    FOR target IN SELECT * FROM legacy_status_columns LOOP
        EXECUTE format(
            'ALTER TABLE %I.%I ALTER COLUMN %I DROP DEFAULT',
            target.table_schema, target.table_name, target.column_name);

        EXECUTE format(
            'ALTER TABLE %I.%I ALTER COLUMN %I TYPE VARCHAR(30) USING %I::text',
            target.table_schema, target.table_name, target.column_name, target.column_name);

        EXECUTE format(
            'UPDATE %I.%I SET %I = CASE %I WHEN ''APPROVED'' THEN ''PENDING'' ELSE ''CANCELED'' END '
            || 'WHERE %I IN (''APPROVED'', ''REJECTED'')',
            target.table_schema, target.table_name, target.column_name,
            target.column_name, target.column_name);

        GET DIAGNOSTICS converted_rows = ROW_COUNT;
        total_converted_rows := total_converted_rows + converted_rows;

        RAISE NOTICE 'V21: %.%.% -> % linha(s) convertida(s) de APPROVED/REJECTED',
            target.table_schema, target.table_name, target.column_name, converted_rows;
    END LOOP;

    RAISE NOTICE 'V21: total de % linha(s) convertida(s)', total_converted_rows;
END $$;

DROP TYPE prescription_status;
DROP TYPE prescription_item_status;

CREATE TYPE prescription_status AS ENUM (
    'PENDING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'PARTIAL_DELIVERED',
    'CANCELED'
);

CREATE TYPE prescription_item_status AS ENUM (
    'PENDING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'PARTIAL_DELIVERED',
    'CANCELED'
);


DO $$
DECLARE
    target RECORD;
    restored_default TEXT;
BEGIN
    FOR target IN SELECT * FROM legacy_status_columns LOOP
        EXECUTE format(
            'ALTER TABLE %I.%I ALTER COLUMN %I TYPE %I.%I USING %I::%I.%I',
            target.table_schema, target.table_name, target.column_name,
            target.enum_schema, target.enum_type,
            target.column_name, target.enum_schema, target.enum_type);

        IF target.column_default IS NOT NULL THEN
            restored_default := replace(
                replace(target.column_default, 'APPROVED', 'PENDING'), 'REJECTED', 'CANCELED');

            EXECUTE format(
                'ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %s',
                target.table_schema, target.table_name, target.column_name, restored_default);

            RAISE NOTICE 'V21: default de %.%.% restaurado como %',
                target.table_schema, target.table_name, target.column_name, restored_default;
        END IF;
    END LOOP;
END $$;

DROP TABLE legacy_status_columns;

ALTER TABLE prescription_items
    ADD COLUMN out_for_delivery_at TIMESTAMP;

ALTER TABLE deliveries
    ADD COLUMN deliverer_id UUID;

ALTER TABLE deliveries
    ADD CONSTRAINT fk_deliveries_deliverer
        FOREIGN KEY (deliverer_id)
        REFERENCES users(id)
        ON DELETE SET NULL;

CREATE INDEX idx_prescription_items_status ON prescription_items (status);

CREATE INDEX idx_deliveries_deliverer ON deliveries (deliverer_id);
