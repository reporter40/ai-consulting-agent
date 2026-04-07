"""file_text_extract helpers."""

import io

import pytest

from app.services.file_text_extract import extract_text_from_bytes


def test_docx_paragraphs() -> None:
    docx = pytest.importorskip("docx")

    buf = io.BytesIO()
    d = docx.Document()
    d.add_paragraph("Полевое наблюдение A")
    d.save(buf)
    data = buf.getvalue()
    out = extract_text_from_bytes("report.docx", data)
    assert "Полевое наблюдение A" in out
