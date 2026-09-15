#!/usr/bin/env python3
"""og-image.png 무손실 재압축.

소셜 공유 카드(1200×630)는 `tools/og-template.html` 을 브라우저로 캡처해 만듭니다.
브라우저가 내보낸 PNG 는 압축이 느슨해서 231KB 인데, **같은 픽셀**을 더 잘 압축하면
96KB 까지 줄어듭니다(58% 감소). 카톡·슬랙·X 미리보기는 이 파일을 받아 가므로
공유될 때마다 그만큼을 아끼게 됩니다.

픽셀은 1비트도 바뀌지 않습니다(무손실). 그래서 캡처 도구나 디자인을 바꾸지 않고
다시 캡처한 뒤에도 그대로 한 번 더 돌리면 됩니다.

실행:  python tools/make-og-image.py           (og-image.png 를 제자리에서 다시 씁니다)
       python tools/make-og-image.py --check   (고치지 않고 더 줄일 수 있는지만 보고 · CI 용)

필요 환경: Python 3 + Pillow. 생성물은 다른 이미지와 마찬가지로 저장소에 커밋합니다.
"""

from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError:  # pragma: no cover - 안내용
    print("❌ Pillow 가 필요합니다:  python -m pip install pillow", file=sys.stderr)
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "og-image.png"

# 무손실 재압축만 하므로 이 비율보다 적게 줄면 "이미 최적"으로 봅니다.
MIN_GAIN = 0.95


def encode(img: Image.Image) -> bytes:
    """같은 픽셀을 가장 잘 압축한 PNG 바이트를 만듭니다."""
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True, compress_level=9)
    return buf.getvalue()


def main() -> int:
    # Windows 콘솔(cp949)에서도 한글이 깨지지 않도록 출력 인코딩을 UTF-8로 맞춥니다.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    ap = argparse.ArgumentParser(description="og-image.png 무손실 재압축")
    ap.add_argument("--check", action="store_true", help="고치지 않고 확인만 (CI 용)")
    args = ap.parse_args()

    if not TARGET.exists():
        print(f"❌ {TARGET.name} 이 없습니다.", file=sys.stderr)
        return 1

    current = TARGET.stat().st_size
    with Image.open(TARGET) as src:
        src.load()
        img = src.convert("RGBA") if src.mode == "P" else src.copy()
        optimized = img if img.mode in ("RGB", "RGBA") else img.convert("RGB")
        data = encode(optimized)

    # 무손실인지 확인 — 다시 읽어 원본과 픽셀을 비교합니다(다르면 저장하지 않습니다).
    with Image.open(io.BytesIO(data)) as re_read:
        re_read.load()
        original = Image.open(TARGET)
        original.load()
        diff = ImageChops.difference(re_read.convert(original.mode), original)
        if diff.getbbox() is not None:
            print("❌ 재압축 결과가 원본과 다릅니다(무손실이 아님) — 저장하지 않았습니다.", file=sys.stderr)
            return 1

    kb = lambda n: f"{n / 1024:.1f}KB"  # noqa: E731 - 짧은 표기용
    saved = 100 * (1 - len(data) / current)

    if args.check:
        if len(data) < current * MIN_GAIN:
            print(f"❌ og-image.png 을 더 줄일 수 있습니다 — {kb(current)} → {kb(len(data))} ({saved:.0f}% 감소)")
            print("   → `python tools/make-og-image.py` 를 실행하세요.")
            return 1
        print(f"✅ og-image.png 이 최적입니다 ({kb(current)})")
        return 0

    if len(data) >= current * MIN_GAIN:
        print(f"✅ 이미 최적입니다 — {kb(current)} (바뀐 내용 없음)")
        return 0

    TARGET.write_bytes(data)
    print(f"✅ og-image.png 재압축 — {kb(current)} → {kb(len(data))} ({saved:.0f}% 감소, 픽셀 동일)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
