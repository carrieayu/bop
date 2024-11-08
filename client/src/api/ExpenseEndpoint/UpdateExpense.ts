import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function updateExpense(expenseList, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/expenses/update/`
  try {
    const response = await axios.put(endpoint, expenseList, {
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
      console.error('There was an error updating the expense data!', error)
    }
    throw error
  }
}
