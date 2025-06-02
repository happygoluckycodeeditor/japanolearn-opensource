import React from 'react'

const Options: React.FC = () => {
  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">About</h1>
      <p className="mt-4">
        Here comes the About Page. This page includes all of the metadata and history about the
        Application.
      </p>
      <p className="mt-4">
        Japanolearn is made as a hobby project by{' '}
        <a
          href="https://github.com/happygoluckycodeeditor"
          className="text-red-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tanmay Bagwe
        </a>
        . This project is an open-source way of learning Japanese. The lessons and every content in
        this app are mostly original and are made by Tanmay Bagwe.
        <br />
        Lessons are added every week, and if you want to check the online version, please visit{' '}
        <a
          href="https://japanolearn.com/"
          className="text-red-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Japanolearn&apos;s Official website
        </a>
        .
        <br />
        The source code for this app is available on{' '}
        <a
          href="https://github.com/happygoluckycodeeditor/japanolearn-opensource"
          className="text-red-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub. We push udpates from Github, so if you want to chaeck on releases and patches,
          please visit the Github Repository.
        </a>
        .
        <br />
        The application is still in its early stages and is under active development. Your feedback
        and donations will help Tanmay continue developing this application daily!
        <br />
        Thank you very much!
        <br />
        <p>Checking for Auto Updates v0.0.10 Hopefully it works</p>
        <br />
        <p className="mt-4 text-sm text-gray-700 border-t border-gray-300 pt-4">
          <strong>Disclaimer:</strong> This application is provided &quot;as is&quot; without
          warranty of any kind, express or implied. The creator of Japanolearn does not provide
          technical support for this open-source version and disclaims all liability for damages
          resulting from its use.
        </p>
      </p>
    </div>
  )
}

export default Options
