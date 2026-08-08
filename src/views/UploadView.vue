<script setup>
import { computed, ref } from 'vue'
import { prepareImageForAnalysis } from '@/services/imageProcessing'
import { saveAnalyzedNote } from '@/services/noteRepository'

const fileInput = ref(null)
const cameraInput = ref(null)
const isDragging = ref(false)
const phase = ref('idle')
const processingMessage = ref('사진을 준비하고 있어요')
const selectedFile = ref(null)
const previewUrl = ref('')
const savedNote = ref(null)
const errorMessage = ref('')

const isProcessing = computed(() => phase.value === 'processing')
const isComplete = computed(() => phase.value === 'complete')
const hasError = computed(() => phase.value === 'error')

function openFilePicker() {
  fileInput.value?.click()
}

function openCamera() {
  cameraInput.value?.click()
}

function handleFileChange(event) {
  const [file] = event.target.files
  if (file) analyzeAndSave(file)
  event.target.value = ''
}

function handleDrop(event) {
  isDragging.value = false
  const [file] = event.dataTransfer.files
  if (file) analyzeAndSave(file)
}

async function requestAnalysis(image) {
  const response = await fetch('/api/analyze-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl: image.dataUrl, captureDate: image.captureDate }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || '사진 분석에 실패했어요.')
    error.code = payload.code
    throw error
  }
  return payload.note
}

async function analyzeAndSave(file) {
  if (!file.type.startsWith('image/')) {
    showError('이미지 파일만 올릴 수 있어요.')
    return
  }
  if (file.size > 25 * 1024 * 1024) {
    showError('사진이 너무 커요. 25MB 이하 사진을 사용해주세요.')
    return
  }

  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  savedNote.value = null
  errorMessage.value = ''
  phase.value = 'processing'

  try {
    processingMessage.value = '사진을 읽기 좋게 준비하고 있어요'
    const image = await prepareImageForAnalysis(file)
    previewUrl.value = image.dataUrl

    processingMessage.value = '손글씨와 핵심 내용을 분석하고 있어요'
    const analysis = await requestAnalysis(image)

    processingMessage.value = '정리한 내용을 내 노트에 저장하고 있어요'
    savedNote.value = await saveAnalyzedNote(analysis, image, file.name)
    phase.value = 'complete'
  } catch (error) {
    if (error.code === 'MISSING_API_KEY') {
      showError('AI 분석 기능의 서버 설정이 아직 완료되지 않았어요. 관리자에게 API 키 설정을 요청해주세요.')
      return
    }
    showError(error.message || '사진을 처리하지 못했어요. 잠시 후 다시 시도해주세요.')
  }
}

function showError(message) {
  errorMessage.value = message
  phase.value = 'error'
}

function resetUpload() {
  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = null
  previewUrl.value = ''
  savedNote.value = null
  errorMessage.value = ''
  phase.value = 'idle'
}
</script>

<template>
  <div class="upload-shell">
    <header class="upload-topbar page-width"><a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a><a class="back-home" href="/"><span>←</span> 시작으로</a></header>

    <main class="upload-main page-width">
      <div class="upload-heading"><span class="eyebrow"><span class="eyebrow-dot"></span> NEW HANDWRITTEN NOTE</span><h1>필기 사진을<br /><em>추가해주세요.</em></h1><p>사진을 읽고 날짜·핵심 내용·연결되는 개념을 찾아 실제 내 노트에 저장해요.</p><div class="privacy-copy"><span>⌑</span><p>사진은 AI 분석을 위해 서버로 전송되며, 정리된 노트와 압축 사진은 이 기기의 브라우저에 저장돼요.</p></div></div>

      <section class="upload-panel" :class="{ dragging: isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
        <input ref="fileInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" @change="handleFileChange" />
        <input ref="cameraInput" class="sr-only" type="file" accept="image/*" capture="environment" @change="handleFileChange" />

        <template v-if="isProcessing"><div class="upload-state"><div class="upload-loader"></div><span>AI ORGANIZING</span><h2>{{ processingMessage }}</h2><p>사진 크기와 글씨 양에 따라 잠시 걸릴 수 있어요.</p><div class="processing-steps"><span class="done">사진 준비</span><i></i><span>내용 분석</span><i></i><span>노트 저장</span></div></div></template>

        <template v-else-if="isComplete"><div class="complete-layout"><div class="complete-preview"><img :src="previewUrl" :alt="selectedFile?.name" /></div><div class="complete-copy"><span class="complete-check">✓</span><small>SAVED TO MY NOTES</small><h2>{{ savedNote?.title }}</h2><p>{{ savedNote?.excerpt }}</p><div class="complete-topics"><span v-for="topic in savedNote?.topics?.slice(0, 5)" :key="topic">#{{ topic }}</span></div><div class="complete-actions"><button type="button" @click="resetUpload">다른 사진 추가</button><a :href="savedNote?.route">정리된 노트 보기 <span>→</span></a></div></div></div></template>

        <template v-else-if="hasError"><div class="error-state"><span class="error-icon">!</span><small>UPLOAD FAILED</small><h2>사진을 정리하지 못했어요.</h2><p>{{ errorMessage }}</p><button type="button" @click="resetUpload">다시 시도하기</button></div></template>

        <template v-else><div class="upload-dropzone"><div class="upload-icon"><svg viewBox="0 0 32 32" fill="none"><path d="M16 22V8m0 0-5 5m5-5 5 5M7 23.5v1A2.5 2.5 0 0 0 9.5 27h13a2.5 2.5 0 0 0 2.5-2.5v-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><strong>필기 사진을 추가해주세요</strong><span>휴대폰에서는 바로 촬영하거나 앨범에서 고를 수 있어요.</span><div class="upload-options"><button class="camera-button" type="button" @click="openCamera"><span>⌁</span> 카메라로 촬영</button><button type="button" @click="openFilePicker">앨범에서 선택 <span>→</span></button></div><small>JPG · PNG · WEBP · 최대 25MB</small></div></template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.upload-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }.upload-topbar { height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }.back-home { display: flex; align-items: center; gap: 7px; border: 1px solid #deddd4; border-radius: 99px; padding: 9px 14px; color: #77766e; font-size: 10px; font-weight: 700; }.back-home span { color: var(--accent); }.upload-main { display: grid; grid-template-columns: 330px 1fr; gap: 75px; align-items: center; min-height: calc(100vh - 88px); padding-top: 55px; padding-bottom: 70px; }.upload-heading h1 { margin: 20px 0 17px; font-size: 45px; font-weight: 800; line-height: 1.18; letter-spacing: -.09em; }.upload-heading h1 em { color: var(--accent); font-family: 'Gowun Batang', serif; font-style: normal; }.upload-heading > p { margin: 0; color: #8e8d84; font-size: 11px; line-height: 1.8; }.privacy-copy { display: flex; gap: 9px; margin-top: 27px; border-top: 1px solid #deddd4; padding-top: 17px; color: #aaa99f; }.privacy-copy > span { color: var(--accent); }.privacy-copy p { margin: 0; font-size: 8px; line-height: 1.65; }.upload-panel { min-height: 470px; border: 1px solid #deddd4; border-radius: 8px; background: #fffefa; padding: 22px; box-shadow: 0 17px 48px rgba(70,68,55,.06); }.upload-panel.dragging { border-color: var(--accent); background: #fff8f2; }.upload-dropzone { display: flex; min-height: 425px; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #d6d4c9; border-radius: 5px; background: #faf9f3; color: var(--ink); }.upload-icon { display: grid; place-items: center; width: 64px; height: 74px; border: 1px solid #d9d5c8; background: #fffdf6; box-shadow: 6px 7px 0 #eeebe0; transform: rotate(-3deg); }.upload-icon svg { width: 32px; color: var(--accent); }.upload-dropzone strong { margin-top: 27px; font-size: 15px; }.upload-dropzone > span { margin-top: 8px; color: #a09f96; font-size: 9px; }.upload-options { display: flex; gap: 8px; margin-top: 23px; }.upload-options button { border: 1px solid #deddd4; border-radius: 4px; background: #fffefa; color: #77766e; padding: 10px 13px; font-size: 9px; font-weight: 700; }.upload-options button.camera-button { border-color: var(--ink); background: var(--ink); color: white; }.upload-options button span { margin-right: 5px; color: var(--accent); }.upload-dropzone small { margin-top: 21px; color: #bbb9af; font-family: 'DM Mono', monospace; font-size: 7px; }.upload-state, .error-state { display: flex; min-height: 425px; flex-direction: column; align-items: center; justify-content: center; text-align: center; }.upload-loader { width: 44px; height: 44px; border: 2px solid #f1d7ca; border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }.upload-state > span, .error-state > small { margin-top: 24px; color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .12em; }.upload-state h2, .error-state h2 { margin: 9px 0 7px; font-size: 18px; }.upload-state > p, .error-state > p { max-width: 380px; margin: 0; color: #aaa99f; font-size: 9px; line-height: 1.7; }.processing-steps { display: flex; align-items: center; gap: 7px; margin-top: 27px; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 7px; }.processing-steps span.done { color: var(--accent); }.processing-steps i { width: 17px; height: 1px; background: #deddd4; }.error-icon { display: grid; place-items: center; width: 43px; height: 43px; border: 1px solid #dfaa92; border-radius: 50%; color: var(--accent); font-family: 'DM Mono', monospace; }.error-state button { margin-top: 23px; border: 0; border-radius: 4px; background: var(--ink); color: white; padding: 10px 14px; font-size: 9px; }.complete-layout { display: grid; grid-template-columns: 45% 1fr; gap: 27px; min-height: 425px; }.complete-preview { overflow: hidden; border-radius: 4px; background: #e5e1d5; }.complete-preview img { width: 100%; height: 100%; object-fit: cover; }.complete-copy { display: flex; min-width: 0; flex-direction: column; justify-content: center; }.complete-check { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #f6e4db; color: var(--accent); }.complete-copy small { margin-top: 18px; color: var(--accent); font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: .12em; }.complete-copy h2 { margin: 8px 0; font-size: 20px; }.complete-copy > p { display: -webkit-box; overflow: hidden; margin: 0; color: #99988f; font-size: 8px; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }.complete-topics { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 19px; }.complete-topics span { border: 1px solid #e1dfd6; border-radius: 99px; padding: 5px 7px; color: #8e8d84; font-size: 7px; }.complete-actions { display: flex; gap: 7px; margin-top: 27px; }.complete-actions button, .complete-actions a { border: 1px solid #deddd4; border-radius: 3px; background: transparent; color: #77766e; padding: 9px 11px; font-size: 9px; }.complete-actions a { border-color: var(--ink); background: var(--ink); color: white; }.complete-actions a span { margin-left: 7px; color: var(--accent); }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 720px) { .page-width { width: min(100% - 36px, 520px); }.upload-topbar { height: 72px; }.upload-main { display: block; min-height: auto; padding-top: 47px; }.upload-heading { text-align: center; }.upload-heading .eyebrow { justify-content: center; }.upload-heading h1 { font-size: 39px; }.upload-heading > p { margin: 0 auto; max-width: 330px; }.privacy-copy { max-width: 350px; margin: 22px auto 34px; text-align: left; }.upload-panel { min-height: 400px; }.upload-dropzone, .upload-state, .error-state { min-height: 355px; } }
@media (max-width: 430px) { .upload-options { flex-direction: column; width: 200px; }.complete-layout { grid-template-columns: 1fr; }.complete-preview { height: 180px; }.complete-copy { padding: 5px 3px; }.upload-panel { padding: 15px; }.complete-actions { flex-direction: column; }.complete-actions a, .complete-actions button { text-align: center; } }
</style>
