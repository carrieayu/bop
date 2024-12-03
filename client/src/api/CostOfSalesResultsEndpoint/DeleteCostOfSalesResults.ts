import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function deleteCostOfSaleResults(deleteId: any, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/cost-of-sales-results/${deleteId}/delete/`

  try {
    const response = await axios.delete(endpoint, {
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
      console.error('Error deleting cost of sale result:', error)
    }
    throw error
  }
}
