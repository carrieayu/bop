export default class CostOfSaleEntity {
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

  constructor(field: Partial<CostOfSaleEntity>) {
    this.cost_of_sale_id = field.cost_of_sale_id
    this.month = field.month
    this.year = field.year
    this.purchase = field.purchase
    this.outsourcing_expense = field.outsourcing_expense
    this.product_purchase = field.product_purchase
    this.dispatch_labor_expense = field.dispatch_labor_expense
    this.work_in_progress_expense = field.work_in_progress_expense
    this.communication_expense = field.communication_expense
    this.amortization_expense = field.amortization_expense
    this.created_at = field.created_at
    this.updated_at = field.updated_at
  }
}
