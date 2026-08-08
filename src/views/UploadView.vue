<script setup>
import { ref } from 'vue'

const fileInput = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const isComplete = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')

function openFilePicker() {
  fileInput.value?.click()
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
  if (!file.type.startsWith('image/')) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  isProcessing.value = true
  isComplete.value = false
  window.setTimeout(() => {
    isProcessing.value = false
    isComplete.value = true
  }, 1200)
}

function resetUpload() {
  selectedFile.value = null
  previewUrl.value = ''
  isProcessing.value = false
  isComplete.value = false
}
</script>

<template>
  <div class="upload-shell">
    <header class="upload-topbar page-width"><a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a><a class="back-home" href="/"><span>←</span> 시작으로</a></header>

    <main class="upload-main page-width">
      <div class="upload-heading"><span class="eyebrow"><span class="eyebrow-dot"></span> NEW HANDWRITTEN NOTE</span><h1>필기 사진을<br /><em>추가해주세요.</em></h1><p>사진을 읽고 중요한 내용과 연결되는 개념을 찾아드릴게요.</p></div>

      <section class="upload-panel" :class="{ dragging: isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
        <input ref="fileInput" class="sr-only" type="file" accept="image/*" @change="handleFileChange" />

        <template v-if="isProcessing"><div class="upload-state"><div class="upload-loader"></div><span>READING NOTE</span><h2>필기를 읽고 있어요</h2><p>글자와 날짜, 핵심 주제를 찾는 중이에요.</p></div></template>

        <template v-else-if="isComplete"><div class="complete-layout"><div class="complete-preview"><img :src="previewUrl" :alt="selectedFile?.name" /></div><div class="complete-copy"><span class="complete-check">✓</span><small>UPLOAD COMPLETE</small><h2>사진을 추가했어요.</h2><p>{{ selectedFile?.name }}</p><div class="complete-topics"><span>#날짜 분석</span><span>#핵심 주제</span><span>#연결 개념</span></div><div class="complete-actions"><button type="button" @click="resetUpload">다시 선택</button><a href="/notes">내 노트로 이동 <span>→</span></a></div></div></div></template>

        <template v-else><button class="upload-dropzone" type="button" @click="openFilePicker"><div class="upload-icon"><svg viewBox="0 0 32 32" fill="none"><path d="M16 22V8m0 0-5 5m5-5 5 5M7 23.5v1A2.5 2.5 0 0 0 9.5 27h13a2.5 2.5 0 0 0 2.5-2.5v-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><strong>사진을 여기에 놓아주세요</strong><span>또는 <u>파일 선택하기</u></span><small>JPG · PNG · HEIC</small></button></template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.upload-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }.upload-topbar { height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }.back-home { display: flex; align-items: center; gap: 7px; border: 1px solid #deddd4; border-radius: 99px; padding: 9px 14px; color: #77766e; font-size: 10px; font-weight: 700; }.back-home span { color: var(--accent); }.upload-main { display: grid; grid-template-columns: 330px 1fr; gap: 75px; align-items: center; min-height: calc(100vh - 88px); padding-top: 55px; padding-bottom: 70px; }.upload-heading h1 { margin: 20px 0 17px; font-size: 45px; font-weight: 800; line-height: 1.18; letter-spacing: -.09em; }.upload-heading h1 em { color: var(--accent); font-family: 'Gowun Batang', serif; font-style: normal; }.upload-heading > p { margin: 0; color: #8e8d84; font-size: 11px; line-height: 1.8; }.upload-panel { min-height: 470px; border: 1px solid #deddd4; border-radius: 8px; background: #fffefa; padding: 22px; box-shadow: 0 17px 48px rgba(70,68,55,.06); }.upload-panel.dragging { border-color: var(--accent); background: #fff8f2; }.upload-dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 425px; border: 1px dashed #d6d4c9; border-radius: 5px; background: #faf9f3; color: var(--ink); }.upload-icon { display: grid; place-items: center; width: 64px; height: 74px; border: 1px solid #d9d5c8; background: #fffdf6; box-shadow: 6px 7px 0 #eeebe0; transform: rotate(-3deg); }.upload-icon svg { width: 32px; color: var(--accent); }.upload-dropzone strong { margin-top: 30px; font-size: 15px; }.upload-dropzone > span { margin-top: 8px; color: #a09f96; font-size: 10px; }.upload-dropzone u { color: var(--accent); text-underline-offset: 3px; }.upload-dropzone small { margin-top: 25px; color: #bbb9af; font-family: 'DM Mono', monospace; font-size: 7px; }.upload-state { display: flex; min-height: 425px; flex-direction: column; align-items: center; justify-content: center; text-align: center; }.upload-loader { width: 44px; height: 44px; border: 2px solid #f1d7ca; border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }.upload-state > span { margin-top: 24px; color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .12em; }.upload-state h2 { margin: 9px 0 7px; font-size: 20px; }.upload-state p { margin: 0; color: #aaa99f; font-size: 9px; }.complete-layout { display: grid; grid-template-columns: 45% 1fr; gap: 27px; min-height: 425px; }.complete-preview { overflow: hidden; border-radius: 4px; background: #e5e1d5; }.complete-preview img { width: 100%; height: 100%; object-fit: cover; }.complete-copy { display: flex; flex-direction: column; justify-content: center; }.complete-check { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #f6e4db; color: var(--accent); }.complete-copy small { margin-top: 18px; color: var(--accent); font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: .12em; }.complete-copy h2 { margin: 8px 0; font-size: 21px; }.complete-copy > p { overflow: hidden; margin: 0; color: #99988f; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }.complete-topics { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 19px; }.complete-topics span { border: 1px solid #e1dfd6; border-radius: 99px; padding: 5px 7px; color: #8e8d84; font-size: 7px; }.complete-actions { display: flex; gap: 7px; margin-top: 27px; }.complete-actions button, .complete-actions a { border: 1px solid #deddd4; border-radius: 3px; background: transparent; color: #77766e; padding: 9px 11px; font-size: 9px; }.complete-actions a { border-color: var(--ink); background: var(--ink); color: white; }.complete-actions a span { margin-left: 7px; color: var(--accent); }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 720px) { .page-width { width: min(100% - 36px, 520px); }.upload-topbar { height: 72px; }.upload-main { display: block; min-height: auto; padding-top: 47px; }.upload-heading { text-align: center; }.upload-heading .eyebrow { justify-content: center; }.upload-heading h1 { font-size: 39px; }.upload-heading > p { margin: 0 auto 35px; max-width: 330px; }.upload-panel { min-height: 400px; }.upload-dropzone, .upload-state { min-height: 355px; } }
@media (max-width: 430px) { .complete-layout { grid-template-columns: 1fr; }.complete-preview { height: 180px; }.complete-copy { padding: 5px 3px; }.upload-panel { padding: 15px; } }
</style>
