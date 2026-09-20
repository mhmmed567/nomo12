"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@heroui/react";

type Question = {
id: number;
question: string;
options: string[];
correctAnswer?: number;
difficulty: string;
domain: string;
explanation?: string;
};

type ApiResponse = {
questions?: Question[];
error?: string;
[key: string]: unknown;
};

const LETTERS = ["أ", "ب", "ج", "د"];

export default function AssessmentPage() {
const router = useRouter();

const [questions, setQuestions] = useState<Question[]>([]);
const [answers, setAnswers] = useState<number[]>([]);
const [current, setCurrent] = useState(0);

const [loading, setLoading] = useState(true);
const [analyzing, setAnalyzing] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
generateQuestions();
}, []);

async function generateQuestions() {
try {
setLoading(true);
setAnalyzing(false);
setError("");


  const response = await fetch("/api/assessment/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: "المعرفة العامة والمهارات",
      level: "مبتدئ",
      goal: "اكتشاف مستوى المستخدم وتحديد نقاط الضعف",
    }),
  });

  const text = await response.text();

  let data: ApiResponse;

  try {
    data = JSON.parse(text) as ApiResponse;
  } catch {
    console.error(text);
    throw new Error("الخادم لم يرجع استجابة صحيحة.");
  }

  if (!response.ok) {
    throw new Error(data.error || "فشل إنشاء الاختبار.");
  }

  if (
    !data.questions ||
    !Array.isArray(data.questions) ||
    data.questions.length === 0
  ) {
    throw new Error("لم يتم إنشاء أسئلة صالحة للاختبار.");
  }

  setQuestions(data.questions);

  setAnswers(new Array(data.questions.length).fill(-1));

  setCurrent(0);
} catch (error) {
  console.error(error);

  setError(
    error instanceof Error
      ? error.message
      : "حدث خطأ غير متوقع."
  );
} finally {
  setLoading(false);
}


}

function selectAnswer(index: number) {
setAnswers((previous) => {
const updated = [...previous];
updated[current] = index;
return updated;
});
}

async function finishAssessment() {
try {
setAnalyzing(true);
setError("");


  const response = await fetch("/api/assessment/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questions,
      answers,
    }),
  });

  const text = await response.text();

  let data: ApiResponse;

  try {
    data = JSON.parse(text) as ApiResponse;
  } catch {
    console.error(text);
    throw new Error("الخادم لم يرجع نتيجة صحيحة.");
  }

  if (!response.ok) {
    throw new Error(data.error || "فشل تحليل النتيجة.");
  }

  localStorage.setItem(
    "nomo_assessment_result",
    JSON.stringify(data)
  );

  router.push("/dashboard");
} catch (error) {
  console.error(error);

  setError(
    error instanceof Error
      ? error.message
      : "حدث خطأ أثناء تحليل النتيجة."
  );

  setAnalyzing(false);
}


}

const question = questions[current];

const progress = useMemo(() => {
if (!questions.length) return 0;


return Math.round(
  ((current + 1) / questions.length) * 100
);


}, [current, questions.length]);

const answeredCount = useMemo(() => {
return answers.filter((answer) => answer !== -1).length;
}, [answers]);

const isLastQuestion =
current === questions.length - 1;

const canContinue =
answers[current] !== undefined &&
answers[current] !== -1;

if (loading) {
return <LoadingScreen />;
}

if (analyzing) {
return <AnalyzingScreen />;
}

if (error) {
return ( <ErrorScreen
     error={error}
     onRetry={generateQuestions}
   />
);
}

if (!question) {
return null;
}

return ( <main
   dir="rtl"
   className="min-h-screen overflow-hidden bg-[#f6f7f5] text-[#10231d]"
 >
{/* Background */} <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"> <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#b9e5c5]/20 blur-3xl" />


    <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#dff4e6]/30 blur-3xl" />
  </div>

  <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
    {/* Navbar */}
    <header className="mb-8">
      <div className="nomo-glass flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#123c31] text-lg font-black text-[#b9e5c5] shadow-lg shadow-[#123c31]/10">
            N
          </div>

          <div>
            <div className="text-sm font-black tracking-tight">
              NOMO
            </div>

            <div className="text-[10px] font-bold text-[#71827b]">
              اختبار المستوى الذكي
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-[#e1e8e4] bg-white/70 px-4 py-2 text-xs font-bold text-[#71827b] sm:block">
            {answeredCount} من {questions.length} تمت الإجابة
          </div>

          <div className="rounded-full bg-[#123c31] px-4 py-2 text-xs font-black text-white">
            {current + 1}/{questions.length}
          </div>
        </div>
      </div>
    </header>

    {/* Progress */}
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-[#71827b]">
          تقدم الاختبار
        </span>

        <span className="text-xs font-black text-[#123c31]">
          {progress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#e3ebe6]">
        <div
          className="h-full rounded-full bg-gradient-to-l from-[#73b987] to-[#123c31] transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </section>

    {/* Main Card */}
    <Card render={(props) => <section {...props} />} className="nomo-card overflow-hidden">
      <div className="h-1.5 bg-gradient-to-l from-[#123c31] via-[#73b987] to-[#b9e5c5]" />

      <div className="p-5 sm:p-8 lg:p-10">
        {/* Question metadata */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dcebe0] bg-[#eff8f1] px-3.5 py-2 text-[11px] font-black text-[#4d8d60]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#73b987]" />
            {question.domain}
          </span>

          <DifficultyBadge
            difficulty={question.difficulty}
          />
        </div>

        {/* Question number */}
        <div className="mt-8 flex items-start gap-4">
          <div className="hidden shrink-0 sm:grid sm:h-14 sm:w-14 sm:place-items-center sm:rounded-2xl sm:bg-[#123c31] sm:text-xl sm:font-black sm:text-[#b9e5c5]">
            {String(current + 1).padStart(2, "0")}
          </div>

          <div className="flex-1">
            <div className="mb-2 text-xs font-bold text-[#9aa9a3]">
              السؤال {current + 1}
            </div>

            <h1 className="text-xl font-black leading-[1.9] tracking-tight text-[#10231d] sm:text-2xl lg:text-3xl">
              {question.question}
            </h1>
          </div>
        </div>

        {/* Options */}
        <div className="mt-8 grid gap-3">
          {question.options.map(
            (option, index) => {
              const selected =
                answers[current] === index;

              return (
                <Button variant="tertiary"
                  key={`${question.id}-${index}`}
                  type="button"
                  onPress={() =>
                    selectAnswer(index)
                  }
                  className={`h-auto md:h-auto min-w-0 whitespace-normal group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-right transition-all duration-200 sm:p-5 ${
                    selected
                      ? "border-[#73b987] bg-[#eff8f1] shadow-[0_10px_30px_rgba(115,185,135,0.12)]"
                      : "border-[#e1e8e4] bg-white hover:-translate-y-0.5 hover:border-[#cbd8d1] hover:bg-[#fbfdfb] hover:shadow-lg"
                  }`}
                >
                  {selected && (
                    <div className="absolute inset-y-0 right-0 w-1 bg-[#73b987]" />
                  )}

                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-black transition-all ${
                      selected
                        ? "bg-[#123c31] text-[#b9e5c5] shadow-md"
                        : "bg-[#f0f3f1] text-[#71827b] group-hover:bg-[#e6eee8] group-hover:text-[#123c31]"
                    }`}
                  >
                    {LETTERS[index] ??
                      String(index + 1)}
                  </span>

                  <span
                    className={`flex-1 text-sm font-bold leading-7 sm:text-[15px] ${
                      selected
                        ? "text-[#123c31]"
                        : "text-[#30443c]"
                    }`}
                  >
                    {option}
                  </span>

                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all ${
                      selected
                        ? "border-[#123c31] bg-[#123c31]"
                        : "border-[#d7e1db] bg-white"
                    }`}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-[#b9e5c5]" />
                    )}
                  </span>
                </Button>
              );
            }
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            variant="tertiary"
            size="lg"
            onPress={() =>
              setCurrent((value) =>
                Math.max(0, value - 1)
              )
            }
            isDisabled={current === 0}
            className="h-14 md:h-14 rounded-xl border border-[#e1e8e4] bg-[#f7f9f7] px-7 font-black text-[#40544b]"
          >
            السابق
          </Button>

          <Button
            variant="primary"
            size="lg"
            onPress={() => {
              if (!canContinue) return;

              if (isLastQuestion) {
                finishAssessment();
              } else {
                setCurrent((value) =>
                  Math.min(
                    questions.length - 1,
                    value + 1
                  )
                );
              }
            }}
            isDisabled={!canContinue}
            className="h-14 md:h-14 flex-1 rounded-xl bg-[#123c31] px-7 font-black text-white shadow-lg shadow-[#123c31]/10"
          >
            {isLastQuestion
              ? "تحليل مستواي"
              : "السؤال التالي"}

            <span className="mr-2 text-[#b9e5c5]">
              ←
            </span>
          </Button>
        </div>
      </div>
    </Card>

    {/* Question navigator */}
    <Card render={(props) => <section {...props} />} className="nomo-card mt-5 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black">
            أسئلة الاختبار
          </h2>

          <p className="mt-1 text-[11px] font-medium text-[#9aa9a3]">
            يمكنك الرجوع لأي سؤال وتغيير إجابتك
          </p>
        </div>

        <div className="text-xs font-black text-[#123c31]">
          {answeredCount}/{questions.length}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((_, index) => {
          const answered =
            answers[index] !== -1;

          const active =
            current === index;

          return (
            <Button variant="tertiary"
              key={index}
              type="button"
              onPress={() =>
                setCurrent(index)
              }
              className={`min-w-0 whitespace-normal grid h-9 md:h-9 w-9 place-items-center rounded-xl text-xs font-black transition ${
                active
                  ? "bg-[#123c31] text-white shadow-md"
                  : answered
                    ? "bg-[#dff4e6] text-[#39704b]"
                    : "bg-[#f0f3f1] text-[#71827b] hover:bg-[#e4ebe6]"
              }`}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
    </Card>

    {/* Footer note */}
    <div className="px-2 py-6 text-center">
      <p className="text-[11px] font-medium leading-6 text-[#9aa9a3]">
        NOMO لا يبحث عن إجابات مثالية، بل يحاول فهم
        مستواك الحقيقي لبناء تجربة تعلم مناسبة لك.
      </p>
    </div>
  </div>
</main>


);
}

function DifficultyBadge({
difficulty,
}: {
difficulty: string;
}) {
const normalized = difficulty.toLowerCase();

let label = difficulty;
let classes =
"border-[#e1e8e4] bg-[#f4f6f4] text-[#71827b]";

if (
normalized.includes("سهل") ||
normalized.includes("easy")
) {
label = "سهل";
classes =
"border-[#dcebe0] bg-[#eff8f1] text-[#4d8d60]";
}

if (
normalized.includes("متوسط") ||
normalized.includes("medium")
) {
label = "متوسط";
classes =
"border-[#eee5ce] bg-[#faf6ea] text-[#987b35]";
}

if (
normalized.includes("صعب") ||
normalized.includes("hard")
) {
label = "صعب";
classes =
"border-[#efdcdc] bg-[#fcf1f1] text-[#a55c5c]";
}

return (
<span
className={`inline-flex items-center rounded-full border px-3.5 py-2 text-[11px] font-black ${classes}`}
>
{label} </span>
);
}

function LoadingScreen() {
return ( <main
   dir="rtl"
   className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7f5] px-6"
 > <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#b9e5c5]/30 blur-3xl" />


  <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#dff4e6]/40 blur-3xl" />

  <div className="relative w-full max-w-md text-center">
    <Card className="nomo-card p-8 sm:p-10">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-[#123c31] text-3xl font-black text-[#b9e5c5] shadow-xl shadow-[#123c31]/15">
        <span className="animate-pulse">
          N
        </span>
      </div>

      <div className="mt-7">
        <div className="mx-auto mb-5 h-1.5 w-28 overflow-hidden rounded-full bg-[#e2e9e4]">
          <div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-[#73b987]" />
        </div>

        <h1 className="text-xl font-black text-[#123c31] sm:text-2xl">
          NOMO يبني اختبارك
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#71827b]">
          نقوم بتجهيز مجموعة أسئلة تساعدنا
          على فهم مستواك بشكل أفضل.
        </p>
      </div>
    </Card>
  </div>
</main>


);
}

function AnalyzingScreen() {
return ( <main
   dir="rtl"
   className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7f5] px-6"
 > <div className="pointer-events-none absolute inset-0"> <div className="absolute right-[10%] top-[15%] h-40 w-40 rounded-full bg-[#b9e5c5]/20 blur-3xl" /> <div className="absolute bottom-[10%] left-[10%] h-48 w-48 rounded-full bg-[#dff4e6]/30 blur-3xl" /> </div>

```
  <div className="relative w-full max-w-lg text-center">
    <Card className="nomo-card p-8 sm:p-12">
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#e1e8e4] border-t-[#123c31]" />

        <div className="absolute inset-3 grid place-items-center rounded-2xl bg-[#123c31] text-xl font-black text-[#b9e5c5]">
          N
        </div>
      </div>

      <h1 className="mt-8 text-2xl font-black text-[#123c31]">
        نحلل مستواك الآن
      </h1>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-8 text-[#71827b]">
        نقارن إجاباتك ونحدد نقاط قوتك
        والمجالات التي تحتاج إلى تطوير.
      </p>

      <div className="mt-7 flex justify-center gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#123c31]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#73b987] [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#b9e5c5] [animation-delay:300ms]" />
      </div>
    </Card>
  </div>
</main>


);
}

function ErrorScreen({
error,
onRetry,
}: {
error: string;
onRetry: () => void;
}) {
return ( <main
   dir="rtl"
   className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7f5] px-5"
 > <div className="relative w-full max-w-md"> <Card className="nomo-card p-8 text-center sm:p-10"> <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fcf1f1] text-2xl">
! </div>

```
      <h1 className="mt-6 text-2xl font-black text-[#123c31]">
        لم نتمكن من تجهيز الاختبار
      </h1>

      <p className="mt-4 text-sm leading-8 text-[#71827b]">
        {error}
      </p>

      <Button
        variant="primary"
        size="lg"
        onPress={onRetry}
        className="mt-7 h-14 md:h-14 w-full rounded-xl bg-[#123c31] font-black text-white"
      >
        المحاولة مرة أخرى
      </Button>
    </Card>

    <p className="mt-5 text-center text-[11px] font-medium text-[#9aa9a3]">
      إذا استمرت المشكلة، تحقق من اتصال الخادم
      وواجهة الذكاء الاصطناعي.
    </p>
  </div>
</main>

);
}
