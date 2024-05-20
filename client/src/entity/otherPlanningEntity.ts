export class OtherPlanningEntity {
    other_planning_id: string | undefined
    gross_profit: number | undefined
    net_profit_for_the_period:  number | undefined
    gross_profit_margin: number | undefined
    operating_profit_margin: number | undefined
    planning_project_id: string | undefined

    constructor(field: Partial<OtherPlanningEntity>) {
        this.other_planning_id = field.other_planning_id
        this.gross_profit = field.gross_profit
        this.net_profit_for_the_period = field.net_profit_for_the_period
        this.gross_profit_margin = field.gross_profit_margin
        this.operating_profit_margin = field.operating_profit_margin
        this.planning_project_id = field.planning_project_id
    }
}
