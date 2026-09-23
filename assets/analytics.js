/* ─────────────────────────────────────────────────────────────────────────────
   방문 분석 — 자체 호스팅 분석기 (visitor-analytics)

   이 파일은 **로더**입니다. 실제 수집 코드는 아래 `TRACKER` 가 가리키는 서버에서
   받아옵니다. 정적 페이지(units/ · grammar/ · conversation/ · guides/ · 404)와
   홈이 모두 이 파일 하나를 함께 받아 씁니다.

   설정은 아래 두 값에서만 정합니다.
     TRACKER — 수집 스크립트 주소 (자체 호스팅 분석 서버)
     DOMAIN  — 이 사이트의 도메인. 서버가 이 값으로 사이트별 통계를 나눕니다.

   개인정보:
     · **쿠키를 쓰지 않습니다**(sessionStorage 만 사용) — 동의 배너가 필요 없습니다.
     · IP 주소는 **서버에서 원본을 저장하지 않고**, 매일 바뀌는 salt 로 만든
       해시(순방문자 식별용)로만 씁니다. 날이 바뀌면 같은 사람도 다른 값이 됩니다.
     · 수집에 실패해도 사이트 동작에는 영향이 없습니다(전송 실패는 무시).

   켜지지 않는 경우(모두 조용히 종료):
     1. TRACKER 가 비어 있거나 http(s) 주소가 아닐 때
     2. 파일을 `file://` 로 열었을 때 — 로컬 확인이 통계에 섞이지 않도록
     3. 브라우저의 추적 금지(Do Not Track)가 켜져 있을 때
     4. 같은 페이지에서 이미 넣었을 때(중복 삽입 방지)

   대시보드: https://visitor-analytics-a5bp.onrender.com
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* 수집 스크립트 주소 — 자체 호스팅 분석 서버입니다. 여기 한 곳만 바꾸면 모든 페이지가 함께 바뀝니다. */
  var TRACKER = 'https://visitor-analytics-a5bp.onrender.com/analytics.js';

  /* 이 사이트의 도메인 — 서버가 사이트별로 통계를 나누는 기준입니다(www 는 자동으로 합쳐집니다). */
  var DOMAIN = 'toeic.monster';

  /* 1) 주소 형식 확인 */
  if (typeof TRACKER !== 'string') return;
  TRACKER = TRACKER.trim();
  if (!/^https?:\/\//.test(TRACKER)) return;

  /* 2) 로컬(file://)에서는 보내지 않습니다 */
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

  /* 3) 추적 금지 설정을 존중합니다 */
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1') return;

  /* 4) 중복 삽입 방지 */
  if (document.querySelector('script[data-visitor-analytics]')) return;

  /* 수집 스크립트를 붙입니다. 실패해도 페이지 동작에는 영향이 없습니다. */
  var tag = document.createElement('script');
  tag.defer = true;
  tag.src = TRACKER;
  tag.setAttribute('data-domain', DOMAIN);
  /* 이 표시가 위 4) 의 중복 검사에 쓰입니다(수집 스크립트에는 전달되지 않습니다). */
  tag.setAttribute('data-visitor-analytics', '');
  (document.head || document.documentElement).appendChild(tag);
})();
