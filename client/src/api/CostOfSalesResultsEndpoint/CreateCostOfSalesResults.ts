import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createCostOfSaleResults(costOfSaleData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/cost-of-sales-results/create/`

  try {
    const response = await axios.post(endpoint, costOfSaleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating cost of sale result:', error)
    throw error
  }
}
