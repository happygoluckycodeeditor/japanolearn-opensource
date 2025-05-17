import React, { useState, useEffect } from 'react'

interface ImageSelectorProps {
  initialImagePath: string | null
  onImageSelected: (path: string | null) => void
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ initialImagePath, onImageSelected }) => {
  const [imagePath, setImagePath] = useState<string | null>(initialImagePath)
  const [userDataPath, setUserDataPath] = useState<string>('')

  useEffect(() => {
    // Get user data path for displaying stored images
    const getUserDataPath = async (): Promise<void> => {
      const path = await window.electron.ipcRenderer.invoke('get-user-data-path')
      setUserDataPath(path)
    }
    getUserDataPath()
  }, [])

  useEffect(() => {
    setImagePath(initialImagePath)
  }, [initialImagePath])

  const handleSelectImage = async (): Promise<void> => {
    try {
      const result = await window.electron.ipcRenderer.invoke('select-image')
      if (result.success) {
        setImagePath(result.filePath)
        onImageSelected(result.filePath)
      }
    } catch (error) {
      console.error('Error selecting image:', error)
    }
  }
  const handleRemoveImage = (): void => {
    setImagePath(null)
    onImageSelected(null)
  }
  // Function to get the correct image source
  const getImageSrc = (): string => {
    if (!imagePath) return ''

    // If it's a stored image (relative path)
    if (imagePath.startsWith('question_images/')) {
      return `file://${userDataPath}/${imagePath}`
    }

    // If it's a newly selected image (absolute path)
    return `file://${imagePath}`
  }
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Question Image (Optional)</span>
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button type="button" className="btn btn-sm btn-outline" onClick={handleSelectImage}>
            {imagePath ? 'Change Image' : 'Add Image'}
          </button>

          {imagePath && (
            <button
              type="button"
              className="btn btn-sm btn-outline btn-error"
              onClick={handleRemoveImage}
            >
              Remove Image
            </button>
          )}
        </div>

        {imagePath && userDataPath && (
          <div className="image-preview mt-2 border border-base-300 rounded-lg p-2 max-w-xs">
            <img
              src={getImageSrc()}
              alt="Question"
              className="max-h-48 max-w-full object-contain"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageSelector
