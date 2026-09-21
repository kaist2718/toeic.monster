#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""빈도순 기출 어휘 보강 — docs/frequency-shorts-plan.md

`data/extra.js` 의 frequency 행을 8필드로 채웁니다.

    [단어, 뜻, 품사]  →  [단어, 뜻, 품사, IPA, 한글발음, 예문, 해석, 예문한글발음]

채우는 순서:
  ① `tools/frequency-content.json` 오버레이(신규 작성분) — 있으면 우선
  ② UNIT 단어장(`data/unitNN.js`) 재사용 — 같은 철자 표제어의 IPA·예문을 옮김

앞 3필드(단어·뜻·품사)의 자리는 그대로 둡니다 — 사이트·앱·감사 도구 5곳이 인덱스 0~2만
읽으므로 뒤에 필드를 덧붙여도 호환이 깨지지 않습니다(§2-1). 이미 8필드인 행은 보존하므로
여러 번 실행해도 안전하고, 내용이 바뀌지 않으면 파일을 건드리지 않습니다.

`--dry-run` 으로 미리보기, `--report` 로 뜻 불일치 점검.

사용법:
  python tools/enrich-frequency-reuse.py --dry-run
  python tools/enrich-frequency-reuse.py
  python tools/enrich-frequency-reuse.py --report
"""

from __future__ import annotations

import argparse
import glob
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OVERLAY_FILE = Path(__file__).resolve().parent / "frequency-content.json"

# UNIT 예문을 그대로 쓰면 **의미가 어긋나는** 표제어는 UNIT 재사용에서 제외합니다.
# (오버레이에 내용이 있으면 오버레이로 채웁니다.)
#   resume   : 빈도 "재개하다"(동사 /rɪˈzuːm/)  ↔  UNIT "이력서"(명사 /ˈrezəmeɪ/)
#   deposit  : 빈도 "보증금"(명사)             ↔  UNIT "예금하다"(동사 예문)
#   monitor  : 빈도 "모니터링하다"(동사)        ↔  UNIT "모니터"(명사 예문)
#   withdraw : 빈도 "철회하다"                 ↔  UNIT "인출하다"(ATM 예문)
SKIP_SENSE_MISMATCH = {"resume", "deposit", "monitor", "withdraw"}

for _s in (sys.stdout, sys.stderr):
    if _s is not None and hasattr(_s, "reconfigure"):
        try:
            _s.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

# UNIT 단어장: [단어, IPA, 한글발음, 뜻, 예문, 해석, 예문한글발음] 7필드
UNIT_ROW = re.compile(
    r'\["((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*'
    r'"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*'
    r'"((?:[^"\\]|\\.)*)"\]'
)
# 빈도 블록의 한 행(평평한 배열). 안쪽에 중첩 배열이 없어 필드 개수와 무관하게 잡힙니다.
FREQ_ROW = re.compile(r'\[((?:"(?:[^"\\]|\\.)*"\s*,\s*)*"(?:[^"\\]|\\.)*")\]')
STR = re.compile(r'"((?:[^"\\]|\\.)*)"')


def load_unit_words() -> dict[str, list[str]]:
    """UNIT 단어장에서 lower(표제어) → [IPA, 한글발음, 뜻, 예문, 해석, 예문한글발음]."""
    out: dict[str, list[str]] = {}
    for path in sorted(glob.glob(str(DATA / "unit*.js"))):
        text = Path(path).read_text(encoding="utf-8")
        for m in UNIT_ROW.finditer(text):
            out.setdefault(m.group(1).lower(), [m.group(i) for i in range(2, 8)])
    return out


def load_overlay() -> dict[str, list[str]]:
    """신규 작성분(lower(표제어) → [IPA, 한글발음, 예문, 해석, 예문한글발음])."""
    if not OVERLAY_FILE.exists():
        return {}
    data = json.loads(OVERLAY_FILE.read_text(encoding="utf-8"))
    out: dict[str, list[str]] = {}
    for key, val in data.items():
        if key.startswith("_") or not isinstance(val, list) or len(val) != 5:
            continue
        out[key.strip().lower()] = [str(x) for x in val]
    return out


def find_frequency_span(text: str) -> tuple[int, int]:
    """`frequency: [` 의 `[` 위치와 짝이 맞는 `]` 위치를 돌려줍니다."""
    m = re.search(r"(?m)^(\s*)frequency:\s*\[", text)
    if not m:
        sys.exit("extra.js 에서 frequency 블록을 찾지 못했습니다.")
    start = m.end() - 1
    depth = 0
    in_str = False
    esc = False
    i = start
    while i < len(text):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        elif ch == '"':
            in_str = True
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return start, i
        i += 1
    sys.exit("frequency 블록의 닫는 대괄호를 찾지 못했습니다.")


def esc(value: str) -> str:
    """JS 문자열 리터럴용 이스케이프."""
    return str(value).replace("\\", "\\\\").replace('"', '\\"')


def parse_rows(block: str) -> list[list[str]]:
    """블록 안의 각 행을 필드 리스트로 파싱합니다(3필드·8필드 모두)."""
    rows: list[list[str]] = []
    for m in FREQ_ROW.finditer(block):
        fields = STR.findall(m.group(1))
        if fields:
            rows.append(fields)
    return rows


def rebuild_block(block: str, unit: dict[str, list[str]], overlay: dict[str, list[str]]):
    """frequency 블록을 다시 만듭니다.

    반환: (새 블록, 채운 수, 보존 수, 남은 수, 전체, 뜻 불일치 목록, 출처 dict)
    """
    rows = parse_rows(block)
    if not rows:
        sys.exit("frequency 행을 하나도 읽지 못했습니다 (형식 확인).")

    lines: list[str] = []
    pending: list[str] = []
    filled = 0
    already = 0
    left = 0
    mismatch: list[str] = []
    origin = {"overlay": 0, "unit": 0}

    def flush_pending() -> None:
        while pending:
            chunk, pending[:] = pending[:3], pending[3:]
            lines.append("    " + ", ".join(chunk))

    for fields in rows:
        key = fields[0].lower()
        if len(fields) >= 8:                    # 이미 보강된 행 → 그대로 보존
            flush_pending()
            already += 1
            if key in unit and fields[1] != unit[key][2]:
                mismatch.append(fields[0])
            lines.append("    [" + ", ".join(f'"{esc(f)}"' for f in fields) + "]")
            continue
        if len(fields) != 3:
            sys.exit(f"예상 밖 필드 수({len(fields)}) 행: {fields}")
        word, meaning, pos = fields
        content = overlay.get(key)
        source = "overlay"
        if content is None and key in unit and key not in SKIP_SENSE_MISMATCH:
            ipa, kor, u_meaning, ex, tr, ex_kor = unit[key]
            content = [ipa, kor, ex, tr, ex_kor]
            source = "unit"
            if meaning != u_meaning:
                mismatch.append(word)
        if content:
            flush_pending()
            out = [word, meaning, pos, *content]
            lines.append("    [" + ", ".join(f'"{esc(f)}"' for f in out) + "]")
            filled += 1
            origin[source] += 1
        else:
            left += 1
            pending.append(f'["{esc(word)}", "{esc(meaning)}", "{esc(pos)}"]')
    flush_pending()

    body = ",\n".join(lines)   # 줄 사이에 쉼표 → 마지막 항목만 쉼표 없음(원본과 동일)
    # 대괄호부터 교체하므로 라벨(`frequency: `)은 원본 텍스트에 남겨 둡니다.
    return "[\n" + body + "\n  ]", filled, already, left, len(rows), mismatch, origin


def main() -> None:
    ap = argparse.ArgumentParser(description="빈도순 어휘 보강 (UNIT 재사용 + 오버레이)")
    ap.add_argument("--dry-run", action="store_true", help="파일을 바꾸지 않고 결과만 확인")
    ap.add_argument("--report", action="store_true", help="보강 항목의 뜻 불일치 목록 출력")
    args = ap.parse_args()

    unit = load_unit_words()
    overlay = load_overlay()
    extra = DATA / "extra.js"
    raw = extra.read_bytes()
    text = raw.decode("utf-8").replace("\r\n", "\n").replace("\r", "\n")
    start, end = find_frequency_span(text)
    old_block = text[start:end + 1]
    new_block, filled, already, left, total, mismatch, origin = rebuild_block(old_block, unit, overlay)

    print(f"UNIT 표제어       : {len(unit)}개 · 오버레이 {len(overlay)}개")
    print(f"빈도 항목         : {total}개")
    print(f"이번에 채움       : {filled}개 (오버레이 {origin['overlay']} · UNIT 재사용 {origin['unit']})")
    print(f"이미 보강됨(보존) : {already}개")
    print(f"남은 미보강       : {left}개")

    if args.report and mismatch:
        print(f"\n뜻이 UNIT과 달라 예문 의미를 눈으로 볼 항목: {len(mismatch)}개")
        by_word = {r[0]: r[1] for r in parse_rows(old_block)}
        for w in mismatch:
            print(f'  {w}: 빈도="{by_word.get(w, "")}"  /  UNIT="{unit[w.lower()][2]}"')

    if new_block == old_block and b"\r" not in raw:
        print("\n✅ 이미 최신입니다 — 바뀐 내용이 없어 파일을 건드리지 않았습니다.")
        return
    if args.dry_run:
        print("\n[dry-run] 파일을 바꾸지 않았습니다. 실제 반영은 --dry-run 없이 실행하세요.")
        return

    extra.write_text(text[:start] + new_block + text[end + 1:], encoding="utf-8", newline="\n")
    print(f"\n✅ {extra.relative_to(ROOT)} — frequency 행 {filled}개를 채웠습니다.")


if __name__ == "__main__":
    main()
