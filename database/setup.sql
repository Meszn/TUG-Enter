CREATE USER tug_user WITH ENCRYPTED PASSWORD 'tug_password';
CREATE DATABASE tug_enter OWNER tug_user;
GRANT ALL PRIVILEGES ON DATABASE tug_enter TO tug_user;

\c tug_enter

CREATE TABLE IF NOT EXISTS projects (
    id           SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    purpose      TEXT         NOT NULL,
    responsible  VARCHAR(200) NOT NULL,
    start_date   DATE,
    telescope    VARCHAR(100),
    image_path   VARCHAR(500),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_name    ON projects (project_name);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects (created_at DESC);