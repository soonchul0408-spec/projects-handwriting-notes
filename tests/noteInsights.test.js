import assert from 'node:assert/strict'
import test from 'node:test'
import { noteLibrary } from '../src/data/noteLibrary.js'
import { createMetricChart, getMetricInsights, getNoteMetrics, getTopicInsights } from '../src/services/noteInsights.js'

test('노트별 핵심 단어의 등장 메모장 수를 집계한다', () => {
  const insights = getTopicInsights(noteLibrary)
  const market = insights.find((topic) => topic.name === '시장 지표')

  assert.equal(market.noteCount, 3)
  assert.deepEqual(
    market.notes.map((note) => note.id),
    ['august-seven', 'august-six', 'august-five'],
  )
})

test('숫자가 붙은 단위명은 지표명 일부로 두고 수치만 추출한다', () => {
  const metrics = getNoteMetrics(noteLibrary[0])

  assert.equal(metrics.length, 5)
  assert.equal(metrics.find((metric) => metric.name === '10년 금리')?.value, 4.69)
  assert.equal(metrics.find((metric) => metric.name === '야간선물')?.change, 1.45)
})

test('서로 다른 표기의 같은 지표를 묶어 반복 그래프로 만들 수 있다', () => {
  const notes = [
    { id: 'one', shortTitle: '첫 메모', dateISO: '2026-08-01', sections: [{ items: ['10년 국채 4.69%'] }] },
    { id: 'two', shortTitle: '둘째 메모', dateISO: '2026-08-02', sections: [{ items: ['10년 금리 4.61%'] }] },
  ]

  const [metric] = getMetricInsights(notes)
  const chart = createMetricChart(metric)

  assert.equal(metric.name, '10년 금리')
  assert.deepEqual(metric.records.map((record) => record.value), [4.69, 4.61])
  assert.equal(chart.dots.length, 2)
  assert.match(chart.points, /,/)
})
