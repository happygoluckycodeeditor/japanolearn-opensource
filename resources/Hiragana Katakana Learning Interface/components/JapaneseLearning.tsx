import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { hiraganaGroups, katakanaGroups, Character, CharacterGroup } from '../data/japanese-characters';
import { hiraganaWords, katakanaWords, Word, WordGroup } from '../data/japanese-words';
import { Shuffle, RotateCcw, CheckCircle, XCircle, ChevronLeft, ChevronRight, BookOpen, Brain, Pencil } from 'lucide-react';

type LearningPhase = 'learn' | 'quiz' | 'practice';
type StudyMode = 'character-to-romaji' | 'romaji-to-character';
type CharacterSet = 'hiragana' | 'katakana';

interface StudySession {
  currentIndex: number;
  score: number;
  total: number;
  incorrectAnswers: (Character | Word)[];
}

export function JapaneseLearning() {
  const [characterSet, setCharacterSet] = useState<CharacterSet>('hiragana');
  const [selectedGroup, setSelectedGroup] = useState<string>('Basic Vowels');
  const [learningPhase, setLearningPhase] = useState<LearningPhase>('learn');
  const [studyMode, setStudyMode] = useState<StudyMode>('character-to-romaji');
  const [currentCharacters, setCurrentCharacters] = useState<Character[]>([]);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [session, setSession] = useState<StudySession>({
    currentIndex: 0,
    score: 0,
    total: 0,
    incorrectAnswers: []
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([]);

  const groups = characterSet === 'hiragana' ? hiraganaGroups : katakanaGroups;
  const wordGroups = characterSet === 'hiragana' ? hiraganaWords : katakanaWords;
  const currentGroup = groups.find(g => g.name === selectedGroup);
  const currentWordGroup = wordGroups.find(g => g.groupName === selectedGroup);

  useEffect(() => {
    resetSession();
  }, [currentGroup, characterSet, selectedGroup, learningPhase]);

  useEffect(() => {
    if (learningPhase === 'quiz' && currentCharacters.length > 0 && session.currentIndex < currentCharacters.length) {
      generateQuizOptions();
    } else if (learningPhase === 'practice' && currentWords.length > 0 && session.currentIndex < currentWords.length) {
      generateWordOptions();
    }
  }, [currentCharacters, currentWords, session.currentIndex, studyMode, learningPhase]);

  const resetSession = () => {
    if (learningPhase === 'learn' && currentGroup) {
      setCurrentCharacters(currentGroup.characters);
      setSession({ currentIndex: 0, score: 0, total: currentGroup.characters.length, incorrectAnswers: [] });
    } else if (learningPhase === 'quiz' && currentGroup) {
      const shuffled = [...currentGroup.characters].sort(() => Math.random() - 0.5);
      setCurrentCharacters(shuffled);
      setSession({ currentIndex: 0, score: 0, total: shuffled.length, incorrectAnswers: [] });
    } else if (learningPhase === 'practice' && currentWordGroup) {
      const shuffled = [...currentWordGroup.words].sort(() => Math.random() - 0.5);
      setCurrentWords(shuffled);
      setSession({ currentIndex: 0, score: 0, total: shuffled.length, incorrectAnswers: [] });
    }
    setShowResult(false);
    setSelectedAnswer('');
  };

  const generateQuizOptions = () => {
    if (currentCharacters.length === 0) return;

    const currentChar = currentCharacters[session.currentIndex];
    const correctAnswer = studyMode === 'character-to-romaji' ? currentChar.romaji : currentChar.character;
    
    const otherChars = currentGroup?.characters.filter(c => c !== currentChar) || [];
    const wrongOptions = otherChars
      .map(c => studyMode === 'character-to-romaji' ? c.romaji : c.character)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const generateWordOptions = () => {
    if (currentWords.length === 0) return;

    const currentWord = currentWords[session.currentIndex];
    const correctAnswer = currentWord.meaning;
    
    const otherWords = currentWordGroup?.words.filter(w => w !== currentWord) || [];
    const wrongOptions = otherWords
      .map(w => w.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    let correct = false;

    if (learningPhase === 'quiz') {
      const currentChar = currentCharacters[session.currentIndex];
      const correctAnswer = studyMode === 'character-to-romaji' ? currentChar.romaji : currentChar.character;
      correct = answer === correctAnswer;
    } else if (learningPhase === 'practice') {
      const currentWord = currentWords[session.currentIndex];
      correct = answer === currentWord.meaning;
    }
    
    setIsCorrect(correct);
    setShowResult(true);

    setSession(prev => ({
      ...prev,
      score: correct ? prev.score + 1 : prev.score,
      incorrectAnswers: correct ? prev.incorrectAnswers : [
        ...prev.incorrectAnswers, 
        learningPhase === 'quiz' ? currentCharacters[session.currentIndex] : currentWords[session.currentIndex]
      ]
    }));
  };

  const nextQuestion = () => {
    setSession(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    setShowResult(false);
    setSelectedAnswer('');
  };

  const prevCharacter = () => {
    if (session.currentIndex > 0) {
      setSession(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    }
  };

  const nextCharacter = () => {
    if (session.currentIndex < session.total - 1) {
      setSession(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }
  };

  const isComplete = session.currentIndex >= session.total;
  const progressPercentage = session.total > 0 ? ((session.currentIndex + (learningPhase === 'learn' ? 0 : 1)) / session.total) * 100 : 0;

  // Phase icons
  const phaseIcons = {
    learn: BookOpen,
    quiz: Brain,
    practice: Pencil
  };

  if (isComplete && learningPhase !== 'learn') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>{learningPhase === 'quiz' ? 'Quiz Complete!' : 'Practice Complete!'}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <div className="text-6xl">🎉</div>
            <div className="space-y-2">
              <p className="text-2xl">Score: {session.score}/{session.total}</p>
              <p className="text-lg text-muted-foreground">
                {Math.round((session.score / session.total) * 100)}% correct
              </p>
            </div>
          </div>

          {session.incorrectAnswers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg">Review These:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {session.incorrectAnswers.map((item, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg text-center">
                    {'character' in item ? (
                      <>
                        <div className="text-2xl mb-1">{item.character}</div>
                        <div className="text-sm text-muted-foreground">{item.romaji}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl mb-1">{item.word}</div>
                        <div className="text-sm text-muted-foreground">{item.meaning}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button onClick={resetSession} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {learningPhase === 'quiz' && (
              <Button 
                onClick={() => setLearningPhase('practice')} 
                variant="outline" 
                className="w-full"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Continue to Word Practice
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Japanese Character Learning</CardTitle>
        <div className="space-y-4">
          {/* Learning Phase Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['learn', 'quiz', 'practice'] as LearningPhase[]).map((phase) => {
              const Icon = phaseIcons[phase];
              return (
                <Button
                  key={phase}
                  variant={learningPhase === phase ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLearningPhase(phase)}
                  className="flex items-center justify-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{phase}</span>
                </Button>
              );
            })}
          </div>

          <Tabs value={characterSet} onValueChange={(value) => setCharacterSet(value as CharacterSet)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hiragana">Hiragana</TabsTrigger>
              <TabsTrigger value="katakana">Katakana</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Character Group</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.name} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {learningPhase === 'quiz' && (
              <div className="space-y-2">
                <label className="text-sm">Quiz Mode</label>
                <Select value={studyMode} onValueChange={(value) => setStudyMode(value as StudyMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="character-to-romaji">Character → Romaji</SelectItem>
                    <SelectItem value="romaji-to-character">Romaji → Character</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Progress</span>
              <Badge variant="outline">
                {session.currentIndex + 1} / {session.total}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Learn Mode */}
        {learningPhase === 'learn' && currentCharacters[session.currentIndex] && (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="text-8xl sm:text-9xl font-mono p-8 bg-muted rounded-lg">
                {currentCharacters[session.currentIndex].character}
              </div>
              <div className="space-y-2">
                <p className="text-2xl">{currentCharacters[session.currentIndex].romaji}</p>
                <p className="text-lg text-muted-foreground">
                  Pronounced: "{currentCharacters[session.currentIndex].romaji}"
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevCharacter}
                disabled={session.currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {session.currentIndex === session.total - 1 ? (
                <Button onClick={() => setLearningPhase('quiz')}>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              ) : (
                <Button onClick={nextCharacter}>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Quiz Mode */}
        {learningPhase === 'quiz' && currentCharacters[session.currentIndex] && (
          <>
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {studyMode === 'character-to-romaji' ? 'What is the romaji for:' : 'Which character represents:'}
                </p>
                <div className="text-8xl sm:text-9xl font-mono p-8 bg-muted rounded-lg">
                  {studyMode === 'character-to-romaji' ? currentCharacters[session.currentIndex].character : currentCharacters[session.currentIndex].romaji}
                </div>
              </div>

              {showResult && (
                <div className="flex items-center justify-center space-x-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-600">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-red-600">
                        Incorrect. The answer is: {studyMode === 'character-to-romaji' ? currentCharacters[session.currentIndex].romaji : currentCharacters[session.currentIndex].character}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant={showResult ? 
                    (option === selectedAnswer ? 
                      (isCorrect ? "default" : "destructive") : 
                      (option === (studyMode === 'character-to-romaji' ? currentCharacters[session.currentIndex].romaji : currentCharacters[session.currentIndex].character) ? "default" : "outline")
                    ) : "outline"
                  }
                  size="lg"
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className="p-6 text-lg"
                >
                  {option}
                </Button>
              ))}
            </div>

            {showResult && (
              <Button onClick={nextQuestion} className="w-full" size="lg">
                {session.currentIndex + 1 >= session.total ? 'Complete Quiz' : 'Next Question'}
              </Button>
            )}
          </>
        )}

        {/* Practice Mode */}
        {learningPhase === 'practice' && currentWords[session.currentIndex] && (
          <>
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">What does this word mean?</p>
                <div className="space-y-2">
                  <div className="text-6xl sm:text-7xl font-mono p-6 bg-muted rounded-lg">
                    {currentWords[session.currentIndex].word}
                  </div>
                  <div className="text-xl text-muted-foreground">
                    {currentWords[session.currentIndex].reading} ({currentWords[session.currentIndex].romaji})
                  </div>
                </div>
              </div>

              {showResult && (
                <div className="flex items-center justify-center space-x-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-600">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-red-600">
                        Incorrect. The answer is: {currentWords[session.currentIndex].meaning}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant={showResult ? 
                    (option === selectedAnswer ? 
                      (isCorrect ? "default" : "destructive") : 
                      (option === currentWords[session.currentIndex].meaning ? "default" : "outline")
                    ) : "outline"
                  }
                  size="lg"
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className="p-6 text-lg"
                >
                  {option}
                </Button>
              ))}
            </div>

            {showResult && (
              <Button onClick={nextQuestion} className="w-full" size="lg">
                {session.currentIndex + 1 >= session.total ? 'Complete Practice' : 'Next Word'}
              </Button>
            )}
          </>
        )}

        <div className="flex justify-center">
          <Button variant="outline" onClick={resetSession} size="sm">
            <Shuffle className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}