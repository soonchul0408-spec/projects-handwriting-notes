# 작업 인수인계

마지막 확인: 2026-08-08 (Asia/Seoul)

## 프로젝트 위치

- 로컬: `/Users/qortnscjf/projects/handwriting-notes`
- GitHub: `https://github.com/soonchul0408-spec/projects-handwriting-notes`
- 배포 사이트: `https://handwriting-notes-nu.vercel.app`
- 기본 브랜치: `main`

## 제품 목적

어머니가 휴대폰으로 종이 필기 사진을 올리면 AI가 내용을 읽어 날짜, 핵심 주제, 세부 내용과 연결 개념으로 정리하고 복습할 수 있게 만드는 Vue 웹앱이다.

## 현재 상태

- 시작 화면은 `사진 추가`와 `필기` 두 선택지만 보여준다.
- 사진 선택, 브라우저 이미지 압축, 서버 분석 요청, 노트 저장 흐름이 구현되어 있다.
- 정리된 노트는 현재 휴대폰/브라우저의 IndexedDB에 저장된다.
- 날짜와 핵심 개념을 오가며 노트를 찾고, 관련 노트의 연결 관계를 볼 수 있다.
- `핵심 단어` 메뉴에서 메모장별 반복 단어와 노트별 핵심 단어를 비교할 수 있다.
- `수치 그래프` 메뉴에서 두 개 이상의 메모장에 반복된 수치 지표를 날짜순 선그래프로 볼 수 있다.
- Vercel 배포와 GitHub 연결이 완료되어 있다.
- 코드와 배포 구조는 준비됐지만 OpenAI 결제 및 `OPENAI_API_KEY` 설정 전에는 새 사진의 실제 AI 자동 정리가 동작하지 않는다.

## 사용자가 보류한 결정

먼저 현재 화면을 어머니께 보여드리고 도움이 될지 확인한 다음 OpenAI API 결제와 설정 여부를 결정한다. 사용자가 결정하기 전에는 결제나 API 키 입력을 진행하지 않는다.

결정 후 진행 순서:

1. OpenAI API 결제 수단 또는 크레딧 설정
2. 서버용 API 키 생성
3. Vercel 프로젝트 환경변수 `OPENAI_API_KEY` 등록
4. 필요하면 `OPENAI_MODEL` 등록(현재 기본값 `gpt-5.6-terra`)
5. 재배포 후 실제 휴대폰 사진으로 업로드 테스트
6. Vercel 로그와 OpenAI Usage에서 성공 여부와 실제 비용 확인

## 비용 메모

현재 코드 설정(`gpt-5.6-terra`, 이미지 최대 1800px, 최대 출력 4000 토큰)의 추정치는 사진 1,000장에 보통 미화 20~40달러, 매우 긴 출력 기준 약 55~60달러다. 실제 비용은 사진 크기, 판독 결과 길이, 재시도 횟수에 따라 달라진다.

## 데이터와 개인정보 주의사항

- 업로드 사진은 분석을 위해 앱 서버와 OpenAI API로 전송된다.
- 정리 결과와 압축 사진은 현재 기기의 해당 브라우저에만 저장된다.
- 브라우저를 닫는 것만으로는 사라지지 않지만, 브라우저 데이터 삭제·기기 변경·다른 브라우저 사용 시 이어지지 않는다.
- 현재 계정, 클라우드 동기화, 백업 기능은 없다.
- 저장소에 포함된 예시 필기 이미지들은 공개 GitHub 저장소와 배포 사이트에서 접근 가능하다.

## 다음 작업을 시작할 때

```sh
cd /Users/qortnscjf/projects/handwriting-notes
git status --short --branch
git pull --ff-only
npm test
npm run build
```

모든 코드 수정은 테스트 후 커밋하고 `origin/main`으로 push한다. 완료 시 `scripts/show-complete-badge.sh`를 실행해 Dock 아이콘 배지를 표시한다.
