import { translate } from '../utils/translationUtil'
import { fields } from './inputFieldConfigurations'
import { MAX_SAFE_INTEGER } from '../constants'

// # CLIENT SIDE //

// ------------------------------------------
// # GET FIELDS FROM inputFieldConguration.ts
// ------------------------------------------

// # HELPER FUNCTION FOR GETTING FIELDS AND VALIDATION CONFIGURATIONS BASED ON RECORD TYPE
export const getFieldChecks = (recordType: string) => {
  // Check if the recordType exists in the inputFieldConfigurations object
  const recordInputConfig = fields[recordType]

  // If recordType exists, return the configuration, else return an empty array
  return recordInputConfig ? recordInputConfig : []
}

// -------------------------------
// # 1 PREPARE RECORDS FOR VALDATION
// -------------------------------

// # GENERAL HELPER FUNCTION TO VALIDATE RECORDS BASED ON FIELD CHECKS
// # Projects, Cost of Sales, Expenses , Clients, Business Divisions

export const validateRecords = (records, fieldChecks, recordType) => {
  let validationErrors = [];

  for (const record of records) {
    // Append '_id' to whatever the record type is.
    // EXAMPLE: 'project' → 'project_id'
    const recordIdField = `${recordType}_id`
    // In Error Message: If Registration Screen the Index is used. If Edit Screen then record ID will be used.
    const recordId = record[recordIdField] || `${records.indexOf(record) + 1}`

    for (const check of fieldChecks) {
      const errorMessage = validateField(
        record[check.field],
        check.fieldName,
        check.isNumber,
        recordId,
        recordType,
        check.isUsername,
        check.isEmail,
        check.isPassword,
        {},
        check.isRequired
      )
      
      if (errorMessage) {
        validationErrors.push(errorMessage)
      }
    }
  }
  return validationErrors;
}

// # EMPLOYEES VALIDATION (UNIQUE): REGISTRATION & LISTANDEDIT
// # Employees

export const validateEmployeeRecords = (records, fieldChecks, recordType) => {
  let validationErrors = []

  // Loop through the records and apply validation rules based on the record's specific type.
  for (const record of records) {
    // const { type } = record

    // Determine the validation needed for each record based on its type
    const selectedInputToCheck = validateSalaryAndRemuneration([record])

    
    // Append '_id' to whatever the record type is.
    const recordIdField = `${recordType}_id`
    const recordId = record[recordIdField] || `${records.indexOf(record) + 1}`
    
    // Adjust field checks based on the validation result
    let updatedFieldChecks = [...fieldChecks] // Copy the original fieldChecks

    if (selectedInputToCheck === 'checkSalary') {
      // Remove the 'executive_remuneration' field from checks if checkSalary is returned
      updatedFieldChecks = updatedFieldChecks.filter((check) => check.field !== 'executive_remuneration')
    } else if (selectedInputToCheck === 'checkExecutiveRemuneration') {
      // Remove the 'salary' field from checks if checkExecutiveRemuneration is returned
      updatedFieldChecks = updatedFieldChecks.filter((check) => check.field !== 'salary')
    } else if (selectedInputToCheck === 'UnknownEmployeeType') {
      updatedFieldChecks = updatedFieldChecks.filter(
        (check) => check.field !== 'salary' && check.field !== 'executive_remuneration',
      )
    }
    
    // Validate the fields for this particular record
    for (const check of updatedFieldChecks) {
      const errorMessage = validateField(
        record[check.field],
        check.fieldName,
        check.isNumber,
        recordId,
        recordType,
        false, // isUsername
        check.isEmail, // isEmail
        false, // isPassword
        {}, // record
        check.isRequired, // isRequired
      )
      if (errorMessage) {
        validationErrors.push(errorMessage)
      }
    }
  }

  return validationErrors
}

// EMPLOYEES: Check if Salary OR Executive Remuneration Needs to be Validated.
// ONLY USED IN EMPLOYEES
export const validateSalaryAndRemuneration = (records) => {
  // Default to 'AllValid'
  let validationStatus = 'AllValid';

  for (const { type, salary, executive_remuneration } of records) {
    if (type === '0' || type === 0) {
      // Regular employee: salary should be valid, executive_remuneration should be null
      validationStatus = 'checkSalary';
    } else if (type === '1' || type === 1) {
      // Executive employee: executive_remuneration should be valid, salary should be null
      validationStatus = 'checkExecutiveRemuneration';
    } else {
      // Unknown employee type
      validationStatus = 'UnknownEmployeeType';
    }

    // Exit once the validation type is determined
    if (validationStatus !== 'AllValid') break;
  }

  return validationStatus;
};

// # EMPLOYEES EXEPENSES VALIDATION (UNIQUE): REGISTRATION & LISTANDEDIT
// # Employees Expenses

export const validateEmployeeExpensesRecords = (records, fieldChecks, recordType, secondaryRecordType, language) => {
  let validationErrors = [];

  for (const record of records) {
    const recordId = record.employeeExpenses_id || `${records.indexOf(record) + 1}`;

    // Check main fields based on fieldChecks
    fieldChecks.forEach((check) => {
      const { field, fieldName, isRequired, isNumber, isNested } = check;

      if (!isNested) {
        // Validate main fields (non-nested)
        const fieldValue = record[field];
        if (isRequired || fieldValue != null) {
          const error = validateField(fieldValue, fieldName, isNumber, recordId, recordType);
          if (error) validationErrors.push(error);
        }
      } else if (isNested && Array.isArray(record[field])) {
        // Retrieve nested field checks for `projectEntries`
        const nestedFieldChecks = getFieldChecks(secondaryRecordType)
        
        // Validate nested fields in projectEntries
        record[field].forEach((entry, entryIndex) => {
          const nestedRecordId = `${recordId} - ${translate('item',language)} ${entryIndex + 1}`

          // Loop through each nested field to validate
          nestedFieldChecks.forEach((nestedCheck) => {
            const nestedFieldValue = entry[nestedCheck.field]
            const error = validateField(
              nestedFieldValue,
              nestedCheck.fieldName,
              nestedCheck.isNumber,
              nestedRecordId,
              recordType,
              false, // isUsername
              false, // isEmail
              false, // isPassword
              {}, // record
              false // isRequired
            )
            if (error) validationErrors.push(error)
          })
        })
      }
    });
  }

  return validationErrors; // Return collected validation errors
};

// # EMPLOYEES EXEPENSES VALIDATION (UNIQUE): REGISTRATION & LISTANDEDIT
// # Employees Expenses

export const validateEmployeeExpensesResultsRecords = (records, fieldChecks, recordType, secondaryRecordType, language) => {
  let validationErrors = [];
  for (const record of records) {
    const recordId = record.employeeExpenses_id || `${records.indexOf(record) + 1}`;

    // Check main fields based on fieldChecks
    fieldChecks.forEach((check) => {
      const { field, fieldName, isRequired, isNumber, isNested } = check;

      if (!isNested) {
        // Validate main fields (non-nested)
        const fieldValue = record[field];
        if (isRequired || fieldValue != null) {
          const error = validateField(fieldValue, fieldName, isNumber, recordId, recordType);
          if (error) validationErrors.push(error);
        }
      } else if (isNested && Array.isArray(record[field])) {
        // Retrieve nested field checks for `projectEntries`
        const nestedFieldChecks = getFieldChecks(secondaryRecordType)
        
        // Validate nested fields in projectEntries
        record[field].forEach((entry, entryIndex) => {
          const nestedRecordId = `${recordId} - ${translate('item',language)} ${entryIndex + 1}`

          // Loop through each nested field to validate
          nestedFieldChecks.forEach((nestedCheck) => {
            const nestedFieldValue = entry[nestedCheck.field]
            const error = validateField(
              nestedFieldValue,
              nestedCheck.fieldName,
              nestedCheck.isNumber,
              nestedRecordId,
              recordType,
              false, // isUsername
              false, // isEmail
              false, // isPassword
              {}, // record
              false // isRequired
            )
            if (error) validationErrors.push(error)
          })
        })
      }
    });
  }

  return validationErrors; // Return collected validation errors
};

// # USERS VALIDATION (UNIQUE): REGISTRATION & LISTANDEDIT
// # Users

// Prepare User Screen Form Data for CLient Side Validation
export const validateUserRecord = (records, fieldChecks, recordType) => {
  let validationErrors = []

  // Rename recordType from 'usersList' to 'users' for display purposes.
  const displayRecordType = recordType === 'usersList' ? 'users' : recordType

  for (const record of records) {
        // Append '_id' to whatever the record type is.
        // EXAMPLE: 'This table only has 'id' not 'name_id'
        const recordIdField = ` `
      // In Error Message: If Registration Screen the Index is used. If Edit Screen then record ID will be used.
      const recordId = record[recordIdField] || `${records.indexOf(record) + 1}`
      for (const check of fieldChecks) {
        const errorMessage = validateField(
          record[check.field],
          check.fieldName,
          check.isNumber,
          recordId,
          displayRecordType,
          check.isUsername,
          check.isEmail,
          check.isPassword,
          record,
          false, // isRequired
        )
        if (errorMessage) {
          validationErrors.push(errorMessage)
        }
      }
    }
    return validationErrors
}

// HELPER FUNCTION FOR DOING VALIDATION CHECKS ON EACH FIELD IN FORM
export const validateField = (
  value,
  fieldName,
  isNumber,
  recordId, // if Registration Screen will use INDEX. If EDIT Screen record ID in table is used.
  recordType, // recordType is the type of record being registered: For example: (project, user, employee etc.)
  isUsername = false, // optional
  isEmail = false, // optional
  isPassword = false, // optional
  record = {}, // optional
  isRequired = false // optional
) => {
  
  const maxDecimal = Number.MAX_SAFE_INTEGER
  // const maxInteger = Number.MAX_SAFE_INTEGER // 9007199254740991

  // Helper function to create error message
  const createError = (message) => ({
    fieldName,
    errorMessage: message,
    recordId,
    recordType,
  })

  // Number validations
  if (isNumber) {
    Number(value)
    if (value < 0) return createError('cannotBeLessThanZero')
    if (Number.isInteger(value) && value > MAX_SAFE_INTEGER) {
      return createError('valueTooLarge')
    }
    if (!Number.isInteger(value)) {
      if (typeof value === 'string') { 
        if (Number(value) > MAX_SAFE_INTEGER) {
          return createError('valueTooLarge')
         }
      } 
  }

  }

  // Empty input validation
  if (typeof value === 'string' && value.trim() === '') return createError('inputCannotBeEmpty')

  // Specific field validations for salary and executiveRemuneration
  if ((fieldName === 'salary' || fieldName === 'executiveRemuneration') && value === null) {
    return createError('inputCannotBeEmpty')
  }

  // Username validation
  if (isUsername && !/^[a-zA-Z]+_[a-zA-Z]+$/.test(value)) {
    return createError('usersValidationText1')
  }

  // Password validation
  if (isPassword) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    if (!passwordRegex.test(value)) {
      return createError('invalidPasswordFormat')
    }

    // Check if password and confirm password match for user registration
    if (recordType === 'user' && fieldName === 'password' && record['password'] !== record['confirm_password']) {
      return createError('PasswordsDoNotMatch')
    }
  }

  // Email validation
  if (isEmail) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(value)) {
      return createError('invalidEmailFormat')
    }

    // Check if email and confirm email match for user registration
    if (recordType === 'user' && fieldName === 'email' && record['email'] !== record['confirm_email']) {
      return createError('EmailsDoNotMatch')
    }
  }

  // No errors, return empty string
  return ''
};

// ------------------------------
// #3 CHECK FOR DUPLICATES IN FORMS 
// ------------------------------
    
// # GENERAL CHECK FOR DUPLICATES
export const checkForDuplicates = (records, uniqueFields, recordType, language, nestedRecords = '') => {
  const duplicates = []
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    
    for (let j = i + 1; j < records.length; j++) {
      const comparisonRecord = records[j]
      
      // Dynamically create the id field based on the recordType
      const recordIdField = `${recordType}_id`
      
      // Check if the unique fields match, including the recordId dynamically
      // const isDuplicate = uniqueFields.every((field) => {record[field] === comparisonRecord[field]})
      const isDuplicate = uniqueFields.every((field) => {
        return record[field] === comparisonRecord[field]
      })

      if (isDuplicate) {
        const fieldName = uniqueFields.join(', ')
        // Dynamically get the IDs using the appropriate record id field (e.g., project_id, expense_id)
        const recordIds = `${record[recordIdField] || `${i + 1}`} ${translate('and', language)} ${comparisonRecord[recordIdField] || `${j + 1}`}`

        // Add duplicate details to the duplicates array
        duplicates.push({
          fieldName: fieldName,
          errorMessage: 'cannotBeIdentical',
          recordIds: recordIds,
          recordType: recordType,
        })
      }
    }

    // EMPLOYEE EXPENSES VALIDATION (UNIQUE):REGISTRATION

    // Nested duplicate check using a map to store field combinations
    if (Array.isArray(record[nestedRecords])) {
      const seenCombinations = new Map()

      for (let m = 0; m < record[nestedRecords].length; m++) {
        const entry = record[nestedRecords][m]

        // Create a unique identifier for each combination of unique fields
        const combinationKey = uniqueFields.map((field) => entry[field]).join('-')

        if (seenCombinations.has(combinationKey)) {
          // If the combinationKey exists, add the current index (m+1) to the array of duplicates
          seenCombinations.get(combinationKey).push(m + 1)
        } else {
          // If it's a new combinationKey, initialize with the current index (m+1)
          seenCombinations.set(combinationKey, [m + 1])
        }
      }

      // After iterating, collect all combinations with more than one index, indicating duplicates
      seenCombinations.forEach((indexes, combinationKey) => {
        if (indexes.length > 1) {
          const fieldName = uniqueFields.join(', ')
          const duplicateItems = indexes.join(` ${translate('and', language)} `)
          const nestedRecordId = `${i + 1} ${translate('item', language)} ${duplicateItems}`

          duplicates.push({
            fieldName: fieldName,
            errorMessage: 'cannotBeIdentical',
            recordIds: nestedRecordId,
            recordType: `${recordType}`,
          })
        }
      })
    }
  }

  return duplicates
}

// # USERS DUPLICATE CHECK: UNIQUE
export const checkForDuplicateUsers = (records, uniqueFields, recordType, language) => {
  const duplicates = []

  for (let i = 0; i < records.length; i++) {
    const record = records[i]

    for (let j = i + 1; j < records.length; j++) {
      const comparisonRecord = records[j]

      // Determine the ID field dynamically
      const recordIdField = recordType === 'usersList' ? 'id' : `${recordType}_id`

      // Iterate over each field in uniqueFields and check for duplicates
      uniqueFields.forEach((field) => {
        // Check if the field values match (case-insensitive comparison)
        const isDuplicate = record[field]?.toLowerCase() === comparisonRecord[field]?.toLowerCase()

        if (isDuplicate) {
          // Generate an error message specific to the field
          const errorMessage = `cannotBeIdentical`

          // Get the record IDs for the duplicates
          const recordIds = `${record[recordIdField] || `${i + 1}`} ${translate('and', language)} ${comparisonRecord[recordIdField] || `${j + 1}`}`
          // Rename recordType from 'userList' to 'user' for display purposes.
          recordType = 'users'
          // Push the duplicate information to the duplicates array
          duplicates.push({
            fieldName: field,
            errorMessage: errorMessage,
            recordIds: recordIds,
            recordType: recordType,
          })
        }
      })
    }
  }
  return duplicates;
};

// ------------------------------
// #4 TRANSLATIONS AND FORMATTING
// ------------------------------

// # GENERAL HELPER FUNCTION FOR TRANSLATING AND FORMATTING ERROR MESSAGES
export const translateAndFormatErrors = (errors, language, errorType) => {
  
  // Handle normal validation errors
  if (errorType === 'normalValidation') {
    return errors.map((error) => {
      const { fieldName, errorMessage, recordId, recordType } = error;

      // Translate field names and messages
      const translatedField = translate(fieldName, language);
      const translatedMessage = translate(errorMessage, language);
      const translatedRecordId = translate(recordId, language);
      const translatedRecordType = translate(recordType, language);

      // If record type is 'userList', rename it to 'user' (if needed)
      if (recordType === 'userList') {
        const renamedUserListRecordType = 'user'; // This seems like a placeholder, maybe unused.
      }

      // Handle password and email error cases for 'user' record type
      if (recordType === 'user') {
        if (['EmailsDoNotMatch', 'PasswordsDoNotMatch'].includes(errorMessage)) {
          return `${translatedMessage}`;
        } else {
          return `${translatedField} ${language === 'en' ? ' ' : 'は'} ${translatedMessage}`;
        }
      }

      // Default formatting for other record types
      return `${translatedRecordType} ${translatedRecordId}: "${translatedField}" ${language === 'en' ? ' ' : 'は'} ${translatedMessage}`;
    });
  }

  // Handle duplicate validation errors (for Registration Edit Pages)
  if (errorType === 'duplicateValidation') {
    return errors.map((error) => {
      const { fieldName, errorMessage, recordIds, recordType } = error;

      // Format the field names by splitting and converting to camelCase
      const formattedFieldNames = fieldName
        .split(', ')
        .map((field) => field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()));

      // Format record IDs
      const recordIdArray = recordIds.split(' and ').map((id) => id.trim());
      const finalRecordIds = recordIdArray.join(` ${translate('and', language)} `);

      // Translate the formatted field names and build the final message
      const translatedFieldNames = formattedFieldNames.map((field) => translate(field, language));
      const translatedFieldNamesFormatted = `${translatedFieldNames.join(', ')} ${language === 'en' ? ' ' : 'は'}`;

      // Translate message and record type
      const translatedMessage = translate(errorMessage, language);
      const translatedRecordType = translate(recordType, language);

      // Example formatted message: 案件 [1 と 2]: [年, 月, 案件名, 受注事業部 , 顧客] 重複してはならない
      return `${translatedRecordType} [${finalRecordIds}]: ${translatedFieldNamesFormatted}${translatedMessage}`;
    });
  }
};