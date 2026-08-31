from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from os import environ
from typing import Any
from uuid import uuid4

import httpx

from bluba_api.store import SqlAlchemyStore


DEMO_TRANSCRIPTION = (
    "Anoche Mateo durmió cinco horas y media y se despertó dos veces. "
    "Hoy amaneció bastante irritable. Además, habrá un acto especial en el colegio con mucho ruido."
)

ALLOWED_CONTEXTS = {"HOME", "SCHOOL", "PROFESSIONAL"}
ENUM_FIELDS = {
    "sleep_quality": {"reparador", "interrumpido", "dificultad_conciliacion", "desconocido", None},
    "wake_state": {"tranquilo_alegre", "irritable_llorando", "cansado_sueno", "desconocido", None},
    "regulation_level": {"excelente", "estable_con_apoyo", "desregulacion_frecuente", "desconocido", None},
    "alert_level": {"bajo", "optimo", "alto", "desconocido", None},
}
BOOLEAN_FIELDS = {"routine_change", "exceptional_event"}
LIST_FIELDS = {"observed_behavior"}
ALLOWED_FIELDS = set(ENUM_FIELDS) | BOOLEAN_FIELDS | LIST_FIELDS | {"sleep_hours", "gastrointestinal_status"}


class CaptureUnavailableError(RuntimeError):
    pass


@dataclass(frozen=True)
class TranscriptionResult:
    text: str
    synthetic: bool


class TranscriptionService:
    """Small replaceable boundary for speech-to-text.

    Demo mode is deterministic. Provider mode calls the configured HTTP boundary and
    only uses the deterministic result after failure when fallback is explicitly enabled.
    """

    def __init__(
        self,
        mode: str | None = None,
        demo_fallback: bool | None = None,
        *,
        provider_url: str | None = None,
        provider_token: str | None = None,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.mode = (mode or environ.get("BLUBA_CAPTURE_MODE", "demo")).lower()
        self.demo_fallback = (
            demo_fallback
            if demo_fallback is not None
            else environ.get("BLUBA_CAPTURE_DEMO_FALLBACK", "false").lower() in {"1", "true", "yes", "on"}
        )
        self.provider_url = provider_url if provider_url is not None else environ.get("BLUBA_TRANSCRIPTION_URL")
        self.provider_token = (
            provider_token if provider_token is not None else environ.get("BLUBA_TRANSCRIPTION_TOKEN")
        )
        self.transport = transport

    async def transcribe(self, audio: bytes, mime_type: str | None = None) -> TranscriptionResult:
        if not audio:
            raise ValueError("audio must not be empty")
        if self.mode == "demo":
            return TranscriptionResult(DEMO_TRANSCRIPTION, synthetic=True)
        if self.mode == "provider":
            try:
                return TranscriptionResult(await self._transcribe_with_provider(audio, mime_type), synthetic=False)
            except Exception as exc:
                if self.demo_fallback:
                    return TranscriptionResult(DEMO_TRANSCRIPTION, synthetic=True)
                raise CaptureUnavailableError("transcription provider failed") from exc
        raise CaptureUnavailableError(f"unsupported capture mode: {self.mode}")

    async def _transcribe_with_provider(self, audio: bytes, mime_type: str | None) -> str:
        if not self.provider_url:
            raise CaptureUnavailableError("BLUBA_TRANSCRIPTION_URL is not configured")
        headers = {"Authorization": f"Bearer {self.provider_token}"} if self.provider_token else {}
        async with httpx.AsyncClient(transport=self.transport, timeout=30) as client:
            response = await client.post(
                self.provider_url,
                headers=headers,
                data={"mime_type": mime_type} if mime_type else None,
                files={"audio": ("observation.audio", audio, mime_type or "application/octet-stream")},
            )
            response.raise_for_status()
        try:
            payload = response.json()
        except ValueError:
            text = response.text
        else:
            text = payload.get("transcription") or payload.get("text") if isinstance(payload, dict) else None
        if not isinstance(text, str) or not 1 <= len(text.strip()) <= 4000:
            raise CaptureUnavailableError("transcription provider returned an invalid response")
        return text.strip()


class ObservationExtractionService:
    """Conservative deterministic extraction for the demo vocabulary."""

    async def extract(self, text: str) -> list[dict[str, Any]]:
        normalized = text.casefold()
        variables: list[dict[str, Any]] = []

        hours_match = re.search(r"(?:durmi[oó]|sueño).{0,35}?(\d+(?:[.,]\d+)?)\s*horas?", normalized)
        spanish_half = re.search(r"(?:durmi[oó]|sueño).{0,35}?cinco horas? y media", normalized)
        if hours_match or spanish_half:
            hours = 5.5 if spanish_half else float(hours_match.group(1).replace(",", "."))
            variables.append(_variable("sleep_hours", hours, hours_match.group(0) if hours_match else spanish_half.group(0), 0.98))

        if re.search(r"despert[oó].{0,20}(?:veces|noche)|sueño interrumpido|durmi[oó].{0,20}interrump", normalized):
            variables.append(_variable("sleep_quality", "interrumpido", "despertares durante la noche", 0.96))
        elif re.search(r"dificultad.{0,20}(?:dormir|conciliar)", normalized):
            variables.append(_variable("sleep_quality", "dificultad_conciliacion", "dificultad para conciliar", 0.94))

        if re.search(r"amaneci[oó].{0,25}irritable|despert[oó].{0,25}irritable|irritable", normalized):
            variables.append(_variable("wake_state", "irritable_llorando", "amaneció irritable", 0.94))
        elif re.search(r"amaneci[oó].{0,20}(?:cansad|con sueño)", normalized):
            variables.append(_variable("wake_state", "cansado_sueno", "amaneció cansado", 0.9))

        routine_evidence = re.search(r"acto especial|cambio (?:de|en la) rutina|actividad especial", normalized)
        if routine_evidence:
            variables.append(_variable("routine_change", True, routine_evidence.group(0), 0.91))

        observed: list[str] = []
        if re.search(r"mucho ruido|ruido (?:fuerte|intenso)|acto.{0,40}ruido", normalized):
            observed.append("ruido_intenso")
        if observed:
            variables.append(_variable("observed_behavior", observed, "exposición a ruido mencionada", 0.91))

        return variables


class ObservationDraftService:
    def __init__(self, store: SqlAlchemyStore, extractor: ObservationExtractionService | None = None) -> None:
        self.store = store
        self.extractor = extractor or ObservationExtractionService()

    async def create(
        self,
        *,
        child_id: str,
        context: str,
        input_type: str,
        text: str,
        synthetic: bool = False,
        idempotency_key: str | None = None,
        idempotency_fingerprint: str | None = None,
    ) -> dict[str, Any]:
        draft = {
            "draft_id": f"observation-draft-{uuid4()}",
            "child_id": child_id,
            "context": context,
            "input_type": input_type,
            "source_text": text if input_type == "TEXT" else None,
            "transcription": text if input_type == "AUDIO" else None,
            "proposed_variables": await self.extractor.extract(text),
            "status": "PENDING_CONFIRMATION",
            "expires_at": (datetime.now(UTC) + timedelta(hours=24)).isoformat(),
        }
        return self.store.add_observation_draft(
            draft,
            synthetic=synthetic,
            idempotency_key=idempotency_key,
            idempotency_fingerprint=idempotency_fingerprint,
        )


def validate_proposed_variables(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        raise ValueError("proposed_variables must be an array")
    seen: set[str] = set()
    validated = []
    for index, item in enumerate(value):
        if not isinstance(item, dict) or set(item) - {"field", "value", "evidence", "confidence"}:
            raise ValueError(f"invalid proposed variable at index {index}")
        if "field" not in item or "value" not in item:
            raise ValueError(f"field and value are required at index {index}")
        field = item["field"]
        if field not in ALLOWED_FIELDS or field in seen:
            raise ValueError(f"unsupported or duplicate field: {field}")
        _validate_feature_value(field, item["value"])
        evidence = item.get("evidence")
        if evidence is not None and not isinstance(evidence, str):
            raise ValueError(f"evidence for {field} must be a string or null")
        confidence = item.get("confidence")
        if confidence is not None and (
            isinstance(confidence, bool) or not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1
        ):
            raise ValueError(f"confidence for {field} must be between 0 and 1")
        seen.add(field)
        validated.append({key: item[key] for key in ("field", "value", "evidence", "confidence") if key in item})
    return validated


def _validate_feature_value(field: str, value: Any) -> None:
    if field in ENUM_FIELDS and value not in ENUM_FIELDS[field]:
        raise ValueError(f"invalid value for {field}")
    if field in BOOLEAN_FIELDS and value is not None and not isinstance(value, bool):
        raise ValueError(f"{field} must be boolean or null")
    if field == "sleep_hours" and value is not None:
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 24:
            raise ValueError("sleep_hours must be a number between 0 and 24 or null")
    if field == "gastrointestinal_status" and value is not None:
        if not isinstance(value, str) or not 1 <= len(value) <= 64:
            raise ValueError("gastrointestinal_status must be a non-empty string up to 64 characters or null")
    if field in LIST_FIELDS:
        if not isinstance(value, list) or len(value) > 20 or any(not isinstance(item, str) or not 1 <= len(item) <= 96 for item in value):
            raise ValueError(f"{field} must be an array of up to 20 non-empty strings")
        if len(set(value)) != len(value):
            raise ValueError(f"{field} must contain unique values")


def _variable(field: str, value: Any, evidence: str, confidence: float) -> dict[str, Any]:
    return {"field": field, "value": value, "evidence": evidence, "confidence": confidence}
