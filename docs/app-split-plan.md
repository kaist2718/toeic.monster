# `index.html` 원본 경량화 설계 (실행 전 계획)

> 작성: 2026-09-18 · 상태: **1·2단계(스크립트·스타일·데이터 분리) 완료 · 3단계(로드 전략) 일부 남음**
> 관련 기록: `docs/ux-review.md` §3 · §9-5 · §18-5 · §19 · §20 · 남은 마크업은 `docs/prerender-split-plan.md`
> 대상: 저장소 원본 `index.html` 하나 (배포본 `_site/` 는 이미 분리되어 있습니다)

## 0. 왜 별도 문서인가

`index.html` 은 이 프로젝트에서 **손으로 고치는 유일한 원본이자, 도구 14종이 읽는 입력**입니다
(`tools/*.mjs` 가 코드 블록·데이터 배열을 직접 읽습니다).
그래서 "그냥 스타일·스크립트를 파일로 빼는" 변경은 사소해 보이지만, 실제로는 **빌드·감사·테스트·계측
도구의 입력 형식을 바꾸는 일**입니다. 이 문서는 그 순서와 검증 방법을 먼저 정해 두기 위한 것입니다.

## 1. 현재 실측값 (2026-09-18)

| 항목 | 1단계 전 | 1단계 후(현재) |
| --- | --- | --- |
| `index.html` 원본 | 708KB raw · 167KB gzip · 9,669줄 | **628KB raw · 151KB gzip · 7,362줄** |
| 그중 인라인 `<style>` | 80KB | **0KB** |
| 그중 인라인 `<script>` | 304KB (블록 2개 · 302KB) | 302KB — **2단계 대상** |
| 그 밖(마크업·프리렌더 콘텐츠) | 약 328KB | 약 328KB |
| `assets/app.css` (앱 스타일) | 0KB — 원본에는 없고 배포본에서만 생성 | **80.3KB (gzip 16.7KB)** — 원본이자 배포본 |
| `data/*.js` | 38개 · 686KB (첫 화면에서 36개를 내려받음) | 그대로 |
| 배포본 앱 문서(`_site/index.html`) | 270.7KB | 270.7KB (**변화 없음**) |
| 배포본 `assets/app.js` | 344.8KB (재방문 시 캐시) | 344.8KB |

즉 **재방문·첫 페인트 비용은 이미 배포본에서 해결**되어 있습니다(§17 의 FCP/LCP −50%).
남은 문제는 **저장소 원본의 크기**입니다.

원본이 큰 것이 실제로 비용이 되는 지점:

1. **편집·리뷰** — 9,600줄 넘는 한 파일에서 인라인 CSS·JS·마크업이 섞여 있어 diff 가 커집니다.
2. **CI 파싱** — `check:ci` 는 매 실행마다 이 파일을 여러 번 읽고 정규식으로 훑습니다.
3. **로컬 개발** — `npm run serve` 는 no-store 라 새로고침마다 문서 전체를 다시 받습니다
   (1단계 후 628KB. 스타일은 파일이라 브라우저 캐시를 씁니다).
4. **프리렌더** — `index.html` 안에 다시 심으므로 문서가 한 번 더 커집니다(현재 +약 130KB).

## 2. 목표와 하지 않을 것

**목표**: 원본 문서를 `≤ 120KB` 로 줄이고, 스타일·스크립트·데이터를 각각 캐시 가능한 파일로 옮긴다.
합계 전송량은 늘지 않아야 한다(첫 방문 총량은 그대로, 문서만 가벼워짐).

**하지 않을 것 (중요)**

- 번들러(webpack·esbuild·rollup) 도입 — 이 저장소의 "외부 의존성 0" 원칙과 CI 구조가 깨집니다.
- 배포 경로(`dist/`) 변경 — GitHub Pages 설정·`deploy.yml`·`CNAME` 을 함께 건드려야 하고,
  이미 `_site/` 로 같은 효과를 내고 있습니다.
- 데이터 34개 파일을 1개로 묶기 — HTTP/2 에서 요청 수 이득이 작고(§9-5 판단), 원본이 둘로 늘어납니다.

## 3. 단계 계획

### 1단계 — 스타일 분리 (`<style>` → `assets/app.css`) ✅ 완료 (2026-09-18)

- `index.html` 의 인라인 `<style>`(80.3KB)을 `assets/app.css` 로 옮기고, `<head>` 의 **같은 자리**에
  `<link rel="stylesheet" href="assets/app.css">` 를 넣었습니다 — 위치가 같아 적용 순서가 그대로입니다.
- 떼어낸 내용이 원래 배포본에서 나가던 것과 같은지 **바이트로 비교**했습니다(헤더 주석 4줄만 차이).
- 실제로 수정한 파일(계획과 달랐던 부분 포함):
  - `sw.js` — `CORE_ASSETS` 에 `./assets/app.css` 추가(오프라인에 스타일이 빠지지 않게) · 캐시 `v10 → v11`.
    계획에 없던 항목입니다. 파일로 빠지는 순간 오프라인 캐시 목록에 없으면 스타일 없는 화면이 됩니다.
  - `audit-site.mjs` — **3-2b-2** 추가: `index.html` 이 `assets/app.css` 를 부르는지 · 인라인 `<style>` 이
    2KB 를 넘지 않는지 검사합니다(되돌리면 감사가 실패합니다).
  - `test-home-ux.mjs` — 6-1 의 CSS 규칙 검사가 `index.html` 이 아니라 `assets/app.css` 를 읽도록 변경.
    계획에 없던 항목입니다(그대로 두면 11건이 "코드 블록을 찾지 못했습니다"로 실패합니다).
  - `stage-site.mjs` · `check-browser.mjs` · `verify-generated.mjs` · `measure-perf.mjs` — 주석·설명을
    실제 구조로 정정(동작 변경 없음).
- 검증(모두 통과): `npm run audit`(3-2b-2 포함) · `npm test`(101 + 31 + 문법) · `npm run check:browser` ·
  `npm run check:staged`(배포본에서도 `assets/app.css` 적용 확인) · `npm run build` 2회 멱등.

### 2단계 — 앱 스크립트 분리 (`<script>` → `assets/app.js`) ✅ 완료 (2026-09-18)

- 가장 큰 조각(353KB)을 `assets/app.js` 로 옮기고, `index.html` 은
  `<script defer src="assets/app.js"></script>` 로 부릅니다.
  인라인으로 남는 `<script>` 는 첫 페인트 부트스트랩(테마)과 JSON-LD 3개뿐입니다(가장 큰 것 1.5KB).
- **도구 수정(핵심)**: `index.html` 에서 들여쓰기로 코드 블록을 떼어내던 도구들은 이제
  `tools/app-source.mjs` 의 `readAppSource()` 가 돌려주는 "`index.html` + `assets/app.js`" 를
  같은 방식으로 읽습니다. 대상: `prerender-home.mjs`(html 은 주입용, code 는 추출용으로 분리) ·
  `test-home-ux.mjs` · `test-grammar-quiz.mjs` · `test-tts-voice.mjs` · `audit-content.mjs` ·
  `audit-text.mjs` · `audit-site.mjs`(3-2d·6-1 은 앱 코드까지) · `build-pages.mjs`(UNITS).
- **회귀 방지**: `audit-site.mjs` **3-2b-3** — `index.html` 이 `assets/app.js` 를 부르지 않거나
  인라인 `<script>` 이 8KB 를 넘으면 실패. `sw.js` — `CORE_ASSETS` 에 `./assets/app.js` 를 넣고
  캐시 이름 `v11 → v12`(오프라인 첫 방문에도 앱이 실행되게). `verify-generated.mjs` 는
  `assets/` 를 이미 대상에 두고 있어 `app.js` 가 자동으로 검증됩니다.
- **하지 않은 것**: 데이터 배열을 `data/app-data.js` 로 따로 모으는 일은 미뤘습니다
  (배열이 함수 사이에 흩어져 있어 위험이 크고, 이 단계의 목표는 "원본 문서에서 353KB 를 빼는 것"
  이라 이미 달성). 3단계에서 다룰 후보입니다.
- 검증(모두 통과): `npm run build` 가 "바뀐 내용 없음"(프리렌더 결과 동일) · `npm run audit` ·
  `npm test` · `npm run check:browser`(반복) · `npm run check:staged` · `npm run perf:compare`
  (첫 방문 965.1KB → 963.9KB, LCP 596ms → 332ms).

| 항목 | 1단계 후(2단계 전) | 2단계 후(현재) |
| --- | --- | --- |
| `index.html` 원본 | 628KB raw · 7,362줄 | **283.5KB raw · 1,538줄** |
| 그중 인라인 `<script>` | 302KB | **4.0KB**(테마 부트스트랩 0.7KB + JSON-LD 3.4KB) |
| `assets/app.js` | 배포본에서만 생성 | **원본 259.6KB(gzip 101.7KB)** — 코드만 |
| `data/app-data.js` | (없음) | **원본 85.5KB** — 학습 데이터 배열 23개 |
| 배포본 `index.html` | 270.7KB | 약 277KB(변화 없음) |

### 2단계-b — 데이터 배열 분리 (`data/app-data.js`) ✅ 완료 (2026-09-18)

- `assets/app.js` 안에 있던 학습 배열·객체 23개(86.3KB)를 `data/app-data.js` 로 옮겼습니다.
  최상위 `var` 라 전역(`window.UNITS` …)이 되고, `assets/app.js` 가 이름 그대로 씁니다.
  `index.html` 은 `data/app-data.js` 를 `assets/app.js` **보다 먼저** 부릅니다.
- 효과: **코드와 데이터가 따로 캐시**됩니다 — 한쪽만 바뀔 때 다른 쪽은 그대로 재사용합니다
  (계획의 "데이터를 각각 캐시 가능한 파일로" 목표). 첫 방문 총량은 늘지 않습니다
  (`npm run perf:compare`: 963.2KB → 961.4KB · 재방문 310B → 287B).
- 함께 고친 **잠재 버그**: `prerender-home.mjs` 의 `extractVar` 가 한 줄짜리 빈 배열
  (`var all = [];`)을 여러 줄 배열로 오인해 멀리 있는 다른 `];` 까지 삼키고 있었습니다.
  예전에는 그 잘려나온 덩어리가 우연히 실행돼 통과했고, 데이터를 파일로 나누면서 드러났습니다.
  이제 첫 줄에서 닫히는 배열은 그 줄만 씁니다.
- 회귀 방지: `audit-site` **3-2b-3** 이 `data/app-data.js` 미참조 · `assets/app.js` 보다 뒤 로드 ·
  데이터가 앱 코드로 되돌아간 경우를 실패로 잡습니다. `sw.js` 프리캐시에 `data/app-data.js`
  추가(캐시 `v12 → v13`).
- `npm run build` 는 여전히 "바뀐 내용 없음"(프리렌더 산출물이 바이트 단위로 동일).
- 남은 것: 남은 283.5KB 의 67%는 **프리렌더 마크업**입니다. 이걸 파일로 빼면 검색엔진·JS 없는
  읽기가 깨지므로 방향이 다릅니다 — `docs/prerender-split-plan.md` 에 검토·계획을 정리했습니다.

### 3단계 — 로드 전략 다듬기 (일부 완료: 데이터 분리 · 나머지 검토 중)

- 첫 화면에 필요 없는 데이터(`data/extra.js` 는 이미 지연)와 무거운 섹션 렌더를 더 미룹니다.
- Pretendard woff2 조각(첫 방문의 57%)을 첫 페인트 뒤로 미루는 실험 — 단, 글꼴이 늦게 바뀌는
  현상(FOUT)이 생기므로 실측 후 결정합니다.

## 4. 위험과 되돌리기

| 위험 | 대응 |
| --- | --- |
| 프리렌더가 어긋나 검색 노출 내용이 바뀜 | `node tools/prerender-home.mjs --check`(CI 에 연결됨) — 어긋나면 실패 |
| 테스트가 코드 블록을 찾지 못해 조용히 통과 | `slice()`/`atLineStart` 실패 시 즉시 오류로 멈추도록 유지(현재 그렇게 되어 있음) |
| 배포본이 오히려 무거워짐 | `npm run perf:compare` 로 원본 vs 배포본 전송량·FCP/LCP 비교 |
| 한 번에 되돌리기 어려움 | 단계별로 커밋하고, 각 단계가 **단독으로 통과**해야 다음으로 진행 |

## 5. 완료 기준 (1단계는 아래 첫 줄의 스타일 부분을 충족)

- `index.html` ≤ 120KB(raw), 인라인 `<style>`·`<script>` 는 첫 페인트용 부트스트랩(테마·등록)만 남김.
  → 1단계 후: 인라인 `<style>` 0KB · `<script>` 302KB. → 2단계 후: `<script>` 4.0KB(테마 + JSON-LD),
  `index.html` 283.5KB.
  남은 190.8KB(67%)는 **프리렌더 마크업**(검색·JS 없이 읽히는 본문)이라 파일로 뺄 수 없습니다.
  별도 정적 페이지로 나누는 방향은 `docs/prerender-split-plan.md` 의 1단계(`freqGrid` → `units/frequency.html`)를
  참고하세요 — 그때 `index.html` 이 약 240KB 로 내려갑니다.
- `npm run check:ci` 통과 · `npm run check:browser` 통과 · `npm run perf:compare` 에서
  첫 방문 총량이 늘지 않고 FCP/LCP 가 나빠지지 않음.
- `docs/ux-review.md` §3 의 "페이지 무게" 권고를 닫고, 이 문서에 완료 기록을 남김.
