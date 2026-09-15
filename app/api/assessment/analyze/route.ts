import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function extractJson(content: string) {
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function calculateScore(
  questions: any[],
  answers: any[]
) {
  if (questions.length === 0) {
    return 0;
  }

  let correct = 0;

  questions.forEach((question, index) => {
    const answer = answers[index];

    if (
      answer !== undefined &&
      answer !== null &&
      String(answer) === String(question.correctAnswer)
    ) {
      correct++;
    }
  });

  return Math.round(
    (correct / questions.length) * 100
  );
}

function getLevel(score: number) {
  if (score < 30) return "مبتدئ";
  if (score < 50) return "متعلم";
  if (score < 70) return "متوسط";
  if (score < 90) return "متقدم";

  return "متمكن";
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const questions = body?.questions;
    const answers = body?.answers;

    if (
      !Array.isArray(questions) ||
      !Array.isArray(answers)
    ) {
      return jsonResponse(
        {
          error:
            "الأسئلة أو الإجابات غير صحيحة.",
        },
        400
      );
    }

    if (
      questions.length === 0 ||
      questions.length > 50
    ) {
      return jsonResponse(
        {
          error:
            "عدد الأسئلة غير صالح.",
        },
        400
      );
    }

    if (answers.length !== questions.length) {
      return jsonResponse(
        {
          error:
            "عدد الإجابات لا يطابق عدد الأسئلة.",
        },
        400
      );
    }

    // حساب الدرجة بشكل موثوق داخل السيرفر
    const overallScore = calculateScore(
      questions,
      answers
    );

    const level = getLevel(overallScore);

    const questionData = questions.map(
      (question, index) => ({
        question: question.question,
        domain: question.domain,
        difficulty: question.difficulty,
        selectedAnswer: answers[index],
        correctAnswer: question.correctAnswer,
      })
    );

    const prompt = `
أنت نظام NOMO لتحليل مستوى المتعلم.

تم حساب نتيجة الاختبار مسبقًا بواسطة النظام.

الدرجة:
${overallScore}/100

المستوى:
${level}

بيانات الاختبار:
${JSON.stringify(questionData, null, 2)}

مهمتك تحليل أداء المتعلم وبناء تجربة تعلم شخصية.

أرجع JSON فقط.
لا تستخدم Markdown.
لا تستخدم \`\`\`.
لا تضع أي نص خارج JSON.

الشكل المطلوب:

{
  "overallScore": 0,
  "level": "",
  "summary": "",
  "domains": [
    {
      "title": "",
      "score": 0,
      "level": "",
      "strength": "",
      "weakness": ""
    }
  ],
  "strengths": [],
  "weaknesses": [],
  "focusAreas": [],
  "aiInsight": "",
  "recommendation": "",
  "learningPlan": [
    {
      "day": 1,
      "domain": "",
      "title": "",
      "type": "",
      "duration": 30,
      "description": "",
      "goal": ""
    }
  ]
}

القواعد:

- overallScore يجب أن يكون ${overallScore}.
- level يجب أن يكون "${level}".
- score يجب أن يكون رقمًا من 0 إلى 100.
- learningPlan يجب أن تحتوي على 7 أيام بالضبط.
- day يجب أن يكون من 1 إلى 7.
- duration يجب أن يكون بالدقائق.
- جميع النصوص باللغة العربية.
- اجعل التحليل شخصيًا ومبنيًا على أداء المتعلم.
- اربط نقاط الضعف بخطة التعلم.
- لا تخترع مهارات أو مجالات غير موجودة في بيانات الاختبار.
- لا تغير overallScore.
- لا تغير level.
- أرجع JSON صالح فقط.
`;

    const response = await fetch(
      OPENROUTER_URL,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",

          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL ||
            "http://localhost:3000",

          "X-Title": "NOMO",
        },

        body: JSON.stringify({
          model: "openai/gpt-4o-mini",

          temperature: 0.2,

          response_format: {
            type: "json_object",
          },

          messages: [
            {
              role: "system",
              content:
                "أنت خبير في التعلم التكيفي وتحليل المتعلمين. أرجع JSON صالح فقط.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "OPENROUTER ERROR:",
        errorText
      );

      return jsonResponse(
        {
          error:
            "تعذر تحليل النتيجة حاليًا.",
        },
        502
      );
    }

    const apiData =
      await response.json();

    const content =
      apiData?.choices?.[0]?.message?.content;

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return jsonResponse(
        {
          error:
            "لم يرجع الذكاء الاصطناعي تحليلًا صالحًا.",
        },
        502
      );
    }

    let result: any;

    try {
      result = extractJson(content);
    } catch {
      console.error(
        "INVALID AI JSON:",
        content
      );

      return jsonResponse(
        {
          error:
            "الذكاء الاصطناعي أرجع نتيجة غير صالحة.",
        },
        502
      );
    }

    if (
      typeof result !== "object" ||
      result === null ||
      Array.isArray(result)
    ) {
      return jsonResponse(
        {
          error:
            "تنسيق نتيجة الذكاء الاصطناعي غير صحيح.",
        },
        502
      );
    }

    // الدرجة والمستوى دائمًا من السيرفر
    result.overallScore =
      overallScore;

    result.level = level;

    if (
      !Array.isArray(result.domains)
    ) {
      result.domains = [];
    }

    if (
      !Array.isArray(result.strengths)
    ) {
      result.strengths = [];
    }

    if (
      !Array.isArray(result.weaknesses)
    ) {
      result.weaknesses = [];
    }

    if (
      !Array.isArray(result.focusAreas)
    ) {
      result.focusAreas = [];
    }

    if (
      !Array.isArray(result.learningPlan)
    ) {
      result.learningPlan = [];
    }

    return jsonResponse(result);
  } catch (error) {
    console.error(
      "NOMO ANALYZE ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          "حدث خطأ أثناء تحليل النتيجة.",
      },
      500
    );
  }
}