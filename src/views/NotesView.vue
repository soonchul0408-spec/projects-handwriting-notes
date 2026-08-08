<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllNotes } from '@/services/noteRepository'

const router = useRouter()
const notes = ref([])
const isLoading = ref(true)
const loadError = ref('')
const query = ref('')
const activeDate = ref(null)
const activeConcept = ref(null)
const toastMessage = ref('')
let toastTimer

const connectedConcepts = computed(() => {
  const counts = new Map()
  for (const note of notes.value) {
    for (const topic of note.topics ?? []) counts.set(topic, (counts.get(topic) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => second.count - first.count || first.name.localeCompare(second.name, 'ko'))
})

const filteredNotes = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()
  return notes.value.filter((note) => {
    const searchable = `${note.title} ${note.subject} ${note.excerpt} ${note.topics.join(' ')}`.toLowerCase()
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    const matchesDate = !activeDate.value || note.dateKey === activeDate.value
    const matchesConcept = !activeConcept.value || note.topics.includes(activeConcept.value)
    return matchesQuery && matchesDate && matchesConcept
  })
})

const activeFilterLabel = computed(() => activeConcept.value || (activeDate.value ? `${activeDate.value.replace('.', '/')} 필기` : null))

onMounted(async () => {
  try {
    notes.value = await getAllNotes()
  } catch (error) {
    loadError.value = error.message || '저장된 노트를 불러오지 못했어요.'
  } finally {
    isLoading.value = false
  }
})

function selectDate(dateKey) {
  activeDate.value = activeDate.value === dateKey ? null : dateKey
  activeConcept.value = null
}

function selectConcept(concept) {
  activeConcept.value = activeConcept.value === concept ? null : concept
  activeDate.value = null
}

function clearFilters() {
  activeDate.value = null
  activeConcept.value = null
  query.value = ''
}

function showToast(message) {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2400)
}

function openNote(note) {
  router.push(note.route)
}
</script>

<template>
  <div class="notes-shell">
    <header class="notes-topbar page-width">
      <a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a>
      <nav class="notes-nav" aria-label="노트 메뉴"><a class="active" href="/notes">내 노트</a><a href="/concepts">핵심 단어</a><a href="/metrics">수치 그래프</a><a href="/#how-it-works">사용 방법</a></nav>
      <a class="notes-upload-button" href="/">+ 새 필기 올리기</a>
    </header>

    <main class="notes-main page-width">
      <aside class="knowledge-sidebar">
        <div class="sidebar-title"><div><span class="eyebrow">NOTE MAP</span><h2>노트 탐색</h2></div><span>{{ notes.length }} notes</span></div>

        <section class="sidebar-section">
          <div class="sidebar-section-heading"><span>날짜별 노트</span><small>TIMELINE</small></div>
          <div class="timeline-list">
            <button v-for="note in notes" :key="note.id" :class="{ active: activeDate === note.dateKey }" type="button" @click="selectDate(note.dateKey)">
              <span class="timeline-date">{{ note.dateKey }}</span>
              <span class="timeline-copy"><strong>{{ note.shortTitle }}</strong><small>{{ note.topics.slice(0, 2).join(' · ') }}</small></span>
              <i></i>
            </button>
          </div>
        </section>

        <section class="sidebar-section concept-section">
          <div class="sidebar-section-heading"><span>연결된 개념</span><small>CONNECTIONS</small></div>
          <p class="concept-guide">같은 단어를 가진 날짜의 필기를 한 번에 모아볼 수 있어요.</p>
          <div class="concept-list">
            <button v-for="concept in connectedConcepts" :key="concept.name" :class="{ active: activeConcept === concept.name }" type="button" @click="selectConcept(concept.name)"><span><i></i>{{ concept.name }}</span><b>{{ concept.count }}</b></button>
          </div>
        </section>

        <button v-if="activeFilterLabel" class="clear-filter" type="button" @click="clearFilters">× {{ activeFilterLabel }} 해제</button>
      </aside>

      <section class="notes-content">
        <div class="notes-heading"><div><span class="eyebrow"><span class="eyebrow-dot"></span> YOUR LIBRARY</span><h1>내 노트</h1><p>날짜와 핵심 주제를 따라 필기 사이를 오갈 수 있어요.</p></div><div class="notes-heading-meta"><strong>{{ filteredNotes.length }}</strong><span>보이는 노트</span></div></div>
        <div class="notes-toolbar"><label class="search-field"><span>⌕</span><input v-model="query" type="search" placeholder="날짜, 제목, 핵심 개념을 검색해보세요" /></label><button v-if="activeFilterLabel" class="active-filter" type="button" @click="clearFilters"><span>{{ activeFilterLabel }}</span> ×</button><button class="sort-button" type="button" @click="showToast('최근 날짜순으로 보고 있어요.')">최근 날짜순 <span>⌄</span></button></div>

        <div v-if="isLoading" class="loading-notes"><span></span><p>저장된 노트를 불러오고 있어요.</p></div>
        <div v-else-if="loadError" class="empty-notes"><span>!</span><h2>노트를 불러오지 못했어요</h2><p>{{ loadError }}</p></div>
        <div v-else-if="filteredNotes.length" class="notes-list">
          <article v-for="(note, index) in filteredNotes" :key="note.id" class="saved-note" :class="{ featured: index === 0 && !activeFilterLabel && !query }" @click="openNote(note)">
            <div class="saved-note-image"><img :src="note.image" :alt="`${note.date} 필기 사진`" /><span class="photo-count">{{ note.pages }}p</span></div>
            <div class="saved-note-body"><div class="saved-note-top"><span class="note-subject">{{ note.subject }}</span><span class="saved-note-date">{{ note.date }}</span></div><h2>{{ note.title }}</h2><p>{{ note.excerpt }}</p><div class="topic-chips"><button v-for="topic in note.topics.slice(0, 4)" :key="topic" type="button" @click.stop="selectConcept(topic)">#{{ topic }}</button><span v-if="note.topics.length > 4">+{{ note.topics.length - 4 }}</span></div></div>
            <span class="note-arrow">→</span>
          </article>
        </div>
        <div v-else class="empty-notes"><span>⌕</span><h2>연결된 노트가 없어요</h2><p>다른 날짜나 개념을 선택해보세요.</p><button type="button" @click="clearFilters">모든 노트 보기</button></div>
      </section>
    </main>

    <footer class="notes-footer page-width"><span>필기<span class="brand-dot">.</span></span><span>날짜는 달라도, 같은 개념은 서로 이어져요.</span></footer>
    <transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></transition>
  </div>
</template>

<style scoped>
.notes-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }.notes-topbar { height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }.notes-nav { display: flex; gap: 31px; margin-left: 100px; color: #a09f96; font-size: 11px; font-weight: 600; }.notes-nav a { padding: 5px 0; }.notes-nav a.active { color: var(--ink); border-bottom: 1px solid var(--accent); }.notes-upload-button { border: 1px solid var(--ink); border-radius: 4px; padding: 11px 15px; background: var(--ink); color: white; font-size: 10px; font-weight: 700; }.notes-main { display: grid; grid-template-columns: 235px 1fr; gap: 66px; padding: 61px 0 105px; }.knowledge-sidebar { position: sticky; top: 25px; align-self: start; }.sidebar-title { display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px solid #deddd4; }.sidebar-title .eyebrow { color: var(--accent); font-size: 7px; }.sidebar-title h2 { margin: 7px 0 0; font-size: 18px; font-weight: 800; letter-spacing: -.07em; }.sidebar-title > span { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 7px; }.sidebar-section { padding: 24px 0 4px; border-bottom: 1px solid #e1e0d7; }.sidebar-section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }.sidebar-section-heading > span { color: #77766e; font-size: 10px; font-weight: 800; }.sidebar-section-heading small { color: #b0afa5; font-family: 'DM Mono', monospace; font-size: 6px; letter-spacing: .1em; }.timeline-list { position: relative; display: flex; flex-direction: column; }.timeline-list::before { position: absolute; top: 10px; bottom: 10px; left: 39px; width: 1px; background: #deddd4; content: ''; }.timeline-list button { position: relative; z-index: 1; display: grid; grid-template-columns: 39px 1fr 8px; align-items: center; min-height: 54px; border: 0; border-radius: 4px; background: transparent; color: #77766e; padding: 5px 7px 5px 0; text-align: left; }.timeline-list button:hover, .timeline-list button.active { background: #eeeae2; color: var(--ink); }.timeline-date { font-family: 'DM Mono', monospace; font-size: 8px; }.timeline-copy { display: flex; flex-direction: column; gap: 4px; padding-left: 13px; }.timeline-copy strong { font-size: 10px; font-weight: 800; }.timeline-copy small { color: #aaa99f; font-size: 7px; }.timeline-list button i { width: 7px; height: 7px; border: 2px solid #f7f6f0; border-radius: 50%; background: #c7c5bb; }.timeline-list button.active i { background: var(--accent); }.concept-section { padding-bottom: 20px; }.concept-guide { margin: -3px 0 15px; color: #aaa99f; font-size: 7px; line-height: 1.55; }.concept-list { display: flex; flex-direction: column; gap: 3px; }.concept-list button { display: flex; align-items: center; justify-content: space-between; border: 0; border-radius: 3px; background: transparent; color: #85847b; padding: 7px 8px; font-size: 9px; }.concept-list button:hover, .concept-list button.active { background: #f2e6df; color: #6b554c; }.concept-list button span { display: flex; align-items: center; gap: 7px; }.concept-list i { width: 5px; height: 5px; border-radius: 50%; background: #d4a08a; }.concept-list b { color: #b0afa6; font-family: 'DM Mono', monospace; font-size: 7px; font-weight: 400; }.clear-filter { width: 100%; margin-top: 13px; border: 1px solid #e2d7cf; border-radius: 3px; background: #faf0e9; color: #8b6f61; padding: 8px; font-size: 8px; }.notes-heading { display: flex; align-items: flex-end; justify-content: space-between; }.notes-heading h1 { margin: 16px 0 9px; font-size: 38px; font-weight: 800; letter-spacing: -.1em; }.notes-heading p { margin: 0; color: #95948b; font-size: 12px; }.notes-heading-meta { display: flex; flex-direction: column; align-items: flex-end; }.notes-heading-meta strong { color: var(--accent); font-family: 'Gowun Batang', serif; font-size: 30px; line-height: 1; }.notes-heading-meta span { margin-top: 4px; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }.notes-toolbar { display: flex; gap: 9px; margin-top: 33px; padding-bottom: 15px; border-bottom: 1px solid #deddd4; }.search-field { display: flex; flex: 1; align-items: center; gap: 8px; border: 1px solid #e0dfd6; border-radius: 3px; background: rgba(255,255,252,.6); padding: 9px 12px; }.search-field span { color: #a8a79e; font-size: 19px; line-height: .5; }.search-field input { width: 100%; border: 0; outline: 0; background: transparent; color: var(--ink); font-size: 10px; }.search-field input::placeholder { color: #b0afa5; }.sort-button, .active-filter { border: 1px solid #e0dfd6; border-radius: 3px; background: transparent; color: #8c8b82; padding: 0 12px; font-size: 9px; }.sort-button span { margin-left: 6px; color: var(--accent); }.active-filter { border-color: #e5cfc3; background: #fcf1eb; color: #956f5e; }.active-filter span { margin-right: 5px; }.notes-list { display: flex; flex-direction: column; gap: 12px; padding-top: 15px; }.saved-note { position: relative; display: grid; grid-template-columns: 124px 1fr 30px; gap: 21px; min-height: 157px; border: 1px solid transparent; border-radius: 5px; background: rgba(255,255,252,.38); padding: 12px; cursor: pointer; transition: border .2s, background .2s, transform .2s; }.saved-note:hover { border-color: #deddd3; background: #fffefa; transform: translateX(3px); }.saved-note.featured { border-color: #e6dace; background: #fffefa; box-shadow: 0 8px 25px rgba(70,68,55,.05); }.saved-note-image { position: relative; width: 124px; height: 157px; overflow: hidden; border: 1px solid #ddd9cc; border-radius: 3px; background: #e8e4d6; }.saved-note-image img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }.photo-count { position: absolute; right: 6px; bottom: 6px; border-radius: 2px; background: rgba(42,42,37,.68); color: white; padding: 4px 5px; font-family: 'DM Mono', monospace; font-size: 7px; }.saved-note-body { min-width: 0; align-self: center; padding: 4px 0; }.saved-note-top { display: flex; justify-content: space-between; align-items: center; }.note-subject { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .08em; }.saved-note-date { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }.saved-note h2 { margin: 10px 0 7px; font-size: 17px; font-weight: 800; letter-spacing: -.08em; }.saved-note p { max-width: 455px; margin: 0; color: #93928a; font-size: 9px; line-height: 1.7; }.topic-chips { display: flex; align-items: center; gap: 5px; margin-top: 15px; }.topic-chips button { border: 1px solid #e2e0d7; border-radius: 99px; background: #fbfaf5; color: #8d8c83; padding: 4px 7px; font-size: 7px; }.topic-chips button:hover { border-color: #dfb7a4; color: var(--accent); }.topic-chips > span { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 7px; }.note-arrow { display: grid; place-items: center; align-self: center; width: 27px; height: 27px; border-radius: 50%; color: var(--accent); font-size: 16px; }.saved-note:hover .note-arrow { background: #f5e2d9; }.empty-notes { padding: 70px 0; text-align: center; }.empty-notes > span { color: #d0b0a2; font-size: 34px; }.empty-notes h2 { margin: 14px 0 7px; font-size: 16px; }.empty-notes p { margin: 0; color: #aaa99f; font-size: 11px; }.empty-notes button { margin-top: 16px; border: 1px solid #deddd4; border-radius: 3px; background: transparent; padding: 8px 12px; color: #77766e; font-size: 9px; }.notes-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 23px 0 29px; color: #aaa99f; font-size: 10px; }.notes-footer > span:first-child { color: var(--ink); font-size: 15px; font-weight: 800; letter-spacing: -.08em; }
.loading-notes { display: flex; min-height: 260px; flex-direction: column; align-items: center; justify-content: center; color: #aaa99f; font-size: 10px; }.loading-notes span { width: 32px; height: 32px; margin-bottom: 14px; border: 2px solid #efd9ce; border-top-color: var(--accent); border-radius: 50%; animation: note-spin .9s linear infinite; }@keyframes note-spin { to { transform: rotate(360deg); } }
@media (max-width: 850px) { .notes-main { grid-template-columns: 200px 1fr; gap: 35px; }.notes-nav { margin-left: auto; margin-right: 20px; }.saved-note { grid-template-columns: 100px 1fr 24px; }.saved-note-image { width: 100px; height: 142px; }.topic-chips button:nth-child(n+4) { display: none; } }
@media (max-width: 680px) { .page-width { width: min(100% - 36px, 520px); }.notes-topbar { min-height: 72px; flex-wrap: wrap; gap: 13px; padding: 14px 0 10px; }.notes-nav { order: 3; display: flex; width: 100%; justify-content: space-between; gap: 8px; margin: 0; overflow-x: auto; font-size: 9px; }.notes-main { display: block; padding-top: 43px; }.knowledge-sidebar { position: static; margin-bottom: 39px; }.sidebar-title { padding-bottom: 13px; }.sidebar-section { padding-top: 18px; }.timeline-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }.timeline-list::before { display: none; }.timeline-list button { display: flex; min-height: 68px; flex-direction: column; align-items: flex-start; justify-content: center; border: 1px solid #e2e0d7; padding: 8px; }.timeline-copy { padding: 5px 0 0; }.timeline-list button i { position: absolute; top: 7px; right: 7px; }.concept-list { flex-direction: row; flex-wrap: wrap; }.concept-list button { border: 1px solid #e1dfd6; border-radius: 99px; padding: 6px 8px; }.concept-guide { margin-bottom: 10px; }.clear-filter { width: auto; padding-left: 12px; padding-right: 12px; }.notes-heading h1 { font-size: 34px; }.notes-heading-meta { display: none; }.notes-toolbar { flex-wrap: wrap; }.search-field { flex-basis: 100%; }.active-filter, .sort-button { min-height: 31px; }.saved-note { grid-template-columns: 84px 1fr 20px; gap: 12px; min-height: 127px; padding: 8px; }.saved-note-image { width: 84px; height: 127px; }.saved-note h2 { font-size: 14px; }.saved-note p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }.saved-note-date { display: none; }.topic-chips { margin-top: 9px; }.topic-chips button:nth-child(n+3) { display: none; }.notes-footer { align-items: flex-start; gap: 20px; }.notes-footer > span:last-child { max-width: 160px; text-align: right; line-height: 1.5; } }
</style>
