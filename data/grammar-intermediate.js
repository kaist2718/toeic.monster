/* ============================================================================
 * 중급 영문법 (B1 ~ B2) — 12과
 * tools/build-pages.mjs 와 감사 도구가 window.GRAMMAR_BOOKS 를 읽습니다.
 * ========================================================================== */
window.GRAMMAR_BOOKS = window.GRAMMAR_BOOKS || [];

window.GRAMMAR_BOOKS.push({
  id: "intermediate",
  level: "중급",
  cefr: "B1 ~ B2",
  title: "중급 영문법",
  subtitle: "완료시제·수동태·관계사·준동사·가정법으로 문장을 확장하기",
  desc: "현재완료와 수동태, 관계사, 부정사와 동명사, 분사구문, 가정법까지 시험 문법의 주력 구간을 12과로 정리한 중급 영문법 교재입니다.",
  audience: "기초 문장은 쓸 수 있지만 시제와 준동사에서 자주 틀리는 학습자, TOEIC 600~800점 목표 학습자",
  goal: "시제와 태를 정확히 고르고, 관계사와 준동사로 한 문장을 길게 확장할 수 있다.",
  howto: [
    "형태 표를 보고 직접 문장을 한 개씩 만들어 봅니다.",
    "예문의 밑줄 친 구조가 왜 그 형태인지 소리 내어 설명해 봅니다.",
    "연습 문제에서 틀린 과는 해설의 판단 기준을 그대로 외웁니다."
  ],
  chapters: [
    {
      no: 1,
      title: "완료시제 3종",
      intro: "완료시제는 시험에 가장 많이 나오는 시제입니다. for·since·already·by the time 같은 단서를 먼저 찾고, 기준 시점이 현재인지 과거인지 미래인지 판단하면 형태가 정해집니다.",
      summary: "완료시제는 기준 시점보다 앞선 일을 나타냅니다. 기준이 현재면 현재완료, 과거면 과거완료, 미래면 미래완료입니다.",
      points: [
        {
          h: "현재완료 — have / has + p.p.",
          body: "과거에 시작한 일이 지금까지 이어지거나, 지금에 영향을 미칠 때 씁니다. 계속·경험·완료·결과의 네 가지 용법을 구분하면 문제가 빨리 풀립니다.",
          table: {
            head: ["용법", "함께 쓰는 표현", "예문"],
            rows: [
              ["계속", "for, since", "We have used this system for three years."],
              ["경험", "ever, never, before", "She has never missed a deadline."],
              ["완료", "just, already, yet", "The shipment has just arrived."],
              ["결과", "now, so far", "Sales have doubled so far this year."],
              ["횟수", "once, twice, several times", "I have met the director twice."]
            ]
          },
          note: "yesterday, last week 처럼 끝난 과거 시점을 가리키는 표현과는 함께 쓰지 않습니다."
        },
        {
          h: "현재완료와 과거시제의 구분",
          body: "현재완료는 지금과 이어져 있는 일, 과거시제는 끝난 시점의 일을 나타냅니다. 시간 표현이 단서가 됩니다.",
          table: {
            head: ["구분", "쓰는 때", "예문"],
            rows: [
              ["현재완료", "지금까지 이어짐", "She has worked here for five years."],
              ["과거시제", "끝난 시점", "She worked here in 2020."],
              ["현재완료", "횟수·경험", "He has visited the plant three times."],
              ["과거시제", "구체적 과거", "He visited the plant last Monday."]
            ]
          },
          note: "현재완료와 for 를 쓰면 지금도 이어지는 일, 과거시제와 for 를 쓰면 지금은 끝난 일로 읽힙니다."
        },
        {
          h: "과거완료 — had + p.p.",
          body: "과거의 어떤 시점보다 더 앞선 일을 나타냅니다. 두 사건의 선후를 분명히 할 때 씁니다.",
          table: {
            head: ["형식", "쓰임", "예문"],
            rows: [
              ["had + p.p.", "과거보다 앞선 일", "The team had finished the draft before the client called."],
              ["by the time + 과거", "그때까지 완료", "By the time we arrived, the store had closed."],
              ["after / before", "선후 관계", "She left after she had signed the contract."]
            ]
          },
          examples: [
            { en: "The team had finished the draft before the client called.", ko: "고객이 전화하기 전에 팀은 초안을 끝내 두었습니다." },
            { en: "He had worked at the branch for five years before he moved.", ko: "그는 옮기기 전에 지점에서 5년 동안 일했습니다." }
          ]
        },
        {
          h: "미래완료 — will have + p.p.",
          body: "미래의 어떤 시점까지 완료될 일을 말합니다. by the time, by next month와 함께 자주 씁니다.",
          examples: [
            { en: "By next March, we will have completed the renovation.", ko: "내년 3월이면 우리는 보수 공사를 끝냈을 것입니다." },
            { en: "The auditors will have reviewed the books by Friday.", ko: "감사관들은 금요일까지 장부를 검토해 두었을 것입니다." },
            { en: "By the time you receive this, we will have shipped the order.", ko: "이 편지를 받으실 때면 우리는 주문을 발송했을 것입니다." }
          ],
          note: "by 는 완료 기한, by the time 은 완료 시점을 나타냅니다."
        },
        {
          h: "완료진행형 — have been + -ing",
          body: "have been + -ing는 동작이 계속되고 있음을 강조합니다. 결과보다 진행 과정이 중요할 때 씁니다.",
          table: {
            head: ["시제", "형태", "예문"],
            rows: [
              ["현재완료진행", "have / has been + -ing", "I have been working on this proposal since Monday."],
              ["과거완료진행", "had been + -ing", "The system had been running smoothly until last week."],
              ["미래완료진행", "will have been + -ing", "By June, we will have been operating for ten years."]
            ]
          }
        },
        {
          h: "완료시제 한눈에 정리",
          body: "기준 시점에 따라 형태가 달라집니다. 표로 정리해 두면 빈칸 앞의 시간 표현만 보고 답을 고를 수 있습니다.",
          table: {
            head: ["기준", "형태", "단서 표현", "예문"],
            rows: [
              ["현재", "have / has + p.p.", "for, since, already, yet", "Sales have risen sharply."],
              ["과거", "had + p.p.", "before, after, by the time", "She had left before noon."],
              ["미래", "will have + p.p.", "by next, by the time", "We will have finished by May."],
              ["계속 진행", "have been + -ing", "for, since, all day", "He has been calling all morning."]
            ]
          }
        }
      ],
      mistakes: [
        "I have seen him yesterday. 처럼 끝난 시점과 현재완료를 함께 쓰는 실수 — 과거시제 saw 를 씁니다.",
        "since three months 처럼 기간에 since 를 쓰는 실수 — 기간은 for, 시작점은 since 입니다.",
        "과거완료 자리에 현재완료를 쓰는 실수 — 과거보다 앞선 일에는 had + p.p. 를 씁니다.",
        "3인칭 단수 주어에 have 를 쓰는 실수 — She have finished. 가 아니라 She has finished. 입니다.",
        "완료진행형을 상태동사에 쓰는 실수 — I have been knowing 이 아니라 I have known 입니다."
      ],
      practice: [
        { q: "Our company ____ in this market since 2011.", opts: ["operates", "operated", "has operated", "is operating"], a: "has operated", why: "since 2011 은 과거의 시작점이 지금까지 이어지는 경우이므로 현재완료를 씁니다." },
        { q: "By the time the guests arrived, the staff ____ everything.", opts: ["prepare", "prepared", "had prepared", "have prepared"], a: "had prepared", why: "손님이 도착한 시점보다 준비가 더 앞서므로 과거완료를 씁니다." },
        { q: "The contractor ____ the wiring for two weeks before the inspection.", opts: ["has been replacing", "had been replacing", "replaces", "replace"], a: "had been replacing", why: "과거의 한 시점까지 계속된 진행을 강조하므로 과거완료진행형을 씁니다." },
        { q: "The manager ____ the report yet, so please wait a little longer.", opts: ["did not finish", "has not finished", "does not finish", "is not finishing"], a: "has not finished", why: "yet 은 현재완료와 함께 쓰는 단서 표현입니다." },
        { q: "By next December, the new warehouse ____ fully operational.", opts: ["will have been", "has been", "had been", "is being"], a: "will have been", why: "미래의 시점까지 완료되는 상태를 말하므로 will have been 을 씁니다." },
        { q: "Ms. Cho ____ the same route for over a decade before she retired.", opts: ["drives", "has driven", "had driven", "is driving"], a: "had driven", why: "은퇴보다 앞선 과거의 기간을 나타내므로 과거완료를 씁니다." },
        { q: "The team ____ the client three times this week.", opts: ["contacted", "has contacted", "contacts", "is contacting"], a: "has contacted", why: "this week 는 아직 끝나지 않은 기간이므로 현재완료를 씁니다." },
        { q: "We ____ the figures all morning, and they still do not match.", opts: ["have been checking", "checked", "check", "are checked"], a: "have been checking", why: "아침 내내 계속되고 있는 진행을 강조하므로 현재완료진행형을 씁니다." }
      ]
    },
    {
      no: 2,
      title: "수동태",
      intro: "수동태는 주어가 동작을 당하는 문장입니다. 능동이면 주어가 행동하고, 수동이면 주어가 행동을 받습니다. p.p. 형태와 by 뒤의 행위자를 확인하면 태를 판단할 수 있습니다.",
      summary: "수동태는 행동을 당하는 대상을 주어로 세웁니다. be동사 + 과거분사 형태로 쓰고, 행위자는 by로 표시합니다.",
      points: [
        {
          h: "능동태와 수동태 비교",
          body: "능동태는 행동하는 주체를 주어로, 수동태는 행동을 당하는 대상을 주어로 세웁니다. 목적어가 주어 자리로 올라가면 동사는 be + p.p. 형태가 됩니다.",
          table: {
            head: ["구분", "구조", "예문"],
            rows: [
              ["능동태", "주어 + 동사 + 목적어", "The technician repaired the printer."],
              ["수동태", "주어 + be + p.p. + by", "The printer was repaired by the technician."],
              ["행위자 생략", "주어 + be + p.p.", "The printer was repaired yesterday."]
            ]
          },
          note: "행위자가 분명하지 않거나 중요하지 않으면 by 이하를 생략합니다."
        },
        {
          h: "시제별 수동태 형태",
          body: "수동태의 시제는 be동사가 담당하고, 본동사는 항상 과거분사로 고정됩니다. 시제를 바꾸려면 be동사만 바꾸면 됩니다.",
          table: {
            head: ["시제", "형태", "예문"],
            rows: [
              ["현재", "am / is / are + p.p.", "The report is reviewed weekly."],
              ["과거", "was / were + p.p.", "The order was shipped yesterday."],
              ["현재완료", "has / have been + p.p.", "The policy has been updated."],
              ["과거완료", "had been + p.p.", "The files had been deleted."],
              ["미래", "will be + p.p.", "The results will be announced Friday."],
              ["진행", "is / are being + p.p.", "The office is being renovated."],
              ["조동사", "조동사 + be + p.p.", "The form must be signed."]
            ]
          }
        },
        {
          h: "4형식·5형식의 수동태",
          body: "4형식은 사람 목적어를 주어로 세우는 것이 일반적입니다. 5형식에서는 목적격 보어가 주격 보어 자리로 옮겨 갑니다.",
          examples: [
            { en: "I was sent a revised invoice.", ko: "저는 수정된 송장을 받았습니다." },
            { en: "She was appointed the head of the division.", ko: "그녀는 그 부서의 책임자로 임명되었습니다." },
            { en: "The staff were given new laptops.", ko: "직원들에게 새 노트북이 지급되었습니다." }
          ],
          note: "사물을 주어로 세우면 to 를 남깁니다. A revised invoice was sent to me."
        },
        {
          h: "by 이외의 전치사",
          body: "감정이나 상태를 나타내는 동사는 by 대신 with, in, at, about, of를 씁니다. 통째로 익혀야 합니다.",
          table: {
            head: ["표현", "뜻"],
            rows: [
              ["be interested in", "~에 관심이 있다"],
              ["be satisfied with", "~에 만족하다"],
              ["be covered with", "~로 덮여 있다"],
              ["be surprised at", "~에 놀라다"],
              ["be filled with", "~로 가득 차 있다"],
              ["be known for", "~로 유명하다"],
              ["be made of", "~로 만들어져 있다"]
            ]
          }
        },
        {
          h: "부정문·의문문·조동사 수동태",
          body: "부정문은 be동사 뒤에 not, 의문문은 be동사를 주어 앞으로 보냅니다. 조동사가 있으면 조동사 + be + p.p. 형태입니다.",
          table: {
            head: ["형식", "구조", "예문"],
            rows: [
              ["부정문", "be + not + p.p.", "The invoice was not approved."],
              ["의문문", "be + 주어 + p.p.?", "Was the payment confirmed?"],
              ["조동사", "조동사 + be + p.p.", "The contract must be reviewed."],
              ["조동사 부정", "조동사 + not + be + p.p.", "The data cannot be shared."],
              ["완료 조동사", "조동사 + have been + p.p.", "The report should have been sent."]
            ]
          }
        },
        {
          h: "수동태를 쓰지 않는 경우",
          body: "목적어를 갖지 않는 자동사는 수동태로 쓸 수 없습니다. happen, occur, rise, arrive, appear가 대표적입니다.",
          examples: [
            { en: "The accident occurred at the intersection.", ko: "사고는 교차로에서 발생했습니다." },
            { en: "Prices rose sharply in the first quarter.", ko: "1분기에 물가가 급격히 올랐습니다." },
            { en: "The shipment arrived ahead of schedule.", ko: "배송은 예정보다 일찍 도착했습니다." }
          ],
          note: "자동사는 목적어가 없어 주어로 올릴 대상이 없으므로 수동태가 성립하지 않습니다."
        }
      ],
      mistakes: [
        "The accident was occurred. 처럼 자동사를 수동태로 쓰는 실수 — occurred 로 씁니다.",
        "be동사를 빠뜨리고 The report reviewed weekly. 로 쓰는 실수 — is reviewed 입니다.",
        "조동사 뒤에 be 를 빠뜨리는 실수 — The form must signed. 이 아니라 must be signed. 입니다.",
        "감정 동사에 by 를 쓰는 실수 — be interested in, be satisfied with 처럼 전치사를 맞춥니다.",
        "진행 수동에서 being 을 빠뜨리는 실수 — is being renovated 입니다."
      ],
      practice: [
        { q: "All visitor badges ____ at the security desk.", opts: ["issue", "are issued", "issuing", "has issued"], a: "are issued", why: "배지가 발급되는 대상이므로 복수 주어에 맞춘 수동태 are issued 를 씁니다." },
        { q: "The new guidelines ____ by the board last month.", opts: ["approve", "approved", "were approved", "have approved"], a: "were approved", why: "last month 는 끝난 과거이고 가이드라인이 승인받는 대상이므로 과거 수동태를 씁니다." },
        { q: "Customers ____ with the response time of our support team.", opts: ["are satisfying", "are satisfied", "satisfy", "have satisfied"], a: "are satisfied", why: "be satisfied with 는 사람이 만족하는 상태를 나타내는 수동태 표현입니다." },
        { q: "The fifth floor ____ at the moment, so please use the stairs.", opts: ["is renovating", "is being renovated", "renovates", "has renovated"], a: "is being renovated", why: "지금 진행 중인 수동이므로 is being p.p. 형태를 씁니다." },
        { q: "The final results ____ on the company website tomorrow.", opts: ["will announce", "will be announced", "are announcing", "announce"], a: "will be announced", why: "결과가 발표되는 대상이므로 미래 수동태 will be announced 를 씁니다." },
        { q: "The shipment ____ from the warehouse before the audit began.", opts: ["had moved", "had been moved", "was moving", "moves"], a: "had been moved", why: "감사가 시작되기 전에 이미 옮겨진 일이므로 과거완료 수동을 씁니다." },
        { q: "This type of paper ____ from recycled materials.", opts: ["makes", "is made", "has made", "making"], a: "is made", why: "재료로 만들어지는 대상이 주어이므로 is made 형태의 수동태를 씁니다." },
        { q: "The incident ____ near the loading dock yesterday morning.", opts: ["was occurred", "occurred", "was occurring", "is occurred"], a: "occurred", why: "occur 는 자동사이므로 수동태로 쓰지 않고 과거형 occurred 를 씁니다." }
      ]
    },
    {
      no: 3,
      title: "관계대명사와 관계부사",
      intro: "관계사는 두 문장을 하나로 이어 주는 장치입니다. 뒤에 동사가 바로 오면 주격, 주어가 오면 목적격이라는 기준 하나로 대부분의 문제가 풀립니다.",
      summary: "관계사는 두 문장을 이어 명사를 설명합니다. 선행사가 사람이면 who, 사물이면 which, 모두 가능하면 that을 씁니다.",
      points: [
        {
          h: "주격·목적격·소유격 관계대명사",
          body: "관계대명사는 뒤 문장에서 빠진 역할을 대신합니다. 선행사가 사람인지 사물인지, 뒤에서 주어·목적어·소유격 중 무엇이 빠졌는지로 형태가 정해집니다.",
          table: {
            head: ["선행사", "주격", "목적격", "소유격"],
            rows: [
              ["사람", "who / that", "who(m) / that", "whose"],
              ["사물·동물", "which / that", "which / that", "whose / of which"],
              ["사람 + 사물", "that", "that", "whose"]
            ]
          },
          note: "계속적 용법(콤마 뒤)에서는 that 을 쓰지 않고 who, which 만 씁니다."
        },
        {
          h: "주격과 목적격 판단하기",
          body: "관계대명사 뒤에 동사가 바로 오면 주격, 주어가 오면 목적격입니다. 이 기준만 익히면 형태를 빠르게 고를 수 있습니다.",
          table: {
            head: ["뒤에 오는 것", "격", "예문"],
            rows: [
              ["동사", "주격", "The manager who signed the contract is on leave."],
              ["주어 + 동사", "목적격", "The report which I submitted was excellent."],
              ["명사", "소유격", "The candidate whose portfolio impressed us was hired."]
            ]
          }
        },
        {
          h: "목적격 관계대명사의 생략",
          body: "목적격 관계대명사는 뒤에 주어 + 동사가 이어지면 생략할 수 있습니다. 주격은 생략할 수 없습니다.",
          examples: [
            { en: "The proposal we submitted was accepted.", ko: "우리가 제출한 제안서가 받아들여졌습니다." },
            { en: "The manual you sent explains the setup clearly.", ko: "보내 주신 설명서는 설치 방법을 명확히 설명합니다." }
          ],
          note: "The proposal we submitted 처럼 목적격 which 는 생략 가능하지만, 주격 who 는 생략할 수 없습니다."
        },
        {
          h: "관계부사 where / when / why",
          body: "관계부사는 뒤에 완전한 문장이 옵니다. 장소는 where, 시간은 when, 이유는 why를 씁니다.",
          table: {
            head: ["관계부사", "선행사", "예문"],
            rows: [
              ["where", "place, city, branch", "the branch where I worked"],
              ["when", "day, year, time", "the year when sales peaked"],
              ["why", "reason", "the reason why he resigned"]
            ]
          },
          note: "관계부사 뒤에는 전치사가 필요 없습니다. the office where I work 에서 in 을 쓰지 않습니다."
        },
        {
          h: "전치사 + 관계대명사",
          body: "격식 있는 문어체에서는 전치사를 관계대명사 앞에 둡니다. that은 전치사 뒤에 쓸 수 없습니다.",
          table: {
            head: ["격식체", "회화체", "예문"],
            rows: [
              ["with whom", "the consultant we worked with", "The consultant with whom we worked moved abroad."],
              ["to which", "the vendor we sent the order to", "This is the vendor to which we sent the order."],
              ["in which", "the department she works in", "the department in which she works"]
            ]
          },
          note: "전치사 뒤에는 that 을 쓸 수 없으므로 which 나 whom 으로 바꿔야 합니다."
        }
      ],
      mistakes: [
        "관계대명사를 쓰고 목적어를 또 남기는 실수 — The report which I wrote it 는 it 을 빼야 맞습니다.",
        "관계부사 where 뒤에 전치사를 또 쓰는 실수 — the office where I work 에서 in 을 반복하지 않습니다.",
        "계속적 용법에 that 을 쓰는 실수 — 콤마 뒤에서는 which, who 를 씁니다.",
        "전치사 뒤에 that 을 쓰는 실수 — the vendor to that 이 아니라 to which 입니다.",
        "선행사가 사람일 때 whose 대신 who's 를 쓰는 실수 — 소유격은 whose 입니다."
      ],
      practice: [
        { q: "The candidate ____ portfolio impressed the panel was hired.", opts: ["who", "whose", "which", "whom"], a: "whose", why: "뒤의 명사 portfolio 의 소유 관계를 나타내므로 소유격 whose 를 씁니다." },
        { q: "This is the warehouse ____ we store the seasonal inventory.", opts: ["which", "where", "who", "what"], a: "where", why: "장소를 나타내는 선행사 warehouse 뒤에 완전한 문장이 오므로 관계부사 where 를 씁니다." },
        { q: "The invoice ____ you sent last week has not been processed.", opts: ["who", "whose", "which", "where"], a: "which", why: "사물 선행사 invoice 를 받고 뒤에 주어 you 가 오므로 목적격 which 가 맞습니다." },
        { q: "The engineer ____ designed the system will train the staff.", opts: ["who", "whom", "whose", "which"], a: "who", why: "사람 선행사이고 뒤에 동사 designed 가 바로 오므로 주격 who 를 씁니다." },
        { q: "The consultant ____ we hired last month has already delivered results.", opts: ["who", "whom", "which", "what"], a: "whom", why: "뒤에 주어 we 가 오는 목적격 자리이므로 whom 을 씁니다." },
        { q: "We reviewed the report ____ the finance team prepared.", opts: ["who", "whose", "which", "where"], a: "which", why: "사물 선행사 report 를 받는 목적격 관계대명사 which 가 맞습니다." },
        { q: "The client asked about the process ____ the samples are tested.", opts: ["which", "that", "by which", "who"], a: "by which", why: "전치사 by 가 필요한 문맥에서 격식체는 전치사를 which 앞에 둡니다." },
        { q: "Please share the reason ____ the shipment was delayed.", opts: ["where", "when", "why", "which"], a: "why", why: "선행사 reason 뒤에는 관계부사 why 를 씁니다." }
      ]
    },
    {
      no: 4,
      title: "부정사와 동명사",
      intro: "동사를 목적어 자리에 쓰려면 to부정사나 동명사로 바꿉니다. 앞에 오는 동사가 무엇을 취하는지가 답을 결정하므로, 동사별로 묶어 외우는 것이 가장 빠릅니다.",
      summary: "동사를 다른 자리에서 쓰려면 to부정사나 동명사로 바꿉니다. 앞에 오는 동사에 따라 형태가 정해집니다.",
      points: [
        {
          h: "to부정사를 취하는 동사",
          body: "want, decide, hope, plan, agree, promise, manage, refuse는 to부정사를 목적어로 취합니다. 미래 지향적이거나 아직 일어나지 않은 일에 주로 씁니다.",
          examples: [
            { en: "We decided to postpone the launch.", ko: "우리는 출시를 연기하기로 결정했습니다." },
            { en: "She hopes to transfer to the overseas team.", ko: "그녀는 해외 팀으로 옮기기를 바랍니다." },
            { en: "They agreed to extend the deadline.", ko: "그들은 마감을 연장하기로 합의했습니다." }
          ],
          table: {
            head: ["동사", "뜻", "예문"],
            rows: [
              ["want", "원하다", "I want to confirm the date."],
              ["decide", "결정하다", "We decided to hire one more analyst."],
              ["plan", "계획하다", "They plan to open a branch in May."],
              ["manage", "해내다", "He managed to finish on time."],
              ["refuse", "거절하다", "She refused to sign the form."]
            ]
          }
        },
        {
          h: "동명사를 취하는 동사",
          body: "enjoy, avoid, finish, mind, suggest, consider, recommend, postpone는 동명사를 목적어로 취합니다. 이미 일어난 일이나 일반적인 행위를 가리킬 때 씁니다.",
          examples: [
            { en: "Please avoid sending large attachments.", ko: "큰 첨부 파일을 보내는 것은 피해 주세요." },
            { en: "They suggested holding the meeting online.", ko: "그들은 회의를 온라인으로 열자고 제안했습니다." }
          ],
          table: {
            head: ["동사", "뜻", "예문"],
            rows: [
              ["enjoy", "즐기다", "I enjoy working with this team."],
              ["avoid", "피하다", "Avoid using informal language."],
              ["finish", "끝내다", "She finished reviewing the file."],
              ["suggest", "제안하다", "He suggested moving the meeting."],
              ["consider", "고려하다", "We are considering changing the vendor."],
              ["postpone", "연기하다", "They postponed signing the contract."]
            ]
          }
        },
        {
          h: "뜻이 달라지는 동사",
          body: "stop, remember, forget, try는 뒤에 오는 형태에 따라 뜻이 달라집니다. 문맥에 맞는 뜻을 고르게 합니다.",
          table: {
            head: ["동사", "to부정사", "동명사"],
            rows: [
              ["stop", "~하기 위해 멈추다", "~하는 것을 그만두다"],
              ["remember", "~할 것을 기억하다(앞으로)", "~했던 것을 기억하다(과거)"],
              ["forget", "~할 것을 잊다", "~했던 것을 잊다"],
              ["try", "~하려고 애쓰다", "시험 삼아 ~해 보다"]
            ]
          },
          note: "remember to lock the door 는 앞으로 잠그라는 뜻, remember locking the door 는 잠갔던 사실을 기억한다는 뜻입니다."
        },
        {
          h: "전치사 뒤의 동명사",
          body: "전치사 뒤에는 동명사가 옵니다. to가 전치사인 표현도 마찬가지이므로 뒤에 동명사를 씁니다.",
          table: {
            head: ["표현", "뜻", "예문"],
            rows: [
              ["look forward to", "기대하다", "We look forward to hearing from you."],
              ["be used to", "익숙하다", "She is used to working late."],
              ["be committed to", "전념하다", "The firm is committed to improving service."],
              ["be responsible for", "책임이 있다", "He is responsible for managing the budget."],
              ["instead of", "대신에", "Try calling instead of sending an email."]
            ]
          }
        },
        {
          h: "동명사와 to부정사의 뉘앙스 차이",
          body: "일반적으로 동명사는 실제로 한 일이나 일반적인 행위, to부정사는 앞으로 할 일을 나타냅니다. 뜻이 비슷해 둘 다 쓰는 동사도 많습니다.",
          table: {
            head: ["동사", "동명사 (과거·일반)", "to부정사 (미래 지향)"],
            rows: [
              ["like", "I like reading reports.", "I would like to read the report now."],
              ["begin", "It began raining.", "It began to rain."],
              ["prefer", "I prefer working from home.", "I prefer to work from home."]
            ]
          },
          note: "would like, would love 뒤에는 항상 to부정사를 씁니다."
        },
        {
          h: "to부정사의 세 가지 역할",
          body: "to부정사는 명사·형용사·부사처럼 쓰입니다. 문장에서 어떤 자리에 오는지에 따라 역할이 달라집니다.",
          table: {
            head: ["역할", "자리", "예문"],
            rows: [
              ["명사적", "주어·목적어·보어", "To work remotely is convenient."],
              ["형용사적", "명사 뒤", "We need a room to hold the interviews."],
              ["부사적", "목적·이유", "We hired an expert to solve the problem."]
            ]
          }
        }
      ],
      mistakes: [
        "look forward to hear 처럼 to 뒤에 원형을 쓰는 실수 — 이 to 는 전치사이므로 hearing 이 맞습니다.",
        "enjoy to work 처럼 동명사 동사에 to부정사를 쓰는 실수 — enjoy working 입니다.",
        "remember to do 와 remember doing 의 뜻을 바꿔 쓰는 실수 — 앞으로 할 일은 to부정사입니다.",
        "전치사 뒤에 동사원형을 쓰는 실수 — instead of send 가 아니라 instead of sending 입니다.",
        "suggest 뒤에 to부정사를 쓰는 실수 — suggest to hold 가 아니라 suggest holding 입니다."
      ],
      practice: [
        { q: "The committee decided ____ the proposal until next quarter.", opts: ["postponing", "to postpone", "postpone", "postponed"], a: "to postpone", why: "decide 는 to부정사를 목적어로 취하는 동사입니다." },
        { q: "Please avoid ____ personal files on the shared drive.", opts: ["to save", "save", "saving", "saved"], a: "saving", why: "avoid 는 동명사를 목적어로 취하므로 saving 이 맞습니다." },
        { q: "We look forward to ____ your feedback on the draft.", opts: ["receive", "receiving", "received", "receipt"], a: "receiving", why: "look forward to 의 to 는 전치사이므로 동명사가 옵니다." },
        { q: "The supervisor suggested ____ the training session to the afternoon.", opts: ["to move", "moving", "move", "moved"], a: "moving", why: "suggest 는 동명사를 목적어로 취하는 동사입니다." },
        { q: "Ms. Noh is used to ____ several tasks at the same time.", opts: ["handle", "handling", "handled", "handle to"], a: "handling", why: "be used to 의 to 는 전치사이므로 동명사 handling 이 옵니다." },
        { q: "Please remember ____ the visitor log before leaving the desk.", opts: ["signing", "to sign", "sign", "signed"], a: "to sign", why: "앞으로 할 일을 기억하라는 뜻이므로 to부정사 to sign 을 씁니다." },
        { q: "The board agreed ____ the merger after the audit.", opts: ["approving", "to approve", "approve", "approved"], a: "to approve", why: "agree 는 to부정사를 목적어로 취하는 동사입니다." },
        { q: "We need a quiet room ____ the client interviews.", opts: ["holding", "hold", "to hold", "held"], a: "to hold", why: "명사 room 뒤에서 형용사처럼 꾸미는 용도의 to부정사를 씁니다." }
      ]
    },
    {
      no: 5,
      title: "분사와 분사구문 입문",
      intro: "분사는 동사를 형용사처럼 쓰는 형태입니다. 명사가 행동을 하는 주체면 -ing, 행동을 당하는 대상이면 과거분사를 씁니다. Part 5에서는 빈칸 뒤 명사와의 관계를 확인합니다.",
      summary: "분사는 동사를 형용사처럼 쓰는 형태입니다. 능동이면 -ing, 수동이면 과거분사를 씁니다.",
      points: [
        {
          h: "현재분사와 과거분사의 구분",
          body: "명사가 어떤 행동을 하는 주체면 현재분사, 그 행동을 당하는 대상이면 과거분사를 씁니다.",
          table: {
            head: ["형태", "의미", "예문"],
            rows: [
              ["현재분사", "능동·진행", "a confusing notice"],
              ["과거분사", "수동·완료", "confused employees"],
              ["현재분사", "진행 중", "the rising prices"],
              ["과거분사", "이미 완료", "the signed contract"]
            ]
          },
          note: "감정을 나타내는 분사는 사람에게 -ed, 사물에 -ing 를 쓰는 경우가 많습니다."
        },
        {
          h: "분사의 형용사 역할",
          body: "분사는 명사 앞뒤에서 명사를 꾸미거나, be동사 뒤에서 주어의 상태를 설명합니다.",
          table: {
            head: ["자리", "예문", "뜻"],
            rows: [
              ["명사 앞", "a developing market", "성장하는 시장"],
              ["명사 앞", "a developed market", "성숙한 시장"],
              ["be동사 뒤", "The results are encouraging.", "그 결과는 고무적입니다."],
              ["be동사 뒤", "The staff are motivated.", "직원들은 의욕이 있습니다."]
            ]
          },
          examples: [
            { en: "The company is expanding into a developing market.", ko: "그 회사는 성장하는 시장으로 확장하고 있습니다." },
            { en: "All signatures must be handwritten.", ko: "모든 서명은 자필이어야 합니다." }
          ]
        },
        {
          h: "분사구문 만들기",
          body: "접속사 + 주어 + 동사 구조에서 접속사를 없애고 주어가 주절과 같으면 지운 뒤 동사를 분사로 바꿉니다. 문장이 훨씬 간결해집니다.",
          table: {
            head: ["원래 문장", "분사구문"],
            rows: [
              ["Because he was tired, he left early.", "Being tired, he left early. / Tired, he left early."],
              ["While she checked the list, she found an error.", "Checking the list, she found an error."],
              ["Since the report was written in English, it was easy to read.", "Written in English, the report was easy to read."]
            ]
          },
          note: "접속사를 남기면 부사절이므로 분사구문이 아닙니다."
        },
        {
          h: "분사구문의 의미",
          body: "분사구문은 시간, 이유, 조건, 양보, 동시 상황을 나타냅니다. 문맥에 따라 뜻이 정해지므로 해석할 때 앞뒤 관계를 봅니다.",
          examples: [
            { en: "Walking into the office, she noticed the new sign.", ko: "사무실로 들어서다가 그녀는 새 표지판을 발견했습니다." },
            { en: "Given the deadline, we should start now.", ko: "마감을 고려하면 지금 시작해야 합니다." },
            { en: "Looking at the numbers, the trend is clear.", ko: "숫자를 보면 추세가 분명합니다." }
          ]
        },
        {
          h: "분사구문의 시제·수동·부정",
          body: "주절보다 앞선 일은 Having + p.p., 수동은 Being + p.p., 부정은 Not + -ing로 나타냅니다.",
          table: {
            head: ["형태", "쓰임", "예문"],
            rows: [
              ["Having + p.p.", "주절보다 앞선 일", "Having finished the audit, he submitted the report."],
              ["Being + p.p.", "수동", "Being given no clear instructions, the interns waited."],
              ["Not + -ing", "부정", "Not knowing the password, he could not log in."]
            ]
          }
        },
        {
          h: "현수분사 주의하기",
          body: "분사구문의 주어는 주절의 주어와 같아야 합니다. 다르면 의미가 어긋나는 현수분사가 되므로 주의합니다.",
          examples: [
            { en: "Reviewing the figures, the analyst found an error.", ko: "수치를 검토하던 분석가는 오류를 발견했습니다." },
            { en: "Reviewed by the board, the plan was approved.", ko: "이사회의 검토를 거쳐 그 계획은 승인되었습니다." }
          ],
          note: "Having finished the report, the printer broke down. 은 주어가 어긋난 문장입니다. 분사구문의 주어와 주절의 주어를 맞춥니다."
        }
      ],
      mistakes: [
        "분사구문의 주어와 주절의 주어가 다른데 그대로 쓰는 실수 — 주어가 다르면 각각 밝혀야 합니다.",
        "수동 관계에 -ing 를 쓰는 실수 — 승인받는 문서는 the approved document 입니다.",
        "감정 분사의 방향을 바꾸는 실수 — 사람은 confused, 사물은 confusing 입니다.",
        "주절보다 앞선 일에 현재분사를 쓰는 실수 — 먼저 일어난 일은 Having + p.p. 로 씁니다.",
        "분사구문에 접속사를 남기는 실수 — 접속사를 남기면 부사절입니다."
      ],
      practice: [
        { q: "The ____ figures in the report caused confusion among the staff.", opts: ["confuse", "confusing", "confused", "confusion"], a: "confusing", why: "수치가 혼란을 일으키는 주체이므로 현재분사 confusing 을 씁니다." },
        { q: "____ the manual carefully, the technician found a loose cable.", opts: ["Read", "Reading", "To reading", "Reads"], a: "Reading", why: "주절 주어와 같은 주어가 능동으로 이어지므로 현재분사로 시작하는 분사구문을 씁니다." },
        { q: "All ____ documents must be stored in the secure cabinet.", opts: ["sign", "signing", "signed", "signature"], a: "signed", why: "서명을 받는 문서이므로 과거분사 signed 가 맞습니다." },
        { q: "____ the quarterly results, the director scheduled a briefing.", opts: ["Review", "Reviewed", "Having reviewed", "To review"], a: "Having reviewed", why: "검토가 브리핑 예약보다 먼저 일어난 일이므로 완료분사구문을 씁니다." },
        { q: "____ many concerns from staff, the new policy was well received.", opts: ["Despite", "Although", "Because", "However"], a: "Despite", why: "뒤에 명사구 many concerns 가 오므로 전치사 Despite 를 씁니다." },
        { q: "Please keep the ____ equipment in a dry room.", opts: ["repair", "repairing", "repaired", "repairs"], a: "repaired", why: "수리를 받은 장비이므로 과거분사 repaired 를 씁니다." },
        { q: "____ by the heavy rain, the outdoor event was moved indoors.", opts: ["Affecting", "Affected", "Affect", "To affect"], a: "Affected", why: "행사가 영향을 받는 대상이므로 과거분사로 시작하는 분사구문을 씁니다." },
        { q: "____ not feeling well, Ms. Park left the meeting early.", opts: ["Because", "Not", "Despite", "Although"], a: "Not", why: "부정의 뜻은 분사 앞에 Not 을 두어 나타냅니다." }
      ]
    },
    {
      no: 6,
      title: "가정법",
      intro: "가정법은 사실과 다른 상황을 가정하는 문법입니다. if절의 시제를 한 단계 뒤로 물리고 주절에 would, would have 를 쓰는 것이 핵심입니다.",
      summary: "사실과 다른 상황을 가정할 때는 시제를 한 단계 뒤로 물립니다. if절에서 과거를 쓰면 현재 사실의 반대입니다.",
      points: [
        {
          h: "가정법 과거 — 현재 사실의 반대",
          body: "if절에 과거형, 주절에 would + 원형을 씁니다. be동사는 주어와 관계없이 were를 씁니다.",
          table: {
            head: ["형식", "예문"],
            rows: [
              ["If + 주어 + 과거형, 주어 + would + 원형", "If I had more time, I would join the workshop."],
              ["If + 주어 + were, 주어 + would + 원형", "If he were in charge, he would change the process."],
              ["If + 주어 + 과거형, 주어 + could + 원형", "If we had a van, we could deliver today."]
            ]
          }
        },
        {
          h: "가정법 과거완료 — 과거 사실의 반대",
          body: "if절에 had + p.p., 주절에 would have + p.p.를 씁니다. 이미 지나간 일에 대한 아쉬움을 나타냅니다.",
          table: {
            head: ["형식", "예문"],
            rows: [
              ["If + 주어 + had p.p., 주어 + would have p.p.", "If we had booked earlier, we would have gotten a discount."],
              ["If + 주어 + had p.p., 주어 + could have p.p.", "If she had left earlier, she could have caught the train."],
              ["If + 주어 + had p.p., 주어 + might have p.p.", "If the shipment had left earlier, it might have arrived today."],
              ["If + 주어 + had not p.p., 주어 + would have p.p.", "If we had not renewed the license, we would have lost the account."]
            ]
          },
          examples: [
            { en: "If we had booked earlier, we would have gotten a discount.", ko: "더 일찍 예약했더라면 할인을 받았을 텐데요." },
            { en: "If she had checked the file, the error would not have occurred.", ko: "그녀가 파일을 확인했더라면 오류가 생기지 않았을 것입니다." }
          ]
        },
        {
          h: "혼합 가정법",
          body: "과거의 원인이 현재에 영향을 줄 때는 if절에 had + p.p., 주절에 would + 원형을 씁니다.",
          table: {
            head: ["형식", "예문"],
            rows: [
              ["If + had p.p. (과거), would + 원형 (현재)", "If I had taken that course, I would be more confident now."],
              ["If + were (현재), would have p.p. (과거)", "If she were careful, she would not have lost the file."],
              ["If + had p.p. (과거), could + 원형 (현재)", "If we had hired earlier, we could handle the volume now."],
              ["If + had p.p. (과거), would be -ing (현재 진행)", "If the deal had closed, we would be working on it now."]
            ]
          }
        },
        {
          h: "I wish 가정법",
          body: "이루어지지 않은 바람을 나타냅니다. 현재의 아쉬움에는 과거형, 과거의 아쉬움에는 had + p.p.를 씁니다.",
          table: {
            head: ["형식", "뜻", "예문"],
            rows: [
              ["I wish + 과거형", "지금 ~라면 좋을 텐데", "I wish I had more time."],
              ["I wish + had p.p.", "그때 ~했더라면 좋았을 텐데", "I wish I had studied harder."],
              ["I wish + would", "앞으로 ~해 주면 좋겠다", "I wish they would reply soon."]
            ]
          }
        },
        {
          h: "if 를 생략한 도치",
          body: "if를 생략하면 were, had, should를 주어 앞으로 보냅니다. 격식 있는 문어체에서 자주 씁니다.",
          examples: [
            { en: "Were I in your position, I would accept the offer.", ko: "제가 당신 입장이라면 그 제안을 받아들일 것입니다." },
            { en: "Had we known the cost, we would have changed the plan.", ko: "비용을 알았더라면 계획을 바꿨을 것입니다." }
          ]
        },
        {
          h: "가정의 다른 표현",
          body: "without, otherwise, but for도 가정의 뜻을 담습니다. 주절에 would를 쓰는 점이 같습니다.",
          examples: [
            { en: "Without your help, we would not have finished on time.", ko: "당신의 도움이 없었다면 제때 끝내지 못했을 것입니다." },
            { en: "We left early; otherwise we would have missed the flight.", ko: "우리는 일찍 출발했습니다. 그렇지 않았다면 비행기를 놓쳤을 것입니다." },
            { en: "But for the discount, the deal would not have closed.", ko: "할인이 없었다면 그 거래는 성사되지 않았을 것입니다." }
          ]
        }
      ],
      mistakes: [
        "If I would have time 처럼 if절에 would 를 쓰는 실수 — if절에는 과거형, 주절에 would 를 씁니다.",
        "가정법 과거에서 was 를 쓰는 실수 — 격식 표현에서는 If I were 가 원칙입니다.",
        "과거 사실의 반대에 would + 원형을 쓰는 실수 — would have p.p. 를 씁니다.",
        "I wish 뒤에 현재형을 쓰는 실수 — I wish I have 가 아니라 I wish I had 입니다.",
        "혼합 가정법에서 시제를 섞지 않는 실수 — 과거 원인과 현재 결과를 함께 나타낼 때 씁니다."
      ],
      practice: [
        { q: "If the supplier ____ the order on time, the store would not be out of stock.", opts: ["ships", "shipped", "had shipped", "will ship"], a: "shipped", why: "현재 사실의 반대를 가정하고 주절에 would be 가 있으므로 if절에는 과거형을 씁니다." },
        { q: "If we had reviewed the contract, we ____ the penalty clause.", opts: ["would notice", "would have noticed", "notice", "had noticed"], a: "would have noticed", why: "과거 사실의 반대를 가정하는 가정법 과거완료이므로 would have p.p. 를 씁니다." },
        { q: "I wish I ____ more time to prepare for the interview last week.", opts: ["have", "had", "had had", "will have"], a: "had had", why: "지난주라는 과거에 대한 아쉬움이므로 had + p.p. 를 씁니다." },
        { q: "____ I in charge of the budget, I would cut the travel expenses first.", opts: ["Am", "Was", "Were", "Be"], a: "Were", why: "if 를 생략하고 were 를 주어 앞으로 도치한 형태입니다." },
        { q: "The team worked overtime; ____, the launch would have been delayed.", opts: ["otherwise", "therefore", "moreover", "meanwhile"], a: "otherwise", why: "그렇지 않았다면이라는 가정의 뜻을 나타내는 otherwise 를 씁니다." },
        { q: "If she ____ the data earlier, we would have found the error sooner.", opts: ["checks", "checked", "had checked", "would check"], a: "had checked", why: "주절이 would have p.p. 이므로 if절에는 had + p.p. 를 씁니다." },
        { q: "I wish the supplier ____ the revised quote soon.", opts: ["sent", "would send", "had sent", "sends"], a: "would send", why: "앞으로 해 주기를 바라는 뜻에는 I wish + would 를 씁니다." },
        { q: "____ it not been for the discount, we would not have placed the order.", opts: ["If", "Had", "Were", "Should"], a: "Had", why: "if 를 생략하고 had 를 도치한 가정법 과거완료 형태입니다." }
      ]
    },
    {
      no: 7,
      title: "조동사 심화 — 추측과 후회",
      intro: "조동사 + have p.p.는 과거에 대한 추측과 후회를 나타냅니다. must, may, might, cannot, should 중 무엇을 쓰느냐로 확신의 정도와 감정이 달라집니다.",
      summary: "조동사 + have p.p.로 과거에 대한 추측과 후회를 나타냅니다. 확신의 정도에 따라 조동사를 고릅니다.",
      points: [
        {
          h: "과거 추측 — 조동사 + have p.p.",
          body: "과거의 일을 지금 추측할 때 씁니다. must는 강한 확신, may와 might는 가능성, cannot은 부정적 확신을 나타냅니다.",
          table: {
            head: ["형식", "확신 정도", "예문"],
            rows: [
              ["must have p.p.", "거의 확실", "He must have missed the train."],
              ["may have p.p.", "가능성 있음", "She may have left a message."],
              ["might have p.p.", "가능성 낮음", "They might have changed the schedule."],
              ["could have p.p.", "가능성(과거)", "The file could have been deleted."],
              ["cannot have p.p.", "일어났을 리 없음", "He cannot have finished the audit."]
            ]
          }
        },
        {
          h: "should have p.p. 와 ought to have p.p.",
          body: "should have p.p.는 하지 않은 일에 대한 후회나 비난을 나타냅니다. ought to have p.p.도 같은 뜻으로 씁니다.",
          examples: [
            { en: "You should have informed the client earlier.", ko: "고객에게 더 일찍 알렸어야 했습니다." },
            { en: "We ought to have checked the figures twice.", ko: "우리는 숫자를 두 번 확인했어야 했습니다." },
            { en: "The team should not have shared the draft.", ko: "그 팀은 초안을 공유하지 말았어야 했습니다." }
          ]
        },
        {
          h: "could have p.p. — 가능했던 일",
          body: "could have p.p.는 하려고 마음만 먹으면 가능했던 일을 나타냅니다. 실제로는 일어나지 않았다는 뉘앙스가 있습니다.",
          examples: [
            { en: "We could have saved money by ordering in bulk.", ko: "대량 주문으로 돈을 아낄 수도 있었습니다." },
            { en: "She could have taken the earlier flight.", ko: "그녀는 더 이른 항공편을 탈 수도 있었습니다." }
          ],
          note: "could have p.p. 는 가능성이 있었지만 실현되지 않았다는 뜻으로, may have p.p. 보다 아쉬움을 담습니다."
        },
        {
          h: "must have p.p. 와 cannot have p.p.",
          body: "현재 상황을 근거로 과거를 강하게 추측할 때는 must have p.p., 반대로 일어났을 리 없다고 할 때는 cannot have p.p.를 씁니다.",
          table: {
            head: ["상황", "추측", "예문"],
            rows: [
              ["불이 꺼져 있다", "강한 긍정 추측", "The staff must have gone home."],
              ["택배가 아직 있다", "강한 부정 추측", "The courier cannot have delivered it."],
              ["우산이 없다", "가능성", "He may have taken my umbrella."]
            ]
          }
        },
        {
          h: "need not have p.p. vs did not need to",
          body: "need not have p.p.는 실제로 했지만 할 필요가 없었던 일을, did not need to는 할 필요가 없어서 하지 않은 일을 나타냅니다.",
          table: {
            head: ["형식", "뜻", "예문"],
            rows: [
              ["need not have p.p.", "했지만 할 필요가 없었다", "You need not have printed the whole file."],
              ["did not need to", "할 필요가 없어서 하지 않았다", "I did not need to attend the second session."],
              ["did not have to", "할 필요가 없었다", "We did not have to file a claim."]
            ]
          },
          note: "need not have p.p. 는 이미 한 일에 대한 아쉬움, did not need to 는 하지 않은 일을 말합니다."
        },
        {
          h: "조동사 + have p.p. 한눈에 정리",
          body: "확신의 정도와 감정에 따라 형태를 고릅니다. 표로 정리해 두면 상황 설명 문장에서 답을 빠르게 고를 수 있습니다.",
          table: {
            head: ["형태", "쓰임", "예문"],
            rows: [
              ["must have p.p.", "강한 긍정 추측", "She must have known the result."],
              ["cannot have p.p.", "강한 부정 추측", "They cannot have approved it."],
              ["may / might have p.p.", "가능성", "He might have called the office."],
              ["should have p.p.", "후회·비난", "I should have backed up the data."],
              ["could have p.p.", "실현되지 않은 가능성", "We could have closed the deal."],
              ["need not have p.p.", "불필요했던 일", "You need not have waited."]
            ]
          }
        }
      ],
      mistakes: [
        "must have went 처럼 have 뒤에 과거형을 쓰는 실수 — have 뒤에는 과거분사가 옵니다.",
        "should have p.p. 를 습관에 대한 조언으로 쓰는 실수 — 과거 사실에 대한 후회에 씁니다.",
        "과거의 부정 추측에 must not have p.p. 를 쓰는 실수 — cannot have p.p. 를 씁니다.",
        "could have p.p. 대신 could be 를 쓰는 실수 — 과거를 추측할 때는 have p.p. 가 필요합니다.",
        "need not have p.p. 와 did not need to 를 바꿔 쓰는 실수 — 했는지 여부가 다릅니다."
      ],
      practice: [
        { q: "The lights are off, so the staff ____ home already.", opts: ["must go", "must have gone", "must going", "must went"], a: "must have gone", why: "현재 상황으로 과거를 강하게 추측하므로 must have p.p. 를 씁니다." },
        { q: "You ____ the client before promising a discount.", opts: ["should consult", "should have consulted", "should consulting", "should consulted"], a: "should have consulted", why: "하지 않은 과거 일에 대한 후회를 나타내므로 should have p.p. 를 씁니다." },
        { q: "The package is still here, so the courier ____ it yet.", opts: ["cannot have delivered", "must have delivered", "can have delivered", "should deliver"], a: "cannot have delivered", why: "택배가 아직 있으므로 배달했을 리 없다는 부정적 확신을 cannot have p.p. 로 나타냅니다." },
        { q: "The report was submitted yesterday, so the team ____ all night.", opts: ["must not work", "must have worked", "cannot have worked", "should work"], a: "must have worked", why: "어제 제출된 결과로 보아 밤새 일한 것이 거의 확실하므로 must have p.p. 를 씁니다." },
        { q: "We ____ more time if we had started the survey earlier.", opts: ["could have had", "could have", "can have", "could had"], a: "could have had", why: "실현되지 않은 과거의 가능성을 나타내므로 could have p.p. 를 씁니다." },
        { q: "You ____ the whole file; a summary would have been enough.", opts: ["need not have printed", "did not need to print", "must not print", "should not print"], a: "need not have printed", why: "실제로 인쇄했지만 할 필요가 없었던 일이므로 need not have p.p. 를 씁니다." },
        { q: "The client ____ the email, but she has not replied yet.", opts: ["may have read", "may read", "must read", "should read"], a: "may have read", why: "과거에 읽었을 가능성을 나타내므로 may have p.p. 를 씁니다." },
        { q: "Ms. Lim is not at her desk; she ____ out for lunch.", opts: ["must have gone", "must go", "must have went", "must going"], a: "must have gone", why: "현재 상황을 근거로 과거를 추측하고, have 뒤에는 과거분사 gone 이 옵니다." }
      ]
    },
    {
      no: 8,
      title: "사역동사와 지각동사",
      intro: "사역동사는 누구에게 일을 시키는 것을, 지각동사는 보고 듣는 행위를 나타냅니다. 목적격 보어 자리에 원형이 오는지 to부정사가 오는지가 시험의 핵심입니다.",
      summary: "사역동사는 누구에게 일을 시키는 것을, 지각동사는 보고 듣는 행위를 나타냅니다. 목적격 보어 형태가 동사마다 다릅니다.",
      points: [
        {
          h: "사역동사 make / have / let",
          body: "make, have, let은 목적어 뒤에 동사 원형을 씁니다. get은 예외적으로 to부정사를 씁니다.",
          table: {
            head: ["동사", "형태", "예문"],
            rows: [
              ["make", "make + 목적어 + 원형", "The manager made us redo the report."],
              ["have", "have + 목적어 + 원형", "I had the technician check the printer."],
              ["let", "let + 목적어 + 원형", "Let me explain the procedure."],
              ["get", "get + 목적어 + to부정사", "She got the vendor to lower the price."]
            ]
          },
          note: "help 는 원형과 to부정사를 모두 쓸 수 있습니다. help the team prepare / help the team to prepare."
        },
        {
          h: "준사역동사 get 과 help",
          body: "get은 사람을 설득해 일을 하게 한다는 뜻으로 to부정사를 취합니다. help는 원형과 to부정사 둘 다 가능합니다.",
          examples: [
            { en: "She got the supplier to change the delivery date.", ko: "그녀는 공급업체가 배송 날짜를 바꾸도록 설득했습니다." },
            { en: "The assistant helped the team prepare the slides.", ko: "그 비서는 팀이 슬라이드를 준비하도록 도왔습니다." },
            { en: "This tool helps users track expenses.", ko: "이 도구는 사용자가 지출을 추적하도록 돕습니다." }
          ]
        },
        {
          h: "지각동사 see / hear / watch / feel",
          body: "지각동사 뒤에는 동사 원형(전체 동작) 또는 -ing(진행 중)를 씁니다. to부정사는 쓰지 않습니다.",
          table: {
            head: ["형태", "뜻", "예문"],
            rows: [
              ["see + 목적어 + 원형", "전체 동작을 보다", "I saw the courier deliver the parcel."],
              ["see + 목적어 + -ing", "진행 중인 동작을 보다", "I saw the courier delivering the parcels."],
              ["hear + 목적어 + 원형", "전체 소리를 듣다", "We heard the alarm ring."],
              ["watch + 목적어 + -ing", "지켜보다", "She watched the machine running."],
              ["feel + 목적어 + 원형", "느끼다", "I felt the floor shake."]
            ]
          }
        },
        {
          h: "사역동사·지각동사의 수동태",
          body: "수동태로 바뀌면 목적격 보어였던 동사원형이 to부정사로 바뀝니다. 수동태에서는 to를 반드시 넣습니다.",
          table: {
            head: ["능동", "수동"],
            rows: [
              ["The manager made us redo the report.", "We were made to redo the report."],
              ["I saw the courier deliver the parcel.", "The courier was seen to deliver the parcel."],
              ["They let him leave early.", "He was allowed to leave early."]
            ]
          },
          note: "let 의 수동태는 be let to 가 아니라 be allowed to 를 씁니다."
        },
        {
          h: "목적격 보어 자리 총정리",
          body: "동사 종류에 따라 목적격 보어로 오는 형태가 다릅니다. 표로 묶어 두면 빈칸 문제가 빠르게 풀립니다.",
          table: {
            head: ["동사 종류", "목적격 보어", "예문"],
            rows: [
              ["사역동사 make / have / let", "동사 원형", "They made him wait outside."],
              ["준사역동사 get", "to부정사", "We got the team to agree."],
              ["준사역동사 help", "원형 / to부정사", "She helped me finish the list."],
              ["지각동사", "원형 / -ing", "I heard the phone ring."],
              ["일반 5형식 (want, ask)", "to부정사", "They asked me to review the file."]
            ]
          }
        }
      ],
      mistakes: [
        "made us to redo 처럼 사역동사 뒤에 to 를 넣는 실수 — make 뒤에는 원형을 씁니다.",
        "let me to check 처럼 let 뒤에 to 를 쓰는 실수 — let me check 가 맞습니다.",
        "지각동사 뒤에 to부정사를 쓰는 실수 — saw him to leave 가 아니라 saw him leave 입니다.",
        "get 뒤에 원형을 쓰는 실수 — get him check 가 아니라 get him to check 입니다.",
        "수동태에서 to 를 빠뜨리는 실수 — was made to redo 로 씁니다."
      ],
      practice: [
        { q: "The supervisor had the intern ____ the summary again.", opts: ["to write", "writing", "write", "wrote"], a: "write", why: "사역동사 have 뒤에는 목적격 보어로 동사 원형을 씁니다." },
        { q: "We saw the new staff ____ packages in the warehouse.", opts: ["to load", "load", "to loading", "loaded"], a: "load", why: "지각동사 see 뒤에는 동사 원형이나 -ing 가 오며, to부정사는 쓰지 않습니다." },
        { q: "She got the supplier ____ the delivery date.", opts: ["change", "to change", "changing", "changed"], a: "to change", why: "get 은 사역의 뜻이지만 목적격 보어로 to부정사를 씁니다." },
        { q: "The interns were made ____ the entire inventory by hand.", opts: ["count", "to count", "counting", "counted"], a: "to count", why: "사역동사 make 가 수동태가 되면 목적격 보어가 to부정사로 바뀝니다." },
        { q: "This tool helps users ____ their monthly expenses.", opts: ["tracking", "to track", "tracked", "tracks"], a: "to track", why: "help 는 원형과 to부정사를 모두 취합니다." },
        { q: "The manager let the staff ____ an hour earlier on Friday.", opts: ["to leave", "leave", "leaving", "left"], a: "leave", why: "사역동사 let 뒤에는 동사 원형을 씁니다." },
        { q: "The team asked the vendor ____ the invoice with the correct address.", opts: ["resend", "to resend", "resending", "resent"], a: "to resend", why: "일반 5형식 동사 ask 뒤에는 목적격 보어로 to부정사를 씁니다." },
        { q: "I heard the alarm ____ twice before the fire drill ended.", opts: ["to ring", "ring", "rang", "rings"], a: "ring", why: "지각동사 hear 뒤에는 동사 원형을 씁니다." }
      ]
    },
    {
      no: 9,
      title: "비교 표현 심화",
      intro: "비교 표현은 형태만 정확히 알면 빠르게 풀립니다. 원급, 비교급, 최상급의 틀과 강조·배수 표현을 함께 익혀 두세요.",
      summary: "the 비교급, 원급 관용 표현, 배수 표현으로 정확한 비교를 만듭니다.",
      points: [
        {
          h: "원급 비교 — as ~ as",
          body: "두 대상이 같은 정도임을 나타냅니다. 부정문에서는 not as ~ as로 덜함을 나타냅니다.",
          table: {
            head: ["형식", "뜻", "예문"],
            rows: [
              ["as + 원급 + as", "~만큼 ~한", "The new printer is as fast as the old one."],
              ["not as + 원급 + as", "~만큼 ~하지 않은", "The first draft was not as clear as the second."],
              ["as + many / much + as", "~만큼 많은", "We received as many orders as last year."]
            ]
          }
        },
        {
          h: "비교급 — than",
          body: "두 대상을 비교할 때는 비교급 뒤에 than을 씁니다. 비교 대상이 반복되면 that of, those of로 대신합니다.",
          examples: [
            { en: "This model is cheaper than the previous one.", ko: "이 모델은 이전 모델보다 저렴합니다." },
            { en: "Our response time is shorter than that of our competitors.", ko: "우리 응답 시간은 경쟁사보다 짧습니다." }
          ],
          note: "비교 대상이 명사일 때는 that of(단수), those of(복수)로 받습니다."
        },
        {
          h: "최상급과 one of the 최상급",
          body: "셋 이상 중 가장 좋은 것은 the + 최상급으로 나타냅니다. one of the + 최상급 + 복수 명사 구조도 자주 나옵니다.",
          table: {
            head: ["형식", "뜻", "예문"],
            rows: [
              ["the + 최상급", "가장 ~한", "Seoul is the largest market for the brand."],
              ["the + 최상급 + in / of", "범위 안에서 가장", "the busiest in the company"],
              ["one of the + 최상급 + 복수", "가장 ~한 것 중 하나", "one of the most efficient systems on the market"],
              ["the second + 최상급", "두 번째로 ~한", "the second largest market"]
            ]
          }
        },
        {
          h: "the 비교급, the 비교급",
          body: "앞의 비교급이 조건, 뒤의 비교급이 결과가 되어 점점 더해지는 변화를 나타냅니다. 두 절 모두 the를 씁니다.",
          examples: [
            { en: "The more we practice, the more confident we become.", ko: "연습할수록 더 자신감이 생깁니다." },
            { en: "The sooner you confirm, the earlier we can ship.", ko: "더 빨리 확인할수록 더 일찍 발송할 수 있습니다." },
            { en: "The higher the volume, the lower the unit cost.", ko: "물량이 많을수록 단가가 낮아집니다." }
          ],
          note: "앞뒤 모두 주어와 동사를 갖춘 절 형태여야 합니다."
        },
        {
          h: "배수 표현",
          body: "몇 배인지는 twice, three times 뒤에 as ~ as를 붙여 나타냅니다. 비교급과 함께 쓰면 than을 씁니다.",
          table: {
            head: ["표현", "예문"],
            rows: [
              ["twice as many as", "We received twice as many orders as last year."],
              ["three times as much as", "The new unit costs three times as much as the older model."],
              ["twice as + 형용사 + as", "The warehouse is twice as large as the old one."],
              ["배수 + 비교급 + than", "This route is three times longer than the highway."]
            ]
          }
        },
        {
          h: "비교급 강조와 관용 표현",
          body: "much, far, even, a lot은 비교급을 강조하고, 원급·비교급에는 굳어진 관용 표현이 많습니다.",
          table: {
            head: ["표현", "뜻", "예문"],
            rows: [
              ["much / far + 비교급", "훨씬 ~한", "This route is much faster."],
              ["even + 비교급", "더욱 ~한", "This week was even busier than last week."],
              ["as soon as possible", "가능한 한 빨리", "Please reply as soon as possible."],
              ["as far as I know", "내가 아는 한", "As far as I know, the schedule is unchanged."],
              ["no later than", "늦어도", "Submit the form no later than Friday."]
            ]
          }
        }
      ],
      mistakes: [
        "The more practice, the more confident. 처럼 절 형태를 빠뜨리는 실수 — 주어와 동사를 갖춘 절이 필요합니다.",
        "one of the most efficient system 처럼 최상급 뒤 명사를 단수로 쓰는 실수 — 복수형 systems 가 맞습니다.",
        "비교 대상에 that of 를 빠뜨리는 실수 — our time is shorter than our competitors 가 아니라 than that of our competitors 입니다.",
        "very 로 비교급을 강조하는 실수 — much faster, far faster 를 씁니다.",
        "as ~ as 사이에 비교급을 쓰는 실수 — as faster as 가 아니라 as fast as 입니다."
      ],
      practice: [
        { q: "The earlier you apply, the ____ your chance of approval.", opts: ["high", "higher", "highest", "more high"], a: "higher", why: "the 비교급 구문이므로 뒤에도 비교급 higher 를 씁니다." },
        { q: "This quarter we processed ____ as many orders as last quarter.", opts: ["two times", "twice", "double", "second"], a: "twice", why: "배수를 나타내는 관용 표현은 twice as many as 입니다." },
        { q: "The new facility is one of the most advanced ____ in the region.", opts: ["factory", "factorys", "factories", "factor"], a: "factories", why: "one of the + 최상급 뒤에는 복수 명사가 옵니다." },
        { q: "Our delivery time is shorter than ____ of our main competitor.", opts: ["that", "those", "this", "these"], a: "that", why: "단수 명사 delivery time 을 대신하므로 that of 를 씁니다." },
        { q: "The new scanner is twice as ____ as the model it replaced.", opts: ["fast", "faster", "fastest", "more fast"], a: "fast", why: "배수 표현 twice as ~ as 사이에는 원급 fast 를 씁니다." },
        { q: "____ the volume, the lower the unit cost becomes.", opts: ["The higher", "Higher", "The highest", "High"], a: "The higher", why: "the 비교급 구문의 앞부분으로 The higher 를 씁니다." },
        { q: "This route is ____ faster than the highway during rush hour.", opts: ["very", "much", "more", "most"], a: "much", why: "비교급을 강조하는 부사는 much 입니다. very 는 비교급을 강조하지 못합니다." },
        { q: "Please submit the signed form no ____ than Friday.", opts: ["late", "later", "latest", "lately"], a: "later", why: "no later than 은 늦어도라는 뜻의 관용 표현입니다." }
      ]
    },
    {
      no: 10,
      title: "간접의문문과 명사절",
      intro: "의문문이 다른 문장 속에 들어가면 어순이 평서문처럼 바뀝니다. 이 어순 변화와 that, if, whether의 쓰임이 시험의 핵심입니다.",
      summary: "의문문이 문장 속에 들어가면 어순이 평서문처럼 바뀝니다. that, if, whether로 절을 명사처럼 씁니다.",
      points: [
        {
          h: "간접의문문의 어순",
          body: "의문사 + 주어 + 동사 순서로 배열하고, 의문사가 없는 경우 if나 whether를 씁니다. 물음표는 문장 전체가 의문문일 때만 붙입니다.",
          table: {
            head: ["직접의문문", "간접의문문"],
            rows: [
              ["Where is the office?", "Do you know where the office is?"],
              ["Does he work here?", "Could you tell me if he works here?"],
              ["When will the shipment arrive?", "Please let me know when the shipment will arrive."],
              ["What does this cost?", "Could you tell me what this costs?"]
            ]
          }
        },
        {
          h: "간접의문문 만드는 법",
          body: "be동사와 조동사는 주어 뒤로 보내고, 일반동사는 do/does/did를 없애고 시제에 맞는 형태로 바꿉니다.",
          table: {
            head: ["원래 형태", "간접의문문", "바뀌는 것"],
            rows: [
              ["Is the store open?", "Do you know if the store is open?", "be동사를 주어 뒤로"],
              ["Can she drive?", "Tell me if she can drive.", "조동사를 주어 뒤로"],
              ["Did they sign?", "I wonder if they signed.", "did 를 없애고 과거형"],
              ["Will it rain?", "Check whether it will rain.", "조동사를 주어 뒤로"]
            ]
          }
        },
        {
          h: "that절 — 명사처럼 쓰는 절",
          body: "that절은 문장의 주어·목적어·보어가 될 수 있습니다. 목적어 자리의 that은 자주 생략합니다.",
          examples: [
            { en: "We believe that the delay was unavoidable.", ko: "우리는 지연이 불가피했다고 믿습니다." },
            { en: "The manager said the report was ready.", ko: "부장님은 보고서가 준비되었다고 말했습니다." },
            { en: "That the plan succeeded surprised everyone.", ko: "그 계획이 성공했다는 사실은 모두를 놀라게 했습니다." }
          ],
          note: "think, believe, say 뒤의 that 은 회화에서 흔히 생략합니다."
        },
        {
          h: "whether와 if의 차이",
          body: "주어 자리, 전치사 뒤, to부정사 앞에는 whether만 씁니다. if는 목적어 자리에서만 쓸 수 있습니다.",
          table: {
            head: ["자리", "쓸 수 있는 것", "예문"],
            rows: [
              ["주어 자리", "whether", "Whether the project succeeds depends on funding."],
              ["전치사 뒤", "whether", "It depends on whether the budget is approved."],
              ["to부정사 앞", "whether", "We are discussing whether to extend the deadline."],
              ["목적어 자리", "whether / if", "I am not sure whether he will attend."]
            ]
          }
        },
        {
          h: "명사절을 이끄는 의문사",
          body: "what, who, which, when, where, how는 명사절을 이끌며 절 안에서 주어나 목적어 역할을 합니다.",
          examples: [
            { en: "What the client needs is a clear timeline.", ko: "고객이 필요로 하는 것은 명확한 일정입니다." },
            { en: "I cannot recall who sent the first email.", ko: "저는 누가 첫 이메일을 보냈는지 기억나지 않습니다." },
            { en: "The manual explains how the device is installed.", ko: "그 설명서는 기기가 어떻게 설치되는지 설명합니다." }
          ],
          note: "what 은 뒤에 불완전한 절을, that 은 완전한 절을 이끕니다."
        },
        {
          h: "동격의 that",
          body: "동격의 that은 앞 명사의 내용을 설명합니다. that 앞뒤로 같은 내용이 놓입니다.",
          examples: [
            { en: "The fact that sales rose surprised the board.", ko: "매출이 올랐다는 사실이 이사회를 놀라게 했습니다." },
            { en: "The rumor that the plant would close was false.", ko: "공장이 문을 닫을 것이라는 소문은 사실이 아니었습니다." }
          ]
        }
      ],
      mistakes: [
        "Do you know where is the station? 처럼 간접의문문에서 어순을 바꾸는 실수 — where the station is 입니다.",
        "전치사 뒤에 if 를 쓰는 실수 — 전치사 뒤에는 whether 를 씁니다.",
        "간접의문문 끝에 물음표를 남기는 실수 — 문장 전체가 평서문이면 마침표를 씁니다.",
        "what 과 that 을 바꿔 쓰는 실수 — 불완전한 절에는 what 을 씁니다.",
        "did 를 그대로 남기고 과거형까지 쓰는 실수 — 간접의문문에서는 did 를 없앱니다."
      ],
      practice: [
        { q: "Could you tell me when the next shipment ____?", opts: ["will arrive", "arrives will", "does arrive when", "arrive"], a: "will arrive", why: "간접의문문은 의문사 뒤에 주어 + 동사 순서로 씁니다." },
        { q: "The success of the launch depends on ____ the budget is approved.", opts: ["if", "whether", "that", "what"], a: "whether", why: "전치사 on 뒤에는 whether 만 쓸 수 있습니다." },
        { q: "____ surprised the team was the speed of the response.", opts: ["What", "That", "Which", "Whether"], a: "What", why: "명사절의 주어 자리에서 절을 이끄는 의문대명사는 What 입니다." },
        { q: "Do you know ____ the Seoul office opens on weekends?", opts: ["if", "that", "what", "which"], a: "if", why: "예·아니오로 답하는 간접의문문이므로 목적어 자리에 if 를 씁니다." },
        { q: "The report explains ____ the new system reduces costs.", opts: ["how", "that", "which", "whose"], a: "how", why: "방법을 나타내는 명사절이므로 how 를 씁니다." },
        { q: "The fact ____ the contract was renewed reassured the staff.", opts: ["what", "that", "which", "whether"], a: "that", why: "앞 명사 fact 의 내용을 설명하는 동격의 that 입니다." },
        { q: "We are still discussing ____ to extend the warranty.", opts: ["if", "whether", "that", "what"], a: "whether", why: "to부정사 앞에는 whether 만 씁니다." },
        { q: "Please confirm ____ the package has been shipped.", opts: ["that", "what", "who", "which"], a: "that", why: "완전한 절을 이끌고 목적어 역할을 하므로 that 을 씁니다." }
      ]
    },
    {
      no: 11,
      title: "화법 — 직접화법과 간접화법",
      intro: "남의 말을 그대로 옮기면 직접화법, 전달 동사를 써서 바꾸면 간접화법입니다. 전달 동사가 과거이면 시제와 대명사, 시간 표현이 모두 한 단계 뒤로 물러납니다.",
      summary: "남의 말을 전할 때는 시제를 한 단계 뒤로 물리고 대명사와 시간 표현을 바꿉니다.",
      points: [
        {
          h: "직접화법과 간접화법",
          body: "직접화법은 따옴표로 말을 그대로 옮기고, 간접화법은 say, tell 같은 전달 동사 뒤에 절로 바꿔 씁니다.",
          table: {
            head: ["구분", "형식", "예문"],
            rows: [
              ["직접화법", "말 그대로 인용", "She said, The report is ready."],
              ["간접화법", "전달 동사 + 절", "She said that the report was ready."],
              ["전달 동사", "say / tell", "He told me that the meeting was canceled."]
            ]
          },
          note: "tell 은 목적어(사람)가 필요하고, say 는 목적어 없이 씁니다."
        },
        {
          h: "시제 변화",
          body: "전달 동사가 과거이면 인용문의 시제를 한 단계 뒤로 물립니다.",
          table: {
            head: ["직접화법", "간접화법"],
            rows: [
              ["am / is", "was"],
              ["will", "would"],
              ["can", "could"],
              ["did", "had done"],
              ["have p.p.", "had p.p."],
              ["must", "had to"]
            ]
          }
        },
        {
          h: "대명사와 지시어 변화",
          body: "말하는 사람과 듣는 사람의 기준이 바뀌므로 대명사와 지시어를 상황에 맞게 바꿉니다.",
          table: {
            head: ["직접화법", "간접화법"],
            rows: [
              ["I / we", "he, she / they"],
              ["my / our", "his, her / their"],
              ["this", "that"],
              ["these", "those"]
            ]
          }
        },
        {
          h: "시간·장소 표현 변화",
          body: "now는 then, today는 that day, tomorrow는 the next day, here는 there로 바꿉니다.",
          table: {
            head: ["직접화법", "간접화법"],
            rows: [
              ["now", "then"],
              ["today", "that day"],
              ["tomorrow", "the next day"],
              ["yesterday", "the day before"],
              ["next week", "the following week"],
              ["here", "there"]
            ]
          }
        },
        {
          h: "의문문과 명령문 전달",
          body: "의문문은 if 또는 의문사로 이어 주고, 명령문은 tell + 목적어 + to부정사로 바꿉니다.",
          examples: [
            { en: "He asked me if the report was ready.", ko: "그는 제게 보고서가 준비되었는지 물었습니다." },
            { en: "She asked where the meeting would be held.", ko: "그녀는 회의가 어디에서 열릴지 물었습니다." },
            { en: "She told us to submit the form by Friday.", ko: "그녀는 우리에게 금요일까지 양식을 제출하라고 했습니다." }
          ]
        },
        {
          h: "제안·권유 전달과 시제 유지",
          body: "제안은 suggest + -ing, 권유는 offer to로 바꿉니다. 전달 동사가 현재이거나 내용이 지금도 유효하면 시제를 그대로 둡니다.",
          examples: [
            { en: "He suggested holding the meeting online.", ko: "그는 회의를 온라인으로 열자고 제안했습니다." },
            { en: "She offered to help with the schedule.", ko: "그녀는 일정을 돕겠다고 했습니다." },
            { en: "He said the earth moves around the sun.", ko: "그는 지구가 태양 주위를 돈다고 말했습니다." }
          ],
          note: "전달 동사가 현재이면 시제를 바꾸지 않습니다. She says she works from home on Fridays."
        }
      ],
      mistakes: [
        "He said that he will come. 처럼 시제를 뒤로 물리지 않는 실수 — would come 이 맞습니다.",
        "asked me where was the file 처럼 간접화법 의문문에서 어순을 바꾸는 실수 — where the file was 입니다.",
        "say 뒤에 사람 목적어를 쓰는 실수 — He said me 가 아니라 He told me 입니다.",
        "명령문을 that절로 전달하는 실수 — told me to submit 처럼 to부정사를 씁니다.",
        "today 를 그대로 두는 실수 — 간접화법에서는 that day 로 바꿉니다."
      ],
      practice: [
        { q: "The client said that he ____ the proposal the next day.", opts: ["reviews", "would review", "will review", "reviewed"], a: "would review", why: "전달 동사가 과거이고 미래 일을 전하므로 will 을 would 로 바꿉니다." },
        { q: "The manager asked me ____ I had finished the summary.", opts: ["that", "if", "what", "which"], a: "if", why: "예·아니오로 답하는 의문문을 전달할 때는 if 를 씁니다." },
        { q: "The supervisor told the team ____ the equipment before leaving.", opts: ["turn off", "to turn off", "turning off", "turned off"], a: "to turn off", why: "명령문을 전달할 때는 tell + 목적어 + to부정사 구조를 씁니다." },
        { q: "Ms. Son said that she ____ the file the day before.", opts: ["sent", "had sent", "sends", "will send"], a: "had sent", why: "과거보다 앞선 일이므로 과거완료 had sent 를 씁니다." },
        { q: "The technician asked where the main switch ____.", opts: ["was located", "located", "is locating", "locates"], a: "was located", why: "간접화법 의문문은 의문사 뒤에 주어 + 동사 순서로 씁니다." },
        { q: "The director ____ us that the branch would open in May.", opts: ["said", "told", "asked", "spoke"], a: "told", why: "사람 목적어 us 가 있으므로 told 를 씁니다." },
        { q: "She offered ____ the client with the rescheduling.", opts: ["help", "to help", "helping", "helped"], a: "to help", why: "권유를 전달할 때는 offer to + 동사원형을 씁니다." },
        { q: "He said the store ____ at nine on weekdays.", opts: ["opens", "opened", "would open", "opening"], a: "opens", why: "지금도 유효한 일반적인 사실은 시제를 그대로 둡니다." }
      ]
    },
    {
      no: 12,
      title: "연결어 심화 — 접속사·접속부사·전치사",
      intro: "뒤에 절이 오면 접속사, 명사구가 오면 전치사, 문장 사이에서 의미만 이으면 접속부사입니다. 빈칸 뒤를 먼저 보는 습관이 답을 가릅니다.",
      summary: "뒤에 절이 오면 접속사, 명사구가 오면 전치사, 문장 사이에서 의미만 이으면 접속부사입니다.",
      points: [
        {
          h: "세 품사를 가르는 기준",
          body: "빈칸 뒤를 먼저 봅니다. 주어 + 동사가 오면 접속사, 명사구가 오면 전치사, 문장 첫머리에서 의미만 연결하면 접속부사입니다.",
          table: {
            head: ["종류", "예", "뒤에 오는 것"],
            rows: [
              ["접속사", "although, because, while", "절(주어 + 동사)"],
              ["전치사", "despite, because of, during", "명사구"],
              ["접속부사", "however, therefore, moreover", "문장(부사 역할)"]
            ]
          }
        },
        {
          h: "접속사 종류와 쓰임",
          body: "등위접속사는 대등한 요소를, 종속접속사는 부사절을 이끕니다. 둘 다 콤마와 함께 쓰입니다.",
          table: {
            head: ["구분", "접속사", "의미"],
            rows: [
              ["등위", "and / but / or / so", "추가 / 대조 / 선택 / 결과"],
              ["종속(원인)", "because / since / as", "~때문에"],
              ["종속(양보)", "although / though / even though", "~에도 불구하고"],
              ["종속(조건)", "if / unless / in case", "만약 / ~하지 않으면"],
              ["종속(시간)", "when / while / until / as soon as", "~할 때 / ~하는 동안"]
            ]
          }
        },
        {
          h: "접속부사의 문장부호",
          body: "접속부사는 두 문장을 연결할 때 세미콜론과 콤마를 함께 씁니다. 문장 맨 앞에 오면 뒤에 콤마를 붙입니다.",
          examples: [
            { en: "The plan was costly; however, the board approved it.", ko: "그 계획은 비쌌습니다. 그러나 이사회는 승인했습니다." },
            { en: "Therefore, the launch was postponed.", ko: "따라서 출시가 연기되었습니다." },
            { en: "The deadline was short; nevertheless, the team delivered.", ko: "마감이 짧았습니다. 그럼에도 팀은 결과물을 냈습니다." }
          ],
          note: "접속부사만으로 두 절을 직접 연결할 수 없습니다."
        },
        {
          h: "의미별 연결어 묶음",
          body: "대조·결과·추가·조건·정리를 기준으로 묶어 두면 빈칸 문제에서 빠르게 소거할 수 있습니다.",
          table: {
            head: ["의미", "표현"],
            rows: [
              ["대조", "however, in contrast, on the other hand"],
              ["결과", "therefore, consequently, as a result"],
              ["추가", "moreover, in addition, besides"],
              ["조건", "otherwise, provided that"],
              ["정리", "in conclusion, in short"]
            ]
          }
        },
        {
          h: "전치사와 접속사 짝 맞추기",
          body: "같은 뜻이라도 뒤에 절이 오면 접속사, 명사구가 오면 전치사를 씁니다. 짝을 지어 익혀 두면 빠릅니다.",
          table: {
            head: ["전치사 (+ 명사구)", "접속사 (+ 절)", "뜻"],
            rows: [
              ["because of the rain", "because it rained", "원인"],
              ["despite the delay", "although it was delayed", "양보"],
              ["during the meeting", "while we met", "시간"],
              ["in case of fire", "in case a fire starts", "조건"]
            ]
          }
        },
        {
          h: "콤마와 세미콜론 정리",
          body: "접속사는 콤마와 함께, 접속부사는 세미콜론과 함께 씁니다. 접속부사만으로 두 절을 직접 연결할 수 없습니다.",
          examples: [
            { en: "Although the deadline was short, the team delivered.", ko: "마감이 짧았지만 팀은 결과물을 냈습니다." },
            { en: "The deadline was short; nevertheless, the team delivered.", ko: "마감이 짧았습니다. 그럼에도 팀은 결과물을 냈습니다." },
            { en: "We revised the budget, and we informed the vendor.", ko: "우리는 예산을 수정했고 업체에 알렸습니다." }
          ]
        }
      ],
      mistakes: [
        "Despite it was raining 처럼 despite 뒤에 절을 쓰는 실수 — Despite the rain 또는 Although it was raining 입니다.",
        "The plan was costly, however we approved it. 처럼 접속부사를 접속사처럼 쓰는 실수 — 세미콜론이나 마침표로 나눠야 합니다.",
        "although 와 because 를 바꿔 쓰는 실수 — 양보와 원인의 뜻이 다릅니다.",
        "because of 뒤에 절을 쓰는 실수 — because of the delay 처럼 명사구를 씁니다.",
        "접속부사를 문장 중간에 콤마 없이 넣는 실수 — however 앞뒤에 문장부호가 필요합니다."
      ],
      practice: [
        { q: "____ the heavy workload, the team met the deadline.", opts: ["Although", "Despite", "Because", "Therefore"], a: "Despite", why: "뒤에 명사구 the heavy workload 가 오므로 전치사 Despite 를 씁니다." },
        { q: "The supplier raised prices; ____, we had to revise the budget.", opts: ["therefore", "despite", "although", "whereas"], a: "therefore", why: "앞 문장의 결과를 이어 주는 접속부사 therefore 가 맞습니다." },
        { q: "Please submit the request today; ____, it will be processed next month.", opts: ["otherwise", "moreover", "likewise", "namely"], a: "otherwise", why: "그렇지 않으면이라는 조건의 의미를 나타내는 otherwise 를 씁니다." },
        { q: "____ the shipment was delayed, the store opened on time.", opts: ["Although", "Because", "So", "Therefore"], a: "Although", why: "뒤에 절이 오고 양보의 뜻이므로 접속사 Although 를 씁니다." },
        { q: "We will proceed ____ the client approves the final design.", opts: ["despite", "because of", "as soon as", "during"], a: "as soon as", why: "뒤에 절이 오고 시간의 뜻이므로 접속사 as soon as 를 씁니다." },
        { q: "The training was brief; ____, it was very useful.", opts: ["however", "because", "so that", "unless"], a: "however", why: "앞 문장과 대조되는 내용을 이어 주는 접속부사 however 를 씁니다." },
        { q: "____ the new software, the accounting process became much faster.", opts: ["Because", "Thanks to", "Although", "While"], a: "Thanks to", why: "뒤에 명사구가 오고 긍정적 원인을 나타내므로 Thanks to 를 씁니다." },
        { q: "The team finished the audit, ____ they submitted the report the same day.", opts: ["but", "or", "and", "so"], a: "and", why: "두 동작을 대등하게 이어 주는 등위접속사 and 가 맞습니다." }
      ]
    }
  ]
});
