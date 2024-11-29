import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function deleteEmployeeExpenseResults(deleteId: any, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/employee-expenses-results/${deleteId}/delete/`

  try {
    const response = await axios.delete(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login'
    } else {
      console.error('Error deleting employee expense results:', error)
    }
    throw error
  }
}
