export default class CardEntity {
    project_id: string | undefined
    project_name: string | undefined
    project_type: string | undefined
    year: string | undefined
    month: string | undefined
    sales_revenue: number | undefined
    dispatch_labor_expense: number | undefined
    employee_expense: number | undefined
    indirect_employee_expense: number | undefined
    expense: number | undefined
    operating_income: number | undefined
    non_operating_income: number | undefined
    non_operating_expense: number | undefined
    ordinary_profit: number | undefined
    ordinary_profit_margin: number | undefined
    business_division: string | undefined
    client: string | undefined
    created_at: string | undefined
    constructor(data: Partial<CardEntity>) {
        this.project_id = data.project_id
        this.project_name = data.project_name
        this.project_type = data.project_type
        this.year = data.year
        this.month = data.month
        this.sales_revenue = data.sales_revenue
        this.dispatch_labor_expense = data.dispatch_labor_expense
        this.employee_expense = data.employee_expense
        this.indirect_employee_expense = data.indirect_employee_expense
        this.expense = data.expense
        this.operating_income = data.operating_income
        this.non_operating_income = data.non_operating_income
        this.non_operating_expense = data.non_operating_expense
        this.ordinary_profit = data.ordinary_profit
        this.ordinary_profit_margin = data.ordinary_profit_margin
        this.business_division = data.business_division
        this.client = data.client
        this.created_at = data.created_at
    }
}