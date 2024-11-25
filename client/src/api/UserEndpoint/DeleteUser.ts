import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function deleteUser(deleteId: any, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/users/${deleteId}/delete/`

  try {
    const response = await axios.delete(endpoint, {
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
      console.error('Error deleting project:', error)
    }
    throw error
  }
}