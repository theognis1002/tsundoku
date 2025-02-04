CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    content BYTEA NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
); 