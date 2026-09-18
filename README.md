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
units/ grammar/ conversation/ guides/   생성된 정적 페이지 (build-pages.mjs)
                    — units/ 안에 단어장 허브 · 유닛 30개 · 빈출 어휘 200선(frequency.html)
                      · 혼동 어휘 20쌍(confusion.html) · 숙어(idioms.html)
data/               단어·문법·회화 데이터 (unit01.js …) + 홈 앱 학습 데이터(app-data.js)
assets/             앱 스크립트(app.js) · 앱 스타일(app.css) · 정적 페이지 공용 스타일(site.css) · 발음(speak.js)
                    · 본문 서체 서브셋(fonts/ — `python tools/make-font-subset.py` 로 만듭니다)
                    — 홈 앱의 원본은 index.html · data/app-data.js · assets/app.js 세 파일이고,
                      도구는 셋을 이어 붙여 읽습니다(`tools/app-source.mjs` · docs/app-split-plan.md 2단계).
tools/              빌드·감사·점검·배포 도구 (Node 내장 모듈만)
                    — 폰트 서브셋만 Python(fontTools) 을 씁니다: tools/make-font-subset.py
promo/              홍보 영상·게시 도구 (사이트 배포 대상 아님)
docs/               기획·점검 기록 (사이트 배포 대상 아님)
```

## 배포

`main` 에 푸시하면 `.github/workflows/deploy.yml` 이 `check:ci` 를 통과한 뒤
`_site/`(공개 목록만 담은 폴더)만 GitHub Pages 로 게시하고, 이어서 **배포된 주소**를
헤드리스 브라우저로 훑는 `smoke` 작업이 돕니다.
`tools/`·`promo/`·`docs/`·`package.json` 은 배포본에 들어가지 않습니다.

> **설정 유지**: 저장소 → Settings → Pages → Source 가 **GitHub Actions** 여야 합니다.
> 브랜치 배포로 되돌리면 저장소 루트 전체가 공개됩니다.

앱 스타일(`assets/app.css` · 1단계)과 앱 스크립트·데이터(`assets/app.js`·`data/app-data.js` · 2단계)는
원본부터 파일이라, 배포본(`tools/stage-site.mjs`)은 주석·태그 사이 공백을 걷고 남은 큰 인라인 블록이
있으면 같은 방식으로 빼냅니다. 원본 `index.html` 은 628KB → **283.5KB** (앱 코드 260KB · 앱 데이터 86KB 는
각각 `assets/app.js`·`data/app-data.js`). 저장소의 원본 파일들은 그대로입니다.

## 문서

작업 기록과 배경은 `docs/` 에 있습니다. 점검 내역은 `docs/ux-review.md` 가 가장 자주 갱신됩니다.
앞으로 할 일은 `docs/content-roadmap.md`(콘텐츠) · `docs/app-split-plan.md`(원본 경량화) ·
`docs/prerender-split-plan.md`(남은 프리렌더 마크업) 에 단계별로 적혀 있습니다.
