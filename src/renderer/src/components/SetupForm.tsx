export default function SetupForm(): JSX.Element {
  return (
    <div className="card lg:card-side bg-base-100 shadow-xl animate-[fadeIn_0.3s_ease-in-out]">
      <div className="card-body">
        <h2 className="card-title">Welcome! Let&apos;s set up your profile</h2>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Setup your username</span>
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Continue</button>
        </div>
      </div>
    </div>
  )
}
