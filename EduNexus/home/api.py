"""DRF endpoints powering the React SPA.

These wrap the existing Files / keyword tables and shape responses to match
the frontend's `FileMeta` / `SearchResponse` types.
"""
from __future__ import annotations

import hashlib
import json
import os
import time
from typing import Any
from collections import OrderedDict

from django.http import StreamingHttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from home.models import (
    Files,
    file_name_against_keyword,
    keyword_against_file_name,
)
from home.keywords import extract_text


def _safe_keywords(raw: str) -> list[str]:
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        try:
            parsed = eval(raw, {"__builtins__": {}}, {})  # legacy rows
        except Exception:
            return []
    if isinstance(parsed, list):
        return [str(x) for x in parsed]
    return []


def _file_to_meta(f: Files) -> dict[str, Any]:
    filename = os.path.basename(f.file.name) if f.file else ""
    path = os.path.join("media", filename) if filename else ""
    size = 0
    if path and os.path.exists(path):
        try:
            size = os.path.getsize(path)
        except OSError:
            size = 0

    keyword_row = file_name_against_keyword.objects.filter(filename=filename).first()
    keywords = _safe_keywords(keyword_row.keyword if keyword_row else "")

    return {
        "id": f.id,
        "filename": filename,
        "uploader": "student",  # current model has no uploader FK; placeholder
        "uploaded_at": "",       # current model has no timestamp; placeholder
        "size_bytes": size,
        "mime_type": _guess_mime(filename),
        "page_count": None,
        "keywords": keywords[:8],
        "summary": None,
        "download_url": f.file.url if f.file else "",
        "thumbnail_url": None,
        "upvotes": 0,
        "subject": None,
        "semester": None,
        "status": "ready",
    }


def _guess_mime(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return {
        "pdf": "application/pdf",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "ppt": "application/vnd.ms-powerpoint",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "txt": "text/plain",
    }.get(ext, "application/octet-stream")


class FilesViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser]

    def list(self, request):
        files = Files.objects.all().order_by("-id")
        return Response([_file_to_meta(f) for f in files])

    def retrieve(self, request, pk=None):
        f = Files.objects.filter(pk=pk).first()
        if not f:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(_file_to_meta(f))

    @action(detail=False, methods=["post"], url_path="upload")
    def upload(self, request):
        upload = request.FILES.get("document")
        if not upload:
            return Response(
                {"detail": "Missing 'document' field"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_hash = _sha256_of(upload)

        document = Files(file=upload)
        document.save()
        filename = document.filename()

        try:
            keywords_raw = document.extract_keyword()
        except Exception:
            keywords_raw = "[]"

        file_name_against_keyword(filename=filename, keyword=keywords_raw).save()

        for word in _safe_keywords(keywords_raw):
            row = keyword_against_file_name.objects.filter(keyword=word).first()
            if row:
                existing = _safe_keywords(row.filename)
                if filename not in existing:
                    existing.append(filename)
                row.filename = json.dumps(existing)
                row.save()
            else:
                keyword_against_file_name(
                    keyword=word,
                    filename=json.dumps([filename]),
                ).save()

        meta = _file_to_meta(document)
        meta["file_hash"] = file_hash
        return Response(meta, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="events")
    def events(self, request, pk=None):
        """SSE stream simulating the Celery ingestion pipeline progress.

        In production this would proxy real progress from Redis pub/sub published
        by Celery tasks. Here we stream a deterministic sequence so the UI flows.
        """
        f = Files.objects.filter(pk=pk).first()
        if not f:
            return Response(status=status.HTTP_404_NOT_FOUND)

        stages = [
            ("queued", 50, "Waiting for worker"),
            ("extracting", 60, "Extracting text from document"),
            ("ocr", 70, "Running OCR on scanned pages"),
            ("embedding", 80, "Computing sentence-transformer embeddings"),
            ("summarizing", 90, "Generating LLM summary"),
            ("indexing", 95, "Updating keyword and vector indexes"),
            ("ready", 100, "Indexed"),
        ]

        def stream():
            for stage, progress, message in stages:
                payload = {
                    "file_id": int(pk) if pk else 0,
                    "stage": stage,
                    "progress": progress,
                    "message": message,
                }
                yield f"data: {json.dumps(payload)}\n\n"
                time.sleep(0.4)

        response = StreamingHttpResponse(stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response


def _sha256_of(file_obj) -> str:
    h = hashlib.sha256()
    for chunk in file_obj.chunks():
        h.update(chunk)
    file_obj.seek(0)
    return h.hexdigest()


class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = (request.query_params.get("q") or "").strip()
        mode = request.query_params.get("mode") or "hybrid"
        subject = request.query_params.get("subject")
        file_type = request.query_params.get("file_type")

        if not query:
            return Response(
                {
                    "query": query,
                    "total": 0,
                    "page": 1,
                    "page_size": 0,
                    "hits": [],
                    "facets": {"subjects": [], "file_types": [], "semesters": []},
                }
            )

        matches: dict[str, list[str]] = OrderedDict()

        for row in keyword_against_file_name.objects.filter(keyword__icontains=query):
            for filename in _safe_keywords(row.filename):
                matches.setdefault(filename, []).append(row.keyword)

        for row in file_name_against_keyword.objects.filter(filename__icontains=query):
            matches.setdefault(row.filename, [])

        hits = []
        for filename, matched_keywords in matches.items():
            f = Files.objects.filter(file__endswith=filename).first()
            if not f:
                continue
            meta = _file_to_meta(f)
            if file_type and not meta["filename"].lower().endswith("." + file_type.lower()):
                continue
            if subject and meta.get("subject") != subject:
                continue
            score = _score(query, meta["filename"], meta["keywords"], matched_keywords, mode)
            hits.append(
                {
                    "file": meta,
                    "score": score,
                    "matched_keywords": matched_keywords,
                    "page_anchor": None,
                    "snippet": _snippet_for(meta, query),
                }
            )

        hits.sort(key=lambda h: h["score"], reverse=True)

        facets = _build_facets(hits)
        return Response(
            {
                "query": query,
                "total": len(hits),
                "page": 1,
                "page_size": len(hits),
                "hits": hits,
                "facets": facets,
            }
        )


def _score(query: str, filename: str, keywords: list[str], matched: list[str], mode: str) -> float:
    q = query.lower()
    name = filename.lower()
    score = 0.0
    if q in name:
        score += 5.0
    score += sum(1.0 for k in matched if q in k.lower())
    score += 0.1 * len(keywords)
    if mode == "semantic":
        score *= 0.85  # placeholder until real embeddings are wired in
    elif mode == "lexical":
        score *= 1.1
    return round(score, 3)


def _snippet_for(meta: dict[str, Any], query: str) -> str:
    keywords = meta.get("keywords") or []
    if not keywords:
        return ""
    matches = [k for k in keywords if query.lower() in k.lower()]
    head = ", ".join((matches or keywords)[:4])
    return f"Matches in {meta['filename']}: {head}"


def _build_facets(hits: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    types: dict[str, int] = {}
    for h in hits:
        ext = h["file"]["filename"].rsplit(".", 1)[-1].lower() if "." in h["file"]["filename"] else "other"
        types[ext] = types.get(ext, 0) + 1
    return {
        "subjects": [],
        "semesters": [],
        "file_types": [{"value": k, "count": v} for k, v in sorted(types.items(), key=lambda x: -x[1])],
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def suggest(request):
    prefix = (request.query_params.get("q") or "").strip().lower()
    if len(prefix) < 2:
        return Response({"suggestions": []})

    seen: list[str] = []
    for row in keyword_against_file_name.objects.filter(keyword__icontains=prefix)[:20]:
        if row.keyword not in seen:
            seen.append(row.keyword)
        if len(seen) >= 8:
            break
    return Response({"suggestions": seen})


@api_view(["GET"])
@permission_classes([AllowAny])
def me(request):
    """Return the calling user's profile.

    With Firebase Admin SDK middleware wired in this would return the verified
    token's claims. Here we return a stub student profile.
    """
    return Response(
        {
            "uid": "anon",
            "email": None,
            "display_name": None,
            "role": "student",
        }
    )
