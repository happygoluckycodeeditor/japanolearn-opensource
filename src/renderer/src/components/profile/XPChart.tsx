import React from 'react'
import { ActivityData } from '../../types/database'

interface XPChartProps {
  activityData: ActivityData[]
}

const XPChart: React.FC<XPChartProps> = ({ activityData }) => {
  // Get last 30 days of data
  const last30Days = activityData.slice(-30)

  if (last30Days.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-base-content/50">
        <div className="text-center">
          <p className="text-lg mb-2">📊</p>
          <p>No activity data yet</p>
          <p className="text-sm">Complete lessons and exercises to see your progress!</p>
        </div>
      </div>
    )
  }

  const maxXp = Math.max(...last30Days.map((d) => d.xp_earned), 1)
  const chartHeight = 200

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-48 gap-1">
        {last30Days.map((day, index) => {
          const height = (day.xp_earned / maxXp) * chartHeight
          const date = new Date(day.date)

          return (
            <div key={day.date} className="flex flex-col items-center flex-1 group cursor-pointer">
              <div
                className="bg-primary rounded-t-sm w-full transition-all hover:bg-primary-focus relative"
                style={{ height: `${height}px`, minHeight: day.xp_earned > 0 ? '4px' : '0px' }}
                title={`${date.toLocaleDateString()}: ${day.xp_earned} XP`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-100 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  <div className="text-center">
                    <div className="font-semibold">{date.toLocaleDateString()}</div>
                    <div>{day.xp_earned} XP</div>
                    {day.lessons_completed > 0 && <div>{day.lessons_completed} lessons</div>}
                    {day.exercises_completed > 0 && <div>{day.exercises_completed} exercises</div>}
                  </div>
                </div>
              </div>

              {/* Date labels (show every 5th day) */}
              {index % 5 === 0 && (
                <div className="text-xs text-base-content/50 mt-1 transform -rotate-45 origin-top-left">
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-sm text-base-content/70">
        <span>Last 30 days</span>
        <span>Total: {last30Days.reduce((sum, day) => sum + day.xp_earned, 0)} XP</span>
      </div>
    </div>
  )
}

export default XPChart
