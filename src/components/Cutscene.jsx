import { useState } from 'react'

// scene: number 1-10 (6 has A/B branch)
export default function Cutscene({ onBirthdaySubmit }) {
  const [scene, setScene] = useState(1)
  const [path, setPath] = useState(null) // 'birthday' | 'horoscope'
  const [birthday, setBirthday] = useState({ month: '', day: '', year: '' })
  const [dateError, setDateError] = useState('')

  const go = (s) => setScene(s)

  const handleSubmit = () => {
    const { month, day, year } = birthday
    const m = parseInt(month), d = parseInt(day), y = parseInt(year)
    if (!m || !d || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2026) {
      setDateError('Please enter a valid date.')
      return
    }
    setDateError('')
    onBirthdaySubmit(`${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}/${y}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white overflow-hidden">
      {scene === 1 && (
        <Scene1 onNext={() => go(2)} />
      )}
      {scene === 2 && (
        <Scene2 onNext={() => go(3)} />
      )}
      {scene === 3 && (
        <Scene3 onNext={() => go(4)} />
      )}
      {scene === 4 && (
        <Scene4 onNext={() => go(5)} />
      )}
      {scene === 5 && (
        <Scene5
          onBirthday={() => { setPath('birthday'); go(6) }}
          onHoroscope={() => { setPath('horoscope'); go(7) }}
        />
      )}
      {scene === 6 && (
        <Scene6Birthday onNext={() => go(7)} />
      )}
      {scene === 7 && (
        <Scene7 onNext={() => go(8)} />
      )}
      {scene === 8 && (
        <Scene8 onNext={() => go(9)} />
      )}
      {scene === 9 && (
        <Scene9 onNext={() => go(10)} />
      )}
      {scene === 10 && (
        <Scene10
          birthday={birthday}
          setBirthday={setBirthday}
          dateError={dateError}
          onSubmit={handleSubmit}
          path={path}
        />
      )}
    </div>
  )
}

function SceneWrapper({ children, onClick, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-8 max-w-lg mx-auto animate-fade-in ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

function ClickHint({ text = 'Click anywhere to continue' }) {
  return <p className="mt-8 text-xs text-gray-500 animate-pulse">{text}</p>
}

function Scene1({ onNext }) {
  return (
    <SceneWrapper onClick={onNext}>
      <div className="text-7xl mb-6 animate-bounce">🎈</div>
      <p className="text-2xl font-light italic text-gray-200 leading-relaxed">
        "It's your special day. You've been waiting for this day the whole year."
      </p>
      <ClickHint text="Click the balloon to begin" />
    </SceneWrapper>
  )
}

function Scene2({ onNext }) {
  return (
    <SceneWrapper onClick={onNext}>
      <div className="text-6xl mb-6">✉️ ✉️</div>
      <p className="text-2xl font-light text-gray-200 leading-relaxed">
        "Every birthday deserves a guest list. But this year, we're suggesting someone new."
      </p>
      <ClickHint text="Click any envelope to open it" />
    </SceneWrapper>
  )
}

function Scene3({ onNext }) {
  return (
    <SceneWrapper onClick={onNext}>
      <div className="text-5xl mb-4">🎂 🪑 🎊</div>
      <p className="text-2xl font-light text-gray-200 leading-relaxed mb-3">
        "You can celebrate however you want, with anyone you want! It's your day!"
      </p>
      <p className="text-gray-400 text-lg italic">
        "But the best guests? The ones who needed a home as much as you needed a friend."
      </p>
      <ClickHint text="Click the empty chair to find your guest" />
    </SceneWrapper>
  )
}

function Scene4({ onNext }) {
  return (
    <SceneWrapper onClick={onNext}>
      <div className="text-5xl mb-6">📅</div>
      <p className="text-2xl font-light text-gray-200 leading-relaxed">
        "Somewhere out there, an animal was rescued on a day that means everything to you."
      </p>
      <ClickHint text="Click to see how it works" />
    </SceneWrapper>
  )
}

function Scene5({ onBirthday, onHoroscope }) {
  return (
    <div className="flex flex-col items-center text-center px-8 max-w-lg mx-auto animate-fade-in">
      <p className="text-3xl font-light text-gray-200 mb-10">How do you want to find your match?</p>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={onBirthday}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-5 px-6 rounded-2xl text-lg transition-all hover:scale-105"
        >
          🎂 By Birthday
          <p className="text-sm font-normal mt-1 opacity-80">rescued the same day you were born</p>
        </button>
        <button
          onClick={onHoroscope}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5 px-6 rounded-2xl text-lg transition-all hover:scale-105"
        >
          ✨ By Horoscope
          <p className="text-sm font-normal mt-1 opacity-80">rescued under your star sign</p>
        </button>
      </div>
    </div>
  )
}

function Scene6Birthday({ onNext }) {
  return (
    <SceneWrapper onClick={onNext}>
      <div className="text-6xl mb-6">🐾</div>
      <p className="text-2xl font-light text-gray-200 leading-relaxed">
        "Same day. Same destiny. A little soul who started over on the day you began."
      </p>
      <ClickHint text="Click the paw print to continue" />
    </SceneWrapper>
  )
}

function Scene7({ onNext }) {
  return (
    <SceneWrapper onClick={onNext}>
      <div className="text-6xl mb-6">🎁</div>
      <p className="text-2xl font-light text-gray-200 leading-relaxed">
        "Your match is waiting. They just don't know it's a party yet."
      </p>
      <ClickHint text="Click to lift the lid" />
    </SceneWrapper>
  )
}

function Scene8({ onNext }) {
  return (
    <SceneWrapper onClick={onNext}>
      <div className="text-5xl mb-6">🏠 ❤️</div>
      <p className="text-2xl font-light text-gray-200 leading-relaxed mb-3">
        "Every match is a real rescue, still looking for someone to celebrate with."
      </p>
      <p className="text-gray-400 italic">
        "A birthday is a beginning. Give one to someone who's ready for theirs."
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="mt-8 bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition"
      >
        I'm ready
      </button>
    </SceneWrapper>
  )
}

function Scene9({ onNext }) {
  return (
    <SceneWrapper onClick={onNext}>
      <div className="text-5xl mb-6">📝</div>
      <p className="text-2xl font-light text-gray-200 leading-relaxed">
        "Let's find your match. When's the big day?"
      </p>
      <ClickHint text="Click the invitation to fill it in" />
    </SceneWrapper>
  )
}

function Scene10({ birthday, setBirthday, dateError, onSubmit, path }) {
  return (
    <div className="flex flex-col items-center text-center px-8 max-w-md mx-auto animate-fade-in">
      <p className="text-4xl font-bold text-white mb-2">Ready to send the invite?</p>
      <p className="text-gray-400 mb-8">Enter your birthday to find your rescue match.</p>

      <div className="flex gap-2 mb-4 w-full justify-center">
        <input
          type="number"
          placeholder="MM"
          min="1"
          max="12"
          value={birthday.month}
          onChange={(e) => setBirthday((b) => ({ ...b, month: e.target.value }))}
          className="w-20 text-center bg-gray-800 border border-gray-600 text-white rounded-xl py-3 text-xl focus:outline-none focus:border-amber-400"
        />
        <span className="text-2xl text-gray-500 self-center">/</span>
        <input
          type="number"
          placeholder="DD"
          min="1"
          max="31"
          value={birthday.day}
          onChange={(e) => setBirthday((b) => ({ ...b, day: e.target.value }))}
          className="w-20 text-center bg-gray-800 border border-gray-600 text-white rounded-xl py-3 text-xl focus:outline-none focus:border-amber-400"
        />
        <span className="text-2xl text-gray-500 self-center">/</span>
        <input
          type="number"
          placeholder="YYYY"
          min="1900"
          max="2026"
          value={birthday.year}
          onChange={(e) => setBirthday((b) => ({ ...b, year: e.target.value }))}
          className="w-28 text-center bg-gray-800 border border-gray-600 text-white rounded-xl py-3 text-xl focus:outline-none focus:border-amber-400"
        />
      </div>

      {dateError && <p className="text-red-400 text-sm mb-3">{dateError}</p>}

      <button
        onClick={onSubmit}
        className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 rounded-2xl text-lg transition-all hover:scale-105 mt-2"
      >
        🎉 Find My Rescue Match
      </button>

      {path !== 'horoscope' && (
        <p className="text-gray-500 text-sm mt-4 italic">Or match me by my star sign instead ✨ — coming soon</p>
      )}
      {path === 'horoscope' && (
        <p className="text-indigo-400 text-sm mt-4">Horoscope matching coming soon! Searching by birthday for now.</p>
      )}
    </div>
  )
}
