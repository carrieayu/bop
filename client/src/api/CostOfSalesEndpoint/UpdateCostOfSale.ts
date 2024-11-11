import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function updateCostOfSale(costOfSaleList, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/cost-of-sales/update/`
  try {
    const response = await axios.put(endpoint, costOfSaleList, {
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
      console.error('There was an error updating the cost of sale data!', error)
    }
    throw error
  }
}
