import { app } from 'electron'
import { join } from 'path'
import { existsSync, copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import Database from 'better-sqlite3'

export interface DatabasePaths {
  userDataPath: string
  userDbPath: string
  lessonDbPath: string
  dictionaryDbPath: string
  questionImagesPath: string
  audioPath: string
}

export function getDatabasePaths(): DatabasePaths {
  const userDataPath = app.getPath('userData')
  const userDbPath = join(userDataPath, 'UserData.db')
  const lessonDbPath = join(userDataPath, 'japanolearn.db')
  const dictionaryDbPath = join(userDataPath, 'jmdict.sqlite')
  const questionImagesPath = join(userDataPath, 'question_images')
  const audioPath = join(userDataPath, 'audio')

  return {
    userDataPath,
    userDbPath,
    lessonDbPath,
    dictionaryDbPath,
    questionImagesPath,
    audioPath
  }
}

// Helper function to copy directory recursively
function copyDirectoryRecursive(source: string, destination: string): void {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true })
  }

  const files = readdirSync(source)

  for (const file of files) {
    const sourcePath = join(source, file)
    const destPath = join(destination, file)

    if (statSync(sourcePath).isDirectory()) {
      copyDirectoryRecursive(sourcePath, destPath)
    } else {
      copyFileSync(sourcePath, destPath)
    }
  }
}

export function setupDatabases(): { userDb: Database.Database; lessonDb: Database.Database } {
  const paths = getDatabasePaths()

  // Create question images directory
  if (!existsSync(paths.questionImagesPath)) {
    mkdirSync(paths.questionImagesPath, { recursive: true })
  }

  // Create audio directory
  if (!existsSync(paths.audioPath)) {
    mkdirSync(paths.audioPath, { recursive: true })
  }

  // Copy databases from resources if they don't exist
  const resourceLessonDbPath = join(__dirname, '../../resources/japanolearn.db')
  const resourceDictionaryDbPath = join(__dirname, '../../resources/jmdict.sqlite')
  const resourceQuestionImagesPath = join(__dirname, '../../resources/question_images')
  const resourceAudioPath = join(__dirname, '../../resources/audio')

  if (!existsSync(paths.lessonDbPath) && existsSync(resourceLessonDbPath)) {
    copyFileSync(resourceLessonDbPath, paths.lessonDbPath)
  }

  if (!existsSync(paths.dictionaryDbPath) && existsSync(resourceDictionaryDbPath)) {
    console.log('Copying dictionary database to user data directory...')
    copyFileSync(resourceDictionaryDbPath, paths.dictionaryDbPath)
  }

  // Copy question images from resources if they don't exist in user data
  if (existsSync(resourceQuestionImagesPath)) {
    const userImagesExist =
      existsSync(paths.questionImagesPath) && readdirSync(paths.questionImagesPath).length > 0

    if (!userImagesExist) {
      console.log('Copying question images to user data directory...')
      copyDirectoryRecursive(resourceQuestionImagesPath, paths.questionImagesPath)
    }
  }

  // Copy audio files from resources if they don't exist in user data
  if (existsSync(resourceAudioPath)) {
    const userAudioExists = existsSync(paths.audioPath) && readdirSync(paths.audioPath).length > 0

    if (!userAudioExists) {
      console.log('Copying audio files to user data directory...')
      copyDirectoryRecursive(resourceAudioPath, paths.audioPath)
    }
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
  console.log('Question images path:', paths.questionImagesPath)
  console.log('Resource question images path:', resourceQuestionImagesPath)
  console.log('Question images exist:', existsSync(paths.questionImagesPath))

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

  // Add onboarding_completed column to users if it doesn't exist
  const usersColumns = userDb.prepare(`PRAGMA table_info(users)`).all() as {
    name: string
  }[]
  if (!usersColumns.some((col) => col.name === 'onboarding_completed')) {
    userDb.prepare('ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0').run()
  }

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

  // Add xp_earned column to user_progress if it doesn't exist
  const userProgressColumns = userDb.prepare(`PRAGMA table_info(user_progress)`).all() as {
    name: string
  }[]
  if (!userProgressColumns.some((col) => col.name === 'xp_earned')) {
    userDb.prepare('ALTER TABLE user_progress ADD COLUMN xp_earned INTEGER DEFAULT 0').run()
  }
  // Add video_progress, quiz_progress, and overall_progress columns if they don't exist
  if (!userProgressColumns.some((col) => col.name === 'video_progress')) {
    userDb.prepare('ALTER TABLE user_progress ADD COLUMN video_progress INTEGER DEFAULT 0').run()
  }
  if (!userProgressColumns.some((col) => col.name === 'quiz_progress')) {
    userDb.prepare('ALTER TABLE user_progress ADD COLUMN quiz_progress INTEGER DEFAULT 0').run()
  }
  if (!userProgressColumns.some((col) => col.name === 'overall_progress')) {
    userDb.prepare('ALTER TABLE user_progress ADD COLUMN overall_progress INTEGER DEFAULT 0').run()
  }

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
