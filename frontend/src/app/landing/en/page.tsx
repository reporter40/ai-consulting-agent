"use client";

import dynamic from "next/dynamic";
import {
  MapPin, Eye, Bot, Dna,
  Search, Handshake, Heart,
  ArrowRight,
} from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";
import { CTASection } from "@/components/ui/cta-section";
import burialsData from "@/data/burials-mock.json";

const MemorialMap = dynamic(
  () => import("@/components/3d/MemorialMap").then((m) => m.MemorialMap),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-landing-muted">Loading map...</div> }
);

const TECH_LEVELS = [
  {
    icon: MapPin,
    title: "GIS Memorial Map",
    description: "12,000 burial sites across 48 countries. Interactive map with name search, country and year filters.",
  },
  {
    icon: Eye,
    title: "VR Tours",
    description: "Virtual visits to memorials. Matterport scans of real burial sites. Accessible from any browser.",
  },
  {
    icon: Bot,
    title: "AI Veteran Avatars",
    description: "Image reconstruction from archival data. Only documented biographical facts. Labeled as 'AI reconstruction'.",
  },
  {
    icon: Dna,
    title: "DNA Identification",
    description: "Integration with state-certified operator. Platform does not store primary genomic data. Full legal compliance.",
  },
] as const;

const NAV_LINKS = [
  { label: "Technology", href: "#tech" },
  { label: "Map", href: "#map" },
  { label: "Ethics", href: "#ethics" },
] as const;

export default function LandingEN() {
  return (
    <div className="min-h-screen bg-landing-bg text-landing-text">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12">
        <a href="/landing/en" className="font-heading text-2xl font-bold tracking-tight">
          Heroes<span className="text-landing-accent"> Don&apos;t Die</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-landing-muted hover:text-landing-text">
              {link.label}
            </a>
          ))}
          <a href="/landing" className="text-sm text-landing-muted hover:text-landing-text">RU</a>
          <a href="#search" className="rounded-full bg-landing-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90">
            Find a Veteran
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 font-heading text-5xl font-bold leading-tight md:text-7xl lg:text-8xl">
            Heroes Don&apos;t Die.
            <br />
            <span className="text-landing-accent">Now — Literally.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-landing-muted md:text-xl">
            Third-generation digital memorial infrastructure for WWII.
            GIS map of 12,000 burial sites in 48 countries + VR tours +
            AI veteran avatars + DNA identification. The only platform
            in the world combining all four technologies.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#search" className="inline-flex items-center gap-2 rounded-full bg-landing-accent px-8 py-3 font-medium text-white hover:opacity-90">
              <Search className="h-4 w-4" />
              Find a Veteran
            </a>
            <a href="/landing/partner" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3 font-medium hover:border-white/40">
              <Handshake className="h-4 w-4" />
              Become a Partner
            </a>
            <a href="#support" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3 font-medium hover:border-landing-accent/40">
              <Heart className="h-4 w-4" />
              Support the Project
            </a>
          </div>
        </div>
      </section>

      {/* Killer fact */}
      <section className="border-y border-white/10 bg-landing-accent/5 px-6 py-16 text-center">
        <p className="mx-auto max-w-3xl text-xl font-medium italic md:text-2xl">
          Every year, 10,000–16,000 unidentified remains of Soviet soldiers are found.
          <br />
          Only <span className="text-landing-accent">7%</span> are identified.
          <br />
          We will change that to <span className="text-landing-accent font-bold">70%</span>.
        </p>
      </section>

      {/* Legacy strip */}
      <section className="px-6 py-20 lg:px-12">
        <p className="mb-12 text-center text-sm uppercase tracking-widest text-landing-muted">
          One team. 21 years. 50+ families reunited with relatives after 60 years.
        </p>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {[
            { year: "2005", project: '"Pobiediteli" (Winners)', stat: "1M veterans" },
            { year: "2007", project: "OBD Memorial", stat: "13M documents" },
            { year: "2026", project: "Heroes Don\u2019t Die", stat: "GIS + VR + AI + DNA" },
          ].map((item) => (
            <div key={item.year} className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center hover:border-landing-accent/30">
              <span className="mb-2 block font-heading text-5xl font-bold text-landing-accent/30">{item.year}</span>
              <h3 className="mb-1 text-lg font-semibold">{item.project}</h3>
              <p className="text-sm text-landing-muted">{item.stat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section id="tech" className="px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center font-heading text-3xl font-bold md:text-5xl">
            The Only Combination in the World
          </h2>
          <p className="mb-16 text-center text-landing-muted">
            Four technologies united in one ecosystem — no one else has this
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {TECH_LEVELS.map((tech, i) => (
              <FeatureCard key={tech.title} icon={tech.icon} title={tech.title} description={tech.description} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Search */}
      <section id="search" className="px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold md:text-5xl">Find a Veteran</h2>
          <p className="mb-8 text-landing-muted">Enter a name — we&apos;ll search across 12,000 burial sites in 48 countries</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Last Name, First Name"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 placeholder:text-landing-muted/50 focus:border-landing-accent focus:outline-none focus:ring-1 focus:ring-landing-accent"
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-landing-accent px-8 py-4 font-medium text-white hover:opacity-90">
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
          <p className="mt-4 text-xs text-landing-muted/60">Demo version. Full search available after MVP launch.</p>
        </div>
      </section>

      {/* Map */}
      <section id="map" className="px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center font-heading text-3xl font-bold md:text-5xl">Memorial Map</h2>
          <p className="mb-12 text-center text-landing-muted">
            {burialsData.length} burial sites across {new Set(burialsData.map((b) => b.country)).size} countries
          </p>
          <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <MemorialMap burials={burialsData as any} />
          </div>
        </div>
      </section>

      {/* Ethics */}
      <section id="ethics" className="px-6 py-32 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold md:text-5xl">Ethical Principles</h2>
          <p className="mb-8 text-landing-muted">
            AI avatars of the deceased and DNA data — a zone of maximum responsibility.
            Our commitments take priority over commercial objectives.
          </p>
          <div className="grid gap-4 text-left sm:grid-cols-2">
            {[
              "Descendant consent for every AI avatar",
              "Historical accuracy — archival facts only",
              "Right to delete an avatar at any time",
              "No commercial exploitation of veterans' images",
              "DNA data protection — state operator only",
              "Independent Ethics Board of 5 experts",
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-landing-accent/20 text-xs font-bold text-landing-accent">
                  {i + 1}
                </span>
                <p className="text-sm">{p}</p>
              </div>
            ))}
          </div>
          <a href="/landing/ethics" className="mt-8 inline-flex items-center gap-2 text-sm text-landing-accent hover:text-landing-accent-light">
            Full document (10 principles) <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        heading="Join Us"
        subheading="50+ families have already found relatives through our platforms over 21 years. Help us find 10,000 more."
        buttonText="Support the Project"
        buttonHref="#support"
      />

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-heading text-lg font-bold">
            Heroes <span className="text-landing-accent">Don&apos;t Die</span>
          </p>
          <div className="flex gap-6 text-sm text-landing-muted">
            <a href="/landing/ethics" className="hover:text-landing-text">Ethics</a>
            <a href="/landing/partner" className="hover:text-landing-text">Partnership</a>
            <a href="/landing/contact" className="hover:text-landing-text">Contact</a>
            <a href="/landing" className="hover:text-landing-text">RU</a>
          </div>
          <p className="text-xs text-landing-muted/60">ANO &ldquo;Heroes Don&apos;t Die&rdquo; 2026</p>
        </div>
      </footer>
    </div>
  );
}
