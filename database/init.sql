-- Sudan National Digital Identity System (SGDUS)
-- Local/dev PostgreSQL schema bootstrap (used by docker-compose.yml)
-- Derived from: sudan.md (infrastructure/database/schema.sql)

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- OID Counters Table
CREATE TABLE IF NOT EXISTS oid_counters (
    type INTEGER NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    counter INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (type, state_code)
);

-- OID Registry Table
CREATE TABLE IF NOT EXISTS oid_registry (
    oid VARCHAR(255) PRIMARY KEY,
    type INTEGER NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_oid_type ON oid_registry (type);
CREATE INDEX IF NOT EXISTS idx_oid_state ON oid_registry (state_code);
CREATE INDEX IF NOT EXISTS idx_oid_status ON oid_registry (status);
CREATE INDEX IF NOT EXISTS idx_oid_entity ON oid_registry (entity_id);
CREATE INDEX IF NOT EXISTS idx_oid_created ON oid_registry (created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_oid_type_state_entity_unique ON oid_registry (type, state_code, entity_id);

-- Citizens Table (Sudanese Context)
CREATE TABLE IF NOT EXISTS citizens (
    id SERIAL PRIMARY KEY,
    oid VARCHAR(255) UNIQUE NOT NULL REFERENCES oid_registry(oid),
    national_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    address TEXT NOT NULL,
    biometric_hash VARCHAR(255),
    state_code VARCHAR(2) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_citizens_national_id ON citizens (national_id);
CREATE INDEX IF NOT EXISTS idx_citizens_oid ON citizens (oid);
CREATE INDEX IF NOT EXISTS idx_citizens_state ON citizens (state_code);
CREATE INDEX IF NOT EXISTS idx_citizens_status ON citizens (status);
CREATE INDEX IF NOT EXISTS idx_citizens_created ON citizens (created_at);
CREATE INDEX IF NOT EXISTS idx_citizens_name ON citizens (first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_citizens_phone ON citizens (phone_number);
CREATE INDEX IF NOT EXISTS idx_citizens_email ON citizens (email);

-- Businesses Table (Sudanese Context)
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    oid VARCHAR(255) UNIQUE NOT NULL REFERENCES oid_registry(oid),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    owner_oid VARCHAR(255) NOT NULL REFERENCES citizens(oid),
    tax_id VARCHAR(50),
    address TEXT NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    state_code VARCHAR(2) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_businesses_registration ON businesses (registration_number);
CREATE INDEX IF NOT EXISTS idx_businesses_oid ON businesses (oid);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses (owner_oid);
CREATE INDEX IF NOT EXISTS idx_businesses_state ON businesses (state_code);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses (status);
CREATE INDEX IF NOT EXISTS idx_businesses_created ON businesses (created_at);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses (business_name);

-- Family Relationships Table
CREATE TABLE IF NOT EXISTS family_relationships (
    id SERIAL PRIMARY KEY,
    citizen_oid VARCHAR(255) NOT NULL REFERENCES citizens(oid),
    relationship_type VARCHAR(50) NOT NULL,
    related_citizen_oid VARCHAR(255) NOT NULL REFERENCES citizens(oid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(citizen_oid, related_citizen_oid, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_family_citizen ON family_relationships (citizen_oid);
CREATE INDEX IF NOT EXISTS idx_family_related ON family_relationships (related_citizen_oid);
CREATE INDEX IF NOT EXISTS idx_family_type ON family_relationships (relationship_type);

-- Audit Logs Table (for compliance and tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    event VARCHAR(100) NOT NULL,
    user_oid VARCHAR(255),
    entity_oid VARCHAR(255),
    entity_type VARCHAR(50),
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_logs (event);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (user_oid);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_oid);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at);

-- Agency Integration Logs Table
CREATE TABLE IF NOT EXISTS agency_integration_logs (
    id SERIAL PRIMARY KEY,
    agency_name VARCHAR(100) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    entity_oid VARCHAR(255),
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agency_name ON agency_integration_logs (agency_name);
CREATE INDEX IF NOT EXISTS idx_agency_operation ON agency_integration_logs (operation);
CREATE INDEX IF NOT EXISTS idx_agency_status ON agency_integration_logs (status);
CREATE INDEX IF NOT EXISTS idx_agency_created ON agency_integration_logs (created_at);

-- USSD Sessions Table (for USSD service)
CREATE TABLE IF NOT EXISTS ussd_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    state VARCHAR(50) NOT NULL,
    step INTEGER DEFAULT 0,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ussd_session ON ussd_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_ussd_phone ON ussd_sessions (phone_number);
CREATE INDEX IF NOT EXISTS idx_ussd_state ON ussd_sessions (state);
CREATE INDEX IF NOT EXISTS idx_ussd_created ON ussd_sessions (created_at);

-- Data Quality Rules Table
CREATE TABLE IF NOT EXISTS data_quality_rules (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    column_name VARCHAR(50) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    rule_value JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_table ON data_quality_rules (table_name);
CREATE INDEX IF NOT EXISTS idx_quality_column ON data_quality_rules (column_name);

-- Insert sample data quality rules for Sudanese context
INSERT INTO data_quality_rules (table_name, column_name, rule_type, rule_value, error_message) VALUES
('citizens', 'national_id', 'regex', '{"pattern": "^\\\\d{10}$"}', 'National ID must be 10 digits'),
('citizens', 'phone_number', 'regex', '{"pattern": "^\\\\+249\\\\d{9}$"}', 'Phone must start with +249 and have 9 digits'),
('businesses', 'registration_number', 'regex', '{"pattern": "^SD-[A-Z0-9]{5}$"}', 'Registration must be SD-XXXXX format'),
('citizens', 'date_of_birth', 'range', jsonb_build_object('min', '1900-01-01', 'max', to_char(CURRENT_DATE, 'YYYY-MM-DD')), 'Date of birth must be between 1900 and today'),
('citizens', 'national_id', 'unique', '{}', 'National ID already exists'),
('businesses', 'registration_number', 'unique', '{}', 'Registration number already exists');

-- Views for reporting
CREATE OR REPLACE VIEW citizen_summary AS
SELECT
    state_code,
    COUNT(*) as total_citizens,
    COUNT(CASE WHEN gender = 'M' THEN 1 END) as males,
    COUNT(CASE WHEN gender = 'F' THEN 1 END) as females,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_citizens,
    MIN(created_at) as earliest_registration,
    MAX(created_at) as latest_registration
FROM citizens
GROUP BY state_code;

CREATE OR REPLACE VIEW business_summary AS
SELECT
    state_code,
    business_type,
    COUNT(*) as total_businesses,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_businesses,
    MIN(created_at) as earliest_registration,
    MAX(created_at) as latest_registration
FROM businesses
GROUP BY state_code, business_type;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_oid_registry_updated_at ON oid_registry;
CREATE TRIGGER update_oid_registry_updated_at BEFORE UPDATE ON oid_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_citizens_updated_at ON citizens;
CREATE TRIGGER update_citizens_updated_at BEFORE UPDATE ON citizens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ussd_sessions_updated_at ON ussd_sessions;
CREATE TRIGGER update_ussd_sessions_updated_at BEFORE UPDATE ON ussd_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique OID (alternative to microservice)
CREATE OR REPLACE FUNCTION generate_oid(type INTEGER, state_code VARCHAR(2), entity_id VARCHAR(100))
RETURNS VARCHAR AS $$
DECLARE
    current_counter INTEGER;
    new_oid VARCHAR(255);
BEGIN
    -- Get current counter
    SELECT counter INTO current_counter
    FROM oid_counters
    WHERE oid_counters.type = generate_oid.type AND oid_counters.state_code = generate_oid.state_code;

    IF current_counter IS NULL THEN
        current_counter := 1;
        INSERT INTO oid_counters (type, state_code, counter)
        VALUES (type, state_code, current_counter);
    ELSE
        current_counter := current_counter + 1;
        UPDATE oid_counters
        SET counter = current_counter,
            updated_at = CURRENT_TIMESTAMP
        WHERE oid_counters.type = generate_oid.type AND oid_counters.state_code = generate_oid.state_code;
    END IF;

    -- Generate OID: 1.3.6.1.4.1.61026.[type].[state_code].[counter]
    new_oid := '1.3.6.1.4.1.61026.' || type || '.' || state_code || '.' || LPAD(current_counter::TEXT, 8, '0');

    -- Insert into registry
    INSERT INTO oid_registry (oid, type, state_code, entity_id)
    VALUES (new_oid, type, state_code, entity_id);

    RETURN new_oid;
END;
$$ LANGUAGE plpgsql;

-- Function to check data quality
CREATE OR REPLACE FUNCTION check_data_quality(table_name TEXT, column_name TEXT, value TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rule RECORD;
    is_valid BOOLEAN := TRUE;
BEGIN
    FOR rule IN
        SELECT * FROM data_quality_rules
        WHERE data_quality_rules.table_name = check_data_quality.table_name
        AND data_quality_rules.column_name = check_data_quality.column_name
    LOOP
        CASE rule.rule_type
            WHEN 'regex' THEN
                IF NOT (value ~ (rule.rule_value->>'pattern')) THEN
                    is_valid := FALSE;
                END IF;
            WHEN 'range' THEN
                IF rule.rule_value->>'min' IS NOT NULL AND value < (rule.rule_value->>'min') THEN
                    is_valid := FALSE;
                END IF;
                IF rule.rule_value->>'max' IS NOT NULL AND value > (rule.rule_value->>'max') THEN
                    is_valid := FALSE;
                END IF;
            ELSE
                NULL;
        END CASE;
    END LOOP;

    RETURN is_valid;
END;
$$ LANGUAGE plpgsql;


-- User Credentials Table (added for identity service)
CREATE TABLE IF NOT EXISTS user_credentials (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credentials_user ON user_credentials (user_id);

-- ============================================================================
-- Integrated Automated Modules & Domain Systems (sudan.md)
-- ============================================================================

-- Fraud Detection Logs
CREATE TABLE IF NOT EXISTS fraud_logs (
    id UUID PRIMARY KEY,
    record_id TEXT,
    input_data JSONB,
    context JSONB,
    detection_result JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fraud_timestamp ON fraud_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_fraud_record_id ON fraud_logs (record_id);

-- Reporting & Analytics
CREATE TABLE IF NOT EXISTS report_audits (
    id UUID PRIMARY KEY,
    report_type TEXT NOT NULL,
    filters JSONB,
    format TEXT,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_type ON report_audits (report_type);
CREATE INDEX IF NOT EXISTS idx_report_generated_at ON report_audits (generated_at);

CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY,
    report_type TEXT NOT NULL,
    filters JSONB,
    schedule JSONB NOT NULL,
    recipients JSONB,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_schedules_status ON report_schedules (status);
CREATE INDEX IF NOT EXISTS idx_report_schedules_created_at ON report_schedules (created_at);

-- Compliance Reports
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY,
    entity_type TEXT NOT NULL,
    compliance_score NUMERIC(5,4) NOT NULL,
    compliance_level TEXT NOT NULL,
    report JSONB,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compliance_entity_type ON compliance_reports (entity_type);
CREATE INDEX IF NOT EXISTS idx_compliance_generated_at ON compliance_reports (generated_at);
CREATE INDEX IF NOT EXISTS idx_compliance_level ON compliance_reports (compliance_level);

-- Backup & Recovery
CREATE TABLE IF NOT EXISTS backup_metadata (
    backup_id UUID PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    options JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backup_status ON backup_metadata (status);
CREATE INDEX IF NOT EXISTS idx_backup_created_at ON backup_metadata (created_at);

CREATE TABLE IF NOT EXISTS backup_history (
    id UUID PRIMARY KEY,
    backup_id UUID NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backup_history_backup_id ON backup_history (backup_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_timestamp ON backup_history (timestamp);

CREATE TABLE IF NOT EXISTS restore_history (
    id UUID PRIMARY KEY,
    backup_id UUID NOT NULL,
    status TEXT NOT NULL,
    options JSONB,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_restore_backup_id ON restore_history (backup_id);
CREATE INDEX IF NOT EXISTS idx_restore_started_at ON restore_history (started_at);

CREATE TABLE IF NOT EXISTS disaster_recovery_tests (
    id UUID PRIMARY KEY,
    test_type TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dr_tests_started_at ON disaster_recovery_tests (started_at);
CREATE INDEX IF NOT EXISTS idx_dr_tests_status ON disaster_recovery_tests (status);

-- Notification System
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_oid TEXT PRIMARY KEY,
    preferences JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    channel TEXT,
    payload JSONB,
    options JSONB,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_recipient ON notification_logs (recipient);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notification_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_notification_event_type ON notification_logs (event_type);

-- Access Control & RBAC
CREATE TABLE IF NOT EXISTS access_roles (
    role_name TEXT PRIMARY KEY,
    role_config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_oid TEXT NOT NULL,
    role_name TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    revoked_by TEXT,
    PRIMARY KEY (user_oid, role_name)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles (user_oid);
CREATE INDEX IF NOT EXISTS idx_user_roles_revoked ON user_roles (revoked_at);

CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY,
    user_oid TEXT NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    granted BOOLEAN NOT NULL,
    reason TEXT,
    context JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs (user_oid);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_granted ON access_logs (granted);

-- Integration Orchestrator
CREATE TABLE IF NOT EXISTS integration_executions (
    id UUID PRIMARY KEY,
    integration TEXT NOT NULL,
    action TEXT NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_integration_executions_integration ON integration_executions (integration);
CREATE INDEX IF NOT EXISTS idx_integration_executions_started_at ON integration_executions (started_at);

-- Performance Monitoring
CREATE TABLE IF NOT EXISTS api_metrics (
    id UUID PRIMARY KEY,
    service TEXT NOT NULL,
    path TEXT NOT NULL,
    status INTEGER NOT NULL,
    response_time DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_metrics_service ON api_metrics (service);
CREATE INDEX IF NOT EXISTS idx_api_metrics_timestamp ON api_metrics (timestamp);

CREATE TABLE IF NOT EXISTS health_checks (
    id UUID PRIMARY KEY,
    service TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks (service);
CREATE INDEX IF NOT EXISTS idx_health_checks_timestamp ON health_checks (timestamp);

-- Nile Water Management
CREATE TABLE IF NOT EXISTS water_allocations (
    id UUID PRIMARY KEY,
    farmer_oid TEXT NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    allocation_data JSONB NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_water_allocations_farmer ON water_allocations (farmer_oid);
CREATE INDEX IF NOT EXISTS idx_water_allocations_state ON water_allocations (state_code);
CREATE INDEX IF NOT EXISTS idx_water_allocations_calculated_at ON water_allocations (calculated_at);

CREATE TABLE IF NOT EXISTS nile_monitoring (
    id UUID PRIMARY KEY,
    station_id TEXT NOT NULL,
    reading JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nile_monitoring_station ON nile_monitoring (station_id);
CREATE INDEX IF NOT EXISTS idx_nile_monitoring_timestamp ON nile_monitoring (timestamp);

CREATE TABLE IF NOT EXISTS irrigation_alerts (
    id UUID PRIMARY KEY,
    farmer_oid TEXT,
    urgency TEXT,
    message TEXT,
    data JSONB,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_irrigation_alerts_farmer ON irrigation_alerts (farmer_oid);
CREATE INDEX IF NOT EXISTS idx_irrigation_alerts_sent_at ON irrigation_alerts (sent_at);

-- Farming & Agriculture
CREATE TABLE IF NOT EXISTS agricultural_plans (
    id UUID PRIMARY KEY,
    farmer_oid TEXT NOT NULL,
    plan_data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agricultural_plans_farmer ON agricultural_plans (farmer_oid);
CREATE INDEX IF NOT EXISTS idx_agricultural_plans_generated_at ON agricultural_plans (generated_at);

CREATE TABLE IF NOT EXISTS agri_market_prices (
    id UUID PRIMARY KEY,
    state_code VARCHAR(2) NOT NULL,
    commodity TEXT NOT NULL,
    price NUMERIC(12,4) NOT NULL,
    unit TEXT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agri_market_state ON agri_market_prices (state_code);
CREATE INDEX IF NOT EXISTS idx_agri_market_recorded_at ON agri_market_prices (recorded_at);

-- Gold & Treasures
CREATE TABLE IF NOT EXISTS mining_licenses (
    id UUID PRIMARY KEY,
    resource_type TEXT NOT NULL,
    zone_code TEXT NOT NULL,
    company_info JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    revoked_at TIMESTAMPTZ,
    revoked_by TEXT,
    revoke_reason TEXT,
    license_code TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mining_licenses_resource ON mining_licenses (resource_type);
CREATE INDEX IF NOT EXISTS idx_mining_licenses_issued_at ON mining_licenses (issued_at);
CREATE INDEX IF NOT EXISTS idx_mining_licenses_approved ON mining_licenses (approved);

-- Backwards-compatible schema upgrades (in case the DB already existed).
ALTER TABLE mining_licenses ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE mining_licenses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE mining_licenses ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE mining_licenses ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE mining_licenses ADD COLUMN IF NOT EXISTS revoked_by TEXT;
ALTER TABLE mining_licenses ADD COLUMN IF NOT EXISTS revoke_reason TEXT;
ALTER TABLE mining_licenses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE mining_licenses ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE mining_licenses ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

UPDATE mining_licenses
SET status = CASE WHEN approved = true THEN 'active' ELSE 'pending' END
WHERE status IS NULL;

UPDATE mining_licenses
SET approved_at = COALESCE(approved_at, issued_at)
WHERE approved = true;

UPDATE mining_licenses
SET updated_at = COALESCE(updated_at, issued_at)
WHERE updated_at IS NULL;

ALTER TABLE mining_licenses ALTER COLUMN status SET NOT NULL;
ALTER TABLE mining_licenses ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mining_licenses_status ON mining_licenses (status);

CREATE TABLE IF NOT EXISTS resource_exports (
    id UUID PRIMARY KEY,
    resource_type TEXT NOT NULL,
    quantity NUMERIC(12,4) NOT NULL,
    quality JSONB,
    destination TEXT NOT NULL,
    company_license TEXT NOT NULL,
    exported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resource_exports_type ON resource_exports (resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_exports_exported_at ON resource_exports (exported_at);

CREATE TABLE IF NOT EXISTS resource_production (
    id UUID PRIMARY KEY,
    resource_type TEXT NOT NULL,
    quantity NUMERIC(12,4) NOT NULL,
    metadata JSONB,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resource_production_type ON resource_production (resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_production_recorded_at ON resource_production (recorded_at);

CREATE TABLE IF NOT EXISTS resource_prices (
    id UUID PRIMARY KEY,
    resource_type TEXT NOT NULL,
    price NUMERIC(12,4) NOT NULL,
    currency TEXT,
    unit TEXT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resource_prices_type ON resource_prices (resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_prices_recorded_at ON resource_prices (recorded_at);

-- Red Sea & Ports
CREATE TABLE IF NOT EXISTS vessel_schedules (
    id UUID PRIMARY KEY,
    port_code TEXT NOT NULL,
    vessel_info JSONB,
    cargo_details JSONB,
    arrival_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vessel_schedules_port ON vessel_schedules (port_code);
CREATE INDEX IF NOT EXISTS idx_vessel_schedules_scheduled_at ON vessel_schedules (scheduled_at);

CREATE TABLE IF NOT EXISTS customs_clearances (
    id UUID PRIMARY KEY,
    schedule_id UUID NOT NULL,
    documents JSONB,
    duties JSONB,
    cleared BOOLEAN DEFAULT FALSE,
    clearance_time INTEGER,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customs_schedule ON customs_clearances (schedule_id);
CREATE INDEX IF NOT EXISTS idx_customs_issued_at ON customs_clearances (issued_at);

CREATE TABLE IF NOT EXISTS port_status (
    id UUID PRIMARY KEY,
    port_code TEXT NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    capacity JSONB,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_port_status_port_code ON port_status (port_code);
CREATE INDEX IF NOT EXISTS idx_port_status_updated_at ON port_status (updated_at);

-- Education
CREATE TABLE IF NOT EXISTS student_registry (
    id UUID PRIMARY KEY,
    student_oid TEXT UNIQUE,
    state_code VARCHAR(2),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school_registry (
    id UUID PRIMARY KEY,
    school_code TEXT UNIQUE NOT NULL,
    state_code VARCHAR(2),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_plans (
    id UUID PRIMARY KEY,
    student_oid TEXT NOT NULL,
    plan_data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_education_plans_student ON education_plans (student_oid);
CREATE INDEX IF NOT EXISTS idx_education_plans_generated_at ON education_plans (generated_at);

-- Healthcare
CREATE TABLE IF NOT EXISTS health_facilities (
    id UUID PRIMARY KEY,
    facility_code TEXT UNIQUE NOT NULL,
    state_code VARCHAR(2),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_alerts (
    id UUID PRIMARY KEY,
    state_code VARCHAR(2),
    alert_type TEXT,
    message TEXT,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_alerts_created_at ON health_alerts (created_at);
CREATE INDEX IF NOT EXISTS idx_health_alerts_state_code ON health_alerts (state_code);

CREATE TABLE IF NOT EXISTS healthcare_plans (
    id UUID PRIMARY KEY,
    patient_oid TEXT NOT NULL,
    plan_data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_healthcare_plans_patient ON healthcare_plans (patient_oid);
CREATE INDEX IF NOT EXISTS idx_healthcare_plans_generated_at ON healthcare_plans (generated_at);
