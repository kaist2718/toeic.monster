/* ============================================================================
 * 초급 영어회화 (A1 ~ A2) — 12과
 * tools/build-pages.mjs 와 감사 도구가 window.CONVERSATION_BOOKS 를 읽습니다.
 * 한 과의 구성: summary → points(표현·발음/억양·예문) → mistakes → practice
 * 문법 교재(data/grammar-*.js)와 같은 구조를 씁니다.
 * ========================================================================== */
window.CONVERSATION_BOOKS = window.CONVERSATION_BOOKS || [];

window.CONVERSATION_BOOKS.push({
  id: "conversation-basic",
  level: "초급",
  cefr: "A1 ~ A2",
  title: "기초 영어회화",
  subtitle: "인사부터 전화까지, 살아남는 12가지 상황",
  desc: "인사·자기소개·주문·길 묻기·전화까지, 영어로 처음 마주치는 12가지 상황을 과별 표현 세트와 발음·억양 안내로 정리한 초급 회화 교재입니다. 과마다 표현 표·예문·흔한 실수·연습 문제를 담았습니다.",
  audience: "영어로 말해 본 적이 거의 없는 성인 학습자, 단어는 알지만 문장이 안 나오는 초급 학습자",
  goal: "일상에서 자주 만나는 상황에서 짧더라도 영어로 먼저 말을 걸고, 되묻고, 대답을 마칠 수 있다.",
  howto: [
    "표현을 눈으로만 읽지 말고, 예문 옆 🔊 버튼으로 들은 뒤 따라 말합니다.",
    "한 과의 표현 3~4개를 골라 실제로 겪을 상황을 떠올리며 소리 내어 두 번씩 말합니다.",
    "연습 문제는 정답을 보지 않고 먼저 풀고, 틀린 과만 다음 날 다시 봅니다."
  ],
  chapters: [
    {
      no: 1,
      title: "인사하고 첫 인사 나누기",
      intro: "인사는 대화의 첫인상을 만드는 자리입니다. 같은 인사도 시간대와 만남의 종류에 따라 표현이 달라지므로, 세 가지 인사와 되묻는 한 마디를 통째로 익혀 두면 첫 대화가 끊기지 않습니다.",
      summary: "영어 인사는 시간대와 만남의 종류에 따라 표현이 달라집니다. 처음 만난 사람에게는 Nice to meet you, 아는 사람에게는 How are you? 를 씁니다.",
      points: [
        {
          h: "시간대별 인사 — Good morning / afternoon / evening",
          body: "아침에는 Good morning, 정오부터 해지기 전까지는 Good afternoon, 해가 진 뒤에는 Good evening 을 씁니다. Good night 은 인사가 아니라 헤어질 때나 잠자리에 들 때 쓰는 말입니다.",
          table: {
            head: ["시간", "인사", "쓰는 순간"],
            rows: [
              ["아침", "Good morning.", "일어나서부터 정오 전까지"],
              ["오후", "Good afternoon.", "정오부터 해지기 전"],
              ["저녁", "Good evening.", "해가 진 뒤 만났을 때"],
              ["헤어질 때", "Good night.", "집에 가거나 잠들기 전"]
            ]
          },
          note: "저녁 인사 Good evening 은 만날 때, Good night 은 헤어질 때입니다. 이 둘을 바꿔 쓰면 어색해집니다."
        },
        {
          h: "처음 만난 사람과 아는 사람 구분하기",
          body: "처음 만난 사람에게는 Nice to meet you. 라고 하고, 이미 아는 사람에게 다시 만나서 반갑다고 할 때는 Nice to see you again. 이라고 합니다. meet 과 see 를 구분하는 것이 핵심입니다.",
          examples: [
            { en: "Nice to meet you. I'm Jisoo.", ko: "만나서 반가워요. 저는 지수입니다." },
            { en: "Nice to see you again, Mr. Kim.", ko: "다시 뵙게 되어 반갑습니다, 김 부장님." }
          ],
          note: "meet 은 처음, see 는 다시 만날 때입니다. How are you doing? 은 How are you? 보다 조금 더 편한 사이에서 씁니다."
        },
        {
          h: "표현 확장 — 만남의 종류에 따라 고르기",
          body: "같은 인사라도 처음 만나는 자리, 오랜만에 만나는 자리, 편한 사이에서 쓰는 말이 다릅니다. 격식 있는 자리에서는 축약형보다 또렷한 형태를 쓰는 편이 안전합니다.",
          table: {
            head: ["만남의 종류", "쓰는 인사", "이어지는 한 마디"],
            rows: [
              ["격식 있는 자리", "Good morning, Mr. Kim.", "It is a pleasure to meet you."],
              ["처음 만나는 동료", "Nice to meet you.", "I have heard a lot about you."],
              ["오랜만에 만난 사이", "It is great to see you again.", "How have you been?"],
              ["편한 친구", "Hey, how's it going?", "Long time no see."],
              ["헤어질 때", "It was nice talking to you.", "Have a great day."]
            ]
          },
          note: "처음 만나 헤어질 때는 Nice to meet you. 대신 It was nice meeting you. 로 시제를 바꿉니다."
        },
        {
          h: "실전 대화 — 처음 만나 세 마디 주고받기",
          body: "인사는 한 마디로 끝나지 않습니다. 인사, 되묻기, 마무리 세 마디를 세트로 익혀 두면 실제 자리에서 순서대로 나옵니다.",
          examples: [
            { en: "Good morning. Nice to meet you.", ko: "안녕하세요. 만나서 반갑습니다." },
            { en: "Nice to meet you too. I'm Mina from the sales team.", ko: "저도 반갑습니다. 저는 영업팀 미나입니다." },
            { en: "It was nice meeting you. See you at the meeting.", ko: "만나서 반가웠습니다. 회의에서 뵙겠습니다." }
          ]
        },
        {
          h: "헷갈리는 인사 짝 구분하기",
          body: "한 글자 차이로 뜻이 달라지는 짝을 모아 두면 실수가 줄어듭니다. 헤어질 때와 만날 때, 다시 만났을 때를 구분하는 것이 핵심입니다.",
          table: {
            head: ["헷갈리는 짝", "쓰는 순간", "예문"],
            rows: [
              ["Good evening / Good night", "만날 때 / 헤어질 때", "Good evening, everyone."],
              ["Nice to meet you / Nice to see you", "처음 / 다시", "Nice to see you again."],
              ["How are you? / How old are you?", "안부 / 나이", "How are you today?"],
              ["See you / See you later", "아무 때나 / 곧 다시", "See you later this week."]
            ]
          },
          note: "How do you do? 는 요즘 거의 쓰지 않습니다. 처음 만나면 Nice to meet you. 로 답합니다."
        },
        {
          h: "되묻는 인사 — How are you? 에 대한 답",
          body: "How are you? 는 인사이지 건강 진단이 아닙니다. 길게 설명하지 않고 Good, thanks. And you? 정도로 답하고 되묻는 것이 자연스럽습니다.",
          table: {
            head: ["질문", "짧은 대답", "한 마디 더"],
            rows: [
              ["How are you?", "Good, thanks.", "And you?"],
              ["How's it going?", "Not bad.", "How about you?"],
              ["How have you been?", "Pretty good.", "Long time no see."]
            ]
          },
          note: "And you? 는 문장이 아니라 관용 표현이라 뒤에 아무것도 붙이지 않습니다. And you are? 라고 하면 상대의 이름을 묻는 다른 질문이 됩니다."
        }
      ],
      mistakes: [
        "Good night 을 만날 때 인사로 쓰는 실수 — 만날 때는 Good evening, 헤어질 때 Good night 입니다.",
        "How are you? 에 I'm so tired because I worked late yesterday. 처럼 길게 답하는 실수 — 인사에는 짧게 답하고, 자세한 이야기는 상대가 물어볼 때 합니다.",
        "Good night. 을 만날 때 인사로 쓰는 실수 — 저녁에 만나면 Good evening. 이고, Good night. 은 헤어질 때나 잠들기 전에 씁니다.",
        "Nice to meet you. 를 두 번째 만남에도 그대로 쓰는 실수 — 다시 만났을 때는 Nice to see you again. 입니다.",
        "인사만 하고 끝내는 실수 — How are you? 뒤에는 And you? 나 Have a great day. 처럼 한 마디를 더 붙여야 대화가 이어집니다."
      ],
      practice: [
        { q: "오랜만에 만난 거래처 담당자에게 건넬 인사로 알맞은 것은?", opts: ["Nice to see you again.", "Nice to meet you.", "Good night.", "How old are you?"], a: "Nice to see you again.", why: "다시 만난 사람에게는 meet 대신 see 를 써서 Nice to see you again. 이라고 합니다." },
        { q: "저녁 식사 자리에서 헤어질 때 알맞은 인사는?", opts: ["Good evening.", "Good night.", "Good afternoon.", "Good morning."], a: "Good night.", why: "헤어질 때나 잠들기 전에는 Good night. 을 씁니다." },
        { q: "A: Nice to meet you. — B: ____", opts: ["Nice to meet you too.", "Nice to meeting you.", "You too nice.", "Me too meet."], a: "Nice to meet you too.", why: "같은 인사를 돌려줄 때는 문장 끝에 too 를 붙입니다." },
        { q: "격식 있는 자리에서 처음 만난 사람에게 건넬 인사로 가장 알맞은 것은?", opts: ["Hey, what's up?", "It is a pleasure to meet you.", "Long time no see.", "Good night."], a: "It is a pleasure to meet you.", why: "격식 자리에서는 축약형보다 It is a pleasure to meet you. 가 어울립니다." },
        { q: "만나서 헤어질 때 쓰는 표현으로 알맞은 것은?", opts: ["Nice to meet you.", "It was nice meeting you.", "How are you?", "Good evening."], a: "It was nice meeting you.", why: "헤어질 때는 만남이 끝났으므로 meeting 으로 형태를 바꿉니다." },
        { q: "해가 진 뒤 회의실에서 처음 만난 동료에게 건넬 인사로 알맞은 것은?", opts: ["Good night.", "Good evening.", "Good afternoon.", "Good morning."], a: "Good evening.", why: "해가 진 뒤 만날 때는 Good evening 입니다. Good night 은 헤어질 때 쓰는 말입니다." },
        { q: "이미 아는 거래처 담당자를 다시 만났습니다. 알맞은 인사는?", opts: ["Nice to meet you.", "Nice to see you again.", "How old are you?", "What do you do?"], a: "Nice to see you again.", why: "이미 만난 사람에게 다시 반갑다고 할 때는 meet 대신 see 를 씁니다." },
        { q: "A: How are you? — B: ____", opts: ["Good, thanks. And you?", "I'm thirty years old.", "My name is Mina.", "Yes, I am."], a: "Good, thanks. And you?", why: "How are you? 는 인사이므로 짧게 답하고 되묻는 것이 자연스럽습니다." }
      ]
    },
    {
      no: 2,
      title: "자기소개 — 이름·나이·출신·직업",
      intro: "자기소개는 정보 네 개를 정해진 순서로 말하면 끝납니다. 이름, 출신, 사는 곳, 하는 일을 짧은 문장으로 이어 붙이는 연습을 해 두면 첫 만남에서 막히지 않습니다.",
      summary: "자기소개는 네 가지 정보를 순서대로 말하면 완성됩니다. 이름, 출신, 사는 곳, 하는 일입니다.",
      points: [
        {
          h: "이름 말하기 — I'm / My name is",
          body: "이름은 I'm Jisoo. 또는 My name is Jisoo Kim. 으로 말합니다. 격식 있는 자리에서는 I'm 보다 My name is 가, 편한 자리에서는 I'm 이 자연스럽습니다.",
          examples: [
            { en: "Hi, I'm Jisoo. Nice to meet you.", ko: "안녕하세요, 저는 지수입니다. 만나서 반갑습니다." },
            { en: "My name is Jisoo Kim, and I'm with the planning team.", ko: "제 이름은 김지수이고, 기획팀 소속입니다." }
          ],
          note: "My name is 다음에는 성이 아니라 이름이 먼저 오는 것이 영어식 순서입니다. 이름을 되물을 때는 And you? 또는 What's your name? 을 씁니다."
        },
        {
          h: "출신과 사는 곳 — I'm from / I live in",
          body: "출신은 I'm from Korea. 처럼 from 을, 현재 사는 곳은 I live in Seoul. 처럼 live in 을 씁니다. 출신과 거주지를 구분해서 말해야 오해가 없습니다.",
          table: {
            head: ["묻는 말", "답하는 표현", "보기"],
            rows: [
              ["Where are you from?", "I'm from ~.", "I'm from Busan."],
              ["Where do you live?", "I live in ~.", "I live in Seoul."],
              ["How long have you lived there?", "I've lived there for ~.", "I've lived there for three years."]
            ]
          },
          note: "I'm from Korea. 와 I'm Korean. 은 뜻이 비슷하지만, from 은 출신지, Korean 은 국적을 강조합니다."
        },
        {
          h: "표현 확장 — 자기소개 순서 잡기",
          body: "자기소개는 정보를 나열하는 것이 아니라 순서를 갖춰 말하는 일입니다. 이름에서 시작해 출신, 거주지, 하는 일 순으로 이어 가면 듣는 사람이 따라오기 쉽습니다.",
          table: {
            head: ["순서", "표현", "보기"],
            rows: [
              ["이름", "I'm / My name is", "I'm Jisoo Kim."],
              ["출신", "I'm from", "I'm from Busan."],
              ["사는 곳", "I live in", "I live in Seoul now."],
              ["하는 일", "I work as / I'm a", "I work as a designer."],
              ["소속", "I'm with", "I'm with the planning team."]
            ]
          },
          note: "소속은 I'm with + 팀·회사, 직업은 I'm a + 직업명으로 나눠 씁니다."
        },
        {
          h: "실전 대화 — 첫 만남에서 자기소개",
          body: "실제 자리에서는 자기소개 뒤에 상대의 소개가 이어집니다. 내 정보 네 문장과 되묻는 한 문장을 세트로 연습해 둡니다.",
          examples: [
            { en: "Hello, I'm Jisoo Kim. I'm from Busan.", ko: "안녕하세요, 저는 김지수입니다. 부산 출신입니다." },
            { en: "I live in Seoul and work as a designer.", ko: "서울에 살고 디자이너로 일하고 있습니다." },
            { en: "Nice to meet you. What do you do?", ko: "반갑습니다. 무슨 일을 하세요?" }
          ]
        },
        {
          h: "헷갈리는 자기소개 표현",
          body: "자기소개에서 자주 틀리는 형태를 짝으로 모아 두면 검사대에서 바로 고칠 수 있습니다. 특히 이름 순서와 직업 표현은 첫 문장에 나오므로 중요합니다.",
          table: {
            head: ["헷갈리는 표현", "맞는 형태", "설명"],
            rows: [
              ["My job is a teacher.", "I'm a teacher.", "job 과 사람을 연결하지 않습니다."],
              ["I'm Kim Jisoo.", "I'm Jisoo Kim.", "영어는 이름 다음에 성입니다."],
              ["What's your job? (첫 질문)", "What do you do?", "직업을 물을 때는 이 표현이 자연스럽습니다."],
              ["I'm thirty years old.", "나이", "시각은 It's, 나이는 I'm 을 씁니다."]
            ]
          },
          note: "나이는 I'm thirty. 처럼 years old 를 줄여 말해도 됩니다."
        },
        {
          h: "직업 묻고 답하기 — What do you do?",
          body: "직업을 물을 때 What is your job? 보다 What do you do? 가 훨씬 자연스럽습니다. 답할 때는 I work for + 회사, I work as + 직업 형태로 구분합니다.",
          table: {
            head: ["표현", "뒤에 오는 것", "예문"],
            rows: [
              ["I work for ~", "회사·기관 이름", "I work for a trading company."],
              ["I work as ~", "직업·역할", "I work as a designer."],
              ["I work in ~", "부서·분야", "I work in sales."],
              ["I'm in charge of ~", "담당 업무", "I'm in charge of shipping."]
            ]
          },
          note: "What do you do? 는 직업을 묻는 말이고, What are you doing? 은 지금 무엇을 하고 있느냐는 다른 질문입니다."
        }
      ],
      mistakes: [
        "What is your job? 을 첫 질문으로 쓰는 실수 — 문법적으로 틀리진 않지만 다소 딱딱합니다. What do you do? 가 자연스럽습니다.",
        "My job is a teacher. 라고 하는 실수 — job 과 사람을 연결할 수 없습니다. I'm a teacher. 또는 I work as a teacher. 가 맞습니다.",
        "My name is Kim Jisoo. 라고 하는 실수 — 영어 이름 순서는 이름이 먼저입니다. I'm Jisoo Kim. 또는 My name is Jisoo Kim. 입니다.",
        "출신과 거주지를 뭉뚱그리는 실수 — 태어난 곳은 I'm from, 지금 사는 곳은 I live in 으로 나눠 말합니다.",
        "직업을 물을 때 What is your business? 라고 하는 실수 — What do you do? 또는 What do you do for a living? 이 자연스럽니다."
      ],
      practice: [
        { q: "영어 순서에 맞게 이름을 말한 것은?", opts: ["I'm Kim Jisoo.", "I'm Jisoo Kim.", "I'm name Jisoo.", "My name Jisoo."], a: "I'm Jisoo Kim.", why: "영어에서는 이름이 먼저 오고 성이 뒤에 옵니다." },
        { q: "태어난 곳과 지금 사는 곳을 모두 바르게 말한 문장은?", opts: ["I'm from Busan and I live in Seoul.", "I live from Busan.", "I'm in Busan live Seoul.", "I from Busan live Seoul."], a: "I'm from Busan and I live in Seoul.", why: "출신은 be from, 거주지는 live in 으로 나눠 씁니다." },
        { q: "직업을 묻는 가장 자연스러운 질문은?", opts: ["What is your business?", "What do you do?", "How is your job?", "Where is your work?"], a: "What do you do?", why: "직업을 물을 때는 What do you do? 를 씁니다." },
        { q: "A: What do you do? — B: ____", opts: ["I'm a teacher.", "My job is a teacher.", "I do teacher.", "I'm teacher work."], a: "I'm a teacher.", why: "직업은 I'm a + 직업명으로 말하고 관사 a 를 빠뜨리지 않습니다." },
        { q: "소속 팀을 말하는 표현으로 알맞은 것은?", opts: ["I'm with the planning team.", "I'm planning team.", "I with team.", "My team is planning."], a: "I'm with the planning team.", why: "소속은 I'm with + 팀·회사로 말합니다." },
        { q: "직업을 물을 때 가장 자연스러운 표현은?", opts: ["What are you doing?", "What do you do?", "Who are you?", "How are you?"], a: "What do you do?", why: "What do you do? 가 직업을 묻는 관용 표현입니다. What are you doing? 은 지금 하는 일을 묻습니다." },
        { q: "A: Where are you from? — B: ____", opts: ["I live in Seoul.", "I'm from Busan.", "I'm fine, thank you.", "I work as a nurse."], a: "I'm from Busan.", why: "Where are you from? 은 출신지를 묻는 질문이므로 I'm from ~ 으로 답합니다." },
        { q: "회사 이름을 말할 때 알맞은 표현은?", opts: ["I work as Samsung.", "I work for Samsung.", "I work in Samsung.", "I work of Samsung."], a: "I work for Samsung.", why: "회사는 work for, 직업·역할은 work as, 부서·분야는 work in 을 씁니다." }
      ]
    },
    {
      no: 3,
      title: "사람 소개하고 안부 묻기",
      intro: "사람을 소개하는 자리에서는 순서와 호칭이 중요합니다. This is 로 시작해 관계를 붙이고, 안부를 묻고 짧게 반응하는 세 마디를 익혀 두면 어색한 침묵이 줄어듭니다.",
      summary: "제삼자를 소개할 때는 This is ~ 로 시작합니다. 소개한 뒤에는 상대의 안부나 관계를 한 마디 덧붙이면 대화가 이어집니다.",
      points: [
        {
          h: "사람 소개하기 — This is ~",
          body: "사람을 소개할 때는 He is 나 She is 가 아니라 This is 를 씁니다. 상대가 눈앞에 있기 때문에 this 를 쓰는 것이 영어식 관습입니다.",
          examples: [
            { en: "This is my colleague, Mina.", ko: "제 동료 미나입니다." },
            { en: "Jisoo, this is Mr. Park from the sales team.", ko: "지수, 이쪽은 영업팀 박 부장님입니다." }
          ],
          note: "소개할 때는 이름만 말하지 말고 소속이나 관계를 한 마디 붙입니다. This is Mina. She's on my team. 처럼 이어 가면 대화가 자연스럽습니다."
        },
        {
          h: "안부 묻기 — How's ~?",
          body: "이미 아는 사람의 안부는 How's 로 시작합니다. 사람뿐 아니라 업무·프로젝트에도 쓸 수 있어 활용 범위가 넓습니다.",
          table: {
            head: ["표현", "대상", "예문"],
            rows: [
              ["How's ~?", "사람·상황", "How's your family?"],
              ["How's ~ going?", "진행 중인 일", "How's the project going?"],
              ["How was ~?", "지나간 일", "How was your trip?"],
              ["Say hello to ~ for me.", "안부 전하기", "Say hello to your wife for me."]
            ]
          },
          note: "Say hello to A for me. 는 A 에게 안부를 전해 달라는 표현입니다. 한국어의 '안부 전해 주세요'와 같은 자리에서 씁니다."
        },
        {
          h: "표현 확장 — 관계와 자리별 소개",
          body: "소개는 상대와의 관계를 한 마디로 붙여 주는 일입니다. 격식 자리에서는 직함을 이름 뒤에 두고, 편한 자리에서는 이름만 불러도 됩니다.",
          table: {
            head: ["소개할 사람", "쓰는 표현", "붙이는 정보"],
            rows: [
              ["동료", "This is my colleague, Mina.", "She works in sales."],
              ["상사", "This is Mr. Park, our team leader.", "He joined last year."],
              ["친구", "This is my friend Jisoo.", "We went to school together."],
              ["고객", "This is Ms. Han from Han Trading.", "She is here for the meeting."],
              ["여러 명", "These are my teammates.", "They are visiting from Busan."]
            ]
          },
          note: "격식 자리에서는 직함을 이름 뒤에 붙입니다. Mr. Park, our team leader."
        },
        {
          h: "실전 대화 — 소개하고 안부까지",
          body: "소개한 뒤에는 안부를 묻는 한 마디를 붙입니다. 상대의 답을 듣고 짧게 반응하면 세 사람이 함께 있는 자리에서도 대화가 이어집니다.",
          examples: [
            { en: "This is my colleague, Mina. She works in sales.", ko: "제 동료 미나입니다. 영업팀에서 일합니다." },
            { en: "Nice to meet you, Mina. How's the new office?", ko: "반갑습니다, 미나. 새 사무실은 어때요?" },
            { en: "It's much bigger. You should visit us.", ko: "훨씬 넓어요. 한번 놀러 오세요." }
          ]
        },
        {
          h: "반응 한 마디로 대화 이어 가기",
          body: "상대의 말을 듣고 반응 없이 다음 질문으로 넘어가면 대화가 끊깁니다. 짧은 반응을 먼저 넣고 이어 가는 습관을 들입니다.",
          table: {
            head: ["상대의 말", "반응 표현", "느낌"],
            rows: [
              ["좋은 소식", "That sounds great.", "좋네요."],
              ["놀라운 소식", "Oh, really?", "정말요?"],
              ["안 좋은 소식", "I'm sorry to hear that.", "안됐네요."],
              ["처음 듣는 일", "I didn't know that.", "몰랐어요."],
              ["이해가 될 때", "That makes sense.", "그렇군요."]
            ]
          },
          note: "반응은 길 필요가 없습니다. 세 단어 안팎의 짧은 문장이면 충분합니다."
        },
        {
          h: "대화 이어 가기 — 짧은 반응",
          body: "소개를 받은 뒤에는 반갑다는 말과 함께 상대에 대해 한 가지를 묻습니다. 이때 Yes/No 로 끝나지 않는 질문을 고르면 대화가 길어집니다.",
          examples: [
            { en: "Nice to meet you, Mina. How long have you worked here?", ko: "만나서 반갑습니다, 미나 씨. 여기서 일하신 지 얼마나 되셨어요?" },
            { en: "I've heard a lot about you.", ko: "이야기 많이 들었습니다." }
          ],
          note: "I've heard a lot about you. 는 좋은 의미로 쓰는 관용 표현입니다. 처음 만난 사람에게 자연스럽게 쓸 수 있습니다."
        }
      ],
      mistakes: [
        "사람을 소개할 때 He is my friend. 처럼 3인칭 대명사로 시작하는 실수 — 상대가 앞에 있으면 This is 로 시작합니다.",
        "안부를 물은 뒤 대답을 듣고 아무 반응도 하지 않는 실수 — Oh, really? That sounds good. 같은 짧은 반응을 넣어야 대화가 끊기지 않습니다.",
        "소개할 때 He is my friend. 처럼 3인칭 대명사로 시작하는 실수 — 상대가 앞에 있으면 This is 로 시작합니다.",
        "여러 사람을 This is 로 소개하는 실수 — 둘 이상이면 These are 로 받아야 합니다.",
        "직함을 이름 앞에 붙이는 실수 — 영어는 이름 다음에 직함이 옵니다. Mr. Park, our team leader."
      ],
      practice: [
        { q: "동료를 소개할 때 알맞은 표현은?", opts: ["He is my colleague.", "This is my colleague, Mina.", "You are my colleague.", "Mina is colleague."], a: "This is my colleague, Mina.", why: "앞에 있는 사람을 소개할 때는 This is 로 시작합니다." },
        { q: "안 좋은 소식을 들었을 때의 반응은?", opts: ["That sounds great.", "I'm sorry to hear that.", "Oh, really?", "I didn't know that."], a: "I'm sorry to hear that.", why: "안 좋은 소식에는 I'm sorry to hear that. 으로 공감을 먼저 보입니다." },
        { q: "안부를 묻는 표현으로 알맞은 것은?", opts: ["How's the new project?", "How the new project?", "What's the new project?", "How is new project going?"], a: "How's the new project?", why: "안부는 How's + 명사? 형태로 묻습니다." },
        { q: "A: I got the promotion. — B: ____", opts: ["That sounds great.", "I'm sorry to hear that.", "Good night.", "How much is it?"], a: "That sounds great.", why: "좋은 소식에는 That sounds great. 같은 긍정적인 반응을 보입니다." },
        { q: "여러 사람을 한 번에 소개할 때 알맞은 문장은?", opts: ["These are my teammates.", "This are my teammates.", "They is my teammates.", "This is my teammates."], a: "These are my teammates.", why: "여러 사람은 These are 로 받습니다." },
        { q: "옆에 있는 동료를 거래처 사람에게 소개할 때 알맞은 표현은?", opts: ["He is my colleague, Mina.", "This is my colleague, Mina.", "You are my colleague, Mina.", "I am my colleague, Mina."], a: "This is my colleague, Mina.", why: "눈앞에 있는 사람을 소개할 때는 This is ~ 를 씁니다." },
        { q: "상대의 진행 중인 업무를 물을 때 알맞은 것은?", opts: ["How's the project going?", "How was the project?", "What is the project?", "Who is the project?"], a: "How's the project going?", why: "진행 중인 일의 상황을 물을 때는 How's ~ going? 을 씁니다." },
        { q: "A: This is my new manager, Mr. Lee. — B: ____", opts: ["Yes, please.", "Nice to meet you. How long have you been with the company?", "No, thank you.", "I'm sorry to hear that."], a: "Nice to meet you. How long have you been with the company?", why: "소개를 받으면 반갑다는 말과 함께 상대에 대한 질문을 더해 대화를 이어 갑니다." }
      ]
    },
    {
      no: 4,
      title: "숫자·시간·날짜 말하기",
      intro: "숫자와 시간은 들리면 바로 답이 나와야 하는 정보입니다. 시각, 날짜, 금액, 층수를 읽는 규칙을 따로 익혀 두면 예약과 주문 상황에서 당황하지 않습니다.",
      summary: "시간과 날짜는 숫자 읽기에서 시작합니다. 시각은 at, 요일은 on, 월은 in 을 쓴다는 규칙을 먼저 익힙니다.",
      points: [
        {
          h: "시각 묻고 답하기 — What time / It's",
          body: "시각을 물을 때는 What time is it? 또는 정중하게 Could you tell me the time? 을 씁니다. 답할 때는 It's 뒤에 시각을 붙입니다.",
          table: {
            head: ["시각", "두 가지 읽기", "쓰는 자리"],
            rows: [
              ["09:00", "nine o'clock / nine", "정각"],
              ["09:15", "nine fifteen / a quarter past nine", "15분"],
              ["09:30", "nine thirty / half past nine", "30분"],
              ["09:45", "nine forty-five / a quarter to ten", "다음 정각 15분 전"]
            ]
          },
          note: "일상 회화에서는 nine fifteen 처럼 숫자만 읽는 쪽이 훨씬 흔합니다. a quarter past, half past 는 격식 있거나 영국식에서 자주 씁니다."
        },
        {
          h: "날짜와 요일 — on / in",
          body: "요일과 날짜에는 on 을, 월과 연도에는 in 을 씁니다. 이 하나만 익혀도 약속 잡기가 훨씬 쉬워집니다.",
          table: {
            head: ["말하는 것", "전치사", "예문"],
            rows: [
              ["요일", "on", "on Monday"],
              ["날짜", "on", "on May fifth"],
              ["월", "in", "in May"],
              ["연도", "in", "in 2027"],
              ["시각", "at", "at three o'clock"]
            ]
          },
          note: "on Monday morning 처럼 요일과 시간대를 함께 쓸 때는 가장 가까운 명사(morning)를 따라 in 이 아니라 on 을 씁니다."
        },
        {
          h: "표현 확장 — 시간과 날짜 묻고 답하기",
          body: "시간과 날짜는 묻는 표현이 정해져 있습니다. 무엇을 묻는지에 따라 what time, when, how long 을 골라 쓰면 대답도 짧아집니다.",
          table: {
            head: ["묻는 말", "답하는 표현", "보기"],
            rows: [
              ["What time is it?", "It's + 시각", "It's half past nine."],
              ["When is the meeting?", "on + 요일·날짜", "It's on Wednesday."],
              ["What month is it?", "in + 월", "It's in May."],
              ["How long does it take?", "It takes + 시간", "It takes twenty minutes."],
              ["What's the date today?", "It's + 월 + 서수", "It's May fifth."]
            ]
          },
          note: "시각 뒤에 a.m. 과 p.m. 을 붙이면 오전·오후가 분명해집니다. It's nine a.m. 처럼 씁니다."
        },
        {
          h: "실전 대화 — 예약 시간 확인하기",
          body: "예약과 방문에서는 시간을 두 번 확인하는 습관이 좋습니다. 열리는 시각을 묻고, 지금 시각을 다시 확인하는 흐름을 익힙니다.",
          examples: [
            { en: "What time does the office open?", ko: "사무실은 몇 시에 여나요?" },
            { en: "It opens at nine a.m. on weekdays.", ko: "평일에는 오전 9시에 엽니다." },
            { en: "Thanks. What time is it now?", ko: "고맙습니다. 지금 몇 시예요?" }
          ]
        },
        {
          h: "숫자 읽기 — 전화번호·금액·방 번호",
          body: "숫자는 종류에 따라 읽는 법이 다릅니다. 전화번호는 한 자리씩, 금액은 단위를 붙여, 날짜는 서수로 읽습니다.",
          table: {
            head: ["종류", "읽는 법", "보기"],
            rows: [
              ["전화번호", "한 자리씩", "zero one zero, three five five five"],
              ["금액", "숫자 + dollars", "twenty-five dollars"],
              ["층수", "서수", "the third floor"],
              ["방 번호", "숫자를 나누어", "room four oh two"],
              ["날짜", "서수로 읽기", "May fifth"]
            ]
          },
          note: "전화번호에서 0 은 zero 또는 oh 로 읽습니다. 방 번호와 주소에서는 oh 가 자연스럽습니다."
        },
        {
          h: "숫자 읽기 — 전화번호·금액·층수",
          body: "전화번호는 한 자리씩 끊어 읽고, 0 은 zero 또는 oh 로 읽습니다. 금액은 숫자 뒤에 dollars 또는 won 을 붙이고, 층수는 서수로 읽습니다.",
          examples: [
            { en: "My number is oh-one-oh, two-three-four-five, six-seven-eight-nine.", ko: "제 번호는 010-2345-6789 입니다." },
            { en: "It's twenty-five dollars, and the office is on the tenth floor.", ko: "25달러이고, 사무실은 10층에 있습니다." }
          ],
          note: "같은 숫자를 두 번 읽을 때는 double 을 씁니다. 077 은 oh double seven 입니다."
        }
      ],
      mistakes: [
        "It's nine. 대신 I'm nine. 이라고 하는 실수 — It's 는 시각, I'm 은 나이에 씁니다.",
        "on May, in Monday 처럼 전치사를 바꾸는 실수 — 월은 in, 요일·날짜는 on 입니다.",
        "날짜를 May five 로 읽는 실수 — 날짜는 서수로 읽어 May fifth 입니다.",
        "전화번호를 하나의 큰 숫자로 읽는 실수 — 전화번호는 한 자리씩 끊어 읽습니다.",
        "층수를 기수로 말하는 실수 — 층수는 서수로 말해 the third floor 입니다."
      ],
      practice: [
        { q: "회의가 수요일이라는 뜻의 문장은?", opts: ["The meeting is in Wednesday.", "The meeting is on Wednesday.", "The meeting is at Wednesday.", "The meeting is to Wednesday."], a: "The meeting is on Wednesday.", why: "요일·날짜 앞에는 on 을 씁니다." },
        { q: "행사가 5월이라는 뜻의 문장은?", opts: ["It's on May.", "It's in May.", "It's at May.", "It's to May."], a: "It's in May.", why: "월 앞에는 in 을 씁니다." },
        { q: "5월 5일을 바르게 읽은 것은?", opts: ["May five", "May fifth", "five May", "the May five"], a: "May fifth", why: "날짜는 서수로 읽습니다." },
        { q: "전화번호의 0 을 읽는 방법으로 알맞은 것은?", opts: ["zero 또는 oh", "one", "o'clock", "nothing"], a: "zero 또는 oh", why: "전화번호에서는 0 을 zero 또는 oh 로 한 자리씩 읽습니다." },
        { q: "A: What time is it? — B: ____", opts: ["It's half past nine.", "I'm half past nine.", "It half past nine.", "They are half past nine."], a: "It's half past nine.", why: "시각은 It's 로 시작합니다." },
        { q: "약속이 5월 어느 날에 잡혔습니다. 알맞은 표현은?", opts: ["on May", "in May", "at May", "to May"], a: "in May", why: "월 앞에는 in 을 씁니다. 특정 날짜가 정해지면 on May fifth 처럼 on 을 씁니다." },
        { q: "오전 9시 30분을 일상 회화에서 가장 흔히 읽는 방식은?", opts: ["half past nine only", "nine thirty", "nine and half", "thirty nine"], a: "nine thirty", why: "일상에서는 nine thirty 처럼 숫자만 읽는 쪽이 흔합니다. half past nine 은 격식 표현입니다." },
        { q: "A: What time is it? — B: ____", opts: ["I'm three.", "It's three o'clock.", "It has three.", "Three is it."], a: "It's three o'clock.", why: "시각을 말할 때는 It's + 시각 형태를 씁니다." }
      ]
    },
    {
      no: 5,
      title: "물건 사고 가격 묻기",
      intro: "쇼핑 대화는 물건을 찾고 가격을 확인하고 결제하는 순서로 흐릅니다. 여기에 교환과 환불 요청까지 붙여 두면 계산대에서 막히지 않습니다.",
      summary: "가게에서는 묻는 표현과 결정하는 표현 두 가지만 있으면 됩니다. 가격을 묻고, 원하는 것을 가리키고, 결제하겠다고 말합니다.",
      points: [
        {
          h: "가격 묻기 — How much is / are",
          body: "물건 하나면 How much is it?, 여러 개면 How much are they? 를 씁니다. 정중하게는 How much does it cost? 를 씁니다.",
          examples: [
            { en: "How much is this one?", ko: "이것은 얼마예요?" },
            { en: "How much are these two together?", ko: "이 두 개를 함께 사면 얼마예요?" }
          ],
          note: "this one, that one 에서 one 은 앞에 말한 물건을 되풀이하지 않으려고 쓰는 대명사입니다. this 만 쓰면 어색합니다."
        },
        {
          h: "원하는 것 가리키기 — I'd like / Can I see",
          body: "물건을 가리킬 때 I want this. 는 다소 무뚝뚝하게 들립니다. I'd like this one. 이나 Can I see that one? 이 점원에게 쓰기 좋습니다.",
          table: {
            head: ["하고 싶은 말", "표현", "어감"],
            rows: [
              ["저것을 보고 싶어요", "Can I see that one?", "부드러운 요청"],
              ["이것으로 할게요", "I'll take this one.", "결정"],
              ["다른 것도 볼게요", "I'd like to see something else.", "비교"],
              ["그냥 볼게요", "I'm just looking, thanks.", "점원 응대에 대한 답"]
            ]
          },
          note: "점원이 Can I help you? 라고 물을 때 구경만 하는 중이면 I'm just looking, thanks. 로 답하면 됩니다. 침묵하면 계속 따라옵니다."
        },
        {
          h: "표현 확장 — 쇼핑 대화 다섯 단계",
          body: "매장에서는 같은 질문이 순서대로 이어집니다. 찾기, 가격, 결제, 교환, 환불 표현을 세트로 익혀 두면 상황이 바뀌어도 그대로 쓸 수 있습니다.",
          table: {
            head: ["단계", "표현", "뜻"],
            rows: [
              ["찾기", "Do you have this in a smaller size?", "더 작은 사이즈가 있나요?"],
              ["가격", "How much is it?", "얼마예요?"],
              ["결제", "I'll pay by card.", "카드로 결제할게요."],
              ["교환", "Can I exchange it for another size?", "다른 사이즈로 바꿀 수 있나요?"],
              ["환불", "I'd like a refund, please.", "환불받고 싶습니다."]
            ]
          },
          note: "교환은 exchange, 환불은 refund 입니다. 영수증은 this receipt 라고 가리킵니다."
        },
        {
          h: "실전 대화 — 매장에서 묻고 결제하기",
          body: "가게에서 실제로 오가는 세 문장입니다. 물건을 찾고, 값을 듣고, 결제 수단을 확인하는 흐름으로 이어집니다.",
          examples: [
            { en: "Excuse me, do you have this shirt in a medium?", ko: "실례합니다, 이 셔츠 중간 사이즈 있나요?" },
            { en: "Yes, here you are. It's twenty-five dollars.", ko: "네, 여기 있습니다. 25달러입니다." },
            { en: "I'll take it. Can I pay by card?", ko: "이걸로 할게요. 카드로 결제할 수 있나요?" }
          ]
        },
        {
          h: "가격을 묻고 되묻는 표현",
          body: "가격 질문은 한 가지만 알아도 충분하지만, 값을 잘못 들었을 때 다시 확인하는 표현까지 알아 두면 안전합니다.",
          table: {
            head: ["표현", "쓰는 자리", "주의할 점"],
            rows: [
              ["How much is it?", "가장 흔한 가격 질문", "가장 자연스러운 형태입니다."],
              ["What's the price?", "격식 있는 자리", "How much is the price? 는 같은 말을 두 번 합니다."],
              ["How much are they?", "여러 개를 가리킬 때", "복수이므로 are 를 씁니다."],
              ["Is it on sale?", "할인 여부", "세일 중인지 묻습니다."],
              ["Sorry, how much was it?", "값을 다시 확인할 때", "이미 들은 값을 과거형으로 되묻습니다."]
            ]
          },
          note: "값을 되물을 때는 Sorry 를 먼저 붙이면 무례하지 않습니다."
        },
        {
          h: "결제하고 교환·환불 묻기",
          body: "결제는 I'll pay by card. 처럼 pay by + 수단을 씁니다. 교환·환불은 Can I exchange this? / Can I get a refund? 로 묻습니다.",
          examples: [
            { en: "I'll take this one. Can I pay by card?", ko: "이것으로 할게요. 카드로 결제할 수 있나요?" },
            { en: "Can I get a refund if it doesn't fit?", ko: "사이즈가 안 맞으면 환불받을 수 있나요?" }
          ],
          note: "영수증은 receipt 이며 발음은 리시트에 가깝습니다. Do you need the receipt? 는 영수증 필요하냐는 질문입니다."
        }
      ],
      mistakes: [
        "How much is the price? 라고 하는 실수 — how much 와 price 가 같은 것을 묻습니다. How much is it? 또는 What's the price? 중 하나만 씁니다.",
        "I want this. 를 그대로 쓰는 실수 — I'd like this one. 또는 I'll take this one. 이 자연스럽습니다.",
        "교환과 환불을 바꿔 말하는 실수 — 물건을 바꾸는 것은 exchange, 돈을 돌려받는 것은 refund 입니다.",
        "결제 수단을 말할 때 Can I pay in card? 라고 하는 실수 — 수단은 pay by card 입니다.",
        "물건을 건넬 때 Yes, I have. 만 되풀이하는 실수 — 점원은 Here you are. 로 물건을 건넵니다."
      ],
      practice: [
        { q: "가격을 묻는 표현으로 알맞은 것은?", opts: ["How much is the price?", "How much is it?", "How price is it?", "What much is it?"], a: "How much is it?", why: "how much 와 price 를 함께 쓰면 같은 것을 두 번 묻는 문장이 됩니다." },
        { q: "교환을 요청하는 표현은?", opts: ["Can I exchange it for another size?", "Can I refund it?", "I want to return money.", "Give me another one."], a: "Can I exchange it for another size?", why: "물건을 다른 것으로 바꾸는 것은 exchange 입니다." },
        { q: "환불을 요청하는 표현은?", opts: ["I'd like a refund, please.", "I'd like a change, please.", "I'd like a receipt, please.", "I'd like a discount, please."], a: "I'd like a refund, please.", why: "돈을 돌려받는 것은 refund 입니다." },
        { q: "카드 결제가 가능한지 묻는 문장은?", opts: ["Can I pay by card?", "Can I pay with card?", "Can I pay card?", "Can I pay in card?"], a: "Can I pay by card?", why: "결제 수단은 pay by + 수단으로 말합니다." },
        { q: "A: Do you have this in a medium? — B: ____", opts: ["Yes, here you are.", "Yes, I have.", "No, it is medium.", "Yes, medium is you."], a: "Yes, here you are.", why: "물건을 건넬 때는 Here you are. 또는 Here it is. 를 씁니다." },
        { q: "가게에서 구경만 하는 중입니다. 점원에게 알맞은 대답은?", opts: ["I'm just looking, thanks.", "How much is it?", "I'll take it.", "Can I get a refund?"], a: "I'm just looking, thanks.", why: "구경 중이라는 뜻을 전하면 점원이 더 이상 따라오지 않습니다." },
        { q: "물건 하나의 가격을 물을 때 알맞은 것은?", opts: ["How many is it?", "How much is it?", "How long is it?", "How often is it?"], a: "How much is it?", why: "가격은 how much, 개수는 how many 로 묻습니다." },
        { q: "A: Can I help you? — B: ____", opts: ["Can I see that one in the window?", "Yes, I helped you.", "No, I don't help.", "I am helping."], a: "Can I see that one in the window?", why: "점원의 응대에는 보고 싶은 물건을 구체적으로 말하는 것이 자연스럽습니다." }
      ]
    },
    {
      no: 6,
      title: "카페와 식당에서 주문하기",
      intro: "주문은 짧은 문장 몇 개로 끝나는 대화입니다. 주문, 옵션 확인, 결제 확인 순서를 익혀 두면 카페와 식당에서 같은 표현을 그대로 쓸 수 있습니다.",
      summary: "주문은 I'd like 또는 Can I get 으로 시작합니다. 주문한 뒤에는 확인 질문이 오므로 For here or to go? 같은 말에 답할 준비가 필요합니다.",
      points: [
        {
          h: "주문하기 — I'd like / Can I get",
          body: "I want a coffee. 보다 I'd like a coffee. 또는 Can I get a coffee? 가 훨씬 자연스럽습니다. 여기에 please 를 붙이면 충분히 정중합니다.",
          examples: [
            { en: "I'd like a large iced americano, please.", ko: "큰 사이즈 아이스 아메리카노 하나 주세요." },
            { en: "Can I get another fork, please?", ko: "포크 하나만 더 주시겠어요?" }
          ],
          note: "주문할 때 크기와 온도는 형용사 순서(크기 → 온도 → 재료)를 따릅니다. large iced americano 순서가 자연스럽습니다."
        },
        {
          h: "매장·포장·결제 확인",
          body: "카페에서 가장 자주 듣는 확인 질문은 For here or to go? 입니다. 매장에서 먹으면 For here, 포장이면 To go 라고 답합니다.",
          table: {
            head: ["점원의 말", "뜻", "답하기"],
            rows: [
              ["For here or to go?", "매장에서 드시나요, 포장인가요?", "For here, please."],
              ["Anything else?", "더 필요한 것 있나요?", "That's all, thanks."],
              ["What size would you like?", "사이즈 어떻게 해 드릴까요?", "Large, please."],
              ["How would you like to pay?", "결제 어떻게 하시겠어요?", "By card, please."]
            ]
          },
          note: "That's all. 은 그게 전부라는 뜻입니다. No, thank you. 보다 짧고 자연스럽게 주문을 마무리합니다."
        },
        {
          h: "표현 확장 — 주문 대화 다섯 단계",
          body: "주문은 한 문장으로 끝나지 않습니다. 부르기, 주문, 옵션 확인, 포장 여부, 계산까지 순서대로 표현이 정해져 있습니다.",
          table: {
            head: ["단계", "표현", "뜻"],
            rows: [
              ["부르기", "Excuse me.", "여기요."],
              ["주문", "I'd like a latte, please.", "라떼 한 잔 주세요."],
              ["옵션", "Could I have it iced?", "아이스로 주시겠어요?"],
              ["포장 여부", "For here, please. / To go, please.", "매장에서 / 포장"],
              ["계산", "Could we get the bill, please?", "계산서 주시겠어요?"]
            ]
          },
          note: "식당에서 계산서는 bill 이고 미국식으로는 check 라고 합니다."
        },
        {
          h: "실전 대화 — 카페에서 주문하고 포장하기",
          body: "카페에서 실제로 오가는 세 문장입니다. 주문하고, 매장인지 포장인지 확인하고, 마지막에 영수증을 부탁합니다.",
          examples: [
            { en: "Hi, can I get a large iced americano?", ko: "안녕하세요, 큰 아이스 아메리카노 한 잔 주시겠어요?" },
            { en: "For here or to go?", ko: "매장에서 드시나요, 포장인가요?" },
            { en: "To go, please. And could I have a receipt?", ko: "포장이요. 영수증도 주시겠어요?" }
          ]
        },
        {
          h: "요청을 부드럽게 만드는 표현",
          body: "같은 요청도 형태에 따라 인상이 달라집니다. 명령형 대신 부탁의 형태를 골라 쓰면 종업원과의 대화가 편해집니다.",
          table: {
            head: ["그대로 말하기", "부드러운 표현", "차이"],
            rows: [
              ["Give me water.", "Could I have some water?", "부탁은 Could I have 로 시작합니다."],
              ["I want no onions.", "Could you leave out the onions?", "재료를 빼 달라는 요청은 leave out 을 씁니다."],
              ["Change this.", "Could I change my order?", "주문 변경은 change my order 입니다."],
              ["More bread.", "Could we get more bread?", "추가는 get more 로 말합니다."]
            ]
          },
          note: "종업원에게 부탁할 때는 문장 끝에 please 를 붙이는 것이 기본입니다."
        },
        {
          h: "식당에서 요청하기 — 요청은 짧게",
          body: "식당에서 물, 수저, 계산서를 요청할 때는 Could I get / Could we have 형태가 가장 무난합니다. 손을 들고 말하면 됩니다.",
          table: {
            head: ["요청", "표현"],
            rows: [
              ["물 좀 주세요", "Could I get some water, please?"],
              ["주문할게요", "Could we order now?"],
              ["계산서 주세요", "Could we get the check, please?"],
              ["따로 계산해 주세요", "Can we split the bill, please?"]
            ]
          },
          note: "미국에서는 check, 영국에서는 bill 을 주로 씁니다. 어느 쪽을 써도 통합니다."
        }
      ],
      mistakes: [
        "I want a coffee. 를 그대로 쓰는 실수 — 주문에서는 I'd like 또는 Can I get 이 기본입니다.",
        "For here or to go? 에 Yes. 라고 답하는 실수 — 선택 질문이므로 For here. 또는 To go. 중 하나를 골라 답합니다.",
        "Give me water. 처럼 명령형으로 요청하는 실수 — Could I have some water? 가 자연스럽습니다.",
        "계산서를 money 라고 부르는 실수 — 식당 계산서는 the bill 또는 the check 입니다.",
        "주문을 바꿀 때 I want change. 라고 하는 실수 — Could I change my order? 로 말합니다."
      ],
      practice: [
        { q: "카페에서 주문하는 표현으로 가장 자연스러운 것은?", opts: ["I want a coffee.", "I'd like a coffee, please.", "Give me coffee.", "Coffee, you."], a: "I'd like a coffee, please.", why: "주문에서는 I'd like + 명사 + please 가 기본입니다." },
        { q: "포장을 뜻하는 표현은?", opts: ["For here, please.", "To go, please.", "To home, please.", "Take out it."], a: "To go, please.", why: "포장은 To go, please. 로 말합니다." },
        { q: "식당에서 계산서를 요청하는 표현은?", opts: ["Could we get the bill, please?", "Could we get the money, please?", "Give me a bill.", "Where is pay?"], a: "Could we get the bill, please?", why: "계산서는 the bill 이고 정중하게 Could we get 으로 요청합니다." },
        { q: "음식에서 양파를 빼 달라고 요청하는 표현은?", opts: ["Could you leave out the onions?", "Could you take out the onions?", "No onions give.", "I want no onions."], a: "Could you leave out the onions?", why: "재료를 빼 달라는 요청은 leave out 을 씁니다." },
        { q: "A: For here or to go? — B: ____", opts: ["For here, please.", "Yes, please.", "No, thanks.", "Here you are."], a: "For here, please.", why: "선택 질문에는 Yes 대신 두 가지 중 하나를 골라 답합니다." },
        { q: "카페에서 포장하겠다고 답하려면?", opts: ["For here, please.", "To go, please.", "That's all, thanks.", "By card, please."], a: "To go, please.", why: "포장은 to go, 매장에서 먹는 것은 for here 입니다." },
        { q: "주문을 마무리할 때 알맞은 표현은?", opts: ["That's all, thanks.", "Anything else?", "For here or to go?", "What size would you like?"], a: "That's all, thanks.", why: "Anything else? 라는 질문에 그게 전부라고 답하는 표현입니다." },
        { q: "식당에서 계산서를 요청할 때 알맞은 것은?", opts: ["Could we get the check, please?", "Could we get the chalk, please?", "Could we get the chair, please?", "Could we get the change, please?"], a: "Could we get the check, please?", why: "미국식으로 계산서는 check 입니다. change 는 거스름돈이라 뜻이 다릅니다." }
      ]
    },
    {
      no: 7,
      title: "길 묻고 대중교통 이용하기",
      intro: "길을 묻는 대화는 방향을 알아듣는 것보다 되묻는 것이 더 어렵습니다. 묻는 표현과 함께 못 알아들었을 때의 한 마디를 익혀 두면 낯선 곳에서도 길을 찾을 수 있습니다.",
      summary: "길을 물을 때는 Excuse me 로 시작하고, How do I get to ~? 로 목적지를 붙입니다. 대답을 못 알아들었을 때 되묻는 표현도 함께 익힙니다.",
      points: [
        {
          h: "길 묻기 — How do I get to ~?",
          body: "Excuse me. How do I get to the station? 이 기본형입니다. 걷는 길이면 on foot, 대중교통이면 by subway 처럼 수단을 덧붙여 물을 수 있습니다.",
          examples: [
            { en: "Excuse me, how do I get to the city hall?", ko: "실례합니다, 시청에 어떻게 가나요?" },
            { en: "Is it within walking distance?", ko: "걸어갈 만한 거리인가요?" }
          ],
          note: "Is it far from here? 는 여기서 머냐는 질문입니다. 답할 때 It's about ten minutes on foot. 처럼 시간으로 말하면 훨씬 유용합니다."
        },
        {
          h: "방향을 알려 주는 말 알아듣기",
          body: "상대가 알려 주는 방향은 대부분 짧은 명령문입니다. 이 표현들만 익혀도 길 안내를 따라갈 수 있습니다.",
          table: {
            head: ["안내 표현", "뜻"],
            rows: [
              ["Go straight for two blocks.", "두 블록 직진하세요."],
              ["Turn left at the traffic light.", "신호등에서 좌회전하세요."],
              ["It's on your right.", "오른쪽에 있습니다."],
              ["It's across from the bank.", "은행 건너편에 있습니다."],
              ["It's next to the pharmacy.", "약국 옆에 있습니다."]
            ]
          },
          note: "across from 은 길 건너편, next to 는 바로 옆, between A and B 는 A 와 B 사이입니다."
        },
        {
          h: "표현 확장 — 목적지별 길 묻기",
          body: "묻는 표현은 목적지에 따라 조금씩 달라집니다. 가까운 곳을 물을 때는 nearest 를, 걸리는 시간을 물을 때는 on foot 을 붙입니다.",
          table: {
            head: ["목적지", "묻는 표현", "뜻"],
            rows: [
              ["지하철역", "How do I get to the subway station?", "지하철역에 어떻게 가나요?"],
              ["가까운 은행", "Where is the nearest bank?", "가장 가까운 은행이 어디예요?"],
              ["버스 정류장", "Is there a bus stop near here?", "이 근처에 버스 정류장이 있나요?"],
              ["걸리는 시간", "How long does it take on foot?", "걸어서 얼마나 걸려요?"],
              ["환승 여부", "Do I need to transfer?", "환승해야 하나요?"]
            ]
          },
          note: "가까운 곳을 물을 때는 the nearest 를 붙입니다. the nearest station 처럼 씁니다."
        },
        {
          h: "실전 대화 — 길을 묻고 다시 확인하기",
          body: "길을 물으면 방향을 알려 주는 문장이 길게 돌아옵니다. 듣지 못한 부분을 정중하게 다시 부탁하는 흐름까지 함께 익힙니다.",
          examples: [
            { en: "Excuse me, how do I get to the city hall?", ko: "실례합니다, 시청에 어떻게 가나요?" },
            { en: "Go straight and turn left at the second corner.", ko: "직진하다가 두 번째 모퉁이에서 왼쪽으로 도세요." },
            { en: "Sorry, could you say that again more slowly?", ko: "죄송한데 천천히 다시 말씀해 주시겠어요?" }
          ]
        },
        {
          h: "방향을 알려 주는 말 알아듣기",
          body: "방향 안내는 동사로 시작하는 문장이 많습니다. 동사와 전치사만 잡아도 길을 찾을 수 있습니다.",
          table: {
            head: ["표현", "뜻", "함께 나오는 말"],
            rows: [
              ["Go straight", "직진하세요", "for two blocks"],
              ["Turn left", "왼쪽으로 도세요", "at the traffic light"],
              ["It's across from ~", "~ 건너편에 있어요", "the post office"],
              ["It's next to ~", "~ 옆에 있어요", "the cafe"],
              ["Take the second exit", "두 번째 출구로 나가세요", "in the station"]
            ]
          },
          note: "걸어서는 on foot 입니다. by walk 라고 하지 않습니다."
        },
        {
          h: "못 알아들었을 때 되묻기",
          body: "길 안내는 빠르게 지나가기 때문에 되묻는 것이 실력입니다. 이때 Could you say that again? 이나 조금 천천히 말해 달라고 요청합니다.",
          examples: [
            { en: "Sorry, could you say that again more slowly?", ko: "죄송하지만 다시 조금 천천히 말씀해 주시겠어요?" },
            { en: "Which way is the subway station?", ko: "지하철역은 어느 쪽입니까?" }
          ],
          note: "What? 이라고만 되물으면 무례하게 들립니다. Sorry? 또는 Pardon? 을 쓰는 것이 안전합니다."
        }
      ],
      mistakes: [
        "Where is go to the station? 처럼 where 와 how 를 섞는 실수 — 목적지까지 가는 방법은 how do I get to, 위치는 where is 입니다.",
        "되물을 때 What? 을 그대로 쓰는 실수 — Sorry? 또는 Could you repeat that? 을 씁니다.",
        "걸어서 간다고 할 때 by walk 라고 하는 실수 — on foot 이 맞습니다.",
        "방향을 들은 뒤 확인하지 않고 떠나는 실수 — So I turn left at the corner? 처럼 되짚으면 길을 잃지 않습니다.",
        "가까운 곳을 물을 때 the close station 이라고 하는 실수 — the nearest station 이 맞습니다."
      ],
      practice: [
        { q: "목적지까지 가는 방법을 묻는 표현은?", opts: ["How do I get to the museum?", "Where is go to the museum?", "How go museum?", "Where do I get the museum?"], a: "How do I get to the museum?", why: "목적지까지 가는 방법은 How do I get to ~? 로 묻습니다." },
        { q: "가장 가까운 은행의 위치를 묻는 표현은?", opts: ["Where is the nearest bank?", "How do I get the bank?", "Where get bank?", "What is the bank go?"], a: "Where is the nearest bank?", why: "위치는 Where is ~? 로 묻고 가까운 곳은 nearest 를 붙입니다." },
        { q: "못 알아들었을 때 다시 부탁하는 표현은?", opts: ["Could you say that again more slowly?", "What?", "You say again.", "Say slowly you."], a: "Could you say that again more slowly?", why: "다시 부탁할 때는 Could you say that again 을 씁니다." },
        { q: "걸어서 간다는 표현으로 알맞은 것은?", opts: ["on foot", "by walk", "with foot", "on walking"], a: "on foot", why: "걸어서는 on foot 이고 by walk 라고 하지 않습니다." },
        { q: "A: How long does it take on foot? — B: ____", opts: ["About ten minutes.", "About ten money.", "It takes ten foot.", "Yes, please."], a: "About ten minutes.", why: "걸리는 시간은 About + 시간 으로 답합니다." },
        { q: "목적지까지 가는 방법을 물을 때 알맞은 표현은?", opts: ["Where is the station?", "How do I get to the station?", "What is the station?", "Who is at the station?"], a: "How do I get to the station?", why: "가는 방법은 how do I get to, 위치만 물을 때는 where is 를 씁니다." },
        { q: "은행 바로 건너편에 있다고 알려 줄 때 알맞은 말은?", opts: ["It's next to the bank.", "It's across from the bank.", "It's behind the bank.", "It's inside the bank."], a: "It's across from the bank.", why: "길 건너편은 across from 입니다. next to 는 바로 옆입니다." },
        { q: "안내를 못 알아들었을 때 가장 안전한 표현은?", opts: ["What?", "Sorry, could you say that again?", "I don't know English.", "Speak loud."], a: "Sorry, could you say that again?", why: "What? 만 쓰면 무례하게 들립니다. Sorry? 나 정중한 요청 표현을 씁니다." }
      ]
    },
    {
      no: 8,
      title: "하루 일과와 약속 정하기",
      intro: "하루 일과를 말할 때는 습관과 지금 하는 일을 구분해야 합니다. 약속을 잡을 때는 날짜와 시각을 함께 말해야 상대가 바로 답할 수 있습니다.",
      summary: "일과는 빈도 표현과 함께, 약속은 Are you free ~? 로 묻고 정합니다. 시간을 함께 제안하는 표현까지 익히면 약속을 끝까지 마칠 수 있습니다.",
      points: [
        {
          h: "하루 일과 말하기 — usually / always",
          body: "습관은 현재시제로 말하고, 빈도부사(always, usually, often, sometimes)를 일반동사 앞에 둡니다. 시간 표현과 함께 쓰면 하루가 그려집니다.",
          table: {
            head: ["빈도부사", "뜻", "예문"],
            rows: [
              ["always", "항상", "I always check email first."],
              ["usually", "보통", "I usually get to work by nine."],
              ["often", "자주", "We often have lunch together."],
              ["sometimes", "가끔", "I sometimes work late."],
              ["never", "전혀", "I never drink coffee after six."]
            ]
          },
          note: "be동사와 함께 쓸 때는 be동사 뒤에 둡니다. I am usually busy in the morning. 이 맞습니다."
        },
        {
          h: "약속 잡기 — Are you free ~?",
          body: "약속을 잡을 때 Are you free on Friday? 처럼 시간을 붙여 묻습니다. 바로 답하기 어려우면 제안하는 표현으로 시간을 조정합니다.",
          examples: [
            { en: "Are you free on Thursday afternoon?", ko: "목요일 오후에 시간 있으세요?" },
            { en: "How about two o'clock instead?", ko: "그럼 2시는 어떠세요?" }
          ],
          note: "How about ~? 은 제안할 때 가장 널리 쓰는 표현입니다. 뒤에 동사가 오면 -ing 형태를 씁니다. How about meeting at three?"
        },
        {
          h: "표현 확장 — 일과와 약속 표현",
          body: "하루 일과는 빈도 표현과 함께, 약속은 날짜와 시각을 함께 말합니다. 두 상황의 표현을 짝으로 익혀 두면 일정을 묻는 대화가 쉬워집니다.",
          table: {
            head: ["상황", "표현", "뜻"],
            rows: [
              ["일과", "I usually start at nine.", "보통 9시에 시작합니다."],
              ["지금 하는 일", "I'm working on a report now.", "지금 보고서 작업 중입니다."],
              ["약속 제안", "Are you free on Friday?", "금요일 시간 괜찮으세요?"],
              ["약속 확정", "Let's meet at three, then.", "그럼 3시에 만나요."],
              ["약속 미루기", "Can we push it to next week?", "다음 주로 미룰 수 있을까요?"]
            ]
          },
          note: "약속을 잡을 때는 요일과 시각을 함께 말합니다. Are you free on Friday at three?"
        },
        {
          h: "실전 대화 — 약속 잡고 바꾸기",
          body: "약속은 제안, 조정, 확정 세 단계로 흘러갑니다. 상대가 어렵다고 하면 대안 시간을 바로 제시하는 연습을 합니다.",
          examples: [
            { en: "Are you free on Friday afternoon?", ko: "금요일 오후에 시간 괜찮으세요?" },
            { en: "I'm busy until two, but three works.", ko: "두 시까지는 바빠요. 그런데 세 시는 괜찮아요." },
            { en: "Great, let's meet at three in the lobby.", ko: "좋아요, 3시에 로비에서 만나요." }
          ]
        },
        {
          h: "일정을 미룰 때 쓰는 표현 구분",
          body: "미루는 표현은 격식과 상황에 따라 나뉩니다. 가약속인지 완전한 거절인지도 함께 구분해 둡니다.",
          table: {
            head: ["표현", "뜻", "쓰는 자리"],
            rows: [
              ["Let's postpone it.", "미루죠", "가장 격식 있는 표현입니다."],
              ["Can we push it to Friday?", "금요일로 미룰 수 있을까요?", "새 날짜를 제안할 때"],
              ["I need to reschedule.", "일정을 조정해야 합니다.", "취소에 가까운 경우"],
              ["Let's pencil it in.", "일단 잡아 두죠", "확정 전 가약속"],
              ["I have to take a rain check.", "다음으로 미룰게요", "정중한 거절"]
            ]
          },
          note: "회화에서는 push it back to Friday 처럼 back 을 넣기도 합니다."
        },
        {
          h: "약속을 확인하고 미루기",
          body: "약속이 정해지면 마지막에 한 번 확인합니다. 미뤄야 할 때는 사과와 함께 대안 시간을 제시해야 관계가 상하지 않습니다.",
          table: {
            head: ["상황", "표현"],
            rows: [
              ["확인", "So, see you on Friday at three."],
              ["미루기", "I'm sorry, but could we push it to next week?"],
              ["대안 제시", "Would Monday work for you?"],
              ["거절", "That's a shame. Maybe next time."]
            ]
          },
          note: "Would Monday work for you? 는 상대 일정에 맞춰 묻는 정중한 표현입니다. Is Monday okay? 보다 부드럽습니다."
        }
      ],
      mistakes: [
        "I am usually going to work at nine. 처럼 습관에 진행형을 쓰는 실수 — 습관은 현재시제로 씁니다.",
        "Are you free? 만 묻고 시간을 말하지 않는 실수 — Are you free on Friday? 처럼 시간을 붙여야 답할 수 있습니다.",
        "약속을 미룰 때 Let's postpone to Friday. 라고 하는 실수 — Let's postpone it to Friday. 처럼 목적어 it 이 필요합니다.",
        "같은 문장에서 습관과 진행을 섞는 실수 — 보통은 현재시제, 지금 하는 일은 현재진행형으로 나눠 씁니다.",
        "약속을 잡을 때 시간만 말하고 장소를 빼는 실수 — 시간과 장소를 함께 말해 두어야 만날 수 있습니다."
      ],
      practice: [
        { q: "습관을 말하는 올바른 문장은?", opts: ["I usually start work at nine.", "I am usually starting work at nine.", "I start usually work at nine.", "I am start work at nine."], a: "I usually start work at nine.", why: "습관은 현재시제로 말하고 빈도 부사는 일반동사 앞에 둡니다." },
        { q: "약속을 제안하는 표현은?", opts: ["Are you free on Friday?", "Are you free?", "You free Friday?", "Do you free on Friday?"], a: "Are you free on Friday?", why: "약속을 잡을 때는 요일이나 시각을 함께 말합니다." },
        { q: "약속을 다음 주로 미루는 표현은?", opts: ["Can we push it to next week?", "Can we push next week?", "Let's cancel next week.", "Move you next week?"], a: "Can we push it to next week?", why: "미룰 대상 it 과 새 시점을 함께 말합니다." },
        { q: "지금 하는 일을 말하는 문장은?", opts: ["I'm working on a report now.", "I work on a report now.", "I am work a report now.", "I working report now."], a: "I'm working on a report now.", why: "지금 진행 중인 일은 현재진행형으로 말합니다." },
        { q: "A: Are you free on Friday? — B: ____", opts: ["I'm busy until two, but three works.", "Yes, I'm free Friday is.", "No, Friday.", "I am free on Friday yes."], a: "I'm busy until two, but three works.", why: "시간대를 밝히며 대안을 제시하면 약속이 구체적으로 잡힙니다." },
        { q: "평일 습관을 말할 때 알맞은 문장은?", opts: ["I am usually getting to work by nine.", "I usually get to work by nine.", "I usually getting to work by nine.", "I get usually to work by nine."], a: "I usually get to work by nine.", why: "습관은 현재시제로 말하고, 빈도부사는 일반동사 앞에 둡니다." },
        { q: "상대에게 시간을 조정해 제안할 때 알맞은 표현은?", opts: ["How about two o'clock instead?", "Two o'clock is wrong.", "You must come at two.", "I don't like two."], a: "How about two o'clock instead?", why: "How about ~? 은 대안을 부드럽게 제안하는 표현입니다." },
        { q: "약속을 미뤄야 할 때 가장 알맞은 말은?", opts: ["I can't come. Bye.", "I'm sorry, but could we push it to next week?", "The meeting is canceled forever.", "You should change it."], a: "I'm sorry, but could we push it to next week?", why: "사과와 함께 대안 시간을 제시하는 것이 관계를 지키는 방법입니다." }
      ]
    },
    {
      no: 9,
      title: "날씨와 기분 말하기",
      intro: "날씨와 기분은 가벼운 대화의 재료입니다. It's 와 I'm 을 정확히 구분하고, 짧은 공감 표현을 붙이면 짧은 대화도 자연스럽게 이어집니다.",
      summary: "날씨는 It's + 형용사로, 기분은 I feel + 형용사로 말합니다. 날씨 이야기는 어색한 침묵을 깨는 가장 안전한 화제입니다.",
      points: [
        {
          h: "날씨 말하기 — It's + 형용사",
          body: "날씨는 주어를 it 으로 두고 형용사를 붙입니다. 비나 눈이 오는 중이면 It's raining, It's snowing 처럼 진행형을 씁니다.",
          table: {
            head: ["상황", "표현", "뜻"],
            rows: [
              ["맑음", "It's sunny today.", "오늘 화창합니다."],
              ["흐림", "It's cloudy.", "흐립니다."],
              ["비", "It's raining hard.", "비가 세게 옵니다."],
              ["더위", "It's really humid.", "정말 습합니다."],
              ["추위", "It's freezing outside.", "밖이 몹시 춥습니다."]
            ]
          },
          note: "It's cold. 보다 It's freezing. 이 훨씬 추운 느낌입니다. 강도를 나타내는 형용사를 함께 익히면 표현이 살아납니다."
        },
        {
          h: "기분과 컨디션 말하기 — I feel",
          body: "기분은 I feel + 형용사로 말합니다. 몸 상태는 I have a + 증상 형태를 씁니다. 두 가지를 섞지 않는 것이 중요합니다.",
          table: {
            head: ["말하는 것", "표현", "예문"],
            rows: [
              ["기분", "I feel ~", "I feel great today."],
              ["피곤", "I'm exhausted.", "I'm exhausted after the trip."],
              ["몸 상태", "I have a ~", "I have a headache."],
              ["스트레스", "I'm stressed out.", "I'm stressed out about the deadline."]
            ]
          },
          note: "I'm tired. 는 단순 피로, I'm exhausted. 는 기진맥진한 상태입니다. I have a cold. 는 감기에 걸렸다는 뜻이고, I'm cold. 는 춥다는 뜻입니다."
        },
        {
          h: "표현 확장 — 날씨를 말하는 틀",
          body: "날씨는 It's 뒤에 형용사를 붙이거나 -ing 를 붙여 말합니다. 예보를 옮길 때는 be supposed to 를 씁니다.",
          table: {
            head: ["날씨", "표현", "뜻"],
            rows: [
              ["맑음", "It's sunny today.", "오늘 맑아요."],
              ["비", "It's raining now.", "지금 비가 와요."],
              ["더위", "It's hot and humid.", "덥고 습해요."],
              ["추위", "It's freezing outside.", "밖이 몹시 추워요."],
              ["예보", "It's supposed to rain tomorrow.", "내일 비가 온대요."]
            ]
          },
          note: "It's raining 은 지금 내리는 비, It's rainy 는 비 오는 날씨를 뜻합니다."
        },
        {
          h: "실전 대화 — 날씨로 말 걸기",
          body: "날씨는 모르는 사람과도 대화를 여는 안전한 주제입니다. 공감 한 마디와 짧은 정보를 더하는 흐름을 익힙니다.",
          examples: [
            { en: "It's really cold today, isn't it?", ko: "오늘 정말 춥네요, 그렇죠?" },
            { en: "Yes, it is. I should have worn a coat.", ko: "그러네요. 코트를 입고 나올걸 그랬어요." },
            { en: "They say it will be warmer tomorrow.", ko: "내일은 더 따뜻해진대요." }
          ]
        },
        {
          h: "기분과 컨디션 말하기",
          body: "기분은 I'm + 형용사, 증상은 I have + 명사로 말합니다. 두 틀을 섞으면 뜻이 달라집니다.",
          table: {
            head: ["상태", "표현", "주의할 점"],
            rows: [
              ["피곤", "I'm tired.", "have tired 가 아닙니다."],
              ["감기", "I have a cold.", "증상은 have 를 씁니다."],
              ["기대됨", "I'm excited about the trip.", "about + 대상 형태입니다."],
              ["긴장", "I'm a little nervous.", "정도 부사를 붙입니다."],
              ["두통", "I have a headache.", "아픈 곳도 have 를 씁니다."]
            ]
          },
          note: "I'm cold. 는 추위를 느낀다는 뜻이고, I have a cold. 는 감기에 걸렸다는 뜻입니다."
        },
        {
          h: "공감하고 대화 이어 가기",
          body: "날씨나 기분 이야기에 공감을 표하면 대화가 자연스럽게 이어집니다. 짧은 반응 표현을 몇 개 익혀 두면 유용합니다.",
          examples: [
            { en: "Tell me about it. It's been like this all week.", ko: "그러게요. 이번 주 내내 이랬어요." },
            { en: "That sounds tough. Take it easy today.", ko: "힘드셨겠어요. 오늘은 좀 쉬세요." }
          ],
          note: "Tell me about it. 은 나도 그렇다는 뜻의 공감 표현입니다. 직역하면 이야기해 달라는 말이지만 실제로는 동의에 가깝습니다."
        }
      ],
      mistakes: [
        "It's cold. 과 I'm cold. 를 헷갈리는 실수 — It's 는 날씨·온도, I'm 은 나 자신의 상태입니다.",
        "I have tired. 라고 하는 실수 — tired 는 형용사이므로 I'm tired. 로 씁니다. have 는 명사(감기·두통)에 씁니다.",
        "I'm a cold. 라고 하는 실수 — 감기는 I have a cold. 입니다.",
        "예보를 It rains tomorrow. 로 단정해 말하는 실수 — 예보는 It's supposed to rain tomorrow. 로 옮깁니다.",
        "It's cold. 과 I'm cold. 를 구분하지 않는 실수 — 앞은 날씨, 뒤는 내가 추위를 느낀다는 뜻입니다."
      ],
      practice: [
        { q: "날씨를 말하는 올바른 문장은?", opts: ["It's raining now.", "I'm raining now.", "It raining now.", "Rain is now."], a: "It's raining now.", why: "날씨는 It's + 형용사 또는 It's + -ing 로 말합니다." },
        { q: "감기 증상을 말하는 표현은?", opts: ["I have a cold.", "I'm cold.", "It's cold.", "I have cold."], a: "I have a cold.", why: "증상은 have a + 명사로 말합니다. I'm cold. 는 추위를 느낀다는 뜻입니다." },
        { q: "피곤함을 말하는 올바른 문장은?", opts: ["I'm tired.", "I have tired.", "I tired.", "It's tired."], a: "I'm tired.", why: "tired 는 형용사이므로 be동사와 함께 씁니다." },
        { q: "내일 비가 온다는 예보를 옮기는 문장은?", opts: ["It's supposed to rain tomorrow.", "It supposed rain tomorrow.", "It will supposed rain.", "Rain is supposed tomorrow."], a: "It's supposed to rain tomorrow.", why: "예보는 be supposed to + 동사원형으로 말합니다." },
        { q: "A: It's really cold today, isn't it? — B: ____", opts: ["Yes, it is. I should have worn a coat.", "Yes, I am cold today coat.", "No, it is cold.", "I have cold today."], a: "Yes, it is. I should have worn a coat.", why: "날씨에 공감한 뒤 한 마디를 더하면 대화가 이어집니다." },
        { q: "감기에 걸렸다고 말할 때 알맞은 표현은?", opts: ["I'm cold.", "I have a cold.", "It's cold.", "I feel cold."], a: "I have a cold.", why: "감기는 I have a cold. 이고, I'm cold. 는 몸이 춥다는 뜻입니다." },
        { q: "비가 세게 온다고 말할 때 알맞은 것은?", opts: ["It rains big.", "It's raining hard.", "It's rained hard.", "Rain is big today."], a: "It's raining hard.", why: "지금 오는 중이면 진행형 It's raining 을 쓰고, 강도는 hard 로 나타냅니다." },
        { q: "A: I'm exhausted after the move. — B: ____", opts: ["That sounds tough. Take it easy today.", "Yes, I moved yesterday.", "Please move it.", "No, thank you."], a: "That sounds tough. Take it easy today.", why: "상대의 힘든 상황에 공감을 표하고 위로하는 한 마디를 더합니다." }
      ]
    },
    {
      no: 10,
      title: "취미와 좋아하는 것 말하기",
      intro: "취미 이야기는 좋아한다는 말에서 끝나지 않습니다. 얼마나 자주 하는지, 왜 좋아하는지까지 붙이면 대화가 길어집니다.",
      summary: "좋아하는 것은 I like + 명사 또는 -ing 로 말합니다. 취미를 묻고 답한 뒤에는 Why? 나 How often? 로 대화를 늘릴 수 있습니다.",
      points: [
        {
          h: "취미 묻기 — What do you do in your free time?",
          body: "취미를 물을 때 What is your hobby? 도 통하지만, What do you do in your free time? 이나 What do you do for fun? 이 더 자연스럽습니다.",
          examples: [
            { en: "What do you do in your free time?", ko: "여가 시간에 무엇을 하세요?" },
            { en: "Are you into any sports?", ko: "운동 같은 것 좋아하세요?" }
          ],
          note: "be into ~ 는 빠져 있다, 좋아한다는 뜻의 편한 표현입니다. Are you into cooking? 처럼 명사나 -ing 를 붙입니다."
        },
        {
          h: "좋아하는 것 말하기 — like / enjoy / love",
          body: "like 와 love 뒤에는 명사나 -ing 가 옵니다. enjoy 뒤에도 -ing 만 오며, to부정사는 쓰지 않습니다.",
          table: {
            head: ["동사", "뒤에 오는 형태", "예문"],
            rows: [
              ["like", "명사 / -ing", "I like jogging in the park."],
              ["enjoy", "-ing", "I enjoy cooking at home."],
              ["love", "명사 / -ing", "I love old movies."],
              ["be good at", "명사 / -ing", "I'm good at drawing."],
              ["be interested in", "명사 / -ing", "I'm interested in photography."]
            ]
          },
          note: "enjoy 는 enjoy to swim 처럼 쓰지 않습니다. I enjoy swimming. 이 맞습니다. 이 실수는 한국어 화자가 특히 자주 합니다."
        },
        {
          h: "표현 확장 — 취미를 묻고 답하기",
          body: "취미 대화는 묻기, 답하기, 이어 묻기 세 마디로 이어집니다. 각 단계에 쓸 표현을 세트로 익혀 두면 대화가 끊기지 않습니다.",
          table: {
            head: ["단계", "표현", "보기"],
            rows: [
              ["묻기", "What do you do in your free time?", "여가에 뭘 하세요?"],
              ["답하기", "I like / I enjoy", "I enjoy hiking."],
              ["빈도", "How often do you ~?", "Twice a week."],
              ["기간", "How long have you ~?", "For about three years."],
              ["이유", "Why do you like it?", "It helps me relax."]
            ]
          },
          note: "빈도는 once a week, twice a month, three times a year 처럼 말합니다."
        },
        {
          h: "실전 대화 — 취미 이야기 이어 가기",
          body: "취미를 말할 때는 종류, 빈도, 이유를 순서대로 붙입니다. 상대가 이어 묻는 질문도 함께 준비해 둡니다.",
          examples: [
            { en: "What do you do in your free time?", ko: "여가 시간에 뭘 하세요?" },
            { en: "I enjoy hiking. I go twice a month.", ko: "등산을 즐깁니다. 한 달에 두 번 가요." },
            { en: "That sounds fun. Why do you like it?", ko: "재밌겠네요. 왜 좋아하세요?" }
          ]
        },
        {
          h: "like 와 enjoy 뒤에 오는 형태",
          body: "좋아하는 것을 말하는 동사는 뒤에 오는 형태가 다릅니다. 동사별로 짝을 외워 두면 문장을 만들 때 망설이지 않습니다.",
          table: {
            head: ["표현", "뒤에 오는 형태", "예문"],
            rows: [
              ["like", "-ing 또는 to부정사", "I like hiking."],
              ["enjoy", "-ing 만", "I enjoy hiking."],
              ["love", "둘 다 가능", "I love to cook."],
              ["want", "to부정사", "I want to learn guitar."],
              ["be interested in", "-ing", "I'm interested in photography."]
            ]
          },
          note: "enjoy 뒤에는 to부정사를 쓰지 않습니다. I enjoy to cook. 는 틀린 문장입니다."
        },
        {
          h: "취미를 자세히 말하기 — 빈도와 이유",
          body: "취미를 말한 뒤 얼마나 자주 하는지, 왜 좋아하는지 덧붙이면 한 문장이 세 문장이 됩니다.",
          examples: [
            { en: "I go hiking almost every weekend. It helps me clear my head.", ko: "거의 주말마다 등산을 갑니다. 머리를 비우는 데 도움이 됩니다." },
            { en: "I've been learning guitar for about a year now.", ko: "기타를 배운 지 이제 1년쯤 됐습니다." }
          ],
          note: "It helps me clear my head. 는 머리를 비우게 해 준다는 뜻입니다. 이유를 말할 때 쓰기 좋은 표현입니다."
        }
      ],
      mistakes: [
        "I enjoy to cook. 이라고 하는 실수 — enjoy 뒤에는 반드시 -ing 를 씁니다.",
        "My hobby is play soccer. 처럼 be동사 뒤에 동사원형을 쓰는 실수 — My hobby is playing soccer. 또는 I like playing soccer. 로 씁니다.",
        "빈도를 every week twice 라고 하는 실수 — twice a week 처럼 횟수 + a + 기간 순서로 말합니다.",
        "이유를 물었을 때 Because 만 단독으로 답하는 실수 — Because 뒤에 문장을 붙이거나 It helps me relax. 처럼 완전한 문장으로 답합니다.",
        "like 와 enjoy 를 같은 형태로 쓰는 실수 — enjoy 뒤에는 반드시 -ing 가 옵니다."
      ],
      practice: [
        { q: "enjoy 뒤에 올바른 형태는?", opts: ["I enjoy hiking.", "I enjoy to hike.", "I enjoy hike.", "I enjoy to hiking."], a: "I enjoy hiking.", why: "enjoy 뒤에는 동명사 -ing 가 옵니다." },
        { q: "한 달에 두 번이라는 빈도 표현은?", opts: ["twice a month", "two times month", "every month twice", "twice month"], a: "twice a month", why: "빈도는 횟수 + a + 기간 순서로 말합니다." },
        { q: "취미를 묻는 표현은?", opts: ["What do you do in your free time?", "What is your hobby doing?", "How is your free?", "Where do you hobby?"], a: "What do you do in your free time?", why: "취미를 묻는 가장 자연스러운 표현입니다." },
        { q: "배우고 싶은 것을 말하는 문장은?", opts: ["I want to learn guitar.", "I want learn guitar.", "I want learning guitar.", "I want to learning guitar."], a: "I want to learn guitar.", why: "want 뒤에는 to부정사가 옵니다." },
        { q: "A: Why do you like hiking? — B: ____", opts: ["It helps me relax.", "Because hiking.", "Yes, I like.", "It is hiking."], a: "It helps me relax.", why: "이유는 완전한 문장으로 답합니다. Because 만 단독으로 쓰지 않습니다." },
        { q: "enjoy 뒤에 알맞은 형태는?", opts: ["I enjoy to swim.", "I enjoy swimming.", "I enjoy swim.", "I enjoy swam."], a: "I enjoy swimming.", why: "enjoy 뒤에는 동명사(-ing)만 옵니다." },
        { q: "취미를 물을 때 가장 자연스러운 표현은?", opts: ["What is your hobby name?", "What do you do in your free time?", "How is your hobby?", "Where is your hobby?"], a: "What do you do in your free time?", why: "여가 시간에 무엇을 하는지 묻는 형태가 가장 자연스럽습니다." },
        { q: "A: I'm into photography these days. — B: ____", opts: ["That sounds interesting. How often do you shoot?", "Yes, I am a camera.", "No, I don't photo.", "Where is photography?"], a: "That sounds interesting. How often do you shoot?", why: "관심을 보이고 빈도를 묻는 질문을 더하면 대화가 이어집니다." }
      ]
    },
    {
      no: 11,
      title: "부탁하고 도와주기",
      intro: "부탁은 표현의 강도에 따라 인상이 달라집니다. 부탁하고, 수락하거나 정중하게 거절하고, 먼저 도와주겠다고 말하는 세 흐름을 익힙니다.",
      summary: "부탁은 Can you / Could you 로 시작하고, 들어주겠다는 답은 Sure / Of course 입니다. 거절할 때도 부드럽게 말하는 방법이 있습니다.",
      points: [
        {
          h: "부탁하기 — Could you ~?",
          body: "Can you 보다 Could you 가 조금 더 정중합니다. 부탁 뒤에 please 를 붙이면 충분히 예의를 갖춘 표현이 됩니다.",
          table: {
            head: ["정중도", "표현", "쓰는 자리"],
            rows: [
              ["가장 편함", "Can you help me with this?", "친한 동료"],
              ["보통", "Could you help me with this?", "일반적인 부탁"],
              ["정중", "Would you mind helping me with this?", "윗사람·고객"],
              ["아주 정중", "I was wondering if you could help me.", "격식 있는 자리"]
            ]
          },
          note: "Would you mind ~ing? 는 대답이 반대라는 점이 함정입니다. 들어주겠다는 답은 No, not at all. 이고, 거절은 Sorry, I can't. 입니다."
        },
        {
          h: "부탁에 답하기 — 수락과 거절",
          body: "수락은 Sure / Of course / No problem 으로 짧게, 거절은 사과와 이유를 한 마디 붙입니다. 거절할 때 이유가 없으면 무뚝뚝하게 들립니다.",
          table: {
            head: ["상황", "표현"],
            rows: [
              ["흔쾌히 수락", "Sure, no problem."],
              ["조건부 수락", "I can, but not until three."],
              ["정중한 거절", "I'm sorry, I can't right now."],
              ["대안 제시", "I can't, but Mina might be able to help."]
            ]
          },
          note: "I'm afraid I can't. 는 안타깝지만 어렵다는 뜻으로, 거절을 부드럽게 만드는 표현입니다."
        },
        {
          h: "표현 확장 — 부탁의 강도 조절",
          body: "같은 부탁도 자리에 따라 표현이 달라집니다. 편한 사이에는 Can you, 업무에서는 Could you 나 Would you mind 를 고릅니다.",
          table: {
            head: ["강도", "표현", "쓰는 자리"],
            rows: [
              ["가벼운 부탁", "Can you ~?", "편한 사이"],
              ["정중한 부탁", "Could you ~?", "대부분의 자리"],
              ["격식 부탁", "Would you mind ~ing?", "업무 요청"],
              ["도움 제안", "Let me help you.", "내가 먼저 나설 때"],
              ["도움 요청", "Could you give me a hand?", "손이 필요할 때"]
            ]
          },
          note: "Would you mind ~ing? 는 꺼리느냐고 묻는 형태라 수락은 No, not at all. 입니다."
        },
        {
          h: "실전 대화 — 부탁하고 수락하기",
          body: "부탁을 받아들일 때는 수락의 말과 함께 다음 행동을 묻는 한 마디를 붙입니다. 대화가 바로 움직입니다.",
          examples: [
            { en: "Could you help me move these boxes?", ko: "이 상자 옮기는 것 좀 도와주시겠어요?" },
            { en: "Sure, no problem. Where should I put them?", ko: "그럼요, 문제없어요. 어디에 두면 될까요?" },
            { en: "Just next to the door, thanks.", ko: "문 옆에 두시면 됩니다, 고맙습니다." }
          ]
        },
        {
          h: "정중하게 거절하고 대안 남기기",
          body: "거절은 짧게 하고 대안을 붙입니다. 사과만 하고 끝내면 상대는 다시 부탁할 시점을 알 수 없습니다.",
          table: {
            head: ["상황", "표현", "뜻"],
            rows: [
              ["지금 못 할 때", "I'm afraid I can't right now.", "지금은 어려워요."],
              ["다른 일이 있을 때", "I'm in the middle of something.", "하던 일이 있어요."],
              ["대안 제시", "Could we do it after lunch?", "점심 후에 해도 될까요?"],
              ["사양", "Thanks, but I'll manage.", "고맙지만 혼자 할게요."],
              ["나중에 돕기", "I can help you in ten minutes.", "10분 뒤에 도와드릴게요."]
            ]
          },
          note: "거절할 때는 사과 대신 대안을 붙이면 관계가 상하지 않습니다."
        },
        {
          h: "도와주겠다고 먼저 말하기",
          body: "상대가 어려워 보일 때 먼저 도움을 제안하면 관계가 좋아집니다. Let me + 동사원형 은 내가 해 주겠다는 적극적인 표현입니다.",
          examples: [
            { en: "Let me carry that for you.", ko: "제가 그거 들어 드릴게요." },
            { en: "Do you need a hand with those boxes?", ko: "그 상자들 옮기는 데 도움이 필요하세요?" }
          ],
          note: "Do you need a hand? 은 손이 필요하냐는 뜻으로 도움을 제안하는 관용 표현입니다. hand 는 여기서 도움을 뜻합니다."
        }
      ],
      mistakes: [
        "Would you mind ~ing? 에 Yes, sure. 라고 답하는 실수 — mind 는 꺼리다는 뜻이라 Yes 는 거절이 됩니다. 수락은 No, not at all. 입니다.",
        "부탁할 때 Please you help me. 라고 하는 실수 — Please help me. 또는 Could you help me? 로 씁니다.",
        "거절만 하고 대안을 말하지 않는 실수 — I'm busy now, but I can help at four. 처럼 대안을 붙입니다.",
        "Would you mind 뒤에 동사원형을 쓰는 실수 — mind 뒤에는 동명사가 와서 Would you mind closing the window? 입니다.",
        "고맙다는 말 없이 부탁만 반복하는 실수 — 부탁 뒤에는 Thanks. 한 마디를 붙입니다."
      ],
      practice: [
        { q: "가장 정중한 부탁 표현은?", opts: ["Would you mind closing the window?", "Close the window.", "You close window?", "Can close window?"], a: "Would you mind closing the window?", why: "Would you mind 뒤에는 동명사가 오고 가장 정중한 부탁입니다." },
        { q: "Would you mind ~ing? 에 수락하는 답은?", opts: ["No, not at all.", "Yes, I mind.", "Yes, sure.", "No, I can't."], a: "No, not at all.", why: "mind 는 꺼리다는 뜻이라 No 가 수락입니다." },
        { q: "도움을 청하는 표현은?", opts: ["Could you give me a hand?", "Could you give me a foot?", "Give hand me.", "You help me give?"], a: "Could you give me a hand?", why: "손이 필요할 때는 give me a hand 라고 말합니다." },
        { q: "정중한 거절 표현은?", opts: ["I'm afraid I can't right now.", "No.", "I don't want.", "Not possible."], a: "I'm afraid I can't right now.", why: "거절은 I'm afraid 로 완곡하게 시작합니다." },
        { q: "A: Could you help me move these boxes? — B: ____", opts: ["Sure, no problem.", "Yes, I move.", "No, boxes.", "I am help."], a: "Sure, no problem.", why: "수락은 Sure, no problem. 이나 Of course. 로 답합니다." },
        { q: "Would you mind opening the window? 에 들어주겠다고 답하려면?", opts: ["Yes, I mind.", "No, not at all.", "Yes, sure.", "Of course mind."], a: "No, not at all.", why: "mind 는 꺼리다는 뜻이라, 꺼리지 않는다는 No, not at all. 이 수락입니다." },
        { q: "윗사람에게 가장 정중하게 부탁하는 표현은?", opts: ["Give me that.", "Can you give me that?", "I was wondering if you could give me that.", "You must give me that."], a: "I was wondering if you could give me that.", why: "I was wondering if you could ~ 는 격식 있는 자리에서 쓰는 가장 정중한 부탁입니다." },
        { q: "도움이 필요하냐고 먼저 제안하는 표현은?", opts: ["Do you need a hand?", "Do you have a hand?", "Can I hand you?", "Give me your hand."], a: "Do you need a hand?", why: "need a hand 는 도움이 필요하냐는 뜻의 관용 표현입니다." }
      ]
    },
    {
      no: 12,
      title: "전화와 메시지로 연락하기",
      intro: "전화는 표정과 손짓이 없어서 표현이 더 중요합니다. 전화에서 쓰는 인사와 연결 부탁, 메시지 남기기까지 세 단계를 익혀 둡니다.",
      summary: "전화는 얼굴이 안 보이므로 이름을 먼저 밝히고 용건을 말합니다. 메시지를 남기거나 다시 연락하겠다고 말하는 표현까지 익힙니다.",
      points: [
        {
          h: "전화 받고 걸기 — This is ~ speaking",
          body: "전화를 받으면 회사에서는 보통 회사명과 이름을 말합니다. 걸 때는 This is Jisoo Kim speaking. 처럼 자신을 먼저 밝힙니다.",
          examples: [
            { en: "Hello, Jisoo Kim speaking.", ko: "안녕하세요, 김지수입니다." },
            { en: "Hi, this is Jisoo from the planning team. Is Mr. Park available?", ko: "안녕하세요, 기획팀 지수입니다. 박 부장님 계신가요?" }
          ],
          note: "Is Mr. Park available? 은 통화 가능하냐는 정중한 표현입니다. Is Mr. Park there? 보다 격식 있습니다."
        },
        {
          h: "연결해 달라고 부탁하기",
          body: "다른 사람에게 연결해 달라고 할 때는 Could I speak to ~? 또는 Could you put me through to ~? 를 씁니다.",
          table: {
            head: ["하고 싶은 말", "표현"],
            rows: [
              ["연결 요청", "Could I speak to Mr. Park, please?"],
              ["담당자 연결", "Could you put me through to the sales team?"],
              ["잘못 걸었을 때", "I'm sorry, I think I have the wrong number."],
              ["기다려 달라 할 때", "Could you hold for a moment, please?"]
            ]
          },
          note: "put me through to ~ 는 전화를 연결해 달라는 표현입니다. hold 는 끊지 말고 기다리라는 뜻입니다."
        },
        {
          h: "표현 확장 — 전화 대화의 흐름",
          body: "전화는 받기, 연결 부탁, 대기, 메시지, 마무리 순서로 흘러갑니다. 각 단계의 표현을 미리 정해 두면 당황하지 않습니다.",
          table: {
            head: ["단계", "표현", "뜻"],
            rows: [
              ["받기", "Hello, this is Jisoo speaking.", "안녕하세요, 지수입니다."],
              ["연결 부탁", "Could I speak to Mr. Kim?", "김 부장님과 통화할 수 있을까요?"],
              ["잠시 대기", "Could you hold on a moment?", "잠시 기다려 주시겠어요?"],
              ["메시지", "Could I leave a message?", "메시지를 남겨도 될까요?"],
              ["끊기", "Thanks for your help. Goodbye.", "도와주셔서 고맙습니다. 안녕히 계세요."]
            ]
          },
          note: "전화에서는 I am Jisoo. 대신 This is Jisoo speaking. 을 씁니다."
        },
        {
          h: "실전 대화 — 전화로 연결 부탁하기",
          body: "업무 전화는 소속을 밝히고 통화 상대를 요청하는 것으로 시작합니다. 통화가 어려우면 메시지를 제안합니다.",
          examples: [
            { en: "Good morning, this is Jisoo Kim from ABC Trading.", ko: "안녕하세요, ABC 트레이딩의 김지수입니다." },
            { en: "Could I speak to Mr. Han, please?", ko: "한 부장님과 통화할 수 있을까요?" },
            { en: "He is in a meeting. Could I leave a message?", ko: "회의 중이십니다. 메시지를 남겨도 될까요?" }
          ]
        },
        {
          h: "메시지를 남기는 세 문장",
          body: "메시지는 용건, 요청, 연락처 순서로 남깁니다. 전화를 끊기 전에 받아 적었는지 한 번 더 확인합니다.",
          table: {
            head: ["순서", "표현", "보기"],
            rows: [
              ["용건 밝히기", "I'm calling about ~", "I'm calling about the invoice."],
              ["요청 남기기", "Could you ask him to call me back?", "다시 전화해 달라고 전해 주시겠어요?"],
              ["연락처 남기기", "My number is ~", "My number is zero one zero."],
              ["확인 부탁", "Could you read it back to me?", "다시 읽어 주시겠어요?"],
              ["마무리", "Thank you for your help.", "도와주셔서 감사합니다."]
            ]
          },
          note: "연락처는 숫자를 천천히 한 자리씩 끊어 말하면 정확하게 전달됩니다."
        },
        {
          h: "메시지 남기고 다시 연락하기",
          body: "상대가 없을 때는 메시지를 남기겠다고 말하고, 이름과 연락처, 용건을 짧게 남깁니다. 메시지를 받았을 때는 확인하겠다고 답합니다.",
          examples: [
            { en: "Could I leave a message? Please ask him to call me back.", ko: "메시지를 남겨도 될까요? 저에게 다시 전화해 달라고 전해 주세요." },
            { en: "I'll pass on the message. Thank you for calling.", ko: "메시지 전해 드리겠습니다. 전화 주셔서 감사합니다." }
          ],
          note: "call me back 은 저에게 다시 전화해 달라는 뜻입니다. 목적어를 빼고 call back 만 쓰면 '다시 전화하다'라는 뜻이 됩니다."
        }
      ],
      mistakes: [
        "전화에서 I am Jisoo. 라고 하는 실수 — 전화에서는 This is Jisoo speaking. 또는 This is Jisoo. 를 씁니다.",
        "메시지를 남길 때 Could you take a message? 와 Could I leave a message? 를 헷갈리는 실수 — 앞은 받아 달라, 뒤는 내가 남기겠다는 뜻입니다.",
        "전화를 끊을 때 Bye. 만 되풀이하는 실수 — Thanks for your help. Goodbye. 처럼 한 마디를 더합니다.",
        "연락처를 빠르게 말해 다시 묻는 일이 생기는 실수 — 한 자리씩 천천히 말하고 마지막에 되짚어 확인합니다.",
        "용건을 밝히지 않고 연결만 요청하는 실수 — I'm calling about ~ 으로 용건을 먼저 말합니다."
      ],
      practice: [
        { q: "전화에서 자신을 밝히는 표현은?", opts: ["This is Jisoo speaking.", "I am Jisoo speaking.", "Here is Jisoo.", "Jisoo is me."], a: "This is Jisoo speaking.", why: "전화에서는 This is + 이름 + speaking 을 씁니다." },
        { q: "상대와 통화를 요청하는 표현은?", opts: ["Could I speak to Mr. Kim?", "Could I talk Mr. Kim?", "I want Mr. Kim.", "Mr. Kim speak me?"], a: "Could I speak to Mr. Kim?", why: "연결 부탁은 Could I speak to + 사람? 입니다." },
        { q: "내가 메시지를 남기겠다는 표현은?", opts: ["Could I leave a message?", "Could you take a message?", "Give me message.", "Message is me."], a: "Could I leave a message?", why: "내가 남기겠다는 뜻은 Could I leave a message? 입니다." },
        { q: "상대에게 다시 전화해 달라고 부탁하는 표현은?", opts: ["Could you ask him to call me back?", "Could you call him back me?", "Ask him call back.", "He call me back please."], a: "Could you ask him to call me back?", why: "전달 부탁은 ask + 사람 + to + 동사원형 형태로 만듭니다." },
        { q: "A: Could I speak to Mr. Han? — B: ____", opts: ["He is in a meeting. Could I leave a message?", "He is meeting now leave message.", "Yes, I am Han.", "No, hang up."], a: "He is in a meeting. Could I leave a message?", why: "통화가 어려울 때는 상황을 알리고 메시지를 제안합니다." },
        { q: "전화로 자신을 밝히는 가장 알맞은 표현은?", opts: ["I am Jisoo.", "This is Jisoo speaking.", "You are Jisoo.", "Jisoo is me."], a: "This is Jisoo speaking.", why: "전화에서는 This is ~ speaking. 으로 자신을 밝힙니다." },
        { q: "담당 부서로 연결해 달라고 할 때 알맞은 표현은?", opts: ["Could you put me through to the sales team?", "Could you put me into the sales team?", "Could you put the sales team?", "Could you through the sales team?"], a: "Could you put me through to the sales team?", why: "put me through to ~ 는 전화를 연결해 달라는 표현입니다." },
        { q: "상대가 부재중일 때 메시지를 남기겠다고 하는 표현은?", opts: ["Could I take a message?", "Could I leave a message?", "Could I give a message?", "Could I hold a message?"], a: "Could I leave a message?", why: "내가 남기겠다는 것은 leave a message, 받아 주겠다는 것은 take a message 입니다." }
      ]
    }
  ]
});
