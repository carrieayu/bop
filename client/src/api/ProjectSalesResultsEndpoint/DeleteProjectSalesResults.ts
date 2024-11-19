import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function deleteProjectSalesResults(deleteId: any, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/project-sales-results/${deleteId}/delete/`

  try {
    const response = await axios.delete(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login'
    } else {
      console.error('Error deleting projects sales results:', error)
    }
    throw error
  }
}
