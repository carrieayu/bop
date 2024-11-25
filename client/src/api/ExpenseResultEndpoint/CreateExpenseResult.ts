import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createExpenseResults(expenseData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/expenses-results/create/`

  try {
    const response = await axios.post(endpoint, expenseData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating expense results:', error)
    throw error
  }
}
