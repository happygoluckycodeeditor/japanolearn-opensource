import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import SetupForm from './components/SetupForm'

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
        <h1 className="text-4xl font-bold mb-4">Welcome to Japanolearn</h1>
        <p className="text-lg mb-8">This is the opensource version!</p>

        <div className="transition-all duration-300 ease-in-out">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupForm />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
