/* ============================================================================
 * 기초 영문법 (A1 ~ A2) — 12과
 * tools/build-pages.mjs 와 감사 도구가 window.GRAMMAR_BOOKS 를 읽습니다.
 * 한 과의 구성: summary → points(개념·형태표·예문) → mistakes → practice
 * ========================================================================== */
window.GRAMMAR_BOOKS = window.GRAMMAR_BOOKS || [];

window.GRAMMAR_BOOKS.push({
  id: "basic",
  level: "초급",
  cefr: "A1 ~ A2",
  title: "기초 영문법",
  subtitle: "be동사부터 문장의 5형식까지, 영어 문장의 뼈대 세우기",
  desc: "be동사·일반동사·시제·조동사·전치사·의문문까지, 영어 문장의 뼈대를 12과로 정리한 기초 영문법 교재입니다. 과마다 개념·형태 표·예문·흔한 실수·연습 문제를 담았습니다.",
  audience: "영어를 다시 시작하는 성인 학습자, 문법 용어가 낯선 초급 학습자",
  goal: "주어와 동사를 중심으로 스스로 문장을 만들고, 시제와 조동사를 상황에 맞게 고를 수 있다.",
  howto: [
    "하루 1과씩, 표를 먼저 눈으로 익힌 뒤 예문을 소리 내어 읽습니다.",
    "연습 문제는 정답을 보지 않고 먼저 풀고, 틀린 과만 다음 날 다시 봅니다.",
    "예문을 그대로 베껴 쓰면서 주어·동사 위치를 손으로 익힙니다."
  ],
  chapters: [
    {
      no: 1,
      title: "문장의 뼈대와 be동사",
      intro: "토익 Part 5·6의 모든 문제는 주어와 동사를 찾는 데서 시작합니다. be동사 자리를 눈으로 먼저 잡아 두면 뒤에 나오는 수일치·시제 문제가 훨씬 쉬워집니다. 이 과에서는 주어와 동사의 짝, 그리고 be동사의 현재·과거·부정·의문 형태를 한 번에 정리합니다.",
      summary: "영어 문장은 주어와 동사로 시작합니다. be동사는 주어의 상태나 존재를 나타내며 주어와 시제에 따라 am, is, are, was, were로 달라집니다.",
      points: [
        {
          h: "영어 문장의 최소 단위 — 주어 + 동사",
          body: "영어 문장은 누가(주어) 무엇을 한다(동사)는 뼈대를 반드시 갖습니다. 한국어처럼 주어나 동사를 생략하면 문장이 성립하지 않으므로, 말하거나 쓰기 전에 주어와 동사를 먼저 정하는 습관이 중요합니다. 긴 문장을 읽을 때도 가장 먼저 주어와 동사를 찾으면 구조가 한눈에 들어옵니다.",
          examples: [
            { en: "The meeting starts at nine.", ko: "회의는 9시에 시작합니다." },
            { en: "My manager called me yesterday.", ko: "부장님이 어제 저에게 전화했습니다." },
            { en: "Our clients visit the branch every spring.", ko: "우리 고객들은 매년 봄 지점을 방문합니다." }
          ],
          note: "명령문은 예외적으로 주어를 생략합니다. Submit the form by Friday. 처럼 동사로 시작합니다."
        },
        {
          h: "be동사 현재형 — am / is / are",
          body: "be동사는 주어의 상태, 신분, 위치를 나타냅니다. 주어가 I면 am, 3인칭 단수(he, she, it, 단수 명사)면 is, 나머지 복수 주어와 you는 are를 씁니다. be동사 뒤에는 형용사나 명사가 와서 주어를 설명합니다.",
          table: {
            head: ["주어", "be동사", "축약형", "예문"],
            rows: [
              ["I", "am", "I'm", "I am ready."],
              ["He / She / It", "is", "he's / she's / it's", "She is busy."],
              ["You / We / They", "are", "you're / we're / they're", "They are late."],
              ["단수 명사", "is", "it's", "The office is closed."],
              ["복수 명사", "are", "they're", "The documents are ready."]
            ]
          },
          note: "주어가 길어도 핵심 명사만 보면 됩니다. The new printer in the supply room 은 단수라서 is 를 씁니다."
        },
        {
          h: "be동사의 부정문과 의문문",
          note: "축약형 isn't, aren't, wasn't, weren't 는 회화와 업무 메일에서 모두 자연스럽게 쓰입니다.",
          body: "부정문은 be동사 뒤에 not을 붙이고, 의문문은 be동사를 주어 앞으로 보냅니다. 회화에서는 not을 줄여 isn't, aren't로 자주 씁니다. 대답은 Yes 또는 No와 주어 + be동사로 짧게 합니다.",
          table: {
            head: ["형식", "구조", "예문"],
            rows: [
              ["부정문", "be + not", "I am not available today."],
              ["부정 축약", "be + n't", "She isn't at her desk."],
              ["의문문", "be + 주어 + ~?", "Are you ready for the presentation?"],
              ["짧은 대답", "Yes / No + 주어 + be", "No, he isn't."]
            ]
          },
          examples: [
            { en: "The elevator is not working this morning.", ko: "오늘 아침 엘리베이터가 작동하지 않습니다." },
            { en: "Is the conference room available at two?", ko: "회의실을 2시에 쓸 수 있습니까?" }
          ]
        },
        {
          h: "be동사의 과거형 — was / were",
          note: "was, were 뒤에 yesterday, last week 같은 과거 표현이 오는지 함께 확인하면 시제 문제가 빨리 풀립니다.",
          body: "과거의 상태를 말할 때는 am, is를 was로, are를 were로 바꿉니다. 과거의 습관이나 행동은 be동사로 표현할 수 없고 일반동사의 과거형을 씁니다. yesterday, last week 같은 과거 표현이 보이면 was/were인지부터 확인합니다.",
          table: {
            head: ["현재", "과거", "예문"],
            rows: [
              ["am / is", "was", "The office was quiet."],
              ["are", "were", "They were satisfied."],
              ["am / is + not", "was not (wasn't)", "The shipment wasn't late."],
              ["are + not", "were not (weren't)", "The guests weren't ready."]
            ]
          }
        },
        {
          h: "be동사와 일반동사 구분하기",
          body: "be동사는 주어의 상태·신분을, 일반동사는 동작을 나타냅니다. 두 동사를 한 문장에 겹쳐 쓰면 안 되므로, 동작을 말할 때는 be동사를 빼고 일반동사만 씁니다. 빈칸 뒤에 형용사가 있으면 be동사, 목적어가 있으면 일반동사라고 생각하면 빠르게 구분됩니다.",
          table: {
            head: ["의미", "be동사 문장", "일반동사 문장"],
            rows: [
              ["상태 vs 동작", "I am busy.", "I work hard."],
              ["신분 vs 행동", "She is a manager.", "She manages the team."],
              ["위치 vs 이동", "He is in the lobby.", "He enters the lobby."]
            ]
          },
          examples: [
            { en: "The staff are friendly and helpful.", ko: "직원들은 친절하고 도움이 됩니다." },
            { en: "The staff handle customer calls all day.", ko: "직원들은 하루 종일 고객 전화를 처리합니다." }
          ],
          note: "I am agree. 는 틀린 문장입니다. agree 는 일반동사이므로 I agree. 로 씁니다."
        },
        {
          h: "be동사 한눈에 정리",
          note: "be동사가 이미 있으면 do, does, did 를 쓰지 않습니다. 둘을 같이 쓰는 것이 Part 5 단골 오답입니다.",
          body: "시제와 형식을 한 표에 모아 두면 Part 5에서 be동사가 필요한지, 어떤 형태여야 하는지 바로 판단할 수 있습니다.",
          table: {
            head: ["시제", "긍정", "부정", "의문문"],
            rows: [
              ["현재", "am / is / are", "am not / isn't / aren't", "Am I ~? / Is he ~? / Are they ~?"],
              ["과거", "was / were", "wasn't / weren't", "Was he ~? / Were they ~?"],
              ["미래", "will be", "will not be (won't be)", "Will he be ~? / Will they be ~?"]
            ]
          }
        }
      ],
      mistakes: [
        "주어를 빠뜨리고 Is busy. 처럼 말하는 실수 — 반드시 주어를 넣어 She is busy. 로 씁니다.",
        "I am agree. 는 틀린 문장입니다. agree 는 일반동사이므로 I agree. 로 씁니다.",
        "의문문에서 be동사를 그대로 두는 실수 — You are ready? 보다 Are you ready? 가 맞습니다.",
        "과거 시제에 현재형 be동사를 쓰는 실수 — yesterday 가 있으면 was / were 를 씁니다.",
        "복수 주어에 is 를 쓰는 실수 — The reports is ready. 가 아니라 The reports are ready. 입니다."
      ],
      practice: [
        { q: "The new printer ____ in the supply room.", opts: ["are", "is", "am", "be"], a: "is", why: "주어 The new printer 는 3인칭 단수이므로 is 를 씁니다." },
        { q: "____ you available for a call this afternoon?", opts: ["Is", "Am", "Are", "Be"], a: "Are", why: "주어 you 에는 are 를 쓰고, 의문문이므로 주어 앞에 둡니다." },
        { q: "The employees ____ not informed about the schedule change.", opts: ["was", "were", "is", "am"], a: "were", why: "복수 주어 The employees 에는 과거형 were 를 씁니다." },
        { q: "There ____ several openings in the marketing team.", opts: ["is", "are", "was", "be"], a: "are", why: "뒤에 복수 명사 several openings 가 오므로 are 를 씁니다." },
        { q: "The client ____ satisfied with the revised estimate.", opts: ["is", "are", "am", "be"], a: "is", why: "주어 The client 는 단수이므로 is 를 씁니다." },
        { q: "The files ____ on the shared drive last week.", opts: ["is", "are", "were", "was"], a: "were", why: "복수 주어 The files 와 과거 표현 last week 에 맞춰 were 를 씁니다." },
        { q: "I ____ not responsible for the shipping schedule.", opts: ["is", "am", "are", "be"], a: "am", why: "주어 I 에는 be동사 am 을 씁니다." },
        { q: "____ the receptionist at the front desk right now?", opts: ["Are", "Is", "Am", "Be"], a: "Is", why: "주어 The receptionist 가 단수이므로 Is 로 시작합니다." }
      ]
    },
    {
      no: 2,
      title: "일반동사와 3인칭 단수",
      intro: "3인칭 단수 -s는 토익에서 가장 자주 나오는 수일치 함정입니다. 주어와 동사 사이에 수식어가 끼어도 동사를 찾아낼 수 있도록, 예문에서 주어와 동사를 짝지어 읽어 보세요. 규칙 자체는 단순하지만 시험에서는 함정으로 변형되어 나옵니다.",
      summary: "일반동사는 동작을 나타냅니다. 현재시제에서 주어가 3인칭 단수이면 동사 뒤에 -s 또는 -es를 붙입니다.",
      points: [
        {
          h: "일반동사의 현재형과 -s 규칙",
          body: "현재의 습관이나 반복되는 행동은 동사의 원형으로 씁니다. 주어가 he, she, it 또는 단수 명사일 때만 동사 끝에 -s를 붙입니다. 주어가 길어도 핵심 명사가 단수인지 복수인지만 보면 됩니다.",
          table: {
            head: ["주어", "동사 형태", "예문"],
            rows: [
              ["I / You / We / They", "원형", "We work from home."],
              ["He / She / It", "원형 + s", "He works from home."],
              ["단수 명사", "원형 + s", "The manager reviews every report."],
              ["복수 명사", "원형", "The managers review every report."]
            ]
          },
          note: "주어와 동사 사이에 전치사구가 끼어도 동사는 핵심 주어에 맞춥니다. The list of items is long."
        },
        {
          h: "-s / -es 를 붙이는 철자 규칙",
          note: "go, do, have 는 goes, does, has 로 불규칙하게 바뀝니다. 이 셋은 따로 외워 둡니다.",
          body: "동사 끝 철자에 따라 -s 대신 -es를 붙이거나 y를 바꿉니다. 이 규칙은 명사의 복수형과 거의 같으므로 함께 익히면 편합니다.",
          table: {
            head: ["동사 끝", "규칙", "예"],
            rows: [
              ["일반", "-s", "work → works"],
              ["-s / -sh / -ch / -x", "-es", "pass → passes, watch → watches"],
              ["-o", "-es", "go → goes, do → does"],
              ["자음 + y", "y → i + -es", "study → studies, carry → carries"],
              ["모음 + y", "-s", "play → plays, enjoy → enjoys"],
              ["have", "불규칙", "have → has"]
            ]
          }
        },
        {
          h: "부정문과 의문문 — do / does",
          body: "일반동사의 부정문과 의문문에는 do 또는 does를 씁니다. 이때 본동사는 반드시 원형으로 돌아옵니다. does 뒤에 -s가 다시 붙으면 틀린 문장이 됩니다.",
          table: {
            head: ["형식", "구조", "예문"],
            rows: [
              ["부정문", "do / does + not + 원형", "She does not work on Fridays."],
              ["부정 축약", "don't / doesn't + 원형", "They don't accept cash."],
              ["의문문", "Do / Does + 주어 + 원형?", "Do they offer a discount?"],
              ["의문사 의문문", "의문사 + do / does + 주어 + 원형?", "When does the store open?"]
            ]
          },
          note: "주어가 3인칭 단수여도 do/does 뒤에서는 -s 를 쓰지 않습니다. Does she works here? 는 틀린 문장입니다."
        },
        {
          h: "짧은 대답과 do / does 생략",
          note: "짧은 대답에서는 고유 명사를 대명사로 바꿔 말합니다. The manager 는 she 로 받습니다.",
          body: "Do/Does 의문문에는 Yes 또는 No와 주어 + do / does로 답합니다. 이미 나온 동작을 되풀이하지 않아도 되어 회화에서 매우 자주 쓰입니다.",
          examples: [
            { en: "Do you handle international orders? Yes, we do.", ko: "해외 주문도 처리하나요? 네, 그렇습니다." },
            { en: "Does the manager approve overtime? No, she doesn't.", ko: "부장님이 초과 근무를 승인하나요? 아니요, 안 합니다." },
            { en: "They don't ship on weekends.", ko: "그들은 주말에는 발송하지 않습니다." }
          ]
        },
        {
          h: "빈도 부사의 위치",
          body: "always, usually, often, sometimes, never 같은 빈도 부사는 일반동사 앞, be동사 뒤에 둡니다. 조동사가 있으면 조동사 뒤에 놓습니다.",
          examples: [
            { en: "He usually arrives before nine.", ko: "그는 보통 9시 전에 도착합니다." },
            { en: "The manager is never late.", ko: "그 부장님은 결코 지각하지 않습니다." },
            { en: "We can always reschedule the call.", ko: "우리는 언제든 통화 일정을 다시 잡을 수 있습니다." }
          ],
          note: "often, sometimes 는 문장 끝이나 앞으로도 옮길 수 있지만, always 와 never 는 동사 앞자리가 원칙입니다."
        },
        {
          h: "긴 주어에서 동사 찾기",
          note: "of, in, with 같은 전치사구와 who, which 가 이끄는 절은 주어가 아닙니다. 지우고 나면 동사가 보입니다.",
          body: "Part 5·6에서는 주어 뒤에 전치사구나 관계절이 길게 붙어 동사를 찾기 어렵게 만듭니다. 수식어를 괄호로 묶어 지우고 핵심 주어와 동사만 남겨 보는 연습을 하세요.",
          examples: [
            { en: "The list of approved vendors is posted online.", ko: "승인된 업체 목록이 온라인에 게시되어 있습니다." },
            { en: "Employees who work remotely submit weekly reports.", ko: "재택 근무하는 직원들은 주간 보고서를 제출합니다." }
          ],
          table: {
            head: ["문장", "핵심 주어", "동사"],
            rows: [
              ["The list of approved vendors is posted online.", "The list", "is"],
              ["Employees who work remotely submit weekly reports.", "Employees", "submit"],
              ["The head of the sales team attends the meeting.", "The head", "attends"]
            ]
          }
        }
      ],
      mistakes: [
        "Does she works here? 처럼 does 뒤에 -s 를 또 붙이는 실수 — does 뒤에는 반드시 원형을 씁니다.",
        "He don't like coffee. 는 틀린 문장입니다. 3인칭 단수에는 doesn't 를 씁니다.",
        "주어와 동사 사이 수식어에 끌려 동사를 맞추는 실수 — The boxes on the shelf is heavy. 가 아니라 are heavy. 입니다.",
        "study, carry 처럼 자음 + y 로 끝나는 동사에 -s 만 붙이는 실수 — studies, carries 로 바꿉니다.",
        "일반동사 의문문에 be동사를 쓰는 실수 — Do you have a minute? 이지 Are you have a minute? 가 아닙니다."
      ],
      practice: [
        { q: "Our team ____ a progress report every Monday.", opts: ["submit", "submits", "submitting", "submitted"], a: "submits", why: "주어 Our team 은 단수 취급이므로 -s 를 붙인 submits 가 맞습니다." },
        { q: "____ the receptionist handle international calls?", opts: ["Do", "Does", "Is", "Are"], a: "Does", why: "주어가 3인칭 단수이고 일반동사 handle 이 있으므로 Does 로 묻습니다." },
        { q: "The staff ____ not use the back entrance during renovation.", opts: ["does", "do", "is", "are"], a: "do", why: "staff 는 구성원 전체를 가리키는 집합명사로, 구성원들(복수)로 볼 때는 do not 을 씁니다." },
        { q: "Ms. Park ____ the quarterly figures before each meeting.", opts: ["review", "reviews", "reviewing", "reviewed"], a: "reviews", why: "주어 Ms. Park 이 3인칭 단수이므로 reviews 를 씁니다." },
        { q: "The technicians ____ the equipment every morning.", opts: ["checks", "check", "checking", "is checking"], a: "check", why: "복수 주어 The technicians 에는 원형 check 를 씁니다." },
        { q: "____ you usually travel by train for business trips?", opts: ["Are", "Do", "Does", "Is"], a: "Do", why: "일반동사 travel 의 의문문이고 주어가 you 이므로 Do 를 씁니다." },
        { q: "The new intern ____ lunch with the team on Fridays.", opts: ["have", "has", "having", "to have"], a: "has", why: "주어 The new intern 이 3인칭 단수이고 have 의 3인칭 형태는 has 입니다." },
        { q: "Our suppliers ____ deliver on weekends.", opts: ["doesn't", "don't", "isn't", "aren't"], a: "don't", why: "복수 주어 Our suppliers 에는 don't 를 씁니다." }
      ]
    },
    {
      no: 3,
      title: "명사·관사·복수형",
      intro: "Part 5 어휘 문제는 관사 뒤에 명사가 오는지로 답이 갈리는 경우가 많습니다. 셀 수 있는 명사인지 판단하는 감각을 먼저 잡으면 어형 문제까지 함께 풀립니다. 이 과에서는 명사의 수와 관사, 수량 표현을 한 번에 정리합니다.",
      summary: "명사는 사람과 사물의 이름입니다. 셀 수 있는 명사에는 a, an, 복수형 -s를 붙이고, 특정한 것을 가리킬 때는 the를 씁니다.",
      points: [
        {
          h: "셀 수 있는 명사와 셀 수 없는 명사",
          body: "하나, 둘로 셀 수 있는 명사는 단수일 때 관사가 필요하고 복수형을 만들 수 있습니다. information, advice, equipment, furniture 처럼 셀 수 없는 명사는 복수형이 없고 a를 붙일 수 없습니다. 셀 수 없는 명사는 a piece of, an item of 같은 단위 표현으로 셉니다.",
          table: {
            head: ["구분", "예", "쓰는 법"],
            rows: [
              ["셀 수 있는 명사", "report, invoice, employee", "a report / two reports"],
              ["셀 수 없는 명사", "information, advice, equipment", "a piece of information / much advice"],
              ["항상 복수", "goods, contents, savings", "복수 동사와 함께 씁니다"]
            ]
          },
          examples: [
            { en: "We received three invoices this morning.", ko: "우리는 오늘 아침 송장 세 장을 받았습니다." },
            { en: "She gave me useful advice about the contract.", ko: "그녀는 계약에 관한 유용한 조언을 해 주었습니다." }
          ],
          note: "news 는 -s 로 끝나지만 단수 취급합니다. The news is good."
        },
        {
          h: "관사 a / an / the",
          body: "a와 an은 처음 언급하는 하나를 가리키고, the는 이미 언급했거나 문맥상 하나로 정해진 것을 가리킵니다. 발음이 모음이면 an을 씁니다.",
          table: {
            head: ["관사", "쓰는 경우", "예문"],
            rows: [
              ["a", "자음 소리 앞, 처음 언급", "a proposal"],
              ["an", "모음 소리 앞, 처음 언급", "an hour"],
              ["the", "정해진 대상, 재언급", "the proposal we discussed"],
              ["the", "세상에 하나뿐인 것", "the sun, the Internet"]
            ]
          },
          note: "an hour 처럼 철자는 자음이지만 발음이 모음인 경우 an 을 씁니다. a university 는 발음이 '유' 로 시작하므로 a 를 씁니다."
        },
        {
          h: "관사를 쓰지 않는 경우",
          body: "고유명사, 복수 명사를 일반적으로 말할 때, 추상명사에는 관사를 쓰지 않습니다. 식사·운동·언어 이름 앞에도 관사가 붙지 않습니다.",
          examples: [
            { en: "We hired new employees for the design team.", ko: "우리는 디자인 팀을 위해 신입 직원을 채용했습니다." },
            { en: "Breakfast is served from seven to nine.", ko: "아침 식사는 7시부터 9시까지 제공됩니다." },
            { en: "She speaks fluent English and basic Japanese.", ko: "그녀는 유창한 영어와 기초 일본어를 구사합니다." }
          ],
          note: "go to school, go to work 처럼 본래 목적으로 가는 장소에는 관사를 쓰지 않는 관용 표현이 있습니다."
        },
        {
          h: "복수형 만드는 규칙",
          note: "발음도 함께 익히세요. -es 는 한 음절로 소리 나서 복수형이 한 음절 늘어납니다.",
          body: "대부분 -s를 붙이지만, -s, -sh, -ch, -x는 -es를 붙이고 자음 + y는 y를 i로 바꿉니다. -f 나 -fe 로 끝나는 명사는 -ves 로 바꾸는 경우가 있습니다.",
          table: {
            head: ["단수", "복수", "규칙"],
            rows: [
              ["box", "boxes", "-x 는 -es"],
              ["city", "cities", "자음 + y 는 -ies"],
              ["branch", "branches", "-ch 는 -es"],
              ["key", "keys", "모음 + y 는 그대로 -s"],
              ["leaf", "leaves", "-f 는 -ves"],
              ["photo", "photos", "-o 인데 -s 만 붙는 예외"]
            ]
          }
        },
        {
          h: "불규칙 복수형과 단복수 동형",
          note: "news, mathematics 는 -s 로 끝나지만 단수로 취급해 동사도 단수형을 씁니다.",
          body: "자주 쓰이는 명사는 불규칙한 복수형을 가지므로 통째로 익혀야 합니다. 단수와 복수 형태가 같은 명사도 있어 문맥으로 수를 판단합니다.",
          table: {
            head: ["단수", "복수", "예문"],
            rows: [
              ["child", "children", "The center cares for ten children."],
              ["person", "people", "Three people joined the tour."],
              ["man / woman", "men / women", "Two women manage the branch."],
              ["foot / tooth", "feet / teeth", "The warehouse is about 800 feet long."],
              ["series", "series", "This series covers four units."]
            ]
          }
        },
        {
          h: "수량 표현 — much / many, a few / a little",
          note: "a number of 는 복수 동사, the number of 는 단수 동사를 씁니다. 이 차이가 자주 출제됩니다.",
          body: "셀 수 없는 명사에는 much, a little, a great deal of를, 셀 수 있는 복수 명사에는 many, a few, a number of를 씁니다. some과 any는 둘 다에 쓸 수 있습니다.",
          table: {
            head: ["표현", "쓰는 명사", "예문"],
            rows: [
              ["much / a little", "셀 수 없는 명사", "We do not have much time."],
              ["many / a few", "셀 수 있는 복수 명사", "A few applicants withdrew."],
              ["a number of", "셀 수 있는 복수 명사", "A number of orders arrived late."],
              ["an amount of", "셀 수 없는 명사", "A large amount of data was lost."]
            ]
          }
        }
      ],
      mistakes: [
        "an advice, informations 처럼 셀 수 없는 명사를 다루는 실수 — a piece of advice, information 처럼 단위를 씁니다.",
        "a hour 처럼 발음 대신 철자로 판단하는 실수 — 발음이 모음이면 an 입니다.",
        "복수 명사 앞에 a 를 붙이는 실수 — a employees 가 아니라 employees 또는 an employee 입니다.",
        "셀 수 없는 명사에 many 를 쓰는 실수 — much equipment, a great deal of furniture 처럼 씁니다.",
        "person 대신 peoples, persons 를 습관적으로 쓰는 실수 — 일반적인 복수는 people 입니다."
      ],
      practice: [
        { q: "Please send me ____ invoice for last month.", opts: ["a", "an", "the", "some"], a: "an", why: "invoice 는 모음 소리로 시작하는 처음 언급 대상이므로 an 을 씁니다." },
        { q: "The company purchased new ____ for the office.", opts: ["furnitures", "furniture", "a furniture", "furnituring"], a: "furniture", why: "furniture 는 셀 수 없는 명사이므로 복수형이나 관사를 쓰지 않습니다." },
        { q: "Two ____ were hired for the marketing team.", opts: ["person", "persons", "people", "peoples"], a: "people", why: "person 의 복수형 people 이 자연스럽고, 숫자 뒤에 바로 씁니다." },
        { q: "We received ____ information about the new policy.", opts: ["many", "a few", "a great deal of", "several"], a: "a great deal of", why: "information 은 셀 수 없는 명사이므로 a great deal of 를 씁니다." },
        { q: "The manager requested ____ of the signed contract.", opts: ["two copies", "two copy", "a copies", "copies two"], a: "two copies", why: "copy 의 복수형은 y 를 i 로 바꾼 copies 입니다." },
        { q: "There are ____ employees in the Seoul office than in Busan.", opts: ["less", "fewer", "little", "much"], a: "fewer", why: "셀 수 있는 복수 명사 employees 에는 fewer 를 씁니다." },
        { q: "Our warehouse stores ____ boxes of stationery.", opts: ["a", "an", "the", "many"], a: "many", why: "셀 수 있는 복수 명사 boxes 앞에는 many 를 씁니다." },
        { q: "The report includes an ____ of the survey results.", opts: ["analysis", "analyse", "analyses", "analyzed"], a: "analysis", why: "관사 an 뒤에는 명사가 필요하고, 분석이라는 뜻의 명사는 analysis 입니다." }
      ]
    },
    {
      no: 4,
      title: "대명사와 소유 표현",
      intro: "이메일 지문에서 대명사가 누구를 가리키는지 묻는 문제가 자주 나옵니다. 격(주격·목적격·소유격)을 표로 익히고, 지문에서 대명사를 만나면 지시 대상을 되짚는 습관을 들이세요.",
      summary: "대명사는 반복되는 명사를 대신합니다. 주격·목적격·소유격·소유대명사를 구분하고, 가리키는 명사와 수를 일치시켜 씁니다.",
      points: [
        {
          h: "인칭대명사 표",
          body: "주어 자리에는 주격, 동사나 전치사의 목적어 자리에는 목적격을 씁니다. 소유격은 명사 앞에서 소유를 표시하고, 소유대명사는 명사 없이 단독으로 씁니다.",
          table: {
            head: ["주격", "목적격", "소유격", "소유대명사"],
            rows: [
              ["I", "me", "my", "mine"],
              ["you", "you", "your", "yours"],
              ["he", "him", "his", "his"],
              ["she", "her", "her", "hers"],
              ["it", "it", "its", "its"],
              ["we", "us", "our", "ours"],
              ["they", "them", "their", "theirs"]
            ]
          },
          note: "its 는 소유격이고 it's 는 it is 의 축약형입니다. 소유의 뜻이면 its 를 씁니다."
        },
        {
          h: "격을 고르는 자리",
          note: "전치사 뒤에는 목적격이 옵니다. between you and me 처럼 두 개가 오면 둘 다 목적격입니다.",
          body: "빈칸이 주어 자리인지 목적어 자리인지부터 확인합니다. 동사나 전치사 뒤는 목적격, 명사 바로 앞은 소유격입니다.",
          table: {
            head: ["자리", "쓰는 격", "예문"],
            rows: [
              ["문장의 주어", "주격", "She approved the request."],
              ["동사의 목적어", "목적격", "The manager called her."],
              ["전치사의 목적어", "목적격", "This is for them."],
              ["명사 앞", "소유격", "their budget"],
              ["명사 없이 단독", "소유대명사", "The decision is theirs."]
            ]
          }
        },
        {
          h: "소유격과 소유대명사 구분",
          note: "its 와 it's 를 구분하세요. its 는 소유격, it's 는 it is 의 축약형입니다.",
          body: "소유격은 반드시 뒤에 명사가 오고, 소유대명사는 명사 없이 단독으로 씁니다. 같은 뜻이라도 뒤에 명사가 있으면 소유격, 없으면 소유대명사입니다.",
          examples: [
            { en: "Our office moved to the tenth floor.", ko: "우리 사무실은 10층으로 이사했습니다." },
            { en: "The proposal on the desk is ours.", ko: "책상 위의 제안서는 우리 것입니다." },
            { en: "This is my schedule; where is yours?", ko: "이것은 제 일정입니다. 당신 것은 어디에 있나요?" }
          ]
        },
        {
          h: "재귀대명사 — myself, yourself",
          body: "주어와 목적어가 같을 때 재귀대명사를 씁니다. by oneself는 혼자서, enjoy oneself는 즐기다라는 뜻으로 자주 쓰입니다.",
          table: {
            head: ["주어", "재귀대명사", "예문"],
            rows: [
              ["I", "myself", "I taught myself the software."],
              ["you", "yourself", "Please help yourself to the brochures."],
              ["he / she", "himself / herself", "The director introduced himself."],
              ["it", "itself", "The machine shuts itself down."],
              ["we", "ourselves", "We handled the clients ourselves."],
              ["they", "themselves", "The interns organized the event themselves."]
            ]
          },
          note: "theirselves, themself 는 표준 표기가 아닙니다. 복수에는 themselves 를 씁니다."
        },
        {
          h: "지시대명사와 비인칭 it",
          body: "this와 these는 가까운 것, that과 those는 먼 것을 가리킵니다. it은 날씨, 시간, 거리처럼 특정 대상을 가리키지 않는 문장에서도 씁니다.",
          examples: [
            { en: "These are the documents you requested.", ko: "이것들이 요청하신 서류입니다." },
            { en: "It is raining outside.", ko: "밖에 비가 오고 있습니다." },
            { en: "It takes about twenty minutes to reach the airport.", ko: "공항까지 가는 데 약 20분이 걸립니다." }
          ],
          note: "전화나 문 앞에서 상대가 누구인지 물을 때도 it 을 씁니다. Who is it?"
        },
        {
          h: "대명사와 선행사의 일치",
          note: "everyone, each 는 형태가 여럿을 가리키지만 단수로 취급해 대명사도 단수로 받습니다.",
          body: "대명사는 가리키는 명사(선행사)와 수에서 일치해야 합니다. 단수 명사는 it, its, 복수 명사는 they, their, them을 씁니다.",
          table: {
            head: ["선행사", "대명사", "예문"],
            rows: [
              ["단수 사물", "it / its", "The invoice was sent, and its copy is filed."],
              ["복수 명사", "they / their / them", "The employees submitted their timesheets."],
              ["집합 명사 staff", "they (구성원)", "The staff said they preferred the new system."],
              ["회사명", "it / they", "The firm announced its new policy."]
            ]
          }
        }
      ],
      mistakes: [
        "Between you and I 처럼 전치사 뒤에 주격을 쓰는 실수 — 목적격 me 를 씁니다.",
        "소유대명사와 소유격을 섞는 실수 — This book is my. 가 아니라 This book is mine. 입니다.",
        "its 와 it's 를 혼동하는 실수 — The company changed it's policy. 가 아니라 its policy 입니다.",
        "재귀대명사를 잘못 만드는 실수 — theirselves, themself 대신 themselves 를 씁니다.",
        "대명사와 선행사의 수를 맞추지 않는 실수 — 복수 명사를 받을 때는 their 를 씁니다."
      ],
      practice: [
        { q: "The contract is between the client and ____.", opts: ["I", "me", "my", "mine"], a: "me", why: "전치사 between 뒤에는 목적격 me 를 씁니다." },
        { q: "That laptop is not mine. ____ is in the drawer.", opts: ["My", "Me", "Mine", "Myself"], a: "Mine", why: "명사 없이 소유를 나타내므로 소유대명사 Mine 을 씁니다." },
        { q: "All employees should submit the form ____.", opts: ["themselves", "theirselves", "themself", "them"], a: "themselves", why: "주어와 목적어가 같고 복수이므로 재귀대명사 themselves 를 씁니다. theirselves 는 틀린 표기입니다." },
        { q: "The accounting team updated ____ internal guidelines.", opts: ["it", "its", "it's", "their's"], a: "its", why: "단수로 보는 집합 명사 The accounting team 의 소유격은 its 입니다." },
        { q: "Ms. Kim will present ____ findings at the conference.", opts: ["she", "her", "hers", "herself"], a: "her", why: "명사 findings 앞이므로 소유격 her 를 씁니다." },
        { q: "Please send the revised draft to ____ before noon.", opts: ["I", "me", "my", "mine"], a: "me", why: "전치사 to 뒤의 목적어 자리이므로 목적격 me 를 씁니다." },
        { q: "The new policy is ____ responsibility, not ours.", opts: ["they", "them", "their", "theirs"], a: "their", why: "명사 responsibility 를 꾸미는 소유격 their 가 필요합니다." },
        { q: "The staff completed the inventory ____ without extra help.", opts: ["himself", "itself", "themselves", "yourself"], a: "themselves", why: "주어 The staff 와 목적어가 같고 복수로 보므로 themselves 를 씁니다." }
      ]
    },
    {
      no: 5,
      title: "현재시제와 현재진행형",
      intro: "시제 문제는 now·every day 처럼 언제를 알려 주는 표현과 함께 나옵니다. 두 시제의 쓰임을 나란히 익혀 두면 Part 5에서 문장을 끝까지 읽지 않고도 답을 고를 수 있습니다.",
      summary: "현재시제는 반복되는 습관과 일반적인 사실을, 현재진행형은 지금 이 순간 진행 중인 일을 나타냅니다.",
      points: [
        {
          h: "두 시제의 쓰임 비교",
          note: "시간표에 적힌 미래 일정도 현재시제로 씁니다. The train leaves at six. 처럼요.",
          body: "현재시제는 늘 그런 일, 일정표처럼 정해진 일에 씁니다. 현재진행형(be + -ing)은 말하는 순간 진행 중이거나 일시적으로 벌어지는 일에 씁니다.",
          table: {
            head: ["구분", "형태", "쓰는 상황", "예문"],
            rows: [
              ["현재시제", "동사(원형 / -s)", "습관, 일반 사실, 일정", "The store opens at nine."],
              ["현재진행형", "am / is / are + -ing", "지금 진행 중, 일시적", "The manager is talking on the phone."],
              ["현재시제(부정)", "do / does + not + 동사원형", "습관·일반 사실의 부정", "The store does not open on Sundays."],
              ["현재진행형(부정)", "am / is / are + not + -ing", "지금 하고 있지 않음", "The manager is not answering the phone."]
            ]
          }
        },
        {
          h: "현재진행형 만드는 법 — -ing 철자",
          note: "e 로 끝나면 e 를 빼고 -ing 를 붙입니다. make 는 making 이 됩니다.",
          body: "be동사 뒤에 동사의 -ing형을 붙입니다. 동사 끝 철자에 따라 -ing 를 붙이는 방식이 조금씩 다릅니다.",
          table: {
            head: ["동사 끝", "규칙", "예"],
            rows: [
              ["일반", "-ing", "work → working"],
              ["묵음 e", "e 를 빼고 -ing", "write → writing, make → making"],
              ["단모음 + 단자음", "자음을 겹치고 -ing", "run → running, plan → planning"],
              ["-ie", "ie → y + -ing", "lie → lying, die → dying"],
              ["-ee / -oe / -ye", "그대로 -ing", "agree → agreeing"]
            ]
          }
        },
        {
          h: "시제와 함께 쓰는 표현",
          note: "시간 표현을 먼저 찾으면 해석 없이 답을 고를 수 있습니다. every day 가 보이면 현재시제입니다.",
          body: "every day, always, usually는 현재시제와, now, at the moment, currently는 현재진행형과 함께 씁니다. 시간 표현을 단서로 답을 빠르게 고를 수 있습니다.",
          table: {
            head: ["시제", "함께 자주 쓰는 표현"],
            rows: [
              ["현재시제", "every day, on Mondays, usually, always, in general"],
              ["현재진행형", "now, right now, at the moment, currently, this week"],
              ["현재진행형(이번 기간)", "these days, this month, for the time being"],
              ["조심할 조합", "now 와 현재시제, every day 와 현재진행형"]
            ]
          },
          examples: [
            { en: "We process orders every morning.", ko: "우리는 매일 아침 주문을 처리합니다." },
            { en: "She is reviewing the report at the moment.", ko: "그녀는 지금 보고서를 검토하고 있습니다." }
          ]
        },
        {
          h: "진행형으로 쓰지 않는 상태동사",
          body: "know, believe, belong, contain, need 같은 상태동사는 진행형으로 쓰지 않습니다. 상태에는 진행의 개념이 없기 때문입니다.",
          table: {
            head: ["분류", "동사", "예문"],
            rows: [
              ["감각·인식", "know, believe, understand", "I know the answer."],
              ["소유·포함", "have, belong, contain", "This file belongs to the accounting team."],
              ["감정·선호", "like, want, prefer", "She prefers morning meetings."],
              ["상태", "need, cost, weigh", "The repair costs two hundred dollars."]
            ]
          },
          note: "have 는 소유를 나타낼 때 진행형을 쓰지 않지만, have lunch 처럼 동작이면 having lunch 로 씁니다."
        },
        {
          h: "뜻이 달라지는 동사",
          note: "have 도 진행형이 되면 뜻이 달라집니다. She is having lunch 는 점심을 먹는 중이라는 뜻입니다.",
          body: "같은 동사라도 진행형이 되면 뜻이 달라지는 경우가 있습니다. 문맥에 맞는 뜻을 고르는 문제가 자주 나옵니다.",
          table: {
            head: ["동사", "현재시제 뜻", "진행형 뜻"],
            rows: [
              ["think", "생각하다", "고민하고 있다"],
              ["have", "소유하다", "먹다, 경험하다"],
              ["look", "보이다", "쳐다보고 있다"],
              ["see", "보다, 알다", "만나고 있다"]
            ]
          },
          examples: [
            { en: "I think the plan is solid.", ko: "저는 그 계획이 탄탄하다고 생각합니다." },
            { en: "She is thinking about the offer.", ko: "그녀는 그 제안을 고민하고 있습니다." }
          ]
        }
      ],
      mistakes: [
        "I am knowing the answer. 처럼 상태동사를 진행형으로 쓰는 실수 — I know 로 씁니다.",
        "지금 하는 일인데 현재시제를 쓰는 실수 — 진행 중이면 be + -ing 를 씁니다.",
        "write, make 처럼 묵음 e 로 끝나는 동사에 e 를 남기는 실수 — writing, making 입니다.",
        "단모음 + 단자음 동사의 자음을 겹치지 않는 실수 — runing 이 아니라 running 입니다.",
        "습관을 나타낼 때 현재진행형을 쓰는 실수 — every day 와 함께면 현재시제를 씁니다."
      ],
      practice: [
        { q: "The office ____ at eight o'clock every weekday.", opts: ["open", "opens", "is opening", "opened"], a: "opens", why: "every weekday 는 반복되는 일정이므로 현재시제 opens 를 씁니다." },
        { q: "Please do not call now. The team ____ the quarterly results.", opts: ["discusses", "discuss", "is discussing", "discussed"], a: "is discussing", why: "now 시점에 진행 중인 일이므로 현재진행형을 씁니다." },
        { q: "This manual ____ to the equipment on the second floor.", opts: ["is belonging", "belongs", "belong", "belonging"], a: "belongs", why: "belong 은 상태동사이므로 진행형 대신 현재시제를 씁니다." },
        { q: "Ms. Lee ____ the branch this week while the manager is away.", opts: ["runs", "is running", "run", "ran"], a: "is running", why: "이번 주 동안 일시적으로 맡은 일이므로 현재진행형을 씁니다." },
        { q: "Our suppliers ____ delivery on all orders over one hundred dollars.", opts: ["offers", "offer", "is offering", "offering"], a: "offer", why: "복수 주어 Our suppliers 에는 원형 offer 를 씁니다." },
        { q: "The new software ____ three languages at the moment.", opts: ["support", "supports", "is supporting", "supported"], a: "supports", why: "일반적인 기능을 말하는 현재시제이므로 supports 를 씁니다." },
        { q: "Please be quiet. The director ____ a client in the conference room.", opts: ["meets", "is meeting", "meet", "met"], a: "is meeting", why: "지금 진행 중인 만남이므로 현재진행형 is meeting 을 씁니다." },
        { q: "I ____ that the revised schedule works better for everyone.", opts: ["am thinking", "think", "thinking", "thinks"], a: "think", why: "생각하다라는 상태를 나타내므로 현재시제 think 를 씁니다." }
      ]
    },
    {
      no: 6,
      title: "과거시제와 과거진행형",
      intro: "불규칙 동사는 외운 만큼 바로 점수가 됩니다. 규칙 동사의 -ed 철자와 발음, 불규칙 동사의 네 가지 유형을 표로 익히고, 지문에서 시제가 바뀌는 지점(날짜·시간 표현)을 표시하며 읽어 보세요.",
      summary: "과거시제는 끝난 일을, 과거진행형은 과거의 어느 시점에 진행 중이던 일을 나타냅니다. 규칙 동사는 -ed를 붙이고, 불규칙 동사는 형태가 완전히 바뀝니다.",
      points: [
        {
          h: "규칙 동사의 과거형 — -ed 철자 규칙",
          note: "자음 + y 로 끝나면 y 를 i 로 바꾸고 -ed 를 붙입니다. study 는 studied 가 됩니다.",
          body: "대부분의 동사는 원형 뒤에 -ed를 붙여 과거형을 만듭니다. 동사 끝 철자에 따라 붙이는 방식이 달라지므로, 자주 쓰는 규칙을 먼저 익혀 둡니다. 과거분사도 규칙 동사는 같은 -ed 형태입니다.",
          table: {
            head: ["동사 끝", "규칙", "예"],
            rows: [
              ["일반", "-ed", "work → worked, start → started"],
              ["묵음 e", "d 만 붙임", "arrive → arrived, decide → decided"],
              ["자음 + y", "y → i + -ed", "study → studied, apply → applied"],
              ["모음 + y", "그대로 -ed", "play → played, stay → stayed"],
              ["단모음 + 단자음", "자음을 겹치고 -ed", "plan → planned, stop → stopped"],
              ["-l 로 끝남", "-led (미국식)", "travel → traveled, cancel → canceled"]
            ]
          }
        },
        {
          h: "-ed 의 발음 3가지",
          body: "과거형의 -ed는 세 가지로 발음됩니다. 목소리가 나가지 않는 소리 뒤에서는 /t/, 나는 소리 뒤에서는 /d/, t나 d 뒤에서는 /id/로 발음합니다. 소리로 익히면 듣기에서 시제를 놓치지 않습니다.",
          table: {
            head: ["발음", "앞 소리", "예"],
            rows: [
              ["/t/", "무성음 (p, k, f, s, ch, sh)", "worked, stopped, watched"],
              ["/d/", "유성음 (모음, b, g, m, n, l, r)", "played, moved, opened"],
              ["/id/", "t / d", "wanted, needed, decided"]
            ]
          },
          note: "t 나 d 로 끝나는 동사만 -ed 를 한 음절로 따로 발음합니다. wanted 는 두 음절입니다."
        },
        {
          h: "불규칙 동사의 네 가지 유형",
          note: "유형을 알아 두면 처음 보는 동사도 어느 묶음에 속하는지 짐작할 수 있습니다.",
          body: "불규칙 동사는 원형·과거형·과거분사가 어떻게 달라지는지에 따라 네 유형으로 나눌 수 있습니다. 유형을 알고 묶어서 외우면 개별로 외우는 것보다 오래 기억합니다.",
          table: {
            head: ["유형", "형태", "예 (원형 / 과거 / 과거분사)"],
            rows: [
              ["AAA", "세 형태가 모두 같음", "cut / cut / cut, put / put / put"],
              ["ABB", "과거형 = 과거분사", "make / made / made, buy / bought / bought"],
              ["ABA", "원형 = 과거분사", "come / came / come, run / ran / run"],
              ["ABC", "세 형태가 모두 다름", "go / went / gone, write / wrote / written"]
            ]
          }
        },
        {
          h: "자주 쓰는 불규칙 동사 45선",
          body: "토익·비즈니스 지문에 반복해서 나오는 불규칙 동사를 원형·과거형·과거분사와 함께 묶었습니다. 소리 내어 세 번씩 읽고, 표를 덮은 채 과거형을 되짚어 보세요.",
          table: {
            head: ["원형", "과거형", "과거분사", "뜻"],
            rows: [
              ["be", "was / were", "been", "있다, 이다"],
              ["have", "had", "had", "가지다"],
              ["do", "did", "done", "하다"],
              ["go", "went", "gone", "가다"],
              ["come", "came", "come", "오다"],
              ["make", "made", "made", "만들다"],
              ["take", "took", "taken", "잡다, 가져가다"],
              ["get", "got", "gotten / got", "얻다"],
              ["give", "gave", "given", "주다"],
              ["see", "saw", "seen", "보다"],
              ["know", "knew", "known", "알다"],
              ["think", "thought", "thought", "생각하다"],
              ["say", "said", "said", "말하다"],
              ["tell", "told", "told", "알려주다"],
              ["find", "found", "found", "찾다"],
              ["leave", "left", "left", "떠나다, 남기다"],
              ["feel", "felt", "felt", "느끼다"],
              ["keep", "kept", "kept", "계속하다, 보관하다"],
              ["hold", "held", "held", "잡다, 개최하다"],
              ["bring", "brought", "brought", "가져오다"],
              ["buy", "bought", "bought", "사다"],
              ["send", "sent", "sent", "보내다"],
              ["spend", "spent", "spent", "쓰다, 보내다"],
              ["build", "built", "built", "짓다"],
              ["meet", "met", "met", "만나다"],
              ["pay", "paid", "paid", "지불하다"],
              ["sell", "sold", "sold", "팔다"],
              ["teach", "taught", "taught", "가르치다"],
              ["catch", "caught", "caught", "잡다"],
              ["write", "wrote", "written", "쓰다"],
              ["speak", "spoke", "spoken", "말하다"],
              ["break", "broke", "broken", "깨다"],
              ["choose", "chose", "chosen", "고르다"],
              ["drive", "drove", "driven", "운전하다"],
              ["grow", "grew", "grown", "자라다"],
              ["begin", "began", "begun", "시작하다"],
              ["stand", "stood", "stood", "서다"],
              ["understand", "understood", "understood", "이해하다"],
              ["lose", "lost", "lost", "잃다"],
              ["run", "ran", "run", "달리다"],
              ["read", "read", "read", "읽다"],
              ["set", "set", "set", "놓다, 정하다"],
              ["put", "put", "put", "놓다"],
              ["cut", "cut", "cut", "자르다"],
              ["cost", "cost", "cost", "비용이 들다"]
            ]
          },
          note: "get 은 미국식 과거분사로 gotten 을 쓰고, 영국식은 got 을 씁니다. read 는 과거형도 철자가 같지만 발음이 /red/ 로 바뀝니다."
        },
        {
          h: "부정문과 의문문 — did",
          body: "일반동사 과거의 부정문과 의문문에는 did를 씁니다. did가 시제를 대신하므로 본동사는 원형으로 돌아옵니다. 불규칙 동사도 did 뒤에서는 원형을 씁니다.",
          table: {
            head: ["형식", "구조", "예문"],
            rows: [
              ["부정문", "did not + 원형", "I did not finish the draft yesterday."],
              ["부정 축약", "didn't + 원형", "They didn't attend the briefing."],
              ["의문문", "Did + 주어 + 원형?", "Did you receive the updated schedule?"],
              ["짧은 대답", "Yes / No + 주어 + did", "Yes, I did. / No, she didn't."]
            ]
          },
          note: "Did you received it? 는 틀린 문장입니다. did 뒤에는 반드시 원형 receive 를 씁니다."
        },
        {
          h: "과거진행형 — was / were + -ing",
          note: "진행형에는 진행 중이던 시간 표현(at noon, all morning)이 함께 오는 경우가 많습니다.",
          body: "과거의 한 시점에 진행 중이던 일을 말합니다. was는 단수 주어에, were는 복수 주어와 you에 씁니다.",
          table: {
            head: ["주어", "형태", "예문"],
            rows: [
              ["I / He / She / It", "was + -ing", "I was preparing the report."],
              ["You / We / They", "were + -ing", "They were waiting in the lobby."],
              ["부정문", "wasn't / weren't + -ing", "She wasn't answering her phone."],
              ["의문문", "Was / Were + 주어 + -ing?", "Were you working from home yesterday?"]
            ]
          },
          examples: [
            { en: "They were waiting in the lobby at noon.", ko: "그들은 정오에 로비에서 기다리고 있었습니다." },
            { en: "I was preparing the report when the client called.", ko: "고객이 전화했을 때 저는 보고서를 준비하고 있었습니다." }
          ]
        },
        {
          h: "과거시제와 과거진행형을 함께 쓰기",
          note: "while 뒤에는 진행형, when 뒤에는 과거시제가 오는 짝을 기억해 두면 빈칸이 빨리 풀립니다.",
          body: "과거진행형과 과거시제를 함께 쓰면, 진행 중이던 일(배경)과 끼어든 일(사건)을 구분할 수 있습니다. 배경에는 while, 끼어든 일에는 when을 주로 씁니다.",
          table: {
            head: ["접속사", "역할", "예문"],
            rows: [
              ["when", "끼어든 짧은 사건", "The power went out when we were presenting."],
              ["while", "진행 중이던 배경", "While they were talking, the printer stopped."],
              ["as", "동시에 일어난 일", "She smiled as she opened the letter."]
            ]
          },
          examples: [
            { en: "The team was working late when the server crashed.", ko: "서버가 멈췄을 때 그 팀은 늦게까지 일하고 있었습니다." },
            { en: "While the manager was reviewing the file, the phone rang.", ko: "부장님이 서류를 검토하는 동안 전화가 울렸습니다." }
          ]
        }
      ],
      mistakes: [
        "Did you received it? 처럼 did 뒤에 과거형을 또 쓰는 실수 — did 뒤에는 원형을 씁니다.",
        "I was go to the meeting. 처럼 진행형에 원형을 쓰는 실수 — was going 이 맞습니다.",
        "goed, buyed, teached 처럼 불규칙 동사에 -ed 를 붙이는 실수 — went, bought, taught 입니다.",
        "단모음 + 단자음 동사의 자음을 겹치지 않는 실수 — planed 가 아니라 planned 입니다.",
        "yesterday 와 현재완료를 함께 쓰는 실수 — 끝난 과거 시점에는 과거시제를 씁니다."
      ],
      practice: [
        { q: "The shipment ____ yesterday afternoon.", opts: ["arrive", "arrived", "arrives", "arriving"], a: "arrived", why: "yesterday afternoon 은 끝난 과거 시점이므로 과거형 arrived 를 씁니다." },
        { q: "____ the supplier confirm the delivery date?", opts: ["Did", "Does", "Was", "Were"], a: "Did", why: "일반동사 confirm 의 과거 의문문이므로 did 를 씁니다." },
        { q: "We ____ the presentation when the power went out.", opts: ["gave", "were giving", "give", "have given"], a: "were giving", why: "전원이 나간 순간 진행 중이던 일이므로 과거진행형을 씁니다." },
        { q: "Ms. Han ____ the report to the client last Friday.", opts: ["sends", "sent", "was sending", "has sent"], a: "sent", why: "last Friday 는 끝난 과거 시점이고 send 의 과거형은 sent 입니다." },
        { q: "The team ____ the new vendor before signing the contract.", opts: ["choose", "chose", "chosen", "choosing"], a: "chose", why: "과거의 동작이므로 choose 의 과거형 chose 를 씁니다." },
        { q: "I ____ the manual twice before calling support.", opts: ["read", "reads", "reading", "was read"], a: "read", why: "read 는 과거형도 철자가 같으며 발음이 /red/ 입니다." },
        { q: "The engineers ____ the prototype all night before the deadline.", opts: ["test", "tested", "were testing", "has tested"], a: "were testing", why: "밤새 계속되던 진행을 강조하므로 과거진행형을 씁니다." },
        { q: "The receptionist ____ the meeting room when the guests arrived.", opts: ["prepares", "prepared", "was preparing", "prepare"], a: "was preparing", why: "손님이 도착한 순간 진행 중이던 일이므로 과거진행형을 씁니다." }
      ]
    },
    {
      no: 7,
      title: "조동사 기초",
      intro: "조동사 뒤에는 언제나 동사 원형이 온다는 규칙 하나로 Part 5 문항을 바로 풀 수 있습니다. have to 와 must 의 뉘앙스 차이까지 익혀 두면 어휘 문제에서도 답이 좁혀집니다.",
      summary: "조동사는 동사 앞에서 능력, 허가, 의무, 추천을 나타냅니다. 조동사 뒤에는 언제나 동사 원형이 오고, 3인칭 단수라도 -s를 붙이지 않습니다.",
      points: [
        {
          h: "조동사의 기본 규칙",
          body: "can, may, must, should, will은 조동사입니다. 조동사 뒤에는 동사 원형이 오고, 3인칭 단수라도 -s를 붙이지 않습니다. 조동사에는 to를 붙이지 않고, do를 함께 쓰지도 않습니다.",
          table: {
            head: ["조동사", "의미", "예문"],
            rows: [
              ["can", "할 수 있다, 허가", "I can attend the meeting."],
              ["could", "할 수 있었다, 정중한 요청", "Could you send the file?"],
              ["may", "해도 된다, 그럴지도 모른다", "You may leave early today."],
              ["might", "그럴지도 모른다", "The client might call later."],
              ["must", "반드시 해야 한다", "All staff must wear a badge."],
              ["should", "하는 것이 좋다", "You should review the figures."],
              ["will", "할 것이다", "The shipment will arrive tomorrow."]
            ]
          },
          note: "조동사 뒤에 be 나 have 가 오면 원형 그대로 씁니다. will be, must have 처럼 씁니다."
        },
        {
          h: "능력·허가·요청 — can / could / may",
          body: "능력은 can, 과거의 능력은 could로 나타냅니다. 허가를 구할 때는 Can I, May I를 쓰고, May I가 더 격식 있습니다.",
          examples: [
            { en: "She can handle three projects at once.", ko: "그녀는 한 번에 세 개의 프로젝트를 처리할 수 있습니다." },
            { en: "May I use the conference room this afternoon?", ko: "오늘 오후에 회의실을 써도 될까요?" },
            { en: "We could not access the system yesterday.", ko: "우리는 어제 시스템에 접속할 수 없었습니다." }
          ],
          note: "허가를 구하는 could 는 정중한 표현이지만, 허락 자체를 줄 때는 can 을 씁니다."
        },
        {
          h: "의무와 필요 — must / have to / should",
          note: "have to 는 시제와 인칭에 따라 has to, had to 로 바뀝니다. must 는 형태가 변하지 않습니다.",
          body: "must는 말하는 사람의 강한 의무, have to는 규칙이나 상황 때문에 생기는 의무를 나타냅니다. should는 의무보다 약한 권고입니다.",
          table: {
            head: ["표현", "뜻", "예문"],
            rows: [
              ["must", "반드시 해야 한다(강한 의무)", "Employees must wear a badge."],
              ["have to", "해야 한다(상황에 따른 의무)", "I have to submit the report today."],
              ["should", "하는 것이 좋다(권고)", "You should back up the files."],
              ["had to", "과거에 해야 했다", "We had to cancel the order."]
            ]
          }
        },
        {
          h: "must not 과 do not have to 의 차이",
          body: "이 두 표현은 뜻이 정반대라 시험에서 자주 비교됩니다. must not은 금지, do not have to는 필요 없음입니다.",
          table: {
            head: ["형식", "의미", "예문"],
            rows: [
              ["must not", "하면 안 된다(금지)", "You must not share the password."],
              ["do not have to", "할 필요가 없다", "You do not have to work on Sunday."],
              ["should not", "하지 않는 것이 좋다(권고)", "You should not skip the checklist."],
              ["did not have to", "할 필요가 없었다", "We did not have to file a claim."]
            ]
          },
          note: "must 의 과거는 musted 가 아니라 had to 입니다."
        },
        {
          h: "조동사의 부정문과 의문문",
          note: "조동사 의문문에는 do 를 쓰지 않습니다. Does she can 은 틀린 문장입니다.",
          body: "부정문은 조동사 뒤에 not을 붙이고, 의문문은 조동사를 주어 앞으로 보냅니다. do를 따로 쓰지 않습니다.",
          table: {
            head: ["형식", "구조", "예문"],
            rows: [
              ["부정문", "조동사 + not + 원형", "We cannot accept late applications."],
              ["축약", "can't / won't / shouldn't", "She won't attend the workshop."],
              ["의문문", "조동사 + 주어 + 원형?", "Can you check the figures?"],
              ["의문사 의문문", "의문사 + 조동사 + 주어 + 원형?", "When should we submit the form?"]
            ]
          },
          examples: [
            { en: "We cannot accept late applications.", ko: "우리는 늦은 지원서를 받을 수 없습니다." },
            { en: "Could you send the file by noon?", ko: "정오까지 파일을 보내 주시겠어요?" }
          ]
        },
        {
          h: "정중한 요청과 제안",
          note: "Would you mind 뒤에는 동명사를 씁니다. Would you mind sending it? 처럼요.",
          body: "Could you, Would you는 부탁할 때, Shall we, Why don't we는 제안할 때 씁니다. 정중함의 정도가 달라 상황에 맞게 고릅니다.",
          table: {
            head: ["표현", "쓰임", "예문"],
            rows: [
              ["Can you ~?", "가장 일상적인 부탁", "Can you take a message?"],
              ["Could you ~?", "정중한 부탁", "Could you confirm the date?"],
              ["Would you like ~?", "권유", "Would you like a copy?"],
              ["Shall we ~?", "함께 하자는 제안", "Shall we start the review?"]
            ]
          },
          examples: [
            { en: "Would you like to join the call?", ko: "통화에 참여하시겠어요?" },
            { en: "Shall we move the meeting to Thursday?", ko: "회의를 목요일로 옮길까요?" }
          ]
        }
      ],
      mistakes: [
        "He can speaks English. 처럼 조동사 뒤에 -s 를 붙이는 실수 — 조동사 뒤는 항상 원형입니다.",
        "Do you can help me? 처럼 do 와 조동사를 겹치는 실수 — Can you help me? 입니다.",
        "must 뒤에 to 를 붙이는 실수 — must to go 가 아니라 must go 입니다.",
        "must 의 과거로 musted 를 쓰는 실수 — had to 를 씁니다.",
        "must not 과 do not have to 를 같은 뜻으로 쓰는 실수 — 금지와 필요 없음은 정반대입니다."
      ],
      practice: [
        { q: "Visitors ____ sign in at the front desk before entering.", opts: ["must", "musts", "must to", "musting"], a: "must", why: "조동사 must 뒤에는 동사 원형 sign 이 오고, to 나 -s 를 붙이지 않습니다." },
        { q: "You ____ not park in the loading zone at any time.", opts: ["must", "should", "can", "may"], a: "must", why: "금지를 나타내는 가장 강한 표현은 must not 입니다." },
        { q: "____ you help me prepare the documents this morning?", opts: ["Do", "Are", "Could", "Did"], a: "Could", why: "정중한 요청에는 조동사 Could 를 주어 앞에 둡니다. Do 나 Are 를 함께 쓰지 않습니다." },
        { q: "Employees ____ complete the safety training before starting work.", opts: ["have to", "has to", "having to", "to have"], a: "have to", why: "복수 주어 Employees 에 맞는 형태는 have to 입니다." },
        { q: "You ____ print the whole file; a summary is enough.", opts: ["must not", "do not have to", "cannot", "should not"], a: "do not have to", why: "인쇄할 필요가 없다는 뜻이므로 do not have to 를 씁니다." },
        { q: "The client ____ arrive before noon, so we prepared early.", opts: ["must", "had to", "musted", "have to"], a: "had to", why: "과거의 의무는 had to 로 나타냅니다." },
        { q: "____ I leave a message for the manager?", opts: ["May", "Am", "Do", "Did"], a: "May", why: "허가를 구하는 격식 있는 표현은 May I 입니다." },
        { q: "The team ____ finish the draft by Friday if the data arrives on time.", opts: ["will be able to", "can to", "will can", "cans"], a: "will be able to", why: "미래의 능력은 will be able to 로 나타냅니다. 조동사 will 뒤에 can 을 겹쳐 쓰지 않습니다." }
      ]
    },
    {
      no: 8,
      title: "형용사·부사와 비교 표현",
      intro: "형용사·부사 자리 판단은 Part 5 어형 문제의 절반입니다. 명사 앞이면 형용사, 동사 뒤면 부사라는 기준을 예문으로 확인하고, 비교급·최상급 틀까지 함께 익혀 두세요.",
      summary: "형용사는 명사를 꾸미고, 부사는 동사·형용사·문장 전체를 꾸밉니다. 비교급과 최상급으로 정도를 나타냅니다.",
      points: [
        {
          h: "형용사와 부사의 자리",
          note: "부사는 문장 어디에나 놓일 수 있지만 빈도 부사는 be동사 뒤, 일반동사 앞에 옵니다.",
          body: "형용사는 명사 앞이나 be동사 뒤에서 명사를 설명하고, 부사는 동사 뒤나 형용사 앞에서 동작의 방식을 설명합니다. 빈칸 앞뒤에 명사가 있으면 형용사, 동사가 있으면 부사입니다.",
          table: {
            head: ["자리", "품사", "예문"],
            rows: [
              ["명사 앞", "형용사", "a careful editor"],
              ["be동사 뒤", "형용사", "The editor is careful."],
              ["동사 뒤", "부사", "She edits the report carefully."],
              ["형용사 앞", "부사", "The machine is extremely reliable."]
            ]
          },
          examples: [
            { en: "She is a careful editor.", ko: "그녀는 꼼꼼한 편집자입니다." },
            { en: "She edits the report carefully.", ko: "그녀는 보고서를 꼼꼼하게 편집합니다." }
          ]
        },
        {
          h: "-ly 부사 만들기와 주의할 형태",
          body: "대부분의 형용사는 -ly를 붙여 부사가 되지만, 형태가 그대로인 경우와 뜻이 달라지는 경우가 있어 따로 익혀야 합니다.",
          table: {
            head: ["형용사", "부사", "비고"],
            rows: [
              ["quick", "quickly", "일반 규칙"],
              ["happy", "happily", "y 는 i 로"],
              ["true", "truly", "e 를 뺌"],
              ["fast", "fast", "형태가 같음"],
              ["hard", "hard", "형태가 같음"],
              ["good", "well", "완전히 다른 형태"],
              ["late", "late / lately", "lately 는 최근에라는 뜻"]
            ]
          },
          note: "hardly 는 거의 아니다라는 뜻으로 hard 와 의미가 다릅니다. He works hard. 와 He hardly works. 는 정반대입니다."
        },
        {
          h: "비교급과 최상급 만들기",
          body: "짧은 단어는 -er / -est를, 긴 단어는 more / most를 씁니다. 비교 대상이 있으면 최상급 앞에 the를 붙입니다.",
          table: {
            head: ["원급", "비교급", "최상급"],
            rows: [
              ["fast", "faster", "the fastest"],
              ["large", "larger", "the largest"],
              ["busy", "busier", "the busiest"],
              ["big", "bigger", "the biggest"],
              ["expensive", "more expensive", "the most expensive"],
              ["efficient", "more efficient", "the most efficient"],
              ["good", "better", "the best"],
              ["bad", "worse", "the worst"]
            ]
          },
          note: "good / better / best, bad / worse / worst 처럼 불규칙하게 바뀌는 단어는 그대로 익혀 둡니다."
        },
        {
          h: "비교 표현의 틀",
          note: "than 뒤에는 목적격도 올 수 있지만, 격식 있는 문서에서는 주격이 안전합니다.",
          body: "비교급 뒤에는 than을, 최상급 뒤에는 in 또는 of를 씁니다. as + 원급 + as는 두 대상이 같은 정도임을 나타내고, not as ~ as는 덜함을 나타냅니다.",
          table: {
            head: ["형식", "뜻", "예문"],
            rows: [
              ["비교급 + than", "~보다 더", "This model is cheaper than the previous one."],
              ["the + 최상급 + in", "범위 안에서 가장", "the busiest in the company"],
              ["as + 원급 + as", "~만큼", "The new printer is as fast as the old one."],
              ["not as + 원급 + as", "~만큼 하지는 않은", "The first draft was not as clear as the second."]
            ]
          },
          examples: [
            { en: "This model is cheaper than the previous one.", ko: "이 모델은 이전 모델보다 저렴합니다." },
            { en: "The Seoul office is the busiest in the company.", ko: "서울 사무소는 회사에서 가장 분주합니다." }
          ]
        },
        {
          h: "비교급을 강조하는 표현",
          body: "비교급 앞에 much, far, even, a lot을 붙여 차이를 강조합니다. 비교급을 두 번 쓰는 more cheaper 같은 형태는 틀립니다.",
          table: {
            head: ["표현", "예문"],
            rows: [
              ["much + 비교급", "The new route is much faster."],
              ["far + 비교급", "The revised plan is far more practical."],
              ["even + 비교급", "This week was even busier than last week."],
              ["a lot + 비교급", "The report is a lot shorter now."]
            ]
          },
          note: "very 는 비교급을 강조하지 못합니다. very cheaper 가 아니라 much cheaper 입니다."
        },
        {
          h: "-ed 와 -ing 형용사",
          note: "주어가 사람이면 -ed, 사물이면 -ing 가 기본입니다. 다만 a boring person 처럼 사람을 꾸밀 수도 있습니다.",
          body: "사람이 느끼는 감정은 -ed, 감정을 일으키는 대상은 -ing 형용사로 나타냅니다. 주어가 사람인지 사물인지로 빠르게 구분합니다.",
          table: {
            head: ["-ed (사람)", "-ing (사물)", "뜻"],
            rows: [
              ["interested", "interesting", "흥미로운"],
              ["confused", "confusing", "헷갈리는"],
              ["satisfied", "satisfying", "만족스러운"],
              ["tired", "tiring", "피곤하게 하는"]
            ]
          },
          examples: [
            { en: "The instructions were confusing to new staff.", ko: "그 지침은 신입 직원들에게 헷갈렸습니다." },
            { en: "The new staff were confused by the instructions.", ko: "신입 직원들은 그 지침 때문에 혼란스러웠습니다." }
          ]
        }
      ],
      mistakes: [
        "more cheaper 처럼 비교급을 두 번 쓰는 실수 — cheaper 또는 more expensive 하나만 씁니다.",
        "She works careful. 처럼 동사를 형용사로 꾸미는 실수 — 부사 carefully 를 씁니다.",
        "very cheaper 처럼 very 로 비교급을 강조하는 실수 — much cheaper, far cheaper 를 씁니다.",
        "hard 와 hardly 를 헷갈리는 실수 — hard 는 열심히, hardly 는 거의 아니다입니다.",
        "최상급 앞의 the 를 빠뜨리는 실수 — He is the most reliable member. 처럼 the 를 씁니다."
      ],
      practice: [
        { q: "This year's sales figures are ____ than last year's.", opts: ["high", "higher", "highest", "more high"], a: "higher", why: "than 이 있으므로 비교급 higher 를 씁니다. more high 는 틀린 형태입니다." },
        { q: "The new system is ____ expensive option we reviewed.", opts: ["more", "most", "the most", "the more"], a: "the most", why: "여러 선택지 중 하나를 최상급으로 말하므로 the most 를 씁니다." },
        { q: "Please review the contract ____ before signing it.", opts: ["careful", "carefully", "carefuly", "carefulness"], a: "carefully", why: "동사 review 를 꾸미는 부사 carefully 가 필요합니다." },
        { q: "The revised instructions are much ____ than the original.", opts: ["clear", "clearer", "clearest", "more clear"], a: "clearer", why: "much 로 강조된 비교급이 필요하므로 clearer 를 씁니다." },
        { q: "Ms. Oh is the ____ analyst in the department.", opts: ["reliable", "more reliable", "most reliable", "reliably"], a: "most reliable", why: "the 와 함께 쓰는 최상급이므로 most reliable 입니다." },
        { q: "The training session was so ____ that everyone stayed focused.", opts: ["interested", "interesting", "interest", "interestingly"], a: "interesting", why: "감정을 일으키는 대상이 주어이므로 -ing 형용사 interesting 을 씁니다." },
        { q: "Our delivery is as ____ as any competitor's in the region.", opts: ["fast", "faster", "fastest", "more fast"], a: "fast", why: "as 와 as 사이에는 원급 fast 를 씁니다." },
        { q: "The intern worked ____ to finish the audit on time.", opts: ["hard", "hardly", "harder", "hardness"], a: "hard", why: "열심히라는 뜻의 부사는 hard 입니다. hardly 는 거의 아니다입니다." }
      ]
    },
    {
      no: 9,
      title: "전치사와 시간·장소 표현",
      intro: "전치사는 규칙만 알면 가장 빨리 풀리는 문항입니다. at·on·in 표를 한 번 정리해 두면 일정·안내문 지문에서 시간 정보를 읽는 속도도 함께 올라갑니다.",
      summary: "전치사는 시간과 장소, 방향을 나타냅니다. 시각은 at, 날짜는 on, 월과 연도는 in을 씁니다.",
      points: [
        {
          h: "시간 전치사 at / on / in",
          body: "시각과 특정 시점은 at, 요일과 날짜는 on, 월·계절·연도·긴 기간은 in을 씁니다. 범위가 좁을수록 at, 넓을수록 in이라고 기억하면 편합니다.",
          table: {
            head: ["전치사", "쓰는 대상", "예문"],
            rows: [
              ["at", "시각, 정오·자정", "at 9 a.m., at noon"],
              ["at", "특정 시점·순간", "at the moment, at the end of the month"],
              ["on", "요일, 날짜", "on Monday, on May 5"],
              ["on", "특정한 날의 아침·저녁", "on Friday morning"],
              ["in", "월, 연도, 계절", "in June, in 2026, in winter"],
              ["in", "하루의 때, 긴 기간", "in the morning, in the long term"]
            ]
          },
          note: "마지막에 at the end, 기한은 by, 지속은 for 로 구분합니다."
        },
        {
          h: "기간과 기한 — for / since / by / until / during",
          body: "기간의 길이는 for, 시작점은 since, 완료 기한은 by, 상태가 계속되는 시점은 until, 특정 기간 동안은 during을 씁니다.",
          table: {
            head: ["전치사", "뜻", "예문"],
            rows: [
              ["for", "기간의 길이", "for three years"],
              ["since", "시작점", "since 2019"],
              ["by", "완료 기한", "by Friday"],
              ["until", "계속되는 시점", "until six o'clock"],
              ["during", "기간 중에", "during the meeting"],
              ["within", "그 기간 안에", "within two business days"]
            ]
          },
          note: "Submit it by Friday 는 금요일까지 제출, The office is open until six 는 6시까지 열려 있다는 뜻입니다."
        },
        {
          h: "장소 전치사 in / on / at",
          note: "교통수단은 on a bus, in a car 로 나뉩니다. 타는 자세가 달라서 전치사도 달라집니다.",
          body: "넓은 공간이나 도시·국가는 in, 표면이나 층은 on, 특정 지점은 at을 씁니다. 같은 장소라도 관점에 따라 달라집니다.",
          table: {
            head: ["전치사", "쓰는 대상", "예문"],
            rows: [
              ["in", "도시, 나라, 넓은 공간", "in Seoul, in the lobby"],
              ["on", "표면, 층, 교통수단", "on the third floor, on the bus"],
              ["at", "특정 지점, 건물 앞", "at the entrance, at the branch"],
              ["at", "행사·모임 장소", "at the conference"]
            ]
          },
          examples: [
            { en: "The head office is in Seoul.", ko: "본사는 서울에 있습니다." },
            { en: "The printer is on the third floor.", ko: "프린터는 3층에 있습니다." },
            { en: "I will meet you at the entrance.", ko: "입구에서 만나겠습니다." }
          ]
        },
        {
          h: "방향과 수단의 전치사",
          note: "by 는 교통·전달 수단에, with 는 도구에 씁니다. by email 과 with a pen 이 그 예입니다.",
          body: "이동의 방향과 수단, 도구를 나타내는 전치사도 자주 출제됩니다. 동사와 함께 굳어진 표현을 통째로 익히면 빠릅니다.",
          table: {
            head: ["전치사", "뜻", "예문"],
            rows: [
              ["to", "~로(방향)", "We drove to the warehouse."],
              ["into", "~안으로", "She walked into the office."],
              ["from", "~로부터", "The shipment arrived from Busan."],
              ["by", "수단·행위자", "sent by courier"],
              ["with", "도구·동반", "paid with a card"],
              ["without", "~없이", "without prior notice"]
            ]
          }
        },
        {
          h: "자주 쓰는 결합 표현",
          body: "전치사는 동사·형용사와 짝을 이루어 뜻이 정해지는 경우가 많습니다. 통째로 익히는 편이 빠릅니다.",
          table: {
            head: ["표현", "뜻"],
            rows: [
              ["depend on", "~에 달려 있다"],
              ["be responsible for", "~에 책임이 있다"],
              ["apply for", "~에 지원하다"],
              ["in charge of", "~을 담당하는"],
              ["be eligible for", "~을 받을 자격이 있다"],
              ["comply with", "~을 준수하다"],
              ["be satisfied with", "~에 만족하다"],
              ["look forward to", "~을 기대하다"]
            ]
          },
          note: "look forward to 의 to 는 전치사이므로 뒤에 동명사가 옵니다. look forward to hearing from you."
        },
        {
          h: "전치사구의 위치와 생략",
          body: "시간·장소 전치사구는 문장 끝에 두는 것이 일반적입니다. last, next, this, every 뒤에는 전치사를 쓰지 않습니다.",
          examples: [
            { en: "We will review the contract on Monday morning.", ko: "우리는 월요일 아침에 계약서를 검토할 것입니다." },
            { en: "The team meets every Monday in the main office.", ko: "그 팀은 매주 월요일 본사에서 만납니다." },
            { en: "Sales rose sharply last quarter.", ko: "지난 분기에 매출이 급격히 올랐습니다." }
          ],
          note: "next week, last year, this morning 앞에는 in, on, at 을 붙이지 않습니다."
        }
      ],
      mistakes: [
        "on 9 a.m. 처럼 시각에 on 을 쓰는 실수 — 시각에는 at 을 씁니다.",
        "since three years 처럼 기간에 since 를 쓰는 실수 — 기간에는 for, 시작점에는 since 를 씁니다.",
        "in next week 처럼 last, next, this 앞에 전치사를 붙이는 실수 — 전치사를 쓰지 않습니다.",
        "by 와 until 을 바꿔 쓰는 실수 — 기한은 by, 계속되는 시점은 until 입니다.",
        "look forward to 뒤에 원형을 쓰는 실수 — 전치사 to 뒤에는 동명사 hearing 이 옵니다."
      ],
      practice: [
        { q: "The orientation session begins ____ 10 a.m.", opts: ["in", "on", "at", "by"], a: "at", why: "시각 앞에는 at 을 씁니다." },
        { q: "We signed the agreement ____ March 3.", opts: ["in", "on", "at", "for"], a: "on", why: "특정 날짜 앞에는 on 을 씁니다." },
        { q: "Please submit the expense report ____ Friday.", opts: ["until", "by", "since", "for"], a: "by", why: "늦어도 그때까지라는 기한은 by 로 나타냅니다." },
        { q: "Our company has operated in this market ____ 2011.", opts: ["for", "since", "by", "during"], a: "since", why: "2011 은 시작점이므로 since 를 씁니다." },
        { q: "The maintenance team worked ____ the holiday to finish on time.", opts: ["during", "since", "until", "by"], a: "during", why: "특정 기간 동안이라는 뜻이므로 during 을 씁니다." },
        { q: "All visitors must comply ____ the safety regulations.", opts: ["to", "with", "for", "of"], a: "with", why: "comply with 는 규정을 준수하다라는 결합 표현입니다." },
        { q: "The new manager is responsible ____ the entire sales team.", opts: ["of", "for", "to", "with"], a: "for", why: "be responsible for 는 ~에 책임이 있다라는 뜻입니다." },
        { q: "We look forward to ____ your feedback on the proposal.", opts: ["receive", "receiving", "received", "receipt"], a: "receiving", why: "look forward to 의 to 는 전치사이므로 동명사 receiving 이 옵니다." }
      ]
    },
    {
      no: 10,
      title: "의문문과 부가의문문",
      intro: "Part 2는 질문의 형태를 알아야 응답이 보입니다. 의문사별로 무엇을 묻는지 정리해 두고, 부가의문문은 대답 방향까지 함께 익혀 두세요.",
      summary: "의문사로 구체적인 정보를 묻고, 부가의문문으로 상대의 동의를 구합니다.",
      points: [
        {
          h: "의문사별로 묻는 정보",
          body: "Who는 사람, What은 사물, When은 시간, Where는 장소, Why는 이유, How는 방법을 묻습니다. 의문사 뒤에는 의문문 어순이 이어집니다.",
          table: {
            head: ["의문사", "묻는 것", "예문"],
            rows: [
              ["Who", "사람", "Who wrote this memo?"],
              ["What", "사물, 직업", "What does the client need?"],
              ["When", "시간", "When does the store close?"],
              ["Where", "장소", "Where is the meeting room?"],
              ["Why", "이유", "Why was the order canceled?"],
              ["How", "방법·정도", "How do I reset the password?"]
            ]
          },
          note: "주어를 묻는 Who 는 의문사가 곧 주어이므로 Who wrote ~ 처럼 어순을 바꾸지 않습니다."
        },
        {
          h: "Yes / No 의문문 만드는 법",
          note: "의문문으로 바꿔 놓은 뒤에는 동사를 원형으로 돌려놓는 것을 잊지 마세요.",
          body: "be동사와 조동사는 주어 앞으로 보내고, 일반동사는 do, does, did를 주어 앞에 둡니다. 동사는 원형으로 돌아옵니다.",
          table: {
            head: ["동사 종류", "만드는 법", "예문"],
            rows: [
              ["be동사", "be + 주어 ~?", "Is the manager available?"],
              ["조동사", "조동사 + 주어 + 원형?", "Can you check the figures?"],
              ["일반동사 현재", "Do / Does + 주어 + 원형?", "Do they offer a discount?"],
              ["일반동사 과거", "Did + 주어 + 원형?", "Did you receive the file?"],
              ["완료", "Have / Has + 주어 + p.p.?", "Has the payment been made?"]
            ]
          }
        },
        {
          h: "주어를 묻는 who / what",
          body: "주어를 묻는 의문사는 문장 맨 앞에 그대로 두고 어순을 바꾸지 않습니다. 목적어를 묻는 경우와 구분해야 합니다.",
          examples: [
            { en: "Who approved the budget?", ko: "누가 예산을 승인했습니까?" },
            { en: "Who did the manager call?", ko: "부장님이 누구에게 전화했습니까?" },
            { en: "What caused the delay?", ko: "무엇이 지연을 일으켰습니까?" }
          ],
          note: "주어를 묻는 who 뒤에는 동사가 바로 오고, 목적어를 묻는 who 뒤에는 did 와 주어가 옵니다."
        },
        {
          h: "부가의문문 — isn't it? don't you?",
          note: "Let's 로 시작하면 shall we, 명령문 뒤에는 will you 를 붙입니다.",
          body: "앞 문장이 긍정이면 부정으로, 부정이면 긍정으로 짧게 되묻습니다. be동사·조동사는 그대로 반복하고, 일반동사는 do, does, did를 씁니다.",
          table: {
            head: ["앞 문장", "부가의문문", "예문"],
            rows: [
              ["긍정 be동사", "부정 be동사", "The deadline is Friday, isn't it?"],
              ["부정 be동사", "긍정 be동사", "She isn't in the office, is she?"],
              ["긍정 일반동사", "부정 do / does / did", "You handle the orders, don't you?"],
              ["부정 일반동사", "긍정 do / does / did", "You did not send the invoice, did you?"]
            ]
          }
        },
        {
          h: "의문문에 대한 짧은 대답",
          body: "Yes와 No 뒤에는 대명사 주어와 be동사·조동사를 씁니다. 동사는 반복하지 않고 조동사로만 답합니다. 앞 문장이 부정이어도 대답의 Yes는 긍정, No는 부정입니다.",
          examples: [
            { en: "Yes, I do.", ko: "네, 그렇습니다." },
            { en: "No, she is not.", ko: "아니요, 그렇지 않습니다." },
            { en: "Yes, we have.", ko: "네, 그렇습니다." }
          ],
          note: "You did not send the invoice, did you? 에 No, I did not. 이라고 답하면 보내지 않았다는 뜻이 됩니다."
        }
      ],
      mistakes: [
        "Where you are going? 처럼 의문문 어순을 쓰지 않는 실수 — Where are you going? 입니다.",
        "부가의문문의 긍정·부정을 뒤집지 않는 실수 — 긍정 문장에는 부정 부가의문문을 씁니다.",
        "Did you finished it? 처럼 did 뒤에 과거형을 쓰는 실수 — did 뒤에는 원형 finish 를 씁니다.",
        "주어를 묻는 who 뒤에 did 와 주어를 넣는 실수 — Who did approve it? 이 아니라 Who approved it? 입니다.",
        "Yes / No 대답에서 조동사 대신 be동사를 쓰는 실수 — Do you ~? 에는 Yes, I do. 로 답합니다."
      ],
      practice: [
        { q: "____ did the client request a refund?", opts: ["Why", "Who", "Whose", "Which"], a: "Why", why: "이유를 묻는 문장이므로 Why 를 씁니다." },
        { q: "The shipment arrived yesterday, ____?", opts: ["did it", "didn't it", "wasn't it", "is it"], a: "didn't it", why: "긍정 과거 문장이므로 부정 부가의문문 didn't it 을 씁니다." },
        { q: "____ you finish the training module last night?", opts: ["Did", "Do", "Are", "Was"], a: "Did", why: "일반동사 과거의 의문문에는 Did 를 씁니다." },
        { q: "____ submitted the expense report on time?", opts: ["Who", "Whom", "Whose", "What"], a: "Who", why: "주어를 묻는 문장이므로 주격 Who 를 씁니다." },
        { q: "The new policy starts next month, ____?", opts: ["does it", "doesn't it", "isn't it", "didn't it"], a: "doesn't it", why: "긍정 현재 문장이고 주어가 단수이므로 doesn't it 을 씁니다." },
        { q: "____ the technician checked the alarm system?", opts: ["Have", "Has", "Is", "Does"], a: "Has", why: "완료 의문문이고 주어가 단수이므로 Has 를 씁니다." },
        { q: "____ I reset the password from this screen?", opts: ["Can", "Am", "Do", "Did"], a: "Can", why: "가능 여부를 묻는 질문이므로 조동사 Can 을 주어 앞에 둡니다." },
        { q: "You have not met the new director, ____?", opts: ["have you", "haven't you", "did you", "do you"], a: "have you", why: "부정 문장에는 긍정 부가의문문을 씁니다." }
      ]
    },
    {
      no: 11,
      title: "부정문과 There is / are",
      intro: "무엇이 있다·없다를 묻는 문제는 There is/are 구문이 단서입니다. some 과 any 의 쓰임을 같이 익혀 두면 안내문·공지 지문이 한결 쉬워집니다.",
      summary: "There is / are로 어떤 것이 존재함을 말하고, some과 any로 수량을 표현합니다.",
      points: [
        {
          h: "There is / There are 의 구분",
          body: "뒤에 오는 명사가 단수면 There is, 복수면 There are를 씁니다. 뒤에 나열된 명사가 여러 개면 첫 번째 명사에 맞춥니다.",
          table: {
            head: ["구조", "예문"],
            rows: [
              ["There is + 단수", "There is a seminar today."],
              ["There are + 복수", "There are two openings left."],
              ["There is + 셀 수 없는 명사", "There is plenty of time."],
              ["There is + some + 단수", "There is some coffee in the pot."]
            ]
          },
          note: "There is a pen and two notebooks on the desk. 처럼 여러 개가 나열되어도 첫 명사가 단수면 is 를 씁니다."
        },
        {
          h: "There 구문의 시제와 부정·의문",
          note: "There is 뒤에는 단수 명사와 셀 수 없는 명사가, 복수 명사 뒤에는 There are 가 옵니다.",
          body: "There 구문도 시제에 따라 be동사가 바뀌고, 부정문과 의문문은 be동사를 기준으로 만듭니다.",
          table: {
            head: ["시제·형식", "형태", "예문"],
            rows: [
              ["현재", "There is / are", "There are three applicants."],
              ["과거", "There was / were", "There were several delays last week."],
              ["미래", "There will be", "There will be a briefing tomorrow."],
              ["부정", "There is / are + not", "There are not enough chairs."],
              ["의문", "Is / Are there ~?", "Are there any seats left?"]
            ]
          }
        },
        {
          h: "some 과 any",
          note: "기대나 권유가 담긴 의문문에는 some 을 씁니다. 권유하는 자리에서는 some 이 더 자연스럽습니다.",
          body: "긍정문에는 some, 부정문과 의문문에는 any를 씁니다. 권유나 요청을 나타내는 의문문에는 some을 씁니다.",
          table: {
            head: ["문장", "쓰는 말", "예문"],
            rows: [
              ["긍정문", "some", "We have some extra chairs."],
              ["부정문", "any", "We do not have any copies left."],
              ["일반 의문문", "any", "Do you have any questions?"],
              ["권유·요청", "some", "Would you like some coffee?"]
            ]
          },
          examples: [
            { en: "We have some extra chairs in the back.", ko: "뒤쪽에 여분의 의자가 있습니다." },
            { en: "Would you like some coffee?", ko: "커피 좀 드릴까요?" }
          ]
        },
        {
          h: "부정 표현의 정도 — no / none / hardly",
          note: "hardly, rarely 는 그 자체로 부정의 뜻이라 뒤에 not 을 쓰지 않습니다. 이중 부정이 되기 때문입니다.",
          body: "no는 명사 앞에서 아예 없음을, not ~ any는 하나도 없음을 나타냅니다. none은 명사 없이 단독으로 쓰고, hardly, rarely는 부정의 뜻을 가진 부사입니다.",
          table: {
            head: ["표현", "뜻", "예문"],
            rows: [
              ["no + 명사", "하나도 없음", "There is no elevator in this building."],
              ["not ~ any", "하나도 없음", "We do not have any openings."],
              ["none (단독)", "아무것도 없음", "None of the applicants withdrew."],
              ["hardly / rarely", "거의 ~않다", "The manager rarely misses a meeting."]
            ]
          },
          examples: [
            { en: "There is no elevator in this building.", ko: "이 건물에는 엘리베이터가 없습니다." },
            { en: "The manager rarely misses a meeting.", ko: "그 부장님은 회의를 거의 빠지지 않습니다." }
          ]
        },
        {
          h: "부정문 만드는 법 정리",
          note: "일반동사 부정문에서 동사는 항상 원형입니다. doesn't goes 는 틀린 형태입니다.",
          body: "동사 종류에 따라 부정문을 만드는 위치가 다릅니다. be동사·조동사는 뒤에 not, 일반동사는 do / does / did 뒤에 not 을 붙입니다.",
          table: {
            head: ["동사 종류", "부정문", "예문"],
            rows: [
              ["be동사", "be + not", "The office is not open yet."],
              ["일반동사 현재", "do / does + not + 원형", "She does not work on Fridays."],
              ["일반동사 과거", "did + not + 원형", "They did not attend the briefing."],
              ["조동사", "조동사 + not + 원형", "We cannot accept late applications."]
            ]
          }
        },
        {
          h: "이중 부정은 쓰지 않기",
          body: "한 문장에 부정 표현을 두 번 쓰면 뜻이 반대로 흐려집니다. 부정은 한 번만 쓰고, 나머지는 any나 ever로 바꿉니다.",
          examples: [
            { en: "We do not have any time left.", ko: "우리에게 남은 시간이 없습니다." },
            { en: "Nobody said anything about the change.", ko: "아무도 그 변경에 대해 말하지 않았습니다." }
          ],
          note: "I do not know nothing. 은 틀린 문장입니다. I do not know anything. 으로 씁니다."
        }
      ],
      mistakes: [
        "There is many reasons. 처럼 복수에 is 를 쓰는 실수 — There are many reasons 입니다.",
        "긍정문에 any 를, 부정문에 some 을 쓰는 실수 — 긍정 some, 부정 any 가 기본입니다.",
        "이중 부정을 쓰는 실수 — I do not know nothing. 이 아니라 I do not know anything. 입니다.",
        "There have / There has 로 존재를 말하는 실수 — 존재는 There is / are 로 씁니다.",
        "none of 뒤에 단수 동사를 쓰는 실수 — 복수 명사에는 복수 동사를 씁니다."
      ],
      practice: [
        { q: "____ are several positions available in the sales division.", opts: ["There", "It", "They", "Them"], a: "There", why: "복수 명사 앞에서 존재를 나타내므로 There are 를 씁니다." },
        { q: "Do you have ____ questions about the new policy?", opts: ["some", "any", "no", "much"], a: "any", why: "일반적인 의문문에는 any 를 씁니다." },
        { q: "There ____ a maintenance schedule posted near the entrance.", opts: ["are", "is", "were", "have"], a: "is", why: "뒤의 명사 a maintenance schedule 이 단수이므로 is 를 씁니다." },
        { q: "There ____ three delays on the shipping line last month.", opts: ["was", "were", "is", "has"], a: "were", why: "복수 명사와 과거 표현 last month 에 맞춰 were 를 씁니다." },
        { q: "____ there any seats left for the morning session?", opts: ["Is", "Are", "Does", "Has"], a: "Are", why: "복수 명사 seats 에 맞춰 Are there 로 묻습니다." },
        { q: "We do not have ____ copies of the brochure left.", opts: ["some", "any", "none", "much"], a: "any", why: "부정문에는 any 를 씁니다." },
        { q: "The receptionist ____ checks the visitor log twice a day.", opts: ["hardly", "hard", "not", "no"], a: "hardly", why: "거의 ~않다라는 뜻의 부사는 hardly 입니다." },
        { q: "I do not know ____ about the schedule change.", opts: ["anything", "nothing", "something", "none"], a: "anything", why: "이미 do not 으로 부정했으므로 anything 을 씁니다. 이중 부정을 피합니다." }
      ]
    },
    {
      no: 12,
      title: "문장의 5형식과 기초 접속사",
      intro: "문장 형식을 알면 긴 문장에서 주어와 동사를 빨리 찾습니다. 접속사로 이어진 문장은 절 단위로 끊어 읽는 연습을 하면 Part 7 읽기 속도가 올라갑니다.",
      summary: "동사의 성격에 따라 문장이 5가지 형식으로 나뉩니다. 접속사로 단어와 문장을 이어 긴 문장을 만듭니다.",
      points: [
        {
          h: "문장의 5형식",
          body: "동사가 목적어와 보어를 필요로 하는지에 따라 형식이 정해집니다. 형식을 알면 빈칸에 올 품사와 목적어 개수를 판단할 수 있습니다.",
          table: {
            head: ["형식", "구조", "예문"],
            rows: [
              ["1형식", "주어 + 동사", "The train arrived."],
              ["2형식", "주어 + 동사 + 보어", "She became the manager."],
              ["3형식", "주어 + 동사 + 목적어", "We signed the contract."],
              ["4형식", "주어 + 동사 + 사람 + 사물", "He sent me a memo."],
              ["5형식", "주어 + 동사 + 목적어 + 보어", "They elected him chairperson."]
            ]
          },
          note: "2형식 보어 자리에는 형용사나 명사가, 5형식 목적격 보어 자리에는 명사·형용사·동사원형 등이 옵니다."
        },
        {
          h: "동사 성격에 따라 형식 판단하기",
          note: "같은 동사도 뜻에 따라 형식이 달라집니다. give 는 4형식, provide 는 3형식으로 씁니다.",
          body: "목적어를 갖지 않는 자동사는 1형식, 목적어 하나를 갖는 타동사는 3형식입니다. 사람과 사물을 함께 갖는 수여동사는 4형식이고, 5형식 동사는 목적격 보어를 필요로 합니다.",
          table: {
            head: ["동사 성격", "형식", "예문"],
            rows: [
              ["자동사", "1형식", "The guests arrived early."],
              ["연결동사", "2형식", "The soup tastes good."],
              ["타동사", "3형식", "She reviewed the report."],
              ["수여동사", "4형식", "They offered me a discount."],
              ["목적격 보어 동사", "5형식", "We appointed her director."]
            ]
          }
        },
        {
          h: "등위접속사 and / but / or / so",
          note: "접속사 앞뒤에는 같은 형태가 와야 합니다. 동사와 동사, 명사와 명사를 연결합니다.",
          body: "단어와 단어, 문장과 문장을 같은 자격으로 이어 줍니다. 세 개 이상을 나열할 때는 마지막 앞에 and나 or를 씁니다.",
          table: {
            head: ["접속사", "의미", "예문"],
            rows: [
              ["and", "그리고(추가)", "The report is short and clear."],
              ["but", "그러나(대조)", "The report is short but detailed."],
              ["or", "또는(선택)", "Call or email the help desk."],
              ["so", "그래서(결과)", "The flight was late, so we rebooked."]
            ]
          }
        },
        {
          h: "종속접속사 because / when / if / although",
          note: "종속접속사가 이끄는 절이 문장 앞에 오면 뒤에 콤마를 씁니다. 뒤에 오면 콤마가 필요 없습니다.",
          body: "종속접속사 뒤에는 주어와 동사가 있는 절이 옵니다. 부사절이 문장 앞에 오면 뒤에 콤마를 찍습니다.",
          table: {
            head: ["접속사", "의미", "예문"],
            rows: [
              ["because", "원인", "Because the flight was delayed, we missed the connection."],
              ["when", "시간", "Please call me when the numbers change."],
              ["if", "조건", "We will ship today if the payment clears."],
              ["although", "양보", "Although the traffic was heavy, the team arrived on time."]
            ]
          }
        },
        {
          h: "접속사와 전치사 구분",
          note: "because 는 절과, because of 는 명사구와 짝을 이룹니다. 빈칸 뒤만 보면 바로 갈립니다.",
          body: "뒤에 절이 오면 접속사, 명사구가 오면 전치사입니다. because와 because of, although와 despite의 차이가 대표적입니다.",
          table: {
            head: ["접속사 (+ 절)", "전치사 (+ 명사구)", "뜻"],
            rows: [
              ["because it rained", "because of the rain", "원인"],
              ["although it was late", "despite the delay", "양보"],
              ["while we waited", "during the wait", "시간"]
            ]
          }
        },
        {
          h: "병렬 구조",
          note: "and, but, or 뒤에는 앞과 같은 품사가 와야 합니다. 명사와 동사가 섞이면 오답입니다.",
          body: "and, or, but 으로 연결되는 요소는 품사와 형태를 같게 맞춥니다. 나열 구조가 어긋나면 어색한 문장이 됩니다.",
          examples: [
            { en: "The job requires patience, accuracy, and flexibility.", ko: "그 일에는 인내심, 정확성, 유연성이 필요합니다." },
            { en: "Please review, edit, and submit the draft.", ko: "초안을 검토하고 편집하고 제출해 주세요." }
          ]
        }
      ],
      mistakes: [
        "4형식 동사를 3형식으로 쓸 때 전치사를 빠뜨리는 실수 — He sent a memo to me. 처럼 to 를 넣습니다.",
        "Because the report was late. 처럼 부사절만 남기는 실수 — 주절과 함께 써야 완전한 문장이 됩니다.",
        "because 뒤에 명사구를 쓰는 실수 — because of the rain 이나 because it rained 로 씁니다.",
        "병렬 구조에서 품사를 섞는 실수 — patience, accuracy, and flexible 이 아니라 flexibility 입니다.",
        "5형식 동사에 to부정사를 붙이는 실수 — make him to wait 가 아니라 make him wait 입니다."
      ],
      practice: [
        { q: "The recruiter offered ____ a position in the Seoul office.", opts: ["to me", "me", "I", "mine"], a: "me", why: "offer 는 사람 + 사물을 취하는 4형식 동사이므로 목적격 me 를 씁니다." },
        { q: "____ the traffic was heavy, the team arrived on time.", opts: ["Although", "Because", "So", "And"], a: "Although", why: "양보의 의미로 두 절을 이으므로 Although 를 씁니다." },
        { q: "The new system is faster ____ more reliable.", opts: ["and", "because", "if", "although"], a: "and", why: "두 형용사를 대등하게 이어 주는 등위접속사 and 가 맞습니다." },
        { q: "The supervisor appointed Ms. Yoon ____ project leader.", opts: ["as", "to be", "be", "being"], a: "as", why: "5형식 동사 appoint 뒤 목적격 보어는 명사 또는 as + 명사로 씁니다." },
        { q: "We will postpone the launch ____ the supplier delays the parts.", opts: ["if", "despite", "because of", "during"], a: "if", why: "뒤에 절이 오므로 접속사 if 를 씁니다." },
        { q: "The shipment was delayed ____ the heavy snow.", opts: ["because", "because of", "although", "so"], a: "because of", why: "뒤에 명사구 the heavy snow 가 오므로 전치사 because of 를 씁니다." },
        { q: "The position requires strong communication skills, attention to detail, and ____.", opts: ["flexible", "flexibility", "flexibly", "flex"], a: "flexibility", why: "병렬 구조이므로 앞의 명사 skills, attention 과 같은 명사 flexibility 를 씁니다." },
        { q: "The manager let the team ____ the schedule one more time.", opts: ["to review", "review", "reviewing", "reviewed"], a: "review", why: "사역동사 let 뒤 목적격 보어는 동사 원형 review 입니다." }
      ]
    }
  ]
});
