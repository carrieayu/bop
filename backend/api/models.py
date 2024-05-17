from django.db import models
from django.contrib.auth.models import User, AbstractBaseUser


class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title


class AccountMaster(models.Model):
    sales_revenue = models.IntegerField(max_length=12)
    cost_of_goods_sold = models.IntegerField(max_length=12)
    dispatched_personnel_expenses = models.IntegerField(max_length=12)
    personal_expenses = models.IntegerField(max_length=12)
    expenses = models.IntegerField(max_length=12)

    def __str__(self):
        return f"Account Master: ID={self.id}, Sales Revenue={self.sales_revenue}"


class ClientMaster(models.Model):
    client_id = models.CharField(max_length=10, primary_key=True)
    client_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    registered_user_id = models.CharField(max_length=100)

    def __str__(self):
        return self.client_id


class CompanyMaster(models.Model):
    company_id = models.CharField(max_length=10, primary_key=True)
    company_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    registered_user_id = models.CharField(max_length=100)

    def __str__(self):
        return self.company_id


class BusinessDivisionMaster(models.Model):
    business_division_id = models.CharField(max_length=10, primary_key=True)
    business_division_name = models.CharField(max_length=100)
    company_id = models.ForeignKey(CompanyMaster, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    registered_user_id = models.CharField(max_length=100)

    def __str__(self):
        return self.business_division_id


class User(AbstractBaseUser):
    user_id = models.CharField(max_length=10, primary_key=True)
    username = models.TextField()
    email = models.EmailField()
    affiliated_company_id = models.ForeignKey(CompanyMaster, on_delete=models.CASCADE)
    affiliated_business_division_id = models.ForeignKey(
        BusinessDivisionMaster, on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    registered_user_id = models.CharField(max_length=100)

    def __str__(self):
        return self.user_id


class PlanningProjectData(models.Model):
    planning_project_id = models.CharField(max_length=10, primary_key=True)
    planning_project_name = models.CharField(max_length=100)
    planning_project_type = models.CharField(max_length=50)
    client_id = models.ForeignKey(ClientMaster, on_delete=models.CASCADE)
    planning = models.DateField()
    sales_revenue = models.IntegerField(max_length=12)
    cost_of_goods_sold = models.IntegerField(max_length=12)
    dispatched_personnel_expenses = models.IntegerField(max_length=12)
    personal_expenses = models.IntegerField(max_length=12)
    indirect_personal_expenses = models.IntegerField(max_length=12)
    expenses = models.IntegerField(max_length=12)
    operating_profit = models.IntegerField(max_length=12)
    non_operating_income = models.IntegerField(max_length=12)
    ordinary_profit = models.IntegerField(max_length=12)
    ordinary_profit_margin = models.FloatField(max_length=10)

    def __str__(self):
        return self.planning_project_id


class PerformanceProjectData(models.Model):
    project_id = models.CharField(max_length=10, primary_key=True)
    planning_project_id = models.ForeignKey(
        PlanningProjectData, on_delete=models.CASCADE
    )
    sales_revenue = models.IntegerField(max_length=12)
    cost_of_goods_sold = models.IntegerField(max_length=12)
    dispatched_personnel_expenses = models.IntegerField(max_length=12)
    personnel_expenses = models.IntegerField(max_length=12)
    indirect_personnel_expenses = models.IntegerField(max_length=12)
    expenses = models.IntegerField(max_length=12)
    operating_profit = models.IntegerField(max_length=12)
    non_operating_income = models.IntegerField(max_length=12)
    ordinary_profit = models.IntegerField(max_length=12)
    ordinary_profit_margin = models.FloatField(max_length=12)

    def __str__(self):
        return self.project_id

class OtherPlanningData(models.Model):
    other_planning_id = models.CharField(max_length=10, primary_key=True)
    planning_project_id = models.ForeignKey(
        PlanningProjectData, on_delete=models.CASCADE, related_name="other_planning"
    )
    gross_profit = models.IntegerField(max_length=12)
    net_profit_for_the_period = models.IntegerField(max_length=12)
    gross_profit_margin = models.FloatField(max_length=10)
    operating_profit_margin = models.FloatField(max_length=10)

    def __str__(self):
        return self.planning_project_id