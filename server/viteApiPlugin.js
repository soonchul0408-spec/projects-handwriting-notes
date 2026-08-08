import { analyzeNotePayload } from './analyzeNote.js'

function readJsonBody(request, maxBytes = 9_000_000) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > maxBytes) reject(new Error('요청 용량이 너무 커요.'))
    })
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        reject(new Error('요청 JSON을 읽을 수 없어요.'))
      }
    })
    request.on('error', reject)
  })
}

export function localAnalyzeApiPlugin(options = {}) {
  return {
    name: 'local-analyze-note-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze-note', async (request, response) => {
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.end(JSON.stringify({ error: 'POST 요청만 지원해요.' }))
          return
        }

        try {
          const payload = await readJsonBody(request)
          const note = await analyzeNotePayload(payload, {
            apiKey: options.apiKey,
            model: options.model,
          })
          response.statusCode = 200
          response.end(JSON.stringify({ note }))
        } catch (error) {
          response.statusCode = error.code === 'MISSING_API_KEY' ? 503 : error.status || 400
          response.end(JSON.stringify({ error: error.message, code: error.code || 'ANALYZE_ERROR' }))
        }
      })
    },
  }
}
