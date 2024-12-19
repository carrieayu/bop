import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function updateResults(resultsList, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/results-summary/update/`
  try {
    const response = await axios.put(endpoint, resultsList, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login'
    } else {
      console.error('There was an error updating the results summary data!', error)
    }
    throw error
  }
}
