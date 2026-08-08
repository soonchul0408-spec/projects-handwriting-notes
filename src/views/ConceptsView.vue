<script setup>
import { computed, onMounted, ref } from 'vue'
import { getAllNotes } from '@/services/noteRepository'
import { getTopicInsights } from '@/services/noteInsights'

const notes = ref([])
const isLoading = ref(true)
const loadError = ref('')

const topicInsights = computed(() => getTopicInsights(notes.value))
const topTopics = computed(() => topicInsights.value.slice(0, 12))
const maxTopicCount = computed(() => topTopics.value[0]?.noteCount || 1)
const noteComparisons = computed(() =>
  notes.value.map((note) => ({
    ...note,
    topics: [...new Set((note.topics || []).filter(Boolean))],
  })),
)

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
  <div class="insights-shell">
    <header class="insights-topbar page-width">
      <a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a>
      <nav class="insights-nav" aria-label="노트 분석 메뉴"><a href="/notes">내 노트</a><a class="active" href="/concepts">핵심 단어</a><a href="/metrics">수치 그래프</a><a href="/#how-it-works">사용 방법</a></nav>
      <a class="insights-upload-button" href="/upload">+ 새 필기 올리기</a>
    </header>

    <main class="insights-main page-width">
      <header class="insights-heading"><div><span class="eyebrow"><span class="eyebrow-dot"></span> CORE WORDS</span><h1>노트의 <em>핵심 단어</em></h1><p>메모장마다 어떤 단어가 반복되는지 비교해서 자주 등장한 핵심 개념을 모았어요.</p></div><div class="insights-heading-meta"><strong>{{ topicInsights.length }}</strong><span>발견한 단어</span></div></header>

      <div v-if="isLoading" class="insights-loading"><span></span><p>노트의 핵심 단어를 모으고 있어요.</p></div>
      <div v-else-if="loadError" class="insights-empty"><span>!</span><h2>분석할 노트를 불러오지 못했어요</h2><p>{{ loadError }}</p></div>
      <template v-else-if="topicInsights.length">
        <section class="insights-highlight"><div><span class="insight-label">MOST REPEATED</span><h2>{{ topTopics[0]?.name }}</h2><p>{{ topTopics[0]?.noteCount }}개의 메모장에서 발견된 단어예요.</p></div><div class="highlight-stats"><div><strong>{{ notes.length }}</strong><span>비교한 메모장</span></div><div><strong>{{ topTopics.length }}</strong><span>상위 단어</span></div></div></section>

        <div class="insights-grid">
          <section class="insight-card topic-ranking-card"><div class="insight-card-heading"><div><span class="insight-label">CROSS-NOTE RANKING</span><h2>메모장별 반복 빈도</h2></div><span>상위 {{ topTopics.length }}개</span></div><div class="topic-ranking-list"><article v-for="(topic, index) in topTopics" :key="topic.name" class="topic-ranking-row"><div class="topic-ranking-title"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ topic.name }}</strong><b>{{ topic.noteCount }}개 메모장</b></div><div class="topic-bar" aria-hidden="true"><span :style="{ width: `${(topic.noteCount / maxTopicCount) * 100}%` }"></span></div><div class="topic-source-list"><a v-for="note in topic.notes" :key="note.id" :href="note.route">{{ note.title }}</a></div></article></div></section>

          <section class="insight-card note-comparison-card"><div class="insight-card-heading"><div><span class="insight-label">NOTE BY NOTE</span><h2>메모장별 핵심 단어</h2></div><span>{{ noteComparisons.length }}개</span></div><div class="note-comparison-list"><article v-for="note in noteComparisons" :key="note.id"><div class="note-comparison-heading"><span>{{ note.date }}</span><h3>{{ note.shortTitle || note.title }}</h3></div><div class="note-comparison-topics"><span v-for="topic in note.topics.slice(0, 6)" :key="topic">#{{ topic }}</span><small v-if="note.topics.length > 6">+{{ note.topics.length - 6 }}</small></div></article></div></section>
        </div>
      </template>
      <div v-else class="insights-empty"><span>⌁</span><h2>아직 비교할 단어가 없어요</h2><p>필기 사진을 추가하면 노트 사이의 핵심 단어를 비교할 수 있어요.</p><a href="/upload">필기 사진 추가하기 →</a></div>
    </main>

    <footer class="insights-footer page-width"><span>필기<span class="brand-dot">.</span></span><span>같은 단어가 쌓일수록, 노트 사이의 흐름이 선명해져요.</span></footer>
  </div>
</template>

<style scoped>
.insights-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }
.insights-topbar { min-height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
.insights-nav { display: flex; gap: 25px; margin-left: 60px; color: #a09f96; font-size: 10px; font-weight: 600; }
.insights-nav a { padding: 5px 0; white-space: nowrap; }
.insights-nav a.active { color: var(--ink); border-bottom: 1px solid var(--accent); }
.insights-upload-button { border: 1px solid var(--ink); border-radius: 4px; padding: 11px 15px; background: var(--ink); color: white; font-size: 10px; font-weight: 700; white-space: nowrap; }
.insights-main { padding: 62px 0 104px; }
.insights-heading { display: flex; align-items: flex-end; justify-content: space-between; }
.insights-heading h1 { margin: 16px 0 10px; font-size: 42px; font-weight: 800; letter-spacing: -.1em; }
.insights-heading h1 em { color: var(--accent); font-family: 'Gowun Batang', serif; font-style: normal; }
.insights-heading p { max-width: 540px; margin: 0; color: #95948b; font-size: 11px; line-height: 1.75; }
.insights-heading-meta { display: flex; flex-direction: column; align-items: flex-end; }
.insights-heading-meta strong { color: var(--accent); font-family: 'Gowun Batang', serif; font-size: 30px; line-height: 1; }
.insights-heading-meta span { margin-top: 4px; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }
.insights-highlight { display: flex; align-items: center; justify-content: space-between; margin-top: 37px; border-radius: 7px; background: #2d2e2a; color: white; padding: 31px 37px; }
.insight-label { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .12em; }
.insights-highlight h2 { margin: 10px 0 7px; color: #fff7f0; font-size: 28px; letter-spacing: -.08em; }
.insights-highlight p { margin: 0; color: #b6b7b0; font-size: 10px; }
.highlight-stats { display: flex; gap: 39px; }
.highlight-stats div { display: flex; min-width: 72px; flex-direction: column; border-left: 1px solid #52534d; padding-left: 17px; }
.highlight-stats strong { color: #efa183; font-family: 'Gowun Batang', serif; font-size: 26px; line-height: 1; }
.highlight-stats span { margin-top: 7px; color: #9b9c95; font-size: 8px; }
.insights-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 18px; margin-top: 18px; }
.insight-card { border: 1px solid #dfded4; border-radius: 7px; background: #fffefa; box-shadow: 0 12px 40px rgba(70, 68, 55, .04); }
.insight-card-heading { display: flex; align-items: flex-end; justify-content: space-between; padding: 24px 27px 18px; border-bottom: 1px solid #e7e6de; }
.insight-card-heading h2 { margin: 7px 0 0; font-size: 18px; font-weight: 800; letter-spacing: -.07em; }
.insight-card-heading > span { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }
.topic-ranking-list { padding: 0 27px 22px; }
.topic-ranking-row { border-bottom: 1px solid #efeee7; padding: 17px 0 15px; }
.topic-ranking-row:last-child { border-bottom: 0; }
.topic-ranking-title { display: grid; grid-template-columns: 27px 1fr auto; align-items: center; gap: 8px; }
.topic-ranking-title > span { color: #bbb9af; font-family: 'DM Mono', monospace; font-size: 8px; }
.topic-ranking-title strong { font-size: 12px; font-weight: 800; }
.topic-ranking-title b { color: #99988f; font-family: 'DM Mono', monospace; font-size: 8px; font-weight: 400; }
.topic-bar { height: 6px; margin: 10px 0 9px 35px; border-radius: 99px; background: #f0eee6; }
.topic-bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #e6a084, #e46e49); }
.topic-source-list { display: flex; flex-wrap: wrap; gap: 5px; margin-left: 35px; }
.topic-source-list a { border: 1px solid #e8e5db; border-radius: 99px; padding: 4px 7px; color: #96958c; font-size: 7px; }
.topic-source-list a:hover { border-color: #e2b19d; color: var(--accent); }
.note-comparison-list { padding: 0 27px 22px; }
.note-comparison-list article { border-bottom: 1px solid #efeee7; padding: 18px 0; }
.note-comparison-list article:last-child { border-bottom: 0; }
.note-comparison-heading { display: flex; align-items: center; gap: 11px; }
.note-comparison-heading > span { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; }
.note-comparison-heading h3 { margin: 0; font-size: 12px; font-weight: 800; }
.note-comparison-topics { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 11px; }
.note-comparison-topics span { border: 1px solid #e2e0d7; border-radius: 99px; background: #fbfaf5; padding: 5px 7px; color: #85847b; font-size: 7px; }
.note-comparison-topics small { align-self: center; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 7px; }
.insights-loading { display: flex; min-height: 360px; flex-direction: column; align-items: center; justify-content: center; color: #aaa99f; font-size: 10px; }
.insights-loading span { width: 32px; height: 32px; margin-bottom: 14px; border: 2px solid #efd9ce; border-top-color: var(--accent); border-radius: 50%; animation: insights-spin .9s linear infinite; }
.insights-empty { padding: 90px 0; text-align: center; }
.insights-empty > span { color: #d0b0a2; font-size: 34px; }
.insights-empty h2 { margin: 14px 0 7px; font-size: 17px; }
.insights-empty p { margin: 0; color: #aaa99f; font-size: 11px; }
.insights-empty a { display: inline-block; margin-top: 17px; color: var(--accent); font-size: 10px; font-weight: 700; }
.insights-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 23px 0 29px; color: #aaa99f; font-size: 10px; }
.insights-footer > span:first-child { color: var(--ink); font-size: 15px; font-weight: 800; letter-spacing: -.08em; }
@keyframes insights-spin { to { transform: rotate(360deg); } }
@media (max-width: 850px) { .insights-nav { gap: 14px; margin-left: 20px; }.insights-grid { grid-template-columns: 1fr; } }
@media (max-width: 680px) { .insights-topbar { min-height: 72px; flex-wrap: wrap; gap: 13px; padding: 14px 0 10px; }.insights-nav { order: 3; width: 100%; justify-content: space-between; gap: 8px; margin: 0; overflow-x: auto; font-size: 9px; }.insights-upload-button { padding: 9px 10px; font-size: 9px; }.insights-main { padding-top: 43px; }.insights-heading { align-items: flex-start; }.insights-heading h1 { font-size: 34px; }.insights-heading p { font-size: 10px; }.insights-heading-meta { display: none; }.insights-highlight { display: block; padding: 27px 24px; }.insights-highlight h2 { font-size: 24px; }.highlight-stats { gap: 23px; margin-top: 24px; }.insights-grid { margin-top: 13px; }.insight-card-heading { padding: 21px 19px 15px; }.topic-ranking-list, .note-comparison-list { padding-left: 19px; padding-right: 19px; }.topic-ranking-title { grid-template-columns: 24px 1fr auto; }.topic-ranking-title strong { font-size: 11px; }.topic-ranking-title b { font-size: 7px; }.topic-bar, .topic-source-list { margin-left: 32px; }.insights-footer { align-items: flex-start; gap: 20px; }.insights-footer > span:last-child { max-width: 190px; text-align: right; line-height: 1.5; } }
</style>
