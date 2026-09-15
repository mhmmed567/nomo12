import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

type Difficulty = "سهل" | "متوسط" | "صعب";

type RawQuestion = {
  id?: unknown;
  question?: unknown;
  options?: unknown;
  correctAnswer?: unknown;
  difficulty?: unknown;
  domain?: unknown;
  explanation?: unknown;
};

type RawQuestionsResult = {
  title?: unknown;
  description?: unknown;
  questions?: unknown;
};

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: Difficulty;
  domain: string;
  explanation: string;
};

type QuestionsResult = {
  title: string;
  description: string;
  questions: Question[];
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

function cleanAndParseJSON(text: string): unknown {
  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

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

    throw new Error("Invalid JSON from AI");
  }
}

function isString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function normalizeDifficulty(
  value: unknown,
  index: number
): Difficulty {
  if (
    value === "سهل" ||
    value === "متوسط" ||
    value === "صعب"
  ) {
    return value;
  }

  if (index < 3) {
    return "سهل";
  }

  if (index < 7) {
    return "متوسط";
  }

  return "صعب";
}

function normalizeQuestion(
  raw: RawQuestion,
  index: number,
  topic: string
): Question | null {
  if (!raw || typeof raw !== "object") {
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

  const options: string[] = raw.options.map(
    (option: unknown): string =>
      typeof option === "string"
        ? option.trim()
        : ""
  );

  if (
    options.some(
      (option: string): boolean => !option
    )
  ) {
    return null;
  }

  const uniqueOptions = new Set(
    options.map(
      (option: string): string =>
        option.toLowerCase()
    )
  );

  if (uniqueOptions.size !== 4) {
    return null;
  }

  let correctAnswer = Number(
    raw.correctAnswer
  );

  if (
    !Number.isInteger(correctAnswer) ||
    correctAnswer < 0 ||
    correctAnswer > 3
  ) {
    correctAnswer = 0;
  }

  return {
    id: index + 1,

    question: raw.question.trim(),

    options,

    correctAnswer,

    difficulty: normalizeDifficulty(
      raw.difficulty,
      index
    ),

    domain: isString(raw.domain)
      ? raw.domain.trim()
      : topic,

    explanation: isString(
      raw.explanation
    )
      ? raw.explanation.trim()
      : "هذه هي الإجابة الصحيحة حسب السؤال.",
  };
}

function normalizeResult(
  raw: RawQuestionsResult,
  topic: string
): QuestionsResult | null {
  if (
    !raw ||
    typeof raw !== "object" ||
    !Array.isArray(raw.questions)
  ) {
    return null;
  }

  const normalized: Question[] = raw.questions
    .map(
      (
        question: unknown,
        index: number
      ): Question | null => {
        if (
          !question ||
          typeof question !== "object"
        ) {
          return null;
        }

        return normalizeQuestion(
          question as RawQuestion,
          index,
          topic
        );
      }
    )
    .filter(
      (
        question: Question | null
      ): question is Question =>
        question !== null
    );

  if (normalized.length !== 10) {
    return null;
  }

  const questions: Question[] =
    normalized.map(
      (
        question: Question,
        index: number
      ): Question => ({
        ...question,

        id: index + 1,

        difficulty:
          index < 3
            ? "سهل"
            : index < 7
              ? "متوسط"
              : "صعب",
      })
    );

  return {
    title: isString(raw.title)
      ? raw.title.trim()
      : "اختبار NOMO الذكي",

    description: isString(
      raw.description
    )
      ? raw.description.trim()
      : "اختبار لتحديد مستواك",

    questions,
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

    const body: unknown =
      await request.json();

    const bodyObject =
      body &&
      typeof body === "object"
        ? body as Record<string, unknown>
        : {};

    const topic =
      typeof bodyObject.topic === "string" &&
      bodyObject.topic.trim()
        ? bodyObject.topic.trim()
        : "المعرفة العامة";

    const level =
      typeof bodyObject.level === "string" &&
      bodyObject.level.trim()
        ? bodyObject.level.trim()
        : "مبتدئ";

    const goal =
      typeof bodyObject.goal === "string" &&
      bodyObject.goal.trim()
        ? bodyObject.goal.trim()
        : "تطوير المعرفة";

    if (
      topic.length > 100 ||
      level.length > 50 ||
      goal.length > 200
    ) {
      return jsonResponse(
        {
          error:
            "بيانات الاختبار طويلة جدًا.",
        },
        400
      );
    }

    const prompt = `
أنت نظام NOMO، منصة تعلم تكيفية بالذكاء الاصطناعي.

أنشئ اختبارًا تعليميًا باللغة العربية لتحديد مستوى المتعلم.

المجال:
${topic}

المستوى المتوقع:
${level}

هدف المستخدم:
${goal}

أنشئ 10 أسئلة بالضبط.

توزيع الصعوبة المطلوب:

الأسئلة 1 إلى 3:
سهل

الأسئلة 4 إلى 7:
متوسط

الأسئلة 8 إلى 10:
صعب

كل سؤال يجب أن يحتوي على:

- id
- question
- options
- correctAnswer
- difficulty
- domain
- explanation

كل سؤال يجب أن يحتوي على 4 خيارات بالضبط.

correctAnswer هو رقم يبدأ من 0:

0 = الخيار الأول
1 = الخيار الثاني
2 = الخيار الثالث
3 = الخيار الرابع

مهم جدًا:

- لا تكرر الأسئلة.
- لا تكرر الخيارات داخل السؤال.
- اجعل الأسئلة تقيس الفهم والتطبيق والتحليل وحل المشكلات.
- لا تجعل جميع الأسئلة تعتمد على الحفظ.
- explanation باللغة العربية.
- جميع الأسئلة والخيارات باللغة العربية.

أرجع JSON فقط.

لا Markdown.
لا code fence.
لا تكتب أي شيء خارج JSON.

الشكل:

{
  "title": "اختبار NOMO الذكي",
  "description": "اختبار لتحديد مستواك",
  "questions": [
    {
      "id": 1,
      "question": "السؤال هنا",
      "options": [
        "الخيار الأول",
        "الخيار الثاني",
        "الخيار الثالث",
        "الخيار الرابع"
      ],
      "correctAnswer": 0,
      "difficulty": "سهل",
      "domain": "${topic}",
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}

يجب أن يحتوي questions على 10 عناصر بالضبط.
`;

    const response = await fetch(
      OPENROUTER_URL,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",

          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3000",

          "X-Title": "NOMO",
        },

        body: JSON.stringify({
          model:
            process.env.OPENROUTER_MODEL ||
            "openai/gpt-4o-mini",

          temperature: 0.2,

          response_format: {
            type: "json_object",
          },

          messages: [
            {
              role: "system",
              content:
                "أنت خبير في تصميم الاختبارات التعليمية التكيفية. أرجع JSON صالح فقط.",
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
        "OPENROUTER ERROR:",
        response.status,
        responseText
      );

      return jsonResponse(
        {
          error:
            "تعذر إنشاء الاختبار حاليًا.",
        },
        502
      );
    }

    let apiData: unknown;

    try {
      apiData =
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

    const apiObject =
      apiData &&
      typeof apiData === "object"
        ? apiData as Record<string, unknown>
        : null;

    const choices =
      apiObject?.choices;

    let content: string | null = null;

    if (Array.isArray(choices)) {
      const firstChoice =
        choices[0];

      if (
        firstChoice &&
        typeof firstChoice === "object"
      ) {
        const choice =
          firstChoice as Record<
            string,
            unknown
          >;

        const message =
          choice.message;

        if (
          message &&
          typeof message === "object"
        ) {
          const messageObject =
            message as Record<
              string,
              unknown
            >;

          if (
            typeof messageObject.content ===
            "string"
          ) {
            content =
              messageObject.content;
          }
        }
      }
    }

    if (
      !content ||
      !content.trim()
    ) {
      console.error(
        "NO AI CONTENT:",
        apiData
      );

      return jsonResponse(
        {
          error:
            "لم يرجع الذكاء الاصطناعي أسئلة.",
        },
        502
      );
    }

    let parsed: unknown;

    try {
      parsed =
        cleanAndParseJSON(content);
    } catch (error) {
      console.error(
        "AI INVALID JSON:",
        error
      );

      console.error(
        "AI CONTENT:",
        content
      );

      return jsonResponse(
        {
          error:
            "الذكاء الاصطناعي أرجع بيانات غير صالحة.",
        },
        502
      );
    }

    const result =
      normalizeResult(
        parsed as RawQuestionsResult,
        topic
      );

    if (!result) {
      console.error(
        "INVALID QUESTIONS AFTER NORMALIZATION:",
        parsed
      );

      return jsonResponse(
        {
          error:
            "تعذر تجهيز الأسئلة بالشكل المطلوب. حاول مرة أخرى.",
        },
        502
      );
    }

    return jsonResponse(result);
  } catch (error) {
    console.error(
      "NOMO QUESTIONS ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          "حدث خطأ غير متوقع أثناء إنشاء الاختبار.",
      },
      500
    );
  }
}