import { useState } from 'react'

const kanaIntro = {
  hiragana: {
    title: 'What is Hiragana?',
    description:
      "Hiragana is one of the two basic Japanese syllabaries. It is used for native Japanese words and grammatical elements. Let's start learning Hiragana in a fun way!"
  },
  katakana: {
    title: 'What is Katakana?',
    description:
      "Katakana is the other basic Japanese syllabary. It is mainly used for foreign words, names, and onomatopoeia. Let's start learning Katakana in a fun way!"
  }
}

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

  // Step 2: Show intro slide for selected script
  const intro = kanaIntro[mode]
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">{intro.title}</h1>
      <p className="text-lg mb-8 max-w-xl text-center">{intro.description}</p>
      {/* Next: Add slide/flashcard navigation here */}
      <button
        className="mt-4 px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 text-lg"
        onClick={() => setMode(null)}
      >
        Back
      </button>
    </div>
  )
}
