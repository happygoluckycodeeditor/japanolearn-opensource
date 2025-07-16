import { KanaType, StudyMode, StudyProgress } from './types'
import { kanaGroups } from './kanaData'

interface GroupSelectorProps {
  kanaType: KanaType
  studyMode: StudyMode
  progress: StudyProgress[]
  onGroupSelect: (groupId: string) => void
  onBack: () => void
}

export default function GroupSelector({
  kanaType,
  studyMode,
  progress,
  onGroupSelect,
  onBack
}: GroupSelectorProps): JSX.Element {
  const groups = kanaGroups[kanaType]

  const getModeInfo = (mode: StudyMode): { emoji: string; title: string; color: string } => {
    switch (mode) {
      case 'learn':
        return { emoji: '📚', title: 'Learn', color: 'green' }
      case 'flashcard':
        return { emoji: '🃏', title: 'Flashcards', color: 'blue' }
      case 'quiz':
        return { emoji: '🧠', title: 'Quiz', color: 'purple' }
      case 'writing':
        return { emoji: '✍️', title: 'Writing', color: 'orange' }
      case 'listening':
        return { emoji: '🔊', title: 'Listening', color: 'pink' }
    }
  }

  const getGroupProgress = (
    groupId: string
  ): { mastered: number; total: number; accuracy: number } => {
    const group = groups.find((g) => g.id === groupId)
    if (!group) return { mastered: 0, total: 0, accuracy: 0 }

    const groupCharacters = group.characters.map((c) => c.kana)
    const groupProgress = progress.filter((p) => groupCharacters.includes(p.character))

    const mastered = groupProgress.filter(
      (p) => p.difficulty === 'easy' && p.correctCount >= 3
    ).length
    const total = group.characters.length

    const totalCorrect = groupProgress.reduce((sum, p) => sum + p.correctCount, 0)
    const totalAttempts = groupProgress.reduce(
      (sum, p) => sum + p.correctCount + p.incorrectCount,
      0
    )
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

    return { mastered, total, accuracy }
  }

  const getProgressColor = (mastered: number, total: number): string => {
    const percentage = total > 0 ? (mastered / total) * 100 : 0
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    if (percentage > 0) return 'bg-red-500'
    return 'bg-gray-300'
  }

  const getDifficultyDistribution = (
    groupId: string
  ): { easy: number; medium: number; hard: number; unstudied: number } => {
    const group = groups.find((g) => g.id === groupId)
    if (!group) return { easy: 0, medium: 0, hard: 0, unstudied: 0 }

    const groupCharacters = group.characters.map((c) => c.kana)
    const groupProgress = progress.filter((p) => groupCharacters.includes(p.character))

    const easy = groupProgress.filter((p) => p.difficulty === 'easy').length
    const medium = groupProgress.filter((p) => p.difficulty === 'medium').length
    const hard = groupProgress.filter((p) => p.difficulty === 'hard').length
    const unstudied = group.characters.length - groupProgress.length

    return { easy, medium, hard, unstudied }
  }

  const modeInfo = getModeInfo(studyMode)
  const kanaTitle = kanaType === 'hiragana' ? 'Hiragana ひらがな' : 'Katakana カタカナ'

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

          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            {modeInfo.emoji} Choose Character Group
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {kanaTitle} • {modeInfo.title} Mode
          </p>
          <p className="text-gray-500">Select which characters you&apos;d like to study</p>
        </div>

        {/* Group Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {groups.map((group) => {
            const groupProgress = getGroupProgress(group.id)
            const difficulty = getDifficultyDistribution(group.id)
            const progressColor = getProgressColor(groupProgress.mastered, groupProgress.total)

            return (
              <div
                key={group.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-200"
                onClick={() => onGroupSelect(group.id)}
              >
                {/* Group Header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{group.name}</h3>

                  {/* Character Preview */}
                  <div className="flex justify-center space-x-2 mb-3">
                    {group.characters.slice(0, 5).map((char, index) => (
                      <span key={index} className="text-2xl font-bold text-gray-700">
                        {char.kana}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {groupProgress.mastered}/{groupProgress.total} mastered
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{
                        width: `${groupProgress.total > 0 ? (groupProgress.mastered / groupProgress.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {groupProgress.accuracy}%
                    </div>
                    <div className="text-xs text-gray-500">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {group.characters.length}
                    </div>
                    <div className="text-xs text-gray-500">Characters</div>
                  </div>
                </div>

                {/* Difficulty Distribution */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Difficulty Breakdown:</div>
                  <div className="flex space-x-1">
                    {difficulty.easy > 0 && (
                      <div className="flex-1 bg-green-200 rounded px-2 py-1 text-center">
                        <div className="text-xs font-semibold text-green-800">
                          {difficulty.easy} Easy
                        </div>
                      </div>
                    )}
                    {difficulty.medium > 0 && (
                      <div className="flex-1 bg-yellow-200 rounded px-2 py-1 text-center">
                        <div className="text-xs font-semibold text-yellow-800">
                          {difficulty.medium} Medium
                        </div>
                      </div>
                    )}
                    {difficulty.hard > 0 && (
                      <div className="flex-1 bg-red-200 rounded px-2 py-1 text-center">
                        <div className="text-xs font-semibold text-red-800">
                          {difficulty.hard} Hard
                        </div>
                      </div>
                    )}
                    {difficulty.unstudied > 0 && (
                      <div className="flex-1 bg-gray-200 rounded px-2 py-1 text-center">
                        <div className="text-xs font-semibold text-gray-600">
                          {difficulty.unstudied} New
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Badge */}
                {group.id === 'vowels' && difficulty.unstudied === group.characters.length && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full text-center mb-2">
                    ⭐ Recommended Start
                  </div>
                )}

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all">
                  Start {modeInfo.title} →
                </button>
              </div>
            )
          })}
        </div>

        {/* Study Recommendations */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-md max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
            📋 Study Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">For Beginners:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">1️⃣</span>
                  Start with <strong>Vowels (あいうえお)</strong> - foundation of all kana
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">2️⃣</span>
                  Move to <strong>K-row (かきくけこ)</strong> - most common consonants
                </div>
                <div className="flex items-center">
                  <span className="text-purple-500 mr-2">3️⃣</span>
                  Continue with <strong>S-row (さしすせそ)</strong>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Study Tips:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-2">💡</span>
                  Use <strong>Learn mode</strong> first to understand mnemonics
                </div>
                <div className="flex items-center">
                  <span className="text-orange-500 mr-2">🔄</span>
                  Practice with <strong>Flashcards</strong> for memorization
                </div>
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">🎯</span>
                  Test yourself with <strong>Quizzes</strong> regularly
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Summary */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-md">
            <span className="text-gray-600 mr-4">Overall {kanaTitle} Progress:</span>
            <div className="flex space-x-4">
              {groups.map((group) => {
                const groupProgress = getGroupProgress(group.id)
                const percentage =
                  groupProgress.total > 0
                    ? Math.round((groupProgress.mastered / groupProgress.total) * 100)
                    : 0
                return (
                  <div key={group.id} className="text-center">
                    <div className="text-sm font-semibold text-gray-700">
                      {group.name.split(' ')[0]}
                    </div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
