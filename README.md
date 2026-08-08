# 필기.

휴대폰으로 손글씨 노트를 촬영하면 AI가 날짜, 핵심 주제, 세부 내용과 연결 개념을 자동으로 정리해 복습하기 쉽게 저장하는 Vue 웹앱입니다.

현재 진행 상태와 다음 작업은 [`HANDOFF.md`](./HANDOFF.md)에 기록합니다.

## 현재 동작하는 흐름

1. 시작 화면에서 **사진 추가**를 누릅니다.
2. 휴대폰 카메라로 촬영하거나 앨범에서 사진을 고릅니다.
3. 브라우저가 사진을 읽기 좋은 크기로 압축합니다.
4. 서버의 OpenAI API가 손글씨를 읽고 정해진 JSON 형식으로 정리합니다.
5. 정리된 노트와 압축 사진을 현재 브라우저의 IndexedDB에 저장합니다.
6. **내 노트**에서 날짜·검색어·핵심 개념으로 찾고 상세 내용을 복습합니다.
7. **핵심 단어**에서 메모장별 반복 빈도와 각 노트의 핵심 단어를 비교합니다.
8. **수치 그래프**에서 여러 메모장에 반복된 지표를 날짜순 그래프로 확인합니다.

AI가 확실히 판독하지 못한 문구는 상세 화면의 `원본과 다시 확인해주세요` 영역에 분리해 표시합니다.

## 로컬 실행

Node.js 22.18 이상이 필요합니다.

```sh
npm install
cp .env.example .env.local
```

`.env.local`에 본인의 서버용 OpenAI API 키를 설정합니다. 키를 브라우저 코드나 GitHub에 넣지 마세요.

```sh
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.6-terra
```

실행합니다.

```sh
npm run dev
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다.

## 확인

```sh
npm test
npm run build
```

## Vercel 배포

GitHub 저장소를 Vercel 프로젝트에 연결한 뒤 프로젝트 환경변수에 다음을 설정합니다.

- `OPENAI_API_KEY`: 필수, 서버에서만 사용하는 키
- `OPENAI_MODEL`: 선택, 기본값 `gpt-5.6-terra`

`api/analyze-note.js`가 서버리스 분석 API로 동작하고 `vercel.json`이 Vue 라우트를 처리합니다.

## 저장과 개인정보 범위

- 사진은 AI 분석을 위해 서버와 OpenAI API로 전송됩니다.
- API 요청에는 `store: false`를 사용합니다. OpenAI의 API 데이터 처리 정책은 별도로 적용됩니다.
- 정리 결과와 압축 사진은 현재 기기의 현재 브라우저 IndexedDB에 저장됩니다.
- 현재 버전에는 계정·클라우드 동기화·백업이 없으므로 다른 휴대폰이나 브라우저에서는 같은 노트를 볼 수 없습니다.
- 브라우저 데이터를 삭제하면 직접 올린 노트도 사라질 수 있습니다.

## 주요 구조

- `src/views/UploadView.vue`: 촬영·앨범 선택·분석·저장 흐름
- `src/views/ConceptsView.vue`: 메모장별 핵심 단어 빈도 비교
- `src/views/MetricsView.vue`: 반복 수치 지표 그래프
- `src/services/noteInsights.js`: 핵심 단어 집계와 반복 수치 추출
- `src/services/imageProcessing.js`: 브라우저 이미지 압축
- `src/services/noteStorage.js`: IndexedDB 저장
- `src/services/noteRepository.js`: 예시 노트와 사용자 노트 통합
- `server/analyzeNote.js`: OpenAI 이미지 분석 및 구조화 출력
- `api/analyze-note.js`: Vercel 서버리스 엔드포인트
