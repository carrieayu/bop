import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function overwriteProject(projectData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/projects/create/`

  try {
    const response = await axios.put(endpoint, projectData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error overwriting projects:', error)
    throw error
  }
}
