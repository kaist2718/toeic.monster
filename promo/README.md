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
├── assets/tts/            # 내려받은 로컬 TTS(Piper) 음성 모델 (.onnx)
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
3. (선택) 원클릭 메뉴 **29번**에서 낭독 TTS 엔진·목소리를 정하고, 원하면 로컬(Piper) 음성을 내려받습니다. 건너뛰면 Windows 내장 TTS 로 그대로 낭독합니다.
4. `promo/promo_center.bat`을 실행합니다.
5. 메뉴에서 `5. 쇼츠 생성 후 게시`를 선택합니다.

`promo_center.bat`은 `py -3`을 우선 사용하고, 없으면 `python`을 사용합니다. BAT에 경로를 고정하지 않아 다른 Windows PC에서도 실행하기 쉽습니다.

`promo_center.bat help` 로 자주 쓰는 명령(`check`·`verify`·`report`·`list-remaining` 등)을 볼 수 있고, **하이픈 없는 첫 단어는 자동으로 `--` 플래그가 됩니다** — `promo_center.bat check` 는 `publish.py --check` 와 같습니다. **첫 단어가 번호면 그 메뉴가 바로 실행**됩니다:

```bash
promo_center.bat            # 원클릭 메뉴 열기 (기본)
promo_center.bat 5          # 메뉴 5 한 번 실행
promo_center.bat 1-4        # 메뉴 1~4 를 순서대로 실행 (15,16 처럼 여러 개도 가능)
promo_center.bat menu-list  # 번호 순(1~29) 메뉴 목록만 보여 주기
```

## 2. 터미널 메뉴

```bash
cd promo
python publish.py
# 또는 Windows에서
promo_center.bat
```

메뉴 기능 — **번호가 위에서 아래로 1 → 29 로 그대로 이어집니다** (같은 그룹 안에서 흐름대로):

🎬 **쇼츠 만들기**

1. **쇼츠 생성** — UNIT·항목 수·테마·스타일·TTS·배경음악 선택
2. **숙어 쇼츠 생성** — 숙어 126선(`data/idioms.js`)으로 생성 (항목 수·테마·스타일·TTS 동일)
3. **빈도 어휘 쇼츠 생성** — 빈도순 기출 어휘 200선(`data/extra.js` frequency)으로 생성
4. **동의어 치환 퀴즈 생성** — 동의어 치환 200문제(`data/extra.js` paraphrase)로 문제→정답 퀴즈 생성

🚀 **만들고 바로 게시**

5. **쇼츠 생성 후 게시** — 생성부터 dry-run/실제 게시까지 한 흐름으로 진행
6. **숙어 쇼츠 생성 후 게시** — 숙어 생성을 포함해 5번과 같은 흐름으로 게시까지 진행
7. **빈도 어휘 쇼츠 생성 후 게시** — 빈도 어휘 생성을 포함해 5번과 같은 흐름으로 게시까지 진행
8. **동의어 치환 퀴즈 생성 후 게시** — 퀴즈 생성을 포함해 5번과 같은 흐름으로 게시까지 진행

📤 **게시·이력·성과**

9. **기존 쇼츠 게시** — 최근 수정된 mp4 목록에서 선택 (영상 옆 메타가 있으면 UNIT을 묻지 않고 제목·설명을 자동 생성)
10. **여러 영상 일괄 게시** — 영상 여러 개를 선택해 순차 게시
11. **배포 전 검증** — 영상을 재생해 직접 확인하고, 9:16·60초·게시 메타(제목/설명/해시태그)를 점검한 뒤 게시
12. **수동 게시 도우미** — 업로드 페이지를 열고 캡션을 클립보드에 복사
13. **중복 게시 방지 기록 보기** — 사용한 단어·게시한 영상 기록 확인
14. **중복 게시 방지 기록 초기화** — 전체 또는 UNIT·숙어·빈도·퀴즈별로 기록 삭제
15. **게시 이력 확인** — 최근 10건 표시 및 CSV 경로 안내
16. **게시 이력 HTML 리포트** — 요약 통계와 함께 브라우저로 열기
17. **게시 성과 수집·보고서·인사이트** — YouTube/Instagram 조회수·좋아요 수집, HTML 보고서, 종류별 성과·게시 시간대·추천 콘텐츠 인사이트

🗓 **예약·자동 준비**

18. **예약 게시 등록** — 영상·플랫폼·공개 범위·예약 시각 저장
19. **예약 목록·취소** — 예약 ID로 안전하게 취소
20. **도래한 예약 실행** — 기본 dry-run, 실제 게시 전 확인
21. **콘텐츠 자동 준비** — N일치 쇼츠를 자동 생성하고 예약 게시까지 등록 (종류는 남은 콘텐츠 많은 순으로 자동 배합)

⚙️ **설정·점검·도구**

22. **설정 상태 확인** — config, 플랫폼, Python 패키지, ffmpeg, OAuth 파일 점검
23. **설정 편집** — 기본값·플랫폼·계정 설정을 터미널에서 수정
24. **폴더·파일 열기** — 쇼츠·비밀키·설정·운영 폴더를 기본 앱으로 열기
25. **Windows 작업 스케줄러 등록/해제** — 도래한 예약을 매 N분 자동 확인(dry-run)
26. **YouTube 설정 도우미** — OAuth 안내·검증·로그인을 한 흐름으로
27. **남은 콘텐츠 수량 보기** — 종류별 사용/전체/남음과 합계를 표로 확인
28. **게시된 영상 YouTube 설명 갱신** — 이미 업로드한 영상의 제목·설명을 새 형식(모든 단어·퀴즈 정답 위치 포함)으로 다시 만들어 교체. 먼저 미리보기를 보여 주고 확인 후 적용하며, 태그·카테고리·공개 설정은 그대로 둡니다
29. **TTS 엔진·목소리 설정** — 로컬 TTS(Piper) / Windows 내장 엔진 선택, 첫·두 번째 목소리 지정, Piper 음성 내려받기(`list` 로 영어 목록 · `preview` 로 미리 듣기), 테스트 음성 재생까지 한 자리에서 설정하고 `config.json` 에 저장합니다

생성·게시가 끝나면 **남은 콘텐츠 수량**(종류별 사용/전체/남음)을 자동으로 표시합니다(`make_shorts.py`·`publish.py` 공통).

메뉴 입력에서 Enter를 누르면 **방금 실행한 메뉴**(실행 전에는 설정의 기본 메뉴)가 다시 실행됩니다. 기본 게시 방식은 dry-run이며, 실제 업로드는 별도의 확인 질문을 거칩니다.

메뉴는 🎬 쇼츠 만들기 · 🚀 만들고 바로 게시 · 📤 게시·이력·성과 · 🗓 예약·자동 준비 · ⚙ 설정·점검·도구 **다섯 그룹**으로 묶여 표시되고, 번호는 표시되는 순서(1 → 29)와 같습니다. 입력은 여러 형태로 쓸 수 있습니다.

- `10` — 번호로 실행 (Enter 는 마지막 실행한 메뉴 반복)
- `예약` · `tts` · `숙어 생성` — **키워드 검색**. 여러 항목이 맞으면 목록을 보여 주고 번호를 고릅니다
- `15,16` — **쉼표로 여러 메뉴**를 넣어 한 번에 순차 실행 (실행 전에 목록과 함께 한 번 확인)
- `1-4` · `1~4` — **번호 범위**로 묶어 한 번에 실행 (한 번에 최대 10개)
- `r` — 마지막에 실행한 **메뉴와 순서까지 그대로 반복**
- `?` — 사용법(예시 포함), `q`/`0` — 종료. 틀린 번호는 **가장 가까운 메뉴**, 틀린 단어는 **비슷한 메뉴를 자동 제안**합니다
- 메뉴 위에는 현재 기본값(UNIT·항목 수·테마·TTS 목소리)과 Enter 기본 메뉴가 한 줄로 표시됩니다

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

# 업로드 계획만 확인 (제목·설명은 영상 옆 메타로 자동)
python publish.py --video assets/shorts/unit01_shorts.mp4 --unit 1 --dry-run

# 숙어 영상 게시 — 제목·설명을 data/idioms.js 기준으로 생성
python publish.py --video assets/shorts/idioms_come-across_shorts.mp4 --idioms --dry-run

# 빈도 어휘 영상 게시 — 제목·설명을 data/extra.js frequency 기준으로 생성
python publish.py --video assets/shorts/frequency_available_shorts.mp4 --frequency --dry-run

# 동의어 치환 퀴즈 영상 게시 — 제목·설명을 data/extra.js paraphrase 기준으로 생성
python publish.py --video assets/shorts/quiz_expedite_shorts.mp4 --paraphrase --dry-run

python publish.py --video assets/shorts/idioms_come-across_shorts.mp4 --idioms --platforms yt --youtube-privacy unlisted

# 남은 콘텐츠 수량 보기(생성·게시는 끝날 때 자동 표시)
python publish.py --list-remaining

# 내려받은 Piper 음성의 성별(여성/남성) 분류 표 — 메뉴 29 와 미리 듣기 필터(f/m)와 같은 결과
python publish.py --voice-gender

# N일치 쇼츠 자동 생성 + 예약 게시 등록 (종류는 남은 콘텐츠 많은 순으로 자동 배합)
python publish.py --auto-plan 5 --plan-start "2026-10-01 19:00" --plan-days 1
python publish.py --auto-plan 3 --plan-kind idioms   # 지정 종류로 생성만 (예약 없음)

# 성과 인사이트 — 종류별 평균 조회수·좋은 게시 시간대·추천 콘텐츠
python publish.py --stats-insights

# 게시된 영상 YouTube 설명 갱신 — 새 형식(모든 단어·퀴즈 정답 위치)으로 미리보기만
python publish.py --refresh-desc

# 실제로 적용 — 기본은 미리보기라 --apply 가 있어야 YouTube를 수정합니다
python publish.py --refresh-desc --apply            # 제목·설명 모두 갱신
python publish.py --refresh-desc --apply --keep-title   # 설명만 갱신, 제목 유지

# 한 영상만 갱신
python publish.py --refresh-desc --video assets/shorts/quiz_follow-up-on_shorts.mp4

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
- `default_menu`: 메뉴에서 Enter 를 눌렀을 때 바로 실행할 기본 메뉴 번호(1~29, 기본 `9` = 기존 쇼츠 게시). 원클릭 메뉴 **23번(설정 편집)** 에서 바꿀 수 있음
- `default_tts`: TTS 기본 선택 여부
- `tts_engine`: 낭독 TTS 엔진 — `auto`(기본, 내려받은 로컬 Piper 음성이 있으면 Piper 없으면 Windows) / `piper` / `windows`. 터미널 메뉴 **29번**에서 바꿀 수 있음
- `default_voice`: 첫 번째 TTS 목소리(여성 역할). 엔진이 `piper`면 `en_US-amy-medium` 같은 로컬 음성 이름, `windows`면 `Microsoft Hazel Desktop` 같은 Windows 내장 음성 이름. 생성 시 번호로 바꿀 수 있음
- `default_voice2`: 두 번째 TTS 목소리(남성). 예: `en_US-ryan-medium`(로컬) 또는 `Microsoft David Desktop`(Windows 내장). **빈 문자열이면 한 목소리만** 사용
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

가장 편한 방법은 원클릭 메뉴 **26번** 또는 `python publish.py --youtube-setup` 입니다. 이 명령은 지금 상태를 먼저 진단해서 **이미 끝난 단계는 건너뛰고 남은 단계만** 진행합니다.

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
     (이 단계를 빼먹으면 브라우저에 "개발자가 승인한 테스터만 액세스할 수 있습니다" 403 오류가 뜹니다)
4. **OAuth 클라이언트 ID 만들기** — https://console.cloud.google.com/apis/credentials
   - 애플리케이션 유형: **데스크톱 앱** → JSON 다운로드
5. 내려받은 JSON 파일을 `promo/.secrets/` 폴더에 **이름 그대로** 넣으면 됩니다. Google이 내려준 이름(`client_secret_1234-abc.apps.googleusercontent.com.json`)도 자동 인식하며, 꼭 `client_secret.json` 으로 바꾸지 않아도 됩니다. 여러 개면 `client_secret.json` 이 우선이고, 폴더는 메뉴 **24번 → 2번** 또는 설정 도우미로 열 수 있습니다.
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
- 처음부터 수동만: `--manual` 또는 메뉴 **12번**
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

# 목소리: 기본은 여성 + 남성 두 목소리(설치된 Windows 음성 또는 내려받은 로컬 Piper 음성)
python make_shorts.py --unit 1 --single-voice            # 여성 하나만
python make_shorts.py --unit 1 --voice2 "Microsoft David Desktop"  # 두 번째 목소리를 지정
python make_shorts.py --unit 1 --engine piper --voice en_US-amy-medium --voice2 en_US-ryan-medium  # 로컬 TTS 강제

# 숙어 126선(data/idioms.js) — 유닛 대신 --idioms
python make_shorts.py --idioms --words 5
python make_shorts.py --idioms --index 0 --bg mint --style modern

# 빈도순 기출 어휘 200선(data/extra.js frequency) — 유닛 대신 --frequency
python make_shorts.py --frequency --words 5
python make_shorts.py --frequency --index 0 --bg navy --style modern

# 동의어 치환 퀴즈(data/extra.js paraphrase) — 유닛 대신 --paraphrase (한 문제 = 문제·정답 2장)
python make_shorts.py --paraphrase --words 3
python make_shorts.py --paraphrase --index 0 --bg wine --style modern
```

`9:16 / 1080×1920 / 30fps` 영상을 만들며, **기본 폰트는 네이버 마루부리(Maru Buri)** 입니다 — `promo/fonts/MaruBuri-Regular.otf` · `MaruBuri-Bold.otf` 를 쓰고, 파일이 없으면 배포처에서 한 번 내려받은 뒤 씁니다(내려받지 못하면 맑은 고딕 등 시스템 한글 폰트로 내려가며 경고를 남깁니다). 마루부리에 없는 IPA 기호는 기존 폴백 폰트(Arial 등)로 그려 □가 생기지 않습니다. `--font` 로 다른 폰트를 지정할 수 있고, 생성 전 `--dry-run`으로 계획을 확인할 수 있습니다.

생성이 끝나면 영상 옆에 같은 이름의 메타 파일(`unit01_shorts.json`)을 남깁니다. **게시 제목·설명은 이 파일을 읽어 만들어집니다** — 영상에 실제로 들어간 항목이라 제목이 내용과 어긋나지 않습니다. 메타가 없는 영상(예전 산출물)은 기존처럼 `--unit` / `--idioms` 로 남은 목록에서 하나를 골라 씁니다(`promo/assets/` 는 git 에 올라가지 않습니다).

- **제목**: `첫 단어 외 단어 N개 | TOEIC 필수 어휘 UNIT … | toeic.monster` — 숙어·빈도·퀴즈와 같은 형식(항목 1개면 `첫 단어 | …`)
- **설명**: 영상에 들어간 **모든 단어**를 발음(IPA)·뜻·예문·해석과 함께 번호 목록으로 적습니다(숙어·빈도·퀴즈 설명과 동일한 형식). 검색 노출과 영상 다시 보기에 모두 쓰입니다.
- **Instagram 캡션**은 2,200자 제한에 맞추되 해시태그는 남기고 설명 본문을 줄입니다.
- **퀴즈 정답 위치 랜덤**: 퀴즈(`--paraphrase`)는 문제마다 보기 순서를 랜덤으로 섞어 정답이 항상 `A` 에 오지 않습니다(`--seed` 를 지정하면 같은 시드에서 같은 순서). 메타 파일이 이 순서를 그대로 저장하므로 영상·제목·설명이 일치하고, 설명의 `정답: B. …` 표기도 영상의 정답 위치와 같습니다.

- **숙어 카드**: `--idioms` 를 주면 `data/idioms.js`(126선)에서 고릅니다. 숙어는 IPA·예문 발음이 없어 슬라이드에 **표현·뜻·예문·해석**만 들어가고, 상단 칩은 `TOEIC 빈출 숙어` + **목록 순번**입니다. 파일명은 첫 표현을 따 `idioms_take-advantage-of_shorts.mp4` 처럼 나와 배치끼리 덮어쓰지 않습니다(`--out` 으로 지정 가능).
- **동의어 치환 퀴즈**: `--paraphrase` 를 주면 `data/extra.js` 의 paraphrase(200문제)에서 고릅니다. 한 문제가 **문제 슬라이드(문장 + 보기 A~D) → 정답 슬라이드(정답·해설·예문 해석)** 두 장이라, 3문제면 6장·약 36초입니다(`--words` 가 슬라이드 수를 두 배로 늘립니다). 문제 슬라이드는 영어 문장을, 정답 슬라이드는 정답 표현을 읽습니다. 파일명은 `quiz_expedite_shorts.mp4` 처럼 첫 표적 표현을 따릅니다.
- **로컬 낭독 기본**: 낭독은 **로컬 TTS** 로만 만듭니다 — 인터넷·API 가 필요 없습니다. `--engine auto`(기본)는 내려받은 **Piper**(ONNX) 음성이 있으면 그 목소리로, 없으면 **Windows 내장 SAPI** 로 만듭니다. `--engine piper` / `--engine windows` 로 강제할 수 있고, `--no-tts` 로 끄면 앰비언트 사운드로 대체됩니다. `--voice`/`--voice2` 에는 그 엔진의 음성 이름을 씁니다 — Piper 는 `en_US-amy-medium` 같은 이름, Windows 는 `Microsoft Zira Desktop` 같은 이름(예전 `en-US-JennyNeural` 처럼 언어·성별로 된 이름도 설치된 음성 중에서 고릅니다).
- **두 목소리 기본**: 기본 설정은 첫 번째 **여성** 음성 후 두 번째 **남성** 음성이 같은 문장을 이어서 읽습니다(Windows 내장 엔진은 영국 여성 + 미국 남성 우선, Piper 를 내려받았다면 `config.json` 에 지정된 남녀 음성). Windows에 요청한 로캘 음성이 없으면 설치된 영어 음성 중 성별을 우선해 대체하며, 생성 로그에 실제 선택된 엔진·음성을 표시합니다. 예를 들어 영국 여성 음성이 없으면 미국 영어 여성(Zira)이, 미국 남성 음성이 없으면 설치된 다른 영어 남성(David)이 선택됩니다. 슬라이드 길이는 음성 길이에 맞춰 자동 연장됩니다 — 길게 느껴지면 `--words`를 줄이거나 `--single-voice`로 한 목소리만 쓰세요.
- **목소리 선택**: 메뉴·기본 설정의 목소리 선택지는 **선택한 엔진의 음성**을 보여 줍니다. 엔진이 `auto`면 내려받은 로컬(Piper) 음성이 있으면 그 목록을, 없으면 **이 PC에 설치된 Windows 내장 음성**을 보여 주고(영어 음성이 앞에 오고, 설치 목록을 못 구하면 기본 후보를 보여 줍니다). `default_voice`와 `default_voice2`에는 해당 엔진의 음성 이름을 넣으면 되고, Windows 쪽은 예전 언어·성별 이름(`en-US-JennyNeural` 등)을 그대로 두어도 설치된 음성 중에서 대체해 고릅니다. Windows Narrator의 자연스러운 Jenny/Ryan 음성은 SAPI에 자동 노출되지 않으므로 SAPI 에서는 바로 쓸 수 있다고 보장되지 않습니다.
- **TTS 설정 메뉴(29번)**: 원클릭 메뉴 **29. TTS 엔진·목소리 설정** 에서 엔진(auto/piper/windows)·첫·두 번째 목소리·Piper 음성 내려받기·테스트 재생을 한 자리에서 정합니다. 현재 엔진이 실제로 어떤 목소리로 낭독하는지도 함께 보여 주고, 내려받은 음성의 **성별 분류(여성/남성) 요약**도 같은 화면에 표시합니다. 저장하면 `config.json` 의 `promo.tts_engine`·`default_voice`·`default_voice2` 에 반영되고, 생성 메뉴(1~8)와 자동 준비(21번)가 그대로 씁니다.
- **미리 듣기(청취 비교)**: 메뉴 29 는 흐름 마지막에 「내려받은 다른 음성으로 미리 듣기」를, 음성 내려받기 메뉴는 내려받기 전 `preview` 입력(또는 내려받은 뒤 자동 질문)으로 **내려받은 모든 Piper 음성 목록**을 번호로 보여 주고, 고른 음성으로 샘플 문장을 즉시 합성·재생합니다. 샘플 문장은 원하는 영어 문장으로 바꿀 수 있습니다(Enter 기본 예문). 이름을 정확히 몰라도 앞글자로 입력하면 유일하게 맞는 음성이 재생되고, 여러 개면 후보를 알려 줍니다. 목록에서 `f`(여성만) · `m`(남성만) · `all`(전체) 로 **성별 필터**를 걸면 분류된 음성만 좁혀서 청취할 수 있습니다.
- **성별 구분(여성/남성)**: 내려받은 38개 영어 음성을 남/녀로 구분해 목소리 라벨(`미국 영어 · 여성 · medium · 60MB`)과 선택지에 함께 표시합니다. 판정은 **① 이름·기본 설정 힌트 → ② Piper 공식 MODEL_CARD → ③ 샘플 합성 후 F0(기본 주파수) 측정** 순서로 하고, 결과는 `assets/tts/voice_gender.json` 에 저장해 다음엔 즉시 표시합니다. `python publish.py --voice-gender` 로 전체 표를 보고 새로 측정할 수 있습니다. 경계 주파수(153Hz 부근)의 `en_US-kristin` 처럼 F0 만으로 헷갈리는 음성은 공식 MODEL_CARD 가 바로잡아 줍니다.
- **단어와 문장 사이 휴지**: 낭독은 단어와 예문을 **각각 따로 합성한 뒤** 기본 0.4초 무음을 끼워 이어 붙입니다. 설치된 piper-tts 는 문장 사이 무음 기능이 없어 한 문자열로 합성하면 실측 **0초(오히려 -0.15초)** 로 붙어 읽었습니다. `--word-gap 0.6` 처럼 길이를 바꾸거나 `--word-gap 0` 으로 옛 동작으로 되돌릴 수 있고, 여성·남성 두 목소리 사이 0.4초(VOICE_GAP)는 그대로입니다.
- **마지막 선택 저장**: 생성 메뉴(1~8)에서 기본값과 다르게 TTS 사용 여부·목소리를 고르면, 생성 전에 「선택한 TTS 설정을 다음부터 기본값으로 저장할까요?」(기본 예)를 물어봅니다. 저장하면 `config.json` 의 `default_tts`·`default_voice`·`default_voice2` 가 갱신되어 다음부터 그대로 씁니다. 그때그때 다르게 쓰려면 `n` 을 누르고, 값이 그대로면 묻지도 않습니다.
- **로컬 TTS(Piper) 설치·음성 내려받기**: `piper-tts` 는 `requirements.txt` 에 포함되어 `setup.bat` 실행으로 설치됩니다. 음성 모델은 `promo/assets/tts/` 에 내려받아야 합니다 — 메뉴 **29번**의 내려받기(`list` 입력 시 영어 음성 전체 목록) 또는
  ```bash
  python -m piper.download_voices en_US-amy-medium --download-dir promo/assets/tts
  ```
  한 음성당 약 20~65MB 이며, 내려받는 순간 인터넷 없이 씁니다. 내려받지 않았거나 패키지가 없으면 엔진이 Windows 내장 SAPI 로 내려가므로 기존과 똑같이 동작합니다.
  영어 음성 38개(미국 27 + 영국 11, low/medium/high)는 모두 `promo/assets/tts/` 에 내려받아 두었습니다 — 약 2.5GB 이며 목록은 `list`, 확인은 **미리 듣기**로 하면 됩니다. 다른 언어 음성까지 내려받으려면 목록에서 이름을 골라 같은 명령을 실행하세요.
- **Windows 영어 음성 설치** (엔진을 `windows` 로 쓸 때): Windows 11의 `설정 → 시간 및 언어 → 언어 및 지역 → 언어 추가`에서 `English (United States)` 또는 `English (United Kingdom)`을 추가하고, 각 언어의 **언어 옵션**에서 음성/Text-to-speech 기능을 설치할 수 있습니다. 언어 팩은 표시 언어를 바꾸지 않고 추가할 수 있습니다. 음성 엔진의 설치 상태에 따라 SAPI에 나타나기까지 재부팅이나 로그아웃이 필요할 수 있습니다.
- **무음 방지**: TTS·음악이 실패하거나 없어도 부드러운 앰비언트 사운드가 들어갑니다. `--no-ambient`로 끌 수 있습니다.
- **네모(□) 방지**: fontTools cmap으로 글리프 존재를 확인해, 한글 폰트(기본 마루부리)에 없는 IPA 기호 등은 자동으로 IPA 커버 폰트(Arial 등)로 대체합니다. 발음기호 알약(pill)의 폭·가운데 정렬도 폴백 글리프까지 계산해 그리므로 글자가 한쪽으로 쏠리지 않습니다.
- **인트로·아웃로 기본 포함**: 첫 장에 「TOEIC 필수 어휘」 같은 브랜드 훅(기본 2.5초), 마지막 장에 사이트 유입 CTA 카드(기본 3초)가 자동으로 들어갑니다. `--no-intro`/`--no-outro` 로 끄거나 `--intro-sec`/`--outro-sec` 으로 길이를 바꿀 수 있습니다. 예상 길이가 Shorts 60초를 넘을 것 같으면 생성기가 미리 경고합니다.

| 옵션 | 설명 |
|---|---|
| `--idioms` | 유닛 단어 대신 숙어 126선으로 만들기 (`--unit` 생략 가능) |
| `--frequency` | 유닛 단어 대신 빈도순 기출 어휘 200선으로 만들기 (`--unit` 생략 가능) |
| `--paraphrase` | 유닛 단어 대신 동의어 치환 퀴즈 200문제로 만들기 (`--unit` 생략 가능, 문제·정답 2장) |
| `--bg` | 배경 테마: blue / purple / green / orange / pink / navy / midnight / sunset / mint / wine |
| `--style` | 카드 스타일: `classic`(기본) / `modern`(글래스 카드) / `minimal`(심플) |
| `--font` | 한글 폰트 ttf/ttc/otf 경로 (기본: 네이버 마루부리 — `promo/fonts/MaruBuri-*.otf`) |
| `--music` | 배경음악 mp3/wav 경로 (선택) |
| `--music-volume` | 배경음악 볼륨 0~1 (기본 0.15) |
| `--tts` / `--no-tts` | 영어 TTS 켜기(기본) / 끄기 |
| `--words` | 영상에 넣을 항목 수 — 단어/숙어/빈도 (기본 5). 퀴즈는 문제 수이고 슬라이드는 2배 |
| `--word-gap` | 단어와 예문 사이 무음 초 (기본 0.4, 0 이면 붙여 읽기) |
| `--out` | 출력 mp4 경로 (기본: `assets/shorts/unitNN_shorts.mp4` · 숙어 `idioms_<표현>_shorts.mp4` · 빈도 `frequency_<표제어>_shorts.mp4` · 퀴즈 `quiz_<표현>_shorts.mp4`) |
| `--voice` | 첫 번째 TTS 목소리 (기본: 엔진 자동 선택 — 내려받은 Piper 음성 또는 Windows 내장 영국 여성) |
| `--voice2` | 두 번째 TTS 목소리 (기본: 엔진 자동 선택 — 내려받은 Piper 음성 또는 Windows 내장 미국 남성). `none`이면 한 목소리만 |
| `--engine` | 낭독 TTS 엔진: `auto`(기본, 로컬 우선) / `piper`(로컬 Piper · 오프라인) / `windows`(내장 SAPI) |
| `--single-voice` | 한 목소리만 쓰기 (기본은 여성 + 남성 두 목소리) |
| `--no-ambient` | 기본 앰비언트 사운드 끄기 (무음 영상) |
| `--no-intro` / `--intro-sec` | 인트로 슬라이드 끄기 / 길이 초 (기본 2.5) |
| `--no-outro` / `--outro-sec` | 아웃로(CTA) 슬라이드 끄기 / 길이 초 (기본 3.0) |

## 7-1. 게시 성과 추적

게시 이력(`publish_history.csv`)의 성공 URL에서 성과를 수집합니다.

```bash
python publish.py --stats          # YouTube(API 키)·Instagram(로그인) 성과 수집 → performance.json
python publish.py --stats-report   # 성과를 HTML 보고서로 생성해 브라우저로 열기
python publish.py --stats-insights # 종류별 성과·좋은 게시 시간대·추천 콘텐츠만 터미널로 확인
```

- **인사이트**: 제목으로 콘텐츠 종류(단어/숙어/빈도/퀴즈)를 구분해 종류별 평균 조회수·좋아요를 계산하고, 조회수가 높았던 게시 시간대와 다음에 만들 콘텐츠를 추천합니다. HTML 보고서에도 같은 섹션이 들어가며, 원클릭 메뉴 **17번 → i** 로도 볼 수 있습니다.

- YouTube는 `config.json`의 `youtube.api_key`가 있으면 키만으로 조회 가능합니다(공개 데이터).
- Instagram은 계정 로그인(세션 캐시)이 필요하며, 수집 실패해도 다른 수집에는 영향이 없습니다.

## 7-2. 중복 게시 방지

게시 이력(`publish_history.csv`)과는 별개로, 사용한 단어와 게시한 영상(내용 해시)을 `promo/posted.json`에 기록해 **다음 번에 같은 숏폼·단어가 반복되지 않게** 합니다.

- **단어 중복 방지**: `make_shorts.py`가 이미 쓴 단어를 빼고 선택하고, 영상 메타가 없는 예전 영상은 `publish.py --unit N`의 자동 제목도 남은 단어에서 고릅니다. UNIT의 단어를 모두 쓰면 경고 후 전체 단어에서 다시 선택합니다.
- **숙어도 별도 기록**: 숙어는 유닛 번호가 없어 `posted.json` 의 `words["idioms"]` 에, 빈도 어휘는 `words["frequency"]` 에, 동의어 치환 퀴즈는 `words["paraphrase"]` 에 쌓입니다(단어 기록과 섞이지 않습니다).
- **남은 콘텐츠 표시**: 생성·게시가 끝날 때마다 종류별 사용/전체/남음과 합계를 표시합니다. `--dry-run` 으로 끝나도 같은 표를 보여 주므로, 다음에 무엇을 만들지 바로 정할 수 있습니다. 수량을 보고만 싶으면 `python publish.py --list-remaining` 을 쓰세요.
- **영상 중복 방지**: 같은 내용의 mp4(해시 동일)를 **플랫폼별로** 이미 올렸으면 건너뜁니다. 예를 들어 유튜브에만 올린 영상은 Instagram에는 여전히 올릴 수 있습니다.
- **일괄·예약 게시**도 같은 규칙을 따르며, `dry-run`은 차단하지도 기록하지도 않습니다.

```bash
python publish.py --list-posted        # 사용 단어·게시 영상 기록 보기
python publish.py --reset-posted all   # 전체 초기화
python publish.py --reset-posted 3     # UNIT 3 단어 기록만 초기화
python publish.py --reset-posted idioms  # 숙어 기록만 초기화
python publish.py --reset-posted frequency  # 빈도 어휘 기록만 초기화
python publish.py --reset-posted paraphrase  # 동의어 치환 퀴즈 기록만 초기화
python publish.py --list-remaining     # 종류별 남은 콘텐츠 수량만 보기
python publish.py --allow-repeat ...   # 기록을 무시하고 다시 게시
```

기록을 비우려면 원클릭 메뉴 **14번** 또는 `--reset-posted`를 사용하세요. `promo/posted.json`은 개인 운영 데이터라 git에 포함되지 않습니다.

## 7-3. 콘텐츠 자동 준비 (하루치·N일치)

원클릭 메뉴 **21번** 또는 `--auto-plan`으로 여러 날치 쇼츠를 한 번에 만들고 예약 게시까지 등록합니다. 종류를 고르지 않으면 **남은 콘텐츠가 많은 종류부터 돌려가며** 단어·숙어·빈도·퀴즈를 섞어 만듭니다. 테마·스타일·목소리·항목 수는 설정(메뉴 `23`)의 기본값을 따릅니다.

```bash
# 5일치를 매일 19시에 올라가도록 생성 + 예약 등록
python publish.py --auto-plan 5 --plan-start "2026-10-01 19:00" --plan-days 1

# 숙어 3편만 생성 (예약 없음)
python publish.py --auto-plan 3 --plan-kind idioms
```

생성이 끝나면 각 영상의 예약 ID·시각이 표시되고, 예약 시각에 `--run-due`(또는 메뉴 `20`·Windows 작업 스케줄러)를 실행하면 게시됩니다.

## 7-4. 사이트 유입 추적 (UTM·CTA)

게시 설명의 사이트 링크에는 자동으로 UTM 태그가 붙습니다.

```
https://toeic.monster/?utm_source=shorts&utm_medium=social&utm_campaign=unit
```

- `utm_campaign`은 콘텐츠 종류(`unit`/`idioms`/`frequency`/`paraphrase`)라, 사이트 분석 도구에서 **종류별 유입 효과**를 바로 비교할 수 있습니다.
- 영상 **인트로·아웃로**에도 사이트 CTA가 들어가고, 설명·해시태그에 **종류별 태그**(`#TOEIC숙어`·`#TOEIC퀴즈` 등)가 자동 추가되어 검색·추천 노출을 넓힙니다.

## 8. 배포 전 체크리스트

- [ ] `python publish.py --check`에서 사용할 플랫폼을 확인
- [ ] YouTube는 처음에 `unlisted`로 테스트
- [ ] `--dry-run`으로 제목·설명·해시태그·플랫폼 확인
- [ ] 실제 게시 전 영상·계정·공개 범위를 재확인
- [ ] 하루 1~2개 수준으로 운영하고 각 플랫폼 정책 준수
