import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'



export async function createBusinessDivision(businessDivisionData , token: string) {
    const endpoint = `${getReactActiveEndpoint()}/api/master-business-divisions/create/`

    try {
    const response = await axios.post(endpoint, businessDivisionData, {
        headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        },
    })
    return response.data
    } catch (error) {
    console.error('Error creating business division:', error)
    throw error
    }
}
