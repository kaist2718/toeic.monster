/* toeic.monster Service Worker - 오프라인 학습 지원 */
var CACHE_NAME = "toeic-monster-v12";
var CORE_ASSETS = [
  "./",
  "./index.html",
  // 앱 스타일 — index.html 이 더 이상 인라인으로 들고 있지 않으므로 파일로 함께 담습니다
  // (없으면 오프라인에서 스타일 없는 화면이 됩니다).
  "./assets/app.css",
  // 앱 스크립트 — 2026-09-18 부터 index.html 인라인에서 assets/app.js 파일로 옮겼습니다
  // (docs/app-split-plan.md 2단계). 오프라인 첫 방문에도 앱이 실행되도록 함께 담습니다.
  "./assets/app.js",
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

// 본문 서체(Pretendard Variable, CDN). CSS 만 미리 담고,
// 실제 woff2 조각은 처음 쓰일 때 fetch 핸들러가 캐시에 넣습니다.
var FONT_ASSETS = [
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
];

// 설치: 핵심 에셋 + 어휘 데이터 캐시
// 일부 파일이 없더라도(부분 배포 등) 설치 자체는 실패하지 않게 개별적으로 담습니다.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        CORE_ASSETS.concat(DATA_ASSETS, FONT_ASSETS).map(function (url) {
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

// 본문 서체 요청인지 확인합니다(CDN 의 Pretendard CSS·woff2).
function isFontRequest(url) {
  return url.hostname === "cdn.jsdelivr.net" && /pretendard/i.test(url.pathname);
}

// 요청 전략
//  - HTML 문서(페이지 이동): 네트워크 우선 → 새 배포가 즉시 반영, 오프라인이면 캐시 폴백
//  - 그 외 에셋: stale-while-revalidate → 캐시를 즉시 응답하고 백그라운드에서 갱신
//  - 본문 서체(외부 CDN): 캐시 우선 → 오프라인에서도 같은 글꼴로 보이게
self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  // 서체는 다른 출처라 아래 origin 검사보다 먼저 처리해야 합니다.
  if (isFontRequest(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (response) {
            // 웹폰트·CDN 응답은 CORS(200)이거나 opaque(status 0)일 수 있어 둘 다 담습니다.
            if (response && (response.status === 200 || response.type === "opaque")) {
              cache.put(req, response.clone());
            }
            return response;
          }).catch(function () {
            // 오프라인 첫 방문 등 글꼴을 못 받으면 시스템 글꼴로 대체됩니다.
            return Response.error();
          });
        });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return; // 그 밖의 외부 리소스 제외

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
