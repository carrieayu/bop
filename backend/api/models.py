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
    type = models.IntegerField() # 0 = regular employee , 1 = executive employee
    email = models.EmailField(unique=True)
    salary = models.IntegerField(null=True) # null if employee_type = (1/executive)
    executive_renumeration = models.IntegerField(null=True) # null if employee_type = (0/regular) 
    company = models.ForeignKey(MasterCompany, on_delete=models.CASCADE)
    business_division = models.ForeignKey(
        MasterBusinessDivision, on_delete=models.CASCADE
    )
    statutory_welfare_expense = models.IntegerField()
    welfare_expense = models.IntegerField()
    insurance_premium = models.IntegerField()
    bonus_and_fuel_allowance = models.IntegerField()
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
            return str(int(last_employee.employee_id) + 1).zfill(10)
        return str(self.STARTING_EMPLOYEE_ID)

    def save(self, *args, **kwargs):
        if not self.employee_id:
            self.employee_id = self._generate_employee_id()
        super().save(*args, **kwargs)


class Projects(models.Model):
    project_id = models.CharField(
        max_length=10, primary_key=True, editable=False
    )
    project_name = models.CharField(max_length=100)
    project_type = models.CharField(max_length=50, null=True)
    client = models.ForeignKey(
        "MasterClient", on_delete=models.CASCADE, related_name="mst_client"
    )
    business_division = models.ForeignKey(
        "MasterBusinessDivision", on_delete=models.CASCADE, related_name="business_division"
    )
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    sales_revenue = models.IntegerField( default=0)
    dispatch_labor_expense = models.IntegerField(default=0)
    employee_expense = models.IntegerField(default=0)
    indirect_employee_expense = models.IntegerField(default=0)
    expense = models.IntegerField( default=0)
    operating_income = models.IntegerField( default=0)
    non_operating_income = models.IntegerField( default=0)
    non_operating_expense = models.IntegerField( default=0)
    ordinary_profit = models.IntegerField(default=0)
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

    def get_employee_salaries(self):
        employee_expenses = EmployeeExpenses.objects.filter(project_id=self)
        # Extract employee IDs from the expenses
        employee_ids = employee_expenses.values_list('employee_id', flat=True)
        
        # Query the Employee model to get salaries of these employees
        salaries = Employees.objects.filter(employee_id__in=employee_ids).values_list('salary', flat=True)

        return list(salaries)

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
    employee_expense = models.IntegerField(max_length=12) # DELETE ?? MAY NOT BE NEEDED.
    executive_renumeration = models.IntegerField(max_length=12)
    salary = models.IntegerField(max_length=12)
    fuel_allowance = models.IntegerField(max_length=12)
    statutory_welfare_expense =  models.IntegerField(default=0)
    welfare_expense = models.IntegerField(default=0)
    expense = models.IntegerField(max_length=12)
    consumable_expense = models.IntegerField(max_length=12)
    rent_expense = models.IntegerField(max_length=12)
    insurance_premium =  models.IntegerField(default=0)
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
    employee_expense_id = models.CharField(max_length=10, primary_key=True, editable=False)  # Change to CharField for formatted ID
    client = models.ForeignKey(MasterClient, on_delete=models.CASCADE)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, null=True)
    employee = models.ForeignKey(Employees, on_delete=models.CASCADE, null=True)
    auth_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = u'employee_expenses'

    def save(self, *args, **kwargs):
        if not self.employee_expense_id:
            # Get the maximum existing ID and increment it
            max_id = EmployeeExpenses.objects.aggregate(max_id=Max("employee_expense_id"))["max_id"]
            
            if max_id is not None:  # Check if max_id is not None
                max_id_str = str(max_id)  # Convert max_id to string
                
                if len(max_id_str) > 1 and max_id_str.startswith('E'):
                    # Ensure there is a numeric part after 'E'
                    numeric_part = int(max_id_str[1:]) + 1  # Extract numeric part after 'E'
                else:
                    numeric_part = 1  # Start with 1 if the format is unexpected
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
    
class CostOfSalesResults(models.Model):
    cost_of_sale_result_id  = models.CharField(max_length=10, primary_key=True)
    cost_of_sale =  models.ForeignKey(CostOfSales, on_delete=models.CASCADE, null=True)
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
        db_table = u'cost_of_sales_results'

    def save(self, *args, **kwargs):
        if not self.cost_of_sale_result_id:
            # Get the maximum existing ID and increment it
            max_id = CostOfSalesResults.objects.aggregate(max_id=Max("cost_of_sale_result_id"))["max_id"]
            if max_id:
                numeric_part = int(max_id[1:]) + 1  # Extract numeric part after 'A'
            else:
                numeric_part = 1  # Start with 1 if no records exist
            self.cost_of_sale_result_id = f'A{numeric_part:09d}'  # Format as 'A000000001'
        
        super().save(*args, **kwargs) 

    def __str__(self):
        return self.cost_of_sale_result_id
    
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
    

class ExpensesResults(models.Model):
    expense_result_id  = models.CharField(max_length=10, primary_key=True)
    expense = models.ForeignKey(Expenses, on_delete=models.CASCADE, null=True)
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
        db_table = u'expenses_results'

    def save(self, *args, **kwargs):
        if not self.expense_result_id:
            # Get the maximum existing ID and increment it
            max_expense_results_id = ExpensesResults.objects.aggregate(max_expense_results_id=Max("expense_result_id"))["max_expense_results_id"]
            if max_expense_results_id:
                numeric_part = int(max_expense_results_id[1:]) + 1  # Extract numeric part after 'B'
            else:
                numeric_part = 1  # Start with 1 if no records exist
            self.expense_result_id = f'B{numeric_part:09d}'  # Format as 'B000000001'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.expense_result_id
    
class ProjectsSalesResults(models.Model):
    project_sales_result_id  = models.CharField(
        max_length=10, primary_key=True , editable=False
    )
    project = models.ForeignKey(Projects, on_delete=models.CASCADE, null=True)
    sales_revenue = models.IntegerField(max_length=12)
    dispatch_labor_expense = models.IntegerField(
        max_length=12
    )
    employee_expense = models.IntegerField(
        max_length=12
    )
    indirect_employee_expense = models.IntegerField(
        max_length=12
    )
    expense = models.IntegerField(max_length=12)
    operating_income = models.IntegerField(max_length=12)
    non_operating_income = models.IntegerField(
        max_length=12
    )
    non_operating_expense = models.IntegerField(
        max_length=12
    )
    ordinary_profit = models.IntegerField(max_length=12)
    ordinary_profit_margin = models.IntegerField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta :
        db_table = u'project_sales_results'

    def __str__(self):
        return self.project_sales_result_id

    def generate_project_sales_result_id(self):
        max_project_sales_result_id = (
            ProjectsSalesResults.objects.aggregate(
                max_project_sales_result_id=models.Max("project_sales_result_id")
            )["max_project_sales_result_id"]
            or "9000000000"
        )
        new_project_sales_result_id = str(int(max_project_sales_result_id) + 1).zfill(6)
        return new_project_sales_result_id

    def save(self, *args, **kwargs):
        if not self.project_sales_result_id:
            self.project_sales_result_id = self.generate_project_sales_result_id()
        super().save(*args, **kwargs)

class EmployeeExpensesResults(models.Model):
    employee_expense_result_id  = models.CharField(max_length=10, primary_key=True, editable=False) 
    employee = models.ForeignKey(Employees, on_delete=models.CASCADE, null=True)
    year = models.CharField(max_length=4, default="2001")
    month = models.CharField(max_length=2, default="01")
    auth_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    client = models.ForeignKey(MasterClient, on_delete=models.CASCADE)
    project = models.ForeignKey(ProjectsSalesResults, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = u'employee_expenses_results'

    def save(self, *args, **kwargs):
        if not self.employee_expense_result_id:
            # Get the maximum existing ID and increment it
            max_id = EmployeeExpensesResults.objects.aggregate(max_id=Max("employee_expense_result_id"))["max_id"]
            
            if max_id is not None:  # Check if max_id is not None
                max_id_str = str(max_id)  # Convert max_id to string
                
                if len(max_id_str) > 1 and max_id_str.startswith('E'):
                    # Ensure there is a numeric part after 'E'
                    numeric_part = int(max_id_str[1:]) + 1  # Extract numeric part after 'E'
                else:
                    numeric_part = 1  # Start with 1 if the format is unexpected
            else:
                numeric_part = 1  # Start with 1 if no records exist
                
            self.employee_expense_result_id = f'E{numeric_part:09d}'  # Format as 'E000000001'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.employee_expense_result_id