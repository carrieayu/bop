from urllib import response
from django.db import models
from django.contrib.auth.models import User, AbstractBaseUser
from django.utils import timezone



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
    client_id = models.CharField(max_length=10, primary_key=True, editable=False)
    client_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    registered_user_id = models.CharField(max_length=100)

    def __str__(self):
        return self.client_id

    def generate_client_id(self):
        max_client_id = (
            ClientMaster.objects.all()
            .aggregate(max_client_id=models.Max("client_id"))
            .get("max_client_id")
        )
        if max_client_id is None or max_client_id == '':
            new_client_id = "0001"  
        else:
            new_client_id = str(int(max_client_id) + 1).zfill(4) 
        self.client_id = new_client_id

    def save(self, *args, **kwargs):
        if not self.client_id:
            self.generate_client_id()
        super().save(*args, **kwargs)


class CompanyMaster(models.Model):
    company_id = models.CharField(max_length=10, primary_key=True, editable=False)
    company_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    registered_user_id = models.CharField(max_length=100)

    def __str__(self):
        return self.company_id
    
    def save(self, *args, **kwargs):
        if not self.company_id:
            max_company_id = (
                BusinessDivisionMaster.objects.aggregate(
                    max_company_id=models.Max("company_id")
                )["max_company_id"]
                or "000"
            )
            new_company_id = str(int(max_company_id) + 1).zfill(3)
            self.company_id = new_company_id
        super().save(*args, **kwargs)


class BusinessDivisionMaster(models.Model):
    business_division_id = models.CharField(max_length=10, primary_key=True, editable=False)
    business_division_name = models.CharField(max_length=100)
    company_id = models.ForeignKey(CompanyMaster, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    registered_user_id = models.CharField(max_length=100)

    def __str__(self):
        return self.business_division_name
    
    def save(self, *args, **kwargs):
        if not self.business_division_id:
            max_business_division_id = (
                BusinessDivisionMaster.objects.aggregate(
                    max_business_division_id=models.Max("business_division_id")
                )["max_business_division_id"]
                or "0000"
            )
            new_business_division_id = str(int(max_business_division_id) + 1).zfill(4)
            self.business_division_id = new_business_division_id
        super(BusinessDivisionMaster, self).save(*args, **kwargs)


class User(AbstractBaseUser):
    user_id = models.CharField(max_length=10, primary_key=True, editable=False)
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
    
    def save(self, *args, **kwargs):
        if not self.user_id:
            max_user_id = (
                BusinessDivisionMaster.objects.aggregate(
                    max_user_id=models.Max("user_id")
                )["max_user_id"]
                or "00000"
            )
            new_user_id = str(int(max_user_id) + 1).zfill(5)
            self.user_id = new_user_id
        super().save(*args, **kwargs)


class PlanningProjectData(models.Model):
    planning_project_id = models.CharField(
        max_length=10, primary_key=True, editable=False
    )
    planning_project_name = models.CharField(max_length=100)
    planning_project_type = models.CharField(max_length=50, null=True)
    client_id = models.ForeignKey(
        "ClientMaster", on_delete=models.CASCADE, related_name="planning_project"
    )
    planning = models.DateField(null=True, default=timezone.now)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    sales_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    cost_of_goods_sold = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    dispatched_personnel_expenses = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    personal_expenses = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    indirect_personal_expenses = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    operating_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    non_operating_income = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    ordinary_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    ordinary_profit_margin = models.FloatField(default=0.0)

    def __str__(self):
        return self.planning_project_id

    def generate_planning_project_id(self):
        max_planning_project_id = (
            PlanningProjectData.objects.aggregate(
                max_planning_project_id=models.Max("planning_project_id")
            )["max_planning_project_id"]
            or "000000"
        )
        new_planning_project_id = str(int(max_planning_project_id) + 1).zfill(6)
        return new_planning_project_id

    def save(self, *args, **kwargs):
        if not self.planning_project_id:
            self.planning_project_id = self.generate_planning_project_id()
        super().save(*args, **kwargs)


class PerformanceProjectData(models.Model):
    project_id = models.CharField(max_length=10, primary_key=True, editable=False)
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
    
    def save(self, *args, **kwargs):
        if not self.project_id:
            max_project_id = (
                BusinessDivisionMaster.objects.aggregate(
                    max_project_id=models.Max("project_id")
                )["max_project_id"]
                or "0000000"
            )
            new_project_id = str(int(max_project_id) + 1).zfill(7)
            self.project_id = new_project_id
        super().save(*args, **kwargs)


class OtherPlanningData(models.Model):
    other_planning_id = models.CharField(max_length=10, primary_key=True, editable=False)
    planning_project_id = models.ForeignKey(
        PlanningProjectData, on_delete=models.CASCADE, related_name="other_planning"
    )
    gross_profit = models.IntegerField(max_length=12)
    net_profit_for_the_period = models.IntegerField(max_length=12)
    gross_profit_margin = models.FloatField(max_length=10)
    operating_profit_margin = models.FloatField(max_length=10)

    def __str__(self):
        return self.planning_project_id
    
    def save(self, *args, **kwargs):
        if not self.planning_project_id:
            max_planning_project_id = (
                BusinessDivisionMaster.objects.aggregate(
                    max_planning_project_id=models.Max("planning_project_id")
                )["max_planning_project_id"]
                or "00000000"
            )
            new_planning_project_id = str(int(max_planning_project_id) + 1).zfill(8)
            self.planning_project_id = new_planning_project_id
        super().save(*args, **kwargs)
    
class PlanningAssignData(models.Model):
    planning_assign_id = models.BigAutoField(primary_key=True)
    planning_project_id = models.ForeignKey(
        PlanningProjectData, on_delete=models.CASCADE
    )
    client_id = models.CharField(max_length=10)
    assignment_user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    assignment_ratio = models.IntegerField(max_length=3)
    assignment_unit_price = models.IntegerField(max_length=8)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    registration_date = models.DateField(null=True, default=timezone.now)
    registration_user = models.CharField(max_length=100)

    def __str__(self):
        return self.planning_assign_id
    
class CostOfSales(models.Model):
    id = models.CharField(max_length=10, primary_key=True, editable=False)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    cost_of_sales = models.IntegerField(max_length=12)
    purchases = models.IntegerField(max_length=12)
    outsourcing_costs = models.IntegerField(max_length=12)
    product_purchases = models.IntegerField(max_length=12)
    dispatch_labor_costs = models.IntegerField(max_length=12)
    communication_costs = models.IntegerField(max_length=12)
    work_in_progress = models.IntegerField(max_length=12)
    amortization = models.IntegerField(max_length=12)

    def __str__(self):
        return self.id
    
class Expenses(models.Model):
    id = models.CharField(max_length=10, primary_key=True, editable=False)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    consumables_expenses = models.IntegerField(max_length=12)
    rent = models.IntegerField(max_length=12)
    taxes_and_public_charges = models.IntegerField(max_length=12)
    depreciation_expenses = models.IntegerField(max_length=12)
    travel_expenses = models.IntegerField(max_length=12)
    communication_expenses = models.IntegerField(max_length=12)
    utilities_expenses = models.IntegerField(max_length=12)
    payment_fees = models.IntegerField(max_length=12)
    advertising_expenses = models.IntegerField(max_length=12)
    entertainment_expenses = models.IntegerField(max_length=12)
    remuneration = models.IntegerField(max_length=12)

    def __str__(self):
        return self.id
