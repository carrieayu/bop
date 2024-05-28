export class ClientMasterEntity {
  client_id: string | undefined
  client_name: string | undefined
  created_at: string | undefined
  registered_user_id: string | undefined

  constructor(data: Partial<ClientMasterEntity>) {
    this.client_id = data.client_id
    this.client_name = data.client_name
    this.created_at = data.created_at
    this.registered_user_id = data.registered_user_id
  }
}
