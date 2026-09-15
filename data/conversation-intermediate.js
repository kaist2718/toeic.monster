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
        "의견을 말하고 곧바로 다음 주제로 넘어가는 실수 — Would you agree? 같은 확인 질문을 넣어야 대화가 됩니다."
      ],
      practice: [
        { q: "확신이 크지 않을 때 가장 알맞은 표현은?", opts: ["I strongly believe that ~", "I'm not sure, but I think ~", "There is no doubt that ~", "It is obvious that ~"], a: "I'm not sure, but I think ~", why: "확신의 강도에 맞게 I'm not sure, but I think ~ 처럼 약한 표현을 씁니다." },
        { q: "상대와 다른 의견을 말할 때 가장 부드러운 시작은?", opts: ["You're wrong about that.", "That's a fair point, but ~", "No, that's not right.", "I disagree completely."], a: "That's a fair point, but ~", why: "상대의 지적을 먼저 인정한 뒤 다른 의견을 붙이면 훨씬 부드럽습니다." },
        { q: "내 의견을 말한 뒤 동의를 구하는 표현은?", opts: ["Would you agree?", "Are you agree?", "Do you agreement?", "You agree me?"], a: "Would you agree?", why: "동의를 구할 때는 Would you agree? 를 씁니다." }
      ]
    },
    {
      no: 2,
      title: "계획과 일정 조율하기",
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
        "일정을 미루면서 이유를 말하지 않는 실수 — 사과 다음에 한 줄 이유를 붙여야 상대가 이해합니다."
      ],
      practice: [
        { q: "이미 확정된 약속을 말할 때 가장 알맞은 문장은?", opts: ["I will meet the client at ten.", "I'm meeting the client at ten.", "I meet the client at ten.", "I met the client at ten."], a: "I'm meeting the client at ten.", why: "사람이 이미 잡아 둔 확정 일정은 현재진행형으로 말합니다." },
        { q: "마감 기한을 물을 때 알맞은 표현은?", opts: ["When do you need it?", "When do you need it by?", "When is it need?", "When you need?"], a: "When do you need it by?", why: "늦어도 언제까지인지는 by 를 붙여 묻습니다." },
        { q: "일정을 미루자고 제안하는 가장 부드러운 표현은?", opts: ["We're moving the meeting.", "Would it work for you if we pushed it to next week?", "You must change the date.", "The meeting is canceled."], a: "Would it work for you if we pushed it to next week?", why: "상대 사정을 묻는 형태로 제안하면 부담이 적습니다." }
      ]
    },
    {
      no: 3,
      title: "경험 이야기하기",
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
        "Have you ever went there? 처럼 과거분사 자리에 과거형을 쓰는 실수 — Have you ever been there? 가 맞습니다."
      ],
      practice: [
        { q: "특정 연도를 말할 때 알맞은 문장은?", opts: ["I have worked there in 2023.", "I worked there in 2023.", "I have work there in 2023.", "I am working there in 2023."], a: "I worked there in 2023.", why: "과거의 특정 시점을 말할 때는 현재완료가 아니라 과거시제를 씁니다." },
        { q: "2023년부터 계속 일하고 있다고 말할 때 알맞은 표현은?", opts: ["I've worked here for 2023.", "I've worked here since 2023.", "I worked here since 2023.", "I work here from 2023."], a: "I've worked here since 2023.", why: "시작점에는 since, 기간에는 for 를 씁니다. 지금까지 이어지는 일이므로 현재완료입니다." },
        { q: "A: Have you ever been to a trade show abroad? — B: ____", opts: ["Yes, I did.", "Yes, I have. I went to one in Singapore last year.", "Yes, I am.", "Yes, I go."], a: "Yes, I have. I went to one in Singapore last year.", why: "Have you ever ~ 에는 Yes, I have. 로 답하고, 구체적 시점을 말할 때는 과거시제로 바꿉니다." }
      ]
    },
    {
      no: 4,
      title: "문제를 말하고 해결 요청하기",
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
          note: "look into 는 조사하다, 살펴보다는 뜻입니다. check 보다 정중하고, 상대에게 시간을 주는 표현입니다."
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
        "문제만 말하고 원하는 조치를 말하지 않는 실수 — Could we have this resolved by Friday? 처럼 요청과 시점을 함께 말합니다."
      ],
      practice: [
        { q: "상대를 지목하지 않고 문제를 꺼내는 표현은?", opts: ["You made a mistake with the invoice.", "There seems to be an issue with the invoice.", "The invoice is your fault.", "Why is the invoice wrong?"], a: "There seems to be an issue with the invoice.", why: "문제 자체를 주어로 두면 상대가 방어적이 되지 않아 해결이 빨라집니다." },
        { q: "해결 시점을 요청하는 가장 알맞은 표현은?", opts: ["Fix it now.", "Could we have this resolved by Friday?", "You should fix it.", "It must be fixed."], a: "Could we have this resolved by Friday?", why: "조치와 시점을 함께 담은 요청이 가장 실용적입니다." },
        { q: "같은 문제가 반복되어 강도를 올릴 때 알맞은 말은?", opts: ["This is the second time this has happened. We need a permanent fix.", "You are always wrong.", "I am very angry.", "Never do this again."], a: "This is the second time this has happened. We need a permanent fix.", why: "반복 횟수와 요구 사항을 근거로 말하면 강하지만 감정적이지 않습니다." }
      ]
    },
    {
      no: 5,
      title: "조언하고 제안하기",
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
          body: "하나만 제안하면 예스와 노로 끝납니다. 대안을 함께 주면 상대가 고를 수 있어 대화가 이어집니다.",
          examples: [
            { en: "We could either split the order or delay the second half. Which would you prefer?", ko: "주문을 나누거나 후반부를 미룰 수 있습니다. 어느 쪽이 좋으세요?" },
            { en: "One option is to extend the deadline. Another is to add a second team.", ko: "한 가지 방법은 기한을 늘리는 것이고, 다른 방법은 인력을 더 넣는 것입니다." }
          ],
          note: "either A or B 는 둘 중 하나, Which would you prefer? 는 선택을 묻는 표현입니다. 선택지를 주면 상대가 결정하기 쉬워집니다."
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
        "조언을 받고 아무 반응 없이 넘어가는 실수 — That's a good point. 같은 반응을 넣어야 조언자가 다시 도와줍니다."
      ],
      practice: [
        { q: "윗사람에게 가장 부드럽게 조언하는 표현은?", opts: ["You should change it.", "You might want to review the numbers.", "You must fix it.", "Change it now."], a: "You might want to review the numbers.", why: "You might want to ~ 는 지시가 아니라 정보를 주는 형태라 격식 있는 자리에 맞습니다." },
        { q: "상대에게 선택을 맡기는 표현은?", opts: ["You must choose A.", "Which would you prefer?", "Do it this way.", "There is no choice."], a: "Which would you prefer?", why: "선택지를 제시하고 Which would you prefer? 로 물으면 상대가 고를 수 있습니다." },
        { q: "바로 답하지 않고 생각해 보겠다고 할 때 알맞은 표현은?", opts: ["I refuse.", "Let me think it over.", "I don't know anything.", "Never ask me again."], a: "Let me think it over.", why: "think it over 는 충분히 검토해 보겠다는 표현으로 거절보다 부드럽습니다." }
      ]
    },
    {
      no: 6,
      title: "동의하고 반대하기",
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
        "I agree with you up to a point 를 전적 동의로 오해하는 실수 — 이 표현은 일부만 동의한다는 뜻입니다."
      ],
      practice: [
        { q: "전적으로 동의한다는 뜻의 표현은?", opts: ["I couldn't agree more.", "I agree up to a point.", "I'm on the fence.", "I can't agree."], a: "I couldn't agree more.", why: "더 이상 동의할 수 없다는 형태로 최상급 동의를 나타냅니다." },
        { q: "부드럽게 반대하는 표현은?", opts: ["That's wrong.", "I might be missing something, but I don't think that will work.", "No, never.", "You don't understand."], a: "I might be missing something, but I don't think that will work.", why: "내가 놓친 게 있을 수 있다는 여지를 두면 상대의 반박이 줄어듭니다." },
        { q: "논쟁을 잠시 미루고 나중에 다시 보자고 할 때 알맞은 표현은?", opts: ["Let's park it and come back after the numbers.", "Forget about it forever.", "You are wrong so stop.", "I don't want to hear."], a: "Let's park it and come back after the numbers.", why: "park it 은 지금은 접어 두고 다시 보자는 뜻으로, 관계를 유지하며 미루는 표현입니다." }
      ]
    },
    {
      no: 7,
      title: "사과하고 책임지기",
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
        "Because 다음에 시스템 문제를 길게 설명하며 사과를 뒤로 미루는 실수 — 사과가 먼저, 설명이 뒤입니다.",
        "Sorry. 만 반복하고 재발 방지나 책임을 말하지 않는 실수 — 상대는 다음을 어떻게 할지 알고 싶어 합니다."
      ],
      practice: [
        { q: "제대로 된 사과에 반드시 들어가야 할 요소는?", opts: ["변명", "재발 방지 약속", "상대의 잘못 지적", "긴 배경 설명"], a: "재발 방지 약속", why: "사과, 책임, 영향 인정, 재발 방지가 갖춰져야 신뢰가 회복됩니다." },
        { q: "사과와 설명을 함께 할 때 올바른 순서는?", opts: ["설명 → 사과", "사과 → 설명", "설명만", "사과만"], a: "사과 → 설명", why: "설명이 먼저 오면 변명으로 들립니다. 사과가 먼저입니다." },
        { q: "제 책임이라고 말하는 구어 표현은?", opts: ["That's on me.", "That's for me.", "That's to me.", "That's mine me."], a: "That's on me.", why: "That's on me. 는 제 책임이라는 뜻의 자연스러운 표현입니다." }
      ]
    },
    {
      no: 8,
      title: "회의에서 발언하기",
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
        "회의를 결정 없이 끝내는 실수 — Who's going to take the lead on this? 로 담당과 기한을 확인합니다."
      ],
      practice: [
        { q: "회의에서 발언을 시작할 때 가장 알맞은 표현은?", opts: ["Sorry, sorry, may I speak?", "Can I jump in here?", "Excuse me, excuse me.", "I want to talk."], a: "Can I jump in here?", why: "회의에서는 사과를 붙이지 않고 짧은 신호로 발언을 시작하는 것이 자연스럽습니다." },
        { q: "앞사람 말에 덧붙일 때 알맞은 표현은?", opts: ["Just to add to what Mina said ~", "Mina is wrong.", "Ignore Mina.", "Mina already said."], a: "Just to add to what Mina said ~", why: "앞사람의 발언에 덧붙인다는 것을 밝히면 흐름이 자연스럽게 이어집니다." },
        { q: "회의를 마무리하며 담당을 정할 때 알맞은 말은?", opts: ["Who's going to take the lead on this?", "Who is the leader forever?", "Take the lead now.", "Someone will do it."], a: "Who's going to take the lead on this?", why: "담당과 기한을 확인해야 회의가 결정으로 끝납니다." }
      ]
    },
    {
      no: 9,
      title: "협상하고 조건 맞추기",
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
        "협상 중에 I need ~ 처럼 내 필요만 말하는 실수 — If you ~, we could ~ 로 교환 구조를 만듭니다."
      ],
      practice: [
        { q: "협상에서 가장 효과적인 구조는?", opts: ["I need this immediately.", "If you can take the first batch, we could cover the shipping.", "You must lower the price.", "This is our final answer."], a: "If you can take the first batch, we could cover the shipping.", why: "조건을 주고받는 교환 구조가 요구만 하는 것보다 훨씬 효과적입니다." },
        { q: "양보할 때 조건을 붙이는 표현은?", opts: ["We could do that, as long as the volume stays the same.", "We can do anything.", "Yes, whatever you want.", "No conditions."], a: "We could do that, as long as the volume stays the same.", why: "as long as 는 조건을 붙이는 표현으로, 양보의 대가를 분명히 합니다." },
        { q: "즉답을 피하고 시간을 벌 때 알맞은 표현은?", opts: ["I don't know.", "Can I get back to you on that by tomorrow?", "Never.", "Ask someone else."], a: "Can I get back to you on that by tomorrow?", why: "나중에 답하겠다고 하면서 시점을 밝히면 협상 흐름이 유지됩니다." }
      ]
    },
    {
      no: 10,
      title: "추측하고 확신 정도 나타내기",
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
        "모르는 것을 I'm sure 로 단정하는 실수 — I'm not sure yet. 이나 It's too early to tell. 로 솔직하게 말합니다."
      ],
      practice: [
        { q: "그가 기차를 놓친 게 거의 확실할 때 알맞은 표현은?", opts: ["He must have missed the train.", "He must miss the train.", "He can't have missed the train.", "He should miss the train."], a: "He must have missed the train.", why: "과거에 대한 강한 추측은 must have + 과거분사로 씁니다." },
        { q: "추측의 부정을 나타내는 표현은?", opts: ["It mustn't be expensive.", "It can't be that expensive.", "It shouldn't be expensive.", "It won't be expensive."], a: "It can't be that expensive.", why: "추측의 부정은 can't 입니다. mustn't 는 금지를 뜻합니다." },
        { q: "아직 판단하기 이르다고 말할 때 알맞은 표현은?", opts: ["It's too early to tell.", "It's too late to see.", "It's not a time.", "I don't see time."], a: "It's too early to tell.", why: "아직 결과를 알 수 없다는 뜻으로, 과도한 예측을 피하는 표현입니다." }
      ]
    },
    {
      no: 11,
      title: "들은 것을 전하고 확인하기",
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
        "출처 없이 I heard the budget was cut. 이라고 단정하는 실수 — Apparently 나 미확인임을 밝히는 표현을 붙입니다."
      ],
      practice: [
        { q: "She said \"I will call you tomorrow.\" 를 전달한 문장으로 알맞은 것은?", opts: ["She said she will call me tomorrow.", "She said she would call me the next day.", "She says she calls me tomorrow.", "She said I will call you tomorrow."], a: "She said she would call me the next day.", why: "시제(will → would), 대명사(you → me), 시간(tomorrow → the next day)을 모두 바꿉니다." },
        { q: "확인되지 않은 소문을 옮길 때 가장 안전한 표현은?", opts: ["It is a fact that ~", "Apparently, ~", "Everyone knows ~", "I am sure ~"], a: "Apparently, ~", why: "Apparently 는 전해 들었음을 밝혀 내가 확인한 사실이 아님을 알립니다." },
        { q: "상대의 말을 잘못 들었을 때 알맞은 표현은?", opts: ["You said it wrong.", "Just to make sure I understood, you meant Monday, right?", "I don't listen.", "Say it again correctly."], a: "Just to make sure I understood, you meant Monday, right?", why: "확인하는 형태로 물으면 상대를 탓하지 않고 바로잡을 수 있습니다." }
      ]
    },
    {
      no: 12,
      title: "감정 표현하고 공감하기",
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
        "좋은 소식에 I'm sorry to hear that. 을 쓰는 실수 — 좋은 소식에는 Congratulations! 나 That's wonderful. 을 씁니다."
      ],
      practice: [
        { q: "동료가 프로젝트가 어려웠다고 말했습니다. 가장 먼저 할 말은?", opts: ["You should plan better.", "That must have been tough.", "It's your fault.", "Let's forget it."], a: "That must have been tough.", why: "해결책보다 공감이 먼저입니다. 그 뒤에 도움을 제안합니다." },
        { q: "승진 소식을 들었을 때 알맞은 표현은?", opts: ["I'm sorry to hear that.", "Congratulations! That's wonderful news.", "That must have been tough.", "I can imagine how you feel."], a: "Congratulations! That's wonderful news.", why: "좋은 소식에는 축하와 기쁨을 표현합니다." },
        { q: "상대 말에 공감한다는 구어 표현은?", opts: ["I hear you.", "I listen you.", "I am hearing.", "I hear of you."], a: "I hear you.", why: "I hear you. 는 상대 말에 공감한다는 뜻의 구어 표현입니다." }
      ]
    }
  ]
});
