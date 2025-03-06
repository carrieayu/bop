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
import '../../assets/scss/Components/SliderToggle.scss'

import { getEmployeeExpense } from '../../api/EmployeeExpenseEndpoint/GetEmployeeExpense'
import { deleteEmployeeExpenseX } from '../../api/EmployeeExpenseEndpoint/DeleteEmployeeExpenseX'
import { deleteProjectAssociation } from '../../api/EmployeeExpenseEndpoint/DeleteProjectAssociation'
import { formatNumberWithCommas, handlePLListTabsClick, setupIdleTimer } from '../../utils/helperFunctionsUtil'
import { monthNames, months, token } from '../../constants'
import { useAlertPopup, checkAccessToken, handleTimeoutConfirm } from "../../routes/ProtectedRoutes";

const EmployeeExpensesList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [employeeExpenses, setEmployeeExpenses] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedEmployeeExpenses, setSelectedEmployeeExpenses] = useState<any>(null)
  const [deleteEmployeeExpensesId, setDeleteEmployeeExpensesId] = useState([])
  const [deletedId, setDeletedId] = useState<any>(null)
  const onTabClick = (tab) => handlePLListTabsClick(tab, navigate, setActiveTab)
  const [employeeProjectId, setEmployeeProjectId] = useState<{
    employee_expense_id: string
    project_id: string
    mode: 'employee_expense' | 'project'
  }>({} as { employee_expense_id: string; project_id: string; mode: 'employee_expense' })
  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const { showAlertPopup, AlertPopupComponent } = useAlertPopup()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleClick = () => {
    setIsEditing((prevState) => !prevState)
  }
  useEffect(() => {
    if (isEditing) {
      setLanguage('jp')
    }
  }, [isEditing])

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
    if (!isEditing) {
      const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
      setLanguage(newLanguage)
    }
  }

  const handleNewRegistrationClick = () => {
    navigate('/employee-expenses-registration')
  }

  // Fetch employee expenses data
  useEffect(() => {
    const fetchEmployeeExpenses = async () => {
      if (!token) {
        console.log("token 1");
        //window.location.href = '/login' // Redirect to login if no token found
        return
      }
      getEmployeeExpense(token)
        .then((data) => {
          setEmployeeExpenses(data)
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            console.log("token 2");
            //window.location.href = '/login' // Redirect to login if unauthorized
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
    deletedId.monthlyExpenses.forEach((monthExpense, index) => {
      if (monthExpense.projects && monthExpense.projects.length > 0) {
        const employeeExpenseResultId = monthExpense.projects[0].employee_expense_id
        deleteEmployeeExpenseX(employeeExpenseResultId, token)
          .then(() => {
            setEmployeeExpenses((prevExpenses) =>
              prevExpenses.filter((expense) => expense.employee_expense_id !== employeeExpenseResultId),
            )

            setCrudMessage(translate('successfullyDeleted', language))
            setIsCRUDOpen(true)
            setIsEditing(false)
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              console.log("token 3");
              //window.location.href = '/login' // Redirect to login if unauthorized
            } else {
              console.error('Error deleting employee expense:', error)
            }
          })
      }
    })
  }

  const handleRemoveProjectAssociation = async () => {
    deleteProjectAssociation(employeeProjectId.employee_expense_id, employeeProjectId.project_id, token)
      .then(() => {
        setEmployeeExpenses((prevExpenses) =>
          prevExpenses.filter((expense) => expense.employee_expense_id !== employeeProjectId.employee_expense_id),
        )

        setCrudMessage(translate('employeeExpensesRemoveProject', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          console.log("token 4");
          //window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('Error removing project association:', error)
        }
      })
  }

  // const handleConfirm = async () => {
  //   window.location.href = '/login'
  //   return
  // }
  useEffect(() => {
     checkAccessToken(setIsAuthorized).then(result => {
      if (!result) { showAlertPopup(handleTimeoutConfirm); }
    });
  }, [token])

  return (
    <div className='employeeExpensesList_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='employeeExpensesList_cont_wrapper'>
        <Sidebar />
        <div className={`employeeExpensesList_wrapper_div ${isEditing ? 'editMode' : ''}`}>
          <div className='employeeExpensesList_top_content'>
            <div className='employeeExpensesList_top_body_cont'>
              <div className='employeeExpensesList_mode_switch_datalist'>
                <div className='mode-switch-container'>
                  <p className='slider-mode-switch'>
                    {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                  </p>
                  <label className='slider-switch'>
                    <input type='checkbox' checked={isEditing} onChange={handleClick} />
                    <span className='slider'></span>
                  </label>
                </div>
              </div>
            </div>
            <div className='employeeExpensesList_mid_body_cont'>
              <ListButtons
                activeTabOther={'employeeExpenses'}
                message={translate(isEditing ? 'employeeExpensesEdit' : 'employeeExpensesList', language)}
                handleTabsClick={onTabClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'project', tabKey: 'project' },
                  { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                  { labelKey: 'expenses', tabKey: 'expenses' },
                  { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                ]}
              />
              <div className={`employeeExpensesList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`employeeExpensesList_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  {/* <div className='columns is-mobile'> */}
                  {/* <div className='column'> */}
                  {isEditing ? (
                    <div className='editScroll'>
                      <table className='table is-bordered is-hoverable'>
                        <thead>
                          <tr className='employeeExpensesList_table_title'>
                            <th className='employeeExpensesList_table_title_content_vertical has-text-centered'>
                              {translate('employee', language)}
                            </th>
                            <th className='employeeExpensesList_table_title_content_vertical has-text-centered'>
                              {translate('year', language)}
                            </th>
                            {months.map((month, index) => (
                              <th
                                key={index}
                                className='employeeExpensesList_table_title_content_vertical has-text-centered'
                              >
                                {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                              </th>
                            ))}
                            <th className='employeeExpensesList_table_title_content_vertical has-text-centered'></th>
                          </tr>
                        </thead>
                        <tbody className='employeeExpensesList_table_body'>
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
                                    executive_remuneration: expense.executive_remuneration,
                                    project_id: expense.project_id,
                                    employee_expense_id: expense.employee_expense_id,
                                  })
                                  monthlyExpenses[monthIndex].total_salary += expense.employee_salary
                                }
                                yearGroup.employees.push({
                                  employee_expense_id: expense.employee_expense_id,
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
                                    executive_remuneration: expense.executive_remuneration,
                                    project_id: expense.project_id,
                                    employee_expense_id: expense.employee_expense_id,
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
                                      <td colSpan={12} className='employeeExpensesList_year'>
                                        <div className='horizontal-line' />
                                      </td>
                                    </tr>,
                                  ]
                                : []),
                              // Map through employees
                              ...yearGroup.employees.map((employee, employeeIndex) => {
                                return (
                                  <tr key={employeeIndex} className='employeeExpensesList_user_name'>
                                    <td className='employeeExpensesList_td'>
                                      <p className='employeeExpensesList_user_name_value'>{`${employee.employee_last_name} ${employee.employee_first_name}`}</p>
                                    </td>
                                    <td>
                                      <div className='employeeExpensesList_year_value'>{yearGroup.year}</div>
                                    </td>
                                    {employee.monthlyExpenses.map((exp, monthIndex) => (
                                      <td key={monthIndex} className='employeeExpensesList_td'>
                                        {exp && exp.projects.length > 0 ? (
                                          <div className='employeeExpensesList_project_div'>
                                            {exp.projects.map((project, projIndex) => {
                                              return (
                                                <div
                                                  key={projIndex}
                                                  className={projIndex % 2 === 0 ? 'project-even' : 'project-odd'}
                                                >
                                                  <div className='employeeExpensesList_txt0-container'>
                                                    <div className='employeeExpensesList_txt0'>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div>{project.project_name}</div>
                                                        <div className='employeeExpensesList_Delete-icon'>
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
                                                                project.employee_expense_id,
                                                              )
                                                              console.log(
                                                                'Deleting project with ID:',
                                                                project.project_id,
                                                              )
                                                              setModalIsOpen(true),
                                                                setEmployeeProjectId({
                                                                  employee_expense_id: project.employee_expense_id,
                                                                  project_id: project.project_id,
                                                                  mode: 'project',
                                                                })
                                                            }}
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className='employeeExpensesList_txt1_txt2_flex'>
                                                    <div className='employeeExpensesList_txt1'>
                                                      <div className='employeeExpensesList_txt1_label1'>
                                                        {project.employee_salary
                                                          ? translate('salary', language)
                                                          : translate('executiveRemuneration', language)}
                                                      </div>
                                                      <div className='employeeExpensesList_txt1_label2'>
                                                        {project.employee_salary
                                                          ? formatNumberWithCommas(project.employee_salary)
                                                          : formatNumberWithCommas(project.executive_remuneration)}
                                                      </div>
                                                    </div>
                                                    <div className='employeeExpensesList_txt2'>
                                                      <div className='employeeExpensesList_txt2_label1'>
                                                        {translate('ratio', language)}
                                                      </div>
                                                      <div className='employeeExpensesList_txt2_label2'>
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
                                        // {to delete entire row}
                                        onClick={() => {
                                          console.log(
                                            'Deleting employee expense with ID:',
                                            employee.employee_expense_id,
                                          )
                                          setModalIsOpen(true)
                                          setDeletedId(employee)
                                          setEmployeeProjectId({
                                            ...employeeProjectId,
                                            employee_expense_id: employee.employee_expense_id,
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
                        <tr className='employeeExpensesList_table_title'>
                          <th className='employeeExpensesList_table_title_content_vertical has-text-centered'>
                            {translate('employee', language)}
                          </th>
                          <th className='employeeExpensesList_table_title_content_vertical has-text-centered'>
                            {translate('year', language)}
                          </th>
                          {months.map((month, index) => (
                            <th
                              key={index}
                              className='employeeExpensesList_table_title_content_vertical has-text-centered'
                            >
                              {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className='employeeExpensesList_table_body'>
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
                                  client_name: expense.client_name,
                                  business_division_name: expense.business_division_name,
                                  employee_salary: expense.employee_salary,
                                  executive_remuneration: expense.executive_remuneration,
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
                                  client_name: expense.client_name,
                                  business_division_name: expense.business_division_name,
                                  employee_salary: expense.employee_salary,
                                  executive_remuneration: expense.executive_remuneration,
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
                                    <td colSpan={12} className='employeeExpensesList_year'>
                                      <div className='horizontal-line' />
                                    </td>
                                  </tr>,
                                ]
                              : []),
                            // Map through employees
                            ...yearGroup.employees.map((employee, employeeIndex) => (
                              <tr key={employeeIndex} className='employeeExpensesList_user_name'>
                                <td className='employeeExpensesList_td'>
                                  <p className='employeeExpensesList_user_name_value'>{`${employee.employee_last_name} ${employee.employee_first_name}`}</p>
                                </td>
                                <td className='employeeExpensesList_td'>
                                  <div className='employeeExpensesList_year_value'>{yearGroup.year}</div>
                                </td>
                                {employee.monthlyExpenses.map((exp, monthIndex) => (
                                  <td key={monthIndex} className='employeeExpensesList_td'>
                                    {exp && exp.projects.length > 0 ? (
                                      <div className='employeeExpensesList_project_div'>
                                        {exp.projects.map((project, projIndex) => (
                                          <div
                                            key={projIndex}
                                            className={`${projIndex % 2 === 0 ? 'project-even' : 'project-odd'} employeeExpenseModal`}
                                          >
                                            <div className='employeeExpenseModal-tooltip'>
                                              <div>
                                                <div className='employeeExpenseHeader'>Project Name</div>
                                                <div>
                                                  <span className='employeeExpenseSpan'>{project.project_name}</span>
                                                </div>
                                              </div>
                                              <div>
                                                <div className='employeeExpenseHeader'>Client Name</div>
                                                <span className='employeeExpenseSpan'>{project.client_name}</span>
                                              </div>
                                              <div>
                                                <div className='employeeExpenseHeader'>Business Division</div>
                                                <span className='employeeExpenseSpan'>
                                                  {project.business_division_name}
                                                </span>
                                              </div>
                                            </div>
                                            <div className='employeeExpensesList_txt0-container'>
                                              <div className='employeeExpensesList_txt0'>{project.project_name}</div>
                                            </div>
                                            <div className='employeeExpensesList_txt1_txt2_flex'>
                                              <div className='employeeExpensesList_txt1'>
                                                <div className='employeeExpensesList_txt1_label1'>
                                                  {project.employee_salary
                                                    ? translate('salary', language)
                                                    : translate('executiveRemuneration', language)}
                                                </div>
                                                <div className='employeeExpensesList_txt1_label2'>
                                                  {project.employee_salary
                                                    ? formatNumberWithCommas(project.employee_salary)
                                                    : formatNumberWithCommas(project.executive_remuneration)}
                                                </div>
                                              </div>
                                              <div className='employeeExpensesList_txt2'>
                                                <div className='employeeExpensesList_txt2_label1'>
                                                  {translate('ratio', language)}
                                                </div>
                                                <div className='employeeExpensesList_txt2_label2'>
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
      <AlertPopupComponent />
    </div>
  )
}

export default EmployeeExpensesList
