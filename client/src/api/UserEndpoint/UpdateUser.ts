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
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login'
    } else {
      console.error('There was an error updating the user data!', error)
    }
    throw error;
  }
}