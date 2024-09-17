from django.contrib import admin
from django.urls import path, include
from api.views import CostOfSalesList, CreateMasterCompany, CreateProjecstData, CreateResults, CreateUserView , DeleteMasterCompany, DeleteProjectsData, DeleteResults, ForgotPasswordView, MasterClientTableList, MasterCompanyList, ProjectsList, ResultsLists, StoreProjects, UpdateMasterCompany,  UpdateProjectsData, UpdateResults,ForgotPasswordView
from api.views import CostOfSalesCreate, CostOfSalesUpdate, CreateEmployeeExpenses, CreateEmployees,  EmployeeExpensesList, Employees, ExpensesCreate, ExpensesList, ExpensesUpdate, Planning, PlanningUpdate, ProjectsUpdate

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
    path('api/projects/update', ProjectsUpdate.as_view()),
    path('api/forgot-password/', ForgotPasswordView.as_view(), name="forgot-password"),
    path('api/reset-password/<uidb64>/<token>/', ForgotPasswordView.as_view(), name='reset-password'),
    #Employees
    path('api/employee-expenses', EmployeeExpensesList.as_view()),
    path('api/employee-expenses/create', CreateEmployeeExpenses.as_view()),
    path('api/employees', Employees.as_view()),
    path('api/employees/create', CreateEmployees.as_view()),
    #Planning
    path('api/planning', Planning.as_view()),
    path('api/planning/update', PlanningUpdate.as_view()),
    #Expenses
    path('api/expenses', ExpensesList.as_view()),
    path('api/expenses/create', ExpensesCreate.as_view()),
    path('api/expenses/update', ExpensesUpdate.as_view()),
    #COS
    path('api/cost-of-sales', CostOfSalesList.as_view()),
    path('api/cost-of-sales/create', CostOfSalesCreate.as_view()),
    path('api/cost-of-sales/update', CostOfSalesUpdate.as_view()),   
]
