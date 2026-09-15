/* ============================================================================
 * 고급 영어회화 (C1) — 12과
 * tools/build-pages.mjs 와 감사 도구가 window.CONVERSATION_BOOKS 를 읽습니다.
 * 초급이 "상황을 버티는 표현", 중급이 "생각을 조율하는 표현"이라면,
 * 고급은 "말의 온도와 책임을 조절하는 표현"입니다.
 * ========================================================================== */
window.CONVERSATION_BOOKS = window.CONVERSATION_BOOKS || [];

window.CONVERSATION_BOOKS.push({
  id: "conversation-advanced",
  level: "고급",
  cefr: "C1",
  title: "고급 영어회화",
  subtitle: "말의 온도와 책임을 조절하는 12가지 기술",
  desc: "완곡 표현·책임 한계 밝히기·갈등 완화·역제안·격식 전환·유머의 경계까지, 같은 내용을 상황에 맞게 온도와 책임을 조절해 말하는 고급 회화 교재입니다.",
  audience: "영어로 업무가 가능하지만 원어민에게 딱딱하거나 무례하게 들린 경험이 있는 학습자, 국제 회의·협상을 이끄는 직장인",
  goal: "단정해야 할 때와 물러서야 할 때를 구분하고, 상대의 체면을 지키면서 원하는 결과를 얻는 방향으로 말할 수 있다.",
  howto: [
    "같은 뜻의 표현을 강도 순으로 늘어놓고, 내 직장에서 실제로 쓸 자리를 하나씩 정해 둡니다.",
    "표현을 외우기보다 왜 그 표현이 더 안전한지(책임을 어디에 두는지)를 먼저 이해합니다.",
    "녹음해서 들으며 억양이 내려가는지 확인합니다. 고급 표현은 억양이 강하면 오히려 공격적으로 들립니다."
  ],
  chapters: [
    {
      no: 1,
      title: "완곡하게 말하고 책임 한계 두기",
      summary: "영어권 비즈니스에서는 단정 대신 여지를 남기는 표현을 씁니다. 이 완곡 표현이 책임을 어디까지 지는지를 함께 결정합니다.",
      points: [
        {
          h: "단정하지 않는 표현 — tend to / appear to",
          body: "관찰한 사실과 단정을 구분할 때는 tend to, appear to, seem to 를 씁니다. 이 표현들은 예외 가능성을 남겨 두기 때문에 반박당할 위험이 줄어듭니다.",
          table: {
            head: ["단정 표현", "완곡 표현", "바뀌는 것"],
            rows: [
              ["Costs are rising.", "Costs tend to rise in Q4.", "예외 가능성 인정"],
              ["The system is broken.", "The system appears to be failing.", "관찰임을 표시"],
              ["They are against it.", "They seem reluctant.", "감정 단정 회피"],
              ["This will fail.", "This is likely to run into problems.", "예측임을 표시"]
            ]
          },
          note: "tend to 는 경향, appear to 는 겉으로 보이는 인상입니다. 둘 다 틀렸을 때 책임이 줄어드는 표현입니다."
        },
        {
          h: "어디까지 책임질지 밝히기",
          body: "고급 화법의 핵심은 내가 아는 범위와 모르는 범위를 나눠 말하는 것입니다. 이 구분이 없으면 모르는 것까지 보증한 셈이 됩니다.",
          table: {
            head: ["범위", "표현"],
            rows: [
              ["아는 범위", "As far as I know, ~"],
              ["확인한 범위", "Based on what I've seen so far, ~"],
              ["내 판단임을 표시", "That's my reading of it."],
              ["보증하지 않음", "I can't speak for the other team."],
              ["확인 후 답", "Let me verify before I commit to that."]
            ]
          },
          note: "I can't speak for ~ 는 내가 그쪽을 대표하지 않는다는 뜻입니다. 부탁받은 범위를 넘는 약속을 피하는 표현입니다."
        },
        {
          h: "반대할 때 여지를 남기기",
          body: "반대는 하되 상대가 물러설 자리를 남겨 둡니다. 이 방식이 회의에서 표를 잃지 않으면서 이견을 남기는 방법입니다.",
          examples: [
            { en: "I'd push back slightly on the timeline, though I take your point on scope.", ko: "범위에 대해서는 말씀에 동의합니다만, 일정은 조금 다시 봐야 한다고 봅니다." },
            { en: "I'm not persuaded yet, but I'm open to the argument.", ko: "아직 설득되지는 않았지만, 논거는 열어 두겠습니다." }
          ],
          note: "push back on ~ 은 ~에 이의를 제기한다는 뜻입니다. disagree 보다 부드럽고, 협상 여지를 남깁니다."
        }
      ],
      mistakes: [
        "This will fail. 처럼 미래를 단정하는 실수 — is likely to, may well 같은 완곡 표현으로 바꾸면 반박 위험이 줄어듭니다.",
        "As far as I know 를 붙이지 않고 확실한 것처럼 말해 놓고 나중에 정정하는 실수 — 아는 범위를 처음부터 밝힙니다."
      ],
      practice: [
        { q: "관찰한 인상임을 표시하는 가장 적절한 표현은?", opts: ["The system is broken.", "The system appears to be failing.", "The system must be broken.", "The system will break."], a: "The system appears to be failing.", why: "appear to 는 겉으로 보이는 인상임을 표시해 단정을 피합니다." },
        { q: "내가 대표할 수 없는 범위를 밝히는 표현은?", opts: ["I guarantee it.", "I can't speak for the other team.", "I decide everything.", "The other team agrees."], a: "I can't speak for the other team.", why: "상대 조직을 대신해 약속하지 않겠다는 뜻을 분명히 합니다." },
        { q: "이견을 남기면서도 협력적으로 들리는 표현은?", opts: ["You're wrong.", "I'd push back slightly on the timeline, though I take your point on scope.", "I refuse.", "That's nonsense."], a: "I'd push back slightly on the timeline, though I take your point on scope.", why: "동의하는 부분을 먼저 밝히고 이견을 좁혀 말하면 협력적으로 들립니다." }
      ]
    },
    {
      no: 2,
      title: "격식과 비격식 전환하기",
      summary: "같은 내용도 자리에 따라 격식을 바꿔야 합니다. 격식체를 구어 자리에 쓰면 어색하고, 구어체를 격식 자리에 쓰면 가벼워집니다.",
      points: [
        {
          h: "한 뜻, 세 가지 격식",
          body: "격식은 단어 선택과 문장 길이로 결정됩니다. 같은 요청을 세 단계로 준비해 두면 어떤 자리에서도 쓸 수 있습니다.",
          table: {
            head: ["뜻", "격식", "보통", "편함"],
            rows: [
              ["도와주세요", "I would appreciate your assistance.", "Could you help me?", "Can you give me a hand?"],
              ["알려주세요", "Please kindly inform me.", "Could you let me know?", "Let me know, will you?"],
              ["동의합니다", "I concur with that view.", "I agree with you.", "Yeah, that works."],
              ["죄송합니다", "I sincerely apologize.", "I'm sorry about that.", "My bad."]
            ]
          },
          note: "I would appreciate your assistance. 는 이메일 격식체이고, My bad. 는 가까운 동료에게만 씁니다. 자리를 바꿔 쓰면 인상이 크게 달라집니다."
        },
        {
          h: "축약형과 구어체의 경계",
          body: "격식체에서는 축약을 줄이고, 구어체에서는 축약과 구동사를 늘립니다. 이 전환이 자연스러운지가 고급 단계의 기준입니다.",
          table: {
            head: ["격식체", "구어체", "쓰는 자리"],
            rows: [
              ["I am unable to attend.", "I can't make it.", "공문 / 편한 약속"],
              ["We require additional time.", "We need a bit more time.", "계약 / 팀 회의"],
              ["Please be advised that ~", "Just so you know, ~", "공지 / 동료 공유"],
              ["We regret to inform you ~", "Sorry to say, ~", "안내문 / 통화"]
            ]
          },
          note: "Just so you know, ~ 는 미리 알려 둔다는 뜻의 구어 표현입니다. 격식 자리에서는 Please be advised that ~ 이 같은 역할을 합니다."
        },
        {
          h: "자리에 따라 높임과 낮춤 조절하기",
          body: "상대가 고객·투자자인지, 같은 팀 동료인지에 따라 조동사와 부사를 바꿉니다. 이 조절을 'register shift'라고 합니다.",
          examples: [
            { en: "Would you mind if we revisited the schedule?", ko: "일정을 다시 보면 실례가 될까요? (고객에게)" },
            { en: "Shall we move the review to Thursday?", ko: "검토를 목요일로 옮길까요? (같은 팀)" }
          ],
          note: "Shall we ~? 는 제안을 함께 하자는 편한 표현으로, 같은 팀이나 대등한 사이에서 씁니다. 고객에게는 Would you mind if we ~? 가 안전합니다."
        }
      ],
      mistakes: [
        "고객에게 My bad. 나 No worries. 처럼 편한 표현을 쓰는 실수 — I apologize. / That's not a problem at all. 로 바꿉니다.",
        "동료에게 I sincerely apologize for any inconvenience this may cause. 처럼 공문체를 쓰는 실수 — Sorry about that. 정도면 충분하고, 오히려 진심으로 들립니다."
      ],
      practice: [
        { q: "고객에게 정중하게 일정 변경을 요청하는 표현은?", opts: ["Shall we move it?", "Would you mind if we revisited the schedule?", "Let's change it.", "Can we just move it?"], a: "Would you mind if we revisited the schedule?", why: "고객에게는 Would you mind if we ~? 가 가장 안전한 격식 표현입니다." },
        { q: "팀 동료에게 편하게 공유할 때 알맞은 표현은?", opts: ["Please be advised that ~", "Just so you know, ~", "We regret to inform you ~", "It is hereby notified that ~"], a: "Just so you know, ~", why: "같은 팀에는 Just so you know, ~ 가 자연스럽고 격식체는 어색합니다." },
        { q: "계약 문서에 어울리는 표현은?", opts: ["We need a bit more time.", "We require additional time.", "Can we get more time?", "Let's push it."], a: "We require additional time.", why: "격식 문어체에서는 축약을 줄이고 require 같은 동사를 씁니다." }
      ]
    },
    {
      no: 3,
      title: "설득하고 반론을 미리 막기",
      summary: "설득은 주장을 반복하는 것이 아니라 상대의 반론을 먼저 다루는 것입니다. 반론을 예상해 처리하면 주장의 설득력이 크게 올라갑니다.",
      points: [
        {
          h: "예상 반론 먼저 다루기",
          body: "상대가 제기할 반론을 먼저 꺼내 처리하는 방식을 선제 처리라고 합니다. 반론을 피하지 않았다는 인상을 주어 신뢰가 올라갑니다.",
          examples: [
            { en: "You might argue that the cost is too high. That's a fair concern, and here's how I'd address it.", ko: "비용이 너무 높다고 반론하실 수 있습니다. 타당한 우려이고, 이렇게 해결하겠습니다." },
            { en: "Some of you may be thinking this is too soon. I'd agree, which is why we're staging it.", ko: "너무 이르다고 생각하실 수 있습니다. 저도 그렇게 봅니다. 그래서 단계적으로 진행합니다." }
          ],
          note: "You might argue that ~ 은 반론을 예상해 꺼내는 표현입니다. 상대가 실제로 그렇게 말하기 전에 먼저 다루면 논쟁이 줄어듭니다."
        },
        {
          h: "근거의 신뢰도를 밝히기",
          body: "설득에는 근거가 필요하지만 근거의 신뢰도도 함께 말해야 합니다. 강한 근거와 약한 근거를 구분해 제시하면 신뢰를 잃지 않습니다.",
          table: {
            head: ["근거의 종류", "표현", "설득력"],
            rows: [
              ["데이터", "The figures show ~", "매우 높음"],
              ["사례", "We saw this work at another site.", "높음"],
              ["일반 원칙", "In principle, ~", "보통"],
              ["직감", "My instinct is that ~", "낮음, 솔직함"],
              ["제삼자", "The consultants came to the same conclusion.", "높음"]
            ]
          },
          note: "My instinct is that ~ 은 근거가 약하다는 것을 스스로 밝히는 표현입니다. 이를 숨기고 데이터인 것처럼 말하면 신뢰를 잃습니다."
        },
        {
          h: "선택지로 몰아가기",
          body: "상대가 거절하기 어려운 형태는 선택지입니다. 예와 아니오가 아니라 A와 B 중 무엇을 고를지 묻는 구조입니다.",
          examples: [
            { en: "We could either start with one region or run a limited pilot. Which would you be more comfortable with?", ko: "한 지역만 시작하거나 제한적으로 시범 운영할 수 있습니다. 어느 쪽이 더 편하세요?" },
            { en: "Both options keep us on schedule. The difference is risk.", ko: "두 안 모두 일정에는 문제가 없습니다. 차이는 위험입니다." }
          ],
          note: "Which would you be more comfortable with? 는 선택을 요구하면서 부담을 낮추는 표현입니다. Which do you prefer? 보다 부드럽습니다."
        }
      ],
      mistakes: [
        "반론이 나온 뒤에야 대응하는 실수 — 예상 반론을 먼저 꺼내면 훨씬 설득력이 높아집니다.",
        "직감을 데이터인 것처럼 말하는 실수 — My instinct is that ~ 처럼 근거의 성격을 밝혀야 신뢰를 지킵니다."
      ],
      practice: [
        { q: "상대의 반론을 미리 다루는 표현은?", opts: ["You might argue that the cost is too high. That's a fair concern.", "You are wrong about the cost.", "The cost is not important.", "Don't ask about the cost."], a: "You might argue that the cost is too high. That's a fair concern.", why: "반론을 먼저 꺼내 처리하면 피하지 않았다는 인상을 주어 신뢰가 올라갑니다." },
        { q: "근거가 약할 때 솔직하게 밝히는 표현은?", opts: ["The data proves ~", "My instinct is that ~", "It is certain that ~", "Everyone knows ~"], a: "My instinct is that ~", why: "직감임을 밝히면 근거의 신뢰도를 정직하게 전달할 수 있습니다." },
        { q: "거절하기 어려운 선택 구조를 만드는 표현은?", opts: ["Do you agree or not?", "Which would you be more comfortable with?", "Say yes or no.", "You must choose now."], a: "Which would you be more comfortable with?", why: "예와 아니오가 아니라 선택지 사이에서 고르게 하면 승낙 가능성이 올라갑니다." }
      ]
    },
    {
      no: 4,
      title: "정보의 한계와 불확실성 다루기",
      summary: "고급 화법에서는 모르는 것을 모른다고 정확히 말합니다. 추측을 사실처럼 말하지 않는 것이 신뢰의 기준입니다.",
      points: [
        {
          h: "확실성 등급 나누기",
          body: "정보를 전할 때는 어디까지 확인했는지를 등급으로 나눠 말합니다. 이 구분이 없으면 잘못된 정보의 책임이 나에게 옵니다.",
          table: {
            head: ["확실성", "표현", "뜻"],
            rows: [
              ["확인됨", "I've confirmed that ~", "내가 직접 확인"],
              ["보고됨", "I'm told that ~", "전해 들음"],
              ["추정", "My best guess is ~", "근거 있는 추정"],
              ["미확인", "I have no way of knowing yet.", "알 방법이 없음"],
              ["보류", "It's still up in the air.", "아직 미정"]
            ]
          },
          note: "I'm told that ~ 은 내가 확인한 것이 아니라 전해 들었다는 뜻입니다. 출처가 약할 때 반드시 붙입니다."
        },
        {
          h: "단정과 추정을 잇는 연결 표현",
          body: "앞에서 확인된 정보를 말하고, 뒤에서 추정으로 넘어갈 때는 연결 표현으로 경계를 표시합니다. 이 표시가 없으면 추정도 사실로 읽힙니다.",
          table: {
            head: ["연결 표현", "기능"],
            rows: [
              ["That said, ~", "앞 내용을 인정하고 반대 정보 제시"],
              ["Which suggests that ~", "확인된 사실에서 추정으로"],
              ["To put it another way, ~", "쉽게 다시 설명"],
              ["In other words, ~", "같은 내용 재진술"],
              ["If anything, ~", "오히려 반대 방향임을 표시"]
            ]
          },
          note: "That said, ~ 는 앞의 내용을 부정하지 않고 다른 면을 더하는 표현입니다. However 보다 말하기 편하고 부드럽습니다."
        },
        {
          h: "모른다고 말하는 기술",
          body: "모른다고 말할 때는 언제 알 수 있는지, 어떻게 알 수 있는지를 함께 제시합니다. 이렇게 하면 무능해 보이지 않습니다.",
          examples: [
            { en: "I don't have that number yet. I can get it by tomorrow morning.", ko: "그 수치는 아직 없습니다. 내일 아침까지는 확인할 수 있습니다." },
            { en: "That's outside my area. Mina would know better than I would.", ko: "그건 제 분야가 아닙니다. 미나가 저보다 잘 알 것입니다." }
          ],
          note: "would know better than I would 는 저보다 잘 알 것이다는 뜻입니다. 모르는 것을 밝히면서 담당자를 연결해 주는 표현입니다."
        }
      ],
      mistakes: [
        "전해 들은 내용을 I've confirmed that ~ 이라고 말하는 실수 — I'm told that ~ 으로 출처를 밝힙니다.",
        "모른다고만 하고 시점이나 대안을 말하지 않는 실수 — 언제 알 수 있는지, 누구에게 물어야 하는지를 함께 말합니다."
      ],
      practice: [
        { q: "확인하지 않고 전해 들은 정보임을 밝히는 표현은?", opts: ["I've confirmed that ~", "I'm told that ~", "I proved that ~", "It is a fact that ~"], a: "I'm told that ~", why: "출처가 내가 직접 확인한 것이 아님을 밝혀 책임 범위를 정합니다." },
        { q: "앞 내용을 인정하고 다른 면을 더하는 연결 표현은?", opts: ["That said, ~", "Therefore, ~", "In short, ~", "For example, ~"], a: "That said, ~", why: "That said, ~ 는 앞 내용을 부정하지 않고 다른 면을 더하는 표현입니다." },
        { q: "모르는 분야를 담당자에게 연결하는 표현은?", opts: ["I don't know anything.", "That's outside my area. Mina would know better than I would.", "Ask someone else.", "Not my job."], a: "That's outside my area. Mina would know better than I would.", why: "범위를 밝히고 담당자를 연결하면 신뢰를 잃지 않습니다." }
      ]
    },
    {
      no: 5,
      title: "갈등 완화하고 중재하기",
      summary: "갈등이 붙었을 때는 감정의 온도를 낮추고 쟁점을 분리합니다. 중재자는 편을 들지 않으면서 사실로 돌아가게 합니다.",
      points: [
        {
          h: "감정의 온도 낮추기",
          body: "목소리와 표현을 함께 낮춥니다. 상대가 화가 났을 때 맞받아치면 확전되고, 낮은 언어로 받아 주면 진정됩니다.",
          table: {
            head: ["확전되는 말", "완화하는 말"],
            rows: [
              ["That's not what I said.", "Let me clarify what I meant."],
              ["You're not listening.", "I want to make sure I'm being clear."],
              ["This is your fault.", "Let's look at how this happened."],
              ["Calm down.", "I understand why this is frustrating."]
            ]
          },
          note: "Calm down. 은 상대를 어린아이처럼 대하는 말로 들립니다. I understand why this is frustrating. 이 훨씬 효과적입니다."
        },
        {
          h: "쟁점 분리하기",
          body: "갈등은 대개 사실, 해석, 감정이 섞여 있습니다. 셋을 분리하면 무엇을 두고 다투는지가 분명해집니다.",
          examples: [
            { en: "Let's separate two things: what happened, and what we should do about it.", ko: "두 가지를 나눠 봅시다. 무슨 일이 있었는지, 그리고 앞으로 어떻게 할지입니다." },
            { en: "I think we actually agree on the facts. We differ on the priority.", ko: "사실 관계는 동의하는 것 같습니다. 우선순위에서 다른 것 같습니다." }
          ],
          note: "We actually agree on ~ 은 의외로 동의하는 부분이 있다는 것을 짚어 주는 표현입니다. 갈등의 범위를 줄여 줍니다."
        },
        {
          h: "중재하고 합의로 이끌기",
          body: "중재자는 양쪽 말을 요약하고, 공통 목표로 시선을 돌립니다. 판정을 내리기보다 다음 행동을 정하는 것이 목적입니다.",
          table: {
            head: ["중재 단계", "표현"],
            rows: [
              ["양쪽 요약", "So, from your side ~ and from yours ~"],
              ["공통 목표", "We both want the launch to go well."],
              ["쟁점 좁히기", "The only open question is the timeline."],
              ["다음 행동", "Shall we agree to try one approach for two weeks?"],
              ["보류", "Let's take this offline and come back with numbers."]
            ]
          },
          note: "take this offline 은 여기서 결론 내지 말고 따로 이야기하자는 뜻입니다. 회의에서 쟁점을 줄이는 실용적인 표현입니다."
        }
      ],
      mistakes: [
        "화난 상대에게 Calm down. 이라고 하는 실수 — I understand why this is frustrating. 으로 감정을 인정해 줍니다.",
        "중재자가 어느 한쪽 편을 들어 판정하는 실수 — 양쪽을 요약하고 공통 목표로 시선을 돌립니다."
      ],
      practice: [
        { q: "화가 난 상대의 감정을 인정하는 가장 효과적인 표현은?", opts: ["Calm down.", "I understand why this is frustrating.", "You are overreacting.", "This is not a big deal."], a: "I understand why this is frustrating.", why: "감정을 인정해 주는 표현이 진정에 훨씬 효과적입니다. Calm down. 은 확전될 수 있습니다." },
        { q: "의외로 동의하는 부분이 있음을 짚어 갈등을 줄이는 표현은?", opts: ["We disagree on everything.", "I think we actually agree on the facts.", "You are completely wrong.", "There is no solution."], a: "I think we actually agree on the facts.", why: "동의하는 범위를 밝히면 다투는 범위가 좁아집니다." },
        { q: "회의에서 쟁점을 따로 미룰 때 알맞은 표현은?", opts: ["Let's take this offline.", "Forget it.", "Stop talking about it.", "It is canceled."], a: "Let's take this offline.", why: "여기서 결론 내지 않고 따로 다루자는 뜻으로, 회의 흐름을 지키며 쟁점을 미룹니다." }
      ]
    },
    {
      no: 6,
      title: "역제안하고 판을 바꾸기",
      summary: "고급 협상에서는 주어진 선택지 중에 고르지 않고 선택지 자체를 바꿉니다. 이때 상대의 목표를 건드리지 않는 것이 핵심입니다.",
      points: [
        {
          h: "역제안의 구조",
          body: "역제안은 상대의 목표를 인정하고, 수단을 바꾸자고 제안하는 형태입니다. 목표 자체를 부정하면 협상이 결렬됩니다.",
          examples: [
            { en: "I understand the target is September. What if we hit it in two phases instead?", ko: "9월이 목표라는 것 이해했습니다. 대신 두 단계로 나눠 달성하면 어떨까요?" },
            { en: "We both want the same outcome. The question is the route.", ko: "우리 목표는 같습니다. 문제는 가는 길입니다." }
          ],
          note: "What if we ~? 는 선택지 자체를 바꾸는 가장 널리 쓰이는 표현입니다. 상대가 거절해도 관계가 상하지 않습니다."
        },
        {
          h: "전제를 다시 묻기",
          body: "협상이 막혔을 때는 조건 자체가 정말 고정인지 확인합니다. 대부분의 제약은 생각보다 유연합니다.",
          table: {
            head: ["확인할 것", "표현"],
            rows: [
              ["고정 조건인지", "Is the date fixed, or is there room to move?"],
              ["왜 그 조건인지", "What's driving the deadline?"],
              ["우선순위", "Which matters more, the price or the timing?"],
              ["범위 조정", "Could we do a smaller version first?"],
              ["되돌리기", "If it doesn't work, can we reverse it?"]
            ]
          },
          note: "What's driving the deadline? 은 그 기한을 정하게 만든 것이 무엇인지 묻는 표현입니다. 상대의 진짜 제약을 드러냅니다."
        },
        {
          h: "작게 시작해 크게 가기",
          body: "결정이 어려운 사안은 부담을 낮춘 제안으로 시작합니다. 되돌릴 수 있다는 조건을 붙이면 승낙 가능성이 크게 올라갑니다.",
          examples: [
            { en: "Let's run it for one quarter. If it doesn't work, we stop — no penalty.", ko: "한 분기만 해 봅시다. 안 되면 중단하고, 위약금은 없습니다." },
            { en: "We can start with a trial, then decide on the full roll-out.", ko: "시범으로 시작하고, 전체 적용은 그 뒤에 정할 수 있습니다." }
          ],
          note: "no penalty 는 위약금이나 불이익이 없다는 뜻입니다. 되돌릴 수 있다는 조건이 의사결정 부담을 낮춥니다."
        }
      ],
      mistakes: [
        "상대의 목표 자체를 부정하며 역제안하는 실수 — 목표는 인정하고 수단을 바꾸자고 제안합니다.",
        "고정 조건이라고 생각하고 확인하지 않는 실수 — Is the date fixed, or is there room to move? 로 먼저 확인합니다."
      ],
      practice: [
        { q: "선택지 자체를 바꾸는 역제안 표현은?", opts: ["Choose A or B.", "What if we hit it in two phases instead?", "There is no other way.", "You must decide."], a: "What if we hit it in two phases instead?", why: "What if we ~? 는 상대의 목표를 인정하면서 수단을 바꾸자고 제안하는 표현입니다." },
        { q: "상대의 진짜 제약을 드러내는 질문은?", opts: ["Why not?", "What's driving the deadline?", "Who decided this?", "Is that final?"], a: "What's driving the deadline?", why: "그 조건을 만든 원인을 물으면 협상할 여지가 있는지 드러납니다." },
        { q: "상대의 결정 부담을 낮추는 표현은?", opts: ["Decide now.", "We can start with a trial, then decide on the full roll-out.", "This is all or nothing.", "There is no going back."], a: "We can start with a trial, then decide on the full roll-out.", why: "되돌릴 수 있고 부담이 작은 제안이 승낙 가능성을 높입니다." }
      ]
    },
    {
      no: 7,
      title: "미묘한 뉘앙스 구분하기",
      summary: "고급 단계에서는 뜻이 비슷한 표현의 어감 차이를 구분합니다. 같은 뜻이라도 상대가 느끼는 인상이 다릅니다.",
      points: [
        {
          h: "비슷하지만 다른 형용사",
          body: "형용사는 뜻보다 강도와 평가가 다릅니다. 이 차이를 모르면 의도와 다르게 전달됩니다.",
          table: {
            head: ["표현", "실제 어감"],
            rows: [
              ["cheap", "싸구려라는 부정적 평가"],
              ["inexpensive", "가격이 낮다는 중립적 사실"],
              ["confident", "자신감 있는 긍정"],
              ["arrogant", "거만한 부정"],
              ["childish", "유치한 부정"],
              ["childlike", "천진한 긍정"],
              ["curious", "호기심 많은 중립·긍정"],
              ["nosy", "참견하는 부정"]
            ]
          },
          note: "가격을 말할 때 cheap 은 품질을 낮춰 말하는 느낌을 줍니다. 물건을 평가할 때는 affordable, good value 가 안전합니다."
        },
        {
          h: "부탁과 지시의 어감 차이",
          body: "부탁은 조동사와 문장 형태로 정중함이 결정됩니다. 같은 부탁도 형태를 바꾸면 지시로 들립니다.",
          table: {
            head: ["표현", "어감"],
            rows: [
              ["Send me the file.", "지시"],
              ["Can you send me the file?", "부탁, 가벼움"],
              ["Could you send me the file?", "부탁, 보통"],
              ["Would you mind sending me the file?", "부탁, 정중"],
              ["I was wondering if you could send me the file.", "부탁, 격식"]
            ]
          },
          note: "메신저에서 Send me the file. 은 상사가 부하에게 쓰면 자연스럽지만, 동료에게는 지시로 들립니다. Could you 로 시작하는 습관이 안전합니다."
        },
        {
          h: "칭찬과 비판의 온도",
          body: "칭찬도 비판도 정도를 조절할 수 있습니다. 같은 내용을 어떤 온도로 말할지 고르는 것이 고급 화법입니다.",
          table: {
            head: ["온도", "칭찬", "비판"],
            rows: [
              ["약함", "That's not bad.", "There's room to improve."],
              ["보통", "Good work.", "That needs another look."],
              ["강함", "That was outstanding.", "That doesn't work for me."],
              ["정중한 비판", "—", "I'd suggest a different approach."],
              ["표현 주의", "—", "That's wrong. (사람에게 쓰면 공격)"]
            ]
          },
          note: "There's room to improve. 는 아쉽다는 뜻을 부드럽게 전하는 표현입니다. That's wrong. 은 사람에게 쓰면 공격적으로 들립니다."
        }
      ],
      mistakes: [
        "물건이 저렴하다는 뜻으로 cheap 을 그대로 쓰는 실수 — affordable, good value 가 평가를 낮추지 않습니다.",
        "동료에게 Send me the file. 처럼 명령형을 쓰는 실수 — Could you send me the file? 로 바꿉니다."
      ],
      practice: [
        { q: "품질을 낮춰 말하지 않고 가격이 낮다는 뜻을 전하는 표현은?", opts: ["cheap", "affordable", "childish", "nosy"], a: "affordable", why: "cheap 은 싸구려라는 부정적 평가가 담깁니다. affordable 은 중립적입니다." },
        { q: "동료에게 가장 안전하게 파일을 요청하는 표현은?", opts: ["Send me the file.", "You must send me the file.", "Could you send me the file?", "Send the file now."], a: "Could you send me the file?", why: "명령형은 동료에게 지시로 들립니다. Could you 로 시작하면 부탁이 됩니다." },
        { q: "부드럽게 비판하는 표현은?", opts: ["That's wrong.", "There's room to improve.", "You failed.", "This is useless."], a: "There's room to improve.", why: "아쉬운 점을 부드럽게 전하는 표현으로, 사람을 공격하지 않습니다." }
      ]
    },
    {
      no: 8,
      title: "관용 표현을 업무 대화에 쓰기",
      summary: "관용 표현은 뜻을 알아도 쓰는 자리를 모르면 어색해집니다. 격식과 상황을 함께 익혀야 실제로 쓸 수 있습니다.",
      points: [
        {
          h: "회의에서 자주 쓰는 관용 표현",
          body: "회의에는 거의 정형화된 관용 표현이 있습니다. 이 표현들은 격식 있는 자리에서도 통합니다.",
          table: {
            head: ["표현", "뜻", "쓰는 자리"],
            rows: [
              ["Let's touch base next week.", "다음 주에 상황을 공유하자", "동료와 짧은 확인"],
              ["That's a lot on our plate.", "우리가 감당할 일이 많다", "일정 조율"],
              ["Let's get the ball rolling.", "시작하자", "프로젝트 착수"],
              ["We're on the same page.", "서로 같은 이해다", "합의 확인"],
              ["Let's circle back to that.", "그건 나중에 다시 보자", "쟁점 보류"],
              ["Please keep me in the loop.", "계속 공유해 주세요", "정보 요청"]
            ]
          },
          note: "keep me in the loop 은 계속 알려 달라는 뜻입니다. 격식 있는 자리에서도 널리 쓰입니다."
        },
        {
          h: "쓰면 안 되는 자리 구분하기",
          body: "관용 표현 중에는 편한 자리에서만 쓰는 것이 있습니다. 격식 자리에 쓰면 가벼워 보이거나 뜻이 통하지 않습니다.",
          table: {
            head: ["표현", "격식 자리 대체"],
            rows: [
              ["no-brainer", "a clear choice"],
              ["ballpark figure", "a rough estimate (대체로 통함)"],
              ["blue-sky thinking", "exploratory ideas"],
              ["throw someone under the bus", "shift the blame to someone"],
              ["cut corners", "take shortcuts (부정적)"]
            ]
          },
          note: "throw someone under the bus 는 남에게 책임을 떠넘긴다는 뜻입니다. 뜻을 모르고 쓰면 상황이 매우 나빠질 수 있으므로 주의합니다."
        },
        {
          h: "관용 표현을 안전하게 쓰는 법",
          body: "확신이 없으면 관용 표현을 쓰지 않는 편이 낫습니다. 뜻을 잘 알아도 어감을 잘못 잡으면 오해가 생깁니다.",
          examples: [
            { en: "Let's touch base early next week to see where we stand.", ko: "다음 주 초에 상황을 확인하자고 짧게 잡시다." },
            { en: "Correct me if I'm using this wrong, but I think we're on the same page.", ko: "제가 잘못 쓰고 있다면 알려 주세요. 우리가 같은 이해라고 생각합니다." }
          ],
          note: "Correct me if I'm using this wrong. 처럼 표현 사용에 대한 확인을 붙이면, 관용 표현을 쓰면서도 안전합니다."
        }
      ],
      mistakes: [
        "뜻을 정확히 모르고 관용 표현을 쓰는 실수 — 특히 throw someone under the bus 처럼 부정적인 표현은 상황을 악화시킵니다.",
        "격식 있는 자리에 no-brainer 같은 구어 관용 표현을 쓰는 실수 — a clear choice 로 바꿉니다."
      ],
      practice: [
        { q: "계속 상황을 공유해 달라고 요청하는 표현은?", opts: ["Please keep me in the loop.", "Please throw me the loop.", "Please loop off.", "Please cut the loop."], a: "Please keep me in the loop.", why: "keep someone in the loop 은 계속 정보를 공유한다는 뜻의 관용 표현입니다." },
        { q: "남에게 책임을 떠넘긴다는 뜻의 표현은?", opts: ["touch base", "throw someone under the bus", "get the ball rolling", "circle back"], a: "throw someone under the bus", why: "책임을 떠넘긴다는 부정적 뜻이므로 상황을 봐서 신중하게 씁니다." },
        { q: "서로 같은 이해를 하고 있다는 표현은?", opts: ["We're on the same page.", "We're on the same paper.", "We read the same book.", "We're the same person."], a: "We're on the same page.", why: "합의를 확인할 때 쓰는 관용 표현입니다." }
      ]
    },
    {
      no: 9,
      title: "유머와 아이러니의 경계",
      summary: "영어권 대화에서 유머는 관계를 만드는 도구입니다. 다만 자기 비하와 남 비하는 위험이 전혀 다릅니다.",
      points: [
        {
          h: "안전한 유머의 종류",
          body: "자기 자신을 소재로 한 유머와 상황을 함께 웃는 유머는 안전합니다. 사람을 지목하는 유머는 자리와 관계를 봐야 합니다.",
          table: {
            head: ["유머 종류", "안전도", "예"],
            rows: [
              ["자기 비하", "높음", "I spent an hour on this slide. Worth it?"],
              ["상황 유머", "높음", "The printer has chosen violence today."],
              ["공통 고충", "보통", "Another meeting that could have been an email."],
              ["상대 놀리기", "낮음", "친한 사이가 아니면 피합니다"],
              ["외모·출신", "매우 낮음", "업무 자리에서는 금지"]
            ]
          },
          note: "Another meeting that could have been an email. 은 회의가 이메일로 충분했다는 뜻의 직장 유머입니다. 한국어판도 있을 만큼 국제적으로 통합니다."
        },
        {
          h: "아이러니와 진짜 뜻 구분하기",
          body: "아이러니는 말과 뜻이 반대입니다. 억양과 상황이 단서가 되지만 서면에서는 오해가 생기므로 주의합니다.",
          examples: [
            { en: "Great, the server is down again. Just what we needed.", ko: "좋네요, 서버가 또 죽었습니다. 딱 필요한 일이었죠." },
            { en: "Well, that went smoothly.", ko: "네, 참 매끄럽게 됐네요. (문제가 생긴 뒤에 쓴 아이러니)" }
          ],
          note: "아이러니는 억양이 단서입니다. 이메일이나 메신저에서 이 표현을 쓰면 진심으로 읽힐 수 있으므로 이모지나 설명을 붙이는 편이 안전합니다."
        },
        {
          h: "유머가 통하지 않았을 때 수습하기",
          body: "농담이 어색하게 끝났을 때는 빠르게 정리하고 본론으로 돌아갑니다. 설명을 덧붙이면 더 어색해집니다.",
          table: {
            head: ["상황", "표현"],
            rows: [
              ["분위기 정리", "Anyway, back to the point."],
              ["과했다고 인정", "Sorry, that was a bit much."],
              ["오해 풀기", "I'm joking, of course."],
              ["넘기기", "Moving on."]
            ]
          },
          note: "Moving on. 은 넘어가자고 짧게 정리하는 표현입니다. 실수를 길게 설명하지 않는 것이 세련된 마무리입니다."
        }
      ],
      mistakes: [
        "업무 자리에서 상대의 외모나 출신을 소재로 하는 실수 — 관계와 무관하게 위험합니다.",
        "이메일로 아이러니를 그대로 쓰는 실수 — 진심으로 읽혀 오해를 만듭니다. 구어나 이모지가 있는 자리에서만 씁니다."
      ],
      practice: [
        { q: "업무 자리에서 가장 안전한 유머는?", opts: ["상대의 외모를 소재로", "자기 자신이나 상황을 소재로", "상대의 출신을 소재로", "상사의 실수를 소재로"], a: "자기 자신이나 상황을 소재로", why: "자기 비하와 상황 유머는 안전하지만 사람을 지목하면 위험이 큽니다." },
        { q: "농담이 어색하게 끝났을 때 가장 좋은 마무리는?", opts: ["길게 설명한다", "Moving on.", "계속 반복한다", "상대에게 이해를 요구한다"], a: "Moving on.", why: "짧게 넘기는 것이 가장 세련된 마무리입니다. 설명은 더 어색하게 만듭니다." },
        { q: "서면에서 아이러니를 쓸 때의 문제점은?", opts: ["문법이 틀린다", "진심으로 읽혀 오해를 만든다", "길이가 길어진다", "번역이 안 된다"], a: "진심으로 읽혀 오해를 만든다", why: "아이러니는 억양이 단서라 서면에서는 오해가 생기기 쉽습니다." }
      ]
    },
    {
      no: 10,
      title: "담화 표지로 흐름 만들기",
      summary: "담화 표지는 문장을 잇는 것이 아니라 생각의 방향을 알리는 신호입니다. 이것이 자연스러워야 원어민처럼 들립니다.",
      points: [
        {
          h: "생각을 정리하는 신호",
          body: "말을 시작하기 전에 생각을 정리하는 시간을 벌고, 어떤 이야기가 올지 미리 알립니다.",
          table: {
            head: ["표지", "기능", "예"],
            rows: [
              ["Well, ~", "바로 답하기 어려울 때 시간 벌기", "Well, it depends."],
              ["See, ~", "이유를 설명하겠다는 신호", "See, the problem is the timing."],
              ["Look, ~", "본론으로 들어가겠다는 신호", "Look, we need to decide today."],
              ["I mean, ~", "앞말을 다시 풀어 말할 때", "I mean, it's not a priority."],
              ["Anyway, ~", "화제를 전환할 때", "Anyway, let's move on."]
            ]
          },
          note: "Well, ~ 은 무례하지 않게 시간을 버는 방법입니다. 침묵 대신 Well 을 넣으면 생각할 여유가 생깁니다."
        },
        {
          h: "내용을 구조화하는 신호",
          body: "설명할 때는 개수와 순서를 먼저 알립니다. 듣는 사람이 지도를 그릴 수 있어 이해가 빨라집니다.",
          table: {
            head: ["표지", "기능"],
            rows: [
              ["There are two things ~", "개수 먼저 알리기"],
              ["First of all ~", "첫 번째 항목 시작"],
              ["On top of that ~", "추가 근거 더하기"],
              ["Which brings me to ~", "다음 항목으로 자연스럽게 연결"],
              ["To sum up ~", "정리"],
              ["The bottom line is ~", "결론 강조"]
            ]
          },
          note: "The bottom line is ~ 은 핵심 결론을 강조하는 표현입니다. 발표나 협상 마무리에서 가장 자주 쓰입니다."
        },
        {
          h: "억양과 함께 써야 하는 이유",
          body: "담화 표지는 억양이 함께 가야 기능을 합니다. 표지를 올려 읽으면 불확실하게, 내려 읽으면 단호하게 들립니다.",
          examples: [
            { en: "Well↘, I'd say we're about halfway there.", ko: "음, 절반쯤 왔다고 봅니다." },
            { en: "The bottom line↘ is we need more time.", ko: "핵심은 시간이 더 필요하다는 것입니다." }
          ],
          note: "Well 을 올려 읽으면 대답을 피하는 것처럼 들립니다. 내려 읽으면 생각을 정리해 말하는 느낌이 됩니다."
        }
      ],
      mistakes: [
        "Well, Look, You know 를 한 문장에 몰아 쓰는 실수 — 담화 표지는 한 번에 하나만 씁니다.",
        "담화 표지 없이 결론부터 쏟아내는 실수 — The bottom line is ~ 같은 신호를 넣으면 핵심이 분명해집니다."
      ],
      practice: [
        { q: "바로 답하기 어려울 때 시간을 버는 표현은?", opts: ["Well, it depends.", "Look, decide now.", "Anyway, whatever.", "I mean, no."], a: "Well, it depends.", why: "Well 은 무례하지 않게 생각할 시간을 버는 담화 표지입니다." },
        { q: "핵심 결론을 강조하는 표현은?", opts: ["By the way, ~", "The bottom line is ~", "In other words, ~", "For instance, ~"], a: "The bottom line is ~", why: "핵심 결론을 강조하며 마무리할 때 쓰는 표현입니다." },
        { q: "설명을 시작하며 개수를 먼저 알리는 표현은?", opts: ["There are two things I want to cover.", "I will explain everything.", "Listen carefully.", "This is complicated."], a: "There are two things I want to cover.", why: "개수를 먼저 알리면 듣는 사람이 구조를 잡고 따라올 수 있습니다." }
      ]
    },
    {
      no: 11,
      title: "발표하고 설명 이끌기",
      summary: "발표는 청중이 지금 어디에 있는지 알려 주는 일입니다. 길을 안내하는 표현이 내용보다 중요할 때가 많습니다.",
      points: [
        {
          h: "길 안내 표현 — signposting",
          body: "발표에서는 지금 무엇을 하는지 알려 주는 표현을 반복해서 씁니다. 이 표현이 없으면 청중은 흐름을 놓칩니다.",
          table: {
            head: ["단계", "표현"],
            rows: [
              ["시작", "Today I'll cover three points."],
              ["화제 전환", "Let's turn to the second point."],
              ["예시", "Take last quarter, for example."],
              ["도표", "As you can see in this chart, ~"],
              ["요약", "To bring it all together, ~"],
              ["질문 유도", "I'll pause here for questions."]
            ]
          },
          note: "As you can see in this chart, ~ 는 도표를 가리키며 설명을 시작하는 표현입니다. 긴 설명보다 이 한 줄로 시선이 모입니다."
        },
        {
          h: "질문에 답하는 방식",
          body: "발표 후 질문은 세 종류로 나뉩니다. 아는 질문, 모르는 질문, 발표 내용 밖의 질문입니다. 각각 다른 방식으로 답합니다.",
          table: {
            head: ["질문 종류", "대응"],
            rows: [
              ["아는 질문", "That's a good question. We found that ~"],
              ["모르는 질문", "I don't have that figure with me. I'll follow up."],
              ["범위 밖", "That's outside today's scope, but I can cover it separately."],
              ["모호한 질문", "Just to make sure I answer the right question, are you asking about ~?"],
              ["적대적 질문", "I hear the concern. Let me address it directly."]
            ]
          },
          note: "Just to make sure I answer the right question ~ 은 모호한 질문을 정리해 주는 표현입니다. 답을 피하는 것이 아니라 정확히 답하기 위한 확인입니다."
        },
        {
          h: "강조하고 마무리하기",
          body: "발표의 마지막에는 청중이 기억할 한 문장을 남기고, 원하는 행동을 분명히 밝힙니다.",
          examples: [
            { en: "If you take one thing away today, let it be this: the pilot paid for itself.", ko: "오늘 하나만 기억하신다면 이겁니다. 시범 운영은 비용을 회수했습니다." },
            { en: "So what I'm asking for is a decision by Friday.", ko: "제가 요청드리는 것은 금요일까지의 결정입니다." }
          ],
          note: "If you take one thing away today, let it be this: 는 핵심 한 문장을 각인시키는 마무리 표현입니다."
        }
      ],
      mistakes: [
        "발표 흐름을 알려 주지 않고 내용만 쏟아내는 실수 — Let's turn to ~ 같은 안내 표현을 반복합니다.",
        "모르는 질문에 즉석에서 추측해 답하는 실수 — I'll follow up. 로 정확히 답할 시점을 약속합니다."
      ],
      practice: [
        { q: "발표에서 화제를 전환하는 표현은?", opts: ["Let's turn to the second point.", "Stop asking.", "That's all.", "I forgot."], a: "Let's turn to the second point.", why: "signposting 표현으로 청중이 흐름을 따라오게 합니다." },
        { q: "모르는 수치를 질문받았을 때 알맞은 대응은?", opts: ["추측해서 답한다", "I don't have that figure with me. I'll follow up.", "그 질문은 무시한다", "다른 사람에게 넘긴다"], a: "I don't have that figure with me. I'll follow up.", why: "추측하면 신뢰를 잃습니다. 확인 후 답하겠다고 약속하는 것이 안전합니다." },
        { q: "핵심 한 문장을 각인시키는 마무리 표현은?", opts: ["Anyway, that's it.", "If you take one thing away today, let it be this:", "I'm done talking.", "Any questions? No? Okay."], a: "If you take one thing away today, let it be this:", why: "청중이 기억할 한 문장을 남기는 효과적인 마무리입니다." }
      ]
    },
    {
      no: 12,
      title: "문화 차이와 예의의 결",
      summary: "영어권 커뮤니케이션은 대체로 요청을 직접 말하고 이유를 뒤에 붙입니다. 한국어 화법을 그대로 옮기면 뜻이 어긋납니다.",
      points: [
        {
          h: "직접성의 차이",
          body: "영어권 업무 자리에서는 결론을 먼저 말하고 이유를 뒤에 붙이는 것이 일반적입니다. 이유부터 길게 말하면 핵심이 묻힙니다.",
          table: {
            head: ["한국어 화법", "영어권 화법"],
            rows: [
              ["이유를 길게 설명한 뒤 요청", "요청을 먼저, 이유를 뒤에"],
              ["거절할 때 오래 얼버무림", "I'm afraid I can't, because ~ 로 짧게"],
              ["눈치를 보고 미룸", "Can I get back to you by Thursday? 로 시점 약속"],
              ["문제를 완곡하게 둘러봄", "There's an issue with ~ 로 바로 지목"]
            ]
          },
          note: "완곡하게 돌려 말하면 영어권에서는 확신이 없거나 숨기는 것으로 읽힙니다. 짧고 분명하게 말한 뒤 이유를 붙이는 편이 예의로 통합니다."
        },
        {
          h: "칭찬과 감사 표현하기",
          body: "영어권에서는 칭찬과 감사를 명시적으로 말합니다. 한국어에서 당연하게 여겨 생략하는 자리에도 말로 표현합니다.",
          table: {
            head: ["자리", "표현"],
            rows: [
              ["칭찬", "I really liked how you handled that."],
              ["감사", "Thanks for turning this around so quickly."],
              ["인정", "That was a good call."],
              ["위로", "That sounds like a lot. Thanks for pushing through."]
            ]
          },
          note: "I really liked how you handled that. 은 구체적인 행동을 칭찬하는 표현입니다. Good job. 보다 진심으로 들립니다."
        },
        {
          h: "의견 차이를 문화적으로 다루기",
          body: "회의에서 반대 의견을 말하는 것은 관계를 해치는 일로 보지 않습니다. 다만 사람이 아니라 안건을 향해 말합니다.",
          examples: [
            { en: "I'd like to offer a different view on the second point.", ko: "두 번째 항목에 대해 다른 견해를 말씀드리고 싶습니다." },
            { en: "I want to push back a little on the assumption behind that.", ko: "그 전제에 대해서는 조금 이견이 있습니다." }
          ],
          note: "on the second point 처럼 안건을 명시하면 반대가 사람에 대한 것으로 읽히지 않습니다."
        }
      ],
      mistakes: [
        "요청을 이유 뒤에 두는 실수 — 영어권에서는 요청을 먼저 말하고 이유를 뒤에 붙입니다.",
        "칭찬이나 감사를 생략하는 실수 — 당연하게 여겨지는 일도 말로 표현하는 것이 관계를 만듭니다."
      ],
      practice: [
        { q: "영어권 업무 자리에서 요청할 때 알맞은 순서는?", opts: ["이유를 길게 설명한 뒤 요청", "요청을 먼저 말하고 이유를 뒤에", "요청을 생략", "눈치를 보고 미룸"], a: "요청을 먼저 말하고 이유를 뒤에", why: "결론을 먼저 말하는 것이 영어권 업무 화법의 기본입니다." },
        { q: "구체적인 행동을 칭찬하는 표현은?", opts: ["Good job.", "I really liked how you handled that.", "Nice.", "Okay."], a: "I really liked how you handled that.", why: "구체적으로 짚어 칭찬하면 훨씬 진심으로 들립니다." },
        { q: "반대 의견이 사람에 대한 것으로 읽히지 않게 하는 표현은?", opts: ["You are wrong.", "I'd like to offer a different view on the second point.", "That makes no sense.", "Who wrote this?"], a: "I'd like to offer a different view on the second point.", why: "안건을 명시하면 반대가 사람을 향하지 않는다는 것이 분명해집니다." }
      ]
    }
  ]
});
