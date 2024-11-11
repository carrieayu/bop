import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function getClient(token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/master-clients/list/`

  try {
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access - redirecting to login')
    } else {
      console.error('There was an error fetching the client!', error)
    }
    throw error
  }
}
