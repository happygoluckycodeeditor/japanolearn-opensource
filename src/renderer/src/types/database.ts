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
