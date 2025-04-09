export interface EmployeeExpenseEntity {
  employee_expense_id: string
  year: string
  month: string
  created_at: Date
  updated_at: Date
  auth_user_id: number
  employee_id: string
  client_id: string
  project_id: string
  // From Associated Employee
  salary: string | undefined
  executive_remuneration: string | undefined
  welfare_expense: string
  statutory_welfare_expense: string
  insurance_premium: string
  bonus_and_fuel_allowance: string
}

export interface EmployeeExpenseDataEntity {
  yearlyTotal: number
}