import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { updatePlanning } from '../../api/PlanningEndpoint/UpdatePlanning'
import { editingTableALabelsAndValues } from '../../utils/tableEditingALabelAndValues'
import { translate } from '../../utils/translationUtil'
import { editableLabels, halfYears, MAX_NUMBER_LENGTH, months, noIndentLabels, token } from '../../constants'
// HOOKS
import { useAppDispatch } from '../../actions/hooks'
import { useAppSelector } from '../../actions/hooks'
// SELECTORS
import { planningSelector } from '../../selectors/planning/planningSelector'
import { planningCalculationsSelector } from '../../selectors/planning/planningCalculationSelectors'
// REDUCERS
import { updateCostOfSalesPlanningScreen } from '../../reducers/costOfSale/costOfSaleSlice'
import { updateExpensesPlanningScreen } from '../../reducers/expenses/expensesSlice'
import { formatNumberWithCommas, removeCommas } from '../../utils/helperFunctionsUtil'

const EditTablePlanning = ({
  editedData,
  setEditedData,
  modifiedFields,
  setModifiedFields,
  hasUnsavedChanges,
  setHasUnsavedChanges,
}) => {
  const dispatch = useAppDispatch()
  const planning = useAppSelector(planningSelector)
  const planningCalculations = useAppSelector(planningCalculationsSelector)

  const [originalData, setOriginalData] = useState([]) // empty array
  const reduxState = editingTableALabelsAndValues(planning, planningCalculations) // intial data

  useEffect(() => {
    setOriginalData(reduxState)
  }, [planning, planningCalculations])

  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const isRowEditable = (label) => editableLabels.includes(label)

  const handleInputChange = (rowIndex, valueIndex, e) => {
    const { name, value } = e.target
    const newValue = removeCommas(value) || 0
    
    // Prevent entry of more than 15 digits in Input
    if (newValue.length > MAX_NUMBER_LENGTH) {
      return 
    }

    // Initialise updatedData
    const updatedData = hasUnsavedChanges ? [...editedData] : [...originalData]

    if (!updatedData[rowIndex] || !updatedData[rowIndex].values) {
      return
    }

    if (updatedData[rowIndex].values[valueIndex] !== newValue) {
      // Update the values in the updatedData array
      updatedData[rowIndex].values[valueIndex] = newValue

      const changedObjectId = updatedData[rowIndex].id[valueIndex]
      const label = updatedData[rowIndex].label
      const tableName = updatedData[rowIndex].table

      setEditedData(updatedData)

      // Track changes in modifiedFields state
      // Ensure the updatedChangedData object is properly initialized for the id
      if (!modifiedFields[changedObjectId]) {
        modifiedFields[changedObjectId] = []
      }

      // Check if the entry with the same label already exists for this id
      const existingChange = modifiedFields[changedObjectId].find((entry) => entry.label === label)

      if (existingChange) {
        // If the label exists, update the value
        existingChange.value = newValue
      } else {
        // If no entry exists for the label, add a new one
        modifiedFields[changedObjectId].push({
          id: changedObjectId,
          label: label,
          value: newValue,
          table: tableName,
        })
      }
      // Update the modifiedFields state with the updated changes
      setModifiedFields(modifiedFields)
    }
  }

  const saveData = async (modifiedFields) => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    updatePlanning(modifiedFields, token)
      .then(() => {
        alert('Sucessfully updated')
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('There was an error updating the planning data!', error)
        }
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const updatedData = editedData
      .map((row, rowIndex) => {
        const idArray = Array.isArray(row.id) ? row.id : []
        const valuesArray = Array.isArray(row.values) ? row.values : []
        // tableName = "costOfSale" or "expense"
        const tableName = editedData[rowIndex].table

        // Filter the ids and values to include only updated
        const filteredIds = []
        const filteredValues = []

        valuesArray.forEach((value, index) => {
          filteredIds.push(idArray[index])
          filteredValues.push(value)
        })

        // Only return the row if there are valid ids and values
        if (filteredIds.length > 0 && filteredValues.length > 0) {
          const filteredData = {
            id: filteredIds,
            label: row.label,
            values: filteredValues,
            table: tableName,
          }
          return filteredData
        }

        return null
      })
      .filter((row) => row !== null)
    // Used When switching beween Display and Edit (Unsaved Edited Data)
    setEditedData(updatedData)
    // # Backend Database Upd ate (API)
    saveData(updatedData)

    // # For Redux Store Update
    const costOfSalesData = Object.fromEntries(Object.entries(modifiedFields).filter(([id]) => id.startsWith('A')))
    const expensesData = Object.fromEntries(Object.entries(modifiedFields).filter(([id]) => id.startsWith('B')))
    // Actions to be dispatched on Update (Optimistic Update)
    const actions = [
      updateCostOfSalesPlanningScreen({
        modifiedFields: costOfSalesData,
      }),
      updateExpensesPlanningScreen({
        modifiedFields: expensesData,
      }),
    ]
    // Updates Frontend (redux store)
    actions.forEach((action) => dispatch(action))

    // Display Screen and Inputs for Editable data are the same
    // Temprorarily stored data for edit screen no longer needed.
    setHasUnsavedChanges(false)
  }

  const handleCancel = () => {
    setModifiedFields([])
    setEditedData(reduxState) //reset to initial values from redux store
    setHasUnsavedChanges(true)
  }

  const displayData = hasUnsavedChanges ? editedData : originalData

  // JSX Helpers
  const renderMonths = () => {
    return months.map((month, index) => (
      <th key={index} className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}>
        {month}月
      </th>
    ))
  }

  const renderHalfYears = () => {
    return halfYears.map((halfYear, index) => (
      <th key={index} className='sky-txt'>
        {translate(`${halfYear}`, language)}
      </th>
    ))
  }

  const renderPlanningHeaders = () => {
    return (
      <>
        <th className='borderless'></th>
        {months.map((_, index) => (
          <th key={index}>{translate('planning', language)}</th>
        ))}
        {halfYears.map((_, index) => (
          <th key={index} className=''>
            {translate('planning', language)}
          </th>
        ))}
      </>
    )
  }

  const isEditableInput = (item, valueIndex) => {
    if (!isRowEditable(item.label) || valueIndex >= 12) return false

    const id = item.id
    if (Array.isArray(id)) {
      return id[valueIndex] !== null && id[valueIndex] !== undefined
    }

    return id !== null && id !== undefined
  }

  const renderTableBody = () => {
    return displayData.map((item, index) => (
      <tr key={index}>
        <td className={noIndentLabels.includes(item.label) ? 'no-indent' : 'indented-label'}>
          {translate(item.label, language)}
        </td>
        {item.values.map((value, valueIndex) => (
          <td key={valueIndex}>
            {isEditableInput(item, valueIndex) ? (
              <input
                className='input_tag'
                type='text'
                value={formatNumberWithCommas(value)}
                onChange={(e) => handleInputChange(index, valueIndex, e)}
              />
            ) : (
              value.toLocaleString()
            )}
          </td>
        ))}
      </tr>
    ))
  }

  return (
    <div className='table-planning-container'>
      <div className='table-planning editScrollable'>
        <table>
          <thead>
            <tr>
              <th></th>
              {renderMonths()}
              {renderHalfYears()}
            </tr>
            <tr className='scnd-row'>{renderPlanningHeaders()}</tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
        <div className='button-container'>
          <button className='edit_cancel_btn' onClick={handleCancel} title={translate('resetExplanation', language)}>
            {translate('cancel', language)}
          </button>
          <button className='edit_submit_btn' onClick={handleSubmit}>
            {translate('update', language)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTablePlanning