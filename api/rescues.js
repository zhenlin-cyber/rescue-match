import { fetchRescues } from './_rescues-logic.js'

export default async function handler(req, res) {
  const { species = 'cat', month, day } = req.query

  try {
    const animals = await fetchRescues(species, month, day)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json(animals)
  } catch (err) {
    console.error('rescues handler error:', err)
    res.status(500).json({ error: err.message })
  }
}
