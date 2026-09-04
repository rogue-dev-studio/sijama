CREATE TABLE konfigdokumen_k (
    konfigdokumen_id SERIAL NOT NULL,
    lookup_id INTEGER,
    additional_data TEXT,
    created_date TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT (('now'::text)::date),
    created_by INTEGER,
    modified_count INTEGER,
    last_modified_date TIMESTAMP(6) WITHOUT TIME ZONE,
    last_modified_by INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_date TIMESTAMP(6) WITHOUT TIME ZONE,
    deleted_by INTEGER,
    header TEXT,
    header_detail TEXT,
    footer TEXT,
    footer_detail TEXT,
    path_logo_kiri VARCHAR(500),
    path_logo_kanan VARCHAR(500),
    layout_mode VARCHAR(20) NOT NULL DEFAULT 'kop_ganda',
    header_style JSONB,
    paper_size VARCHAR(20) NOT NULL DEFAULT 'a4',
    paper_orientation VARCHAR(20) NOT NULL DEFAULT 'portrait',
    apply_pdf BOOLEAN NOT NULL DEFAULT TRUE,
    apply_excel BOOLEAN NOT NULL DEFAULT TRUE,
    apply_csv BOOLEAN NOT NULL DEFAULT FALSE,
    show_print_date BOOLEAN NOT NULL DEFAULT TRUE,
    print_date_label VARCHAR(120) DEFAULT 'Dicetak',
    show_print_row_count BOOLEAN NOT NULL DEFAULT TRUE,
    show_generated_by BOOLEAN NOT NULL DEFAULT TRUE,
    column_visibility JSONB,
    show_user_signature BOOLEAN NOT NULL DEFAULT FALSE,
    show_user_name BOOLEAN NOT NULL DEFAULT FALSE,
    show_user_phone BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_konfigdokumen_k PRIMARY KEY (konfigdokumen_id),
    CONSTRAINT fk_konfigdokumen_k_lookup
        FOREIGN KEY (lookup_id) REFERENCES lookup_m (lookup_id)
);

CREATE INDEX idx_konfigdokumen_k_active ON konfigdokumen_k (is_active, is_deleted);
CREATE UNIQUE INDEX uq_konfigdokumen_k_lookup_id
    ON konfigdokumen_k (lookup_id) WHERE lookup_id IS NOT NULL AND is_deleted = false;
