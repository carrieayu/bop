from django.urls import path
from . import views

urlpatterns = [
    path("businessdivisionmaster/", views.BusinessDivisionMasterListCreate.as_view(), name="businessdivisionmaster-list"),
    path("businessdivisionmaster/<int:pk>", views.BusinessDivisionMasterRetrieveUpdateDestroy.as_view(), name="businessdivisionmaster-detail"),
    path("clientmaster/", views.ClientMasterListCreate.as_view(), name="clientmaster-list"),
    path("clientmaster/<int:pk>", views.ClientMasterRetrieveUpdateDestroy.as_view(), name="clientmaster-detail"),
]
