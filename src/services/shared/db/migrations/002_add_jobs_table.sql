
CREATE TABLE scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,  -- e.g., 'price_tracking'
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    status VARCHAR(10) NOT NULL DEFAULT 'idle',
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('idle', 'running', 'failed')),
    CONSTRAINT valid_retry_count CHECK (retry_count >= 0)
);

CREATE TRIGGER update_jobs_timestamp
    BEFORE UPDATE ON scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_jobs_status_next_run ON scheduled_jobs(status, next_run)
WHERE status = 'idle';