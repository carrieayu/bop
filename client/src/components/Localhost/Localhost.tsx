import { getReactActiveEndpoint } from '../../toggleEndpoint'
export const fetchApi = async (
  endpoint: string,
  options: RequestInit,
  onSuccess: (data: any) => void,
  onError?: (error: any) => void,
) => {
  const url = `${getReactActiveEndpoint()}/${endpoint}`

  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }
    const data = await response.json()
    onSuccess(data)
  } catch (error) {
    if (onError) {
      onError(error)
    } else {
      console.error(error)
    }
  }
}
