import React from 'react'

interface DictionaryEntryProps {
  id: number
  kanji: string
  readings: string
  meanings: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DictionaryEntry: React.FC<DictionaryEntryProps> = ({ kanji, readings, meanings }) => {
  // Format meanings for display
  const formatMeanings = (meanings: string): JSX.Element[] => {
    return meanings.split(',').map((meaning, index) => (
      <span key={index} className="block">
        {index + 1}. {meaning.trim()}
      </span>
    ))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
      {/* Kanji and readings */}
      <div className="mb-4">
        {kanji && (
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{kanji.split(',').join('・')}</h2>
        )}
        {readings && <p className="text-xl text-blue-600">{readings.split(',').join('、')}</p>}
      </div>

      {/* Meanings */}
      <div className="text-gray-700">
        <h3 className="font-semibold text-gray-600 mb-1">Meanings:</h3>
        <div className="pl-2">{formatMeanings(meanings)}</div>
      </div>
    </div>
  )
}

export default DictionaryEntry
