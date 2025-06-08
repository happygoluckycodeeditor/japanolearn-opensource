import { app } from 'electron'
import { join } from 'path'
import { existsSync, copyFileSync, mkdirSync } from 'fs'
import Database from 'better-sqlite3'

export interface DatabasePaths {
  userDataPath: string
  userDbPath: string
  lessonDbPath: string
  dictionaryDbPath: string
  questionImagesPath: string
}

export function getDatabasePaths(): DatabasePaths {
  const userDataPath = app.getPath('userData')
  const userDbPath = join(userDataPath, 'UserData.db')
  const lessonDbPath = join(userDataPath, 'japanolearn.db')
  const dictionaryDbPath = join(userDataPath, 'jmdict.sqlite')
  const questionImagesPath = join(userDataPath, 'question_images')

  return {
    userDataPath,
    userDbPath,
    lessonDbPath,
    dictionaryDbPath,
    questionImagesPath
  }
}

export function setupDatabases(): { userDb: Database.Database; lessonDb: Database.Database } {
  const paths = getDatabasePaths()

  // Create question images directory
  if (!existsSync(paths.questionImagesPath)) {
    mkdirSync(paths.questionImagesPath, { recursive: true })
  }

  // Copy databases from resources if they don't exist
  const resourceLessonDbPath = join(__dirname, '../../resources/japanolearn.db')
  const resourceDictionaryDbPath = join(__dirname, '../../resources/jmdict.sqlite')

  if (!existsSync(paths.lessonDbPath) && existsSync(resourceLessonDbPath)) {
    copyFileSync(resourceLessonDbPath, paths.lessonDbPath)
  }

  if (!existsSync(paths.dictionaryDbPath) && existsSync(resourceDictionaryDbPath)) {
    console.log('Copying dictionary database to user data directory...')
    copyFileSync(resourceDictionaryDbPath, paths.dictionaryDbPath)
  }

  // Initialize databases
  const userDb = new Database(paths.userDbPath)
  const lessonDb = new Database(paths.lessonDbPath)

  // Log database information
  console.log('User database path:', paths.userDbPath)
  console.log('Lesson database path:', paths.lessonDbPath)
  console.log('Resource lesson database path:', resourceLessonDbPath)
  console.log('Lesson database exists:', existsSync(paths.lessonDbPath))
  console.log('Dictionary database path:', paths.dictionaryDbPath)
  console.log('Resource dictionary database path:', resourceDictionaryDbPath)
  console.log('Dictionary database exists:', existsSync(paths.dictionaryDbPath))

  // Log lesson database tables
  const tables = lessonDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
    name: string
  }[]
  console.log(
    'Tables in the database:',
    tables.map((t) => t.name)
  )

  // Setup user database tables
  setupUserTables(userDb)

  return { userDb, lessonDb }
}

function setupUserTables(userDb: Database.Database): void {
  userDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  userDb.exec(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT 0,
      last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  userDb.exec(`
    CREATE TABLE IF NOT EXISTS exercise_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      is_correct BOOLEAN NOT NULL,
      user_answer TEXT,
      attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
}
