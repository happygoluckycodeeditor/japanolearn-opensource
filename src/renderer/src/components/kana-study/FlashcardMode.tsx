export default function FlashcardMode(): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-700">🃏 Flashcard Mode</h1>
        <p className="text-lg text-gray-700 mb-6">
          <span className="font-semibold">Coming Soon!</span> <br />
          Flashcard Mode is currently in the{' '}
          <span className="text-blue-600 font-semibold">research phase</span>.<br />
          We are working on incorporating the{' '}
          <span className="font-semibold">SM-2 Spaced Repetition Algorithm</span> and advanced
          memory science features for optimal learning.
        </p>
        <div className="mt-4 text-gray-500 text-sm">
          <ul className="list-disc list-inside text-left inline-block">
            <li>SM-2 Spaced Repetition</li>
            <li>Personalized review scheduling</li>
            <li>Memory science-backed learning</li>
            <li>Progress tracking &amp; mastery</li>
          </ul>
        </div>
        <div className="mt-8">
          <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
            Stay tuned for updates!
          </span>
        </div>
      </div>
    </div>
  )
}
