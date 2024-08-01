import json
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import generics, status
from django.http import JsonResponse
from rest_framework.parsers import JSONParser
from .serializers import (
    AllPlanningSerializer,
    CostOfSalesSerializer,
    CreateTableListSerializers,
    CustomCostOfSalesSerializer,
    CustomExpensesSerializer,
    ExpensesSerializer,
    GetPlanningAssignSerializer,
    GetPlanningProjectDataSerializers,
    GetUserMasterSerializer,
    PersonnelUserSerializer,
    PlanningAssignPersonnelDataSerializer,
    UserSerializer,
    NoteSerializer,
    AccountMasterSerializer,
    ClientMasterSerializer,
    BusinessDivisionMasterSerializer,
    CompanyMasterSerializers,
    CreatePerformanceProjectDataSerializers,
    CreatePlanningProjectDataSerializers,
    UpdateCompanyMasterSerializers,
    UpdatePerformanceProjectDataSerializers,
    UpdatePlanningProjectDataSerializers,
    AuthenticationSerializer,
    CreateOtherPlanningSerializers,
)
from .serializers import CreateTableListSerializers, UserSerializer, NoteSerializer, AccountMasterSerializer, ClientMasterSerializer, BusinessDivisionMasterSerializer, CompanyMasterSerializers, CreatePerformanceProjectDataSerializers, CreatePlanningProjectDataSerializers, UpdateCompanyMasterSerializers, UpdatePerformanceProjectDataSerializers, UpdatePlanningProjectDataSerializers, AuthenticationSerializer,CreateOtherPlanningSerializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    CostOfSales,
    Expenses,
    User,
    Note,
    AccountMaster,
    ClientMaster,
    BusinessDivisionMaster,
    CompanyMaster,
    PerformanceProjectData,
    PlanningProjectData,
    User as PersonnelUser,
    OtherPlanningData,
    PlanningAssignData
)
from functools import reduce
from datetime import datetime
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils.translation import gettext as _
from django.core.mail import send_mail
from django.utils import timezone
from django.db.models import Max

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class CreateNote(generics.CreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]


class UpdateCreateNote(generics.UpdateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"message": "note data updated !!!"}, status=status.HTTP_200_OK)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "note deleted successfully"}, status=status.HTTP_200_OK
            )
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)


# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
class CreatePersonnelView(generics.CreateAPIView):
    queryset = PersonnelUser.objects.all()
    serializer_class = PersonnelUserSerializer
    permission_classes = [AllowAny]


class CreateCompanyMaster(generics.CreateAPIView):
    serializer_class = CompanyMasterSerializers
    permission_classes = [AllowAny]


# CRUD for AccountMaster
class AccountMasterListCreate(generics.ListCreateAPIView):
    serializer_class = AccountMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AccountMaster.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class AccountMasterRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AccountMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AccountMaster.objects.all()


# CRUD for BusinessDivisionMaster


class BusinessDivisionMasterListCreate(generics.ListCreateAPIView):
    serializer_class = BusinessDivisionMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BusinessDivisionMaster.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class BusinessDivisionMasterRetrieveUpdateDestroy(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = BusinessDivisionMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BusinessDivisionMaster.objects.all()


# CRUD for ClientMaster
class ClientMasterListCreate(generics.ListCreateAPIView):
    serializer_class = ClientMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClientMaster.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class ClientMasterRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClientMaster.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": "data created !!!"}, status=status.HTTP_200_OK)


class UpdateCompanyMaster(generics.UpdateAPIView):
    serializer_class = UpdateCompanyMasterSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return CompanyMaster.objects.filter(company_id=id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"message": "data updated !!!"}, status=status.HTTP_200_OK)


class DeleteCompanyMaster(generics.DestroyAPIView):
    queryset = CompanyMaster.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return CompanyMaster.objects.filter(company_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "deleted successfully"}, status=status.HTTP_200_OK
            )
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)


class CreatePerformanceProjectData(generics.CreateAPIView):
    serializer_class = CreatePerformanceProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "performance data created !!!"}, status=status.HTTP_200_OK
        )


class UpdatePerformanceProjectData(generics.UpdateAPIView):
    serializer_class = UpdatePerformanceProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return PerformanceProjectData.objects.filter(project_id=id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {"message": "performance data updated !!!"}, status=status.HTTP_200_OK
        )


class DeletePerformanceProjectData(generics.DestroyAPIView):
    queryset = PerformanceProjectData.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return PerformanceProjectData.objects.filter(project_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "performance deleted successfully"},
                status=status.HTTP_200_OK,
            )
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)


class CreatePlanningProjectData(generics.CreateAPIView):
    serializer_class = CreatePlanningProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "planning data created !!!"}, status=status.HTTP_200_OK
        )


class UpdatePlanningProjectData(generics.UpdateAPIView):
    serializer_class = UpdatePlanningProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return PlanningProjectData.objects.filter(planning_project_id=id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {"message": "planning data updated !!!"}, status=status.HTTP_200_OK
        )


# OtherPlanning Data for card
class CreateOtherPlanningData(generics.CreateAPIView):
    serializer_class = CreateOtherPlanningSerializers
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "other planning created!"}, status=status.HTTP_200_OK
        )


class PlanningProjectDataList(generics.ListCreateAPIView):
    queryset = PlanningProjectData.objects.all()
    serializer_class = CreatePlanningProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlanningProjectData.objects.all()

class ExpensesDataList(generics.ListCreateAPIView):
    queryset = Expenses.objects.all()
    serializer_class = ExpensesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expenses.objects.all()


class ClientMasterTableList(generics.ListCreateAPIView):
    queryset = ClientMaster.objects.all()
    serializer_class = CreateTableListSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClientMaster.objects.all()


class DeletePlanningProjectData(generics.DestroyAPIView):
    queryset = PlanningProjectData.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return PlanningProjectData.objects.filter(planning_project_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "planning deleted successfully"}, status=status.HTTP_200_OK
            )
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)


class StorePlanningProject(generics.CreateAPIView):
    def post(self, request):
        client_data = request.data.get("client", {})
        business_data = request.data.get("business", {})
        planning_data = request.data.get("planning", {})


        clients = []
        for i in range(len(client_data.get("client_name", []))):
                client_instance_data = {
                    'client_name': client_data.get("client_name")[i],
                    'registered_user_id': client_data.get("registered_user_id")[i] or None
                }
                client_serializer = ClientMasterSerializer(data=client_instance_data)
                
                if client_serializer.is_valid():
                    client = client_serializer.save()
                    clients.append(client)
                else:
                    return Response(client_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        businesses = []
        max_business_division_id = (
            BusinessDivisionMaster.objects.aggregate(
                max_business_division_id=Max("business_division_id")
            )["max_business_division_id"]
            or "0000"
        )
        current_max_id = int(max_business_division_id)

        for i in range(len(business_data.get("business_division_name", []))):
            company, created = CompanyMaster.objects.get_or_create(
                company_id=business_data.get("company_id")[i]
            )

            current_max_id += 1
            new_business_division_id = str(current_max_id).zfill(4)

            business_instance_data = {
                'business_division_id': new_business_division_id,
                'business_division_name': business_data.get("business_division_name")[i],
                'registered_user_id': business_data.get("registered_user_id")[i] or 0,
                'company_id': company.company_id
            }
            
            
            business_serializer = BusinessDivisionMasterSerializer(data=business_instance_data)
            if business_serializer.is_valid():
                business = business_serializer.save()
                businesses.append(business)
            else:
                return Response(business_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        for i in range(len(planning_data.get("project_name", []))):
            planning_instance_data = {
                'planning_project_name': planning_data.get("project_name")[i],
                'month': planning_data.get("month")[i],
                'sales_revenue': float(planning_data.get("sales_revenue")[i] or 0),
                'non_operating_income': float(planning_data.get("non_operating_income")[i] or 0),
                'non_operating_expenses': float(planning_data.get("non_operating_expenses")[i] or 0),
                'planning_project_type': "Type A",
                'client_id': "0001",
            }
            planning_serializer = CreatePlanningProjectDataSerializers(data=planning_instance_data)
            if planning_serializer.is_valid():
                planning_serializer.save()
            else:
                print(planning_serializer.errors)
                return Response(planning_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Project Planning Data created successfully'}, status=status.HTTP_201_CREATED)

class ForgotPasswordView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        # Check if email exists in the database
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Generate password reset token
        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        
        # Construct password reset link
        reset_url = f'http://localhost:3000/reset-password/{uid}/{token}/'
        
        # Send password reset email
        subject = _('Password Reset Request')
        message = _('Please click the link below to reset your password:\n\n') + reset_url
        from_email = 'bopmsemail@gmail.com'  # Update with your email
        recipient_list = [email]
        
        send_mail(subject, message, from_email, recipient_list)

        return Response({"message": "Password reset link sent successfully."}, status=status.HTTP_200_OK)
    
    def put(self, request, uidb64, token):
        # Decode uidb64 to get user id
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        # Check if user exists and token is valid
        if user is not None and PasswordResetTokenGenerator().check_token(user, token):
            # Update user's password
            new_password = request.data.get('password')
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                planning_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"message": "Project Planning Data created successfully"},
            status=status.HTTP_201_CREATED,
        )
class PersonnelExpensesList(generics.ListCreateAPIView):
    serializer_class = GetUserMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self): 
        return User.objects.all()
    
class FetchPersonnelView(generics.ListAPIView):
    queryset = PersonnelUser.objects.all()
    serializer_class = PersonnelUserSerializer
    permission_classes = [AllowAny]
    
class StorePersonnelPlanning(generics.CreateAPIView):
    serializer_class = PlanningAssignPersonnelDataSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = JSONParser().parse(request)
        
        # Check if the incoming data is a list
        if not isinstance(data, list):
            return JsonResponse({"messagessss": "Expected a list of items."}, status=status.HTTP_400_BAD_REQUEST)
        
        responses = []
        
        for item in data:
            try:
                planning_project = PlanningProjectData.objects.get(planning_project_id=item['planning_project_id'])
                user = User.objects.get(user_id=item['assignment_user_id'])
                planning_data = {
                    'planning_project_id': planning_project.planning_project_id,
                    'client_id': item['client_id'],
                    'assignment_user_id': user.user_id,
                    'assignment_ratio': item['assignment_ratio'],
                    'assignment_unit_price': item['assignment_unit_price'],
                    'year': timezone.now().year,
                    'assignment_start_date': timezone.now().date(),
                    'assignment_end_date': timezone.now().date(),
                    'registration_date': timezone.now().date(),
                    'registration_user': request.user.username
                }
                serializer = PlanningAssignPersonnelDataSerializer(data=planning_data)
                if serializer.is_valid():
                    serializer.save()
                    responses.append({"message": "Personnel Planning Data created successfully."})
                else:
                    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except PlanningProjectData.DoesNotExist:
                return JsonResponse({"message": "Planning project not found."}, status=status.HTTP_404_NOT_FOUND)
            except User.DoesNotExist:
                return JsonResponse({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return JsonResponse({"messagessss": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse(responses, safe=False, status=status.HTTP_201_CREATED)
    
class ViewAllPlanning(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        expenses = Expenses.objects.all()
        cost_of_sales = CostOfSales.objects.all()
        planning_assign = PlanningAssignData.objects.all()
        planning_project_data = PlanningProjectData.objects.all()
        expenses_serializer = ExpensesSerializer(expenses, many=True)
        cost_of_sales_serializer = CostOfSalesSerializer(cost_of_sales, many=True)
        planning_assign_serializer = PlanningAssignPersonnelDataSerializer(planning_assign, many=True)
        planning_project_data_serializer = GetPlanningProjectDataSerializers(planning_project_data, many=True)
    
        combined_data = {
            'expenses': expenses_serializer.data,
            'cost_of_sales': cost_of_sales_serializer.data,
            'planning_assign_data': planning_assign_serializer.data,
            'planning_project_data': planning_project_data_serializer.data
        }
        
        print(combined_data)

        return Response(combined_data)
    
class CostOfSalesList(generics.ListAPIView):
    queryset = CostOfSales.objects.all()
    serializer_class = CostOfSalesSerializer
    permission_classes = [IsAuthenticated]



class CreateCostOfSales(generics.CreateAPIView):
    serializer_class = CustomCostOfSalesSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse(status=status.HTTP_400_BAD_REQUEST)
        
        responses = []
        
        for item in data:
            try:
                cos = {
                    'year' : datetime.now().year,
                    'month': item['month'],
                    'outsourcing_costs': item['outsourcing_costs'],
                    'communication_costs': item['communication_costs'],
                    'cost_of_sales': item['cost_of_sales'],
                    'product_purchases': item['product_purchases'],
                    'work_in_progress': item['work_in_progress'],
                    'purchases': item['purchases'],
                    'dispatch_labor_costs': item['dispatch_labor_costs'],
                    'amortization': item['amortization'],
                }
                serializer = CustomCostOfSalesSerializer(data=cos)
                if serializer.is_valid():
                    serializer.save()
                    responses.append({"message": "Created successfully."})
                else:
                    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return JsonResponse({"messages": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse(responses, safe=False, status=status.HTTP_201_CREATED)
    

class CreateExpenses(generics.CreateAPIView):
    serializer_class = CustomExpensesSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse(status=status.HTTP_400_BAD_REQUEST)
        responses = []
        for item in data:
            try:
                exp = {
                    'year' : datetime.now().year,
                    'month': item['month'],
                    'taxes_and_public_charges': item['taxes_and_public_charges'],
                    'communication_expenses': item['communication_expenses'],
                    'advertising_expenses': item['advertising_expenses'],
                    'consumables_expenses': item['consumables_expenses'],
                    'depreciation_expenses': item['depreciation_expenses'],
                    'utilities_expenses': item['utilities_expenses'],
                    'entertainment_expenses': item['entertainment_expenses'],
                    'rent': item['rent'],
                    'travel_expenses': item['travel_expenses'],
                    'payment_fees': item['payment_fees'],
                    'remuneration': item['remuneration'],
                }
                serializer = CustomExpensesSerializer(data=exp)
                if serializer.is_valid():
                    serializer.save()
                    responses.append({"message": "Created successfully."})
                else:
                    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return JsonResponse({"messagessss": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse(responses, safe=False, status=status.HTTP_201_CREATED)

    