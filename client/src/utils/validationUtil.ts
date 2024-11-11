// Checks For EMPTY INPUTS & Number Values Less than 0
// ID is the type of thing being input like (project, user, employee etc.)

export const validateField = (value, fieldName, isNumber, id) => {
    console.log('in validate field:', value, fieldName, isNumber)
    
  if (!isNaN(value) && value < 0) return `${fieldName} cannotBeLessThanZero ${id}`
    console.log('is not number:', !isNaN(value), typeof value)
    
  if (typeof value === 'string' && value.trim() === '') return `${fieldName} inputCannotBeEmpty ${id}`
  
  return '' // No error
  
}


