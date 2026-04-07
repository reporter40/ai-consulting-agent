"""PDF font registration for Cyrillic."""

from app.pdf_fonts import FONT_BOLD, FONT_NORMAL, _fonts_dir, ensure_pdf_cyrillic_fonts


def test_fonts_directory_exists() -> None:
    d = _fonts_dir()
    assert d.is_dir()


def test_noto_files_present_or_fallback() -> None:
    base = _fonts_dir()
    reg = base / "NotoSans-Regular.ttf"
    bold = base / "NotoSans-Bold.ttf"
    fn, fb = ensure_pdf_cyrillic_fonts()
    if reg.is_file() and bold.is_file():
        assert fn == FONT_NORMAL
        assert fb == FONT_BOLD
    else:
        assert fn == "Helvetica"
        assert fb == "Helvetica-Bold"


def test_second_call_returns_same_names() -> None:
    a = ensure_pdf_cyrillic_fonts()
    b = ensure_pdf_cyrillic_fonts()
    assert a == b
