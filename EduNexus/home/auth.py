"""Firebase Admin SDK token verification for DRF.

Falls back to AnonymousUser when:
- Firebase Admin SDK isn't installed
- FIREBASE_CREDENTIALS_PATH isn't configured
- The request omits a Bearer token

This lets the SPA run end-to-end in development without requiring service-account
keys, while still wiring in real verification for production once configured.
"""
from __future__ import annotations

import os
from typing import Optional

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework import authentication, exceptions

try:
    import firebase_admin
    from firebase_admin import auth as fb_auth, credentials
except ImportError:  # pragma: no cover
    firebase_admin = None
    fb_auth = None
    credentials = None


_initialized = False


def _initialize_firebase() -> bool:
    global _initialized
    if _initialized or firebase_admin is None:
        return _initialized
    cred_path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", None) or os.environ.get(
        "FIREBASE_CREDENTIALS_PATH"
    )
    if not cred_path or not os.path.exists(cred_path):
        return False
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(cred_path))
    _initialized = True
    return True


class FirebaseUser:
    is_authenticated = True
    is_active = True
    is_anonymous = False
    is_staff = False

    def __init__(self, uid: str, email: Optional[str], display_name: Optional[str], role: str):
        self.uid = uid
        self.email = email
        self.display_name = display_name
        self.role = role

    @property
    def username(self) -> str:
        return self.uid

    def __str__(self) -> str:
        return self.email or self.uid


class FirebaseTokenAuthentication(authentication.BaseAuthentication):
    """Verify the Bearer ID token against Firebase Admin SDK."""

    def authenticate(self, request):
        header = request.META.get("HTTP_AUTHORIZATION", "")
        token: Optional[str] = None
        if header.startswith("Bearer "):
            token = header[len("Bearer ") :]
        else:
            token = request.GET.get("token")

        if not token:
            return None

        if not _initialize_firebase() or fb_auth is None:
            # Firebase Admin not configured; treat as anonymous in dev.
            return (AnonymousUser(), None)

        try:
            decoded = fb_auth.verify_id_token(token)
        except Exception as exc:  # broad: firebase raises many subclasses
            raise exceptions.AuthenticationFailed(f"Invalid Firebase token: {exc}")

        user = FirebaseUser(
            uid=decoded.get("uid"),
            email=decoded.get("email"),
            display_name=decoded.get("name"),
            role=decoded.get("role", "student"),
        )
        return (user, decoded)
