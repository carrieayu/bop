import {OtherPlanningEntity} from "./otherPlanningEntity"

export default class CardEntity {
    planning_project_id: string | undefined
    other_planning: OtherPlanningEntity[]
    planning_project_name: string | undefined
    planning_project_type: string | undefined
    planning: string | undefined
    sales_revenue: number |undefined
    cost_of_goods_sold: number |undefined
    dispatched_personnel_expenses: number |undefined
    personal_expenses: number |undefined
    indirect_personal_expenses: number |undefined
    expenses: number |undefined
    operating_profit: number |undefined
    non_operating_income: number |undefined
    ordinary_profit: number |undefined
    ordinary_profit_margin: number |undefined
    client_id: string | undefined
    constructor(data: Partial<CardEntity>) {
        this.planning_project_id = data.planning_project_id
        this.other_planning = data.other_planning
        this.planning_project_name = data.planning_project_name
        this.planning_project_type = data.planning_project_type
        this.planning = data.planning
        this.sales_revenue = data.sales_revenue
        this.cost_of_goods_sold = data.cost_of_goods_sold
        this.dispatched_personnel_expenses = data.dispatched_personnel_expenses
        this.personal_expenses = data.personal_expenses
        this.indirect_personal_expenses = data.indirect_personal_expenses
        this.expenses = data.expenses
        this.operating_profit = data.operating_profit
        this.non_operating_income = data.non_operating_income
        this.ordinary_profit = data.ordinary_profit
        this.ordinary_profit_margin = data.ordinary_profit_margin
        this.client_id = data.client_id
    }
}