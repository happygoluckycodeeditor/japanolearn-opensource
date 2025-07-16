import { useState, useEffect } from 'react'
import { KanaCharacter, StudySession, StudyProgress, Difficulty } from './types'

interface FlashcardModeProps {
  characters: KanaCharacter[]
  session: StudySession
  progress: StudyProgress[]
  onUpdateSession: (updates: Partial<StudySession>) => void
  onUpdateProgress: (character: string, correct: boolean) => void
  onComplete: () => void
}

export default function FlashcardMode({
  characters,
  session,
  progress,
  onUpdateSession,
  onUpdateProgress,
  onComplete
}: FlashcardModeProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set())
  const [cardOrder, setCardOrder] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  // Initialize card order with spaced repetition logic
  useEffect(() => {
    const sortedCards = characters
      .map((char, index) => {
        const charProgress = progress.find((p) => p.character === char.kana)
        return {
          index,
          difficulty: charProgress?.difficulty || 'medium',
          lastStudied: charProgress?.lastStudied || new Date(0),
          correctCount: charProgress?.correctCount || 0
        }
      })
      .sort((a, b) => {
        // Prioritize hard cards, then by last studied time
        if (a.difficulty === 'hard' && b.difficulty !== 'hard') return -1
        if (b.difficulty === 'hard' && a.difficulty !== 'hard') return 1
        return a.lastStudied.getTime() - b.lastStudied.getTime()
      })
      .map((item) => item.index)

    setCardOrder(sortedCards)
  }, [characters, progress])

  const currentCharacter = characters[cardOrder[currentIndex]]
  const currentProgress = progress.find((p) => p.character === currentCharacter?.kana)
  const totalCards = characters.length
  const completedCards = studiedCards.size

  const handleFlip = (): void => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      setShowMnemonic(false)
    }
  }

  const handleDifficultyRating = (difficulty: 'easy' | 'medium' | 'hard'): void => {
    if (!currentCharacter) return

    const isCorrect = difficulty === 'easy'

    // Update progress
    onUpdateProgress(currentCharacter.kana, isCorrect)

    // Update session
    const newCorrectAnswers = isCorrect ? session.correctAnswers + 1 : session.correctAnswers
    const newStreak = isCorrect ? session.streak + 1 : 0

    onUpdateSession({
      correctAnswers: newCorrectAnswers,
      totalAnswered: session.totalAnswered + 1,
      streak: newStreak,
      score: session.score + (isCorrect ? 10 : 5)
    })

    // Mark card as studied
    setStudiedCards((prev) => new Set([...prev, currentIndex]))

    // Move to next card or complete
    if (currentIndex < cardOrder.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowMnemonic(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handleSkip = (): void => {
    if (currentIndex < cardOrder.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowMnemonic(false)
    }
  }

  const handlePrevious = (): void => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowMnemonic(false)
    }
  }

  const getDifficultyColor = (difficulty?: Difficulty): string => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isCompleted) {
    const accuracy =
      session.totalAnswered > 0
        ? Math.round((session.correctAnswers / session.totalAnswered) * 100)
        : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Flashcard Session Complete!</h2>
          <p className="text-gray-600 mb-6">
            You&apos;ve reviewed all {totalCards} flashcards in this group!
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{session.correctAnswers}</div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{session.score}</div>
                <div className="text-sm text-gray-500">Points</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setCurrentIndex(0)
                setIsFlipped(false)
                setStudiedCards(new Set())
                setIsCompleted(false)
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Study Again 🔄
            </button>
            <button
              onClick={onComplete}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back to Home 🏠
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentCharacter) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">🃏 Flashcards</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentIndex + 1} of {totalCards}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-orange-500">🔥</span>
                <span className="text-sm font-semibold">{session.streak}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative mb-6">
          <div
            className={`bg-white rounded-2xl shadow-xl cursor-pointer transition-all duration-500 transform ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
            style={{
              minHeight: '400px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Front of Card */}
            <div
              className={`absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center">
                <div className="text-8xl font-bold text-gray-800 mb-6">{currentCharacter.kana}</div>
                <div className="text-lg text-gray-500 mb-4">Click to reveal reading</div>
                {currentProgress && (
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(currentProgress.difficulty)}`}
                  >
                    {currentProgress.difficulty?.toUpperCase() || 'NEW'}
                  </div>
                )}
              </div>
            </div>

            {/* Back of Card */}
            <div
              className={`absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-800 mb-4">{currentCharacter.kana}</div>
                <div className="text-4xl font-semibold text-blue-600 mb-6">
                  &quot;{currentCharacter.romaji}&quot;
                </div>

                {/* Mnemonic Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMnemonic(!showMnemonic)
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium mb-4"
                >
                  {showMnemonic ? 'Hide' : 'Show'} Memory Helper 💡
                </button>

                {/* Mnemonic */}
                {showMnemonic && currentCharacter.mnemonic && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center">
                      <span className="text-3xl mr-3">{currentCharacter.mnemonic.emoji}</span>
                      <p className="text-sm text-gray-700">
                        {currentCharacter.mnemonic.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Rating (only show when flipped) */}
        {isFlipped && (
          <div className="bg-white rounded-xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              How well did you know this character?
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDifficultyRating('hard')}
                className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-4 px-4 rounded-lg transition-all border-2 border-red-200"
              >
                <div className="text-2xl mb-1">😰</div>
                <div className="text-sm">Hard</div>
                <div className="text-xs opacity-75">Need more practice</div>
              </button>
              <button
                onClick={() => handleDifficultyRating('medium')}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-4 px-4 rounded-lg transition-all border-2 border-yellow-200"
              >
                <div className="text-2xl mb-1">🤔</div>
                <div className="text-sm">Medium</div>
                <div className="text-xs opacity-75">Got it with effort</div>
              </button>
              <button
                onClick={() => handleDifficultyRating('easy')}
                className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-4 px-4 rounded-lg transition-all border-2 border-green-200"
              >
                <div className="text-2xl mb-1">😊</div>
                <div className="text-sm">Easy</div>
                <div className="text-xs opacity-75">Knew it instantly</div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-md">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              currentIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            ← Previous
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Completed: {completedCards}/{totalCards}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Score:</span>
              <span className="text-sm font-semibold text-blue-600">{session.score}</span>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
          >
            Skip →
          </button>
        </div>

        {/* Character Grid Preview */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">📋 Session Progress</h4>
          <div className="flex flex-wrap gap-2">
            {cardOrder.map((originalIndex, displayIndex) => {
              const char = characters[originalIndex]
              const isCurrentCard = displayIndex === currentIndex
              const isStudied = studiedCards.has(displayIndex)
              const charProgress = progress.find((p) => p.character === char.kana)

              return (
                <button
                  key={originalIndex}
                  onClick={() => {
                    setCurrentIndex(displayIndex)
                    setIsFlipped(false)
                    setShowMnemonic(false)
                  }}
                  className={`w-12 h-12 rounded-lg font-bold text-lg transition-all relative ${
                    isCurrentCard
                      ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-300'
                      : isStudied
                        ? 'bg-green-200 text-green-800 hover:bg-green-300'
                        : charProgress?.difficulty === 'hard'
                          ? 'bg-red-200 text-red-800 hover:bg-red-300'
                          : charProgress?.difficulty === 'easy'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title={`${char.kana} (${char.romaji}) - ${charProgress?.difficulty || 'new'}`}
                >
                  {char.kana}
                  {isStudied && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
              Current
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>
              Completed
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-200 rounded mr-1"></div>
              Hard
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
              Easy
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
              New/Medium
            </div>
          </div>
        </div>

        {/* Study Stats */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">📊 Session Stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(((currentIndex + 1) / totalCards) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{session.correctAnswers}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{session.streak}</div>
              <div className="text-sm text-gray-500">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{session.score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
