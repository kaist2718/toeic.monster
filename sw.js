/* toeic.monster Service Worker - 오프라인 학습 지원 */
var CACHE_NAME = "toeic-monster-v3";
var CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg"
];

// 설치: 핵심 에셋 캐시 (데이터 유닛은 첫 방문 시점에 캐시)
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
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
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});