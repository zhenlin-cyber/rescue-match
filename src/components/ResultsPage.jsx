export default function ResultsPage({ animals, fallback, birthday, onReset }) {
  const [month, day, year] = birthday.split('/')

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onReset}
          className="text-sm text-amber-700 underline mb-8 block hover:text-amber-900"
        >
          ← Start over
        </button>

        {fallback ? (
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-amber-800 mb-2">No exact match found — but close ones!</p>
            <p className="text-amber-700">No rescue happened on {month}/{day}, but these animals were rescued nearby.</p>
          </div>
        ) : (
          <div className="text-center mb-8">
            <p className="text-lg text-amber-700 mb-1">Your birthday is {month}/{day}/{year}.</p>
            <p className="text-3xl font-bold text-amber-900">
              {animals.length === 1
                ? 'Your rescue match is waiting!'
                : `${animals.length} rescue matches share your special day!`}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {animals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AnimalCard({ animal }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col sm:flex-row">
      {animal.photo ? (
        <img
          src={animal.photo}
          alt={animal.name}
          className="w-full sm:w-48 h-48 object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-full sm:w-48 h-48 bg-amber-100 flex items-center justify-center flex-shrink-0">
          <span className="text-5xl">🐾</span>
        </div>
      )}
      <div className="p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-amber-900">{animal.name}</h2>
          <p className="text-sm text-amber-600 mb-2">
            {animal.breed} · {animal.sex} · {animal.ageGroup}
          </p>
          {animal.rescueDate && (
            <p className="text-xs text-amber-500 mb-3">
              Rescued {new Date(animal.rescueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          {animal.bio && (
            <p className="text-sm text-gray-600 line-clamp-3">{animal.bio.replace(/<[^>]+>/g, '')}</p>
          )}
        </div>
        {animal.adoptionLink && (
          <a
            href={animal.adoptionLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition self-start"
          >
            Meet {animal.name} →
          </a>
        )}
      </div>
    </div>
  )
}
