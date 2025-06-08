import { ipcMain } from 'electron'
import Database from 'better-sqlite3'

export function setupUserHandlers(userDb: Database.Database): void {
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