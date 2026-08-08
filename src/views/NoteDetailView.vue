<script setup>
import { computed, ref } from 'vue'

const selectedSectionId = ref(null)
const toastMessage = ref('')
let toastTimer

const sections = [
  {
    id: 'market',
    number: '01',
    kicker: 'MARKET CHECK',
    title: '시장 지표',
    description: '야간선물, EWY, 반도체, 국채, 원유의 기록값과 등락률',
    meta: '5개 지표',
    icon: '↗',
    tone: 'coral',
  },
  {
    id: 'polysilicon',
    number: '02',
    kicker: 'POLYSILICON',
    title: '폴리실리콘 주요 내용',
    description: '최저수입가격, 관세, 미국 내 생산 지원 관련 메모',
    meta: '5개 항목',
    icon: '✦',
    tone: 'amber',
  },
  {
    id: 'check',
    number: '03',
    kicker: 'TO CHECK',
    title: '추가 확인',
    description: '필기에서 별표로 따로 표시한 후속 확인 항목',
    meta: '1개 항목',
    icon: '✓',
    tone: 'blue',
  },
]

const marketIndicators = [
  { name: '야간선물', value: '995.40', change: '+1.45%', color: 'coral' },
  { name: 'EWY', value: '164.12', change: '+2.99%', color: 'blue' },
  { name: '반도체', value: '12,048.69', change: '+0.33%', color: 'coral' },
  { name: '10년 국채', value: '4.69', change: '+1.30%', color: 'coral' },
  { name: '원유', value: '78.11', change: '+3.84%', color: 'coral' },
]

const policyNotes = [
  '최저수입가격제 도입 검토 — 중국산 저가 제품 유입 차단 목적',
  '폴리실리콘 제품에 15% 종가 관세 부과',
  '미국 내 건설기업을 위한 지원 프로그램 개정 지시',
  '핵심 원료 보호와 미국 내 생산 역량 강화',
  '행정명령 발표 후 120일 뒤 발효',
]

const selectedSection = computed(() => sections.find((section) => section.id === selectedSectionId.value))

function openSection(id) {
  selectedSectionId.value = id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeSection() {
  selectedSectionId.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function showToast(message) {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2400)
}
</script>

<template>
  <div class="detail-shell">
    <header class="detail-topbar page-width">
      <a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a>
      <nav class="detail-nav" aria-label="노트 메뉴"><a class="active" href="/notes">내 노트</a><a href="/concepts">핵심 단어</a><a href="/metrics">수치 그래프</a><a href="/#how-it-works">사용 방법</a></nav>
      <a class="back-button" href="/notes"><span>←</span> 내 노트</a>
    </header>

    <main class="detail-main page-width">
      <template v-if="!selectedSection">
        <div class="detail-heading">
          <div><span class="eyebrow"><span class="eyebrow-dot"></span> ORGANIZED NOTE · 3 SECTIONS</span><h1>8/7 필기</h1><p>사진 속 내용을 세 가지 주제로 나누어 정리했어요.</p></div>
          <div class="detail-actions"><button type="button" @click="showToast('정리 내용을 클립보드에 복사했어요.')">내용 복사</button><button type="button" @click="showToast('편집 기능은 다음 단계에서 연결할게요.')">편집하기 <span>↗</span></button></div>
        </div>

        <section class="overview-card">
          <span class="section-label">한눈에 보기</span>
          <h2>시장 지표와 폴리실리콘 정책을<br />기록한 <em>8/7 메모</em></h2>
          <p>항목을 누르면 사진에서 읽어 정리한 세부 내용을 확인할 수 있어요.</p>
          <div class="summary-tags"><span>#시장지표</span><span>#폴리실리콘</span><span>#관세</span><span>#양자컴</span></div>
        </section>

        <section class="contents-section">
          <div class="contents-heading"><div><span class="section-label">CONTENTS</span><h2>정리된 목차</h2></div><span>3개의 내용</span></div>
          <div class="topic-list">
            <button v-for="section in sections" :key="section.id" class="topic-row" type="button" @click="openSection(section.id)">
              <span class="topic-number">{{ section.number }}</span>
              <span class="topic-icon" :class="section.tone">{{ section.icon }}</span>
              <span class="topic-copy"><small>{{ section.kicker }}</small><strong>{{ section.title }}</strong><p>{{ section.description }}</p></span>
              <span class="topic-meta">{{ section.meta }}</span>
              <span class="topic-arrow">→</span>
            </button>
          </div>
          <div class="contents-hint"><span>⌁</span><p><strong>각 항목을 눌러 확인해보세요.</strong><br />한 번에 한 가지 내용에 집중할 수 있도록 나누었어요.</p></div>
        </section>
      </template>

      <template v-else>
        <div class="section-page-heading">
          <button type="button" @click="closeSection"><span>←</span> 정리된 목차</button>
          <div><span class="section-label">{{ selectedSection.kicker }}</span><span class="section-position">{{ selectedSection.number }} / 03</span></div>
          <h1>{{ selectedSection.title }}</h1>
          <p>{{ selectedSection.description }}</p>
        </div>

        <transition name="section-fade" mode="out-in">
          <section :key="selectedSection.id" class="section-content-card">
            <template v-if="selectedSection.id === 'market'">
              <div class="content-card-heading"><div><span class="content-icon coral">↗</span><div><small>8/7 금요일</small><h2>기록된 시장 지표</h2></div></div><span>5개 항목</span></div>
              <div class="indicator-table">
                <div class="indicator-row table-header"><span>항목</span><span>기록값</span><span>등락</span></div>
                <div v-for="indicator in marketIndicators" :key="indicator.name" class="indicator-row"><span><i :class="indicator.color"></i>{{ indicator.name }}</span><strong>{{ indicator.value }}</strong><b :class="indicator.color">{{ indicator.change }}</b></div>
              </div>
              <div class="content-footnote"><span>!</span><p>손글씨에서 판독한 수치예요. 실제 투자 판단에 사용하기 전에 원문과 시장 데이터를 다시 확인해주세요.</p></div>
            </template>

            <template v-else-if="selectedSection.id === 'polysilicon'">
              <div class="content-card-heading"><div><span class="content-icon amber">✦</span><div><small>POLICY NOTE</small><h2>정책 관련 메모</h2></div></div><span>5개 항목</span></div>
              <ol class="policy-list"><li v-for="(note, index) in policyNotes" :key="note"><span>{{ String(index + 1).padStart(2, '0') }}</span><div><p>{{ note }}</p><small v-if="index === 0">원문의 일부 문구는 글씨가 겹쳐 있어 문맥에 맞춰 정리했어요.</small></div></li></ol>
              <div class="content-footnote"><span>!</span><p>정책명과 정확한 대상 품목은 원본에서 한 번 더 확인이 필요해요.</p></div>
            </template>

            <template v-else>
              <div class="content-card-heading"><div><span class="content-icon blue">✓</span><div><small>FOLLOW UP</small><h2>나중에 확인할 항목</h2></div></div><span>1개 항목</span></div>
              <div class="check-note"><span class="check-box">✓</span><div><span class="section-label">MEMO</span><h3>양자컴 테마 확인</h3><p>필기에서 별표로 따로 표시한 후속 확인 항목이에요.</p></div></div>
            </template>
          </section>
        </transition>

        <nav class="section-navigation" aria-label="내용 이동">
          <button v-if="selectedSection.id !== 'market'" type="button" @click="openSection(selectedSection.id === 'check' ? 'polysilicon' : 'market')">← 이전 내용</button><span v-else></span>
          <button v-if="selectedSection.id !== 'check'" type="button" @click="openSection(selectedSection.id === 'market' ? 'polysilicon' : 'check')">다음 내용 →</button><span v-else></span>
        </nav>
      </template>
    </main>

    <footer class="detail-footer page-width"><span>필기<span class="brand-dot">.</span></span><span>하나씩 나누어 보면, 복습이 더 쉬워져요.</span></footer>
    <transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></transition>
  </div>
</template>

<style scoped>
.detail-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }.detail-topbar { height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }.detail-nav { display: flex; gap: 31px; margin-left: 100px; color: #a09f96; font-size: 11px; font-weight: 600; }.detail-nav a { padding: 5px 0; }.detail-nav a.active { color: var(--ink); border-bottom: 1px solid var(--accent); }.back-button { display: flex; align-items: center; gap: 7px; border: 1px solid #deddd4; border-radius: 99px; padding: 9px 14px; color: #77766e; font-size: 10px; font-weight: 700; }.back-button span { color: var(--accent); font-size: 14px; }.detail-main { width: min(900px, calc(100% - 64px)); min-height: calc(100vh - 160px); padding: 66px 0 110px; }.detail-heading { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 39px; }.detail-heading h1 { margin: 17px 0 9px; font-size: 43px; font-weight: 800; letter-spacing: -.1em; }.detail-heading p { margin: 0; color: #929188; font-size: 12px; }.detail-actions { display: flex; gap: 8px; }.detail-actions button { border: 1px solid #deddd4; border-radius: 3px; background: transparent; color: #77766d; padding: 10px 13px; font-size: 10px; }.detail-actions button:last-child { border-color: var(--ink); background: var(--ink); color: white; }.detail-actions button span { margin-left: 6px; color: #efa183; }.section-label { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; font-weight: 500; letter-spacing: .12em; }.overview-card { position: relative; overflow: hidden; border-radius: 7px; background: #2c2d29; color: white; padding: 35px 40px; }.overview-card::after { position: absolute; right: -35px; bottom: -85px; width: 220px; height: 220px; border: 1px solid rgba(242,161,133,.22); border-radius: 50%; content: ''; }.overview-card h2 { position: relative; z-index: 1; margin: 14px 0 13px; font-size: 27px; line-height: 1.38; letter-spacing: -.08em; }.overview-card h2 em { color: #efa183; font-family: 'Gowun Batang', serif; font-style: normal; }.overview-card > p { position: relative; z-index: 1; margin: 0; color: #bbbcb5; font-size: 10px; }.summary-tags { position: relative; z-index: 1; display: flex; gap: 7px; margin-top: 23px; }.summary-tags span { border: 1px solid #53544e; border-radius: 99px; padding: 5px 8px; color: #c9c9c3; font-size: 8px; }.contents-section { margin-top: 28px; }.contents-heading { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 13px; padding: 0 4px; }.contents-heading h2 { margin: 6px 0 0; font-size: 19px; font-weight: 800; letter-spacing: -.07em; }.contents-heading > span { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }.topic-list { overflow: hidden; border: 1px solid #dfded4; border-radius: 7px; background: #fffefa; box-shadow: 0 12px 40px rgba(70,68,55,.04); }.topic-row { display: grid; grid-template-columns: 42px 47px 1fr auto 34px; align-items: center; width: 100%; min-height: 112px; border: 0; border-bottom: 1px solid #e8e7df; background: transparent; color: var(--ink); padding: 15px 23px; text-align: left; transition: background .2s, padding .2s; }.topic-row:last-child { border-bottom: 0; }.topic-row:hover { background: #fbf5ee; padding-left: 28px; }.topic-number { color: #bbb9af; font-family: 'DM Mono', monospace; font-size: 9px; }.topic-icon, .content-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; font-size: 15px; }.topic-icon.coral, .content-icon.coral { background: #f8e7df; color: var(--accent); }.topic-icon.amber, .content-icon.amber { background: #f5edd8; color: #c09a42; }.topic-icon.blue, .content-icon.blue { background: #e4edf1; color: #7397a9; }.topic-copy { display: flex; min-width: 0; flex-direction: column; }.topic-copy small { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: .12em; }.topic-copy strong { margin-top: 6px; font-size: 15px; font-weight: 800; letter-spacing: -.06em; }.topic-copy p { margin: 5px 0 0; overflow: hidden; color: #929188; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.topic-meta { margin-left: 20px; border: 1px solid #e1e0d7; border-radius: 99px; color: #99988f; padding: 6px 8px; font-family: 'DM Mono', monospace; font-size: 7px; }.topic-arrow { display: grid; place-items: center; width: 27px; height: 27px; margin-left: 8px; border-radius: 50%; color: var(--accent); font-size: 16px; transition: background .2s, transform .2s; }.topic-row:hover .topic-arrow { background: #f2ded4; transform: translateX(3px); }.contents-hint { display: flex; align-items: center; gap: 11px; margin-top: 13px; border: 1px solid #e8dfd6; border-radius: 4px; background: #fcf4ed; padding: 12px 15px; }.contents-hint > span { color: var(--accent); font-size: 18px; }.contents-hint p { margin: 0; color: #9a877d; font-size: 8px; line-height: 1.6; }.contents-hint strong { color: #6e625b; font-size: 9px; }.section-page-heading { padding: 4px 0 31px; }.section-page-heading > button { display: flex; align-items: center; gap: 7px; border: 0; background: transparent; color: #89887f; padding: 0; font-size: 10px; font-weight: 700; }.section-page-heading > button span { color: var(--accent); font-size: 14px; }.section-page-heading > div { display: flex; align-items: center; justify-content: space-between; margin-top: 35px; }.section-position { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }.section-page-heading h1 { margin: 14px 0 9px; font-size: 42px; font-weight: 800; letter-spacing: -.09em; }.section-page-heading p { margin: 0; color: #929188; font-size: 11px; }.section-content-card { border: 1px solid #dfded4; border-radius: 7px; background: #fffefa; padding: 32px 38px 36px; box-shadow: 0 12px 40px rgba(70,68,55,.045); }.content-card-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 29px; }.content-card-heading > div { display: flex; align-items: center; gap: 13px; }.content-card-heading small { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: .08em; }.content-card-heading h2 { margin: 5px 0 0; font-size: 18px; font-weight: 800; letter-spacing: -.07em; }.content-card-heading > span { color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }.indicator-table { border-top: 1px solid #e4e3d9; }.indicator-row { display: grid; grid-template-columns: 1.3fr 1fr .7fr; align-items: center; min-height: 53px; border-bottom: 1px solid #efeee7; color: #74736b; font-size: 11px; }.indicator-row > span:first-child { display: flex; align-items: center; gap: 8px; }.indicator-row i { width: 5px; height: 5px; border-radius: 50%; background: #aaa; }.indicator-row i.coral { background: var(--accent); }.indicator-row i.blue { background: #799db2; }.indicator-row strong { color: #4f4f48; font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; }.indicator-row b { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; }.indicator-row b.coral { color: var(--accent); }.indicator-row b.blue { color: #6d92a8; }.indicator-row.table-header { min-height: 34px; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: .08em; }.indicator-row.table-header span:first-child { display: block; }.policy-list { margin: 0; padding: 0; list-style: none; }.policy-list li { display: flex; gap: 17px; border-top: 1px solid #eeede5; padding: 17px 3px; }.policy-list li > span { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; }.policy-list p { margin: 0; color: #5e5d55; font-family: 'Gowun Batang', serif; font-size: 12px; font-weight: 700; line-height: 1.6; }.policy-list small { display: block; margin-top: 5px; color: #aaa89f; font-size: 8px; }.content-footnote { display: flex; gap: 10px; margin-top: 20px; border: 1px solid #e6d9cd; border-radius: 4px; background: #fdf2eb; padding: 12px 14px; }.content-footnote span { display: grid; flex: 0 0 19px; place-items: center; width: 19px; height: 19px; border: 1px solid #e4a88f; border-radius: 50%; color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; }.content-footnote p { margin: 1px 0 0; color: #927d72; font-size: 8px; line-height: 1.6; }.check-note { display: flex; align-items: center; gap: 18px; min-height: 170px; border: 1px dashed #dcd6c6; background: #fbf7e9; padding: 27px 31px; }.check-box { display: grid; flex: 0 0 44px; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: #e4edf1; color: #7397a9; font-size: 19px; }.check-note h3 { margin: 8px 0 6px; font-family: 'Gowun Batang', serif; font-size: 19px; }.check-note p { margin: 0; color: #979487; font-size: 9px; }.section-navigation { display: flex; justify-content: space-between; margin-top: 15px; }.section-navigation button { border: 0; background: transparent; color: #77766e; padding: 10px 2px; font-size: 10px; font-weight: 700; }.section-navigation button:hover { color: var(--accent); }.section-fade-enter-active, .section-fade-leave-active { transition: opacity .18s, transform .18s; }.section-fade-enter-from, .section-fade-leave-to { opacity: 0; transform: translateY(7px); }.detail-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 23px 0 29px; color: #aaa99f; font-size: 10px; }.detail-footer > span:first-child { color: var(--ink); font-size: 15px; font-weight: 800; letter-spacing: -.08em; }
@media (max-width: 720px) { .page-width, .detail-main { width: min(100% - 36px, 520px); }.detail-topbar { min-height: 72px; flex-wrap: wrap; gap: 13px; padding: 14px 0 10px; }.detail-nav { display: flex; order: 3; width: 100%; justify-content: space-between; gap: 8px; margin: 0; overflow-x: auto; font-size: 9px; }.detail-main { padding-top: 48px; }.detail-heading { align-items: flex-start; }.detail-heading h1 { font-size: 37px; }.detail-heading p { font-size: 10px; }.detail-actions button:first-child { display: none; }.overview-card { padding: 29px 27px; }.overview-card h2 { font-size: 23px; }.topic-row { grid-template-columns: 31px 42px 1fr 27px; min-height: 101px; padding: 13px 14px; }.topic-row:hover { padding-left: 17px; }.topic-meta { display: none; }.topic-copy p { max-width: 300px; }.section-content-card { padding: 27px 23px 30px; }.section-page-heading h1 { font-size: 35px; }.detail-footer { align-items: flex-start; gap: 20px; }.detail-footer > span:last-child { text-align: right; } }
@media (max-width: 430px) { .detail-heading { display: block; }.detail-actions { margin-top: 20px; }.summary-tags { flex-wrap: wrap; }.topic-row { grid-template-columns: 28px 37px 1fr 24px; }.topic-icon { width: 29px; height: 29px; }.topic-copy p { max-width: 190px; }.topic-arrow { width: 22px; margin-left: 2px; }.indicator-row { grid-template-columns: 1.15fr .85fr .7fr; }.policy-list p { font-size: 11px; }.check-note { padding: 23px 20px; } }
</style>
