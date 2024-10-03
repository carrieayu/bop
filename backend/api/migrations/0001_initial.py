# Generated by Django 5.0.4 on 2024-09-30 07:33

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CostOfSales',
            fields=[
                ('cost_of_sale_id', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('year', models.CharField(default='2001', max_length=4)),
                ('month', models.CharField(default='01', max_length=2)),
                ('purchase', models.IntegerField(max_length=12)),
                ('outsourcing_expense', models.IntegerField(max_length=12)),
                ('product_purchase', models.IntegerField(max_length=12)),
                ('dispatch_labor_expense', models.IntegerField(max_length=12)),
                ('communication_expense', models.IntegerField(max_length=12)),
                ('work_in_progress_expense', models.IntegerField(max_length=12)),
                ('amortization_expense', models.IntegerField(max_length=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'cost_of_sales',
            },
        ),
        migrations.CreateModel(
            name='Expenses',
            fields=[
                ('expense_id', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('year', models.CharField(default='2001', max_length=4)),
                ('month', models.CharField(default='01', max_length=2)),
                ('consumable_expense', models.IntegerField(max_length=12)),
                ('rent_expense', models.IntegerField(max_length=12)),
                ('tax_and_public_charge', models.IntegerField(max_length=12)),
                ('depreciation_expense', models.IntegerField(max_length=12)),
                ('travel_expense', models.IntegerField(max_length=12)),
                ('communication_expense', models.IntegerField(max_length=12)),
                ('utilities_expense', models.IntegerField(max_length=12)),
                ('transaction_fee', models.IntegerField(max_length=12)),
                ('advertising_expense', models.IntegerField(max_length=12)),
                ('entertainment_expense', models.IntegerField(max_length=12)),
                ('professional_service_fee', models.IntegerField(max_length=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'expenses',
            },
        ),
        migrations.CreateModel(
            name='Results',
            fields=[
                ('result_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False)),
                ('sales_revenue', models.IntegerField(max_length=12)),
                ('sales', models.IntegerField(max_length=12)),
                ('cost_of_sale', models.IntegerField(max_length=12)),
                ('purchase', models.IntegerField(max_length=12)),
                ('outsourcing_expense', models.IntegerField(max_length=12)),
                ('product_purchase', models.IntegerField(max_length=12)),
                ('dispatch_labor_expense', models.IntegerField(max_length=12)),
                ('work_in_progress_expense', models.IntegerField(max_length=12)),
                ('amortization_expense', models.IntegerField(max_length=12)),
                ('gross_profit', models.IntegerField(max_length=12)),
                ('employee_expense', models.IntegerField(max_length=12)),
                ('executive_renumeration', models.IntegerField(max_length=12)),
                ('salary', models.IntegerField(max_length=12)),
                ('fuel_allowance', models.IntegerField(max_length=12)),
                ('statutory_welfare_expense', models.IntegerField(max_length=12)),
                ('welfare_expense', models.IntegerField(max_length=12)),
                ('expense', models.IntegerField(max_length=12)),
                ('consumable_expense', models.IntegerField(max_length=12)),
                ('rent_expense', models.IntegerField(max_length=12)),
                ('insurance_premium', models.IntegerField(max_length=12)),
                ('tax_and_public_charge', models.IntegerField(max_length=12)),
                ('depreciation_expense', models.IntegerField(max_length=12)),
                ('travel_expense', models.IntegerField(max_length=12)),
                ('communication_expense', models.IntegerField(max_length=12)),
                ('utilities_expense', models.IntegerField(max_length=12)),
                ('transaction_fee', models.IntegerField(max_length=12)),
                ('advertising_expense', models.IntegerField(max_length=12)),
                ('entertainment_expense', models.IntegerField(max_length=12)),
                ('professional_services_fee', models.IntegerField(max_length=12)),
                ('selling_and_general_admin_expense', models.IntegerField(max_length=12)),
                ('operating_income', models.IntegerField(max_length=12)),
                ('non_operating_income', models.IntegerField(max_length=12)),
                ('non_operating_expense', models.IntegerField(max_length=12)),
                ('ordinary_income', models.IntegerField(max_length=12)),
                ('cumulative_ordinary_income', models.IntegerField(max_length=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'results',
            },
        ),
        migrations.CreateModel(
            name='MasterClient',
            fields=[
                ('client_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False)),
                ('client_name', models.CharField(max_length=100, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
                ('auth_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'mst_clients',
            },
        ),
        migrations.CreateModel(
            name='MasterCompany',
            fields=[
                ('company_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False)),
                ('company_name', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
                ('auth_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'mst_companies',
            },
        ),
        migrations.CreateModel(
            name='MasterBusinessDivision',
            fields=[
                ('business_division_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False)),
                ('business_division_name', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
                ('auth_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.mastercompany')),
            ],
            options={
                'db_table': 'mst_business_divisions',
            },
        ),
        migrations.CreateModel(
            name='Employees',
            fields=[
                ('employee_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('salary', models.IntegerField(max_length=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
                ('auth_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('business_division', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.masterbusinessdivision')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.mastercompany')),
            ],
            options={
                'db_table': 'employees',
            },
        ),
        migrations.CreateModel(
            name='Projects',
            fields=[
                ('project_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False)),
                ('project_name', models.CharField(max_length=100)),
                ('project_type', models.CharField(max_length=50, null=True)),
                ('year', models.CharField(default='2001', max_length=4)),
                ('month', models.CharField(default='01', max_length=2)),
                ('sales_revenue', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('cost_of_sale', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('disdpatch_labor_expense', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('employee_expense', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('indirect_employee_expense', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('expense', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('operating_profit', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('non_operating_income', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('non_operating_expense', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('ordinary_profit', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('ordinary_profit_margin', models.FloatField(default=0.0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='planning_project', to='api.masterclient')),
            ],
            options={
                'db_table': 'projects',
            },
        ),
        migrations.CreateModel(
            name='EmployeeExpenses',
            fields=[
                ('employee_expense_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('year', models.CharField(default='2001', max_length=4)),
                ('month', models.CharField(default='01', max_length=2)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
                ('auth_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.employees')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.masterclient')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.projects')),
            ],
            options={
                'db_table': 'employee_expenses',
            },
        ),
    ]
