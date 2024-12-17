import React, { useEffect, useState } from 'react';
import Btn from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons';
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons';
import axios from 'axios';
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal';
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { createEmployeeExpense } from '../../api/EmployeeExpenseEndpoint/CreateEmployeeExpense';
import { getProject } from '../../api/ProjectsEndpoint/GetProject';
import { getEmployee } from '../../api/EmployeeEndpoint/GetEmployee';
import {
  validateEmployeeExpensesRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'


const months = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const EmployeeExpensesRegistration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('/planning-list')
  const [activeTabOther, setActiveTabOther] = useState('employeeExpenses')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 1
  const endYear = currentYear + 2
  const years = Array.from({ length: endYear - startYear + 1 }, (val, i) => startYear + i)
  const token = localStorage.getItem('accessToken')
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const storedUserID = localStorage.getItem('userID')
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])

  const [employeeContainers, setEmployeeContainers] = useState([
    {
      id: 1,
      employee: '',
      projectEntries: [{ id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '' }],
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

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
    setEmployeeContainers([
      {
        id: 1,
        employee: '',
        projectEntries: [{ id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '' }],
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

  const monthNames = {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        getEmployee(token)
          .then((data) => {
            setEmployees(data)
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              console.log(error)
            } else {
              console.error('There was an error fetching the employee!', error)
            }
          })

        getProject(token)
          .then((data) => {
            const result = uniqueProjects(data)
            setProjects(result)
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              console.log(error)
            } else {
              console.error('There was an error fetching the projects!', error)
            }
          })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [token])

  const maximumEntries = 5

  //This function will make ProjectName unique base on project_name and business_division
  const uniqueProjects = (projects) => {
    const seen = new Set()
    return projects.filter((project) => {
      const identifier = `${project.project_name}-${project.business_division}`
      if (seen.has(identifier)) {
        return false
      }
      seen.add(identifier)
      return true
    })
  }

  const addEmployeeContainer = () => {
    if (employeeContainers.length < maximumEntries) {
      setEmployeeContainers([
        ...employeeContainers,
        {
          id: employeeContainers.length + 1,
          employee: '',
          projectEntries: [{ id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '' }],
        },
      ])
    }
  }

  const removeEmployeeContainer = () => {
    if (employeeContainers.length > 1) {
      setEmployeeContainers(employeeContainers.slice(0, -1))
    }
  }

  const addProjectEntry = (containerIndex) => {
    const updatedContainers = [...employeeContainers]
    const projectEntries = updatedContainers[containerIndex].projectEntries

    const maximumEntries = 5

    if (projectEntries.length < maximumEntries) {
      projectEntries.push({
        id: projectEntries.length + 1,
        clients: '',
        auth_id: storedUserID,
        projects: '',
        year: '',
        month: '',
      })
      setEmployeeContainers(updatedContainers)
    }
  }

  const removeProjectEntry = (containerIndex) => {
    const updatedContainers = [...employeeContainers]
    if (updatedContainers[containerIndex].projectEntries.length > 1) {
      updatedContainers[containerIndex].projectEntries.pop()
      setEmployeeContainers(updatedContainers)
    }
  }

  const handleInputChange = (containerIndex, projectIndex, event) => {
    const { name, value } = event.target
    const newContainers = [...employeeContainers]

    if (projectIndex !== null) {
      if (name === 'projects') {
        const selectedProject = projects.find((project) => project.project_id === value)

        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          projects: value,
          clients: selectedProject ? selectedProject.client : '',
        }
      } else {
        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          [name]: value,
        }
      }
    } else {
      newContainers[containerIndex] = {
        ...newContainers[containerIndex],
        [name]: value,
      }
    }

    setEmployeeContainers(newContainers)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'employeeExpenses'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateEmployeeExpenses = (records) =>
      validateEmployeeExpensesRecords(
        records,
        fieldChecks,
        'employeeExpenses',
        'employeeExpensesProjectContainers',
        language,
      )

    // Step 2: Validate client-side input
    const validationErrors = validateEmployeeExpenses(employeeContainers)

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month', 'employee', 'projects']
    const duplicateErrors = checkForDuplicates(
      employeeContainers,
      uniqueFields,
      'employeeExpenses',
      language,
      'projectEntries',
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
      setModalMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsModalOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }
    // Continue with submission if no errors

    createEmployeeExpense(employeeContainers, token)
      .then(() => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setEmployeeContainers([
          {
            id: 1,
            employee: '',
            projectEntries: [{ id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '' }],
          },
        ])
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.detail

          // Check if the error message indicates a duplicate expense
          if (errorMessage.includes('There is already an existing expense')) {
            // Extract the employee name, year, and month from the error message
            const matches = errorMessage.match(/already an existing expense for (.+) for (\d{1,2}\/\d{4})/)
            if (matches) {
              const employeeName = matches[1] // Extracted employee name
              const date = matches[2] // Extracted date (month/year)

              // Set the modal message with the employee name and date
              setModalMessage(
                translate('employeeExpensesDuplicateData', language)
                  .replace('${employeeName}', employeeName)
                  .replace('${date}', date),
              ) // Assuming you want to format the date in the message
            }
          } else {
            setModalMessage(translate('error', language)) // General error handling
          }
          setIsModalOpen(true)
        } else {
          console.log(error) // Log other errors for debugging
          setModalMessage(translate('error', language))
          setIsModalOpen(true)
        }
      })
  }

  const handleListClick = () => {
    navigate('/employee-expenses-list')
  }

  return (
    <div className='employeeExpensesRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='employeeExpensesRegistration_cont_wrapper'>
        <Sidebar />
        <div className='employeeExpensesRegistration_data_content'>
          <div className='employeeExpensesRegistration_top_body_cont'>
            {/* <div className='employeeExpensesRegistration_wrapper_div'> */}
            {/* <div className='employeeExpensesRegistration_top_content'>
        </div> */}
            {/* <div className='employeeExpensesRegistration_top_btn_cont'></div> */}
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('employeeExpensesRegistration', language)}
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
          <div className='employeeExpensesRegistration_mid_body_cont'>
            {/* <form className='employeeExpensesRegistration_form_wrapper' onSubmit={handleSubmit}> */}
            <form className='employeeExpensesRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              {/* <div className='employeeExpensesRegistration_table_wrapper'> */}
              <div className='employeeExpensesRegistration_mid_form_cont'>
                {employeeContainers.map((container, containerIndex) => (
                  <div className='employeeExpensesRegistration_container' key={container.id}>
                    <div
                      className={`employeeExpensesRegistration_form-content ${containerIndex > 0 ? 'employeeExpensesRegistration_form-line' : ''}`}
                    ></div>
                    <div className='employeeExpensesRegistration_cont-body'>
                      <div className='employeeExpensesRegistration_row'>
                        <div className='employeeExpensesRegistration_label'>
                          <p>{translate('employee', language)}</p>
                        </div>
                        <div className='employeeExpensesRegistration_card-box'>
                          <select
                            name='employee'
                            value={container.employee}
                            className='employeeExpensesRegistration_emp-select'
                            onChange={(e) => handleInputChange(containerIndex, null, e)}
                          >
                            <option value=''>{translate('selectEmployee', language)}</option>
                            {employees.map((employee) => (
                              <option key={employee.employee_id} value={employee.employee_id}>
                                {`${employee.last_name} ${employee.first_name}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className='employeeExpensesRegistration_project-fields'>
                        {container.projectEntries.map((projectEntry, projectIndex) => (
                          <div className='employeeExpensesRegistration_project-group' key={projectEntry.id}>
                            <div className='employeeExpensesRegistration_row'>
                              <div className='employeeExpensesRegistration_label'>
                                <p>{translate('project', language)}</p>
                              </div>
                              <div className='employeeExpensesRegistration_card-box'>
                                <select
                                  name='projects'
                                  value={projectEntry.projects}
                                  onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                                >
                                  <option value=''></option>
                                  {projects.map((project) => (
                                    <option
                                      key={project.project_id}
                                      value={project.project_id}
                                      title={project.business_name}
                                    >
                                      {project.project_name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className='employeeExpensesRegistration_row'>
                              <div className='employeeExpensesRegistration_label'>
                                <p>{translate('year', language)}</p>
                              </div>
                              <div className='employeeExpensesRegistration_card-box'>
                                <select
                                  name='year'
                                  value={projectEntry.year}
                                  onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                                >
                                  <option value=''></option>{' '}
                                  {[...new Set(projects.map((project) => project.year))].map((year, index) => (
                                    <option key={index} value={year}>
                                      {year}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className='employeeExpensesRegistration_row'>
                              <div className='employeeExpensesRegistration_label'>
                                <p>{translate('month', language)}</p>
                              </div>
                              <div className='employeeExpensesRegistration_card-box'>
                                <select
                                  name='month'
                                  value={projectEntry.month}
                                  onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                                >
                                  <option value=''></option>{' '}
                                  {[...new Set(projects.map((project) => project.month))].map((month, index) => (
                                    <option key={index} value={month.month}>
                                      {language === 'en' ? monthNames[month].en : monthNames[month].jp}{' '}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className='employeeExpensesRegistration_button-box'>
                          <Btn
                            label='+'
                            className='employeeExpensesRegistration_button'
                            type='button'
                            onClick={() => addProjectEntry(containerIndex)}
                          />
                          {employeeContainers[containerIndex].projectEntries.length >= 2 ? (
                            <Btn
                              label='-'
                              className='employeeExpensesRegistration_button'
                              type='button'
                              onClick={() => removeProjectEntry(containerIndex)}
                            />
                          ) : (
                            <div className='employeeExpensesRegistration_button_empty'></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='employeeExpensesRegistration_cont-footer'>
                <div className='employeeExpensesRegistration_btn-plusminus'>
                  {employeeContainers.length >= 2 ? (
                    <button
                      className='employeeExpensesRegistration_minus-btn'
                      type='button'
                      onClick={removeEmployeeContainer}
                    >
                      -
                    </button>
                  ) : (
                    <div className='employeeExpensesRegistration_minus-btn-empty'></div>
                  )}
                  <button
                    className='employeeExpensesRegistration_plus-btn custom-disabled'
                    type='button'
                    onClick={addEmployeeContainer}
                    disabled={employeeContainers.length === maximumEntries}
                  >
                    +
                  </button>
                </div>
                <div className='employeeExpensesRegistration_btn-subcancel'>
                  <button type='button' className='button is-light' onClick={handleCancel}>
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
};

export default EmployeeExpensesRegistration;
