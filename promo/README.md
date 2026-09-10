# 🎬 홍보 자동 배포 (promo/)

`toeic.monster` 홍보용 쇼츠(YouTube Shorts / Instagram Reels / TikTok)를
**원클릭으로 동시 배포**하는 Python 프로그램입니다.

```
promo/
├── publish.py            # 원클릭 배포 스크립트
├── config.example.json   # 설정 예제 (복사해서 config.json 생성)
├── config.json           # 실제 설정 (git에 올리지 마세요!)
├── requirements.txt      # Python 의존성
├── assets/shorts/        # 배포할 쇼츠 mp4 보관 폴더
└── .secrets/             # API 키/토큰 보관 폴더 (git에 올리지 마세요!)
```

## 1. 빠른 시작

```bash
# 의존성 설치
pip install -r requirements.txt

# 설정 준비
cp config.example.json config.json   # 내용을 본인 계정 정보로 수정

# ① 미리보기 (업로드 없이 계획만 확인)
python publish.py --video assets/shorts/unit01.mp4 --unit 1 --dry-run

# ② 실제 업로드 (YouTube + Instagram 동시)
python publish.py --video assets/shorts/unit01.mp4 --unit 1
```

## 2. 명령어 옵션

| 옵션 | 설명 |
|---|---|
| `--video 경로` | 업로드할 mp4 (기본: `assets/shorts/`의 가장 최근 파일) |
| `--unit N` | 단어 데이터에서 자동으로 제목·설명 생성 (1~30) |
| `--title`, `--desc` | 제목/설명 직접 지정 |
| `--platforms yt,ig,tt` | 업로드 플랫폼 선택 (기본: config에서 활성화된 것) |
| `--youtube-privacy public/unlisted/private` | YouTube 공개 범위 |
| `--dry-run` | 실제 업로드 없이 계획만 출력 |

예시:

```bash
# UNIT 1 단어로 자동 제목 생성 + YouTube만 비공개로 업로드
python publish.py --video assets/shorts/unit01.mp4 --unit 1 --platforms yt --youtube-privacy unlisted

# 제목/설명 직접 입력
python publish.py --video assets/shorts/unit01.mp4 --title "TOEIC 단어 1초 암기" --desc "오늘의 단어!"
```

## 3. 플랫폼별 설정

### 📺 YouTube Shorts (공식 API — 가장 안정적)
1. [Google Cloud Console](https://console.cloud.google.com/) → 새 프로젝트 생성
2. **YouTube Data API v3** 활성화
3. **OAuth 동의 화면** → External + 본인 이메일을 테스트 사용자로 등록
4. **사용자 인증 정보** → OAuth 클라이언트 ID → 데스크톱 앱 → JSON 다운로드
5. 다운로드한 파일을 `promo/.secrets/client_secret.json` 으로 저장
6. 최초 실행 시 브라우저에서 로그인 승인 → 토큰이 `.secrets/youtube_token.json`에 자동 저장

> 제한: 무료 할당량 기준 하루 약 6개 업로드. 하루 1~2개를 권장합니다.

### 📸 Instagram Reels (instagrapi — 비공식)
1. `config.json`의 `instagram.username` / `password` 입력
2. 최초 실행 시 로그인 후 세션이 `.secrets/ig_session.json`에 자동 저장 (재로그인 불필요)

> 주의: 비공식 라이브러리라 로그인 차단 위험이 있습니다. 2단계 인증 계정은
> 미리 앱 비밀번호(앱 전용 패스워드)를 만들어 사용하세요.

### 🎵 TikTok (선택 — 비공식, 불안정)
- 공식 Content Posting API는 승인 절차가 까다로워 기본 **비활성**입니다.
- `config.json`의 `tiktok.enabled: true` + `ms_token` 입력 후 시도해 볼 수 있으나
  실패해도 다른 플랫폼 배포에는 영향이 없습니다.

## 4. 자동 제목/설명 생성 (--unit)

`data/unitNN.js`의 단어 중 하나를 무작위로 골라 다음 형식으로 만듭니다:

```
제목: company | TOEIC 필수 어휘 UNIT 1 비즈니스와 회사 | toeic.monster
설명: TOEIC 필수 어휘 「company」 [/ˈkʌmpəni/] 회사
      예문: The company has offices in over thirty countries.
      해석: 그 회사는 30개국 이상에 지사를 두고 있다.

      발음·예문으로 외우는 TOEIC 보카 1,000 → https://toeic.monster/
      #toeic #토익 #토익단어 ... #Shorts
```

## 5. .gitignore 권장

민감 정보가 실수로 커밋되지 않도록 `.gitignore`에 추가하세요:

```
promo/config.json
promo/.secrets/
```

## 6. 배포 전 체크리스트
- [ ] 쇼츠 영상은 **9:16 세로**, 60초 이내, 해상도 1080×1920 권장
- [ ] 영상 마지막에 로고/사이트 주소 노출 → 트래픽 유입 효과
- [ ] `--dry-run`으로 제목·설명·플랫폼 확인 후 실제 업로드