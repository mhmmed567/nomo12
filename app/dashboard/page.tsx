"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";

type Domain = {
title: string;
score: number;
level: string;
strength: string;
weakness: string;
};

type AssessmentResult = {
overallScore: number;
level: string;
summary: string;
domains: Domain[];
strengths: string[];
weaknesses: string[];
focusAreas: string[];
aiInsight: string;
recommendation: string;
};

type ApiResponse = {
days?: unknown[];
error?: string;
[key: string]: unknown;
};

export default function DashboardPage() {
const [result, setResult] =
useState<AssessmentResult | null>(null);

const [loading, setLoading] = useState(true);
const [creatingPlan, setCreatingPlan] =
useState(false);

const [error, setError] = useState("");

useEffect(() => {
try {
const stored = localStorage.getItem(
"nomo_assessment_result"
);


  if (!stored) {
    setLoading(false);
    return;
  }

  const parsed = JSON.parse(
    stored
  ) as AssessmentResult;

  setResult(parsed);
} catch (error) {
  console.error(
    "Failed to load assessment:",
    error
  );

  setError("تعذر قراءة نتيجة التقييم.");
} finally {
  setLoading(false);
}


}, []);

async function createPlan() {
if (!result) {
setError(
"لا توجد نتيجة تقييم لإنشاء الخطة."
);
return;
}


try {
  setCreatingPlan(true);
  setError("");

  const response = await fetch(
    "/api/assessment/plan",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        result,
      }),
    }
  );

  const text = await response.text();

  let data: ApiResponse;

  try {
    data = JSON.parse(text) as ApiResponse;
  } catch {
    console.error(
      "PLAN API RAW RESPONSE:",
      text
    );

    throw new Error(
      "الخادم لم يرجع JSON صالح."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        "حدث خطأ أثناء إنشاء خطة التطوير."
    );
  }

  if (
    !data.days ||
    !Array.isArray(data.days) ||
    data.days.length !== 7
  ) {
    console.error(
      "INVALID PLAN RESPONSE:",
      data
    );

    throw new Error(
      "الخطة التي تم إنشاؤها غير صالحة."
    );
  }

  localStorage.setItem(
    "nomo_learning_plan",
    JSON.stringify(data)
  );

  window.location.href = "/plan";
} catch (error) {
  console.error(
    "CREATE PLAN ERROR:",
    error
  );

  setError(
    error instanceof Error
      ? error.message
      : "حدث خطأ غير متوقع."
  );

  setCreatingPlan(false);
}


}

const score = useMemo(() => {
return Math.max(
0,
Math.min(
100,
Math.round(
Number(result?.overallScore) || 0
)
)
);
}, [result]);

if (loading) {
return <DashboardLoading />;
}

if (!result) {
return ( <EmptyDashboard
     error={error}
   />
);
}

return ( <main
   dir="rtl"
   className="min-h-screen overflow-hidden bg-[#f6f7f5] text-[#10231d]"
 >
{/* Background */} <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"> <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#b9e5c5]/20 blur-3xl" />

```
    <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#dff4e6]/30 blur-3xl" />
  </div>

  {/* NAVBAR */}
  <header className="sticky top-0 z-50 border-b border-[#e1e8e4]/80 bg-[#f6f7f5]/80 backdrop-blur-2xl">
    <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link
        href="/"
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
            رحلة المعرفة بالذكاء الاصطناعي
          </div>
        </div>
      </Link>

      <nav className="hidden items-center gap-7 text-xs font-bold text-[#71827b] md:flex">
        <NavLink href="/">
          الرئيسية
        </NavLink>

        <NavLink
          href="/dashboard"
          active
        >
          لوحة التحكم
        </NavLink>

        <NavLink href="/plan">
          خطة التطوير
        </NavLink>

        <NavLink href="/assessment">
          التقييم
        </NavLink>
      </nav>

      <Link href="/assessment">
        <Button
          variant="primary"
          className="h-10 rounded-lg bg-[#123c31] px-5 text-xs font-black text-white"
        >
          إعادة التقييم
        </Button>
      </Link>
    </div>
  </header>

  <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    {/* HERO */}
    <section className="nomo-gradient nomo-grid nomo-glow relative overflow-hidden rounded-[32px] p-6 sm:rounded-[40px] sm:p-9 lg:p-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#b9e5c5]/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#73b987]/10 blur-3xl" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_310px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black text-[#b9e5c5] backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b9e5c5]" />
            ملفك المعرفي جاهز
          </div>

          <h1 className="mt-6 text-3xl font-black leading-[1.3] tracking-tight text-white sm:text-4xl lg:text-5xl">
            هذه هي صورتك
            <br />

            <span className="text-[#b9e5c5]">
              المعرفية.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-[#b7c9c2]">
            {result.summary ||
              "تم تحليل نتائجك وإنشاء صورة أولية عن مستواك ونقاط قوتك والمجالات التي تحتاج إلى تطوير."}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#b9e5c5] px-4 py-2 text-[10px] font-black text-[#123c31]">
              {result.level || "مبتدئ"}
            </span>

            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black text-white">
              تحليل NOMO
            </span>
          </div>
        </div>

        {/* SCORE */}
        <div className="mx-auto w-full max-w-[270px]">
          <div className="relative grid aspect-square place-items-center rounded-full border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur">
            <div
              className="absolute inset-5 rounded-full"
              style={{
                background: `conic-gradient(#b9e5c5 ${score * 3.6}deg, rgba(255,255,255,0.08) ${score * 3.6}deg)`,
              }}
            />

            <div className="relative grid h-[78%] w-[78%] place-items-center rounded-full border border-white/10 bg-[#123c31] text-center shadow-inner">
              <div>
                <div className="text-6xl font-black tracking-tight text-white">
                  {score}
                </div>

                <div className="mt-1 text-[10px] font-black text-[#b9e5c5]">
                  من 100
                </div>

                <div className="mt-3 text-[9px] font-bold text-[#b7c9c2]">
                  المستوى العام
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* STATS */}
    <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon="◈"
        value={`${score}%`}
        label="المستوى العام"
      />

      <StatCard
        icon="✦"
        value={`${result.strengths?.length || 0}`}
        label="نقاط القوة"
      />

      <StatCard
        icon="↗"
        value={`${result.weaknesses?.length || 0}`}
        label="مجالات التطوير"
      />

      <StatCard
        icon="7"
        value="7"
        label="أيام الخطة"
      />
    </section>

    {/* CREATE PLAN */}
    <section className="nomo-card mt-6 overflow-hidden">
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-[9px] font-black tracking-[0.2em] text-[#73b987]">
              NEXT STEP
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              حان وقت تحويل النتيجة إلى خطة
            </h2>

            <p className="mt-3 text-sm leading-8 text-[#71827b]">
              سيحوّل NOMO نتائج تقييمك إلى رحلة
              تعلم شخصية لمدة 7 أيام، تحتوي على
              معرفة وتحديات وأسئلة وتمارين.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onPress={createPlan}
            isPending={creatingPlan}
            className="h-14 shrink-0 rounded-xl bg-[#123c31] px-8 text-sm font-black text-white shadow-xl shadow-[#123c31]/10"
          >
            {creatingPlan
              ? "جاري بناء الخطة..."
              : "إنشاء خطة التطوير ✦"}
          </Button>
        </div>

        {creatingPlan && (
          <div className="mt-7 rounded-2xl border border-[#dcebe0] bg-[#eff8f1] p-5">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#73b987]" />

              <p className="text-xs font-bold text-[#60786d]">
                NOMO يحدد أهدافك ويبني المحتوى
                المناسب لمستواك...
              </p>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-[#73b987]" />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-[#efdcdc] bg-[#fcf1f1] p-4">
            <p className="text-xs font-black text-[#a55c5c]">
              حدث خطأ
            </p>

            <p className="mt-1 text-xs leading-6 text-[#a55c5c]">
              {error}
            </p>
          </div>
        )}
      </div>
    </section>

    {/* STRENGTHS / WEAKNESSES */}
    <section className="mt-6 grid gap-5 lg:grid-cols-2">
      <InsightCard
        type="strength"
        title="نقاط قوتك"
        items={result.strengths || []}
      />

      <InsightCard
        type="weakness"
        title="مجالات تحتاج تطوير"
        items={result.weaknesses || []}
      />
    </section>

    {/* FOCUS */}
    {result.focusAreas?.length > 0 && (
      <section className="nomo-card mt-6 p-6 sm:p-8">
        <SectionHeader
          eyebrow="FOCUS AREAS"
          title="أين يجب أن تركز؟"
          description="هذه المجالات هي الأولوية في رحلة التطوير القادمة."
        />

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.focusAreas.map(
            (area, index) => (
              <div
                key={`${area}-${index}`}
                className="nomo-card-hover rounded-2xl border border-[#e1e8e4] bg-[#fbfcfa] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#73b987]">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span className="text-[#d1ddd5]">
                    ↗
                  </span>
                </div>

                <p className="mt-4 text-sm font-bold leading-7 text-[#30443c]">
                  {area}
                </p>
              </div>
            )
          )}
        </div>
      </section>
    )}

    {/* DOMAINS */}
    {result.domains?.length > 0 && (
      <section className="nomo-card mt-6 p-6 sm:p-8">
        <SectionHeader
          eyebrow="SKILL ANALYSIS"
          title="تحليل المجالات"
          description="نظرة تفصيلية على مستوى أدائك في كل مجال."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {result.domains.map(
            (domain, index) => (
              <DomainCard
                key={`${domain.title}-${index}`}
                domain={domain}
              />
            )
          )}
        </div>
      </section>
    )}

    {/* AI INSIGHT */}
    <section className="nomo-gradient nomo-glow relative mt-6 overflow-hidden rounded-[32px] p-7 sm:rounded-[38px] sm:p-9">
      <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#b9e5c5]/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#b9e5c5] text-lg font-black text-[#123c31]">
            N
          </div>

          <div>
            <div className="text-[9px] font-black tracking-[0.2em] text-[#b9e5c5]">
              AI INSIGHT
            </div>

            <h2 className="mt-1 text-xl font-black text-white">
              اكتشاف NOMO
            </h2>
          </div>
        </div>

        <p className="mt-7 max-w-4xl text-sm leading-8 text-[#d0ddd7]">
          {result.aiInsight ||
            "لم يتم توفير تحليل إضافي."}
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
          <div className="text-[9px] font-black tracking-widest text-[#b9e5c5]">
            التوصية
          </div>

          <p className="mt-2 text-sm font-bold leading-7 text-white">
            {result.recommendation ||
              "ابدأ بخطة التطوير وركز على المجالات ذات الأولوية."}
          </p>
        </div>
      </div>
    </section>

    {/* FINAL CTA */}
    <section className="mt-6 overflow-hidden rounded-[32px] border border-[#dcebe0] bg-[#eff8f1] p-7 text-center sm:rounded-[38px] sm:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#123c31] text-xl font-black text-[#b9e5c5]">
          →
        </div>

        <h2 className="mt-5 text-2xl font-black sm:text-3xl">
          النتيجة ليست النهاية.
        </h2>

        <p className="mt-3 text-sm leading-8 text-[#71827b]">
          الخطوة القادمة هي أن تبدأ بالتعلم،
          التطبيق، ثم الاختبار مرة أخرى.
        </p>

        <Button
          variant="primary"
          size="lg"
          onPress={createPlan}
          isPending={creatingPlan}
          className="mt-6 h-14 rounded-xl bg-[#123c31] px-8 text-sm font-black text-white"
        >
          ابدأ رحلة التطوير
        </Button>
      </div>
    </section>

    <footer className="py-10 text-center">
      <p className="text-[11px] font-bold text-[#9aa9a3]">
        © 2026 NOMO — رحلة المعرفة بالذكاء الاصطناعي
      </p>
    </footer>
  </div>
</main>


);
}

/* -------------------------------- */
/* NAV LINK */
/* -------------------------------- */

function NavLink({
href,
children,
active = false,
}: {
href: string;
children: React.ReactNode;
active?: boolean;
}) {
return (
<Link
href={href}
className={`transition ${
        active
          ? "font-black text-[#123c31]"
          : "hover:text-[#123c31]"
      }`}
>
{children} </Link>
);
}

/* -------------------------------- */
/* STAT */
/* -------------------------------- */

function StatCard({
icon,
value,
label,
}: {
icon: string;
value: string;
label: string;
}) {
return ( <div className="nomo-card-hover rounded-[25px] border border-[#e1e8e4] bg-white p-5 sm:p-6"> <div className="flex items-center justify-between"> <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eff8f1] text-sm font-black text-[#4d8d60]">
{icon} </div>


    <span className="text-[9px] font-black text-[#b4c1bb]">
      NOMO
    </span>
  </div>

  <div className="mt-5 text-2xl font-black sm:text-3xl">
    {value}
  </div>

  <div className="mt-1 text-[11px] font-bold text-[#71827b]">
    {label}
  </div>
</div>


);
}

/* -------------------------------- */
/* INSIGHT CARD */
/* -------------------------------- */

function InsightCard({
type,
title,
items,
}: {
type: "strength" | "weakness";
title: string;
items: string[];
}) {
const isStrength = type === "strength";

return ( <div className="nomo-card p-6 sm:p-7"> <div className="flex items-center gap-3">
<div
className={`grid h-12 w-12 place-items-center rounded-2xl text-lg font-black ${
            isStrength
              ? "bg-[#eff8f1] text-[#4d8d60]"
              : "bg-[#fff7ea] text-[#a57d38]"
          }`}
>
{isStrength ? "✦" : "↗"} </div>


    <div>
      <div className="text-[9px] font-black tracking-widest text-[#9aa9a3]">
        {isStrength
          ? "STRENGTHS"
          : "IMPROVEMENT"}
      </div>

      <h2 className="mt-1 text-xl font-black">
        {title}
      </h2>
    </div>
  </div>

  <div className="mt-6 space-y-3">
    {items.length === 0 ? (
      <EmptyItem />
    ) : (
      items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex gap-3 rounded-2xl bg-[#fbfcfa] p-4"
        >
          <span
            className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[9px] font-black ${
              isStrength
                ? "bg-[#dff4e6] text-[#4d8d60]"
                : "bg-[#f9ecd3] text-[#987b35]"
            }`}
          >
            {index + 1}
          </span>

          <p className="text-sm font-bold leading-7 text-[#60786d]">
            {item}
          </p>
        </div>
      ))
    )}
  </div>
</div>


);
}

/* -------------------------------- */
/* DOMAIN */
/* -------------------------------- */

function DomainCard({
domain,
}: {
domain: Domain;
}) {
const score = Math.max(
0,
Math.min(
100,
Math.round(Number(domain.score) || 0)
)
);

return ( <div className="rounded-[28px] border border-[#e1e8e4] bg-[#fbfcfa] p-5 sm:p-6"> <div className="flex items-start justify-between gap-4"> <div> <div className="text-[9px] font-black text-[#9aa9a3]">
DOMAIN </div>


      <h3 className="mt-1 font-black">
        {domain.title}
      </h3>
    </div>

    <span className="shrink-0 rounded-full bg-[#eff8f1] px-3 py-1.5 text-[10px] font-black text-[#4d8d60]">
      {domain.level || "متوسط"}
    </span>
  </div>

  <div className="mt-6 flex items-end justify-between">
    <span className="text-3xl font-black">
      {score}
      <span className="text-sm text-[#9aa9a3]">
        %
      </span>
    </span>

    <span className="text-[10px] font-bold text-[#9aa9a3]">
      مستوى المجال
    </span>
  </div>

  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5ece7]">
    <div
      className="h-full rounded-full bg-gradient-to-l from-[#73b987] to-[#123c31] transition-all duration-700"
      style={{
        width: `${score}%`,
      }}
    />
  </div>

  <div className="mt-5 grid gap-2">
    {domain.strength && (
      <div className="rounded-2xl bg-[#eff8f1] p-4">
        <div className="text-[9px] font-black text-[#4d8d60]">
          نقطة القوة
        </div>

        <p className="mt-1 text-xs font-bold leading-6 text-[#60786d]">
          {domain.strength}
        </p>
      </div>
    )}

    {domain.weakness && (
      <div className="rounded-2xl bg-[#fff8ec] p-4">
        <div className="text-[9px] font-black text-[#a57d38]">
          تحتاج تطوير
        </div>

        <p className="mt-1 text-xs font-bold leading-6 text-[#78694d]">
          {domain.weakness}
        </p>
      </div>
    )}
  </div>
</div>


);
}

/* -------------------------------- */
/* SECTION HEADER */
/* -------------------------------- */

function SectionHeader({
eyebrow,
title,
description,
}: {
eyebrow: string;
title: string;
description: string;
}) {
return ( <div> <div className="text-[9px] font-black tracking-[0.2em] text-[#73b987]">
{eyebrow} </div>


  <h2 className="mt-2 text-2xl font-black tracking-tight">
    {title}
  </h2>

  <p className="mt-2 text-sm font-medium leading-7 text-[#71827b]">
    {description}
  </p>
</div>


);
}

/* -------------------------------- */
/* EMPTY ITEM */
/* -------------------------------- */

function EmptyItem() {
return ( <div className="rounded-2xl bg-[#fbfcfa] p-4 text-sm font-bold text-[#9aa9a3]">
لا توجد بيانات إضافية. </div>
);
}

/* -------------------------------- */
/* LOADING */
/* -------------------------------- */

function DashboardLoading() {
return ( <main
   dir="rtl"
   className="flex min-h-screen items-center justify-center bg-[#f6f7f5] px-6"
 > <div className="w-full max-w-md text-center"> <div className="nomo-card p-10"> <div className="relative mx-auto h-20 w-20"> <div className="absolute inset-0 animate-ping rounded-3xl bg-[#b9e5c5]/40" />

        <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-[#123c31] text-2xl font-black text-[#b9e5c5] shadow-xl">
          N
        </div>
      </div>

      <h1 className="mt-7 text-2xl font-black text-[#123c31]">
        نحضر ملفك المعرفي...
      </h1>

      <p className="mt-3 text-sm leading-7 text-[#71827b]">
        NOMO يسترجع نتائج تقييمك
      </p>

      <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-[#e3ebe6]">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[#73b987]" />
      </div>
    </div>
  </div>
</main>


);
}

/* -------------------------------- */
/* EMPTY DASHBOARD */
/* -------------------------------- */

function EmptyDashboard({
error,
}: {
error: string;
}) {
return ( <main
   dir="rtl"
   className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7f5] px-5"
 > <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#b9e5c5]/20 blur-3xl" />

```
  <div className="relative w-full max-w-md">
    <div className="nomo-card p-8 text-center sm:p-10">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-[#eff8f1] text-2xl font-black text-[#123c31]">
        N
      </div>

      <h1 className="mt-7 text-2xl font-black text-[#123c31]">
        ابدأ رحلتك مع NOMO
      </h1>

      <p className="mt-4 text-sm leading-8 text-[#71827b]">
        {error ||
          "لا توجد نتيجة تقييم محفوظة حاليًا. ابدأ التقييم حتى يتمكن NOMO من تحليل مستواك."}
      </p>

      <Link
        href="/assessment"
        className="mt-7 block"
      >
        <Button
          variant="primary"
          size="lg"
          className="h-14 w-full rounded-xl bg-[#123c31] font-black text-white"
        >
          ابدأ التقييم
        </Button>
      </Link>
    </div>
  </div>
</main>


);
}
