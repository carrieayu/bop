import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function overwriteProjectSalesResult(projectData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/project-sales-results/create/`

  try {
    const response = await axios.put(endpoint, projectData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error overwriting project sale results:', error)
    throw error
  }
}
