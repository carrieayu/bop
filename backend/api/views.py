import json
from django.shortcuts import render
from django.contrib.auth.models import User as AuthUser
from rest_framework.response import Response
from rest_framework import generics, status
from django.http import JsonResponse
from rest_framework.parsers import JSONParser
from django.db import IntegrityError
from .serializers import (
    # Cost Of Sales
    CostOfSalesSerializer,
    ExpensesResultsCreateSerializer,
    ExpensesResultsListSerializer,
    # CustomCostOfSalesSerializer, # NOT BEING USED
    # Projects
    ProjectsListSerializer,
    ProjectsCreateSerializer,
    ProjectsUpdateSerializer,
    # Master Clients
    MasterClientListSerializer,
    MasterClientCreateSerializer,
    MasterClientUpdateSerializer,  
    MasterClientDeleteSerializer,
    # Expenses
    ExpensesListSerializer,
    ExpensesCreateSerializer,
    ExpensesUpdateSerializer,
    # Employees
    EmployeesListSerializer,
    EmployeesCreateSerializer,
    EmployeesUpdateSerializer,
    # Employee Expenses
    EmployeeExpensesListSerializer,
    EmployeeExpensesCreateSerializer,
    EmployeeExpensesDeleteSerializer,
    # Master Business Divisions
    MasterBusinessDivisionSerializer,
    # Master Companies
    MasterCompaniesListSerializer,
    MasterCompaniesCreateSerializer,
    MasterCompaniesUpdateSerializer,
    # Planning
    PlanningDisplayByProjectstSerializer,
    UpdatePlanningSerializer,
    # Users
    UserSerializer,

    # ------------------------
    # NOT IN USE CURRENTLY
    # ------------------------
    # Results
    ResultsCreateSerializer,
    ResultsListSerializer,
    ResultsUpdateSerializer,
    # ------------------------
    
    # ------------------------
    # CHECK: DO WE NEED ANY OF THESE? UNUSED SERIALIZERS
    # ------------------------
    # MasterClientSerializer,
    # ProjectsUpdateSerializer,
    # ProjectsUpdateSerializer,
    AuthenticationSerializer,
    CreateTableListSerializers,
    GetUserMasterSerializer,
    AllPlanningSerializer,
)
from .serializers import CreateTableListSerializers, UserSerializer, AuthenticationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    CostOfSales,
    Expenses,
    ExpensesResults,
    MasterBusinessDivision,
    MasterClient,
    MasterCompany,
    Projects,
    Results,
    Employees,
    EmployeeExpenses
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

# Create your views here.

# Master Companies
class MasterCompaniesList(generics.ListAPIView):
    queryset = MasterCompany.objects.all()
    serializer_class = MasterCompaniesListSerializer
    permission_classes = [AllowAny]
class MasterCompaniesCreate(generics.CreateAPIView):
    serializer_class = MasterCompaniesCreateSerializer
    permission_classes = [AllowAny]

class MasterCompaniesUpdate(generics.UpdateAPIView):
    serializer_class = MasterCompaniesUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return MasterCompany.objects.filter(company_id=id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"message": "data updated !!!"}, status=status.HTTP_200_OK)

class MasterCompaniesDelete(generics.DestroyAPIView):
    queryset = MasterCompany.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return MasterCompany.objects.filter(company_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "deleted successfully"}, status=status.HTTP_200_OK
            )
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)

# Master Business Divisions
class MasterBusinessDivisionsList(generics.ListAPIView):
    queryset = MasterBusinessDivision.objects.all()
    serializer_class = MasterBusinessDivisionSerializer
    permission_classes = [AllowAny]

class MasterBusinessDivisionsCreate(generics.CreateAPIView):
    serializer_class = MasterBusinessDivisionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data  # Retrieve the incoming data
        if not isinstance(data, list):  # Ensure it's an array
            return Response({"error": "Expected a list of data"}, status=status.HTTP_400_BAD_REQUEST)

        error_responses = []  # To store any errors for duplicates or missing references
        valid_business_divisions = []  # To store valid business division data for later saving

        # First Pass: Validation without saving
        for business_division in data:
            try:
                # Get the related company and auth_user by their IDs
                company = MasterCompany.objects.get(pk=business_division['company_id'])
                auth_user = AuthUser.objects.get(pk=business_division['auth_user_id'])

                # Check for duplicates
                if MasterBusinessDivision.objects.filter(
                        business_division_name=business_division['business_division_name'], 
                        company=company).exists():
                    error_responses.append({
                        'business_division_name': business_division['business_division_name']
                    })
                    continue  # Skip this business division if a duplicate is found

                # If valid, store data for saving later
                valid_business_divisions.append({
                    'business_division_name': business_division['business_division_name'],
                    'company': company,
                    'auth_user': auth_user
                })

            except MasterCompany.DoesNotExist:
                error_responses.append(f"Company with ID {business_division['company_id']} does not exist")
            except AuthUser.DoesNotExist:
                error_responses.append(f"User with ID {business_division['auth_user_id']} does not exist")

        # If any errors exist, return the errors and do not save anything
        if error_responses:
            return Response({"errors": error_responses}, status=status.HTTP_409_CONFLICT)

        # If no errors, save all valid business divisions in one go
        created_business_divisions = []
        for division in valid_business_divisions:
            new_business_division = MasterBusinessDivision(
                business_division_name=division['business_division_name'],
                company=division['company'],
                auth_user=division['auth_user']
            )
            new_business_division.save()

            # Serialize the saved object for the response
            serializer = MasterBusinessDivisionSerializer(new_business_division)
            created_business_divisions.append(serializer.data)

        return Response({"message": "Business Divisions Created", "data": created_business_divisions},
                        status=status.HTTP_201_CREATED)
    
class MasterBusinessDivisionsUpdate(generics.UpdateAPIView):
    queryset = MasterBusinessDivision.objects.all()
    serializer_class = MasterBusinessDivisionSerializer
    permission_classes = [IsAuthenticated]
    
    def put(self, request, *args, **kwargs):
        data = request.data
        try:
            for item in data:
                try:
                    business_division = MasterBusinessDivision.objects.get(business_division_id=item['business_division_id'])
                    serializer = MasterBusinessDivisionSerializer(business_division, data=item, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                except MasterBusinessDivision.DoesNotExist:
                    return Response({'error': 'Business division not found'}, status=status.HTTP_404_NOT_FOUND)
                
            return Response({'message': 'Business divisions updated successfully'}, status=status.HTTP_200_OK)
        except IntegrityError as e:
            if 'Duplicate entry' in str(e):
                return Response({'error': 'Business Division already exists.'}, status=409)
            return Response({'error': str(e)}, status=400)

class MasterBusinessDivisionsDelete(generics.DestroyAPIView):
    queryset = MasterBusinessDivision.objects.all()
    permission_classes = [AllowAny]

    def get_queryset(self):
        business_division_id = self.kwargs.get("pk")
        return MasterBusinessDivision.objects.filter(business_division_id=business_division_id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "deleted successfully"}, status=status.HTTP_200_OK
            )
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)

# In "Employees List And Edit Screen" [Edit Mode]:
# Retrieve Business Divisions Connected to Company Selected in [会社名・Company_Name] Pulldown.
class BusinessDivisionsOfCompany(generics.ListAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        company_id = request.query_params.get('company_id')
        if company_id:
            # Filter business divisions by the selected company ID
            divisions = MasterBusinessDivision.objects.filter(company_id=company_id).values('business_division_id', 'business_division_name')
            return JsonResponse(list(divisions), safe=False)
        
        # If no company_id is passed, return an empty list
        return JsonResponse([], safe=False)  

# Master Clients
class MasterClientsList(generics.ListAPIView):
    serializer_class = MasterClientListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MasterClient.objects.all()

class MasterClientsCreate(generics.CreateAPIView):
    queryset = MasterClient.objects.all()
    serializer_class = MasterClientCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        if not isinstance(data, list):  # Ensure it's a list
            return Response({"error": "Expected a list of data"}, status=status.HTTP_400_BAD_REQUEST)

        error_responses = []  # To store any errors for duplicates or validation issues
        valid_clients = []    # To store valid clients for later saving
        
        # First Pass: Validation without saving
        for client in data:
            client_name = client.get('client_name')  # Get the client name from the current data

            # Check for duplicates in the DB
            existing_client = MasterClient.objects.filter(client_name=client_name).first()
            if existing_client:
                error_responses.append({
                    "client_name": existing_client.client_name,
                    "message": f"Client with name '{client_name}' already exists."
                })
                continue  # Skip this client if a duplicate is found

            # Validate the data using serializer without saving
            serializer = self.get_serializer(data=client)
            if serializer.is_valid():
                valid_clients.append(client)  # Store valid client data to save later
            else:
                error_responses.append(serializer.errors)  # Capture validation errors

        # If any errors exist, return the errors and do not save anything
        if error_responses:
            return Response({"errors": error_responses}, status=status.HTTP_409_CONFLICT)

        # If no errors, save all valid clients in one go
        created_clients = []
        for client in valid_clients:
            serializer = self.get_serializer(data=client)
            serializer.is_valid(raise_exception=True)
            serializer.save()  # Save the client to the DB
            created_clients.append(serializer.data)  # Append saved client data to response

        return Response({"message": "Clients Created", "data": created_clients},
                        status=status.HTTP_201_CREATED)
   
class MasterClientsUpdate(generics.UpdateAPIView):
    queryset = MasterClient.objects.all()
    serializer_class = MasterClientUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        received_data = request.data
        print(received_data)
        try: 
            for client_data in received_data: 
                client_id = client_data.get('client_id')  
                
                try:
                    client = MasterClient.objects.get(client_id=int(client_id))
                    for field, value in client_data.items():
                        if field != 'client_id':
                            setattr(client, field, value) 
                    client.save() 

                except AuthUser.DoesNotExist:
                    return Response({"error": f"Client with ID {client_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

            return Response({"success": "Users updated successfully."}, status=status.HTTP_200_OK)
        except IntegrityError as e:
            if 'Duplicate entry' in str(e):
                return Response({'error': 'Client name already exists.'}, status=409)
            return Response({'error': str(e)}, status=400)
    
class MasterClientsDelete(generics.DestroyAPIView):
    queryset = MasterClient.objects.all()
    serializer_class = MasterClientDeleteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
            id = self.kwargs.get("pk")
            return MasterClient.objects.filter(client_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "deleted successfully"}, status=status.HTTP_200_OK
            )
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)

# Users 
# (table = auth_user in the database)
class UsersList(generics.ListAPIView):
    queryset = AuthUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
class UsersCreate(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UsersUpdate(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    queryset = AuthUser.objects.all()

    def update(self, request, *args, **kwargs):
        received_data = request.data

        for user_data in received_data: 
            user_id = user_data.get('id')  
            
            try:
                user = AuthUser.objects.get(id=int(user_id))
                for field, value in user_data.items():
                    if field != 'id':
                        setattr(user, field, value) 
                user.save() 

            except AuthUser.DoesNotExist:
                return Response({"error": f"User with ID {user_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"success": "Users updated successfully."}, status=status.HTTP_200_OK)
    

class UsersDelete(generics.DestroyAPIView):
        queryset = AuthUser.objects.all()
        permission_classes = [AllowAny]

        def get_queryset(self):
            id = self.kwargs.get("pk")
            return AuthUser.objects.filter(id=id)

        def destroy(self, request, *args, **kwargs):
            try:
                instance = self.get_object()
                instance.delete()
                return Response(
                    {"message": "deleted successfully"}, status=status.HTTP_200_OK
                )
            except:
                return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)

# Employees
class EmployeesList(generics.ListAPIView):
    queryset = Employees.objects.all()
    serializer_class = EmployeesListSerializer
    permission_classes = [IsAuthenticated]

class EmployeesCreate(generics.CreateAPIView):
    queryset = Employees.objects.all()
    serializer_class = EmployeesCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        if not isinstance(data, list):  # Ensure it's a list
            return Response({"error": "Expected a list of data"}, status=status.HTTP_400_BAD_REQUEST)

        error_responses = []  # To store any errors for duplicates or validation issues
        valid_employees = []  # To store valid employee data for later saving
        
        # First Pass: Validation without saving
        for employee in data:
            email = employee.get('email')  # Get the employee email from the current data
            # Check for duplicates in the DB
            existing_employee = Employees.objects.filter(email=email).first()
            if existing_employee:
                error_responses.append({
                    "email": existing_employee.email,
                    "message": f"Employee with email '{email}' already exists."
                })
                continue  # Skip this employee if a duplicate is found

            # Validate the data using serializer without saving
            serializer = self.get_serializer(data=employee)
            if serializer.is_valid():
                valid_employees.append(employee)  # Store valid employee data to save later
            else:
                error_responses.append(serializer.errors)  # Capture validation errors

        # If any errors exist, return the errors and do not save anything
        if error_responses:
            return Response({"errors": error_responses}, status=status.HTTP_400_BAD_REQUEST)

        # If no errors, save all valid employees in one go
        created_employees = []
        for employee in valid_employees:
            serializer = self.get_serializer(data=employee)
            serializer.is_valid(raise_exception=True)
            serializer.save()  # Save the employee to the DB
            created_employees.append(serializer.data)  # Append saved employee data to response

        return Response({"message": "Employees Created", "data": created_employees},
                        status=status.HTTP_201_CREATED)

class EmployeesUpdate(generics.UpdateAPIView):
    serializer_class = EmployeesUpdateSerializer
    permission_classes = [AllowAny]
    queryset = Employees.objects.all()

    def update(self, request, *args, **kwargs):
        received_data = request.data
        try:
            for index, employee_data in received_data.items():
                employee_id = employee_data.get('employee', {}).get('employee_id')
                try:
                    employee = Employees.objects.get(employee_id=employee_id)
                    business_division_id = employee_data.get('employee', {}).get('business_division_id')
                    company_id = employee_data.get('employee', {}).get('company_id')
                    if business_division_id:
                        try:
                            business_division_instance = MasterBusinessDivision.objects.get(pk=business_division_id)
                            employee.business_division = business_division_instance
                        except MasterBusinessDivision.DoesNotExist:
                            return Response({"error": f"Business division with ID {business_division_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
                    if company_id:
                        try:
                            company_instance = MasterCompany.objects.get(pk=company_id)
                            employee.company = company_instance
                        except MasterCompany.DoesNotExist:
                            return Response({"error": f"Company with ID {company_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
                    for field, value in employee_data.get('employee', {}).items():
                        if field not in ['employee_id', 'auth_user', 'auth_user_id' , 'business_division', 'company']:
                            setattr(employee, field, value)
                            
                    employee.save()

                except Employees.DoesNotExist:
                    return Response({"error": f"Employee with ID {employee_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

            return Response({"success": "Employee updated successfully."}, status=status.HTTP_200_OK)
        except IntegrityError as e:
            if 'Duplicate entry' in str(e):
                return Response({'error': 'Email already exists.'}, status=409)
            return Response({'error': str(e)}, status=400)

class EmployeesDelete(generics.DestroyAPIView):
        queryset = Employees.objects.all()
        permission_classes = [AllowAny]

        def get_queryset(self):
            id = self.kwargs.get("pk")
            return Employees.objects.filter(employee_id=id)

        def destroy(self, request, *args, **kwargs):
            try:
                instance = self.get_object()
                instance.delete()
                return Response(
                    {"message": "deleted successfully"}, status=status.HTTP_200_OK
                )
            except:
                return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)

# Employees List And Edit Screen [Edit Mode]. 
class EmployeesEdit(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Employees.objects.all()
    serializer_class = EmployeesListSerializer
    
    def get(self, request):
        print('business division called employees edit')
        # Get all employees
        employees = Employees.objects.all()
        employee_data = []
        
        # Loop through each employee to retrieve their respective business divisions
        for employee in employees:
            business_divisions = MasterBusinessDivision.objects.filter(company_id=employee.company_id).values('business_division_id', 'business_division_name')
            employee_data.append({
                'employee': {
                    'employee_id': employee.employee_id,
                    'first_name': employee.first_name,
                    'last_name': employee.last_name,
                    'type': employee.type,
                    'email': employee.email,
                    'salary': employee.salary,
                    'executive_renumeration':employee.executive_renumeration,
                    'company_id': employee.company_id,
                    'business_division_id': employee.business_division_id,
                    'statutory_welfare_expense':employee.statutory_welfare_expense,
                    'welfare_expense':employee.welfare_expense,
                    'bonus_and_fuel_allowance':employee.bonus_and_fuel_allowance,
                    'insurance_premium':employee.insurance_premium,
                    'auth_user_id': employee.auth_user_id,
                    'created_at': employee.created_at,
                    'updated_at': employee.updated_at,
                },
                'business_divisions': list(business_divisions)
            })
        
        return JsonResponse(employee_data, safe=False)

# Projects
class ProjectsList(generics.ListCreateAPIView):
    queryset = Projects.objects.all()
    serializer_class = ProjectsListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Projects.objects.all()

class ProjectsCreate(generics.CreateAPIView):
    serializer_class = ProjectsCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse({"detail": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        existing_entries = []
        for item in data:
            client_id = item.get('client')  # Assuming 'client' is an ID
            project_name = item.get('project_name')
            month = item.get('month')
            year = item.get('year')
            business_division_id = item.get('business_division')  # Assuming 'business_division' is an ID

            # Check if an entry with the same details exists
            existing_entry = Projects.objects.filter(
                year=year,
                month=month,
                client=client_id,
                project_name=project_name,
                business_division=business_division_id
            ).first()

            if existing_entry:
                client_name = existing_entry.client.client_name if existing_entry.client else 'Unknown Client'
                business_division_name = existing_entry.business_division.business_division_name if existing_entry.business_division else 'Unknown Division'

                existing_entries.append({
                    "client": client_name,
                    "project_name": project_name,
                    "month": month,
                    "year": year,
                    "business_division": business_division_name
                })

        if existing_entries:
            return JsonResponse(
                {
                    "detail": "Some projects are already registered.",
                    "existingEntries": existing_entries
                },
                status=status.HTTP_409_CONFLICT
            )

        # Proceed with saving data if no duplicates
        responses = []
        for item in data:
            try:
                serializer = ProjectsCreateSerializer(data=item)
                if serializer.is_valid():
                    serializer.save()
                    responses.append({"message": f"Created successfully for {item['project_name']}."})
                else:
                    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(responses, safe=False, status=status.HTTP_201_CREATED)

    def put(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse({"detail": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        responses = []
        for item in data:
            try:
                clientName = item.get('client')
                projectName = item.get('project_name')
                month = item.get('month')
                year = item.get('year')
                businessDivision = item.get('business_division')

                # Check if an entry with the same details exists
                existing_entry = Projects.objects.filter(
                    year=year,
                    month=month,
                    client=clientName,
                    project_name=projectName,
                    business_division=businessDivision
                ).first()

                if existing_entry:
                    # Update existing entry
                    serializer = ProjectsCreateSerializer(existing_entry, data=item, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        responses.append({"message": f"Updated successfully for {projectName} in {month}/{year}."})
                    else:
                        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # If no existing entry, create a new one
                    serializer = ProjectsCreateSerializer(data=item)
                    if serializer.is_valid():
                        serializer.save()
                        responses.append({"message": f"Created successfully for {projectName} in {month}/{year}."})
                    else:
                        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(responses, safe=False, status=status.HTTP_200_OK)


# Previous Class Name: ProjectsDataUpdate 
# Current Name: ProjectsUpdate
class ProjectsUpdate(generics.UpdateAPIView):
    serializer_class = ProjectsUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return Projects.objects.filter(project_id=id)

    def update(self, request, *args, **kwargs):
        print("ProjectsDATAUpdate #2 What is this?");

        client_data = request.data
        try :
            for client in client_data: 
                project_id = client.get('project_id')
                try:
                    
                    projects = Projects.objects.get(project_id=int(project_id))
                    business_division_id = client.get('business_division')
                    client_id = client.get('client')
                    if business_division_id:
                        try:
                            business_division_instance = MasterBusinessDivision.objects.get(pk=business_division_id)
                            projects.business_division = business_division_instance
                        except MasterBusinessDivision.DoesNotExist:
                            return Response({"error": f"Business division with ID {business_division_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
                    if client_id:
                        try:
                            client_instance = MasterClient.objects.get(pk=client_id)
                            projects.client = client_instance
                        except MasterClient.DoesNotExist:
                            return Response({"error": f"Clients with ID {client_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
                    for field, value in client.items():
                        if field not in ['project_id', 'business_division', 'client']:
                            setattr(projects, field, value)
                            
                    projects.save()

                except Projects.DoesNotExist:
                    return Response({"error": f"Projects with ID {project_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

            return Response({"success": "Projects updated successfully."}, status=status.HTTP_200_OK)
        except IntegrityError as e:
            if 'Duplicate entry' in str(e):
                return Response({'error': 'Project Name already exists.'}, status=409)
            return Response({'error': str(e)}, status=400)
        
class ProjectsDelete(generics.DestroyAPIView):
    queryset = Projects.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return Projects.objects.filter(project_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "planning deleted successfully"}, status=status.HTTP_200_OK
            )
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)

# Expenses
class ExpensesList(generics.ListAPIView):
    queryset = Expenses.objects.all()
    serializer_class = ExpensesListSerializer
    permission_classes = [AllowAny]


    def get_queryset(self):
        return Expenses.objects.all()

class ExpensesCreate(generics.CreateAPIView):
    serializer_class =ExpensesCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse({"detail": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for duplicates before saving
        existing_entries = []
        for item in data:
            year = item.get('year')
            month = item.get('month')
            existing_entry = Expenses.objects.filter(year=year, month=month).first()  # Get the actual entry
            if existing_entry:
                existing_entries.append((year, month))  # Store year and month as a tuple

        if existing_entries:
            # Return all existing year and month pairs
            existing_months_years = [{"year": entry[0], "month": entry[1]} for entry in existing_entries]

            return JsonResponse(
                {
                    "detail": "選択された月は既にデータが登録されています。",
                    "existingEntries": existing_months_years  
                },
                status=status.HTTP_409_CONFLICT
            )

        # If no duplicates, proceed with saving data
        responses = []
        for item in data:
            try:
                serializer =ExpensesCreateSerializer(data=item)
                if serializer.is_valid():
                    serializer.save()
                    responses.append({"message": f"Created successfully for month {item['month']}, year {item['year']}."})
                else:
                    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(responses, safe=False, status=status.HTTP_201_CREATED)

    def put(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse({"detail": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        responses = []
        for item in data:
            try:
                year = item.get('year')
                month = item.get('month')

                # Check if an entry with the same year and month exists
                existing_entry = Expenses.objects.filter(year=year, month=month).first()

                if existing_entry:
                    # Update existing entry (except year and month)
                    serializer =ExpensesCreateSerializer(existing_entry, data=item, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        responses.append({"message": f"Updated successfully for month {month}, year {year}."})
                    else:
                        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # If no existing entry, create a new one
                    serializer =ExpensesCreateSerializer(data=item)
                    if serializer.is_valid():
                        serializer.save()
                        responses.append({"message": f"Created successfully for month {month}, year {year}."})
                    else:
                        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(responses, safe=False, status=status.HTTP_200_OK)

class ExpensesUpdate(generics.UpdateAPIView):
    serializer_class = ExpensesUpdateSerializer
    permission_classes = [IsAuthenticated]
    queryset = Expenses.objects.all()

    def update(self, request, *args, **kwargs):
        received_data = request.data  # This is expected to be a list of expense data

        for expense_data in received_data:
            expense_id = expense_data.get('expense_id')  # Adjusted to match your model
            try:
                # Fetch the existing record based on expense_id
                expense = Expenses.objects.get(expense_id=expense_id)
                # Update each field except for the primary key
                for field, value in expense_data.items():
                    if field not in ['expense_data', 'month']:  # Skip primary key and month field
                        setattr(expense, field, value)
                
                expense.save()  # Save the updated record
            except Expenses.DoesNotExist:
                return Response({"error": f"Expense with ID {expense_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"success": "Expenses updated successfully."}, status=status.HTTP_200_OK)


class ExpensesDelete(generics.DestroyAPIView):
    queryset = Expenses.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs.get("pk")
        return Expenses.objects.filter(expense_id=pk)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({"message": "deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Expenses.DoesNotExist:
            return Response({"message": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": "failed", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Expense Results

class ExpensesResultsList(generics.ListAPIView):
    queryset = ExpensesResults.objects.all()
    serializer_class = ExpensesResultsListSerializer
    permission_classes = [AllowAny]


    def get_queryset(self):
        return ExpensesResults.objects.all()

class ExpensesResultsCreate(generics.CreateAPIView):
    serializer_class =ExpensesResultsCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse({"detail": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for duplicates before saving
        existing_entries = []
        for item in data:
            year = item.get('year')
            month = item.get('month')
            existing_entry = ExpensesResults.objects.filter(year=year, month=month).first()  # Get the actual entry
            if existing_entry:
                existing_entries.append((year, month))  # Store year and month as a tuple

        if existing_entries:
            # Return all existing year and month pairs
            existing_months_years = [{"year": entry[0], "month": entry[1]} for entry in existing_entries]

            return JsonResponse(
                {
                    "detail": "選択された月は既にデータが登録されています。",
                    "existingEntries": existing_months_years  
                },
                status=status.HTTP_409_CONFLICT
            )

        # If no duplicates, proceed with saving data
        responses = []
        for item in data:
            try:
                serializer =ExpensesResultsCreateSerializer(data=item)
                if serializer.is_valid():
                    serializer.save()
                    responses.append({"message": f"Created successfully for month {item['month']}, year {item['year']}."})
                else:
                    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(responses, safe=False, status=status.HTTP_201_CREATED)

    def put(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse({"detail": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        responses = []
        for item in data:
            try:
                year = item.get('year')
                month = item.get('month')

                # Check if an entry with the same year and month exists
                existing_entry = ExpensesResults.objects.filter(year=year, month=month).first()

                if existing_entry:
                    # Update existing entry (except year and month)
                    serializer =ExpensesResultsCreateSerializer(existing_entry, data=item, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        responses.append({"message": f"Updated successfully for month {month}, year {year}."})
                    else:
                        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # If no existing entry, create a new one
                    serializer =ExpensesCreateSerializer(data=item)
                    if serializer.is_valid():
                        serializer.save()
                        responses.append({"message": f"Created successfully for month {month}, year {year}."})
                    else:
                        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(responses, safe=False, status=status.HTTP_200_OK)

class ExpensesResultsUpdate(generics.UpdateAPIView):
    serializer_class = ExpensesUpdateSerializer
    permission_classes = [IsAuthenticated]
    queryset = ExpensesResults.objects.all()

    def update(self, request, *args, **kwargs):
        received_data = request.data  # This is expected to be a list of expense data

        for expense_results_data in received_data:
            expense_result_id = expense_results_data.get('expense_result_id')  # Adjusted to match your model
            try:
                # Fetch the existing record based on expense_id
                expenseResults = ExpensesResults.objects.get(expense_result_id=expense_result_id)
                # Update each field except for the primary key
                for field, value in expense_results_data.items():
                    if field not in ['expense_data', 'month']:  # Skip primary key and month field
                        setattr(expenseResults, field, value)
                
                expenseResults.save()  # Save the updated record
            except Expenses.DoesNotExist:
                return Response({"error": f"Expense with ID {expense_result_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"success": "Expenses updated successfully."}, status=status.HTTP_200_OK)


class ExpensesResultsDelete(generics.DestroyAPIView):
    queryset = ExpensesResults.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs.get("pk")
        return ExpensesResults.objects.filter(expense_result_id=pk)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({"message": "deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except ExpensesResults.DoesNotExist:
            return Response({"message": "ExpenseResults not found"}, status=status.HTTP_404_NOT_FOUND)
        except ExpensesResults as e:
            return Response({"message": "failed", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Password
class PasswordForgotView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email').strip()

        try:
            user = AuthUser.objects.get(email__iexact=email)
        except AuthUser.DoesNotExist:
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
        from_email = 'shininoue81@gmail.com'  # Update with your email
        recipient_list = [email]
        
        send_mail(subject, message, from_email, recipient_list)

        return Response({"message": "Password reset link sent successfully."}, status=status.HTTP_200_OK)
    
    def put(self, request, uidb64, token):
        # Decode uidb64 to get user id
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = AuthUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, AuthUser.DoesNotExist):
            user = None

        if user is not None and PasswordResetTokenGenerator().check_token(user, token):
            new_password = request.data.get('password')
            
            if new_password:
                user.set_password(new_password) 
                user.save() 
                return Response({"success": "Password updated successfully"}, status=200)
            else:
                return Response({"error": "Password not provided"}, status=400)
        else:
            return Response({"error": "Invalid token or user does not exist"}, status=400)

# Employee Expenses
class EmployeeExpensesList(generics.ListAPIView):
    serializer_class = EmployeeExpensesListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self): 
        # Get all employee expenses along with related employee and project information
        return EmployeeExpenses.objects.select_related('employee', 'project').all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        # Debugging: print the serialized data
        # print(serializer.data)

        employee_expenses_data = []
        for expense in serializer.data:
            # Ensure expense is a dictionary before accessing
            if isinstance(expense, dict):
                employee = expense.get('employee')  # This might be None
                project = expense.get('project')  # This might be None

                # Safely get the employee and project data
                employee_last_name = employee['last_name'] if employee else ''
                employee_first_name = employee['first_name'] if employee else ''
                employee_type = employee['type'] if employee else ''
                employee_salary = employee['salary'] if employee else 0  # Default to 0 if None
                employee_executive_renumeration = employee['executive_renumeration'] if employee else 0
                employee_statutory_welfare_expense = employee['statutory_welfare_expense'] if employee else 0
                employee_welfare_expense = employee['welfare_expense'] if employee else 0
                employee_insurance_premium = employee['insurance_premium'] if employee else 0
                employee_id = employee['employee_id'] if project else '' 
                project_name = project['project_name'] if project else ''  # Default to empty string if None
                project_id = project['project_id'] if project else ''  
                # print("project",project['project_id'])

                employee_expenses_data.append({
                    'employee_expense_id': expense.get('employee_expense_id', ''),
                    'year': expense.get('year', ''),
                    'month': expense.get('month', ''),
                    'employee_last_name': employee_last_name,
                    'employee_first_name': employee_first_name,
                    'employee_type': employee_type,
                    'employee_salary': employee_salary,
                    'executive_renumeration': employee_executive_renumeration,
                    'statutory_welfare_expense':employee_statutory_welfare_expense,
                    'welfare_expense':employee_welfare_expense,
                    'insurance_premium':employee_insurance_premium,
                    'employee_id': employee_id,
                    'project_name': project_name,
                    'project_id': project_id
                })

        return Response(employee_expenses_data)

class EmployeeExpensesCreate(generics.CreateAPIView):
    serializer_class = EmployeeExpensesCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        employee_expenses_data = request.data

        if not isinstance(employee_expenses_data, list):
            return Response({'detail': 'Invalid data format. Expecting a list.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not employee_expenses_data:
            return Response({'detail': 'No employee expenses data provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # First loop: Validate all data and check for duplicates
        for expense_data in employee_expenses_data:
            employee_id = expense_data.get('employee')
            if not employee_id:
                return Response({'detail': 'Employee ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

            project_entries = expense_data.get('projectEntries', [])
            if not isinstance(project_entries, list):
                return Response({'detail': 'projectEntries must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

            for entry in project_entries:
                if not entry.get('projects') or not entry.get('clients'):
                    return Response({'detail': 'Project ID and Client ID cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    # Check if employee, client, and project exist
                    client = MasterClient.objects.get(pk=entry['clients'])
                    project = Projects.objects.get(pk=entry['projects'])
                    employee = Employees.objects.get(pk=employee_id)

                    # Check for existing expense
                    existing_expense = EmployeeExpenses.objects.filter(
                        employee=employee,
                        project=project,
                        year=entry.get('year', '2001'),
                        month=entry.get('month', '01')
                    ).first()

                    if existing_expense:
                        employee_name = f"{employee.first_name} {employee.last_name}"
                        year = entry.get('year', '2001')
                        month = entry.get('month', '01')
                        return Response({
                            'detail': f'There is already an existing expense for {employee_name} for {month}/{year}.'
                            }, status=status.HTTP_400_BAD_REQUEST)

                except MasterClient.DoesNotExist:
                    return Response({"error": f"Client with ID {entry['clients']} does not exist"},
                                    status=status.HTTP_404_NOT_FOUND)
                except Projects.DoesNotExist:
                    return Response({"error": f"Project with ID {entry['projects']} does not exist"},
                                    status=status.HTTP_404_NOT_FOUND)
                except Employees.DoesNotExist:
                    return Response({"error": f"Employee with ID {employee_id} does not exist"},
                                    status=status.HTTP_404_NOT_FOUND)
                except AuthUser.DoesNotExist:
                    return Response({"error": f"User with ID {entry.get('auth_id')} does not exist"},
                                    status=status.HTTP_404_NOT_FOUND)

        # Second loop: If no conflicts, save all data
        created_expenses = []
        for expense_data in employee_expenses_data:
            employee_id = expense_data.get('employee')
            project_entries = expense_data.get('projectEntries', [])

            for entry in project_entries:
                client = MasterClient.objects.get(pk=entry['clients'])
                project = Projects.objects.get(pk=entry['projects'])
                employee = Employees.objects.get(pk=employee_id)
                auth_user = AuthUser.objects.get(pk=entry.get('auth_id')) if entry.get('auth_id') else None

                # Create and save new expense
                new_expense = EmployeeExpenses(
                    client=client,
                    project=project,
                    employee=employee,
                    auth_user=auth_user,
                    year=entry.get('year', '2001'),
                    month=entry.get('month', '01')
                )
                new_expense.save()

                serializer = EmployeeExpensesCreateSerializer(new_expense)
                created_expenses.append(serializer.data)

        return Response({
            "employeeExpenses": created_expenses
        }, status=status.HTTP_201_CREATED)

class EmployeeExpensesDelete(generics.DestroyAPIView):
    serializer_class = EmployeeExpensesDeleteSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            return EmployeeExpenses.objects.get(employee_expense_id=pk)
        except EmployeeExpenses.DoesNotExist:
            return None

    def destroy(self, request, pk, *args, **kwargs):
        project_id = request.query_params.get('project_id')
        instance = self.get_object()

        if instance is None:
            return Response({"message": "Employee expense not found."}, status=status.HTTP_404_NOT_FOUND)

        # Debugging: Log the current instance and project details
        print(f"Current Employee Expense: {instance.employee_expense_id}")
        print(f"Associated Project: {instance.project.project_id if instance.project else 'None'}")
        print(f"Provided Project ID: {project_id}")

        if project_id:
            # If a project_id is provided, check if it matches the instance's project
            if instance.project and str(instance.project.project_id) == project_id:
                # Delete the employee expense instance entirely
                instance.delete()  # This will delete the instance from the database
                return Response({"message": "Employee expense and its project association removed successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Project not found in this expense."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # If no project_id is provided, delete all employee expenses for the same employee_id
            employee_id = instance.employee_id 
            EmployeeExpenses.objects.filter(employee_id=employee_id).delete()
            return Response({"message": "All employee expenses for this employee deleted successfully"}, status=status.HTTP_200_OK)

# Cost Of Sales
class CostOfSalesList(generics.ListAPIView):
    queryset = CostOfSales.objects.all()
    serializer_class = CostOfSalesSerializer
    permission_classes = [AllowAny]

class CostOfSalesCreate(generics.CreateAPIView):
    serializer_class = CostOfSalesSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse({"detail": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for duplicates before saving
        existing_entries = []
        for item in data:
            year = item.get('year')
            month = item.get('month')
            existing_entry = CostOfSales.objects.filter(year=year, month=month).first()  # Get the actual entry
            if existing_entry:
                existing_entries.append((year, month))  # Store year and month as a tuple

        if existing_entries:
            # Return all existing year and month pairs
            existing_months_years = [{"year": entry[0], "month": entry[1]} for entry in existing_entries]

            return JsonResponse(
                {
                    "detail": "選択された月は既にデータが登録されています。",
                    "existingEntries": existing_months_years  
                },
                status=status.HTTP_409_CONFLICT
            )
        # If no duplicates, proceed with saving data
        responses = []
        for item in data:
            try:
                serializer = CostOfSalesSerializer(data=item)
                if serializer.is_valid():
                    serializer.save()
                    responses.append({"message": f"Created successfully for month {item['month']}, year {item['year']}."})
                else:
                    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(responses, safe=False, status=status.HTTP_201_CREATED)

    def put(self, request):
        data = JSONParser().parse(request)
        if not isinstance(data, list):
            return JsonResponse({"detail": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

        responses = []
        for item in data:
            try:
                year = item.get('year')
                month = item.get('month')

                # Check if an entry with the same year and month exists
                existing_entry = CostOfSales.objects.filter(year=year, month=month).first()

                if existing_entry:
                    # Update existing entry (except year and month)
                    serializer = CostOfSalesSerializer(existing_entry, data=item, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        responses.append({"message": f"Updated successfully for month {month}, year {year}."})
                    else:
                        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # If no existing entry, create a new one
                    serializer = CostOfSalesSerializer(data=item)
                    if serializer.is_valid():
                        serializer.save()
                        responses.append({"message": f"Created successfully for month {month}, year {year}."})
                    else:
                        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(responses, safe=False, status=status.HTTP_200_OK)

class CostOfSalesUpdate(generics.UpdateAPIView):  # Change to UpdateAPIView for update actions
    serializer_class = CostOfSalesSerializer
    permission_classes = [IsAuthenticated]
    queryset = CostOfSales.objects.all()

    def update(self, request, *args, **kwargs):
        received_data = request.data  # This is expected to be a list of cost_of_sales data
        for cost_data in received_data:
            cost_of_sale_id = cost_data.get('cost_of_sale_id')  # Adjusted to match your model

            try:
                # Fetch the existing record based on cost_of_sale_id
                cost_of_sale = CostOfSales.objects.get(cost_of_sale_id=cost_of_sale_id)
                
                # Update each field except for the primary key
                for field, value in cost_data.items():
                    if field not in ['cost_of_sale_id', 'month']:  # Skip primary key and month field
                        setattr(cost_of_sale, field, value)
                
                cost_of_sale.save()  # Save the updated record

            except CostOfSales.DoesNotExist:
                return Response({"error": f"Cost of Sale with ID {cost_of_sale_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"success": "Cost of Sales updated successfully."}, status=status.HTTP_200_OK)

class CostOfSalesDelete(generics.DestroyAPIView):
    queryset = CostOfSales.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs.get("pk")
        return CostOfSales.objects.filter(cost_of_sale_id=pk)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({"message": "deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except CostOfSales.DoesNotExist:
            return Response({"message": "Cost of sale not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": "failed", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Planning
class PlanningList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        expenses = Expenses.objects.all()
        cost_of_sales = CostOfSales.objects.all()
        planning_assign = EmployeeExpenses.objects.all()
        planning_project_data = Projects.objects.all()
        employee = Employees.objects.all()
        employee_serializer = EmployeesListSerializer(employee, many=True)
        expenses_serializer = ExpensesListSerializer(expenses, many=True)
        cost_of_sales_serializer = CostOfSalesSerializer(cost_of_sales, many=True)
        planning_assign_serializer = EmployeeExpensesListSerializer(planning_assign, many=True)
        planning_project_data_serializer = ProjectsListSerializer(planning_project_data, many=True)
    
        combined_data = {
            'expenses': expenses_serializer.data,
            'employees': employee_serializer.data,
            'cost_of_sales': cost_of_sales_serializer.data,
            'planning_assign_data': planning_assign_serializer.data,
            'planning_project_data': planning_project_data_serializer.data
        }

        return Response(combined_data)

class PlanningUpdate(generics.UpdateAPIView):
    serializer_class = UpdatePlanningSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        costofsales_data = request.data
        expenses_data = request.data
        
        for item in costofsales_data:
            ids = item.get('id', [])
            values = item.get('values', [])
            label = item.get('label', '')
            
            if not ids or not values:
                continue

            for idx, record_id in enumerate(ids):
                
                if record_id:
                    try:
                        cost_of_sales_instance = CostOfSales.objects.get(cost_of_sale_id=record_id)
                        if label == "purchases":
                            cost_of_sales_instance.purchase = values[idx] if idx < len(values) else 0
                        if label == "outsourcingExpenses":
                            cost_of_sales_instance.outsourcing_expense = values[idx] if idx < len(values) else 0
                        if label == "productPurchases":
                            cost_of_sales_instance.product_purchase = values[idx] if idx < len(values) else 0
                        if label == "dispatchLaborExpenses":
                            cost_of_sales_instance.dispatch_labor_expense = values[idx] if idx < len(values) else 0
                        if label == "communicationExpenses":
                            cost_of_sales_instance.communication_expense = values[idx] if idx < len(values) else 0
                        if label == "workInProgressExpenses":
                            cost_of_sales_instance.work_in_progress_expense = values[idx] if idx < len(values) else 0
                        if label == "amortizationExpenses":
                            cost_of_sales_instance.amortization_expense = values[idx] if idx < len(values) else 0
                        cost_of_sales_instance.save()
                    except CostOfSales.DoesNotExist:
                        continue
            
            for item in expenses_data:
                ids = item.get('id', [])
                values = item.get('values', [])
                label = item.get('label', '')

                if not ids or not values:
                    continue

                for idx, record_id in enumerate(ids):
                    if record_id:
                        try:
                            expenses_instance = Expenses.objects.get(expense_id=record_id)
                            if label == "travelExpenses":
                                expenses_instance.travel_expense = values[idx] if idx < len(values) else 0
                            if label == "consumableExpenses":
                                expenses_instance.consumable_expense = values[idx] if idx < len(values) else 0
                            if label == "rentExpenses":
                                expenses_instance.rent_expense = values[idx] if idx < len(values) else 0
                            if label == "depreciationExpenses":
                                expenses_instance.depreciation_expense = values[idx] if idx < len(values) else 0
                            if label == "communicationExpenses":
                                expenses_instance.communication_expense = values[idx] if idx < len(values) else 0
                            if label == "utilitiesExpenses": 
                                expenses_instance.utilities_expense = values[idx] if idx < len(values) else 0
                            if label == "transactionFees":
                                expenses_instance.transaction_fee = values[idx] if idx < len(values) else 0
                            if label == "advertisingExpenses":
                                expenses_instance.advertising_expense = values[idx] if idx < len(values) else 0
                            if label == "entertainmentExpenses":
                                expenses_instance.entertainment_expense = values[idx] if idx < len(values) else 0
                            if label == "professionalServicesFees":
                                expenses_instance.professional_service_fee = values[idx] if idx < len(values) else 0
                            expenses_instance.save()
                        except Expenses.DoesNotExist:
                            continue

        return Response({"message": "Data updated successfully"}, status=status.HTTP_200_OK)
    
class PlanningDisplayByProjects(generics.ListAPIView):
    queryset = Projects.objects.all()
    serializer_class = PlanningDisplayByProjectstSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Projects.objects.all()

# -------------------------------------------------------------------------------------------------
# -- NOT IN USE --
# -------------------------------------------------------------------------------------------------

# -------------------------------------------------------------------------------------------------
# #1
# -------------------------------------------------------------------------------------------------

# Results

class ResultsList(generics.ListAPIView):
    queryset = Results.objects.all()
    serializer_class = ResultsListSerializer
    permission_classes = [IsAuthenticated]
    
class ResultsCreate(generics.CreateAPIView):
    serializer_class = ResultsCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "performance data created !!!"}, status=status.HTTP_200_OK
        )

class ResultsUpdate(generics.UpdateAPIView):
    serializer_class = ResultsUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return Results.objects.filter(project_id=id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {"message": "performance data updated !!!"}, status=status.HTTP_200_OK
        )

class ResultsDelete(generics.DestroyAPIView):
    queryset = Results.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.kwargs.get("pk")
        return Results.objects.filter(project_id=id)

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
        
