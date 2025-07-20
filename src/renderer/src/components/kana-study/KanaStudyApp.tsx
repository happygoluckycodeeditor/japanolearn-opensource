import { useState } from 'react'
import { KanaType, StudyMode, StudySession, StudyProgress } from './types'
import { kanaGroups } from './kanaData'
import ModeSelector from './ModeSelector'
import GroupSelector from './GroupSelector'
import FlashcardMode from './FlashcardMode'
import QuizMode from './QuizMode'
import LearnMode from './LearnMode'

interface KanaStudyAppProps {
  initialKanaType?: 'hiragana' | 'katakana'
}

export default function KanaStudyApp({ initialKanaType }: KanaStudyAppProps): JSX.Element {
  const [kanaType, setKanaType] = useState<KanaType | null>(initialKanaType ?? null)
  const [studyMode, setStudyMode] = useState<StudyMode | null>(null)
  const [currentGroup, setCurrentGroup] = useState<string | null>(null)
  const [session, setSession] = useState<StudySession | null>(null)
  const [progress, setProgress] = useState<StudyProgress[]>([])

  // Start a new session
  const startSession = (type: KanaType, mode: StudyMode, group: string): void => {
    const newSession: StudySession = {
      startTime: new Date(),
      totalAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      maxStreak: 0,
      score: 0,
      timeSpent: 0,
      mode
    }
    setSession(newSession)
    setKanaType(type)
    setStudyMode(mode)
    setCurrentGroup(group)
  }

  // Update session state
  const updateSession = (updates: Partial<StudySession>): void => {
    if (session) {
      const updatedSession = { ...session, ...updates }
      setSession(updatedSession)
    }
  }

  // Reset to home
  const resetToHome = (): void => {
    setKanaType(null)
    setStudyMode(null)
    setCurrentGroup(null)
    setSession(null)
  }

  // Update progress for a character
  const updateProgress = (character: string, correct: boolean): void => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.character === character)
      if (existing) {
        const correctCount = correct ? existing.correctCount + 1 : existing.correctCount
        const incorrectCount = correct ? existing.incorrectCount : existing.incorrectCount + 1
        const streakCount = correct ? existing.streakCount + 1 : 0
        return prev.map((p) =>
          p.character === character
            ? {
                ...p,
                correctCount,
                incorrectCount,
                lastStudied: new Date(),
                streakCount,
                difficulty: getDifficultyFromStats(correctCount, incorrectCount)
              }
            : p
        )
      } else {
        return [
          ...prev,
          {
            character,
            correctCount: correct ? 1 : 0,
            incorrectCount: correct ? 0 : 1,
            lastStudied: new Date(),
            difficulty: correct ? 'easy' : 'medium',
            streakCount: correct ? 1 : 0
          }
        ]
      }
    })
  }

  // Helper for difficulty
  const getDifficultyFromStats = (
    correct: number,
    incorrect: number
  ): 'easy' | 'medium' | 'hard' => {
    const total = correct + incorrect
    if (total === 0) return 'medium'
    const accuracy = correct / total
    if (accuracy >= 0.8 && correct >= 3) return 'easy'
    if (accuracy < 0.5 && total >= 3) return 'hard'
    return 'medium'
  }

  // Step 1: Kana Type Selection
  if (!kanaType) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* ProgressDashboard expects kanaType, progress, session, achievements, onBack */}
          {/* Only show dashboard if session exists */}
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">🎌 Learn Japanese Kana</h1>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
              Master Hiragana and Katakana with interactive flashcards, quizzes, and games!
            </p>
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-xl">
              <button
                className="bg-gradient-to-r from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 text-pink-900 font-bold py-8 px-12 rounded-xl text-2xl shadow-lg transition-all transform hover:scale-105 w-full"
                onClick={() => setKanaType('hiragana')}
              >
                <div className="text-4xl mb-2">ひ</div>
                Learn Hiragana
              </button>
              <button
                className="bg-gradient-to-r from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400 text-blue-900 font-bold py-8 px-12 rounded-xl text-2xl shadow-lg transition-all transform hover:scale-105 w-full"
                onClick={() => setKanaType('katakana')}
              >
                <div className="text-4xl mb-2">カ</div>
                Learn Katakana
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Study Mode Selection
  if (!studyMode) {
    return (
      <ModeSelector
        kanaType={kanaType}
        onModeSelect={setStudyMode}
        onBack={() => setKanaType(null)}
      />
    )
  }

  // Step 3: Group Selection
  if (!currentGroup) {
    return (
      <GroupSelector
        kanaType={kanaType}
        studyMode={studyMode}
        progress={progress}
        onGroupSelect={(group) => startSession(kanaType, studyMode, group)}
        onBack={() => setStudyMode(null)}
      />
    )
  }

  // Step 4: Study Session
  const currentGroupData = kanaGroups[kanaType].find((g) => g.id === currentGroup)
  if (!currentGroupData || !session) {
    return <div>Error: Group not found</div>
  }

  const renderStudyMode = (): JSX.Element => {
    switch (studyMode) {
      case 'learn':
        return (
          <LearnMode
            characters={currentGroupData.characters}
            session={session}
            onUpdateSession={updateSession}
            onUpdateProgress={updateProgress}
            onComplete={resetToHome}
          />
        )
      case 'flashcards':
        return <FlashcardMode />
      case 'quiz':
        return (
          <QuizMode
            characters={currentGroupData.characters}
            session={session}
            onUpdateSession={updateSession}
            onUpdateProgress={updateProgress}
            onComplete={resetToHome}
          />
        )
      default:
        return <div>Mode not implemented yet</div>
    }
  }

  return <div className="min-h-screen p-4 pt-20">{renderStudyMode()}</div>
}
