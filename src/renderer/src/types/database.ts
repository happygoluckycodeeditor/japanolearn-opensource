// Define types for our database entities
export interface Lesson {
  id: number
  title: string
  description: string
  explanation: string | null
  video_url: string | null
  level: string | null
  category: string | null
  order_index: number | null
  exp: number
  created_at: string
}

export interface LessonQuestion {
  id: number
  lesson_id: number
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation: string | null
  image_path: string | null
}

// Define types for exercise entities
export interface Exercise {
  exp: number
  id: number
  lesson_id: number
  title: string
  description: string | null
  difficulty: string | null
  type: string | null
}

export interface ExerciseQuestion {
  id: number
  exercise_id: number
  question: string
  option_a: string
  option_b: string
  option_c: string | null
  option_d: string | null
  correct_answer: string
  explanation: string | null
  image_path: string | null
}

// NEW: User profile related types
export interface User {
  id: number
  username: string
  created_at?: string
}

export interface UserProgress {
  id: number
  user_id: number
  lesson_id: number
  completed_at: string
  xp_earned: number
}

export interface UserExerciseAttempt {
  id: number
  user_id: number
  exercise_id: number
  score: number
  total_questions: number
  accuracy: number
  attempted_at: string
}

export interface UserDailyActivity {
  id: number
  user_id: number
  date: string
  xp_earned: number
  lessons_completed: number
  exercises_completed: number
}

export interface UserProfile extends User {
  totalXp: number
  level: number
  currentLevelXp: number
  nextLevelXp: number
  xpToNextLevel: number
  lessonsCompleted: number
  avgAccuracy: number
}

export interface ActivityData {
  date: string
  xp_earned: number
  lessons_completed: number
  exercises_completed: number
}
