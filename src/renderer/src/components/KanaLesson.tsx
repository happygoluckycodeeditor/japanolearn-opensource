import { useState } from 'react'
import KanaStudyApp from './kana-study/KanaStudyApp'

export default function KanaLesson(): JSX.Element {
  const [mode, setMode] = useState<'hiragana' | 'katakana' | null>(null)

  if (!mode) {
    // Step 1: Choose Hiragana or Katakana
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-8">Learn Kana</h1>
        <div className="flex gap-8">
          <button
            className="bg-pink-200 hover:bg-pink-300 text-pink-900 font-bold py-8 px-12 rounded-lg text-2xl shadow-lg transition"
            onClick={() => setMode('hiragana')}
          >
            Learn Hiragana
          </button>
          <button
            className="bg-blue-200 hover:bg-blue-300 text-blue-900 font-bold py-8 px-12 rounded-lg text-2xl shadow-lg transition"
            onClick={() => setMode('katakana')}
          >
            Learn Katakana
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Show the full study app for the selected script
  return (
    <div>
      <KanaStudyApp initialKanaType={mode} />
      <div className="flex justify-center mt-4">
        <button
          className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 text-lg"
          onClick={() => setMode(null)}
        >
          Back
        </button>
      </div>
    </div>
  )
}
