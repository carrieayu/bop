from django.contrib import admin
from django.urls import path, include
from api.views import ClientMasterTableList, CostOfSalesList, CreateCostOfSales, CreateExpenses, CreateMasterCompany, CreatePerformanceProjectData, CreatePersonnelView, CreatePlanningProjectData, CreateProjecstData, CreateResults, CreateUserView , CreateCompanyMaster, DeleteCompanyMaster, DeleteMasterCompany, DeletePerformanceProjectData, DeletePlanningProjectData, DeleteProjectsData, DeleteResults, ExpensesDataList, FetchPersonnelView, ForgotPasswordView, MasterClientTableList, MasterCompanyList,PlanningProjectDataList, ProjectsList, ResultsLists, StorePersonnelPlanning, StorePlanningProject, StoreProjects, UpdateCompanyMaster, UpdateCostOfSales, UpdateExpenses, UpdateMasterCompany, UpdatePerformanceProjectData, UpdatePlanningProjectData, UpdateProjectsData, UpdateResults, ViewAllPlanning
from api.views import ClientMasterTableList, CostOfSalesList, CreateCostOfSales, CreateExpenses, CreatePerformanceProjectData, CreatePersonnelView, CreatePlanningProjectData, CreateUserView , CreateCompanyMaster, DeleteCompanyMaster, DeletePerformanceProjectData, DeletePlanningProjectData, ExpensesDataList, FetchPersonnelView, ForgotPasswordView, PlanningProjectDataList, StorePersonnelPlanning, StorePlanningProject, UpdateCompanyMaster, UpdatePerformanceProjectData, UpdatePlanning, UpdatePlanningProjectData, UpdateProjectDataList, ViewAllPlanning
from api.views import ClientMasterTableList, CreatePerformanceProjectData, CreatePlanningProjectData, CreateUserView , CreateCompanyMaster, DeleteCompanyMaster, DeletePerformanceProjectData, DeletePlanningProjectData, PersonnelExpensesList, PlanningProjectDataList, StorePlanningProject, UpdateCompanyMaster, UpdatePerformanceProjectData, UpdatePlanningProjectData
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
    # Start
    # Master Company
    path('api/master-companies/', MasterCompanyList.as_view(), name="master-company-lists"), 
    path('api/master-company/create/', CreateMasterCompany.as_view(), name="master-company-create"),  
    path('api/master-company/<int:pk>/update/', UpdateMasterCompany.as_view(), name="master-company-update"),  
    path('api/companymaster/<int:pk>/delete/', DeleteMasterCompany.as_view(), name="master-company-delete"),  
    
    # Performance Data -> Results
    path('api/results/', ResultsLists.as_view(), name="results"),
    path('api/results/create/', CreateResults.as_view(), name="results-create"),   
    path('api/results/<int:pk>/update/', UpdateResults.as_view(), name="results-update"),  
    path('api/results/<int:pk>/delete/', DeleteResults.as_view(), name="results-delete"), 
    # PrpjectData -> Projects
    path('api/projects/', ProjectsList.as_view(), name="projects-list"), 
    path('api/projects/create/', CreateProjecstData.as_view(), name="projects-create"), 
    path('api/projects/<int:pk>/update/', UpdateProjectsData.as_view(), name="projects-update"),   
    path('api/projects/<int:pk>/delete/', DeleteProjectsData.as_view(), name="projects-delete"), 
    # Projects
    path('api/projects/tablelist/', MasterClientTableList.as_view(), name="projects-table-lists"), 
    path('api/projects/store/', StoreProjects.as_view(), name="projects-store"), #the nested views for storing projects
    path('api/forgot-password/', ForgotPasswordView.as_view(), name="forgot-password"),
    path('api/reset-password/<uidb64>/<token>/', ForgotPasswordView.as_view(), name='reset-password'),
    # End
    path('api/personnelexpenses/get/', PersonnelExpensesList.as_view()),
    path('api/create-personnel/', CreatePersonnelView.as_view()),
    path('api/fetch-personnel/', FetchPersonnelView.as_view()),
    path('api/personnelplanning/add/', StorePersonnelPlanning.as_view()),
    path('api/planning/all/', ViewAllPlanning.as_view()),
    path('api/expenseslist/', ExpensesDataList.as_view()),
    path('api/expenses-registration/create/', CreateExpenses.as_view()),
    path('api/expenses-registration/update/', UpdateExpenses.as_view()),
    path('api/cost-of-sales/', CostOfSalesList.as_view()),
    path('api/costofsale/create/', CreateCostOfSales.as_view()),
    path('api/costofsale/update/', UpdateCostOfSales.as_view()),
    path('api/projectdatalist/update/', UpdateProjectDataList.as_view()),
    path('api/planning/update/', UpdatePlanning.as_view()),
    
]
