/* toeic.monster 앱 스크립트 — index.html 인라인에서 분리했습니다(docs/app-split-plan.md 2단계).
   index.html 은 마크업·첫 페인트 부트스트랩만 남기고, 이 파일을 <script defer src="assets/app.js"> 로 부릅니다. */
(function () {
  "use strict";

  /* ---------- 접근성: 채점 결과 알림과 초점 ---------- */
  // 정답을 고르면 보기 버튼이 곧바로 비활성화되고, 그 순간 초점은 문서(body)로 떨어집니다.
  // 그래서 ① 결과를 담는 상자는 라이브 영역(role="status")이어야 낭독되고
  // ② 초점을 잃은 경우에만 결과 상자로 초점을 옮겨 키보드 사용자가 위치를 잃지 않게 합니다.
  // 초점을 잃지 않았으면(선택 목록·입력 칸으로 답한 경우) 손대지 않습니다.
  function restoreFocusToFeedback(el) {
    if (!el) return;
    var active = document.activeElement;
    if (active && active !== document.body && active !== document.documentElement) return;
    try {
      if (typeof el.getAttribute === "function" && el.getAttribute("tabindex") !== "-1") {
        el.setAttribute("tabindex", "-1");
      }
      if (typeof el.focus === "function") el.focus({ preventScroll: true });
    } catch (e) {
      // 초점 이동은 부가 기능입니다 — 실패해도 채점 결과 표시는 그대로 두어야 합니다.
    }
  }

  // localStorage 값을 안전하게 읽습니다. 값이 없거나 손상됐거나 배열이면 빈 객체를 돌려주어
  // Object.keys(null) 같은 오류로 앱 전체가 멈추는 일을 막습니다.
  function storeObject(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || "null");
      return v && typeof v === "object" && !Array.isArray(v) ? v : {};
    } catch (e) { return {}; }
  }

  var learned = storeObject("toeic1000_learned");
  // 레거시 호환: 이전 버전은 true로 저장 → 오늘 날짜로 변환 (SRS 간격 반복용)
  (function migrateLearned() {
    var t = todayKey();
    var changed = false;
    Object.keys(learned).forEach(function (k) {
      if (learned[k] === true) { learned[k] = t; changed = true; }
    });
    if (changed) saveLearned();
  })();

  var wrongSet = storeObject("toeic1000_wrong");
  var quizWrongMode = false;
  var currentLevel = "";
  var wordLevelMap = {};
  var wordUnitMap = {};

  var favSet = storeObject("toeic1000_fav");
  var wrongCount = storeObject("toeic1000_wrongcount");

  var favFilter = false;
  var reviewFilter = false;

  // 일일 목표 · 연속 학습
  var DAILY_GOAL = 30;
  // 저장된 값이 비었거나 손상되어도 화면에 "undefined / NaN"이 뜨지 않도록 값을 검증해 채웁니다.
  function readInt(v) {
    var n = parseInt(v, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }
  function readDateKey(v) {
    return typeof v === "string" && /^\d{1,4}-\d{1,2}-\d{1,2}$/.test(v) ? v : "";
  }
  var daily = { date: "", count: 0 };
  try {
    var savedDaily = JSON.parse(localStorage.getItem("toeic1000_daily") || "null");
    if (savedDaily && typeof savedDaily === "object") {
      daily = { date: readDateKey(savedDaily.date), count: readInt(savedDaily.count) };
    }
  } catch (e) { daily = { date: "", count: 0 }; }
  var streakInfo = { last: "", count: 0 };
  try {
    var savedStreak = JSON.parse(localStorage.getItem("toeic1000_streak") || "null");
    if (savedStreak && typeof savedStreak === "object") {
      streakInfo = { last: readDateKey(savedStreak.last), count: readInt(savedStreak.count) };
    }
  } catch (e) { streakInfo = { last: "", count: 0 }; }
  var examBest = 0;
  try { examBest = parseInt(localStorage.getItem("toeic1000_exambest") || "0", 10) || 0; } catch (e) { examBest = 0; }

  // 유형별 퀴즈 통계: { 유형: { c: 정답수, w: 오답수 } }
  var quizStats = storeObject("toeic1000_quizstats");
  function recordStat(type, correct) {
    var s = quizStats[type] || { c: 0, w: 0 };
    if (correct) s.c++; else s.w++;
    quizStats[type] = s;
    try { localStorage.setItem("toeic1000_quizstats", JSON.stringify(quizStats)); } catch (e) {}
  }

  // 주간 학습 로그: { "YYYY-M-D": 학습 활동 수 }
  var weeklyLog = storeObject("toeic1000_weekly");
  function touchWeekly() {
    var t = todayKey();
    weeklyLog[t] = (weeklyLog[t] || 0) + 1;
    try { localStorage.setItem("toeic1000_weekly", JSON.stringify(weeklyLog)); } catch (e) {}
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function yesterdayKey(key) {
    var p = key.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function saveDaily() {
    try { localStorage.setItem("toeic1000_daily", JSON.stringify(daily)); } catch (e) {}
  }
  function saveStreak() {
    try { localStorage.setItem("toeic1000_streak", JSON.stringify(streakInfo)); } catch (e) {}
  }
  function touchDaily() {
    var t = todayKey();
    if (daily.date !== t) { daily.date = t; daily.count = 0; }
    daily.count++;
    touchWeekly();
    saveDaily();
    if (daily.count >= DAILY_GOAL) {
      if (streakInfo.last === yesterdayKey(t)) {
        streakInfo.count++;
      } else if (streakInfo.last !== t) {
        streakInfo.count = 1;
      }
      streakInfo.last = t;
      saveStreak();
    }
    updateDailyUI();
    updateStreakUI();
  }
  function updateDailyUI() {
    var el = document.getElementById("dailyText");
    if (!el) return;
    var t = todayKey();
    if (daily.date !== t) { daily.date = t; daily.count = 0; saveDaily(); }
    var done = daily.count >= DAILY_GOAL;
    el.textContent = daily.count + " / " + DAILY_GOAL + (done ? " ✅" : "");
  }
  function updateStreakUI() {
    var el = document.getElementById("streakText");
    if (el) el.textContent = "🔥 " + streakInfo.count + "일 연속";
  }

  var all = [];
  function collectUnits() {
    var byId = {};
    UNITS.forEach(function (u) { byId[u.id] = u; });
    window.VOCAB_UNITS = window.VOCAB_UNITS || {};
    Object.keys(window.VOCAB_UNITS).forEach(function (key) {
      var id = parseInt(key, 10);
      var u = byId[id];
      if (!u) return;
      var words = window.VOCAB_UNITS[key];
      all.push({ unit: id, title: u.title, sub: u.sub, level: u.level, icon: u.icon, words: words });
      words.forEach(function (w) { wordLevelMap[w[0]] = u.level; wordUnitMap[w[0]] = u.icon; });
    });
    all.sort(function (a, b) { return a.unit - b.unit; });
    // 전체 단어 수는 목록을 그리기 전에도 필요합니다(진행률·예상 점수 계산).
    totalCount = all.reduce(function (n, u) { return n + u.words.length; }, 0);
  }

  // ---------- TTS(음성 합성) 공통 ----------
  // 브라우저에 설치된 음성 중 영어 음성을 골라 씁니다. (기본 음성이 한국어일 때 무음/오발음 방지)
  var TTS_VOICE = null;
  // 사용자가 고른 목소리(voiceURI). 비어 있으면 영어 음성을 자동으로 고릅니다.
  var TTS_VOICE_URI = "";
  try { TTS_VOICE_URI = localStorage.getItem("toeic1000_ttsvoice") || ""; } catch (e) {}
  // 고른 음성이 없을 때 쓸 기본 언어(마지막으로 쓴 음성의 언어를 기억)
  var TTS_LANG = "en-US";
  try { TTS_LANG = localStorage.getItem("toeic1000_ttslang") || "en-US"; } catch (e) {}
  // 모바일 브라우저는 음성 목록을 첫 사용자 조작 이후에 채우거나, 여러 번에 나눠서 줍니다.
  // 그래서 "한 번만" 채우지 않고 목록이 준비될 때까지 다시 확인합니다.
  var ttsVoiceWatch = null;
  var ttsVoiceWatchTries = 0;
  var TTS_VOICE_WATCH_MAX = 40; // 0.25초 × 40 = 최대 10초

  function allVoices() {
    if (!("speechSynthesis" in window)) return [];
    try { return window.speechSynthesis.getVoices() || []; } catch (e) { return []; }
  }
  // lang 표기는 브라우저마다 en-US / en_US / en-uk 처럼 조금씩 달라서 정규화해 비교합니다.
  function voiceLang(v) {
    return String((v && v.lang) || "").replace(/_/g, "-").toLowerCase();
  }
  function isEnglishVoice(v) {
    var l = voiceLang(v);
    return l === "en" || l.indexOf("en-") === 0;
  }
  function englishVoices() {
    return allVoices().filter(isEnglishVoice);
  }
  // 목소리 추가 도움말에서 어떤 운영체제의 설정 경로를 안내할지 정합니다.
  // (navigator·document 가 없는 테스트 환경에서도 안전하도록 typeof 로 확인합니다)
  function voiceHelpPlatform() {
    var nav = (typeof navigator !== "undefined" && navigator) || null;
    var ua = "";
    var platform = "";
    try { ua = String((nav && nav.userAgent) || ""); } catch (e) {}
    try { platform = String((nav && nav.platform) || ""); } catch (e) {}
    // 아이패드는 최신 iPadOS 에서 userAgent 가 Macintosh 로 오므로 터치 지원으로 한 번 더 확인합니다.
    var touchMac = platform === "MacIntel" && typeof document !== "undefined" && !!document && "ontouchend" in document;
    if (/iPad|iPhone|iPod/.test(ua) || touchMac) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "desktop";
  }
  // 음성 목록이 갱신될 때(도움말 UI 등) 알림을 받을 콜백.
  var ttsVoiceListeners = [];
  function onTtsVoicesUpdated(fn) {
    if (typeof fn === "function") ttsVoiceListeners.push(fn);
  }
  function notifyTtsVoicesUpdated(list) {
    for (var i = 0; i < ttsVoiceListeners.length; i++) {
      try { ttsVoiceListeners[i](list); } catch (e) {}
    }
  }
  // 모바일 사파리 등은 voiceURI 가 세션마다 달라질 수 있어 이름으로도 한 번 더 찾습니다.
  function findVoiceByURI(uri) {
    if (!uri) return null;
    var voices = allVoices();
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].voiceURI === uri) return voices[i];
    }
    for (var j = 0; j < voices.length; j++) {
      if (voices[j].name === uri) return voices[j];
    }
    return null;
  }
  // 자동 선택: en-US → en-GB → en-AU → en-CA → en … 순서로 영어 음성을 고릅니다.
  function pickAutoVoice() {
    var voices = englishVoices();
    if (!voices.length) return null;
    var prefer = ["en-us", "en-gb", "en-au", "en-ca", "en"];
    for (var p = 0; p < prefer.length; p++) {
      for (var i = 0; i < voices.length; i++) {
        if (prefer[p] === "en" ? isEnglishVoice(voices[i]) : voiceLang(voices[i]).indexOf(prefer[p]) === 0) {
          return voices[i];
        }
      }
    }
    return voices[0];
  }
  // 사용자가 고른 음성이 있으면 그것을, 없거나 사라졌으면 자동 선택을 씁니다.
  // 재생 직전에 매번 다시 조회해 "고른 목소리가 기본 음성으로 재생"되는 문제를 막습니다.
  function pickEnglishVoice() {
    return findVoiceByURI(TTS_VOICE_URI) || pickAutoVoice();
  }
  // 헤더의 목소리 목록을 브라우저에 설치된 영어 음성으로 채웁니다.
  function fillVoiceSelect() {
    var sel = document.getElementById("ttsVoice");
    if (!sel) return;
    var list = englishVoices();
    if (!list.length) return; // 아직 음성 목록이 준비되지 않았으면 그대로 둡니다
    var auto = pickAutoVoice();
    var html = '<option value="">자동' + (auto && auto.name ? " (" + esc(auto.name) + ")" : "") + "</option>";
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      var label = (v.name || v.voiceURI) + (v.lang ? " · " + v.lang : "");
      html += '<option value="' + escapeAttr(v.voiceURI || v.name || "") + '">' + esc(label) + "</option>";
    }
    sel.innerHTML = html;
    sel.value = TTS_VOICE_URI;
    // 저장된 음성이 이 브라우저에 없으면 자동으로 되돌립니다.
    if (TTS_VOICE_URI && sel.value !== TTS_VOICE_URI) {
      TTS_VOICE_URI = "";
      try { localStorage.removeItem("toeic1000_ttsvoice"); } catch (e) {}
      sel.value = "";
    }
    sel.title = "발음 목소리 선택 (영어 음성 " + list.length + "개)";
  }
  // 목록과 현재 선택을 최신 음성 기준으로 다시 계산합니다.
  function refreshTtsVoices() {
    TTS_VOICE = pickEnglishVoice();
    var list = englishVoices();
    // 목록이 비어 있어도 알립니다 — “음성이 0개” 안내를 띄울 수 있어야 하기 때문입니다.
    notifyTtsVoicesUpdated(list);
    if (!list.length) return false;
    fillVoiceSelect();
    return true;
  }
  // 음성 목록이 준비될 때까지 짧은 간격으로 다시 확인합니다(모바일 대응).
  function watchTtsVoices() {
    if (!("speechSynthesis" in window)) return;
    if (refreshTtsVoices()) return;
    if (ttsVoiceWatch) return;
    ttsVoiceWatchTries = 0;
    ttsVoiceWatch = setInterval(function () {
      ttsVoiceWatchTries++;
      if (refreshTtsVoices() || ttsVoiceWatchTries >= TTS_VOICE_WATCH_MAX) {
        clearInterval(ttsVoiceWatch);
        ttsVoiceWatch = null;
      }
    }, 250);
  }
  if ("speechSynthesis" in window) {
    // 일부 브라우저는 음성 목록을 비동기로 채우므로, 준비되면 다시 고릅니다.
    try {
      window.speechSynthesis.onvoiceschanged = function () { refreshTtsVoices(); };
    } catch (e) {}
    watchTtsVoices();
    // 모바일 사파리·안드로이드 크롬은 첫 사용자 조작 뒤에야 전체 음성 목록을 내어 줍니다.
    // 조작이 들어오면 목록을 다시 확인하고, 아직 비어 있으면 무음 재생으로 TTS 잠금을 풉니다.
    var ttsUnlocked = false;
    var unlockTts = function () {
      if (ttsUnlocked) return;
      ttsUnlocked = true;
      if (!englishVoices().length) {
        try {
          var u = new SpeechSynthesisUtterance("");
          u.volume = 0;
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }
      refreshTtsVoices();
      watchTtsVoices();
    };
    document.addEventListener("pointerdown", unlockTts, { passive: true });
    document.addEventListener("touchstart", unlockTts, { passive: true });
    document.addEventListener("keydown", unlockTts);
  }
  // 사용자 설정: 발음 듣기 켜기/끄기 + 재생 속도 (localStorage 에 저장)
  var TTS_ENABLED = true;
  var TTS_RATE = 0.85;
  try { TTS_ENABLED = localStorage.getItem("toeic1000_tts") !== "off"; } catch (e) {}
  try {
    var savedRate = parseFloat(localStorage.getItem("toeic1000_ttsrate"));
    if (savedRate && savedRate > 0.3 && savedRate < 2) TTS_RATE = savedRate;
  } catch (e) {}

  // 재생 중인 문장을 화면에서 하이라이트합니다.
  var TTS_HL_SELECTORS = ".ex-text,.fc-ex,.wod-ex,.idiom-ex,.gt-ex,.quote-en,.reading-passage,.bank-q,.quiz-q,.listen-script,.dialogue-text,.dialogue-line,.w,.wod-word,.idiom-en";
  var ttsHlTimer = null;
  var ttsHlEl = null;
  // cancel() 직후 재생을 미룰 때 쓰는 타이머(모바일에서 기본 음성으로 새는 현상 방지)
  var ttsSpeakTimer = null;
  // 현재 발성이 진행 중인지 · 마지막으로 읽은 문장(같은 버튼을 다시 누르면 정지)
  var ttsActive = false;
  var ttsLastNorm = "";
  // 취소된 발성의 onend/onerror 가 뒤늦게 도착해 새 발성 상태를 망가뜨리지 않게 하는 토큰
  var ttsToken = 0;
  function setTtsStopVisible(on) {
    var b = document.getElementById("btnTtsStop");
    if (b) b.hidden = !on;
  }
  // 발성 중단 — 정지 버튼·Esc·같은 문장 재클릭에서 공통으로 씁니다.
  function stopSpeak() {
    ttsActive = false;
    ttsToken++;
    if (ttsSpeakTimer) { clearTimeout(ttsSpeakTimer); ttsSpeakTimer = null; }
    try { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); } catch (e) {}
    setTtsStopVisible(false);
    clearTTSHighlight();
  }
  function finishSpeak() {
    ttsActive = false;
    setTtsStopVisible(false);
    clearTTSHighlight();
  }
  function isSpeakingNow() {
    if (ttsActive) return true;
    try { return !!(window.speechSynthesis && window.speechSynthesis.speaking); } catch (e) { return false; }
  }
  function normSpeak(s) {
    return String(s == null ? "" : s)
      .replace(/[_＿]{2,}/g, " ")
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "") /* 이모지(서로게이트 쌍) 제거 */
      // 화면에는 남아 있지만 소리로는 읽지 않는 기호(ttsClean 과 같은 범위)를 함께 지웁니다.
      .replace(/[\u2190-\u21FF\u2300-\u27BF\u2B00-\u2BFF\u20E3\uFE0F\u200D]/g, "")
      .replace(/[★☆✓✔✕✖]/g, "")
      .replace(/[“”"'’‘]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  function clearTTSHighlight() {
    if (ttsHlTimer) { clearTimeout(ttsHlTimer); ttsHlTimer = null; }
    if (ttsHlEl && ttsHlEl.classList) ttsHlEl.classList.remove("tts-speaking");
    var olds = document.querySelectorAll(".tts-speaking");
    for (var i = 0; i < olds.length; i++) olds[i].classList.remove("tts-speaking");
    ttsHlEl = null;
  }
  function highlightSpeak(text) {
    clearTTSHighlight();
    var target = normSpeak(text);
    if (!target) return;
    var nodes = document.querySelectorAll(TTS_HL_SELECTORS);
    var loose = null;
    for (var i = 0; i < nodes.length; i++) {
      var t = normSpeak(nodes[i].textContent);
      if (t === target) { ttsHlEl = nodes[i]; break; }
      if (!loose && target.length > 3 && t.indexOf(target) !== -1) loose = nodes[i];
    }
    if (!ttsHlEl) ttsHlEl = loose;
    if (ttsHlEl) ttsHlEl.classList.add("tts-speaking");
  }

  // TTS로 읽기 전에 문장을 다듬습니다.
  // 표 구분자·화살표·빈칸·한글처럼 영어 음성이 어색하게 읽는 요소를 말로 바꾸거나 제거합니다.
  function ttsClean(text) {
    var s = String(text == null ? "" : text);
    s = s.replace(/[|｜]/g, ", ");          // 표 구분자: {쉬어 읽기}
    s = s.replace(/[→➔➜]/g, " to ");       // 범위·방향
    s = s.replace(/[←]/g, ", ");
    s = s.replace(/[~〜]|\u301C/g, " to "); // 범위 (3~5 → three to five)
    s = s.replace(/[·•※★☆◈■□●○◆◇]/g, " ");
    // 이모지·기호는 영어 음성이 "emoji"라고 읽거나 어색하게 늘어뜨립니다.
    // 특히 단어·문장 앞에 붙은 🔥✅💡 같은 표시가 함께 읽히던 문제를 없앱니다.
    // (서로게이트 쌍으로 된 그림 이모지는 아래 정규식이, 그 밖의 기호는 코드 포인트 범위가 지웁니다.)
    s = s.replace(/[\u2190-\u21FF\u2300-\u27BF\u2B00-\u2BFF\u20E3\uFE0F\u200D]/g, " ");
    s = s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, " ");
    s = s.replace(/…/g, ", ");
    s = s.replace(/\s*＿{2,}\s*/g, " blank "); // 빈칸은 blank로 읽습니다
    s = s.replace(/\s*_{2,}\s*/g, " blank ");
    // 한글·한자는 영어 음성으로 읽으면 어색하므로 제거합니다 (예: "공지문: ..."의 라벨).
    s = s.replace(/[\u3131-\u318E\uAC00-\uD7A3\u4E00-\u9FFF]+/g, " ");
    s = s.replace(/\s{2,}/g, " ");
    s = s.replace(/^[\s,;:.!?\-]+/, "");
    s = s.replace(/\s+([,.;:!?])/g, "$1");
    return s.trim();
  }

  function speakTTS(text, rate) {
    if (!TTS_ENABLED) { showToast("🔇 발음 듣기가 꺼져 있어요. 상단 🔊 버튼으로 켜 주세요."); return; }
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
    var clean = ttsClean(text);
    // 읽을 영어가 없으면(예: 한글만 있는 문장) 영어 음성으로 읽지 않습니다.
    if (!clean || !/[A-Za-z]/.test(clean)) return;
    highlightSpeak(text);
    // 같은 문장을 다시 누르면 정지할 수 있도록 마지막 문장을 기억합니다.
    ttsActive = true;
    ttsLastNorm = normSpeak(text);
    setTtsStopVisible(true);
    // 재생 직전에 현재 음성 목록에서 고른 음성을 다시 찾습니다.
    // (모바일에서는 첫 재생 전까지 목록이 비어 있어, 미리 담아 둔 음성 객체가 무시되곤 합니다)
    var voice = pickEnglishVoice();
    if (voice) TTS_VOICE = voice;
    var u = new SpeechSynthesisUtterance(clean);
    u.rate = rate || TTS_RATE;
    if (voice) {
      u.voice = voice;
      // 고른 음성의 언어를 그대로 씁니다. (en-GB 등 고른 음성이 무시되지 않도록)
      u.lang = voice.lang || TTS_LANG;
    } else {
      u.lang = TTS_LANG;
    }
    // 취소된 이전 발성의 콜백이 늦게 와도 무시하도록 토큰을 붙입니다.
    ttsToken++;
    var myToken = ttsToken;
    u.onend = function () { if (myToken === ttsToken) finishSpeak(); };
    u.onerror = function () { if (myToken === ttsToken) finishSpeak(); };
    var synth = window.speechSynthesis;
    var wasSpeaking = false;
    try { wasSpeaking = !!(synth.speaking || synth.pending); } catch (e) {}
    try { synth.cancel(); } catch (e) {}
    var start = function () { try { synth.speak(u); } catch (e) {} };
    if (ttsSpeakTimer) { clearTimeout(ttsSpeakTimer); ttsSpeakTimer = null; }
    // 안드로이드 크롬·iOS 사파리에서는 cancel() 직후 speak()를 부르면 새 발성이 무시되거나
    // 기본 목소리로 재생되는 경우가 있어, 재생 중이었다면 아주 잠깐 쉬었다가 재생합니다.
    if (wasSpeaking) {
      ttsSpeakTimer = setTimeout(function () { ttsSpeakTimer = null; start(); }, 120);
    } else {
      start();
    }
    // 안전장치: onend 가 오지 않는 환경에서도 하이라이트와 정지 버튼을 정리합니다.
    if (ttsHlTimer) clearTimeout(ttsHlTimer);
    ttsHlTimer = setTimeout(function () { if (myToken === ttsToken) finishSpeak(); }, Math.max(2000, clean.length * 120));
  }
  function speak(text) { speakTTS(text, TTS_RATE); }
  // 예문 듣기 버튼(위임 처리): data-say 속성의 문장을 읽습니다.
  // 재생 중인 문장을 다시 누르면 정지합니다(토글).
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest(".js-tts") : null;
    if (!b) return;
    var text = b.getAttribute("data-say") || "";
    if (isSpeakingNow() && ttsLastNorm && normSpeak(text) === ttsLastNorm) { stopSpeak(); return; }
    speak(text);
  });

  // 발음 듣기 토글 · 속도·목소리 컨트롤 (헤더)
  var ttsToggleBtn = document.getElementById("btnTts");
  var ttsRateSel = document.getElementById("ttsRate");
  var ttsVoiceSel = document.getElementById("ttsVoice");
  function applyTtsUI() {
    if (ttsToggleBtn) {
      ttsToggleBtn.textContent = TTS_ENABLED ? "🔊" : "🔇";
      ttsToggleBtn.classList.toggle("muted", !TTS_ENABLED);
      ttsToggleBtn.setAttribute("aria-pressed", TTS_ENABLED ? "true" : "false");
      ttsToggleBtn.title = TTS_ENABLED ? "발음 듣기 끄기" : "발음 듣기 켜기";
    }
    if (ttsRateSel) ttsRateSel.value = String(TTS_RATE);
    if (ttsVoiceSel) ttsVoiceSel.value = TTS_VOICE_URI;
    fillVoiceSelect();
  }
  if (ttsToggleBtn) ttsToggleBtn.addEventListener("click", function () {
    TTS_ENABLED = !TTS_ENABLED;
    try { localStorage.setItem("toeic1000_tts", TTS_ENABLED ? "on" : "off"); } catch (e) {}
    if (!TTS_ENABLED) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      clearTTSHighlight();
    }
    applyTtsUI();
    showToast(TTS_ENABLED ? "🔊 발음 듣기를 켰습니다." : "🔇 발음 듣기를 껐습니다.");
  });
  if (ttsRateSel) ttsRateSel.addEventListener("change", function () {
    var r = parseFloat(this.value);
    if (r && r > 0.3 && r < 2) TTS_RATE = r;
    try { localStorage.setItem("toeic1000_ttsrate", String(TTS_RATE)); } catch (e) {}
    showToast("🔊 재생 속도 " + TTS_RATE + "×");
  });
  if (ttsVoiceSel) ttsVoiceSel.addEventListener("change", function () {
    TTS_VOICE_URI = this.value || "";
    try { localStorage.setItem("toeic1000_ttsvoice", TTS_VOICE_URI); } catch (e) {}
    TTS_VOICE = pickEnglishVoice();
    if (TTS_VOICE) {
      TTS_LANG = TTS_VOICE.lang || TTS_LANG;
      try { localStorage.setItem("toeic1000_ttslang", TTS_LANG); } catch (e) {}
    }
    if (TTS_VOICE && TTS_VOICE_URI) {
      showToast("🔊 목소리: " + (TTS_VOICE.name || TTS_VOICE.lang || "선택한 음성"));
      // 고른 목소리를 바로 들어볼 수 있게 짧은 예문을 읽어 줍니다.
      if (TTS_ENABLED) speakTTS("This is a sample sentence. Let us study for the TOEIC test.", TTS_RATE);
    } else {
      showToast("🔊 목소리: 자동" + (TTS_VOICE && TTS_VOICE.name ? " (" + TTS_VOICE.name + ")" : ""));
    }
  });
  // 발음 정지 버튼 · Esc 키로도 멈출 수 있습니다.
  var ttsStopBtn = document.getElementById("btnTtsStop");
  if (ttsStopBtn) ttsStopBtn.addEventListener("click", stopSpeak);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isSpeakingNow()) stopSpeak();
  });
  applyTtsUI();

  // ---------- 목소리 추가 도움말 (음성이 적게 잡히는 휴대폰 대응) ----------
  // 목소리 목록은 이 사이트가 아니라 기기에 설치된 음성에서 오므로, 휴대폰에서는
  // 영어 음성이 1~2개만 잡힙니다. 그럴 때 OS 설정에서 음성을 설치하는 방법을 안내합니다.
  var voiceHelpBtn = document.getElementById("btnVoiceHelp");
  var voiceHelpLabel = voiceHelpBtn ? voiceHelpBtn.querySelector(".tts-voice-help-label") : null;
  var voiceHelpModal = document.getElementById("voiceHelpModal");
  var voiceHelpCountEl = document.getElementById("voiceHelpCount");
  var VOICE_HELP_MIN = 3; // 영어 음성이 이보다 적으면 도움말 버튼을 강조합니다
  var voiceHelpNotified = false;
  try { voiceHelpNotified = localStorage.getItem("toeic1000_voicehelp") === "seen"; } catch (e) {}

  // 좁은 화면에서는 목소리 목록이 ☰ 메뉴 안으로 들어가므로 안내 위치도 함께 바뀝니다.
  function voiceHelpWhereTo() {
    return window.innerWidth <= 1023 ? "☰ 메뉴 안 " : "상단 ";
  }
  // 버튼 상태·안내 문구·현재 개수를 최신 음성 목록에 맞춥니다. 찾은 개수를 돌려줍니다.
  function updateVoiceHelpUI(list) {
    var count = (list || englishVoices()).length;
    var low = count < VOICE_HELP_MIN;
    if (voiceHelpCountEl) {
      voiceHelpCountEl.innerHTML = count
        ? "이 브라우저에서 쓸 수 있는 영어 목소리: <b>" + count + "개</b>" + (low ? " · 휴대폰은 기본 설치된 음성이 적습니다" : "")
        : "영어 목소리를 아직 찾지 못했습니다. 화면을 한 번 눌러 본 뒤 <b>🔄 목소리 다시 확인</b>을 눌러 보세요.";
    }
    if (voiceHelpBtn) {
      voiceHelpBtn.classList.toggle("need", low);
      if (voiceHelpLabel) voiceHelpLabel.textContent = low ? " 목소리 추가" : " 목소리 도움말";
      voiceHelpBtn.title = low
        ? "영어 목소리가 " + count + "개뿐입니다 · 늘리는 방법 보기"
        : "발음 목소리 목록과 늘리는 방법 보기";
    }
    return count;
  }
  // 음성이 적게 잡힐 때 한 번만 알려 줍니다(같은 브라우저에서 반복되지 않게 저장합니다).
  function maybeNotifyLowVoices(count) {
    if (voiceHelpNotified || !count || count >= VOICE_HELP_MIN) return;
    if (voiceHelpModal && voiceHelpModal.classList.contains("show")) return;
    voiceHelpNotified = true;
    try { localStorage.setItem("toeic1000_voicehelp", "seen"); } catch (e) {}
    showToast("🔊 영어 목소리가 " + count + "개뿐입니다. " + voiceHelpWhereTo() + "❔를 눌러 늘려 보세요.");
  }
  function openVoiceHelp() {
    if (!voiceHelpModal) return;
    updateVoiceHelpUI();
    if (voiceHelpModal.classList.contains("show")) return;
    voiceHelpModal.classList.add("show");
    // 뒤로가기·닫기 버튼으로 닫히도록 history 항목을 빌리고, 뒤 화면 스크롤을 막습니다.
    pushMenuGuard();
    document.body.classList.add("modal-open");
    var closeBtn = document.getElementById("voiceHelpClose");
    if (closeBtn) closeBtn.focus();
  }
  function closeVoiceHelp() {
    if (!voiceHelpModal || !voiceHelpModal.classList.contains("show")) return;
    voiceHelpModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    releaseMenuGuard();
    if (voiceHelpBtn) voiceHelpBtn.focus();
  }
  // 음성을 설치한 직후 목록을 다시 조회합니다(모바일은 조작이 있어야 목록을 내어 줍니다).
  function recheckTtsVoices() {
    watchTtsVoices();
    var before = englishVoices().length;
    updateVoiceHelpUI();
    setTimeout(function () {
      var now = englishVoices().length;
      updateVoiceHelpUI();
      showToast(now > before
        ? "🔊 영어 목소리를 " + now + "개 찾았습니다."
        : "🔊 아직 영어 목소리는 " + now + "개입니다. 음성을 설치한 뒤 브라우저를 새로고침해 주세요.");
    }, 1200);
  }
  (function initVoiceHelp() {
    if (voiceHelpBtn && !("speechSynthesis" in window)) voiceHelpBtn.hidden = true;
    // 플랫폼별 안내 중 지금 쓰는 기기를 맨 위로 올리고 표시를 달아 줍니다.
    var steps = document.getElementById("voiceHelpSteps");
    if (steps) {
      var plat = voiceHelpPlatform();
      var nodes = steps.querySelectorAll("[data-platform]");
      var matched = null;
      for (var i = 0; i < nodes.length; i++) {
        var isMine = nodes[i].getAttribute("data-platform") === plat;
        var badge = nodes[i].querySelector(".voice-badge");
        if (badge) badge.hidden = !isMine;
        if (isMine) matched = nodes[i];
      }
      if (matched && steps.firstChild) steps.insertBefore(matched, steps.firstChild);
    }
    if (voiceHelpBtn) voiceHelpBtn.addEventListener("click", openVoiceHelp);
    var closeBtn = document.getElementById("voiceHelpClose");
    if (closeBtn) closeBtn.addEventListener("click", closeVoiceHelp);
    var doneBtn = document.getElementById("voiceHelpDone");
    if (doneBtn) doneBtn.addEventListener("click", closeVoiceHelp);
    var recheckBtn = document.getElementById("voiceRecheck");
    if (recheckBtn) recheckBtn.addEventListener("click", recheckTtsVoices);
    if (voiceHelpModal) {
      voiceHelpModal.addEventListener("click", function (e) { if (e.target === this) closeVoiceHelp(); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Esc") closeVoiceHelp();
    });
    // 음성 목록이 갱신될 때마다(휴대폰은 첫 조작 이후) 버튼 상태와 안내를 최신으로 맞춥니다.
    onTtsVoicesUpdated(function (list) { maybeNotifyLowVoices(updateVoiceHelpUI(list)); });
    maybeNotifyLowVoices(updateVoiceHelpUI());
  })();

  function cardHTML(u, w, idx) {
    var isLearned = !!learned[w[0]];
    var isFav = !!favSet[w[0]];
    var wc = wrongCount[w[0]] || 0;
    var li = '<div class="card ' + (isLearned ? "learned" : "") + (isFav ? " fav" : "") + '" data-word="' + escapeAttr(w[0]) + '">';
    li += '<div class="card-check"><input type="checkbox" title="외웠어요" aria-label="' + esc(w[0]) + ' 외운 단어로 표시" ' + (isLearned ? "checked" : "") + '></div>';
    li += '<div class="card-word">';
    // 영어 단어·발음기호·예문에는 lang="en" 을 붙여 화면 낭독기가 영어로 읽게 합니다.
    li += '<div class="w" lang="en">' + (u.icon ? '<span class="unit-emoji">' + u.icon + '</span>' : '') + esc(w[0]) + '</div>';
    li += '<div class="ipa" lang="en">' + esc(w[1]) + '</div>';
    li += '<div><span class="kpron">' + esc(w[2]) + '</span>';
    li += '<button class="speak" title="발음 듣기" aria-label="' + esc(w[0]) + ' 발음 듣기">🔊</button>';
    li += '<button class="fav-btn" title="내 단어장에 추가" aria-label="' + esc(w[0]) + ' 내 단어장에 추가" aria-pressed="' + (isFav ? "true" : "false") + '">' + (isFav ? "★" : "☆") + '</button></div>';
    li += '</div>';
    li += '<div class="card-body">';
    li += '<div class="mean">' + esc(w[3]) + (wc ? ' <span class="badge-wrong">🔁 오답 ' + wc + '회</span>' : '') + '</div>';
    li += '<div class="ex"><span class="ex-text" lang="en">' + esc(w[4]) + '</span> <button class="speak ex-speak" title="예문 듣기" aria-label="' + esc(w[0]) + ' 예문 듣기">🔊</button></div>';
    li += '<div class="ex-pron">' + esc(w[6]) + '</div>';
    li += '<div class="ex-ko">' + esc(w[5]) + '</div>';
    li += '</div></div>';
    return li;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escapeAttr(s) {
    return esc(s);
  }

  // 부드러운 스크롤은 prefers-reduced-motion 을 존중합니다(모션 감소 설정이면 즉시 이동).
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function scrollToEl(el, block) {
    if (!el) return;
    // 숨은 묶음(접힌 <details>) 안으로 이동하려 하면 먼저 펼칩니다.
    // 열지 않고 스크롤하면 높이가 0인 곳으로 가서 화면에 아무것도 안 보입니다.
    // 섹션으로 가는 길목이 모두 이 함수를 지나므로(칩·해시 링크·퀴즈 시작 등) 여기 한 곳만 막으면 됩니다.
    var group = el.closest ? el.closest("details.home-group") : null;
    if (group && !group.open) group.open = true;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: block || "start" });
  }

  /* 이동 중에 브라우저의 스크롤 복원(뒤로가기 처리 때 일어납니다)이 끼어들면 이동이 되감깁니다.
     목차에서 섹션을 고를 때 특히 잘 일어나므로, 도착할 때까지 몇 번 더 확인해 다시 이동합니다.
     도착하면(|top| 이 작으면) 곧바로 멈추므로 평소에는 한 번 더 확인하는 정도로 끝납니다. */
  function keepAt(el, tries) {
    if (!el) return;
    var left = tries == null ? 4 : tries;
    if (left <= 0) return;
    setTimeout(function () {
      if (Math.abs(el.getBoundingClientRect().top) < 200) return;
      scrollToEl(el, "start");
      keepAt(el, left - 1);
    }, 250);
  }

  // 예문 등 문장 옆에 붙이는 🔊 듣기 버튼 (data-say 문장을 TTS로 재생)
  function ttsBtn(text, label, extraClass) {
    var txt = String(text == null ? "" : text).trim();
    if (!txt) return "";
    var la = label || "예문 듣기";
    var cls = "tts-btn js-tts" + (extraClass ? " " + extraClass : "");
    return '<button type="button" class="' + cls + '" data-say="' + escapeAttr(txt) +
      '" title="' + escapeAttr(la) + '" aria-label="' + escapeAttr(la) + '">🔊</button>';
  }

  // 퀴즈·시험·모의고사 정답 공개 후 전체 예문 + TTS를 보여 주는 공통 블록
  function exFeedback(q) {
    if (!q || !q.example) return "";
    return '<div class="quiz-ex" lang="en">' + esc(q.example) + ttsBtn(q.example, "예문 듣기") +
      (q.exampleKo ? '<br><span class="ex-ko">' + esc(q.exampleKo) + "</span>" : "") + "</div>";
  }

  var totalCount = 0;
  // 목록을 이미 그렸는지. 첫 화면(홈)에서는 만들지 않고, 목록을 처음 열 때 한 번만 그립니다.
  var unitsRendered = false;

  /** 목록을 아직 그리지 않았으면 지금 그립니다(필터 값은 검색창에 있는 그대로). */
  function ensureUnitsRendered() {
    if (unitsRendered) return;
    var s = document.getElementById("searchInput");
    renderUnits(s ? s.value : "");
    // renderUnits 의 부수효과에 기대지 않고 여기서도 표시합니다.
    // (그리는 도중 예외가 나면 false 로 남아 다음에 다시 시도합니다.)
    unitsRendered = true;
  }

  /**
   * 목록 내용이 낡았을 때(학습 기록 초기화·불러오기 등) 비우고, 다음에 목록을 열 때 다시 그리게 합니다.
   * 이때 바로 그리지 않으므로 다른 화면을 보는 중에 1,000장 카드를 다시 만들지 않습니다.
   */
  function invalidateUnits() {
    unitsRendered = false;
    document.getElementById("units").innerHTML = "";
    // 목록을 보는 중이라면 빈 화면을 남기지 않고 바로 다시 그립니다.
    if (activeView === "units") ensureUnitsRendered();
  }

  function renderUnits(filter) {
    var container = document.getElementById("units");
    container.innerHTML = "";
    var q = (filter || "").trim().toLowerCase();

    all.forEach(function (u) {
      if (currentLevel && u.level !== currentLevel) return;
      var matches = u.words.filter(function (w) {
        if (favFilter && !favSet[w[0]]) return false;
        if (reviewFilter && !wrongSet[w[0]]) return false;
        if (!q) return true;
        return w.slice(0, 6).join(" ").toLowerCase().indexOf(q) !== -1;
      });
      if (!matches.length) return;

      var sec = document.createElement("section");
      sec.className = "unit";
      sec.id = "unit-" + u.unit;
      var lvlCls = u.level === "초급" ? "lvl-easy" : u.level === "중급" ? "lvl-mid" : "lvl-hard";
      var lvlIcon = u.level === "초급" ? "🟢" : u.level === "중급" ? "🟡" : "🔴";
      var html = '<div class="unit-head"><span class="unit-num">UNIT ' + u.unit + '</span><span class="lvl-badge ' + lvlCls + '">' + lvlIcon + " " + esc(u.level) + '</span><span class="unit-title">' + (u.icon ? '<span class="unit-emoji">' + u.icon + '</span> ' : '') + esc(u.title) + "</span></div>";
      html += '<div class="unit-sub">' + esc(u.sub) + " · 총 " + u.words.length + "개 단어</div>";
      html += '<div class="vocab-grid">';
      matches.forEach(function (w) { html += cardHTML(u, w); });
      html += "</div>";
      sec.innerHTML = html;
      container.appendChild(sec);
    });

    unitsRendered = true;
  }

  // ---------- 난이도 필터 ----------
  function levelCounts() {
    var c = { "": 0, "초급": 0, "중급": 0, "고급": 0 };
    all.forEach(function (u) { c[""] += u.words.length; c[u.level] += u.words.length; });
    return c;
  }
  function syncLevelButtons() {
    var c = levelCounts();
    var btns = document.querySelectorAll("#levelbar .lvl-btn");
    btns.forEach(function (b) {
      var lv = b.getAttribute("data-level");
      if (lv === null) return; // ⭐/🔁 필터 버튼은 건너뜀
      b.textContent = b.getAttribute("data-label") + " (" + c[lv] + ")";
      b.classList.toggle("active", currentLevel === lv);
    });
    var f = document.getElementById("btnFav");
    var r = document.getElementById("btnReview");
    if (f) f.classList.toggle("active", favFilter);
    if (r) r.classList.toggle("active", reviewFilter);
  }
  document.getElementById("levelbar").addEventListener("click", function (e) {
    var btn = e.target.closest(".lvl-btn");
    if (!btn) return;
    var lv = btn.getAttribute("data-level");
    if (btn.id === "btnFav") {
      favFilter = !favFilter;
      if (favFilter) reviewFilter = false;
    } else if (btn.id === "btnReview") {
      reviewFilter = !reviewFilter;
      if (reviewFilter) favFilter = false;
    } else if (lv !== null) {
      currentLevel = currentLevel === lv ? "" : lv;
    } else {
      return;
    }
    renderUnits(document.getElementById("searchInput").value);
    syncLevelButtons();
  });

  // ---------- 오답노트 ----------
  function wrongWords() {
    return allWords().filter(function (w) { return wrongSet[w[0]]; });
  }
  function updateWrongBadge() {
    var n = Object.keys(wrongSet).length;
    var btn = document.getElementById("quizWrong");
    if (btn) btn.textContent = "📕 오답 복습 (" + n + ")";
  }
  function saveWrong() {
    try { localStorage.setItem("toeic1000_wrong", JSON.stringify(wrongSet)); } catch (e) {}
    try { localStorage.setItem("toeic1000_wrongcount", JSON.stringify(wrongCount)); } catch (e) {}
    updateWrongBadge();
  }

  // 이벤트 위임: 체크박스, 발음 버튼
  document.getElementById("units").addEventListener("change", function (e) {
    if (e.target.matches("input[type=checkbox]")) {
      var card = e.target.closest(".card");
      var word = card.getAttribute("data-word");
      if (e.target.checked) {
        learned[word] = todayKey();
        touchDaily();
      } else {
        delete learned[word];
      }
      card.classList.toggle("learned", e.target.checked);
      saveLearned();
    }
  });
  document.getElementById("units").addEventListener("click", function (e) {
    if (e.target.classList.contains("fav-btn")) {
      var card = e.target.closest(".card");
      var word = card.getAttribute("data-word");
      if (favSet[word]) { delete favSet[word]; } else { favSet[word] = true; }
      try { localStorage.setItem("toeic1000_fav", JSON.stringify(favSet)); } catch (err) {}
      card.classList.toggle("fav", !!favSet[word]);
      e.target.textContent = favSet[word] ? "★" : "☆";
      e.target.setAttribute("aria-pressed", favSet[word] ? "true" : "false");
        if (favFilter) renderUnits(document.getElementById("searchInput").value);
    } else if (e.target.classList.contains("speak")) {
      var card = e.target.closest(".card");
      if (e.target.classList.contains("ex-speak")) {
        speak(card.querySelector(".ex-text").textContent);
      } else {
        // 단어 칸(.w)에는 유닛 이모지(📊 등)가 함께 들어 있어, 화면 글자를 그대로 읽히면
        // "이모지 + 단어"가 함께 낭독됩니다. 그래서 아이콘이 없는 원래 단어를 씁니다.
        speak(card.getAttribute("data-word") || card.querySelector(".w").textContent);
      }
    }
  });

  function saveLearned() {
    try { localStorage.setItem("toeic1000_learned", JSON.stringify(learned)); } catch (e) {}
    updateProgress();
    if (fcList.length) renderFlashProgress();
  }

  function updateProgress() {
    var done = Object.keys(learned).filter(function (k) { return learned[k]; }).length;
    var pct = totalCount ? Math.round(done / totalCount * 100) : 0;
    document.getElementById("progressText").textContent = done + " / " + totalCount;
    document.getElementById("progressFill").style.width = pct + "%";
    renderBadges();
  }

  /**
   * 「이어서 학습」이 보여 줄 순서를 만듭니다.
   *
   * 1,000단어를 유닛 순서대로 외우는 사이트라, 마지막으로 본 단어를 그 순서 안에서
   * 맨 앞으로 당겨 "보던 자리에서" 다시 시작하게 합니다. 계산만 하는 순수 함수라
   * 회귀 테스트(tools/test-home-ux.mjs)가 그대로 검증합니다.
   */
  function resumeOrder(words, learnedMap, last) {
    var fresh = words.filter(function (w) { return !learnedMap[w[0]]; });
    var at = -1;
    for (var i = 0; i < fresh.length; i++) {
      if (fresh[i][0] === last) { at = i; break; }
    }
    if (at <= 0) return fresh; // 마지막 단어가 없거나(0) 이미 이미 맨 앞이면 순서를 그대로
    return [fresh[at]].concat(fresh.slice(0, at), fresh.slice(at + 1));
  }

  // ---------- 암기 카드 모드 ----------
  var fcList = [];
  var fcIdx = 0;
  var fcShown = false;
  var isSrsMode = false;
  // 마지막으로 본 카드 — "이어서 학습"이 그 자리에서 다시 시작하게 합니다(showFlashCard 가 기록).
  var LAST_WORD_KEY = "toeic1000_lastword";
  var lastWord = "";
  try { lastWord = localStorage.getItem(LAST_WORD_KEY) || ""; } catch (e) {}
  function rememberWord(word) {
    if (!word || word === lastWord) return;
    lastWord = word;
    try { localStorage.setItem(LAST_WORD_KEY, word); } catch (e) {}
  }

  // ---------- 공통 뷰 전환 ----------
  var VIEW_IDS = ["homeView", "units", "flashcardView", "quizView", "examView", "listenView", "mockView", "diagView", "dashView"];
  var activeView = "homeView";
  var BTN_IDS = ["btnHome", "btnList", "btnFlash", "btnQuiz", "btnExam", "btnSrs", "btnListen", "btnMock", "btnDiag", "btnDash"];
  // 화면 ↔ 주소 해시. 섹션 딥링크(#units·#dashboard 같은 앵커)와 겹치지 않게 "view=" 를 붙입니다.
  var VIEW_HASH = {
    homeView: "home", units: "list", flashcardView: "flash", quizView: "quiz",
    examView: "exam", listenView: "listen", mockView: "mock", diagView: "diag", dashView: "dash"
  };
  var VIEW_BTN = {
    homeView: "btnHome", units: "btnList", flashcardView: "btnFlash", quizView: "btnQuiz",
    examView: "btnExam", listenView: "btnListen", mockView: "btnMock", diagView: "btnDiag", dashView: "btnDash"
  };
  var viewHashOf = function (viewId) { return VIEW_HASH[viewId] ? "#view=" + VIEW_HASH[viewId] : ""; };
  /** 화면 전환을 기록에 남깁니다(주소도 함께 바뀌므로 새로고침·공유에도 같은 화면이 열립니다). */
  function syncViewHistory(viewId) {
    var want = viewHashOf(viewId);
    if (!want || !window.history || typeof window.history.pushState !== "function") return;
    if (location.hash === want) return;
    try { window.history.pushState({ tbmView: viewId }, "", want); } catch (e) {}
  }
  /** 기록을 따라 화면을 옮깁니다(주소에 화면이 없으면 홈). 섹션 해시는 기존 hashchange 처리가 맡습니다. */
  function applyViewFromHistory() {
    if (!VIEW_HASH) return;
    var m = /^#view=([a-z]+)$/.exec(location.hash || "");
    if (!m) {
      if (location.hash) return; // 섹션 딥링크(#units 등)는 goToHash 가 맡습니다
      showView("homeView", VIEW_BTN.homeView, true);
      return;
    }
    var viewId = null;
    for (var k in VIEW_HASH) { if (VIEW_HASH[k] === m[1]) { viewId = k; break; } }
    if (!viewId || viewId === activeView) return;
    showView(viewId, VIEW_BTN[viewId], true);
  }
  function showView(viewId, btnId, fromHistory) {
    // 화면이 실제로 바뀔 때만 기록을 남깁니다(같은 화면을 다시 고른 경우는 제외).
    var viewChanged = viewId !== activeView;
    VIEW_IDS.forEach(function (v) {
      var el = document.getElementById(v);
      if (!el) return;
      if (v === "units" || v === "homeView") el.classList.toggle("hide", viewId !== v);
      else el.classList.toggle("show", viewId === v);
    });
    BTN_IDS.forEach(function (b) {
      var el = document.getElementById(b);
      if (!el) return;
      var on = b === btnId;
      el.classList.toggle("active", on);
      // 화면 낭독기 사용자에게 "현재 보고 있는 화면"을 알려 줍니다.
      if (on) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    // 검색·난이도 필터는 단어 목록(#units)에만 적용됩니다.
    // 다른 화면(퀴즈·암기·시험 등)에 보이면 눌러도 아무 일이 없어 고장으로 보이므로 그 화면에서는 숨깁니다.
    var sb = document.querySelector(".searchbar");
    if (sb) sb.style.display = viewId === "units" ? "" : "none";
    var bi = document.querySelector(".book-intro");
    if (bi) bi.style.display = viewId === "homeView" ? "none" : "";
    activeView = viewId;
    // 화면 전환을 브라우저 기록에 남깁니다 — 뒤로가기가 이전 화면으로 돌아갑니다.
    if (viewChanged && !fromHistory) syncViewHistory(viewId);
    // 화면을 옮길 때는 맨 위로. 모션 감소 설정이면 애니메이션 없이 즉시 이동합니다.
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function enterFlash() {
    isSrsMode = false;
    fcList = all.reduce(function (arr, u) { return arr.concat(u.words); }, []);
    shuffle(fcList);
    fcIdx = 0;
    fcShown = false;
    showFlashCard();
    showView("flashcardView", "btnFlash");
  }

  /** 이어서 학습 — 마지막으로 본 카드부터, 아직 안 외운 단어를 유닛 순서대로 이어 갑니다. */
  function enterResume() {
    isSrsMode = false;
    var list = resumeOrder(allWords(), learned, lastWord);
    if (!list.length) {
      showToast("🎉 1,000단어를 모두 외웠어요! 오늘의 복습으로 점검해 보세요.");
      enterSrs();
      return;
    }
    fcList = list;
    fcIdx = 0;
    fcShown = false;
    showFlashCard();
    showView("flashcardView", "btnFlash");
  }

  function showListView() {
    // 목록 화면에 처음 들어올 때만 1,000장 카드를 만듭니다.
    ensureUnitsRendered();
    showView("units", "btnList");
  }

  function exitFlash() {
    showListView();
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
  }

  function showFlashCard() {
    if (!fcList.length) return;
    var w = fcList[fcIdx];
    rememberWord(w[0]);
    document.getElementById("fcWord").textContent = w[0];
    document.getElementById("fcIpa").textContent = w[1];
    document.getElementById("fcKpron").textContent = w[2];
    var lv = wordLevelMap[w[0]] || "";
    var lvText = lv === "초급" ? "🟢 초급" : lv === "중급" ? "🟡 중급" : lv === "고급" ? "🔴 고급" : "";
    var unitIco = wordUnitMap[w[0]] || "";
    document.getElementById("fcLevel").textContent = (unitIco ? unitIco + " " : "") + lvText;
    var show = fcShown;
    document.getElementById("fcMean").style.display = show ? "block" : "none";
    document.getElementById("fcMean").textContent = show ? w[3] : "";
    document.getElementById("fcEx").style.display = show ? "block" : "none";
    document.getElementById("fcEx").textContent = show ? "“" + w[4] + "”" : "";
    document.getElementById("fcExPron").style.display = show ? "block" : "none";
    document.getElementById("fcExPron").textContent = show ? w[6] : "";
    document.getElementById("fcExKo").style.display = show ? "block" : "none";
    document.getElementById("fcExKo").textContent = show ? w[5] : "";
    var favBtn = document.getElementById("fcFav");
    if (favBtn) favBtn.textContent = favSet[w[0]] ? "★ 단어장에서 빼기" : "☆ 단어장에 추가";
    renderFlashProgress();
  }

  function renderFlashProgress() {
    document.getElementById("fcProgress").textContent =
      (fcIdx + 1) + " / " + fcList.length + " · 남은 단어 " + (fcList.length - fcIdx - 1);
  }

  function flipFlashCard() {
    fcShown = !fcShown;
    showFlashCard();
    // 카드를 뒤집어 예문이 보이면 예문을 자동 재생합니다.
    if (fcShown && fcList.length && TTS_ENABLED) speak(fcList[fcIdx][4]);
    var card = document.getElementById("fcCard");
    if (card) card.setAttribute("aria-pressed", fcShown ? "true" : "false");
  }
  document.getElementById("fcCard").addEventListener("click", flipFlashCard);
  // 키보드만으로도 카드를 뒤집을 수 있게 합니다.
  document.getElementById("fcCard").addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      flipFlashCard();
    }
  });
  document.getElementById("fcNext").addEventListener("click", function () {
    if (!fcList.length) return;
    fcIdx = (fcIdx + 1) % fcList.length;
    fcShown = false;
    showFlashCard();
  });
  document.getElementById("fcPrev").addEventListener("click", function () {
    if (!fcList.length) return;
    fcIdx = (fcIdx - 1 + fcList.length) % fcList.length;
    fcShown = false;
    showFlashCard();
  });
  document.getElementById("fcShuffle").addEventListener("click", function () {
    shuffle(fcList);
    fcIdx = 0;
    fcShown = false;
    showFlashCard();
  });
  document.getElementById("fcMark").addEventListener("click", function () {
    if (!fcList.length) return;
    var w = fcList[fcIdx];
    var previousDate = learned[w[0]];
    if (!previousDate) touchDaily();
    if (isSrsMode && previousDate) {
      // 복습 완료는 오늘을 기준으로 다음 1일 주기를 시작합니다.
      learned[w[0]] = todayKey();
    } else {
      learned[w[0]] = todayKey();
    }
    saveLearned();
    fcIdx = (fcIdx + 1) % fcList.length;
    fcShown = false;
    showFlashCard();
  });
  document.getElementById("fcFav").addEventListener("click", function () {
    if (!fcList.length) return;
    var w = fcList[fcIdx];
    if (favSet[w[0]]) { delete favSet[w[0]]; } else { favSet[w[0]] = true; }
    try { localStorage.setItem("toeic1000_fav", JSON.stringify(favSet)); } catch (err) {}
    this.textContent = favSet[w[0]] ? "★ 단어장에서 빼기" : "☆ 단어장에 추가";
    this.setAttribute("aria-pressed", favSet[w[0]] ? "true" : "false");
  });
  document.getElementById("fcListen").addEventListener("click", function () {
    if (!fcList.length) return;
    speak(fcList[fcIdx][4]);
  });

  // ---------- 퀴즈 모드 ----------
  var quizQuestions = [];
  var quizIdx = 0;
  var quizCorrect = 0;
  var quizAnswered = false;

  function allWords() {
    return all.reduce(function (arr, u) { return arr.concat(u.words); }, []);
  }

  function genQuiz(pool) {
    var len = parseInt(document.getElementById("quizLength").value, 10);
    var type = document.getElementById("quizType").value;
    var copy = pool.slice();
    shuffle(copy);
    var picked = copy.slice(0, Math.min(len, copy.length));
    quizQuestions = picked.map(function (w) {
      var isBlank = type === "blank";
      var answer = isBlank ? w[0] : (type === "en2ko" ? w[3] : w[0]);
      var prompt = isBlank ? blankPrompt(w) : (type === "en2ko" ? w[0] : w[3]);
      var distractors = [];
      var attempts = 0;
      while (distractors.length < 3 && attempts < 800) {
        attempts++;
        var d = pool[Math.floor(Math.random() * pool.length)];
        var dv = isBlank ? d[0] : (type === "en2ko" ? d[3] : d[0]);
        if (dv !== answer && distractors.indexOf(dv) === -1) distractors.push(dv);
      }
      var options = [answer].concat(distractors);
      shuffle(options);
      return { word: w[0], prompt: prompt, answer: answer, options: options, example: w[4], exampleKo: w[5] };
    });
  }

  function startQuiz(wrongOnly) {
    quizWrongMode = !!wrongOnly;
    quizIdx = 0;
    quizCorrect = 0;
    var pool = quizWrongMode ? wrongWords() : allWords();
    if (!pool.length) {
      document.getElementById("quizBox").innerHTML =
        '<div class="quiz-result"><p>📕 오답노트가 비어 있어요! 🎉<br>퀴즈에서 틀린 단어가 자동으로 오답노트에 저장됩니다.</p></div>';
      return;
    }
    genQuiz(pool);
    renderQuiz();
  }

  function renderQuiz() {
    quizAnswered = false;
    var q = quizQuestions[quizIdx];
    var html = '<div class="quiz-progress">문제 ' + (quizIdx + 1) + " / " + quizQuestions.length + " · 현재 정답 " + quizCorrect + "개</div>";
    html += '<div class="quiz-q">' + esc(q.prompt) + '</div>';
    q.options.forEach(function (opt) {
      html += '<button class="quiz-opt">' + esc(opt) + '</button>';
    });
    html += '<div class="quiz-feedback" id="quizFeedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    html += '<div class="quiz-next-wrap"><button class="btn quiz-btn" id="quizNext" style="display:none">다음 ▶</button></div>';
    document.getElementById("quizBox").innerHTML = html;
  }

  function answerQuiz(btn) {
    quizAnswered = true;
    var q = quizQuestions[quizIdx];
    var opts = document.querySelectorAll("#quizBox .quiz-opt");
    var isCorrect = btn.textContent === q.answer;
    var correctBtn = null;
    opts.forEach(function (o) {
      if (o.textContent === q.answer) correctBtn = o;
    });
    if (isCorrect) {
      btn.classList.add("correct");
      quizCorrect++;
      recordStat("quiz_" + document.getElementById("quizType").value, true);
      if (wrongSet[q.word]) { delete wrongSet[q.word]; saveWrong(); }
    } else {
      btn.classList.add("wrong");
      wrongSet[q.word] = true;
      wrongCount[q.word] = (wrongCount[q.word] || 0) + 1;
      recordStat("quiz_" + document.getElementById("quizType").value, false);
      saveWrong();
      if (correctBtn) correctBtn.classList.add("correct");
    }
    opts.forEach(function (o) { o.disabled = true; });
    var quizFb = document.getElementById("quizFeedback");
    quizFb.innerHTML =
      (isCorrect ? "정답입니다! 🎉" : "오답입니다. 정답: " + esc(q.answer)) + exFeedback(q);
    restoreFocusToFeedback(quizFb);
    var nextBtn = document.getElementById("quizNext");
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = (quizIdx === quizQuestions.length - 1) ? "결과 보기 📊" : "다음 ▶";
  }

  function showQuizResult() {
    markQuest("quiz");
    var total = quizQuestions.length;
    var pct = Math.round(quizCorrect / total * 100);
    var msg = pct === 100 ? "완벽해요! 🏆" : pct >= 80 ? "훌륭해요! 🌟" : pct >= 60 ? "잘하고 있어요! 👍" : "복습이 필요해요! 📚";
    var wrongBtn = Object.keys(wrongSet).length
      ? '<button class="btn" id="quizWrongBtn">📕 오답 복습하기 (' + Object.keys(wrongSet).length + ')</button>'
      : "";
    document.getElementById("quizBox").innerHTML =
      '<div class="quiz-result">' +
      '<div class="score">' + quizCorrect + " / " + total + '</div>' +
      '<p>정답률 ' + pct + "% · " + msg + '</p>' +
      '<div class="fc-controls" style="justify-content:center">' +
      '<button class="btn" id="quizRestart">🔁 다시 풀기</button>' +
      wrongBtn +
      '<button class="btn" id="quizBack">📖 목록으로</button>' +
      '</div></div>';
  }

  function enterQuiz() {
    document.getElementById("quizBox").innerHTML =
      '<div class="quiz-result"><p>문제 유형과 개수를 선택하고 🎯 시작 버튼을 눌러 주세요!</p></div>';
    showView("quizView", "btnQuiz");
  }

  document.getElementById("btnQuiz").addEventListener("click", enterQuiz);
  document.getElementById("quizStart").addEventListener("click", function () {
    startQuiz(false);
  });
  document.getElementById("quizWrong").addEventListener("click", function () {
    startQuiz(true);
  });
  document.getElementById("quizBox").addEventListener("click", function (e) {
    if (e.target.classList.contains("quiz-opt") && !quizAnswered) {
      answerQuiz(e.target);
    } else if (e.target.id === "quizNext") {
      quizIdx++;
      if (quizIdx >= quizQuestions.length) {
        showQuizResult();
      } else {
        renderQuiz();
      }
    } else if (e.target.id === "quizRestart") {
      startQuiz(quizWrongMode);
    } else if (e.target.id === "quizWrongBtn") {
      startQuiz(true);
    } else if (e.target.id === "quizBack") {
      showListView();
    }
  });

  // ---------- 상단 버튼 / 검색 ----------
  document.getElementById("btnList").addEventListener("click", exitFlash);
  document.getElementById("btnFlash").addEventListener("click", enterFlash);

  var searchTimer = null;
  document.getElementById("searchInput").addEventListener("input", function () {
    clearTimeout(searchTimer);
    var self = this;
    searchTimer = setTimeout(function () { renderUnits(self.value); }, 150);
  });

  // ---------- 상단바 메뉴: 모바일 ☰ · 데스크톱 ⋯ 더 보기 ----------
  // 두 패널 모두 "항목을 고르면 닫히고, 발음 설정을 만지는 동안에는 열어 둡니다".
  var menuBtn = document.getElementById("btnMenu");
  var navEl = document.getElementById("topbarNav");
  var moreBtn = document.getElementById("btnMore");
  var moreEl = document.getElementById("topbarMore");

  function setExpanded(btn, open, onLabel, offLabel) {
    if (!btn) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (onLabel && offLabel) btn.setAttribute("aria-label", open ? onLabel : offLabel);
  }

  /* 뒤로가기 한 번은 "열린 메뉴·창 닫기"로 씁니다.
     예전에는 메뉴를 열어 둔 채 뒤로가기를 누르면 곧바로 사이트를 떠내려갔습니다.
     메뉴·안내 창을 열 때 history 항목을 하나(처음 열 때만) 빌려 두고, 다 닫으면 스스로 되돌려놓습니다.
     주소는 그대로이므로 화면은 바뀌지 않고, 뒤로가기가 "닫기"와 같은 역할을 합니다. */
  var guardDepth = 0;   // 지금 열려 있는 패널(메뉴) 개수
  var guardPushed = false;
  // 우리가 빌린 기록 항목을 되돌리는 중인가 — 이때 오는 popstate 로는 화면을 바꾸지 않습니다.
  var suppressViewHistory = false;
  // 기록 복원 뒤에 이동할 섹션(목차에서 고른 섹션) — 복원이 스크롤을 덮어쓰기 때문입니다.
  var pendingHistoryScroll = null;
  function anyMenuOpen() {
    return !!((navEl && navEl.classList.contains("open")) || (moreEl && moreEl.classList.contains("open")));
  }
  function pushMenuGuard() {
    guardDepth++;
    if (guardPushed || !window.history || typeof window.history.pushState !== "function") return;
    try { window.history.pushState({ tbmDialog: 1 }, ""); guardPushed = true; } catch (e) {}
  }
  function releaseMenuGuard() {
    guardDepth = Math.max(0, guardDepth - 1);
    if (guardDepth > 0 || !guardPushed) return;
    guardPushed = false;
    suppressViewHistory = true;
    holdScrollRestore();
    try { window.history.back(); } catch (e) { suppressViewHistory = false; releaseScrollRestore(); }
  }

  /* 빌린 기록 항목을 되돌려줄 때는 브라우저의 스크롤 복원을 잠시 꺼 둡니다.
     복원은 popstate 뒤에 적용되는데, 목차에서 고른 섹션으로 가는 이동이 그때 되감겨
     화면이 제자리로 돌아오는 일이 있었습니다(약 절반 재현). popstate 안에서 곧바로
     auto 로 되돌리면 그 복원이 다시 살아나므로, 우리 이동이 끝난 뒤(scrollend) 풀어 줍니다. */
  function holdScrollRestore() {
    if (window.history && "scrollRestoration" in window.history) {
      try { window.history.scrollRestoration = "manual"; } catch (e) {}
    }
  }
  function releaseScrollRestore() {
    if (window.history && window.history.scrollRestoration !== "auto") {
      try { window.history.scrollRestoration = "auto"; } catch (e) {}
    }
  }
  // 뒤로가기가 우리가 빌린 항목을 소비한 경우 — 다시 되돌리지 않습니다.
  function consumeMenuGuard() {
    guardPushed = false;
    guardDepth = 0;
  }

  function openNav() {
    if (!navEl) return;
    navEl.classList.add("open");
    setExpanded(menuBtn, true, "메뉴 닫기", "메뉴 열기");
    if (menuBtn) menuBtn.textContent = "✕";
    document.body.classList.add("menu-open");
    pushMenuGuard();  // 뒤로가기 한 번을 "메뉴 닫기"로 쓰기 위해 history 항목을 빌립니다
    // 키보드 사용자가 바로 항목을 고를 수 있도록 첫 항목으로 초점을 옮깁니다.
    var first = navEl.querySelector(".btn");
    if (first && document.activeElement !== first) {
      try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    }
  }
  function closeNav(fromHistory, keepFocus) {
    var wasOpen = !!(navEl && navEl.classList.contains("open"));
    if (navEl) navEl.classList.remove("open");
    setExpanded(menuBtn, false, "메뉴 닫기", "메뉴 열기");
    if (menuBtn) menuBtn.textContent = "☰";
    if (!moreEl || !moreEl.classList.contains("open")) document.body.classList.remove("menu-open");
    // 초점이 메뉴 안에 남아 있으면 여는 버튼으로 돌려놓습니다(초점을 잃으면 키보드 사용자가 헤맵니다).
    // 단, 항목을 골라서 닫힌 경우에는 그 항목이 이끄는 화면으로 시선이 가야 하므로 건드리지 않습니다.
    if (!keepFocus && navEl && navEl.contains(document.activeElement)) {
      if (menuBtn && menuBtn.focus) { try { menuBtn.focus({ preventScroll: true }); } catch (e) {} }
    }
    if (fromHistory) consumeMenuGuard();
    else if (wasOpen) releaseMenuGuard();
  }
  function closeMore(fromHistory) {
    var wasOpen = !!(moreEl && moreEl.classList.contains("open"));
    if (moreEl) moreEl.classList.remove("open");
    setExpanded(moreBtn, false);
    if (!navEl || !navEl.classList.contains("open")) document.body.classList.remove("menu-open");
    if (fromHistory) consumeMenuGuard();
    else if (wasOpen) releaseMenuGuard();
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (navEl.classList.contains("open")) closeNav(); else openNav();
    });
  }
  if (moreBtn) {
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = moreEl.classList.toggle("open");
      setExpanded(moreBtn, open);
      if (open) pushMenuGuard(); else releaseMenuGuard();
    });
  }
  document.addEventListener("click", function (e) {
    if (moreEl && moreEl.classList.contains("open")) {
      // 버튼을 고르면 닫고, 속도·목소리 같은 설정을 만지는 중에는 열어 둡니다.
      var choseMore = !!(e.target.closest && e.target.closest(".topbar-more .btn"));
      if (!moreEl.contains(e.target) || choseMore) closeMore(false, choseMore);
    }
    if (navEl && navEl.classList.contains("open")) {
      var choseNav = !!(e.target.closest && e.target.closest(".topbar-nav .btn"));
      if (!navEl.contains(e.target) || choseNav) closeNav(false, choseNav);
    }
  });
  document.addEventListener("keydown", function (e) {
    // Esc 로 열린 메뉴를 닫습니다(발음 정지와 같은 키).
    if (e.key === "Escape" || e.key === "Esc") { closeNav(); closeMore(); }
  });
  // 브라우저·기기 뒤로가기: 메뉴가 열려 있으면 "닫기"로 소비하고 화면은 그대로 둡니다.
  window.addEventListener("popstate", function () {
    // 우리가 빌린 항목을 돌려주는 중이면 화면은 그대로 두고 주소만 현재 화면에 맞춥니다.
    if (suppressViewHistory) {
      suppressViewHistory = false;
      var wantHash = viewHashOf(activeView);
      if (wantHash && location.hash !== wantHash && window.history.replaceState) {
        try { window.history.replaceState({ tbmView: activeView }, "", wantHash); } catch (e) {}
      }
      if (pendingHistoryScroll) {
        var scrollTarget = pendingHistoryScroll;
        pendingHistoryScroll = null;
        // 복원이 이 뒤에 적용되므로, 이동이 끝난 것을 보고 나서 복원을 다시 켜 둡니다.
        setTimeout(function () {
          scrollToEl(scrollTarget, "start");
          if ("onscrollend" in window) window.addEventListener("scrollend", releaseScrollRestore, { once: true });
          setTimeout(releaseScrollRestore, 1200);
        }, 0);
      } else {
        releaseScrollRestore();
      }
      return;
    }
    releaseScrollRestore();
    // 안내 창도 뒤로가기로 닫아 줍니다(상단바 메뉴와 같은 규칙).
    var guideEl = document.getElementById("guideModal");
    var voiceEl = document.getElementById("voiceHelpModal");
    var tocEl = document.getElementById("tocModal");
    var openModal = !!(guideEl && guideEl.classList.contains("show")) ||
      !!(voiceEl && voiceEl.classList.contains("show")) ||
      !!(tocEl && tocEl.classList.contains("show"));
    if (!anyMenuOpen() && !openModal) {   // 열린 것이 없으면 화면 전환 기록을 따라갑니다
      applyViewFromHistory();
      return;
    }
    if (navEl && navEl.classList.contains("open")) closeNav(true);
    if (moreEl && moreEl.classList.contains("open")) closeMore(true);
    if (openModal) { closeGuide(); closeVoiceHelp(); closeToc(); }
    consumeMenuGuard();
  });
  // 창 크기가 바뀌어 드롭다운이 사라지는 쪽으로 넘어가면 함께 닫습니다.
  //   · 넓어져 ☰ 가 사라지면(데스크톱) ☰ 메뉴를 닫습니다.
  //   · 반대로 ⋯ 더 보기 패널을 열어 둔 채 좁히면 패널은 ☰ 메뉴 안으로 합쳐져 안 보이는데,
  //     "열림" 상태로 남아 뒤로가기 항목을 붙들고 있었습니다(한 번 눌러도 아무 일이 없음).
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1023 && navEl && navEl.classList.contains("open")) closeNav();
    if (window.innerWidth <= 1023 && moreEl && moreEl.classList.contains("open")) closeMore();
  });

  // ---------- 홈 랜딩 ----------
  function goUnit(id) {
    currentLevel = "";
    favFilter = false;
    reviewFilter = false;
    var searchEl = document.getElementById("searchInput");
    // 검색어가 걸려 있었거나 목록을 아직 그리지 않았다면 다시 그려야 합니다.
    // 그 외에는 이미 그려진 1,000장 카드를 그대로 두어 이동이 즉시 끝나게 합니다.
    var needsRender = !unitsRendered || !!(searchEl && searchEl.value);
    if (searchEl && searchEl.value) searchEl.value = "";
    if (needsRender) renderUnits("");
    syncLevelButtons();
    showListView();
    var sec = document.getElementById("unit-" + id);
    // 유닛은 문서 아래쪽에 있어 부드러운 스크롤이 수 초 걸립니다.
    // 뷰를 바꾸는 이동이므로 즉시 이동해 기다림 없이 내용을 보여 줍니다.
    if (sec) sec.scrollIntoView({ behavior: "auto", block: "start" });
  }

  var wordOfDay = [];
  var wordOfDayKey = "";
  function pickTodayWords(forceRandom) {
    var t = todayKey();
    if (forceRandom || wordOfDayKey !== t) {
      wordOfDayKey = t;
      var pool = allWords().slice();
      if (forceRandom) {
        shuffle(pool);
      } else {
        // 날짜 기반 시드 → 매일 같은 5단어
        var seed = 0;
        for (var i = 0; i < t.length; i++) seed = (seed * 31 + t.charCodeAt(i)) >>> 0;
        var rng = function () {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        for (var j = pool.length - 1; j > 0; j--) {
          var k = Math.floor(rng() * (j + 1));
          var tmp = pool[j]; pool[j] = pool[k]; pool[k] = tmp;
        }
      }
      wordOfDay = pool.slice(0, 5);
    }
    renderWordOfDay();
  }
  function renderWordOfDay() {
    var grid = document.getElementById("wordOfDayGrid");
    if (!grid) return;
    grid.innerHTML = "";
    wordOfDay.forEach(function (w) {
      var learnedTag = learned[w[0]] ? '<span class="tag tag-green">✅ 외움</span>' : "";
      var favTag = favSet[w[0]] ? '<span class="tag tag-yellow">⭐ 단어장</span>' : "";
      var done = !!learned[w[0]];
      var isFav = !!favSet[w[0]];
      var card = document.createElement("div");
      card.className = "word-of-day";
      card.innerHTML =
        '<div class="wod-top">' +
        '<span class="wod-word" lang="en">' + esc(w[0]) + '</span>' +
        '<span class="wod-tags">' + learnedTag + favTag + '</span>' +
        '<span class="wod-actions">' +
        '<button type="button" class="wod-btn' + (done ? " on" : "") + '" data-act="learn" title="외웠어요 표시">' + (done ? "✅" : "⬜") + '</button>' +
        '<button type="button" class="wod-btn' + (isFav ? " on" : "") + '" data-act="fav" title="내 단어장에 추가">' + (isFav ? "★" : "☆") + '</button>' +
        '<button type="button" class="speak" title="발음 듣기">🔊</button>' +
        '</span>' +
        '</div>' +
        '<div class="wod-ipa"><span lang="en">' + esc(w[1]) + '</span> · <span class="wod-kpron">' + esc(w[2]) + '</span></div>' +
        '<div class="wod-mean">' + esc(w[3]) + '</div>' +
        '<div class="wod-ex" lang="en">' + esc(w[4]) + ttsBtn(w[4], "예문 듣기") + '</div>' +
        '<div class="wod-exko">' + esc(w[5]) + '</div>';
      grid.appendChild(card);
    });
  }

  function renderQuotes() {
    var feat = document.getElementById("quoteFeatured");
    var grid = document.getElementById("quoteGrid");
    if (!feat || !grid) return;
    var idx = dayOfYearNow() % QUOTES.length;
    var q = QUOTES[idx];
    feat.innerHTML =
      '<span class="quote-mark">“</span>' +
      '<p class="quote-en" lang="en">' + esc(q.en) + ttsBtn(q.en, "문장 듣기", "on-dark") + '</p>' +
      '<p class="quote-ko">' + esc(q.ko) + '</p>' +
      '<p class="quote-author">— ' + esc(q.author) + '</p>';
    grid.innerHTML = "";
    QUOTES.forEach(function (q2, i) {
      if (i === idx) return;
      var d = document.createElement("div");
      d.className = "quote-card";
      d.innerHTML =
        '<p class="quote-en" lang="en">' + esc(q2.en) + ttsBtn(q2.en, "문장 듣기") + '</p>' +
        '<p class="quote-ko">' + esc(q2.ko) + '</p>' +
        '<p class="quote-author">— ' + esc(q2.author) + '</p>';
      grid.appendChild(d);
    });
  }

  // 오늘의 단어 원클릭 (외움 / 단어장)
  var wodGridEl = document.getElementById("wordOfDayGrid");
  if (wodGridEl) wodGridEl.addEventListener("click", function (e) {
    var card = e.target.closest(".word-of-day");
    if (!card) return;
    var word = card.querySelector(".wod-word").textContent;
    var actBtn = e.target.closest("[data-act]");
    if (actBtn) {
      var act = actBtn.getAttribute("data-act");
      if (act === "learn") {
        if (learned[word]) { delete learned[word]; } else { learned[word] = todayKey(); touchDaily(); }
        saveLearned();
        renderWordOfDay();
      } else if (act === "fav") {
        if (favSet[word]) { delete favSet[word]; } else { favSet[word] = true; }
        try { localStorage.setItem("toeic1000_fav", JSON.stringify(favSet)); } catch (err) {}
        renderWordOfDay();
      }
      return;
    }
    if (e.target.classList.contains("speak")) speak(word);
  });

  // 쉬어가는 코너: 오늘의 학습 동기 위젯
  function renderMotivation() {
    var msg = document.getElementById("motivateMsg");
    var num = document.getElementById("motivateNum");
    var bar = document.getElementById("motivateBar");
    var card = document.getElementById("motivateCard");
    if (!msg || !num || !bar || !card) return;
    var pct = Math.min(100, Math.round(daily.count / DAILY_GOAL * 100));
    num.textContent = daily.count + " / " + DAILY_GOAL;
    bar.style.width = pct + "%";
    var m;
    if (daily.count === 0) m = "아직 시작 전이에요. 명언을 마음에 새기고 첫 단어부터! 💪";
    else if (daily.count < DAILY_GOAL) m = "오늘 " + daily.count + "개 완료! 목표까지 " + (DAILY_GOAL - daily.count) + "개 남았어요.";
    else m = "오늘 목표 달성! 🎉 꾸준함이 곧 실력이에요.";
    msg.textContent = m;
    card.classList.toggle("done", daily.count >= DAILY_GOAL);
  }
  var mq = document.getElementById("motivateQuiz");
  if (mq) mq.addEventListener("click", enterQuiz);
  var mf = document.getElementById("motivateFlash");
  if (mf) mf.addEventListener("click", enterFlash);

  // 오늘의 문법 팁

  function renderGrammarTip() {
    var card = document.getElementById("grammarTipCard");
    if (!card) return;
    var idx = dayOfYearNow() % GRAMMAR_TIPS.length;
    var t = GRAMMAR_TIPS[idx];
    card.innerHTML =
      '<span class="gt-tag">오늘의 문법 팁</span>' +
      '<div class="gt-rule">' + esc(t[0]) + '</div>' +
      '<div class="gt-ex" lang="en">" ' + esc(t[1]) + ' " ' + ttsBtn(t[1], "예문 듣기") + '</div>' +
      '<div class="gt-ko">' + esc(t[2]) + '</div>';
  }
  var gtm = document.getElementById("grammarTipMore");
  if (gtm) gtm.addEventListener("click", function () {
    var tab = document.querySelector('.guide-tab[data-tab="grammar"]');
    if (tab) tab.click();
    // 창을 여는 경로가 두 곳이라도 같은 규칙(뒤로가기 닫기·스크롤 고정·초점)을 타도록 openGuide 를 씁니다.
    openGuide();
  });

  // 빈출 구동사·숙어
  var IDIOMS = window.VOCAB_IDIOMS || [];
  var IDIOM_PAGE = 12;
  var idiomShown = IDIOM_PAGE;
  function renderIdioms(filter) {
    var grid = document.getElementById("idiomGrid");
    var cnt = document.getElementById("idiomCount");
    if (!grid) return;
    var q = (filter || "").trim().toLowerCase();
    var list = IDIOMS.filter(function (it) {
      if (!q) return true;
      return (it[0] + " " + it[1]).toLowerCase().indexOf(q) !== -1;
    });
    if (cnt) cnt.textContent = list.length;
    grid.innerHTML = "";
    var shown = Math.min(idiomShown, list.length);
    list.slice(0, shown).forEach(function (it) {
      var d = document.createElement("div");
      d.className = "idiom-card";
      d.innerHTML =
        '<div class="idiom-top"><span class="idiom-en" lang="en">' + esc(it[0]) + '</span><button type="button" class="speak" title="발음 듣기">🔊</button></div>' +
        '<div class="idiom-mean">' + esc(it[1]) + '</div>' +
        '<div class="idiom-ex" lang="en">' + esc(it[2]) + ttsBtn(it[2], "예문 듣기") + '</div>' +
        '<div class="idiom-exko">' + esc(it[3]) + '</div>';
      d.querySelector(".speak").addEventListener("click", function () { speak(it[0]); });
      grid.appendChild(d);
    });
    var btn = document.getElementById("idiomToggle");
    if (btn) {
      if (list.length > IDIOM_PAGE) {
        btn.style.display = "";
        btn.textContent = idiomShown >= list.length ? "▲ 접기" : "▼ 모두 보기 (" + list.length + ")";
      } else {
        btn.style.display = "none";
      }
    }
  }
  var idiomSearchEl = document.getElementById("idiomSearch");
  if (idiomSearchEl) idiomSearchEl.addEventListener("input", function () { renderIdioms(this.value); });
  var idiomToggleEl = document.getElementById("idiomToggle");
  if (idiomToggleEl) idiomToggleEl.addEventListener("click", function () {
    idiomShown = idiomShown >= IDIOMS.length ? IDIOM_PAGE : IDIOMS.length;
    renderIdioms(document.getElementById("idiomSearch").value);
  });

  // ---------- 자주 헷갈리는 혼동 어휘 ----------

  // limit — 홈 프리렌더가 "앞의 6쌍만" 심을 때 씁니다(전체 20쌍은 units/confusion.html).
  //        앱이 뜨면 인자 없이 다시 그려서 사용자는 20쌍을 그대로 봅니다.
  function renderConfusables(limit) {
    var grid = document.getElementById("confuseGrid");
    if (!grid) return;
    var list = limit ? CONFUSABLES.slice(0, limit) : CONFUSABLES;
    grid.innerHTML = list.map(function (c) {
      return '<article class="confuse-card">' +
        '<div class="confuse-head"><span class="confuse-pair" lang="en">' + esc(c.pair) + '</span><span class="confuse-tag">' + esc(c.tag) + '</span></div>' +
        '<div class="confuse-row"><div class="confuse-en" lang="en">' + esc(c.a.en) + ttsBtn(c.a.en, "예문 듣기") + '</div><div class="confuse-ko">' + esc(c.a.ko) + '</div></div>' +
        '<div class="confuse-row"><div class="confuse-en" lang="en">' + esc(c.b.en) + ttsBtn(c.b.en, "예문 듣기") + '</div><div class="confuse-ko">' + esc(c.b.ko) + '</div></div>' +
        '<div class="confuse-tip">💡 ' + esc(c.tip) + '</div>' +
        '</article>';
    }).join("");
  }

  // ---------- 접두사·어근으로 단어 확장 ----------

  function renderWordParts() {
    var grid = document.getElementById("wordpartGrid");
    if (!grid) return;
    grid.innerHTML = WORD_PARTS.map(function (w) {
      return '<article class="wordpart-card">' +
        '<div class="wordpart-top"><span class="wordpart-type">' + esc(w.type) + '</span><span class="wordpart-part">' + esc(w.part) + '</span></div>' +
        '<div class="wordpart-mean">' + esc(w.mean) + '</div>' +
        '<div class="wordpart-words">' + esc(w.words) + '</div>' +
        '<div class="wordpart-ex">' + esc(w.ex) + ttsBtn(w.ex, "예문 듣기") + '</div>' +
        '</article>';
    }).join("");
  }

  // ---------- 학습 성취 배지 ----------

  function badgeStats() {
    var learnedN = Object.keys(learned).filter(function (k) { return learned[k]; }).length;
    var total = totalCount || 0;
    var maxUnitPct = 0;
    all.forEach(function (u) {
      var d = u.words.filter(function (w) { return learned[w[0]]; }).length;
      var p = u.words.length ? d / u.words.length * 100 : 0;
      if (p > maxUnitPct) maxUnitPct = p;
    });
    var qc = 0, qw = 0, mockDone = false;
    Object.keys(quizStats).forEach(function (k) {
      qc += (quizStats[k] && quizStats[k].c) || 0;
      qw += (quizStats[k] && quizStats[k].w) || 0;
      if (k.indexOf("mock_") === 0) mockDone = true;
    });
    var quizQ = qc + qw;
    return {
      learnedN: learnedN, total: total, pct: total ? Math.round(learnedN / total * 100) : 0,
      maxUnitPct: maxUnitPct, quizQ: quizQ, quizPct: quizQ ? Math.round(qc / quizQ * 100) : 0,
      streak: streakInfo.count, best: examBest, favN: Object.keys(favSet).length, mockDone: mockDone
    };
  }
  var earnedBadges = storeObject("toeic1000_badges");
  var badgeInitDone = false;
  function saveEarnedBadges() {
    try { localStorage.setItem("toeic1000_badges", JSON.stringify(earnedBadges)); } catch (e) {}
  }
  function renderBadges() {
    var grid = document.getElementById("badgeGrid");
    if (!grid) return;
    var s = badgeStats();
    var got = 0;
    var newly = [];
    var html = "";
    BADGES.forEach(function (b) {
      var on = false;
      try { on = !!b.test(s); } catch (e) { on = false; }
      if (on) {
        got++;
        if (!earnedBadges[b.name]) newly.push(b);
        earnedBadges[b.name] = true;
      }
      html += '<div class="badge-item' + (on ? " on" : "") + '" title="' + escapeAttr(b.desc) + '">' +
        '<span class="badge-ico">' + b.ico + '</span>' +
        '<span class="badge-name">' + esc(b.name) + '</span>' +
        '<span class="badge-desc">' + esc(b.desc) + '</span>' +
        '<span class="badge-check">' + (on ? "✅ 획득" : "🔒 미달성") + '</span>' +
        '</div>';
    });
    grid.innerHTML = html;
    var summary = document.getElementById("badgeSummary");
    if (summary) summary.textContent = got + " / " + BADGES.length + " 획득";
    if (newly.length) saveEarnedBadges();
    // 첫 로딩에서는 조용히 기록만 하고, 학습 중 새로 달성했을 때만 축하 알림을 띄웁니다.
    if (badgeInitDone && newly.length) {
      var names = newly.slice(0, 3).map(function (b) { return b.ico + " " + b.name; }).join(", ");
      var more = newly.length > 3 ? " 외 " + (newly.length - 3) + "개" : "";
      showToast("🏅 새 배지 획득! " + names + more);
    }
    badgeInitDone = true;
  }

  // ---------- 혼동어휘·어근 혼합 10문제 ----------
  var mixQuiz = { q: [], idx: 0, correct: 0, answered: false, done: false };
  function shuffleArr(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pickN(pool, exclude, n) {
    var out = [];
    for (var i = 0; i < pool.length && out.length < n; i++) {
      if (exclude.indexOf(pool[i]) === -1 && out.indexOf(pool[i]) === -1) out.push(pool[i]);
    }
    return out;
  }
  function buildMixPool() {
    var pairWords = [];
    CONFUSABLES.forEach(function (c) {
      c.pair.split("/").forEach(function (w) { w = w.trim(); if (pairWords.indexOf(w) === -1) pairWords.push(w); });
    });
    var confuseQs = [];
    CONFUSABLES.forEach(function (c) {
      var pair = c.pair.split("/").map(function (s) { return s.trim(); });
      [{ s: c.a, target: pair[0], other: pair[1] }, { s: c.b, target: pair[1], other: pair[0] }].forEach(function (item) {
        var re = new RegExp("\\b" + item.target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
        if (!re.test(item.s.en)) return; // 문장에 기본형이 그대로 나온 경우만 출제
        var d = pickN(pairWords.filter(function (w) { return w !== item.target && w !== item.other; }), [item.target, item.other], 2);
        confuseQs.push({
          kind: "confuse", theme: "혼동 어휘",
          prompt: item.s.en.replace(re, "＿＿＿＿"),
          answer: item.target, options: shuffleArr([item.target, item.other].concat(d)),
          example: item.s.en, exampleKo: item.s.ko, why: c.tip
        });
      });
    });
    var partQs = WORD_PARTS.map(function (wp) {
      var others = shuffleArr(WORD_PARTS.map(function (x) { return x.mean; }).filter(function (m) { return m !== wp.mean; }));
      return {
        kind: "part", theme: "접두사·어근",
        prompt: "「" + wp.part + "」의 의미로 알맞은 것은? (" + wp.words + ")",
        answer: wp.mean, options: shuffleArr([wp.mean].concat(pickN(others, [wp.mean], 3))),
        example: wp.ex, exampleKo: "", why: wp.part + " = " + wp.mean + " · 예: " + wp.words
      };
    });
    return { confuse: shuffleArr(confuseQs), part: shuffleArr(partQs) };
  }
  function startMixQuiz() {
    var pool = buildMixPool();
    var picked = pool.confuse.slice(0, 6).concat(pool.part.slice(0, 4));
    if (picked.length < 10) picked = picked.concat(pool.confuse.slice(6)).concat(pool.part.slice(4));
    shuffleArr(picked);
    mixQuiz.q = picked.slice(0, 10);
    mixQuiz.idx = 0; mixQuiz.correct = 0; mixQuiz.answered = false; mixQuiz.done = false;
    renderMixQuiz();
  }
  function renderMixQuiz() {
    var box = document.getElementById("mixQuizBox");
    if (!box) return;
    if (mixQuiz.done) {
      var pct = mixQuiz.q.length ? Math.round(mixQuiz.correct / mixQuiz.q.length * 100) : 0;
      var msg = pct >= 80 ? "혼동어휘 감각이 좋아요! 🔥" : pct >= 50 ? "절반 이상! 오답을 다시 확인해 보세요. 💪" : "혼동어휘·어근 섹션을 먼저 복습해 보세요. 🌱";
      box.innerHTML = '<div class="bank-card"><span class="bank-label">혼동어휘·어근 결과</span><div class="bank-q">🎉 ' + mixQuiz.correct + " / " + mixQuiz.q.length + ' 정답 (' + pct + '%)</div><p class="practice-note">' + msg + '</p></div>';
      return;
    }
    if (!mixQuiz.q.length) { box.innerHTML = '<p class="practice-note">시작하기 버튼을 누르면 혼동어휘·어근에서 10문제가 나옵니다.</p>'; return; }
    var q = mixQuiz.q[mixQuiz.idx];
    box.innerHTML = '<div class="bank-card"><span class="bank-label">' + esc(q.theme) + " · " + (mixQuiz.idx + 1) + " / " + mixQuiz.q.length + '</span>' +
      '<div class="bank-q">' + esc(q.prompt) + '</div><div class="bank-options">' +
      q.options.map(function (o) { return '<button type="button" class="bank-opt">' + esc(o) + '</button>'; }).join("") +
      '</div><div class="bank-feedback" id="mixQuizFeedback" role="status" aria-live="polite" aria-atomic="true"></div></div>';
    box.querySelectorAll(".bank-opt").forEach(function (b) { b.addEventListener("click", function () { answerMixQuiz(b); }); });
  }
  function answerMixQuiz(btn) {
    if (mixQuiz.answered) return;
    mixQuiz.answered = true;
    var q = mixQuiz.q[mixQuiz.idx];
    var ok = btn.textContent === q.answer;
    if (ok) mixQuiz.correct++;
    recordStat("mix_" + q.kind, ok);
    var box = document.getElementById("mixQuizBox");
    box.querySelectorAll(".bank-opt").forEach(function (o) {
      o.disabled = true;
      if (o.textContent === q.answer) o.classList.add("correct");
      if (o === btn && !ok) o.classList.add("wrong");
    });
    var fb = document.getElementById("mixQuizFeedback");
    fb.innerHTML = (ok ? "정답입니다! 🎉 " : "오답입니다. 정답: <b>" + esc(q.answer) + "</b> ") +
      '<div class="practice-note">💡 ' + esc(q.why) + '</div>' + exFeedback(q);
    restoreFocusToFeedback(fb);
    var next = document.createElement("button");
    next.type = "button"; next.className = "btn quiz-btn"; next.style.marginTop = "10px";
    next.textContent = mixQuiz.idx + 1 >= mixQuiz.q.length ? "🏁 결과 보기" : "다음 문제 →";
    next.addEventListener("click", function () {
      mixQuiz.idx++; mixQuiz.answered = false;
      if (mixQuiz.idx >= mixQuiz.q.length) mixQuiz.done = true;
      renderMixQuiz();
    });
    fb.appendChild(next);
  }
  var mixQuizStartEl = document.getElementById("mixQuizStart");
  if (mixQuizStartEl) mixQuizStartEl.addEventListener("click", startMixQuiz);

  // ---------- 혼동어휘 받아쓰기 ----------
  var CONFUSE_SENTENCES = [];
  CONFUSABLES.forEach(function (c) {
    CONFUSE_SENTENCES.push({ en: c.a.en, ko: c.a.ko, pair: c.pair });
    CONFUSE_SENTENCES.push({ en: c.b.en, ko: c.b.ko, pair: c.pair });
  });
  var cdIdx = 0;
  function cdNorm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9'\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function cdScore(input, target) {
    var a = cdNorm(input).split(" ").filter(Boolean);
    var b = cdNorm(target).split(" ").filter(Boolean);
    if (!b.length) return 0;
    var n = Math.min(a.length, b.length), m = 0;
    for (var i = 0; i < n; i++) if (a[i] === b[i]) m++;
    return Math.round(m / b.length * 100);
  }
  function cdReset() {
    var inp = document.getElementById("cdInput");
    if (inp) inp.value = "";
    var fb = document.getElementById("cdFeedback");
    if (fb) fb.textContent = CONFUSE_SENTENCES.length ? "🔊 듣기 버튼을 누르고 들리는 문장을 입력해 보세요." : "";
  }
  function cdCheck() {
    var inp = document.getElementById("cdInput");
    var fb = document.getElementById("cdFeedback");
    if (!inp || !fb) return;
    var target = CONFUSE_SENTENCES[cdIdx];
    if (!target) return;
    var val = inp.value || "";
    if (!val.trim()) { fb.textContent = "문장을 먼저 입력해 주세요."; return; }
    var score = cdScore(val, target.en);
    var ok = score >= 90;
    recordStat("confuse_dict", ok);
    fb.innerHTML = (ok ? "🎉 거의 완벽해요! " : "✍️ ") + "일치도 <b>" + score + "%</b>" +
      '<div class="listen-script">🔊 ' + esc(target.en) + ttsBtn(target.en, "정답 듣기") + '<br>💬 ' + esc(target.ko) + '</div>';
  }
  var cdPlayEl = document.getElementById("cdPlay");
  if (cdPlayEl) cdPlayEl.addEventListener("click", function () { var t = CONFUSE_SENTENCES[cdIdx]; if (t) speak(t.en); });
  var cdSlowEl = document.getElementById("cdSlow");
  if (cdSlowEl) cdSlowEl.addEventListener("click", function () { var t = CONFUSE_SENTENCES[cdIdx]; if (t) speakTTS(t.en, 0.65); });
  var cdNextEl = document.getElementById("cdNext");
  if (cdNextEl) cdNextEl.addEventListener("click", function () { if (CONFUSE_SENTENCES.length) cdIdx = (cdIdx + 1) % CONFUSE_SENTENCES.length; cdReset(); });
  var cdRevealEl = document.getElementById("cdReveal");
  if (cdRevealEl) cdRevealEl.addEventListener("click", function () {
    var fb = document.getElementById("cdFeedback"); var t = CONFUSE_SENTENCES[cdIdx];
    if (fb && t) fb.innerHTML = '<div class="listen-script">👁 정답: ' + esc(t.en) + ttsBtn(t.en, "정답 듣기") + '<br>💬 ' + esc(t.ko) + " <small>(" + esc(t.pair) + ")</small></div>";
  });
  var cdCheckEl = document.getElementById("cdCheck");
  if (cdCheckEl) cdCheckEl.addEventListener("click", cdCheck);
  var cdInputEl = document.getElementById("cdInput");
  if (cdInputEl) cdInputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); cdCheck(); } });
  cdReset();

  // ================= 확장 콘텐츠 =================

  // ---------- 범용 미니 퀴즈 엔진 ----------
  function makeMiniQuiz(opts) {
    var st = { q: [], idx: 0, correct: 0, answered: false, done: false };
    function start() {
      var list = (typeof opts.build === "function" ? opts.build() : (opts.questions || [])).slice();
      shuffleArr(list);
      var rawCount = typeof opts.count === "function" ? opts.count() : opts.count;
      st.q = list.slice(0, rawCount || list.length);
      st.idx = 0; st.correct = 0; st.answered = false; st.done = false;
      render();
    }
    function render() {
      var box = document.getElementById(opts.boxId);
      if (!box) return;
      if (st.done) {
        var pct = st.q.length ? Math.round(st.correct / st.q.length * 100) : 0;
        var msg = pct >= 80 ? "훌륭해요! 🔥" : pct >= 50 ? "좋아요, 오답을 복습해 보세요. 💪" : "기초부터 다시 확인해 보세요. 🌱";
        box.innerHTML = '<div class="bank-card"><span class="bank-label">' + esc(opts.title || "결과") + ' 결과</span><div class="bank-q">🎉 ' + st.correct + " / " + st.q.length + ' 정답 (' + pct + '%)</div><p class="practice-note">' + msg + '</p></div>';
        return;
      }
      if (!st.q.length) { box.innerHTML = '<p class="practice-note">' + esc(opts.emptyHint || "시작 버튼을 눌러 주세요.") + "</p>"; return; }
      var q = st.q[st.idx];
      var html = '<div class="bank-card"><span class="bank-label">' + esc(q.tag || opts.title || "문제") + " · " + (st.idx + 1) + " / " + st.q.length + '</span>';
      if (q.audio) html += '<div style="text-align:center"><button type="button" class="listen-play" id="' + opts.boxId + 'Audio">🔊 듣기 (다시 듣기)</button></div>';
      if (q.passageHtml) html += '<div class="reading-passage">' + q.passageHtml + ttsBtn(q.passageSay || "", "지문 듣기") + '</div>';
      html += '<div class="bank-q">' + esc(q.prompt) + (q.promptSay ? ttsBtn(q.promptSay, "문제 듣기") : "") + '</div>';
      html += '<div class="bank-options">' + q.options.map(function (o) { return '<button type="button" class="bank-opt">' + esc(o) + '</button>'; }).join("") + '</div>';
      html += '<div class="bank-feedback" id="' + opts.boxId + 'Fb" role="status" aria-live="polite" aria-atomic="true"></div></div>';
      box.innerHTML = html;
      var ab = document.getElementById(opts.boxId + "Audio");
      if (ab && q.audio) ab.addEventListener("click", function () { speak(q.audio); });
      box.querySelectorAll(".bank-opt").forEach(function (b) { b.addEventListener("click", function () { answer(b); }); });
      if (q.audio && (opts.autoPlay || q.autoPlay)) { try { speak(q.audio); } catch (e) {} }
    }
    function answer(btn) {
      if (st.answered) return;
      st.answered = true;
      var q = st.q[st.idx];
      var ok = btn.textContent === q.answer;
      if (ok) st.correct++;
      // statKey 를 함수로 주면 문항마다 기록 영역을 바꿀 수 있습니다(문법 교재 단계별 기록 등).
      recordStat(typeof opts.statKey === "function" ? opts.statKey() : (opts.statKey || "mini"), ok);
      if (typeof opts.onAnswer === "function") { try { opts.onAnswer(q, ok); } catch (e) {} }
      var box = document.getElementById(opts.boxId);
      box.querySelectorAll(".bank-opt").forEach(function (o) {
        o.disabled = true;
        if (o.textContent === q.answer) o.classList.add("correct");
        if (o === btn && !ok) o.classList.add("wrong");
      });
      var fb = document.getElementById(opts.boxId + "Fb");
      fb.innerHTML = (ok ? "정답입니다! 🎉 " : "오답입니다. 정답: <b>" + esc(q.answer) + "</b> ") +
        (q.why ? '<div class="practice-note">💡 ' + esc(q.why) + '</div>' : "") + exFeedback(q);
      restoreFocusToFeedback(fb);
      var next = document.createElement("button");
      next.type = "button"; next.className = "btn quiz-btn"; next.style.marginTop = "10px";
      next.textContent = st.idx + 1 >= st.q.length ? "🏁 결과 보기" : "다음 문제 →";
      next.addEventListener("click", function () {
        st.idx++; st.answered = false;
        if (st.idx >= st.q.length) st.done = true;
        render();
      });
      fb.appendChild(next);
    }
    return { start: start, render: render };
  }
  function wireMiniQuiz(btnId, quiz, deferRender) {
    // deferRender=true 이면 클릭 핸들러만 붙이고, 첫 렌더는 extra.js 를 받은 뒤로 미룹니다.
    // (데이터가 오기 전에 그리면 "시작 버튼을 눌러 주세요"만 보이다가 그대로 남습니다)
    var b = document.getElementById(btnId);
    if (b) b.addEventListener("click", quiz.start);
    if (!deferRender) quiz.render();
  }

  // ---------- 문법 문제 풀이 (문법 교재 연습 문제 연동) ----------
  // 교재 데이터는 지연 로드(loadBooks)라, 처음에는 빈 배열이고 데이터가 온 뒤 applyGrammarBooks 가 채웁니다.
  var GRAMMAR_BOOKS = window.GRAMMAR_BOOKS || [];
  var CONVERSATION_BOOKS = window.CONVERSATION_BOOKS || [];
  // 틀린 문항은 단계·과·해설까지 함께 저장해 두었다가 그대로 다시 풀 수 있게 합니다.
  var grammarWrong = storeObject("toeic1000_grammarwrong");
  function saveGrammarWrong() {
    try { localStorage.setItem("toeic1000_grammarwrong", JSON.stringify(grammarWrong)); } catch (e) {}
  }
  function grammarLevelValue() {
    var sel = document.getElementById("grammarLevelSel");
    return (sel && sel.value) || "all";
  }
  /** 한 번에 풀 문항 수(0 이면 전체). */
  function grammarCountValue() {
    var sel = document.getElementById("grammarCountSel");
    var n = sel ? parseInt(sel.value, 10) : 8;
    return (isNaN(n) || n <= 0) ? 0 : n;
  }
  /** 선택한 단계의 연습 문제 수(문항을 만들지 않고 개수만 셉니다). */
  function grammarCount(level) {
    var n = 0;
    GRAMMAR_BOOKS.forEach(function (b) {
      if (level && level !== "all" && b.id !== level) return;
      (b.chapters || []).forEach(function (c) { n += (c.practice || []).length; });
    });
    return n;
  }
  /** 교재의 과별 연습 문제를 퀴즈 형식으로 바꿔 줍니다. */
  function grammarQuestions(level) {
    var out = [];
    GRAMMAR_BOOKS.forEach(function (b) {
      if (level && level !== "all" && b.id !== level) return;
      (b.chapters || []).forEach(function (c) {
        if (grammarChapterOnly && c.no !== grammarChapterOnly) return;
        (c.practice || []).forEach(function (q, qi) {
          out.push({
            id: b.id + "-c" + c.no + "-q" + (qi + 1),
            tag: b.level + " " + c.no + "과",
            prompt: q.q,
            options: shuffleArr((q.opts || []).slice()),
            answer: q.a,
            why: q.why
          });
        });
      });
    });
    return out;
  }
  var grammarWrongOnly = false;
  // 교재 낱개 과 페이지에서 `?level=basic&ch=5` 로 들어오면 그 과만 풀립니다(0 = 전체 과).
  var grammarChapterOnly = 0;

  /**
   * 교재 페이지가 넘겨주는 딥링크를 읽습니다.
   *   `../index.html?level=basic&ch=5#grammar-quiz` → { level: "basic", chapter: 5 }
   *   `../index.html?level=advanced#grammar-quiz` → { level: "advanced", chapter: 0 }
   * 계산만 하는 순수 함수라 회귀 테스트(tools/test-home-ux.mjs)가 직접 검증합니다.
   */
  function parseDeepLink(search) {
    var m = /[?&]level=(basic|intermediate|advanced)\b/.exec(search || "");
    if (!m) return null;
    var ch = /[?&]ch=(\d{1,2})\b/.exec(search || "");
    return { level: m[1], chapter: ch ? parseInt(ch[1], 10) : 0 };
  }

  /**
   * 딥링크로 받은 과 번호가 실제 교재에 있는 과인지 확인합니다.
   * 다른 사이트에서 온 링크나 오타(`ch=99`)로 문제가 0문항이 되는 일을 막고, 없으면 전체 과(0)로 돌립니다.
   */
  function resolveChapter(books, level, ch) {
    var n = parseInt(ch, 10) || 0;
    if (!n) return 0;
    var ok = false;
    (books || []).forEach(function (b) {
      if (b.id !== level) return;
      (b.chapters || []).forEach(function (c) { if (c.no === n) ok = true; });
    });
    return ok ? n : 0;
  }

  /** 지금 과 필터가 걸려 있으면 눈에 보이게 알려 줍니다(안 보이면 왜 문제가 적은지 알 수 없음). */
  function renderGrammarChapterHint() {
    var hint = document.getElementById("grammarChapterHint");
    var clear = document.getElementById("grammarChapterClear");
    if (!hint) return;
    var book = null;
    if (grammarChapterOnly) {
      GRAMMAR_BOOKS.forEach(function (b) {
        if (b.id === grammarLevelValue()) book = b;
      });
    }
    var on = !!(grammarChapterOnly && book);
    hint.hidden = !on;
    if (on) hint.textContent = "📖 " + book.title + " " + grammarChapterOnly + "과만 풀고 있어요";
    if (clear) clear.hidden = !on;
  }
  function clearGrammarChapter() {
    grammarChapterOnly = 0;
    renderGrammarChapterHint();
    grammarQuiz.render();
  }

  function grammarWrongQuestions() {
    return Object.keys(grammarWrong).map(function (k) { return grammarWrong[k]; });
  }
  var grammarQuiz = makeMiniQuiz({
    boxId: "grammarBox",
    title: "문법",
    count: function () { return grammarCountValue(); },
    statKey: function () { return "grammar_" + grammarLevelValue(); },
    build: function () { return grammarWrongOnly ? grammarWrongQuestions() : grammarQuestions(grammarLevelValue()); },
    emptyHint: "단계를 고르고 시작 버튼을 누르면 교재 연습 문제가 나옵니다.",
    onAnswer: function (q, ok) {
      if (!q || !q.id) return;
      if (ok) delete grammarWrong[q.id];
      else grammarWrong[q.id] = { id: q.id, tag: q.tag, prompt: q.prompt, options: q.options, answer: q.answer, why: q.why };
      saveGrammarWrong();
      renderGrammarWrongNote();
    }
  });
  function startGrammarQuiz(wrongOnly) {
    // 교재 데이터가 아직 안 왔으면(교재 섹션을 건너뛰고 바로 온 경우) 받은 뒤에 시작합니다.
    if (bookState.grammar !== "ready" && bookState.grammar !== "failed") {
      loadBooks("grammar", function () { startGrammarQuiz(wrongOnly); });
      return;
    }
    grammarWrongOnly = !!wrongOnly;
    if (grammarWrongOnly && !grammarWrongQuestions().length) {
      showToast("오답으로 저장된 문법 문제가 아직 없어요.");
      return;
    }
    grammarQuiz.start();
    var sec = document.querySelector('.home-section[aria-label="문법 문제 풀이"]');
    if (sec) scrollToEl(sec, "start");
  }
  function renderGrammarLevelSelect() {
    var sel = document.getElementById("grammarLevelSel");
    if (!sel) return;
    var html = '<option value="all">전체 단계 (' + grammarCount("all") + '문항)</option>';
    var ico = { "초급": "🟢", "중급": "🟡", "고급": "🔴" };
    GRAMMAR_BOOKS.forEach(function (b) {
      html += '<option value="' + esc(b.id) + '">' + (ico[b.level] || "🟡") + " " + esc(b.level) + " " + esc(b.title) +
        " (" + grammarCount(b.id) + '문항)</option>';
    });
    sel.innerHTML = html;
  }
  function renderGrammarWrongNote() {
    var box = document.getElementById("grammarWrongBox");
    if (!box) return;
    var keys = Object.keys(grammarWrong);
    var cnt = document.getElementById("grammarWrongCount");
    var clearBtn = document.getElementById("grammarClearWrong");
    if (cnt) cnt.textContent = keys.length ? "저장된 오답 " + keys.length + "문항" : "";
    if (clearBtn) clearBtn.hidden = !keys.length;
    if (!keys.length) {
      box.innerHTML = '<p class="practice-note">틀린 문법 문제는 여기에 모여 브라우저에만 저장됩니다. 맞히면 목록에서 자동으로 빠집니다.</p>';
      return;
    }
    box.innerHTML = '<div class="bank-card"><span class="bank-label">문법 오답노트 · ' + keys.length + '문항</span>' +
      keys.map(function (k, i) {
        var w = grammarWrong[k];
        // 빈칸을 정답으로 채운 완성 문장을 낭독해 줄 수 있게 합니다.
        var filled = String(w.prompt || "").replace(/_{2,}/g, " " + w.answer + " ").replace(/\s+/g, " ").trim();
        return '<div style="margin-top:10px"><p class="bank-q">' + (i + 1) + ". " + esc(w.prompt) + '</p>' +
          '<p class="practice-note">정답: <b>' + esc(w.answer) + '</b> · ' + esc(w.tag) + ttsBtn(filled, "완성 문장 듣기") + '</p>' +
          '<p class="practice-note">💡 ' + esc(w.why) + '</p></div>';
      }).join("") + '</div>';
  }
  var grammarStartBtn = document.getElementById("grammarStart");
  if (grammarStartBtn) grammarStartBtn.addEventListener("click", function () { startGrammarQuiz(false); });
  var grammarWrongBtn = document.getElementById("grammarWrongOnly");
  if (grammarWrongBtn) grammarWrongBtn.addEventListener("click", function () { startGrammarQuiz(true); });
  var grammarClearBtn = document.getElementById("grammarClearWrong");
  if (grammarClearBtn) grammarClearBtn.addEventListener("click", function () {
    if (!Object.keys(grammarWrong).length) return;
    grammarWrong = {};
    try { localStorage.removeItem("toeic1000_grammarwrong"); } catch (e) {}
    renderGrammarWrongNote();
    showToast("문법 오답노트를 비웠습니다.");
  });
  var grammarLevelSelEl = document.getElementById("grammarLevelSel");
  if (grammarLevelSelEl) grammarLevelSelEl.addEventListener("change", function () {
    grammarWrongOnly = false;
    // 단계를 직접 바꾸면 "이 과만" 상태도 함께 풀립니다(다른 단계에 없는 과 번호라서).
    grammarChapterOnly = 0;
    renderGrammarChapterHint();
    grammarQuiz.render();
  });
  var grammarCountSelEl = document.getElementById("grammarCountSel");
  if (grammarCountSelEl) grammarCountSelEl.addEventListener("change", function () {
    grammarWrongOnly = false;
    grammarQuiz.render();
  });
  var grammarChapterClearBtn = document.getElementById("grammarChapterClear");
  if (grammarChapterClearBtn) grammarChapterClearBtn.addEventListener("click", clearGrammarChapter);
  // 화면을 처음 그릴 때도 힌트 상태를 맞춥니다(딥링크로 들어온 경우).
  renderGrammarChapterHint();
  // 단계 목록은 문법 교재(defer 데이터)를 읽은 뒤 만들 수 있으므로 startApp 에서 그립니다.

  // ---------- 1) 빈출 콜로케이션 ----------

  function buildColloQuestions() {
    var phrases = COLLOCATIONS.map(function (c) { return c.phrase; });
    var kos = COLLOCATIONS.map(function (c) { return c.ko; });
    var qs = [];
    COLLOCATIONS.forEach(function (c) {
      qs.push({ tag: "콜로케이션 뜻", prompt: "「" + c.phrase + "」의 뜻으로 알맞은 것은?", answer: c.ko,
        options: [c.ko].concat(pickN(shuffleArr(kos.slice()), [c.ko], 3)),
        why: c.phrase + " = " + c.ko, example: c.ex, exampleKo: c.exKo, promptSay: c.phrase });
      qs.push({ tag: "콜로케이션 표현", prompt: "「" + c.ko + "」에 해당하는 표현은?", answer: c.phrase,
        options: [c.phrase].concat(pickN(shuffleArr(phrases.slice()), [c.phrase], 3)),
        why: c.phrase + " = " + c.ko, example: c.ex, exampleKo: c.exKo, promptSay: c.phrase });
    });
    return qs;
  }
  var colloQuiz = makeMiniQuiz({ boxId: "colloBox", title: "콜로케이션", statKey: "collo", count: 8, build: buildColloQuestions, emptyHint: "시작 버튼을 누르면 콜로케이션 8문제가 나옵니다." });
  wireMiniQuiz("colloStart", colloQuiz);

  // ---------- 2) 문맥 속 어휘 (Part 7 유형) ----------

  function buildContextQuestions() {
    return CONTEXT_VOCAB.map(function (c) {
      var plain = c.passage.replace(/<[^>]+>/g, "");
      return { tag: "문맥 어휘", passageHtml: c.passage, passageSay: plain, prompt: c.q, answer: c.a,
        options: shuffleArr(c.opts.slice()), why: c.why, example: plain, exampleKo: c.ko };
    });
  }
  var ctxQuiz = makeMiniQuiz({ boxId: "ctxBox", title: "문맥 어휘", statKey: "ctx", count: 6, build: buildContextQuestions, emptyHint: "시작 버튼을 누르면 문맥 어휘 6문제가 나옵니다." });
  wireMiniQuiz("ctxStart", ctxQuiz);

  // ---------- 3) Part 1·2 LC 유형 훈련 ----------

  function buildLc12Questions() {
    return LC_TRAINING.map(function (c) {
      return { tag: c.tag, audio: c.audio, prompt: "🔊 들리는 내용에 알맞은 것을 고르세요.", answer: c.a,
        options: shuffleArr(c.opts.slice()), why: c.why, example: c.audio, exampleKo: c.ko, autoPlay: true };
    });
  }
  var lc12Quiz = makeMiniQuiz({ boxId: "lc12Box", title: "LC 1·2", statKey: "lc12", count: 8, build: buildLc12Questions, autoPlay: true, emptyHint: "시작 버튼을 누르면 LC 유형 8문제가 나옵니다." });
  wireMiniQuiz("lc12Start", lc12Quiz, true);

  // ---------- 4) Part 3·4 미니 세트 ----------
  var PART34_SETS = [
    { title: "사무실 공지", kind: "담화",
      lines: [
        "Attention, all employees. The elevator in Building B will be closed for maintenance from Monday to Wednesday.",
        "During this period, please use the stairs or the elevator in Building A.",
        "Employees attending the 10 a.m. workshop should allow extra time to arrive."
      ],
      qs: [
        { q: "직원들이 해야 할 일로 옳은 것은?", a: "다른 엘리베이터나 계단을 이용한다", opts: ["다른 엘리베이터나 계단을 이용한다", "워크숍을 취소한다", "빌딩 B에서 기다린다", "정비 일정을 변경한다"], why: "Building B 대신 계단이나 Building A 엘리베이터를 이용하라고 안내합니다.", ex: "During this period, please use the stairs or the elevator in Building A.", exKo: "이 기간에는 계단이나 빌딩 A의 엘리베이터를 이용해 주세요." },
        { q: "엘리베이터 정비 기간은 언제인가?", a: "월요일부터 수요일까지", opts: ["월요일부터 수요일까지", "수요일부터 금요일까지", "월요일 하루", "주말 내내"], why: "from Monday to Wednesday라고 명시되어 있습니다." },
        { q: "10시 워크숍 참석자에 대한 안내는?", a: "시간 여유를 두고 도착해야 한다", opts: ["시간 여유를 두고 도착해야 한다", "엘리베이터를 쓸 수 없다", "장소가 Building A로 바뀐다", "참석이 취소된다"], why: "allow extra time to arrive = 시간 여유를 두라는 뜻입니다." }
      ] },
    { title: "항공편 변경 상담", kind: "대화",
      lines: [
        "M: Thank you for calling SkyLine Airlines. How may I help you?",
        "W: I'd like to change my flight from Chicago to Boston. My original departure was 7 a.m.",
        "M: Certainly. There is a 2 p.m. flight available at no extra charge.",
        "W: That works. Please confirm the new booking by email."
      ],
      qs: [
        { q: "여성이 요청한 것은?", a: "항공편 변경", opts: ["항공편 변경", "좌석 업그레이드", "수하물 추가", "환불 요청"], why: "change my flight 라고 말했습니다." },
        { q: "새 항공편 출발 시각은?", a: "오후 2시", opts: ["오후 2시", "오전 7시", "오후 5시", "오전 10시"], why: "a 2 p.m. flight 라고 안내했습니다." },
        { q: "항공편 변경 추가 요금은?", a: "없다", opts: ["없다", "50달러", "100달러", "20%"], why: "at no extra charge = 추가 요금 없음" }
      ] },
    { title: "신제품 출시 담화", kind: "담화",
      lines: [
        "Thank you for attending the product launch. The new FlexiDesk will be available from March 1.",
        "Orders placed before March 31 include free delivery and a two-year warranty.",
        "Visit our website to see bulk-order pricing."
      ],
      qs: [
        { q: "신제품 출시일은?", a: "3월 1일", opts: ["3월 1일", "3월 31일", "4월 1일", "2월 말"], why: "available from March 1" },
        { q: "3월 31일 전에 주문하면 받는 혜택은?", a: "무료 배송과 2년 보증", opts: ["무료 배송과 2년 보증", "20% 할인", "추가 사은품", "무료 설치"], why: "include free delivery and a two-year warranty" },
        { q: "대량 주문 가격은 어디서 확인하나?", a: "웹사이트", opts: ["웹사이트", "매장 방문", "이메일 문의", "전화 상담"], why: "Visit our website to see bulk-order pricing." }
      ] },
    { title: "병원 예약 확인", kind: "담화",
      lines: [
        "Good afternoon. This is Riverside Clinic calling to confirm your appointment.",
        "Your appointment with Dr. Patel is on Thursday at 4 p.m. Please arrive ten minutes early.",
        "If you need to reschedule, call us at least 24 hours in advance."
      ],
      qs: [
        { q: "예약 일시는?", a: "목요일 오후 4시", opts: ["목요일 오후 4시", "화요일 오전 4시", "목요일 오전 10시", "금요일 오후 4시"], why: "Thursday at 4 p.m." },
        { q: "몇 분 일찍 도착해야 하나?", a: "10분", opts: ["10분", "20분", "30분", "5분"], why: "arrive ten minutes early" },        { q: "일정 변경은 언제까지 연락해야 하나?", a: "최소 24시간 전", opts: ["최소 24시간 전", "당일 아침", "최소 2시간 전", "언제든 가능"], why: "at least 24 hours in advance" }
      ]
    },
    { title: "은행 대출 상담", kind: "대화",
      lines: [
        "W: Good morning. I would like to apply for a small business loan.",
        "M: Certainly. Could you tell me how long you have been in business?",
        "W: About three years. I can provide the financial statements.",
        "M: Great. The interest rate will depend on your credit history."
      ],
      qs: [
        { q: "여성이 신청하려는 것은?", a: "소규모 사업 대출", opts: ["소규모 사업 대출", "신용카드 발급", "계좌 개설", "환전 서비스"], why: "apply for a small business loan이라고 말했습니다." },
        { q: "남성이 물어본 것은?", a: "사업을 한 기간", opts: ["사업을 한 기간", "직원 수", "매출 규모", "사업장 위치"], why: "how long you have been in business = 사업 기간" },
        { q: "금리를 결정하는 요인은?", a: "신용 기록", opts: ["신용 기록", "사업 규모", "직원 수", "거래 은행"], why: "depend on your credit history" }
      ] },
    { title: "호텔 예약 변경", kind: "대화",
      lines: [
        "M: Hello, I have a reservation for a double room on May 12.",
        "W: May I have your confirmation number, please?",
        "M: Yes, it is 48213. I need to change the dates to May 14.",
        "W: No problem. There is no change fee for the first modification."
      ],
      qs: [
        { q: "남성이 요청한 것은?", a: "예약 날짜 변경", opts: ["예약 날짜 변경", "객실 업그레이드", "조식 추가", "예약 취소"], why: "change the dates to May 14라고 말했습니다." },
        { q: "여성이 요청한 정보는?", a: "예약 확인 번호", opts: ["예약 확인 번호", "신용카드 번호", "전화번호", "여권 번호"], why: "May I have your confirmation number" },
        { q: "첫 번째 변경에 대한 수수료는?", a: "없다", opts: ["없다", "20달러", "1박 요금", "10%"], why: "no change fee for the first modification" }
      ] },
    // 17차 점검: 실제 시험은 Part 3 대화 13세트 · Part 4 담화 10세트입니다.
    // 홈은 무작위로 한 세트씩 보여 주므로, 고를 수 있는 세트를 늘려 실제 구성에 가깝게 맞춥니다.
    /* ============ Part 3 대화 ============ */
    { title: "배송 지연 문의", kind: "대화",
      lines: [
        "W: Hello, I ordered a desk lamp last week, but it has not arrived yet.",
        "M: Let me check the tracking number for you. Could you give me the order number?",
        "W: It is 73015. The delivery date on the website was Monday.",
        "M: I am sorry. The courier reported a delay, so it will arrive on Thursday."
      ],
      qs: [
        { q: "여성이 전화한 이유는?", a: "주문한 물건이 아직 오지 않아서", opts: ["주문한 물건이 아직 오지 않아서", "환불을 받으려고", "새로 주문하려고", "배송지를 바꾸려고"], why: "ordered a desk lamp last week, but it has not arrived yet.", ex: "I ordered a desk lamp last week, but it has not arrived yet.", exKo: "지난주에 스탠드를 주문했는데 아직 오지 않았어요." },
        { q: "남성이 요청한 정보는?", a: "주문 번호", opts: ["주문 번호", "배송 기사 연락처", "카드 번호", "제품 사진"], why: "Could you give me the order number?" },
        { q: "새 도착 예정일은?", a: "목요일", opts: ["목요일", "월요일", "수요일", "금요일"], why: "it will arrive on Thursday." }
      ] },
    { title: "사무실 리모델링 상담", kind: "대화",
      lines: [
        "M: We are planning to repaint the third-floor offices next month.",
        "W: How long will the work take? Our team has a client visit on the tenth.",
        "M: It usually takes four days, so we can start on the eleventh.",
        "W: That works. Please let us know which furniture needs to be moved."
      ],
      qs: [
        { q: "무엇을 논의하고 있는가?", a: "사무실 도색 일정", opts: ["사무실 도색 일정", "가구 구매", "직원 채용", "사무실 이전"], why: "repaint the third-floor offices next month." },
        { q: "여성이 걱정하는 것은?", a: "10일에 고객 방문이 있다", opts: ["10일에 고객 방문이 있다", "예산이 부족하다", "직원이 휴가 중이다", "엘리베이터가 고장 났다"], why: "Our team has a client visit on the tenth." },
        { q: "공사를 언제 시작하는가?", a: "11일", opts: ["11일", "10일", "4일", "다음 달 1일"], why: "we can start on the eleventh." }
      ] },
    { title: "채용 면접 일정 조정", kind: "대화",
      lines: [
        "W: I would like to confirm the interview time for Mr. Yoon.",
        "M: He is scheduled for Wednesday at ten, but he asked to come in the afternoon.",
        "W: We can offer two o'clock. Does the conference room have a video link?",
        "M: Yes, it does. I will send him the updated invitation."
      ],
      qs: [
        { q: "무엇을 조정하는가?", a: "면접 시간", opts: ["면접 시간", "회의실 예약", "급여 조건", "출근 날짜"], why: "He is scheduled for Wednesday at ten, but he asked to come in the afternoon." },
        { q: "새 면접 시간은?", a: "오후 2시", opts: ["오후 2시", "오전 10시", "오후 4시", "오전 11시"], why: "We can offer two o'clock." },
        { q: "남성이 하기로 한 일은?", a: "변경된 초대장을 보낸다", opts: ["변경된 초대장을 보낸다", "회의실을 예약한다", "면접을 취소한다", "지원자에게 전화한다"], why: "I will send him the updated invitation." }
      ] },
    { title: "렌터카 반납 연장", kind: "대화",
      lines: [
        "M: My rental car is due back at five o'clock today. Can I keep it one more day?",
        "W: Yes, but please note that the daily rate increases on weekends.",
        "M: That is fine. I will return it tomorrow evening at the airport branch.",
        "W: Noted. I have extended your reservation until Saturday."
      ],
      qs: [
        { q: "남성이 요청한 것은?", a: "차량 반납을 하루 미루는 것", opts: ["차량 반납을 하루 미루는 것", "차량 교체", "보험 가입", "기사 요청"], why: "Can I keep it one more day?" },
        { q: "주말에 오르는 것은?", a: "일일 요금", opts: ["일일 요금", "보험료", "주차 요금", "세금"], why: "the daily rate increases on weekends." },
        { q: "어디에서 반납하는가?", a: "공항 지점", opts: ["공항 지점", "시내 지점", "호텔 주차장", "기차역"], why: "at the airport branch." }
      ] },
    { title: "공장 견학 안내", kind: "대화",
      lines: [
        "W: Our visitors from the Osaka branch will tour the plant on Thursday morning.",
        "M: Do they need safety equipment? All guests must wear a helmet and a vest.",
        "W: I will prepare six sets. Could you also arrange a translator?",
        "M: Certainly. I will ask Ms. Sato from the export team to join us."
      ],
      qs: [
        { q: "방문객들이 하는 일은?", a: "공장 견학", opts: ["공장 견학", "제품 발표", "계약 서명", "직원 교육"], why: "will tour the plant on Thursday morning." },
        { q: "방문객이 반드시 착용해야 하는 것은?", a: "안전모와 조끼", opts: ["안전모와 조끼", "앞치마", "장갑과 마스크", "안전화만"], why: "must wear a helmet and a vest." },
        { q: "남성이 하겠다고 한 일은?", a: "통역 담당자를 섭외한다", opts: ["통역 담당자를 섭외한다", "장비를 직접 준비한다", "견학을 취소한다", "일정을 바꾼다"], why: "I will ask Ms. Sato from the export team to join us." }
      ] },
    /* ============ Part 4 담화 ============ */
    { title: "기차 지연 안내 방송", kind: "담화",
      lines: [
        "Good afternoon, passengers. The 4:15 train to Brighton is delayed by about twenty minutes.",
        "The delay is due to track maintenance near the Riverside station.",
        "Passengers holding tickets for the 4:15 may also board the 4:40 express at platform 3."
      ],
      qs: [
        { q: "무엇을 안내하고 있는가?", a: "기차 지연", opts: ["기차 지연", "요금 인상", "좌석 변경", "역 공사 완료"], why: "The 4:15 train to Brighton is delayed.", ex: "The 4:15 train to Brighton is delayed by about twenty minutes.", exKo: "4시 15분 브라이턴행 열차가 약 20분 지연되고 있습니다." },
        { q: "지연 이유는?", a: "선로 정비", opts: ["선로 정비", "폭우", "차량 고장", "인력 부족"], why: "due to track maintenance near the Riverside station." },
        { q: "승객들이 할 수 있는 일은?", a: "4시 40분 급행 열차를 탈 수 있다", opts: ["4시 40분 급행 열차를 탈 수 있다", "환불만 받을 수 있다", "다음 날 다시 와야 한다", "택시비를 지원받는다"], why: "may also board the 4:40 express at platform 3." }
      ] },
    { title: "도서관 이용 안내", kind: "담화",
      lines: [
        "Welcome to the City Library. Study rooms on the second floor can be reserved online for up to three hours a day.",
        "Books borrowed from the reference section must be returned within one week.",
        "During the summer reading program, storytelling sessions are held every Saturday at 11 a.m."
      ],
      qs: [
        { q: "하루에 예약할 수 있는 시간은?", a: "최대 3시간", opts: ["최대 3시간", "최대 1시간", "최대 6시간", "제한 없음"], why: "for up to three hours a day." },
        { q: "참고자료실 책은 언제까지 반납해야 하는가?", a: "일주일 이내", opts: ["일주일 이내", "하루 이내", "한 달 이내", "반납하지 않아도 된다"], why: "must be returned within one week." },
        { q: "토요일 오전 11시에 열리는 것은?", a: "이야기 들려주기 프로그램", opts: ["이야기 들려주기 프로그램", "독서 토론회", "작가 강연", "도서 교환 시장"], why: "storytelling sessions are held every Saturday at 11 a.m." }
      ] },
    { title: "헬스장 신규 프로그램 안내", kind: "담화",
      lines: [
        "Thank you for choosing Fitline Gym. Starting next month, we are adding early-morning yoga classes at 6:30 a.m. on weekdays.",
        "Members who sign up before the twentieth receive one free personal training session.",
        "Please bring your membership card to the front desk to register."
      ],
      qs: [
        { q: "새로 생기는 프로그램은?", a: "이른 아침 요가 수업", opts: ["이른 아침 요가 수업", "주말 수영 강좌", "야간 필라테스", "단체 마라톤"], why: "we are adding early-morning yoga classes at 6:30 a.m. on weekdays." },
        { q: "20일 전에 등록하면 받는 혜택은?", a: "무료 개인 트레이닝 1회", opts: ["무료 개인 트레이닝 1회", "한 달 무료 이용", "운동복 제공", "주차권"], why: "receive one free personal training session." },
        { q: "등록할 때 가져와야 하는 것은?", a: "회원 카드", opts: ["회원 카드", "신분증 사본", "운동화", "결제 영수증"], why: "Please bring your membership card to the front desk." }
      ] },
    { title: "분기 실적 발표", kind: "담화",
      lines: [
        "Thank you all for joining the quarterly briefing. Our online sales grew by twelve percent compared with the previous quarter.",
        "The increase came mainly from the new subscription plan launched in April.",
        "Next quarter, we will focus on improving delivery times in the southern region."
      ],
      qs: [
        { q: "온라인 매출은 어떻게 변했는가?", a: "전 분기보다 12퍼센트 늘었다", opts: ["전 분기보다 12퍼센트 늘었다", "전 분기보다 12퍼센트 줄었다", "변화가 없었다", "두 배가 되었다"], why: "grew by twelve percent compared with the previous quarter." },
        { q: "성장의 주된 이유는?", a: "4월에 시작한 구독 요금제", opts: ["4월에 시작한 구독 요금제", "광고비 증가", "신규 매장 개설", "가격 인상"], why: "came mainly from the new subscription plan launched in April." },
        { q: "다음 분기의 중점 사항은?", a: "남부 지역 배송 시간 개선", opts: ["남부 지역 배송 시간 개선", "신제품 개발", "직원 채용", "해외 진출"], why: "we will focus on improving delivery times in the southern region." }
      ] }
  ];
  var p34Idx = 0;
  function renderPart34(forceRandom) {
    var box = document.getElementById("p34Box");
    if (!box) return;
    if (forceRandom || p34Idx < 0) p34Idx = Math.floor(Math.random() * PART34_SETS.length);
    if (p34Idx >= PART34_SETS.length) p34Idx = 0;
    var s = PART34_SETS[p34Idx];
    var html = '<div class="dialogue-card"><div class="dialogue-title">' + esc(s.title) + '<span class="dialogue-theme">' + esc(s.kind) + '</span></div>';
    html += '<div class="reading-passage">' + s.lines.map(function (l) { return '<div class="lc-set-line">' + esc(l) + '</div>'; }).join("") + ttsBtn(s.lines.join(" "), "전체 듣기") + '</div>';
    html += '<div class="practice-actions"><button type="button" class="btn quiz-btn" id="p34Play">🔊 전체 듣기</button><button type="button" class="btn quiz-btn" id="p34Next">🔄 다른 세트</button></div>';
    html += '<div id="p34Qs">';
    s.qs.forEach(function (q, qi) {
      html += '<div class="dialogue-q"><p class="dialogue-qtext">Q' + (qi + 1) + ". " + esc(q.q) + '</p>';
      q.opts.forEach(function (o) { html += '<button type="button" class="quiz-opt p34-opt" data-qi="' + qi + '" data-a="' + escapeAttr(q.a) + '">' + esc(o) + '</button>'; });
      html += '<div class="quiz-feedback" id="p34Fb' + qi + '" role="status" aria-live="polite" aria-atomic="true"></div></div>';
    });
    html += '</div></div>';
    box.innerHTML = html;
    var play = document.getElementById("p34Play");
    if (play) play.addEventListener("click", function () {
      var t = 0;
      s.lines.forEach(function (l) { setTimeout(function () { speak(l); }, t); t += Math.max(1900, l.length * 110); });
    });
    var nx = document.getElementById("p34Next");
    if (nx) nx.addEventListener("click", function () { p34Idx = (p34Idx + 1) % PART34_SETS.length; renderPart34(false); });
    box.querySelectorAll(".p34-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.disabled) return;
        var qi = parseInt(b.getAttribute("data-qi"), 10);
        var a = b.getAttribute("data-a");
        var ok = b.textContent === a;
        box.querySelectorAll('[data-qi="' + qi + '"]').forEach(function (o) {
          o.disabled = true;
          if (o.getAttribute("data-a") === o.textContent) o.classList.add("correct");
        });
        if (!ok) b.classList.add("wrong");
        recordStat("part34", ok);
        var q = s.qs[qi];
        var fb = document.getElementById("p34Fb" + qi);
        if (fb) fb.innerHTML = (ok ? "정답입니다! 🎉" : "오답입니다. 정답: <b>" + esc(a) + "</b>") +
          '<div class="practice-note">💡 ' + esc(q.why || "") + '</div>' + exFeedback({ example: q.ex || "", exampleKo: q.exKo || "" });
        restoreFocusToFeedback(fb);
      });
    });
  }

  // ---------- 5) 단어 패밀리 (품사 변환) ----------

  function renderWordFamilies() {
    var grid = document.getElementById("wordfamilyGrid");
    if (!grid) return;
    grid.innerHTML = WORD_FAMILIES.map(function (f) {
      return '<div class="wordfamily-card"><div class="wordfamily-root">' + esc(f.root) + '</div>' +
        '<div class="wordfamily-forms">' + f.forms.map(function (x) { return '<span class="tag tag-blue">' + esc(x) + '</span>'; }).join("") + '</div>' +
        '<div class="wordpart-ex">' + esc(f.ex) + ttsBtn(f.ex, "예문 듣기") + '</div></div>';
    }).join("");
  }

  function buildWfQuestions() {
    return WF_QUESTIONS.map(function (q) {
      return { tag: "단어 패밀리", prompt: q.prompt, answer: q.a, options: shuffleArr(q.opts.slice()),
        why: q.why, example: q.ex, exampleKo: q.exKo };
    });
  }
  var wfQuiz = makeMiniQuiz({ boxId: "wfBox", title: "단어 패밀리", statKey: "wf", count: 8, build: buildWfQuestions, emptyHint: "시작 버튼을 누르면 단어 패밀리 8문제가 나옵니다." });
  wireMiniQuiz("wfStart", wfQuiz);

  // ---------- 6) 최소대립쌍 발음 구별 ----------

  function buildMpQuestions() {
    var words = [];
    MINIMAL_PAIRS.forEach(function (p) { words.push(p.a, p.b); });
    return MINIMAL_PAIRS.map(function (p) {
      var pickA = Math.random() < 0.5;
      var target = pickA ? p.a : p.b;
      var other = pickA ? p.b : p.a;
      return { tag: "최소대립쌍", audio: target, prompt: "🔊 들리는 단어를 고르세요.", answer: target,
        options: shuffleArr([p.a, p.b].concat(pickN(shuffleArr(words.slice()), [p.a, p.b], 2))),
        why: p.a + "(" + p.aKo + ") vs " + p.b + "(" + p.bKo + ") · " + p.tip,
        example: target, exampleKo: (pickA ? p.aKo : p.bKo) + " / 짝: " + other, autoPlay: true };
    });
  }
  var mpQuiz = makeMiniQuiz({ boxId: "mpBox", title: "최소대립쌍", statKey: "mp", count: 10, build: buildMpQuestions, autoPlay: true, emptyHint: "시작 버튼을 누르면 듣고 구별하는 10문제가 나옵니다." });
  wireMiniQuiz("mpStart", mpQuiz);

  // ---------- 7) 어원·연상 암기 팁 ----------

  function renderMnemonics() {
    var grid = document.getElementById("mnemonicGrid");
    if (!grid) return;
    grid.innerHTML = MNEMONICS.map(function (m) {
      return '<div class="mnemonic-card"><div class="mnemonic-top"><span class="mnemonic-word" lang="en">' + esc(m.word) + '</span><span class="wordpart-type">어원</span>' + ttsBtn(m.word, "발음 듣기") + '</div>' +
        '<div class="mnemonic-root">' + esc(m.root) + '</div>' +
        '<div class="mnemonic-tip">💡 ' + esc(m.tip) + '</div>' +
        '<div class="wordpart-ex">' + esc(m.ex) + ttsBtn(m.ex, "예문 듣기") + '</div></div>';
    }).join("");
  }

  // ---------- 8) 비즈니스 이메일·회의 템플릿 ----------

  function renderTemplates() {
    var grid = document.getElementById("templateGrid");
    if (!grid) return;
    grid.innerHTML = BIZ_TEMPLATES.map(function (t) {
      return '<article class="reading-card"><span class="bank-label">' + esc(t.cat) + '</span><h3>' + esc(t.ko) + '</h3>' +
        t.lines.map(function (l) { return '<div class="reading-passage template-line">' + esc(l) + ttsBtn(l, "문장 듣기") + '<button type="button" class="tts-btn js-copy" data-copy="' + escapeAttr(l) + '" title="문장 복사" aria-label="문장 복사">📋</button></div>'; }).join("") +
        '</article>';
    }).join("");
  }
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest(".js-copy") : null;
    if (!b) return;
    var text = b.getAttribute("data-copy") || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast("📋 문장을 복사했습니다."); }).catch(function () { showToast("복사: " + text); });
    } else { showToast("복사: " + text); }
  });

  // ---------- 9) 스피드 어휘 60초 ----------
  var speedState = { on: false, left: 60, score: 0, combo: 0, bestCombo: 0, correct: 0, total: 0, timer: null, cur: null };
  var speedBestScore = 0;
  try { speedBestScore = parseInt(localStorage.getItem("toeic1000_speedbest") || "0", 10) || 0; } catch (e) {}
  function speedUI() {
    var el = document.getElementById("speedBest");
    if (el) el.textContent = "최고 " + speedBestScore + "점";
    var btn = document.getElementById("speedStart");
    if (btn) btn.textContent = speedState.on ? "⏹ 중지" : "▶ 시작";
  }
  function speedNewQuestion() {
    var box = document.getElementById("speedBox");
    if (!box) return;
    var pool = allWords();
    if (!pool.length) return;
    var w = pool[Math.floor(Math.random() * pool.length)];
    var opts = [w[3]], att = 0;
    while (opts.length < 4 && att < 400) { att++; var d = pool[Math.floor(Math.random() * pool.length)][3]; if (opts.indexOf(d) === -1) opts.push(d); }
    shuffleArr(opts);
    speedState.cur = { answer: w[3] };
    box.innerHTML = '<div class="bank-card"><span class="bank-label">스피드 · ' + speedState.score + '점 · 콤보 ' + speedState.combo + ' · 남은 시간 ' + speedState.left + '초</span>' +
      '<div class="bank-q">' + esc(w[0]) + ttsBtn(w[0], "발음 듣기") + '</div><div class="bank-options">' +
      opts.map(function (o) { return '<button type="button" class="bank-opt">' + esc(o) + '</button>'; }).join("") + '</div></div>';
    box.querySelectorAll(".bank-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!speedState.on || b.disabled) return;
        var ok = b.textContent === speedState.cur.answer;
        speedState.total++;
        if (ok) { speedState.correct++; speedState.combo++; speedState.score += 10 + Math.min(10, speedState.combo) * 2; if (speedState.combo > speedState.bestCombo) speedState.bestCombo = speedState.combo; }
        else { speedState.combo = 0; speedState.score = Math.max(0, speedState.score - 5); }
        box.querySelectorAll(".bank-opt").forEach(function (o) { o.disabled = true; if (o.textContent === speedState.cur.answer) o.classList.add("correct"); });
        b.classList.add(ok ? "correct" : "wrong");
        setTimeout(function () { if (speedState.on) speedNewQuestion(); }, 300);
      });
    });
  }
  function speedStart() {
    if (speedState.on) { speedEnd(); return; }
    speedState.on = true; speedState.left = 60; speedState.score = 0; speedState.combo = 0; speedState.bestCombo = 0; speedState.correct = 0; speedState.total = 0;
    speedUI();
    speedNewQuestion();
    if (speedState.timer) clearInterval(speedState.timer);
    speedState.timer = setInterval(function () {
      speedState.left--;
      var box = document.getElementById("speedBox");
      var label = box && box.querySelector ? box.querySelector(".bank-label") : null;
      if (label) label.textContent = "스피드 · " + speedState.score + "점 · 콤보 " + speedState.combo + " · 남은 시간 " + speedState.left + "초";
      if (speedState.left <= 0) speedEnd();
    }, 1000);
  }
  function speedEnd() {
    speedState.on = false;
    if (speedState.timer) { clearInterval(speedState.timer); speedState.timer = null; }
    if (speedState.score > speedBestScore) {
      speedBestScore = speedState.score;
      try { localStorage.setItem("toeic1000_speedbest", String(speedBestScore)); } catch (e) {}
    }
    speedUI();
    recordStat("speed", speedState.total ? (speedState.correct / speedState.total >= 0.7) : false);
    var box = document.getElementById("speedBox");
    if (box) box.innerHTML = '<div class="quiz-result"><div class="score">' + speedState.score + '</div><p>60초 결과 · 정답 ' + speedState.correct + " / " + speedState.total + " · 최고 콤보 " + speedState.bestCombo + '<br>최고 점수 ' + speedBestScore + '점</p></div>';
    renderBadges();
  }
  var speedStartEl = document.getElementById("speedStart");
  if (speedStartEl) speedStartEl.addEventListener("click", speedStart);
  speedUI();

  // ---------- 10) 주간 학습 리포트 ----------
  function renderReport() {
    var box = document.getElementById("reportBox");
    if (!box) return;
    var learnedN = Object.keys(learned).filter(function (k) { return learned[k]; }).length;
    var pct = totalCount ? Math.round(learnedN / totalCount * 100) : 0;
    var days = [], totalAct = 0, maxAct = 1;
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var k = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      var n = weeklyLog[k] || 0;
      days.push({ label: (d.getMonth() + 1) + "/" + d.getDate(), n: n });
      if (n > maxAct) maxAct = n;
      totalAct += n;
    }
    var bars = days.map(function (day) {
      var h = Math.max(4, Math.round(day.n / maxAct * 80));
      return '<div class="week-bar" style="height:' + h + 'px"><span class="val">' + (day.n || "") + '</span><span>' + day.label + '</span></div>';
    }).join("");
    var typeLabels = { en2ko: "단어→뜻", ko2en: "뜻→단어", blank: "빈칸", listen_word: "LC 단어", listen_sent: "LC 예문", listen_dict: "받아쓰기", diag: "실력 진단", mock_LC: "모의 LC", mock_RC: "모의 RC", mini: "미니 테스트", collo: "콜로케이션", ctx: "문맥 어휘", lc12: "LC 1·2", part34: "Part 3·4", wf: "단어 패밀리", mp: "최소대립쌍", confuse_dict: "혼동어휘 받아쓰기", speed: "스피드 어휘", mix_confuse: "혼동어휘", mix_part: "어근", double_reading: "복수 지문" };
    var rows = [], totalQ = 0, totalC = 0;
    Object.keys(typeLabels).forEach(function (k) {
      var s = quizStats[k];
      if (!s || !(s.c + s.w)) return;
      var q = s.c + s.w; totalQ += q; totalC += s.c;
      rows.push({ label: typeLabels[k], pct: Math.round(s.c / q * 100) });
    });
    rows.sort(function (a, b) { return a.pct - b.pct; });
    var weak = rows.length ? rows[0] : null;
    var coach = pct >= 80 ? "거의 완성 단계예요! 오답 단어만 정리해도 점수가 오릅니다. 🏆" : pct >= 40 ? "절반을 향해 가고 있어요. 하루 1유닛씩 꾸준히 이어가 봅시다. 💪" : "지금은 양을 채우는 시기입니다. 오늘의 단어부터 시작해 보세요. 🌱";
    var weakMsg = weak ? "가장 약한 유형은 <b>" + esc(weak.label) + "</b> (" + weak.pct + "%)입니다. 해당 섹션을 먼저 복습해 보세요." : "아직 유형별 기록이 없어요. 퀴즈·리스닝을 한 번씩 풀어 보세요.";
    var catStats2 = categoryStats();
    var catRows = Object.keys(catStats2).map(function (c) { var s = catStats2[c], n = s.c + s.w; return { c: c, pct: n ? Math.round(s.c / n * 100) : 0, n: n }; }).sort(function (a, b) { return a.pct - b.pct; });
    var catMsg = catRows.length ? "영역별 정답률(낮은 순): " + catRows.map(function (r) { return esc(r.c) + " " + r.pct + "%"; }).join(" · ") : "";
    box.innerHTML =
      '<div class="report-grid">' +
      '<div class="dash-card"><h3>📚 학습 진행률</h3><div class="big">' + pct + '%</div><p class="muted">' + learnedN + " / " + totalCount + ' 단어</p></div>' +
      '<div class="dash-card"><h3>🔥 연속 학습</h3><div class="big">' + streakInfo.count + '일</div><p class="muted">최고 예상 점수 ' + examBest + '점</p></div>' +
      '<div class="dash-card"><h3>📅 최근 7일 활동</h3><div class="big">' + totalAct + '회</div><p class="muted">단어 학습·퀴즈 합계</p></div>' +
      '<div class="dash-card"><h3>🎯 퀴즈 정확도</h3><div class="big">' + (totalQ ? Math.round(totalC / totalQ * 100) : 0) + '%</div><p class="muted">총 ' + totalQ + '문제</p></div>' +
      '</div>' +
      '<div class="dash-card"><h3>최근 7일 학습 활동</h3><div class="week-bars">' + bars + '</div></div>' +
      '<div class="listen-script" style="margin-top:10px">🧭 ' + coach + '<br>' + weakMsg + (catMsg ? '<br>' + catMsg : '') + '</div>';
  }
  var reportPrintEl = document.getElementById("reportPrint");
  if (reportPrintEl) reportPrintEl.addEventListener("click", function () { try { window.print(); } catch (e) {} });

  var secNav = document.querySelector(".section-nav");
  if (secNav) secNav.addEventListener("click", function (e) {
    var chip = e.target.closest(".sn-chip");
    if (!chip) return;
    var sec = document.querySelector('.home-section[aria-label="' + chip.getAttribute("data-target") + '"]');
    // 접힌 묶음 안의 섹션이면 scrollToEl 이 먼저 펼칩니다.
    if (sec) {
      scrollToEl(sec, "start");
      // 스크롤이 멈춘 뒤에야 IntersectionObserver 가 반응하므로, 눌린 칩은 여기서 바로 표시합니다.
      setCurrentSection(chip.getAttribute("data-target"));
    }
  });

  // 인쇄할 때는 접힌 묶음을 모두 펼칩니다.
  // CSS 로는 <details> 를 열 수 없고, 닫힌 채로 인쇄하면 화면에서 접어 둔 학습 내용이
  // 종이에서 통째로 빠집니다(인쇄본은 「한 장으로 보는 자료」로도 쓰입니다).
  var homeGroups = [].slice.call(document.querySelectorAll("#homeView details.home-group"));
  var printReopened = [];
  var printing = false;
  window.addEventListener("beforeprint", function () {
    printing = true;
    printReopened = homeGroups.filter(function (g) { return !g.open; });
    printReopened.forEach(function (g) { g.open = true; });
  });
  window.addEventListener("afterprint", function () {
    printReopened.forEach(function (g) { g.open = false; });
    printReopened = [];
    printing = false;
  });

  // 홈 목차 묶음(어휘 익히기·파트별 훈련·말하기·쓰기·실전 관리)의 펼침 상태를 기억합니다.
  // 홈은 53개 섹션이라 한 번 펼쳐 둔 묶음이 화면을 옮겼다 돌아올 때마다 접혀 있으면
  // 매번 다시 찾아 펼쳐야 합니다. (인쇄용 임시 펼침은 저장하지 않습니다.)
  var HOME_GROUP_KEY = "toeic1000_homegroups";
  var homeGroupSaved = null;
  try { homeGroupSaved = JSON.parse(localStorage.getItem(HOME_GROUP_KEY) || "null"); } catch (e) { homeGroupSaved = null; }
  if (homeGroupSaved && typeof homeGroupSaved === "object") {
    homeGroups.forEach(function (g) {
      if (typeof homeGroupSaved[g.id] === "boolean") g.open = homeGroupSaved[g.id];
    });
  }
  function saveHomeGroups() {
    if (printing) return;
    var state = {};
    homeGroups.forEach(function (g) { state[g.id] = g.open; });
    try { localStorage.setItem(HOME_GROUP_KEY, JSON.stringify(state)); } catch (e) {}
  }
  homeGroups.forEach(function (g) { g.addEventListener("toggle", saveHomeGroups); });

  // 섹션 메뉴: 자주 쓰는 8개만 먼저 보여 주고, 나머지는 주제별로 접어 둡니다.
  // 넓은 화면에서는 스크롤 부담이 적으므로 전체를 펼친 상태로 시작합니다.
  //
  // 그 "기본 상태"는 CSS 미디어 쿼리가 정합니다(.sn-groups 참고) — JS 가 여기서 hidden 을
  // 토글하면 첫 화면(HTML)과 로드 뒤 모습이 달라져 목차가 펼쳐지며 내용이 150px 넘게 밀립니다.
  // 그래서 JS 는 "기본과 반대일 때만" 클래스를 붙입니다.
  var snToggle = document.getElementById("snToggle");
  var snMore = document.getElementById("snMore");
  function setSnExpanded(on) {
    if (!snToggle || !snMore) return;
    snToggle.setAttribute("aria-expanded", on ? "true" : "false");
    snMore.classList.toggle("sn-closed", !on);
    snMore.classList.toggle("sn-open", on);
  }
  if (snToggle && snMore) {
    var wideScreen = false;
    try { wideScreen = window.matchMedia("(min-width: 900px)").matches; } catch (e) {}
    setSnExpanded(wideScreen);
    snToggle.addEventListener("click", function () {
      setSnExpanded(snToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  // ---------- 전체 목차 오버레이 ----------
  // 53섹션이 4묶음으로 접혀 있고 목차는 화면 맨 위에 있어, 깊이 내려가면 다른 섹션으로
  // 가려고 「맨 위로」를 거쳐야 했습니다. 섹션 메뉴를 그대로 복제해 어디서든 열 수 있게 합니다.
  var tocModal = document.getElementById("tocModal");
  var tocBody = document.getElementById("tocModalBody");
  var snMoreSrc = document.getElementById("snMore");
  var snQuickSrc = document.querySelector(".section-nav .sn-row");
  if (tocModal && tocBody && snMoreSrc) {
    // 자주 쓰는 8개(위 줄) + 주제별 4묶음 — 본문 섹션 메뉴와 같은 53개가 되게 합니다.
    tocBody.innerHTML =
      (snQuickSrc ? '<div class="sn-group"><span class="sn-group-label">자주 찾는 섹션</span>' + snQuickSrc.innerHTML + "</div>" : "") +
      snMoreSrc.innerHTML;
  }
  function openToc() {
    if (!tocModal || tocModal.classList.contains("show")) return;
    tocModal.classList.add("show");
    // 뒤로가기·닫기 버튼으로 닫히도록 history 항목을 빌리고, 뒤 화면 스크롤을 막습니다.
    pushMenuGuard();
    document.body.classList.add("modal-open");
    var closeBtn = document.getElementById("tocClose");
    if (closeBtn) closeBtn.focus();
  }
  function closeToc() {
    if (!tocModal || !tocModal.classList.contains("show")) return;
    tocModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    releaseMenuGuard();
  }
  var btnTocEl = document.getElementById("btnToc");
  if (btnTocEl) btnTocEl.addEventListener("click", openToc);
  var tocCloseEl = document.getElementById("tocClose");
  if (tocCloseEl) tocCloseEl.addEventListener("click", closeToc);
  if (tocModal) tocModal.addEventListener("click", function (e) { if (e.target === this) closeToc(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" || e.key === "Esc") closeToc(); });
  // 목차에서 섹션을 고르면 창을 닫고 그 자리로 갑니다.
  if (tocBody) tocBody.addEventListener("click", function (e) {
    var chip = e.target.closest ? e.target.closest(".sn-chip") : null;
    if (!chip) return;
    var sec = document.querySelector('.home-section[aria-label="' + chip.getAttribute("data-target") + '"]');
    // 창을 닫으면 빌려 둔 기록 항목을 되돌리는데, 그때 브라우저가 스크롤 위치를 복원합니다.
    // 복원이 우리 이동을 되감을 수 있어, 도착할 때까지 몇 번 더 확인해 이동합니다.
    if (sec) {
      pendingHistoryScroll = sec;
      scrollToEl(sec, "start");
      keepAt(sec);
    }
    closeToc();
  });

  // 지금 보고 있는 섹션의 칩을 강조해, 긴 페이지에서도 위치를 알 수 있게 합니다.
  var snChips = [].slice.call(document.querySelectorAll(".sn-chip"));
  // 칩 강조와 「지금:」 표시를 한 곳에서 갱신합니다.
  // 스크롤을 따라오는 동안은 IntersectionObserver 가, 칩이나 「다음/이전 섹션」 버튼처럼
  // 코드로 옮길 때는 부르는 쪽이 곧바로 불러 표시가 한 박자 늦는 일을 막습니다.
  function setCurrentSection(label) {
    if (!label) return;
    var matched = false;
    // 같은 섹션을 가리키는 칩이 둘 이상일 수 있습니다(섹션 메뉴 + 전체 목차) — 모두 표시합니다.
    snChips.forEach(function (c) {
      var on = c.getAttribute("data-target") === label;
      if (on) matched = true;
      c.classList.toggle("active", on);
      if (on) c.setAttribute("aria-current", "true");
      else c.removeAttribute("aria-current");
    });
    if (!matched) return;
    // 접힌 목차 안에 있는 섹션이면 칩이 안 보이므로, 현재 위치를 글자로도 알려 줍니다.
    var cur = document.getElementById("snCurrent");
    if (cur) cur.textContent = "지금: " + label;
  }
  if ("IntersectionObserver" in window && snChips.length) {
    var snObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        setCurrentSection(en.target.getAttribute("aria-label"));
      });
    }, { rootMargin: "-15% 0px -75% 0px" });
    [].slice.call(document.querySelectorAll("#homeView .home-section")).forEach(function (s) { snObserver.observe(s); });
  }

  function dayOfYearNow() {
    var nowD = new Date();
    var yearStart = new Date(nowD.getFullYear(), 0, 0);
    return Math.floor((nowD - yearStart) / 86400000);
  }

  // ---------- 일일 퀘스트 ----------
  var quests = { date: "", quiz: false, exam: false };
  try {
    quests = JSON.parse(localStorage.getItem("toeic1000_quests") || "{}");
  } catch (e) { quests = { date: "", quiz: false, exam: false }; }
  function saveQuests() {
    try { localStorage.setItem("toeic1000_quests", JSON.stringify(quests)); } catch (e) {}
  }
  function questState() {
    var t = todayKey();
    if (quests.date !== t) { quests = { date: t, quiz: false, exam: false }; saveQuests(); }
    return quests;
  }
  function markQuest(kind) {
    questState();
    if (kind === "quiz") quests.quiz = true;
    else if (kind === "exam") quests.exam = true;
    saveQuests();
    renderQuests();
    renderBadges();
  }
  function renderQuests() {
    var list = document.getElementById("questList");
    var status = document.getElementById("questStatus");
    if (!list || !status) return;
    var st = questState();
    var q1Done = daily.count >= 10;
    var q2Done = !!st.quiz;
    var q3Done = !!st.exam;
    var items = [
      { ico: "📖", name: "단어 10개 외우기", done: q1Done, prog: Math.min(100, Math.round(daily.count / 10 * 100)) },
      { ico: "🎯", name: "퀴즈 1회 완료", done: q2Done, prog: q2Done ? 100 : 0 },
      { ico: "⏱", name: "시험·모의고사 1회 완료", done: q3Done, prog: q3Done ? 100 : 0 }
    ];
    var html = "";
    items.forEach(function (it) {
      html += '<div class="quest-item' + (it.done ? " done" : "") + '">' +
        '<span class="quest-ico">' + it.ico + '</span>' +
        '<span class="quest-name">' + it.name + '</span>' +
        '<span class="quest-track"><span class="quest-fill" style="width:' + it.prog + '%"></span></span>' +
        '<span class="quest-check">' + (it.done ? "✅" : "⬜") + '</span>' +
        "</div>";
    });
    list.innerHTML = html;
    var doneN = (q1Done ? 1 : 0) + (q2Done ? 1 : 0) + (q3Done ? 1 : 0);
    status.textContent = doneN === 3 ? "🏆 오늘의 퀘스트 완료!" : doneN + " / 3 완료";
  }

  // ---------- 오늘의 대화문 ----------

  var dialogueIdx = -1;
  function renderDialogue(forceRandom) {
    var card = document.getElementById("dialogueCard");
    var qb = document.getElementById("dialogueQuizBox");
    if (!card || !qb) return;
    if (forceRandom || dialogueIdx < 0) {
      dialogueIdx = forceRandom ? Math.floor(Math.random() * DIALOGUES.length) : dayOfYearNow() % DIALOGUES.length;
    }
    var d = DIALOGUES[dialogueIdx];
    var html = '<div class="dialogue-title">' + esc(d.title) + '<span class="dialogue-theme">' + esc(d.theme) + '</span></div>';
    html += '<div class="dialogue-lines">';
    d.lines.forEach(function (ln) {
      html += '<div class="dialogue-line"><span class="dialogue-speaker">' + esc(ln[0]) + '</span><span class="dialogue-text">' + esc(ln[1]).replace(/＿＿＿＿/g, '<span class="dialogue-blank">＿＿＿＿</span>') + '</span><button type="button" class="dialogue-speak" title="문장 듣기">🔊</button></div>';
    });
    html += '</div>';
    card.innerHTML = html;
    card.querySelectorAll(".dialogue-speak").forEach(function (b, i) {
      (function (full) {
        b.addEventListener("click", function () { speak(full); });
      })(d.lines[i][2] || d.lines[i][1]);
    });
    var qh = "";
    d.quiz.forEach(function (q, qi) {
      qh += '<div class="dialogue-q"><p class="dialogue-qtext">Q' + (qi + 1) + ". " + esc(q.q) + '</p>';
      q.opts.forEach(function (o) {
        qh += '<button type="button" class="quiz-opt dq-opt" data-qi="' + qi + '" data-a="' + escapeAttr(q.a) + '">' + esc(o) + '</button>';
      });
      qh += '<div class="quiz-feedback" id="dqFb' + qi + '" role="status" aria-live="polite" aria-atomic="true"></div></div>';
    });
    qh += '<div class="dialogue-next-wrap"><button type="button" class="btn quiz-btn" id="dialogueNext">🔄 다른 대화문</button></div>';
    qb.innerHTML = qh;
    var nextBtn = document.getElementById("dialogueNext");
    if (nextBtn) nextBtn.addEventListener("click", function () { renderDialogue(true); });
  }
  var dqPlay = document.getElementById("dialoguePlay");
  if (dqPlay) dqPlay.addEventListener("click", function () {
    if (dialogueIdx < 0) return;
    var d = DIALOGUES[dialogueIdx];
    var t = 0;
    d.lines.forEach(function (ln) {
      setTimeout(function () { speak(ln[2] || ln[1]); }, t);
      t += Math.max(2000, (ln[2] || ln[1]).length * 120);
    });
  });
  var dqBox = document.getElementById("dialogueQuizBox");
  if (dqBox) dqBox.addEventListener("click", function (e) {
    var opt = e.target.closest(".dq-opt");
    if (!opt || opt.disabled) return;
    var qi = parseInt(opt.getAttribute("data-qi"), 10);
    var isCorrect = opt.getAttribute("data-a") === opt.textContent;
    dqBox.querySelectorAll('[data-qi="' + qi + '"]').forEach(function (o) {
      o.disabled = true;
      if (o.getAttribute("data-a") === o.textContent) o.classList.add("correct");
    });
    if (!isCorrect) opt.classList.add("wrong");
    var fb = document.getElementById("dqFb" + qi);
    if (fb) fb.textContent = isCorrect ? "정답입니다! 🎉" : "오답입니다. 정답: " + opt.getAttribute("data-a");
    restoreFocusToFeedback(fb);
  });

  // ---------- 확장 학습 콘텐츠: 문제은행·리딩·출력 연습 ----------

  var partBankState = {};
  function renderPartBank(part) {
    var box = document.getElementById("partBankBox");
    if (!box) return;
    var questions = PART_BANK[part] || PART_BANK["5"];
    partBankState[part] = partBankState[part] || { answered: {} };
    box.innerHTML = questions.map(function (item, qi) {
      var answered = partBankState[part].answered[qi];
      var html = '<article class="bank-card"><span class="bank-label">TOEIC Part ' + part + ' · ' + (qi + 1) + '번</span>' +
        '<div class="bank-q">' + esc(item.q) + ttsBtn(item.q, "문제 듣기") + '</div><div class="bank-options">';
      item.opts.forEach(function (opt) {
        var state = answered ? (opt === item.a ? " correct" : answered.choice === opt ? " wrong" : "") : "";
        html += '<button type="button" class="bank-opt' + state + '" data-part="' + part + '" data-qi="' + qi + '" data-answer="' + escapeAttr(item.a) + '"' + (answered ? " disabled" : "") + '>' + esc(opt) + '</button>';
      });
      html += '</div><div class="bank-feedback" id="partBankFb' + qi + '" role="status" aria-live="polite" aria-atomic="true">' + (answered ? (answered.ok ? "정답입니다! 🎉 " : "다시 확인해 보세요. ❌ ") + esc(item.why) : "") + '</div></article>';
      return html;
    }).join("");
  }
  var partTabs = document.getElementById("partBankTabs");
  if (partTabs) partTabs.addEventListener("click", function (e) {
    var tab = e.target.closest(".part-tab");
    if (!tab) return;
    partTabs.querySelectorAll(".part-tab").forEach(function (el) { el.classList.remove("active"); });
    tab.classList.add("active");
    renderPartBank(tab.getAttribute("data-part"));
  });
  var partBox = document.getElementById("partBankBox");
  if (partBox) partBox.addEventListener("click", function (e) {
    var btn = e.target.closest(".bank-opt");
    if (!btn || btn.disabled) return;
    var part = btn.getAttribute("data-part");
    var qi = parseInt(btn.getAttribute("data-qi"), 10);
    var item = PART_BANK[part][qi];
    var ok = btn.textContent === item.a;
    partBankState[part].answered[qi] = { choice: btn.textContent, ok: ok };
    recordStat("part_" + part, ok);
    renderPartBank(part);
    // 카드를 통째로 다시 그리면 누르던 보기가 사라져 초점이 문서 밖으로 떨어집니다.
    restoreFocusToFeedback(document.getElementById("partBankFb" + qi));
  });

  function renderRelations() {
    var grid = document.getElementById("relationGrid");
    if (!grid) return;
    grid.innerHTML = RELATIONS.map(function (r) {
      return '<article class="relation-card"><b>' + esc(r[0]) + ' · ' + esc(r[1]) + '</b><p>동의어: ' + esc(r[2]) + '</p><p>반의어: ' + esc(r[3]) + '</p><p>연어: <b>' + esc(r[4]) + '</b></p></article>';
    }).join("");
  }

  function renderReadings() {
    var grid = document.getElementById("readingGrid");
    if (!grid) return;
    grid.innerHTML = READING_MINI.map(function (item, i) {
      return '<article class="reading-card"><span class="bank-label">' + esc(item.type) + '</span><h3>' + esc(item.title) + '</h3><div class="reading-passage">' + esc(item.text) + ttsBtn(item.text, "지문 듣기") + '</div><div class="reading-q">' + esc(item.q) + '</div><select class="reading-answer" data-reading="' + i + '" aria-label="' + esc(item.title) + ' 문제 정답 선택"><option value="">정답을 선택하세요</option>' + item.opts.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join("") + '</select><div class="bank-feedback" id="readingFeedback' + i + '" role="status" aria-live="polite" aria-atomic="true"></div></article>';
    }).join("");
    grid.querySelectorAll(".reading-answer").forEach(function (select) {
      select.addEventListener("change", function () {
        var item = READING_MINI[parseInt(this.getAttribute("data-reading"), 10)];
        var fb = document.getElementById("readingFeedback" + this.getAttribute("data-reading"));
        var ok = this.value === item.a;
        recordStat("reading", ok);
        fb.textContent = ok ? "정답입니다! 🎉 핵심 단서가 정확해요." : "다시 읽어 보세요. 핵심 단서: " + item.a;
        fb.style.color = ok ? "var(--green-text)" : "var(--red-text)";
      });
    });
  }

  // ---------- 11) Part 7 복수 지문(이중 지문) ----------

  var drIdx = 0;
  function renderDoubleReading(forceRandom) {
    var box = document.getElementById("doubleReadingGrid");
    if (!box) return;
    if (forceRandom || drIdx < 0) drIdx = Math.floor(Math.random() * DOUBLE_READING.length);
    if (drIdx >= DOUBLE_READING.length) drIdx = 0;
    var s = DOUBLE_READING[drIdx];
    var html = '<div class="reading-card dr-card">';
    html += '<div class="dr-head"><span class="bank-label">' + esc((s.level ? s.level + ' · ' : '') + s.type) + '</span><span class="dr-title">' + esc(s.title) + '</span></div>';
    html += '<div class="dr-passages">';
    s.passages.forEach(function (p) {
      html += '<div class="reading-passage"><b>' + esc(p.label) + '</b><div class="dr-text">' + esc(p.text) + ttsBtn(p.text, "지문 듣기") + '</div></div>';
    });
    html += '</div>';
    html += '<div class="practice-actions"><button type="button" class="btn quiz-btn" id="drPlay">🔊 두 지문 듣기</button><button type="button" class="btn quiz-btn" id="drNext">🔄 다른 세트</button></div>';
    html += '<div id="drQs">';
    s.qs.forEach(function (q, qi) {
      html += '<div class="dialogue-q"><p class="dialogue-qtext">Q' + (qi + 1) + ". " + esc(q.q) + '</p>';
      q.opts.forEach(function (o) { html += '<button type="button" class="quiz-opt p34-opt" data-qi="' + qi + '" data-a="' + escapeAttr(q.a) + '">' + esc(o) + '</button>'; });
      html += '<div class="quiz-feedback" id="drFb' + qi + '" role="status" aria-live="polite" aria-atomic="true"></div></div>';
    });
    html += '</div></div>';
    box.innerHTML = html;
    var play = document.getElementById("drPlay");
    if (play) play.addEventListener("click", function () {
      var t = 0;
      s.passages.forEach(function (p) {
        setTimeout(function () { speak(p.text); }, t);
        t += Math.max(2500, p.text.length * 90);
      });
    });
    var nx = document.getElementById("drNext");
    if (nx) nx.addEventListener("click", function () { drIdx = (drIdx + 1) % DOUBLE_READING.length; renderDoubleReading(false); });
    box.querySelectorAll(".p34-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.disabled) return;
        var qi = parseInt(b.getAttribute("data-qi"), 10);
        var a = b.getAttribute("data-a");
        var ok = b.textContent === a;
        box.querySelectorAll('[data-qi="' + qi + '"]').forEach(function (o) {
          o.disabled = true;
          if (o.getAttribute("data-a") === o.textContent) o.classList.add("correct");
        });
        if (!ok) b.classList.add("wrong");
        recordStat("double_reading", ok);
        var fb = document.getElementById("drFb" + qi);
        var q = s.qs[qi];
        if (fb) fb.innerHTML = (ok ? "정답입니다! 🎉" : "오답입니다. 정답: <b>" + esc(a) + "</b>") +
          '<div class="practice-note">💡 ' + esc(q.why || "") + '</div>';
        restoreFocusToFeedback(fb);
      });
    });
  }

  var speakingPromptIdx = 0;
  function renderSpeakingPrompt() {
    var box = document.getElementById("speakingPromptList");
    if (!box) return;
    var p = SPEAKING_PROMPTS[speakingPromptIdx];
    box.innerHTML = '<div class="prompt-item"><b>Q</b><span>' + esc(p[0]) + '<br><small>추천 단어: ' + esc(p[1]) + '</small></span></div>';
  }
  var speakingListen = document.getElementById("speakingListen");
  if (speakingListen) speakingListen.addEventListener("click", function () { speak(SPEAKING_PROMPTS[speakingPromptIdx][0]); });
  var speakingRandom = document.getElementById("speakingRandom");
  if (speakingRandom) speakingRandom.addEventListener("click", function () { speakingPromptIdx = (speakingPromptIdx + 1) % SPEAKING_PROMPTS.length; renderSpeakingPrompt(); });

  var writingPromptIdx = dayOfYearNow() % WRITING_PROMPTS.length;
  function renderWritingPrompt() {
    var box = document.getElementById("writingPrompt");
    if (box) box.textContent = WRITING_PROMPTS[writingPromptIdx][0];
    var feedback = document.getElementById("writingFeedback");
    if (feedback) feedback.textContent = "";
  }
  var writingCheck = document.getElementById("writingCheck");
  if (writingCheck) writingCheck.addEventListener("click", function () {
    var value = (document.getElementById("writingArea").value || "").trim();
    var feedback = document.getElementById("writingFeedback");
    if (!value) { feedback.textContent = "문장을 먼저 작성해 보세요."; return; }
    var checks = [value.length >= 25, /[.!?]$/.test(value), /\b(I|We|Please|Thank|The)\b/i.test(value)];
    feedback.textContent = "체크: " + (checks[0] ? "길이 ✓" : "조금 더 구체적으로 · ") + " " + (checks[1] ? "문장부호 ✓" : "문장부호 추가 · ") + " " + (checks[2] ? "정중한 주어/표현 ✓" : "주어·정중 표현 확인") + " / 예시를 참고해 다듬어 보세요.";
  });
  var writingSample = document.getElementById("writingSample");
  if (writingSample) writingSample.addEventListener("click", function () { document.getElementById("writingFeedback").textContent = "예시: " + WRITING_PROMPTS[writingPromptIdx][1]; });

  var shadowingIdx = 0;
  var shadowingVisible = false;
  function renderShadowing() {
    var box = document.getElementById("shadowingSentence");
    if (!box) return;
    box.textContent = shadowingVisible ? SHADOWING_SENTENCES[shadowingIdx] : "스크립트를 가리고 먼저 들어 보세요.";
  }
  var shadowingPlay = document.getElementById("shadowingPlay");
  if (shadowingPlay) shadowingPlay.addEventListener("click", function () { speakRate(SHADOWING_SENTENCES[shadowingIdx], parseFloat(document.getElementById("shadowingSpeed").value) || 0.85); });
  var shadowingReveal = document.getElementById("shadowingReveal");
  if (shadowingReveal) shadowingReveal.addEventListener("click", function () { shadowingVisible = !shadowingVisible; renderShadowing(); });
  var shadowingNext = document.getElementById("shadowingNext");
  if (shadowingNext) shadowingNext.addEventListener("click", function () { shadowingIdx = (shadowingIdx + 1) % SHADOWING_SENTENCES.length; shadowingVisible = false; renderShadowing(); });

  var ddayInput = document.getElementById("examDateInput");
  function localDateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }
  function renderDday() {
    var result = document.getElementById("ddayResult");
    if (!result) return;
    var raw = ddayInput && ddayInput.value;
    if (!raw) { result.innerHTML = '<p class="practice-note">시험 날짜를 설정하면 D-day와 추천 학습량이 표시됩니다.</p>'; return; }
    var target = new Date(raw + "T00:00:00");
    if (isNaN(target.getTime())) { result.innerHTML = '<p class="practice-note">시험 날짜를 확인해 주세요.</p>'; return; }
    var now = new Date();
    var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((target - todayStart) / 86400000);
    if (days < 0) { result.innerHTML = '<div class="dday-number">D+' + Math.abs(days) + '</div><p class="practice-note">새 시험 날짜를 설정해 보세요.</p>'; return; }
    var remaining = Math.max(0, totalCount - Object.keys(learned).filter(function (k) { return learned[k]; }).length);
    var dailyWords = Math.min(remaining, Math.max(10, Math.ceil(remaining / Math.max(1, days))));
    result.innerHTML = '<div class="dday-number">D-' + days + '</div><p class="practice-note">남은 미학습 단어 ' + remaining + '개 · 하루 약 ' + dailyWords + '개 추천</p><div class="dday-plan"><div><b>' + Math.min(30, dailyWords) + '</b>새 단어</div><div><b>10</b>퀴즈</div><div><b>1</b>복습</div></div>';
  }
  if (ddayInput) {
    try { ddayInput.value = localStorage.getItem("toeic1000_examdate") || ""; } catch (e) {}
    ddayInput.addEventListener("change", renderDday);
  }
  var saveExamDate = document.getElementById("saveExamDate");
  if (saveExamDate) saveExamDate.addEventListener("click", function () { try { localStorage.setItem("toeic1000_examdate", ddayInput.value); } catch (e) {} renderDday(); renderDdayPlan(); showToast("📅 시험 날짜를 저장했습니다."); });
  var clearExamDate = document.getElementById("clearExamDate");
  if (clearExamDate) clearExamDate.addEventListener("click", function () { ddayInput.value = ""; try { localStorage.removeItem("toeic1000_examdate"); } catch (e) {} renderDday(); renderDdayPlan(); });

  var localResourceLink = document.querySelector(".resource-local-link");
  if (localResourceLink) localResourceLink.addEventListener("click", function (e) {
    e.preventDefault();
    var target = document.getElementById("today-section");
    if (target) scrollToEl(target, "start");
  });

  // ---------- 단어장 CSV 내보내기 ----------
  function downloadWordlistCsv(filter) {
    var rows = [["word", "ipa", "pronunciation", "meaning", "example", "translation", "learned"]];
    allWords().forEach(function (w) {
      if (filter === "learned" && !learned[w[0]]) return;
      rows.push([w[0], w[1], w[2], w[3], w[4], w[5], learned[w[0]] ? "Y" : "N"]);
    });
    if (rows.length === 1) {
      showToast("학습 완료 단어가 아직 없습니다. 단어를 외우면 내보낼 수 있어요!");
      return;
    }
    var csv = rows.map(function (r) {
      return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\r\n");
    var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filter === "learned" ? "toeic_learned_words.csv" : "toeic_all_words.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast("📥 단어장 CSV를 다운로드했습니다.");
  }
  var dlAllCsv = document.getElementById("dlAllCsv");
  if (dlAllCsv) dlAllCsv.addEventListener("click", function () { downloadWordlistCsv("all"); });
  var dlLearnedCsv = document.getElementById("dlLearnedCsv");
  if (dlLearnedCsv) dlLearnedCsv.addEventListener("click", function () { downloadWordlistCsv("learned"); });

  // ---------- 랜덤 10문제 미니 테스트 ----------
  var miniQuiz = { words: [], idx: 0, correct: 0, answered: false, done: false };
  function startMiniQuiz() {
    var pool = allWords().slice();
    shuffle(pool);
    miniQuiz.words = pool.slice(0, 10).map(function (w) {
      var answer = w[3];
      var opts = [answer];
      var attempts = 0;
      while (opts.length < 4 && attempts < 500) {
        attempts++;
        var d = pool[Math.floor(Math.random() * pool.length)][3];
        if (opts.indexOf(d) === -1) opts.push(d);
      }
      shuffle(opts);
      return { word: w[0], pron: w[2], answer: answer, options: opts };
    });
    miniQuiz.idx = 0;
    miniQuiz.correct = 0;
    miniQuiz.answered = false;
    miniQuiz.done = false;
    renderMiniQuiz();
  }
  function renderMiniQuiz() {
    var box = document.getElementById("miniQuizBox");
    if (!box) return;
    if (miniQuiz.done) {
      var pct = miniQuiz.words.length ? Math.round(miniQuiz.correct / miniQuiz.words.length * 100) : 0;
      var msg = pct >= 80 ? "훌륭해요! 🔥" : pct >= 50 ? "좋아요, 오답은 다시 만나요. 💪" : "오답 단어를 복습해 보세요. 🌱";
      box.innerHTML = '<div class="bank-card"><span class="bank-label">랜덤 미니 테스트 결과</span>' +
        '<div class="bank-q">🎉 10문제 중 ' + miniQuiz.correct + '개 정답 (' + pct + '%)</div>' +
        '<p class="practice-note">' + msg + ' — 새 테스트를 시작해 기록을 갱신해 보세요.</p></div>';
      return;
    }
    if (!miniQuiz.words.length) {
      box.innerHTML = '<p class="practice-note">시작하기 버튼을 누르면 전체 단어에서 10문제가 나옵니다.</p>';
      return;
    }
    var q = miniQuiz.words[miniQuiz.idx];
    var html = '<div class="bank-card"><span class="bank-label">랜덤 미니 테스트 · ' + (miniQuiz.idx + 1) + ' / ' + miniQuiz.words.length + '</span>' +
      '<div class="bank-q">' + esc(q.word) + (q.pron ? ' <small style="font-size:12px;color:var(--text-muted)">' + esc(q.pron) + '</small>' : '') + '</div><div class="bank-options">' +
      q.options.map(function (opt) { return '<button type="button" class="bank-opt">' + esc(opt) + '</button>'; }).join("") +
      '</div><div class="bank-feedback" id="miniQuizFeedback" role="status" aria-live="polite" aria-atomic="true"></div></div>';
    box.innerHTML = html;
    box.querySelectorAll(".bank-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (miniQuiz.answered) return;
        miniQuiz.answered = true;
        var ok = btn.textContent === q.answer;
        if (ok) miniQuiz.correct++;
        recordStat("mini", ok);
        box.querySelectorAll(".bank-opt").forEach(function (o) {
          o.disabled = true;
          if (o.textContent === q.answer) o.classList.add("correct");
          if (o === btn && !ok) o.classList.add("wrong");
        });
        var fb = document.getElementById("miniQuizFeedback");
        fb.textContent = ok ? "정답입니다! 🎉" : "정답: " + q.answer;
        fb.style.color = ok ? "var(--green-text)" : "var(--red-text)";
        restoreFocusToFeedback(fb);
        var next = document.createElement("button");
        next.type = "button";
        next.className = "btn quiz-btn";
        next.style.marginTop = "10px";
        next.textContent = miniQuiz.idx + 1 >= miniQuiz.words.length ? "🏁 결과 보기" : "다음 문제 →";
        next.addEventListener("click", function () {
          miniQuiz.idx++;
          miniQuiz.answered = false;
          if (miniQuiz.idx >= miniQuiz.words.length) miniQuiz.done = true;
          renderMiniQuiz();
        });
        fb.appendChild(next);
      });
    });
  }
  var miniQuizStart = document.getElementById("miniQuizStart");
  if (miniQuizStart) miniQuizStart.addEventListener("click", startMiniQuiz);

  // ================= 신규 확장 콘텐츠 (data/extra.js) =================
  // extra.js 는 홈의 확장 섹션에만 쓰여 첫 화면에는 내려받지 않습니다(loadExtra 로 지연 로드).
  // 받아온 뒤 한 번만 합치도록 applyExtraData 를 따로 둡니다.
  var EXTRA = window.TOEIC_EXTRA || {};
  var extraApplied = false;
  function applyExtraData() {
    if (extraApplied) return;
    extraApplied = true;
    if (EXTRA.part7 && EXTRA.part7.length) DOUBLE_READING = DOUBLE_READING.concat(EXTRA.part7);
    if (EXTRA.situations && EXTRA.situations.length) DIALOGUES = DIALOGUES.concat(EXTRA.situations);
    if (EXTRA.stories && EXTRA.stories.length) MNEMONICS = MNEMONICS.concat(EXTRA.stories);
    if (EXTRA.traps && EXTRA.traps.length) LC_TRAINING = LC_TRAINING.concat(EXTRA.traps);
    PART6_SETS = EXTRA.part6 || [];
    DICT_LIST = EXTRA.dictation || [];
  }

  // ---------- Part 6 장문 공란 ----------
  // 실제 문항은 applyExtraData() 에서 채웁니다.
  var PART6_SETS = [];
  var p6Idx = 0;
  function renderPart6(forceRandom) {
    var box = document.getElementById("part6Box");
    if (!box) return;
    if (!PART6_SETS.length) { box.innerHTML = '<p class="practice-note">Part 6 데이터를 불러오지 못했습니다.</p>'; return; }
    if (forceRandom || p6Idx < 0) p6Idx = Math.floor(Math.random() * PART6_SETS.length);
    if (p6Idx >= PART6_SETS.length) p6Idx = 0;
    var s = PART6_SETS[p6Idx];
    var text = esc(s.text).replace(/__\((\d+)\)__/g, '<span class="p6-blank">($1)</span>');
    var html = '<div class="reading-card"><span class="bank-label">Part 6 · ' + esc(s.type) + '</span><h3>' + esc(s.title) + '</h3>';
    html += '<div class="reading-passage p6-text">' + text + ttsBtn(s.text.replace(/\s*__\((\d+)\)__\s*/g, " blank "), "지문 듣기") + '</div>';
    html += '<div class="practice-actions"><button type="button" class="btn quiz-btn" id="p6Next">🔄 다른 지문</button></div>';
    s.blanks.forEach(function (b) {
      html += '<div class="p6-q"><p class="reading-q">(' + b.n + ') 빈칸에 알맞은 것은?</p><div class="bank-options">';
      b.opts.forEach(function (o) { html += '<button type="button" class="bank-opt" data-b="' + b.n + '" data-a="' + escapeAttr(b.a) + '">' + esc(o) + '</button>'; });
      html += '</div><div class="bank-feedback" id="p6Fb' + b.n + '" role="status" aria-live="polite" aria-atomic="true"></div></div>';
    });
    html += '</div>';
    box.innerHTML = html;
    var nx = document.getElementById("p6Next");
    if (nx) nx.addEventListener("click", function () { p6Idx = (p6Idx + 1) % PART6_SETS.length; renderPart6(false); });
    box.querySelectorAll(".bank-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        var bn = parseInt(btn.getAttribute("data-b"), 10);
        var a = btn.getAttribute("data-a");
        var ok = btn.textContent === a;
        box.querySelectorAll('[data-b="' + bn + '"]').forEach(function (o) {
          o.disabled = true;
          if (o.getAttribute("data-a") === o.textContent) o.classList.add("correct");
        });
        if (!ok) btn.classList.add("wrong");
        recordStat("part6", ok);
        var b = s.blanks.filter(function (x) { return x.n === bn; })[0];
        var fb = document.getElementById("p6Fb" + bn);
        if (fb) fb.innerHTML = (ok ? "정답입니다! 🎉" : "오답입니다. 정답: <b>" + esc(a) + "</b>") + '<div class="practice-note">💡 ' + esc(b ? b.why : "") + '</div>';
        restoreFocusToFeedback(fb);
      });
    });
  }

  // ---------- 동의어 치환 ----------
  var paraQuiz = makeMiniQuiz({
    boxId: "paraBox", title: "동의어 치환", statKey: "para", count: 8,
    build: function () {
      return (EXTRA.paraphrase || []).map(function (p) {
        return { tag: p.tag, prompt: p.prompt, answer: p.a, options: shuffleArr(p.opts.slice()), why: p.why };
      });
    },
    emptyHint: "시작 버튼을 누르면 동의어 치환 8문제가 나옵니다."
  });
  wireMiniQuiz("paraStart", paraQuiz, true);

  // ---------- 연결어·접속부사 ----------
  var transQuiz = makeMiniQuiz({
    boxId: "transBox", title: "연결어", statKey: "trans", count: 8,
    build: function () {
      return (EXTRA.transitions || []).map(function (t) {
        return { tag: t.tag, prompt: t.prompt, answer: t.a, options: shuffleArr(t.opts.slice()), why: t.why };
      });
    },
    emptyHint: "시작 버튼을 누르면 연결어·접속부사 8문제가 나옵니다."
  });
  wireMiniQuiz("transStart", transQuiz, true);

  // ---------- 전치사 콜로케이션 ----------
  var prepQuiz = makeMiniQuiz({
    boxId: "prepBox", title: "전치사", statKey: "prep", count: 8,
    build: function () {
      return (EXTRA.prepositions || []).map(function (t) {
        return { tag: t.tag, prompt: t.prompt, answer: t.a, options: shuffleArr(t.opts.slice()), why: t.why };
      });
    },
    emptyHint: "시작 버튼을 누르면 전치사 콜로케이션 8문제가 나옵니다."
  });
  wireMiniQuiz("prepStart", prepQuiz, true);

  // ---------- Part 1 사진 묘사 ----------
  var part1Quiz = makeMiniQuiz({
    boxId: "part1Box", title: "Part 1 묘사", statKey: "part1", count: 8,
    build: function () {
      return (EXTRA.part1 || []).map(function (p) {
        return { tag: "Part 1 묘사", passageHtml: "<b>🖼 장면</b> " + esc(p.scene), prompt: p.q, answer: p.a, options: shuffleArr(p.opts.slice()), why: p.why };
      });
    },
    emptyHint: "시작 버튼을 누르면 Part 1 묘사 8문제가 나옵니다."
  });
  wireMiniQuiz("part1Start", part1Quiz, true);

  // ---------- 숫자·금액 듣기 ----------
  var numQuiz = makeMiniQuiz({
    boxId: "numBox", title: "숫자·금액", statKey: "num", count: 10, autoPlay: true,
    build: function () {
      return (EXTRA.numbers || []).map(function (n) {
        return { tag: n.tag, audio: n.audio, prompt: "🔊 들리는 숫자·금액을 고르세요.", answer: n.a, options: shuffleArr(n.opts.slice()), why: n.why, autoPlay: true, example: n.audio, exampleKo: "" };
      });
    },
    emptyHint: "시작 버튼을 누르면 숫자·금액 10문제가 나옵니다."
  });
  wireMiniQuiz("numStart", numQuiz, true);

  // ---------- 빈도순 기출 어휘 ----------
  // limit — 홈 프리렌더가 "앞에서 20개만" 심을 때 씁니다(전체 목록은 units/frequency.html).
  //        앱이 뜨면 인자 없이 다시 그려서 사용자는 200개를 그대로 봅니다.
  function renderFrequency(filter, limit) {
    var grid = document.getElementById("freqGrid");
    if (!grid) return;
    var q = (filter || "").trim().toLowerCase();
    var list = (EXTRA.frequency || []).filter(function (w) {
      if (!q) return true;
      return (w[0] + " " + w[1]).toLowerCase().indexOf(q) !== -1;
    });
    if (!list.length) { grid.innerHTML = '<p class="practice-note">검색 결과가 없습니다.</p>'; return; }
    if (limit) list = list.slice(0, limit);
    grid.innerHTML = list.map(function (w) {
      return '<div class="freq-item"><b class="freq-word" lang="en">' + esc(w[0]) + '</b><span class="freq-pos">' + esc(w[2]) + '</span><span class="freq-mean">' + esc(w[1]) + '</span>' + ttsBtn(w[0], "발음 듣기") + '</div>';
    }).join("");
  }
  var freqSearchEl = document.getElementById("freqSearch");
  if (freqSearchEl) freqSearchEl.addEventListener("input", function () { renderFrequency(this.value); });

  // ---------- 30일 스프린트 커리큘럼 ----------
  function unitProgressOf(id) {
    var u = null;
    all.forEach(function (x) { if (x.id === id) u = x; });
    if (!u) return null;
    var d = u.words.filter(function (w) { return learned[w[0]]; }).length;
    return { u: u, done: d, total: u.words.length, pct: u.words.length ? Math.round(d / u.words.length * 100) : 0 };
  }
  function renderSprint() {
    var box = document.getElementById("sprintBox");
    if (!box) return;
    var list = EXTRA.sprint || [];
    if (!list.length) { box.innerHTML = '<p class="practice-note">스프린트 데이터를 불러오지 못했습니다.</p>'; return; }
    var nextFound = false;
    var html = '<ol class="sprint-list">';
    list.forEach(function (d) {
      var p = unitProgressOf(d.unit);
      var pct = p ? p.pct : 0;
      var isNext = false;
      if (!nextFound && pct < 100) { isNext = true; nextFound = true; }
      html += '<li class="sprint-item' + (isNext ? " next" : "") + '">' +
        '<span class="sprint-day">D' + d.day + '</span>' +
        '<span class="sprint-title">UNIT ' + d.unit + (p ? " " + esc(p.u.title) : "") + '</span>' +
        '<span class="sprint-focus">' + esc(d.focus) + '</span>' +
        '<span class="sprint-pct">' + pct + '%</span>' +
        '<button type="button" class="btn quiz-btn sprint-go" data-unit="' + d.unit + '">학습</button></li>';
    });
    html += '</ol>';
    box.innerHTML = html;
    box.querySelectorAll(".sprint-go").forEach(function (b) {
      b.addEventListener("click", function () {
        showListView();
        var sec = document.getElementById("unit-" + b.getAttribute("data-unit"));
        if (sec) scrollToEl(sec);
      });
    });
  }

  // ---------- 매일 3문장 받아쓰기 ----------
  // 실제 문장은 applyExtraData() 에서 채웁니다.
  var DICT_LIST = [];
  function dictToday() {
    var n = DICT_LIST.length;
    if (!n) return [];
    var start = (dayOfYearNow() * 3) % n;
    return [DICT_LIST[start % n], DICT_LIST[(start + 1) % n], DICT_LIST[(start + 2) % n]];
  }
  function renderDictation() {
    var box = document.getElementById("dictBox");
    if (!box) return;
    var sents = dictToday();
    if (!sents.length) { box.innerHTML = '<p class="practice-note">받아쓰기 데이터를 불러오지 못했습니다.</p>'; return; }
    var html = '<div class="practice-actions"><button type="button" class="btn quiz-btn" id="dictPlay">🔊 3문장 듣기</button><button type="button" class="btn quiz-btn" id="dictCheckDaily">✅ 채점</button></div>';
    sents.forEach(function (s, i) {
      html += '<div class="dict-row"><span class="dict-no">' + (i + 1) + '</span><input type="text" class="dict-input dict-line" data-i="' + i + '" aria-label="받아쓰기 ' + (i + 1) + '번" placeholder="들리는 문장을 입력하세요" autocomplete="off"><button type="button" class="btn quiz-btn dict-play" data-i="' + i + '">🔊</button></div>';
    });
    html += '<div class="practice-note" id="dictFeedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    box.innerHTML = html;
    var playAll = document.getElementById("dictPlay");
    if (playAll) playAll.addEventListener("click", function () {
      var tt = 0;
      sents.forEach(function (s) { setTimeout(function () { speak(s); }, tt); tt += Math.max(2000, s.length * 110); });
    });
    box.querySelectorAll(".dict-play").forEach(function (b) {
      b.addEventListener("click", function () { var s = sents[parseInt(b.getAttribute("data-i"), 10)]; if (s) speak(s); });
    });
    var check = document.getElementById("dictCheckDaily");
    if (check) check.addEventListener("click", function () {
      var total = 0;
      box.querySelectorAll(".dict-line").forEach(function (inp) {
        var i = parseInt(inp.getAttribute("data-i"), 10);
        var score = cdScore(inp.value || "", sents[i]);
        total += score;
        inp.style.borderColor = score >= 90 ? "var(--green)" : score >= 60 ? "var(--accent)" : "#fa5252";
      });
      var avg = Math.round(total / sents.length);
      recordStat("dictation", avg >= 80);
      var fb = document.getElementById("dictFeedback");
      if (fb) fb.innerHTML = "평균 일치도 <b>" + avg + "%</b> · " + (avg >= 90 ? "완벽해요! 🎉" : avg >= 60 ? "거의 다 왔어요. 다시 들어 보세요. 💪" : "정답을 확인하고 다시 시도해 보세요. 🌱") +
        '<div class="listen-script">' + sents.map(function (s, i) { return (i + 1) + ". " + esc(s) + ttsBtn(s, "듣기"); }).join("<br>") + '</div>';
    });
  }

  // ---------- 말하기·쓰기 템플릿 ----------
  function renderTplExtra() {
    var sg = document.getElementById("speakTplGrid");
    if (sg) {
      sg.innerHTML = (EXTRA.speakTemplates || []).map(function (t) {
        return '<article class="reading-card"><span class="bank-label">' + esc(t.type) + '</span><h3>' + esc(t.ko) + '</h3>' +
          t.lines.map(function (l) { return '<div class="reading-passage template-line">' + esc(l) + ttsBtn(l, "문장 듣기") + '</div>'; }).join("") + '</article>';
      }).join("");
    }
    var wg = document.getElementById("writeTplGrid");
    if (wg) {
      wg.innerHTML = (EXTRA.writeTemplates || []).map(function (t) {
        return '<article class="reading-card"><span class="bank-label">' + esc(t.type) + '</span><h3>' + esc(t.ko) + '</h3>' +
          '<div class="tpl-structure">구성: ' + t.structure.map(esc).join(" → ") + '</div>' +
          '<div class="tpl-sample">' + esc(t.sample) + ttsBtn(t.sample, "예시 듣기") + '</div></article>';
      }).join("");
    }
  }

  // ---------- Speaking·Writing 시험 구성·유형별 연습 ----------
  function renderSwExtra() {
    var fb = document.getElementById("swFormatBox");
    if (fb) {
      fb.innerHTML = (EXTRA.swFormat || []).map(function (r) {
        return '<div class="sw-row"><span class="bank-label">' + esc(r.test) + ' ' + esc(r.q) + '번</span>' +
          '<span class="sw-task">' + esc(r.task) + '</span>' +
          '<span class="sw-ko">' + esc(r.ko) + '</span>' +
          '<span class="sw-time">' + esc(r.time) + '</span>' +
          '<span class="sw-points">' + (r.points || []).map(function (p) { return '<span class="tag tag-blue">' + esc(p) + '</span>'; }).join("") + '</span></div>';
      }).join("");
    }
    var sb = document.getElementById("speakDrillBox");
    if (sb) {
      sb.innerHTML = (EXTRA.speakDrills || []).map(function (d) {
        return '<article class="speaking-card"><span class="bank-label">' + esc(d.type) + '</span><h3>' + esc(d.ko) + '</h3>' +
          '<div class="reading-passage">' + esc(d.text) + ttsBtn(d.text, "문장 듣기") + '</div>' +
          '<p class="practice-note">' + esc(d.tip) + '</p></article>';
      }).join("");
    }
    var wb = document.getElementById("writeDrillBox");
    if (wb) {
      wb.innerHTML = (EXTRA.writeDrills || []).map(function (d) {
        var body = "";
        if (d.given) body += '<div class="sw-given">주어진 단어: ' + d.given.map(function (w) { return '<b>' + esc(w) + '</b>'; }).join(" + ") + '</div>';
        if (d.request) body += '<div class="reading-passage">' + esc(d.request) + ttsBtn(d.request, "요청 듣기") + '</div>';
        if (d.question) body += '<div class="reading-passage">' + esc(d.question) + ttsBtn(d.question, "질문 듣기") + '</div>';
        if (d.outline) body += '<div class="tpl-structure">구성: ' + d.outline.map(esc).join(" → ") + '</div>';
        return '<article class="writing-card"><span class="bank-label">' + esc(d.type) + '</span><h3>' + esc(d.ko) + '</h3>' + body +
          '<details class="sw-sample"><summary>예시 답안 보기</summary><div class="tpl-sample">' + esc(d.sample) + ttsBtn(d.sample, "예시 듣기") + '</div></details></article>';
      }).join("");
    }
  }

  // ---------- 문법 교재 3단계 카드 ----------
  function renderGrammarBooks() {
    var grid = document.getElementById("grammarBookGrid");
    if (!grid) return;
    var ico = { "초급": "🟢", "중급": "🟡", "고급": "🔴" };
    var cards = GRAMMAR_BOOKS.map(function (b) {
      var unit = (b.chapters || []).length;
      var qs = (b.chapters || []).reduce(function (n, c) { return n + ((c.practice || []).length); }, 0);
      return '<article class="guide-card"><h3>' + (ico[b.level] || "🟡") + ' ' + esc(b.title) +
        ' <span class="tag tag-blue">' + esc(b.level) + ' · ' + esc(b.cefr) + '</span></h3>' +
        '<p>' + esc(b.subtitle) + ' · ' + unit + '과 · 연습 ' + qs + '문항</p>' +
        '<a href="grammar/' + esc(b.id) + '.html">교재 열기 ↗</a></article>';
    });
    cards.push('<article class="guide-card"><h3>📘 문법 교재 허브</h3>' +
      '<p>세 단계 교재의 목차와 학습 순서를 한 페이지에서 확인할 수 있어요.</p>' +
      '<a href="grammar/">교재 전체 보기 ↗</a></article>');
    cards.push('<article class="guide-card"><h3>🧾 문법 한 장 요약</h3>' +
      '<p>36과의 핵심 개념과 형태를 한 페이지에 모았습니다. 인쇄해 두고 시험 전 복습용으로 쓰세요.</p>' +
      '<a href="grammar/cheatsheet.html">한 장 요약 열기 ↗</a></article>');
    grid.innerHTML = cards.join("");
  }

  // ---------- 회화 교재 3단계 카드 ----------
  function renderConversationBooks() {
    var grid = document.getElementById("conversationBookGrid");
    if (!grid) return;
    var ico = { "초급": "🟢", "중급": "🟡", "고급": "🔴" };
    var cards = CONVERSATION_BOOKS.map(function (b) {
      var unit = (b.chapters || []).length;
      var qs = (b.chapters || []).reduce(function (n, c) { return n + ((c.practice || []).length); }, 0);
      return '<article class="guide-card"><h3>' + (ico[b.level] || "🟡") + ' ' + esc(b.title) +
        ' <span class="tag tag-blue">' + esc(b.level) + ' · ' + esc(b.cefr) + '</span></h3>' +
        '<p>' + esc(b.subtitle) + ' · ' + unit + '과 · 연습 ' + qs + '문항</p>' +
        '<a href="conversation/' + esc(b.id) + '.html">교재 열기 ↗</a></article>';
    });
    cards.push('<article class="guide-card"><h3>📕 회화 교재 허브</h3>' +
      '<p>세 단계 교재의 목차와 학습 순서를 한 페이지에서 확인할 수 있어요.</p>' +
      '<a href="conversation/">교재 전체 보기 ↗</a></article>');
    grid.innerHTML = cards.join("");
  }

  // ---------- 전략·공략 가이드 카드 ----------
  function renderGuides() {
    var grid = document.getElementById("guideCardGrid");
    if (!grid) return;
    grid.innerHTML = (EXTRA.guides || []).map(function (g) {
      return '<article class="guide-card"><h3>' + esc(g.title) + '</h3><p>' + esc(g.desc) + '</p><a href="guides/' + esc(g.slug) + '.html">가이드 읽기 ↗</a></article>';
    }).join("");
  }

  // ---------- 시간 배분 코치 ----------
  function renderPace() {
    var box = document.getElementById("paceResult");
    if (!box) return;
    var mEl = document.getElementById("paceMinutes"), qEl = document.getElementById("paceQuestions");
    var mins = parseFloat(mEl ? mEl.value : "") || 0;
    var qs = parseFloat(qEl ? qEl.value : "") || 0;
    if (!mins || !qs) { box.innerHTML = '<p class="practice-note">남은 시간(분)과 문항 수를 입력하면 문항당 권장 시간이 계산됩니다.</p>'; return; }
    var sec = Math.round(mins * 60 / qs);
    box.innerHTML = '<div class="pace-grid">' +
      '<div class="pace-box"><b>' + sec + '초</b><span>문항당 권장 시간</span></div>' +
      '<div class="pace-box"><b>' + (Math.round(mins / qs * 10) / 10) + '분</b><span>문항당(분)</span></div>' +
      '<div class="pace-box"><b>' + mins + '분</b><span>총 가용 시간</span></div>' +
      '</div><div class="listen-script" style="margin-top:10px">⏱ Part 5는 문항당 20~25초, Part 7 단일 지문은 35~45초, 복수 지문 세트는 2분 30초를 목표로 하세요.</div>';
  }
  var paceM = document.getElementById("paceMinutes");
  if (paceM) paceM.addEventListener("input", renderPace);
  var paceQ = document.getElementById("paceQuestions");
  if (paceQ) paceQ.addEventListener("input", renderPace);

  // ---------- 2인 대결 퀴즈 ----------
  var battle = { on: false, idx: 0, per: 5, q: [], s1: 0, s2: 0, answered: false };
  function battleStart() {
    var pool = allWords().slice();
    if (!pool.length) return;
    shuffleArr(pool);
    battle.q = pool.slice(0, 10).map(function (w) {
      var answer = w[3], opts = [answer], att = 0;
      while (opts.length < 4 && att < 500) { att++; var d = pool[Math.floor(Math.random() * pool.length)][3]; if (opts.indexOf(d) === -1) opts.push(d); }
      shuffleArr(opts);
      return { word: w[0], answer: answer, options: opts };
    });
    battle.on = true; battle.idx = 0; battle.s1 = 0; battle.s2 = 0; battle.answered = false;
    renderBattle();
  }
  function renderBattle() {
    var box = document.getElementById("battleBox");
    if (!box) return;
    if (!battle.on) { box.innerHTML = '<p class="practice-note">시작 버튼을 누르면 1번 플레이어부터 5문제씩 번갈아 풀어요. 점수가 높은 사람이 승리합니다.</p>'; return; }
    if (battle.idx >= battle.q.length) {
      var win = battle.s1 === battle.s2 ? "무승부! 🤝" : (battle.s1 > battle.s2 ? "1번 플레이어 승리! 🏆" : "2번 플레이어 승리! 🏆");
      box.innerHTML = '<div class="quiz-result"><div class="score">' + battle.s1 + " : " + battle.s2 + '</div><p>' + win + '</p><button class="btn quiz-btn" id="battleRestart">🔁 다시 대결</button></div>';
      var rb = document.getElementById("battleRestart");
      if (rb) rb.addEventListener("click", battleStart);
      return;
    }
    var cur = battle.idx < battle.per ? 1 : 2;
    var q = battle.q[battle.idx];
    box.innerHTML = '<div class="bank-card"><div class="battle-head"><span class="p1">P1 ' + battle.s1 + '</span><span>🎯 ' + (battle.idx + 1) + ' / ' + battle.q.length + ' · 플레이어 ' + cur + '</span><span class="p2">' + battle.s2 + ' P2</span></div>' +
      '<div class="bank-q">' + esc(q.word) + ttsBtn(q.word, "발음 듣기") + '</div><div class="bank-options">' +
      q.options.map(function (o) { return '<button type="button" class="bank-opt">' + esc(o) + '</button>'; }).join("") +
      '</div><div class="bank-feedback" id="battleFb" role="status" aria-live="polite" aria-atomic="true"></div></div>';
    box.querySelectorAll(".bank-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        if (battle.answered) return;
        battle.answered = true;
        var ok = b.textContent === q.answer;
        if (cur === 1) { if (ok) battle.s1++; } else { if (ok) battle.s2++; }
        recordStat("battle", ok);
        box.querySelectorAll(".bank-opt").forEach(function (o) { o.disabled = true; if (o.textContent === q.answer) o.classList.add("correct"); });
        if (!ok) b.classList.add("wrong");
        var fb = document.getElementById("battleFb");
        fb.textContent = (ok ? "정답! 🎉 " : "오답! 정답: " + q.answer + " ") + "다음으로 넘어갑니다.";
        restoreFocusToFeedback(fb);
        var next = document.createElement("button");
        next.type = "button"; next.className = "btn quiz-btn"; next.style.marginTop = "10px"; next.textContent = "다음 ▶";
        next.addEventListener("click", function () { battle.idx++; battle.answered = false; renderBattle(); });
        fb.appendChild(next);
      });
    });
  }
  var battleBtn = document.getElementById("battleStart");
  if (battleBtn) battleBtn.addEventListener("click", battleStart);

  // ---------- 오답 유형 자동 분류 ----------
  var STAT_CATEGORY = {
    en2ko: "어휘", ko2en: "어휘", mini: "어휘", speed: "어휘", collo: "연어", ctx: "문맥", para: "동의어",
    // 퀴즈·시험 모드는 유형 select 값이 접두사로 붙어 저장됩니다(quiz_en2ko 등).
    quiz_en2ko: "어휘", quiz_ko2en: "어휘", quiz_blank: "문법·어휘",
    exam_en2ko: "어휘", exam_ko2en: "어휘", exam_blank: "문법·어휘",
    listen_word: "리스닝", listen_sent: "리스닝", listen_dict: "리스닝", lc12: "리스닝", part34: "리스닝", num: "리스닝", dictation: "리스닝", mp: "발음",
    part_5: "문법", part_6: "문맥", part_7: "독해", part6: "문맥", reading: "독해", double_reading: "독해", part1: "묘사",
    // 문법 교재 문제 풀이는 단계별 키로 쌓이지만 대시보드에는 '문법' 한 영역으로 묶습니다.
    grammar_all: "문법", grammar_basic: "문법", grammar_intermediate: "문법", grammar_advanced: "문법",
    trans: "연결어", prep: "전치사",
    blank: "문법·어휘", wf: "어형", confuse_dict: "철자", mix_confuse: "혼동어휘", mix_part: "어근", diag: "진단", mock_LC: "모의", mock_RC: "모의", battle: "대결"
  };
  function categoryStats() {
    var cat = {};
    Object.keys(quizStats).forEach(function (k) {
      var c = STAT_CATEGORY[k] || "기타";
      var s = quizStats[k] || { c: 0, w: 0 };
      var n = (s.c || 0) + (s.w || 0);
      if (!n) return;
      cat[c] = cat[c] || { c: 0, w: 0 };
      cat[c].c += s.c || 0; cat[c].w += s.w || 0;
    });
    return cat;
  }
  // 영역별 약점을 "바로 그 자리에서" 훈련할 수 있도록 섹션·시작 버튼을 연결합니다.
  var CATEGORY_DRILLS = {
    "어휘": { target: "스피드 어휘 60초", start: "speedStart" },
    "연어": { target: "빈출 콜로케이션 드릴", start: "colloStart" },
    "문맥": { target: "문맥 속 어휘", start: "ctxStart" },
    "동의어": { target: "동의어 치환 훈련", start: "paraStart" },
    "연결어": { target: "연결어·접속부사 훈련", start: "transStart" },
    "전치사": { target: "전치사 콜로케이션 훈련", start: "prepStart" },
    "문법": { target: "문법 문제 풀이", start: "grammarStart" },
    "문법·어휘": { target: "Part 미니 문제은행", start: null },
    "리스닝": { target: "Part 1·2 LC 유형 훈련", start: "lc12Start" },
    "독해": { target: "Part 7 복수 지문", start: null },
    "묘사": { target: "LC 심화 훈련", start: "part1Start" },
    "발음": { target: "최소대립쌍 발음 구별", start: "mpStart" },
    "어형": { target: "단어 패밀리", start: "wfStart" },
    "혼동어휘": { target: "빠른 학습 도구", start: "mixQuizStart" },
    "어근": { target: "빠른 학습 도구", start: "mixQuizStart" },
    "철자": { target: "말하기·쓰기 연습", start: "cdPlay" },
    "진단": { view: "btnDiag" },
    "모의": { view: "btnMock" },
    "대결": { target: "실전 도구", start: "battleStart" }
  };
  // 표본이 min개 이상인 영역 중 정답률이 가장 낮은 곳을 고릅니다.
  function weakestCategory(min) {
    var cat = categoryStats();
    var worst = null;
    Object.keys(cat).forEach(function (c) {
      var s = cat[c], n = (s.c || 0) + (s.w || 0);
      if (n < (min || 4)) return;
      var p = s.c / n;
      if (!worst || p < worst.p) worst = { name: c, p: p, n: n };
    });
    return worst;
  }
  // 추천 영역의 훈련 화면으로 바로 이동합니다.
  function goToCategoryDrill(cat) {
    var cfg = CATEGORY_DRILLS[cat];
    if (!cfg) { showToast("추천 훈련을 찾지 못했어요."); return; }
    var sec = cfg.target ? document.querySelector('.home-section[aria-label="' + cfg.target + '"]') : null;
    if (!sec) {
      var vb = cfg.view ? document.getElementById(cfg.view) : null;
      if (vb) vb.click();
      else showToast("해당 훈련 화면을 열 수 없어요.");
      return;
    }
    var scrollAndStart = function () {
      scrollToEl(sec, "start");
      if (!cfg.start) return;
      var sb = document.getElementById(cfg.start);
      if (sb) setTimeout(function () { sb.click(); }, 360);
    };
    if (activeView === "homeView") scrollAndStart();
    else { showHome(); setTimeout(scrollAndStart, 60); }
  }

  // ---------- 28일 학습 캘린더 ----------
  function renderCalendar() {
    var box = document.getElementById("dashCalendar");
    if (!box) return;
    var cells = [], maxN = 1;
    for (var i = 27; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var k = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      var n = weeklyLog[k] || 0;
      if (n > maxN) maxN = n;
      cells.push({ label: (d.getMonth() + 1) + "/" + d.getDate(), n: n });
    }
    function lvl(n) { if (!n) return 0; var r = n / maxN; return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1; }
    box.innerHTML = '<div class="cal-grid">' + cells.map(function (c) {
      return '<div class="cal-cell l' + lvl(c.n) + '" title="' + c.label + ' · ' + c.n + '회">' + (c.n || "") + '</div>';
    }).join("") + '</div><p class="muted" style="margin-top:8px">최근 28일 활동 · 연속 학습 ' + streakInfo.count + '일 · 7일 목표: 매일 1회 이상</p>';
  }

  // ---------- D-day 역산 커리큘럼 ----------
  function renderDdayPlan() {
    var box = document.getElementById("ddayPlanBox");
    if (!box) return;
    var raw = "";
    try { raw = localStorage.getItem("toeic1000_examdate") || ""; } catch (e) {}
    if (!raw) { box.innerHTML = '<p class="practice-note">위에서 시험 날짜를 저장하면 날짜별 학습 계획이 생성됩니다.</p>'; return; }
    var target = new Date(raw + "T00:00:00");
    if (isNaN(target.getTime())) { box.innerHTML = '<p class="practice-note">시험 날짜를 확인해 주세요.</p>'; return; }
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((target - today) / 86400000);
    if (days <= 0) { box.innerHTML = '<p class="practice-note">시험이 임박했거나 지났습니다. 마지막 점검으로 오답·복습 단어를 우선 정리하세요.</p>'; return; }
    var learnedN = Object.keys(learned).filter(function (k) { return learned[k]; }).length;
    var remaining = Math.max(0, totalCount - learnedN);
    var perDay = Math.max(10, Math.ceil(remaining / days));
    var pending = all.filter(function (u) { return u.words.some(function (w) { return !learned[w[0]]; }); });
    var show = Math.min(days, 14);
    var html = '';
    for (var i = 0; i < show; i++) {
      var u = pending.length ? pending[i % pending.length] : null;
      html += '<li class="sprint-item"><span class="sprint-day">D-' + (days - i) + '</span>' +
        '<span class="sprint-title">' + (i + 1) + '일차</span>' +
        '<span class="sprint-focus">' + (u ? ("UNIT " + u.id + " " + esc(u.title)) : "전체 복습") + '</span>' +
        '<span class="sprint-pct">' + perDay + '개</span></li>';
    }
    box.innerHTML = '<p class="practice-note">남은 단어 ' + remaining + '개 · 하루 약 <b>' + perDay + '</b>개 · 시험까지 ' + days + '일</p><ol class="sprint-list">' + html + '</ol>';
  }

  // ---------- 내보내기 강화 (Anki · 오답 CSV) ----------
  function downloadBlob(name, text, type) {
    var blob = new Blob(["\ufeff" + text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function downloadAnkiTsv() {
    var rows = allWords().map(function (w) { return [w[0], w[3], w[4] + " / " + w[5]].join("\t"); });
    if (!rows.length) { showToast("단어 데이터가 없습니다."); return; }
    downloadBlob("toeic_anki_deck.txt", rows.join("\n"), "text/plain;charset=utf-8;");
    showToast("📥 Anki용 TSV를 내보냈습니다. (단어 · 뜻 · 예문)");
  }
  function downloadWrongCsv() {
    var rows = [["word", "meaning", "wrong_count", "example"]];
    Object.keys(wrongSet).forEach(function (w) {
      var info = allWords().filter(function (x) { return x[0] === w; })[0];
      if (!info) return;
      rows.push([info[0], info[3], String(wrongCount[w] || 0), info[4]]);
    });
    if (rows.length === 1) { showToast("오답 단어가 아직 없습니다. 퀴즈를 풀면 쌓입니다!"); return; }
    var csv = rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(","); }).join("\r\n");
    downloadBlob("toeic_wrong_words.csv", csv, "text/csv;charset=utf-8;");
    showToast("📥 오답 단어 CSV를 내보냈습니다.");
  }
  var ankiBtn = document.getElementById("dlAnkiTsv");
  if (ankiBtn) ankiBtn.addEventListener("click", downloadAnkiTsv);
  var wrongCsvBtn = document.getElementById("dlWrongCsv");
  if (wrongCsvBtn) wrongCsvBtn.addEventListener("click", downloadWrongCsv);

  // 확장 홈 렌더를 한 번에 다 하면 긴 작업 하나가 생겨(F12 작업량 실측: 첫 방문에 259ms 한 덩어리)
  // 그동안 화면이 멈춥니다. 그래서 **묶음 단위로 나눠** 브라우저가 한가한 틈에 이어서 그립니다.
  // (순서는 그대로 — 뒤 묶음이 앞 묶음의 결과를 쓰지 않도록 지금 순서를 유지합니다.)
  var EXTENDED_STEPS = [
    function () { renderPartBank("5"); },
    function () { renderRelations(); renderReadings(); },
    function () { renderConfusables(); renderWordParts(); },
    function () { renderBadges(); renderMixQuiz(); },
    function () { renderPart34(false); renderDoubleReading(false); },
    function () { renderPart6(false); renderWordFamilies(); },
    function () { renderMnemonics(); renderTemplates(); },
    function () { renderReport(); renderSpeakingPrompt(); renderWritingPrompt(); },
    function () { renderShadowing(); renderDday(); renderDdayPlan(); },
    function () { renderMiniQuiz(); renderFrequency(""); },
    function () { renderSprint(); renderDictation(); },
    function () { renderTplExtra(); renderSwExtra(); },
    function () { renderGrammarBooks(); renderConversationBooks(); renderGrammarWrongNote(); },
    function () { renderGuides(); renderPace(); renderBattle(); },
    // extra.js 데이터로 문항을 만드는 미니 퀴즈들 — 데이터가 온 뒤에 첫 렌더를 합니다(wireMiniQuiz 참고).
    function () {
      lc12Quiz.render();
      paraQuiz.render();
      transQuiz.render();
      prepQuiz.render();
      part1Quiz.render();
      numQuiz.render();
    }
  ];

  /** 한 묶음을 그립니다(다른 곳에서 "확장 홈을 다 그려야 할 때" 쓰는 경로). */
  function renderExtendedHome() {
    EXTENDED_STEPS.forEach(function (step) {
      try { step(); } catch (e) {}
    });
  }

  /** 한가한 틈에 한 묶음씩 — 한 번에 쓰는 시간을 묶음 하나로 제한합니다. */
  function renderExtendedSlices() {
    var i = 0;
    function next(fn) {
      if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 500 });
      else setTimeout(function () { fn(null); }, 40);
    }
    function pump(deadline) {
      var started = Date.now();
      // 시간이 남아 있으면 이어서 그리고, 8ms 를 넘기면 다음 한가한 때로 미룹니다.
      // (묶음 하나가 유난히 무거워도 긴 작업이 한 번에 쌓이지 않습니다.)
      do {
        var step = EXTENDED_STEPS[i++];
        try { step(); } catch (e) {}
      } while (i < EXTENDED_STEPS.length && Date.now() - started < 8);
      if (i < EXTENDED_STEPS.length) next(pump);
    }
    next(pump);
  }
  function renderHome() {
    activeView = "homeView";
    var learnedN = Object.keys(learned).filter(function (k) { return learned[k]; }).length;
    var pct = totalCount ? Math.round(learnedN / totalCount * 100) : 0;
    document.getElementById("heroLearned").textContent = learnedN;
    document.getElementById("heroPct").textContent = pct + "%";

    // 이어서 학습 — 학습 기록이 없는 첫 방문에는 보여 주지 않습니다(할 일이 겹침).
    var resumeBtn = document.getElementById("homeResume");
    if (resumeBtn) {
      var canResume = learnedN > 0 || !!lastWord;
      resumeBtn.hidden = !canResume;
      if (canResume) resumeBtn.textContent = "▶ 이어서 학습 " + learnedN + "/" + totalCount;
    }
    document.getElementById("heroStreak").textContent = streakInfo.count;
    document.getElementById("heroBest").textContent = examBest;

    // 오늘의 응원 메시지 (날짜 기반)
    var cheer = document.getElementById("heroCheer");
    if (cheer) cheer.textContent = CHEERS[dayOfYearNow() % CHEERS.length];

    pickTodayWords(false);
    renderQuotes();
    renderMotivation();
    renderGrammarTip();
    renderIdioms(document.getElementById("idiomSearch") ? document.getElementById("idiomSearch").value : "");
    renderQuests();
    renderBadges();
    renderReport();
    renderDialogue(false);

    var dueN = srsDueWords().length;
    var srsBadge = document.getElementById("homeSrsBadge");
    if (srsBadge) {
      srsBadge.textContent = dueN ? "🔁 " + dueN + "개" : "완료!";
      srsBadge.classList.toggle("has-due", dueN > 0);
    }

    // 오늘의 학습 카드
    var dailyPct = Math.min(100, Math.round(daily.count / DAILY_GOAL * 100));
    var rec = null, recScore = -1;
    all.forEach(function (u) {
      var un = u.words.filter(function (w) { return !learned[w[0]]; }).length;
      if (un > recScore) { recScore = un; rec = u; }
    });
    var wrongTop = Object.keys(wrongCount).sort(function (a, b) { return (wrongCount[b] || 0) - (wrongCount[a] || 0); }).slice(0, 3);
    var wrongHtml = "";
    wrongTop.forEach(function (w) {
      var info = allWords().filter(function (x) { return x[0] === w; })[0];
      if (!info) return;
      wrongHtml += '<div class="today-wrong"><b>' + esc(w) + "</b> <span class=\"tag tag-red\">" + wrongCount[w] + "회</span> " + esc(info[3]) + "</div>";
    });
    if (!wrongHtml) wrongHtml = '<p class="today-done">오답이 없어요! 🎉</p>';
    document.getElementById("todayGrid").innerHTML =
      '<div class="today-card">' +
      '<div class="today-ico">📅</div>' +
      '<h3>오늘의 목표</h3>' +
      '<div class="today-big">' + daily.count + " / " + DAILY_GOAL + '</div>' +
      '<div class="unit-btn-bar"><span class="unit-btn-fill" style="width:' + dailyPct + '%"></span></div>' +
      (daily.count >= DAILY_GOAL
        ? '<p class="today-done">🎉 오늘 목표 달성!</p>'
        : '<p class="today-sub">하루 ' + DAILY_GOAL + "개씩이면 33일 완주!</p>") +
      "</div>" +
      '<div class="today-card">' +
      '<div class="today-ico">🔁</div>' +
      "<h3>오늘 복습할 단어</h3>" +
      '<div class="today-big">' + dueN + "개</div>" +
      (dueN
        ? '<button type="button" class="btn quiz-btn today-btn" id="todaySrs">복습 시작</button>'
        : '<p class="today-done">복습 완료! 🎉</p>') +
      "</div>" +
      '<div class="today-card">' +
      '<div class="today-ico">🎯</div>' +
      "<h3>추천 학습</h3>" +
      '<div class="today-rec">' + (rec ? "UNIT " + rec.id + " " + esc(rec.title) : "전체 복습") + '</div>' +
      "<p class=\"today-sub\">미학습 " + (rec ? recScore : 0) + "개 남았어요</p>" +
      '<button type="button" class="btn quiz-btn today-btn" id="todayGoUnit">바로 가기</button>' +
      "</div>" +
      '<div class="today-card">' +
      '<div class="today-ico">⚠️</div>' +
      "<h3>자주 틀린 단어</h3>" +
      wrongHtml +
      "</div>";
    var srsBtn = document.getElementById("todaySrs");
    if (srsBtn) srsBtn.addEventListener("click", enterSrs);
    var goBtn = document.getElementById("todayGoUnit");
    if (goBtn) {
      (function (id) {
        goBtn.addEventListener("click", function () { goUnit(id); });
      })(rec ? rec.id : 1);
    }

    // 유닛 그리드
    var grid = document.getElementById("homeUnitGrid");
    grid.innerHTML = "";
    all.forEach(function (u) {
      var done = u.words.filter(function (w) { return learned[w[0]]; }).length;
      var p = Math.round(done / u.words.length * 100);
      var lvlCls = u.level === "초급" ? "lvl-easy" : u.level === "중급" ? "lvl-mid" : "lvl-hard";
      var lvlIcon = u.level === "초급" ? "🟢" : u.level === "중급" ? "🟡" : "🔴";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "unit-btn";
      btn.setAttribute("aria-label", "UNIT " + u.unit + " " + u.title + " 단어 보기");
      btn.innerHTML =
        '<span class="unit-btn-top"><span class="unit-btn-num">UNIT ' + u.unit + '</span><span class="lvl-badge ' + lvlCls + '">' + lvlIcon + " " + u.level + '</span></span>' +
        '<span class="unit-btn-title">' + (u.icon ? '<span class="unit-emoji">' + u.icon + '</span> ' : '') + esc(u.title) + '</span>' +
        '<span class="unit-btn-bar"><span class="unit-btn-fill" style="width:' + p + '%"></span></span>' +
        '<span class="unit-btn-progress">' + done + " / " + u.words.length + " 단어 · " + p + "%</span>";
      (function (id) {
        btn.addEventListener("click", function () { goUnit(id); });
      })(u.unit);
      grid.appendChild(btn);
    });
  }

  function showHome() {
    renderHome();
    showView("homeView", "btnHome");
  }

  document.getElementById("btnHome").addEventListener("click", showHome);
  document.getElementById("homeView").addEventListener("click", function (e) {
    var mode = e.target.closest(".mode-btn");
    if (mode) {
      var m = mode.getAttribute("data-mode");
      if (m === "list") showListView();
      else if (m === "flash") enterFlash();
      else if (m === "quiz") enterQuiz();
      else if (m === "exam") enterExam();
      else if (m === "srs") enterSrs();
      else if (m === "listen") enterListen();
      else if (m === "mock") enterMock();
      else if (m === "diag") enterDiag();
      else if (m === "dash") enterDash();
      return;
    }
    if (e.target.id === "homeStartQuiz" || e.target.id === "homeCtaStart") enterQuiz();
    else if (e.target.id === "homeResume") enterResume();
    else if (e.target.id === "homeStartFlash") enterFlash();
    else if (e.target.id === "homeDiag") enterDiag();
  });
  var wodShuffle = document.getElementById("todayWordsShuffle");
  if (wodShuffle) wodShuffle.addEventListener("click", function () { pickTodayWords(true); });

  // ---------- 실전 시험 모드 ----------
  var examQuestions = [];
  var examIdx = 0;
  var examCorrect = 0;
  var examTimerId = null;
  var examTimeLeft = 0;
  var examAnswered = false;
  var examType = "blank";

  function enterExam() {
    stopExamTimer();
    document.getElementById("examBox").innerHTML =
      '<div class="quiz-result"><p>유형과 문항 수, 문항당 시간을 선택하고 ⏱ 시작을 눌러 주세요!</p></div>';
    document.getElementById("examTimer").textContent = "";
    showView("examView", "btnExam");
  }

  function stopExamTimer() {
    if (examTimerId) { clearInterval(examTimerId); examTimerId = null; }
  }

  function fmtTime(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  function genExam(pool) {
    var len = parseInt(document.getElementById("examLength").value, 10);
    examType = document.getElementById("examType").value;
    var secPerQ = parseInt(document.getElementById("examTime").value, 10);
    var copy = pool.slice();
    shuffle(copy);
    var picked = copy.slice(0, Math.min(len, copy.length));
    examQuestions = picked.map(function (w) {
      var isBlank = examType === "blank";
      var answer = isBlank ? w[0] : (examType === "en2ko" ? w[3] : w[0]);
      var prompt = isBlank ? blankPrompt(w) : (examType === "en2ko" ? w[0] : w[3]);
      var distractors = [];
      var attempts = 0;
      while (distractors.length < 3 && attempts < 800) {
        attempts++;
        var d = pool[Math.floor(Math.random() * pool.length)];
        var dv = isBlank ? d[0] : (examType === "en2ko" ? d[3] : d[0]);
        if (dv !== answer && distractors.indexOf(dv) === -1) distractors.push(dv);
      }
      var options = [answer].concat(distractors);
      shuffle(options);
      return { word: w[0], prompt: prompt, answer: answer, options: options, sec: secPerQ, example: w[4], exampleKo: w[5] };
    });
    examTimeLeft = examQuestions.reduce(function (n, q) { return n + q.sec; }, 0);
  }

  function blankPrompt(w) {
    // 예문에서 해당 단어(변형 포함: manages/managed/managing 등)를 빈칸으로 치환 (Part 5·6 유형)
    var ex = w[4];
    var word = w[0].toLowerCase();
    // 1) 정확한 단어 매칭
    var re = new RegExp("\\b" + w[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    if (re.test(ex)) return ex.replace(re, "＿＿＿＿");
    // 2) 변형형 매칭: 단어가 4글자 이상일 때 토큰의 어간이 단어로 시작/끝나면 치환
    if (word.length >= 4) {
      var tokens = ex.split(/\s+/);
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i].replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (t.length >= word.length && t.indexOf(word) === 0 && t.length - word.length <= 3) {
          return ex.split(tokens[i]).join("＿＿＿＿");
        }
      }
    }
    return w[0];
  }

  function startExam() {
    stopExamTimer();
    var pool = allWords();
    if (!pool.length) return;
    genExam(pool);
    examIdx = 0;
    examCorrect = 0;
    examAnswered = false;
    renderExam();
    examTimerId = setInterval(examTick, 1000);
  }

  function examTick() {
    examTimeLeft--;
    updateExamTimer();
    if (examTimeLeft <= 0) {
      stopExamTimer();
      showExamResult();
    }
  }

  function updateExamTimer() {
    var el = document.getElementById("examTimer");
    if (!el) return;
    el.textContent = "⏱ 남은 시간 " + fmtTime(Math.max(0, examTimeLeft));
    el.classList.toggle("timeout", examTimeLeft <= 10);
  }

  function renderExam() {
    examAnswered = false;
    var q = examQuestions[examIdx];
    var html = '<div class="quiz-progress">문제 ' + (examIdx + 1) + " / " + examQuestions.length + " · 현재 정답 " + examCorrect + "개</div>";
    html += '<div class="quiz-q">' + esc(q.prompt) + '</div>';
    q.options.forEach(function (opt) {
      html += '<button class="quiz-opt">' + esc(opt) + '</button>';
    });
    html += '<div class="quiz-feedback" id="examFeedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    html += '<div class="quiz-next-wrap"><button class="btn quiz-btn" id="examNext" style="display:none">다음 ▶</button></div>';
    document.getElementById("examBox").innerHTML = html;
    updateExamTimer();
  }

  function answerExam(btn) {
    if (examAnswered) return;
    examAnswered = true;
    var q = examQuestions[examIdx];
    var opts = document.querySelectorAll("#examBox .quiz-opt");
    var isCorrect = btn.textContent === q.answer;
    var correctBtn = null;
    opts.forEach(function (o) {
      if (o.textContent === q.answer) correctBtn = o;
    });
    if (isCorrect) {
      btn.classList.add("correct");
      examCorrect++;
      recordStat("exam_" + examType, true);
      if (wrongSet[q.word]) { delete wrongSet[q.word]; saveWrong(); }
    } else {
      btn.classList.add("wrong");
      wrongSet[q.word] = true;
      wrongCount[q.word] = (wrongCount[q.word] || 0) + 1;
      recordStat("exam_" + examType, false);
      saveWrong();
      if (correctBtn) correctBtn.classList.add("correct");
    }
    opts.forEach(function (o) { o.disabled = true; });
    var examFb = document.getElementById("examFeedback");
    examFb.innerHTML =
      (isCorrect ? "정답입니다! 🎉" : "오답입니다. 정답: " + esc(q.answer)) + exFeedback(q);
    restoreFocusToFeedback(examFb);
    var nextBtn = document.getElementById("examNext");
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = (examIdx === examQuestions.length - 1) ? "결과 보기 📊" : "다음 ▶";
  }

  function showExamResult() {
    markQuest("exam");
    var total = examQuestions.length;
    var pct = total ? Math.round(examCorrect / total * 100) : 0;
    // TOEIC 점수 환산 (어휘 기반 추정): 990점 만점, 문항 수에 비례
    var est = Math.max(10, Math.min(990, Math.round(pct * 9.9)));
    if (est > examBest) {
      examBest = est;
      try { localStorage.setItem("toeic1000_exambest", String(examBest)); } catch (e) {}
    }
    var msg = pct >= 90 ? "완벽해요! 🏆" : pct >= 70 ? "훌륭해요! 🌟" : pct >= 50 ? "잘하고 있어요! 👍" : "복습이 필요해요! 📚";
    var wrongBtn = Object.keys(wrongSet).length
      ? '<button class="btn" id="examWrongBtn">📕 오답 복습하기 (' + Object.keys(wrongSet).length + ')</button>'
      : "";
    document.getElementById("examBox").innerHTML =
      '<div class="quiz-result">' +
      '<div class="score">' + examCorrect + " / " + total + '</div>' +
      '<p>정답률 ' + pct + "% · " + msg + '</p>' +
      '<p class="muted">예상 TOEIC 점수 <b class="est-score">' + est + '점</b> · 최고 기록 ' + examBest + '점</p>' +
      '<div class="fc-controls" style="justify-content:center">' +
      '<button class="btn" id="examRestart">🔁 다시 풀기</button>' +
      wrongBtn +
      '<button class="btn" id="examBack">📖 목록으로</button>' +
      '</div></div>';
    document.getElementById("examTimer").textContent = "";
  }

  document.getElementById("btnExam").addEventListener("click", enterExam);
  document.getElementById("examStart").addEventListener("click", startExam);
  document.getElementById("examReset").addEventListener("click", function () {
    stopExamTimer();
    document.getElementById("examTimer").textContent = "";
    document.getElementById("examBox").innerHTML =
      '<div class="quiz-result"><p>유형과 문항 수, 문항당 시간을 선택하고 ⏱ 시작을 눌러 주세요!</p></div>';
  });
  document.getElementById("examBox").addEventListener("click", function (e) {
    if (e.target.classList.contains("quiz-opt") && !examAnswered) {
      answerExam(e.target);
    } else if (e.target.id === "examNext") {
      examIdx++;
      if (examIdx >= examQuestions.length) {
        stopExamTimer();
        showExamResult();
      } else {
        renderExam();
      }
    } else if (e.target.id === "examRestart") {
      startExam();
    } else if (e.target.id === "examWrongBtn") {
      enterQuiz();
      startQuiz(true);
    } else if (e.target.id === "examBack") {
      showListView();
    }
  });

  // ---------- 시험 안내 모달 ----------
  function renderStats() {
    var learnedN = Object.keys(learned).filter(function (k) { return learned[k]; }).length;
    var wrongN = Object.keys(wrongSet).length;
    var favN = Object.keys(favSet).length;
    var pct = totalCount ? Math.round(learnedN / totalCount * 100) : 0;
    var html =
      '<div class="stat"><b>' + learnedN + "</b><span>외운 단어</span></div>" +
      '<div class="stat"><b>' + totalCount + "</b><span>전체 단어</span></div>" +
      '<div class="stat"><b>' + pct + "%</b><span>학습 진행률</span></div>" +
      '<div class="stat"><b>' + wrongN + "</b><span>오답 단어</span></div>" +
      '<div class="stat"><b>' + favN + "</b><span>내 단어장</span></div>" +
      '<div class="stat"><b>' + examBest + "</b><span>최고 예상 점수</span></div>" +
      '<div class="stat"><b>' + streakInfo.count + "</b><span>연속 학습일</span></div>" +
      '<div class="stat"><b>' + daily.count + " / " + DAILY_GOAL + "</b><span>오늘 학습</span></div>";
    document.getElementById("statGrid").innerHTML = html;
  }

  var guideModal = document.getElementById("guideModal");
  function openGuide() {
    renderStats();
    if (guideModal.classList.contains("show")) return;
    guideModal.classList.add("show");
    // 뒤로가기·닫기 버튼으로 닫히도록 history 항목을 빌리고, 뒤 화면 스크롤을 막습니다.
    pushMenuGuard();
    document.body.classList.add("modal-open");
    var closeBtn = document.getElementById("guideClose");
    if (closeBtn) closeBtn.focus();
  }
  function closeGuide() {
    if (!guideModal.classList.contains("show")) return;
    guideModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    releaseMenuGuard();
    var opener = document.getElementById("btnGuide");
    if (opener) opener.focus();
  }
  document.getElementById("btnGuide").addEventListener("click", openGuide);
  document.getElementById("guideClose").addEventListener("click", closeGuide);
  guideModal.addEventListener("click", function (e) {
    if (e.target === this) closeGuide();
  });
  // Esc 키로 안내 창을 닫을 수 있게 합니다(키보드 사용자).
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") closeGuide();
  });
  document.getElementById("btnResetData").addEventListener("click", function () {
    if (!confirm("모든 학습 데이터(외운 단어·오답노트·단어장·진행 기록)를 초기화할까요?")) return;
    try {
      ["toeic1000_learned", "toeic1000_wrong", "toeic1000_wrongcount", "toeic1000_fav",
       "toeic1000_daily", "toeic1000_streak", "toeic1000_exambest", "toeic1000_quizstats",
       "toeic1000_weekly", "toeic1000_quests", "toeic1000_examdate", "toeic1000_badges"].forEach(function (k) {
        localStorage.removeItem(k);
      });
    } catch (e) {}
    learned = {}; wrongSet = {}; wrongCount = {}; favSet = {};
    daily = { date: "", count: 0 }; streakInfo = { last: "", count: 0 }; examBest = 0;
    quizStats = {}; weeklyLog = {}; quests = { date: "", quiz: false, exam: false };
    earnedBadges = {}; badgeInitDone = true;
    mixQuiz = { q: [], idx: 0, correct: 0, answered: false, done: false };
    cdIdx = 0; cdReset(); renderMixQuiz();
    if (ddayInput) ddayInput.value = "";
    invalidateUnits();
    updateProgress();
    updateWrongBadge();
    updateDailyUI();
    updateStreakUI();
    renderStats();
    renderQuests();
    renderMotivation();
    renderBadges();
    renderReport();
    renderDday();
    showToast("🗑️ 모든 학습 데이터가 초기화되었습니다.");
  });

  // ---------- 데이터 백업(내보내기·가져오기) ----------
  function collectAllData() {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      learned: learned,
      wrong: wrongSet,
      wrongcount: wrongCount,
      fav: favSet,
      daily: daily,
      streak: streakInfo,
      exambest: examBest,
      quizstats: quizStats,
      weekly: weeklyLog,
      theme: (function () { try { return localStorage.getItem("toeic1000_theme") || "light"; } catch (e) { return "light"; } })()
    };
  }

  document.getElementById("btnExport").addEventListener("click", function () {
    try {
      var data = JSON.stringify(collectAllData(), null, 2);
      var blob = new Blob([data], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "toeic-monster-backup-" + todayKey() + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      showToast("💾 학습 데이터를 백업 파일로 저장했습니다.");
    } catch (e) {
      showToast("⚠️ 내보내기에 실패했습니다.");
    }
  });

  document.getElementById("btnImport").addEventListener("click", function () {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (!data || typeof data !== "object") throw new Error("bad");
        learned = data.learned || {};
        wrongSet = data.wrong || {};
        wrongCount = data.wrongcount || {};
        favSet = data.fav || {};
        daily = data.daily || { date: "", count: 0 };
        streakInfo = data.streak || { last: "", count: 0 };
        examBest = data.exambest || 0;
        quizStats = data.quizstats || {};
        weeklyLog = data.weekly || {};
        // 테마는 백업에 담겨 있을 때만 바꿉니다(없으면 지금 보고 있는 테마를 유지).
        // 저장은 아래 setTheme 이 직접 처리합니다.
        saveLearned();
        saveWrong();
        saveDaily();
        try { localStorage.setItem("toeic1000_streak", JSON.stringify(streakInfo)); } catch (err) {}
        try { localStorage.setItem("toeic1000_exambest", String(examBest)); } catch (err) {}
        try { localStorage.setItem("toeic1000_quizstats", JSON.stringify(quizStats)); } catch (err) {}
        try { localStorage.setItem("toeic1000_weekly", JSON.stringify(weeklyLog)); } catch (err) {}
        invalidateUnits();
        syncLevelButtons();
        updateProgress();
        updateWrongBadge();
        updateDailyUI();
        updateStreakUI();
        renderStats();
        if (data.theme) setTheme(data.theme === "dark" ? "dark" : "light");
        showToast("📥 백업 데이터를 불러왔습니다.");
      } catch (err) {
        showToast("⚠️ 올바른 백업 파일이 아닙니다.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  });

  // ---------- 토스트 알림 ----------
  var toastTimer = null;
  function showToast(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  // ---------- 공유 버튼 ----------
  var shareBtn = document.createElement("button");
  shareBtn.className = "btn";
  shareBtn.id = "btnShare";
  shareBtn.textContent = "📤 공유";
  shareBtn.setAttribute("aria-label", "이 사이트 공유");
  // 상단바는 기본 항목만 남겼으므로 공유 버튼은 ⋯ 더 보기 패널에 넣습니다.
  // (모바일에서는 같은 패널이 메뉴 전체를 담당합니다.)
  var shareHost = document.getElementById("topbarMore") || document.querySelector(".topbar-nav");
  if (shareHost) shareHost.appendChild(shareBtn);
  shareBtn.addEventListener("click", function () {
    var url = "https://toeic.monster/";
    if (navigator.share) {
      navigator.share({ title: "toeic.monster - TOEIC 보카 1000", text: "TOEIC 필수 어휘 1,000개를 무료로 외우는 사이트!", url: url })
        .catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        showToast("🔗 주소가 복사되었습니다.");
      }).catch(function () {});
    } else {
      showToast("주소: " + url);
    }
  });

  // ---------- PWA 서비스워커 등록 ----------
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").then(function (reg) {
        // 새 버전이 준비되면 다음 방문 때 적용되도록 미리 알려 줍니다.
        reg.addEventListener("updatefound", function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", function () {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              showToast("✨ 새 버전이 준비됐어요. 새로고침하면 적용됩니다.");
            }
          });
        });
      }).catch(function () {});
    });
  }

  // ---------- SRS 간격 반복 복습 ----------
  // 복습 간격: 학습 후 1/3/7/14/30일 뒤
  var SRS_INTERVALS = [1, 3, 7, 14, 30];
  function dayDiff(fromKey, toKey) {
    var a = fromKey.split("-").map(Number);
    var b = toKey.split("-").map(Number);
    var d1 = new Date(a[0], a[1] - 1, a[2]);
    var d2 = new Date(b[0], b[1] - 1, b[2]);
    return Math.round((d2 - d1) / 86400000);
  }
  function srsDueWords() {
    var t = todayKey();
    return allWords().filter(function (w) {
      var d = learned[w[0]];
      if (!d || d === true) return false;
      var diff = dayDiff(d, t);
      return SRS_INTERVALS.indexOf(diff) !== -1;
    });
  }
  function srsNextDate(d) {
    var p = d.split("-").map(Number);
    var dt = new Date(p[0], p[1] - 1, p[2]);
    for (var i = 0; i < SRS_INTERVALS.length; i++) {
      var n = new Date(dt);
      n.setDate(n.getDate() + SRS_INTERVALS[i]);
      var key = n.getFullYear() + "-" + (n.getMonth() + 1) + "-" + n.getDate();
      if (dayDiff(key, todayKey()) <= 0) return key;
    }
    return null;
  }
  function enterSrs() {
    isSrsMode = true;
    var due = srsDueWords();
    if (!due.length) {
      showView("dashView", "btnDash");
      renderDashboard();
      var msg = document.createElement("div");
      msg.className = "quiz-result";
      msg.innerHTML = "<p>🎉 오늘 복습할 단어가 없어요!<br>새 단어를 외우면 1일·3일·7일·14일 간격으로 복습 알림이 생깁니다.</p>";
      var box = document.getElementById("dashBox");
      box.insertBefore(msg, box.firstChild);
      return;
    }
    fcList = due;
    shuffle(fcList);
    fcIdx = 0;
    fcShown = false;
    showFlashCard();
    showView("flashcardView", "btnSrs");
    document.getElementById("fcProgress").textContent =
      fcList.length + "개의 복습 단어 · 암기 후 ✅ 외웠어요 → 다음 주기로 이동";
  }
  document.getElementById("btnSrs").addEventListener("click", enterSrs);

  // ---------- 리스닝 연습 ----------
  var listenQuestions = [];
  var listenIdx = 0;
  var listenCorrect = 0;
  var listenAnswered = false;
  var listenType = "word";
  var listenSpeed = 0.85;

  function speakRate(text, rate) { speakTTS(text, rate); }

  function genListen() {
    listenType = document.getElementById("listenType").value;
    var len = parseInt(document.getElementById("listenLength").value, 10);
    listenSpeed = parseFloat(document.getElementById("listenSpeed").value) || 0.85;
    var pool = allWords();
    var copy = pool.slice();
    shuffle(copy);
    var picked = copy.slice(0, Math.min(len, copy.length));
    listenQuestions = picked.map(function (w) {
      if (listenType === "dict") {
        return { word: w[0], answer: w[4], audio: w[4], hint: w[5], kind: "dict" };
      }
      if (listenType === "sent") {
        var distractors = [];
        var attempts = 0;
        while (distractors.length < 3 && attempts < 800) {
          attempts++;
          var d = pool[Math.floor(Math.random() * pool.length)];
          if (d[5] !== w[5] && distractors.indexOf(d[5]) === -1) distractors.push(d[5]);
        }
        var options = [w[5]].concat(distractors);
        shuffle(options);
        return { word: w[0], answer: w[5], audio: w[4], options: options, kind: "sent" };
      }
      var distractors2 = [];
      var attempts2 = 0;
      while (distractors2.length < 3 && attempts2 < 800) {
        attempts2++;
        var d2 = pool[Math.floor(Math.random() * pool.length)];
        if (d2[3] !== w[3] && distractors2.indexOf(d2[3]) === -1) distractors2.push(d2[3]);
      }
      var options2 = [w[3]].concat(distractors2);
      shuffle(options2);
      return { word: w[0], answer: w[3], audio: w[0], options: options2, kind: "word" };
    });
  }

  function enterListen() {
    document.getElementById("listenBox").innerHTML =
      '<div class="quiz-result"><p>유형과 문제 수, 재생 속도를 선택하고 🎧 시작을 눌러 주세요!</p></div>';
    showView("listenView", "btnListen");
  }

  function startListen() {
    genListen();
    listenIdx = 0;
    listenCorrect = 0;
    listenAnswered = false;
    renderListen();
  }

  function renderListen() {
    listenAnswered = false;
    var q = listenQuestions[listenIdx];
    var kindLabel = q.kind === "dict" ? "받아쓰기" : q.kind === "sent" ? "예문 듣기" : "단어 듣기";
    var html = '<div class="quiz-progress">' + kindLabel + " · " + (listenIdx + 1) + " / " + listenQuestions.length + " · 현재 정답 " + listenCorrect + "개</div>";
    html += '<div class="quiz-q" style="font-size:20px">' + (q.kind === "dict" ? "✍️ 들리는 대로 받아 적으세요" : "🔊 들리는 내용과 일치하는 답을 고르세요") + '</div>';
    html += '<div style="text-align:center"><button class="listen-play" id="listenPlay">🔊 듣기 (재생)</button></div>';
    if (q.kind === "dict") {
      html += '<input class="dict-input" id="dictInput" placeholder="영어 문장을 입력하세요" autocomplete="off">';
      html += '<div class="quiz-next-wrap" style="margin-top:10px"><button class="btn quiz-btn" id="dictCheck">✅ 채점</button></div>';
    } else {
      q.options.forEach(function (opt) {
        html += '<button class="quiz-opt">' + esc(opt) + '</button>';
      });
    }
    html += '<div class="quiz-feedback" id="listenFeedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    html += '<div class="quiz-next-wrap"><button class="btn quiz-btn" id="listenNext" style="display:none">다음 ▶</button></div>';
    document.getElementById("listenBox").innerHTML = html;
    document.getElementById("listenPlay").addEventListener("click", function () {
      speakRate(q.audio, listenSpeed);
    });
    var inp = document.getElementById("dictInput");
    if (inp) inp.focus();
  }

  function answerListen(btn) {
    if (listenAnswered) return;
    listenAnswered = true;
    var q = listenQuestions[listenIdx];
    var isCorrect = btn.textContent === q.answer;
    var opts = document.querySelectorAll("#listenBox .quiz-opt");
    var correctBtn = null;
    opts.forEach(function (o) { if (o.textContent === q.answer) correctBtn = o; });
    if (isCorrect) {
      btn.classList.add("correct");
      listenCorrect++;
      recordStat("listen_" + listenType, true);
      if (wrongSet[q.word]) { delete wrongSet[q.word]; saveWrong(); }
    } else {
      btn.classList.add("wrong");
      wrongSet[q.word] = true;
      wrongCount[q.word] = (wrongCount[q.word] || 0) + 1;
      recordStat("listen_" + listenType, false);
      saveWrong();
      if (correctBtn) correctBtn.classList.add("correct");
    }
    opts.forEach(function (o) { o.disabled = true; });
    var html = isCorrect ? "정답입니다! 🎉" : "오답입니다. 정답: <b>" + esc(q.answer) + "</b>";
    if (q.kind === "sent") html += '<div class="listen-script">🔊 ' + esc(q.audio) + ttsBtn(q.audio, "예문 듣기") + "</div>";
    var listenFb = document.getElementById("listenFeedback");
    listenFb.innerHTML = html;
    restoreFocusToFeedback(listenFb);
    var nextBtn = document.getElementById("listenNext");
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = (listenIdx === listenQuestions.length - 1) ? "결과 보기 📊" : "다음 ▶";
  }

  function checkDict() {
    if (listenAnswered) return;
    listenAnswered = true;
    var q = listenQuestions[listenIdx];
    var val = (document.getElementById("dictInput").value || "").trim().toLowerCase();
    var target = q.answer.toLowerCase();
    var isCorrect = val === target;
    var fb = document.getElementById("listenFeedback");
    if (isCorrect) {
      listenCorrect++;
      recordStat("listen_dict", true);
      fb.innerHTML = "정답입니다! 🎉";
    } else {
      wrongSet[q.word] = true;
      wrongCount[q.word] = (wrongCount[q.word] || 0) + 1;
      recordStat("listen_dict", false);
      saveWrong();
      fb.innerHTML = "오답입니다. 정답: <b>" + esc(q.answer) + "</b>";
    }
    fb.innerHTML += '<div class="listen-script">📝 해석: ' + esc(q.hint) + '<br>🔊 <button class="btn" id="dictReplay">다시 듣기</button></div>';
    document.getElementById("dictReplay").addEventListener("click", function () { speakRate(q.audio, listenSpeed); });
    document.getElementById("dictCheck").disabled = true;
    var nextBtn = document.getElementById("listenNext");
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = (listenIdx === listenQuestions.length - 1) ? "결과 보기 📊" : "다음 ▶";
  }

  function showListenResult() {
    var total = listenQuestions.length;
    var pct = total ? Math.round(listenCorrect / total * 100) : 0;
    var msg = pct >= 90 ? "듣기 실력이 훌륭해요! 🏆" : pct >= 70 ? "잘 듣고 있어요! 🌟" : pct >= 50 ? "반복 청취가 필요해요! 🎧" : "천천히 속도(0.7배)로 다시 들어보세요 📚";
    document.getElementById("listenBox").innerHTML =
      '<div class="quiz-result">' +
      '<div class="score">' + listenCorrect + " / " + total + '</div>' +
      "<p>정답률 " + pct + "% · " + msg + "</p>" +
      '<div class="fc-controls" style="justify-content:center">' +
      '<button class="btn" id="listenRestart">🔁 다시 풀기</button>' +
      '<button class="btn" id="listenBack">📖 목록으로</button>' +
      "</div></div>";
  }

  document.getElementById("btnListen").addEventListener("click", enterListen);
  document.getElementById("listenStart").addEventListener("click", startListen);
  document.getElementById("listenBox").addEventListener("click", function (e) {
    if (e.target.classList.contains("quiz-opt") && !listenAnswered) {
      answerListen(e.target);
    } else if (e.target.id === "listenNext") {
      listenIdx++;
      if (listenIdx >= listenQuestions.length) showListenResult();
      else renderListen();
    } else if (e.target.id === "listenRestart") {
      startListen();
    } else if (e.target.id === "listenBack") {
      showListView();
    } else if (e.target.id === "dictCheck") {
      checkDict();
    }
  });

  // ---------- 실전 모의고사 ----------
  var mockQ = [];
  var mockIdx = 0;
  var mockCorrect = 0;
  var mockSection = "LC";
  var mockTimerId = null;
  var mockTimeLeft = 0;
  var mockAnswered = false;
  var mockSections = []; // [{name, correct, total}]

  function stopMockTimer() {
    if (mockTimerId) { clearInterval(mockTimerId); mockTimerId = null; }
  }

  function genMock() {
    var mode = document.getElementById("mockMode").value;
    var secPerQ = parseInt(document.getElementById("mockLength").value, 10);
    var pool = allWords();
    var copy = pool.slice();
    shuffle(copy);
    var lcN = mode === "full" ? 30 : 10;
    var rcN = mode === "full" ? 30 : 10;
    var lcPool = copy.slice(0, lcN);
    var rcPool = copy.slice(lcN, lcN + rcN);
    mockSections = [{ name: "LC", correct: 0, total: lcN }, { name: "RC", correct: 0, total: rcN }];
    mockQ = [];
    // LC: 단어 듣고 뜻 고르기 (Part 1·2) / 예문 듣고 해석 고르기 (Part 3·4) 번갈아
    lcPool.forEach(function (w, i) {
      var sentMode = i % 2 === 1;
      var answer = sentMode ? w[5] : w[3];
      var audio = sentMode ? w[4] : w[0];
      var distractors = [];
      var attempts = 0;
      while (distractors.length < 3 && attempts < 800) {
        attempts++;
        var d = pool[Math.floor(Math.random() * pool.length)];
        var dv = sentMode ? d[5] : d[3];
        if (dv !== answer && distractors.indexOf(dv) === -1) distractors.push(dv);
      }
      var options = [answer].concat(distractors);
      shuffle(options);
      mockQ.push({ word: w[0], answer: answer, audio: audio, options: options, section: "LC", part: sentMode ? "Part 3·4" : "Part 1·2", kind: sentMode ? "sent" : "word", sec: secPerQ, ok: false, example: w[4], exampleKo: w[5] });
    });
    // RC: 빈칸 채우기 (Part 5) / 뜻→단어 (Part 7 독해 어휘)
    rcPool.forEach(function (w, i) {
      var blankMode = i % 2 === 0;
      var answer = blankMode ? w[0] : w[0];
      var prompt = blankMode ? blankPrompt(w) : w[3];
      var distractors = [];
      var attempts = 0;
      while (distractors.length < 3 && attempts < 800) {
        attempts++;
        var d = pool[Math.floor(Math.random() * pool.length)];
        if (d[0] !== answer && distractors.indexOf(d[0]) === -1) distractors.push(d[0]);
      }
      var options = [answer].concat(distractors);
      shuffle(options);
      mockQ.push({ word: w[0], answer: answer, prompt: prompt, options: options, section: "RC", part: blankMode ? "Part 5" : "Part 7", kind: blankMode ? "blank" : "word", sec: secPerQ, ok: false, example: w[4], exampleKo: w[5] });
    });
    mockTimeLeft = mockQ.reduce(function (n, q) { return n + q.sec; }, 0);
  }

  function enterMock() {
    stopMockTimer();
    document.getElementById("mockTimer").textContent = "";
    document.getElementById("mockBox").innerHTML =
      '<div class="quiz-result"><p>모드를 선택하고 📝 시작을 눌러 주세요!<br>LC(리스닝) → RC(리딩) 순서로 진행됩니다.</p></div>';
    document.getElementById("mockSection").textContent = "";
    showView("mockView", "btnMock");
  }

  function startMock() {
    stopMockTimer();
    genMock();
    mockIdx = 0;
    mockCorrect = 0;
    mockAnswered = false;
    mockSection = "LC";
    mockTimerId = setInterval(mockTick, 1000);
    renderMock();
  }

  function mockTick() {
    mockTimeLeft--;
    var el = document.getElementById("mockTimer");
    if (el) {
      el.textContent = "⏱ 남은 시간 " + fmtTime(Math.max(0, mockTimeLeft)) + " · " + mockSection + " 섹션";
      el.classList.toggle("timeout", mockTimeLeft <= 10);
    }
    if (mockTimeLeft <= 0) {
      stopMockTimer();
      showMockResult();
    }
  }

  function renderMock() {
    mockAnswered = false;
    var q = mockQ[mockIdx];
    mockSection = q.section;
    var mt = document.getElementById("mockTimer");
    if (mt) {
      mt.textContent = "⏱ 남은 시간 " + fmtTime(Math.max(0, mockTimeLeft)) + " · " + mockSection + " 섹션";
      mt.classList.toggle("timeout", mockTimeLeft <= 10);
    }
    document.getElementById("mockSection").textContent =
      mockSection + " 섹션 · " + q.part + " · 문제 " + (mockIdx + 1) + " / " + mockQ.length;
    var html = '<div class="quiz-progress">현재 정답 ' + mockCorrect + "개</div>";
    if (q.kind === "blank") {
      html += '<div class="quiz-q" style="font-size:20px">' + esc(q.prompt) + '</div>';
    } else if (q.kind === "word" && q.section === "RC") {
      html += '<div class="quiz-q" style="font-size:20px">' + esc(q.prompt) + " → 알맞은 단어</div>";
    } else {
      html += '<div class="quiz-q" style="font-size:20px">🔊 듣고 답을 고르세요</div>';
      html += '<div style="text-align:center"><button class="listen-play" id="mockPlay">🔊 듣기</button></div>';
    }
    q.options.forEach(function (opt) {
      html += '<button class="quiz-opt">' + esc(opt) + '</button>';
    });
    html += '<div class="quiz-feedback" id="mockFeedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    html += '<div class="quiz-next-wrap"><button class="btn quiz-btn" id="mockNext" style="display:none">다음 ▶</button></div>';
    document.getElementById("mockBox").innerHTML = html;
    var play = document.getElementById("mockPlay");
    if (play) play.addEventListener("click", function () { speakRate(q.audio, 0.85); });
  }

  function answerMock(btn) {
    if (mockAnswered) return;
    mockAnswered = true;
    var q = mockQ[mockIdx];
    var opts = document.querySelectorAll("#mockBox .quiz-opt");
    var isCorrect = btn.textContent === q.answer;
    q.ok = isCorrect;
    var correctBtn = null;
    opts.forEach(function (o) { if (o.textContent === q.answer) correctBtn = o; });
    if (isCorrect) {
      btn.classList.add("correct");
      mockCorrect++;
      mockSections.forEach(function (s) { if (s.name === q.section) s.correct++; });
      recordStat("mock_" + q.section, true);
      if (wrongSet[q.word]) { delete wrongSet[q.word]; saveWrong(); }
    } else {
      btn.classList.add("wrong");
      wrongSet[q.word] = true;
      wrongCount[q.word] = (wrongCount[q.word] || 0) + 1;
      recordStat("mock_" + q.section, false);
      saveWrong();
      if (correctBtn) correctBtn.classList.add("correct");
    }
    opts.forEach(function (o) { o.disabled = true; });
    var html = isCorrect ? "정답입니다! 🎉" : "오답입니다. 정답: <b>" + esc(q.answer) + "</b>";
    if (q.kind === "blank") {
      var w = allWords().filter(function (x) { return x[0] === q.word; })[0];
      if (w) html += '<div class="listen-script">📝 ' + esc(w[4]) + ttsBtn(w[4], "예문 듣기") + '<br>💬 ' + esc(w[5]) + "</div>";
    } else {
      html += exFeedback(q);
    }
    var mockFb = document.getElementById("mockFeedback");
    mockFb.innerHTML = html;
    restoreFocusToFeedback(mockFb);
    var nextBtn = document.getElementById("mockNext");
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = (mockIdx === mockQ.length - 1) ? "결과 보기 📊" : "다음 ▶";
  }

  function showMockResult() {
    markQuest("exam");
    stopMockTimer();
    document.getElementById("mockTimer").textContent = "";
    document.getElementById("mockSection").textContent = "";
    var total = mockQ.length;
    var lcS = mockSections[0], rcS = mockSections[1];
    var lcPct = lcS.total ? Math.round(lcS.correct / lcS.total * 100) : 0;
    var rcPct = rcS.total ? Math.round(rcS.correct / rcS.total * 100) : 0;
    var lcScore = Math.max(5, Math.min(495, Math.round(lcPct * 4.95)));
    var rcScore = Math.max(5, Math.min(495, Math.round(rcPct * 4.95)));
    var est = lcScore + rcScore;
    if (est > examBest) {
      examBest = est;
      try { localStorage.setItem("toeic1000_exambest", String(est)); } catch (e) {}
    }
    var msg = est >= 800 ? "높은 실력이에요! 🏆" : est >= 600 ? "좋은 흐름이에요! 🌟" : "꾸준히 연습하면 오릅니다! 💪";
    // 유형(파트)별 취약 분석
    var partStats = { "Part 1·2": { c: 0, t: 0 }, "Part 3·4": { c: 0, t: 0 }, "Part 5": { c: 0, t: 0 }, "Part 7": { c: 0, t: 0 } };
    mockQ.forEach(function (q) {
      var s = partStats[q.part] || (partStats[q.part] = { c: 0, t: 0 });
      s.t++;
      if (q.ok) s.c++;
    });
    var partHtml = "";
    Object.keys(partStats).forEach(function (p) {
      var s = partStats[p];
      if (!s.t) return;
      var pct = Math.round(s.c / s.t * 100);
      partHtml += '<div class="bar-row"><span class="bar-label">' + p + '</span><div class="bar-track"><div class="bar-fill' + (pct < 60 ? " weak" : "") + '" style="width:' + pct + '%"></div></div><span class="bar-pct">' + s.c + "/" + s.t + "</span></div>";
    });
    var weakPart = null, weakPct = 101;
    Object.keys(partStats).forEach(function (p) {
      var s = partStats[p];
      if (s.t && Math.round(s.c / s.t * 100) < weakPct) { weakPct = Math.round(s.c / s.t * 100); weakPart = p; }
    });
    var partTips = {
      "Part 1·2": "사진 속 동작·상태 묘사와 의문사(Who/When/Why)에 집중해 반복 청취하세요.",
      "Part 3·4": "문제를 먼저 읽고 인물·장소·시간 정보를 메모하며 듣는 연습을 하세요.",
      "Part 5": "품사·시제·수 일치 단서를 빠르게 찾는 30초 풀이 훈련이 필요해요.",
      "Part 7": "지문 유형별 스캔과 질문 키워드 찾기 속독 훈련이 필요해요."
    };
    var weakHtml = weakPart
      ? '<div class="listen-script" style="margin-top:10px">🎯 취약 유형: <b>' + weakPart + "</b> (" + weakPct + "%)<br>💡 " + partTips[weakPart] + "</div>"
      : "";
    document.getElementById("mockBox").innerHTML =
      '<div class="quiz-result">' +
      '<div class="score">' + mockCorrect + " / " + total + '</div>' +
      '<p>예상 TOEIC 점수 <b class="est-score">' + est + "점</b> · " + msg + "</p>" +
      '<div class="bar-row"><span class="bar-label">LC (리스닝)</span><div class="bar-track"><div class="bar-fill" style="width:' + lcPct + '%"></div></div><span class="bar-pct">' + lcPct + "%</span></div>" +
      '<div class="bar-row"><span class="bar-label">RC (리딩)</span><div class="bar-track"><div class="bar-fill" style="width:' + rcPct + '%"></div></div><span class="bar-pct">' + rcPct + "%</span></div>" +
      '<p style="font-size:13px;font-weight:800;color:var(--text);margin:14px 0 2px">📊 유형별 정답</p>' +
      partHtml +
      weakHtml +
      '<p class="muted">LC 예상 ' + lcScore + "점 · RC 예상 " + rcScore + "점 · 최고 기록 " + examBest + "점</p>" +
      '<div class="fc-controls" style="justify-content:center">' +
      '<button class="btn" id="mockRestart">🔁 다시 풀기</button>' +
      '<button class="btn" id="mockWrong">📕 오답 복습</button>' +
      '<button class="btn" id="mockBack">📖 목록으로</button>' +
      "</div></div>";
  }

  document.getElementById("btnMock").addEventListener("click", enterMock);
  document.getElementById("mockStart").addEventListener("click", startMock);
  document.getElementById("mockBox").addEventListener("click", function (e) {
    if (e.target.classList.contains("quiz-opt") && !mockAnswered) {
      answerMock(e.target);
    } else if (e.target.id === "mockNext") {
      mockIdx++;
      if (mockIdx >= mockQ.length) showMockResult();
      else renderMock();
    } else if (e.target.id === "mockRestart") {
      startMock();
    } else if (e.target.id === "mockWrong") {
      enterQuiz();
      startQuiz(true);
    } else if (e.target.id === "mockBack") {
      showListView();
    }
  });

  // ---------- 실력 진단 ----------
  var diagQ = [];
  var diagIdx = 0;
  var diagCorrect = 0;
  var diagAnswered = false;
  var diagLevel = "all";
  var diagLevelResult = { 초급: { c: 0, t: 0 }, 중급: { c: 0, t: 0 }, 고급: { c: 0, t: 0 } };

  function genDiag() {
    diagLevel = document.getElementById("diagLevel").value;
    var pool = allWords().filter(function (w) {
      return diagLevel === "all" || wordLevelMap[w[0]] === diagLevel;
    });
    var copy = pool.slice();
    shuffle(copy);
    var picked = copy.slice(0, Math.min(20, copy.length));
    diagQ = picked.map(function (w) {
      var kind = Math.floor(Math.random() * 3);
      var answer, prompt, optsPool = pool;
      if (kind === 0) { answer = w[3]; prompt = w[0]; }
      else if (kind === 1) { answer = w[0]; prompt = w[3]; }
      else { answer = w[0]; prompt = blankPrompt(w); }
      var distractors = [];
      var attempts = 0;
      while (distractors.length < 3 && attempts < 800) {
        attempts++;
        var d = optsPool[Math.floor(Math.random() * optsPool.length)];
        var dv = (kind === 0) ? d[3] : d[0];
        if (dv !== answer && distractors.indexOf(dv) === -1) distractors.push(dv);
      }
      var options = [answer].concat(distractors);
      shuffle(options);
      return { word: w[0], prompt: prompt, answer: answer, options: options, level: wordLevelMap[w[0]] || "중급", example: w[4], exampleKo: w[5] };
    });
    diagLevelResult = { 초급: { c: 0, t: 0 }, 중급: { c: 0, t: 0 }, 고급: { c: 0, t: 0 } };
  }

  function enterDiag() {
    document.getElementById("diagBox").innerHTML =
      '<div class="quiz-result"><p>진단할 레벨을 선택하고 🧭 시작을 눌러 주세요!<br>20문항으로 현재 실력을 판정해 드립니다.</p></div>';
    showView("diagView", "btnDiag");
  }

  function startDiag() {
    genDiag();
    diagIdx = 0;
    diagCorrect = 0;
    diagAnswered = false;
    renderDiag();
  }

  function renderDiag() {
    diagAnswered = false;
    var q = diagQ[diagIdx];
    var html = '<div class="quiz-progress">진단 문제 ' + (diagIdx + 1) + " / " + diagQ.length + " · 레벨 " + (q.level === "초급" ? "🟢" : q.level === "중급" ? "🟡" : "🔴") + q.level + "</div>";
    html += '<div class="quiz-q" style="font-size:20px">' + esc(q.prompt) + '</div>';
    q.options.forEach(function (opt) {
      html += '<button class="quiz-opt">' + esc(opt) + '</button>';
    });
    html += '<div class="quiz-feedback" id="diagFeedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    html += '<div class="quiz-next-wrap"><button class="btn quiz-btn" id="diagNext" style="display:none">다음 ▶</button></div>';
    document.getElementById("diagBox").innerHTML = html;
  }

  function answerDiag(btn) {
    if (diagAnswered) return;
    diagAnswered = true;
    var q = diagQ[diagIdx];
    var opts = document.querySelectorAll("#diagBox .quiz-opt");
    var isCorrect = btn.textContent === q.answer;
    var correctBtn = null;
    opts.forEach(function (o) { if (o.textContent === q.answer) correctBtn = o; });
    diagLevelResult[q.level].t++;
    if (isCorrect) {
      btn.classList.add("correct");
      diagCorrect++;
      diagLevelResult[q.level].c++;
      recordStat("diag", true);
    } else {
      btn.classList.add("wrong");
      wrongSet[q.word] = true;
      wrongCount[q.word] = (wrongCount[q.word] || 0) + 1;
      recordStat("diag", false);
      saveWrong();
      if (correctBtn) correctBtn.classList.add("correct");
    }
    opts.forEach(function (o) { o.disabled = true; });
    var diagFb = document.getElementById("diagFeedback");
    diagFb.innerHTML =
      (isCorrect ? "정답입니다! 🎉" : "오답입니다. 정답: " + esc(q.answer)) + exFeedback(q);
    restoreFocusToFeedback(diagFb);
    var nextBtn = document.getElementById("diagNext");
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = (diagIdx === diagQ.length - 1) ? "결과 보기 📊" : "다음 ▶";
  }

  function showDiagResult() {
    renderBadges();
    var total = diagQ.length;
    var pct = total ? Math.round(diagCorrect / total * 100) : 0;
    var est = Math.max(10, Math.min(990, Math.round(pct * 9.9)));
    // 레벨별 정답률로 취약 레벨 찾기
    var levelPct = {};
    Object.keys(diagLevelResult).forEach(function (lv) {
      var s = diagLevelResult[lv];
      levelPct[lv] = s.t ? Math.round(s.c / s.t * 100) : null;
    });
    var weak = null, weakPct = 101;
    Object.keys(levelPct).forEach(function (lv) {
      if (levelPct[lv] !== null && levelPct[lv] < weakPct) { weakPct = levelPct[lv]; weak = lv; }
    });
    // 추천 유닛: 취약 레벨에서 안 외운 단어가 많은 유닛
    var recommend = null, recScore = -1;
    all.forEach(function (u) {
      if (weak && u.level !== weak) return;
      var unlearned = u.words.filter(function (w) { return !learned[w[0]]; }).length;
      if (unlearned > recScore) { recScore = unlearned; recommend = u; }
    });
    var lvMsg = pct >= 85 ? "🟢 상위권 — 800점대 이상 목표" : pct >= 65 ? "🟡 중상위권 — 700점대 목표" : pct >= 45 ? "🔸 중위권 — 600점대 목표" : "🔴 기초부터 — 500점대 목표";
    var weakMsg = weak ? "취약 레벨: " + weak + " (" + weakPct + "%)" : "레벨별 편차 없음";
    var recMsg = recommend ? "추천: <b>UNIT " + recommend.id + " " + esc(recommend.title) + "</b> (미학습 " + recScore + "개)" : "추천: 전체 복습";
    document.getElementById("diagBox").innerHTML =
      '<div class="quiz-result">' +
      '<div class="score">' + diagCorrect + " / " + total + '</div>' +
      '<p>정답률 ' + pct + "% · " + lvMsg + "</p>" +
      '<p>예상 TOEIC 점수 <b class="est-score">' + est + "점</b></p>" +
      '<div class="listen-script">🎯 ' + weakMsg + "<br>📖 " + recMsg + "</div>" +
      '<div class="fc-controls" style="justify-content:center">' +
      '<button class="btn" id="diagRestart">🔁 다시 진단</button>' +
      '<button class="btn" id="diagGoUnit">📖 추천 유닛 보기</button>' +
      "</div></div>";
  }

  document.getElementById("btnDiag").addEventListener("click", enterDiag);
  document.getElementById("diagStart").addEventListener("click", startDiag);
  document.getElementById("diagBox").addEventListener("click", function (e) {
    if (e.target.classList.contains("quiz-opt") && !diagAnswered) {
      answerDiag(e.target);
    } else if (e.target.id === "diagNext") {
      diagIdx++;
      if (diagIdx >= diagQ.length) showDiagResult();
      else renderDiag();
    } else if (e.target.id === "diagRestart") {
      startDiag();
    } else if (e.target.id === "diagGoUnit") {
      showListView();
      var sec = document.getElementById("unit-" + (recommend ? recommend.id : 1));
      if (sec) scrollToEl(sec);
    }
  });

  // ---------- 학습 대시보드 ----------
  function renderDashboard() {
    var learnedN = Object.keys(learned).filter(function (k) { return learned[k]; }).length;
    var wrongN = Object.keys(wrongSet).length;
    var favN = Object.keys(favSet).length;
    var dueN = srsDueWords().length;
    var pct = totalCount ? Math.round(learnedN / totalCount * 100) : 0;
    // 유형별 정답률
    var typeLabels = { en2ko: "단어→뜻", ko2en: "뜻→단어", blank: "빈칸 채우기", listen_word: "리스닝 단어", listen_sent: "리스닝 예문", listen_dict: "받아쓰기", diag: "실력 진단", mock_LC: "모의 LC", mock_RC: "모의 RC", mini: "랜덤 미니 테스트" };
    var typeHtml = "";
    Object.keys(typeLabels).forEach(function (k) {
      var s = quizStats[k];
      if (!s || !(s.c + s.w)) return;
      var p = Math.round(s.c / (s.c + s.w) * 100);
      typeHtml += '<div class="bar-row"><span class="bar-label">' + typeLabels[k] + '</span><div class="bar-track"><div class="bar-fill" style="width:' + p + '%"></div></div><span class="bar-pct">' + p + "%</span></div>";
    });
    if (!typeHtml) typeHtml = '<p style="font-size:13px;color:var(--text-muted)">아직 퀴즈 기록이 없어요. 퀴즈·리스닝·모의고사를 풀면 유형별 정답률이 표시됩니다.</p>';
    // 주간 로그 (최근 7일)
    var weekHtml = "";
    var maxWeek = 1;
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      days.push({ key: key, n: weeklyLog[key] || 0 });
      if (days[days.length - 1].n > maxWeek) maxWeek = days[days.length - 1].n;
    }
    days.forEach(function (day) {
      var h = Math.max(4, Math.round(day.n / maxWeek * 90));
      weekHtml += '<div class="week-bar" style="height:' + h + 'px"><span class="val">' + (day.n || "") + '</span><span>' + day.key.slice(5).replace("-", "/") + "</span></div>";
    });
    // 오답 TOP
    var wrongTop = Object.keys(wrongCount).sort(function (a, b) { return (wrongCount[b] || 0) - (wrongCount[a] || 0); }).slice(0, 8);
    var wrongHtml = "";
    if (wrongTop.length) {
      wrongTop.forEach(function (w) {
        var info = allWords().filter(function (x) { return x[0] === w; })[0];
        if (!info) return;
        wrongHtml += '<div style="font-size:13px;margin:4px 0"><b>' + esc(w) + "</b> <span class=\"tag tag-red\">" + wrongCount[w] + "회</span> " + esc(info[3]) + "</div>";
      });
    } else {
      wrongHtml = '<p style="font-size:13px;color:var(--text-muted)">오답이 없어요! 🎉</p>';
    }
    var catStats = categoryStats();
    var catHtml = "";
    Object.keys(catStats).sort(function (a, b) { return (catStats[a].c / (catStats[a].c + catStats[a].w)) - (catStats[b].c / (catStats[b].c + catStats[b].w)); }).forEach(function (c) {
      var s = catStats[c], n = s.c + s.w, p = n ? Math.round(s.c / n * 100) : 0;
      catHtml += '<div class="bar-row"><span class="bar-label">' + esc(c) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + p + '%"></div></div><span class="bar-pct">' + p + "%</span></div>";
    });
    if (!catHtml) catHtml = '<p style="font-size:13px;color:var(--text-muted)">퀴즈를 풀면 영역별(어휘·문법·리스닝·독해) 정답률이 분류됩니다.</p>';
    // 가장 약한 영역을 찾아 바로 훈련할 수 있는 버튼을 보여 줍니다.
    var weak = weakestCategory(4);
    var weakHtml;
    if (weak) {
      weakHtml = '<div class="big">' + esc(weak.name) + " " + Math.round(weak.p * 100) + '%</div>' +
        '<p style="font-size:12px;color:var(--text-muted)">' + weak.n + '문항 기준 · 가장 약한 영역이에요</p>' +
        (CATEGORY_DRILLS[weak.name] ? '<button class="btn quiz-btn" id="dashDrill" style="margin-top:8px">약점 훈련 열기</button>' : "");
    } else {
      weakHtml = '<p style="font-size:13px;color:var(--text-muted)">퀴즈를 한 영역에서 4문항 이상 풀면 가장 약한 곳을 추천해 드려요.</p>';
    }
    document.getElementById("dashBox").innerHTML =
      '<div class="dash-grid">' +
      '<div class="dash-card"><h3>📚 학습 진행률</h3><div class="big">' + learnedN + ' <span style="font-size:15px;color:var(--text-muted)">/ ' + totalCount + "</span></div><div class=\"bar-row\"><div class=\"bar-track\"><div class=\"bar-fill\" style=\"width:" + pct + "%\"></div></div><span class=\"bar-pct\">" + pct + "%</span></div></div>" +
      '<div class="dash-card"><h3>🔁 오늘 복습할 단어</h3><div class="big">' + dueN + "</div><button class=\"btn quiz-btn\" id=\"dashSrs\" style=\"margin-top:8px\">복습 시작</button></div>" +
      '<div class="dash-card"><h3>📕 오답 단어</h3><div class="big">' + wrongN + '</div><p style="font-size:12px;color:var(--text-muted)">📕 오답 복습으로 다시 풀 수 있어요</p></div>' +
      '<div class="dash-card"><h3>⭐ 내 단어장</h3><div class="big">' + favN + '</div><p style="font-size:12px;color:var(--text-muted)">목록에서 ⭐ 버튼으로 추가</p></div>' +
      '<div class="dash-card"><h3>🏆 최고 예상 점수</h3><div class="big">' + examBest + '</div><p style="font-size:12px;color:var(--text-muted)">점 · 📝 모의고사로 갱신</p></div>' +
      '<div class="dash-card"><h3>🔥 연속 학습</h3><div class="big">' + streakInfo.count + '</div><p style="font-size:12px;color:var(--text-muted)">일 · 오늘 ' + daily.count + "/" + DAILY_GOAL + "</p></div>" +
      "</div>" +
      '<div class="dash-grid">' +
      '<div class="dash-card"><h3>🎯 다음 학습 추천</h3>' + weakHtml + "</div>" +
      '<div class="dash-card"><h3>📈 유형별 정답률</h3>' + typeHtml + "</div>" +
      '<div class="dash-card"><h3>📅 최근 7일 학습 활동</h3><div class="week-bars">' + weekHtml + "</div></div>" +
      '<div class="dash-card"><h3>⚠️ 자주 틀린 단어</h3>' + wrongHtml + "</div>" +
      '<div class="dash-card"><h3>🧭 오답 유형 분류</h3>' + catHtml + "</div>" +
      '<div class="dash-card"><h3>🗓 28일 학습 캘린더</h3><div id="dashCalendar"></div></div>' +
      "</div>";
    var srsBtn = document.getElementById("dashSrs");
    if (srsBtn) srsBtn.addEventListener("click", enterSrs);
    var drillBtn = document.getElementById("dashDrill");
    if (drillBtn && weak) drillBtn.addEventListener("click", function () { goToCategoryDrill(weak.name); });
    renderCalendar();
  }

  function enterDash() {
    renderDashboard();
    showView("dashView", "btnDash");
  }
  document.getElementById("btnDash").addEventListener("click", enterDash);
  document.getElementById("dashRefresh").addEventListener("click", renderDashboard);

  // ---------- 가이드 탭 ----------
  document.querySelectorAll(".guide-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".guide-tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var target = tab.getAttribute("data-tab");
      document.getElementById("guideExam").style.display = target === "exam" ? "block" : "none";
      document.getElementById("guideGrammar").style.display = target === "grammar" ? "block" : "none";
      document.getElementById("guideStrategy").style.display = target === "strategy" ? "block" : "none";
      document.getElementById("guideStats").style.display = target === "stats" ? "block" : "none";
      document.getElementById("guideUsage").style.display = target === "usage" ? "block" : "none";
      if (target === "stats") renderStats();
    });
  });

  // ---------- 초기화 ----------
  // 첫 화면에 바로 필요한 것만 먼저 그리고,
  // 홈의 확장 섹션(훈련 도구·허브 등 약 40개)은 브라우저가 한가해질 때 그립니다.
  // 이렇게 하면 첫 화면이 뜨는 시간과 첫 입력까지 걸리는 시간이 줄어듭니다.
  // ---------- 확장 콘텐츠(data/extra.js) 지연 로드 ----------
  // 첫 화면에 필요 없는 167KB 라, 브라우저가 한가해지거나 그 내용이 필요해질 때 받아옵니다.
  // 서비스워커가 설치 때 미리 캐시해 두므로 두 번째 방문부터는 즉시 로드됩니다.
  // ---------- 교재 데이터(문법·회화 6파일) 지연 로드 ----------
  // index.html 이 부르지 않으므로(첫 화면에 필요 없음) 앱이 필요한 순간에 받아옵니다.
  //   · 홈의 교재 카드  → 그 섹션이 화면에 들어올 때(미리 700px 앞에서)
  //   · 문법·회화 학습  → 교재 데이터가 있어야 단계 목록·문항이 만들어집니다
  // 서비스워커 프리캐시(DATA_ASSETS)에는 그대로 있으므로, 한 번 본 뒤에는 오프라인에서도 즉시 로드됩니다.
  var BOOK_FILES = {
    grammar: ["data/grammar-basic.js", "data/grammar-intermediate.js", "data/grammar-advanced.js"],
    conversation: ["data/conversation-basic.js", "data/conversation-intermediate.js", "data/conversation-advanced.js"]
  };
  var bookState = { grammar: "idle", conversation: "idle" };
  var bookWaiters = { grammar: [], conversation: [] };
  function applyGrammarBooks() {
    GRAMMAR_BOOKS = window.GRAMMAR_BOOKS || [];
    renderGrammarLevelSelect();
    renderGrammarWrongNote();
    renderGrammarBooks();
    renderGrammarChapterHint();
  }
  function applyConversationBooks() {
    CONVERSATION_BOOKS = window.CONVERSATION_BOOKS || [];
    renderConversationBooks();
  }
  function bookDone(kind) {
    if (kind === "grammar") applyGrammarBooks();
    else applyConversationBooks();
    var waiters = bookWaiters[kind];
    bookWaiters[kind] = [];
    waiters.forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  /** 교재 데이터를 받아옵니다. 이미 있으면 곧바로 cb 를 부릅니다. */
  function loadBooks(kind, cb) {
    if (bookState[kind] === "ready" || bookState[kind] === "failed") { if (cb) cb(); return; }
    if (cb) bookWaiters[kind].push(cb);
    if (bookState[kind] === "loading") return;
    bookState[kind] = "loading";
    var files = BOOK_FILES[kind];
    var i = 0;
    (function next() {
      if (i >= files.length) { bookState[kind] = "ready"; bookDone(kind); return; }
      var s = document.createElement("script");
      s.src = files[i++];
      s.onload = next;
      // 못 받아와도 앱은 그대로 동작합니다(교재 카드·문항이 비어 보일 뿐입니다).
      s.onerror = function () {
        if (i >= files.length) { bookState[kind] = "failed"; bookDone(kind); }
        else next();
      };
      document.head.appendChild(s);
    })();
  }
  /** 교재 카드·퀴즈가 화면에 들어오려 할 때 받아옵니다(스크롤 전에 미리). */
  function watchBookSections() {
    if (!("IntersectionObserver" in window)) { loadBooks("grammar"); loadBooks("conversation"); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) loadBooks(entry.target.getAttribute("data-books"));
      });
    }, { rootMargin: "700px 0px" });
    var triggers = { grammar: ["grammarBookGrid", "grammarBox"], conversation: ["conversationBookGrid"] };
    Object.keys(triggers).forEach(function (kind) {
      triggers[kind].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) { el.setAttribute("data-books", kind); io.observe(el); }
      });
    });
  }

  var extraScriptState = "idle"; // idle | loading | ready | failed
  var extraWaiters = [];
  function finishExtra(state) {
    extraScriptState = state;
    var waiters = extraWaiters;
    extraWaiters = [];
    waiters.forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  function loadExtra(cb) {
    if (extraScriptState === "ready" || extraScriptState === "failed") { if (cb) cb(); return; }
    if (cb) extraWaiters.push(cb);
    if (extraScriptState === "loading") return;
    extraScriptState = "loading";
    var s = document.createElement("script");
    s.src = "data/extra.js";
    s.onload = function () { EXTRA = window.TOEIC_EXTRA || {}; applyExtraData(); finishExtra("ready"); };
    // 못 받아와도 앱은 그대로 동작합니다(확장 섹션만 비어 보입니다).
    s.onerror = function () { finishExtra("failed"); };
    document.head.appendChild(s);
  }

  function scheduleExtendedHome() {
    var run = function () {
      // 교재 데이터도 첫 화면이 뜬 뒤에 받아 둡니다(카드·퀴즈가 필요로 하기 전에 미리).
      loadBooks("grammar");
      loadBooks("conversation");
      loadExtra(renderExtendedSlices);
    };
    if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 2500 });
    else setTimeout(run, 250);
  }

  // 데이터 스크립트가 defer 라 이 스크립트보다 늦게 실행됩니다.
  // 그래서 초기화는 DOMContentLoaded(defer 스크립트가 모두 끝난 뒤)부터 시작합니다.
  function startApp() {
    // defer 로 늦게 들어온 데이터를 이때 한 번 더 읽습니다.
    IDIOMS = window.VOCAB_IDIOMS || [];
    GRAMMAR_BOOKS = window.GRAMMAR_BOOKS || [];
    if (window.TOEIC_EXTRA) { EXTRA = window.TOEIC_EXTRA; applyExtraData(); }
    // 교재 단계 목록은 교재 데이터(지연 로드)가 온 뒤에 그립니다 — applyGrammarBooks 참고.
    // 오답노트는 브라우저에 저장된 문항만 쓰므로 지금 그려도 됩니다.
    renderGrammarWrongNote();
    watchBookSections();
    collectUnits();
    syncLevelButtons();
    // 단어 목록(1,000장 카드)은 홈이 아니라 사용자가 목록을 처음 열 때 그립니다(showListView).
    updateProgress();
    updateWrongBadge();
    updateDailyUI();
    updateStreakUI();
    showHome();
    scheduleExtendedHome();
    openFromQuery();
    // 초기 렌더(오늘의 학습 등)가 끝난 뒤에 이동해야 위치가 어긋나지 않습니다.
    setTimeout(function () {
      // 교재 페이지에서 넘어온 흐름(?level=·&ch=)이면 교재 데이터가 먼저 필요합니다
      // (지연 로드라 아직 안 왔을 수 있습니다). 받은 뒤에 단계·과를 해석하고 풀이로 들어갑니다.
      var cfg = parseDeepLink(location.search);
      if (cfg && bookState.grammar === "idle") {
        loadBooks("grammar", function () {
          var started = applyLevelQuery();
          if (!started) {
            goToHash(location.hash);
            applyViewFromHistory();
          }
        });
        return;
      }
      var started = applyLevelQuery();
      if (!started) {
        goToHash(location.hash);
        // 주소에 화면(#view=…)이 적혀 있으면 그 화면으로 시작합니다(새로고침·공유·뒤로가기 대응).
        applyViewFromHistory();
      }
    }, 0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startApp);
  else startApp();

  // ---------- 딥링크 ----------
  // 유닛 정적 페이지(units/unit-NN.html)와 검색엔진 SearchAction 이 넘겨주는
  // ?unit=N / ?q=검색어 를 받아 바로 해당 화면을 연다.
  function openFromQuery() {
    var unitMatch = /[?&]unit=(\d{1,2})(?:&|$)/.exec(location.search);
    if (unitMatch) {
      var id = parseInt(unitMatch[1], 10);
      if (all.some(function (u) { return u.unit === id; })) { goUnit(id); return; }
    }
    var qMatch = /[?&]q=([^&]*)/.exec(location.search);
    if (!qMatch) return;
    var term = "";
    try { term = decodeURIComponent(qMatch[1].replace(/\+/g, " ")); } catch (e) { term = ""; }
    term = term.trim();
    if (!term) return;
    var searchEl = document.getElementById("searchInput");
    if (searchEl) searchEl.value = term;
    renderUnits(term);
    showListView();
  }

  // ---------- 다크 모드 ----------
  // persist=false 이면 저장하지 않습니다. OS 설정을 따라가는 중임을 기록에 남기지 않기 위해서입니다.
  function setTheme(t, persist) {
    var isDark = t === "dark";
    document.body.classList.toggle("dark", isDark);
    document.documentElement.classList.remove("dark-pending");
    if (persist !== false) { try { localStorage.setItem("toeic1000_theme", t); } catch (e) {} }
    var btn = document.getElementById("btnTheme");
    if (btn) {
      btn.textContent = isDark ? "☀️" : "🌙";
      // 아이콘과 안내 문구가 항상 "누르면 되는 동작"을 설명하도록 함께 바꿉니다.
      var label = isDark ? "라이트 모드로 전환" : "다크 모드로 전환";
      btn.setAttribute("aria-label", label);
      btn.title = label;
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    }
    var meta = document.getElementById("metaThemeColor");
    if (meta) meta.setAttribute("content", isDark ? "#10141b" : "#3b5bdb");
  }
  document.getElementById("btnTheme").addEventListener("click", function () {
    setTheme(document.body.classList.contains("dark") ? "light" : "dark");
  });
  // OS가 다크 모드인지 확인합니다(설정을 아직 직접 고르지 않았을 때만 사용).
  function prefersDark() {
    try { return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches); } catch (e) { return false; }
  }
  // 저장된 선택이 있으면 그것을, 없으면 OS 설정을 첫 값으로 씁니다.
  // OS 설정을 따른 경우에는 저장하지 않아, 이후 OS가 바뀌면 그대로 따라갑니다.
  var savedTheme = "";
  try { savedTheme = localStorage.getItem("toeic1000_theme") || ""; } catch (e) {}
  setTheme(savedTheme || (prefersDark() ? "dark" : "light"), !!savedTheme);
  if (!savedTheme && window.matchMedia) {
    var systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    var onSystemThemeChange = function (e) { setTheme(e.matches ? "dark" : "light", false); };
    if (systemThemeQuery.addEventListener) systemThemeQuery.addEventListener("change", onSystemThemeChange);
    else if (systemThemeQuery.addListener) systemThemeQuery.addListener(onSystemThemeChange);
  }

  // ---------- 해시 진입 (정적 교재 페이지 → 앱의 특정 섹션) ----------
  // 교재 페이지의 "앱에서 이 교재 문제 풀기" 가 ../#grammar-quiz-basic 형태로 들어옵니다.
  // 해시를 모르면 아무 일도 하지 않고, aria-label 을 직접 쓴 경우(#문법 문제 풀이)도 받아 줍니다.
  var HASH_TARGETS = {
    "units": { section: "주제별 유닛" },
    "quiz": { section: "학습 모드" },
    "grammar-books": { section: "문법 교재 3단계" },
    "cheatsheet": { section: "문법 교재 3단계" },
    "grammar-quiz": { section: "문법 문제 풀이" },
    "grammar-quiz-basic": { section: "문법 문제 풀이", level: "basic" },
    "grammar-quiz-intermediate": { section: "문법 문제 풀이", level: "intermediate" },
    "grammar-quiz-advanced": { section: "문법 문제 풀이", level: "advanced" },
    "dashboard": { section: "주간 학습 리포트" }
  };
  function goToHash(hash) {
    var key = "";
    try { key = decodeURIComponent(String(hash || "").replace(/^#/, "")).trim(); } catch (e) { key = ""; }
    if (!key) return false;
    var cfg = HASH_TARGETS[key];
    var sec = document.querySelector('.home-section[aria-label="' + (cfg ? cfg.section : key) + '"]');
    if (!sec) return false;
    if (activeView !== "homeView") showHome();
    if (cfg && cfg.level) {
      var sel = document.getElementById("grammarLevelSel");
      if (sel) { sel.value = cfg.level; grammarWrongOnly = false; grammarQuiz.render(); }
    }
    scrollToEl(sec, "start");
    // 문제 풀이 링크(#grammar-quiz-*)는 교재를 읽다 넘어온 흐름이므로 바로 시작합니다.
    if (cfg && cfg.level) setTimeout(function () { startGrammarQuiz(false); }, 420);
    return true;
  }
  // 교재 페이지는 ?level=basic&ch=5#grammar-quiz 형태로 들어옵니다(단계·과 지정 + 바로 풀이).
  function applyLevelQuery() {
    var cfg = parseDeepLink(location.search);
    if (!cfg) return false;
    var sel = document.getElementById("grammarLevelSel");
    if (!sel) return false;
    sel.value = cfg.level;
    grammarWrongOnly = false;
    grammarChapterOnly = resolveChapter(GRAMMAR_BOOKS, cfg.level, cfg.chapter);
    renderGrammarChapterHint();
    grammarQuiz.render();
    if (/#grammar-quiz/.test(location.hash || "")) {
      setTimeout(function () { startGrammarQuiz(false); }, 420);
      return true;
    }
    return false;
  }
  window.addEventListener("hashchange", function () { goToHash(location.hash); });
  // 긴 홈에서 스크롤이 깊어지면 돌아가는 버튼과 섹션 이동 버튼을 보여 줍니다.
  // 섹션 칩은 화면 맨 위에 있어, 깊은 구간에서는 「맨 위로」를 거쳐야 다른 섹션으로 갈 수 있었습니다.
  // (목차를 고정하지 않은 것은 의도된 선택이라 — docs/ux-review.md §13-6 — 그 대신 한 섹션씩 옮겨 다닐 수 있게 합니다.)
  (function initDeepNav() {
    var top = document.getElementById("toTop");
    var jump = document.getElementById("secJump");
    var prevBtn = document.getElementById("secPrev");
    var nextBtn = document.getElementById("secNext");
    // 홈 섹션을 문서 순서대로 모읍니다(접힌 묶음 안의 섹션도 순서는 그대로 둡니다).
    var sections = [].slice.call(document.querySelectorAll("#homeView .home-section"));
    function scrollY() {
      return window.pageYOffset || document.documentElement.scrollTop || 0;
    }
    // 지금 보고 있는 섹션의 번지 — 접혀서 높이가 0인 섹션은 건너뜁니다.
    function currentIndex() {
      var line = scrollY() + window.innerHeight * 0.2;
      var idx = 0;
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        if (r.height > 0 && r.top + scrollY() <= line) idx = i;
      }
      return idx;
    }
    function move(step) {
      if (!sections.length) return;
      var target = sections[currentIndex() + step];
      // scrollToEl 이 접힌 묶음을 먼저 열어 줍니다.
      if (target) {
        scrollToEl(target, "start");
        // 위치 표시는 스크롤이 멈춘 뒤 IntersectionObserver 가 갱신해 한 박자 늦습니다.
        // 코드로 옮긴 것이 확실하므로 여기서 바로 맞춥니다.
        setCurrentSection(target.getAttribute("aria-label"));
      }
    }
    function sync() {
      var deep = scrollY() > 700;
      if (top) top.hidden = !deep;
      if (jump) jump.hidden = !deep;
    }
    window.addEventListener("scroll", sync, { passive: true });
    if (top) {
      top.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { move(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { move(1); });
    sync();
  })();

  // 「/」 로 단어 검색으로 바로 이동 — 53섹션과 1,000단어를 훑지 않고 바로 찾기 위해.
  // 검색창은 「단어 목록」 화면에만 있으므로, 다른 화면이면 그 화면으로 옮긴 뒤 초점을 줍니다.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    var tag = t && t.tagName ? t.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || (t && t.isContentEditable)) return;
    var box = document.getElementById("searchInput");
    if (!box) return;
    e.preventDefault();
    if (activeView !== "units") showListView();
    try { box.focus({ preventScroll: true }); } catch (err) { box.focus(); }
    if (box.select) { try { box.select(); } catch (err2) {} }
  });
})();
