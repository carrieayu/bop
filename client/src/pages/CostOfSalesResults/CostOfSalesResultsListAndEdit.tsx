import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import Pagination from '../../components/Pagination/Pagination'
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
} from '../../utils/validationUtil'
import {
  handleDisableKeysOnNumberInputs,
  handleInputChange,
  formatNumberWithCommas,
  handleResultsListTabsClick,
  setupIdleTimer,
} from '../../utils/helperFunctionsUtil'
import { getCostOfSaleResults } from '../../api/CostOfSalesResultsEndpoint/GetCostOfSalesResults'
import { deleteCostOfSaleResults } from '../../api/CostOfSalesResultsEndpoint/DeleteCostOfSalesResults'
import { updateCostOfSaleResults } from '../../api/CostOfSalesResultsEndpoint/UpdateCostOfSalesResults'
import { months, resultsScreenTabs, token, IDLE_TIMEOUT } from '../../constants'

const CostOfSalesResultsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/results')
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const select = [5, 10, 100]
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [selectedCostOfSales, setSelectedCostOfSales] = useState<any>(null)
  const [deleteCostOfSalesId, setDeleteCostOfSalesId] = useState([])
  const [costOfSalesResults, setCostOfSalesResults] = useState([])
  const [originalCostOfSalesResults, setOriginalCostOfSalesResults] = useState(costOfSalesResults)
  const totalPages = Math.ceil(100 / 10)
  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [deleteComplete, setDeleteComplete] = useState(false)
  const [isNonActiveOpen, setIsNonActiveOpen] = useState(false)
  const onTabClick = (tab) => handleResultsListTabsClick(tab, navigate, setActiveTab)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (numRows: number) => {
    setRowsPerPage(numRows)
    setCurrentPage(0)
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
      setCostOfSalesResults(originalCostOfSalesResults)
    }
  }, [isEditing])

  const handleChange = (index, e) => {
    handleInputChange(index, e, setCostOfSalesResults, combinedData)
  }

  const handleSubmit = async () => {
    // Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'costOfSalesResults'

    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateCostOfSales = (records) => validateRecords(records, fieldChecks, 'costOfSalesResults')

    // Expenses has default 12 (for each month)
    // Even if not all records have actually been created in DB: We need to filter out non-registered records.
    const costOfSalesListExistingRecords = costOfSalesResults.filter((cos) => cos.cost_of_sale_result_id !== null)

    // Step 2: Validate client-side input
    const validationErrors = validateCostOfSales(costOfSalesListExistingRecords)

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month', 'project_name', 'business_division', 'client']
    const duplicateErrors = checkForDuplicates(
      costOfSalesListExistingRecords,
      uniqueFields,
      'costOfSalesResults',
      language,
    )

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
      // setModalIsOpen(true)
      setIsCRUDOpen(true)

      return
    } else {
      setCrudValidationErrors([])
    }
    // Continue with submission if no errors

    const getModifiedFields = (original, updated) => {
      const modifiedFields = []

      updated.forEach((updatedCos) => {
        const originalCoS = original.find((cos) => cos.cost_of_sale_result_id === updatedCos.cost_of_sale_result_id)

        if (originalCoS) {
          const changes = { cost_of_sale_result_id: updatedCos.cost_of_sale_result_id }

          let hasChanges = false
          for (const key in updatedCos) {
            if (key === 'cost_of_sale_result_id ' || key === 'month') continue
            if (updatedCos[key] !== originalCoS[key] && updatedCos[key] !== '') {
              changes[key] = updatedCos[key]
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

    const modifiedFields = getModifiedFields(originalCostOfSalesResults, validData)
    if (modifiedFields.length === 0) {
      return
    }

    if (!token) {
      window.location.href = '/login'
      return
    }
    updateCostOfSaleResults(modifiedFields, token)
      .then(() => {
        setOriginalCostOfSalesResults(costOfSalesResults)
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response) {
          console.error('Error response:', error.response.data)
          if (error.response.status === 401) {
            window.location.href = '/login'
          } else {
            console.error('There was an error updating the cost of sales data!', error.response.data)
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

  useEffect(() => {
    const fetchCostOfSales = async () => {
      if (!token) {
        window.location.href = '/login' // Redirect to login if no token found
        return
      }

      try {
        getCostOfSaleResults(token).then((data) => {
          setCostOfSalesResults(data)
          setOriginalCostOfSalesResults(data)
        })
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('There was an error fetching the cost of sales data!', error)
        }
      }
    }

    fetchCostOfSales()
  }, [])

  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(costOfSalesResults.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, costOfSalesResults])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  // Since it's necessary for determining the sorting order of the year and month, the types should be unified.
  const normalizedCostOfSalesResults = costOfSalesResults.map((item) => ({
    ...item,
    month: parseInt(item.month, 10),
    year: parseInt(item.year, 10),
  }))

  // Calculate the fiscal year based on the access date
  const getFiscalYearRange = (accessDate) => {
    const currentYear = accessDate.getFullYear()
    const currentMonth = accessDate.getMonth() + 1
    const startYear = currentMonth < 4 ? currentYear - 1 : currentYear
    const endYear = startYear + 1

    return {
      startYear,
      endYear,
      startMonth: 4,
      endMonth: 3,
    }
  }

  // Filter and combine data based on the fiscal year range
  const getFiscalYearData = (normalizedCostOfSalesResults, months, fiscalYearRange) => {
    const { startYear, endYear, startMonth, endMonth } = fiscalYearRange
    return months.flatMap((month) => {
      const year = month >= startMonth && month <= 12 ? startYear : month <= endMonth ? endYear : null

      if (!year) return []

      const foundData = normalizedCostOfSalesResults.find((item) => item.month === month && item.year === year)

      return {
        cost_of_sale_result_id: foundData ? foundData.cost_of_sale_result_id : null,
        month,
        year,
        purchase: foundData ? foundData.purchase : '',
        outsourcing_expense: foundData ? foundData.outsourcing_expense : '',
        product_purchase: foundData ? foundData.product_purchase : '',
        dispatch_labor_expense: foundData ? foundData.dispatch_labor_expense : '',
        communication_expense: foundData ? foundData.communication_expense : '',
        work_in_progress_expense: foundData ? foundData.work_in_progress_expense : '',
        amortization_expense: foundData ? foundData.amortization_expense : '',
      }
    })
  }

  // Determine the 'fiscal year' based on the system date at the time of access.
  const accessDate = new Date()
  const fiscalYearRange = getFiscalYearRange(accessDate)
  const combinedData = getFiscalYearData(normalizedCostOfSalesResults, months, fiscalYearRange)

  // Filter valid data (only rows with an cost_of_sale_result_id)
  const validData = combinedData.filter((data) => data.cost_of_sale_result_id !== null)

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const openModal = (users, id) => {
    setSelectedCostOfSales(users)
    setModalIsOpen(true)
    setDeleteCostOfSalesId(id)
  }

  const closeModal = () => {
    setSelectedCostOfSales(null)
    setModalIsOpen(false)
    setIsCRUDOpen(false)
  }

  // # Handle DELETE on Edit Screen

  // STEP # 1
  const handleConfirm = async () => {
    // Sets the Validation Errors if any to empty as they are not necessary for delete.
    setCrudValidationErrors([])

    deleteCostOfSaleResults(deleteCostOfSalesId, token)
      .then(() => {
        updateCostOfSaleResultLists(deleteCostOfSalesId)
        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        // getCostOfSaleResults(token)
        //   .then((data) => {
        //     setCostOfSalesResults(data)
        //     setIsEditing(false)
        //   })
        //   .catch(() => {})
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('Error deleting cost of sale result:', error)
        }
      })
  }

  // Set the Lists to match the DB after deletion.

  // Step #2
  const updateCostOfSaleResultLists = (deleteId) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    setOriginalCostOfSalesResults((prevList) => prevList.filter((cos) => cos.cost_of_sale_result_id !== deleteId))
    setDeleteComplete(true)
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      // original list has deleted the record with deleteID
      // The updated list used on Edit screen goes back to matching orginal list.
      setCostOfSalesResults(originalCostOfSalesResults)
    }
  }, [deleteComplete])

  const handleNewRegistrationClick = () => {
    navigate('/cost-of-sales-results-registration')
  }

  const [isIdle, setIsIdle] = useState(false);
  useEffect(() => {
    const onIdle = () => {
      setIsIdle(true);
      setIsNonActiveOpen(true)
    };
    const idleTimer = setupIdleTimer(onIdle, IDLE_TIMEOUT);
    idleTimer.startListening();
    return () => {
      idleTimer.stopListening();
    };
  }, []);

  const handleNonActiveConfirm = async () => {
    setIsNonActiveOpen(false)
    window.location.href = '/login'
  }

  return (
    <div className='costOfSalesResultsList_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='costOfSalesResultsList_cont_wrapper'>
        <Sidebar />
        <div className='costOfSalesResultsList_btn_wrapper'>
          <div className='costOfSalesResultsList_top_content'>
            <div className='costOfSalesResultsList_top_body_cont'>
              <div className='costOfSalesResultsList_mode_switch_datalist'>
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
            <div className='costOfSalesResultsList_mid_body_cont'>
              <ListButtons
                activeTabOther={'costOfSalesResults'}
                message={translate(isEditing ? 'costOfSalesResultsEdit' : 'costOfSalesResultsList', language)}
                handleTabsClick={onTabClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={resultsScreenTabs}
              />
              <div className={`costOfSalesResultsList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className='costOfSalesResultsList_table_cont'>
                  {/* <div className='columns is-mobile'> */}
                  {/* <div className='column'> */}
                  {isEditing ? (
                    <div>
                      <table className='table is-bordered is-hoverable'>
                        <thead>
                          <tr className='costOfSalesResultsList_table_title '>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('year', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('month', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('purchases', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('outsourcingExpenses', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('productPurchases', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('dispatchLaborExpenses', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('communicationExpenses', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('workInProgressExpenses', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('amortizationExpenses', language)}
                            </th>
                            <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'></th>
                          </tr>
                        </thead>
                        <tbody className='costOfSalesResultsList_table_body'>
                          {combinedData.map((costOfSale, index) => {
                            const isLastCostOfSaleOfYear = costOfSale.month === 3
                            const isEditable = costOfSale.cost_of_sale_result_id !== null

                            return (
                              <React.Fragment key={index}>
                                {costOfSale ? (
                                  <tr className='costOfSalesResultsList_table_body_content_horizontal'>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      {costOfSale.year}
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      {costOfSale.month}
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='purchase'
                                        value={formatNumberWithCommas(costOfSale.purchase)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='outsourcing_expense'
                                        value={formatNumberWithCommas(costOfSale.outsourcing_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='product_purchase'
                                        value={formatNumberWithCommas(costOfSale.product_purchase)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='dispatch_labor_expense'
                                        value={formatNumberWithCommas(costOfSale.dispatch_labor_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='communication_expense'
                                        value={formatNumberWithCommas(costOfSale.communication_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='work_in_progress_expense'
                                        value={formatNumberWithCommas(costOfSale.work_in_progress_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='amortization_expense'
                                        value={formatNumberWithCommas(costOfSale.amortization_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesResultsList_table_body_content_vertical delete_icon'>
                                      {costOfSale.cost_of_sale_result_id !== null && (
                                        <RiDeleteBin6Fill
                                          className='delete-icon'
                                          onClick={() =>
                                            openModal('costOfSalesResultsResults', costOfSale.cost_of_sale_result_id)
                                          }
                                          style={{ color: 'red' }}
                                        />
                                      )}
                                    </td>
                                  </tr>
                                ) : null}
                                {isLastCostOfSaleOfYear && (
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
                        <tr className='costOfSalesResultsList_table_title '>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('year', language)}
                          </th>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('month', language)}
                          </th>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('purchases', language)}
                          </th>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('outsourcingExpenses', language)}
                          </th>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('productPurchases', language)}
                          </th>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('dispatchLaborExpenses', language)}
                          </th>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('communicationExpenses', language)}
                          </th>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('workInProgressExpenses', language)}
                          </th>
                          <th className='costOfSalesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('amortizationExpenses', language)}
                          </th>
                        </tr>
                      </thead>
                      <tbody className='costOfSalesResultsList_table_body'>
                        {combinedData.map((costOfSale, index) => {
                          const isLastCostOfSaleOfYear = costOfSale.month === 3
                          return (
                            <React.Fragment key={index}>
                              <tr className='costOfSalesResultsList_table_body_content_horizontal'>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {costOfSale.year || 0}
                                </td>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {costOfSale.month}
                                </td>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.purchase) || 0}
                                </td>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.outsourcing_expense) || 0}
                                </td>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.product_purchase) || 0}
                                </td>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.dispatch_labor_expense) || 0}
                                </td>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.communication_expense) || 0}
                                </td>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.work_in_progress_expense) || 0}
                                </td>
                                <td className='costOfSalesResultsList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.amortization_expense) || 0}
                                </td>
                              </tr>
                              {isLastCostOfSaleOfYear && (
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
                </div>
              </div>
              <div className='costOfSalesResultsList_is_editing_wrapper'>
                <div className='costOfSalesResultsList_is_editing_cont'>
                  {isEditing ? (
                    <div className='costOfSalesResultsList_edit_submit_btn_cont'>
                      <button
                        className='costOfSalesResultsList_edit_submit_btn'
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
            </div>
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
      <AlertModal
        isOpen={isNonActiveOpen}
        onConfirm={handleNonActiveConfirm}
        onCancel={() => setIsNonActiveOpen(false)}
        message={translate('nonActiveMessage', language)}
      />
    </div>
  )
}

export default CostOfSalesResultsList
