import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function updateProject(projectList, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/projects/update/`
  try {
    const response = await axios.put(endpoint, projectList, {
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
      console.error('There was an error updating the projects data!', error)
    }
    throw error
  }
}
