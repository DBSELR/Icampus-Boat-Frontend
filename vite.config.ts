/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig, Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

function studentPhotoSignPlugin(): Plugin {
  const targetDir = path.resolve(__dirname, 'src/pages/Admissions/Stu_Photo_Sign')

  return {
    name: 'student-photo-sign-plugin',
    configureServer(server) {
      // Endpoint to save photo / signature directly into src/pages/Admissions/Stu_Photo_Sign/
      server.middlewares.use('/api/save-photo-sign', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const { filename, base64 } = JSON.parse(body)
              if (filename && base64) {
                // If it is a URL or file path (not a newly uploaded base64 image), keep existing file intact
                if (typeof base64 === 'string' && (base64.startsWith('/') || base64.startsWith('http') || !base64.includes('base64,'))) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ success: true, message: 'Existing file preserved' }))
                  return
                }

                if (!fs.existsSync(targetDir)) {
                  fs.mkdirSync(targetDir, { recursive: true })
                }

                // Remove existing matching files (e.g. if replacing .png with .jpg or vice-versa)
                const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename
                const existingFiles = fs.readdirSync(targetDir)
                for (const file of existingFiles) {
                  const fileBase = file.substring(0, file.lastIndexOf('.')) || file
                  if (fileBase.toLowerCase() === baseName.toLowerCase()) {
                    try {
                      fs.unlinkSync(path.join(targetDir, file))
                    } catch {}
                  }
                }

                const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
                const filePath = path.join(targetDir, filename)
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))

                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    success: true,
                    file: filename,
                    url: `/api/stu-photo-sign?file=${encodeURIComponent(filename)}`
                  })
                )
                return
              }
            } catch (err) {
              console.error('Error saving to Stu_Photo_Sign:', err)
            }
            res.statusCode = 400
            res.end(JSON.stringify({ success: false, message: 'Invalid payload' }))
          })
        } else {
          res.statusCode = 405
          res.end(JSON.stringify({ message: 'Method Not Allowed' }))
        }
      })

      // Endpoint to check / find existing photo/signature in src/pages/Admissions/Forms/Stu_Photo_Sign
      server.middlewares.use('/api/check-photo-sign', (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost')
          const prefix = url.searchParams.get('prefix') || '' // e.g. "P-5678" or "S-5678"
          if (prefix) {
            if (fs.existsSync(targetDir)) {
              const files = fs.readdirSync(targetDir)
              const matchedFile = files.find(f => {
                const fBase = f.substring(0, f.lastIndexOf('.')) || f
                return fBase.toLowerCase() === prefix.toLowerCase()
              })
              if (matchedFile) {
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    exists: true,
                    filename: matchedFile,
                    url: `/api/stu-photo-sign?file=${encodeURIComponent(matchedFile)}`
                  })
                )
                return
              }
            }
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ exists: false }))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ exists: false, error: String(err) }))
        }
      })

      // Endpoint to stream image files directly from src/pages/Admissions/Forms/Stu_Photo_Sign
      server.middlewares.use('/api/stu-photo-sign', (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost')
          const filename = url.searchParams.get('file') || ''
          if (filename) {
            const filePath = path.join(targetDir, path.basename(filename))
            if (fs.existsSync(filePath)) {
              const ext = path.extname(filePath).toLowerCase()
              const mimeTypes: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.gif': 'image/gif',
              }
              res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg')
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
              fs.createReadStream(filePath).pipe(res)
              return
            }
          }
          res.statusCode = 404
          res.end('Not Found')
        } catch (err) {
          res.statusCode = 500
          res.end(String(err))
        }
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    studentPhotoSignPlugin()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
