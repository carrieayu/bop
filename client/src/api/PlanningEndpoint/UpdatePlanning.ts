import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function updatePlanning(planningList, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/planning/update/`
  try {
    const response = await axios.put(endpoint, planningList, {
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
      console.error('There was an error updating the planning data!', error)
    }
    throw error
  }
}
