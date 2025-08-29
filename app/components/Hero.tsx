"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Hand } from "lucide-react";

/* =========================================================
   Types
========================================================= */
interface TeslaModel {
  id: string;
  name: string;
  count: number;
}

interface HeroProps {
  model3Count: number;
  modelYCount: number;
}

/* =========================================================
   Utils
========================================================= */
const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/* =========================================================
   Mobile hero (equal height cards)
========================================================= */
function MobileHeroCard({
  title,
  tagline,
  kpi,
  cta,
  image,
  accent,
}: {
  title: string;
  tagline: string;
  kpi: string;
  cta: { label: string; href: string };
  image: string;
  accent: string;
}) {
  return (
    <Link
      href={cta.href}
      className="snap-start relative min-w-full h-[70vh] sm:h-[72vh] group overflow-hidden"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-700 group-active:scale-[1.03]"
        priority={false}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_20%,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
      <div
        aria-hidden
        className={cn(
          "absolute -inset-x-10 -bottom-10 h-32 blur-xl opacity-50 group-active:opacity-80 transition-opacity duration-500",
          `bg-gradient-to-r ${accent}`
        )}
      />

      <div className="relative z-10 h-full flex flex-col justify-between px-6 text-white">
        <div className="flex items-center gap-2 pt-8">
          <span className={cn("h-2 w-2 rounded-full bg-gradient-to-r", accent)} />
          <span className="text-xs tracking-wider uppercase opacity-90 drop-shadow">
            {tagline}
          </span>
        </div>

        <div className="pb-10">
          <h2 className="text-5xl font-extrabold tracking-tight drop-shadow-lg mb-3">
            {title}
          </h2>
          <p className="text-slate-200/90 text-xl mb-7 drop-shadow">{kpi}</p>

          <div className="inline-flex items-center gap-3 rounded-full bg-white text-slate-900 font-bold px-6 py-4 shadow-xl shadow-black/20 ring-1 ring-white/40 transition-all active:scale-95">
            <span className="text-lg">{cta.label}</span>
            <Hand className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent" />
    </Link>
  );
}

/* =========================================================
   Desktop Triple Hero (33.33% each)
========================================================= */
function TripleHero({
  model3Count,
  modelYCount,
}: {
  model3Count: number;
  modelYCount: number;
}) {
  const panels = [
    {
      key: "model-y",
      title: "Model Y",
      tagline: "Coming online now",
      kpi: modelYCount ? `${modelYCount}+ Parts` : "Soon • 600+",
      cta: { label: modelYCount ? "Shop Model Y" : "Get Notified", href: "/model-y" },
      img: "/images/hero-2.jpg",
      accent: "from-cyan-400 to-blue-500",
    },
    {
      key: "model-3",
      title: "Model 3",
      tagline: "OEM-grade components",
      kpi: model3Count ? `${model3Count}+ Parts` : "615+ Parts",
      cta: { label: "Shop Model 3", href: "/model-3" },
      img: "/images/hero-1.jpg",
      accent: "from-emerald-400 to-teal-400",
    },
    {
      key: "service",
      title: "Service + Install",
      tagline: "Pro technicians • Guaranteed fit",
      kpi: "Same‑day slots",
      cta: { label: "Book Appointment", href: "/service" },
      img: "/images/hero-3.jpg",
      accent: "from-amber-400 to-rose-500",
    },
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_10%,rgba(16,185,129,0.08),transparent_60%)]" />

      <div className="grid grid-cols-3 min-h-[82vh]">
        {panels.map((p, i) => (
          <Link
            key={p.key}
            href={p.cta.href}
            className={cn(
              "relative group overflow-hidden border-y border-slate-200",
              i !== 0 && "border-l"
            )}
          >
            <Image
              src={p.img}
              alt={p.title}
              fill
              sizes="33vw"
              priority={i === 1}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
            <div
              aria-hidden
              className={cn(
                "absolute -inset-x-10 -bottom-10 h-40 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500",
                `bg-gradient-to-r ${p.accent}`
              )}
            />

            <div className="relative z-10 h-full flex flex-col justify-between p-10 text-white">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full bg-gradient-to-r", p.accent)} />
                <span className="text-xs tracking-wider uppercase opacity-90">{p.tagline}</span>
              </div>

              <div>
                <h2 className="text-5xl font-extrabold tracking-tight drop-shadow-sm">
                  {p.title}
                </h2>
                <p className="mt-2 text-slate-200/90 text-lg">{p.kpi}</p>

                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 font-semibold px-5 py-2.5 shadow-lg shadow-black/10 ring-1 ring-white/40 transition-all group-hover:translate-x-0.5">
                    {p.cta.label}
                    <Hand className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/20 to-transparent" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   Main Hero Component
========================================================= */
const Hero: React.FC<HeroProps> = ({ model3Count, modelYCount }) => {
  return (
    <>
      {/* MOBILE: hero carousel */}
      <div className="lg:hidden">
        <section className="relative">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full">
            <MobileHeroCard
              title="Model 3"
              tagline="OEM-grade components"
              kpi={model3Count ? `${model3Count}+ Parts` : "615+ Parts"}
              cta={{ label: "Shop Model 3", href: "/model-3" }}
              image="/images/hero-1.jpg"
              accent="from-emerald-400 to-teal-400"
            />
            <MobileHeroCard
              title="Model Y"
              tagline="Coming online now"
              kpi={modelYCount ? `${modelYCount}+ Parts` : "Soon • 600+"}
              cta={{ label: modelYCount ? "Shop Model Y" : "Get Notified", href: "/model-y" }}
              image="/images/hero-2.jpg"
              accent="from-cyan-400 to-blue-500"
            />
            <MobileHeroCard
              title="Service + Install"
              tagline="Pro technicians • Guaranteed fit"
              kpi="Same‑day slots"
              cta={{ label: "Book Appointment", href: "/service" }}
              image="/images/hero-3.jpg"
              accent="from-amber-400 to-rose-500"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="w-2 h-2 rounded-full bg-white/70" />
            <span className="w-2 h-2 rounded-full bg-white/70" />
            <span className="w-2 h-2 rounded-full bg-white/70" />
          </div>
        </section>
      </div>

      {/* DESKTOP: triple hero */}
      <div className="hidden lg:block">
        <TripleHero model3Count={model3Count} modelYCount={modelYCount} />
      </div>
    </>
  );
};

export default Hero;