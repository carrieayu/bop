import React, { useEffect, useState } from 'react'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import { useDispatch } from 'react-redux'
import { UnknownAction } from 'redux'
import { fetchMasterCompany } from '../../reducers/company/companySlice'
import axios from 'axios'
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal'
import { getSelectedBusinessDivisionCompany } from '../../api/BusinessDivisionEndpoint/GetSelectedBusinessDivisionCompany'
import { createEmployee } from '../../api/EmployeeEndpoint/CreateEmployee'
import {
  validateEmployeeRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import {
  handleDisableKeysOnNumberInputs,
  formatNumberWithCommas,
  removeCommas,
  handleMMRegTabsClick,
} from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import EmployeeExpensesList from '../EmployeeExpenses/EmployeeExpensesList'
import { addFormInput, closeModal, openModal, removeFormInput } from '../../actions/hooks'
import { masterMaintenanceScreenTabs, maximumEntries, token } from '../../constants'
import { MAX_NUMBER_LENGTH, MAX_SAFE_INTEGER } from '../../constants'

const EmployeesRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const dispatch = useDispatch()
  const [businessDivisionSelection, setBusinessDivisionSelection] = useState<any>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [companySelection, setCompanySelection] = useState<any>([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const emptyFormData = {
    last_name: '',
    first_name: '',
    type: '',
    email: '',
    salary: '',
    executive_renumeration: '',
    company_name: '',
    business_division_name: '',
    bonus_and_fuel_allowance: '',
    statutory_welfare_expense: '',
    welfare_expense: '',
    insurance_premium: '',
    auth_id: '',
    created_at: '',
  }
  const [employees, setEmployees] = useState([emptyFormData])
  const [allBusinessDivisions, setAllBusinessDivisions] = useState([])
  const onTabClick = (tab) => handleMMRegTabsClick(tab, navigate, setActiveTab)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [crudValidationErrors, setCrudValidationErrors] = useState([])

  const fetchData = async () => {
    try {
      const resMasterCompany = await dispatch(fetchMasterCompany() as unknown as UnknownAction)
      setCompanySelection(resMasterCompany.payload)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // This could possible be combined into handleInputChange (refactoring)
  const handleEmployeeTypePulldown = (e, containerIndex) => {
    const newType = e.target.value
    const newContainers = [...employees]

    newContainers[containerIndex].type = newType
    if (newType === '0') {
      // Reset executive remuneration if switching to regular employee
      newContainers[containerIndex].executive_renumeration = '' // Set to an empty string directly
    } else if (newType === '1') {
      // Reset salary if switching to executive employee
      newContainers[containerIndex].salary = '' // Set to an empty string directly
    } else newType === ''
    {
      newContainers[containerIndex].executive_renumeration = '' // Set to an empty string directly
      newContainers[containerIndex].salary = '' // Set to an empty string directly
    }
    setEmployees(newContainers) // Update employees state
  }

  const handleInputChange = (containerIndex, projectIndex, event) => {
    const { name, value } = event.target

    // Remove commas to get the raw number
    // EG. 999,999 → 999999 in the DB
    const rawValue = removeCommas(value)

    if (name === 'salary' || name === 'executive_renumeration' || name === 'bonus_and_fuel_allowance') {
      if (rawValue.length > MAX_NUMBER_LENGTH) {
        return // Ignore input if the length exceeds 15 digits
      }

      if (rawValue.length <= MAX_NUMBER_LENGTH && rawValue <= MAX_SAFE_INTEGER) {
      }
    }
    
    if (name === 'company_name') {
      setSelectedCompanyId(value) // Update selected company ID
      const newContainers = [...employees]
      newContainers[containerIndex].business_division_name = '' // Reset business division when the company changes
      setEmployees(newContainers)
    }

    const newContainers = [...employees]
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      [name]: rawValue,
    }
    setEmployees(newContainers)
  }

  useEffect(() => {
    const fetchBusinessDivisionsForCompany = async () => {
      if (selectedCompanyId) {
        getSelectedBusinessDivisionCompany(selectedCompanyId, token)
          .then((data) => {
            setBusinessDivisionSelection(data)
          })
          .catch((error) => {
            console.error('Error fetching business divisions:', error)
          })
      } else {
        setBusinessDivisionSelection([]) // Clear if no company is selected
      }
    }

    fetchBusinessDivisionsForCompany()
  }, [selectedCompanyId])

  const handleCompanyChange = async (containerIndex, companyId) => {
    const newContainers = [...employees]
    newContainers[containerIndex].company_name = companyId // Set the selected company ID
    setEmployees(newContainers)

    getSelectedBusinessDivisionCompany(companyId, token)
      .then((data) => {
        setBusinessDivisionSelection(data)
      })
      .catch((error) => {
        console.error('Error fetching business divisions:', error)
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
    setEmployees([emptyFormData])
    closeModal(setModalIsOpen)
  }

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'employees'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateEmployees = (records) => validateEmployeeRecords(records, fieldChecks, 'employee')

    // Step 2: Validate client-side input
    const validationErrors = validateEmployees(employees) // Only one User can be registered but function expects an Array.

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['email']
    const duplicateErrors = checkForDuplicates(employees, uniqueFields, 'employee', language)

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
      console.log(translatedErrors, 'trans errors')
      setModalMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsModalOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }

    const employeeData = employees.map((empl) => ({
      last_name: empl.last_name,
      first_name: empl.first_name,
      type: empl.type,
      email: empl.email,
      salary: empl.type === '0' ? (empl.salary !== '' ? empl.salary : null) : null, // Include salary only if regular
      executive_renumeration:
        empl.type === '1' ? (empl.executive_renumeration !== '' ? empl.executive_renumeration : null) : null, // Include executive remuneration only if executive
      company: empl.company_name,
      business_division: empl.business_division_name,
      bonus_and_fuel_allowance: empl.bonus_and_fuel_allowance,
      statutory_welfare_expense: empl.statutory_welfare_expense,
      welfare_expense: empl.welfare_expense,
      insurance_premium: empl.insurance_premium,
      auth_user: localStorage.getItem('userID'),
      created_at: Date.now(),
    }))

    // if (!validateEmployees(employeeData)) {
    //   setModalMessage(translate('allFieldsRequiredInputValidationMessage', language))
    //   setIsModalOpen(true)
    //   return // Stop the submission
    // }
    // Check for duplicates in the email [input] submitted in enmployee
    // const hasDuplicateEntries = (entries, key) => {
    //   return entries.some((entry, index) => entries.findIndex((e) => e[key] === entry[key]) !== index)
    // }

    // if (hasDuplicateEntries(employees, 'email')) {
    //   setModalMessage(translate('employeeDuplicateInputValidationMessage', language));
    //   setIsModalOpen(true);
    //   return
    // }

    createEmployee(employeeData, token)
      .then(() => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setEmployees([
          emptyFormData
        ])
      })
      .catch((error) => {
        if (error.response) {
          const { status, data } = error.response
          switch (status) {
            case 409:
              const existingEmail = data.errors.map((err) => err.email).join(',') || 'Unknown email'
              setModalMessage(translate('emailExistsMessage', language).replace('${email}', existingEmail))
              setIsModalOpen(true)
              break
            case 401:
              console.error('Validation error:', data)
              window.location.href = '/login'
              break
            default:
              console.error('There was an error creating the employee data!', error)
              setModalMessage(translate('error', language))
              setIsModalOpen(true)
              break
          }
        }
      })
  }

  const handleAddContainer = () => {
    addFormInput(employees, setEmployees, maximumEntries, emptyFormData)
  }

  const handleRemoveContainer = () => {
    removeFormInput(employees, setEmployees)
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
    fetchData()
  }, [language])

  const handleListClick = () => {
    navigate('/employees-list')
  }

  return (
    <div className='EmployeesRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='EmployeesRegistration_content_wrapper'>
        <Sidebar />
        <div className='EmployeesRegistration_data_content'>
          <div className='EmployeesRegistration_mid_body_cont'>
            <div className='EmployeesRegistration_top_body_cont'>
              <RegistrationButtons
                activeTabOther={'employee'}
                message={translate('employeesRegistration', language)}
                handleTabsClick={onTabClick}
                handleListClick={handleListClick}
                buttonConfig={masterMaintenanceScreenTabs}
              />
            </div>
            <div className='EmployeesRegistration_mid_form_cont'>
              <form className='EmployeeRegistration_form_cont' onSubmit={handleSubmit}>
                <div className='EmployeeRegistration_mid'>
                  {employees.map((container, containerIndex) => (
                    <div
                      key={containerIndex}
                      className={`EmployeesRegistration_form-content ${containerIndex > 0 ? 'EmployeesRegistration_form-content-special' : ''}`}
                    >
                      <div
                        className={`EmployeesRegistration_form-content ${containerIndex > 0 ? 'EmployeesRegistration_ForImplementationOfHorizontalLineBelow' : ''}`}
                      ></div>
                      <div className='EmployeesRegistration_form-div'>
                        <div className='EmployeesRegistration_left-form-content-div EmployeesRegistration_calc'>
                          <div className='EmployeesRegistration_last_name-div'>
                            <label className='last_name'>{translate('lastName', language)}</label>
                            <input
                              type='text'
                              name='last_name'
                              value={container.last_name}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
                            />
                          </div>
                          <div className='EmployeesRegistration_type-div'>
                            <label className='type-label'>{translate('type', language)}</label>
                            <select
                              className='type-option'
                              name='employee_type'
                              value={container.type || ''}
                              onChange={(e) => handleEmployeeTypePulldown(e, containerIndex)}
                            >
                              <option className='type-option' value={''}>
                                {translate('selectEmployeeType', language)}
                              </option>
                              <option className='type-option' value={'0'}>
                                {translate('regularEmployee', language)}
                              </option>
                              <option className='type-option' value={'1'}>
                                {translate('executiveEmployee', language)}
                              </option>
                            </select>
                          </div>
                          <div className='EmployeesRegistration_business_division_name-div'>
                            <label className='EmployeesRegistration_business_division_name'>
                              {translate('businessDivision', language)}
                            </label>
                            <select
                              className='EmployeesRegistration_select-option'
                              name='business_division_name'
                              value={container.business_division_name}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
                              disabled={container.company_name === ''}
                            >
                              <option value=''>{translate('selectBusinessDivision', language)}</option>
                              {businessDivisionSelection.map((division) => (
                                <option key={division.business_division_id} value={division.business_division_id}>
                                  {division.business_division_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className='EmployeesRegistration_welfare_expense-div'>
                            <label className='welfare_expense'>{translate('welfareExpense', language)}</label>
                            <input
                              type='text'
                              name='welfare_expense'
                              value={formatNumberWithCommas(
                                (container.welfare_expense =
                                  container.type === '0'
                                    ? Math.round(Number(container.salary) * 0.0048).toString()
                                    : Math.round(Number(container.executive_renumeration) * 0.0048).toString()),
                              )}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            />
                          </div>
                        </div>
                        <div className='EmployeesRegistration_mid-form-content-div EmployeesRegistration_calc'>
                          <div className='EmployeesRegistration_first_name-div'>
                            <label className='first_name'>{translate('firstName', language)}</label>
                            <input
                              type='text'
                              name='first_name'
                              value={container.first_name}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
                            />
                          </div>
                          {container.type === '1' && (
                            <div className='EmployeesRegistration_executive_renumeration-div'>
                              <label className='executive-renumeration-label'>
                                {translate('executiveRenumeration', language)}
                              </label>
                              <input
                                type='text'
                                name='executive_renumeration'
                                value={formatNumberWithCommas(container.executive_renumeration) || ''} // Ensure empty string as fallback for controlled input
                                onChange={(e) => handleInputChange(containerIndex, null, e)}
                                onKeyDown={handleDisableKeysOnNumberInputs}
                                disabled={container.type !== '1'} // Disabled when not an executive employee
                              />
                            </div>
                          )}
                          {container.type === '0' && (
                            <div className='EmployeesRegistration_salary-div'>
                              <label className='salary'>{translate('salary', language)}</label>
                              <input
                                type='text'
                                name='salary'
                                value={formatNumberWithCommas(container.salary) || ''} // Ensure empty string as fallback for controlled input
                                onChange={(e) => handleInputChange(containerIndex, null, e)}
                                onKeyDown={handleDisableKeysOnNumberInputs}
                                disabled={container.type !== '0'} // Disabled when not a regular employee
                              />
                            </div>
                          )}
                          {container.type === '' && (
                            <div className='EmployeesRegistration_no_selection-div'>
                              <label className='no-selection-label'>{translate('noSelection', language)}</label>
                              <input
                                disabled={true} // Disabled
                              />
                            </div>
                          )}
                          <div className='EmployeesRegistration_bonus_and_fuel_allowance-div'>
                            <label className='bonus_and_fuel_allowance'>
                              {translate('bonusAndFuelAllowance', language)}
                            </label>
                            <input
                              type='text'
                              name='bonus_and_fuel_allowance'
                              value={formatNumberWithCommas(container.bonus_and_fuel_allowance)}
                              onKeyDown={handleDisableKeysOnNumberInputs}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
                            />
                          </div>
                          <div className='EmployeesRegistration_insurance_premium-div'>
                            <label className='insurance-premium'>{translate('insurancePremium', language)}</label>
                            <input
                              type='text'
                              name='insurance_premium'
                              value={formatNumberWithCommas(
                                (container.insurance_premium =
                                  container.type === '0'
                                    ? Math.round(Number(container.salary) * 0.0224).toString()
                                    : Math.round(Number(container.executive_renumeration) * 0.0224).toString()),
                              )}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className='EmployeesRegistration_right-form-content-div EmployeesRegistration_calc'>
                          <div className='EmployeesRegistration_email-div'>
                            <label className='email'>{translate('email', language)}</label>
                            <input
                              type='text'
                              name='email'
                              value={container.email}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
                            />
                          </div>
                          <div className='EmployeesRegistration_company_name-div'>
                            <label className='EmployeesRegistration_company_name'>
                              {translate('companyName', language)}
                            </label>
                            <select
                              className='EmployeesRegistration_select-option'
                              name='company_name'
                              value={container.company_name}
                              onChange={(e) => handleCompanyChange(containerIndex, e.target.value)}
                            >
                              <option value=''>{translate('selectCompany', language)}</option>
                              {companySelection.map((company) => (
                                <option key={company.company_id} value={company.company_id}>
                                  {company.company_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className='EmployeesRegistration-statutory_welfare_expense-div'>
                            <label className='statutory_welfare_expense'>
                              {translate('statutoryWelfareExpense', language)}
                            </label>
                            <input
                              type='text'
                              name='statutory_welfare_expense'
                              value={formatNumberWithCommas(
                                (container.statutory_welfare_expense =
                                  container.type === '0'
                                    ? Math.round(Number(container.salary) * 0.1451).toString()
                                    : Math.round(Number(container.executive_renumeration) * 0.1451).toString()),
                              )}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='EmployeesRegistration_lower_form_cont'>
                  <div className='EmployeesRegistration_form-btn-content'>
                    <div className='EmployeesRegistration_plus-btn'>
                      {employees.length >= 2 ? (
                        <button className='EmployeesRegistration_dec' type='button' onClick={handleRemoveContainer}>
                          -
                        </button>
                      ) : (
                        <div className='EmployeesRegistration_dec_empty'></div>
                      )}
                      <button
                        className='EmployeesRegistration_inc custom-disabled'
                        type='button'
                        onClick={handleAddContainer}
                        disabled={employees.length === 10}
                      >
                        +
                      </button>
                    </div>
                    <div className='EmployeesRegistration_options-btn'>
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
    </div>
  )
}

export default EmployeesRegistration
