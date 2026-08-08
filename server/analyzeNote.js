import process from 'node:process'

const MAX_IMAGE_LENGTH = 8_000_000

export const noteSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'dateISO',
    'dateDisplay',
    'summary',
    'rawText',
    'topics',
    'sections',
    'uncertainItems',
    'confidence',
  ],
  properties: {
    title: { type: 'string' },
    dateISO: { type: 'string' },
    dateDisplay: { type: 'string' },
    summary: { type: 'string' },
    rawText: { type: 'string' },
    topics: {
      type: 'array',
      minItems: 1,
      maxItems: 10,
      items: { type: 'string' },
    },
    sections: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'kicker', 'items'],
        properties: {
          title: { type: 'string' },
          kicker: { type: 'string' },
          items: {
            type: 'array',
            minItems: 1,
            maxItems: 12,
            items: { type: 'string' },
          },
        },
      },
    },
    uncertainItems: {
      type: 'array',
      maxItems: 12,
      items: { type: 'string' },
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
}

function readOutputText(responseData) {
  for (const output of responseData.output ?? []) {
    if (output.type !== 'message') continue
    for (const content of output.content ?? []) {
      if (content.type === 'output_text' && content.text) return content.text
    }
  }
  return ''
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('요청 데이터가 올바르지 않아요.')
  if (typeof payload.imageDataUrl !== 'string' || !payload.imageDataUrl.startsWith('data:image/')) {
    throw new Error('분석할 이미지가 없어요.')
  }
  if (payload.imageDataUrl.length > MAX_IMAGE_LENGTH) {
    throw new Error('사진 용량이 너무 커요. 더 작은 사진으로 다시 시도해주세요.')
  }
}

export async function analyzeNotePayload(payload, options = {}) {
  validatePayload(payload)

  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY
  const model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-5.6-terra'
  const fetchImpl = options.fetchImpl ?? fetch

  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY가 서버에 설정되지 않았어요.')
    error.code = 'MISSING_API_KEY'
    throw error
  }

  const captureDate = payload.captureDate || new Date().toISOString().slice(0, 10)
  const prompt = `
이 이미지는 한국어 손글씨 공부/메모 노트입니다. 사진을 정확하게 읽고 복습하기 쉬운 노트로 정리하세요.

규칙:
- 이미지에서 실제로 확인되는 내용만 사용하고 절대 추측해서 사실을 만들지 마세요.
- 숫자, 백분율, 날짜, 종목명, 고유명사는 원문을 최대한 보존하세요.
- 확실하지 않은 문구는 본문에서 단정하지 말고 uncertainItems에 넣으세요.
- dateISO는 YYYY-MM-DD 형식입니다. 연도가 없으면 촬영 기준일 ${captureDate}의 연도를 사용하세요. 날짜를 읽지 못하면 빈 문자열로 두세요.
- dateDisplay는 이미지에서 읽은 날짜와 요일을 한국어로 표시하세요. 읽지 못하면 '날짜 미확인'으로 쓰세요.
- title은 날짜와 핵심 주제가 드러나는 간결한 한국어 제목으로 만드세요.
- summary는 1~2문장으로 작성하세요.
- topics는 날짜를 제외한 핵심 개념 3~10개를 짧은 명사형으로 작성하세요.
- sections는 실제 필기 구조에 맞춰 1~8개로 나누고, kicker는 짧은 영문 대문자로 작성하세요.
- rawText에는 판독 가능한 원문을 줄바꿈을 유지해 적으세요.
- 모든 사용자용 문장은 자연스러운 한국어로 작성하세요.
`.trim()

  const apiResponse = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: payload.imageDataUrl, detail: 'high' },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'handwritten_note',
          strict: true,
          schema: noteSchema,
        },
      },
      max_output_tokens: 4000,
    }),
  })

  const responseData = await apiResponse.json().catch(() => ({}))
  if (!apiResponse.ok) {
    const message = responseData.error?.message || 'AI 분석 요청에 실패했어요.'
    const error = new Error(message)
    error.code = 'OPENAI_API_ERROR'
    error.status = apiResponse.status
    throw error
  }

  const outputText = readOutputText(responseData)
  if (!outputText) throw new Error('AI가 분석 결과를 반환하지 않았어요.')

  try {
    return JSON.parse(outputText)
  } catch {
    throw new Error('AI 분석 결과를 읽을 수 없어요.')
  }
}
