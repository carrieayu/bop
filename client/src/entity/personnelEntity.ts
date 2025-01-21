import PlanningAssignEntity from "./assignEntity"

export interface PersonnelEntity {
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
}
