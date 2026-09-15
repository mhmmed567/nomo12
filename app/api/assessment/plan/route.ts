import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

type PlanRequest = {
  result?: unknown;
};

type KnowledgeItem = {
  title: string;
  content: string;
  important: boolean;
};

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type Challenge = {
  title: string;
  description: string;
  task: string;
  hint: string;
  successCriteria: string;
};

type Exercise = {
  title: string;
  description: string;
  task: string;
};

type LearningDay = {
  day: number;
  title: string;
  domain: string;
  difficulty: string;
  duration: number;
  objective: string;
  knowledge: KnowledgeItem[];
  challenge: Challenge;
  questions: Question[];
  exercise: Exercise;
  xp: number;
};

type LearningPlan = {
  title: string;
  description: string;
  level: string;
  totalDays: number;
  dailyGoal: string;
  days: LearningDay[];
};

function jsonResponse(
  data: unknown,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function cleanAndParseJSON(
  text: string
) {
  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace !== -1 &&
      lastBrace !== -1 &&
      lastBrace > firstBrace
    ) {
      return JSON.parse(
        cleaned.slice(
          firstBrace,
          lastBrace + 1
        )
      );
    }

    throw new Error(
      "Invalid JSON from AI"
    );
  }
}

function isString(value: unknown) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function safeString(
  value: unknown,
  fallback: string
) {
  return isString(value)
    ? String(value).trim()
    : fallback;
}

function safeInteger(
  value: unknown,
  fallback: number
) {
  const number = Number(value);

  return Number.isInteger(number)
    ? number
    : fallback;
}

function normalizeDifficulty(
  value: unknown,
  index: number
) {
  if (
    value === "سهل" ||
    value === "متوسط" ||
    value === "صعب"
  ) {
    return value;
  }

  if (index < 2) {
    return "سهل";
  }

  if (index < 5) {
    return "متوسط";
  }

  return "صعب";
}

function normalizeKnowledge(
  raw: any
): KnowledgeItem | null {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }

  if (
    !isString(raw.title) ||
    !isString(raw.content)
  ) {
    return null;
  }

  return {
    title:
      raw.title.trim(),

    content:
      raw.content.trim(),

    important:
      typeof raw.important === "boolean"
        ? raw.important
        : false,
  };
}

function normalizeQuestion(
  raw: any
): Question | null {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }

  if (!isString(raw.question)) {
    return null;
  }

  if (
    !Array.isArray(raw.options) ||
    raw.options.length !== 4
  ) {
    return null;
  }

  const options =
    raw.options.map(
      (option: unknown) =>
        typeof option === "string"
          ? option.trim()
          : ""
    );

  if (
    options.some(
      (option: string) => !option
    )
  ) {
    return null;
  }

  const correctAnswer =
    safeInteger(
      raw.correctAnswer,
      0
    );

  if (
    correctAnswer < 0 ||
    correctAnswer > 3
  ) {
    return null;
  }

  return {
    question:
      raw.question.trim(),

    options,

    correctAnswer,

    explanation:
      safeString(
        raw.explanation,
        "هذه هي الإجابة الصحيحة بناءً على السؤال."
      ),
  };
}

function normalizeChallenge(
  raw: any
): Challenge | null {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }

  return {
    title:
      safeString(
        raw.title,
        "التحدي العملي"
      ),

    description:
      safeString(
        raw.description,
        "طبّق ما تعلمته في مهمة عملية."
      ),

    task:
      safeString(
        raw.task,
        "نفّذ المهمة باستخدام المهارة التي تعلمتها اليوم."
      ),

    hint:
      safeString(
        raw.hint,
        "ابدأ بتقسيم المهمة إلى خطوات صغيرة."
      ),

    successCriteria:
      safeString(
        raw.successCriteria,
        "إكمال المهمة وتحقيق الهدف المطلوب."
      ),
  };
}

function normalizeExercise(
  raw: any
): Exercise {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return {
      title: "تمرين اليوم",
      description:
        "طبّق ما تعلمته اليوم.",
      task:
        "أنجز تمرينًا عمليًا مرتبطًا بموضوع اليوم.",
    };
  }

  return {
    title:
      safeString(
        raw.title,
        "تمرين اليوم"
      ),

    description:
      safeString(
        raw.description,
        "طبّق ما تعلمته اليوم."
      ),

    task:
      safeString(
        raw.task,
        "أنجز تمرينًا عمليًا مرتبطًا بموضوع اليوم."
      ),
  };
}

function normalizeDay(
  raw: any,
  index: number
): LearningDay | null {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }

  const rawKnowledge =
    Array.isArray(raw.knowledge)
      ? raw.knowledge
      : [];

  const knowledge =
    rawKnowledge
      .map(normalizeKnowledge)
      .filter(
        (
          item: KnowledgeItem | null
        ): item is KnowledgeItem =>
          item !== null
      );

  if (knowledge.length === 0) {
    return null;
  }

  const rawQuestions =
    Array.isArray(raw.questions)
      ? raw.questions
      : [];

  const questions =
    rawQuestions
      .map(normalizeQuestion)
      .filter(
        (
          item: Question | null
        ): item is Question =>
          item !== null
      );

  if (questions.length === 0) {
    return null;
  }

  const challenge =
    normalizeChallenge(
      raw.challenge
    );

  if (!challenge) {
    return null;
  }

  return {
    day: index + 1,

    title:
      safeString(
        raw.title,
        `اليوم ${index + 1}`
      ),

    domain:
      safeString(
        raw.domain,
        "تطوير المهارات"
      ),

    difficulty:
      normalizeDifficulty(
        raw.difficulty,
        index
      ),

    duration: Math.max(
      15,
      Math.min(
        180,
        safeInteger(
          raw.duration,
          30
        )
      )
    ),

    objective:
      safeString(
        raw.objective,
        "فهم المهارة وتطبيقها عمليًا."
      ),

    knowledge:
      knowledge.slice(0, 4),

    challenge,

    questions:
      questions.slice(0, 5),

    exercise:
      normalizeExercise(
        raw.exercise
      ),

    xp: Math.max(
      50,
      Math.min(
        250,
        safeInteger(
          raw.xp,
          index === 0
            ? 75
            : index === 6
              ? 200
              : 125
        )
      )
    ),
  };
}

function normalizePlan(
  raw: any
): LearningPlan | null {
  if (
    !raw ||
    typeof raw !== "object" ||
    !Array.isArray(raw.days)
  ) {
    return null;
  }

  /*
   * نحتاج 7 أيام على الأقل.
   */
  if (raw.days.length < 7) {
    return null;
  }

  const days: LearningDay[] = [];

  for (let i = 0; i < 7; i++) {
    const day =
      normalizeDay(
        raw.days[i],
        i
      );

    if (!day) {
      return null;
    }

    days.push(day);
  }

  return {
    title:
      safeString(
        raw.title,
        "خطة تطوير NOMO"
      ),

    description:
      safeString(
        raw.description,
        "خطة تعلم شخصية مصممة بناءً على نتيجة تقييمك."
      ),

    level:
      safeString(
        raw.level,
        "مبتدئ"
      ),

    totalDays: 7,

    dailyGoal:
      safeString(
        raw.dailyGoal,
        "التعلم والتطبيق يوميًا."
      ),

    days,
  };
}

export async function POST(
  request: Request
) {
  try {
    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return jsonResponse(
        {
          error:
            "إعدادات الذكاء الاصطناعي غير مكتملة.",
        },
        500
      );
    }

    const body =
      (await request.json()) as PlanRequest;

    if (!body.result) {
      return jsonResponse(
        {
          error:
            "لم يتم إرسال نتيجة التقييم.",
        },
        400
      );
    }

    const resultString =
      JSON.stringify(body.result);

    if (
      resultString.length > 50000
    ) {
      return jsonResponse(
        {
          error:
            "بيانات التقييم كبيرة جدًا.",
        },
        413
      );
    }

    const prompt = `
أنت محرك التعلم التكيفي في منصة NOMO.

مهمتك إنشاء خطة تعلم شخصية لمدة 7 أيام.

نتيجة تقييم المستخدم:

${resultString}

━━━━━━━━━━━━━━━━━━━━
الهدف
━━━━━━━━━━━━━━━━━━━━

أنشئ خطة شخصية تعتمد على:

- نقاط الضعف.
- نقاط القوة.
- المجالات.
- مستوى المستخدم.
- نتيجة الاختبار.

لا تجعل الخطة عامة.

━━━━━━━━━━━━━━━━━━━━
كل يوم
━━━━━━━━━━━━━━━━━━━━

يجب أن يحتوي على:

- 2 إلى 4 معلومات.
- تحدي عملي واحد.
- 3 إلى 5 أسئلة.
- تمرين عملي واحد.
- XP.
- هدف واضح.
- مدة.
- مستوى صعوبة.

━━━━━━━━━━━━━━━━━━━━
اليوم السابع
━━━━━━━━━━━━━━━━━━━━

اليوم السابع هو التحدي النهائي.

يجب أن يجمع أهم المهارات التي تعلمها المستخدم خلال الأيام السابقة.

━━━━━━━━━━━━━━━━━━━━
صيغة JSON
━━━━━━━━━━━━━━━━━━━━

أرجع JSON فقط.

لا Markdown.
لا code fence.
لا شرح خارج JSON.

{
  "title": "خطة تطوير شخصية",
  "description": "",
  "level": "",
  "totalDays": 7,
  "dailyGoal": "",
  "days": [
    {
      "day": 1,
      "title": "",
      "domain": "",
      "difficulty": "سهل",
      "duration": 30,
      "objective": "",
      "knowledge": [
        {
          "title": "",
          "content": "",
          "important": true
        },
        {
          "title": "",
          "content": "",
          "important": false
        }
      ],
      "challenge": {
        "title": "",
        "description": "",
        "task": "",
        "hint": "",
        "successCriteria": ""
      },
      "questions": [
        {
          "question": "",
          "options": [
            "",
            "",
            "",
            ""
          ],
          "correctAnswer": 0,
          "explanation": ""
        }
      ],
      "exercise": {
        "title": "",
        "description": "",
        "task": ""
      },
      "xp": 100
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━
قواعد مهمة جدًا
━━━━━━━━━━━━━━━━━━━━

- أنشئ 7 أيام كاملة.
- لا تضع أقل من معلومتين في أي يوم.
- لا تضع أكثر من 4 معلومات.
- لا تضع أقل من 3 أسئلة في أي يوم.
- لا تضع أكثر من 5 أسئلة.
- كل سؤال يحتوي على 4 خيارات.
- correctAnswer رقم من 0 إلى 3.
- challenge موجود في كل يوم.
- exercise موجود في كل يوم.
- duration رقم.
- xp رقم.
- جميع المحتوى باللغة العربية.
- لا تكرر الأسئلة.
- لا تكرر التحديات.
- اليوم السابع تحدي نهائي.
- اربط الخطة بنتيجة المستخدم.
- أرجع JSON صالح فقط.
`;

    const response =
      await fetch(
        OPENROUTER_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${apiKey}`,

            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL ||
              "http://localhost:3000",

            "X-Title": "NOMO",
          },

          body: JSON.stringify({
            model:
              process.env.OPENROUTER_MODEL ||
              "openai/gpt-4o-mini",

            temperature: 0.25,

            response_format: {
              type: "json_object",
            },

            messages: [
              {
                role: "system",
                content:
                  "أنت خبير في تصميم خطط التعلم التكيفية. أرجع JSON صالح فقط.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

    const responseText =
      await response.text();

    if (!response.ok) {
      console.error(
        "OPENROUTER PLAN ERROR:",
        response.status,
        responseText
      );

      return jsonResponse(
        {
          error:
            "تعذر إنشاء خطة التعلم حاليًا.",
        },
        502
      );
    }

    let openRouterData: any;

    try {
      openRouterData =
        JSON.parse(responseText);
    } catch {
      console.error(
        "INVALID OPENROUTER RESPONSE:",
        responseText
      );

      return jsonResponse(
        {
          error:
            "استجابة الذكاء الاصطناعي غير صالحة.",
        },
        502
      );
    }

    const aiContent =
      openRouterData
        ?.choices?.[0]
        ?.message?.content;

    if (
      typeof aiContent !== "string" ||
      !aiContent.trim()
    ) {
      console.error(
        "NO PLAN CONTENT:",
        openRouterData
      );

      return jsonResponse(
        {
          error:
            "لم يرجع الذكاء الاصطناعي خطة.",
        },
        502
      );
    }

    let parsed: any;

    try {
      parsed =
        cleanAndParseJSON(
          aiContent
        );
    } catch (error) {
      console.error(
        "INVALID PLAN JSON:",
        error
      );

      console.error(
        "AI CONTENT:",
        aiContent
      );

      return jsonResponse(
        {
          error:
            "الذكاء الاصطناعي أرجع خطة غير صالحة.",
        },
        502
      );
    }

    const plan =
      normalizePlan(parsed);

    if (!plan) {
      console.error(
        "INVALID PLAN STRUCTURE:",
        parsed
      );

      return jsonResponse(
        {
          error:
            "تعذر تجهيز خطة التعلم بالشكل المطلوب. حاول مرة أخرى.",
        },
        502
      );
    }

    return jsonResponse(plan);
  } catch (error) {
    console.error(
      "NOMO PLAN API ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          "حدث خطأ غير متوقع أثناء إنشاء الخطة.",
      },
      500
    );
  }
}