import { translate } from '../utils/translationUtil'
import { inputFieldConfigurations } from '../inputFieldConfigurations'

// HELPER FUNCTION FOR GETTING FIELDS AND VALIDATION CONFIGURATIONS BASED ON RECORD TYPE
export const getFieldChecks = (recordType: string) => {
  // Check if the recordType exists in the inputFieldConfigurations object
  const recordInputConfig = inputFieldConfigurations[recordType]

  // If recordType exists, return the configuration, else return an empty array
  return recordInputConfig ? recordInputConfig : []
}

// HELPER FUNCTION TO VALIDATE RECORDS BASED ON FIELD CHECKS
export const validateRecords = (records, fieldChecks, recordType) => {
  let validationErrors = [];
  
  for (const record of records) {
   
    // Append '_id' to whatever the record type is.
    // EXAMPLE: 'project' → 'project_id'
    const recordIdField = `${recordType}_id`
    // In Error Message: If Registration Screen the Index is used. If Edit Screen then record ID will be used.
    const recordId = record[recordIdField] || `${records.indexOf(record) + 1}`

    for (const check of fieldChecks) {
      const errorMessage = validateField(record[check.field], check.fieldName, check.isNumber, recordId , recordType);

      if (errorMessage) {
        validationErrors.push(errorMessage);
      }
    }
  }

  return validationErrors;
};

// HELPER FUNCTION FOR CHECKING FOR EMPTY INPUTS & NUMBER VALUES LESS THAN 0
// recordType is the type of record being registered: For example: (project, user, employee etc.)
export const validateField = (
  value,
  fieldName,
  isNumber,
  recordId,
  recordType,
) => {
  const maxDecimal = 9999999999.99
  const maxInteger = 2147483647

  // NUMBER LESS THAN 0 
  if (isNumber && value < 0) {
    return {
      fieldName: fieldName,
      errorMessage: 'cannotBeLessThanZero',
      recordId: recordId,
      recordType: recordType,
    }
    // EXAMPLE MESSAGE
    // Project 6000000001: 売上高は 0未満にはできません。
  }

  // NUMBER TO LARGE
  if (isNumber && Number.isInteger(value) && value > maxInteger) {
    return {
      fieldName: fieldName,
      errorMessage: 'valueTooLarge',
      recordId: recordId,
      recordType: recordType,
    }
    // EXAMPLE MESSAGE
    // Project 6000000001: 派遣人件費は 値が大きすぎます。
  }

  // NUMBER TO LARGE
  if (isNumber && !Number.isInteger(value) && value > maxDecimal) {
    return {
      fieldName: fieldName,
      errorMessage: 'valueTooLarge',
      recordId: recordId,
      recordType: recordType,
    }
    // EXAMPLE MESSAGE
    // Project 6000000001: 派遣人件費は 値が大きすぎます。
  }

  // EMPTY INPUT
  if (typeof value === 'string' && value.trim() === '') {
    console.log('test id',recordId)
    return {
      fieldName: fieldName,
      errorMessage: 'inputCannotBeEmpty',
      recordId: recordId,
      recordType: recordType,
    }
    // EXAMPLE MESSAGE
    // Project 6000000002: 売上高は 必須項目です。
  }

  return '' // No error
};

export const checkForDuplicates = (records, uniqueFields, recordType, language) => {
  const duplicates = []

  for (let i = 0; i < records.length; i++) {
    const record = records[i]

    for (let j = i + 1; j < records.length; j++) {
      const comparisonRecord = records[j]

      // Dynamically create the id field based on the recordType
      const recordIdField = `${recordType}_id`

      // Check if the unique fields match, including the recordId dynamically
      const isDuplicate = uniqueFields.every((field) => record[field] === comparisonRecord[field])

      if (isDuplicate) {
        const fieldName = uniqueFields.join(', ')

        // Dynamically get the IDs using the appropriate record id field (e.g., project_id, expense_id)
        const recordIds = `${record[recordIdField] || `${i + 1}`} ${translate('and',language)} ${comparisonRecord[recordIdField] || `${j + 1}`}`

        // Add duplicate details to the duplicates array
        duplicates.push({
          fieldName: fieldName,
          errorMessage: 'cannotBeIdentical',
          recordIds: recordIds,
          recordType: recordType,
        })
      }
    }
  }

  return duplicates
}

// HELPER FUNCTION FOR TRANSLATING AND FORMATTING ERROR MESSAGES
export const translateAndFormatErrors = (errors, language, errorType) => {
  if (errorType === 'normalValidation') {
    return errors.map((error) => {
      const { fieldName, errorMessage, recordId, recordType } = error;
      const translatedField = translate(fieldName, language);
      const translatedMessage = translate(errorMessage, language);
      const translatedRecordId = translate(recordId, language);
      const translatedRecordType = translate(recordType, language);

      return (
        `${translatedRecordType} ${translatedRecordId}:
         "${translatedField}" 
         ${language === 'en' ? ' ' : 'は'}
         ${translatedMessage}`
      );
    });
  }

  if (errorType === 'duplicateValidation') {
    return errors.map((error) => {
      const { fieldName, errorMessage, recordIds, recordType } = error

      const formattedFieldNames = fieldName
        .split(', ')
        .map((field) => field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()))

      const recordIdArray = recordIds.split(' and ').map((id) => id.trim())
      const finalRecordIds = recordIdArray.join(` ${translate('and', language)} `)

      const translatedFieldNames = formattedFieldNames.map((field) => translate(field, language))
      const translatedFieldNamesFormatted = `[${translatedFieldNames.join(', ')}]${language === 'en' ? ' ':'は'}`

      const translatedMessage = translate(errorMessage, language)
      const translatedRecordType = translate(recordType, language)

      // Example Message:
      // 案件 [1 と 2]: [年, 月, 案件名, 受注事業部 , 顧客] 重複してはならない
      return `${translatedRecordType} [${finalRecordIds}]: ${translatedFieldNamesFormatted}${translatedMessage}`
    });
  }
};



