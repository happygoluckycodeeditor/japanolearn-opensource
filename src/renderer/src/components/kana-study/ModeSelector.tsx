import { KanaType, StudyMode } from './types'

interface ModeSelectorProps {
  kanaType: KanaType
  onModeSelect: (mode: StudyMode) => void
  onBack: () => void
}

const studyModes = [
  {
    id: 'learn' as StudyMode,
    title: 'Learn',
    description: 'Introduction to characters with mnemonics and examples',
    emoji: '📚',
    color: 'from-green-200 to-green-300 hover:from-green-300 hover:to-green-400',
    textColor: 'text-green-900',
    features: ['Visual mnemonics', 'Example words', 'Step-by-step learning']
  },
  {
    id: 'flashcard' as StudyMode,
    title: 'Flashcards',
    description: 'Practice with interactive flashcards',
    emoji: '🃏',
    color: 'from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400',
    textColor: 'text-blue-900',
    features: ['Flip to reveal', 'Difficulty rating', 'Spaced repetition']
  },
  {
    id: 'quiz' as StudyMode,
    title: 'Quiz',
    description: 'Test your knowledge with multiple choice questions',
    emoji: '🧠',
    color: 'from-purple-200 to-purple-300 hover:from-purple-300 hover:to-purple-400',
    textColor: 'text-purple-900',
    features: ['Multiple choice', 'Instant feedback', 'Score tracking']
  },
  {
    id: 'writing' as StudyMode,
    title: 'Writing',
    description: 'Practice writing characters (Coming Soon)',
    emoji: '✍️',
    color: 'from-orange-200 to-orange-300 hover:from-orange-300 hover:to-orange-400',
    textColor: 'text-orange-900',
    features: ['Stroke order', 'Writing practice', 'Real-time feedback'],
    disabled: true
  },
  {
    id: 'listening' as StudyMode,
    title: 'Listening',
    description: 'Audio recognition practice (Coming Soon)',
    emoji: '🔊',
    color: 'from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400',
    textColor: 'text-pink-900',
    features: ['Audio playback', 'Sound recognition', 'Pronunciation guide'],
    disabled: true
  }
]

export default function ModeSelector({
  kanaType,
  onModeSelect,
  onBack
}: ModeSelectorProps): JSX.Element {
  const kanaTitle = kanaType === 'hiragana' ? 'Hiragana ひらがな' : 'Katakana カタカナ'
  const kanaEmoji = kanaType === 'hiragana' ? '🌸' : '⚡'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute left-4 top-4 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold mb-4 text-gray-800">{kanaEmoji} Choose Study Mode</h1>
          <p className="text-xl text-gray-600 mb-2">Learning {kanaTitle}</p>
          <p className="text-gray-500">Select how you&apos;d like to study today</p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {studyModes.map((mode) => (
            <div
              key={mode.id}
              className={`relative bg-gradient-to-r ${mode.color} rounded-xl p-6 shadow-lg transition-all transform hover:scale-105 ${
                mode.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={() => !mode.disabled && onModeSelect(mode.id)}
            >
              {/* Disabled overlay */}
              {mode.disabled && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  Soon
                </div>
              )}

              {/* Mode Icon */}
              <div className="text-6xl mb-4 text-center">{mode.emoji}</div>

              {/* Mode Title */}
              <h3 className={`text-2xl font-bold mb-2 text-center ${mode.textColor}`}>
                {mode.title}
              </h3>

              {/* Mode Description */}
              <p className={`text-center mb-4 ${mode.textColor} opacity-80`}>{mode.description}</p>

              {/* Features List */}
              <div className="space-y-2">
                {mode.features.map((feature, index) => (
                  <div key={index} className={`flex items-center ${mode.textColor} opacity-70`}>
                    <span className="text-sm mr-2">✓</span>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-6 text-center">
                <div className={`inline-block ${mode.textColor} font-semibold text-lg`}>
                  {mode.disabled ? 'Coming Soon' : 'Start Learning →'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Study Tips */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-md max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">💡 Study Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="text-green-500 mr-2">🌱</span>
              <div>
                <strong>Start with Learn mode</strong> to understand each character with visual
                mnemonics
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">🔄</span>
              <div>
                <strong>Use Flashcards</strong> for spaced repetition and memory reinforcement
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">🎯</span>
              <div>
                <strong>Take Quizzes</strong> to test your knowledge and track progress
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">⏰</span>
              <div>
                <strong>Study regularly</strong> - 15 minutes daily is better than 2 hours once a
                week
              </div>
            </div>
          </div>
        </div>

        {/* Progress Preview */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-md">
            <span className="text-gray-600 mr-2">Your progress:</span>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <span className="text-green-500 mr-1">🟢</span>
                <span className="text-sm text-gray-700">Easy: 0</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">🟡</span>
                <span className="text-sm text-gray-700">Medium: 0</span>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">🔴</span>
                <span className="text-sm text-gray-700">Hard: 0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
