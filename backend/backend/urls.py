from django.contrib import admin
from django.urls import path, include
from api.views import ClientMasterTableList, CreateOtherPlanningData, CreatePerformanceProjectData, CreatePersonnelView, CreatePlanningProjectData, CreateUserView , CreateCompanyMaster, DeleteCompanyMaster, DeletePerformanceProjectData, DeletePlanningProjectData, FetchPersonnelView, ForgotPasswordView, NoteDelete, NoteListCreate, PlanningProjectDataList, StorePersonnelPlanning, StorePlanningProject, UpdateCompanyMaster, UpdateCreateNote, UpdatePerformanceProjectData, UpdatePlanningProjectData, ViewAllPlanning
from api.views import ClientMasterTableList, CreateOtherPlanningData, CreatePerformanceProjectData, CreatePlanningProjectData, CreateUserView , CreateCompanyMaster, DeleteCompanyMaster, DeletePerformanceProjectData, DeletePlanningProjectData, NoteDelete, NoteListCreate, PersonnelExpensesList, PlanningProjectDataList, StorePlanningProject, UpdateCompanyMaster, UpdateCreateNote, UpdatePerformanceProjectData, UpdatePlanningProjectData
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
    path('api/note/add', NoteListCreate.as_view()),  
    path('api/note/update', UpdateCreateNote.as_view()),  
    path('api/note/delete', NoteDelete.as_view()),  
    path('api/companymaster/add', CreateCompanyMaster.as_view()),  
    path('api/companymaster/update/<int:pk>', UpdateCompanyMaster.as_view()),  
    path('api/companymaster/delete/<int:pk>', DeleteCompanyMaster.as_view()),  
    path('api/performance/add', CreatePerformanceProjectData.as_view()), 
    path('api/performance/update/<int:pk>', UpdatePerformanceProjectData.as_view()),  
    path('api/performance/delete/<int:pk>', DeletePerformanceProjectData.as_view()),   
    path('api/planning/add', CreatePlanningProjectData.as_view()), 
    path('api/planning/update/<int:pk>', UpdatePlanningProjectData.as_view()),  
    path('api/planning/delete/<int:pk>', DeletePlanningProjectData.as_view()),
    path('api/otherplanning/add', CreateOtherPlanningData.as_view()),
    path('api/planningprojects/', PlanningProjectDataList.as_view()),
    path('api/planningprojects/tablelist/', ClientMasterTableList.as_view()),
    path('api/projectplanning/create/', StorePlanningProject.as_view()),
    path('api/forgot-password/', ForgotPasswordView.as_view()),
    path('api/reset-password/<uidb64>/<token>/', ForgotPasswordView.as_view(), name='reset_password'),
    path('api/personnelexpenses/get/', PersonnelExpensesList.as_view()),
    path('api/create-personnel/', CreatePersonnelView.as_view()),
    path('api/fetch-personnel/', FetchPersonnelView.as_view()),
    path('api/personnelplanning/add/', StorePersonnelPlanning.as_view()),
    path('api/planning/all/', ViewAllPlanning.as_view()),
    
]
