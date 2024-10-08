from urllib import response
from django.db import models
from django.contrib.auth.models import User as AuthUser, AbstractBaseUser
from django.utils import timezone
from django.db.models import Max


class MasterClient(models.Model):
    client_id = models.CharField(max_length=10, primary_key=True, editable=False)
    client_name = models.CharField(unique=True,max_length=100)
    auth_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'mst_clients'

    def __str__(self):
        return self.client_id

    def generate_client_id(self):
        max_client_id = (
            MasterClient.objects.all()
            .aggregate(max_client_id=models.Max("client_id"))
            .get("max_client_id")
        )
        if max_client_id is None or max_client_id == '':
            new_client_id = "1000000001"  
        else:
            new_client_id = str(int(max_client_id) + 1).zfill(4) 
        self.client_id = new_client_id

    def save(self, *args, **kwargs):
        if not self.client_id:
            self.generate_client_id()
        super().save(*args, **kwargs)


class MasterCompany(models.Model):
    company_id = models.CharField(max_length=10, primary_key=True, editable=False)
    company_name = models.CharField(max_length=100)
    auth_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'mst_companies'

    def __str__(self):
        return self.company_name
    
    def save(self, *args, **kwargs):
        if not self.company_id:
            max_company_id = (
                MasterBusinessDivision.objects.aggregate(
                    max_company_id=models.Max("company_id")
                )["max_company_id"]
                or "000"
            )
            new_company_id = str(int(max_company_id) + 1).zfill(3)
            self.company_id = new_company_id
        super().save(*args, **kwargs)


class MasterBusinessDivision(models.Model):
    business_division_id = models.CharField(max_length=10, primary_key=True, editable=False)
    business_division_name = models.CharField(max_length=100)
    company = models.ForeignKey(MasterCompany, on_delete=models.CASCADE)
    auth_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'mst_business_divisions'

    def __str__(self):
        return self.business_division_name
    
    def save(self, *args, **kwargs):
        if not self.business_division_id:
            max_business_division_id = (
                MasterBusinessDivision.objects.aggregate(
                    max_business_division_id=models.Max("business_division_id")
                )["max_business_division_id"]
                or "0000"
            )
            new_business_division_id = str(int(max_business_division_id) + 1).zfill(4)
            self.business_division_id = new_business_division_id
        super(MasterBusinessDivision, self).save(*args, **kwargs)


class Employees(models.Model):
    employee_id = models.CharField(max_length=10, primary_key=True, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    salary = models.IntegerField(max_length=12)
    company = models.ForeignKey(MasterCompany, on_delete=models.CASCADE)
    business_division = models.ForeignKey(
        MasterBusinessDivision, on_delete=models.CASCADE
    )
    auth_user =  models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'employees'

    STARTING_EMPLOYEE_ID = 3000000001

    def __str__(self):
        return self.employee_id

    def _generate_employee_id(self):
        last_employee = Employees.objects.filter(employee_id__startswith='300').order_by('-employee_id').first()
        if last_employee:
            return str(int(last_employee.employee_id) + 1)
        return str(self.STARTING_EMPLOYEE_ID)

    def save(self, *args, **kwargs):
        if not self.employee_id:
            self.employee_id = self._generate_employee_id()
        super().save(*args, **kwargs)


class Projects(models.Model):
    project_id = models.CharField(
        max_length=10, primary_key=True, editable=False
    )
    project_name = models.CharField(unique=True,max_length=100)
    project_type = models.CharField(max_length=50, null=True)
    client = models.ForeignKey(
        "MasterClient", on_delete=models.CASCADE, related_name="mst_client"
    )
    business_division = models.ForeignKey(
        "MasterBusinessDivision", on_delete=models.CASCADE, related_name="business_division"
    )
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    sales_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    cost_of_sale = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    dispatch_labor_expense = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    employee_expense = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    indirect_employee_expense = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    expense = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    operating_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    non_operating_profit = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    non_operating_expense = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0
    )
    ordinary_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    ordinary_profit_margin = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'projects'

    def __str__(self):
        return self.project_id

    def generate_project_id(self):
        max_project_id = (
            Projects.objects.aggregate(
                max_project_id=models.Max("project_id")
            )["max_project_id"]
            or "6000000000"
        )
        new_project_id = str(int(max_project_id) + 1).zfill(6)
        return new_project_id

    def save(self, *args, **kwargs):
        if not self.project_id:
            self.project_id = self.generate_project_id()
        super().save(*args, **kwargs)

# Performance Data -> Results
class Results(models.Model):
    result_id = models.CharField(max_length=10, primary_key=True, editable=False)
    sales_revenue = models.IntegerField(max_length=12)
    sales = models.IntegerField(max_length=12)
    cost_of_sale = models.IntegerField(max_length=12)
    purchase = models.IntegerField(max_length=12)
    outsourcing_expense = models.IntegerField(max_length=12)
    product_purchase = models.IntegerField(max_length=12)
    dispatch_labor_expense = models.IntegerField(max_length=12)
    communication_expense = models.IntegerField(max_length=12)
    work_in_progress_expense = models.IntegerField(max_length=12)
    amortization_expense = models.IntegerField(max_length=12)
    gross_profit = models.IntegerField(max_length=12)
    employee_expense = models.IntegerField(max_length=12)
    executive_renumeration = models.IntegerField(max_length=12)
    salary = models.IntegerField(max_length=12)
    fuel_allowance = models.IntegerField(max_length=12)
    statutory_welfare_expense = models.IntegerField(max_length=12)
    welfare_expense = models.IntegerField(max_length=12)
    expense = models.IntegerField(max_length=12)
    consumable_expense = models.IntegerField(max_length=12)
    rent_expense = models.IntegerField(max_length=12)
    insurance_premium = models.IntegerField(max_length=12)
    tax_and_public_charge = models.IntegerField(max_length=12)
    depreciation_expense = models.IntegerField(max_length=12)
    travel_expense = models.IntegerField(max_length=12)
    communication_expense = models.IntegerField(max_length=12)
    utilities_expense = models.IntegerField(max_length=12)
    transaction_fee = models.IntegerField(max_length=12)
    advertising_expense = models.IntegerField(max_length=12)
    entertainment_expense = models.IntegerField(max_length=12)
    professional_services_fee = models.IntegerField(max_length=12)
    selling_and_general_admin_expense = models.IntegerField(max_length=12)
    operating_income = models.IntegerField(max_length=12)
    non_operating_income = models.IntegerField(max_length=12)
    non_operating_expense = models.IntegerField(max_length=12)
    ordinary_income = models.IntegerField(max_length=12)
    cumulative_ordinary_income = models.IntegerField(max_length=12)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'results'

    def __str__(self):
        return self.project_id
    
    def save(self, *args, **kwargs):
        if not self.project_id:
            max_project_id = (
                MasterBusinessDivision.objects.aggregate(
                    max_project_id=models.Max("project_id")
                )["max_project_id"]
                or "0000000"
            )
            new_project_id = str(int(max_project_id) + 1).zfill(7)
            self.project_id = new_project_id
        super().save(*args, **kwargs)


    
class EmployeeExpenses(models.Model):
    employee_expense_id = models.CharField(max_length=10, primary_key=True)  # Change to CharField for formatted ID
    client = models.ForeignKey(MasterClient, on_delete=models.CASCADE)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
    employee = models.ForeignKey(Employees, on_delete=models.CASCADE)
    auth_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = u'employee_expenses'

    def save(self, *args, **kwargs):
        if not self.employee_expense_id:
            # Get the maximum existing ID and increment it
            max_id = EmployeeExpenses.objects.aggregate(max_id=Max("employee_expense_id"))["max_id"]
            if max_id:
                numeric_part = int(max_id[1:]) + 1  # Extract numeric part after 'E'
            else:
                numeric_part = 1  # Start with 1 if no records exist
            self.employee_expense_id = f'E{numeric_part:09d}'  # Format as 'E000000001'
        
        super().save(*args, **kwargs) 

    def __str__(self):
        return self.employee_expense_id
    
class CostOfSales(models.Model):
    cost_of_sale_id = models.CharField(max_length=10, primary_key=True)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    purchase = models.IntegerField(max_length=12)
    outsourcing_expense = models.IntegerField(max_length=12)
    product_purchase = models.IntegerField(max_length=12)
    dispatch_labor_expense = models.IntegerField(max_length=12)
    communication_expense = models.IntegerField(max_length=12)
    work_in_progress_expense = models.IntegerField(max_length=12)
    amortization_expense = models.IntegerField(max_length=12)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'cost_of_sales'

    def save(self, *args, **kwargs):
        if not self.cost_of_sale_id:
            # Get the maximum existing ID and increment it
            max_id = CostOfSales.objects.aggregate(max_id=Max("cost_of_sale_id"))["max_id"]
            if max_id:
                numeric_part = int(max_id[1:]) + 1  # Extract numeric part after 'A'
            else:
                numeric_part = 1  # Start with 1 if no records exist
            self.cost_of_sale_id = f'A{numeric_part:09d}'  # Format as 'A000000001'
        
        super().save(*args, **kwargs) 

    def __str__(self):
        return self.cost_of_sale_id
    
class Expenses(models.Model):
    expense_id = models.CharField(max_length=10, primary_key=True)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    consumable_expense = models.IntegerField(max_length=12)
    rent_expense = models.IntegerField(max_length=12)
    tax_and_public_charge = models.IntegerField(max_length=12)
    depreciation_expense = models.IntegerField(max_length=12)
    travel_expense = models.IntegerField(max_length=12)
    communication_expense = models.IntegerField(max_length=12)
    utilities_expense = models.IntegerField(max_length=12)
    transaction_fee = models.IntegerField(max_length=12)
    advertising_expense = models.IntegerField(max_length=12)
    entertainment_expense = models.IntegerField(max_length=12)
    professional_service_fee = models.IntegerField(max_length=12)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'expenses'

    def save(self, *args, **kwargs):
        if not self.expense_id:
            # Get the maximum existing ID and increment it
            max_expense_id = Expenses.objects.aggregate(max_expense_id=Max("expense_id"))["max_expense_id"]
            if max_expense_id:
                numeric_part = int(max_expense_id[1:]) + 1  # Extract numeric part after 'B'
            else:
                numeric_part = 1  # Start with 1 if no records exist
            self.expense_id = f'B{numeric_part:09d}'  # Format as 'B000000001'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.expense_id