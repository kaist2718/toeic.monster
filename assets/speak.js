/*
 * 정적 페이지(문법 교재)의 예문 듣기 버튼(.gex-speak) 공용 스크립트.
 *
 * 왜 파일로 빼 두는가:
 *   페이지마다 인라인으로 넣으면 43개 페이지가 같은 2.3KB 를 각각 다시 받습니다(합쳐서 97KB).
 *   파일로 두면 브라우저가 한 번만 받아 모든 페이지에서 재사용하고, 서비스워커도 함께 담습니다.
 *
 * 어떻게 쓰이는가:
 *   페이지가 <head> 에서 `defer` 로 불러 옵니다. defer 는 문서 파싱이 끝난 뒤 실행되므로
 *   버튼(.gex-speak)이 모두 만들어진 다음에 붙습니다.
 *
 * index.html 의 TTS 설정(목소리·속도·언어)을 localStorage 로 공유해서,
 * 앱에서 고른 목소리가 교재 페이지에서도 그대로 쓰입니다.
 */
(function () {
  function eachButton(fn) {
    Array.prototype.forEach.call(document.querySelectorAll(".gex-speak"), fn);
  }
  // 브라우저가 음성 합성을 지원하지 않으면 동작하지 않는 버튼을 남기지 않습니다.
  var synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    eachButton(function (b) { b.hidden = true; });
    return;
  }
  var VOICE_URI = "", LANG = "en-US", RATE = 0.95;
  try {
    VOICE_URI = localStorage.getItem("toeic1000_ttsvoice") || "";
    LANG = localStorage.getItem("toeic1000_ttslang") || "en-US";
    var savedRate = parseFloat(localStorage.getItem("toeic1000_ttsrate"));
    if (savedRate) RATE = savedRate;
  } catch (e) {}

  function norm(s) { return String(s || "").replace(/_/g, "-").toLowerCase(); }
  function listVoices() { try { return synth.getVoices() || []; } catch (e) { return []; } }
  // 저장된 목소리가 없거나 기기에 없으면 영어 음성으로 자동 대체합니다.
  function pickVoice() {
    var v = listVoices(), i;
    for (i = 0; i < v.length; i++) if (v[i].voiceURI === VOICE_URI) return v[i];
    for (i = 0; i < v.length; i++) if (norm(v[i].lang).indexOf("en") === 0) return v[i];
    return null;
  }

  var current = null;
  function clearHl() {
    Array.prototype.forEach.call(document.querySelectorAll(".gex-speak.speaking"), function (b) {
      b.classList.remove("speaking");
    });
  }
  function stop() { try { synth.cancel(); } catch (e) {} current = null; clearHl(); }

  function speak(btn) {
    var text = btn.getAttribute("data-say") || "";
    if (!text) return;
    if (current === btn) { stop(); return; }
    stop();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = LANG || "en-US";
    var v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang || u.lang; }
    u.rate = RATE;
    u.onend = u.onerror = function () { if (current === btn) { current = null; clearHl(); } };
    current = btn;
    btn.classList.add("speaking");
    try { synth.speak(u); } catch (e) { current = null; clearHl(); }
  }

  eachButton(function (btn) {
    btn.addEventListener("click", function () { speak(btn); });
  });
  // Esc 키로도 정지합니다(index.html 과 같은 규칙).
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") stop(); });
  // 목록이 늦게 채워지는 브라우저를 위해 재생 직전마다 조회하므로 별도 보정은 필요 없습니다.
  window.addEventListener("pagehide", stop);
})();
