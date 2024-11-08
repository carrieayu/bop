import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'


export async function updateBusinessDivision(businessList, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/master-business-divisions/bulk-update/`
  try {
    const response = await axios.put(endpoint, businessList, {
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
      console.error('There was an error updating the business division data!', error)
    }
    throw error
  }
}
