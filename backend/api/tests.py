from django.core.exceptions import ValidationError
from django.test import TestCase
from .models import CostOfSales  # Replace with your actual model import

class CostOfSalesModelTest(TestCase):
    
    def test_year_choices(self):
        # Test valid year values
        valid_years = ['2000', '2020', '2099']  # Sample valid years within the range
        for year in valid_years:
            cost_of_sale = CostOfSales(year=year, month='01', cost_of_sale_id='CS0001', purchase=0, outsourcing_expense=0, 
                                       product_purchase=0, dispatch_labor_expense=0, communication_expense=0, 
                                       work_in_progress_expense=0, amortization_expense=0)
            try:
                cost_of_sale.full_clean()  # This will validate the model
                self.assertEqual(cost_of_sale.year, year)  # Assert that the year is correctly set
            except ValidationError as e:
                self.fail(f"Validation failed for valid year {year}: {e}")

        # Test invalid year values
        invalid_years = ['1999', '2101', 'abcd']  # Invalid years (outside the valid range)
        for year in invalid_years:
            cost_of_sale = CostOfSales(year=year, month='01', cost_of_sale_id='CS0001', purchase=0, outsourcing_expense=0, 
                                       product_purchase=0, dispatch_labor_expense=0, communication_expense=0, 
                                       work_in_progress_expense=0, amortization_expense=0)
            # Assert that a ValidationError is raised for invalid years
            with self.assertRaises(ValidationError) as cm:
                cost_of_sale.full_clean()  # Ensure validation error is raised for invalid years
            print(cm.exception)  # Print the error message for debugging

    def test_month_choices(self):
        # Test valid month values
        valid_months = ['01', '06', '12']  # Sample valid months
        for month in valid_months:
            cost_of_sale = CostOfSales(year='2020', month=month, cost_of_sale_id='CS0001', purchase=0, outsourcing_expense=0, 
                                       product_purchase=0, dispatch_labor_expense=0, communication_expense=0, 
                                       work_in_progress_expense=0, amortization_expense=0)
            try:
                cost_of_sale.full_clean()  # This will validate the model
                self.assertEqual(cost_of_sale.month, month)  # Assert that the month is correctly set
            except ValidationError as e:
                self.fail(f"Validation failed for valid month {month}: {e}")

        # Test invalid month values
        invalid_months = ['00', '13', 'abcd']  # Invalid months (outside the valid range)
        for month in invalid_months:
            cost_of_sale = CostOfSales(year='2020', month=month, cost_of_sale_id='CS0001', purchase=0, outsourcing_expense=0, 
                                       product_purchase=0, dispatch_labor_expense=0, communication_expense=0, 
                                       work_in_progress_expense=0, amortization_expense=0)
            # Assert that a ValidationError is raised for invalid months
            with self.assertRaises(ValidationError) as cm:
                cost_of_sale.full_clean()  # Ensure validation error is raised for invalid months
            print(cm.exception)  # Print the error message for debugging
