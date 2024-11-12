import { translate } from '../utils/translationUtil'

// HELPER FUNCTION FOR TRANSLATING AND FORMATTING ERROR MESSAGES
export const translateAndFormatErrors = (errors, language) => {

  return errors.map((error) => {
    const [fieldName, validationErrorMessage, recordId, recordType] = error.split(' ')
    const translatedField = translate(fieldName, language)
    const translatedMessage = translate(validationErrorMessage, language)
    const translatedRecordId = translate(recordId, language)
    const translatedRecordType = translate(recordType, language)

    // Formatted Message. If in Japanese a particle は is added.
    return `${translatedRecordType}:${translatedRecordId} ${translatedField}${language === 'en' ? '' : 'は'}${translatedMessage}`
    
  })
}

// HELPER FUNCTION FOR CHECKING FOR EMPTY INPUTS & NUMBER VALUES LESS THAN 0
// recordType is the type of record being registered: For example: (project, user, employee etc.)
export const validateField = (value, fieldName, isNumber, recordId, recordType) => {

  if (!isNaN(value) && value < 0) return `${fieldName} cannotBeLessThanZero ${recordId} ${recordType}`

  if (typeof value === 'string' && value.trim() === '') return `${fieldName} inputCannotBeEmpty ${recordId} ${recordType}`

  return '' // No error
}
