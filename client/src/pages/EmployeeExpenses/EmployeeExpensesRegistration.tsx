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
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { createEmployeeExpense } from '../../api/EmployeeExpenseEndpoint/CreateEmployeeExpense'
import { getProject } from '../../api/ProjectsEndpoint/GetProject'
import { getEmployee } from '../../api/EmployeeEndpoint/GetEmployee'
import {
  validateEmployeeExpensesRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import { getFilteredEmployeeExpense } from '../../api/EmployeeExpenseEndpoint/FilterGetEmployeeExpense'
import { currentYear, maximumEntriesEE, monthNames, storedUserID, token } from '../../constants'
import { handlePLRegTabsClick } from '../../utils/helperFunctionsUtil'
import { closeModal, openModal } from '../../actions/hooks'

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

const EmployeeExpensesRegistration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('/planning-list')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const startYear = currentYear - 1
  const endYear = currentYear + 2
  const years = Array.from({ length: endYear - startYear + 1 }, (val, i) => startYear + i)
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [filteredDates, setFilteredDates] = useState<DateForm[]>([{ form: [{ date: [] }] }])
  const [selectionYear, setSelectionYear] = useState<DateForm[]>([{ form: [{ date: [] }] }])
  const [employeeContainers, setEmployeeContainers] = useState([
    {
      id: 1,
      employee: '',
      projectEntries: [
        { id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '', project_id: '' },
      ],
    },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const onTabClick = (tab) => handlePLRegTabsClick(tab, navigate, setActiveTab)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal(setModalIsOpen)
  }

  const handleRemoveInputData = () => {
    setEmployeeContainers([
      {
        id: 1,
        employee: '',
        projectEntries: [
          { id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '', project_id: '' },
        ],
      },
    ])
    closeModal(setModalIsOpen)
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

  //This function will make ProjectName unique base on project_name, client and business_division
  const uniqueProjects = (projects) => {
    const seen = new Set()
    return projects.filter((project) => {
      const identifier = `${project.project_name}-${project.business_division}-${project.client}`
      if (seen.has(identifier)) {
        return false
      }
      seen.add(identifier)
      return true
    })
  }

  const addEmployeeContainer = () => {
    if (employeeContainers.length < maximumEntriesEE) {
      setEmployeeContainers([
        ...employeeContainers,
        {
          id: employeeContainers.length + 1,
          employee: '',
          projectEntries: [
            { id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '', project_id: '' },
          ],
        },
      ])
      setFilteredDates((prevDates) => {
        return [...prevDates, { form: [{ date: [] }] }]
      })
      setSelectionYear((prevDates) => {
        return [...prevDates, { form: [{ date: [] }] }]
      })
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

    if (projectEntries.length < maximumEntriesEE) {
      projectEntries.push({
        id: projectEntries.length + 1,
        clients: '',
        auth_id: storedUserID,
        projects: '',
        year: '',
        month: '',
        project_id: '',
      })
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
      setSelectionYear((prevDates: DateForm[]) => {
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
    const [project_id = null] = value?.split(':') || []
    if (projectIndex !== null) {
      if (name === 'projects') {
        const selectedProject = projects.find((project) => project.project_id === project_id)
        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          projects: value,
          clients: selectedProject ? selectedProject.client : '',
          year: '',
          month: '',
        }

        employeeContainers.map((employee, index) => {
          const getProjectName = employee.projectEntries.flatMap((entry) => entry.projects)[projectIndex]
          const [project_id = null, project_name = null, client = null, business_division = null] =
            getProjectName?.split(':') || []
          const filterParams = {
            ...(project_id && { project_id }),
            ...(project_name && { project_name }),
            ...(client && { client }),
            ...(business_division && { business_division }),
          }
          if (containerIndex === index) {
            getFilteredEmployeeExpense(filterParams, token)
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
                                  month: item.month,
                                  year: item.year,
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
                setSelectionYear((prevDates: any[]) => {
                  return prevDates?.map((prevDate, index) => {
                    if (containerIndex == index) {
                      return {
                        form: prevDate?.form?.map((date, formIndex) => {
                          if (projectIndex == formIndex) {
                            return {
                              date: data?.map((item) => {
                                return {
                                  month: item.month,
                                  year: item.year,
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
        const selectedProject = projects.find((project) => project.project_id === project_id)
        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          year: value,
          clients: selectedProject ? selectedProject.client : '',
        }

        employeeContainers.map((employee, index) => {
          const getProjectName = employee.projectEntries.flatMap((entry) => entry.projects)[projectIndex]
          const project_name = getProjectName?.split(':')[1] || getProjectName
          const client = getProjectName?.split(':')[2] || getProjectName
          const business_division = getProjectName?.split(':')[3] || getProjectName
          const year = employee.projectEntries.flatMap((entry) => entry.year)[projectIndex]
          const filterParams = {
            project_name,
            ...(client && { client }),
            ...(business_division && { business_division }),
            year,
          }
          if (containerIndex === index) {
            getFilteredEmployeeExpense(filterParams, token)
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
                                  month: item.month,
                                  year: item.year,
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
      } else if (name === 'month') {
        const selectedProject = projects.find((project) => project.project_id === project_id)

        newContainers[containerIndex].projectEntries[projectIndex] = {
          ...newContainers[containerIndex].projectEntries[projectIndex],
          month: value,
          clients: selectedProject ? selectedProject.client : '',
        }

        employeeContainers.map((employee, index) => {
          const getProjectName = employee.projectEntries.flatMap((entry) => entry.projects)[projectIndex]
          const project_name = getProjectName?.split(':')[1] || getProjectName
          const client = getProjectName?.split(':')[2] || getProjectName
          const business_division = getProjectName?.split(':')[3] || getProjectName
          const year = employee.projectEntries.flatMap((entry) => entry.year)[projectIndex]
          const month = employee.projectEntries.flatMap((entry) => entry.month)[projectIndex]

          const filterParams = {
            ...(project_name && { project_name }),
            ...(client && { client }),
            ...(business_division && { business_division }),
            ...(year && { year }),
            ...(month && { month }),
          }
          if (containerIndex === index) {
            getFilteredEmployeeExpense(filterParams, token)
              .then((data) => {
                employee.projectEntries[projectIndex].project_id = data[0].project_id
                employee.projectEntries[projectIndex].clients = data[0].client
              })
              .catch((error) => {
                console.error('Something is wrong with filter function:', error)
              })
          }
          return employee
        })
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
            projectEntries: [
              { id: 1, projects: '', clients: '', auth_id: storedUserID, year: '', month: '', project_id: '' },
            ],
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
              activeTabOther={'employeeExpenses'}
              message={translate('employeeExpensesRegistration', language)}
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
                                  <option value=''>{translate('selectProject', language)}</option>
                                  {projects.map((project) => (
                                    <option
                                      key={project.project_id}
                                      value={`${project.project_id}:${project.project_name}:${project.client}:${project.business_division}`}
                                      title={project.business_name + ':' + project.client_name}
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
                                  {selectionYear?.[containerIndex]?.form?.map((form, formIndex) =>
                                    formIndex === projectIndex && form?.date
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
                                  {filteredDates?.[containerIndex]?.form?.map(
                                    (form, formIndex) =>
                                      formIndex === projectIndex &&
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
                    disabled={employeeContainers.length === maximumEntriesEE}
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
}

export default EmployeeExpensesRegistration
