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
# 한국어·IPA를 모두 포함하는 폰트를 우선 사용합니다. 시스템에 한글 폰트가
# 없을 때 Pillow 기본 폰트로 내려가면 한글이 □로 렌더링되므로, 후보를 넉넉히 둡니다.
FONT_CANDIDATES_BOLD = [
    "C:/Windows/Fonts/malgunbd.ttf",                         # Windows 맑은 고딕 Bold
    "C:/Windows/Fonts/NotoSansKR-Bold.otf",
    "/System/Library/Fonts/AppleSDGothicNeo-Bold.ttf",        # macOS
    "/Library/Fonts/NanumGothicBold.ttf",
    "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",    # Linux
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJKkr-Bold.otf",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
]
FONT_CANDIDATES_REGULAR = [
    "C:/Windows/Fonts/malgun.ttf",                           # Windows 맑은 고딕
    "C:/Windows/Fonts/NotoSansKR-Regular.otf",
    "/System/Library/Fonts/AppleSDGothicNeo-Regular.ttf",    # macOS
    "/Library/Fonts/NanumGothic.ttf",
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",        # Linux
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJKkr-Regular.otf",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
]
# 이모지는 컬러 폰트의 플랫폼별 지원 편차가 크므로, 발견하지 못하면
# 아이콘을 아예 그리지 않습니다. 기본 폰트로 그려 □가 생기는 것을 막습니다.
EMOJI_FONT_CANDIDATES = [
    "C:/Windows/Fonts/seguiemj.ttf",                          # Windows Segoe UI Emoji
    "/System/Library/Fonts/Apple Color Emoji.ttc",            # macOS
    "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",       # Linux
]

# ---------------------------------------------------------------- themes ----
THEMES = {
    "blue":     ((30, 58, 138), (49, 46, 129)),     # indigo
    "purple":   ((76, 29, 149), (131, 24, 67)),     # violet→rose
    "green":    ((6, 78, 59), (19, 78, 74)),        # emerald→teal
    "orange":   ((124, 45, 18), (154, 52, 18)),     # amber→orange
    "pink":     ((131, 24, 67), (80, 7, 36)),       # rose→dark rose
    "navy":     ((15, 23, 42), (30, 27, 75)),       # slate→indigo
    "midnight": ((2, 6, 23), (15, 23, 42)),         # deep space
    "sunset":   ((124, 45, 18), (76, 29, 149)),     # amber→violet
    "mint":     ((4, 47, 46), (6, 78, 59)),         # dark teal
    "wine":     ((76, 5, 25), (45, 9, 36)),         # deep red
}
ACCENT = {
    "blue":     (147, 197, 253),
    "purple":   (216, 180, 254),
    "green":    (110, 231, 183),
    "orange":   (253, 186, 116),
    "pink":     (249, 168, 212),
    "navy":     (147, 197, 253),
    "midnight": (129, 140, 248),
    "sunset":   (253, 186, 116),
    "mint":     (110, 231, 183),
    "wine":     (251, 113, 133),
}

# ---------------------------------------------------------------- styles ----
STYLE_NAMES = ("classic", "modern", "minimal")
# 카드 레이아웃 — y 좌표와 옵션을 스타일별로 정리합니다.
LAYOUT = {
    "classic": dict(chip=True, deco=True, card=False, word_y=560, ipa_y=790, ipa_pill=True,
                     pron_dy=34, line_y=1120, mean_y=1170, label_y=1330, en_y=1395, en_dy=72,
                     tr_max_y=1610, tr_dy=58, unit_y=None),
    "modern":  dict(chip=True, deco=False, card=True, word_y=340, ipa_y=580, ipa_pill=True,
                     pron_dy=30, line_y=840, mean_y=900, label_y=1070, en_y=1135, en_dy=66,
                     tr_max_y=1500, tr_dy=54, unit_y=None),
    "minimal": dict(chip=False, deco=False, card=False, word_y=560, ipa_y=780, ipa_pill=False,
                     pron_dy=34, line_y=1120, mean_y=1170, label_y=1330, en_y=1395, en_dy=72,
                     tr_max_y=1610, tr_dy=58, unit_y=130),
}


def find_font(candidates: list[str]) -> str | None:
    for c in candidates:
        if Path(c).exists():
            return c
    return None


def load_font(path: str | None, size: int, bold: bool = True):
    """한글/IPA 지원 폰트를 로드합니다.

    --font를 지정하면 그 폰트를 우선 사용하고, 지정하지 않았거나 파일이
    없으면 운영체제별 CJK 폰트를 탐색합니다. 기본 폰트로 조용히 폴백하면
    한글이 □로 출력되므로, 실제 렌더링 때는 명확한 오류를 냅니다.
    """
    candidates = FONT_CANDIDATES_BOLD if bold else FONT_CANDIDATES_REGULAR
    p = path if path and Path(path).exists() else find_font(candidates)
    if p:
        try:
            return ImageFont.truetype(p, size)
        except OSError as exc:
            raise RuntimeError(f"폰트를 열 수 없습니다: {p} ({exc})") from exc
    raise RuntimeError(
        "한글 폰트를 찾지 못했습니다. --font로 CJK 폰트(.ttf/.ttc/.otf)를 "
        "지정하거나 Windows 맑은 고딕/나눔고딕을 설치하세요."
    )


def load_emoji_font(size: int):
    """지원되는 이모지 폰트만 반환하고, 없으면 None을 반환합니다.

    Pillow의 기본 폰트로 이모지를 그리면 □가 출력될 수 있으므로 절대
    기본 폰트로 대체하지 않습니다. render_slide는 None일 때 아이콘을
    생략해 영상에 네모 문자가 남지 않게 합니다.
    """
    p = find_font(EMOJI_FONT_CANDIDATES)
    if not p:
        return None
    try:
        return ImageFont.truetype(p, size, layout_engine=ImageFont.Layout.RAQM)
    except (TypeError, AttributeError, OSError):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
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


def wrap_text(text: str, font, max_width: int, draw=None) -> list[str]:
    lines = []
    measure = (lambda value: text_width(draw, value, font)) if draw is not None else (lambda value: font.getlength(value))
    for para in text.split("\n"):
        cur = ""
        for ch in para:
            test = cur + ch
            if measure(test) > max_width and cur:
                lines.append(cur)
                cur = ch
            else:
                cur = test
        if cur:
            lines.append(cur)
    return lines


def text_width(draw, text: str, font) -> float:
    """Pillow 버전/폰트에 관계없이 텍스트 폭을 구합니다."""
    try:
        return draw.textlength(text, font=font)
    except (AttributeError, TypeError):
        try:
            return font.getlength(text)
        except AttributeError:
            box = draw.textbbox((0, 0), text, font=font)
            return box[2] - box[0]


def draw_pill(draw, cx, y, text, font, fg, bg, pad_x=28, pad_y=14, radius=None) -> int:
    w = text_width(draw, text, font)
    tw = int(w + pad_x * 2)
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_h = bbox[3] - bbox[1]
    except (AttributeError, TypeError):
        text_h = getattr(font, "size", 24)
    th = text_h + pad_y * 2
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
def render_slide(idx: int, total: int, unit_no: int, unit_info: dict, wd: list,
                 theme: str, font_path: str | None, style: str = "classic") -> Image.Image:
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    ly = LAYOUT.get(style, LAYOUT["classic"])
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    if ly["deco"]:
        draw_deco(draw)

    word, ipa, kor_pron, meaning, en_ex, kr_tr = wd[0], wd[1], wd[2], wd[3], wd[4], wd[5]

    # ── 상단: 유닛 칩 (classic/modern) 또는 제목 텍스트 (minimal) ──
    icon_font = load_emoji_font(64)
    title_font = load_font(font_path, 40, bold=True)
    title = f"UNIT {unit_no} · {unit_info.get('title', '')}"
    if ly["chip"]:
        chip = (255, 255, 255, 36)  # rgba(255,255,255,0.14)
        tw = text_width(draw, title, title_font)
        chip_w = int(tw + 96)
        cx0 = W // 2 - chip_w // 2
        draw.rounded_rectangle([cx0, 96, cx0 + chip_w, 174], radius=39, fill=chip)
        if icon_font:
            draw.text((cx0 + 30, 102), unit_info.get("icon", "📚"), font=icon_font)
        draw.text((cx0 + 86, 113), title, font=title_font, fill=(255, 255, 255))
    elif ly["unit_y"]:
        tw = text_width(draw, title, title_font)
        draw.text((W / 2 - tw / 2, ly["unit_y"]), title, font=title_font, fill=(255, 255, 255, 190))

    # ── modern: 글래스 카드 + 좌측 액센트 바 ──
    if ly["card"]:
        draw.rounded_rectangle([60, 180, W - 60, 1700], radius=56, fill=(255, 255, 255, 22))
        draw.rounded_rectangle([60, 180, 96, 1700], radius=18, fill=ACCENT_THEME + (70,))

    # ── 단어 ──
    word_font = load_font(font_path, 148, bold=True)
    word_w = text_width(draw, word, word_font)
    while word_w > W - 140 and word_font.size > 60:
        word_font = load_font(font_path, word_font.size - 12, bold=True)
        word_w = text_width(draw, word, word_font)
    draw.text((W / 2 - word_w / 2, ly["word_y"]), word, font=word_font, fill=(255, 255, 255))

    # ── IPA + 한글 발음 ──
    ipa_font = load_font(font_path, 54, bold=False)
    y = ly["ipa_y"]
    if ly["ipa_pill"]:
        y = draw_pill(draw, W // 2, y, ipa, ipa_font, (235, 240, 255), (0, 0, 0, 70))
    else:
        iw = text_width(draw, ipa, ipa_font)
        draw.text((W / 2 - iw / 2, y), ipa, font=ipa_font, fill=(215, 225, 250))
        y += 80
    pron_font = load_font(font_path, 46, bold=False)
    if kor_pron:
        ptext = f"발음: {kor_pron}"
        pw = text_width(draw, ptext, pron_font)
        draw.text((W / 2 - pw / 2, y + ly["pron_dy"]), ptext, font=pron_font, fill=(215, 225, 250))

    # ── 구분선 ──
    draw.line([200, ly["line_y"], W - 200, ly["line_y"]], fill=(255, 255, 255, 70), width=3)

    # ── 뜻 ──
    mean_font = load_font(font_path, 88, bold=True)
    mw = text_width(draw, meaning, mean_font)
    while mw > W - 160 and mean_font.size > 44:
        mean_font = load_font(font_path, mean_font.size - 8, bold=True)
        mw = text_width(draw, meaning, mean_font)
    draw.text((W / 2 - mw / 2, ly["mean_y"]), meaning, font=mean_font, fill=ACCENT_THEME)

    # ── 예문 ──
    label_font = load_font(font_path, 34, bold=True)
    lbl = "TOEIC 예문"
    draw.text((120, ly["label_y"]), lbl, font=label_font, fill=(255, 255, 255, 190))
    en_font = load_font(font_path, 50, bold=False)
    en_lines = wrap_text(en_ex, en_font, W - 240, draw)
    while len(en_lines) > 5 and en_font.size > 30:
        en_font = load_font(font_path, en_font.size - 4, bold=False)
        en_lines = wrap_text(en_ex, en_font, W - 240, draw)
    y = ly["en_y"]
    for line in en_lines[:5]:
        draw.text((120, y), line, font=en_font, fill=(255, 255, 255))
        y += ly["en_dy"]

    # ── 해석 ──
    tr_font = load_font(font_path, 40, bold=False)
    tr_lines = wrap_text(kr_tr, tr_font, W - 240, draw)
    while len(tr_lines) > 3 and tr_font.size > 26:
        tr_font = load_font(font_path, tr_font.size - 4, bold=False)
        tr_lines = wrap_text(kr_tr, tr_font, W - 240, draw)
    y = min(y + 30, ly["tr_max_y"])
    for line in tr_lines[:3]:
        draw.text((120, y), line, font=tr_font, fill=(200, 210, 235))
        y += ly["tr_dy"]

    # ── 푸터 ──
    foot_font = load_font(font_path, 44, bold=True)
    ft = "toeic.monster"
    fw = text_width(draw, ft, foot_font)
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


def mix_final(silent: Path, tts_wav: Path | None, music: Path | None,
              music_volume: float, out: Path) -> bool:
    """TTS·배경음악을 영상에 병합합니다. 둘 다 없으면 무성 영상을 그대로 복사합니다."""
    if tts_wav is None and music is None:
        out.write_bytes(silent.read_bytes())
        return True
    if tts_wav is not None and music is not None:
        fc = (f"[1:a]volume=1.0[voice];"
              f"[2:a]volume={music_volume},afade=t=in:st=0:d=1[bg];"
              f"[voice][bg]amix=inputs=2:duration=first:dropout_transition=3[aout]")
        return run_ffmpeg(["-i", str(silent), "-i", str(tts_wav), "-i", str(music),
                           "-filter_complex", fc, "-map", "0:v", "-map", "[aout]",
                           "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(out)])
    if music is not None:
        dur = probe_duration(silent) or 10.0
        fc = (f"[1:a]volume={music_volume},afade=t=in:st=0:d=1,"
              f"afade=t=out:st={max(0.0, dur - 1.5):.2f}:d=1.5[aout]")
        return run_ffmpeg(["-i", str(silent), "-stream_loop", "-1", "-i", str(music),
                           "-filter_complex", fc, "-map", "0:v", "-map", "[aout]",
                           "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{dur:.2f}", str(out)])
    return run_ffmpeg(["-i", str(silent), "-i", str(tts_wav),
                       "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(out)])


# ---------------------------------------------------------------- main ----
def main() -> None:
    ap = argparse.ArgumentParser(description="toeic.monster 단어 카드 쇼츠 영상 생성기 (1080x1920, 9:16)")
    ap.add_argument("--unit", type=int, required=True, help="유닛 번호 (1~30)")
    ap.add_argument("--words", type=int, default=5, help="영상에 넣을 단어 수 (기본 5)")
    ap.add_argument("--slide-sec", type=float, default=6.0, help="슬라이드당 길이 초 (기본 6)")
    ap.add_argument("--out", help="출력 mp4 경로 (기본: assets/shorts/unitNN_shorts.mp4)")
    ap.add_argument("--bg", default="blue", choices=sorted(THEMES), help="배경 테마")
    ap.add_argument("--style", default="classic", choices=STYLE_NAMES, help="카드 스타일: classic/modern/minimal")
    ap.add_argument("--font", help="한국어 폰트 ttf/ttc 경로 (기본: 시스템 자동 탐색)")
    ap.add_argument("--seed", type=int, help="단어 선택 시드 (재현용)")
    ap.add_argument("--index", type=int, help="특정 단어 인덱스만 사용 (0부터, 테스트용)")
    ap.add_argument("--tts", action="store_true", help="영어 TTS 음성 추가 (edge-tts, 인터넷 필요)")
    ap.add_argument("--voice", default="en-US-JennyNeural", help="TTS 목소리 (기본 en-US-JennyNeural)")
    ap.add_argument("--music", help="배경음악 오디오 파일(mp3/wav) 경로 (선택)")
    ap.add_argument("--music-volume", type=float, default=0.15, help="배경음악 볼륨 0~1 (기본 0.15)")
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
        if args.index < 0 or args.index >= len(words):
            sys.exit(f"인덱스 {args.index} 는 범위 밖 (0~{len(words)-1}).")
        picked = [words[args.index]]
    else:
        n = min(args.words, len(words))
        picked = rng.sample(words, n)

    music = Path(args.music) if args.music else None
    if music is not None:
        music = music if music.is_absolute() else PROMO / music
        if not music.exists():
            sys.exit(f"배경음악 파일을 찾을 수 없습니다: {music}")
        if not 0.0 < args.music_volume <= 1.0:
            sys.exit("--music-volume 은 0 초과 1 이하로 지정해 주세요.")

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
    log(f"스타일: {args.style}")
    log(f"음성  : {'edge-tts (' + args.voice + ')' if args.tts else '없음 (--tts 로 추가)'}")
    if music:
        log(f"배경음악: {music} (볼륨 {args.music_volume:g})")
    if args.dry_run:
        log("\n실제 생성하려면 --dry-run 을 빼고 실행하세요.")
        return

    tmp = Path(tempfile.mkdtemp(prefix="toeic_shorts_"))
    try:
        # ── 슬라이드 렌더링 + 프레임 출력 ──
        try:
            slides = [render_slide(i, len(picked), unit_no, unit_info, w, args.bg, args.font, args.style)
                      for i, w in enumerate(picked)]
        except RuntimeError as exc:
            fail(str(exc))
            sys.exit(2)
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

        # ── TTS·배경음악 병합 ──
        tts_wav = None
        if args.tts:
            audio_files = [tmp / f"audio_{i}.wav" for i in range(len(picked))]
            concat_list = tmp / "audio_list.txt"
            concat_list.write_text(
                "".join(f"file '{af.as_posix()}'\n" for af in audio_files), encoding="utf-8")
            tts_wav = tmp / "full_audio.wav"
            if not run_ffmpeg(["-f", "concat", "-safe", "0", "-i", str(concat_list),
                               "-c", "copy", str(tts_wav)]):
                return
        if not mix_final(silent, tts_wav, music, args.music_volume, out):
            return

        size_mb = out.stat().st_size / (1024 * 1024)
        ok(f"생성 완료: {out} ({size_mb:.1f}MB, {W}x{H})")
        log(f"\n바로 배포: python publish.py --video {out.relative_to(PROMO)} --unit {unit_no}"
            + (" --tts 없이 --dry-run 으로 먼저 확인!" if args.tts else " (--dry-run 으로 미리 확인 추천)"))
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()