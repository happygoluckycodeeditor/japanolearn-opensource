import React, { useState, useEffect } from 'react'

interface ImageSelectorProps {
  initialImagePath: string | null
  onImageSelected: (path: string | null) => void
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ initialImagePath, onImageSelected }) => {
  const [imagePath, setImagePath] = useState<string | null>(initialImagePath)
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    setImagePath(initialImagePath)

    // When image path changes, get the secure URL for the image
    const loadImageUrl = async (): Promise<void> => {
      if (initialImagePath) {
        try {
          const url = await window.electron.ipcRenderer.invoke(
            'get-secure-image-url',
            initialImagePath
          )
          setImageUrl(url)
        } catch (error) {
          console.error('Error loading image URL:', error)
          setImageUrl('')
        }
      } else {
        setImageUrl('')
      }
    }

    loadImageUrl()
  }, [initialImagePath])

  const handleSelectImage = async (): Promise<void> => {
    try {
      const result = await window.electron.ipcRenderer.invoke('select-image')
      if (result.success) {
        setImagePath(result.filePath)
        onImageSelected(result.filePath)

        // Get secure URL for the newly selected image
        const url = await window.electron.ipcRenderer.invoke(
          'get-secure-image-url',
          result.filePath
        )
        setImageUrl(url)
      }
    } catch (error) {
      console.error('Error selecting image:', error)
    }
  }
  const handleRemoveImage = (): void => {
    setImagePath(null)
    setImageUrl('')
    onImageSelected(null)
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

        {imagePath && imageUrl && (
          <div className="image-preview mt-2 border border-base-300 rounded-lg p-2 max-w-xs">
            <img src={imageUrl} alt="Question" className="max-h-48 max-w-full object-contain" />
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageSelector
