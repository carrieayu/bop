import { CardEntity } from "./cardEntity"


export interface  TableEntity {
  client_id: string | undefined
  client_name: string | undefined
  created_at: Date | undefined
  planning_project_data: CardEntity[]
  registered_user_id: string | undefined
}