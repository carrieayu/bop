
// 未来： I NEED TO DOUBLE CHECK "isNumber" - in DB sometimes these values are VARCHAR. 
// Maybe can leave this for backend validation ? -Ed

// INPUT FIELDS FOR Registration & ListAndEdit SCREENS USED IN CLIENT-SIDE VALIDATION 
export const fields = {
  // Projects
  projects: [
    { field: 'year', fieldName: 'year', isNumber: true, duplicateCheck: true },
    { field: 'month', fieldName: 'month', isNumber: true, duplicateCheck: true },
    { field: 'project_name', fieldName: 'projectName', isNumber: false, duplicateCheck: true },
    { field: 'project_type', fieldName: 'projectType', isNumber: false, duplicateCheck: true }, // Currently Allowed to be NULL
    { field: 'business_division', fieldName: 'businessDivision', isNumber: false, duplicateCheck: true }, // business_division_id
    { field: 'client', fieldName: 'clientName', isNumber: false, duplicateCheck: true }, // client_id
    { field: 'sales_revenue', fieldName: 'salesRevenue', isNumber: true , isFinancial: true},
    { field: 'dispatch_labor_expense', fieldName: 'dispatchLaborExpense', isNumber: true, isFinancial: true },
    { field: 'employee_expense', fieldName: 'employeeExpense', isNumber: true, isFinancial: true },
    { field: 'indirect_employee_expense', fieldName: 'indirectEmployeeExpense', isNumber: true, isFinancial: true },
    { field: 'expense', fieldName: 'expense', isNumber: true, isFinancial: true },
    { field: 'operating_income', fieldName: 'operatingIncome', isNumber: true, isFinancial: true },
    { field: 'non_operating_income', fieldName: 'nonOperatingIncome', isNumber: true, isFinancial: true },
    { field: 'non_operating_expense', fieldName: 'nonOperatingExpense', isNumber: true, isFinancial: true },
    { field: 'ordinary_profit', fieldName: 'ordinaryProfit', isNumber: true, isFinancial: true},
    { field: 'ordinary_profit_margin', fieldName: 'ordinaryProfitMargin', isNumber: true, isFinancial: true },
  ],
  // Expenses
  expenses: [
    { field: 'year', fieldName: 'year', isNumber: true, isFinancial: false },
    { field: 'month', fieldName: 'month', isNumber: true, isFinancial: false },
    { field: 'consumable_expense', fieldName: 'consumableExpense', isNumber: true, isFinancial: true },
    { field: 'rent_expense', fieldName: 'rentExpense', isNumber: true, isFinancial: true },
    { field: 'tax_and_public_charge', fieldName: 'taxAndPublicCharge', isNumber: true, isFinancial: true },
    { field: 'depreciation_expense', fieldName: 'depreciationExpense', isNumber: true, isFinancial: true },
    { field: 'travel_expense', fieldName: 'travelExpense', isNumber: true, isFinancial: true },
    { field: 'communication_expense', fieldName: 'communicationExpense', isNumber: true, isFinancial: true },
    { field: 'utilities_expense', fieldName: 'utilitiesExpense', isNumber: true, isFinancial: true },
    { field: 'transaction_fee', fieldName: 'transactionFee', isNumber: true, isFinancial: true },
    { field: 'advertising_expense', fieldName: 'advertisingExpense', isNumber: true, isFinancial: true },
    { field: 'entertainment_expense', fieldName: 'entertainmentExpense', isNumber: true, isFinancial: true },
    { field: 'professional_service_fee', fieldName: 'professionalServicesFee', isNumber: true, isFinancial: true },
  ],
  // Cost Of Sales
  costOfSales: [
    { field: 'year', fieldName: 'year', isNumber: true },
    { field: 'month', fieldName: 'month', isNumber: true },
    { field: 'purchase', fieldName: 'purchase', isNumber: true , isFinancial: true },
    { field: 'outsourcing_expense', fieldName: 'outsourcingExpense', isNumber: true, isFinancial: true  },
    { field: 'product_purchase', fieldName: 'productPurchase', isNumber: true, isFinancial: true  },
    { field: 'dispatch_labor_expense', fieldName: 'dispatchLaborExpense', isNumber: true, isFinancial: true  },
    { field: 'communication_expense', fieldName: 'communicationExpense', isNumber: true, isFinancial: true  },
    { field: 'work_in_progress_expense', fieldName: 'workInProgressExpense', isNumber: true, isFinancial: true  },
    { field: 'amortization_expense', fieldName: 'amortizationExpense', isNumber: true, isFinancial: true  },
  ],
  // Cost Of SalesResults
  costOfSalesResults: [
    { field: 'year', fieldName: 'year', isNumber: true },
    { field: 'month', fieldName: 'month', isNumber: true },
    { field: 'purchase', fieldName: 'purchase', isNumber: true },
    { field: 'outsourcing_expense', fieldName: 'outsourcingExpense', isNumber: true },
    { field: 'product_purchase', fieldName: 'productPurchase', isNumber: true },
    { field: 'dispatch_labor_expense', fieldName: 'dispatchLaborExpense', isNumber: true },
    { field: 'communication_expense', fieldName: 'communicationExpense', isNumber: true },
    { field: 'work_in_progress_expense', fieldName: 'workInProgressExpense', isNumber: true },
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

  // Employee Expenses
  employeeExpensesResults: [
    { field: 'employee', fieldName: 'employee', isRequired: true },
    { field: 'projectEntries', fieldName: 'projectEntries', isRequired: true, isNested: true },
    { field: 'employee_id', fieldName: 'employeeId', isNumber: true },
  ],
  // Employee Expenses: nested containers
  // Field checks for the containers: `projectEntries` in employeeExpenses
  employeeExpensesProjectResultsContainers: [
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
    { field: 'business_division_name', fieldName: 'businessDivision', isNumber: false },
    { field: 'salary', fieldName: 'salary', isNumber: true, isFinancial: true},
    { field: 'executive_remuneration', fieldName: 'executiveRemuneration', isNumber: true, isFinancial: true},
    { field: 'bonus_and_fuel_allowance', fieldName: 'bonusAndFuelAllowance', isRequired: true, isNumber: false, isFinancial: true },
    { field: 'welfare_expense', fieldName: 'welfareExpense', isRequired: true, isNumber: false, isFinancial: true },
    { field: 'statutory_welfare_expense', fieldName: 'statutoryWelfareExpense', isRequired: true, isNumber: false, isFinancial: true },
    { field: 'insurance_premium', fieldName: 'insurancePremium', isRequired: true, isNumber: false, isFinancial: true },

  ],
  login: [
    { field: 'username', fieldName: 'username', isRequired: true, isNumber: false },
    { field: 'password', fieldName: 'password', isRequired: true, isNumber: false },
  ],
  // Project Results
  projectResults: [
    { field: 'year', fieldName: 'year', isNumber: true, duplicateCheck: true },
    { field: 'month', fieldName: 'month', isNumber: true, duplicateCheck: true },
    { field: 'project_name', fieldName: 'projectName', isNumber: false, duplicateCheck: true },
    // { field: 'project', fieldName: 'project', isNumber: false, duplicateCheck: true },
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
}
//   {
//     project: '6000000001',

//     sales_revenue: null,
//     dispatch_labor_expense: null,
//     employee_expense: null,
//     indirect_employee_expense: null,
//     expense: null,
//     operating_income: null,
//     non_operating_income: null,
//     non_operating_expense: null,
//     ordinary_profit: null,
//     ordinary_profit_margin: null,
//   }
// ]