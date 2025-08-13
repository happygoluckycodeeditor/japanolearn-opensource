import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModeSelector from './ModeSelector'
import KanaStudyApp from './KanaStudyApp'

// Types for ModeSelector and KanaStudyApp
import type { KanaType, StudyMode } from './types'

export default function KanaStudyMain(): JSX.Element {
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null)
  const kanaType: KanaType = 'hiragana'
  const navigate = useNavigate()

  // Back to mode selector
  const handleBack = (): void => setSelectedMode(null)

  // Navigate back to dashboard
  const handleBackToDashboard = (): void => {
    navigate('/dashboard')
  }

  // When a mode is selected in ModeSelector
  const handleModeSelect = (mode: StudyMode): void => setSelectedMode(mode)

  if (!selectedMode) {
    return (
      <ModeSelector
        kanaType={kanaType}
        onModeSelect={handleModeSelect}
        onBack={handleBackToDashboard}
      />
    )
  }

  // Only allow supported modes for now
  if (
    (selectedMode as string) === 'learn' ||
    (selectedMode as string) === 'quiz' ||
    (selectedMode as string) === 'practice'
  ) {
    return <KanaStudyApp initialKanaType={kanaType} onBack={handleBack} />
  }

  // For unsupported modes (e.g., flashcards, writing, listening)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
      <p className="mb-4">This study mode is under development.</p>
      <button className="btn btn-primary" onClick={handleBack}>
        ← Back to Mode Selection
      </button>
    </div>
  )
}
