import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

// Not sure if this API is used. 
export async function getMasterBusinessDivisionCompany(token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/master-business-divisions-companies/list/`

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
      console.error('Error fetching business:', error)
    }
    throw error
  }
}
