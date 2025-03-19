import React from 'react'
import { Shell } from 'electron'

const Options: React.FC = () => {
  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">About</h1>
      <p className="mt-4">
        Here comes the About Page. This page includes all of the metadata and history about the
        Application
      </p>
      <p className="mt-4">
        Japanolearn is made as a hobby project by{' '}
        <a href="https://github.com/happygoluckycodeeditor">Tanmay Bagwe</a>. This project is a open
        source way of learning Japanese. The lessons and every content in this app is mostly
        original and are made by Tanmay Bagwe.
        <br></br>
        Lessons are added everyweek and if you want to check the online version please go to{' '}
        <a href="https://japanolearn.com/">Japanolearn&apos;s Offical website</a>
        <br />
        The source code for this app is available on{' '}
        <a href="https://github.com/happygoluckycodeeditor/japanolearn-opensource">Github</a>
        The application is still in its early stages and is still being developed. Your feedback and
        also donations will help Tanmay keep developing this application daily!
        <br />
        Thank you very much!
      </p>

      {/* We'll add more content here later */}
    </div>
  )
}

export default Options
