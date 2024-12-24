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
import { createCostOfSale } from '../../api/CostOfSalesEndpoint/CreateCostOfSale'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
  handleBackendError,
  handleSuccessMessages,
} from '../../utils/validationUtil'
import {handleDisableKeysOnNumberInputs, handlePLTabsClick } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import { formatNumberWithCommas } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import { removeCommas } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import { overwriteCostOfSale } from '../../api/CostOfSalesEndpoint/OverwriteCostOfSales'
import { monthNames, months, years, maximumEntries, planningScreenTabs } from '../../constants'
import { addFormInput, removeFormInput, useTranslateSwitch, closeModal, openModal} from '../../actions/hooks'

const CostOfSalesRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('costOfSales')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const { isTranslateSwitchActive, setIsTranslateSwitchActive } = useTranslateSwitch(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [messageOrigin, setMessageOrigin] = useState('')
  const emptyFormData = {
      year: '',
      month: '',
      purchase: '',
      outsourcing_expense: '',
      product_purchase: '',
      dispatch_labor_expense: '',
      communication_expense: '',
      work_in_progress_expense: '',
      amortization_expense: '',
    }
  const [formData, setFormData] = useState([emptyFormData])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false)
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false)
  const token = localStorage.getItem('accessToken')

 const handleAdd = () => {
   addFormInput(formData, setFormData, maximumEntries, emptyFormData)
 }

 const handleRemove = () => {
   removeFormInput(formData, setFormData)
 }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  const onTabClick = (tab) => handlePLTabsClick(tab, navigate, setActiveTabOther)


  const handleCancel = () => {
    // opens the modal to confirm whether to cancel the input information 
    // and remove all added input project containers.
    handleOpenModal()
  }

  const handleRemoveInputData = () => {
    setFormData([emptyFormData])
    handleCloseModal()
  }

  const handleOpenModal = () => {
    openModal(setModalIsOpen)
    // setModalIsOpen = true
  }

  const handleCloseModal = () => {
    closeModal(setModalIsOpen)
    // setModalIsOpen = false
  }
  
  const handleChange = (index, event) => {
    const { name, value } = event.target
    // Remove commas to get the raw number
    // EG. 999,999 → 999999 in the DB
    const rawValue = removeCommas(value)
    // Update the state with the raw value
    const newFormData = [...formData]
    newFormData[index] = {
      ...newFormData[index],
      [name]: rawValue, // Store unformatted value in the state
    }
    
    setFormData(newFormData)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'costOfSales'

    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateCostOfSales = (records) => validateRecords(records, fieldChecks, 'costOfSales')

    // Step 2: Validate client-side input
    const validationErrors = validateCostOfSales(formData)

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month']
    const duplicateErrors = checkForDuplicates(formData, uniqueFields, 'costOfSales', language)

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
      console.log(translatedErrors)
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

    try {
      setCrudValidationErrors([]); // Clear validation errors first
      await createCostOfSale(formData, token);
      handleSuccessMessages('costOfSale', 'create', setCrudValidationErrors, setIsModalOpen, null, setMessageOrigin, language);
      setFormData([emptyFormData]);
    } catch (error) {
      handleBackendError(
        error,
        language,
        setModalMessage,
        setIsModalOpen,
        setCrudValidationErrors,
        setIsOverwriteModalOpen,
        setMessageOrigin, // message origin (defines color of error) Orange = Backend, Red = Client Side
        { formData: formData },
      );
    }
  }

  // Handle overwrite confirmation
  const handleOverwriteConfirmation = async () => {
    setIsOverwriteModalOpen(false)
    setIsOverwriteConfirmed(true)
    // Call the overwrite after confirmation
    await handleOverwrite()
  }

  const handleOverwrite= async () => {
    const token = localStorage.getItem('accessToken')
    try {
      await overwriteCostOfSale(formData, token)
      handleSuccessMessages(
        'costOfSale', 
        'overwrite', 
        setCrudValidationErrors, 
        setIsModalOpen, 
        null, 
        setMessageOrigin, language
      )
      setFormData([emptyFormData])
    } catch(error){
        handleBackendError(
          error,
          language,
          setModalMessage,
          setIsModalOpen,
          setCrudValidationErrors,
          setIsOverwriteModalOpen,
          setMessageOrigin,
          { formData: formData },
      )
    } finally {
      setIsOverwriteConfirmed(false) // Reset overwrite confirmation
    }
  }

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

  const handleListClick = () => {
    navigate('/cost-of-sales-list')
  }

  return (
    <div className='costOfSalesRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='costOfSalesRegistration_content_wrapper'>
        <Sidebar />
        <div className='costOfSalesRegistration_data_content'>
          <div className='costOfSalesRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('costOfSalesRegistration', language)}
              handleTabsClick={onTabClick}
              handleListClick={handleListClick}
              buttonConfig={planningScreenTabs}
            />
          </div>
          <div className='costOfSalesRegistration_mid_body_cont'>
            <form className='costOfSalesRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='costOfSalesRegistration_mid_form_cont'>
                {formData.map((form, index) => (
                  <div
                    key={index}
                    className={`costOfSalesRegistration_form-content ${index > 0 ? 'costOfSalesRegistration_form-content-special' : ''}`}
                  >
                    <div
                      className={`costOfSalesRegistration_form-content ${index > 0 ? 'costOfSalesRegistration_form-line' : ''}`}
                    ></div>
                    <div className='costOfSalesRegistration_form-content-div'>
                      <div className='costOfSalesRegistration_left-form-div costOfSalesRegistration_calc'>
                        <div className='costOfSalesRegistration_year-div'>
                          <label className='costOfSalesRegistration_year'>{translate('year', language)}</label>
                          <select
                            className='costOfSalesRegistration_select-option'
                            name='year'
                            value={form.year}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectYear', language)}</option>
                            {years.map((year, i) => (
                              <option key={i} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='costOfSalesRegistration_outsourcing_expense-div'>
                          <label className='costOfSalesRegistration_outsourcing_expense'>
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
                        <div className='costOfSalesRegistration_communication_expense-div'>
                          <label className='costOfSalesRegistration_communication_expense'>
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
                      <div className='costOfSalesRegistration_middle-form-div costOfSalesRegistration_calc'>
                        <div className='costOfSalesRegistration_month-div'>
                          <label className='costOfSalesRegistration_month'>{translate('month', language)}</label>
                          <select
                            className='costOfSalesRegistration_select-option'
                            name='month'
                            value={form.month}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectMonth', language)}</option>
                            {months.map((month, idx) => (
                              <option key={idx} value={month}>
                                {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='costOfSalesRegistration_product_purchase-div'>
                          <label className='costOfSalesRegistration_product_purchase'>
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
                        <div className='costOfSalesRegistration_work_in_progress_expense-div'>
                          <label className='costOfSalesRegistration_work_in_progress_expense'>
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
                      <div className='costOfSalesRegistration_right-form-div costOfSalesRegistration_calc'>
                        <div className='costOfSalesRegistration_purchase-div'>
                          <label className='costOfSalesRegistration_purchase'>{translate('purchases', language)}</label>
                          <input
                            type='text'
                            name='purchase'
                            value={formatNumberWithCommas(form.purchase)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='costOfSalesRegistration_dispatch_labor_expense-div'>
                          <label className='costOfSalesRegistration_dispatch_labor_expense'>
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
                        <div className='costOfSalesRegistration_amortization_expense-div'>
                          <label className='costOfSalesRegistration_amortization_expense'>
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
                  </div>
                ))}
              </div>
              <div className='costOfSalesRegistration_lower_form_cont'>
                <div className='costOfSalesRegistration_form-content'>
                  <div className='costOfSalesRegistration_plus-btn'>
                    {formData.length >= 2 ? (
                      <button className='costOfSalesRegistration_dec' type='button' onClick={handleRemove}>
                        -
                      </button>
                    ) : (
                      <div className='costOfSalesRegistration_dec_empty'></div>
                    )}
                    <button
                      className='costOfSalesRegistration_inc custom-disabled'
                      type='button'
                      onClick={handleAdd}
                      disabled={formData.length === maximumEntries}
                    >
                      +
                    </button>
                  </div>
                  <div className='costOfSalesRegistration_options-btn'>
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
        onCancel={handleCloseModal}
        message={translate('cancelCreation', language)}
      />
      <CrudModal
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
        isCRUDOpen={isModalOpen}
        validationMessages={crudValidationErrors}
        messageOrigin={messageOrigin}
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

export default CostOfSalesRegistration
