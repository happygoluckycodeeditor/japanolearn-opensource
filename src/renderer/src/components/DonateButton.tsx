import React from 'react'

const DonateButton: React.FC = () => {
  // Function to handle donation click
  const handleDonateClick = (): void => {
    // Open donation link in browser
    window.open('https://github.com/happygoluckycodeeditor/japanolearn-opensource', '_blank')
  }
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="tooltip tooltip-left" data-tip="Support the cause!">
        <button
          onClick={handleDonateClick}
          className="btn btn-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <span className="mr-1">❤️</span> Learn more
        </button>
      </div>
    </div>
  )
}

export default DonateButton
