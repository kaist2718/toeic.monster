/* ============================================================================
 * 고급 영문법 (C1) — 12과
 * tools/build-pages.mjs 와 감사 도구가 window.GRAMMAR_BOOKS 를 읽습니다.
 * 한 과의 구성: intro → summary → points(개념·형태표·예문·note) → mistakes → practice
 * ========================================================================== */
window.GRAMMAR_BOOKS = window.GRAMMAR_BOOKS || [];

window.GRAMMAR_BOOKS.push({
  id: "advanced",
  level: "고급",
  cefr: "C1",
  title: "고급 영문법",
  subtitle: "분사구문·도치·가정법 심화로 문장의 정확도와 격식 끌어올리기",
  desc: "분사구문 심화, 도치, 혼합 가정법, 복합관계사, 준동사의 완료·수동, 강조와 생략, 정보구조까지 고급 문장을 다루는 12과 문법 교재입니다.",
  audience: "TOEIC 900점 이상 또는 학술·비즈니스 문장을 직접 쓰는 학습자",
  goal: "긴 문장의 구조를 분해해 오류를 찾아내고, 격식 있는 문어체 문장을 직접 쓸 수 있다.",
  howto: [
    "각 과의 형태 표를 소리 내어 읽고, 같은 구조로 문장을 한 개씩 직접 만들어 봅니다",
    "연습 문제의 오답은 해설에 적힌 판단 순서를 그대로 따라가며 다시 풉니다",
    "예문을 보고 왜 그 형태가 쓰였는지 한 줄로 설명해 보는 연습을 합니다"
  ],
  chapters: [
    {
      no: 1,
      title: "분사구문 심화",
      intro: "고급 문장에서 분사구문은 문어체를 압축하는 도구입니다. 접속사를 남기지 않으면서 원인·시간·조건을 표현하므로, 시험에서는 준동사의 시제와 태를 묻는 문제로 자주 나옵니다. 완료·수동·부정·독립분사구문을 한 흐름으로 정리해 두면 긴 문장도 구조가 바로 보입니다.",
      summary: "분사구문은 부사절의 접속사와 같은 주어를 생략해 만듭니다. 주절보다 앞선 일은 완료형, 당하는 관계는 수동형으로 쓰고, 주어가 다르면 독립분사구문으로 주어를 남깁니다.",
      points: [
        {
          h: "분사구문이 만들어지는 순서",
          body: "부사절에서 접속사와 주절과 같은 주어를 지우고 동사를 -ing 형태로 바꾸면 분사구문이 됩니다. 시간·이유·조건·양보 등 원래 접속사가 담당하던 의미는 문맥으로 이어받습니다. 다만 접속사를 남겨 둔 채 동사만 바꾸면 분사구문이 아니라 어색한 부사절이 되므로, 두 구조를 섞지 않도록 주의합니다.",
          table: {
            head: ["부사절", "만드는 순서", "분사구문"],
            rows: [
              ["Because she had missed the deadline, she apologized.", "접속사와 주어를 지우고 had missed 를 having missed 로", "Having missed the deadline, she apologized."],
              ["When he arrived at the office, he checked the schedule.", "When 과 he 를 지우고 arrived 를 arriving 으로", "Arriving at the office, he checked the schedule."],
              ["If you turn left, you will find the parking lot.", "If 와 you 를 지우고 turn 을 turning 으로", "Turning left, you will find the parking lot."],
              ["Though the machine was tested, it failed again.", "Though 와 it 을 지우고 수동이므로 tested 로", "Tested again, the machine failed."]
            ]
          },
          note: "접속사를 그대로 두고 분사만 바꾸면 틀린 문장이 됩니다. Because arriving late, he missed the call. 이 아니라 Arriving late, he missed the call. 입니다."
        },
        {
          h: "완료분사구문 — Having + p.p.",
          body: "분사구문이 나타내는 일이 주절보다 먼저 일어났을 때는 Having + 과거분사를 씁니다. 시간의 선후가 분명해지므로 보고서·계약서 같은 문어체에서 자주 쓰입니다. 순서가 문맥상 명백하면 단순분사구문으로 줄일 수 있지만, 헷갈릴 때는 완료형을 남겨 두는 편이 안전합니다.",
          table: {
            head: ["시점 관계", "형태", "예문"],
            rows: [
              ["주절보다 앞선 일", "Having + p.p.", "Having reviewed the draft, she approved it."],
              ["주절과 같은 시점", "-ing", "Reviewing the draft, she found two errors."],
              ["주절보다 뒤의 일", "분사구문으로 표현하지 않음", "She approved the draft and emailed it."]
            ]
          },
          examples: [
            { en: "Having finished the audit, he submitted the report.", ko: "감사를 마친 뒤 그는 보고서를 제출했습니다." },
            { en: "Having missed the deadline, she apologized to the client.", ko: "마감을 놓친 뒤 그녀는 고객에게 사과했습니다." }
          ],
          note: "Having 뒤에는 반드시 과거분사가 옵니다. Having passed the exam 이 맞고, Having pass 는 틀립니다."
        },
        {
          h: "수동분사구문 — Being + p.p. 와 생략",
          body: "분사구문의 주체가 동작을 당하는 대상이면 과거분사로 시작합니다. 문어체에서는 Being이 대개 생략되어 Written in plain language 처럼 과거분사만 남습니다. 수동의 뜻이 흐려질 때만 Being을 살려 두고, 주절 주어가 동작을 당하는지 먼저 확인합니다.",
          examples: [
            { en: "Written in plain language, the manual is easy to follow.", ko: "쉬운 문장으로 쓰여서 그 설명서는 따라 하기 쉽습니다." },
            { en: "Given more time, the team could have finished the prototype.", ko: "시간이 더 주어졌다면 팀은 시제품을 끝냈을 것입니다." },
            { en: "Being located near the port, the warehouse saves shipping costs.", ko: "항구 근처에 있어서 그 창고는 운송비를 줄여 줍니다." }
          ],
          note: "주어가 사물이고 뒤에 동작을 당한 흔적이 보이면 과거분사를 고릅니다. Built in 1998, the plant has been expanded twice. 처럼 씁니다."
        },
        {
          h: "부정분사구문 — Not + -ing",
          body: "부정의 뜻은 분사 바로 앞에 Not을 두어 나타냅니다. 완료형과 함께 쓸 때도 Not having + p.p. 순서를 지킵니다. Knowing not 처럼 not을 뒤로 옮기거나 Having not read 처럼 완료형 사이에 끼워 넣는 어순은 쓰지 않습니다.",
          examples: [
            { en: "Not knowing the password, he could not log in.", ko: "비밀번호를 몰라서 그는 로그인할 수 없었습니다." },
            { en: "Not having read the manual, the intern made two mistakes.", ko: "설명서를 읽지 않아서 인턴은 실수를 두 번 했습니다." },
            { en: "Never having dealt with customs, she asked for help.", ko: "통관을 다뤄 본 적이 없어서 그녀는 도움을 청했습니다." }
          ],
          note: "부정어는 언제나 분사 앞입니다. Not having read the manual 이 맞고, Having not read the manual 은 어색합니다."
        },
        {
          h: "독립분사구문 — 주어가 다를 때",
          body: "분사구문의 주어가 주절의 주어와 다르면 분사 앞에 그 주어를 그대로 남깁니다. 이때 분사구문은 독립된 절처럼 행동하고, 주절 동사는 원래 주절 주어에 맞춥니다. 일정·날씨·상황을 배경으로 깔아 주는 표현이 많아 회의와 보고 문맥에서 유용합니다.",
          examples: [
            { en: "The schedule being tight, the team worked through the weekend.", ko: "일정이 빠듯해서 팀은 주말에도 일했습니다." },
            { en: "There being no objection, the proposal was approved.", ko: "이의가 없어서 그 제안은 승인되었습니다." },
            { en: "Weather permitting, the inspection will start on Monday.", ko: "날씨가 허락하면 점검은 월요일에 시작합니다." }
          ],
          note: "주어가 어긋난 현수분사는 감점 요인입니다. Passing the station, the building came into view. 보다 As we passed the station, the building came into view. 가 명확합니다."
        },
        {
          h: "with + 목적어 + 분사",
          body: "with 뒤에 목적어와 분사를 붙이면 배경 상황이나 동시 동작을 나타냅니다. 목적어가 동작을 하면 현재분사, 당하면 과거분사를 씁니다. 형용사나 전치사구가 오는 형태도 문어체에서 흔하므로 함께 익혀 둡니다.",
          examples: [
            { en: "With the contract signed, the project moved to phase two.", ko: "계약이 체결되어 사업은 2단계로 넘어갔습니다." },
            { en: "With prices rising, the team revised the budget.", ko: "가격이 오르는 가운데 팀은 예산을 수정했습니다." },
            { en: "The manager sat with her arms folded.", ko: "부장님은 팔짱을 낀 채 앉아 있었습니다." }
          ],
          note: "with 구문의 분사도 목적어와의 관계로 태를 정합니다. With the report writing 은 틀리고 With the report written 이 맞습니다."
        },
        {
          h: "분사구문의 시제와 태 한눈에 정리",
          body: "의미별 형태를 한 표에 모아 두면 빈칸에 들어갈 준동사를 빠르게 고를 수 있습니다. 판단 순서는 언제나 주어와의 관계(능동·수동) 다음에 시간 관계(동시·앞섬)입니다.",
          table: {
            head: ["의미", "형태", "예문"],
            rows: [
              ["동시·연속", "-ing", "Checking the list, he found a gap."],
              ["앞선 시점", "Having + p.p.", "Having checked the list, he signed it."],
              ["수동(동시)", "p.p. / Being + p.p.", "Checked twice, the file was released."],
              ["수동(앞선 시점)", "Having been + p.p.", "Having been checked twice, the file was released."],
              ["부정", "Not + -ing / Not having + p.p.", "Not having checked the list, he missed a gap."],
              ["독립·with", "주어 + -ing / with + 목적어 + 분사", "The list being long, he used a template."]
            ]
          }
        }
      ],
      mistakes: [
        "분사구문에 접속사를 그대로 남기는 실수 — Because arriving late, he missed the call. 이 아니라 Arriving late, he missed the call. 입니다.",
        "주어가 어긋난 현수분사를 쓰는 실수 — Having finished the report, the printer broke down. 보다 After he finished the report, the printer broke down. 이 명확합니다.",
        "앞선 시점인데 단순분사구문을 쓰는 실수 — Finishing the audit, he submitted the report. 는 동시 동작으로 읽히므로 Having finished 를 씁니다.",
        "부정 분사구문에서 Not 의 위치를 뒤로 옮기는 실수 — Knowing not the rule 이 아니라 Not knowing the rule 입니다.",
        "수동 관계에 현재분사를 쓰는 실수 — Writing in plain language, the manual 은 주어가 어긋나므로 Written in plain language, the manual 로 씁니다."
      ],
      practice: [
        { q: "____ the figures, the analyst presented the quarterly results.", opts: ["Verify", "Verified", "Having verified", "To verifying"], a: "Having verified", why: "검증이 발표보다 먼저 일어난 일이므로 완료분사구문을 씁니다." },
        { q: "____ in 1998, the factory has been expanded twice.", opts: ["Building", "Built", "To build", "Having building"], a: "Built", why: "공장은 지어진 대상이므로 과거분사로 시작하는 수동분사구문을 씁니다." },
        { q: "____ the exact requirements, the vendor asked for a clarification meeting.", opts: ["Not knowing", "Not known", "Knowing not", "No knowing"], a: "Not knowing", why: "부정의 분사구문은 분사 앞에 Not 을 둡니다." },
        { q: "____ the audit, the team filed the compliance report.", opts: ["Having completed", "Completed", "To complete", "Complete"], a: "Having completed", why: "감사가 제출보다 먼저 끝난 일이므로 완료분사구문이 맞습니다." },
        { q: "The schedule ____ tight, the crew worked through the weekend.", opts: ["is", "being", "was", "been"], a: "being", why: "주어가 주절과 다른 독립분사구문이므로 주어 뒤에 being 을 씁니다." },
        { q: "____ with care, the sample arrived without any damage.", opts: ["Packing", "Packed", "To pack", "Pack"], a: "Packed", why: "표본은 포장된 대상이므로 수동의 과거분사로 시작합니다." },
        { q: "With the invoice ____, the finance team closed the account.", opts: ["pay", "paid", "paying", "to pay"], a: "paid", why: "송장은 지급되는 대상이므로 with 구문에 과거분사 paid 를 씁니다." },
        { q: "____ been tested twice, the device was finally approved.", opts: ["Having", "Having been", "Being", "To have"], a: "Having been", why: "시험을 통과한 일이 앞서고 장치는 시험받는 대상이므로 Having been tested 가 맞습니다." }
      ]
    },
    {
      no: 2,
      title: "도치",
      intro: "도치는 강조와 격식을 동시에 얻는 장치입니다. 부정어나 장소 부사구가 문장 앞에 오면서 어순이 바뀌기 때문에, 조동사의 위치를 찾는 눈이 필요합니다. 이 과에서는 부정어 도치부터 가정법 도치까지 다섯 갈래로 나누어 정리합니다.",
      summary: "부정어나 장소 부사구가 문두에 오면 조동사가 주어 앞으로 나갑니다. 주어가 대명사이거나 Only 뒤에 주어가 오면 도치하지 않습니다.",
      points: [
        {
          h: "부정어 도치의 기본 어순",
          body: "Never, Rarely, Seldom, Little, Not only 같은 부정어가 문두에 오면 조동사가 주어 앞으로 나갑니다. 조동사가 없으면 do, does, did를 넣고 본동사는 원형으로 되돌립니다. 문어체에서 강조 효과가 커서 학술·비즈니스 문장에 자주 등장합니다.",
          table: {
            head: ["일반 어순", "도치 어순", "문두에 온 부정어"],
            rows: [
              ["We have never seen such a response.", "Never have we seen such a response.", "Never"],
              ["He little knew the risk.", "Little did he know the risk.", "Little"],
              ["She rarely misses a deadline.", "Rarely does she miss a deadline.", "Rarely"],
              ["The firm not only cut costs but also raised output.", "Not only did the firm cut costs, but it also raised output.", "Not only"]
            ]
          },
          note: "일반동사를 도치하면 반드시 원형입니다. Rarely she misses 는 틀리고 Rarely does she miss 가 맞습니다."
        },
        {
          h: "Hardly ~ when / No sooner ~ than / Not until",
          body: "Hardly had ~ when 과 No sooner had ~ than 은 과거완료를 도치해 씁니다. Not until은 '~하고 나서야'라는 뜻으로, Not until 뒤에는 도치가 일어나지 않고 주절에서 일어납니다. 세 구문 모두 시제 짝을 함께 외워 두면 오답을 줄일 수 있습니다.",
          table: {
            head: ["구문", "형태", "예문"],
            rows: [
              ["Hardly ~ when", "Hardly had + 주어 + p.p. ~ when + 과거", "Hardly had we arrived when the meeting began."],
              ["No sooner ~ than", "No sooner had + 주어 + p.p. ~ than + 과거", "No sooner had he spoken than the line went silent."],
              ["Not until", "Not until + 명사구 + did + 주어 + 동사원형", "Not until the audit did the errors surface."]
            ]
          },
          note: "과거완료가 먼저, 과거가 뒤따릅니다. Hardly had arrived 뒤에는 반드시 when 절이 옵니다."
        },
        {
          h: "장소 부사구 도치",
          body: "장소를 나타내는 부사구가 문두에 오면 be동사나 자동사 전체가 주어 앞으로 나갑니다. 동사가 주어보다 앞에 있어도 수는 뒤에 오는 주어에 맞춥니다. 주어가 대명사면 도치하지 않아 Here he comes. 로 씁니다.",
          examples: [
            { en: "On the second floor is the main conference room.", ko: "2층에 메인 회의실이 있습니다." },
            { en: "In the corner stood two old filing cabinets.", ko: "구석에 오래된 파일 캐비닛 두 개가 서 있었습니다." },
            { en: "Among the proposals was a plan to shorten the approval process.", ko: "제안들 중에는 승인 절차를 줄이는 계획이 있었습니다." }
          ],
          note: "Here comes the manager. 처럼 주어가 명사면 도치하지만, Here it comes. 처럼 대명사면 도치하지 않습니다."
        },
        {
          h: "양보 도치 — 형용사·부사·명사 + as/though",
          body: "양보의 뜻을 강조할 때는 보어를 문두로 보내고 as나 though를 씁니다. 형용사와 부사, 동사원형, 관사 없는 명사가 앞에 올 수 있습니다. although로 시작하는 절보다 문어적이고 격식 있는 표현입니다.",
          examples: [
            { en: "Tired as he was, he finished the inspection.", ko: "그는 피곤했지만 점검을 끝냈습니다." },
            { en: "Talented though she is, she still needs more training.", ko: "그녀는 재능이 있지만 여전히 훈련이 더 필요합니다." },
            { en: "Try as we might, the deadline could not be moved.", ko: "아무리 애써도 마감은 옮길 수 없었습니다." }
          ],
          note: "명사를 앞세울 때는 관사를 붙이지 않습니다. A manager as he is 가 아니라 Manager as he is 입니다."
        },
        {
          h: "가정법 도치 — If 생략",
          body: "가정법에서 if를 생략하면 had, were, should가 주어 앞으로 나갑니다. 이 형태는 격식 있는 문어체에서 선호되며 조건의 뜻은 그대로 유지됩니다. if를 남겨 둔 채 도치까지 하면 틀린 문장이 되므로 둘 중 하나만 씁니다.",
          examples: [
            { en: "Had we known the risk, we would have insured the cargo.", ko: "위험을 알았더라면 화물에 보험을 들었을 것입니다." },
            { en: "Were I in your position, I would request a second review.", ko: "제가 당신의 입장이라면 재심사를 요청했을 것입니다." },
            { en: "Should the shipment be delayed, we will notify you.", ko: "배송이 지연되면 알려 드리겠습니다." }
          ],
          note: "Had we known 은 If we had known 과 같은 뜻이고, Were I 는 If I were 와 같은 뜻입니다."
        },
        {
          h: "도치가 일어나지 않는 경우",
          body: "주어가 대명사일 때는 장소 부사구 도치를 하지 않습니다. Only 뒤에 주어가 바로 오면 도치하지 않고, 부사구가 와야 도치합니다. 도치는 조동사 앞자리에 초점이 생길 때만 일어난다고 기억하면 구분이 쉬워집니다.",
          table: {
            head: ["구문", "도치 여부", "예문"],
            rows: [
              ["Here + 대명사 주어", "도치하지 않음", "Here it comes."],
              ["Here + 명사 주어", "도치함", "Here comes the manager."],
              ["Only + 주어", "도치하지 않음", "Only the manager can approve it."],
              ["Only + 부사구", "도치함", "Only after the audit did the errors surface."],
              ["Not only + 주절", "주절만 도치", "Not only did she lead the team, but she also trained it."]
            ]
          }
        }
      ],
      mistakes: [
        "부정어 도치에서 어순을 바꾸지 않는 실수 — Never I have seen 이 아니라 Never have I seen 입니다.",
        "도치 뒤에 본동사를 과거형으로 두는 실수 — Rarely did she missed 가 아니라 Rarely did she miss 입니다.",
        "Hardly 구문에서 when 대신 than 을 쓰는 실수 — Hardly ~ when, No sooner ~ than 짝을 지킵니다.",
        "주어가 대명사인데 장소 도치를 하는 실수 — Here comes he 가 아니라 Here he comes 입니다.",
        "if 를 남긴 채 도치하는 실수 — If had we known 이 아니라 Had we known 입니다."
      ],
      practice: [
        { q: "Never ____ such a detailed audit report submitted so quickly.", opts: ["we have seen", "have we seen", "we saw", "did we saw"], a: "have we seen", why: "부정어 Never 가 문두에 오면 조동사 have 가 주어 앞으로 나갑니다." },
        { q: "____ had the announcement been made when employees began to call.", opts: ["Hardly", "Rarely", "Almost", "Nearly"], a: "Hardly", why: "Hardly ~ when 구문에서 Hardly 가 문두에 오면 과거완료가 도치됩니다." },
        { q: "____ the contract be terminated early, all fees must be settled.", opts: ["Should", "Would", "Will", "Were"], a: "Should", why: "if 를 생략한 조건의 도치에서는 Should 가 주어 앞에 옵니다." },
        { q: "Only after the inspection ____ the safety issues clear.", opts: ["became", "did become", "becoming", "become"], a: "did become", why: "Only + 부사구가 문두에 오면 주절이 도치되고 과거이므로 did become 을 씁니다." },
        { q: "Rarely ____ a supplier deliver the full order ahead of schedule.", opts: ["does", "do", "is", "has"], a: "does", why: "부정어 Rarely 뒤에서 일반동사를 도치할 때 단수 주어 a supplier 에 맞춰 does 를 씁니다." },
        { q: "____ had the shipment left the dock than the storm warning was issued.", opts: ["No sooner", "Hardly", "Not until", "Only"], a: "No sooner", why: "than 과 짝을 이루는 표현은 No sooner 이고, 뒤에 과거완료가 도치됩니다." },
        { q: "On the top shelf ____ the archived contracts.", opts: ["is", "are", "be", "being"], a: "are", why: "장소 부사구 도치에서 동사는 뒤에 오는 복수 주어 the archived contracts 에 맞춥니다." },
        { q: "____ as he was, the technician stayed until the system was stable.", opts: ["Tired", "Tiring", "Tire", "Tiredly"], a: "Tired", why: "양보 도치에서 보어인 형용사 Tired 가 문두에 오고 as 가 뒤따릅니다." }
      ]
    },
    {
      no: 3,
      title: "가정법 심화",
      summary: "시점이 섞인 가정에는 혼합 가정법을 쓰고, as if와 but for로 다양한 가정을 표현합니다.",
      intro: "가정법은 시제만 정확히 맞추면 실수할 자리가 많지 않지만, 시점이 섞이거나 조동사가 바뀌면 판단이 흔들립니다. 이 과에서는 세 시제의 기본형을 다시 세운 뒤 혼합 가정법과 대체 표현까지 넓혀 갑니다. 조동사 선택 기준도 함께 정리해 문맥에 맞는 문장을 고릅니다.",
      points: [
        {
          h: "가정법 세 시제 한눈에 정리",
          body: "가정법은 사실의 반대를 시제로 구분합니다. 현재 사실의 반대는 과거형, 과거 사실의 반대는 had p.p.를 씁니다. if절과 주절의 짝을 형태로 외워 두면 동사 자리를 묻는 문제가 빠르게 풀립니다.",
          table: {
            head: ["시점", "if절", "주절", "예문"],
            rows: [
              ["현재 사실의 반대", "동사의 과거형", "would + 동사원형", "If the plan were simple, we would start today."],
              ["과거 사실의 반대", "had + p.p.", "would have + p.p.", "If we had tested it, we would have found the bug."],
              ["실현 가능성이 낮은 미래", "were to + 동사원형", "would + 동사원형", "If the deal were to fall through, we would regroup."]
            ]
          },
          note: "가정법에서 be동사는 주어와 상관없이 were 를 씁니다. If it was possible 보다 If it were possible 가 정확합니다."
        },
        {
          h: "혼합 가정법 — if절과 주절의 시점이 다를 때",
          body: "if절은 과거를 가정하는데 주절의 결과가 현재에 미치는 경우에는 had p.p.와 would + 동사원형을 짝지어 씁니다. 반대로 if절이 현재를 가정하고 결과가 과거에 머무는 형태도 있습니다. 두 시점이 섞이는 순간이므로 if절과 주절을 따로 판단해야 합니다.",
          table: {
            head: ["if절 시점", "주절 시점", "형태", "의미"],
            rows: [
              ["과거", "현재", "had p.p. / would + 동사원형", "그때 그렇게 했더라면 지금은 ~할 텐데"],
              ["현재", "과거", "동사의 과거형 / would have + p.p.", "지금 ~라면 그때 ~했을 텐데"],
              ["과거", "과거", "had p.p. / would have + p.p.", "그때 그렇게 했더라면 그때 ~했을 텐데"]
            ]
          },
          examples: [
            { en: "If we had invested in automation, we would be more competitive now.", ko: "자동화에 투자했더라면 지금 더 경쟁력이 있을 텐데요." },
            { en: "If he were not so cautious, he would have taken the offer last year.", ko: "그가 그렇게 신중하지 않았다면 작년에 그 제안을 받았을 것입니다." }
          ],
          note: "now, today 같은 현재 시점 표지가 주절에 보이면 혼합 가정법을 먼저 의심합니다."
        },
        {
          h: "as if / as though",
          body: "사실이 아닌 것을 마치 그런 듯이 표현할 때 씁니다. 현재 사실의 반대면 과거형, 과거 사실의 반대면 had p.p.를 씁니다. 실제로 그럴 가능성이 높으면 직설법 시제를 그대로 써도 되므로, 화자가 사실이라고 보는지가 시제를 가릅니다.",
          examples: [
            { en: "He speaks as if he owned the company.", ko: "그는 마치 회사를 소유한 것처럼 말합니다." },
            { en: "She looked as though she had not slept for days.", ko: "그녀는 며칠 동안 잠을 자지 않은 것처럼 보였습니다." },
            { en: "The machine sounds as if it needs repair.", ko: "그 기계는 수리가 필요한 것처럼 들립니다." }
          ],
          note: "as if 뒤에는 가정법 시제가 오지만, 실제 상황을 말할 때는 현재시제도 가능합니다. It looks as if it is going to rain. 처럼 씁니다."
        },
        {
          h: "but for / without / otherwise",
          body: "but for와 without은 if it were not for의 뜻으로 뒤에 명사구를 두고 주절에는 would를 씁니다. otherwise는 앞 문장의 내용을 조건으로 받아 '그러지 않았다면'의 뜻을 만듭니다. 세 표현 모두 가정법을 대신하는 대표적인 장치입니다.",
          examples: [
            { en: "But for the intern's quick action, we would have lost the client.", ko: "인턴의 빠른 대응이 없었다면 고객을 잃었을 것입니다." },
            { en: "Without proper maintenance, the machine would break down often.", ko: "제대로 정비하지 않으면 그 기계는 자주 고장 날 것입니다." },
            { en: "The invoice was paid on time; otherwise the discount would have been lost.", ko: "송장은 제때 지급되었습니다. 그렇지 않았다면 할인을 받지 못했을 것입니다." }
          ],
          note: "but for 뒤에는 절이 아니라 명사구가 옵니다. 절을 쓰려면 If it had not been for the intern 으로 바꿉니다."
        },
        {
          h: "It is time / would rather / if only",
          body: "It is time 뒤에는 과거형을 써서 지금 해야 할 일을 나타내고, would rather 뒤에도 과거형을 써서 현재의 소망을 표현합니다. if only는 '~라면 얼마나 좋을까'라는 강한 소망을 나타내며 시제 짝은 가정법과 같습니다.",
          table: {
            head: ["표현", "뒤에 오는 형태", "예문"],
            rows: [
              ["It is time + 주어", "동사의 과거형", "It is time we reviewed the safety protocol."],
              ["would rather + 주어", "동사의 과거형", "I would rather you handled the negotiation."],
              ["if only", "동사의 과거형 / had p.p.", "If only we had filed the claim earlier."],
              ["wish", "동사의 과거형 / had p.p.", "I wish the vendor had confirmed in writing."]
            ]
          }
        },
        {
          h: "가정의 강도에 따라 조동사 고르기",
          body: "would는 결과와 의지, could는 능력과 가능성, might는 약한 가능성을 나타냅니다. 같은 가정이라도 조동사를 바꾸면 가능성의 정도가 달라지므로 문맥에 맞게 골라야 합니다. should는 격식 문어체에서 조건을 완곡하게 표현할 때도 씁니다.",
          table: {
            head: ["조동사", "의미", "예문"],
            rows: [
              ["would", "결과·의지", "We would reduce costs if we merged the teams."],
              ["could", "능력·가능성", "We could finish early if the data arrived today."],
              ["might", "약한 가능성", "The risk might fall if the supplier changed."],
              ["should", "완곡한 조건", "Should the vendor withdraw, we will rebid."]
            ]
          }
        }
      ],
      mistakes: [
        "혼합 가정법에서 if절에 과거완료 대신 과거형을 쓰는 실수 — 과거의 가정에는 had p.p. 를 씁니다.",
        "It is time 뒤에 동사원형을 쓰는 실수 — It is time we review 가 아니라 It is time we reviewed 입니다.",
        "가정법에서 be동사를 was 로 쓰는 실수 — If it was possible 보다 If it were possible 가 정확합니다.",
        "but for 뒤에 절을 두는 실수 — but for 뒤에는 명사구가 옵니다.",
        "as if 뒤 시제를 직설법으로 고정하는 실수 — 사실의 반대를 나타낼 때는 과거형이나 had p.p. 를 씁니다."
      ],
      practice: [
        { q: "If the firm had adopted the new standard earlier, it ____ fewer compliance issues today.", opts: ["would have", "would have had", "will have", "had"], a: "would have", why: "과거의 가정이 현재 결과로 이어지는 혼합 가정법이므로 주절에 would + 동사원형을 씁니다." },
        { q: "The new hire talks ____ he had run the department for years.", opts: ["as if", "even if", "unless", "in case"], a: "as if", why: "사실이 아닌 것을 가정하는 as if 뒤에는 과거완료가 옵니다." },
        { q: "____ the timely warning, the crew would not have evacuated.", opts: ["But for", "Because of", "In spite of", "Apart from"], a: "But for", why: "명사구를 두고 가정의 뜻을 나타내는 표현은 But for 입니다." },
        { q: "If the supplier ____ the revised terms, we would have signed last week.", opts: ["accepts", "had accepted", "accepted", "would accept"], a: "had accepted", why: "과거 사실의 반대를 가정하므로 if절에 had p.p. 를 씁니다." },
        { q: "It is time the committee ____ the safety report.", opts: ["reviews", "reviewed", "will review", "reviewing"], a: "reviewed", why: "It is time 뒤에는 과거형을 써서 지금 해야 할 일을 나타냅니다." },
        { q: "____ the funding be cut, the pilot program will be suspended.", opts: ["Should", "Would", "Were", "Had"], a: "Should", why: "미래의 가능성이 낮은 조건을 완곡하게 표현할 때 Should 를 주어 앞에 둡니다." },
        { q: "Without the backup generator, the site ____ during the outage.", opts: ["would fail", "will fail", "fails", "failed"], a: "would fail", why: "without 뒤 명사구가 만드는 가정이므로 주절에 would + 동사원형을 씁니다." },
        { q: "I wish the branch ____ the revised policy before the audit.", opts: ["adopts", "had adopted", "will adopt", "adopting"], a: "had adopted", why: "이미 지난 일에 대한 소망이므로 wish 뒤에 had p.p. 를 씁니다." }
      ]
    },
    {
      no: 4,
      title: "명사절 심화 — that과 what",
      intro: "명사절 문제는 접속사 선택 하나로 갈립니다. 빈칸 뒤 절에 주어나 목적어가 빠져 있는지 보는 습관만 들이면 that과 what을 빠르게 구분할 수 있습니다. 여기에 동격의 that, 요구 동사 뒤의 원형, 전치사 뒤의 명사절까지 더해 문장 전체를 다룹니다.",
      summary: "that절은 완전한 문장을, what절은 불완전한 문장을 이끕니다. 동격의 that으로 명사 내용을 설명하고, 요구·주장 동사 뒤에는 원형을 씁니다.",
      points: [
        {
          h: "that절과 what절의 구분",
          body: "that은 뒤에 주어와 동사가 모두 있는 완전한 절을 이끕니다. what은 주어나 목적어가 빠진 불완전한 절을 이끌고 그 자리를 스스로 채웁니다. 빈칸 뒤 절의 완전성만 확인하면 두 접속사를 빠르게 가릅니다.",
          table: {
            head: ["접속사", "뒤의 구조", "예문", "해석"],
            rows: [
              ["that", "완전한 절", "I know that the plan works.", "그 계획이 통한다는 것을 압니다."],
              ["what", "불완전한 절", "I know what the plan requires.", "그 계획이 무엇을 요구하는지 압니다."],
              ["whether", "완전한 절", "I do not know whether the plan works.", "그 계획이 통하는지 모릅니다."]
            ]
          },
          note: "requires 뒤에 목적어가 없으면 what, works 처럼 동사 뒤가 비어 있지 않으면 that 입니다."
        },
        {
          h: "동격의 that",
          body: "fact, idea, belief, news, evidence, rumor 같은 명사 뒤에서 그 내용을 설명하는 절을 이끕니다. 이때 that은 생략할 수 없고 콤마 없이 바로 붙여 씁니다. 명사와 that절이 같은 내용을 가리키는지 확인하는 것이 핵심입니다.",
          examples: [
            { en: "The evidence that sales declined alarmed the board.", ko: "매출이 줄었다는 증거가 이사회를 놀라게 했습니다." },
            { en: "We support the idea that employees should vote on the policy.", ko: "우리는 직원들이 정책에 투표해야 한다는 의견을 지지합니다." },
            { en: "The rumor that the plant would close spread quickly.", ko: "공장이 문을 닫는다는 소문이 빠르게 퍼졌습니다." }
          ],
          note: "동격의 that 은 생략하지 않습니다. the fact the deadline changed 가 아니라 the fact that the deadline changed 입니다."
        },
        {
          h: "가주어 It 과 that절",
          body: "that절이 주어로 오면 문장이 길어지므로 가주어 It을 써서 뒤로 보냅니다. It is + 형용사 + that + 주어 + 동사 형태가 기본이며, 공지문과 회의 자료에서 자주 나옵니다. 진주어를 문장 앞에 그대로 두어도 문법적으로는 맞지만 무게가 앞으로 쏠립니다.",
          examples: [
            { en: "It is essential that all staff complete the training.", ko: "모든 직원이 교육을 이수하는 것이 필수입니다." },
            { en: "It is likely that the delivery will slip by two days.", ko: "배송이 이틀 늦어질 것 같습니다." },
            { en: "It was clear that the vendor had not read the specification.", ko: "그 공급업체가 사양서를 읽지 않았다는 것이 분명했습니다." }
          ],
          note: "가주어 It 을 쓸 때 진주어 that 은 생략하지 않습니다. It is essential all staff complete 는 격식 문장에서 피합니다."
        },
        {
          h: "요구·주장 동사 뒤의 동사원형",
          body: "demand, insist, recommend, request, suggest, propose, require 뒤의 that절에는 should가 생략된 동사원형이 옵니다. 수동의 뜻이 필요하면 be + p.p. 형태를 씁니다. 이때 동사에 -s나 -ed를 붙이면 틀린 문장이 되므로 주의합니다.",
          table: {
            head: ["동사", "that절 형태", "예문"],
            rows: [
              ["recommend", "동사원형", "The board recommended that the policy be revised."],
              ["insist", "동사원형", "The client insisted that the invoice be resent."],
              ["require", "동사원형", "The standard requires that every batch be tested."],
              ["suggest", "동사원형", "She suggested that the meeting be moved."]
            ]
          },
          note: "should 를 넣어도 같은 뜻입니다. The board recommended that the policy should be revised."
        },
        {
          h: "전치사 뒤의 명사절",
          body: "that절은 전치사의 목적어로 쓸 수 없습니다. 이때는 the fact that이나 what절로 바꿔 씁니다. whether절은 전치사 뒤에도 올 수 있으므로 예외로 기억해 둡니다.",
          examples: [
            { en: "We focused on what the customer actually needed.", ko: "우리는 고객이 실제로 필요로 하는 것에 집중했습니다." },
            { en: "She insisted on the fact that the deadline had changed.", ko: "그녀는 마감이 바뀌었다는 사실을 강조했습니다." },
            { en: "The choice depends on whether the budget is approved.", ko: "그 선택은 예산이 승인되는지에 달려 있습니다." }
          ],
          note: "전치사 뒤에 that 을 그대로 두면 틀립니다. about that the plan works 가 아니라 about the fact that the plan works 입니다."
        },
        {
          h: "간접의문문의 어순",
          body: "의문사가 이끄는 명사절은 평서문 어순으로 씁니다. 조동사가 없으면 do, does, did를 넣지 않고 동사에 시제를 표시합니다. 이 어순 오류는 Part 5·6에서 반복적으로 출제되므로 소리 내어 익혀 두는 편이 좋습니다.",
          examples: [
            { en: "The consultant asked when the shipment would arrive.", ko: "컨설턴트는 배송이 언제 도착할지 물었습니다." },
            { en: "Please confirm how much the service costs.", ko: "그 서비스가 얼마인지 확인해 주세요." },
            { en: "I wonder why the report was delayed.", ko: "보고서가 왜 지연되었는지 궁금합니다." }
          ],
          note: "의문사 뒤에는 주어가 먼저 옵니다. asked when would the shipment arrive 가 아니라 asked when the shipment would arrive 입니다."
        },
        {
          h: "whether 와 if 의 쓰임",
          body: "whether는 명사절과 전치사 뒤에서 모두 쓸 수 있지만, if는 동사의 목적어 자리에서만 쓸 수 있습니다. 문어체에서는 whether를 선호하며, 주어 자리나 전치사 뒤에는 if를 쓸 수 없습니다. whether or not 형태는 격식 문장에서 자주 보입니다.",
          table: {
            head: ["자리", "whether", "if"],
            rows: [
              ["동사의 목적어", "가능", "가능"],
              ["전치사의 목적어", "가능", "쓸 수 없음"],
              ["문장의 주어", "가능", "쓸 수 없음"],
              ["whether or not 형태", "가능", "제한적"]
            ]
          }
        }
      ],
      mistakes: [
        "완전한 절에 what 을 쓰는 실수 — I know what the plan works 가 아니라 I know that the plan works 입니다.",
        "동격의 that 을 생략하는 실수 — 동격절의 that 은 남겨 둡니다.",
        "요구 동사 뒤에 -s 를 붙이는 실수 — recommended that the policy is revised 가 아니라 be revised 입니다.",
        "전치사 뒤에 that 절을 그대로 두는 실수 — the fact that 이나 what 으로 바꿔 씁니다.",
        "간접의문문에 do 를 넣는 실수 — asked when did the shipment arrive 가 아니라 asked when the shipment arrived 입니다."
      ],
      practice: [
        { q: "The consultant explained ____ the new system would affect daily operations.", opts: ["what", "that", "which", "whether"], a: "that", why: "뒤에 주어와 동사가 모두 있는 완전한 절이 오므로 that 을 씁니다." },
        { q: "We should clarify ____ the client expects before signing the contract.", opts: ["that", "what", "whether", "because"], a: "what", why: "expects 의 목적어가 빠진 불완전한 절이므로 what 을 씁니다." },
        { q: "The management insisted that the report ____ by Friday.", opts: ["is submitted", "be submitted", "submits", "submitting"], a: "be submitted", why: "요구를 나타내는 동사 뒤 that절에는 should 가 생략된 원형이 오고 보고서는 제출되는 대상이므로 be submitted 입니다." },
        { q: "The team reviewed ____ the new policy would apply to contractors.", opts: ["that", "what", "whether", "which"], a: "whether", why: "적용되는지 아닌지를 나타내는 완전한 절이므로 whether 를 씁니다." },
        { q: "It is important ____ every visitor sign in at the front desk.", opts: ["that", "what", "which", "whether"], a: "that", why: "가주어 It 뒤의 진주어 절을 이끄는 접속사는 that 입니다." },
        { q: "The decision depends on ____ the supplier can meet the deadline.", opts: ["that", "what", "if", "whether"], a: "whether", why: "전치사 뒤에는 if 를 쓸 수 없고 whether 를 씁니다." },
        { q: "The witness described ____ happened during the inspection.", opts: ["that", "what", "which", "whether"], a: "what", why: "happened 앞에 주어가 빠진 불완전한 절이므로 what 을 씁니다." },
        { q: "The analyst asked how the budget ____ allocated last quarter.", opts: ["was", "were", "is it", "did"], a: "was", why: "간접의문문은 평서문 어순을 쓰므로 주어 the budget 뒤에 과거 수동 was 를 둡니다." }
      ]
    },
    {
      no: 5,
      title: "복합관계사",
      intro: "복합관계사는 선행사와 접속사를 한 단어에 담아 문장을 짧게 만듭니다. whoever와 whatever는 명사절과 양보절에서 모두 쓰이므로, 뒤에 오는 절이 완전한지부터 확인하면 역할이 갈립니다. however와 no matter how의 차이까지 정리해 두면 어휘 문제에서도 흔들리지 않습니다.",
      summary: "복합관계사는 선행사를 포함하며 명사절과 양보절을 이끕니다. -ever가 붙으면 '무엇이든, 누구든'의 뜻이 되고, however 뒤에는 형용사나 부사가 옵니다.",
      points: [
        {
          h: "복합관계사의 종류와 역할",
          body: "whoever, whatever, whichever는 선행사를 포함해 명사절의 주어나 목적어가 됩니다. whenever, wherever, however는 부사절을 이끌어 시간·장소·양보의 뜻을 만듭니다. 명사절인지 부사절인지에 따라 문장에서 차지하는 자리가 달라지므로 뒤 절의 구조를 먼저 봅니다.",
          table: {
            head: ["표현", "뜻", "쓰이는 자리", "예문"],
            rows: [
              ["whoever", "누구든지", "명사절(주격)", "Whoever applied first will be contacted."],
              ["whomever", "누구든지", "명사절(목적격)", "We will hire whomever the panel selects."],
              ["whatever", "무엇이든지", "명사절(주격·목적격)", "Whatever you decide is fine with us."],
              ["whichever", "어느 것이든", "명사절(한정)", "Whichever option you choose, the fee is the same."],
              ["however", "아무리 ~해도", "양보 부사절", "However hard he tried, the error remained."]
            ]
          },
          note: "주어 자리에는 whoever, 목적어 자리에는 whomever 를 씁니다. 뒤 절에 주어가 없으면 whoever 입니다."
        },
        {
          h: "명사절을 이끄는 복합관계대명사",
          body: "whoever와 whatever가 이끄는 절은 문장의 주어나 목적어로 쓰입니다. 이때 절 안에서 빠진 자리를 복합관계대명사가 채우므로 뒤 절은 불완전합니다. 단수 취급을 원칙으로 하되, 뜻이 복수면 복수 동사를 쓰기도 합니다.",
          examples: [
            { en: "Whoever applies first will be contacted by the recruiter.", ko: "먼저 지원한 사람이 채용 담당자의 연락을 받습니다." },
            { en: "The committee will approve whatever the finance team proposes.", ko: "위원회는 재무팀이 제안하는 것은 무엇이든 승인할 것입니다." },
            { en: "Whichever branch you visit, the process is identical.", ko: "어느 지점을 방문하든 절차는 동일합니다." }
          ],
          note: "whatever 뒤에는 명사가 바로 올 수도 있습니다. Whatever cost it takes, we will finish on time. 처럼 씁니다."
        },
        {
          h: "however + 형용사·부사",
          body: "however 뒤에는 반드시 형용사나 부사가 옵니다. 양보의 뜻을 나타내는 문어체 표현으로, 형용사가 오면 그 뒤에 주어와 동사가 이어집니다. however를 접속부사 '그러나'로 쓰는 경우와 구분해야 하므로 문장 안에서의 위치를 확인합니다.",
          examples: [
            { en: "However carefully the team checked, one entry was missed.", ko: "팀이 아무리 꼼꼼히 확인해도 한 항목이 빠졌습니다." },
            { en: "However experienced the staff are, they need clear guidelines.", ko: "직원들이 아무리 숙련되어 있어도 명확한 지침이 필요합니다." },
            { en: "However late the shipment arrives, the night crew will handle it.", ko: "배송이 아무리 늦게 도착해도 야간 조가 처리합니다." }
          ],
          note: "However he tried hard 는 틀리고 However hard he tried 가 맞습니다. 형용사·부사가 however 바로 뒤에 옵니다."
        },
        {
          h: "양보의 복합관계부사",
          body: "wherever, whenever, no matter how는 모두 양보의 뜻을 만들 수 있습니다. 문어체에서는 -ever 형태를 선호하고, 회화에서는 no matter 형태가 자주 쓰입니다. 부사절이므로 문장에서 빠져도 주절의 구조는 그대로 남습니다.",
          examples: [
            { en: "Wherever the branch is located, the same rules apply.", ko: "지점이 어디에 있든 같은 규칙이 적용됩니다." },
            { en: "Whenever the system fails, we log the incident.", ko: "시스템이 실패할 때마다 우리는 사고를 기록합니다." },
            { en: "No matter how tight the schedule is, safety checks are not skipped.", ko: "일정이 아무리 빠듯해도 안전 점검은 건너뛰지 않습니다." }
          ]
        },
        {
          h: "-ever 형태와 no matter 형태의 차이",
          body: "-ever 형태는 명사절과 부사절을 모두 이끌 수 있지만, no matter 형태는 양보 부사절만 이끕니다. 그래서 문장의 주어나 목적어 자리에는 no matter를 쓸 수 없습니다. 두 표현의 뜻이 같아 보여도 자리가 다르다는 점이 핵심입니다.",
          table: {
            head: ["표현", "명사절", "양보 부사절"],
            rows: [
              ["whatever", "가능", "가능"],
              ["whoever", "가능", "가능"],
              ["no matter what", "쓸 수 없음", "가능"],
              ["no matter who", "쓸 수 없음", "가능"]
            ]
          },
          note: "No matter what happens 은 부사절이지만, What happens next 은 명사절입니다."
        },
        {
          h: "복합관계형용사 — whatever + 명사",
          body: "whatever와 whichever가 명사 앞에 붙으면 '무엇이든지 ~'라는 뜻의 한정어가 됩니다. 뒤에 명사가 오면 그 명사의 수에 동사를 맞춥니다. 이 형태는 선택의 자유를 강조할 때 자주 쓰입니다.",
          examples: [
            { en: "You can use whatever tools are available in the lab.", ko: "실험실에 있는 어떤 도구든 자유롭게 쓸 수 있습니다." },
            { en: "Whichever vendor you select, the lead time stays the same.", ko: "어느 공급업체를 선택하든 납기는 같습니다." },
            { en: "Take whatever measures are necessary to protect the data.", ko: "데이터를 보호하는 데 필요한 조치는 무엇이든 취하십시오." }
          ]
        }
      ],
      mistakes: [
        "However he tried hard 처럼 however 뒤 어순을 잘못 쓰는 실수 — However hard he tried 입니다.",
        "주어 자리에 whomever 를 쓰는 실수 — 절 안에서 주어 역할을 하면 Whoever 입니다.",
        "명사절 자리에 no matter what 을 쓰는 실수 — 주어·목적어 자리에는 whatever 를 씁니다.",
        "whatever 뒤 명사의 수와 동사를 어긋나게 쓰는 실수 — Whatever tools are available 처럼 복수 명사에 are 를 씁니다.",
        "whenever 와 however 를 바꿔 쓰는 실수 — 시간이면 whenever, 정도나 양보면 however 입니다."
      ],
      practice: [
        { q: "____ the cost, the company decided to proceed with the upgrade.", opts: ["Whatever", "Whoever", "However", "Whenever"], a: "Whatever", why: "뒤에 명사 the cost 가 오고 비용이 무엇이든이라는 뜻이므로 Whatever 를 씁니다." },
        { q: "____ complex the dataset is, the tool can analyze it.", opts: ["However", "Whatever", "Whenever", "Wherever"], a: "However", why: "However 뒤에 형용사 complex 가 오면 아무리 ~해도라는 양보의 뜻이 됩니다." },
        { q: "____ completes the safety module first will receive the certificate.", opts: ["Whoever", "Whomever", "Whatever", "Whichever"], a: "Whoever", why: "뒤 절에서 주어 역할을 하는 사람을 나타내므로 주격 Whoever 를 씁니다." },
        { q: "The panel will endorse ____ the director nominates.", opts: ["whoever", "whomever", "whatever", "whichever"], a: "whomever", why: "nominates 의 목적어 자리이므로 목적격 whomever 를 씁니다." },
        { q: "The recycling policy applies ____ the office is located.", opts: ["wherever", "whatever", "whichever", "whoever"], a: "wherever", why: "장소를 가리키는 양보절이므로 wherever 를 씁니다." },
        { q: "____ the system fails, the backup server takes over automatically.", opts: ["Whenever", "Whatever", "Whichever", "Whoever"], a: "Whenever", why: "반복되는 시간 상황을 나타내므로 Whenever 가 맞습니다." },
        { q: "You may attach ____ documents support your application.", opts: ["whatever", "whichever one", "however", "whoever"], a: "whatever", why: "뒤에 명사 documents 가 오는 복합관계형용사 자리이므로 whatever 를 씁니다." },
        { q: "____ tight the schedule is, the safety check is not skipped.", opts: ["However", "Whatever", "Whenever", "Wherever"], a: "However", why: "however 바로 뒤에 형용사 tight 가 와서 아무리 ~해도라는 양보 뜻을 만듭니다." }
      ]
    },
    {
      no: 6,
      title: "준동사의 완료·수동·부정",
      intro: "준동사는 동사가 시제와 태를 잃지 않고 문장 속에서 명사·형용사·부사 역할을 하는 형태입니다. 시제가 앞서면 완료형, 주어가 당하면 수동형을 씁니다. 이 조합을 정확히 쓰면 보고서 문장 한 줄이 훨씬 정확해집니다.",
      summary: "준동사는 시제와 태를 함께 표현할 수 있습니다. 완료형은 앞선 시점, 수동형은 당하는 관계를 나타내고, 부정은 준동사 앞에 not을 둡니다.",
      points: [
        {
          h: "완료부정사 — to have p.p.",
          body: "주절의 시점보다 앞선 일을 나타낼 때 to have p.p.를 씁니다. seem, appear, believe, be said, be thought 뒤에서 자주 나오며, 과거 사실에 대한 추측을 표현합니다. yesterday나 last week 같은 과거 표지가 보이면 완료부정사를 먼저 의심합니다.",
          table: {
            head: ["형태", "의미", "예문"],
            rows: [
              ["to have p.p.", "앞선 시점", "He seems to have forgotten the deadline."],
              ["to be -ing", "진행", "The team is said to be working remotely."],
              ["to have been -ing", "앞선 시점부터 진행", "She is believed to have been negotiating for weeks."]
            ]
          },
          note: "He seems to forget the deadline yesterday. 는 틀립니다. 앞선 시점이므로 to have forgotten 을 씁니다."
        },
        {
          h: "수동부정사 — to be p.p.",
          body: "준동사의 주체가 동작을 당하면 to be p.p.를 씁니다. need, require, expect, want 뒤에서 수동의 뜻이 필요할 때 자주 등장합니다. 능동으로 보이는 동사 뒤에서도 주어가 당하는 대상이면 수동부정사를 써야 합니다.",
          examples: [
            { en: "The report needs to be signed by both parties.", ko: "그 보고서는 양측의 서명을 받아야 합니다." },
            { en: "All samples are expected to be shipped by Friday.", ko: "모든 샘플은 금요일까지 발송될 예정입니다." },
            { en: "The device requires to be calibrated before use.", ko: "그 장치는 사용 전에 교정이 필요합니다." }
          ],
          note: "The report needs to sign 은 주어가 서명하는 주체가 아니므로 틀립니다. to be signed 로 씁니다."
        },
        {
          h: "수동동명사 — being p.p.",
          body: "동명사가 나타내는 동작을 주어가 당하면 being p.p.를 씁니다. 전치사의 목적어로 자주 오며, avoid, dislike, prevent, insist on 뒤에서 자주 보입니다. 동명사 앞에 전치사가 있으면 그 뒤는 반드시 명사 역할을 하는 형태여야 합니다.",
          examples: [
            { en: "She dislikes being interrupted during presentations.", ko: "그녀는 발표 중에 방해받는 것을 싫어합니다." },
            { en: "The team avoided being penalized by submitting early.", ko: "팀은 일찍 제출해 감점을 피했습니다." },
            { en: "The staff insisted on being informed before the change.", ko: "직원들은 변경 전에 통보받아야 한다고 주장했습니다." }
          ]
        },
        {
          h: "완료동명사 — having p.p.",
          body: "동명사가 나타내는 일이 주절보다 앞설 때 having p.p.를 씁니다. 문장의 주어로도 쓰이고, deny, admit, regret, recall 뒤에서도 자주 나옵니다. 시점이 이미 지난 일임을 분명히 하고 싶을 때 특히 유용합니다.",
          examples: [
            { en: "Having completed the audit was a requirement for promotion.", ko: "감사를 마치는 것이 승진의 요건이었습니다." },
            { en: "He denied having received the confidential file.", ko: "그는 기밀 파일을 받은 사실을 부인했습니다." },
            { en: "She regrets having mentioned the cost in the meeting.", ko: "그녀는 회의에서 비용을 언급한 것을 후회합니다." }
          ]
        },
        {
          h: "부정 준동사의 위치",
          body: "준동사의 부정은 to 앞이나 -ing 앞에 not을 둡니다. 부정어를 준동사 안쪽에 넣으면 어색한 문장이 되므로 위치를 고정해 두는 편이 좋습니다. never를 쓰면 강한 부정을 나타낼 수 있습니다.",
          examples: [
            { en: "The staff were told not to share access codes.", ko: "직원들은 접속 코드를 공유하지 말라는 지시를 받았습니다." },
            { en: "Not having read the manual caused several errors.", ko: "설명서를 읽지 않은 것이 여러 오류를 일으켰습니다." },
            { en: "The vendor promised never to delay the shipment again.", ko: "그 공급업체는 배송을 다시는 지연하지 않겠다고 약속했습니다." }
          ],
          note: "부정의 to부정사는 not to make 이고, 만들다(to make)와 구분됩니다. not making 은 동명사의 부정입니다."
        },
        {
          h: "준동사 시제·태 한눈에 정리",
          body: "부정사와 동명사의 시제·태 조합을 표로 모아 두면 빈칸 문제에서 형태를 빠르게 고를 수 있습니다. 주절과의 시간 관계, 그리고 주어와의 태 관계를 차례로 확인하는 것이 순서입니다.",
          table: {
            head: ["형태", "부정사", "동명사"],
            rows: [
              ["단순 능동", "to review", "reviewing"],
              ["단순 수동", "to be reviewed", "being reviewed"],
              ["완료 능동", "to have reviewed", "having reviewed"],
              ["완료 수동", "to have been reviewed", "having been reviewed"],
              ["부정", "not to review", "not reviewing"]
            ]
          }
        }
      ],
      mistakes: [
        "앞선 시점에 단순부정사를 쓰는 실수 — He seems to forget the deadline yesterday. 가 아니라 to have forgotten 입니다.",
        "부정 위치를 잘못 두는 실수 — Not to have read the manual caused errors. 보다 Not having read the manual caused errors. 가 자연스럽습니다.",
        "주어가 당하는 대상인데 능동부정사를 쓰는 실수 — The form needs to submit 이 아니라 to be submitted 입니다.",
        "전치사 뒤에 동사원형을 쓰는 실수 — insisted on inform 이 아니라 insisted on being informed 입니다.",
        "완료동명사와 완료부정사를 섞는 실수 — deny 뒤에는 having p.p. 를, seem 뒤에는 to have p.p. 를 씁니다."
      ],
      practice: [
        { q: "The vendor appears ____ the specification before shipping the parts.", opts: ["to misread", "to have misread", "misreading", "to be misreading"], a: "to have misread", why: "출하보다 사양을 잘못 읽은 일이 앞서므로 완료부정사를 씁니다." },
        { q: "The equipment requires ____ every six months.", opts: ["to inspect", "to be inspected", "inspecting it", "inspect"], a: "to be inspected", why: "장비는 점검받는 대상이므로 수동부정사 to be inspected 를 씁니다." },
        { q: "The director was advised ____ the decision without consulting legal.", opts: ["not to make", "to not made", "not making", "no to make"], a: "not to make", why: "부정의 to부정사는 to 앞에 not 을 두어 not to make 로 씁니다." },
        { q: "The audit is reported ____ three major gaps in the process.", opts: ["to find", "to have found", "finding", "to be found"], a: "to have found", why: "감사가 이미 끝나 갭을 찾아낸 앞선 일이므로 완료부정사를 씁니다." },
        { q: "The interns objected to ____ overtime without prior notice.", opts: ["ask", "being asked", "be asked", "asking"], a: "being asked", why: "전치사 to 뒤에서 인턴들이 요청받는 대상이므로 수동동명사 being asked 를 씁니다." },
        { q: "The manager denied ____ the cost estimate before the bid.", opts: ["having revised", "to revise", "revise", "to have revising"], a: "having revised", why: "입찰 전에 이미 수정한 일을 부인하는 문맥이므로 완료동명사 having revised 를 씁니다." },
        { q: "All visitors are required ____ the badge at the front desk.", opts: ["to be collected", "to collect", "collecting", "collect"], a: "to collect", why: "방문객이 배지를 직접 받는 주체이므로 능동부정사 to collect 를 씁니다." },
        { q: "The new policy allows the data ____ without prior approval.", opts: ["to be shared", "to share", "sharing", "share"], a: "to be shared", why: "데이터는 공유되는 대상이므로 수동부정사 to be shared 가 맞습니다." }
      ]
    },
    {
      no: 7,
      title: "강조·생략·대용",
      intro: "같은 내용도 무엇을 강조하느냐에 따라 문장의 초점이 달라집니다. It ~ that 강조구문과 do 강조는 초점을 옮기고, 대부정사와 대동사는 반복을 줄입니다. 이 세 장치를 알면 문장을 짧고 분명하게 다시 쓸 수 있습니다.",
      summary: "It ~ that 강조구문과 do 강조로 초점을 옮기고, 대부정사 to와 대동사 do로 반복을 줄입니다. 접속사 뒤의 반복 요소는 생략할 수 있습니다.",
      points: [
        {
          h: "It ~ that 강조구문",
          body: "강조할 요소를 It is와 that 사이에 넣으면 그 부분이 초점이 됩니다. 사람이면 that 대신 who를 쓸 수 있지만, 장소·시간에는 where나 when을 쓰지 않고 that을 씁니다. 원래 문장에서 어떤 요소를 강조했는지 찾는 문제로 자주 출제됩니다.",
          table: {
            head: ["원래 문장", "강조구문", "강조한 요소"],
            rows: [
              ["The assistant sent the file.", "It was the assistant that sent the file.", "주어"],
              ["We met the client in Busan.", "It was in Busan that we met the client.", "장소"],
              ["She called me last Friday.", "It was last Friday that she called me.", "시간"]
            ]
          },
          note: "장소를 강조할 때도 where 를 쓰지 않습니다. It was in Busan where we met 이 아니라 It was in Busan that we met 입니다."
        },
        {
          h: "do 강조",
          body: "일반동사 앞에 do, does, did를 넣어 뜻을 강조합니다. 뒤에 오는 동사는 반드시 원형이고, 시제는 do에 표시됩니다. 부정문이나 의문문에서 쓰는 조동사와 형태는 같지만 기능이 다릅니다.",
          examples: [
            { en: "We do appreciate your patience during the renovation.", ko: "공사 기간 동안 인내해 주신 점에 정말 감사드립니다." },
            { en: "The manager did approve the request before leaving.", ko: "부장님은 퇴근 전에 그 요청을 실제로 승인했습니다." },
            { en: "The team does check every shipment twice.", ko: "그 팀은 모든 배송을 실제로 두 번 확인합니다." }
          ],
          note: "do 강조 뒤에는 반드시 원형입니다. The manager did approved 가 아니라 did approve 입니다."
        },
        {
          h: "대부정사 to",
          body: "앞에 나온 to부정사를 반복할 때는 to만 남기고 뒤 동사를 생략합니다. 이때 to는 전치사가 아니라 부정사의 흔적으로, 뒤에 목적어가 없어도 됩니다. 회화와 문어체 모두에서 자연스럽게 쓰입니다.",
          examples: [
            { en: "You may submit the form early if you wish to.", ko: "원하시면 양식을 일찍 제출하셔도 됩니다." },
            { en: "She asked me to join the call, and I agreed to.", ko: "그녀가 통화에 참여해 달라고 했고 저는 그러기로 했습니다." },
            { en: "We do not need to revise the draft unless you want us to.", ko: "원하시는 것이 아니라면 초안을 수정할 필요는 없습니다." }
          ],
          note: "be동사 뒤에서는 부정사 to 를 그대로 두면 어색하므로 to be 형태를 남기기도 합니다. The plan is simpler than it used to be."
        },
        {
          h: "대동사 do와 so 도치",
          body: "반복되는 동사는 do, does, did로 대신합니다. '나도 그렇다'는 so + 조동사 + 주어 어순으로 도치하고, '나도 그렇지 않다'는 neither나 nor를 씁니다. 앞 문장의 시제와 조동사를 그대로 물려받는 것이 규칙입니다.",
          examples: [
            { en: "The Seoul team met the target, and so did the Busan team.", ko: "서울 팀이 목표를 달성했고 부산 팀도 그랬습니다." },
            { en: "The vendor has not replied, and neither has the carrier.", ko: "공급업체가 답하지 않았고 운송사도 마찬가지입니다." },
            { en: "She reviews the figures every Friday, and so do I.", ko: "그녀는 매주 금요일 수치를 검토하고 저도 그렇습니다." }
          ]
        },
        {
          h: "반복 요소의 생략",
          body: "접속사로 이어진 절에서 같은 주어나 조동사, 전치사는 생략할 수 있습니다. 문어체에서 문장이 간결해지고 리듬이 좋아집니다. 다만 생략한 요소가 서로 다르면 뜻이 흐려지므로 같은 것만 지웁니다.",
          examples: [
            { en: "The plan was approved and the budget released.", ko: "계획이 승인되고 예산이 배정되었습니다." },
            { en: "We will review the draft and publish the final version.", ko: "우리는 초안을 검토하고 최종본을 게시할 것입니다." },
            { en: "The staff were briefed on Monday and the managers on Tuesday.", ko: "직원들은 월요일에, 관리자들은 화요일에 설명을 들었습니다." }
          ],
          note: "조동사가 같은지 확인한 뒤 생략합니다. was approved and released 처럼 수동태도 조동사가 같으면 줄일 수 있습니다."
        },
        {
          h: "강조와 도치의 결합",
          body: "부사구를 문두로 보내 강조하면 도치가 함께 일어납니다. 초점이 앞으로 이동하고 문장이 격식 있게 들립니다. 앞에서 배운 부정어 도치와 같은 원리이므로 함께 익혀 두면 좋습니다.",
          examples: [
            { en: "Only after the audit did the errors become clear.", ko: "감사 이후에야 오류가 분명해졌습니다." },
            { en: "Not until the second test did the defect appear.", ko: "두 번째 시험에 이르러서야 결함이 나타났습니다." },
            { en: "Under no circumstances should the seal be broken.", ko: "어떤 상황에서도 봉인을 개봉해서는 안 됩니다." }
          ]
        }
      ],
      mistakes: [
        "It was in Busan where we met. 처럼 강조구문에 where 를 쓰는 실수 — It was in Busan that we met 입니다.",
        "do 강조 뒤에 과거형을 쓰는 실수 — The manager did approved 가 아니라 did approve 입니다.",
        "so 도치에서 어순을 바꾸지 않는 실수 — and so the Busan team did 가 아니라 and so did the Busan team 입니다.",
        "생략할 수 없는 요소를 지우는 실수 — 주어나 조동사가 다르면 생략하지 않습니다.",
        "neither 뒤에 do 를 쓰지 않는 실수 — neither has the carrier 처럼 앞 문장의 조동사를 그대로 받습니다."
      ],
      practice: [
        { q: "It was the security team ____ detected the breach first.", opts: ["that", "which", "what", "whose"], a: "that", why: "It ~ that 강조구문에서는 강조할 요소 뒤에 that 을 씁니다." },
        { q: "I ____ confirm that the order was shipped this morning.", opts: ["do", "did", "am", "have"], a: "do", why: "현재 일반동사 confirm 을 강조하는 do 강조로 뒤에는 원형이 옵니다." },
        { q: "The regional office exceeded its target, and so ____ the branch in Daejeon.", opts: ["did", "was", "does it", "had"], a: "did", why: "앞 문장의 과거 동사를 대신하는 대동사 did 를 도치해 씁니다." },
        { q: "You may leave early today if you ____ to.", opts: ["want", "want it", "are wanting", "will want"], a: "want", why: "대부정사 to 를 동반하는 want 이므로 뒤에 목적어 없이 want to 로 끝냅니다." },
        { q: "It was last Friday ____ the committee announced the decision.", opts: ["that", "when", "which", "where"], a: "that", why: "시간을 강조하는 It ~ that 구문에서도 접속사는 that 을 씁니다." },
        { q: "The supplier has not signed the amendment, and neither ____ the buyer.", opts: ["has", "did", "does", "is"], a: "has", why: "앞 문장이 현재완료이므로 neither 뒤에도 조동사 has 를 그대로 받습니다." },
        { q: "The draft was edited in the morning and the layout ____ in the afternoon.", opts: ["revised", "revising", "to revise", "revise"], a: "revised", why: "앞 절과 조동사 was 가 같으므로 생략하고 과거분사만 남깁니다." },
        { q: "Under no circumstances ____ the seal be broken without approval.", opts: ["should", "should not", "does", "is"], a: "should", why: "Under no circumstances 가 문두에 오면 조동사 should 가 주어 앞으로 나가고 부정은 이미 표현되어 있습니다." }
      ]
    },
    {
      no: 8,
      title: "관계사 심화",
      intro: "관계사는 두 문장을 하나로 묶으면서 정보의 무게를 조절합니다. 콤마 하나로 제한과 추가 정보가 갈리고, 전치사의 위치에 따라 격식이 달라집니다. 관계부사를 전치사 + which 로 바꾸는 연습까지 하면 긴 문장이 훨씬 읽기 쉬워집니다.",
      summary: "계속적 용법과 전치사 + 관계대명사, 관계대명사 what으로 문장을 정교하게 연결합니다. 관계부사는 전치사 + which 로 바꿔 쓸 수 있습니다.",
      points: [
        {
          h: "제한적 용법과 계속적 용법",
          body: "콤마가 없으면 선행사를 특정하는 제한적 용법이고, 콤마가 있으면 추가 정보를 덧붙이는 계속적 용법입니다. 계속적 용법에서는 that을 쓸 수 없고, 해석도 두 문장처럼 이어집니다. 같은 문장이라도 콤마 하나로 뜻이 달라지므로 주의합니다.",
          table: {
            head: ["구분", "예문", "해석"],
            rows: [
              ["제한적", "The employees who worked overtime were paid.", "초과 근무한 직원들에게 급여가 지급됐습니다."],
              ["계속적", "The employees, who worked overtime, were paid.", "그 직원들은 초과 근무를 했고 급여가 지급됐습니다."],
              ["계속적(사물)", "The branch, which opened in 2020, is the busiest.", "그 지점은 2020년에 문을 열었고 가장 바쁩니다."]
            ]
          }
        },
        {
          h: "전치사 + 관계대명사",
          body: "격식 문어체에서는 전치사를 관계대명사 앞에 둡니다. who는 whom으로 바꾸고 that은 쓸 수 없으며, 관계대명사는 생략할 수 없습니다. 회화체에서는 전치사를 문장 끝에 남기지만, 격식 문서에서는 앞으로 옮기는 편이 좋습니다.",
          examples: [
            { en: "The firm for which she works is expanding.", ko: "그녀가 일하는 회사는 확장 중입니다." },
            { en: "The method by which the data was collected is documented.", ko: "데이터를 수집한 방법이 문서화되어 있습니다." },
            { en: "The committee to whom the report was addressed has not replied.", ko: "보고서를 받은 위원회는 아직 답하지 않았습니다." }
          ],
          note: "전치사가 앞에 오면 that 을 쓸 수 없습니다. the firm for that she works 는 틀린 표현입니다."
        },
        {
          h: "관계대명사 what",
          body: "what은 선행사를 포함해 명사절을 이끕니다. the thing which와 같은 뜻이며 뒤에는 불완전한 절이 옵니다. 문장의 주어, 목적어, 보어 자리에 모두 올 수 있어 명사절 문제에서 단골로 등장합니다.",
          examples: [
            { en: "What the board approved was a three-year plan.", ko: "이사회가 승인한 것은 3개년 계획이었습니다." },
            { en: "We invested in what the market needed.", ko: "우리는 시장이 필요로 하는 것에 투자했습니다." },
            { en: "The result was not what the client expected.", ko: "그 결과는 고객이 기대한 것이 아니었습니다." }
          ],
          note: "선행사가 있으면 what 을 쓰지 않습니다. The thing what he wanted 가 아니라 The thing that he wanted 입니다."
        },
        {
          h: "관계부사와 전치사 + which",
          body: "관계부사 where, when, why는 전치사 + which로 바꿔 쓸 수 있습니다. 격식 문장에서는 전치사를 앞에 두는 형태를 선호하고, 관계부사는 선행사 뒤에서 부사 역할을 합니다. 두 형태의 뜻이 같다는 점을 기억하면 문장을 유연하게 다룰 수 있습니다.",
          table: {
            head: ["관계부사", "바꾼 형태", "예문"],
            rows: [
              ["where", "in which / at which", "The lab in which the test was run is closed."],
              ["when", "on which / in which", "The year in which sales peaked was 2019."],
              ["why", "for which", "The reason for which the order failed is unclear."]
            ]
          },
          note: "선행사가 장소여도 뒤 절이 완전하면 where, 불완전하면 which 를 씁니다. The city where I live 는 뒤 절이 완전합니다."
        },
        {
          h: "관계대명사의 생략 조건",
          body: "목적격 관계대명사는 제한적 용법에서만 생략할 수 있습니다. 주격은 생략할 수 없고, 계속적 용법에서는 목적격이어도 생략하지 않습니다. 생략 여부를 묻는 문제에서는 콤마의 유무를 먼저 확인합니다.",
          examples: [
            { en: "The invoice we received yesterday was incomplete.", ko: "어제 받은 송장은 불완전했습니다." },
            { en: "The invoice, which we received yesterday, was incomplete.", ko: "그 송장은 어제 받았는데 불완전했습니다." },
            { en: "The consultant who prepared the report left the firm.", ko: "보고서를 작성한 컨설턴트가 회사를 떠났습니다." }
          ],
          note: "주격 관계대명사는 생략할 수 없습니다. The consultant prepared the report 는 두 문장으로 나누어 씁니다."
        },
        {
          h: "유사관계대명사 as 와 than",
          body: "as와 than은 such, the same, as many, more 같은 표현과 짝을 이루어 관계대명사처럼 쓰입니다. 이때 as나 than 뒤에는 주어나 목적어가 빠진 절이 옵니다. 격식 문장에서 비교 표현과 함께 자주 나옵니다.",
          examples: [
            { en: "We need as many reviewers as the schedule allows.", ko: "일정이 허락하는 만큼 많은 검토자가 필요합니다." },
            { en: "The results were not such as we had predicted.", ko: "결과는 우리가 예상한 것과 같은 종류가 아니었습니다." },
            { en: "The firm hired more analysts than the budget permitted.", ko: "그 회사는 예산이 허락한 것보다 많은 분석가를 채용했습니다." }
          ]
        }
      ],
      mistakes: [
        "계속적 용법에 that 을 쓰는 실수 — 콤마 뒤에는 who 나 which 를 씁니다.",
        "The thing what he wanted 처럼 what 을 중복해 쓰는 실수 — 선행사가 있으면 which 나 that 을 씁니다.",
        "전치사 + 관계대명사 자리에 that 을 쓰는 실수 — for that she works 가 아니라 for which she works 입니다.",
        "계속적 용법에서 목적격 관계대명사를 생략하는 실수 — 콤마 뒤에서는 생략하지 않습니다.",
        "장소 선행사에 무조건 where 를 쓰는 실수 — 뒤 절이 불완전하면 which 를 씁니다."
      ],
      practice: [
        { q: "The consultant ____ we hired last year has moved to another firm.", opts: ["whom", "which", "whose", "what"], a: "whom", why: "사람 선행사의 목적격 자리이므로 whom 을 씁니다." },
        { q: "The report, ____ was submitted late, still contained useful data.", opts: ["that", "which", "what", "who"], a: "which", why: "콤마가 있는 계속적 용법에서는 that 을 쓸 수 없고 사물 선행사이므로 which 입니다." },
        { q: "The policy was based on ____ the focus groups reported.", opts: ["that", "what", "which", "where"], a: "what", why: "전치사 뒤에서 선행사를 포함하는 명사절을 이끄는 것은 what 입니다." },
        { q: "The room ____ the samples are stored stays at a constant temperature.", opts: ["in which", "which", "that", "what"], a: "in which", why: "뒤 절이 완전하므로 전치사 + which 형태로 장소를 나타냅니다." },
        { q: "The reason ____ the shipment was held is still unclear.", opts: ["for which", "which", "that", "what"], a: "for which", why: "이유를 나타내는 why 는 for which 로 바꿔 쓸 수 있습니다." },
        { q: "The forms ____ were submitted after the deadline must be resubmitted.", opts: ["that", "what", "whose", "whom"], a: "that", why: "주격 관계대명사 자리이므로 that 을 쓰고 생략할 수 없습니다." },
        { q: "The analyst, ____ predictions were accurate, was promoted.", opts: ["whose", "who", "which", "that"], a: "whose", why: "뒤 명사 predictions 와 소유 관계를 이루는 관계대명사는 whose 입니다." },
        { q: "We invited as many suppliers ____ the venue could accommodate.", opts: ["as", "that", "which", "than"], a: "as", why: "as many + 명사 뒤에는 유사관계대명사 as 를 씁니다." }
      ]
    },
    {
      no: 9,
      title: "시제 일치와 시간·조건 부사절",
      intro: "시제 문제의 절반은 시간 부사절 하나로 갈립니다. 미래의 일을 말해도 when과 if 뒤에는 현재시제를 쓰기 때문입니다. 이 과에서는 주절과 종속절의 시제 짝, 시제 일치의 예외, 과거와 현재완료의 경계를 차례로 정리합니다.",
      summary: "시간과 조건을 나타내는 부사절에서는 미래의 일도 현재시제로 씁니다. 주절과 종속절의 시제 관계를 정리하면 오답을 줄일 수 있습니다.",
      points: [
        {
          h: "시간·조건 부사절에는 미래를 쓰지 않는다",
          body: "when, before, after, as soon as, until, if, unless가 이끄는 부사절에서는 미래의 일을 현재시제로 표현합니다. 미래의 의미는 주절의 will이 담당하고, 부사절은 시점만 표시합니다. 이 규칙 하나로 Part 5의 시제 문제 상당수가 정리됩니다.",
          table: {
            head: ["부사절 접속사", "예문", "쓰지 않는 형태"],
            rows: [
              ["when", "We will call you when the shipment arrives.", "when the shipment will arrive"],
              ["as soon as", "Please reply as soon as you receive the notice.", "as soon as you will receive"],
              ["unless", "The event will be canceled unless the weather improves.", "unless the weather will improve"],
              ["until", "Stay logged in until the transfer completes.", "until the transfer will complete"]
            ]
          },
          note: "when 절이 명사절이면 미래시제를 쓸 수 있습니다. I wonder when the results will arrive. 는 맞는 문장입니다."
        },
        {
          h: "주절과 종속절의 시제 짝",
          body: "주절이 미래이면 종속절은 현재, 주절이 현재완료이면 종속절은 과거로 맞춥니다. 주절이 미래완료이면 시간 부사절은 현재완료나 현재시제로 둡니다. 주절과 종속절을 따로 표시해 두고 짝을 확인하는 것이 안전합니다.",
          table: {
            head: ["주절", "종속절", "예문"],
            rows: [
              ["will + 동사원형", "현재시제", "We will start when the client confirms."],
              ["will have + p.p.", "현재시제 / 현재완료", "We will have finished by the time you arrive."],
              ["현재완료", "과거시제", "I have not heard from them since the contract was signed."],
              ["과거", "과거", "She left after the meeting ended."]
            ]
          },
          note: "by the time 뒤에도 미래를 쓰지 않습니다. by the time you will arrive 가 아니라 by the time you arrive 입니다."
        },
        {
          h: "시제 일치의 예외",
          body: "불변의 진리, 역사적 사실, 지금도 유효한 습관이나 규정은 주절이 과거여도 현재시제를 씁니다. 보고와 인용에서 시제를 그대로 살려야 하는 경우로, 시험에서는 고의로 과거로 바꾼 보기가 나옵니다. 내용이 지금도 참인지 스스로 물어보면 구분됩니다.",
          examples: [
            { en: "He explained that water boils at 100 degrees.", ko: "그는 물이 100도에서 끓는다고 설명했습니다." },
            { en: "She said she works from home every Friday.", ko: "그녀는 매주 금요일 재택 근무를 한다고 말했습니다." },
            { en: "The guide noted that the museum opens at nine.", ko: "안내인은 박물관이 9시에 문을 연다고 알려 주었습니다." }
          ]
        },
        {
          h: "과거시제와 현재완료의 표지",
          body: "ago, last, yesterday는 끝난 과거를 가리키므로 과거시제와만 씁니다. for, since, so far, recently, already는 현재완료와 자주 짝을 이룹니다. 같은 문장이라도 표지 하나로 시제가 결정되므로 시간 표현을 먼저 찾는 습관이 중요합니다.",
          table: {
            head: ["표현", "시제", "예문"],
            rows: [
              ["two days ago", "과거", "The order arrived two days ago."],
              ["so far", "현재완료", "We have shipped 300 units so far."],
              ["since 2020", "현재완료", "Sales have doubled since 2020."],
              ["just now", "과거", "The supervisor called just now."]
            ]
          },
          note: "I have seen him last Monday. 는 틀립니다. 끝난 시점에는 과거시제를 쓰므로 I saw him last Monday. 입니다."
        },
        {
          h: "현재완료와 현재완료진행의 구분",
          body: "현재완료는 완료된 결과에, 현재완료진행은 계속되는 과정에 초점을 둡니다. for와 함께 쓰면 두 형태가 모두 가능하지만 강조점이 다릅니다. 결과가 문제가 되면 완료, 진행 중임이 문제가 되면 진행을 씁니다.",
          examples: [
            { en: "The team has prepared the slides for the review.", ko: "팀은 검토용 슬라이드를 준비해 두었습니다." },
            { en: "The team has been preparing the slides all morning.", ko: "팀은 오전 내내 슬라이드를 준비하고 있습니다." },
            { en: "The machine has been running without a break since dawn.", ko: "기계는 새벽부터 쉬지 않고 가동 중입니다." }
          ]
        },
        {
          h: "since 절과 when 절의 시제 차이",
          body: "since 뒤에는 과거의 특정 시점이 오고 주절은 현재완료를 씁니다. 반면 when 뒤에는 그 시점에 일어난 사건을 그대로 서술하므로 시제가 자유롭습니다. 두 접속사의 뜻이 가까워 보여도 시제 짝이 다르다는 점이 핵심입니다.",
          examples: [
            { en: "We have not updated the manual since the process changed.", ko: "절차가 바뀐 이후로 설명서를 갱신하지 않았습니다." },
            { en: "The alarms sounded when the pressure exceeded the limit.", ko: "압력이 한계를 넘었을 때 경보가 울렸습니다." },
            { en: "Since the office moved, parking has been a problem.", ko: "사무실이 이전한 이후로 주차가 문제입니다." }
          ],
          note: "since 가 '이래로'라는 접속사면 주절은 현재완료, '때문에'라는 접속사면 시제가 자유롭습니다. Since the weather was bad, we postponed it."
        }
      ],
      mistakes: [
        "시간 부사절에 미래시제를 쓰는 실수 — when the shipment will arrive 가 아니라 when the shipment arrives 입니다.",
        "끝난 시점과 현재완료를 함께 쓰는 실수 — I have seen him last Monday 가 아니라 I saw him last Monday 입니다.",
        "불변의 진리를 과거로 바꾸는 실수 — He explained that water boiled at 100 degrees. 보다 현재시제가 맞습니다.",
        "by the time 절에 will 을 쓰는 실수 — by the time you will arrive 가 아니라 by the time you arrive 입니다.",
        "since 뒤에 현재완료를 쓰는 실수 — since the process has changed 가 아니라 since the process changed 입니다."
      ],
      practice: [
        { q: "The team will submit the proposal as soon as the figures ____ confirmed.", opts: ["will be", "are", "were", "have being"], a: "are", why: "as soon as 로 이끄는 시간 부사절에서는 미래를 현재시제로 씁니다." },
        { q: "We have not updated the manual since the process ____.", opts: ["changes", "changed", "will change", "has changed"], a: "changed", why: "since 뒤에는 과거의 특정 시점을 나타내는 과거시제가 옵니다." },
        { q: "The director explained that the policy ____ to all subsidiaries.", opts: ["applies", "applied will", "would applying", "is apply"], a: "applies", why: "현재도 유효한 규정이나 원칙은 주절이 과거여도 현재시제로 씁니다." },
        { q: "By the time the inspectors ____, we will have organized every file.", opts: ["will arrive", "arrive", "arrived", "are arriving"], a: "arrive", why: "by the time 뒤의 시간 부사절에는 미래 대신 현재시제를 씁니다." },
        { q: "Sales ____ steadily since the new pricing was introduced.", opts: ["grew", "have been growing", "will grow", "grow"], a: "have been growing", why: "since 로 이어진 계속되는 추세이므로 현재완료진행이 맞습니다." },
        { q: "The technician reported that the machine ____ two operators to run.", opts: ["requires", "required will", "requiring", "was require"], a: "requires", why: "지금도 그대로인 일반적 사실은 주절이 과거여도 현재시제로 씁니다." },
        { q: "The order ____ three days ago, but the tracking page still shows nothing.", opts: ["has shipped", "shipped", "will ship", "has been shipping"], a: "shipped", why: "three days ago 는 끝난 과거 시점이므로 과거시제를 씁니다." },
        { q: "Please keep the file open until the upload ____.", opts: ["will complete", "completes", "completed", "is completing"], a: "completes", why: "until 로 이끄는 시간 부사절에서 미래의 일을 현재시제로 표현합니다." }
      ]
    },
    {
      no: 10,
      title: "어순과 정보구조",
      intro: "영어는 중요한 정보를 문장 끝에 두는 언어입니다. 그래서 긴 목적어는 뒤로 가고, 이미 알려진 내용은 앞에서 주제 역할을 합니다. 이 원리를 알면 읽기 지문의 긴 문장이 한눈에 정리되고, 직접 쓴 문장도 훨씬 자연스러워집니다.",
      summary: "영어는 무거운 요소를 문장 끝에 두는 경향이 있습니다. 앞에는 이미 아는 정보를, 뒤에는 새로운 정보를 두고 부사 위치도 의미에 따라 달라집니다.",
      points: [
        {
          h: "무게 중심 원리 — 긴 요소는 뒤로",
          body: "문장 요소가 길면 뒤로 보내는 것이 자연스럽습니다. 목적어가 길면 전치사구를 앞으로 옮기거나 수동태로 바꿔 균형을 맞춥니다. 같은 내용이라도 무게가 어디에 놓이느냐에 따라 읽는 부담이 크게 달라집니다.",
          table: {
            head: ["부자연스러운 어순", "자연스러운 어순"],
            rows: [
              ["We sent the revised contract with the updated pricing table to the vendor.", "We sent the vendor the revised contract with the updated pricing table."],
              ["We replaced with a faster model the printer in the annex.", "We replaced the printer in the annex with a faster model."],
              ["They gave a detailed manual covering every procedure to the interns.", "They gave the interns a detailed manual covering every procedure."]
            ]
          },
          note: "수여동사 뒤에서 길이가 다른 두 목적어가 올 때는 짧은 것을 먼저 두는 편이 읽기 쉽습니다."
        },
        {
          h: "주제와 초점",
          body: "문장 앞에는 이미 알고 있는 정보를 주제로 두고, 뒤에는 새로운 정보를 초점으로 둡니다. 이 원리 때문에 수동태와 도치가 자연스럽게 쓰입니다. 글을 쓸 때는 앞 문장의 끝 단어가 다음 문장의 앞부분으로 이어지도록 구성합니다.",
          examples: [
            { en: "The brochure was designed by an outside agency.", ko: "그 안내서는 외부 대행사가 디자인했습니다." },
            { en: "Among the proposals was a plan to shorten the approval process.", ko: "제안들 중에는 승인 절차를 줄이는 계획이 있었습니다." },
            { en: "The new hire was trained by the same supervisor who trained me.", ko: "새 직원은 저를 교육한 같은 관리자에게 교육을 받았습니다." }
          ]
        },
        {
          h: "부사구와 부사의 위치",
          body: "장소와 시간, 방법은 문장 끝에 두는 것이 기본입니다. 빈도 부사는 일반동사 앞, be동사 뒤에 오고, 태도 부사는 조동사 뒤에 놓입니다. 위치가 바뀌면 강조점이나 의미도 바뀌므로 자리별 규칙을 익혀 둡니다.",
          table: {
            head: ["부사 종류", "위치", "예문"],
            rows: [
              ["장소·시간", "문장 끝", "The team met the vendor in Busan yesterday."],
              ["빈도", "일반동사 앞", "We often review the figures on Fridays."],
              ["태도", "조동사 뒤", "The board will probably approve the plan."]
            ]
          },
          note: "빈도 부사는 be동사 뒤에 옵니다. He is always on time. 처럼 씁니다."
        },
        {
          h: "강조를 위한 전치",
          body: "강조할 요소를 문장 앞으로 옮기면 초점이 이동합니다. 목적어를 문두에 두면 대조의 뜻이 생기고, 부정어가 문두에 오면 도치가 함께 일어납니다. 이 장치는 문어체에서 리듬을 만들 때 특히 유용합니다.",
          examples: [
            { en: "This proposal the board rejected without discussion.", ko: "이 제안을 이사회는 논의 없이 거부했습니다." },
            { en: "Only after the audit did the errors become clear.", ko: "감사 이후에야 오류가 분명해졌습니다." },
            { en: "Such was the demand that the stock sold out in a day.", ko: "수요가 워낙 커서 재고가 하루 만에 팔렸습니다." }
          ]
        },
        {
          h: "문장 성분의 균형과 병렬",
          body: "and나 or로 이어진 요소는 품사와 구조를 같게 맞춥니다. 명사와 절을 섞거나 형용사와 부사를 섞으면 문장이 흔들립니다. 긴 문장일수록 병렬을 먼저 점검하는 것이 오류를 줄이는 지름길입니다.",
          examples: [
            { en: "The role requires accuracy, patience, and clear communication.", ko: "그 역할에는 정확성과 인내, 명확한 의사소통이 필요합니다." },
            { en: "The update improved both speed and stability.", ko: "그 업데이트는 속도와 안정성을 함께 개선했습니다." },
            { en: "We will either extend the deadline or reduce the scope.", ko: "우리는 마감을 연장하거나 범위를 줄일 것입니다." }
          ],
          note: "명사와 절을 섞지 않습니다. requires accuracy and that the team reports 는 병렬이 깨진 문장입니다."
        },
        {
          h: "수동태와 정보구조",
          body: "수동태는 행위자를 숨기거나 이미 아는 대상을 주제로 세울 때 씁니다. 공정·절차를 설명하는 문어체에서 특히 자주 등장합니다. 다만 남용하면 문장이 무거워지므로 행위자가 중요할 때는 능동태로 돌립니다.",
          examples: [
            { en: "The samples must be stored below 20 degrees.", ko: "샘플은 20도 이하에서 보관해야 합니다." },
            { en: "The incident was reported to the safety office immediately.", ko: "그 사고는 즉시 안전 부서에 보고되었습니다." },
            { en: "The results will be released after the review.", ko: "결과는 검토 후에 공개될 예정입니다." }
          ]
        }
      ],
      mistakes: [
        "긴 목적어를 동사 바로 뒤에 두어 읽기 어려운 문장을 만드는 실수 — 목적어가 길면 뒤로 보냅니다.",
        "빈도 부사를 문장 끝에 두는 실수 — 빈도 부사는 일반동사 앞에 둡니다.",
        "병렬을 무시하고 품사를 섞는 실수 — and 앞뒤의 형태를 같게 맞춥니다.",
        "주제와 초점을 뒤집어 문장을 시작하는 실수 — 새 정보는 문장 뒤쪽에 둡니다.",
        "수동태를 남용해 행위자를 숨기는 실수 — 행위자가 중요하면 능동태로 씁니다."
      ],
      practice: [
        { q: "The coordinator ____ the reports on the first Monday of each month.", opts: ["reviews usually", "usually reviews", "reviews usual", "usual reviews"], a: "usually reviews", why: "빈도 부사 usually 는 일반동사 앞에 둡니다." },
        { q: "The board will ____ approve the revised budget after the audit.", opts: ["probable", "probably", "probability", "probablely"], a: "probably", why: "조동사 will 뒤, 본동사 앞에 태도 부사 probably 가 옵니다." },
        { q: "Only after the inspection ____ the safety issues clear.", opts: ["became", "did become", "becoming", "become"], a: "did become", why: "Only + 부사구가 문두에 오면 주절이 도치되고 과거이므로 did become 을 씁니다." },
        { q: "The workshop covers both budgeting ____ forecasting for new managers.", opts: ["and", "or", "but", "nor"], a: "and", why: "both 와 짝을 이루는 병렬 접속사는 and 입니다." },
        { q: "We provided the new staff with ____ covering every safety procedure.", opts: ["a manual", "manuals is", "that manual", "a manual is"], a: "a manual", why: "with 뒤에는 명사구가 와야 하므로 목적어 자리에 명사 a manual 을 둡니다." },
        { q: "The samples ____ below 20 degrees at all times.", opts: ["must store", "must be stored", "must storing", "store"], a: "must be stored", why: "샘플은 보관되는 대상이고 절차를 설명하는 문맥이므로 수동태가 맞습니다." },
        { q: "The quarterly report ____ by the regional office last Friday.", opts: ["was submitted", "submitted", "was submitting", "has submit"], a: "was submitted", why: "보고서는 제출되는 대상이고 과거 시점이 있으므로 과거 수동태를 씁니다." },
        { q: "Among the candidates ____ an analyst with ten years of experience.", opts: ["was", "were", "be", "being"], a: "was", why: "장소 부사구가 문두에 오면 도치되고 주어 an analyst 가 단수이므로 was 를 씁니다." }
      ]
    },
    {
      no: 11,
      title: "접속사 심화",
      intro: "격식 있는 글은 접속사의 선택이 정확합니다. 양보·조건·이유를 어떤 형태로 표현하느냐에 따라 문장의 격이 달라지기 때문입니다. 상관접속사의 병렬과 수일치까지 챙기면 보고서 문장이 한 단계 올라갑니다.",
      summary: "격식 문어체의 양보·조건·이유 표현과 상관접속사의 병렬 구조를 정확히 씁니다. 접속부사와 접속사를 구분해 문장부호까지 맞춥니다.",
      points: [
        {
          h: "격식 있는 양보 표현",
          body: "even though와 although가 기본형이고, notwithstanding, albeit, much as는 문어체에서 자주 쓰입니다. 각 표현이 뒤에 절을 받는지 명사구를 받는지가 다르므로 함께 외워야 합니다. 격식 문서에서는 같은 양보를 반복하지 않도록 표현을 바꿔 가며 씁니다.",
          table: {
            head: ["표현", "뒤에 오는 것", "예문"],
            rows: [
              ["although / even though", "절", "Although the cost rose, output increased."],
              ["notwithstanding", "명사구", "Notwithstanding the delay, the client renewed the contract."],
              ["albeit", "형용사·부사구", "The results were positive, albeit modest."],
              ["much as", "절", "Much as we value the partnership, the terms must change."]
            ]
          },
          note: "albeit 뒤에는 절이 오지 않습니다. albeit the results were modest 가 아니라 albeit modest 입니다."
        },
        {
          h: "조건의 격식 표현",
          body: "provided that, on condition that, in the event that은 조건을 나타내는 접속사로 뒤에 절이 옵니다. in case는 '만일을 대비해'라는 뜻이라 조건과 미묘하게 다릅니다. 계약·정책 문장에서 자주 나오므로 형태를 통째로 익혀 둡니다.",
          examples: [
            { en: "The discount applies provided that payment is made within 30 days.", ko: "결제가 30일 이내에 이루어지면 할인이 적용됩니다." },
            { en: "In the event that the shipment is delayed, we will compensate you.", ko: "배송이 지연되는 경우 보상해 드리겠습니다." },
            { en: "Keep a copy of the receipt in case the claim is questioned.", ko: "청구가 문제될 경우를 대비해 영수증 사본을 보관하세요." }
          ]
        },
        {
          h: "상관접속사와 병렬 구조",
          body: "both A and B, either A or B, neither A nor B, not only A but also B는 A와 B를 같은 형태로 맞춰야 합니다. 병렬이 깨지면 문장이 어색해지고 감점 요인이 됩니다. 접속사 짝을 먼저 확인하고 앞뒤 형태를 비교하는 순서로 점검합니다.",
          table: {
            head: ["표현", "예문"],
            rows: [
              ["both A and B", "The role requires both accuracy and speed."],
              ["not only A but also B", "The update improved not only speed but also stability."],
              ["either A or B", "Either the manager or the supervisor will sign."],
              ["neither A nor B", "Neither the delay nor the cost was explained."]
            ]
          },
          note: "not only 뒤에 조동사가 오면 but also 뒤에서도 같은 구조를 유지합니다. Not only did she lead the team, but she also trained it."
        },
        {
          h: "상관접속사 주어의 수일치",
          body: "neither A nor B나 either A or B가 주어이면 동사는 B에 맞춥니다. both A and B가 주어이면 복수 동사를 씁니다. not only A but also B도 동사를 B에 맞추므로, 마지막 명사를 기준으로 판단합니다.",
          table: {
            head: ["주어", "동사", "예문"],
            rows: [
              ["neither A nor B", "B 에 맞춤", "Neither the staff nor the manager was informed."],
              ["either A or B", "B 에 맞춤", "Either the interns or the supervisor is responsible."],
              ["both A and B", "복수", "Both the form and the receipt are required."],
              ["not only A but also B", "B 에 맞춤", "Not only the driver but also the helpers were late."]
            ]
          },
          note: "A 와 B 의 수가 다르면 동사를 가까운 B 에 맞춥니다. Neither the staff nor the manager was informed."
        },
        {
          h: "이유와 결과의 격식 표현",
          body: "owing to, due to, on account of는 이유를 나타내는 전치사구이고, so that과 such that은 결과나 목적을 나타냅니다. due to 뒤에는 명사구가 오고, because 뒤에는 절이 옵니다. 두 형태를 섞어 쓰는 실수가 시험에서 자주 나옵니다.",
          examples: [
            { en: "Owing to the strike, the delivery schedule changed.", ko: "파업 때문에 배송 일정이 바뀌었습니다." },
            { en: "The report was arranged so that the key figures appear first.", ko: "핵심 수치가 먼저 나오도록 보고서를 구성했습니다." },
            { en: "Because the supplier raised prices, the margin narrowed.", ko: "공급업체가 가격을 올려서 마진이 줄었습니다." }
          ],
          note: "due to 뒤에는 명사구만 옵니다. due to the supplier raised prices 는 틀린 문장입니다."
        },
        {
          h: "접속부사와 접속사의 구분",
          body: "however, therefore, moreover, nevertheless는 접속부사라서 두 절을 직접 이어 주지 못합니다. 마침표나 세미콜론 뒤에 쓰고 콤마를 함께 둡니다. 반면 although, because, while은 접속사라서 절을 그대로 이어 줍니다.",
          examples: [
            { en: "The costs fell; however, the quality also dropped.", ko: "비용은 줄었습니다. 그러나 품질도 떨어졌습니다." },
            { en: "The data was incomplete; therefore, the analysis was delayed.", ko: "데이터가 불완전했습니다. 그래서 분석이 지연되었습니다." },
            { en: "Although the data was incomplete, the analysis continued.", ko: "데이터가 불완전했지만 분석은 계속되었습니다." }
          ],
          note: "However the data was incomplete. 처럼 한 문장 안에서 두 절을 잇는 접속사로 쓰면 틀립니다."
        }
      ],
      mistakes: [
        "not only A but also B 에서 A 와 B 의 형태를 다르게 쓰는 실수 — 같은 품사와 구조로 맞춥니다.",
        "due to 뒤에 절을 두는 실수 — due to 뒤에는 명사구가 옵니다.",
        "접속부사 however 를 접속사처럼 쓰는 실수 — 마침표나 세미콜론 뒤에 둡니다.",
        "neither A nor B 에서 동사를 A 에 맞추는 실수 — 동사는 가까운 B 에 맞춥니다.",
        "albeit 뒤에 절을 두는 실수 — albeit 뒤에는 형용사나 부사구가 옵니다."
      ],
      practice: [
        { q: "The proposal was accepted, ____ with minor revisions.", opts: ["albeit", "although", "despite", "whereas"], a: "albeit", why: "뒤에 명사구 with minor revisions 가 오는 양보 표현은 albeit 입니다." },
        { q: "The plan will proceed ____ that the funding is approved.", opts: ["provided", "despite", "although", "unless"], a: "provided", why: "provided that 은 조건을 나타내는 접속사로 뒤에 절이 옵니다." },
        { q: "The workshop covers not only budgeting ____ also forecasting.", opts: ["and", "but", "or", "nor"], a: "but", why: "not only A but also B 상관접속사의 짝이므로 but 을 씁니다." },
        { q: "Neither the driver nor the loaders ____ trained on the new procedure.", opts: ["was", "were", "is", "has"], a: "were", why: "neither A nor B 는 가까운 B(the loaders) 에 동사를 맞추므로 were 를 씁니다." },
        { q: "____ the currency fluctuation, the contract was renegotiated.", opts: ["Owing to", "Although", "Because", "So that"], a: "Owing to", why: "뒤에 명사구가 오는 이유 표현은 Owing to 입니다." },
        { q: "The delivery was late; ____, the client accepted the explanation.", opts: ["nevertheless", "because", "unless", "although"], a: "nevertheless", why: "세미콜론 뒤에서 양보의 뜻을 잇는 접속부사는 nevertheless 입니다." },
        { q: "The instructions were written ____ every step could be followed easily.", opts: ["so that", "although", "despite", "unless"], a: "so that", why: "목적이나 결과를 나타내며 뒤에 절이 오는 표현은 so that 입니다." },
        { q: "Either the supervisor or the coordinators ____ the final checklist.", opts: ["handles", "handle", "handling", "is handle"], a: "handle", why: "either A or B 는 가까운 B(the coordinators) 에 동사를 맞춥니다." }
      ]
    },
    {
      no: 12,
      title: "담화 문법 — 응집성 있는 문장 쓰기",
      intro: "좋은 글은 문장 하나하나가 아니라 문장 사이의 연결에서 완성됩니다. 대조와 양보를 구분하고, 추론과 결론의 표지를 정확히 골라야 논리가 드러납니다. 이 과는 앞의 열한 과를 글쓰기로 묶는 마무리 단계입니다.",
      summary: "좋은 글은 문장 사이의 연결이 분명합니다. 대조·양보·추론의 표지를 정확히 골라 논리를 드러내고, 주제문과 근거로 문단을 구성합니다.",
      points: [
        {
          h: "문장 간 연결 장치",
          body: "앞 문장의 내용을 받아 이어 주는 표현을 씁니다. 지시어, 반복, 연결어가 대표적이며, 같은 단어를 그대로 쓰기보다 동의어나 대용 표현으로 바꾸면 글이 매끄러워집니다. 연결 장치가 없으면 독자는 문장 사이의 관계를 스스로 추측해야 합니다.",
          table: {
            head: ["기능", "표현", "예문"],
            rows: [
              ["지시", "this, these, such", "Such results suggest a structural problem."],
              ["반복", "동의어·대용 표현", "The consultant raised the issue again yesterday."],
              ["연결", "as a result, by contrast", "By contrast, the northern branch grew."],
              ["요약", "in short, to sum up", "In short, the pilot met its main objectives."]
            ]
          }
        },
        {
          h: "대조와 양보의 구분",
          body: "대조는 서로 다른 두 사실을 나란히 놓고, 양보는 예상과 다른 결과를 제시합니다. however는 단순한 전환에, nevertheless는 예상을 뒤집는 양보에 씁니다. 두 표현을 같은 뜻으로 쓰면 논리의 방향이 흐려집니다.",
          examples: [
            { en: "The costs fell. However, the quality also dropped.", ko: "비용은 줄었습니다. 그러나 품질도 떨어졌습니다." },
            { en: "The costs fell; nevertheless, the product remained reliable.", ko: "비용은 줄었습니다. 그럼에도 제품은 여전히 믿을 만했습니다." },
            { en: "Whereas the Seoul office expanded, the Busan office downsized.", ko: "서울 사무소는 확장한 반면 부산 사무소는 축소했습니다." }
          ]
        },
        {
          h: "추론과 결론의 표지",
          body: "therefore와 thus는 논리적 결론, hence는 결과, in sum과 in short는 요약을 나타냅니다. 격식 문서에서는 thus와 hence가 선호되고, 회화에서는 so가 자주 쓰입니다. 표지를 잘못 고르면 근거와 결론의 관계가 뒤집힙니다.",
          examples: [
            { en: "Demand exceeded supply; hence the price increase.", ko: "수요가 공급을 넘었고 따라서 가격이 올랐습니다." },
            { en: "In sum, the pilot program achieved its primary objectives.", ko: "요약하면 시범 사업은 주요 목표를 달성했습니다." },
            { en: "The sample was too small; thus the result needs confirmation.", ko: "표본이 너무 작았습니다. 따라서 결과는 확인이 필요합니다." }
          ]
        },
        {
          h: "지시어와 반복의 관리",
          body: "this와 these는 가리키는 대상이 분명해야 하며, 문장 전체를 받을 때는 this fact나 this trend처럼 명사를 붙입니다. 같은 명사를 반복하면 글이 무거워지므로 대명사와 동의어를 섞어 씁니다. 지시어가 두 대상을 가리킬 수 있으면 독자는 문장을 다시 읽어야 합니다.",
          examples: [
            { en: "The review found three gaps. This trend worries the board.", ko: "검토에서 세 가지 공백이 발견되었습니다. 이 추세는 이사회를 걱정하게 합니다." },
            { en: "The team lost two clients. This fact changed the strategy.", ko: "그 팀은 고객 두 곳을 잃었습니다. 이 사실이 전략을 바꿨습니다." },
            { en: "The new process cut waste. The change also shortened lead times.", ko: "새 절차는 낭비를 줄였습니다. 그 변화는 납기도 단축했습니다." }
          ]
        },
        {
          h: "학술 문장의 응집성",
          body: "주장에는 근거를 붙이고, 근거의 출처를 밝히며, 반론을 먼저 인정하는 구조가 격식 있는 글의 기본입니다. 양보한 뒤 주장으로 돌아오면 논지가 더 설득력 있게 들립니다. while과 although로 반론을 여는 문장이 대표적입니다.",
          examples: [
            { en: "While the initial data were limited, the pattern was consistent.", ko: "초기 데이터는 제한적이었지만 양상은 일관되었습니다." },
            { en: "The evidence suggests that remote work improves retention.", ko: "그 증거는 재택 근무가 재직률을 높인다는 것을 시사합니다." },
            { en: "Although the sample was small, the effect was measurable.", ko: "표본은 작았지만 효과는 측정할 수 있었습니다." }
          ]
        },
        {
          h: "문단 구조와 주제문",
          body: "한 문단에는 하나의 주제를 두고 첫 문장에 주제문을 놓으면 읽기 쉬워집니다. 이어지는 문장은 근거와 예시로 주제문을 뒷받침하고, 마지막 문장에서 결론이나 다음 문단으로 넘기는 신호를 줍니다. 보고서 문단은 이 구조를 반복해 만듭니다.",
          examples: [
            { en: "The pilot reduced processing time by 30 percent.", ko: "시범 사업은 처리 시간을 30퍼센트 줄였습니다." },
            { en: "Two factors explain the improvement.", ko: "그 개선을 설명하는 요인은 두 가지입니다." },
            { en: "The next section reviews the cost implications.", ko: "다음 절에서는 비용 영향을 살펴봅니다." }
          ]
        },
        {
          h: "연결어 선택 기준 정리",
          body: "관계별로 대표 표현을 표로 정리해 두면 문장을 이어 붙일 때 망설임이 줄어듭니다. 먼저 두 문장의 논리 관계를 판단하고, 그 관계에 맞는 표지를 골라 쓰는 순서가 중요합니다.",
          table: {
            head: ["논리 관계", "대표 표현", "예문"],
            rows: [
              ["추가", "moreover, in addition", "Moreover, the new line cut energy use."],
              ["대조", "however, by contrast", "By contrast, the northern branch grew."],
              ["양보", "nevertheless, still", "Nevertheless, the deadline was met."],
              ["결과", "hence, as a result", "Hence the price increase in the first quarter."],
              ["예시", "for instance, notably", "For instance, two clients renewed early."],
              ["요약", "in short, to sum up", "In short, the pilot met its objectives."]
            ]
          }
        }
      ],
      mistakes: [
        "대조와 양보를 같은 뜻으로 섞어 쓰는 실수 — 대조는 차이, 양보는 예상 밖의 결과입니다.",
        "연결어를 문장 안에서 두 절을 잇는 접속사처럼 쓰는 실수 — 세미콜론이나 마침표를 사용합니다.",
        "지시어 this 만 쓰고 대상을 밝히지 않는 실수 — this trend, this fact 처럼 명사를 붙입니다.",
        "therefore 와 however 를 뒤바꿔 쓰는 실수 — 결론은 therefore, 전환은 however 입니다.",
        "한 문단에 두 주제를 넣는 실수 — 문단마다 하나의 주제문만 둡니다."
      ],
      practice: [
        { q: "The initial results were encouraging. ____, the sample size was too small.", opts: ["However", "Therefore", "Moreover", "Similarly"], a: "However", why: "앞 내용과 상반되는 내용을 이어 주므로 However 를 씁니다." },
        { q: "Production costs declined; ____, the margin improved.", opts: ["hence", "whereas", "despite", "unlike"], a: "hence", why: "앞 내용의 결과를 나타내는 연결어 hence 가 맞습니다." },
        { q: "____ the survey covered only two cities, the findings were consistent.", opts: ["While", "Because", "So", "Thus"], a: "While", why: "양보의 의미로 두 절을 이으므로 접속사 While 을 씁니다." },
        { q: "The costs fell; ____, the product stayed reliable.", opts: ["nevertheless", "therefore", "for instance", "in short"], a: "nevertheless", why: "예상과 다른 결과를 나타내는 양보의 연결어는 nevertheless 입니다." },
        { q: "The review found three process gaps. ____ trend worried the board.", opts: ["This", "These", "Such a", "Those"], a: "This", why: "앞 문장의 내용을 하나로 묶어 받으며 단수 명사 trend 를 꾸미므로 This 입니다." },
        { q: "The pilot cut processing time by 30 percent. ____, two factors explain the gain.", opts: ["In short", "Two factors", "Therefore it", "However it"], a: "In short", why: "앞 내용을 요약해 결론으로 이어 주는 표지가 필요합니다." },
        { q: "____ the deadline was tight, the team delivered the report on time.", opts: ["Although", "Because", "Therefore", "Hence"], a: "Although", why: "예상과 다른 결과를 이끄는 양보의 접속사는 Although 입니다." },
        { q: "The new line reduced energy use; ____, it lowered maintenance costs.", opts: ["moreover", "however", "whereas", "otherwise"], a: "moreover", why: "같은 방향의 정보를 추가하는 연결어는 moreover 입니다." }
      ]
    }
  ]
});
