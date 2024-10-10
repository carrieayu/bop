from django.contrib import admin
from django.urls import path, include
from api.views import CostOfSalesList, CreateMasterCompany, CreateResults, CreateUserView , DeleteMasterCompany, DeleteResults, DeleteUser, EmployeeDetailView, EmployeesCreate, EmployeesDelete, EmployeesUpdate, ForgotPasswordView, MasterClientTableList, MasterCompanyList, ProjectsList, ResultsLists, StoreProjects, UpdateMasterCompany, UpdateResults,ForgotPasswordView, UserList, UserUpdate
from api.views import CostOfSalesCreate, CostOfSalesUpdate, CreateEmployeeExpenses, EmployeeExpensesList, Employees, ExpensesCreate, ExpensesList, ExpensesUpdate, Planning, PlanningUpdate, ProjectsUpdate
from api.views import ForgotPasswordView, MasterClientTableList,   ResultsLists, StoreProjects, ExpensesDelete, CostOfSalesDelete, ProjectsCreate, ProjectsDataUpdate, ProjectsDelete
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    #Admin
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/user/list/", UserList.as_view(), name="user-list"),
    path('api/user/list/<int:pk>/delete/', DeleteUser.as_view(), name="master-company-delete"),
    path('api/user/update/', UserUpdate.as_view()),
    #Token
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),

    #Auth
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),

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
    # Projects
    path('api/projects/', ProjectsList.as_view(), name="projects-list"), 
    path('api/projects/create/', ProjectsCreate.as_view(), name="projects-create"), 
    path('api/projects/update/', ProjectsDataUpdate.as_view(), name="projects-update"),   
    path('api/projects/<int:pk>/delete/', ProjectsDelete.as_view(), name="projects-delete"), 
    # Projects needs to trace on where it is used
    # path('api/projects/tablelist/', MasterClientTableList.as_view(), name="projects-table-lists"), 
    # path('api/projects/store/', StoreProjects.as_view(), name="projects-store"), #the nested views for storing projects
    # path('api/projects/update', ProjectsUpdate.as_view()),
    # path('api/forgot-password/', ForgotPasswordView.as_view(), name="forgot-password"),
    # path('api/reset-password/<uidb64>/<token>/', ForgotPasswordView.as_view(), name='reset-password'),
    # End
    #Employees
    path('api/employee-expenses', EmployeeExpensesList.as_view()),
    path('api/employee-expenses/create', CreateEmployeeExpenses.as_view()),
    path('api/employees/edit/', EmployeeDetailView.as_view()), #used for filtering business when going on edit mode
    path('api/employees', Employees.as_view()),
    path('api/employees/create', EmployeesCreate.as_view()),
    path('api/employees/<int:pk>/delete/', EmployeesDelete.as_view()),
    path('api/employees/update/', EmployeesUpdate.as_view()),
    #Planning
    path('api/planning', Planning.as_view()),
    path('api/planning/update', PlanningUpdate.as_view()),
    #Expenses
    path('api/expenses', ExpensesList.as_view(), name = 'expenses-list'),
    path('api/expenses/create', ExpensesCreate.as_view(), name = 'expenses-create'),
    path('api/expenses/update', ExpensesUpdate.as_view(), name = 'expenses-update'),
    path('api/expenses/<str:pk>/delete/', ExpensesDelete.as_view(), name='expenses-delete'),
    #COS
    path('api/cost-of-sales', CostOfSalesList.as_view()),
    path('api/cost-of-sales/create', CostOfSalesCreate.as_view()),
    path('api/cost-of-sales/update', CostOfSalesUpdate.as_view()),
    path('api/cost-of-sales/<str:pk>/delete/', CostOfSalesDelete.as_view(), name='cost-of-sales-delete'),
]
