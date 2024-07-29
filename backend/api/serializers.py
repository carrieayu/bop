from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CostOfSales, Expenses, PlanningAssignData, User as UserApi, User as PersonnelUser ,Note, AccountMaster, ClientMaster, BusinessDivisionMaster, CompanyMaster, PerformanceProjectData, PlanningProjectData, OtherPlanningData


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
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user
    
class PersonnelUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonnelUser
        fields = [
            "user_id",
            "username",
            "email",
            "affiliated_company_id",
            "affiliated_business_division_id",
            "created_at",
            "registered_user_id"
        ]
        
    def create(self, validated_data):
        personnel_user = PersonnelUser.objects.create(**validated_data)
        return personnel_user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'
        extra_kwargs = {"author": {"read_only": True}}

class AccountMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountMaster
        fields = ['id', 'sales_revenue', 'cost_of_goods_sold', 'dispatched_personnel_expenses', 'personal_expenses', 'expenses']

class CompanyMasterSerializers(serializers.ModelSerializer):
    class Meta:
        model = CompanyMaster
        fields = '__all__'
        
class BusinessDivisionMasterSerializer(serializers.ModelSerializer):
    # company_id = serializers.PrimaryKeyRelatedField(queryset=CompanyMaster.objects.all())
    # company = CompanyMasterSerializers(source='company_id', read_only=True)
    class Meta:
        model = BusinessDivisionMaster
        fields = ["business_division_name", "company_id", "registered_user_id"]
        # fields = ["business_division_id", "business_division_name", "company_id", "company", "created_at", "registered_user_id"]


class ClientMasterSerializer(serializers.ModelSerializer):
     
     class Meta:
        model = ClientMaster
        fields = ["client_id", "client_name", "created_at", "registered_user_id"]
        
class UpdateCompanyMasterSerializers(serializers.ModelSerializer):
    class Meta:
        model = CompanyMaster
        fields = [
            "company_name",
            "created_at", 
            "registered_user_id"
            ]
        
class CreatePerformanceProjectDataSerializers(serializers.ModelSerializer):
    class Meta:
        model = PerformanceProjectData
        fields = '__all__'

class UpdatePerformanceProjectDataSerializers(serializers.ModelSerializer):
    class Meta:
        model = PerformanceProjectData
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
        
class CreateOtherPlanningSerializers(serializers.ModelSerializer):
    class Meta:
        model = OtherPlanningData
        fields = '__all__'

class CreatePlanningProjectDataSerializers(serializers.ModelSerializer):
    other_planning = CreateOtherPlanningSerializers(many=True, read_only=True)
    client = ClientMasterSerializer(source='client_id', read_only=True)
    class Meta:
        model = PlanningProjectData
        fields = '__all__'


class ClientMasterPlanningProjectDataSerializer(serializers.ModelSerializer):
    # other_planning_data = CreateOtherPlanningSerializers(many=True, read_only=True, source='other_planning')
    class Meta:
        model = PlanningProjectData
        fields = '__all__'


class CreateTableListSerializers(serializers.ModelSerializer):
    planning_project_data = ClientMasterPlanningProjectDataSerializer(many=True, read_only=True, source='planning_project')
    class Meta:
        model = ClientMaster
        fields = '__all__'     

class UpdatePlanningProjectDataSerializers(serializers.ModelSerializer):
    class Meta:
        model = PlanningProjectData
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


class GetPlanningProjectDataSerializers(serializers.ModelSerializer):
    class Meta:
        model = PlanningProjectData
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

class GetPlanningAssignSerializer(serializers.ModelSerializer):
    planning_project = GetPlanningProjectDataSerializers(source='planning_project_id' , read_only=True, )
    class Meta:
        model = PlanningAssignData
        fields = ["planning_project_id","planning_assign_id", "client_id", "assignment_ratio", "assignment_unit_price","assignment_user_id", "year", "month", "registration_date", "registration_user", "planning_project"]

class GetUserMasterSerializer(serializers.ModelSerializer):
    planning_assign = GetPlanningAssignSerializer(many=True, read_only=True, source='user')
    class Meta:
        model = UserApi
        fields = ["username", "email", "last_login", "created_at", "registered_user_id" , "planning_assign"]

class GetBusinessDivisionMasterSerializer(serializers.ModelSerializer):
    company = CompanyMasterSerializers(source='company_id', read_only=True)

    class Meta:
        model = BusinessDivisionMaster
        fields = ["business_division_id", "business_division_name", "created_at", "registered_user_id", "company"]
        
class PlanningAssignPersonnelDataSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PlanningAssignData
        fields = '__all__'


class CostOfSalesSerializer(serializers.ModelSerializer):

    class Meta:
        model = CostOfSales
        fields = '__all__'

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
    # planning_project_data = GetPlanningProjectDataSerializers()
    planning_project_data = GetPlanningProjectDataSerializers()
    expenses = ExpensesSerializer()