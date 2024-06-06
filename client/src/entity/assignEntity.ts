import CardEntity from "./cardEntity"

export default class PlanningAssignEntity {
  planning_assign_id: string | undefined
  planning_project_id: string | undefined
  client_id: string | undefined
  assignment_user_id: string | undefined
  assignment_start_date: Date | undefined
  assignment_end_date: Date | undefined
  assignment_ratio: number | undefined
  assignment_unit_price: number | undefined
  year: string | undefined
  registration_date: Date | undefined
  registration_user: number | undefined
  planning_project: CardEntity[] | undefined

  constructor(data: Partial<PlanningAssignEntity>) {
    this.planning_assign_id = data.planning_assign_id
    this.planning_project_id = data.planning_project_id
    this.client_id = data.client_id
    this.assignment_user_id = data.assignment_user_id
    this.assignment_start_date = data.assignment_start_date
    this.assignment_end_date = data.assignment_end_date
    this.assignment_ratio = data.assignment_ratio
    this.assignment_unit_price = data.assignment_unit_price
    this.year = data.year
    this.registration_date = data.registration_date
    this.registration_user = data.registration_user
    this.planning_project = data.planning_project
  }
}
