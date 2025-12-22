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

  // Create directories
  if (!existsSync(paths.questionImagesPath)) {
    mkdirSync(paths.questionImagesPath, { recursive: true })
  }
  if (!existsSync(paths.audioPath)) {
    mkdirSync(paths.audioPath, { recursive: true })
  }

  // Define resource paths based on whether app is packaged
  const resourceLessonDbPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'japanolearn.db')
    : join(__dirname, '../../resources/japanolearn.db')

  const resourceDictionaryDbPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'jmdict.sqlite')
    : join(__dirname, '../../resources/jmdict.sqlite')

  const resourceQuestionImagesPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'question_images')
    : join(__dirname, '../../resources/question_images')

  const resourceAudioPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'audio')
    : join(__dirname, '../../resources/audio')

  // Copy databases from resources if they don't exist
  if (!existsSync(paths.lessonDbPath) && existsSync(resourceLessonDbPath)) {
    copyFileSync(resourceLessonDbPath, paths.lessonDbPath)
  }

  if (!existsSync(paths.dictionaryDbPath) && existsSync(resourceDictionaryDbPath)) {
    console.log('Copying dictionary database to user data directory...')
    copyFileSync(resourceDictionaryDbPath, paths.dictionaryDbPath)
  }

  // Copy question images
  if (existsSync(resourceQuestionImagesPath)) {
    const userImagesExist =
      existsSync(paths.questionImagesPath) && readdirSync(paths.questionImagesPath).length > 0
    if (!userImagesExist) {
      console.log('Copying question images to user data directory...')
      copyDirectoryRecursive(resourceQuestionImagesPath, paths.questionImagesPath)
    }
  }

  // Copy audio files
  if (existsSync(resourceAudioPath)) {
    const userAudioExists = existsSync(paths.audioPath) && readdirSync(paths.audioPath).length > 0
    if (!userAudioExists) {
      console.log('Copying audio files to user data directory...')
      copyDirectoryRecursive(resourceAudioPath, paths.audioPath)
    }
  }

  // Rest of the function stays the same...
  const userDb = new Database(paths.userDbPath)
  const lessonDb = new Database(paths.lessonDbPath)

  console.log('User database path:', paths.userDbPath)
  console.log('Lesson database path:', paths.lessonDbPath)
  console.log('Resource lesson database path:', resourceLessonDbPath)
  console.log('Lesson database exists:', existsSync(paths.lessonDbPath))

  const tables = lessonDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
    name: string
  }[]
  console.log(
    'Tables in the database:',
    tables.map((t) => t.name)
  )

  setupUserTables(userDb)
  return { userDb, lessonDb }
}

export function copyPackagedLessonDbIfNeeded(): void {
  try {
    // In production builds, resources are unpacked to app.asar.unpacked/resources
    const resourceLessonDbPath = app.isPackaged
      ? join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'japanolearn.db')
      : join(__dirname, '../../resources/japanolearn.db')

    const userLessonDbPath = join(app.getPath('userData'), 'japanolearn.db')
    const versionFilePath = join(app.getPath('userData'), 'db-version.txt')

    console.log('Checking for packaged lesson DB at:', resourceLessonDbPath)
    console.log('App version:', app.getVersion())
    console.log('App is packaged:', app.isPackaged)

    if (!existsSync(resourceLessonDbPath)) {
      console.log('No packaged lesson DB found at', resourceLessonDbPath)
      return
    }

    const currentAppVersion = app.getVersion()
    let lastDbVersion = ''

    try {
      if (existsSync(versionFilePath)) {
        lastDbVersion = require('fs').readFileSync(versionFilePath, 'utf8').trim()
      }
    } catch (e) {
      console.warn('Failed to read DB version file:', e)
      lastDbVersion = ''
    }

    console.log('Last DB version:', lastDbVersion)
    console.log('Current app version:', currentAppVersion)

    if (lastDbVersion !== currentAppVersion) {
      console.log(`Updating lesson DB from version ${lastDbVersion} to ${currentAppVersion}`)

      if (existsSync(userLessonDbPath)) {
        const backupPath = `${userLessonDbPath}.bak-${Date.now()}`
        try {
          copyFileSync(userLessonDbPath, backupPath)
          console.log(`✅ Backed up existing lesson DB to ${backupPath}`)
        } catch (backupErr) {
          console.warn('Failed to backup existing lesson DB, aborting overwrite:', backupErr)
          return
        }
      }

      try {
        copyFileSync(resourceLessonDbPath, userLessonDbPath)
        console.log(`✅ Copied packaged lesson DB to ${userLessonDbPath}`)
      } catch (copyErr) {
        console.error('❌ Failed to copy packaged lesson DB:', copyErr)
        return
      }

      try {
        require('fs').writeFileSync(versionFilePath, currentAppVersion, 'utf8')
        console.log('✅ Wrote DB version file:', versionFilePath)
      } catch (writeErr) {
        console.warn('Failed to write DB version file:', writeErr)
      }
    } else {
      console.log('✅ Lesson DB is already up to date for version', currentAppVersion)
    }
  } catch (err) {
    console.error('❌ Error while checking/copying packaged lesson DB:', err)
  }
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
