from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CostOfSales, Expenses, MasterBusinessDivision, MasterClient, MasterCompany, Projects, Results, Employees as EmployeesApi, EmployeeExpenses


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
    
class EmployeesSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeesApi
        fields = '__all__'
        
    def create(self, validated_data):
        employee = EmployeesApi.objects.create(**validated_data)
        return employee

class EmployeesListSerializer(serializers.ModelSerializer):
    business_division = serializers.StringRelatedField()
    company = serializers.StringRelatedField()
    auth_user = serializers.StringRelatedField()
    class Meta:
        model = EmployeesApi
        fields = [
            'employee_id',
            'last_name',
            'first_name',
            'email',
            'salary',
            'auth_user_id',
            'created_at',
            'updated_at',
            'business_division', 
            'company',
            'auth_user', 
        ]

class MasterCompanySerializers(serializers.ModelSerializer):
    class Meta:
        model = MasterCompany
        fields = '__all__'
        
class MasterBusinessDivisionSerializer(serializers.ModelSerializer):
    # company_id = serializers.PrimaryKeyRelatedField(queryset=CompanyMaster.objects.all())
    # company = CompanyMasterSerializers(source='company_id', read_only=True)
    class Meta:
        model = MasterBusinessDivision
        fields = '__all__'
        # fields = ["business_division_id", "business_division_name", "company_id", "company", "created_at", "registered_user_id"]


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
class MasterClientSerializer(serializers.ModelSerializer):
     auth_user = serializers.StringRelatedField()
     class Meta:
        model = MasterClient
        fields = [
            'client_id',
            'client_name',
            'created_at',
            'updated_at',
            'auth_user',
        ]
        
class UpdateMasterCompanySerializers(serializers.ModelSerializer):
    class Meta:
        model = MasterCompany
        fields = [
            "company_name",
            "created_at", 
            "registered_user_id"
            ]
        
class ResultListsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Results
        fields = '__all__'
class CreateResultsSerializers(serializers.ModelSerializer):
    class Meta:
        model = Results
        fields = '__all__'

class UpdateResultsSerializers(serializers.ModelSerializer):
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
        


class CreateProjectsSerializers(serializers.ModelSerializer):
    # client = MasterClientSerializer(source='client_id', read_only=True)
    client = serializers.PrimaryKeyRelatedField(queryset=MasterClient.objects.all())
    class Meta:
        model = Projects
        fields = '__all__'


class ClientMasterPlanningProjectDataSerializer(serializers.ModelSerializer):
    # other_planning_data = CreateOtherPlanningSerializers(many=True, read_only=True, source='other_planning')
    class Meta:
        model = Projects
        fields = '__all__'


class CreateTableListSerializers(serializers.ModelSerializer):
    planning_project_data = ClientMasterPlanningProjectDataSerializer(many=True, read_only=True, source='planning_project')
    class Meta:
        model = MasterClient
        fields = '__all__'     

class UpdateProjectsSerializers(serializers.ModelSerializer):
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
        
class AuthenticationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class GetProjectsSerializers(serializers.ModelSerializer):
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

class GetEmployeeExpensesSerializer(serializers.ModelSerializer):
    planning_project = GetProjectsSerializers(source='planning_project_id' , read_only=True, )
    class Meta:
        model = EmployeeExpenses
        fields = ["planning_project_id","planning_assign_id", "client_id", "assignment_ratio", "assignment_unit_price","assignment_user_id", "year", "month", "registration_date", "registration_user", "planning_project"]

class GetUserMasterSerializer(serializers.ModelSerializer):
    planning_assign = GetEmployeeExpensesSerializer(many=True, read_only=True, source='user')
    class Meta:
        model = EmployeesApi
        fields = ["username", "email", "last_login", "created_at", "registered_user_id" , "planning_assign"]

class GetBusinessDivisionMasterSerializer(serializers.ModelSerializer):
    company = MasterCompanySerializers(source='company_id', read_only=True)

    class Meta:
        model = MasterBusinessDivision
        fields = ["business_division_id", "business_division_name", "created_at", "registered_user_id", "company"]
        
class EmployeeExpensesDataSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = EmployeeExpenses
        fields = '__all__'


class CostOfSalesSerializer(serializers.ModelSerializer):

    class Meta:
        model = CostOfSales
        fields = '__all__'

class CustomCostOfSalesSerializer(serializers.ModelSerializer):

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

class ExpensesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expenses
        fields = '__all__'

class CustomExpensesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expenses
        fields = [
            'year',
            'month',
            'taxes_and_public_charges',
            'communication_expenses',
            'advertising_expenses',
            'consumables_expenses',
            'depreciation_expenses',
            'utilities_expenses',
            'entertainment_expenses',
            'rent',
            'travel_expenses',
            'payment_fees',
            'remuneration',
        ]

class AllPlanningSerializer(serializers.Serializer):
    cost_of_sales = CostOfSalesSerializer()
    # planning_project_data = GetProjectsSerializers()
    planning_project_data = GetProjectsSerializers()
    expenses = ExpensesSerializer()

class ProjectsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields =  '__all__'

class UpdatePlanningSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostOfSales
        fields =  '__all__'