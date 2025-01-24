import logo from './assets/images/logo.svg'

export default function App(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <h1 className="text-4xl font-bold mb-4">Welcome to Japanolearn</h1>
      <p className="text-lg mb-8">This is the opensource version!</p>
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure>
          <img src={logo} alt="Album" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">New album is released!</h2>
          <p>Click the button to listen on Spotiwhy app.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Listen</button>
          </div>
        </div>
      </div>
    </div>
  )
}
