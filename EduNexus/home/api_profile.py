"""Profile + Hugging Face token endpoints.

GET  /api/auth/profile/                -> returns sanitized settings
PUT  /api/auth/profile/                -> updates hf_token / default model
POST /api/auth/profile/download-model/ -> downloads a model from HF Hub using
                                          the stored token, returns status
"""
from __future__ import annotations

from typing import Any

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from home.models import UserSettings


def _resolve_uid(request) -> str:
    """Resolve the calling user's UID.

    Prefers the verified Firebase token's `uid` claim (set by
    FirebaseTokenAuthentication). Falls back to an X-User-Uid header for
    local dev without Firebase Admin, then to a "default" singleton row.
    """
    user = getattr(request, "user", None)
    user_uid = getattr(user, "uid", None) if user is not None else None
    if user_uid:
        return str(user_uid)
    header_uid = request.headers.get("X-User-Uid")
    if header_uid:
        return header_uid
    body_uid = (request.data or {}).get("uid") if hasattr(request, "data") else None
    return body_uid or "default"


def _serialize(settings: UserSettings) -> dict[str, Any]:
    return {
        "uid": settings.uid,
        "hf_token_set": settings.has_token(),
        "hf_token_preview": _preview(settings.get_hf_token()) if settings.has_token() else "",
        "default_embedding_model": settings.default_embedding_model,
        "last_download_status": settings.last_download_status,
        "last_download_message": settings.last_download_message,
        "last_download_at": settings.last_download_at.isoformat() if settings.last_download_at else None,
        "updated_at": settings.updated_at.isoformat() if settings.updated_at else None,
    }


def _preview(token: str) -> str:
    if len(token) <= 8:
        return "•" * len(token)
    return f"{token[:4]}…{token[-4:]}"


class ProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        uid = _resolve_uid(request)
        settings, _ = UserSettings.objects.get_or_create(uid=uid)
        return Response(_serialize(settings))

    def put(self, request):
        uid = _resolve_uid(request)
        settings, _ = UserSettings.objects.get_or_create(uid=uid)

        hf_token = request.data.get("hf_token")
        if hf_token is not None:
            stripped = hf_token.strip()
            if stripped == "":
                settings.set_hf_token("")
            else:
                if not (stripped.startswith("hf_") and len(stripped) >= 20):
                    return Response(
                        {"detail": "HF tokens start with 'hf_' and are at least 20 chars."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                settings.set_hf_token(stripped)

        model = request.data.get("default_embedding_model")
        if model:
            settings.default_embedding_model = model.strip()[:255]

        settings.save()
        return Response(_serialize(settings))


class DownloadModelView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = _resolve_uid(request)
        settings, _ = UserSettings.objects.get_or_create(uid=uid)

        token = settings.get_hf_token()
        if not token:
            return Response(
                {"detail": "No Hugging Face token saved. Add one on the Profile page first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        model_id = (
            request.data.get("model_id")
            or settings.default_embedding_model
            or "sentence-transformers/all-MiniLM-L6-v2"
        )

        try:
            from huggingface_hub import snapshot_download
        except ImportError:
            return Response(
                {
                    "detail": (
                        "huggingface_hub is not installed. Run "
                        "`pip install huggingface_hub sentence-transformers` and retry."
                    )
                },
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        try:
            local_path = snapshot_download(
                repo_id=model_id,
                token=token,
                allow_patterns=[
                    "config.json",
                    "tokenizer*",
                    "vocab*",
                    "sentencepiece*",
                    "*.txt",
                    "model.safetensors",
                    "pytorch_model.bin",
                    "*.onnx",
                    "1_Pooling/*",
                    "modules.json",
                    "sentence_bert_config.json",
                ],
            )
        except Exception as exc:
            settings.last_download_status = "failed"
            settings.last_download_message = f"{type(exc).__name__}: {exc}"[:1024]
            settings.last_download_at = timezone.now()
            settings.save()
            return Response(
                {
                    "ok": False,
                    "model_id": model_id,
                    "error": settings.last_download_message,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        settings.last_download_status = "ok"
        settings.last_download_message = f"Downloaded to {local_path}"
        settings.last_download_at = timezone.now()
        settings.save()

        return Response(
            {
                "ok": True,
                "model_id": model_id,
                "local_path": local_path,
                "downloaded_at": settings.last_download_at.isoformat(),
            }
        )
