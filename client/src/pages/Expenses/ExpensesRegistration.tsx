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
import { validateRecords, translateAndFormatErrors, getFieldChecks, checkForDuplicates} from '../../utils/validationUtil'


const months = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const ExpensesRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('expenses')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const token = localStorage.getItem('accessToken')
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [formData, setFormData] = useState([
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
      registered_user_id: storedUserID,
      updated_at: '',
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false)
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false)

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target
    const newFormData = [...formData]
    newFormData[index] = {
      ...newFormData[index],
      [name]: value,
    }
    setFormData(newFormData)
  }

  const handleAdd = () => {
    if (formData.length < 10) {
      const newFormData = [...formData]
      newFormData.push({
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
        registered_user_id: storedUserID,
        updated_at: '',
      })
      setFormData(newFormData)
      console.log('add:' + formData)
    } else {
      console.log('You can only add up to 10 forms.')
    }
  }

  const handleMinus = () => {
    if (formData.length > 1) {
      setFormData(formData.slice(0, -1))
    }
  }

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handleSubmit = async (e) => {
    setModalMessage('') // Reset Modal Message Content


    e.preventDefault()
    // Validation

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
      console.log(firstError, 'first error')
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

    if (!token) {
      window.location.href = '/login'
      return
    }

    createExpense(formData, token)
      .then(() => {
        console.log('in create function')
        setModalMessage(translate('successfullySaved', language))
        console.log('in create function:modal message',modalMessage)

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
            registered_user_id: localStorage.getItem('userID'),
            updated_at: '',
          },
        ])
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
            registered_user_id: localStorage.getItem('userID'),
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
  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'project':
        navigate('/projects-registration')
        break
      case 'employeeExpenses':
        navigate('/employee-expenses-registration')
        break
      case 'expenses':
        navigate('/expenses-registration')
        break
      case 'costOfSales':
        navigate('/cost-of-sales-registration')
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
        registered_user_id: '',
        updated_at: '',
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

  useEffect(() => {}, [formData])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

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

  // Creates an Array of years for dropdown input. 5 years before AND after current year.
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 1
  const endYear = currentYear + 2
  const years = Array.from({ length: endYear - startYear + 1 }, (val, index) => startYear + index)

  const handleListClick = () => {
    navigate('/expenses-list')
  }

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
              activeTabOther={activeTabOther}
              message={translate('expensesRegistration', language)}
              handleTabsClick={handleTabsClick}
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
                            style={{ textAlign: 'center', textAlignLast: 'center' }}
                          >
                            <option value=''></option>
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
                            type='number'
                            name='rent_expense'
                            value={form.rent_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_travel_expenses-div'>
                          <label className='expensesRegistration_travel_expenses'>
                            {translate('travelExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='travel_expense'
                            value={form.travel_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_transaction_fees-div'>
                          <label className='expensesRegistration_transaction_fees'>
                            {translate('transactionFee', language)}
                          </label>
                          <input
                            type='number'
                            name='transaction_fee'
                            value={form.transaction_fee}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_professional_services_fees-div'>
                          <label className='expensesRegistration_professional_services_fees'>
                            {translate('professionalServicesFee', language)}
                          </label>
                          <input
                            type='number'
                            name='professional_service_fee'
                            value={form.professional_service_fee}
                            onChange={(e) => handleChange(index, e)}
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
                            style={{ textAlign: 'center', textAlignLast: 'center' }}
                          >
                            <option value=''></option>
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
                            type='number'
                            name='tax_and_public_charge'
                            value={form.tax_and_public_charge}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_communication_expenses-div'>
                          <label className='expensesRegistration_communication_expenses'>
                            {translate('communicationExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='communication_expense'
                            value={form.communication_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_advertising_expenses-div'>
                          <label className='expensesRegistration_advertising_expenses'>
                            {translate('advertisingExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='advertising_expense'
                            value={form.advertising_expense}
                            onChange={(e) => handleChange(index, e)}
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
                            type='number'
                            name='consumable_expense'
                            value={form.consumable_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_depreciation_expenses-div'>
                          <label className='expensesRegistration_depreciation_expenses'>
                            {translate('depreciationExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='depreciation_expense'
                            value={form.depreciation_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_utilities_expenses-div'>
                          <label className='expensesRegistration_utilities_expenses'>
                            {translate('utilitiesExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='utilities_expense'
                            value={form.utilities_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='expensesRegistration_entertainment_expenses-div'>
                          <label className='expensesRegistration_entertainment_expenses'>
                            {translate('entertainmentExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='entertainment_expense'
                            value={form.entertainment_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='registered_user_id' value={form.registered_user_id} />
                  </div>
                ))}
              </div>
              <div className='expensesRegistration_lower_form_cont'>
                <div className='expensesRegistration_form-content'>
                  <div className='expensesRegistration_plus-btn'>
                    <button className='expensesRegistration_inc' type='button' onClick={handleAdd}>
                      +
                    </button>
                    <button className='expensesRegistration_dec' type='button' onClick={handleMinus}>
                      -
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
    </div>
  )
}

export default ExpensesRegistration
