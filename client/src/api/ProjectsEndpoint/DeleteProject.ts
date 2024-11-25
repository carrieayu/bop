import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function deleteProject(deleteId: any, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/projects/${deleteId}/delete/`
  console.log('inside delete project api')
  try {
    const response = await axios.delete(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.log('inside delete project api: error')

    if (error.response && error.response.status === 401) {
      window.location.href = '/login'
    } else {
      console.error('Error deleting projects:', error)
    }
    throw error
  }
}
