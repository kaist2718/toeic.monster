# toeic.monster

발음·예문으로 외우는 TOEIC 필수 어휘 1,000 — 정적 사이트입니다.
단어장 30유닛 · 문법 교재(기초~고급) · 회화 교재 · 학습 가이드를 함께 담고 있습니다.

빌드 도구도 프레임워크도 없습니다. Node 내장 모듈로만 돌아가며, 외부 의존성은 0개입니다.
(브라우저 점검만 헤드리스 Chrome 을 씁니다.)

## 시작하기

```bash
node --version      # 22 이상 (도구가 전역 WebSocket 을 씁니다)
npm run serve       # http://127.0.0.1:8000 에서 미리보기
```

## 자주 쓰는 명령

| 명령 | 하는 일 |
| --- | --- |
| `npm run build` | 정적 페이지 전체 생성 + 홈 사전 렌더 (결과물은 커밋 대상) |
| `npm run audit` | 콘텐츠·문구·사이트 감사 (빠진 파일·오타·프리캐시 어긋남) |
| `npm test` | DOM 을 흉내 낸 UX·TTS·문법 퀴즈 테스트 |
| `npm run verify` | 생성물이 소스와 어긋나지 않는지 확인 |
| `npm run check:ci` | 위 네 가지를 한 번에 (CI 가 돌리는 것과 같습니다) |
| `npm run check:browser` | 실제 브라우저로 100여 항목 점검 (로컬·배포 전용) |
| `npm run check:live` | 배포된 사이트를 브라우저로 점검 (배포 워크플로가 돌리는 것) |
| `npm run stage` | 배포본 `_site/` 구성 (공개할 파일만) |
| `npm run check:staged` | `_site/` 를 브라우저로 점검 (배포본 그대로) |
| `npm run perf` | 첫 방문·재방문 전송량 · FCP/LCP · 캐시 적중 실측 (`--compare` 로 원본과 비교) |
| `npm run audit:external` | 배포된 사이트의 색인·링크 점검 |

`npm run build` 뒤에는 생성물을 함께 커밋해야 `npm run verify` 가 통과합니다.

## 구조

```
index.html          홈(앱)의 마크업 — 첫 페인트 부트스트랩(테마)만 인라인으로 남습니다.
about.html          사이트 소개 + 문의 폼(Formspree) — 푸터의 「문의하기」가 #contact 로 연결됩니다.
units/ grammar/ conversation/ guides/   생성된 정적 페이지 (build-pages.mjs)
                    — units/ 안에 단어장 허브 · 유닛 30개 · 빈출 어휘 200선(frequency.html)
                      · 혼동 어휘 20쌍(confusion.html) · 숙어(idioms.html)
data/               단어·문법·회화 데이터 (unit01.js …) + 홈 앱 학습 데이터(app-data.js)
assets/             앱 스크립트(app.js) · 앱 스타일(app.css) · 정적 페이지 공용 스타일(site.css) · 발음(speak.js)
                    · 방문 분석 로더(analytics.js — Counter.dev, 사이트 ID는 이 파일 한 곳)
                    · 본문 서체 서브셋(fonts/ — `python tools/make-font-subset.py` 로 만듭니다)
                    — 홈 앱의 원본은 index.html · data/app-data.js · assets/app.js 세 파일이고,
                      도구는 셋을 이어 붙여 읽습니다(`tools/app-source.mjs` · docs/app-split-plan.md 2단계).
tools/              빌드·감사(콘텐츠·문구·구조·접근성)·점검·배포 도구 (Node 내장 모듈만)
                    — 폰트 서브셋만 Python(fontTools) 을 씁니다: tools/make-font-subset.py
promo/              홍보 영상·게시 도구 (사이트 배포 대상 아님)
docs/               기획·점검 기록 (사이트 배포 대상 아님)
```

## 문의 폼 (Formspree)

문의는 별도 서버 없이 [Formspree](https://formspree.io)로 받습니다.

**현재 연결 상태:** toeic.monster → `https://formspree.io/f/mkjgbwde`

- 위치: `about.html` 의 `<section id="contact">` 안. 푸터(모든 페이지)의 「문의하기」가 이 섹션으로 이동합니다.
- 수신처를 바꾸려면 **`about.html` 의 `<form ... action>` 한 줄**의 폼 ID만 바꾸면 됩니다.
  사이트별로 다른 폼을 쓰려면 각 사이트의 `action` 에 각자의 폼 ID를 넣습니다.
- 보내는 값: `type`(문의 유형) · `email`(답장 주소 — Formspree 가 회신 주소로 씁니다) · `where`(관련 단어·페이지) ·
  `message` · `_subject`(유형·대상을 붙인 제목) · 맨 아래 인라인 스크립트가 AJAX 전송을 맡습니다.
  reCAPTCHA를 켜면 `g-recaptcha-response` 가 더해집니다.
- **한글이 깨져 도착할 때**: 이 폼은 항상 UTF-8 로 보냅니다. 그런데 PowerShell·cmd 터미널에서
  `curl`·스크립트로 시험 전송하면 Windows 콘솔 문자셋(CP949)으로 인코딩되어 메일이 깨져
  도착합니다(이모지는 `?` 로 바뀝니다). 확인은 브라우저에서 폼에 직접 입력해 보내세요.
- 전송 형식은 **`x-www-form-urlencoded` + `charset=UTF-8`** 입니다. 폼 값을 `URLSearchParams` 로
  UTF-8 퍼센트 인코딩해 보내고 `Content-Type` 에 문자셋을 적습니다.
  (예전에는 `FormData`(multipart)를 썼는데, multipart 본문에는 "이 본문은 UTF-8" 이라는 표시가
  없어 수신 쪽이 EUC-KR/CP949 로 해석하면 한글 문의가 깨져 도착했습니다.
  `x-www-form-urlencoded` 는 CORS 안전 헤더라 사전 요청(preflight)도 생기지 않습니다.
  스크립트 없이 전송되는 경우를 위해 `<form>` 에 `accept-charset="UTF-8"` 도 함께 적어 두었습니다.)
- **스팸 방지 기본값**: 숨은 함정 칸(`name="_gotcha"`)을 1px 로만 남겼습니다(표준 visually-hidden).
  봇이 이 칸을 채우면 Formspree가 제출을 조용히 버립니다(사람에게는 보이지 않고 탭 순서에서도 빠집니다).
- **reCAPTCHA v3 (선택)**: `<form data-recaptcha-key="">` 에 사이트 키를 넣으면 켜집니다
  (같은 키의 비밀 키를 Formspree 폼 설정에 넣어야 합니다). 켠 경우에만 첫 전송 때 Google 스크립트를
  한 번 불러오고 토큰을 붙입니다 — **비워 두면 외부 요청이 0** 입니다.
- **스크립트가 없어도 동작합니다.**  `action` 으로 그대로 POST 되어 Formspree 안내 페이지가 뜹니다.
  스크립트가 있으면 페이지 이동 없이 제자리에 성공·실패 문구를 보여 주고, 전송 중에는 버튼을 잠급니다.
  실패·한도 초과(`429`)는 이메일 주소로도 보낼 수 있게 안내합니다.
- 대시보드에서 **Restrict to domain → `toeic.monster`** 를 넣어 두면 다른 도메인에서 오는 제출이 스팸함으로 갑니다.
  (이 설정은 프로젝트당 도메인 한 개입니다. 무료 플랜도 쓸 수 있습니다 — 폼·프로젝트 무제한, 월 50건 합산.)
- `about.html` 은 `tools/stage-site.mjs` 의 **`PUBLIC_FILES` 에 있어야 배포됩니다.**
  이 목록에 없던 동안 `about.html` 은 라이브에서 404 였고(푸터·sitemap 이 가리키는 채로) `npm run stage` 가 매번 실패했습니다.
  새 페이지를 만들면 이 목록에 넣고 `npm run stage` 로 확인하세요.

## 방문 분석 (Counter.dev)

방문자 수·유입 경로·국가를 보려면 **`assets/analytics.js`** 가 있습니다.
홈·정적 페이지 126개·404 가 **이 파일 하나**를 함께 받아 씁니다(생성기는 `tools/build-pages.mjs`).
[Counter.dev](https://counter.dev) 는 **무료·오픈소스**(AGPL-v3)이고 **쿠키를 쓰지 않아**
EEA·영국 방문자에게도 동의 배너가 필요 없습니다.

**켜는 법**: counter.dev 대시보드에서 `toeic.monster` 사이트를 만들고 **Settings → tracking script** 의
**사이트 ID(UUID)** 를 `assets/analytics.js` 의 `var ID = '';` 에 붙여 넣고 `npm run build` 뒤 배포합니다.
**비워 두면 어떤 요청도 나가지 않습니다**(스크립트를 내려받지도 않습니다).

**이전에는 Umami Cloud** 를 썼습니다. Umami 의 **커스텀 이벤트**(`quiz_start` 등)는 Counter.dev 에
없는 기능이라 지금은 `assets/app.js` 의 `track()` 이 비어 있습니다(호출은 이름만 남겨 둠).
이벤트를 지원하는 도구로 옮기면 그 함수 하나만 되살리면 됩니다.

## 배포

`main` 에 푸시하면 `.github/workflows/deploy.yml` 이 `check:ci` 를 통과한 뒤
`_site/`(공개 목록만 담은 폴더)만 GitHub Pages 로 게시하고, 이어서 **배포된 주소**를
헤드리스 브라우저로 훑는 `smoke` 작업이 돕니다.
`tools/`·`promo/`·`docs/`·`package.json` 은 배포본에 들어가지 않습니다.

> **설정 유지**: 저장소 → Settings → Pages → Source 가 **GitHub Actions** 여야 합니다.
> 브랜치 배포로 되돌리면 저장소 루트 전체가 공개됩니다.

앱 스타일(`assets/app.css` · 1단계)과 앱 스크립트·데이터(`assets/app.js`·`data/app-data.js` · 2단계)는
원본부터 파일이라, 배포본(`tools/stage-site.mjs`)은 주석·태그 사이 공백을 걷고 남은 큰 인라인 블록이
있으면 같은 방식으로 빼냅니다. 원본 `index.html` 은 628KB → **222KB**(앱 코드 277KB · 앱 데이터 86KB 는
각각 `assets/app.js`·`data/app-data.js`)이고, 남은 분량의 대부분은 검색·JS 없이 읽히는 **프리렌더 본문**입니다.
본문 서체도 CDN 조각(574KB) 대신 사이트 글자만 담은 서브셋(`assets/fonts/`, 195KB)을 씁니다 —
`python tools/make-font-subset.py` 로 다시 만듭니다.

## 문서

작업 기록과 배경은 `docs/` 에 있습니다. 점검 내역은 `docs/ux-review.md` 가 가장 자주 갱신됩니다.
앞으로 할 일은 `docs/content-roadmap.md`(콘텐츠) · `docs/app-split-plan.md`(원본 경량화) ·
`docs/prerender-split-plan.md`(남은 프리렌더 마크업) 에 단계별로 적혀 있습니다.
수익화 계획은 별도 **비공개 저장소**(`toeic-monetization-strategy`)에서 관리합니다(미구현).
