import React from 'react'

const Navbar: React.FC = () => {
  // This function will now open the confirmation modal instead of quitting directly
  const handleQuit = (): void => {
    const modal = document.getElementById('quit_confirmation_modal') as HTMLDialogElement
    modal?.showModal()
  }

  // This function will be called when user confirms quitting
  const confirmQuit = (): void => {
    // For Electron apps, we need to use the window.electron API
    // Assuming you have an IPC channel set up for quitting the app
    window.electron.ipcRenderer.send('quit-app')
  }

  return (
    <div className="navbar bg-base-100 fixed top-0 w-full z-10">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[50] mt-3 w-52 p-2 shadow"
          >
            <li>
              <a>Home</a>
            </li>
            <li>
              <a>Lessons</a>
              <ul className="p-2">
                <li>
                  <a>All Lessons</a>
                </li>
              </ul>
            </li>
            <li>
              <a>Exercises</a>
            </li>
            <li>
              <a>Dictionary</a>
            </li>
            <li>
              <a>About</a>
            </li>
          </ul>
        </div>
        <a className="btn btn-ghost text-xl">JapanoLearn</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a>Home</a>
          </li>
          <li>
            <details className="z-[50]">
              <summary>Lessons</summary>
              <ul className="p-2">
                <li>
                  <a>All Lessons</a>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <a>Exercises</a>
          </li>
          <li>
            <a>Dictionary</a>
          </li>
          <li>
            <a>About</a>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <button className="btn btn-ghost mr-2">Options</button>
        <button onClick={handleQuit} className="btn btn-primary">
          Quit
        </button>
      </div>

      {/* Quit Confirmation Modal */}
      <dialog id="quit_confirmation_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Exit</h3>
          <p className="py-4">Are you sure you want to quit JapanoLearn?</p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              {/* This button will close the modal without quitting */}
              <button className="btn">Cancel</button>
              {/* This button will close the modal and quit the app */}
              <button className="btn btn-primary" onClick={confirmQuit}>
                Quit
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default Navbar
