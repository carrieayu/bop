import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

export async function deleteProjectAssociationResults(deleteId1: any, deleteId2: any, token: string) {
  const endpoint = `${getReactActiveEndpoint()}/api/employee-expenses-results/${deleteId1}/delete/?project_id=${deleteId2}`

  try {
    const response = await axios.delete(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login'
    } else {
      console.error('Error deleting employee expense results:', error)
    }
    throw error
  }
}
