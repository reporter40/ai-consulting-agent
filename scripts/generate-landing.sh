#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PIPELINE_DIR="$PROJECT_ROOT/.pipeline"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "╔══════════════════════════════════════════╗"
echo "║  3D Landing Page Generation Pipeline     ║"
echo "╚══════════════════════════════════════════╝"

# ── Этап 1: Проверка структуры проекта ──
echo ""
echo "=== Этап 1: Проверка структуры проекта ==="

REQUIRED_DIRS=(
  "$PIPELINE_DIR"
  "$FRONTEND_DIR/public/frames/hero"
  "$FRONTEND_DIR/src/components/3d"
  "$FRONTEND_DIR/src/components/ui"
  "$FRONTEND_DIR/src/styles"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "  [CREATE] $dir"
    mkdir -p "$dir"
  else
    echo "  [OK]     $dir"
  fi
done

# ── Этап 2: Валидация данных (если есть) ──
echo ""
echo "=== Этап 2: Валидация данных ==="

FIRECRAWL_DATA="$PIPELINE_DIR/01-firecrawl-raw.json"
if [ -f "$FIRECRAWL_DATA" ]; then
  echo "  Найден firecrawl дамп, валидируем..."
  node "$PROJECT_ROOT/scripts/validate-firecrawl.js" "$FIRECRAWL_DATA"
else
  echo "  [SKIP] Нет firecrawl данных ($FIRECRAWL_DATA)"
  echo "  Генерируем placeholder..."
  cat > "$FIRECRAWL_DATA" <<'PLACEHOLDER'
{
  "branding": {
    "colors": ["#0a0a0a", "#ffffff", "#6366f1", "#22d3ee"],
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Inter",
      "scale": 1.25
    }
  },
  "rawHtml": "<div class='hero'><h1>3D Interactive Landing</h1><p>Scroll-driven animations with GSAP and frame sequences. Built for high-performance immersive web experiences.</p></div><section class='features'><div class='feature'><h3>Scroll Animations</h3><p>Frame-by-frame sequences triggered by scroll position.</p></div><div class='feature'><h3>GSAP Integration</h3><p>Professional-grade animation timeline with ScrollTrigger.</p></div><div class='feature'><h3>Performance</h3><p>Optimized frame loading with canvas rendering.</p></div></section>",
  "meta": {
    "title": "3D Landing Page",
    "description": "Immersive scroll-driven 3D experience",
    "extractedAt": "2026-04-09T00:00:00Z"
  }
}
PLACEHOLDER
  echo "  [OK] Placeholder создан: $FIRECRAWL_DATA"
fi

# ── Этап 3: Подготовка видео-фреймов ──
echo ""
echo "=== Этап 3: Подготовка видео-ассетов ==="

FRAMES_DIR="$FRONTEND_DIR/public/frames/hero"
FRAME_COUNT=$(find "$FRAMES_DIR" -name "*.webp" -o -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l | tr -d ' ')

if [ "$FRAME_COUNT" -gt 0 ]; then
  echo "  [OK] Найдено $FRAME_COUNT фреймов в $FRAMES_DIR"
else
  echo "  [SKIP] Фреймы не найдены"
  echo "  Генерируем placeholder-фреймы (SVG)..."
  for i in $(seq -w 0 29); do
    HUE=$(( (10#$i * 12) % 360 ))
    cat > "$FRAMES_DIR/frame_${i}.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="hsl(${HUE}, 60%, 8%)"/>
  <circle cx="960" cy="540" r="$(( 100 + 10#$i * 8 ))" fill="none" stroke="hsl(${HUE}, 80%, 50%)" stroke-width="2" opacity="0.6"/>
  <circle cx="960" cy="540" r="$(( 200 + 10#$i * 6 ))" fill="none" stroke="hsl(${HUE}, 70%, 40%)" stroke-width="1" opacity="0.3"/>
  <text x="960" y="550" text-anchor="middle" fill="white" font-family="monospace" font-size="24" opacity="0.4">FRAME ${i}</text>
</svg>
SVG
  done
  echo "  [OK] Создано 30 placeholder-фреймов"
fi

# ── Этап 4: Проверка зависимостей фронтенда ──
echo ""
echo "=== Этап 4: Проверка зависимостей ==="

cd "$FRONTEND_DIR"
MISSING_DEPS=()

for dep in "gsap" "@gsap/react" "lucide-react"; do
  if ! node -e "require.resolve('$dep')" 2>/dev/null; then
    MISSING_DEPS+=("$dep")
  fi
done

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  echo "  [WARN] Отсутствуют: ${MISSING_DEPS[*]}"
  echo "  Установите: npm install ${MISSING_DEPS[*]}"
else
  echo "  [OK] Все зависимости установлены"
fi

# ── Этап 5: Проверка компонентов ──
echo ""
echo "=== Этап 5: Проверка компонентов ==="

COMPONENTS=(
  "src/components/3d/HeroCanvas.tsx"
  "src/components/3d/ScrollSequence.tsx"
  "src/components/3d/ParallaxLayer.tsx"
  "src/components/ui/landing-nav.tsx"
  "src/components/ui/feature-card.tsx"
  "src/components/ui/cta-section.tsx"
  "src/styles/tokens.css"
  "src/app/landing/page.tsx"
  "src/app/landing/layout.tsx"
)

ALL_OK=true
for comp in "${COMPONENTS[@]}"; do
  if [ -f "$FRONTEND_DIR/$comp" ]; then
    echo "  [OK]     $comp"
  else
    echo "  [MISS]   $comp"
    ALL_OK=false
  fi
done

# ── Итог ──
echo ""
echo "══════════════════════════════════════════"
if [ "$ALL_OK" = true ]; then
  echo "✓ Pipeline завершён. Все компоненты на месте."
  echo "  Запуск: cd frontend && npm run dev"
  echo "  Открыть: http://localhost:3000/landing"
else
  echo "⚠ Pipeline завершён с предупреждениями."
  echo "  Некоторые компоненты отсутствуют — запустите Claude Code для генерации."
fi
echo "══════════════════════════════════════════"
