"use client";

import { useState } from "react";
import { ArrowLeft, Send, Building2, User, Mail, Phone, MessageSquare } from "lucide-react";

const CATEGORIES = [
  "Государственная организация",
  "Фонд / Грантодатель",
  "Корпоративный партнёр (CSR)",
  "Музей / Образование",
  "Медиа / СМИ",
  "Ветеранская организация",
  "Конфессиональная организация",
  "IT / Технологии",
  "Другое",
] as const;

const INTERESTS = [
  "Финансирование / Гранты",
  "Технологическое партнёрство",
  "Совместные мероприятия",
  "Контент / Медиа",
  "Интеграция данных",
  "Образовательные программы",
  "Попечительский совет",
  "Другое",
] as const;

export default function PartnerPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-landing-bg px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-landing-accent/20">
            <Send className="h-8 w-8 text-landing-accent" />
          </div>
          <h2 className="mb-4 font-heading text-3xl font-bold text-landing-text">
            Заявка отправлена
          </h2>
          <p className="mb-8 text-landing-muted">
            Мы свяжемся с вами в течение 3 рабочих дней.
          </p>
          <a
            href="/landing"
            className="inline-flex items-center gap-2 text-sm text-landing-accent hover:text-landing-accent-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться на главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-landing-bg px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <a
          href="/landing"
          className="mb-8 inline-flex items-center gap-2 text-sm text-landing-muted transition-colors hover:text-landing-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад на главную
        </a>

        <h1 className="mb-4 font-heading text-4xl font-bold text-landing-text md:text-5xl">
          Стать партнёром
        </h1>
        <p className="mb-10 text-landing-muted">
          Заполните форму — мы подготовим индивидуальное предложение
          о сотрудничестве под вашу организацию.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-6"
        >
          {/* Организация */}
          <div>
            <label className="mb-2 block text-sm font-medium text-landing-text">
              Организация *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" />
              <input
                required
                type="text"
                placeholder="Название организации"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none focus:ring-1 focus:ring-landing-accent"
              />
            </div>
          </div>

          {/* Категория */}
          <div>
            <label className="mb-2 block text-sm font-medium text-landing-text">
              Категория *
            </label>
            <select
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-landing-text focus:border-landing-accent focus:outline-none focus:ring-1 focus:ring-landing-accent"
            >
              <option value="">Выберите категорию</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Контактное лицо */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-landing-text">
                Контактное лицо *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" />
                <input
                  required
                  type="text"
                  placeholder="ФИО"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-landing-text">
                Должность
              </label>
              <input
                type="text"
                placeholder="Должность"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Email + Телефон */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-landing-text">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" />
                <input
                  required
                  type="email"
                  placeholder="email@org.ru"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-landing-text">
                Телефон
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" />
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Интерес */}
          <div>
            <label className="mb-2 block text-sm font-medium text-landing-text">
              Направление сотрудничества *
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {INTERESTS.map((interest) => (
                <label
                  key={interest}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-landing-text transition-colors hover:border-landing-accent/30"
                >
                  <input
                    type="checkbox"
                    value={interest}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-landing-accent"
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          {/* Сообщение */}
          <div>
            <label className="mb-2 block text-sm font-medium text-landing-text">
              Сообщение
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-landing-muted" />
              <textarea
                rows={4}
                placeholder="Расскажите о вашем интересе к проекту..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-landing-accent py-4 text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" />
            Отправить заявку
          </button>

          <p className="text-center text-xs text-landing-muted/60">
            Или напишите напрямую: <a href="mailto:info@heroesdonotdie.ru" className="text-landing-accent">info@heroesdonotdie.ru</a>
          </p>
        </form>
      </div>
    </div>
  );
}
