import type { Metadata } from "next";
import { Suspense } from "react";
import "../globals.css";
import "@/styles/tokens.css";
import { YandexMetrika } from "@/components/ui/yandex-metrika";

export const metadata: Metadata = {
  title: "Герои не умирают — GIS + VR + ИИ + ДНК",
  description:
    "Третье поколение цифровой памяти о ВОВ. GIS-карта 12 000 захоронений в 48 странах, VR-туры, ИИ-аватары ветеранов, ДНК-идентификация.",
  openGraph: {
    title: "Герои не умирают. Теперь — буквально.",
    description:
      "Единственная в мире платформа, объединяющая GIS + VR + ИИ-аватары + ДНК-идентификацию для увековечения памяти.",
    locale: "ru_RU",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-landing-bg text-landing-text">
      <Suspense fallback={null}>
        <YandexMetrika />
      </Suspense>
      {children}
    </div>
  );
}
