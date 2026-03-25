import http from 'http'
import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const PORT = 5173
const ROOT = path.dirname(fileURLToPath(import.meta.url))

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.mp4':  'video/mp4',
  '.webp': 'image/webp',
}

http.createServer((req, res) => {
  const urlPath  = req.url.split('?')[0]
  const filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath)
  const ext      = path.extname(filePath).toLowerCase()
  const mime     = MIME[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not found')
      return
    }
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' })
    res.end(data)
  })
}).listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`))
