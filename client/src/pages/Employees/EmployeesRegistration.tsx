import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import { fetchBusinessDivisions } from '../../reducers/businessDivisions/businessDivisionsSlice'
import { useDispatch } from 'react-redux'
import { UnknownAction } from 'redux'
import { fetchMasterCompany } from '../../reducers/company/companySlice'
import axios from 'axios'
import AlertModal from '../../components/AlertModal/AlertModal'
import { NULL } from 'sass'
import CrudModal from '../../components/CrudModal/CrudModal'
import { escape } from 'querystring'

const EmployeesRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('employee')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const dispatch = useDispatch()
  const [businessDivisionSelection, setBusinessDivisionSelection] = useState<any>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [companySelection, setCompanySelection] = useState<any>([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<any>([])

  const [employees, setEmployees] = useState([
    {
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
    },
  ])
  const [allBusinessDivisions, setAllBusinessDivisions] = useState([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

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
    } else (newType === '')
    {
      newContainers[containerIndex].executive_renumeration = '' // Set to an empty string directly
      newContainers[containerIndex].salary = '' // Set to an empty string directly
    }
    setEmployees(newContainers) // Update employees state
  }

  const handleInputChange = (containerIndex, projectIndex, event) => {
    const { name, value } = event.target

    if (name === 'company_name') {
      setSelectedCompanyId(value) // Update selected company ID
      const newContainers = [...employees]
      newContainers[containerIndex].business_division_name = '' // Reset business division when the company changes
      setEmployees(newContainers)
    }

    const newContainers = [...employees]
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      [name]: value,
    }
    setEmployees(newContainers)
  }

  useEffect(() => {
    const fetchBusinessDivisionsForCompany = async () => {
      if (selectedCompanyId) {
        try {
          // const response = await axios.get(
          //   `http://127.0.0.1:8000/api/business-divisions?company_id=${selectedCompanyId}`,
          // )
          const response = await axios.get(`http://54.178.202.58:8000/api/business-divisions?company_id=${selectedCompanyId}`, )
          setBusinessDivisionSelection(response.data) // Update business divisions based on selected company
        } catch (error) {
          console.error('Error fetching business divisions:', error)
        }
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

    try {
      // Fetch business divisions based on the selected company ID
      // const response = await axios.get(`http://127.0.0.1:8000/api/business-divisions/?company_id=${companyId}`)
      const response = await axios.get(`http://54.178.202.58:8000/api/business-divisions/?company_id=${companyId}`)
      const divisions = response.data // Assuming your API returns an array of divisions

      setBusinessDivisionSelection(divisions) // Update businessDivisionSelection with fetched divisions
    } catch (error) {
      console.error('Error fetching business divisions:', error)
    }
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'client':
        navigate('/clients-registration')
        break
      case 'employee':
        navigate('/employees-registration')
        break
      case 'businessDivision':
        navigate('/business-divisions-registration')
        break
      case 'users':
        navigate('/users-registration')
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
    setEmployees([
      {
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

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

 const validateEmployees = (employeeData) => {
   return employeeData.every((employee) => {
     
    // Just removing employee to make them shorter
    const salary = employee.salary 
    const executiveRenumeration = employee.executive_renumeration 
   
    // Check required fields
     const requiredFields = [
       employee.last_name,
       employee.first_name,
       employee.email
     ]

     // Check for empty required fields
     for (const field of requiredFields) {
       if (field.trim() === '') {
         console.log('// At least one required field is empty', field)
         return false // At least one required field is empty
       }
     }

     // Validate email format
     if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(employee.email)) {
       console.log('Invalid email')
       return false // Invalid email
     }

     // Validate based on employee type
     if (employee.type === '0') {
       // Regular employee: salary should be valid, executive_renumeration should be null
       if (salary === null || isNaN(salary) || salary <= 0 || executiveRenumeration !== null) {
         console.log('/ Invalid regular employee data')
         return false // Invalid regular employee data
       }
     } else if (employee.type === '1') {
       // Executive employee: executive_renumeration should be valid, salary should be null
       if (
         executiveRenumeration === null ||
         isNaN(executiveRenumeration) ||
         executiveRenumeration <= 0 ||
         salary !== null
       ) {
         console.log('Invalid executive employee', salary, executiveRenumeration)
         return false // Invalid executive employee data
       }
     } else {
       console.log('Unknown Employee type')
       return false // Unknown employee type
     }

     // If all validations pass, return true
     console.log('Validation Passed for employee:', employee)
     return true
   })
 }


  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handleSubmit = async (e) => {

    e.preventDefault()
    const employeeData = employees.map((empl) => ({
      last_name: empl.last_name,
      first_name: empl.first_name,
      type: empl.type,
      email: empl.email,
      salary: empl.type === '0' ? (empl.salary !== '' ? empl.salary : null) : null, // Include salary only if regular
      executive_renumeration: empl.type === '1' ? (empl.executive_renumeration !== '' ? empl.executive_renumeration : null) : null, // Include executive remuneration only if executive
      company: empl.company_name,
      business_division: empl.business_division_name,
      bonus_and_fuel_allowance: empl.bonus_and_fuel_allowance,
      statutory_welfare_expense: empl.statutory_welfare_expense,
      welfare_expense: empl.welfare_expense,
      insurance_premium: empl.insurance_premium,
      auth_user: localStorage.getItem('userID'),
      created_at: Date.now(),
    }))

    if (!validateEmployees(employeeData)) {
      setModalMessage(translate('allFieldsRequiredInputValidationMessage', language))
      setIsModalOpen(true)
      return // Stop the submission
    }
    // Check for duplicates in the email [input] submitted in enmployee
    const hasDuplicateEntries = (entries, key) => {
      return entries.some((entry, index) => entries.findIndex((e) => e[key] === entry[key]) !== index)
    }

        if (hasDuplicateEntries(employees, 'email')) {
          setModalMessage(translate('employeeDuplicateInputValidationMessage', language));
          setIsModalOpen(true);
          return
        }
        
        const token = localStorage.getItem('accessToken')
        try {
          // const response = await axios.post('http://127.0.0.1:8000/api/employees/create', employeeData, {
            const response = await axios.post('http://54.178.202.58:8000/api/employees/create', employeeData, {
            headers: {
              Authorization: `Bearer ${token}`, // Add token to request headers
            },
          })
          setModalMessage(translate('successfullySaved', language));
          setIsModalOpen(true);
          setEmployees([
            {
              last_name: '',
              first_name: '',
              type:'',
              email: '',
              salary: '',
              executive_renumeration:'',
              company_name: '',
              business_division_name: '',
              bonus_and_fuel_allowance: '',
              statutory_welfare_expense: '',
              welfare_expense: '',
              insurance_premium: '',
              auth_id: '',
              created_at: ''
            },
          ])
        } catch (error) {
         if (error.response) {
            const { status, data } = error.response
            switch (status) {
              case 409:
                const existingEmail = data.errors.map(err => err.email).join(',') || 'Unknown email';
                setModalMessage(translate('emailExistsMessage', language).replace('${email}', existingEmail));
                setIsModalOpen(true);
                break
              case 401:
                console.error('Validation error:', data)
                window.location.href = '/login'
                break
              default:
                console.error('There was an error creating the employee data!', error)
                setModalMessage(translate('error', language));
                setIsModalOpen(true);
                break
            }
          }
        }
      }

  const handleAddContainer = () => {
    setEmployees([
      ...employees,
      {
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
      },
    ])
  }

  const handleRemoveContainer = () => {
    if (employees.length > 1) {
      const newContainers = [...employees]
      newContainers.pop()
      setEmployees(newContainers)
    }
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
                activeTabOther={activeTabOther}
                message={translate('employeesRegistration', language)}
                handleTabsClick={handleTabsClick}
                handleListClick={handleListClick}
                buttonConfig={[
                  { labelKey: 'client', tabKey: 'client' },
                  { labelKey: 'employee', tabKey: 'employee' },
                  { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                  { labelKey: 'users', tabKey: 'users' },
                ]}
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
                              <option value=''></option>
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
                              value={
                                (container.welfare_expense =
                                  container.type === '0'
                                    ? (Number(container.salary) * 0.0048).toFixed(2).toString()
                                    : (Number(container.executive_renumeration) * 0.0048).toFixed(2).toString())
                              }
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
                                type='number'
                                name='executive_renumeration'
                                value={container.executive_renumeration || ''} // Ensure empty string as fallback for controlled input
                                onChange={(e) => handleInputChange(containerIndex, null, e)}
                                disabled={container.type !== '1'} // Disabled when not an executive employee
                              />
                            </div>
                          )}
                          {container.type === '0' && (
                            <div className='EmployeesRegistration_salary-div'>
                              <label className='salary'>{translate('salary', language)}</label>
                              <input
                                type='number'
                                name='salary'
                                value={container.salary || ''} // Ensure empty string as fallback for controlled input
                                onChange={(e) => handleInputChange(containerIndex, null, e)}
                                disabled={container.type !== '0'} // Disabled when not a regular employee
                              />
                            </div>
                          )}
                          {container.type === '' && (
                            <div className='EmployeesRegistration_no_selection-div'>
                              <label className='no-selection-label'>{translate('noSelection', language)}</label>
                              <input
                                // type='number'
                                // name=''
                                // value= {null} // NO VALUE
                                // onChange={(e) => handleInputChange(containerIndex, null, e)}
                                disabled={true} // Disabled e
                              />
                            </div>
                          )}
                          <div className='EmployeesRegistration_bonus_and_fuel_allowance-div'>
                            <label className='bonus_and_fuel_allowance'>
                              {translate('bonus', language)}・{translate('fuelAllowance', language)}
                            </label>
                            <input
                              type='number'
                              name='bonus_and_fuel_allowance'
                              value={container.bonus_and_fuel_allowance}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
                            />
                          </div>
                          <div className='EmployeesRegistration_insurance_premium-div'>
                            <label className='insurance-premium'>{translate('insurancePremium', language)}</label>
                            <input
                              type='number'
                              name='insurance_premium'
                              value={container.insurance_premium}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
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
                              <option value=''></option>
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
                              value={
                                (container.statutory_welfare_expense =
                                  container.type === '0'
                                    ? (Number(container.salary) * 0.1451).toFixed(2).toString()
                                    : (Number(container.executive_renumeration) * 0.1451).toFixed(2).toString())
                              }
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
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
                      <button className='EmployeesRegistration_inc' type='button' onClick={handleAddContainer}>
                        +
                      </button>
                      <button className='EmployeesRegistration_dec' type='button' onClick={handleRemoveContainer}>
                        -
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
      <CrudModal message={modalMessage} onClose={() => setIsModalOpen(false)} isCRUDOpen={isModalOpen} />
    </div>
  )
}

export default EmployeesRegistration
