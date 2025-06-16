import Database from 'better-sqlite3'

export function createUserProfileTables(userDb: Database.Database): void {
  try {
    // Create user_progress table
    userDb.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        xp_earned INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    // Create user_exercise_attempts table
    userDb.exec(`
      CREATE TABLE IF NOT EXISTS user_exercise_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    // Create user_daily_activity table
    userDb.exec(`
      CREATE TABLE IF NOT EXISTS user_daily_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date DATE NOT NULL,
        xp_earned INTEGER DEFAULT 0,
        lessons_completed INTEGER DEFAULT 0,
        exercises_completed INTEGER DEFAULT 0,
        UNIQUE(user_id, date),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    // Add indexes for better performance
    userDb.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_exercise_attempts_user_id ON user_exercise_attempts (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_daily_activity_user_date ON user_daily_activity (user_id, date);
    `)

    console.log('User profile tables created successfully')
  } catch (error) {
    console.error('Error creating user profile tables:', error)
    throw error
  }
}
