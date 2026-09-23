/* ─────────────────────────────────────────────────────────────────────────────
   방문 분석 — Counter.dev (방문자 수 · 유입 경로 · 국가)

   사이트 ID(UUID)는 **이 파일의 `ID` 한 곳**에서만 정합니다. 정적 페이지(units/ ·
   grammar/ · conversation/ · guides/ · 404)와 홈이 모두 이 파일 하나를 함께 받아 씁니다.
   ID 를 비워 두면(또는 자리표시자·형식 오류면) **아무 것도 하지 않습니다** —
   스크립트를 내려받지도, 요청을 보내지도 않습니다.

   왜 Counter.dev 인가:
     · **무료이고 오픈소스**(AGPL-v3, pay-what-you-want)입니다.
     · **쿠키를 쓰지 않고**(No Cookies) IP 주소도 저장하지 않아 **동의 배너가 필요 없습니다.**
     · 화면이 **방문자 수·유입 경로·국가**뿐이라 배울 것이 없습니다.

   ※ 이전에는 Umami Cloud 를 썼습니다. Umami 의 **커스텀 이벤트**(quiz_start 등)는
     Counter.dev 에 없는 기능이라 더 이상 보내지 않습니다(assets/app.js 의 track() 참고).

   켜지지 않는 경우(모두 조용히 종료):
     1. 사이트 ID 가 없거나 형식이 아닐 때
     2. 파일을 `file://` 로 열었을 때 — 로컬 확인이 통계에 섞이지 않도록
     3. 브라우저의 추적 금지(Do Not Track)가 켜져 있을 때

   알아 둘 점:
     · Counter.dev 는 **사이트마다 ID(UUID)가 다릅니다.** 다른 도메인은 그 사이트에서
       따로 발급받아 각자의 `analytics.js` 에 넣습니다.
     · `data-utcoffset` 으로 방문자 지역 시간대의 날짜 경계를 씁니다.
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* 사이트 ID(UUID) — counter.dev 대시보드 → Settings(톱니) → tracking script 에서 복사합니다.
     예: '93671ad4-a966-4a52-b48f-56c92d10a671'. 여기 한 곳만 채우면 모든 페이지가 함께 켜집니다. */
  var ID = '06f22600-98d6-4fae-923e-c5d1f6ea8307';

  /* 1) 사이트 ID 가 없거나 자리표시자·형식 오류면 끝냅니다 */
  if (typeof ID !== 'string') return;
  ID = ID.trim().toLowerCase();
  if (!ID) return;
  if (ID === '00000000-0000-0000-0000-000000000000') return;   /* 자리표시자 */
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(ID)) return; /* UUID 아님 */

  /* 2) 로컬(file://)에서는 보내지 않습니다 */
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

  /* 3) 추적 금지 설정을 존중합니다 */
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1') return;

  /* UTC 시차(시간) — 방문자 지역 시간대로 날짜를 나누는 데 씁니다 */
  var utcOffset = -new Date().getTimezoneOffset() / 60;

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://cdn.counter.dev/script.js';
  tag.setAttribute('data-id', ID);
  tag.setAttribute('data-utcoffset', String(utcOffset));
  (document.head || document.documentElement).appendChild(tag);
})();
