<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getAllNotes, getNoteById } from '@/services/noteRepository'

const route = useRoute()
const note = ref(null)
const allNotes = ref([])
const isLoading = ref(true)
const loadError = ref('')

const relatedNotes = computed(() => {
  if (!note.value) return []
  return allNotes.value
    .filter((item) => item.id !== note.value.id)
    .map((item) => ({ ...item, shared: item.topics.filter((topic) => note.value.topics.includes(topic)) }))
    .filter((item) => item.shared.length)
})

watch(
  () => route.params.noteId,
  async (noteId) => {
    isLoading.value = true
    loadError.value = ''
    try {
      const [selectedNote, notes] = await Promise.all([getNoteById(noteId), getAllNotes()])
      note.value = selectedNote || null
      allNotes.value = notes
    } catch (error) {
      note.value = null
      loadError.value = error.message || '노트를 불러오지 못했어요.'
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="photo-detail-shell">
    <header class="photo-detail-topbar page-width">
      <a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a>
      <a class="back-button" href="/notes"><span>←</span> 내 노트</a>
    </header>

    <main v-if="isLoading" class="not-found page-width"><div class="detail-loader"></div><h1>정리된 노트를 불러오고 있어요.</h1></main>

    <main v-else-if="note" class="photo-detail-main page-width">
      <div class="photo-detail-heading"><span class="eyebrow"><span class="eyebrow-dot"></span> ORGANIZED NOTE · {{ note.sections.length }} SECTIONS</span><h1>{{ note.title }}</h1><p>{{ note.excerpt }}</p><div class="detail-topic-chips"><span v-for="topic in note.topics" :key="topic">#{{ topic }}</span></div></div>

      <section class="detail-summary"><div><span class="section-kicker">SUMMARY</span><h2>{{ note.date }}의<br /><em>핵심 메모</em></h2></div><p>손글씨에서 확인된 내용을 주제별로 나눴어요. 판독이 불확실한 고유명사나 수치는 원문과 함께 확인해주세요.</p></section>

      <section class="organized-sections"><article v-for="(section, index) in note.sections" :key="section.title" class="organized-section"><div class="organized-number">{{ String(index + 1).padStart(2, '0') }}</div><div class="organized-body"><span class="section-kicker">{{ section.kicker }}</span><h2>{{ section.title }}</h2><ul><li v-for="item in section.items" :key="item"><i></i><span>{{ item }}</span></li></ul></div></article></section>

      <section v-if="note.uncertainItems?.length" class="uncertain-section"><div><span>!</span><h2>원본과 다시 확인해주세요</h2></div><ul><li v-for="item in note.uncertainItems" :key="item">{{ item }}</li></ul></section>

      <details v-if="note.rawText" class="raw-text"><summary>AI가 읽은 필기 원문 보기 <span>⌄</span></summary><pre>{{ note.rawText }}</pre></details>

      <section v-if="relatedNotes.length" class="related-notes"><div class="related-heading"><span class="section-kicker">CONNECTED NOTES</span><h2>같은 개념으로 이어지는 필기</h2></div><div class="related-list"><a v-for="item in relatedNotes" :key="item.id" :href="item.route"><span class="related-date">{{ item.dateKey }}</span><div><strong>{{ item.shortTitle }}</strong><p><span v-for="topic in item.shared.slice(0, 3)" :key="topic">#{{ topic }}</span></p></div><b>→</b></a></div></section>
    </main>

    <main v-else class="not-found page-width"><h1>{{ loadError || '노트를 찾을 수 없어요.' }}</h1><a href="/notes">내 노트로 돌아가기</a></main>
    <footer class="photo-detail-footer page-width"><span>필기<span class="brand-dot">.</span></span><span>날짜는 달라도, 같은 생각은 연결돼요.</span></footer>
  </div>
</template>

<style scoped>
.photo-detail-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }.photo-detail-topbar { height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }.back-button { display: flex; align-items: center; gap: 7px; border: 1px solid #deddd4; border-radius: 99px; padding: 9px 14px; color: #77766e; font-size: 10px; font-weight: 700; }.back-button span { color: var(--accent); font-size: 14px; }.photo-detail-main { width: min(900px, calc(100% - 64px)); padding: 67px 0 110px; }.photo-detail-heading { text-align: center; }.photo-detail-heading .eyebrow { justify-content: center; }.photo-detail-heading h1 { margin: 18px 0 11px; font-size: 43px; font-weight: 800; letter-spacing: -.1em; }.photo-detail-heading > p { margin: 0 auto; max-width: 550px; color: #929188; font-size: 11px; line-height: 1.7; }.detail-topic-chips { display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; margin-top: 22px; }.detail-topic-chips span { border: 1px solid #dfded4; border-radius: 99px; background: #fffefa; color: #8e8d84; padding: 5px 8px; font-size: 8px; }.detail-summary { display: grid; grid-template-columns: 1fr 1.2fr; gap: 60px; align-items: center; margin-top: 51px; border-radius: 7px; background: #2d2e2a; color: white; padding: 36px 41px; }.section-kicker { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .12em; }.detail-summary h2 { margin: 10px 0 0; font-size: 26px; line-height: 1.35; letter-spacing: -.08em; }.detail-summary h2 em { color: #efa183; font-family: 'Gowun Batang', serif; font-style: normal; }.detail-summary > p { margin: 0; color: #b7b8b1; font-size: 9px; line-height: 1.8; }.organized-sections { display: flex; flex-direction: column; margin-top: 21px; border: 1px solid #dfded4; border-radius: 7px; background: #fffefa; }.organized-section { display: grid; grid-template-columns: 60px 1fr; gap: 22px; border-bottom: 1px solid #e7e6de; padding: 30px 37px; }.organized-section:last-child { border-bottom: 0; }.organized-number { color: #c0beb5; font-family: 'DM Mono', monospace; font-size: 9px; }.organized-body h2 { margin: 7px 0 18px; font-size: 19px; font-weight: 800; letter-spacing: -.07em; }.organized-body ul { display: flex; flex-direction: column; gap: 0; margin: 0; padding: 0; list-style: none; }.organized-body li { display: flex; align-items: flex-start; gap: 10px; border-top: 1px solid #efeee7; padding: 12px 0; color: #68675f; font-family: 'Gowun Batang', serif; font-size: 11px; font-weight: 700; }.organized-body li i { flex: 0 0 5px; width: 5px; height: 5px; margin-top: 6px; border-radius: 50%; background: #dfa087; }.related-notes { margin-top: 48px; }.related-heading { margin-bottom: 14px; }.related-heading h2 { margin: 7px 0 0; font-size: 18px; font-weight: 800; letter-spacing: -.07em; }.related-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }.related-list a { display: grid; grid-template-columns: 44px 1fr 25px; align-items: center; border: 1px solid #dfded4; border-radius: 5px; background: #fffefa; padding: 17px 18px; transition: border .2s, transform .2s; }.related-list a:hover { border-color: #dfa48b; transform: translateY(-2px); }.related-date { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; }.related-list strong { font-size: 11px; font-weight: 800; }.related-list p { display: flex; gap: 5px; margin: 5px 0 0; color: #99988f; font-size: 7px; }.related-list b { color: var(--accent); font-size: 15px; font-weight: 400; }.photo-detail-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 23px 0 29px; color: #aaa99f; font-size: 10px; }.photo-detail-footer > span:first-child { color: var(--ink); font-size: 15px; font-weight: 800; letter-spacing: -.08em; }.not-found { min-height: 70vh; padding-top: 100px; text-align: center; }.not-found h1 { font-size: 28px; }.not-found a { color: var(--accent); font-size: 11px; }
.uncertain-section { display: grid; grid-template-columns: 190px 1fr; gap: 30px; margin-top: 18px; border: 1px solid #edcfc0; border-radius: 6px; background: #fff4ed; padding: 25px 31px; }.uncertain-section > div { display: flex; align-items: center; gap: 10px; }.uncertain-section > div span { display: grid; place-items: center; width: 25px; height: 25px; border: 1px solid #dfa087; border-radius: 50%; color: var(--accent); font-size: 10px; }.uncertain-section h2 { margin: 0; font-size: 12px; }.uncertain-section ul { margin: 0; padding-left: 18px; color: #8b7165; font-size: 9px; line-height: 1.8; }.raw-text { margin-top: 14px; border: 1px solid #dfded4; border-radius: 5px; background: #fffefa; }.raw-text summary { display: flex; justify-content: space-between; padding: 17px 20px; color: #77766e; font-size: 10px; font-weight: 800; cursor: pointer; list-style: none; }.raw-text pre { overflow-x: auto; margin: 0; border-top: 1px solid #e7e6de; padding: 22px; color: #68675f; font-family: 'Gowun Batang', serif; font-size: 10px; line-height: 1.9; white-space: pre-wrap; }.detail-loader { width: 35px; height: 35px; margin: 0 auto 20px; border: 2px solid #efd9ce; border-top-color: var(--accent); border-radius: 50%; animation: detail-spin .9s linear infinite; }@keyframes detail-spin { to { transform: rotate(360deg); } }
@media (max-width: 680px) { .page-width, .photo-detail-main { width: min(100% - 36px, 520px); }.photo-detail-topbar { height: 72px; }.photo-detail-main { padding-top: 49px; }.photo-detail-heading h1 { font-size: 35px; }.detail-summary { grid-template-columns: 1fr; gap: 18px; padding: 29px 26px; }.organized-section { grid-template-columns: 32px 1fr; gap: 8px; padding: 25px 20px; }.uncertain-section { grid-template-columns: 1fr; gap: 13px; padding: 21px; }.related-list { grid-template-columns: 1fr; }.photo-detail-footer { align-items: flex-start; gap: 20px; }.photo-detail-footer > span:last-child { text-align: right; } }
</style>
