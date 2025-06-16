import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { createUserProfileTables } from '../database/userProfileMigrations'

export function setupUserHandlers(userDb: Database.Database): void {
  console.log('Setting up user handlers...')

  // Run user profile migrations when setting up handlers
  createUserProfileTables(userDb)
  console.log('User profile tables created')

  // Handle save-username IPC event
  ipcMain.handle('save-username', (_event, username) => {
    try {
      const stmt = userDb.prepare('INSERT INTO users (username) VALUES (?)')
      const result = stmt.run(username)
      return { success: true, id: result.lastInsertRowid }
    } catch (error) {
      console.error('Error saving username:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Get users handler
  ipcMain.handle('get-users', () => {
    try {
      const stmt = userDb.prepare('SELECT * FROM users')
      const users = stmt.all()
      return { success: true, users }
    } catch (error) {
      console.error('Error fetching users:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred with DB Fetching' }
      }
    }
  })

  // Reset database handler
  ipcMain.handle('reset-database', () => {
    try {
      userDb.prepare('DELETE FROM users').run()
      userDb.prepare('DELETE FROM user_progress').run()
      userDb.prepare('DELETE FROM user_exercise_attempts').run()
      userDb.prepare('DELETE FROM user_daily_activity').run()
      return { success: true, message: 'Database reset successfully' }
    } catch (error) {
      console.error('Error resetting database:', error)
      return { success: false, error: 'Database reset was not successful' }
    }
  })

  // Update username handler
  ipcMain.handle('update-username', (_event, { userId, newUsername }) => {
    try {
      const stmt = userDb.prepare('UPDATE users SET username = ? WHERE id = ?')
      const result = stmt.run(newUsername, userId)

      if (result.changes > 0) {
        return { success: true, message: 'Username updated successfully' }
      } else {
        return { success: false, error: 'No user found with that ID' }
      }
    } catch (error) {
      console.error('Error updating username:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Record lesson completion
  ipcMain.handle('record-lesson-completion', (_event, { userId, lessonId, xpEarned }) => {
    try {
      const transaction = userDb.transaction(() => {
        // Insert lesson completion
        const progressStmt = userDb.prepare(`
          INSERT INTO user_progress (user_id, lesson_id, xp_earned) 
          VALUES (?, ?, ?)
        `)
        progressStmt.run(userId, lessonId, xpEarned)

        // Update daily activity
        const today = new Date().toISOString().split('T')[0]
        const activityStmt = userDb.prepare(`
          INSERT INTO user_daily_activity (user_id, date, xp_earned, lessons_completed)
          VALUES (?, ?, ?, 1)
          ON CONFLICT(user_id, date) DO UPDATE SET
            xp_earned = xp_earned + ?,
            lessons_completed = lessons_completed + 1
        `)
        activityStmt.run(userId, today, xpEarned, xpEarned)
      })

      transaction()
      return { success: true, message: 'Lesson completion recorded' }
    } catch (error) {
      console.error('Error recording lesson completion:', error)
      return { success: false, error: 'Failed to record lesson completion' }
    }
  })

  // Record exercise attempt
  ipcMain.handle(
    'record-exercise-attempt',
    (_event, { userId, exerciseId, score, totalQuestions }) => {
      try {
        const accuracy = (score / totalQuestions) * 100
        const xpEarned = Math.floor(accuracy / 10) // 1 XP per 10% accuracy

        const transaction = userDb.transaction(() => {
          // Insert exercise attempt
          const attemptStmt = userDb.prepare(`
          INSERT INTO user_exercise_attempts (user_id, exercise_id, score, total_questions, accuracy)
          VALUES (?, ?, ?, ?, ?)
        `)
          attemptStmt.run(userId, exerciseId, score, totalQuestions, accuracy)

          // Update daily activity
          const today = new Date().toISOString().split('T')[0]
          const activityStmt = userDb.prepare(`
          INSERT INTO user_daily_activity (user_id, date, xp_earned, exercises_completed)
          VALUES (?, ?, ?, 1)
          ON CONFLICT(user_id, date) DO UPDATE SET
            xp_earned = xp_earned + ?,
            exercises_completed = exercises_completed + 1
        `)
          activityStmt.run(userId, today, xpEarned, xpEarned)
        })

        transaction()
        return { success: true, message: 'Exercise attempt recorded', xpEarned, accuracy }
      } catch (error) {
        console.error('Error recording exercise attempt:', error)
        return { success: false, error: 'Failed to record exercise attempt' }
      }
    }
  )

  // Get user profile stats
  ipcMain.handle('get-user-profile', (_event, userId) => {
    try {
      // Get basic user info
      const userStmt = userDb.prepare('SELECT * FROM users WHERE id = ?')
      const user = userStmt.get(userId)

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      // Get total XP
      const xpStmt = userDb.prepare(`
        SELECT COALESCE(SUM(xp_earned), 0) as totalXp 
        FROM user_daily_activity 
        WHERE user_id = ?
      `)
      const { totalXp } = xpStmt.get(userId) as { totalXp: number }

      // Calculate level based on XP
      const level = calculateLevel(totalXp)
      const { currentLevelXp, nextLevelXp } = getLevelXpRange(level)

      // Get lessons completed
      const lessonsStmt = userDb.prepare(`
        SELECT COUNT(*) as lessonsCompleted 
        FROM user_progress 
        WHERE user_id = ?
      `)
      const { lessonsCompleted } = lessonsStmt.get(userId) as { lessonsCompleted: number }

      // Get average accuracy
      const accuracyStmt = userDb.prepare(`
        SELECT AVG(accuracy) as avgAccuracy 
        FROM user_exercise_attempts 
        WHERE user_id = ?
      `)
      const result = accuracyStmt.get(userId) as { avgAccuracy: number | null }
      const avgAccuracy = result.avgAccuracy || 0

      return {
        success: true,
        profile: {
          ...user,
          totalXp,
          level,
          currentLevelXp,
          nextLevelXp,
          xpToNextLevel: nextLevelXp - totalXp,
          lessonsCompleted,
          avgAccuracy: Math.round(avgAccuracy * 100) / 100
        }
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return { success: false, error: 'Failed to get user profile' }
    }
  })

  // Get user activity data for charts
  ipcMain.handle('get-user-activity', (_event, userId, days = 365) => {
    try {
      const stmt = userDb.prepare(`
        SELECT date, xp_earned, lessons_completed, exercises_completed
        FROM user_daily_activity 
        WHERE user_id = ? AND date >= date('now', '-${days} days')
        ORDER BY date ASC
      `)
      const activity = stmt.all(userId)

      return { success: true, activity }
    } catch (error) {
      console.error('Error getting user activity:', error)
      return { success: false, error: 'Failed to get user activity' }
    }
  })
}

// Helper functions for level calculation
function calculateLevel(totalXp: number): number {
  if (totalXp < 10) return 1

  let level = 1
  const xpRequired = 10

  // Level 1: 10 XP
  if (totalXp >= xpRequired) {
    level = 2
    let remainingXp = totalXp - xpRequired

    // Levels 2-5: 50 XP each
    const level2to5Xp = Math.min(remainingXp, 200) // 4 levels * 50 XP
    level += Math.floor(level2to5Xp / 50)
    remainingXp -= level2to5Xp

    // Level 6+: 100 XP each
    if (remainingXp > 0) {
      level += Math.floor(remainingXp / 100)
    }
  }

  return level
}

function getLevelXpRange(level: number): { currentLevelXp: number; nextLevelXp: number } {
  if (level === 1) {
    return { currentLevelXp: 0, nextLevelXp: 10 }
  }

  let currentLevelXp = 10 // Level 1 requirement

  if (level <= 5) {
    // Levels 2-5
    currentLevelXp += (level - 2) * 50
    const nextLevelXp = level === 5 ? currentLevelXp + 100 : currentLevelXp + 50
    return { currentLevelXp, nextLevelXp }
  } else {
    // Level 6+
    currentLevelXp += 200 // Levels 2-5 total (4 * 50)
    currentLevelXp += (level - 6) * 100
    return { currentLevelXp, nextLevelXp: currentLevelXp + 100 }
  }
}

export function shouldShowSetup(userDb: Database.Database): boolean {
  try {
    const stmt = userDb.prepare('SELECT COUNT(*) as count FROM users')
    const result = stmt.get() as { count: number }
    console.log('User count in database:', result.count)
    return result.count === 0
  } catch (error) {
    console.error('Error checking if setup is needed:', error)
    return true // Default to showing setup if there's an error
  }
}
