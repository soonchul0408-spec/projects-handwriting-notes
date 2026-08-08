import assert from 'node:assert/strict'
import test from 'node:test'
import { analyzeNotePayload } from '../server/analyzeNote.js'

const validPayload = {
  imageDataUrl: 'data:image/jpeg;base64,dGVzdA==',
  captureDate: '2026-08-08',
}

const organizedNote = {
  title: '8/8 광합성 필기',
  dateISO: '2026-08-08',
  dateDisplay: '8/8 토요일',
  summary: '광합성의 과정을 정리한 필기예요.',
  rawText: '광합성의 과정',
  topics: ['광합성', '엽록체', '빛에너지'],
  sections: [{ title: '광합성의 과정', kicker: 'PROCESS', items: ['빛에너지를 흡수한다.'] }],
  uncertainItems: [],
  confidence: 0.95,
}

test('서버 API 키가 없으면 명확한 설정 오류를 반환한다', async () => {
  await assert.rejects(
    () => analyzeNotePayload(validPayload, { apiKey: '' }),
    (error) => error.code === 'MISSING_API_KEY',
  )
})

test('이미지가 아닌 요청을 분석하지 않는다', async () => {
  await assert.rejects(
    () => analyzeNotePayload({ imageDataUrl: 'hello' }, { apiKey: 'test-key' }),
    /분석할 이미지가 없어요/,
  )
})

test('이미지와 구조화 출력 설정을 보내고 정리된 노트를 반환한다', async () => {
  let requestBody
  const fetchImpl = async (_url, options) => {
    requestBody = JSON.parse(options.body)
    return {
      ok: true,
      json: async () => ({
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: JSON.stringify(organizedNote) }],
          },
        ],
      }),
    }
  }

  const result = await analyzeNotePayload(validPayload, {
    apiKey: 'test-key',
    model: 'test-model',
    fetchImpl,
  })

  assert.deepEqual(result, organizedNote)
  assert.equal(requestBody.model, 'test-model')
  assert.equal(requestBody.store, false)
  assert.equal(requestBody.input[0].content[1].type, 'input_image')
  assert.equal(requestBody.text.format.type, 'json_schema')
  assert.equal(requestBody.text.format.strict, true)
})

test('OpenAI 오류 내용을 사용자에게 전달한다', async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 429,
    json: async () => ({ error: { message: '요청 한도를 초과했습니다.' } }),
  })

  await assert.rejects(
    () => analyzeNotePayload(validPayload, { apiKey: 'test-key', fetchImpl }),
    (error) => error.code === 'OPENAI_API_ERROR' && error.status === 429,
  )
})
