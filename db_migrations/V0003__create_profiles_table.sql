CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE news ADD COLUMN IF NOT EXISTS author_id VARCHAR(100);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS author_id VARCHAR(100);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_news_author_id ON news(author_id);
CREATE INDEX idx_messages_author_id ON messages(author_id);