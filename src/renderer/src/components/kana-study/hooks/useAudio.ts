import { useCallback, useState } from 'react'

interface UseAudioReturn {
  playKanaAudio: (romaji: string, characterSet: 'hiragana' | 'katakana') => void
  playWordAudio: (romaji: string, characterSet: 'hiragana' | 'katakana') => void
  isPlaying: boolean
}

export const useAudio = (): UseAudioReturn => {
  const [isPlaying, setIsPlaying] = useState(false)
  const playKanaAudio = useCallback(
    async (romaji: string, characterSet: 'hiragana' | 'katakana') => {
      try {
        setIsPlaying(true)

        // Get secure audio URL using IPC
        const audioPath = `audio/${characterSet}/${romaji}.m4a`
        const secureUrl = await window.electron.ipcRenderer.invoke(
          'get-secure-audio-url',
          audioPath
        )

        if (!secureUrl) {
          console.warn(`No secure URL returned for audio: ${audioPath}`)
          setIsPlaying(false)
          return
        }

        // Create and play audio
        const audio = new Audio(secureUrl)

        // Handle potential errors
        audio.onerror = (error): void => {
          console.warn(`Could not play audio for ${romaji} (${characterSet}):`, error)
          setIsPlaying(false)
        }

        // Handle audio end
        audio.onended = (): void => {
          setIsPlaying(false)
        }

        // Play the audio
        audio.play().catch((error) => {
          console.warn(`Failed to play audio for ${romaji} (${characterSet}):`, error)
          setIsPlaying(false)
        })
      } catch (error) {
        console.warn(`Error creating audio for ${romaji} (${characterSet}):`, error)
        setIsPlaying(false)
      }
    },
    []
  )

  const playWordAudio = useCallback(
    async (romaji: string, characterSet: 'hiragana' | 'katakana') => {
      // For words, we'll play the audio sequentially for each syllable
      // Split romaji into syllables and play them with slight delays
      const syllables = splitRomajiIntoSyllables(romaji)

      // Debug log to verify syllable parsing
      console.log(`Playing word "${romaji}" as syllables:`, syllables)

      for (let i = 0; i < syllables.length; i++) {
        setTimeout(() => {
          playKanaAudio(syllables[i], characterSet)
        }, i * 600) // 600ms delay between syllables
      }
    },
    [playKanaAudio]
  )

  // Helper function to split romaji into syllables for audio playback
  const splitRomajiIntoSyllables = (romaji: string): string[] => {
    const syllables: string[] = []
    let i = 0

    console.log(`Parsing word: "${romaji}"`)

    while (i < romaji.length) {
      console.log(`Current position ${i}, remaining: "${romaji.slice(i)}"`)

      // Handle long vowel marks first (ー)
      if (romaji[i] === 'ー') {
        i += 1
        continue
      }

      // Handle three-letter combinations (sokuon + consonant + vowel)
      if (i < romaji.length - 2) {
        const threeLetter = romaji.slice(i, i + 3)
        console.log(`Checking three-letter: "${threeLetter}"`)
        // Special three-letter combinations
        if (
          [
            'chi',
            'tsu',
            'sha',
            'shu',
            'sho',
            'cha',
            'chu',
            'cho',
            'kya',
            'kyu',
            'kyo',
            'gya',
            'gyu',
            'gyo',
            'nya',
            'nyu',
            'nyo',
            'hya',
            'hyu',
            'hyo',
            'bya',
            'byu',
            'byo',
            'pya',
            'pyu',
            'pyo',
            'mya',
            'myu',
            'myo',
            'rya',
            'ryu',
            'ryo'
          ].includes(threeLetter)
        ) {
          console.log(`Found three-letter match: "${threeLetter}"`)
          syllables.push(threeLetter)
          i += 3
          continue
        }
      }

      // Handle two-letter combinations
      if (i < romaji.length - 1) {
        const twoLetter = romaji.slice(i, i + 2)
        console.log(`Checking two-letter: "${twoLetter}"`)

        // All valid two-letter Japanese syllables
        const validTwoLetter = [
          // Special combinations
          'shi',
          'chi',
          'tsu',
          'fu',
          'wo',
          // Consonant + vowel combinations (standard syllables)
          'ka',
          'ki',
          'ku',
          'ke',
          'ko',
          'ga',
          'gi',
          'gu',
          'ge',
          'go',
          'sa',
          'su',
          'se',
          'so', // 'shi' handled above
          'za',
          'ji',
          'zu',
          'ze',
          'zo',
          'ta',
          'te',
          'to', // 'chi', 'tsu' handled above
          'da',
          'di',
          'du',
          'de',
          'do',
          'na',
          'ni',
          'nu',
          'ne',
          'no',
          'ha',
          'hi',
          'he',
          'ho', // 'fu' handled above
          'ba',
          'bi',
          'bu',
          'be',
          'bo',
          'pa',
          'pi',
          'pu',
          'pe',
          'po',
          'ma',
          'mi',
          'mu',
          'me',
          'mo',
          'ya',
          'yu',
          'yo',
          'ra',
          'ri',
          'ru',
          're',
          'ro',
          'wa', // 'wo' handled above
          // Double consonants (sokuon)
          'kk',
          'ss',
          'tt',
          'pp'
        ]

        if (validTwoLetter.includes(twoLetter)) {
          console.log(`Found two-letter match: "${twoLetter}"`)
          syllables.push(twoLetter)
          i += 2
          continue
        }
      }

      // Handle single letters (vowels and 'n')
      const singleLetter = romaji[i]
      console.log(`Checking single letter: "${singleLetter}"`)
      if (['a', 'i', 'u', 'e', 'o', 'n'].includes(singleLetter)) {
        console.log(`Found single letter match: "${singleLetter}"`)
        syllables.push(singleLetter)
        i += 1
        continue
      }

      // If we get here, it's an unrecognized character - skip it
      console.warn(`Unrecognized romaji character: ${singleLetter} in word: ${romaji}`)
      i += 1
    }

    console.log(`Final syllables for "${romaji}":`, syllables)
    return syllables
  }

  return {
    playKanaAudio,
    playWordAudio,
    isPlaying
  }
}
