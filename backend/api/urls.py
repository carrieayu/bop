from django.urls import path
from . import views

urlpatterns = [
    path("master-business-divisions/", views.MasterBusinessDivisionList.as_view(), name="master-business-division-list"),
    path("master-business-division/create", views.BusinessDivisionMasterCreate.as_view(), name="master-business-division-create"),
    path("master-business-division/<int:pk>", views.BusinessDivisionMasterRetrieve.as_view(), name="master-business-division-detail"),
    path("master-business-division/bulk-update/", views.MasterBusinessDivisionUpdate.as_view(), name="master-business-division-update"),
    path("master-business-division/<str:pk>/delete/", views.MasterBusinessDivisionDestroy.as_view(), name="master-business-division-delete"),
    path("business-division/", views.CompaniesWithBusinessDivisions.as_view(), name="companies-with-business-division"),
    
    path("master-clients/", views.MasterClientList.as_view(), name="master-client-lists"),
    path("master-client/create/", views.MasterClientCreate.as_view(), name="master-client-create"),
    path("master-client/<int:pk>/", views.MasterClientRetrieve.as_view(), name="master-client-detail"),
    path("master-client/update/", views.MasterClientUpdate.as_view(), name="master-client-update"),
    path("master-client/<int:pk>/delete/", views.MasterClientDelete.as_view(), name="master-client-destroy"),
]
