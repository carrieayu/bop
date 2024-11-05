from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CostOfSales, Expenses, MasterBusinessDivision, MasterClient, MasterCompany, Projects, Results, Employees as Employees, EmployeeExpenses


# Employees
class EmployeesListSerializer(serializers.ModelSerializer):
    business_division = serializers.StringRelatedField()
    company = serializers.StringRelatedField()
    auth_user = serializers.StringRelatedField()
    class Meta:
        model = Employees
        fields = [
            'employee_id',
            'last_name',
            'first_name',
            'type',
            'email',
            'salary',
            'executive_renumeration',
            'company',
            'business_division', 
            'bonus_and_fuel_allowance',
            'statutory_welfare_expense',
            'welfare_expense',
            'insurance_premium',
            'auth_user_id', # double ??
            'auth_user', # double ?? 
            'created_at',
            'updated_at',
        ]

class EmployeesCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employees  # Replace with your actual model
        fields = [
            'last_name',
            'first_name', 
            'type', 'email', 
            'salary', 
            'executive_renumeration', 
            'company', 
            'business_division', 
            'bonus_and_fuel_allowance',
            'statutory_welfare_expense',
            'welfare_expense',
            'insurance_premium',
            'auth_user', # double ?? 
            'created_at',
            ]
        
        extra_kwargs = {
            'salary': {'allow_null': True, 'required': False},
            'executive_renumeration': {'allow_null': True, 'required': False},
        }

class EmployeesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employees
        fields = '__all__'
        
    def create(self, validated_data):
        employee = Employees.objects.create(**validated_data)
        return employee

# Master Business Divisions   
class MasterBusinessDivisionSerializer(serializers.ModelSerializer):
    # company_id = serializers.PrimaryKeyRelatedField(queryset=CompanyMaster.objects.all())
    # company = CompanyMasterSerializers(source='company_id', read_only=True)
    class Meta:
        model = MasterBusinessDivision
        fields = '__all__'
        # fields = ["business_division_id", "business_division_name", "company_id", "company", "created_at", "registered_user_id"]

# Master Clients
class MasterClientListSerializer(serializers.ModelSerializer):
     class Meta:
        model = MasterClient
        fields = [
            'client_id',
            'client_name',
            'created_at',
            'updated_at',
            'auth_user',
        ]
class MasterClientCreateSerializer(serializers.ModelSerializer):
     class Meta:
        model = MasterClient
        fields = [
            'client_id',
            'client_name',
            'created_at',
            'updated_at',
            'auth_user',
        ]
class MasterClientUpdateSerializer(serializers.ModelSerializer):
     class Meta:
        model = MasterClient
        fields = [
            'client_id',
            'client_name',
            'created_at',
            'updated_at',
            'auth_user',
        ]
class MasterClientDeleteSerializer(serializers.ModelSerializer):
     class Meta:
        model = MasterClient
        fields = [
            'client_id',
            'client_name',
            'created_at',
            'updated_at',
            'auth_user',
        ]

# -----------------------------------
# CHECK: NOT BEING USED 
# -----------------------------------

# class MasterClientSerializer(serializers.ModelSerializer):
#      auth_user = serializers.StringRelatedField()
#      class Meta:
#         model = MasterClient
#         fields = [
#             'client_id',
#             'client_name',
#             'created_at',
#             'updated_at',
#             'auth_user',
#         ]

# -----------------------------------

# Master Companies
class MasterCompaniesListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterCompany
        fields = '__all__'

class MasterCompaniesCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterCompany
        fields = '__all__'


class MasterCompaniesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterCompany
        fields = [
            "company_name",
            "created_at", 
            "registered_user_id"
            ]

# Projects
class ProjectsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = '__all__'
        # fields = [
        #     "planning_project_name",
        #     "planning_project_type",
        #     "planning",
        #     "sales_revenue",
        #     "cost_of_goods_sold",
        #     "dispatched_personnel_expenses",
        #     "personal_expenses",
        #     "indirect_personal_expenses",
        #     "expenses",
        #     "operating_profit",
        #     "non_operating_income",
        #     "ordinary_profit",
        #     "ordinary_profit_margin"
        #     ]

class ProjectsCreateSerializer(serializers.ModelSerializer):
    # client = MasterClientSerializer(source='client_id', read_only=True)
    client = serializers.PrimaryKeyRelatedField(queryset=MasterClient.objects.all())
    class Meta:
        model = Projects
        fields = '__all__'

class ProjectsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = [
            "planning_project_name",
            "planning_project_type",
            "planning",
            "sales_revenue",
            "cost_of_goods_sold",
            "dispatched_personnel_expenses",
            "personal_expenses",
            "indirect_personal_expenses",
            "expenses",
            "operating_profit",
            "non_operating_income",
            "ordinary_profit",
            "ordinary_profit_margin"
            ]

class GetBusinessDivisionMasterSerializer(serializers.ModelSerializer):
    company = MasterCompaniesListSerializer(source='company_id', read_only=True)

    class Meta:
        model = MasterBusinessDivision
        fields = ["business_division_id", "business_division_name", "created_at", "registered_user_id", "company"]

# Employee Expenses
class EmployeeExpensesListSerializer(serializers.ModelSerializer):
    employee_expense_id = serializers.CharField(required=False)
    employee = EmployeesListSerializer()
    project = ProjectsCreateSerializer()
    class Meta:
        model = EmployeeExpenses
        fields = '__all__'

class EmployeeExpensesCreateSerializer(serializers.ModelSerializer):
    employee_expense_id = serializers.CharField(required=False)
    employee = EmployeesListSerializer()
    project = ProjectsCreateSerializer()
    class Meta:
        model = EmployeeExpenses
        fields = '__all__'

class EmployeeExpensesDeleteSerializer(serializers.ModelSerializer):
    employee_expense_id = serializers.CharField(required=False)
    employee = EmployeesListSerializer()
    project = ProjectsCreateSerializer()
    class Meta:
        model = EmployeeExpenses
        fields = '__all__'

class GetEmployeeExpensesSerializer(serializers.ModelSerializer):
    planning_project = ProjectsListSerializer(source='planning_project_id' , read_only=True, )
    class Meta:
        model = EmployeeExpenses
        fields = ["planning_project_id","planning_assign_id", "client_id", "assignment_ratio", "assignment_unit_price","assignment_user_id", "year", "month", "registration_date", "registration_user", "planning_project"]


# Cost Of Sales
class CostOfSalesSerializer(serializers.ModelSerializer):
    cost_of_sale_id = serializers.CharField(required=False)
    class Meta:
        model = CostOfSales
        fields = '__all__'



# Expenses
class ExpensesListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expenses
        fields = '__all__'

class ExpensesCreateSerializer(serializers.ModelSerializer):

    expense_id = serializers.CharField(required=False)
    class Meta:
        model = Expenses
        fields = [
            'expense_id',
            'year',
            'month',
            'tax_and_public_charge',
            'communication_expense',
            'advertising_expense',
            'consumable_expense',
            'depreciation_expense',
            'utilities_expense',
            'entertainment_expense',
            'rent_expense',
            'travel_expense',
            'transaction_fee',
            'professional_service_fee',
            'created_at',
            'updated_at',
        ]

class ExpensesUpdateSerializer(serializers.ModelSerializer):

    expense_id = serializers.CharField(required=False)
    class Meta:
        model = Expenses
        fields = [
            'expense_id',
            'year',
            'month',
            'tax_and_public_charge',
            'communication_expense',
            'advertising_expense',
            'consumable_expense',
            'depreciation_expense',
            'utilities_expense',
            'entertainment_expense',
            'rent_expense',
            'travel_expense',
            'transaction_fee',
            'professional_service_fee',
            'updated_at',
        ]

# Users

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "date_joined",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


# Planning
class UpdatePlanningSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostOfSales
        fields =  '__all__'



# --------------------------------------------------------------
# NOT BEING USED IN APPLICATION CURRENTLY
# --------------------------------------------------------------

# Results
class ResultsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Results
        fields = '__all__'
class ResultsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Results
        fields = '__all__'

class ResultsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Results
        fields = [
            "sales_revenue",
            "cost_of_goods_sold",
            "dispatched_personnel_expenses",
            "personnel_expenses",
            "indirect_personnel_expenses",
            "expenses",
            "operating_profit",
            "non_operating_income",
            "ordinary_profit",
            "ordinary_profit_margin",
            ]

# --------------------------------------------------------------
# CHECK: DO NOT KNOW WHAT THESE ARE FOR? DO WE NEED THEM?
# --------------------------------------------------------------

# -----------------------------------
# # 1
# -----------------------------------
class ClientMasterPlanningProjectDataSerializer(serializers.ModelSerializer):
    # other_planning_data = CreateOtherPlanningSerializers(many=True, read_only=True, source='other_planning')
    class Meta:
        model = Projects
        fields = '__all__'


# -----------------------------------
# # 2
# -----------------------------------
class CreateTableListSerializers(serializers.ModelSerializer):
    planning_project_data = ClientMasterPlanningProjectDataSerializer(many=True, read_only=True, source='planning_project')
    class Meta:
        model = MasterClient
        fields = '__all__'     

# -----------------------------------
# # 3
# -----------------------------------

class GetUserMasterSerializer(serializers.ModelSerializer):
    planning_assign = GetEmployeeExpensesSerializer(many=True, read_only=True, source='user')
    class Meta:
        model = Employees
        fields = ["username", "email", "last_login", "created_at", "registered_user_id" , "planning_assign"]



# -----------------------------------
# # 4
# -----------------------------------

class AuthenticationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

# -----------------------------------
# #5
# -----------------------------------

# class CustomCostOfSalesSerializer(serializers.ModelSerializer):

    class Meta:
        model = CostOfSales
        fields = [
            'year', 
            'month',
            'outsourcing_costs',
            'communication_costs',
            'cost_of_sales',
            'product_purchases',
            'work_in_progress',
            'purchases',
            'dispatch_labor_costs',
            'amortization'
        ]

# -----------------------------------
# #6
# -----------------------------------
class AllPlanningSerializer(serializers.Serializer):
    cost_of_sales = CostOfSalesSerializer()
    # planning_project_data = GetProjectsSerializers()
    planning_project_data = ProjectsListSerializer()
    expenses = ExpensesListSerializer()
