import React, { useEffect, useState } from 'react'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { updatePlanning } from '../../api/PlanningEndpoint/UpdatePlanning'
import { editableLabels, halfYears, months, noIndentLabels, token } from '../../constants'
import { editingTableALabelsAndValues } from '../../utils/tableEditingALabelAndValues'
import { useDispatch, useSelector } from 'react-redux'
import { updateCostOfSalesPlanningScreen, fetchCostOfSale } from '../../reducers/costOfSale/costOfSaleSlice'
import { useAppDispatch } from '../../actions/hooks'
import { useAppSelector } from '../../actions/hooks'
// SELECTORS
import { planningSelector } from '../../selectors/planning/planningSelector'
import { planningCalculationsSelector } from '../../selectors/planning/planningCalculationSelectors'
import { RootState } from '../../app/store'
import { handleError } from '../../utils/helperFunctionsUtil'

// Editing Screen Default Data is also from planning selector and planningCalculations

// [NOT DONE] 1. (A) Input data stays in input boxes on switch
                    //- planning data can stay as original, editing inputs should be whatever was input (unsaved)

// [done] 1. (B) - If updated planning and editing table data will be identical 
// [done] 2. When Update use redux.　[done]
// [done] 3. Redux should know the data has been updated and should rerender [done]


const EditTablePlanning = ({ editableDataTest, handleEditableDataTest }) => {
  const dispatch = useAppDispatch()

  const planning = useSelector(planningSelector)
  const planningCalculations = useSelector(planningCalculationsSelector)
  const costOfSalesList = useAppSelector((state) => state.costOfSale.list)
  console.log('costOfSalesList', costOfSalesList)

  const [data, setData] = useState([])
  const [testData, setTestData] = useState([])
  // TEST
  const [editableData, setEditableData] = useState(data)
  // const [editableData, setEditableData] = useState(editableDataTest)

  // console.log('editableDataTest AFTER', editableDataTest)
  const [previousData, setPreviousData] = useState([])
  const previousCostOfSaleData = costOfSalesList

  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')

  const testDataList = editingTableALabelsAndValues(planning, planningCalculations)
  const [changedData, setChangedData] = useState({})

  useEffect(() => {
    // PLANNING TABLE DATA
  }, [changedData])

  useEffect(() => {
    const updatedList = editingTableALabelsAndValues(planning, planningCalculations)
    setData(updatedList)
  }, [planning, planningCalculations])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const isRowEditable = (label) => editableLabels.includes(label)

const handleInputChange = (rowIndex, valueIndex, e) => {
  console.log('rowIndex, valueIndex, e', rowIndex, valueIndex, e)

  // Get the updated data array
  const updatedData = [...data]

  if (!updatedData[rowIndex] || !updatedData[rowIndex].values) {
    return
  }

  // Parse the new value and ensure it's a number
  const newValue = parseFloat(e.target.value) || 0
  console.log('newValue', newValue)

  if (updatedData[rowIndex].values[valueIndex] !== newValue) {
    // Update the values in the updatedData array
    updatedData[rowIndex].values[valueIndex] = newValue

    // Update the editable data state
    setEditableData(updatedData)

    // Track changes in changedData state
    const updatedChangedData = { ...changedData }
    const changedObjectId = updatedData[rowIndex].id[valueIndex]
    console.log('changedObjectId', changedObjectId, 'updatedData[row]', updatedData[rowIndex])

    const label = updatedData[rowIndex].label
    console.log('label', label)

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
      })
    }

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

    const updatedData = editableData
      .map((row, rowIndex) => {
        const idArray = Array.isArray(row.id) ? row.id : []
        const valuesArray = Array.isArray(row.values) ? row.values : []

        const previousRow = previousData[rowIndex]
        const previousValuesArray = Array.isArray(previousRow?.values) ? previousRow.values : []

        // Filter the ids and values to include only updated ones
        const filteredIds = []
        const filteredValues = []

        // console.log('filteredIds', filteredIds, 'filteredValues', filteredValues)
        valuesArray.forEach((value, index) => {
          if (value !== previousValuesArray[index] && value !== 0) {
            filteredIds.push(idArray[index])
            filteredValues.push(value)
          }
        })

        // Only return the row if there are valid ids and values
        if (filteredIds.length > 0 && filteredValues.length > 0) {
          
          const filteredData =  {
            id: filteredIds,
            label: row.label,
            values: filteredValues,
          }
          return filteredData
        }

        return null
      })
      .filter((row) => row !== null)

    dispatch(
      updateCostOfSalesPlanningScreen({
        changedData,
      }),
    )
    saveData(updatedData)
  }

  const displayData = editableDataTest.length > 0 ? editableDataTest : data

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
        <div className='div_submit'>
          <button className='edit_submit_btn' onClick={handleSubmit}>
            {translate('update', language)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTablePlanning