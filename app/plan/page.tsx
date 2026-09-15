
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";

/* =========================================================
   TYPES
========================================================= */

type Knowledge = {
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

type Day = {
  day: number;
  title: string;
  domain: string;
  difficulty: string;
  duration: number;
  objective: string;
  knowledge: Knowledge[];
  challenge: {
    title: string;
    description: string;
    task: string;
    hint: string;
    successCriteria: string;
  };
  questions: Question[];
  exercise: {
    title: string;
    description: string;
    task: string;
  };
  xp: number;
};

type Plan = {
  title: string;
  description: string;
  level: string;
  totalDays: number;
  dailyGoal: string;
  totalXP?: number;
  days: Day[];
};

type AnswerState = {
  selected: number;
  checked: boolean;
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [dayIndex, setDayIndex] = useState(0);

  const [answers, setAnswers] = useState<
    Record<string, AnswerState>
  >({});

  const [completed, setCompleted] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD PLAN
  ------------------------------------------------------- */

  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem(
        "nomo_learning_plan"
      );

      if (storedPlan) {
        const parsed = JSON.parse(storedPlan);

        if (
          parsed &&
          Array.isArray(parsed.days) &&
          parsed.days.length > 0
        ) {
          setPlan(parsed as Plan);
        }
      }

      const storedCompleted = localStorage.getItem(
        "nomo_completed_days"
      );

      if (storedCompleted) {
        const parsed = JSON.parse(storedCompleted);

        if (Array.isArray(parsed)) {
          setCompleted(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load NOMO plan:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------------
     CURRENT DAY
  ------------------------------------------------------- */

  const day = plan?.days?.[dayIndex];

  const completedCount = completed.length;

  const progress = useMemo(() => {
    if (!plan?.totalDays) return 0;

    return Math.min(
      100,
      Math.round(
        (completedCount / plan.totalDays) * 100
      )
    );
  }, [completedCount, plan]);

  const currentDayCompleted = day
    ? completed.includes(day.day)
    : false;

  /* -------------------------------------------------------
     QUIZ STATE
  ------------------------------------------------------- */

  const currentAnswers = day
    ? day.questions.map(
        (_, index) =>
          answers[`${dayIndex}-${index}`]
      )
    : [];

  const answeredCount = currentAnswers.filter(
    (answer) =>
      answer &&
      answer.selected >= 0
  ).length;

  const allQuestionsAnswered =
    !!day &&
    day.questions.length > 0 &&
    answeredCount === day.questions.length;

  /* -------------------------------------------------------
     ANSWERS
  ------------------------------------------------------- */

  function selectAnswer(
    questionIndex: number,
    optionIndex: number
  ) {
    const key = `${dayIndex}-${questionIndex}`;

    setAnswers((previous) => ({
      ...previous,
      [key]: {
        selected: optionIndex,
        checked: false,
      },
    }));
  }

  function checkAnswer(questionIndex: number) {
    const key = `${dayIndex}-${questionIndex}`;
    const answer = answers[key];

    if (!answer) return;

    setAnswers((previous) => ({
      ...previous,
      [key]: {
        ...answer,
        checked: true,
      },
    }));
  }

  /* -------------------------------------------------------
     COMPLETE DAY
  ------------------------------------------------------- */

  function completeDay() {
    if (!plan || !day) return;
    if (!allQuestionsAnswered) return;

    const updated = Array.from(
      new Set([
        ...completed,
        day.day,
      ])
    ).sort((a, b) => a - b);

    setCompleted(updated);

    localStorage.setItem(
      "nomo_completed_days",
      JSON.stringify(updated)
    );

    if (dayIndex < plan.days.length - 1) {
      setTimeout(() => {
        setDayIndex((value) =>
          Math.min(
            value + 1,
            plan.days.length - 1
          )
        );
      }, 500);
    }
  }

  /* -------------------------------------------------------
     DAY NAVIGATION
  ------------------------------------------------------- */

  function goToDay(index: number) {
    if (!plan) return;

    setDayIndex(
      Math.max(
        0,
        Math.min(
          index,
          plan.days.length - 1
        )
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* -------------------------------------------------------
     STATES
  ------------------------------------------------------- */

  if (loading) {
    return <PlanLoading />;
  }

  if (!plan || !day) {
    return <EmptyPlan />;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#f6f7f5] text-[#10231d]"
    >
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#b9e5c5]/20 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#dff4e6]/30 blur-3xl" />
      </div>

      {/* ===================================================
          NAVBAR
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#e1e8e4]/80 bg-[#f6f7f5]/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#123c31] text-sm font-black text-[#b9e5c5] shadow-lg shadow-[#123c31]/10">
              N
            </div>

            <div>
              <div className="text-sm font-black tracking-[0.15em]">
                NOMO
              </div>

              <div className="hidden text-[9px] font-bold text-[#9aa9a3] sm:block">
                خطة التعلم الشخصية
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">

            <div className="hidden rounded-full border border-[#e1e8e4] bg-white px-4 py-2 text-[10px] font-black text-[#71827b] sm:block">
              {completedCount} / {plan.totalDays} مكتمل
            </div>

            <Link href="/dashboard">
              <Button
                variant="tertiary"
                className="h-10 rounded-lg bg-white px-4 text-xs font-black text-[#123c31]"
              >
                لوحة التحكم
              </Button>
            </Link>

          </div>
        </div>
      </header>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">

        {/* =================================================
            PLAN HERO
        ================================================= */}

        <section className="nomo-gradient nomo-grid nomo-glow relative overflow-hidden rounded-[32px] p-6 sm:rounded-[40px] sm:p-9 lg:p-12">

          <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#b9e5c5]/10 blur-3xl" />

          <div className="relative z-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-3xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black text-[#b9e5c5]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b9e5c5]" />
                  خطة NOMO الذكية
                </div>

                <h1 className="mt-6 text-3xl font-black leading-[1.35] text-white sm:text-4xl lg:text-5xl">
                  {plan.title}
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-8 text-[#b7c9c2]">
                  {plan.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <PlanBadge>
                    {plan.level}
                  </PlanBadge>

                  <PlanBadge>
                    {plan.totalDays} أيام
                  </PlanBadge>

                  <PlanBadge>
                    {plan.totalXP ||
                      plan.days.reduce(
                        (total, item) =>
                          total + item.xp,
                        0
                      )}{" "}
                    XP
                  </PlanBadge>
                </div>

              </div>

              <div className="w-full shrink-0 lg:w-72">

                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">

                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-white">
                      تقدم الرحلة
                    </span>

                    <span className="text-[#b9e5c5]">
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#b9e5c5] transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 text-[10px] font-bold leading-6 text-[#b7c9c2]">
                    {plan.dailyGoal ||
                      "تعلم كل يوم، طبّق ما تعلمته، ثم اختبر نفسك."}
                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =================================================
            DAY SELECTOR
        ================================================= */}

        <section className="mt-6">

          <div className="mb-3 flex items-center justify-between">

            <div>
              <div className="text-[9px] font-black tracking-[0.2em] text-[#73b987]">
                YOUR JOURNEY
              </div>

              <h2 className="mt-1 text-xl font-black">
                اختر يوم التعلم
              </h2>
            </div>

            <span className="text-xs font-black text-[#9aa9a3]">
              {completedCount}/{plan.totalDays}
            </span>

          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">

            {plan.days.map((item, index) => {

              const done = completed.includes(
                item.day
              );

              const active = index === dayIndex;

              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => goToDay(index)}
                  className={`min-w-[105px] rounded-2xl border p-3 text-right transition-all ${
                    active
                      ? "border-[#123c31] bg-[#123c31] text-white shadow-lg shadow-[#123c31]/10"
                      : "border-[#e1e8e4] bg-white text-[#10231d] hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">

                    <span className="text-[10px] font-black">
                      اليوم {item.day}
                    </span>

                    {done && (
                      <span
                        className={
                          active
                            ? "text-[#b9e5c5]"
                            : "text-[#73b987]"
                        }
                      >
                        ✓
                      </span>
                    )}

                  </div>

                  <div
                    className={`mt-2 truncate text-[9px] font-bold ${
                      active
                        ? "text-[#b9e5c5]"
                        : "text-[#71827b]"
                    }`}
                  >
                    {item.title}
                  </div>

                </button>
              );
            })}

          </div>
        </section>

        {/* =================================================
            CURRENT DAY
        ================================================= */}

        <section className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">

          <div className="min-w-0 space-y-5">

            {/* DAY HEADER */}

            <section className="nomo-card overflow-hidden">

              <div className="h-1.5 bg-gradient-to-l from-[#123c31] via-[#73b987] to-[#b9e5c5]" />

              <div className="p-6 sm:p-8">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-[#eff8f1] px-3.5 py-2 text-[10px] font-black text-[#4d8d60]">
                    اليوم {day.day}
                  </span>

                  <span className="rounded-full bg-[#f0f3f1] px-3.5 py-2 text-[10px] font-black text-[#71827b]">
                    {day.difficulty}
                  </span>

                  <span className="rounded-full bg-[#f0f3f1] px-3.5 py-2 text-[10px] font-black text-[#71827b]">
                    {day.duration} دقيقة
                  </span>

                  <span className="rounded-full bg-[#eff8f1] px-3.5 py-2 text-[10px] font-black text-[#4d8d60]">
                    +{day.xp} XP
                  </span>

                </div>

                <div className="mt-7">

                  <div className="text-[9px] font-black tracking-[0.2em] text-[#9aa9a3]">
                    {day.domain}
                  </div>

                  <h2 className="mt-2 text-2xl font-black leading-[1.5] sm:text-3xl">
                    {day.title}
                  </h2>

                  <p className="mt-4 text-sm leading-8 text-[#71827b]">
                    {day.objective}
                  </p>

                </div>

                {currentDayCompleted && (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#dcebe0] bg-[#eff8f1] p-4">

                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#123c31] text-[#b9e5c5]">
                      ✓
                    </div>

                    <div>
                      <p className="text-xs font-black text-[#39704b]">
                        تم إكمال هذا اليوم
                      </p>

                      <p className="mt-0.5 text-[10px] font-bold text-[#71827b]">
                        حصلت على {day.xp} XP
                      </p>
                    </div>

                  </div>
                )}

              </div>
            </section>

            {/* KNOWLEDGE */}

            <section className="nomo-card p-6 sm:p-8">

              <SectionHeader
                eyebrow="LEARN"
                title="المعرفة التي تحتاجها"
                description="اقرأ النقاط التالية قبل الانتقال إلى التحدي."
              />

              <div className="mt-7 space-y-3">

                {day.knowledge.map(
                  (item, index) => (
                    <article
                      key={`${item.title}-${index}`}
                      className="rounded-[24px] border border-[#e1e8e4] bg-[#fbfcfa] p-5 sm:p-6"
                    >

                      <div className="flex gap-4">

                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#123c31] text-xs font-black text-[#b9e5c5]">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-black">
                              {item.title}
                            </h3>

                            {item.important && (
                              <span className="rounded-full bg-[#eff8f1] px-2.5 py-1 text-[8px] font-black text-[#4d8d60]">
                                مهم
                              </span>
                            )}

                          </div>

                          <p className="mt-3 text-sm leading-8 text-[#60786d]">
                            {item.content}
                          </p>

                        </div>

                      </div>

                    </article>
                  )
                )}

              </div>
            </section>

            {/* CHALLENGE */}

            <section className="nomo-gradient nomo-glow relative overflow-hidden rounded-[30px] p-6 text-white sm:p-8">

              <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#b9e5c5]/10 blur-3xl" />

              <div className="relative">

                <div className="flex items-center gap-3">

                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#b9e5c5] text-lg font-black text-[#123c31]">
                    ↗
                  </div>

                  <div>

                    <div className="text-[9px] font-black tracking-widest text-[#b9e5c5]">
                      CHALLENGE
                    </div>

                    <h3 className="mt-1 text-xl font-black">
                      {day.challenge.title}
                    </h3>

                  </div>

                </div>

                <p className="mt-6 text-sm leading-8 text-[#d0ddd7]">
                  {day.challenge.description}
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-5">

                  <div className="text-[9px] font-black text-[#b9e5c5]">
                    المطلوب منك
                  </div>

                  <p className="mt-2 text-sm font-bold leading-8 text-white">
                    {day.challenge.task}
                  </p>

                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">

                  <div className="rounded-2xl bg-white/[0.05] p-5">

                    <div className="text-[9px] font-black text-[#b9e5c5]">
                      تلميح
                    </div>

                    <p className="mt-2 text-xs leading-7 text-[#b7c9c2]">
                      {day.challenge.hint}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white/[0.05] p-5">

                    <div className="text-[9px] font-black text-[#b9e5c5]">
                      معيار النجاح
                    </div>

                    <p className="mt-2 text-xs leading-7 text-[#b7c9c2]">
                      {day.challenge.successCriteria}
                    </p>

                  </div>

                </div>

              </div>
            </section>

            {/* QUIZ */}

            <section className="nomo-card p-6 sm:p-8">

              <SectionHeader
                eyebrow="CHECKPOINT"
                title="اختبر نفسك"
                description="أجب عن الأسئلة لتتأكد أنك فهمت محتوى اليوم."
              />

              <div className="mt-7 space-y-5">

                {day.questions.map(
                  (question, qIndex) => (
                    <QuizQuestion
                      key={`${day.day}-${qIndex}`}
                      question={question}
                      index={qIndex}
                      answer={
                        answers[
                          `${dayIndex}-${qIndex}`
                        ]
                      }
                      onSelect={(optionIndex) =>
                        selectAnswer(
                          qIndex,
                          optionIndex
                        )
                      }
                      onCheck={() =>
                        checkAnswer(qIndex)
                      }
                    />
                  )
                )}

              </div>

              <div className="mt-7 flex items-center justify-between rounded-2xl bg-[#fbfcfa] p-4">

                <div>

                  <div className="text-xs font-black">
                    تقدم الاختبار
                  </div>

                  <div className="mt-1 text-[10px] font-bold text-[#9aa9a3]">
                    {answeredCount} من{" "}
                    {day.questions.length}{" "}
                    أسئلة
                  </div>

                </div>

                <div className="h-10 w-10 rounded-full border-4 border-[#e1e8e4] border-t-[#73b987] p-1">

                  <div className="grid h-full place-items-center text-[8px] font-black">

                    {day.questions.length
                      ? Math.round(
                          (answeredCount /
                            day.questions.length) *
                            100
                        )
                      : 0}
                    %

                  </div>

                </div>

              </div>
            </section>

            {/* EXERCISE */}

            <section className="nomo-card p-6 sm:p-8">

              <div className="flex items-start gap-4">

                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eff8f1] text-lg font-black text-[#4d8d60]">
                  ✦
                </div>

                <div>

                  <div className="text-[9px] font-black tracking-widest text-[#73b987]">
                    PRACTICE
                  </div>

                  <h3 className="mt-1 text-xl font-black">
                    {day.exercise.title}
                  </h3>

                </div>

              </div>

              <p className="mt-6 text-sm leading-8 text-[#71827b]">
                {day.exercise.description}
              </p>

              <div className="mt-5 rounded-2xl bg-[#f5f8f5] p-5">

                <div className="text-[9px] font-black text-[#4d8d60]">
                  المهمة
                </div>

                <p className="mt-2 text-sm font-bold leading-8 text-[#30443c]">
                  {day.exercise.task}
                </p>

              </div>
            </section>

            {/* COMPLETE */}

            <section className="rounded-[30px] bg-[#eff8f1] p-6 sm:p-8">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="text-[9px] font-black tracking-widest text-[#73b987]">
                    DAILY MISSION
                  </div>

                  <h3 className="mt-2 text-xl font-black">
                    {currentDayCompleted
                      ? "أكملت مهمة اليوم 🎉"
                      : "هل أنهيت يومك؟"}
                  </h3>

                  <p className="mt-2 text-xs font-bold leading-6 text-[#71827b]">
                    {currentDayCompleted
                      ? `حصلت على ${day.xp} XP لهذا اليوم.`
                      : allQuestionsAnswered
                        ? `أكملت الاختبار. اضغط لإضافة ${day.xp} XP.`
                        : "أجب عن جميع الأسئلة أولًا لإكمال اليوم."}
                  </p>

                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onPress={completeDay}
                  isDisabled={
                    currentDayCompleted ||
                    !allQuestionsAnswered
                  }
                  className="h-14 shrink-0 rounded-lg bg-[#123c31] px-7 text-sm font-black text-white disabled:opacity-40"
                >
                  {currentDayCompleted
                    ? "✓ اليوم مكتمل"
                    : `إكمال اليوم +${day.xp} XP`}
                </Button>

              </div>
            </section>

            {/* NAVIGATION */}

            <div className="grid grid-cols-2 gap-3">

              <Button
                variant="tertiary"
                size="lg"
                isDisabled={dayIndex === 0}
                onPress={() =>
                  goToDay(dayIndex - 1)
                }
                className="h-14 rounded-lg bg-white font-black text-[#40544b]"
              >
                → اليوم السابق
              </Button>

              <Button
                variant="primary"
                size="lg"
                isDisabled={
                  dayIndex ===
                  plan.days.length - 1
                }
                onPress={() =>
                  goToDay(dayIndex + 1)
                }
                className="h-14 rounded-lg bg-[#123c31] font-black text-white"
              >
                اليوم التالي ←
              </Button>

            </div>
          </div>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="hidden lg:block">

            <div className="sticky top-[92px] space-y-4">

              <div className="nomo-card p-5">

                <div className="text-[9px] font-black tracking-widest text-[#73b987]">
                  YOUR PROGRESS
                </div>

                <div className="mt-3 flex items-end justify-between">

                  <span className="text-3xl font-black">
                    {progress}%
                  </span>

                  <span className="text-[10px] font-bold text-[#9aa9a3]">
                    {completedCount}/
                    {plan.totalDays}
                  </span>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5ece6]">

                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#73b987] to-[#123c31] transition-all"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </div>

              <div className="nomo-card p-4">

                <div className="mb-3 px-2 text-[9px] font-black tracking-widest text-[#9aa9a3]">
                  DAYS
                </div>

                <div className="space-y-2">

                  {plan.days.map(
                    (item, index) => {

                      const done =
                        completed.includes(
                          item.day
                        );

                      const active =
                        index === dayIndex;

                      return (
                        <button
                          key={item.day}
                          type="button"
                          onClick={() =>
                            goToDay(index)
                          }
                          className={`w-full rounded-2xl p-3 text-right transition ${
                            active
                              ? "bg-[#123c31] text-white"
                              : "hover:bg-[#f5f8f5]"
                          }`}
                        >

                          <div className="flex items-center gap-3">

                            <div
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[10px] font-black ${
                                active
                                  ? "bg-[#b9e5c5] text-[#123c31]"
                                  : done
                                    ? "bg-[#dff4e6] text-[#4d8d60]"
                                    : "bg-[#eef1ee] text-[#71827b]"
                              }`}
                            >
                              {done
                                ? "✓"
                                : item.day}
                            </div>

                            <div className="min-w-0">

                              <div
                                className={`truncate text-[10px] font-black ${
                                  active
                                    ? "text-white"
                                    : "text-[#30443c]"
                                }`}
                              >
                                {item.title}
                              </div>

                              <div
                                className={`mt-1 text-[8px] font-bold ${
                                  active
                                    ? "text-[#b9e5c5]"
                                    : "text-[#9aa9a3]"
                                }`}
                              >
                                {item.duration} دقيقة
                              </div>

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>
              </div>

            </div>
          </aside>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="py-10 text-center">

          <p className="text-[11px] font-bold text-[#9aa9a3]">
            © 2026 NOMO — رحلة المعرفة بالذكاء الاصطناعي
          </p>

        </footer>

      </div>
    </main>
  );
}

/* =========================================================
   QUIZ QUESTION
========================================================= */

function QuizQuestion({
  question,
  index,
  answer,
  onSelect,
  onCheck,
}: {
  question: Question;
  index: number;
  answer?: AnswerState;
  onSelect: (optionIndex: number) => void;
  onCheck: () => void;
}) {
  const selected = answer?.selected ?? -1;
  const checked = answer?.checked ?? false;

  const isCorrect =
    checked &&
    selected === question.correctAnswer;

  return (
    <article className="rounded-[26px] border border-[#e1e8e4] bg-[#fbfcfa] p-5 sm:p-6">

      <div className="flex items-start gap-3">

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#123c31] text-[10px] font-black text-[#b9e5c5]">
          {index + 1}
        </div>

        <h4 className="text-sm font-black leading-7 text-[#20372f]">
          {question.question}
        </h4>

      </div>

      <div className="mt-5 grid gap-2">

        {question.options.map(
          (option, optionIndex) => {

            const isSelected =
              selected === optionIndex;

            const isCorrectOption =
              checked &&
              optionIndex ===
                question.correctAnswer;

            const isWrongSelected =
              checked &&
              isSelected &&
              optionIndex !==
                question.correctAnswer;

            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() =>
                  !checked &&
                  onSelect(optionIndex)
                }
                disabled={checked}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-right transition ${
                  isCorrectOption
                    ? "border-[#9bd2aa] bg-[#eff8f1]"
                    : isWrongSelected
                      ? "border-[#e7bcbc] bg-[#fcf1f1]"
                      : isSelected
                        ? "border-[#73b987] bg-[#eff8f1]"
                        : "border-[#e1e8e4] bg-white hover:border-[#cbd8d1] hover:bg-[#f8faf8]"
                }`}
              >

                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-black ${
                    isCorrectOption
                      ? "bg-[#123c31] text-[#b9e5c5]"
                      : isWrongSelected
                        ? "bg-[#a55c5c] text-white"
                        : isSelected
                          ? "bg-[#123c31] text-[#b9e5c5]"
                          : "bg-[#eef1ee] text-[#71827b]"
                  }`}
                >
                  {String.fromCharCode(
                    65 + optionIndex
                  )}
                </span>

                <span className="flex-1 text-xs font-bold leading-6 text-[#40544b]">
                  {option}
                </span>

                {isCorrectOption && (
                  <span className="text-sm text-[#4d8d60]">
                    ✓
                  </span>
                )}

                {isWrongSelected && (
                  <span className="text-sm text-[#a55c5c]">
                    ×
                  </span>
                )}

              </button>
            );
          }
        )}

      </div>

      {!checked && (
        <Button
          variant="primary"
          onPress={onCheck}
          isDisabled={selected < 0}
          className="mt-4 h-11 w-full rounded-lg bg-[#123c31] text-xs font-black text-white disabled:opacity-40"
        >
          تحقق من الإجابة
        </Button>
      )}

      {checked && (
        <div
          className={`mt-4 rounded-2xl p-4 ${
            isCorrect
              ? "bg-[#eff8f1]"
              : "bg-[#fff8ec]"
          }`}
        >

          <div
            className={`text-xs font-black ${
              isCorrect
                ? "text-[#4d8d60]"
                : "text-[#a57d38]"
            }`}
          >
            {isCorrect
              ? "إجابة صحيحة ✓"
              : "ليست الإجابة الصحيحة"}
          </div>

          <p className="mt-2 text-xs leading-7 text-[#60786d]">
            {question.explanation}
          </p>

        </div>
      )}

    </article>
  );
}

/* =========================================================
   PLAN BADGE
========================================================= */

function PlanBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black text-white">
      {children}
    </span>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>

      <div className="text-[9px] font-black tracking-[0.2em] text-[#73b987]">
        {eyebrow}
      </div>

      <h2 className="mt-2 text-2xl font-black tracking-tight">
        {title}
      </h2>

      <p className="mt-2 text-sm font-medium leading-7 text-[#71827b]">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function PlanLoading() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#f6f7f5] px-6"
    >

      <div className="nomo-card w-full max-w-md p-10 text-center">

        <div className="relative mx-auto h-20 w-20">

          <div className="absolute inset-0 animate-ping rounded-3xl bg-[#b9e5c5]/40" />

          <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-[#123c31] text-2xl font-black text-[#b9e5c5]">
            N
          </div>

        </div>

        <h1 className="mt-7 text-2xl font-black text-[#123c31]">
          نحضر رحلتك...
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#71827b]">
          NOMO يجهز محتوى خطتك الشخصية.
        </p>

        <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-[#e3ebe6]">

          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#73b987]" />

        </div>

      </div>
    </main>
  );
}

/* =========================================================
   EMPTY PLAN
========================================================= */

function EmptyPlan() {
  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7f5] px-5"
    >

      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#b9e5c5]/20 blur-3xl" />

      <div className="relative w-full max-w-md">

        <div className="nomo-card p-8 text-center sm:p-10">

          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-[#eff8f1] text-2xl font-black text-[#123c31]">
            N
          </div>

          <h1 className="mt-7 text-2xl font-black">
            لم يتم إنشاء خطة بعد
          </h1>

          <p className="mt-4 text-sm leading-8 text-[#71827b]">
            اذهب إلى لوحة التحكم وأنشئ خطة
            التطوير الشخصية بواسطة NOMO.
          </p>

          <Link
            href="/dashboard"
            className="mt-7 block"
          >
            <Button
              variant="primary"
              size="lg"
              className="h-14 w-full rounded-lg bg-[#123c31] font-black text-white"
            >
              العودة إلى لوحة التحكم
            </Button>
          </Link>

        </div>

      </div>
    </main>
  );
}

