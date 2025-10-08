CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_name VARCHAR(100) DEFAULT 'Аноним'
);

CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);