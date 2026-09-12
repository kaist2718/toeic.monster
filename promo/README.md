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
15. **배포 전 검증** — 영상을 재생해 직접 확인하고, 9:16·60초·게시 메타(제목/설명/해시태그)를 점검한 뒤 게시
16. **중복 게시 방지 기록 보기** — 사용한 단어·게시한 영상 기록 확인
17. **중복 게시 방지 기록 초기화** — 전체 또는 UNIT별로 기록 삭제
18. **YouTube 설정 도우미** — OAuth 안내·검증·로그인을 한 흐름으로
19. **수동 게시 도우미** — 업로드 페이지를 열고 캡션을 클립보드에 복사

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

# 배포 전 검증 — 영상 재생·Shorts 요건·게시 메타 점검 후 게시
python publish.py --verify

# 최신 N개 영상 일괄 게시 (기본 5개, --dry-run 과 함께 권장)
python publish.py --batch 3 --unit 1 --dry-run

# 게시 이력 HTML 리포트 생성 후 브라우저로 열기
python publish.py --report

# 중복 방지 — 사용한 단어·게시한 영상 기록 보기 / 초기화
python publish.py --list-posted
python publish.py --reset-posted 1     # UNIT 1 단어 기록만 초기화
python publish.py --reset-posted all   # 전체 초기화

# 같은 숏폼·단어를 의도적으로 다시 사용 (중복 방지 무시)
python publish.py --video assets/shorts/unit01_shorts.mp4 --unit 1 --allow-repeat
python make_shorts.py --unit 1 --allow-repeat

# YouTube 설정 도우미 / 로그인 / 상태 점검
python publish.py --youtube-setup     # 현재 상태 진단 → 필요한 단계만 진행 (파일 없으면 설정 안내)
python publish.py --youtube-guide     # Google Cloud 단계별 안내를 처음부터 끝까지 다시 보기
python publish.py --youtube-login     # 브라우저 승인 후 토큰 저장 (업로드와 분리)
python publish.py --youtube-relogin   # 기존 토큰 무시하고 재로그인
python publish.py --youtube-check     # OAuth 파일·토큰 유효성 확인 (만료 시 자동 갱신 시도)

# 자동 게시 대신 수동 게시 도우미 (업로드 페이지 열기 + 캡션 복사)
python publish.py --manual --video assets/shorts/unit01_shorts.mp4 --unit 1 --platforms ig,tt
python publish.py --video assets/shorts/unit01_shorts.mp4 --platforms yt --no-manual-fallback

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
- `default_voice`: TTS 목소리(edge-tts 이름). 예: 여성 `en-US-JennyNeural`, 남성 `en-US-GuyNeural`. 생성 시 번호로 바꿀 수 있음
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

게시가 막힐 때는 **자동 우선 → 실패 시 수동 폴백**을 권장합니다. 자세한 내용은 아래 [6-1. 수동 게시 폴백](#6-1-수동-게시-폴백)을 참고하세요.

### 📺 YouTube Shorts (공식 API — 가장 안정적)

가장 편한 방법은 원클릭 메뉴 **18번** 또는 `python publish.py --youtube-setup` 입니다. 이 명령은 지금 상태를 먼저 진단해서 **이미 끝난 단계는 건너뛰고 남은 단계만** 진행합니다.

```
1) OAuth 파일 : 인식됨 / 없음
2) 로그인 토큰: 유효 / 갱신 완료 / 로그인 필요
```

수동으로 하려면:

1. **프로젝트 만들기** — https://console.cloud.google.com/projectcreate
2. **API 사용 설정** — https://console.cloud.google.com/apis/library/youtube.googleapis.com 에서 `YouTube Data API v3` → 사용
3. **OAuth 동의 화면** — https://console.cloud.google.com/apis/credentials/consent
   - User Type: **외부(External)**
   - 범위에 `.../auth/youtube.upload` 추가
   - 앱 이름·지원 이메일·개발자 연락처 입력 (비어 있으면 `403 access_denied` 로 실패합니다)
   - **테스트 사용자**에 로그인할 Google 계정을 추가 — https://console.cloud.google.com/auth/audience 의 **+ ADD USERS**
     (이 단계를 빼먹으면 브라우저에 "개발자가 승인한 테스터만 액세스할 수 있습니다" 403 오류가 뜽니다)
4. **OAuth 클라이언트 ID 만들기** — https://console.cloud.google.com/apis/credentials
   - 애플리케이션 유형: **데스크톱 앱** → JSON 다운로드
5. 내려받은 JSON 파일을 `promo/.secrets/` 폴더에 **이름 그대로** 넣으면 됩니다. Google이 내려준 이름(`client_secret_1234-abc.apps.googleusercontent.com.json`)도 자동 인식하며, 꼭 `client_secret.json` 으로 바꾸지 않아도 됩니다. 여러 개면 `client_secret.json` 이 우선이고, 폴더는 메뉴 **10번 → 2번** 또는 설정 도우미로 열 수 있습니다.
6. `python publish.py --youtube-login` → 브라우저에서 승인 (이후 토큰 자동 저장)
7. 첫 테스트: `python publish.py --video assets/shorts/unit01_shorts.mp4 --platforms yt --youtube-privacy unlisted`
8. (선택) 성과 수집용 **API 키**를 https://console.cloud.google.com/apis/credentials 에서 발급해 `config.json`의 `youtube.api_key`에 넣습니다.

**자주 막히는 지점**

| 증상 | 원인 / 해결 |
|---|---|
| `OAuth 파일 없음` | 파일이 `.secrets/` 밖에 있거나 확장자가 `.json.txt` 인 경우가 많습니다. [Windows 탐색기 → 보기 → 파일 확장명]을 켜고 확인하세요. 이름은 그대로 둬도 자동 인식합니다 |
| 매주 로그아웃됨 (7일 후 401) | OAuth 동의 화면이 **테스트** 상태면 refresh 토큰이 7일마다 만료. 동의 화면 → 게시 상태 → **앱 게시(프로덕션)** 로 전환 |
| `403 access_denied` ("개발자가 승인한 테스터만…") | OAuth 동의 화면의 **테스트 사용자**에 그 계정이 없습니다. https://console.cloud.google.com/auth/audience → `+ ADD USERS` → 저장 후 1~2분 뒤 재시도. 계정이 여러 개면 등록한 계정을 골라야 합니다 |
| `403 quotaExceeded` | 기본 할당량 10,000 units/일, 업로드 1건 = 1,600 units → **하루 약 6개**. 하루 1~2개 권장 |
| `'웹 애플리케이션' 유형` 경고 | OAuth 클라이언트를 **데스크톱 앱**으로 다시 만들어 교체 |
| “확인되지 않은 앱” 경고 | **고급 → 계속(안전하지 않음)** 클릭 (본인 앱이므로 정상) |
| Shorts로 안 올라감 | 9:16 세로·60초 이내·제목/설명에 `#Shorts` (도구가 자동 포함) |

점검: `python publish.py --youtube-check`

### 📸 Instagram Reels (instagrapi — 비공식)

`config.json`의 `instagram.enabled`, `username`, `password`를 설정하면 됩니다. 로그인 세션은 `.secrets/ig_session.json`에 저장되어 다음부터 재사용됩니다.

- **2단계 인증(2FA)**: 로그인 시 인증 코드를 물어보면 터미널에 입력하면 됩니다. 자동화하려면
  - `instagram.verification_code`: 고정 코드(테스트용)
  - `instagram.totp_secret`: 앱 인증(TOTP) 비밀키 → `pip install pyotp` 필요
- **프록시**: `instagram.proxy` (예: `http://user:pass@host:port`)
- 비공식 라이브러리라 로그인 챌린지·차단이 생길 수 있습니다. **하루 1~2개, 낮은 빈도**로 운영하고, 막히면 계정을 쉬게 한 뒤 수동 폴백을 사용하세요.

### 🎵 TikTok (선택 — 불안정)

자동 업로드는 공식 API 심사가 어렵고 비공식 라이브러리도 자주 바뀝니다. 기본은 비활성이면 **수동 폴백**을 권장합니다.

수동으로 설정하려면: `config.json`의 `tiktok.enabled=true` + `ms_token` 입력 후

```bash
pip install TikTokApi playwright
playwright install chromium
```

### 6-1. 수동 게시 폴백

자동 게시가 실패하면 **업로드 페이지를 자동으로 열고 캡션·해시태그를 클립보드에 복사**합니다. 영상 파일만 선택해 붙여넣으면 되므로 API 설정 없이도 바로 게시할 수 있습니다.

- 기본값: `config.json`의 `promo.manual_fallback` (기본 `true`)
- 실행 중 끄기: `--no-manual-fallback`, 강제 켜기: `--manual-fallback`
- 처음부터 수동만: `--manual` 또는 메뉴 **19번**
- 예약 게시(`--run-due`)는 백그라운드 실행이므로 폴백을 사용하지 않습니다.
- 수동으로 마친 게시도 `posted.json`에 기록되어 같은 영상을 다시 올리지 않습니다.

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

- **영어 음성 기본**: 단어·예문을 읽어 주는 TTS(edge-tts, 무료·인터넷 필요)가 기본 켜짐입니다. `--no-tts`로 끄면 앰비언트 사운드로 대체됩니다.
- **무음 방지**: TTS·음악이 실패하거나 없어도 부드러운 앰비언트 사운드가 들어갑니다. `--no-ambient`로 끌 수 있습니다.
- **네모(□) 방지**: fontTools cmap으로 글리프 존재를 확인해, 한글 폰트에 없는 IPA 기호 등은 자동으로 IPA 커버 폰트(Arial 등)로 대체합니다.

| 옵션 | 설명 |
|---|---|
| `--bg` | 배경 테마: blue / purple / green / orange / pink / navy / midnight / sunset / mint / wine |
| `--style` | 카드 스타일: `classic`(기본) / `modern`(글래스 카드) / `minimal`(심플) |
| `--music` | 배경음악 mp3/wav 경로 (선택) |
| `--music-volume` | 배경음악 볼륨 0~1 (기본 0.15) |
| `--tts` / `--no-tts` | 영어 TTS 켜기(기본) / 끄기 |
| `--voice` | TTS 목소리 (기본 `en-US-JennyNeural`). 여성: Jenny/Aria/Sonia, 남성: Guy/Davis/Ryan 등 |
| `--no-ambient` | 기본 앰비언트 사운드 끄기 (무음 영상) |

## 7-1. 게시 성과 추적

게시 이력(`publish_history.csv`)의 성공 URL에서 성과를 수집합니다.

```bash
python publish.py --stats          # YouTube(API 키)·Instagram(로그인) 성과 수집 → performance.json
python publish.py --stats-report   # 성과를 HTML 보고서로 생성해 브라우저로 열기
```

- YouTube는 `config.json`의 `youtube.api_key`가 있으면 키만으로 조회 가능합니다(공개 데이터).
- Instagram은 계정 로그인(세션 캐시)이 필요하며, 수집 실패해도 다른 수집에는 영향이 없습니다.

## 7-2. 중복 게시 방지

게시 이력(`publish_history.csv`)과는 별개로, 사용한 단어와 게시한 영상(내용 해시)을 `promo/posted.json`에 기록해 **다음 번에 같은 숏폼·단어가 반복되지 않게** 합니다.

- **단어 중복 방지**: `make_shorts.py`가 이미 쓴 단어를 빼고 선택하고, `publish.py --unit N`의 자동 제목도 남은 단어에서 고릅니다. UNIT의 단어를 모두 쓰면 경고 후 전체 단어에서 다시 선택합니다.
- **영상 중복 방지**: 같은 내용의 mp4(해시 동일)를 **플랫폼별로** 이미 올렸으면 건너뜁니다. 예를 들어 유튜브에만 올린 영상은 Instagram에는 여전히 올릴 수 있습니다.
- **일괄·예약 게시**도 같은 규칙을 따르며, `dry-run`은 차단하지도 기록하지도 않습니다.

```bash
python publish.py --list-posted        # 사용 단어·게시 영상 기록 보기
python publish.py --reset-posted all   # 전체 초기화
python publish.py --reset-posted 3     # UNIT 3 단어 기록만 초기화
python publish.py --allow-repeat ...   # 기록을 무시하고 다시 게시
```

기록을 비우려면 원클릭 메뉴 **17번** 또는 `--reset-posted`를 사용하세요. `promo/posted.json`은 개인 운영 데이터라 git에 포함되지 않습니다.

## 8. 배포 전 체크리스트

- [ ] `python publish.py --check`에서 사용할 플랫폼을 확인
- [ ] YouTube는 처음에 `unlisted`로 테스트
- [ ] `--dry-run`으로 제목·설명·해시태그·플랫폼 확인
- [ ] 실제 게시 전 영상·계정·공개 범위를 재확인
- [ ] 하루 1~2개 수준으로 운영하고 각 플랫폼 정책 준수
