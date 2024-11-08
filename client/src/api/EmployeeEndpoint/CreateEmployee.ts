import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function createEmployee(employeeData, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/employees/create/`

  try {
    const response = await axios.post(endpoint, employeeData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating employee:', error)
    throw error
  }
}
