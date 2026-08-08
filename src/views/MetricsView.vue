<script setup>
import { computed, onMounted, ref } from 'vue'
import { getAllNotes } from '@/services/noteRepository'
import { createMetricChart, formatMetricNumber, getMetricInsights } from '@/services/noteInsights'

const notes = ref([])
const isLoading = ref(true)
const loadError = ref('')

const metricInsights = computed(() => getMetricInsights(notes.value))
const metricCharts = computed(() => metricInsights.value.map((metric) => ({ ...metric, chart: createMetricChart(metric) })))
const trackedNoteCount = computed(() => new Set(metricInsights.value.flatMap((metric) => metric.records.map((record) => record.noteId))).size)

onMounted(async () => {
  try {
    notes.value = await getAllNotes()
  } catch (error) {
    loadError.value = error.message || '노트를 불러오지 못했어요.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="metrics-shell">
    <header class="metrics-topbar page-width">
      <a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a>
      <nav class="metrics-nav" aria-label="노트 분석 메뉴"><a href="/notes">내 노트</a><a href="/concepts">핵심 단어</a><a class="active" href="/metrics">수치 그래프</a><a href="/#how-it-works">사용 방법</a></nav>
      <a class="metrics-upload-button" href="/upload">+ 새 필기 올리기</a>
    </header>

    <main class="metrics-main page-width">
      <header class="metrics-heading"><div><span class="eyebrow"><span class="eyebrow-dot"></span> REPEATED INDICATORS</span><h1>반복되는 <em>수치 그래프</em></h1><p>여러 메모장에 함께 기록된 지표만 골라 날짜순으로 이어 붙였어요. 값의 흐름을 한눈에 비교할 수 있어요.</p></div><div class="metrics-heading-meta"><strong>{{ metricCharts.length }}</strong><span>반복 지표</span></div></header>

      <div v-if="isLoading" class="metrics-loading"><span></span><p>메모장의 수치를 비교하고 있어요.</p></div>
      <div v-else-if="loadError" class="metrics-empty"><span>!</span><h2>수치를 불러오지 못했어요</h2><p>{{ loadError }}</p></div>
      <template v-else-if="metricCharts.length">
        <section class="metrics-highlight"><div><span class="metric-label">REPEATED DATA</span><h2>{{ metricCharts.length }}개의 지표가 여러 메모장에 반복돼요.</h2><p>같은 지표의 기록값을 날짜순으로 연결했습니다. 원문과 시장 데이터를 함께 확인해주세요.</p></div><div class="metrics-highlight-stats"><div><strong>{{ trackedNoteCount }}</strong><span>수치가 있는 메모장</span></div><div><strong>{{ metricCharts.reduce((total, metric) => total + metric.records.length, 0) }}</strong><span>전체 기록값</span></div></div></section>

        <section class="metric-list"><article v-for="metric in metricCharts" :key="metric.key" class="metric-card"><header class="metric-card-header"><div><span class="metric-label">{{ metric.records.length }} NOTES · {{ metric.records[0].unit || '기록값' }}</span><h2>{{ metric.name }}</h2></div><div class="metric-latest"><small>최근 기록</small><strong>{{ metric.records[metric.records.length - 1].displayValue }}</strong><span v-if="metric.records[metric.records.length - 1].displayChange">{{ metric.records[metric.records.length - 1].displayChange }}</span></div></header><div class="metric-chart-wrap"><svg class="metric-chart" :viewBox="`0 0 ${metric.chart.width} ${metric.chart.height}`" role="img" :aria-label="`${metric.name} 기록값 변화 그래프`"><g class="metric-grid-lines"><line v-for="tick in metric.chart.yTicks" :key="tick.y" x1="24" :x2="metric.chart.width - 24" :y1="tick.y" :y2="tick.y"></line><text v-for="tick in metric.chart.yTicks" :key="`label-${tick.y}`" x="0" :y="tick.y + 3">{{ formatMetricNumber(tick.value) }}</text></g><polyline class="metric-line" :points="metric.chart.points"></polyline><g v-for="dot in metric.chart.dots" :key="`${dot.noteId}-${dot.name}`"><circle class="metric-dot" :cx="dot.x" :cy="dot.y" r="5"><title>{{ dot.noteTitle }} · {{ dot.displayValue }}{{ dot.displayChange ? ` · ${dot.displayChange}` : '' }}</title></circle></g></svg></div><div class="metric-axis-labels"><div v-for="record in metric.records" :key="`${record.noteId}-label`"><span>{{ record.noteDate }}</span><strong>{{ record.displayValue }}</strong><small>{{ record.noteTitle }}</small></div></div><p class="metric-source">기록 출처: {{ metric.records.map((record) => record.noteTitle).join(' · ') }}</p></article></section>
      </template>
      <div v-else class="metrics-empty"><span>⌁</span><h2>반복되는 수치가 아직 없어요</h2><p>두 개 이상의 메모장에 같은 지표와 값이 기록되면 그래프로 보여드릴게요.</p><a href="/upload">필기 사진 추가하기 →</a></div>
    </main>

    <footer class="metrics-footer page-width"><span>필기<span class="brand-dot">.</span></span><span>수치는 참고용으로만 보고, 중요한 판단 전에는 원문을 다시 확인해주세요.</span></footer>
  </div>
</template>

<style scoped>
.metrics-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }
.metrics-topbar { min-height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
.metrics-nav { display: flex; gap: 25px; margin-left: 60px; color: #a09f96; font-size: 10px; font-weight: 600; }
.metrics-nav a { padding: 5px 0; white-space: nowrap; }
.metrics-nav a.active { color: var(--ink); border-bottom: 1px solid var(--accent); }
.metrics-upload-button { border: 1px solid var(--ink); border-radius: 4px; padding: 11px 15px; background: var(--ink); color: white; font-size: 10px; font-weight: 700; white-space: nowrap; }
.metrics-main { padding: 62px 0 104px; }
.metrics-heading { display: flex; align-items: flex-end; justify-content: space-between; }
.metrics-heading h1 { margin: 16px 0 10px; font-size: 42px; font-weight: 800; letter-spacing: -.1em; }
.metrics-heading h1 em { color: var(--accent); font-family: 'Gowun Batang', serif; font-style: normal; }
.metrics-heading p { max-width: 560px; margin: 0; color: #95948b; font-size: 11px; line-height: 1.75; }
.metrics-heading-meta { display: flex; flex-direction: column; align-items: flex-end; }
.metrics-heading-meta strong { color: var(--accent); font-family: 'Gowun Batang', serif; font-size: 30px; line-height: 1; }
.metrics-heading-meta span { margin-top: 4px; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }
.metrics-highlight { display: flex; align-items: center; justify-content: space-between; margin-top: 37px; border-radius: 7px; background: #2d2e2a; color: white; padding: 31px 37px; }
.metric-label { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .12em; }
.metrics-highlight h2 { margin: 10px 0 7px; color: #fff7f0; font-size: 23px; letter-spacing: -.08em; }
.metrics-highlight p { margin: 0; color: #b6b7b0; font-size: 10px; }
.metrics-highlight-stats { display: flex; gap: 33px; }
.metrics-highlight-stats div { display: flex; min-width: 82px; flex-direction: column; border-left: 1px solid #52534d; padding-left: 17px; }
.metrics-highlight-stats strong { color: #efa183; font-family: 'Gowun Batang', serif; font-size: 26px; line-height: 1; }
.metrics-highlight-stats span { margin-top: 7px; color: #9b9c95; font-size: 8px; }
.metric-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-top: 18px; }
.metric-card { overflow: hidden; border: 1px solid #dfded4; border-radius: 7px; background: #fffefa; box-shadow: 0 12px 40px rgba(70, 68, 55, .04); }
.metric-card-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px 27px 19px; }
.metric-card-header h2 { margin: 8px 0 0; font-size: 19px; font-weight: 800; letter-spacing: -.07em; }
.metric-latest { display: flex; flex-direction: column; align-items: flex-end; }
.metric-latest small { color: #aaa99f; font-size: 7px; }
.metric-latest strong { margin-top: 4px; color: var(--ink); font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; }
.metric-latest span { margin-top: 3px; color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; }
.metric-chart-wrap { border-top: 1px solid #efeee7; border-bottom: 1px solid #efeee7; padding: 17px 21px 9px; background: linear-gradient(180deg, #fffefa, #fcfaf4); }
.metric-chart { display: block; width: 100%; height: 220px; overflow: visible; }
.metric-grid-lines line { stroke: #e8e6dd; stroke-dasharray: 4 5; stroke-width: 1; }
.metric-grid-lines text { fill: #aaa99f; font-family: 'DM Mono', monospace; font-size: 9px; }
.metric-line { fill: none; stroke: var(--accent); stroke-linecap: round; stroke-linejoin: round; stroke-width: 3; }
.metric-dot { fill: #fffefa; stroke: var(--accent); stroke-width: 3; }
.metric-axis-labels { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px; padding: 16px 27px 13px; }
.metric-axis-labels div { display: flex; min-width: 0; flex-direction: column; }
.metric-axis-labels span { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; }
.metric-axis-labels strong { margin-top: 4px; color: #4f4f48; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; }
.metric-axis-labels small { overflow: hidden; margin-top: 4px; color: #aaa99f; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.metric-source { margin: 0; border-top: 1px solid #efeee7; padding: 11px 27px 15px; color: #aaa99f; font-size: 8px; line-height: 1.5; }
.metrics-loading { display: flex; min-height: 360px; flex-direction: column; align-items: center; justify-content: center; color: #aaa99f; font-size: 10px; }
.metrics-loading span { width: 32px; height: 32px; margin-bottom: 14px; border: 2px solid #efd9ce; border-top-color: var(--accent); border-radius: 50%; animation: metrics-spin .9s linear infinite; }
.metrics-empty { padding: 90px 0; text-align: center; }
.metrics-empty > span { color: #d0b0a2; font-size: 34px; }
.metrics-empty h2 { margin: 14px 0 7px; font-size: 17px; }
.metrics-empty p { margin: 0; color: #aaa99f; font-size: 11px; }
.metrics-empty a { display: inline-block; margin-top: 17px; color: var(--accent); font-size: 10px; font-weight: 700; }
.metrics-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 23px 0 29px; color: #aaa99f; font-size: 10px; }
.metrics-footer > span:first-child { color: var(--ink); font-size: 15px; font-weight: 800; letter-spacing: -.08em; }
@keyframes metrics-spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .metrics-nav { gap: 14px; margin-left: 20px; }.metric-list { grid-template-columns: 1fr; } }
@media (max-width: 680px) { .metrics-topbar { min-height: 72px; flex-wrap: wrap; gap: 13px; padding: 14px 0 10px; }.metrics-nav { order: 3; width: 100%; justify-content: space-between; gap: 8px; margin: 0; overflow-x: auto; font-size: 9px; }.metrics-upload-button { padding: 9px 10px; font-size: 9px; }.metrics-main { padding-top: 43px; }.metrics-heading { align-items: flex-start; }.metrics-heading h1 { font-size: 34px; }.metrics-heading p { font-size: 10px; }.metrics-heading-meta { display: none; }.metrics-highlight { display: block; padding: 27px 24px; }.metrics-highlight h2 { font-size: 20px; line-height: 1.4; }.metrics-highlight-stats { gap: 22px; margin-top: 24px; }.metric-card-header { padding: 21px 19px 16px; }.metric-card-header h2 { font-size: 17px; }.metric-chart-wrap { padding-left: 12px; padding-right: 12px; }.metric-chart { height: 190px; }.metric-axis-labels { padding-left: 19px; padding-right: 19px; }.metric-source { padding-left: 19px; padding-right: 19px; }.metrics-footer { align-items: flex-start; gap: 20px; }.metrics-footer > span:last-child { max-width: 190px; text-align: right; line-height: 1.5; } }
</style>
