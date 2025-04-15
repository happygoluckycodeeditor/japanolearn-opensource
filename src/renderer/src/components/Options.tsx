import React, { useState } from 'react'
import ProfileSettings from './options/ProfileSettings'
import ApplicationSettings from './options/ApplicationSettings'
import DataManagement from './options/DataManagement'

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">Options</h1>
      <p className="mb-8">Configure your JapanoLearn experience</p>

      {/* Settings Accordion */}
      <div className="max-w-3xl mx-auto">
        <div className="tabs tabs-boxed mb-6">
          <a
            className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </a>
          <a
            className={`tab ${activeTab === 'application' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('application')}
          >
            Application
          </a>
          <a
            className={`tab ${activeTab === 'data' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data Management
          </a>
        </div>

        <div className="bg-base-100 p-6 rounded-lg shadow-md">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'application' && <ApplicationSettings />}
          {activeTab === 'data' && <DataManagement />}
        </div>
      </div>
    </div>
  )
}

export default Options
