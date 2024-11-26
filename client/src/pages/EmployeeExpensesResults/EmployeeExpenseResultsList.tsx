import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import ListButtons from '../../components/ListButtons/ListButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import axios from 'axios'
import AlertModal from '../../components/AlertModal/AlertModal'
import { RiDeleteBin6Fill } from 'react-icons/ri'
import { log } from 'console'
import CrudModal from '../../components/CrudModal/CrudModal'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import '../../assets/scss/Components/SliderToggle.scss'

import { getEmployeeExpense } from '../../api/EmployeeExpenseEndpoint/GetEmployeeExpense'
import { deleteEmployeeExpenseX } from '../../api/EmployeeExpenseEndpoint/DeleteEmployeeExpenseX'
import { deleteProjectAssociation } from '../../api/EmployeeExpenseEndpoint/DeleteProjectAssociation'
import { getEmployeeExpenseResults } from '../../api/EmployeeExpensesResultEndpoint/GetEmployeeExpenseResult'
import { deleteEmployeeExpenseResults } from '../../api/EmployeeExpensesResultEndpoint/DeleteEmployeeExpenseResult'
import { deleteProjectAssociationResults } from '../../api/EmployeeExpensesResultEndpoint/DeleteProjectAssociationResults'

const months: number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3] // Store as numbers

const EmployeeExpensesResultsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('employeeExpensesResults')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [employeeExpenses, setEmployeeExpenses] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedEmployeeExpenses, setSelectedEmployeeExpenses] = useState<any>(null)
  const [deleteEmployeeExpensesId, setDeleteEmployeeExpensesId] = useState([])
  const [employeeProjectId, setEmployeeProjectId] = useState<{
    employee_expense_result_id: string
    project_id: string
    mode: 'employee_expense' | 'project'
  }>({} as { employee_expense_result_id: string; project_id: string; mode: 'employee_expense' })
  const token = localStorage.getItem('accessToken')
  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleClick = () => {
    setIsEditing((prevState) => {
      const newEditingState = !prevState
      if (newEditingState) {
        setLanguage(initialLanguage)
      }

      return newEditingState
    })
  }

  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'project':
        navigate('/projects-registration')
        break
      case 'expensesResults':
        navigate('/expenses-results-list')
        break
      case 'employeeExpensesResults':
        navigate('/employee-expenses-results-list')
        break
      default:
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

  const handleNewRegistrationClick = () => {
    navigate('/employee-expenses-results-registration')
  }

  // Fetch employee expenses data
  useEffect(() => {
    const fetchEmployeeExpenses = async () => {
      if (!token) {
        window.location.href = '/login' // Redirect to login if no token found
        return
      }

      getEmployeeExpenseResults(token)
        .then((data) => {
          setEmployeeExpenses(data)
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('Error fetching employee expenses:', error)
          }
        })
    }

    fetchEmployeeExpenses()
  }, [])

  const openModal = (users, id) => {
    setSelectedEmployeeExpenses(users)
    setModalIsOpen(true)
    setDeleteEmployeeExpensesId(id)
  }

  const closeModal = () => {
    setSelectedEmployeeExpenses(null)
    setModalIsOpen(false)
    setIsCRUDOpen(false)
  }

  const handleDelete = () => {
    if (employeeProjectId.mode === 'employee_expense') {
      handleDeleteExpense()
    } else {
      handleRemoveProjectAssociation()
    }
  }

  const handleDeleteExpense = async () => {
    deleteEmployeeExpenseResults(employeeProjectId.employee_expense_result_id, token)
      .then(() => {
        setEmployeeExpenses((prevExpenses) =>
          prevExpenses.filter(
            (expense) => expense.employee_expense_result_id !== employeeProjectId.employee_expense_result_id,
          ),
        )

        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('Error deleting employee expense:', error)
        }
      })
  }

  const handleRemoveProjectAssociation = async () => {
    console.log(employeeProjectId)
    deleteProjectAssociationResults(employeeProjectId.employee_expense_result_id, employeeProjectId.project_id, token)
      .then(() => {
        setEmployeeExpenses((prevExpenses) =>
          prevExpenses.filter((expense) => expense.employee_expense_result_id !== employeeProjectId.employee_expense_result_id),
        )

        setCrudMessage(translate('employeeExpensesRemoveProject', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('Error removing project association:', error)
        }
      })
  }

  return (
    <div className='employeeExpensesResultsList_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='employeeExpensesResultsList_cont_wrapper'>
        <Sidebar />
        <div className={`employeeExpensesResultsList_wrapper_div ${isEditing ? 'editMode' : ''}`}>
          <div className='employeeExpensesResultsList_top_content'>
            <div className='employeeExpensesResultsList_top_body_cont'>
              <div className='employeeExpensesResultsList_mode_switch_datalist'>
                <div className='mode_switch_container'>
                  <p className='slider_mode_switch'>
                    {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                  </p>
                  <label className='slider_switch'>
                    <input type='checkbox' checked={isEditing} onChange={handleClick} />
                    <span className='slider'></span>
                  </label>
                </div>
              </div>
            </div>
            <div className='employeeExpensesResultsList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate('employeeExpensesResultsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'expensesResults', tabKey: 'expensesResults' },
                  { labelKey: 'projectSalesResults', tabKey: 'projectSalesResults' },
                  { labelKey: 'employeeExpensesResults', tabKey: 'employeeExpensesResults' },
                ]}
              />
              <div className={`employeeExpensesResultsList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`employeeExpensesResultsList_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  {/* <div className='columns is-mobile'> */}
                  {/* <div className='column'> */}
                  {isEditing ? (
                    <div className='editScroll'>
                      <table className='table is-bordered is-hoverable'>
                        <thead>
                          <tr className='employeeExpensesResultsList_table_title'>
                            <th className='employeeExpensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('employee', language)}
                            </th>
                            <th className='employeeExpensesResultsList_table_title_content_vertical has-text-centered'>
                              {translate('year', language)}
                            </th>
                            {months.map((month, index) => (
                              <th
                                key={index}
                                className='employeeExpensesResultsList_table_title_content_vertical has-text-centered'
                              >
                                {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                              </th>
                            ))}
                            <th className='employeeExpensesResultsList_table_title_content_vertical has-text-centered'></th>
                          </tr>
                        </thead>
                        <tbody className='employeeExpensesResultsList_table_body'>
                          {employeeExpenses
                            .reduce((acc, expense) => {
                              const existingYearIndex = acc.findIndex((year) => year.year === expense.year)

                              // If the year does not exist, create a new entry
                              if (existingYearIndex === -1) {
                                acc.push({
                                  year: expense.year,
                                  employees: [],
                                })
                              }

                              const yearGroup = acc[existingYearIndex === -1 ? acc.length - 1 : existingYearIndex]

                              const existingIndex = yearGroup.employees.findIndex(
                                (emp) =>
                                  emp.employee_last_name === expense.employee_last_name &&
                                  emp.employee_first_name === expense.employee_first_name,
                              )

                              // Parse the month from the expense
                              const monthFromExpense = parseInt(expense.month, 10)

                              // Map the month to your custom months array
                              const monthIndex = months.findIndex((month) => month === monthFromExpense) // Find the index of the month in the custom order

                              if (existingIndex === -1) {
                                // Initialize monthly expenses
                                const monthlyExpenses = Array(12)
                                  .fill(null)
                                  .map(() => ({
                                    projects: [],
                                    total_salary: 0,
                                  }))

                                // Update the monthly expenses for the correct month index
                                if (monthIndex !== -1) {
                                  monthlyExpenses[monthIndex].projects.push({
                                    project_name: expense.project_name,
                                    employee_salary: expense.employee_salary,
                                    project_id: expense.project_id,
                                    employee_expense_result_id: expense.employee_expense_result_id,
                                  })
                                  monthlyExpenses[monthIndex].total_salary += expense.employee_salary
                                }
                                yearGroup.employees.push({
                                  employee_expense_result_id: expense.employee_expense_result_id,
                                  project_id: expense.project_id,
                                  employee_last_name: expense.employee_last_name,
                                  employee_first_name: expense.employee_first_name,
                                  monthlyExpenses,
                                })
                              } else {
                                // Update the existing employee's monthly expenses
                                const existingMonthlyExpenses = yearGroup.employees[existingIndex].monthlyExpenses
                                if (monthIndex !== -1) {
                                  existingMonthlyExpenses[monthIndex].projects.push({
                                    project_name: expense.project_name,
                                    employee_salary: expense.employee_salary,
                                    project_id: expense.project_id,
                                    employee_expense_result_id: expense.employee_expense_result_id,
                                  })
                                  existingMonthlyExpenses[monthIndex].total_salary += expense.employee_salary
                                }
                              }

                              return acc
                            }, [])
                            .flatMap((yearGroup, yearIndex) => [
                              // Only add a separator for years after the first year
                              ...(yearIndex > 0
                                ? [
                                    <tr key={`year-${yearGroup.year}`}>
                                      <td colSpan={12} className='employeeExpensesResultsList_year'>
                                        <div className='horizontal-line' />
                                      </td>
                                    </tr>,
                                  ]
                                : []),
                              ...yearGroup.employees.map((employee, employeeIndex) => {
                                return (
                                  <tr key={employeeIndex} className='employeeExpensesResultsList_user_name'>
                                    <td className='employeeExpensesResultsList_td'>
                                      <p className='employeeExpensesResultsList_user_name_value'>{`${employee.employee_last_name} ${employee.employee_first_name}`}</p>
                                    </td>
                                    <td>
                                      <div className='employeeExpensesResultsList_year_value'>{yearGroup.year}</div>
                                    </td>
                                    {employee.monthlyExpenses.map((exp, monthIndex) => (
                                      <td key={monthIndex} className='employeeExpensesResultsList_td'>
                                        {exp && exp.projects.length > 0 ? (
                                          <div className='employeeExpensesResultsList_project_div'>
                                            {exp.projects.map((project, projIndex) => {
                                              return (
                                                <div
                                                  key={projIndex}
                                                  className={projIndex % 2 === 0 ? 'project-even' : 'project-odd'}
                                                >
                                                  <div className='employeeExpensesResultsList_txt0-container'>
                                                    <div className='employeeExpensesResultsList_txt0'>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div>{project.project_name}</div>
                                                        <div className='employeeExpensesResultsList_Delete-icon'>
                                                          <RiDeleteBin6Fill
                                                            className='delete-icon'
                                                            style={{
                                                              color: 'red',
                                                              marginLeft: '20px',
                                                              cursor: 'pointer',
                                                            }}
                                                            // {to delete specific project}
                                                            onClick={() => {
                                                              console.log(
                                                                'Deleting project with ID:',
                                                                project.employee_expense_result_id,
                                                              )
                                                              console.log(
                                                                'Deleting project with ID:',
                                                                project.project_id,
                                                              )
                                                              setModalIsOpen(true),
                                                                setEmployeeProjectId({
                                                                  employee_expense_result_id:
                                                                    project.employee_expense_result_id,
                                                                  project_id: project.project_id,
                                                                  mode: 'project',
                                                                })
                                                            }}
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className='employeeExpensesResultsList_txt1_txt2_flex'>
                                                    <div className='employeeExpensesResultsList_txt1'>
                                                      <div className='employeeExpensesResultsList_txt1_label1'>
                                                        {translate('salary', language)}
                                                      </div>
                                                      <div className='employeeExpensesResultsList_txt1_label2'>
                                                        {project.employee_salary}
                                                      </div>
                                                    </div>
                                                    <div className='employeeExpensesResultsList_txt2'>
                                                      <div className='employeeExpensesResultsList_txt2_label1'>
                                                        {translate('ratio', language)}
                                                      </div>
                                                      <div className='employeeExpensesResultsList_txt2_label2'>
                                                        {Math.round((1 / exp.projects.length) * 100) + '%'}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            })}
                                          </div>
                                        ) : (
                                          <div></div>
                                        )}
                                      </td>
                                    ))}
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle', height: '100px' }}>
                                      <RiDeleteBin6Fill
                                        className='delete-icon'
                                        style={{ color: 'red', cursor: 'pointer' }}
                                        onClick={() => {
                                          setModalIsOpen(true)
                                          setEmployeeProjectId({
                                            ...employeeProjectId,
                                            employee_expense_result_id: employee.employee_expense_result_id,
                                            mode: 'employee_expense',
                                          })
                                        }}
                                      />
                                    </td>
                                  </tr>
                                )
                              }),
                            ])}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <table className='table is-bordered is-hoverable'>
                      <thead>
                        <tr className='employeeExpensesResultsList_table_title'>
                          <th className='employeeExpensesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('employee', language)}
                          </th>
                          <th className='employeeExpensesResultsList_table_title_content_vertical has-text-centered'>
                            {translate('year', language)}
                          </th>
                          {months.map((month, index) => (
                            <th
                              key={index}
                              className='employeeExpensesResultsList_table_title_content_vertical has-text-centered'
                            >
                              {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className='employeeExpensesResultsList_table_body'>
                        {employeeExpenses
                          .reduce((acc, expense) => {
                            const existingYearIndex = acc.findIndex((year) => year.year === expense.year)

                            // If the year does not exist, create a new entry
                            if (existingYearIndex === -1) {
                              acc.push({
                                year: expense.year,
                                employees: [],
                              })
                            }

                            const yearGroup = acc[existingYearIndex === -1 ? acc.length - 1 : existingYearIndex]

                            const existingIndex = yearGroup.employees.findIndex(
                              (emp) =>
                                emp.employee_last_name === expense.employee_last_name &&
                                emp.employee_first_name === expense.employee_first_name,
                            )

                            // Parse the month from the expense
                            const monthFromExpense = parseInt(expense.month, 10)

                            // Map the month to your custom months array
                            const monthIndex = months.findIndex((month) => month === monthFromExpense) // Find the index of the month in the custom order

                            if (existingIndex === -1) {
                              // Initialize monthly expenses
                              const monthlyExpenses = Array(12)
                                .fill(null)
                                .map(() => ({
                                  projects: [],
                                  total_salary: 0,
                                }))

                              // Update the monthly expenses for the correct month index
                              if (monthIndex !== -1) {
                                monthlyExpenses[monthIndex].projects.push({
                                  project_name: expense.project_name,
                                  employee_salary: expense.employee_salary,
                                })
                                monthlyExpenses[monthIndex].total_salary += expense.employee_salary
                              }

                              yearGroup.employees.push({
                                employee_last_name: expense.employee_last_name,
                                employee_first_name: expense.employee_first_name,
                                monthlyExpenses,
                              })
                            } else {
                              // Update the existing employee's monthly expenses
                              const existingMonthlyExpenses = yearGroup.employees[existingIndex].monthlyExpenses
                              if (monthIndex !== -1) {
                                existingMonthlyExpenses[monthIndex].projects.push({
                                  project_name: expense.project_name,
                                  employee_salary: expense.employee_salary,
                                })
                                existingMonthlyExpenses[monthIndex].total_salary += expense.employee_salary
                              }
                            }

                            return acc
                          }, [])
                          .flatMap((yearGroup, yearIndex) => [
                            // Only add a separator for years after the first year
                            ...(yearIndex > 0
                              ? [
                                  <tr key={`year-${yearGroup.year}`}>
                                    <td colSpan={12} className='employeeExpensesResultsList_year'>
                                      <div className='horizontal-line' />
                                    </td>
                                  </tr>,
                                ]
                              : []),
                            // Map through employees
                            ...yearGroup.employees.map((employee, employeeIndex) => (
                              <tr key={employeeIndex} className='employeeExpensesResultsList_user_name'>
                                <td className='employeeExpensesResultsList_td'>
                                  <p className='employeeExpensesResultsList_user_name_value'>{`${employee.employee_last_name} ${employee.employee_first_name}`}</p>
                                </td>
                                <td className='employeeExpensesResultsList_td'>
                                  <div className='employeeExpensesResultsList_year_value'>{yearGroup.year}</div>
                                </td>
                                {employee.monthlyExpenses.map((exp, monthIndex) => (
                                  <td key={monthIndex} className='employeeExpensesResultsList_td'>
                                    {exp && exp.projects.length > 0 ? (
                                      <div className='employeeExpensesResultsList_project_div'>
                                        {exp.projects.map((project, projIndex) => (
                                          <div
                                            key={projIndex}
                                            className={projIndex % 2 === 0 ? 'project-even' : 'project-odd'}
                                          >
                                            <div className='employeeExpensesResultsList_txt0-container'>
                                              <div className='employeeExpensesResultsList_txt0'>{project.project_name}</div>
                                            </div>
                                            <div className='employeeExpensesResultsList_txt1_txt2_flex'>
                                              <div className='employeeExpensesResultsList_txt1'>
                                                <div className='employeeExpensesResultsList_txt1_label1'>
                                                  {translate('salary', language)}
                                                </div>
                                                <div className='employeeExpensesResultsList_txt1_label2'>
                                                  {project.employee_salary}
                                                </div>
                                              </div>
                                              <div className='employeeExpensesResultsList_txt2'>
                                                <div className='employeeExpensesResultsList_txt2_label1'>
                                                  {translate('ratio', language)}
                                                </div>
                                                <div className='employeeExpensesResultsList_txt2_label2'>
                                                  {Math.round((1 / exp.projects.length) * 100) + '%'}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div></div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            )),
                          ])}
                      </tbody>
                    </table>
                  )}
                  {/* </div> */}
                  {/* </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={modalIsOpen}
        onConfirm={handleDelete}
        onCancel={closeModal}
        message={translate('deleteMessage', language)}
      />
      <CrudModal isCRUDOpen={isCRUDOpen} onClose={closeModal} message={crudMessage} />
    </div>
  )
}

export default EmployeeExpensesResultsList
