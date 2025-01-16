import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import { handleDisableKeysOnNumberInputs, sortByFinancialYear } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import { filterCostOfSaleResults } from '../../api/CostOfSalesResultsEndpoint/FilterCostOfSalesResults'
import { createCostOfSaleResults } from '../../api/CostOfSalesResultsEndpoint/CreateCostOfSalesResults'
import { overwriteCostOfSaleResults } from '../../api/CostOfSalesResultsEndpoint/OverwriteCostOfSalesResults'
import { formatNumberWithCommas } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import { removeCommas } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import { getCostOfSale } from '../../api/CostOfSalesEndpoint/GetCostOfSale'

const months = ['4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3']
type CostOfSaleResults = {
  month: string
  year: string
  cost_of_sale_id : string
}
type CostOfSaleResult = {
  cosr: CostOfSaleResults[]
}
type FilterParams = {
  month?: string
  year?: string
}
const CostOfSalesResultsRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('costOfSalesResults')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const years = [2024, 2025]
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [costOfSaleResultsData, setCostOfSaleResultsData] = useState<CostOfSaleResult[]>([{ cosr: [] }])
  const [filteredMonth, setFilteredMonth] = useState<any>([{ month: []}])
  const [costOfSaleYear, setCostOfSalesYear] = useState<any>([])
  const [formData, setFormData] = useState([
    {
      year: '',
      month: '',
      purchase: '',
      outsourcing_expense: '',
      product_purchase: '',
      dispatch_labor_expense: '',
      communication_expense: '',
      work_in_progress_expense: '',
      amortization_expense: '',
      cost_of_sale: '',
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false)
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false)
  const token = localStorage.getItem('accessToken')
  const maximumEntries = 10
  
  const uniqueYears = costOfSaleYear.reduce((acc, item) => {
    if (!acc.includes(item.year)) {
      acc.push(item.year)
    }
    return acc
  }, [])

  const handleAdd = () => {
    if (formData.length < maximumEntries) {
      const newFormData = [...formData]
      newFormData.push({
        year: '',
        month: '',
        purchase: '',
        outsourcing_expense: '',
        product_purchase: '',
        dispatch_labor_expense: '',
        communication_expense: '',
        work_in_progress_expense: '',
        amortization_expense: '',
        cost_of_sale: '',
        // registered_user_id: storedUserID, //for testing and will be removed it not used for future use
      })
      setFormData(newFormData)
      setCostOfSaleResultsData([...costOfSaleResultsData, { cosr: [] }])
      setFilteredMonth([...filteredMonth, { month: []}])
    } else {
      console.log('You can only add up to 10 forms.')
    }
  }

  const handleMinus = () => {
    if (formData.length > 1) {
      const newFormData = [...formData]
      newFormData.pop()
      setFormData(newFormData)
    }
  }
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'projectSalesResults':
        navigate('/project-sales-results-list')
        break
      case 'expensesResults':
        navigate('/expenses-results-list')
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

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal()
  }

  const handleRemoveInputData = () => {
    setFormData([
      {
        year: '',
        month: '',
        purchase: '',
        outsourcing_expense: '',
        product_purchase: '',
        dispatch_labor_expense: '',
        communication_expense: '',
        work_in_progress_expense: '',
        amortization_expense: '',
        cost_of_sale: '',
      },
    ])
    closeModal()
  }

  const openModal = () => {
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target
    const rawValue = removeCommas(value)
    setFormData((prevFormData) => {
      return prevFormData.map((form, i) => {
        if (i === index) {
          const resetFields = {
            params : ["months"],
          }
          let month = form.month
          if(name == 'year' && value == '') {
              form.month = ''
              setFilteredMonth(prev => {
              return prev.map((eachMonth, monthIndex) => {
                  if (index == monthIndex) {
                    return [{}]
                  }
                  return eachMonth
              })
              })
          }
          const fieldsToReset = resetFields[name] || []
          const resetValues = fieldsToReset.reduce((acc, field) => {
            acc[field] = ''
            return acc
          }, {})
          return {
            ...form,
            [name]: rawValue,
            ...resetValues
          }
        }
        return form
      })
    })
  }



  const handleSubmit = async (e) => {
    e.preventDefault()

    let combinedObject = formData.map((form, index) => {
      const cost_of_sale = filteredMonth[index]?.month?.find((month) => month.month === form.month)?.cost_of_sale_id
      return {
        ...form,
        cost_of_sale,
      }
    })

    // Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'costOfSalesResults'

    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateCostOfSalesResults = (records) => validateRecords(records, fieldChecks, 'costOfSalesResults')

    // Step 2: Validate client-side input
    const validationErrors = validateCostOfSalesResults(combinedObject)

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month']
    const duplicateErrors = checkForDuplicates(combinedObject, uniqueFields, 'costOfSalesResults', language)

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
      setModalMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsModalOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }
    // Continue with submission if no errors

    if (!token) {
      window.location.href = '/login'
      return
    }

    createCostOfSaleResults(combinedObject, token)
      .then((data) => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setFormData([
          {
            year: '',
            month: '',
            purchase: '',
            outsourcing_expense: '',
            product_purchase: '',
            dispatch_labor_expense: '',
            communication_expense: '',
            work_in_progress_expense: '',
            amortization_expense: '',
            cost_of_sale: '',
          },
        ])
      })
      .catch((error) => {
        if (error.response && error.response.status === 409) {
          const existingEntries = error.response.data.existingEntries

          // Map to create a string of existing entries
          const existingYearsMonths = existingEntries.map((entry) => `'${entry.year}, ${entry.month}'`).join(', ')

          // Filter out new entries that don't match the existing entries
          const newEntries = combinedObject.filter((item) => {
            return !existingEntries.some((existing) => existing.year === item.year && existing.month === item.month)
          })

          // Create a string for only the new entries being submitted
          const newYearsMonths = newEntries.map((entry) => `'${entry.year}, ${entry.month}'`).join(', ')

          // Construct the alert message
          let message = translate('alertMessageAbove', language).replace('${existingEntries}', existingYearsMonths)

          // Only append the new entries part if there are new entries
          if (newYearsMonths.length > 0) {
            message += translate('alertMessageNewEntries', language).replace('${newEntries}', newYearsMonths)
          }

          setModalMessage(message)
          setIsOverwriteModalOpen(true)
          return
        } else {
          console.error('There was an error with expenses registration!', error)
        }
      })
  }

  // Handle overwrite confirmation
  const handleOverwriteConfirmation = async () => {
    setIsOverwriteModalOpen(false) // Close the overwrite modal
    setIsOverwriteConfirmed(true) // Set overwrite confirmed state

    // Call the submission method again after confirmation
    await handleSubmitConfirmed()
  }

  const handleSubmitConfirmed = async () => {
    const getId = costOfSaleResultsData.flatMap((cosr) => {
      return cosr.cosr.map((item) => item.cost_of_sale_id)
    })

    const costOfSalesData = formData.map((cos) => ({
      year: cos.year,
      month: cos.month,
      purchase: cos.purchase,
      outsourcing_expense: cos.outsourcing_expense,
      product_purchase: cos.product_purchase,
      dispatch_labor_expense: cos.dispatch_labor_expense,
      communication_expense: cos.communication_expense,
      work_in_progress_expense: cos.work_in_progress_expense,
      amortization_expense: cos.amortization_expense,
    }))

    let combinedObject = formData.map(() => ({
      year: '',
      month: '',
      purchase: '',
      outsourcing_expense: '',
      product_purchase: '',
      dispatch_labor_expense: '',
      communication_expense: '',
      work_in_progress_expense: '',
      amortization_expense: '',
    }))

    const updatedCombinedObject = combinedObject.map((item, index) => {
      const relatedCoSRId = getId[index] || null
      return {
        ...item,
        ...costOfSalesData[index],
        cost_of_sale_id: relatedCoSRId, // Add the ID as a specific field
      }
    })

    try {
      overwriteCostOfSaleResults(updatedCombinedObject, token).then((data) => {
        setModalMessage(translate('overWrite', language))
        setIsModalOpen(true)
        setFormData([
          {
            year: '',
            month: '',
            purchase: '',
            outsourcing_expense: '',
            product_purchase: '',
            dispatch_labor_expense: '',
            communication_expense: '',
            work_in_progress_expense: '',
            amortization_expense: '',
            cost_of_sale: '',
          },
        ])
      })
      
    } catch (overwriteError) {
      console.error('Error overwriting data:', overwriteError)
    } finally {
      setIsOverwriteConfirmed(false) // Reset overwrite confirmation
    }
  }

  useEffect(() => {
    formData.forEach((cosr, index) => {
      let month = cosr.month || ""
      const year = cosr.year || ""
        let filterParams: FilterParams = {
          ...(year !== null && { year }),
        }
        if (filterParams.year) {
          filterCostOfSaleResults(filterParams, token).then((data) => {
            setCostOfSaleResultsData((prev) => {
              return prev.map((row, projectIndex) => {
                if (index == projectIndex) {
                  return {
                    cosr: data,
                  }
                }
                return row
              })
            })
            setFilteredMonth((prev) => {
              return prev.map((month, monthIndex) => {
                if (index == monthIndex) {
                  return { month: data }
                }
                return month
              })
            })
          })
        }
    })
    getCostOfSale(token)
      .then((data) => {
        setCostOfSalesYear(data)
      })
      .catch((error) => {
        console.log(' error fetching cost of sales data: ' + error)
      })
  }, [formData])
  

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

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

  const handleListClick = () => {
    navigate('/cost-of-sales-results-list')
  }

  return (
    <div className='costOfSalesResultsRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='costOfSalesResultsRegistration_content_wrapper'>
        <Sidebar />
        <div className='costOfSalesResultsRegistration_data_content'>
          <div className='costOfSalesResultsRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('costOfSalesResultsRegistration', language)}
              handleTabsClick={handleTabsClick}
              handleListClick={handleListClick}
              buttonConfig={[
                { labelKey: 'projectSalesResultsShort', tabKey: 'projectSalesResults' },
                { labelKey: 'employeeExpensesResultsShort', tabKey: 'employeeExpensesResults' },
                { labelKey: 'expensesResultsShort', tabKey: 'expensesResults' },
                { labelKey: 'costOfSalesResultsShort', tabKey: 'costOfSalesResults' },
              ]}
            />
          </div>
          <div className='costOfSalesResultsRegistration_mid_body_cont'>
            <form className='costOfSalesResultsRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='costOfSalesResultsRegistration_mid_form_cont'>
                {formData.map((form, index) => (
                  <div
                    key={index}
                    className={`costOfSalesResultsRegistration_form-content ${index > 0 ? 'costOfSalesResultsRegistration_form-content-special' : ''}`}
                  >
                    <div
                      className={`costOfSalesResultsRegistration_form-content ${index > 0 ? 'costOfSalesResultsRegistration_form-line' : ''}`}
                    ></div>
                    <div className='costOfSalesResultsRegistration_form-content-div'>
                      <div className='costOfSalesResultsRegistration_left-form-div costOfSalesResultsRegistration_calc'>
                        <div className='costOfSalesResultsRegistration_year-div'>
                          <label className='costOfSalesResultsRegistration_year'>{translate('year', language)}</label>
                          <select
                            className='costOfSalesResultsRegistration_select-option'
                            name='year'
                            value={form.year}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectYear', language)}</option>
                            {uniqueYears.map((year, i) => (
                              <option key={i} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='costOfSalesResultsRegistration_outsourcing_expense-div'>
                          <label className='costOfSalesResultsRegistration_outsourcing_expense'>
                            {translate('outsourcingExpenses', language)}
                          </label>
                          <input
                            type='text'
                            name='outsourcing_expense'
                            value={formatNumberWithCommas(form.outsourcing_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='costOfSalesResultsRegistration_communication_expense-div'>
                          <label className='costOfSalesResultsRegistration_communication_expense'>
                            {translate('communicationExpenses', language)}
                          </label>
                          <input
                            type='text'
                            name='communication_expense'
                            value={formatNumberWithCommas(form.communication_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>
                      <div className='costOfSalesResultsRegistration_middle-form-div costOfSalesResultsRegistration_calc'>
                        <div className='costOfSalesResultsRegistration_month-div'>
                          <label className='costOfSalesResultsRegistration_month'>{translate('month', language)}</label>

                          <select
                            className='costOfSalesResultsRegistration_select-option'
                            name='month'
                            value={form.month}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectMonth', language)}</option>
                            {sortByFinancialYear(filteredMonth[index]?.month || []).map((month, idx) => (
                              <option key={idx} value={month.month}>
                                {language === 'en' ? monthNames[month.month].en : monthNames[month.month].jp}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='costOfSalesResultsRegistration_product_purchase-div'>
                          <label className='costOfSalesResultsRegistration_product_purchase'>
                            {translate('productPurchases', language)}
                          </label>
                          <input
                            type='text'
                            name='product_purchase'
                            value={formatNumberWithCommas(form.product_purchase)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='costOfSalesResultsRegistration_work_in_progress_expense-div'>
                          <label className='costOfSalesResultsRegistration_work_in_progress_expense'>
                            {translate('workInProgressExpenses', language)}
                          </label>
                          <input
                            type='text'
                            name='work_in_progress_expense'
                            value={formatNumberWithCommas(form.work_in_progress_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>
                      <div className='costOfSalesResultsRegistration_right-form-div costOfSalesResultsRegistration_calc'>
                        <div className='costOfSalesResultsRegistration_purchase-div'>
                          <label className='costOfSalesResultsRegistration_purchase'>
                            {translate('purchases', language)}
                          </label>
                          <input
                            type='text'
                            name='purchase'
                            value={formatNumberWithCommas(form.purchase)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='costOfSalesResultsRegistration_dispatch_labor_expense-div'>
                          <label className='costOfSalesResultsRegistration_dispatch_labor_expense'>
                            {translate('dispatchLaborExpenses', language)}
                          </label>
                          <input
                            type='text'
                            name='dispatch_labor_expense'
                            value={formatNumberWithCommas(form.dispatch_labor_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='costOfSalesResultsRegistration_amortization_expense-div'>
                          <label className='costOfSalesResultsRegistration_amortization_expense'>
                            {translate('amortizationExpenses', language)}
                          </label>
                          <input
                            type='text'
                            name='amortization_expense'
                            value={formatNumberWithCommas(form.amortization_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>
                    </div>
                    {/* <input type='hidden' name='registered_user_id' value={form.registered_user_id} /> */}
                  </div>
                ))}
              </div>
              <div className='costOfSalesResultsRegistration_lower_form_cont'>
                <div className='costOfSalesResultsRegistration_form-content'>
                  <div className='costOfSalesResultsRegistration_plus-btn'>
                    {formData.length >= 2 ? (
                      <button className='costOfSalesResultsRegistration_dec' type='button' onClick={handleMinus}>
                        -
                      </button>
                    ) : (
                      <div className='costOfSalesResultsRegistration_dec_empty'></div>
                    )}
                    <button
                      className='costOfSalesResultsRegistration_inc custom-disabled'
                      type='button'
                      onClick={handleAdd}
                      disabled={formData.length === maximumEntries}
                    >
                      +
                    </button>
                  </div>
                  <div className='costOfSalesResultsRegistration_options-btn'>
                    <button type='button' className='button is-light' onClick={handleCancel}>
                      {translate('cancel', language)}
                    </button>
                    <button type='submit' className='button is-info'>
                      {translate('submit', language)}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={modalIsOpen}
        onConfirm={handleRemoveInputData}
        onCancel={closeModal}
        message={translate('cancelCreation', language)}
      />
      <CrudModal
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
        isCRUDOpen={isModalOpen}
        validationMessages={crudValidationErrors}
      />
      <AlertModal
        isOpen={isOverwriteModalOpen}
        onCancel={() => setIsOverwriteModalOpen(false)}
        onConfirm={handleOverwriteConfirmation}
        message={modalMessage}
      />
    </div>
  )
}

export default CostOfSalesResultsRegistration
