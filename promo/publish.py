#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
toeic.monster 홍보 자동 배포 — YouTube Shorts / Instagram Reels / TikTok 원클릭 게시

사용법:
  python publish.py --video assets/shorts/unit01.mp4 --unit 1
  python publish.py --video assets/shorts/my.mp4 --title "제목" --desc "설명"
  python publish.py --video assets/shorts/my.mp4 --platforms yt,ig --youtube-privacy unlisted
  python publish.py --dry-run                       # 업로드 없이 계획만 출력

자동 제목/설명: --unit N 을 주면 data/unitNN.js 의 단어를 랜덤으로 골라
"단어 | TOEIC 필수 어휘 UNIT N 주제 | toeic.monster" 형식으로 생성합니다.

플랫폼:
  - YouTube Shorts : 공식 YouTube Data API v3 (OAuth, 무료, 하루 6개 제한)
  - Instagram Reels: instagrapi (비공식 라이브러리, 계정 아이디/비밀번호)
  - TikTok        : 선택 사항. 공식 API 승인이 어려워 비공식 라이브러리 사용(불안정)

주의: 대량 업로드는 계정 정책 위반으로 이어질 수 있습니다. 하루 1~2개 권장.
"""

from __future__ import annotations

import argparse
import ast
import csv
import getpass
import importlib.util
import json
import random
import re
import shutil
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
SCHED_TASK_NAME = "toeic_monster_promo"
HISTORY_FIELDS = [
    "timestamp", "event", "status", "schedule_id", "scheduled_at", "platform",
    "video", "unit", "title", "url", "message",
]

UNIT_FILE_RE = re.compile(r"window\.VOCAB_UNITS\s*\[\s*(\d+)\s*\]\s*=\s*(\[[\s\S]*?\]);")
UNITS_BLOCK_RE = re.compile(r"var UNITS\s*=\s*\[([\s\S]*?)\];")
UNIT_ENTRY_RE = re.compile(r"\{\s*id:\s*(\d+)[^}]*?title:\s*\"([^\"]*)\"[^}]*?level:\s*\"([^\"]*)\"[^}]*?icon:\s*\"([^\"]*)\"\s*\}")


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
        secret = SECRETS_DIR / (yt.get("client_secret_file") or "client_secret.json")
        if not secret.exists():
            warnings.append(f"YouTube OAuth 파일이 없습니다: {secret.name}")
    ig = cfg.get("instagram", {})
    if ig.get("enabled", True):
        if not ig.get("username") or str(ig.get("username")).startswith("YOUR_"):
            warnings.append("Instagram username이 아직 설정되지 않았습니다.")
        if not ig.get("password") or str(ig.get("password")).startswith("YOUR_"):
            warnings.append("Instagram password가 아직 설정되지 않았습니다.")
    tt = cfg.get("tiktok", {})
    if tt.get("enabled") and not tt.get("ms_token"):
        warnings.append("TikTok이 활성화됐지만 ms_token이 비어 있습니다.")
    return errors, warnings


def dependency_status() -> list[tuple[str, bool, str]]:
    """필수·선택 Python 모듈과 실행 파일의 설치 상태를 확인합니다."""
    checks = [
        ("Pillow", "PIL", "쇼츠 이미지 렌더링"),
        ("imageio-ffmpeg", "imageio_ffmpeg", "쇼츠 영상 인코딩"),
        ("Google API", "googleapiclient", "YouTube 업로드"),
        ("Google OAuth", "google_auth_oauthlib", "YouTube 로그인"),
        ("instagrapi", "instagrapi", "Instagram 업로드"),
        ("edge-tts", "edge_tts", "선택 TTS"),
    ]
    result = [(name, importlib.util.find_spec(module) is not None, purpose)
              for name, module, purpose in checks]
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


def load_unit_info() -> dict:
    """index.html 의 UNITS 메타데이터(id -> {title, level, icon}) 파싱."""
    index = ROOT / "index.html"
    if not index.exists():
        return {}
    text = index.read_text(encoding="utf-8")
    m = UNITS_BLOCK_RE.search(text)
    if not m:
        return {}
    info = {}
    for em in UNIT_ENTRY_RE.finditer(m.group(1)):
        info[int(em.group(1))] = {"title": em.group(2), "level": em.group(3), "icon": em.group(4)}
    return info


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


def build_meta(cfg: dict, args) -> dict:
    """제목/설명/해시태그 생성. --unit 이 있으면 단어 데이터에서 자동 생성."""
    title = args.title
    desc = args.desc
    unit_info = {}
    if args.unit:
        unit_info = load_unit_info().get(args.unit, {})
        words = load_unit_words(args.unit)
        if words:
            w = random.choice(words)
            unit_tag = f"UNIT {args.unit} {unit_info.get('title', '')}".strip()
            if not title:
                title = f"{w[0]} | TOEIC 필수 어휘 {unit_tag} | toeic.monster"
            if not desc:
                desc = (
                    f"TOEIC 필수 어휘 「{w[0]}」 [{w[1]}] {w[3]}\n"
                    f"예문: {w[4]}\n해석: {w[5]}\n\n"
                    f"발음·예문으로 외우는 TOEIC 보카 1,000 → {cfg.get('site_url', 'https://toeic.monster/')}"
                )
        elif not title:
            warn(f"UNIT {args.unit} 데이터를 읽지 못해 기본 제목을 사용합니다.")

    title = (title or cfg.get("default_title", "TOEIC 필수 어휘 | toeic.monster")).strip()[:100]
    desc = (desc or cfg.get("default_description", "")).strip()
    hashtags = " ".join("#" + h.strip().lstrip("#") for h in cfg.get("hashtags", []))
    if cfg.get("youtube", {}).get("include_shorts_tag", True) and "#Shorts" not in hashtags:
        hashtags += " #Shorts"
    return {"title": title, "desc": desc, "hashtags": hashtags, "unit": args.unit, "unit_info": unit_info}


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
    meta = build_meta(cfg, args)
    platforms = resolve_platforms(cfg, item.get("platforms", "auto"))
    if not platforms:
        append_history(event="publish", status="failed", schedule_id=item.get("id", ""),
                       scheduled_at=item.get("scheduled_at", ""), platform="", video=str(video),
                       unit=item.get("unit"), title=meta["title"], message="활성 플랫폼이 없습니다.")
        return False

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
        append_history(event="publish", status=status, schedule_id=item.get("id", ""),
                       scheduled_at=item.get("scheduled_at", ""), platform=short,
                       video=str(video), unit=item.get("unit"), title=meta["title"], url=url or "",
                       message="예약 게시 실행" if url else "플랫폼 게시 실패 또는 건너뜀")
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
# YouTube Shorts (공식 Data API v3)
# --------------------------------------------------------------------------- #
def upload_youtube(video: Path, meta: dict, cfg: dict, dry_run: bool) -> str | None:
    yt = cfg.get("youtube", {})
    if not yt.get("enabled", True):
        return None
    if dry_run:
        log("   [YouTube Shorts] 업로드 예정 (dry-run)")
        return "dry-run"
    client_secret = SECRETS_DIR / (yt.get("client_secret_file") or "client_secret.json")
    token_file = SECRETS_DIR / (yt.get("token_file") or "youtube_token.json")
    if not client_secret.exists():
        warn("YouTube 설정 필요: Google Cloud에서 client_secret.json 을 다운로드해 "
             f"{client_secret} 에 넣으세요. (README 참고)")
        return None

    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from google_auth_oauthlib.flow import InstalledAppFlow
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
    except ImportError:
        fail("google-api-python-client / google-auth-oauthlib 미설치 — pip install -r requirements.txt")
        return None

    SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
    creds = None
    if token_file.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)
        except Exception:
            creds = None
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    if not creds or not creds.valid:
        log("   YouTube 로그인: 브라우저에서 승인해 주세요 (최초 1회)")
        flow = InstalledAppFlow.from_client_secrets_file(str(client_secret), SCOPES)
        creds = flow.run_local_server(port=0, prompt="consent")
    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(creds.to_json(), encoding="utf-8")

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
# Instagram Reels (instagrapi)
# --------------------------------------------------------------------------- #
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
        cl.login(username, password)
        session_file.parent.mkdir(parents=True, exist_ok=True)
        cl.dump_settings(session_file)
    except Exception as e:
        fail(f"Instagram 로그인 실패: {e}")
        return None

    caption = meta["desc"]
    if meta["hashtags"]:
        caption = f"{caption}\n\n{meta['hashtags']}" if caption else meta["hashtags"]
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
        warn("TikTokApi 미설치 — pip install TikTokApi 후 재시도 (TikTok은 선택 기능)")
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
    value = input(f"{prompt}{suffix}: ").strip()
    return value if value else (default or "")


def ask_yes_no(prompt: str, default: bool = True) -> bool:
    default_text = "Y/n" if default else "y/N"
    value = input(f"{prompt} [{default_text}]: ").strip().lower()
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
    """메뉴 12: 여러 영상을 선택해 같은 UNIT·플랫폼으로 순차 게시합니다."""
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
    dry_run = ask_yes_no("dry-run으로 미리 확인할까요?", True)
    if not dry_run:
        log("⚠️ 실제 게시를 진행합니다. 각 플랫폼에 콘텐츠가 업로드됩니다.")
        if not ask_yes_no(f"{len(picked)}개 영상을 정말 게시할까요?", False):
            log("일괄 게시를 취소했습니다.")
            return
    for video in picked:
        log(f"\n▶ {video.name} 게시 시작")
        v_args = argparse.Namespace(video=str(video), unit=unit, title=None, desc=None,
                                    platforms=platforms, dry_run=dry_run, youtube_privacy=None)
        publish_single(cfg, v_args, video)
    ok(f"일괄 게시 처리 완료: {len(picked)}개 영상")


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
    total_views = 0
    for r in publishes:
        status = r.get("status", "") or ""
        status_count[status] = status_count.get(status, 0) + 1
        platform = r.get("platform", "") or ""
        if platform:
            platform_count[platform] = platform_count.get(platform, 0) + 1
        try:
            total_views += int(r.get("view_count", 0) or 0)
        except (TypeError, ValueError):
            pass
    names = {"yt": "YouTube Shorts", "ig": "Instagram Reels", "tt": "TikTok"}
    cards = "".join(
        f'<div class="card"><b>{v}</b><span>{k}</span></div>'
        for k, v in [("총 게시", len(publishes)),
                     ("성공", status_count.get("success", 0)),
                     ("실패", status_count.get("failed", 0)),
                     ("dry-run", status_count.get("dry-run", 0))])
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
def make_short_choices() -> tuple[list[str], list[str]]:
    try:
        from make_shorts import THEMES, STYLE_NAMES  # type: ignore[import-not-found]
        return sorted(THEMES), list(STYLE_NAMES)
    except Exception:
        return (["blue", "purple", "green", "orange", "pink", "navy"],
                ["classic", "modern", "minimal"])


def show_config_status(cfg: dict) -> None:
    log("\n🔐 설정·환경 상태")
    log(f"  설정 파일: {'config.json' if config_is_real() else 'config.example.json (예제)'}")
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
    promo["default_tts"] = ask_yes_no("기본으로 TTS 추가", bool(promo.get("default_tts", False)))
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


def interactive_menu() -> None:
    """인자 없이 실행했을 때 사용하는 안전한 원클릭 메뉴입니다."""
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
    confirm_real_upload = bool(promo_cfg.get("confirm_real_upload", True))
    menu_default = "2"
    while True:
        log("\n" + "=" * 62)
        log("🎬 toeic.monster 홍보 원클릭 센터")
        log("=" * 62)
        log("  1. 쇼츠 생성")
        log("  2. 기존 쇼츠 게시")
        log("  3. 쇼츠 생성 후 게시")
        log("  4. 계정·API 설정 상태 확인")
        log("  5. 예약 게시 등록")
        log("  6. 예약 목록 보기·취소")
        log("  7. 예약 게시 실행(지금 확인)")
        log("  8. 게시 이력 CSV 보기")
        log("  9. 설정 편집")
        log(" 10. 의존성·폴더 열기")
        log(" 11. Windows 작업 스케줄러 예약 실행 등록/해제")
        log(" 12. 여러 영상 일괄 게시")
        log(" 13. 게시 이력 HTML 리포트")
        log(" 14. 게시 성과 수집·보고서")
        log("  0. 종료")
        action = ask_menu("메뉴", menu_default)
        if action == "0":
            log("종료합니다.")
            return
        if action == "?":
            log("번호를 입력하거나 Enter로 기본값을 선택하세요. 실제 게시 전에는 확인 질문이 표시됩니다.")
            continue
        if action == "4":
            show_config_status(cfg)
            continue
        if action == "9":
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
            confirm_real_upload = bool(promo_cfg.get("confirm_real_upload", True))
            continue
        if action == "10":
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
        if action == "6":
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
        if action == "7":
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
        if action == "8":
            show_history_menu()
            continue
        if action == "11":
            sub = ask_menu("등록(r) / 해제(d)", "r").lower()
            if sub in ("r", "등록", "y", "예"):
                interval = ask_int("확인 주기(분)", 10, 1, 60)
                dry = ask_yes_no("dry-run 모드로 등록(안전, 권장)", True)
                install_scheduled_task(interval_min=interval, dry_run_only=dry)
            elif sub in ("d", "해제", "삭제"):
                remove_scheduled_task()
            continue
        if action == "12":
            run_batch_menu(cfg)
            continue
        if action == "13":
            write_history_report()
            continue
        if action == "14":
            sub = ask_menu("성과 수집(c) / 보고서(r)", "c").lower()
            if sub in ("c", "수집", "수"):
                collect_performance(cfg)
            else:
                write_performance_report()
            continue
        if action not in ("1", "2", "3", "5"):
            warn("메뉴 번호를 확인해 주세요.")
            continue

        if action == "5":
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

        unit = choose_unit(default_unit)
        video = None
        if action in ("1", "3"):
            words = str(ask_int("영상에 넣을 단어 수(1~10)", default_words, 1, 10))
            themes, styles = make_short_choices()
            theme = ask_menu(f"배경 테마({'/'.join(themes)})", default_theme).lower()
            while theme not in themes:
                warn(f"지원하는 테마: {', '.join(themes)}")
                theme = ask_menu("배경 테마", default_theme).lower()
            style = ask_menu(f"카드 스타일({'/'.join(styles)})", default_style).lower()
            while style not in styles:
                warn(f"지원하는 스타일: {', '.join(styles)}")
                style = ask_menu("카드 스타일", default_style).lower()
            command = [sys.executable, str(PROMO / "make_shorts.py"), "--unit", str(unit),
                       "--words", words, "--bg", theme, "--style", style]
            if ask_yes_no("영어 TTS를 추가할까요?", default_tts):
                command.append("--tts")
            if ask_yes_no("배경음악을 추가할까요?(파일 경로 필요)", False):
                music_path = ask_menu("배경음악 파일(mp3/wav) 경로")
                if music_path:
                    command.extend(["--music", music_path])
            if not run_menu_command(command):
                fail("쇼츠 생성에 실패해 게시를 중단합니다.")
                continue
            video = PROMO / "assets" / "shorts" / f"unit{unit:02d}_shorts.mp4"
            if action == "1":
                ok(f"쇼츠 생성 완료: {video}")
                continue
        else:
            video = choose_video_menu()
            if video is None:
                continue
            unit_raw = ask_menu("자동 제목에 사용할 UNIT 번호(취소하려면 0)", str(unit))
            if unit_raw == "0":
                unit = None
            else:
                try:
                    unit = int(unit_raw)
                except ValueError:
                    warn("잘못된 UNIT이라 기본값을 사용합니다.")

        platforms = choose_platforms_menu(cfg)
        privacy = ask_menu("YouTube 공개 범위(public/unlisted/private)", default_privacy)
        if privacy not in ("public", "unlisted", "private"):
            privacy = "unlisted"
        dry_run = ask_yes_no("먼저 미리보기(dry-run)로 확인할까요?", True)
        command = [sys.executable, str(PROMO / "publish.py"), "--non-interactive", "--video", str(video),
                   "--platforms", platforms, "--youtube-privacy", privacy]
        if unit:
            command.extend(["--unit", str(unit)])
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
        menu_default = "2"


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def main() -> None:
    global _yt_privacy_override
    ap = argparse.ArgumentParser(
        description="toeic.monster 홍보 영상 원클릭 배포 (YouTube Shorts / Instagram Reels / TikTok)"
    )
    ap.add_argument("--video", help="업로드할 영상 (기본: assets/shorts/ 의 가장 최근 mp4)")
    ap.add_argument("--unit", type=int, help="자동 제목 생성용 유닛 번호 (1~30)")
    ap.add_argument("--title", help="제목 직접 지정 (기본: 자동 생성)")
    ap.add_argument("--desc", help="설명 직접 지정")
    ap.add_argument("--platforms", default="auto", help="yt,ig,tt (기본: config 에서 enabled 인 플랫폼)")
    ap.add_argument("--youtube-privacy", choices=["public", "unlisted", "private"], help="YouTube 공개 범위")
    ap.add_argument("--dry-run", action="store_true", help="실제 업로드 없이 계획만 출력")
    ap.add_argument("--menu", action="store_true", help="터미널 원클릭 메뉴 실행")
    ap.add_argument("--non-interactive", action="store_true", help=argparse.SUPPRESS)
    ap.add_argument("--schedule", action="store_true", help="지정한 게시 정보를 예약으로 저장")
    ap.add_argument("--schedule-time", help="예약 시각: YYYY-MM-DD HH:MM 또는 ISO 형식")
    ap.add_argument("--run-due", action="store_true", help="현재 시각까지 도래한 예약 게시 실행")
    ap.add_argument("--list-schedules", action="store_true", help="예약 목록 출력")
    ap.add_argument("--cancel-schedule", metavar="ID", help="예약 ID 취소")
    ap.add_argument("--history", action="store_true", help="최근 게시 이력 CSV 출력")
    ap.add_argument("--init-config", action="store_true", help="config.example.json에서 config.json 생성")
    ap.add_argument("--check", action="store_true", help="설정·의존성·폴더 상태 점검")
    ap.add_argument("--edit-config", action="store_true", help="터미널에서 설정 편집")
    ap.add_argument("--open-shorts", action="store_true", help="쇼츠 폴더 열기")
    ap.add_argument("--batch", nargs="?", const=5, type=int, metavar="N",
                    help="assets/shorts/ 의 최신 N개 영상을 순차 게시 (기본 5)")
    ap.add_argument("--report", action="store_true", help="게시 이력 HTML 리포트 생성")
    ap.add_argument("--stats", action="store_true", help="게시 성과 수집 (YouTube/Instagram)")
    ap.add_argument("--stats-report", action="store_true", help="수집된 성과를 HTML 보고서로 생성")
    ap.add_argument("--install-task", nargs="?", const=10, type=int, metavar="MIN",
                    help="Windows 작업 스케줄러에 매 MIN분 예약 확인 등록 (기본 10)")
    ap.add_argument("--remove-task", action="store_true", help="Windows 작업 스케줄러 등록 해제")
    args = ap.parse_args()
    if args.init_config:
        init_config()
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
    if args.report:
        write_history_report()
        return
    if args.stats:
        collect_performance(cfg)
        return
    if args.stats_report:
        write_performance_report()
        return
    if args.install_task:
        install_scheduled_task(interval_min=args.install_task)
        return
    if args.remove_task:
        remove_scheduled_task()
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

    log("-" * 62)
    log("📋 결과")
    names = {"yt": "YouTube Shorts", "ig": "Instagram Reels", "tt": "TikTok"}
    for short, url in results:
        if url and url != "dry-run":
            ok(f"{names[short]}: {url}")
        elif url == "dry-run":
            log(f"  · {names[short]}: 업로드 예정 (dry-run — 실제 업로드하려면 옵션 제거)")
        else:
            fail(f"{names[short]}: 건너뜀 (설정/오류 — 위 메시지 확인)")
    if args.dry_run:
        log("\n실제 업로드하려면 --dry-run 을 빼고 실행하세요.")
        log(f"예: python publish.py --video {video.relative_to(PROMO)} --unit {args.unit or 1}")


_yt_privacy_override: str | None = None

if __name__ == "__main__":
    main()