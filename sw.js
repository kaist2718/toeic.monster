/* toeic.monster Service Worker - 오프라인 학습 지원 */
var CACHE_NAME = "toeic-monster-v4";
var CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./units/",
  "./units/index.html",
  "./guides/",
  "./guides/index.html"
];

// 어휘 데이터. index.html 이 첫 화면에서 바로 내려받는 파일들이라
// 설치 단계에서 미리 캐시해 두면 다음 방문부터는 오프라인에서도 즉시 열립니다.
var DATA_ASSETS = ["data/idioms.js", "data/extra.js"];
for (var i = 1; i <= 30; i++) {
  DATA_ASSETS.push("data/unit" + (i < 10 ? "0" + i : i) + ".js");
}

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
self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 외부 리소스 제외

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
