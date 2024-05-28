
import CardEntity from './cardEntity'

export default class TableEntity {
  client_id: string | undefined
  client_name: string | undefined
  created_at: Date | undefined
  planning_project_data: CardEntity[]
  registered_user_id: string | undefined

  constructor(data: Partial<TableEntity>) {
    this.client_id = data.client_id
    this.client_name = data.client_name
    this.planning_project_data = data.planning_project_data
    this.registered_user_id = data.registered_user_id
  }
}