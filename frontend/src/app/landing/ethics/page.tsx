"use client";

import { ArrowLeft } from "lucide-react";

const PRINCIPLES = [
  {
    title: "Согласие потомков",
    text: "Ни один ИИ-аватар не создаётся без письменного согласия минимум одного прямого потомка ветерана (или, при их отсутствии, организации-правопреемника). Шаблон согласия публичен.",
  },
  {
    title: "Историческая достоверность",
    text: "ИИ-аватар воспроизводит только документированные факты биографии. Запрещено вкладывать в уста ветерана политические высказывания, не подтверждённые архивами.",
  },
  {
    title: "Право на удаление",
    text: "Любой потомок в любой момент может потребовать удаления аватара, голоса, ДНК-профиля. Срок исполнения — 14 дней. Без объяснения причин.",
  },
  {
    title: "Запрет коммерческой эксплуатации",
    text: "Образы и голоса ветеранов не используются в рекламе сторонних товаров и услуг ни при каких условиях.",
  },
  {
    title: "Защита ДНК-данных",
    text: "Платформа не хранит первичные геномные данные. Интеграция — только с государственным оператором согласно ФЗ от 08.03.2026. Передача третьим лицам исключена.",
  },
  {
    title: "Этический совет",
    text: "Ключевые решения проходят через Этический совет из 5 человек: историк, юрист по 152-ФЗ, представитель ветеранской организации, представитель РПЦ, IT-этик.",
  },
  {
    title: "Прозрачность ИИ",
    text: "Каждый ИИ-аватар маркируется как «реконструкция на основе ИИ». Никакой иллюзии живого общения с реальным человеком.",
  },
  {
    title: "Запрет на «оживление» вне контекста памяти",
    text: "Платформа не создаёт развлекательный контент с участием ветеранов. Только мемориальные и образовательные сценарии.",
  },
  {
    title: "Право на забвение неопознанных",
    text: "Если в процессе ДНК-идентификации обнаруживаются данные, которые могут травмировать живых родственников, решение о раскрытии принимает семья, а не платформа.",
  },
  {
    title: "Ежегодный публичный отчёт",
    text: "Раз в год — публикация: количество созданных аватаров, удалённых по запросу, рассмотренных Этическим советом случаев.",
  },
];

export default function EthicsPage() {
  return (
    <div className="min-h-screen bg-landing-bg px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <a
          href="/landing"
          className="mb-8 inline-flex items-center gap-2 text-sm text-landing-muted transition-colors hover:text-landing-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад на главную
        </a>

        <h1 className="mb-6 font-heading text-4xl font-bold text-landing-text md:text-5xl">
          Этические принципы платформы
        </h1>

        <div className="mb-12 rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-landing-muted">
            Технологии ИИ, VR и геномной идентификации создают беспрецедентные
            возможности увековечения памяти, но и беспрецедентные риски: искажение
            образа, нарушение воли потомков, утечка чувствительных данных. Платформа
            принимает на себя следующие обязательства, имеющие приоритет над любыми
            коммерческими и операционными целями.
          </p>
        </div>

        <div className="space-y-6">
          {PRINCIPLES.map((p, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-landing-accent/20"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-accent/20 text-sm font-bold text-landing-accent">
                {i + 1}
              </span>
              <div>
                <h3 className="mb-1 font-semibold text-landing-text">{p.title}</h3>
                <p className="text-sm leading-relaxed text-landing-muted">{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-landing-accent/20 bg-landing-accent/5 p-6 text-center">
          <p className="italic text-landing-muted">
            Документ утверждён [дата]. Изменения вносятся только по решению
            Попечительского и Этического советов.
          </p>
        </div>
      </div>
    </div>
  );
}
