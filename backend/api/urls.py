from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>", views.NoteDelete.as_view(), name="delete-note"),
    path("accountmaster/", views.AccountMasterListCreate.as_view(), name="accountmaster-list"),
    path("accountmaster/<int:pk>", views.AccountMasterRetrieveUpdateDestroy.as_view(), name="accountmaster-detail"),
    path("businessdivisionmaster/", views.BusinessDivisionMasterListCreate.as_view(), name="businessdivisionmaster-list"),
    path("businessdivisionmaster/<int:pk>", views.BusinessDivisionMasterRetrieveUpdateDestroy.as_view(), name="businessdivisionmaster-detail"),
    path("clientmaster/", views.ClientMasterListCreate.as_view(), name="clientmaster-list"),
    path("clientmaster/<int:pk>", views.ClientMasterRetrieveUpdateDestroy.as_view(), name="clientmaster-detail"),
]
