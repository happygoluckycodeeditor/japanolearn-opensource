import { useState, useEffect } from 'react'
import { KanaCharacter, StudySession } from './types'

interface QuizModeProps {
  characters: KanaCharacter[]
  session: StudySession
  onUpdateSession: (updates: Partial<StudySession>) => void
  onUpdateProgress: (character: string, correct: boolean) => void
  onComplete: () => void
}

interface QuizQuestion {
  character: KanaCharacter
  correctAnswer: string
  options: string[]
  type: 'kana-to-romaji' | 'romaji-to-kana'
}

export default function QuizMode({
  characters,
  session,
  onUpdateSession,
  onUpdateProgress,
  onComplete
}: QuizModeProps): JSX.Element {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [results, setResults] = useState<
    { question: QuizQuestion; userAnswer: string | null; correct: boolean; timeUp: boolean }[]
  >([])

  // Generate quiz questions
  useEffect(() => {
    const generateQuestions = (): QuizQuestion[] => {
      const quizQuestions: QuizQuestion[] = []

      characters.forEach((char) => {
        // Generate kana-to-romaji question
        const kanaToRomaji: QuizQuestion = {
          character: char,
          correctAnswer: char.romaji,
          options: generateOptions(char.romaji, 'romaji'),
          type: 'kana-to-romaji'
        }

        // Generate romaji-to-kana question
        const romajiToKana: QuizQuestion = {
          character: char,
          correctAnswer: char.kana,
          options: generateOptions(char.kana, 'kana'),
          type: 'romaji-to-kana'
        }

        quizQuestions.push(kanaToRomaji, romajiToKana)
      })

      // Shuffle questions
      return quizQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(20, quizQuestions.length))
    }

    setQuestions(generateQuestions())
  }, [characters])

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return (): void => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp()
      return undefined
    }
    return undefined
  }, [timeLeft, isTimerActive, showResult])

  const generateOptions = (correctAnswer: string, type: 'romaji' | 'kana'): string[] => {
    const allOptions =
      type === 'romaji' ? characters.map((c) => c.romaji) : characters.map((c) => c.kana)

    const wrongOptions = allOptions
      .filter((option) => option !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = [correctAnswer, ...wrongOptions]
    return options.sort(() => Math.random() - 0.5)
  }

  const handleAnswerSelect = (answer: string): void => {
    if (showResult) return

    setSelectedAnswer(answer)
    setIsTimerActive(false)

    const correct = answer === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    // Update progress and session
    onUpdateProgress(currentQuestion.character.kana, correct)

    const newCorrectAnswers = correct ? session.correctAnswers + 1 : session.correctAnswers
    const newStreak = correct ? session.streak + 1 : 0
    const points = correct ? (timeLeft > 10 ? 15 : timeLeft > 5 ? 10 : 5) : 0

    onUpdateSession({
      correctAnswers: newCorrectAnswers,
      totalAnswered: session.totalAnswered + 1,
      streak: newStreak,
      score: session.score + points
    })

    // Store result
    setResults((prev) => [
      ...prev,
      {
        question: currentQuestion,
        userAnswer: answer,
        correct,
        timeUp: false
      }
    ])
  }

  const handleTimeUp = (): void => {
    setIsTimerActive(false)
    setShowResult(true)
    setIsCorrect(false)

    // Update session for time up
    onUpdateProgress(currentQuestion.character.kana, false)
    onUpdateSession({
      totalAnswered: session.totalAnswered + 1,
      streak: 0
    })

    // Store result
    setResults((prev) => [
      ...prev,
      {
        question: currentQuestion,
        userAnswer: null,
        correct: false,
        timeUp: true
      }
    ])
  }

  const handleNextQuestion = (): void => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(15)
      setIsTimerActive(true)
    } else {
      setQuizCompleted(true)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl font-semibold text-gray-700">Preparing your quiz...</div>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    const accuracy =
      results.length > 0
        ? Math.round((results.filter((r) => r.correct).length / results.length) * 100)
        : 0
    const correctCount = results.filter((r) => r.correct).length
    const timeUpCount = results.filter((r) => r.timeUp).length

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">
              You answered {correctCount} out of {results.length} questions correctly
            </p>
          </div>

          {/* Results Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{timeUpCount}</div>
                <div className="text-sm text-gray-500">Time Up</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{session.score}</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="text-center mb-6">
            {accuracy >= 90 && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 font-semibold">Excellent work! 🌟</div>
                <div className="text-green-700 text-sm">You&apos;ve mastered these characters!</div>
              </div>
            )}
            {accuracy >= 70 && accuracy < 90 && (
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-800 font-semibold">Great job! 👏</div>
                <div className="text-blue-700 text-sm">You&apos;re making good progress!</div>
              </div>
            )}
            {accuracy >= 50 && accuracy < 70 && (
              <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-800 font-semibold">Good effort! 📚</div>
                <div className="text-yellow-700 text-sm">Keep practicing to improve!</div>
              </div>
            )}
            {accuracy < 50 && (
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                <div className="text-orange-800 font-semibold">Keep going! 💪</div>
                <div className="text-orange-700 text-sm">
                  Try the Learn mode first, then come back!
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setCurrentQuestionIndex(0)
                setSelectedAnswer(null)
                setShowResult(false)
                setTimeLeft(15)
                setIsTimerActive(true)
                setQuizCompleted(false)
                setResults([])
                setQuestions((prev) => [...prev].sort(() => Math.random() - 0.5))
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Take Quiz Again 🔄
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Progress and Timer */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">🧠 Quiz Mode</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div
                className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                  timeLeft <= 5 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                <span>⏰</span>
                <span className="font-semibold">{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">
              {currentQuestion.type === 'kana-to-romaji'
                ? 'What sound does this make?'
                : 'Which character makes this sound?'}
            </div>

            <div className="text-8xl font-bold text-gray-800 mb-4">
              {currentQuestion.type === 'kana-to-romaji'
                ? currentQuestion.character.kana
                : `"${currentQuestion.character.romaji}"`}
            </div>

            {showResult && (
              <div
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {selectedAnswer === null
                  ? '⏰ Time Up!'
                  : isCorrect
                    ? '✅ Correct!'
                    : '❌ Incorrect'}
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrectAnswer = option === currentQuestion.correctAnswer

              let buttonClass = 'p-4 rounded-lg font-semibold text-lg transition-all border-2 '

              if (!showResult) {
                buttonClass +=
                  'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 hover:border-gray-400'
              } else {
                if (isCorrectAnswer) {
                  buttonClass += 'bg-green-100 text-green-800 border-green-300'
                } else if (isSelected) {
                  buttonClass += 'bg-red-100 text-red-800 border-red-300'
                } else {
                  buttonClass += 'bg-gray-100 text-gray-500 border-gray-300'
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  {option}
                  {showResult && isCorrectAnswer && <span className="ml-2">✅</span>}
                  {showResult && isSelected && !isCorrectAnswer && <span className="ml-2">❌</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Result Explanation */}
        {showResult && (
          <div className="bg-white rounded-xl p-6 shadow-md mb-6">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">{currentQuestion.character.kana}</div>
              <div>
                <div className="text-xl font-semibold text-gray-800">
                  {currentQuestion.character.kana} = &quot;{currentQuestion.character.romaji}&quot;
                </div>
                <div className="text-sm text-gray-600">
                  {currentQuestion.character.group.replace('-', ' ').toUpperCase()} group
                </div>
              </div>
            </div>

            {/* Mnemonic if available */}
            {currentQuestion.character.mnemonic && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{currentQuestion.character.mnemonic.emoji}</span>
                  <p className="text-sm text-gray-700">
                    <strong>Memory Helper:</strong> {currentQuestion.character.mnemonic.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Button */}
        {showResult && (
          <div className="text-center">
            <button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition-all text-lg"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} →
            </button>
          </div>
        )}

        {/* Quiz Stats */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{session.correctAnswers}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {session.totalAnswered - session.correctAnswers}
              </div>
              <div className="text-sm text-gray-500">Wrong</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{session.streak}</div>
              <div className="text-sm text-gray-500">Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{session.score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
          </div>
        </div>

        {/* Question Types Info */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">📋 Quiz Format</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <div className="text-2xl mr-3">あ</div>
              <div>
                <div className="font-semibold text-gray-700">Kana → Romaji</div>
                <div className="text-gray-500">See the character, choose the sound</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-2xl mr-3">&quot;ka&quot;</div>
              <div>
                <div className="font-semibold text-gray-700">Romaji → Kana</div>
                <div className="text-gray-500">Hear the sound, choose the character</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
