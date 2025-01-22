from django.contrib import admin
from django.urls import path, include
from api.views import CostOfSalesResultsCreate, CostOfSalesResultsDelete, CostOfSalesResultsFilter, CostOfSalesResultsList, CostOfSalesResultsUpdate, EmployeeExpensesFilter, EmployeeExpensesResultsCreate, EmployeeExpensesResultsDelete, EmployeeExpensesResultsFilter, EmployeeExpensesResultsList, ExpensesCreate, ExpensesDelete, ExpensesList,ExpensesUpdate, PasswordForgotView, ProjectSalesResultsFilter, ResultsSummaryDisplayByProjects, ResultsSummaryList, ResultsSummaryUpdate
from api.views import ProjectSalesResultsCreate, ProjectSalesResultsDelete, ProjectSalesResultsList, ProjectSalesResultsUpdate
from api.views import ExpensesResultsCreate, ExpensesResultsDelete, ExpensesResultsList, ExpensesResultsUpdate, ExpensesResultsFilter
from api.views import PlanningList, PlanningUpdate, PlanningDisplayByProjects
from api.views import MasterCompaniesList, MasterCompaniesCreate, MasterCompaniesUpdate, MasterCompaniesDelete
from api.views import MasterBusinessDivisionsList, MasterBusinessDivisionsCreate, MasterBusinessDivisionsUpdate, MasterBusinessDivisionsDelete, BusinessDivisionsOfCompany
from api.views import MasterClientsList, MasterClientsCreate, MasterClientsUpdate, MasterClientsDelete
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
    path('api/master-companies/<str:pk>/update/', MasterCompaniesUpdate.as_view(), name="master-companies-update"),  
    path('api/master-companies/<str:pk>/delete/', MasterCompaniesDelete.as_view(), name="master-companies-delete"),  

    # Master Business Divisions
    path("api/master-business-divisions/list/", MasterBusinessDivisionsList.as_view(), name="master-business-divisions-list"),
    path("api/master-business-divisions/create/", MasterBusinessDivisionsCreate.as_view(), name="master-business-divisions-create"),
    # NOT IN USE
    path("api/master-business-divisions/update/", MasterBusinessDivisionsUpdate.as_view(), name="master-business-divisions-update"),
    path("api/master-business-divisions/<str:pk>/delete/", MasterBusinessDivisionsDelete.as_view(), name="master-business-divisions-delete"),
    # In "Employees List And Edit Screen" [Edit Mode]:
    # Retrieve Business Divisions Connected to Company Selected in [会社名・Company_Name] Pulldown.
    path("api/business-divisions-of-company/", BusinessDivisionsOfCompany.as_view(), name="companies-with-business-division"), #url for filtering the business division from the selected company
    
    # Master Clients
    path("api/master-clients/list/", MasterClientsList.as_view(), name="master-clients-list"),
    path("api/master-clients/create/", MasterClientsCreate.as_view(), name="master-clients-create"),
    # NOT IN USE
    path("api/master-clients/update/", MasterClientsUpdate.as_view(), name="master-clients-update"),
    path("api/master-clients/<str:pk>/delete/", MasterClientsDelete.as_view(), name="master-clients-delete"),

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
    path('api/projects/<str:pk>/delete/', ProjectsDelete.as_view(), name="projects-delete"), 

    # Project Sales Results
    path('api/project-sales-results/list/', ProjectSalesResultsList.as_view(), name="project-list"), 
    path('api/project-sales-results/create/', ProjectSalesResultsCreate.as_view(), name="project-sales-results-create"), 
    path('api/project-sales-results/update/', ProjectSalesResultsUpdate.as_view(), name="project-sales-results-update"),   
    path('api/project-sales-results/<str:pk>/delete/', ProjectSalesResultsDelete.as_view(), name="project-sales-results-delete"),
    path('api/project-sales-results/filter/', ProjectSalesResultsFilter.as_view(), name="project-sales-filtered-list"),

    # EmployeeExpenses
    path('api/employee-expenses/list/', EmployeeExpensesList.as_view(), name = 'employee-expenses-list'),
    path('api/employee-expenses/create/', EmployeeExpensesCreate.as_view(), name = 'employee-expenses-create'),
    # Employee Expenses Currently Has No Update Function as the Edit Screen is only used for deleting.
    path('api/employee-expenses/<str:pk>/delete/', EmployeeExpensesDelete.as_view(), name='employee-expenses-delete'),
    path('api/employee-expenses/filter/', EmployeeExpensesFilter.as_view(), name="employee-expenses-results-filter-list"),

    # EmployeeExpenses Results
    path('api/employee-expenses-results/list/', EmployeeExpensesResultsList.as_view(), name = 'employee-expenses-results-list'),
    path('api/employee-expenses-results/create/', EmployeeExpensesResultsCreate.as_view(), name = 'employee-expenses-results-create'),
    path('api/employee-expenses-results/<str:pk>/delete/', EmployeeExpensesResultsDelete.as_view(), name='employee-expenses-results-delete'),
    path('api/employee-expenses-results/filter/', EmployeeExpensesResultsFilter.as_view(), name="employee-expenses-results-filter-list"),
    
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
    path('api/expenses-results/filter/', ExpensesResultsFilter.as_view(), name="expenses-results-filtered-list"),

    # Cost of Sales
    path('api/cost-of-sales/list/', CostOfSalesList.as_view(), name='cost-of-sales-list'),
    path('api/cost-of-sales/create/', CostOfSalesCreate.as_view(), name='cost-of-sales-create'),
    path('api/cost-of-sales/update/', CostOfSalesUpdate.as_view(), name='cost-of-sales-update'),
    path('api/cost-of-sales/<str:pk>/delete/', CostOfSalesDelete.as_view(), name='cost-of-sales-delete'),

    # Cost of Sales Results
    path('api/cost-of-sales-results/list/', CostOfSalesResultsList.as_view(), name='cost-of-sales-results-list'),
    path('api/cost-of-sales-results/create/', CostOfSalesResultsCreate.as_view(), name='cost-of-sales-results-create'),
    path('api/cost-of-sales-results/update/', CostOfSalesResultsUpdate.as_view(), name='cost-of-sales-results-update'),
    path('api/cost-of-sales-results/<str:pk>/delete/', CostOfSalesResultsDelete.as_view(), name='cost-of-sales-results-delete'),
    path('api/cost-of-sales-results/filter/', CostOfSalesResultsFilter.as_view(), name="cost-of-sales-filtered-list"),

    # Employees
    path('api/employees/list/', EmployeesList.as_view(), name = 'employees-list'),
    path('api/employees/create/', EmployeesCreate.as_view(), name = 'employees-create'),
    path('api/employees/update/', EmployeesUpdate.as_view(), name = 'employees-update'),
    path('api/employees/<str:pk>/delete/', EmployeesDelete.as_view(), name = 'employees-delete'),
    # Filters the EmployeeBusinessDivision in Edit Mode on List Screen
    path('api/employees/edit/',  EmployeesEdit.as_view(), name = 'employees-edit'), # used for filtering business divisions when on edit mode
    
    # Users
    path("api/users/list/", UsersList.as_view(), name="users-list"), #LIST
    path("api/users/create/", UsersCreate.as_view(), name="users-create"), #CREATE
    path('api/users/update/', UsersUpdate.as_view(), name= "users-update"), #UPDATE
    path('api/users/<int:pk>/delete/', UsersDelete.as_view(), name="users-delete"), #DESTROY

    # Results Summary (Note: This is different from Results | Data used are [ Expenses Res, Employee Exp. Res, Projects Sales Res. , CostOfSales Res. ])
    path('api/results-summary/list/', ResultsSummaryList.as_view(), name="results-summary-list"),
    # Results Summary: Display By Projects
    path('api/results-summary/display-by-projects/', ResultsSummaryDisplayByProjects.as_view(), name="results-display-by-projects"),
    path('api/results-summary/update/', ResultsSummaryUpdate.as_view(), name="results-summary-update"),

    # NOT BEING USED CURRENTLY

    # Results 
    # Previous Name: Performance Data ->  Current Name: Results
    path('api/results/list/', ResultsList.as_view(), name="results-list"),
    path('api/results/create/', ResultsCreate.as_view(), name="results-create"),   
    path('api/results/<str:pk>/update/', ResultsUpdate.as_view(), name="results-update"),  
    path('api/results/<str:pk>/delete/', ResultsDelete.as_view(), name="results-delete"), 
    # END: NOT BEING USED CURRENTLY

]
