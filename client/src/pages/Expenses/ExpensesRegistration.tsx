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
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { createExpense } from '../../api/ExpenseEndpoint/CreateExpense'
import { overwriteExpense } from '../../api/ExpenseEndpoint/OverwriteExpense'
import { maximumEntries, monthNames, storedUserID, token, years, ACCESS_TOKEN } from '../../constants'
import { addFormInput, closeModal, openModal, removeFormInput, useTranslateSwitch } from '../../actions/hooks'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import {
  handleDisableKeysOnNumberInputs,
  removeCommas,
  formatNumberWithCommas,
  handleInputChange,
  handlePLRegTabsClick,
  setupIdleTimer,
} from '../../utils/helperFunctionsUtil'
import { useAlertPopup, checkAccessToken, handleTimeoutConfirm } from "../../routes/ProtectedRoutes";

const ExpensesRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const onTabClick = (tab) => handlePLRegTabsClick(tab, navigate, setActiveTab)
  const { isTranslateSwitchActive, setIsTranslateSwitchActive } = useTranslateSwitch(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const emptyFormData = {
    year: '',
    month: '',
    tax_and_public_charge: '',
    communication_expense: '',
    advertising_expense: '',
    consumable_expense: '',
    depreciation_expense: '',
    utilities_expense: '',
    entertainment_expense: '',
    rent_expense: '',
    travel_expense: '',
    transaction_fee: '',
    professional_service_fee: '',
    updated_at: '',
  }
  const [formData, setFormData] = useState([emptyFormData])
  const [messageOrigin, setMessageOrigin] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false)
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false)
  const { showAlertPopup, AlertPopupComponent } = useAlertPopup()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const handleAdd = () => {
    addFormInput(formData, setFormData, maximumEntries, emptyFormData)
  }

  const handleRemove = () => {
    removeFormInput(formData, setFormData)
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentFiscalYear = currentDate.getMonth() + 1 < 4 ? currentYear - 1 : currentYear
  const [months, setMonths] = useState<number[]>([])
  const handleChange = (index, event) => {
    handleInputChange(index, event, setFormData, formData)

    const { name, value } = event.target

    // Remove commas to get the raw number
    // EG. 999,999 → 999999 in the DB
    const rawValue = removeCommas(value)

    if (name === 'year') {
      const selectedYear = parseInt(rawValue, 10)
      if (selectedYear === currentFiscalYear) {
        setMonths([4, 5, 6, 7, 8, 9, 10, 11, 12])
      } else if (selectedYear === currentFiscalYear + 1) {
        setMonths([1, 2, 3])
      } else {
        setMonths([])
      }
    }
  }

  useEffect(() => {}, [formData])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handleSubmit = async (e) => {
    setModalMessage('') // Reset Modal Message Content

    e.preventDefault()

    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'expenses'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateExpenses = (records) => validateRecords(records, fieldChecks, 'expense')

    // Step 2: Validate client-side input
    const validationErrors = validateExpenses(formData) // Get the array of error messages

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month']
    const duplicateErrors = checkForDuplicates(formData, uniqueFields, 'expense', language)

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

    const expensesData = formData.map((ex) => ({
      year: ex.year,
      month: ex.month,
      consumable_expense: ex.consumable_expense,
      tax_and_public_charge: ex.tax_and_public_charge,
      communication_expense: ex.communication_expense,
      advertising_expense: ex.advertising_expense,
      depreciation_expense: ex.depreciation_expense,
      utilities_expense: ex.utilities_expense,
      entertainment_expense: ex.entertainment_expense,
      rent_expense: ex.rent_expense,
      travel_expense: ex.travel_expense,
      transaction_fee: ex.transaction_fee,
    }))

    createExpense(formData, token)
      .then(() => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setFormData([emptyFormData])
      })
      .catch((error) => {
        if (error.response && error.response.status === 409) {
          const existingEntries = error.response.data.existingEntries

          // Map to create a string of existing entries
          const existingYearsMonths = existingEntries.map((entry) => `'${entry.year}, ${entry.month}'`).join(', ')

          // Filter out new entries that don't match the existing entries
          const newEntries = expensesData.filter((item) => {
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
          return // Exit the function to wait for user input
        } else {
          // Handle any other errors
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
    overwriteExpense(formData, token)
      .then(() => {
        setModalMessage(translate('overWrite', language))
        setIsModalOpen(true)
        setFormData([
          {
            year: '',
            month: '',
            tax_and_public_charge: '',
            communication_expense: '',
            advertising_expense: '',
            consumable_expense: '',
            depreciation_expense: '',
            utilities_expense: '',
            entertainment_expense: '',
            rent_expense: '',
            travel_expense: '',
            transaction_fee: '',
            professional_service_fee: '',
            updated_at: '',
          },
        ])
      })
      .catch((error) => {
        console.error('Error overwriting data:', error)
      })
      .finally(() => {
        setIsOverwriteConfirmed(false)
      })
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal(setModalIsOpen)
  }

  const handleRemoveInputData = () => {
    setFormData([emptyFormData])
    closeModal(setModalIsOpen)
  }

  useEffect(() => {}, [formData])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleListClick = () => {
    navigate('/expenses-list')
  }

  useEffect(() => {
    checkAccessToken(setIsAuthorized).then(result => {
      if (!result) { showAlertPopup(handleTimeoutConfirm); }
    });
  }, [token])
  
  return (
    <div className='expensesRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='expensesRegistration_content_wrapper'>
        <Sidebar />
        <div className='expensesRegistration_data_content'>
          <div className='expensesRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={'expenses'}
              message={translate('expensesRegistration', language)}
              handleTabsClick={onTabClick}
              handleListClick={handleListClick}
              buttonConfig={[
                { labelKey: 'project', tabKey: 'project' },
                { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                { labelKey: 'expenses', tabKey: 'expenses' },
                { labelKey: 'costOfSales', tabKey: 'costOfSales' },
              ]}
            />
          </div>
          <div className='expensesRegistration_mid_body_cont'>
            <form className='expensesRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='expensesRegistration_mid_form_cont'>
                {formData.map((form, index) => (
                  <div
                    key={index}
                    className={`expensesRegistration_form-content ${index > 0 ? 'expensesRegistration_form-content-special' : ''}`}
                  >
                    <div
                      className={`expensesRegistration_form-content ${index > 0 ? 'expensesRegistration_form-line' : ''}`}
                    ></div>
                    <div className='expensesRegistration_form-content-div'>
                      <div className='expensesRegistration_left-form-div expensesRegistration_calc'>
                        <div className='expensesRegistration_year-div'>
                          <label className='expensesRegistration_year'>{translate('year', language)}</label>
                          <select
                            className='expensesRegistration_select-option'
                            name='year'
                            value={form.year}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectYear', language)}</option>
                            {years.map((year, idx) => (
                              <option key={idx} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='expensesRegistration_rent_expenses-div'>
                          <label className='expensesRegistration_rent_expenses'>
                            {translate('rentExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='rent_expense'
                            value={formatNumberWithCommas(form.rent_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_travel_expenses-div'>
                          <label className='expensesRegistration_travel_expenses'>
                            {translate('travelExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='travel_expense'
                            value={formatNumberWithCommas(form.travel_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_transaction_fees-div'>
                          <label className='expensesRegistration_transaction_fees'>
                            {translate('transactionFee', language)}
                          </label>
                          <input
                            type='text'
                            name='transaction_fee'
                            value={formatNumberWithCommas(form.transaction_fee)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_professional_services_fees-div'>
                          <label className='expensesRegistration_professional_services_fees'>
                            {translate('professionalServicesFee', language)}
                          </label>
                          <input
                            type='text'
                            name='professional_service_fee'
                            value={formatNumberWithCommas(form.professional_service_fee)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>
                      <div className='expensesRegistration_middle-form-div expensesRegistration_calc'>
                        <div className='expensesRegistration_month-div'>
                          <label className='expensesRegistration_month'>{translate('month', language)}</label>
                          <select
                            className='expensesRegistration_select-option'
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
                        <div className='expensesRegistration_taxes_and_public_charges-div'>
                          <label className='expensesRegistration_taxes_and_public_charges'>
                            {translate('taxAndPublicCharge', language)}
                          </label>
                          <input
                            type='text'
                            name='tax_and_public_charge'
                            value={formatNumberWithCommas(form.tax_and_public_charge)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_communication_expenses-div'>
                          <label className='expensesRegistration_communication_expenses'>
                            {translate('communicationExpense', language)}
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
                        <div className='expensesRegistration_advertising_expenses-div'>
                          <label className='expensesRegistration_advertising_expenses'>
                            {translate('advertisingExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='advertising_expense'
                            value={formatNumberWithCommas(form.advertising_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>
                      <div className='expensesRegistration_right-form-div expensesRegistration_calc'>
                        <div className='expensesRegistration_consumable_expenses-div'>
                          <label className='expensesRegistration_consumable_expenses'>
                            {translate('consumableExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='consumable_expense'
                            value={formatNumberWithCommas(form.consumable_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_depreciation_expenses-div'>
                          <label className='expensesRegistration_depreciation_expenses'>
                            {translate('depreciationExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='depreciation_expense'
                            value={formatNumberWithCommas(form.depreciation_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_utilities_expenses-div'>
                          <label className='expensesRegistration_utilities_expenses'>
                            {translate('utilitiesExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='utilities_expense'
                            value={formatNumberWithCommas(form.utilities_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_entertainment_expenses-div'>
                          <label className='expensesRegistration_entertainment_expenses'>
                            {translate('entertainmentExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='entertainment_expense'
                            value={formatNumberWithCommas(form.entertainment_expense)}
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
              <div className='expensesRegistration_lower_form_cont'>
                <div className='expensesRegistration_form-content'>
                  <div className='expensesRegistration_plus-btn'>
                    {formData.length >= 2 ? (
                      <button className='expensesRegistration_dec' type='button' onClick={handleRemove}>
                        -
                      </button>
                    ) : (
                      <div className='expensesRegistration_dec_empty'></div>
                    )}
                    <button
                      className='expensesRegistration_inc custom-disabled'
                      type='button'
                      onClick={handleAdd}
                      disabled={formData.length === maximumEntries}
                    >
                      +
                    </button>
                  </div>
                  <div className='expensesRegistration_options-btn'>
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
      <AlertPopupComponent />
    </div>
  )
}

export default ExpensesRegistration
