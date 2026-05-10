-- 数据库表结构设计

-- 用户表 (单用户系统，但为了扩展性)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT DEFAULT 'User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 练习进度表
CREATE TABLE IF NOT EXISTS practice_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    practice_id TEXT NOT NULL,
    attempts_made INTEGER DEFAULT 0,
    attempts_required INTEGER NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, practice_id)
);

-- 事件表
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    practice_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    situation TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 感受表
CREATE TABLE IF NOT EXISTS feelings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    released BOOLEAN DEFAULT 0,
    feeling_good BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 释放记录表
CREATE TABLE IF NOT EXISTS release_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    feeling_name TEXT NOT NULL,
    intensity INTEGER DEFAULT 5,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 插入默认用户
INSERT OR IGNORE INTO users (id, name) VALUES (1, 'User');

-- 索引
CREATE INDEX IF NOT EXISTS idx_practice_progress_user_practice ON practice_progress(user_id, practice_id);
CREATE INDEX IF NOT EXISTS idx_events_practice_exercise ON events(practice_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_feelings_event ON feelings(event_id);