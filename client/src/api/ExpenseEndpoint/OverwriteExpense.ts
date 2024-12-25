import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function overwriteExpense(expenseData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/expenses/overwrite/`

  try {
    const response = await axios.put(endpoint, expenseData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error overwriting expense:', error)
    throw error
  }
}
