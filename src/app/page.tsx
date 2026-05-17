"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { commercialPresentations, userPresentations } from "@/data/commercial-presentations";
import type { CommercialPresentation } from "@/data/commercial-presentations";

const allPresentations = [...commercialPresentations, ...userPresentations];
import { PresentationSlide } from "@/components/commercial-presentations/PresentationSlide";
import { SlideViewport } from "@/components/commercial-presentations/SlideViewport";
import { PageMappingSection } from "@/components/commercial-presentations/PageMappingSection";
import { Section } from "@/app/styleguide/foundation-sections";
import { ChamferedPanel } from "@/components/chamfered-panel";
import { TypingAnimation } from "@/components/magicui/typing-animation";

const BRAND_LOGO_URL =
  "https://raw.githubusercontent.com/chuvstudiodesign/logos-masi-negocios/71ad67702f1e8fc61061ef81a2e9f372788e7dab/Negocios.svg";

const NAV_TOP = 22;
const NAV_H = 60;
const NAV_X = 30;

const HERO_TITLE = "Sistema de criação de apresentação comercial.";
const HERO_TITLE_CLASS =
  "max-w-5xl text-center text-[62px] font-extrabold leading-[1.05] tracking-normal text-foreground";

const presentation = commercialPresentations[0];

// Resumos de até 31 chars para cada slide — únicos, baseados no conteúdo real
const SLIDE_SUMMARIES = [
  "O futuro dos negócios no Brasil", // 01 cover
  "Tese: contexto, tech e execução", // 02 statement
  "O mercado mudou de ritmo",        // 03 context
  "Ferramentas novas, velha visão",  // 04 problem
  "Cliente reorganiza o mercado",    // 05 behavior
  "Oportunidade na conexão real",    // 06 opportunity
  "Três sinais para observar agora", // 07 stats
  "Mercado, produto e execução",     // 08 framework
  "Inovação vira método e rotina",   // 09 principle
  "Aplicação prática no negócio",    // 10 example
  "Como líderes criam mecanismos",   // 11 leaders
  "Critérios claros de decisão",     // 12 decision
  "Sistema por trás da narrativa",   // 13 concept
  "Menos dispersão, mais critério",  // 14 turning-point
  "Quatro movimentos para agir já",  // 15 action-plan
  "Clareza e consistência no valor", // 16 benefits
  "Riscos de não agir agora",        // 17 risks
  "O que a liderança deve fazer",    // 18 recommendations
  "Próximo passo: plano de 90 dias", // 19 cta
  "Transforme clareza em movimento", // 20 closing
];

// ── Stacked slides preview (hero) ─────────────────────────────────────────────

const SLIDE_W = 1600;
const SLIDE_H = 900;
const DISPLAY_W = 680;
const DISPLAY_H = Math.round(DISPLAY_W * (SLIDE_H / SLIDE_W));
const DISPLAY_SCALE = DISPLAY_W / SLIDE_W;
const OFFSET_Y = 36;
const OFFSET_Z = 60;
const FAN_X = DISPLAY_W * 0.3;

function StackedSlidesPreview() {
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const slideDivs = useRef<(HTMLDivElement | null)[]>([]);
  const slides = presentation.slides.slice(0, 3);
  const xByIndex = [-FAN_X, 0, FAN_X] as const;

  useEffect(() => {
    function applyProgress(p: number) {
      slideDivs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transform = `translateZ(${-i * OFFSET_Z}px) translateX(${xByIndex[i as 0 | 1 | 2] * p}px)`;
      });
    }
    function onScroll() {
      const clamped = Math.min(1, window.scrollY / 380);
      if (clamped === progressRef.current) return;
      progressRef.current = clamped;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        applyProgress(progressRef.current);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative mx-auto"
      style={{
        width: DISPLAY_W,
        height: DISPLAY_H + OFFSET_Y * (slides.length - 1),
        perspective: "1400px",
        perspectiveOrigin: "50% 30%",
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          ref={(el) => { slideDivs.current[i] = el; }}
          className="absolute left-0 overflow-hidden rounded-[8px]"
          style={{
            width: DISPLAY_W,
            height: DISPLAY_H,
            top: i * OFFSET_Y,
            zIndex: slides.length - i,
            willChange: "transform",
            transform: `translateZ(${-i * OFFSET_Z}px) translateX(0px)`,
            boxShadow: `0 ${10 + i * 12}px ${24 + i * 20}px rgba(0,0,0,${0.16 + i * 0.07})`,
          }}
        >
          <div
            className="origin-top-left"
            style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${DISPLAY_SCALE})` }}
          >
            <PresentationSlide presentation={presentation} slide={slide} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Home presentation panel (section 2) ───────────────────────────────────────

const SIDEBAR_W = Math.round(248 * 1.2 * 1.1 * 1.15); // 377px (+20% +10% +15%)

function HomePresentationPanel({ presentation }: { presentation: CommercialPresentation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Altura do SlideViewport medida em tempo real para sincronizar o painel lateral
  const [viewportHeight, setViewportHeight] = useState(0);
  const viewportWrapRef = useRef<HTMLDivElement>(null);
  const currentSlide = presentation.slides[currentIndex] ?? presentation.slides[0];

  useEffect(() => {
    const el = viewportWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setViewportHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const prev = () =>
    setCurrentIndex((i) => (i === 0 ? presentation.slides.length - 1 : i - 1));
  const next = () =>
    setCurrentIndex((i) => (i === presentation.slides.length - 1 ? 0 : i + 1));

  return (
    <div className="flex items-start gap-0" style={{ maxWidth: 2200 }}>
      {/* ── Slide + nav abaixo ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Wrapper medido para sincronizar altura do painel lateral */}
        <div ref={viewportWrapRef}>
          <SlideViewport presentation={presentation} slide={currentSlide} />
        </div>

        {/* Controles abaixo do slide: número (esquerda) + botões (direita) */}
        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full bg-[#ECECEC] px-4 py-2 font-mono text-[12px] font-bold text-foreground">
            {String(currentIndex + 1).padStart(2, "0")} de {presentation.slides.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              className="flex items-center gap-1.5 rounded-[8px] bg-[#ECECEC] px-3 py-2 text-[13px] font-medium transition hover:bg-[#D4D4D4]"
            >
              <ArrowLeft className="size-4" />
              Anterior
            </button>
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1.5 rounded-[8px] bg-foreground px-3 py-2 text-[13px] font-medium text-background transition hover:opacity-80"
            >
              Próximo
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sidebar direita ── */}
      {/*
        Toggle (vinheta) sempre visível, no canto superior esquerdo do bloco sidebar.
        Quando o painel fecha (width → 0), o toggle fica encostado na borda direita do slide.
      */}
      <div className="flex items-start pl-2">
        {/* Vinheta de toggle — canto superior, estilo style guide */}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Fechar painel" : "Abrir painel"}
          className="mt-3 flex h-14 w-6 flex-none items-center justify-center rounded-full border border-black/[0.08] bg-[#ececec] shadow-sm transition-colors hover:bg-white"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            {sidebarOpen ? (
              <path d="M1.5 1L6 6L1.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M5.5 1L1 6L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>

        {/* Painel — mesma altura do viewport (medida via ResizeObserver) */}
        <div
          className="ml-2 overflow-hidden rounded-[10px] transition-[width] duration-300 ease-in-out"
          style={{
            width: sidebarOpen ? SIDEBAR_W : 0,
            height: viewportHeight || "auto",
          }}
        >
          <div
            className="flex flex-col bg-white shadow-[var(--shadow-card)] rounded-[10px]"
            style={{ width: SIDEBAR_W, height: viewportHeight || "auto" }}
          >
            <div className="no-scrollbar flex-1 overflow-y-auto p-[20px]">
              <div className="flex flex-col gap-1">
                {presentation.slides.map((slide, index) => {
                  const active = index === currentIndex;
                  const isDark =
                    slide.visual === "dark" ||
                    slide.visual === "quote" ||
                    slide.type === "closing";

                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "w-full rounded-[8px] border p-2 text-left transition",
                        active
                          ? "border-black bg-white shadow-sm"
                          : "border-transparent hover:border-black/10 hover:bg-[#FAFAFA]"
                      )}
                    >
                      {/* Miniatura aspect-video */}
                      <div
                        className="aspect-video w-full overflow-hidden rounded-[6px]"
                        style={{
                          background: isDark
                            ? `linear-gradient(135deg, ${presentation.darkAccent}, #0C1C16)`
                            : "linear-gradient(135deg, #FFFFFF, #ECECEC)",
                        }}
                      >
                        <div className="flex h-full flex-col justify-between p-2">
                          <span
                            className="font-mono text-[14px] font-black"
                            style={{ color: presentation.accent }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "text-[16px] font-bold leading-tight",
                              isDark ? "text-white" : "text-black"
                            )}
                          >
                            {SLIDE_SUMMARIES[index] ?? slide.title.replace(/\n/g, " ").slice(0, 31)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Overlay do menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer de apresentações — desliza da direita */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col overflow-y-auto rounded-[10px] border border-white p-5",
          "transition-transform duration-200",
          menuOpen ? "translate-x-0" : "translate-x-[calc(100%+30px)]"
        )}
        style={{
          right: NAV_X,
          top: NAV_X,
          width: 280,
          maxHeight: `calc(100vh - ${NAV_X * 2}px)`,
          backgroundColor: "#ececec",
          boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
        }}
      >
        <div className="mb-4 flex items-center justify-between border-b border-white pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Apresentações
          </p>
          <button
            onClick={() => setMenuOpen(false)}
            className="rounded-[8px] p-1 transition hover:bg-black/5"
            aria-label="Fechar menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {allPresentations.map((p) => (
            <Link
              key={p.id}
              href={`/apresentacao/${p.slug}`}
              onClick={() => setMenuOpen(false)}
              className="block rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-foreground transition hover:bg-black/5"
            >
              {p.title.replace(/\n/g, " ")}
            </Link>
          ))}
        </nav>

        {allPresentations.length === 0 && (
          <p className="text-[12px] text-muted-foreground">
            Nenhuma apresentação criada ainda. Peça ao Claude para criar uma.
          </p>
        )}
      </aside>

      {/* Floating navbar */}
      <header
        className="fixed z-30 flex items-center justify-between rounded-[10px] bg-[#ececec] border border-white"
        style={{
          top: NAV_TOP,
          left: NAV_X,
          right: NAV_X,
          height: NAV_H,
          paddingLeft: NAV_X,
          paddingRight: NAV_X,
        }}
      >
        <Link href="/" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND_LOGO_URL} alt="Masi Negócios" className="h-[19px] w-auto" />
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
          className="rounded-[10px] p-1.5 transition-colors hover:bg-black/5"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Main content — cresce com a viewport, sem limite artificial */}
      <div
        className="px-[30px] pb-[30px]"
        style={{ paddingTop: NAV_TOP + NAV_H + NAV_TOP }}
      >
        <main>
          <div className="ds-page">
            {/* Section 1 — Hero */}
            <section className="w-full">
              <ChamferedPanel
                strokeColor="#FFFFFF"
                strokeWidth={1}
                innerStyle={{
                  background: "#ECECEC",
                  borderRadius: 10,
                  padding: "100px var(--section-padding-x) var(--section-padding-y)",
                }}
              >
                <div className="flex w-full flex-col items-center overflow-visible">
                  <div className="flex w-full max-w-5xl flex-col items-center gap-[60px] text-center">
                    <Image
                      src="/logos/primary/masi-primary-dark.svg"
                      alt="Masi Negócios"
                      width={256}
                      height={77}
                      priority
                      className="h-auto w-[256px]"
                    />
                    <div className="relative z-10 w-full max-w-5xl">
                      <h1 className={`${HERO_TITLE_CLASS} invisible mx-auto`} aria-hidden="true">
                        {HERO_TITLE}
                      </h1>
                      <TypingAnimation
                        as="h1"
                        duration={2800}
                        className={`${HERO_TITLE_CLASS} absolute inset-x-0 top-0 mx-auto`}
                      >
                        {HERO_TITLE}
                      </TypingAnimation>
                    </div>
                  </div>
                  <div className="mt-[100px] flex w-full justify-center overflow-visible">
                    <StackedSlidesPreview />
                  </div>
                </div>
              </ChamferedPanel>
            </section>

            {/* Section 2 — Apresentação Demo */}
            <Section
              title="Apresentação Demo"
              subtitle="Esta apresentação segue o estilo visual de section, de card e de imagem."
            >
              <HomePresentationPanel presentation={presentation} />
            </Section>

            {/* Section 3 — Mapeamento de Páginas */}
            <Section
              title="Mapeamento de Páginas"
              subtitle="Cada tipo de página define a estrutura visual e os limites de caracteres para título, corpo, citações e cards. Use este mapa para encaixar o conteúdo no tipo de página certo."
            >
              <PageMappingSection />
            </Section>
          </div>
        </main>
      </div>
    </div>
  );
}
