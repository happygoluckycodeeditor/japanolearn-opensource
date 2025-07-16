import { useState, useEffect } from 'react'
import { StudySession, StudyProgress } from './types'

interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  type: 'streak' | 'accuracy' | 'progress' | 'score' | 'speed' | 'mastery'
  requirement: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementNotificationProps {
  session: StudySession
  progress: StudyProgress[]
  totalCharacters: number
  onClose: () => void
}

const achievements: Achievement[] = [
  // Streak Achievements
  {
    id: 'streak_5',
    title: 'On Fire!',
    description: 'Get 5 correct answers in a row',
    emoji: '🔥',
    type: 'streak',
    requirement: 5,
    rarity: 'common'
  },
  {
    id: 'streak_10',
    title: 'Hot Streak',
    description: 'Get 10 correct answers in a row',
    emoji: '🌟',
    type: 'streak',
    requirement: 10,
    rarity: 'rare'
  },
  {
    id: 'streak_20',
    title: 'Unstoppable',
    description: 'Get 20 correct answers in a row',
    emoji: '⚡',
    type: 'streak',
    requirement: 20,
    rarity: 'epic'
  },
  {
    id: 'streak_50',
    title: 'Legendary Streak',
    description: 'Get 50 correct answers in a row',
    emoji: '👑',
    type: 'streak',
    requirement: 50,
    rarity: 'legendary'
  },

  // Accuracy Achievements
  {
    id: 'accuracy_80',
    title: 'Sharp Shooter',
    description: 'Maintain 80% accuracy with 10+ answers',
    emoji: '🎯',
    type: 'accuracy',
    requirement: 80,
    rarity: 'common'
  },
  {
    id: 'accuracy_90',
    title: 'Precision Master',
    description: 'Maintain 90% accuracy with 20+ answers',
    emoji: '🏹',
    type: 'accuracy',
    requirement: 90,
    rarity: 'rare'
  },
  {
    id: 'accuracy_95',
    title: 'Perfect Aim',
    description: 'Maintain 95% accuracy with 30+ answers',
    emoji: '💎',
    type: 'accuracy',
    requirement: 95,
    rarity: 'epic'
  },
  {
    id: 'accuracy_100',
    title: 'Flawless Victory',
    description: 'Perfect accuracy with 50+ answers',
    emoji: '🏆',
    type: 'accuracy',
    requirement: 100,
    rarity: 'legendary'
  },

  // Progress Achievements
  {
    id: 'progress_25',
    title: 'Getting Started',
    description: 'Study 25% of all characters',
    emoji: '🌱',
    type: 'progress',
    requirement: 25,
    rarity: 'common'
  },
  {
    id: 'progress_50',
    title: 'Halfway There',
    description: 'Study 50% of all characters',
    emoji: '🌿',
    type: 'progress',
    requirement: 50,
    rarity: 'rare'
  },
  {
    id: 'progress_75',
    title: 'Almost Complete',
    description: 'Study 75% of all characters',
    emoji: '🌳',
    type: 'progress',
    requirement: 75,
    rarity: 'epic'
  },
  {
    id: 'progress_100',
    title: 'Completionist',
    description: 'Study all characters',
    emoji: '🎓',
    type: 'progress',
    requirement: 100,
    rarity: 'legendary'
  },

  // Score Achievements
  {
    id: 'score_100',
    title: 'Century Club',
    description: 'Score 100 points in a session',
    emoji: '💯',
    type: 'score',
    requirement: 100,
    rarity: 'common'
  },
  {
    id: 'score_500',
    title: 'High Scorer',
    description: 'Score 500 points in a session',
    emoji: '🚀',
    type: 'score',
    requirement: 500,
    rarity: 'rare'
  },
  {
    id: 'score_1000',
    title: 'Point Master',
    description: 'Score 1000 points in a session',
    emoji: '⭐',
    type: 'score',
    requirement: 1000,
    rarity: 'epic'
  },
  {
    id: 'score_2000',
    title: 'Score Legend',
    description: 'Score 2000 points in a session',
    emoji: '🌟',
    type: 'score',
    requirement: 2000,
    rarity: 'legendary'
  },

  // Mastery Achievements
  {
    id: 'mastery_5',
    title: 'First Steps',
    description: 'Master 5 characters',
    emoji: '👶',
    type: 'mastery',
    requirement: 5,
    rarity: 'common'
  },
  {
    id: 'mastery_15',
    title: 'Quick Learner',
    description: 'Master 15 characters',
    emoji: '🧠',
    type: 'mastery',
    requirement: 15,
    rarity: 'rare'
  },
  {
    id: 'mastery_30',
    title: 'Kana Scholar',
    description: 'Master 30 characters',
    emoji: '📚',
    type: 'mastery',
    requirement: 30,
    rarity: 'epic'
  },
  {
    id: 'mastery_50',
    title: 'Kana Master',
    description: 'Master 50 characters',
    emoji: '🥋',
    type: 'mastery',
    requirement: 50,
    rarity: 'legendary'
  },

  // Special Achievements
  {
    id: 'first_correct',
    title: 'First Success',
    description: 'Get your first answer correct',
    emoji: '🎉',
    type: 'score',
    requirement: 1,
    rarity: 'common'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Answer 10 questions in under 5 seconds each',
    emoji: '💨',
    type: 'speed',
    requirement: 10,
    rarity: 'rare'
  }
]

export default function AchievementNotification({
  session,
  progress,
  totalCharacters,
  onClose
}: AchievementNotificationProps): JSX.Element | null {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([])

  // Check for new achievements
  useEffect(() => {
    const checkAchievements = (): void => {
      const newAchievements: Achievement[] = []

      // Calculate current stats
      const accuracy =
        session.totalAnswered > 0 ? (session.correctAnswers / session.totalAnswered) * 100 : 0
      const progressPercentage = (progress.length / totalCharacters) * 100
      const masteredCount = progress.filter(
        (p) => p.difficulty === 'easy' && p.correctCount >= 3
      ).length

      achievements.forEach((achievement) => {
        // Skip if already unlocked
        if (unlockedAchievements.some((unlocked) => unlocked.id === achievement.id)) {
          return
        }

        let isUnlocked = false

        switch (achievement.type) {
          case 'streak':
            isUnlocked = session.streak >= achievement.requirement
            break
          case 'accuracy':
            isUnlocked =
              accuracy >= achievement.requirement &&
              session.totalAnswered >=
                (achievement.requirement === 100
                  ? 50
                  : achievement.requirement === 95
                    ? 30
                    : achievement.requirement === 90
                      ? 20
                      : 10)
            break
          case 'progress':
            isUnlocked = progressPercentage >= achievement.requirement
            break
          case 'score':
            if (achievement.id === 'first_correct') {
              isUnlocked = session.correctAnswers >= 1
            } else {
              isUnlocked = session.score >= achievement.requirement
            }
            break
          case 'mastery':
            isUnlocked = masteredCount >= achievement.requirement
            break
          case 'speed':
            // This would require additional timing data - simplified for now
            isUnlocked = session.streak >= achievement.requirement && accuracy > 90
            break
        }

        if (isUnlocked) {
          newAchievements.push(achievement)
        }
      })

      if (newAchievements.length > 0) {
        setUnlockedAchievements((prev) => [...prev, ...newAchievements])
        setAchievementQueue((prev) => [...prev, ...newAchievements])
      }
    }

    checkAchievements()
  }, [session, progress, totalCharacters, unlockedAchievements])

  // Show achievements from queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      const nextAchievement = achievementQueue[0]
      setCurrentAchievement(nextAchievement)
      setIsVisible(true)
      setAchievementQueue((prev) => prev.slice(1))

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)

      return (): void => clearTimeout(timer)
    }
    return undefined
  }, [achievementQueue, currentAchievement])

  const handleClose = (): void => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentAchievement(null)
      onClose()
    }, 300)
  }

  const getRarityStyle = (
    rarity: string
  ): { bg: string; border: string; glow: string; text: string } => {
    switch (rarity) {
      case 'common':
        return {
          bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
          border: 'border-gray-300',
          glow: 'shadow-gray-200',
          text: 'text-gray-800'
        }
      case 'rare':
        return {
          bg: 'bg-gradient-to-r from-blue-400 to-blue-600',
          border: 'border-blue-300',
          glow: 'shadow-blue-200',
          text: 'text-blue-800'
        }
      case 'epic':
        return {
          bg: 'bg-gradient-to-r from-purple-400 to-purple-600',
          border: 'border-purple-300',
          glow: 'shadow-purple-200',
          text: 'text-purple-800'
        }
      case 'legendary':
        return {
          bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          border: 'border-yellow-300',
          glow: 'shadow-yellow-200',
          text: 'text-yellow-800'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
          border: 'border-gray-300',
          glow: 'shadow-gray-200',
          text: 'text-gray-800'
        }
    }
  }

  const getRarityName = (rarity: string): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1)
  }

  if (!currentAchievement) {
    return null
  }

  const rarityStyle = getRarityStyle(currentAchievement.rarity)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl ${rarityStyle.glow} shadow-2xl max-w-md w-full overflow-hidden`}
        >
          {/* Header with rarity indicator */}
          <div className={`${rarityStyle.bg} px-6 py-4 text-white text-center relative`}>
            <div className="absolute top-2 right-2">
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="text-sm font-semibold opacity-90 mb-1">🏆 ACHIEVEMENT UNLOCKED</div>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${rarityStyle.text} bg-white bg-opacity-90`}
            >
              {getRarityName(currentAchievement.rarity)}
            </div>
          </div>

          {/* Achievement content */}
          <div className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">{currentAchievement.emoji}</div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentAchievement.title}</h3>

            <p className="text-gray-600 mb-6">{currentAchievement.description}</p>

            {/* Achievement stats */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">Your Progress:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-bold text-blue-600">{session.streak}</div>
                  <div className="text-gray-500">Current Streak</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">{session.score}</div>
                  <div className="text-gray-500">Session Score</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleClose}
                className={`w-full ${rarityStyle.bg} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all`}
              >
                Awesome! 🎉
              </button>

              {achievementQueue.length > 0 && (
                <button
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(() => {
                      setCurrentAchievement(null)
                    }, 300)
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-all text-sm"
                >
                  Next Achievement ({achievementQueue.length} more)
                </button>
              )}
            </div>
          </div>

          {/* Sparkle animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 text-yellow-400 animate-ping">✨</div>
            <div
              className="absolute top-8 right-8 text-yellow-400 animate-ping"
              style={{ animationDelay: '0.5s' }}
            >
              ⭐
            </div>
            <div
              className="absolute bottom-8 left-8 text-yellow-400 animate-ping"
              style={{ animationDelay: '1s' }}
            >
              ✨
            </div>
            <div
              className="absolute bottom-4 right-4 text-yellow-400 animate-ping"
              style={{ animationDelay: '1.5s' }}
            >
              ⭐
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export achievement checking utility for use in other components
export const checkForAchievements = (
  session: StudySession,
  progress: StudyProgress[],
  totalCharacters: number,
  previouslyUnlocked: string[] = []
): Achievement[] => {
  const newAchievements: Achievement[] = []

  // Calculate current stats
  const accuracy =
    session.totalAnswered > 0 ? (session.correctAnswers / session.totalAnswered) * 100 : 0
  const progressPercentage = (progress.length / totalCharacters) * 100
  const masteredCount = progress.filter(
    (p) => p.difficulty === 'easy' && p.correctCount >= 3
  ).length

  achievements.forEach((achievement) => {
    // Skip if already unlocked
    if (previouslyUnlocked.includes(achievement.id)) {
      return
    }

    let isUnlocked = false
    let minAnswers = 10

    switch (achievement.type) {
      case 'streak':
        isUnlocked = session.streak >= achievement.requirement
        break
      case 'accuracy':
        if (achievement.requirement === 100) {
          minAnswers = 50
        } else if (achievement.requirement === 95) {
          minAnswers = 30
        } else if (achievement.requirement === 90) {
          minAnswers = 20
        }
        isUnlocked = accuracy >= achievement.requirement && session.totalAnswered >= minAnswers
        break
      case 'progress':
        isUnlocked = progressPercentage >= achievement.requirement
        break
      case 'score':
        if (achievement.id === 'first_correct') {
          isUnlocked = session.correctAnswers >= 1
        } else {
          isUnlocked = session.score >= achievement.requirement
        }
        break
      case 'mastery':
        isUnlocked = masteredCount >= achievement.requirement
        break
      case 'speed':
        // Simplified speed check - would need timing data for real implementation
        isUnlocked = session.streak >= achievement.requirement && accuracy > 90
        break
    }

    if (isUnlocked) {
      newAchievements.push(achievement)
    }
  })

  return newAchievements
}

// Export achievements list for reference
export { achievements }
