import React from 'react'
import { ActivityData } from '../../types/database'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

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

  // Format data for chart
  const chartData = last30Days.map((day) => ({
    date: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    xp: day.xp_earned,
    lessons: day.lessons_completed,
    exercises: day.exercises_completed
  }))

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            interval={4}
            height={50}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} width={40} />
          <Tooltip
            formatter={(value: number | string, name: string): [string, string] => {
              if (name === 'xp') return [`${value} XP`, 'XP']
              if (name === 'lessons') return [`${value}`, 'Lessons']
              if (name === 'exercises') return [`${value}`, 'Exercises']
              return [String(value), name]
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Bar dataKey="xp" fill="#5bc0be" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-sm text-base-content/70">
        <span>Last 30 days</span>
        <span>Total: {last30Days.reduce((sum, day) => sum + day.xp_earned, 0)} XP</span>
      </div>
    </div>
  )
}

export default XPChart
