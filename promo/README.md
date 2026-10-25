# 🎬 홍보 자동 배포 (promo/)

`toeic.monster` 홍보용 쇼츠(YouTube Shorts / Instagram Reels / TikTok)를 생성하고
**Windows 원클릭 BAT 또는 터미널 메뉴로 안전하게 게시**하는 도구입니다.

> **지원 환경**: 원클릭 BAT(`promo_center.bat`)·Windows 작업 스케줄러 등록(메뉴 27)·Windows 내장 TTS는
> **Windows 전용**입니다. macOS/Linux 에서는 터미널 메뉴(`python publish.py`)와 Piper TTS를 씁니다.
>
> **예약 게시는 두 방식**입니다. YouTube 자체 예약 게시(`--publish-at`)는 지금 업로드하고
> YouTube 가 지정 시각에 공개하므로 **PC 가 꺼져 있어도** 정시에 올라갑니다. 로컬 예약(`--schedule`)은
> 그 시각에 `--run-due`(cron·작업 스케줄러)가 실행되어야 업로드됩니다 → [5. 예약 게시](#5-예약-게시-두-가지-방식).
> YouTube 예약 게시는 **단일·일괄(`--batch`)·자동 준비(`--auto-plan`)·원클릭 메뉴(5~13·20·23)** 등
> YouTube 로 게시하는 모든 경로에서 선택할 수 있습니다.

```
promo/
├── promo_center.bat       # Windows 원클릭 메뉴 런처
├── setup.bat              # 최초 1회: 의존성 설치·설정 파일 생성·점검
├── publish.py             # 생성·게시·예약·점검·설정 메뉴
├── test_publish.py        # 회귀 테스트 (예약 시각·YouTube 요청 본문·메뉴/문서 일치)
├── make_shorts.py         # 9:16 쇼츠 생성기
├── config.example.json    # 설정 예제
├── config.json            # 실제 설정 (자동 생성, git 제외)
├── scheduled_posts.json   # 로컬 예약 큐 (자동 생성, git 제외)
├── native_schedules.json  # YouTube 예약 게시 장부 (자동 생성, git 제외)
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
3. (선택) 원클릭 메뉴 **31번**에서 낭독 TTS 엔진·목소리를 정하고, 원하면 로컬(Piper) 음성을 내려받습니다. 건너뛰면 Windows 내장 TTS 로 그대로 낭독합니다.
4. `promo/promo_center.bat`을 실행합니다.
5. 메뉴에서 `5. 쇼츠 생성 후 게시`를 선택합니다.

`promo_center.bat`은 `py -3`을 우선 사용하고, 없으면 `python`을 사용합니다. BAT에 경로를 고정하지 않아 다른 Windows PC에서도 실행하기 쉽고, Python 3.8 이상이 아니면 설치 안내를 보여 줍니다. **처음 설치는 `promo_center.bat setup` 한 번이면 끝납니다**(의존성 설치 + 설정 생성 + 점검).

`promo_center.bat help` 로 자주 쓰는 명령(`check`·`verify`·`report`·`list-remaining` 등)을 볼 수 있고, **하이픈 없는 첫 단어는 자동으로 `--` 플래그가 됩니다** — `promo_center.bat check` 는 `publish.py --check` 와 같습니다. 값 없는 플래그 뒤에서도 같은 규칙이 이어져 `promo_center.bat --no-pause menu-list` 처럼 써도 됩니다. **첫 단어가 번호면 그 메뉴가 바로 실행**됩니다:

```bash
promo_center.bat            # 원클릭 메뉴 열기 (기본)
promo_center.bat setup      # 처음 설치 - 의존성 설치 + 설정 점검
promo_center.bat 5          # 메뉴 5 한 번 실행
promo_center.bat 1-4        # 메뉴 1~4 를 순서대로 실행 (17,18 처럼 여러 개도 가능)
promo_center.bat menu-list  # 번호 순(1~31) 메뉴 목록만 보여 주기
promo_center.bat --no-pause check   # "아무 키나 누르세요" 없이 점검만 하고 종료
```

- **자동 실행(스크립트·작업 스케줄러)용**: `--run-due` 또는 `--no-pause` 를 주거나 환경변수 `PROMO_NO_PAUSE=1` 을 두면 마지막 `pause` 가 생략되어 창이 입력 대기로 멈추지 않습니다. 메뉴 27번이 등록하는 작업 스케줄러는 이 옵션을 포함해 등록됩니다.
- **배치·파이프 입력**에서 메뉴 입력이 끝나면(EOF) 같은 메뉴를 무한 반복하지 않고 종료합니다.

## 2. 터미널 메뉴

```bash
cd promo
python publish.py
# 또는 Windows에서
promo_center.bat
```

메뉴 기능 — **번호가 위에서 아래로 1 → 31 로 그대로 이어집니다** (같은 그룹 안에서 흐름대로):

🎬 **쇼츠 만들기**

1. **쇼츠 생성** — UNIT·항목 수·테마·패턴·스타일·TTS·배경음악을 **번호로 선택**
2. **숙어 쇼츠 생성** — 숙어 126선(`data/idioms.js`)으로 생성 (항목 수·테마·패턴·스타일·TTS 동일)
3. **빈도 어휘 쇼츠 생성** — 빈도순 기출 어휘 200선(`data/extra.js` frequency)으로 생성
4. **동의어 치환 퀴즈 생성** — 동의어 치환 200문제(`data/extra.js` paraphrase)로 문제→정답 퀴즈 생성

🚀 **만들고 바로 게시**

5. **쇼츠 생성 후 게시** — 생성부터 dry-run/실제 게시까지 한 흐름으로 진행
6. **숙어 쇼츠 생성 후 게시** — 숙어 생성을 포함해 5번과 같은 흐름으로 게시까지 진행
7. **빈도 어휘 쇼츠 생성 후 게시** — 빈도 어휘 생성을 포함해 5번과 같은 흐름으로 게시까지 진행
8. **동의어 치환 퀴즈 생성 후 게시** — 퀴즈 생성을 포함해 5번과 같은 흐름으로 게시까지 진행

🆕 **새 포맷 만들기** (혼동 어휘·문법·듣기 등 11종)

9. **새 포맷 쇼츠 생성** — 아래 표의 11종 중에서 종류를 선택해 생성 (종류별 **남은 수량·사용 막대**를 함께 표시합니다. Enter 추천은 **회전**으로 바뀝니다 — 최근에 만든 종류는 뒤로 미루고, 아직 안 만든 종류에서 남은 콘텐츠가 많은 쪽을 추천합니다. 예전에는 데이터가 가장 많은 문법 빈칸이 매번 추천돼 문법만 만들어졌습니다)
10. **새 포맷 쇼츠 생성 후 게시** — 같은 흐름으로 게시까지 진행

종류 선택을 건너뛰고 바로 생성하려면 `--kind` 를 씁니다:

```bash
python make_shorts.py --kind grammar --words 5   # 문법 빈칸으로 바로 생성 (종류 선택 없이)
python make_shorts.py --kind sprint --words 7    # 30일 스프린트로 바로 생성
```

| 종류(`--kind`) | 내용 | 데이터 | 구성 |
| --- | --- | --- | --- |
| `confusables` | 혼동 어휘 퀴즈 — affect/effect처럼 헷갈리는 단어 빈칸 채우기 | `data/app-data.js` CONFUSABLES | 문제→정답 2장 |
| `grammar` | 문법 빈칸 3초 퀴즈 + 문법 팁 뒤집기 | `data/grammar-*.js` 연습 문제 + GRAMMAR_TIPS | 문제→정답 2장 |
| `numbers` | 숫자 듣기 — 가격·날짜·전화번호를 귀로 구분 | `data/extra.js` numbers | 문제→정답 2장(청취) |
| `traps` | Part 2 함정 응답 — yes/no로 답하면 틀리는 이유 | `data/extra.js` traps | 문제→정답 2장 |
| `minimal` | 최소대립쌍 발음 비교 — ship/sheep 소리 차이 | `data/app-data.js` MINIMAL_PAIRS | 문제→정답 2장 |
| `dictation` | 받아쓰기 챌린지 — 듣고 문장을 그대로 쓰기 | `data/extra.js` dictation | 문제→정답 2장(청취) |
| `bizmail` | 비즈니스 이메일 한 줄 — 상황별 정중한 표현 | `data/app-data.js` BIZ_TEMPLATES | 문제→정답 2장 |
| `drill` | 전치사·연결어 드릴 | `data/extra.js` transitions + prepositions | 문제→정답 2장 |
| `strategy` | 전략 리스트형 — 공략을 한 장짜리 카드로 | `data/extra.js` guides | 카드 1장 |
| `wordparts` | 어원 스토리 카드 — bene(좋은) + fit → benefit | `data/app-data.js` MNEMONICS + WORD_PARTS | 문제→정답 2장 |
| `sprint` | 30일 스프린트 DAY 시리즈 — 연재형으로 재방문 유도 | `data/extra.js` sprint | 카드 1장 |

모든 종류는 **사이트가 이미 쓰는 데이터를 그대로** 읽습니다(콘텐츠 복제 없음 — 사이트를 고치면 쇼츠도 따라갑니다).
중복 방지는 종류별 버킷(`posted.json`)으로 자동 관리되고, 제목·설명·해시태그는 영상 옆 메타에서 자동 생성됩니다.

📤 **게시·이력·성과**

11. **기존 쇼츠 게시** — 최근 수정된 mp4 목록에서 선택 (영상 옆 메타가 있으면 UNIT을 묻지 않고 제목·설명을 자동 생성)
12. **여러 영상 일괄 게시** — 영상 여러 개를 선택해 순차 게시 (영상 옆 메타가 있으면 제목·설명 자동 — 메타 없는 영상이 있을 때만 UNIT을 묻습니다). 게시 시점에서 **YouTube 예약 게시**를 고르면 지금 업로드하고 첫 시각부터 지정 간격(일)으로 공개합니다 (PC 불필요).
13. **배포 전 검증** — 영상을 재생해 직접 확인하고, 9:16·60초·게시 메타(제목/설명/해시태그)를 점검한 뒤 게시. 게시 시점에서 **YouTube 예약 게시**를 고를 수 있습니다.
14. **수동 게시 도우미** — 업로드 페이지를 열고 캡션을 클립보드에 복사
15. **중복 게시 방지 기록 보기** — 사용한 단어·게시한 영상 기록 확인
16. **중복 게시 방지 기록 초기화** — 전체 또는 UNIT·숙어·빈도·퀴즈·새 포맷 종류별로 기록 삭제
17. **게시 이력 확인** — 최근 10건 표시 및 CSV 경로 안내
18. **게시 이력 HTML 리포트** — 요약 통계와 함께 브라우저로 열기
19. **게시 성과 수집·보고서·인사이트** — YouTube/Instagram 조회수·좋아요 수집, HTML 보고서, 종류별 성과·게시 시간대·추천 콘텐츠 인사이트

🗓 **예약·자동 준비**

20. **예약 게시 등록** — 방식을 고릅니다: **YouTube 예약 게시**(지금 업로드, 그 시각 공개 — PC 가 꺼져 있어도 공개) 또는 **로컬 예약**(그 시각에 이 PC 가 업로드, 플랫폼·공개 범위 선택)
21. **예약 현황·점검** — 로컬 예약과 YouTube 예약 게시를 한 화면에 보고, 로컬 예약 취소·YouTube 공개 여부 점검
22. **도래한 예약 실행** — 기본 dry-run, 실제 게시 전 확인
23. **콘텐츠 자동 준비** — N일치 쇼츠를 자동 생성하고 예약 게시까지 등록 (종류는 남은 콘텐츠 많은 순으로 자동 배합). 예약 방식은 **YouTube 예약 게시**(YouTube 만 대상이면 기본 — PC 불필요) 또는 **로컬 예약**(yt·ig·tt) 중에서 고릅니다.

⚙️ **설정·점검·도구**

24. **설정 상태 확인** — config, 플랫폼, Python 패키지, ffmpeg, OAuth 파일 점검 + 콘텐츠 데이터 무결성(종류별 데이터 읽힘·보기·정답·남은 수량) 점검
25. **설정 편집** — 기본값·플랫폼·계정 설정을 터미널에서 수정
26. **폴더·파일 열기** — 쇼츠·비밀키·설정·운영 폴더를 기본 앱으로 열기
27. **Windows 작업 스케줄러 등록/해제** — 도래한 예약을 매 N분 자동 확인 (등록할 때 dry-run 여부를 고르며, 기본은 안전한 dry-run)
28. **YouTube 설정 도우미** — OAuth 안내·검증·로그인을 한 흐름으로
29. **남은 콘텐츠 수량 보기** — 종류별 사용/전체/남음과 합계를 표로 확인
30. **게시된 영상 YouTube 설명 갱신** — 이미 업로드한 영상의 제목·설명을 새 형식(모든 단어·퀴즈 정답 위치 포함)으로 다시 만들어 교체. 먼저 미리보기를 보여 주고 확인 후 적용하며, 태그·카테고리·공개 설정은 그대로 둡니다
31. **TTS 엔진·목소리 설정** — 로컬 TTS(Piper) / Windows 내장 엔진 선택, 첫·두 번째 목소리 지정, Piper 음성 내려받기(`list` 로 영어 목록 · `preview` 로 미리 듣기), 테스트 음성 재생까지 한 자리에서 설정하고 `config.json` 에 저장합니다

> **메뉴 번호 변경 안내 (2026-10)**: 표시 순서와 번호를 일치시키기 위해 재정렬했습니다 — 새 포맷 2종이 `30·31` 에서 `9·10` 이 되고, 그 뒤의 메뉴는 각각 2 씩 밀렸습니다(구 `9~29` → 새 `11~31`). 예를 들어 기존 쇼츠 게시는 구 `9` → 새 `11`, TTS 설정은 구 `29` → 새 `31` 입니다. 오래된 메모·스크립트의 번호와 `config.json` 의 `default_menu`(기본 `11` = 기존 쇼츠 게시)를 이 규칙에 맞게 확인하세요. 재정렬 전에 만든 `config.json` 은 처음 메뉴를 열 때 **자동으로** `default_menu` 를 새 번호로 바꾸고 한 번 안내합니다.

생성·게시가 끝나면 **남은 콘텐츠 수량**(종류별 사용/전체/남음 + 사용량 막대)을 자동으로 표시합니다(`make_shorts.py`·`publish.py` 공통). 메뉴를 열 때는 상단에 **YouTube 업로드 가능 시간**(오늘 쿼터 사용/잔량, 초기화까지 남은 시간, 채널 24시간 제한 해제 추정 시각)이 함께 표시됩니다.

메뉴 입력에서 Enter를 누르면 **방금 실행한 메뉴**(실행 전에는 설정의 기본 메뉴)가 다시 실행됩니다. 기본 게시 방식은 dry-run이며, 실제 업로드는 별도의 확인 질문을 거칩니다.

메뉴 선택은 이렇게 편리해졌습니다.

- **여러 단어 검색**: `숙어 생성` 처럼 띄어 쓰면 단어를 모두 포함한 메뉴만 관련도 순(제목 → 별칭 → 설명)으로 보여 주고, 여러 개면 설명과 함께 번호로 선택합니다. 제목·별칭·**설명**까지 검색합니다.
- **즐겨찾기**: `f` 또는 `f 11` 을 입력해 자주 쓰는 메뉴를 즐겨찾기에 추가/제거하면, 메뉴 상단에 ⭐ 로 표시됩니다(config.json `promo.favorite_menus` 에 저장).
- **최근 사용**: 실행한 메뉴가 최근 5개까지 메뉴 상단에 🕘 로 남아 바로 다시 고를 수 있습니다.
- **메뉴 설명**: `?` 도움말과 `promo_center.bat menu-list` 에서 31개 메뉴 각각이 무엇을 하는지 설명과 함께 확인할 수 있습니다.
- **게시 대상 상태**: 메뉴 상단에 YouTube/Instagram/TikTok 켜짐·꺼짐과 실제 게시 확인 여부가 표시됩니다.

메뉴는 🎬 쇼츠 만들기 · 🚀 만들고 바로 게시 · 🆕 새 포맷 만들기 · 📤 게시·이력·성과 · 🗓 예약·자동 준비 · ⚙ 설정·점검·도구 **여섯 그룹**으로 묶여 표시되고, 번호는 표시되는 순서(1 → 31)와 같습니다. 입력은 여러 형태로 쓸 수 있습니다.

- `10` — 번호로 실행 (Enter 는 마지막 실행한 메뉴 반복)
- `예약` · `tts` · `숙어 생성` — **키워드 검색**. 여러 항목이 맞으면 목록을 보여 주고 번호를 고릅니다
- `17,18` — **쉼표로 여러 메뉴**를 넣어 한 번에 순차 실행 (실행 전에 목록과 함께 한 번 확인)
- `1-4` · `1~4` — **번호 범위**로 묶어 한 번에 실행 (한 번에 최대 10개)
- `r` — 마지막에 실행한 **메뉴와 순서까지 그대로 반복**
- `?` — 사용법(예시 포함), `q`/`0` — 종료. 틀린 번호는 **가장 가까운 메뉴**, 틀린 단어는 **비슷한 메뉴를 자동 제안**합니다
- 새 포맷 종류 선택(메뉴 9·10) 등 번호 선택 화면에서는 **이름·한글 키워드**로도 찾을 수 있습니다 (예: `문법` · `혼동` · `sprint`)
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

# 새 포맷 영상 게시 — 제목·설명을 해당 종류 데이터 기준으로 생성 (종류 표는 「2. 터미널 메뉴」 절)
python publish.py --video assets/shorts/minimal_hat-hot_shorts.mp4 --kind minimal --dry-run

python publish.py --video assets/shorts/idioms_come-across_shorts.mp4 --idioms --platforms yt --youtube-privacy unlisted

# 남은 콘텐츠 수량 보기(생성·게시는 끝날 때 자동 표시)
python publish.py --list-remaining

# YouTube 업로드 가능 시간 — API 쿼터 잔량·초기화까지 남은 시간·채널 24시간 제한 (메뉴를 열면 상단에 자동 표시)
python publish.py --quota

# 내려받은 Piper 음성의 성별(여성/남성) 분류 표 — 메뉴 31 와 미리 듣기 필터(f/m)와 같은 결과
python publish.py --voice-gender

# N일치 쇼츠 자동 생성 + YouTube 예약 게시 (YouTube 만 대상이면 기본 native — PC 불필요)
python publish.py --auto-plan 5 --plan-start "2026-10-01 19:00" --plan-days 1
python publish.py --auto-plan 5 --plan-start "2026-10-01 19:00" --plan-mode native --plan-days 1
python publish.py --auto-plan 5 --plan-start "2026-10-01 19:00" --plan-mode local   # 로컬 예약 (yt·ig·tt)
python publish.py --auto-plan 3 --plan-kind idioms   # 지정 종류로 생성만 (예약 없음)

# YouTube 예약 게시 — 지금 업로드하고 지정 시각에 공개 (PC 가 꺼져 있어도 공개)
python publish.py --video assets/shorts/unit01_shorts.mp4 --platforms yt --publish-at "2026-10-26 19:00" --dry-run

# 최신 3개 영상을 1일 간격으로 YouTube 예약 게시 (지금 업로드, 첫 시각부터 차례로 공개)
python publish.py --batch 3 --platforms yt --publish-at "2026-10-26 19:00" --plan-days 1 --dry-run

# 예약 현황 — 로컬 예약 + YouTube 예약 게시를 한 번에
python publish.py --schedules

# YouTube 예약 게시가 실제로 공개됐는지 확인 (장부·게시 이력에 반영 — 읽기 권한 필요)
python publish.py --verify-schedules

# 읽기·삭제 권한으로 따로 로그인 (업로드 토큰은 그대로) / 예약 취소 = 영상 삭제
python publish.py --youtube-login-full
python publish.py --cancel-native 예약ID

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
- `default_menu`: 메뉴에서 Enter 를 눌렀을 때 바로 실행할 기본 메뉴 번호(1~31, 기본 `11` = 기존 쇼츠 게시). 원클릭 메뉴 **25번(설정 편집)** 에서 바꿀 수 있음
- `default_tts`: TTS 기본 선택 여부
- `tts_engine`: 낭독 TTS 엔진 — `auto`(기본, 내려받은 로컬 Piper 음성이 있으면 Piper 없으면 Windows) / `piper` / `windows`. 터미널 메뉴 **31번**에서 바꿀 수 있음
- `default_voice`: 첫 번째 TTS 목소리(여성 역할). 엔진이 `piper`면 `en_US-amy-medium` 같은 로컬 음성 이름, `windows`면 `Microsoft Hazel Desktop` 같은 Windows 내장 음성 이름. 생성 시 번호로 바꿀 수 있음
- `default_voice2`: 두 번째 TTS 목소리(남성). 예: `en_US-ryan-medium`(로컬) 또는 `Microsoft David Desktop`(Windows 내장). **빈 문자열이면 한 목소리만** 사용
- `default_privacy`: YouTube 기본 공개 범위. 처음에는 `unlisted` 권장
- `confirm_real_upload`: 실제 게시 전 확인 질문 사용 여부. 안전을 위해 `true` 권장
- `youtube.api_key`: 성과 수집(`--stats`) 전용 Google Cloud **API 키**. 공개 데이터 조회라 OAuth 없이 사용 가능

비밀번호·토큰은 화면에 출력하지 않으며 `config.json`과 `.secrets/`는 git에 포함되지 않습니다.

## 5. 예약 게시 (두 가지 방식)

| | **YouTube 예약 게시** (권장) | **로컬 예약** |
| --- | --- | --- |
| 명령 | `--publish-at "YYYY-MM-DD HH:MM"` · `--batch`/`--auto-plan --plan-mode native` · 메뉴 5~13·20→2·23 | `--schedule --schedule-time "…"` · 메뉴 20→1·23 |
| 업로드 | **지금** (쿼터 사용) | 예약 시각 이후 `--run-due` 가 실행될 때 |
| 공개 | YouTube 가 지정 시각에 **자동 공개** | 업로드 즉시 (public/unlisted/private) |
| PC 필요 | ❌ 없음 (YouTube 서버가 처리) | ✅ 그 시각 이후 `--run-due` 필요 |
| 플랫폼 | YouTube 전용 | yt · ig · tt |

### 5-1. YouTube 예약 게시 — 지금 업로드, 그 시각 공개

```bash
# ① 미리보기로 제목·설명·시각 확인
python publish.py --video assets/shorts/unit01_shorts.mp4 --platforms yt \
  --publish-at "2026-10-26 19:00" --dry-run

# ② 실제 — 지금 비공개로 업로드되고, 지정 시각에 공개됩니다
python publish.py --video assets/shorts/unit01_shorts.mp4 --platforms yt \
  --publish-at "2026-10-26 19:00"
```

- YouTube Data API 의 `publishAt` 을 씁니다 — 업로드는 **지금 비공개**, 지정 시각에 **공개**로 전환됩니다
  (YouTube 규칙상 공개 범위를 따로 고를 수 없습니다).
- 시각은 **로컬 기준** `YYYY-MM-DD HH:MM` 이고, API 에는 오프셋이 붙은 ISO
  (`2026-10-26T19:00:00+09:00`)로 전송합니다. **지금부터 10분 이후**여야 하며, 지난 시각은 거부합니다.
- 업로드 쿼터(1건 1,600 units)는 **지금** 사용합니다 — `python publish.py --quota` 로 잔량을 확인하세요.
- 등록 뒤에는 YouTube Studio → 콘텐츠 → **예약됨** 에서 시각 변경·취소·즉시 공개가 가능합니다.
  (이 방식은 YouTube 쪽 예약이라 `--list-schedules` 목록에는 나오지 않습니다. 대신 업로드에 성공하면
  `native_schedules.json` 장부에 기록되어 `--schedules`·`--verify-schedules` 로 관리합니다.)
- 메뉴 **20번 → 2) YouTube 예약 게시** 도 같은 흐름(미리보기 → 확인 → 업로드)입니다.
- `--youtube-privacy` 는 쓰이지 않고(항상 비공개 → 공개), `--platforms` 는 `yt` 만 지정할 수 있습니다.
- 예약 게시가 실패해도 **자동 수동 폴백(브라우저)은 열지 않습니다** — 그대로 다시 시도할 수 있습니다.
  (직접 열려면 `--manual-fallback` 을 명시하세요.)
- **여러 영상도 한 번에 예약**할 수 있습니다.
  - `--batch N --publish-at "..." --plan-days 1` — 최신 N개를 지금 업로드하고 첫 시각부터 간격(일)으로 공개
  - `--auto-plan N --plan-start "..." --plan-mode native --plan-days 1` — N일치를 생성해 같은 방식으로 예약
  - 원클릭 메뉴 **12·13·23번**과 게시 메뉴(5~11번)에서도 게시 시점으로 **YouTube 예약 게시**를 고를 수 있습니다
    (YouTube 만 예약하며, 함께 고른 Instagram·TikTok 은 선택에서 빠집니다).

### 5-2. 로컬 예약 — 그 시각에 이 PC 가 업로드

예약은 `promo/scheduled_posts.json`에 저장되며, 프로그램이 백그라운드에서 계속 실행되지는 않습니다.

```bash
python publish.py --schedule --schedule-time "2026-10-26 19:00" \
  --video assets/shorts/unit01_shorts.mp4 --platforms yt --youtube-privacy unlisted

python publish.py --run-due --dry-run   # 도래한 예약 미리보기
python publish.py --run-due             # 실제 업로드
python publish.py --list-schedules
python publish.py --cancel-schedule 예약ID
python publish.py --history
```

Windows 작업 스케줄러에서 `promo_center.bat --run-due --dry-run` 또는 실제 운영용 `promo_center.bat --run-due`를 5~15분 간격으로 실행할 수 있습니다. 실제 게시 예약은 먼저 dry-run으로 확인하세요. `--run-due` 는 자동으로 `pause` 를 건너뛰어 창이 멈추지 않고, **메뉴 27번**으로 등록하면 `--no-pause` 가 포함된 상태로 자동 등록됩니다.

> `python publish.py --install-task` 는 **안전을 위해 항상 dry-run** 으로 등록합니다. 실제 게시까지 자동화하려면 **메뉴 27번**에서 "dry-run 모드로 등록"에 **아니오**를 고르세요.

### 5-3. 예약 현황과 공개 여부 점검

두 방식의 예약을 따로 찾아다니지 않도록, 한 명령으로 모아 보여 줍니다.

```bash
python publish.py --schedules          # 로컬 예약 + YouTube 예약 게시 현황
python publish.py --verify-schedules   # YouTube 예약 게시가 실제로 공개됐는지 확인
```

`--schedules` 는 다음을 한 화면에 보여 줍니다.

- **로컬 예약** — 예약 시각, 남은 시간(또는 `⏰ 도래 — --run-due 필요`), 영상·플랫폼
- **YouTube 예약 게시** — 공개 시각, 남은 시간(또는 `확인 필요`), 영상 링크·제목
- 최근 확인 결과(공개됨·찾을 수 없음)와 건수 요약, 다음에 실행할 명령

`--verify-schedules` 는 YouTube API 로 실제 상태를 조회해 장부를 갱신합니다.

| YouTube 상태 | 장부 기록 |
| --- | --- |
| `public` / `unlisted` | `published` — 공개 확인 (게시 이력에도 남김) |
| `private` + 예약 시각 전 | `scheduled` 유지 — 비공개로 대기 |
| `private` + 예약 시각 15분 초과 | `scheduled` 유지 + 경고 — YouTube 처리 지연 가능, 다음에 재확인 |
| `videos.list` 에 없음 | `missing` — 삭제·비공개 전환 등, YouTube Studio 에서 확인 |

- 조회는 **저장된 OAuth 토큰만** 사용합니다(브라우저 로그인 창을 열지 않음). 로그인이 없으면
  `python publish.py --youtube-login` 안내만 하고 장부는 그대로 둡니다.
- 네트워크·권한 오류로 조회가 실패하면 **장부를 바꾸지 않습니다**(잘못 `missing` 으로 지우지 않음).
- 원클릭 메뉴 **21번**에서도 1) 현황 2) 로컬 예약 취소 3) YouTube 공개 여부 점검 4) YouTube 예약 취소를
  고를 수 있고, 현황에서 공개 시각이 지난 항목이 있으면 이어서 바로 점검할지 물어봅니다.
- 예약 시각 변경·즉시 공개는 YouTube Studio → 콘텐츠 → **예약됨** 에서 합니다(장부는 다음 점검 때 따라갑니다).

**권한 안내 — 업로드 토큰으로는 확인·취소가 안 됩니다**

| 기능 | 필요한 권한 | 준비 |
| --- | --- | --- |
| 업로드·예약 게시(`--publish-at`) | `youtube.upload` | 기존 `--youtube-login` 그대로 |
| 공개 여부 확인(`--verify-schedules`) | 조회(`youtube.force-ssl` 또는 API 키) | `--youtube-login-full` 권장 |
| 예약 취소·영상 삭제(`--cancel-native`) | 삭제(`youtube.force-ssl`) | `--youtube-login-full` 필요 |

```bash
python publish.py --youtube-login-full          # 읽기·삭제 권한으로 따로 로그인 (브라우저 1회)
python publish.py --verify-schedules            # 이제 실제 공개 상태를 확인
python publish.py --cancel-native 예약ID        # 예약된 YouTube 영상 삭제 + 장부 정리
```

- `--youtube-login-full` 은 **별도 토큰**(`.secrets/youtube_token_full.json`)을 씁니다.
  기존 업로드 토큰(`youtube_token.json`)은 그대로라 **이미 되던 업로드·예약이 막히지 않습니다**.
- Google Cloud 의 OAuth 동의 화면 **범위**에 `.../auth/youtube.force-ssl` 이 없으면 추가해야 합니다.
- 읽기 권한 없이 `config.json` 의 `youtube.api_key` 만 있으면 **공개된 영상만** 확인할 수 있습니다.
  이때 예약 대기(비공개) 영상은 목록에 안 나오므로 **`missing` 으로 단정하지 않고** 그대로 둡니다.
- `--cancel-native` 는 **YouTube 영상을 실제로 삭제**합니다(되돌릴 수 없음). 메뉴 21 → 4 는 실행 전에 한 번 더 묻습니다.

## 6. 플랫폼별 설정

게시가 막힐 때는 **자동 우선 → 실패 시 수동 폴백**을 권장합니다. 자세한 내용은 아래 [6-1. 수동 게시 폴백](#6-1-수동-게시-폴백)을 참고하세요.

### 📺 YouTube Shorts (공식 API — 가장 안정적)

가장 편한 방법은 원클릭 메뉴 **28번** 또는 `python publish.py --youtube-setup` 입니다. 이 명령은 지금 상태를 먼저 진단해서 **이미 끝난 단계는 건너뛰고 남은 단계만** 진행합니다.

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
5. 내려받은 JSON 파일을 `promo/.secrets/` 폴더에 **이름 그대로** 넣으면 됩니다. Google이 내려준 이름(`client_secret_1234-abc.apps.googleusercontent.com.json`)도 자동 인식하며, 꼭 `client_secret.json` 으로 바꾸지 않아도 됩니다. 여러 개면 `client_secret.json` 이 우선이고, 폴더는 메뉴 **26번 → 2번** 또는 설정 도우미로 열 수 있습니다.
6. `python publish.py --youtube-login` → 브라우저에서 승인 (이후 토큰 자동 저장)
7. 첫 테스트: `python publish.py --video assets/shorts/unit01_shorts.mp4 --platforms yt --youtube-privacy unlisted`
8. (선택) 성과 수집용 **API 키**를 https://console.cloud.google.com/apis/credentials 에서 발급해 `config.json`의 `youtube.api_key`에 넣습니다.

**자주 막히는 지점**

| 증상 | 원인 / 해결 |
|---|---|
| `OAuth 파일 없음` | 파일이 `.secrets/` 밖에 있거나 확장자가 `.json.txt` 인 경우가 많습니다. [Windows 탐색기 → 보기 → 파일 확장명]을 켜고 확인하세요. 이름은 그대로 둬도 자동 인식합니다 |
| 매주 로그아웃됨 (7일 후 401) | OAuth 동의 화면이 **테스트** 상태면 refresh 토큰이 7일마다 만료. 동의 화면 → 게시 상태 → **앱 게시(프로덕션)** 로 전환 |
| `403 access_denied` ("개발자가 승인한 테스터만…") | OAuth 동의 화면의 **테스트 사용자**에 그 계정이 없습니다. https://console.cloud.google.com/auth/audience → `+ ADD USERS` → 저장 후 1~2분 뒤 재시도. 계정이 여러 개면 등록한 계정을 골라야 합니다 |
| `403 quotaExceeded` | 기본 할당량 10,000 units/일, 업로드 1건 = 1,600 units → **하루 약 6개**. `promo_center.bat quota`(또는 메뉴 상단)로 잔량·초기화까지 남은 시간 확인. 하루 1~2개 권장 |
| `400 uploadLimitExceeded` ("The user has exceeded the number of videos they may upload.") | API 쿼터가 아니라 **채널 자체의 24시간 업로드 제한**입니다(새 채널·미인증 채널일수록 낮음, 여러 개를 연달아 올리면 잘 걸림). 약 하루가 지나면 풀리므로 나중에 다시 게시하세요. 급하면 수동 게시 폴백으로 브라우저에서 직접 올리면 됩니다 |
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
- ⚠️ **약관·계정 위험**: 비공식 라이브러리(`instagrapi`)의 자동 로그인·업로드는 Instagram 약관 위반
  소지가 있어 **계정 정지·제재**를 당할 수 있습니다(공식 API 아님). 감수할 수 있는 계정으로만 쓰고,
  로그인 챌린지·차단이 생기면 **하루 1~2개, 낮은 빈도**로 운영하며 계정을 쉬게 한 뒤 수동 폴백을 사용하세요.
- ⚠️ **비밀번호 보관**: `password`·`totp_secret`은 `config.json`(git 제외)에 **평문**으로 저장됩니다.
  이 계정 전용 비밀번호를 쓰고(다른 사이트와 재사용 금지), 공용 PC 에는 저장하지 마세요.

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
- 처음부터 수동만: `--manual` 또는 메뉴 **14번**
- 예약 게시(`--run-due`)는 백그라운드 실행이므로 폴백을 사용하지 않습니다.
- 수동으로 마친 게시도 `posted.json`에 기록되어 같은 영상을 다시 올리지 않습니다.

## 7. 쇼츠 생성

```bash
python make_shorts.py --unit 1
python make_shorts.py --unit 3 --words 7 --tts
python make_shorts.py --unit 5 --bg sunset --style modern --seed 42
python make_shorts.py --unit 2 --index 0 --slide-sec 4 --dry-run

# 배경 테마·패턴 — 이름 대신 번호로도 선택 가능 (--list-bg 로 번호 목록 확인)
python make_shorts.py --list-bg                    # 테마 22종 · 패턴 15종 · 스타일 번호 목록
python make_shorts.py --unit 1 --bg 21 --pattern 11   # 21=neon 테마 + 11=bokeh 패턴
python make_shorts.py --unit 1 --pattern confetti     # 패턴만 바꾸기 (테마는 기본 blue)

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

# 새 포맷 11종 — --kind 로 종류 지정 (종류 표는 「2. 터미널 메뉴」 절)
python make_shorts.py --kind confusables --words 4     # 혼동 어휘 빈칸 퀴즈
python make_shorts.py --kind numbers --words 3          # 숫자 듣기 (청취형 — 음성이 핵심)
python make_shorts.py --kind strategy --words 5 --bg mint   # 전략 카드 1장짜리
python make_shorts.py --kind sprint --words 7           # 30일 스프린트 DAY 연재
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
- **TTS 설정 메뉴(31번)**: 원클릭 메뉴 **31. TTS 엔진·목소리 설정** 에서 엔진(auto/piper/windows)·첫·두 번째 목소리·Piper 음성 내려받기·테스트 재생을 한 자리에서 정합니다. 현재 엔진이 실제로 어떤 목소리로 낭독하는지도 함께 보여 주고, 내려받은 음성의 **성별 분류(여성/남성) 요약**도 같은 화면에 표시합니다. 저장하면 `config.json` 의 `promo.tts_engine`·`default_voice`·`default_voice2` 에 반영되고, 생성 메뉴(1~8)와 자동 준비(23번)가 그대로 씁니다.
- **미리 듣기(청취 비교)**: 메뉴 31 는 흐름 마지막에 「내려받은 다른 음성으로 미리 듣기」를, 음성 내려받기 메뉴는 내려받기 전 `preview` 입력(또는 내려받은 뒤 자동 질문)으로 **내려받은 모든 Piper 음성 목록**을 번호로 보여 주고, 고른 음성으로 샘플 문장을 즉시 합성·재생합니다. 샘플 문장은 원하는 영어 문장으로 바꿀 수 있습니다(Enter 기본 예문). 이름을 정확히 몰라도 앞글자로 입력하면 유일하게 맞는 음성이 재생되고, 여러 개면 후보를 알려 줍니다. 목록에서 `f`(여성만) · `m`(남성만) · `all`(전체) 로 **성별 필터**를 걸면 분류된 음성만 좁혀서 청취할 수 있습니다.
- **TTS 샘플 일괄 생성(순서 비교)**: 목소리가 많아 구분하기 어려울 때 `python make_tts_samples.py` 를 실행하면 내려받은 **모든 Piper 음성 + Windows 내장(SAPI) 음성의 샘플을 TTS 순서대로** `assets/tts-samples/` 에 만들어 둡니다(순서: Piper 음성 → Windows 내장 음성, 영어 먼저). 파일명이 `01_en_GB-alan-low.wav` 처럼 **순번_음성 이름**이라 목록 순서 그대로 이어 들어볼 수 있고, `00_목록.txt`(순번·음성·성별 표)와 `재생목록.m3u`(순서대로 이어 듣기)도 함께 남습니다. `--text` 로 샘플 문장, `--only amy Zira` 처럼 일부 음성만, `--out` 으로 저장 폴더를 바꿀 수 있습니다.
- **성별 구분(여성/남성)**: 내려받은 38개 영어 음성을 남/녀로 구분해 목소리 라벨(`미국 영어 · 여성 · medium · 60MB`)과 선택지에 함께 표시합니다. 판정은 **① 이름·기본 설정 힌트 → ② Piper 공식 MODEL_CARD → ③ 샘플 합성 후 F0(기본 주파수) 측정** 순서로 하고, 결과는 `assets/tts/voice_gender.json` 에 저장해 다음엔 즉시 표시합니다. `python publish.py --voice-gender` 로 전체 표를 보고 새로 측정할 수 있습니다. 경계 주파수(153Hz 부근)의 `en_US-kristin` 처럼 F0 만으로 헷갈리는 음성은 공식 MODEL_CARD 가 바로잡아 줍니다.
- **단어와 문장 사이 휴지**: 낭독은 단어와 예문을 **각각 따로 합성한 뒤** 기본 0.4초 무음을 끼워 이어 붙입니다. 설치된 piper-tts 는 문장 사이 무음 기능이 없어 한 문자열로 합성하면 실측 **0초(오히려 -0.15초)** 로 붙어 읽었습니다. `--word-gap 0.6` 처럼 길이를 바꾸거나 `--word-gap 0` 으로 옛 동작으로 되돌릴 수 있고, 여성·남성 두 목소리 사이 0.4초(VOICE_GAP)는 그대로입니다.
- **마지막 선택 저장**: 생성 메뉴(1~8)에서 기본값과 다르게 TTS 사용 여부·목소리를 고르면, 생성 전에 「선택한 TTS 설정을 다음부터 기본값으로 저장할까요?」(기본 예)를 물어봅니다. 저장하면 `config.json` 의 `default_tts`·`default_voice`·`default_voice2` 가 갱신되어 다음부터 그대로 씁니다. 그때그때 다르게 쓰려면 `n` 을 누르고, 값이 그대로면 묻지도 않습니다.
- **로컬 TTS(Piper) 설치·음성 내려받기**: `piper-tts` 는 `requirements.txt` 에 포함되어 `setup.bat` 실행으로 설치됩니다. 음성 모델은 `promo/assets/tts/` 에 내려받아야 합니다 — 메뉴 **31번**의 내려받기(`list` 입력 시 영어 음성 전체 목록) 또는
  ```bash
  python -m piper.download_voices en_US-amy-medium --download-dir promo/assets/tts
  ```
  한 음성당 약 20~65MB 이며, 내려받는 순간 인터넷 없이 씁니다. 내려받지 않았거나 패키지가 없으면 엔진이 Windows 내장 SAPI 로 내려가므로 기존과 똑같이 동작합니다.
  영어 음성 38개(미국 27 + 영국 11, low/medium/high)는 모두 `promo/assets/tts/` 에 내려받아 두었습니다 — 약 2.5GB 이며 목록은 `list`, 확인은 **미리 듣기**로 하면 됩니다. 다른 언어 음성까지 내려받으려면 목록에서 이름을 골라 같은 명령을 실행하세요.
- **Windows 영어 음성 설치** (엔진을 `windows` 로 쓸 때): Windows 11의 `설정 → 시간 및 언어 → 언어 및 지역 → 언어 추가`에서 `English (United States)` 또는 `English (United Kingdom)`을 추가하고, 각 언어의 **언어 옵션**에서 음성/Text-to-speech 기능을 설치할 수 있습니다. 언어 팩은 표시 언어를 바꾸지 않고 추가할 수 있습니다. 음성 엔진의 설치 상태에 따라 SAPI에 나타나기까지 재부팅이나 로그아웃이 필요할 수 있습니다.
- **무음 방지**: TTS·음악이 실패하거나 없어도 부드러운 앰비언트 사운드가 들어갑니다. `--no-ambient`로 끌 수 있습니다.
- **네모(□) 방지**: fontTools cmap으로 글리프 존재를 확인해, 한글 폰트(기본 마루부리)에 없는 IPA 기호 등은 자동으로 IPA 커버 폰트(Arial 등)로 대체합니다. 발음기호 알약(pill)의 폭·가운데 정렬도 폴백 글리프까지 계산해 그리므로 글자가 한쪽으로 쏠리지 않습니다.
- **인트로·아웃로 기본 포함**: 첫 장에 「TOEIC 필수 어휘」 같은 브랜드 훅(기본 2.5초), 마지막 장에 사이트 유입 CTA 카드(기본 3초)가 자동으로 들어갑니다. `--no-intro`/`--no-outro` 로 끄거나 `--intro-sec`/`--outro-sec` 으로 길이를 바꿀 수 있습니다. 예상 길이가 Shorts 60초를 넘을 것 같으면 생성기가 미리 경고합니다.
- **배경 테마·패턴 (번호 선택)**: 배경은 **테마(색 그라데이션 22종) × 패턴(무늬 15종)** 으로 조합합니다. 생성 메뉴(1~8)·기본 설정(25번)에서는 **번호를 눌러 선택**하고(예: `21` = neon, `11` = bokeh), `make_shorts.py` 에서는 `--bg 21 --pattern 11` 처럼 번호 또는 이름을 씁니다. `--list-bg` 로 전체 번호 목록을 확인할 수 있습니다. 패턴은 `circles`(은은한 원)·`rings`·`dots`·`grid`·`mesh`·`diagonal`·`stripes`·`waves`·`bokeh`·`glow`·`triangles`·`stars`·`confetti` 가 있고, `auto` 는 카드 스타일 기본값(classic 은 circles, 나머지는 없음), `none` 은 깔끔한 그라데이션만 씁니다. 랜덤 무늬(bokeh·stars 등)는 항상 같은 모양이 나옵니다. 기본값은 `config.json` 의 `promo.default_theme`·`default_pattern`·`default_style` 에 저장되고, 생성 메뉴에서 다르게 고르면 「다음부터 기본값으로 저장할까요?」로 갱신할 수 있습니다.

| 옵션 | 설명 |
|---|---|
| `--idioms` | 유닛 단어 대신 숙어 126선으로 만들기 (`--unit` 생략 가능) |
| `--frequency` | 유닛 단어 대신 빈도순 기출 어휘 200선으로 만들기 (`--unit` 생략 가능) |
| `--paraphrase` | 유닛 단어 대신 동의어 치환 퀴즈 200문제로 만들기 (`--unit` 생략 가능, 문제·정답 2장) |
| `--bg` | 배경 테마 — **이름 또는 번호** 22종 (blue·purple·green·orange·pink·navy·midnight·sunset·mint·wine·teal·sky·forest·lavender·gold·coral·steel·plum·ocean·coffee·neon·graphite) |
| `--pattern` | 배경 패턴 — **이름 또는 번호** 15종 (`auto`(기본, 스타일 기본값) / `none` / `circles` / `rings` / `dots` / `grid` / `mesh` / `diagonal` / `stripes` / `waves` / `bokeh` / `glow` / `triangles` / `stars` / `confetti`) |
| `--list-bg` | 배경 테마·패턴·스타일의 **번호 목록**을 출력하고 종료 |
| `--style` | 카드 스타일 — **이름 또는 번호**: `classic`(기본) / `modern`(글래스 카드) / `minimal`(심플) |
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

- **인사이트**: 제목으로 콘텐츠 종류(단어/숙어/빈도/퀴즈)를 구분해 종류별 평균 조회수·좋아요를 계산하고, 조회수가 높았던 게시 시간대와 다음에 만들 콘텐츠를 추천합니다. HTML 보고서에도 같은 섹션이 들어가며, 원클릭 메뉴 **19번 → i** 로도 볼 수 있습니다.

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

기록을 비우려면 원클릭 메뉴 **16번** 또는 `--reset-posted`를 사용하세요. `promo/posted.json`은 개인 운영 데이터라 git에 포함되지 않습니다.

## 7-3. 콘텐츠 자동 준비 (하루치·N일치)

원클릭 메뉴 **23번** 또는 `--auto-plan`으로 여러 날치 쇼츠를 한 번에 만들고 예약 게시까지 등록합니다. 종류를 고르지 않으면 **남은 콘텐츠가 많은 종류부터 돌려가며** 단어·숙어·빈도·퀴즈를 섞어 만듭니다. 테마·스타일·목소리·항목 수는 설정(메뉴 `25`)의 기본값을 따릅니다.

```bash
# 5일치를 매일 19시에 올라가도록 생성 + 예약 등록 (YouTube 만 대상이면 YouTube 예약 게시가 기본)
python publish.py --auto-plan 5 --plan-start "2026-10-01 19:00" --plan-days 1

# 예약 방식을 명시 — native(지금 업로드·지정 시각 공개, PC 불필요) / local(그 시각 이 PC 가 업로드)
python publish.py --auto-plan 5 --plan-start "2026-10-01 19:00" --plan-mode native
python publish.py --auto-plan 5 --plan-start "2026-10-01 19:00" --plan-mode local --platforms yt,ig

# 숙어 3편만 생성 (예약 없음)
python publish.py --auto-plan 3 --plan-kind idioms
```

- `--plan-mode auto`(기본)는 **YouTube 만 대상이면 native**, Instagram·TikTok 이 섞여 있으면 local 입니다.
  native 는 YouTube 전용이라 `--platforms yt` 여야 하며, 업로드 쿼터(1건 1,600 units)를 지금 사용합니다.
- `--dry-run` 을 붙이면 **영상은 생성하지만** 업로드·예약 저장 없이 계획만 보여 줍니다 (메뉴 23번도 먼저 묻습니다).
- **native**: 생성 직후 각 영상을 비공개로 업로드하고 YouTube 가 지정 시각에 공개합니다 — `--run-due`·작업 스케줄러가 필요 없습니다.
- **local**: 예약 ID·시각이 표시되고, 예약 시각에 `--run-due`(또는 메뉴 `22`·Windows 작업 스케줄러)를 실행하면 게시됩니다.

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
- [ ] 예약 공개(`--publish-at`)라면 YouTube Studio → 콘텐츠 → **예약됨** 에서 시각·공개 상태 확인
- [ ] 테스트 업로드는 `--cancel-native`(읽기·삭제 권한)로 지우거나 YouTube Studio 에서 삭제
- [ ] 하루 1~2개 수준으로 운영하고 각 플랫폼 정책 준수

## 9. 회귀 테스트

업로드·네트워크 없이 예약 로직을 검증합니다(YouTube 요청 본문을 만드는 함수를 분리해 두었습니다).

```bash
cd promo
python -m unittest test_publish -v
```

- `parse_publish_at` — 과거·10분 이내 시각 거부, 로컬/ISO 입력, 시간대 부여
- `plan_publish_times` — `--batch`·`--auto-plan` 의 영상별 공개 시각을 간격대로 계산
- `resolve_plan_mode` — auto 는 YouTube 만이면 native, 다른 플랫폼이 섞이면 local
- `build_youtube_body` — 예약일 때만 `private` + `publishAt`, 일반 업로드는 지정 공개 범위 유지
- `due_schedules` — 도래한 로컬 예약만 선택, 시각이 깨진 항목은 건너뛰고 계속
- `record_native_schedule`·`display_schedule_overview` — 같은 영상은 한 번만 기록, 공개 시각이 지난 항목 반환
- `verify_native_schedules` — 공개/찾을 수 없음/비공개 유예/조회 실패 시 장부 보존, dry-run 은 저장 안 함
- API 키만 있는 경우(비공개를 볼 수 없음)는 `missing` 으로 단정하지 않음, `--cancel-native` 는 권한 없으면 장부 보존
- 메뉴 번호 1~31 연속성·그룹 중복 없음·설명 누락, README·BAT 의 `--publish-at`·`--schedules` 안내

메뉴를 고치거나 예약 방식을 바꿀 때 이 테스트를 먼저 돌리세요.
