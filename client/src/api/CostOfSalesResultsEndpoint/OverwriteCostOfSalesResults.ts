import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function overwriteCostOfSaleResults(costOfSaleData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/cost-of-sales-results/create/`

  try {
    const response = await axios.put(endpoint, costOfSaleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error overwriting cost of sale result:', error)
    throw error
  }
}
