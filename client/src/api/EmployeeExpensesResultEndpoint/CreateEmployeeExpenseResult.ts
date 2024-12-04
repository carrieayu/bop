import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createEmployeeExpenseResults(employeeExpenseResultsData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/employee-expenses-results/create/`

  try {
    const response = await axios.post(endpoint, employeeExpenseResultsData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating employee expense results:', error)
    throw error
  }
}
