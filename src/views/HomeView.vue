<script setup>
import { computed, ref } from 'vue'

const fileInput = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const isResult = ref(false)
const uploaderOpened = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')
const toastMessage = ref('')
const selectedConnection = ref('광합성')
let toastTimer

const noteTitle = computed(() => selectedFile.value?.name?.replace(/\.[^/.]+$/, '') || '생물학 — 세포의 구조')
const selectedRelation = computed(() => connectedNotes.find((note) => note.title === selectedConnection.value))
const connectedNotes = [
  { title: '광합성', type: '개념 연결', body: '세포가 에너지를 만드는 방식으로 연결돼요.', date: '어제', className: 'node-top' },
  { title: '생명체의 구성', type: '상위 개념', body: '세포가 생명체를 이루는 기본 단위라는 점에서 이어져요.', date: '08. 06', className: 'node-left' },
  { title: '에너지 대사', type: '관련 주제', body: '세포 안에서 일어나는 에너지 흐름을 함께 볼 수 있어요.', date: '08. 04', className: 'node-right' },
]

function showToast(message) {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2600)
}

function openFilePicker() {
  fileInput.value?.click()
}

function openUploadFlow() {
  uploaderOpened.value = true
  openFilePicker()
  window.setTimeout(() => {
    document.querySelector('.upload-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 120)
}

function handleFileChange(event) {
  const [file] = event.target.files
  if (file) prepareFile(file)
  event.target.value = ''
}

function handleDrop(event) {
  isDragging.value = false
  const [file] = event.dataTransfer.files
  if (file) prepareFile(file)
}

function prepareFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('이미지 파일만 올릴 수 있어요.')
    return
  }

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  isProcessing.value = true
  isResult.value = false

  window.setTimeout(() => {
    isProcessing.value = false
    isResult.value = true
    showToast('필기를 깔끔한 노트로 정리했어요.')
  }, 1300)
}

function useDemo() {
  uploaderOpened.value = true
  selectedFile.value = { name: '생물학 — 세포의 구조.jpg' }
  previewUrl.value = ''
  isProcessing.value = true
  isResult.value = false
  window.setTimeout(() => {
    isProcessing.value = false
    isResult.value = true
    showToast('예시 필기를 정리했어요.')
  }, 900)
}

function resetWorkspace() {
  selectedFile.value = null
  previewUrl.value = ''
  isResult.value = false
  isProcessing.value = false
  uploaderOpened.value = false
  selectedConnection.value = '광합성'
}

function copyNote() {
  navigator.clipboard?.writeText('세포는 생명체의 기본 단위이다. 세포막은 물질의 출입을 조절하며, 핵은 유전 정보를 보관한다.')
  showToast('요약 내용을 클립보드에 복사했어요.')
}

function selectConnection(title) {
  selectedConnection.value = title
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar page-width">
      <a class="brand" href="/" aria-label="필기 홈">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </span>
        <span>필기<span class="brand-dot">.</span></span>
      </a>

      <nav class="topnav" aria-label="주 메뉴">
        <a href="/notes">내 노트</a>
        <a href="#how-it-works">사용 방법</a>
        <a href="#why">이렇게 좋아요</a>
      </nav>

      <button class="login-button" type="button" @click="showToast('로그인 기능은 곧 준비할게요.')">로그인 <span>↗</span></button>
    </header>

    <input ref="fileInput" class="sr-only" type="file" accept="image/*" @change="handleFileChange" />

    <main>
      <section class="start-section page-width">
        <div class="start-heading">
          <span class="eyebrow"><span class="eyebrow-dot"></span> START YOUR NOTE</span>
          <h1>어떤 방식으로<br /><em>시작할까요?</em></h1>
          <p>새로운 필기를 정리하거나, 지금까지 쌓인 노트를 다시 볼 수 있어요.</p>
        </div>

        <div class="start-choices">
          <button class="start-choice photo-choice" type="button" @click="openUploadFlow">
            <span class="choice-number">01</span>
            <div class="choice-visual photo-visual" aria-hidden="true">
              <span class="choice-paper back"></span><span class="choice-paper middle"></span><span class="choice-paper front"><svg viewBox="0 0 32 32" fill="none"><path d="M16 22V8m0 0-5 5m5-5 5 5M7 23.5v1A2.5 2.5 0 0 0 9.5 27h13a2.5 2.5 0 0 0 2.5-2.5v-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            </div>
            <div class="choice-copy"><span>NEW NOTE</span><h2>사진 추가</h2><p>손글씨 사진을 올리고<br />보기 좋은 노트로 정리해요.</p></div>
            <span class="choice-button">사진 선택하기 <b>→</b></span>
          </button>

          <a class="start-choice notes-choice" href="/notes">
            <span class="choice-number">02</span>
            <div class="choice-visual notes-visual" aria-hidden="true">
              <div class="mini-library"><span><i></i><b>8/7 필기</b><small>3 sections</small></span><span><i></i><b>광합성의 과정</b><small>5 links</small></span><span><i></i><b>세포의 구조</b><small>3 links</small></span></div>
            </div>
            <div class="choice-copy"><span>MY LIBRARY</span><h2>내 필기로 들어가기</h2><p>정리된 필기를 찾고<br />연결된 내용을 함께 확인해요.</p></div>
            <span class="choice-button">필기 목록 보기 <b>→</b></span>
          </a>
        </div>
      </section>

      <section v-if="uploaderOpened || isProcessing || isResult" class="hero upload-workspace page-width">
        <div class="hero-copy">
          <div class="eyebrow"><span class="eyebrow-dot"></span> HANDWRITING TO NOTES</div>
          <h1>찍으면,<br /><em>공부가 정리돼요.</em></h1>
          <p class="hero-description">연필로 쓴 필기를 사진으로 남겨보세요.<br />복잡한 내용은 덜어내고, 다시 보기 좋은 노트로 바꿔드릴게요.</p>
          <div class="hero-actions">
            <button class="primary-button" type="button" @click="openFilePicker">
              <span>필기 사진 올리기</span>
              <span class="button-arrow">→</span>
            </button>
            <button class="text-button" type="button" @click="useDemo">예시로 먼저 보기 <span>↗</span></button>
          </div>
          <p class="privacy-note"><span class="lock-icon">⌑</span> 사진은 안전하게 처리되며, 저장하지 않아요.</p>
        </div>

        <div
          class="upload-card"
          :class="{ dragging: isDragging, 'has-result': isResult, processing: isProcessing }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <template v-if="isProcessing">
            <div class="processing-state">
              <div class="loader-ring"></div>
              <p class="state-kicker">잠시만요</p>
              <h2>필기를 읽고 있어요<span class="loading-dots">...</span></h2>
              <p>글씨를 알아보고, 중요한 내용을 골라내는 중이에요.</p>
            </div>
          </template>

          <template v-else-if="isResult">
            <div class="result-header">
              <div>
                <p class="state-kicker">정리 완료</p>
                <h2>오늘의 공부 노트</h2>
              </div>
              <button class="close-button" type="button" aria-label="다시 올리기" @click="resetWorkspace">×</button>
            </div>
            <div class="note-sheet">
              <div class="note-sheet-top"><span>2026. 08. 08</span><span>생물학</span></div>
              <h3>{{ noteTitle }}</h3>
              <div class="highlight-line"></div>
              <p class="note-lead">세포는 생명체의 구조적·기능적 기본 단위이다.</p>
              <div class="note-section"><span class="section-number">01</span><div><strong>세포막</strong><p>세포 안팎의 물질 출입을 조절한다.</p></div></div>
              <div class="note-section"><span class="section-number">02</span><div><strong>핵</strong><p>유전 정보를 보관하고 세포의 활동을 조절한다.</p></div></div>
              <div class="note-tip"><span>✦</span><p><b>한 줄 요약</b><br />세포막은 경계를, 핵은 중심을 맡는다.</p></div>
            </div>
            <div class="result-actions"><button type="button" @click="copyNote">내용 복사</button><button type="button" @click="showToast('노트를 저장했어요.')">노트 저장</button></div>
          </template>

          <template v-else>
            <div class="upload-card-heading">
              <span class="upload-label">01 <i></i> 사진 업로드</span>
              <span class="upload-hint">JPG · PNG</span>
            </div>
            <button class="dropzone" type="button" @click="openFilePicker">
              <div class="paper-stack" aria-hidden="true"><span></span><span></span><span><svg viewBox="0 0 32 32" fill="none"><path d="M16 22V8m0 0-5 5m5-5 5 5M7 23.5v1A2.5 2.5 0 0 0 9.5 27h13a2.5 2.5 0 0 0 2.5-2.5v-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
              <strong>사진을 여기에 놓아주세요</strong>
              <span>또는 <u>파일 선택하기</u></span>
            </button>
            <div class="sample-note" @click="useDemo">
              <div class="mini-paper"><span>광합성</span><small>빛에너지 + 물</small><i></i><i></i><i></i></div>
              <div><p>어떤 사진이든 괜찮아요</p><span>구겨진 필기도 알아볼게요 <b>→</b></span></div>
            </div>
          </template>
        </div>
      </section>

      <section v-if="isResult" class="connections-section page-width">
        <div class="connections-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> YOUR KNOWLEDGE MAP</span>
          <h2>필기들이 서로<br /><em>연결되기 시작해요.</em></h2>
          <p>정리된 노트에서 같은 개념과 이어지는 주제를 찾아요. 한 장의 필기가 혼자 남지 않도록, 당신만의 지식 지도를 만들어드릴게요.</p>
          <div class="connection-detail">
            <div class="detail-icon">↗</div>
            <div>
              <span>{{ selectedRelation?.type }}</span>
              <strong>{{ selectedRelation?.title }} 노트</strong>
              <p>{{ selectedRelation?.body }}</p>
            </div>
          </div>
        </div>
        <div class="graph-card">
          <div class="graph-card-header"><div><span class="state-kicker">CONNECTED NOTES</span><h3>세포의 구조 <b>·</b> 3개의 연결</h3></div><button type="button" @click="showToast('노트 연결을 분석하고 있어요.')">↗ 전체 보기</button></div>
          <div class="graph-canvas">
            <svg class="graph-lines" viewBox="0 0 500 260" preserveAspectRatio="none" aria-hidden="true">
              <path class="graph-line graph-line-active" d="M250 128 C250 99 250 71 250 42" />
              <path class="graph-line" d="M231 143 C201 168 159 188 119 208" />
              <path class="graph-line" d="M269 143 C302 168 342 188 381 208" />
              <circle cx="250" cy="128" r="3" /><circle cx="250" cy="42" r="2.5" /><circle cx="119" cy="208" r="2.5" /><circle cx="381" cy="208" r="2.5" />
            </svg>
            <button class="graph-node node-center" type="button" :class="{ selected: !selectedConnection }" @click="selectedConnection = null"><span class="node-pulse"></span><strong>세포의<br />구조</strong><small>지금 보고 있어요</small></button>
            <button v-for="note in connectedNotes" :key="note.title" class="graph-node" :class="[note.className, { selected: selectedConnection === note.title }]" type="button" @click="selectConnection(note.title)"><span class="node-dot"></span><strong>{{ note.title }}</strong><small>{{ note.date }}</small></button>
            <span class="graph-label label-one">같은 개념</span><span class="graph-label label-two">확장해서 보기</span>
          </div>
          <div class="graph-legend"><span><i class="legend-dot current"></i>현재 노트</span><span><i class="legend-dot related"></i>연결된 노트</span><span class="graph-count">노드를 눌러 관계 확인</span></div>
        </div>
      </section>

      <section id="how-it-works" class="process-section page-width">
        <div class="section-intro"><span class="eyebrow">HOW IT WORKS</span><h2>공부한 흔적은 그대로,<br /><em>다시 보는 방법만 가볍게.</em></h2></div>
        <div class="steps">
          <article class="step-card"><span class="step-number">01</span><div class="step-icon camera-icon">⌁</div><h3>사진 한 장</h3><p>수업이 끝난 뒤, 필기한<br />종이를 바로 찍어주세요.</p></article>
          <article class="step-card"><span class="step-number">02</span><div class="step-icon sparkle-icon">✦</div><h3>내용을 읽고</h3><p>손글씨 속 핵심 내용을<br />찾아 읽기 쉽게 정돈해요.</p></article>
          <article class="step-card"><span class="step-number">03</span><div class="step-icon book-icon">▱</div><h3>다시 보기</h3><p>시험 전에는 잘 정리된<br />나만의 노트로 복습해요.</p></article>
        </div>
      </section>

      <section id="why" class="quote-section page-width"><span class="quote-mark">“</span><p>열심히 쓴 필기가<br /><em>사라지지 않도록.</em></p><span class="quote-caption">FOR THE NOTES YOU MADE BY HAND</span></section>
    </main>

    <footer class="footer page-width"><span>필기<span class="brand-dot">.</span></span><span>당신의 공부를, 조금 더 오래 남겨둘게요.</span></footer>
    <transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></transition>
  </div>
</template>
