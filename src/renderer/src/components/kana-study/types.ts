// Core Kana Types
export type KanaType = 'hiragana' | 'katakana'

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface KanaExample {
  word: string
  meaning: string
  emoji: string
}

export interface KanaCharacter {
  kana: string
  romaji: string
  group: string
  strokeOrder?: string[]
  mnemonic?: {
    description: string
    emoji: string
  }
  examples?: KanaExample[]
}

export interface KanaGroup {
  id: string
  name: string
  description: string
  order: number
  characters: KanaCharacter[]
  unlocked?: boolean
}

// Study Progress Types
export interface StudyProgress {
  character: string
  correctCount: number
  incorrectCount: number
  lastStudied: Date
  difficulty: DifficultyLevel
  streakCount: number
  averageResponseTime?: number
}

export interface StudySession {
  startTime: Date
  totalAnswered: number
  correctAnswers: number
  streak: number
  maxStreak: number
  score: number
  timeSpent: number
  mode: StudyMode
}

// Study Modes
export type StudyMode = 'learn' | 'flashcards' | 'quiz' | 'review'

export interface StudyModeConfig {
  mode: StudyMode
  title: string
  description: string
  icon: string
  color: string
  features: string[]
}

// Flashcard Types
export interface FlashcardSettings {
  showRomaji: boolean
  showMnemonic: boolean
  autoAdvance: boolean
  autoAdvanceDelay: number
  shuffleCards: boolean
  repeatIncorrect: boolean
}

export interface FlashcardState {
  currentIndex: number
  isFlipped: boolean
  showHint: boolean
  userResponse?: 'correct' | 'incorrect' | 'hard'
}

// Quiz Types
export interface QuizQuestion {
  id: string
  character: KanaCharacter
  correctAnswer: string
  options: string[]
  type: 'kana-to-romaji' | 'romaji-to-kana'
  timeLimit?: number
}

export interface QuizResult {
  question: QuizQuestion
  userAnswer: string | null
  correct: boolean
  timeUp: boolean
  responseTime: number
}

export interface QuizSettings {
  questionCount: number
  timeLimit: number
  questionTypes: ('kana-to-romaji' | 'romaji-to-kana')[]
  includeGroups: string[]
  difficultyFilter?: DifficultyLevel[]
  randomOrder: boolean
}

// Learning Mode Types
export interface LearningStep {
  type: 'introduction' | 'character' | 'practice' | 'review'
  character?: KanaCharacter
  content?: string
  completed: boolean
}

export interface LearningSession {
  groupId: string
  currentStep: number
  steps: LearningStep[]
  progress: number
  startTime: Date
}

// Utility Types
export interface SpacedRepetitionCard {
  character: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: Date
  quality: number
}

// Error Types
export interface StudyError {
  code: string
  message: string
  details?: unknown
}

// API Response Types (if needed for future extensions)
export interface StudyDataResponse {
  success: boolean
  data?: Record<string, unknown>
  error?: StudyError
}

// Event Types
export interface StudyEvent {
  type:
    | 'character_studied'
    | 'quiz_completed'
    | 'achievement_unlocked'
    | 'session_started'
    | 'session_ended'
  timestamp: Date
  data: Record<string, unknown>
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Export utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Default values for common types
export const DEFAULT_STUDY_SESSION: StudySession = {
  startTime: new Date(),
  totalAnswered: 0,
  correctAnswers: 0,
  streak: 0,
  maxStreak: 0,
  score: 0,
  timeSpent: 0,
  mode: 'learn'
}

export const DEFAULT_FLASHCARD_SETTINGS: FlashcardSettings = {
  showRomaji: true,
  showMnemonic: true,
  autoAdvance: false,
  autoAdvanceDelay: 3000,
  shuffleCards: true,
  repeatIncorrect: true
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  questionCount: 20,
  timeLimit: 15,
  questionTypes: ['kana-to-romaji', 'romaji-to-kana'],
  includeGroups: [],
  randomOrder: true
}

// Type guards
export const isKanaCharacter = (obj: unknown): obj is KanaCharacter => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as { kana: unknown }).kana === 'string' &&
    typeof (obj as { romaji: unknown }).romaji === 'string' &&
    typeof (obj as { group: unknown }).group === 'string'
  )
}

export const isStudyProgress = (obj: unknown): obj is StudyProgress => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as { character: unknown }).character === 'string' &&
    typeof (obj as { correctCount: unknown }).correctCount === 'number' &&
    typeof (obj as { incorrectCount: unknown }).incorrectCount === 'number' &&
    (obj as { lastStudied: unknown }).lastStudied instanceof Date &&
    ['easy', 'medium', 'hard'].includes((obj as { difficulty: string }).difficulty)
  )
}

export const isValidKanaType = (type: string): type is KanaType => {
  return type === 'hiragana' || type === 'katakana'
}

export const isValidStudyMode = (mode: string): mode is StudyMode => {
  return ['learn', 'flashcards', 'quiz', 'review'].includes(mode)
}

// Utility functions for working with types
export const createEmptyProgress = (character: string): StudyProgress => ({
  character,
  correctCount: 0,
  incorrectCount: 0,
  lastStudied: new Date(),
  difficulty: 'medium',
  streakCount: 0
})

export const updateProgressDifficulty = (progress: StudyProgress): StudyProgress => {
  const totalAttempts = progress.correctCount + progress.incorrectCount
  const accuracy = totalAttempts > 0 ? progress.correctCount / totalAttempts : 0

  let difficulty: DifficultyLevel = 'medium'

  if (accuracy >= 0.8 && progress.correctCount >= 3) {
    difficulty = 'easy'
  } else if (accuracy < 0.5 && totalAttempts >= 3) {
    difficulty = 'hard'
  }

  return { ...progress, difficulty }
}

export const calculateSessionAccuracy = (session: StudySession): number => {
  return session.totalAnswered > 0 ? (session.correctAnswers / session.totalAnswered) * 100 : 0
}

export const formatStudyTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
