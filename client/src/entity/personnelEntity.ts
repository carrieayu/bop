import PlanningAssignEntity from "./assignEntity"
import CardEntity from "./cardEntity"

export default class PersonnelEntity {
  user_id: string | undefined
  password: string | undefined
  last_login: Date | undefined
  username: string | undefined
  email: string | undefined
  created_at: Date | undefined
  registered_user_id: string | undefined
  affiliated_company_id: string | undefined
  affiliated_business_division_id: string | undefined
  planning_assign: PlanningAssignEntity[] | undefined

  constructor(data: Partial<PersonnelEntity>) {
    this.user_id = data.user_id
    this.password = data.password
    this.last_login = data.last_login
    this.username = data.username
    this.email = data.email
    this.created_at = data.created_at
    this.registered_user_id = data.registered_user_id
    this.affiliated_company_id = data.affiliated_company_id
    this.affiliated_business_division_id = data.affiliated_business_division_id
    this.planning_assign = data.planning_assign
  }
}
