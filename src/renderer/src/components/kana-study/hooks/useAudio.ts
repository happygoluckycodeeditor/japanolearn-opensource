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
    
    while (i < romaji.length) {
      // Handle special combinations first
      if (i < romaji.length - 2) {
        const threeLetter = romaji.slice(i, i + 3)
        if (['chi', 'tsu', 'sha', 'shu', 'sho', 'cha', 'chu', 'cho'].includes(threeLetter)) {
          syllables.push(threeLetter)
          i += 3
          continue
        }
      }
      
      // Handle two-letter combinations
      if (i < romaji.length - 1) {
        const twoLetter = romaji.slice(i, i + 2)
        if (['shi', 'ji', 'chi', 'tsu', 'fu', 'wo'].includes(twoLetter)) {
          syllables.push(twoLetter)
          i += 2
          continue
        }
      }
      
      // Handle single letters
      syllables.push(romaji[i])
      i += 1
    }
    
    return syllables
  }

  return {
    playKanaAudio,
    playWordAudio,
    isPlaying
  }
}
