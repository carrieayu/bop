import { translate } from '../utils/translationUtil'


// HELPER FUNCTION FOR GETTING FIELDS AND VALIDATION CONFIGURATIONS BASED ON RECORD TYPE

export const getFieldChecks = (recordType) => {
  switch (recordType) {
    case 'projects':
      return [
        { field: 'year', fieldName: 'year', isNumber: true },
        { field: 'month', fieldName: 'month', isNumber: true },
        { field: 'project_name', fieldName: 'projectName', isNumber: false },
        // { field: 'project_type', fieldName: 'projectType', isNumber: false }, // Currently Allowed to be NULL
        { field: 'sales_revenue', fieldName: 'salesRevenue', isNumber: true },
        // { field: 'cost_of_sale', fieldName: 'costOfSale', isNumber: true }, // Cost Of Sale in projects may not be needed.
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
    case 'employees':
      return [
        { field: 'employee_id', fieldName: 'employeeId', isNumber: true },
        { field: 'employee_name', fieldName: 'employeeName', isNumber: false },
      ]
    default:
      return []
  }
}

// HELPER FUNCTION FOR CHECKING FOR EMPTY INPUTS & NUMBER VALUES LESS THAN 0
// recordType is the type of record being registered: For example: (project, user, employee etc.)
export const validateField = (value, fieldName, isNumber, recordId, recordType) => {

  if (!isNaN(value) && value < 0) return `${fieldName} cannotBeLessThanZero ${recordId} ${recordType}`

  if (typeof value === 'string' && value.trim() === '') return `${fieldName} inputCannotBeEmpty ${recordId} ${recordType}`

  return '' // No error
}


// HELPER FUNCTION FOR TRANSLATING AND FORMATTING ERROR MESSAGES
export const translateAndFormatErrors = (errors, language) => {

  return errors.map((error) => {
    const [fieldName, validationErrorMessage, recordId, recordType] = error.split(' ')
    const translatedField = translate(fieldName, language)
    const translatedMessage = translate(validationErrorMessage, language)
    const translatedRecordId = translate(recordId, language)
    const translatedRecordType = translate(recordType, language)

    // Formatted Message. If in Japanese a particle は is added.
    return `${translatedRecordType} ${translatedRecordId}: ${translatedField}${language === 'en' ? '' : 'は'}${translatedMessage}`
    
  })
}

