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
  ipcMain.handle(
    'record-lesson-completion',
    (
      _event,
      { userId, lessonId, xpEarned, videoProgress, quizProgress, overallProgress, completed }
    ) => {
      try {
        // Check if lesson is already completed for this user
        const existingProgressStmt = userDb.prepare(
          'SELECT completed FROM user_progress WHERE user_id = ? AND lesson_id = ?'
        )
        const existing = existingProgressStmt.get(userId, lessonId) as
          | { completed: number }
          | undefined
        let awardXp = false
        let xpToAward = 0
        let markCompleted = completed
        if (!existing) {
          // No record yet, so award XP if completed
          awardXp = completed === 1
          xpToAward = awardXp ? xpEarned : 0
        } else if (
          typeof existing.completed === 'number' &&
          existing.completed !== 1 &&
          completed === 1
        ) {
          // Was not completed before, now completed
          awardXp = true
          xpToAward = xpEarned
        } else {
          // Already completed, do not award XP again
          xpToAward = 0
          markCompleted = existing.completed // keep as already completed
        }

        const transaction = userDb.transaction(() => {
          const progressStmt = userDb.prepare(`
          INSERT INTO user_progress (user_id, lesson_id, xp_earned, completed, last_accessed, video_progress, quiz_progress, overall_progress)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)
          ON CONFLICT(user_id, lesson_id) DO UPDATE SET
            xp_earned = CASE WHEN user_progress.completed = 1 THEN user_progress.xp_earned ELSE excluded.xp_earned END,
            completed = MAX(user_progress.completed, excluded.completed),
            last_accessed = CURRENT_TIMESTAMP,
            video_progress = MAX(user_progress.video_progress, excluded.video_progress),
            quiz_progress = MAX(user_progress.quiz_progress, excluded.quiz_progress),
            overall_progress = MAX(user_progress.overall_progress, excluded.overall_progress)
        `)
          progressStmt.run(
            userId,
            lessonId,
            xpToAward,
            markCompleted,
            videoProgress,
            quizProgress,
            overallProgress
          )

          // Only update daily activity if XP is awarded (first completion)
          if (awardXp && xpToAward > 0) {
            const today = new Date().toISOString().split('T')[0]
            const activityStmt = userDb.prepare(`
            INSERT INTO user_daily_activity (user_id, date, xp_earned, lessons_completed)
            VALUES (?, ?, ?, 1)
            ON CONFLICT(user_id, date) DO UPDATE SET
              xp_earned = xp_earned + ?,
              lessons_completed = lessons_completed + 1
          `)
            activityStmt.run(userId, today, xpToAward, xpToAward)
          }
        })

        transaction()
        return {
          success: true,
          message: awardXp
            ? 'Lesson completion recorded, XP awarded'
            : 'Lesson already completed, no XP awarded',
          xpAwarded: xpToAward
        }
      } catch (error) {
        console.error('Error recording lesson completion:', error)
        return { success: false, error: 'Failed to record lesson completion' }
      }
    }
  )

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

  ipcMain.handle('get-user-lesson-progress', (_event, { userId, lessonId }) => {
    try {
      const stmt = userDb.prepare('SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?')
      const progress = stmt.get(userId, lessonId)
      return { success: true, progress }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Get user onboarding status
  ipcMain.handle('get-onboarding-status', (_event, userId) => {
    try {
      const stmt = userDb.prepare('SELECT onboarding_completed FROM users WHERE id = ?')
      const result = stmt.get(userId) as { onboarding_completed: number } | undefined
      return {
        success: true,
        completed: result ? Boolean(result.onboarding_completed) : false
      }
    } catch (error) {
      console.error('Error getting onboarding status:', error)
      return { success: false, error: 'Failed to get onboarding status' }
    }
  })

  // Update user onboarding status
  ipcMain.handle('complete-onboarding', (_event, userId) => {
    try {
      const stmt = userDb.prepare('UPDATE users SET onboarding_completed = 1 WHERE id = ?')
      const result = stmt.run(userId)

      if (result.changes > 0) {
        return { success: true, message: 'Onboarding completed successfully' }
      } else {
        return { success: false, error: 'No user found with that ID' }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return { success: false, error: 'Failed to complete onboarding' }
    }
  })

  // Reset user onboarding status (development only)
  ipcMain.handle('reset-onboarding', (_event, userId) => {
    try {
      const stmt = userDb.prepare('UPDATE users SET onboarding_completed = 0 WHERE id = ?')
      const result = stmt.run(userId)

      if (result.changes > 0) {
        return { success: true, message: 'Onboarding reset successfully' }
      } else {
        return { success: false, error: 'No user found with that ID' }
      }
    } catch (error) {
      console.error('Error resetting onboarding:', error)
      return { success: false, error: 'Failed to reset onboarding' }
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
