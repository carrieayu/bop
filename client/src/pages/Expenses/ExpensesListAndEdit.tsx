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
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
  handleBackendError,
  handleSuccessMessages,
  handleGeneralErrorMessages,
} from '../../utils/validationUtil'
import { handleDisableKeysOnNumberInputs, formatNumberWithCommas, removeCommas, handlePLTabsClick } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import { monthNames, months, years, maximumEntries, planningScreenTabs } from '../../constants'
import { deleteExpense } from '../../api/ExpenseEndpoint/DeleteExpense'
import { getExpense } from '../../api/ExpenseEndpoint/GetExpense'
import { updateExpense } from '../../api/ExpenseEndpoint/UpdateExpense'
import { useTranslateSwitch } from '../../actions/hooks'


const ExpensesList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('expenses')
  const { language, setLanguage } = useLanguage()
  const { isTranslateSwitchActive, setIsTranslateSwitchActive } = useTranslateSwitch(language)
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [deleteExpenseId, setDeleteExpenseId] = useState([])
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [expensesList, setExpensesList] = useState([])
  const [originalExpenseList, setOriginalExpensesList] = useState(expensesList)
  const token = localStorage.getItem('accessToken')
  const [changes, setChanges] = useState({}) //ians code maybe i do not need.

  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [deleteComplete, setDeleteComplete] = useState(false)
  const [messageOrigin, setMessageOrigin] = useState('')

  const headers: string[] = [
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

  const onTabClick = (tab) => handlePLTabsClick(tab, navigate, setActiveTabOther)




  const handleClick = () => {
    setIsEditing((prevState) => {
      const newEditingState = !prevState
      if (newEditingState) {
        setLanguage(initialLanguage)
      }

      if (!newEditingState) {
        // Reset to original values when switching to list mode
        setExpensesList(originalExpenseList)
      }

      return newEditingState
    })
  }

  const handleChange = (index, e) => {
    const { name, value } = e.target

    // Remove commas to get the raw number
    // EG. 999,999 → 999999 in the DB
    const rawValue = removeCommas(value)

    const updatedData = [...combinedData]
    updatedData[index] = {
      ...updatedData[index],
      [name]: rawValue,
    }
    setExpensesList(updatedData)
  }

  const handleSubmit = async () => {
    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    // const recordType = 'expenses'
    // // Retrieve field validation checks based on the record type
    // const fieldChecks = getFieldChecks(recordType)
    // // Validate records for the specified project fields
    // const validateExpenses = (records) => validateRecords(records, fieldChecks, 'expense')

    // // Expenses has default 12 (for each month)
    // // Even if not all records have actually been created in DB: We need to filter out non-registered records.
    // const expensesListExistingRecords = expensesList.filter((exp) => exp.expense_id !== null)

    // // Step 2: Validate client-side input
    // const validationErrors = validateExpenses(expensesListExistingRecords) // Get the array of error messages

    // // Step 3: Check for duplicate entries on specific fields
    // const uniqueFields = ['year', 'month', 'project_name', 'business_division', 'client'] // Fields to check for duplicates
    // const duplicateErrors = checkForDuplicates(expensesListExistingRecords, uniqueFields, 'project', language)

    // // Step 4: Map error types to data and translation keys for handling in the modal
    // const errorMapping = [
    //   { errors: validationErrors, errorType: 'normalValidation' },
    //   { errors: duplicateErrors, errorType: 'duplicateValidation' },
    // ]

    // // Step 5: Display the first set of errors found, if any
    // const firstError = errorMapping.find(({ errors }) => errors.length > 0)

    // if (firstError) {
    //   const { errors, errorType } = firstError
    //   const translatedErrors = translateAndFormatErrors(errors, language, errorType)
    //   setCrudMessage(translatedErrors)
    //   setCrudValidationErrors(translatedErrors)
    //   setIsCRUDOpen(true)
    //   return
    // } else {
    //   setCrudValidationErrors([])
    // }
    // Continue with submission if no errors

    const getModifiedFields = (original, updated) => {
      const modifiedFields = []

      updated.forEach((updatedExpense) => {
        const originalExpense = original.find((exp) => exp.expense_id === updatedExpense.expense_id)

        if (originalExpense) {
          const changes = {
            expense_id: updatedExpense.expense_id,
            year: updatedExpense.year,
            month: updatedExpense.month,
          }

          let hasChanges = false
          for (const key in updatedExpense) {
            if (key === 'expense_id' || key === 'month') continue
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

    const modifiedFields = getModifiedFields(originalExpenseList, validData)
    if (modifiedFields.length === 0) {
      return
    }
    // Checks if any fields are empty for entries that have a expense_id
    const areFieldsEmpty = expensesList.some((entry) => {
      // Only check entries that have a valid expense_id
      if (entry.expense_id) {
        return (
          !entry.consumable_expense ||
          !entry.rent_expense ||
          !entry.tax_and_public_charge ||
          !entry.depreciation_expense ||
          !entry.travel_expense ||
          !entry.communication_expense ||
          !entry.utilities_expense ||
          !entry.transaction_fee ||
          !entry.advertising_expense ||
          !entry.entertainment_expense ||
          !entry.professional_service_fee
        )
      }
      return false // Skip entries without an expense_id
    })

    if (areFieldsEmpty) {
      setCrudMessage(translate('allFieldsRequiredInputValidationMessage', language))
      setIsCRUDOpen(true)
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      await updateExpense(modifiedFields, token)
      setOriginalExpensesList(expensesList)
      handleSuccessMessages(
        'expense',
        'update',
        setCrudValidationErrors,
        setIsCRUDOpen,
        setIsEditing,
        setMessageOrigin,
        language,
      )
    } catch (error) {
      handleBackendError(
        error,
        language,
        setCrudMessage,
        setIsCRUDOpen,
        setCrudValidationErrors,
        null, // overwrite modal ( for registration screens. Not necessary on list screens.)
        setMessageOrigin, // message origin (defines color of error)
        { formData: modifiedFields }, // submitted form data
      )
    }
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
    getExpense(token)
      .then((data) => {
        setExpensesList(data)
        setOriginalExpensesList(data)
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
  const uniqueYears = Array.from(new Set(expensesList.map((item) => item.year))).sort((a, b) => a - b)

  // Combine static months with dynamic data
  const combinedData = uniqueYears.flatMap((year) => {
    return months.map((month) => {
      const foundData = expensesList.find((item) => parseInt(item.month, 10) === month && item.year === year)

      return {
        expense_id: foundData ? foundData.expense_id : null,
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

  const validData = combinedData.filter((data) => data.expense_id !== null)

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

  // # Handle DELETE on Edit Screen

  // STEP # 1
  const handleConfirm = async () => {
    // Sets the Validation Errors if any to empty as they are not necessary for delete.
    setCrudValidationErrors([])

    try {
      await deleteExpense(deleteExpenseId, token)
      updateExpenseLists(deleteExpenseId)
            handleSuccessMessages(
              'expense',
              'delete',
              setCrudValidationErrors,
              setIsCRUDOpen,
              setIsEditing,
              setMessageOrigin,
              language,
            )
    }
    catch (error) {
            handleGeneralErrorMessages(
              error,
              language,
              setCrudMessage,
              setIsCRUDOpen,
              setCrudValidationErrors,
              'costOfSale',
              'delete',
            ) 
    }
  }
  // Set the Lists to match the DB after deletion.

  // Step #2
  const updateExpenseLists = (deleteId) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    setDeleteComplete(true)
    setOriginalExpensesList((prevList) => prevList.filter((exp) => exp.expense_id !== deleteId))
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      setExpensesList(originalExpenseList)
    }
  }, [deleteComplete, originalExpenseList])

  const handleNewRegistrationClick = () => {
    navigate('/expenses-registration')
  }

  return (
    <div className={'expensesList_wrapper'}>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className={'expensesList_cont_wrapper'}>
        <Sidebar />
        <div className={`expensesList_wrapper ${isEditing ? 'editMode' : ''}`}>
          {/* <div className='expensesList_btn_cont_wrapper'> */}
          <div className='expensesList_top_content'>
            <div className='expensesList_top_body_cont'>
              <div className='expensesList_mode_switch_datalist'>
                <div className='mode-switch-container'>
                  <p className='slider-mode-switch'>
                    {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                  </p>
                  <label className='slider-switch'>
                    <input type='checkbox' checked={isEditing} onChange={handleClick} />
                    <span className='slider'></span>
                  </label>
                </div>
              </div>
            </div>
            <div className='expensesList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'expensesEdit' : 'expensesList', language)}
                handleTabsClick={onTabClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={planningScreenTabs}
              />
              <div className={`expensesList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`expensesList_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  {/* <div className='expensesList_table_cont'> */}
                  {/* <div className='columns is-mobile'> */}
                  {/* <div className='column'> */}
                  {isEditing ? (
                    <div className='editScroll'>
                      <table className='table is-bordered is-hoverable'>
                        <thead>
                          <tr className='expensesList_table_title '>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('year', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('month', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('consumableExpenses', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('rentExpenses', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('taxesAndPublicCharges', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('depreciationExpenses', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('travelExpenses', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('communicationExpenses', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('utilitiesExpenses', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('transactionFees', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('advertisingExpenses', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('entertainmentExpenses', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate('professionalServicesFees', language)}
                            </th>
                            <th className='expensesList_table_title_content_vertical has-text-centered'></th>
                          </tr>
                        </thead>
                        <tbody className='expensesList_table_body'>
                          {combinedData.map((expense, index) => {
                            const isNewYear = index === 0 || combinedData[index - 1].year !== expense.year
                            const isLastExpenseOfYear =
                              index !== combinedData.length - 1 && combinedData[index + 1].year !== expense.year

                            const isEditable = expense.expense_id !== null

                            return (
                              <React.Fragment key={index}>
                                {expense ? (
                                  <tr key={index} className='expensesList_table_body_content_horizontal'>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      {expense.year}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      {expense.month}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='consumable_expense'
                                        value={formatNumberWithCommas(expense.consumable_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='rent_expense'
                                        value={formatNumberWithCommas(expense.rent_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='tax_and_public_charge'
                                        value={formatNumberWithCommas(expense.tax_and_public_charge)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='depreciation_expense'
                                        value={formatNumberWithCommas(expense.depreciation_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='travel_expense'
                                        value={formatNumberWithCommas(expense.travel_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='communication_expense'
                                        value={formatNumberWithCommas(expense.communication_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>

                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='utilities_expense'
                                        value={formatNumberWithCommas(expense.utilities_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='transaction_fee'
                                        value={formatNumberWithCommas(expense.transaction_fee)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='advertising_expense'
                                        value={formatNumberWithCommas(expense.advertising_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='entertainment_expense'
                                        value={formatNumberWithCommas(expense.entertainment_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='professional_service_fee'
                                        value={formatNumberWithCommas(expense.professional_service_fee)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesList_table_body_content_vertical delete_icon'>
                                      {expense.expense_id !== null && (
                                        <RiDeleteBin6Fill
                                          className='delete-icon'
                                          onClick={() => openModal('expenses', expense.expense_id)}
                                          style={{ color: 'red' }}
                                        />
                                      )}
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
                        <tr className='expensesList_table_title '>
                          {headers.map((head, index) => (
                            <th key={index} className='expensesList_table_title_content_vertical has-text-centered'>
                              {translate(head, language)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className='expensesList_table_body'>
                        {combinedData.map((expense, index) => {
                          const isNewYear = index === 0 || combinedData[index - 1].year !== expense.year
                          const isLastExpenseOfYear =
                            index !== combinedData.length - 1 && combinedData[index + 1].year !== expense.year

                          return (
                            <React.Fragment key={index}>
                              <tr className='expensesList_table_body_content_horizontal'>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {expense.year}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {expense.month}
                                </td>
                                <td className='expensesList_table_body_content_vertical'>
                                  {formatNumberWithCommas(expense.consumable_expense) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.rent_expense) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.tax_and_public_charge) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.depreciation_expense) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.travel_expense) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.communication_expense) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.utilities_expense) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.transaction_fee) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.advertising_expense) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.entertainment_expense) || 0}
                                </td>
                                <td className='expensesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expense.professional_service_fee) || 0}
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
            <div className='expensesList_is_editing_wrapper'>
              <div className='expensesList_is_editing_cont'>
                {isEditing ? (
                  <div className='expensesList_edit_submit_btn_cont'>
                    <button
                      className='expensesList_edit_submit_btn'
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
        messageOrigin={messageOrigin}
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

export default ExpensesList
