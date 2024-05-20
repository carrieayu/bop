from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import generics, status
from .serializers import UserSerializer, NoteSerializer, AccountMasterSerializer, ClientMasterSerializer, BusinessDivisionMasterSerializer, CompanyMasterSerializers, CreatePerformanceProjectDataSerializers, CreatePlanningProjectDataSerializers, UpdateCompanyMasterSerializers, UpdatePerformanceProjectDataSerializers, UpdatePlanningProjectDataSerializers, AuthenticationSerializer,CreateOtherPlanningSerializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, AccountMaster, ClientMaster, BusinessDivisionMaster, CompanyMaster, PerformanceProjectData, PlanningProjectData, OtherPlanningData
from functools import reduce

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
        
        

