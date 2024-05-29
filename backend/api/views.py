from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import generics, status
from .serializers import CreateTableListSerializers, UserSerializer, NoteSerializer, AccountMasterSerializer, ClientMasterSerializer, BusinessDivisionMasterSerializer, CompanyMasterSerializers, CreatePerformanceProjectDataSerializers, CreatePlanningProjectDataSerializers, UpdateCompanyMasterSerializers, UpdatePerformanceProjectDataSerializers, UpdatePlanningProjectDataSerializers, AuthenticationSerializer,CreateOtherPlanningSerializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, AccountMaster, ClientMaster, BusinessDivisionMaster, CompanyMaster, PerformanceProjectData, PlanningProjectData, OtherPlanningData
from functools import reduce
from datetime import datetime

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
            return Response({"message": "note deleted successfully"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)


# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
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

class BusinessDivisionMasterRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
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
            id = self.kwargs.get('pk')
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
            id = self.kwargs.get('pk')
            return CompanyMaster.objects.filter(company_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({"message": "deleted successfully"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)
    
class CreatePerformanceProjectData(generics.CreateAPIView):
    serializer_class = CreatePerformanceProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": "performance data created !!!"}, status=status.HTTP_200_OK)
    
class UpdatePerformanceProjectData(generics.UpdateAPIView):
    serializer_class = UpdatePerformanceProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
            id = self.kwargs.get('pk')
            return PerformanceProjectData.objects.filter(project_id=id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"message": "performance data updated !!!"}, status=status.HTTP_200_OK)


class DeletePerformanceProjectData(generics.DestroyAPIView):
    queryset = PerformanceProjectData.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
            id = self.kwargs.get('pk')
            return PerformanceProjectData.objects.filter(project_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({"message": "performance deleted successfully"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)


class CreatePlanningProjectData(generics.CreateAPIView):
    serializer_class = CreatePlanningProjectDataSerializers
    permission_classes = [IsAuthenticated]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": "planning data created !!!"}, status=status.HTTP_200_OK)
    
class UpdatePlanningProjectData(generics.UpdateAPIView):
    serializer_class = UpdatePlanningProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
            id = self.kwargs.get('pk')
            return PlanningProjectData.objects.filter(planning_project_id=id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"message": "planning data updated !!!"}, status=status.HTTP_200_OK)

# OtherPlanning Data for card
class CreateOtherPlanningData(generics.CreateAPIView):
    serializer_class = CreateOtherPlanningSerializers
    permission_classes = [IsAuthenticated]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": "other planning created!"},status=status.HTTP_200_OK)


class PlanningProjectDataList(generics.ListCreateAPIView):
    queryset = PlanningProjectData.objects.all()
    serializer_class = CreatePlanningProjectDataSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self): 
        return PlanningProjectData.objects.all()
    

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
            id = self.kwargs.get('pk')
            return PlanningProjectData.objects.filter(planning_project_id=id)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({"message": "planning deleted successfully"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "failed"}, status=status.HTTP_404_NOT_FOUND)
    
class StorePlanningProject(generics.CreateAPIView):
    def post(self, request):
        client_data = request.data.get('client', {})  # Access the 'client' dict
        client_data['client_name'] = client_data.get('client_name')  
        client_data['registered_user_id'] = client_data.get('registered_user_id') 

        business_data = request.data.get('business', {})  # Access the 'business' dict
        business_data['business_division_name'] = business_data.get('business_division_name')
        business_data['registered_user_id'] = business_data.get('registered_user_id')
        business_data['company_id'] = business_data.get('company_id')

        planning_data = request.data.get('planning', {})  # Access the 'planning' dict
        planning_data['planning_project_name'] = planning_data.get('project_name')
        planning_data['planning_project_type'] = 'Type A'
        planning_data['client_id'] = ''
        planning_data['planning'] = datetime.now().strftime('%Y-%m-%d')
        planning_data['start_yyyymm'] = planning_data.get('start_yyyymm')
        planning_data['end_yyyymm'] = planning_data.get('end_yyyymm')
        planning_data['sales_revenue'] = planning_data.get('sales_revenue')
        planning_data['cost_of_goods_sold'] = planning_data.get('cost_of_goods_sold')
        planning_data['dispatched_personnel_expenses'] = 0
        planning_data['personal_expenses'] = planning_data.get('personnel_expenses')
        planning_data['indirect_personal_expenses'] = planning_data.get('indirect_personnel_cost')
        planning_data['expenses'] = planning_data.get('expenses')
        planning_data['operating_profit'] = planning_data.get('operating_income')
        planning_data['non_operating_income'] = planning_data.get('non_operating_income')
        planning_data['ordinary_profit'] = planning_data.get('ordinary_income')
        planning_data['ordinary_profit_margin'] = planning_data.get('ordinary_income_margin')
        
        print("Client Data:", client_data)
        print("Business Data:", business_data)
        print("Planning Data:", planning_data)

        # Save client data
        client_serializer = ClientMasterSerializer(data=client_data)
        if client_serializer.is_valid():
            client = client_serializer.save()
        else:
            return Response(client_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Save business division data
        business_serializer = BusinessDivisionMasterSerializer(data=business_data)
        if business_serializer.is_valid():
            business = business_serializer.save()
        else:
            return Response(business_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Update client_id in planning_data with the actual client ID
        planning_data['client_id'] = client.client_id

        # Save planning project data
        planning_serializer = CreatePlanningProjectDataSerializers(data=planning_data)
        if planning_serializer.is_valid():
            planning_serializer.save()
        else:
             return Response(planning_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Project Planning Data created successfully'}, status=status.HTTP_201_CREATED)