export default class MasterClientsEntity {
  client_id: string | undefined
  client_name: string | undefined
  created_at: string | undefined
  updated_at: string | undefined
  auth_user: string | undefined

  constructor(data: Partial<MasterClientsEntity>) {
    this.client_id = data.client_id
    this.client_name = data.client_name
    this.created_at = data.created_at
    this.updated_at = data.updated_at
    this.auth_user = data.auth_user
  }
}