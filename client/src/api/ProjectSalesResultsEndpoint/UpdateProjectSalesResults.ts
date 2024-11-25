import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function updateProjectSalesResults(projectSalesResultsList, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/project-sales-results/update/`
  try {
    const response = await axios.put(endpoint, projectSalesResultsList, {
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
      console.error('There was an error updating the projects sales results data!', error)
    }
    throw error
  }
}
