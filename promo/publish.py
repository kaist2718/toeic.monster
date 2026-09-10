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
import json
import re
import random
import sys
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
    path = CONFIG_FILE if CONFIG_FILE.exists() else CONFIG_EXAMPLE
    if not path.exists():
        sys.exit("설정 파일이 없습니다. promo/config.example.json 을 복사해 config.json 을 만드세요.")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


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
# YouTube Shorts (공식 Data API v3)
# --------------------------------------------------------------------------- #
def upload_youtube(video: Path, meta: dict, cfg: dict, dry_run: bool) -> str | None:
    yt = cfg.get("youtube", {})
    if not yt.get("enabled", True):
        return None
    client_secret = SECRETS_DIR / (yt.get("client_secret_file") or "client_secret.json")
    token_file = SECRETS_DIR / (yt.get("token_file") or "youtube_token.json")
    if not client_secret.exists():
        warn("YouTube 설정 필요: Google Cloud에서 client_secret.json 을 다운로드해 "
             f"{client_secret} 에 넣으세요. (README 참고)")
        return None
    if dry_run:
        log("   [YouTube Shorts] 업로드 예정 (dry-run)")
        return "dry-run"

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
    if not username or not password:
        warn("Instagram 설정 필요: config.json 의 instagram.username / password 를 입력하세요. (README 참고)")
        return None
    if dry_run:
        log(f"   [Instagram Reels] @{username} 계정에 업로드 예정 (dry-run)")
        return "dry-run"

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
    args = ap.parse_args()
    _yt_privacy_override = args.youtube_privacy

    cfg = load_config()
    video = resolve_video(args)
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