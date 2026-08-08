import { analyzeNotePayload } from '../server/analyzeNote.js'

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'POST 요청만 지원해요.' })
    return
  }

  try {
    const payload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body
    const note = await analyzeNotePayload(payload)
    response.status(200).json({ note })
  } catch (error) {
    const status = error.code === 'MISSING_API_KEY' ? 503 : error.status || 400
    response.status(status).json({ error: error.message, code: error.code || 'ANALYZE_ERROR' })
  }
}
