from django.contrib import admin
from django.urls import path, include
from api.views import EmployeeExpensesResultsCreate, EmployeeExpensesResultsDelete, EmployeeExpensesResultsList, ExpensesCreate, ExpensesDelete, ExpensesList,ExpensesUpdate, PasswordForgotView, ProjectSalesResultsFilter
from api.views import ProjectSalesResultsCreate, ProjectSalesResultsDelete, ProjectSalesResultsList, ProjectSalesResultsUpdate
from api.views import ExpensesResultsCreate, ExpensesResultsDelete, ExpensesResultsList, ExpensesResultsUpdate
from api.views import PlanningList, PlanningUpdate, PlanningDisplayByProjects
from api.views import MasterCompaniesList, MasterCompaniesCreate, MasterCompaniesUpdate, MasterCompaniesDelete
from api.views import ProjectsList,  ProjectsCreate, ProjectsUpdate, ProjectsDelete 
from api.views import EmployeeExpensesList, EmployeeExpensesCreate, EmployeeExpensesDelete #No Update Function on this Page.
from api.views import CostOfSalesList, CostOfSalesCreate, CostOfSalesUpdate, CostOfSalesDelete
from api.views import EmployeesList, EmployeesCreate, EmployeesUpdate, EmployeesDelete, EmployeesEdit #Edit Mode Has Api call to filter EmployeeBusinessDivision
from api.views import UsersList, UsersCreate, UsersUpdate, UsersDelete
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# NOT BEING USED CURRENTLY
from api.views import ResultsList, ResultsCreate, ResultsUpdate, ResultsDelete
# End: NOT BEING USED CURRENTLY

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # Token
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),

    # Auth
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),

    # Master Companies
    path('api/master-companies/list/', MasterCompaniesList.as_view(), name="master-companies-list"), 
    path('api/master-companies/create/', MasterCompaniesCreate.as_view(), name="master-companies-create"),  
    path('api/master-companies/<int:pk>/update/', MasterCompaniesUpdate.as_view(), name="master-companies-update"),  
    path('api/master-companies/<int:pk>/delete/', MasterCompaniesDelete.as_view(), name="master-companies-delete"),  
    
    # Password
    path('api/password-forgot/', PasswordForgotView.as_view(), name="password-forgot"),
    path('api/password-reset/<uidb64>/<token>/', PasswordForgotView.as_view(), name='password-reset'),

    # Planning
    path('api/planning/list/', PlanningList.as_view(), name="planning-list"),
    path('api/planning/update/', PlanningUpdate.as_view(), name="planning-update"),
    # Planning: Display By Projects
    path('api/planning/display-by-projects/', PlanningDisplayByProjects.as_view(), name="planning-display-by-projects"),

    # Projects
    path('api/projects/list/', ProjectsList.as_view(), name="projects-list"), 
    path('api/projects/create/', ProjectsCreate.as_view(), name="projects-create"), 
    path('api/projects/update/', ProjectsUpdate.as_view(), name="projects-update"),   
    path('api/projects/<int:pk>/delete/', ProjectsDelete.as_view(), name="projects-delete"), 

    # Project Sales Results
    path('api/project-sales-results/list/', ProjectSalesResultsList.as_view(), name="project-list"), 
    path('api/project-sales-results/create/', ProjectSalesResultsCreate.as_view(), name="project-sales-results-create"), 
    path('api/project-sales-results/update/', ProjectSalesResultsUpdate.as_view(), name="project-sales-results-update"),   
    path('api/project-sales-results/<int:pk>/delete/', ProjectSalesResultsDelete.as_view(), name="project-sales-results-delete"),
    path('api/project-sales-results/filter/', ProjectSalesResultsFilter.as_view(), name="project-sales-filtered-list"),

    # EmployeeExpenses
    path('api/employee-expenses/list/', EmployeeExpensesList.as_view(), name = 'employee-expenses-list'),
    path('api/employee-expenses/create/', EmployeeExpensesCreate.as_view(), name = 'employee-expenses-create'),
    # Employee Expenses Currently Has No Update Function as the Edit Screen is only used for deleting.
    path('api/employee-expenses/<str:pk>/delete/', EmployeeExpensesDelete.as_view(), name='employee-expenses-delete'),

     # EmployeeExpenses Results
    path('api/employee-expenses-results/list/', EmployeeExpensesResultsList.as_view(), name = 'employee-expenses-results-list'),
    path('api/employee-expenses-results/create/', EmployeeExpensesResultsCreate.as_view(), name = 'employee-expenses-results-create'),
    path('api/employee-expenses-results/<str:pk>/delete/', EmployeeExpensesResultsDelete.as_view(), name='employee-expenses-results-delete'),
    
    # Expenses
    path('api/expenses/list/', ExpensesList.as_view(), name = 'expenses-list'),
    path('api/expenses/create/', ExpensesCreate.as_view(), name = 'expenses-create'),
    path('api/expenses/update/', ExpensesUpdate.as_view(), name = 'expenses-update'),
    path('api/expenses/<str:pk>/delete/', ExpensesDelete.as_view(), name='expenses-delete'),

    # Expenses Results
    path('api/expenses-results/list/', ExpensesResultsList.as_view(), name = 'expenses-results-list'),
    path('api/expenses-results/create/', ExpensesResultsCreate.as_view(), name = 'expenses-results-create'),
    path('api/expenses-results/update/', ExpensesResultsUpdate.as_view(), name = 'expenses-results-update'),
    path('api/expenses-results/<str:pk>/delete/', ExpensesResultsDelete.as_view(), name='expenses-results-delete'),

    # Cost of Sales
    path('api/cost-of-sales/list/', CostOfSalesList.as_view(), name='cost-of-sales-list'),
    path('api/cost-of-sales/create/', CostOfSalesCreate.as_view(), name='cost-of-sales-create'),
    path('api/cost-of-sales/update/', CostOfSalesUpdate.as_view(), name='cost-of-sales-update'),
    path('api/cost-of-sales/<str:pk>/delete/', CostOfSalesDelete.as_view(), name='cost-of-sales-delete'),

    # Employees
    path('api/employees/list/', EmployeesList.as_view(), name = 'employees-list'),
    path('api/employees/create/', EmployeesCreate.as_view(), name = 'employees-create'),
    path('api/employees/update/', EmployeesUpdate.as_view(), name = 'employees-update'),
    path('api/employees/<int:pk>/delete/', EmployeesDelete.as_view(), name = 'employees-delete'),
    # Filters the EmployeeBusinessDivision in Edit Mode on List Screen
    path('api/employees/edit/',  EmployeesEdit.as_view(), name = 'employees-edit'), # used for filtering business divisions when on edit mode
    
    # Users
    path("api/users/list/", UsersList.as_view(), name="users-list"), #LIST
    path("api/users/create/", UsersCreate.as_view(), name="users-create"), #CREATE
    path('api/users/update/', UsersUpdate.as_view(), name= "users-update"), #UPDATE
    path('api/users/<int:pk>/delete/', UsersDelete.as_view(), name="users-delete"), #DESTROY

    # NOT BEING USED CURRENTLY

    # Results 
    # Previous Name: Performance Data ->  Current Name: Results
    path('api/results/list/', ResultsList.as_view(), name="results-list"),
    path('api/results/create/', ResultsCreate.as_view(), name="results-create"),   
    path('api/results/<int:pk>/update/', ResultsUpdate.as_view(), name="results-update"),  
    path('api/results/<int:pk>/delete/', ResultsDelete.as_view(), name="results-delete"), 
    # END: NOT BEING USED CURRENTLY

]
