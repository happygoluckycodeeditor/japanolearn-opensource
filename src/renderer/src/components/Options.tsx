import React, { useState } from 'react'
import ProfileSettings from './options/ProfileSettings'
import ApplicationSettings from './options/ApplicationSettings'
import DataManagement from './options/DataManagement'

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleTabChange = (tab: string): void => {
    if (tab !== activeTab) {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveTab(tab)
        setIsTransitioning(false)
      }, 150) // Match this with the CSS transition duration
    }
  }

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
      {/* Title - Fixed at top */}
      <div className="sticky top-20 bg-gray-200 z-10 pb-4">
        <h1 className="text-4xl font-bold mb-4">Options</h1>
        <p className="mb-8">Configure your JapanoLearn experience and handle the database</p>

        {/* Tabs - Fixed below title */}
        <div className="max-w-3xl mx-auto">
          <div className="tabs tabs-boxed mb-6">
            <a
              className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              Profile
            </a>
            <a
              className={`tab ${activeTab === 'application' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('application')}
            >
              Application
            </a>
            <a
              className={`tab ${activeTab === 'data' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('data')}
            >
              Data Management
            </a>
          </div>
        </div>
      </div>

      {/* Content area with fixed minimum height */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-base-100 p-6 rounded-lg shadow-md min-h-[400px]">
          <div
            className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          >
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'application' && <ApplicationSettings />}
            {activeTab === 'data' && <DataManagement />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Options
