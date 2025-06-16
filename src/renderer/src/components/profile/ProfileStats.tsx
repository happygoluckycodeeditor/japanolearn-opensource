import React from 'react'
import { UserProfile } from '../../types/database'

interface ProfileStatsProps {
  profile: UserProfile
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
  const stats = [
    {
      title: 'Total XP',
      value: profile.totalXp.toLocaleString(),
      icon: '⭐',
      color: 'text-yellow-500'
    },
    {
      title: 'Current Level',
      value: profile.level.toString(),
      icon: '🏆',
      color: 'text-orange-500'
    },
    {
      title: 'Lessons Completed',
      value: profile.lessonsCompleted.toString(),
      icon: '📚',
      color: 'text-blue-500'
    },
    {
      title: 'Average Accuracy',
      value: `${profile.avgAccuracy.toFixed(1)}%`,
      icon: '🎯',
      color: 'text-green-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-base-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/70 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`text-3xl ${stat.color}`}>{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProfileStats
