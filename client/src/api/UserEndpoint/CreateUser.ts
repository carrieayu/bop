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

export async function createUser(userData: UserData, token: string) {
    const endpoint = `${getReactActiveEndpoint()}/api/users/create/`

    try {
        const response = await axios.post(endpoint, userData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        })
        return response.data
    } catch (error) {
        console.error('Error creating user:', error)
        throw error 
    }
}
