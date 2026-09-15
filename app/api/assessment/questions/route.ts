import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

type Difficulty = "سهل" | "متوسط" | "صعب";

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

function cleanAndParseJSON(text: string) {
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
  raw: any,
  index: number,
  topic: string
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

  const options = raw.options.map(
    (option: unknown) =>
      typeof option === "string"
        ? option.trim()
        : ""
  );

  if (
    options.some(
      (option) => !option
    )
  ) {
    return null;
  }

  const uniqueOptions =
    new Set(
      options.map((option) =>
        option.toLowerCase()
      )
    );

  if (uniqueOptions.size !== 4) {
    return null;
  }

  let correctAnswer =
    Number(raw.correctAnswer);

  if (
    !Number.isInteger(correctAnswer) ||
    correctAnswer < 0 ||
    correctAnswer > 3
  ) {
    correctAnswer = 0;
  }

  return {
    id: index + 1,
    question:
      raw.question.trim(),

    options,

    correctAnswer,

    difficulty:
      normalizeDifficulty(
        raw.difficulty,
        index
      ),

    domain:
      isString(raw.domain)
        ? raw.domain.trim()
        : topic,

    explanation:
      isString(raw.explanation)
        ? raw.explanation.trim()
        : "هذه هي الإجابة الصحيحة حسب السؤال.",
  };
}

function normalizeResult(
  raw: any,
  topic: string
): QuestionsResult | null {
  if (
    !raw ||
    typeof raw !== "object" ||
    !Array.isArray(raw.questions)
  ) {
    return null;
  }

  const normalized =
    raw.questions
      .map(
        (question: any, index: number) =>
          normalizeQuestion(
            question,
            index,
            topic
          )
      )
      .filter(
        (
          question: Question | null
        ): question is Question =>
          question !== null
      );

  /*
   * يجب أن يكون لدينا 10 أسئلة
   */
  if (normalized.length !== 10) {
    return null;
  }

  /*
   * نفرض توزيع الصعوبة المطلوب.
   *
   * 1 - 3 = سهل
   * 4 - 7 = متوسط
   * 8 - 10 = صعب
   */
  const questions =
    normalized.map(
      (question, index) => ({
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
    title:
      isString(raw.title)
        ? raw.title.trim()
        : "اختبار NOMO الذكي",

    description:
      isString(raw.description)
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

    const body =
      await request.json();

    const topic =
      typeof body?.topic === "string" &&
      body.topic.trim()
        ? body.topic.trim()
        : "المعرفة العامة";

    const level =
      typeof body?.level === "string" &&
      body.level.trim()
        ? body.level.trim()
        : "مبتدئ";

    const goal =
      typeof body?.goal === "string" &&
      body.goal.trim()
        ? body.goal.trim()
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

    const response =
      await fetch(
        OPENROUTER_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

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

    let apiData: any;

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

    const content =
      apiData?.choices?.[0]
        ?.message?.content;

    if (
      typeof content !== "string" ||
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

    let parsed: any;

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
        parsed,
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