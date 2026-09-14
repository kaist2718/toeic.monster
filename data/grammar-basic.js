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
      summary: "영어 문장은 주어와 동사로 시작합니다. be동사는 주어의 상태나 존재를 나타내며 주어에 따라 am, is, are로 달라집니다.",
      points: [
        {
          h: "영어 문장의 최소 단위 — 주어 + 동사",
          body: "영어 문장은 누가(주어) 무엇을 한다(동사)는 뼈대를 반드시 갖습니다. 한국어처럼 주어나 동사를 생략하면 문장이 성립하지 않으므로, 말하거나 쓰기 전에 주어와 동사를 먼저 정하는 습관이 중요합니다.",
          examples: [
            { en: "The meeting starts at nine.", ko: "회의는 9시에 시작합니다." },
            { en: "My manager called me yesterday.", ko: "부장님이 어제 저에게 전화했습니다." }
          ]
        },
        {
          h: "be동사 현재형 — am / is / are",
          body: "be동사는 주어의 상태, 신분, 위치를 나타냅니다. 주어가 I면 am, 3인칭 단수(he, she, it, 단수 명사)면 is, 나머지 복수 주어와 you는 are를 씁니다.",
          table: {
            head: ["주어", "be동사", "예문"],
            rows: [
              ["I", "am", "I am ready."],
              ["He / She / It", "is", "She is busy."],
              ["You / We / They", "are", "They are late."]
            ]
          },
          note: "주어와 be동사는 줄여 쓸 수 있습니다. I am → I'm, he is → he's, they are → they're."
        },
        {
          h: "be동사의 부정문과 의문문",
          body: "부정문은 be동사 뒤에 not을 붙이고, 의문문은 be동사를 주어 앞으로 보냅니다. 대답은 Yes 또는 No와 주어 + be동사로 짧게 합니다.",
          examples: [
            { en: "I am not available today.", ko: "저는 오늘 시간이 없습니다." },
            { en: "Are you ready for the presentation?", ko: "발표 준비되셨나요?" }
          ]
        },
        {
          h: "be동사의 과거형 — was / were",
          body: "과거의 상태를 말할 때는 am, is를 was로, are를 were로 바꿉니다. 과거의 습관이나 행동은 be동사로 표현할 수 없고 일반동사의 과거형을 씁니다.",
          table: {
            head: ["현재", "과거", "예문"],
            rows: [
              ["am / is", "was", "The office was quiet."],
              ["are", "were", "They were satisfied."]
            ]
          }
        }
      ],
      mistakes: [
        "주어를 빠뜨리고 Is busy. 처럼 말하는 실수 — 반드시 주어를 넣어 She is busy. 로 씁니다.",
        "I am agree. 는 틀린 문장입니다. agree는 일반동사이므로 I agree. 로 씁니다."
      ],
      practice: [
        { q: "The new printer ____ in the supply room.", opts: ["are", "is", "am", "be"], a: "is", why: "주어 The new printer 는 3인칭 단수이므로 is 를 씁니다." },
        { q: "____ you available for a call this afternoon?", opts: ["Is", "Am", "Are", "Be"], a: "Are", why: "주어 you 에는 are 를 쓰고, 의문문이므로 주어 앞에 둡니다." },
        { q: "The employees ____ not informed about the schedule change.", opts: ["was", "were", "is", "am"], a: "were", why: "복수 주어 The employees 에는 과거형 were 를 씁니다." }
      ]
    },
    {
      no: 2,
      title: "일반동사와 3인칭 단수",
      summary: "일반동사는 동작을 나타냅니다. 현재시제에서 주어가 3인칭 단수이면 동사 뒤에 -s 또는 -es를 붙입니다.",
      points: [
        {
          h: "일반동사의 현재형과 -s 규칙",
          body: "현재의 습관이나 반복되는 행동은 동사의 원형으로 씁니다. 주어가 he, she, it 또는 단수 명사일 때만 동사 끝에 -s를 붙입니다.",
          table: {
            head: ["주어", "동사 형태", "예문"],
            rows: [
              ["I / You / We / They", "원형", "We work from home."],
              ["He / She / It", "원형 + s", "He works from home."]
            ]
          },
          note: "-s, -sh, -ch, -x, -o 로 끝나면 -es 를 붙이고(goes, watches), 자음 + y 로 끝나면 y 를 i 로 바꾸고 -es 를 붙입니다(study → studies)."
        },
        {
          h: "부정문과 의문문 — do / does",
          body: "일반동사의 부정문과 의문문에는 do 또는 does를 씁니다. 이때 본동사는 반드시 원형으로 돌아옵니다.",
          table: {
            head: ["형식", "구조", "예문"],
            rows: [
              ["부정문", "do/does + not + 원형", "She does not work on Fridays."],
              ["의문문", "Do/Does + 주어 + 원형?", "Do they offer a discount?"]
            ]
          }
        },
        {
          h: "빈도 부사의 위치",
          body: "always, usually, often, sometimes, never 같은 빈도 부사는 일반동사 앞, be동사 뒤에 둡니다.",
          examples: [
            { en: "He usually arrives before nine.", ko: "그는 보통 9시 전에 도착합니다." },
            { en: "The manager is never late.", ko: "그 부장님은 결코 지각하지 않습니다." }
          ]
        }
      ],
      mistakes: [
        "Does she works here? 처럼 does 뒤에 -s 를 또 붙이는 실수 — does 뒤에는 반드시 원형을 씁니다.",
        "He don't like coffee. 는 틀린 문장입니다. 3인칭 단수에는 doesn't 를 씁니다."
      ],
      practice: [
        { q: "Our team ____ a progress report every Monday.", opts: ["submit", "submits", "submitting", "submitted"], a: "submits", why: "주어 Our team 은 단수 취급이므로 -s 를 붙인 submits 가 맞습니다." },
        { q: "____ the receptionist handle international calls?", opts: ["Do", "Does", "Is", "Are"], a: "Does", why: "주어가 3인칭 단수이고 일반동사 handle 이 있으므로 Does 로 묻습니다." },
        { q: "The staff ____ not use the back entrance during renovation.", opts: ["does", "do", "is", "are"], a: "do", why: "복수 주어 The staff 에는 do not 을 씁니다." }
      ]
    },
    {
      no: 3,
      title: "명사·관사·복수형",
      summary: "명사는 사람과 사물의 이름입니다. 셀 수 있는 명사에는 a, an, 복수형 -s를 붙이고, 특정한 것을 가리킬 때는 the를 씁니다.",
      points: [
        {
          h: "셀 수 있는 명사와 셀 수 없는 명사",
          body: "하나, 둘로 셀 수 있는 명사는 단수일 때 관사가 필요하고 복수형을 만들 수 있습니다. information, advice, equipment, furniture 처럼 셀 수 없는 명사는 복수형이 없고 a를 붙일 수 없습니다.",
          examples: [
            { en: "We received three invoices this morning.", ko: "우리는 오늘 아침 송장 세 장을 받았습니다." },
            { en: "She gave me useful advice about the contract.", ko: "그녀는 계약에 관한 유용한 조언을 해 주었습니다." }
          ]
        },
        {
          h: "관사 a / an / the",
          body: "a와 an은 처음 언급하는 하나를 가리키고, the는 이미 언급했거나 문맥상 하나로 정해진 것을 가리킵니다. 발음이 모음이면 an을 씁니다.",
          table: {
            head: ["관사", "쓰는 경우", "예문"],
            rows: [
              ["a", "자음 소리 앞, 처음 언급", "a proposal"],
              ["an", "모음 소리 앞, 처음 언급", "an hour"],
              ["the", "정해진 대상, 재언급", "the proposal we discussed"]
            ]
          },
          note: "an hour 처럼 철자는 자음이지만 발음이 모음인 경우 an 을 씁니다. a university 는 발음이 '유' 로 시작하므로 a 를 씁니다."
        },
        {
          h: "복수형 만드는 규칙",
          body: "대부분 -s를 붙이지만, -s, -sh, -ch, -x는 -es를 붙이고 자음 + y는 y를 i로 바꿉니다. 불규칙 복수형도 함께 익혀 둡니다.",
          table: {
            head: ["단수", "복수"],
            rows: [
              ["box", "boxes"],
              ["city", "cities"],
              ["child", "children"],
              ["person", "people"]
            ]
          }
        }
      ],
      mistakes: [
        "an advice, informations 처럼 셀 수 없는 명사를 다루는 실수 — a piece of advice, information 처럼 단위를 씁니다.",
        "a hour 처럼 발음 대신 철자로 판단하는 실수 — 발음이 모음이면 an 입니다."
      ],
      practice: [
        { q: "Please send me ____ invoice for last month.", opts: ["a", "an", "the", "some"], a: "an", why: "invoice 는 모음 소리로 시작하는 처음 언급 대상이므로 an 을 씁니다." },
        { q: "The company purchased new ____ for the office.", opts: ["furnitures", "furniture", "a furniture", "furnituring"], a: "furniture", why: "furniture 는 셀 수 없는 명사이므로 복수형이나 관사를 쓰지 않습니다." },
        { q: "Two ____ were hired for the marketing team.", opts: ["person", "persons", "people", "peoples"], a: "people", why: "person 의 복수형 people 이 자연스럽고, 숫자 뒤에 바로 씁니다." }
      ]
    },
    {
      no: 4,
      title: "대명사와 소유 표현",
      summary: "대명사는 반복되는 명사를 대신합니다. 주격·목적격·소유격·소유대명사를 구분해 씁니다.",
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
              ["we", "us", "our", "ours"],
              ["they", "them", "their", "theirs"]
            ]
          }
        },
        {
          h: "재귀대명사 — myself, yourself",
          body: "주어와 목적어가 같을 때 재귀대명사를 씁니다. by oneself는 혼자서, enjoy oneself는 즐기다라는 뜻으로 자주 쓰입니다.",
          examples: [
            { en: "He introduced himself to the new team.", ko: "그는 새 팀에 자신을 소개했습니다." },
            { en: "Please check the figures yourself before sending.", ko: "보내기 전에 숫자를 직접 확인해 주세요." }
          ]
        },
        {
          h: "지시대명사와 비인칭 it",
          body: "this와 these는 가까운 것, that과 those는 먼 것을 가리킵니다. it은 날씨, 시간, 거리처럼 특정 대상을 가리키지 않는 문장에서도 씁니다.",
          examples: [
            { en: "These are the documents you requested.", ko: "이것들이 요청하신 서류입니다." },
            { en: "It is raining outside.", ko: "밖에 비가 오고 있습니다." }
          ]
        }
      ],
      mistakes: [
        "Between you and I 처럼 전치사 뒤에 주격을 쓰는 실수 — 목적격 me 를 씁니다.",
        "소유대명사와 소유격을 섞는 실수 — This book is my. 가 아니라 This book is mine. 입니다."
      ],
      practice: [
        { q: "The contract is between the client and ____.", opts: ["I", "me", "my", "mine"], a: "me", why: "전치사 between 뒤에는 목적격 me 를 씁니다." },
        { q: "That laptop is not mine. ____ is in the drawer.", opts: ["My", "Me", "Mine", "Myself"], a: "Mine", why: "명사 없이 소유를 나타내므로 소유대명사 Mine 을 씁니다." },
        { q: "All employees should submit the form ____.", opts: ["themselves", "theirselves", "themself", "them"], a: "themselves", why: "주어와 목적어가 같고 복수이므로 재귀대명사 themselves 를 씁니다. theirselves 는 틀린 표기입니다." }
      ]
    },
    {
      no: 5,
      title: "현재시제와 현재진행형",
      summary: "현재시제는 반복되는 습관과 일반적인 사실을, 현재진행형은 지금 이 순간 진행 중인 일을 나타냅니다.",
      points: [
        {
          h: "두 시제의 쓰임 비교",
          body: "현재시제는 늘 그런 일, 일정표처럼 정해진 일에 씁니다. 현재진행형(be + -ing)은 말하는 순간 진행 중이거나 일시적으로 벌어지는 일에 씁니다.",
          table: {
            head: ["구분", "형태", "예문"],
            rows: [
              ["현재시제", "동사(원형/-s)", "The store opens at nine."],
              ["현재진행형", "am/is/are + -ing", "The manager is talking on the phone."]
            ]
          }
        },
        {
          h: "시제와 함께 쓰는 표현",
          body: "every day, always, usually는 현재시제와, now, at the moment, currently는 현재진행형과 함께 씁니다.",
          examples: [
            { en: "We process orders every morning.", ko: "우리는 매일 아침 주문을 처리합니다." },
            { en: "She is reviewing the report at the moment.", ko: "그녀는 지금 보고서를 검토하고 있습니다." }
          ]
        },
        {
          h: "진행형으로 쓰지 않는 동사",
          body: "know, believe, belong, contain, need 같은 상태동사는 진행형으로 쓰지 않습니다.",
          examples: [
            { en: "I know the answer.", ko: "저는 답을 알고 있습니다." },
            { en: "This file belongs to the accounting team.", ko: "이 파일은 회계팀에 속해 있습니다." }
          ]
        }
      ],
      mistakes: [
        "I am knowing the answer. 처럼 상태동사를 진행형으로 쓰는 실수 — I know 로 씁니다.",
        "지금 하는 일인데 현재시제를 쓰는 실수 — 진행 중이면 be + -ing 를 씁니다."
      ],
      practice: [
        { q: "The office ____ at eight o'clock every weekday.", opts: ["open", "opens", "is opening", "opened"], a: "opens", why: "every weekday 는 반복되는 일정이므로 현재시제 opens 를 씁니다." },
        { q: "Please do not call now. The team ____ the quarterly results.", opts: ["discusses", "discuss", "is discussing", "discussed"], a: "is discussing", why: "now 시점에 진행 중인 일이므로 현재진행형을 씁니다." },
        { q: "This manual ____ to the equipment on the second floor.", opts: ["is belonging", "belongs", "belong", "belonging"], a: "belongs", why: "belong 은 상태동사이므로 진행형 대신 현재시제를 씁니다." }
      ]
    },
    {
      no: 6,
      title: "과거시제와 과거진행형",
      summary: "과거시제는 끝난 일을, 과거진행형은 과거의 어느 시점에 진행 중이던 일을 나타냅니다.",
      points: [
        {
          h: "규칙 동사와 불규칙 동사",
          body: "대부분의 동사는 과거형에 -ed를 붙입니다. 하지만 go, take, buy, write, make처럼 형태가 완전히 바뀌는 불규칙 동사는 표로 익혀야 합니다.",
          table: {
            head: ["원형", "과거형", "예문"],
            rows: [
              ["go", "went", "He went to the branch."],
              ["take", "took", "She took the notes."],
              ["write", "wrote", "We wrote a summary."]
            ]
          }
        },
        {
          h: "부정문과 의문문 — did",
          body: "일반동사 과거의 부정문과 의문문에는 did를 씁니다. did가 시제를 대신하므로 본동사는 원형으로 돌아옵니다.",
          examples: [
            { en: "Did you receive the updated schedule?", ko: "수정된 일정을 받으셨나요?" },
            { en: "I did not finish the draft yesterday.", ko: "저는 어제 초안을 끝내지 못했습니다." }
          ]
        },
        {
          h: "과거진행형 — was / were + -ing",
          body: "과거의 한 시점에 진행 중이던 일을 말합니다. 과거진행형과 과거시제를 함께 쓰면, 진행 중이던 일(배경)과 끼어든 일(사건)을 구분할 수 있습니다.",
          examples: [
            { en: "I was preparing the report when the client called.", ko: "고객이 전화했을 때 저는 보고서를 준비하고 있었습니다." },
            { en: "They were waiting in the lobby at noon.", ko: "그들은 정오에 로비에서 기다리고 있었습니다." }
          ]
        }
      ],
      mistakes: [
        "Did you received it? 처럼 did 뒤에 과거형을 또 쓰는 실수 — did 뒤에는 원형을 씁니다.",
        "I was go to the meeting. 처럼 진행형에 원형을 쓰는 실수 — was going 이 맞습니다."
      ],
      practice: [
        { q: "The shipment ____ yesterday afternoon.", opts: ["arrive", "arrived", "arrives", "arriving"], a: "arrived", why: "yesterday afternoon 은 끝난 과거 시점이므로 과거형 arrived 를 씁니다." },
        { q: "____ the supplier confirm the delivery date?", opts: ["Did", "Does", "Was", "Were"], a: "Did", why: "일반동사 confirm 의 과거 의문문이므로 did 를 씁니다." },
        { q: "We ____ the presentation when the power went out.", opts: ["gave", "were giving", "give", "have given"], a: "were giving", why: "전원이 나간 순간 진행 중이던 일이므로 과거진행형을 씁니다." }
      ]
    },
    {
      no: 7,
      title: "조동사 기초",
      summary: "조동사는 동사 앞에서 능력, 허가, 의무, 추천을 나타냅니다. 조동사 뒤에는 언제나 동사 원형이 옵니다.",
      points: [
        {
          h: "조동사의 기본 규칙",
          body: "can, may, must, should, will은 조동사입니다. 조동사 뒤에는 동사 원형이 오고, 3인칭 단수라도 -s를 붙이지 않습니다.",
          table: {
            head: ["조동사", "의미", "예문"],
            rows: [
              ["can", "할 수 있다, 허가", "I can attend the meeting."],
              ["may", "해도 된다, 그럴지도 모른다", "You may leave early today."],
              ["must", "반드시 해야 한다", "All staff must wear a badge."],
              ["should", "하는 것이 좋다", "You should review the figures."]
            ]
          }
        },
        {
          h: "have to와 must의 차이",
          body: "must는 말하는 사람의 강한 의무, have to는 규칙이나 상황 때문에 생기는 의무를 나타냅니다. 부정형은 뜻이 크게 달라집니다.",
          table: {
            head: ["형식", "의미", "예문"],
            rows: [
              ["must not", "하면 안 된다(금지)", "You must not share the password."],
              ["do not have to", "할 필요가 없다", "You do not have to work on Sunday."]
            ]
          }
        },
        {
          h: "조동사의 부정문과 의문문",
          body: "부정문은 조동사 뒤에 not을 붙이고, 의문문은 조동사를 주어 앞으로 보냅니다. do를 따로 쓰지 않습니다.",
          examples: [
            { en: "Could you send the file by noon?", ko: "정오까지 파일을 보내 주시겠어요?" },
            { en: "We cannot accept late applications.", ko: "우리는 늦은 지원서를 받을 수 없습니다." }
          ]
        }
      ],
      mistakes: [
        "He can speaks English. 처럼 조동사 뒤에 -s 를 붙이는 실수 — 조동사 뒤는 항상 원형입니다.",
        "Do you can help me? 처럼 do 와 조동사를 겹치는 실수 — Can you help me? 입니다."
      ],
      practice: [
        { q: "Visitors ____ sign in at the front desk before entering.", opts: ["must", "musts", "must to", "musting"], a: "must", why: "조동사 must 뒤에는 동사 원형 sign 이 오고, to 나 -s 를 붙이지 않습니다." },
        { q: "You ____ not park in the loading zone at any time.", opts: ["must", "should", "can", "may"], a: "must", why: "금지를 나타내는 가장 강한 표현은 must not 입니다." },
        { q: "____ you help me prepare the documents this morning?", opts: ["Do", "Are", "Could", "Did"], a: "Could", why: "정중한 요청에는 조동사 Could 를 주어 앞에 둡니다. Do 나 Are 를 함께 쓰지 않습니다." }
      ]
    },
    {
      no: 8,
      title: "형용사·부사와 비교 표현",
      summary: "형용사는 명사를 꾸미고, 부사는 동사·형용사·문장 전체를 꾸밉니다. 비교급과 최상급으로 정도를 나타냅니다.",
      points: [
        {
          h: "형용사와 부사의 자리",
          body: "형용사는 명사 앞이나 be동사 뒤에서 명사를 설명하고, 부사는 동사 뒤나 형용사 앞에서 동작의 방식을 설명합니다.",
          examples: [
            { en: "She is a careful editor.", ko: "그녀는 꼼꼼한 편집자입니다." },
            { en: "She edits the report carefully.", ko: "그녀는 보고서를 꼼꼼하게 편집합니다." }
          ]
        },
        {
          h: "비교급과 최상급 만들기",
          body: "짧은 단어는 -er / -est를, 긴 단어는 more / most를 씁니다. 비교 대상이 있으면 최상급 앞에 the를 붙입니다.",
          table: {
            head: ["원급", "비교급", "최상급"],
            rows: [
              ["fast", "faster", "the fastest"],
              ["large", "larger", "the largest"],
              ["expensive", "more expensive", "the most expensive"]
            ]
          },
          note: "good / better / best, bad / worse / worst 처럼 불규칙하게 바뀌는 단어는 그대로 익혀 둡니다."
        },
        {
          h: "비교 표현의 틀",
          body: "비교급 뒤에는 than을, 최상급 뒤에는 in 또는 of를 씁니다. as + 원급 + as는 두 대상이 같은 정도임을 나타냅니다.",
          examples: [
            { en: "This model is cheaper than the previous one.", ko: "이 모델은 이전 모델보다 저렴합니다." },
            { en: "The Seoul office is the busiest in the company.", ko: "서울 사무소는 회사에서 가장 분주합니다." }
          ]
        }
      ],
      mistakes: [
        "more cheaper 처럼 비교급을 두 번 쓰는 실수 — cheaper 또는 more expensive 하나만 씁니다.",
        "She works careful. 처럼 동사를 형용사로 꾸미는 실수 — 부사 carefully 를 씁니다."
      ],
      practice: [
        { q: "This year's sales figures are ____ than last year's.", opts: ["high", "higher", "highest", "more high"], a: "higher", why: "than 이 있으므로 비교급 higher 를 씁니다. more high 는 틀린 형태입니다." },
        { q: "The new system is ____ expensive option we reviewed.", opts: ["more", "most", "the most", "the more"], a: "the most", why: "여러 선택지 중 하나를 최상급으로 말하므로 the most 를 씁니다." },
        { q: "Please review the contract ____ before signing it.", opts: ["careful", "carefully", "carefuly", "carefulness"], a: "carefully", why: "동사 review 를 꾸미는 부사 carefully 가 필요합니다." }
      ]
    },
    {
      no: 9,
      title: "전치사와 시간·장소 표현",
      summary: "전치사는 시간과 장소, 방향을 나타냅니다. 시각은 at, 날짜는 on, 월과 연도는 in을 씁니다.",
      points: [
        {
          h: "시간 전치사 at / on / in",
          body: "시각과 특정 시점은 at, 요일과 날짜는 on, 월·계절·연도·긴 기간은 in을 씁니다.",
          table: {
            head: ["전치사", "쓰는 대상", "예문"],
            rows: [
              ["at", "시각, 정오·자정", "at 9 a.m."],
              ["on", "요일, 날짜", "on Monday, on May 5"],
              ["in", "월, 연도, 계절", "in June, in 2026"]
            ]
          },
          note: "기한을 나타낼 때는 by(~까지), 지속 기간은 for, 시작점은 since 를 씁니다."
        },
        {
          h: "장소 전치사 in / on / at",
          body: "넓은 공간이나 도시·국가는 in, 표면이나 층은 on, 특정 지점은 at을 씁니다.",
          examples: [
            { en: "The head office is in Seoul.", ko: "본사는 서울에 있습니다." },
            { en: "The printer is on the third floor.", ko: "프린터는 3층에 있습니다." },
            { en: "I will meet you at the entrance.", ko: "입구에서 만나겠습니다." }
          ]
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
              ["in charge of", "~을 담당하는"]
            ]
          }
        }
      ],
      mistakes: [
        "on 9 a.m. 처럼 시각에 on 을 쓰는 실수 — 시각에는 at 을 씁니다.",
        "since three years 처럼 기간에 since 를 쓰는 실수 — 기간에는 for, 시작점에는 since 를 씁니다."
      ],
      practice: [
        { q: "The orientation session begins ____ 10 a.m.", opts: ["in", "on", "at", "by"], a: "at", why: "시각 앞에는 at 을 씁니다." },
        { q: "We signed the agreement ____ March 3.", opts: ["in", "on", "at", "for"], a: "on", why: "특정 날짜 앞에는 on 을 씁니다." },
        { q: "Please submit the expense report ____ Friday.", opts: ["until", "by", "since", "for"], a: "by", why: "늦어도 그때까지라는 기한은 by 로 나타냅니다." }
      ]
    },
    {
      no: 10,
      title: "의문문과 부가의문문",
      summary: "의문사로 구체적인 정보를 묻고, 부가의문문으로 상대의 동의를 구합니다.",
      points: [
        {
          h: "의문사별로 묻는 정보",
          body: "Who는 사람, What은 사물, When은 시간, Where는 장소, Why는 이유, How는 방법을 묻습니다. 의문사 뒤에는 의문문 어순이 이어집니다.",
          table: {
            head: ["의문사", "묻는 것", "예문"],
            rows: [
              ["Who", "사람", "Who wrote this memo?"],
              ["When", "시간", "When does the store close?"],
              ["How", "방법·정도", "How do I reset the password?"]
            ]
          },
          note: "주어를 묻는 Who 는 의문사가 곧 주어이므로 Who wrote ~ 처럼 어순을 바꾸지 않습니다."
        },
        {
          h: "부가의문문 — isn't it? don't you?",
          body: "앞 문장이 긍정이면 부정으로, 부정이면 긍정으로 짧게 되묻습니다. be동사·조동사는 그대로 반복하고, 일반동사는 do, does, did를 씁니다.",
          examples: [
            { en: "The deadline is Friday, isn't it?", ko: "마감이 금요일이죠, 그렇지 않나요?" },
            { en: "You did not send the invoice, did you?", ko: "송장을 보내지 않으셨죠?" }
          ]
        },
        {
          h: "의문문에 대한 짧은 대답",
          body: "Yes와 No 뒤에는 대명사 주어와 be동사·조동사를 씁니다. 동사는 반복하지 않고 조동사로만 답합니다.",
          examples: [
            { en: "Yes, I do.", ko: "네, 그렇습니다." },
            { en: "No, she is not.", ko: "아니요, 그렇지 않습니다." }
          ]
        }
      ],
      mistakes: [
        "Where you are going? 처럼 의문문 어순을 쓰지 않는 실수 — Where are you going? 입니다.",
        "부가의문문의 긍정·부정을 뒤집지 않는 실수 — 긍정 문장에는 부정 부가의문문을 씁니다."
      ],
      practice: [
        { q: "____ did the client request a refund?", opts: ["Why", "Who", "Whose", "Which"], a: "Why", why: "이유를 묻는 문장이므로 Why 를 씁니다." },
        { q: "The shipment arrived yesterday, ____?", opts: ["did it", "didn't it", "wasn't it", "is it"], a: "didn't it", why: "긍정 과거 문장이므로 부정 부가의문문 didn't it 을 씁니다." },
        { q: "____ you finish the training module last night?", opts: ["Did", "Do", "Are", "Was"], a: "Did", why: "일반동사 과거의 의문문에는 Did 를 씁니다." }
      ]
    },
    {
      no: 11,
      title: "부정문과 There is / are",
      summary: "There is / are로 어떤 것이 존재함을 말하고, some과 any로 수량을 표현합니다.",
      points: [
        {
          h: "There is / There are의 구분",
          body: "뒤에 오는 명사가 단수면 There is, 복수면 There are를 씁니다. 뒤에 나열된 명사가 여러 개면 첫 번째 명사에 맞춥니다.",
          table: {
            head: ["구조", "예문"],
            rows: [
              ["There is + 단수", "There is a seminar today."],
              ["There are + 복수", "There are two openings left."]
            ]
          }
        },
        {
          h: "some과 any",
          body: "긍정문에는 some, 부정문과 의문문에는 any를 씁니다. 권유나 요청을 나타내는 의문문에는 some을 씁니다.",
          examples: [
            { en: "We have some extra chairs in the back.", ko: "뒤쪽에 여분의 의자가 있습니다." },
            { en: "Would you like some coffee?", ko: "커피 좀 드릴까요?" }
          ]
        },
        {
          h: "부정 표현의 정도",
          body: "no는 명사 앞에서 아예 없음을, not ~ any는 하나도 없음을 나타냅니다. hardly, rarely는 부정의 뜻을 가진 부사입니다.",
          examples: [
            { en: "There is no elevator in this building.", ko: "이 건물에는 엘리베이터가 없습니다." },
            { en: "The manager rarely misses a meeting.", ko: "그 부장님은 회의를 거의 빠지지 않습니다." }
          ]
        }
      ],
      mistakes: [
        "There is many reasons. 처럼 복수에 is 를 쓰는 실수 — There are many reasons 입니다.",
        "긍정문에 any 를, 부정문에 some 을 쓰는 실수 — 긍정 some, 부정 any 가 기본입니다."
      ],
      practice: [
        { q: "____ are several positions available in the sales division.", opts: ["There", "It", "They", "Them"], a: "There", why: "복수 명사 앞에서 존재를 나타내므로 There are 를 씁니다." },
        { q: "Do you have ____ questions about the new policy?", opts: ["some", "any", "no", "much"], a: "any", why: "일반적인 의문문에는 any 를 씁니다." },
        { q: "There ____ a maintenance schedule posted near the entrance.", opts: ["are", "is", "were", "have"], a: "is", why: "뒤의 명사 a maintenance schedule 이 단수이므로 is 를 씁니다." }
      ]
    },
    {
      no: 12,
      title: "문장의 5형식과 기초 접속사",
      summary: "동사의 성격에 따라 문장이 5가지 형식으로 나뉩니다. 접속사로 두 문장을 이어 긴 문장을 만듭니다.",
      points: [
        {
          h: "문장의 5형식",
          body: "동사가 목적어와 보어를 필요로 하는지에 따라 형식이 정해집니다. 형식을 알면 빈칸에 올 품사를 판단할 수 있습니다.",
          table: {
            head: ["형식", "구조", "예문"],
            rows: [
              ["1형식", "주어 + 동사", "The train arrived."],
              ["2형식", "주어 + 동사 + 보어", "She became the manager."],
              ["3형식", "주어 + 동사 + 목적어", "We signed the contract."],
              ["4형식", "주어 + 동사 + 사람 + 사물", "He sent me a memo."],
              ["5형식", "주어 + 동사 + 목적어 + 보어", "They elected him chairperson."]
            ]
          }
        },
        {
          h: "등위접속사 and / but / or / so",
          body: "단어와 단어, 문장과 문장을 같은 자격으로 이어 줍니다. 세 개 이상을 나열할 때는 마지막 앞에 and나 or를 씁니다.",
          examples: [
            { en: "The report is short but detailed.", ko: "그 보고서는 짧지만 자세합니다." },
            { en: "Call or email the help desk.", ko: "헬프 데스크에 전화하거나 이메일을 보내세요." }
          ]
        },
        {
          h: "종속접속사 because / when / if",
          body: "종속접속사 뒤에는 주어와 동사가 있는 절이 옵니다. 부사절이 문장 앞에 오면 뒤에 콤마를 찍습니다.",
          examples: [
            { en: "Because the flight was delayed, we missed the connection.", ko: "항공편이 지연되어 우리는 연결편을 놓쳤습니다." },
            { en: "Please call me if the numbers change.", ko: "수치가 바뀌면 저에게 전화해 주세요." }
          ]
        }
      ],
      mistakes: [
        "4형식 동사를 3형식으로 쓸 때 전치사를 빠뜨리는 실수 — He sent a memo to me. 처럼 to 를 넣습니다.",
        "Because the report was late. 처럼 부사절만 남기는 실수 — 주절과 함께 써야 완전한 문장이 됩니다."
      ],
      practice: [
        { q: "The recruiter offered ____ a position in the Seoul office.", opts: ["to me", "me", "I", "mine"], a: "me", why: "offer 는 사람 + 사물을 취하는 4형식 동사이므로 목적격 me 를 씁니다." },
        { q: "____ the traffic was heavy, the team arrived on time.", opts: ["Although", "Because", "So", "And"], a: "Although", why: "양보의 의미로 두 절을 이으므로 Although 를 씁니다." },
        { q: "The new system is faster ____ more reliable.", opts: ["and", "because", "if", "although"], a: "and", why: "두 형용사를 대등하게 이어 주는 등위접속사 and 가 맞습니다." }
      ]
    }
  ]
});
