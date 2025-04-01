import React, { useState, useEffect } from 'react'

const Options: React.FC = () => {
  const [username, setUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    async function fetchUserData(): Promise<void> {
      const result = await window.electron.ipcRenderer.invoke('get-users')
      if (result.success && result.users && result.users.length > 0) {
        setUsername(result.users[0].username)
        setUserId(result.users[0].id)
      }
    }

    fetchUserData()
  }, [])

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewUsername(e.target.value)
  }

  const updateUsername = async (): Promise<void> => {
    if (!newUsername.trim()) {
      setMessage({ text: 'Username cannot be empty', type: 'error' })
      return
    }

    if (!userId) {
      setMessage({ text: 'No user found to update', type: 'error' })
      return
    }

    try {
      const result = await window.electron.ipcRenderer.invoke('update-username', {
        userId,
        newUsername: newUsername.trim()
      })

      if (result.success) {
        setUsername(newUsername)
        setNewUsername('')
        setMessage({ text: 'Username updated successfully!', type: 'success' })
      } else {
        setMessage({ text: result.error || 'Failed to update username', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'An error occurred while updating username', type: 'error' })
    }
  }

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">Options</h1>
      <p className="mb-8">Configure your JapanoLearn experience</p>

      {/* Settings Accordion */}
      <div className="max-w-3xl mx-auto">
        <div className="collapse collapse-arrow bg-base-100 border border-base-300 mb-4">
          <input type="radio" name="settings-accordion" defaultChecked />
          <div className="collapse-title font-semibold text-lg">Profile Settings</div>
          <div className="collapse-content">
            <div className="form-control w-full max-w-md">
              <label className="label">
                <span className="label-text">Current Username</span>
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="input input-bordered w-full max-w-md mb-4"
              />

              <label className="label">
                <span className="label-text">New Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter new username"
                value={newUsername}
                onChange={handleUsernameChange}
                className="input input-bordered w-full max-w-md mb-4"
              />

              {message.text && (
                <div
                  className={`alert ${
                    message.type === 'success' ? 'alert-success' : 'alert-error'
                  } mb-4`}
                >
                  <span>{message.text}</span>
                </div>
              )}

              <button
                className="btn btn-primary w-full max-w-xs"
                onClick={updateUsername}
                disabled={!newUsername.trim()}
              >
                Update Username
              </button>
            </div>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-100 border border-base-300 mb-4">
          <input type="radio" name="settings-accordion" />
          <div className="collapse-title font-semibold text-lg">Application Settings</div>
          <div className="collapse-content">
            <p className="text-sm">Application settings will be available in future updates.</p>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-100 border border-base-300">
          <input type="radio" name="settings-accordion" />
          <div className="collapse-title font-semibold text-lg">Data Management</div>
          <div className="collapse-content">
            <p className="text-sm">Data management options will be available in future updates.</p>
            <p className="text-sm">Adding a feature on how on modifying the inbuilt dataset</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Options
