import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createCostOfSale(costOfSaleData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/cost-of-sales/create/`

  try {
    const response = await axios.post(endpoint, costOfSaleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating cost of sale:', error)
    throw error
  }
}
