import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import axios from 'axios'
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal'
import { getProject } from '../../api/ProjectsEndpoint/GetProject'
import { getEmployee } from '../../api/EmployeeEndpoint/GetEmployee'
import { createEmployeeExpenseResults } from '../../api/EmployeeExpensesResultEndpoint/CreateEmployeeExpenseResult'
import { checkForDuplicates, getFieldChecks, translateAndFormatErrors, validateEmployeeExpensesResultsRecords } from '../../utils/validationUtil'
import { getProjectSalesResults } from '../../api/ProjectSalesResultsEndpoint/GetProjectSalesResults'
import { getFilteredEmployeeExpenseResults } from '../../api/EmployeeExpensesResultEndpoint/FilterGetEmployeeExpenseResult'


type Date = {
  year: string
  month: string
  project_name: string
}
type DateForm = {
  form: Dates[]
}
type Dates = {
  date: Date[]
}

const EmployeeExpensesResultsRegistration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('/planning-list')
  const [activeTabOther, setActiveTabOther] = useState('employeeExpensesResults')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const years = [2024, 2025]
  const token = localStorage.getItem('accessToken')
  const [employees, setEmployees] = useState([])
  const [projectsSalesResults, setProjectSalesResult] = useState([])
  const storedUserID = localStorage.getItem('userID')
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [employeeContainers, setEmployeeContainers] = useState([
    {
      id: 1,
      employee: '',
      projectEntries: [{ id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '', project_id: ''}],
    },
  ])
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [filteredDates, setFilteredDates] = useState<DateForm[]>([ { form: [{ date: []}]} ])
  const [selectionYearResults, setSelectionYearResults] = useState<DateForm[]>([{ form: [{ date: [] }] }])
  
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
        projectEntries: [{ id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '', project_id: '' }],
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

        getProjectSalesResults(token)
          .then((data) => {
            setProjectSalesResult(data)
            
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

  const addEmployeeContainer = () => {
    if (employeeContainers.length < 5) {
      setEmployeeContainers([
        ...employeeContainers,
        {
          id: employeeContainers.length + 1,
          employee: '',
          projectEntries: [{ id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '', project_id: '' }],
        },
      ])
    }
    setFilteredDates((prevDates) => {
      return [...prevDates, { form: [{ date: [] }] }]
    })
    setSelectionYearResults((prevDates) => {
      return [...prevDates, { form: [{ date: [] }] }]
    })
  }

  const removeEmployeeContainer = () => {
    if (employeeContainers.length > 1) {
      setEmployeeContainers(employeeContainers.slice(0, -1))
    }
  }

  const addProjectEntry = (containerIndex) => {
    const updatedContainers = [...employeeContainers]
    const projectEntries = updatedContainers[containerIndex].projectEntries

    if (projectEntries.length < 3) {
      const newEntry = {
        id: projectEntries.length + 1, // Unique ID for each project entry
        clients: '',
        auth_id: storedUserID,
        projects: '',
        year: '',
        month: '',
        project_id: ''
      }

      projectEntries.push(newEntry)
      setEmployeeContainers(updatedContainers)
      setFilteredDates((prevDates: DateForm[]) => {
        
        return prevDates?.map((prevDate, index) => { 
          if (containerIndex == index) {
            return {
              form: [...prevDate.form, { date: [] }],
            }
          }
          return prevDate
        })
      })
      setSelectionYearResults((prevDates: DateForm[]) => {
        return prevDates?.map((prevDate, index) => {
          if (containerIndex == index) {
            return {
              form: [...prevDate.form, { date: [] }],
            }
          }
          return prevDate
        })
      })
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
        const selectedProject = projectsSalesResults.find((project) => project.projects.project_id === value)

        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          projects: value,
          clients: selectedProject ? selectedProject.projects.client : '',
          year : "",
          month : "",
        }
        employeeContainers.map((employee, index) => {
          const project_name = employee.projectEntries.flatMap((entry) => entry.projects)[projectIndex]
          const filterParams = {
            ...(project_name && { project_name }),
          }
          if(containerIndex === index) {
              getFilteredEmployeeExpenseResults(filterParams, token)
                .then((data) => {
                  setFilteredDates((prevDates: any[]) => {
                    return prevDates?.map((prevDate, index) => {
                      if (containerIndex == index) {
                        return {
                          form: prevDate?.form?.map((date, formIndex) => {
                            if (projectIndex == formIndex) {
                              return {
                                date: data?.map((item) => {
                                  return {
                                    month: item.projects.month,
                                    year: item.projects.year,
                                  }
                                }),
                              }
                            }
                            return date
                          }),
                        }
                      }
                      return prevDate
                    })
                  })
                  setSelectionYearResults((prevDates: any[]) => {
                    return prevDates?.map((prevDate, index) => {
                      if (containerIndex == index) {
                        return {
                          form: prevDate?.form?.map((date, formIndex) => {
                            if (projectIndex == formIndex) {
                              return {
                                date: data?.map((item) => {
                                  return {
                                    month: item.projects.month,
                                    year: item.projects.year,
                                  }
                                }),
                              }
                            }
                            return date
                          }),
                        }
                      }
                      return prevDate
                    })
                  })
                })
                .catch((error) => {
                  console.error('Something is wrong with filter function:', error)
                })
          }
          return employee
        })
      } else if (name === 'year') {
        const selectedProject = projectsSalesResults.find((project) => project.projects.project_id === value)

        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          year: value,
          clients: selectedProject ? selectedProject.projects.client : '',
        }

        employeeContainers.map((employee, index) => {
          const project_name = employee.projectEntries.flatMap((entry) => entry.projects)[projectIndex]
          const year = employee.projectEntries.flatMap((entry) => entry.year)[projectIndex]
          const filterParams = {
            project_name,
            year,
          }
          if(containerIndex === index){
              getFilteredEmployeeExpenseResults(filterParams, token)
                .then((data) => {
                  setFilteredDates((prevDates: any[]) => {
                    return prevDates?.map((prevDate, index) => {
                      if (containerIndex == index) {
                        return {
                          form: prevDate?.form?.map((date, formIndex) => {
                            if (projectIndex == formIndex) {
                              return {
                                date: data?.map((item) => {
                                  return {
                                    month: item.projects.month,
                                    year: item.projects.year,
                                  }
                                }),
                              }
                            }
                            return date
                          }),
                        }
                      }
                      return prevDate
                    })
                  })
                })
                .catch((error) => {
                  console.error('Something is wrong with filter function:', error)
                })
          }
          return employee
        })
      } else  if (name === 'month') {
        const selectedProject = projectsSalesResults.find((project) => project.projects.project_id === value)

        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          month: value,
          clients: selectedProject ? selectedProject.projects.client : '',
        }

        employeeContainers.map((employee, index) => {
          const project_name = employee.projectEntries.flatMap((entry) => entry.projects)[projectIndex]
          const year = employee.projectEntries.flatMap((entry) => entry.year)[projectIndex]
          const month = employee.projectEntries.flatMap((entry) => entry.month)[projectIndex]
          const filterParams = {
            ...(project_name && { project_name }),
            ...(year && { year }),
            ...(month && { month }),
          }
          if(containerIndex === index){
            getFilteredEmployeeExpenseResults(filterParams, token)
              .then((data) => {
                employee.projectEntries[projectIndex].project_id = data[0].projects.project_id
                employee.projectEntries[projectIndex].clients = data[0].projects.client
              })
              .catch((error) => {
                console.error('Something is wrong with filter function:', error)
              })
          }
          return employee
        })
      }else {
        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          [name]: value,
        }
      }
    } 
    else {
      newContainers[containerIndex] = {
        ...newContainers[containerIndex],
        [name]: value,
      }
    }
    setEmployeeContainers(newContainers)
  }

  const hasDuplicateProjects = () => {
    for (const container of employeeContainers) {
      const projectMap = new Map()

      for (const projectEntry of container.projectEntries) {
        const projectId = projectEntry.projects

        // Ensure the projectId is not empty before checking
        if (projectId) {
          // Check if the project is already present for the same employee
          if (projectMap.has(projectId)) {
            return true // Duplicate project found for the same employee
          }
          projectMap.set(projectId, true)
        }
      }
    }

    return false // No duplicates found for any employee
  }

  const handleValidation = () => {
    const projectField = translate('project', language)
    const yearField = translate('year', language)
    const monthField = translate('month', language)

    const allFields = [projectField, yearField, monthField]

    for (const container of employeeContainers) {
      if (!container.employee) {
        setModalMessage(translate('employeeExpensesValidation1', language))
        setIsModalOpen(true)
        return false
      }

      for (const projectEntry of container.projectEntries) {
        const missingFields = []
        if (!projectEntry.projects) {
          missingFields.push(translate('project', language))
        }
        if (!projectEntry.year) {
          missingFields.push(translate('year', language))
        }
        if (!projectEntry.month) {
          missingFields.push(translate('month', language))
        }

        // If there are any missing fields, create a message
        if (missingFields.length > 0) {
          const fieldsMessage = missingFields.join(', ')
          setModalMessage(translate('employeeExpensesValidation3', language).replace('${fieldsMessage}', fieldsMessage))
          setIsModalOpen(true)
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'employeeExpensesResults'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateEmployeeExpensesResults = (records) =>
      validateEmployeeExpensesResultsRecords(
        records,
        fieldChecks,
        'employeeExpensesResults',
        'employeeExpensesProjectResultsContainers',
        language,
      )

    // Step 2: Validate client-side input
    const validationErrors = validateEmployeeExpensesResults(employeeContainers)
    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month', 'employee', 'projects']
    const duplicateErrors = checkForDuplicates(
      employeeContainers,
      uniqueFields,
      'employeeExpensesResults',
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
    createEmployeeExpenseResults(employeeContainers, token)
      .then(() => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setEmployeeContainers([
          {
            id: 1,
            employee: '',
            projectEntries: [{ id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '', project_id: '' }],
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
    navigate('/employee-expenses-results-list')
  }
  
  return (
    <div className='employeeExpensesResultsRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='employeeExpensesResultsRegistration_cont_wrapper'>
        <Sidebar />
        <div className='employeeExpensesResultsRegistration_data_content'>
          <div className='employeeExpensesResultsRegistration_top_body_cont'>
            {/* <div className='employeeExpensesRegistration_wrapper_div'> */}
            {/* <div className='employeeExpensesRegistration_top_content'>
        </div> */}
            {/* <div className='employeeExpensesRegistration_top_btn_cont'></div> */}
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('employeeExpensesResultsRegistration', language)}
              handleTabsClick={handleTabsClick}
              handleListClick={handleListClick}
              buttonConfig={[
                { labelKey: 'expensesResultsShort', tabKey: 'expensesResults' },
                { labelKey: 'projectSalesResultsShort', tabKey: 'projectSalesResults' },
                { labelKey: 'employeeExpensesResultsShort', tabKey: 'employeeExpensesResults' },
                { labelKey: 'costOfSalesResultsShort', tabKey: 'costOfSalesResults' },
              ]}
            />
          </div>
          <div className='employeeExpensesResultsRegistration_mid_body_cont'>
            {/* <form className='employeeExpensesRegistration_form_wrapper' onSubmit={handleSubmit}> */}
            <form className='employeeExpensesResultsRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              {/* <div className='employeeExpensesRegistration_table_wrapper'> */}
              <div className='employeeExpensesResultsRegistration_mid_form_cont'>
                {employeeContainers?.map((container, containerIndex) => (
                  <div className='employeeExpensesResultsRegistration_container' key={container.id}>
                    <div
                      className={`employeeExpensesResultsRegistration_form-content ${containerIndex > 0 ? 'employeeExpensesResultsRegistration_form-line' : ''}`}
                    ></div>
                    <div className='employeeExpensesResultsRegistration_cont-body'>
                      <div className='employeeExpensesResultsRegistration_row'>
                        <div className='employeeExpensesResultsRegistration_label'>
                          <p>{translate('employee', language)}</p>
                        </div>
                        <div className='employeeExpensesResultsRegistration_card-box'>
                          <select
                            name='employee'
                            value={container.employee}
                            className='employeeExpensesResultsRegistration_emp-select'
                            onChange={(e) => handleInputChange(containerIndex, null, e)}
                          >
                            <option value=''>{translate('selectEmployee', language)}</option>
                            {employees?.map((employee) => (
                              <option key={employee.employee_id} value={employee.employee_id}>
                                {`${employee.last_name} ${employee.first_name}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className='employeeExpensesResultsRegistration_project-fields'>
                        {container.projectEntries?.map((projectEntry, rowIndex) => (
                          <div className='employeeExpensesResultsRegistration_project-group' key={projectEntry.id}>
                            <div className='employeeExpensesResultsRegistration_row'>
                              <div className='employeeExpensesResultsRegistration_label'>
                                <p>{translate('project', language)}</p>
                              </div>
                              <div className='employeeExpensesResultsRegistration_card-box'>
                                <select
                                  name='projects'
                                  value={projectEntry.projects}
                                  onChange={(e) => handleInputChange(containerIndex, rowIndex, e)}
                                >
                                  <option value=''>{translate('selectProject', language)}</option>
                                  {[
                                    ...new Map(
                                      projectsSalesResults.map((project) => [project.projects.project_name, project]),
                                    ).values(),
                                  ].map((project) => (
                                    <option
                                      key={project.projects.project_id}
                                      value={project.projects.project_name}
                                      title={project.projects.business_name}
                                    >
                                      {project.projects.project_name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className='employeeExpensesResultsRegistration_row'>
                              <div className='employeeExpensesResultsRegistration_label'>
                                <p>{translate('year', language)}</p>
                              </div>
                              <div className='employeeExpensesResultsRegistration_card-box'>
                                <select
                                  name='year'
                                  value={projectEntry.year}
                                  onChange={(e) => handleInputChange(containerIndex, rowIndex, e)}
                                >
                                  <option value=''></option>
                                  {selectionYearResults?.[containerIndex]?.form?.map((form, formIndex) =>
                                    formIndex === rowIndex && form?.date
                                      ? [...new Set(form.date.map((year) => year.year))].map((year, idx) => {
                                          const uniqueKey = `${containerIndex}-${formIndex}-${idx}-${year}`
                                          return (
                                            <option key={uniqueKey} value={year}>
                                              {year}
                                            </option>
                                          )
                                        })
                                      : null,
                                  )}
                                </select>
                              </div>
                            </div>
                            <div className='employeeExpensesResultsRegistration_row'>
                              <div className='employeeExpensesResultsRegistration_label'>
                                <p>{translate('month', language)}</p>
                              </div>
                              <div className='employeeExpensesResultsRegistration_card-box'>
                                <select
                                  name='month'
                                  value={projectEntry.month}
                                  onChange={(e) => handleInputChange(containerIndex, rowIndex, e)}
                                >
                                  <option value=''></option>{' '}
                                  {filteredDates?.[containerIndex]?.form?.map(
                                    (form, formIndex) =>
                                      formIndex === rowIndex &&
                                      (() => {
                                        const uniqueMonths = new Set()
                                        return form?.date
                                          ?.filter((month) => {
                                            if (uniqueMonths.has(month.month)) {
                                              return false
                                            }
                                            uniqueMonths.add(month.month)
                                            return true
                                          })
                                          .map((month, idx) => {
                                            const uniqueKey = `${containerIndex}-${formIndex}-${idx}-${month.month}`
                                            return (
                                              <option key={uniqueKey} value={month.month}>
                                                {language === 'en'
                                                  ? monthNames[month.month].en
                                                  : monthNames[month.month].jp}{' '}
                                              </option>
                                            )
                                          })
                                      })(),
                                  )}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className='employeeExpensesResultsRegistration_button-box'>
                          <Btn
                            label='+'
                            className='employeeExpensesResultsRegistration_button'
                            type='button'
                            onClick={() => addProjectEntry(containerIndex)}
                          />
                          <Btn
                            label='-'
                            className='employeeExpensesResultsRegistration_button'
                            type='button'
                            onClick={() => removeProjectEntry(containerIndex)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='employeeExpensesResultsRegistration_cont-footer'>
                <div className='employeeExpensesResultsRegistration_btn-plusminus'>
                  <button
                    className='employeeExpensesResultsRegistration_plus-btn'
                    type='button'
                    onClick={addEmployeeContainer}
                  >
                    +
                  </button>
                  <button
                    className='employeeExpensesResultsRegistration_minus-btn'
                    type='button'
                    onClick={removeEmployeeContainer}
                  >
                    -
                  </button>
                </div>
                <div className='employeeExpensesResultsRegistration_btn-subcancel'>
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
}

export default EmployeeExpensesResultsRegistration
