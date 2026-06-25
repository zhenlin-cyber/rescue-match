const API_KEY = 'm0j6RWPL'
const BASE_URL = 'https://api.rescuegroups.org/v5'

const BAY_AREA_ORG_IDS = [
  313, 732, 734, 762, 780, 910, 970, 1077, 1620, 1720, 1776, 1780, 1791,
  1907, 1938, 2032, 2204, 2279, 3197, 3317, 3325, 3362, 3581, 3620, 3949,
  4054, 4133, 4262, 4286, 4290, 4516, 4558, 4563, 4597, 4698, 4745, 4911,
  4953, 5025, 5034, 5068, 5184, 5243, 5419, 5502, 5538, 5577, 5758, 5818,
  5924, 5943, 5946, 5970, 5975, 5999, 6030, 6319, 6331, 6334, 6446, 6880,
  6911, 7032, 7049, 7115, 7184, 7810, 7908, 8280, 8465, 8659, 8692, 8857,
  8873, 8920, 8960, 8978, 9007, 9194, 9513, 9566, 9637, 9661, 9702, 9727,
  9760, 9872, 10083, 10085, 10114, 10204, 10209, 10236, 10256, 10266, 10272,
  10308, 10312, 10320, 10352, 10353, 10389, 10405, 10406, 10419, 10426, 10438,
  10439, 10446, 10455, 10456, 10460, 10548, 10563, 10664, 11095, 11161, 11375,
  11381, 11389,
]

export async function fetchAnimalsByDate(month, day) {
  const pad = (n) => String(n).padStart(2, '0')
  // Search a range of years for the given month/day
  const results = []

  const body = {
    data: {
      filterRadius: null,
      filters: [
        {
          fieldName: 'orgID',
          operation: 'equals',
          criteria: BAY_AREA_ORG_IDS.slice(0, 10).join(','), // start with first 10 orgs for perf
        },
        {
          fieldName: 'status',
          operation: 'equals',
          criteria: 'Available',
        },
      ],
    },
    meta: {
      limit: 100,
    },
  }

  const res = await fetch(`${BASE_URL}/public/animals/search/available`, {
    method: 'POST',
    headers: {
      Authorization: API_KEY,
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()

  const target = `${pad(month)}-${pad(day)}`
  const animals = (data.data || []).map((a) => {
    const attrs = a.attributes || {}
    return {
      id: a.id,
      name: attrs.name,
      photo: attrs.pictureThumbnailUrl,
      breed: attrs.breedString,
      sex: attrs.sex,
      ageGroup: attrs.ageGroup,
      bio: attrs.descriptionText,
      rescueDate: attrs.createdDate,
      adoptionLink: attrs.adoptionUrl,
    }
  })

  // Filter by month-day match
  const matched = animals.filter((a) => {
    if (!a.rescueDate) return false
    const d = new Date(a.rescueDate)
    const md = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    return md === target
  })

  if (matched.length > 0) return { matched, fallback: false }

  // Fallback: find nearest by day-of-year distance
  const targetDoy = dayOfYear(month, day)
  const sorted = animals
    .filter((a) => a.rescueDate)
    .map((a) => {
      const d = new Date(a.rescueDate)
      const doy = dayOfYear(d.getMonth() + 1, d.getDate())
      return { ...a, distance: Math.min(Math.abs(doy - targetDoy), 365 - Math.abs(doy - targetDoy)) }
    })
    .sort((a, b) => a.distance - b.distance)

  return { matched: sorted.slice(0, 3), fallback: true }
}

function dayOfYear(month, day) {
  return new Date(2024, month - 1, day).getTime() / 86400000
}
