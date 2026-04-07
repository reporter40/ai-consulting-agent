"""Diagnostic request schema and anonymization helpers."""

import pytest
from pydantic import ValidationError

from app.schemas.diagnostic import DiagnosticStreamRequest
from app.services.diagnostic_service import _anonymize, merge_message_and_field_materials


def test_effective_temperature_defaults() -> None:
    assert (
        DiagnosticStreamRequest(message="hi", mode="analytic").effective_temperature()
        == 0.3
    )
    assert (
        DiagnosticStreamRequest(
            message="hi", mode="questionnaire"
        ).effective_temperature()
        == 0.7
    )


def test_effective_temperature_override() -> None:
    assert (
        DiagnosticStreamRequest(
            message="hi", mode="analytic", temperature=0.9
        ).effective_temperature()
        == 0.9
    )


def test_anonymize_email() -> None:
    assert "[email]" in _anonymize("Напишите на test@example.com")


def test_anonymize_phone_ru() -> None:
    assert "[phone]" in _anonymize("Звоните +7 916 123-45-67")


def test_merge_field_materials() -> None:
    m = merge_message_and_field_materials(
        "Вопрос консультанта",
        [("notes.txt", "Наблюдение 1")],
    )
    assert "Вопрос консультанта" in m
    assert "notes.txt" in m
    assert "Наблюдение 1" in m


def test_attachments_only_ok() -> None:
    req = DiagnosticStreamRequest(
        message="",
        attachments=[{"filename": "a.txt", "text": "полевые данные"}],
    )
    assert req.message == ""
    assert len(req.attachments) == 1


def test_empty_message_and_no_attachments_rejected() -> None:
    with pytest.raises(ValidationError):
        DiagnosticStreamRequest(message="   ", attachments=[])
