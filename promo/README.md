# 🎬 홍보 자동 배포 (promo/)

`toeic.monster` 홍보용 쇼츠(YouTube Shorts / Instagram Reels / TikTok)를 생성하고
**Windows 원클릭 BAT 또는 터미널 메뉴로 안전하게 게시**하는 도구입니다.

```
promo/
├── promo_center.bat       # Windows 원클릭 메뉴 런처
├── setup.bat              # 최초 1회: 의존성 설치·설정 파일 생성·점검
├── publish.py             # 생성·게시·예약·점검·설정 메뉴
├── make_shorts.py         # 9:16 쇼츠 생성기
├── config.example.json    # 설정 예제
├── config.json            # 실제 설정 (자동 생성, git 제외)
├── requirements.txt       # Python 의존성
├── assets/shorts/         # 배포할 쇼츠 mp4
└── .secrets/              # OAuth·세션 파일
```

## 1. Windows 원클릭 시작

1. `promo/setup.bat`을 **한 번 실행**합니다.
   - Python 3 확인
   - `requirements.txt` 설치
   - `config.json` 생성
   - 설정·의존성 점검
   - 메모장에서 설정 파일 열기
2. `config.json`에 사용할 계정/API 정보를 입력합니다.
3. `promo/promo_center.bat`을 실행합니다.
4. 메뉴에서 `3. 쇼츠 생성 후 게시`를 선택합니다.

`promo_center.bat`은 `py -3`을 우선 사용하고, 없으면 `python`을 사용합니다. BAT에 경로를 고정하지 않아 다른 Windows PC에서도 실행하기 쉽습니다.

## 2. 터미널 메뉴

```bash
cd promo
python publish.py
# 또는 Windows에서
promo_center.bat
```

메뉴 기능:

1. **쇼츠 생성** — UNIT·단어 수·테마·스타일·TTS·배경음악 선택
2. **기존 쇼츠 게시** — 최근 수정된 mp4 목록에서 선택
3. **쇼츠 생성 후 게시** — 생성부터 dry-run/실제 게시까지 한 흐름으로 진행
4. **설정 상태 확인** — config, 플랫폼, Python 패키지, ffmpeg, OAuth 파일 점검
5. **예약 게시 등록** — 영상·플랫폼·공개 범위·예약 시각 저장
6. **예약 목록·취소** — 예약 ID로 안전하게 취소
7. **도래한 예약 실행** — 기본 dry-run, 실제 게시 전 확인
8. **게시 이력 확인** — 최근 10건 표시 및 CSV 경로 안내
9. **설정 편집** — 기본값·플랫폼·계정 설정을 터미널에서 수정
10. **폴더·파일 열기** — 쇼츠·비밀키·설정·운영 폴더를 기본 앱으로 열기
11. **Windows 작업 스케줄러 등록/해제** — 도래한 예약을 매 N분 자동 확인(dry-run)
12. **여러 영상 일괄 게시** — 영상 여러 개를 선택해 순차 게시
13. **게시 이력 HTML 리포트** — 요약 통계와 함께 브라우저로 열기
14. **게시 성과 수집·보고서** — YouTube/Instagram 조회수·좋아요 수집 및 보고서

메뉴 입력에서 Enter를 누르면 설정된 기본값을 사용합니다. 기본 게시 방식은 dry-run이며, 실제 업로드는 별도의 확인 질문을 거칩니다.

## 3. 명령줄 단축 명령

```bash
# 설정 파일 생성(기존 파일은 덮어쓰지 않음)
python publish.py --init-config

# 설정·의존성·OAuth·폴더 상태 점검
python publish.py --check

# 터미널 설정 편집
python publish.py --edit-config

# 쇼츠 폴더 열기(Windows/macOS/Linux)
python publish.py --open-shorts

# 업로드 계획만 확인
python publish.py --video assets/shorts/unit01_shorts.mp4 --unit 1 --dry-run

# 실제 업로드
python publish.py --video assets/shorts/unit01_shorts.mp4 --unit 1 --platforms yt --youtube-privacy unlisted

# 최신 N개 영상 일괄 게시 (기본 5개, --dry-run 과 함께 권장)
python publish.py --batch 3 --unit 1 --dry-run

# 게시 이력 HTML 리포트 생성 후 브라우저로 열기
python publish.py --report

# 게시 성과 수집 (config.json 의 youtube.api_key 필요)
python publish.py --stats
python publish.py --stats-report

# Windows 작업 스케줄러에 매 10분 도래 예약 확인 등록 (항상 dry-run 모드, 안전)
python publish.py --install-task
python publish.py --install-task 5   # 확인 주기를 5분으로
python publish.py --remove-task
```

## 4. 설정 파일

`config.example.json`을 기준으로 `config.json`이 생성됩니다. `promo` 블록에서 메뉴 기본값을 바꿀 수 있습니다.

- `default_unit`, `default_words`, `default_theme`, `default_style`: 생성 메뉴 기본값
- `default_tts`: TTS 기본 선택 여부
- `default_privacy`: YouTube 기본 공개 범위. 처음에는 `unlisted` 권장
- `confirm_real_upload`: 실제 게시 전 확인 질문 사용 여부. 안전을 위해 `true` 권장
- `youtube.api_key`: 성과 수집(`--stats`) 전용 Google Cloud **API 키**. 공개 데이터 조회라 OAuth 없이 사용 가능

비밀번호·토큰은 화면에 출력하지 않으며 `config.json`과 `.secrets/`는 git에 포함되지 않습니다.

## 5. 예약 게시

예약은 `promo/scheduled_posts.json`에 저장되며, 프로그램이 백그라운드에서 계속 실행되지는 않습니다.

```bash
python publish.py --run-due --dry-run
python publish.py --run-due
python publish.py --list-schedules
python publish.py --cancel-schedule 예약ID
python publish.py --history
```

Windows 작업 스케줄러에서 `promo_center.bat --run-due --dry-run` 또는 실제 운영용 `promo_center.bat --run-due`를 5~15분 간격으로 실행할 수 있습니다. 실제 게시 예약은 먼저 dry-run으로 확인하세요.

## 6. 플랫폼별 설정

### 📺 YouTube Shorts
1. Google Cloud Console에서 YouTube Data API v3를 활성화합니다.
2. OAuth 동의 화면과 테스트 사용자를 설정합니다.
3. 데스크톱 앱 OAuth JSON을 내려받아 `promo/.secrets/client_secret.json`으로 저장합니다.
4. `config.json`의 `youtube.enabled`를 켭니다.
5. 최초 실제 게시 때 브라우저 인증을 진행하면 토큰이 자동 저장됩니다.
6. (선택) 성과 수집을 위해 **API 키**를 발급받아 `youtube.api_key`에 넣습니다.

### 📸 Instagram Reels
`config.json`의 `instagram.enabled`, `username`, `password`를 설정합니다. 최초 로그인 뒤 세션은 `.secrets/ig_session.json`에 저장됩니다. instagrapi는 비공식 라이브러리이므로 계정 보호를 위해 낮은 빈도로 사용하세요.

### 🎵 TikTok
기본 비활성입니다. 공식 API 승인이 없는 상태에서의 자동 게시가 불안정할 수 있으므로, 사용 시 `enabled`와 `ms_token`을 직접 설정하세요.

## 7. 쇼츠 생성

```bash
python make_shorts.py --unit 1
python make_shorts.py --unit 3 --words 7 --tts
python make_shorts.py --unit 5 --bg sunset --style modern --seed 42
python make_shorts.py --unit 2 --index 0 --slide-sec 4 --dry-run

# 배경음악 추가 (볼륨 0.2, TTS와 함께 쓰면 음성 위에 깔림)
python make_shorts.py --unit 1 --music assets/music/calm.mp3 --music-volume 0.2
```

`9:16 / 1080×1920 / 30fps` 영상을 만들며, 한글·IPA 폰트를 자동 탐색합니다. 생성 전 `--dry-run`으로 계획을 확인할 수 있습니다.

- **무음 방지**: `--tts`/`--music`이 없어도 부드러운 앰비언트 사운드가 기본으로 들어갑니다. `--no-ambient`로 끌 수 있습니다.
- **네모(□) 방지**: 주 폰트에 없는 글리프(IPA 등)는 자동으로 폴백 폰트로 대체합니다. 이모지 아이콘이 없으면 아이콘을 생략합니다.

| 옵션 | 설명 |
|---|---|
| `--bg` | 배경 테마: blue / purple / green / orange / pink / navy / midnight / sunset / mint / wine |
| `--style` | 카드 스타일: `classic`(기본) / `modern`(글래스 카드) / `minimal`(심플) |
| `--music` | 배경음악 mp3/wav 경로 (선택) |
| `--music-volume` | 배경음악 볼륨 0~1 (기본 0.15) |
| `--no-ambient` | 기본 앰비언트 사운드 끄기 (무음 영상) |

## 7-1. 게시 성과 추적

게시 이력(`publish_history.csv`)의 성공 URL에서 성과를 수집합니다.

```bash
python publish.py --stats          # YouTube(API 키)·Instagram(로그인) 성과 수집 → performance.json
python publish.py --stats-report   # 성과를 HTML 보고서로 생성해 브라우저로 열기
```

- YouTube는 `config.json`의 `youtube.api_key`가 있으면 키만으로 조회 가능합니다(공개 데이터).
- Instagram은 계정 로그인(세션 캐시)이 필요하며, 수집 실패해도 다른 수집에는 영향이 없습니다.

## 8. 배포 전 체크리스트

- [ ] `python publish.py --check`에서 사용할 플랫폼을 확인
- [ ] YouTube는 처음에 `unlisted`로 테스트
- [ ] `--dry-run`으로 제목·설명·해시태그·플랫폼 확인
- [ ] 실제 게시 전 영상·계정·공개 범위를 재확인
- [ ] 하루 1~2개 수준으로 운영하고 각 플랫폼 정책 준수
