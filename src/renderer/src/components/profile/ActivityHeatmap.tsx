import React from 'react'
import { ActivityData } from '../../types/database'

interface ActivityHeatmapProps {
  activityData: ActivityData[]
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ activityData }) => {
  // Generate last 365 days
  const generateDays = (): string[] => {
    const days: string[] = []
    const today = new Date()

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }

    return days
  }

  // Create activity map for quick lookup
  const activityMap = new Map(activityData.map((activity) => [activity.date, activity]))

  // Get activity level (0-4) based on XP earned
  const getActivityLevel = (xp: number): number => {
    if (xp === 0) return 0
    if (xp <= 5) return 1
    if (xp <= 15) return 2
    if (xp <= 30) return 3
    return 4
  }

  // Get color class based on activity level
  const getColorClass = (level: number): string => {
    const colors = [
      'bg-base-300', // No activity
      'bg-green-200', // Low activity
      'bg-green-400', // Medium activity
      'bg-green-600', // High activity
      'bg-green-800' // Very high activity
    ]
    return colors[level]
  }

  const days = generateDays()
  const weeks: string[][] = []

  // Group days into weeks
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-base-content/70">
        <span>Less</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className={`w-3 h-3 rounded-sm ${getColorClass(level)}`} />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max p-6">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => {
                const activity = activityMap.get(day)
                const xp = activity?.xp_earned || 0
                const level = getActivityLevel(xp)

                return (
                  <div
                    key={day}
                    className={`w-3 h-3 rounded-sm ${getColorClass(level)} hover:ring-2 hover:ring-primary cursor-pointer transition-all`}
                    title={`${day}: ${xp} XP${activity ? `, ${activity.lessons_completed} lessons, ${activity.exercises_completed} exercises` : ', No activity'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-base-content/70">
        {activityData.length > 0 && (
          <p>Total active days: {activityData.filter((a) => a.xp_earned > 0).length} / 365</p>
        )}
      </div>
    </div>
  )
}

export default ActivityHeatmap
