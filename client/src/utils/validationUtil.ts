import { translate } from '../utils/translationUtil'


// HELPER FUNCTION FOR GETTING FIELDS AND VALIDATION CONFIGURATIONS BASED ON RECORD TYPE

export const getFieldChecks = (recordType) => {
  switch (recordType) {
    case 'projects':
      return [
        { field: 'project_id', fieldName: 'projectId', isNumber: true, duplicateCheck: true },
        { field: 'year', fieldName: 'year', isNumber: true, duplicateCheck: true },
        { field: 'month', fieldName: 'month', isNumber: true, duplicateCheck: true },
        { field: 'project_name', fieldName: 'projectName', isNumber: false, duplicateCheck: true },
        { field: 'project_type', fieldName: 'projectType', isNumber: false, duplicateCheck: true }, // Currently Allowed to be NULL
        { field: 'business_division', fieldName: 'businessDivision', isNumber: false, duplicateCheck: true }, // business_division_id
        { field: 'client', fieldName: 'clientName', isNumber: false, duplicateCheck: true }, // client_id
        { field: 'sales_revenue', fieldName: 'salesRevenue', isNumber: true },
        { field: 'dispatch_labor_expense', fieldName: 'dispatchLaborExpense', isNumber: true },
        { field: 'employee_expense', fieldName: 'employeeExpense', isNumber: true },
        { field: 'indirect_employee_expense', fieldName: 'indirectEmployeeExpense', isNumber: true },
        { field: 'expense', fieldName: 'expense', isNumber: true },
        { field: 'operating_income', fieldName: 'operatingIncome', isNumber: true },
        { field: 'non_operating_income', fieldName: 'nonOperatingIncome', isNumber: true },
        { field: 'non_operating_expense', fieldName: 'nonOperatingExpense', isNumber: true },
        { field: 'ordinary_profit', fieldName: 'ordinaryProfit', isNumber: true },
        // { field: 'ordinary_profit_margin', fieldName: 'ordinaryProfitMargin', isNumber: true }, // Not Currently displayed on this screen. Maybe not needed
      ]
    case 'expenses':
      return [
        // { field: 'expense_id', fieldName: 'expenseId', isNumber: true },
        { field: 'year', fieldName: 'year', isNumber: true },
        { field: 'month', fieldName: 'month', isNumber: true },
        { field: 'consumable_expense', fieldName: 'consumableExpense', isNumber: true },
        { field: 'rent_expense', fieldName: 'rentExpense', isNumber: true },
        { field: 'tax_and_public_charge', fieldName: 'taxAndPublicCharge', isNumber: true },
        { field: 'depreciation_expense', fieldName: 'depreciationExpense', isNumber: true },
        { field: 'travel_expense', fieldName: 'travelExpense', isNumber: true },
        { field: 'communication_expense', fieldName: 'communicationExpense', isNumber: true },
        { field: 'utilities_expense', fieldName: 'utilitiesExpense', isNumber: true },
        { field: 'transaction_fee', fieldName: 'transactionFee', isNumber: true },
        { field: 'advertising_expense', fieldName: 'advertisingExpense', isNumber: true },
        { field: 'entertainment_expense', fieldName: 'entertainmentExpense', isNumber: true },
        { field: 'professional_service_fee', fieldName: 'professionalServicesFee', isNumber: true },
      ]
    default:
      return []
  }
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
  const maxDecimal = 9999999999.99;
  const maxInteger = 2147483647;

  if (isNumber && value < 0) {
    return {
      fieldName: fieldName,
      errorMessage: 'cannotBeLessThanZero',
      recordId: recordId,
      recordType: recordType,
    };
    // EXAMPLE MESSAGE
    // Project 6000000001: 売上高は 0未満にはできません。
  }

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

  if (typeof value === 'string' && value.trim() === '') {
    return {
      fieldName: fieldName,
      errorMessage: 'inputCannotBeEmpty',
      recordId: recordId,
      recordType: recordType,
    }
    // EXAMPLE MESSAGE
    // Project 6000000002: 売上高は 必須項目です。
  }

  return ''; // No error
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

      return `${translatedRecordType} ${translatedRecordId}: ${translatedField}${
        language === 'en' ? ' ' : 'は'
      } ${translatedMessage}`;
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
      const translatedFieldNamesFormatted = `[${translatedFieldNames.join(', ')}]${language === 'ja' ? 'は' : ''}`

      const translatedMessage = translate(errorMessage, language)
      const translatedRecordType = translate(recordType, language)

      // Example Message:
      // 案件 [1 と 2]: [年, 月, 案件名, 受注事業部 , 顧客] 重複してはならない
      return `${translatedRecordType} [${finalRecordIds}]: ${translatedFieldNamesFormatted} ${translatedMessage}`
    });
  }
};



