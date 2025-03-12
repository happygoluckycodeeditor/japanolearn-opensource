import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { useEffect, useState } from 'react'
import img1 from '../assets/images/img1.svg'
import img2 from '../assets/images/img2.svg'
import img3 from '../assets/images/img3.svg'

export default function Dashboard(): JSX.Element {
  const [username, setUsername] = useState('User')

  useEffect(() => {
    async function fetchUsername(): Promise<void> {
      const result = await window.electron.ipcRenderer.invoke('get-users')

      if (result.success && result.users && result.users.length > 0) {
        setUsername(result.users[0].username)
      }
    }

    fetchUsername()
  }, [])

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24">
      {/*Greeting */}
      <h1 className="text-4xl font-bold mb-4">Welcome to Japanolearn</h1>
      <p className="mt-4">Hello, {username}!</p>

      {/* Masonry Layout */}
      <div className="mt-6">
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry gutter="16px">
            {/* Hiragana Card */}
            {/* Hiragana Card with Background Image */}
            <div
              className="
              relative
              bg-blue-200
              rounded-lg
              p-5
              h-64
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              w-full
              "
              style={{
                backgroundImage: `url(${img1})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}
            >
              {/* Overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gray-200 opacity-50 rounded-lg"></div>

              {/* Content positioned above the overlay */}
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-blue-800">Lessons</h2>
                <p className="mt-2 text-blue-700">Get Started with Japanese lessons!</p>
                <div className="mt-3 text-blue-600">
                  <span className="inline-block bg-blue-100 rounded px-2 py-1 mr-1">あ</span>
                  <span className="inline-block bg-blue-100 rounded px-2 py-1 mr-1">い</span>
                  <span className="inline-block bg-blue-100 rounded px-2 py-1 mr-1">う</span>
                  <span className="inline-block bg-blue-100 rounded px-2 py-1">え</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-4xl z-10">あ</div>
            </div>

            {/* Katakana Card */}
            <div
              className="
              relative 
              bg-green-200 
              rounded-lg 
              p-5
              w-full
              h-60 
              cursor-pointer 
              transition-shadow 
              duration-300 
              ease-in-out 
              hover:shadow-2xl
              "
            >
              <h2 className="text-lg font-bold text-green-800">Katakana Challenge</h2>
              <p className="mt-2 text-green-700">
                Learn foreign words written in the Japanese syllabary.
              </p>
              <div className="absolute bottom-4 right-4 text-4xl">カ</div>
              <div className="mt-3 text-green-600">
                <span className="inline-block bg-green-100 rounded px-2 py-1 mr-1">コーヒー</span>
                <span className="inline-block bg-green-100 rounded px-2 py-1 mr-1">パン</span>
              </div>
            </div>

            {/* Kanji Card */}
            <div
              className="
              relative
              bg-purple-200
              rounded-lg
              p-5
              w-full
              h-64
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              "
              style={{
                backgroundImage: `url(${img2})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}
            >
              {/* Overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gray-200 opacity-50 rounded-lg"></div>

              <div className="relative z-10">
                <h2 className="text-lg font-bold text-purple-800">Dictionary</h2>
                <p className="mt-2 text-purple-700">
                  Discover and learn Japanese words and Phrases.
                </p>

                <div className="mt-3 text-purple-600">
                  <span className="inline-block bg-purple-100 rounded px-2 py-1 mr-1">人</span>
                  <span className="inline-block bg-purple-100 rounded px-2 py-1 mr-1">日</span>
                  <span className="inline-block bg-purple-100 rounded px-2 py-1 mr-1">月</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-4xl">水</div>
            </div>

            {/* Vocabulary Card */}
            <div
              className="
              relative
              bg-red-200
              rounded-lg
              p-5
              w-full
              h-60
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              "
            >
              <h2 className="text-lg font-bold text-red-800">Vocabulary Builder</h2>
              <p className="mt-2 text-red-700">
                Expand your Japanese vocabulary with common words and phrases.
              </p>
              <div className="mt-3 text-red-600">
                <span className="inline-block bg-red-100 rounded px-2 py-1 mr-1">こんにちは</span>
                <span className="inline-block bg-red-100 rounded px-2 py-1 mr-1">ありがとう</span>
                <span className="inline-block bg-red-100 rounded px-2 py-1">さようなら</span>
              </div>
            </div>

            {/* Grammar Card */}
            <div
              className="
              relative
              bg-amber-200
              rounded-lg
              p-5
              w-full
              h-72
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              "
              style={{
                backgroundImage: `url(${img3})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}
            >
              {/* Overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gray-200 opacity-50 rounded-lg"></div>

              <div className="relative z-10">
                <h2 className="text-lg font-bold text-black-800">Exercises</h2>
                <p className="mt-2 text-black-700">
                  Practice what you have learnt in different quizzes!
                </p>
                <div className="mt-3 text-black-600">
                  <p className="bg-gray-100 rounded p-2 mb-2">わたしは__を読みます。</p>
                  <p className="bg-gray-100 rounded p-2">日本語__勉強しています。</p>
                </div>
              </div>
            </div>

            {/* Culture Card */}
            <div
              className="
              relative
              bg-teal-200
              rounded-lg
              p-5
              w-full
              h-68
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              "
            >
              <h2 className="text-lg font-bold text-teal-800">Japanese Culture</h2>
              <p className="mt-2 text-teal-700">
                Learn about customs, traditions, and cultural concepts.
              </p>
              <div className="mt-3 text-teal-600">
                <span className="inline-block bg-teal-100 rounded px-2 py-1 mr-1">着物</span>
                <span className="inline-block bg-teal-100 rounded px-2 py-1 mr-1">お茶</span>
                <span className="inline-block bg-teal-100 rounded px-2 py-1">和食</span>
              </div>
            </div>
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </div>
  )
}
