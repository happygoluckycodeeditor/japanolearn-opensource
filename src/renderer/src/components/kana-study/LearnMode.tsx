import { useState, useEffect } from 'react'
import { KanaCharacter, StudySession } from './types'

interface LearnModeProps {
  characters: KanaCharacter[]
  session: StudySession
  onUpdateSession: (updates: Partial<StudySession>) => void
  onUpdateProgress: (character: string, correct: boolean) => void
  onComplete: () => void
}

export default function LearnMode({
  characters,
  session,
  onUpdateSession,
  onUpdateProgress,
  onComplete
}: LearnModeProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMnemonic, setShowMnemonic] = useState(true)
  const [showExamples, setShowExamples] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentCharacter = characters[currentIndex]
  const progress = ((currentIndex + 1) / characters.length) * 100

  useEffect(() => {
    // Mark character as studied when viewed
    if (currentCharacter) {
      onUpdateProgress(currentCharacter.kana, true)
    }
  }, [currentIndex, currentCharacter, onUpdateProgress])

  const handleNext = (): void => {
    if (currentIndex < characters.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowMnemonic(true)
      setShowExamples(false)

      // Update session
      onUpdateSession({
        correctAnswers: session.correctAnswers + 1,
        totalAnswered: session.totalAnswered + 1,
        score: session.score + 10
      })
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrevious = (): void => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowMnemonic(true)
      setShowExamples(false)
    }
  }

  const handleComplete = (): void => {
    onUpdateSession({
      correctAnswers: session.correctAnswers + (characters.length - currentIndex),
      totalAnswered: session.totalAnswered + (characters.length - currentIndex),
      score: session.score + (characters.length - currentIndex) * 10
    })
    onComplete()
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Great Job!</h2>
          <p className="text-gray-600 mb-6">
            You&apos;ve completed learning all {characters.length} characters in this group!
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">{characters.length}</div>
                <div className="text-sm text-gray-500">Characters Learned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{session.score}</div>
                <div className="text-sm text-gray-500">Points Earned</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Continue to Practice 🃏
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">📚 Learn Mode</h1>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} of {characters.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Main Learning Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Character Display */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 text-center">
            <div className="text-8xl font-bold mb-4">{currentCharacter.kana}</div>
            <div className="text-3xl font-semibold mb-2">{currentCharacter.romaji}</div>
            <div className="text-lg opacity-90">
              {currentCharacter.group.replace('-', ' ').toUpperCase()}
            </div>
          </div>

          {/* Learning Content */}
          <div className="p-8">
            {/* Mnemonic Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">💡 Memory Helper</h3>
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showMnemonic ? 'Hide' : 'Show'}
                </button>
              </div>

              {showMnemonic && currentCharacter.mnemonic && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <span className="text-4xl mr-4">{currentCharacter.mnemonic.emoji}</span>
                    <div>
                      <p className="text-gray-800 font-medium">
                        {currentCharacter.mnemonic.description}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Remember: <strong>{currentCharacter.kana}</strong> sounds like &quot;
                        {currentCharacter.romaji}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Examples Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">📝 Example Words</h3>
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showExamples ? 'Hide' : 'Show'}
                </button>
              </div>

              {showExamples && currentCharacter.examples && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCharacter.examples.map((example, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{example.emoji}</span>
                        <div>
                          <div className="text-lg font-bold text-gray-800">{example.word}</div>
                          <div className="text-sm text-gray-600">{example.meaning}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Contains:{' '}
                        <span className="font-semibold text-blue-600">{currentCharacter.kana}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Practice */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🎯 Quick Practice</h4>
              <div className="text-center">
                <p className="text-gray-600 mb-4">What sound does this character make?</p>
                <div className="text-6xl font-bold text-gray-800 mb-4">{currentCharacter.kana}</div>
                <div className="text-2xl font-semibold text-blue-600">
                  &quot;{currentCharacter.romaji}&quot;
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                ← Previous
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showMnemonic
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  💡 Mnemonic
                </button>
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showExamples
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  📝 Examples
                </button>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                {currentIndex === characters.length - 1 ? 'Complete' : 'Next'} →
              </button>
            </div>
          </div>
        </div>

        {/* Character Grid Preview */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">📋 Group Overview</h4>
          <div className="flex flex-wrap gap-2">
            {characters.map((char, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setShowMnemonic(true)
                  setShowExamples(false)
                }}
                className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                  index === currentIndex
                    ? 'bg-blue-500 text-white shadow-lg'
                    : index < currentIndex
                      ? 'bg-green-200 text-green-800 hover:bg-green-300'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {char.kana}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
