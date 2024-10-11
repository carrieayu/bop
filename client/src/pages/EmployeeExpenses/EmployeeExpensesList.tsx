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

const months: number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]; // Store as numbers


const EmployeeExpensesList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('employeeExpenses')
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
    const [employeeExpenses, setEmployeeExpenses] = useState([]);
    const [isEditing, setIsEditing] = useState(false)
    const [initialLanguage, setInitialLanguage] = useState(language);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const token = localStorage.getItem('accessToken')
    const [selectedEmployeeExpenses, setSelectedEmployeeExpenses] = useState<any>(null);
    const [deleteEmployeeExpensesId, setDeleteEmployeeExpensesId] = useState([])
    const [employeeProjectId, setEmployeeProjectId ] = useState<{employee_expense_id:string,project_id:string,mode:"employee_expense" | "project"}>({} as {employee_expense_id:string,project_id:string,mode:"employee_expense"})


    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }

      const handleClick = () => {
        setIsEditing((prevState) => {
          const newEditingState = !prevState;
          if (newEditingState) {
            setLanguage(initialLanguage);
          }
      
          return newEditingState;
        });
      }

      const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
        switch (tab) {
          case 'project':
            navigate('/projects-list');
            break;
          case 'employeeExpenses':
            navigate('/employee-expenses-list');
            break;
          case 'expenses':
            navigate('/expenses-list');
            break;
          case 'costOfSales':
            navigate('/cost-of-sales-list');
            break;
          default:
            break;
        }
      }
    
    useEffect(() => {
      const path = location.pathname;
      if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
        setActiveTab(path);
      }
    }, [location.pathname]);

    useEffect(() => {
      setIsTranslateSwitchActive(language === 'en');
    }, [language]);
  
    const handleTranslationSwitchToggle = () => {
      const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
      setLanguage(newLanguage);
    };

    const monthNames: { [key: number]: { en: string; jp: string } } = {
      1: { en: "January", jp: "1月" },
      2: { en: "February", jp: "2月" },
      3: { en: "March", jp: "3月" },
      4: { en: "April", jp: "4月" },
      5: { en: "May", jp: "5月" },
      6: { en: "June", jp: "6月" },
      7: { en: "July", jp: "7月" },
      8: { en: "August", jp: "8月" },
      9: { en: "September", jp: "9月" },
      10: { en: "October", jp: "10月" },
      11: { en: "November", jp: "11月" },
      12: { en: "December", jp: "12月" },
    };

    const handleNewRegistrationClick = () => {
      navigate('/employee-expenses-registration');
    };

    // Fetch employee expenses data
    useEffect(() => {
      const fetchEmployeeExpenses = async () => {
          const token = localStorage.getItem('accessToken');
          if (!token) {
              window.location.href = '/login'; // Redirect to login if no token found
              return;
          }

          try {
              const response = await axios.get('http://127.0.0.1:8000/api/employee-expenses/', {
                  headers: {
                      'Authorization': `Bearer ${token}` // Add token to request headers
                  }
              });
              setEmployeeExpenses(response.data); // Assuming response.data is an array of expenses
              console.log("Employee expenses: ", response.data);
          } catch (error) {
              if (error.response && error.response.status === 401) {
                  window.location.href = '/login'; // Redirect to login if unauthorized
              } else {
                  console.error('Error fetching employee expenses:', error);
              }
          }
      };
      
      fetchEmployeeExpenses();
  }, []);

  const openModal = (users, id) => {
    setSelectedEmployeeExpenses(users)
    setModalIsOpen(true);
    setDeleteEmployeeExpensesId(id)
  };


  const closeModal = () => {
      setSelectedEmployeeExpenses(null);
      setModalIsOpen(false);
  };

  const handleDelete = () => {
    if(employeeProjectId.mode === "employee_expense"){
      handleDeleteExpense()
    }
    else{
      handleRemoveProjectAssociation()
    }
  }

  const handleDeleteExpense = async () => {
    console.log('Confirmed action for employee expense:', employeeProjectId)
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/employee-expenses/${employeeProjectId.employee_expense_id}/delete/`, {
        headers: {
          'Authorization': `Bearer ${token}`  // Add token to request headers
        }
      });

      setIsEditing(false);
      alert('Successfully deleted');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login' // Redirect to login if unauthorized
      } else {
        console.error('Error deleting employee expense:', error)
      }
    }
    closeModal();
  };

  const handleRemoveProjectAssociation = async () => {
    console.log("data", employeeProjectId)

    console.log('Confirmed action for employee expense:', employeeProjectId)
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/employee-expenses/${employeeProjectId.employee_expense_id}/delete/?project_id=${employeeProjectId.project_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`  // Add token to request headers
        }
      });
      setIsEditing(false);
      alert('Successfully deleted');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login' // Redirect to login if unauthorized
      } else {
        console.error("Error removing project association:", error)
      }
    }
    closeModal();
  };
  

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
          <div className='employeeExpensesList_wrapper_div'>
            <div className='employeeExpensesList_top_content'>
              <div className='employeeExpensesList_top_body_cont'>
                <div className='employeeExpensesList_mode_switch_datalist'>
                    <button className='employeeExpensesList_mode_switch' onClick={handleClick}>
                      {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                    </button>
                </div>
              </div>
              <div className='employeeExpensesList_mid_body_cont'>
                <ListButtons
                  activeTabOther={activeTabOther}
                  message={translate('employeeExpensesList', language)}
                  handleTabsClick={handleTabsClick}
                  handleNewRegistrationClick={handleNewRegistrationClick}
                  buttonConfig={[
                    { labelKey: 'project', tabKey: 'project' },
                    { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                    { labelKey: 'expenses', tabKey: 'expenses' },
                    { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                  ]}
                />
                <div className='employeeExpensesList_table_wrapper'>
                  <div className='employeeExpensesList_table_cont'>
                    <div className='columns is-mobile'>
                      <div className='column'>
                      {isEditing ? (
                        <div>
                        <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='employeeExpensesList_table_title'>
                              <th className='employeeExpensesList_table_title_content_vertical has-text-centered'>{translate('employee', language)}</th>
                              <th className='employeeExpensesList_table_title_content_vertical has-text-centered'>{translate('year', language)}</th>
                              {months.map((month, index) => (
                                <th key={index} className='employeeExpensesList_table_title_content_vertical has-text-centered'>
                                  {language === "en" ? monthNames[month].en : monthNames[month].jp}
                                </th>
                              ))}
                              <th className='employeeExpensesList_table_title_content_vertical has-text-centered'></th>
                            </tr>
                          </thead>
                          <tbody className='employeeExpensesList_table_body'>
                              {employeeExpenses.reduce((acc, expense) => {
                                // console.log("acc", acc)
                                const existingYearIndex = acc.findIndex(year => year.year === expense.year);
                                
                                // If the year does not exist, create a new entry
                                if (existingYearIndex === -1) {
                                  acc.push({
                                    year: expense.year,
                                    employees: []
                                  });
                                }
                                
                                const yearGroup = acc[existingYearIndex === -1 ? acc.length - 1 : existingYearIndex];

                                const existingIndex = yearGroup.employees.findIndex(emp => 
                                  emp.employee_last_name === expense.employee_last_name && 
                                  emp.employee_first_name === expense.employee_first_name
                                );

                                // Parse the month from the expense
                                const monthFromExpense = parseInt(expense.month, 10); 

                                // Map the month to your custom months array
                                const monthIndex = months.findIndex(month => month === monthFromExpense); // Find the index of the month in the custom order

                                if (existingIndex === -1) {
                                  // Initialize monthly expenses
                                  const monthlyExpenses = Array(12).fill(null).map(() => ({
                                    projects: [],
                                    total_salary: 0
                                  }));

                                  // Update the monthly expenses for the correct month index
                                  if (monthIndex !== -1) {
                                    monthlyExpenses[monthIndex].projects.push({
                                      project_name: expense.project_name,
                                      employee_salary: expense.employee_salary,
                                      project_id: expense.project_id,
                                    });
                                    monthlyExpenses[monthIndex].total_salary += expense.employee_salary;
                                  }
                                  // console.log("expense", expense)  
                                  yearGroup.employees.push({
                                    employee_expense_id: expense.employee_expense_id,
                                    project_id: expense.project_id,
                                    employee_last_name: expense.employee_last_name,
                                    employee_first_name: expense.employee_first_name,
                                    monthlyExpenses,
                                  });
                                } else {
                                  // Update the existing employee's monthly expenses
                                  const existingMonthlyExpenses = yearGroup.employees[existingIndex].monthlyExpenses;
                                  if (monthIndex !== -1) {
                                    existingMonthlyExpenses[monthIndex].projects.push({
                                      project_name: expense.project_name,
                                      employee_salary: expense.employee_salary,
                                      project_id: expense.project_id,
                                    });
                                    existingMonthlyExpenses[monthIndex].total_salary += expense.employee_salary;
                                  }
                                }
                                
                                return acc;
                              }, []).flatMap((yearGroup, yearIndex) => [
                                // Only add a separator for years after the first year
                                ...(yearIndex > 0 ? [
                                  <tr key={`year-${yearGroup.year}`}>
                                    <td colSpan={12} className='employeeExpensesList_year'>
                                        <div className="horizontal-line" />
                                    </td>
                                  </tr>
                                ] : []),
                                // Map through employees
                                ...yearGroup.employees.map((employee, employeeIndex) => {
                                  console.log("employee", employee)
                                  return (
                                    <tr key={employeeIndex} className='employeeExpensesList_user_name'>
                                      <td className='employeeExpensesList_td'>
                                        <p>{`${employee.employee_last_name} ${employee.employee_first_name}`}</p>
                                      </td>
                                      <td>{yearGroup.year}</td>
                                      {employee.monthlyExpenses.map((exp, monthIndex) => (
                                        <td key={monthIndex} className='employeeExpensesList_td'>
                                          {exp && exp.projects.length > 0 ? (
                                            <div>
                                              {exp.projects.map((project, projIndex) => {
                                                console.log("Project object:", project);
                                                return (
                                                  <div key={projIndex}>
                                                    <div className='employeeExpensesList_txt0'>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div>
                                                          {project.project_name}
                                                        </div>
                                                        <div>
                                                          <RiDeleteBin6Fill
                                                            className='delete-icon'
                                                            style={{ color: 'red', marginLeft: '20px', cursor: 'pointer' }} 
                                                            // {to delete specific project}
                                                            onClick={() => {
                                                              console.log("Deleting project with ID:", project.project_id); // Log the project ID
                                                              setModalIsOpen(true), 
                                                              setEmployeeProjectId({
                                                                employee_expense_id: employee.employee_expense_id,
                                                                project_id: project.project_id, // Check this
                                                                mode: "project"
                                                              });
                                                            }}
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className='employeeExpensesList_txt1_txt2_flex'>
                                                      <div className='employeeExpensesList_txt1'>Salary: {project.employee_salary}</div>
                                                      <div className='employeeExpensesList_txt2'>
                                                        {Math.round((1 / exp.projects.length) * 100) + '%'} 
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
                                        onClick={() => (
                                          setModalIsOpen(true), 
                                          setEmployeeProjectId({...employeeProjectId,employee_expense_id:employee.employee_expense_id,mode:"employee_expense"})
                                        )}
                                      />
                                      </td>
                                    </tr>
                                  )
                                })
                              ])}
                            </tbody>
                        </table>
                        </div>
                        ):(
                          <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='employeeExpensesList_table_title'>
                              <th className='employeeExpensesList_table_title_content_vertical has-text-centered'>{translate('employee', language)}</th>
                              <th className='employeeExpensesList_table_title_content_vertical has-text-centered'>{translate('year', language)}</th>
                              {months.map((month, index) => (
                                <th key={index} className='employeeExpensesList_table_title_content_vertical has-text-centered'>
                                  {language === "en" ? monthNames[month].en : monthNames[month].jp}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className='employeeExpensesList_table_body'>
                              {employeeExpenses.reduce((acc, expense) => {
                                const existingYearIndex = acc.findIndex(year => year.year === expense.year);
                                
                                // If the year does not exist, create a new entry
                                if (existingYearIndex === -1) {
                                  acc.push({
                                    year: expense.year,
                                    employees: []
                                  });
                                }
                                
                                const yearGroup = acc[existingYearIndex === -1 ? acc.length - 1 : existingYearIndex];

                                const existingIndex = yearGroup.employees.findIndex(emp => 
                                  emp.employee_last_name === expense.employee_last_name && 
                                  emp.employee_first_name === expense.employee_first_name
                                );

                                // Parse the month from the expense
                                const monthFromExpense = parseInt(expense.month, 10); 

                                // Map the month to your custom months array
                                const monthIndex = months.findIndex(month => month === monthFromExpense); // Find the index of the month in the custom order

                                if (existingIndex === -1) {
                                  // Initialize monthly expenses
                                  const monthlyExpenses = Array(12).fill(null).map(() => ({
                                    projects: [],
                                    total_salary: 0
                                  }));

                                  // Update the monthly expenses for the correct month index
                                  if (monthIndex !== -1) {
                                    monthlyExpenses[monthIndex].projects.push({
                                      project_name: expense.project_name,
                                      employee_salary: expense.employee_salary,
                                    });
                                    monthlyExpenses[monthIndex].total_salary += expense.employee_salary;
                                  }

                                  yearGroup.employees.push({
                                    employee_last_name: expense.employee_last_name,
                                    employee_first_name: expense.employee_first_name,
                                    monthlyExpenses,
                                  });
                                } else {
                                  // Update the existing employee's monthly expenses
                                  const existingMonthlyExpenses = yearGroup.employees[existingIndex].monthlyExpenses;
                                  if (monthIndex !== -1) {
                                    existingMonthlyExpenses[monthIndex].projects.push({
                                      project_name: expense.project_name,
                                      employee_salary: expense.employee_salary,
                                    });
                                    existingMonthlyExpenses[monthIndex].total_salary += expense.employee_salary;
                                  }
                                }

                                return acc;
                              }, []).flatMap((yearGroup, yearIndex) => [
                                // Only add a separator for years after the first year
                                ...(yearIndex > 0 ? [
                                  <tr key={`year-${yearGroup.year}`}>
                                    <td colSpan={12} className='employeeExpensesList_year'>
                                      <div className="horizontal-line" />
                                    </td>
                                  </tr>
                                ] : []),
                                // Map through employees
                                ...yearGroup.employees.map((employee, employeeIndex) => (
                                  <tr key={employeeIndex} className='employeeExpensesList_user_name'>
                                    <td className='employeeExpensesList_td'>
                                      <p>{`${employee.employee_last_name} ${employee.employee_first_name}`}</p>
                                    </td>
                                    <td>{yearGroup.year}</td>
                                    {employee.monthlyExpenses.map((exp, monthIndex) => (
                                      <td key={monthIndex} className='employeeExpensesList_td'>
                                        {exp && exp.projects.length > 0 ? (
                                          <div>
                                            {exp.projects.map((project, projIndex) => (
                                              <div key={projIndex}>
                                                <div className='employeeExpensesList_txt0'>{project.project_name}</div>
                                                <div className='employeeExpensesList_txt1_txt2_flex'>
                                                  <div className='employeeExpensesList_txt1'>Salary: {project.employee_salary}</div>
                                                  <div className='employeeExpensesList_txt2'>
                                                    {Math.round((1 / exp.projects.length) * 100) + '%'} 
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
                                ))
                              ])}
                            </tbody>
                        </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='employeeExpensesList_is_editing_wrapper'>
                    <div className='employeeExpensesList_is_editing_cont'>
                      {isEditing ? (
                        <div className='employeeExpensesList_mode_switch_datalist'>
                          <button className='employeeExpensesList_edit_submit_btn'>
                            更新
                          </button>
                        </div>
                      ) : (
                        <div></div>
                      )}
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
      </div>
    )
}

export default EmployeeExpensesList

