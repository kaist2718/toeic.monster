#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""toeic.monster 홍보용 쇼츠 영상 자동 생성기.

data/unitNN.js 의 단어 카드를 9:16 세로 쇼츠 영상(1080x1920)으로 렌더링합니다.
슬라이드당 1개 단어 — 단어·IPA·한글 발음·뜻·예문·해석 + toeic.monster 푸터.
Ken Burns 줌 효과와 슬라이드 간 크로스페이드, 선택적으로 영어 TTS 음성 포함.

사용법:
  python make_shorts.py --unit 1                     # UNIT 1 단어 5개 랜덤 → assets/shorts/unit01_shorts.mp4
  python make_shorts.py --unit 3 --words 7 --tts     # 7개 + 영어 음성(edge-tts)
  python make_shorts.py --unit 5 --seed 42 --bg purple
  python make_shorts.py --unit 2 --words 3 --dry-run # 계획만 출력

필요 패키지: Pillow, imageio-ffmpeg (pip install -r requirements.txt)
TTS 사용 시: pip install edge-tts  (인터넷 필요, 무료/키 불필요)
"""

from __future__ import annotations

import argparse
import random
import re
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import imageio_ffmpeg
    _FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    _FFMPEG = "ffmpeg"

try:
    from PIL import Image, ImageDraw, ImageFont
    _PIL_OK = True
except ImportError:
    _PIL_OK = False

sys.path.insert(0, str(Path(__file__).resolve().parent))
from publish import load_unit_info, load_unit_words, log, ok, warn, fail  # noqa: E402

PROMO = Path(__file__).resolve().parent
ROOT = PROMO.parent
OUT_DIR = PROMO / "assets" / "shorts"

W, H = 1080, 1920
FPS = 30
ZOOM = 0.06          # 슬라이드 시작→끝 6% 줌인
FADE_FRAMES = 12     # 크로스페이드 프레임 수 (0.4초)

# ---------------------------------------------------------------- fonts ----
FONT_CANDIDATES = [
    "C:/Windows/Fonts/malgunbd.ttf",      # Windows 맑은 고딕 Bold
    "C:/Windows/Fonts/malgun.ttf",        # Windows 맑은 고딕
    "/System/Library/Fonts/AppleSDGothicNeo-Bold.ttf",   # macOS
    "/Library/Fonts/NanumGothicBold.ttf",
    "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",  # Linux
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
]
EMOJI_FONT_CANDIDATES = [
    "C:/Windows/Fonts/seguiemj.ttf",      # Windows Segoe UI Emoji
]

# ---------------------------------------------------------------- themes ----
THEMES = {
    "blue":   ((30, 58, 138), (49, 46, 129)),    # indigo
    "purple": ((76, 29, 149), (131, 24, 67)),    # violet→rose
    "green":  ((6, 78, 59), (19, 78, 74)),       # emerald→teal
    "orange": ((124, 45, 18), (154, 52, 18)),    # amber→orange
    "pink":   ((131, 24, 67), (80, 7, 36)),      # rose→dark rose
    "navy":   ((15, 23, 42), (30, 27, 75)),      # slate→indigo
}
ACCENT = {
    "blue":   (147, 197, 253),
    "purple": (216, 180, 254),
    "green":  (110, 231, 183),
    "orange": (253, 186, 116),
    "pink":   (249, 168, 212),
    "navy":   (147, 197, 253),
}


def find_font(candidates: list[str]) -> str | None:
    for c in candidates:
        if Path(c).exists():
            return c
    return None


def load_font(path: str | None, size: int, bold: bool = True):
    p = path or find_font(FONT_CANDIDATES)
    if p:
        return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def load_emoji_font(size: int):
    p = find_font(EMOJI_FONT_CANDIDATES)
    if p:
        try:
            return ImageFont.truetype(p, size, layout_engine=ImageFont.Layout.RAQM)
        except (TypeError, AttributeError):
            return ImageFont.truetype(p, size)
    return None


# ---------------------------------------------------------------- utils ----
def vertical_gradient(size, top, bottom) -> Image.Image:
    img = Image.new("RGB", size)
    px = img.load()
    w, h = size
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def wrap_text(text: str, font, max_width: int) -> list[str]:
    lines = []
    for para in text.split("\n"):
        cur = ""
        for ch in para:
            test = cur + ch
            if font.getlength(test) > max_width and cur:
                lines.append(cur)
                cur = ch
            else:
                cur = test
        if cur:
            lines.append(cur)
    return lines


def draw_pill(draw, cx, y, text, font, fg, bg, pad_x=28, pad_y=14, radius=None) -> int:
    w = font.getlength(text)
    tw = int(w + pad_x * 2)
    th = font.size + pad_y * 2
    x0, y0 = cx - tw // 2, y
    r = radius if radius is not None else th // 2
    draw.rounded_rectangle([x0, y0, x0 + tw, y0 + th], radius=r, fill=bg)
    draw.text((cx - w / 2, y0 + pad_y - 2), text, font=font, fill=fg)
    return y + th


def draw_dots(draw, total: int, current: int):
    dot_r = 9
    gap = 34
    x0 = W // 2 - (gap * (total - 1)) // 2
    y = 1838
    for i in range(total):
        cx = x0 + gap * i
        if i == current:
            draw.ellipse([cx - dot_r - 4, y - dot_r - 4, cx + dot_r + 4, y + dot_r + 4], fill=ACCENT_THEME)
        else:
            draw.ellipse([cx - dot_r, y - dot_r, cx + dot_r, y + dot_r], fill=(255, 255, 255, 90) if hasattr(draw, "ellipse") else (180, 190, 220))


def draw_deco(draw):
    """배경 장식 원 (은은한 톤)."""
    deco = (255, 255, 255, 26)
    draw.ellipse([-160, 320, 420, 900], outline=deco, width=3)
    draw.ellipse([760, 130, 1290, 660], outline=deco, width=3)
    draw.ellipse([-220, 1420, 240, 1880], outline=deco, width=3)
    draw.ellipse([880, 1500, 1300, 1920], outline=deco, width=3)


# ---------------------------------------------------------------- slide ----
def render_slide(idx: int, total: int, unit_no: int, unit_info: dict, wd: list, theme: str, font_path: str | None) -> Image.Image:
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_deco(draw)

    word, ipa, kor_pron, meaning, en_ex, kr_tr = wd[0], wd[1], wd[2], wd[3], wd[4], wd[5]

    # ── 상단: 유닛 칩 ──
    icon_font = load_emoji_font(64)
    title_font = load_font(font_path, 40, bold=True)
    title = f"UNIT {unit_no} · {unit_info.get('title', '')}"
    chip = (255, 255, 255, 36)  # rgba(255,255,255,0.14)
    tw = title_font.getlength(title)
    chip_w = int(tw + 96)
    chip_h = 78
    cx0 = W // 2 - chip_w // 2
    draw.rounded_rectangle([cx0, 96, cx0 + chip_w, 96 + chip_h], radius=39, fill=chip)
    if icon_font:
        draw.text((cx0 + 30, 96 + 6), unit_info.get("icon", "📚"), font=icon_font)
    draw.text((cx0 + 86, 96 + 17), title, font=title_font, fill=(255, 255, 255))

    # ── 단어 ──
    word_font = load_font(font_path, 148, bold=True)
    word_w = word_font.getlength(word)
    while word_w > W - 140 and word_font.size > 60:
        word_font = load_font(font_path, word_font.size - 12, bold=True)
        word_w = word_font.getlength(word)
    draw.text((W / 2 - word_w / 2, 560), word, font=word_font, fill=(255, 255, 255))

    # ── IPA + 한글 발음 ──
    ipa_font = load_font(font_path, 54, bold=False)
    ipa_pill_bg = (0, 0, 0, 70)
    y = 790
    y = draw_pill(draw, W // 2, y, ipa, ipa_font, (235, 240, 255), ipa_pill_bg)
    pron_font = load_font(font_path, 46, bold=False)
    if kor_pron:
        ptext = f"발음: {kor_pron}"
        pw = pron_font.getlength(ptext)
        draw.text((W / 2 - pw / 2, y + 34), ptext, font=pron_font, fill=(215, 225, 250))

    # ── 구분선 ──
    draw.line([200, 1120, W - 200, 1120], fill=(255, 255, 255, 70), width=3)

    # ── 뜻 ──
    mean_font = load_font(font_path, 88, bold=True)
    mw = mean_font.getlength(meaning)
    while mw > W - 160 and mean_font.size > 44:
        mean_font = load_font(font_path, mean_font.size - 8, bold=True)
        mw = mean_font.getlength(meaning)
    draw.text((W / 2 - mw / 2, 1170), meaning, font=mean_font, fill=ACCENT_THEME)

    # ── 예문 ──
    label_font = load_font(font_path, 34, bold=True)
    lbl = "TOEIC 예문"
    draw.text((120, 1330), lbl, font=label_font, fill=(255, 255, 255, 190))
    en_font = load_font(font_path, 50, bold=False)
    en_lines = wrap_text(en_ex, en_font, W - 240)
    while len(en_lines) > 5 and en_font.size > 30:
        en_font = load_font(font_path, en_font.size - 4, bold=False)
        en_lines = wrap_text(en_ex, en_font, W - 240)
    y = 1395
    for line in en_lines[:5]:
        draw.text((120, y), line, font=en_font, fill=(255, 255, 255))
        y += 72

    # ── 해석 ──
    tr_font = load_font(font_path, 40, bold=False)
    tr_lines = wrap_text(kr_tr, tr_font, W - 240)
    while len(tr_lines) > 3 and tr_font.size > 26:
        tr_font = load_font(font_path, tr_font.size - 4, bold=False)
        tr_lines = wrap_text(kr_tr, tr_font, W - 240)
    y = min(y + 30, 1610)
    for line in tr_lines[:3]:
        draw.text((120, y), line, font=tr_font, fill=(200, 210, 235))
        y += 58

    # ── 푸터 ──
    foot_font = load_font(font_path, 44, bold=True)
    ft = "toeic.monster"
    fw = foot_font.getlength(ft)
    draw.text((W / 2 - fw / 2, 1745), ft, font=foot_font, fill=(255, 255, 255))
    draw_dots(draw, total, idx)
    return img


def crop_zoom(img: Image.Image, scale: float) -> Image.Image:
    """중심 기준 scale 배율만큼 확대 크롭 (Ken Burns)."""
    cw, ch = int(W / scale), int(H / scale)
    x, y = (W - cw) // 2, (H - ch) // 2
    return img.crop((x, y, x + cw, y + ch)).resize((W, H), Image.LANCZOS)


# ---------------------------------------------------------------- tts -----
async def tts_slide(word: str, en_ex: str, voice: str, out: Path) -> Path:
    import edge_tts
    text = f"{word}. {en_ex}"
    await edge_tts.Communicate(text, voice).save(str(out))
    return out


def probe_duration(path: Path) -> float:
    try:
        r = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
            capture_output=True, text=True)
        if r.stdout.strip():
            return float(r.stdout.strip())
    except Exception:
        pass
    # ffprobe 가 없으면 ffmpeg stderr 에서 Duration 파싱 (폴백)
    try:
        r = subprocess.run([_FFMPEG, "-i", str(path)], capture_output=True, text=True)
        m = re.search(r"Duration: (\d+):(\d+):(\d+\.?\d*)", r.stderr)
        if m:
            h, mi, s = m.groups()
            return int(h) * 3600 + int(mi) * 60 + float(s)
    except Exception:
        pass
    return 0.0


def build_audio(word: str, en_ex: str, voice: str, slide_dur: float, tmp: Path, i: int) -> tuple[Path, float]:
    """TTS 음성 생성 후 슬라이드 길이에 맞춘 wav 로 변환. (wav, 실제 슬라이드 길이) 반환."""
    tts_mp3 = tmp / f"tts_{i}.mp3"
    slide_wav = tmp / f"audio_{i}.wav"
    import asyncio
    asyncio.run(tts_slide(word, en_ex, voice, tts_mp3))
    audio_len = probe_duration(tts_mp3)   # 원본 TTS 길이 (자르기 전)
    dur = max(slide_dur, audio_len + 0.8) # 음성이 길면 슬라이드 연장
    cmd = [_FFMPEG, "-y", "-i", str(tts_mp3),
           "-af", f"apad=whole_dur={dur}",
           "-ar", "44100", "-ac", "2", "-t", str(dur), str(slide_wav)]
    subprocess.run(cmd, capture_output=True)
    return slide_wav, dur


def run_ffmpeg(args: list[str]) -> bool:
    r = subprocess.run([_FFMPEG, "-y", "-hide_banner", "-loglevel", "error", *args],
                       capture_output=True, text=True)
    if r.returncode != 0:
        fail(f"ffmpeg 오류: {r.stderr.strip()[-400:]}")
        return False
    return True


# ---------------------------------------------------------------- main ----
def main() -> None:
    ap = argparse.ArgumentParser(description="toeic.monster 단어 카드 쇼츠 영상 생성기 (1080x1920, 9:16)")
    ap.add_argument("--unit", type=int, required=True, help="유닛 번호 (1~30)")
    ap.add_argument("--words", type=int, default=5, help="영상에 넣을 단어 수 (기본 5)")
    ap.add_argument("--slide-sec", type=float, default=6.0, help="슬라이드당 길이 초 (기본 6)")
    ap.add_argument("--out", help="출력 mp4 경로 (기본: assets/shorts/unitNN_shorts.mp4)")
    ap.add_argument("--bg", default="blue", choices=sorted(THEMES), help="배경 테마")
    ap.add_argument("--font", help="한국어 폰트 ttf/ttc 경로 (기본: 시스템 자동 탐색)")
    ap.add_argument("--seed", type=int, help="단어 선택 시드 (재현용)")
    ap.add_argument("--index", type=int, help="특정 단어 인덱스만 사용 (0부터, 테스트용)")
    ap.add_argument("--tts", action="store_true", help="영어 TTS 음성 추가 (edge-tts, 인터넷 필요)")
    ap.add_argument("--voice", default="en-US-JennyNeural", help="TTS 목소리 (기본 en-US-JennyNeural)")
    ap.add_argument("--dry-run", action="store_true", help="계획만 출력하고 종료")
    args = ap.parse_args()

    if not _PIL_OK:
        sys.exit("Pillow 미설치 — pip install -r requirements.txt")

    unit_no = args.unit
    words = load_unit_words(unit_no)
    info = load_unit_info()
    unit_info = info.get(unit_no, {})
    if not words:
        sys.exit(f"UNIT {unit_no} 데이터를 읽을 수 없습니다 (data/unit{unit_no:02d}.js 확인).")

    rng = random.Random(args.seed)
    if args.index is not None:
        picked = [words[args.index]]
        if args.index >= len(words):
            sys.exit(f"인덱스 {args.index} 는 범위 밖 (0~{len(words)-1}).")
    else:
        n = min(args.words, len(words))
        picked = rng.sample(words, n)

    total_dur = len(picked) * args.slide_sec
    out = Path(args.out) if args.out else OUT_DIR / f"unit{unit_no:02d}_shorts.mp4"
    out = out if out.is_absolute() else PROMO / out
    out.parent.mkdir(parents=True, exist_ok=True)

    log("=" * 62)
    log("🎬 단어 카드 쇼츠 생성" + ("  (dry-run)" if args.dry_run else ""))
    log("=" * 62)
    log(f"유닛  : UNIT {unit_no} {unit_info.get('icon', '')} {unit_info.get('title', '')}")
    log(f"단어  : {len(picked)}개 ({', '.join(w[0] for w in picked[:6])}{' …' if len(picked) > 6 else ''})")
    log(f"길이  : 약 {total_dur:.0f}초 ({len(picked)}장 × {args.slide_sec:g}초), {FPS}fps")
    log(f"출력  : {out} ({W}x{H}, 9:16 세로)")
    log(f"음성  : {'edge-tts (' + args.voice + ')' if args.tts else '없음 (--tts 로 추가)'}")
    if args.dry_run:
        log("\n실제 생성하려면 --dry-run 을 빼고 실행하세요.")
        return

    tmp = Path(tempfile.mkdtemp(prefix="toeic_shorts_"))
    try:
        # ── 슬라이드 렌더링 + 프레임 출력 ──
        slides = [render_slide(i, len(picked), unit_no, unit_info, w, args.bg, args.font)
                  for i, w in enumerate(picked)]
        log("슬라이드 렌더링 완료 — 프레임 생성 중...")

        frame_files: list[Path] = []
        prev_last = None
        for si, slide in enumerate(slides):
            dur = args.slide_sec
            if args.tts:
                wav, dur = build_audio(picked[si][0], picked[si][4], args.voice, dur, tmp, si)
                if dur > args.slide_sec:
                    log(f"   · {picked[si][0]}: 음성 {dur - 0.8:.1f}초 → 슬라이드 연장")
            n = max(2, int(round(dur * FPS)))
            for i in range(n):
                t = i / (n - 1) if n > 1 else 0.0
                frame = crop_zoom(slide, 1.0 + ZOOM * t)
                if prev_last is not None and i < FADE_FRAMES:
                    alpha = i / FADE_FRAMES
                    frame = Image.blend(prev_last, frame, alpha)
                fp = tmp / f"frame_{len(frame_files):05d}.jpg"
                frame.save(fp, quality=92)
                frame_files.append(fp)
            prev_last = crop_zoom(slide, 1.0 + ZOOM)

        ok(f"프레임 {len(frame_files)}장 생성 완료 — 인코딩 중...")

        # ── 무성 영상 인코딩 ──
        silent = tmp / "silent.mp4"
        if not run_ffmpeg(["-framerate", str(FPS), "-i", str(tmp / "frame_%05d.jpg"),
                           "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                           "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(silent)]):
            return

        # ── TTS 음성 병합 ──
        if args.tts:
            audio_files = [tmp / f"audio_{i}.wav" for i in range(len(picked))]
            concat_list = tmp / "audio_list.txt"
            concat_list.write_text(
                "".join(f"file '{af.as_posix()}'\n" for af in audio_files), encoding="utf-8")
            full_audio = tmp / "full_audio.wav"
            if not run_ffmpeg(["-f", "concat", "-safe", "0", "-i", str(concat_list),
                               "-c", "copy", str(full_audio)]):
                return
            if not run_ffmpeg(["-i", str(silent), "-i", str(full_audio),
                               "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                               "-shortest", str(out)]):
                return
        else:
            out.write_bytes(silent.read_bytes())

        size_mb = out.stat().st_size / (1024 * 1024)
        ok(f"생성 완료: {out} ({size_mb:.1f}MB, {W}x{H})")
        log(f"\n바로 배포: python publish.py --video {out.relative_to(PROMO)} --unit {unit_no}"
            + (" --tts 없이 --dry-run 으로 먼저 확인!" if args.tts else " (--dry-run 으로 미리 확인 추천)"))
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()