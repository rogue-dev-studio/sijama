CREATE TABLE lookup_m (
    lookup_id SERIAL NOT NULL,
    lookup_type VARCHAR(100) NOT NULL,
    lookup_name VARCHAR(200),
    lookup_value VARCHAR(200),
    lookup_urutan INTEGER,
    lookup_kode VARCHAR(50),
    additional_data TEXT,
    created_date TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT (('now'::text)::date),
    created_by INTEGER,
    modified_count INTEGER,
    last_modified_date TIMESTAMP(6) WITHOUT TIME ZONE,
    last_modified_by INTEGER,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_date TIMESTAMP(6) WITHOUT TIME ZONE,
    deleted_by INTEGER,
    CONSTRAINT pk_lookup_m PRIMARY KEY (lookup_id)
);

CREATE INDEX idx_lookup_type_text ON lookup_m USING btree ((lookup_type::text));
