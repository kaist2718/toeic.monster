/* toeic.monster 홈 앱의 데이터 — assets/app.js 안에 있던 배열·객체를 파일로 옮겼습니다
   (docs/app-split-plan.md 2단계: 스크립트·스타일·데이터를 각각 캐시 가능한 파일로).
   최상위 var 라 전역(window.UNITS …)이 되고, assets/app.js 가 이름으로 그대로 씁니다.
   index.html 이 이 파일을 <assets/app.js> 보다 먼저 부릅니다. */
var UNITS = [
  { id: 1, title: "비즈니스와 회사", sub: "Business & Company · 토익 LC Part 1·2, RC Part 5 빈출", level: "초급", icon: "💼" },
  { id: 2, title: "회의와 협상", sub: "Meetings & Negotiation · 회의 관련 표현의 핵심", level: "중급", icon: "🤝" },
  { id: 3, title: "프레젠테이션과 발표", sub: "Presentations · 발표·보고 상황에서 자주 등장", level: "중급", icon: "📊" },
  { id: 4, title: "마케팅과 광고", sub: "Marketing & Advertising · 광고·판촉 분야 어휘", level: "중급", icon: "📣" },
  { id: 5, title: "금융과 회계", sub: "Finance & Accounting · 결제·예산 관련 필수 어휘", level: "중급", icon: "💰" },
  { id: 6, title: "인사와 채용", sub: "Human Resources & Employment · 채용 공고·면접 빈출", level: "중급", icon: "🧑‍💼" },
  { id: 7, title: "고객 서비스", sub: "Customer Service · 민원 응대·불만 처리 표현", level: "초급", icon: "🙋" },
  { id: 8, title: "쇼핑과 소비", sub: "Shopping & Consumer · 매장·구매·배송 어휘", level: "초급", icon: "🛍️" },
  { id: 9, title: "여행과 출장", sub: "Travel & Business Trips · 출장·공항·호텔 상황", level: "초급", icon: "✈️" },
  { id: 10, title: "사무실과 문서", sub: "Office & Documents · 업무 도구·서류 처리 어휘", level: "초급", icon: "📁" },
  { id: 11, title: "계약과 법률", sub: "Contracts & Legal · 계약 조건·법률 관련 어휘", level: "고급", icon: "⚖️" },
  { id: 12, title: "생산과 공급", sub: "Production & Supply · 제조·유통·재고 어휘", level: "중급", icon: "🏭" },
  { id: 13, title: "기술과 IT", sub: "Technology & IT · 컴퓨터·인터넷·디지털 어휘", level: "중급", icon: "💻" },
  { id: 14, title: "통신과 미디어", sub: "Communication & Media · 연락·뉴스·소셜 미디어", level: "중급", icon: "📡" },
  { id: 15, title: "경제와 사회", sub: "Economy & Society · 경제 지표·사회 이슈 어휘", level: "고급", icon: "📈" },
  { id: 16, title: "식당과 음식", sub: "Restaurants & Food · 식당 예약·주문 상황 빈출", level: "초급", icon: "🍽️" },
  { id: 17, title: "건강과 병원", sub: "Health & Medical · 병원 방문·증상 설명 어휘", level: "중급", icon: "🏥" },
  { id: 18, title: "주거와 부동산", sub: "Housing & Real Estate · 집 구하기·계약 상황 어휘", level: "중급", icon: "🏠" },
  { id: 19, title: "교육과 학교", sub: "Education & School · 학교·수업·시험 관련 어휘", level: "중급", icon: "🎓" },
  { id: 20, title: "은행과 투자", sub: "Banking & Investing · 계좌·주식·투자 어휘", level: "고급", icon: "🏦" },
  { id: 21, title: "세일즈와 무역", sub: "Sales & Trade · 판매·수출입·계약 어휘", level: "고급", icon: "🚢" },
  { id: 22, title: "도시와 생활", sub: "City & Everyday Life · 교통·시설·관광 어휘", level: "초급", icon: "🏙️" },
  { id: 23, title: "직장 인간관계", sub: "Workplace Relations · 협력·갈등·동기 어휘", level: "중급", icon: "👥" },
  { id: 24, title: "품질과 개선", sub: "Quality & Improvement · 개선·평가·분석 어휘", level: "중급", icon: "🔧" },
  { id: 25, title: "이벤트와 행사", sub: "Events & Functions · 행사·모임·축제 어휘", level: "중급", icon: "🎉" },
  { id: 26, title: "환경과 에너지", sub: "Environment & Energy · 환경·에너지·재활용 어휘", level: "고급", icon: "🌱" },
  { id: 27, title: "진로와 직업", sub: "Careers & Occupations · 직업·직함·업무 어휘", level: "중급", icon: "🧭" },
  { id: 28, title: "시간과 일정", sub: "Time & Schedule · 시간 표현·주기 어휘", level: "초급", icon: "⏰" },
  { id: 29, title: "감정과 태도", sub: "Feelings & Attitudes · 기분·태도·성격 어휘", level: "초급", icon: "💭" },
  { id: 30, title: "복합 실전 어휘", sub: "Essential Mix · 시험에 자주 나오는 부사·형용사", level: "고급", icon: "🎯" }
];

var CHEERS = [
  "🔥 오늘도 30개, 함께 외워볼까요?",
  "💪 꾸준함이 점수를 만듭니다.",
  "🌱 작은 습관이 큰 변화를 만듭니다.",
  "🏃 1분이라도 좋아요, 오늘부터 시작하세요.",
  "📈 조금씩 나아지고 있는 당신을 응원해요!",
  "🎯 목표 점수를 향해 오늘도 한 걸음!",
  "✨ 외운 단어는 절대 배신하지 않아요.",
  "🧠 오늘의 30개가 990점의 씨앗이에요."
];

var QUOTES = [
  { en: "The secret of getting ahead is getting started.", ko: "앞서가는 비결은 시작하는 것이다.", author: "마크 트웨인 (Mark Twain)" },
  { en: "Success is the sum of small efforts, repeated day in and day out.", ko: "성공은 하루하루 반복되는 작은 노력의 합이다.", author: "로버트 콜리어 (Robert Collier)" },
  { en: "The best way to predict the future is to create it.", ko: "미래를 예측하는 가장 좋은 방법은 미래를 만드는 것이다.", author: "피터 드러커 (Peter Drucker)" },
  { en: "It always seems impossible until it's done.", ko: "끝나기 전까지는 항상 불가능해 보인다.", author: "넬슨 만델라 (Nelson Mandela)" },
  { en: "Don't watch the clock; do what it does. Keep going.", ko: "시계를 쳐다보지 말고 시계처럼 계속 나아가라.", author: "샘 레벤슨 (Sam Levenson)" },
  { en: "Learning never exhausts the mind.", ko: "배움은 마음을 결코 지치게 하지 않는다.", author: "레오나르도 다빈치 (Leonardo da Vinci)" },
  { en: "A journey of a thousand miles begins with a single step.", ko: "천 리 길도 한 걸음부터.", author: "노자 (Lao Tzu)" },
  { en: "The expert in anything was once a beginner.", ko: "모든 전문가도 한때는 초보자였다.", author: "헬렌 헤이스 (Helen Hayes)" }
];

var GRAMMAR_TIPS = [
  ["품사 구분: 명사 vs 동사 vs 형용사", "The rapid growth surprised everyone. / The company grew rapidly.", "빈칸 앞뒤 품사부터 확인하세요. 명사는 형용사가, 동사는 부사가 수식해요."],
  ["주어-동사 수 일치", "Each employee has a laptop. / All employees have laptops.", "each·every·one of는 단수 취급, all·several은 복수 동사를 써요."],
  ["현재완료: 과거부터 지금까지", "Sales have increased since May.", "since·for와 함께 쓰이면 현재완료(has/have + p.p.)를 고르세요."],
  ["관계사: who vs which vs whose", "The manager who joined last year is retiring.", "사람=who, 사물=which, 소유=whose, 사람·사물 모두=that."],
  ["전치사: at / on / in", "The seminar starts at 9 a.m. on Monday in June.", "시각=at, 날짜·요일=on, 월·년·계절=in."],
  ["비교급: more / as~as", "This system is more efficient than the old one.", "비교급은 than, 동등 비교는 as + 원급 + as."],
  ["가산 vs 불가산: few / little", "We have a few reports to review. / I need a little information.", "few·a few는 가산명사, little·a little은 불가산명사와 쓰여요."],
  ["동사 패턴: -ing vs to-v", "He avoided making a decision. / They decided to postpone it.", "enjoy·avoid·finish는 -ing, want·decide·plan은 to-v를 취해요."],
  ["수동태: be + p.p.", "The report was submitted yesterday.", "주어가 동작을 받으면 be + 과거분사. by 목적어가 단서예요."],
  ["접속사: although / because / so that", "Although it rained, the event continued.", "although=양보, because=원인, so that=목적."],
  ["현재분사 vs 과거분사", "The confusing instructions confused the new staff.", "-ing는 '~하게 하는'(능동), -ed는 '~된'(수동) 느낌이에요."],
  ["부사 위치", "The new policy will significantly affect sales.", "부사는 일반동사 앞, be동사·조동사 뒤에 놓여요."],
  ["대명사 일치", "The company increased its profits. / Employees updated their skills.", "단수 명사=its, 복수 명사=their. 선행사와 일치시켜요."],
  ["whether vs if", "Please let us know whether you will attend.", "whether 는 whether or not 형태로 자주 쓰이고, 명사절에서 if 대신 쓸 수 있어요."],
  ["despite / in spite of", "Despite the delay, the project was completed on time.", "despite + 명사(구). although + 절과 헷갈리지 마세요."],
  ["병렬 구조", "The job requires patience, accuracy, and flexibility.", "and·or로 연결되는 요소는 같은 품사·형태를 유지해야 해요."],
  ["to부정사의 목적", "We hired an expert to solve the problem.", "'~하기 위해서'는 to + 동사원형이 목적을 나타내요."],
  ["빈도 부사", "The manager usually reviews the report on Fridays.", "always·usually·often은 be동사 뒤, 일반동사 앞에 놓여요."],
  ["동명사 주어", "Working remotely has become more common.", "동사가 주어 자리에 오면 -ing형(동명사)을 써요."],
  ["such as / for example", "Please bring documents such as a passport and ID.", "예시를 들 때 such as + 명사 목록을 사용해요."],
  ["가정법 현재: 동사원형", "The manager insisted that the report be submitted today.", "insist·recommend·suggest + that + 주어 + 동사원형을 써요."],
  ["부정어 도치: Not until", "Not until noon did the shipment arrive.", "Not until·Only when이 문장 앞에 오면 조동사가 주어 앞으로 도치돼요."],
  ["관계부사: where / when / why", "This is the office where the interviews take place.", "장소=where, 시간=when, 이유=why로 이어 두 문장을 하나로 만들어요."],
  ["분사구문", "Facing a tight deadline, the team worked overtime.", "접속사와 주어가 같으면 생략하고 분사(-ing / -ed)로 시작해요."],
  ["명사절 접속사: what vs that", "Please let me know what time the meeting starts.", "what은 '~하는 것'으로 불완전한 절을, that은 완전한 절을 이끌어요."],
  ["so that: 목적과 결과", "The instructions were written so that everyone could follow them.", "so that + 주어 + 조동사 = ~하도록(목적)을 나타내요."],
  ["much vs many", "We do not have much time. / There were many applicants.", "불가산명사는 much, 가산 복수명사는 many로 수량을 표현해요."],
  ["another / other / the other", "Please send another copy. / The other candidates are waiting.", "another=하나 더, (the) other=나머지, others=다른 것들로 구분해요."],
  ["used to vs be used to", "She used to work downtown. / She is used to working late.", "used to + 동사원형=과거 습관, be used to + -ing=~에 익숙하다는 뜻이에요."],
  ["by vs until", "Submit the form by Friday. / The office is open until six.", "by는 완료 기한(~까지), until은 상태가 계속되는 시점(~동안)이에요."],
  ["접속부사: however / therefore", "The plan was costly; however, we approved it.", "however=그러나(대조), therefore=그러므로(결과)로 접속사가 아니라 부사예요."],
  ["가정법 과거", "If I had more time, I would review the contract.", "현재 사실의 반대는 If + 과거형, 주절에 would + 동사원형을 씁니다."],
  ["사역동사: make / have / let", "The manager had the team revise the report.", "make·have·let + 목적어 + 동사원형으로 '~하게 하다'를 나타냅니다."],
  ["지각동사", "I saw the technician check the equipment.", "see·hear·watch + 목적어 + 동사원형(전체 동작) / -ing(진행 중)이에요."],
  ["관계대명사 목적격 생략", "The report (which) she submitted was excellent.", "목적격 관계대명사는 뒤에 주어+동사가 오면 생략할 수 있어요."],
  ["some vs any", "We have some extra copies. / Do you have any questions?", "긍정문은 some, 부정문·의문문은 any를 주로 씁니다."],
  ["현재완료 vs 과거시제", "She has worked here for five years. / She worked here in 2020.", "기간의 지속은 현재완료, 끝난 과거 시점은 과거시제를 써요."],
  ["the 비교급, the 비교급", "The earlier you book, the cheaper the tickets are.", "'~하면 할수록 더 ~하다'는 the + 비교급 + 주어 + 동사 구조입니다."],
  ["It is ~ that 강조", "It was the manager that approved the request.", "강조하고 싶은 말을 It is와 that 사이에 넣어 강조할 수 있어요."]
];

var CONFUSABLES = [
  { pair: "affect / effect", tag: "동사 / 명사",
    a: { en: "The new policy will affect all employees.", ko: "새 정책은 모든 직원에게 영향을 줄 것이다." },
    b: { en: "The effect of the change was immediate.", ko: "그 변화의 효과는 즉시 나타났다." },
    tip: "affect는 '~에 영향을 주다'(동사), effect는 '효과·결과'(명사)예요." },
  { pair: "adapt / adopt", tag: "적응 / 채택",
    a: { en: "New staff quickly adapt to the company culture.", ko: "신입 직원들은 회사 문화에 빠르게 적응한다." },
    b: { en: "The board decided to adopt the new system.", ko: "이사회는 새 시스템을 채택하기로 결정했다." },
    tip: "adapt는 '적응하다·각색하다', adopt는 '채택하다·입양하다'예요." },
  { pair: "advice / advise", tag: "명사 / 동사",
    a: { en: "She gave me useful advice about the interview.", ko: "그녀는 면접에 대한 유용한 조언을 해 주었다." },
    b: { en: "I advise you to confirm the schedule first.", ko: "먼저 일정을 확인하시길 권합니다." },
    tip: "advice는 셀 수 없는 명사, advise는 동사입니다." },
  { pair: "accept / except", tag: "수락 / 제외",
    a: { en: "We accept applications until Friday.", ko: "우리는 금요일까지 지원서를 접수한다." },
    b: { en: "The office is open every day except Sunday.", ko: "사무실은 일요일을 제외하고 매일 연다." },
    tip: "accept는 '받아들이다', except는 '~을 제외하고'예요." },
  { pair: "personal / personnel", tag: "개인 / 인사",
    a: { en: "Please keep your personal belongings with you.", ko: "개인 소지품은 몸에 지니고 계세요." },
    b: { en: "The personnel department is hiring new staff.", ko: "인사 부서는 신입 직원을 채용 중이다." },
    tip: "personal은 '개인의', personnel은 '직원·인사'를 뜻해요." },
  { pair: "principal / principle", tag: "주요한 / 원칙",
    a: { en: "Cost is the principal reason for the change.", ko: "비용이 그 변경의 주된 이유이다." },
    b: { en: "Our company operates on a simple principle.", ko: "우리 회사는 단순한 원칙으로 운영된다." },
    tip: "principal은 '주요한·교장', principle은 '원칙'이에요." },
  { pair: "stationary / stationery", tag: "고정된 / 문구",
    a: { en: "The machines must remain stationary during use.", ko: "기계는 사용 중에 고정되어 있어야 한다." },
    b: { en: "Office stationery can be ordered online.", ko: "사무용 문구는 온라인으로 주문할 수 있다." },
    tip: "stationary는 '움직이지 않는', stationery는 '문구류'예요." },
  { pair: "complement / compliment", tag: "보완 / 칭찬",
    a: { en: "The new software will complement our services.", ko: "새 소프트웨어는 우리 서비스를 보완할 것이다." },
    b: { en: "The manager complimented her on the presentation.", ko: "매니저는 그녀의 발표를 칭찬했다." },
    tip: "complement는 '보완하다', compliment는 '칭찬하다'예요." },
  { pair: "raise / rise", tag: "타동사 / 자동사",
    a: { en: "They decided to raise the price next month.", ko: "그들은 다음 달에 가격을 인상하기로 했다." },
    b: { en: "Sales rose sharply in the first quarter.", ko: "1분기에 매출이 급격히 올랐다." },
    tip: "raise는 목적어가 필요한 타동사, rise는 목적어가 없는 자동사예요." },
  { pair: "ensure / insure", tag: "보장 / 보험",
    a: { en: "Please ensure that the door is locked.", ko: "문이 잠겼는지 반드시 확인해 주세요." },
    b: { en: "The shipment is insured against damage.", ko: "그 화물은 손상에 대비해 보험에 가입되어 있다." },
    tip: "ensure는 '확실히 하다', insure는 '보험에 들다'예요." },
  { pair: "proceed / precede", tag: "진행 / 선행",
    a: { en: "We will proceed with the plan as scheduled.", ko: "우리는 계획대로 진행할 것이다." },
    b: { en: "A short introduction will precede the main speech.", ko: "짧은 소개가 본 연설에 앞설 것이다." },
    tip: "proceed는 '계속하다·진행하다', precede는 '~보다 앞서다'예요." },
  { pair: "economic / economical", tag: "경제 / 절약",
    a: { en: "The report covers the current economic situation.", ko: "그 보고서는 현재 경제 상황을 다룬다." },
    b: { en: "This model is more economical to maintain.", ko: "이 모델은 유지비가 더 경제적이다." },
    tip: "economic은 '경제의', economical은 '비용이 절약되는'이에요." },
  { pair: "sensible / sensitive", tag: "분별 있는 / 민감한",
    a: { en: "It was a sensible decision to book the tickets early.", ko: "티켓을 일찍 예약한 것은 분별 있는 결정이었다." },
    b: { en: "Some customers are sensitive to price changes.", ko: "일부 고객은 가격 변화에 민감하다." },
    tip: "sensible은 '분별 있는', sensitive는 '민감한'이에요." },
  { pair: "considerable / considerate", tag: "상당한 / 사려 깊은",
    a: { en: "The project required a considerable amount of time.", ko: "그 프로젝트는 상당한 시간이 필요했다." },
    b: { en: "It was considerate of you to inform us in advance.", ko: "미리 알려 주시다니 사려 깊으셨어요." },
    tip: "considerable은 '상당한', considerate는 '사려 깊은'이에요." },
  { pair: "respectful / respectable", tag: "존중하는 / 훌륭한",
    a: { en: "Please be respectful to all clients and colleagues.", ko: "모든 고객과 동료를 존중해 주세요." },
    b: { en: "The company reported respectable quarterly earnings.", ko: "그 회사는 훌륭한 분기 실적을 보고했다." },
    tip: "respectful은 '존중하는', respectable은 '존경할 만한·훌륭한'이에요." },
  { pair: "historic / historical", tag: "역사적인 / 역사상의",
    a: { en: "The two firms signed a historic agreement.", ko: "그 두 회사는 역사적인 협약을 맺었다." },
    b: { en: "The museum displays historical documents from the 1900s.", ko: "그 박물관은 1900년대의 역사 문서를 전시한다." },
    tip: "historic은 '역사적으로 중요한', historical은 '역사와 관련된'이에요." },
  { pair: "continual / continuous", tag: "반복되는 / 끊임없는",
    a: { en: "The team faced continual delays during construction.", ko: "그 팀은 공사 중 반복되는 지연에 직면했다." },
    b: { en: "The machine requires a continuous supply of water.", ko: "그 기계는 끊임없는 물 공급을 필요로 한다." },
    tip: "continual은 '간간이 반복되는', continuous는 '끊이지 않고 계속되는'이에요." },
  { pair: "borrow / lend", tag: "빌리다 / 빌려주다",
    a: { en: "May I borrow your laptop for the presentation?", ko: "발표를 위해 노트북을 빌려도 될까요?" },
    b: { en: "The bank agreed to lend the company two million dollars.", ko: "은행은 그 회사에 200만 달러를 빌려주기로 했다." },
    tip: "borrow는 '빌리다(받는 쪽)', lend는 '빌려주다(주는 쪽)'예요." },
  { pair: "remember / remind", tag: "기억하다 / 상기시키다",
    a: { en: "Please remember to sign the visitor log.", ko: "방문자 명부에 서명하는 것을 잊지 마세요." },
    b: { en: "The system will remind you to renew your password.", ko: "그 시스템이 비밀번호 갱신을 상기시켜 줄 것이다." },
    tip: "remember는 스스로 기억하다, remind는 남에게 상기시키다예요." },
  { pair: "device / devise", tag: "장치 / 고안하다",
    a: { en: "This device measures the office temperature.", ko: "이 장치는 사무실 온도를 측정한다." },
    b: { en: "The team devised a new marketing strategy.", ko: "그 팀은 새로운 마케팅 전략을 고안했다." },
    tip: "device는 '장치'(명사), devise는 '고안하다'(동사)예요." }
];

var WORD_PARTS = [
  { type: "접두사", part: "re-", mean: "다시, 뒤로", words: "review · refund · renew", ex: "Please review the contract before signing." },
  { type: "접두사", part: "pre-", mean: "미리, 앞서", words: "preview · prepare · prevent", ex: "We need to prepare the documents in advance." },
  { type: "접두사", part: "un-", mean: "반대, 부정", words: "unavailable · unable · unclear", ex: "The product is currently unavailable." },
  { type: "접두사", part: "dis-", mean: "떨어뜨리다, 반대", words: "discount · disappoint · dismiss", ex: "Members receive a ten percent discount." },
  { type: "접두사", part: "over-", mean: "지나치게, 위에", words: "overtime · overdue · overlook", ex: "The payment is two weeks overdue." },
  { type: "접두사", part: "inter-", mean: "사이에, 상호", words: "interview · internal · interact", ex: "She has an interview with the manager today." },
  { type: "접두사", part: "trans-", mean: "가로질러, 이동", words: "transfer · transport · translate", ex: "The funds will be transferred tomorrow." },
  { type: "어근", part: "-tain", mean: "붙잡다 (hold)", words: "maintain · obtain · contain", ex: "We must maintain high quality standards." },
  { type: "어근", part: "-duct", mean: "이끌다 (lead)", words: "produce · conduct · reduce", ex: "The company will conduct a survey." },
  { type: "어근", part: "-spect", mean: "보다 (look)", words: "inspect · prospect · aspect", ex: "The equipment is inspected every month." },
  { type: "어근", part: "-port", mean: "나르다 (carry)", words: "import · export · report", ex: "Exports increased by twelve percent." },
  { type: "어미", part: "-able / -ible", mean: "~할 수 있는", words: "available · reliable · flexible", ex: "The schedule is flexible for next week." },
  { type: "접두사", part: "bi-", mean: "둘, 두 개", words: "bilingual · bimonthly · biannual", ex: "Our newsletter is published bimonthly." },
  { type: "접두사", part: "co-", mean: "함께, 공동으로", words: "coworker · cooperate · coordinate", ex: "Departments must cooperate on this project." },
  { type: "접두사", part: "mis-", mean: "잘못, 나쁘게", words: "misunderstand · misplaced · mistake", ex: "The shipment was sent to the wrong address by mistake." },
  { type: "접두사", part: "multi-", mean: "많은, 다수의", words: "multinational · multiple · multimedia", ex: "She manages multiple accounts at once." },
  { type: "접두사", part: "out-", mean: "밖으로, 능가하여", words: "outdated · outsource · outperform", ex: "Our sales outperformed the market average." },
  { type: "접두사", part: "sub-", mean: "아래, 하위", words: "subsidiary · subtitle · submit", ex: "The company opened a subsidiary in Singapore." },
  { type: "접두사", part: "super-", mean: "위, 초월", words: "supervisor · superior · supervise", ex: "A supervisor will inspect the warehouse today." },
  { type: "어근", part: "-dict", mean: "말하다 (say)", words: "predict · dictate · contradict", ex: "Analysts predict strong demand this year." },
  { type: "어근", part: "-fer", mean: "옮기다 (carry)", words: "transfer · offer · prefer", ex: "We prefer the morning slot for the briefing." },
  { type: "어근", part: "-ject", mean: "던지다 (throw)", words: "project · reject · inject", ex: "The board decided to reject the proposal." },
  { type: "어근", part: "-miss / -mit", mean: "보내다 (send)", words: "submit · dismiss · transmit", ex: "Please submit your timesheet by Friday." },
  { type: "어근", part: "-scrib / -script", mean: "쓰다 (write)", words: "describe · subscribe · manuscript", ex: "Please describe the problem in detail." }
];

var BADGES = [
  { ico: "🌱", name: "첫 걸음", desc: "첫 단어를 외웠어요", test: function (s) { return s.learnedN >= 1; } },
  { ico: "📗", name: "워밍업", desc: "단어 10개 달성", test: function (s) { return s.learnedN >= 10; } },
  { ico: "📘", name: "50단어 클럽", desc: "단어 50개 달성", test: function (s) { return s.learnedN >= 50; } },
  { ico: "📙", name: "100단어 클럽", desc: "단어 100개 달성", test: function (s) { return s.learnedN >= 100; } },
  { ico: "📚", name: "유닛 정복", desc: "한 유닛 100% 완주", test: function (s) { return s.maxUnitPct >= 100; } },
  { ico: "⚡", name: "하프 러너", desc: "전체 50% 학습", test: function (s) { return s.pct >= 50; } },
  { ico: "🏆", name: "1000 완주", desc: "1,000단어 전부 외우기", test: function (s) { return s.total > 0 && s.learnedN >= s.total; } },
  { ico: "🎯", name: "퀴즈 마스터", desc: "퀴즈 100문제 풀이", test: function (s) { return s.quizQ >= 100; } },
  { ico: "💎", name: "정확도 장인", desc: "50문제 이상 · 정답률 90%", test: function (s) { return s.quizQ >= 50 && s.quizPct >= 90; } },
  { ico: "🔥", name: "3일 연속", desc: "3일 연속 학습", test: function (s) { return s.streak >= 3; } },
  { ico: "🔥", name: "7일 연속", desc: "일주일 연속 학습", test: function (s) { return s.streak >= 7; } },
  { ico: "🌟", name: "한 달 연속", desc: "30일 연속 학습", test: function (s) { return s.streak >= 30; } },
  { ico: "🏔️", name: "100일 연속", desc: "100일 연속 학습", test: function (s) { return s.streak >= 100; } },
  { ico: "💪", name: "주간 개근", desc: "일주일 동안 7일 학습", test: function (s) { return s.weekDays >= 7; } },
  { ico: "⚡", name: "첫 챌린지", desc: "오늘의 챌린지 1회 완료", test: function (s) { return s.challengeDays >= 1; } },
  { ico: "🗓️", name: "챌린지 7일", desc: "오늘의 챌린지 7일 완료", test: function (s) { return s.challengeDays >= 7; } },
  { ico: "📖", name: "첫 정독", desc: "읽기 지문 1편 완주", test: function (s) { return s.libraryN >= 1; } },
  { ico: "📚", name: "정독가", desc: "읽기 지문 10편 완주", test: function (s) { return s.libraryN >= 10; } },
  { ico: "📝", name: "모의고사 데뷔", desc: "모의고사 1회 완료", test: function (s) { return s.mockDone; } },
  { ico: "🚀", name: "700 도달", desc: "최고 예상 점수 700+", test: function (s) { return s.best >= 700; } },
  { ico: "👑", name: "900 도달", desc: "최고 예상 점수 900+", test: function (s) { return s.best >= 900; } },
  { ico: "⭐", name: "단어 수집가", desc: "내 단어장 20개", test: function (s) { return s.favN >= 20; } }
];

var COLLOCATIONS = [
  { phrase: "deliver a speech", ko: "연설하다", ex: "The director will deliver a speech at the awards ceremony.", exKo: "그 책임자는 시상식에서 연설할 것이다." },
  { phrase: "make a decision", ko: "결정하다", ex: "We need to make a decision before Friday.", exKo: "우리는 금요일 전까지 결정을 내려야 한다." },
  { phrase: "reach an agreement", ko: "합의에 이르다", ex: "The two sides reached an agreement on the price.", exKo: "양측은 가격에 합의했다." },
  { phrase: "meet a deadline", ko: "마감을 지키다", ex: "The team worked late to meet the deadline.", exKo: "그 팀은 마감을 지키기 위해 늦게까지 일했다." },
  { phrase: "gain experience", ko: "경험을 쌓다", ex: "She gained valuable experience during the internship.", exKo: "그녀는 인턴 기간 동안 값진 경험을 쌓았다." },
  { phrase: "take responsibility", ko: "책임을 지다", ex: "The manager took responsibility for the mistake.", exKo: "그 매니저가 실수에 대한 책임을 졌다." },
  { phrase: "raise funds", ko: "자금을 모으다", ex: "The charity raised funds for the new hospital.", exKo: "그 자선단체는 새 병원을 위해 자금을 모았다." },
  { phrase: "launch a product", ko: "제품을 출시하다", ex: "The company will launch a new product next month.", exKo: "그 회사는 다음 달에 신제품을 출시할 것이다." },
  { phrase: "conduct a survey", ko: "설문조사를 하다", ex: "We conducted a survey of our customers last week.", exKo: "우리는 지난주에 고객을 대상으로 설문조사를 했다." },
  { phrase: "submit a proposal", ko: "제안서를 제출하다", ex: "Please submit a proposal by the end of the week.", exKo: "이번 주 말까지 제안서를 제출해 주세요." },
  { phrase: "place an order", ko: "주문하다", ex: "We placed an order for fifty laptops.", exKo: "우리는 노트북 50대를 주문했다." },
  { phrase: "exceed expectations", ko: "기대를 뛰어넘다", ex: "The results exceeded our expectations.", exKo: "그 결과는 우리의 기대를 뛰어넘었다." },
  { phrase: "take a break", ko: "휴식을 취하다", ex: "Let's take a short break before the next session.", exKo: "다음 세션 전에 잠시 휴식을 취합시다." },
  { phrase: "draw attention", ko: "관심을 끌다", ex: "The colorful display drew a lot of attention.", exKo: "그 화려한 전시는 많은 관심을 끌었다." },
  { phrase: "make progress", ko: "진전을 이루다", ex: "We have made good progress on the project.", exKo: "우리는 프로젝트에서 좋은 진전을 이루었다." },
  { phrase: "keep a record", ko: "기록을 남기다", ex: "Please keep a record of all customer calls.", exKo: "모든 고객 통화 기록을 남겨 주세요." },
  { phrase: "offer a discount", ko: "할인을 제공하다", ex: "The store offers a discount to members.", exKo: "그 매장은 회원에게 할인을 제공한다." },
  { phrase: "pay attention to", ko: "~에 주의를 기울이다", ex: "Please pay attention to the safety instructions.", exKo: "안전 지침에 주의를 기울여 주세요." },
  { phrase: "give a presentation", ko: "발표하다", ex: "Each candidate will give a short presentation.", exKo: "각 지원자가 짧은 발표를 할 것입니다." },
  { phrase: "hold a meeting", ko: "회의를 열다", ex: "The department holds a meeting every Monday.", exKo: "그 부서는 매주 월요일 회의를 연다." },
  { phrase: "set a budget", ko: "예산을 책정하다", ex: "We set a budget for the next quarter.", exKo: "우리는 다음 분기 예산을 책정했다." },
  { phrase: "meet requirements", ko: "요구 사항을 충족하다", ex: "The proposal meets all the requirements.", exKo: "그 제안서는 모든 요구 사항을 충족한다." },
  { phrase: "attend a conference", ko: "학회·회의에 참석하다", ex: "Three managers will attend the conference in Busan.", exKo: "세 명의 매니저가 부산 학회에 참석할 것이다." },
  { phrase: "provide information", ko: "정보를 제공하다", ex: "The website provides information about our services.", exKo: "그 웹사이트는 우리 서비스에 대한 정보를 제공한다." },
  { phrase: "solve a problem", ko: "문제를 해결하다", ex: "The team solved the problem within an hour.", exKo: "그 팀은 한 시간 안에 문제를 해결했다." },
  { phrase: "reduce costs", ko: "비용을 줄이다", ex: "We must reduce costs to stay competitive.", exKo: "경쟁력을 유지하려면 비용을 줄여야 한다." },
  { phrase: "approve a request", ko: "요청을 승인하다", ex: "The supervisor approved her request for leave.", exKo: "관리자가 그녀의 휴가 요청을 승인했다." },
  { phrase: "sign a contract", ko: "계약서에 서명하다", ex: "Both parties signed the contract yesterday.", exKo: "양측은 어제 계약서에 서명했다." },
  { phrase: "gain a competitive advantage", ko: "경쟁 우위를 확보하다", ex: "New technology helped us gain a competitive advantage.", exKo: "신기술이 경쟁 우위를 확보하는 데 도움이 되었다." },
  { phrase: "make an appointment", ko: "예약하다", ex: "I would like to make an appointment for next week.", exKo: "다음 주로 예약하고 싶습니다." }
];

var CONTEXT_VOCAB = [
  { passage: "The manager asked the team to <b>expedite</b> the delivery because the client had moved the deadline forward.", q: "밑줄 친 expedite와 의미가 가장 가까운 것은?", a: "speed up", opts: ["speed up", "put off", "cancel", "review"], ko: "매니저는 고객이 마감을 앞당겼기 때문에 팀에 배송을 신속히 처리하라고 요청했다.", why: "expedite = 신속히 처리하다 ≈ speed up" },
  { passage: "All employees must <b>comply with</b> the safety regulations at all times.", q: "comply with의 의미는?", a: "준수하다", opts: ["준수하다", "무시하다", "개정하다", "질문하다"], ko: "모든 직원은 항상 안전 규정을 준수해야 한다.", why: "comply with = (규정을) 준수하다" },
  { passage: "The company decided to <b>outsource</b> its customer service to a partner firm.", q: "outsource의 의미는?", a: "외주를 주다", opts: ["외주를 주다", "직접 운영하다", "축소하다", "합병하다"], ko: "그 회사는 고객 서비스를 협력사에 외주 주기로 했다.", why: "outsource = 외부 업체에 위탁하다" },
  { passage: "Please <b>verify</b> the account details before processing the payment.", q: "verify의 의미는?", a: "확인하다", opts: ["확인하다", "변경하다", "지연하다", "거절하다"], ko: "결제를 처리하기 전에 계좌 정보를 확인해 주세요.", why: "verify = 사실 여부를 확인하다" },
  { passage: "The new policy is <b>subject to</b> approval by the board.", q: "subject to의 의미는?", a: "~의 적용을 받는", opts: ["~의 적용을 받는", "~와 무관한", "~를 대신하는", "~에 반대하는"], ko: "새 정책은 이사회의 승인을 받아야 한다.", why: "be subject to = ~의 적용·승인을 받아야 하는" },
  { passage: "Sales figures <b>fluctuate</b> depending on the season.", q: "fluctuate의 의미는?", a: "변동하다", opts: ["변동하다", "급증하다", "고정되다", "급감하다"], ko: "매출 수치는 계절에 따라 변동한다.", why: "fluctuate = 오르내리며 변동하다" },
  { passage: "The supervisor will <b>oversee</b> the renovation project.", q: "oversee의 의미는?", a: "감독하다", opts: ["감독하다", "취소하다", "참여하다", "지연시키다"], ko: "그 관리자가 리모델링 프로젝트를 감독할 것이다.", why: "oversee = 감독·관리하다" },
  { passage: "Employees are <b>eligible for</b> a discount on company products.", q: "eligible for의 의미는?", a: "~을 받을 자격이 있는", opts: ["~을 받을 자격이 있는", "~을 피하는", "~에 익숙한", "~을 제공하는"], ko: "직원들은 회사 제품 할인을 받을 자격이 있다.", why: "be eligible for = 자격이 있다" },
  { passage: "The report <b>highlights</b> the need for better training.", q: "highlight의 의미는?", a: "강조하다", opts: ["강조하다", "숨기다", "반복하다", "측정하다"], ko: "그 보고서는 더 나은 교육의 필요성을 강조한다.", why: "highlight = 두드러지게 강조하다" },
  { passage: "We should <b>take into account</b> the shipping costs.", q: "take into account의 의미는?", a: "고려하다", opts: ["고려하다", "무시하다", "계산하다", "축소하다"], ko: "우리는 배송 비용을 고려해야 한다.", why: "take into account = 고려하다" }
];

var LC_TRAINING = [
  { tag: "Part 2 질의·응답", audio: "When does the meeting start?", a: "At three o'clock this afternoon.", opts: ["At three o'clock this afternoon.", "Yes, I met him yesterday.", "No, the room is on the left.", "It was a long meeting."], why: "When에는 시간으로 답합니다.", ko: "회의는 언제 시작하나요? — 오늘 오후 3시입니다." },
  { tag: "Part 2 질의·응답", audio: "Who is in charge of the marketing team?", a: "Ms. Kim, the new manager.", opts: ["Ms. Kim, the new manager.", "In the conference room.", "About two hours.", "Yes, I do."], why: "Who에는 사람으로 답합니다.", ko: "마케팅 팀은 누가 담당하나요? — 새 매니저인 김 씨입니다." },
  { tag: "Part 2 질의·응답", audio: "Where can I find the employee handbook?", a: "On the company intranet.", opts: ["On the company intranet.", "Yes, it is new.", "Every Monday.", "Mr. Park will attend."], why: "Where에는 장소로 답합니다.", ko: "직원 안내서는 어디서 볼 수 있나요? — 사내 인트라넷에서요." },
  { tag: "Part 2 질의·응답", audio: "Why was the shipment delayed?", a: "Because of the heavy snow.", opts: ["Because of the heavy snow.", "It leaves at noon.", "Yes, it was delivered.", "About fifty boxes."], why: "Why에는 이유로 답합니다.", ko: "배송이 왜 지연됐나요? — 폭설 때문입니다." },
  { tag: "Part 2 질의·응답", audio: "How long will the maintenance take?", a: "About two hours.", opts: ["About two hours.", "At the front desk.", "Yes, please.", "Mr. Lee did it."], why: "How long에는 기간으로 답합니다.", ko: "정비에 얼마나 걸리나요? — 두 시간 정도입니다." },
  { tag: "Part 2 질의·응답", audio: "Would you like to join the workshop?", a: "I'd love to, but I have a deadline.", opts: ["I'd love to, but I have a deadline.", "It is on the second floor.", "Yes, she works here.", "Last Tuesday."], why: "제안에는 수락·거절 의사로 답합니다.", ko: "워크숍에 참여하시겠어요? — 그러고 싶지만 마감이 있어요." },
  { tag: "숫자·시간 함정", audio: "The flight departs at a quarter to nine.", a: "8:45", opts: ["8:45", "9:15", "9:45", "8:15"], why: "a quarter to nine = 9시까지 15분 남은 시각 = 8:45", ko: "비행기는 8시 45분에 출발한다." },
  { tag: "숫자·시간 함정", audio: "The invoice is due in fifteen days.", a: "15일 후", opts: ["15일 후", "5일 후", "50일 후", "2주 전"], why: "in fifteen days = 15일 후", ko: "청구서는 15일 후가 기한이다." },
  { tag: "숫자·시간 함정", audio: "Please submit the form by the 30th of next month.", a: "다음 달 30일", opts: ["다음 달 30일", "이번 달 13일", "다음 달 3일", "이번 달 30일"], why: "the 30th of next month = 다음 달 30일", ko: "다음 달 30일까지 서식을 제출해 주세요." },
  { tag: "숫자·시간 함정", audio: "The discount is thirteen percent off the original price.", a: "13%", opts: ["13%", "30%", "3%", "33%"], why: "thirteen(13)과 thirty(30)은 발음이 다릅니다.", ko: "정가에서 13% 할인됩니다." },
  { tag: "숫자·시간 함정", audio: "The conference runs from Tuesday to Thursday.", a: "화요일~목요일", opts: ["화요일~목요일", "목요일~화요일", "화요일~수요일", "수요일~금요일"], why: "from A to B = A부터 B까지", ko: "회의는 화요일부터 목요일까지 열린다." },
  { tag: "숫자·시간 함정", audio: "Our office is on the fourteenth floor.", a: "14층", opts: ["14층", "4층", "40층", "15층"], why: "fourteenth = 14번째", ko: "우리 사무실은 14층에 있다." },
  { tag: "Part 2 질의·응답", audio: "How often do you visit the branch office?", a: "Twice a month.", opts: ["Twice a month.", "For two hours.", "In the main lobby.", "Yes, I visited."], why: "How often에는 빈도를 나타내는 표현으로 답합니다.", ko: "지사에 얼마나 자주 가나요? — 한 달에 두 번이요." },
  { tag: "Part 2 질의·응답", audio: "Could you send me the invoice again?", a: "Sure, I will email it right away.", opts: ["Sure, I will email it right away.", "It was about two hundred dollars.", "Yes, the office is closed.", "I met him last week."], why: "요청에는 수락·행동 약속으로 답합니다.", ko: "청구서를 다시 보내 주시겠어요? — 네, 바로 이메일로 보내 드리겠습니다." },
  { tag: "Part 2 질의·응답", audio: "Should we take a taxi or the subway?", a: "Let's take the subway to save time.", opts: ["Let's take the subway to save time.", "Yes, I took it yesterday.", "It is on the third floor.", "About twenty minutes ago."], why: "A or B 선택 의문문에는 둘 중 하나를 고르는 답이 자연스럽습니다.", ko: "택시를 탈까요, 지하철을 탈까요? — 시간을 아끼려면 지하철을 타죠." },
  { tag: "숫자·시간 함정", audio: "The total comes to three hundred fifty dollars.", a: "$350", opts: ["$350", "$315", "$3,150", "$530"], why: "three hundred fifty = 350입니다.", ko: "합계는 350달러입니다." },
  { tag: "숫자·시간 함정", audio: "Please dial extension two oh four.", a: "204", opts: ["204", "244", "214", "240"], why: "내선 번호는 숫자를 하나씩 읽습니다: two-oh-four = 204", ko: "내선 번호 204번을 눌러 주세요." },
  { tag: "숫자·시간 함정", audio: "The order number is double seven four three.", a: "7743", opts: ["7743", "7473", "7734", "7474"], why: "double seven = 77, 뒤에 four three = 43 → 7743", ko: "주문 번호는 7743입니다." }
];

var WORD_FAMILIES = [
  { root: "성공", forms: ["success", "succeed", "successful", "successfully"], ex: "The launch was highly successful." },
  { root: "결정", forms: ["decision", "decide", "decisive", "decisively"], ex: "She made a decisive move to cut costs." },
  { root: "경쟁", forms: ["competition", "compete", "competitive", "competitively"], ex: "We offer competitive prices." },
  { root: "생산", forms: ["production", "produce", "productive", "productively"], ex: "The new system made the team more productive." },
  { root: "혁신", forms: ["innovation", "innovate", "innovative", "innovatively"], ex: "They introduced an innovative design." },
  { root: "정확", forms: ["accuracy", "accurate", "accurately"], ex: "Please record the figures accurately." },
  { root: "다양", forms: ["variety", "vary", "various", "variously"], ex: "We received various suggestions." },
  { root: "지원", forms: ["application", "apply", "applicant", "applicable"], ex: "Please submit your application by Friday." },
  { root: "의사소통", forms: ["communication", "communicate", "communicative", "communicatively"], ex: "Good communication skills are essential for teamwork." },
  { root: "투자", forms: ["investment", "invest", "investor", "investing"], ex: "The company made a large investment in new equipment." },
  { root: "평가", forms: ["evaluation", "evaluate", "evaluator", "evaluative"], ex: "Managers evaluate employee performance twice a year." },
  { root: "신뢰", forms: ["reliance", "rely", "reliable", "reliably"], ex: "Our customers rely on fast delivery." }
];

var WF_QUESTIONS = [
  { prompt: "The team completed the project ＿＿＿＿.", a: "successfully", opts: ["success", "succeed", "successful", "successfully"], why: "동사 completed를 수식하므로 부사 successfully", ex: "The team completed the project successfully.", exKo: "그 팀은 프로젝트를 성공적으로 완료했다." },
  { prompt: "The board will ＿＿＿＿ on the merger tomorrow.", a: "decide", opts: ["decision", "decide", "decisive", "decisively"], why: "조동사 will 뒤에는 동사원형 decide", ex: "The board will decide on the merger tomorrow.", exKo: "이사회는 내일 합병을 결정할 것이다." },
  { prompt: "The market is highly ＿＿＿＿.", a: "competitive", opts: ["competition", "compete", "competitive", "competitively"], why: "be동사 뒤 보어 자리에는 형용사", ex: "The market is highly competitive.", exKo: "그 시장은 경쟁이 매우 치열하다." },
  { prompt: "The factory increased ＿＿＿＿ last quarter.", a: "production", opts: ["production", "produce", "productive", "productively"], why: "타동사의 목적어 자리에는 명사 production", ex: "The factory increased production last quarter.", exKo: "그 공장은 지난 분기에 생산량을 늘렸다." },
  { prompt: "The company is known for its ＿＿＿＿ products.", a: "innovative", opts: ["innovation", "innovate", "innovative", "innovatively"], why: "명사 products를 수식하는 형용사", ex: "The company is known for its innovative products.", exKo: "그 회사는 혁신적인 제품으로 유명하다." },
  { prompt: "Please record the figures ＿＿＿＿.", a: "accurately", opts: ["accuracy", "accurate", "accurately", "accurateness"], why: "동사 record를 수식하는 부사", ex: "Please record the figures accurately.", exKo: "수치를 정확하게 기록해 주세요." },
  { prompt: "We received ＿＿＿＿ suggestions from customers.", a: "various", opts: ["variety", "vary", "various", "variously"], why: "명사 suggestions를 수식하는 형용사", ex: "We received various suggestions from customers.", exKo: "우리는 고객들로부터 다양한 제안을 받았다." },
  { prompt: "Please submit your ＿＿＿＿ by Friday.", a: "application", opts: ["application", "apply", "applicant", "applicable"], why: "소유격 your 뒤에는 명사 application", ex: "Please submit your application by Friday.", exKo: "금요일까지 지원서를 제출해 주세요." },
  { prompt: "The report provides ＿＿＿＿ data on sales.", a: "accurate", opts: ["accuracy", "accurate", "accurately", "accurateness"], why: "명사 data를 수식하는 형용사", ex: "The report provides accurate data on sales.", exKo: "그 보고서는 정확한 매출 데이터를 제공한다." },
  { prompt: "Our team will ＿＿＿＿ in the global market.", a: "compete", opts: ["competition", "compete", "competitive", "competitively"], why: "조동사 will 뒤에는 동사원형", ex: "Our team will compete in the global market.", exKo: "우리 팀은 글로벌 시장에서 경쟁할 것이다." },
  { prompt: "Good ＿＿＿＿ skills are essential for teamwork.", a: "communication", opts: ["communicate", "communication", "communicative", "communicatively"], why: "형용사 Good의 수식을 받는 명사 자리", ex: "Good communication skills are essential for teamwork.", exKo: "좋은 의사소통 능력은 팀워크에 필수적이다." },
  { prompt: "We ＿＿＿＿ with our overseas partners every week.", a: "communicate", opts: ["communicate", "communication", "communicative", "communicatively"], why: "주어 We 뒤에는 동사원형(현재)", ex: "We communicate with our overseas partners every week.", exKo: "우리는 매주 해외 파트너와 소통한다." },
  { prompt: "The board approved a large ＿＿＿＿ in renewable energy.", a: "investment", opts: ["invest", "investment", "investor", "investing"], why: "형용사 large 뒤에는 명사 investment", ex: "The board approved a large investment in renewable energy.", exKo: "이사회는 재생 에너지에 대한 대규모 투자를 승인했다." },
  { prompt: "Managers will ＿＿＿＿ each employee's performance twice a year.", a: "evaluate", opts: ["evaluate", "evaluation", "evaluator", "evaluative"], why: "조동사 will 뒤에는 동사원형", ex: "Managers will evaluate each employee's performance twice a year.", exKo: "관리자는 매년 두 번 각 직원의 성과를 평가할 것이다." },
  { prompt: "Our customers ＿＿＿＿ on fast delivery and clear communication.", a: "rely", opts: ["rely", "reliance", "reliable", "reliably"], why: "복수 주어 뒤 현재시제 동사원형 rely", ex: "Our customers rely on fast delivery and clear communication.", exKo: "우리 고객들은 빠른 배송과 명확한 소통에 의존한다." },
  { prompt: "The equipment is ＿＿＿＿ and rarely breaks down.", a: "reliable", opts: ["rely", "reliance", "reliable", "reliably"], why: "be동사 뒤 보어 자리에는 형용사", ex: "The equipment is reliable and rarely breaks down.", exKo: "그 장비는 믿을 만하고 좀처럼 고장 나지 않는다." }
];

var MINIMAL_PAIRS = [
  { a: "ship", b: "sheep", aKo: "배", bKo: "양", tip: "/ɪ/ 짧게 vs /iː/ 길게" },
  { a: "work", b: "walk", aKo: "일하다", bKo: "걷다", tip: "/ɜːr/ vs /ɔː/ — 혀 위치가 달라요" },
  { a: "live", b: "leave", aKo: "살다", bKo: "떠나다", tip: "/ɪ/ vs /iː/ 소리 길이" },
  { a: "full", b: "fool", aKo: "가득한", bKo: "바보", tip: "/ʊ/ 짧게 vs /uː/ 길게" },
  { a: "cut", b: "cat", aKo: "자르다", bKo: "고양이", tip: "/ʌ/ vs /æ/ 입 벌림 차이" },
  { a: "pen", b: "pan", aKo: "펜", bKo: "냄비", tip: "/e/ vs /æ/" },
  { a: "right", b: "light", aKo: "오른쪽", bKo: "빛", tip: "/r/ vs /l/ 첫소리" },
  { a: "glass", b: "grass", aKo: "유리", bKo: "잔디", tip: "/l/ vs /r/ 두 번째 소리" },
  { a: "dessert", b: "desert", aKo: "디저트", bKo: "사막", tip: "강세 위치: de-SSERT vs DE-sert" },
  { a: "affect", b: "effect", aKo: "영향을 주다", bKo: "효과", tip: "첫 모음 /ə/ vs /ɪ/ — 뜻이 완전히 다릅니다" },
  { a: "hat", b: "hot", aKo: "모자", bKo: "뜨거운", tip: "/æ/ vs /ɑː/ — 입을 얼마나 크게 벌리느냐의 차이" },
  { a: "think", b: "sink", aKo: "생각하다", bKo: "싱크대", tip: "/θ/ 혀를 이 사이에 vs /s/ 혀를 잇몸 뒤에" },
  { a: "vote", b: "boat", aKo: "투표하다", bKo: "보트", tip: "/v/ 아랫입술 진동 vs /b/ 입술을 다물고 터뜨리기" },
  { a: "staff", b: "stuff", aKo: "직원", bKo: "물건", tip: "/æ/ vs /ʌ/ — 시험에 자주 나오는 구분" },
  { a: "suit", b: "suite", aKo: "정장", bKo: "스위트룸", tip: "suit는 /suːt/, suite는 /swiːt/로 발음이 다릅니다" },
  { a: "quiet", b: "quite", aKo: "조용한", bKo: "꽤", tip: "/ˈkwaɪət/ 2음절 vs /kwaɪt/ 1음절" },
  { a: "lose", b: "loose", aKo: "잃다", bKo: "느슨한", tip: "/luːz/ 유성음 vs /luːs/ 무성음 — 끝소리가 달라요" },
  { a: "expect", b: "except", aKo: "기대하다", bKo: "~을 제외하고", tip: "첫 모음 /ɪ/ vs /e/ — 철자보다 소리를 기억하세요" },
  { a: "contact", b: "contract", aKo: "연락하다", bKo: "계약", tip: "강세는 앞, 가운데 소리 /tækt/ vs /trækt/" },
  { a: "price", b: "prize", aKo: "가격", bKo: "상", tip: "마지막 소리 /s/ vs /z/" }
];

var MNEMONICS = [
  { word: "benefit", root: "bene(좋은) + fit", tip: "좋은(bene) 것이 나에게 맞다(fit) → 혜택", ex: "Health insurance is one of the job benefits." },
  { word: "predict", root: "pre(미리) + dict(말하다)", tip: "미리 말하다 → 예측하다", ex: "Analysts predict strong demand this year." },
  { word: "inspect", root: "in(안) + spect(보다)", tip: "안을 들여다보다 → 점검하다", ex: "The equipment is inspected every month." },
  { word: "transport", root: "trans(가로질러) + port(나르다)", tip: "건너 나르다 → 운송하다", ex: "We transport goods by sea." },
  { word: "refund", root: "re(다시) + fund(돈)", tip: "돈을 다시 돌려주다 → 환불", ex: "We can give you a full refund." },
  { word: "proceed", root: "pro(앞으로) + ceed(가다)", tip: "앞으로 가다 → 진행하다", ex: "We will proceed with the plan as scheduled." },
  { word: "maintain", root: "main(손) + tain(잡다)", tip: "손에 쥐고 있다 → 유지하다", ex: "We must maintain high quality standards." },
  { word: "exclude", root: "ex(밖으로) + clude(닫다)", tip: "밖으로 닫다 → 제외하다", ex: "The price excludes delivery fees." },
  { word: "conference", root: "con(함께) + fer(나르다)", tip: "함께 모이다 → 회의·학회", ex: "The conference was held in Seoul." },
  { word: "postpone", root: "post(뒤) + pone(놓다)", tip: "뒤로 놓다 → 연기하다", ex: "The meeting was postponed until Friday." },
  { word: "substitute", root: "sub(대신) + stitute(세우다)", tip: "대신 세우다 → 대체하다", ex: "You can substitute olive oil for butter." },
  { word: "collaborate", root: "co(함께) + labor(일하다)", tip: "함께 일하다 → 협업하다", ex: "Our teams collaborate on every project." },
  { word: "increase", root: "in(안으로) + crease(자라다)", tip: "안으로 자라나다 → 증가하다", ex: "Sales increased by ten percent last quarter." },
  { word: "inspire", root: "in(안에) + spire(숨쉬다)", tip: "안에 숨을 불어넣다 → 고무하다", ex: "Her speech inspired the whole team." },
  { word: "influence", root: "in(안으로) + flu(흐르다)", tip: "안으로 흘러들다 → 영향을 미치다", ex: "The campaign influenced customer choices." },
  { word: "contract", root: "con(함께) + tract(끌다)", tip: "함께 끌어당겨 묶다 → 계약", ex: "Both parties signed the contract yesterday." },
  { word: "attract", root: "at(향해) + tract(끌다)", tip: "향해 끌어당기다 → 끌어모으다", ex: "The sale attracted many new customers." },
  { word: "expand", root: "ex(밖으로) + pand(펼치다)", tip: "밖으로 펼치다 → 확장하다", ex: "The company plans to expand into Asia." },
  { word: "manufacture", root: "manu(손) + fact(만들다)", tip: "손으로 만들다 → 제조하다", ex: "The parts are manufactured in Vietnam." },
  { word: "revenue", root: "re(다시) + ven(오다)", tip: "다시 들어오는 것 → 수익", ex: "Annual revenue grew by fifteen percent." }
];

var BIZ_TEMPLATES = [
  { cat: "일정 변경", ko: "회의 일정 변경 안내", lines: ["I am writing to inform you that the meeting has been rescheduled to Friday at 2 p.m.", "Please let me know if the new time does not work for you."] },
  { cat: "회의 요청", ko: "회의 요청", lines: ["Would you be available for a brief meeting sometime this week?", "I would like to discuss the upcoming project schedule with you."] },
  { cat: "확인 요청", ko: "자료 확인 요청", lines: ["Could you please confirm that you have received the attached documents?", "Please review the draft and share your feedback by Thursday."] },
  { cat: "사과", ko: "답변 지연 사과", lines: ["I apologize for the delay in responding to your email.", "We will make sure to complete the task by the end of this week."] },
  { cat: "감사", ko: "협조 감사", lines: ["Thank you for your prompt response and continued support.", "I really appreciate your help with this matter."] },
  { cat: "제품 문의", ko: "제품 가격 문의", lines: ["I am writing to inquire about the availability of the new model.", "Could you send us a price quote for bulk orders?"] },
  { cat: "사내 안내", ko: "휴무 안내", lines: ["This is a reminder that the office will be closed on Monday for maintenance.", "Please back up your files before leaving on Friday."] },
  { cat: "후속 확인", ko: "계약 후속 확인", lines: ["I am following up on our conversation last week regarding the contract.", "Please let me know if there is anything else you need from us."] },
  { cat: "불만 대응", ko: "주문 오류 사과", lines: ["We sincerely apologize for the error in your recent order.", "A corrected shipment will be sent today at no additional charge."] },
  { cat: "회의 후속", ko: "회의 요약 공유", lines: ["Thank you for attending today's meeting. Here is a brief summary of the key decisions.", "Please let me know if we missed anything important."] },
  { cat: "납품 지연", ko: "납품 지연 안내", lines: ["We regret to inform you that the delivery will be delayed by three days due to a supplier issue.", "We will notify you as soon as the items are shipped."] }
];

var DIALOGUES = [
  {
    title: "사무실 일정 조율", theme: "📋 Office Schedule",
    lines: [
      ["A", "Good morning. Did you confirm the meeting with Mr. Lee?", "Good morning. Did you confirm the meeting with Mr. Lee?"],
      ["B", "Not yet. I will ＿＿＿＿ it right away.", "Not yet. I will confirm it right away."],
      ["A", "Please also send him the updated agenda.", "Please also send him the updated agenda."],
      ["B", "Sure. I'll email it before the meeting.", "Sure. I'll email it before the meeting."]
    ],
    quiz: [
      { q: "빈칸에 들어갈 단어는?", a: "confirm", opts: ["confirm", "cancel", "postpone", "attend"] },
      { q: "'updated agenda'의 의미로 알맞은 것은?", a: "안건", opts: ["안건", "영수증", "보증서", "세금"] }
    ]
  },
  {
    title: "제품 환불 상담", theme: "🙋 Customer Service",
    lines: [
      ["W", "I'd like to return this laptop. It stopped working.", "I'd like to return this laptop. It stopped working."],
      ["M", "I'm sorry to hear that. Do you have the ＿＿＿＿?", "I'm sorry to hear that. Do you have the receipt?"],
      ["W", "Yes, here it is. I bought it last week.", "Yes, here it is. I bought it last week."],
      ["M", "We can give you a full ＿＿＿＿.", "We can give you a full refund."]
    ],
    quiz: [
      { q: "빈칸에 들어갈 단어는?", a: "receipt", opts: ["receipt", "invoice", "warranty", "coupon"] },
      { q: "'refund'의 의미로 알맞은 것은?", a: "환불", opts: ["환불", "할인", "배송", "예약"] }
    ]
  },
  {
    title: "출장 항공권 예약", theme: "✈️ Business Trip",
    lines: [
      ["A", "I need to book a flight to Chicago next Monday.", "I need to book a flight to Chicago next Monday."],
      ["B", "Would you prefer a morning or afternoon ＿＿＿＿?", "Would you prefer a morning or afternoon departure?"],
      ["A", "Morning, please. And a hotel near the convention center.", "Morning, please. And a hotel near the convention center."],
      ["B", "I'll make the ＿＿＿＿ and email you the details.", "I'll make the reservation and email you the details."]
    ],
    quiz: [
      { q: "빈칸에 들어갈 단어는?", a: "departure", opts: ["departure", "arrival", "luggage", "passport"] },
      { q: "'reservation'의 의미로 알맞은 것은?", a: "예약", opts: ["예약", "결제", "취소", "연기"] }
    ]
  },
  {
    title: "예산 회의", theme: "💰 Budget Meeting",
    lines: [
      ["W", "Did everyone receive the financial ＿＿＿＿?", "Did everyone receive the financial report?"],
      ["M", "Yes, but we need to discuss the budget cuts.", "Yes, but we need to discuss the budget cuts."],
      ["W", "Let's start with the marketing expenses then.", "Let's start with the marketing expenses then."],
      ["M", "Good idea. I'll ＿＿＿＿ the numbers on the screen.", "Good idea. I'll display the numbers on the screen."]
    ],
    quiz: [
      { q: "빈칸에 들어갈 단어는?", a: "report", opts: ["report", "invoice", "agenda", "receipt"] },
      { q: "'budget cuts'의 의미로 알맞은 것은?", a: "예산 삭감", opts: ["예산 삭감", "예산 증액", "급여 인상", "투자 유치"] }
    ]
  },
  {
    title: "매장 상담", theme: "🛍️ Shopping",
    lines: [
      ["C", "Is this sweater available in a larger size?", "Is this sweater available in a larger size?"],
      ["S", "Let me check our ＿＿＿＿ for you.", "Let me check our inventory for you."],
      ["C", "Thanks. Also, is there a discount on this item?", "Thanks. Also, is there a discount on this item?"],
      ["S", "Yes, it's 20% off until the end of the ＿＿＿＿.", "Yes, it's 20% off until the end of the week."]
    ],
    quiz: [
      { q: "빈칸에 들어갈 단어는?", a: "inventory", opts: ["inventory", "receipt", "warranty", "payment"] },
      { q: "이 대화가 일어나는 장소로 알맞은 것은?", a: "매장", opts: ["매장", "공항", "병원", "은행"] }
    ]
  },
  {
    title: "병원 방문", theme: "🏥 Health",
    lines: [
      ["P", "I've had a headache since this morning.", "I've had a headache since this morning."],
      ["D", "Have you been under a lot of ＿＿＿＿ lately?", "Have you been under a lot of stress lately?"],
      ["P", "Yes, I have a big presentation tomorrow.", "Yes, I have a big presentation tomorrow."],
      ["D", "I recommend getting enough ＿＿＿＿ tonight.", "I recommend getting enough rest tonight."]
    ],
    quiz: [
      { q: "빈칸에 들어갈 단어는?", a: "stress", opts: ["stress", "medicine", "diet", "exercise"] },
      { q: "의사의 조언으로 알맞은 것은?", a: "충분히 쉬기", opts: ["충분히 쉬기", "운동 시작하기", "약 두 배 복용", "회의 연기하기"] }
    ]
  },
  {
    title: "배송 지연 문의", theme: "🚚 Logistics",
    lines: [
      ["C", "I ordered a printer last week, but it has not arrived yet.", "I ordered a printer last week, but it has not arrived yet."],
      ["S", "I apologize for the ＿＿＿＿. Let me check the tracking number.", "I apologize for the delay. Let me check the tracking number."],
      ["C", "The order was supposed to arrive on Monday.", "The order was supposed to arrive on Monday."],
      ["S", "I see the issue. We will ship a ＿＿＿＿ today at no extra cost.", "I see the issue. We will ship a replacement today at no extra cost."]
    ],
    quiz: [
      { q: "빈칸에 들어갈 단어는?", a: "delay", opts: ["delay", "discount", "receipt", "budget"] },
      { q: "'no extra cost'의 의미로 알맞은 것은?", a: "추가 비용 없음", opts: ["추가 비용 없음", "무료 반품", "즉시 환불", "할인 적용"] }
    ]
  },
  {
    title: "면접 일정 조정", theme: "🧑‍💼 Hiring",
    lines: [
      ["HR", "We would like to ＿＿＿＿ an interview for next Tuesday.", "We would like to schedule an interview for next Tuesday."],
      ["A", "Tuesday morning works for me. What time should I come in?", "Tuesday morning works for me. What time should I come in?"],
      ["HR", "How about ten o'clock? Please bring a copy of your ＿＿＿＿.", "How about ten o'clock? Please bring a copy of your resume."],
      ["A", "Sure. I will also prepare my portfolio.", "Sure. I will also prepare my portfolio."]
    ],
    quiz: [
      { q: "빈칸에 들어갈 단어는?", a: "resume", opts: ["resume", "receipt", "invoice", "agenda"] },
      { q: "면접 시간으로 제안된 것은?", a: "오전 10시", opts: ["오전 10시", "오후 2시", "오전 9시", "오후 4시"] }
    ]
  }
];

var PART_BANK = {
  "5": [
    { q: "The new policy will _____ improve customer satisfaction.", a: "significantly", opts: ["significant", "significantly", "significance", "signify"], why: "동사 improve를 수식하므로 부사 significantly가 정답입니다." },
    { q: "Each employee _____ required to complete the training.", a: "is", opts: ["are", "is", "be", "being"], why: "Each는 단수 취급하므로 단수 동사 is를 씁니다." },
    { q: "Please submit the application _____ Friday.", a: "by", opts: ["at", "by", "on", "for"], why: "by Friday는 금요일까지라는 마감 기한을 나타냅니다." },
    { q: "All visitors are required to _____ at the front desk before entering.", a: "register", opts: ["register", "registration", "registered", "registering"], why: "be required to 뒤에는 동사원형 register가 옵니다." },
    { q: "The new software is _____ easier to use than the previous version.", a: "far", opts: ["far", "more", "most", "very"], why: "비교급은 far·much·even으로 강조합니다." },
    { q: "The company is looking for a candidate _____ has experience in logistics.", a: "who", opts: ["who", "which", "whom", "whose"], why: "선행사 a candidate가 사람이고 뒤에 동사가 있으므로 주격 who입니다." },
    { q: "Please make sure that all documents are _____ before the meeting.", a: "prepared", opts: ["prepare", "preparing", "prepared", "preparation"], why: "documents가 준비되는 대상이므로 be + 과거분사(prepared)를 씁니다." },
    { q: "If the payment _____ by Friday, a late fee will be charged.", a: "is not received", opts: ["does not receive", "is not received", "will not receive", "has not received"], why: "주어 the payment는 받는 쪽이므로 수동태 is not received가 맞습니다." },
    { q: "_____ the heavy traffic, the team arrived on time.", a: "Despite", opts: ["Although", "Despite", "Because", "Unless"], why: "뒤에 명사구 the heavy traffic이 있으므로 전치사 despite를 씁니다." },
    { q: "The workshop is designed _____ new employees learn the system quickly.", a: "to help", opts: ["help", "to help", "helping", "helps"], why: "be designed to + 동사원형은 목적을 나타냅니다." },
    { q: "Ms. Park is the _____ of the three candidates for the manager position.", a: "most qualified", opts: ["qualified", "more qualified", "most qualified", "qualifying"], why: "the + 최상급 + of the three 구조입니다." },
    { q: "The annual report was completed _____ schedule despite the staff shortage.", a: "ahead of", opts: ["ahead of", "in front of", "previous to", "instead of"], why: "ahead of schedule = 예정보다 앞서." },
    { q: "The _____ instructions confused several new employees.", a: "confusing", opts: ["confuse", "confused", "confusing", "confusion"], why: "지침이 사람을 헷갈리게 하는 주체이므로 현재분사 confusing입니다." },
    { q: "The shipment was delayed; _____, the customer was notified immediately.", a: "therefore", opts: ["therefore", "however", "otherwise", "whereas"], why: "앞 내용의 결과를 나타내는 therefore가 맞습니다." },
    { q: "The board recommended that the policy _____ revised before July.", a: "be", opts: ["is", "be", "was", "being"], why: "recommend that + 주어 + 동사원형(be) 구조입니다." },
    { q: "If the company _____ more storage space, it would accept the order.", a: "had", opts: ["has", "had", "will have", "having"], why: "가정법 과거는 If + 과거형(had)을 씁니다." },
    { q: "Ms. Han had the assistant _____ the figures before the meeting.", a: "verify", opts: ["verify", "verifies", "verified", "verifying"], why: "사역동사 have + 목적어 + 동사원형 구조입니다." },
    { q: "The seminar is intended for employees _____ are new to the department.", a: "who", opts: ["who", "which", "whom", "whose"], why: "선행사 employees가 사람이고 뒤에 동사가 있으므로 주격 who입니다." },
    { q: "Please note that the office will be closed _____ the holiday weekend.", a: "during", opts: ["during", "since", "by", "until"], why: "특정 기간 동안을 나타내는 전치사 during이 맞습니다." }
  ],
  "6": [
    { q: "The conference has been _____ until next month due to construction.", a: "postponed", opts: ["postponing", "postponed", "postpone", "postpones"], why: "conference가 연기되는 대상이므로 수동태 has been postponed가 자연스럽습니다." },
    { q: "The new brochure is designed to be both attractive and _____.", a: "informative", opts: ["inform", "information", "informative", "informed"], why: "both A and B 병렬 구조이므로 attractive와 같은 형용사 informative가 필요합니다." },
    { q: "_____ the heavy rain, the outdoor event continued as planned.", a: "Despite", opts: ["Despite", "Although", "Because", "Therefore"], why: "뒤에 명사구 the heavy rain이 있으므로 despite가 정답입니다." },
    { q: "Due to the increased demand, we recommend that customers _____ their orders early.", a: "place", opts: ["place", "places", "placing", "placed"], why: "recommend that + 주어 + 동사원형 구조입니다." },
    { q: "The seminar will cover a wide _____ of topics, from budgeting to leadership.", a: "range", opts: ["range", "number", "amount", "piece"], why: "a wide range of = 다양한 범위의." },
    { q: "Please be advised that the elevator will be _____ for maintenance on Tuesday.", a: "temporarily closed", opts: ["temporarily closed", "temporary close", "temporary closing", "temporarily closing"], why: "be + 부사 + 과거분사(수동) 형태입니다." },
    { q: "Our customer service team is available 24 hours a day to _____ any questions.", a: "answer", opts: ["answer", "reply", "respond", "tell"], why: "answer a question이 올바른 연어입니다(reply/respond는 to가 필요)." },
    { q: "The revised schedule will take _____ on the first of next month.", a: "effect", opts: ["effect", "affect", "effective", "effectively"], why: "take effect = 시행되다." }
  ],
  "7": [
    { q: "공지문: The east entrance will be closed from 6 to 8 p.m. for maintenance. Visitors should use the west entrance.", a: "서쪽 입구를 이용해야 한다", opts: ["동쪽 입구를 이용해야 한다", "서쪽 입구를 이용해야 한다", "방문 시간이 변경된다", "정비가 취소된다"], why: "공지문은 동쪽 입구 폐쇄 시간 동안 서쪽 입구를 이용하라고 안내합니다." },
    { q: "이메일: Please send the revised invoice before noon so that our accounting team can process the payment today.", a: "수정된 청구서를 정오 전까지 보내기", opts: ["결제를 다음 주로 미루기", "수정된 청구서를 정오 전까지 보내기", "회계팀에 새 직원을 고용하기", "청구서를 폐기하기"], why: "before noon과 process the payment today가 핵심 단서입니다." },
    { q: "광고: Early-bird registration ends on May 10. Members receive an additional 15% discount.", a: "회원은 추가 할인을 받는다", opts: ["등록은 5월 10일에 시작된다", "회원은 추가 할인을 받는다", "비회원만 등록할 수 있다", "행사가 15일간 열린다"], why: "Members receive an additional 15% discount라고 명시되어 있습니다." },
    { q: "공지문: The fitness center will introduce new yoga classes starting October 1. Members can reserve a spot up to 48 hours in advance through the mobile app.", a: "수업 48시간 전부터 앱으로 예약할 수 있다", opts: ["수업 당일에만 예약할 수 있다", "수업 48시간 전부터 앱으로 예약할 수 있다", "전화로만 예약할 수 있다", "비회원도 예약할 수 있다"], why: "up to 48 hours in advance와 through the mobile app이 단서입니다." },
    { q: "이메일: Please note that the deadline for submitting expense reports has been moved from the 25th to the 20th of each month.", a: "경비 보고서 마감일이 20일로 앞당겨졌다", opts: ["경비 보고서가 폐지된다", "경비 보고서 마감일이 20일로 앞당겨졌다", "마감일이 25일로 늦춰진다", "보고서를 매주 제출해야 한다"], why: "moved from the 25th to the 20th = 25일에서 20일로 앞당김." },
    { q: "안내문: All employees must wear their ID badges at all times while on company premises. Visitors should sign in at the security desk and will be escorted by a staff member.", a: "경비 데스크에서 서명하고 직원의 안내를 받는다", opts: ["직접 건물을 돌아다닌다", "경비 데스크에서 서명하고 직원의 안내를 받는다", "출입증을 따로 구매한다", "방문은 허용되지 않는다"], why: "Visitors should sign in at the security desk and will be escorted가 단서입니다." },
    { q: "이메일: Please confirm your attendance by Thursday so that we can finalize the catering order for the workshop.", a: "목요일까지 참석 여부를 알려야 한다", opts: ["목요일까지 참석 여부를 알려야 한다", "케이터링 업체를 직접 고용한다", "워크숍을 취소한다", "금요일에 다시 연락한다"], why: "confirm your attendance by Thursday가 핵심 단서입니다." },
    { q: "광고: Members who renew before December 31 receive an additional three months at no cost.", a: "12월 31일 전에 갱신하면 3개월을 무료로 받는다", opts: ["12월 31일 전에 갱신하면 3개월을 무료로 받는다", "회원 가입이 중단된다", "갱신 수수료가 인상된다", "3년 약정을 맺어야 한다"], why: "an additional three months at no cost가 무료 3개월을 뜻합니다." },
    { q: "안내문: Passengers with oversized luggage should use the elevator on the west side of the lobby instead of the escalator.", a: "로비 서쪽 엘리베이터를 이용해야 한다", opts: ["로비 서쪽 엘리베이터를 이용해야 한다", "에스컬레이터를 두 번 이용한다", "짐을 미리 반납해야 한다", "로비에서 기다려야 한다"], why: "should use the elevator on the west side가 단서입니다." },
    { q: "공지문: The parking garage will be repainted from August 3 to August 6, so only the ground floor will remain open.", a: "8월 3일부터 6일까지 1층만 이용할 수 있다", opts: ["8월 3일부터 6일까지 1층만 이용할 수 있다", "주차장이 영구 폐쇄된다", "주차 요금이 인상된다", "지하 주차장만 운영한다"], why: "only the ground floor will remain open이 단서입니다." }
  ]
};

var RELATIONS = [
  ["increase", "증가하다", "rise · grow", "decrease · decline", "increase revenue / a significant increase"],
  ["purchase", "구매하다", "buy · acquire", "sell · return", "purchase equipment / make a purchase"],
  ["prompt", "신속한", "quick · immediate", "delayed · slow", "prompt response / prompt payment"],
  ["eligible", "자격이 있는", "qualified · entitled", "ineligible · disqualified", "eligible for a discount / eligible candidate"],
  ["maintain", "유지하다", "preserve · sustain", "damage · neglect", "maintain quality / maintain a balance"],
  ["require", "요구하다", "need · demand", "waive · exempt", "require approval / require attention"],
  ["available", "이용 가능한", "accessible · obtainable", "unavailable · occupied", "available online / available upon request"],
  ["efficient", "효율적인", "effective · productive", "inefficient · wasteful", "efficient system / energy-efficient"],
  ["revenue", "수익", "income · earnings", "expense · loss", "generate revenue / annual revenue"],
  ["submit", "제출하다", "hand in · provide", "withhold · withdraw", "submit an application / submit a report"],
  ["reduce", "줄이다", "decrease · cut", "increase · raise", "reduce costs / reduce risk"],
  ["postpone", "연기하다", "delay · put off", "advance · bring forward", "postpone a meeting / postpone the launch"],
  ["approve", "승인하다", "authorize · endorse", "reject · deny", "approve a proposal / approve the budget"],
  ["inform", "알리다", "notify · advise", "conceal · withhold", "inform customers / inform the staff of"],
  ["ensure", "보장하다", "guarantee · secure", "endanger · jeopardize", "ensure quality / ensure safety"],
  ["assist", "돕다", "help · aid", "hinder · obstruct", "assist customers / assist with the task"],
  ["significant", "상당한, 중요한", "substantial · considerable", "minor · trivial", "a significant increase / significant progress"],
  ["reluctant", "꺼리는", "unwilling · hesitant", "eager · willing", "reluctant to accept / reluctant to change"],
  ["mandatory", "의무적인", "compulsory · required", "optional · voluntary", "mandatory training / a mandatory meeting"],
  ["verify", "확인하다", "confirm · validate", "assume · overlook", "verify the details / verify an identity"],
  ["allocate", "할당하다", "assign · distribute", "withhold · retain", "allocate resources / allocate a budget"],
  ["retain", "보유하다", "keep · preserve", "release · discard", "retain staff / retain a copy"],
  ["waive", "면제하다", "forgive · drop", "impose · charge", "waive a fee / waive the penalty"],
  ["comply", "준수하다", "conform · adhere", "violate · breach", "comply with regulations / comply with a request"],
  ["sufficient", "충분한", "adequate · enough", "insufficient · inadequate", "sufficient funds / sufficient time"],
  ["tentative", "잠정적인", "provisional · preliminary", "final · confirmed", "a tentative schedule / a tentative agreement"]
];

var READING_MINI = [
  { title: "사내 공지", type: "공지", text: "The elevator in Building B will be unavailable this Friday morning. Employees attending the 10 a.m. workshop should use the stairs or the elevator in Building A.", q: "10시 워크숍 참석자는 무엇을 해야 하는가?", a: "다른 엘리베이터나 계단을 이용한다", opts: ["워크숍을 취소한다", "다른 엘리베이터나 계단을 이용한다", "빌딩 B에서 기다린다"] },
  { title: "고객 이메일", type: "이메일", text: "Thank you for contacting Greenway Travel. Your reservation has been confirmed for June 18. Please arrive at least 30 minutes before departure to collect your boarding pass.", q: "고객은 언제 도착해야 하는가?", a: "출발 30분 전", opts: ["예약일 다음 날", "출발 30분 전", "6월 18일 오후"] },
  { title: "제품 안내", type: "광고", text: "The FlexiDesk is now available in three colors. Orders placed before March 31 include free delivery and a two-year warranty. Visit our website for bulk-order pricing.", q: "3월 31일 전에 주문하면 어떤 혜택이 있는가?", a: "무료 배송과 2년 보증", opts: ["색상 추가", "무료 배송과 2년 보증", "대량 주문 가격만 제공"] },
  { title: "분기 리뷰 안내", type: "이메일", text: "The quarterly review meeting has been moved to Thursday at 2 p.m. in Conference Room B. Please bring the latest sales figures so that we can compare them with last quarter's results.", q: "참석자가 준비해야 할 것은?", a: "최신 매출 수치", opts: ["회의록 사본", "최신 매출 수치", "신분증", "노트북 충전기"] },
  { title: "지하철 운행 공지", type: "공지", text: "Line 3 will run on a modified schedule this weekend due to track maintenance. Trains will depart every 20 minutes instead of every 8 minutes. Please allow extra time for your trip.", q: "이번 주말 배차 간격은?", a: "20분", opts: ["8분", "20분", "30분", "10분"] },
  { title: "채용 공고", type: "공고", text: "We are hiring a full-time customer support specialist. Applicants must have at least two years of experience and be available to work on weekends. Send your resume to hr@greenway.com by June 30.", q: "지원 자격으로 옳은 것은?", a: "2년 이상의 경력", opts: ["2년 이상의 경력", "주말 근무 불가", "대졸 이상", "자격증 필수"] },
  { title: "배송 지연 안내", type: "이메일", text: "Dear customer, your order has been delayed because of heavy snow in the northern region. The new delivery date is January 8, and no additional shipping fee will be charged.", q: "배송이 지연된 이유는?", a: "북부 지역의 폭설", opts: ["북부 지역의 폭설", "주문 취소", "주소 오류", "결제 실패"] },
  { title: "신입 사원 안내", type: "공지", text: "The new-hire orientation will take place on September 2 in the main auditorium. Please bring a photo ID and arrive fifteen minutes early so that your badge can be issued.", q: "참석자가 준비해야 할 것은?", a: "사진이 있는 신분증", opts: ["사진이 있는 신분증", "업무용 노트북", "사전 과제", "회사 명함"] },
  { title: "구내식당 운영 변경", type: "공지", text: "Starting next Monday, the cafeteria will open at 11:30 a.m. and close at 2 p.m. because of the kitchen renovation. Vending machines on the third floor remain available all day.", q: "다음 주 월요일부터 식당 운영 시간은?", a: "오전 11시 30분부터 오후 2시까지", opts: ["오전 11시 30분부터 오후 2시까지", "오전 11시부터 오후 3시까지", "오전 9시부터 오후 5시까지", "하루 종일"] },
  { title: "신제품 출시 광고", type: "광고", text: "The UltraBook Pro is now available at all retail partners. Customers who register their product online within thirty days receive an extra year of warranty coverage.", q: "추가 보증을 받으려면 어떻게 해야 하는가?", a: "30일 안에 온라인으로 제품을 등록한다", opts: ["30일 안에 온라인으로 제품을 등록한다", "매장에서 현금으로 결제한다", "별도 보험에 가입한다", "제품 리뷰를 작성한다"] }
];

var DOUBLE_READING = [
  { title: "신제품 주문과 주문 확인", type: "이메일 + 주문서",
    passages: [
      { label: "지문 1 · 이메일", text: "Dear Mr. Alvarez, Thank you for your interest in our ergonomic chairs. Please find the quote for 40 units attached. Orders placed before April 15 qualify for a 12% discount and free assembly." },
      { label: "지문 2 · 주문 확인서", text: "Order No. 77120 | Item: ErgoFlex Chair | Quantity: 40 | Unit price: $180 | Requested delivery: April 22 | Assembly: not included | Discount applied: none" }
    ],
    qs: [
      { q: "할인을 받으려면 언제까지 주문해야 하는가?", a: "4월 15일 이전", opts: ["4월 15일 이전", "4월 22일 이전", "3월 15일 이전", "주문 즉시"], why: "Orders placed before April 15 qualify for a 12% discount" },
      { q: "주문 확인서에 따르면 배송 요청일은?", a: "4월 22일", opts: ["4월 15일", "4월 22일", "5월 22일", "4월 2일"], why: "Requested delivery: April 22" },
      { q: "두 지문을 종합할 때 이 주문에 대한 설명으로 옳은 것은?", a: "할인이 적용되지 않았다", opts: ["할인이 적용되지 않았다", "조립이 무료로 포함된다", "수량이 40개 미만이다", "배송이 4월 15일이다"], why: "주문서에 Discount applied: none으로 표시되어 있습니다." }
    ] },
  { title: "채용 공고와 지원 절차", type: "공고 + 안내문",
    passages: [
      { label: "지문 1 · 채용 공고", text: "Junior Accountant — Greenway Finance. Requirements: a bachelor's degree in accounting, at least one year of experience, and proficiency in Excel. Application deadline: May 30. Contact: jobs@greenway.com" },
      { label: "지문 2 · 지원 안내문", text: "All applicants must complete an online aptitude test before the interview. Test links are sent within three business days after the application deadline." }
    ],
    qs: [
      { q: "지원 요건으로 언급되지 않은 것은?", a: "회계 자격증", opts: ["회계학 학사 학위", "1년 이상 경력", "Excel 활용 능력", "회계 자격증"], why: "자격증은 공고에 언급되지 않았습니다." },
      { q: "적성 검사 링크는 언제 발송되는가?", a: "지원 마감 후 3영업일 이내", opts: ["지원 마감 후 3영업일 이내", "면접 당일", "지원서 제출 즉시", "채용 확정 후"], why: "within three business days after the application deadline" },
      { q: "지원 마감일은?", a: "5월 30일", opts: ["5월 30일", "6월 30일", "5월 3일", "3월 30일"], why: "Application deadline: May 30" }
    ] },
  { title: "연례 컨퍼런스 안내와 일정", type: "안내문 + 일정표",
    passages: [
      { label: "지문 1 · 행사 안내", text: "The Annual Sales Conference will be held at the Riverside Hotel on September 8. Registration opens at 8:30 a.m. All attendees must present a photo ID at the entrance. Lunch is provided." },
      { label: "지문 2 · 행사 일정표", text: "09:00 Opening Speech | 10:30 Workshop A (Marketing) and Workshop B (Finance) | 12:30 Lunch | 14:00 Panel Discussion | 16:00 Closing Remarks" }
    ],
    qs: [
      { q: "입장 시 필요한 것은?", a: "사진이 있는 신분증", opts: ["사진이 있는 신분증", "초대장", "등록 영수증", "회원 카드"], why: "must present a photo ID at the entrance" },
      { q: "12시 30분에 예정된 것은?", a: "점심 식사", opts: ["점심 식사", "패널 토론", "폐회", "기조 연설"], why: "12:30 Lunch" },
      { q: "10시 30분에 진행되는 것은?", a: "워크숍 A와 B", opts: ["워크숍 A와 B", "기조 연설", "패널 토론", "폐회식"], why: "10:30 Workshop A and Workshop B" }
    ] },
  { title: "주문 취소 요청과 취소 정책", type: "이메일 + 정책",
    passages: [
      { label: "지문 1 · 고객 이메일", text: "Hello, I would like to cancel order 5581 placed yesterday. The estimated delivery is next Monday, but I no longer need the item." },
      { label: "지문 2 · 취소 정책", text: "Cancellations made within 24 hours of purchase are fully refunded. After 24 hours, a 10% processing fee applies. Customized items cannot be canceled." }
    ],
    qs: [
      { q: "고객이 요청한 것은?", a: "주문 취소", opts: ["주문 취소", "배송지 변경", "환불 거부", "상품 교환"], why: "I would like to cancel order 5581" },
      { q: "구매 후 24시간 이내에 취소하면?", a: "전액 환불", opts: ["전액 환불", "10% 수수료 부과", "교환만 가능", "취소 불가"], why: "within 24 hours of purchase are fully refunded" },
      { q: "취소할 수 없는 품목은?", a: "맞춤 제작 품목", opts: ["맞춤 제작 품목", "할인 품목", "주말 주문 품목", "배송 중 품목"], why: "Customized items cannot be canceled." }
    ] }
];

var SPEAKING_PROMPTS = [
  ["Describe a useful office tool.", "convenient, improve"],
  ["What do you usually do before a meeting?", "agenda, prepare"],
  ["Explain how to handle a customer complaint.", "listen, solution"],
  ["What is one benefit of working in a team?", "cooperate, efficient"],
  ["Describe a product you would recommend.", "feature, reliable"],
  ["Describe your typical workday.", "routine, prioritize"],
  ["What do you do to stay organized?", "schedule, checklist"],
  ["Explain how to prepare for an important exam.", "review, practice"],
  ["Describe a time you solved a problem at work.", "solution, improve"],
  ["What are the advantages of online shopping?", "convenient, compare"]
];

var WRITING_PROMPTS = [
  ["회의 시간이 변경되었다고 동료에게 알리세요.", "Please note that the meeting time has been changed. I will send the updated agenda shortly."],
  ["고객의 문의에 답변하겠다고 정중히 안내하세요.", "Thank you for your inquiry. We will get back to you as soon as possible."],
  ["보고서 제출이 늦어질 수 있다고 알리세요.", "I am writing to let you know that the report may be delayed."],
  ["도움을 준 동료에게 감사하세요.", "Thank you for your help. I really appreciate your prompt response."],
  ["제품 배송 지연을 사과하세요.", "We sincerely apologize for the delay in shipping your order. A replacement will arrive by Friday."],
  ["회의 참석을 정중히 요청하세요.", "We would like to invite you to a brief meeting on Thursday to review the project plan."],
  ["제품 가격 견적을 문의하세요.", "Could you please send us a price quote for two hundred units?"],
  ["동료의 승진을 축하하세요.", "Congratulations on your promotion. We look forward to working with you in your new role."]
];

var SHADOWING_SENTENCES = [
  "Please confirm the meeting room before noon.",
  "We look forward to hearing from you soon.",
  "The updated report is available on the company website.",
  "Could you send me the revised schedule by Friday?",
  "Our customer service team will follow up shortly.",
  "Thank you for your patience during the delay.",
  "Please note that the office will be closed on Monday.",
  "We would like to remind you to submit your timesheet.",
  "The new policy takes effect at the beginning of next month.",
  "I appreciate your help with the presentation yesterday."
];
