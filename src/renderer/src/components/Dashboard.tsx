/* import React from 'react' */

export default function Dashboard(): JSX.Element {
  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="text-3xl font-bold mb-6">Japanolearn Dashboard</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Study Progress Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Study Progress</h2>
            <p>You haven&apos;t started any lessons yet.</p>
            <div className="mt-4">
              <progress className="progress progress-primary w-full" value="0" max="100"></progress>
            </div>
          </div>
        </div>

        {/* Today's Lessons Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Today&apos;s Lessons</h2>
            <ul className="menu bg-base-200 rounded-box">
              <li>
                <a>Hiragana Basics We will add a better Dashboard</a>
              </li>
              <li>
                <a>Common Greetings</a>
              </li>
              <li>
                <a>Numbers 1-10</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Practice Activities Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Practice Activities</h2>
            <div className="flex flex-col gap-2">
              <button className="btn btn-primary">Flashcards</button>
              <button className="btn btn-secondary">Listening Practice</button>
              <button className="btn btn-accent">Writing Test</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
