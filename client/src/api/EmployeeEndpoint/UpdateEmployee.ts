import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function updateEmployee(employeeList, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/employees/update/`
  try {
    const response = await axios.put(endpoint, employeeList, {
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
      console.error('There was an error updating the employee data!', error)
    }
    throw error
  }
}
