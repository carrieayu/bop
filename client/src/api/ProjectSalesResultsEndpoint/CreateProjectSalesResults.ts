import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createProjectSalesResults(projectData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/project-sales-results/create/`

  try {
    const response = await axios.post(endpoint, projectData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating projects sales results:', error)
    throw error
  }
}
