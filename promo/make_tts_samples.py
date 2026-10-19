#!/usr/bin/env python3
"""TTS 샘플 일괄 생성 — 내려받은 Piper 음성 + Windows 내장(SAPI) 음성의
샘플 낭독을 TTS 순서대로 만듭니다.

목소리가 많아 구분하기 어려울 때, 메뉴 31 목소리 목록과 **같은 순서**로
한 음성당 샘플 파일 하나를 만들어 폴더에서 번호 순으로 들어볼 수 있습니다.
순서는 ① 내려받은 Piper 음성(메뉴 31 순서) → ② Windows 내장 음성(영어 먼저)입니다.

사용법:
  python make_tts_samples.py                      # 전체 음성 샘플 생성
  python make_tts_samples.py --text "Hello"       # 샘플 문장 바꾸기
  python make_tts_samples.py --only amy Zira      # 이름에 맞는 음성만 생성
  python make_tts_samples.py --out D:/samples     # 저장 폴더 바꾸기

산출물 (기본: promo/assets/tts-samples/):
  01_en_GB-alan-low.wav …   # TTS 순번_음성 이름 (순번이 TTS 순서)
  00_목록.txt               # 순번 · 음성 · 엔진·성별/로캘/품질 표
  재생목록.m3u              # 순서대로 이어 듣는 재생목록
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from publish import (  # noqa: E402
    TTS_TEST_TEXT,
    list_piper_voices,
    list_windows_voices,
    log,
    ok,
    piper_voice_gender,
    piper_voice_label,
    warn,
)
from make_shorts import tts_speak  # noqa: E402

PROMO = Path(__file__).resolve().parent
DEFAULT_OUT = PROMO / "assets" / "tts-samples"


def safe_name(name: str) -> str:
    """파일명에 쓸 수 없는 문자만 치환한 음성 이름 (Windows 음성 이름에 공백 등 포함 가능)."""
    return re.sub(r'[\\/:*?"<>|]', "_", name)


def windows_voices_in_order() -> list[tuple[str, str]]:
    """Windows 내장(SAPI) 음성을 메뉴(31) 목록 순서로 — (이름, 라벨). 설치된 것만.

    낭독 문장이 영어라 영어 음성을 먼저 보여 주는 short_voice_choices 와 같은 순서입니다.
    """
    installed = list_windows_voices()
    english = [v for v in installed if v[1].lower().startswith("en")]
    others = [v for v in installed if not v[1].lower().startswith("en")]
    return [(name, f"{culture} · {'여성' if gender == 'Female' else '남성'}")
            for name, culture, gender in english + others]


def voice_catalog() -> dict[str, tuple[str, str, str]]:
    """안전 파일명 → (엔진, 라벨, 성별) — 목록·재생목록을 폴더 기준으로 만들 때 씁니다."""
    cat: dict[str, tuple[str, str, str]] = {}
    for voice in list_piper_voices():
        cat[safe_name(voice)] = ("piper", piper_voice_label(voice),
                                 piper_voice_gender(voice))
    for name, label in windows_voices_in_order():
        cat[safe_name(name)] = ("windows", f"Windows 내장 · {label}",
                                "여성" if "여성" in label else "남성")
    return cat


def make_samples(text: str, out: Path, only: list[str] | None = None) -> list[Path]:
    """Piper + Windows 내장 음성 전체를 TTS 순서대로 합성해 out 에 저장합니다.

    반환값은 실제로 만들어진 wav 파일 목록(TTS 순서). 한 음성의 합성이 실패하면
    건너뛰고 다음 음성을 이어갑니다.
    """
    entries: list[tuple[str, int, str]] = []   # (엔진, TTS 순번, 음성 이름)
    n = 0
    for voice in list_piper_voices():
        n += 1
        entries.append(("piper", n, voice))
    for name, _label in windows_voices_in_order():
        n += 1
        entries.append(("windows", n, name))
    if not entries:
        warn("쓸 수 있는 TTS 음성이 없습니다 — Piper 음성 내려받기 또는 Windows 음성 설치를 확인하세요.")
        return []

    keys = [k.lower() for k in (only or [])]
    # 순번은 항상 전체 TTS 순서 기준 — 일부만 만들어도 파일 이름의 번호가 TTS 순서입니다.
    todo = [e for e in entries if not keys or any(k in e[2].lower() for k in keys)]
    if not todo:
        warn("--only 조건에 맞는 음성이 없습니다: " + " ".join(only or []))
        return []

    out.mkdir(parents=True, exist_ok=True)
    log(f"\n🔊 TTS 샘플 생성 — {len(todo)}개 음성 (TTS 순서대로)")
    log(f"   샘플 문장: {text}")
    log(f"   저장 폴더: {out}")

    cat = voice_catalog()
    made: list[Path] = []
    for m, (engine, i, voice) in enumerate(todo, 1):
        label = cat.get(safe_name(voice), ("", voice, ""))[1]
        dest = out / f"{i:02d}_{safe_name(voice)}.wav"
        log(f"  [{m:2d}/{len(todo)}] {i:02d}. {voice} — {label}")
        try:
            tts_speak(text, voice, dest, engine)
        except Exception as exc:  # 한 음성 실패가 전체를 멈추지 않게
            warn(f"샘플 생성 실패({voice}): {exc}")
            continue
        made.append(dest)

    # 목록·재생목록은 폴더의 wav 전체 기준 — 일부만 만들어도 전체 순서가 유지됩니다.
    wavs = sorted(out.glob("*.wav"))
    if wavs:
        rows: list[str] = []
        for wav in wavs:
            m = re.match(r"^(\d+)_(.+)\.wav$", wav.name)
            num, vid = (m.group(1), m.group(2)) if m else ("??", wav.stem)
            _engine, label, gender = cat.get(vid, ("", vid, ""))
            rows.append(f"{num}. {vid} — {label}" + ("" if gender else " · 미판정"))
        # 순번·음성·성별 표 — 음성 이름이 아니라 번호로 구분할 수 있게
        (out / "00_목록.txt").write_text(
            "TTS 샘플 목록 (파일 앞자리 순번 = TTS 목록 순서: "
            "Piper 음성 → Windows 내장 음성)\n"
            f"샘플 문장: {text}\n\n" + "\n".join(rows) + "\n",
            encoding="utf-8")
        # 재생목록 — 폴더에서 순서대로 이어 듣기
        (out / "재생목록.m3u").write_text(
            "#EXTM3U\n" + "\n".join(w.name for w in wavs) + "\n",
            encoding="utf-8")
    return made


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Piper + Windows 내장 음성의 TTS 샘플을 TTS 순서대로 만듭니다.")
    ap.add_argument("--text", default=TTS_TEST_TEXT,
                    help="샘플 문장 (영어, 기본: 미리 듣기와 같은 예문)")
    ap.add_argument("--out", default=str(DEFAULT_OUT),
                    help=f"저장 폴더 (기본: {DEFAULT_OUT})")
    ap.add_argument("--only", nargs="*", default=None, metavar="이름",
                    help="이름에 포함된 음성만 생성 (예: --only amy Zira)")
    args = ap.parse_args()

    text = (args.text or TTS_TEST_TEXT).strip() or TTS_TEST_TEXT
    made = make_samples(text, Path(args.out), args.only)
    if not made:
        return 1
    ok(f"TTS 샘플 {len(made)}개 저장: {Path(args.out)}")
    log("  00_목록.txt — 순번·음성·성별 표 / 재생목록.m3u — 순서대로 이어 듣기")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
