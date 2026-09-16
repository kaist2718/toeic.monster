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
| `npm run build` | 정적 페이지 124개 생성 + 홈 사전 렌더 (결과물은 커밋 대상) |
| `npm run audit` | 콘텐츠·문구·사이트 감사 (빠진 파일·오타·프리캐시 어긋남) |
| `npm test` | DOM 을 흉내 낸 UX·TTS·문법 퀴즈 테스트 |
| `npm run verify` | 생성물이 소스와 어긋나지 않는지 확인 |
| `npm run check:ci` | 위 네 가지를 한 번에 (CI 가 돌리는 것과 같습니다) |
| `npm run check:browser` | 실제 브라우저로 100여 항목 점검 (로컬·배포 전용) |
| `npm run stage` | 배포본 `_site/` 구성 (공개할 파일만) |
| `npm run check:staged` | `_site/` 를 브라우저로 점검 (배포본 그대로) |
| `npm run audit:external` | 배포된 사이트의 색인·링크 점검 |

`npm run build` 뒤에는 생성물을 함께 커밋해야 `npm run verify` 가 통과합니다.

## 구조

```
index.html          홈(앱) — 이 파일이 유일한 원본입니다. 인라인 CSS·JS 를 도구들이 읽습니다.
units/ grammar/ conversation/ guides/   생성된 정적 페이지 124개 (build-pages.mjs)
data/               단어·문법·회화 데이터 (unit01.js …)
assets/             공용 스타일(site.css) · 발음(speak.js)
tools/              빌드·감사·점검·배포 도구 (Node 내장 모듈만)
promo/              홍보 영상·게시 도구 (사이트 배포 대상 아님)
docs/               기획·점검 기록 (사이트 배포 대상 아님)
```

## 배포

`main` 에 푸시하면 `.github/workflows/deploy.yml` 이 `check:ci` 를 통과한 뒤
`_site/`(공개 목록만 담은 폴더)만 GitHub Pages 로 게시합니다.
`tools/`·`promo/`·`docs/`·`package.json` 은 배포본에 들어가지 않습니다.

> **최초 1회 설정**: 저장소 → Settings → Pages → Source 를 **GitHub Actions** 로 바꿔야 합니다.
> 그 전까지는 기존 브랜치 배포 방식이 그대로 동작합니다(사이트는 정상).

배포본은 `tools/stage-site.mjs` 에서 한 번 더 다듬습니다 — 큰 인라인 `<style>` 을
`assets/app.css` 로 빼고 주석·태그 사이 공백을 걷어냅니다(index.html 719KB → 624KB).
저장소의 `index.html` 은 원본 그대로입니다.

## 문서

작업 기록과 배경은 `docs/` 에 있습니다. 점검 내역은 `docs/ux-review.md` 가 가장 자주 갱신됩니다.
