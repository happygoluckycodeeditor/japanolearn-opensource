interface DictionaryEntry {
  id: number
  kanji: string
  readings: string
  meanings: string
}

interface DictionaryAPI {
  search: (query: string) => Promise<DictionaryEntry[]>
}

interface API {
  dictionary: DictionaryAPI
}

interface Window {
  api: API
}
