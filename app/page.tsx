
"use client";

import Link from "next/link";
import { Button } from "@heroui/react";

const features = [
  {
    number: "01",
    title: "تحليل ذكي",
    text: "حلل إجاباتك واكتشف مستواك الحقيقي ونقاط القوة والضعف.",
  },
  {
    number: "02",
    title: "خطة شخصية",
    text: "احصل على مسار تعلم مصمم بناءً على مستواك واحتياجاتك.",
  },
  {
    number: "03",
    title: "تحديات و XP",
    text: "تعلم، حل الأسئلة، أنجز التحديات واجمع XP مع تقدمك.",
  },
];

export default function HomePage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]"
    >
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">

        {/* =====================================================
            NAVBAR
        ===================================================== */}

        <nav className="sticky top-5 z-50 mx-auto flex max-w-5xl items-center justify-between rounded-2xl border border-black/[0.06] bg-white/75 px-4 py-3 shadow-[0_10px_40px_rgba(16,35,29,0.06)] backdrop-blur-xl">

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123c31] text-sm font-black text-white shadow-lg shadow-[#123c31]/15 transition-transform duration-300 group-hover:scale-105">
              N
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">
                NOMO
              </div>

              <div className="text-[8px] font-bold tracking-wide text-[#789087]">
                رحلة المعرفة بالذكاء الاصطناعي
              </div>
            </div>
          </Link>

          <Link href="/assessment">
            <Button
              variant="primary"
              className="h-10 rounded-xl bg-[#123c31] px-5 font-bold text-white shadow-lg shadow-[#123c31]/10"
            >
              ابدأ الآن
            </Button>
          </Link>

        </nav>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="nomo-gradient nomo-grid nomo-glow relative mt-8 overflow-hidden rounded-[2rem] px-6 py-16 text-white sm:px-10 md:rounded-[3rem] md:px-16 md:py-24">

          {/* Decorative blobs */}

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#b9e5c5]/10 blur-3xl" />

          <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-[#73b987]/10 blur-3xl" />

          <div className="relative z-10 grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr]">

            {/* HERO TEXT */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-[10px] font-black tracking-[0.15em] text-[#b9e5c5] backdrop-blur-md">

                <span className="h-1.5 w-1.5 rounded-full bg-[#b9e5c5] shadow-[0_0_12px_#b9e5c5]" />

                AI ADAPTIVE LEARNING

              </div>

              <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl lg:text-[82px]">
                لا تتعلم
                <br />
                <span className="text-[#b9e5c5]">
                  بطريقة واحدة.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-sm leading-8 text-[#b7c9c2] sm:text-base">
                NOMO يفهم مستواك، يحلل إجاباتك،
                ويكتشف نقاط ضعفك ثم يبني لك تجربة
                تعلم شخصية تناسبك أنت.
              </p>

              {/* CTA BUTTONS */}

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Link href="/assessment">
                  <Button
                    variant="primary"
                    size="lg"
                    className="h-12 w-full rounded-xl bg-[#b9e5c5] px-7 font-black text-[#123c31] shadow-xl shadow-black/10 sm:w-auto"
                  >
                    اكتشف مستواك
                    <span>←</span>
                  </Button>
                </Link>

                <Link href="#features">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.05] px-7 font-bold text-white backdrop-blur-md sm:w-auto"
                  >
                    كيف يعمل NOMO؟
                  </Button>
                </Link>

              </div>

              {/* STATS */}

              <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-7">

                <Stat
                  value="AI"
                  label="تعلم ذكي"
                />

                <Stat
                  value="7"
                  label="أيام تعلم"
                />

                <Stat
                  value="∞"
                  label="إمكانيات"
                />

              </div>

            </div>

            {/* =================================================
                VISUAL CARD
            ================================================= */}

            <div className="relative hidden lg:block">

              <div className="relative mx-auto aspect-square max-w-[390px] rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">

                {/* LEVEL CARD */}

                <div className="absolute -right-5 top-12 w-48 rounded-2xl border border-white/10 bg-[#173f34]/90 p-4 shadow-2xl backdrop-blur-xl">

                  <div className="text-[9px] font-bold text-[#9db4aa]">
                    مستواك الحالي
                  </div>

                  <div className="mt-2 flex items-end justify-between">

                    <span className="text-3xl font-black">
                      82%
                    </span>

                    <span className="rounded-full bg-[#b9e5c5]/10 px-2 py-1 text-[9px] font-bold text-[#b9e5c5]">
                      +12%
                    </span>

                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">

                    <div className="h-full w-[82%] rounded-full bg-[#b9e5c5]" />

                  </div>

                </div>

                {/* DASHBOARD */}

                <div className="flex h-full flex-col justify-between rounded-[2rem] bg-white/[0.045] p-6">

                  <div>

                    <div className="text-xs font-bold text-[#8fa79e]">
                      NOMO / DASHBOARD
                    </div>

                    <div className="mt-8 text-4xl font-black">
                      خطتك
                    </div>

                    <div className="mt-2 text-sm text-[#91a79f]">
                      مصممة خصيصًا لك
                    </div>

                  </div>

                  <div className="space-y-3">

                    <MiniProgress
                      title="أساسيات البرمجة"
                      value="92%"
                      width="92%"
                    />

                    <MiniProgress
                      title="حل المشكلات"
                      value="76%"
                      width="76%"
                    />

                    <MiniProgress
                      title="التطبيق العملي"
                      value="64%"
                      width="64%"
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section
          id="features"
          className="py-20 md:py-28"
        >

          <div className="max-w-2xl">

            <div className="text-xs font-black tracking-[0.15em] text-[#73a885]">
              WHY NOMO
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              تعلم مبني
              <br />
              <span className="nomo-text-gradient">
                على مستواك.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#71827b] md:text-base">
              بدل ما تبدأ من مكان عشوائي، NOMO يبدأ بفهم
              مستواك ثم يحول النتيجة إلى تجربة تعلم واضحة.
            </p>

          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {features.map((feature) => (
              <Feature
                key={feature.number}
                number={feature.number}
                title={feature.title}
                text={feature.text}
              />
            ))}

          </div>

        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="nomo-card relative overflow-hidden p-8 md:p-12">

          <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[#b9e5c5]/30 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

            <div>

              <div className="text-xs font-black text-[#73a885]">
                READY?
              </div>

              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                ابدأ رحلتك الآن.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#71827b]">
                اختبار بسيط يساعد NOMO على فهم مستواك
                وبناء بداية مناسبة لك.
              </p>

            </div>

            <Link href="/assessment">
              <Button
                variant="primary"
                size="lg"
                className="h-12 rounded-xl bg-[#123c31] px-8 font-black text-white shadow-xl shadow-[#123c31]/15"
              >
                ابدأ الاختبار
                <span>←</span>
              </Button>
            </Link>

          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="flex flex-col gap-3 py-10 text-center text-xs text-[#8a9993] sm:flex-row sm:items-center sm:justify-between sm:text-right">

          <div className="font-black text-[#123c31]">
            NOMO
          </div>

          <div>
            رحلة المعرفة بالذكاء الاصطناعي
          </div>

        </footer>

      </div>
    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>

      <div className="text-2xl font-black">
        {value}
      </div>

      <div className="mt-1 text-[10px] font-bold text-[#8fa79e]">
        {label}
      </div>

    </div>
  );
}

/* =========================================================
   MINI PROGRESS
========================================================= */

function MiniProgress({
  title,
  value,
  width,
}: {
  title: string;
  value: string;
  width: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

      <div className="flex items-center justify-between text-xs">

        <span className="font-bold text-[#c4d2cc]">
          {title}
        </span>

        <span className="font-black text-[#b9e5c5]">
          {value}
        </span>

      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">

        <div
          className="h-full rounded-full bg-[#73b987]"
          style={{ width }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="nomo-card nomo-card-hover group relative overflow-hidden p-7">

      <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-[#b9e5c5]/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative">

        <div className="flex items-center justify-between">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123c31] text-sm font-black text-white">
            {number}
          </div>

          <span className="text-xl text-[#b5c5be] transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>

        </div>

        <h3 className="mt-8 text-xl font-black">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-[#71827b]">
          {text}
        </p>

      </div>
    </div>
  );
}

