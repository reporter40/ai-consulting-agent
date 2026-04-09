"use client";

import dynamic from "next/dynamic";
import {
  MapPin, Eye, Bot, Dna,
  Search, Handshake, Heart,
  ArrowRight, Play,
} from "lucide-react";
import { LandingNav } from "@/components/ui/landing-nav";
import { HeroCanvas } from "@/components/3d/HeroCanvas";
import { ParallaxLayer } from "@/components/3d/ParallaxLayer";
import { ScrollSequence } from "@/components/3d/ScrollSequence";
import { FeatureCard } from "@/components/ui/feature-card";
import { CTASection } from "@/components/ui/cta-section";
import burialsData from "@/data/burials-mock.json";

const MemorialMap = dynamic(
  () => import("@/components/3d/MemorialMap").then((m) => m.MemorialMap),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-landing-muted">Загрузка карты...</div> }
);

/* ─────────────────────────────────────────────
 * Контент из аудита: Решение #1 (первый экран)
 * + Решение #3 (архитектура сайта)
 * ───────────────────────────────────────────── */

const TECH_LEVELS = [
  {
    icon: MapPin,
    title: "GIS-карта памяти",
    description:
      "12 000 захоронений в 48 странах. Интерактивная карта с поиском по ФИО, фильтрами по странам и годам.",
  },
  {
    icon: Eye,
    title: "VR-туры",
    description:
      "Виртуальные визиты к мемориалам. Matterport-съёмка реальных захоронений. Доступно из браузера.",
  },
  {
    icon: Bot,
    title: "ИИ-аватары ветеранов",
    description:
      "Реконструкция образа на основе архивных данных. Только документированные факты. Маркировка «ИИ-реконструкция».",
  },
  {
    icon: Dna,
    title: "ДНК-идентификация",
    description:
      "Интеграция с государственным оператором. Платформа не хранит первичные геномные данные. Соответствие ФЗ от 08.03.2026.",
  },
] as const;

const TIMELINE = [
  { year: "2005", project: "«Победители»", stat: "1 млн ветеранов" },
  { year: "2007", project: "OBD «Мемориал»", stat: "13 млн документов" },
  { year: "2026", project: "«Герои не умирают»", stat: "GIS + VR + ИИ + ДНК" },
] as const;

const ETHICS_PRINCIPLES = [
  "Согласие потомков на каждый ИИ-аватар",
  "Историческая достоверность — только архивные факты",
  "Право на удаление аватара в любой момент",
  "Запрет коммерческой эксплуатации образов ветеранов",
  "Защита ДНК-данных — только госоператор",
  "Независимый Этический совет из 5 экспертов",
] as const;

export default function LandingPage() {
  return (
    <>
      <LandingNav />

      {/* ══════════════════════════════════════
       *  HERO — Решение #1 из PDF
       * ══════════════════════════════════════ */}
      <section className="relative">
        <HeroCanvas
          frameCount={30}
          framePath="/frames/hero/frame_"
          frameExtension="svg"
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="sticky top-0 flex h-screen items-center justify-center px-6">
            <div className="mx-auto max-w-4xl text-center">
              <ParallaxLayer speed={0.3} offset={100}>
                <h1 className="font-heading mb-6 text-5xl font-bold leading-tight tracking-tight text-landing-text md:text-7xl lg:text-8xl">
                  Герои не умирают.
                  <br />
                  <span className="text-landing-accent">Теперь — буквально.</span>
                </h1>
              </ParallaxLayer>

              <ParallaxLayer speed={0.5} offset={80}>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-landing-muted md:text-xl">
                  Третье поколение цифровой памяти о ВОВ. GIS-карта 12 000
                  захоронений в 48 странах + VR-туры + ИИ-аватары ветеранов +
                  ДНК-идентификация. Единственная в мире платформа, объединяющая
                  все четыре технологии.
                </p>
              </ParallaxLayer>

              {/* 3 CTA — как в Решении #1 */}
              <ParallaxLayer speed={0.6} offset={60}>
                <div className="pointer-events-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <a
                    href="#search"
                    className="inline-flex items-center gap-2 rounded-full bg-landing-accent px-8 py-3 text-base font-medium text-white transition-all hover:gap-3 hover:bg-landing-accent-hover"
                  >
                    <Search className="h-4 w-4" />
                    Найти родственника
                  </a>
                  <a
                    href="/landing/partner"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3 text-base font-medium text-landing-text transition-colors hover:border-white/40"
                  >
                    <Handshake className="h-4 w-4" />
                    Стать партнёром
                  </a>
                  <a
                    href="#support"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3 text-base font-medium text-landing-text transition-colors hover:border-landing-accent/40"
                  >
                    <Heart className="h-4 w-4" />
                    Поддержать проект
                  </a>
                </div>
              </ParallaxLayer>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  KILLER-ФАКТ — из Решения #1
       * ══════════════════════════════════════ */}
      <section className="relative border-y border-white/10 bg-landing-accent/5 px-6 py-16 text-center">
        <p className="mx-auto max-w-3xl text-xl font-medium italic text-landing-text md:text-2xl">
          Каждый год находят 10 000–16 000 неопознанных останков советских воинов.
          <br />
          Идентифицируют — <span className="text-landing-accent">7%</span>.
          <br />
          Мы изменим это число на <span className="text-landing-accent font-bold">70%</span>.
        </p>
      </section>

      {/* ══════════════════════════════════════
       *  SOCIAL PROOF — strip преемственности
       * ══════════════════════════════════════ */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <ParallaxLayer speed={0.2} offset={40}>
            <p className="mb-12 text-center text-sm uppercase tracking-widest text-landing-muted">
              Одна команда. 21 год. 50+ семей нашли родственников через 60 лет после войны.
            </p>
          </ParallaxLayer>

          <div id="legacy" className="grid gap-8 md:grid-cols-3">
            {TIMELINE.map((item) => (
              <div
                key={item.year}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center transition-colors hover:border-landing-accent/30"
              >
                <span className="mb-2 block font-heading text-5xl font-bold text-landing-accent/30">
                  {item.year}
                </span>
                <h3 className="mb-1 text-lg font-semibold text-landing-text">
                  {item.project}
                </h3>
                <p className="text-sm text-landing-muted">{item.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  4 ТЕХНОЛОГИЧЕСКИХ УРОВНЯ — unfair advantage
       * ══════════════════════════════════════ */}
      <section id="tech" className="relative px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <ParallaxLayer speed={0.2} offset={60}>
            <h2 className="mb-4 text-center font-heading text-3xl font-bold text-landing-text md:text-5xl">
              Единственная в мире комбинация
            </h2>
            <p className="mb-16 text-center text-landing-muted">
              Четыре технологии, объединённые в одну экосистему — этого нет ни у кого
            </p>
          </ParallaxLayer>

          <div className="grid gap-6 sm:grid-cols-2">
            {TECH_LEVELS.map((tech, i) => (
              <FeatureCard
                key={tech.title}
                icon={tech.icon}
                title={tech.title}
                description={tech.description}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  ДЕМО-ПОИСК — моковый (Решение #3: /search)
       * ══════════════════════════════════════ */}
      <section id="search" className="relative px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-landing-text md:text-5xl">
            Найти ветерана
          </h2>
          <p className="mb-8 text-landing-muted">
            Введите ФИО — мы проверим по базе 12 000 захоронений в 48 странах
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Фамилия Имя Отчество"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none focus:ring-1 focus:ring-landing-accent"
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-landing-accent px-8 py-4 font-medium text-white transition-opacity hover:opacity-90">
              <Search className="h-5 w-5" />
              Искать
            </button>
          </div>
          <p className="mt-4 text-xs text-landing-muted/60">
            Демо-версия. Полный поиск будет доступен после запуска MVP.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  ПРОМО-ВИДЕО — 90 секунд (заглушка)
       * ══════════════════════════════════════ */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="absolute inset-0 bg-gradient-to-b from-landing-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <button className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:border-landing-accent">
              <Play className="h-8 w-8 text-white" fill="white" />
            </button>
            <p className="absolute bottom-6 text-sm text-landing-muted">
              Промо-ролик 90 сек — GR-питч в видеоформате
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  ЭТИКА — Решение #2 (краткая версия)
       * ══════════════════════════════════════ */}
      <section id="ethics" className="relative px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <ScrollSequence scrollHeight={3}>
            <div className="flex h-full flex-col items-center justify-center px-6">
              <h2 className="mb-4 text-center font-heading text-3xl font-bold text-landing-text md:text-5xl">
                Этические принципы
              </h2>
              <p className="mb-12 max-w-2xl text-center text-landing-muted">
                ИИ-аватары умерших и ДНК-данные — зона максимальной ответственности.
                Наши обязательства имеют приоритет над коммерческими целями.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {ETHICS_PRINCIPLES.map((principle, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-landing-accent/20 text-xs font-bold text-landing-accent">
                      {i + 1}
                    </span>
                    <p className="text-sm text-landing-text">{principle}</p>
                  </div>
                ))}
              </div>
              <a
                href="/landing/ethics"
                className="mt-8 inline-flex items-center gap-2 text-sm text-landing-accent transition-colors hover:text-landing-accent-light"
              >
                Полный документ (10 принципов)
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </ScrollSequence>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  КАК ЭТО РАБОТАЕТ
       * ══════════════════════════════════════ */}
      <section id="map" className="relative px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center font-heading text-3xl font-bold text-landing-text md:text-5xl">
            Карта памяти
          </h2>
          <p className="mb-12 text-center text-landing-muted">
            {burialsData.length} захоронений в {new Set(burialsData.map((b) => b.country)).size} странах — поиск по ФИО, фильтры по странам
          </p>
          <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <MemorialMap burials={burialsData as any} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  КОМАНДА
       * ══════════════════════════════════════ */}
      <section id="team" className="relative px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-landing-text md:text-5xl">
            Команда
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { name: "Мартышенко С.", role: "Автор идеи, арт-директор", desc: "Архитектор проекта с 2005 года" },
              { name: "Селиверстова", role: "Генеральный директор АНО", desc: "GR-стратегия, связи с министерствами" },
              { name: "Попельнюк К.", role: "Продюсер", desc: "Медиа-связи, Первый канал" },
              { name: "Попечительский совет", role: "Формируется", desc: "Историки, юристы, ветеранские организации" },
            ].map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-landing-accent/20"
              >
                <h3 className="text-lg font-semibold text-landing-text">{member.name}</h3>
                <p className="text-sm font-medium text-landing-accent">{member.role}</p>
                <p className="mt-2 text-sm text-landing-muted">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  ПАРТНЁРЫ
       * ══════════════════════════════════════ */}
      <section id="partner" className="relative px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-landing-text md:text-4xl">
            Партнёры и стейкхолдеры
          </h2>
          <p className="mb-12 text-landing-muted">
            Три уровня взаимодействия
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { level: "Партнёры", desc: "Соглашение подписано", orgs: "ОВА ВС РФ, ПФКИ" },
              { level: "В диалоге", desc: "Активные переговоры", orgs: "Росатом, ИРИ, Фонд Горчакова" },
              { level: "Приглашаем", desc: "Открыты к сотрудничеству", orgs: "Сбер, VK, Яндекс, музеи, школы" },
            ].map((tier) => (
              <div
                key={tier.level}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <h3 className="mb-1 text-lg font-semibold text-landing-accent">
                  {tier.level}
                </h3>
                <p className="mb-3 text-xs text-landing-muted">{tier.desc}</p>
                <p className="text-sm text-landing-text">{tier.orgs}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       *  CTA — Решение #1 (финальный призыв)
       * ══════════════════════════════════════ */}
      <CTASection
        heading="Присоединяйтесь"
        subheading="50+ семей уже нашли родственников через наши платформы за 21 год. Помогите найти ещё 10 000."
        buttonText="Поддержать проект"
        buttonHref="#support"
      />

      {/* SUPPORT */}
      <section id="support" className="relative border-t border-white/10 px-6 py-20 text-center lg:px-12">
        <div className="mx-auto max-w-md">
          <h3 className="mb-4 font-heading text-2xl font-bold text-landing-text">
            Поддержать проект
          </h3>
          <p className="mb-6 text-sm text-landing-muted">
            Донат, подписка 199 ₽/мес или корпоративное партнёрство
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="rounded-xl bg-landing-accent px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Поддержать (от 100 ₽)
            </a>
            <a
              href="#"
              className="rounded-xl border border-white/20 px-6 py-3 font-medium text-landing-text transition-colors hover:border-white/40"
            >
              Корпоративное партнёрство
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-heading text-lg font-bold text-landing-text">
            Герои <span className="text-landing-accent">не умирают</span>
          </p>
          <div className="flex gap-6 text-sm text-landing-muted">
            <a href="/landing/ethics" className="hover:text-landing-text">Этика</a>
            <a href="/landing/partner" className="hover:text-landing-text">Партнёрам</a>
            <a href="/landing/contact" className="hover:text-landing-text">Контакты</a>
            <a href="/landing/en" className="hover:text-landing-text">EN</a>
          </div>
          <p className="text-xs text-landing-muted/60">
            АНО «Герои не умирают» 2026
          </p>
        </div>
      </footer>
    </>
  );
}
