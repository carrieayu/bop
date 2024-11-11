import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createExpense(expenseData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/expenses/create/`

  try {
    const response = await axios.post(endpoint, expenseData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating expense:', error)
    throw error
  }
}
