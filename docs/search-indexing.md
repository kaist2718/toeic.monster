# 검색엔진 등록 · 색인 점검 가이드

toeic.monster 를 구글·네이버 검색에 노출시키기 위한 설정과, 반영 상태를 확인하는 방법을 정리합니다.

---

## 1. 한눈에 보기

| 항목 | 위치 | 상태 |
| --- | --- | --- |
| 구글 소유확인 | `index.html` 의 `google-site-verification` | 적용됨 |
| 네이버 소유확인 | `index.html` 의 `naver-site-verification` | 적용됨 |
| 크롤링 허용 | `robots.txt` (`Allow: /` + Sitemap 명시) | 적용됨 |
| 사이트맵 | `sitemap.xml` (35개 URL) | 자동 생성 |
| 정적 단어 페이지 | `units/*.html` | 자동 생성 |
| OG 이미지 | `og-image.png` (1200×630) | 생성됨 |
| 구조화 데이터 | WebSite · LearningResource · FAQPage · BreadcrumbList · ItemList | 적용됨 |

**소유확인과 사이트맵 제출의 마지막 "확인" 클릭만 각 콘솔에 로그인해 직접 해야 합니다.**

---

## 2. 왜 정적 페이지(`units/`)가 필요한가

이 사이트는 어휘 목록을 브라우저에서 JavaScript로 그리는 단일 페이지 앱(`#units` 를 `renderUnits()` 가 채우는 구조)입니다.

- **구글**: JS를 실행해 렌더링하므로 대체로 읽습니다.
- **네이버 Yeti**: JS 실행 능력이 제한적이라 **단어 목록을 읽지 못할 가능성이 큽니다.**

그래서 `tools/build-pages.mjs` 가 `data/unit01.js` ~ `data/unit30.js`, `data/idioms.js` 를 읽어
**크롤러가 그대로 읽을 수 있는 완전한 HTML**을 미리 만들어 둡니다.

```
units/index.html          주제별 단어장 허브 (30개 유닛 목록)
units/unit-01.html ~ 30   유닛별 단어 전체 (1,000단어, 발음·예문·해석 포함)
units/idioms.html         빈출 구동사·숙어 60선
sitemap.xml               위 페이지들을 모두 포함해 재생성됨
```

각 페이지에는 `canonical`, OG/Twitter 메타, `LearningResource` + `BreadcrumbList` 구조화 데이터,
이전/다음 유닛 링크가 들어갑니다. 홈 페이지의 유닛 섹션과 푸터에서 링크되어 크롤러가 발견할 수 있습니다.

### 재생성

어휘 데이터(`data/*.js`)나 유닛 목록(`index.html` 의 `UNITS`)을 수정한 뒤에는 반드시 다시 실행하세요.

```bash
node tools/build-pages.mjs
```

외부 의존성 없이 Node 내장 모듈만 씁니다. 여러 번 실행해도 결과가 동일합니다.
`lastmod` 는 `data`/`index.html` 의 마지막 커밋 날짜를 쓰며, 원하면 `BUILD_DATE=2026-01-01` 로 덮어쓸 수 있습니다.

### OG 이미지 재생성 (디자인을 바꿀 때만)

```bash
# Windows 기준. Chrome 경로는 환경에 맞게 수정
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 \
  --user-data-dir=/tmp/chrome-og \
  --screenshot="$PWD/og-image.png" \
  "file:///$(cygpath -m "$PWD/tools/og-template.html")"
```

---

## 3. 남은 수동 단계

### 구글 서치콘솔

1. https://search.google.com/search-console 접속 → 로그인
2. 속성이 없다면 **URL 접두어** 방식으로 `https://toeic.monster` 추가
   (도메인 방식은 DNS 인증만 가능하므로 메타태그를 쓰려면 URL 접두어여야 합니다)
3. **확인(Verify)** 클릭
4. 좌측 **Sitemaps** → `sitemap.xml` 입력 → **제출**
5. 좌측 **URL 검사** → `https://toeic.monster/` 입력 → **색인 생성 요청**

### 네이버 서치어드바이저

1. https://searchadvisor.naver.com 접속 → 로그인
2. **웹마스터 도구** → `https://toeic.monster` 등록 → **확인**
3. **요청 > 사이트맵 제출** → `https://toeic.monster/sitemap.xml`
4. **요청 > 웹페이지 수집** 으로 주요 URL 수집 요청 (하루 50건 제한)
   - `https://toeic.monster/`
   - `https://toeic.monster/units/`
   - `https://toeic.monster/units/unit-01.html` … 주요 유닛

> 소유확인 태그는 반드시 `<head>` 안에 있어야 합니다. `body` 안에 있으면 네이버가 검증에서 제외합니다.
> 현재 두 태그 모두 `<head>` 내부, `<link rel="canonical">` 바로 아래에 있습니다.

---

## 4. 색인 반영 점검

색인은 보통 **며칠 ~ 2주** 걸립니다.

### 검색 연산자로 확인

| 목적 | 검색어 |
| --- | --- |
| 구글 색인 수 | `site:toeic.monster` |
| 네이버 색인 수 | `site:toeic.monster` |
| 특정 유닛 노출 | `site:toeic.monster 회의와 협상` |
| 브랜드 노출 | `toeic.monster` |

### 구글 서치콘솔에서 확인

- **색인 생성 > 페이지**: 색인된/제외된 URL과 사유를 봅니다.
  - `발견됨 - 현재 색인이 생성되지 않음` 이 오래 지속되면 **URL 검사 → 색인 생성 요청**으로 밀어줍니다.
- **사이트맵**: `성공` 여부와 `검색된 페이지 수` 를 확인합니다.
- **실적**: 노출수·클릭수·검색어. 색인 전에는 비어 있는 게 정상입니다.

### 네이버 서치어드바이저에서 확인

- **리포트 > 사이트 최적화**: robots.txt·사이트맵·RSS 진단 결과
- **리포트 > 수집 현황**: Yeti 가 수집한 URL (수집됨 / 수집 제외)
- **리포트 > 색인 현황**: 네이버 검색에 반영된 문서 수
- **요청 > 웹페이지 수집**: 특정 URL 수집 결과 (거절/미수집 사유 확인)

---

## 5. 문제 해결 체크리스트

| 증상 | 확인할 것 |
| --- | --- |
| 소유확인이 실패함 | 배포 반영 전에 눌렀는지. `curl -s https://toeic.monster/ \| grep site-verification` 로 태그가 실제로 내려오는지 확인 |
| 사이트맵을 못 읽음 | `https://toeic.monster/sitemap.xml` 이 200인지, XML 형식이 맞는지 |
| 색인이 안 됨 | `robots.txt` 에서 막힌 URL이 없는지, `<meta name="robots">` 가 `noindex` 가 아닌지 |
| 네이버에 단어가 안 나옴 | `units/*.html` 이 배포되었는지, `node tools/build-pages.mjs` 재실행 후 커밋했는지 |
| 브라우저에서 변경이 안 보임 | 서비스워커 캐시. 강력 새로고침(Ctrl+Shift+R). 검색엔진은 서버에서 직접 요청하므로 영향 없음 |
| OG 미리보기가 안 나옴 | `https://toeic.monster/og-image.png` 가 200인지 확인 |

---

## 6. 배포 후 한 번에 점검

```bash
# 소유확인 태그
curl -s https://toeic.monster/ | grep site-verification

# robots / sitemap
curl -s https://toeic.monster/robots.txt
curl -s https://toeic.monster/sitemap.xml | grep -c '<loc>'

# 정적 페이지 응답 코드
for u in / /units/ /units/unit-01.html /units/idioms.html /og-image.png; do
  printf '%s -> %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' "https://toeic.monster$u")"
done
```
