import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fetchRescues } from './api/_rescues-logic.js'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'rescues-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url.startsWith('/api/rescues')) return next()

          const url = new URL(req.url, 'http://localhost')
          const species = url.searchParams.get('species') || 'cat'
          const month = url.searchParams.get('month')
          const day = url.searchParams.get('day')

          try {
            const animals = await fetchRescues(species, month, day)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(animals))
          } catch (err) {
            console.error('[rescues-api]', err.message)
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      },
    },
  ],
})
