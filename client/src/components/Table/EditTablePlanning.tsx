import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { updatePlanning } from '../../api/PlanningEndpoint/UpdatePlanning'
import { editingTableALabelsAndValues } from '../../utils/tableEditingALabelAndValues'
import { translate } from '../../utils/translationUtil'
import { editableLabels, halfYears, months, noIndentLabels, token } from '../../constants'
// HOOKS
import { useAppDispatch } from '../../actions/hooks'
import { useAppSelector } from '../../actions/hooks'
// SELECTORS
import { planningSelector } from '../../selectors/planning/planningSelector'
import { planningCalculationsSelector } from '../../selectors/planning/planningCalculationSelectors'
// REDUCERS
import { updateCostOfSalesPlanningScreen } from '../../reducers/costOfSale/costOfSaleSlice'
import { updateExpensesPlanningScreen } from '../../reducers/expenses/expensesSlice'

const EditTablePlanning = ({
  editableData,
  handleEditableData,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  changedData,
  setChangedData,
  setEditableData,
}) => {
  const dispatch = useAppDispatch()
  const planning = useAppSelector(planningSelector)
  const planningCalculations = useAppSelector(planningCalculationsSelector)

  const [data, setData] = useState([]) // empty array

  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')

  const updateEditableData = (newData) => {
    handleEditableData(newData) // Update the parent's state
  }

  useEffect(() => {
    console.log('hasUnsavedChanges', hasUnsavedChanges)
  }, [hasUnsavedChanges])

  useEffect(() => {
    setData(editingTableALabelsAndValues(planning, planningCalculations))
  }, [planning, planningCalculations])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const isRowEditable = (label) => editableLabels.includes(label)

  const handleInputChange = (rowIndex, valueIndex, e) => {
    // Get the updated data array
    const updatedData = hasUnsavedChanges ? [...editableData] : [...data]

    if (!updatedData[rowIndex] || !updatedData[rowIndex].values) {
      return
    }

    // Parse the new value and ensure it's a number
    const newValue = parseFloat(e.target.value) || 0

    if (updatedData[rowIndex].values[valueIndex] !== newValue) {
      // Update the values in the updatedData array
      updatedData[rowIndex].values[valueIndex] = newValue

      // Track changes in changedData state

      const previousChangedData = changedData
      const updatedChangedData = hasUnsavedChanges ? { ...previousChangedData } : { ...changedData }
      // const updatedChangedData = { ...changedData }
      const changedObjectId = updatedData[rowIndex].id[valueIndex]
      const label = updatedData[rowIndex].label
      const tableName = updatedData[rowIndex].table

      // Ensure the updatedChangedData object is properly initialized for the id
      if (!updatedChangedData[changedObjectId]) {
        updatedChangedData[changedObjectId] = []
      }

      // Check if the entry with the same label already exists for this id
      const existingChange = updatedChangedData[changedObjectId].find((entry) => entry.label === label)

      if (existingChange) {
        // If the label exists, update the value
        existingChange.value = newValue
      } else {
        // If no entry exists for the label, add a new one
        updatedChangedData[changedObjectId].push({
          id: changedObjectId,
          label: label,
          value: newValue,
          table: tableName,
        })
      }
      setEditableData(updatedData)

      // Update the changedData state with the updated changes
      setChangedData(updatedChangedData)
    }
  }

  const saveData = async (changedData) => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    updatePlanning(changedData, token)
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
    console.log('editableData', editableData)
    const updatedDataFiltered = hasUnsavedChanges ? [...editableData] : [...data]

    const updatedData = updatedDataFiltered
      .map((row, rowIndex) => {
        const idArray = Array.isArray(row.id) ? row.id : []
        const valuesArray = Array.isArray(row.values) ? row.values : []
        const tableName = updatedDataFiltered[rowIndex].table

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
          console.log('filtered data', filteredData)
          return filteredData
        }

        return null
      })
      .filter((row) => row !== null)
    // for switching
    updateEditableData(updatedData)

    const costOfSalesData = Object.fromEntries(Object.entries(changedData).filter(([id]) => id.startsWith('A')))
    const expensesData = Object.fromEntries(Object.entries(changedData).filter(([id]) => id.startsWith('B')))
    // Actions to be dispatched on Update (Optimistic Update)
    const actions = [
      updateCostOfSalesPlanningScreen({
        changedData: costOfSalesData,
      }),
      updateExpensesPlanningScreen({
        changedData: expensesData,
      }),
    ]
    // Updates Frontend (redux store)
    actions.forEach((action) => dispatch(action))
    // Updates Backend Database
    saveData(updatedData)
    // Display Screen and Inputs for Editable data are the same
    // Temprorarily stored data for edit screen not needed.
    setHasUnsavedChanges(false)
  }

  useEffect(() => {
    console.log('hasUnsavedChanges:', hasUnsavedChanges)
  }, [hasUnsavedChanges])

  const handleCancel = () => {
    // setHasUnsavedChanges(true)

    console.log('Before reset:', editableData)
    console.log('Original data:', data)
    setChangedData([])
    //original from redux store
    setEditableData(editingTableALabelsAndValues(planning, planningCalculations))
    setHasUnsavedChanges(true)

    setTimeout(() => {
      // setHasUnsavedChanges(false)
      console.log('After reset:', editableData)
    }, 500)
  }

  useEffect(() => {
    console.log('editableData updated:', editableData)
  }, [editableData])

  const displayData = hasUnsavedChanges ? editableData : data

  return (
    <div className='table-planning-container'>
      <div className='table-planning editScrollable'>
        <table>
          <thead>
            <tr>
              <th></th>
              {months.map((month, index) => (
                <th key={index} className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}>
                  {month}月
                </th>
              ))}
              {halfYears.map((halfYear, index) => (
                <th key={index} className='sky-txt'>
                  {translate(`${halfYear}`, language)}
                </th>
              ))}
            </tr>
            <tr className='scnd-row'>
              <th className='borderless'></th>
              {months.map((month, index) => (
                <th key={index}>{translate('planning', language)}</th>
              ))}
              {halfYears.map((_, index) => (
                <th key={index} className=''>
                  {translate('planning', language)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => (
              <tr key={index}>
                <td className={noIndentLabels.includes(item.label) ? 'no-indent' : 'indented-label'}>
                  {translate(item.label, language)}
                </td>
                {item.values.map((value, valueIndex) => (
                  <td key={valueIndex}>
                    {/* if item.id === undefined then the record does not exist so Input should be editable */}
                    {isRowEditable(item.label) &&
                    valueIndex < 12 &&
                    (Array.isArray(item.id)
                      ? item.id[valueIndex] !== null && item.id[valueIndex] !== undefined // Check each id in the array
                      : item.id !== null && item.id !== undefined) ? ( // For single id
                      <input
                        className='input_tag'
                        type='text'
                        value={value}
                        onChange={(e) => handleInputChange(index, valueIndex, e)}
                      />
                    ) : (
                      value.toLocaleString()
                    )}
                  </td>
                ))}
              </tr>
            ))}
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