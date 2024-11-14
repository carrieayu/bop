
// INPUT FIELDS FOR Registration & ListAndEdit SCREENS USED IN CLIENT-SIDE VALIDATION 
export const inputFieldConfigurations = {
  projects: [
    { field: 'year', fieldName: 'year', isNumber: true, duplicateCheck: true },
    { field: 'month', fieldName: 'month', isNumber: true, duplicateCheck: true },
    { field: 'project_name', fieldName: 'projectName', isNumber: false, duplicateCheck: true },
    { field: 'project_type', fieldName: 'projectType', isNumber: false, duplicateCheck: true }, // Currently Allowed to be NULL
    { field: 'business_division', fieldName: 'businessDivision', isNumber: false, duplicateCheck: true }, // business_division_id
    { field: 'client', fieldName: 'clientName', isNumber: false, duplicateCheck: true }, // client_id
    { field: 'sales_revenue', fieldName: 'salesRevenue', isNumber: true },
    { field: 'dispatch_labor_expense', fieldName: 'dispatchLaborExpense', isNumber: true },
    { field: 'employee_expense', fieldName: 'employeeExpense', isNumber: true },
    { field: 'indirect_employee_expense', fieldName: 'indirectEmployeeExpense', isNumber: true },
    { field: 'expense', fieldName: 'expense', isNumber: true },
    { field: 'operating_income', fieldName: 'operatingIncome', isNumber: true },
    { field: 'non_operating_income', fieldName: 'nonOperatingIncome', isNumber: true },
    { field: 'non_operating_expense', fieldName: 'nonOperatingExpense', isNumber: true },
    { field: 'ordinary_profit', fieldName: 'ordinaryProfit', isNumber: true },
  ],

  expenses: [
    { field: 'year', fieldName: 'year', isNumber: true },
    { field: 'month', fieldName: 'month', isNumber: true },
    { field: 'consumable_expense', fieldName: 'consumableExpense', isNumber: true },
    { field: 'rent_expense', fieldName: 'rentExpense', isNumber: true },
    { field: 'tax_and_public_charge', fieldName: 'taxAndPublicCharge', isNumber: true },
    { field: 'depreciation_expense', fieldName: 'depreciationExpense', isNumber: true },
    { field: 'travel_expense', fieldName: 'travelExpense', isNumber: true },
    { field: 'communication_expense', fieldName: 'communicationExpense', isNumber: true },
    { field: 'utilities_expense', fieldName: 'utilitiesExpense', isNumber: true },
    { field: 'transaction_fee', fieldName: 'transactionFee', isNumber: true },
    { field: 'advertising_expense', fieldName: 'advertisingExpense', isNumber: true },
    { field: 'entertainment_expense', fieldName: 'entertainmentExpense', isNumber: true },
    { field: 'professional_service_fee', fieldName: 'professionalServicesFee', isNumber: true },
  ],

  costOfSales: [
    { field: 'year', fieldName: 'year', isNumber: true },
    { field: 'month', fieldName: 'month', isNumber: true },
    { field: 'purchase', fieldName: 'purchase', isNumber: true },
    { field: 'outsourcing_expense', fieldName: 'outsourcingExpense', isNumber: true },
    { field: 'product_purchase', fieldName: 'productPurchase', isNumber: true },
    { field: 'dispatch_labor_expense', fieldName: 'dispatchLaborExpense', isNumber: true },
    { field: 'communication_expense', fieldName: 'communicationExpense', isNumber: true },
    { field: 'work_in_progress_expense', fieldName: 'workInProgressExpense', isNumber: true },
    { field: 'transaction_fee', fieldName: 'transactionFee', isNumber: true },
    { field: 'amortization_expense', fieldName: 'amortizationExpense', isNumber: true },
  ],
}