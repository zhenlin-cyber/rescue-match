const API_KEY = 'm0j6RWPL'
const BASE_URL = 'https://api.rescuegroups.org/v5'

// Species IDs: Cat=3, Dog=8
const SPECIES_ID = { cat: '3', dog: '8' }

// Sample of Bay Area org IDs — diverse selection for good date coverage
const BAY_AREA_SAMPLE_ORGS = [
  313, 762, 780, 910, 1077, 1720, 2032, 3197, 4054, 4290,
  4516, 4563, 5025, 5184, 5419, 5758, 5924, 6030, 6319, 7049,
]

async function fetchOrgAnimals(orgId) {
  const res = await fetch(
    `${BASE_URL}/public/orgs/${orgId}/animals?limit=250&include=species,orgs`,
    { headers: { Authorization: API_KEY } },
  )
  if (!res.ok) return { animals: [], speciesMap: {}, orgMap: {} }
  const data = await res.json()
  const included = data.included || []
  const speciesMap = Object.fromEntries(
    included.filter((i) => i.type === 'species').map((i) => [i.id, i.attributes.singular]),
  )
  const orgMap = Object.fromEntries(
    included.filter((i) => i.type === 'orgs').map((i) => [i.id, {
      name: i.attributes.name,
      url: i.attributes.url || null,
      email: i.attributes.email || null,
      phone: i.attributes.phone || null,
    }]),
  )
  return { animals: data.data || [], speciesMap, orgMap }
}

export async function fetchRescues(species, month, day) {
  const targetSpecies = species === 'dog' ? 'Dog' : 'Cat'

  // Parallel fetch across org sample
  const results = await Promise.allSettled(BAY_AREA_SAMPLE_ORGS.map(fetchOrgAnimals))

  const allAnimals = []
  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    const { animals, speciesMap, orgMap } = r.value
    for (const a of animals) {
      const spId = (a.relationships?.species?.data?.[0]?.id) ?? ''
      if (speciesMap[spId] !== targetSpecies) continue
      const orgId = (a.relationships?.orgs?.data?.[0]?.id) ?? ''
      const org = orgMap[orgId] || { name: 'Bay Area Rescue' }
      const mapped = mapAnimal(a, org)
      if (mapped) allAnimals.push(mapped)
    }
  }

  if (!month || !day) return allAnimals.slice(0, 6)

  const m = parseInt(month, 10)
  const d = parseInt(day, 10)

  const exact = allAnimals.filter((a) => a.found[0] === m && a.found[1] === d)
  if (exact.length > 0) return exact.slice(0, 6)

  // Fallback: nearest by circular day-of-year distance
  const targetDoy = doy(m, d)
  return allAnimals
    .map((a) => {
      const dist = Math.abs(doy(a.found[0], a.found[1]) - targetDoy)
      return { ...a, _dist: Math.min(dist, 365 - dist) }
    })
    .sort((a, b) => a._dist - b._dist)
    .slice(0, 6)
    .map(({ _dist, ...rest }) => rest)
}

function mapAnimal(a, org) {
  if (!a?.attributes) return null
  const attrs = a.attributes
  const date = attrs.createdDate ? new Date(attrs.createdDate) : null
  if (!date || isNaN(date.getTime())) return null
  return {
    name: attrs.name || 'Unknown',
    breed: attrs.breedString || 'Mixed breed',
    age: mapAge(attrs.ageGroup),
    shelter: org.name || 'Bay Area Rescue',
    shelterUrl: org.url || null,
    shelterEmail: org.email || null,
    shelterPhone: org.phone || null,
    found: [date.getUTCMonth() + 1, date.getUTCDate()],
    blurb: cleanHtml(attrs.descriptionText || '').slice(0, 240)
      || 'A wonderful animal waiting for their forever home.',
    photo: attrs.pictureThumbnailUrl
      ? attrs.pictureThumbnailUrl.replace('?width=100', '?width=600')
      : null,
    rescueId: attrs.rescueId || null,
  }
}

function cleanHtml(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').replace(/&\w+;/g, '')
    .replace(/\s+/g, ' ').trim()
}

function mapAge(g) {
  return { Baby: 'puppy/kitten', Young: 'young adult', Adult: 'adult', Senior: 'senior' }[g] || 'adult'
}

function doy(m, d) {
  return new Date(2024, m - 1, d).getTime() / 86400000
}
