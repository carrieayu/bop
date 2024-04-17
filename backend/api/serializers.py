from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, AccountMaster, ClientMaster, BusinessDivisionMaster, CompanyMaster


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


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}


class AccountMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountMaster
        fields = ['id', 'sales_revenue', 'cost_of_goods_sold', 'dispatched_personnel_expenses', 'personal_expenses', 'expenses']

        
class BusinessDivisionMasterSerializer(serializers.ModelSerializer):
    company_id = serializers.PrimaryKeyRelatedField(queryset=CompanyMaster.objects.all())
    company = CompanyMasterSerializer(source='company_id', read_only=True)
    class Meta:
        model = BusinessDivisionMaster
        fields = ["business_division_id", "business_division_name", "company_id", "company", "created_at", "registered_user_id"]


class ClientMasterSerializer(serializers.ModelSerializer):
     
     class Meta:
        model = ClientMaster
        fields = ["client_id", "client_name", "created_at", "registered_user_id"]
