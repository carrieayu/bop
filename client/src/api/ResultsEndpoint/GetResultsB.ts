import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function getResultsB(token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/results-summary/display-by-projects/`

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
      console.error('Error fetching planning B:', error)
    }
    throw error
  }
}
