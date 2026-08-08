const NUMBER_TOKEN = /[-+]?(?:(?:\d{1,3}(?:,\d{3})+)|(?:\d+))(?:\.\d+)?(?:\s*(?:%|％|원|달러|USD|KRW|bp|점))?/gu

function normalizeTopicKey(topic) {
  return String(topic || '')
    .trim()
    .toLocaleLowerCase('ko-KR')
    .replace(/\s+/gu, ' ')
}

function uniqueTopics(note) {
  const topics = Array.isArray(note?.topics) ? note.topics : []
  const seen = new Set()
  return topics
    .map((topic) => String(topic || '').trim().replace(/\s+/gu, ' '))
    .filter((topic) => {
      const key = normalizeTopicKey(topic)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function getTopicInsights(notes) {
  const topicMap = new Map()

  for (const note of notes || []) {
    for (const name of uniqueTopics(note)) {
      const key = normalizeTopicKey(name)
      if (!topicMap.has(key)) topicMap.set(key, { name, noteCount: 0, notes: [] })
      const insight = topicMap.get(key)
      insight.noteCount += 1
      insight.notes.push({
        id: note.id,
        title: note.shortTitle || note.title || '이름 없는 노트',
        date: note.date || note.dateKey || '',
        route: note.route,
      })
    }
  }

  return [...topicMap.values()].sort(
    (first, second) => second.noteCount - first.noteCount || first.name.localeCompare(second.name, 'ko'),
  )
}

function findNumber(text, startIndex = 0) {
  NUMBER_TOKEN.lastIndex = startIndex
  let match = NUMBER_TOKEN.exec(text)

  while (match) {
    const nextCharacter = text[match.index + match[0].length]
    const prefix = cleanMetricName(text.slice(0, match.index))
    // 줄 맨 앞의 숫자가 한글 단위와 붙어 있으면 값이 아니라 지표명 일부일 수 있어요. (예: 10년 금리)
    // 이미 지표명이 앞에 있으면 '판매량 2,000개'처럼 단위가 붙은 값은 허용합니다.
    if (!nextCharacter || prefix || !/\p{L}/u.test(nextCharacter)) return match
    match = NUMBER_TOKEN.exec(text)
  }

  return null
}

function toNumber(token) {
  const number = String(token || '').replace(/,/gu, '').match(/[+-]?(?:\d+(?:\.\d+)?)/u)
  return number ? Number(number[0]) : null
}

function cleanMetricName(value) {
  return String(value || '')
    .replace(/^\s*(?:[•·∙\-–—*_]\s*|\d+[.)]\s*)/u, '')
    .replace(/[\s:：|·/]+$/u, '')
    .replace(/\s+/gu, ' ')
    .trim()
}

function canonicalMetricName(value) {
  const name = cleanMetricName(value)
  const compact = name.replace(/\s+/gu, '')

  if (/^야간선물(?:지수)?$/u.test(compact)) return '야간선물'
  if (/^원유(?:선물)?$/u.test(compact)) return '원유'
  if (/^반도체(?:지수)?$/u.test(compact)) return '반도체'
  if (/^10년(?:국채|금리)$/u.test(compact)) return '10년 금리'
  return name
}

function metricUnit(token) {
  return String(token || '').match(/(％|%|원|달러|USD|KRW|bp|점)\s*$/iu)?.[1] || ''
}

function parseMetricLine(value, note, sectionTitle = '') {
  const text = String(value || '').replace(/\s+/gu, ' ').trim()
  if (!text) return null

  const valueMatch = findNumber(text)
  if (!valueMatch) return null

  const name = canonicalMetricName(text.slice(0, valueMatch.index))
  if (!name || /^\d+$/u.test(name)) return null

  const afterValue = text.slice(valueMatch.index + valueMatch[0].length).trim()
  let change = null
  let displayChange = ''

  if (afterValue) {
    // 두 번째 숫자가 구분자 뒤에 이어지는 경우만 등락률로 취급해 일반 문장 속 숫자를 제외해요.
    if (!/^[·•|/,:：]\s*/u.test(afterValue)) return null
    const changeText = afterValue.replace(/^[·•|/,:：]\s*/u, '')
    const changeMatch = findNumber(changeText)
    if (!changeMatch) return null
    const trailingText = changeText.slice(changeMatch.index + changeMatch[0].length).trim()
    if (trailingText) return null
    change = toNumber(changeMatch[0])
    displayChange = changeMatch[0].replace(/\s+/gu, '')
  }

  const numericValue = toNumber(valueMatch[0])
  if (numericValue === null) return null

  return {
    name,
    key: normalizeTopicKey(name),
    value: numericValue,
    displayValue: valueMatch[0].replace(/\s+/gu, ''),
    unit: metricUnit(valueMatch[0]),
    change,
    displayChange,
    sourceText: text,
    sectionTitle,
    noteId: note.id,
    noteTitle: note.shortTitle || note.title || '이름 없는 노트',
    noteDate: note.date || note.dateKey || '',
    dateISO: note.dateISO || note.createdAt || note.dateKey || '',
  }
}

function noteMetricItems(note) {
  const items = []
  for (const section of Array.isArray(note?.sections) ? note.sections : []) {
    for (const item of Array.isArray(section.items) ? section.items : []) {
      items.push({ value: item, sectionTitle: section.title || '' })
    }
  }

  if (note?.rawText) {
    for (const line of String(note.rawText).split(/\r?\n/gu)) items.push({ value: line, sectionTitle: '' })
  }

  return items
}

export function getNoteMetrics(note) {
  const seen = new Set()
  const metrics = []

  for (const item of noteMetricItems(note)) {
    const metric = parseMetricLine(item.value, note, item.sectionTitle)
    if (!metric || seen.has(metric.key)) continue
    seen.add(metric.key)
    metrics.push(metric)
  }

  return metrics
}

export function getMetricInsights(notes) {
  const metricMap = new Map()

  for (const note of notes || []) {
    for (const metric of getNoteMetrics(note)) {
      if (!metricMap.has(metric.key)) metricMap.set(metric.key, { name: metric.name, key: metric.key, records: [] })
      metricMap.get(metric.key).records.push(metric)
    }
  }

  return [...metricMap.values()]
    .filter((metric) => metric.records.length >= 2)
    .map((metric) => ({
      ...metric,
      records: [...metric.records].sort((first, second) => first.dateISO.localeCompare(second.dateISO)),
    }))
    .sort((first, second) => second.records.length - first.records.length || first.name.localeCompare(second.name, 'ko'))
}

export function formatMetricNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 3 })
}

export function createMetricChart(metric, width = 640, height = 250) {
  const padding = { top: 22, right: 24, bottom: 35, left: 24 }
  const records = metric.records || []
  const values = records.map((record) => record.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const rawRange = rawMax - rawMin
  const range = rawRange || Math.max(Math.abs(rawMax) * 0.1, 1)
  const min = rawMin - range * 0.1
  const max = rawMax + range * 0.1
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const toY = (value) => padding.top + ((max - value) / (max - min)) * chartHeight
  const step = records.length > 1 ? chartWidth / (records.length - 1) : 0
  const dots = records.map((record, index) => ({
    ...record,
    x: padding.left + step * index,
    y: toY(record.value),
  }))
  const yTicks = [max, (max + min) / 2, min].map((value) => ({ value, y: toY(value) }))

  return {
    width,
    height,
    dots,
    points: dots.map((dot) => `${dot.x},${dot.y}`).join(' '),
    yTicks,
  }
}
