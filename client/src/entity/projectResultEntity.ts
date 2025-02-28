export interface ProjectResultEntity {
  project_sales_result_id: string
  sales_revenue: string // Decimal in Django → String in Entity
  dispatch_labor_expense: string
  employee_expense: string
  indirect_employee_expense: string
  expense: string
  operating_income: string
  non_operating_income: string
  non_operating_expense: string
  ordinary_profit: string
  ordinary_profit_margin: string
  business_division: string
  client: string
  created_at: string
  updated_at: string
  projects: ProjectEntity
}
// Related Project (Planning)
export interface ProjectEntity {
  project_id: string
  project_name: string
  project_type: string
  year: string
  month: string
}

