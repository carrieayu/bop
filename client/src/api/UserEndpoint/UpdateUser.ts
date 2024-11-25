import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

interface UserData {
    username: string
    first_name: string
    last_name: string
    password: string
    email: string
    confirm_password: string
}

export async function updateUser(userList: UserData[], token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/users/update/`;
  try {
    const response = await axios.put(endpoint, userList, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    if (error.response) {
      const { status, errors } = error.response.data
      if (status === 409) {
        console.log('Conflict errors:', errors)
      } else if (status === 400) {
        console.log('Validation errors:', errors)
      } else if (status === 401) {
        console.log('Authorization errors:', errors)
        window.location.href = '/login'
      }
    } else {
      console.error('No response from server or network error!', error)
    }
    throw error
  }
}