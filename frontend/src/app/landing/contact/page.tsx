"use client";

import { ArrowLeft, Mail, Phone, MapPin, Send as SendIcon, MessageCircle, Calendar } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-landing-bg px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <a
          href="/landing"
          className="mb-8 inline-flex items-center gap-2 text-sm text-landing-muted transition-colors hover:text-landing-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад на главную
        </a>

        <h1 className="mb-4 font-heading text-4xl font-bold text-landing-text md:text-5xl">
          Контакты
        </h1>
        <p className="mb-12 text-landing-muted">
          Свяжитесь с нами любым удобным способом
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Контакты */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="mb-4 text-lg font-semibold text-landing-text">
                АНО «Герои не умирают»
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:info@heroesdonotdie.ru"
                  className="flex items-center gap-3 text-landing-muted transition-colors hover:text-landing-text"
                >
                  <Mail className="h-5 w-5 text-landing-accent" />
                  info@heroesdonotdie.ru
                </a>
                <a
                  href="tel:+7XXXXXXXXXX"
                  className="flex items-center gap-3 text-landing-muted transition-colors hover:text-landing-text"
                >
                  <Phone className="h-5 w-5 text-landing-accent" />
                  +7 (XXX) XXX-XX-XX
                </a>
                <div className="flex items-center gap-3 text-landing-muted">
                  <MapPin className="h-5 w-5 text-landing-accent" />
                  Москва, Россия
                </div>
              </div>
            </div>

            {/* Быстрые ссылки */}
            <div className="space-y-3">
              <a
                href="https://t.me/heroesdonotdie"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-landing-text transition-colors hover:border-landing-accent/30"
              >
                <MessageCircle className="h-5 w-5 text-landing-accent" />
                Telegram-канал
              </a>
              <a
                href="#"
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-landing-text transition-colors hover:border-landing-accent/30"
              >
                <Calendar className="h-5 w-5 text-landing-accent" />
                Назначить встречу (Calendly)
              </a>
            </div>
          </div>

          {/* Форма */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          >
            <h3 className="mb-2 text-lg font-semibold text-landing-text">
              Написать нам
            </h3>
            <input
              required
              type="text"
              placeholder="Ваше имя"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none"
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none"
            />
            <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-landing-text focus:border-landing-accent focus:outline-none">
              <option value="">Тема обращения</option>
              <option value="partnership">Партнёрство</option>
              <option value="media">Запрос от СМИ</option>
              <option value="volunteer">Волонтёрство</option>
              <option value="veteran">Информация о ветеране</option>
              <option value="other">Другое</option>
            </select>
            <textarea
              rows={4}
              placeholder="Сообщение..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-landing-text placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-landing-accent py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              <SendIcon className="h-4 w-4" />
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
