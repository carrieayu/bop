export interface CostOfSaleEntity {
  cost_of_sale_id: string | undefined
  year: string | undefined
  month: string | undefined
  purchase: string | undefined
  outsourcing_expense: string | undefined
  product_purchase: string | undefined
  dispatch_labor_expense: string | undefined
  work_in_progress_expense: string | undefined
  communication_expense: string | undefined
  amortization_expense: string | undefined
  created_at: string | undefined
  updated_at: string | undefined
}

export interface CostOfSaleDataEntity {
  yearlyTotal: number
  list: any[] 
  monthlyTotals: any[] 
  // monthlyTotalsByDate: any[]
}