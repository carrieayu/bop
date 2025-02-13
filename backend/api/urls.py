from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [

    # Admin
    path("admin/", admin.site.urls),

    # Token
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),

    # Auth
    path("api-auth/", include("rest_framework.urls")),
    # path("api/", include("api.urls")),

    # Master Business Divisions
    path("api/master-business-divisions/list/", views.MasterBusinessDivisionsList.as_view(), name="master-business-divisions-list"),
    path("api/master-business-divisions/create/", views.MasterBusinessDivisionsCreate.as_view(), name="master-business-divisions-create"),
    # NOT IN USE
    # path("master-business-divisions/<int:pk>", views.BusinessDivisionMasterRetrieve.as_view(), name="master-business-division-detail"),
    path("api/master-business-divisions/update/", views.MasterBusinessDivisionsUpdate.as_view(), name="master-business-divisions-update"),
    path("api/master-business-divisions/<str:pk>/delete/", views.MasterBusinessDivisionsDelete.as_view(), name="master-business-divisions-delete"),
    # In "Employees List And Edit Screen" [Edit Mode]:
    # Retrieve Business Divisions   Connected to Company Selected in [会社名・Company_Name] Pulldown.
    path("api/business-divisions-of-company/", views.BusinessDivisionsOfCompany.as_view(), name="companies-with-business-division"), #url for filtering the business division from the selected company
    
    # Master Clients
    path("api/master-clients/list/", views.MasterClientsList.as_view(), name="master-clients-list"),
    path("api/master-clients/create/", views.MasterClientsCreate.as_view(), name="master-clients-create"),
    # NOT IN USE
    # path("master-client/<int:pk>/", views.MasterClientRetrieve.as_view(), name="master-client-detail"),
    path("api/master-clients/update/", views.MasterClientsUpdate.as_view(), name="master-clients-update"),
    path("api/master-clients/<int:pk>/delete/", views.MasterClientsDelete.as_view(), name="master-clients-delete"),

    # Master Companies
    path('api/master-companies/list/', views.MasterCompaniesList.as_view(), name="master-companies-list"), 
    path('api/master-companies/create/', views.MasterCompaniesCreate.as_view(), name="master-companies-create"),  
    path('api/master-companies/<int:pk>/update/', views.MasterCompaniesUpdate.as_view(), name="master-companies-update"),  
    path('api/master-companies/<int:pk>/delete/', views.MasterCompaniesDelete.as_view(), name="master-companies-delete"),  
    
    # Password
    path('api/password-forgot/', views.PasswordForgotView.as_view(), name="password-forgot"),
    path('api/password-reset/<uidb64>/<token>/', views.PasswordForgotView.as_view(), name='password-reset'),

    # Planning
    path('api/planning/list/', views.PlanningList.as_view(), name="planning-list"),
    path('api/planning/update/', views.PlanningUpdate.as_view(), name="planning-update"),
    # Planning: Display By Projects
    path('api/planning/display-by-projects/', views.PlanningDisplayByProjects.as_view(), name="planning-display-by-projects"),

    # Projects
    path('api/projects/list/', views.ProjectsList.as_view(), name="projects-list"), 
    path('api/projects/create/', views.ProjectsCreate.as_view(), name="projects-create"), 
    path('api/projects/update/', views.ProjectsUpdate.as_view(), name="projects-update"),   
    path('api/projects/<int:pk>/delete/', views.ProjectsDelete.as_view(), name="projects-delete"), 

    # Project Sales Results
    path('api/project-sales-results/list/', views.ProjectSalesResultsList.as_view(), name="project-list"), 
    path('api/project-sales-results/create/', views.ProjectSalesResultsCreate.as_view(), name="project-sales-results-create"), 
    path('api/project-sales-results/update/', views.ProjectSalesResultsUpdate.as_view(), name="project-sales-results-update"),   
    path('api/project-sales-results/<int:pk>/delete/', views.ProjectSalesResultsDelete.as_view(), name="project-sales-results-delete"),
    path('api/project-sales-results/filter/', views.ProjectSalesResultsFilter.as_view(), name="project-sales-filtered-list"),

    # EmployeeExpenses
    path('api/employee-expenses/list/', views.EmployeeExpensesList.as_view(), name = 'employee-expenses-list'),
    path('api/employee-expenses/create/', views.EmployeeExpensesCreate.as_view(), name = 'employee-expenses-create'),
    # Employee Expenses Currently Has No Update Function as the Edit Screen is only used for deleting.
    path('api/employee-expenses/<str:pk>/delete/', views.EmployeeExpensesDelete.as_view(), name='employee-expenses-delete'),
    path('api/employee-expenses/filter/', views.EmployeeExpensesFilter.as_view(), name="employee-expenses-results-filter-list"),

    # EmployeeExpenses Results
    path('api/employee-expenses-results/list/', views.EmployeeExpensesResultsList.as_view(), name = 'employee-expenses-results-list'),
    path('api/employee-expenses-results/create/', views.EmployeeExpensesResultsCreate.as_view(), name = 'employee-expenses-results-create'),
    path('api/employee-expenses-results/<str:pk>/delete/', views.EmployeeExpensesResultsDelete.as_view(), name='employee-expenses-results-delete'),
    path('api/employee-expenses-results/filter/', views.EmployeeExpensesResultsFilter.as_view(), name="employee-expenses-results-filter-list"),

    # Expenses
    path('api/expenses/list/', views.ExpensesList.as_view(), name = 'expenses-list'),
    path('api/expenses/create/', views.ExpensesCreate.as_view(), name = 'expenses-create'),
    path('api/expenses/update/', views.ExpensesUpdate.as_view(), name = 'expenses-update'),
    path('api/expenses/<str:pk>/delete/', views.ExpensesDelete.as_view(), name='expenses-delete'),

    # Expenses Results
    path('api/expenses-results/list/', views.ExpensesResultsList.as_view(), name = 'expenses-results-list'),
    path('api/expenses-results/create/', views.ExpensesResultsCreate.as_view(), name = 'expenses-results-create'),
    path('api/expenses-results/update/', views.ExpensesResultsUpdate.as_view(), name = 'expenses-results-update'),
    path('api/expenses-results/<str:pk>/delete/', views.ExpensesResultsDelete.as_view(), name='expenses-results-delete'),
    path('api/expenses-results/filter/', views.ExpensesResultsFilter.as_view(), name="expenses-results-filtered-list"),

    # Cost of Sales
    path('api/cost-of-sales/list/', views.CostOfSalesList.as_view(), name='cost-of-sales-list'),
    path('api/cost-of-sales/create/', views.CostOfSalesCreate.as_view(), name='cost-of-sales-create'),
    path('api/cost-of-sales/update/', views.CostOfSalesUpdate.as_view(), name='cost-of-sales-update'),
    path('api/cost-of-sales/<str:pk>/delete/', views.CostOfSalesDelete.as_view(), name='cost-of-sales-delete'),

    # Cost of Sales Results
    path('api/cost-of-sales-results/list/', views.CostOfSalesResultsList.as_view(), name='cost-of-sales-results-list'),
    path('api/cost-of-sales-results/create/', views.CostOfSalesResultsCreate.as_view(), name='cost-of-sales-results-create'),
    path('api/cost-of-sales-results/update/', views.CostOfSalesResultsUpdate.as_view(), name='cost-of-sales-results-update'),
    path('api/cost-of-sales-results/<str:pk>/delete/', views.CostOfSalesResultsDelete.as_view(), name='cost-of-sales-results-delete'),
    path('api/cost-of-sales-results/filter/', views.CostOfSalesResultsFilter.as_view(), name="cost-of-sales-filtered-list"),

    # Employees
    path('api/employees/list/', views.EmployeesList.as_view(), name = 'employees-list'),
    path('api/employees/create/', views.EmployeesCreate.as_view(), name = 'employees-create'),
    path('api/employees/update/', views.EmployeesUpdate.as_view(), name = 'employees-update'),
    path('api/employees/<int:pk>/delete/', views.EmployeesDelete.as_view(), name = 'employees-delete'),
    # Filters the EmployeeBusinessDivision in Edit Mode on List Screen
    path('api/employees/edit/', views. EmployeesEdit.as_view(), name = 'employees-edit'), # used for filtering business divisions when on edit mode
    
    # Users
    path("api/users/list/", views.UsersList.as_view(), name="users-list"), #LIST
    path("api/users/create/", views.UsersCreate.as_view(), name="users-create"), #CREATE
    path('api/users/update/', views.UsersUpdate.as_view(), name= "users-update"), #UPDATE
    path('api/users/<int:pk>/delete/', views.UsersDelete.as_view(), name="users-delete"), #DESTROY

    # Results Summary (Note: This is different from Results | Data used are [ Expenses Res, Employee Exp. Res, Projects Sales Res. , CostOfSales Res. ])
    path('api/results-summary/list/', views.ResultsSummaryList.as_view(), name="results-summary-list"),
    # Results Summary: Display By Projects
    path('api/results-summary/display-by-projects/', views.ResultsSummaryDisplayByProjects.as_view(), name="results-display-by-projects"),
    path('api/results-summary/update/', views.ResultsSummaryUpdate.as_view(), name="results-summary-update"),

    # Results 
    # Previous Name: Performance Data ->  Current Name: Results
    path('api/results/list/', views.ResultsList.as_view(), name="results-list"),
    path('api/results/create/', views.ResultsCreate.as_view(), name="results-create"),   
    path('api/results/<int:pk>/update/', views.ResultsUpdate.as_view(), name="results-update"),  
    path('api/results/<int:pk>/delete/', views.ResultsDelete.as_view(), name="results-delete"), 

    # Dashboard / Analysis Screen (Planning And Results)
    path('api/planning-and-results/list/',views.PlanningAndResultsData.as_view(), name="planning-and-results-list")

]