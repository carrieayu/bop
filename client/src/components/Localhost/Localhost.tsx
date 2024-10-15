export const fetchApi = async (
  endpoint: string,
  options: RequestInit,
  onSuccess: (data: any) => void,
  onError?: (error: any) => void,
) => {
  const url = `http://54.178.202.58:8000/${endpoint}`
  // const url = `http://127.0.0.1:8000/${endpoint}`

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
