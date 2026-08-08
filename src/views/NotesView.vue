<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const query = ref('')
const activeCollection = ref('all')
const toastMessage = ref('')
let toastTimer

const notes = [
  {
    id: 'august-seven',
    title: '8/7 필기',
    subject: '미분류',
    date: '8/7 · 촬영',
    pages: 1,
    links: 3,
    image: '/handwritten-note-sample-rotated.jpeg',
    excerpt: '시장 지표와 폴리실리콘 관련 정책 내용을 기록한 손글씨 메모예요.',
    tag: '최근 업로드',
  },
  {
    id: 'photosynthesis',
    title: '광합성의 과정',
    subject: '생물학',
    date: '어제 · 19:20',
    pages: 2,
    links: 5,
    image: null,
    excerpt: '빛에너지를 이용해 포도당을 만드는 과정을 한눈에 정리했어요.',
    tag: '연결 많음',
  },
  {
    id: 'cell',
    title: '세포의 구조',
    subject: '생물학',
    date: '08. 06 · 14:08',
    pages: 1,
    links: 3,
    image: null,
    excerpt: '세포막과 핵의 역할, 세포를 이루는 기본 구조를 담았어요.',
    tag: '복습 예정',
  },
  {
    id: 'review',
    title: '중간고사 복습 메모',
    subject: '아동간호학',
    date: '08. 04 · 21:34',
    pages: 3,
    links: 7,
    image: null,
    excerpt: '시험 전에 다시 봐야 할 키워드들을 모아둔 노트예요.',
    tag: '연결 많음',
  },
]

const filteredNotes = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  return notes.filter((note) => {
    const matchesQuery = !normalizedQuery || `${note.title} ${note.subject} ${note.excerpt}`.toLowerCase().includes(normalizedQuery)
    const matchesCollection = activeCollection.value === 'all' || (activeCollection.value === 'recent' && note.id === 'august-seven') || (activeCollection.value === 'linked' && note.links >= 5)
    return matchesQuery && matchesCollection
  })
})

function showToast(message) {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2400)
}

function openNote(note) {
  if (note.id === 'august-seven') {
    router.push('/notes/august-seven')
    return
  }
  showToast(`${note.title} 노트를 열었어요.`)
}
</script>

<template>
  <div class="notes-shell">
    <header class="notes-topbar page-width">
      <a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a>
      <nav class="notes-nav"><a class="active" href="/notes">내 노트</a><a href="/#how-it-works">사용 방법</a></nav>
      <a class="notes-upload-button" href="/">+ 새 필기 올리기</a>
    </header>

    <main class="notes-main page-width">
      <aside class="notes-sidebar">
        <div class="sidebar-heading"><span class="eyebrow">LIBRARY</span><span class="note-total">4 notes</span></div>
        <nav class="collection-nav" aria-label="노트 필터">
          <button :class="{ active: activeCollection === 'all' }" type="button" @click="activeCollection = 'all'"><span class="collection-icon">▤</span>모든 노트 <b>4</b></button>
          <button :class="{ active: activeCollection === 'recent' }" type="button" @click="activeCollection = 'recent'"><span class="collection-icon">◷</span>최근 업로드 <b>1</b></button>
          <button :class="{ active: activeCollection === 'linked' }" type="button" @click="activeCollection = 'linked'"><span class="collection-icon">⌘</span>연결 많은 노트 <b>2</b></button>
        </nav>
        <div class="sidebar-divider"></div>
        <div class="sidebar-heading tags-heading"><span class="eyebrow">SUBJECTS</span><button type="button" @click="showToast('과목을 추가할 수 있어요.')">+</button></div>
        <div class="subject-list"><button type="button" @click="showToast('아직 과목이 지정되지 않은 노트예요.')"><i class="subject-dot coral"></i>미분류 <span>1</span></button><button type="button" @click="showToast('생물학 노트를 모아볼게요.')"><i class="subject-dot blue"></i>생물학 <span>2</span></button><button type="button" @click="showToast('기타 노트를 모아볼게요.')"><i class="subject-dot yellow"></i>기타 <span>1</span></button></div>
        <div class="sidebar-quote"><span>“</span><p>정리하는 건<br /><em>잊지 않는 방법.</em></p></div>
      </aside>

      <section class="notes-content">
        <div class="notes-heading"><div><span class="eyebrow"><span class="eyebrow-dot"></span> YOUR LIBRARY</span><h1>내 노트</h1><p>찍어둔 필기들이 다시 보기 좋은 노트가 되어 있어요.</p></div><div class="notes-heading-meta"><strong>4</strong><span>총 노트</span></div></div>
        <div class="notes-toolbar"><label class="search-field"><span>⌕</span><input v-model="query" type="search" placeholder="노트 제목이나 내용을 검색해보세요" /></label><button class="sort-button" type="button" @click="showToast('최근 추가된 순으로 보고 있어요.')">최근 추가순 <span>⌄</span></button></div>

        <div v-if="filteredNotes.length" class="notes-list">
          <article v-for="(note, index) in filteredNotes" :key="note.id" class="saved-note" :class="{ featured: index === 0 && !query && activeCollection === 'all' }" @click="openNote(note)">
            <div class="saved-note-image" :class="{ 'paper-preview': !note.image }">
              <img v-if="note.image" :src="note.image" :alt="`${note.title} 필기 사진`" />
              <div v-else class="generated-paper"><span>{{ note.title }}</span><small>{{ note.subject }}</small><i></i><i></i><i></i><b>✦</b></div>
              <span class="photo-count">{{ note.pages }}p</span>
            </div>
            <div class="saved-note-body"><div class="saved-note-top"><span class="note-subject">{{ note.subject }}</span><span class="saved-note-date">{{ note.date }}</span></div><h2>{{ note.title }}</h2><p>{{ note.excerpt }}</p><div class="saved-note-bottom"><span class="note-status" :class="{ coral: note.tag === '최근 업로드' }"><i></i>{{ note.tag }}</span><span class="link-count">⌁ {{ note.links }} 연결</span></div></div>
            <button class="note-more" type="button" aria-label="노트 메뉴" @click.stop="showToast('노트 메뉴를 준비 중이에요.')">···</button>
          </article>
        </div>
        <div v-else class="empty-notes"><span>⌕</span><h2>찾는 노트가 없어요</h2><p>다른 검색어로 다시 찾아보세요.</p></div>
      </section>
    </main>

    <footer class="notes-footer page-width"><span>필기<span class="brand-dot">.</span></span><span>노트는 자동으로 연결되고, 당신의 공부는 오래 남아요.</span></footer>
    <transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></transition>
  </div>
</template>

<style scoped>
.notes-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }
.notes-topbar { height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
.notes-nav { display: flex; gap: 31px; margin-left: 100px; color: #a09f96; font-size: 11px; font-weight: 600; }.notes-nav a { padding: 5px 0; }.notes-nav a.active { color: var(--ink); border-bottom: 1px solid var(--accent); }
.notes-upload-button { border: 1px solid var(--ink); border-radius: 4px; padding: 11px 15px; background: var(--ink); color: white; font-size: 10px; font-weight: 700; transition: transform .2s, background .2s; }.notes-upload-button:hover { background: #4a4a43; transform: translateY(-1px); }
.notes-main { display: grid; grid-template-columns: 185px 1fr; gap: 85px; padding: 69px 0 106px; }.notes-sidebar { padding-top: 7px; }.sidebar-heading { display: flex; align-items: center; justify-content: space-between; }.sidebar-heading .eyebrow { color: #9e9d93; font-size: 8px; }.note-total { color: #bab9af; font-family: 'DM Mono', monospace; font-size: 8px; }.collection-nav { display: flex; flex-direction: column; gap: 6px; margin-top: 24px; }.collection-nav button { display: flex; align-items: center; width: 100%; border: 0; border-radius: 4px; background: transparent; color: #88877e; padding: 10px 9px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: -.03em; }.collection-nav button:hover, .collection-nav button.active { background: #eeece3; color: var(--ink); }.collection-nav button b { margin-left: auto; color: #aaa9a0; font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 400; }.collection-icon { width: 20px; color: #aaa99e; font-size: 14px; }.collection-nav .active .collection-icon { color: var(--accent); }.sidebar-divider { height: 1px; margin: 30px 0; background: #e4e3d9; }.tags-heading button { border: 0; background: transparent; color: #aaa99f; font-size: 18px; line-height: 1; }.subject-list { display: flex; flex-direction: column; gap: 16px; margin-top: 23px; }.subject-list button { display: flex; align-items: center; gap: 8px; border: 0; background: transparent; color: #77766e; padding: 0; text-align: left; font-size: 11px; }.subject-list button:hover { color: var(--ink); }.subject-list button span { margin-left: auto; color: #b5b4a9; font-family: 'DM Mono', monospace; font-size: 9px; }.subject-dot { width: 7px; height: 7px; border-radius: 50%; background: #aaa99f; }.subject-dot.coral { background: #e4977a; }.subject-dot.blue { background: #8ba9ba; }.subject-dot.yellow { background: #d6ba76; }.sidebar-quote { margin-top: 100px; color: #a7a69b; }.sidebar-quote span { display: block; height: 19px; color: #e0b29e; font-family: Georgia, serif; font-size: 42px; line-height: .5; }.sidebar-quote p { margin: 15px 0 0; font-size: 11px; line-height: 1.7; letter-spacing: -.05em; }.sidebar-quote em { color: var(--accent); font-family: 'Gowun Batang', serif; font-style: normal; font-weight: 700; }
.notes-heading { display: flex; align-items: flex-end; justify-content: space-between; }.notes-heading h1 { margin: 16px 0 9px; font-size: 38px; font-weight: 800; letter-spacing: -.1em; }.notes-heading p { margin: 0; color: #95948b; font-size: 12px; letter-spacing: -.04em; }.notes-heading-meta { display: flex; flex-direction: column; align-items: flex-end; padding-bottom: 2px; }.notes-heading-meta strong { color: var(--accent); font-family: 'Gowun Batang', serif; font-size: 30px; line-height: 1; }.notes-heading-meta span { margin-top: 4px; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }.notes-toolbar { display: flex; gap: 10px; margin-top: 34px; padding-bottom: 15px; border-bottom: 1px solid #deddd4; }.search-field { display: flex; flex: 1; align-items: center; gap: 8px; border: 1px solid #e0dfd6; border-radius: 3px; background: rgba(255,255,252,.6); padding: 9px 12px; }.search-field span { color: #a8a79e; font-size: 19px; line-height: .5; }.search-field input { width: 100%; border: 0; outline: 0; background: transparent; color: var(--ink); font-size: 10px; }.search-field input::placeholder { color: #b0afa5; }.sort-button { border: 1px solid #e0dfd6; border-radius: 3px; background: transparent; color: #8c8b82; padding: 0 12px; font-size: 10px; }.sort-button span { margin-left: 7px; color: var(--accent); font-size: 13px; }.notes-list { display: flex; flex-direction: column; gap: 12px; padding-top: 15px; }.saved-note { position: relative; display: grid; grid-template-columns: 112px 1fr; gap: 20px; min-height: 135px; border: 1px solid transparent; border-radius: 5px; background: rgba(255,255,252,.38); padding: 12px; cursor: pointer; transition: border .2s, background .2s, transform .2s; }.saved-note:hover { border-color: #deddd3; background: #fffefa; transform: translateX(3px); }.saved-note.featured { border-color: #e6dace; background: #fffefa; box-shadow: 0 8px 25px rgba(70,68,55,.05); }.saved-note-image { position: relative; width: 112px; height: 135px; overflow: hidden; border: 1px solid #ddd9cc; border-radius: 3px; background: #e8e4d6; }.saved-note-image img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }.photo-count { position: absolute; right: 6px; bottom: 6px; border-radius: 2px; background: rgba(42,42,37,.68); color: white; padding: 4px 5px; font-family: 'DM Mono', monospace; font-size: 7px; }.paper-preview { display: grid; place-items: center; background: #f6f1e2; }.generated-paper { display: flex; flex-direction: column; gap: 5px; width: 75px; height: 103px; padding: 15px 11px; border: 1px solid #ded8c6; background: #fffcf0; box-shadow: 3px 4px 0 #e4dfd1; transform: rotate(-5deg); }.generated-paper span { color: #55544c; font-family: 'Gowun Batang', serif; font-size: 10px; font-weight: 700; }.generated-paper small { color: #9c9586; font-family: 'Gowun Batang', serif; font-size: 7px; }.generated-paper i { width: 48px; height: 1px; background: #d1ccba; }.generated-paper b { margin-top: 3px; color: #e39b7e; font-size: 12px; font-weight: 400; }.saved-note-body { min-width: 0; align-self: center; padding: 4px 35px 4px 0; }.saved-note-top { display: flex; justify-content: space-between; align-items: center; }.note-subject { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .08em; }.saved-note-date { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }.saved-note h2 { margin: 11px 0 8px; color: var(--ink); font-size: 17px; font-weight: 800; letter-spacing: -.08em; }.saved-note p { max-width: 410px; margin: 0; color: #93928a; font-size: 10px; line-height: 1.7; letter-spacing: -.03em; }.saved-note-bottom { display: flex; align-items: center; gap: 16px; margin-top: 16px; }.note-status, .link-count { color: #a5a49a; font-family: 'DM Mono', monospace; font-size: 8px; }.note-status i { display: inline-block; width: 5px; height: 5px; margin-right: 5px; border-radius: 50%; background: #bcbab0; }.note-status.coral { color: var(--accent); }.note-status.coral i { background: var(--accent); }.link-count { color: #aaa99e; }.note-more { position: absolute; top: 19px; right: 17px; border: 0; background: transparent; color: #aaa99e; padding: 0; font-size: 14px; letter-spacing: 2px; }.empty-notes { padding: 70px 0; text-align: center; }.empty-notes > span { color: #d0b0a2; font-size: 34px; }.empty-notes h2 { margin: 14px 0 7px; font-size: 16px; }.empty-notes p { margin: 0; color: #aaa99f; font-size: 11px; }.notes-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 23px 0 29px; color: #aaa99f; font-size: 10px; }.notes-footer > span:first-child { color: var(--ink); font-size: 15px; font-weight: 800; letter-spacing: -.08em; }
@media (max-width: 800px) { .notes-main { grid-template-columns: 1fr; gap: 36px; padding-top: 48px; }.notes-sidebar { display: none; }.notes-nav { margin-left: auto; margin-right: 24px; }.saved-note { grid-template-columns: 95px 1fr; }.saved-note-image { width: 95px; height: 124px; } }
@media (max-width: 520px) { .page-width { width: min(100% - 36px, 520px); }.notes-topbar { height: 72px; }.notes-nav { display: none; }.notes-upload-button { padding: 9px 11px; font-size: 9px; }.notes-heading h1 { font-size: 34px; }.notes-heading p { font-size: 10px; }.notes-heading-meta { display: none; }.notes-toolbar { flex-direction: column; }.sort-button { align-self: flex-end; padding: 8px 10px; }.saved-note { grid-template-columns: 74px 1fr; gap: 12px; min-height: 114px; padding: 8px; }.saved-note-image { width: 74px; height: 114px; }.saved-note-body { padding-right: 15px; }.saved-note h2 { margin: 8px 0 5px; font-size: 14px; }.saved-note p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; font-size: 9px; }.saved-note-bottom { gap: 8px; margin-top: 10px; }.saved-note-date { display: none; }.note-more { top: 14px; right: 10px; }.notes-footer { align-items: flex-start; gap: 20px; }.notes-footer > span:last-child { max-width: 150px; text-align: right; line-height: 1.5; } }
</style>
