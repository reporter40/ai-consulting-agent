"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Eye, X, Search } from "lucide-react";

interface Veteran {
  fio: string;
  rank: string;
  birth: number;
  death: number;
}

interface Burial {
  id: string;
  name: string;
  country: string;
  city: string;
  coordinates: [number, number];
  buried_count: number;
  identified_count: number;
  veterans: Veteran[];
  vr_tour_available: boolean;
}

interface MemorialMapProps {
  burials: Burial[];
  className?: string;
}

/**
 * Интерактивная GIS-карта захоронений на Leaflet.
 * Динамический импорт — Leaflet не поддерживает SSR.
 */
export function MemorialMap({ burials, className = "" }: MemorialMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [selected, setSelected] = useState<Burial | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState<string>("all");

  const countries = Array.from(new Set(burials.map((b) => b.country))).sort();

  const filteredBurials = burials.filter((b) => {
    const matchCountry = filterCountry === "all" || b.country === filterCountry;
    const matchSearch =
      !searchQuery ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.veterans.some((v) =>
        v.fio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchCountry && matchSearch;
  });

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;

      // Загружаем CSS Leaflet через link в head
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [50, 30],
        zoom: 3,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Тёмная тайловая карта
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Кастомная иконка маркера
      const markerIcon = L.divIcon({
        className: "memorial-marker",
        html: `<div style="
          width: 24px; height: 24px;
          background: #8b2020;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(139, 32, 32, 0.4);
          cursor: pointer;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const vrIcon = L.divIcon({
        className: "memorial-marker-vr",
        html: `<div style="
          width: 28px; height: 28px;
          background: #8b2020;
          border: 2px solid #c4a35a;
          border-radius: 50%;
          box-shadow: 0 0 16px rgba(196, 163, 90, 0.3);
          cursor: pointer;
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      burials.forEach((burial) => {
        const icon = burial.vr_tour_available ? vrIcon : markerIcon;
        const marker = L.marker(burial.coordinates, { icon }).addTo(map);

        marker.bindTooltip(
          `<strong>${burial.name}</strong><br/>${burial.city}, ${burial.country}`,
          { direction: "top", offset: [0, -14] }
        );

        marker.on("click", () => {
          setSelected(burial);
        });
      });

      leafletMap.current = map;
    }

    init();

    return () => {
      cancelled = true;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [burials]);

  // Центрировать карту при фильтрации
  useEffect(() => {
    if (!leafletMap.current || filteredBurials.length === 0) return;

    import("leaflet").then((L) => {
      if (!leafletMap.current) return;
      const bounds = L.default.latLngBounds(filteredBurials.map((b) => b.coordinates));
      leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    });
  }, [filterCountry, filteredBurials]);

  return (
    <div className={`relative ${className}`}>
      {/* Фильтры */}
      <div className="absolute left-4 top-4 z-[1000] flex flex-col gap-2 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" />
          <input
            type="text"
            placeholder="Поиск по ФИО или городу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-white/10 bg-landing-bg/90 py-2 pl-9 pr-4 text-sm text-landing-text placeholder:text-landing-muted/50 backdrop-blur-xl focus:border-landing-accent focus:outline-none"
          />
        </div>
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="rounded-lg border border-white/10 bg-landing-bg/90 px-3 py-2 text-sm text-landing-text backdrop-blur-xl focus:border-landing-accent focus:outline-none"
        >
          <option value="all">Все страны ({burials.length})</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c} ({burials.filter((b) => b.country === c).length})
            </option>
          ))}
        </select>
      </div>

      {/* Легенда */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-4 rounded-lg border border-white/10 bg-landing-bg/90 px-4 py-2 text-xs text-landing-muted backdrop-blur-xl">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-landing-accent" />
          Захоронение
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-landing-gold bg-landing-accent" />
          VR-тур доступен
        </span>
      </div>

      {/* Карта */}
      <div ref={mapRef} className="h-full w-full rounded-2xl" />

      {/* Sidebar — карточка захоронения */}
      {selected && (
        <div className="absolute right-0 top-0 z-[1000] h-full w-full max-w-sm overflow-y-auto border-l border-white/10 bg-landing-bg/95 p-6 backdrop-blur-xl sm:rounded-r-2xl">
          <button
            onClick={() => setSelected(null)}
            className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-landing-muted hover:text-landing-text"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="mb-1 font-heading text-xl font-bold text-landing-text">
            {selected.name}
          </h3>
          <p className="mb-4 flex items-center gap-1 text-sm text-landing-muted">
            <MapPin className="h-3.5 w-3.5" />
            {selected.city}, {selected.country}
          </p>

          {selected.buried_count > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-2xl font-bold text-landing-text">
                  {selected.buried_count.toLocaleString("ru-RU")}
                </p>
                <p className="text-xs text-landing-muted">Захоронено</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-2xl font-bold text-landing-accent">
                  {selected.identified_count.toLocaleString("ru-RU")}
                </p>
                <p className="text-xs text-landing-muted">Опознано</p>
              </div>
            </div>
          )}

          {selected.vr_tour_available && (
            <button className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-landing-gold/30 bg-landing-gold/10 py-3 text-sm font-medium text-landing-gold transition-colors hover:bg-landing-gold/20">
              <Eye className="h-4 w-4" />
              Открыть VR-тур
            </button>
          )}

          {selected.veterans.length > 0 && (
            <>
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-landing-muted">
                Ветераны ({selected.veterans.length})
              </h4>
              <div className="space-y-2">
                {selected.veterans.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
                  >
                    <p className="font-medium text-landing-text">{v.fio}</p>
                    <p className="text-xs text-landing-muted">
                      {v.rank} | {v.birth}–{v.death}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <button className="mt-6 w-full rounded-xl bg-landing-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
            Это мой родственник — связаться
          </button>
        </div>
      )}
    </div>
  );
}
