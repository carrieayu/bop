import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createEmployeeExpense(employeeExpenseData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/employee-expenses/create/`

  try {
    const response = await axios.post(endpoint, employeeExpenseData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating employee expense:', error)
    throw error
  }
}
