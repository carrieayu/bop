// GENERAL HELPER FUNCTIONS

// # Helper to block non-numeric key presses for number inputs
export const handleDisableKeysOnNumberInputs = (event) => {

  console.log('run')
  const key = event.key
  // Block the typing of 'e' , '-', '+', '.' characters for Number Inputs
  if (key === 'e' || key === '-' || key === '+' || key === '.') {
    // Prevent these keys from being typed
      event.preventDefault()
    // alert('Cant type these keys in this input')
  }
    
}

// Add Commas to Numbers
export const formatNumberWithCommas = (number: number): string => {
  return number.toLocaleString()
}