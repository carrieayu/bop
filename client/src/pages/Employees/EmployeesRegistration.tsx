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

const EmployeesRegistration = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('employee')
    const storedUserID = localStorage.getItem('userID')
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
    const dispatch = useDispatch()
    const [businessDivisionSelection, setBusinessDivisionSelection] = useState<any>([])
    const [selectedCompanyId, setSelectedCompanyId] = useState('')
    const [companySelection, setCompanySelection] = useState<any>([])
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const [employees, setEmployees] = useState([
      {
        last_name: '',
        first_name: '',
        email: '',
        salary: '',
        business_division_name: '',
        company_name: '',
        auth_id: '',
        created_at: '',
      },
    ])
    const [allBusinessDivisions, setAllBusinessDivisions] = useState([]);


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
             const response = await axios.get(
               `http://127.0.0.1:8000/api/business-divisions?company_id=${selectedCompanyId}`,
             )
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
         const response = await axios.get(`http://127.0.0.1:8000/api/business-divisions/?company_id=${companyId}`)
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
            navigate('/clients-registration');
            break;
          case 'employee':
            navigate('/employees-registration');
            break;
          case 'businessDivision':
            navigate('/business-divisions-registration');
            break;
          case 'users':
            navigate('/users-registration');
            break;
          default:
            break;
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
          email: '',
          salary: '',
          business_division_name: '',
          company_name: '',
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
        const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
        setLanguage(newLanguage);
    };

    const validateEmployees = (employees) => {
      return employees.every((employee) => {
        return (
          employee.last_name.trim() !== '' &&
          employee.first_name.trim() !== '' &&
          /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(employee.email) && // Email validation
          !isNaN(employee.salary) &&
          employee.salary > 0 && // Salary should be a number and greater than 0
          employee.business_division_name.trim() !== '' &&
          employee.company_name.trim() !== ''
        )
      })
    }

    useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
          setActiveTab(path);
        }
      }, [location.pathname]);

      const handleSubmit = async (e) => {
        e.preventDefault()
        const employeeData = employees.map((empl) => ({
          last_name: empl.last_name,
          first_name: empl.first_name,
          email: empl.email,
          salary: empl.salary,
          business_division: empl.business_division_name,
          company: empl.company_name,
          auth_user: localStorage.getItem('userID'),
          created_at: Date.now(),
        }))
        
        if (!validateEmployees(employees)) {
          alert(translate('allFieldsRequiredInputValidationMessage', language))
          return // Stop the submission
        }
        // Check for duplicates in the email [input] submitted in enmployee
        const hasDuplicateEntries = (entries, key) => {
          return entries.some((entry, index) => entries.findIndex((e) => e[key] === entry[key]) !== index)
        }

        if (hasDuplicateEntries(employees, 'email')) {
          alert(translate('employeeDuplicateInputValidationMessage', language))
          return
        }
        
        const token = localStorage.getItem('accessToken')
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/employees/create', employeeData, {
            // const response = await axios.post('http://54.178.202.58:8000/api/employees/create', employeeData, {
            headers: {
              Authorization: `Bearer ${token}`, // Add token to request headers
            },
          })
          alert('Saved')
          window.location.reload()
        } catch (error) {
         if (error.response) {
            const { status, data } = error.response
            switch (status) {
              case 409:
                alert(translate('emailExistsMessage', language))
                break
              case 401:
                console.error('Validation error:', data)
                window.location.href = '/login'
                break
              default:
                console.error('There was an error creating the employee data!', error)
                alert(translate('error', language))
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
              email: '',
              salary: '',
              business_division_name: '',
              company_name: '',
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

      // const handleInputChange = (containerIndex, projectIndex, event) => {
      //   const { name, value } = event.target
      //   const newContainers = [...employees]
      //   newContainers[containerIndex] = {
      //     ...newContainers[containerIndex],
      //     [name]: value, 
      //   }
      //   setEmployees(newContainers) 
      // }

      useEffect(() => {
        setIsTranslateSwitchActive(language === 'en');
        fetchData()
      }, [language]);

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
                        <div className='EmployeesRegistration_salary-div'>
                          <label className='salary'>{translate('salary', language)}</label>
                          <input
                            type='number'
                            name='salary'
                            value={container.salary}
                            onChange={(e) => handleInputChange(containerIndex, null, e)}
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
                        <div className='EmployeesRegistration_business_division_name-div'>
                          <label className='EmployeesRegistration_business_division_name'>
                            {translate('businessDivision', language)}
                          </label>
                          <select
                            className='EmployeesRegistration_select-option'
                            name='business_division_name'
                            value={container.business_division_name}
                            onChange={(e) => handleInputChange(containerIndex, null, e)}
                          >
                            <option value=''></option>
                            {businessDivisionSelection.map((division) => (
                              <option key={division.business_division_id} value={division.business_division_id}>
                                {division.business_division_name}
                              </option>
                            ))}
                          </select>
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
                      <button type='button' className='button is-light'>
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
    </div>
  )
}

export default EmployeesRegistration
