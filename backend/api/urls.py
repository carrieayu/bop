from django.urls import path
from . import views

urlpatterns = [
    # Master Business Divisions
    path("master-business-divisions/list/", views.MasterBusinessDivisionsList.as_view(), name="master-business-divisions-list"),
    path("master-business-divisions/create/", views.MasterBusinessDivisionsCreate.as_view(), name="master-business-divisions-create"),
    # NOT IN USE
    # path("master-business-divisions/<int:pk>", views.BusinessDivisionMasterRetrieve.as_view(), name="master-business-division-detail"),
    path("master-business-divisions/bulk-update/", views.MasterBusinessDivisionsUpdate.as_view(), name="master-business-divisions-update"),
    path("master-business-divisions/<str:pk>/delete/", views.MasterBusinessDivisionsDelete.as_view(), name="master-business-divisions-delete"),
    # In "Employees List And Edit Screen" [Edit Mode]:
    # Retrieve Business Divisions Connected to Company Selected in [会社名・Company_Name] Pulldown.
    path("business-divisions-of-company/", views.BusinessDivisionsOfCompany.as_view(), name="companies-with-business-division"), #url for filtering the business division from the selected company
    
    # Master Clients
    path("master-clients/list/", views.MasterClientsList.as_view(), name="master-clients-list"),
    path("master-client/create/", views.MasterClientsCreate.as_view(), name="master-clients-create"),
    # NOT IN USE
    # path("master-client/<int:pk>/", views.MasterClientRetrieve.as_view(), name="master-client-detail"),
    path("master-client/update/", views.MasterClientsUpdate.as_view(), name="master-clients-update"),
    path("master-client/<int:pk>/delete/", views.MasterClientsDelete.as_view(), name="master-clients-delete"),
]
