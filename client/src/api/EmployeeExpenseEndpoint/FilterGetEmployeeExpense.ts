import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function getFilteredEmployeeExpense(getFilter, token: string) {
  const params = new URLSearchParams(getFilter)
  const endpoint = `${getReactActiveEndpoint()}/api/employee-expenses/filter/?${params.toString()}`

  try {
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access - redirecting to login')
    } else {
      console.error('Error fetching employee expense result:', error)
    }
    throw error
  }
}
