import { useState } from 'react'
import Cutscene from './components/Cutscene'
import ResultsPage from './components/ResultsPage'
import { fetchAnimalsByDate } from './services/rescueGroupsApi'

export default function App() {
  const [phase, setPhase] = useState('cutscene') // 'cutscene' | 'loading' | 'results' | 'error'
  const [results, setResults] = useState(null)
  const [birthday, setBirthday] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleBirthdaySubmit(bday) {
    setBirthday(bday)
    setPhase('loading')
    try {
      const [month, day] = bday.split('/').map(Number)
      const data = await fetchAnimalsByDate(month, day)
      setResults(data)
      setPhase('results')
    } catch (e) {
      setErrorMsg(e.message)
      setPhase('error')
    }
  }

  function reset() {
    setPhase('cutscene')
    setResults(null)
    setBirthday('')
    setErrorMsg('')
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <div className="text-5xl mb-6 animate-spin">🐾</div>
        <p className="text-xl text-gray-300">Searching Bay Area rescues…</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white px-8 text-center">
        <p className="text-xl text-red-400 mb-4">Something went wrong: {errorMsg}</p>
        <button onClick={reset} className="underline text-gray-400 hover:text-white">Try again</button>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <ResultsPage
        animals={results.matched}
        fallback={results.fallback}
        birthday={birthday}
        onReset={reset}
      />
    )
  }

  return <Cutscene onBirthdaySubmit={handleBirthdaySubmit} />
}
