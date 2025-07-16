import { useState } from 'react'
import { KanaType, StudyProgress, StudySession } from './types'
import { kanaGroups } from './kanaData'

interface ProgressDashboardProps {
  kanaType: KanaType
  progress: StudyProgress[]
  session: StudySession
  onBack: () => void
}

export default function ProgressDashboard({
  kanaType,
  progress,
  session,
  onBack
}: ProgressDashboardProps): JSX.Element {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const groups = kanaGroups[kanaType]
  const kanaTitle = kanaType === 'hiragana' ? 'Hiragana ひらがな' : 'Katakana カタカナ'

  // Calculate overall statistics
  const totalCharacters = groups.reduce((sum, group) => sum + group.characters.length, 0)
  const studiedCharacters = progress.length
  const masteredCharacters = progress.filter(
    (p) => p.difficulty === 'easy' && p.correctCount >= 3
  ).length
  const hardCharacters = progress.filter((p) => p.difficulty === 'hard').length

  const overallAccuracy =
    progress.length > 0
      ? Math.round(
          (progress.reduce((sum, p) => sum + p.correctCount, 0) /
            progress.reduce((sum, p) => sum + p.correctCount + p.incorrectCount, 0)) *
            100
        ) || 0
      : 0

  const getGroupStats = (
    groupId: string
  ): {
    total: number
    studied: number
    mastered: number
    accuracy: number
    avgDifficulty: string
  } => {
    const group = groups.find((g) => g.id === groupId)
    if (!group) return { total: 0, studied: 0, mastered: 0, accuracy: 0, avgDifficulty: 'new' }

    const groupCharacters = group.characters.map((c) => c.kana)
    const groupProgress = progress.filter((p) => groupCharacters.includes(p.character))

    const studied = groupProgress.length
    const mastered = groupProgress.filter(
      (p) => p.difficulty === 'easy' && p.correctCount >= 3
    ).length

    const totalCorrect = groupProgress.reduce((sum, p) => sum + p.correctCount, 0)
    const totalAttempts = groupProgress.reduce(
      (sum, p) => sum + p.correctCount + p.incorrectCount,
      0
    )
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

    // Calculate average difficulty
    const difficulties = groupProgress.map((p) => p.difficulty)
    const avgDifficulty =
      difficulties.length > 0
        ? difficulties.includes('hard')
          ? 'hard'
          : difficulties.includes('medium')
            ? 'medium'
            : 'easy'
        : 'new'

    return {
      total: group.characters.length,
      studied,
      mastered,
      accuracy,
      avgDifficulty
    }
  }

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'hard':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    if (percentage > 0) return 'bg-red-500'
    return 'bg-gray-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute left-4 top-4 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold mb-4 text-gray-800">📊 Progress Dashboard</h1>
          <p className="text-xl text-gray-600 mb-2">{kanaTitle} • Current Session</p>
          <p className="text-gray-500">
            Track your learning progress and identify areas for improvement
          </p>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Overall Progress</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {Math.round((studiedCharacters / totalCharacters) * 100)}%
            </div>
            <div className="text-sm text-gray-500">
              {studiedCharacters} of {totalCharacters} characters
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(studiedCharacters / totalCharacters) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Mastered</h3>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{masteredCharacters}</div>
            <div className="text-sm text-gray-500">Characters mastered</div>
            <div className="text-xs text-green-600 mt-2">
              {studiedCharacters > 0
                ? Math.round((masteredCharacters / studiedCharacters) * 100)
                : 0}
              % of studied
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Accuracy</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{overallAccuracy}%</div>
            <div className="text-sm text-gray-500">Overall accuracy</div>
            <div
              className={`text-xs mt-2 ${overallAccuracy >= 80 ? 'text-green-600' : overallAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {overallAccuracy >= 80
                ? 'Excellent!'
                : overallAccuracy >= 60
                  ? 'Good progress'
                  : 'Keep practicing'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Session Score</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">{session.score}</div>
            <div className="text-sm text-gray-500">Points earned</div>
            <div className="text-xs text-orange-600 mt-2">Streak: {session.streak}</div>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Difficulty Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {totalCharacters - studiedCharacters}
              </div>
              <div className="text-sm text-gray-500">Not Studied</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{
                    width: `${((totalCharacters - studiedCharacters) / totalCharacters) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {progress.filter((p) => p.difficulty === 'easy').length}
              </div>
              <div className="text-sm text-gray-500">Easy</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(progress.filter((p) => p.difficulty === 'easy').length / totalCharacters) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {progress.filter((p) => p.difficulty === 'medium').length}
              </div>
              <div className="text-sm text-gray-500">Medium</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${(progress.filter((p) => p.difficulty === 'medium').length / totalCharacters) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{hardCharacters}</div>
              <div className="text-sm text-gray-500">Hard</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(hardCharacters / totalCharacters) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Group Progress */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            📚 Progress by Character Group
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => {
              const stats = getGroupStats(group.id)
              const progressPercentage = (stats.studied / stats.total) * 100

              return (
                <div
                  key={group.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{group.name}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(stats.avgDifficulty)}`}
                    >
                      {stats.avgDifficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {stats.studied}/{stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{stats.mastered}</div>
                      <div className="text-gray-500">Mastered</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{stats.accuracy}%</div>
                      <div className="text-gray-500">Accuracy</div>
                    </div>
                  </div>

                  {/* Character Preview */}
                  <div className="mt-3 flex justify-center space-x-1">
                    {group.characters.slice(0, 5).map((char, index) => {
                      const charProgress = progress.find((p) => p.character === char.kana)
                      return (
                        <span
                          key={index}
                          className={`text-lg font-bold ${
                            charProgress?.difficulty === 'easy'
                              ? 'text-green-600'
                              : charProgress?.difficulty === 'medium'
                                ? 'text-yellow-600'
                                : charProgress?.difficulty === 'hard'
                                  ? 'text-red-600'
                                  : 'text-gray-400'
                          }`}
                        >
                          {char.kana}
                        </span>
                      )
                    })}
                  </div>

                  {/* Expanded Details */}
                  {selectedGroup === group.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {group.characters.map((char) => {
                          const charProgress = progress.find((p) => p.character === char.kana)
                          const attempts = charProgress
                            ? charProgress.correctCount + charProgress.incorrectCount
                            : 0
                          const accuracy =
                            attempts > 0
                              ? Math.round((charProgress!.correctCount / attempts) * 100)
                              : 0

                          return (
                            <div
                              key={char.kana}
                              className={`text-center p-2 rounded-lg border-2 ${
                                charProgress?.difficulty === 'easy'
                                  ? 'bg-green-50 border-green-200'
                                  : charProgress?.difficulty === 'medium'
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : charProgress?.difficulty === 'hard'
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                              }`}
                              title={`${char.kana} (${char.romaji}) - ${charProgress?.difficulty || 'not studied'}`}
                            >
                              <div className="text-lg font-bold">{char.kana}</div>
                              <div className="text-xs text-gray-600">{char.romaji}</div>
                              {charProgress && (
                                <div className="text-xs mt-1">
                                  <div
                                    className={`font-medium ${
                                      accuracy >= 80
                                        ? 'text-green-600'
                                        : accuracy >= 60
                                          ? 'text-yellow-600'
                                          : 'text-red-600'
                                    }`}
                                  >
                                    {accuracy}%
                                  </div>
                                  <div className="text-gray-500">
                                    {charProgress.correctCount}/{attempts}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Session Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 Current Session Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-2xl font-bold text-blue-600">{session.totalAnswered}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{session.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
              <div className="text-xs text-green-600 mt-1">
                {session.totalAnswered > 0
                  ? Math.round((session.correctAnswers / session.totalAnswered) * 100)
                  : 0}
                % accuracy
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-orange-600">{session.streak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="text-xs text-orange-600 mt-1">
                Best: {Math.max(session.streak, session.correctAnswers)}
              </div>
            </div>
          </div>
        </div>

        {/* Study Recommendations */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">💡 Study Recommendations</h3>
          <div className="space-y-4">
            {hardCharacters > 0 && (
              <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl mr-3">🎯</div>
                <div>
                  <div className="font-semibold text-red-800">Focus on Difficult Characters</div>
                  <div className="text-red-700 text-sm">
                    You have {hardCharacters} characters marked as hard. Try using flashcards to
                    review these more frequently.
                  </div>
                </div>
              </div>
            )}

            {studiedCharacters < totalCharacters / 2 && (
              <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-2xl mr-3">📚</div>
                <div>
                  <div className="font-semibold text-blue-800">Expand Your Learning</div>
                  <div className="text-blue-700 text-sm">
                    You&apos;ve studied {Math.round((studiedCharacters / totalCharacters) * 100)}%
                    of all characters. Try learning new character groups to expand your knowledge.
                  </div>
                </div>
              </div>
            )}

            {overallAccuracy < 70 && studiedCharacters > 5 && (
              <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-2xl mr-3">🎪</div>
                <div>
                  <div className="font-semibold text-yellow-800">Practice More</div>
                  <div className="text-yellow-700 text-sm">
                    Your accuracy is {overallAccuracy}%. Try using quiz mode to test your knowledge
                    and improve retention.
                  </div>
                </div>
              </div>
            )}

            {masteredCharacters > 10 && (
              <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl mr-3">🌟</div>
                <div>
                  <div className="font-semibold text-green-800">Great Progress!</div>
                  <div className="text-green-700 text-sm">
                    You&apos;ve mastered {masteredCharacters} characters! Consider challenging
                    yourself with more advanced groups.
                  </div>
                </div>
              </div>
            )}

            {studiedCharacters === 0 && (
              <div className="flex items-start p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-2xl mr-3">🚀</div>
                <div>
                  <div className="font-semibold text-purple-800">Ready to Start?</div>
                  <div className="text-purple-700 text-sm">
                    Begin your {kanaType} journey! Start with basic vowels (a, i, u, e, o) and work
                    your way up.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">📖 Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Difficulty Levels:</h5>
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                  <span>
                    <strong>Easy:</strong> Answered correctly 3+ times
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                  <span>
                    <strong>Medium:</strong> Mixed performance
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                  <span>
                    <strong>Hard:</strong> Frequently incorrect
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded mr-2"></div>
                  <span>
                    <strong>New:</strong> Not yet studied
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Progress Indicators:</h5>
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>
                    <strong>Green:</strong> 80%+ progress/accuracy
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span>
                    <strong>Yellow:</strong> 60-79% progress/accuracy
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                  <span>
                    <strong>Orange:</strong> 40-59% progress/accuracy
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>
                    <strong>Red:</strong> Below 40% progress/accuracy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
