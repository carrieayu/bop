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
import { handleDisableKeysOnNumberInputs, formatNumberWithCommas, handleInputChange } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs

const ExpensesResultsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/results')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('expensesResults')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [deleteExpenseId, setDeleteExpenseId] = useState([])
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [expensesResultsList, setExpensesResultsList] = useState([])
  const [originalExpenseResultsList, setOriginalExpensesResultsList] = useState(expensesResultsList)
  const token = localStorage.getItem('accessToken')

  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [deleteComplete, setDeleteComplete] = useState(false)

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
            setIsEditing((prevState) => !prevState)
          }
          useEffect(() => {
            if (isEditing) {
              setLanguage('jp')
            }
      
            if (!isEditing) {
              // Reset to original values when switching to list mode
              setExpensesResultsList(originalExpenseResultsList)
            }
          }, [isEditing])

  const handleChange = (index, e) => {
    handleInputChange(index, e, setExpensesResultsList, combinedData)
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
    const expensesListExistingRecords = expensesResultsList.filter((exp) => exp.expense_result_id !== null)
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

  // Since it's necessary for determining the sorting order of the year and month, the types should be unified.
  const normalizedExpensesResultsList = expensesResultsList.map((item) => ({
    ...item,
    month: parseInt(item.month, 10),
    year:  parseInt(item.year,  10),
  }));

  // Calculate the fiscal year based on the access date
  const getFiscalYearRange = (accessDate) => {
    const currentYear  = accessDate.getFullYear();
    const currentMonth = accessDate.getMonth() + 1;
    const startYear = currentMonth < 4 ? currentYear - 1 : currentYear;
    const endYear   = startYear + 1;

    return {
      startYear,
      endYear,
      startMonth: 4,
      endMonth: 3,
    };
  };
  
  // Filter and combine data based on the fiscal year range
  const getFiscalYearData = (normalizedExpensesResultsList, months, fiscalYearRange) => {
    const { startYear, endYear, startMonth, endMonth } = fiscalYearRange;
    return months.flatMap((month) => {
      const year =
        month >= startMonth && month <= 12
          ? startYear
          : month <= endMonth
          ? endYear
          : null;

      if (!year) return [];

      const foundData = normalizedExpensesResultsList.find(
        (item) => item.month === month && item.year === year
      );

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
      };
    });
  };

  // Determine the 'fiscal year' based on the system date at the time of access.
  const accessDate      = new Date();
  const fiscalYearRange = getFiscalYearRange(accessDate);
  const combinedData    = getFiscalYearData(normalizedExpensesResultsList, months, fiscalYearRange);

  // Filter valid data (only rows with an expense_result_id)
  const validData = combinedData.filter((data) => data.expense_result_id !== null);

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

    deleteExpenseResults(deleteExpenseId, token)
      .then(() => {
        updateExpensesList(deleteExpenseId)
        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('Error deleting expenses:', error)
        }
      })
  }

  // Set the Lists to match the DB after deletion.

  // Step #2
  const updateExpensesList = (deleteId) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    setOriginalExpensesResultsList((prevList) => prevList.filter((expense) => expense.expense_result_id !== deleteId))
    setDeleteComplete(true)
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      // original list has deleted the record with deleteID
      // The updated list used on Edit screen goes back to matching orginal list.
      setExpensesResultsList(originalExpenseResultsList)
    }
  }, [deleteComplete])

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
            <div className='expensesResultsList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'expensesResultsEdit' : 'expensesResultsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'projectSalesResultsShort', tabKey: 'projectSalesResults' },
                  { labelKey: 'employeeExpensesResultsShort', tabKey: 'employeeExpensesResults' },
                  { labelKey: 'expensesResultsShort', tabKey: 'expensesResults' },
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
                            const isLastExpenseOfYear = expenseResults.month === 3;
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
                                        type='text'
                                        name='consumable_expense'
                                        value={formatNumberWithCommas(expenseResults.consumable_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='rent_expense'
                                        value={formatNumberWithCommas(expenseResults.rent_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='tax_and_public_charge'
                                        value={formatNumberWithCommas(expenseResults.tax_and_public_charge)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='depreciation_expense'
                                        value={formatNumberWithCommas(expenseResults.depreciation_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='travel_expense'
                                        value={formatNumberWithCommas(expenseResults.travel_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='communication_expense'
                                        value={formatNumberWithCommas(expenseResults.communication_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>

                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='utilities_expense'
                                        value={formatNumberWithCommas(expenseResults.utilities_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='transaction_fee'
                                        value={formatNumberWithCommas(expenseResults.transaction_fee)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='advertising_expense'
                                        value={formatNumberWithCommas(expenseResults.advertising_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='entertainment_expense'
                                        value={formatNumberWithCommas(expenseResults.entertainment_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='professional_service_fee'
                                        value={formatNumberWithCommas(expenseResults.professional_service_fee)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='expensesResultsList_table_body_content_vertical delete_icon'>
                                      {expenseResults.expense_result_id !== null && (
                                        <RiDeleteBin6Fill
                                          className='delete-icon'
                                          onClick={() => openModal('expenses', expenseResults.expense_result_id)}
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
                          const isLastExpenseOfYear = expenseResults.month === 3;
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
                                  {formatNumberWithCommas(expenseResults.consumable_expense) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(expenseResults.rent_expense) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.tax_and_public_charge) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.depreciation_expense) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.travel_expense) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.communication_expense) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.utilities_expense) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.transaction_fee) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.advertising_expense) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.entertainment_expense) || 0}
                                </td>
                                <td className='expensesResultsList_table_body_content_vertical has-text-right'>
                                  {formatNumberWithCommas(expenseResults.professional_service_fee) || 0}
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
                      {translate('update', language)}
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
