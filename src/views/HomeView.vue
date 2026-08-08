<template>
  <div class="app-shell home-only">
    <header class="topbar minimal-topbar page-width">
      <a class="brand" href="/" aria-label="필기 홈">
        <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 19.2 6.3 14 16.7 3.6a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L10 17.7 5 19.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m14.9 5.4 3.7 3.7M5 19.2l3.6-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
        <span>필기<span class="brand-dot">.</span></span>
      </a>
    </header>

    <main>
      <section class="start-section page-width">
        <div class="start-heading">
          <span class="eyebrow"><span class="eyebrow-dot"></span> START YOUR NOTE</span>
          <h1>어떤 방식으로<br /><em>시작할까요?</em></h1>
          <p>새로운 필기를 정리하거나, 지금까지 쌓인 노트를 다시 볼 수 있어요.</p>
        </div>

        <div class="start-choices">
          <a class="start-choice photo-choice" href="/upload">
            <span class="choice-number">01</span>
            <div class="choice-visual photo-visual" aria-hidden="true"><span class="choice-paper back"></span><span class="choice-paper middle"></span><span class="choice-paper front"><svg viewBox="0 0 32 32" fill="none"><path d="M16 22V8m0 0-5 5m5-5 5 5M7 23.5v1A2.5 2.5 0 0 0 9.5 27h13a2.5 2.5 0 0 0 2.5-2.5v-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
            <div class="choice-copy"><span>NEW NOTE</span><h2>사진 추가</h2><p>손글씨 사진을 올리고<br />보기 좋은 노트로 정리해요.</p></div>
            <span class="choice-button">사진 선택하기 <b>→</b></span>
          </a>

          <a class="start-choice notes-choice" href="/notes">
            <span class="choice-number">02</span>
            <div class="choice-visual notes-visual" aria-hidden="true"><div class="mini-library"><span><i></i><b>8/7 필기</b><small>3 sections</small></span><span><i></i><b>8/6 필기</b><small>7 topics</small></span><span><i></i><b>8/5 필기</b><small>7 topics</small></span></div></div>
            <div class="choice-copy"><span>MY LIBRARY</span><h2>내 필기로 들어가기</h2><p>정리된 필기를 찾고<br />연결된 내용을 함께 확인해요.</p></div>
            <span class="choice-button">필기 목록 보기 <b>→</b></span>
          </a>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-only { min-height: 100vh; }.minimal-topbar { justify-content: flex-start; }.home-only .start-section { display: flex; min-height: calc(100vh - 88px); flex-direction: column; justify-content: center; padding-top: 32px; padding-bottom: 66px; }
@media (max-width: 720px) { .home-only .start-section { min-height: auto; padding-top: 46px; padding-bottom: 70px; } }
</style>
