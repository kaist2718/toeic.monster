#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
toeic.monster 홍보 자동 배포 — YouTube Shorts / Instagram Reels / TikTok 원클릭 게시

사용법:
  python publish.py --video assets/shorts/unit01.mp4 --unit 1
  python publish.py --video assets/shorts/my.mp4 --title "제목" --desc "설명"
  python publish.py --video assets/shorts/my.mp4 --platforms yt,ig --youtube-privacy unlisted
  python publish.py --video assets/shorts/idioms_x.mp4 --idioms   # 숙어 영상용 제목·설명
  python publish.py --video assets/shorts/quiz_x.mp4 --paraphrase # 동의어 치환 퀴즈 영상용 제목·설명
  python publish.py --dry-run                       # 업로드 없이 계획만 출력
  python publish.py --list-posted                    # 사용한 단어·게시한 영상 기록 보기
  python publish.py --list-remaining                 # 종류별 남은 콘텐츠 수량 보기
  python publish.py --reset-posted 1                 # UNIT 1 중복 방지 기록 초기화

자동 제목/설명 (우선순위):
  ① 영상 옆 메타(*.json, make_shorts.py 가 기록) — 영상에 실제로 들어간 항목이라 내용과 일치합니다.
     단어 영상: "money | TOEIC 필수 어휘 UNIT 5 | toeic.monster"
     숙어 영상: "come across 외 숙어 1개 | TOEIC 빈출 숙어 | toeic.monster"
  ② 메타가 없으면 --unit N(data/unitNN.js) · --idioms(data/idioms.js) ·
     --frequency(data/extra.js frequency) · --paraphrase(data/extra.js paraphrase)에서
     남은 항목 중 하나를 골라 생성합니다.

중복 방지: 사용한 단어와 게시한 영상(내용 해시)을 promo/posted.json 에 기록해 다음
게시에서 같은 단어·같은 숏폼을 자동으로 건너뜁니다. 다시 게시하려면 --allow-repeat,
기록을 비우려면 --reset-posted(all, UNIT 번호, idioms, frequency, paraphrase)를 사용하세요.

남은 콘텐츠: 생성·게시가 끝날 때마다 종류별 사용·남은 수량을 표시합니다(--list-posted 는 기록만).

플랫폼:
  - YouTube Shorts : 공식 YouTube Data API v3 (OAuth, 무료, 하루 6개 제한)
  - Instagram Reels: instagrapi (비공식 라이브러리, 계정 아이디/비밀번호)
  - TikTok        : 선택 사항. 공식 API 승인이 어려워 비공식 라이브러리 사용(불안정)

주의: 대량 업로드는 계정 정책 위반으로 이어질 수 있습니다. 하루 1~2개 권장.
"""

from __future__ import annotations

import argparse
import ast
import base64
import csv
import difflib
import getpass
import hashlib
import importlib.util
import json
import os
import random
import re
import shutil
import statistics
import subprocess
import sys
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Windows 콘솔(cp949)에서 IPA 발음기호(ˈ, ʌ 등) 출력 시 UnicodeEncodeError 방지
for _stream in (sys.stdout, sys.stderr):
    if _stream is not None and hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

PROMO = Path(__file__).resolve().parent
ROOT = PROMO.parent
CONFIG_FILE = PROMO / "config.json"
CONFIG_EXAMPLE = PROMO / "config.example.json"
SECRETS_DIR = PROMO / ".secrets"
SHORTS_DIR = PROMO / "assets" / "shorts"
SCHEDULE_FILE = PROMO / "scheduled_posts.json"
HISTORY_FILE = PROMO / "publish_history.csv"
REPORT_DIR = PROMO / "reports"
PERF_FILE = PROMO / "performance.json"
POSTED_FILE = PROMO / "posted.json"
# 로컬 TTS(Piper) — promo/assets/tts 에 .onnx 음성 모델을 내려받아 오프라인으로 씁니다.
# 내려받기: 메뉴 29 또는
#   python -m piper.download_voices en_US-amy-medium --download-dir promo/assets/tts
# (설치: pip install piper-tts — 안 되면 엔진을 windows 로 두면 Windows 내장 SAPI 를 씁니다)
PIPER_VOICE_DIR = PROMO / "assets" / "tts"
DEFAULT_TTS_ENGINE = "auto"
TTS_ENGINES = (
    ("auto", "자동 — 내려받은 로컬(Piper) 음성 우선, 없으면 Windows 내장"),
    ("piper", "로컬 Piper TTS (오프라인)"),
    ("windows", "Windows 내장 TTS(SAPI)"),
)
# 기본 후보 — 내려받았다면 남성·여성 목소리로 먼저 쓰는 이름 순서입니다.
PIPER_FEMALE_DEFAULTS = ("en_US-amy", "en_GB-southern_english_female", "en_US-kathleen",
                          "en_US-hfc_female", "en_US-ljspeech")
PIPER_MALE_DEFAULTS = ("en_US-ryan", "en_GB-alan", "en_GB-northern_english_male",
                       "en_US-hfc_male", "en_US-norman")
PIPER_LOCALE_LABELS = {"US": "미국 영어", "GB": "영국 영어", "AU": "호주 영어"}
_PIPER_VOICES: list[str] | None = None
SCHED_TASK_NAME = "toeic_monster_promo"
HISTORY_FIELDS = [
    "timestamp", "event", "status", "schedule_id", "scheduled_at", "platform",
    "video", "unit", "title", "url", "message",
]

UNIT_FILE_RE = re.compile(r"window\.VOCAB_UNITS\s*\[\s*(\d+)\s*\]\s*=\s*(\[[\s\S]*?\]);")
# 숙어는 한 덩어리입니다: window.VOCAB_IDIOMS = [ [표현, 뜻, 예문, 해석], ... ];
IDIOM_FILE_RE = re.compile(r"window\.VOCAB_IDIOMS\s*=\s*(\[[\s\S]*?\]);")
UNITS_BLOCK_RE = re.compile(r"var UNITS\s*=\s*\[([\s\S]*?)\];")
# title·level·icon 사이는 sub 같은 다른 필드가 끼어들 수 있어 [^}]*? 로 건너뜁니다.
UNIT_ENTRY_RE = re.compile(r"\{\s*id:\s*(\d+)[^}]*?title:\s*\"([^\"]*)\"[^}]*?level:\s*\"([^\"]*)\"[^}]*?icon:\s*\"([^\"]*)\"[^}]*?\}")


def log(msg: str) -> None:
    print(msg, flush=True)


def warn(msg: str) -> None:
    print("⚠️  " + msg, flush=True)


def ok(msg: str) -> None:
    print("✅ " + msg, flush=True)


def fail(msg: str) -> None:
    print("❌ " + msg, flush=True)


# --------------------------------------------------------------------------- #
# 설정 / 데이터
# --------------------------------------------------------------------------- #
def load_config() -> dict:
    """실제 설정을 우선 로드하고, 없으면 안전한 예제 설정을 사용합니다."""
    path = CONFIG_FILE if CONFIG_FILE.exists() else CONFIG_EXAMPLE
    if not path.exists():
        sys.exit("설정 파일이 없습니다. promo/config.example.json 을 복사해 config.json 을 만드세요.")
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        sys.exit(f"설정 파일을 읽지 못했습니다: {path} ({exc})")
    if not isinstance(data, dict):
        sys.exit(f"설정 파일의 최상위 값은 JSON 객체여야 합니다: {path}")
    return data


def save_config(cfg: dict) -> None:
    """config.json을 UTF-8 JSON으로 저장합니다."""
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def config_is_real() -> bool:
    return CONFIG_FILE.exists() and CONFIG_FILE.resolve() != CONFIG_EXAMPLE.resolve()


def config_issues(cfg: dict) -> tuple[list[str], list[str]]:
    """설정 오류와 안내 경고를 분리해 반환합니다."""
    errors = []
    warnings = []
    if not config_is_real():
        warnings.append("promo/config.json이 없어 예제 설정을 사용 중입니다.")
    site_url = str(cfg.get("site_url", "")).strip()
    if not site_url.startswith(("http://", "https://")):
        errors.append("site_url은 http:// 또는 https://로 시작해야 합니다.")
    enabled = resolve_platforms(cfg, "auto")
    if not enabled:
        errors.append("활성화된 플랫폼이 없습니다.")
    yt = cfg.get("youtube", {})
    if yt.get("enabled", True):
        secret = resolve_client_secret(cfg)
        if secret is None:
            warnings.append("YouTube OAuth 파일이 없습니다: .secrets/client_secret.json — --youtube-setup 참고")
        else:
            valid, message = validate_client_secret(secret)
            if valid:
                if message.startswith("'웹"):
                    warnings.append(f"YouTube {secret.name}: {message}")
            else:
                errors.append(f"YouTube {secret.name} 문제: {message}")
    ig = cfg.get("instagram", {})
    if ig.get("enabled", True):
        if not ig.get("username") or str(ig.get("username")).startswith("YOUR_"):
            warnings.append("Instagram username이 아직 설정되지 않았습니다.")
        if not ig.get("password") or str(ig.get("password")).startswith("YOUR_"):
            warnings.append("Instagram password가 아직 설정되지 않았습니다.")
    tt = cfg.get("tiktok", {})
    if tt.get("enabled") and not tt.get("ms_token"):
        warnings.append("TikTok이 활성화됐지만 ms_token이 비어 있습니다.")
    # 낭독 TTS 엔진 점검 — 로컬 TTS(Piper) 를 골랐는데 준비가 안 됐으면 알려 줍니다.
    promo = cfg.get("promo", {})
    engine = tts_engine_of(cfg)
    if engine == "piper":
        if not piper_available():
            warnings.append("TTS 엔진이 piper 인데 piper-tts 가 미설치입니다 — pip install piper-tts (또는 엔진을 windows 로)")
        elif not list_piper_voices():
            warnings.append("TTS 엔진이 piper 인데 내려받은 로컬 음성이 없습니다 — 메뉴 29 에서 내려받으세요.")
        else:
            for key in ("default_voice", "default_voice2"):
                value = str(promo.get(key, "") or "")
                if value and not piper_voice_path(value):
                    warnings.append(
                        f"piper 엔진인데 {key} '{value}' 는 내려받은 Piper 음성이 아닙니다 — 메뉴 29 에서 다시 고르세요.")
    elif engine == "auto" and piper_available() and not list_piper_voices() \
            and promo.get("default_tts", True):
        warnings.append("로컬 TTS(piper-tts) 는 설치됐지만 내려받은 음성이 없어 Windows 내장 TTS 로 낭독합니다 — 메뉴 29 에서 음성을 내려받으세요.")
    return errors, warnings


def dependency_status() -> list[tuple[str, bool, str]]:
    """필수·선택 Python 모듈과 실행 파일의 설치 상태를 확인합니다."""
    checks = [
        ("Pillow", "PIL", "쇼츠 이미지 렌더링"),
        ("imageio-ffmpeg", "imageio_ffmpeg", "쇼츠 영상 인코딩"),
        ("Google API", "googleapiclient", "YouTube 업로드"),
        ("Google OAuth", "google_auth_oauthlib", "YouTube 로그인"),
        ("instagrapi", "instagrapi", "Instagram 업로드"),
        ("pyotp", "pyotp", "Instagram 2단계 인증 자동 입력(선택)"),
        ("TikTokApi", "TikTokApi", "TikTok 업로드(선택)"),
        ("playwright", "playwright", "TikTok 브라우저 자동화(선택)"),
    ]
    result = [(name, importlib.util.find_spec(module) is not None, purpose)
              for name, module, purpose in checks]
    # 낭독은 로컬 TTS(Piper) 또는 Windows 내장 TTS(SAPI)로 만듭니다 — 온라인 TTS 는 쓰지 않습니다.
    result.append(("로컬 TTS(Piper)", piper_ready(), "쇼츠 영어 낭독(오프라인 · pip install piper-tts + 음성 내려받기)"))
    result.append(("Windows 내장 TTS", windows_tts_available(), "쇼츠 영어 낭독(네트워크 불필요)"))
    ffmpeg_ok = bool(shutil.which("ffmpeg"))
    try:
        import imageio_ffmpeg  # noqa: F401
        ffmpeg_ok = True
    except Exception:
        pass
    result.append(("ffmpeg", ffmpeg_ok, "영상 인코딩 명령"))
    return result


def init_config(force: bool = False) -> bool:
    """예제 설정으로 config.json을 만들고, 기존 파일은 기본적으로 보존합니다."""
    if CONFIG_FILE.exists() and not force:
        warn(f"설정 파일이 이미 있습니다: {CONFIG_FILE}")
        return False
    if not CONFIG_EXAMPLE.exists():
        fail(f"설정 예제를 찾을 수 없습니다: {CONFIG_EXAMPLE}")
        return False
    CONFIG_FILE.write_text(CONFIG_EXAMPLE.read_text(encoding="utf-8"), encoding="utf-8")
    ok(f"설정 파일을 만들었습니다: {CONFIG_FILE}")
    return True


def load_unit_words(unit_no: int):
    """data/unitNN.js 에서 단어 배열 로드 (없으면 None)."""
    file = ROOT / "data" / f"unit{unit_no:02d}.js"
    if not file.exists():
        return None
    text = file.read_text(encoding="utf-8")
    m = UNIT_FILE_RE.search(text)
    if not m:
        return None
    raw = m.group(2)
    for loader in (json.loads, ast.literal_eval):
        try:
            return loader(raw)
        except Exception:
            continue
    return None


def load_idioms():
    """data/idioms.js 의 숙어 배열 로드 — [표현, 뜻, 예문, 해석] 4필드 (없으면 None)."""
    file = ROOT / "data" / "idioms.js"
    if not file.exists():
        return None
    text = file.read_text(encoding="utf-8")
    m = IDIOM_FILE_RE.search(text)
    if not m:
        return None
    raw = m.group(1)
    for loader in (json.loads, ast.literal_eval):
        try:
            return loader(raw)
        except Exception:
            continue
    return None


def extract_array_block(text: str, key: str) -> str | None:
    """`key: [` 부터 짝이 맞는 `]` 까지 잘라냅니다(문자열 안의 대괄호는 무시)."""
    m = re.search(r"(?m)^\s*" + re.escape(key) + r":\s*\[", text)
    if not m:
        return None
    start = m.end() - 1
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
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
                return text[start:i + 1]
    return None


FREQ_ROW_RE = re.compile(r'\[((?:"(?:[^"\\]|\\.)*"\s*,\s*)*"(?:[^"\\]|\\.)*")\]')
FREQ_STR_RE = re.compile(r'"((?:[^"\\]|\\.)*)"')


def load_frequency():
    """data/extra.js 의 빈도순 기출 어휘를 단어장 순서 튜플로 로드합니다.

    extra.js 행은 [단어, 뜻, 품사, IPA, 한글발음, 예문, 해석, 예문한글발음] 8필드이고,
    여기서는 단어장(unitNN.js)과 같은 [단어, IPA, 한글발음, 뜻, 예문, 해석, 예문한글발음] 순서로 맞춰 줍니다.
    아직 보강되지 않은 3필드 행은 IPA·예문을 빈 값으로 둡니다.
    """
    file = ROOT / "data" / "extra.js"
    if not file.exists():
        return None
    text = file.read_text(encoding="utf-8")
    block = extract_array_block(text, "frequency")
    if not block:
        return None
    out = []
    for m in FREQ_ROW_RE.finditer(block):
        f = FREQ_STR_RE.findall(m.group(1))
        if len(f) >= 8:
            word, meaning, _pos, ipa, kor, ex, tr, ex_kor = f[:8]
        elif len(f) == 3:
            word, meaning, _pos = f
            ipa = kor = ex = tr = ex_kor = ""
        else:
            continue
        out.append([word, ipa, kor, meaning, ex, tr, ex_kor])
    return out


PARA_OBJ_RE = re.compile(r"\{[^{}]*\}")
PARA_STR_RE = re.compile(r'"((?:[^"\\]|\\.)*)"')


def load_paraphrase():
    """data/extra.js 의 동의어 치환(paraphrase) 목록 로드 — 퀴즈 숏폼용 (없으면 None)."""
    file = ROOT / "data" / "extra.js"
    if not file.exists():
        return None
    text = file.read_text(encoding="utf-8")
    block = extract_array_block(text, "paraphrase")
    if not block:
        return None
    out = []
    for m in PARA_OBJ_RE.finditer(block):
        item = m.group(0)

        def grab(key: str) -> str:
            mm = re.search(key + r'\s*:\s*"((?:[^"\\]|\\.)*)"', item)
            return mm.group(1) if mm else ""

        opts_m = re.search(r'opts\s*:\s*\[((?:"(?:[^"\\]|\\.)*"\s*,?\s*)*)\]', item)
        opts = PARA_STR_RE.findall(opts_m.group(1)) if opts_m else []
        ko_m = re.search(r'(?<![A-Za-z])ko\s*:\s*"((?:[^"\\]|\\.)*)"', item)
        out.append({"tag": grab("tag"), "prompt": grab("prompt"),
                    "a": grab("a"), "opts": opts, "why": grab("why"),
                    "ko": ko_m.group(1) if ko_m else ""})
    return out


# 동의어 치환 문제의 표적 표현은 prompt 안에서 『』 로 감싸 두었습니다.
PARA_TARGET_RE = re.compile(r"『([^』]+)』")


def parse_target(prompt: str) -> str:
    """prompt 한 줄에서 표적 표현(『』)만 꺼냅니다 — 중복 방지 키로 씁니다."""
    m = PARA_TARGET_RE.search(str(prompt))
    return m.group(1).strip() if m else ""


def quiz_item_from(row: dict) -> dict:
    """동의어 치환 행 → 영상 메타와 같은 모양(term·meaning·example·options)."""
    prompt = str(row.get("prompt", ""))
    en, _, _ko = prompt.partition("—")
    return {"term": parse_target(prompt),
            "meaning": str(row.get("a", "")),
            "example": PARA_TARGET_RE.sub(lambda m: m.group(1), en).strip(),
            "translation": str(row.get("why", "")),
            "ko": str(row.get("ko", "")),
            "options": [str(o) for o in (row.get("opts") or [])]}


def load_unit_info() -> dict:
    """UNITS 메타데이터(id -> {title, level, icon}) 파싱.

    UNITS 배열은 data/app-data.js 로 옮겨졌고, 예전에는 index.html 안에 있었습니다.
    두 곳을 모두 확인해 사이트 구조가 바뀌어도 유닛명·아이콘을 잃지 않습니다.
    """
    for candidate in (ROOT / "data" / "app-data.js", ROOT / "index.html"):
        if not candidate.exists():
            continue
        m = UNITS_BLOCK_RE.search(candidate.read_text(encoding="utf-8"))
        if not m:
            continue
        info = {}
        for em in UNIT_ENTRY_RE.finditer(m.group(1)):
            info[int(em.group(1))] = {"title": em.group(2), "level": em.group(3), "icon": em.group(4)}
        if info:
            return info
    return {}


# --------------------------------------------------------------------------- #
# 중복 게시 방지 — 사용한 단어·게시한 영상 기록 (posted.json)
# --------------------------------------------------------------------------- #
POSTED_VERSION = 1
# 숙어 숏폼은 유닛 번호가 없어 posted.json 의 words 키로 이 이름을 씁니다.
IDIOM_BUCKET = "idioms"
# 빈도순 기출 어휘 숏폼도 유닛 번호가 없어 별도 키를 씁니다.
FREQUENCY_BUCKET = "frequency"
# 동의어 치환 퀴즈 숏폼의 키입니다.
PARAPHRASE_BUCKET = "paraphrase"


def normalize_word(value: str) -> str:
    """단어 비교용 키(소문자·공백 정리)."""
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def load_posted() -> dict:
    """사용한 단어와 게시한 영상 기록을 읽습니다. 없으면 빈 기록을 돌려줍니다."""
    data: dict = {"version": POSTED_VERSION, "words": {}, "videos": {}}
    if not POSTED_FILE.exists():
        return data
    try:
        loaded = json.loads(POSTED_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        warn(f"중복 방지 기록을 읽지 못했습니다({exc}) — 빈 기록으로 시작합니다.")
        return data
    if not isinstance(loaded, dict):
        return data
    words = loaded.get("words")
    if isinstance(words, dict):
        data["words"] = {str(k): [str(x) for x in v] for k, v in words.items() if isinstance(v, list)}
    videos = loaded.get("videos")
    if isinstance(videos, dict):
        data["videos"] = {str(k): v for k, v in videos.items() if isinstance(v, dict)}
    return data


def save_posted(data: dict) -> None:
    data["version"] = POSTED_VERSION
    data["updated_at"] = now_iso()
    POSTED_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def posted_label(key: str) -> str:
    """posted.json 의 words 키를 사람이 읽는 이름으로 (숫자면 UNIT n)."""
    key = str(key)
    if key.isdigit():
        return f"UNIT {key}"
    if key == IDIOM_BUCKET:
        return "숙어"
    if key == FREQUENCY_BUCKET:
        return "빈도 어휘"
    if key == PARAPHRASE_BUCKET:
        return "동의어 치환"
    return key


def posted_words_for_unit(unit_no: int | str) -> set[str]:
    """해당 유닛(또는 숙어 같은 키)에서 이미 사용한 단어 키 집합."""
    return {normalize_word(w) for w in load_posted()["words"].get(str(unit_no), [])}


def mark_words_posted(unit_no: int | str | None, words: list[str]) -> int:
    """단어를 사용 기록에 추가하고 새로 추가된 개수를 돌려줍니다."""
    if unit_no is None or not words:
        return 0
    data = load_posted()
    bucket = data["words"].setdefault(str(unit_no), [])
    known = {normalize_word(x) for x in bucket}
    added = 0
    for word in words:
        key = normalize_word(word)
        if key and key not in known:
            bucket.append(key)
            known.add(key)
            added += 1
    if added:
        save_posted(data)
    return added


def video_fingerprint(video: Path) -> str:
    """영상 파일 내용 해시(같은 파일 재게시 판별용)."""
    digest = hashlib.sha256()
    with video.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def posted_platforms(video: Path) -> dict:
    """이 영상(내용 기준)을 이미 게시한 플랫폼 딕셔너리."""
    try:
        record = load_posted()["videos"].get(video_fingerprint(video))
    except OSError:
        return {}
    if not record:
        return {}
    platforms = record.get("platforms")
    return platforms if isinstance(platforms, dict) else {}


def filter_posted_platforms(video: Path, platforms: list[str]) -> tuple[list[str], list[str]]:
    """이미 게시한 플랫폼을 제외한 (남은 플랫폼, 건너뛸 플랫폼)을 돌려줍니다."""
    done = posted_platforms(video)
    if not done:
        return list(platforms), []
    remaining = [p for p in platforms if p not in done]
    skipped = [p for p in platforms if p in done]
    return remaining, skipped


def mark_video_posted(video: Path, platform: str, url: str = "") -> None:
    """영상 내용 해시와 함께 플랫폼별 게시 기록을 남깁니다."""
    try:
        fingerprint = video_fingerprint(video)
    except OSError:
        return
    try:
        rel = str(video.relative_to(PROMO))
    except ValueError:
        rel = str(video)
    data = load_posted()
    record = data["videos"].setdefault(fingerprint, {"path": rel, "platforms": {}})
    record.setdefault("platforms", {})
    entry = record["platforms"].setdefault(platform, {"count": 0})
    entry["count"] = int(entry.get("count", 0)) + 1
    entry["last_posted_at"] = now_iso()
    if url:
        entry["last_url"] = url
    record["path"] = rel
    record["last_posted_at"] = entry["last_posted_at"]
    save_posted(data)


def show_posted_menu() -> None:
    """사용한 단어·게시한 영상(중복 방지) 기록을 출력합니다."""
    data = load_posted()
    words = data["words"]
    videos = data["videos"]
    log(f"\n🔁 중복 게시 방지 기록 · {POSTED_FILE.name}")
    if not words and not videos:
        log("  아직 기록이 없습니다. 쇼츠를 생성하거나 게시하면 자동으로 쌓입니다.")
        return
    total_words = sum(len(v) for v in words.values())
    log(f"  사용한 단어 {total_words}개 · 게시한 영상 {len(videos)}개")
    for unit in sorted(words, key=lambda u: int(u) if str(u).isdigit() else 0):
        items = words[unit]
        if not items:
            continue
        preview = ", ".join(items[:8]) + (" …" if len(items) > 8 else "")
        log(f"  {posted_label(unit)}: {len(items)}개 — {preview}")
    for record in sorted(videos.values(), key=lambda r: r.get("last_posted_at", ""), reverse=True)[:10]:
        platforms = ", ".join(sorted((record.get("platforms") or {}).keys())) or "-"
        log(f"  영상: {record.get('path', '')} · {platforms} · {record.get('last_posted_at', '')}")


def reset_posted(target: str = "all") -> None:
    """중복 방지 기록을 초기화합니다(target=all · UNIT 번호 · idioms · frequency · paraphrase)."""
    data = load_posted()
    target = str(target or "all").strip().lower()
    if target in ("all", "전체", "*"):
        save_posted({"words": {}, "videos": {}})
        ok("중복 방지 기록을 모두 초기화했습니다.")
        return
    if target in data["words"]:
        if not data["words"][target]:
            warn(f"{posted_label(target)} 의 기록이 없습니다.")
            return
        data["words"][target] = []
        save_posted(data)
        ok(f"{posted_label(target)} 기록을 초기화했습니다.")
        return
    if target.isdigit():
        warn(f"UNIT {target} 의 단어 기록이 없습니다.")
        return
    warn("초기화 대상은 all, UNIT 번호, idioms, frequency, paraphrase 입니다.")


def content_inventory() -> list[dict]:
    """종류별 전체·사용·남은 수량 — posted.json 의 사용 기록과 데이터 파일을 대조합니다."""
    posted = load_posted()["words"]
    rows = []

    unit_total = unit_used = 0
    for i in range(1, 31):
        words = load_unit_words(i) or []
        unit_total += len(words)
        unit_used += min(len(posted.get(str(i), [])), len(words))
    rows.append({"key": "unit", "label": "단어", "total": unit_total, "used": unit_used})

    idioms = load_idioms() or []
    rows.append({"key": IDIOM_BUCKET, "label": "숙어", "total": len(idioms),
                 "used": len(posted.get(IDIOM_BUCKET, []))})

    freq = load_frequency() or []
    rows.append({"key": FREQUENCY_BUCKET, "label": "빈도 어휘", "total": len(freq),
                 "used": len(posted.get(FREQUENCY_BUCKET, []))})

    paras = load_paraphrase() or []
    rows.append({"key": PARAPHRASE_BUCKET, "label": "동의어 치환", "total": len(paras),
                 "used": len(posted.get(PARAPHRASE_BUCKET, []))})

    for r in rows:
        r["remaining"] = max(0, r["total"] - r["used"])
    return rows


def print_remaining(highlight: str | None = None) -> None:
    """생성·게시 뒤에 남은 콘텐츠를 한눈에 보여 줍니다(중복 방지 기록 기준)."""
    rows = content_inventory()
    log("\n📊 남은 콘텐츠 (중복 방지 기록 기준)")
    for r in rows:
        mark = "   ← 이번" if highlight == r["key"] else ""
        log(f"   · {r['label']:<7} {r['used']:>4} / {r['total']:<4} 사용 · 남음 {r['remaining']}{mark}")
    total = sum(r["total"] for r in rows)
    remaining = sum(r["remaining"] for r in rows)
    log(f"   · {'합계':<7} {total - remaining:>4} / {total:<4} 사용 · 남음 {remaining}")
    if remaining == 0:
        warn("모든 콘텐츠를 사용했습니다 — 새 콘텐츠를 만들거나 --reset-posted 로 초기화하세요.")


def resolve_video(args) -> Path | None:
    if args.video:
        p = Path(args.video)
        if not p.is_absolute():
            p = PROMO / p
        if not p.exists():
            sys.exit(f"영상을 찾을 수 없습니다: {p}")
        return p
    if SHORTS_DIR.exists():
        vids = sorted(SHORTS_DIR.glob("*.mp4"), key=lambda f: f.stat().st_mtime, reverse=True)
        if vids:
            return vids[0]
    sys.exit(
        "영상이 없습니다. --video 로 지정하거나 assets/shorts/ 폴더에 mp4 를 넣어 주세요.\n"
        f"예: python publish.py --video assets/shorts/unit01.mp4 --unit 1"
    )


def load_video_meta(video: Path) -> dict | None:
    """make_shorts.py 가 영상 옆에 남긴 메타(*.json)를 읽습니다. 없으면 None."""
    side = video.with_suffix(".json")
    if not side.exists():
        return None
    try:
        data = json.loads(side.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return data if isinstance(data, dict) else None


def sidecar_for(args) -> dict | None:
    """영상 메타를 찾습니다 — --video 가 있으면 그 영상, 없으면 최근 영상(resolve_video 와 같은 순서)."""
    raw = getattr(args, "video", None)
    if raw:
        p = Path(raw)
        return load_video_meta(p if p.is_absolute() else PROMO / p)
    if SHORTS_DIR.exists():
        vids = sorted(SHORTS_DIR.glob("*.mp4"), key=lambda f: f.stat().st_mtime, reverse=True)
        if vids:
            return load_video_meta(vids[0])
    return None


def find_unit_row(unit_no: int | None, term: str) -> list | None:
    """단어 데이터에서 같은 항목을 찾습니다(영상 메타에는 IPA가 없어 원본으로 보강)."""
    if not unit_no:
        return None
    key = normalize_word(term)
    for row in (load_unit_words(unit_no) or []):
        if normalize_word(row[0]) == key:
            return row
    return None


def vocab_entries(unit_no: int | None, items: list) -> list[dict]:
    """영상 메타 항목을 단어장 원본으로 보강한 설명용 목록으로 만듭니다.

    메타에는 IPA가 빠져 있을 수 있어 같은 단어를 data/unitNN.js 에서 다시 찾아 채웁니다.
    """
    out = []
    for it in items:
        if not isinstance(it, dict):
            continue
        term = str(it.get("term", "")).strip()
        if not term:
            continue
        row = find_unit_row(unit_no, term)
        out.append({
            "term": (row[0] if row else term) or term,
            "ipa": ((row[1] if row else "") or it.get("ipa", "")) or "",
            "meaning": ((row[3] if row else "") or it.get("meaning", "")) or "",
            "example": ((row[4] if row else "") or it.get("example", "")) or "",
            "translation": ((row[5] if row else "") or it.get("translation", "")) or "",
        })
    return out


def brand_title(head: str, category: str) -> str:
    """게시 제목 공통 뼈대 — {핵심} | {종류 라벨} | toeic.monster.

    유닛·숙어·빈도·퀴즈 제목이 모두 이 구조를 써서, 목록에서 한 종류만 형식이 다르지 않습니다.
    """
    return f"{head} | {category} | toeic.monster"


def vocab_title(entries: list[dict], unit_no: int | None, unit_info: dict) -> str:
    """단어 영상 제목 — 첫 단어 + 나머지 개수 (숙어·빈도 영상 제목과 같은 형식)."""
    terms = [e["term"] for e in entries if e.get("term")]
    unit_label = f"UNIT {unit_no} {unit_info.get('title', '')}".strip() if unit_no else ""
    category = f"TOEIC 필수 어휘 {unit_label}".strip()
    if not terms:
        return f"{category} | toeic.monster"
    head = terms[0] if len(terms) == 1 else f"{terms[0]} 외 단어 {len(terms) - 1}개"
    return brand_title(head, category)


def site_link(site_url: str, path: str = "", campaign: str = "shorts") -> str:
    """사이트 링크에 UTM 태그를 붙입니다 — 어떤 숏폼이 실제 사이트 방문을 만드는지 추적하기 위함.

    utm_campaign 은 콘텐츠 종류(unit/idioms/frequency/paraphrase)로 구분해,
    사이트 분석 도구에서 종류별 유입 효과를 바로 비교할 수 있습니다.
    """
    base = str(site_url or "https://toeic.monster/").rstrip("/")
    if path and path != "/":
        base += path if path.startswith("/") else "/" + path
    else:
        base += "/"
    sep = "&" if "?" in base else "?"
    return f"{base}{sep}utm_source=shorts&utm_medium=social&utm_campaign={campaign}"


def fmt_ipa(ipa: str) -> str:
    """IPA 표기 — 원본이 /…/ 또는 […] 로 이미 감싸져 있으면 그대로, 아니면 [ ] 로 감쌉니다."""
    ipa = str(ipa or "").strip()
    if not ipa:
        return ""
    if ipa.startswith(("[", "/")):
        return f" {ipa}"
    return f" [{ipa}]"


def vocab_desc(entries: list[dict], site_url: str, unit_label: str = "") -> str:
    """단어 영상 설명 — 영상에 들어간 단어를 발음·뜻·예문과 함께 모두 적습니다.

    숏폼 설명은 검색 노출과 다시 보기 모두에 쓰이므로, 제목에 못 넣은 나머지 단어를
    여기서 살립니다(숙어·빈도·퀴즈 설명과 같은 형식).
    """
    rows = [e for e in entries if e.get("term")]
    head = f"TOEIC 필수 어휘 {len(rows)}개" if len(rows) > 1 else "TOEIC 필수 어휘"
    if unit_label:
        head += f" · {unit_label}"
    lines = [head, ""]
    for i, e in enumerate(rows, 1):
        ipa = fmt_ipa(e.get("ipa", ""))
        lines.append(f"{i}. {e['term']}{ipa} — {e.get('meaning', '')}")
        if e.get("example"):
            lines.append(f"   {e['example']}")
        if e.get("translation"):
            lines.append(f"   {e['translation']}")
    lines.append("")
    lines.append(f"발음·예문으로 외우는 TOEIC 보카 1,000 → {site_link(site_url, '', 'unit')}")
    return "\n".join(lines)


def idioms_title(items: list) -> str:
    """숙어 영상 제목 — 첫 표현 + 나머지 개수."""
    terms = [str(it.get("term", "")).strip() for it in items if str(it.get("term", "")).strip()]
    if not terms:
        return "TOEIC 빈출 숙어 | toeic.monster"
    head = terms[0] if len(terms) == 1 else f"{terms[0]} 외 숙어 {len(terms) - 1}개"
    return brand_title(head, "TOEIC 빈출 숙어")


def idioms_desc(items: list, site_url: str) -> str:
    """숙어 영상 설명 — 영상에 들어간 표현을 뜻·예문과 함께 모두 적습니다.

    숏폼 설명은 검색 노출과 다시 보기 모두에 쓰이므로, 제목에 못 넣은 나머지 표현을 여기서 살립니다.
    """
    terms = [it for it in items if str(it.get("term", "")).strip()]
    lines = [f"TOEIC 빈출 숙어 {len(terms)}개" if len(terms) > 1 else "TOEIC 빈출 숙어", ""]
    for i, it in enumerate(terms, 1):
        lines.append(f"{i}. {it.get('term', '')} — {it.get('meaning', '')}")
        if it.get("example"):
            lines.append(f"   {it['example']}")
        if it.get("translation"):
            lines.append(f"   {it['translation']}")
    lines.append("")
    lines.append(f"구동사·숙어 126선과 발음까지 → {site_link(site_url, '/units/idioms.html', 'idioms')}")
    return "\n".join(lines)


def freq_title(items: list) -> str:
    """빈도 어휘 영상 제목 — 첫 표제어 + 나머지 개수."""
    terms = [str(it.get("term", "")).strip() for it in items if str(it.get("term", "")).strip()]
    if not terms:
        return "TOEIC 빈출 어휘 | toeic.monster"
    head = terms[0] if len(terms) == 1 else f"{terms[0]} 외 빈출 어휘 {len(terms) - 1}개"
    return brand_title(head, "TOEIC 빈출 어휘")


def freq_desc(items: list, site_url: str) -> str:
    """빈도 어휘 영상 설명 — 표제어를 발음·뜻·예문과 함께 모두 적습니다."""
    rows = [it for it in items if str(it.get("term", "")).strip()]
    lines = [f"TOEIC 빈출 어휘 {len(rows)}개" if len(rows) > 1 else "TOEIC 빈출 어휘", ""]
    for i, it in enumerate(rows, 1):
        ipa = fmt_ipa(it.get("ipa", ""))
        lines.append(f"{i}. {it.get('term', '')}{ipa} — {it.get('meaning', '')}")
        if it.get("example"):
            lines.append(f"   {it['example']}")
        if it.get("translation"):
            lines.append(f"   {it['translation']}")
    lines.append("")
    lines.append(f"빈출 어휘 200선과 발음까지 → {site_link(site_url, '/units/frequency.html', 'frequency')}")
    return "\n".join(lines)


def quiz_title(items: list) -> str:
    """동의어 치환 퀴즈 제목 — 첫 문제의 「표적어 ≈ 정답」과 나머지 문제 수."""
    first = next((it for it in items if str(it.get("term", "")).strip()), None)
    if not first:
        return "TOEIC 동의어 치환 퀴즈 | toeic.monster"
    head = f"{first.get('term', '')} ≈ {first.get('meaning', '')}".strip(" ≈")
    if len(items) == 1:
        return brand_title(head, "TOEIC 동의어 치환 퀴즈")
    return brand_title(f"{head} 외 동의어 치환 {len(items) - 1}문제", "TOEIC 동의어 치환 퀴즈")


def quiz_desc(items: list, site_url: str) -> str:
    """퀴즈 설명 — 영상에 들어간 문제를 보기·정답·해설까지 그대로 적습니다.

    숏폼은 정답을 영상 안에서만 보여 주므로, 설명란에도 같은 내용을 남겨 다시 보기를 돕습니다.
    """
    rows = [it for it in items if str(it.get("term", "")).strip()]
    lines = [f"TOEIC 동의어 치환 퀴즈 {len(rows)}문제" if len(rows) > 1 else "TOEIC 동의어 치환 퀴즈", ""]
    letters = "ABCD"
    for i, it in enumerate(rows, 1):
        lines.append(f"Q{i}. {it.get('example', '')}")
        if it.get("ko"):
            lines.append(f"   해석: {it['ko']}")
        opts = [str(o) for o in (it.get("options") or [])]
        if opts:
            lines.append("   " + " / ".join(f"{letters[j]}. {o}" for j, o in enumerate(opts[:4])))
        ans = str(it.get("meaning", ""))
        # 영상의 정답 위치(A~D)와 설명이 어긋나지 않도록 실제 보기 순서에서 정답 문자를 찾습니다.
        letter = f"{letters[opts.index(ans)]}. " if ans in opts[:4] else ""
        lines.append(f"   정답: {letter}{ans}")
        if it.get("translation"):
            lines.append(f"   해설: {it['translation']}")
        lines.append("")
    lines.append(f"같은 유형 200문제 — 홈의 「동의어 치환 훈련」에서 → {site_link(site_url, '/', 'paraphrase')}")
    return "\n".join(lines)


def build_meta(cfg: dict, args) -> dict:
    """제목/설명/해시태그 생성.

    우선순위: ① 영상 옆 메타(*.json · make_shorts.py 기록) → ② `--unit` 자동 생성
    → ③ `--idioms` 자동 생성 → ③' `--frequency` 자동 생성 → ④ 설정 기본값.
    ①을 먼저 보는 이유: 생성기가 기록한 항목이 실제로 영상에 들어 있어서, 남은 목록에서
    무작위로 고르는 예전 방식과 달리 제목·설명이 영상 내용과 어긋나지 않습니다.
    """
    title = args.title
    desc = args.desc
    unit_info = {}
    chosen_word: str | None = None
    word_bucket: int | str | None = None  # 중복 기록 버킷 — UNIT 번호 / idioms / frequency / paraphrase
    kind = ""  # 콘텐츠 종류 — 종류별 해시태그·UTM 캠페인에 사용
    site_url = cfg.get("site_url", "https://toeic.monster/")

    saved = sidecar_for(args)
    items = saved.get("items") if isinstance(saved, dict) else None
    if items:
        kind = str(saved.get("kind"))
        if kind == "idioms":
            title = title or idioms_title(items)
            desc = desc or idioms_desc(items, site_url)
        elif kind == "frequency":
            title = title or freq_title(items)
            desc = desc or freq_desc(items, site_url)
        elif kind == "paraphrase":
            title = title or quiz_title(items)
            desc = desc or quiz_desc(items, site_url)
        else:
            unit_no = saved.get("unit") if isinstance(saved.get("unit"), int) else None
            unit_info = load_unit_info().get(unit_no, {}) if unit_no else {}
            entries = vocab_entries(unit_no, items)
            unit_label = f"UNIT {unit_no} {unit_info.get('title', '')}".strip()
            title = title or vocab_title(entries, unit_no, unit_info)
            desc = desc or vocab_desc(entries, site_url, unit_label)
    elif args.unit:
        kind = "unit"
        unit_info = load_unit_info().get(args.unit, {})
        words = load_unit_words(args.unit)
        if words:
            pool = words
            if not getattr(args, "allow_repeat", False):
                used = posted_words_for_unit(args.unit)
                remaining = [x for x in words if normalize_word(x[0]) not in used]
                if remaining:
                    if len(remaining) < len(words):
                        log(f"   중복 방지: UNIT {args.unit} 단어 {len(words) - len(remaining)}개 제외, "
                            f"{len(remaining)}개 중에서 선택")
                    pool = remaining
                elif used:
                    warn(f"UNIT {args.unit} 단어를 모두 사용했습니다 — --allow-repeat 또는 "
                         f"--reset-posted 로 초기화할 수 있습니다. 전체 단어에서 선택합니다.")
            w = random.choice(pool)
            chosen_word = w[0]
            word_bucket = args.unit
            entries = [{"term": w[0], "ipa": w[1], "meaning": w[3],
                        "example": w[4], "translation": w[5]}]
            unit_label = f"UNIT {args.unit} {unit_info.get('title', '')}".strip()
            if not title:
                title = vocab_title(entries, args.unit, unit_info)
            if not desc:
                desc = vocab_desc(entries, site_url, unit_label)
        elif not title:
            warn(f"UNIT {args.unit} 데이터를 읽지 못해 기본 제목을 사용합니다.")
    elif getattr(args, "idioms", False):
        kind = "idioms"
        # 영상 메타가 없는 오래된 영상이나 직접 만든 영상을 위한 폴백입니다.
        rows = load_idioms() or []
        pool = rows
        if rows and not getattr(args, "allow_repeat", False):
            used = posted_words_for_unit(IDIOM_BUCKET)
            remaining = [r for r in rows if normalize_word(r[0]) not in used]
            if remaining:
                pool = remaining
        if pool:
            r = random.choice(pool)
            one = {"term": r[0], "meaning": r[1], "example": r[2], "translation": r[3]}
            chosen_word, word_bucket = one["term"], IDIOM_BUCKET
            title = title or idioms_title([one])
            desc = desc or idioms_desc([one], site_url)
        elif not title:
            warn("숙어 데이터를 읽지 못해 기본 제목을 사용합니다.")
    elif getattr(args, "frequency", False):
        kind = "frequency"
        # 영상 메타가 없는 영상을 위한 폴백 — 빈도순 기출 어휘에서 남은 항목 중 하나를 고릅니다.
        rows = load_frequency() or []
        pool = rows
        if rows and not getattr(args, "allow_repeat", False):
            used = posted_words_for_unit(FREQUENCY_BUCKET)
            remaining = [r for r in rows if normalize_word(r[0]) not in used]
            if remaining:
                pool = remaining
        if pool:
            r = random.choice(pool)
            one = {"term": r[0], "ipa": r[1], "meaning": r[3], "example": r[4], "translation": r[5]}
            chosen_word, word_bucket = one["term"], FREQUENCY_BUCKET
            title = title or freq_title([one])
            desc = desc or freq_desc([one], site_url)
        elif not title:
            warn("빈도 어휘 데이터를 읽지 못해 기본 제목을 사용합니다.")
    elif getattr(args, "paraphrase", False):
        kind = "paraphrase"
        # 영상 메타가 없는 퀴즈 영상을 위한 폴백 — 동의어 치환에서 남은 항목 중 하나를 고릅니다.
        rows = load_paraphrase() or []
        pool = [r for r in rows if str(r.get("prompt", "")).strip()]
        if pool and not getattr(args, "allow_repeat", False):
            used = posted_words_for_unit(PARAPHRASE_BUCKET)
            remaining = [r for r in pool if normalize_word(parse_target(r["prompt"])) not in used]
            if remaining:
                pool = remaining
        if pool:
            r = random.choice(pool)
            one = quiz_item_from(r)
            chosen_word, word_bucket = one["term"], PARAPHRASE_BUCKET
            title = title or quiz_title([one])
            desc = desc or quiz_desc([one], site_url)
        elif not title:
            warn("동의어 치환 데이터를 읽지 못해 기본 제목을 사용합니다.")

    title = (title or cfg.get("default_title", "TOEIC 필수 어휘 | toeic.monster")).strip()[:100]
    desc = (desc or cfg.get("default_description", "")).strip()
    hashtags = " ".join("#" + h.strip().lstrip("#") for h in cfg.get("hashtags", []))
    # 종류별 해시태그 — 검색·추천 노출을 넓히기 위해 콘텐츠 성격을 추가합니다(중복 제외).
    kind_tags = {"unit": ("TOEIC단어", "영단어암기"),
                 "idioms": ("TOEIC숙어", "구동사"),
                 "frequency": ("TOEIC빈출", "기출어휘"),
                 "paraphrase": ("TOEIC퀴즈", "동의어")}
    existing_tags = {h.lower() for h in hashtags.split() if h.startswith("#")}
    for tag in kind_tags.get(kind, ()):
        if f"#{tag}".lower() not in existing_tags:
            hashtags = (hashtags + " #" + tag).strip()
    if cfg.get("youtube", {}).get("include_shorts_tag", True) and "#Shorts" not in hashtags:
        hashtags += " #Shorts"
    return {"title": title, "desc": desc, "hashtags": hashtags, "unit": args.unit,
            "unit_info": unit_info, "word": chosen_word, "word_bucket": word_bucket}


def resolve_platforms(cfg: dict, arg: str | None) -> list[str]:
    if arg and arg != "auto":
        return [p.strip().lower() for p in arg.split(",") if p.strip()]
    enabled = []
    for key, short in (("youtube", "yt"), ("instagram", "ig"), ("tiktok", "tt")):
        if cfg.get(key, {}).get("enabled", True):
            enabled.append(short)
    return enabled


# --------------------------------------------------------------------------- #
# 예약 작업·게시 이력
# --------------------------------------------------------------------------- #
def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def parse_schedule_time(value: str) -> datetime:
    """ISO 또는 YYYY-MM-DD HH:MM 형식의 로컬 시간을 파싱합니다."""
    raw = value.strip()
    try:
        parsed = datetime.fromisoformat(raw)
    except ValueError as exc:
        raise ValueError("시간 형식은 YYYY-MM-DD HH:MM 또는 ISO 형식이어야 합니다.") from exc
    if parsed.tzinfo is None:
        parsed = parsed.astimezone()
    return parsed


def load_schedules() -> list[dict]:
    if not SCHEDULE_FILE.exists():
        return []
    try:
        data = json.loads(SCHEDULE_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError) as exc:
        warn(f"예약 파일을 읽지 못했습니다: {exc}")
        return []


def save_schedules(items: list[dict]) -> None:
    SCHEDULE_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def append_history(*, event: str, status: str, schedule_id: str = "", scheduled_at: str = "",
                   platform: str = "", video: str = "", unit: int | None = None,
                   title: str = "", url: str = "", message: str = "") -> None:
    """게시·예약 이벤트를 CSV에 누적합니다. 토큰·비밀번호는 기록하지 않습니다."""
    new_file = not HISTORY_FILE.exists() or HISTORY_FILE.stat().st_size == 0
    with HISTORY_FILE.open("a", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=HISTORY_FIELDS)
        if new_file:
            writer.writeheader()
        writer.writerow({
            "timestamp": now_iso(), "event": event, "status": status,
            "schedule_id": schedule_id, "scheduled_at": scheduled_at, "platform": platform,
            "video": video, "unit": "" if unit is None else unit, "title": title,
            "url": url, "message": message.replace("\n", " ")[:500],
        })


def display_schedules(items: list[dict]) -> None:
    if not items:
        log("예약된 게시가 없습니다.")
        return
    log("\n예약 목록")
    for item in items:
        status = item.get("status", "scheduled")
        log(f"  {item.get('id', '')} | {item.get('scheduled_at', '')} | {status} | "
            f"{item.get('video', '')} | {item.get('platforms', '')}")


def create_schedule(*, video: Path, unit: int | None, platforms: str, privacy: str,
                    scheduled_at: str, title: str = "", desc: str = "") -> dict:
    when = parse_schedule_time(scheduled_at)
    if when <= datetime.now().astimezone():
        raise ValueError("예약 시간은 현재 시간보다 이후여야 합니다.")
    item = {
        "id": uuid.uuid4().hex[:10],
        "created_at": now_iso(),
        "scheduled_at": when.isoformat(timespec="seconds"),
        "status": "scheduled",
        "video": str(video),
        "unit": unit,
        "platforms": platforms,
        "youtube_privacy": privacy,
        "title": title,
        "desc": desc,
    }
    items = load_schedules()
    items.append(item)
    save_schedules(items)
    append_history(event="schedule", status="scheduled", schedule_id=item["id"],
                   scheduled_at=item["scheduled_at"], platform=platforms,
                   video=str(video), unit=unit, title=title,
                   message="예약이 등록되었습니다.")
    return item


def cancel_schedule(schedule_id: str) -> bool:
    items = load_schedules()
    for item in items:
        if item.get("id") == schedule_id and item.get("status") == "scheduled":
            item["status"] = "cancelled"
            item["cancelled_at"] = now_iso()
            save_schedules(items)
            append_history(event="schedule", status="cancelled", schedule_id=schedule_id,
                           scheduled_at=item.get("scheduled_at", ""), platform=item.get("platforms", ""),
                           video=item.get("video", ""), unit=item.get("unit"), title=item.get("title", ""),
                           message="예약이 취소되었습니다.")
            return True
    return False


def due_schedules() -> list[dict]:
    current = datetime.now().astimezone()
    return [item for item in load_schedules()
            if item.get("status") == "scheduled" and parse_schedule_time(item["scheduled_at"]) <= current]


def run_scheduled_item(item: dict, cfg: dict, *, dry_run: bool = False) -> bool:
    """예약 항목 하나를 게시하고 결과를 CSV에 남깁니다."""
    video = Path(item["video"])
    if not video.is_absolute():
        video = PROMO / video
    if not video.exists():
        message = f"영상을 찾을 수 없습니다: {video}"
        append_history(event="publish", status="failed", schedule_id=item.get("id", ""),
                       scheduled_at=item.get("scheduled_at", ""), platform=item.get("platforms", ""),
                       video=str(video), unit=item.get("unit"), title=item.get("title", ""), message=message)
        return False

    class Args:
        pass
    args = Args()
    args.unit = item.get("unit")
    args.title = item.get("title") or None
    args.desc = item.get("desc") or None
    args.allow_repeat = False
    args.manual_fallback = False  # 예약·백그라운드 실행은 브라우저를 열지 않습니다.
    args.video = str(video)       # 영상 옆 메타(*.json)를 이 영상 것으로 찾게 합니다
    meta = build_meta(cfg, args)
    platforms = resolve_platforms(cfg, item.get("platforms", "auto"))
    if not platforms:
        append_history(event="publish", status="failed", schedule_id=item.get("id", ""),
                       scheduled_at=item.get("scheduled_at", ""), platform="", video=str(video),
                       unit=item.get("unit"), title=meta["title"], message="활성 플랫폼이 없습니다.")
        return False
    if not dry_run:
        remaining, already = filter_posted_platforms(video, platforms)
        if already:
            warn(f"{video.name}: 이미 게시한 플랫폼 {', '.join(p.upper() for p in already)} — 건너뜁니다.")
        if not remaining:
            append_history(event="publish", status="skipped", schedule_id=item.get("id", ""),
                           scheduled_at=item.get("scheduled_at", ""), platform=item.get("platforms", ""),
                           video=str(video), unit=item.get("unit"), title=meta["title"],
                           message="중복 방지: 이미 게시한 영상/플랫폼")
            return True
        platforms = remaining

    global _yt_privacy_override
    _yt_privacy_override = item.get("youtube_privacy") or None
    all_ok = True
    for short in platforms:
        if short == "yt":
            url = upload_youtube(video, meta, cfg, dry_run)
        elif short == "ig":
            url = upload_instagram(video, meta, cfg, dry_run)
        elif short == "tt":
            url = upload_tiktok(video, meta, cfg, dry_run)
        else:
            url = None
        status = "dry-run" if url == "dry-run" else ("success" if url else "failed")
        all_ok = all_ok and bool(url)
        if url and url != "dry-run":
            mark_video_posted(video, short, url)
        append_history(event="publish", status=status, schedule_id=item.get("id", ""),
                       scheduled_at=item.get("scheduled_at", ""), platform=short,
                       video=str(video), unit=item.get("unit"), title=meta["title"], url=url or "",
                       message="예약 게시 실행" if url else "플랫폼 게시 실패 또는 건너뜀")
    if not dry_run and all_ok and meta.get("word"):
        mark_words_posted(meta.get("word_bucket") or item.get("unit"), [meta["word"]])
    return all_ok


def process_due_schedules(cfg: dict, *, dry_run: bool = False) -> int:
    items = load_schedules()
    due = [item for item in items if item.get("status") == "scheduled" and
           parse_schedule_time(item["scheduled_at"]) <= datetime.now().astimezone()]
    count = 0
    for item in due:
        log(f"\n⏰ 예약 게시 실행: {item.get('id')} ({item.get('scheduled_at')})")
        success = run_scheduled_item(item, cfg, dry_run=dry_run)
        if not dry_run:
            item["status"] = "completed" if success else "failed"
            item["processed_at"] = now_iso()
        count += 1
    if due:
        save_schedules(items)
    return count


# --------------------------------------------------------------------------- #
# 설정 도우미 · 수동 게시 폴백
# --------------------------------------------------------------------------- #
MANUAL_UPLOAD_URLS = {
    "yt": "https://www.youtube.com/upload",
    "ig": "https://www.instagram.com/",
    "tt": "https://www.tiktok.com/tiktokstudio/upload",
}
PLATFORM_NAMES = {"yt": "YouTube Shorts", "ig": "Instagram Reels", "tt": "TikTok"}

YOUTUBE_SETUP_STEPS = [
    ("① Google Cloud 프로젝트 만들기", "https://console.cloud.google.com/projectcreate"),
    ("② YouTube Data API v3 사용 설정", "https://console.cloud.google.com/apis/library/youtube.googleapis.com"),
    ("③ OAuth 동의 화면 구성 (외부 / 테스트 사용자 추가)", "https://console.cloud.google.com/apis/credentials/consent"),
    ("④ OAuth 클라이언트 ID 만들기 (유형: 데스크톱 앱)", "https://console.cloud.google.com/apis/credentials"),
]
YOUTUBE_SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
# OAuth 동의 화면 > 대상(Audience) > 테스트 사용자
YOUTUBE_AUDIENCE_URL = "https://console.cloud.google.com/auth/audience"
YOUTUBE_CONSENT_URL = "https://console.cloud.google.com/apis/credentials/consent"


def copy_to_clipboard(text: str) -> bool:
    """캡션을 클립보드에 복사합니다(Windows/macOS/Linux)."""
    if not text:
        return False
    try:
        if sys.platform.startswith("win"):
            subprocess.run(
                ["powershell", "-NoProfile", "-Command",
                 "[Console]::InputEncoding=[Text.Encoding]::UTF8; "
                 "Set-Clipboard -Value ([Console]::In.ReadToEnd())"],
                input=text, text=True, encoding="utf-8", check=True)
            return True
        if sys.platform == "darwin":
            subprocess.run(["pbcopy"], input=text, text=True, check=True)
            return True
        for cmd in (["xclip", "-selection", "clipboard"],
                    ["xsel", "--clipboard", "--input"], ["wl-copy"]):
            try:
                subprocess.run(cmd, input=text, text=True, check=True)
                return True
            except (OSError, subprocess.CalledProcessError):
                continue
    except Exception:
        return False
    return False


def open_url(url: str) -> bool:
    """기본 브라우저로 URL을 엽니다."""
    try:
        import webbrowser
        opened = webbrowser.open(url)
    except Exception:
        opened = False
    if opened:
        ok(f"브라우저에서 열었습니다: {url}")
    else:
        warn(f"브라우저를 자동으로 열지 못했습니다 — 직접 접속하세요: {url}")
    return bool(opened)


def build_caption(meta: dict, max_len: int = 0) -> str:
    """설명 + 해시태그를 합친 캡션을 만듭니다.

    max_len 을 주면 플랫폼 제한(예: Instagram 2,200자)에 맞추고,
    해시태그는 검색 노출에 필수라 남기고 설명 본문을 줄입니다.
    """
    caption = meta.get("desc", "") or ""
    if meta.get("hashtags"):
        caption = f"{caption}\n\n{meta['hashtags']}" if caption else meta["hashtags"]
    if max_len and len(caption) > max_len:
        tags = meta.get("hashtags", "") or ""
        keep = tags if tags and len(tags) + 2 < max_len else ""
        room = max_len - len(keep) - (3 if keep else 0)  # 줄임표(…) 자리
        caption = caption[:max(0, room)].rstrip() + "…"
        if keep:
            caption += f"\n\n{keep}"
    return caption


def manual_publish(video: Path, meta: dict, short: str, cfg: dict, *, mark: bool = True) -> bool:
    """업로드 페이지를 열고 캡션을 복사해 수동 게시를 돕습니다."""
    name = PLATFORM_NAMES.get(short, short)
    caption = build_caption(meta, max_len=2200 if short == "ig" else 0)
    log("\n" + "=" * 62)
    log(f"📋 {name} 수동 게시 도우미")
    log("=" * 62)
    log(f"영상 파일 : {video}")
    log(f"제목      : {meta.get('title', '')}")
    if caption:
        log("캡션/해시태그:")
        for line in caption.splitlines():
            log(f"    {line}")
    if copy_to_clipboard(caption):
        ok("캡션을 클립보드에 복사했습니다 — 업로드 화면에서 Ctrl+V 로 붙여넣으세요.")
    else:
        warn("클립보드 복사에 실패했습니다. 위 캡션을 직접 복사하세요.")
    url = MANUAL_UPLOAD_URLS.get(short)
    if url:
        open_url(url)
    log("업로드 화면에서 위 영상 파일을 선택하고 → 캡션 붙여넣기 → 게시하세요.")
    if mark:
        mark_video_posted(video, short, "")
        append_history(event="publish", status="manual", platform=short, video=str(video),
                       unit=meta.get("unit"), title=meta.get("title", ""),
                       message="수동 게시 도우미 실행")
    return True


def resolve_client_secret(cfg: dict) -> Path | None:
    """client_secret 파일을 찾습니다. Google이 내려준 원본 파일 이름도 자동 인식합니다."""
    yt = cfg.get("youtube", {})
    configured = SECRETS_DIR / (yt.get("client_secret_file") or "client_secret.json")
    if configured.exists():
        return configured
    if SECRETS_DIR.exists():
        candidates = sorted(
            (p for p in SECRETS_DIR.glob("*.json")
             if "client_secret" in p.name.lower() and "token" not in p.name.lower()),
            key=lambda p: (p.name != "client_secret.json", p.name),
        )
        if candidates:
            return candidates[0]
    return None


def validate_client_secret(path: Path) -> tuple[bool, str]:
    """client_secret.json 형식을 검사합니다."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return False, f"JSON을 읽지 못했습니다: {exc}"
    if not isinstance(data, dict):
        return False, "최상위 값이 JSON 객체가 아닙니다."
    block = data.get("installed")
    if block is None:
        if isinstance(data.get("web"), dict):
            return True, ("'웹 애플리케이션(web)' 유형입니다. '데스크톱 앱(installed)' 유형으로 "
                          "다시 만드는 것을 권장합니다.")
        return False, ("'installed' 또는 'web' 키가 없습니다. OAuth 클라이언트 유형을 "
                       "'데스크톱 앱'으로 만들었는지 확인하세요.")
    if not isinstance(block, dict) or not block.get("client_id") or not block.get("client_secret"):
        return False, "client_id / client_secret 값이 비어 있습니다."
    return True, "정상적인 데스크톱 앱 OAuth 파일입니다."


def youtube_setup_guide() -> None:
    """YouTube OAuth 준비 순서를 안내합니다."""
    log("\n" + "=" * 62)
    log("📺 YouTube Shorts 설정 도우미")
    log("=" * 62)
    log("아래 순서대로 진행하면 5~10분이면 끝납니다.")
    for title, url in YOUTUBE_SETUP_STEPS:
        log(f"\n{title}")
        log(f"    {url}")
        if ask_yes_no("   이 페이지를 브라우저로 열까요?", True):
            open_url(url)
        if title.startswith("④"):
            log("    · 애플리케이션 유형: '데스크톱 앱' 선택")
            log("    · 만든 뒤 'JSON 다운로드' 클릭 → 그 파일을 아래 폴더에 그대로 넣으면 됩니다")
            log("      (파일 이름은 바꾸지 않아도 자동 인식합니다)")
    ok(f"저장 위치: {SECRETS_DIR}")
    if ask_yes_no("지금 secrets 폴더를 열까요?", True):
        SECRETS_DIR.mkdir(parents=True, exist_ok=True)
        open_path(SECRETS_DIR)
    log("\n중요:")
    log("  · OAuth 동의 화면의 '테스트 사용자'에 로그인할 Google 계정을 반드시 추가하세요.")
    log(f"    → {YOUTUBE_AUDIENCE_URL} → '+ ADD USERS'")
    log("    (빠뜨리면 '403 access_denied — 개발자가 승인한 테스터만' 오류가 나옵니다)")
    log("  · 앱 이름·지원 이메일·개발자 연락처도 비워두지 마세요.")
    log("  · '테스트' 상태에서는 refresh 토큰이 7일마다 만료됩니다.")
    log("    → 동의 화면 → 게시 상태 → '앱 게시' 로 바꾸면 만료되지 않습니다.")
    log("  · '확인되지 않은 앱' 경고가 뜨면 '고급' → '계속'을 누르세요.")
    log("  · YouTube 채널이 1개만 연결된 Google 계정을 권장합니다.")
    if ask_yes_no("지금 YouTube 로그인(브라우저 승인)을 진행할까요?", True):
        cfg = load_config()
        youtube_login(cfg)


def explain_youtube_auth_error(exc: Exception) -> None:
    """OAuth 승인 실패 원인을 한국어로 친절하게 안내합니다."""
    text = str(exc).lower()
    if "access_denied" in text or "accessdenied" in text:
        fail("Google이 승인을 거부했습니다 (403 access_denied).")
        log("")
        log("가장 흔한 원인: 방금 선택한 Google 계정이 OAuth 동의 화면의")
        log("'테스트 사용자' 목록에 없습니다.")
        log("")
        log("해결 순서")
        log(f"  1) 이 주소를 엽니다: {YOUTUBE_AUDIENCE_URL}")
        log("     (안 열리면 Google Cloud → API 및 서비스 → OAuth 동의 화면)")
        log("  2) '대상(Audience)' 섹션의 '테스트 사용자'에서 '+ ADD USERS' 클릭")
        log("  3) 로그인 화면에서 고른 Google 계정 주소를 그대로 입력하고 저장")
        log("  4) 1~2분 기다린 뒤 다시 실행: python publish.py --youtube-login")
        log("")
        log("확인 포인트")
        log("  · 브라우저에 계정이 여러 개면, 테스트 사용자로 등록한 계정을 골라야 합니다.")
        log("  · OAuth 동의 화면의 앱 이름·지원 이메일·개발자 연락처가 비어 있어도")
        log("    같은 오류가 나므로 함께 채워 주세요.")
        log("  · 회사/학교 계정은 관리자가 막아둔 경우가 있습니다 — 개인 Gmail을 쓰세요.")
        if ask_yes_no("지금 테스트 사용자 설정 페이지를 열까요?", True):
            open_url(YOUTUBE_AUDIENCE_URL)
            open_url(YOUTUBE_CONSENT_URL)
        return
    if "waiting for response from authorization server" in text:
        fail("시간이 초과되었습니다(5분) — 브라우저에서 승인을 끝내지 않았습니다.")
        log("   → 다시 실행하고, 브라우저 창에서 '계속 / 허용'까지 마쳐주세요:")
        log("     python publish.py --youtube-login")
        return
    if "invalid_client" in text:
        fail("OAuth 클라이언트 정보가 거부되었습니다 (invalid_client).")
        log("   → Google Cloud에서 만든 클라이언트가 삭제·재발급 되었는지 확인하고,")
        log("     최신 JSON을 .secrets 폴더에 다시 넣으세요.")
        return
    if "redirect_uri_mismatch" in text:
        fail("redirect_uri 불일치입니다. OAuth 클라이언트 유형을 '데스크톱 앱'으로 만드세요.")
        return
    fail(f"YouTube 로그인 실패: {exc}")
    log("   → python publish.py --youtube-guide 로 설정을 다시 점검하거나,")
    log(f"     OAuth 동의 화면({YOUTUBE_CONSENT_URL})을 확인하세요.")


def get_youtube_credentials(cfg: dict, *, interactive: bool = True, force: bool = False,
                            allow_non_tty: bool = False):
    """YouTube OAuth 자격증명을 준비해 돌려줍니다. 실패하면 None."""
    yt = cfg.get("youtube", {})
    client_secret = resolve_client_secret(cfg)
    token_file = SECRETS_DIR / (yt.get("token_file") or "youtube_token.json")
    if client_secret is None:
        warn(f"YouTube OAuth 파일이 없습니다: {SECRETS_DIR / 'client_secret.json'}")
        log("   · Google에서 받은 client_secret*.json 파일을 .secrets 폴더에 넣으면 자동 인식합니다.")
        log("   · python publish.py --youtube-setup 으로 설정 안내를 실행하세요.")
        return None
    if client_secret.name != "client_secret.json":
        ok(f"OAuth 파일 인식: {client_secret.name}")
    valid, message = validate_client_secret(client_secret)
    if not valid:
        fail(f"{client_secret.name} 문제: {message}")
        return None
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        fail("google-api-python-client / google-auth-oauthlib 미설치 — pip install -r requirements.txt")
        return None

    creds = None
    if token_file.exists() and not force:
        try:
            creds = Credentials.from_authorized_user_file(str(token_file), YOUTUBE_SCOPES)
        except Exception:
            creds = None
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
        except Exception as exc:
            warn(f"YouTube 토큰 갱신 실패: {exc}")
            warn("OAuth 앱이 '테스트' 상태면 refresh 토큰이 7일마다 만료됩니다. "
                 "동의 화면을 '프로덕션'으로 게시하거나 다시 로그인하세요.")
            creds = None
    if not creds or not creds.valid:
        # 작업 스케줄러·파이프 실행에서는 브라우저 인증을 시도하지 않습니다(무한 대기 방지).
        # 단, --youtube-login 으로 사용자가 직접 요청한 경우(allow_non_tty)는 진행합니다.
        if interactive and not allow_non_tty and not sys.stdin.isatty():
            warn("비대화형 실행이라 브라우저 로그인을 건너뜁니다.")
            interactive = False
        if not interactive:
            warn("YouTube 로그인이 필요합니다 — python publish.py --youtube-login 을 실행하세요.")
            return None
        log("   YouTube 로그인: 브라우저에서 승인해 주세요 (최초 1회)")
        log("   ※ 로그인 화면에서 '테스트 사용자'로 등록한 Google 계정을 선택하세요.")
        try:
            flow = InstalledAppFlow.from_client_secrets_file(str(client_secret), YOUTUBE_SCOPES)
            creds = flow.run_local_server(
                port=0,
                prompt="consent",
                authorization_prompt_message=("브라우저가 자동으로 열리지 않으면 이 주소를 복사해 접속하세요:\n{url}\n"),
                success_message="인증이 완료되었습니다. 이 창을 닫고 터미널로 돌아가세요.",
                timeout_seconds=300,
            )
        except Exception as exc:
            explain_youtube_auth_error(exc)
            return None
    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(creds.to_json(), encoding="utf-8")
    return creds


def youtube_login(cfg: dict, *, force: bool = False) -> bool:
    """브라우저 OAuth를 미리 수행하고 토큰을 저장합니다(업로드와 분리)."""
    creds = get_youtube_credentials(cfg, interactive=True, force=force, allow_non_tty=True)
    if not creds:
        return False
    ok("YouTube 인증 완료 — 토큰을 저장했습니다.")
    channel = describe_youtube_channel(creds)
    if channel:
        ok(f"연결된 채널: {channel}")
    else:
        warn("연결된 채널을 확인하지 못했습니다 — 이 Google 계정에 YouTube 채널이 있는지 확인하세요.")
    log("  · 업로드 테스트: python publish.py --video assets/shorts/unit01_shorts.mp4 "
        "--platforms yt --youtube-privacy unlisted")
    log("  · 토큰 만료 방지: Google Cloud → OAuth 동의 화면 → 게시 상태 → '앱 게시'")
    return True


def load_stored_youtube_credentials(cfg: dict):
    """토큰 파일에서 자격증명을 읽습니다(만료 시 자동 갱신). 실패하면 None."""
    yt = cfg.get("youtube", {})
    token_file = SECRETS_DIR / (yt.get("token_file") or "youtube_token.json")
    if not token_file.exists():
        return None
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
    except ImportError:
        return None
    try:
        creds = Credentials.from_authorized_user_file(str(token_file), YOUTUBE_SCOPES)
    except Exception:
        return None
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
        except Exception:
            return None
        try:
            token_file.write_text(creds.to_json(), encoding="utf-8")
        except OSError:
            pass
    return creds if creds.valid else None


def describe_youtube_channel(creds) -> str | None:
    """로그인된 YouTube 채널 이름을 조회합니다(실패하면 None)."""
    try:
        from googleapiclient.discovery import build
        service = build("youtube", "v3", credentials=creds, cache_discovery=False)
        resp = service.channels().list(part="snippet,statistics", mine=True).execute()
        items = resp.get("items") or []
        if not items:
            return None
        snippet = items[0].get("snippet", {})
        subs = items[0].get("statistics", {}).get("subscriberCount", "비공개")
        return f"{snippet.get('title', '이름 없음')} (구독자 {subs})"
    except Exception:
        return None


def youtube_token_status(cfg: dict) -> tuple[bool, str]:
    """저장된 YouTube 토큰을 아직 쓸 수 있는지 확인합니다(필요하면 자동 갱신)."""
    yt = cfg.get("youtube", {})
    token_file = SECRETS_DIR / (yt.get("token_file") or "youtube_token.json")
    if not token_file.exists():
        return False, "토큰 없음 — 로그인이 필요합니다"
    if load_stored_youtube_credentials(cfg) is not None:
        return True, "유효"
    return False, ("만료되었거나 갱신에 실패했습니다 — python publish.py --youtube-login 으로 다시 로그인하세요.\n"
                   "   → OAuth 앱이 '테스트' 상태면 refresh 토큰이 7일마다 만료됩니다."
                   " Google Cloud → OAuth 동의 화면 → '앱 게시' 로 전환하세요.")


def youtube_check(cfg: dict) -> None:
    """YouTube 설정 상태를 점검합니다."""
    yt = cfg.get("youtube", {})
    client_secret = resolve_client_secret(cfg)
    log("\n📺 YouTube 상태")
    if client_secret is None:
        fail(f"OAuth 파일 없음: {SECRETS_DIR / 'client_secret.json'}")
        log("   → Google에서 받은 client_secret*.json 을 .secrets 폴더에 넣으면 자동 인식합니다.")
        log("   → python publish.py --youtube-setup 으로 설정하세요.")
    else:
        valid, message = validate_client_secret(client_secret)
        (ok if valid else fail)(f"{client_secret.name}: {message}")
    token_ok, token_message = youtube_token_status(cfg)
    (ok if token_ok else warn)(f"토큰: {token_message}")
    if token_ok:
        channel = describe_youtube_channel(load_stored_youtube_credentials(cfg))
        if channel:
            ok(f"연결된 채널: {channel}")
        log("   게시 준비 완료 — python publish.py --video <mp4> --platforms yt 으로 업로드할 수 있습니다.")
    else:
        log("   → python publish.py --youtube-login 으로 로그인하세요.")


def youtube_menu(cfg: dict) -> None:
    """현재 상태에 맞는 YouTube 다음 단계만 안내합니다."""
    secret = resolve_client_secret(cfg)
    secret_ok = False
    if secret is not None:
        secret_ok, _ = validate_client_secret(secret)
    token_ok, token_message = youtube_token_status(cfg) if secret_ok else (False, "로그인 전")

    log("\n" + "=" * 62)
    log("📺 YouTube Shorts 준비 상태")
    log("=" * 62)
    log(f"  1) OAuth 파일 : {'✅ 인식됨 — ' + secret.name if secret_ok else '❌ 없음 또는 형식 오류'}")
    log(f"  2) 로그인 토큰: {'✅ ' + token_message if token_ok else '⚠️  ' + token_message}")
    if token_ok:
        channel = describe_youtube_channel(load_stored_youtube_credentials(cfg))
        if channel:
            log(f"  3) 연결된 채널: {channel}")
    log("=" * 62)

    if secret_ok and token_ok:
        if ask_yes_no("이미 준비됐습니다. 다시 로그인할까요?", False):
            youtube_login(cfg, force=True)
        return
    if secret_ok:
        log("⚠️  로그인 전에 확인하세요")
        log("  · 승인 화면에서 '테스트 사용자'로 등록한 Google 계정을 선택해야 합니다.")
        log("  · 등록 안 된 계정을 고르면 403 access_denied 로 실패합니다.")
        log(f"  · 테스트 사용자 등록: {YOUTUBE_AUDIENCE_URL}")
        if ask_yes_no("테스트 사용자 설정 페이지를 먼저 열까요?", False):
            open_url(YOUTUBE_AUDIENCE_URL)
        if ask_yes_no("지금 브라우저로 YouTube 로그인을 진행할까요?", True):
            youtube_login(cfg)
        return
    if ask_yes_no("OAuth 파일이 아직 없습니다. 단계별 설정 안내를 열까요?", True):
        youtube_setup_guide()


# --------------------------------------------------------------------------- #
# YouTube Shorts (공식 Data API v3)
# --------------------------------------------------------------------------- #
def upload_youtube(video: Path, meta: dict, cfg: dict, dry_run: bool) -> str | None:
    yt = cfg.get("youtube", {})
    if not yt.get("enabled", True):
        return None
    if dry_run:
        log("   [YouTube Shorts] 업로드 예정 (dry-run)")
        return "dry-run"
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
    except ImportError:
        fail("google-api-python-client 미설치 — pip install -r requirements.txt")
        return None
    creds = get_youtube_credentials(cfg, interactive=True)
    if not creds:
        return None

    youtube = build("youtube", "v3", credentials=creds)
    desc = meta["desc"]
    if meta["hashtags"]:
        desc = f"{desc}\n\n{meta['hashtags']}" if desc else meta["hashtags"]

    tags = list(yt.get("tags", [])) + [t.lstrip("#") for t in meta["hashtags"].split() if t.lstrip("#")]
    body = {
        "snippet": {
            "title": meta["title"],
            "description": desc,
            "tags": tags[:500],
            "categoryId": str(yt.get("category_id", "27")),  # 27 = Education
            "defaultLanguage": "ko",
        },
        "status": {
            "privacyStatus": args_youtube_privacy(yt),
            "selfDeclaredMadeForKids": False,
        },
    }
    media = MediaFileUpload(str(video), mimetype="video/mp4", resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    log("   YouTube 업로드 시작...")
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            log(f"   업로드 진행률: {int(status.progress() * 100)}%")
    video_id = response.get("id")
    return f"https://youtu.be/{video_id}"


def args_youtube_privacy(yt: dict) -> str:
    global _yt_privacy_override
    if _yt_privacy_override:
        return _yt_privacy_override
    return yt.get("privacy", "public")


# --------------------------------------------------------------------------- #
# 게시된 영상 메타 갱신 — 새 설명 형식(모든 단어·퀴즈 정답 위치) 반영
# --------------------------------------------------------------------------- #
YT_URL_RE = re.compile(r"youtu\.be/([\w-]+)")


def yt_refresh_targets(video: Path | None = None) -> list[dict]:
    """게시 이력에서 YouTube 영상 id·로컬 경로를 모읍니다(같은 영상은 마지막 게시 기준)."""
    found: dict[str, dict] = {}
    for r in read_history_rows():
        if r.get("event") != "publish":
            continue
        m = YT_URL_RE.search(r.get("url", ""))
        if not m:
            continue
        path = Path(r.get("video", "") or "")
        if not path.is_absolute():
            path = PROMO / path
        if video is not None and path.resolve() != video.resolve():
            continue
        found[m.group(1)] = {"video_id": m.group(1), "video": path, "title": r.get("title", "")}
    return list(found.values())[::-1]  # 최근 게시한 영상이 먼저 오도록


def refresh_youtube_descriptions(cfg: dict, *, video: Path | None = None,
                                 apply: bool = False, keep_title: bool = False) -> None:
    """게시된 YouTube 영상의 제목·설명을 최신 형식으로 다시 만듭니다.

    make_shorts.py 가 남긴 메타(*.json)로 새 형식 설명(모든 단어·퀴즈 정답 위치 포함)을
    만들어 YouTube videos.update 로 교체합니다. 태그·카테고리·언어 설정은 그대로 두고
    설명(과 선택적으로 제목)만 바꿉니다. 이미 공개된 영상이라 조심스럽게 바꾸도록
    기본은 미리보기이고, apply=True 일 때만 실제로 수정합니다.
    """
    targets = yt_refresh_targets(video)
    if not targets:
        warn("게시 이력에서 YouTube 영상을 찾지 못했습니다. (--history 로 확인)")
        return
    plans: list[dict] = []
    for t in targets:
        saved = load_video_meta(t["video"])
        if not saved:
            # 메타가 없으면 영상에 무엇이 들어갔는지 몰라 설명을 지어내면 어긋납니다 — 건너뜁니다.
            warn(f"메타 없음 — 건너뜁니다: {t['video'].name} ({t['video_id']})")
            continue
        m_args = argparse.Namespace(video=str(t["video"]), unit=None, title=None, desc=None,
                                    platforms="auto", dry_run=True, youtube_privacy=None,
                                    allow_repeat=False)
        meta = build_meta(cfg, m_args)
        desc = meta["desc"]
        if meta.get("hashtags"):
            desc = f"{desc}\n\n{meta['hashtags']}" if desc else meta["hashtags"]
        plans.append({**t, "meta": meta, "new_desc": desc})
    if not plans:
        warn("메타가 있는 영상이 없어 갱신할 수 없습니다.")
        return

    log(f"\n🎬 게시된 영상 설명 갱신 대상 {len(plans)}건 (새 형식: 모든 단어·정답 위치)")
    for i, p in enumerate(plans, 1):
        log(f"  {i}. {p['video'].name} · https://youtu.be/{p['video_id']}")
        if keep_title:
            log(f"     제목: 유지 — {p['title'][:60]}")
        else:
            log(f"     제목(신): {p['meta']['title']}")
        log(f"     설명(신): {len(p['new_desc']):,}자 — {p['new_desc'].splitlines()[0]}")
    if len(plans) == 1:
        log("\n--- 새 설명 전체 ---")
        log(plans[0]["new_desc"])
        log("--- 여기까지 ---")
    if not apply:
        log("\n미리보기입니다. 적용하려면 --apply 를 붙이거나 메뉴 28 번을 사용하세요.")
        return

    try:
        from googleapiclient.discovery import build
    except ImportError:
        fail("google-api-python-client 미설치 — pip install -r requirements.txt")
        return
    creds = get_youtube_credentials(cfg, interactive=True)
    if not creds:
        return
    youtube = build("youtube", "v3", credentials=creds, cache_discovery=False)
    done = 0
    for p in plans:
        vid = p["video_id"]
        try:
            resp = youtube.videos().list(part="snippet", id=vid).execute()
            found = resp.get("items") or []
            if not found:
                warn(f"YouTube 에서 영상을 찾지 못했습니다(삭제·비공개?): {vid}")
                continue
            old = found[0].get("snippet", {})
            # videos.update 는 snippet 을 통째로 바꾸므로 기존 태그·언어를 그대로 되돌려 넣습니다.
            snippet = {
                "title": old.get("title", "") if keep_title else p["meta"]["title"],
                "description": p["new_desc"],
                "categoryId": old.get("categoryId") or "27",
                "tags": old.get("tags", []),
            }
            for key in ("defaultLanguage", "defaultAudioLanguage"):
                if old.get(key):
                    snippet[key] = old[key]
            youtube.videos().update(part="snippet", body={"id": vid, "snippet": snippet}).execute()
            done += 1
            ok(f"갱신 완료: {p['video'].name} → https://youtu.be/{vid}")
            append_history(event="refresh-desc", status="success", platform="yt",
                           video=str(p["video"]), title=snippet["title"],
                           url=f"https://youtu.be/{vid}",
                           message="제목·설명 갱신" + (" (제목 유지)" if keep_title else ""))
        except Exception as exc:  # 영상마다 기록만 남기고 다음 영상은 계속 진행합니다.
            warn(f"갱신 실패: {vid} — {exc}")
            append_history(event="refresh-desc", status="failed", platform="yt",
                           video=str(p["video"]), title=p["meta"]["title"],
                           url=f"https://youtu.be/{vid}", message=str(exc)[:200])
    ok(f"YouTube 설명 갱신 완료: {done}/{len(plans)}건")


# --------------------------------------------------------------------------- #
# Instagram Reels (instagrapi)
# --------------------------------------------------------------------------- #
def instagram_login(cl, ig: dict) -> None:
    """instagrapi 로그인. 2FA·챌린지 코드를 처리합니다."""
    username = str(ig.get("username") or "")
    password = str(ig.get("password") or "")
    verification_code = str(ig.get("verification_code") or "").strip()
    totp_secret = str(ig.get("totp_secret") or "").strip()
    proxy = str(ig.get("proxy") or "").strip()
    if proxy:
        try:
            cl.set_proxy(proxy)
            log(f"   Instagram 프록시 사용: {proxy}")
        except Exception as exc:
            warn(f"프록시 설정 실패(무시하고 진행): {exc}")

    def challenge_code_handler(_username: str, choice) -> str:
        label = getattr(choice, "value", choice)
        warn(f"Instagram 인증 챌린지가 필요합니다 ({label}).")
        return input("Instagram 인증 코드 입력: ").strip()

    try:
        cl.challenge_code_handler = challenge_code_handler
        cl.delay_range = [1, 3]
    except Exception:
        pass

    if verification_code:
        log("   config.json 의 instagram.verification_code 로 2단계 인증합니다.")
        cl.login(username, password, verification_code=verification_code)
        return
    if totp_secret:
        try:
            from pyotp import TOTP
        except ImportError:
            warn("2단계 인증 자동 입력에는 pyotp 가 필요합니다: pip install pyotp")
        else:
            log("   totp_secret 으로 2단계 인증 코드를 생성합니다.")
            cl.login(username, password, verification_code=TOTP(totp_secret).now())
            return
    try:
        cl.login(username, password)
    except Exception as exc:
        text = str(exc).lower()
        if any(key in text for key in ("two-factor", "2fa", "verification", "challenge", "code")):
            warn("Instagram 2단계 인증으로 보입니다.")
            code = input("Instagram 인증 코드(2FA) 입력: ").strip()
            if not code:
                raise
            cl.login(username, password, verification_code=code)
        else:
            raise


def upload_instagram(video: Path, meta: dict, cfg: dict, dry_run: bool) -> str | None:
    ig = cfg.get("instagram", {})
    if not ig.get("enabled", True):
        return None
    username = ig.get("username") or ""
    password = ig.get("password") or ""
    if dry_run:
        account = username if username and not str(username).startswith("YOUR_") else "설정된 계정"
        log(f"   [Instagram Reels] @{account} 계정에 업로드 예정 (dry-run)")
        return "dry-run"
    if not username or not password:
        warn("Instagram 설정 필요: config.json 의 instagram.username / password 를 입력하세요. (README 참고)")
        return None

    try:
        from instagrapi import Client
    except ImportError:
        fail("instagrapi 미설치 — pip install -r requirements.txt")
        return None

    session_file = SECRETS_DIR / (ig.get("session_file") or "ig_session.json")
    cl = Client()
    try:
        if session_file.exists():
            cl.load_settings(session_file)
        instagram_login(cl, ig)
        session_file.parent.mkdir(parents=True, exist_ok=True)
        cl.dump_settings(session_file)
    except Exception as e:
        fail(f"Instagram 로그인 실패: {e}")
        warn("자동 로그인이 막히면 업로드 페이지를 여는 수동 게시 폴백을 사용하세요.")
        return None

    # Instagram 캡션은 2,200자 제한이 있어 초과하면 해시태그를 남기고 자릅니다.
    caption = build_caption(meta, max_len=2200)
    try:
        log("   Instagram Reels 업로드 시작...")
        media = cl.clip_upload(str(video), caption=caption)
        return f"https://www.instagram.com/reel/{media.pk}/"
    except Exception as e:
        fail(f"Instagram 업로드 실패: {e}")
        return None


# --------------------------------------------------------------------------- #
# TikTok (선택 사항 — 비공식, 불안정)
# --------------------------------------------------------------------------- #
def upload_tiktok(video: Path, meta: dict, cfg: dict, dry_run: bool) -> str | None:
    tt = cfg.get("tiktok", {})
    if not tt.get("enabled", False):
        return None
    if dry_run:
        log("   [TikTok] 업로드 예정 (dry-run)")
        return "dry-run"
    warn(
        "TikTok 자동 업로드는 공식 API 승인이 어려워 비공식 라이브러리를 사용합니다.\n"
        "   라이브러리 버전에 따라 API가 자주 바뀌어 실패할 수 있습니다. "
        "config.json 의 tiktok.enabled=true + ms_token 설정 후 재시도하세요."
    )
    ms_token = (tt.get("ms_token") or "").strip()
    if not ms_token:
        warn("TikTok ms_token 이 config.json 에 없어 건너뜁니다.")
        return None
    try:
        from TikTokApi import TikTokApi
    except ImportError:
        warn("TikTokApi 미설치 — pip install TikTokApi playwright 후 "
             "'playwright install chromium' 을 실행하세요 (TikTok은 선택 기능)")
        return None
    try:
        api = TikTokApi()
        session = api.create_sessions(ms_tokens=[ms_token], num_sessions=1, headless=True)[0]
        result = session.upload_video(str(video), title=meta["title"] + "\n" + meta["hashtags"])
        return str(result)
    except Exception as e:
        fail(f"TikTok 업로드 실패(선택 기능, 무시 가능): {e}")
        return None


# --------------------------------------------------------------------------- #
# 터미널 원클릭 메뉴
# --------------------------------------------------------------------------- #
def ask_menu(prompt: str, default: str | None = None) -> str:
    suffix = f" [{default}]" if default is not None else ""
    try:
        value = input(f"{prompt}{suffix}: ").strip()
    except EOFError:
        # 비대화형 실행(작업 스케줄러·파이프 입력)에서는 기본값으로 진행합니다.
        log(f"{prompt}: 입력 없음 — 기본값 {default if default is not None else '없음'} 사용")
        return default or ""
    return value if value else (default or "")


def ask_yes_no(prompt: str, default: bool = True) -> bool:
    default_text = "Y/n" if default else "y/N"
    try:
        value = input(f"{prompt} [{default_text}]: ").strip().lower()
    except EOFError:
        log(f"{prompt}: 입력 없음 — 기본값 {'예' if default else '아니오'} 사용")
        return default
    if not value:
        return default
    return value in ("y", "yes", "예", "ㅇ")


def ask_int(prompt: str, default: int, minimum: int, maximum: int) -> int:
    while True:
        raw = ask_menu(prompt, str(default))
        try:
            value = int(raw)
        except ValueError:
            warn("숫자로 입력해 주세요.")
            continue
        if minimum <= value <= maximum:
            return value
        warn(f"{minimum}~{maximum} 범위로 입력해 주세요.")


def ask_tts_engine(default: str = DEFAULT_TTS_ENGINE) -> str:
    """쇼츠 낭독에 쓸 TTS 엔진을 고릅니다 (auto / piper / windows)."""
    current = normalize_tts_engine(default)
    log("\n쇼츠 낭독 TTS 엔진")
    for key, label in TTS_ENGINES:
        mark = " ← 현재" if key == current else ""
        log(f"  {key:<8} — {label}{mark}")
    log(f"  (설치 상태: piper-tts {'설치됨' if piper_available() else '미설치'} · "
        f"내려받은 로컬 음성 {len(list_piper_voices())}개 · Windows 내장 음성 {len(list_windows_voices())}개)")
    raw = ask_menu("엔진(auto/piper/windows)", current).strip().lower()
    if raw and raw not in ("auto", "piper", "windows", "sapi", "win"):
        warn(f"알 수 없는 엔진 '{raw}' — 자동(auto)으로 처리합니다.")
    return normalize_tts_engine(raw)


def _voice_for_engine(engine: str, current: str, male: bool = False) -> str:
    """엔진에 맞지 않는 목소리 이름이면 그 엔진의 기본값으로 대체해 돌려줍니다."""
    if engine == "piper" and not piper_voice_path(current):
        return piper_default_voice(male=male) or current
    if engine == "windows" and current and not _looks_like_windows_voice(current):
        return DEFAULT_VOICE2 if male else DEFAULT_VOICE
    return current


def ask_voice(prompt: str, default: str, allow_none: bool = False, engine: str = "auto") -> str:
    """목소리를 번호로 고르거나 음성 이름을 직접 입력합니다.

    engine(auto/piper/windows) 에 따라 보여 주는 후보 목록이 달라집니다.
    auto 는 내려받은 로컬(Piper) 음성이 있으면 그 목록을, 없으면 이 PC에 설치된 Windows 음성을 보여 줍니다.
    allow_none=True 이면 '0. 없음' 항목이 생기고, 고르면 빈 문자열을 돌려줍니다(한 목소리만 사용).
    """
    engine = normalize_tts_engine(engine)
    choices = tts_voice_choices(engine)
    shown = voice_label(default, engine) if default else ("없음" if allow_none else "—")
    log(f"\n{prompt} (엔터: {shown})")
    if allow_none:
        log("  0. 없음 — 한 목소리만 사용")
    for i, (name, label) in enumerate(choices, 1):
        log(f"  {i}. {name} — {label}")
    if not choices:
        warn("내려받은 Piper 음성이 없습니다 — 메뉴 29 에서 내려받거나 엔진을 windows 로 두세요.")
    elif engine != "piper" and not list_windows_voices():
        warn("설치된 Windows 음성을 확인하지 못해 기본 후보를 보여 줍니다 — 설치된 음성 이름을 직접 입력해도 됩니다.")
    log("  번호를 고르거나 음성 이름을 직접 입력하세요.")
    raw = ask_menu("목소리 번호/이름", default or ("0" if allow_none else "")).strip()
    if allow_none and (raw == "0" or raw.lower() in ("none", "off", "-", "없음")):
        return ""
    if raw.isdigit():
        idx = int(raw)
        if 1 <= idx <= len(choices):
            return choices[idx - 1][0]
    return raw or default


def choose_unit(default: int = 1) -> int:
    while True:
        raw = ask_menu("UNIT 번호(1~30)", str(default))
        try:
            unit = int(raw)
        except ValueError:
            warn("숫자로 입력해 주세요.")
            continue
        if 1 <= unit <= 30:
            return unit
        warn("UNIT은 1부터 30까지입니다.")


def choose_platforms_menu(cfg: dict, default: str = "") -> str:
    enabled = resolve_platforms(cfg, "auto")
    labels = {"yt": "YouTube Shorts", "ig": "Instagram Reels", "tt": "TikTok"}
    log("\n게시 플랫폼(쉼표로 복수 선택)")
    for short in ("yt", "ig", "tt"):
        state = "활성" if short in enabled else "비활성/설정 필요"
        log(f"  {short} = {labels[short]} ({state})")
    value = ask_menu("선택", default or (",".join(enabled) or "yt"))
    chosen = [p.strip().lower() for p in value.split(",") if p.strip()]
    invalid = [p for p in chosen if p not in labels]
    if invalid:
        warn(f"알 수 없는 플랫폼을 제외합니다: {', '.join(invalid)}")
    chosen = [p for p in chosen if p in labels]
    return ",".join(chosen) or "yt"


def newest_video_since(started: float) -> Path | None:
    """방금 돌린 생성기가 만든 영상 — 시작 시각 이후에 만들어진 mp4 중 가장 최근.

    숙어 영상은 파일명이 첫 표현을 따라 미리 알 수 없어서, 생성을 마친 뒤 이렇게 찾습니다.
    (단순 '폴더에서 가장 최근 파일'은 다른 영상이 새로 생겼을 때 잘못 집을 수 있습니다.)
    """
    if not SHORTS_DIR.exists():
        return None
    fresh = [f for f in SHORTS_DIR.glob("*.mp4") if f.stat().st_mtime >= started - 1]
    return max(fresh, key=lambda f: f.stat().st_mtime) if fresh else None


def list_videos_menu() -> list[Path]:
    return sorted(SHORTS_DIR.glob("*.mp4"), key=lambda f: f.stat().st_mtime, reverse=True) if SHORTS_DIR.exists() else []


def choose_video_menu() -> Path | None:
    videos = list_videos_menu()
    if not videos:
        warn("assets/shorts 폴더에 mp4 영상이 없습니다.")
        return None
    log("\n게시할 영상")
    for i, video in enumerate(videos, 1):
        size = video.stat().st_size / (1024 * 1024)
        log(f"  {i}. {video.name} ({size:.1f}MB)")
    while True:
        raw = ask_menu("번호", "1")
        try:
            idx = int(raw) - 1
            return videos[idx]
        except (ValueError, IndexError):
            warn("목록에 있는 번호를 입력해 주세요.")


def run_batch_menu(cfg: dict) -> None:
    """메뉴 10: 여러 영상을 선택해 같은 UNIT·플랫폼으로 순차 게시합니다."""
    videos = list_videos_menu()
    if not videos:
        warn("assets/shorts 폴더에 mp4 영상이 없습니다.")
        return
    log("\n일괄 게시할 영상 (쉼표 구분, 범위 가능 — 예: 1,3,5 또는 1-3)")
    for i, video in enumerate(videos, 1):
        size = video.stat().st_size / (1024 * 1024)
        log(f"  {i}. {video.name} ({size:.1f}MB)")
    raw = ask_menu("번호", "1")
    selected: list[int] = []
    for token in raw.replace(" ", "").split(","):
        if not token:
            continue
        if "-" in token:
            a, _, b = token.partition("-")
            try:
                selected.extend(range(int(a), int(b) + 1))
            except ValueError:
                continue
        else:
            try:
                selected.append(int(token))
            except ValueError:
                continue
    picked = [videos[i - 1] for i in dict.fromkeys(selected) if 1 <= i <= len(videos)]
    if not picked:
        warn("선택한 영상이 없습니다.")
        return
    unit = choose_unit()
    platforms = choose_platforms_menu(cfg)
    allow_repeat = ask_yes_no("이미 게시한 영상도 다시 게시할까요?", False)
    if not allow_repeat:
        skipped = [v for v in picked if posted_platforms(v)]
        if skipped:
            for video in skipped:
                warn(f"{video.name}: 이미 게시된 영상이라 건너뜁니다.")
            picked = [v for v in picked if v not in skipped]
            if not picked:
                warn("새로 게시할 영상이 없습니다. (중복 허용을 선택하면 다시 게시할 수 있습니다.)")
                return
    dry_run = ask_yes_no("dry-run으로 미리 확인할까요?", True)
    if not dry_run:
        log("⚠️ 실제 게시를 진행합니다. 각 플랫폼에 콘텐츠가 업로드됩니다.")
        if not ask_yes_no(f"{len(picked)}개 영상을 정말 게시할까요?", False):
            log("일괄 게시를 취소했습니다.")
            return
    for video in picked:
        log(f"\n▶ {video.name} 게시 시작")
        v_args = argparse.Namespace(video=str(video), unit=unit, title=None, desc=None,
                                    platforms=platforms, dry_run=dry_run, youtube_privacy=None,
                                    allow_repeat=allow_repeat)
        publish_single(cfg, v_args, video)
    ok(f"일괄 게시 처리 완료: {len(picked)}개 영상")


# ------------------------------------------------------- 콘텐츠 자동 준비 ----
AUTO_KINDS = ("unit", "idioms", "frequency", "paraphrase")


def next_unit_with_remaining() -> int | None:
    """남은 단어가 가장 많은 UNIT 을 돌려줍니다(모두 소진되면 None)."""
    best, best_n = None, -1
    for i in range(1, 31):
        words = load_unit_words(i) or []
        used = posted_words_for_unit(i)
        n = len([w for w in words if normalize_word(w[0]) not in used])
        if n > best_n:
            best, best_n = i, n
    return best if best_n > 0 else None


def build_shorts_command(cfg: dict, kind: str, words: int) -> list[str] | None:
    """make_shorts.py 실행 명령 — config 의 기본값(테마·스타일·목소리)을 그대로 씁니다."""
    promo = cfg.get("promo", {})
    theme = str(promo.get("default_theme", "blue")).lower()
    style = str(promo.get("default_style", "classic")).lower()
    command = [sys.executable, str(PROMO / "make_shorts.py"),
               "--words", str(words), "--bg", theme, "--style", style]
    if kind == "idioms":
        command.append("--idioms")
    elif kind == "frequency":
        command.append("--frequency")
    elif kind == "paraphrase":
        command.append("--paraphrase")
    else:
        unit = next_unit_with_remaining()
        if unit is None:
            return None
        command.extend(["--unit", str(unit)])
    if bool(promo.get("default_tts", False)):
        command.append("--tts")
        command.extend(["--engine", tts_engine_of(cfg)])
        command.extend(["--voice", str(promo.get("default_voice", DEFAULT_VOICE) or DEFAULT_VOICE)])
        voice2 = str(promo.get("default_voice2", DEFAULT_VOICE2) or "")
        if voice2:
            command.extend(["--voice2", voice2])
        else:
            command.append("--single-voice")
    else:
        command.append("--no-tts")
    return command


def run_auto_plan(cfg: dict, count: int, kind: str = "auto", *, start_at: str | None = None,
                  interval_days: int = 1, words: int | None = None,
                  platforms: str | None = None, privacy: str | None = None) -> list[Path]:
    """N일치 쇼츠를 자동 생성하고, 시작 시각이 있으면 예약 게시까지 등록합니다.

    kind=auto 는 종류를 돌려가며 섞어 만듭니다(남은 콘텐츠가 많은 종류 우선).
    기본값(테마·스타일·목소리·항목 수)은 config.json 의 promo 설정을 따릅니다.
    """
    promo = cfg.get("promo", {})
    if words is None:
        try:
            words = int(promo.get("default_words", 5) or 5)
        except (TypeError, ValueError):
            words = 5
    words = min(10, max(1, words))
    count = min(10, max(1, count))
    interval_days = max(1, interval_days)

    log("\n" + "=" * 62)
    label = ", ".join(KIND_LABELS.get(k, k) for k in (kind,) if k != "auto") if kind != "auto" else "자동(남은 콘텐츠 많은 순)"
    log(f"🗓️ 콘텐츠 자동 준비 — {count}개 · {label} · 항목 {words}개씩")
    log("=" * 62)

    videos: list[Path] = []
    planned: dict[str, int] = {}
    for n in range(count):
        pick = kind
        if kind == "auto":
            inv = {r["key"]: r for r in content_inventory()}

            def remaining(k: str) -> int:
                return max(0, int(inv.get(k, {}).get("remaining", 0)) - planned.get(k, 0))

            candidates = [k for k in AUTO_KINDS if remaining(k) > 0]
            if not candidates:
                warn("남은 콘텐츠가 없어 중단합니다 — 새 콘텐츠를 추가하거나 --reset-posted 로 초기화하세요.")
                break
            # 아직 안 만든 종류를 먼저 섞고, 같은 묶음 안에서는 남은 콘텐츠가 많은 쪽부터.
            pick = min(candidates, key=lambda k: (planned.get(k, 0), -remaining(k)))
        planned[pick] = planned.get(pick, 0) + 1
        command = build_shorts_command(cfg, pick, words)
        if command is None:
            warn("남은 단어가 있는 UNIT 이 없어 중단합니다.")
            break
        log(f"\n▶ [{n + 1}/{count}] {KIND_LABELS.get(pick, pick)} 쇼츠 생성")
        started = time.time()
        if not run_menu_command(command):
            fail(f"{n + 1}번째 쇼츠 생성에 실패해 중단합니다.")
            break
        video = newest_video_since(started)
        if video is None:
            fail("생성된 영상을 찾지 못했습니다.")
            break
        videos.append(video)
        ok(f"생성 완료: {video.name}")

    if not videos:
        warn("만들어진 영상이 없습니다.")
        return []

    if not start_at:
        log("\n생성만 완료했습니다. 예약 게시하려면:")
        log('  python publish.py --auto-plan N --plan-start "YYYY-MM-DD HH:MM"')
        log("  또는 메뉴 21번에서 '예약 등록', 영상 하나씩은 메뉴 18번을 쓸 수 있습니다.")
        return videos

    platforms = platforms or (",".join(resolve_platforms(cfg, "auto")) or "yt")
    privacy = (privacy or str(promo.get("default_privacy", "unlisted"))).lower()
    if privacy not in ("public", "unlisted", "private"):
        privacy = "unlisted"
    try:
        first = parse_schedule_time(start_at)
    except ValueError as exc:
        fail(f"첫 예약 일시가 올바르지 않습니다: {exc}")
        return videos
    ok(f"\n예약 게시 등록 — {len(videos)}건 · 플랫폼 {platforms} · YouTube 공개 {privacy}")
    for i, video in enumerate(videos):
        when = (first + timedelta(days=interval_days * i)).strftime("%Y-%m-%d %H:%M")
        try:
            item = create_schedule(video=video, unit=None, platforms=platforms,
                                   privacy=privacy, scheduled_at=when)
        except ValueError as exc:
            warn(f"{video.name}: 예약 실패 — {exc}")
            continue
        ok(f"  · {item['id']} · {item['scheduled_at']} · {video.name}")
    log("\n예약 시각에 '7. 예약 게시 실행' 또는 --run-due 를 실행하면 게시됩니다.")
    log("(Windows 작업 스케줄러 — 메뉴 25번 — 에 등록하면 자동으로 확인합니다.)")
    return videos


def auto_plan_menu(cfg: dict) -> None:
    """메뉴 21: 하루치(또는 N일치) 콘텐츠를 자동으로 만들고 예약 게시까지 등록합니다."""
    promo = cfg.get("promo", {})
    try:
        default_words = int(promo.get("default_words", 5) or 5)
    except (TypeError, ValueError):
        default_words = 5
    count = ask_int("준비할 영상 수(1~10)", 3, 1, 10)
    kind = ask_menu("종류 (auto/unit/idioms/frequency/paraphrase)", "auto").lower()
    if kind not in ("auto",) + AUTO_KINDS:
        warn("알 수 없는 종류라 자동으로 진행합니다.")
        kind = "auto"
    words = ask_int("영상에 넣을 항목 수(1~10)", default_words, 1, 10)
    mode = ask_menu("예약 게시 등록(s) / 생성만(g)", "s").lower()
    if mode in ("g", "생성", "생성만"):
        run_auto_plan(cfg, count, kind, words=words)
        return
    default_start = (datetime.now().astimezone() + timedelta(days=1)).strftime("%Y-%m-%d") + " 19:00"
    start = ask_menu("첫 예약 일시(YYYY-MM-DD HH:MM)", default_start)
    interval = ask_int("게시 간격(일)", 1, 1, 30)
    platforms = choose_platforms_menu(cfg)
    default_privacy = str(promo.get("default_privacy", "unlisted")).lower()
    if default_privacy not in ("public", "unlisted", "private"):
        default_privacy = "unlisted"
    privacy = ask_menu("YouTube 공개 범위(public/unlisted/private)", default_privacy)
    if privacy not in ("public", "unlisted", "private"):
        privacy = "unlisted"
    run_auto_plan(cfg, count, kind, start_at=start, interval_days=interval,
                  words=words, platforms=platforms, privacy=privacy)


def probe_video_info(video: Path) -> dict:
    """ffprobe로 해상도·길이·크기를 가져옵니다. (실패 시 안전한 기본값)"""
    info = {"width": 0, "height": 0, "duration": 0.0, "size_mb": 0.0}
    try:
        info["size_mb"] = video.stat().st_size / (1024 * 1024)
    except OSError:
        pass
    try:
        r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                            "-show_entries", "stream=width,height:format=duration",
                            "-of", "json", str(video)], capture_output=True, text=True)
        data = json.loads(r.stdout)
        if data.get("streams"):
            info["width"] = int(data["streams"][0]["width"])
            info["height"] = int(data["streams"][0]["height"])
        if data.get("format", {}).get("duration"):
            info["duration"] = float(data["format"]["duration"])
    except Exception:
        pass
    return info


def describe_saved_meta(saved: dict) -> str:
    """영상 메타를 메뉴 안내용 한 줄로 만듭니다(예: 숙어 · 항목 5개)."""
    kind = str(saved.get("kind"))
    where = ("숙어" if kind == "idioms"
             else "빈도 어휘" if kind == "frequency"
             else "동의어 치환" if kind == "paraphrase"
             else f"UNIT {saved.get('unit')}")
    return f"{where} · 항목 {len(saved.get('items') or [])}개"


def verify_video_menu(cfg: dict) -> None:
    """메뉴 11: 배포 전 영상을 재생·점검하고 게시 메타를 확인한 뒤 게시를 진행합니다."""
    video = choose_video_menu()
    if video is None:
        return
    saved = load_video_meta(video)
    if saved:
        unit = saved.get("unit") if isinstance(saved.get("unit"), int) else None
        log(f"영상 메타 사용: {describe_saved_meta(saved)} (제목·설명 자동)")
    else:
        unit = choose_unit()
    v_args = argparse.Namespace(video=str(video), unit=unit, title=None, desc=None,
                                platforms="auto", dry_run=True, youtube_privacy=None,
                                allow_repeat=False)
    meta = build_meta(cfg, v_args)
    info = probe_video_info(video)
    ratio = (info["width"] / info["height"]) if info["height"] else 0.0
    is_9x16 = 0.52 <= ratio <= 0.60
    is_short = 0 < info["duration"] <= 61
    log("\n" + "=" * 62)
    log("🔍 배포 전 검증")
    log("=" * 62)
    log(f"영상  : {video.name}")
    log(f"크기  : {info['size_mb']:.1f}MB")
    ratio_text = f"{info['width']}x{info['height']}"
    if info["width"]:
        ratio_text += f" ({info['width'] / info['height']:.3f}:1)" if info["height"] else ""
    log(f"해상도: {ratio_text} · " + ("9:16 세로(Shorts) ✓" if is_9x16 else "⚠️ 9:16 세로가 아닙니다"))
    dur_text = f"{info['duration']:.1f}초" if info["duration"] else "측정 불가"
    log(f"길이  : {dur_text} · " + ("60초 이내 ✓" if is_short else "⚠️ 60초 초과 — Shorts가 아닐 수 있습니다"))
    log(f"제목  : {meta['title']}")
    if meta["desc"]:
        first = meta["desc"].splitlines()[0]
        log(f"설명  : {first}" + (" …" if len(meta["desc"]) > len(first) else ""))
    if meta["hashtags"]:
        log(f"해시태그: {meta['hashtags']}")
    log("-" * 62)
    if ask_yes_no("영상을 기본 플레이어로 열어 직접 확인할까요?", True):
        open_path(video)
    if not ask_yes_no("이 영상으로 게시를 진행할까요?", False):
        log("검증만 하고 종료합니다.")
        return
    platforms = choose_platforms_menu(cfg)
    privacy = ask_menu("YouTube 공개 범위(public/unlisted/private)",
                       str(cfg.get("promo", {}).get("default_privacy", "unlisted")))
    if privacy not in ("public", "unlisted", "private"):
        privacy = "unlisted"
    dry_run = ask_yes_no("먼저 dry-run으로 확인할까요?", True)
    if not dry_run:
        log("⚠️ 실제 게시를 진행합니다. 각 플랫폼에 콘텐츠가 업로드됩니다.")
        if not ask_yes_no("정말 게시할까요?", False):
            log("게시를 취소했습니다.")
            return
    v_args.platforms = platforms
    v_args.youtube_privacy = privacy
    v_args.dry_run = dry_run
    publish_single(cfg, v_args, video)


def run_menu_command(command: list[str]) -> bool:
    log("\n$ " + " ".join(f'"{x}"' if " " in x else x for x in command))
    result = subprocess.run(command, cwd=str(PROMO))
    return result.returncode == 0


def show_history_menu() -> None:
    rows = read_history_rows()
    if not rows:
        log("게시 이력이 아직 없습니다.")
        return
    log(f"\n게시 이력 {len(rows)}건 · {HISTORY_FILE.name}")
    for row in rows[-10:][::-1]:
        log(f"  {row.get('timestamp', '')} | {row.get('event', '')} | {row.get('status', '')} | "
            f"{row.get('platform', '')} | {row.get('title', '')[:45]}")
    log(f"전체 CSV 열기: {HISTORY_FILE}")


def read_history_rows() -> list[dict]:
    if not HISTORY_FILE.exists():
        return []
    with HISTORY_FILE.open("r", newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def write_history_report(open_after: bool = True) -> Path | None:
    """게시 이력 CSV를 요약 통계와 함께 HTML 리포트로 만듭니다."""
    rows = read_history_rows()
    if not rows:
        warn("게시 이력이 아직 없어 리포트를 만들 수 없습니다.")
        return None
    publishes = [r for r in rows if r.get("event") == "publish"]
    status_count: dict[str, int] = {}
    platform_count: dict[str, int] = {}
    for r in publishes:
        status = r.get("status", "") or ""
        status_count[status] = status_count.get(status, 0) + 1
        platform = r.get("platform", "") or ""
        if platform:
            platform_count[platform] = platform_count.get(platform, 0) + 1
    # 조회수는 이력 CSV 에 없어 performance.json (성과 수집 결과)에서 가져옵니다.
    total_views = 0
    try:
        perf = json.loads(PERF_FILE.read_text(encoding="utf-8"))
        total_views = sum(int(i.get("view_count", 0) or 0) for i in perf.get("items", []))
    except (OSError, json.JSONDecodeError, AttributeError):
        pass
    names = {"yt": "YouTube Shorts", "ig": "Instagram Reels", "tt": "TikTok"}
    cards = "".join(
        f'<div class="card"><b>{v}</b><span>{k}</span></div>'
        for k, v in [("총 게시", len(publishes)),
                     ("성공", status_count.get("success", 0)),
                     ("실패", status_count.get("failed", 0)),
                     ("dry-run", status_count.get("dry-run", 0)),
                     ("총 조회수", f"{total_views:,}")])
    plat = "".join(
        f"<li>{names.get(k, k)}: {v}건</li>" for k, v in sorted(platform_count.items()))
    table_rows = "".join(
        f"<tr><td>{esc_html(r.get('timestamp', ''))}</td>"
        f"<td>{esc_html(names.get(r.get('platform', ''), r.get('platform', '')))}</td>"
        f"<td>{esc_html(r.get('status', ''))}</td>"
        f"<td>{esc_html(r.get('title', ''))[:50]}</td>"
        f"<td>{'<a href="' + esc_html(r.get('url', '')) + '" target="_blank" rel="noopener">링크</a>' if r.get('url') else ''}</td></tr>"
        for r in publishes[-100:][::-1])
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>게시 이력 리포트 · toeic.monster</title>
<style>
  body {{ font-family: 'Malgun Gothic', sans-serif; background: #0b1220; color: #e6edf7; margin: 0; padding: 32px; }}
  h1 {{ font-size: 22px; }} .sub {{ color: #8fa3c0; font-size: 13px; margin-bottom: 24px; }}
  .cards {{ display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }}
  .card {{ background: #16233a; border: 1px solid #24344f; border-radius: 12px; padding: 14px 20px; min-width: 100px; }}
  .card b {{ display: block; font-size: 24px; color: #7dd3fc; }} .card span {{ font-size: 12px; color: #8fa3c0; }}
  ul {{ color: #aebfd8; font-size: 13px; margin-bottom: 24px; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
  th, td {{ text-align: left; padding: 8px 10px; border-bottom: 1px solid #24344f; }}
  th {{ color: #8fa3c0; font-size: 12px; }} a {{ color: #7dd3fc; }}
</style>
</head>
<body>
<h1>📊 게시 이력 리포트</h1>
<div class="sub">생성: {now_iso()} · 총 {len(rows)}건 이벤트 중 게시 {len(publishes)}건</div>
<div class="cards">{cards}</div>
<ul>{plat}</ul>
<table><thead><tr><th>시각</th><th>플랫폼</th><th>상태</th><th>제목</th><th>링크</th></tr></thead><tbody>{table_rows}</tbody></table>
</body></html>"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORT_DIR / "publish_report.html"
    out.write_text(html, encoding="utf-8")
    ok(f"게시 이력 리포트 생성: {out}")
    if open_after:
        open_path(out)
    return out


def esc_html(value: str) -> str:
    return (str(value).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


# --------------------------------------------------------------------------- #
# 게시 성과 추적
# --------------------------------------------------------------------------- #
def fetch_youtube_stats(cfg: dict, video_ids: list[str]) -> list[dict]:
    """YouTube Data API 로 영상 조회수·좋아요를 수집합니다 (공개 데이터라 API key 사용)."""
    yt = cfg.get("youtube", {})
    api_key = str(yt.get("api_key") or "").strip()
    try:
        from googleapiclient.discovery import build
    except ImportError:
        warn("google-api-python-client 미설치 — pip install -r requirements.txt")
        return []
    if api_key:
        service = build("youtube", "v3", developerKey=api_key)
    else:
        # OAuth 토큰 폴백 (업로드 스코프 토큰은 읽기가 제한될 수 있어 실패 시 안내)
        try:
            from google.oauth2.credentials import Credentials
            from google.auth.transport.requests import Request
        except ImportError:
            warn("google-auth 미설치 — pip install -r requirements.txt")
            return []
        token_file = SECRETS_DIR / (yt.get("token_file") or "youtube_token.json")
        if not token_file.exists():
            warn("YouTube 성과 수집에 필요: config.json 의 youtube.api_key 를 설정하거나 OAuth 토큰을 준비하세요.")
            return []
        try:
            creds = Credentials.from_authorized_user_file(str(token_file))
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
            service = build("youtube", "v3", credentials=creds)
        except Exception as exc:
            warn(f"YouTube OAuth 토큰을 사용할 수 없습니다: {exc} — youtube.api_key 설정을 권장합니다.")
            return []
    items: list[dict] = []
    for i in range(0, len(video_ids), 50):
        resp = service.videos().list(part="statistics,snippet",
                                     id=",".join(video_ids[i:i + 50])).execute()
        for item in resp.get("items", []):
            st = item.get("statistics", {})
            items.append({
                "platform": "yt",
                "video_id": item.get("id", ""),
                "title": item.get("snippet", {}).get("title", ""),
                "view_count": int(st.get("viewCount", 0) or 0),
                "like_count": int(st.get("likeCount", 0) or 0),
                "comment_count": int(st.get("commentCount", 0) or 0),
                "published_at": item.get("snippet", {}).get("publishedAt", ""),
            })
    return items


def fetch_instagram_stats(cfg: dict, media_pks: list[str]) -> list[dict]:
    """instagrapi 로 게시한 Reels 의 성과를 수집합니다."""
    ig = cfg.get("instagram", {})
    username = str(ig.get("username") or "")
    password = str(ig.get("password") or "")
    if not username or not password or str(username).startswith("YOUR_"):
        warn("Instagram 성과 수집은 config.json 의 username/password 가 필요합니다.")
        return []
    try:
        from instagrapi import Client
    except ImportError:
        warn("instagrapi 미설치 — pip install -r requirements.txt")
        return []
    cl = Client()
    session_file = SECRETS_DIR / (ig.get("session_file") or "ig_session.json")
    if session_file.exists():
        try:
            cl.load_settings(session_file)
        except Exception:
            pass
    try:
        cl.login(username, password)
        if session_file.exists():
            cl.dump_settings(session_file)
    except Exception as exc:
        warn(f"Instagram 로그인 실패 — 성과 수집 불가: {exc}")
        return []
    items: list[dict] = []
    for pk in media_pks:
        try:
            info = cl.media_info(pk)
            caption = getattr(info, "caption_text", "") or ""
            items.append({
                "platform": "ig",
                "media_id": pk,
                "title": caption[:80],
                "view_count": int(getattr(info, "view_count", 0) or 0),
                "like_count": int(getattr(info, "like_count", 0) or 0),
                "comment_count": int(getattr(info, "comment_count", 0) or 0),
                "published_at": str(getattr(info, "taken_at", "") or ""),
            })
        except Exception as exc:
            warn(f"IG 미디어 {pk} 성과 수집 실패: {exc}")
    return items


def display_performance(items: list[dict]) -> None:
    if not items:
        log("수집된 성과가 없습니다.")
        return
    names = {"yt": "YouTube Shorts", "ig": "Instagram Reels"}
    log("\n📈 최근 게시 성과")
    log(f"  {'플랫폼':<16}{'제목':<42}{'조회수':>9}{'좋아요':>8}{'댓글':>7}")
    for item in items:
        log(f"  {names.get(item['platform'], item['platform']):<16}{item['title'][:40]:<42}"
            f"{item['view_count']:>9,}{item['like_count']:>8,}{item['comment_count']:>7,}")
    total_views = sum(i["view_count"] for i in items)
    total_likes = sum(i["like_count"] for i in items)
    log(f"  합계: 조회수 {total_views:,} · 좋아요 {total_likes:,} (게시물 {len(items)}건)")


# ------------------------------------------------------- 성과 인사이트 ----
KIND_LABELS = {"unit": "단어", "idioms": "숙어", "frequency": "빈도 어휘",
               "paraphrase": "동의어 치환", "other": "기타"}


def classify_title(title: str) -> str:
    """게시 제목에서 콘텐츠 종류를 판별합니다(성과 인사이트용)."""
    t = str(title or "")
    if "동의어 치환" in t:
        return "paraphrase"
    if "빈출 숙어" in t or "TOEIC 숙어" in t:
        return "idioms"
    if "빈출 어휘" in t:
        return "frequency"
    if "필수 어휘" in t:
        return "unit"
    return "other"


def _published_hour(value: str) -> int | None:
    """게시 일시에서 로컬 시간대 기준 '시'를 뽑습니다(형식이 이상하면 None)."""
    raw = str(value or "").replace("Z", "+00:00").replace(" ", "T")
    try:
        return datetime.fromisoformat(raw).astimezone().hour
    except ValueError:
        return None


def performance_insights(items: list[dict]) -> dict:
    """성과 데이터에서 종류별 성과·좋은 게시 시간대·TOP 영상을 뽑습니다."""
    by_kind: dict[str, list[dict]] = {}
    for it in items:
        by_kind.setdefault(classify_title(it.get("title", "")), []).append(it)
    kind_stats = []
    for k, rows in by_kind.items():
        views = [int(r.get("view_count", 0) or 0) for r in rows]
        likes = sum(int(r.get("like_count", 0) or 0) for r in rows)
        kind_stats.append({"kind": k, "label": KIND_LABELS.get(k, k), "count": len(rows),
                           "total_views": sum(views), "avg_views": sum(views) / len(rows),
                           "avg_likes": likes / len(rows)})
    kind_stats.sort(key=lambda r: r["avg_views"], reverse=True)

    hours: dict[int, list[int]] = {}
    for it in items:
        h = _published_hour(it.get("published_at", ""))
        if h is not None:
            hours.setdefault(h, []).append(int(it.get("view_count", 0) or 0))
    hour_stats = sorted(({"hour": h, "count": len(v), "avg_views": sum(v) / len(v)}
                         for h, v in hours.items()),
                        key=lambda r: r["avg_views"], reverse=True)[:3]

    top = sorted(items, key=lambda x: int(x.get("view_count", 0) or 0), reverse=True)[:5]
    return {"kind_stats": kind_stats, "hour_stats": hour_stats, "top": top}


def show_performance_insights() -> None:
    """터미널에 성과 인사이트를 요약해 보여 줍니다."""
    if not PERF_FILE.exists():
        warn("성과 데이터가 없습니다. 먼저 '게시 성과 수집'을 실행하세요.")
        return
    try:
        data = json.loads(PERF_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        warn(f"성과 파일을 읽지 못했습니다: {exc}")
        return
    items = data.get("items", [])
    if not items:
        warn("수집된 성과가 없습니다.")
        return
    ins = performance_insights(items)
    log("\n💡 성과 인사이트")
    log("  종류별 평균 조회수:")
    for row in ins["kind_stats"]:
        log(f"   · {row['label']:<7} {row['count']:>3}건 · 평균 조회 {row['avg_views']:>9,.0f}"
            f" · 평균 좋아요 {row['avg_likes']:>7,.0f}")
    if ins["kind_stats"]:
        best = ins["kind_stats"][0]
        log(f"  👉 추천: 「{best['label']}」 콘텐츠를 이어서 — 평균 조회수가 가장 높습니다")
    if ins["hour_stats"]:
        hours = " · ".join(f"{h['hour']}시(평균 {h['avg_views']:,.0f})" for h in ins["hour_stats"])
        log(f"  🕐 좋은 게시 시간대: {hours}")
    log("  🏆 조회수 TOP:")
    for i, it in enumerate(ins["top"], 1):
        log(f"   {i}. {str(it.get('title', ''))[:44]} — {int(it.get('view_count', 0) or 0):,}")


def collect_performance(cfg: dict) -> dict:
    """게시 이력의 URL에서 영상 성과를 수집해 performance.json 으로 저장합니다."""
    rows = [r for r in read_history_rows()
            if r.get("event") == "publish" and r.get("status") == "success" and r.get("url")]
    yt_ids, ig_pks = [], []
    for r in rows:
        url = r.get("url", "")
        m = re.search(r"youtu\.be/([\w-]+)", url)
        if m:
            yt_ids.append(m.group(1))
        m = re.search(r"/reel/(\d+)/?", url)
        if m:
            ig_pks.append(m.group(1))
    items: list[dict] = []
    if yt_ids:
        items += fetch_youtube_stats(cfg, yt_ids)
    if ig_pks:
        items += fetch_instagram_stats(cfg, ig_pks)
    data = {"updated_at": now_iso(), "items": items}
    PERF_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    display_performance(items)
    ok(f"성과 저장: {PERF_FILE}")
    return data


def write_performance_report(open_after: bool = True) -> Path | None:
    """performance.json 을 HTML 보고서로 만듭니다."""
    if not PERF_FILE.exists():
        warn("성과 데이터가 없습니다. 먼저 '게시 성과 수집'을 실행하세요.")
        return None
    try:
        data = json.loads(PERF_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        warn(f"성과 파일을 읽지 못했습니다: {exc}")
        return None
    items = data.get("items", [])
    names = {"yt": "YouTube Shorts", "ig": "Instagram Reels"}
    total_views = sum(i.get("view_count", 0) for i in items)
    total_likes = sum(i.get("like_count", 0) for i in items)
    by_platform: dict[str, list[dict]] = {}
    for item in items:
        by_platform.setdefault(item.get("platform", ""), []).append(item)
    plat_html = "".join(
        f"<li>{names.get(k, k)}: {len(v)}건 · 조회 {sum(i.get('view_count', 0) for i in v):,}"
        f" · 좋아요 {sum(i.get('like_count', 0) for i in v):,}</li>"
        for k, v in by_platform.items())
    table_rows = "".join(
        f"<tr><td>{esc_html(names.get(i.get('platform', ''), i.get('platform', '')))}</td>"
        f"<td>{esc_html(i.get('title', ''))[:50]}</td>"
        f"<td>{i.get('view_count', 0):,}</td><td>{i.get('like_count', 0):,}</td>"
        f"<td>{i.get('comment_count', 0):,}</td><td>{esc_html(i.get('published_at', ''))}</td></tr>"
        for i in sorted(items, key=lambda x: x.get("view_count", 0), reverse=True))
    # ── 인사이트: 종류별 성과 · 좋은 게시 시간대 · 추천 ──
    ins = performance_insights(items)
    kind_rows = "".join(
        f"<tr><td>{esc_html(r['label'])}</td><td>{r['count']}건</td>"
        f"<td>{r['avg_views']:,.0f}</td><td>{r['avg_likes']:,.0f}</td><td>{r['total_views']:,}</td></tr>"
        for r in ins["kind_stats"])
    hour_html = " · ".join(f"{h['hour']}시 (평균 {h['avg_views']:,.0f})" for h in ins["hour_stats"]) or "데이터 부족"
    recommend = (f"「{ins['kind_stats'][0]['label']}」 콘텐츠를 이어서 만들면 평균 조회수가 가장 높습니다"
                 if ins["kind_stats"] else "데이터가 더 쌓이면 추천이 생깁니다")
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>게시 성과 보고서 · toeic.monster</title>
<style>
  body {{ font-family: 'Malgun Gothic', sans-serif; background: #0b1220; color: #e6edf7; margin: 0; padding: 32px; }}
  h1 {{ font-size: 22px; }} .sub {{ color: #8fa3c0; font-size: 13px; margin-bottom: 24px; }}
  .cards {{ display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }}
  .card {{ background: #16233a; border: 1px solid #24344f; border-radius: 12px; padding: 14px 20px; min-width: 120px; }}
  .card b {{ display: block; font-size: 24px; color: #7dd3fc; }} .card span {{ font-size: 12px; color: #8fa3c0; }}
  ul {{ color: #aebfd8; font-size: 13px; margin-bottom: 24px; }}
  h2 {{ font-size: 16px; margin: 28px 0 10px; }}
  .tip {{ background: #123047; border: 1px solid #1d4e6b; border-radius: 10px; padding: 12px 16px;
         color: #a5e3ff; font-size: 13px; margin-bottom: 14px; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
  th, td {{ text-align: left; padding: 8px 10px; border-bottom: 1px solid #24344f; }}
  th {{ color: #8fa3c0; font-size: 12px; }}
</style>
</head>
<body>
<h1>📈 게시 성과 보고서</h1>
<div class="sub">수집 시각: {esc_html(data.get('updated_at', ''))}</div>
<div class="cards">
  <div class="card"><b>{len(items):,}</b><span>수집 게시물</span></div>
  <div class="card"><b>{total_views:,}</b><span>총 조회수</span></div>
  <div class="card"><b>{total_likes:,}</b><span>총 좋아요</span></div>
</div>
<ul>{plat_html}</ul>
<h2>💡 인사이트</h2>
<div class="tip">👉 추천: {esc_html(recommend)}</div>
<table><thead><tr><th>콘텐츠 종류</th><th>게시 수</th><th>평균 조회수</th><th>평균 좋아요</th><th>총 조회수</th></tr></thead><tbody>{kind_rows}</tbody></table>
<p class="sub">🕐 좋은 게시 시간대(평균 조회수): {esc_html(hour_html)}</p>
<h2>📋 전체 게시물</h2>
<table><thead><tr><th>플랫폼</th><th>제목</th><th>조회수</th><th>좋아요</th><th>댓글</th><th>게시일</th></tr></thead><tbody>{table_rows}</tbody></table>
</body></html>"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORT_DIR / "performance_report.html"
    out.write_text(html, encoding="utf-8")
    ok(f"성과 보고서 생성: {out}")
    if open_after:
        open_path(out)
    return out


# --------------------------------------------------------------------------- #
# Windows 작업 스케줄러
# --------------------------------------------------------------------------- #
def install_scheduled_task(interval_min: int = 10, dry_run_only: bool = True) -> None:
    """promo_center.bat --run-due 를 매 N분 실행하도록 Windows 작업 스케줄러에 등록합니다."""
    if not sys.platform.startswith("win"):
        warn("Windows 작업 스케줄러 등록은 Windows에서만 가능합니다.")
        return
    bat = PROMO / "promo_center.bat"
    if not bat.exists():
        fail(f"{bat} 을 찾을 수 없습니다.")
        return
    task_args = "--run-due --dry-run" if dry_run_only else "--run-due"
    tr = f'"{bat}" {task_args}'
    r = subprocess.run(["schtasks", "/Create", "/TN", SCHED_TASK_NAME, "/TR", tr,
                        "/SC", "MINUTE", "/MO", str(interval_min), "/F"],
                       capture_output=True, text=True)
    if r.returncode == 0:
        ok(f"작업 스케줄러 등록 완료: {SCHED_TASK_NAME} (매 {interval_min}분, {task_args})")
        log("도래한 예약을 자동으로 확인하지만 기본이 dry-run이라 실제 게시는 직접 확인 후 진행됩니다.")
    else:
        fail("작업 스케줄러 등록 실패: " + (r.stderr.strip() or r.stdout.strip()))


def remove_scheduled_task() -> None:
    r = subprocess.run(["schtasks", "/Delete", "/TN", SCHED_TASK_NAME, "/F"],
                       capture_output=True, text=True)
    if r.returncode == 0:
        ok(f"작업 스케줄러 제거 완료: {SCHED_TASK_NAME}")
    else:
        fail("작업 스케줄러 제거 실패: " + (r.stderr.strip() or r.stdout.strip()))


# --------------------------------------------------------------------------- #
# 쇼츠 생성기 선택지 (make_shorts 와의 순환 import 방지를 위해 런타임 import)
# --------------------------------------------------------------------------- #
# Windows 내장 TTS(SAPI) 목소리 후보 — (목소리 이름, 안내). --voice 값으로 그대로 전달됩니다.
# 아래 목록은 설치된 Windows 음성을 직접 나열하지 못할 때(비 Windows·PowerShell 없음) 쓰는 기본 후보입니다.
SHORTS_VOICES: list[tuple[str, str]] = [
    ("Microsoft Jenny Desktop", "여성 · 미국"),
    ("Microsoft Aria Desktop", "여성 · 미국"),
    ("Microsoft Zira Desktop", "여성 · 미국"),
    ("Microsoft Sonia Desktop", "여성 · 영국"),
    ("Microsoft Hazel Desktop", "여성 · 영국"),
    ("Microsoft Guy Desktop", "남성 · 미국"),
    ("Microsoft David Desktop", "남성 · 미국"),
    ("Microsoft Ryan Desktop", "남성 · 영국"),
    ("Microsoft Brian Desktop", "남성 · 영국"),
    ("Microsoft George Desktop", "남성 · 영국"),
]

_WINDOWS_VOICES: list[tuple[str, str, str]] | None = None


def list_windows_voices() -> list[tuple[str, str, str]]:
    """Windows에 설치된 내장 TTS(SAPI) 음성을 (이름, 로캘, 성별) 목록으로 돌려줍니다.

    Windows 가 아니거나 PowerShell·음성이 없으면 빈 목록을 돌려줍니다. 결과는 프로세스에 묶어 둡니다.
    """
    global _WINDOWS_VOICES
    if _WINDOWS_VOICES is not None:
        return _WINDOWS_VOICES
    voices: list[tuple[str, str, str]] = []
    powershell = None
    if sys.platform == "win32":
        powershell = shutil.which("powershell") or shutil.which("pwsh")
    if powershell:
        script = (
            "Add-Type -AssemblyName System.Speech\n"
            "$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer\n"
            "try { $synth.GetInstalledVoices() | Where-Object { $_.Enabled } | ForEach-Object { "
            "$_.VoiceInfo.Name + '|' + $_.VoiceInfo.Culture.Name + '|' + $_.VoiceInfo.Gender } } "
            "finally { $synth.Dispose() }"
        )
        encoded = base64.b64encode(script.encode("utf-16le")).decode("ascii")
        try:
            result = subprocess.run(
                [powershell, "-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", encoded],
                capture_output=True, text=True, timeout=30,
            )
        except Exception:
            result = None
        if result is not None and result.returncode == 0:
            for line in result.stdout.splitlines():
                name, sep1, rest = line.strip().partition("|")
                culture, sep2, gender = rest.partition("|")
                if sep1 and sep2 and name:
                    voices.append((name, culture, gender.strip()))
    _WINDOWS_VOICES = voices
    return voices


def windows_tts_available() -> bool:
    """쇼츠 낭독에 쓸 Windows 내장 TTS(SAPI)를 쓸 수 있는지 여부."""
    return sys.platform == "win32" and bool(list_windows_voices())


# --------------------------------------------------------------------------- #
# 로컬 TTS(Piper) 함수들
# --------------------------------------------------------------------------- #

def normalize_tts_engine(value=None) -> str:
    """엔진 이름을 auto/piper/windows 로 정규화합니다 (잘못된 값은 auto)."""
    name = str(value or "").strip().lower()
    if name in ("piper", "auto"):
        return name
    if name in ("windows", "sapi", "win"):
        return "windows"
    return DEFAULT_TTS_ENGINE


def tts_engine_of(cfg: dict) -> str:
    """config의 promo.tts_engine — 없으면 자동(auto)."""
    return normalize_tts_engine(cfg.get("promo", {}).get("tts_engine"))


def piper_available() -> bool:
    """piper-tts 패키지가 설치되어 있는지."""
    try:
        return importlib.util.find_spec("piper") is not None
    except Exception:
        return False


def list_piper_voices() -> list[str]:
    """assets/tts 에 내려받은 Piper 음성(.onnx) 이름 목록 — 없으면 빈 목록."""
    global _PIPER_VOICES
    if _PIPER_VOICES is None:
        try:
            _PIPER_VOICES = sorted(p.stem for p in PIPER_VOICE_DIR.glob("*.onnx"))
        except OSError:
            _PIPER_VOICES = []
    return _PIPER_VOICES


def piper_voice_path(name) -> "Path | None":
    """음성 이름에 해당하는 .onnx 파일 경로 (없으면 None)."""
    name = str(name or "").strip()
    if not name:
        return None
    path = PIPER_VOICE_DIR / f"{name}.onnx"
    return path if path.is_file() else None


def piper_ready() -> bool:
    """로컬 Piper 로 낭독할 수 있는지 (패키지 + 내려받은 음성)."""
    return piper_available() and bool(list_piper_voices())


def piper_default_voice(male: bool = False) -> str:
    """남성/여성용 Piper 기본 목소리 — 내려받은 목록에서 후보 순서대로 고릅니다."""
    voices = list_piper_voices()
    if not voices:
        return ""
    for prefix in PIPER_MALE_DEFAULTS if male else PIPER_FEMALE_DEFAULTS:
        for voice in voices:
            if voice.startswith(prefix):
                return voice
    # 기본 후보가 없으면 성별 분류 결과(이름 힌트 · F0 측정 캐시)에서 남/녀를 먼저 고릅니다.
    want = GENDER_MALE if male else GENDER_FEMALE
    for voice in voices:
        if piper_voice_gender(voice) == want:
            return voice
    tag = "male" if male else "female"
    for voice in voices:
        if tag in voice.lower():
            return voice
    return voices[-1] if male else voices[0]


def piper_voice_label(name: str) -> str:
    """Piper 음성 이름 → '영국 영어 · 여성 · low (16MB)' 같은 안내."""
    name = str(name or "").strip()
    size = ""
    path = piper_voice_path(name)
    if path is not None:
        try:
            size = f" · {path.stat().st_size / (1024 * 1024):.0f}MB"
        except OSError:
            pass
    m = re.match(r"^[a-z]{2}_([A-Z]{2})-(.+?)-([^-]+)$", name)
    if not m:
        return size.lstrip(" ·")
    region, short_name, quality = m.group(1), m.group(2), m.group(3)
    where = PIPER_LOCALE_LABELS.get(region, region)
    # 성별(이름 힌트 → F0 측정 캐시)이 판정되면 이름 대신 성별을, 아니면 데이터셋 이름을 씁니다.
    who = piper_voice_gender(name) or short_name
    return f"{where} · {who} · {quality}{size}"


# --------------------------------------------------------------------------- #
# Piper 음성 성별 분류 — 샘플을 합성해 기본 주파수(F0)를 재고, 이름·기본 설정 힌트와 함께 씁니다.
#   여성 대개 165Hz 이상 · 남성 대개 85~165Hz. 경계에 걸치는 음성(kathleen·kristin·ryan 등)은
#   이름·데이터셋·PIPER_*_DEFAULTS 힌트로 먼저 판정하고, 나머지는 F0 로 판정해 캐시에 저장합니다.
# --------------------------------------------------------------------------- #
GENDER_FEMALE = "여성"
GENDER_MALE = "남성"
GENDER_F0_FEMALE = 165.0
GENDER_PROBE_TEXT = "This is a voice test. The weather today is sunny and warm in the morning."
PIPER_GENDER_FILE = PIPER_VOICE_DIR / "voice_gender.json"
_PIPER_GENDERS: dict[str, dict] | None = None


def _load_gender_cache() -> dict[str, dict]:
    """assets/tts/voice_gender.json — 측정 결과(음성 → {f0, gender})를 저장해 둡니다."""
    global _PIPER_GENDERS
    if _PIPER_GENDERS is None:
        try:
            data = json.loads(PIPER_GENDER_FILE.read_text(encoding="utf-8"))
            _PIPER_GENDERS = {str(k): dict(v) for k, v in data.items()} if isinstance(data, dict) else {}
        except (OSError, ValueError):
            _PIPER_GENDERS = {}
    return _PIPER_GENDERS


def save_gender_cache() -> None:
    """현재 성별 캐시를 파일로 저장합니다."""
    try:
        PIPER_GENDER_FILE.parent.mkdir(parents=True, exist_ok=True)
        PIPER_GENDER_FILE.write_text(
            json.dumps(_load_gender_cache(), ensure_ascii=False, indent=1), encoding="utf-8")
    except OSError as exc:
        warn(f"성별 캐시 저장 실패: {exc}")


def piper_gender_hint(name: str) -> str:
    """이름·기본 설정 목록에서 얻는 성별 힌트 (모르면 빈 문자열)."""
    low = str(name or "").strip().lower()
    if not low:
        return ""
    if "female" in low:      # 'male' 은 female 에도 포함되므로 먼저 본다
        return GENDER_FEMALE
    if "male" in low:
        return GENDER_MALE
    for prefix in PIPER_FEMALE_DEFAULTS:
        if low.startswith(prefix.lower()):
            return GENDER_FEMALE
    for prefix in PIPER_MALE_DEFAULTS:
        if low.startswith(prefix.lower()):
            return GENDER_MALE
    return ""


def piper_voice_gender(name: str) -> str:
    """Piper 음성의 성별 — '여성' / '남성' / 판정 못하면 빈 문자열.

    이름 힌트 → 측정 캐시(F0) 순으로 판정합니다. (측정 없이도 힌트 음성은 즉시 구분됩니다.)
    """
    text = str(name or "").strip()
    if not text:
        return ""
    return piper_gender_hint(text) or str(_load_gender_cache().get(text, {}).get("gender") or "")


def measure_piper_gender(voice: str) -> dict:
    """음성으로 샘플 문장을 합성해 F0 를 재고 성별을 판정합니다 (실패하면 빈 dict)."""
    try:
        import wave as _wave
        import numpy as np
        from make_shorts import tts_speak   # 런타임 import (make_shorts → publish 순환 방지)
    except Exception as exc:
        warn(f"성별 측정 준비 실패: {exc}")
        return {}
    tmp = PIPER_VOICE_DIR / "_gender_sample.wav"
    try:
        tmp.parent.mkdir(parents=True, exist_ok=True)
        tts_speak(GENDER_PROBE_TEXT, voice, tmp, "auto")
        with _wave.open(str(tmp)) as w:
            sr, channels = w.getframerate(), w.getnchannels()
            audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
        if channels > 1:
            audio = audio.reshape(-1, channels).mean(axis=1)
        peak = float(np.max(np.abs(audio))) or 1.0
        audio = audio / peak
        win, hop = int(sr * 0.046), int(sr * 0.02)
        lo, hi = int(sr / 400), int(sr / 70)          # 70~400Hz 범위에서 피크 찾기
        vals: list[float] = []
        for start in range(0, max(1, len(audio) - win), hop):
            frame = audio[start:start + win]
            if frame.size < 64 or float(np.sqrt(np.mean(frame ** 2))) < 0.01:
                continue                              # 너무 짧거나 무음인 프레임 제외
            fr = frame - float(frame.mean())
            n = 1 << (len(fr) - 1).bit_length()
            ac = np.fft.irfft(np.fft.rfft(fr, n) * np.conj(np.fft.rfft(fr, n)), n)[:len(fr)]
            if ac[0] <= 0:
                continue
            seg = ac[lo:hi]
            if seg.size == 0:
                continue
            k = int(np.argmax(seg)) + lo
            if ac[k] / ac[0] < 0.35:                  # 상관성이 약한 프레임은 버림
                continue
            vals.append(float(sr / k))
    except Exception as exc:
        warn(f"성별 측정 실패({voice}): {exc}")
        return {}
    finally:
        tmp.unlink(missing_ok=True)
    if not vals:
        warn(f"성별 측정 실패({voice}): 유효한 음성 구간을 찾지 못했습니다.")
        return {}
    vals.sort()
    mid = vals[len(vals) // 4: 3 * len(vals) // 4] or vals
    f0 = float(statistics.median(mid))
    gender = piper_gender_hint(voice) or (
        GENDER_FEMALE if f0 >= GENDER_F0_FEMALE else GENDER_MALE)
    return {"f0": round(f0, 1), "gender": gender}


def piper_model_card_gender(voice: str) -> str:
    """Piper 공식 MODEL_CARD(HuggingFace)에서 성별을 확인합니다.

    이름 힌트가 없는 음성은 F0(경계에 걸치는 음성은 오분류) 대신 공식 설명을 우선합니다.
    네트워크 실패·다중 화자(男女 병기) 문구면 빈 문자열을 돌려줘 F0 측정으로 넘어갑니다.
    """
    name = str(voice or "").strip()
    if "_" not in name or "-" not in name:
        return ""
    cfg_path = PIPER_VOICE_DIR / f"{name}.onnx.json"
    try:
        cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
        dataset = str(cfg.get("dataset") or "")
        quality = str((cfg.get("audio") or {}).get("quality") or "")
    except (OSError, ValueError):
        return ""
    if not dataset or not quality:
        return ""
    top, lang = name.split("_", 1)[0], name.split("-")[0]
    url = (f"https://huggingface.co/rhasspy/piper-voices/raw/main/"
           f"{top}/{lang}/{dataset}/{quality}/MODEL_CARD")
    try:
        import urllib.request
        with urllib.request.urlopen(url, timeout=10) as resp:
            text = resp.read(4000).decode("utf-8", errors="replace")
    except Exception:
        return ""
    low = text.lower()
    female = low.count("female")
    male = low.count("male") - female       # 'male' 은 'female' 에도 포함됩니다
    if female and not male:
        return GENDER_FEMALE
    if male and not female:
        return GENDER_MALE
    return ""                               # 병기/기재 없음 → F0 측정으로


def refresh_gender_cache(voices: list[str] | None = None, force: bool = False) -> dict:
    """내려받은 음성의 성별을 측정해 캐시에 저장합니다 (이미 판정된 건 건너뜀)."""
    voices = list(voices if voices is not None else list_piper_voices())
    if not voices:
        warn("내려받은 Piper 음성이 없습니다.")
        return _load_gender_cache()
    cache = _load_gender_cache()
    todo = [v for v in voices
            if force or (not (cache.get(v) or {}).get("measured") and not piper_gender_hint(v))]
    if not todo:
        return cache
    log(f"성별 분류 시작 — {len(todo)}개 음성 (공식 MODEL_CARD 확인 → 없으면 F0 측정)…")
    for i, voice in enumerate(todo, 1):
        card = piper_model_card_gender(voice)
        info = {"gender": card, "source": "model-card"} if card else measure_piper_gender(voice)
        if not info:
            continue
        if not info.get("source"):
            info["source"] = "f0"
        info["measured"] = True
        cache[voice] = info
        f0 = f" · 평균 F0 {info['f0']}Hz" if info.get("f0") else ""
        log(f"  [{i}/{len(todo)}] {voice} → {info['gender']}{f0} ({info['source']})")
    save_gender_cache()
    ok(f"성별 캐시 저장: {PIPER_GENDER_FILE.name} ({len(cache)}개)")
    return cache


def gender_counts(voices: list[str]) -> tuple[int, int, int]:
    """(여성 수, 남성 수, 미판정 수) — 측정하지 않아도 이름 힌트는 즉시 반영됩니다."""
    female = sum(1 for v in voices if piper_voice_gender(v) == GENDER_FEMALE)
    male = sum(1 for v in voices if piper_voice_gender(v) == GENDER_MALE)
    return female, male, max(0, len(voices) - female - male)


def show_voice_gender_table() -> None:
    """내려받은 음성의 성별 표 — 필요하면 (재)측정합니다."""
    voices = list_piper_voices()
    if not voices:
        warn("내려받은 Piper 음성이 없습니다.")
        return
    refresh_gender_cache(voices)
    log(f"\n🎭 Piper 음성 성별 분류 (전체 {len(voices)}개)")
    for voice in voices:
        entry = _load_gender_cache().get(voice) or {}
        f0 = entry.get("f0")
        source = entry.get("source")
        extra = "".join(x for x in (f" · F0 {f0}Hz" if f0 else "",
                                     f" · {source}" if source else "") if x)
        log(f"  {piper_voice_gender(voice) or '미판정':<4} {voice:<40} "
            f"{piper_voice_label(voice)}{extra}")
    female, male, unknown = gender_counts(voices)
    log(f"\n  여성 {female} · 남성 {male} · 미판정 {unknown}")


def _looks_like_windows_voice(name: str) -> bool:
    """Windows 내장 SAPI 음성 이름처럼 보이는지 판별 (자동 엔진 선택용)."""
    name = str(name or "").strip()
    if name.startswith("Microsoft "):
        return True
    if re.match(r"^[a-z]{2}-[A-Z]{2}-", name):          # en-US-JennyNeural 같은 언어·성별 이름
        return True
    return any(name == voice for voice, _label in short_voice_choices())


def resolve_tts_engine(engine, voice: str = "") -> str:
    """실제로 쓸 TTS 엔진을 정합니다.

    auto 는 ① 음성 이름이 내려받은 Piper 음성이면 Piper, ② Windows 음성 이름이면 SAPI,
    ③ 목소리가 비어 있으면 내려받은 로컬 음성이 있으면 Piper 없으면 SAPI.
    """
    engine = normalize_tts_engine(engine)
    if engine != "auto":
        return engine
    if piper_voice_path(voice) and piper_available():
        return "piper"
    if voice and _looks_like_windows_voice(voice):
        return "windows"
    return "piper" if piper_ready() else "windows"


def tts_voice_choices(engine: str = "auto") -> list[tuple[str, str]]:
    """엔진별로 메뉴에 보여 줄 목소리 후보 — (이름, 안내)."""
    if engine == "windows":
        return short_voice_choices()
    piper = [(voice, piper_voice_label(voice)) for voice in list_piper_voices()]
    if piper:
        return piper
    # piper 를 골랐는데 음성이 없으면 빈 목록(안내 문구는 ask_voice 가 띄웁니다).
    return [] if engine == "piper" else short_voice_choices()


def short_voice_choices() -> list[tuple[str, str]]:
    """메뉴에 보여 줄 목소리 — Windows 에 설치된 내장 음성을 우선합니다.

    영어 음성을 먼저 보여 주고(낭독 문장이 영어), 설치 목록을 못 구하면 SHORTS_VOICES 를 씁니다.
    """
    installed = list_windows_voices()
    if not installed:
        return list(SHORTS_VOICES)
    english = [v for v in installed if v[1].lower().startswith("en")]
    others = [v for v in installed if not v[1].lower().startswith("en")]
    return [(name, f"{culture} · {'여성' if gender == 'Female' else '남성'}")
            for name, culture, gender in english + others]


def _pick_default_voice(gender: str, cultures: tuple[str, ...], fallback: str) -> str:
    """설치된 영어 Windows 음성에서 기본 목소리를 고릅니다. 없으면 폴백 이름을 씁니다."""
    english = [v for v in list_windows_voices() if v[2] == gender and v[1].lower().startswith("en")]
    for culture in cultures:
        for name, installed_culture, _gender in english:
            if installed_culture == culture:
                return name
    return english[0][0] if english else fallback


# 기본 목소리 — Windows 에 설치된 영어 음성에서 자동으로 고릅니다(첫 목소리는 영국 여성 우선,
# 두 번째는 미국 남성 우선 → 없으면 다른 로캘의 같은 성별). 설치 목록을 못 구하면 아래 폴백 이름이 힌트로 쓰입니다.
DEFAULT_VOICE = _pick_default_voice("Female", ("en-GB", "en-AU", "en-US"), "Microsoft Sonia Desktop")
# 두 번째 목소리 — 쇼츠 기본값은 두 목소리라 설정을 비우면 한 목소리만 씁니다.
DEFAULT_VOICE2 = _pick_default_voice("Male", ("en-US", "en-GB", "en-AU"), "Microsoft David Desktop")


def voice_label(name: str, engine: str = "auto") -> str:
    """목소리 이름에 엔진·로캘·성별 안내를 붙여 돌려줍니다."""
    seen: list[str] = []
    for voice, label in tts_voice_choices(engine) + [(v, piper_voice_label(v)) for v in list_piper_voices()] \
            + short_voice_choices() + SHORTS_VOICES:
        if voice == name and voice not in seen:
            return f"{name} ({label})"
        seen.append(voice)
    return name


def make_short_choices() -> tuple[list[str], list[str]]:
    try:
        from make_shorts import THEMES, STYLE_NAMES  # type: ignore[import-not-found]
        return sorted(THEMES), list(STYLE_NAMES)
    except Exception:
        return (["blue", "purple", "green", "orange", "pink", "navy"],
                ["classic", "modern", "minimal"])


# --------------------------------------------------------------------------- #
# TTS 엔진·목소리 설정 메뉴 (메뉴 23 / 메뉴 29 공용)
# --------------------------------------------------------------------------- #
TTS_TEST_TEXT = "Come across means to meet unexpectedly. Please expedite the report."


def show_piper_voice_catalog() -> bool:
    """내려받을 수 있는 영어 Piper 음성 목록을 보여 줍니다 (네트워크 필요)."""
    try:
        # 목록에 섞인 비ASCII 음성 이름이 cp949 콘솔에서 UnicodeEncodeError 로 깨지지 않게 UTF-8 로 읽습니다.
        r = subprocess.run([sys.executable, "-m", "piper.download_voices"],
                           capture_output=True, text=True, timeout=120,
                           encoding="utf-8", errors="replace",
                           env={**os.environ, "PYTHONIOENCODING": "utf-8"})
    except (OSError, subprocess.SubprocessError) as exc:
        fail(f"음성 목록 조회 실패: {exc}")
        return False
    names = [line.strip() for line in (r.stdout or "").splitlines() if line.strip().startswith("en_")]
    if not names:
        warn("영어 음성 목록을 받아오지 못했습니다 — 인터넷 연결을 확인하세요.")
        return False
    log(f"\n사용 가능한 영어 Piper 음성 {len(names)}개 (영어 외 다른 언어는 목록에서 제외)")
    for i, name in enumerate(names, 1):
        log(f"  {i}. {name} — {piper_voice_label(name)}")
    return True


def run_piper_download(name: str) -> bool:
    """Piper 음성 하나를 assets/tts 로 내려받습니다."""
    try:
        PIPER_VOICE_DIR.mkdir(parents=True, exist_ok=True)
        r = subprocess.run([sys.executable, "-m", "piper.download_voices", name,
                            "--download-dir", str(PIPER_VOICE_DIR)],
                           capture_output=True, text=True, timeout=600,
                           encoding="utf-8", errors="replace",
                           env={**os.environ, "PYTHONIOENCODING": "utf-8"})
    except (OSError, subprocess.SubprocessError) as exc:
        fail(f"Piper 음성 내려받기 실패: {exc}")
        return False
    global _PIPER_VOICES
    _PIPER_VOICES = None   # 내려받은 직후 목록 새로고침
    if r.returncode != 0 or piper_voice_path(name) is None:
        lines = [ln.strip() for ln in
                 ((r.stderr or "") + "\n" + (r.stdout or "")).splitlines() if ln.strip()]
        detail = lines[-1] if lines else ""
        fail(f"Piper 음성 내려받기 실패: {name}{(' — ' + detail) if detail else ''}")
        return False
    ok(f"내려받았습니다: {name} ({piper_voice_label(name)}) → {PIPER_VOICE_DIR}")
    return True


def run_voice_preview(voice: str, text: str = "") -> bool:
    """음성 하나로 짧은 영어 문장을 합성해 곧바로 재생합니다 (미리 듣기).

    내려받은 Piper 음성이면 Piper 로, Windows 내장 음성이면 SAPI 로 합성합니다.
    """
    voice = str(voice or "").strip()
    if not voice:
        return False
    text = (text or TTS_TEST_TEXT).strip() or TTS_TEST_TEXT
    engine = "piper" if piper_voice_path(voice) else "windows"
    try:
        from make_shorts import tts_speak  # 런타임 import (make_shorts → publish 순환 import 방지)
    except Exception as exc:
        fail(f"쇼츠 생성기를 불러오지 못했습니다: {exc}")
        return False
    out = PIPER_VOICE_DIR / "tts_preview.wav"
    try:
        out.parent.mkdir(parents=True, exist_ok=True)
        tts_speak(text, voice, out, engine)
    except Exception as exc:
        fail(f"미리 듣기 실패({voice} · {engine}): {exc}")
        return False
    ok(f"🎧 미리 듣기: {voice_label(voice, engine)}")
    try:
        import winsound
        winsound.PlaySound(str(out), winsound.SND_FILENAME)
    except Exception:
        open_path(out)   # 재생이 안 되면 기본 앱으로 엽니다
    return True


def preview_voice_menu() -> None:
    """내려받은 Piper 음성을 골라 샘플 문장으로 바로 들어봅니다 (메뉴 29 · 내려받기 공용)."""
    voices = list_piper_voices()
    if not voices:
        warn("내려받은 Piper 음성이 없습니다 — 먼저 음성을 내려받아 주세요.")
        return
    log("\n🎧 미리 듣기 — 내려받은 음성을 골라 샘플을 들어봅니다 (돌아가려면 Enter)")
    log("  필터: f(여성만) · m(남성만) · all(전체) — 성별은 1회 측정 후 저장됩니다")
    text = ask_menu("샘플 문장 (영어, Enter: 기본 예문)", TTS_TEST_TEXT) or TTS_TEST_TEXT
    shown = list(voices)

    def show_list() -> None:
        log(f"\n  대상 {len(shown)}개 / 전체 {len(voices)}개")
        for i, voice in enumerate(shown, 1):
            log(f"  {i:2d}. {voice} — {piper_voice_label(voice)}")

    show_list()
    while True:
        raw = ask_menu("\n미리 듣기 — 번호/음성 이름 (필터 f·m·all)", "").strip()
        if not raw:
            return
        low = raw.lower()
        if low in ("f", "female", "여", "여성", "m", "male", "남", "남성"):
            want = GENDER_FEMALE if low in ("f", "female", "여", "여성") else GENDER_MALE
            refresh_gender_cache()   # 아직 측정하지 않은 음성이 있으면 지금 한 번에 측정합니다
            filtered = [v for v in voices if piper_voice_gender(v) == want]
            if not filtered:
                warn(f"{want} 음성이 없습니다.")
            else:
                shown = filtered
            show_list()
            continue
        if low in ("all", "전체", "a", "*"):
            shown = list(voices)
            show_list()
            continue
        voice: str | None = None
        if raw.isdigit():
            idx = int(raw)
            voice = shown[idx - 1] if 1 <= idx <= len(shown) else None
        else:
            low = raw.lower()
            hits = [v for v in shown if v.lower() == low] or \
                   [v for v in shown if v.lower().startswith(low)] or \
                   [v for v in shown if low in v.lower()]
            if len(hits) > 1:
                warn("여러 음성이 맞습니다: " + ", ".join(hits[:5]) + (" …" if len(hits) > 5 else ""))
                continue
            voice = hits[0] if hits else None
        if voice is None:
            warn("내려받은 음성 중에서 찾지 못했습니다 — 목록의 번호나 이름을 확인해 주세요.")
            continue
        run_voice_preview(voice, text)


def download_piper_voice_menu() -> bool:
    """Piper 음성을 하나 내려받습니다. 성공하면 True."""
    if not piper_available():
        warn("piper-tts 가 설치되어 있지 않습니다 — pip install piper-tts 를 먼저 실행하세요.")
        return False
    log("\nPiper 음성 내려받기 — promo/assets/tts 에 저장됩니다 (한 음성당 약 20~65MB, 네트워크 필요)")
    log("  예: en_US-amy-medium · en_US-ryan-medium · en_GB-southern_english_female-low")
    while True:
        name = ask_menu("음성 이름 (list: 영어 목록, preview: 미리 듣기, Enter: 건너뛰기)", "").strip()
        if not name:
            return False
        if name.lower() in ("list", "목록", "l"):
            show_piper_voice_catalog()
            continue
        if name.lower() in ("preview", "미리듣기", "미리 듣기"):
            preview_voice_menu()
            continue
        if run_piper_download(name):
            if ask_yes_no("방금 내려받은 음성으로 미리 들어볼까요?", True):
                run_voice_preview(name)
            return True
        if not ask_yes_no("다른 이름으로 다시 내려받을까요?", False):
            return False


def run_tts_test(engine: str, voice: str) -> None:
    """선택한 목소리로 짧은 영어 문장을 합성해 저장하고 재생합니다."""
    engine = resolve_tts_engine(engine, voice)
    if not voice:
        warn("선택된 목소리가 없어 테스트할 수 없습니다.")
        return
    try:
        from make_shorts import tts_speak  # 런타임 import (make_shorts → publish 순환 import 방지)
    except Exception as exc:
        fail(f"쇼츠 생성기를 불러오지 못했습니다: {exc}")
        return
    out = PIPER_VOICE_DIR / "tts_test.wav"
    try:
        out.parent.mkdir(parents=True, exist_ok=True)
        tts_speak(TTS_TEST_TEXT, voice, out, engine)
    except Exception as exc:
        fail(f"TTS 테스트 실패({voice} · {engine}): {exc}")
        return
    ok(f"테스트 음성 저장: {out}")
    try:
        import winsound
        winsound.PlaySound(str(out), winsound.SND_FILENAME)
    except Exception:
        open_path(out)   # 재생이 안 되면 기본 앱으로 엽니다


def tts_settings_flow(cfg: dict, *, full: bool = False) -> dict:
    """TTS 엔진·낭독 사용 여부·목소리를 입력받아 cfg 에 담습니다.

    full=True 면 메뉴 29 처럼 음성 내려받기와 테스트 재생까지 묻습니다(메뉴 23 에서는 생략).
    """
    promo = cfg.setdefault("promo", {})
    engine = ask_tts_engine(str(promo.get("tts_engine", DEFAULT_TTS_ENGINE) or DEFAULT_TTS_ENGINE))
    promo["tts_engine"] = engine
    promo["default_tts"] = ask_yes_no("쇼츠 영어 낭독(TTS) 사용", bool(promo.get("default_tts", True)))
    if full and engine in ("auto", "piper"):
        if not list_piper_voices() and ask_yes_no("Piper 음성을 내려받을까요?", piper_available()):
            download_piper_voice_menu()
        elif list_piper_voices() and ask_yes_no("Piper 음성을 더 내려받을까요?", False):
            download_piper_voice_menu()
    # 엔진에 맞지 않는 예전 목소리 이름이 있으면 그 엔진의 기본값을 제안합니다.
    promo["default_voice"] = ask_voice(
        "첫 번째 TTS 목소리 (여성)",
        _voice_for_engine(engine, str(promo.get("default_voice", "") or "")), engine=engine)
    promo["default_voice2"] = ask_voice(
        "두 번째 TTS 목소리 (남성)",
        _voice_for_engine(engine, str(promo.get("default_voice2", "") or ""), male=True),
        allow_none=True, engine=engine)
    if promo.get("default_voice2") and promo["default_voice2"] == promo.get("default_voice"):
        promo["default_voice2"] = ""
        warn("두 목소리가 같아 두 번째 목소리를 비웠습니다(한 목소리로 낭독).")
    if full and promo.get("default_tts"):
        if ask_yes_no("선택한 목소리로 테스트 음성을 들어볼까요?", True):
            run_tts_test(engine, str(promo.get("default_voice", "") or ""))
        have = list_piper_voices()
        if have and ask_yes_no(f"내려받은 다른 음성으로 미리 듣기({len(have)}개)?", False):
            preview_voice_menu()
    return cfg


def tts_voice_menu(cfg: dict) -> dict:
    """메뉴 29 — 로컬 TTS(Piper) 엔진과 낭독 목소리를 설정합니다."""
    log("\n" + "=" * 62)
    log("🔊 TTS 엔진·목소리 설정")
    log("=" * 62)
    promo = cfg.get("promo", {})
    current_engine = tts_engine_of(cfg)
    effective = resolve_tts_engine(current_engine, str(promo.get("default_voice", "") or ""))
    log(f"  현재 엔진: {current_engine} → 실제 낭독: {effective} "
        f"({'로컬 오프라인' if effective == 'piper' else 'Windows 내장'})")
    log(f"  낭독(TTS): {'켜짐' if promo.get('default_tts', True) else '꺼짐'} · "
        f"목소리 {voice_label(str(promo.get('default_voice', '') or ''), current_engine)}"
        f"{(' + ' + voice_label(str(promo.get('default_voice2', '') or ''), current_engine)) if promo.get('default_voice2') else ''}")
    log(f"  설치 상태: piper-tts {'설치됨' if piper_available() else '미설치'} · "
        f"내려받은 로컬 음성 {len(list_piper_voices())}개 · Windows 내장 음성 {len(list_windows_voices())}개")
    if list_piper_voices():
        female, male, unknown = gender_counts(list_piper_voices())
        log(f"  성별 분류: 여성 {female} · 남성 {male}"
            + (f" · 미판정 {unknown}" if unknown else "")
            + " (--voice-gender 로 전체 측정·표시)")
    tts_settings_flow(cfg, full=True)
    save_config(cfg)
    ok(f"TTS 설정을 저장했습니다: {CONFIG_FILE}")
    return cfg


def show_config_status(cfg: dict) -> None:
    log("\n🔐 설정·환경 상태")
    log(f"  설정 파일: {'config.json' if config_is_real() else 'config.example.json (예제)'}")
    promo_cfg = cfg.get("promo", {})
    engine = tts_engine_of(cfg)
    voice1 = str(promo_cfg.get("default_voice", "") or "")
    voice2 = str(promo_cfg.get("default_voice2", "") or "")
    log(f"  🔊 낭독 TTS: 엔진 {engine} → 실제 {resolve_tts_engine(engine, voice1)} · "
        f"{voice_label(voice1, engine)}{(' + ' + voice_label(voice2, engine)) if voice2 else ' (한 목소리)'}"
        f" · {'사용' if promo_cfg.get('default_tts', True) else '사용 안 함'}")
    errors, warnings = config_issues(cfg)
    for name, installed, purpose in dependency_status():
        log(f"  {'✅' if installed else '⬜'} {name}: {'준비됨' if installed else '미설치'} · {purpose}")
    for message in errors:
        fail(message)
    for message in warnings:
        warn(message)
    log("  민감한 토큰·비밀번호는 화면에 출력하지 않습니다.")


def configure_menu(cfg: dict) -> dict:
    """대화형으로 자주 쓰는 설정만 수정하고 저장합니다."""
    log("\n⚙️ 기본 설정 편집")
    log("Enter를 누르면 현재 값을 유지합니다. 비밀번호는 입력 중 표시하지 않습니다.")
    cfg["site_url"] = ask_menu("사이트 URL", str(cfg.get("site_url", "https://toeic.monster/")))
    cfg["default_title"] = ask_menu("기본 제목", str(cfg.get("default_title", "TOEIC 필수 어휘 | toeic.monster")))
    cfg["default_description"] = ask_menu("기본 설명", str(cfg.get("default_description", "")))
    promo = cfg.setdefault("promo", {})
    promo["default_unit"] = ask_int("기본 UNIT(1~30)", int(promo.get("default_unit", 1) or 1), 1, 30)
    promo["default_words"] = ask_int("기본 영상 단어 수(1~10)", int(promo.get("default_words", 5) or 5), 1, 10)
    themes, styles = make_short_choices()
    promo["default_theme"] = ask_menu(f"기본 배경 테마({'/'.join(themes)})", str(promo.get("default_theme", "blue"))).lower()
    if promo["default_theme"] not in themes:
        promo["default_theme"] = "blue"
    promo["default_style"] = ask_menu(f"기본 카드 스타일({'/'.join(styles)})", str(promo.get("default_style", "classic"))).lower()
    if promo["default_style"] not in styles:
        promo["default_style"] = "classic"
    # Enter 를 눌렀을 때 바로 실행할 기본 메뉴 번호 (원클릭 센터 1~29)
    current_menu = str(promo.get("default_menu", "") or "").strip() or "9"
    if current_menu not in MENU_TITLES:
        current_menu = "9"
    picked_menu = ask_menu(f"기본 메뉴 번호(Enter 기본값, 1~{len(MENU_ITEMS)})", current_menu).strip()
    if picked_menu and picked_menu not in MENU_TITLES:
        warn(f"{picked_menu} 는 없는 메뉴 번호입니다 — {current_menu}. {MENU_TITLES[current_menu]} 을 유지합니다.")
    promo["default_menu"] = picked_menu if picked_menu in MENU_TITLES else current_menu
    log(f"  ↳ Enter 기본 메뉴: {promo['default_menu']}. {MENU_TITLES[promo['default_menu']]}")
    # TTS 엔진·목소리 (메뉴 29 와 같은 흐름 — 내려받기·테스트는 메뉴 29 에서만, 설정 저장은 메뉴 23 과 공용)
    tts_settings_flow(cfg, full=False)
    promo["confirm_real_upload"] = ask_yes_no("실제 게시 전 확인 질문 사용", bool(promo.get("confirm_real_upload", True)))
    yt = cfg.setdefault("youtube", {})
    yt["enabled"] = ask_yes_no("YouTube 사용", bool(yt.get("enabled", True)))
    yt["privacy"] = ask_menu("YouTube 공개 범위(public/unlisted/private)", str(yt.get("privacy", "public"))).lower()
    if yt["privacy"] not in ("public", "unlisted", "private"):
        yt["privacy"] = "unlisted"
    ig = cfg.setdefault("instagram", {})
    ig["enabled"] = ask_yes_no("Instagram 사용", bool(ig.get("enabled", True)))
    ig["username"] = ask_menu("Instagram username", str(ig.get("username", "")))
    if ask_yes_no("Instagram 비밀번호를 변경할까요?", False):
        ig["password"] = getpass.getpass("Instagram password (입력 내용 숨김): ")
    tt = cfg.setdefault("tiktok", {})
    tt["enabled"] = ask_yes_no("TikTok 사용(선택 기능)", bool(tt.get("enabled", False)))
    if tt["enabled"] and ask_yes_no("TikTok ms_token을 변경할까요?", False):
        tt["ms_token"] = getpass.getpass("TikTok ms_token (입력 내용 숨김): ")
    save_config(cfg)
    ok(f"설정을 저장했습니다: {CONFIG_FILE}")
    return cfg


def open_path(path: Path) -> None:
    """Windows/macOS/Linux 기본 프로그램으로 파일 또는 폴더를 엽니다."""
    try:
        if sys.platform.startswith("win"):
            subprocess.Popen(["explorer", str(path)])
        elif sys.platform == "darwin":
            subprocess.Popen(["open", str(path)])
        else:
            subprocess.Popen(["xdg-open", str(path)])
        ok(f"열었습니다: {path}")
    except OSError as exc:
        warn(f"자동으로 열지 못했습니다: {exc}")


# --------------------------------------------------------------------------- #
# 원클릭 메뉴 — 표시·선택 도우미 (메뉴 29개를 그룹/키워드/복수 선택으로 다룸)
# --------------------------------------------------------------------------- #
# (번호, 제목, 검색 별칭) — 목록 출력·키워드 검색·오입력 제안이 여기서 한 번에 나옵니다.
MENU_ITEMS: list[tuple[str, str, tuple[str, ...]]] = [
    # 🎬 쇼츠 만들기 (1~4)
    ("1",  "쇼츠 생성",                    ("단어", "유닛", "unit", "생성", "make", "shorts")),
    ("2",  "숙어 쇼츠 생성",                ("숙어", "idiom", "생성", "make")),
    ("3",  "빈도 어휘 쇼츠 생성",           ("빈도", "frequency", "어휘", "생성", "make")),
    ("4",  "동의어 치환 퀴즈 생성",         ("퀴즈", "paraphrase", "동의어", "생성", "quiz", "make")),
    # 🚀 만들고 바로 게시 (5~8)
    ("5",  "쇼츠 생성 후 게시",             ("생성+게시", "원스톱", "generate")),
    ("6",  "숙어 쇼츠 생성 후 게시",         ("숙어", "idiom", "생성+게시")),
    ("7",  "빈도 어휘 쇼츠 생성 후 게시",     ("빈도", "frequency", "생성+게시")),
    ("8",  "동의어 치환 퀴즈 생성 후 게시",   ("퀴즈", "paraphrase", "생성+게시")),
    # 📤 게시·이력·성과 (9~17)
    ("9",  "기존 쇼츠 게시",               ("게시", "업로드", "upload", "publish", "youtube", "인스타")),
    ("10", "여러 영상 일괄 게시",           ("일괄", "배치", "batch")),
    ("11", "배포 전 검증 — 영상 재생·점검 후 게시", ("검증", "verify", "미리보기")),
    ("12", "수동 게시 도우미",              ("수동", "캡션", "manual", "폴백")),
    ("13", "중복 게시 방지 기록 보기",        ("중복", "기록", "posted", "목록")),
    ("14", "중복 게시 방지 기록 초기화",      ("중복", "초기화", "reset")),
    ("15", "게시 이력 CSV 보기",            ("이력", "history", "csv")),
    ("16", "게시 이력 HTML 리포트",          ("리포트", "report", "이력")),
    ("17", "게시 성과 수집·보고서",          ("성과", "조회수", "통계", "stats", "인사이트")),
    # 🗓 예약·자동 준비 (18~21)
    ("18", "예약 게시 등록",               ("예약", "schedule", "등록")),
    ("19", "예약 목록 보기·취소",           ("예약", "취소", "schedule", "목록")),
    ("20", "예약 게시 실행(지금 확인)",      ("예약", "실행", "due", "run")),
    ("21", "콘텐츠 자동 준비 — N일치 생성 + 예약", ("자동", "auto", "예약", "준비", "auto-plan")),
    # ⚙️ 설정·점검·도구 (22~29)
    ("22", "계정·API 설정 상태 확인",        ("점검", "상태", "check", "설정확인")),
    ("23", "설정 편집",                    ("config", "설정", "edit")),
    ("24", "의존성·폴더 열기",              ("폴더", "열기", "open", "folder")),
    ("25", "Windows 작업 스케줄러 예약 실행 등록/해제", ("작업스케줄러", "task", "예약", "스케줄")),
    ("26", "YouTube 설정·로그인",           ("youtube", "구글", "oauth", "로그인", "설정")),
    ("27", "남은 콘텐츠 수량 보기",          ("잔여", "수량", "remaining", "남은")),
    ("28", "게시된 영상 YouTube 설명 갱신",   ("설명", "제목", "refresh", "youtube")),
    ("29", "TTS 엔진·목소리 설정 (내려받기·미리 듣기)", ("tts", "음성", "목소리", "piper", "미리듣기")),
]
# 목록·검색·표시 순서를 항상 번호 순으로 맞춰 둡니다(번호를 고치면 여기까지 자동 정렬).
MENU_ITEMS.sort(key=lambda item: int(item[0]))
MENU_TITLES: dict[str, str] = {num: title for num, title, _alias in MENU_ITEMS}
# 번호가 위에서 아래로 1 → 29 로 이어지도록 그룹을 순서대로 묶습니다.
MENU_GROUPS: list[tuple[str, list[str]]] = [
    ("🎬 쇼츠 만들기",          ["1", "2", "3", "4"]),
    ("🚀 만들고 바로 게시",      ["5", "6", "7", "8"]),
    ("📤 게시·이력·성과",       ["9", "10", "11", "12", "13", "14", "15", "16", "17"]),
    ("🗓 예약·자동 준비",        ["18", "19", "20", "21"]),
    ("⚙️ 설정·점검·도구",        ["22", "23", "24", "25", "26", "27", "28", "29"]),
]
QUIT_WORDS = {"0", "q", "quit", "exit", "n", "no", "종료", "나가기"}
HELP_WORDS = {"?", "h", "help", "도움", "도움말"}
# r(또는 최근) 를 누르면 마지막에 실행한 메뉴(순서 포함)를 그대로 반복합니다.
REPEAT_WORDS = {"r", "rr", "again", "반복", "다시", "최근"}
# 1-4 · 1~4 · 1..4 처럼 범위로 메뉴를 여러 개 고를 수 있습니다.
MENU_RANGE_RE = re.compile(r"^(\d{1,3})\s*(?:-|~|–|—|\.\.)\s*(\d{1,3})$")
# BAT·셸에서 `promo_center.bat 1-4` 처럼 번호를 바로 올려보낼 때 쓰는 형태입니다.
MENU_CLI_RE = re.compile(r"^\d+(?:\s*[-~,]\s*\d+)*$")
# 한 번에 순서대로 실행할 수 있는 최대 메뉴 수(실수로 긴 시퀀스가 실행되는 것을 막습니다).
MAX_MENU_STEPS = 10


def default_menu_number(cfg: dict) -> str:
    """Enter 를 눌렀을 때 실행할 기본 메뉴 번호 (config 의 promo.default_menu)."""
    raw = str(cfg.get("promo", {}).get("default_menu", "") or "").strip()
    return raw if raw in MENU_TITLES else "9"


def short_menu_label(num: str, max_cols: int = 30) -> str:
    """메뉴 제목을 안내 한 줄에 들어가도록 짧게 줄입니다 (한글 2칸 기준)."""
    title = MENU_TITLES.get(num, "")
    head = re.split(r"\s+—\s+| \(", title)[0].strip()
    width = 0
    out = ""
    for ch in head:
        step = 2 if ord(ch) > 0x2000 else 1
        if width + step > max_cols:
            return out + "…"
        out += ch
        width += step
    return out


def print_interactive_menu() -> None:
    """원클릭 메뉴를 그룹과 번호 함께 보여 줍니다."""
    log("\n" + "=" * 62)
    log("🎬 toeic.monster 홍보 원클릭 센터")
    log("=" * 62)
    for group, numbers in MENU_GROUPS:
        log(f"  {group}")
        for num in numbers:
            log(f"   {num:>2}. {MENU_TITLES.get(num, '')}")
    log("    0. 종료")


def show_menu_summary(cfg: dict, unit: int, words: int, theme: str, style: str,
                       tts: bool, voice: str) -> None:
    """현재 기본값을 메뉴 위쪽에 한 줄로 요약해 보여 줍니다."""
    engine = tts_engine_of(cfg)
    tts_part = f"TTS {'켜짐' if tts else '꺼짐'}"
    if tts:
        tts_part += f" · {voice_label(voice, engine)}"
    log(f"  현재 기본값: UNIT {unit} · {words}개 · {theme}/{style} · {tts_part}")


def show_menu_help(default: str) -> None:
    """? 를 눌렀을 때 보여 주는 사용법 (전체 목록은 바로 위에 그대로 출력되어 있습니다)."""
    log("\n사용법")
    log("  5 · 15,16 · 1-4   번호 / 여러 개 / 범위를 입력해 실행 (한 번에 최대 "
        f"{MAX_MENU_STEPS}개까지)")
    log("  예약 · tts         키워드 검색 (여러 개면 목록에서 번호로 선택)")
    log("  r                 마지막 실행을 그대로 반복 (메뉴·순서까지 재실행)")
    log(f"  Enter              기본값 [{default}] {short_menu_label(default)} 실행")
    log("  ?                 이 도움말 · q 또는 0  종료")
    log("  게시·성과·검증 같은 한 단어로도 이동할 수 있습니다.")
    log("\n예시")
    log("  1-4          — 단어·숙어·빈도·퀴즈 쇼츠를 한 번에 생성")
    log("  5            — 쇼츠를 만들고 바로 게시까지 원스톱으로 진행")
    log("  16,17        — 게시 이력 CSV 보고 → HTML 리포트 만들기")
    log("  21           — 남은 콘텐츠 순으로 N일치 자동 준비 + 예약 등록")
    log("")


def search_menu(query: str) -> list[str]:
    """제목·별칭에서 키워드를 찾아 해당 메뉴 번호 목록을 돌려줍니다(순서 유지)."""
    q = query.strip().lower()
    if not q:
        return []
    hits: list[str] = []
    for num, title, aliases in MENU_ITEMS:
        hay = f"{title} {' '.join(aliases)}".lower()
        if q in hay:
            hits.append(num)
    return hits


def suggest_menu(query: str) -> None:
    """키워드가 안 맞으면 비슷한 메뉴를 최대 3개 제안합니다."""
    q = query.strip().lower()
    pool = {f"{num} {title} {' '.join(aliases)}": num
            for num, title, aliases in MENU_ITEMS}
    close = difflib.get_close_matches(q, list(pool), n=3, cutoff=0.5)
    if not close:
        close = difflib.get_close_matches(q, list(pool), n=3, cutoff=0.3)
    if close:
        log("비슷한 메뉴: " + " · ".join(f"{pool[key]} {MENU_TITLES[pool[key]]}" for key in close))
    log("? 를 입력하면 전체 목록과 사용법이 나옵니다.")


def nearest_menu_number(token: str) -> str:
    """없는 번호를 입력했을 때 가장 가까운 메뉴 번호를 알려 줍니다."""
    try:
        want = int(token)
    except ValueError:
        return ""
    if want <= 0:
        return "1"
    return max(MENU_TITLES, key=lambda num: (-abs(int(num) - want), int(num)))


def add_menu_number(picked: list[str], num: str) -> bool:
    """번호가 유효하면 목록에 넣고, 아니면 안내 후 False 를 돌려줍니다."""
    if num in MENU_TITLES:
        if num not in picked:
            picked.append(num)
        return True
    near = nearest_menu_number(num)
    warn(f"{num} 는 없는 메뉴 번호입니다 (1~{len(MENU_ITEMS)}) — "
         f"가장 가까운 {near}. {MENU_TITLES.get(near, '')} 를 확인하세요.")
    return False


def parse_menu_input(raw: str, default: str) -> tuple[list[str], bool, bool]:
    """메뉴 입력(숫자·범위·키워드·복수)을 실행할 번호 목록으로 바꿉니다.

    쓸 수 있는 형태: 5 · 15,16 · 1-4 · 1~4 · 예약 · tts  (종료 q/0, 도움말 ?)
    반환값: (실행할 번호 목록, 종료 여부, 도움말 여부). 안내 문구는 여기서 바로 출력합니다.
    """
    text = str(raw or "").strip() or str(default or "").strip()
    low = text.lower()
    if low in QUIT_WORDS:
        return [], True, False
    if low in HELP_WORDS:
        return [], False, True
    picked: list[str] = []
    # "숙어 생성" 처럼 띄어 쓴 키워드는 잘라서 각각 찾기 전에 한 덩어리로 먼저 찾습니다.
    if not text[0].isdigit() and "," not in text:
        whole = search_menu(text)
        if len(whole) == 1:
            return list(whole), False, False
    for token in re.split(r"[,\s]+", text):
        if not token:
            continue
        rng = MENU_RANGE_RE.match(token)
        if rng:
            start, end = int(rng.group(1)), int(rng.group(2))
            if start > end:
                start, end = end, start
            for num in range(start, end + 1):
                if not add_menu_number(picked, str(num)):
                    return [], False, False
            continue
        if token.isdigit():
            if not add_menu_number(picked, token):
                return [], False, False
            continue
        hits = search_menu(token)
        if len(hits) == 1:
            if hits[0] not in picked:
                picked.append(hits[0])
        elif len(hits) > 1:
            log(f"'{token}' 와 관련된 메뉴 {len(hits)}개")
            for num in hits:
                log(f"   {num:>2}. {MENU_TITLES[num]}")
            choice = ask_menu("번호로 선택 (Enter: 취소)", "").strip()
            if choice.isdigit() and choice in hits and choice not in picked:
                picked.append(choice)
            else:
                log("취소했습니다.")
                return [], False, False
        else:
            warn(f"'{token}' 와(과) 맞는 메뉴가 없습니다.")
            suggest_menu(token)
            return [], False, False
    if len(picked) > MAX_MENU_STEPS:
        warn(f"한 번에는 최대 {MAX_MENU_STEPS}개까지 순서대로 실행할 수 있습니다 "
             f"({len(picked)}개 입력) — 번호를 나눠서 입력하세요.")
        return [], False, False
    if not picked:
        return [], False, False
    return picked, False, False


def interactive_menu(initial: str | None = None) -> None:
    """인자 없이 실행했을 때 사용하는 안전한 원클릭 메뉴입니다.

    initial 을 주면 첫 입력으로 그대로 씁니다(--menu-run · BAT 의 `promo_center.bat 1-4`).
    """
    try:
        if not CONFIG_FILE.exists():
            init_config()
        cfg = load_config()
    except SystemExit as exc:
        fail(str(exc))
        return
    promo_cfg = cfg.get("promo", {})
    try:
        default_unit = int(promo_cfg.get("default_unit", 1) or 1)
    except (TypeError, ValueError):
        default_unit = 1
    default_unit = min(30, max(1, default_unit))
    try:
        default_words = int(promo_cfg.get("default_words", 5) or 5)
    except (TypeError, ValueError):
        default_words = 5
    default_words = min(10, max(1, default_words))
    default_theme = str(promo_cfg.get("default_theme", "blue")).lower()
    _themes, _styles = make_short_choices()
    if default_theme not in _themes:
        default_theme = "blue"
    default_style = str(promo_cfg.get("default_style", "classic")).lower()
    if default_style not in _styles:
        default_style = "classic"
    default_privacy = str(promo_cfg.get("default_privacy", cfg.get("youtube", {}).get("privacy", "unlisted"))).lower()
    if default_privacy not in ("public", "unlisted", "private"):
        default_privacy = "unlisted"
    default_tts = bool(promo_cfg.get("default_tts", False))
    default_voice = str(promo_cfg.get("default_voice", DEFAULT_VOICE) or DEFAULT_VOICE)
    # 빈 문자열이면 '두 번째 목소리 없음'을 뜻하므로 or DEFAULT_VOICE2 를 쓰지 않습니다.
    default_voice2 = str(promo_cfg.get("default_voice2", DEFAULT_VOICE2) or "")
    confirm_real_upload = bool(promo_cfg.get("confirm_real_upload", True))
    menu_default = default_menu_number(cfg)
    pending: list[str] = []   # 여러 메뉴를 쉼표·범위로 넣으면 남은 항목이 여기에 쌓입니다
    pending_total = 1
    pending_done = 0
    last_sequence: list[str] = []   # r 입력 시 그대로 반복할 마지막 실행 순서
    while True:
        print_interactive_menu()
        show_menu_summary(cfg, default_unit, default_words, default_theme, default_style,
                          default_tts, default_voice)
        log(f"  ▶ Enter = {menu_default}. {short_menu_label(menu_default)}")
        log("  입력: 5(번호) · 예약/tts(검색) · 15,16(여러 개) · 1-4(범위) · r(반복) · ?(도움말) · q(종료)")
        if pending:
            action = pending.pop(0)
            pending_done += 1
            log(f"──── [{pending_done}/{pending_total}] {action}. {MENU_TITLES.get(action, '')} ────")
            menu_default = action
        else:
            if initial is not None:
                raw = initial
                initial = None
                log(f"명령줄에서 받아 실행합니다: {raw}")
            else:
                raw = ask_menu("메뉴", menu_default)
            if str(raw or "").strip().lower() in REPEAT_WORDS:
                if not last_sequence:
                    warn("반복할 이전 실행이 없습니다 — 번호나 키워드로 메뉴를 입력하세요.")
                    continue
                resolved = list(last_sequence)
                log("지난 실행 반복: " + " → ".join(f"{n}. {MENU_TITLES.get(n, '')}" for n in resolved))
            else:
                resolved, quit_now, help_now = parse_menu_input(raw, menu_default)
                if quit_now:
                    log("종료합니다.")
                    return
                if help_now:
                    show_menu_help(menu_default)
                    continue
                if not resolved:
                    continue   # 검색·오류 안내는 parse_menu_input 에서 이미 출력했습니다
                if len(resolved) > 1:
                    log("실행 순서: " + " → ".join(f"{n}. {MENU_TITLES.get(n, '')}" for n in resolved))
                    if not ask_yes_no(f"{len(resolved)}개 메뉴를 순서대로 실행할까요?", True):
                        log("취소했습니다.")
                        continue
            pending_total, pending_done = len(resolved), 1
            last_sequence = list(resolved)
            action = resolved[0]
            menu_default = action
            pending = resolved[1:]
            if pending:
                log(f"──── [1/{pending_total}] {action}. {MENU_TITLES.get(action, '')} ────")
        if action == "22":
            show_config_status(cfg)
            continue
        if action == "23":
            if not config_is_real():
                if not ask_yes_no("config.json을 새로 만들까요?", True):
                    continue
                init_config()
                cfg = load_config()
            cfg = configure_menu(cfg)
            promo_cfg = cfg.get("promo", {})
            try:
                default_unit = int(promo_cfg.get("default_unit", 1) or 1)
            except (TypeError, ValueError):
                default_unit = 1
            default_unit = min(30, max(1, default_unit))
            try:
                default_words = int(promo_cfg.get("default_words", 5) or 5)
            except (TypeError, ValueError):
                default_words = 5
            default_words = min(10, max(1, default_words))
            default_theme = str(promo_cfg.get("default_theme", "blue")).lower()
            _themes, _styles = make_short_choices()
            if default_theme not in _themes:
                default_theme = "blue"
            default_style = str(promo_cfg.get("default_style", "classic")).lower()
            if default_style not in _styles:
                default_style = "classic"
            default_privacy = str(promo_cfg.get("default_privacy", cfg.get("youtube", {}).get("privacy", "unlisted"))).lower()
            if default_privacy not in ("public", "unlisted", "private"):
                default_privacy = "unlisted"
            default_tts = bool(promo_cfg.get("default_tts", False))
            default_voice = str(promo_cfg.get("default_voice", DEFAULT_VOICE) or DEFAULT_VOICE)
            default_voice2 = str(promo_cfg.get("default_voice2", DEFAULT_VOICE2) or "")
            confirm_real_upload = bool(promo_cfg.get("confirm_real_upload", True))
            continue
        if action == "24":
            log("\n폴더·파일 열기")
            log("  1. 쇼츠 폴더")
            log("  2. 비밀키 폴더")
            log("  3. config.json")
            log("  4. 예약·이력 폴더")
            target = ask_menu("선택", "1")
            paths = {"1": SHORTS_DIR, "2": SECRETS_DIR, "3": CONFIG_FILE, "4": PROMO}
            path = paths.get(target)
            if path:
                path.parent.mkdir(parents=True, exist_ok=True) if path.suffix else path.mkdir(parents=True, exist_ok=True)
                open_path(path)
            continue
        if action == "19":
            items = load_schedules()
            display_schedules(items)
            scheduled = [x for x in items if x.get("status") == "scheduled"]
            if scheduled and ask_yes_no("예약을 취소하시겠습니까?", False):
                schedule_id = ask_menu("취소할 예약 ID")
                if cancel_schedule(schedule_id):
                    ok("예약을 취소했습니다.")
                else:
                    warn("예약 ID가 없거나 이미 처리된 예약입니다.")
            continue
        if action == "20":
            due = due_schedules()
            if not due:
                log("지금 실행할 예약 게시가 없습니다.")
                continue
            display_schedules(due)
            dry_run = ask_yes_no("dry-run으로 미리 실행할까요?", True)
            if not dry_run and not ask_yes_no("실제로 게시할까요?", False):
                log("예약 게시 실행을 취소했습니다.")
                continue
            processed = process_due_schedules(cfg, dry_run=dry_run)
            log(f"도래한 예약 {processed}건을 처리했습니다.")
            continue
        if action == "15":
            show_history_menu()
            continue
        if action == "25":
            sub = ask_menu("등록(r) / 해제(d)", "r").lower()
            if sub in ("r", "등록", "y", "예"):
                interval = ask_int("확인 주기(분)", 10, 1, 60)
                dry = ask_yes_no("dry-run 모드로 등록(안전, 권장)", True)
                install_scheduled_task(interval_min=interval, dry_run_only=dry)
            elif sub in ("d", "해제", "삭제"):
                remove_scheduled_task()
            continue
        if action == "10":
            run_batch_menu(cfg)
            continue
        if action == "16":
            write_history_report()
            continue
        if action == "17":
            sub = ask_menu("성과 수집(c) / 보고서(r) / 인사이트(i)", "c").lower()
            if sub in ("c", "수집", "수"):
                collect_performance(cfg)
            elif sub in ("i", "인사이트", "분석"):
                show_performance_insights()
            else:
                write_performance_report()
            continue
        if action == "11":
            verify_video_menu(cfg)
            continue
        if action == "13":
            show_posted_menu()
            continue
        if action == "27":
            print_remaining()
            continue
        if action == "21":
            auto_plan_menu(cfg)
            continue
        if action == "28":
            keep_title = not ask_yes_no("제목도 함께 갱신할까요?", True)
            only = ask_menu("대상 영상 파일명 일부 (Enter=전체)", "")
            video = None
            if only.strip():
                hits = [p for p in list_videos_menu() if only.strip().lower() in p.name.lower()]
                if not hits:
                    warn("일치하는 영상이 없습니다.")
                    continue
                if len(hits) > 1:
                    log("여러 개가 일치합니다: " + ", ".join(p.name for p in hits[:6]))
                    continue
                video = hits[0]
            refresh_youtube_descriptions(cfg, video=video, apply=False, keep_title=keep_title)
            if ask_yes_no("위 내용으로 YouTube 제목·설명을 실제 갱신할까요?", False):
                refresh_youtube_descriptions(cfg, video=video, apply=True, keep_title=keep_title)
            continue
        if action == "29":
            tts_voice_menu(cfg)
            promo_cfg = cfg.get("promo", {})
            default_tts = bool(promo_cfg.get("default_tts", True))
            default_voice = str(promo_cfg.get("default_voice", DEFAULT_VOICE) or DEFAULT_VOICE)
            # 빈 문자열이면 '두 번째 목소리 없음'을 뜻합니다(오른쪽 or DEFAULT_VOICE2 를 쓰지 않음).
            default_voice2 = str(promo_cfg.get("default_voice2", DEFAULT_VOICE2) or "")
            continue
        if action == "14":
            target = ask_menu("초기화 대상 (all · UNIT 번호 · idioms · frequency · paraphrase)", "all")
            if ask_yes_no("중복 방지 기록을 초기화할까요?", False):
                reset_posted(target)
            continue
        if action == "26":
            youtube_menu(cfg)
            continue
        if action == "12":
            video = choose_video_menu()
            if video is None:
                continue
            saved = load_video_meta(video)
            if saved:
                log(f"영상 메타 사용: {describe_saved_meta(saved)} (제목·설명 자동)")
                unit = None
            else:
                unit_raw = ask_menu("자동 제목에 사용할 UNIT 번호(취소하려면 0)", str(default_unit))
                unit = None if unit_raw == "0" else (int(unit_raw) if unit_raw.isdigit() else default_unit)
            platforms = choose_platforms_menu(cfg)
            m_args = argparse.Namespace(video=str(video), unit=unit, title=None, desc=None,
                                        platforms=platforms, dry_run=True, youtube_privacy=None,
                                        allow_repeat=True, manual_fallback=False)
            meta = build_meta(cfg, m_args)
            for short in (p.strip() for p in platforms.split(",") if p.strip()):
                manual_publish(video, meta, short, cfg)
            if meta.get("word"):
                mark_words_posted(meta.get("word_bucket") or unit, [meta["word"]])
            continue
        if action not in ("1", "2", "3", "4", "5", "6", "7", "8", "9", "18", "21"):
            warn("메뉴 번호를 확인해 주세요.")
            continue

        if action == "18":
            unit = choose_unit(default_unit)
            video = choose_video_menu()
            if video is None:
                continue
            platforms = choose_platforms_menu(cfg)
            privacy = ask_menu("YouTube 공개 범위(public/unlisted/private)", default_privacy)
            if privacy not in ("public", "unlisted", "private"):
                privacy = "unlisted"
            scheduled_at = ask_menu("예약 일시(YYYY-MM-DD HH:MM)")
            try:
                item = create_schedule(video=video, unit=unit, platforms=platforms,
                                       privacy=privacy, scheduled_at=scheduled_at)
            except ValueError as exc:
                warn(str(exc))
                continue
            ok(f"예약 등록 완료: {item['id']} · {item['scheduled_at']}")
            log("예약 시각에 이 명령을 실행해야 게시됩니다: python publish.py --run-due")
            continue

        # 2·6 숙어, 3·7 빈도 어휘, 4·8 동의어 치환 퀴즈, 나머지(1·5) 단어 —
        # 같은 흐름을 종류만 바꿔 돕습니다.
        kind = ("idioms" if action in ("2", "6")
                else "frequency" if action in ("3", "7")
                else "paraphrase" if action in ("4", "8") else "unit")
        # 기존 영상 게시(9)는 영상 메타가 있으면 UNIT을 묻지 않으므로, 여기서는 생성(1·5)만 묻습니다.
        unit = choose_unit(default_unit) if (kind == "unit" and action in ("1", "5")) else None
        video = None
        # 1~8 은 쇼츠를 만드는 흐름(1~4 는 생성만, 5~8 은 생성 후 게시)입니다.
        if action in ("1", "2", "3", "4", "5", "6", "7", "8"):
            words = str(ask_int("영상에 넣을 항목 수(1~10)", default_words, 1, 10))
            themes, styles = make_short_choices()
            theme = ask_menu(f"배경 테마({'/'.join(themes)})", default_theme).lower()
            while theme not in themes:
                warn(f"지원하는 테마: {', '.join(themes)}")
                theme = ask_menu("배경 테마", default_theme).lower()
            style = ask_menu(f"카드 스타일({'/'.join(styles)})", default_style).lower()
            while style not in styles:
                warn(f"지원하는 스타일: {', '.join(styles)}")
                style = ask_menu("카드 스타일", default_style).lower()
            command = [sys.executable, str(PROMO / "make_shorts.py"),
                       "--words", words, "--bg", theme, "--style", style]
            if kind == "idioms":
                command.append("--idioms")
            elif kind == "frequency":
                command.append("--frequency")
            elif kind == "paraphrase":
                command.append("--paraphrase")
            else:
                command.extend(["--unit", str(unit)])
            tts_on = ask_yes_no("영어 TTS를 추가할까요?", default_tts)
            picked_voice = picked_voice2 = ""
            if tts_on:
                command.append("--tts")
                tts_engine = tts_engine_of(cfg)
                command.extend(["--engine", tts_engine])
                picked_voice = ask_voice("첫 번째 TTS 목소리 (여성)", default_voice, engine=tts_engine)
                command.extend(["--voice", picked_voice])
                picked_voice2 = ask_voice("두 번째 TTS 목소리 (남성)", default_voice2, allow_none=True,
                                          engine=tts_engine)
                if picked_voice2:
                    command.extend(["--voice2", picked_voice2])
                else:
                    command.append("--single-voice")
            else:
                command.append("--no-tts")
            # 이번에 고른 TTS 설정을 다음부터 기본값으로 저장할지 묻습니다(메뉴 23·29 와 같은 자리에 저장).
            promo_now = cfg.setdefault("promo", {})
            tts_changed = bool(promo_now.get("default_tts", True)) != tts_on or (
                tts_on and (picked_voice != default_voice or picked_voice2 != default_voice2))
            if tts_changed and ask_yes_no("선택한 TTS 설정을 다음부터 기본값으로 저장할까요?", True):
                engine_now = tts_engine_of(cfg)
                promo_now["default_tts"] = bool(tts_on)
                if tts_on:
                    promo_now["default_voice"] = picked_voice
                    promo_now["default_voice2"] = picked_voice2
                save_config(cfg)
                if tts_on:
                    first_label = voice_label(str(promo_now.get("default_voice", "") or ""), engine_now)
                    second_label = voice_label(str(promo_now.get("default_voice2", "") or ""), engine_now)
                    second_part = (f" + {second_label}" if promo_now.get("default_voice2")
                                   else " (한 목소리)")
                    ok(f"TTS 기본값을 저장했습니다: {CONFIG_FILE.name} · 엔진 {engine_now} · "
                       f"{first_label}{second_part}")
                else:
                    ok(f"TTS 기본값을 저장했습니다: {CONFIG_FILE.name} · 낭독(TTS) 끔")
                default_tts = bool(tts_on)
                default_voice = str(promo_now.get("default_voice", default_voice) or default_voice)
                default_voice2 = str(promo_now.get("default_voice2", default_voice2) or "")
            if ask_yes_no("배경음악을 추가할까요?(파일 경로 필요)", False):
                music_path = ask_menu("배경음악 파일(mp3/wav) 경로")
                if music_path:
                    command.extend(["--music", music_path])
            if ask_yes_no("이미 사용한 항목도 다시 쓸까요?", False):
                command.append("--allow-repeat")
            started = time.time()
            if not run_menu_command(command):
                fail("쇼츠 생성에 실패해 게시를 중단합니다.")
                continue
            if kind == "unit":
                video = PROMO / "assets" / "shorts" / f"unit{unit:02d}_shorts.mp4"
            else:
                # 숙어·빈도·퀴즈 영상은 파일명이 첫 항목을 따르므로 시작 시각 이후 생성물을 찾습니다.
                video = newest_video_since(started)
                if video is None:
                    fail("생성된 영상을 찾지 못했습니다.")
                    continue
            if action in ("1", "2", "3", "4"):
                ok(f"쇼츠 생성 완료: {video}")
                continue
        else:
            video = choose_video_menu()
            if video is None:
                continue
            saved = load_video_meta(video)
            if saved:
                # 영상에 기록된 메타로 제목·설명을 만들므로 UNIT 번호를 묻지 않습니다(숙어 영상도 같음).
                log(f"영상 메타 사용: {describe_saved_meta(saved)} (제목·설명 자동)")
                unit = None
            else:
                unit_raw = ask_menu("자동 제목에 사용할 UNIT 번호(취소하려면 0)", str(unit or default_unit))
                if unit_raw == "0":
                    unit = None
                else:
                    try:
                        unit = int(unit_raw)
                    except ValueError:
                        warn("잘못된 UNIT이라 기본값을 사용합니다.")
                        unit = default_unit

        platforms = choose_platforms_menu(cfg)
        privacy = ask_menu("YouTube 공개 범위(public/unlisted/private)", default_privacy)
        if privacy not in ("public", "unlisted", "private"):
            privacy = "unlisted"
        dry_run = ask_yes_no("먼저 미리보기(dry-run)로 확인할까요?", True)
        command = [sys.executable, str(PROMO / "publish.py"), "--non-interactive", "--video", str(video),
                   "--platforms", platforms, "--youtube-privacy", privacy]
        if kind == "idioms":
            command.append("--idioms")   # 영상 메타가 없을 때를 위한 폴백
        elif kind == "frequency":
            command.append("--frequency")
        elif kind == "paraphrase":
            command.append("--paraphrase")
        elif unit:
            command.extend(["--unit", str(unit)])
        if ask_yes_no("이미 게시한 영상도 다시 게시할까요?", False):
            command.append("--allow-repeat")
        if dry_run:
            command.append("--dry-run")
        else:
            if confirm_real_upload:
                log("⚠️ 실제 게시를 진행합니다. 각 플랫폼에 콘텐츠가 업로드됩니다.")
                if not ask_yes_no("정말 게시할까요?", False):
                    log("게시를 취소했습니다.")
                    continue
        if run_menu_command(command):
            ok("원클릭 작업이 완료되었습니다.")
        else:
            fail("게시 중 일부 작업이 실패했습니다. 위 로그를 확인하세요.")
        if not ask_yes_no("메인 메뉴로 돌아갈까요?", True):
            return


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def expand_bare_flags(tokens: list[str], parser: argparse.ArgumentParser) -> list[str]:
    """`publish.py check` 처럼 하이픈 없는 한 단어를 `--check` 로 바꿔 줍니다.

    BAT·셸에서 편하게 칠 수 있게 하기 위한 것으로, 첫 자리부터 차례로 붙어 있고
    실제로 등록된 옵션일 때만 바꾸며(예: `reset-posted idioms` → 값은 그대로),
    `-` 로 시작하는 토큰이 나오면 끝냅니다.

    첫 토큰이 `5` · `1-4` · `15,16` 처럼 메뉴 번호면 `--menu-run` 으로 바꿔 줍니다 —
    `promo_center.bat 1-4` 만 쳐도 쇼츠 4종을 차례로 만듭니다.
    """
    out: list[str] = []
    expanding = True
    for tok in tokens:
        if expanding and not out and tok and MENU_CLI_RE.match(tok):
            out.extend(["--menu-run", tok])
            expanding = False
            continue
        if expanding and tok and not tok.startswith("-") and f"--{tok}" in parser._option_string_actions:
            out.append(f"--{tok}")
            continue
        expanding = False
        out.append(tok)
    return out


def main() -> None:
    global _yt_privacy_override
    ap = argparse.ArgumentParser(
        description="toeic.monster 홍보 영상 원클릭 배포 (YouTube Shorts / Instagram Reels / TikTok)"
    )
    ap.add_argument("--video", help="업로드할 영상 (기본: assets/shorts/ 의 가장 최근 mp4)")
    ap.add_argument("--unit", type=int, help="자동 제목 생성용 유닛 번호 (1~30)")
    ap.add_argument("--frequency", action="store_true",
                    help="빈도순 기출 어휘 200선(data/extra.js frequency) 영상 제목·설명")
    ap.add_argument("--idioms", action="store_true",
                    help="숙어 영상용 제목·설명 자동 생성 (data/idioms.js 기준)")
    ap.add_argument("--paraphrase", action="store_true",
                    help="동의어 치환 퀴즈 영상용 제목·설명 자동 생성 (data/extra.js paraphrase 기준)")
    ap.add_argument("--title", help="제목 직접 지정 (기본: 자동 생성)")
    ap.add_argument("--desc", help="설명 직접 지정")
    ap.add_argument("--platforms", default="auto", help="yt,ig,tt (기본: config 에서 enabled 인 플랫폼)")
    ap.add_argument("--youtube-privacy", choices=["public", "unlisted", "private"], help="YouTube 공개 범위")
    ap.add_argument("--dry-run", action="store_true", help="실제 업로드 없이 계획만 출력")
    ap.add_argument("--allow-repeat", action="store_true",
                    help="이미 사용한 단어·게시한 영상도 다시 사용 (중복 방지 무시)")
    ap.add_argument("--manual-fallback", dest="manual_fallback", action="store_true", default=None,
                    help="자동 게시 실패 시 수동 게시 도우미 실행 (기본: config 값)")
    ap.add_argument("--no-manual-fallback", dest="manual_fallback", action="store_false",
                    help="수동 게시 폴백 사용 안 함")
    ap.add_argument("--menu", action="store_true", help="터미널 원클릭 메뉴 실행")
    ap.add_argument("--menu-run", metavar="메뉴",
                    help="메뉴를 바로 실행 — 번호·범위·키워드 모두 가능 (예: --menu-run 5 · 1-4 · 예약)")
    ap.add_argument("--menu-list", action="store_true",
                    help="번호 순(1~29)으로 원클릭 메뉴 목록만 출력하고 종료")
    ap.add_argument("--non-interactive", action="store_true", help=argparse.SUPPRESS)
    ap.add_argument("--schedule", action="store_true", help="지정한 게시 정보를 예약으로 저장")
    ap.add_argument("--schedule-time", help="예약 시각: YYYY-MM-DD HH:MM 또는 ISO 형식")
    ap.add_argument("--run-due", action="store_true", help="현재 시각까지 도래한 예약 게시 실행")
    ap.add_argument("--list-schedules", action="store_true", help="예약 목록 출력")
    ap.add_argument("--cancel-schedule", metavar="ID", help="예약 ID 취소")
    ap.add_argument("--history", action="store_true", help="최근 게시 이력 CSV 출력")
    ap.add_argument("--refresh-desc", action="store_true",
                    help="게시된 YouTube 영상 제목·설명을 새 형식으로 갱신 (기본 미리보기)")
    ap.add_argument("--apply", action="store_true",
                    help="--refresh-desc 를 실제로 적용 (없으면 미리보기만)")
    ap.add_argument("--keep-title", action="store_true",
                    help="--refresh-desc 에서 제목은 두고 설명만 갱신")
    ap.add_argument("--list-posted", action="store_true",
                    help="사용한 단어·게시한 영상 기록 출력 (중복 방지)")
    ap.add_argument("--list-remaining", action="store_true",
                    help="종류별 남은 콘텐츠 수량만 출력 (단어·숙어·빈도·동의어 치환)")
    ap.add_argument("--voice-gender", action="store_true",
                    help="내려받은 Piper 음성의 성별(여성/남성)을 측정해 표시 — 메뉴 29·미리듣기 필터(f/m)에서도 씁니다")
    ap.add_argument("--reset-posted", nargs="?", const="all", metavar="UNIT|idioms|all",
                    help="중복 방지 기록 초기화 (기본 all, UNIT 번호·idioms·frequency·paraphrase 지정 가능)")
    ap.add_argument("--init-config", action="store_true", help="config.example.json에서 config.json 생성")
    ap.add_argument("--check", action="store_true", help="설정·의존성·폴더 상태 점검")
    ap.add_argument("--edit-config", action="store_true", help="터미널에서 설정 편집")
    ap.add_argument("--open-shorts", action="store_true", help="쇼츠 폴더 열기")
    ap.add_argument("--batch", nargs="?", const=5, type=int, metavar="N",
                    help="assets/shorts/ 의 최신 N개 영상을 순차 게시 (기본 5)")
    ap.add_argument("--report", action="store_true", help="게시 이력 HTML 리포트 생성")
    ap.add_argument("--stats", action="store_true", help="게시 성과 수집 (YouTube/Instagram)")
    ap.add_argument("--stats-report", action="store_true", help="수집된 성과를 HTML 보고서로 생성")
    ap.add_argument("--stats-insights", action="store_true",
                    help="성과 인사이트 — 종류별 성과·좋은 게시 시간대·추천 콘텐츠")
    ap.add_argument("--auto-plan", type=int, metavar="N",
                    help="N일치 쇼츠를 자동 생성하고 (--plan-start 지정 시) 예약 게시까지 등록")
    ap.add_argument("--plan-kind", default="auto",
                    choices=["auto", "unit", "idioms", "frequency", "paraphrase"],
                    help="--auto-plan 콘텐츠 종류 (기본 auto — 남은 콘텐츠가 많은 순)")
    ap.add_argument("--plan-start", help="--auto-plan 첫 예약 일시: YYYY-MM-DD HH:MM (생략하면 생성만)")
    ap.add_argument("--plan-days", type=int, default=1, help="예약 게시 간격(일) (기본 1)")
    ap.add_argument("--plan-words", type=int, help="영상당 항목 수 (기본: 설정 default_words)")
    ap.add_argument("--install-task", nargs="?", const=10, type=int, metavar="MIN",
                    help="Windows 작업 스케줄러에 매 MIN분 예약 확인 등록 (기본 10)")
    ap.add_argument("--remove-task", action="store_true", help="Windows 작업 스케줄러 등록 해제")
    ap.add_argument("--verify", action="store_true",
                    help="배포 전 영상 검증 실행 (재생·Shorts 요건 점검 후 게시)")
    ap.add_argument("--youtube-setup", action="store_true",
                    help="YouTube 상태 진단 후 필요한 단계만 진행 (OAuth 파일 없으면 설정 안내)")
    ap.add_argument("--youtube-guide", action="store_true",
                    help="YouTube OAuth 설정 도우미 (안내·검증·로그인)")
    ap.add_argument("--youtube-login", action="store_true", help="YouTube 브라우저 로그인 후 토큰 저장")
    ap.add_argument("--youtube-relogin", action="store_true", help="기존 토큰 무시하고 YouTube 재로그인")
    ap.add_argument("--youtube-check", action="store_true", help="YouTube 설정 상태만 점검")
    ap.add_argument("--manual", action="store_true",
                    help="자동 업로드 대신 수동 게시 도우미만 실행 (업로드 페이지 열기 + 캡션 복사)")
    args = ap.parse_args(expand_bare_flags(sys.argv[1:], ap))
    if args.init_config:
        init_config()
        return
    if args.voice_gender:
        show_voice_gender_table()
        return
    if args.menu_list:
        print_interactive_menu()
        log("  예) promo_center.bat 1-4  ·  promo_center.bat 5  ·  promo_center.bat (메뉴 열기)")
        return
    if args.menu_run is not None:
        interactive_menu(initial=args.menu_run)
        return
    if (args.menu or len(sys.argv) == 1) and not args.non_interactive:
        interactive_menu()
        return
    _yt_privacy_override = args.youtube_privacy

    if args.edit_config and not CONFIG_FILE.exists():
        init_config()
    cfg = load_config()
    if args.check or args.edit_config or args.open_shorts:
        if args.edit_config and not config_is_real():
            init_config()
            cfg = load_config()
        if args.edit_config:
            configure_menu(cfg)
        if args.check:
            show_config_status(load_config())
        if args.open_shorts:
            SHORTS_DIR.mkdir(parents=True, exist_ok=True)
            open_path(SHORTS_DIR)
        return
    if args.list_schedules:
        display_schedules(load_schedules())
        return
    if args.cancel_schedule:
        if cancel_schedule(args.cancel_schedule):
            ok(f"예약을 취소했습니다: {args.cancel_schedule}")
        else:
            fail(f"취소할 예약을 찾지 못했습니다: {args.cancel_schedule}")
        return
    if args.history:
        show_history_menu()
        return
    if args.refresh_desc:
        video = resolve_video(args) if args.video else None
        refresh_youtube_descriptions(cfg, video=video, apply=args.apply,
                                     keep_title=args.keep_title)
        return
    if args.list_posted:
        show_posted_menu()
        return
    if args.list_remaining:
        # 생성·게시 없이 남은 수량만 보는 용도 — 종류별 전체·사용·남음을 표로 보여 줍니다.
        print_remaining()
        return
    if args.reset_posted:
        reset_posted(args.reset_posted)
        return
    if args.youtube_check:
        youtube_check(cfg)
        return
    if args.youtube_guide:
        youtube_setup_guide()
        return
    if args.youtube_setup:
        youtube_menu(cfg)
        return
    if args.youtube_login or args.youtube_relogin:
        youtube_login(cfg, force=bool(args.youtube_relogin))
        return
    if args.manual:
        video = resolve_video(args)
        meta = build_meta(cfg, args)
        platforms = resolve_platforms(cfg, args.platforms)
        if not platforms:
            fail("활성화된 플랫폼이 없습니다. --platforms yt,ig,tt 로 지정하세요.")
            return
        for short in platforms:
            manual_publish(video, meta, short, cfg)
        if meta.get("word"):
            mark_words_posted(meta.get("word_bucket") or args.unit, [meta["word"]])
        return
    if args.report:
        write_history_report()
        return
    if args.stats:
        collect_performance(cfg)
        return
    if args.stats_report:
        write_performance_report()
        return
    if args.stats_insights:
        show_performance_insights()
        return
    if args.auto_plan is not None:
        run_auto_plan(cfg, args.auto_plan, args.plan_kind, start_at=args.plan_start,
                      interval_days=args.plan_days, words=args.plan_words)
        return
    if args.install_task:
        install_scheduled_task(interval_min=args.install_task)
        return
    if args.remove_task:
        remove_scheduled_task()
        return
    if args.verify:
        verify_video_menu(cfg)
        return
    if args.run_due:
        processed = process_due_schedules(cfg, dry_run=args.dry_run)
        ok(f"도래한 예약 {processed}건을 처리했습니다.")
        return
    if args.batch:
        videos = list_videos_menu()[:args.batch]
        if not videos:
            fail("assets/shorts 폴더에 게시할 mp4 영상이 없습니다.")
            sys.exit(1)
        log(f"\n일괄 게시: 최신 {len(videos)}개 영상 (dry-run={args.dry_run})")
        for video in videos:
            publish_single(cfg, args, video)
        return
    video = resolve_video(args)
    if args.schedule:
        if not args.schedule_time:
            fail("예약 저장에는 --schedule-time이 필요합니다.")
            return
        privacy = args.youtube_privacy or cfg.get("youtube", {}).get("privacy", "public")
        try:
            item = create_schedule(
                video=video, unit=args.unit, platforms=args.platforms,
                privacy=privacy, scheduled_at=args.schedule_time,
                title=args.title or "", desc=args.desc or "",
            )
        except ValueError as exc:
            fail(str(exc))
            return
        ok(f"예약 등록 완료: {item['id']} · {item['scheduled_at']}")
        return
    publish_single(cfg, args, video)


def publish_single(cfg: dict, args, video: Path) -> None:
    """영상 하나를 지정 플랫폼에 게시하고 이력을 남깁니다. (--dry-run 지원)"""
    meta = build_meta(cfg, args)
    platforms = resolve_platforms(cfg, args.platforms)

    if not args.dry_run and not getattr(args, "allow_repeat", False) and platforms:
        remaining, already = filter_posted_platforms(video, platforms)
        if already:
            warn(f"{video.name}: 이미 게시한 플랫폼 {', '.join(p.upper() for p in already)} — 건너뜁니다.")
        if not remaining:
            warn("같은 숏폼을 다시 게시하지 않습니다. 정말 다시 올리려면 --allow-repeat 을 사용하세요.")
            return
        platforms = remaining

    fallback = getattr(args, "manual_fallback", None)
    if fallback is None:
        fallback = bool(cfg.get("promo", {}).get("manual_fallback", True))

    size_mb = video.stat().st_size / (1024 * 1024)
    log("=" * 62)
    log("🎬 toeic.monster 홍보 자동 배포" + ("  (dry-run 미리보기)" if args.dry_run else ""))
    log("=" * 62)
    log(f"영상  : {video.relative_to(PROMO) if video.is_relative_to(PROMO) else video} ({size_mb:.1f}MB)")
    log(f"제목  : {meta['title']}")
    if meta["desc"]:
        first = meta["desc"].splitlines()[0]
        log(f"설명  : {first}" + (" …" if len(meta["desc"]) > len(first) else ""))
    if meta["hashtags"]:
        log(f"해시태그: {meta['hashtags']}")
    log(f"플랫폼: {', '.join(p.upper() for p in platforms) or '(없음 — config 에서 enabled 확인)'}")
    log("-" * 62)

    if not platforms:
        fail("활성화된 플랫폼이 없습니다. config.json 에서 youtube/instagram/tiktok.enabled 를 확인하세요.")
        sys.exit(1)

    results = []
    for short in platforms:
        if short == "yt":
            url = upload_youtube(video, meta, cfg, args.dry_run)
        elif short == "ig":
            url = upload_instagram(video, meta, cfg, args.dry_run)
        elif short == "tt":
            url = upload_tiktok(video, meta, cfg, args.dry_run)
        else:
            warn(f"알 수 없는 플랫폼: {short}")
            continue
        results.append((short, url))
        if url and url != "dry-run":
            mark_video_posted(video, short, url)
        append_history(
            event="publish",
            status="dry-run" if url == "dry-run" else ("success" if url else "failed"),
            platform=short,
            video=str(video),
            unit=args.unit,
            title=meta["title"],
            url=url or "",
            message="직접 게시 실행" if url else "플랫폼 게시 실패 또는 건너뜀",
        )

    if not args.dry_run and fallback:
        failed = [s for s, u in results if u is None]
        if failed:
            log("\n자동 게시가 안 되는 플랫폼은 수동 게시 도우미로 넘깁니다.")
        for index, (short, url) in enumerate(results):
            if url is None and manual_publish(video, meta, short, cfg):
                results[index] = (short, "manual")

    if not args.dry_run and any(url and url != "dry-run" for _short, url in results):
        if meta.get("word"):
            mark_words_posted(meta.get("word_bucket") or args.unit, [meta["word"]])
        log(f"🔁 중복 방지 기록 저장: {POSTED_FILE.name}")

    log("-" * 62)
    log("📋 결과")
    names = {"yt": "YouTube Shorts", "ig": "Instagram Reels", "tt": "TikTok"}
    for short, url in results:
        if url == "manual":
            log(f"  · {names[short]}: 수동 게시 도우미 실행 (브라우저에서 마무리하세요)")
        elif url and url != "dry-run":
            ok(f"{names[short]}: {url}")
        elif url == "dry-run":
            log(f"  · {names[short]}: 업로드 예정 (dry-run — 실제 업로드하려면 옵션 제거)")
        else:
            fail(f"{names[short]}: 건너뜀 (설정/오류 — 위 메시지 확인)")
    if args.dry_run:
        log("\n실제 업로드하려면 --dry-run 을 빼고 실행하세요.")
        if getattr(args, "idioms", False):
            flag = " --idioms"
        elif getattr(args, "frequency", False):
            flag = " --frequency"
        elif getattr(args, "paraphrase", False):
            flag = " --paraphrase"
        elif args.unit:
            flag = f" --unit {args.unit}"
        else:
            # 영상 옆 메타(*.json)가 제목·설명을 만들므로 다시 돌릴 때 UNIT 이 필요 없습니다.
            flag = ""
        log(f"예: python publish.py --video {video.relative_to(PROMO)}{flag}")

    highlight = (IDIOM_BUCKET if getattr(args, "idioms", False)
                 else FREQUENCY_BUCKET if getattr(args, "frequency", False)
                 else PARAPHRASE_BUCKET if getattr(args, "paraphrase", False)
                 else "unit" if getattr(args, "unit", None) else None)
    print_remaining(highlight)


_yt_privacy_override: str | None = None

if __name__ == "__main__":
    main()