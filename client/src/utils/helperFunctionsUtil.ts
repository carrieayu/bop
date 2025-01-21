import { MAX_NUMBER_LENGTH, MAX_SAFE_INTEGER, MAX_VALUE } from "../constants"

// GENERAL HELPER FUNCTIONS

// # Helper to block non-numeric key presses for number inputs

export const handleDisableKeysOnNumberInputs = (event) => {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Enter',
    'Escape',
    'Shift',
    'Control',
    'Meta', // Command key on Mac
    'c',
    'v',
  ]

  const key = event.key

  // Allow functional keys
  if (allowedKeys.includes(key)) {
    return
  }

  // Allow Command+C and Command+V (or Control+C and Control+V on Windows)
  if ((event.ctrlKey || event.metaKey) && (key === 'c' || key === 'v')) {
    return
  }

  // Allow numbers 1-9 only
  if (!/^[0-9]$/.test(key)) {
    event.preventDefault()
  }
}

// # Add Commas to Financial Numbers for Display on List, Edit, Registration Screens

export const formatNumberWithCommas = (value: number | string): string => {
  // console.log('formatNumberWithCommas',value, typeof value, )
  // Trim the string and remove non-numeric characters, 
  if (typeof value === 'string') {
    value = value.replace(/[^0-9]/g, '') // Remove non-numeric characters
  }

  // Convert the sanitized string to a number
  const number = typeof value === 'string' ? parseFloat(value) : value

  // Handle invalid number cases
  if (isNaN(number) || number === null) {
    // console.log('is NaN === true', value)
    return '' // Return empty string for invalid inputs
  }

  // Format the number
  return number.toLocaleString()
}

// # Remove commas used when displaying numbers in List, Edit, Registration Screens
// EG. "999,999" → "999999"
export const removeCommas = (val) => val.replace(/,/g, '')

// # Get Formatted Date // year-month-day
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0') // Get month (0-indexed, so +1)
  const day = String(date.getDate()).padStart(2, '0') // Get day
  const year = date.getFullYear() // Get full year

  return `${year}-${month}-${day}`
}

export const sortByFinancialYear = (months) => {
  const financialOrder = (month) => (month < 4 ? month + 12 : month)
  return months.sort((a, b) => financialOrder(a.month) - financialOrder(b.month))
}

export const handleInputChange = (
  index,
  e,
  updateFunction,
  dataList,
  nonFinancialFieldsArray = null, // used in some screns
) => {
  const { name, value } = e.target
  // console.log('values:', index, e.target.value, updateFunction, dataList, nonFinancialFieldsArray)
  console.log('name', name, 'value', value, 'dataList', dataList)
  // Check if the field is in the non-numeric fields array
  if (nonFinancialFieldsArray != null && nonFinancialFieldsArray.includes(name)) {
    // Directly update the data for non-numeric fields
    const updatedData = [...dataList]
    updatedData[index] = {
      ...updatedData[index],
      [name]: value, // Use raw value for non-numeric fields
    }
    updateFunction(updatedData)
    return // Skip the rest of the numeric-specific logic
  }
  // Remove commas to get the raw number
  // EG. 999,999 → 999999 in the DB
  const rawValue = removeCommas(value)

  // Prevent entry of more than 15 digits in Input
  if (rawValue.length > MAX_NUMBER_LENGTH) {
    return // Ignore input if the length exceeds 15 digits
  }

  if (rawValue.length <= MAX_NUMBER_LENGTH && rawValue <= MAX_SAFE_INTEGER) {
    console.log(
      'inside rawValue.length <= MAX_NUMBER_LENGTH inside if',
      rawValue.length <= MAX_NUMBER_LENGTH && rawValue <= MAX_SAFE_INTEGER,
      rawValue.length,
      MAX_NUMBER_LENGTH,
    )
    const updatedData = [...dataList]
    updatedData[index] = {
      ...updatedData[index],
      [name]: rawValue,
    }
    updateFunction(updatedData)
  }
}