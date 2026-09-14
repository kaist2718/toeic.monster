/* ============================================================================
 * 고급 영문법 (C1) — 12과
 * tools/build-pages.mjs 와 감사 도구가 window.GRAMMAR_BOOKS 를 읽습니다.
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
    "각 과의 형태 표를 보고 비슷한 문장을 스스로 한 개씩 만들어 확인합니다.",
    "연습 문제의 오답은 해설에 적힌 판단 순서를 그대로 따라가며 다시 풉니다.",
    "예문을 소리 내어 읽어 어순과 강세를 함께 익힙니다."
  ],
  chapters: [
    {
      no: 1,
      title: "분사구문 심화",
      summary: "분사구문은 완료·수동·부정 형태로 확장되고, 주어가 다르면 독립분사구문으로 씁니다.",
      points: [
        {
          h: "완료분사구문 — Having + p.p.",
          body: "주절보다 먼저 일어난 일을 분사구문으로 만들 때 씁니다. 시간의 선후를 분명히 합니다.",
          table: {
            head: ["원래 문장", "완료분사구문"],
            rows: [
              ["After he had finished the audit, he submitted the report.", "Having finished the audit, he submitted the report."],
              ["Because she had missed the deadline, she apologized.", "Having missed the deadline, she apologized."]
            ]
          }
        },
        {
          h: "수동분사구문 — Being + p.p. / p.p.",
          body: "분사구문의 주어가 동작을 당하는 대상이면 과거분사로 시작합니다. Being은 흔히 생략됩니다.",
          examples: [
            { en: "Written in plain language, the manual is easy to follow.", ko: "쉬운 문장으로 쓰여서 그 설명서는 따라 하기 쉽습니다." },
            { en: "Being given no clear instructions, the interns waited.", ko: "명확한 지시를 받지 못해 인턴들은 기다렸습니다." }
          ]
        },
        {
          h: "부정분사구문 — Not + -ing",
          body: "부정의 의미는 분사 앞에 Not이나 Never를 두어 나타냅니다.",
          examples: [
            { en: "Not knowing the password, he could not log in.", ko: "비밀번호를 몰라서 그는 로그인할 수 없었습니다." },
            { en: "Never having dealt with customs, she asked for help.", ko: "통관을 다뤄 본 적이 없어서 그녀는 도움을 청했습니다." }
          ]
        },
        {
          h: "독립분사구문과 with 구문",
          body: "분사구문의 주어가 주절의 주어와 다르면 그 주어를 분사 앞에 남깁니다. with + 목적어 + 분사 구조도 같은 역할을 합니다.",
          examples: [
            { en: "The schedule being tight, the team worked through the weekend.", ko: "일정이 빠듯해서 팀은 주말에도 일했습니다." },
            { en: "With the contract signed, the project moved to phase two.", ko: "계약이 체결되어 사업은 2단계로 넘어갔습니다." }
          ]
        }
      ],
      mistakes: [
        "Having finished the report, the printer broke down. 처럼 주어가 어긋나는 현수분사를 쓰는 실수 — 주절 주어와 분사구문의 주어를 맞춥니다.",
        "분사구문 안에 접속사를 그대로 남기는 실수 — 접속사가 남으면 분사구문이 아니라 부사절입니다."
      ],
      practice: [
        { q: "____ the figures, the analyst presented the quarterly results.", opts: ["Verify", "Verified", "Having verified", "To verifying"], a: "Having verified", why: "검증이 발표보다 먼저 일어난 일이므로 완료분사구문을 씁니다." },
        { q: "____ in 1998, the factory has been expanded twice.", opts: ["Building", "Built", "To build", "Having building"], a: "Built", why: "공장은 지어진 대상이므로 과거분사로 시작하는 수동분사구문을 씁니다." },
        { q: "____ the exact requirements, the vendor asked for a clarification meeting.", opts: ["Not knowing", "Not known", "Knowing not", "No knowing"], a: "Not knowing", why: "부정의 분사구문은 분사 앞에 Not 을 둡니다." }
      ]
    },
    {
      no: 2,
      title: "도치",
      summary: "부정어나 장소 부사구가 문장 앞에 오면 주어와 동사의 순서가 바뀝니다. 강조와 격식의 효과가 있습니다.",
      points: [
        {
          h: "부정어 도치",
          body: "Never, Rarely, Hardly, Not only, Little 같은 부정어가 문두에 오면 조동사를 주어 앞으로 보냅니다. 조동사가 없으면 do, does, did를 넣습니다.",
          table: {
            head: ["일반 어순", "도치 어순"],
            rows: [
              ["We have never seen such a response.", "Never have we seen such a response."],
              ["He little knew the risk.", "Little did he know the risk."],
              ["The company not only cut costs but also raised output.", "Not only did the company cut costs, but it also raised output."]
            ]
          },
          note: "Hardly ~ when, No sooner ~ than 은 과거완료와 함께 도치합니다. Hardly had we arrived when the meeting began."
        },
        {
          h: "장소 부사구 도치",
          body: "장소를 나타내는 부사구가 문두에 오면 동사 전체가 주어 앞으로 나갑니다. 주어가 대명사면 도치하지 않습니다.",
          examples: [
            { en: "On the second floor is the main conference room.", ko: "2층에 메인 회의실이 있습니다." },
            { en: "Here comes the manager.", ko: "부장님이 오십니다." }
          ]
        },
        {
          h: "양보 도치 — 형용사·부사·명사 + as/though",
          body: "양보의 뜻을 강조할 때 보어를 앞세우고 as나 though를 씁니다. Although보다 문어적입니다.",
          examples: [
            { en: "Tired as he was, he finished the inspection.", ko: "그는 피곤했지만 점검을 끝냈습니다." },
            { en: "Talented though she is, she still needs training.", ko: "그녀는 재능이 있지만 여전히 훈련이 필요합니다." }
          ]
        },
        {
          h: "가정법 도치 — If 생략",
          body: "가정법에서 if를 생략하면 had, were, should가 주어 앞으로 나갑니다.",
          examples: [
            { en: "Had we known the risk, we would have insured the cargo.", ko: "위험을 알았더라면 화물에 보험을 들었을 것입니다." },
            { en: "Should the shipment be delayed, we will notify you.", ko: "배송이 지연되면 알려 드리겠습니다." }
          ]
        }
      ],
      mistakes: [
        "Never I have seen ~ 처럼 부정어 도치에서 어순을 바꾸지 않는 실수 — Never have I seen 입니다.",
        "주어가 대명사일 때 장소 도치를 적용하는 실수 — Here he comes. 처럼 도치하지 않습니다."
      ],
      practice: [
        { q: "Never ____ such a detailed audit report submitted so quickly.", opts: ["we have seen", "have we seen", "we saw", "did we saw"], a: "have we seen", why: "부정어 Never 가 문두에 오면 조동사 have 가 주어 앞으로 나갑니다." },
        { q: "____ had the announcement been made when employees began to call.", opts: ["Hardly", "Rarely", "Almost", "Nearly"], a: "Hardly", why: "Hardly ~ when 구문에서 Hardly 가 문두에 오면 과거완료가 도치됩니다." },
        { q: "____ the contract be terminated early, all fees must be settled.", opts: ["Should", "Would", "Will", "Were"], a: "Should", why: "if 를 생략한 조건의 도치에서는 Should 가 주어 앞에 옵니다." }
      ]
    },
    {
      no: 3,
      title: "가정법 심화",
      summary: "시점이 섞인 가정에는 혼합 가정법을 쓰고, as if와 but for로 다양한 가정을 표현합니다.",
      points: [
        {
          h: "혼합 가정법",
          body: "if절은 과거 사실의 반대인데 주절의 결과가 현재에 영향을 주는 경우, if절에 had p.p., 주절에 would + 원형을 씁니다.",
          table: {
            head: ["if절", "주절", "의미"],
            rows: [
              ["had p.p. (과거)", "would + 원형 (현재)", "그때 그렇게 했더라면 지금은 ~할 텐데"],
              ["과거형 (현재)", "would have p.p. (과거)", "지금 ~라면 그때 ~했을 텐데"]
            ]
          },
          examples: [
            { en: "If we had invested in automation, we would be more competitive now.", ko: "자동화에 투자했더라면 지금 더 경쟁력이 있을 텐데요." }
          ]
        },
        {
          h: "as if / as though",
          body: "사실이 아닌 것을 마치 그런 듯이 표현합니다. 현재 사실이면 과거형, 과거 사실이면 had p.p.를 씁니다.",
          examples: [
            { en: "He speaks as if he owned the company.", ko: "그는 마치 회사를 소유한 것처럼 말합니다." },
            { en: "She looked as though she had not slept.", ko: "그녀는 잠을 자지 않은 것처럼 보였습니다." }
          ]
        },
        {
          h: "but for / without",
          body: "but for는 if it were not for의 뜻으로, 뒤에 명사를 두고 주절에는 would를 씁니다.",
          examples: [
            { en: "But for the intern's quick action, we would have lost the client.", ko: "인턴의 빠른 대응이 없었다면 고객을 잃었을 것입니다." },
            { en: "Without proper maintenance, the machine would break down often.", ko: "제대로 정비하지 않으면 그 기계는 자주 고장 날 것입니다." }
          ]
        },
        {
          h: "It is time / would rather",
          body: "It is time 뒤에는 과거형을 써서 지금 해야 할 일을 나타내고, would rather 뒤에도 과거형을 써서 현재의 소망을 표현합니다.",
          examples: [
            { en: "It is time we reviewed the safety protocol.", ko: "우리가 안전 규정을 점검할 때가 되었습니다." },
            { en: "I would rather you handled the negotiation.", ko: "저는 당신이 협상을 맡았으면 합니다." }
          ]
        }
      ],
      mistakes: [
        "혼합 가정법에서 if절에 과거완료 대신 과거형을 쓰는 실수 — 과거의 가정에는 had p.p. 를 씁니다.",
        "It is time we review 처럼 원형을 쓰는 실수 — It is time 뒤에는 과거형이 옵니다."
      ],
      practice: [
        { q: "If the firm had adopted the new standard earlier, it ____ fewer compliance issues today.", opts: ["would have", "would have had", "will have", "had"], a: "would have", why: "과거의 가정이 현재 결과로 이어지는 혼합 가정법이므로 주절에 would + 원형을 씁니다." },
        { q: "The new hire talks ____ he had run the department for years.", opts: ["as if", "even if", "unless", "in case"], a: "as if", why: "사실이 아닌 것을 가정하는 as if 뒤에는 과거완료가 옵니다." },
        { q: "____ the timely warning, the crew would not have evacuated.", opts: ["But for", "Because of", "In spite of", "Apart from"], a: "But for", why: "명사구를 두고 가정의 뜻을 나타내는 표현은 But for 입니다." }
      ]
    },
    {
      no: 4,
      title: "명사절 심화 — that과 what",
      summary: "that절은 완전한 문장을, what절은 불완전한 문장을 이끕니다. 동격의 that으로 명사 내용을 설명합니다.",
      points: [
        {
          h: "that절과 what절의 구분",
          body: "that 뒤에는 주어와 동사가 모두 있는 완전한 절이 옵니다. what 뒤에는 주어나 목적어가 빠진 불완전한 절이 오고, what이 그 자리를 채웁니다.",
          table: {
            head: ["접속사", "뒤의 구조", "예문"],
            rows: [
              ["that", "완전한 절", "I know that the plan works."],
              ["what", "불완전한 절", "I know what the plan requires."]
            ]
          }
        },
        {
          h: "동격의 that",
          body: "fact, idea, belief, news, evidence 같은 명사 뒤에서 그 내용을 설명합니다. that을 생략할 수 없습니다.",
          examples: [
            { en: "The evidence that sales declined alarmed the board.", ko: "매출이 줄었다는 증거가 이사회를 놀라게 했습니다." },
            { en: "We support the idea that employees should vote on the policy.", ko: "우리는 직원들이 정책에 투표해야 한다는 의견을 지지합니다." }
          ]
        },
        {
          h: "that절을 취하는 동사와 가주어",
          body: "that절이 주어로 길어지면 가주어 It을 써서 뒤로 보냅니다. 주장·요구 동사 뒤에는 should가 생략된 원형이 옵니다.",
          examples: [
            { en: "It is essential that all staff complete the training.", ko: "모든 직원이 교육을 이수하는 것이 필수입니다." },
            { en: "The board recommended that the policy be revised.", ko: "이사회는 정책을 수정하라고 권고했습니다." }
          ]
        },
        {
          h: "전치사 뒤의 명사절",
          body: "that절은 전치사의 목적어로 쓸 수 없습니다. 이때는 the fact that이나 what절을 씁니다.",
          examples: [
            { en: "We focused on what the customer actually needed.", ko: "우리는 고객이 실제로 필요로 하는 것에 집중했습니다." },
            { en: "She insisted on the fact that the deadline had changed.", ko: "그녀는 마감이 바뀌었다는 사실을 강조했습니다." }
          ]
        }
      ],
      mistakes: [
        "I know what the plan works. 처럼 완전한 절에 what 을 쓰는 실수 — that 을 씁니다.",
        "동격의 that 을 생략하는 실수 — 동격절의 that 은 남겨 둡니다."
      ],
      practice: [
        { q: "The consultant explained ____ the new system would affect daily operations.", opts: ["what", "that", "which", "whether"], a: "that", why: "뒤에 주어와 동사가 모두 있는 완전한 절이 오므로 that 을 씁니다." },
        { q: "We should clarify ____ the client expects before signing the contract.", opts: ["that", "what", "whether", "because"], a: "what", why: "expects 의 목적어가 빠진 불완전한 절이므로 what 을 씁니다." },
        { q: "The management insisted that the report ____ by Friday.", opts: ["is submitted", "be submitted", "submits", "submitting"], a: "be submitted", why: "요구·주장을 나타내는 동사 뒤 that절에는 should 가 생략된 원형이 오고, 보고서는 제출되는 대상이므로 수동형 be submitted 입니다." }
      ]
    },
    {
      no: 5,
      title: "복합관계사",
      summary: "복합관계사는 선행사를 포함하며 명사절과 양보절을 이끕니다. -ever가 붙으면 '무엇이든, 누구든'의 뜻이 됩니다.",
      points: [
        {
          h: "명사절을 이끄는 복합관계사",
          body: "whoever, whatever, whichever는 선행사를 포함해 주어나 목적어가 되고, whenever, wherever, however는 부사절을 이끕니다.",
          table: {
            head: ["표현", "뜻", "예문"],
            rows: [
              ["whoever", "누구든지", "Whoever applied first will be contacted."],
              ["whatever", "무엇이든지", "Whatever you decide is fine with us."],
              ["whichever", "어느 것이든", "Whichever option you choose, the fee is the same."],
              ["however", "아무리 ~해도", "However hard he tried, the error remained."]
            ]
          }
        },
        {
          h: "however + 형용사·부사",
          body: "however 뒤에는 반드시 형용사나 부사가 옵니다. 양보의 뜻을 나타내는 문어체 표현입니다.",
          examples: [
            { en: "However carefully the team checked, one entry was missed.", ko: "팀이 아무리 꼼꼼히 확인해도 한 항목이 빠졌습니다." },
            { en: "However experienced the staff are, they need clear guidelines.", ko: "직원들이 아무리 숙련되어 있어도 명확한 지침이 필요합니다." }
          ]
        },
        {
          h: "양보의 복합관계부사",
          body: "wherever, whenever, no matter how는 모두 양보의 뜻을 만들 수 있습니다. 문어체에서는 -ever 형태를 선호합니다.",
          examples: [
            { en: "Wherever the branch is located, the same rules apply.", ko: "지점이 어디에 있든 같은 규칙이 적용됩니다." },
            { en: "Whenever the system fails, we log the incident.", ko: "시스템이 실패할 때마다 우리는 사고를 기록합니다." }
          ]
        }
      ],
      mistakes: [
        "However he tried hard 처럼 however 뒤 어순을 잘못 쓰는 실수 — However hard he tried 입니다.",
        "Whomever 는 목적격 자리에서만 씁니다. 주어 자리에는 Whoever 입니다."
      ],
      practice: [
        { q: "____ the cost, the company decided to proceed with the upgrade.", opts: ["Whatever", "Whoever", "However", "Whenever"], a: "Whatever", why: "뒤에 명사 the cost 가 오고 비용이 무엇이든이라는 뜻이므로 Whatever 를 씁니다." },
        { q: "____ complex the dataset is, the tool can analyze it.", opts: ["However", "Whatever", "Whenever", "Wherever"], a: "However", why: "However 뒤에 형용사 complex 가 오면 아무리 ~해도라는 양보의 뜻이 됩니다." },
        { q: "____ completes the safety module first will receive the certificate.", opts: ["Whoever", "Whomever", "Whatever", "Whichever"], a: "Whoever", why: "뒤 절에서 주어 역할을 하는 사람을 나타내므로 주격 Whoever 를 씁니다." }
      ]
    },
    {
      no: 6,
      title: "준동사의 완료·수동·부정",
      summary: "준동사는 시제와 태를 함께 표현할 수 있습니다. 완료형은 앞선 시점, 수동형은 당하는 관계를 나타냅니다.",
      points: [
        {
          h: "완료부정사 — to have p.p.",
          body: "주절의 시점보다 앞선 일을 나타냅니다. seem, believe, appear, be said 뒤에서 자주 씁니다.",
          table: {
            head: ["형태", "의미", "예문"],
            rows: [
              ["to have p.p.", "앞선 시점", "He seems to have forgotten the deadline."],
              ["to be -ing", "진행", "The team is said to be working remotely."],
              ["to have been -ing", "앞선 시점부터 진행", "She is believed to have been negotiating for weeks."]
            ]
          }
        },
        {
          h: "수동부정사와 수동동명사",
          body: "준동사의 주체가 동작을 당하면 to be p.p. 또는 being p.p.를 씁니다.",
          examples: [
            { en: "The report needs to be signed by both parties.", ko: "그 보고서는 양측의 서명을 받아야 합니다." },
            { en: "She dislikes being interrupted during presentations.", ko: "그녀는 발표 중에 방해받는 것을 싫어합니다." }
          ]
        },
        {
          h: "부정 준동사",
          body: "준동사의 부정은 to 앞 또는 -ing 앞에 not을 둡니다.",
          examples: [
            { en: "The staff were told not to share access codes.", ko: "직원들은 접속 코드를 공유하지 말라는 지시를 받았습니다." },
            { en: "Not having read the manual caused several errors.", ko: "설명서를 읽지 않은 것이 여러 오류를 일으켰습니다." }
          ]
        },
        {
          h: "완료동명사 — having p.p.",
          body: "동명사가 나타내는 일이 주절보다 앞설 때 씁니다. 문장의 주어로도 쓸 수 있습니다.",
          examples: [
            { en: "Having completed the audit was a requirement for promotion.", ko: "감사를 마치는 것이 승진의 요건이었습니다." },
            { en: "He denied having received the confidential file.", ko: "그는 기밀 파일을 받은 사실을 부인했습니다." }
          ]
        }
      ],
      mistakes: [
        "He seems to forget the deadline yesterday. 처럼 앞선 시점에 단순부정사를 쓰는 실수 — to have forgotten 입니다.",
        "Not to have read the manual caused errors. 처럼 부정 위치를 잘못 두는 실수 — 동명사 앞에는 Not having read 가 자연스럽습니다."
      ],
      practice: [
        { q: "The vendor appears ____ the specification before shipping the parts.", opts: ["to misread", "to have misread", "misreading", "to be misreading"], a: "to have misread", why: "출하보다 사양을 잘못 읽은 일이 앞서므로 완료부정사를 씁니다." },
        { q: "The equipment requires ____ every six months.", opts: ["to inspect", "to be inspected", "inspecting it", "inspect"], a: "to be inspected", why: "장비는 점검받는 대상이므로 수동부정사 to be inspected 를 씁니다." },
        { q: "The director was advised ____ the decision without consulting legal.", opts: ["not to make", "to not made", "not making", "no to make"], a: "not to make", why: "부정부정사는 to 앞에 not 을 두어 not to make 로 씁니다." }
      ]
    },
    {
      no: 7,
      title: "강조·생략·대용",
      summary: "It ~ that 강조구문, do 강조, 대부정사 to로 문장의 초점을 옮기고 반복을 줄입니다.",
      points: [
        {
          h: "It ~ that 강조구문",
          body: "강조할 요소를 It is와 that 사이에 넣습니다. 사람이면 that 대신 who를 쓸 수 있습니다.",
          table: {
            head: ["원래 문장", "강조구문"],
            rows: [
              ["The assistant sent the file.", "It was the assistant that sent the file."],
              ["We met the client in Busan.", "It was in Busan that we met the client."]
            ]
          }
        },
        {
          h: "do 강조",
          body: "일반동사 앞에 do, does, did를 넣어 뜻을 강조합니다. 뒤 동사는 반드시 원형입니다.",
          examples: [
            { en: "We do appreciate your patience during the renovation.", ko: "공사 기간 동안 인내해 주신 점에 정말 감사드립니다." },
            { en: "The manager did approve the request.", ko: "부장님은 그 요청을 실제로 승인했습니다." }
          ]
        },
        {
          h: "대부정사 to 와 대동사 do",
          body: "반복되는 to부정사는 to만 남기고, 반복되는 동사는 do, does, did로 대신합니다.",
          examples: [
            { en: "You may submit the form early if you wish to.", ko: "원하시면 양식을 일찍 제출하셔도 됩니다." },
            { en: "The Seoul team met the target, and so did the Busan team.", ko: "서울 팀이 목표를 달성했고 부산 팀도 그랬습니다." }
          ]
        },
        {
          h: "반복 요소의 생략",
          body: "접속사로 이어진 절에서 같은 주어·조동사·전치사는 생략할 수 있습니다. 문어체에서 문장이 간결해집니다.",
          examples: [
            { en: "The plan was approved and the budget released.", ko: "계획이 승인되고 예산이 배정되었습니다." },
            { en: "We will review the draft and publish the final version.", ko: "우리는 초안을 검토하고 최종본을 게시할 것입니다." }
          ]
        }
      ],
      mistakes: [
        "It was in Busan where we met. 처럼 강조구문에 where 를 쓰는 실수 — It was in Busan that we met 입니다.",
        "The manager did approved. 처럼 do 강조 뒤에 과거형을 쓰는 실수 — did approve 입니다."
      ],
      practice: [
        { q: "It was the security team ____ detected the breach first.", opts: ["that", "which", "what", "whose"], a: "that", why: "It ~ that 강조구문에서는 강조할 요소 뒤에 that 을 씁니다." },
        { q: "I ____ confirm that the order was shipped this morning.", opts: ["do", "did", "am", "have"], a: "do", why: "현재 일반동사 confirm 을 강조하는 do 강조로, 뒤에는 원형이 옵니다." },
        { q: "The regional office exceeded its target, and so ____ the branch in Daejeon.", opts: ["did", "was", "does it", "had"], a: "did", why: "앞 문장의 과거 동사를 대신하는 대동사 did 를 도치해 씁니다." }
      ]
    },
    {
      no: 8,
      title: "관계사 심화",
      summary: "계속적 용법과 전치사 + 관계대명사, 관계대명사 what으로 문장을 정교하게 연결합니다.",
      points: [
        {
          h: "제한적 용법과 계속적 용법",
          body: "콤마가 없으면 선행사를 특정하는 제한적 용법이고, 콤마가 있으면 추가 정보를 덧붙이는 계속적 용법입니다. 계속적 용법에서는 that을 쓸 수 없습니다.",
          table: {
            head: ["구분", "예문", "해석"],
            rows: [
              ["제한적", "The employees who worked overtime were paid.", "초과 근무한 직원들에게 급여가 지급됐다."],
              ["계속적", "The employees, who worked overtime, were paid.", "그 직원들은 초과 근무를 했고, 급여가 지급됐다."]
            ]
          }
        },
        {
          h: "전치사 + 관계대명사",
          body: "격식 문어체에서는 전치사를 관계대명사 앞에 둡니다. who는 whom으로 바꾸고, that은 쓸 수 없습니다.",
          examples: [
            { en: "The firm for which she works is expanding.", ko: "그녀가 일하는 회사는 확장 중입니다." },
            { en: "The method by which the data was collected is documented.", ko: "데이터를 수집한 방법이 문서화되어 있습니다." }
          ]
        },
        {
          h: "관계대명사 what",
          body: "선행사를 포함해 명사절을 이끕니다. the thing which와 같은 뜻이며 뒤에는 불완전한 절이 옵니다.",
          examples: [
            { en: "What the board approved was a three-year plan.", ko: "이사회가 승인한 것은 3개년 계획이었습니다." },
            { en: "We invested in what the market needed.", ko: "우리는 시장이 필요로 하는 것에 투자했습니다." }
          ]
        },
        {
          h: "관계사 뒤의 생략과 격식",
          body: "제한적 용법에서 목적격 관계대명사는 생략할 수 있고, 계속적 용법에서는 생략할 수 없습니다. 격식 문장일수록 생략을 줄입니다.",
          examples: [
            { en: "The invoice we received yesterday was incomplete.", ko: "어제 받은 송장은 불완전했습니다." },
            { en: "The invoice, which we received yesterday, was incomplete.", ko: "그 송장은 어제 받았는데, 불완전했습니다." }
          ]
        }
      ],
      mistakes: [
        "계속적 용법에 that 을 쓰는 실수 — 콤마 뒤에는 who 나 which 를 씁니다.",
        "The thing what he wanted 처럼 what 을 중복해 쓰는 실수 — 선행사가 있으면 which 나 that 을 씁니다."
      ],
      practice: [
        { q: "The consultant ____ we hired last year has moved to another firm.", opts: ["whom", "which", "whose", "what"], a: "whom", why: "사람 선행사의 목적격 자리이므로 whom 을 씁니다." },
        { q: "The report, ____ was submitted late, still contained useful data.", opts: ["that", "which", "what", "who"], a: "which", why: "콤마가 있는 계속적 용법에서는 that 을 쓸 수 없고 사물 선행사이므로 which 입니다." },
        { q: "The policy was based on ____ the focus groups reported.", opts: ["that", "what", "which", "where"], a: "what", why: "전치사 뒤에서 선행사를 포함하는 명사절을 이끄므로 what 을 씁니다." }
      ]
    },
    {
      no: 9,
      title: "시제 일치와 시간·조건 부사절",
      summary: "시간과 조건을 나타내는 부사절에서는 미래의 일도 현재시제로 씁니다. 주절과 종속절의 시제 관계를 정리합니다.",
      points: [
        {
          h: "시간·조건 부사절의 현재시제",
          body: "when, before, after, as soon as, until, if, unless 뒤에서는 미래의 일을 현재시제로 표현합니다.",
          table: {
            head: ["부사절 접속사", "예문"],
            rows: [
              ["when", "We will call you when the shipment arrives."],
              ["as soon as", "Please reply as soon as you receive the notice."],
              ["unless", "The event will be canceled unless the weather improves."]
            ]
          }
        },
        {
          h: "주절이 미래일 때의 종속절",
          body: "주절이 미래(will)이면 종속절은 현재, 주절이 현재완료이면 종속절은 과거로 맞춥니다.",
          examples: [
            { en: "By the time the auditors arrive, we will have organized the records.", ko: "감사관들이 도착할 때쯤이면 우리는 기록을 정리해 두었을 것입니다." },
            { en: "I have not heard from them since the contract was signed.", ko: "계약이 체결된 이후로 그들에게서 연락을 받지 못했습니다." }
          ]
        },
        {
          h: "시제 일치의 예외",
          body: "불변의 진리, 역사적 사실, 현재 습관은 주절이 과거여도 현재시제를 씁니다.",
          examples: [
            { en: "He explained that water boils at 100 degrees.", ko: "그는 물이 100도에서 끓는다고 설명했습니다." },
            { en: "She said she works from home every Friday.", ko: "그녀는 매주 금요일 재택 근무를 한다고 말했습니다." }
          ]
        },
        {
          h: "과거와 현재완료의 경계",
          body: "ago, last, yesterday는 과거시제와만, for, since, so far, recently는 현재완료와 자주 씁니다.",
          table: {
            head: ["표현", "시제", "예문"],
            rows: [
              ["two days ago", "과거", "The order arrived two days ago."],
              ["so far", "현재완료", "We have shipped 300 units so far."],
              ["since 2020", "현재완료", "Sales have doubled since 2020."]
            ]
          }
        }
      ],
      mistakes: [
        "We will call you when the shipment will arrive. 처럼 시간 부사절에 미래를 쓰는 실수 — arrives 로 씁니다.",
        "I have seen him last Monday. 처럼 끝난 시점과 현재완료를 함께 쓰는 실수 — saw 로 씁니다."
      ],
      practice: [
        { q: "The team will submit the proposal as soon as the figures ____ confirmed.", opts: ["will be", "are", "were", "have being"], a: "are", why: "as soon as 로 이끄는 시간 부사절에서는 미래를 현재시제로 씁니다." },
        { q: "We have not updated the manual since the process ____.", opts: ["changes", "changed", "will change", "has changed"], a: "changed", why: "since 뒤에는 과거의 특정 시점을 나타내는 과거시제가 옵니다." },
        { q: "The director explained that the policy ____ to all subsidiaries.", opts: ["applies", "applied will", "would applying", "is apply"], a: "applies", why: "현재도 유효한 규정이나 원칙은 주절이 과거여도 현재시제로 씁니다." }
      ]
    },
    {
      no: 10,
      title: "어순과 정보구조",
      summary: "영어는 중요한 정보를 문장 끝에 두는 경향이 있습니다. 무게 중심 원리를 알면 긴 문장이 읽힙니다.",
      points: [
        {
          h: "무게 중심 원리 — 끝에 긴 요소",
          body: "문장 요소가 길면 뒤로 보내는 것이 자연스럽습니다. 목적어가 길면 전치사구를 앞으로 옮기거나 수동태를 씁니다.",
          table: {
            head: ["부자연스러운 어순", "자연스러운 어순"],
            rows: [
              ["We sent the revised contract with the updated pricing table to the vendor.", "We sent the vendor the revised contract with the updated pricing table."],
              ["A new policy was announced by the company to reduce waste.", "The company announced a new policy to reduce waste."]
            ]
          }
        },
        {
          h: "주제와 초점",
          body: "문장 앞에는 이미 알고 있는 정보(주제), 뒤에는 새로운 정보(초점)를 둡니다. 이 원리 때문에 수동태와 도치가 쓰입니다.",
          examples: [
            { en: "The brochure was designed by an outside agency.", ko: "그 안내서는 외부 대행사가 디자인했습니다." },
            { en: "Among the proposals was a plan to shorten the approval process.", ko: "제안들 중에는 승인 절차를 줄이는 계획이 있었습니다." }
          ]
        },
        {
          h: "부사구의 위치",
          body: "장소, 시간, 방법 순서로 배열하는 것이 기본입니다. 빈도 부사와 태도 부사는 위치가 다릅니다.",
          table: {
            head: ["부사 종류", "위치", "예문"],
            rows: [
              ["장소·시간", "문장 끝", "The team met the vendor in Busan yesterday."],
              ["빈도", "일반동사 앞", "We often review the figures on Fridays."],
              ["태도", "조동사 뒤", "The board will probably approve the plan."]
            ]
          }
        },
        {
          h: "강조를 위한 전치",
          body: "강조할 요소를 문장 앞으로 옮기면 초점이 이동합니다. 도치가 함께 일어나기도 합니다.",
          examples: [
            { en: "This proposal the board rejected without discussion.", ko: "이 제안을 이사회는 논의 없이 거부했습니다." },
            { en: "Only after the audit did the errors become clear.", ko: "감사 이후에야 오류가 분명해졌습니다." }
          ]
        }
      ],
      mistakes: [
        "긴 목적어를 동사 바로 뒤에 두고 읽기 어려운 문장을 만드는 실수 — 목적어가 길면 뒤로 보냅니다.",
        "빈도 부사를 문장 끝에 두는 실수 — 빈도 부사는 일반동사 앞에 둡니다."
      ],
      practice: [
        { q: "The coordinator ____ the reports on the first Monday of each month.", opts: ["reviews usually", "usually reviews", "reviews usual", "usual reviews"], a: "usually reviews", why: "빈도 부사 usually 는 일반동사 앞에 둡니다." },
        { q: "The board will ____ approve the revised budget after the audit.", opts: ["probable", "probably", "probability", "probablely"], a: "probably", why: "조동사 will 뒤, 본동사 앞에 태도 부사 probably 가 옵니다." },
        { q: "Only after the inspection ____ the safety issues clear.", opts: ["became", "did become", "becoming", "become"], a: "did become", why: "Only + 부사구가 문두에 오면 주절이 도치되고, 과거이므로 did become 을 씁니다." }
      ]
    },
    {
      no: 11,
      title: "접속사 심화",
      summary: "격식 문어체의 양보·조건·이유 표현과 상관접속사의 병렬 구조를 정확히 씁니다.",
      points: [
        {
          h: "격식 있는 양보 표현",
          body: "even though, although는 기본형이고, notwithstanding, albeit, much as는 문어체에서 자주 쓰입니다.",
          table: {
            head: ["표현", "뒤에 오는 것", "예문"],
            rows: [
              ["although / even though", "절", "Although the cost rose, output increased."],
              ["notwithstanding", "명사구", "Notwithstanding the delay, the client renewed the contract."],
              ["albeit", "형용사·부사구", "The results were positive, albeit modest."]
            ]
          }
        },
        {
          h: "조건의 격식 표현",
          body: "provided that, on condition that, in the event that, in case는 조건을 나타내는 접속사입니다. 뒤에는 절이 옵니다.",
          examples: [
            { en: "The discount applies provided that payment is made within 30 days.", ko: "결제가 30일 이내에 이루어지면 할인이 적용됩니다." },
            { en: "In the event that the shipment is delayed, we will compensate you.", ko: "배송이 지연되는 경우 보상해 드리겠습니다." }
          ]
        },
        {
          h: "상관접속사와 병렬 구조",
          body: "both A and B, either A or B, neither A nor B, not only A but also B는 A와 B를 같은 형태로 맞춰야 합니다.",
          table: {
            head: ["표현", "예문"],
            rows: [
              ["both A and B", "The role requires both accuracy and speed."],
              ["not only A but also B", "The update improved not only speed but also stability."],
              ["either A or B", "Either the manager or the supervisor will sign."]
            ]
          },
          note: "neither A nor B 가 주어이면 동사는 B 에 맞춥니다. Neither the staff nor the manager was informed."
        },
        {
          h: "이유와 결과의 격식 표현",
          body: "owing to, due to, on account of는 이유를 나타내는 전치사구이고, so that, such that은 결과·목적을 나타냅니다.",
          examples: [
            { en: "Owing to the strike, the delivery schedule changed.", ko: "파업 때문에 배송 일정이 바뀌었습니다." },
            { en: "The report was arranged so that the key figures appear first.", ko: "핵심 수치가 먼저 나오도록 보고서를 구성했습니다." }
          ]
        }
      ],
      mistakes: [
        "not only A but also B 에서 A 와 B 의 형태를 다르게 쓰는 실수 — 같은 품사와 구조로 맞춥니다.",
        "due to 뒤에 절을 두는 실수 — due to 뒤에는 명사구가 옵니다."
      ],
      practice: [
        { q: "The proposal was accepted, ____ with minor revisions.", opts: ["albeit", "although", "despite", "whereas"], a: "albeit", why: "뒤에 명사구 with minor revisions 가 오는 양보 표현은 albeit 입니다." },
        { q: "The plan will proceed ____ that the funding is approved.", opts: ["provided", "despite", "although", "unless"], a: "provided", why: "provided that 은 조건을 나타내는 접속사로 뒤에 절이 옵니다." },
        { q: "The workshop covers not only budgeting ____ also forecasting.", opts: ["and", "but", "or", "nor"], a: "but", why: "not only A but also B 상관접속사의 짝이므로 but 을 씁니다." }
      ]
    },
    {
      no: 12,
      title: "담화 문법 — 응집성 있는 문장 쓰기",
      summary: "좋은 글은 문장 사이의 연결이 분명합니다. 대조·양보·추론의 표지를 정확히 골라 논리를 드러냅니다.",
      points: [
        {
          h: "문장 간 연결 장치",
          body: "앞 문장의 내용을 받아 이어 주는 표현을 씁니다. 지시어, 반복, 연결어가 대표적입니다.",
          table: {
            head: ["기능", "표현", "예문"],
            rows: [
              ["지시", "this, these, such", "Such results suggest a structural problem."],
              ["반복", "동의어·대용 표현", "The consultant raised the issue again yesterday."],
              ["연결", "as a result, by contrast", "By contrast, the northern branch grew."]
            ]
          }
        },
        {
          h: "대조와 양보의 구분",
          body: "대조는 서로 다른 두 사실을 나란히, 양보는 예상과 다른 결과를 제시합니다. however와 nevertheless를 구분해 씁니다.",
          examples: [
            { en: "The costs fell. However, the quality also dropped.", ko: "비용은 줄었습니다. 그러나 품질도 떨어졌습니다." },
            { en: "The costs fell; nevertheless, the product remained reliable.", ko: "비용은 줄었습니다. 그럼에도 제품은 여전히 믿을 만했습니다." }
          ]
        },
        {
          h: "추론과 결론의 표지",
          body: "therefore와 thus는 논리적 결론, hence는 결과, in sum과 in short는 요약을 나타냅니다. 격식 문서에서는 thus와 hence가 선호됩니다.",
          examples: [
            { en: "Demand exceeded supply; hence the price increase.", ko: "수요가 공급을 넘었고, 따라서 가격이 올랐습니다." },
            { en: "In sum, the pilot program achieved its primary objectives.", ko: "요약하면 시범 사업은 주요 목표를 달성했습니다." }
          ]
        },
        {
          h: "학술 문장의 응집성",
          body: "주장에는 근거를 붙이고, 근거의 출처를 밝히며, 반론을 먼저 인정하는 구조가 격식 있는 글의 기본입니다.",
          examples: [
            { en: "While the initial data were limited, the pattern was consistent.", ko: "초기 데이터는 제한적이었지만 양상은 일관되었습니다." },
            { en: "The evidence suggests that remote work improves retention.", ko: "그 증거는 재택 근무가 재직률을 높인다는 것을 시사합니다." }
          ]
        }
      ],
      mistakes: [
        "대조와 양보를 같은 뜻으로 섞어 쓰는 실수 — 대조는 차이, 양보는 예상 밖의 결과입니다.",
        "연결어를 문장 안에서 두 절을 연결하는 접속사처럼 쓰는 실수 — 세미콜론과 콤마를 사용합니다."
      ],
      practice: [
        { q: "The initial results were encouraging. ____, the sample size was too small.", opts: ["However", "Therefore", "Moreover", "Similarly"], a: "However", why: "앞 내용과 상반되는 내용을 이어 주므로 However 를 씁니다." },
        { q: "Production costs declined; ____, the margin improved.", opts: ["hence", "whereas", "despite", "unlike"], a: "hence", why: "앞 내용의 결과를 나타내는 연결어 hence 가 맞습니다." },
        { q: "____ the survey covered only two cities, the findings were consistent.", opts: ["While", "Because", "So", "Thus"], a: "While", why: "양보의 의미로 두 절을 이으므로 접속사 While 을 씁니다." }
      ]
    }
  ]
});
