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
  // Trim the string and remove non-numeric characters, 
  if (typeof value === 'string') {
    value = value.replace(/[^0-9]/g, '') // Remove non-numeric characters
  }

  // Convert the sanitized string to a number
  const number = typeof value === 'string' ? parseFloat(value) : value

  // Handle invalid number cases
  if (isNaN(number)) {
    console.log('true')
    return '' // Return empty string for invalid inputs
  }

  // Format the number
  return number.toLocaleString()
}

// # Remove commas used when displaying numbers in List, Edit, Registration Screens
// EG. "999,999" → "999999"
export const removeCommas = (val) => val.replace(/,/g, '')

// # Date Formatter (Year-Month-Day
export const getCurrentDateFormatted = () => {

  const currentDate = new Date()
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()
  const day = currentDate.getDay()
  
  return `${year}-${month}-${day}`


}