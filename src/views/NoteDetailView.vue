<script setup>
import { ref } from 'vue'

const toastMessage = ref('')
let toastTimer

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
      <a class="brand" href="/" aria-label="필기 홈"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>필기<span class="brand-dot">.</span></span></a>
      <nav class="detail-nav"><a class="active" href="/notes">내 노트</a><a href="/#how-it-works">사용 방법</a></nav>
      <a class="back-button" href="/notes"><span>←</span> 목록으로</a>
    </header>

    <main class="detail-main page-width">
      <div class="detail-heading">
        <div><span class="eyebrow"><span class="eyebrow-dot"></span> HANDWRITTEN NOTE · 01 PAGE</span><h1>8/7 필기</h1><p>사진 속 필기를 읽고, 내용별로 나누어 정리했어요.</p></div>
        <div class="detail-actions"><button type="button" @click="showToast('정리 내용을 클립보드에 복사했어요.')">내용 복사</button><button type="button" @click="showToast('수정 모드는 다음 단계에서 연결할게요.')">편집하기 <span>↗</span></button></div>
      </div>

      <div class="detail-grid">
        <aside class="source-column">
          <div class="source-card">
            <div class="source-card-header"><div><span class="state-kicker">ORIGINAL</span><strong>원본 필기</strong></div><span>8/7</span></div>
            <a class="source-image" href="/handwritten-note-sample-rotated.jpeg" target="_blank" aria-label="원본 사진 크게 보기"><img src="/handwritten-note-sample-rotated.jpeg" alt="8월 7일 손글씨 필기 원본" /><span>↗ 크게 보기</span></a>
            <div class="source-meta"><span>JPEG · 1장</span><span>손글씨 자동 판독</span></div>
          </div>
          <div class="accuracy-note"><span>!</span><p><strong>원본과 함께 확인해주세요.</strong><br />손글씨 판독 결과라 수치와 고유명사에 오차가 있을 수 있어요.</p></div>
        </aside>

        <section class="organized-column">
          <article class="summary-card">
            <span class="section-label">한눈에 보기</span>
            <h2>시장 지표와 폴리실리콘 정책을<br />기록한 <em>8/7 메모</em></h2>
            <p>주요 시장 지표의 수치와 등락률을 적고, 폴리실리콘 관련 관세 및 미국 내 생산 지원 내용을 별도로 정리한 필기예요.</p>
            <div class="summary-tags"><span>#시장지표</span><span>#폴리실리콘</span><span>#관세</span><span>#양자컴</span></div>
          </article>

          <article class="organized-card indicators-card">
            <div class="card-heading"><div><span class="card-number">01</span><div><span class="section-label">MARKET CHECK</span><h2>시장 지표</h2></div></div><span class="hand-note">8/7 금요일</span></div>
            <div class="indicator-table">
              <div class="indicator-row table-header"><span>항목</span><span>기록값</span><span>등락</span></div>
              <div v-for="indicator in marketIndicators" :key="indicator.name" class="indicator-row"><span><i :class="indicator.color"></i>{{ indicator.name }}</span><strong>{{ indicator.value }}</strong><b :class="indicator.color">{{ indicator.change }}</b></div>
            </div>
          </article>

          <article class="organized-card policy-card">
            <div class="card-heading"><div><span class="card-number">02</span><div><span class="section-label">POLYSILICON</span><h2>폴리실리콘 주요 내용</h2></div></div><span class="policy-mark">✦</span></div>
            <ol class="policy-list"><li v-for="(note, index) in policyNotes" :key="note"><span>{{ String(index + 1).padStart(2, '0') }}</span><p>{{ note }}</p></li></ol>
            <div class="source-warning"><span>판독 메모</span><p>첫 번째 문장의 일부 표현은 글씨가 겹쳐 있어 문맥에 맞춰 정리했어요. 정책명과 정확한 대상 품목은 원본 확인이 필요해요.</p></div>
          </article>

          <article class="organized-card memo-card">
            <div class="card-heading"><div><span class="card-number">03</span><div><span class="section-label">TO CHECK</span><h2>추가 확인</h2></div></div></div>
            <div class="memo-paper"><span>✓</span><div><strong>양자컴 테마 확인</strong><p>별표로 따로 표시해둔 후속 확인 항목이에요.</p></div></div>
          </article>

          <div class="related-strip"><div><span class="section-label">CONNECTED NOTES</span><strong>이 내용과 이어지는 노트</strong></div><button type="button" @click="showToast('관련 노트가 쌓이면 자동으로 연결해드릴게요.')"><span class="related-node">폴리실리콘</span><i></i><span class="related-node muted">아직 없음</span><b>→</b></button></div>
        </section>
      </div>
    </main>

    <footer class="detail-footer page-width"><span>필기<span class="brand-dot">.</span></span><span>원본은 그대로, 다시 볼 때는 더 선명하게.</span></footer>
    <transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></transition>
  </div>
</template>

<style scoped>
.detail-shell { min-height: 100vh; background: #f7f6f0; color: var(--ink); }.detail-topbar { height: 88px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }.detail-nav { display: flex; gap: 31px; margin-left: 100px; color: #a09f96; font-size: 11px; font-weight: 600; }.detail-nav a { padding: 5px 0; }.detail-nav a.active { color: var(--ink); border-bottom: 1px solid var(--accent); }.back-button { display: flex; align-items: center; gap: 7px; border: 1px solid #deddd4; border-radius: 99px; padding: 9px 14px; color: #77766e; font-size: 10px; font-weight: 700; }.back-button span { color: var(--accent); font-size: 14px; }.detail-main { padding: 66px 0 110px; }.detail-heading { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 42px; }.detail-heading h1 { margin: 17px 0 9px; font-size: 43px; font-weight: 800; letter-spacing: -.1em; }.detail-heading p { margin: 0; color: #929188; font-size: 12px; }.detail-actions { display: flex; gap: 8px; }.detail-actions button { border: 1px solid #deddd4; border-radius: 3px; background: transparent; color: #77766d; padding: 10px 13px; font-size: 10px; }.detail-actions button:last-child { border-color: var(--ink); background: var(--ink); color: white; }.detail-actions button span { margin-left: 6px; color: #efa183; }.detail-grid { display: grid; grid-template-columns: 400px 1fr; gap: 54px; align-items: start; }.source-column { position: sticky; top: 24px; }.source-card { border: 1px solid #dfded4; border-radius: 6px; background: #fffefa; padding: 17px; box-shadow: 0 12px 40px rgba(70,68,55,.05); }.source-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }.source-card-header > div { display: flex; flex-direction: column; gap: 4px; }.source-card-header .state-kicker { color: #aaa99f; font-size: 8px; }.source-card-header strong { font-size: 13px; font-weight: 800; }.source-card-header > span { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 9px; }.source-image { position: relative; display: block; height: 490px; overflow: hidden; border: 1px solid #ded9ca; border-radius: 3px; background: #ded9c9; }.source-image img { display: block; width: 100%; height: 100%; object-fit: cover; }.source-image > span { position: absolute; right: 10px; bottom: 10px; border-radius: 3px; background: rgba(40,40,36,.72); color: white; padding: 7px 9px; font-size: 8px; }.source-meta { display: flex; justify-content: space-between; padding-top: 12px; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 8px; }.accuracy-note { display: flex; gap: 10px; margin-top: 13px; border: 1px solid #e6d9cd; border-radius: 4px; background: #fdf2eb; padding: 13px 14px; }.accuracy-note > span { display: grid; flex: 0 0 20px; place-items: center; width: 20px; height: 20px; border: 1px solid #e4a88f; border-radius: 50%; color: var(--accent); font-family: 'DM Mono', monospace; font-size: 9px; }.accuracy-note p { margin: 0; color: #8d786d; font-size: 9px; line-height: 1.65; }.accuracy-note strong { color: #685b54; font-size: 10px; }.organized-column { display: flex; flex-direction: column; gap: 13px; }.summary-card, .organized-card { border: 1px solid #dfded4; border-radius: 6px; background: #fffefa; padding: 27px 30px; }.section-label { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; font-weight: 500; letter-spacing: .12em; }.summary-card { position: relative; overflow: hidden; background: #2c2d29; color: white; padding: 31px 34px; }.summary-card::after { position: absolute; right: -40px; bottom: -65px; width: 180px; height: 180px; border: 1px solid rgba(242,161,133,.22); border-radius: 50%; content: ''; }.summary-card h2 { position: relative; z-index: 1; margin: 13px 0 14px; font-size: 25px; line-height: 1.38; letter-spacing: -.08em; }.summary-card h2 em { color: #efa183; font-family: 'Gowun Batang', serif; font-style: normal; }.summary-card > p { position: relative; z-index: 1; max-width: 490px; margin: 0; color: #bbbcb5; font-size: 10px; line-height: 1.8; }.summary-tags { position: relative; z-index: 1; display: flex; gap: 7px; margin-top: 20px; }.summary-tags span { border: 1px solid #53544e; border-radius: 99px; padding: 5px 8px; color: #c9c9c3; font-size: 8px; }.card-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 23px; }.card-heading > div { display: flex; gap: 14px; }.card-number { padding-top: 2px; color: #c2c1b7; font-family: 'DM Mono', monospace; font-size: 9px; }.card-heading h2 { margin: 6px 0 0; font-size: 17px; font-weight: 800; letter-spacing: -.07em; }.hand-note { color: #a19b89; font-family: 'Gowun Batang', serif; font-size: 11px; transform: rotate(-3deg); }.indicator-table { border-top: 1px solid #e4e3d9; }.indicator-row { display: grid; grid-template-columns: 1.3fr 1fr .7fr; align-items: center; min-height: 42px; border-bottom: 1px solid #efeee7; color: #74736b; font-size: 10px; }.indicator-row > span:first-child { display: flex; align-items: center; gap: 7px; }.indicator-row i { width: 5px; height: 5px; border-radius: 50%; background: #aaa; }.indicator-row i.coral { background: var(--accent); }.indicator-row i.blue { background: #799db2; }.indicator-row strong { color: #4f4f48; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; }.indicator-row b { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; }.indicator-row b.coral { color: var(--accent); }.indicator-row b.blue { color: #6d92a8; }.indicator-row.table-header { min-height: 31px; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: .08em; }.indicator-row.table-header span:first-child { display: block; }.policy-mark { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--soft-accent); color: var(--accent); }.policy-list { margin: 0; padding: 0; list-style: none; }.policy-list li { display: flex; gap: 13px; border-top: 1px solid #eeede5; padding: 13px 0; }.policy-list li > span { color: var(--accent); font-family: 'DM Mono', monospace; font-size: 8px; }.policy-list p { margin: 0; color: #68675f; font-family: 'Gowun Batang', serif; font-size: 11px; font-weight: 700; line-height: 1.55; }.source-warning { display: flex; gap: 14px; margin-top: 7px; padding: 11px 13px; background: #f6f4eb; }.source-warning span { flex: 0 0 auto; color: #9a9586; font-family: 'DM Mono', monospace; font-size: 7px; }.source-warning p { margin: 0; color: #9b998f; font-size: 8px; line-height: 1.6; }.memo-card { padding-bottom: 30px; }.memo-paper { display: flex; align-items: center; gap: 13px; border: 1px dashed #ddd8c9; background: #fbf7e9; padding: 15px 17px; transform: rotate(-.3deg); }.memo-paper > span { color: var(--accent); font-size: 17px; }.memo-paper strong { color: #5c5a50; font-family: 'Gowun Batang', serif; font-size: 12px; }.memo-paper p { margin: 3px 0 0; color: #a09c8e; font-size: 8px; }.related-strip { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #deddd4; margin-top: 20px; padding: 22px 4px 0; }.related-strip > div { display: flex; flex-direction: column; gap: 6px; }.related-strip strong { font-size: 12px; }.related-strip button { display: flex; align-items: center; border: 0; background: transparent; padding: 0; }.related-node { border: 1px solid #dfded4; border-radius: 99px; background: #fffefa; color: #6e6d65; padding: 7px 10px; font-size: 8px; }.related-node.muted { color: #aaa99f; }.related-strip button i { width: 20px; height: 1px; background: #d0cfc6; }.related-strip button b { margin-left: 8px; color: var(--accent); font-size: 14px; }.detail-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 23px 0 29px; color: #aaa99f; font-size: 10px; }.detail-footer > span:first-child { color: var(--ink); font-size: 15px; font-weight: 800; letter-spacing: -.08em; }
@media (max-width: 900px) { .detail-grid { grid-template-columns: 320px 1fr; gap: 30px; }.source-image { height: 420px; }.detail-nav { margin-left: auto; margin-right: 25px; } }
@media (max-width: 720px) { .page-width { width: min(100% - 36px, 520px); }.detail-topbar { height: 72px; }.detail-nav { display: none; }.detail-main { padding-top: 48px; }.detail-heading { align-items: flex-start; }.detail-heading h1 { font-size: 37px; }.detail-heading p { font-size: 10px; }.detail-actions button:first-child { display: none; }.detail-grid { grid-template-columns: 1fr; }.source-column { position: static; }.source-card { display: grid; grid-template-columns: 130px 1fr; gap: 14px; }.source-card-header { align-content: flex-start; grid-column: 2; grid-row: 1; justify-content: flex-start; gap: 12px; }.source-image { grid-column: 1; grid-row: 1 / span 2; height: 175px; }.source-meta { grid-column: 2; flex-direction: column; justify-content: flex-end; gap: 5px; }.summary-card, .organized-card { padding: 24px 22px; }.summary-card h2 { font-size: 22px; }.detail-footer { align-items: flex-start; gap: 20px; }.detail-footer > span:last-child { text-align: right; } }
@media (max-width: 430px) { .detail-heading { display: block; }.detail-actions { margin-top: 20px; }.source-card { grid-template-columns: 108px 1fr; }.source-image { height: 150px; }.summary-tags { flex-wrap: wrap; }.indicator-row { grid-template-columns: 1.15fr .85fr .7fr; }.policy-list p { font-size: 10px; }.related-strip { align-items: flex-start; flex-direction: column; gap: 18px; } }
</style>
