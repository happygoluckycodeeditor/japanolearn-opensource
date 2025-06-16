import React, { useState, useEffect } from 'react'
import { UserProfile, ActivityData } from '../../types/database'
import LevelProgress from './LevelProgress'
import ProfileStats from './ProfileStats'
import ActivityHeatmap from './ActivityHeatmap'
import XPChart from './XPChart'

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
    fetchUserActivity()
  }, [])

  const fetchUserProfile = async (): Promise<void> => {
    try {
      // For now, we'll assume user ID 1. Later we can get this from context/state
      const userId = 1
      const result = await window.electron.ipcRenderer.invoke('get-user-profile', userId)

      if (result.success) {
        setProfile(result.profile)
      } else {
        setError(result.error || 'Failed to load profile')
      }
    } catch (err) {
      setError('An error occurred while loading profile')
      console.error('Error fetching user profile:', err)
    }
  }

  const fetchUserActivity = async (): Promise<void> => {
    try {
      // For now, we'll assume user ID 1. Later we can get this from context/state
      const userId = 1
      const result = await window.electron.ipcRenderer.invoke('get-user-activity', userId, 365)

      if (result.success) {
        setActivityData(result.activity)
      } else {
        console.error('Failed to load activity data:', result.error)
      }
    } catch (err) {
      console.error('Error fetching user activity:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error || 'Failed to load profile'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-base-200 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-16">
              <span className="text-2xl font-bold">{profile.username.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            <p className="text-base-content/70">
              Learning since {new Date(profile.created_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Level Progress */}
        <LevelProgress profile={profile} />
      </div>

      {/* Stats Overview */}
      <ProfileStats profile={profile} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Activity Heatmap */}
        <div className="bg-base-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
          <ActivityHeatmap activityData={activityData} />
        </div>

        {/* XP Progress Chart */}
        <div className="bg-base-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">XP Progress</h2>
          <XPChart activityData={activityData} />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
