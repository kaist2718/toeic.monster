#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""toeic.monster 인쇄용 워크북(단어장 · 문제지) 자동 생성기.

data/unitNN.js · data/idioms.js · data/extra.js 를 읽어 **인쇄 최적화 HTML**을 만들고,
브라우저 인쇄(또는 머리글/바닥글 끄기 → PDF 저장)로 바로 PDF 교재를 만들 수 있습니다.
외부 패키지 없이 표준 라이브러리만 사용합니다. (edge-tts 가 설치되어 있으면 MP3도 생성)

사용법:
  python tools/make_workbook.py                    # 전체(단어장 30유닛 + 숙어 + 문제지)
  python tools/make_workbook.py --unit 5           # UNIT 5 단어장만
  python tools/make_workbook.py --no-quiz          # 문제지 제외
  python tools/make_workbook.py --out dist         # 출력 폴더 지정
  python tools/make_workbook.py --mp3              # 발음 MP3 생성(edge-tts 필요)

산출물(기본 out=workbook/ , .gitignore 에 포함되어 커밋되지 않습니다):
  workbook/index.html        목차
  workbook/unit-01.html ~    유닛별 단어장
  workbook/idioms.html       구동사·숙어
  workbook/frequency.html    빈도순 어휘
  workbook/quiz.html         동의어 치환 · 받아쓰기 문제지
  workbook/audio/*.mp3       (--mp3 사용 시)

PDF로 만들기: HTML을 브라우저로 열고 [인쇄] → 대상 'PDF로 저장' → 용지 A4, 여백 '기본',
'머리글 및 바닥글' 해제. 여러 유닛을 한 파일로 묶으려면 all.html 을 사용하세요.
"""

from __future__ import annotations

import argparse
import html
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

QUOTED = re.compile(r'"((?:[^"\\]|\\.)*)"')


# ---------------------------------------------------------------- 데이터 읽기
def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def unescape(s: str) -> str:
    return s.replace('\\"', '"').replace("\\\\", "\\")


def parse_unit(path: Path) -> list[list[str]]:
    """data/unitNN.js → [[단어, IPA, 한글발음, 뜻, 예문, 해석, 예문발음], ...]"""
    rows: list[list[str]] = []
    for line in read(path).splitlines():
        s = line.strip()
        if not s.startswith('["'):
            continue
        cols = [unescape(m) for m in QUOTED.findall(s)]
        if len(cols) >= 6:
            rows.append(cols)
    return rows


def parse_idioms(path: Path) -> list[list[str]]:
    """data/idioms.js → [[표현, 뜻, 예문, 해석], ...]"""
    rows: list[list[str]] = []
    for line in read(path).splitlines():
        s = line.strip()
        if not s.startswith('["'):
            continue
        cols = [unescape(m) for m in QUOTED.findall(s)]
        if len(cols) >= 4:
            rows.append(cols)
    return rows


def extract_block(text: str, key: str) -> str:
    """`key: [` 부터 대응하는 `];` 까지 잘라낸다(문자열 안의 대괄호는 무시)."""
    start = text.find(f"{key}: [")
    if start == -1:
        return ""
    i = text.find("[", start)
    depth, in_str, esc, j = 0, False, False, i
    while j < len(text):
        ch = text[j]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    return text[i : j + 1]
        j += 1
    return ""


def parse_extra() -> dict:
    text = read(DATA / "extra.js")

    freq: list[list[str]] = []
    block = extract_block(text, "frequency")
    for m in re.finditer(r"\[([^\]]+)\]", block):
        cols = [unescape(x) for x in QUOTED.findall(m.group(1))]
        if len(cols) >= 2:
            freq.append(cols)

    dictation: list[str] = []
    block = extract_block(text, "dictation")
    for line in block.splitlines():
        s = line.strip()
        if s.startswith('"'):
            cols = QUOTED.findall(s)
            if cols:
                dictation.append(unescape(cols[0]))

    para: list[dict] = []
    block = extract_block(text, "paraphrase")
    for line in block.splitlines():
        s = line.strip()
        if not s.startswith("{"):
            continue
        p = re.search(r'prompt:\s*"((?:[^"\\]|\\.)*)"', s)
        a = re.search(r'a:\s*"((?:[^"\\]|\\.)*)"', s)
        if p and a:
            para.append({"prompt": unescape(p.group(1)), "a": unescape(a.group(1))})

    return {"frequency": freq, "dictation": dictation, "paraphrase": para}


# ---------------------------------------------------------------- HTML 생성
CSS = """
@page { size: A4; margin: 14mm 12mm; }
* { box-sizing: border-box; }
body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; color: #212529; line-height: 1.6; margin: 0; }
h1 { font-size: 20px; margin: 0 0 4px; }
h2 { font-size: 15px; border-bottom: 2px solid #3b5bdb; padding-bottom: 4px; margin: 22px 0 10px; }
.lead { color: #5f6673; font-size: 12px; margin-bottom: 14px; }
.brand { font-size: 11px; color: #3b5bdb; font-weight: 700; }
table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
th, td { border: 1px solid #dee2e6; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #eef2ff; }
tr { page-break-inside: avoid; }
ul { margin: 0; padding-left: 18px; font-size: 12px; }
li { margin-bottom: 4px; page-break-inside: avoid; }
ol.q { padding-left: 20px; font-size: 12px; }
ol.q li { margin-bottom: 10px; }
.blank { display: inline-block; min-width: 90px; border-bottom: 1px solid #adb5bd; }
.write { border: 1px solid #dee2e6; border-radius: 6px; min-height: 70px; margin-top: 6px; }
.nav { font-size: 12px; margin-bottom: 18px; }
.nav a { color: #3b5dbd; margin-right: 10px; }
.actions { margin: 12px 0 18px; }
.actions button { font: inherit; font-size: 12px; padding: 7px 12px; border: 1px solid #3b5bdb; background: #3b5bdb; color: #fff; border-radius: 8px; cursor: pointer; }
@media print { .actions { display: none; } }
"""


def doc(title: str, body: str, nav: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>{html.escape(title)}</title>
<style>{CSS}</style>
</head>
<body>
<div class="brand">toeic.monster · TOEIC 어휘 학습</div>
{f'<div class="nav">{nav}</div>' if nav else ''}
{body}
<div class="actions"><button onclick="window.print()">🖨 인쇄 · PDF 저장</button></div>
</body>
</html>
"""


def words_table(rows: list[list[str]], with_blank: bool = False) -> str:
    head = "<tr><th style='width:16%'>단어</th><th style='width:14%'>발음</th><th style='width:12%'>한글 발음</th><th style='width:16%'>뜻</th><th>예문 / 해석</th></tr>"
    body = []
    for w in rows:
        mean = '<span class="blank"></span>' if with_blank else html.escape(w[3])
        body.append(
            "<tr>"
            f"<td><b>{html.escape(w[0])}</b></td>"
            f"<td>{html.escape(w[1]) if len(w) > 1 else ''}</td>"
            f"<td>{html.escape(w[2]) if len(w) > 2 else ''}</td>"
            f"<td>{mean}</td>"
            f"<td>{html.escape(w[4]) if len(w) > 4 else ''}<br><span style='color:#868e96'>"
            f"{html.escape(w[5]) if len(w) > 5 else ''}</span></td>"
            "</tr>"
        )
    return f"<table>{head}{''.join(body)}</table>"


def build_unit(unit: int, rows: list[list[str]], nav: str) -> str:
    body = f"<h1>UNIT {unit} 단어장</h1><p class='lead'>총 {len(rows)}단어 · 발음기호 · 한글 발음 · 뜻 · 예문 · 해석</p>"
    body += "<h2>단어 목록</h2>" + words_table(rows)
    body += "<h2>셀프 테스트 (뜻 가리고 확인하기)</h2>" + words_table(rows, with_blank=True)
    return doc(f"UNIT {unit} 단어장 — toeic.monster", body, nav)


def build_idioms(rows: list[list[str]], nav: str) -> str:
    items = "".join(
        f"<li><b>{html.escape(r[0])}</b> — {html.escape(r[1])}<br>"
        f"<span style='color:#495057'>{html.escape(r[2]) if len(r) > 2 else ''}</span><br>"
        f"<span style='color:#868e96'>{html.escape(r[3]) if len(r) > 3 else ''}</span></li>"
        for r in rows
    )
    body = f"<h1>빈출 구동사·숙어</h1><p class='lead'>총 {len(rows)}개 표현</p><ul>{items}</ul>"
    return doc("빈출 구동사·숙어 — toeic.monster", body, nav)


def build_frequency(rows: list[list[str]], nav: str) -> str:
    head = "<tr><th style='width:22%'>단어</th><th style='width:14%'>품사</th><th>뜻</th></tr>"
    body = "".join(
        f"<tr><td><b>{html.escape(r[0])}</b></td><td>{html.escape(r[2]) if len(r) > 2 else ''}</td>"
        f"<td>{html.escape(r[1]) if len(r) > 1 else ''}</td></tr>"
        for r in rows
    )
    return doc("빈도순 기출 어휘 — toeic.monster", f"<h1>빈도순 기출 어휘</h1><p class='lead'>총 {len(rows)}단어</p><table>{head}{body}</table>", nav)


def build_quiz(para: list[dict], dictation: list[str], nav: str) -> str:
    q1 = "".join(
        f"<li>{html.escape(p['prompt'])}<div class='write'></div></li>" for p in para
    )
    q2 = "".join(f"<li>문장 {i + 1}. <div class='write'></div></li>" for i, _ in enumerate(dictation))
    ans1 = "".join(f"<li>{html.escape(p['a'])}</li>" for p in para)
    ans2 = "".join(f"<li>{html.escape(s)}</li>" for s in dictation)
    body = (
        f"<h1>문제지 — 동의어 치환 · 받아쓰기</h1><p class='lead'>동의어 {len(para)}문항 · 받아쓰기 {len(dictation)}문장</p>"
        f"<h2>1. 동의어 치환 (가장 가까운 표현을 쓰세요)</h2><ol class='q'>{q1}</ol>"
        f"<h2>2. 받아쓰기 (문장을 들으며 받아 적으세요)</h2><ol class='q'>{q2}</ol>"
        f"<h2>정답</h2><b>동의어 치환</b><ul>{ans1}</ul><b>받아쓰기</b><ul>{ans2}</ul>"
    )
    return doc("문제지 — toeic.monster", body, nav)


# ---------------------------------------------------------------- MP3 (선택)
def build_mp3(rows: list[list[str]], out_dir: Path) -> None:
    audio = out_dir / "audio"
    audio.mkdir(parents=True, exist_ok=True)
    made = 0
    for w in rows:
        target = audio / f"{re.sub(r'[^a-z0-9]+', '_', w[0].lower()).strip('_')}.mp3"
        if target.exists():
            continue
        try:
            subprocess.run(["edge-tts", "--voice", "en-US-AriaNeural", "--text", w[0], "--write-media", str(target)], check=True, capture_output=True)
            made += 1
        except Exception:
            print("⚠️  edge-tts 를 실행할 수 없어 MP3 생성을 건너뜁니다. (pip install edge-tts)")
            return
    print(f"   · MP3 생성 {made}개 → {audio}")


# ---------------------------------------------------------------- 실행
def main() -> int:
    # Windows 콘솔(cp949)에서도 이모지·한글이 깨지지 않도록 출력 인코딩을 UTF-8로 맞춥니다.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    ap = argparse.ArgumentParser(description="toeic.monster 인쇄용 워크북 생성기")
    ap.add_argument("--unit", type=int, action="append", help="특정 유닛만 생성 (여러 번 사용 가능)")
    ap.add_argument("--out", default="workbook", help="출력 폴더 (기본 workbook)")
    ap.add_argument("--no-quiz", action="store_true", help="문제지 생성 제외")
    ap.add_argument("--mp3", action="store_true", help="발음 MP3 생성 (edge-tts 필요)")
    args = ap.parse_args()

    out_dir = (ROOT / args.out).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    unit_files = sorted(DATA.glob("unit[0-9][0-9].js"))
    if not unit_files:
        print("❌ data/unitNN.js 파일을 찾지 못했습니다.", file=sys.stderr)
        return 1

    units = {int(p.stem[-2:]): parse_unit(p) for p in unit_files if parse_unit(p)}
    if args.unit:
        wanted = set(args.unit)
        units = {k: v for k, v in units.items() if k in wanted}
        if not units:
            print("❌ 해당 유닛의 단어 데이터가 없습니다.", file=sys.stderr)
            return 1

    idioms = parse_idioms(DATA / "idioms.js")
    extra = parse_extra()

    nav_items = [("index.html", "목차")]
    nav_items += [(f"unit-{n:02d}.html", f"UNIT {n}") for n in sorted(units)]
    nav_items += [("idioms.html", "구동사·숙어"), ("frequency.html", "빈도 어휘")]
    if not args.no_quiz and (extra["paraphrase"] or extra["dictation"]):
        nav_items.append(("quiz.html", "문제지"))
    nav = "".join(f"<a href='{href}'>{html.escape(label)}</a>" for href, label in nav_items)

    for n, rows in sorted(units.items()):
        (out_dir / f"unit-{n:02d}.html").write_text(build_unit(n, rows, nav), encoding="utf-8")
    (out_dir / "idioms.html").write_text(build_idioms(idioms, nav), encoding="utf-8")
    (out_dir / "frequency.html").write_text(build_frequency(extra["frequency"], nav), encoding="utf-8")
    if not args.no_quiz:
        (out_dir / "quiz.html").write_text(build_quiz(extra["paraphrase"], extra["dictation"], nav), encoding="utf-8")

    all_body = "".join(
        f"<h2>UNIT {n}</h2>" + words_table(rows) for n, rows in sorted(units.items())
    )
    (out_dir / "all.html").write_text(doc("전체 단어장 — toeic.monster", all_body, nav), encoding="utf-8")

    toc = "".join(
        f"<li><a href='unit-{n:02d}.html'>UNIT {n} 단어장</a> ({len(rows)}단어)</li>" for n, rows in sorted(units.items())
    )
    toc += f"<li><a href='idioms.html'>빈출 구동사·숙어</a> ({len(idioms)}개)</li>"
    toc += f"<li><a href='frequency.html'>빈도순 기출 어휘</a> ({len(extra['frequency'])}개)</li>"
    if not args.no_quiz:
        toc += f"<li><a href='quiz.html'>문제지 (동의어 {len(extra['paraphrase'])} · 받아쓰기 {len(extra['dictation'])})</a></li>"
    toc += "<li><a href='all.html'>전체 단어장 (한 파일)</a></li>"
    (out_dir / "index.html").write_text(doc("워크북 목차 — toeic.monster", f"<h1>워크북 목차</h1><ul>{toc}</ul><p class='lead'>각 페이지에서 [인쇄]를 눌러 PDF로 저장하세요.</p>", nav), encoding="utf-8")

    if args.mp3:
        all_rows = [w for rows in units.values() for w in rows]
        build_mp3(all_rows, out_dir)

    total = sum(len(v) for v in units.values())
    print("✅ 워크북 생성 완료")
    print(f"   · 유닛 {len(units)}개 (단어 {total}개) · 숙어 {len(idioms)}개 · 빈도 어휘 {len(extra['frequency'])}개")
    print(f"   · 출력 폴더: {out_dir}")
    print("   · 브라우저에서 index.html 을 열고 [인쇄] → PDF 저장")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
