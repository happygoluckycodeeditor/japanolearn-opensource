import { useState, useEffect } from 'react'
import { hiraganaGroups, katakanaGroups, Character } from './data/japanese-characters'
import { hiraganaWords, katakanaWords, Word } from './data/japanese-words'
import { useAudio } from './hooks/useAudio'

type LearningPhase = 'learn' | 'quiz' | 'practice'
type StudyMode = 'character-to-romaji' | 'romaji-to-character'
type CharacterSet = 'hiragana' | 'katakana'

interface StudySession {
  currentIndex: number
  score: number
  total: number
  incorrectAnswers: (Character | Word)[]
}

interface KanaStudyAppProps {
  initialKanaType?: 'hiragana' | 'katakana'
  onBack?: () => void
}

export default function KanaStudyApp({ initialKanaType, onBack }: KanaStudyAppProps): JSX.Element {
  const [characterSet, setCharacterSet] = useState<CharacterSet>(initialKanaType || 'hiragana')
  const [selectedGroup, setSelectedGroup] = useState<string>('Basic Vowels')
  const [learningPhase, setLearningPhase] = useState<LearningPhase>('learn')
  const [studyMode, setStudyMode] = useState<StudyMode>('character-to-romaji')
  const [currentCharacters, setCurrentCharacters] = useState<Character[]>([])
  const [currentWords, setCurrentWords] = useState<Word[]>([])
  const [session, setSession] = useState<StudySession>({
    currentIndex: 0,
    score: 0,
    total: 0,
    incorrectAnswers: []
  })
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [options, setOptions] = useState<string[]>([])

  // Audio hook
  const { playKanaAudio, isPlaying } = useAudio()

  const groups = characterSet === 'hiragana' ? hiraganaGroups : katakanaGroups
  const wordGroups = characterSet === 'hiragana' ? hiraganaWords : katakanaWords
  const currentGroup = groups.find((g) => g.name === selectedGroup)
  const currentWordGroup = wordGroups.find((g) => g.groupName === selectedGroup)

  useEffect(() => {
    resetSession()
  }, [currentGroup, characterSet, selectedGroup, learningPhase])

  useEffect(() => {
    if (
      learningPhase === 'quiz' &&
      currentCharacters.length > 0 &&
      session.currentIndex < currentCharacters.length
    ) {
      generateQuizOptions()
    } else if (
      learningPhase === 'practice' &&
      currentWords.length > 0 &&
      session.currentIndex < currentWords.length
    ) {
      generateWordOptions()
    }
  }, [currentCharacters, currentWords, session.currentIndex, studyMode, learningPhase])

  const resetSession = (): void => {
    if (learningPhase === 'learn' && currentGroup) {
      setCurrentCharacters(currentGroup.characters)
      setSession({
        currentIndex: 0,
        score: 0,
        total: currentGroup.characters.length,
        incorrectAnswers: []
      })
    } else if (learningPhase === 'quiz' && currentGroup) {
      const shuffled = [...currentGroup.characters].sort(() => Math.random() - 0.5)
      setCurrentCharacters(shuffled)
      setSession({ currentIndex: 0, score: 0, total: shuffled.length, incorrectAnswers: [] })
    } else if (learningPhase === 'practice' && currentWordGroup) {
      const shuffled = [...currentWordGroup.words].sort(() => Math.random() - 0.5)
      setCurrentWords(shuffled)
      setSession({ currentIndex: 0, score: 0, total: shuffled.length, incorrectAnswers: [] })
    }
    setShowResult(false)
    setSelectedAnswer('')
  }

  const generateQuizOptions = (): void => {
    if (currentCharacters.length === 0) return

    const currentChar = currentCharacters[session.currentIndex]
    const correctAnswer =
      studyMode === 'character-to-romaji' ? currentChar.romaji : currentChar.character

    const otherChars = currentGroup?.characters.filter((c) => c !== currentChar) || []
    const wrongOptions = otherChars
      .map((c) => (studyMode === 'character-to-romaji' ? c.romaji : c.character))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
  }

  const generateWordOptions = (): void => {
    if (currentWords.length === 0) return

    const currentWord = currentWords[session.currentIndex]
    const correctAnswer = currentWord.meaning

    const otherWords = currentWordGroup?.words.filter((w) => w !== currentWord) || []
    const wrongOptions = otherWords
      .map((w) => w.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
  }

  const handleAnswer = (answer: string): void => {
    if (showResult) return

    setSelectedAnswer(answer)
    let correct = false

    if (learningPhase === 'quiz') {
      const currentChar = currentCharacters[session.currentIndex]
      const correctAnswer =
        studyMode === 'character-to-romaji' ? currentChar.romaji : currentChar.character
      correct = answer === correctAnswer
    } else if (learningPhase === 'practice') {
      const currentWord = currentWords[session.currentIndex]
      correct = answer === currentWord.meaning
    }

    setIsCorrect(correct)
    setShowResult(true)

    setSession((prev) => ({
      ...prev,
      score: correct ? prev.score + 1 : prev.score,
      incorrectAnswers: correct
        ? prev.incorrectAnswers
        : [
            ...prev.incorrectAnswers,
            learningPhase === 'quiz'
              ? currentCharacters[session.currentIndex]
              : currentWords[session.currentIndex]
          ]
    }))
  }

  const nextQuestion = (): void => {
    setSession((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }))
    setShowResult(false)
    setSelectedAnswer('')
  }

  const prevCharacter = (): void => {
    if (session.currentIndex > 0) {
      setSession((prev) => ({ ...prev, currentIndex: prev.currentIndex - 1 }))
    }
  }

  const nextCharacter = (): void => {
    if (session.currentIndex < session.total - 1) {
      setSession((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }))
    }
  }

  const isComplete = session.currentIndex >= session.total
  const progressPercentage =
    session.total > 0
      ? ((session.currentIndex + (learningPhase === 'learn' ? 0 : 1)) / session.total) * 100
      : 0

  // Phase icons
  const phaseIcons = {
    learn: '📚',
    quiz: '🧠',
    practice: '✏️'
  }

  if (isComplete && learningPhase !== 'learn') {
    return (
      <div className="min-h-screen p-4 pt-24 sm:pt-20 lg:pt-22 flex items-start justify-center">
        <div className="card bg-base-100 shadow-xl w-full max-w-[1100px]">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center">
              {learningPhase === 'quiz' ? 'Quiz Complete!' : 'Practice Complete!'}
            </h2>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-6xl">🎉</div>
                <div className="space-y-2">
                  <p className="text-2xl">
                    Score: {session.score}/{session.total}
                  </p>
                  <p className="text-lg text-base-content/70">
                    {Math.round((session.score / session.total) * 100)}% correct
                  </p>
                </div>
              </div>

              {session.incorrectAnswers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg">Review These:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {session.incorrectAnswers.map((item, index) => (
                      <div key={index} className="p-4 bg-base-200 rounded-lg text-center">
                        {'character' in item ? (
                          <>
                            <div className="text-2xl mb-1">{item.character}</div>
                            <div className="text-sm text-base-content/70">{item.romaji}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-xl mb-1">{item.word}</div>
                            <div className="text-sm text-base-content/70">{item.meaning}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button onClick={resetSession} className="btn btn-primary w-full">
                  🔄 Try Again
                </button>
                {learningPhase === 'quiz' && (
                  <button
                    onClick={() => setLearningPhase('practice')}
                    className="btn btn-outline w-full"
                  >
                    ✏️ Continue to Word Practice
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pt-24 sm:pt-20 lg:pt-22 flex items-start justify-center">
      <div className="card bg-base-100 shadow-xl w-full max-w-[1100px] h-fit">
        <div className="card-body px-8 py-6">
          <h2 className="card-title text-2xl justify-center mb-4">Japanese Character Learning</h2>

          {/* Back button */}
          {onBack && (
            <div className="flex justify-start mb-4">
              <button onClick={onBack} className="btn btn-outline btn-sm">
                ← Back to Mode Selection
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Learning Phase Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['learn', 'quiz', 'practice'] as LearningPhase[]).map((phase) => (
                <button
                  key={phase}
                  className={`btn ${learningPhase === phase ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={() => setLearningPhase(phase)}
                >
                  <span className="mr-2">{phaseIcons[phase]}</span>
                  <span className="capitalize">{phase}</span>
                </button>
              ))}
            </div>

            {/* Character Set Tabs */}
            <div className="tabs tabs-boxed">
              <button
                className={`tab ${characterSet === 'hiragana' ? 'tab-active' : ''}`}
                onClick={() => setCharacterSet('hiragana')}
              >
                Hiragana
              </button>
              <button
                className={`tab ${characterSet === 'katakana' ? 'tab-active' : ''}`}
                onClick={() => setCharacterSet('katakana')}
              >
                Katakana
              </button>
            </div>

            {/* Character Group and Quiz Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Character Group</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  {groups.map((group) => (
                    <option key={group.name} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {learningPhase === 'quiz' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Quiz Mode</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={studyMode}
                    onChange={(e) => setStudyMode(e.target.value as StudyMode)}
                  >
                    <option value="character-to-romaji">Character → Romaji</option>
                    <option value="romaji-to-character">Romaji → Character</option>
                  </select>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Progress</span>
                <span className="badge badge-outline">
                  {session.currentIndex + 1} / {session.total}
                </span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={progressPercentage}
                max="100"
              ></progress>
            </div>

            {/* Main Content Area */}
            <div className="space-y-4">
              {/* Learn Mode */}
              {learningPhase === 'learn' && currentCharacters[session.currentIndex] && (
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="text-6xl sm:text-7xl lg:text-5xl xl:text-6xl font-mono p-6 bg-base-200 rounded-lg">
                          {currentCharacters[session.currentIndex].character}
                        </div>
                        <button
                          className={`btn btn-circle btn-sm absolute -top-2 -right-2 ${
                            isPlaying ? 'btn-secondary animate-pulse' : 'btn-primary'
                          }`}
                          onClick={() =>
                            playKanaAudio(
                              currentCharacters[session.currentIndex].romaji,
                              characterSet
                            )
                          }
                          title="Play pronunciation"
                          disabled={isPlaying}
                        >
                          {isPlaying ? '🔊' : '🔊'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl">{currentCharacters[session.currentIndex].romaji}</p>
                        <p className="text-lg text-base-content/70">
                          Pronounced: &quot;{currentCharacters[session.currentIndex].romaji}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Character Information</h3>
                      <div className="bg-base-200 p-4 rounded-lg text-left space-y-2">
                        <div>
                          <span className="font-semibold">Character:</span>{' '}
                          {currentCharacters[session.currentIndex].character}
                        </div>
                        <div>
                          <span className="font-semibold">Reading:</span>{' '}
                          {currentCharacters[session.currentIndex].reading}
                        </div>
                        <div>
                          <span className="font-semibold">Romaji:</span>{' '}
                          {currentCharacters[session.currentIndex].romaji}
                        </div>
                        <div>
                          <span className="font-semibold">Position:</span>{' '}
                          {session.currentIndex + 1} of {session.total}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      className="btn btn-outline"
                      onClick={prevCharacter}
                      disabled={session.currentIndex === 0}
                    >
                      ← Previous
                    </button>

                    {session.currentIndex === session.total - 1 ? (
                      <button onClick={() => setLearningPhase('quiz')} className="btn btn-primary">
                        🧠 Start Quiz
                      </button>
                    ) : (
                      <button onClick={nextCharacter} className="btn btn-primary">
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Mode */}
              {learningPhase === 'quiz' && currentCharacters[session.currentIndex] && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="text-center space-y-3">
                      <div className="space-y-2">
                        <p className="text-sm text-base-content/70">
                          {studyMode === 'character-to-romaji'
                            ? 'What is the romaji for:'
                            : 'Which character represents:'}
                        </p>
                        <div className="relative">
                          <div className="text-6xl sm:text-7xl lg:text-5xl xl:text-6xl font-mono p-6 bg-base-200 rounded-lg">
                            {studyMode === 'character-to-romaji'
                              ? currentCharacters[session.currentIndex].character
                              : currentCharacters[session.currentIndex].romaji}
                          </div>
                          <button
                            className={`btn btn-circle btn-sm absolute -top-2 -right-2 ${
                              isPlaying ? 'btn-secondary animate-pulse' : 'btn-primary'
                            }`}
                            onClick={() =>
                              playKanaAudio(
                                currentCharacters[session.currentIndex].romaji,
                                characterSet
                              )
                            }
                            title="Play pronunciation"
                            disabled={isPlaying}
                          >
                            {isPlaying ? '🔊' : '🔊'}
                          </button>
                        </div>
                      </div>

                      {showResult && (
                        <div className="flex items-center justify-center space-x-2">
                          {isCorrect ? (
                            <>
                              <span className="text-success">✅</span>
                              <span className="text-success">Correct!</span>
                            </>
                          ) : (
                            <>
                              <span className="text-error">❌</span>
                              <span className="text-error">
                                Incorrect. The answer is:{' '}
                                {studyMode === 'character-to-romaji'
                                  ? currentCharacters[session.currentIndex].romaji
                                  : currentCharacters[session.currentIndex].character}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">
                        Question {session.currentIndex + 1} of {session.total}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((option, index) => (
                          <button
                            key={index}
                            className={`btn ${
                              showResult
                                ? option === selectedAnswer
                                  ? isCorrect
                                    ? 'btn-success'
                                    : 'btn-error'
                                  : option ===
                                      (studyMode === 'character-to-romaji'
                                        ? currentCharacters[session.currentIndex].romaji
                                        : currentCharacters[session.currentIndex].character)
                                    ? 'btn-success'
                                    : 'btn-outline'
                                : 'btn-outline'
                            } btn-md h-12`}
                            onClick={() => handleAnswer(option)}
                            disabled={showResult}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {showResult && (
                    <button onClick={nextQuestion} className="btn btn-primary w-full btn-lg">
                      {session.currentIndex + 1 >= session.total
                        ? 'Complete Quiz'
                        : 'Next Question'}
                    </button>
                  )}
                </>
              )}

              {/* Practice Mode */}
              {learningPhase === 'practice' && currentWords[session.currentIndex] && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="text-center space-y-3">
                      <div className="space-y-2">
                        <p className="text-sm text-base-content/70">What does this word mean?</p>
                        <div className="space-y-2">
                          <div className="text-5xl sm:text-6xl lg:text-4xl xl:text-5xl font-mono p-4 bg-base-200 rounded-lg">
                            {currentWords[session.currentIndex].word}
                          </div>
                          <div className="text-xl text-base-content/70">
                            {currentWords[session.currentIndex].reading} (
                            {currentWords[session.currentIndex].romaji})
                          </div>
                        </div>
                      </div>

                      {showResult && (
                        <div className="flex items-center justify-center space-x-2">
                          {isCorrect ? (
                            <>
                              <span className="text-success">✅</span>
                              <span className="text-success">Correct!</span>
                            </>
                          ) : (
                            <>
                              <span className="text-error">❌</span>
                              <span className="text-error">
                                Incorrect. The answer is:{' '}
                                {currentWords[session.currentIndex].meaning}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">
                        Word {session.currentIndex + 1} of {session.total}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((option, index) => (
                          <button
                            key={index}
                            className={`btn ${
                              showResult
                                ? option === selectedAnswer
                                  ? isCorrect
                                    ? 'btn-success'
                                    : 'btn-error'
                                  : option === currentWords[session.currentIndex].meaning
                                    ? 'btn-success'
                                    : 'btn-outline'
                                : 'btn-outline'
                            } btn-md h-12`}
                            onClick={() => handleAnswer(option)}
                            disabled={showResult}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {showResult && (
                    <button onClick={nextQuestion} className="btn btn-primary w-full btn-lg">
                      {session.currentIndex + 1 >= session.total
                        ? 'Complete Practice'
                        : 'Next Word'}
                    </button>
                  )}
                </>
              )}

              <div className="flex justify-center">
                <button onClick={resetSession} className="btn btn-outline btn-sm">
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
