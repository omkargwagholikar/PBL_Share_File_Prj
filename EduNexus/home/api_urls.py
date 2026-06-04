from django.urls import path
from rest_framework.routers import DefaultRouter

from home.api import FilesViewSet, SearchView, suggest, me
from home.api_profile import ProfileView, DownloadModelView

router = DefaultRouter()
router.register(r"files", FilesViewSet, basename="files")

urlpatterns = [
    path("search/", SearchView.as_view(), name="api-search"),
    path("search/suggest/", suggest, name="api-search-suggest"),
    path("auth/me/", me, name="api-me"),
    path("auth/profile/", ProfileView.as_view(), name="api-profile"),
    path(
        "auth/profile/download-model/",
        DownloadModelView.as_view(),
        name="api-profile-download-model",
    ),
]

urlpatterns += router.urls
