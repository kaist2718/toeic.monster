// toeic.monster 확장 콘텐츠 데이터
// index.html 이 <script src="data/extra.js"></script> 로 먼저 불러와 window.TOEIC_EXTRA 를 읽습니다.
// 브라우저와 tools/build-pages.mjs(vm) 양쪽에서 동일하게 평가됩니다.
window.TOEIC_EXTRA = {

  /* ============ 1. Part 7 복수 지문 (이중·삼중) ============ */
  part7: [
    { title: "주문 확인과 배송 일정", type: "이메일 + 표", level: "이중 지문",
      passages: [
        { label: "지문 1 · 이메일", text: "Dear Ms. Fowler, Thank you for your order. We are pleased to confirm that all items are in stock and will be shipped within two business days. You will receive a tracking number by email once your package leaves our warehouse." },
        { label: "지문 2 · 배송 표", text: "Standard: 3-5 business days, $5 | Express: 1-2 business days, $15 | Overnight: next business day, $28 | Free shipping on orders over $100." }
      ],
      qs: [
        { q: "이 주문에 대한 이메일의 목적은?", a: "주문 확인", opts: ["주문 확인", "환불 안내", "가격 인상 공지", "재고 부족 사과"], why: "confirm that all items are in stock 문장이 주문 확인 목적을 보여줍니다." },
        { q: "추적 번호는 언제 받게 되는가?", a: "상품이 창고를 떠난 뒤", opts: ["주문 직후", "상품이 창고를 떠난 뒤", "결제 후 3일 이내", "배송 완료 후"], why: "once your package leaves our warehouse" },
        { q: "40달러 주문에 밤샘 배송을 선택하면 배송비는?", a: "$28", opts: ["$5", "$15", "$28", "무료"], why: "Overnight: $28이며 무료 배송은 $100 초과 주문에만 적용됩니다." }
      ] },
    { title: "회의 초대와 참석자 명단", type: "이메일 + 목록", level: "이중 지문",
      passages: [
        { label: "지문 1 · 이메일", text: "Hello everyone, The quarterly budget review will take place on Thursday at 10 a.m. in the Aurora Room. Please review the attached spreadsheet beforehand and bring any questions about your department's spending." },
        { label: "지문 2 · 참석자 명단", text: "Attendees: J. Park (Finance), M. Costa (Marketing), L. Chen (Operations) | Absent: D. Kim (Sales, on business trip) | Note: Ms. Costa will present the marketing budget." }
      ],
      qs: [
        { q: "참석자가 미리 해야 할 일은?", a: "스프레드시트를 검토한다", opts: ["스프레드시트를 검토한다", "발표 자료를 만든다", "회의실을 예약한다", "출장을 취소한다"], why: "review the attached spreadsheet beforehand" },
        { q: "마케팅 예산을 발표하는 사람은?", a: "M. Costa", opts: ["J. Park", "M. Costa", "L. Chen", "D. Kim"], why: "Ms. Costa will present the marketing budget." },
        { q: "회의에 참석하지 못하는 사람은?", a: "D. Kim", opts: ["J. Park", "M. Costa", "L. Chen", "D. Kim"], why: "Absent: D. Kim" }
      ] },
    { title: "호텔 예약과 이용 안내", type: "확인서 + 안내문", level: "이중 지문",
      passages: [
        { label: "지문 1 · 예약 확인서", text: "Guest: Mr. T. Yamamoto | Room: Deluxe Twin | Check-in: May 3, 3 p.m. | Check-out: May 6, 11 a.m. | Rate: $140 per night | Includes breakfast for two." },
        { label: "지문 2 · 호텔 안내문", text: "Guests may use the rooftop pool free of charge. Late check-out until 2 p.m. is available for an additional $30 and should be requested at the front desk one day in advance." }
      ],
      qs: [
        { q: "이 예약에 포함되지 않은 것은?", a: "늦은 체크아웃", opts: ["조식 2인", "디럭스 트윈 객실", "늦은 체크아웃", "3박 숙박"], why: "늦은 체크아웃은 추가 요금 $30이 필요합니다." },
        { q: "객실 1박 요금은?", a: "$140", opts: ["$110", "$140", "$30", "$170"], why: "Rate: $140 per night" },
        { q: "늦은 체크아웃을 요청하려면 언제 연락해야 하는가?", a: "하루 전", opts: ["하루 전", "체크인 당일", "체크아웃 당일", "예약 시"], why: "requested at the front desk one day in advance" }
      ] },
    { title: "제품 리콜 공지와 고객 대응", type: "공지 + 이메일", level: "이중 지문",
      passages: [
        { label: "지문 1 · 리콜 공지", text: "Attention customers: Model AX-200 coffee makers sold between March and June may overheat. Please stop using the product and unplug it immediately. Affected customers are entitled to a full refund or a free replacement." },
        { label: "지문 2 · 고객 이메일", text: "I purchased an AX-200 in April and would prefer a replacement rather than a refund. Could you tell me how long the replacement will take to arrive?" }
      ],
      qs: [
        { q: "공지에서 고객에게 요청한 즉각적인 조치는?", a: "제품 사용을 중단하고 플러그를 뽑는다", opts: ["제품 사용을 중단하고 플러그를 뽑는다", "매장을 방문한다", "이메일로 사진을 보낸다", "A/S 센터를 예약한다"], why: "stop using the product and unplug it immediately" },
        { q: "영향을 받은 고객이 받을 수 있는 것은?", a: "전액 환불 또는 무상 교체", opts: ["전액 환불 또는 무상 교체", "수리 서비스만", "할인 쿠폰", "다음 모델 할인"], why: "entitled to a full refund or a free replacement" },
        { q: "고객이 선택한 대응은?", a: "무상 교체", opts: ["전액 환불", "무상 교체", "수리 요청", "구매 취소"], why: "would prefer a replacement rather than a refund" }
      ] },
    { title: "사내 교육과 일정 변경", type: "공지 + 일정표", level: "이중 지문",
      passages: [
        { label: "지문 1 · 사내 공지", text: "Due to a scheduling conflict, the customer service training originally planned for Tuesday will now be held on Friday. Attendance is mandatory for all new hires. Lunch will be provided." },
        { label: "지문 2 · 교육 일정표", text: "09:30 Welcome and Overview | 11:00 Handling Complaints | 13:00 Role-playing Practice | 15:00 Q&A with the Team Leader | 16:00 Feedback Forms" }
      ],
      qs: [
        { q: "교육 일정이 변경된 이유는?", a: "일정 충돌", opts: ["일정 충돌", "강사 부재", "장소 문제", "예산 부족"], why: "Due to a scheduling conflict" },
        { q: "교육이 새로 열리는 요일은?", a: "금요일", opts: ["화요일", "목요일", "금요일", "수요일"], why: "originally planned for Tuesday will now be held on Friday" },
        { q: "15시에 진행되는 것은?", a: "팀 리더와의 Q&A", opts: ["불만 처리 실습", "팀 리더와의 Q&A", "역할극 연습", "환영 및 개요"], why: "15:00 Q&A with the Team Leader" }
      ] },
    { title: "사무실 임대와 유지보수", type: "광고 + 계약서", level: "이중 지문",
      passages: [
        { label: "지문 1 · 임대 광고", text: "Prime office space available in the Cobalt Tower. 120 square meters on the eighth floor with a river view. Monthly rent is $3,200 and includes utilities. Minimum lease term is one year." },
        { label: "지문 2 · 계약 조건", text: "Tenant: Nova Design | Monthly rent: $3,200 | Deposit: one month's rent | Maintenance: provided by the landlord, excluding interior repairs caused by the tenant." }
      ],
      qs: [
        { q: "임대료에 포함되지 않는 것은?", a: "세입자가 원인인 내부 수리", opts: ["공과금", "유지보수", "세입자가 원인인 내부 수리", "8층 사무실"], why: "excluding interior repairs caused by the tenant" },
        { q: "보증금은 얼마인가?", a: "한 달 임대료", opts: ["한 달 임대료", "두 달 임대료", "$3,200의 10%", "없음"], why: "Deposit: one month's rent" },
        { q: "최소 계약 기간은?", a: "1년", opts: ["6개월", "1년", "2년", "3년"], why: "Minimum lease term is one year." }
      ] },
    { title: "항공편 변경과 환불 규정", type: "이메일 + 규정", level: "이중 지문",
      passages: [
        { label: "지문 1 · 고객 이메일", text: "Hello, my flight to Denver on June 12 was canceled due to weather. I would like to rebook for June 13 if possible, or receive a refund." },
        { label: "지문 2 · 환불 규정", text: "Flights canceled by the airline are fully refundable. Rebooking is free of charge if requested within 24 hours of the cancellation notice. Otherwise, a $50 change fee applies." }
      ],
      qs: [
        { q: "항공편이 취소된 이유는?", a: "날씨", opts: ["날씨", "기계 결함", "승무원 부족", "공항 폐쇄"], why: "canceled due to weather" },
        { q: "24시간 이내 변경 시 비용은?", a: "무료", opts: ["무료", "$50", "$100", "10%"], why: "Rebooking is free of charge if requested within 24 hours" },
        { q: "고객이 원하는 것은?", a: "재예약 또는 환불", opts: ["재예약 또는 환불", "좌석 업그레이드", "수하물 추가", "마일리지 적립"], why: "rebook for June 13 if possible, or receive a refund" }
      ] },
    { title: "설문 결과와 개선 계획", type: "보고서 + 메모", level: "이중 지문",
      passages: [
        { label: "지문 1 · 설문 결과", text: "Survey of 500 customers: 62% rated delivery speed as excellent, while only 34% were satisfied with packaging. Product quality received the highest score at 88%." },
        { label: "지문 2 · 개선 메모", text: "Action items: 1) Replace current boxes with reinforced packaging by August. 2) Add a second packing line during peak season. Delivery speed requires no immediate change." }
      ],
      qs: [
        { q: "가장 높은 점수를 받은 항목은?", a: "제품 품질", opts: ["배송 속도", "포장", "제품 품질", "고객 응대"], why: "Product quality received the highest score at 88%" },
        { q: "개선이 필요한 항목은?", a: "포장", opts: ["배송 속도", "포장", "제품 품질", "가격"], why: "only 34% were satisfied with packaging" },
        { q: "추가 조치로 계획되지 않은 것은?", a: "배송 속도 개선", opts: ["강화 포장재 도입", "성수기 포장 라인 추가", "배송 속도 개선", "8월까지 포장 교체"], why: "Delivery speed requires no immediate change." }
      ] },
    { title: "이중 지문 · 워크숍 등록과 좌석 배정", type: "안내문 + 배치도", level: "이중 지문",
      passages: [
        { label: "지문 1 · 등록 안내", text: "Registration for the October leadership workshop is now open. The workshop is limited to 30 participants and priority is given to employees who have completed the basic management course." },
        { label: "지문 2 · 좌석 배치", text: "Table 1-3: New Team Leaders | Table 4-6: Department Managers | Table 7-8: Guest Speakers | Registration desk: main lobby, 8:30 a.m." }
      ],
      qs: [
        { q: "워크숍 참가 정원은?", a: "30명", opts: ["20명", "30명", "50명", "제한 없음"], why: "limited to 30 participants" },
        { q: "우선권을 받는 직원은?", a: "기초 관리 과정을 수료한 직원", opts: ["기초 관리 과정을 수료한 직원", "신입 사원", "부서 관리자", "외부 게스트"], why: "priority is given to employees who have completed the basic management course" },
        { q: "부서 관리자는 어느 테이블에 앉는가?", a: "4번에서 6번", opts: ["1번에서 3번", "4번에서 6번", "7번에서 8번", "메인 로비"], why: "Table 4-6: Department Managers" }
      ] },
    { title: "삼중 지문 · 채용 전형", type: "공고 + 이메일 + 일정", level: "삼중 지문",
      passages: [
        { label: "지문 1 · 채용 공고", text: "Webb Logistics is hiring a warehouse supervisor. Requirements: three years of experience, a forklift license, and availability for weekend shifts." },
        { label: "지문 2 · 지원자 이메일", text: "Hello, I have five years of warehouse experience but my forklift license expired last month. I have already applied for renewal. Would my application still be considered?" },
        { label: "지문 3 · 전형 일정", text: "Step 1: Document screening (by July 10) | Step 2: Practical test (July 17) | Step 3: Final interview (July 24) | Step 4: Job offer (August 1)" }
      ],
      qs: [
        { q: "지원자가 부족한 요건은?", a: "유효한 지게차 면허", opts: ["경력 3년", "유효한 지게차 면허", "주말 근무 가능 여부", "물류 경험"], why: "면허가 만료되어 갱신 신청 중이라는 내용입니다." },
        { q: "실무 테스트 날짜는?", a: "7월 17일", opts: ["7월 10일", "7월 17일", "7월 24일", "8월 1일"], why: "Step 2: Practical test (July 17)" },
        { q: "최종 면접 이후 단계는?", a: "채용 제안", opts: ["문서 심사", "실무 테스트", "채용 제안", "추가 면접"], why: "Step 4: Job offer" }
      ] },
    { title: "삼중 지문 · 신제품 출시 준비", type: "메모 + 일정 + 예산", level: "삼중 지문",
      passages: [
        { label: "지문 1 · 팀 메모", text: "The launch of the Lumen Lamp is set for November 15. We still need final approval on the packaging design and a photographer for the catalog." },
        { label: "지문 2 · 일정표", text: "Oct 20 Final design approval | Oct 28 Photo shoot | Nov 5 Catalog printing | Nov 15 Launch event" },
        { label: "지문 3 · 예산표", text: "Photography: $2,000 | Printing: $1,500 | Launch event: $3,000 | Contingency: $500 | Total: $7,000" }
      ],
      qs: [
        { q: "10월 20일까지 완료되어야 하는 것은?", a: "최종 디자인 승인", opts: ["사진 촬영", "최종 디자인 승인", "카탈로그 인쇄", "출시 행사"], why: "Oct 20 Final design approval" },
        { q: "사진 촬영 예산은?", a: "$2,000", opts: ["$1,500", "$2,000", "$3,000", "$500"], why: "Photography: $2,000" },
        { q: "출시일은?", a: "11월 15일", opts: ["10월 28일", "11월 5일", "11월 15일", "11월 25일"], why: "The launch of the Lumen Lamp is set for November 15." }
      ] },
    { title: "삼중 지문 · 지점 이전 프로젝트", type: "공지 + 견적서 + 이메일", level: "삼중 지문",
      passages: [
        { label: "지문 1 · 사내 공지", text: "Our downtown branch will move to the Riverside Plaza in January. The branch will remain open during the transition, and no services will be interrupted." },
        { label: "지문 2 · 이사 견적서", text: "Service: Office relocation | Estimated cost: $4,800 | Includes packing, transport, and furniture assembly | Not included: IT equipment disconnection" },
        { label: "지문 3 · 담당자 이메일", text: "The moving company cannot handle our servers. Please arrange for the IT team to disconnect and reconnect all network equipment on the moving day." }
      ],
      qs: [
        { q: "이전 기간에 대한 설명으로 옳은 것은?", a: "서비스가 중단되지 않는다", opts: ["지점이 임시 휴업한다", "서비스가 중단되지 않는다", "온라인만 운영한다", "예약이 제한된다"], why: "no services will be interrupted" },
        { q: "이사 견적서에 포함되지 않은 것은?", a: "IT 장비 연결 해제", opts: ["포장", "운송", "가구 조립", "IT 장비 연결 해제"], why: "Not included: IT equipment disconnection" },
        { q: "담당자가 요청한 것은?", a: "IT 팀이 네트워크 장비를 분리·연결한다", opts: ["이사 업체를 변경한다", "IT 팀이 네트워크 장비를 분리·연결한다", "이전 일정을 연기한다", "서버를 새로 구매한다"], why: "arrange for the IT team to disconnect and reconnect all network equipment" }
      ] },
    { title: "행사 등록 안내와 확인 메일", type: "안내문 + 이메일", level: "이중 지문",
      passages: [
        { label: "지문 1 · 등록 안내", text: "Registration for the annual sales seminar closes on March 8. The fee is $120 for members and $180 for non-members. Seats are assigned in the order that payments are received." },
        { label: "지문 2 · 참가자 이메일", text: "Hello, I am a member and would like to register two colleagues who are not members. Could you tell me the total amount I should pay?" }
      ],
      qs: [
        { q: "등록 마감일은?", a: "3월 8일", opts: ["3월 8일", "3월 18일", "2월 8일", "3월 28일"], why: "Registration closes on March 8." },
        { q: "비회원 등록비는?", a: "$180", opts: ["$120", "$180", "$300", "$360"], why: "non-members pay $180" },
        { q: "좌석은 어떻게 배정되는가?", a: "결제 순서대로", opts: ["결제 순서대로", "추첨으로", "직급 순으로", "신청서 분량에 따라"], why: "Seats are assigned in the order that payments are received." }
      ] },
    { title: "인사 평가와 승진 대상자", type: "이메일 + 표", level: "이중 지문",
      passages: [
        { label: "지문 1 · 인사팀 이메일", text: "The annual performance review will take place next week. Employees who received a score of 4 or higher in two consecutive years are eligible for promotion this cycle." },
        { label: "지문 2 · 평가 결과표", text: "Name | 2024 | 2025 | K. Yoon: 4.2 / 4.5 | J. Lim: 3.8 / 4.1 | S. Oh: 4.4 / 3.9 | M. Bae: 4.0 / 4.0" }
      ],
      qs: [
        { q: "승진 대상이 되는 조건은?", a: "2년 연속 4점 이상", opts: ["2년 연속 4점 이상", "한 해 4.5점 이상", "근속 2년 이상", "부서장 추천"], why: "a score of 4 or higher in two consecutive years" },
        { q: "승진 대상에 해당하는 사람은?", a: "K. Yoon", opts: ["J. Lim", "S. Oh", "K. Yoon", "M. Bae"], why: "K. Yoon은 4.2와 4.5로 2년 연속 4점 이상입니다." },
        { q: "S. Oh가 승진 대상이 아닌 이유는?", a: "2025년 점수가 4점 미만이라서", opts: ["2024년 점수가 4점 미만이라서", "2025년 점수가 4점 미만이라서", "근속 연수가 부족해서", "평가를 받지 않아서"], why: "S. Oh는 2025년에 3.9점을 받았습니다." }
      ] },
    { title: "매장 리뉴얼 공지와 일정표", type: "공지 + 일정표", level: "이중 지문",
      passages: [
        { label: "지문 1 · 매장 공지", text: "Our flagship store will be renovated from May 12 to May 20. During the renovation, online orders will be processed as usual, but in-store pickup will be unavailable." },
        { label: "지문 2 · 리뉴얼 일정표", text: "May 12-14: interior painting | May 15-17: shelving installation | May 18-19: product display | May 20: staff training and reopening preparation" }
      ],
      qs: [
        { q: "리뉴얼 기간에 계속 이용할 수 있는 것은?", a: "온라인 주문", opts: ["온라인 주문", "매장 픽업", "현장 상담", "매장 반품"], why: "online orders will be processed as usual" },
        { q: "5월 18일과 19일에 하는 작업은?", a: "상품 진열", opts: ["내부 도색", "선반 설치", "상품 진열", "직원 교육"], why: "May 18-19: product display" },
        { q: "재개장 준비는 언제 하는가?", a: "5월 20일", opts: ["5월 14일", "5월 17일", "5월 19일", "5월 20일"], why: "May 20: staff training and reopening preparation" }
      ] },
    { title: "구독 요금제 변경 안내", type: "이메일 + 약관", level: "이중 지문",
      passages: [
        { label: "지문 1 · 서비스 이메일", text: "Starting in July, your monthly subscription will move to the Premium plan at $25 per month. If you prefer to keep the current rate, please reply before June 25 to remain on the Standard plan." },
        { label: "지문 2 · 요금제 약관", text: "Standard: $15 per month, up to 3 users | Premium: $25 per month, up to 10 users | Cancellations are free at any time. Annual billing offers a 10% discount." }
      ],
      qs: [
        { q: "현재 요금을 유지하려면 어떻게 해야 하는가?", a: "6월 25일 전에 회신한다", opts: ["6월 25일 전에 회신한다", "7월에 결제한다", "프리미엄으로 변경한다", "연간 결제를 선택한다"], why: "please reply before June 25 to remain on the Standard plan" },
        { q: "프리미엄 요금제의 사용자 수 제한은?", a: "10명", opts: ["3명", "5명", "10명", "무제한"], why: "Premium: up to 10 users" },
        { q: "연간 결제 시 혜택은?", a: "10% 할인", opts: ["10% 할인", "무료 사용자 추가", "사용자 3명 무료", "해지 수수료 면제"], why: "Annual billing offers a 10% discount." }
      ] },
    { title: "채용 박람회 안내와 부스 배치", type: "광고 + 배치도", level: "이중 지문",
      passages: [
        { label: "지문 1 · 박람회 광고", text: "The Autumn Job Fair will be held on October 9 at the Central Convention Center. Doors open at 10 a.m. Job seekers should bring printed resumes and register online in advance to skip the line." },
        { label: "지문 2 · 부스 배치도", text: "Hall A: IT and software companies | Hall B: Finance and banking | Hall C: Manufacturing and logistics | Interview rooms: second floor, by appointment only" }
      ],
      qs: [
        { q: "미리 해 두어야 하는 것은?", a: "온라인 사전 등록", opts: ["온라인 사전 등록", "이력서 우편 발송", "면접 예약", "등록비 결제"], why: "register online in advance to skip the line" },
        { q: "금융·은행 기업은 어디에 있는가?", a: "Hall B", opts: ["Hall A", "Hall B", "Hall C", "2층"], why: "Hall B: Finance and banking" },
        { q: "면접실 이용 방법으로 옳은 것은?", a: "사전 예약이 필요하다", opts: ["사전 예약이 필요하다", "현장에서 자유롭게 입장한다", "Hall C에 있다", "오전에만 운영한다"], why: "Interview rooms: second floor, by appointment only" }
      ] },
    { title: "삼중 지문 · 신규 거래처 계약", type: "이메일 + 견적서 + 일정", level: "삼중 지문",
      passages: [
        { label: "지문 1 · 구매 담당자 이메일", text: "Hello, we would like to order 500 units of your recycled paper. Could you offer a volume discount and let us know how soon the first batch can arrive?" },
        { label: "지문 2 · 견적서", text: "Unit price: $2.40 | Orders over 400 units: 8% discount | First batch available: 200 units in 5 business days | Remaining units: 2 weeks" },
        { label: "지문 3 · 납품 일정 메모", text: "Client prefers a single delivery if possible. Warehouse capacity allows two shipments per month. Production line is available from the 3rd." }
      ],
      qs: [
        { q: "500개 주문 시 할인율은?", a: "8%", opts: ["5%", "8%", "10%", "12%"], why: "Orders over 400 units receive an 8% discount." },
        { q: "첫 배치로 받을 수 있는 수량은?", a: "200개", opts: ["100개", "200개", "300개", "500개"], why: "First batch available: 200 units" },
        { q: "구매 담당자가 선호하는 것은?", a: "한 번에 배송", opts: ["한 번에 배송", "두 차례 분할 배송", "항공 운송", "창고 보관 서비스"], why: "Client prefers a single delivery if possible." }
      ] },
    { title: "삼중 지문 · 제품 반품 처리", type: "정책 + 주문서 + 이메일", level: "삼중 지문",
      passages: [
        { label: "지문 1 · 반품 정책", text: "Items may be returned within 30 days of delivery in original packaging. Opened electronics are subject to a 15% restocking fee. Refunds are issued within 7 business days of inspection." },
        { label: "지문 2 · 주문서", text: "Order #55831 | Item: Wireless Headphones | Delivered: June 4 | Opened: yes | Amount paid: $160 | Customer: R. Sung" },
        { label: "지문 3 · 고객 이메일", text: "I would like to return the headphones because the sound quality does not meet my expectations. Please let me know how much I will be refunded." }
      ],
      qs: [
        { q: "반품 가능 기간은?", a: "배송 후 30일 이내", opts: ["배송 후 7일 이내", "배송 후 30일 이내", "구매 후 15일 이내", "배송 후 60일 이내"], why: "Items may be returned within 30 days of delivery." },
        { q: "개봉한 전자제품에 적용되는 비용은?", a: "15% 재입고 수수료", opts: ["15% 재입고 수수료", "전액 환불 불가", "배송비 15달러", "10% 할인"], why: "Opened electronics are subject to a 15% restocking fee." },
        { q: "고객이 돌려받을 금액은 약 얼마인가?", a: "$136", opts: ["$160", "$136", "$145", "$120"], why: "$160에서 15%를 제외하면 약 $136입니다." }
      ] },
    { title: "삼중 지문 · 연말 행사 준비", type: "회의록 + 체크리스트 + 이메일", level: "삼중 지문",
      passages: [
        { label: "지문 1 · 회의록", text: "The year-end party will be held on December 19 at the Riverside Hall. The budget is set at $6,000. The committee agreed to hire a live band instead of a DJ." },
        { label: "지문 2 · 준비 체크리스트", text: "Venue deposit: paid | Catering: 80 guests, confirmed | Decorations: needed by Dec 17 | Band contract: not signed | Invitations: sent Dec 1" },
        { label: "지문 3 · 담당자 이메일", text: "The band has asked us to confirm by December 10. We are still waiting for the finance team to release the remaining budget." }
      ],
      qs: [
        { q: "행사장은 어디인가?", a: "Riverside Hall", opts: ["Riverside Hall", "Central Hall", "Skyline Ballroom", "Aurora Room"], why: "at the Riverside Hall" },
        { q: "아직 완료되지 않은 준비는?", a: "밴드 계약", opts: ["케이터링 확정", "장소 예약금 결제", "초대장 발송", "밴드 계약"], why: "Band contract: not signed" },
        { q: "밴드가 요청한 확정 기한은?", a: "12월 10일", opts: ["12월 1일", "12월 10일", "12월 17일", "12월 19일"], why: "The band has asked us to confirm by December 10." }
      ] },
    { title: "통관 지연 안내와 고객 대응", type: "공지 + 이메일", level: "이중 지문",
      passages: [
        { label: "지문 1 · 배송 공지", text: "Some international shipments may be held at customs for additional inspection. In such cases, delivery can be delayed by three to five business days. Customers will be notified by email if their order is affected." },
        { label: "지문 2 · 고객 이메일", text: "My order was supposed to arrive last Tuesday, but I have not received it yet. Could you check whether it is being held at customs and tell me when it will arrive?" }
      ],
      qs: [
        { q: "통관 검사로 지연될 수 있는 기간은?", a: "3~5영업일", opts: ["1~2영업일", "3~5영업일", "1주일", "2주일"], why: "delayed by three to five business days" },
        { q: "영향을 받는 고객은 어떻게 알게 되는가?", a: "이메일로 통보받는다", opts: ["이메일로 통보받는다", "전화를 받는다", "앱 알림을 받는다", "문자 메시지를 받는다"], why: "Customers will be notified by email if their order is affected." },
        { q: "고객이 요청한 것은?", a: "통관 보류 여부와 도착 시점 확인", opts: ["통관 보류 여부와 도착 시점 확인", "환불 요청", "배송지 변경", "선물 포장 신청"], why: "check whether it is being held at customs and tell me when it will arrive" }
      ] },
    { title: "수료증 발급 안내와 신청 메일", type: "안내문 + 이메일", level: "이중 지문",
      passages: [
        { label: "지문 1 · 수료증 안내", text: "Certificates are issued only to participants who attend at least 80 percent of the sessions. Please submit a request through the member portal. Certificates are emailed within five business days." },
        { label: "지문 2 · 참가자 이메일", text: "I attended six of the eight sessions of the leadership course last month. Am I still eligible for a certificate, and how long will it take to receive it?" }
      ],
      qs: [
        { q: "수료증을 받을 수 있는 조건은?", a: "수업의 80% 이상 출석", opts: ["수업의 80% 이상 출석", "시험 통과", "과제 제출", "등록금 완납"], why: "attend at least 80 percent of the sessions" },
        { q: "참가자의 출석률은?", a: "75%", opts: ["80%", "75%", "60%", "100%"], why: "8회 중 6회 = 75%로 80% 기준에 미달합니다." },
        { q: "수료증은 언제 발급되는가?", a: "신청 후 5영업일 이내", opts: ["신청 즉시", "신청 후 5영업일 이내", "과정 종료 당일", "한 달 이내"], why: "Certificates are emailed within five business days." }
      ] },
    { title: "삼중 지문 · 신규 지점 오픈 준비", type: "회의록 + 예산표 + 이메일", level: "삼중 지문",
      passages: [
        { label: "지문 1 · 준비 회의록", text: "The new downtown branch is scheduled to open on September 1. Furniture installation must be completed by August 20, and staff training will begin a week before the opening." },
        { label: "지문 2 · 예산표", text: "Furniture: $12,000 | Signage: $3,500 | Staff training: $2,000 | Grand opening event: $4,500 | Total: $22,000" },
        { label: "지문 3 · 담당자 이메일", text: "The signage vendor informed us that delivery will be delayed by one week. We may need to postpone the grand opening event by a few days." }
      ],
      qs: [
        { q: "가구 설치가 완료되어야 하는 날짜는?", a: "8월 20일", opts: ["8월 20일", "9월 1일", "8월 25일", "9월 8일"], why: "Furniture installation must be completed by August 20." },
        { q: "간판 예산은 얼마인가?", a: "$3,500", opts: ["$12,000", "$3,500", "$4,500", "$2,000"], why: "Signage: $3,500" },
        { q: "담당자가 우려하는 것은?", a: "간판 납품 지연", opts: ["직원 교육 일정", "간판 납품 지연", "장소 계약", "예산 부족"], why: "delivery will be delayed by one week" }
      ] },
    { title: "삼중 지문 · 설비 교체 프로젝트", type: "견적 의뢰 + 견적서 + 일정표", level: "삼중 지문",
      passages: [
        { label: "지문 1 · 견적 의뢰 이메일", text: "We would like to replace the air conditioning units on the third floor. Please provide a quote that includes installation and a two-year maintenance contract." },
        { label: "지문 2 · 견적서", text: "Equipment: $9,000 | Installation: $1,800 | Two-year maintenance: $1,200 | Total: $12,000 | Estimated completion: 4 working days" },
        { label: "지문 3 · 일정표", text: "Day 1-2: removal of old units | Day 3: installation | Day 4: testing and inspection | Note: the third floor will be without cooling during work hours." }
      ],
      qs: [
        { q: "견적에 포함된 항목은?", a: "설치비와 2년 유지보수", opts: ["설치비와 2년 유지보수", "전기 요금", "철거비", "임대료"], why: "a quote that includes installation and a two-year maintenance contract" },
        { q: "설치비는 얼마인가?", a: "$1,800", opts: ["$9,000", "$1,800", "$1,200", "$12,000"], why: "Installation: $1,800" },
        { q: "작업 중 주의 사항은?", a: "근무 시간에 3층 냉방을 쓸 수 없다", opts: ["근무 시간에 3층 냉방을 쓸 수 없다", "3층 출입이 전면 금지된다", "전원 공급이 중단된다", "야간에만 작업한다"], why: "the third floor will be without cooling during work hours" }
      ] }
  ],

  /* ============ 2. Part 6 장문 공란 ============ */
  part6: [
    { title: "부서 이전 안내", type: "사내 이메일",
      text: "Dear Team, I am writing to inform you that the marketing department will relocate to the fifth floor __(1)__ the end of this month. All desk phones will be reassigned, so please update your __(2)__ information in the company directory. A moving crew will handle the heavy equipment, but personal items should be packed __(3)__. If you have any questions, please contact the facilities team __(4)__.",
      blanks: [
        { n: 1, a: "by", opts: ["by", "until", "since", "during"], why: "'~까지 완료'라는 마감 기한은 전치사 by를 씁니다." },
        { n: 2, a: "contact", opts: ["contact", "contacted", "contacting", "contacts"], why: "명사 information을 수식하는 명사 contact(연락처)가 필요합니다." },
        { n: 3, a: "in advance", opts: ["in advance", "on purpose", "by mistake", "at once"], why: "미리 포장해 두라는 의미이므로 in advance가 맞습니다." },
        { n: 4, a: "directly", opts: ["direct", "directly", "direction", "directness"], why: "동사 contact를 수식하는 부사 directly를 씁니다." }
      ] },
    { title: "배송 지연 사과 안내", type: "고객 안내문",
      text: "Thank you for shopping with Hanaro Electronics. Due to an unexpected surge in orders, delivery may take __(1)__ longer than usual. We sincerely apologize for the __(2)__ and are working to ship your items as quickly as possible. If your order has not arrived within five business days, please contact our support team for __(3)__. As a token of our apology, we have issued a 10% discount coupon __(4)__ your next purchase.",
      blanks: [
        { n: 1, a: "slightly", opts: ["slight", "slightly", "slightness", "slightest"], why: "비교급 longer를 수식하는 부사 slightly입니다." },
        { n: 2, a: "inconvenience", opts: ["convenient", "conveniently", "inconvenience", "inconveniently"], why: "전치사 for 뒤에는 명사 inconvenience가 필요합니다." },
        { n: 3, a: "assistance", opts: ["assist", "assistance", "assistant", "assisting"], why: "전치사 for 뒤 명사 assistance(도움)가 맞습니다." },
        { n: 4, a: "for", opts: ["for", "at", "to", "of"], why: "coupon for ~는 '~에 사용할 쿠폰'이라는 연어입니다." }
      ] },
    { title: "채용 공고", type: "구인 광고",
      text: "Bright Consulting is seeking a bilingual assistant to join our international team. The ideal candidate is __(1)__ in both Korean and English and has strong organizational skills. Responsibilities include scheduling meetings, __(2)__ client inquiries, and preparing reports. Previous experience in a similar role is preferred but not __(3)__. Interested applicants should submit a cover letter and resume __(4)__ June 15.",
      blanks: [
        { n: 1, a: "fluent", opts: ["fluency", "fluently", "fluent", "fluents"], why: "be동사 뒤 보어 자리에는 형용사 fluent가 옵니다." },
        { n: 2, a: "answering", opts: ["answer", "answering", "answered", "answers"], why: "scheduling, preparing와 병렬을 이루는 -ing 형태가 필요합니다." },
        { n: 3, a: "required", opts: ["require", "required", "requiring", "requirement"], why: "be + 과거분사 수동 형태로 '요구되지 않는다'를 나타냅니다." },
        { n: 4, a: "by", opts: ["by", "until", "for", "since"], why: "지원 마감 기한은 전치사 by로 표현합니다." }
      ] },
    { title: "호텔 안내문", type: "호텔 안내",
      text: "We are delighted to welcome you to the Grand Riverside Hotel. Your room key also serves __(1)__ a gym pass, so you may use our fitness center at no extra charge. Breakfast is served daily __(2)__ 6:30 a.m. and 10 a.m. in the Ocean View Restaurant. Should you need anything during your stay, please dial 0 to reach the front desk __(3)__. We hope you enjoy your visit and look forward __(4)__ seeing you again.",
      blanks: [
        { n: 1, a: "as", opts: ["as", "for", "with", "to"], why: "serve as ~는 '~로 쓰이다'라는 관용 표현입니다." },
        { n: 2, a: "between", opts: ["between", "among", "during", "from"], why: "between A and B 구조가 필요합니다." },
        { n: 3, a: "at any time", opts: ["at any time", "in time", "on time", "at times"], why: "언제든지 연락하라는 의미로 at any time이 맞습니다." },
        { n: 4, a: "to", opts: ["to", "for", "at", "of"], why: "look forward to + -ing는 '~을 기대하다'입니다." }
      ] },
    { title: "제품 사용 설명서", type: "사용 설명서",
      text: "Before using the blender for the first time, wash all removable parts in warm, soapy water. __(1)__ the parts thoroughly, then place the jar on the base and turn it clockwise until it locks. Do not __(2)__ the appliance with the lid removed. If the motor overheats, the device will shut off __(3)__. Wait at least ten minutes before restarting. Regular cleaning will help __(4)__ the life of your appliance.",
      blanks: [
        { n: 1, a: "Dry", opts: ["Dry", "Drying", "Dried", "Dries"], why: "명령문은 동사원형으로 시작합니다." },
        { n: 2, a: "operate", opts: ["operate", "operation", "operating", "operator"], why: "Do not 뒤에는 동사원형이 옵니다." },
        { n: 3, a: "automatically", opts: ["automatic", "automatically", "automate", "automation"], why: "동사 shut off를 수식하는 부사가 필요합니다." },
        { n: 4, a: "extend", opts: ["extend", "extension", "extended", "extending"], why: "help + 동사원형 구조로 '수명을 연장하다'를 나타냅니다." }
      ] },
    { title: "행사 초대 이메일", type: "초대 이메일",
      text: "We are pleased to invite you to our annual customer appreciation night on December 5. The event will __(1)__ at 7 p.m. in the Skyline Ballroom and will include a dinner and a short awards ceremony. Please confirm your __(2)__ by November 28 so that we can prepare enough seating. Guests are welcome, but please __(3)__ us in advance so we can add them to the list. We look forward to __(4)__ you there.",
      blanks: [
        { n: 1, a: "begin", opts: ["begin", "beginning", "began", "begun"], why: "조동사 will 뒤에는 동사원형이 옵니다." },
        { n: 2, a: "attendance", opts: ["attend", "attendance", "attendant", "attended"], why: "소유격 your 뒤에는 명사 attendance가 필요합니다." },
        { n: 3, a: "notify", opts: ["notify", "notification", "notified", "notifying"], why: "please 뒤에는 동사원형 notify를 씁니다." },
        { n: 4, a: "seeing", opts: ["see", "seeing", "saw", "seen"], why: "look forward to 뒤에는 동명사 -ing가 옵니다." }
      ] },
    { title: "신제품 출시 사내 공지", type: "사내 이메일",
      text: "Dear colleagues, I am pleased to announce that our new smart speaker will be released __(1)__ October 10. The marketing team has prepared a detailed launch plan, and all departments are asked to review it __(2)__ to the meeting on Friday. Please note that the launch date is still __(3)__ and may change slightly. We appreciate your __(4)__ on this project.",
      blanks: [
        { n: 1, a: "on", opts: ["on", "in", "at", "for"], why: "특정 날짜 앞에는 전치사 on을 씁니다." },
        { n: 2, a: "prior", opts: ["prior", "previous", "previously", "precede"], why: "prior to ~ = ~에 앞서(전에)라는 관용 표현입니다." },
        { n: 3, a: "tentative", opts: ["tentative", "tentatively", "tentativeness", "tent"], why: "be동사 뒤 보어 자리에 형용사 tentative(잠정적인)가 필요합니다." },
        { n: 4, a: "cooperation", opts: ["cooperate", "cooperation", "cooperative", "cooperatively"], why: "소유격 your 뒤에는 명사 cooperation이 옵니다." }
      ] },
    { title: "공장 견학 안내문", type: "안내문",
      text: "Thank you for your interest in visiting our manufacturing plant. Tours are offered every Wednesday and __(1)__ approximately 90 minutes. For safety reasons, all visitors must wear protective helmets, which will be __(2)__ at the front desk. Photography is not __(3)__ inside the production area. To reserve a spot, please complete the online form at least three days __(4)__ your visit.",
      blanks: [
        { n: 1, a: "last", opts: ["last", "lasts", "lasting", "lasted"], why: "주어 Tours에 맞춘 현재시제 동사 last가 필요합니다." },
        { n: 2, a: "provided", opts: ["provide", "provided", "providing", "provides"], why: "helmets는 제공되는 대상이므로 수동태 be provided가 맞습니다." },
        { n: 3, a: "permitted", opts: ["permit", "permitting", "permitted", "permission"], why: "is not 뒤에는 과거분사 permitted(허용되는)가 옵니다." },
        { n: 4, a: "before", opts: ["before", "after", "since", "until"], why: "방문 며칠 전까지 예약하라는 의미이므로 before를 씁니다." }
      ] },
    { title: "고객 만족도 설문 안내", type: "안내 이메일",
      text: "Dear valued customer, We would like to hear about your recent experience with our service. The survey takes only five minutes to __(1)__ and your responses will remain completely __(2)__. As a thank-you gift, participants will receive a coupon __(3)__ for their next purchase. Please click the link below __(4)__ July 31 to share your feedback.",
      blanks: [
        { n: 1, a: "complete", opts: ["complete", "completion", "completed", "completing"], why: "to부정사 to 뒤에는 동사원형이 옵니다." },
        { n: 2, a: "confidential", opts: ["confidence", "confidential", "confident", "confidentially"], why: "be동사 뒤 보어 자리에 형용사 confidential(기밀의)가 옵니다." },
        { n: 3, a: "valid", opts: ["valid", "validate", "validity", "validly"], why: "명사 coupon을 뒤에서 수식하는 형용사 valid가 필요합니다." },
        { n: 4, a: "by", opts: ["by", "until", "during", "within"], why: "마감 기한 표현은 전치사 by를 씁니다." }
      ] },
    { title: "소프트웨어 업데이트 공지", type: "기술 공지",
      text: "A new version of our accounting software will be available next Monday. The update includes several security improvements and a redesigned dashboard that is easier __(1)__. Before installing it, please make sure that all your files __(2)__. The installation process usually takes about fifteen minutes and requires no __(3)__ action. If you encounter any problems, please contact the IT help desk __(4)__.",
      blanks: [
        { n: 1, a: "to navigate", opts: ["navigate", "to navigate", "navigating", "navigated"], why: "형용사 easier 뒤에는 to부정사가 와서 판단의 기준을 나타냅니다." },
        { n: 2, a: "are saved", opts: ["save", "are saved", "saving", "have saved"], why: "files는 저장되는 대상이므로 수동태 are saved가 맞습니다." },
        { n: 3, a: "additional", opts: ["addition", "additional", "additionally", "add"], why: "명사 action을 수식하는 형용사 additional이 필요합니다." },
        { n: 4, a: "immediately", opts: ["immediate", "immediately", "immediacy", "immediateness"], why: "동사 contact를 수식하는 부사 immediately를 씁니다." }
      ] },
    { title: "직원 복지 프로그램 안내", type: "사내 공지",
      text: "We are pleased to introduce a new wellness program for all employees. The program __(1)__ free gym access and monthly health checkups. To enroll, simply complete the online form __(2)__ the end of this month. Participation is entirely __(3)__, and your personal health information will be kept __(4)__.",
      blanks: [
        { n: 1, a: "offers", opts: ["offer", "offers", "offering", "offered"], why: "주어 The program는 단수이므로 단수 동사 offers를 씁니다." },
        { n: 2, a: "by", opts: ["by", "until", "since", "during"], why: "마감 기한을 나타내는 전치사 by가 필요합니다." },
        { n: 3, a: "voluntary", opts: ["volunteer", "voluntary", "voluntarily", "volunteering"], why: "be동사 뒤 보어 자리에 형용사 voluntary(자의적인)가 옵니다." },
        { n: 4, a: "confidential", opts: ["confidence", "confidential", "confidently", "confidentiality"], why: "keep + 목적어 + 형용사(상태 유지) 구조입니다." }
      ] },
    { title: "배송 추적 안내문", type: "고객 안내문",
      text: "Thank you for your order. Once your package __(1)__ our warehouse, you will receive a tracking number by email. You can follow the delivery status __(2)__ on our website at any time. If the tracking information has not been updated for more than three days, please contact us so that we can __(3)__ the issue. We appreciate your __(4)__.",
      blanks: [
        { n: 1, a: "leaves", opts: ["leave", "leaves", "leaving", "left"], why: "once절의 주어 your package는 단수이므로 leaves가 맞습니다." },
        { n: 2, a: "online", opts: ["online", "online's", "onlining", "onlined"], why: "상태를 나타내는 부사 online이 자연스럽습니다." },
        { n: 3, a: "investigate", opts: ["investigate", "investigation", "investigator", "investigative"], why: "조동사 can 뒤에는 동사원형이 옵니다." },
        { n: 4, a: "patience", opts: ["patient", "patience", "patiently", "impatience"], why: "소유격 your 뒤에는 명사 patience(인내)가 필요합니다." }
      ] },
    { title: "세미나 등록 확인 이메일", type: "확인 이메일",
      text: "Dear Ms. Cho, We are pleased to confirm your registration for the marketing analytics seminar on November 8. The event will be held in the Grand Hall, __(1)__ is located on the second floor. Please arrive at least fifteen minutes early to __(2)__ your name badge. A detailed program will be sent to you __(3)__. If you are unable to attend, please let us know as soon as __(4)__.",
      blanks: [
        { n: 1, a: "which", opts: ["which", "who", "whose", "what"], why: "사물 선행사 the Grand Hall을 받는 주격 관계대명사 which를 씁니다." },
        { n: 2, a: "collect", opts: ["collect", "collection", "collected", "collecting"], why: "to부정사 to 뒤에는 동사원형이 옵니다." },
        { n: 3, a: "separately", opts: ["separate", "separately", "separation", "separateness"], why: "동사 will be sent를 수식하는 부사 separately가 맞습니다." },
        { n: 4, a: "possible", opts: ["possible", "possibly", "possibility", "possibilities"], why: "as soon as possible은 굳어진 관용 표현입니다." }
      ] },
    { title: "친환경 포장 정책 공지", type: "사내 공지",
      text: "As part of our sustainability efforts, we will replace plastic packaging with recyclable materials starting next quarter. The initial cost will be __(1)__ higher, but the change is expected to reduce waste __(2)__ forty percent. All shipping staff must attend a short training session to learn the new __(3)__. We appreciate your cooperation in making this transition __(4)__.",
      blanks: [
        { n: 1, a: "slightly", opts: ["slight", "slightly", "slightness", "slightest"], why: "비교급 higher를 수식하는 부사 slightly입니다." },
        { n: 2, a: "by", opts: ["by", "for", "with", "of"], why: "증감의 폭은 reduce + by + 수치로 표현합니다." },
        { n: 3, a: "procedures", opts: ["procedure", "procedures", "procedural", "procedurally"], why: "복수 지칭이 자연스러우므로 복수 명사 procedures를 씁니다." },
        { n: 4, a: "smooth", opts: ["smooth", "smoothly", "smoothness", "smoothed"], why: "목적어 this transition 뒤에는 목적격 보어 형용사 smooth가 옵니다." }
      ] },
    { title: "신입 사원 오리엔테이션 안내", type: "안내 이메일",
      text: "Welcome to Hanaro Systems! Your orientation is scheduled for next Monday at 9 a.m. in the training center. During the session, you will receive your employee ID card and __(1)__ to the company intranet. Please bring a photo ID, as it is __(2)__ for issuing your access badge. If you have any __(3)__ about the schedule, feel free to contact the human resources team. We look forward to __(4)__ you soon.",
      blanks: [
        { n: 1, a: "access", opts: ["access", "accessible", "accessibly", "accessing"], why: "명사구 your employee ID card and access to ~의 병렬 구조로 명사 access가 필요합니다." },
        { n: 2, a: "required", opts: ["require", "required", "requiring", "requirement"], why: "it is + 과거분사로 수동의 의미를 나타냅니다." },
        { n: 3, a: "questions", opts: ["question", "questions", "questioning", "questionable"], why: "any 뒤 가산 복수명사 questions가 자연스럽습니다." },
        { n: 4, a: "meeting", opts: ["meet", "meeting", "met", "meets"], why: "look forward to 뒤에는 동명사 -ing가 옵니다." }
      ] }
  ],

  /* ============ 3. Part 2 함정 유형 ============ */
  traps: [
    { tag: "간접 응답", audio: "Do you know when the store closes?", a: "It closes at nine on weekdays.", opts: ["It closes at nine on weekdays.", "Yes, I know him well.", "No, I did not close it.", "For about two hours."], why: "간접 의문문에는 yes/no가 아니라 필요한 정보로 답합니다.", ko: "가게가 언제 닫는지 아세요? — 평일에는 9시에 닫아요." },
    { tag: "간접 응답", audio: "Could you tell me where I can park?", a: "The garage is behind the building.", opts: ["The garage is behind the building.", "Yes, I can tell you.", "No, I could not park.", "It took thirty minutes."], why: "Could you tell me 뒤에는 장소 정보로 답합니다.", ko: "어디에 주차할 수 있는지 알려 주시겠어요? — 차고는 건물 뒤에 있습니다." },
    { tag: "의문사 함정", audio: "Who is handling the client presentation?", a: "Ms. Nam from the sales team.", opts: ["Ms. Nam from the sales team.", "In the main hall.", "Yes, she is handling it.", "At half past one."], why: "Who에는 사람으로 답합니다.", ko: "고객 발표는 누가 담당하나요? — 영업팀 남 씨입니다." },
    { tag: "의문사 함정", audio: "What time does the workshop begin?", a: "At half past one.", opts: ["At half past one.", "In the training room.", "Ms. Han will lead it.", "About three hours."], why: "What time에는 시각으로 답합니다.", ko: "워크숍은 몇 시에 시작하나요? — 1시 30분입니다." },
    { tag: "부정 의문문", audio: "Didn't you order the supplies yesterday?", a: "Actually, I ordered them this morning.", opts: ["Actually, I ordered them this morning.", "Yes, the supply room is closed.", "No, the order was large.", "I will order more tables."], why: "부정 의문문에는 사실을 바로잡는 답이 자연스럽습니다.", ko: "어제 물품을 주문하지 않았나요? — 사실 오늘 아침에 주문했어요." },
    { tag: "부정 의문문", audio: "Isn't the flight at noon?", a: "No, it was moved to two.", opts: ["No, it was moved to two.", "Yes, the flight was long.", "At the ticket counter.", "About two hundred dollars."], why: "부정 의문문의 답은 사실 여부를 확인하며 No/Yes가 뒤집히지 않도록 주의합니다.", ko: "비행기가 정오 아닌가요? — 아니에요, 2시로 옮겨졌어요." },
    { tag: "제안·요청", audio: "Why don't we take a short break?", a: "That sounds like a good idea.", opts: ["That sounds like a good idea.", "Yes, I broke it.", "About ten minutes ago.", "The break room is upstairs."], why: "제안에는 수락·거절의 의사로 답하며 yes/no를 쓰지 않습니다.", ko: "잠깐 쉬는 게 어때요? — 좋은 생각이에요." },
    { tag: "제안·요청", audio: "Would you mind sending me the file?", a: "Not at all. I will send it now.", opts: ["Not at all. I will send it now.", "Yes, I really mind.", "No, the file is empty.", "It was sent by mail."], why: "Would you mind ~?에는 Not at all(괜찮습니다)로 답합니다.", ko: "파일을 보내 주시겠어요? — 물론이죠, 지금 보내 드릴게요." },
    { tag: "시제 함정", audio: "Have you finished the audit yet?", a: "I am still working on it.", opts: ["I am still working on it.", "Yes, I finished it last month.", "No, the auditor is here.", "It will be audited soon."], why: "현재완료 질문에는 진행 상태로 답할 수 있습니다.", ko: "감사를 끝내셨나요? — 아직 진행 중입니다." },
    { tag: "시제 함정", audio: "Were you able to meet the deadline?", a: "Yes, we submitted it early.", opts: ["Yes, we submitted it early.", "Yes, the line is long.", "No, the deadline was set.", "It takes two weeks."], why: "과거 시제 질문에는 과거 사실로 답합니다.", ko: "마감을 지킬 수 있었나요? — 네, 일찍 제출했어요." },
    { tag: "숫자 함정", audio: "The shipment arrives on the fifteenth, right?", a: "Actually, it was rescheduled to the thirtieth.", opts: ["Actually, it was rescheduled to the thirtieth.", "Yes, fifteen boxes arrived.", "No, the ship left the port.", "About fifty orders."], why: "fifteen(15)과 fifty(50), 15th와 30th의 발음 차이에 주의합니다.", ko: "배송이 15일에 도착하죠? — 사실 30일로 변경됐어요." },
    { tag: "숫자 함정", audio: "Is the office on the fourth floor?", a: "No, it is on the fourteenth floor.", opts: ["No, it is on the fourteenth floor.", "Yes, there are four offices.", "No, the elevator is broken.", "For about forty minutes."], why: "fourth(4th)와 fourteenth(14th)를 구분해야 합니다.", ko: "사무실이 4층인가요? — 아니요, 14층입니다." },
    // 실제 시험 Part 2 는 25문항입니다 — 함정 유형 25개로 맞춰 둡니다(17차 점검).
    { tag: "간접 응답", audio: "Do you know how long the repair will take?", a: "About three business days.", opts: ["About three business days.", "Yes, I know the repair shop.", "No, I did not take it.", "The printer is on the desk."], why: "how long 에는 기간으로 답합니다.", ko: "수리에 얼마나 걸리는지 아세요? — 영업일 기준 사흘 정도입니다." },
    { tag: "간접 응답", audio: "Could you tell me who I should contact about billing?", a: "Ms. Park in accounting can help you.", opts: ["Ms. Park in accounting can help you.", "Yes, I could contact them.", "No, the bill was paid.", "It was about thirty dollars."], why: "who 에는 담당자(사람)로 답합니다.", ko: "청구 관련해서 누구에게 연락해야 하는지 알려 주시겠어요? — 회계팀 박 씨가 도와줄 거예요." },
    { tag: "의문사 함정", audio: "Where will the training session be held?", a: "In the conference room on the second floor.", opts: ["In the conference room on the second floor.", "At nine in the morning.", "Ms. Choi will lead it.", "For about two hours."], why: "Where 에는 장소로 답합니다.", ko: "교육은 어디에서 하나요? — 2층 회의실입니다." },
    { tag: "의문사 함정", audio: "Why was the order delayed?", a: "Because the supplier ran out of stock.", opts: ["Because the supplier ran out of stock.", "It was delivered yesterday.", "At the loading dock.", "Yes, the order was large."], why: "Why 에는 because 로 이유를 답합니다.", ko: "주문이 왜 지연됐나요? — 공급업체의 재고가 떨어져서입니다." },
    { tag: "부정 의문문", audio: "Didn't the client confirm the schedule?", a: "He did, but he asked to move it an hour later.", opts: ["He did, but he asked to move it an hour later.", "No, the client is new.", "Yes, the schedule is long.", "At the front desk."], why: "사실을 확인·정정하는 답이 자연스럽습니다.", ko: "고객이 일정을 확정하지 않았나요? — 확정했는데 한 시간 뒤로 옮겨 달라고 했어요." },
    { tag: "부정 의문문", audio: "Aren't you attending the seminar on Friday?", a: "I am, but I will join online.", opts: ["I am, but I will join online.", "No, the seminar room is small.", "Yes, Friday is busy.", "About twenty people."], why: "Aren't you ~?에는 실제 참석 여부로 답하며 No/Yes 가 뒤집히지 않게 주의합니다.", ko: "금요일 세미나에 참석하지 않나요? — 참석하는데 온라인으로 들을 거예요." },
    { tag: "제안·요청", audio: "How about moving the meeting to Tuesday?", a: "Tuesday works for me.", opts: ["Tuesday works for me.", "Yes, the meeting room is booked.", "About an hour ago.", "I moved the table."], why: "How about ~? 제안에는 수락·거절의 의사로 답합니다.", ko: "회의를 화요일로 옮기는 게 어때요? — 저는 화요일 괜찮아요." },
    { tag: "제안·요청", audio: "Could you cover the front desk for a moment?", a: "Sure, I will be right there.", opts: ["Sure, I will be right there.", "No, the desk is new.", "The front door is locked.", "For about fifteen minutes."], why: "부탁에는 수락 여부로 답합니다.", ko: "잠깐 안내 데스크를 좀 봐 주시겠어요? — 네, 바로 갈게요." },
    { tag: "시제 함정", audio: "How long have you worked at the branch?", a: "For about five years.", opts: ["For about five years.", "I worked there yesterday.", "Yes, the branch is large.", "At the downtown office."], why: "현재완료 질문에는 기간(for + 기간)으로 답합니다.", ko: "지점에서 일하신 지 얼마나 되셨나요? — 5년 정도입니다." },
    { tag: "시제 함정", audio: "Will the new system be installed this week?", a: "It is scheduled for early next week.", opts: ["It is scheduled for early next week.", "Yes, the system was installed.", "No, the technician called.", "About two hundred users."], why: "미래 시제 질문에는 일정으로 답하며, 다른 시점을 말해 정정하기도 합니다.", ko: "새 시스템이 이번 주에 설치되나요? — 다음 주 초로 예정돼 있어요." },
    { tag: "숫자 함정", audio: "How many boxes should we load?", a: "Thirteen, not thirty.", opts: ["Thirteen, not thirty.", "About an hour.", "In the warehouse.", "Yes, the truck is here."], why: "thirteen(13)과 thirty(30)의 발음(-teen / -ty 강세)을 구분해야 합니다.", ko: "상자를 몇 개 실어야 하나요? — 30개가 아니라 13개입니다." },
    { tag: "숫자 함정", audio: "The discount is seventeen percent, isn't it?", a: "It is seventy percent off for members.", opts: ["It is seventy percent off for members.", "Yes, there are seventeen items.", "No, the discount ended.", "The store opens at seven."], why: "seventeen(17)과 seventy(70)를 구분해야 합니다.", ko: "할인이 17퍼센트죠? — 회원은 70퍼센트 할인입니다." },
    { tag: "우회 응답", audio: "Can you send me the sales report by tomorrow?", a: "The data will not be ready until Thursday.", opts: ["The data will not be ready until Thursday.", "Yes, the report is on the shelf.", "No, I did not sell it.", "It costs about ten dollars."], why: "거절을 돌려 말하는 우회 응답을 알아들어야 합니다(바로 No 라고 하지 않습니다).", ko: "내일까지 매출 보고서를 보내 주실 수 있나요? — 자료가 목요일에나 준비됩니다." }
  ],

  /* ============ 4. 동의어 치환(Paraphrase) ============ */
  paraphrase: [
    { tag: "동의어 치환", prompt: "The manager asked the team to 『expedite』 the delivery. — expedite와 의미가 가장 가까운 것은?", a: "speed up", opts: ["speed up", "put off", "review", "cancel"], why: "expedite = 신속히 처리하다 ≈ speed up" },
    { tag: "동의어 치환", prompt: "Please 『verify』 the account details before processing the payment. — verify와 의미가 가장 가까운 것은?", a: "confirm", opts: ["confirm", "change", "delay", "reject"], why: "verify = 사실 여부를 확인하다 ≈ confirm" },
    { tag: "동의어 치환", prompt: "The company decided to 『outsource』 its customer service. — outsource와 의미가 가장 가까운 것은?", a: "use an outside supplier", opts: ["use an outside supplier", "hire in-house staff", "reduce the budget", "close the department"], why: "outsource = 외부 업체에 위탁하다" },
    { tag: "동의어 치환", prompt: "The new policy is 『subject to』 approval by the board. — subject to와 의미가 가장 가까운 것은?", a: "dependent on", opts: ["dependent on", "free from", "in place of", "opposed to"], why: "be subject to = ~에 달려 있는, ~의 적용을 받는" },
    { tag: "동의어 치환", prompt: "Sales figures 『fluctuate』 depending on the season. — fluctuate와 의미가 가장 가까운 것은?", a: "rise and fall", opts: ["rise and fall", "stay steady", "drop sharply", "remain high"], why: "fluctuate = 오르내리며 변동하다" },
    { tag: "동의어 치환", prompt: "The supervisor will 『oversee』 the renovation project. — oversee와 의미가 가장 가까운 것은?", a: "supervise", opts: ["supervise", "postpone", "participate in", "finance"], why: "oversee = 감독하다 ≈ supervise" },
    { tag: "동의어 치환", prompt: "Employees are 『eligible for』 a discount on company products. — eligible for와 의미가 가장 가까운 것은?", a: "qualified for", opts: ["qualified for", "excluded from", "familiar with", "responsible for"], why: "be eligible for = ~을 받을 자격이 있는" },
    { tag: "동의어 치환", prompt: "The report 『highlights』 the need for better training. — highlight와 의미가 가장 가까운 것은?", a: "emphasizes", opts: ["emphasizes", "hides", "repeats", "measures"], why: "highlight = 강조하다 ≈ emphasize" },
    { tag: "동의어 치환", prompt: "The company plans to 『launch』 a new product next month. — launch와 의미가 가장 가까운 것은?", a: "introduce", opts: ["introduce", "withdraw", "repair", "recall"], why: "launch = 출시하다 ≈ introduce" },
    { tag: "동의어 치환", prompt: "All staff must 『comply with』 the safety regulations. — comply with와 의미가 가장 가까운 것은?", a: "follow", opts: ["follow", "ignore", "revise", "question"], why: "comply with = 준수하다 ≈ follow" },
    { tag: "동의어 치환", prompt: "The two sides finally 『reached an agreement』 on the price. — reached an agreement와 의미가 가장 가까운 것은?", a: "came to a deal", opts: ["came to a deal", "broke off talks", "raised a question", "changed the subject"], why: "reach an agreement = 합의에 이르다" },
    { tag: "동의어 치환", prompt: "The team was able to 『meet the deadline』 despite the delays. — meet the deadline과 의미가 가장 가까운 것은?", a: "finish on time", opts: ["finish on time", "miss the target", "extend the schedule", "start earlier"], why: "meet the deadline = 마감을 지키다" },
    { tag: "동의어 치환", prompt: "The results 『exceeded』 our expectations. — exceeded와 의미가 가장 가까운 것은?", a: "went beyond", opts: ["went beyond", "fell short of", "matched exactly", "were ignored by"], why: "exceed = 초과하다, 뛰어넘다" },
    { tag: "동의어 치환", prompt: "Please 『submit』 your application by Friday. — submit과 의미가 가장 가까운 것은?", a: "hand in", opts: ["hand in", "take back", "throw away", "put off"], why: "submit = 제출하다 ≈ hand in" },
    { tag: "동의어 치환", prompt: "The company will 『absorb』 the shipping costs. — absorb와 의미가 가장 가까운 것은?", a: "cover", opts: ["cover", "increase", "avoid", "postpone"], why: "absorb costs = 비용을 부담하다 ≈ cover" },
    { tag: "동의어 치환", prompt: "The manager 『turned down』 the proposal. — turned down과 의미가 가장 가까운 것은?", a: "rejected", opts: ["rejected", "accepted", "reviewed", "revised"], why: "turn down = 거절하다 ≈ reject" },
    { tag: "동의어 치환", prompt: "We need to 『cut back on』 unnecessary spending. — cut back on과 의미가 가장 가까운 것은?", a: "reduce", opts: ["reduce", "increase", "approve", "postpone"], why: "cut back on = 줄이다 ≈ reduce" },
    { tag: "동의어 치환", prompt: "The supervisor will 『look into』 the customer's complaint. — look into과 의미가 가장 가까운 것은?", a: "investigate", opts: ["investigate", "ignore", "confirm", "cancel"], why: "look into = 조사하다 ≈ investigate" },
    { tag: "동의어 치환", prompt: "The firm plans to 『take over』 a smaller competitor. — take over와 의미가 가장 가까운 것은?", a: "acquire", opts: ["acquire", "sell off", "compete with", "shut down"], why: "take over = 인수하다 ≈ acquire" },
    { tag: "동의어 치환", prompt: "Attendance at the workshop is 『mandatory』 for new hires. — mandatory와 의미가 가장 가까운 것은?", a: "required", opts: ["required", "optional", "recommended", "unusual"], why: "mandatory = 의무적인 ≈ required" },
    { tag: "동의어 치환", prompt: "The instructions are very 『concise』. — concise와 의미가 가장 가까운 것은?", a: "brief and clear", opts: ["brief and clear", "long and detailed", "difficult to read", "out of date"], why: "concise = 간결한" },
    { tag: "동의어 치환", prompt: "The company offers 『comprehensive』 training for all employees. — comprehensive와 의미가 가장 가까운 것은?", a: "thorough", opts: ["thorough", "limited", "temporary", "optional"], why: "comprehensive = 포괄적인, 철저한" },
    { tag: "동의어 치환", prompt: "The launch date is 『tentative』. — tentative와 의미가 가장 가까운 것은?", a: "not yet final", opts: ["not yet final", "already fixed", "delayed", "secret"], why: "tentative = 잠정적인" },
    { tag: "동의어 치환", prompt: "The two departments will 『collaborate』 on the campaign. — collaborate와 의미가 가장 가까운 것은?", a: "work together", opts: ["work together", "compete", "merge fully", "split up"], why: "collaborate = 협업하다 ≈ work together" },
    { tag: "동의어 치환", prompt: "The store will 『waive』 the delivery fee for members. — waive와 의미가 가장 가까운 것은?", a: "give up", opts: ["give up", "raise", "double", "delay"], why: "waive = (권리·비용을) 면제하다 ≈ give up" },
    { tag: "동의어 치환", prompt: "Please 『retain』 a copy of the receipt. — retain과 의미가 가장 가까운 것은?", a: "keep", opts: ["keep", "throw away", "shred", "mail"], why: "retain = 보유하다 ≈ keep" },
    { tag: "동의어 치환", prompt: "The manager will 『allocate』 more staff to the project. — allocate와 의미가 가장 가까운 것은?", a: "assign", opts: ["assign", "remove", "borrow", "train"], why: "allocate = 배분·할당하다 ≈ assign" },
    { tag: "동의어 치환", prompt: "The company plans to 『diversify』 its product line. — diversify와 의미가 가장 가까운 것은?", a: "add variety to", opts: ["add variety to", "reduce the size of", "copy exactly", "cancel"], why: "diversify = 다양화하다" },
    { tag: "동의어 치환", prompt: "Attendance is 『optional』 for part-time staff. — optional과 의미가 가장 가까운 것은?", a: "not required", opts: ["not required", "mandatory", "forbidden", "recommended only to managers"], why: "optional = 선택 사항인" },
    { tag: "동의어 치환", prompt: "The shipment was 『delayed』 by a customs inspection. — delayed와 의미가 가장 가까운 것은?", a: "held up", opts: ["held up", "sped up", "called off", "paid for"], why: "delay = 지연시키다 ≈ hold up" },
    { tag: "동의어 치환", prompt: "We must 『adhere to』 the deadline set by the client. — adhere to와 의미가 가장 가까운 것은?", a: "follow", opts: ["follow", "ignore", "extend", "question"], why: "adhere to = (규칙·기한을) 준수하다 ≈ follow" },
    { tag: "동의어 치환", prompt: "The new branch will 『open』 in the spring. — 이 문장을 바꿔 쓴 것으로 가장 가까운 것은?", a: "will begin operating", opts: ["will begin operating", "will be demolished", "will stop hiring", "will be relocated"], why: "open a branch = 영업을 시작하다 ≈ begin operating" },
    { tag: "동의어 치환", prompt: "Please 『outline』 the main points of the proposal. — outline과 의미가 가장 가까운 것은?", a: "summarize", opts: ["summarize", "expand in detail", "delete", "translate"], why: "outline = 개요를 설명하다 ≈ summarize" },
    { tag: "동의어 치환", prompt: "The manager 『praised』 the team for finishing early. — praised와 의미가 가장 가까운 것은?", a: "complimented", opts: ["complimented", "criticized", "ignored", "replaced"], why: "praise = 칭찬하다 ≈ compliment" },
    { tag: "동의어 치환", prompt: "The price is 『negotiable』 for large orders. — negotiable과 의미가 가장 가까운 것은?", a: "can be discussed", opts: ["can be discussed", "is fixed forever", "is already discounted", "must be paid in cash"], why: "negotiable = 협상 가능한" },
    { tag: "동의어 치환", prompt: "The team 『exceeded』 the sales target by 12 percent. — exceeded와 의미가 가장 가까운 것은?", a: "went over", opts: ["went over", "fell below", "matched exactly", "postponed"], why: "exceed = 초과하다 ≈ go over" },
    { tag: "동의어 치환", prompt: "Please 『forward』 the email to the accounting team. — forward와 의미가 가장 가까운 것은?", a: "send on", opts: ["send on", "delete", "print", "archive"], why: "forward = 전달하다 ≈ send on" },
    { tag: "동의어 치환", prompt: "The store will 『remain open』 during the renovation. — remain open과 의미가 가장 가까운 것은?", a: "stay in business", opts: ["stay in business", "close temporarily", "move elsewhere", "change owners"], why: "remain open = 계속 영업하다 ≈ stay in business" },
    { tag: "동의어 치환", prompt: "The supervisor will 『follow up on』 the complaint. — follow up on과 의미가 가장 가까운 것은?", a: "check on", opts: ["check on", "forget about", "pass on", "write off"], why: "follow up on = 후속 조치하다 ≈ check on" },
    { tag: "동의어 치환", prompt: "The city will 『implement』 the new traffic rules in March. — implement와 의미가 가장 가까운 것은?", a: "put into practice", opts: ["put into practice", "cancel", "review carefully", "delay indefinitely"], why: "implement = 시행하다 ≈ put into practice" },
    { tag: "동의어 치환", prompt: "Please 『finalize』 the agenda before the meeting. — finalize와 의미가 가장 가까운 것은?", a: "complete", opts: ["complete", "postpone", "announce", "shorten"], why: "finalize = 마무리하다 ≈ complete" },
    { tag: "동의어 치환", prompt: "The team must 『resolve』 the technical issue today. — resolve와 의미가 가장 가까운 것은?", a: "settle", opts: ["settle", "report", "repeat", "ignore"], why: "resolve = 해결하다 ≈ settle" },
    { tag: "동의어 치환", prompt: "The company will 『relocate』 its headquarters to Busan. — relocate와 의미가 가장 가까운 것은?", a: "move", opts: ["move", "close", "expand", "sell"], why: "relocate = 이전하다 ≈ move" },
    { tag: "동의어 치환", prompt: "The new software will 『streamline』 the approval process. — streamline와 의미가 가장 가까운 것은?", a: "make more efficient", opts: ["make more efficient", "make more complicated", "replace entirely", "delay"], why: "streamline = 간소화하다 ≈ make more efficient" },
    { tag: "동의어 치환", prompt: "The manager 『acknowledged』 the mistake in the report. — acknowledged와 의미가 가장 가까운 것은?", a: "admitted", opts: ["admitted", "denied", "repeated", "forgot"], why: "acknowledge = 인정하다 ≈ admit" },
    { tag: "동의어 치환", prompt: "The board will 『authorize』 the additional spending. — authorize와 의미가 가장 가까운 것은?", a: "approve", opts: ["approve", "reject", "question", "record"], why: "authorize = 승인하다 ≈ approve" },
    { tag: "동의어 치환", prompt: "The company will 『consolidate』 its three offices. — consolidate와 의미가 가장 가까운 것은?", a: "combine", opts: ["combine", "separate", "enlarge", "sell"], why: "consolidate = 통합하다 ≈ combine" },
    { tag: "동의어 치환", prompt: "Please 『prioritize』 the tasks that affect customers. — prioritize와 의미가 가장 가까운 것은?", a: "rank in order of importance", opts: ["rank in order of importance", "complete all at once", "postpone", "delegate"], why: "prioritize = 우선순위를 정하다" },
    { tag: "동의어 치환", prompt: "The report should 『incorporate』 the latest sales data. — incorporate와 의미가 가장 가까운 것은?", a: "include", opts: ["include", "remove", "duplicate", "hide"], why: "incorporate = 포함하다 ≈ include" },
    { tag: "동의어 치환", prompt: "Please 『minimize』 the risk of data loss. — minimize와 의미가 가장 가까운 것은?", a: "reduce", opts: ["reduce", "increase", "accept", "measure"], why: "minimize = 최소화하다 ≈ reduce" },
    { tag: "동의어 치환", prompt: "The department will 『designate』 a new contact person. — designate와 의미가 가장 가까운 것은?", a: "appoint", opts: ["appoint", "dismiss", "interview", "replace"], why: "designate = 지정하다 ≈ appoint" },
    { tag: "동의어 치환", prompt: "The company will 『dispatch』 the order on Monday. — dispatch와 의미가 가장 가까운 것은?", a: "send out", opts: ["send out", "hold back", "return", "inspect"], why: "dispatch = 발송하다 ≈ send out" },
    { tag: "동의어 치환", prompt: "The new policy will 『enhance』 employee satisfaction. — enhance와 의미가 가장 가까운 것은?", a: "improve", opts: ["improve", "damage", "measure", "delay"], why: "enhance = 향상시키다 ≈ improve" },
    { tag: "동의어 치환", prompt: "The technician will 『inspect』 the equipment tomorrow. — inspect와 의미가 가장 가까운 것은?", a: "examine", opts: ["examine", "install", "replace", "purchase"], why: "inspect = 점검하다 ≈ examine" },
    { tag: "동의어 치환", prompt: "The two systems will be 『integrated』 next month. — integrated와 의미가 가장 가까운 것은?", a: "combined", opts: ["combined", "separated", "deleted", "postponed"], why: "integrate = 통합하다 ≈ combine" },
    { tag: "동의어 치환", prompt: "The manager will 『modify』 the schedule if needed. — modify와 의미가 가장 가까운 것은?", a: "adjust", opts: ["adjust", "keep as is", "cancel", "publish"], why: "modify = 수정하다 ≈ adjust" },
    { tag: "동의어 치환", prompt: "The supplier will 『replenish』 the stock by Friday. — replenish와 의미가 가장 가까운 것은?", a: "fill up again", opts: ["fill up again", "empty out", "count", "discard"], why: "replenish = 보충하다" },
    { tag: "동의어 치환", prompt: "Please 『specify』 the delivery address clearly. — specify와 의미가 가장 가까운 것은?", a: "state exactly", opts: ["state exactly", "leave blank", "approximate", "repeat"], why: "specify = 명시하다 ≈ state exactly" },
    { tag: "동의어 치환", prompt: "The company decided to 『utilize』 the vacant office space. — utilize와 의미가 가장 가까운 것은?", a: "make use of", opts: ["make use of", "sell off", "abandon", "renovate"], why: "utilize = 활용하다 ≈ make use of" },
    { tag: "동의어 치환", prompt: "The company will 『implement』 the new safety rules next month. — implement와 의미가 가장 가까운 것은?", a: "carry out", opts: ["carry out", "give up", "talk about", "put off"], why: "implement = 시행하다 ≈ carry out" },
    { tag: "동의어 치환", prompt: "The airline had to 『postpone』 the flight because of the storm. — postpone와 의미가 가장 가까운 것은?", a: "put off", opts: ["put off", "bring forward", "speed up", "board"], why: "postpone = 연기하다 ≈ put off" },
    { tag: "동의어 치환", prompt: "Ms. Lee will 『arrange』 a meeting with the client. — arrange와 의미가 가장 가까운 것은?", a: "organize", opts: ["organize", "attend", "cancel", "record"], why: "arrange = 준비하다, 주선하다 ≈ organize" },
    { tag: "동의어 치환", prompt: "All managers are expected to 『attend』 the annual conference. — attend와 의미가 가장 가까운 것은?", a: "be present at", opts: ["be present at", "miss", "host", "postpone"], why: "attend = 참석하다 ≈ be present at" },
    { tag: "동의어 치환", prompt: "We will 『notify』 customers as soon as the item ships. — notify와 의미가 가장 가까운 것은?", a: "inform", opts: ["inform", "charge", "question", "delay"], why: "notify = 알리다, 통보하다 ≈ inform" },
    { tag: "동의어 치환", prompt: "The factory will 『cease』 production at the end of the year. — cease와 의미가 가장 가까운 것은?", a: "stop", opts: ["stop", "expand", "increase", "delay"], why: "cease = 중단하다 ≈ stop" },
    { tag: "동의어 치환", prompt: "The head office will 『allocate』 more funds to the marketing team. — allocate와 의미가 가장 가까운 것은?", a: "distribute", opts: ["distribute", "withhold", "borrow", "reduce"], why: "allocate = 배분하다 ≈ distribute" },
    { tag: "동의어 치환", prompt: "The company will 『reimburse』 your travel expenses. — reimburse와 의미가 가장 가까운 것은?", a: "pay back", opts: ["pay back", "charge extra", "cut down", "invest"], why: "reimburse = 상환하다 ≈ pay back" },
    { tag: "동의어 치환", prompt: "The lease will 『terminate』 in December. — terminate와 의미가 가장 가까운 것은?", a: "end", opts: ["end", "renew", "extend", "approve"], why: "terminate = 종료하다 ≈ end" },
    { tag: "동의어 치환", prompt: "The renovation will 『enhance』 the value of the property. — enhance와 의미가 가장 가까운 것은?", a: "improve", opts: ["improve", "weaken", "ignore", "copy"], why: "enhance = 향상시키다 ≈ improve" },
    { tag: "동의어 치환", prompt: "The department will 『relocate』 to the new building in May. — relocate와 의미가 가장 가까운 것은?", a: "move to a new place", opts: ["move to a new place", "close down", "hire staff", "expand abroad"], why: "relocate = 이전하다, 옮기다" },
    { tag: "동의어 치환", prompt: "The building rules 『prohibit』 smoking in all areas. — prohibit와 의미가 가장 가까운 것은?", a: "ban", opts: ["ban", "permit", "recommend", "ignore"], why: "prohibit = 금지하다 ≈ ban" },
    { tag: "동의어 치환", prompt: "We 『anticipate』 a rise in demand next quarter. — anticipate와 의미가 가장 가까운 것은?", a: "expect", opts: ["expect", "doubt", "forget", "measure"], why: "anticipate = 예상하다 ≈ expect" },
    { tag: "동의어 치환", prompt: "The attached data is 『pertinent』 to your request. — pertinent와 의미가 가장 가까운 것은?", a: "relevant", opts: ["relevant", "unrelated", "optional", "lengthy"], why: "pertinent = 관련 있는, 적절한 ≈ relevant" },
    { tag: "동의어 치환", prompt: "Fresh vegetables were 『scarce』 during the storm. — scarce와 의미가 가장 가까운 것은?", a: "in short supply", opts: ["in short supply", "plentiful", "expensive", "durable"], why: "scarce = 부족한 ≈ in short supply" },
    { tag: "동의어 치환", prompt: "Donations were 『abundant』 this year. — abundant와 의미가 가장 가까운 것은?", a: "plentiful", opts: ["plentiful", "rare", "costly", "temporary"], why: "abundant = 풍부한 ≈ plentiful" },
    { tag: "동의어 치환", prompt: "The current software is now 『obsolete』. — obsolete와 의미가 가장 가까운 것은?", a: "out of date", opts: ["out of date", "brand new", "in demand", "affordable"], why: "obsolete = 구식의, 쓰이지 않는 ≈ out of date" },
    { tag: "동의어 치환", prompt: "Please check whether the plan is 『feasible』. — feasible와 의미가 가장 가까운 것은?", a: "possible to do", opts: ["possible to do", "too costly", "already done", "hard to explain"], why: "feasible = 실행 가능한" },
    { tag: "동의어 치환", prompt: "The decision was 『unanimous』. — unanimous와 의미가 가장 가까운 것은?", a: "agreed by everyone", opts: ["agreed by everyone", "divided", "postponed", "kept secret"], why: "unanimous = 만장일치의" },
    { tag: "동의어 치환", prompt: "The 『preliminary』 results look promising. — preliminary와 의미가 가장 가까운 것은?", a: "initial", opts: ["initial", "final", "detailed", "optional"], why: "preliminary = 예비의, 첫 단계의 ≈ initial" },
    { tag: "동의어 치환", prompt: "The 『subsequent』 shipments arrived on schedule. — subsequent와 의미가 가장 가까운 것은?", a: "following", opts: ["following", "previous", "unrelated", "occasional"], why: "subsequent = 이후의, 뒤따르는 ≈ following" },
    { tag: "동의어 치환", prompt: "The parking lot is 『adjacent』 to the main office. — adjacent와 의미가 가장 가까운 것은?", a: "next to", opts: ["next to", "far from", "inside", "above"], why: "adjacent to = ~에 인접한" },
    { tag: "동의어 치환", prompt: "Members receive 『exclusive』 discounts. — exclusive와 의미가 가장 가까운 것은?", a: "limited to certain people", opts: ["limited to certain people", "free for everyone", "available online", "open daily"], why: "exclusive = 특정 대상만을 위한, 독점적인" },
    { tag: "동의어 치환", prompt: "We received a 『prompt』 reply from the supplier. — prompt와 의미가 가장 가까운 것은?", a: "quick", opts: ["quick", "delayed", "careless", "lengthy"], why: "prompt = 신속한" },
    { tag: "동의어 치환", prompt: "The new intern is very 『diligent』. — diligent와 의미가 가장 가까운 것은?", a: "hardworking", opts: ["hardworking", "careless", "inexperienced", "absent"], why: "diligent = 성실한, 근면한 ≈ hardworking" },
    { tag: "동의어 치환", prompt: "She is a 『versatile』 employee who can handle several roles. — versatile와 의미가 가장 가까운 것은?", a: "able to do many things", opts: ["able to do many things", "highly specialized", "poorly trained", "newly hired"], why: "versatile = 다재다능한" },
    { tag: "동의어 치환", prompt: "We 『look forward to』 working with your team. — look forward to와 의미가 가장 가까운 것은?", a: "anticipate with pleasure", opts: ["anticipate with pleasure", "forget about", "complain about", "put off"], why: "look forward to = ~을 기대하다" },
    { tag: "동의어 치환", prompt: "The store 『ran out of』 the advertised item. — ran out of와 의미가 가장 가까운 것은?", a: "used up", opts: ["used up", "stocked up on", "paid for", "counted on"], why: "run out of = 다 써 버리다, 떨어지다" },
    { tag: "동의어 치환", prompt: "The organizers had to 『call off』 the outdoor event. — call off와 의미가 가장 가까운 것은?", a: "cancel", opts: ["cancel", "confirm", "attend", "extend"], why: "call off = 취소하다 ≈ cancel" },
    { tag: "동의어 치환", prompt: "Please 『go over』 the contract before signing. — go over와 의미가 가장 가까운 것은?", a: "review", opts: ["review", "ignore", "translate", "shorten"], why: "go over = 검토하다 ≈ review" },
    { tag: "동의어 치환", prompt: "The team managed to 『accomplish』 the sales goal ahead of schedule. — accomplish와 의미가 가장 가까운 것은?", a: "achieve", opts: ["achieve", "abandon", "postpone", "measure"], why: "accomplish = 달성하다 ≈ achieve" },
    { tag: "동의어 치환", prompt: "We may need to 『adjust』 the delivery date for the Seoul order. — adjust와 의미가 가장 가까운 것은?", a: "modify", opts: ["modify", "remove", "copy", "reject"], why: "adjust = 조정하다 ≈ modify" },
    { tag: "동의어 치환", prompt: "Could you 『clarify』 the payment terms in the contract? — clarify와 의미가 가장 가까운 것은?", a: "make clear", opts: ["make clear", "complicate", "translate", "shorten"], why: "clarify = 명확히 하다" },
    { tag: "동의어 치환", prompt: "The event planner will 『coordinate』 the schedules of all speakers. — coordinate와 의미가 가장 가까운 것은?", a: "organize", opts: ["organize", "cancel", "attend", "record"], why: "coordinate = 조정하다, 조직하다 ≈ organize" },
    { tag: "동의어 치환", prompt: "The company plans to 『establish』 a new research center in Daejeon. — establish와 의미가 가장 가까운 것은?", a: "set up", opts: ["set up", "close down", "rent out", "look into"], why: "establish = 설립하다 ≈ set up" },
    { tag: "동의어 치환", prompt: "The retailer will 『expand』 its online store next year. — expand와 의미가 가장 가까운 것은?", a: "enlarge", opts: ["enlarge", "reduce", "divide", "repair"], why: "expand = 확장하다 ≈ enlarge" },
    { tag: "동의어 치환", prompt: "Do not 『hesitate』 to contact us if you need assistance. — hesitate와 의미가 가장 가까운 것은?", a: "be reluctant", opts: ["be reluctant", "decide quickly", "agree fully", "arrive early"], why: "hesitate = 주저하다" },
    { tag: "동의어 치환", prompt: "We 『guarantee』 that all parts will arrive within five days. — guarantee와 의미가 가장 가까운 것은?", a: "ensure", opts: ["ensure", "doubt", "risk", "delay"], why: "guarantee = 보증하다 ≈ ensure" },
    { tag: "동의어 치환", prompt: "The new layout is a clear 『improvement』 over the old design. — improvement와 의미가 가장 가까운 것은?", a: "enhancement", opts: ["enhancement", "decline", "delay", "replacement"], why: "improvement = 개선 ≈ enhancement" },
    { tag: "동의어 치환", prompt: "The conference room can 『accommodate』 up to sixty guests. — accommodate와 의미가 가장 가까운 것은?", a: "make room for", opts: ["make room for", "turn away", "charge for", "close off"], why: "accommodate = 수용하다" },
    { tag: "동의어 치환", prompt: "A senior engineer will 『accompany』 the client on the factory tour. — accompany와 의미가 가장 가까운 것은?", a: "go along with", opts: ["go along with", "leave behind", "pay for", "write to"], why: "accompany = 동반하다" },
    { tag: "동의어 치환", prompt: "Unused inventory will 『accumulate』 if we do not adjust production. — accumulate와 의미가 가장 가까운 것은?", a: "build up", opts: ["build up", "use up", "give away", "count again"], why: "accumulate = 축적하다 ≈ build up" },
    { tag: "동의어 치환", prompt: "Please make sure there is 『adequate』 storage for the new stock. — adequate와 의미가 가장 가까운 것은?", a: "enough", opts: ["enough", "excessive", "unclear", "temporary"], why: "adequate = 충분한 ≈ enough" },
    { tag: "동의어 치환", prompt: "Several department heads 『advocate』 a shorter approval process. — advocate와 의미가 가장 가까운 것은?", a: "support", opts: ["support", "oppose", "ignore", "delay"], why: "advocate = 지지하다 ≈ support" },
    { tag: "동의어 치환", prompt: "Workers will 『assemble』 the units on the second floor. — assemble와 의미가 가장 가까운 것은?", a: "put together", opts: ["put together", "take apart", "sell out", "wear out"], why: "assemble = 조립하다, 모으다" },
    { tag: "동의어 치환", prompt: "The safety committee will 『comprise』 eight members from three plants. — comprise와 의미가 가장 가까운 것은?", a: "consist of", opts: ["consist of", "differ from", "depend on", "result in"], why: "comprise = 구성하다" },
    { tag: "동의어 치환", prompt: "Please 『confine』 your comments to the items on the agenda. — confine와 의미가 가장 가까운 것은?", a: "limit", opts: ["limit", "extend", "announce", "repeat"], why: "confine = 제한하다 ≈ limit" },
    { tag: "동의어 치환", prompt: "The factory has reached its target for the third 『consecutive』 quarter. — consecutive와 의미가 가장 가까운 것은?", a: "in a row", opts: ["in a row", "occasionally", "in advance", "at random"], why: "consecutive = 연속적인" },
    { tag: "동의어 치환", prompt: "Every member is expected to 『contribute』 to the discussion. — contribute와 의미가 가장 가까운 것은?", a: "add to", opts: ["add to", "take away", "ask for", "hold back"], why: "contribute to = 기여하다 ≈ add to" },
    { tag: "동의어 치환", prompt: "Ms. Yoon will 『dedicate』 the next month to the audit. — dedicate와 의미가 가장 가까운 것은?", a: "devote", opts: ["devote", "abandon", "borrow", "delay"], why: "dedicate = 헌신하다 ≈ devote" },
    { tag: "동의어 치환", prompt: "Managers should 『delegate』 routine tasks to their assistants. — delegate와 의미가 가장 가까운 것은?", a: "assign", opts: ["assign", "complete", "postpone", "inspect"], why: "delegate = 위임하다 ≈ assign" },
    { tag: "동의어 치환", prompt: "The vendor will 『demonstrate』 the new scanner before delivery. — demonstrate와 의미가 가장 가까운 것은?", a: "show", opts: ["show", "hide", "copy", "question"], why: "demonstrate = 시연하다 ≈ show" },
    { tag: "동의어 치환", prompt: "Most of our revenue will 『derive』 from overseas sales this year. — derive와 의미가 가장 가까운 것은?", a: "obtain", opts: ["obtain", "lose", "return", "estimate"], why: "derive = 얻다, 유래하다" },
    { tag: "동의어 치환", prompt: "Service quality will 『deteriorate』 if we cut the staff further. — deteriorate와 의미가 가장 가까운 것은?", a: "get worse", opts: ["get worse", "improve steadily", "stay the same", "spread widely"], why: "deteriorate = 악화되다" },
    { tag: "동의어 치환", prompt: "The auditor found a 『discrepancy』 between the two invoices. — discrepancy와 의미가 가장 가까운 것은?", a: "inconsistency", opts: ["inconsistency", "increase", "shortage", "approval"], why: "discrepancy = 불일치" },
    { tag: "동의어 치환", prompt: "The new system will 『eliminate』 most manual entries. — eliminate와 의미가 가장 가까운 것은?", a: "remove", opts: ["remove", "add", "delay", "measure"], why: "eliminate = 제거하다 ≈ remove" },
    { tag: "동의어 치환", prompt: "This coupon will 『entitle』 you to a free dessert. — entitle와 의미가 가장 가까운 것은?", a: "give the right", opts: ["give the right", "take away", "charge for", "ask about"], why: "entitle = 자격을 주다" },
    { tag: "동의어 치환", prompt: "Recent figures 『indicate』 a steady rise in membership. — indicate와 의미가 가장 가까운 것은?", a: "suggest", opts: ["suggest", "deny", "hide", "repeat"], why: "indicate = 나타내다 ≈ suggest" },
    { tag: "동의어 치환", prompt: "The firm will 『initiate』 the recall next Monday. — initiate와 의미가 가장 가까운 것은?", a: "begin", opts: ["begin", "finish", "cancel", "review"], why: "initiate = 시작하다 ≈ begin" },
    { tag: "동의어 치환", prompt: "The training program is designed to 『maximize』 employee performance. — maximize와 의미가 가장 가까운 것은?", a: "get the most from", opts: ["get the most from", "reduce sharply", "give away", "measure again"], why: "maximize = 최대화하다" },
    { tag: "동의어 치환", prompt: "The notice reminded members that two payments are still 『outstanding』. — outstanding와 의미가 가장 가까운 것은?", a: "unpaid", opts: ["unpaid", "completed", "discounted", "optional"], why: "outstanding = 미지불의" },
    { tag: "동의어 치환", prompt: "Ms. Han is a 『prominent』 figure in the logistics industry. — prominent와 의미가 가장 가까운 것은?", a: "well known", opts: ["well known", "unknown", "temporary", "distant"], why: "prominent = 저명한" },
    { tag: "동의어 치환", prompt: "Operations will 『resume』 as soon as the inspection ends. — resume와 의미가 가장 가까운 것은?", a: "start again", opts: ["start again", "stop for good", "slow down", "take over"], why: "resume = 재개하다" },
    { tag: "동의어 치환", prompt: "The foundation will 『solicit』 donations from local businesses. — solicit와 의미가 가장 가까운 것은?", a: "ask for", opts: ["ask for", "refuse", "offer", "record"], why: "solicit = 요청하다, 구하다" },
    { tag: "동의어 치환", prompt: "The east elevator is 『temporarily』 out of service. — temporarily와 의미가 가장 가까운 것은?", a: "for a short time", opts: ["for a short time", "permanently", "every day", "in secret"], why: "temporarily = 일시적으로" },
    { tag: "동의어 치환", prompt: "Clear labels are 『vital』 for accurate shipping. — vital과 의미가 가장 가까운 것은?", a: "essential", opts: ["essential", "optional", "risky", "costly"], why: "vital = 필수적인 ≈ essential" },
    { tag: "동의어 치환", prompt: "The new branch is 『accessible』 by subway and bus. — accessible과 의미가 가장 가까운 것은?", a: "easy to reach", opts: ["easy to reach", "closed to the public", "expensive to rent", "far from the city"], why: "accessible = 접근하기 쉬운" },
    { tag: "동의어 치환", prompt: "Please suggest an 『alternative』 date for the workshop. — alternative와 의미가 가장 가까운 것은?", a: "other possible", opts: ["other possible", "final", "earlier", "secret"], why: "alternative = 대안의, 다른" },
    { tag: "동의어 치환", prompt: "It became 『apparent』 that the shipment would arrive late. — apparent와 의미가 가장 가까운 것은?", a: "obvious", opts: ["obvious", "doubtful", "temporary", "costly"], why: "apparent = 명백한 ≈ obvious" },
    { tag: "동의어 치환", prompt: "The supervisor will 『assign』 each trainee a mentor. — assign와 의미가 가장 가까운 것은?", a: "give", opts: ["give", "remove", "sell", "postpone"], why: "assign = 배정하다 ≈ give" },
    { tag: "동의어 치환", prompt: "We should not 『assume』 that demand will stay the same. — assume와 의미가 가장 가까운 것은?", a: "suppose", opts: ["suppose", "prove", "deny", "measure"], why: "assume = 가정하다 ≈ suppose" },
    { tag: "동의어 치환", prompt: "The branch was able to 『attain』 its annual target. — attain와 의미가 가장 가까운 것은?", a: "reach", opts: ["reach", "miss", "lower", "report"], why: "attain = 달성하다, 도달하다 ≈ reach" },
    { tag: "동의어 치환", prompt: "The plant will 『automate』 the packaging line next year. — automate와 의미가 가장 가까운 것은?", a: "operate by machine", opts: ["operate by machine", "run by hand", "close down", "expand quickly"], why: "automate = 자동화하다" },
    { tag: "동의어 치환", prompt: "Complimentary 『beverages』 will be served at the reception. — beverage와 의미가 가장 가까운 것은?", a: "drinks", opts: ["drinks", "snacks", "tickets", "seats"], why: "beverage = 음료" },
    { tag: "동의어 치환", prompt: "Customers who buy in 『bulk』 receive a lower unit price. — in bulk와 의미가 가장 가까운 것은?", a: "in large amounts", opts: ["in large amounts", "in small amounts", "with cash only", "through the website"], why: "in bulk = 대량으로" },
    { tag: "동의어 치환", prompt: "A 『cancellation』 fee applies within 24 hours of booking. — cancellation과 의미가 가장 가까운 것은?", a: "canceling the booking", opts: ["canceling the booking", "changing the room", "paying in full", "extending the stay"], why: "cancellation = 예약 취소" },
    { tag: "동의어 치환", prompt: "Ms. Lim is 『capable』 of managing the whole project alone. — capable of와 의미가 가장 가까운 것은?", a: "able to", opts: ["able to", "eager to", "likely to", "careful to"], why: "be capable of = ~할 수 있는 ≈ be able to" },
    { tag: "동의어 치환", prompt: "The proposal needs a more 『coherent』 structure. — coherent와 의미가 가장 가까운 것은?", a: "logical", opts: ["logical", "colorful", "expensive", "lengthy"], why: "coherent = 논리 정연한" },
    { tag: "동의어 치환", prompt: "The award ceremony will 『commence』 at four in the afternoon. — commence와 의미가 가장 가까운 것은?", a: "begin", opts: ["begin", "end", "continue", "pause"], why: "commence = 시작하다 ≈ begin" },
    { tag: "동의어 치환", prompt: "The airline will 『compensate』 passengers for the long delay. — compensate와 의미가 가장 가까운 것은?", a: "pay back", opts: ["pay back", "charge extra", "notify", "apologize to"], why: "compensate = 보상하다 ≈ pay back" },
    { tag: "동의어 치환", prompt: "We are looking for a 『competent』 accountant for the branch. — competent와 의미가 가장 가까운 것은?", a: "skilled", opts: ["skilled", "friendly", "young", "talkative"], why: "competent = 유능한 ≈ skilled" },
    { tag: "동의어 치환", prompt: "Please 『compile』 the survey results before Friday. — compile과 의미가 가장 가까운 것은?", a: "gather together", opts: ["gather together", "throw away", "translate", "publish"], why: "compile = 모아 정리하다" },
    { tag: "동의어 치환", prompt: "Two 『concurrent』 sessions will run in the morning. — concurrent와 의미가 가장 가까운 것은?", a: "at the same time", opts: ["at the same time", "one after another", "on different days", "in the evening"], why: "concurrent = 동시에 일어나는" },
    { tag: "동의어 치환", prompt: "Our sales forecast for next year is fairly 『conservative』. — conservative와 의미가 가장 가까운 것은?", a: "cautious", opts: ["cautious", "optimistic", "unrealistic", "detailed"], why: "conservative = 보수적인 ≈ cautious" },
    { tag: "동의어 치환", prompt: "She has 『consistently』 met her monthly targets. — consistently와 의미가 가장 가까운 것은?", a: "without fail", opts: ["without fail", "only once", "rarely", "by accident"], why: "consistently = 꾸준히, 일관되게" },
    { tag: "동의어 치환", prompt: "Please 『consult』 the legal team before signing the lease. — consult와 의미가 가장 가까운 것은?", a: "ask for advice from", opts: ["ask for advice from", "argue with", "pay back", "replace"], why: "consult = 상담하다" },
    { tag: "동의어 치환", prompt: "Older machines 『consume』 far more electricity. — consume와 의미가 가장 가까운 것은?", a: "use up", opts: ["use up", "produce", "save", "store"], why: "consume = 소비하다 ≈ use up" },
    { tag: "동의어 치환", prompt: "The hotel offers a 『convenient』 location near the station. — convenient와 의미가 가장 가까운 것은?", a: "easy to use", opts: ["easy to use", "hard to find", "far away", "very costly"], why: "convenient = 편리한" },
    { tag: "동의어 치환", prompt: "The staff were 『courteous』 throughout our visit. — courteous와 의미가 가장 가까운 것은?", a: "polite", opts: ["polite", "late", "noisy", "strict"], why: "courteous = 예의 바른 ≈ polite" },
    { tag: "동의어 치환", prompt: "Please attach your 『credentials』 to the application form. — credentials와 의미가 가장 가까운 것은?", a: "qualifications", opts: ["qualifications", "salary history", "travel plans", "home address"], why: "credentials = 자격 증명" },
    { tag: "동의어 치환", prompt: "The bank will 『deduct』 the service fee from your account. — deduct와 의미가 가장 가까운 것은?", a: "subtract", opts: ["subtract", "add", "refund", "transfer"], why: "deduct = 공제하다 ≈ subtract" },
    { tag: "동의어 치환", prompt: "Several customers reported the 『defective』 keyboards. — defective와 의미가 가장 가까운 것은?", a: "faulty", opts: ["faulty", "expensive", "popular", "lightweight"], why: "defective = 결함이 있는 ≈ faulty" },
    { tag: "동의어 치환", prompt: "The shuttle will 『depart』 every thirty minutes. — depart와 의미가 가장 가까운 것은?", a: "leave", opts: ["leave", "arrive", "wait", "turn around"], why: "depart = 출발하다 ≈ leave" },
    { tag: "동의어 치환", prompt: "Heavy use will 『deplete』 the reserve before winter. — deplete와 의미가 가장 가까운 것은?", a: "reduce greatly", opts: ["reduce greatly", "increase slowly", "protect fully", "measure again"], why: "deplete = 고갈시키다 ≈ reduce greatly" },
    { tag: "동의어 치환", prompt: "Please 『discard』 any damaged samples before shipping. — discard와 의미가 가장 가까운 것은?", a: "throw away", opts: ["throw away", "keep safe", "label clearly", "count again"], why: "discard = 폐기하다 ≈ throw away" },
    { tag: "동의어 치환", prompt: "The two firms settled a long 『dispute』 over the invoice. — dispute와 의미가 가장 가까운 것은?", a: "disagreement", opts: ["disagreement", "partnership", "schedule", "document"], why: "dispute = 분쟁, 논쟁" },
    { tag: "동의어 치환", prompt: "All 『documentation』 must be submitted in English. — documentation과 의미가 가장 가까운 것은?", a: "official papers", opts: ["official papers", "verbal consent", "travel plans", "budget plan"], why: "documentation = 문서 자료" },
    { tag: "동의어 치환", prompt: "The firm will 『donate』 part of the proceeds to charity. — donate와 의미가 가장 가까운 것은?", a: "give away", opts: ["give away", "sell off", "borrow", "invest"], why: "donate = 기부하다 ≈ give away" },
    { tag: "동의어 치환", prompt: "Please avoid 『duplicate』 entries in the customer database. — duplicate와 의미가 가장 가까운 것은?", a: "repeated", opts: ["repeated", "missing", "secure", "temporary"], why: "duplicate = 중복된" },
    { tag: "동의어 치환", prompt: "The brochure highlights the 『durable』 material of the case. — durable와 의미가 가장 가까운 것은?", a: "long lasting", opts: ["long lasting", "fragile", "colorful", "low priced"], why: "durable = 내구성 있는" },
    { tag: "동의어 치환", prompt: "The new hires are 『eager』 to learn the system. — eager와 의미가 가장 가까운 것은?", a: "willing", opts: ["willing", "unable", "afraid", "reluctant"], why: "eager = 열망하는 ≈ willing" },
    { tag: "동의어 치환", prompt: "The hybrid model is more 『economical』 than the older one. — economical와 의미가 가장 가까운 것은?", a: "cost saving", opts: ["cost saving", "faster", "heavier", "more popular"], why: "economical = 경제적인 ≈ cost saving" },
    { tag: "동의어 치환", prompt: "I will 『enclose』 the signed contract with this letter. — enclose와 의미가 가장 가까운 것은?", a: "include", opts: ["include", "remove", "sign", "translate"], why: "enclose = 동봉하다 ≈ include" },
    { tag: "동의어 치환", prompt: "The battery is known for its long 『endurance』. — endurance와 의미가 가장 가까운 것은?", a: "staying power", opts: ["staying power", "low price", "small size", "fast charge"], why: "endurance = 지구력, 오래 견디는 힘" },
    { tag: "동의어 치환", prompt: "The new seminar will 『enrich』 the training program. — enrich와 의미가 가장 가까운 것은?", a: "improve", opts: ["improve", "shorten", "cancel", "copy"], why: "enrich = 풍부하게 하다 ≈ improve" },
    { tag: "동의어 치환", prompt: "The 『entire』 shipment was inspected before shipping. — entire와 의미가 가장 가까운 것은?", a: "whole", opts: ["whole", "partial", "late", "damaged"], why: "entire = 전체의 ≈ whole" },
    { tag: "동의어 치환", prompt: "The two models are 『equivalent』 in performance. — equivalent와 의미가 가장 가까운 것은?", a: "equal", opts: ["equal", "different", "optional", "costly"], why: "equivalent = 동등한 ≈ equal" },
    { tag: "동의어 치환", prompt: "A valid photo ID is 『essential』 for building entry. — essential과 의미가 가장 가까운 것은?", a: "necessary", opts: ["necessary", "optional", "unusual", "risky"], why: "essential = 필수적인 ≈ necessary" },
    { tag: "동의어 치환", prompt: "The contractor will 『estimate』 the repair cost today. — estimate와 의미가 가장 가까운 것은?", a: "calculate roughly", opts: ["calculate roughly", "pay in full", "delay", "approve"], why: "estimate = 추산하다, 견적을 내다" },
    { tag: "동의어 치환", prompt: "The team delivered 『exceptional』 service to every guest. — exceptional와 의미가 가장 가까운 것은?", a: "outstanding", opts: ["outstanding", "average", "slow", "expensive"], why: "exceptional = 뛰어난 ≈ outstanding" },
    { tag: "동의어 치환", prompt: "Your membership will 『expire』 at the end of March. — expire와 의미가 가장 가까운 것은?", a: "come to an end", opts: ["come to an end", "start again", "cost more", "transfer"], why: "expire = 만료되다 ≈ come to an end" },
    { tag: "동의어 치환", prompt: "The store will 『extend』 its business hours in December. — extend와 의미가 가장 가까운 것은?", a: "lengthen", opts: ["lengthen", "shorten", "close early", "relocate"], why: "extend = 연장하다 ≈ lengthen" },
    { tag: "동의어 치환", prompt: "The quarter showed 『extraordinary』 growth in online sales. — extraordinary와 의미가 가장 가까운 것은?", a: "remarkable", opts: ["remarkable", "slight", "negative", "expected"], why: "extraordinary = 놀라운 ≈ remarkable" },
    { tag: "동의어 치환", prompt: "The factory will 『fabricate』 the frames locally. — fabricate와 의미가 가장 가까운 것은?", a: "manufacture", opts: ["manufacture", "import", "repair", "recycle"], why: "fabricate = 제조하다 ≈ manufacture" },
    { tag: "동의어 치환", prompt: "A small 『fee』 is charged for express delivery. — fee와 의미가 가장 가까운 것은?", a: "charge", opts: ["charge", "discount", "refund", "deposit"], why: "fee = 수수료 ≈ charge" },
    { tag: "동의어 치환", prompt: "We must 『fulfill』 the order before Friday. — fulfill와 의미가 가장 가까운 것은?", a: "carry out", opts: ["carry out", "cancel", "double", "return"], why: "fulfill = 이행하다 ≈ carry out" },
    { tag: "동의어 치환", prompt: "Reliable power is 『fundamental』 to our operations. — fundamental와 의미가 가장 가까운 것은?", a: "basic", opts: ["basic", "optional", "temporary", "costly"], why: "fundamental = 근본적인 ≈ basic" },
    { tag: "동의어 치환", prompt: "Please confirm that the coupon is 『genuine』. — genuine와 의미가 가장 가까운 것은?", a: "real", opts: ["real", "expired", "colorful", "free"], why: "genuine = 진짜의 ≈ real" },
    { tag: "동의어 치환", prompt: "Prices will rise 『gradually』 over the next year. — gradually와 의미가 가장 가까운 것은?", a: "slowly", opts: ["slowly", "suddenly", "never", "equally"], why: "gradually = 점차적으로 ≈ slowly" },
    { tag: "동의어 치환", prompt: "Ms. Choi will 『handle』 all customer complaints this week. — handle와 의미가 가장 가까운 것은?", a: "deal with", opts: ["deal with", "hand over", "put off", "write off"], why: "handle = 처리하다 ≈ deal with" },
    { tag: "동의어 치환", prompt: "『Hazardous』 materials must be stored in a separate room. — hazardous와 의미가 가장 가까운 것은?", a: "dangerous", opts: ["dangerous", "fragile", "recycled", "frozen"], why: "hazardous = 위험한 ≈ dangerous" },
    { tag: "동의어 치환", prompt: "The report was returned because of 『inadequate』 data. — inadequate와 의미가 가장 가까운 것은?", a: "not enough", opts: ["not enough", "too detailed", "misplaced", "outdated"], why: "inadequate = 불충분한" },
    { tag: "동의어 치환", prompt: "The company offers an 『incentive』 for early completion. — incentive와 의미가 가장 가까운 것은?", a: "reward", opts: ["reward", "penalty", "warning", "deduction"], why: "incentive = 장려책 ≈ reward" },
    { tag: "동의어 치환", prompt: "We apologize for any 『inconvenience』 caused by the delay. — inconvenience와 의미가 가장 가까운 것은?", a: "trouble", opts: ["trouble", "expense", "noise", "danger"], why: "inconvenience = 불편 ≈ trouble" },
    { tag: "동의어 치환", prompt: "The annual safety 『inspection』 is scheduled for June. — inspection와 의미가 가장 가까운 것은?", a: "official check", opts: ["official check", "repair job", "staff meeting", "sales review"], why: "inspection = 점검 ≈ official check" },
    { tag: "동의어 치환", prompt: "The manual will 『instruct』 users to back up their files. — instruct와 의미가 가장 가까운 것은?", a: "tell", opts: ["tell", "ask", "warn", "allow"], why: "instruct = 지시하다 ≈ tell" },
    { tag: "동의어 치환", prompt: "The pipes are 『insulated』 against the cold. — insulated와 의미가 가장 가까운 것은?", a: "protected", opts: ["protected", "painted", "replaced", "measured"], why: "insulated = 단열된, 보호된" },
    { tag: "동의어 치환", prompt: "The recruits completed an 『intensive』 two-week course. — intensive와 의미가 가장 가까운 것은?", a: "concentrated", opts: ["concentrated", "optional", "online", "self-paced"], why: "intensive = 집중적인 ≈ concentrated" },
    { tag: "동의어 치환", prompt: "The 『landlord』 agreed to renew the office lease. — landlord와 의미가 가장 가까운 것은?", a: "property owner", opts: ["property owner", "tenant", "agent", "inspector"], why: "landlord = 임대인, 건물주" },
    { tag: "동의어 치환", prompt: "After a 『lengthy』 discussion, the board approved the plan. — lengthy와 의미가 가장 가까운 것은?", a: "long", opts: ["long", "brief", "private", "heated"], why: "lengthy = 긴, 오래 걸리는 ≈ long" },
    { tag: "동의어 치환", prompt: "Each customer is 『limited』 to two tickets. — limited와 의미가 가장 가까운 것은?", a: "restricted", opts: ["restricted", "entitled", "invited", "charged"], why: "be limited to = 제한되다 ≈ restricted" },
    { tag: "동의어 치환", prompt: "The program rewards long-term customer 『loyalty』. — loyalty와 의미가 가장 가까운 것은?", a: "repeat business", opts: ["repeat business", "late payment", "new hiring", "product design"], why: "loyalty = 충성도, 계속 거래함" },
    { tag: "동의어 치환", prompt: "The two banks will 『merge』 next quarter. — merge와 의미가 가장 가까운 것은?", a: "combine", opts: ["combine", "split up", "close down", "expand abroad"], why: "merge = 합병하다 ≈ combine" },
    { tag: "동의어 치환", prompt: "The agreement was based on 『mutual』 trust. — mutual와 의미가 가장 가까운 것은?", a: "shared", opts: ["shared", "written", "temporary", "financial"], why: "mutual = 상호의, 공통의 ≈ shared" },
    { tag: "동의어 치환", prompt: "Our main 『objective』 is to reduce customer waiting time. — objective와 의미가 가장 가까운 것은?", a: "goal", opts: ["goal", "budget", "risk", "method"], why: "objective = 목표 ≈ goal" },
    { tag: "동의어 치환", prompt: "The error 『occurred』 during the final quality check. — occur와 의미가 가장 가까운 것은?", a: "happened", opts: ["happened", "ended", "worsened", "repeated"], why: "occur = 발생하다 ≈ happen" },
    { tag: "동의어 치환", prompt: "Please give us the 『precise』 delivery date. — precise와 의미가 가장 가까운 것은?", a: "exact", opts: ["exact", "approximate", "earliest", "latest"], why: "precise = 정확한 ≈ exact" },
    { tag: "동의어 치환", prompt: "Members may state a seating 『preference』 when booking. — preference와 의미가 가장 가까운 것은?", a: "choice", opts: ["choice", "complaint", "fee", "discount"], why: "preference = 선호 ≈ choice" },
    { tag: "동의어 치환", prompt: "Visitors must sign in at the 『premises』 entrance. — premises와 의미가 가장 가까운 것은?", a: "building", opts: ["building", "parking lot", "website", "showroom"], why: "premises = 건물, 부지" },
    { tag: "동의어 치환", prompt: "Applicants must demonstrate 『proficiency』 in spreadsheet software. — proficiency와 의미가 가장 가까운 것은?", a: "skill", opts: ["skill", "interest", "seniority", "attendance"], why: "proficiency = 능숙함 ≈ skill" },
    { tag: "동의어 치환", prompt: "The warehouse still holds a 『surplus』 of last season's stock. — surplus와 의미가 가장 가까운 것은?", a: "extra amount", opts: ["extra amount", "shortage", "pending order", "discount rate"], why: "surplus = 잉여, 남는 양" }
  ],

  /* ============ 5. 30일 스프린트 커리큘럼 ============ */
  sprint: [
    { day: 1, unit: 1, focus: "비즈니스·회사 핵심 33단어" },
    { day: 2, unit: 2, focus: "직장 생활 어휘 + 복습(1일차)" },
    { day: 3, unit: 3, focus: "인사·채용 어휘 + Part 5 품사" },
    { day: 4, unit: 4, focus: "회의·협상 어휘 + Part 2 훈련" },
    { day: 5, unit: 5, focus: "금융·회계 어휘 + LC 숫자" },
    { day: 6, unit: 6, focus: "마케팅 어휘 + 복습(2~5일차)" },
    { day: 7, unit: 7, focus: "주간 점검: 미니 테스트 10문제" },
    { day: 8, unit: 8, focus: "제조·생산 어휘 + Part 5 시제" },
    { day: 9, unit: 9, focus: "물류·유통 어휘 + Part 3 훈련" },
    { day: 10, unit: 10, focus: "고객 서비스 어휘 + Part 7 지문" },
    { day: 11, unit: 11, focus: "출장·여행 어휘 + LC Part 1" },
    { day: 12, unit: 12, focus: "호텔·예약 어휘 + 복습(8~11일차)" },
    { day: 13, unit: 13, focus: "사무 장비·시설 어휘" },
    { day: 14, unit: 14, focus: "주간 점검: 콜로케이션 드릴" },
    { day: 15, unit: 15, focus: "계약·법률 어휘 + Part 6 문맥" },
    { day: 16, unit: 16, focus: "교육·훈련 어휘" },
    { day: 17, unit: 17, focus: "기술·IT 어휘 + Part 7 이중 지문" },
    { day: 18, unit: 18, focus: "의료·건강 어휘 + 복습(15~17일차)" },
    { day: 19, unit: 19, focus: "미디어·광고 어휘" },
    { day: 20, unit: 20, focus: "부동산·임대 어휘 + Part 5 전치사" },
    { day: 21, unit: 21, focus: "주간 점검: 실전 시험 모드 1회" },
    { day: 22, unit: 22, focus: "은행·결제 어휘 + Part 2 함정" },
    { day: 23, unit: 23, focus: "보험·세금 어휘" },
    { day: 24, unit: 24, focus: "인사 평가 어휘 + 동의어 치환" },
    { day: 25, unit: 25, focus: "환경·에너지 어휘 + 복습(22~24일차)" },
    { day: 26, unit: 26, focus: "식품·서비스 어휘" },
    { day: 27, unit: 27, focus: "건설·안전 어휘 + Part 6 장문" },
    { day: 28, unit: 28, focus: "정부·공공 어휘" },
    { day: 29, unit: 29, focus: "문화·행사 어휘 + 복습(26~28일차)" },
    { day: 30, unit: 30, focus: "최종 점검: 모의고사 1회 + 취약 유형" }
  ],

  /* ============ 8. Part 1 사진 묘사 ============ */
  part1: [
    { scene: "한 남자가 카운터에서 직원에게 카드를 건네고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A man is handing a card to a clerk.", opts: ["A man is handing a card to a clerk.", "A man is putting on a jacket.", "A woman is writing on a form.", "The clerk is arranging the shelves."], why: "건네주는 동작은 hand A to B로 표현하며, 수령인은 to 뒤에 옵니다." },
    { scene: "두 사람이 회의실에서 악수하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "Two people are shaking hands in a meeting room.", opts: ["Two people are shaking hands in a meeting room.", "Two people are leaving the building.", "A person is signing a document.", "Someone is cleaning the meeting room."], why: "악수는 shake hands(복수 hands)로 표현합니다." },
    { scene: "직원이 상자에서 물건을 꺼내고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A worker is removing items from a box.", opts: ["A worker is removing items from a box.", "A worker is sealing a box.", "A customer is paying for items.", "The boxes are stacked on a shelf."], why: "꺼내는 동작은 remove A from B입니다." },
    { scene: "여성이 전화를 걸며 서류를 살펴보고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A woman is talking on the phone while reviewing documents.", opts: ["A woman is talking on the phone while reviewing documents.", "A woman is typing on a keyboard.", "The documents are being filed.", "A phone is ringing on the desk."], why: "전화 통화는 talk on the phone으로 표현합니다." },
    { scene: "승객들이 게이트에서 줄을 서 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "Passengers are standing in line at the gate.", opts: ["Passengers are standing in line at the gate.", "Passengers are boarding the plane.", "The gate is being closed.", "Luggage is being unloaded."], why: "줄을 서다 = stand in line" },
    { scene: "기술자가 장비를 점검하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A technician is inspecting the equipment.", opts: ["A technician is inspecting the equipment.", "The equipment is being replaced.", "A technician is operating a vehicle.", "The equipment has been unplugged."], why: "점검은 inspect이며 진행형이 자연스럽습니다." },
    { scene: "손님들이 식당에서 식사하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "Customers are dining at a restaurant.", opts: ["Customers are dining at a restaurant.", "Customers are ordering at a counter.", "The tables are being cleaned.", "A chef is preparing a dish."], why: "식사 중인 상태는 dine의 진행형으로 표현합니다." },
    { scene: "한 남자가 차를 세차하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A man is washing a car.", opts: ["A man is washing a car.", "A car is parked in a garage.", "A man is repairing a bicycle.", "A car is being sold."], why: "세차 동작은 wash a car입니다." },
    { scene: "직원이 물건을 진열대에 쌓고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "An employee is stacking items on a shelf.", opts: ["An employee is stacking items on a shelf.", "An employee is purchasing items.", "The shelves are empty.", "Items are being returned."], why: "쌓는 동작은 stack A on B입니다." },
    { scene: "사람들이 공원에서 조깅하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "People are jogging along a path.", opts: ["People are jogging along a path.", "People are sitting on a bench.", "A path is being built.", "People are riding bicycles."], why: "길을 따라 달리는 동작은 jog along a path입니다." },
    { scene: "비서가 컴퓨터로 타이핑하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A secretary is typing on a computer.", opts: ["A secretary is typing on a computer.", "A secretary is answering the phone.", "A computer is being repaired.", "The office is being painted."], why: "타이핑은 type on a computer입니다." },
    { scene: "관광객들이 기념품 가게에서 쇼핑하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "Tourists are shopping at a souvenir shop.", opts: ["Tourists are shopping at a souvenir shop.", "Tourists are taking photographs.", "A shop is being closed.", "Souvenirs are being packed."], why: "쇼핑 중인 상태는 be shopping입니다." },
    { scene: "두 사람이 창가 테이블에 앉아 커피를 마시고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "Two people are seated at a table by the window.", opts: ["Two people are seated at a table by the window.", "Two people are standing in line.", "A table is being wiped.", "Coffee is being roasted."], why: "앉아 있는 상태는 be seated로 표현합니다." },
    { scene: "여성이 벽에 걸린 그림을 가리키고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A woman is pointing at a picture on the wall.", opts: ["A woman is pointing at a picture on the wall.", "A woman is hanging a picture.", "The wall is being painted.", "A picture has been removed."], why: "가리키는 동작은 point at입니다." },
    { scene: "작업자가 사다리에 올라가 전구를 교체하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A worker is replacing a light bulb on a ladder.", opts: ["A worker is replacing a light bulb on a ladder.", "A worker is climbing down the stairs.", "The lights are being turned off.", "A ladder is being repaired."], why: "교체하는 동작은 replace A입니다." },
    { scene: "기차가 플랫폼에 도착해 승객들이 내리고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "Passengers are getting off the train.", opts: ["Passengers are getting off the train.", "Passengers are boarding the train.", "The platform is being cleaned.", "The train is being loaded."], why: "내리는 동작은 get off, 타는 동작은 get on입니다." },
    { scene: "정원사가 울타리를 따라 나무를 심고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "A gardener is planting trees along a fence.", opts: ["A gardener is planting trees along a fence.", "A gardener is cutting the grass.", "A fence is being built.", "Trees are being removed."], why: "심는 동작은 plant, 길을 따라는 along입니다." },
    { scene: "직원이 계산대에서 바코드를 스캔하고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "An employee is scanning items at the checkout counter.", opts: ["An employee is scanning items at the checkout counter.", "An employee is stacking boxes.", "A customer is paying in cash.", "The counter is being moved."], why: "바코드를 읽는 동작은 scan입니다." },
    { scene: "두 기술자가 노트북 화면을 함께 보고 있다.", q: "이 장면을 가장 잘 묘사한 것은?", a: "Two technicians are looking at a laptop screen together.", opts: ["Two technicians are looking at a laptop screen together.", "Two technicians are carrying a laptop.", "A laptop is being sold.", "The screen has been turned off."], why: "~을 바라보다는 look at입니다." }
  ],

  /* ============ 9. 빈도순 기출 어휘 ============ */
  frequency: [
    ["available", "이용 가능한", "형용사", "/əˈveɪləbl/", "어-베이-러-블", "The manager is not available right now.", "매니저는 지금 자리 비웠습니다.", "더 매-니-저 이즈 낫 어-베이-러-블 라이트 나우"],
    ["require", "요구하다", "동사", "/rɪˈkwaɪər/", "리-콰이-어", "The job requires strong computer skills.", "그 일자리는 뛰어난 컴퓨터 실력을 요구한다.", "더 잡 리-콰이어즈 스트롱 컴-퓨-터 스킬즈"],
    ["provide", "제공하다", "동사", "/prəˈvaɪd/", "프러-바이드", "The company will provide free training to all staff.", "회사는 모든 직원에게 무료 교육을 제공할 것이다.", "더 컴-퍼-니 윌 프러-바이드 프리 트레이-닝 투 올 스태프"],
    ["information", "정보", "명사", "/ˌɪnfərˈmeɪʃn/", "인-퍼-메이-션", "Please contact the front desk for more information.", "자세한 정보는 안내 데스크에 문의하세요.", "플리즈 칸-택트 더 프런트 데스크 포 모어 인-퍼-메이-션"],
    ["include", "포함하다", "동사", "/ɪnˈkluːd/", "인-클루드", "The price includes breakfast and free parking.", "가격에는 조식과 무료 주차가 포함된다.", "더 프라이스 인-클루즈 브렉-퍼스트 앤드 프리 파-킹"],
    ["available upon request", "요청 시 제공", "구", "/əˈveɪləbl əˈpɑːn rɪˈkwest/", "어-베일-러-블 어-판 리-퀘스트", "A detailed price list is available upon request.", "자세한 가격표는 요청 시 제공됩니다.", "어 디-테일드 프라이스 리스트 이즈 어-베일-러-블 어-판 리-퀘스트"],
    ["attend", "참석하다", "동사", "/əˈtend/", "어-텐드", "All managers are expected to attend the meeting.", "모든 관리자는 회의에 참석할 것으로 예상된다.", "올 매-니-저즈 아 익-스펙-티드 투 어-텐드 더 미-팅"],
    ["schedule", "일정", "명사", "/ˈskedʒuːl/", "스케-줄", "The meeting schedule was changed at the last minute.", "회의 일정이 마지막 순간에 변경되었다.", "더 미-팅 스케-줄 워즈 체인지드 앳 더 래스트 미-닛"],
    ["confirm", "확인하다", "동사", "/kənˈfɜːrm/", "컨-펌", "Please confirm your reservation by Friday.", "금요일까지 예약을 확인해 주세요.", "플리즈 컨-펌 유어 레-저-베이-션 바이 프라이-데이"],
    ["deadline", "마감일", "명사", "/ˈdedlaɪn/", "데드-라인", "The deadline for the report is this Friday.", "보고서 마감일은 이번 주 금요일이다.", "더 데드-라인 포 더 리-포-트 이즈 디스 프라이-데이"],
    ["approve", "승인하다", "동사", "/əˈpruːv/", "어-프루브", "The board will approve the budget next week.", "이사회는 다음 주에 예산을 승인할 것이다.", "더 보드 윌 어-프루브 더 버-짓 넥스트 위크"],
    ["department", "부서", "명사", "/dɪˈpɑːrtmənt/", "디-파-트먼트", "The marketing department needs more staff.", "마케팅 부서는 직원이 더 필요하다.", "더 마-키-팅 디-파-트먼트 니즈 모어 스태프"],
    ["receive", "받다", "동사", "/rɪˈsiːv/", "리-시브", "Customers will receive a confirmation email shortly.", "고객은 곧 확인 이메일을 받게 됩니다.", "커스-터-머즈 윌 리-시브 어 칸-퍼-메이-션 이-메일 숄-리"],
    ["arrange", "준비하다", "동사", "/əˈreɪndʒ/", "어-레인지", "I will arrange a meeting with the supplier.", "공급업체와의 회의를 주선하겠습니다.", "아이 윌 어-레인지 어 미-팅 위드 더 서-플라이-어"],
    ["additional", "추가의", "형용사", "/əˈdɪʃənl/", "어-디-셔-널", "We need additional staff during the busy season.", "성수기에는 추가 인력이 필요합니다.", "위 니드 어-디-셔-널 스태프 두-링 더 비-지 시-즌"],
    ["recommend", "추천하다", "동사", "/ˌrekəˈmend/", "레-커-멘드", "I recommend booking your flight early.", "항공권을 일찍 예약하시길 추천합니다.", "아이 레-커-멘드 북-킹 유어 플라이트 얼-리"],
    ["immediately", "즉시", "부사", "/ɪˈmiːdiətli/", "이-미-디-엇-리", "Please contact the office immediately if the shipment is delayed.", "배송이 지연되면 즉시 사무실에 연락하세요.", "플리즈 칸-택트 디 오-피스 이-미-디-엇-리 이프 더 쉽-먼트 이즈 디-레이드"],
    ["postpone", "연기하다", "동사", "/poʊˈspoʊn/", "포우-스포운", "The conference was postponed until next month.", "컨퍼런스는 다음 달로 연기되었다.", "더 칸-퍼-런스 워즈 포우-스포운드 언-틸 넥스트 먼스"],
    ["consider", "고려하다", "동사", "/kənˈsɪdər/", "컨-시-더", "Please consider our offer before making a decision.", "결정을 내리기 전에 저희 제안을 고려해 주세요.", "플리즈 컨-시-더 아워 오-퍼 비-포어 메이-킹 어 디-시-전"],
    ["deliver", "배달하다", "동사", "/dɪˈlɪvər/", "디-리-버", "The package was delivered this morning.", "그 소포는 오늘 아침에 배달되었다.", "더 패-키지 워즈 디-리-버드 디스 모-닝"],
    ["invoice", "청구서", "명사", "/ˈɪnvɔɪs/", "인-보이스", "The invoice must be paid within two weeks.", "청구서는 2주 이내에 지불해야 한다.", "디 인-보이스 머스트 비 페이드 위드-인 투 위크스"],
    ["request", "요청", "명사", "/rɪˈkwest/", "리-퀘스트", "The customer requested a refund for the damaged item.", "고객은 손상된 물품에 대해 환불을 요청했다.", "더 커스-터-머 리-퀘스-티드 어 리-펀드 포 더 데-미지드 아이-템"],
    ["promptly", "신속히", "부사", "/ˈprɑːmptli/", "프람프트-리", "Please respond to the email promptly.", "이메일에 신속히 답장해 주세요.", "플리즈 리-스판드 투 디 이-메일 프람프트-리"],
    ["ensure", "보장하다", "동사", "/ɪnˈʃʊr/", "인-슈어", "We will ensure that all orders are delivered on time.", "모든 주문이 제때 배송되도록 보장하겠습니다.", "위 윌 인-슈어 댓 올 오-더즈 아 디-리-버드 온 타임"],
    ["participate", "참여하다", "동사", "/pɑːrˈtɪsɪpeɪt/", "파-티-시-페이트", "All employees are encouraged to participate in the survey.", "모든 직원은 설문에 참여하도록 권장됩니다.", "올 임-플로이-이즈 아 인-커-리지드 투 파-티-시-페이트 인 더 서-베이"],
    ["responsible", "책임 있는", "형용사", "/rɪˈspɑːnsəbl/", "리-스판-서-블", "She is responsible for managing the branch.", "그녀는 지점 관리를 책임지고 있다.", "시 이즈 리-스판-서-블 포 매-니-징 더 브랜치"],
    ["estimate", "견적", "명사", "/ˈestɪmət/", "에스-티-멋", "The estimate for the repair is two hundred dollars.", "수리 견적은 200달러이다.", "디 에스-티-멋 포 더 리-페어 이즈 투 헌-드레드 달-러즈"],
    ["purchase", "구매하다", "동사", "/ˈpɜːrtʃəs/", "퍼-처스", "The purchase of new equipment was approved.", "새 장비 구매가 승인되었다.", "더 퍼-처스 오브 누 이-퀴프-먼트 워즈 어-프루브드"],
    ["revenue", "수익", "명사", "/ˈrevənuː/", "레-버-누", "Annual revenue increased by fifteen percent.", "연간 매출이 15% 증가했다.", "애-뉴-얼 레-버-누 인-크리스트 바이 피프-틴 퍼-센트"],
    ["agreement", "합의", "명사", "/əˈɡriːmənt/", "어-그리-먼트", "They reached an agreement after a long negotiation.", "그들은 긴 협상 끝에 합의에 도달했다.", "데이 리치트 언 어-그리-먼트 애프-터 어 롱 니-고우-시-에이-션"],
    ["efficient", "효율적인", "형용사", "/ɪˈfɪʃnt/", "이-피-션트", "The new process is more efficient than the old one.", "새 공정은 기존 것보다 더 효율적이다.", "더 누 프라-세스 이즈 모어 이-피-션트 댄 디 올드 원"],
    ["register", "등록하다", "동사", "/ˈredʒɪstər/", "레-지-스터", "Please register for the workshop before Friday.", "금요일 전까지 워크숍에 등록해 주세요.", "플리즈 레-지-스터 포 더 워크-숍 비-포어 프라이-데이"],
    ["contact", "연락하다", "동사", "/ˈkɑːntækt/", "칸-택트", "Please contact our customer service team.", "고객 서비스 팀에 연락해 주세요.", "플리즈 칸-택트 아워 커스-터-머 서-비스 팀"],
    ["expense", "경비", "명사", "/ɪkˈspens/", "익-스펜스", "Travel expenses will be reimbursed by the company.", "여행 경비는 회사가 상환할 것이다.", "트래-블 익-스펜-시즈 윌 비 리-임-버스트 바이 더 컴-퍼-니"],
    ["attendee", "참석자", "명사", "/əˌtenˈdiː/", "어-텐-디", "Each attendee received a name badge.", "각 참석자는 명찰을 받았다.", "이치 어-텐-디 리-시브드 어 네임 배지"],
    ["flexible", "유연한", "형용사", "/ˈfleksəbl/", "플렉-서-블", "Our working hours are flexible for remote staff.", "재택 직원은 근무 시간이 유연합니다.", "아워 워-킹 아워즈 아 플렉-서-블 포 리-모우트 스태프"],
    ["maintain", "유지하다", "동사", "/meɪnˈteɪn/", "메인-테인", "The technician will maintain the equipment regularly.", "기술자가 장비를 정기적으로 유지보수할 것이다.", "더 테크-니-션 윌 메인-테인 디 이-퀴프-먼트 레-규-러-리"],
    ["reschedule", "일정을 변경하다", "동사", "/ˌriːˈskedʒuːl/", "리-스케-줄", "We had to reschedule the meeting for next week.", "우리는 회의를 다음 주로 변경해야 했다.", "위 해드 투 리-스케-줄 더 미-팅 포 넥스트 위크"],
    ["supervisor", "관리자", "명사", "/ˈsuːpərvaɪzər/", "수-퍼-바이-저", "The supervisor approved my vacation request.", "상사가 내 휴가 요청을 승인했다.", "더 수-퍼-바이-저 어-프루브드 마이 베-케이-션 리-퀘스트"],
    ["acquire", "획득하다", "동사", "/əˈkwaɪər/", "어-콰이-어", "The company plans to acquire a smaller competitor.", "그 회사는 더 작은 경쟁사를 인수할 계획이다.", "더 컴-퍼-니 플랜즈 투 어-콰이-어 어 스몰-러 컴-페-티-터"],
    ["qualify", "자격을 갖추다", "동사", "/ˈkwɑːlɪfaɪ/", "콸-리-파이", "Only members qualify for the special discount.", "회원만 특별 할인을 받을 자격이 있다.", "온-리 멤-버즈 콸-리-파이 포 더 스페-셜 디스-카운트"],
    ["recent", "최근의", "형용사", "/ˈriːsnt/", "리-슨트", "Sales have improved in recent months.", "최근 몇 달 동안 매출이 개선되었다.", "세일즈 해브 임-프루브드 인 리-슨트 먼스"],
    ["obtain", "얻다", "동사", "/əbˈteɪn/", "업-테인", "You must obtain approval before ordering supplies.", "물품을 주문하기 전에 승인을 받아야 합니다.", "유 머스트 업-테인 어-프루-벌 비-포어 오-더-링 서-플라이즈"],
    ["distribute", "배포하다", "동사", "/dɪˈstrɪbjuːt/", "디-스트리-뷰트", "The company distributes its products nationwide through local partners.", "그 회사는 지역 파트너를 통해 전국에 제품을 유통한다.", "더 컴-퍼-니 디-스트리-뷰츠 잇츠 프라-덕츠 내-션-와이드 쓰루 로-컬 파트-너즈"],
    ["period", "기간", "명사", "/ˈpɪriəd/", "피-리-어드", "Sales increased during the holiday period.", "휴가 기간 동안 매출이 증가했다.", "세일즈 인-크리스트 두-링 더 할-리-데이 피-리-어드"],
    ["increase", "증가하다", "동사", "/ɪnˈkriːs/", "인-크리스", "Sales increased significantly during the holiday season.", "휴가철 동안 매출이 크게 증가했다.", "세일즈 인-크리스트 시그-니-피-컨트-리 두-링 더 할-리-데이 시-즌"],
    ["facility", "시설", "명사", "/fəˈsɪləti/", "퍼-시-러-티", "The sports facility is open to all employees.", "그 체육 시설은 모든 직원에게 개방되어 있다.", "더 스포츠 퍼-시-러-티 이즈 오우-픈 투 올 임-플로이-이즈"],
    ["notice", "공지", "명사", "/ˈnoʊtɪs/", "노우-티스", "The notice about the meeting was posted on the board.", "회의 공지가 게시판에 게시되었다.", "더 노우-티스 어-바웃 더 미-팅 워즈 포우-스-티드 온 더 보드"],
    ["apply", "지원하다", "동사", "/əˈplaɪ/", "어-플라이", "More than two hundred people applied for the job.", "200명이 넘는 사람들이 그 일자리에 지원했다.", "모어 댄 투 헌-드레드 피-플 어-플라이드 포 더 잡"],
    ["refer", "언급하다", "동사", "/rɪˈfɜːr/", "리-퍼", "Please refer to the manual for installation steps.", "설치 단계는 설명서를 참고하세요.", "플리즈 리-퍼 투 더 매-뉴-얼 포 인-스털-레이-션 스텝스"],
    ["negotiate", "협상하다", "동사", "/nɪˈɡoʊʃieɪt/", "니-고우-시-에이트", "We need to negotiate the delivery date with the supplier.", "우리는 공급업체와 납품 날짜를 협상해야 한다.", "위 니드 투 니-고우-시-에이트 더 디-리-버-리 데이트 위드 더 서-플라이-어"],
    ["allocate", "할당하다", "동사", "/ˈæləkeɪt/", "앨-러-케이트", "Managers will allocate the budget among departments.", "관리자들은 부서 간에 예산을 배분할 것이다.", "매-니-저즈 윌 앨-러-케이트 더 버-짓 어-몽 디-파-트먼츠"],
    ["retain", "유지하다", "동사", "/rɪˈteɪn/", "리-테인", "We should retain this receipt for our records.", "기록을 위해 이 영수증을 보관해야 한다.", "위 슈드 리-테인 디스 리-시트 포 아워 레-커즈"],
    ["waive", "면제하다", "동사", "/weɪv/", "웨이브", "The hotel will waive the fee for members.", "호텔은 회원에게 요금을 면제해 줄 것이다.", "더 호-텔 윌 웨이브 더 피 포 멤-버즈"],
    ["cease", "중단하다", "동사", "/siːs/", "시스", "The factory will cease production next month.", "그 공장은 다음 달에 생산을 중단할 것이다.", "더 팩-터-리 윌 시스 프러-덕-션 넥스트 먼스"],
    ["comply", "준수하다", "동사", "/kəmˈplaɪ/", "컴-플라이", "All staff must comply with the safety rules.", "모든 직원은 안전 규칙을 준수해야 합니다.", "올 스태프 머스트 컴-플라이 위드 더 세이프-티 룰즈"],
    ["verify", "확인하다", "동사", "/ˈverɪfaɪ/", "베-러-파이", "Please verify the account number before the transfer.", "송금 전에 계좌 번호를 확인해 주세요.", "플리즈 베-러-파이 디 어-카운트 넘-버 비-포어 더 트랜스-퍼"],
    ["revise", "수정하다", "동사", "/rɪˈvaɪz/", "리-바이즈", "We revised the plan after the feedback.", "우리는 피드백을 받은 후 계획을 수정했다.", "위 리-바이즈드 더 플랜 애프-터 더 피드-백"],
    ["notify", "통보하다", "동사", "/ˈnoʊtɪfaɪ/", "노우-터-파이", "We will notify you when the order ships.", "주문이 발송되면 알려 드리겠습니다.", "위 윌 노우-터-파이 유 웬 디 오-더 쉽스"],
    ["proceed", "진행하다", "동사", "/prəˈsiːd/", "프러-시드", "Please proceed to the second floor for check-in.", "체크인을 위해 2층으로 이동해 주세요.", "플리즈 프러-시드 투 더 세-컨드 플로어 포 체크-인"],
    ["exceed", "초과하다", "동사", "/ɪkˈsiːd/", "익-시드", "The results exceeded our expectations this quarter.", "이번 분기 실적은 우리 예상을 초과했다.", "더 리-절츠 익-시-디드 아워 익-스펙-테이-션즈 디스 퀄-터"],
    ["appropriate", "적절한", "형용사", "/əˈproʊpriət/", "어-프로우-프리-엇", "Please wear appropriate clothing for the interview.", "면접에는 적절한 복장을 착용하세요.", "플리즈 웨어 어-프로우-프리-엇 클로-딩 포 디 인-터-뷰"],
    ["sufficient", "충분한", "형용사", "/səˈfɪʃnt/", "서-피-션트", "We do not have sufficient staff for the event.", "행사를 진행할 충분한 인력이 없습니다.", "위 두 낫 해브 서-피-션트 스태프 포 디 이-벤트"],
    ["substantial", "상당한", "형용사", "/səbˈstænʃl/", "서브-스탠-셜", "The company reported a substantial increase in profit.", "그 회사는 상당한 이익 증가를 보고했다.", "더 컴-퍼-니 리-포-티드 어 서브-스탠-셜 인-크리스 인 프라-핏"],
    ["tentative", "잠정적인", "형용사", "/ˈtentətɪv/", "텐-터-티브", "The schedule is tentative and may change.", "일정은 잠정적이며 바뀔 수 있습니다.", "더 스케-줄 이즈 텐-터-티브 앤드 메이 체인지"],
    ["comprehensive", "포괄적인", "형용사", "/ˌkɑːmprɪˈhensɪv/", "컴-프리-헨-시브", "New hires receive comprehensive training for two weeks.", "신입 사원은 2주간 포괄적인 교육을 받는다.", "누 하이어즈 리-시브 컴-프리-헨-시브 트레이-닝 포 투 위크스"],
    ["eligible", "자격이 있는", "형용사", "/ˈelɪdʒəbl/", "엘-리-저-블", "Full-time employees are eligible for the bonus.", "정규 직원은 보너스를 받을 자격이 있다.", "풀-타임 임-플로이-이즈 아 엘-리-저-블 포 더 보-너스"],
    ["mandatory", "의무적인", "형용사", "/ˈmændətɔːri/", "맨-더-토-리", "Safety training is mandatory for all workers.", "안전 교육은 모든 근로자에게 의무적이다.", "세이프-티 트레이-닝 이즈 맨-더-토-리 포 올 워-커즈"],
    ["subsequent", "이후의", "형용사", "/ˈsʌbsɪkwənt/", "섭-시-퀀트", "Subsequent orders will receive a discount.", "이후 주문에는 할인이 적용됩니다.", "섭-시-퀀트 오-더즈 윌 리-시브 어 디스-카운트"],
    ["prior", "이전의", "형용사", "/ˈpraɪər/", "프라이-어", "No prior experience is required for this position.", "이 직무에는 사전 경험이 필요하지 않습니다.", "노우 프라이-어 익-스피-리-언스 이즈 리-콰이-어드 포 디스 퍼-지-션"],
    ["annual", "연간의", "형용사", "/ˈænjuəl/", "애-뉴-얼", "The annual meeting will be held in June.", "연례 회의가 6월에 열릴 것이다.", "디 애-뉴-얼 미-팅 윌 비 헬드 인 준"],
    ["quarterly", "분기별의", "형용사", "/ˈkwɔːrtərli/", "콰-터-리", "The company publishes quarterly reports for its investors.", "그 회사는 투자자들을 위해 분기별 보고서를 발행한다.", "더 컴-퍼-니 퍼-블리-시즈 콰-터-리 리-포-츠 포 잇츠 인-베스-터즈"],
    ["confidential", "기밀의", "형용사", "/ˌkɑːnfɪˈdenʃl/", "칸-피-덴-셜", "Please keep this financial report confidential.", "이 재무 보고서를 기밀로 유지해 주세요.", "플리즈 킵 디스 파이-낸-셜 리-포-트 칸-피-덴-셜"],
    ["durable", "내구성 있는", "형용사", "/ˈdʊrəbl/", "두-러-블", "These boots are durable enough for outdoor work.", "이 부츠는 야외 작업에 충분히 내구성이 있다.", "디즈 부츠 아 두-러-블 이-너프 포 아웃-도어 워크"],
    ["reimbursement", "상환", "명사", "/ˌriːɪmˈbɜːrsmənt/", "리-임-버스-먼트", "Submit your receipts for travel reimbursement.", "여비 상환을 위해 영수증을 제출하세요.", "섭-밋 유어 리-시트 포 트래-블 리-임-버스-먼트"],
    ["subsidiary", "자회사", "명사", "/səbˈsɪdieri/", "서브-시-디-에-리", "The firm opened a subsidiary in Singapore.", "그 회사는 싱가포르에 자회사를 열었다.", "더 펌 오-픈드 어 서브-시-디-에-리 인 싱-어-포어"],
    ["inventory", "재고", "명사", "/ˈɪnvəntɔːri/", "인-벤-토-리", "We need to check the inventory before ordering.", "주문하기 전에 재고를 확인해야 한다.", "위 니드 투 체크 디 인-벤-토-리 비-포 오-더-링"],
    ["quotation", "견적", "명사", "/kwoʊˈteɪʃn/", "콰우-테이-션", "Please send us a quotation for the parts.", "부품 견적서를 보내 주세요.", "플리즈 센드 어스 어 콰우-테이-션 포 더 파츠"],
    ["warranty", "보증", "명사", "/ˈwɔːrənti/", "워-런-티", "The computer comes with a two-year warranty.", "그 컴퓨터에는 2년 보증이 포함되어 있다.", "더 컴-퓨-터 컴즈 위드 어 투-이어 워-런-티"],
    ["itinerary", "여행 일정", "명사", "/aɪˈtɪnəreri/", "아이-티-너-레-리", "Please check the itinerary for the conference.", "컨퍼런스 일정표를 확인해 주세요.", "플리즈 체크 디 아이-티-너-레-리 포 더 칸-퍼-런스"],
    ["implement", "시행하다", "동사", "/ˈɪmplɪment/", "임-플리-멘트", "We will implement the new system in June.", "우리는 6월에 새 시스템을 시행할 것이다.", "위 윌 임-플리-멘트 더 누 시스-텀 인 준"],
    ["coordinate", "조정하다", "동사", "/koʊˈɔːrdɪneɪt/", "코우-오-디-네이트", "She will coordinate the schedules of all speakers.", "그녀가 모든 연사의 일정을 조정할 것이다.", "시 윌 코우-오-디-네이트 더 스케-줄즈 오브 올 스피-커즈"],
    ["evaluate", "평가하다", "동사", "/ɪˈvæljueɪt/", "이-밸-류-에이트", "The committee will evaluate all the proposals.", "위원회는 모든 제안을 평가할 것이다.", "더 커-미-티 윌 이-밸-류-에이트 올 더 프러-포우-즐즈"],
    ["facilitate", "촉진하다", "동사", "/fəˈsɪlɪteɪt/", "퍼-실-리-테이트", "The new software will facilitate teamwork.", "새 소프트웨어는 팀워크를 촉진할 것이다.", "더 누 소프트-웨어 윌 퍼-실-리-테이트 팀-워크"],
    ["finalize", "마무리하다", "동사", "/ˈfaɪnəlaɪz/", "파이-널-라이즈", "We need to finalize the contract today.", "오늘 계약을 마무리해야 합니다.", "위 니드 투 파이-널-라이즈 더 칸-트랙트 투-데이"],
    ["generate", "발생시키다", "동사", "/ˈdʒenəreɪt/", "제-너-레이트", "The campaign will generate more online sales.", "그 캠페인은 더 많은 온라인 매출을 발생시킬 것이다.", "더 캠-페인 윌 제-너-레이트 모어 온-라인 세일즈"],
    ["launch", "출시하다", "동사", "/lɔːntʃ/", "론치", "The company will launch the new phone in April.", "그 회사는 4월에 새 휴대폰을 출시할 것이다.", "더 컴-퍼-니 윌 론치 더 누 폰 인 에이-프럴"],
    ["monitor", "모니터링하다", "동사", "/ˈmɑːnɪtər/", "마-니-터", "We monitor customer feedback every week.", "우리는 매주 고객 피드백을 모니터링한다.", "위 마-니-터 커스-터-머 피드-백 에-브리 위크"],
    ["resolve", "해결하다", "동사", "/rɪˈzɑːlv/", "리-잘브", "The issue was resolved within two days.", "그 문제는 이틀 안에 해결되었다.", "디 이슈 워즈 리-잘브드 위드-인 투 데이즈"],
    ["streamline", "간소화하다", "동사", "/ˈstriːmlaɪn/", "스트림-라인", "The company will streamline its approval process.", "그 회사는 승인 절차를 간소화할 것이다.", "더 컴-퍼-니 윌 스트림-라인 이츠 어-프루-벌 프라-세스"],
    ["accelerate", "가속하다", "동사", "/əkˈseləreɪt/", "억-셀-러-레이트", "We must accelerate the delivery schedule.", "우리는 배송 일정을 앞당겨야 한다.", "위 머스트 억-셀-러-레이트 더 디-리-버-리 스케-줄"],
    ["acknowledge", "인정하다", "동사", "/əkˈnɑːlɪdʒ/", "억-날-리지", "Please acknowledge receipt of this email.", "이 이메일의 수신을 확인해 주세요.", "플리즈 억-날-리지 리-시트 오브 디스 이-메일"],
    ["authorize", "승인하다", "동사", "/ˈɔːθəraɪz/", "오-써-라이즈", "Only department managers can authorize overtime.", "부서 관리자만 초과 근무를 승인할 수 있다.", "온-리 디-파-트-먼트 매-니-저즈 캔 오-써-라이즈 오우-버-타임"],
    ["consolidate", "통합하다", "동사", "/kənˈsɑːlɪdeɪt/", "컨-살-리-데이트", "The company will consolidate its three offices.", "그 회사는 세 개 사무실을 통합할 것이다.", "더 컴-퍼-니 윌 컨-살-리-데이트 이츠 쓰리 오-피-시즈"],
    ["expedite", "신속히 처리하다", "동사", "/ˈekspədaɪt/", "엑-스퍼-다이트", "Could you expedite the shipping of this order?", "이 주문의 배송을 신속히 처리해 주시겠어요?", "쿠드 유 엑-스퍼-다이트 더 쉽-핑 오브 디스 오-더"],
    ["incorporate", "포함하다", "동사", "/ɪnˈkɔːrpəreɪt/", "인-코-퍼-레이트", "Please incorporate the latest data into the report.", "최신 데이터를 보고서에 포함해 주세요.", "플리즈 인-코-퍼-레이트 더 레이-티스트 데이-터 인-투 더 리-포-트"],
    ["minimize", "최소화하다", "동사", "/ˈmɪnɪmaɪz/", "미-니-마이즈", "We must minimize the risk of data loss.", "데이터 손실 위험을 최소화해야 한다.", "위 머스트 미-니-마이즈 더 리스크 오브 데이-터 로스"],
    ["prioritize", "우선순위를 정하다", "동사", "/praɪˈɔːrətaɪz/", "프라이-오-러-타이즈", "Please prioritize tasks that affect customers.", "고객에게 영향을 주는 업무를 우선 처리하세요.", "플리즈 프라이-오-러-타이즈 태스크스 댓 어-펙트 커스-터-머즈"],
    ["reimburse", "상환하다", "동사", "/ˌriːɪmˈbɜːrs/", "리-임-버스", "The company will reimburse your travel expenses.", "회사가 여행 경비를 상환할 것이다.", "더 컴-퍼-니 윌 리-임-버스 유어 트래-블 익-스펜-시즈"],
    ["certify", "증명하다", "동사", "/ˈsɜːrtɪfaɪ/", "서-터-파이", "An inspector must certify the equipment yearly.", "검사관이 매년 장비를 인증해야 한다.", "언 인-스펙-터 머스트 서-터-파이 디 이-퀴프-먼트 이어-리"],
    ["complement", "보완하다", "동사", "/ˈkɑːmplɪment/", "캄-플리-멘트", "These skills complement the training program well.", "이 기술들은 교육 프로그램을 잘 보완한다.", "디즈 스킬즈 캄-플리-멘트 더 트레이-닝 프러-그램 웰"],
    ["designate", "지정하다", "동사", "/ˈdezɪɡneɪt/", "데-지그-네이트", "Please designate one person to lead the project.", "프로젝트를 이끌 한 사람을 지정해 주세요.", "플리즈 데-지그-네이트 원 퍼-슨 투 리드 더 프라-젝트"],
    ["dispatch", "발송하다", "동사", "/dɪˈspætʃ/", "디-스패치", "We will dispatch your order on Monday.", "월요일에 주문을 발송하겠습니다.", "위 윌 디-스패치 유어 오-더 온 먼-데이"],
    ["enforce", "시행하다", "동사", "/ɪnˈfɔːrs/", "인-포스", "The company strictly enforces the dress code.", "그 회사는 복장 규정을 엄격히 시행한다.", "더 컴-퍼-니 스트릭-틀리 인-포-시즈 더 드레스 코드"],
    ["enhance", "향상시키다", "동사", "/ɪnˈhæns/", "인-핸스", "The new design enhances the product's appeal.", "새 디자인은 제품의 매력을 높인다.", "더 누 디-자인 인-핸-시즈 더 프라-덕츠 어-필"],
    ["inspect", "점검하다", "동사", "/ɪnˈspekt/", "인-스펙트", "The quality team inspects every product.", "품질 팀은 모든 제품을 검사한다.", "더 콸-러-티 팀 인-스펙츠 에-브리 프라-덕트"],
    ["integrate", "통합하다", "동사", "/ˈɪntɪɡreɪt/", "인-터-그레이트", "We will integrate the two systems next month.", "다음 달에 두 시스템을 통합할 것이다.", "위 윌 인-터-그레이트 더 투 시스-텀즈 넥스트 먼스"],
    ["justify", "정당화하다", "동사", "/ˈdʒʌstɪfaɪ/", "저스-터-파이", "Could you justify the extra spending?", "추가 지출을 정당화할 수 있나요?", "쿠드 유 저스-터-파이 디 엑-스트라 스펜-딩"],
    ["modify", "수정하다", "동사", "/ˈmɑːdɪfaɪ/", "마-더-파이", "We may modify the schedule if needed.", "필요하면 일정을 수정할 수 있습니다.", "위 메이 마-더-파이 더 스케-줄 이프 니-디드"],
    ["overlap", "겹치다", "동사", "/ˌoʊvərˈlæp/", "오우-버-랩", "The two shifts overlap by thirty minutes.", "두 교대 근무는 30분 겹친다.", "더 투 쉬프츠 오우-버-랩 바이 써-티 미-닛츠"],
    ["procure", "조달하다", "동사", "/prəˈkjʊr/", "프러-큐어", "The team will procure materials from local suppliers.", "그 팀은 지역 공급업체에서 자재를 조달할 것이다.", "더 팀 윌 프러-큐어 머-티-리-얼즈 프럼 로-컬 서-플라이-어즈"],
    ["recruit", "채용하다", "동사", "/rɪˈkruːt/", "리-크루트", "The company is recruiting new graduates this spring.", "그 회사는 올봄 신입 졸업생을 채용하고 있다.", "더 컴-퍼-니 이즈 리-크루-팅 누 그래-주-에이츠 디스 스프링"],
    ["relocate", "이전하다", "동사", "/ˌriːˈloʊkeɪt/", "리-로우-케이트", "The office will relocate to a larger building.", "사무실이 더 큰 건물로 이전할 것이다.", "디 오-피스 윌 리-로우-케이트 투 어 라-저 빌-딩"],
    ["replenish", "보충하다", "동사", "/rɪˈplenɪʃ/", "리-플레-니시", "Please replenish the stock before the weekend.", "주말 전에 재고를 보충해 주세요.", "플리즈 리-플레-니시 더 스탁 비-포어 더 위크-엔드"],
    ["specify", "명시하다", "동사", "/ˈspesɪfaɪ/", "스페-서-파이", "Please specify the delivery date in your order.", "주문에 배송 날짜를 명시해 주세요.", "플리즈 스페-서-파이 더 디-리-버-리 데이트 인 유어 오-더"],
    ["terminate", "종료하다", "동사", "/ˈtɜːrmɪneɪt/", "터-미-네이트", "The lease will terminate in December.", "임대 계약은 12월에 종료된다.", "더 리스 윌 터-미-네이트 인 디-셈-버"],
    ["track", "추적하다", "동사", "/træk/", "트랙", "You can track your package online.", "온라인으로 소포를 추적할 수 있습니다.", "유 캔 트랙 유어 패-키지 온-라인"],
    ["update", "갱신하다", "동사", "/ˌʌpˈdeɪt/", "업-데이트", "Please update your contact information in the system.", "시스템에 연락처 정보를 업데이트해 주세요.", "플리즈 업-데이트 유어 칸-택트 인-퍼-메이-션 인 더 시스-텀"],
    ["utilize", "활용하다", "동사", "/ˈjuːtəlaɪz/", "유-터-라이즈", "We will utilize the vacant office space.", "우리는 빈 사무 공간을 활용할 것이다.", "위 윌 유-터-라이즈 더 베이-컨트 오-피스 스페이스"],
    ["withdraw", "철회하다", "동사", "/wɪðˈdrɔː/", "위드-드로우", "The company decided to withdraw its offer.", "그 회사는 제안을 철회하기로 결정했다.", "더 컴-퍼-니 디-사이-디드 투 위드-드로우 이츠 오-퍼"],
    ["accommodate", "수용하다", "동사", "/əˈkɑːmədeɪt/", "어-카-머-데이트", "The hall can accommodate up to two hundred guests.", "그 홀은 최대 200명의 손님을 수용할 수 있다.", "더 홀 캔 어-카-머-데이트 업 투 투 헌-드레드 게스트"],
    ["accompany", "동반하다", "동사", "/əˈkʌmpəni/", "어-컴-퍼-니", "A guide will accompany the visitors on the tour.", "안내자가 방문객과 함께 투어를 동행할 것이다.", "어 가이드 윌 어-컴-퍼-니 더 비-지-터즈 온 더 투어"],
    ["accumulate", "축적하다", "동사", "/əˈkjuːmjəleɪt/", "어-큐-뮤-레이트", "Unused inventory will accumulate in the warehouse.", "사용되지 않은 재고가 창고에 쌓일 것이다.", "언-유즈드 인-벤-토-리 윌 어-큐-뮤-레이트 인 더 웨어-하우스"],
    ["adequate", "적절한, 충분한", "형용사", "/ˈædɪkwət/", "애-디-쿼트", "Please make sure there is adequate storage space.", "충분한 보관 공간이 있는지 확인해 주세요.", "플리즈 메이크 슈어 데어 이즈 애-디-쿼트 스토-리지 스페이스"],
    ["adhere to", "준수하다", "구", "/ədˈhɪr tuː/", "어드-히어 투", "All contractors must adhere to the safety guidelines.", "모든 협력업체는 안전 지침을 준수해야 한다.", "올 칸-트랙-터즈 머스트 어드-히어 투 더 세이프-티 가이드-라인즈"],
    ["advocate", "지지하다", "동사", "/ˈædvəkeɪt/", "애드-버-케이트", "Many managers advocate a shorter approval process.", "많은 관리자가 더 짧은 승인 절차를 지지한다.", "매-니 매-니-저즈 애드-버-케이트 어 숄-터 어-프루-벌 프라-세스"],
    ["anticipate", "예상하다", "동사", "/ænˈtɪsɪpeɪt/", "앤-티-시-페이트", "We anticipate strong demand next quarter.", "다음 분기에 강한 수요를 예상한다.", "위 앤-티-시-페이트 스트롱 디-맨드 넥스트 퀄-터"],
    ["assemble", "조립하다, 모으다", "동사", "/əˈsembl/", "어-셈-블", "Workers assemble the parts on the assembly line.", "작업자들은 조립 라인에서 부품을 조립한다.", "워-커즈 어-셈-블 더 파츠 온 디 어-셈-블리 라인"],
    ["compliance", "준수", "명사", "/kəmˈplaɪəns/", "컴-플라이-언스", "All staff received training on safety compliance.", "모든 직원이 안전 준수 교육을 받았다.", "올 스태프 리-시브드 트레이-닝 온 세이프-티 컴-플라이-언스"],
    ["comprise", "구성하다", "동사", "/kəmˈpraɪz/", "컴-프라이즈", "The committee comprises members from three plants.", "위원회는 세 공장의 위원으로 구성된다.", "더 커-미-티 컴-프라이-지즈 멤-버즈 프럼 쓰리 플랜츠"],
    ["confine", "제한하다", "동사", "/kənˈfaɪn/", "컨-파인", "Please confine your comments to the agenda.", "발언을 안건에 한정해 주세요.", "플리즈 컨-파인 유어 카-먼츠 투 디 어-젠-다"],
    ["consecutive", "연속적인", "형용사", "/kənˈsekjətɪv/", "컨-세-큐-티브", "Sales rose for the third consecutive quarter.", "매출이 3분기 연속 상승했다.", "세일즈 로우즈 포 더 써드 컨-세-큐-티브 퀄-터"],
    ["contribute", "기여하다", "동사", "/kənˈtrɪbjuːt/", "컨-트리-뷰트", "Every member is expected to contribute ideas.", "모든 구성원이 아이디어를 내도록 기대된다.", "에-브리 멤-버 이즈 익-스펙-티드 투 컨-트리-뷰트 아이-디-어즈"],
    ["dedicate", "헌신하다, 바치다", "동사", "/ˈdedɪkeɪt/", "데-디-케이트", "She will dedicate next month to the audit.", "그녀는 다음 달을 감사에 바칠 것이다.", "시 윌 데-디-케이트 넥스트 먼스 투 디 오-딧"],
    ["delegate", "위임하다", "동사", "/ˈdelɪɡeɪt/", "델-리-게이트", "Managers should delegate routine tasks to assistants.", "관리자는 일상 업무를 비서에게 위임해야 한다.", "매-니-저즈 슈드 델-리-게이트 루-틴 태스크스 투 어-시스-턴츠"],
    ["demonstrate", "시연하다, 입증하다", "동사", "/ˈdemənstreɪt/", "데-먼-스트레이트", "The technician demonstrated how to use the equipment.", "기술자가 장비 사용법을 시연했다.", "더 텍-니-션 데-먼-스트레이-티드 하우 투 유즈 디 이-퀴프-먼트"],
    ["derive", "얻다, 유래하다", "동사", "/dɪˈraɪv/", "디-라이브", "Most revenue will derive from overseas sales.", "대부분의 수익은 해외 판매에서 나올 것이다.", "모우스트 레-베-뉴 윌 디-라이브 프럼 오우-버-시즈 세일즈"],
    ["deteriorate", "악화되다", "동사", "/dɪˈtɪriəreɪt/", "디-티-리-어-레이트", "Service quality will deteriorate without more staff.", "직원이 더 없으면 서비스 품질이 악화될 것이다.", "서-비스 퀄-러-티 윌 디-티-리-어-레이트 위드-아웃 모어 스태프"],
    ["determine", "결정하다", "동사", "/dɪˈtɜːrmɪn/", "디-터-민", "The survey will determine customer preferences.", "설문이 고객 선호도를 결정할 것이다.", "더 서-베이 윌 디-터-민 커스-터-머 프레-퍼-런-시즈"],
    ["discrepancy", "불일치", "명사", "/dɪˈskrepənsi/", "디-스크레-펀-시", "The auditor found a discrepancy between the invoices.", "회계사가 청구서 간 불일치를 발견했다.", "디 오-디-터 파운드 어 디-스크레-펀-시 비-트윈 디 인-보이-시즈"],
    ["diverse", "다양한", "형용사", "/daɪˈvɜːrs/", "다이-버스", "Our team has a diverse range of skills.", "우리 팀은 다양한 기술을 보유하고 있다.", "아워 팀 해즈 어 다이-버스 레인지 오브 스킬즈"],
    ["elaborate", "상세히 설명하다", "동사", "/ɪˈlæbəreɪt/", "이-래-버-레이트", "Could you elaborate on your proposal?", "제안에 대해 자세히 설명해 주시겠어요?", "쿠드 유 이-래-버-레이트 온 유어 프러-포우-즐"],
    ["eliminate", "제거하다", "동사", "/ɪˈlɪmɪneɪt/", "이-리-미-네이트", "The new system will eliminate manual entry.", "새 시스템은 수동 입력을 없앨 것이다.", "더 누 시스-텀 윌 이-리-미-네이트 매-뉴-얼 엔-트리"],
    ["emphasize", "강조하다", "동사", "/ˈemfəsaɪz/", "엠-퍼-사이즈", "The report emphasizes the need for training.", "그 보고서는 교육의 필요성을 강조한다.", "더 리-포-트 엠-퍼-사이-지즈 더 니드 포 트레이-닝"],
    ["entitle", "자격을 주다", "동사", "/ɪnˈtaɪtl/", "인-타이-틀", "This coupon entitles you to a free drink.", "이 쿠폰은 무료 음료를 받을 자격을 준다.", "디스 쿠-폰 인-타이-틀즈 유 투 어 프리 드링크"],
    ["exclusive", "독점적인", "형용사", "/ɪkˈskluːsɪv/", "익-스클루-시브", "Members receive exclusive discounts at this store.", "회원은 이 매장에서 독점 할인을 받는다.", "멤-버즈 리-시브 익-스클루-시브 디스-카운츠 앳 디스 스토어"],
    ["fluctuate", "변동하다", "동사", "/ˈflʌktʃueɪt/", "플럭-츄-에이트", "Prices fluctuate depending on the season.", "가격은 계절에 따라 변동한다.", "프라이-시즈 플럭-츄-에이트 디-펜-딩 온 더 시-즌"],
    ["indicate", "나타내다", "동사", "/ˈɪndɪkeɪt/", "인-디-케이트", "The figures indicate a steady rise in sales.", "수치는 매출의 꾸준한 상승을 나타낸다.", "더 피-겨즈 인-디-케이트 어 스테-디 라이즈 인 세일즈"],
    ["initiate", "시작하다", "동사", "/ɪˈnɪʃieɪt/", "이-니-시-에이트", "The firm will initiate the recall on Monday.", "그 회사는 월요일에 리콜을 시작할 것이다.", "더 펌 윌 이-니-시-에이트 더 리-콜 온 먼-데이"],
    ["maximize", "최대화하다", "동사", "/ˈmæksɪmaɪz/", "맥-시-마이즈", "We aim to maximize profits this year.", "올해 이익을 극대화하는 것이 목표다.", "위 에임 투 맥-시-마이즈 프라-핏츠 디스 이어"],
    ["outstanding", "미지불의, 뛰어난", "형용사", "/aʊtˈstændɪŋ/", "아웃-스탠-딩", "Two payments are still outstanding on the account.", "계좌에 아직 미지불된 두 건의 납부금이 있다.", "투 페이-먼츠 아 스틸 아웃-스탠-딩 온 디 어-카운트"],
    ["preliminary", "예비의", "형용사", "/prɪˈlɪmɪneri/", "프리-리-미-너-리", "The preliminary results look very promising.", "예비 결과가 매우 긍정적으로 보인다.", "더 프리-리-미-너-리 리-절츠 룩 베-리 프라-미-싱"],
    ["prohibit", "금지하다", "동사", "/prəˈhɪbɪt/", "프러-히-빗", "The rules prohibit smoking in all areas.", "규정은 모든 구역에서 흡연을 금지한다.", "더 룰즈 프러-히-빗 스모-킹 인 올 에-리-어즈"],
    ["prominent", "저명한", "형용사", "/ˈprɑːmɪnənt/", "프라-미-넌트", "She is a prominent figure in the industry.", "그녀는 업계에서 저명한 인물이다.", "시 이즈 어 프라-미-넌트 피-규어 인 디 인-더-스트리"],
    ["resume", "재개하다", "동사", "/rɪˈzuːm/", "리-줌", "The factory will resume production next week.", "공장은 다음 주에 생산을 재개할 것이다.", "더 팩-터-리 윌 리-줌 프러-덕-션 넥스트 위크"],
    ["solicit", "요청하다, 구하다", "동사", "/səˈlɪsɪt/", "서-리-싯", "The charity will solicit donations from local firms.", "그 자선단체는 지역 기업에 기부를 요청할 것이다.", "더 체-러-티 윌 서-리-싯 도-네이-션즈 프럼 로-컬 펌즈"],
    ["temporarily", "일시적으로", "부사", "/ˌtempəˈrerəli/", "템-퍼-레-러-리", "The elevator is temporarily out of service.", "엘리베이터가 일시적으로 운행 중단되었다.", "디 엘-리-베이-터 이즈 템-퍼-레-러-리 아웃 오브 서-비스"],
    ["unanimous", "만장일치의", "형용사", "/juˈnænɪməs/", "유-내-니-머스", "The board reached a unanimous decision.", "이사회는 만장일치로 결정을 내렸다.", "더 보드 리치트 어 유-내-니-머스 디-시-전"],
    ["versatile", "다재다능한", "형용사", "/ˈvɜːrsətl/", "버-서-틀", "She is a versatile employee who handles many roles.", "그녀는 여러 역할을 맡는 다재다능한 직원이다.", "시 이즈 어 버-서-틀 임-플로이-이 후 핸-들즈 매-니 롤즈"],
    ["vital", "필수적인", "형용사", "/ˈvaɪtl/", "바이-틀", "Clear labels are vital for accurate shipping.", "정확한 배송을 위해 명확한 라벨은 필수적이다.", "클리어 레이-블즈 아 바이-틀 포 애-큐-럿 쉽-핑"],
    ["accomplish", "달성하다", "동사", "/əˈkɑːmplɪʃ/", "어-캄-플리시", "The team accomplished the goal ahead of schedule.", "그 팀은 일정보다 앞서 목표를 달성했다.", "더 팀 어-캄-플리시트 더 고울 어-헤드 오브 스케-줄"],
    ["acquisition", "인수", "명사", "/ˌækwɪˈzɪʃn/", "애-퀴-지-션", "The acquisition of the startup was announced today.", "그 스타트업의 인수가 오늘 발표되었다.", "디 애-퀴-지-션 오브 더 스타트-업 워즈 어-나운스트 투-데이"],
    ["adjust", "조정하다", "동사", "/əˈdʒʌst/", "어-저스트", "You can adjust the temperature with this button.", "이 버튼으로 온도를 조절할 수 있다.", "유 캔 어-저스트 더 템-퍼-러-처 위드 디스 버-턴"],
    ["advisor", "조언자", "명사", "/ədˈvaɪzər/", "어드-바이-저", "Our financial advisor recommended a safer plan.", "우리 재무 자문가가 더 안전한 계획을 추천했다.", "아워 파이-낸-셜 어드-바이-저 레-커-멘-디드 어 세이-퍼 플랜"],
    ["affordable", "저렴한", "형용사", "/əˈfɔːrdəbl/", "어-포-더-블", "The hotel offers clean and affordable rooms.", "그 호텔은 깨끗하고 저렴한 객실을 제공한다.", "더 호-텔 오-퍼즈 클린 앤드 어-포-더-블 룸즈"],
    ["agenda", "안건", "명사", "/əˈdʒendə/", "어-젠-다", "Please add the budget issue to the agenda.", "예산 문제를 의제에 추가해 주세요.", "플리즈 애드 더 버-짓 이슈 투 디 어-젠-다"],
    ["annually", "매년", "부사", "/ˈænjuəli/", "애-뉴-얼-리", "The company reviews all salaries annually.", "회사는 매년 모든 급여를 검토한다.", "더 컴-퍼-니 리-뷰즈 올 샐-러-리즈 애-뉴-얼-리"],
    ["applicant", "지원자", "명사", "/ˈæplɪkənt/", "애-플리-컨트", "The applicants must have at least two years of experience.", "지원자는 최소 2년의 경력이 있어야 한다.", "디 애-플리-컨츠 머스트 해브 앳 리스트 투 이어즈 오브 익-스피-리-언스"],
    ["approval", "승인", "명사", "/əˈpruːvl/", "어-프루-벌", "The plan is waiting for final approval.", "그 계획은 최종 승인을 기다리고 있다.", "더 플랜 이즈 웨이-팅 포 파이-널 어-프루-벌"],
    ["asset", "자산", "명사", "/ˈæset/", "애-셋", "The building is the company's main asset.", "그 건물은 회사의 주요 자산이다.", "더 빌-딩 이즈 더 컴-퍼-니즈 메인 애-셋"],
    ["attendance", "참석", "명사", "/əˈtendəns/", "어-텐-던스", "Attendance at the seminar was higher than expected.", "세미나 참석률은 예상보다 높았다.", "어-텐-던스 앳 더 세-미-나 워즈 하이-어 댄 익-스펙-티드"],
    ["beneficial", "유익한", "형용사", "/ˌbenɪˈfɪʃl/", "베-너-피-셜", "Regular exercise is beneficial for office workers.", "규칙적인 운동은 사무직 근로자에게 유익하다.", "레-규-러 랩-서-사이즈 이즈 베-너-피-셜 포 오-피스 워-커즈"],
    ["brochure", "안내 책자", "명사", "/ˈbroʊʃər/", "브로우-셔", "Please take a brochure about our services.", "우리 서비스에 대한 브로슈어를 가져가세요.", "플리즈 테이크 어 브로우-셔 어-바웃 아워 서-비-시즈"],
    ["budget", "예산", "명사", "/ˈbʌdʒɪt/", "버-짓", "We need to stay within the budget this quarter.", "이번 분기에는 예산 범위 내에서 지출해야 한다.", "위 니드 투 스테이 위드-인 더 버-짓 디스 콰-터"],
    ["candidate", "후보자", "명사", "/ˈkændɪdət/", "캔-디-뎃", "We interviewed five candidates for the position.", "우리는 그 직위에 지원한 후보자 다섯 명을 면접했다.", "위 인-터-뷰드 파이브 캔-디-데이츠 포 더 퍼-지-션"],
    ["capacity", "수용력", "명사", "/kəˈpæsəti/", "커-패-서-티", "The conference room has a capacity of fifty people.", "회의실은 50명을 수용할 수 있는 규모다.", "더 칸-퍼-런스 룸 해즈 어 커-패-서-티 오브 피프-티 피-플"],
    ["category", "범주", "명사", "/ˈkætəɡɔːri/", "캐-터-고-리", "Please select a category for your request.", "요청에 대한 범주를 선택해 주세요.", "플리즈 셀-렉트 어 캐-터-고-리 포 유어 리-퀘스트"],
    ["certificate", "증명서", "명사", "/sərˈtɪfɪkət/", "서-티-피-킷", "You need a certificate to operate this machine.", "이 기계를 작동하려면 자격증이 필요하다.", "유 니드 어 서-티-피-킷 투 아-퍼-레이트 디스 머-신"],
    ["clarify", "명확히 하다", "동사", "/ˈklærəfaɪ/", "클래-러-파이", "Could you clarify the payment terms in the contract?", "계약서의 지불 조건을 명확히 해 주시겠어요?", "쿠드 유 클래-러-파이 더 페이-먼트 텀즈 인 더 칸-트랙트"],
    ["collaborate", "협업하다", "동사", "/kəˈlæbəreɪt/", "컬-래-버-레이트", "The teams collaborate on product development.", "팀들은 제품 개발을 위해 공동 작업한다.", "더 팀즈 컬-래-버-레이트 온 프라-덕트 디-벨-럽-먼트"],
    ["commitment", "약속, 전념", "명사", "/kəˈmɪtmənt/", "커-밋-먼트", "We appreciate your commitment to the project.", "프로젝트에 대한 귀하의 헌신에 감사드립니다.", "위 어-프리-시-에이트 유어 커-밋-먼트 투 더 프라-젝트"],
    ["complimentary", "무료의", "형용사", "/ˌkɑːmplɪˈmentri/", "캄-플리-멘-트리", "Guests enjoy a complimentary breakfast each morning.", "투숙객은 매일 아침 무료 조식을 즐긴다.", "게스트즈 인-조이 어 캄-플리-멘-트리 브렉-퍼스트 이치 모-닝"],
    ["condition", "조건", "명사", "/kənˈdɪʃn/", "컨-디-션", "The products arrived in perfect condition.", "제품이 완벽한 상태로 도착했다.", "더 프라-덕츠 어-라이브드 인 퍼-펙트 컨-디-션"],
    ["conference", "회의", "명사", "/ˈkɑːnfərəns/", "칸-퍼-런스", "She attended a marketing conference in Las Vegas.", "그녀는 라스베이거스에서 열린 마케팅 학회에 참석했다.", "시 어-텐-디드 어 마-키-팅 칸-퍼-런스 인 라스 베이-거스"],
    ["consequence", "결과", "명사", "/ˈkɑːnsɪkwens/", "칸-시-퀀스", "Late payment has serious consequences for the account.", "연체는 계좌에 심각한 결과를 초래한다.", "레이트 페이-먼트 해즈 시-리-어스 칸-시-퀀-시즈 포 디 어-카운트"],
    ["contract", "계약", "명사", "/ˈkɑːntrækt/", "칸-트랙트", "The two companies signed a five-year contract.", "두 회사는 5년 계약을 체결했다.", "더 투 컴-퍼-니즈 사인드 어 파이브-이어 칸-트랙트"],
    ["convenient", "편리한", "형용사", "/kənˈviːniənt/", "컨-비-니-언트", "Online banking is very convenient for customers.", "온라인 뱅킹은 고객에게 매우 편리하다.", "온-라인 뱅-킹 이즈 베-리 컨-비-니-언트 포 커스-터-머즈"],
    ["courtesy", "예의", "명사", "/ˈkɜːrtəsi/", "커-터-시", "We extend a courtesy discount to loyal customers.", "우리는 단골 고객에게 예의상 할인을 제공한다.", "위 익-스텐드 어 커-터-시 디스-카운트 투 로이-얼 커스-터-머즈"],
    ["defect", "결함", "명사", "/ˈdiːfekt/", "디-펙트", "The company recalled the product due to a defect.", "그 회사는 결함 때문에 제품을 리콜했다.", "더 컴-퍼-니 리-콜드 더 프라-덕트 두 투 어 디-펙트"],
    ["deposit", "보증금", "명사", "/dɪˈpɑːzɪt/", "디-파-짓", "A deposit is required to reserve the room.", "객실을 예약하려면 보증금이 필요하다.", "어 디-파-짓 이즈 리-콰이-어드 투 리-저브 더 룸"],
    ["documentation", "문서 자료", "명사", "/ˌdɑːkjumenˈteɪʃn/", "다-큐-멘-테이-션", "Please submit the documentation for your visa.", "비자용 서류를 제출해 주세요.", "플리즈 섭-밋 더 다-큐-멘-테이-션 포 유어 비-자"],
    ["enclose", "동봉하다", "동사", "/ɪnˈkloʊz/", "인-클로우즈", "I enclose my resume with this application.", "이 지원서와 함께 이력서를 동봉합니다.", "아이 인-클로우즈 마이 레-저-메이 위드 디스 애-플리-케이-션"],
    ["enroll", "등록하다", "동사", "/ɪnˈroʊl/", "인-로울", "She enrolled in an online marketing course.", "그녀는 온라인 마케팅 과정에 등록했다.", "시 인-로울드 인 언 온-라인 마-키-팅 코스"],
    ["enthusiastic", "열정적인", "형용사", "/ɪnˌθuːziˈæstɪk/", "인-투-지-애스-틱", "The staff were enthusiastic about the new plan.", "직원들은 새 계획에 열정적이었다.", "더 스태프 워 인-투-지-애스-틱 어-바웃 더 누 플랜"],
    ["equipment", "장비", "명사", "/ɪˈkwɪpmənt/", "이-퀴프-먼트", "The laboratory has modern equipment for testing new materials.", "그 실험실은 새 재료를 시험할 현대적인 장비를 갖추고 있다.", "더 래-버-러-토-리 해즈 마-던 이-퀴프-먼트 포 테스-팅 뉴 머-티-리-얼즈"],
    ["establish", "설립하다", "동사", "/ɪˈstæblɪʃ/", "이-스태브-리시", "The firm will establish a branch in Busan.", "그 회사는 부산에 지사를 설립할 것이다.", "더 펌 윌 이-스태브-리시 어 브랜치 인 부-산"],
    ["expand", "확장하다", "동사", "/ɪkˈspænd/", "익-스팬드", "The retailer plans to expand its online store.", "그 소매업체는 온라인 매장을 확장할 계획이다.", "더 리-테일-러 플랜즈 투 익-스팬드 이츠 온-라인 스토어"],
    ["expertise", "전문성", "명사", "/ˌekspɜːrˈtiːz/", "엑-스퍼-티즈", "We hired her for her marketing expertise.", "우리는 마케팅 전문성을 보고 그녀를 채용했다.", "위 하이어드 허 포 허 마-키-팅 엑-스퍼-티즈"],
    ["furniture", "가구", "명사", "/ˈfɜːrntʃər/", "퍼-니-처", "New office furniture was delivered yesterday.", "새 사무용 가구가 어제 배송되었다.", "누 오-피스 퍼-니-처 워즈 디-리-버드 예스-터-데이"],
    ["guarantee", "보증하다", "동사", "/ˌɡærənˈtiː/", "개-런-티", "We guarantee the quality of all our products.", "우리는 모든 제품의 품질을 보장한다.", "위 개-런-티 더 콸-러-티 오브 올 아워 프라-덕츠"]
  ],

  /* ============ 10. 숫자·금액 듣기 집중 ============ */
  numbers: [
    { tag: "가격", audio: "The membership fee is two hundred ninety-five dollars.", a: "$295", opts: ["$295", "$205", "$259", "$2950"], why: "two hundred ninety-five = 295" },
    { tag: "가격", audio: "The tickets cost forty dollars each, or seventy for a pair.", a: "$70", opts: ["$40", "$70", "$74", "$77"], why: "a pair(두 장) 가격은 70달러입니다." },
    { tag: "날짜", audio: "The registration deadline is the third of August.", a: "8월 3일", opts: ["8월 3일", "8월 13일", "8월 30일", "3월 8일"], why: "the third of August = 8월 3일" },
    { tag: "날짜", audio: "Your appointment is on the twenty-second of September.", a: "9월 22일", opts: ["9월 22일", "9월 2일", "9월 12일", "2월 9일"], why: "the twenty-second = 22일" },
    { tag: "전화번호", audio: "You can reach our office at five five five, oh one seven two.", a: "555-0172", opts: ["555-0172", "555-1072", "505-0172", "555-0712"], why: "oh은 0을 의미합니다." },
    { tag: "전화번호", audio: "Please call the hotline at eight hundred, two four six, nine triple three.", a: "800-246-9333", opts: ["800-246-9333", "800-246-933", "800-246-9330", "880-246-9333"], why: "triple three = 333" },
    { tag: "수량", audio: "We ordered three dozen boxes.", a: "36개", opts: ["36개", "13개", "30개", "3개"], why: "a dozen = 12, three dozen = 36" },
    { tag: "수량", audio: "Nearly half of the staff attended the workshop.", a: "약 절반", opts: ["약 절반", "약 15%", "거의 전부", "약 4분의 1"], why: "half = 절반" },
    { tag: "시간", audio: "The shuttle leaves every quarter past the hour.", a: "매시 15분", opts: ["매시 15분", "매시 45분", "30분마다", "매시 정각"], why: "a quarter past = ~시 15분" },
    { tag: "시간", audio: "Please arrive by ten to nine.", a: "8시 50분", opts: ["8시 50분", "9시 10분", "9시 50분", "8시 10분"], why: "ten to nine = 9시까지 10분 남은 시각 = 8시 50분" },
    { tag: "가격", audio: "The annual subscription costs one thousand two hundred dollars.", a: "$1,200", opts: ["$1,200", "$120", "$12,000", "$1,020"], why: "one thousand two hundred = 1,200" },
    { tag: "가격", audio: "Rooms start at ninety-nine dollars a night.", a: "$99", opts: ["$99", "$19", "$909", "$9"], why: "ninety-nine = 99입니다." },
    { tag: "날짜", audio: "Our fiscal year begins on the twenty-fifth of March.", a: "3월 25일", opts: ["3월 25일", "5월 23일", "3월 5일", "2월 25일"], why: "the twenty-fifth of March = 3월 25일" },
    { tag: "수량", audio: "Three quarters of the staff completed the survey.", a: "약 75%", opts: ["약 75%", "약 25%", "약 34%", "약 50%"], why: "three quarters = 4분의 3 = 75%" },
    { tag: "수량", audio: "We need two dozen additional chairs.", a: "24개", opts: ["24개", "12개", "22개", "20개"], why: "a dozen = 12, two dozen = 24" },
    { tag: "시간", audio: "The session runs from nine thirty to eleven.", a: "9시 30분~11시", opts: ["9시 30분~11시", "9시 13분~11시", "11시~9시 30분", "9시~11시 30분"], why: "nine thirty = 9시 30분, from A to B = A부터 B까지" },
    { tag: "전화번호", audio: "Our fax number is two oh two, five five five, oh one zero one.", a: "202-555-0101", opts: ["202-555-0101", "212-555-0101", "202-555-0110", "202-505-0101"], why: "oh는 0을 의미합니다: 2-0-2 5-5-5 0-1-0-1" }
  ],

  /* ============ 11. 말하기·쓰기 시험 구성과 템플릿 ============ */
  /* 공식 구성은 ETS 안내를 기준으로 하며, audit-site 가 문항 수를 대조한다.
     Speaking 11문항(약 20분, 0~200점) · Writing 8문항(약 60분, 0~200점) */
  swFormat: [
    { test: "Speaking", q: "1-2", task: "Read a text aloud", ko: "지문 낭독", time: "준비 45초, 낭독 45초", points: ["발음", "억양과 강세"] },
    { test: "Speaking", q: "3-4", task: "Describe a picture", ko: "사진 묘사", time: "준비 45초, 말하기 30초", points: ["문법", "어휘", "일관성"] },
    { test: "Speaking", q: "5-7", task: "Respond to questions", ko: "질문에 답하기", time: "문항 5와 6은 15초, 문항 7은 30초", points: ["내용 구성", "유창성"] },
    { test: "Speaking", q: "8-10", task: "Respond to questions using information provided", ko: "제공된 정보 활용 답변", time: "정보 읽기 45초, 문항 8과 9는 15초, 문항 10은 30초", points: ["정보 정확성", "표현력"] },
    { test: "Speaking", q: "11", task: "Express an opinion", ko: "의견 제시", time: "준비 45초, 말하기 60초", points: ["논리 전개", "근거 제시"] },
    { test: "Writing", q: "1-5", task: "Write a sentence based on a picture", ko: "사진 보고 한 문장 쓰기", time: "제시된 두 단어를 모두 사용", points: ["문법", "사진과의 관련성"] },
    { test: "Writing", q: "6-7", task: "Respond to a written request", ko: "이메일 답장 쓰기", time: "문항당 10분", points: ["과제 수행", "표현의 다양성"] },
    { test: "Writing", q: "8", task: "Write an opinion essay", ko: "의견 에세이 쓰기", time: "최소 300단어", points: ["논리", "근거", "문장 다양성"] }
  ],
  speakTemplates: [
    { type: "Q1-2 지문 낭독", ko: "공지문 낭독 프레임", lines: ["Attention, all staff. The employee parking lot will be closed for resurfacing from Monday through Wednesday.", "Please use the visitor lot behind the main building during this period. We apologize for any inconvenience."] },
    { type: "Q3-4 사진 묘사", ko: "사진 묘사 프레임", lines: ["This picture shows a busy office scene.", "In the center, a man is handing a document to his colleague. On the left, two people are looking at a computer screen.", "In the background, you can see shelves full of files and a large window."] },
    { type: "Q5-7 질문에 답하기", ko: "친숙한 주제 답변", lines: ["I usually start my day by checking emails and setting priorities for the morning.", "On busy days, I write a short list so that I do not forget important tasks.", "I also try to leave some time for unexpected requests from my team."] },
    { type: "Q8-10 제공된 정보 활용", ko: "일정표 보고 답하기", lines: ["According to the schedule, the workshop begins at nine in the morning in Room 302.", "The registration desk opens thirty minutes earlier, so please arrive by eight thirty.", "If you need to change your session, contact the front desk before Friday."] },
    { type: "Q11 의견 제시", ko: "찬반 의견 말하기", lines: ["In my opinion, working from home increases productivity for two reasons.", "First, employees save commuting time and can focus better on their tasks.", "For example, our team finished the last project two weeks earlier than planned."] }
  ],
  writeTemplates: [
    { type: "Q1-5 사진 묘사 문장", ko: "두 단어로 한 문장 완성", structure: ["제시된 두 단어를 모두 사용", "사진의 동작을 현재진행형으로", "장소나 대상을 덧붙여 완성"], sample: "The speaker is giving a presentation at a conference." },
    { type: "Q1-5 사진 묘사 문장", ko: "사물 묘사 한 문장", structure: ["두 단어의 형태를 바꿔 사용", "수동태나 there is 구문 활용", "수량과 위치를 함께 표현"], sample: "Several boxes are stacked on a shelf in the warehouse." },
    { type: "Q6-7 이메일 답장", ko: "회의 일정 변경 안내", structure: ["인사 및 목적", "변경 내용 요약", "양해 요청과 마무리"], sample: "Dear Mr. Lee, I am writing to let you know that the sales meeting has been moved from Tuesday to Thursday at 2 p.m. Please let me know if the new time works for you. Thank you for your understanding." },
    { type: "Q6-7 이메일 답장", ko: "제품 불만 접수와 사과", structure: ["사과", "문제 설명", "해결 방안 제시"], sample: "I sincerely apologize for the defect in the printer you purchased last week. We have arranged to send a replacement today at no extra cost. Please let us know if you need any further assistance." },
    { type: "Q6-7 이메일 답장", ko: "가격 견적 요청", structure: ["인사", "요청 내용과 수량", "회신 기한"], sample: "Hello, we are interested in purchasing 200 units of your office chairs. Could you please send us a quote, including delivery costs, by the end of this week?" },
    { type: "Q8 의견 에세이", ko: "재택근무 확대 찬반", structure: ["서론: 입장 제시", "본론 1: 첫 번째 근거와 예시", "본론 2: 두 번째 근거와 예시", "결론: 요약과 재강조"], sample: "Many companies are now deciding how often employees should work from home. In my view, a hybrid schedule is the most practical choice. First, it reduces commuting time, which gives employees more hours for focused work. Second, it keeps teams connected because everyone meets in person at least twice a week. For these reasons, a hybrid schedule benefits both companies and their staff." },
    { type: "Q8 의견 에세이", ko: "사내 교육 예산 확대", structure: ["서론: 배경과 입장", "본론: 비용 대비 효과", "반론 인정과 반박", "결론: 제안"], sample: "Some managers argue that training programs are too expensive to keep. I disagree, because skilled employees save far more money than the programs cost. Training reduces mistakes, shortens project time, and lowers turnover. Although the initial fee may look high, the return appears within a single year." }
  ],

  /* ============ 11-2. 말하기 유형별 연습 ============ */
  speakDrills: [
    { type: "Q1-2 지문 낭독", ko: "매장 영업시간 안내문", text: "Thank you for shopping at Greenway Market. Our store hours are from nine in the morning to ten at night on weekdays, and from ten to eight on Sundays.", tip: "45초 동안 문장 부호에서 끊어 읽고, 숫자와 요일은 또렷하게 발음하세요." },
    { type: "Q1-2 지문 낭독", ko: "행사 안내 방송", text: "Welcome to the annual business forum. Please keep your badge visible at all times, and note that the keynote speech will begin promptly at ten.", tip: "고유명사와 시간 표현에서 강세를 살짝 눌러 주면 훨씬 자연스럽습니다." },
    { type: "Q3-4 사진 묘사", ko: "회의실에서 발표하는 장면", text: "This picture shows a meeting room where a woman is presenting in front of a screen. Three colleagues are seated at the table and taking notes.", tip: "중심 인물, 주변 인물, 배경 순서로 30초 동안 이어서 말해 보세요." },
    { type: "Q3-4 사진 묘사", ko: "물류 창고에서 상자를 옮기는 장면", text: "In this picture, two workers are carrying boxes in a large warehouse while a forklift is parked nearby.", tip: "진행형으로 동작을 묘사하고, 위치 표현 next to와 behind를 한 번씩 넣어 보세요." },
    { type: "Q5-7 질문에 답하기", ko: "업무 루틴 질문", text: "How do you usually organize your tasks when you have several deadlines in the same week?", tip: "문항 5와 6은 15초, 문항 7은 30초입니다. 첫 문장에서 결론을 말하고 이유를 붙이세요." },
    { type: "Q5-7 질문에 답하기", ko: "선호도 질문", text: "What do you enjoy most about working in a team, and why?", tip: "I enjoy ~ because ~ 구조로 시작하면 15초 안에 답을 끝낼 수 있습니다." },
    { type: "Q8-10 제공된 정보 활용", ko: "워크숍 일정표", text: "According to the schedule, what time does the afternoon session start, and which room is it in?", tip: "일정표를 먼저 45초간 훑고 시간, 장소, 담당자 순으로 메모한 뒤 답하세요." },
    { type: "Q8-10 제공된 정보 활용", ko: "고객센터 운영표", text: "I would like to know whether the customer center is open on Saturday afternoon.", tip: "문항 10은 두 번 들려줍니다. 질문의 핵심 명사 하나를 받아 답을 시작하세요." },
    { type: "Q11 의견 제시", ko: "회의는 대면이 좋은가", text: "Some people believe that online meetings are more efficient than in-person meetings. What is your opinion and why?", tip: "준비 45초, 말하기 60초입니다. 입장, 근거 두 가지, 예시 하나, 마무리 순서로 구성하세요." },
    { type: "Q11 의견 제시", ko: "직원 교육은 언제 해야 하나", text: "Should companies provide training during working hours or outside them? Explain your view with reasons.", tip: "한쪽 입장을 분명히 밝히고 반대 의견도 한 문장으로 인정해 주면 점수가 올라갑니다." }
  ],

  /* ============ 11-3. 쓰기 유형별 연습 ============ */
  writeDrills: [
    { type: "Q1-5 사진 묘사 문장", ko: "행사장에서 발표하는 장면", given: ["conference", "presentation"], sample: "The speaker is giving a presentation at a conference." },
    { type: "Q1-5 사진 묘사 문장", ko: "창고에 상자가 쌓인 장면", given: ["warehouse", "stack"], sample: "Several boxes are stacked on a shelf in the warehouse." },
    { type: "Q1-5 사진 묘사 문장", ko: "매장 앞 보도를 고치는 장면", given: ["sidewalk", "repair"], sample: "Workers are repairing the sidewalk in front of the store." },
    { type: "Q6-7 이메일 답장", ko: "배송 지연에 답장하기", request: "Our order was supposed to arrive on Monday, but it has not been delivered yet. Could you tell us what happened and when we can expect it?", sample: "Dear Ms. Carter, Thank you for your message. I am sorry for the delay; a customs inspection held your shipment for two days. It will arrive by Thursday, and I will send you the tracking number today." },
    { type: "Q6-7 이메일 답장", ko: "회의 참석 요청에 답장하기", request: "We are planning a product review meeting next Tuesday at three. Can you join us and bring the latest sales figures?", sample: "Thank you for the invitation. I can join the product review on Tuesday at three, and I will bring the latest sales figures for the second quarter." },
    { type: "Q6-7 이메일 답장", ko: "환불 요청에 답장하기", request: "I would like to return the keyboard I bought last week because two keys do not work. Is a refund possible?", sample: "I apologize for the problem with your keyboard. A full refund is possible, and you can return the item using the prepaid label attached to this email." },
    { type: "Q8 의견 에세이", ko: "재택근무를 늘려야 할까", question: "Some companies now allow employees to work from home several days a week. Do you think this change benefits companies?", sample: "Many companies have adopted remote work policies in recent years. In my opinion, this change benefits companies for two main reasons." },
    { type: "Q8 의견 에세이", ko: "대학 교육은 실습 중심이어야 할까", question: "Should universities focus more on practical skills than on theory? State your opinion and support it with examples.", sample: "Universities should keep a balance between theory and practice. Practical courses help students find jobs, but theory gives them the tools to keep learning after they graduate." }
  ],

  /* ============ 12. 비즈니스 상황극 ============ */
  situations: [
    { title: "항공권 예약 변경", theme: "✈️ Travel",
      lines: [
        ["A", "I need to change my flight to Tokyo from Friday to Saturday.", "I need to change my flight to Tokyo from Friday to Saturday."],
        ["B", "Certainly. There is a 9 a.m. flight on Saturday. Is that ＿＿＿＿ for you?", "Certainly. There is a 9 a.m. flight on Saturday. Is that suitable for you?"],
        ["A", "Yes, that works. Is there any change ＿＿＿＿?", "Yes, that works. Is there any change fee?"],
        ["B", "No, the first change is free of charge.", "No, the first change is free of charge."]
      ],
      quiz: [
        { q: "빈칸에 들어갈 단어는?", a: "suitable", opts: ["suitable", "available", "reasonable", "absent"] },
        { q: "변경 수수료에 대한 설명으로 옳은 것은?", a: "첫 변경은 무료", opts: ["첫 변경은 무료", "20달러 부과", "변경 불가", "요금이 두 배"] }
      ] },
    { title: "호텔 체크인 문제", theme: "🏨 Hotel",
      lines: [
        ["G", "Hello, I have a reservation under the name Park, but my room is not ready.", "Hello, I have a reservation under the name Park, but my room is not ready."],
        ["C", "I apologize for the ＿＿＿＿. We can offer you a free upgrade.", "I apologize for the inconvenience. We can offer you a free upgrade."],
        ["G", "That would be great. When can I check in?", "That would be great. When can I check in?"],
        ["C", "Your room will be ready in about twenty ＿＿＿＿.", "Your room will be ready in about twenty minutes."]
      ],
      quiz: [
        { q: "빈칸에 들어갈 단어는?", a: "inconvenience", opts: ["inconvenience", "reservation", "department", "instruction"] },
        { q: "호텔이 제안한 보상은?", a: "무료 업그레이드", opts: ["무료 업그레이드", "조식 쿠폰", "환불", "늦은 체크아웃"] }
      ] },
    { title: "제품 불만 상담", theme: "🙋 Support",
      lines: [
        ["C", "The laptop I bought last month keeps shutting down.", "The laptop I bought last month keeps shutting down."],
        ["S", "I am sorry to hear that. Do you have the ＿＿＿＿?", "I am sorry to hear that. Do you have the receipt?"],
        ["C", "Yes, I do. I would like a replacement, not a refund.", "Yes, I do. I would like a replacement, not a refund."],
        ["S", "We can send a replacement within three business ＿＿＿＿.", "We can send a replacement within three business days."]
      ],
      quiz: [
        { q: "빈칸에 들어갈 단어는?", a: "receipt", opts: ["receipt", "invoice", "warranty", "coupon"] },
        { q: "고객이 원하는 것은?", a: "교체", opts: ["교체", "환불", "수리", "할인"] }
      ] },
    { title: "납품 일정 조율", theme: "🚚 Logistics",
      lines: [
        ["B", "Can you deliver the materials ＿＿＿＿ the end of this week?", "Can you deliver the materials by the end of this week?"],
        ["S", "That may be difficult due to a shortage of drivers.", "That may be difficult due to a shortage of drivers."],
        ["B", "Then please send half of the order first.", "Then please send half of the order first."],
        ["S", "We will ＿＿＿＿ the first shipment tomorrow.", "We will dispatch the first shipment tomorrow."]
      ],
      quiz: [
        { q: "빈칸에 들어갈 단어는?", a: "dispatch", opts: ["dispatch", "discount", "dismiss", "display"] },
        { q: "납품이 어려운 이유는?", a: "운전기사 부족", opts: ["운전기사 부족", "재고 부족", "예산 부족", "창고 폐쇄"] }
      ] },
    { title: "은행 계좌 개설", theme: "🏦 Banking",
      lines: [
        ["T", "Good morning. I would like to open a business account.", "Good morning. I would like to open a business account."],
        ["C", "Certainly. Could you provide two forms of ＿＿＿＿ and your business license?", "Certainly. Could you provide two forms of identification and your business license?"],
        ["T", "I have my passport and driver's license. Is there a minimum ＿＿＿＿?", "I have my passport and driver's license. Is there a minimum deposit?"],
        ["C", "Yes, five hundred dollars for business accounts.", "Yes, five hundred dollars for business accounts."]
      ],
      quiz: [
        { q: "빈칸에 들어갈 단어는?", a: "identification", opts: ["identification", "application", "instruction", "installation"] },
        { q: "사업용 계좌의 최소 예치금은?", a: "500달러", opts: ["500달러", "100달러", "50달러", "최소 금액 없음"] }
      ] },
    { title: "사무용품 구매 문의", theme: "🖥 Office",
      lines: [
        ["B", "Hi, I would like to order twenty boxes of printer paper.", "Hi, I would like to order twenty boxes of printer paper."],
        ["S", "Certainly. We offer free shipping on orders over one hundred dollars. Would you like to ＿＿＿＿ the express option?", "Certainly. We offer free shipping on orders over one hundred dollars. Would you like to add the express option?"],
        ["B", "No, standard delivery is fine. When will it ＿＿＿＿?", "No, standard delivery is fine. When will it arrive?"],
        ["S", "Within three business days.", "Within three business days."]
      ],
      quiz: [
        { q: "빈칸에 들어갈 단어는?", a: "add", opts: ["add", "reduce", "cancel", "return"] },
        { q: "표준 배송은 언제 도착하는가?", a: "3영업일 이내", opts: ["3영업일 이내", "당일", "1주일 이내", "5일 이내"] }
      ] },
    { title: "컨퍼런스 등록 문의", theme: "🎤 Event",
      lines: [
        ["C", "I would like to register for the marketing conference in June.", "I would like to register for the marketing conference in June."],
        ["S", "Of course. Are you ＿＿＿＿ for the early-bird rate?", "Of course. Are you eligible for the early-bird rate?"],
        ["C", "I am not sure. I registered on the website yesterday.", "I am not sure. I registered on the website yesterday."],
        ["S", "Let me check. The early-bird rate applies to registrations ＿＿＿＿ May 31.", "Let me check. The early-bird rate applies to registrations before May 31."]
      ],
      quiz: [
        { q: "빈칸에 들어갈 단어는?", a: "eligible", opts: ["eligible", "available", "reliable", "suitable"] },
        { q: "얼리버드 요금이 적용되는 시점은?", a: "5월 31일 이전 등록", opts: ["5월 31일 이전 등록", "6월 이후 등록", "현장 등록", "온라인 등록 전체"] }
      ] },
    { title: "사무실 임대 상담", theme: "🏢 Property",
      lines: [
        ["T", "I am interested in the office space on the eighth floor.", "I am interested in the office space on the eighth floor."],
        ["A", "Great. The monthly rent includes utilities, but the deposit is one month's rent.", "Great. The monthly rent includes utilities, but the deposit is one month's rent."],
        ["T", "Is the space ＿＿＿＿ for about fifty employees?", "Is the space sufficient for about fifty employees?"],
        ["A", "Yes, and the minimum ＿＿＿＿ is one year.", "Yes, and the minimum lease term is one year."]
      ],
      quiz: [
        { q: "빈칸에 들어갈 단어는?", a: "sufficient", opts: ["sufficient", "frequent", "efficient", "confident"] },
        { q: "월세에 포함되는 것은?", a: "공과금", opts: ["공과금", "보증금", "인테리어 비용", "주차비"] }
      ] }
  ],

  /* ============ 13. 어원 스토리 카드 ============ */
  stories: [
    { word: "salary", root: "sal(소금) + ary", tip: "로마 시대에 소금(sal)을 사는 돈으로 주던 것에서 '급여'가 되었어요.", ex: "He earns a competitive salary." },
    { word: "bankrupt", root: "banca(벤치) + ruptus(부러진)", tip: "이탈리아 환전상의 벤치가 부서졌다 → 파산하다.", ex: "The chain went bankrupt last year." },
    { word: "candidate", root: "candid(하얀) + ate", tip: "고대 로마에서 하얀 토가를 입고 출마한 사람 → 후보자.", ex: "Three candidates applied for the position." },
    { word: "deadline", root: "dead(넘을 수 없는) + line(선)", tip: "넘으면 안 되는 선 → 마감 기한.", ex: "We must meet the deadline this Friday." },
    { word: "budget", root: "bulga(가죽 주머니)", tip: "돈을 넣던 작은 가죽 주머니 → 예산.", ex: "We need to stay within the budget." },
    { word: "negotiate", root: "neg(아닌) + oti(여가) + ate", tip: "여가(쉴 시간)가 아닌 일 → 협상하다.", ex: "They negotiated a better price." },
    { word: "conference", root: "con(함께) + fer(나르다)", tip: "의견을 함께 모으다 → 회의, 학회.", ex: "The conference was held in Seoul." },
    { word: "evaluate", root: "e(밖으로) + valu(가치)", tip: "가치를 뽑아내다 → 평가하다.", ex: "Managers evaluate performance twice a year." },
    { word: "previous", root: "pre(미리) + vi(길) + ous", tip: "앞서 걸어온 길 → 이전의.", ex: "The previous version had more errors." },
    { word: "reimburse", root: "re(다시) + im(안에) + burse(지갑)", tip: "지갑에 다시 넣어 주다 → 상환하다.", ex: "The company will reimburse your travel expenses." }
  ],

  /* ============ 14. 매일 3문장 받아쓰기 ============ */
  dictation: [
    "Please confirm the meeting room before noon.",
    "The updated report is available on the company website.",
    "Our customer service team will follow up shortly.",
    "The shipment was delayed because of heavy snow.",
    "Could you send me the revised invoice by Friday?",
    "All employees must complete the safety training.",
    "The new policy will take effect on the first of next month.",
    "We appreciate your patience during the renovation.",
    "Please make sure to attach the receipt to your report.",
    "The marketing team will present the results at the conference.",
    "Thank you for your prompt response to our inquiry.",
    "The branch office will be closed for maintenance on Monday.",
    "Reservations can be made online or by phone.",
    "This offer is valid until the end of the month.",
    "I would like to reschedule my appointment for next week.",
    "The interview will be conducted in the main conference room.",
    "Please check the attachment for the revised price list.",
    "Our team will announce the results by the end of the month.",
    "The warranty covers all repairs for two years.",
    "Could you please confirm the number of guests attending?",
    "The seminar has been moved to a larger lecture hall.",
    "We are currently accepting applications for the summer program.",
    "Please note that refunds take up to ten business days.",
    "The company reported a significant increase in quarterly profits."
  ],

  /* ============ 20. 전략·공략 가이드 (SEO 정적 페이지) ============ */
  guides: [
    { slug: "part-5-grammar", title: "TOEIC Part 5 빈출 문법 10가지", desc: "품사·수일치·시제·전치사·관계사 등 Part 5에서 반복 출제되는 문법 포인트를 예문과 함께 정리했습니다.",
      intro: "Part 5는 30문항을 8~9분 안에 처리해야 하는 구간입니다. 그래서 문법을 많이 아는 것보다, 빈칸을 보고 3초 안에 답의 유형을 고르는 힘이 점수를 만듭니다. 이 가이드는 그 판단 신호를 반복 출제 순서대로 묶었습니다.",
      faq: [
        { q: "Part 5는 몇 분 안에 풀어야 하나요?", a: "30문항에 8~9분을 권합니다. 빈칸 앞뒤만 보고 풀리는 문법 문제를 먼저 처리하고, 문맥을 봐야 하는 어휘 문제에 시간을 남기는 순서가 안전합니다." },
        { q: "문법을 다 외운 뒤에 문제를 풀어야 하나요?", a: "아닙니다. 위의 10가지를 '빈칸 신호 → 정답 유형'으로 짝지어 익히면, 모르는 문법이 남아 있어도 정답률이 먼저 올라갑니다." },
        { q: "어휘와 문법 중 무엇부터 잡아야 하나요?", a: "정답률이 낮다면 품사·수일치·시제부터입니다. 신호만 알아도 답이 보이는 문항이 많고, 그다음에 빈출 어휘로 어휘 문제를 메우면 됩니다." }
      ],
      related: [
        { href: "part-5-connectors.html", t: "Part 5 접속부사·연결어 공략", d: "문장 사이의 관계를 묻는 문제" },
        { href: "part-5-word-forms.html", t: "Part 5 어형 변화 공략", d: "명사·형용사·부사 자리 잡기" },
        { href: "../units/frequency.html", t: "빈출 어휘 200선", d: "Part 5 어휘 문제 대비" }
      ],
      sections: [
        { h: "1. 품사 구분", list: ["빈칸 앞뒤를 보고 명사·동사·형용사·부사 자리를 판단합니다.", "The rapid growth surprised everyone. (형용사 + 명사)"] },
        { h: "2. 주어-동사 수 일치", list: ["each·every·one of는 단수, all·several은 복수를 취합니다.", "Each employee has a laptop."] },
        { h: "3. 시제", list: ["since·for와 함께 쓰이면 현재완료를 고릅니다.", "Sales have increased since May."] },
        { h: "4. 전치사", list: ["시각=at, 날짜·요일=on, 월·년=in, 마감 기한=by.", "The seminar starts at 9 a.m. on Monday in June."] },
        { h: "5. 관계사", list: ["사람=who, 사물=which, 소유=whose, 모두 가능=that.", "The manager who joined last year is retiring."] },
        { h: "6. 대명사·한정사", list: [
          "인칭대명사는 격에 따라 달라집니다: I(주격) / me(목적격) / my(소유격) / mine(소유대명사).",
          "재귀대명사는 주어와 목적어가 같을 때 씁니다: The director wrote the memo himself.",
          "another 는 단수 명사 앞에, other 는 복수 명사 앞에 씁니다: another option / other options.",
          "a few 는 셀 수 있는 명사, a little 은 셀 수 없는 명사와 함께 씁니다."
        ] },
        { h: "7. 비교 표현", list: [
          "비교급 + than: Our new plan is cheaper than the previous one.",
          "the + 최상급 + in/of: This is the busiest branch in the region.",
          "as + 원급 + as: The second draft was as detailed as the first.",
          "접속사 as 를 쓴 비례 표현: As the price rose, demand fell."
        ] },
        { h: "8. 자주 나오는 함정", list: [
          "주어와 동사 사이에 긴 수식어가 끼면 수 일치를 놓치기 쉽습니다: The list of items is long.",
          "수량 표현은 of 뒤 명사에 맞춥니다: Most of the files were deleted.",
          "동명사를 목적어로 쓰는 동사(avoid, consider, suggest)와 to부정사를 쓰는 동사(decide, agree, plan)를 구분합니다.",
          "for · since · so far 가 보이면 현재완료를 먼저 확인합니다."
        ] },
        { h: "시험장 5분 점검표", list: [
          "빈칸 앞뒤만 보고 품사를 판단했는가.",
          "절인지 명사구인지 확인해 접속사와 전치사를 갈랐는가.",
          "주어와 동사가 떨어져 있을 때 수 일치를 다시 확인했는가.",
          "확신이 없는 문항은 표시해 두고 마지막에 돌아왔는가."
        ] },
        { h: "예문으로 확인하기", list: [
          "The report was submitted on time. — be동사 뒤 과거분사로 수동태를 만들었습니다.",
          "Each of the applicants has a different background. — Each 는 단수로 취급합니다.",
          "The company has expanded its business since 2019. — since + 시점이면 현재완료.",
          "The manager whose team won the award will speak today. — 소유격 관계사 whose.",
          "This year's sales are higher than last year's. — 비교급 + than."
        ] }
      ] },
    { slug: "part-6-text-completion", title: "TOEIC Part 6 장문 공란 공략법", desc: "한 지문에 4개의 빈칸이 있는 Part 6를 빠르게 푸는 순서와 유형별 판단 기준을 정리했습니다.",
      intro: "Part 6는 문법과 독해가 한 지문 안에 섞여 나오는 구간입니다. 지문을 처음부터 끝까지 정독하면 시간이 모자라므로, 문법 문항을 먼저 걷어내고 남은 시간을 문맥 문항에 쓰는 순서가 중요합니다.",
      faq: [
        { q: "지문을 끝까지 읽어야 하나요?", a: "아닙니다. 빈칸이 있는 문장만 먼저 읽어 문법 문항을 처리하고, 문맥 문항은 앞뒤 한 문장씩을 근거로 삼아도 대부분 풀립니다." },
        { q: "문장 삽입 문제가 유독 어렵습니다.", a: "삽입할 문장의 지시어(this, these, such)와 연결어(however, therefore)가 가리키는 대상을 찾는 것이 핵심입니다. 두 단서가 만나는 자리가 정답입니다." },
        { q: "지문 유형은 어떤 것이 나오나요?", a: "이메일·편지, 공지·광고, 기사·안내문이 대부분입니다. 유형마다 반복되는 단서(보낸 사람·날짜·대상)가 정해져 있어, 눈여겨볼 위치를 미리 정해 두면 빨라집니다." }
      ],
      related: [
        { href: "part-5-grammar.html", t: "Part 5 빈출 문법 10가지", d: "빈칸 자리 판단의 기본기" },
        { href: "part-5-word-forms.html", t: "Part 5 어형 변화 공략", d: "Part 6에서도 가장 많이 나오는 유형" },
        { href: "../units/", t: "주제별 단어장 30개", d: "지문 주제별 어휘 보강" }
      ],
      sections: [
        { h: "지문 유형별 판단 기준", list: [
          "이메일 지문은 첫 문장에서 용건을 잡습니다. 인사말 뒤 첫 문장이 목적을 알려 주고, 이후 문장이 조건을 붙입니다.",
          "공지 지문은 날짜와 대상이 바뀌는 지점을 표시합니다. 문장 삽입 문제의 정답은 대개 그 앞뒤에서 결정됩니다.",
          "광고 지문은 할인 조건과 기한을 먼저 봅니다. 조건이 걸린 문장일수록 빈칸의 근거가 됩니다.",
          "문맥 어휘 문제는 빈칸 앞뒤 한 문장씩만 보고, 두 보기 사이에서 막히면 문장 전체의 태도(긍정·부정)를 기준으로 가릅니다.",
          "시간이 남으면 빈칸이 있는 문장만 다시 읽습니다. 지문 전체를 다시 읽는 것은 시간 대비 효과가 적습니다.",
          "빈칸이 문장 첫머리에 있으면 접속사나 연결어를, 문장 중간이면 품사를 먼저 의심합니다.",
          "같은 유형을 세 번 틀리면 그 지문을 통째로 소리 내어 읽으며 문장 흐름을 확인합니다."
        ] },
        { h: "문항 유형", list: ["품사·어형 문제 (가장 많음)", "접속사·전치사 문제", "문맥에 맞는 어휘 선택", "문장 삽입"] },
        { h: "푸는 순서", list: ["빈칸이 있는 문장만 먼저 읽고 문법 문제를 빠르게 처리합니다.", "문맥 문제는 앞뒤 한 문장씩을 근거로 판단합니다.", "문장 삽입은 지시어(this, these)와 연결어(however, therefore)를 단서로 씁니다."] },
        { h: "지문 유형별 단서", list: [
          "이메일·편지: 보낸 사람, 받는 사람, 요청 사항이 빈칸의 근거가 됩니다.",
          "공지·광고: 날짜·장소·대상이 글 안에서 두 번 이상 반복됩니다.",
          "기사·안내문: 첫 문장이 주제를, 마지막 문장이 결론을 담고 있습니다."
        ] },
        { h: "문장 삽입 문제 푸는 법", list: [
          "삽입할 문장의 주어가 무엇을 가리키는지 먼저 찾습니다.",
          "지시어(this, these, such)는 바로 앞 문장에 그 대상이 있어야 합니다.",
          "연결어(however, therefore, in addition)는 앞뒤 문장의 관계를 알려 줍니다.",
          "두 단서를 함께 확인하면 들어갈 자리가 한 곳으로 좁혀집니다."
        ] },
        { h: "자주 하는 실수", list: [
          "문법 문제를 끝까지 읽느라 시간을 다 씁니다 — 빈칸 문장만 읽고 넘어갑니다.",
          "앞 문장만 보고 문맥 문제를 고릅니다 — 뒤 문장의 근거를 함께 봅니다.",
          "지문을 모두 읽고 문제를 풉니다 — 빈칸 위치를 먼저 확인한 뒤 필요한 부분만 읽습니다."
        ] },
        { h: "예문으로 확인하기", list: [
          "We are pleased to announce that the branch will reopen on May 3. — 공지문에서 자주 쓰는 도입 표현입니다.",
          "Please contact the front desk if you need assistance. — 조건의 if 절이 뒤에 붙었습니다.",
          "The event was postponed due to heavy rain. — due to 는 명사구와 함께 씁니다.",
          "However, the deadline for applications has been extended. — 문장 첫머리 접속부사 뒤에 콤마."
        ] }
      ] },
    { slug: "part-7-double-passage", title: "TOEIC Part 7 복수 지문(이중·삼중) 공략", desc: "표·양식 지문과 연계 문제를 빠르게 푸는 순서, 자주 나오는 연계 유형을 정리했습니다.",
      intro: "복수 지문은 한 지문만 읽고 답을 고르면 함정에 걸리도록 만들어져 있습니다. 두 글을 오가며 확인할 것을 미리 정해 두면, 읽는 횟수를 줄이면서도 정답 근거를 놓치지 않습니다.",
      faq: [
        { q: "복수 지문은 무엇부터 읽나요?", a: "글의 성격(광고·이메일·일정표)을 먼저 훑어 연결 고리를 짐작한 뒤, 첫 지문을 읽으며 두 번째 지문에서 확인할 것을 메모하고 넘어갑니다." },
        { q: "연계 문제는 어떻게 찾나요?", a: "두 지문에 같은 회사명·날짜·금액이 반복되면 그 부분이 답의 근거입니다. 문제에 both documents 처럼 지문 두 개를 가리키는 표현이 있으면 양쪽을 확인하세요." },
        { q: "시간이 부족합니다. 어떻게 해야 하나요?", a: "복수 지문은 마지막에 두고 단일 지문부터 처리하세요. 다만 배점은 같아서, 남은 시간에 표만 읽어도 한두 문항은 풀립니다." }
      ],
      related: [
        { href: "part-6-text-completion.html", t: "Part 6 장문 공란 공략법", d: "한 지문 안에서 근거 찾기" },
        { href: "part-5-grammar.html", t: "Part 5 빈출 문법 10가지", d: "지문 속 문법 신호 잡기" },
        { href: "../units/", t: "주제별 단어장 30개", d: "안내문·이메일 어휘 미리 보기" }
      ],
      sections: [
        { h: "실전 적용 순서", list: [
          "세트를 만나면 두 지문의 종류를 먼저 적습니다. 이메일인지, 광고인지, 일정표인지 알면 문제가 무엇을 물을지 집작할 수 있습니다.",
          "문제를 먼저 읽고 어느 지문을 봐야 하는지 표시한 뒤, 그 부분만 찾아 읽습니다. 지문을 처음부터 끝까지 읽는 것은 마지막 수단입니다.",
          "연계 문항에서 막히면 두 지문에 함께 나오는 고유명사·날짜·금액을 찾습니다. 같은 정보가 두 번 나오면 그곳이 근거입니다.",
          "표·양식 지문이 있으면 도표를 먼저 봅니다. 조건과 수치가 모여 있어 연계 문항의 절반이 여기서 풀립니다.",
          "한 세트에 2분 30초를 넘기면 표시하고 넘어갑니다. 남은 시간에 단일 지문 한 세트를 푸는 편이 점수에 유리합니다.",
          "연습할 때는 정답 근거가 된 문장에 밑줄을 긋고, 왜 다른 보기가 틀렸는지 한 줄로 적습니다. 이 기록이 실전 판단 속도를 만듭니다.",
          "연습할 때도 시간을 재고 풀어, 어느 문항에서 시간이 새는지 확인합니다.",
          "정답 근거가 두 지문 중 어디에 있었는지 표시해 두면, 다음 세트에서 찾는 속도가 빨라집니다.",
          "실전에서 복수 지문 세트를 만나면 표시해 두고 단일 지문을 먼저 처리합니다. 같은 배점이라 순서를 바꾸는 것이 유리합니다."
        ] },
        { h: "먼저 읽을 지문", list: ["표·양식·일정표가 있으면 먼저 훑습니다.", "숫자와 날짜를 먼저 표시해 두면 연계 문제가 빨라집니다."] },
        { h: "연계 문제 유형", list: ["지문 1의 조건이 지문 2에서 충족되는지 판단", "한 지문의 요청이 다른 지문에서 어떻게 처리되는지", "두 지문의 정보를 종합한 추론"] },
        { h: "시간 배분", list: ["단일 지문은 1문항당 30~40초, 복수 지문은 세트당 2분 30초를 목표로 합니다."] },
        { h: "복수 지문에서 자주 나오는 조합", list: [
          "안내문 + 신청서: 안내문의 조건이 신청서에 어떻게 반영됐는지 묻습니다.",
          "이메일 + 회신 이메일: 첫 메일의 요청이 두 번째 메일에서 어떻게 처리됐는지 묻습니다.",
          "광고 + 주문 내역: 광고의 조건과 실제 주문의 차이를 묻습니다.",
          "일정표 + 공지: 바뀐 일정이 언제부터 적용되는지 묻습니다."
        ] },
        { h: "읽기 전에 표시할 것", list: [
          "지문마다 종류와 보낸 사람·받는 사람을 한 줄로 적어 둡니다.",
          "날짜·금액·수량·이름을 동그라미로 표시합니다.",
          "문제가 어느 지문을 근거로 하는지 알려 주면 그 지문부터 봅니다."
        ] },
        { h: "자주 하는 실수", list: [
          "지문을 모두 읽고 문제를 풉니다 — 문제를 먼저 읽고 필요한 부분만 찾습니다.",
          "숫자를 눈으로만 봅니다 — 지문 옆에 옮겨 적으면 연계 문제가 빨라집니다.",
          "한 세트에 매달려 뒤 문제를 놓칩니다 — 2분 30초를 넘기면 표시하고 넘어갑니다."
        ] },
        { h: "지문에서 답을 찾는 예", list: [
          "안내문 마감 3월 10일 + 신청서 3월 8일 → 기한 안에 제출했습니다.",
          "이메일의 재고 확인 요청 + 회신의 5월 2일 발송 → 그날부터 보낼 수 있습니다.",
          "광고의 첫 구매 20% 할인 + 주문 내역 → 할인이 적용됐는지 확인합니다.",
          "일정표의 2일차 오전 + 공지의 오후로 변경 → 바뀐 시각을 고릅니다."
        ] }
      ] },
    { slug: "part-2-traps", title: "TOEIC Part 2 오답 함정 유형 정리", desc: "간접 응답, 부정 의문문, 유사 발음 등 Part 2에서 함정에 빠지기 쉬운 유형을 정리했습니다.",
      intro: "Part 2는 질문 한 문장에 응답 세 개가 나오는 구간이라, 단어 하나를 잘못 들으면 답이 바로 뒤집힙니다. 함정 유형을 미리 알아 두면 \"들리지 않아서\" 틀리는 문항을 줄일 수 있습니다.",
      faq: [
        { q: "Part 2는 해석하면서 들어야 하나요?", a: "아닙니다. 의문사와 조동사를 먼저 잡아 \"무엇을 묻는지\"만 정하고, 응답은 같은 단어가 들리는지보다 질문의 방향에 맞는지로 판단합니다." },
        { q: "같은 단어가 들리면 오답인가요?", a: "대체로 그렇습니다. 질문에 나온 단어를 그대로 되풀이하는 보기는 소리 함정일 때가 많고, 뜻이 통하는 다른 표현이 정답인 경우가 많습니다." },
        { q: "부정 의문문은 어떻게 대답하나요?", a: "영어는 Yes/No 가 질문의 긍정·부정이 아니라 사실 여부를 따릅니다. 대답 문장의 동사 방향을 기준으로 판단하세요." }
      ],
      related: [
        { href: "listening-numbers.html", t: "LC 숫자·금액·시간 함정", d: "숫자가 나오는 Part 2 대비" },
        { href: "speaking-writing-guide.html", t: "Speaking·Writing 유형 완전 정리", d: "같은 표현을 입으로 익히기" },
        { href: "../conversation/", t: "영어회화 교재 3단계", d: "질문·응답 패턴 듣고 따라 말하기" }
      ],
      sections: [
        { h: "시험장 판단 규칙", list: [
          "질문의 첫 단어만 놓치지 않아도 절반은 맞힙니다. Who, When, Why, How 를 먼저 잡고 응답을 듣습니다.",
          "같은 단어가 들리는 보기는 일단 의심합니다. 질문의 단어를 그대로 되풀이하는 응답은 소리 함정일 때가 많습니다.",
          "두 보기 사이에서 막히면 더 구체적인 정보를 담은 쪽을 고릅니다. 회사명이나 시간처럼 실제 답이 되는 정보가 들어 있는 응답이 정답입니다.",
          "응답이 질문과 다른 시제로 말해도 틀린 답은 아닙니다. 시제보다 질문의 방향에 맞는지를 먼저 봅니다."
        ] },
        { h: "함정 유형", list: ["간접 응답: Do you know when ~?에는 yes/no가 아니라 정보로 답합니다.", "부정 의문문: Didn't you ~?에는 사실을 바로잡는 답이 옵니다.", "유사 발음: work/walk, fourth/fourteenth를 구분합니다.", "제안·요청: Why don't we ~? / Would you mind ~?"] },
        { h: "대응 전략", list: ["의문사(Who/When/Where/Why/How)를 먼저 듣고 기대되는 답의 종류를 예측합니다.", "들리지 않으면 첫 단어만으로 소거해도 정답률이 올라갑니다."] },
        { h: "의문사별 기대 응답", list: [
          "Who — 사람 이름이나 직함이 답이 됩니다.",
          "When — 날짜와 시각이 답이 됩니다.",
          "Where — 장소가 답이 됩니다.",
          "Why — To + 동사원형, Because + 절 형태로 이유를 말합니다.",
          "How — by + 수단, about + 정도가 답이 됩니다."
        ] },
        { h: "우회 응답 유형", list: [
          "직접 답하는 대신 장소를 말합니다: Where is the meeting? — It was moved to the second floor.",
          "확신이 없으면 되묻습니다: I am not sure. Let me check the schedule.",
          "요청을 다른 방식으로 수락합니다: I will do it right away."
        ] },
        { h: "연습 방법", list: [
          "스크립트를 보지 않고 듣고, 선택지를 보기 전에 답을 예상해 봅니다.",
          "틀린 문항은 스크립트를 소리 내어 읽으며 함정 유형을 표시합니다.",
          "하루 10문항씩 짧게 반복하는 편이 한 번에 30문항보다 오래 남습니다."
        ] },
        { h: "예문으로 확인하기", list: [
          "Where did you put the invoice? — It is on your desk. — 장소를 묻는 질문에는 장소로 답합니다.",
          "Why was the shipment delayed? — Because the supplier was closed. — 이유를 묻는 질문에는 Because 절로 답합니다.",
          "Would you mind closing the window? — Not at all. — Would you mind 는 Not at all 로 수락합니다.",
          "Didn't you send the report yesterday? — I sent it this morning. — 부정 의문문에는 사실을 바로잡는 답이 옵니다."
        ] }
      ] },
    { slug: "vocabulary-30day", title: "TOEIC 어휘 30일 완성 커리큘럼", desc: "하루 1유닛 30개 단어를 기준으로 30일 동안 1,000단어를 끝내는 학습 계획입니다.",
      intro: "어휘 공부가 흔들리는 이유는 의지가 아니라 순서와 분량이 정해져 있지 않기 때문입니다. 이 가이드는 하루 분량을 30개로 고정하고, 복습 날짜까지 달력에 넣는 방식을 정리했습니다.",
      faq: [
        { q: "하루 30개가 부담스럽습니다.", a: "처음 3일은 20개로 줄여도 됩니다. 대신 멈추지 않고 매일 이어 가는 것이 목표입니다 — 진도보다 \"끊기지 않는 습관\"이 결과를 만듭니다." },
        { q: "모르는 단어가 너무 많습니다.", a: "그날 30개 중 5개 이상 모르면 새 유닛으로 넘어가지 말고, 앞 유닛을 다시 훑으세요. 어휘는 새 단어를 더하는 것보다 본 단어를 잊지 않는 쪽이 효율이 높습니다." },
        { q: "30일이 지나면 무엇을 하나요?", a: "1,000단어를 한 번 끝낸 뒤에는 시험 모드와 암기 카드로 복습 중심으로 돌리고, 빈출 어휘 200선으로 출제 빈도가 높은 단어를 다시 좁혀 가면 됩니다." }
      ],
      related: [
        { href: "../units/frequency.html", t: "빈출 어휘 200선", d: "먼저 외울 단어의 우선순위" },
        { href: "../units/", t: "주제별 단어장 30개", d: "커리큘럼에 쓸 유닛 목록" },
        { href: "part-5-grammar.html", t: "Part 5 빈출 문법 10가지", d: "어휘와 함께 잡으면 좋은 문법" }
      ],
      sections: [
        { h: "계획을 지키는 방법", list: [
          "하루 분량을 못 채운 날은 다음 날 두 배로 메우지 않습니다. 그날 분량만 하고 넘어가야 30일을 끝까지 갑니다.",
          "외운 단어는 다음 날 아침과 사흘 뒤, 이렇게 두 번 다시 봅니다. 같은 단어를 여러 번 만나는 것이 하루에 많이 외우는 것보다 오래 남습니다.",
          "주말에는 새 유닛을 시작하지 않고 그 주에 틀린 단어만 모아 다시 봅니다. 복습일을 미리 정해 두면 계획이 무너지지 않습니다.",
          "단어를 외울 때 예문을 소리 내어 읽습니다. LC에서는 뜻을 알아도 소리로 못 알아들으면 점수로 이어지지 않습니다.",
          "시험 3일 전부터는 새 단어를 늘리지 않습니다. 익숙한 단어와 틀린 단어만 훑어 자신감을 유지합니다.",
          "새 단어를 외우는 시간과 복습하는 시간을 나눠 두세요. 새 단어 10분, 복습 5분이면 하루 루틴이 가볍게 끝납니다.",
          "오답노트에는 틀린 단어만 남기고 맞힌 단어는 지워 목록을 줄여 갑니다. 목록이 짧아져야 복습이 계속됩니다.",
          "암기 카드로 출퇴근 시간을 쓰고, 앉아서는 예문을 소리 내어 읽는 두 가지 패턴을 함께 돌리세요."
        ] },
        { h: "하루 루틴", list: ["복습 3분 → 새 유닛 10분 → 퀴즈 7분", "예문은 소리 내어 3번 읽습니다."] },
        { h: "주간 점검", list: ["7일차·14일차·21일차에 미니 테스트와 콜로케이션 드릴을 합니다.", "30일차에는 모의고사 1회로 마무리합니다."] },
        { h: "복습 주기", list: ["1일·3일·7일 간격으로 복습하면 기억 유지율이 크게 올라갑니다."] },
        { h: "단어를 오래 기억하는 3단계", list: [
          "1단계(인식): 뜻과 발음을 확인하며 30개를 훑습니다.",
          "2단계(회상): 뜻을 가리고 단어만 보고 뜻을 말해 봅니다.",
          "3단계(사용): 예문을 소리 내어 읽고, 그 단어로 짧은 문장을 하나 만듭니다."
        ] },
        { h: "유닛을 마친 뒤", list: [
          "그날 배운 30개 중 틀린 것만 오답노트에 남깁니다.",
          "다음 날 시작하기 전에 어제 유닛 퀴즈를 한 번 더 풉니다.",
          "3일 뒤와 7일 뒤에 같은 유닛을 다시 확인합니다."
        ] },
        { h: "계속하기 어려울 때", list: [
          "하루 30개가 부담되면 15개로 줄이고 60일 계획으로 바꿉니다 — 멈추는 것보다 낫습니다.",
          "출퇴근 시간에는 암기 카드, 앉아서는 퀴즈처럼 상황에 맞춰 나눕니다.",
          "점수가 오르지 않는 주에는 새 유닛을 멈추고 복습만 합니다."
        ] },
        { h: "시험 전 마무리", list: [
          "시험 3일 전부터는 새 단어를 줄이고 오답노트만 반복합니다.",
          "헷갈리는 단어 100개를 따로 표시해 두고 시험 당일 아침에 훑습니다."
        ] },
        { h: "예문으로 확인하기", list: [
          "The manager approved the budget. — approve 는 업무 문장에서 자주 쓰는 격식 동사입니다.",
          "We need to confirm the delivery date. — confirm = 확인하다.",
          "The staff attended a training session. — attend 뒤에는 전치사 없이 목적어를 씁니다.",
          "Sales increased by 12 percent. — increase by + 증가폭."
        ] }
      ] },
    { slug: "listening-numbers", title: "TOEIC LC 숫자·금액·시간 함정 정리", desc: "숫자, 금액, 날짜, 전화번호가 나오는 LC 문제에서 실수를 줄이는 방법을 정리했습니다.",
      intro: "숫자는 한 글자만 달라도 정답이 바뀌는데, 시험장에서는 속도 때문에 놓치기 쉽습니다. -teen 과 -ty, 13th 와 30th 처럼 헷갈리는 짝을 미리 구분해 두면 실수가 크게 줄어듭니다.",
      faq: [
        { q: "숫자가 들릴 때 적어야 하나요?", a: "받아쓰기보다 자릿수를 기억하는 편이 낫습니다. 천 단위 묶음(1,250 = twelve fifty)과 소수점·통화 단위만 표시해도 판단이 서고, 필기는 오히려 다음 문장을 놓치게 합니다." },
        { q: "금액 문제는 무엇을 봐야 하나요?", a: "할인·세금·총액처럼 계산이 들어가는지 먼저 확인하세요. 보기에는 여러 숫자가 나오므로, 질문이 묻는 값이 하나인지 합계인지가 핵심입니다." },
        { q: "전화번호·주문번호는 어떻게 듣나요?", a: "0 을 oh 로 읽는 경우, 7 과 4 같은 유사 발음, 반복(11 = double one)이 함정입니다. 한 덩어리로 끊어 따라 말하며 듣는 연습이 효과적입니다." }
      ],
      related: [
        { href: "part-2-traps.html", t: "Part 2 오답 함정 유형", d: "응답 선택의 기본기" },
        { href: "../conversation/", t: "영어회화 교재 3단계", d: "숫자 표현을 문장으로 익히기" },
        { href: "../units/", t: "주제별 단어장 30개", d: "일정·비용 어휘 보강" }
      ],
      sections: [
        { h: "놓치지 않는 연습법", list: [
          "숫자는 들으면서 바로 적습니다. 머릿속에 두면 다음 문장이 겹쳐 순서를 잃습니다.",
          "금액은 통화 단위를 함께 적습니다. 15와 50, 13과 30처럼 소리가 비슷한 짝은 따로 표시해 두고 반복해서 듣습니다.",
          "날짜는 요일과 함께 확인합니다. 날짜만 들으면 요일을 묻는 문제에서 다시 계산해야 합니다.",
          "전화번호와 주문 번호는 한 자리씩 끊어 적습니다. double, oh 같은 읽기 규칙을 미리 익혀 두면 훨씬 빨리 적을 수 있습니다.",
          "연습할 때는 스크립트를 보지 않고 적고, 확인한 뒤 다시 들으며 놓친 숫자만 표시합니다.",
          "받아쓰기는 숫자만 적고 나머지는 비워 두세요. 문장을 전부 적으려 하면 다음 문항을 놓칩니다.",
          "비슷한 소리는 짝으로 모아 하루 5분씩 구별해 읽습니다. 13과 30처럼 자주 틀리는 짝을 먼저 골라 연습하세요."
        ] },
        { h: "자주 틀리는 표현", list: ["thirteen(13) / thirty(30)", "fourth(4th) / fourteenth(14th)", "a quarter to nine = 8시 45분", "double seven = 77, triple three = 333"] },
        { h: "대응 전략", list: ["숫자는 들리는 대로 메모합니다.", "금액은 통화 단위(dollars, won)까지 함께 적습니다.", "날짜는 월·일 순서를 기호로 표시합니다."] },
        { h: "숫자 표현 정리", list: [
          "10 단위 읽기: 20 twenty, 30 thirty, 40 forty, 50 fifty (철자 주의).",
          "100 이상: 250 = two hundred fifty, 1,500 = fifteen hundred.",
          "분수와 비율: a third, two thirds, half of.",
          "배수: double(2배), triple(3배), twice as much as."
        ] },
        { h: "유형별 메모 요령", list: [
          "가격 문제: 숫자와 통화 단위를 함께 적고, 할인율이 나오면 계산식을 옆에 씁니다.",
          "시간 문제: 시작 시각과 걸린 시간을 따로 적습니다.",
          "인원·수량 문제: 전체와 일부를 구분해 적습니다.",
          "전화번호: 0 을 zero 와 oh 로 모두 읽을 수 있으므로 두 가지를 함께 대비합니다."
        ] },
        { h: "시험장 점검", list: [
          "계산이 필요한 문항은 답을 고르지 말고 숫자만 메모한 뒤 마지막에 계산합니다.",
          "놓친 숫자는 되돌아가려 하지 말고 다음 문항에 집중합니다."
        ] },
        { h: "예문으로 확인하기", list: [
          "The train leaves at a quarter to nine. — a quarter to nine = 8시 45분입니다.",
          "The total came to three hundred fifty dollars. — 350달러.",
          "We ordered two dozen boxes. — dozen = 12개입니다.",
          "The meeting is scheduled for the fourteenth. — fourteenth = 14일입니다."
        ] }
      ] },
    { slug: "part-5-connectors", title: "TOEIC 접속사·전치사·접속부사 구분법", desc: "뒤에 절이 오는지 명사구가 오는지로 접속사와 전치사를 가르고, however·therefore 같은 접속부사의 위치를 정리했습니다.",
      intro: "연결어 문제는 뜻을 몰라서 틀리는 경우가 거의 없습니다. 뒤에 절이 오는지 명사구가 오는지, 그리고 접속부사의 위치와 문장부호가 맞는지만 보면 답이 정해집니다.",
      faq: [
        { q: "although 와 despite 는 어떻게 다른가요?", a: "although 뒤에는 절(주어 + 동사)이, despite 뒤에는 명사구가 옵니다. 빈칸 뒤에 동사가 보이면 접속사를 고르세요." },
        { q: "however 는 문장 어디에 들어가나요?", a: "접속부사라서 두 문장을 이어 주지 못합니다. 문장 첫머리라면 뒤에 쉼표를, 문장 중간이나 끝에 오면 양쪽에 쉼표를 씁니다." },
        { q: "because 와 because of 는요?", a: "같은 이유로 갈립니다. because + 절, because of + 명사구이며, of 가 보이면 뒤에 동사가 올 수 없습니다." }
      ],
      related: [
        { href: "part-5-grammar.html", t: "Part 5 빈출 문법 10가지", d: "전치사·접속사 판단 기준" },
        { href: "part-5-word-forms.html", t: "Part 5 어형 변화 공략", d: "빈칸 자리로 품사 고르기" },
        { href: "../grammar/", t: "문법 교재 3단계", d: "전치사·접속사 단원 집중 학습" }
      ],
      sections: [
        { h: "세 가지를 구분하는 기준", list: ["뒤에 주어+동사(절)가 오면 접속사: although, because, while", "뒤에 명사(구)가 오면 전치사: despite, because of, during", "문장과 문장 사이에서 의미만 연결하면 접속부사: however, therefore, moreover"] },
        { h: "접속부사의 위치와 문장부호", list: ["접속부사는 두 문장을 세미콜론(;)과 콤마(,)로 연결합니다: The plan was costly; however, we approved it.", "문장 맨 앞에서는 보통 콤마를 뒤에 붙입니다: Therefore, the meeting was postponed.", "however·therefore는 접속사가 아니므로 한 문장 안에서 두 절을 직접 연결하지 않습니다."] },
        { h: "빈출 연결어 목록", list: ["대조: however, in contrast, on the other hand", "결과: therefore, consequently, as a result", "추가: moreover, in addition, besides", "조건: otherwise, provided that", "정리: in conclusion, in short"] },
        { h: "실전 판단 순서", list: ["빈칸 뒤를 먼저 봅니다. 명사구면 전치사, 절이면 접속사를 고릅니다.", "둘 다 아니고 문장 첫머리라면 접속부사를 의심합니다."] },
        { h: "뜻이 비슷해 헷갈리는 짝", list: [
          "although 는 절, despite 는 명사구와 함께 씁니다: Although it rained / Despite the rain.",
          "because 는 절, because of 는 명사구와 함께 씁니다.",
          "during 은 특정 기간, for 는 걸린 시간과 함께 씁니다: during the meeting / for two hours.",
          "while 은 절을 이끄는 접속사, meanwhile 은 문장을 잇는 접속부사입니다."
        ] },
        { h: "자주 하는 실수", list: [
          "however 를 접속사처럼 써서 두 절을 직접 연결합니다 — 세미콜론이나 마침표가 필요합니다.",
          "despite 뒤에 절을 씁니다 — despite the fact that 처럼 명사절로 바꿔야 합니다.",
          "therefore 와 because 를 같은 자리에 놓습니다 — 원인과 결과의 방향이 반대입니다."
        ] },
        { h: "예문으로 확인하기", list: [
          "Although the price rose, sales remained steady. — 절을 이끄는 양보 접속사입니다.",
          "Despite the price increase, sales remained steady. — 같은 뜻을 명사구로 바꾸면 Despite 입니다.",
          "The price rose; however, sales remained steady. — 세미콜론 + 접속부사 구조입니다.",
          "Because of the delay, we missed the connection. — because of + 명사구."
        ] }
      ] },
    { slug: "part-5-word-forms", title: "TOEIC 어형 변화(품사 변환) 공략", desc: "한 어근이 명사·동사·형용사·부사로 바뀌는 규칙과 Part 5·6에서 빈칸 자리로 품사를 판단하는 방법을 정리했습니다.",
      intro: "Part 5·6 어휘 문제의 절반은 단어 뜻이 아니라 자리 싸움입니다. 접미사로 품사를 알아보고, 빈칸 앞뒤로 자리를 판단하는 두 가지만 익히면 오답이 크게 줄어듭니다.",
      faq: [
        { q: "어형 문제는 뜻을 몰라도 풀리나요?", a: "품사만 맞으면 정답인 경우가 많습니다. 보기에 같은 어근의 명사·형용사·부사가 나오면, 그 문항은 뜻이 아니라 자리를 묻는 문제입니다." },
        { q: "접미사는 다 외워야 하나요?", a: "-tion/-ment/-ance 는 명사, -ive/-able/-ous 는 형용사, -ly 는 부사 정도만 익혀도 대부분 걸러집니다. 다만 friendly, likely 처럼 -ly 가 형용사인 예외는 따로 기억하세요." },
        { q: "관사 뒤에는 무엇이 오나요?", a: "관사(a/the)와 형용사 뒤에는 명사가 옵니다. 이 두 자리만 눈에 익으면 Part 5 어형 문제를 빠르게 처리할 수 있습니다." }
      ],
      related: [
        { href: "part-5-grammar.html", t: "Part 5 빈출 문법 10가지", d: "품사 구분부터 점검하기" },
        { href: "part-5-connectors.html", t: "Part 5 접속부사·연결어 공략", d: "자리 문제의 다른 갈래" },
        { href: "../units/frequency.html", t: "빈출 어휘 200선", d: "품사와 뜻을 함께 확인" }
      ],
      sections: [
        { h: "빈칸 판단의 기본 규칙", list: [
          "빈칸 앞뒤를 먼저 봅니다. 관사 뒤면 명사, 조동사 뒤면 동사원형, 동사 뒤 목적어면 부사인 식으로 자리만 정해도 보기 절반이 지워집니다.",
          "보기 네 개가 같은 어근의 다른 품사면 해석하지 말고 자리로 판단합니다. 해석부터 하면 시간이 두 배로 듭니다.",
          "품사가 같은 보기가 둘 이상 남으면 문맥을 봅니다. 단수와 복수, 능동과 수동, 시제가 가리는 지점이 정답의 기준입니다.",
          "빈칸이 두 개인 문항은 뒤 빈칸부터 봅니다. 뒤쪽이 더 명확한 단서를 주는 경우가 많습니다."
        ] },
        { h: "품사별 자리", list: ["관사·소유격·전치사 뒤 → 명사", "주어 뒤·조동사 뒤·to 뒤 → 동사(원형)", "명사 앞·be동사 뒤 → 형용사", "동사·형용사·문장 전체 수식 → 부사"] },
        { h: "빈출 어형 세트", list: ["success / succeed / successful / successfully", "decide / decision / decisive / decisively", "compete / competition / competitive / competitively", "analyze / analysis / analytical / analytically", "apply / application / applicant / applicable"] },
        { h: "주의할 함정", list: ["-ly로 끝나도 형용사인 경우가 있습니다: costly, friendly, timely", "명사와 형용사 형태가 같은 단어도 있습니다: available, reliable는 형용사만 있습니다.", "수식 대상이 사람이면 -ed, 사물이면 -ing: confused staff / confusing instructions"] },
        { h: "빈칸 자리 판단 5초 규칙", list: [
          "빈칸 앞이 관사·소유격·전치사면 명사를 고릅니다.",
          "앞에 주어가 있고 빈칸 뒤에 목적어가 있으면 동사를 고릅니다.",
          "빈칸이 명사를 꾸미면 형용사를 고릅니다.",
          "빈칸이 동사·형용사·문장 전체를 꾸미면 부사를 고릅니다."
        ] },
        { h: "접미사로 품사 빠르게 보기", list: [
          "명사 접미사: -tion, -ment, -ance, -ity, -ness",
          "형용사 접미사: -ful, -ous, -ive, -able, -al",
          "부사 접미사: -ly (다만 costly·friendly 는 형용사입니다)",
          "동사 접미사: -ize, -ify, -ate"
        ] },
        { h: "더 많은 어형 세트", list: [
          "produce / product / production / productive / productively",
          "assist / assistance / assistant",
          "create / creation / creative / creatively",
          "inform / information / informative / informatively",
          "require / requirement / required"
        ] },
        { h: "예문으로 확인하기", list: [
          "The manager gave a detailed explanation. — 관사 뒤에는 형용사 + 명사가 옵니다.",
          "The team completed the project successfully. — 동사를 꾸미는 부사 자리입니다.",
          "Applicants must submit the form by Friday. — 조동사 뒤에는 동사원형.",
          "The company's performance was impressive. — be동사 뒤에는 형용사."
        ] }
      ] },
    { slug: "speaking-writing-guide", title: "TOEIC Speaking·Writing 유형 완전 정리", desc: "Speaking 11문항과 Writing 8문항의 공식 구성, 유형별 시간 배분과 답변 프레임을 한 페이지에 정리했습니다.",
      intro: "Speaking·Writing은 문항 구성과 시간이 정해져 있어, 유형별로 \"무엇을 몇 초 동안 말할지\"를 미리 정해 두면 점수가 안정됩니다. 이 가이드는 그 틀과 감점을 피하는 습관을 함께 담았습니다.",
      faq: [
        { q: "답변이 짧으면 점수가 떨어지나요?", a: "준비 시간을 다 쓰고도 한 문장에서 멈추면 감점 요인이 됩니다. 프레임(주장 → 근거 → 마무리)을 정해 두고 시간을 채우는 연습을 하세요." },
        { q: "문법 실수가 많으면 위험한가요?", a: "완벽한 문장보다 전달이 우선입니다. 다만 같은 실수(시제·수일치)가 반복되면 감점되므로, 자주 틀리는 두세 가지만 먼저 고쳐도 점수가 오릅니다." },
        { q: "혼자서도 연습할 수 있나요?", a: "가능합니다. 45초를 재고 말한 뒤 녹음해 스크립트를 적어 보면, 머뭇거린 지점과 반복하는 실수가 그대로 드러납니다." }
      ],
      related: [
        { href: "part-2-traps.html", t: "Part 2 오답 함정 유형", d: "듣기 응답 감각 기르기" },
        { href: "../conversation/", t: "영어회화 교재 3단계", d: "말하기 표현을 상황별로 익히기" },
        { href: "../", t: "홈 말하기·쓰기 훈련", d: "템플릿과 연습 문제로 바로 연습" }
      ],
      sections: [
        { h: "Speaking 11문항 구성", list: [
          "문항 1~2 지문 낭독: 준비 45초, 낭독 45초. 발음과 억양·강세를 평가합니다.",
          "문항 3~4 사진 묘사: 준비 45초, 말하기 30초. 문법·어휘·일관성을 평가합니다.",
          "문항 5~7 질문에 답하기: 문항 5·6은 15초, 문항 7은 30초.",
          "문항 8~10 제공된 정보 활용: 정보 읽기 45초, 문항 8·9는 15초, 문항 10은 30초입니다.",
          "문항 11 의견 제시: 준비 45초, 말하기 60초. 근거 두 가지를 준비합니다."
        ] },
        { h: "Writing 8문항 구성", list: [
          "문항 1~5 사진 보고 한 문장 쓰기: 제시된 두 단어를 모두 사용해야 합니다.",
          "문항 6~7 이메일 답장: 문항당 10분이 주어지며 과제 수행과 표현의 다양성을 봅니다.",
          "문항 8 의견 에세이: 최소 300단어를 권장하며 논리와 근거를 평가합니다."
        ] },
        { h: "유형별 답변 프레임", list: [
          "낭독은 문장 부호에서 끊고, 숫자·요일·고유명사를 또렷하게 읽습니다.",
          "사진 묘사는 중심 인물, 주변 인물, 배경 순서로 3문장을 준비합니다.",
          "정보 활용 문항은 시간, 장소, 담당자 순으로 표를 먼저 표시해 둡니다.",
          "의견 제시는 입장 한 문장, 근거 두 문장, 예시 한 문장, 마무리 한 문장으로 조립합니다.",
          "이메일은 인사와 목적, 요청 처리, 마무리 세 문단으로 나누면 10분 안에 끝낼 수 있습니다."
        ] },
        { h: "점수와 시간", list: [
          "Speaking은 약 20분, Writing은 약 60분이며 각각 0~200점으로 평가됩니다.",
          "두 시험은 함께 또는 따로 응시할 수 있고, LC·RC와 합산하면 4기능 점수가 됩니다."
        ] },
        { h: "고득점 표현", list: [
          "의견 제시: In my opinion, / I believe that / The main reason is that",
          "이메일 시작: Thank you for your email regarding / I am writing to",
          "이메일 마무리: I look forward to hearing from you. / Please let me know if you need anything else.",
          "사진 묘사: In the foreground / In the background / On the left side"
        ] },
        { h: "감점을 줄이는 습관", list: [
          "침묵이 길면 유창성 점수가 떨어집니다 — 틀려도 계속 말합니다.",
          "준비 시간에는 한국어로 내용을 정하고, 영어 문장은 말하면서 만듭니다.",
          "같은 표현이 반복되지 않도록 비슷한 말을 두세 개 준비합니다."
        ] },
        { h: "답변 시간 관리", list: [
          "사진 묘사 30초는 문장 3개 분량입니다 — 인물, 행동, 배경 순서로 말합니다.",
          "15초 문항은 한 문장으로 끝내되 이유를 한 번 붙입니다.",
          "60초 의견 제시는 입장, 근거, 예시, 마무리 순서를 지킵니다."
        ] },
        { h: "연습 순서", list: [
          "먼저 답변을 소리 내어 녹음하고 시간을 잽니다.",
          "스크립트로 옮겨 반복 표현과 군더더기를 지웁니다.",
          "다시 녹음해 같은 실수가 줄었는지 확인합니다."
        ] },
        { h: "예문으로 확인하기", list: [
          "In the picture, a woman is checking a document at her desk. — 사진 묘사의 기본 문장입니다.",
          "I am writing to ask about the schedule for next week. — 이메일의 첫 문장으로 자주 씁니다.",
          "In my opinion, working from home increases productivity. — 의견 제시의 첫 문장입니다.",
          "I look forward to hearing from you. — 이메일을 맺는 격식 표현입니다."
        ] }
      ] }
  ],

  /* ============ 21. 접속부사·연결어 드릴 ============ */
  transitions: [
    { tag: "인과", prompt: "The flight was delayed; ＿＿＿＿, the meeting had to start without the presenter.", a: "therefore", opts: ["therefore", "otherwise", "whereas", "meanwhile"], why: "앞의 결과를 이끌어내므로 therefore(그러므로)가 맞습니다." },
    { tag: "인과", prompt: "Sales dropped sharply last quarter; ＿＿＿＿, the company revised its marketing plan.", a: "as a result", opts: ["as a result", "in contrast", "for example", "in addition"], why: "앞 문장의 결과를 나타내는 as a result가 자연스럽습니다." },
    { tag: "양보", prompt: "＿＿＿＿ the rising costs, the company kept its prices unchanged.", a: "Despite", opts: ["Despite", "Because of", "Thanks to", "Instead of"], why: "뒤에 명사구 rising costs가 오고 양보의 의미이므로 Despite를 씁니다." },
    { tag: "양보", prompt: "＿＿＿＿ the team worked overtime, the project was not finished on time.", a: "Although", opts: ["Although", "Despite", "Because", "Therefore"], why: "뒤에 절이 오는 양보의 접속사는 Although입니다." },
    { tag: "대조", prompt: "The Seoul branch exceeded its target; ＿＿＿＿, the Busan branch fell short.", a: "in contrast", opts: ["in contrast", "as a result", "for instance", "in short"], why: "두 지점을 대비하므로 in contrast(대조적으로)가 맞습니다." },
    { tag: "대조", prompt: "The new model is lighter; ＿＿＿＿, it is more expensive.", a: "however", opts: ["however", "therefore", "moreover", "likewise"], why: "반대되는 내용을 이어 주므로 however(그러나)를 씁니다." },
    { tag: "추가", prompt: "The package includes free delivery; ＿＿＿＿, installation is provided at no cost.", a: "moreover", opts: ["moreover", "nevertheless", "otherwise", "instead"], why: "내용을 더할 때는 moreover(게다가)를 씁니다." },
    { tag: "추가", prompt: "＿＿＿＿ its low price, the printer is also easy to maintain.", a: "Besides", opts: ["Besides", "Despite", "Unlike", "Whether"], why: "추가 정보를 더하는 전치사 Besides(게다가)가 맞습니다." },
    { tag: "조건", prompt: "Please submit the form by Friday; ＿＿＿＿, your application cannot be processed.", a: "otherwise", opts: ["otherwise", "therefore", "namely", "likewise"], why: "그렇지 않으면이라는 조건의 otherwise가 맞습니다." },
    { tag: "조건", prompt: "＿＿＿＿ the payment is received today, the order will ship tomorrow.", a: "Provided that", opts: ["Provided that", "Even though", "As if", "In case of"], why: "조건을 나타내는 접속사 Provided that(~한다면)을 씁니다." },
    { tag: "예시", prompt: "Several documents are required; ＿＿＿＿, a valid passport and a photo.", a: "for example", opts: ["for example", "however", "therefore", "instead"], why: "예를 들 때는 for example을 씁니다." },
    { tag: "정리", prompt: "＿＿＿＿, the new policy will benefit both staff and customers.", a: "In conclusion", opts: ["In conclusion", "In contrast", "For instance", "On the contrary"], why: "글을 마무리하며 요약할 때는 In conclusion을 씁니다." },
    { tag: "시간", prompt: "The stores will be closed for renovation; ＿＿＿＿, online orders are still accepted.", a: "meanwhile", opts: ["meanwhile", "thereby", "hence", "namely"], why: "동시에 일어나는 상황을 이을 때는 meanwhile(그동안)을 씁니다." },
    { tag: "시간", prompt: "＿＿＿＿ submitting the report, please double-check all figures.", a: "Before", opts: ["Before", "During", "Since", "Despite"], why: "제출 전에라는 의미이므로 Before + 동명사 구조가 맞습니다." },
    { tag: "인과", prompt: "The warehouse was flooded; ＿＿＿＿, all shipments were postponed.", a: "consequently", opts: ["consequently", "nevertheless", "similarly", "occasionally"], why: "결과를 나타내는 consequently(그 결과)가 맞습니다." },
    { tag: "양보", prompt: "＿＿＿＿ its small size, the device stores a huge amount of data.", a: "Even with", opts: ["Even with", "In spite", "Because of", "According to"], why: "Even with + 명사구로 양보의 의미를 나타냅니다." },
    { tag: "대조", prompt: "The product is durable; ＿＿＿＿, it is not waterproof.", a: "on the other hand", opts: ["on the other hand", "as a result", "for this reason", "in other words"], why: "다른 측면을 제시할 때 on the other hand를 씁니다." },
    { tag: "정리", prompt: "Please print the document; ＿＿＿＿, sign and date the last page.", a: "then", opts: ["then", "otherwise", "whereas", "namely"], why: "순서를 이어 주는 then(그다음)이 자연스럽습니다." }
  ],

  /* ============ 22. 동사·형용사 + 전치사 콜로케이션 ============ */
  prepositions: [
    { tag: "전치사", prompt: "The final decision is subject ＿＿＿＿ approval by the board.", a: "to", opts: ["to", "for", "with", "of"], why: "be subject to ~ = ~의 승인·적용을 받아야 하는" },
    { tag: "전치사", prompt: "All employees must comply ＿＿＿＿ the new safety rules.", a: "with", opts: ["with", "to", "for", "at"], why: "comply with ~ = (규정을) 준수하다" },
    { tag: "전치사", prompt: "The launch date depends ＿＿＿＿ the test results.", a: "on", opts: ["on", "to", "for", "of"], why: "depend on ~ = ~에 달려 있다" },
    { tag: "전치사", prompt: "The regional manager is responsible ＿＿＿＿ three teams.", a: "for", opts: ["for", "to", "of", "with"], why: "be responsible for ~ = ~에 책임이 있다" },
    { tag: "전치사", prompt: "Full-time staff are eligible ＿＿＿＿ a training budget.", a: "for", opts: ["for", "to", "of", "in"], why: "be eligible for ~ = ~을 받을 자격이 있다" },
    { tag: "전치사", prompt: "The committee consists ＿＿＿＿ five department heads.", a: "of", opts: ["of", "with", "from", "in"], why: "consist of ~ = ~로 구성되다" },
    { tag: "전치사", prompt: "The supply shortage resulted ＿＿＿＿ higher prices.", a: "in", opts: ["in", "of", "from", "to"], why: "result in ~ = ~라는 결과를 낳다" },
    { tag: "전치사", prompt: "Both companies will benefit ＿＿＿＿ the partnership.", a: "from", opts: ["from", "with", "of", "to"], why: "benefit from ~ = ~로부터 이익을 얻다" },
    { tag: "전치사", prompt: "The firm specializes ＿＿＿＿ corporate tax law.", a: "in", opts: ["in", "on", "at", "for"], why: "specialize in ~ = ~을 전문으로 하다" },
    { tag: "전치사", prompt: "All contractors must adhere ＿＿＿＿ the safety guidelines.", a: "to", opts: ["to", "with", "for", "on"], why: "adhere to ~ = (규칙을) 준수하다" },
    { tag: "전치사", prompt: "The old system is not capable ＿＿＿＿ handling this volume.", a: "of", opts: ["of", "to", "for", "with"], why: "be capable of -ing = ~할 수 있다" },
    { tag: "전치사", prompt: "New employees are not yet familiar ＿＿＿＿ the approval process.", a: "with", opts: ["with", "to", "of", "for"], why: "be familiar with ~ = ~에 익숙하다" },
    { tag: "전치사", prompt: "This model is similar ＿＿＿＿ the one we used last year.", a: "to", opts: ["to", "with", "as", "from"], why: "be similar to ~ = ~와 비슷하다" },
    { tag: "전치사", prompt: "Please be aware ＿＿＿＿ the new refund policy.", a: "of", opts: ["of", "to", "with", "for"], why: "be aware of ~ = ~을 알고 있다" },
    { tag: "전치사", prompt: "Several customers are concerned ＿＿＿＿ the delivery delay.", a: "about", opts: ["about", "to", "of", "for"], why: "be concerned about ~ = ~에 대해 걱정하다" },
    { tag: "전치사", prompt: "We are not satisfied ＿＿＿＿ the quality of the packaging.", a: "with", opts: ["with", "to", "of", "for"], why: "be satisfied with ~ = ~에 만족하다" },
    { tag: "전치사", prompt: "All staff are encouraged to participate ＿＿＿＿ the survey.", a: "in", opts: ["in", "to", "on", "at"], why: "participate in ~ = ~에 참여하다" },
    { tag: "전치사", prompt: "You can apply ＿＿＿＿ the position through our website.", a: "for", opts: ["for", "to", "in", "at"], why: "apply for ~ = (~을) 지원하다" },
    { tag: "전치사", prompt: "Online sales account ＿＿＿＿ forty percent of our revenue.", a: "for", opts: ["for", "to", "of", "with"], why: "account for ~ = (비율을) 차지하다, 설명하다" },
    { tag: "전치사", prompt: "Let us focus ＿＿＿＿ resolving the urgent issues first.", a: "on", opts: ["on", "in", "at", "to"], why: "focus on ~ = ~에 집중하다" },
    { tag: "전치사", prompt: "The shipment was delayed ＿＿＿＿ a customs inspection.", a: "due to", opts: ["due to", "despite", "instead of", "according to"], why: "due to + 명사 = ~ 때문에" },
    { tag: "전치사", prompt: "＿＿＿＿ the heavy rain, the outdoor event was canceled.", a: "Because of", opts: ["Because of", "Although", "In addition to", "Unlike"], why: "뒤에 명사구가 오는 이유 표현은 Because of입니다." }
  ],

  /* ============ 23. 읽기·듣기 라이브러리 (연재 지문 · 3단계) ============
     같은 상황을 기초·중급·고급 세 난이도로 나눠 담았습니다(News in Levels 방식).
     화가 이어지는 연재라 "다음 화"가 궁금해 다시 찾게 만드는 구조입니다.
     문제는 채점 후 해설(why)까지 보여 줍니다. */
  library: [
    { no: 1, title: "첫 출근", theme: "사무실 · 온보딩",
      levels: {
        basic: {
          text: "Mina starts her new job today. She arrives at the office at nine o'clock. Her manager greets her at the front desk. He shows her the meeting room and the copy room. Mina meets three coworkers. They are friendly and helpful.",
          ko: "미나는 오늘 새 직장에서 첫 출근을 한다. 그녀는 9시에 사무실에 도착한다. 매니저가 안내 데스크에서 그녀를 맞이한다. 그는 회의실과 복사실을 보여 준다. 미나는 세 명의 동료를 만난다. 그들은 친절하고 도움이 된다.",
          qs: [
            { q: "미나가 사무실에 도착한 시각은?", a: "9시", opts: ["8시", "9시", "10시", "정오"], why: "She arrives at the office at nine o'clock." },
            { q: "매니저가 미나에게 보여 준 곳은?", a: "회의실과 복사실", opts: ["회의실과 복사실", "창고와 주차장", "카페와 로비", "훈련실과 정원"], why: "He shows her the meeting room and the copy room." },
            { q: "미나를 맞이한 사람은?", a: "매니저", opts: ["매니저", "동료", "고객", "경비원"], why: "Her manager greets her at the front desk." }
          ]
        },
        intermediate: {
          text: "Mina began her new position at the downtown branch this morning. She arrived a few minutes early and was greeted by her manager at the front desk, who then introduced her to the team. He explained that the Monday meeting starts at nine thirty, so newcomers should be at their desks by nine fifteen. After a short tour, she was given a key card and a temporary password for the internal system.",
          ko: "미나는 오늘 아침 시내 지점에서 새 직무를 시작했다. 그녀는 몇 분 일찍 도착해 안내 데스크에서 매니저의 인사를 받았고, 매니저는 이어서 그녀를 팀에 소개했다. 그는 월요일 회의가 9시 30분에 시작하므로 신입은 9시 15분까지 자리에 있어야 한다고 설명했다. 짧은 안내를 마친 뒤 그녀는 출입 카드와 내부 시스템용 임시 비밀번호를 받았다.",
          qs: [
            { q: "신입 사원은 월요일 회의 전까지 언제까지 자리에 있어야 하는가?", a: "9시 15분", opts: ["9시", "9시 15분", "9시 30분", "9시 45분"], why: "newcomers should be at their desks by nine fifteen" },
            { q: "미나가 받은 두 가지는?", a: "출입 카드와 임시 비밀번호", opts: ["출입 카드와 임시 비밀번호", "명함과 사무용품", "유니폼과 노트북", "회의 자료와 명단"], why: "she was given a key card and a temporary password" },
            { q: "미나가 새 직무를 시작한 곳은?", a: "시내 지점", opts: ["본사", "시내 지점", "공항 지점", "물류센터"], why: "her new position at the downtown branch" }
          ]
        },
        advanced: {
          text: "Mina's first day at the downtown branch began with a brief orientation rather than the usual stack of paperwork. Her manager, who had joined the company only two years earlier, walked her through the team's weekly rhythm: a short stand-up every morning, a full meeting on Mondays at nine thirty, and a written progress note due each Friday. She was struck by how much of the office ran on shared documents, and by how quickly she was expected to contribute. By noon she had already been asked to review a draft proposal.",
          ko: "미나의 시내 지점 첫날은 평소의 서류 더미 대신 짧은 오리엔테이션으로 시작됐다. 불과 2년 전에 입사한 그녀의 매니저는 팀의 주간 리듬을 차근차근 설명했다. 매일 아침 짧은 스탠드업, 월요일 9시 30분의 정식 회의, 그리고 매주 금요일 제출하는 서면 진행 보고가 그것이다. 그녀는 사무실 업무가 얼마나 많은 부분을 공유 문서로 처리하는지, 그리고 자신이 얼마나 빠르게 기여하기를 기대받는지에 놀랐다. 정오 무렵 그녀는 이미 제안서 초안을 검토해 달라는 요청을 받았다.",
          qs: [
            { q: "매주 금요일에 제출해야 하는 것은?", a: "서면 진행 보고", opts: ["서면 진행 보고", "주간 회의록", "출장 보고서", "예산 계획서"], why: "a written progress note due each Friday" },
            { q: "글의 분위기로 가장 알맞은 것은?", a: "기대가 크지만 빠르게 적응해야 하는 분위기", opts: ["느긋하고 여유로운 분위기", "기대가 크지만 빠르게 적응해야 하는 분위기", "규칙이 거의 없는 분위기", "경쟁이 지나쳐 불편한 분위기"], why: "how quickly she was expected to contribute" },
            { q: "미나가 정오 무렵 받은 요청은?", a: "제안서 초안 검토", opts: ["제안서 초안 검토", "회의 진행", "고객 응대", "예산 작성"], why: "she had already been asked to review a draft proposal" }
          ]
        }
      } },
    { no: 2, title: "회의 일정 조율", theme: "일정 · 이메일",
      levels: {
        basic: {
          text: "Daniel sends an email to his team. The meeting is on Wednesday at two o'clock. He asks everyone to reply by Tuesday. Two people cannot come at that time. Daniel moves the meeting to three o'clock. Now everyone can accept the new time.",
          ko: "대니얼은 팀에 이메일을 보낸다. 회의는 수요일 2시다. 그는 모두에게 화요일까지 답장해 달라고 부탁한다. 두 사람은 그 시간에 올 수 없다. 대니얼은 회의를 3시로 옮긴다. 이제 모두가 새 시간을 받아들일 수 있다.",
          qs: [
            { q: "대니얼이 답장을 요청한 기한은?", a: "화요일", opts: ["월요일", "화요일", "수요일", "목요일"], why: "He asks everyone to reply by Tuesday." },
            { q: "회의는 결국 몇 시로 정해졌나?", a: "3시", opts: ["1시", "2시", "3시", "4시"], why: "Daniel moves the meeting to three o'clock." },
            { q: "회의가 처음 잡혀 있던 시각은?", a: "2시", opts: ["1시", "2시", "3시", "4시"], why: "The meeting is on Wednesday at two o'clock." }
          ]
        },
        intermediate: {
          text: "Daniel emailed his department about Wednesday's budget meeting, originally scheduled for two o'clock. Because two team members had client appointments that afternoon, he asked everyone to confirm their availability by Tuesday noon. When the replies came in, he rescheduled the meeting for three o'clock and reserved the smaller conference room, which comfortably seats eight.",
          ko: "대니얼은 당초 2시로 예정됐던 수요일 예산 회의에 대해 부서에 이메일을 보냈다. 두 팀원이 그날 오후 고객 약속이 있었기 때문에, 그는 모두에게 화요일 정오까지 참석 가능 여부를 확인해 달라고 요청했다. 회신이 모이자 그는 회의를 3시로 변경하고 8명이 편하게 앉을 수 있는 작은 회의실을 예약했다.",
          qs: [
            { q: "회의 시간을 옮긴 이유는?", a: "두 팀원의 고객 약속", opts: ["회의실 문제", "두 팀원의 고객 약속", "예산 자료 지연", "매니저의 출장"], why: "Because two team members had client appointments that afternoon" },
            { q: "새로 예약한 회의실 규모는?", a: "8명 수용", opts: ["4명 수용", "6명 수용", "8명 수용", "12명 수용"], why: "which comfortably seats eight" },
            { q: "참석 여부를 알려 달라고 한 시한은?", a: "화요일 정오", opts: ["월요일 오전", "화요일 정오", "수요일 오전", "금요일"], why: "he asked everyone to confirm their availability by Tuesday noon" }
          ]
        },
        advanced: {
          text: "Daniel's note about the budget review set off a short but telling exchange. The original two o'clock slot had worked for most of the department, but two account managers were due at a client site that afternoon and would not be back before five. Rather than split the discussion, Daniel asked for confirmations by Tuesday noon and, once the replies were in, moved the session to three so that everyone could attend in person. He also downgraded the room booking, noting that the smaller space would keep the conversation focused.",
          ko: "예산 검토에 관한 대니얼의 메모는 짧지만 시사하는 바가 큰 논의를 불러일으켰다. 당초 2시 시간대는 부서 대부분에게 맞았지만, 두 계정 담당자가 그날 오후 고객사를 방문하기로 되어 있어 5시 전에는 돌아올 수 없었다. 대니얼은 논의를 나누는 대신 화요일 정오까지 참석 여부를 확인해 달라고 요청했고, 회신이 모이자 모두가 대면으로 참석할 수 있도록 일정을 3시로 옮겼다. 그는 또한 더 작은 공간이 논의를 집중시키는 데 도움이 된다는 점을 들어 회의실 예약을 하향 조정했다.",
          qs: [
            { q: "두 계정 담당자가 5시 전에 돌아올 수 없었던 이유는?", a: "고객사를 방문 중이라서", opts: ["휴가 중이라서", "고객사를 방문 중이라서", "교육을 받고 있어서", "재택근무라서"], why: "two account managers were due at a client site that afternoon" },
            { q: "대니얼이 회의실 예약을 바꾼 이유로 언급한 것은?", a: "집중도", opts: ["비용", "집중도", "조명", "좌석 수"], why: "the smaller space would keep the conversation focused" },
            { q: "대니얼이 논의를 나누지 않은 이유는?", a: "모두 함께 참석하게 하려고", opts: ["비용을 줄이려고", "모두 함께 참석하게 하려고", "회의실이 없어서", "시간이 촉박해서"], why: "Rather than split the discussion … moved the session to three so that everyone could attend in person" }
          ]
        }
      } },
    { no: 3, title: "배송 지연 문의", theme: "고객 응대 · 물류",
      levels: {
        basic: {
          text: "A customer calls the store. Her package is late. The clerk checks the order number. The package is at the station. It will arrive tomorrow. The clerk says sorry and gives a small discount.",
          ko: "한 고객이 매장에 전화한다. 그녀의 소포가 늦어지고 있다. 직원이 주문 번호를 확인한다. 소포는 역에 있다. 내일 도착할 것이다. 직원은 사과하고 작은 할인을 제공한다.",
          qs: [
            { q: "소포는 지금 어디에 있나?", a: "역", opts: ["매장", "창고", "역", "고객 집"], why: "The package is at the station." },
            { q: "직원이 제공한 것은?", a: "작은 할인", opts: ["환불", "작은 할인", "무료 배송", "쿠폰 두 장"], why: "The clerk says sorry and gives a small discount." },
            { q: "고객이 전화한 이유는?", a: "소포가 늦어서", opts: ["소포가 늦어서", "가격이 달라서", "재고가 없어서", "환불을 원해서"], why: "Her package is late." }
          ]
        },
        intermediate: {
          text: "A customer called to report that her order had not arrived by the promised date. After checking the tracking number, the clerk found that the parcel had reached the regional station but had missed the morning delivery truck. He apologized for the delay and arranged delivery for the following morning. As a goodwill gesture, he also applied a ten percent discount to her next purchase.",
          ko: "한 고객이 주문이 약속한 날짜까지 도착하지 않았다고 전화했다. 운송장 번호를 확인한 뒤 직원은 소포가 지역 물류센터에는 도착했지만 오전 배송 차량을 놓쳤다는 것을 알았다. 그는 지연에 대해 사과하고 다음 날 오전 배송으로 잡아 주었다. 또한 선의의 표시로 다음 구매에 10퍼센트 할인을 적용했다.",
          qs: [
            { q: "직원이 확인한 문제는?", a: "오전 배송 차량을 놓침", opts: ["주소 오류", "오전 배송 차량을 놓침", "결제 실패", "재고 부족"], why: "the parcel had reached the regional station but had missed the morning delivery truck" },
            { q: "직원이 선의로 제공한 것은?", a: "다음 구매 10퍼센트 할인", opts: ["무료 반품", "다음 구매 10퍼센트 할인", "배송비 환불", "적립금 두 배"], why: "he also applied a ten percent discount to her next purchase" },
            { q: "다시 잡아 준 배송 시점은?", a: "다음 날 오전", opts: ["당일 오후", "다음 날 오전", "이틀 뒤", "주말"], why: "arranged delivery for the following morning" }
          ]
        },
        advanced: {
          text: "When a customer reported that her order was several days overdue, the clerk did not simply repeat the tracking status. Reading the log, he noticed the parcel had cleared the regional hub but had missed two consecutive delivery runs, a pattern that usually pointed to a mislabeled address. He confirmed the details with the customer, arranged a morning delivery, and, without being asked, applied a ten percent credit to her account. The customer later wrote that the follow-up mattered more than the refund itself.",
          ko: "한 고객이 주문이 며칠이나 늦어졌다고 알렸을 때, 직원은 운송 상태를 그저 반복하지 않았다. 기록을 살펴보던 그는 소포가 지역 물류센터를 통과했지만 두 번 연속 배송 편을 놓쳤다는 점을 알아냈다. 이는 대개 주소가 잘못 기재됐을 때 나타나는 양상이었다. 그는 고객과 세부 사항을 확인하고 오전 배송을 잡았으며, 요청받지도 않은 채 계정에 10퍼센트 크레딧을 적용했다. 그 고객은 나중에 환불보다 그 후속 조치가 더 중요했다고 적었다.",
          qs: [
            { q: "직원이 추측한 문제의 원인은?", a: "주소 오기재", opts: ["주소 오기재", "파손", "재고 부족", "결제 오류"], why: "a pattern that usually pointed to a mislabeled address" },
            { q: "고객이 더 중요하게 여긴 것은?", a: "후속 조치", opts: ["환불 금액", "후속 조치", "할인율", "배송 속도"], why: "the follow-up mattered more than the refund itself" },
            { q: "직원이 운송 상태를 그대로 알리지 않고 한 일은?", a: "배송 기록을 살펴 원인을 찾은 것", opts: ["상태만 반복해 알려 준 것", "배송 기록을 살펴 원인을 찾은 것", "환불을 먼저 제안한 것", "다른 업체로 넘긴 것"], why: "Reading the log, he noticed the parcel had cleared the regional hub but had missed two consecutive delivery runs" }
          ]
        }
      } },
    { no: 4, title: "분기 실적 발표 준비", theme: "보고 · 발표",
      levels: {
        basic: {
          text: "The team prepares for the sales report. They collect numbers from each store. Sales are up this quarter. The manager makes ten slides. The report is on Friday. Everyone works together.",
          ko: "팀은 매출 보고서를 준비한다. 그들은 각 매장에서 수치를 모은다. 이번 분기 매출은 올랐다. 매니저는 슬라이드 10장을 만든다. 보고는 금요일이다. 모두 함께 일한다.",
          qs: [
            { q: "이번 분기 매출은?", a: "올랐다", opts: ["올랐다", "내렸다", "그대로다", "알 수 없다"], why: "Sales are up this quarter." },
            { q: "보고 날짜는?", a: "금요일", opts: ["수요일", "목요일", "금요일", "월요일"], why: "The report is on Friday." },
            { q: "매니저가 만든 슬라이드 수는?", a: "10장", opts: ["5장", "10장", "12장", "18장"], why: "The manager makes ten slides." }
          ]
        },
        intermediate: {
          text: "The sales team spent the week assembling figures for the quarterly review. Each branch submitted its totals by Wednesday, and the manager combined them into a twelve-slide deck. Revenue rose eight percent over the previous quarter, driven mainly by online sales. The presentation is scheduled for Friday morning, and the team will rehearse on Thursday.",
          ko: "영업팀은 분기 검토를 위한 수치를 모으느라 한 주를 보냈다. 각 지점은 수요일까지 합계를 제출했고, 매니저는 이를 12장짜리 슬라이드로 정리했다. 매출은 주로 온라인 판매에 힘입어 전 분기 대비 8퍼센트 증가했다. 발표는 금요일 오전으로 예정되어 있으며 팀은 목요일에 리허설을 한다.",
          qs: [
            { q: "매출 증가를 이끈 것은?", a: "온라인 판매", opts: ["오프라인 매장", "온라인 판매", "신제품 출시", "해외 지점"], why: "driven mainly by online sales" },
            { q: "리허설은 언제 하는가?", a: "목요일", opts: ["수요일", "목요일", "금요일", "월요일"], why: "the team will rehearse on Thursday" },
            { q: "지점들이 합계를 제출한 요일은?", a: "수요일", opts: ["월요일", "수요일", "금요일", "일요일"], why: "Each branch submitted its totals by Wednesday" }
          ]
        },
        advanced: {
          text: "Preparing the quarterly review turned out to be less about the numbers than about the story they told. Each branch filed its totals by Wednesday, but the figures alone were misleading: two regions had grown sharply while a third had quietly shrunk, and the net gain of eight percent hid both trends. The manager rebuilt the deck around that contrast, cutting the slide count from eighteen to twelve. The board, she argued, did not need every figure. It needed to know where the next quarter's growth would come from.",
          ko: "분기 검토 준비는 수치 자체보다 그 수치가 들려주는 이야기에 관한 일이었다. 각 지점은 수요일까지 합계를 제출했지만 숫자만으로는 오해를 낳을 수 있었다. 두 지역은 크게 성장한 반면 세 번째 지역은 조용히 줄어들었고, 8퍼센트의 순증가는 두 흐름을 모두 가리고 있었다. 매니저는 그 대비를 중심으로 슬라이드를 다시 구성해 장수를 18장에서 12장으로 줄였다. 그녀는 이사회가 모든 수치를 필요로 하는 것이 아니라 다음 분기의 성장이 어디서 나올지를 알아야 한다고 주장했다.",
          qs: [
            { q: "8퍼센트 순증가가 가린 것은?", a: "지역별 상반된 흐름", opts: ["비용 증가", "지역별 상반된 흐름", "환율 변동", "직원 이탈"], why: "the net gain of eight percent hid both trends" },
            { q: "매니저가 주장한 이사회의 요구는?", a: "다음 분기 성장 동력", opts: ["모든 세부 수치", "다음 분기 성장 동력", "비용 절감안", "조직 개편"], why: "It needed to know where the next quarter's growth would come from." },
            { q: "매니저가 슬라이드 장수를 줄인 이유는?", a: "지역별 대비에 집중하게 하려고", opts: ["자료가 부족해서", "지역별 대비에 집중하게 하려고", "시간이 없어서", "수치를 감추려고"], why: "The manager rebuilt the deck around that contrast, cutting the slide count from eighteen to twelve." }
          ]
        }
      } },
    { no: 5, title: "출장 일정 변경", theme: "출장 · 항공",
      levels: {
        basic: {
          text: "Mina has a business trip next week. She flies to Busan on Monday. The flight leaves at seven in the morning. Her manager changes the meeting to Tuesday. Mina books a new flight. She has more time to prepare.",
          ko: "미나는 다음 주에 출장이 있다. 그녀는 월요일에 부산으로 간다. 비행기는 아침 7시에 출발한다. 매니저가 회의를 화요일로 바꾼다. 미나는 새 항공편을 예약한다. 준비할 시간이 더 생긴다.",
          qs: [
            { q: "미나가 가는 도시는?", a: "부산", opts: ["서울", "부산", "대구", "제주"], why: "She flies to Busan on Monday." },
            { q: "원래 비행기 출발 시각은?", a: "아침 7시", opts: ["아침 6시", "아침 7시", "오전 10시", "오후 1시"], why: "The flight leaves at seven in the morning." },
            { q: "회의가 옮겨진 요일은?", a: "화요일", opts: ["월요일", "화요일", "수요일", "목요일"], why: "Her manager changes the meeting to Tuesday." }
          ]
        },
        intermediate: {
          text: "Mina's trip to the Busan office had been planned for Monday, but the client asked to postpone the review by a day. She rebooked a Tuesday morning flight and moved her hotel reservation accordingly. Because the new schedule left her an extra evening, she used it to rehearse the presentation with a colleague.",
          ko: "부산 지점 방문은 월요일로 잡혀 있었지만, 고객이 검토 일정을 하루 미뤄 달라고 요청했다. 미나는 화요일 오전 항공편으로 다시 예약하고 호텔 예약도 그에 맞춰 옮겼다. 새 일정 덕분에 저녁 시간이 하루 더 생기자 그 시간에 동료와 발표를 연습했다.",
          qs: [
            { q: "고객이 요청한 것은?", a: "검토 일정을 하루 미루기", opts: ["검토 일정을 하루 미루기", "장소 변경", "참석자 축소", "일주일 연기"], why: "the client asked to postpone the review by a day" },
            { q: "일정 변경과 함께 옮긴 예약은?", a: "호텔", opts: ["호텔", "렌터카", "회의실", "통역"], why: "moved her hotel reservation accordingly" },
            { q: "남은 저녁 시간에 한 일은?", a: "동료와 발표 연습", opts: ["자료 정리", "동료와 발표 연습", "고객 면담", "휴식"], why: "she used it to rehearse the presentation with a colleague" }
          ]
        },
        advanced: {
          text: "What looked like a routine scheduling conflict turned into a useful test of the team's planning. The Busan review had been fixed for Monday weeks in advance, and the client's request to push it back by a day rippled through flights, hotel bookings, and two internal meetings. Mina rebooked the first Tuesday departure, moved the hotel night by night, and folded the extra evening into a rehearsal. The postponement cost the team an afternoon of preparation, she noted, but it also gave them a second chance to sharpen an argument that had felt thin.",
          ko: "평범한 일정 충돌로 보였던 일은 팀의 계획 능력을 시험하는 계기가 됐다. 부산 검토 일정은 몇 주 전부터 월요일로 고정돼 있었고, 고객의 하루 연기 요청은 항공편과 호텔 예약, 내부 회의 두 건까지 줄줄이 영향을 주었다. 미나는 화요일 첫 편으로 다시 예약하고 호텔 숙박을 하루씩 옮겼으며, 남는 저녁 시간을 리허설에 넣었다. 그녀는 이번 연기로 팀이 오후 한나절의 준비 시간을 잃었지만, 미흡했던 논리를 다듬을 두 번째 기회를 얻었다고 정리했다.",
          qs: [
            { q: "고객의 연기 요청으로 함께 바뀐 것은?", a: "항공편과 호텔, 내부 회의", opts: ["항공편만", "항공편과 호텔, 내부 회의", "예산과 인원", "바뀐 것이 없다"], why: "rippled through flights, hotel bookings, and two internal meetings" },
            { q: "미나가 남는 저녁에 넣은 일은?", a: "발표 리허설", opts: ["자료 번역", "발표 리허설", "고객 접대", "장비 점검"], why: "folded the extra evening into a rehearsal" },
            { q: "글쓴이가 이번 연기에서 얻은 것으로 본 것은?", a: "논리를 다듬을 기회", opts: ["비용 절감", "논리를 다듬을 기회", "인력 충원", "일정 단축"], why: "it also gave them a second chance to sharpen an argument that had felt thin" }
          ]
        }
      } },
    { no: 6, title: "새 프로젝트 착수", theme: "팀 · 협업",
      levels: {
        basic: {
          text: "The team starts a new project. Grace leads the meeting. They list the tasks on the board. Daniel takes the budget. Mina writes the plan. They meet again on Friday. Everyone knows their job.",
          ko: "팀이 새 프로젝트를 시작한다. 그레이스가 회의를 이끈다. 그들은 칠판에 할 일을 적는다. 대니얼은 예산을 맡는다. 미나는 계획서를 쓴다. 그들은 금요일에 다시 만난다. 모두 자기 일을 알고 있다.",
          qs: [
            { q: "회의를 이끈 사람은?", a: "그레이스", opts: ["미나", "대니얼", "그레이스", "매니저"], why: "Grace leads the meeting." },
            { q: "대니얼이 맡은 일은?", a: "예산", opts: ["예산", "계획서", "일정", "고객 응대"], why: "Daniel takes the budget." },
            { q: "다시 만나기로 한 요일은?", a: "금요일", opts: ["월요일", "수요일", "금요일", "다음 주"], why: "They meet again on Friday." }
          ]
        },
        intermediate: {
          text: "Grace opened the kickoff meeting by asking each member to claim one workstream. Daniel took the budget, Mina agreed to draft the plan, and a third colleague volunteered to gather customer feedback. They posted the list on the shared board so that progress could be checked at a glance, and set Friday as the first review point.",
          ko: "그레이스는 착수 회의를 열어 각자 맡을 업무를 직접 고르게 했다. 대니얼은 예산을, 미나는 계획서 초안을 맡았고 또 한 명은 고객 의견 수집을 자원했다. 그들은 진행 상황을 한눈에 확인할 수 있도록 목록을 공유 게시판에 올리고, 금요일을 첫 점검 시점으로 정했다.",
          qs: [
            { q: "그레이스가 회의에서 택한 방식은?", a: "각자 업무를 직접 고르게 하기", opts: ["팀장이 지정하기", "각자 업무를 직접 고르게 하기", "투표로 정하기", "순번대로 맡기기"], why: "asking each member to claim one workstream" },
            { q: "공유 게시판에 목록을 올린 이유는?", a: "진행 상황을 한눈에 보려고", opts: ["기록 보관", "진행 상황을 한눈에 보려고", "보고용", "규정 준수"], why: "so that progress could be checked at a glance" },
            { q: "첫 점검 시점으로 정한 날은?", a: "금요일", opts: ["목요일", "금요일", "다음 주 월요일", "월말"], why: "set Friday as the first review point" }
          ]
        },
        advanced: {
          text: "The kickoff was deliberately short on instructions. Rather than assigning workstreams herself, Grace asked each member to claim one and to name the first deliverable it would produce. The effect was subtle but real: nobody could later claim they had not chosen the task, and the shared board turned the plan into something the team could argue with. Friday's review was set less as a deadline than as a checkpoint for questioning assumptions while they were still cheap to change.",
          ko: "착수 회의는 지시를 의도적으로 줄였다. 그레이스는 업무를 직접 배분하는 대신, 각자 하나씩 골라 그것이 만들어 낼 첫 결과물까지 밝히게 했다. 효과는 미묘하지만 분명했다. 나중에 자기가 그 일을 고르지 않았다고 말할 수 없게 됐고, 공유 게시판은 계획을 팀이 함께 따져 볼 수 있는 대상으로 바꿔 놓았다. 금요일 점검은 마감이라기보다, 가정을 바꾸는 비용이 아직 낮을 때 의문을 제기하는 지점으로 정했다.",
          qs: [
            { q: "그레이스가 업무 배분 대신 한 일은?", a: "각자 고르고 첫 결과물까지 밝히게 한 것", opts: ["업무를 직접 지정한 것", "각자 고르고 첫 결과물까지 밝히게 한 것", "외부에 위탁한 것", "일정만 통보한 것"], why: "Grace asked each member to claim one and to name the first deliverable it would produce" },
            { q: "공유 게시판의 효과로 본 것은?", a: "계획을 함께 따져 볼 대상이 된 것", opts: ["보고 절차가 줄어든 것", "계획을 함께 따져 볼 대상이 된 것", "평가 기준이 생긴 것", "책임을 피하게 된 것"], why: "turned the plan into something the team could argue with" },
            { q: "금요일 점검의 성격은?", a: "가정을 점검하는 지점", opts: ["최종 마감", "가정을 점검하는 지점", "보고 의무", "평가 시험"], why: "set less as a deadline than as a checkpoint for questioning assumptions" }
          ]
        }
      } }
  ]
};
