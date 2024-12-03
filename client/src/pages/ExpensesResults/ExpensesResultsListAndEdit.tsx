import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import ListButtons from '../../components/ListButtons/ListButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import AlertModal from '../../components/AlertModal/AlertModal'
import { RiDeleteBin6Fill } from 'react-icons/ri'
import CrudModal from '../../components/CrudModal/CrudModal'
import '../../assets/scss/Components/SliderToggle.scss'
import { getExpenseResults } from '../../api/ExpenseResultEndpoint/GetExpenseResult'
import { updateExpenseResults } from '../../api/ExpenseResultEndpoint/UpdateExpenseResult'
import { deleteExpenseResults } from '../../api/ExpenseResultEndpoint/DeleteExpenseResult'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import {handleDisableKeysOnNumberInputs} from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs

const ExpensesResultsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('expensesResults')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  // added -ed
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [deleteExpenseId, setDeleteExpenseId] = useState([])
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [expensesResultsList, setExpensesResultsList] = useState([])
  const [originalExpenseResultsList, setOriginalExpensesResultsList] = useState(expensesResultsList)
  const token = localStorage.getItem('accessToken')
  const [changes, setChanges] = useState({}) //ians code maybe i do not need.

  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
  const monthNames: { [key: number]: { en: string; jp: string } } = {
    1: { en: 'January', jp: '1月' },
    2: { en: 'February', jp: '2月' },
    3: { en: 'March', jp: '3月' },
    4: { en: 'April', jp: '4月' },
    5: { en: 'May', jp: '5月' },
    6: { en: 'June', jp: '6月' },
    7: { en: 'July', jp: '7月' },
    8: { en: 'August', jp: '8月' },
    9: { en: 'September', jp: '9月' },
    10: { en: 'October', jp: '10月' },
    11: { en: 'November', jp: '11月' },
    12: { en: 'December', jp: '12月' },
  }
  const header: string[] = [
    'year',
    'month',
    'consumableExpenses',
    'rentExpenses',
    'taxesAndPublicCharges',
    'depreciationExpenses',
    'travelExpenses',
    'communicationExpenses',
    'utilitiesExpenses',
    'transactionFees',
    'advertisingExpenses',
    'entertainmentExpenses',
    'professionalServicesFees',
  ]

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'expensesResults':
        navigate('/expenses-results-list')
        break
      case 'projectSalesResults':
        navigate('/project-sales-results-list')
        break
      case 'employeeExpensesResults':
        navigate('/employee-expenses-results-list')
        break
      case 'costOfSalesResults':
        navigate('/cost-of-sales-results-list')
        break
      default:
        break
    }
  }

  const handleClick = () => {
    setIsEditing((prevState) => {
      const newEditingState = !prevState
      if (newEditingState) {
        setLanguage(initialLanguage)
      }

      return newEditingState
    })
  }

  const handleChange = (index, e) => {
    const { name, value } = e.target
    const updatedData = [...combinedData]
    updatedData[index] = {
      ...updatedData[index],
      [name]: value,
    }
    setExpensesResultsList(updatedData)
  }

  const handleSubmit = async () => {
    
    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'expenses'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateExpenses = (records) => validateRecords(records, fieldChecks, 'expense')

    // Expenses has default 12 (for each month)
    // Even if not all records have actually been created in DB: We need to filter out non-registered records.
    const expensesListExistingRecords = expensesResultsList.filter((exp) => exp.expense_id !== null)

    // Step 2: Validate client-side input
    const validationErrors = validateExpenses(expensesListExistingRecords) // Get the array of error messages

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month', 'project_name', 'business_division', 'client'] // Fields to check for duplicates
    const duplicateErrors = checkForDuplicates(expensesListExistingRecords, uniqueFields, 'project', language)

    // Step 4: Map error types to data and translation keys for handling in the modal
    const errorMapping = [
      { errors: validationErrors, errorType: 'normalValidation' },
      { errors: duplicateErrors, errorType: 'duplicateValidation' },
    ]

    // Step 5: Display the first set of errors found, if any
    const firstError = errorMapping.find(({ errors }) => errors.length > 0)

    if (firstError) {
      const { errors, errorType } = firstError
      const translatedErrors = translateAndFormatErrors(errors, language, errorType)
      setCrudMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsCRUDOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }
    // Continue with submission if no errors

    const getModifiedFields = (original, updated) => {
      const modifiedFields = []

      updated.forEach((updatedExpense) => {
        const originalExpense = original.find((exp) => exp.expense_result_id === updatedExpense.expense_result_id)

        if (originalExpense) {
          const changes = { expense_result_id: updatedExpense.expense_result_id }

          let hasChanges = false
          for (const key in updatedExpense) {
            if (key === 'expense_result_id' || key === 'month') continue
            if (updatedExpense[key] !== originalExpense[key] && updatedExpense[key] !== '') {
              changes[key] = updatedExpense[key]
              hasChanges = true
            }
          }

          if (hasChanges) {
            modifiedFields.push(changes)
          }
        }
      })
      return modifiedFields
    }

    const modifiedFields = getModifiedFields(originalExpenseResultsList, validData)
    if (modifiedFields.length === 0) {
      return
    }
   
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }
    console.log(modifiedFields)
    updateExpenseResults(modifiedFields, token)
      .then(() => {
        setOriginalExpensesResultsList(expensesResultsList)
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
        getExpenseResults(token)
          .then((data) => {
            setExpensesResultsList(data)
          })
          .catch((error) => {
            console.error('Error fetching expense:', error)
          })
      })
      .catch((error) => {
        if (error.response) {
          console.error('Error response:', error.response.data)
          if (error.response.status === 401) {
            window.location.href = '/login'
          } else {
            console.error('There was an error updating the expenses data!', error.response.data)
          }
        } else {
          console.error('Error', error.message)
        }
      })
  }

  const handleUpdateConfirm = async () => {
    await handleSubmit() // Call the submit function for update
    setIsUpdateConfirmationOpen(false)
  }

  const fetchExpenses = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login' // Redirect to login if no token found
      return
    }

    getExpenseResults(token)
      .then((data) => {
        console.log(data)
        setExpensesResultsList(data)
        setOriginalExpensesResultsList(data)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('There was an error fetching the expenses!', error)
        }
      })
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  // Extract unique years from the expenses data
  const uniqueYears = Array.from(new Set(expensesResultsList.map((item) => item.year))).sort((a, b) => a - b)

  // Combine static months with dynamic data
  const combinedData = uniqueYears.flatMap((year) => {
    return months.map((month) => {
      const foundData = expensesResultsList.find((item) => parseInt(item.month, 10) === month && item.year === year)

      return {
        expense_result_id: foundData ? foundData.expense_result_id : null,
        month,
        year,
        consumable_expense: foundData ? foundData.consumable_expense : '',
        rent_expense: foundData ? foundData.rent_expense : '',
        tax_and_public_charge: foundData ? foundData.tax_and_public_charge : '',
        depreciation_expense: foundData ? foundData.depreciation_expense : '',
        travel_expense: foundData ? foundData.travel_expense : '',
        communication_expense: foundData ? foundData.communication_expense : '',
        utilities_expense: foundData ? foundData.utilities_expense : '',
        transaction_fee: foundData ? foundData.transaction_fee : '',
        advertising_expense: foundData ? foundData.advertising_expense : '',
        entertainment_expense: foundData ? foundData.entertainment_expense : '',
        professional_service_fee: foundData ? foundData.professional_service_fee : '',
      }
    })
  })

  const validData = combinedData.filter((data) => data.expense_result_id !== null)

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    if (!isEditing) {
      const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
      setInitialLanguage(language)
      setLanguage(newLanguage)
    }
  }

  const openModal = (expense, id) => {
    setSelectedExpense(expense)
    setModalIsOpen(true)
    setDeleteExpenseId(id)
  }

  const closeModal = () => {
    setSelectedExpense(null)
    setModalIsOpen(false)
    setIsCRUDOpen(false)
  }

  const handleConfirm = async () => {
    console.log(deleteExpenseId)
    deleteExpenseResults(deleteExpenseId, token)
      .then(() => {
        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
        getExpenseResults(token)
          .then((data) => {
            setExpensesResultsList(data)
          })
          .catch((error) => {
            console.error('Error fetching expense:', error)
          })
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('Error deleting expenses:', error)
        }
      })
  }

  const handleNewRegistrationClick = () => {
    navigate('/expenses-results-registration')
  }

  return (
    <div className={'expensesResultsList_wrapper'}>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className={'expensesResultsList_cont_wrapper'}>
        <Sidebar />
        <div className={`expensesResultsList_wrapper ${isEditing ? 'editMode' : ''}`}>
          {/* <div className='expensesList_btn_cont_wrapper'> */}
          <div className='expensesResultsList_top_content'>
            <div className='expensesResultsList_top_body_cont'>
              <div className='expensesResultsList_mode_switch_datalist'>
                <div className='mode_switch_container'>
                  <p className='slider_mode_switch'>
                    {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                  </p>
                  <label className='slider_switch'>
                    <input type='checkbox' checked={isEditing} onChange={handleClick} />
                    <span className='slider'></span>
                  </label>
                </div>
              </div>
            </div>
            <div className='expensesResultsList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'expensesResultsEdit' : 'expensesResultsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'expensesResultsShort', tabKey: 'expensesResults' },
                  { labelKey: 'projectSalesResultsShort', tabKey: 'projectSalesResults' },
                  { labelKey: 'employeeExpensesResultsShort', tabKey: 'employeeExpensesResults' },
                  { labelKey: 'costOfSalesResultsShort', tabKey: 'costOfSalesResults' },
                ]}
              />
              <div className={`expensesResultsList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`expensesResultsList_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  {/* <div className='expensesList_table_cont'> */}
                  {/* <div className='columns is-mobile'> */}
                  {/* <div className='column'> */}
                  {isEditing ? (
                    <div className='editScroll'>
                      <table className='table is-bordered is-hoverable'>
                        <thead>
                          <tr className='expensesResultsList_table_title '>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('year', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('month', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('consumableExpenses', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('rentExpenses', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('taxesAndPublicCharges', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('depreciationExpenses', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('travelExpenses', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('communicationExpenses', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('utilitiesExpenses', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('transactionFees', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('advertisingExpenses', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('entertainmentExpenses', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('professionalServicesFees', language)}
                            </th>
                            <th className='expensesResultsList_table_title_content_vertical has-text-centered'></th>
                          </tr>
                        </thead>
                        <tbody className='expensesResultsList_table_body'>
                          {combinedData.map((expenseResults, index) => {
                            const isNewYear = index === 0 || combinedData[index - 1].year !== expenseResults.year
                            const isLastExpenseOfYear =
                              index !== combinedData.length - 1 && combinedData[index + 1].year !== expenseResults.year

                            const isEditable = expenseResults.expense_result_id !== null

                            return (
                              <React.Fragment key={index}>
                                {expenseResults ? (
                                  <tr key={index} className='expensesResultsList_table_body_content_horizontal'>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      {expenseResults.year}
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      {expenseResults.month}
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='consumable_expense'
                                        value={expenseResults.consumable_expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='rent_expense'
                                        value={expenseResults.rent_expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='tax_and_public_charge'
                                        value={expenseResults.tax_and_public_charge}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='depreciation_expense'
                                        value={expenseResults.depreciation_expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='travel_expense'
                                        value={expenseResults.travel_expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='communication_expense'
                                        value={expenseResults.communication_expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>

                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='utilities_expense'
                                        value={expenseResults.utilities_expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='transaction_fee'
                                        value={expenseResults.transaction_fee}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='advertising_expense'
                                        value={expenseResults.advertising_expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='entertainment_expense'
                                        value={expenseResults.entertainment_expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='number'
                                        name='professional_service_fee'
                                        value={expenseResults.professional_service_fee}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical delete_icon'>
                                      <RiDeleteBin6Fill
                                        className='delete-icon'
                                        onClick={() => openModal('expenses', expenseResults.expense_result_id)}
                                        style={{ color: 'red' }}
                                      />
                                    </td>
                                  </tr>
                                ) : null}
                                {isLastExpenseOfYear && (
                                  <tr className='year-separator'>
                                    <td className='horizontal-line-cell' colSpan={9}>
                                      <div className='horizontal-line' />
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <table className='table is-bordered is-hoverable'>
                      <thead>
                        <tr className='expensesResultsList_table_title '>
                          {header.map((head, index) => (
                            <th
                              key={index}
                              className='expensesResultsList_table_title_content_vertical has-text-centered'
                            >
                              {translate(head, language)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className='expensesResultsList_table_body'>
                        {combinedData.map((expenseResults, index) => {
                          const isNewYear = index === 0 || combinedData[index - 1].year !== expenseResults.year
                          const isLastExpenseOfYear =
                            index !== combinedData.length - 1 && combinedData[index + 1].year !== expenseResults.year

                          return (
                            <React.Fragment key={index}>
                              <tr className='expensesResultsList_table_body_content_horizontal'>
                                <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                  {expenseResults.year}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                  {expenseResults.month}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical'>
                                  {expenseResults.consumable_expense || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                  {expenseResults.rent_expense || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.tax_and_public_charge || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.depreciation_expense || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.travel_expense || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.communication_expense || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.utilities_expense || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.transaction_fee || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.advertising_expense || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.entertainment_expense || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {expenseResults.professional_service_fee || 0}
                                </td>
                              </tr>
                              {isLastExpenseOfYear && (
                                <tr className='year-separator'>
                                  <td className='horizontal-line-cell' colSpan={9}>
                                    <div className='horizontal-line' />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                  {/* </div> */}
                  {/* </div> */}
                  {/* </div> */}
                </div>
              </div>
            </div>
            <div className='expensesResultsList_is_editing_wrapper'>
              <div className='expensesResultsList_is_editing_cont'>
                {isEditing ? (
                  <div className='expensesResultsList_edit_submit_btn_cont'>
                    <button
                      className='expensesResultsList_edit_submit_btn'
                      onClick={() => {
                        setIsUpdateConfirmationOpen(true)
                      }}
                    >
                      更新
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={modalIsOpen}
        onConfirm={handleConfirm}
        onCancel={closeModal}
        message={translate('deleteMessage', language)}
      />
      <CrudModal
        isCRUDOpen={isCRUDOpen}
        onClose={closeModal}
        message={crudMessage}
        validationMessages={crudValidationErrors}
      />
      <AlertModal
        isOpen={isUpdateConfirmationOpen}
        onConfirm={handleUpdateConfirm}
        onCancel={() => setIsUpdateConfirmationOpen(false)}
        message={translate('updateMessage', language)}
      />
    </div>
  )
}

export default ExpensesResultsList
