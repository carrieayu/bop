
// 未来： I NEED TO DOUBLE CHECK "isNumber" - in DB sometimes these values are VARCHAR. 
// Maybe can leave this for backend validation ? -Ed

// INPUT FIELDS FOR Registration & ListAndEdit SCREENS USED IN CLIENT-SIDE VALIDATION 
export const inputFieldConfigurations = {
  // Projects
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
  // Expenses
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
  // Cost Of Sales
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
  // Employee Expenses
  employeeExpenses: [
    { field: 'employee', fieldName: 'employee', isRequired: true },
    { field: 'projectEntries', fieldName: 'projectEntries', isRequired: true, isNested: true },
    { field: 'employee_id', fieldName: 'employeeId', isNumber: true },
  ],
  // Employee Expenses: nested containers
  // Field checks for the containers: `projectEntries` in employeeExpenses
  employeeExpensesProjectContainers: [
    { field: 'projects', fieldName: 'projects', isRequired: true, isNumber: false },
    { field: 'year', fieldName: 'year', isRequired: true, isNumber: true },
    { field: 'month', fieldName: 'month', isRequired: true, isNumber: true },
  ],

  users: [
    { field: 'username', fieldName: 'username', isRequired: true, isNumber: false, isUsername: true },
    { field: 'last_name', fieldName: 'lastName', isRequired: true, isNumber: false },
    { field: 'first_name', fieldName: 'firstName', isRequired: true, isNumber: false },
    { field: 'password', fieldName: 'password', isRequired: true, isNumber: false, isPassword: true },
    { field: 'confirm_password', fieldName: 'confirmPassword', isRequired: true, isNumber: false, isPassword: true },
    { field: 'email', fieldName: 'email', isRequired: true, isNumber: false, isEmail: true },
    { field: 'confirm_email', fieldName: 'confirmEmail', isRequired: true, isNumber: false, isEmail: true },
  ],
  usersList: [
    { field: 'username', fieldName: 'username', isRequired: true, isNumber: false },
    { field: 'last_name', fieldName: 'lastName', isRequired: true, isNumber: false },
    { field: 'first_name', fieldName: 'firstName', isRequired: true, isNumber: false },
    { field: 'email', fieldName: 'email', isRequired: true, isNumber: false, isEmail: true },
    { field: 'date_joined', fieldName: 'dateJoined', isRequired: true, isNumber: false },
  ],
  clients: [{ field: 'client_name', fieldName: 'clientName', isRequired: true, isNumber: false }],
  // BUSINESS DIVISIONS
  businessDivisions: [
    { field: 'business_division_name', fieldName: 'businessDivision', isRequired: true, isNumber: false },
    { field: 'company_id', fieldName: 'company', isRequired: true, isNumber: false },
  ],
  // EMPLOYEES
  employees: [
    { field: 'last_name', fieldName: 'lastName', isRequired: true, isNumber: false },
    { field: 'first_name', fieldName: 'firstName', isRequired: true, isNumber: false },
    { field: 'email', fieldName: 'email', isRequired: true, isNumber: false, isEmail: true },
    { field: 'type', fieldName: 'type', isRequired: true, isNumber: false },
    { field: 'company_name', fieldName: 'companyName', isRequired: true, isNumber: false },
    { field: 'salary', fieldName: 'salary', isNumber: true },
    { field: 'executive_renumeration', fieldName: 'executiveRenumeration', isNumber: true },
    { field: 'business_division_name', fieldName: 'businessDivision', isNumber: false },
    { field: 'bonus_and_fuel_allowance', fieldName: 'bonusAndFuelAllowance', isRequired: true, isNumber: false },
  ],
  login: [
    { field: 'username', fieldName: 'username', isRequired: true, isNumber: false },
    { field: 'password', fieldName: 'password', isRequired: true, isNumber: false },
  ],
}