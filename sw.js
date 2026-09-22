/* toeic.monster Service Worker - 오프라인 학습 지원 */
var CACHE_NAME = "toeic-monster-v17";
var CORE_ASSETS = [
  "./",
  "./index.html",
  // 앱 스타일 — index.html 이 더 이상 인라인으로 들고 있지 않으므로 파일로 함께 담습니다
  // (없으면 오프라인에서 스타일 없는 화면이 됩니다).
  "./assets/app.css",
  // 앱 스크립트 — 2026-09-18 부터 index.html 인라인에서 assets/app.js 파일로 옮겼습니다
  // (docs/app-split-plan.md 2단계). 오프라인 첫 방문에도 앱이 실행되도록 함께 담습니다.
  "./assets/app.js",
  // 본문 서체 서브셋 — CDN 조각(홈 첫 방문 39개·574KB)을 우리 파일 하나(약 195KB)로 바꿨습니다.
  // 첫 화면 글자가 이 파일로 그려지므로 오프라인에도 함께 담습니다.
  "./assets/fonts/pretendard-variable.woff2",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  // 정적 페이지가 함께 쓰는 공용 스타일·스크립트(문법 교재 예문 듣기)
  "./assets/site.css",
  "./assets/speak.js",
  "./units/",
  "./units/index.html",
  // 단어장 허브에서 바로 가는 두 목록 페이지 — 오프라인에서도 열리도록 함께 담습니다
  // (둘 다 단어·뜻이 전부 텍스트라 용량 부담이 작습니다).
  "./units/frequency.html",
  "./units/confusion.html",
  "./units/idioms.html",
  "./guides/",
  "./guides/index.html",
  "./grammar/",
  "./grammar/index.html",
  "./grammar/cheatsheet.html",
  // 회화 교재도 문법 교재와 같은 정적 페이지라 허브를 함께 담아 둡니다.
  "./conversation/",
  "./conversation/index.html"
];

// 어휘 데이터. index.html 이 첫 화면에서 바로 내려받는 파일들이라
// 설치 단계에서 미리 캐시해 두면 다음 방문부터는 오프라인에서도 즉시 열립니다.
var DATA_ASSETS = [
  // 홈 앱의 학습 데이터 — 2026-09-18 부터 assets/app.js 안이 아니라 이 파일입니다(2단계).
  "data/app-data.js",
  "data/idioms.js",
  "data/extra.js",
  "data/grammar-basic.js",
  "data/grammar-intermediate.js",
  "data/grammar-advanced.js",
  // 회화 교재 3권도 index.html 이 첫 화면에서 함께 내려받습니다(data/conversation-*.js).
  "data/conversation-basic.js",
  "data/conversation-intermediate.js",
  "data/conversation-advanced.js"
];
for (var i = 1; i <= 30; i++) {
  DATA_ASSETS.push("data/unit" + (i < 10 ? "0" + i : i) + ".js");
}

// 본문 서체 — 2026-09-18 부터 CDN 이 아니라 우리 도메인의 서브셋 파일 하나입니다
// (`CORE_ASSETS` 에 들어 있습니다). 페이지가 첫 방문에 바로 필요로 하므로 여기서 미리 담아 두면
// 오프라인에서도 같은 글꼴로 보입니다. 만드는 도구: tools/make-font-subset.py

// 설치: 핵심 에셋 + 어휘 데이터 캐시
// 일부 파일이 없더라도(부분 배포 등) 설치 자체는 실패하지 않게 개별적으로 담습니다.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        CORE_ASSETS.concat(DATA_ASSETS).map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// 활성화: 이전 버전 캐시 정리
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// 새 버전으로 바로 전환하고 싶을 때 페이지에서 보내는 신호
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// 요청 전략
//  - HTML 문서(페이지 이동): 네트워크 우선 → 새 배포가 즉시 반영, 오프라인이면 캐시 폴백
//  - 그 외 에셋: stale-while-revalidate → 캐시를 즉시 응답하고 백그라운드에서 갱신
//  - 본문 서체: 다른 에셋과 같습니다 — 이제 우리 도메인 파일이라 아래 경로로 처리됩니다
self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  if (url.origin !== self.location.origin) return; // 외부 리소스(분석 스크립트)는 손대지 않습니다

  var accept = (req.headers.get("accept") || "");
  var isHTML = req.mode === "navigate" || accept.indexOf("text/html") !== -1;

  if (isHTML) {
    event.respondWith(
      fetch(req).then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        }
        return response;
      }).catch(function () {
        return caches.match(req).then(function (cached) {
          return cached || caches.match("./index.html");
        }).then(function (cached) {
          // 첫 방문부터 오프라인이면 캐시가 없으므로 유효한 실패 응답으로 마무리
          // (undefined 를 respondWith 하면 TypeError 로 unhandled rejection 이 발생합니다)
          return cached || Response.error();
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (response) {
        if (response && response.status === 200 && response.type === "basic") {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        }
        return response;
      }).catch(function () { return cached || Response.error(); });
      return cached || network;
    })
  );
});
