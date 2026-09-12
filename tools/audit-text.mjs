#!/usr/bin/env node
/**
 * toeic.monster 문구·맞춤법·TTS 감사 도구
 *
 * 화면에 보이는 모든 문구(데이터 + index.html)를 모아 아래를 점검합니다.
 *   1) TTS로 읽히는 문자열에 낭독이 어려운 기호가 섞였는지 (|, →, ~, 한글 등)
 *   2) 한글 맞춤법·표기 오류 (자주 틀리는 표현 사전)
 *   3) 영문 철자 오류 (자주 틀리는 비즈니스 단어 사전)
 *   4) 공통 타이포그래피 오류 (겹친 공백, 구두점 앞 공백, 중복 단어, 전각 문자)
 *
 * 실행:  node tools/audit-text.mjs
 * 종료 코드: 문제가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const problems = [];
const notes = [];
const add = (where, text, msg) => problems.push({ where, text: String(text), msg });
const note = (where, text, msg) => notes.push({ where, text: String(text), msg });
// 낭독 시 한글 라벨(예: "공지문:")이 제거되는 것은 설계된 동작입니다.
const KO_LABEL_PREFIX = /^[가-힣]{1,6}\s*[::]\s*/;

/* ------------------------------------------------------------------ */
/* 1. 데이터 로드                                                      */
/* ------------------------------------------------------------------ */

function loadData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (let i = 1; i <= 30; i++) {
    const f = `data/unit${String(i).padStart(2, "0")}.js`;
    vm.runInContext(read(f), sandbox, { filename: f, timeout: 5000 });
  }
  for (const f of ["data/idioms.js", "data/extra.js"]) {
    vm.runInContext(read(f), sandbox, { filename: f, timeout: 5000 });
  }
  return {
    vocab: sandbox.window.VOCAB_UNITS || {},
    idioms: sandbox.window.VOCAB_IDIOMS || [],
    extra: sandbox.window.TOEIC_EXTRA || {},
  };
}

const html = read("index.html");

function sliceBalanced(src, openIdx) {
  const open = src[openIdx];
  const close = open === "[" ? "]" : open === "{" ? "}" : ")";
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return src.slice(openIdx, i + 1);
  }
  return null;
}

function extractArray(name) {
  const at = html.indexOf(`var ${name} = `);
  if (at === -1) return null;
  const start = html.indexOf("[", at);
  if (start === -1) return null;
  const src = sliceBalanced(html, start);
  if (!src) return null;
  try { return vm.runInNewContext(src, {}, { timeout: 5000 }); } catch { return null; }
}

const { vocab, idioms, extra } = loadData();
const A = (n) => extractArray(n) || [];

/* ------------------------------------------------------------------ */
/* 2. 검사 대상 모으기 (tts = 음성으로 읽히는 문구)                     */
/* ------------------------------------------------------------------ */

const rows = []; // { where, text, tts }
const push = (where, text, tts) => {
  if (typeof text !== "string") return;
  let t = text.trim();
  if (!t) return;
  // 빈칸 치환(" blank ")이 만든 중복 공백·구두점 앞 공백은 낭독 전에 정리되므로 여기서도 동일하게 처리한다.
  if (where.includes("part6")) t = t.replace(/ {2,}/g, " ").replace(/ +([.,;:!?])/g, "$1");
  rows.push({ where, text: t, tts: !!tts });
};
const pushAll = (where, list, tts) => (list || []).forEach((s, i) => push(`${where}[${i}]`, s, tts));

// 2-1. 유닛 어휘 (단어·예문이 TTS)
for (const id of Object.keys(vocab)) {
  vocab[id].forEach((w, i) => {
    push(`unit${id}[${i}].word`, w[0], true);
    push(`unit${id}[${i}].ex`, w[4], true);
    push(`unit${id}[${i}].mean`, w[3], false);
    push(`unit${id}[${i}].exKo`, w[5], false);
    push(`unit${id}[${i}].kpron`, w[2], false);
  });
}

// 2-2. 숙어 (표현·예문이 TTS)
idioms.forEach((it, i) => {
  push(`idioms[${i}].expr`, it[0], true);
  push(`idioms[${i}].mean`, it[1], false);
  push(`idioms[${i}].ex`, it[2], true);
  push(`idioms[${i}].exKo`, it[3], false);
});

// 2-3. 확장 콘텐츠
(extra.part7 || []).forEach((s, i) => {
  (s.passages || []).forEach((p, pi) => push(`extra.part7[${i}].passage${pi}`, p.text, true));
  (s.qs || []).forEach((q, qi) => {
    push(`extra.part7[${i}].q${qi}.prompt`, q.q, false);
    pushAll(`extra.part7[${i}].q${qi}.opt`, q.opts, false);
  });
});
(extra.part6 || []).forEach((s, i) => {
  push(`extra.part6[${i}].text`, s.text.replace(/__\(\d+\)__/g, " blank "), true);
  (s.blanks || []).forEach((b, bi) => {
    push(`extra.part6[${i}].blank${bi}.opts`, (b.opts || []).join(" / "), false);
    push(`extra.part6[${i}].blank${bi}.why`, b.why, false);
  });
});
(extra.traps || []).forEach((t, i) => {
  push(`extra.traps[${i}].audio`, t.audio, true);
  push(`extra.traps[${i}].ko`, t.ko, false);
});
(extra.paraphrase || []).forEach((p, i) => {
  push(`extra.paraphrase[${i}].prompt`, p.prompt, false);
  pushAll(`extra.paraphrase[${i}].opt`, p.opts, false);
  push(`extra.paraphrase[${i}].why`, p.why, false);
});
(extra.part1 || []).forEach((p, i) => {
  push(`extra.part1[${i}].scene`, p.scene, false);
  pushAll(`extra.part1[${i}].opt`, p.opts, true); // 보기 문장은 영어
});
(extra.frequency || []).forEach((w, i) => push(`extra.frequency[${i}]`, w[0], true));
(extra.numbers || []).forEach((n, i) => push(`extra.numbers[${i}].audio`, n.audio, true));
(extra.speakTemplates || []).forEach((t, i) => {
  push(`extra.speakTemplates[${i}].type`, t.type, false);
  push(`extra.speakTemplates[${i}].ko`, t.ko, false);
  pushAll(`extra.speakTemplates[${i}].lines`, t.lines, true);
});
(extra.writeTemplates || []).forEach((t, i) => {
  push(`extra.writeTemplates[${i}].type`, t.type, false);
  push(`extra.writeTemplates[${i}].ko`, t.ko, false);
  pushAll(`extra.writeTemplates[${i}].structure`, t.structure, false);
  push(`extra.writeTemplates[${i}].sample`, t.sample, true);
});
(extra.swFormat || []).forEach((r, i) => {
  push(`extra.swFormat[${i}].task`, r.task, false);
  push(`extra.swFormat[${i}].ko`, r.ko, false);
  push(`extra.swFormat[${i}].time`, r.time, false);
  pushAll(`extra.swFormat[${i}].points`, r.points, false);
});
(extra.speakDrills || []).forEach((d, i) => {
  push(`extra.speakDrills[${i}].type`, d.type, false);
  push(`extra.speakDrills[${i}].ko`, d.ko, false);
  push(`extra.speakDrills[${i}].text`, d.text, true);
  push(`extra.speakDrills[${i}].tip`, d.tip, false);
});
(extra.writeDrills || []).forEach((d, i) => {
  push(`extra.writeDrills[${i}].type`, d.type, false);
  push(`extra.writeDrills[${i}].ko`, d.ko, false);
  pushAll(`extra.writeDrills[${i}].given`, d.given, true);
  push(`extra.writeDrills[${i}].request`, d.request, true);
  push(`extra.writeDrills[${i}].question`, d.question, true);
  pushAll(`extra.writeDrills[${i}].outline`, d.outline, false);
  push(`extra.writeDrills[${i}].sample`, d.sample, true);
});
(extra.situations || []).forEach((s, i) => {
  (s.lines || []).forEach((l, li) => push(`extra.situations[${i}].line${li}`, l[2] || l[1], true));
  (s.quiz || []).forEach((q, qi) => push(`extra.situations[${i}].q${qi}`, q.q, false));
});
(extra.stories || []).forEach((s, i) => {
  push(`extra.stories[${i}].word`, s.word, true);
  push(`extra.stories[${i}].tip`, s.tip, false);
});
pushAll("extra.dictation", extra.dictation, true);
(extra.guides || []).forEach((g, i) => {
  push(`extra.guides[${i}].title`, g.title, false);
  push(`extra.guides[${i}].desc`, g.desc, false);
  (g.sections || []).forEach((s, si) => pushAll(`extra.guides[${i}].sec${si}`, s.list, false));
});

// 2-4. index.html 배열
A("GRAMMAR_TIPS").forEach((t, i) => {
  push(`GRAMMAR_TIPS[${i}].rule`, t[0], false);
  push(`GRAMMAR_TIPS[${i}].ex`, t[1], true);
  push(`GRAMMAR_TIPS[${i}].desc`, t[2], false);
});
A("CONFUSABLES").forEach((c, i) => {
  push(`CONFUSABLES[${i}].pair`, c.pair, false);
  push(`CONFUSABLES[${i}].a.en`, c.a && c.a.en, true);
  push(`CONFUSABLES[${i}].a.ko`, c.a && c.a.ko, false);
  push(`CONFUSABLES[${i}].b.en`, c.b && c.b.en, true);
  push(`CONFUSABLES[${i}].b.ko`, c.b && c.b.ko, false);
  push(`CONFUSABLES[${i}].tip`, c.tip, false);
});
A("WORD_PARTS").forEach((w, i) => push(`WORD_PARTS[${i}].ex`, w.ex, true));
A("COLLOCATIONS").forEach((c, i) => {
  push(`COLLOCATIONS[${i}].phrase`, c.phrase, true);
  push(`COLLOCATIONS[${i}].ko`, c.ko, false);
  push(`COLLOCATIONS[${i}].ex`, c.ex, true);
  push(`COLLOCATIONS[${i}].exKo`, c.exKo, false);
});
A("CONTEXT_VOCAB").forEach((c, i) => {
  push(`CONTEXT_VOCAB[${i}].passage`, String(c.passage || "").replace(/<[^>]+>/g, ""), true);
  push(`CONTEXT_VOCAB[${i}].ko`, c.ko, false);
});
A("LC_TRAINING").forEach((c, i) => {
  push(`LC_TRAINING[${i}].audio`, c.audio, true);
  push(`LC_TRAINING[${i}].ko`, c.ko, false);
});
A("WORD_FAMILIES").forEach((f, i) => push(`WORD_FAMILIES[${i}].ex`, f.ex, true));
A("WF_QUESTIONS").forEach((q, i) => push(`WF_QUESTIONS[${i}].ex`, q.ex, true));
A("MINIMAL_PAIRS").forEach((m, i) => {
  push(`MINIMAL_PAIRS[${i}].a`, m.a, true);
  push(`MINIMAL_PAIRS[${i}].b`, m.b, true);
  push(`MINIMAL_PAIRS[${i}].tip`, m.tip, false);
});
A("MNEMONICS").forEach((m, i) => {
  push(`MNEMONICS[${i}].word`, m.word, true);
  push(`MNEMONICS[${i}].ex`, m.ex, true);
  push(`MNEMONICS[${i}].tip`, m.tip, false);
});
A("BIZ_TEMPLATES").forEach((t, i) => pushAll(`BIZ_TEMPLATES[${i}].lines`, t.lines, true));
A("DIALOGUES").forEach((d, i) => {
  push(`DIALOGUES[${i}].title`, d.title, false);
  (d.lines || []).forEach((l, li) => push(`DIALOGUES[${i}].line${li}`, l[2] || l[1], true));
});
const partBank = (() => {
  const at = html.indexOf("var PART_BANK = ");
  if (at === -1) return null;
  const src = sliceBalanced(html, html.indexOf("{", at));
  try { return vm.runInNewContext("(" + src + ")", {}, { timeout: 5000 }); } catch { return null; }
})();
if (partBank) {
  for (const [part, list] of Object.entries(partBank)) {
    list.forEach((q, i) => push(`PART_BANK.${part}[${i}].q`, q.q, true));
  }
}
A("READING_MINI").forEach((r, i) => {
  push(`READING_MINI[${i}].text`, r.text, true);
  push(`READING_MINI[${i}].q`, r.q, false);
});
A("DOUBLE_READING").forEach((d, i) => {
  (d.passages || []).forEach((p, pi) => push(`DOUBLE_READING[${i}].passage${pi}`, p.text, true));
});
A("SPEAKING_PROMPTS").forEach((p, i) => push(`SPEAKING_PROMPTS[${i}]`, p[0], true));
A("QUOTES").forEach((q, i) => {
  push(`QUOTES[${i}].en`, q.en, true);
  push(`QUOTES[${i}].ko`, q.ko, false);
});
pushAll("SHADOWING_SENTENCES", A("SHADOWING_SENTENCES"), true);
pushAll("CHEERS", A("CHEERS"), false);

// 2-5. index.html 본문 텍스트·속성 (태그 제거)
const bodyHtml = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ");
for (const m of bodyHtml.matchAll(/>([^<>]+)</g)) {
  push("html.text", m[1].replace(/\s+/g, " "), false);
}
for (const m of bodyHtml.matchAll(/(?:aria-label|placeholder|title)="([^"]+)"/g)) {
  push("html.attr", m[1], false);
}

/* ------------------------------------------------------------------ */
/* 3. 규칙                                                             */
/* ------------------------------------------------------------------ */

const HAS_HANGUL = /[\u3131-\u318E\uAC00-\uD7A3]/;

/** index.html 의 ttsClean() 과 같은 규칙으로 낭독 문장을 다듬는다. */
function ttsClean(text) {
  let s = String(text == null ? "" : text);
  s = s.replace(/[|｜]/g, ", ");
  s = s.replace(/[→➔➜]/g, " to ");
  s = s.replace(/[←]/g, ", ");
  s = s.replace(/[~〜]|\u301C/g, " to ");
  s = s.replace(/[·•※★☆◈■□●○◆◇]/g, " ");
  s = s.replace(/…/g, ", ");
  s = s.replace(/\s*＿{2,}\s*/g, " blank ");
  s = s.replace(/\s*_{2,}\s*/g, " blank ");
  s = s.replace(/[\u3131-\u318E\uAC00-\uD7A3\u4E00-\u9FFF]+/g, " ");
  s = s.replace(/\s{2,}/g, " ");
  s = s.replace(/^[\s,;:.!?\-]+/, "");
  s = s.replace(/\s+([,.;:!?])/g, "$1");
  return s.trim();
}

// TTS 낭독을 방해하는 기호 (문자 → 대체어 안내)
const TTS_HOSTILE = [
  [/\|/, "| (표 구분자)"],
  [/[→←↔⇢]/, "화살표"],
  [/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]/, "원문자"],
  [/[★☆◈■□●○◆◇※]/, "기호 문자"],
  [/[＊＃＠＆％]/, "전각 기호"],
  [/[~〜]/, "~ (범위/약)"],
  [/[{}<>[\]\\^_]/, "프로그래밍 기호"],
  [/·/, "가운뎃점"],
  [/…/, "말줄임표(… 대신 ... 사용)"],
];

// 자주 틀리는 한글 표기
const KO_FIX = {
  "할수있": "할 수 있",
  "할수없": "할 수 없",
  "될수있": "될 수 있",
  "볼수있": "볼 수 있",
  "쓸수있": "쓸 수 있",
  "있을수있": "있을 수 있",
  "합정": "함정",
  "역활": "역할",
  "됬": "됐",
  "몇일": "며칠",
  "몇개": "몇 개",
  "몇번": "몇 번",
  "어떻해": "어떡해",
  "웬지": "왠지",
  "왠일": "웬일",
  "할께": "할게",
  "갈께": "갈게",
  "줄께": "줄게",
  "예기": "얘기",
  "구지": "굳이",
  "바램": "바람",
  "가르키": "가리키",
  "갯수": "개수",
  "금새": "금세",
  "오랫만": "오랜만",
  "얼만큼": "얼마큼",
  "담궈": "담가",
  "치루": "치르",
  "틈틈히": "틈틈이",
  "꺼꾸로": "거꾸로",
  "서슴치": "서슴지",
  "여지껏": "여태껏",
  "설레임": "설렘",
  "무우": "무",
  "댓가": "대가",
  "컨텐츠": "콘텐츠",
  "메뉴얼": "매뉴얼",
  "데이타": "데이터",
  "레포트": "리포트",
  "스케쥴": "스케줄",
  "할려고": "하려고",
  "깨끗히": "깨끗이",
  "어의없": "어이없",
  "왠만": "웬만",
  "뵈요": "봬요",
  "않되": "안 되",
  "부딪치": "부딪히",
  "챙기": "챙기",
};

// 자주 틀리는 영문 단어
const EN_FIX = {
  alot: "a lot",
  aswell: "as well",
  infront: "in front",
  everytime: "every time",
  irregardless: "regardless",
  supposably: "supposedly",
  recieve: "receive",
  receieve: "receive",
  seperate: "separate",
  seperately: "separately",
  occured: "occurred",
  occurence: "occurrence",
  accomodation: "accommodation",
  definately: "definitely",
  succesful: "successful",
  successfull: "successful",
  untill: "until",
  wich: "which",
  becuase: "because",
  teh: "the",
  adress: "address",
  buisness: "business",
  buisnesse: "business",
  managment: "management",
  enviroment: "environment",
  commitee: "committee",
  responsibilty: "responsibility",
  avaliable: "available",
  calender: "calendar",
  existance: "existence",
  occurance: "occurrence",
  maintenence: "maintenance",
  maintainance: "maintenance",
  priviledge: "privilege",
  garantee: "guarantee",
  gaurantee: "guarantee",
  schedual: "schedule",
  reccomend: "recommend",
  personel: "personnel",
  agressive: "aggressive",
  arguement: "argument",
  begining: "beginning",
  beleive: "believe",
  collegue: "colleague",
  comming: "coming",
  commited: "committed",
  competance: "competence",
  concensus: "consensus",
  dependant: "dependent",
  dissapoint: "disappoint",
  embarass: "embarrass",
  experiance: "experience",
  familar: "familiar",
  finaly: "finally",
  foriegn: "foreign",
  fourty: "forty",
  futher: "further",
  gaurd: "guard",
  goverment: "government",
  immediatly: "immediately",
  independant: "independent",
  knowlege: "knowledge",
  liason: "liaison",
  libary: "library",
  lisence: "license",
  neccessary: "necessary",
  necessery: "necessary",
  noticable: "noticeable",
  occassion: "occasion",
  offical: "official",
  oppurtunity: "opportunity",
  paralel: "parallel",
  particulary: "particularly",
  persue: "pursue",
  posession: "possession",
  prefered: "preferred",
  privilage: "privilege",
  proffesional: "professional",
  promiss: "promise",
  publically: "publicly",
  reciept: "receipt",
  refered: "referred",
  relevent: "relevant",
  responsable: "responsible",
  rythm: "rhythm",
  sucess: "success",
  sucessfully: "successfully",
  supercede: "supersede",
  supress: "suppress",
  suprise: "surprise",
  tarrif: "tariff",
  tendancy: "tendency",
  threshhold: "threshold",
  tommorow: "tomorrow",
  transfered: "transferred",
  truely: "truly",
  unfortunatly: "unfortunately",
  usefull: "useful",
  usualy: "usually",
  vacume: "vacuum",
  wierd: "weird",
  writen: "written",
  yeild: "yield",
};

// 대소문자를 구분해야 하는 고유명사 오타 방지용 화이트리스트
const EN_WHITELIST = new Set(["etc", "eg", "ie", "vs", "pmonly"]);

for (const { where, text, tts } of rows) {
  // 3-1. TTS 낭독 문제 — sanitize 후에도 남는 문제만 보고한다.
  if (tts) {
    const spoken = ttsClean(text);
    if (!spoken || !/[A-Za-z]/.test(spoken)) {
      add(where, text, "TTS로 읽을 영어가 없습니다(낭독 버튼이 동작하지 않음)");
    } else {
      for (const [re, label] of TTS_HOSTILE) {
        if (re.test(spoken)) add(where, text, "TTS 낭독을 방해하는 기호: " + label);
      }
      if (HAS_HANGUL.test(text) && !KO_LABEL_PREFIX.test(text)) {
        add(where, text, "TTS 대상에 한글이 섞여 있어 낭독 시 누락됩니다");
      } else if (HAS_HANGUL.test(text)) {
        note(where, text, "한글 라벨은 낭독에서 제외됩니다(설계된 동작)");
      }
    }
  }
  // 3-2. 공통 타이포그래피
  if (/\s{2,}/.test(text)) add(where, text, "연속 공백이 있습니다");
  const spaceBeforePunct = text.match(/[([{]\s+|\s+[)\]}.,;:!?]/);
  if (spaceBeforePunct) add(where, text, `구두점 앞·괄호 안쪽에 불필요한 공백: "${spaceBeforePunct[0]}"`);
  const doubleWord = text.match(/\b([A-Za-z]{2,})\s+\1\b/i);
  const OK_DOUBLE = /^(that|had|very|so|no|five|oh|nine|ten|one|zero|two|three|four|six|seven|eight)$/i;
  if (doubleWord && !OK_DOUBLE.test(doubleWord[1])) {
    add(where, text, `같은 단어가 연속됩니다: "${doubleWord[0]}"`);
  }
  // 쉼표·마침표 뒤 공백 누락 (숫자·약어는 제외)
  const noSpace = text.match(/[a-z][,;](?=[A-Za-z])|[a-z]\.(?=[A-Z][a-z]{2,})/);
  if (noSpace) add(where, text, `구두점 뒤 공백이 없습니다: "${noSpace[0]}"`);
  // 소문자로 시작하는 온전한 영문장 (HTML 본문은 문장 중간에서 잘리므로 데이터만 검사)
  if (!where.startsWith("html.") && /^[a-z][a-z' ]{8,}[.!?]$/.test(text) && !/^(and|or|but|so|because|if|when)\b/.test(text)) {
    add(where, text, "영문장이 소문자로 시작합니다");
  }
  const koDouble = text.match(/([가-힣]{2,})\s+\1/);
  if (koDouble) add(where, text, `같은 단어가 연속됩니다: "${koDouble[0]}"`);
  // 전각 영숫자·물음표
  if (/[Ａ-Ｚａ-ｚ０-９？-～]/.test(text.replace(/＿/g, ""))) add(where, text, "전각 문자(ＡＢＣ/１２３)가 섞였습니다");
  // 다른 종류의 따옴표 혼용
  if (text.includes("“") || text.includes("”")) add(where, text, "곱은따옴표(“ ”) 대신 직선 따옴표 사용 권장");
  // 3-3. 한글 맞춤법 사전
  for (const [bad, good] of Object.entries(KO_FIX)) {
    if (bad === good) continue;
    if (text.includes(bad)) add(where, text, `한글 표기: "${bad}" → "${good}"`);
  }
  // 3-4. 영문 철자 사전
  for (const word of text.match(/[A-Za-z][A-Za-z'-]*/g) || []) {
    const low = word.toLowerCase();
    if (EN_WHITELIST.has(low)) continue;
    if (EN_FIX[low]) add(where, text, `영문 철자: "${word}" → "${EN_FIX[low]}"`);
  }
}

/* ------------------------------------------------------------------ */
/* 4. 리포트                                                           */
/* ------------------------------------------------------------------ */

const ttsRows = rows.filter((r) => r.tts).length;
console.log("📝 문구·맞춤법·TTS 감사");
console.log(`   · 점검 문자열 ${rows.length}개 (그중 TTS 대상 ${ttsRows}개)`);
if (notes.length) {
  const kinds = [...new Set(notes.map((n) => n.msg))];
  console.log(`\nℹ️  참고 ${notes.length}건: ${kinds.join(" / ")}`);
}
if (!problems.length) {
  console.log("\n✅ 맞춤법·표기·TTS 점검 모두 통과");
  process.exit(0);
}
const byMsg = new Map();
for (const p of problems) {
  const key = p.msg;
  if (!byMsg.has(key)) byMsg.set(key, []);
  byMsg.get(key).push(p);
}
console.log(`\n⚠️  발견 ${problems.length}건 (${byMsg.size}종)`);
for (const [msg, list] of [...byMsg.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n[${list.length}건] ${msg}`);
  list.slice(0, 12).forEach((p) => console.log(`   - ${p.where}: ${p.text.slice(0, 110)}`));
  if (list.length > 12) console.log(`   … 외 ${list.length - 12}건`);
}
process.exit(1);
