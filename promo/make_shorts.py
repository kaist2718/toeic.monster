#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""toeic.monster 홍보용 쇼츠 영상 자동 생성기.

data/unitNN.js 의 단어 카드와 data/idioms.js 의 숙어 카드를 9:16 세로 쇼츠 영상(1080x1920)으로
렌더링합니다. 슬라이드당 1개 항목 — 단어는 단어·IPA·한글 발음·뜻·예문·해석, 숙어는 표현·뜻·예문·해석.
공통으로 toeic.monster 푸터가 들어갑니다.
Ken Burns 줌 효과와 슬라이드 간 크로스페이드, 선택적으로 영어 TTS 음성 포함.

사용법:
  python make_shorts.py --unit 1                     # UNIT 1 단어 5개 랜덤 → assets/shorts/unit01_shorts.mp4
  python make_shorts.py --unit 3 --words 7 --tts     # 7개 + 영어 음성(Windows 내장 TTS)
  python make_shorts.py --unit 5 --seed 42 --bg purple
  python make_shorts.py --unit 5 --bg 12 --pattern 11  # 배경 테마·패턴을 번호로 선택
  python make_shorts.py --list-bg                      # 배경 테마·패턴 번호 목록
  python make_shorts.py --unit 2 --words 3 --dry-run # 계획만 출력
  python make_shorts.py --unit 1 --allow-repeat      # 이미 쓴 단어도 다시 사용
  python make_shorts.py --unit 1 --single-voice      # 여성 목소리 하나만
  python make_shorts.py --unit 1 --voice2 none       # 두 번째 목소리 끄기
  python make_shorts.py --idioms --words 5           # 숙어 126선에서 5개 (→ assets/shorts/idioms_*_shorts.mp4)
  python make_shorts.py --idioms --index 0 --bg mint # 숙어 목록의 특정 순번만

음성 기본값은 **두 목소리**입니다 — 먼저 여성, 이어서 남성이 같은 단어·예문을 읽습니다. 음성 길이가
약 2배가 되므로 슬라이드가 자동으로 늘어납니다. --single-voice 나 --voice2 none 으로 한 목소리만 쓸 수 있습니다.

낭독 엔진(--engine)은 세 가지입니다.
  auto   : 내려받은 로컬(Piper) 음성이 있으면 로컬, 없으면 Windows 내장 (기본)
  piper  : 로컬 Piper(ONNX) 모델로 이 PC에서 합성 — 인터넷·API 불필요, assets/tts 에 음성 모델 필요
  windows: Windows 내장 TTS(SAPI) — 인터넷·패키지 불필요
메뉴 31(원클릭 센터)에서 엔진·목소리 선택, 음성 내려받기, 테스트 재생을 할 수 있습니다.

배경: --bg 로 테마(색 그라데이션 22종), --pattern 로 배경 패턴(15종)을 고릅니다. 둘 다 이름 또는
번호(--list-bg 목록의 번호)를 받습니다. 기본 pattern 은 auto — 스타일 기본값을 그대로 씁니다.

중복 방지: 이미 쓴 단어는 다음 생성에서 자동으로 제외되고 promo/posted.json 에 기록됩니다.

필요 패키지: Pillow, imageio-ffmpeg (pip install -r requirements.txt)
TTS 사용 시: 로컬 Piper(pip install piper-tts + 음성 내려받기) 또는
  Windows 내장 TTS(SAPI) — 둘 다 인터넷 없이 동작합니다 (설치 상태는 --dry-run 로그 참고)
"""

from __future__ import annotations

import argparse
import base64
import json
import math
import random
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import wave
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
from publish import (  # noqa: E402
    DEFAULT_TTS_ENGINE,
    DEFAULT_VOICE,
    DEFAULT_VOICE2,
    FREQUENCY_BUCKET,
    KIND_SPECS,
    TTS_ENGINES,
    IDIOM_BUCKET,
    PARAPHRASE_BUCKET,
    POSTED_FILE,
    fail,
    list_piper_voices,
    load_frequency,
    load_idioms,
    load_kind_rows,
    load_paraphrase,
    load_unit_info,
    load_unit_words,
    log,
    mark_words_posted,
    normalize_tts_engine,
    normalize_word,
    now_iso,
    ok,
    piper_available,
    piper_default_voice,
    piper_voice_path,
    posted_words_for_unit,
    print_remaining,
    record_content_created,
    resolve_tts_engine,
    warn,
)

# 생성 종류(kind) → 남은 콘텐츠 표시에서 강조할 키
HIGHLIGHT_KEY = {"unit": "unit", "idioms": IDIOM_BUCKET,
                 "frequency": FREQUENCY_BUCKET, "paraphrase": PARAPHRASE_BUCKET,
                 **{k: k for k in KIND_SPECS}}


def kind_layout(kind: str) -> str:
    """새 포맷의 슬라이드 구성 — quiz2 = 문제→정답 2장, list1 = 한 장짜리 카드."""
    return KIND_SPECS.get(kind, {}).get("layout", "")


def is_quiz_kind(kind: str) -> bool:
    """「문제 → 정답」 두 장 구조로 만드는 종류인지 여부."""
    return kind == "paraphrase" or kind_layout(kind) == "quiz2"

PROMO = Path(__file__).resolve().parent
ROOT = PROMO.parent
OUT_DIR = PROMO / "assets" / "shorts"

W, H = 1080, 1920
FPS = 30
ZOOM = 0.06          # 슬라이드 시작→끝 6% 줌인
FADE_FRAMES = 12     # 크로스페이드 프레임 수 (0.4초)

# ---------------------------------------------------------------- fonts ----
# 기본 폰트는 **네이버 마루부리(Maru Buri)** 입니다. 프로젝트에 함께 넣어 둔
# promo/fonts/ 파일을 가장 먼저 쓰고, 없으면 내려받은 뒤(ensure_maruburi),
# 그래도 없으면 시스템 한글 폰트 후보로 내려갑니다. 시스템에 한글 폰트가
# 없을 때 Pillow 기본 폰트로 내려가면 한글이 □로 렌더링되므로 후보를 넉넉히 둡니다.
FONT_DIR = PROMO / "fonts"
MARUBURI_FILES = ("MaruBuri-Regular.otf", "MaruBuri-Bold.otf")
# 네이버 마루 부리는 오픈 라이선스(재배포 가능) — fonts-archive 미러(jsDelivr CDN)에서 OTF 를 받습니다.
MARUBURI_CDN = "https://cdn.jsdelivr.net/gh/fonts-archive/MaruBuri/"

FONT_CANDIDATES_BOLD = [
    str(FONT_DIR / "MaruBuri-Bold.otf"),                      # 네이버 마루부리 Bold (기본)
    "C:/Windows/Fonts/MaruBuri-Bold.otf",                     # 설치된 마루부리
    "/Library/Fonts/MaruBuri-Bold.otf",                       # macOS 설치본
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
    str(FONT_DIR / "MaruBuri-Regular.otf"),                    # 네이버 마루부리 Regular (기본)
    "C:/Windows/Fonts/MaruBuri-Regular.otf",                   # 설치된 마루부리
    "/Library/Fonts/MaruBuri-Regular.otf",                     # macOS 설치본
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
# 배경 테마 — (위쪽 색, 아래쪽 색) 세로 그라데이션. 순서가 곧 번호입니다(--list-bg · 메뉴 번호).
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
    "teal":     ((13, 148, 136), (4, 72, 72)),      # teal ocean
    "sky":      ((12, 100, 148), (18, 52, 99)),     # sky blue
    "forest":   ((20, 83, 45), (5, 46, 32)),        # forest green
    "lavender": ((109, 40, 170), (60, 20, 120)),    # lavender
    "gold":     ((120, 53, 15), (87, 34, 8)),       # gold amber
    "coral":    ((168, 22, 62), (104, 12, 42)),     # coral rose
    "steel":    ((48, 63, 84), (25, 33, 48)),       # steel blue
    "plum":     ((88, 28, 100), (50, 15, 62)),      # plum
    "ocean":    ((12, 74, 110), (10, 36, 66)),      # deep ocean
    "coffee":   ((87, 52, 30), (52, 30, 17)),       # coffee brown
    "neon":     ((64, 12, 110), (20, 8, 60)),       # neon violet
    "graphite": ((40, 44, 52), (22, 25, 31)),       # graphite
}
# 테마 이름 → 메뉴에 보여 줄 한 줄 설명.
THEME_LABELS = {
    "blue":     "인디고 블루",
    "purple":   "바이올렛→로즈",
    "green":    "에메랄드→틸",
    "orange":   "앰버 오렌지",
    "pink":     "딥 로즈",
    "navy":     "네이비 슬레이트",
    "midnight": "미드나잇 스페이스",
    "sunset":   "선셋 앰버→바이올렛",
    "mint":     "다크 틸",
    "wine":     "와인 레드",
    "teal":     "틸 오션",
    "sky":      "스카이 블루",
    "forest":   "포레스트 그린",
    "lavender": "라벤더 바이올렛",
    "gold":     "골드 앰버",
    "coral":    "코랄 로즈",
    "steel":    "스틸 블루",
    "plum":     "플럼 퍼플",
    "ocean":    "딥 오션",
    "coffee":   "커피 브라운",
    "neon":     "네온 바이올렛",
    "graphite": "그래파이트",
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
    "teal":     (153, 246, 228),
    "sky":      (165, 243, 252),
    "forest":   (134, 239, 172),
    "lavender": (221, 214, 254),
    "gold":     (253, 230, 138),
    "coral":    (254, 205, 202),
    "steel":    (186, 206, 232),
    "plum":     (233, 196, 255),
    "ocean":    (143, 222, 255),
    "coffee":   (227, 190, 160),
    "neon":     (192, 132, 252),
    "graphite": (203, 213, 225),
}

# 배경 패턴 이름 — 순서가 곧 번호입니다(--list-bg · 메뉴 번호).
PATTERN_NAMES = (
    "auto", "none", "circles", "rings", "dots", "grid", "mesh",
    "diagonal", "stripes", "waves", "bokeh", "glow", "triangles", "stars", "confetti",
)
PATTERN_LABELS = {
    "auto":      "자동 — 카드 스타일 기본값",
    "none":      "무늬 없음 (깔끔한 그라데이션)",
    "circles":   "은은한 원",
    "rings":     "동심원 링",
    "dots":      "점 패턴(아래로 진해짐)",
    "grid":      "격자",
    "mesh":      "점 격자",
    "diagonal":  "사선 줄무늬",
    "stripes":   "세로 줄무늬",
    "waves":     "물결",
    "bokeh":     "빛 번짐(보케)",
    "glow":      "방사 광원",
    "triangles": "삼각형",
    "stars":     "별빛",
    "confetti":  "색종이",
}


def resolve_theme(value) -> str:
    """테마 이름 또는 번호(1부터)를 테마 이름으로 바꿉니다. 모르면 빈 문자열."""
    text = str(value or "").strip().lower()
    if text.isdigit():
        names = list(THEMES)
        idx = int(text)
        return names[idx - 1] if 1 <= idx <= len(names) else ""
    return text if text in THEMES else ""


def resolve_pattern(value) -> str:
    """패턴 이름 또는 번호(1부터)를 패턴 이름으로 바꿉니다. 모르면 빈 문자열."""
    text = str(value or "").strip().lower()
    if text.isdigit():
        idx = int(text)
        return PATTERN_NAMES[idx - 1] if 1 <= idx <= len(PATTERN_NAMES) else ""
    return text if text in PATTERN_LABELS else ""


def resolve_style(value) -> str:
    """카드 스타일 이름 또는 번호(1부터)를 스타일 이름으로 바꿉니다. 모르면 빈 문자열."""
    text = str(value or "").strip().lower()
    if text.isdigit():
        idx = int(text)
        return STYLE_NAMES[idx - 1] if 1 <= idx <= len(STYLE_NAMES) else ""
    return text if text in STYLE_NAMES else ""


def theme_choices() -> list[tuple[str, str]]:
    """메뉴용 (테마 이름, 설명) 목록 — 번호는 이 순서."""
    return [(name, THEME_LABELS.get(name, name)) for name in THEMES]


def pattern_choices() -> list[tuple[str, str]]:
    """메뉴용 (패턴 이름, 설명) 목록 — 번호는 이 순서."""
    return [(name, PATTERN_LABELS.get(name, name)) for name in PATTERN_NAMES]

# ---------------------------------------------------------------- styles ----
STYLE_NAMES = ("classic", "modern", "minimal")
# 카드 레이아웃 — y 좌표와 옵션을 스타일별로 정리합니다.
LAYOUT = {
    "classic": dict(chip=True, deco=True, card=False, word_y=560, ipa_y=790, ipa_pill=True,
                     pron_dy=34, line_y=1120, mean_y=1170, label_y=1330, en_y=1395, en_dy=70,
                     tr_max_y=1560, tr_dy=54, unit_y=None),
    "modern":  dict(chip=True, deco=False, card=True, word_y=340, ipa_y=580, ipa_pill=True,
                     pron_dy=30, line_y=840, mean_y=900, label_y=1070, en_y=1135, en_dy=66,
                     tr_max_y=1500, tr_dy=54, unit_y=None),
    "minimal": dict(chip=False, deco=False, card=False, word_y=560, ipa_y=780, ipa_pill=False,
                     pron_dy=34, line_y=1120, mean_y=1170, label_y=1330, en_y=1395, en_dy=70,
                     tr_max_y=1560, tr_dy=54, unit_y=130),
}
# 숙어 카드는 IPA·한글 발음 줄이 없어 표현·뜻·예문·해석만 담고, 그만큼 위아래 여백을 다시 잡습니다.
IDIOM_LAYOUT = {
    "classic": dict(phrase_y=600, line_y=980, mean_y=1040, label_y=1210, en_y=1280, en_dy=72,
                     tr_max_y=1530, tr_dy=56),
    "modern":  dict(phrase_y=420, line_y=790, mean_y=850, label_y=1030, en_y=1100, en_dy=68,
                     tr_max_y=1450, tr_dy=54),
    "minimal": dict(phrase_y=600, line_y=980, mean_y=1040, label_y=1210, en_y=1280, en_dy=72,
                     tr_max_y=1530, tr_dy=56),
}


def find_font(candidates: list[str]) -> str | None:
    for c in candidates:
        if Path(c).exists():
            return c
    return None


def ensure_maruburi() -> None:
    """기본 폰트 마루부리가 프로젝트에 없으면 한 번 내려받아 둡니다.

    네트워크가 없거나 받지 못해도 영상 생성은 멈추지 않고, 그때 시스템 한글
    폰트 후보(맑은 고딕 등)로 내려가며 경고만 남깁니다.
    """
    missing = [n for n in MARUBURI_FILES if not (FONT_DIR / n).exists()]
    if not missing:
        return
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    for name in missing:
        target = FONT_DIR / name
        try:
            with urllib.request.urlopen(MARUBURI_CDN + name, timeout=15) as src, \
                    open(target, "wb") as dst:
                shutil.copyfileobj(src, dst)
        except Exception as exc:  # 실패한 파일은 남기지 않고 폴백합니다
            target.unlink(missing_ok=True)
            warn(f"마루부리 폰트 내려받기 실패 — 시스템 한글 폰트로 렌더링합니다 ({exc})")
            return
        log(f"마루부리 폰트 내려받음: {target}")


def default_font_label() -> str:
    """지금 실제로 쓰는 기본 폰트 이름을 알려 줍니다 (로그용)."""
    p = find_font(FONT_CANDIDATES_BOLD)
    if not p:
        return "없음"
    return "네이버 마루부리 (MaruBuri)" if "maruburi" in p.lower() else f"{Path(p).name}"


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
            font = ImageFont.truetype(p, size)
            _font_paths[id(font)] = p
            return font
        except OSError as exc:
            raise RuntimeError(f"폰트를 열 수 없습니다: {p} ({exc})") from exc
    raise RuntimeError(
        "기본 폰트 마루부리(네이버)를 찾지 못했습니다 — promo/fonts/MaruBuri-*.otf 를 "
        "넣거나(또는 인터넷에서 자동 내려받게 해제하거나) --font로 CJK 폰트"
        "(.ttf/.ttc/.otf)를 지정하거나 Windows 맑은 고딕/나눔고딕을 설치하세요."
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


# ---------------------------------------------------------------- glyph fallback ----
# 시스템 한글 폰트에 IPA(ˈ, ʌ 등)나 특수문자가 없으면 □로 표시됩니다.
# 글리프별로 폴백 폰트(영문 IPA 커버 폰트)를 골라 그려 네모를 막습니다.
# 글리프 존재는 fontTools cmap으로 확인합니다 — 비트맵 비교는 .notdef 상자를
# 실제 글리프로 오인해 IPA □가 그대로 남는 원인이었습니다.
FALLBACK_FONT_CANDIDATES = [
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]

try:
    from fontTools.ttLib import TTFont
    _FONTTOOLS_OK = True
except ImportError:
    _FONTTOOLS_OK = False

_cmap_cache: dict[str, dict] = {}
_font_paths: dict[int, str] = {}  # id(font) -> 폰트 파일 경로
_glyph_cache: dict[tuple[int, str], bool] = {}
_fallback_cache: dict[tuple[int, bool], object] = {}


def _get_cmap(path: str) -> dict | None:
    """폰트의 문자→글리프 매핑(cmap)을 캐시하며 가져옵니다. 실패 시 None."""
    if path in _cmap_cache:
        return _cmap_cache[path]
    cmap = None
    try:
        try:
            cmap = TTFont(path).getBestCmap()
        except Exception:
            cmap = TTFont(path, fontNumber=0).getBestCmap()  # .ttc 대응
    except Exception:
        cmap = None
    _cmap_cache[path] = cmap
    return cmap


def font_has_glyph(font, ch: str) -> bool:
    """폰트에 해당 문자의 실제 글리프가 있는지 확인합니다."""
    key = (id(font), ch)
    if key in _glyph_cache:
        return _glyph_cache[key]
    path = _font_paths.get(id(font))
    if _FONTTOOLS_OK and path:
        cmap = _get_cmap(path)
        ok = cmap is None or ord(ch) in cmap
    else:
        # fontTools 미설치 시 비트맵 비교 폴백 (정확도 낮음)
        try:
            m1 = font.getmask(ch, mode="L")
            m2 = font.getmask("\u0378", mode="L")
            b1, b2 = m1.getbbox(), m2.getbbox()
            ok = b1 is not None and (b1 != b2 or m1.tobytes() != m2.tobytes())
        except Exception:
            ok = True
    _glyph_cache[key] = ok
    return ok


def load_fallback_font(size: int):
    """IPA·특수문자를 커버하는 폴백 폰트를 로드합니다. 없으면 None."""
    key = (size, True)
    if key in _fallback_cache:
        return _fallback_cache[key]
    font = None
    for c in FALLBACK_FONT_CANDIDATES:
        if Path(c).exists():
            try:
                font = ImageFont.truetype(c, size)
                _font_paths[id(font)] = c
                break
            except OSError:
                continue
    _fallback_cache[key] = font
    return font


def split_runs(text: str, font) -> list[tuple[str, object]]:
    """주 폰트에 없는 글리프는 폴백 폰트로 바꾼 (글자, 폰트) 런 목록을 만듭니다."""
    fallback = load_fallback_font(font.size)
    runs: list[tuple[str, object]] = []
    cur_chars: list[str] = []
    cur_font = font
    for ch in text:
        f = font
        if not font_has_glyph(font, ch) and fallback is not None and font_has_glyph(fallback, ch):
            f = fallback
        if f is not cur_font:
            if cur_chars:
                runs.append(("".join(cur_chars), cur_font))
            cur_chars, cur_font = [], f
        cur_chars.append(ch)
    if cur_chars:
        runs.append(("".join(cur_chars), cur_font))
    return runs


def rich_width(draw, text: str, font) -> float:
    """draw_text_rich 이 실제로 그리는 폭 — 폴백으로 바뀐 글리프까지 반영합니다."""
    return sum(text_width(draw, t, f) for t, f in split_runs(text, font))


def draw_text_rich(draw, text: str, font, fill, *, y: float, x: float | None = None) -> None:
    """주 폰트에 없는 글리프는 폴백 폰트로 대체해 그립니다. x=None이면 가운데 정렬."""
    runs = split_runs(text, font)
    if x is None:
        x = (W - sum(text_width(draw, t, f) for t, f in runs)) / 2
    for t, f in runs:
        draw.text((x, y), t, font=f, fill=fill)
        x += text_width(draw, t, f)


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
    # pill 폭은 폴백 글리프까지 반영한 실제 그림 폭(rich_width)으로 잡아야
    # 폰트 섞어 그리기(draw_text_rich) 때 글자가 알약 안에서 한쪽으로 쏠리지 않습니다.
    w = rich_width(draw, text, font)
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
    draw_text_rich(draw, text, font, fg, y=y0 + pad_y - 2, x=cx - w / 2)
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


# ------------------------------------------------------ background patterns ----
# 배경 패턴 그리기 — 그라데이션 위에 은은한 흰색/액센트 무늬를 얹습니다.
# --pattern 으로 고르며, 이름 또는 번호(PATTERN_NAMES 순서)를 받습니다.
# 랜덤이 들어가는 패턴은 이름으로 시드를 잡아 항상 같은 모양이 나옵니다.

def _pat_none(draw, accent=None):
    """무늬 없음 — 그라데이션만."""


def _pat_circles(draw, accent=None):
    """배경 장식 원 (은은한 톤) — 기존 기본값."""
    deco = (255, 255, 255, 26)
    draw.ellipse([-160, 320, 420, 900], outline=deco, width=3)
    draw.ellipse([760, 130, 1290, 660], outline=deco, width=3)
    draw.ellipse([-220, 1420, 240, 1880], outline=deco, width=3)
    draw.ellipse([880, 1500, 1300, 1920], outline=deco, width=3)


def _pat_rings(draw, accent=None):
    """모서리에서 퍼지는 동심원 링."""
    deco = (255, 255, 255, 22)
    for cx, cy in ((160, 480), (940, 1420), (820, 320)):
        for r in (120, 210, 300, 390, 480):
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=deco, width=3)


def _pat_dots(draw, accent=None):
    """점 패턴 — 아래로 갈수록 점이 커지고 진해집니다."""
    step = 96
    for y in range(60, H, step):
        for x in range(60, W, step):
            t = y / H
            r = 5 + t * 7
            draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, int(12 + 26 * t)))


def _pat_grid(draw, accent=None):
    """격자."""
    line = (255, 255, 255, 15)
    for x in range(0, W + 1, 120):
        draw.line([x, 0, x, H], fill=line, width=2)
    for y in range(0, H + 1, 120):
        draw.line([0, y, W, y], fill=line, width=2)


def _pat_mesh(draw, accent=None):
    """점 격자 — 격자 교차점에 점."""
    _pat_grid(draw)
    for y in range(0, H + 1, 120):
        for x in range(0, W + 1, 120):
            draw.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(255, 255, 255, 30))


def _pat_diagonal(draw, accent=None):
    """사선 줄무늬."""
    line = (255, 255, 255, 13)
    for k in range(-H, W + H, 150):
        draw.line([k, 0, k + H, H], fill=line, width=6)


def _pat_stripes(draw, accent=None):
    """세로 줄무늬."""
    for x in range(0, W, 230):
        draw.rectangle([x, 0, x + 115, H], fill=(255, 255, 255, 9))


def _pat_waves(draw, accent=None):
    """물결."""
    line = (255, 255, 255, 20)
    for base in (330, 760, 1180, 1600):
        pts = [(x, base + math.sin(x / 220.0 + base) * 60) for x in range(0, W + 1, 20)]
        draw.line(pts, fill=line, width=4)


def _pat_bokeh(draw, accent=None):
    """빛 번짐(보케) — 크기가 다른 반투명 원."""
    rng = random.Random("bokeh-v1")
    for _ in range(18):
        x, y = rng.randint(0, W), rng.randint(0, H)
        r = rng.randint(50, 190)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, rng.randint(8, 22)))


def _pat_glow(draw, accent=None):
    """방사 광원 — 위아래에서 은은하게 빛납니다."""
    for cx, cy in ((W // 2, 240), (W // 2, 1800)):
        for r, a in ((620, 5), (470, 6), (340, 7), (220, 9), (120, 11)):
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, a))


def _pat_triangles(draw, accent=None):
    """흩뿌린 삼각형."""
    rng = random.Random("triangles-v1")
    for _ in range(14):
        x, y = rng.randint(-80, W), rng.randint(0, H)
        s = rng.randint(70, 180)
        draw.polygon([(x, y - s), (x + s * 0.87, y + s * 0.5), (x - s * 0.87, y + s * 0.5)],
                     outline=(255, 255, 255, 26))


def _pat_stars(draw, accent=None):
    """별빛 — 십자 반짝임과 작은 점."""
    rng = random.Random("stars-v1")
    for _ in range(26):
        x, y = rng.randint(0, W), rng.randint(0, H)
        s = rng.randint(8, 26)
        a = rng.randint(30, 70)
        draw.line([x - s, y, x + s, y], fill=(255, 255, 255, a), width=2)
        draw.line([x, y - s, x, y + s], fill=(255, 255, 255, a), width=2)
    for _ in range(30):
        x, y = rng.randint(0, W), rng.randint(0, H)
        r = rng.randint(2, 5)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 46))


def _pat_confetti(draw, accent=None):
    """색종이 — 액센트 색을 섞어 흩뿌립니다."""
    rng = random.Random("confetti-v1")
    acc = tuple(accent) if accent else (255, 255, 255)
    colors = [(255, 255, 255, 30), acc + (34,), acc + (24,)]
    for _ in range(36):
        x, y = rng.randint(0, W), rng.randint(0, H)
        w, h = rng.randint(14, 40), rng.randint(10, 26)
        color = rng.choice(colors)
        if rng.random() < 0.5:
            draw.rectangle([x, y, x + w, y + h], fill=color)
        else:
            draw.line([x, y, x + w, y + h], fill=color, width=4)


PATTERN_FUNCS = {
    "none": _pat_none,
    "circles": _pat_circles,
    "rings": _pat_rings,
    "dots": _pat_dots,
    "grid": _pat_grid,
    "mesh": _pat_mesh,
    "diagonal": _pat_diagonal,
    "stripes": _pat_stripes,
    "waves": _pat_waves,
    "bokeh": _pat_bokeh,
    "glow": _pat_glow,
    "triangles": _pat_triangles,
    "stars": _pat_stars,
    "confetti": _pat_confetti,
}


def draw_pattern(draw, name: str, accent=None) -> None:
    """이름에 맞는 배경 패턴을 그립니다. 모르는 이름은 무늬 없음으로 처리합니다."""
    fn = PATTERN_FUNCS.get(str(name or "").lower())
    if fn is not None:
        fn(draw, accent)


def draw_deco(draw):
    """예전 이름 — 은은한 원 패턴 (호환용)."""
    _pat_circles(draw)


def pattern_for_style(pattern: str, style_deco: bool) -> str:
    """auto 는 스타일 기본값으로 바꿉니다 — classic 은 circles, 나머지는 없음."""
    p = str(pattern or "auto").lower()
    if p == "auto":
        return "circles" if style_deco else "none"
    return p


# ---------------------------------------------------------------- slide ----
def render_slide(idx: int, total: int, unit_no: int, unit_info: dict, wd: list,
                 theme: str, font_path: str | None, style: str = "classic",
                 pattern: str = "auto") -> Image.Image:
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    ly = LAYOUT.get(style, LAYOUT["classic"])
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_pattern(draw, pattern_for_style(pattern, ly["deco"]), ACCENT_THEME)

    word, ipa, kor_pron, meaning, en_ex, kr_tr = wd[0], wd[1], wd[2], wd[3], wd[4], wd[5]

    # ── 상단: 유닛 칩 (classic/modern) 또는 제목 텍스트 (minimal) ──
    title_font = load_font(font_path, 40, bold=True)
    title = f"UNIT {unit_no} · {unit_info.get('title', '')}"
    if ly["chip"]:
        chip = (255, 255, 255, 36)  # rgba(255,255,255,0.14)
        tw = text_width(draw, title, title_font)
        badge_w = 80
        chip_w = int(22 + badge_w + 24 + tw + 40)
        cx0 = W // 2 - chip_w // 2
        draw.rounded_rectangle([cx0, 96, cx0 + chip_w, 174], radius=39, fill=chip)
        # 유닛 번호 뱃지 — 이모지 폰트에 의존하지 않아 어떤 PC에서도 □가 나오지 않습니다
        draw.rounded_rectangle([cx0 + 22, 100, cx0 + 22 + badge_w, 170], radius=35, fill=ACCENT_THEME + (255,))
        num = str(unit_no)
        num_font = load_font(font_path, 42, bold=True)
        nw = text_width(draw, num, num_font)
        draw_text_rich(draw, num, num_font, (255, 255, 255),
                       y=108, x=cx0 + 22 + (badge_w - nw) / 2)
        draw_text_rich(draw, title, title_font, (255, 255, 255), y=113,
                       x=cx0 + 22 + badge_w + 24)
    elif ly["unit_y"]:
        draw_text_rich(draw, title, title_font, (255, 255, 255, 190), y=ly["unit_y"])

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
    draw_text_rich(draw, word, word_font, (255, 255, 255), y=ly["word_y"])

    # ── IPA + 한글 발음 ──
    ipa_font = load_font(font_path, 54, bold=False)
    y = ly["ipa_y"]
    if ly["ipa_pill"]:
        y = draw_pill(draw, W // 2, y, ipa, ipa_font, (235, 240, 255), (0, 0, 0, 70))
    else:
        draw_text_rich(draw, ipa, ipa_font, (215, 225, 250), y=y)
        y += 80
    pron_font = load_font(font_path, 46, bold=False)
    if kor_pron:
        draw_text_rich(draw, f"발음: {kor_pron}", pron_font, (215, 225, 250), y=y + ly["pron_dy"])

    # ── 구분선 ──
    draw.line([200, ly["line_y"], W - 200, ly["line_y"]], fill=(255, 255, 255, 70), width=3)

    # ── 뜻 ──
    mean_font = load_font(font_path, 88, bold=True)
    mw = text_width(draw, meaning, mean_font)
    while mw > W - 160 and mean_font.size > 44:
        mean_font = load_font(font_path, mean_font.size - 8, bold=True)
        mw = text_width(draw, meaning, mean_font)
    draw_text_rich(draw, meaning, mean_font, ACCENT_THEME, y=ly["mean_y"])

    # ── 예문 ──
    label_font = load_font(font_path, 34, bold=True)
    lbl = "TOEIC 예문"
    draw_text_rich(draw, lbl, label_font, (255, 255, 255, 190), y=ly["label_y"], x=120)
    en_font = load_font(font_path, 50, bold=False)
    en_lines = wrap_text(en_ex, en_font, W - 240, draw)
    while len(en_lines) > 5 and en_font.size > 30:
        en_font = load_font(font_path, en_font.size - 4, bold=False)
        en_lines = wrap_text(en_ex, en_font, W - 240, draw)
    y = ly["en_y"]
    for line in en_lines[:5]:
        draw_text_rich(draw, line, en_font, (255, 255, 255), y=y, x=120)
        y += ly["en_dy"]

    # ── 해석 ──
    tr_font = load_font(font_path, 40, bold=False)
    tr_lines = wrap_text(kr_tr, tr_font, W - 240, draw)
    while len(tr_lines) > 3 and tr_font.size > 26:
        tr_font = load_font(font_path, tr_font.size - 4, bold=False)
        tr_lines = wrap_text(kr_tr, tr_font, W - 240, draw)
    y = min(y + 30, ly["tr_max_y"])
    for line in tr_lines[:3]:
        draw_text_rich(draw, line, tr_font, (200, 210, 235), y=y, x=120)
        y += ly["tr_dy"]

    # ── 푸터 ──
    foot_font = load_font(font_path, 44, bold=True)
    ft = "toeic.monster"
    draw_text_rich(draw, ft, foot_font, (255, 255, 255), y=1745)
    draw_dots(draw, total, idx)
    return img


# --------------------------------------------------------- intro/outro ----
INTRO_SEC = 2.5   # 인트로 슬라이드 길이(초) — --intro-sec 으로 변경, --no-intro 로 끄기
OUTRO_SEC = 3.0   # 아웃로(CTA) 슬라이드 길이(초) — --outro-sec 으로 변경, --no-outro 로 끄기

# 종류별 인트로 큰 제목 · 안내 줄
KIND_HOOKS = {
    "unit":      ("TOEIC 필수 어휘", "발음 · 예문 · 해석까지"),
    "idioms":    ("TOEIC 빈출 숙어", "구동사 · 숙어 126선"),
    "frequency": ("TOEIC 빈출 어휘", "기출 빈도순 200선"),
    "paraphrase": ("TOEIC 동의어 치환 퀴즈", "기출 퀴즈 200문제"),
}


def _fit_font(draw, text: str, font_path: str | None, size: int, max_w: int, min_size: int = 34):
    """텍스트가 max_w 를 넘지 않을 때까지 폰트를 줄여 반환합니다."""
    font = load_font(font_path, size, bold=True)
    while text_width(draw, text, font) > max_w and font.size > min_size:
        font = load_font(font_path, font.size - 8, bold=True)
    return font


def render_intro_slide(subtitle: str, theme: str, font_path: str | None,
                       kind: str = "unit", pattern: str = "auto") -> Image.Image:
    """인트로 슬라이드 — 첫 1초 안에 '무엇을 배우는지' 알려 주는 브랜드 훅."""
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_pattern(draw, pattern_for_style(pattern, True), ACCENT_THEME)

    head, tail = KIND_HOOKS.get(kind, KIND_HOOKS["unit"])

    chip_font = load_font(font_path, 42, bold=True)
    draw_pill(draw, W // 2, 330, "TOEIC · 매일 1분 암기", chip_font, (255, 255, 255), (0, 0, 0, 70))

    head_font = _fit_font(draw, head, font_path, 132, W - 120, 56)
    draw_text_rich(draw, head, head_font, (255, 255, 255), y=680)

    if subtitle:
        sub_font = _fit_font(draw, subtitle, font_path, 58, W - 160, 32)
        draw_text_rich(draw, subtitle, sub_font, ACCENT_THEME, y=890)

    tail_font = _fit_font(draw, tail, font_path, 46, W - 200, 28)
    draw_text_rich(draw, tail, tail_font, (215, 225, 250), y=1030)

    foot_font = load_font(font_path, 44, bold=True)
    draw_text_rich(draw, "toeic.monster", foot_font, (255, 255, 255), y=1745)
    return img


def render_outro_slide(theme: str, font_path: str | None,
                       pattern: str = "auto") -> Image.Image:
    """아웃로 슬라이드 — 사이트 유입 CTA(구독·팔로우·사이트 방문)."""
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_pattern(draw, pattern_for_style(pattern, True), ACCENT_THEME)

    chip_font = load_font(font_path, 42, bold=True)
    draw_pill(draw, W // 2, 330, "오늘의 학습 완료!", chip_font, (255, 255, 255), (0, 0, 0, 70))

    site = "toeic.monster"
    site_font = _fit_font(draw, site, font_path, 128, W - 120, 56)
    draw_text_rich(draw, site, site_font, (255, 255, 255), y=640)

    sub_font = _fit_font(draw, "무료 TOEIC 어휘 · 숙어 · 기출 퀴즈", font_path, 56, W - 160, 30)
    draw_text_rich(draw, "무료 TOEIC 어휘 · 숙어 · 기출 퀴즈", sub_font, ACCENT_THEME, y=850)

    cta_font = load_font(font_path, 46, bold=True)
    draw_pill(draw, W // 2, 1120, "구독 · 팔로우하면 매일 새 영상", cta_font, (255, 255, 255), (0, 0, 0, 70))

    note_font = _fit_font(draw, "발음 · 예문 · 해설은 사이트에서 무료", font_path, 42, W - 200, 26)
    draw_text_rich(draw, "발음 · 예문 · 해설은 사이트에서 무료", note_font, (215, 225, 250), y=1300)

    foot_font = load_font(font_path, 44, bold=True)
    draw_text_rich(draw, "toeic.monster", foot_font, (255, 255, 255), y=1745)
    return img


def slug(text: str, limit: int = 28) -> str:
    """표현을 파일명에 쓸 수 있게 바꿉니다(영문·숫자만 남기고 하이픈으로 이음)."""
    s = re.sub(r"[^a-z0-9]+", "-", str(text).lower()).strip("-")
    return s[:limit].strip("-") or "idioms"


def wrap_words(text: str, font, max_width: int, draw) -> list[str]:
    """단어 경계에서 줄을 나눕니다.

    공용 wrap_text 는 글자 단위로 잘라 표현이 단어 중간에서 끊깁니다(예: "take advanta/ge of").
    숙어는 덩어리로 읽혀야 뜻이 남으므로 표현 줄에만 이 함수를 씁니다.
    """
    lines: list[str] = []
    cur = ""
    for word in str(text).split():
        test = f"{cur} {word}".strip()
        if cur and text_width(draw, test, font) > max_width:
            lines.append(cur)
            cur = word
        else:
            cur = test
    if cur:
        lines.append(cur)
    return lines


def render_idiom_slide(idx: int, total: int, rank: int, wd: list,
                       theme: str, font_path: str | None, style: str = "classic",
                       pattern: str = "auto") -> Image.Image:
    """숙어 카드 슬라이드 — 표현·뜻·예문·해석만 담습니다.

    단어 카드(render_slide)와 그리는 내용이 달라 함수를 나누었고, 일부러 서로를 건드리지 않게
    두었습니다(매일 도는 단어 영상이 숙어 쪽 손질로 깨지지 않게).
    """
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    ly = IDIOM_LAYOUT.get(style, IDIOM_LAYOUT["classic"])
    deco = LAYOUT.get(style, LAYOUT["classic"])
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_pattern(draw, pattern_for_style(pattern, deco["deco"]), ACCENT_THEME)

    phrase, meaning, en_ex, kr_tr = wd[0], wd[3], wd[4], wd[5]

    # ── 상단: 숙어 칩(목록 순번 뱃지) 또는 제목 텍스트 ──
    title_font = load_font(font_path, 40, bold=True)
    title = "TOEIC 빈출 숙어"
    if deco["chip"]:
        chip = (255, 255, 255, 36)
        tw = text_width(draw, title, title_font)
        badge_w = 80
        chip_w = int(22 + badge_w + 24 + tw + 40)
        cx0 = W // 2 - chip_w // 2
        draw.rounded_rectangle([cx0, 96, cx0 + chip_w, 174], radius=39, fill=chip)
        draw.rounded_rectangle([cx0 + 22, 100, cx0 + 22 + badge_w, 170], radius=35,
                               fill=ACCENT_THEME + (255,))
        num = str(rank)
        num_font = load_font(font_path, 42, bold=True)
        nw = text_width(draw, num, num_font)
        draw_text_rich(draw, num, num_font, (255, 255, 255), y=108,
                       x=cx0 + 22 + (badge_w - nw) / 2)
        draw_text_rich(draw, title, title_font, (255, 255, 255), y=113,
                       x=cx0 + 22 + badge_w + 24)
    elif deco["unit_y"]:
        draw_text_rich(draw, title, title_font, (255, 255, 255, 190), y=deco["unit_y"])

    # ── modern: 글래스 카드 + 좌측 액센트 버 ──
    if deco["card"]:
        draw.rounded_rectangle([60, 180, W - 60, 1700], radius=56, fill=(255, 255, 255, 22))
        draw.rounded_rectangle([60, 180, 96, 1700], radius=18, fill=ACCENT_THEME + (70,))

    # ── 표현 (2줄까지, 넘치면 글자를 줄임) ──
    phrase_font = load_font(font_path, 128, bold=True)
    lines = wrap_words(phrase, phrase_font, W - 240, draw)
    while len(lines) > 2 and phrase_font.size > 52:
        phrase_font = load_font(font_path, phrase_font.size - 10, bold=True)
        lines = wrap_words(phrase, phrase_font, W - 240, draw)
    y = ly["phrase_y"]
    for line in lines[:2]:
        draw_text_rich(draw, line, phrase_font, (255, 255, 255), y=y)
        y += int(phrase_font.size * 1.24)

    # ── 뜻 ──
    mean_font = load_font(font_path, 84, bold=True)
    mw = text_width(draw, meaning, mean_font)
    while mw > W - 160 and mean_font.size > 40:
        mean_font = load_font(font_path, mean_font.size - 8, bold=True)
        mw = text_width(draw, meaning, mean_font)
    draw_text_rich(draw, meaning, mean_font, ACCENT_THEME, y=ly["mean_y"])

    # ── 구분선 ──
    draw.line([200, ly["line_y"], W - 200, ly["line_y"]], fill=(255, 255, 255, 70), width=3)

    # ── 예문 ──
    label_font = load_font(font_path, 34, bold=True)
    draw_text_rich(draw, "TOEIC 예문", label_font, (255, 255, 255, 190), y=ly["label_y"], x=120)
    en_font = load_font(font_path, 50, bold=False)
    en_lines = wrap_text(en_ex, en_font, W - 240, draw)
    while len(en_lines) > 5 and en_font.size > 30:
        en_font = load_font(font_path, en_font.size - 4, bold=False)
        en_lines = wrap_text(en_ex, en_font, W - 240, draw)
    y = ly["en_y"]
    for line in en_lines[:5]:
        draw_text_rich(draw, line, en_font, (255, 255, 255), y=y, x=120)
        y += ly["en_dy"]

    # ── 해석 ──
    tr_font = load_font(font_path, 40, bold=False)
    tr_lines = wrap_text(kr_tr, tr_font, W - 240, draw)
    while len(tr_lines) > 3 and tr_font.size > 26:
        tr_font = load_font(font_path, tr_font.size - 4, bold=False)
        tr_lines = wrap_text(kr_tr, tr_font, W - 240, draw)
    y = min(y + 30, ly["tr_max_y"])
    for line in tr_lines[:3]:
        draw_text_rich(draw, line, tr_font, (200, 210, 235), y=y, x=120)
        y += ly["tr_dy"]

    # ── 쏘터 ──
    foot_font = load_font(font_path, 44, bold=True)
    draw_text_rich(draw, "toeic.monster", foot_font, (255, 255, 255), y=1745)
    draw_dots(draw, total, idx)
    return img


def render_freq_slide(idx: int, total: int, rank: int, wd: list,
                      theme: str, font_path: str | None, style: str = "classic",
                      pattern: str = "auto") -> Image.Image:
    """빈도순 기출 어휘 카드 — 단어 카드와 같은 내용(단어·IPA·한글발음·뜻·예문·해석),
    상단 칩만 "TOEIC 빈출 어휘" + 목록 순번입니다.

    단어 카드(render_slide)와 내용은 같지만 칩 제목이 달라 함수를 나눴습니다.
    (매일 도는 단어 영상이 빈도 작업으로 깨지지 않게 하려는 기존 밤침을 따릅니다.)
    """
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    ly = LAYOUT.get(style, LAYOUT["classic"])
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_pattern(draw, pattern_for_style(pattern, ly["deco"]), ACCENT_THEME)

    word, ipa, kor_pron, meaning, en_ex, kr_tr = wd[0], wd[1], wd[2], wd[3], wd[4], wd[5]

    # ── 상단: 빈도 어휘 칩(목록 순번 뱃지) 또는 제목 텍스트 ──
    title_font = load_font(font_path, 40, bold=True)
    title = "TOEIC 빈출 어휘"
    if ly["chip"]:
        chip = (255, 255, 255, 36)
        tw = text_width(draw, title, title_font)
        badge_w = 80
        chip_w = int(22 + badge_w + 24 + tw + 40)
        cx0 = W // 2 - chip_w // 2
        draw.rounded_rectangle([cx0, 96, cx0 + chip_w, 174], radius=39, fill=chip)
        draw.rounded_rectangle([cx0 + 22, 100, cx0 + 22 + badge_w, 170], radius=35,
                               fill=ACCENT_THEME + (255,))
        num = str(rank)
        num_font = load_font(font_path, 42, bold=True)
        nw = text_width(draw, num, num_font)
        draw_text_rich(draw, num, num_font, (255, 255, 255), y=108,
                       x=cx0 + 22 + (badge_w - nw) / 2)
        draw_text_rich(draw, title, title_font, (255, 255, 255), y=113,
                       x=cx0 + 22 + badge_w + 24)
    elif ly["unit_y"]:
        draw_text_rich(draw, title, title_font, (255, 255, 255, 190), y=ly["unit_y"])

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
    draw_text_rich(draw, word, word_font, (255, 255, 255), y=ly["word_y"])

    # ── IPA + 한글 발음 ──
    ipa_font = load_font(font_path, 54, bold=False)
    y = ly["ipa_y"]
    if ipa:
        if ly["ipa_pill"]:
            y = draw_pill(draw, W // 2, y, ipa, ipa_font, (235, 240, 255), (0, 0, 0, 70))
        else:
            draw_text_rich(draw, ipa, ipa_font, (215, 225, 250), y=y)
            y += 80
    pron_font = load_font(font_path, 46, bold=False)
    if kor_pron:
        draw_text_rich(draw, f"발음: {kor_pron}", pron_font, (215, 225, 250), y=y + ly["pron_dy"])

    # ── 구분선 ──
    draw.line([200, ly["line_y"], W - 200, ly["line_y"]], fill=(255, 255, 255, 70), width=3)

    # ── 뜻 ──
    mean_font = load_font(font_path, 88, bold=True)
    mw = text_width(draw, meaning, mean_font)
    while mw > W - 160 and mean_font.size > 44:
        mean_font = load_font(font_path, mean_font.size - 8, bold=True)
        mw = text_width(draw, meaning, mean_font)
    draw_text_rich(draw, meaning, mean_font, ACCENT_THEME, y=ly["mean_y"])

    # ── 예문 ──
    label_font = load_font(font_path, 34, bold=True)
    draw_text_rich(draw, "TOEIC 예문", label_font, (255, 255, 255, 190), y=ly["label_y"], x=120)
    en_font = load_font(font_path, 50, bold=False)
    en_lines = wrap_text(en_ex, en_font, W - 240, draw)
    while len(en_lines) > 5 and en_font.size > 30:
        en_font = load_font(font_path, en_font.size - 4, bold=False)
        en_lines = wrap_text(en_ex, en_font, W - 240, draw)
    y = ly["en_y"]
    for line in en_lines[:5]:
        draw_text_rich(draw, line, en_font, (255, 255, 255), y=y, x=120)
        y += ly["en_dy"]

    # ── 해석 ──
    tr_font = load_font(font_path, 40, bold=False)
    tr_lines = wrap_text(kr_tr, tr_font, W - 240, draw)
    while len(tr_lines) > 3 and tr_font.size > 26:
        tr_font = load_font(font_path, tr_font.size - 4, bold=False)
        tr_lines = wrap_text(kr_tr, tr_font, W - 240, draw)
    y = min(y + 30, ly["tr_max_y"])
    for line in tr_lines[:3]:
        draw_text_rich(draw, line, tr_font, (200, 210, 235), y=y, x=120)
        y += ly["tr_dy"]

    # ── 푸터 ──
    foot_font = load_font(font_path, 44, bold=True)
    draw_text_rich(draw, "toeic.monster", foot_font, (255, 255, 255), y=1745)
    draw_dots(draw, total, idx)
    return img


# --------------------------------------------------- 동의어 치환 퀴즈 ----
# extra.js 의 paraphrase 항목은 prompt 한 줄에 「영어 문장 — 한국어 발문」이 함께 들어 있고,
# 표적 표현은 『』 로 감싸 두었습니다. 아래 도우미가 그 한 줄을 슬라이드가 쓸 조각으로 나눕니다.
TARGET_RE = re.compile(r"『([^』]+)』")


def parse_paraphrase(item: dict) -> dict:
    """동의어 치환 항목 → {문장, 표적 표현, 발문, 보기, 정답, 해설}."""
    prompt = str(item.get("prompt", ""))
    en, _, ko = prompt.partition("—")
    en, ko = en.strip(), ko.strip()
    m = TARGET_RE.search(en)
    target = m.group(1).strip() if m else ""
    sentence = TARGET_RE.sub(lambda mm: mm.group(1), en).strip()   # 『』 표시만 벗깁니다
    if not ko:
        ko = f"{target}와 의미가 가장 가까운 것은?" if target else "의미가 가장 가까운 것은?"
    return {"sentence": sentence, "target": target, "question": ko,
            "opts": [str(o) for o in (item.get("opts") or [])],
            "a": str(item.get("a", "")), "why": str(item.get("why", "")),
            "tr": str(item.get("ko", "")),
            "tag": str(item.get("tag", ""))}


def wrap_phrases(text: str, keep: str, font, max_width: int, draw) -> list[str]:
    """단어 경계로 줄을 바꾸고, keep 구문은 한 줄에 통으로 남깁니다.

    보기·강조 구문처럼 단어 중간이 끊기면 읽기 어렵거나 강조가 어긋나는 곳에 씁니다.
    (카드 본문은 글자 단위로 끊는 wrap_text 를 그대로 씁니다.)
    """
    marked = text.replace(keep, keep.replace(" ", "\x00")) if keep else text
    lines: list[str] = []
    cur = ""
    for word in marked.split(" "):
        test = f"{cur} {word}".strip()
        if cur and text_width(draw, test.replace("\x00", " "), font) > max_width:
            lines.append(cur.replace("\x00", " "))
            cur = word
        else:
            cur = test
    if cur:
        lines.append(cur.replace("\x00", " "))
    return lines


def draw_quiz_chip(draw, font_path: str | None, title: str, badge: str) -> None:
    """퀴즈 슬라이드 상단 칩(뱃지 + 제목) — 카드 칩과 같은 모양을 씁니다."""
    title_font = load_font(font_path, 40, bold=True)
    tw = text_width(draw, title, title_font)
    badge_w = 84
    chip_w = int(22 + badge_w + 24 + tw + 40)
    cx0 = W // 2 - chip_w // 2
    draw.rounded_rectangle([cx0, 96, cx0 + chip_w, 174], radius=39, fill=(255, 255, 255, 36))
    draw.rounded_rectangle([cx0 + 22, 100, cx0 + 22 + badge_w, 170], radius=35,
                           fill=ACCENT_THEME + (255,))
    badge_font = load_font(font_path, 38, bold=True)
    bw = text_width(draw, badge, badge_font)
    draw_text_rich(draw, badge, badge_font, (255, 255, 255), y=110,
                   x=cx0 + 22 + (badge_w - bw) / 2)
    draw_text_rich(draw, title, title_font, (255, 255, 255), y=113,
                   x=cx0 + 22 + badge_w + 24)


def draw_quiz_lines(draw, lines: list[str], target: str, font, y: float,
                    line_dy: float, base, hl) -> float:
    """줄 목록을 가운데 정렬로 그립니다. target 이 있으면 그 부분만 강조 색 + 밑줄로 표시합니다."""
    for line in lines:
        lw = text_width(draw, line, font)
        i = line.find(target) if target else -1
        if i >= 0:
            x = (W - lw) / 2
            for part, color in ((line[:i], base), (line[i:i + len(target)], hl),
                                (line[i + len(target):], base)):
                if not part:
                    continue
                draw_text_rich(draw, part, font, color, y=y, x=x)
                x += text_width(draw, part, font)
            tx = (W - lw) / 2 + text_width(draw, line[:i], font)
            ty = y + font.size + 10
            draw.line([tx, ty, tx + text_width(draw, target, font), ty],
                      fill=ACCENT_THEME + (230,), width=6)
        else:
            draw_text_rich(draw, line, font, base, y=y)
        y += line_dy
    return y


def render_quiz_question(idx: int, total: int, rank: int, q: dict,
                         theme: str, font_path: str | None, style: str = "classic",
                         pattern: str = "auto") -> Image.Image:
    """동의어 치환 문제 슬라이드 — 문장 속 표적 표현을 강조하고 보기 4개를 붙입니다."""
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    ly = LAYOUT.get(style, LAYOUT["classic"])
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_pattern(draw, pattern_for_style(pattern, ly["deco"]), ACCENT_THEME)
    draw_quiz_chip(draw, font_path, str(q.get("chip") or "TOEIC 동의어 치환 퀴즈"), str(rank))

    # ── 발문(한국어) ──
    q_font = load_font(font_path, 46, bold=True)
    y = 270.0
    for line in wrap_phrases(q["question"], "", q_font, W - 160, draw)[:2]:
        draw_text_rich(draw, line, q_font, (206, 216, 240), y=y)
        y += 64

    # ── 영어 문장 (표적 표현 강조) — 문장 대신 안내(note)만 있는 듣기형도 처리 ──
    if str(q.get("sentence") or "").strip():
        en_font = load_font(font_path, 56, bold=False)
        lines = wrap_phrases(q["sentence"], q["target"], en_font, W - 200, draw)
        while len(lines) > 5 and en_font.size > 34:
            en_font = load_font(font_path, en_font.size - 4, bold=False)
            lines = wrap_phrases(q["sentence"], q["target"], en_font, W - 200, draw)
        y = draw_quiz_lines(draw, lines[:5], q["target"], en_font, y + 40, 82,
                            (255, 255, 255), ACCENT_THEME)
    else:
        note = str(q.get("note") or "").strip()
        if note:
            note_font = load_font(font_path, 54, bold=True)
            for line in wrap_phrases(note, "", note_font, W - 200, draw)[:3]:
                draw_text_rich(draw, line, note_font, ACCENT_THEME, y=y + 40)
                y += 82

    # ── 보기 A~D ──
    y = max(y + 60, 940.0)
    letters = "ABCD"
    for oi, opt in enumerate(q["opts"][:4]):
        label = f"{letters[oi]}. {opt}"
        opt_font = load_font(font_path, 48, bold=True)
        while text_width(draw, label, opt_font) > W - 300 and opt_font.size > 30:
            opt_font = load_font(font_path, opt_font.size - 4, bold=True)
        draw.rounded_rectangle([110, y, W - 110, y + 124], radius=30, fill=(255, 255, 255, 28))
        draw_text_rich(draw, label, opt_font, (255, 255, 255), y=y + 32, x=160)
        y += 146

    # ── 푸터 ──
    foot_font = load_font(font_path, 44, bold=True)
    draw_text_rich(draw, "toeic.monster", foot_font, (255, 255, 255), y=1745)
    draw_dots(draw, total, idx)
    return img


def render_quiz_answer(idx: int, total: int, rank: int, q: dict,
                       theme: str, font_path: str | None, style: str = "classic",
                       pattern: str = "auto") -> Image.Image:
    """정답·해설 슬라이드 — 정답 표현과 왜 그런지를 보여 줍니다."""
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    ly = LAYOUT.get(style, LAYOUT["classic"])
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_pattern(draw, pattern_for_style(pattern, ly["deco"]), ACCENT_THEME)
    letters = "ABCD"
    letter = letters[q["opts"].index(q["a"])] if q["a"] in q["opts"][:4] else ""
    draw_quiz_chip(draw, font_path, "정답" + (f" · {letter}" if letter else ""), str(rank))

    # ── 정답 큰 글씨 — pair 를 지정하면 그대로(빈 값이면 생략), 기본은 「표제어 ≈ 정답」 ──
    if "pair" in q:
        pair = str(q.get("pair") or "")
    else:
        pair = f"{q['target']} ≈ {q['a']}" if q["target"] and q["a"] else (q["a"] or q["target"])
    if pair:
        pair_font = load_font(font_path, 76, bold=True)
        while text_width(draw, pair, pair_font) > W - 140 and pair_font.size > 32:
            pair_font = load_font(font_path, pair_font.size - 6, bold=True)
        draw_text_rich(draw, pair, pair_font, ACCENT_THEME, y=300)

    # ── 해설 ──
    y = 470.0
    why_font = load_font(font_path, 46, bold=False)
    for line in wrap_phrases(q["why"], q["target"], why_font, W - 180, draw)[:4]:
        draw_text_rich(draw, line, why_font, (235, 240, 250), y=y)
        y += 68

    # ── 원문 문장 (표적 표현 강조) — 정답 슬라이드용 문장(sentence_a)이 있으면 그것을 씁니다 ──
    sentence = str(q.get("sentence_a") if q.get("sentence_a") is not None else q.get("sentence") or "")
    target = str(q.get("target_a") if q.get("target_a") is not None else q.get("target") or "")
    en_font = load_font(font_path, 44, bold=False)
    lines = wrap_phrases(sentence, target, en_font, W - 200, draw)
    while len(lines) > 4 and en_font.size > 30:
        en_font = load_font(font_path, en_font.size - 4, bold=False)
        lines = wrap_phrases(sentence, target, en_font, W - 200, draw)
    y = max(y + 50, 900.0)
    draw.line([200, y - 34, W - 200, y - 34], fill=(255, 255, 255, 70), width=3)
    y = draw_quiz_lines(draw, lines[:4], target, en_font, y, 66, (222, 230, 245), ACCENT_THEME)

    # ── 예문 해석 ──
    tr = str(q.get("tr") or "")
    if tr:
        tr_font = load_font(font_path, 38, bold=False)
        tr_lines = wrap_phrases(tr, "", tr_font, W - 200, draw)
        draw_quiz_lines(draw, tr_lines[:3], "", tr_font, y + 34, 56, (200, 210, 235), (200, 210, 235))

    # ── 푸터 ──
    foot_font = load_font(font_path, 44, bold=True)
    draw_text_rich(draw, "toeic.monster", foot_font, (255, 255, 255), y=1745)
    draw_dots(draw, total, idx)
    return img


def render_list_slide(idx: int, total: int, rank: int, item: dict,
                      theme: str, font_path: str | None, style: str = "classic",
                      pattern: str = "auto") -> Image.Image:
    """리스트형 카드 한 장 — 큰 제목 + 부제 + 요점 목록.

    전략 가이드(공략 절)와 30일 스프린트(DAY 카드)가 같은 뼈대를 씁니다.
    퀴즈가 아닌 「읽고 저장」형이라 한 항목당 슬라이드 한 장입니다.
    """
    global ACCENT_THEME
    ACCENT_THEME = ACCENT[theme]
    ly = LAYOUT.get(style, LAYOUT["classic"])
    top, bottom = THEMES[theme]
    img = vertical_gradient((W, H), top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_pattern(draw, pattern_for_style(pattern, ly["deco"]), ACCENT_THEME)
    draw_quiz_chip(draw, font_path, str(item.get("chip") or "TOEIC 공략"), str(rank))

    # ── 글래스 카드 (modern 스타일) ──
    if ly["card"]:
        draw.rounded_rectangle([60, 180, W - 60, 1700], radius=56, fill=(255, 255, 255, 22))
        draw.rounded_rectangle([60, 180, 96, 1700], radius=18, fill=ACCENT_THEME + (70,))

    # ── 큰 제목 ──
    big = str(item.get("big") or "")
    big_font = load_font(font_path, 96, bold=True)
    big_lines = wrap_phrases(big, "", big_font, W - 220, draw)
    while len(big_lines) > 2 and big_font.size > 48:
        big_font = load_font(font_path, big_font.size - 8, bold=True)
        big_lines = wrap_phrases(big, "", big_font, W - 220, draw)
    y = 320.0
    for line in big_lines[:2]:
        draw_text_rich(draw, line, big_font, (255, 255, 255), y=y)
        y += big_font.size + 36

    # ── 부제 ──
    sub = str(item.get("sub") or "").strip()
    if sub:
        sub_font = load_font(font_path, 44, bold=True)
        sub_lines = wrap_phrases(sub, "", sub_font, W - 220, draw)
        y += 10
        for line in sub_lines[:2]:
            draw_text_rich(draw, line, sub_font, ACCENT_THEME, y=y)
            y += 66

    # ── 구분선 ──
    y += 30
    draw.line([160, y, W - 160, y], fill=(255, 255, 255, 70), width=3)
    y += 56

    # ── 요점 목록 — 푸터(y=1745)를 넘지 않도록 글자 크기를 줄이며 맞춥니다 ──
    bullets = [str(b) for b in (item.get("bullets") or []) if str(b).strip()][:4]
    body_font = load_font(font_path, 48, bold=False)
    body_lines: list[list[str]] = []
    if bullets:
        avail = 1700.0 - y
        while body_font.size > 28:
            body_lines = [wrap_phrases(b, "", body_font, W - 260, draw)[:3] for b in bullets]
            need = sum(len(ls) * (body_font.size + 30) + 26 for ls in body_lines)
            if need <= avail:
                break
            body_font = load_font(font_path, body_font.size - 4, bold=False)
    for lines in body_lines:
        draw_text_rich(draw, "•", body_font, ACCENT_THEME, y=y, x=130)
        for line in lines:
            draw_text_rich(draw, line, body_font, (255, 255, 255), y=y, x=185)
            y += body_font.size + 30
        y += 26

    # ── 푸터 ──
    foot_font = load_font(font_path, 44, bold=True)
    draw_text_rich(draw, "toeic.monster", foot_font, (255, 255, 255), y=1745)
    draw_dots(draw, total, idx)
    return img


def crop_zoom(img: Image.Image, scale: float) -> Image.Image:
    """중심 기준 scale 배율만큼 확대 크롭 (Ken Burns)."""
    cw, ch = int(W / scale), int(H / scale)
    x, y = (W - cw) // 2, (H - ch) // 2
    return img.crop((x, y, x + cw, y + ch)).resize((W, H), Image.LANCZOS)


# ---------------------------------------------------------------- tts -----
VOICE_GAP = 0.4  # 두 목소리 사이 무음(초) — 같은 문장이 두 번 읽히므로 구분을 준다
WORD_GAP = 0.4   # 단어와 예문 사이 무음(초) — 설치된 piper-tts 는 문장 사이 무음 기능이 없어
                 # 한 문자열로 합성하면 붙어서 읽으므로(실측 틈 0초) 개별 합성 후 여기에 끼워 넣는다


def _synthesize_windows_sapi(text: str, voice: str, out: Path) -> Path:
    """Windows에 설치된 내장 SAPI 음성으로 네트워크 없이 로컬 합성합니다.

    voice 가 설치된 Windows 음성 이름(예: "Microsoft David Desktop")이면 그 음성을 그대로 쓰고,
    아니면 언어·성별 힌트(en-US-JennyNeural 처럼)로 맞는 음성을 찾아 씁니다.
    """
    powershell = shutil.which("powershell") or shutil.which("pwsh")
    if not powershell:
        raise RuntimeError("PowerShell을 찾을 수 없습니다.")

    match = re.match(r"([a-z]{2}-[A-Z]{2})-", voice)
    culture = match.group(1) if match else "en-US"
    male_voice = re.search(
        r"(?i)(?:guy|ryan|thomas|davis|david|andrew|brian|christopher|eric|roger|"
        r"william|liam|george|james|michael|richard|daniel|kevin|mark|alex|aaron)",
        voice,
    ) is not None
    gender = "Male" if male_voice else "Female"
    wave = out.with_suffix(".wav")

    def ps_quote(value: str) -> str:
        return "'" + value.replace("'", "''") + "'"

    script = f"""
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {{
    $installed = @($synth.GetInstalledVoices() | Where-Object {{ $_.Enabled }})
    $targetCulture = {ps_quote(culture)}
    $targetGender = {ps_quote(gender)}
    $requested = {ps_quote(voice)}
    $selected = $null
    if ($requested) {{
        $selected = $installed | Where-Object {{ $_.VoiceInfo.Name -eq $requested }} | Select-Object -First 1
    }}
    if (-not $selected) {{
        $selected = $installed | Where-Object {{
            $_.VoiceInfo.Culture.Name -eq $targetCulture -and $_.VoiceInfo.Gender.ToString() -eq $targetGender
        }} | Select-Object -First 1
    }}
    if (-not $selected) {{
        $selected = $installed | Where-Object {{
            $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'en' -and $_.VoiceInfo.Gender.ToString() -eq $targetGender
        }} | Select-Object -First 1
    }}
    if (-not $selected) {{
        $selected = $installed | Where-Object {{ $_.VoiceInfo.Culture.Name -eq $targetCulture }} | Select-Object -First 1
    }}
    if (-not $selected) {{
        $selected = $installed | Where-Object {{ $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'en' }} | Select-Object -First 1
    }}
    if (-not $selected) {{ throw '설치된 영어 Windows 음성이 없습니다.' }}
    Write-Output ('SELECTED_VOICE=' + $selected.VoiceInfo.Name + '|' + $selected.VoiceInfo.Culture.Name + '|' + $selected.VoiceInfo.Gender)
    $synth.SelectVoice($selected.VoiceInfo.Name)
    $synth.SetOutputToWaveFile({ps_quote(str(wave))})
    $synth.Speak({ps_quote(text)})
    $synth.SetOutputToNull()
}} finally {{
    $synth.Dispose()
}}
"""
    encoded = base64.b64encode(script.encode("utf-16le")).decode("ascii")
    result = subprocess.run(
        [powershell, "-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", encoded],
        capture_output=True, text=True,
    )
    if result.returncode != 0 or not wave.exists() or wave.stat().st_size <= 44:
        wave.unlink(missing_ok=True)
        detail = (result.stderr or result.stdout or "음성 파일이 생성되지 않았습니다.").strip()
        raise RuntimeError(detail[-500:])
    selected = next((line.partition("=")[2] for line in result.stdout.splitlines()
                     if line.startswith("SELECTED_VOICE=")), "")
    if selected:
        log(f"Windows 내장 음성: {selected.replace('|', ' / ')}")
    return wave


def tts_speak(text: str, voice: str, out: Path, engine: str = "auto") -> Path:
    """TTS 로 낭독 음성(wav)을 만듭니다 — 어디까지나 이 PC에서 합성하고 온라인 TTS 는 쓰지 않습니다.

    engine: "piper"(로컬 Piper · 오프라인), "windows"(내장 SAPI),
            "auto"(음성 이름과 설치 상태로 판별 — 내려받은 로컬 음성이면 Piper).
    """
    real = resolve_tts_engine(engine, voice)
    if real == "piper":
        try:
            return _synthesize_piper(text, voice, out)
        except RuntimeError:
            raise
        except Exception as exc:
            raise RuntimeError(f"로컬 Piper TTS 실패({voice}): {exc}") from exc
    if sys.platform != "win32":
        raise RuntimeError("Windows 내장 TTS(SAPI)는 Windows 에서만 씁니다 — "
                           "--engine piper 로 로컬 TTS 를 쓰거나 --no-tts 로 끄세요.")
    try:
        return _synthesize_windows_sapi(text, voice, out)
    except Exception as exc:
        raise RuntimeError(f"Windows 내장 TTS 실패({voice}): {exc}") from exc


# 로컬 Piper — 음성 모델을 한 번만 올려 놓고 슬라이드마다 재사용합니다 (매번 올리면 슬라이드당 1~2초 손해).
_PIPER_SESSIONS: dict[str, object] = {}
_PIPER_FALLBACK_WARNED: set[str] = set()


def _piper_model(voice: str) -> tuple[str, "Path"]:
    """요청한 목소리의 .onnx 경로 — 내려받지 않은 이름이면 남녀 기본값으로 대체하고 알립니다."""
    path = piper_voice_path(voice)
    if path is not None:
        return str(voice), path
    fallback = piper_default_voice(
        male=bool(re.search(r"(?i)(david|ryan|guy|brian|george|male|andrew|thomas|joe|mike|norman)",
                            str(voice or ""))))
    if not fallback or piper_voice_path(fallback) is None:
        raise RuntimeError("내려받은 Piper 음성이 없습니다 — 원클릭 메뉴 31 또는 "
                           "`python -m piper.download_voices en_US-amy-medium "
                           "--download-dir promo/assets/tts` 로 내려받으세요.")
    if str(voice) not in _PIPER_FALLBACK_WARNED:
        _PIPER_FALLBACK_WARNED.add(str(voice))
        warn(f"요청한 목소리 '{voice}' 는 내려받은 Piper 음성이 아니라 '{fallback}' 로 씁니다 "
             "(메뉴 31 에서 바꿀 수 있습니다).")
    return fallback, piper_voice_path(fallback)  # type: ignore[return-value]


def _synthesize_piper(text: str, voice: str, out: Path) -> Path:
    """로컬 Piper(ONNX) 모델로 낭독 wav 를 만듭니다 — 인터넷·API 가 필요 없습니다."""
    try:
        from piper import PiperVoice
    except ImportError as exc:
        raise RuntimeError("piper-tts 가 미설치입니다 — pip install piper-tts (또는 --engine windows 로 SAPI 사용)") from exc
    label, model = _piper_model(voice)
    session = _PIPER_SESSIONS.get(str(model))
    if session is None:
        session = PiperVoice.load(str(model))
        _PIPER_SESSIONS.clear()          # 메모리 보호 — 한 번에 하나의 모델만 올려 둡니다
        _PIPER_SESSIONS[str(model)] = session
    with wave.open(str(out), "wb") as wf:
        session.synthesize_wav(text, wf)
    if not out.exists() or out.stat().st_size <= 44:
        out.unlink(missing_ok=True)
        raise RuntimeError("Piper 가 빈 wav 만 만들었습니다 (모델·텍스트 확인)")
    log(f"  로컬 Piper 음성: {label} ({out.name})")
    return out


def resolve_voices(voice: str, voice2: str, single: bool) -> list[str]:
    """실제로 쓸 목소리 목록을 돌려줍니다.

    기본은 첫 목소리 + 두 번째 목소리(남성)입니다.
    --single-voice 이거나 두 번째가 none/off 이거나 같은 목소리면 하나만 씁니다.
    """
    voices = [voice]
    second = (voice2 or "").strip()
    if not single and second and second.lower() not in ("none", "off", "-") and second != voice:
        voices.append(second)
    return voices


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


def build_audio(word: str, en_ex: str, voices: list[str], slide_dur: float, tmp: Path, i: int,
                engine: str = "auto", word_gap: float = WORD_GAP) -> tuple[Path, float]:
    """목소리별 TTS 를 만들어 차례로 이어 붙이고 슬라이드 길이에 맞춘 wav 로 변환합니다.

    단어와 예문은 각각 따로 합성한 뒤 word_gap 초의 무음을 끼워 붙입니다 —
    piper 는 문장 사이 무음을 넣지 않아 한 문자열로 합성하면 단어와 문장이 붙어 버립니다.
    두 목소리를 쓰면 같은 문장을 두 번 읽어 음성이 약 2배가 되고, 그만큼 슬라이드도 늘어납니다.
    (wav, 실제 슬라이드 길이) 반환.
    """
    gap = max(0.0, float(word_gap or 0.0))
    parts = [text for text in (str(word or "").strip(), str(en_ex or "").strip()) if text]
    if not parts:
        # 낱말·예문이 모두 비면 합성하지 않고 무음 슬라이드로 둡니다.
        build_silence(slide_dur, tmp, i)
        return tmp / f"audio_{i}.wav", slide_dur

    segments: list[tuple[Path, float]] = []   # (합성 wav, 그 파일 뒤에 붙일 무음 초)
    for vi, v in enumerate(voices):
        last_voice = vi == len(voices) - 1
        paths = [tts_speak(text, v, tmp / f"tts_{i}_{vi}_{pi}.wav", engine)
                 for pi, text in enumerate(parts)]
        for pi, path in enumerate(paths):
            trailing = 0.0
            if pi == 0 and len(paths) > 1:
                trailing += gap            # 단어 → 예문 사이 휴지
            if pi == len(paths) - 1 and not last_voice:
                trailing += VOICE_GAP      # 앞 목소리 → 다음 목소리 사이 휴지
            segments.append((path, trailing))

    # 휴지까지 더해 실제 음성 길이를 어림한다.
    audio_len = sum(probe_duration(p) + pad for p, pad in segments)
    dur = max(slide_dur, audio_len + 0.8)  # 음성이 길면 슬라이드 연장

    slide_wav = tmp / f"audio_{i}.wav"
    cmd = [_FFMPEG, "-y", "-hide_banner", "-loglevel", "error"]
    for p, _pad in segments:
        cmd += ["-i", str(p)]
    normalize = "aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo"
    if len(segments) == 1:
        pad = segments[0][1]
        fc = (f"[0:a]{normalize}" + (f",apad=pad_dur={pad:g}" if pad > 0 else "")
              + f",apad=whole_dur={dur}[a]")
    else:
        # 로컬 SAPI WAV와 Edge MP3의 샘플레이트·채널 수를 통일한 뒤 이어 붙입니다.
        head = ""
        for k, (_p, pad) in enumerate(segments):
            head += f"[{k}:a]{normalize}"
            if pad > 0:
                head += f",apad=pad_dur={pad:g}"
            head += f"[p{k}];"
        chain = "".join(f"[p{k}]" for k in range(len(segments)))
        fc = (f"{head}{chain}concat=n={len(segments)}:v=0:a=1[cat];"
              f"[cat]apad=whole_dur={dur}[a]")
    cmd += ["-filter_complex", fc, "-map", "[a]", "-ar", "44100", "-ac", "2",
            "-t", str(dur), str(slide_wav)]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0 or not slide_wav.exists() or slide_wav.stat().st_size == 0:
        detail = result.stderr.decode(errors="replace").strip()
        raise RuntimeError(f"TTS 오디오 병합 실패: {detail[-500:] or '출력 파일이 없습니다.'}")
    return slide_wav, dur


def build_silence(dur: float, tmp: Path, i: int) -> Path:
    """인트로·아웃로용 무음 wav — TTS 병합용 목록에 슬라이드 길이만큼 자리를 채웁니다."""
    out = tmp / f"audio_{i}.wav"
    subprocess.run([_FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
                    "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
                    "-t", f"{dur:.3f}", "-c:a", "pcm_s16le", str(out)], capture_output=True)
    return out


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


def write_sidecar(out: Path, *, kind: str, unit_no: int | None, items: list[list],
                  voices: list[str], quiz: list[dict] | None = None) -> None:
    """영상 옆에 항목 메타(`<이름>.json`)를 남깁니다.

    publish.py 가 이 파일을 읽어 제목·설명을 만듭니다. 이게 없으면 게시 단계가 남은 목록에서
    무작위로 하나를 골라, 영상에 없는 단어·숙어가 제목에 들어갑니다.
    저장에 실패해도 영상은 이미 만들어진 뒤라 게시를 막지 않고 알림만 남깁니다.
    """
    data = {
        "kind": kind,
        "unit": unit_no,
        "items": [{"term": w[0], "ipa": w[1], "meaning": w[3], "example": w[4], "translation": w[5]}
                  for w in items],
        "voices": voices,
        "created_at": now_iso(),
    }
    if quiz:
        # 퀴즈는 보기·발문까지 남겨야 게시 단계가 영상에 맞는 제목·설명을 만들 수 있습니다.
        # zip 과 같은 동작(짧은 쪽까지) — Python 3.8 에는 zip(strict=) 이 없습니다.
        for index, extra in enumerate(quiz):
            if index >= len(data["items"]):
                break
            data["items"][index].update(extra)
    try:
        out.with_suffix(".json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError as exc:
        warn(f"영상 메타를 저장하지 못했습니다({exc}) — 게시 제목은 기본값으로 만들어집니다.")


def build_ambient(dur: float, tmp: Path) -> Path | None:
    """부드러운 화음(ffmpeg lavfi)으로 영상이 무음이 되지 않도록 하는 배경 사운드를 만듭니다."""
    out = tmp / "ambient.wav"
    fade_out = max(1.5, dur - 2.0)
    fc = (f"[0:a][1:a][2:a]amix=inputs=3,lowpass=f=900,volume=2.5,"
          f"afade=t=in:st=0:d=1.5,afade=t=out:st={fade_out:.2f}:d=2[a]")
    r = subprocess.run([_FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
                        "-f", "lavfi", "-i", f"sine=frequency=220:duration={dur}",
                        "-f", "lavfi", "-i", f"sine=frequency=277.18:duration={dur}",
                        "-f", "lavfi", "-i", f"sine=frequency=329.63:duration={dur}",
                        "-filter_complex", fc, "-map", "[a]", "-ar", "44100", "-ac", "2",
                        str(out)], capture_output=True, text=True)
    if r.returncode != 0:
        warn(f"앰비언트 사운드 생성 실패(무음으로 진행): {r.stderr.strip()[-200:]}")
        return None
    return out


# ---------------------------------------------------------------- main ----
def main() -> None:
    ap = argparse.ArgumentParser(description="toeic.monster 단어 카드 쇼츠 영상 생성기 (1080x1920, 9:16)")
    ap.add_argument("--unit", type=int, help="유닛 번호 (1~30). --idioms 를 쓰면 생략합니다")
    ap.add_argument("--idioms", action="store_true",
                    help="유닛 단어 대신 숙어 126선(data/idioms.js)에서 만듭니다")
    ap.add_argument("--frequency", action="store_true",
                    help="유닛 단어 대신 빈도순 기출 어휘 200선(data/extra.js frequency)에서 만듭니다")
    ap.add_argument("--paraphrase", action="store_true",
                    help="동의어 치환 퀴즈 숏폼(data/extra.js paraphrase)을 만듭니다 — 한 문제당 문제·정답 2장")
    ap.add_argument("--kind", choices=sorted(KIND_SPECS),
                    help="새 포맷 쇼츠 종류 — confusables(혼동 어휘)·grammar(문법 빈칸)·numbers(숫자 듣기)·"
                         "traps(Part 2 함정)·minimal(발음 비교)·dictation(받아쓰기)·bizmail(비즈니스 이메일)·"
                         "drill(전치사·연결어)·strategy(전략 가이드)·wordparts(어원)·sprint(30일 스프린트)")
    ap.add_argument("--words", type=int, default=5, help="영상에 넣을 항목 수 — 단어/숙어 (기본 5)")
    ap.add_argument("--slide-sec", type=float, default=6.0, help="슬라이드당 길이 초 (기본 6)")
    ap.add_argument("--word-gap", type=float, default=WORD_GAP,
                    help=f"단어와 예문 사이 무음 초 (기본 {WORD_GAP:g}, 0 이면 붙여 읽음)")
    ap.add_argument("--out", help="출력 mp4 경로 (기본: assets/shorts/unitNN_shorts.mp4)")
    ap.add_argument("--bg", default="blue",
                    help="배경 테마 — 이름 또는 번호 (기본 blue, 목록은 --list-bg)")
    ap.add_argument("--pattern", default="auto",
                    help="배경 패턴 — 이름 또는 번호 (기본 auto — 카드 스타일 기본값, 목록은 --list-bg)")
    ap.add_argument("--style", default="classic",
                    help="카드 스타일 — 이름 또는 번호 (1=classic 2=modern 3=minimal)")
    ap.add_argument("--list-bg", action="store_true",
                    help="배경 테마·패턴·스타일 번호 목록을 출력하고 종료")
    ap.add_argument("--font", help="한국어 폰트 ttf/ttc 경로 (기본: 네이버 마루부리 — "
                                    "promo/fonts/MaruBuri-*.otf, 없으면 자동 내려받음)")
    ap.add_argument("--seed", type=int, help="단어 선택 시드 (재현용)")
    ap.add_argument("--index", type=int, help="특정 단어 인덱스만 사용 (0부터, 테스트용)")
    ap.add_argument("--allow-repeat", action="store_true",
                    help="이미 사용한 단어도 다시 사용 (중복 방지 무시)")
    ap.add_argument("--tts", dest="tts", action="store_true", default=True,
                    help="영어 TTS 음성(기본 켜짐 — 로컬 TTS 만 사용, 인터넷 불필요)")
    ap.add_argument("--no-tts", dest="tts", action="store_false", help="영어 TTS 끄기")
    ap.add_argument("--engine", default=DEFAULT_TTS_ENGINE,
                    choices=[key for key, _label in TTS_ENGINES],
                    help="TTS 엔진: auto(로컬 우선·없으면 Windows) / piper(로컬 Piper, 오프라인) / windows(내장 SAPI)")
    ap.add_argument("--voice", default=None,
                    help="첫 번째 TTS 목소리 — 여성 (기본: 엔진에 맞는 자동 선택)")
    ap.add_argument("--voice2", default=None,
                    help="두 번째 TTS 목소리 — 남성 (기본: 엔진에 맞는 자동 선택). none 이면 하나만 사용")
    ap.add_argument("--single-voice", action="store_true",
                    help="한 목소리만 쓰기 (기본은 여성 + 남성 두 목소리)")
    ap.add_argument("--music", help="배경음악 오디오 파일(mp3/wav) 경로 (선택)")
    ap.add_argument("--music-volume", type=float, default=0.15, help="배경음악 볼륨 0~1 (기본 0.15)")
    ap.add_argument("--no-ambient", action="store_true",
                    help="기본 배경 사운드(앰비언트) 끄기 — --tts/--music 없이는 무음 영상이 됩니다")
    ap.add_argument("--no-intro", action="store_true", help="인트로 슬라이드 끄기")
    ap.add_argument("--intro-sec", type=float, default=INTRO_SEC, help=f"인트로 길이 초 (기본 {INTRO_SEC:g})")
    ap.add_argument("--no-outro", action="store_true", help="아웃로(CTA) 슬라이드 끄기")
    ap.add_argument("--outro-sec", type=float, default=OUTRO_SEC, help=f"아웃로 길이 초 (기본 {OUTRO_SEC:g})")
    ap.add_argument("--dry-run", action="store_true", help="계획만 출력하고 종료")
    args = ap.parse_args()

    if args.list_bg:
        log("\n🎨 배경 테마 (--bg 에 번호 또는 이름)")
        for i, (name, label) in enumerate(theme_choices(), 1):
            log(f"  {i:2d}. {name:<10} — {label}")
        log("\n🎨 배경 패턴 (--pattern 에 번호 또는 이름)")
        for i, (name, label) in enumerate(pattern_choices(), 1):
            log(f"  {i:2d}. {name:<10} — {label}")
        log("\n🎨 카드 스타일 (--style 에 번호 또는 이름)")
        for i, name in enumerate(STYLE_NAMES, 1):
            label = {"classic": "기본 카드 레이아웃", "modern": "글래스 카드 + 액센트 바",
                     "minimal": "깔끔한 미니멀"}.get(name, name)
            log(f"  {i:2d}. {name:<10} — {label}")
        return

    theme = resolve_theme(args.bg)
    if not theme:
        sys.exit(f"지원하지 않는 배경 테마입니다: {args.bg!r} — --list-bg 로 목록을 확인하세요.")
    args.bg = theme
    pattern = resolve_pattern(args.pattern)
    if not pattern:
        sys.exit(f"지원하지 않는 배경 패턴입니다: {args.pattern!r} — --list-bg 로 목록을 확인하세요.")
    args.pattern = pattern
    style = resolve_style(args.style)
    if not style:
        sys.exit(f"지원하지 않는 카드 스타일입니다: {args.style!r} — 1=classic 2=modern 3=minimal")
    args.style = style

    if not _PIL_OK:
        sys.exit("Pillow 미설치 — promo_center.bat setup (또는 pip install -r requirements.txt) 을 먼저 실행하세요")

    # 기본 폰트: 네이버 마루부리 — 파일이 없으면 받고, --font 를 주면 그 폰트를 씁니다.
    if not args.font:
        ensure_maruburi()
        log(f"기본 폰트: {default_font_label()}")

    # TTS 엔진·목소리 — auto 는 내려받은 로컬(Piper) 음성이 있으면 로컬, 없으면 Windows 내장입니다.
    engine_req = normalize_tts_engine(args.engine)
    first_engine = resolve_tts_engine(engine_req, args.voice or "")
    if not args.voice:
        args.voice = piper_default_voice() if first_engine == "piper" else DEFAULT_VOICE
    engine = resolve_tts_engine(engine_req, args.voice)
    if not args.voice2:
        args.voice2 = piper_default_voice(male=True) if engine == "piper" else DEFAULT_VOICE2

    if args.tts:
        if engine == "piper":
            if not piper_available():
                sys.exit("TTS 엔진 piper 를 쓰려면 piper-tts 가 필요합니다 — pip install piper-tts "
                         "(또는 --engine windows 로 변경)")
            if not list_piper_voices():
                sys.exit("내려받은 Piper 음성이 없습니다 — 원클릭 메뉴 31 또는 "
                         "`python -m piper.download_voices en_US-amy-medium "
                         "--download-dir promo/assets/tts` 로 내려받으세요.")
        elif sys.platform != "win32":
            sys.exit("쇼츠 낭독의 Windows 내장 TTS(SAPI)는 Windows 에서만 씁니다 — "
                     "--engine piper 로 로컬 TTS 를 쓰거나 --no-tts 로 끄세요.")

    voices = resolve_voices(args.voice, args.voice2, args.single_voice)

    if not args.idioms and not args.frequency and not args.paraphrase and not args.kind and args.unit is None:
        sys.exit("--unit 을 지정하거나, 숙어는 --idioms, 빈도 어휘는 --frequency, "
                 "동의어 치환 퀴즈는 --paraphrase, 새 포맷은 --kind 를 쓰세요.")

    if args.idioms:
        rows = load_idioms() or []
        if not rows:
            sys.exit("숙어 데이터를 읽을 수 없습니다 (data/idioms.js 확인).")
        # 숙어 4필드를 단어 카드와 같은 모양으로 늘려 TTS·중복 기록이 같은 자리를 쓰게 합니다.
        items = [[str(r[0]) if len(r) > 0 else "",
                  "", "",
                  str(r[1]) if len(r) > 1 else "",
                  str(r[2]) if len(r) > 2 else "",
                  str(r[3]) if len(r) > 3 else "",
                  "",
                  i + 1]                      # 목록 순번(칩 뱃지용)
                 for i, r in enumerate(rows)]
        bucket: int | str = IDIOM_BUCKET  # posted.json 의 words 키
        unit_no, unit_info = 0, {}
        source_label = "숙어"
        kind = "idioms"
    elif args.frequency:
        rows = load_frequency() or []
        if not rows:
            sys.exit("빈도 어휘 데이터를 읽을 수 없습니다 (data/extra.js frequency 확인).")
        # [단어, IPA, 한글발음, 뜻, 예문, 해석, 예문한글발음] + 목록 순번(칩 뱃지용)
        items = [[str(r[0]), str(r[1]), str(r[2]), str(r[3]), str(r[4]), str(r[5]), str(r[6]), i + 1]
                 for i, r in enumerate(rows)]
        bucket: int | str = FREQUENCY_BUCKET  # posted.json 의 words 키
        unit_no, unit_info = 0, {}
        source_label = "빈도 어휘"
        kind = "frequency"
    elif args.paraphrase:
        rows = load_paraphrase() or []
        if not rows:
            sys.exit("동의어 치환 데이터를 읽을 수 없습니다 (data/extra.js paraphrase 확인).")
        # 단어 카드와 같은 8칸 모양으로 늘려 TTS·중복 기록이 같은 자리를 쓰게 하고,
        # 퀴즈에만 필요한 조각(보기·발문)은 9번째 칸에 답습니다.
        items = []
        for r in rows:
            q = parse_paraphrase(r)
            if not q["sentence"] or not q["a"] or len(q["opts"]) < 2:
                continue
            items.append([q["target"], "", "", q["a"], q["sentence"], q["why"], "",
                          len(items) + 1, q])
        if not items:
            sys.exit("쓸 수 있는 동의어 치환 항목이 없습니다 (prompt·opts·정답 확인).")
        bucket: int | str = PARAPHRASE_BUCKET  # posted.json 의 words 키
        unit_no, unit_info = 0, {}
        source_label = "동의어 치환"
        kind = "paraphrase"
        log(f"퀴즈 항목 {len(items)}개 (전체 {len(rows)}개 중 사용 가능)")
    elif args.kind:
        rows = load_kind_rows(args.kind) or []
        if not rows:
            sys.exit(f"{args.kind} 데이터를 읽을 수 없습니다 (data/ 폴더의 {args.kind} 소스 확인).")
        spec = KIND_SPECS[args.kind]
        items = []
        for i, r in enumerate(rows):
            r["chip"] = spec["chip"]          # 문제 슬라이드 상단 칩 제목
            items.append([r["term"], "", "", r["meaning"], r["example"], r["translation"], "",
                          i + 1, r])
        bucket: int | str = args.kind  # posted.json 의 words 키
        unit_no, unit_info = 0, {}
        source_label = spec["label"]
        kind = args.kind
        log(f"{source_label} 항목 {len(items)}개 (레이아웃: "
            + ("문제 → 정답 2장" if spec["layout"] == "quiz2" else "카드 1장") + ")")
    else:
        unit_no = args.unit
        words = load_unit_words(unit_no)
        if not words:
            sys.exit(f"UNIT {unit_no} 데이터를 읽을 수 없습니다 (data/unit{unit_no:02d}.js 확인).")
        items = words
        bucket = unit_no
        unit_info = load_unit_info().get(unit_no, {})
        source_label = f"UNIT {unit_no}"
        kind = "unit"

    rng = random.Random(args.seed)
    if args.index is not None:
        if args.index < 0 or args.index >= len(items):
            sys.exit(f"인덱스 {args.index} 는 범위 밖 (0~{len(items)-1}).")
        picked = [items[args.index]]
    else:
        pool = items
        if not args.allow_repeat:
            used = posted_words_for_unit(bucket)
            remaining = [w for w in items if normalize_word(w[0]) not in used]
            if remaining:
                if len(remaining) < len(items):
                    log(f"중복 방지: 이미 사용한 항목 {len(items) - len(remaining)}개를 제외하고 "
                        f"{len(remaining)}개 중에서 선택")
                pool = remaining
            elif used:
                warn(f"{source_label} 을 모두 사용했습니다 — --reset-posted 로 초기화하거나 "
                     f"--allow-repeat 로 다시 사용할 수 있습니다. 전체에서 선택합니다.")
        n = min(args.words, len(pool))
        picked = rng.sample(pool, n)

    if args.paraphrase:
        # 정답이 항상 A 에 몰리지 않도록 문제마다 보기 순서를 섞습니다.
        # 슬라이드 렌더링·메타(*.json)·게시 설명이 모두 이 순서를 그대로 쓰므로 영상과 설명이 일치합니다.
        # --seed 를 지정하면 같은 시드에서 항상 같은 순서가 나옵니다.
        for w in picked:
            opts = list(w[8].get("opts") or [])
            w[8]["opts"] = rng.sample(opts, len(opts)) if opts else []

    music = Path(args.music) if args.music else None
    if music is not None:
        music = music if music.is_absolute() else PROMO / music
        if not music.exists():
            sys.exit(f"배경음악 파일을 찾을 수 없습니다: {music}")
        if not 0.0 < args.music_volume <= 1.0:
            sys.exit("--music-volume 은 0 초과 1 이하로 지정해 주세요.")

    # 퀴즈는 한 문제가 「문제 → 정답」 두 장이라 슬라이드 수가 항목 수의 두 배입니다.
    slide_count = len(picked) * (2 if is_quiz_kind(kind) else 1)
    intro_sec = 0.0 if args.no_intro else max(0.0, args.intro_sec)
    outro_sec = 0.0 if args.no_outro else max(0.0, args.outro_sec)
    total_dur = slide_count * args.slide_sec + intro_sec + outro_sec
    if args.out:
        out = Path(args.out)
    elif args.idioms:
        # 숙어는 유닛 번호가 없어 첫 표현을 파일명에 넣습니다(같은 파일 덮어쓰기 방지).
        out = OUT_DIR / f"idioms_{slug(picked[0][0])}_shorts.mp4"
    elif args.frequency:
        # 빈도 어휘도 유닛 번호가 없어 첫 표제어를 파일명에 넣습니다.
        out = OUT_DIR / f"frequency_{slug(picked[0][0])}_shorts.mp4"
    elif args.paraphrase:
        # 퀴즈도 유닛 번호가 없어 첫 표적 표현을 파일명에 넣습니다.
        out = OUT_DIR / f"quiz_{slug(picked[0][0])}_shorts.mp4"
    elif kind in KIND_SPECS:
        # 새 포맷도 첫 항목을 파일명에 넣어 배치끼리 덮어쓰지 않습니다.
        out = OUT_DIR / f"{kind}_{slug(picked[0][0])}_shorts.mp4"
    else:
        out = OUT_DIR / f"unit{unit_no:02d}_shorts.mp4"
    out = out if out.is_absolute() else PROMO / out
    out.parent.mkdir(parents=True, exist_ok=True)

    log("=" * 62)
    card_label = ({"unit": "단어 카드", "idioms": "숙어 카드", "frequency": "빈도 어휘 카드",
                   "paraphrase": "동의어 치환 퀴즈"}.get(kind)
                  or KIND_SPECS[kind]["label"])   # 아래 '… 쇼츠 생성' 과 겹치지 않게 라벨만
    log(f"🎬 {card_label} 쇼츠 생성" + ("  (dry-run)" if args.dry_run else ""))
    log("=" * 62)
    if kind == "unit":
        log(f"유닛  : UNIT {unit_no} {unit_info.get('icon', '')} {unit_info.get('title', '')}")
    else:
        ranks = ", ".join(str(w[7]) for w in picked[:6]) + (" …" if len(picked) > 6 else "")
        log(f"소스  : {source_label} {len(items)}개 중 선택 (목록 순번 {ranks})")
    log(f"{source_label if kind != 'unit' else '단어'}  : {len(picked)}개 ({', '.join(w[0] for w in picked[:6])}{' …' if len(picked) > 6 else ''})")
    if is_quiz_kind(kind):
        log(f"구성  : 문제 {len(picked)}개 · 슬라이드 {slide_count}장 (문제 → 정답 순서)")
    elif kind_layout(kind) == "list1":
        log(f"구성  : 카드 {len(picked)}장 (항목당 1장)")
    log(f"길이  : 약 {total_dur:.0f}초 ({slide_count}장 × {args.slide_sec:g}초"
        + (f" + 인트로 {intro_sec:g}초" if intro_sec else "")
        + (f" + 아웃로 {outro_sec:g}초" if outro_sec else "") + f"), {FPS}fps")
    if intro_sec or outro_sec:
        log("구성  : " + " · ".join(x for x in (["인트로"] if intro_sec else [])
                               + ["본문"] + (["아웃로(CTA)"] if outro_sec else [])))
    # TTS 는 목소리를 두 번 읽어 슬라이드가 늘어나므로, Shorts 60초 예산을 미리 알려 줍니다.
    est = intro_sec + outro_sec + slide_count * args.slide_sec * (1.8 if args.tts else 1.0)
    if est > 60:
        warn(f"예상 길이가 약 {est:.0f}초로 Shorts 60초를 넘을 수 있습니다 — "
             "--words 축소 · --single-voice · --no-intro/--no-outro 를 검토하세요.")
    log(f"출력  : {out} ({W}x{H}, 9:16 세로)")
    log(f"배경  : 테마 {args.bg} ({THEME_LABELS.get(args.bg, '')}) · 패턴 {args.pattern}"
        f" ({PATTERN_LABELS.get(args.pattern, '')}) · 스타일 {args.style}")
    if args.tts:
        engine_label = ("로컬 Piper TTS · 오프라인(인터넷 불필요)" if engine == "piper"
                        else "Windows 내장 TTS(SAPI) · 네트워크 불필요")
        log(f"음성  : {engine_label} (엔진 {engine} · {' + '.join(voices)})")
    else:
        log("음성  : 없음 (--no-tts 로 끔)")
    if args.tts and len(voices) > 1:
        log(f"        {len(voices)}개 목소리가 같은 문장을 이어 읽습니다 — 음성이 약 2배라 슬라이드가 길어집니다")
        log("        짧게 만들려면 --words 를 줄이거나 --single-voice 로 한 목소리만 쓰세요")
    if music:
        log(f"배경음악: {music} (볼륨 {args.music_volume:g})")
    elif not args.tts and not args.no_ambient:
        log("배경음악: 기본 앰비언트 사운드 (--no-ambient 로 끄기)")
    if args.dry_run:
        log("\n실제 생성하려면 --dry-run 을 빼고 실행하세요.")
        print_remaining(HIGHLIGHT_KEY.get(kind))
        return

    tmp = Path(tempfile.mkdtemp(prefix="toeic_shorts_"))
    try:
        # ── 슬라이드 렌더링 + 프레임 출력 ──
        # (그림, (낭독할 낱말, 낭독할 문장)) 쌍으로 만들어 두면 아래 루프가 종류를 몰라도 됩니다.
        # 퀴즈는 한 문제가 문제·정답 두 장이라 picked 와 길이가 다릅니다.
        # (그림, (낭독할 낱말, 낭독할 문장), 기본 길이) — say 가 None 이면 무음 슬라이드(인트로·아웃로).
        plan: list[tuple[Image.Image, tuple[str, str] | None, float]] = []
        try:
            if intro_sec:
                if kind == "unit":
                    intro_sub = f"UNIT {unit_no} · {unit_info.get('title', '')}".strip(" ·")
                else:
                    first_term = str(picked[0][0])
                    intro_sub = f"{first_term} 외 {len(picked) - 1}개" if len(picked) > 1 else first_term
                plan.append((render_intro_slide(intro_sub, args.bg, args.font, kind, args.pattern),
                             None, intro_sec))
            if is_quiz_kind(kind):
                for i, w in enumerate(picked):
                    q = w[8]
                    # 낭독 텍스트 — 듣기형은 speak 로 따로 지정하고, 없으면 화면에 보이는 내용을 읽습니다.
                    say_q = tuple(q["speak"]) if q.get("speak") else (q["target"], q["sentence"])
                    say_a = tuple(q["speak_a"]) if q.get("speak_a") else (q["a"], "")
                    plan.append((render_quiz_question(i * 2, slide_count, w[7], q, args.bg, args.font,
                                                     args.style, args.pattern),
                                 say_q, args.slide_sec))
                    plan.append((render_quiz_answer(i * 2 + 1, slide_count, w[7], q, args.bg, args.font,
                                                   args.style, args.pattern),
                                 say_a, args.slide_sec))
            elif kind_layout(kind) == "list1":
                for i, w in enumerate(picked):
                    r = w[8]
                    say = tuple(r["speak"]) if r.get("speak") else (r["term"], "")
                    card = {"chip": r.get("chip") or KIND_SPECS[kind]["chip"],
                            "big": r["term"], "sub": r.get("sub", ""), "bullets": r.get("bullets", [])}
                    plan.append((render_list_slide(i, len(picked), w[7], card, args.bg, args.font,
                                                   args.style, args.pattern),
                                 say, args.slide_sec))
            elif args.idioms:
                plan += [(render_idiom_slide(i, len(picked), w[7], w, args.bg, args.font, args.style,
                                             args.pattern),
                          (w[0], w[4]), args.slide_sec) for i, w in enumerate(picked)]
            elif args.frequency:
                plan += [(render_freq_slide(i, len(picked), w[7], w, args.bg, args.font, args.style,
                                            args.pattern),
                          (w[0], w[4]), args.slide_sec) for i, w in enumerate(picked)]
            else:
                plan += [(render_slide(i, len(picked), unit_no, unit_info, w, args.bg, args.font, args.style,
                                       args.pattern),
                          (w[0], w[4]), args.slide_sec) for i, w in enumerate(picked)]
            if outro_sec:
                plan.append((render_outro_slide(args.bg, args.font, args.pattern), None, outro_sec))
        except RuntimeError as exc:
            fail(str(exc))
            sys.exit(2)
        log("슬라이드 렌더링 완료 — 프레임 생성 중...")

        frame_files: list[Path] = []
        prev_last = None
        tts_failed = False
        for si, (slide, say, base_dur) in enumerate(plan):
            dur = base_dur
            if args.tts and not tts_failed:
                if say is None:
                    build_silence(base_dur, tmp, si)  # 인트로·아웃로 — TTS 병합용 무음 자리를 채웁니다
                else:
                    try:
                        wav, dur = build_audio(say[0], say[1], voices, base_dur, tmp, si, engine,
                                                args.word_gap)
                        if dur > base_dur:
                            log(f"   · {say[0]}: 음성 {dur - 0.8:.1f}초 → 슬라이드 연장")
                    except Exception as exc:
                        tts_failed = True
                        warn(f"TTS 음성 생성 실패({exc}) — 앰비언트 사운드로 대체합니다.")
                        dur = base_dur
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

        # ── TTS·배경음악·앰비언트 병합 ──
        tts_wav = None
        if args.tts and not tts_failed:
            audio_files = [tmp / f"audio_{i}.wav" for i in range(len(plan))]
            concat_list = tmp / "audio_list.txt"
            concat_list.write_text(
                "".join(f"file '{af.as_posix()}'\n" for af in audio_files), encoding="utf-8")
            tts_wav = tmp / "full_audio.wav"
            if not run_ffmpeg(["-f", "concat", "-safe", "0", "-i", str(concat_list),
                               "-c", "copy", str(tts_wav)]):
                return
        if tts_wav is None and music is None and not args.no_ambient:
            ambient = build_ambient(total_dur, tmp)
            if ambient is not None:
                if not run_ffmpeg(["-i", str(silent), "-i", str(ambient),
                                   "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                                   "-shortest", str(out)]):
                    return
            elif not mix_final(silent, tts_wav, music, args.music_volume, out):
                return
        else:
            if not mix_final(silent, tts_wav, music, args.music_volume, out):
                return

        size_mb = out.stat().st_size / (1024 * 1024)
        ok(f"생성 완료: {out} ({size_mb:.1f}MB, {W}x{H})")
        # 퀴즈·새 포맷은 w[8] 에 슬라이드 정보가 있어 사이드카에 함께 남깁니다 —
        # 게시 단계가 이 정보로 영상과 어긋나지 않는 제목·설명을 만듭니다.
        extras = None
        if picked and len(picked[0]) > 8:
            extras = []
            for w in picked:
                q = w[8]
                extras.append({"question": q.get("question", ""), "options": q.get("opts", []),
                               "tag": q.get("tag", ""), "ko": q.get("tr", ""),
                               "pair": q.get("pair") if q.get("pair") is not None else "",
                               "note": q.get("note", ""), "title_head": q.get("title_head", ""),
                               "sub": q.get("sub", ""), "bullets": q.get("bullets", [])})
        write_sidecar(out, kind=kind,
                      unit_no=None if kind != "unit" else unit_no,
                      items=picked, voices=voices if args.tts else [],
                      quiz=extras)
        if not args.allow_repeat:
            added = mark_words_posted(bucket, [w[0] for w in picked])
            if added:
                log(f"🔁 중복 방지 기록: {source_label} 항목 {added}개 저장 ({POSTED_FILE.name})")
        # 이번에 만든 종류를 최근 이력에 남깁니다 — 다음 추천이 같은 종류에 몰리지 않게 합니다.
        record_content_created(bucket)
        print_remaining(HIGHLIGHT_KEY.get(kind))
        rel = out.relative_to(PROMO)
        if args.idioms:
            log(f"\n바로 배포: python publish.py --video {rel} --idioms --dry-run"
                "  (제목·설명은 영상 옆 메타로 자동 생성됩니다)")
        elif args.frequency:
            log(f"\n바로 배포: python publish.py --video {rel} --frequency --dry-run"
                "  (제목·설명은 영상 옆 메타로 자동 생성됩니다)")
        elif args.paraphrase:
            log(f"\n바로 배포: python publish.py --video {rel} --paraphrase --dry-run"
                "  (제목·설명은 영상 옆 메타로 자동 생성됩니다)")
        elif kind in KIND_SPECS:
            log(f"\n바로 배포: python publish.py --video {rel} --kind {kind} --dry-run"
                "  (제목·설명은 영상 옆 메타로 자동 생성됩니다)")
        else:
            log(f"\n바로 배포: python publish.py --video {rel} --unit {unit_no}"
                + (" --dry-run 으로 먼저 확인!" if args.tts else " (--dry-run 으로 미리 확인 추천)"))
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()