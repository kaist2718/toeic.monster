# 어휘 1,500 확장 로드맵 — 기출 빈도 축 500 우선 단어

> 목적: 현재의 어휘 1,000개(30유닛)를 1,500개로 확장할 때 **무엇을 먼저 추가할지**를 TOEIC 기출 빈도 축으로 고정해 두고, 추가 작업이 "그때그때 떠오르는 단어"로 새지 않게 합니다.
> 기준 문서: `docs/content-density-audit.md` §6(기준을 올리는 규칙)과 같은 방식으로, 확장이 끝나면 감사 기준(`tools/audit-density.mjs` BASELINE)을 함께 올립니다.
> 상태: **후보 선정 완료 · 데이터 추가 전** (2026-10-19)

---

## 1. 왜 500개인가

- 토익 850+ 은 현재 1,000단어로도 도달 가능하지만(`guides/vocab-to-850.html`), **900+ 목표와 반복 출제 커버리지**를 위해 중고급 빈출 어휘가 추가로 필요합니다.
- 현 1,000단어는 주제별 30유닛으로 **기초~중급 빈도**에 치우쳐 있어, Part 5 어휘 문제와 Part 7 복수 지문에서 실제로 갈리는 중고급 어휘(회계·법률·물류·IT 등) 커버리지가 얕습니다.
- 500개는 유닛 10개(유닛당 50개) 분량으로, 기존 빌드·감사 체계를 바꾸지 않고 **데이터만 추가**하면 되는 크기입니다.

## 2. 선정 기준 (TOEIC 기출 빈도 축)

| 우선순위 | 기준 | 배분 |
| --- | --- | --- |
| P1 | 기출 빈도 상위 + 현 1,000단어와 중복 없음 + 파트 5·7에서 의미 구분이 필요한 단어 | 300개 |
| P2 | 업종(회계·법률·물류·IT) 전문어 — 복수 지문의 주제 어휘 | 150개 |
| P3 | 콜로케이션·숙어로만 등장하는 구성 단어(형용사·부사·전치사구) | 50개 |

- 각 단어는 **기출 빈도(상/중) · 목표 파트 · 품사**를 근거로 뽑았고, 아래 목록의 그룹 배치가 그 근거입니다.
- 후보는 목록이며, 실제 추가 시 `npm run audit:content` 의 중복 검사와 기존 1,000단어 대조로 걸러 냅니다(중복 판정은 감사가 잡습니다).

## 3. 데이터 형식 (기존과 동일 · 7필드)

```
["asset", "/ˈæset/", "애-셋", "자산, 재산", "The company sold its overseas assets.", "그 회사는 해외 자산을 매각했다.", "더 컴-퍼-니 솔드 잇-즈 오-버-시즈 애-셋-츠"]
```

- 형식: `[단어, IPA, 한글발음, 뜻, 토익 예문, 예문 해석, 예문 한글 발음]`
- 예문은 **7단어 이상**(밀도 감사 기준), 해석에 숫자가 있으면 영어 예문에도 있어야 합니다(`npm run audit:prose`).
- 배치: 유닛 31~40 (`data/unit31.js` … `unit40.js`) — 유닛 제목은 아래 그룹 이름을 씁니다.

## 4. 우선 단어 후보 500선

> 표기는 `단어 뜻` 입니다. 그룹 = 신설 유닛 31~40의 주제입니다. (P1·P2·P3 은 위 선정 기준)

### 유닛 31 · 금융·회계 (50 · P1)

audit 감사 · depreciation 감가상각 · equity 자본 · dividend 배당금 · shareholder 주주 · bond 채권 · securities 유가증권 · portfolio 포트폴리오 · ledger 원장 · reimbursement 상환 · accrual 발생 기준 · amortization 상각 · solvency 지급 능력 · liquidity 유동성 · collateral 담보 · maturity 만기 · remittance 송금 · pension 연금 · premium 보험료 · deductible 공제액 · overhead 간접비 · payroll 급여 대장 · cash flow 현금 흐름 · fiscal 회계의 · quarterly 분기별 · forecast 예측 · variance 편차 · surplus 흑자 · deficit 적자 · gross 총계의 · net 순(純)의 · write-off 상각 처리 · outstanding 미지급의 · overdue 기한이 지난 · escrow 에스크로 · levy 부과금 · subsidy 보조금 · break-even 손익분기 · cost-effective 비용 효율적인 · revenue stream 수익원 · allocate 배분하다 · reinvest 재투자하다 · reimburse 변제하다 · withhold 원천 징수하다 · audit trail 감사 추적 · purchase order 구매 발주 · credit line 여신 한도 · book value 장부 가치 · financial statement 재무 제표 · remuneration 보수

### 유닛 32 · 마케팅·영업 (50 · P1)

campaign 캠페인 · demographic 인구 통계 · market share 시장 점유율 · brand awareness 브랜드 인지도 · prospect 잠재 고객 · outreach 고객 접촉 · referral 추천 · retention 유지율 · churn 이탈 · conversion 전환 · funnel 퍼널 · pitch 제안 발표 · proposal 제안서 · bid 입찰 · tender 공개 입찰 · quote 견적 · rebate 리베이트 · incentive 인센티브 · quota 할당량 · territory 영업 지역 · distributor 유통업체 · retailer 소매업체 · wholesale 도매 · trade-in 반납 보상 · warranty 보증 · satisfaction 만족도 · survey 설문 · testimonial 추천사 · advertisement 광고 · sponsorship 스폰서십 · rollout 출시 · positioning 포지셔닝 ·segment 세그먼트 · cross-sell 교차 판매 · upsell 상향 판매 · cold call 콜드콜 · closing 계약 마무리 · procurement cycle 조달 주기 · sales pipeline 영업 흐름 · target audience 목표 수요층 · brand loyalty 브랜드 충성도 · market research 시장 조사 · product launch 신제품 출시 · promotional 할인 판매의 · competitive 경쟁의 · premium 고급의 · niche 틈새 시장 · turnover 매출 회전 · revenue growth 매출 성장 · demand 수요

### 유닛 33 · 인사·조직 (50 · P1)

applicant 지원자 · shortlist 최종 후보 · onboarding 온보딩 · probation 수습 기간 · appraisal 인사 평가 · demotion 강등 · resignation 사직 · turnover rate 이직률 · morale 사기 · welfare 복리후생 · compensation 보상 · job description 직무 기술서 · headcount 정원 · workforce 인력 · labor union 노조 · strike 파업 · dispute 분쟁 · grievance 불만 사항 · harassment 괴롭힘 · code of conduct 행동 강령 · orientation 오리엔테이션 · mentor 멘토 · coaching 코칭 · skill set 기술 역량 · recruitment 채용 · part-time 시간제 · full-time 전일제 · overtime 초과 근무 · shift 교대 근무 · leave 휴가 · sabbatical 안식 휴가 · hybrid work 혼합 근무 · workspace 작업 공간 · bulletin 사보 · job posting 구인 공고 · reference 추천인 · background check 신원 조회 · relocation allowance 이주 지원금 · severance 퇴직금 · union contract 단체 협약 · grievance procedure 고충 처리 절차 · performance review 성과 평가 · career path 경력 경로 · workforce planning 인력 계획 · overtime pay 초과 근무 수당 · paid leave 유급 휴가 · job fair 채용 박람회 · traineeship 연수 제도 · personnel 인사과 · promotion policy 승진 규정

### 유닛 34 · 물류·생산·구매 (50 · P2)

consignment 위탁 · pallet 팔레트 · container 컨테이너 · customs 세관 · quarantine 격리 · backlog 미처리 물량 · lead time 리드타임 · throughput 처리량 · yield 수율 · defect 결함 · quality control 품질 관리 · downtime 가동 중단 · spare part 예비 부품 · blueprint 설계도 · specification 사양 · prototype 프로토타입 · milestone 이정표 · dispatch 배차 · courier 퀵 배송 · delivery note 배송 명세서 · bill of lading 선하증권 · shipping label 배송 라벨 · backorder 주문 재고 · restock 재입고 · replenishment 보급 · fabrication 제작 · packaging 포장 · bar code 바코드 · scanner 스캐너 · forklift 지게차 · dock 도크 · route 경로 · fleet 차량 대수 · haul 운송 · cross-dock 크로스도킹 · assembly line 조립 라인 · raw materials 원자재 · production schedule 생산 일정 · safety stock 안전 재고 · order fulfillment 주문 처리 · warehouse receipt 창고 보관증 · loading dock 하역장 · shipment tracking 배송 추적 · supply chain 공급망 · shortage 부족 · surplus stock 과잉 재고 · batch 배치 · maintenance schedule 점검 일정 · equipment breakdown 장비 고장 · capacity 생산 능력

### 유닛 35 · 계약·법률·컴플라이언스 (50 · P2)

clause 조항 · amendment 수정 · termination 해지 · breach 위반 · lawsuit 소송 · plaintiff 원고 · defendant 피고 · attorney 변호사 · counsel 법률 자문 · jurisdiction 관할 · indemnity 면책 · confidentiality 기밀 유지 · non-compete 경업 금지 · intellectual property 지식 재산 · patent 특허 · trademark 상표 · copyright 저작권 · infringement 침해 · mediation 조정 · settlement 합의 · statute 법령 · ordinance 조례 · permit 허가 · license 면허 · renewal 갱신 · expiration 만료 · signatory 서명자 · witness 증인 · notary 공증인 · affidavit 진술서 · subpoena 소환장 · penalty 위약금 · sanction 제재 · disclosure 공개 · due diligence 실사 · force majeure 불가항력 · governing law 준거법 · arbitration clause 중재 조항 · binding 구속력 있는 · lawful 합법적인 · unlawful 위법한 · compliance officer 준수 담당자 · regulatory 규제의 · statute of limitations 소멸 시효 · void 무효의 · uphold 유지하다 · adjudicate 판정하다 · litigate 소송하다 · authorize 승인하다 · certify 공인하다

### 유닛 36 · IT·기술·사무 자동화 (50 · P2)

software 소프트웨어 · hardware 하드웨어 · database 데이터베이스 · server 서버 · network 네트워크 · bandwidth 대역폭 · encryption 암호화 · firewall 방화벽 · backup 백업 · restore 복원 · outage 장애 · update 업데이트 · upgrade 업그레이드 · patch 패치 · compatibility 호환성 · interface 인터페이스 · algorithm 알고리즘 · automation 자동화 · dashboard 대시보드 · analytics 분석 · workflow 작업 흐름 · integration 연동 · authentication 인증 · credential 자격 증명 · subscription 구독 · license key 라이선스 키 · troubleshooting 문제 해결 · diagnostic 진단 · malfunction 오작동 · installation 설치 · configuration 설정 · deployment 배포 · repository 저장소 · version control 버전 관리 · cloud storage 클라우드 저장소 · remote access 원격 접속 · user manual 사용자 매뉴얼 · release note 릴리스 노트 · technical support 기술 지원 · help desk 헬프데스크 · ticket 티켓 · response time 응답 시간 · data breach 정보 유출 · phishing 피싱 · malware 악성 코드 · spam 스팸 · accessibility 접근성 · bandwidth limit 대역폭 한도 · reboot 재부팅 · synchronize 동기화하다

### 유닛 37 · 여행·숙박·항공 (50 · P1)

itinerary 일정표 · reservation 예약 · booking confirmation 예약 확인 · accommodation 숙박 시설 · vacancy 빈 객실 · occupancy 점유율 · check-in 체크인 · check-out 체크아웃 · concierge 컨시어지 · room service 룸서비스 · amenity 편의 시설 · suite 스위트룸 · single room 싱글룸 · double room 더블룸 · cancellation 취소 · no-show 노쇼 · layover 경유 · connecting flight 연결 항공편 · departure 출발 · arrival 도착 · boarding 탑승 · gate 탑승구 · terminal 터미널 · baggage 수하물 · carry-on 기내 수하물 · excess baggage 초과 수하물 · customs declaration 세관 신고 · immigration 출입국 심사 · visa 비자 · passport 여권 · travel insurance 여행자 보험 · reimbursement claim 비용 청구 · per diem 일당 · mileage 마일리지 · frequent flyer 상용 고객 · charter 전세기 · cruise 크루즈 · guided tour 가이드 투어 · excursion 견학 · peak season 성수기 · off-season 비수기 · rate card 요금표 · surcharge 할증 · complimentary 무료 제공의 · front desk 프런트 데스크 · bellhop 호텔 벨맨 · wake-up call 모닝콜 · sightseeing tour 관광 투어 · itinerary change 일정 변경 · transit 통행 · immigration form 입국 신고서

### 유닛 38 · 서비스·고객대응·리테일 (50 · P1)

complaint 불만 · hotline 핫라인 · inquiry 문의 · assistance 지원 · courtesy 정중함 · escalation 상급자 이관 · resolution 해결 · refund 환불 · exchange 교환 · loaner 대여품 · restocking fee 재입고 수수료 · receipt 영수증 · warranty claim 보증 청구 · defect report 결함 보고 · recall 리콜 · replacement 교체품 · consumable 소모품 · queue 대기열 · waiting time 대기 시간 · service counter 서비스 데스크 · cashier 계산원 · membership 회원 자격 · loyalty program 적립 프로그램 · coupon 쿠폰 · markdown 할인 인하 · clearance 처분 매각 · stockroom 재고 창고 · display 진열 · window shopping 구경 · shoplifting 절도 · out of stock 품절 · in stock 재고 있음 · back in stock 재입고 · sold out 매진 · bestseller 인기 상품 · sample 견본 · catalog 카탈로그 · order form 주문서 · shipping fee 배송비 · free shipping 무료 배송 · delivery area 배송 지역 · return policy 반품 정책 · customer service 고객 서비스 · feedback form 의견서 · complaint desk 불만 접수처 · call center 콜센터 · hold time 대기 시간 · courtesy call 안내 전화 · follow-up call 후속 전화 · service quality 서비스 품질 · customer loyalty 고객 충성도 · storefront 매장

### 유닛 39 · 고급 동사·형용사 (50 · P3)

alleviate 완화하다 · bolster 강화하다 · anticipate 예상하다 · ascertain 확인하다 · consolidate 통합하다 · facilitate 촉진하다 · implement 시행하다 · incorporate 통합되다 · mitigate 경감하다 · necessitate 필요로 하다 · optimize 최적화하다 · overhaul 전면 개편하다 · pioneer 개척하다 · pursue 추구하다 · streamline 간소화하다 · substantiate 입증하다 · exacerbate 악화시키다 · fluctuate 변동하다 · garner 얻다 · hinder 방해하다 · incur 발생시키다 · manipulate 조작하다 · negotiate 협상하다 · obstruct 방해하다 · pose 제기하다 · predetermine 미리 정하다 · prevail 우세하다 · procure 조달하다 · quantify 정량화하다 · reiterate 반복하다 · revitalize 활성화하다 · scrutinize 정밀 검토하다 · spearhead 주도하다 · suffice 충분하다 · undermine 훼손하다 · undertake 착수하다 · utilize 활용하다 · viable 실행 가능한 · prudent 신중한 · feasible 실현 가능한 · imminent 임박한 · lucrative 수익성 있는 · mandatory 의무적인 · negligible 무시해도 될 · paramount 가장 중요한 · provisional 잠정적인 · redundant 중복되는 · rigorous 엄격한 · sustainable 지속 가능한 · tangible 유형의 · vulnerable 취약한

### 유닛 40 · 부사·연결어·전치사구 (50 · P3)

accordingly 그에 따라 · albeit 비록 · whereby 그에 의해 · thereafter 그 이후 · thereby 그로써 · therein 그 안에서 · thereof 그것의 · notwithstanding에도 불구하고 · henceforth 이 이후로 · whereas 반면에 · conversely 반대로 · likewise 마찬가지로 · nonetheless 그럼에도 · hence 그러므로 · thus 그러므로 · subsequently 그 후 · meanwhile 그동안 · otherwise 그렇지 않으면 · for instance 예를 들어 · in accordance with ~에 따라 · in addition to ~에 더하여 · in lieu of ~를 대신하여 · in terms of ~에 관하여 · in the event of ~의 경우에 · on behalf of ~를 대신하여 · prior to ~보다 앞서 · pursuant to ~에 따라 · regardless of ~에 관계없이 · with regard to ~에 대해 · as per ~에 따라 · by virtue of ~에 힘입어 · for the purpose of ~를 목적으로 · in compliance with ~를 준수하여 · in excess of ~를 초과하여 · at the discretion of ~의 재량에 따라 · subject to ~의 조건으로 · up to par 기준에 미치는 · ahead of schedule 일정보다 앞서 · on short notice 갑자기 · in the long run 장기적으로 · to some extent 어느 정도 · under warranty 보증 기간 내 · out of service 사용 불가 · at no extra charge 추가 요금 없이 · in bulk 대량으로 · on standby 대기 중 · off-site 현장 외 · in-house 사내에서 · outsource 외주로 맡기다 · in short 간단히 말해

---

## 5. 실행 절차 (데이터 추가 단계)

1. 유닛 31~40 파일 생성 — `data/unit31.js` … `unit40.js` 를 기존 형식(7필드)으로 채웁니다. 예문은 7단어 이상, 해석과 숫자를 맞춥니다.
2. `tools/audit-content.mjs` 의 유닛 탐색 범위 확인 — 현재 30유닛을 읽도록 돼 있으므로 유닛 개수·`audit:counts` 의 `units = 30`·`vocab = 1000` 을 40/1500으로 함께 올립니다.
3. `npm run build` — 유닛 10개의 정적 페이지·사이트맵이 자동 생성됩니다. `audit:counts` 의 `pages`·`sitemap_urls` 를 실제 값으로 갱신합니다.
4. `npm run audit:prose` 로 번역 숫자·결측 점검, `npm run audit:density` 로 예문 길이 기준을 확인합니다.
5. 밀도 기준 상향 — 예문 5단어 이하 0% 기준을 유지하고, 유닛당 단어 수(50) 기준을 `tools/audit-density.mjs` BASELINE에 반영합니다.
6. 문서 갱신 — 이 문서의 상태를 "추가 완료"로, `docs/content-roadmap.md` 의 어휘 수량을 갱신합니다.

## 6. 리스크와 판단 기준

| 리스크 | 판단 기준 |
| --- | --- |
| 기존 1,000단어와 중복 | `npm run audit:content` 가 잡습니다 — 추가 후 중복이 나오면 해당 단어를 빼고 후보군에서 한 단어를 올립니다 |
| 예문 품질 저하 | 예문 길이(7단어 이상)·숫자 대조는 `audit:prose` 가 자동 검사합니다. 자연스러움은 사람 검수 샘플(`audit:prose` 하단)로 확인합니다 |
| 유닛 불균형 | 유닛당 50개를 고정하고, 난이도는 유닛 순서(31 → 40)로 올라가게 배치했습니다 |
| 기준 문서 드리프트 | 수치는 본문이 아니라 `audit:counts` 블록으로만 관리합니다(§5-2·5-3) |
