import React, { useState, useCallback } from 'react'

interface DictionaryEntry {
  id: number
  kanji: string
  readings: string
  meanings: string
}

const Dictionary: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DictionaryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce function to prevent too many searches while typing
  const debounce = <T extends (...args: never[]) => unknown>(func: T, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>): void => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // Search function
  const searchDictionary = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const searchResults = await window.api.dictionary.search(searchQuery)
      setResults(searchResults)
    } catch (err) {
      console.error('Dictionary search error:', err)
      setError('Failed to search the dictionary. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => searchDictionary(value), 300),
    [searchDictionary]
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }
  // Format meanings for display
  const formatMeanings = (meanings: string): JSX.Element[] => {
    return meanings.split(',').map((meaning, index) => (
      <span key={index} className="block">
        {index + 1}. {meaning.trim()}
      </span>
    ))
  }

  return (
    <div className="w-screen max-w-full p-6 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Japanese Dictionary</h1>

      {/* Search input */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search in Japanese or English..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-6">
          {results.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
            >
              {/* Kanji and readings */}
              <div className="mb-4">
                {entry.kanji && (
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {entry.kanji.split(',').join('・')}
                  </h2>
                )}
                {entry.readings && (
                  <p className="text-xl text-blue-600">{entry.readings.split(',').join('、')}</p>
                )}
              </div>

              {/* Meanings */}
              <div className="text-gray-700">
                <h3 className="font-semibold text-gray-600 mb-1">Meanings:</h3>
                <div className="pl-2">{formatMeanings(entry.meanings)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        query.trim() !== '' &&
        !loading && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No results found for &quot;{query}&quot;</p>
            <p className="text-gray-400 mt-2">Try a different search term</p>
          </div>
        )
      )}

      {/* Initial state - no search yet */}
      {query.trim() === '' && !loading && results.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">Enter a word in Japanese or English to search</p>
          <p className="text-gray-400 mt-2">Examples: 猫, ねこ, cat</p>
        </div>
      )}
    </div>
  )
}
export default Dictionary
