import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createClient(clientData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/master-clients/create/`

  try {
    const response = await axios.post(endpoint, clientData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}
