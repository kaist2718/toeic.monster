/* ============================================================================
 * 중급 영어회화 (B1 ~ B2) — 12과
 * tools/build-pages.mjs 와 감사 도구가 window.CONVERSATION_BOOKS 를 읽습니다.
 * 초급이 "상황을 버티는 표현"이라면, 중급은 "내 생각을 말하고 조율하는 표현"입니다.
 * ========================================================================== */
window.CONVERSATION_BOOKS = window.CONVERSATION_BOOKS || [];

window.CONVERSATION_BOOKS.push({
  id: "conversation-intermediate",
  level: "중급",
  cefr: "B1 ~ B2",
  title: "중급 영어회화",
  subtitle: "의견·조율·설득까지, 대화를 끌고 가는 12가지 기술",
  desc: "의견 말하기·동의와 반대·문제 제기·협상·회의 발언까지, 대화를 내 쪽으로 끌고 가는 12가지 기술을 완곡 표현과 강도 조절 중심으로 정리한 중급 회화 교재입니다.",
  audience: "기본 문장은 만들 수 있지만 하고 싶은 말을 부드럽게 전달하지 못하는 학습자, 회의·거래에서 영어로 설득해야 하는 직장인",
  goal: "같은 내용이라도 상황에 맞는 강도와 정중함을 골라 말하고, 상대의 반대를 듣고도 대화를 이어 갈 수 있다.",
  howto: [
    "표현을 강도 순서로 익힙니다. 같은 뜻의 세 표현이 어느 자리에서 쓰이는지 비교하며 읽습니다.",
    "각 과의 마지막 연습 문제에서 답을 고른 이유를 소리 내어 설명해 봅니다.",
    "실제 회의·거래에서 쓸 상황을 하나 정해, 표현을 그대로 바꿔 넣어 연습합니다."
  ],
  chapters: [
    {
      no: 1,
      title: "의견 말하기와 강도 조절",
      intro: "의견은 내용보다 강도로 기억됩니다. 확신의 정도를 조절하고 상대 의견을 먼저 인정하는 순서를 익히면 반대 상황에서도 대화가 부드러워집니다.",
      summary: "영어로 의견을 말할 때는 확신의 정도를 드러내는 표현을 함께 씁니다. I think 하나로 모두 해결하려 하면 단조롭고, 강한 주장은 무례하게 들립니다.",
      points: [
        {
          h: "의견 꺼내기 — 확신의 강도별 표현",
          body: "의견을 말할 때는 얼마나 확신하는지를 표현으로 드러냅니다. 회의에서 처음 꺼낼 때와 강하게 주장할 때를 구분하면 대화가 부드러워집니다.",
          table: {
            head: ["강도", "표현", "쓰는 자리"],
            rows: [
              ["약함", "I'm not sure, but I think ~", "확신이 없을 때"],
              ["보통", "I think ~ / I'd say ~", "일반적인 의견"],
              ["강함", "I strongly believe that ~", "근거가 확실할 때"],
              ["근거 중심", "From what I've seen, ~", "경험을 근거로 말할 때"],
              ["정중한 제안", "It seems to me that ~", "상대와 다른 의견일 때"]
            ]
          },
          note: "It seems to me that ~ 은 단정하지 않고 인상을 말하는 표현입니다. 상대 의견과 다를 때 가장 안전합니다."
        },
        {
          h: "상대 의견을 인정하고 내 의견 잇기",
          body: "반대하거나 다른 의견을 말할 때는 상대의 말을 먼저 인정한 뒤 내 의견을 붙입니다. 이 순서를 지키면 같은 내용도 훨씬 부드럽게 전달됩니다.",
          examples: [
            { en: "That's a fair point. From what I've seen, though, the numbers tell a different story.", ko: "타당한 지적입니다. 다만 제가 본 바로는 수치가 다른 이야기를 합니다." },
            { en: "I see what you mean, but I'd look at it from a different angle.", ko: "무슨 말씀인지 알겠습니다만, 저는 다른 각도에서 보고 싶습니다." }
          ],
          note: "though 를 문장 중간이나 끝에 넣으면 앞 내용을 부드럽게 뒤집습니다. But 을 문장 맨 앞에 쓰는 것보다 부드럽습니다."
        },
        {
          h: "표현 확장 — 확신의 강도 사다리",
          body: "같은 생각도 어느 정도 확신하는지에 따라 표현이 달라집니다. 근거가 분명할 때는 강하게, 상황이 유동적일 때는 약하게 말합니다.",
          table: {
            head: ["강도", "표현", "쓰는 자리"],
            rows: [
              ["강한 확신", "I'm convinced that ~", "근거가 분명할 때"],
              ["일반 의견", "I think / I believe", "가장 흔한 형태입니다."],
              ["완곡한 의견", "I tend to think ~", "단정을 피할 때"],
              ["낮은 확신", "It seems to me that ~", "추측의 영역입니다."],
              ["중립", "That could work.", "찬반을 미룰 때"]
            ]
          },
          note: "I think 뒤의 that 은 생략해도 되고, 격식 문장에서는 남기면 또렷해집니다."
        },
        {
          h: "실전 대화 — 의견을 말하고 확인받기",
          body: "의견은 주장, 양보, 대안 순서로 이어 갈 때 설득력이 생깁니다. 상대가 반대하면 인정한 뒤 대안을 붙입니다.",
          examples: [
            { en: "I think we should test the new process with one team first.", ko: "새 절차를 한 팀에서 먼저 시험해 보는 게 좋겠습니다." },
            { en: "I see your point, but the deadline is tight.", ko: "무슨 말씀인지 알겠지만 일정이 빠듯합니다." },
            { en: "That's fair. Could we run a short pilot instead?", ko: "일리 있습니다. 짧은 시범 운영은 어떨까요?" }
          ]
        },
        {
          h: "반대할 때 쓰는 완곡 표현",
          body: "반대는 사람이 아니라 관점을 향하게 만듭니다. 같은 뜻이라도 주어를 바꾸면 회의 분위기가 달라집니다.",
          table: {
            head: ["그대로 말하기", "부드러운 표현", "차이"],
            rows: [
              ["I don't agree.", "I'm not sure I agree.", "부정을 완곡하게 만듭니다."],
              ["You are wrong.", "I see it differently.", "사람이 아니라 관점을 다룹니다."],
              ["That won't work.", "I'm concerned that it may not work.", "우려의 형태로 바꿉니다."],
              ["No.", "I'd rather not, if that's okay.", "거절에 여지를 둡니다."]
            ]
          },
          note: "however 는 접속부사라서 두 절을 직접 잇지 못합니다. 마침표나 세미콜론 뒤에 씁니다."
        },
        {
          h: "의견을 묻고 확인받기",
          body: "내 의견을 말한 뒤 상대에게 확인을 구하면 독단적으로 들리지 않습니다. Does that make sense? 는 이해했는지 묻는 표현이고, Would you agree? 는 동의를 구하는 표현입니다.",
          examples: [
            { en: "That's my take on it. Does that make sense?", ko: "제 생각은 그렇습니다. 이해되시나요?" },
            { en: "How does that sound to you?", ko: "어떻게 들리시나요?" }
          ],
          note: "my take on it 은 그것에 대한 내 해석이라는 뜻입니다. I think 만 반복하는 것보다 표현이 살아납니다."
        }
      ],
      mistakes: [
        "I think you are wrong. 처럼 사람을 주어로 세워 반대하는 실수 — I see it differently. 또는 I'm not sure I agree. 로 바꿉니다.",
        "의견을 말하고 곧바로 다음 주제로 넘어가는 실수 — Would you agree? 같은 확인 질문을 넣어야 대화가 됩니다.",
        "확신의 정도를 구분하지 않고 항상 I think 만 쓰는 실수 — 근거가 분명하면 I'm convinced that ~ 으로 강도를 높입니다.",
        "반대할 때 근거 없이 기분만 전하는 실수 — 우려의 근거를 한 줄 붙여야 논의가 됩니다.",
        "상대 의견을 인정하지 않고 바로 반론으로 들어가는 실수 — I see your point 를 먼저 둡니다."
      ],
      practice: [
        { q: "가장 완곡한 의견 표현은?", opts: ["I'm convinced that we need it.", "I tend to think we need it.", "We need it.", "We must have it."], a: "I tend to think we need it.", why: "tend to think 는 단정을 피하는 완곡한 의견 표현입니다." },
        { q: "상대 의견을 인정하며 반대하는 표현은?", opts: ["You are wrong.", "I see your point, but the data says otherwise.", "No.", "That's nonsense."], a: "I see your point, but the data says otherwise.", why: "인정한 뒤 근거를 붙이는 것이 자연스러운 반대입니다." },
        { q: "낮은 확신을 나타내는 표현은?", opts: ["It seems to me that we may be early.", "I'm convinced we are early.", "We are certainly early.", "We are early."], a: "It seems to me that we may be early.", why: "seem 과 may 를 함께 쓰면 확신이 낮은 표현이 됩니다." },
        { q: "의견을 확인받는 질문은?", opts: ["Would you agree?", "Do you agree me?", "You agree?", "Is it agree?"], a: "Would you agree?", why: "확인 질문은 Would you agree? 로 묻습니다." },
        { q: "A: I think we should delay the launch. — B: ____", opts: ["I'm not sure I agree.", "You are wrong.", "No delay.", "I disagree you."], a: "I'm not sure I agree.", why: "I'm not sure I agree. 가 부드러운 반대입니다." },
        { q: "확신이 크지 않을 때 가장 알맞은 표현은?", opts: ["I strongly believe that ~", "I'm not sure, but I think ~", "There is no doubt that ~", "It is obvious that ~"], a: "I'm not sure, but I think ~", why: "확신의 강도에 맞게 I'm not sure, but I think ~ 처럼 약한 표현을 씁니다." },
        { q: "상대와 다른 의견을 말할 때 가장 부드러운 시작은?", opts: ["You're wrong about that.", "That's a fair point, but ~", "No, that's not right.", "I disagree completely."], a: "That's a fair point, but ~", why: "상대의 지적을 먼저 인정한 뒤 다른 의견을 붙이면 훨씬 부드럽습니다." },
        { q: "내 의견을 말한 뒤 동의를 구하는 표현은?", opts: ["Would you agree?", "Are you agree?", "Do you agreement?", "You agree me?"], a: "Would you agree?", why: "동의를 구할 때는 Would you agree? 를 씁니다." }
      ]
    },
    {
      no: 2,
      title: "계획과 일정 조율하기",
      intro: "일정 대화는 확정된 약속과 계획을 구분하는 데서 시작합니다. 미룰 때는 이유와 새 시점을 함께 말해야 상대가 일정을 다시 잡을 수 있습니다.",
      summary: "계획을 말할 때는 시제를 고르는 것이 핵심입니다. 이미 정한 일은 be going to, 예정된 일정은 현재진행형을 씁니다.",
      points: [
        {
          h: "계획 말하기 — 시제 고르기",
          body: "계획의 확정 정도에 따라 시제가 달라집니다. 이 구분을 지키면 일정을 잘못 전달하는 사고를 막을 수 있습니다.",
          table: {
            head: ["확정 정도", "형태", "예문"],
            rows: [
              ["이미 결정", "be going to", "We're going to launch in March."],
              ["확정된 일정", "현재진행형", "I'm meeting the client at ten."],
              ["바라는 계획", "I'm planning to", "I'm planning to visit the factory."],
              ["아직 미정", "I might / We could", "We might push it to next month."]
            ]
          },
          note: "현재진행형이 미래를 나타낼 때는 사람이 이미 약속한 일정입니다. 그래서 I'm meeting the client at ten. 는 확정된 약속입니다."
        },
        {
          h: "일정을 미루고 다시 제안하기",
          body: "일정을 바꿔야 할 때는 사과와 이유, 새 제안을 한 번에 담습니다. 이유를 말하지 않으면 상대는 우선순위가 낮다고 느낍니다.",
          examples: [
            { en: "I'm sorry to do this, but something urgent came up. Could we move it to Friday?", ko: "죄송한데 급한 일이 생겼습니다. 금요일로 옮길 수 있을까요?" },
            { en: "Would it work for you if we pushed it to next week?", ko: "다음 주로 미루면 괜찮으실까요?" }
          ],
          note: "something urgent came up 은 급한 일이 생겼다는 표현입니다. 구체적인 사정을 밝히고 싶지 않을 때도 쓸 수 있습니다."
        },
        {
          h: "표현 확장 — 일정 표현의 시제 구분",
          body: "같은 약속도 이미 확정된 일인지 지금 정하는 일인지에 따라 시제가 달라집니다. 시제를 바꾸면 확실성의 정도가 전달됩니다.",
          table: {
            head: ["상황", "표현", "시제"],
            rows: [
              ["확정된 약속", "I'm meeting the client at ten.", "현재진행형"],
              ["예정된 일정", "We're launching in May.", "현재진행형"],
              ["지금 정하는 일", "I'll send it right after this.", "will"],
              ["기한 확인", "When do you need it by?", "현재시제"],
              ["우선순위", "What should I prioritize?", "현재시제"]
            ]
          },
          note: "확정된 약속은 will 보다 현재진행형이 자연스럽습니다. I'm meeting the client at ten."
        },
        {
          h: "실전 대화 — 일정을 미루고 다시 잡기",
          body: "미룰 때는 사과, 이유, 새 시점 세 가지를 한 번에 전합니다. 상대가 새 시점을 확인해 주면 일정이 바로 다시 잡힙니다.",
          examples: [
            { en: "I'm sorry, but we need to push the review to Thursday.", ko: "죄송하지만 검토를 목요일로 미뤄야 합니다." },
            { en: "No problem. Is Thursday morning okay for you?", ko: "괜찮습니다. 목요일 오전은 어떠세요?" },
            { en: "Morning works. I'll send an updated invite.", ko: "오전이 좋습니다. 수정된 초대를 보내겠습니다." }
          ]
        },
        {
          h: "일정이 밀린 이유를 말하는 표현",
          body: "이유는 짧고 구체적으로 말합니다. 원인을 밝혀 두면 다음 일정을 잡을 때 같은 문제를 피할 수 있습니다.",
          table: {
            head: ["표현", "뜻", "원인"],
            rows: [
              ["The vendor is behind schedule.", "공급업체가 일정에 뒤처졌습니다.", "외부 요인"],
              ["We need more time for testing.", "시험 시간이 더 필요합니다.", "내부 요인"],
              ["A key reviewer is out this week.", "핵심 검토자가 이번 주에 자리에 없습니다.", "인력 요인"],
              ["The scope changed.", "범위가 바뀌었습니다.", "요구 변경"],
              ["We are waiting on approval.", "승인을 기다리는 중입니다.", "결재 지연"]
            ]
          },
          note: "이유는 한 줄이면 충분합니다. 길게 설명하면 변명처럼 들립니다."
        },
        {
          h: "기한과 우선순위 확인하기",
          body: "일정을 조율할 때는 언제까지 필요한지, 무엇이 먼저인지 확인합니다. 이 확인이 뒤의 재작업을 줄입니다.",
          table: {
            head: ["확인할 것", "표현"],
            rows: [
              ["기한", "When do you need it by?"],
              ["우선순위", "Which one should I prioritize?"],
              ["여유", "Is there any flexibility on the deadline?"],
              ["진행 상황", "Where are we on this?"]
            ]
          },
          note: "When do you need it by? 에서 by 는 늦어도 그때까지라는 뜻입니다. When do you need it? 은 언제 필요한지 시점만 묻습니다."
        }
      ],
      mistakes: [
        "I will meet the client at ten. 을 확정된 약속에 쓰는 실수 — 이미 잡힌 약속은 I'm meeting 으로 말하는 것이 자연스럽습니다.",
        "일정을 미루면서 이유를 말하지 않는 실수 — 사과 다음에 한 줄 이유를 붙여야 상대가 이해합니다.",
        "미룰 때 새 시점을 말하지 않는 실수 — 새 날짜를 함께 제안해야 일정이 다시 잡힙니다.",
        "확정된 약속을 will 로만 말하는 실수 — 이미 잡힌 일정은 현재진행형이 자연스럽습니다.",
        "우선순위를 묻지 않고 모든 일을 동시에 처리하는 실수 — What should I prioritize? 로 기준을 맞춥니다."
      ],
      practice: [
        { q: "이미 잡힌 약속을 자연스럽게 말하는 문장은?", opts: ["I'm meeting the client at ten.", "I will meet the client at ten.", "I meet the client at ten.", "I am meet the client at ten."], a: "I'm meeting the client at ten.", why: "확정된 약속은 현재진행형으로 말합니다." },
        { q: "일정을 미루는 표현으로 알맞은 것은?", opts: ["We need to push the review to Thursday.", "We need to push Thursday the review.", "We need pushing review Thursday.", "We need to delay for Thursday review."], a: "We need to push the review to Thursday.", why: "push + 대상 + to + 새 시점 순서로 말합니다." },
        { q: "납기 지연의 원인을 밝히는 표현은?", opts: ["The vendor is behind schedule.", "The vendor is schedule back.", "Vendor delay behind.", "Behind the vendor schedule."], a: "The vendor is behind schedule.", why: "be behind schedule 은 일정에 뒤처졌다는 뜻입니다." },
        { q: "우선순위를 확인하는 질문은?", opts: ["What should I prioritize?", "What I prioritize?", "Which is first work?", "How prioritize should?"], a: "What should I prioritize?", why: "우선순위는 What should I prioritize? 로 확인합니다." },
        { q: "A: Is Thursday morning okay for you? — B: ____", opts: ["Morning works. I'll send an updated invite.", "Yes, Thursday is morning.", "No, morning is not.", "I am okay morning."], a: "Morning works. I'll send an updated invite.", why: "수락과 다음 행동을 함께 말하면 일정이 바로 확정됩니다." },
        { q: "이미 확정된 약속을 말할 때 가장 알맞은 문장은?", opts: ["I will meet the client at ten.", "I'm meeting the client at ten.", "I meet the client at ten.", "I met the client at ten."], a: "I'm meeting the client at ten.", why: "사람이 이미 잡아 둔 확정 일정은 현재진행형으로 말합니다." },
        { q: "마감 기한을 물을 때 알맞은 표현은?", opts: ["When do you need it?", "When do you need it by?", "When is it need?", "When you need?"], a: "When do you need it by?", why: "늦어도 언제까지인지는 by 를 붙여 묻습니다." },
        { q: "일정을 미루자고 제안하는 가장 부드러운 표현은?", opts: ["We're moving the meeting.", "Would it work for you if we pushed it to next week?", "You must change the date.", "The meeting is canceled."], a: "Would it work for you if we pushed it to next week?", why: "상대 사정을 묻는 형태로 제안하면 부담이 적습니다." }
      ]
    },
    {
      no: 3,
      title: "경험 이야기하기",
      intro: "경험 이야기는 현재완료로 묻고 과거시제로 풀어 말합니다. 두 시제를 오가는 순서를 익혀 두면 면접과 잡담 모두에서 자연스럽게 말할 수 있습니다.",
      summary: "경험은 현재완료로 묻고, 구체적인 시점이 나오면 과거시제로 바꿉니다. 시제를 오가며 이야기하는 것이 중급 회화의 첫 관문입니다.",
      points: [
        {
          h: "경험 묻기 — Have you ever ~?",
          body: "살면서 해 본 적이 있는지는 Have you ever + 과거분사로 묻습니다. 답할 때 구체적인 시점을 말하면 그 순간부터 과거시제로 바꿉니다.",
          examples: [
            { en: "Have you ever worked with a foreign client?", ko: "외국 고객과 일해 본 적이 있으세요?" },
            { en: "Yes, I have. I worked with a German team in 2024.", ko: "네, 있습니다. 2024년에 독일 팀과 일했습니다." }
          ],
          note: "Have you ever ~ 에는 Yes, I have. / No, I haven't. 로 답합니다. Yes, I did. 는 시제가 어긋납니다."
        },
        {
          h: "경험을 구체적으로 풀어 말하기",
          body: "경험을 말할 때는 시작 시점(for/since), 횟수, 결과를 함께 말합니다. 이 세 가지가 들어가면 이야기가 완성됩니다.",
          table: {
            head: ["말할 것", "표현", "예문"],
            rows: [
              ["기간", "for + 기간", "I've worked here for three years."],
              ["시작점", "since + 시점", "I've worked here since 2023."],
              ["횟수", "once / twice / several times", "I've been there twice."],
              ["결과", "so far / up to now", "It's been busy so far."]
            ]
          },
          note: "for 는 기간(three years), since 는 시작점(2023)입니다. 둘을 바꿔 쓰면 의미가 완전히 달라집니다."
        },
        {
          h: "표현 확장 — 경험을 묻는 질문 세트",
          body: "경험을 물을 때는 유무, 기간, 인상, 배운 점 순서로 질문이 이어집니다. 각 질문에 쓸 표현을 알아 두면 답도 준비됩니다.",
          table: {
            head: ["질문", "묻는 것", "보기"],
            rows: [
              ["Have you ever ~?", "경험 유무", "Have you ever led a team?"],
              ["How long have you ~?", "기간", "How long have you worked here?"],
              ["What was it like?", "인상", "What was it like living abroad?"],
              ["What did you learn from it?", "배운 점", "What did you learn from the project?"],
              ["Would you do it again?", "재경험 의향", "Would you do it again?"]
            ]
          },
          note: "Have you ever 뒤에는 과거분사가 옵니다. Have you ever been to Busan?"
        },
        {
          h: "실전 대화 — 경험을 구체적으로 풀어 말하기",
          body: "경험은 결론, 상황, 결과 순서로 말하면 짧아도 분명하게 들립니다. 숫자나 기간을 넣으면 설득력이 더 커집니다.",
          examples: [
            { en: "Have you ever managed a project like this?", ko: "이런 프로젝트를 맡아 본 적이 있으세요?" },
            { en: "Yes, I led a similar rollout last year in Busan.", ko: "네, 작년에 부산에서 비슷한 도입을 이끌었습니다." },
            { en: "It was challenging, but we finished two weeks early.", ko: "어려웠지만 2주 일찍 끝냈습니다." }
          ]
        },
        {
          h: "현재완료와 과거시제 전환하기",
          body: "경험을 말할 때 시제가 흐트러지면 언제 일어난 일인지 전달되지 않습니다. 시점 표현이 나오면 과거로 바꿉니다.",
          table: {
            head: ["시제", "쓰는 자리", "예문"],
            rows: [
              ["현재완료", "경험 자체를 말할 때", "I have worked with overseas teams."],
              ["과거", "시점·장소가 분명할 때", "I worked with the Osaka team in 2023."],
              ["현재완료 + since", "지금도 이어질 때", "I have worked here since 2021."],
              ["과거완료", "그보다 앞선 일", "I had already left when the audit began."],
              ["현재완료진행", "지금까지 이어지는 일", "I have been managing the budget for a year."]
            ]
          },
          note: "특정 연도가 나오면 과거시제입니다. I worked there in 2023."
        },
        {
          h: "강조해서 말하기 — It was the first time",
          body: "처음 겪은 일이나 인상 깊었던 경험은 It was the first time I've ~ 또는 That was when ~ 으로 강조합니다.",
          examples: [
            { en: "It was the first time I'd presented in English.", ko: "영어로 발표한 것이 처음이었습니다." },
            { en: "That was the moment I decided to change jobs.", ko: "그때가 제가 이직을 결심한 순간이었습니다." }
          ],
          note: "It was the first time 뒤에는 과거완료(I'd presented)를 씁니다. 주절이 과거이기 때문에 한 단계 더 과거로 내려갑니다."
        }
      ],
      mistakes: [
        "I have worked there in 2023. 처럼 현재완료와 과거 시점을 함께 쓰는 실수 — 특정 연도가 나오면 과거시제를 씁니다.",
        "Have you ever went there? 처럼 과거분사 자리에 과거형을 쓰는 실수 — Have you ever been there? 가 맞습니다.",
        "경험을 말할 때 숫자나 기간을 빼놓는 실수 — we finished two weeks early 처럼 결과를 수치로 붙이면 분명해집니다.",
        "since 와 for 를 바꿔 쓰는 실수 — since 뒤에는 기점, for 뒤에는 기간이 옵니다.",
        "과거완료와 과거를 섞어 순서가 뒤집히는 실수 — 먼저 일어난 일을 had p.p. 로 둡니다."
      ],
      practice: [
        { q: "경험 유무를 묻는 표현은?", opts: ["Have you ever led a team?", "Do you ever led a team?", "Have you ever lead a team?", "Did you ever leading a team?"], a: "Have you ever led a team?", why: "Have you ever 뒤에는 과거분사가 옵니다." },
        { q: "특정 연도를 말할 때 알맞은 시제는?", opts: ["I have worked there in 2023.", "I worked there in 2023.", "I work there in 2023.", "I am working there in 2023."], a: "I worked there in 2023.", why: "끝난 시점이 나오면 과거시제를 씁니다." },
        { q: "2021년부터 계속 일하고 있다는 문장은?", opts: ["I have worked here since 2021.", "I work here since 2021.", "I have worked here for 2021.", "I worked here since 2021."], a: "I have worked here since 2021.", why: "since 뒤에는 기점이 오고 주절은 현재완료를 씁니다." },
        { q: "인상을 묻는 질문은?", opts: ["What was it like?", "How was like it?", "What like was it?", "How it was like?"], a: "What was it like?", why: "인상을 묻는 틀은 What was it like? 입니다." },
        { q: "A: Have you ever managed a project like this? — B: ____", opts: ["Yes, I led a similar rollout last year.", "Yes, I have led it last year.", "Yes, I manage last year.", "No, I have never manage."], a: "Yes, I led a similar rollout last year.", why: "구체적 시점이 있으면 과거시제로 풀어 말합니다." },
        { q: "특정 연도를 말할 때 알맞은 문장은?", opts: ["I have worked there in 2023.", "I worked there in 2023.", "I have work there in 2023.", "I am working there in 2023."], a: "I worked there in 2023.", why: "과거의 특정 시점을 말할 때는 현재완료가 아니라 과거시제를 씁니다." },
        { q: "2023년부터 계속 일하고 있다고 말할 때 알맞은 표현은?", opts: ["I've worked here for 2023.", "I've worked here since 2023.", "I worked here since 2023.", "I work here from 2023."], a: "I've worked here since 2023.", why: "시작점에는 since, 기간에는 for 를 씁니다. 지금까지 이어지는 일이므로 현재완료입니다." },
        { q: "A: Have you ever been to a trade show abroad? — B: ____", opts: ["Yes, I did.", "Yes, I have. I went to one in Singapore last year.", "Yes, I am.", "Yes, I go."], a: "Yes, I have. I went to one in Singapore last year.", why: "Have you ever ~ 에는 Yes, I have. 로 답하고, 구체적 시점을 말할 때는 과거시제로 바꿉니다." }
      ]
    },
    {
      no: 4,
      title: "문제를 말하고 해결 요청하기",
      intro: "문제를 말할 때는 사실과 감정을 분리하는 것이 기본입니다. 문제를 사람이 아니라 일로 두고, 원하는 조치와 시점을 함께 말하면 해결이 빨라집니다.",
      summary: "문제를 제기할 때는 사실과 원하는 것을 분리해서 말합니다. 감정을 앞세우면 해결이 늦어집니다.",
      points: [
        {
          h: "문제 제기 — 사실 먼저, 감정은 나중",
          body: "문제를 말할 때는 There's a problem with ~ 또는 I've noticed that ~ 으로 사실을 먼저 전합니다. 사람을 지목하면 방어적으로 만들어 해결이 어려워집니다.",
          examples: [
            { en: "I've noticed the shipment is two days behind schedule.", ko: "출하가 이틀 늦어진 것을 확인했습니다." },
            { en: "There seems to be an issue with the invoice amount.", ko: "청구 금액에 문제가 있는 것 같습니다." }
          ],
          note: "there seems to be 는 단정하지 않고 문제를 꺼내는 표현입니다. 상대가 실수를 인정하기 쉬운 자리를 만들어 줍니다."
        },
        {
          h: "원하는 것을 구체적으로 요청하기",
          body: "문제만 말하고 끝내면 상대는 무엇을 해야 할지 모릅니다. 원하는 조치와 시점을 함께 제시해야 대화가 해결로 갑니다.",
          table: {
            head: ["요청할 것", "표현"],
            rows: [
              ["조치", "Could you look into it and let me know?"],
              ["시점", "Could we have this resolved by Friday?"],
              ["대안", "If that's not possible, what would work?"],
              ["기록", "Could you confirm that in writing?"]
            ]
          },
          note: "look into 는 조사하다, 살펴본다는 뜻입니다. check 보다 정중하고, 상대에게 시간을 주는 표현입니다."
        },
        {
          h: "표현 확장 — 문제 제기와 요청 표현",
          body: "문제는 알리기, 영향 설명, 요청, 기한 협의 순서로 말합니다. 각 단계를 나누면 감정 없이 사실만 전달됩니다.",
          table: {
            head: ["단계", "표현", "보기"],
            rows: [
              ["문제 알리기", "There seems to be an issue with ~", "There seems to be an issue with the invoice."],
              ["영향 설명", "It's holding up ~", "It's holding up the shipment."],
              ["조치 요청", "Could we have this resolved by Friday?", "금요일까지 해결해 주실 수 있을까요?"],
              ["기한 협의", "Would Monday work instead?", "월요일은 어떠세요?"],
              ["확인", "Could you confirm by email?", "이메일로 확인해 주시겠어요?"]
            ]
          },
          note: "문제는 문제 자체를 주어로 두면 책임 소재를 흐리면서도 사실을 전달할 수 있습니다."
        },
        {
          h: "실전 대화 — 문제를 알리고 조치를 요청하기",
          body: "납품 문제를 처음 알릴 때의 세 문장입니다. 상황과 영향을 말하고 바로 조치와 기한을 요청합니다.",
          examples: [
            { en: "I'd like to flag an issue with the last delivery.", ko: "지난 납품에 문제가 있어 말씀드립니다." },
            { en: "Three items arrived damaged, so we cannot ship them.", ko: "세 개가 파손되어 출고할 수 없습니다." },
            { en: "Could we have replacements by Friday?", ko: "금요일까지 교체품을 받을 수 있을까요?" }
          ]
        },
        {
          h: "단계별로 강도를 높이는 표현",
          body: "문제가 해결되지 않을 때는 한 단계씩 올립니다. 단계를 건너뛰면 협력 관계가 끊기므로 순서를 지킵니다.",
          table: {
            head: ["단계", "표현", "쓰는 순간"],
            rows: [
              ["1단계", "Could you check this for me?", "가벼운 확인 요청"],
              ["2단계", "I'm concerned this may delay the order.", "우려를 알릴 때"],
              ["3단계", "We need this resolved by Friday.", "기한이 걸렸을 때"],
              ["4단계", "I'll have to escalate this to my manager.", "더는 어려울 때"],
              ["5단계", "We may need to reconsider the contract.", "최후의 수단"]
            ]
          },
          note: "단계를 올릴 때는 앞선 요청이 언제 있었는지 날짜와 함께 말하면 설득력이 생깁니다."
        },
        {
          h: "강하게 밀어야 할 때 — 단계 올리기",
          body: "같은 문제가 반복되면 표현의 강도를 올립니다. 이때도 감정이 아니라 영향과 기한을 근거로 삼습니다.",
          examples: [
            { en: "This is the second time this has happened. We need a permanent fix.", ko: "이번이 두 번째입니다. 근본적인 해결이 필요합니다." },
            { en: "If this isn't resolved by Friday, we'll have to escalate it.", ko: "금요일까지 해결되지 않으면 상부에 보고해야 합니다." }
          ],
          note: "We need a permanent fix. 는 임시방편이 아니라 근본 해결을 요구하는 표현입니다. 강하지만 감정적이지 않습니다."
        }
      ],
      mistakes: [
        "You made a mistake. 처럼 사람을 주어로 세우는 실수 — There seems to be an issue with ~ 로 문제 자체를 주어로 둡니다.",
        "문제만 말하고 원하는 조치를 말하지 않는 실수 — Could we have this resolved by Friday? 처럼 요청과 시점을 함께 말합니다.",
        "문제를 제기하면서 감정을 앞세우는 실수 — 사실을 먼저 말하고 우려는 뒤에 붙입니다.",
        "난감한 일을 단계를 건너뛰고 바로 윗선에 알리는 실수 — 한 단계씩 올려야 관계가 유지됩니다.",
        "파손·누락 같은 사실을 확인하지 않고 추측으로 말하는 실수 — 확인된 사실과 추정을 나눠 말합니다."
      ],
      practice: [
        { q: "문제를 사람이 아니라 일로 두는 표현은?", opts: ["There seems to be an issue with the invoice.", "You made a mistake with the invoice.", "Your invoice is wrong.", "You always send wrong invoices."], a: "There seems to be an issue with the invoice.", why: "문제 자체를 주어로 두면 상대를 겨누지 않고 사실만 전달됩니다." },
        { q: "영향을 설명하는 표현은?", opts: ["It's holding up the shipment.", "It holds up you.", "Shipment is hold up.", "The shipment you hold."], a: "It's holding up the shipment.", why: "hold up 은 지연시키다는 뜻으로 진행 중인 영향을 나타냅니다." },
        { q: "조치와 기한을 함께 요청하는 표현은?", opts: ["Could we have this resolved by Friday?", "Please resolve.", "Resolve it Friday please you.", "You must resolve Friday."], a: "Could we have this resolved by Friday?", why: "could we have + p.p. + by + 시점 형태로 조치와 기한을 함께 말합니다." },
        { q: "우려를 알리는 2단계 표현은?", opts: ["I'm concerned this may delay the order.", "We may reconsider the contract.", "Could you check this for me?", "I'll escalate this."], a: "I'm concerned this may delay the order.", why: "2단계는 우려를 알리는 단계로 I'm concerned that ~ 을 씁니다." },
        { q: "A: Three items arrived damaged. — B: ____", opts: ["Could we have replacements by Friday?", "You damaged them.", "That is your fault.", "We cannot do anything."], a: "Could we have replacements by Friday?", why: "상황을 확인한 뒤 교체품과 기한을 요청하면 해결이 빨라집니다." },
        { q: "상대를 지목하지 않고 문제를 꺼내는 표현은?", opts: ["You made a mistake with the invoice.", "There seems to be an issue with the invoice.", "The invoice is your fault.", "Why is the invoice wrong?"], a: "There seems to be an issue with the invoice.", why: "문제 자체를 주어로 두면 상대가 방어적이 되지 않아 해결이 빨라집니다." },
        { q: "해결 시점을 요청하는 가장 알맞은 표현은?", opts: ["Fix it now.", "Could we have this resolved by Friday?", "You should fix it.", "It must be fixed."], a: "Could we have this resolved by Friday?", why: "조치와 시점을 함께 담은 요청이 가장 실용적입니다." },
        { q: "같은 문제가 반복되어 강도를 올릴 때 알맞은 말은?", opts: ["This is the second time this has happened. We need a permanent fix.", "You are always wrong.", "I am very angry.", "Never do this again."], a: "This is the second time this has happened. We need a permanent fix.", why: "반복 횟수와 요구 사항을 근거로 말하면 강하지만 감정적이지 않습니다." }
      ]
    },
    {
      no: 5,
      title: "조언하고 제안하기",
      intro: "조언은 내용보다 강도로 받아들여집니다. 상대의 처지에 맞춰 표현을 낮추고, 대안을 함께 제시하며, 조언을 받았을 때 반응하는 표현까지 익힙니다.",
      summary: "조언은 상대가 받아들일 수 있는 형태로 전해야 합니다. You should 는 강한 지시로 들릴 수 있어 상황에 따라 표현을 바꿉니다.",
      points: [
        {
          h: "조언의 강도 조절",
          body: "조언은 상대와의 관계와 사안의 무게에 따라 강도를 고릅니다. 윗사람이나 고객에게는 부드러운 형태를 씁니다.",
          table: {
            head: ["강도", "표현", "쓰는 자리"],
            rows: [
              ["부드러움", "You might want to ~", "윗사람·고객"],
              ["보통", "Have you thought about ~ing?", "동료에게 제안"],
              ["제안", "Why don't we ~?", "함께 할 일 제안"],
              ["권고", "I'd suggest ~ing", "근거가 있을 때"],
              ["강한 권고", "You should ~", "급한 상황·친한 사이"]
            ]
          },
          note: "You might want to ~ 는 해 볼 만하다는 뜻으로, 지시가 아니라 정보를 주는 방식입니다. 격식 있는 자리에서 가장 안전합니다."
        },
        {
          h: "대안을 함께 제시하기",
          body: "하나만 제안하면 Yes/No 로 끝납니다. 대안을 함께 주면 상대가 고를 수 있어 대화가 이어집니다.",
          examples: [
            { en: "We could either split the order or delay the second half. Which would you prefer?", ko: "주문을 나누거나 후반부를 미룰 수 있습니다. 어느 쪽이 좋으세요?" },
            { en: "One option is to extend the deadline. Another is to add a second team.", ko: "한 가지 방법은 기한을 늘리는 것이고, 다른 방법은 인력을 더 넣는 것입니다." }
          ],
          note: "either A or B 는 둘 중 하나, Which would you prefer? 는 선택을 묻는 표현입니다. 선택지를 주면 상대가 결정하기 쉬워집니다."
        },
        {
          h: "표현 확장 — 조언의 강도 조절",
          body: "같은 조언도 상대와의 관계와 상황에 따라 표현을 골라 씁니다. 강한 표현일수록 급한 상황에서만 꺼냅니다.",
          table: {
            head: ["강도", "표현", "쓰는 자리"],
            rows: [
              ["강한 조언", "You'd better ~", "정말 급한 상황"],
              ["일반 조언", "You should ~", "동료 사이"],
              ["완곡한 조언", "You might want to ~", "윗사람·고객"],
              ["제안", "How about ~ing?", "함께 정할 때"],
              ["가능성 제시", "It might help to ~", "선택지를 줄 때"]
            ]
          },
          note: "You'd better 는 지시처럼 들려서 윗사람에게는 권하지 않습니다."
        },
        {
          h: "실전 대화 — 대안과 함께 조언하기",
          body: "조언은 상대의 상황을 한 번 확인하고 나서 꺼냅니다. 대안을 함께 주면 거절당해도 관계가 남습니다.",
          examples: [
            { en: "The report is due tomorrow, isn't it?", ko: "보고서가 내일까지죠?" },
            { en: "Yes, so you might want to send the draft today.", ko: "네, 그래서 오늘 초안을 보내는 게 좋겠어요." },
            { en: "Good idea. I'll send it after lunch.", ko: "좋은 생각이에요. 점심 후에 보낼게요." }
          ]
        },
        {
          h: "조언을 구하고 반응하는 표현",
          body: "조언을 구할 때는 상황을 짧게 설명하고 선택지를 함께 묻습니다. 조언을 받으면 반응을 먼저 보입니다.",
          table: {
            head: ["상황", "표현", "보기"],
            rows: [
              ["조언 구하기", "What would you do in my position?", "제 입장이면 어떻게 하시겠어요?"],
              ["판단 요청", "Do you think that's the right move?", "그게 맞는 선택일까요?"],
              ["수락 반응", "That's a good point.", "좋은 지적입니다."],
              ["유보 반응", "I'll think about it.", "생각해 볼게요."],
              ["사양 반응", "Thanks, but I'll try my way first.", "고맙지만 먼저 제 방식으로 해 볼게요."]
            ]
          },
          note: "조언을 받았을 때 반응이 없으면 상대는 다시 도와줄 이유를 잃습니다."
        },
        {
          h: "조언을 구하고 반응하기",
          body: "조언을 구할 때는 What would you do in my position? 처럼 상대의 입장에서 묻습니다. 조언을 받으면 반응을 보여야 대화가 이어집니다.",
          table: {
            head: ["상황", "표현"],
            rows: [
              ["조언 구하기", "What would you do in my position?"],
              ["의견 구하기", "Do you have any thoughts on this?"],
              ["받아들이기", "That's a good point. I'll try that."],
              ["보류하기", "That's worth considering. Let me think it over."]
            ]
          },
          note: "Let me think it over. 는 바로 답하지 않고 생각해 보겠다는 표현입니다. 거절보다 부드럽고 시간을 벌 수 있습니다."
        }
      ],
      mistakes: [
        "윗사람에게 You should ~ 를 그대로 쓰는 실수 — You might want to ~ 로 바꾸면 지시가 아니라 제안이 됩니다.",
        "조언을 받고 아무 반응 없이 넘어가는 실수 — That's a good point. 같은 반응을 넣어야 조언자가 다시 도와줍니다.",
        "You'd better ~ 를 윗사람에게 쓰는 실수 — 지시처럼 들립니다. You might want to ~ 로 바꿉니다.",
        "조언만 하고 대안을 말하지 않는 실수 — How about ~ing? 로 선택지를 함께 줍니다.",
        "조언을 부탁해 놓고 바로 반박하는 실수 — 반응을 먼저 보인 뒤 다른 관점을 말합니다."
      ],
      practice: [
        { q: "윗사람에게 쓰기 가장 적합한 조언 표현은?", opts: ["You'd better rewrite the summary.", "You might want to rewrite the summary.", "Rewrite the summary.", "You must rewrite the summary."], a: "You might want to rewrite the summary.", why: "윗사람에게는 완곡한 표현인 You might want to ~ 가 어울립니다." },
        { q: "대안을 제안하는 표현은?", opts: ["How about sending the draft today?", "How about send the draft today?", "How about to send today?", "How about you send today?"], a: "How about sending the draft today?", why: "How about 뒤에는 동명사가 옵니다." },
        { q: "조언을 구하는 표현은?", opts: ["What would you do in my position?", "What you do my position?", "How would you in my position?", "What do in my position you?"], a: "What would you do in my position?", why: "조언을 구할 때는 What would you do in my position? 을 씁니다." },
        { q: "조언을 받아들이는 반응은?", opts: ["That's a good point.", "I don't care.", "You are wrong.", "Whatever."], a: "That's a good point.", why: "반응을 먼저 보이면 조언자가 다시 도와줍니다." },
        { q: "A: The report is due tomorrow. — B: ____", opts: ["You might want to send the draft today.", "You'd better sent it.", "Send it you today.", "It is due, so what."], a: "You might want to send the draft today.", why: "부담을 낮춘 조언 표현으로 제안합니다." },
        { q: "윗사람에게 가장 부드럽게 조언하는 표현은?", opts: ["You should change it.", "You might want to review the numbers.", "You must fix it.", "Change it now."], a: "You might want to review the numbers.", why: "You might want to ~ 는 지시가 아니라 정보를 주는 형태라 격식 있는 자리에 맞습니다." },
        { q: "상대에게 선택을 맡기는 표현은?", opts: ["You must choose A.", "Which would you prefer?", "Do it this way.", "There is no choice."], a: "Which would you prefer?", why: "선택지를 제시하고 Which would you prefer? 로 물으면 상대가 고를 수 있습니다." },
        { q: "바로 답하지 않고 생각해 보겠다고 할 때 알맞은 표현은?", opts: ["I refuse.", "Let me think it over.", "I don't know anything.", "Never ask me again."], a: "Let me think it over.", why: "think it over 는 충분히 검토해 보겠다는 표현으로 거절보다 부드럽습니다." }
      ]
    },
    {
      no: 6,
      title: "동의하고 반대하기",
      intro: "동의도 반대도 한 가지가 아닙니다. 어느 정도 동의하는지 밝히고, 반대할 때는 근거를 붙이는 연습을 하면 회의에서 신뢰를 얻습니다.",
      summary: "반대는 관계를 상하게 하기 쉬운 대화입니다. 부분 동의와 조건부 동의를 섞으면 반대하면서도 협력적으로 들립니다.",
      points: [
        {
          h: "동의의 층위 — 전적으로 / 부분적으로",
          body: "동의도 강도가 있습니다. 전적으로 동의할 때와 일부만 동의할 때를 구분하면 상대가 내 입장을 정확히 알 수 있습니다.",
          table: {
            head: ["동의 정도", "표현"],
            rows: [
              ["전적 동의", "I couldn't agree more."],
              ["강한 동의", "That's exactly how I see it."],
              ["부분 동의", "I agree with you up to a point."],
              ["조건부 동의", "I agree, as long as we keep the budget."],
              ["중립", "I'm on the fence about that."]
            ]
          },
          note: "I couldn't agree more. 는 더 이상 동의할 수 없다, 즉 전적으로 동의한다는 뜻입니다. 부정어가 들어가지만 뜻은 최상급 동의입니다."
        },
        {
          h: "부드럽게 반대하기",
          body: "반대할 때는 내가 틀렸을 가능성을 열어 두는 표현을 씁니다. 이 방식이 상대의 반박을 줄이고 대화를 유지합니다.",
          examples: [
            { en: "I might be missing something, but I don't think that will work.", ko: "제가 놓친 게 있을 수 있지만, 그건 잘 안 될 것 같습니다." },
            { en: "I can see why you'd say that. My concern is the timeline.", ko: "그렇게 말씀하실 만합니다. 다만 일정이 걱정입니다." }
          ],
          note: "My concern is ~ 는 걱정되는 지점을 말하는 표현입니다. I disagree. 보다 훨씬 협력적으로 들립니다."
        },
        {
          h: "표현 확장 — 동의의 세 층위",
          body: "동의는 전적, 부분, 유보로 나뉩니다. 어느 층위인지 밝히지 않으면 나중에 오해가 생깁니다.",
          table: {
            head: ["층위", "표현", "뜻"],
            rows: [
              ["전적 동의", "I couldn't agree more.", "전적으로 동의합니다."],
              ["일반 동의", "I agree with you.", "동의합니다."],
              ["부분 동의", "I agree up to a point.", "어느 정도만 동의합니다."],
              ["조건부 동의", "I'm with you on the goal, not the method.", "목표는 같고 방법은 다릅니다."],
              ["반대", "I'm afraid I see it differently.", "다르게 봅니다."]
            ]
          },
          note: "I couldn't agree more. 는 더 동의할 수 없다는 뜻이라 가장 강한 동의입니다."
        },
        {
          h: "실전 대화 — 부드럽게 반대하고 물러서기",
          body: "반대 뒤에 물러서는 문장까지 준비해 두면 회의가 결정 없이 끝나지 않습니다. 근거를 남기고 다음 단계를 합의합니다.",
          examples: [
            { en: "I think we should postpone the launch.", ko: "출시를 미루는 게 좋겠습니다." },
            { en: "I see it differently. The market window is closing.", ko: "저는 다르게 봅니다. 시장 시점이 좁아지고 있습니다." },
            { en: "That's a fair point. Let's keep the date for now.", ko: "일리 있습니다. 우선 일정은 그대로 두죠." }
          ]
        },
        {
          h: "반대 뒤에 물러설 때 쓰는 표현",
          body: "물러설 때도 조건과 근거를 남깁니다. 무엇을 받아들이고 무엇을 유보했는지 분명히 해야 다음 논의가 이어집니다.",
          table: {
            head: ["표현", "뜻", "쓰는 자리"],
            rows: [
              ["That's a fair point.", "일리 있습니다.", "상대 논리가 타당할 때"],
              ["Let's keep that in mind.", "기억해 두죠.", "바로 결정하지 않을 때"],
              ["I'm happy to go with your call.", "당신 판단을 따르겠습니다.", "결정권이 상대에게 있을 때"],
              ["Could we revisit this later?", "나중에 다시 보죠.", "시간이 필요할 때"],
              ["Let's test both options.", "둘 다 시험해 보죠.", "절충안이 필요할 때"]
            ]
          },
          note: "물러선 뒤에는 누가 무엇을 언제까지 할지 한 줄로 정리합니다."
        },
        {
          h: "반대를 듣고 물러서기",
          body: "상대의 근거가 타당하면 물러서는 것도 기술입니다. 물러설 때 조건을 붙이면 협상력을 잃지 않습니다.",
          table: {
            head: ["상황", "표현"],
            rows: [
              ["수용", "Fair enough. Let's go with your plan."],
              ["조건부 수용", "I can live with that, if we revisit it in a month."],
              ["보류", "Let's park it and come back after the numbers."],
              ["재확인", "Just so I understand, you're saying ~"]
            ]
          },
          note: "Let's park it. 은 지금은 접어 두고 나중에 다시 보자는 뜻입니다. 논쟁을 끊지 않고 잠시 미루는 표현입니다."
        }
      ],
      mistakes: [
        "I disagree with you. 만 던지고 근거를 말하지 않는 실수 — 반대에는 반드시 근거나 걱정 지점을 붙입니다.",
        "I agree with you up to a point 를 전적 동의로 오해하는 실수 — 이 표현은 일부만 동의한다는 뜻입니다.",
        "I couldn't agree more. 를 반대로 이해하는 실수 — 이 표현은 가장 강한 동의입니다.",
        "부분 동의를 전적 동의처럼 말하는 실수 — 어느 부분에서 다른지 범위를 밝힙니다.",
        "반대만 하고 결론을 남기지 않는 실수 — 누가 무엇을 언제까지 할지 한 줄로 정리합니다."
      ],
      practice: [
        { q: "가장 강한 동의 표현은?", opts: ["I couldn't agree more.", "I agree up to a point.", "I'm afraid I see it differently.", "I'll think about it."], a: "I couldn't agree more.", why: "더 동의할 수 없다는 뜻으로 최고 강도의 동의입니다." },
        { q: "부분 동의를 나타내는 표현은?", opts: ["I agree up to a point.", "I agree with everything.", "I'm afraid not.", "I have no opinion."], a: "I agree up to a point.", why: "어느 정도까지만 동의한다는 뜻을 밝히는 표현입니다." },
        { q: "목표는 같지만 방법은 다르다는 표현은?", opts: ["I'm with you on the goal, not the method.", "I'm not with you goal method.", "The goal is not method.", "I agree the method not goal."], a: "I'm with you on the goal, not the method.", why: "동의하는 범위와 다른 지점을 함께 밝힙니다." },
        { q: "결정권을 상대에게 두고 물러서는 표현은?", opts: ["I'm happy to go with your call.", "Do what you want.", "It's not my problem.", "You always decide."], a: "I'm happy to go with your call.", why: "결정을 존중한다는 뜻을 전하면서 물러섭니다." },
        { q: "A: I think we should postpone the launch. — B: ____", opts: ["I see it differently. The market window is closing.", "You are wrong always.", "No, postpone is bad.", "I don't agree you."], a: "I see it differently. The market window is closing.", why: "관점을 주어로 두고 근거를 붙이면 부드러운 반대가 됩니다." },
        { q: "전적으로 동의한다는 뜻의 표현은?", opts: ["I couldn't agree more.", "I agree up to a point.", "I'm on the fence.", "I can't agree."], a: "I couldn't agree more.", why: "더 이상 동의할 수 없다는 형태로 최상급 동의를 나타냅니다." },
        { q: "부드럽게 반대하는 표현은?", opts: ["That's wrong.", "I might be missing something, but I don't think that will work.", "No, never.", "You don't understand."], a: "I might be missing something, but I don't think that will work.", why: "내가 놓친 게 있을 수 있다는 여지를 두면 상대의 반박이 줄어듭니다." },
        { q: "논쟁을 잠시 미루고 나중에 다시 보자고 할 때 알맞은 표현은?", opts: ["Let's park it and come back after the numbers.", "Forget about it forever.", "You are wrong so stop.", "I don't want to hear."], a: "Let's park it and come back after the numbers.", why: "park it 은 지금은 접어 두고 다시 보자는 뜻으로, 관계를 유지하며 미루는 표현입니다." }
      ]
    },
    {
      no: 7,
      title: "사과하고 책임지기",
      intro: "사과는 순서가 중요합니다. 사과, 영향 인정, 재발 방지 세 단계를 지키면 신뢰가 회복되고, 받아 주는 쪽의 표현까지 익히면 관계가 정리됩니다.",
      summary: "영어권 비즈니스에서 사과는 책임 인정과 재발 방지로 끝나는 것이 보통입니다. 이유 설명을 앞세우면 변명으로 들립니다.",
      points: [
        {
          h: "사과의 3단 구성",
          body: "제대로 된 사과는 사과, 영향 인정, 재발 방지로 구성됩니다. 이 세 가지가 모두 있어야 신뢰가 회복됩니다.",
          table: {
            head: ["단계", "표현", "예문"],
            rows: [
              ["사과", "I'm sorry about ~", "I'm sorry about the delay."],
              ["책임", "That was my mistake.", "That was my mistake, and I take responsibility."],
              ["영향 인정", "I understand this caused ~", "I understand this caused you extra work."],
              ["재발 방지", "I've put a check in place.", "I've put a double check in place."]
            ]
          },
          note: "I'm sorry for the inconvenience. 는 격식 있는 사과이고, I'm sorry about ~ 은 구체적인 사안에 대한 사과입니다."
        },
        {
          h: "사과와 설명의 순서",
          body: "설명이 필요하더라도 사과가 먼저입니다. 순서를 바꾸면 사과가 아니라 변명으로 들립니다.",
          examples: [
            { en: "I'm sorry I missed the deadline. The system went down on Friday, and I should have told you right away.", ko: "기한을 놓쳐 죄송합니다. 금요일에 시스템이 멈췄고, 바로 알려 드렸어야 했습니다." },
            { en: "That's on me. I'll make sure it doesn't happen again.", ko: "제 책임입니다. 다시는 이런 일이 없도록 하겠습니다." }
          ],
          note: "That's on me. 는 제 책임이라는 뜻의 구어 표현입니다. I'll make sure it doesn't happen again. 을 붙이면 사과가 완성됩니다."
        },
        {
          h: "표현 확장 — 사과의 다섯 단계",
          body: "사과는 사과, 영향 인정, 재발 방지, 보상, 정리 순서로 이어집니다. 단계를 갖추면 같은 실수도 신뢰로 바뀝니다.",
          table: {
            head: ["단계", "표현", "보기"],
            rows: [
              ["사과", "I'm sorry about ~", "I'm sorry about the delay."],
              ["영향 인정", "I understand this caused ~", "I understand this caused extra work."],
              ["재발 방지", "I'll make sure it doesn't happen again.", "다시는 없도록 하겠습니다."],
              ["보상 제안", "Let me offer ~", "Let me offer a credit note."],
              ["정리", "Thank you for your understanding.", "이해해 주셔서 감사합니다."]
            ]
          },
          note: "사과에는 변명을 붙이지 않습니다. 이유는 상대가 물었을 때 말합니다."
        },
        {
          h: "실전 대화 — 사과하고 보상까지 말하기",
          body: "납기 지연을 알릴 때의 세 문장입니다. 사과로 시작해 영향을 인정하고 보상을 제안합니다.",
          examples: [
            { en: "I'm sorry about the late delivery.", ko: "배송이 늦어 죄송합니다." },
            { en: "I understand this caused extra work for your team.", ko: "팀에 추가 업무가 생겼을 것 같습니다." },
            { en: "Let me offer a credit note for the inconvenience.", ko: "불편에 대한 보상으로 크레딧을 드리겠습니다." }
          ]
        },
        {
          h: "상대의 사과를 받아 주는 표현",
          body: "사과를 받아 줄 때도 다음 조치를 남깁니다. 문제를 덮지 않고 제도로 막아 두는 것이 신뢰를 지키는 길입니다.",
          table: {
            head: ["표현", "뜻", "쓰는 자리"],
            rows: [
              ["Thank you for letting me know.", "알려 주셔서 고맙습니다.", "먼저 알려 왔을 때"],
              ["I appreciate you being upfront.", "솔직히 말해 주셔서 고맙습니다.", "문제를 숨기지 않았을 때"],
              ["Let's move on.", "넘어가죠.", "가벼운 실수"],
              ["Let's make sure we have a plan.", "계획을 세워 두죠.", "반복될 수 있을 때"],
              ["I'd like to see how this can be prevented.", "재발 방지책을 보고 싶습니다.", "공식적인 자리"]
            ]
          },
          note: "사과를 받아 줄 때도 다음 조치를 한 줄 남기면 같은 일이 반복되지 않습니다."
        },
        {
          h: "상대의 사과 받아 주기",
          body: "사과를 받았을 때는 용서와 다음 단계를 함께 말합니다. 계속 문제를 반복하지 않으면서 관계를 회복하는 표현입니다.",
          table: {
            head: ["상황", "표현"],
            rows: [
              ["가벼운 사안", "No worries. These things happen."],
              ["받아들이기", "Thanks for letting me know. Let's move on."],
              ["조건부 수용", "I appreciate that. Let's make sure we have a backup."],
              ["기록 필요", "I understand. Could you put that in an email?"]
            ]
          },
          note: "No worries. 는 괜찮다는 뜻의 편한 표현입니다. These things happen. 은 이런 일도 있죠라고 넘겨 주는 말입니다."
        }
      ],
      mistakes: [
        "이유 설명을 사과보다 앞세우는 실수 — 사과가 먼저, 설명이 뒤입니다.",
        "Sorry. 만 반복하고 재발 방지나 책임을 말하지 않는 실수 — 상대는 다음을 어떻게 할지 알고 싶어 합니다.",
        "사과를 받아 줄 때 그냥 넘아가는 실수 — Let's make sure we have a plan. 처럼 다음 조치를 남깁니다.",
        "보상 제안 없이 사과만 되풀이하는 실수 — Let me offer ~ 로 구체적인 보상을 함께 말합니다.",
        "사과한 뒤에도 변명을 덧붙이는 실수 — 이유는 상대가 물었을 때만 말합니다."
      ],
      practice: [
        { q: "사과의 첫 문장으로 알맞은 것은?", opts: ["I'm sorry about the delay.", "The delay was caused by the vendor.", "You might have misunderstood.", "It was not our fault."], a: "I'm sorry about the delay.", why: "사과가 먼저이고 이유는 뒤에 둡니다." },
        { q: "상대의 부담을 인정하는 표현은?", opts: ["I understand this caused extra work.", "It was not much work.", "Nobody noticed.", "You should have waited."], a: "I understand this caused extra work.", why: "영향을 인정하면 사과가 구체적으로 들립니다." },
        { q: "재발 방지를 밝히는 표현은?", opts: ["I'll make sure it doesn't happen again.", "It may happen again.", "We are always busy.", "It was a one time thing."], a: "I'll make sure it doesn't happen again.", why: "재발 방지 약속이 사과를 완성합니다." },
        { q: "보상을 제안하는 표현은?", opts: ["Let me offer a credit note.", "You can wait longer.", "We will think about it.", "Maybe next time."], a: "Let me offer a credit note.", why: "구체적 보상은 불만을 줄여 줍니다." },
        { q: "A: I'm sorry about the late delivery. — B: ____", opts: ["Thank you for letting me know. Let's make sure we have a plan.", "That is fine no plan needed.", "You are always late.", "Apology accepted nothing else."], a: "Thank you for letting me know. Let's make sure we have a plan.", why: "받아 주면서도 다음 조치를 남기는 표현입니다." },
        { q: "제대로 된 사과에 반드시 들어가야 할 요소는?", opts: ["변명", "재발 방지 약속", "상대의 잘못 지적", "긴 배경 설명"], a: "재발 방지 약속", why: "사과, 책임, 영향 인정, 재발 방지가 갖춰져야 신뢰가 회복됩니다." },
        { q: "사과와 설명을 함께 할 때 올바른 순서는?", opts: ["설명 → 사과", "사과 → 설명", "설명만", "사과만"], a: "사과 → 설명", why: "설명이 먼저 오면 변명으로 들립니다. 사과가 먼저입니다." },
        { q: "제 책임이라고 말하는 구어 표현은?", opts: ["That's on me.", "That's for me.", "That's to me.", "That's mine me."], a: "That's on me.", why: "That's on me. 는 제 책임이라는 뜻의 자연스러운 표현입니다." }
      ]
    },
    {
      no: 8,
      title: "회의에서 발언하기",
      intro: "회의에서는 언제 어떻게 들어가느냐가 인상을 좌우합니다. 끼어들기, 구조화해서 말하기, 결정 합의까지 세 단계로 정리합니다.",
      summary: "회의에서는 언제 끼어들지, 어떻게 정리할지가 실력입니다. 끼어들 때는 사과 없이 짧게 신호를 주는 것이 원어민 방식입니다.",
      points: [
        {
          h: "끼어들고 시작하기",
          body: "회의에서 발언을 시작할 때는 사과를 붙이지 않고 끼어들 신호만 짧게 줍니다. Sorry 를 반복하면 발언권이 약해집니다.",
          table: {
            head: ["상황", "표현"],
            rows: [
              ["끼어들기", "Can I jump in here?"],
              ["덧붙이기", "Just to add to what Mina said ~"],
              ["연결하기", "To build on that ~"],
              ["되돌리기", "Coming back to your earlier point ~"],
              ["정리하기", "Can I just summarize where we are?"]
            ]
          },
          note: "jump in 은 대화에 끼어든다는 뜻입니다. Can I jump in here? 는 가장 널리 쓰이는 발언 신호입니다."
        },
        {
          h: "의견을 구조화해서 말하기",
          body: "회의 발언은 세 부분으로 나누면 설득력이 올라갑니다. 주장, 근거, 요청 순서입니다.",
          examples: [
            { en: "I'd suggest we delay the launch. The testing isn't finished, and shipping a bug would cost more. Could we review it next Tuesday?", ko: "출시를 미루는 게 좋겠습니다. 테스트가 끝나지 않았고, 버그가 나가면 비용이 더 큽니다. 다음 주 화요일에 다시 볼 수 있을까요?" },
            { en: "There are two things to consider here. First, the cost. Second, the timing.", ko: "여기서 고려할 것이 두 가지 있습니다. 첫째는 비용, 둘째는 시기입니다." }
          ],
          note: "There are two things to consider. 처럼 개수를 먼저 밝히면 듣는 사람이 따라오기 쉬워집니다."
        },
        {
          h: "표현 확장 — 회의 발언의 다섯 단계",
          body: "회의 발언은 들어가기, 요청, 근거, 정리, 합의 순서로 짜면 짧아도 분명하게 들립니다.",
          table: {
            head: ["단계", "표현", "보기"],
            rows: [
              ["끼어들기", "Can I jump in here?", "잠깐 말씀드려도 될까요?"],
              ["의견 제시", "I'd like to add one point.", "한 가지 덧붙이겠습니다."],
              ["근거", "The data from last quarter shows ~", "지난 분기 데이터를 보면 ~"],
              ["정리", "So the key takeaway is ~", "정리하면 핵심은 ~"],
              ["합의", "Who will take the lead on this?", "누가 맡을까요?"]
            ]
          },
          note: "발언이 길어지면 요약으로 돌아옵니다. So the key takeaway is ~"
        },
        {
          h: "실전 대화 — 의견을 구조화해서 말하기",
          body: "회의에서 바로 쓸 수 있는 세 문장입니다. 들어가기, 근거, 요약 순서로 말합니다.",
          examples: [
            { en: "Can I jump in here? I'd like to add one point.", ko: "잠깐 말씀드려도 될까요? 한 가지 덧붙이겠습니다." },
            { en: "The data from last quarter shows a similar pattern.", ko: "지난 분기 데이터도 비슷한 양상을 보였습니다." },
            { en: "So the key takeaway is that we should test first.", ko: "정리하면 먼저 시험해 봐야 한다는 것입니다." }
          ]
        },
        {
          h: "회의를 결정으로 끝내는 표현",
          body: "회의는 결론보다 담당과 기한이 남아야 실행됩니다. 마무리 문장을 미리 준비해 둡니다.",
          table: {
            head: ["상황", "표현", "보기"],
            rows: [
              ["담당 정하기", "Who's going to take the lead on this?", "누가 맡을까요?"],
              ["기한 정하기", "When can we expect an update?", "언제 업데이트를 받을까요?"],
              ["다음 회의", "Let's reconvene on Friday.", "금요일에 다시 모이죠."],
              ["기록 남기기", "I'll send the minutes today.", "오늘 회의록을 보내겠습니다."],
              ["최종 확인", "Does everyone agree with the plan?", "모두 동의하십니까?"]
            ]
          },
          note: "회의록은 결정 사항과 담당, 기한을 함께 적어야 실행으로 이어집니다."
        },
        {
          h: "정리하고 다음 단계 합의하기",
          body: "회의 끝에는 결정된 것과 담당, 기한을 확인합니다. 이 정리가 없으면 회의가 반복됩니다.",
          table: {
            head: ["확인할 것", "표현"],
            rows: [
              ["결정", "So we've agreed to ~"],
              ["담당", "Who's going to take the lead on this?"],
              ["기한", "Let's aim for Friday then."],
              ["기록", "I'll send out the notes after this."],
              ["보류", "We'll leave that for the next meeting."]
            ]
          },
          note: "So we've agreed to ~ 는 합의를 확인하는 표현입니다. 여기서 상대가 이견을 말하면 아직 합의가 아니라는 뜻입니다."
        }
      ],
      mistakes: [
        "발언할 때마다 Sorry, sorry. 를 붙이는 실수 — 회의에서는 사과 없이 Can I jump in here? 로 시작합니다.",
        "회의를 결정 없이 끝내는 실수 — Who's going to take the lead on this? 로 담당과 기한을 확인합니다.",
        "의견만 말하고 근거를 붙이지 않는 실수 — The data from last quarter shows ~ 처럼 근거를 함께 제시합니다.",
        "논의한 내용을 정리하지 않고 넘아가는 실수 — So the key takeaway is ~ 로 요약해 두면 결정이 남습니다.",
        "합의한 담당과 기한을 기록하지 않는 실수 — 회의록에 담당·기한을 남기도록 확인합니다."
      ],
      practice: [
        { q: "회의에 끼어들 때 쓰는 표현은?", opts: ["Can I jump in here?", "Sorry, sorry, listen to me.", "I talk now.", "Stop and hear me."], a: "Can I jump in here?", why: "회의에서는 사과 없이 Can I jump in here? 로 들어갑니다." },
        { q: "의견에 근거를 붙이는 표현은?", opts: ["The data from last quarter shows a similar pattern.", "I feel it is similar.", "Everyone knows this.", "It is obvious."], a: "The data from last quarter shows a similar pattern.", why: "근거를 데이터로 밝히면 발언의 무게가 달라집니다." },
        { q: "논의를 요약하는 표현은?", opts: ["So the key takeaway is that we should test first.", "Anyway let's move on.", "That is all from me.", "I forgot the point."], a: "So the key takeaway is that we should test first.", why: "정리 문장을 남겨야 회의 내용이 결정으로 이어집니다." },
        { q: "담당을 정하는 질문은?", opts: ["Who's going to take the lead on this?", "Who likes this?", "Is anyone here?", "Who decided this?"], a: "Who's going to take the lead on this?", why: "담당을 묻는 표현으로 회의를 실행으로 연결합니다." },
        { q: "A: So the key takeaway is that we need more testing. — B: ____", opts: ["Let's reconvene on Friday. I'll send the minutes today.", "That is not my job.", "I have nothing to add.", "Testing is boring."], a: "Let's reconvene on Friday. I'll send the minutes today.", why: "다음 일정과 기록을 남기면 회의가 결정으로 끝납니다." },
        { q: "회의에서 발언을 시작할 때 가장 알맞은 표현은?", opts: ["Sorry, sorry, may I speak?", "Can I jump in here?", "Excuse me, excuse me.", "I want to talk."], a: "Can I jump in here?", why: "회의에서는 사과를 붙이지 않고 짧은 신호로 발언을 시작하는 것이 자연스럽습니다." },
        { q: "앞사람 말에 덧붙일 때 알맞은 표현은?", opts: ["Just to add to what Mina said ~", "Mina is wrong.", "Ignore Mina.", "Mina already said."], a: "Just to add to what Mina said ~", why: "앞사람의 발언에 덧붙인다는 것을 밝히면 흐름이 자연스럽게 이어집니다." },
        { q: "회의를 마무리하며 담당을 정할 때 알맞은 말은?", opts: ["Who's going to take the lead on this?", "Who is the leader forever?", "Take the lead now.", "Someone will do it."], a: "Who's going to take the lead on this?", why: "담당과 기한을 확인해야 회의가 결정으로 끝납니다." }
      ]
    },
    {
      no: 9,
      title: "협상하고 조건 맞추기",
      intro: "협상은 요구가 아니라 교환입니다. 조건을 붙여 제안하고, 양보할 때 대가를 요구하고, 결정을 미룰 때 시간을 버는 표현을 익힙니다.",
      summary: "협상은 조건을 주고받는 과정입니다. If you ~, we could ~ 구조를 쓰면 상대에게 선택지를 주면서 원하는 것을 얻을 수 있습니다.",
      points: [
        {
          h: "조건부 제안 — If you ~, we could ~",
          body: "협상에서는 요구가 아니라 교환을 말합니다. 상대가 무언가를 해 주면 우리가 이것을 하겠다는 형태가 가장 효과적입니다.",
          examples: [
            { en: "If you can take the first batch, we could cover the shipping.", ko: "첫 물량을 맡아 주시면 운송비는 저희가 부담하겠습니다." },
            { en: "We could shorten the schedule if we add one more person.", ko: "한 명을 더 투입하면 일정을 줄일 수 있습니다." }
          ],
          note: "could 는 can 보다 여지를 남기는 표현이라 협상에서 유리합니다. 확정된 약속처럼 들리지 않습니다."
        },
        {
          h: "양보하고 대가를 요구하기",
          body: "양보할 때는 조건을 함께 붙입니다. 조건 없이 양보하면 기준이 낮아집니다.",
          table: {
            head: ["하고 싶은 말", "표현"],
            rows: [
              ["조건부 양보", "We could do that, as long as the volume stays the same."],
              ["한계 밝히기", "That's about as far as we can go."],
              ["대가 요구", "If we move on price, could you commit to a longer term?"],
              ["여지 남기기", "Let me see what I can do."]
            ]
          },
          note: "That's about as far as we can go. 는 여기까지가 한계라는 뜻입니다. 거절이 아니라 한계를 알리는 표현입니다."
        },
        {
          h: "표현 확장 — 협상의 다섯 단계",
          body: "협상은 제안, 조건 확인, 양보, 대가 요구, 마무리 순서로 짜입니다. could 를 섞으면 요구보다 제안으로 들립니다.",
          table: {
            head: ["단계", "표현", "보기"],
            rows: [
              ["조건부 제안", "If you ~, we could ~", "If you cover shipping, we could order today."],
              ["유연성 요청", "Could you be flexible on ~?", "납기를 조정해 주실 수 있나요?"],
              ["대가 요구", "If we agree to that, we'd need ~", "그걸 받아들이면 추가 조건이 필요합니다."],
              ["시간 벌기", "Let me check with my team.", "팀과 확인해 보겠습니다."],
              ["마무리", "Let's put that in writing.", "문서로 남기죠."]
            ]
          },
          note: "조건부 제안에서 could 를 쓰면 요구보다 제안처럼 들립니다."
        },
        {
          h: "실전 대화 — 조건을 붙여 협상하기",
          body: "단가와 물량을 맞바꾸는 상황의 세 문장입니다. 조건을 먼저 말하고 확인한 뒤 시간을 법니다.",
          examples: [
            { en: "If you cover the shipping, we could place the order today.", ko: "운송비를 부담해 주시면 오늘 주문할 수 있습니다." },
            { en: "We can do that if the volume stays above 500 units.", ko: "수량이 500개 이상이면 가능합니다." },
            { en: "Let me check with my team and get back to you.", ko: "팀과 확인한 뒤 다시 연락드리겠습니다." }
          ]
        },
        {
          h: "시간을 벌고 합의를 고정하는 표현",
          body: "바로 답하지 않아도 실례가 아닙니다. 확인할 사람을 밝히고 답할 시점을 약속하면 신뢰가 유지됩니다.",
          table: {
            head: ["표현", "뜻", "쓰는 자리"],
            rows: [
              ["Let me get back to you.", "다시 연락드리겠습니다.", "바로 답하기 어려울 때"],
              ["I'll need to check with my manager.", "상사와 확인해야 합니다.", "결정권이 없을 때"],
              ["Let's put that in writing.", "문서로 남깁시다.", "합의를 고정할 때"],
              ["Can we agree on the main points today?", "오늘 핵심만 합의할까요?", "전체 합의가 어려울 때"],
              ["That works for us.", "저희는 괜찮습니다.", "최종 수락"]
            ]
          },
          note: "구두 합의는 문서로 남겨야 나중에 기준이 흔들리지 않습니다."
        },
        {
          h: "시간을 벌고 마무리하기",
          body: "바로 답할 수 없을 때는 시간을 요청하고, 합의되면 조건을 정리해 확인합니다.",
          table: {
            head: ["상황", "표현"],
            rows: [
              ["시간 요청", "Can I get back to you on that by tomorrow?"],
              ["조건 확인", "So to confirm, that's ~"],
              ["부분 합의", "Let's lock in the price and decide on volume later."],
              ["다음 단계", "I'll send the revised quote this afternoon."]
            ]
          },
          note: "Can I get back to you on that? 는 나중에 답하겠다는 표현입니다. 협상에서 즉답을 피하는 가장 자연스러운 방법입니다."
        }
      ],
      mistakes: [
        "조건 없이 OK, we can do that. 이라고 양보하는 실수 — as long as ~ 로 조건을 붙여야 기준이 유지됩니다.",
        "협상 중에 I need ~ 처럼 내 필요만 말하는 실수 — If you ~, we could ~ 로 교환 구조를 만듭니다.",
        "양보만 하고 대가를 요구하지 않는 실수 — If we agree to that, we'd need ~ 로 조건을 붙입니다.",
        "시간을 벌지 못하고 조건 없이 수락하는 실수 — Let me check with my team. 으로 확인할 여지를 남깁니다.",
        "합의를 문서로 남기지 않는 실수 — Let's put that in writing. 으로 기준을 고정합니다."
      ],
      practice: [
        { q: "조건부 제안의 틀은?", opts: ["If you cover the shipping, we could place the order today.", "You cover shipping and we order.", "We order you pay shipping.", "If you shipping we order today."], a: "If you cover the shipping, we could place the order today.", why: "If you ~, we could ~ 형태로 조건과 제안을 함께 말합니다." },
        { q: "유연성을 요청하는 표현은?", opts: ["Could you be flexible on the delivery date?", "Change the date.", "You must move the date.", "Date is wrong."], a: "Could you be flexible on the delivery date?", why: "be flexible on + 항목 형태로 조정 여지를 묻습니다." },
        { q: "대가를 요구하는 표현은?", opts: ["If we agree to that, we'd need a longer lead time.", "We agree, no conditions.", "We accept everything.", "That is fine, no need."], a: "If we agree to that, we'd need a longer lead time.", why: "양보에는 대가를 함께 붙여야 기준이 유지됩니다." },
        { q: "답을 미루며 시간을 버는 표현은?", opts: ["Let me check with my team and get back to you.", "Maybe yes maybe no.", "I cannot answer.", "Ask someone else."], a: "Let me check with my team and get back to you.", why: "확인할 사람과 다시 연락할 뜻을 밝히면 실례가 되지 않습니다." },
        { q: "합의를 고정하는 표현은?", opts: ["Let's put that in writing.", "Let's remember it.", "We will see.", "It is fine verbally."], a: "Let's put that in writing.", why: "구두 합의는 문서로 남겨야 기준이 흔들리지 않습니다." },
        { q: "협상에서 가장 효과적인 구조는?", opts: ["I need this immediately.", "If you can take the first batch, we could cover the shipping.", "You must lower the price.", "This is our final answer."], a: "If you can take the first batch, we could cover the shipping.", why: "조건을 주고받는 교환 구조가 요구만 하는 것보다 훨씬 효과적입니다." },
        { q: "양보할 때 조건을 붙이는 표현은?", opts: ["We could do that, as long as the volume stays the same.", "We can do anything.", "Yes, whatever you want.", "No conditions."], a: "We could do that, as long as the volume stays the same.", why: "as long as 는 조건을 붙이는 표현으로, 양보의 대가를 분명히 합니다." },
        { q: "즉답을 피하고 시간을 벌 때 알맞은 표현은?", opts: ["I don't know.", "Can I get back to you on that by tomorrow?", "Never.", "Ask someone else."], a: "Can I get back to you on that by tomorrow?", why: "나중에 답하겠다고 하면서 시점을 밝히면 협상 흐름이 유지됩니다." }
      ]
    },
    {
      no: 10,
      title: "추측하고 확신 정도 나타내기",
      intro: "추측은 확신의 정도를 드러내는 일입니다. must, might, can't 의 사다리를 익히고, 모를 때 솔직히 말하는 표현까지 준비합니다.",
      summary: "영어는 확신의 정도를 조동사로 표현합니다. must, might, can't 를 구분하면 단정과 추측을 정확히 나눌 수 있습니다.",
      points: [
        {
          h: "확신의 정도 — must / might / can't",
          body: "증거의 강도에 따라 조동사를 고릅니다. 강한 확신은 must, 가능성은 might, 부정 확신은 can't 입니다.",
          table: {
            head: ["확신", "표현", "예문"],
            rows: [
              ["거의 확실(긍정)", "must be", "The traffic must be terrible."],
              ["가능성", "might be / could be", "She might be in a meeting."],
              ["거의 확실(부정)", "can't be", "It can't be that expensive."],
              ["과거 추측", "must have p.p.", "He must have missed the train."],
              ["과거 부정 추측", "can't have p.p.", "They can't have finished already."]
            ]
          },
          note: "mustn't 는 추측의 부정이 아닙니다. 금지를 뜻합니다. 추측의 부정은 can't 를 씁니다."
        },
        {
          h: "불확실할 때 솔직하게 말하기",
          body: "모르는 것을 아는 척하면 신뢰를 잃습니다. 확신이 없다는 것을 밝히고 확인 방법을 제안하는 편이 낫습니다.",
          examples: [
            { en: "I'm not sure yet. It could go either way.", ko: "아직 확실하지 않습니다. 어느 쪽으로도 갈 수 있습니다." },
            { en: "I'd rather not guess. Let me check with the team and confirm.", ko: "추측은 피하고 싶습니다. 팀에 확인해서 알려 드리겠습니다." }
          ],
          note: "It could go either way. 는 결과가 어느 쪽이든 가능하다는 표현입니다. 확답을 피하면서도 유용한 정보를 줍니다."
        },
        {
          h: "표현 확장 — 확신의 사다리",
          body: "추측은 확신의 정도에 따라 조동사를 바꿉니다. 어느 단계인지 밝히면 상대가 행동을 정할 수 있습니다.",
          table: {
            head: ["확신", "표현", "예문"],
            rows: [
              ["거의 확실", "must be", "He must be in the meeting."],
              ["기대", "should be", "The file should be ready by now."],
              ["가능성", "may be / might be", "She might be on leave."],
              ["낮은 가능성", "could be", "It could be a typo."],
              ["부정 확신", "can't be", "It can't be the same file."]
            ]
          },
          note: "추측의 부정은 can't be 입니다. mustn't be 는 금지를 뜻합니다."
        },
        {
          h: "실전 대화 — 추측하고 확인하기",
          body: "상황을 보고 추측한 뒤 바로 확인하는 흐름이 자연스럽습니다. 단정하지 않고 근거를 붙입니다.",
          examples: [
            { en: "The lights are off. They must be out for lunch.", ko: "불이 꺼져 있네요. 점심 먹으러 나간 게 틀림없습니다." },
            { en: "It might be a power issue, though.", ko: "그런데 전원 문제일 수도 있습니다." },
            { en: "Let's check the panel first.", ko: "먼저 차단기를 확인해 보죠." }
          ]
        },
        {
          h: "전망을 말할 때 쓰는 표현",
          body: "전망은 확신의 정도와 근거를 함께 말합니다. 판단이 이르면 그렇다고 밝히고 다시 볼 시점을 정합니다.",
          table: {
            head: ["표현", "뜻", "확신 정도"],
            rows: [
              ["It's likely that ~", "~할 것 같습니다.", "높음"],
              ["It may well ~", "~할 가능성이 큽니다.", "중간"],
              ["There's a chance that ~", "~할 여지가 있습니다.", "낮음"],
              ["It's too early to tell.", "판단하기 이릅니다.", "모름"],
              ["Let's revisit in two weeks.", "2주 뒤에 다시 보죠.", "시간 필요"]
            ]
          },
          note: "전망을 말할 때는 지난 분기 추세 같은 근거를 한 줄 붙이면 단정처럼 들리지 않습니다."
        },
        {
          h: "전망을 말할 때 — 정도의 차이",
          body: "앞으로의 일을 말할 때는 가능성의 정도를 부사로 조절합니다. 과장하지 않으면서 기대를 전달할 수 있습니다.",
          table: {
            head: ["가능성", "표현"],
            rows: [
              ["매우 높음", "It's very likely that ~"],
              ["높음", "We should be able to ~"],
              ["반반", "There's a good chance ~"],
              ["낮음", "It's unlikely, but not impossible."],
              ["모름", "It's too early to tell."]
            ]
          },
          note: "It's too early to tell. 은 아직 판단하기 이르다는 뜻입니다. 무리한 예측을 요구받았을 때 유용합니다."
        }
      ],
      mistakes: [
        "추측의 부정으로 mustn't be 를 쓰는 실수 — 추측의 부정은 can't be 입니다. mustn't 는 금지입니다.",
        "모르는 것을 I'm sure 로 단정하는 실수 — I'm not sure yet. 이나 It's too early to tell. 로 솔직하게 말합니다.",
        "should be 와 must be 를 섞는 실수 — should be 는 기대, must be 는 거의 확실한 추측입니다.",
        "모르는 것을 애매하게 넘기는 실수 — It's too early to tell. 로 밝히고 다시 볼 시점을 정합니다.",
        "전망을 말할 때 근거를 빼는 실수 — 앞선 데이터나 추세를 한 줄 붙입니다."
      ],
      practice: [
        { q: "거의 확실한 추측을 나타내는 표현은?", opts: ["He must be in the meeting.", "He can be in the meeting.", "He is be in the meeting.", "He must in the meeting."], a: "He must be in the meeting.", why: "must be 는 거의 확신하는 추측입니다." },
        { q: "추측의 부정으로 알맞은 것은?", opts: ["It can't be the same file.", "It mustn't be the same file.", "It doesn't be the same file.", "It not be the same file."], a: "It can't be the same file.", why: "추측의 부정은 can't be 이고 mustn't 는 금지입니다." },
        { q: "_할 가능성이 크다는 전망 표현은?", opts: ["It may well improve next quarter.", "It must improve next quarter.", "It improve next quarter.", "It is improve next quarter."], a: "It may well improve next quarter.", why: "may well 은 가능성이 크다는 뜻입니다." },
        { q: "판단하기 이르다고 말하는 표현은?", opts: ["It's too early to tell.", "I'm sure it will fail.", "Nothing will happen.", "It is certain."], a: "It's too early to tell.", why: "모를 때는 단정하지 않고 판단 시점을 미룹니다." },
        { q: "A: The lights are off. — B: ____", opts: ["They must be out for lunch. Let's check the panel first.", "They are gone forever.", "I knew they left.", "Nobody here I am sure."], a: "They must be out for lunch. Let's check the panel first.", why: "추측과 확인 행동을 함께 말하면 대화가 앞으로 나갑니다." },
        { q: "그가 기차를 놓친 게 거의 확실할 때 알맞은 표현은?", opts: ["He must have missed the train.", "He must miss the train.", "He can't have missed the train.", "He should miss the train."], a: "He must have missed the train.", why: "과거에 대한 강한 추측은 must have + 과거분사로 씁니다." },
        { q: "추측의 부정을 나타내는 표현은?", opts: ["It mustn't be expensive.", "It can't be that expensive.", "It shouldn't be expensive.", "It won't be expensive."], a: "It can't be that expensive.", why: "추측의 부정은 can't 입니다. mustn't 는 금지를 뜻합니다." },
        { q: "아직 판단하기 이르다고 말할 때 알맞은 표현은?", opts: ["It's too early to tell.", "It's too late to see.", "It's not a time.", "I don't see time."], a: "It's too early to tell.", why: "아직 결과를 알 수 없다는 뜻으로, 과도한 예측을 피하는 표현입니다." }
      ]
    },
    {
      no: 11,
      title: "들은 것을 전하고 확인하기",
      intro: "들은 것을 전할 때는 시제와 출처가 함께 바뀝니다. 누가 무엇을 말했는지, 얼마나 확실한지 밝히는 습관이 오해를 줄입니다.",
      summary: "전달 화법은 시제를 한 단계 뒤로 옮기고 대명사와 시간 표현을 바꿉니다. 소문을 옮길 때는 출처를 밝혀 책임을 나눕니다.",
      points: [
        {
          h: "전달 화법의 세 가지 변화",
          body: "남의 말을 옮길 때는 시제, 대명사, 시간 표현을 함께 바꿉니다. 이 셋 중 하나만 빠져도 어색해집니다.",
          table: {
            head: ["바꿀 것", "직접 화법", "전달 화법"],
            rows: [
              ["시제", "I am busy.", "He said he was busy."],
              ["대명사", "I will call you.", "She said she would call me."],
              ["시간", "I'll do it tomorrow.", "He said he'd do it the next day."],
              ["지시어", "Bring this file.", "He asked me to bring that file."]
            ]
          },
          note: "지금도 사실인 내용은 시제를 그대로 둘 수 있습니다. He said he is busy. 도 문법적으로 가능합니다."
        },
        {
          h: "출처를 밝혀 전하기",
          body: "확인되지 않은 정보를 옮길 때는 출처를 밝히고 확신의 정도를 표시합니다. 이 습관이 잘못된 정보 전파를 막습니다.",
          table: {
            head: ["확신 정도", "표현"],
            rows: [
              ["직접 확인", "I heard it from the manager myself."],
              ["전해 들음", "Apparently, the budget was cut."],
              ["소문", "Rumor has it that ~"],
              ["미확인", "I'm not sure if this is confirmed, but ~"],
              ["확인 요청", "Do you know if that's true?"]
            ]
          },
          note: "Apparently 는 전해 들은 이야기라는 뜻으로, 내가 직접 본 것이 아님을 알립니다. 소문을 옮길 때 가장 안전합니다."
        },
        {
          h: "표현 확장 — 전달 화법의 변화",
          body: "전달 화법에서는 시제, 대명사, 시간·장소 표현이 함께 바뀝니다. 하나라도 그대로 두면 언제 일인지 흐려집니다.",
          table: {
            head: ["항목", "직접 표현", "전달 표현"],
            rows: [
              ["시제", "I am busy.", "He said he was busy."],
              ["대명사", "I will call you.", "She said she would call me."],
              ["시간", "tomorrow", "the next day"],
              ["장소", "here", "there"],
              ["의문문", "Where is it?", "He asked where it was."]
            ]
          },
          note: "전달 화법에서는 시간 표현도 바뀝니다. 오늘은 that day, 어제는 the day before 입니다."
        },
        {
          h: "실전 대화 — 출처를 밝혀 전하기",
          body: "정보를 전할 때는 확인된 것과 들은 것을 나눠 말합니다. 내가 본 것인지 전해 들은 것인지 밝히면 신뢰가 유지됩니다.",
          examples: [
            { en: "The manager said the deadline had moved to Friday.", ko: "부장님이 마감이 금요일로 바뀌었다고 하셨습니다." },
            { en: "Apparently, the vendor confirmed it in writing.", ko: "듣기로는 공급업체가 문서로 확인했다고 합니다." },
            { en: "I haven't seen the email myself, so let me check.", ko: "저는 그 메일을 직접 보지 못해서 확인해 보겠습니다." }
          ]
        },
        {
          h: "확실성 등급을 밝히는 표현",
          body: "같은 정보라도 어디서 왔는지에 따라 무게가 다릅니다. 등급을 밝혀 두면 나중에 책임 문제가 생기지 않습니다.",
          table: {
            head: ["표현", "뜻", "확실성"],
            rows: [
              ["I saw the email myself.", "메일을 직접 봤습니다.", "높음"],
              ["The manager told me directly.", "부장님이 직접 말했습니다.", "높음"],
              ["Apparently, ~", "듣기로는 ~", "중간"],
              ["I heard it secondhand.", "간접적으로 들었습니다.", "낮음"],
              ["I'm not sure if that's confirmed.", "확인된 것인지 잘 모르겠습니다.", "불확실"]
            ]
          },
          note: "간접 정보는 출처를 밝혀 두면 전달 과정에서 책임이 흐려지지 않습니다."
        },
        {
          h: "잘못 알아들은 것을 바로잡기",
          body: "전달이 어긋났을 때는 조용히 고치면 오해가 남습니다. 다시 확인하는 표현으로 정확히 바로잡습니다.",
          examples: [
            { en: "Sorry, just to make sure I understood — you meant Monday, not Tuesday, right?", ko: "죄송하지만 확인차 여쭙니다. 화요일이 아니라 월요일 말씀이시죠?" },
            { en: "I think I misheard. Could you repeat the date?", ko: "제가 잘못 들은 것 같습니다. 날짜를 다시 말씀해 주시겠어요?" }
          ],
          note: "just to make sure I understood 는 내가 제대로 이해했는지 확인한다는 표현입니다. 상대의 실수를 지적하지 않고 확인할 수 있습니다."
        }
      ],
      mistakes: [
        "시제를 바꾸지 않고 He said he is busy. 라고만 하는 실수 — 시제, 대명사, 시간 표현을 함께 바꾸는 것이 기본입니다.",
        "출처 없이 I heard the budget was cut. 이라고 단정하는 실수 — Apparently 나 미확인임을 밝히는 표현을 붙입니다.",
        "전달할 때 대명사를 그대로 두는 실수 — She said she would call me. 처럼 대명사를 바꿉니다.",
        "시간 표현을 그대로 옮기는 실수 — tomorrow 는 the next day 로 바꿉니다.",
        "직접 본 것과 들은 것을 섞어 말하는 실수 — I saw the email myself. 와 Apparently, ~ 를 구분합니다."
      ],
      practice: [
        { q: "전달 화법에서 시제를 바르게 바꾼 문장은?", opts: ["He said he was busy.", "He said he is busy.", "He said he busy.", "He says he was busy."], a: "He said he was busy.", why: "전달 화법에서는 시제를 한 단계 뒤로 옮깁니다." },
        { q: "전달 화법에서 tomorrow 를 바꾼 표현은?", opts: ["the next day", "tomorrow", "yesterday", "the same day"], a: "the next day", why: "전달 시점이 바뀌므로 tomorrow 는 the next day 가 됩니다." },
        { q: "간접 정보임을 밝히는 표현은?", opts: ["Apparently, the vendor confirmed it in writing.", "The vendor confirmed it.", "I promise it is true.", "Everyone knows it."], a: "Apparently, the vendor confirmed it in writing.", why: "Apparently 는 들은 정보임을 밝히는 표현입니다." },
        { q: "의문문을 전달하는 바른 문장은?", opts: ["He asked where it was.", "He asked where was it.", "He asked where is it.", "He asked it where was."], a: "He asked where it was.", why: "전달된 의문문은 평서문 어순으로 쓰고 시제를 맞춥니다." },
        { q: "A: Is the deadline still Monday? — B: ____", opts: ["Apparently it moved to Friday. I haven't seen the email myself.", "Yes maybe no.", "I don't know anything ever.", "The deadline is Monday for sure."], a: "Apparently it moved to Friday. I haven't seen the email myself.", why: "들은 정보와 확인한 범위를 나눠 말하면 오해가 줄어듭니다." },
        { q: "She said \"I will call you tomorrow.\" 를 전달한 문장으로 알맞은 것은?", opts: ["She said she will call me tomorrow.", "She said she would call me the next day.", "She says she calls me tomorrow.", "She said I will call you tomorrow."], a: "She said she would call me the next day.", why: "시제(will → would), 대명사(you → me), 시간(tomorrow → the next day)을 모두 바꿉니다." },
        { q: "확인되지 않은 소문을 옮길 때 가장 안전한 표현은?", opts: ["It is a fact that ~", "Apparently, ~", "Everyone knows ~", "I am sure ~"], a: "Apparently, ~", why: "Apparently 는 전해 들었음을 밝혀 내가 확인한 사실이 아님을 알립니다." },
        { q: "상대의 말을 잘못 들었을 때 알맞은 표현은?", opts: ["You said it wrong.", "Just to make sure I understood, you meant Monday, right?", "I don't listen.", "Say it again correctly."], a: "Just to make sure I understood, you meant Monday, right?", why: "확인하는 형태로 물으면 상대를 탓하지 않고 바로잡을 수 있습니다." }
      ]
    },
    {
      no: 12,
      title: "감정 표현하고 공감하기",
      intro: "감정을 말할 때는 강도를 조절하고, 상대의 감정에는 해결보다 공감이 먼저입니다. 좋은 소식과 나쁜 소식의 반응도 나눠 익힙니다.",
      summary: "감정은 강도와 함께 말해야 정확히 전달됩니다. 상대의 감정에는 해결보다 공감이 먼저입니다.",
      points: [
        {
          h: "감정의 강도 표현하기",
          body: "기쁨과 실망은 부사와 형용사를 함께 써서 강도를 조절합니다. 강도를 말하지 않으면 반응이 밋밋하게 들립니다.",
          table: {
            head: ["감정", "약함", "강함"],
            rows: [
              ["기쁨", "I'm pleased.", "I'm absolutely thrilled."],
              ["실망", "That's a bit disappointing.", "I'm really disappointed."],
              ["놀람", "That's surprising.", "I'm stunned."],
              ["걱정", "I'm a little concerned.", "I'm quite worried about this."],
              ["안도", "That's a relief.", "What a relief that is."]
            ]
          },
          note: "quite 는 영국식에서 강조, 미국식에서 완곡하게 들리는 차이가 있습니다. 확실하게 강조하려면 really 나 absolutely 를 씁니다."
        },
        {
          h: "공감 표현 고르기 — 상황에 맞게",
          body: "공감은 상황에 따라 표현이 다릅니다. 좋은 소식과 나쁜 소식에 같은 표현을 쓰면 어색해집니다.",
          table: {
            head: ["상대 상황", "공감 표현"],
            rows: [
              ["좋은 소식", "That's wonderful news. Congratulations!"],
              ["힘든 일", "I'm sorry to hear that."],
              ["고생", "That must have been tough."],
              ["안도", "I'm glad it worked out."],
              ["실망", "I can imagine how you feel."]
            ]
          },
          note: "I'm sorry to hear that. 은 슬픈 소식에 쓰는 공감입니다. 상대가 감사 인사를 할 때는 쓰지 않습니다."
        },
        {
          h: "표현 확장 — 감정의 강도 조절",
          body: "감정 표현은 강도 부사와 전치사로 완성됩니다. 무엇에 대한 감정인지 밝혀야 오해가 없습니다.",
          table: {
            head: ["강도", "표현", "상황"],
            rows: [
              ["아주 기쁨", "I'm thrilled to hear that.", "좋은 소식"],
              ["기쁨", "I'm pleased with the result.", "업무 결과"],
              ["걱정", "I'm a bit worried about the delay.", "불안 요소"],
              ["실망", "I'm disappointed with the outcome.", "기대 이하"],
              ["지침", "I'm exhausted after this week.", "개인 상황"]
            ]
          },
          note: "감정 뒤에는 about, with, to hear 를 붙여 대상을 밝힙니다."
        },
        {
          h: "실전 대화 — 공감 먼저, 해결은 다음",
          body: "상대가 힘든 상황을 말할 때는 공감을 먼저 보이고 함께 해결할 방법을 묻습니다.",
          examples: [
            { en: "I missed the deadline and I feel terrible about it.", ko: "마감을 놓쳐서 마음이 무겁습니다." },
            { en: "That sounds really stressful. Thanks for telling me.", ko: "많이 힘드셨겠어요. 말씀해 주셔서 고맙습니다." },
            { en: "Let's see what we can fix together.", ko: "우리가 함께 고칠 수 있는 걸 찾아보죠." }
          ]
        },
        {
          h: "좋은 소식과 나쁜 소식의 반응",
          body: "소식의 성격에 따라 반응이 달라집니다. 축하는 축하로, 위로는 위로로 맞춥니다.",
          table: {
            head: ["소식", "반응 표현", "뜻"],
            rows: [
              ["합격·승진", "Congratulations! That's wonderful news.", "축하합니다!"],
              ["좋은 실적", "That's great to hear.", "잘됐네요."],
              ["사고·지연", "I'm sorry to hear that.", "안됐습니다."],
              ["어려운 상황", "That sounds tough.", "힘드시겠어요."],
              ["회복", "I'm glad it worked out.", "잘 해결되어 다행입니다."]
            ]
          },
          note: "좋은 소식에 I'm sorry to hear that. 을 쓰면 축하가 위로로 바뀝니다."
        },
        {
          h: "해결보다 공감이 먼저",
          body: "상대가 힘든 일을 말할 때 곧바로 해결책을 제시하면 공감이 건너뛰어진 것처럼 들립니다. 공감 한 줄 뒤에 제안을 붙입니다.",
          examples: [
            { en: "That must have been tough. Is there anything I can do to help?", ko: "힘드셨겠어요. 제가 도울 일이 있을까요?" },
            { en: "I hear you. Let me know if you want to talk it through.", ko: "무슨 말인지 알겠습니다. 이야기하고 싶으면 알려 주세요." }
          ],
          note: "I hear you. 는 상대 말에 공감한다는 구어 표현입니다. 동의한다는 뜻에 가깝고, 듣고 있다는 뜻이 아닙니다."
        }
      ],
      mistakes: [
        "힘들다는 이야기에 곧바로 You should ~ 로 해결책을 제시하는 실수 — 공감 한 줄을 먼저 넣습니다.",
        "좋은 소식에 I'm sorry to hear that. 을 쓰는 실수 — 좋은 소식에는 Congratulations! 나 That's wonderful. 을 씁니다.",
        "감정을 말할 때 대상을 빼는 실수 — I'm worried about the delay. 처럼 전치사로 대상을 밝힙니다.",
        "감정의 강도를 하나로만 말하는 실수 — a bit worried, really disappointed 처럼 정도를 조절합니다.",
        "공감을 건너뛰고 바로 조언으로 들어가는 실수 — That sounds tough. 로 공감을 먼저 보입니다."
      ],
      practice: [
        { q: "기쁨을 가장 강하게 나타내는 표현은?", opts: ["I'm thrilled to hear that.", "I'm fine.", "I'm okay.", "I'm not bad."], a: "I'm thrilled to hear that.", why: "thrilled 는 매우 기쁘다는 뜻입니다." },
        { q: "걱정의 대상을 밝힌 표현은?", opts: ["I'm a bit worried about the delay.", "I'm worried it.", "I worry delay.", "I'm worry of delay."], a: "I'm a bit worried about the delay.", why: "be worried about + 대상 형태로 씁니다." },
        { q: "축하의 반응으로 알맞은 것은?", opts: ["Congratulations! That's wonderful news.", "I'm sorry to hear that.", "That sounds tough.", "What a shame."], a: "Congratulations! That's wonderful news.", why: "좋은 소식에는 축하 표현을 씁니다." },
        { q: "상대의 어려움에 공감하는 표현은?", opts: ["That sounds tough.", "You should have planned better.", "It is not a problem.", "Why did you do that?"], a: "That sounds tough.", why: "해결책보다 공감을 먼저 보입니다." },
        { q: "A: I missed the deadline. — B: ____", opts: ["That sounds really stressful. Let's see what we can fix together.", "You always miss deadlines.", "It is your fault.", "Anyway, tell me about the next task."], a: "That sounds really stressful. Let's see what we can fix together.", why: "공감 뒤에 함께 해결할 자세를 보이면 대화가 회복으로 향합니다." },
        { q: "동료가 프로젝트가 어려웠다고 말했습니다. 가장 먼저 할 말은?", opts: ["You should plan better.", "That must have been tough.", "It's your fault.", "Let's forget it."], a: "That must have been tough.", why: "해결책보다 공감이 먼저입니다. 그 뒤에 도움을 제안합니다." },
        { q: "승진 소식을 들었을 때 알맞은 표현은?", opts: ["I'm sorry to hear that.", "Congratulations! That's wonderful news.", "That must have been tough.", "I can imagine how you feel."], a: "Congratulations! That's wonderful news.", why: "좋은 소식에는 축하와 기쁨을 표현합니다." },
        { q: "상대 말에 공감한다는 구어 표현은?", opts: ["I hear you.", "I listen you.", "I am hearing.", "I hear of you."], a: "I hear you.", why: "I hear you. 는 상대 말에 공감한다는 뜻의 구어 표현입니다." }
      ]
    }
  ]
});
