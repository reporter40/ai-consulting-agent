"""Register TrueType fonts for PDF (Cyrillic / Unicode)."""

from __future__ import annotations

import logging
from pathlib import Path

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

logger = logging.getLogger(__name__)

# Names used in ParagraphStyle / TableStyle
FONT_NORMAL = "NotoSans"
FONT_BOLD = "NotoSans-Bold"

_registered = False


def _fonts_dir() -> Path:
    # app/pdf_fonts.py -> app/ -> backend/
    return Path(__file__).resolve().parent.parent / "fonts"


def ensure_pdf_cyrillic_fonts() -> tuple[str, str]:
    """
    Register Noto Sans from backend/fonts/ if present.
    Returns (normal_font_name, bold_font_name) for ReportLab.
    """
    global _registered
    if _registered:
        return FONT_NORMAL, FONT_BOLD

    base = _fonts_dir()
    reg = base / "NotoSans-Regular.ttf"
    bold = base / "NotoSans-Bold.ttf"

    if not reg.is_file() or not bold.is_file():
        logger.warning(
            "PDF fonts missing under %s — Cyrillic may render incorrectly. "
            "Add NotoSans-Regular.ttf and NotoSans-Bold.ttf (see fonts/README.md).",
            base,
        )
        return "Helvetica", "Helvetica-Bold"

    pdfmetrics.registerFont(TTFont(FONT_NORMAL, str(reg)))
    pdfmetrics.registerFont(TTFont(FONT_BOLD, str(bold)))
    pdfmetrics.registerFontFamily(
        FONT_NORMAL,
        normal=FONT_NORMAL,
        bold=FONT_BOLD,
        italic=FONT_NORMAL,
        boldItalic=FONT_BOLD,
    )
    _registered = True
    return FONT_NORMAL, FONT_BOLD
