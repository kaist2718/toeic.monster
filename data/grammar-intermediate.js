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
      summary: "완료시제는 기준 시점보다 앞선 일을 나타냅니다. 기준이 현재면 현재완료, 과거면 과거완료, 미래면 미래완료입니다.",
      points: [
        {
          h: "현재완료 — have / has + p.p.",
          body: "과거에 시작한 일이 지금까지 이어지거나, 지금에 영향을 미칠 때 씁니다. 막 끝난 일, 경험, 계속을 모두 나타냅니다.",
          table: {
            head: ["용법", "함께 쓰는 표현", "예문"],
            rows: [
              ["계속", "for, since", "We have used this system for three years."],
              ["경험", "ever, never, before", "She has never missed a deadline."],
              ["완료", "just, already, yet", "The shipment has just arrived."],
              ["결과", "now, so far", "Sales have doubled so far this year."]
            ]
          },
          note: "yesterday, last week 처럼 끝난 과거 시점을 가리키는 표현과는 함께 쓰지 않습니다."
        },
        {
          h: "과거완료 — had + p.p.",
          body: "과거의 어떤 시점보다 더 앞선 일을 나타냅니다. 두 사건의 선후를 분명히 할 때 씁니다.",
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
            { en: "The auditors will have reviewed the books by Friday.", ko: "감사관들은 금요일까지 장부를 검토해 두었을 것입니다." }
          ]
        },
        {
          h: "완료진행형",
          body: "have been + -ing는 동작이 계속되고 있음을 강조합니다. 결과보다 진행 과정이 중요할 때 씁니다.",
          examples: [
            { en: "I have been working on this proposal since Monday.", ko: "저는 월요일부터 이 제안서를 작업하고 있습니다." },
            { en: "The system had been running smoothly until last week.", ko: "그 시스템은 지난주까지 순조롭게 운영되고 있었습니다." }
          ]
        }
      ],
      mistakes: [
        "I have seen him yesterday. 처럼 끝난 시점과 현재완료를 함께 쓰는 실수 — 과거시제 saw 를 씁니다.",
        "since three months 처럼 기간에 since 를 쓰는 실수 — 기간은 for, 시작점은 since 입니다."
      ],
      practice: [
        { q: "Our company ____ in this market since 2011.", opts: ["operates", "operated", "has operated", "is operating"], a: "has operated", why: "since 2011 은 과거의 시작점이 지금까지 이어지는 경우이므로 현재완료를 씁니다." },
        { q: "By the time the guests arrived, the staff ____ everything.", opts: ["prepare", "prepared", "had prepared", "have prepared"], a: "had prepared", why: "손님이 도착한 시점보다 준비가 더 앞서므로 과거완료를 씁니다." },
        { q: "The contractor ____ the wiring for two weeks before the inspection.", opts: ["has been replacing", "had been replacing", "replaces", "replace"], a: "had been replacing", why: "과거의 한 시점까지 계속된 진행을 강조하므로 과거완료진행형을 씁니다." }
      ]
    },
    {
      no: 2,
      title: "수동태",
      summary: "수동태는 행동을 당하는 대상을 주어로 세웁니다. be동사 + 과거분사 형태로, 행위자는 by로 표시합니다.",
      points: [
        {
          h: "시제별 수동태 형태",
          body: "수동태의 시제는 be동사가 담당하고, 본동사는 항상 과거분사로 고정됩니다.",
          table: {
            head: ["시제", "형태", "예문"],
            rows: [
              ["현재", "am/is/are + p.p.", "The report is reviewed weekly."],
              ["과거", "was/were + p.p.", "The order was shipped yesterday."],
              ["현재완료", "has/have been + p.p.", "The policy has been updated."],
              ["조동사", "조동사 + be + p.p.", "The form must be signed."]
            ]
          }
        },
        {
          h: "4형식·5형식의 수동태",
          body: "사람 목적어를 주어로 세우는 것이 일반적입니다. 5형식에서는 목적격 보어가 주격 보어 자리로 옮겨 갑니다.",
          examples: [
            { en: "I was sent a revised invoice.", ko: "저는 수정된 송장을 받았습니다." },
            { en: "She was appointed the head of the division.", ko: "그녀는 그 부서의 책임자로 임명되었습니다." }
          ]
        },
        {
          h: "by 이외의 전치사",
          body: "감정이나 상태를 나타내는 동사는 by 대신 with, in, at, about을 씁니다.",
          table: {
            head: ["표현", "뜻"],
            rows: [
              ["be interested in", "~에 관심이 있다"],
              ["be satisfied with", "~에 만족하다"],
              ["be covered with", "~로 덮여 있다"],
              ["be surprised at", "~에 놀라다"]
            ]
          }
        },
        {
          h: "수동태를 쓰지 않는 경우",
          body: "목적어를 갖지 않는 자동사는 수동태로 쓸 수 없습니다. happen, occur, rise, arrive가 대표적입니다.",
          examples: [
            { en: "The accident occurred at the intersection.", ko: "사고는 교차로에서 발생했습니다." },
            { en: "Prices rose sharply in the first quarter.", ko: "1분기에 물가가 급격히 올랐습니다." }
          ]
        }
      ],
      mistakes: [
        "The accident was occurred. 처럼 자동사를 수동태로 쓰는 실수 — occurred 로 씁니다.",
        "be동사를 빠뜨리고 The report reviewed weekly. 로 쓰는 실수 — is reviewed 입니다."
      ],
      practice: [
        { q: "All visitor badges ____ at the security desk.", opts: ["issue", "are issued", "issuing", "has issued"], a: "are issued", why: "배지가 발급되는 대상이므로 복수 주어에 맞춘 수동태 are issued 를 씁니다." },
        { q: "The new guidelines ____ by the board last month.", opts: ["approve", "approved", "were approved", "have approved"], a: "were approved", why: "last month 는 끝난 과거이고 가이드라인이 승인받는 대상이므로 과거 수동태를 씁니다." },
        { q: "Customers ____ with the response time of our support team.", opts: ["are satisfying", "are satisfied", "satisfy", "have satisfied"], a: "are satisfied", why: "be satisfied with 는 사람이 만족하는 상태를 나타내는 수동태 표현입니다." }
      ]
    },
    {
      no: 3,
      title: "관계대명사와 관계부사",
      summary: "관계사는 두 문장을 이어 명사를 설명합니다. 선행사가 사람이면 who, 사물이면 which, 모두 가능하면 that을 씁니다.",
      points: [
        {
          h: "주격·목적격·소유격 관계대명사",
          body: "관계대명사는 뒤 문장에서 빠진 역할을 대신합니다. 관계대명사 뒤에 동사가 바로 오면 주격, 주어가 오면 목적격입니다.",
          table: {
            head: ["선행사", "주격", "목적격", "소유격"],
            rows: [
              ["사람", "who / that", "who(m) / that", "whose"],
              ["사물·동물", "which / that", "which / that", "whose / of which"]
            ]
          }
        },
        {
          h: "목적격 관계대명사의 생략",
          body: "목적격 관계대명사는 뒤에 주어 + 동사가 이어지면 생략할 수 있습니다. 주격은 생략할 수 없습니다.",
          examples: [
            { en: "The proposal (which) we submitted was accepted.", ko: "우리가 제출한 제안서가 받아들여졌습니다." },
            { en: "The manager who signed the contract is on leave.", ko: "계약서에 서명한 부장님은 휴가 중입니다." }
          ]
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
          }
        },
        {
          h: "전치사 + 관계대명사",
          body: "격식 있는 문어체에서는 전치사를 관계대명사 앞에 둡니다. that은 전치사 뒤에 쓸 수 없습니다.",
          examples: [
            { en: "The consultant with whom we worked moved abroad.", ko: "우리가 함께 일한 컨설턴트는 해외로 갔습니다." },
            { en: "This is the vendor to which we sent the order.", ko: "이곳이 우리가 주문을 보낸 업체입니다." }
          ]
        }
      ],
      mistakes: [
        "관계대명사를 쓰고 목적어를 또 남기는 실수 — The report which I wrote it 는 it 을 빼야 맞습니다.",
        "관계부사 where 뒤에 전치사를 또 쓰는 실수 — the office where I work 에서 in 을 반복하지 않습니다."
      ],
      practice: [
        { q: "The candidate ____ portfolio impressed the panel was hired.", opts: ["who", "whose", "which", "whom"], a: "whose", why: "뒤의 명사 portfolio 의 소유 관계를 나타내므로 소유격 whose 를 씁니다." },
        { q: "This is the warehouse ____ we store the seasonal inventory.", opts: ["which", "where", "who", "what"], a: "where", why: "장소를 나타내는 선행사 warehouse 뒤에 완전한 문장이 오므로 관계부사 where 를 씁니다." },
        { q: "The invoice ____ you sent last week has not been processed.", opts: ["who", "whose", "which", "where"], a: "which", why: "사물 선행사 invoice 를 받고 뒤에 주어 you 가 오므로 목적격 which 가 맞습니다." }
      ]
    },
    {
      no: 4,
      title: "부정사와 동명사",
      summary: "동사를 다른 자리에서 쓰려면 to부정사나 동명사로 바꿉니다. 앞에 오는 동사에 따라 형태가 정해집니다.",
      points: [
        {
          h: "to부정사를 취하는 동사",
          body: "want, decide, hope, plan, agree, promise, manage는 to부정사를 목적어로 취합니다. 미래 지향적이거나 아직 일어나지 않은 일에 주로 씁니다.",
          examples: [
            { en: "We decided to postpone the launch.", ko: "우리는 출시를 연기하기로 결정했습니다." },
            { en: "She hopes to transfer to the overseas team.", ko: "그녀는 해외 팀으로 옮기기를 바랍니다." }
          ]
        },
        {
          h: "동명사를 취하는 동사",
          body: "enjoy, avoid, finish, mind, suggest, consider, recommend는 동명사를 목적어로 취합니다.",
          examples: [
            { en: "Please avoid sending large attachments.", ko: "큰 첨부 파일을 보내는 것은 피해 주세요." },
            { en: "They suggested holding the meeting online.", ko: "그들은 회의를 온라인으로 열자고 제안했습니다." }
          ]
        },
        {
          h: "둘 다 취하되 뜻이 달라지는 동사",
          body: "stop, remember, forget, try는 뒤에 오는 형태에 따라 뜻이 달라집니다.",
          table: {
            head: ["동사", "뜻의 차이"],
            rows: [
              ["stop to do", "~하기 위해 멈추다"],
              ["stop doing", "~하는 것을 그만두다"],
              ["remember to do", "~할 것을 기억하다"],
              ["remember doing", "~했던 것을 기억하다"]
            ]
          }
        },
        {
          h: "전치사 뒤의 동명사",
          body: "전치사 뒤에는 동명사가 옵니다. to가 전치사인 표현도 마찬가지입니다.",
          examples: [
            { en: "We look forward to hearing from you.", ko: "여러분의 답변을 기다리겠습니다." },
            { en: "He is responsible for managing the budget.", ko: "그는 예산 관리를 담당합니다." }
          ]
        }
      ],
      mistakes: [
        "look forward to hear 처럼 to 뒤에 원형을 쓰는 실수 — 이 to 는 전치사이므로 hearing 이 맞습니다.",
        "enjoy to work 처럼 동명사 동사에 to부정사를 쓰는 실수 — enjoy working 입니다."
      ],
      practice: [
        { q: "The committee decided ____ the proposal until next quarter.", opts: ["postponing", "to postpone", "postpone", "postponed"], a: "to postpone", why: "decide 는 to부정사를 목적어로 취하는 동사입니다." },
        { q: "Please avoid ____ personal files on the shared drive.", opts: ["to save", "save", "saving", "saved"], a: "saving", why: "avoid 는 동명사를 목적어로 취하므로 saving 이 맞습니다." },
        { q: "We look forward to ____ your feedback on the draft.", opts: ["receive", "receiving", "received", "receipt"], a: "receiving", why: "look forward to 의 to 는 전치사이므로 동명사가 옵니다." }
      ]
    },
    {
      no: 5,
      title: "분사와 분사구문 입문",
      summary: "분사는 동사를 형용사처럼 쓰는 형태입니다. 능동이면 -ing, 수동이면 과거분사를 씁니다.",
      points: [
        {
          h: "현재분사와 과거분사의 구분",
          body: "명사가 어떤 행동을 하는 주체면 현재분사, 그 행동을 당하는 대상이면 과거분사를 씁니다.",
          table: {
            head: ["형태", "의미", "예문"],
            rows: [
              ["현재분사", "능동·진행", "a confusing notice"],
              ["과거분사", "수동·완료", "confused employees"]
            ]
          },
          note: "감정을 나타내는 분사는 사람에게 -ed, 사물에 -ing 를 쓰는 경우가 많습니다."
        },
        {
          h: "분사구문 만들기",
          body: "접속사 + 주어 + 동사 구조에서 접속사를 없애고 주어가 주절과 같으면 지운 뒤 동사를 분사로 바꿉니다. 문장이 훨씬 간결해집니다.",
          table: {
            head: ["원래 문장", "분사구문"],
            rows: [
              ["Because he was tired, he left early.", "Being tired, he left early. / Tired, he left early."],
              ["While she checked the list, she found an error.", "Checking the list, she found an error."]
            ]
          }
        },
        {
          h: "분사구문의 의미",
          body: "분사구문은 시간, 이유, 조건, 양보, 동시 상황을 나타냅니다. 문맥에 따라 뜻이 정해지므로 해석할 때 앞뒤 관계를 봅니다.",
          examples: [
            { en: "Walking into the office, she noticed the new sign.", ko: "사무실로 들어서다가 그녀는 새 표지판을 발견했습니다." },
            { en: "Given the deadline, we should start now.", ko: "마감을 고려하면 지금 시작해야 합니다." }
          ]
        }
      ],
      mistakes: [
        "분사구문의 주어와 주절의 주어가 다른데 그대로 쓰는 실수 — 주어가 다르면 각각 밝혀야 합니다.",
        "수동 관계에 -ing 를 쓰는 실수 — 승인받는 문서는 the approved document 입니다."
      ],
      practice: [
        { q: "The ____ figures in the report caused confusion among the staff.", opts: ["confuse", "confusing", "confused", "confusion"], a: "confusing", why: "수치가 혼란을 일으키는 주체이므로 현재분사 confusing 을 씁니다." },
        { q: "____ the manual carefully, the technician found a loose cable.", opts: ["Read", "Reading", "To reading", "Reads"], a: "Reading", why: "주절 주어와 같은 주어가 능동으로 이어지므로 현재분사로 시작하는 분사구문을 씁니다." },
        { q: "All ____ documents must be stored in the secure cabinet.", opts: ["sign", "signing", "signed", "signature"], a: "signed", why: "서명을 받는 문서이므로 과거분사 signed 가 맞습니다." }
      ]
    },
    {
      no: 6,
      title: "가정법",
      summary: "사실과 다른 상황을 가정할 때는 시제를 한 단계 뒤로 물립니다. if절에서 과거를 쓰면 현재 사실의 반대입니다.",
      points: [
        {
          h: "가정법 과거 — 현재 사실의 반대",
          body: "if절에 과거형, 주절에 would + 원형을 씁니다. be동사는 주어와 관계없이 were를 씁니다.",
          table: {
            head: ["형식", "예문"],
            rows: [
              ["If + 주어 + 과거형, 주어 + would + 원형", "If I had more time, I would join the workshop."],
              ["If + 주어 + were, 주어 + would + 원형", "If he were in charge, he would change the process."]
            ]
          }
        },
        {
          h: "가정법 과거완료 — 과거 사실의 반대",
          body: "if절에 had + p.p., 주절에 would have + p.p.를 씁니다. 이미 지나간 일에 대한 아쉬움을 나타냅니다.",
          examples: [
            { en: "If we had booked earlier, we would have gotten a discount.", ko: "더 일찍 예약했더라면 할인을 받았을 텐데요." },
            { en: "If she had checked the file, the error would not have occurred.", ko: "그녀가 파일을 확인했더라면 오류가 생기지 않았을 것입니다." }
          ]
        },
        {
          h: "I wish 가정법",
          body: "이루어지지 않은 바람을 나타냅니다. 현재의 아쉬움에는 과거형, 과거의 아쉬움에는 had + p.p.를 씁니다.",
          table: {
            head: ["형식", "뜻"],
            rows: [
              ["I wish + 과거형", "지금 ~라면 좋을 텐데"],
              ["I wish + had p.p.", "그때 ~했더라면 좋았을 텐데"],
              ["I wish + would", "앞으로 ~해 주면 좋겠다"]
            ]
          }
        },
        {
          h: "가정의 다른 표현",
          body: "without, otherwise, but for도 가정의 뜻을 담습니다. 주절에 would를 쓰는 점이 같습니다.",
          examples: [
            { en: "Without your help, we would not have finished on time.", ko: "당신의 도움이 없었다면 제때 끝내지 못했을 것입니다." },
            { en: "I should have left earlier; otherwise I would have caught the train.", ko: "더 일찍 출발했어야 했습니다. 그랬다면 기차를 탔을 텐데요." }
          ]
        }
      ],
      mistakes: [
        "If I would have time 처럼 if절에 would 를 쓰는 실수 — if절에는 과거형, 주절에 would 를 씁니다.",
        "가정법 과거에서 was 를 쓰는 실수 — 격식 표현에서는 If I were 가 원칙입니다."
      ],
      practice: [
        { q: "If the supplier ____ the order on time, the store would not be out of stock.", opts: ["ships", "shipped", "had shipped", "will ship"], a: "shipped", why: "현재 사실의 반대를 가정하고 주절에 would be 가 있으므로 if절에는 과거형을 씁니다." },
        { q: "If we had reviewed the contract, we ____ the penalty clause.", opts: ["would notice", "would have noticed", "notice", "had noticed"], a: "would have noticed", why: "과거 사실의 반대를 가정하는 가정법 과거완료이므로 would have p.p. 를 씁니다." },
        { q: "I wish I ____ more time to prepare for the interview last week.", opts: ["have", "had", "had had", "will have"], a: "had had", why: "지난주라는 과거에 대한 아쉬움이므로 had + p.p. 를 씁니다." }
      ]
    },
    {
      no: 7,
      title: "조동사 심화 — 추측과 후회",
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
              ["cannot have p.p.", "일어났을 리 없음", "He cannot have finished the audit."]
            ]
          }
        },
        {
          h: "should have p.p.와 could have p.p.",
          body: "should have p.p.는 하지 않은 일에 대한 후회나 비난을, could have p.p.는 하려고 마음만 먹으면 가능했던 일을 나타냅니다.",
          examples: [
            { en: "You should have informed the client earlier.", ko: "고객에게 더 일찍 알렸어야 했습니다." },
            { en: "We could have saved money by ordering in bulk.", ko: "대량 주문으로 돈을 아낄 수도 있었습니다." }
          ]
        },
        {
          h: "need not have p.p. vs did not need to",
          body: "need not have p.p.는 실제로 했지만 할 필요가 없었던 일을, did not need to는 할 필요가 없어서 하지 않은 일을 나타냅니다.",
          examples: [
            { en: "You need not have printed the whole file.", ko: "파일 전체를 인쇄할 필요는 없었는데요." },
            { en: "I did not need to attend the second session.", ko: "저는 두 번째 세션에 참석할 필요가 없었습니다." }
          ]
        }
      ],
      mistakes: [
        "must have went 처럼 have 뒤에 과거형을 쓰는 실수 — have 뒤에는 과거분사가 옵니다.",
        "should have p.p. 를 습관에 대한 조언으로 쓰는 실수 — 과거 사실에 대한 후회에 씁니다."
      ],
      practice: [
        { q: "The lights are off, so the staff ____ home already.", opts: ["must go", "must have gone", "must going", "must went"], a: "must have gone", why: "현재 상황으로 과거를 강하게 추측하므로 must have p.p. 를 씁니다." },
        { q: "You ____ the client before promising a discount.", opts: ["should consult", "should have consulted", "should consulting", "should consulted"], a: "should have consulted", why: "하지 않은 과거 일에 대한 후회를 나타내므로 should have p.p. 를 씁니다." },
        { q: "The package is still here, so the courier ____ it yet.", opts: ["cannot have delivered", "must have delivered", "can have delivered", "should deliver"], a: "cannot have delivered", why: "택배가 아직 있으므로 배달했을 리 없다는 부정적 확신을 cannot have p.p. 로 나타냅니다." }
      ]
    },
    {
      no: 8,
      title: "사역동사와 지각동사",
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
          }
        },
        {
          h: "지각동사 see / hear / watch",
          body: "지각동사 뒤에는 동사 원형(전체 동작) 또는 -ing(진행 중)를 씁니다. 수동태로 바뀌면 to부정사를 씁니다.",
          examples: [
            { en: "I saw the courier deliver the parcel.", ko: "저는 택배 기사가 소포를 배달하는 것을 보았습니다." },
            { en: "She was seen to sign the agreement.", ko: "그녀가 계약서에 서명하는 것이 목격되었습니다." }
          ]
        },
        {
          h: "준사역동사 help",
          body: "help는 목적어 뒤에 동사 원형과 to부정사를 모두 쓸 수 있습니다.",
          examples: [
            { en: "The assistant helped the team prepare the slides.", ko: "그 비서는 팀이 슬라이드를 준비하도록 도왔습니다." },
            { en: "This tool helps users to track expenses.", ko: "이 도구는 사용자가 지출을 추적하도록 돕습니다." }
          ]
        }
      ],
      mistakes: [
        "made us to redo 처럼 사역동사 뒤에 to 를 넣는 실수 — make 뒤에는 원형을 씁니다.",
        "let me to check 처럼 let 뒤에 to 를 쓰는 실수 — let me check 가 맞습니다."
      ],
      practice: [
        { q: "The supervisor had the intern ____ the summary again.", opts: ["to write", "writing", "write", "wrote"], a: "write", why: "사역동사 have 뒤에는 목적격 보어로 동사 원형을 씁니다." },
        { q: "We saw the new staff ____ packages in the warehouse.", opts: ["to load", "load", "to loading", "loaded"], a: "load", why: "지각동사 see 뒤에는 동사 원형이나 -ing 가 오며, to부정사는 쓰지 않습니다." },
        { q: "She got the supplier ____ the delivery date.", opts: ["change", "to change", "changing", "changed"], a: "to change", why: "get 은 사역의 뜻이지만 목적격 보어로 to부정사를 씁니다." }
      ]
    },
    {
      no: 9,
      title: "비교 표현 심화",
      summary: "the 비교급, 원급 관용 표현, 배수 표현으로 정확한 비교를 만듭니다.",
      points: [
        {
          h: "the 비교급, the 비교급",
          body: "앞의 비교급이 조건, 뒤의 비교급이 결과가 되어 점점 더해지는 변화를 나타냅니다. 두 절 모두 the를 씁니다.",
          examples: [
            { en: "The more we practice, the more confident we become.", ko: "연습할수록 더 자신감이 생깁니다." },
            { en: "The sooner you confirm, the earlier we can ship.", ko: "더 빨리 확인할수록 더 일찍 발송할 수 있습니다." }
          ]
        },
        {
          h: "비교급 강조와 배수",
          body: "much, far, even, a lot은 비교급을 강조하고, twice, three times는 배수를 나타냅니다.",
          table: {
            head: ["표현", "예문"],
            rows: [
              ["much + 비교급", "This route is much faster."],
              ["twice as many as", "We received twice as many orders as last year."],
              ["three times the price", "The unit costs three times the price of the older model."]
            ]
          }
        },
        {
          h: "원급 관용 표현",
          body: "as soon as possible, as far as I know처럼 굳어진 표현은 통째로 익힙니다.",
          examples: [
            { en: "Please reply as soon as possible.", ko: "가능한 한 빨리 답변해 주세요." },
            { en: "As far as I know, the schedule has not changed.", ko: "제가 아는 한 일정은 바뀌지 않았습니다." }
          ]
        },
        {
          h: "최상급 관용 표현",
          body: "one of the + 최상급 + 복수명사, the second + 최상급 구조는 시험에 자주 나옵니다.",
          examples: [
            { en: "This is one of the most efficient systems on the market.", ko: "이것은 시장에서 가장 효율적인 시스템 중 하나입니다." },
            { en: "Seoul is the second largest market for the brand.", ko: "서울은 그 브랜드의 두 번째로 큰 시장입니다." }
          ]
        }
      ],
      mistakes: [
        "The more practice, the more confident. 처럼 절 형태를 빠뜨리는 실수 — 주어와 동사를 갖춘 절이 필요합니다.",
        "one of the most efficient system 처럼 최상급 뒤 명사를 단수로 쓰는 실수 — 복수형 systems 가 맞습니다."
      ],
      practice: [
        { q: "The earlier you apply, the ____ your chance of approval.", opts: ["high", "higher", "highest", "more high"], a: "higher", why: "the 비교급 구문이므로 뒤에도 비교급 higher 를 씁니다." },
        { q: "This quarter we processed ____ as many orders as last quarter.", opts: ["two times", "twice", "double", "second"], a: "twice", why: "배수를 나타내는 관용 표현은 twice as many as 입니다." },
        { q: "The new facility is one of the most advanced ____ in the region.", opts: ["factory", "factorys", "factories", "factor"], a: "factories", why: "one of the + 최상급 뒤에는 복수 명사가 옵니다." }
      ]
    },
    {
      no: 10,
      title: "간접의문문과 명사절",
      summary: "의문문이 문장 속에 들어가면 어순이 평서문처럼 바뀝니다. that, if, whether로 절을 명사처럼 씁니다.",
      points: [
        {
          h: "간접의문문의 어순",
          body: "의문사 + 주어 + 동사 순서로 배열하고, 의문사가 없는 경우 if나 whether를 씁니다. 물음표는 문장 전체가 의문문일 때만 붙입니다.",
          table: {
            head: ["직접의문문", "간접의문문"],
            rows: [
              ["Where is the office?", "Do you know where the office is?"],
              ["Does he work here?", "Could you tell me if he works here?"]
            ]
          }
        },
        {
          h: "that절과 동격의 that",
          body: "that절은 문장의 주어·목적어·보어가 될 수 있습니다. 동격의 that은 앞 명사의 내용을 설명합니다.",
          examples: [
            { en: "We believe that the delay was unavoidable.", ko: "우리는 지연이 불가피했다고 믿습니다." },
            { en: "The fact that sales rose surprised the board.", ko: "매출이 올랐다는 사실이 이사회를 놀라게 했습니다." }
          ]
        },
        {
          h: "whether와 if의 차이",
          body: "주어 자리, 전치사 뒤, to부정사 앞에는 whether만 씁니다. if는 목적어 자리에서만 쓸 수 있습니다.",
          examples: [
            { en: "Whether the project succeeds depends on funding.", ko: "그 사업의 성공 여부는 자금에 달려 있습니다." },
            { en: "We are discussing whether to extend the deadline.", ko: "우리는 마감을 연장할지 논의하고 있습니다." }
          ]
        },
        {
          h: "명사절을 이끄는 의문사",
          body: "what, who, which, when, where, how는 명사절을 이끌며 절 안에서 주어나 목적어 역할을 합니다.",
          examples: [
            { en: "What the client needs is a clear timeline.", ko: "고객이 필요로 하는 것은 명확한 일정입니다." },
            { en: "I cannot recall who sent the first email.", ko: "저는 누가 첫 이메일을 보냈는지 기억나지 않습니다." }
          ]
        }
      ],
      mistakes: [
        "Do you know where is the station? 처럼 간접의문문에서 어순을 바꾸는 실수 — where the station is 입니다.",
        "전치사 뒤에 if 를 쓰는 실수 — 전치사 뒤에는 whether 를 씁니다."
      ],
      practice: [
        { q: "Could you tell me when the next shipment ____?", opts: ["will arrive", "arrives will", "does arrive when", "arrive"], a: "will arrive", why: "간접의문문은 의문사 뒤에 주어 + 동사 순서로 씁니다." },
        { q: "The success of the launch depends on ____ the budget is approved.", opts: ["if", "whether", "that", "what"], a: "whether", why: "전치사 on 뒤에는 whether 만 쓸 수 있습니다." },
        { q: "____ surprised the team was the speed of the response.", opts: ["What", "That", "Which", "Whether"], a: "What", why: "명사절의 주어 자리에서 절을 이끄는 의문대명사는 What 입니다." }
      ]
    },
    {
      no: 11,
      title: "화법 — 직접화법과 간접화법",
      summary: "남의 말을 전할 때는 시제를 한 단계 뒤로 물리고 대명사와 시간 표현을 바꿉니다.",
      points: [
        {
          h: "시제와 대명사 변화",
          body: "전달 동사가 과거이면 인용문의 시제를 한 단계 뒤로 물립니다. 대명사는 말하는 사람 기준으로 바꿉니다.",
          table: {
            head: ["직접화법", "간접화법"],
            rows: [
              ["am / is", "was"],
              ["will", "would"],
              ["can", "could"],
              ["did", "had done"]
            ]
          }
        },
        {
          h: "시간·장소 표현 변화",
          body: "now는 then, today는 that day, tomorrow는 the next day, here는 there로 바꿉니다.",
          table: {
            head: ["직접화법", "간접화법"],
            rows: [
              ["today", "that day"],
              ["tomorrow", "the next day"],
              ["yesterday", "the day before"],
              ["next week", "the following week"]
            ]
          }
        },
        {
          h: "의문문·명령문 전달",
          body: "의문문은 if 또는 의문사로 이어 주고, 명령문은 tell + 목적어 + to부정사로 바꿉니다.",
          examples: [
            { en: "He asked me if the report was ready.", ko: "그는 제게 보고서가 준비되었는지 물었습니다." },
            { en: "She told us to submit the form by Friday.", ko: "그녀는 우리에게 금요일까지 양식을 제출하라고 했습니다." }
          ]
        },
        {
          h: "시제를 바꾸지 않는 경우",
          body: "전달 동사가 현재이고, 내용이 지금도 유효하면 시제를 그대로 둡니다.",
          examples: [
            { en: "She says she works from home on Fridays.", ko: "그녀는 금요일에는 재택 근무를 한다고 말합니다." },
            { en: "He said the earth moves around the sun.", ko: "그는 지구가 태양 주위를 돈다고 말했습니다." }
          ]
        }
      ],
      mistakes: [
        "He said that he will come. 처럼 시제를 뒤로 물리지 않는 실수 — would come 이 맞습니다.",
        "asked me where was the file 처럼 간접화법 의문문에서 어순을 바꾸는 실수 — where the file was 입니다."
      ],
      practice: [
        { q: "The client said that he ____ the proposal the next day.", opts: ["reviews", "would review", "will review", "reviewed"], a: "would review", why: "전달 동사가 과거이고 미래 일을 전하므로 will 을 would 로 바꿉니다." },
        { q: "The manager asked me ____ I had finished the summary.", opts: ["that", "if", "what", "which"], a: "if", why: "예·아니오로 답하는 의문문을 전달할 때는 if 를 씁니다." },
        { q: "The supervisor told the team ____ the equipment before leaving.", opts: ["turn off", "to turn off", "turning off", "turned off"], a: "to turn off", why: "명령문을 전달할 때는 tell + 목적어 + to부정사 구조를 씁니다." }
      ]
    },
    {
      no: 12,
      title: "연결어 심화 — 접속사·접속부사·전치사",
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
          h: "접속부사의 문장부호",
          body: "접속부사는 두 문장을 연결할 때 세미콜론과 콤마를 함께 씁니다. 문장 맨 앞에 오면 뒤에 콤마를 붙입니다.",
          examples: [
            { en: "The plan was costly; however, the board approved it.", ko: "그 계획은 비쌌습니다. 그러나 이사회는 승인했습니다." },
            { en: "Therefore, the launch was postponed.", ko: "따라서 출시가 연기되었습니다." }
          ]
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
          h: "콤마와 세미콜론 정리",
          body: "접속사는 콤마와 함께, 접속부사는 세미콜론과 함께 씁니다. 접속부사만으로 두 절을 직접 연결할 수 없습니다.",
          examples: [
            { en: "Although the deadline was short, the team delivered.", ko: "마감이 짧았지만 팀은 결과물을 냈습니다." },
            { en: "The deadline was short; nevertheless, the team delivered.", ko: "마감이 짧았습니다. 그럼에도 팀은 결과물을 냈습니다." }
          ]
        }
      ],
      mistakes: [
        "Despite it was raining 처럼 despite 뒤에 절을 쓰는 실수 — Despite the rain 또는 Although it was raining 입니다.",
        "The plan was costly, however we approved it. 처럼 접속부사를 접속사처럼 쓰는 실수 — 세미콜론이나 마침표로 나눠야 합니다."
      ],
      practice: [
        { q: "____ the heavy workload, the team met the deadline.", opts: ["Although", "Despite", "Because", "Therefore"], a: "Despite", why: "뒤에 명사구 the heavy workload 가 오므로 전치사 Despite 를 씁니다." },
        { q: "The supplier raised prices; ____, we had to revise the budget.", opts: ["therefore", "despite", "although", "whereas"], a: "therefore", why: "앞 문장의 결과를 이어 주는 접속부사 therefore 가 맞습니다." },
        { q: "Please submit the request today; ____, it will be processed next month.", opts: ["otherwise", "moreover", "likewise", "namely"], a: "otherwise", why: "그렇지 않으면이라는 조건의 의미를 나타내는 otherwise 를 씁니다." }
      ]
    }
  ]
});
