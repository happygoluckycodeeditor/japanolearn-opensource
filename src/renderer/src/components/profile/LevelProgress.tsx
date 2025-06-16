import React from 'react'
import { UserProfile } from '../../types/database'

interface LevelProgressProps {
  profile: UserProfile
}

const LevelProgress: React.FC<LevelProgressProps> = ({ profile }) => {
  const progressPercentage =
    ((profile.totalXp - profile.currentLevelXp) / (profile.nextLevelXp - profile.currentLevelXp)) *
    100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="badge badge-primary badge-lg font-bold">Level {profile.level}</div>
          <span className="text-lg font-semibold">{profile.totalXp.toLocaleString()} XP</span>
        </div>
        <div className="text-sm text-base-content/70">{profile.xpToNextLevel} XP to next level</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-base-content/70 mb-1">
          <span>Level {profile.level}</span>
          <span>Level {profile.level + 1}</span>
        </div>
        <progress
          className="progress progress-primary w-full h-3"
          value={progressPercentage}
          max="100"
        ></progress>
        <div className="flex justify-between text-xs text-base-content/50 mt-1">
          <span>{profile.currentLevelXp.toLocaleString()}</span>
          <span>{profile.nextLevelXp.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default LevelProgress
