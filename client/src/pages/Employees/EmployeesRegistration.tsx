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
    const [businessSelection, setBusinessSelection] = useState<any>([])
    const [companySelection, setCompanySelection] = useState<any>([])
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

    const fetchData = async () => {
      try {
        const resBusinessDivisions = await dispatch(fetchBusinessDivisions() as unknown as UnknownAction)
        setBusinessSelection(resBusinessDivisions.payload)
        const resMasterCompany = await dispatch(fetchMasterCompany() as unknown as UnknownAction)
        setCompanySelection(resMasterCompany.payload)
        
      } catch (e) {
        console.error(e)
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
          alert(translate('usersValidationText6', language))
          return // Stop the submission
        }

        const token = localStorage.getItem('accessToken')
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/employees/create', employeeData, {
            // const response = await axios.post('http://54.178.202.58:8000/api/employees/create', employeeData, {
            headers: {
              Authorization: `Bearer ${token}`, // Add token to request headers
            },
          })
          console.log(response.data)
          alert('Saved')
          window.location.reload()
          
        } catch (error) {
          if (error.response.data[0].email[0] && error.response.status === 400) {
              alert(translate('emailExistsMessage', language))
          }else{
            console.error('Error:', error.response.data[0].email[0])
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

      const handleInputChange = (containerIndex, projectIndex, event) => {
        const { name, value } = event.target
        const newContainers = [...employees]
        newContainers[containerIndex] = {
          ...newContainers[containerIndex],
          [name]: value, 
        }
        setEmployees(newContainers) 
      }

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
          <div className='EmployeesRegistration_top_body_cont'></div>
          <div className='EmployeesRegistration_mid_body_cont'>
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
            <div className='EmployeesRegistration_mid_form_cont'>
              <form onSubmit={handleSubmit}>
                {employees.map((container, containerIndex) => (
                  <div
                    key={containerIndex}
                    className={`EmployeesRegistration_form-content ${containerIndex > 0 ? 'EmployeesRegistration_form-content-special' : ''}`}
                  >
                    <div
                      className={`EmployeesRegistration_form-content ${containerIndex > 0 ? 'EmployeesRegistration_ForImplementationOfHorizontalLineBelow' : ''}`}
                    ></div>
                    <div
                      className={`projectsRegistration_form-content ${containerIndex > 0 ? 'projectsRegistration_form-content-special' : ''}`}
                    >
                      <div
                        className={`projectsRegistration_form-content ${containerIndex > 0 ? 'projectsRegistration_form-line' : ''}`}
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
                              {businessSelection.map((division) => (
                                <option key={division.business_division_id} value={division.business_division_id}>
                                  {division.business_division_name}
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
                          <div className='EmployeesRegistration_company_name-div'>
                            <label className='EmployeesRegistration_company_name'>
                              {translate('companyName', language)}
                            </label>
                            <select
                              className='EmployeesRegistration_select-option'
                              name='company_name'
                              value={container.company_name}
                              onChange={(e) => handleInputChange(containerIndex, null, e)}
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
                      </div>
                    </div>
                  </div>
                ))}

                <input type='hidden' name='auth_user_id' value='' />

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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeesRegistration
