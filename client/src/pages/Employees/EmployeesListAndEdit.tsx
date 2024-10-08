import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import AlertModal from "../../components/AlertModal/AlertModal";
import { RiDeleteBin6Fill } from "react-icons/ri";
import ListButtons from "../../components/ListButtons/ListButtons";
import HeaderButtons from "../../components/HeaderButtons/HeaderButtons";
import { fetchBusinessDivisions } from "../../reducers/businessDivisions/businessDivisionsSlice";
import { fetchMasterCompany } from "../../reducers/company/companySlice";
import { useDispatch } from "react-redux";
import { UnknownAction } from "redux";

const EmployeesListAndEdit: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('employee')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const select = [5, 10, 100]
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
    const [isEditing, setIsEditing] = useState(false)
    const [employeesList, setEmployeesList] = useState([])
    const [originalEmployeesList, setOriginalEmployeesList] = useState(employeesList)
    const [initialLanguage, setInitialLanguage] = useState(language);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [businessSelection, setBusinessSelection] = useState<any>([])
    const [companySelection, setCompanySelection] = useState<any>([])
    const [deleteId, setDeleteEmployeeId] = useState([])
    const dispatch = useDispatch()
    const totalPages = Math.ceil(100 / 10);

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }
      
      const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
        switch (tab) {
          case 'client':
            navigate('/clients-list');
            break;
          case 'employee':
            navigate('/employees-list');
            break;
          case 'businessDivision':
            navigate('/business-divisions-list');
            break;
          case 'users':
            navigate('/users-list');
            break;
          default:
            break;
        }
      }
    
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
    
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    const handleRowsPerPageChange = (numRows: number) => {
        setRowsPerPage(numRows)
        setCurrentPage(0) 
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


    const handleChange = (index, e) => {
      const { name, value } = e.target
      setEmployeesList((prevState) => {
        const updatedEmployeeData = [...prevState]
        updatedEmployeeData[index] = {
          ...updatedEmployeeData[index],
          [name]: value, 
        }
        return updatedEmployeeData
      })
    }
  
   const validateEmployees = (employees) => {
      return employees.every((employee) => {
        return (
          employee.last_name.trim() !== '' &&
          employee.first_name.trim() !== '' &&
          /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(employee.email) && // Email validation
          !isNaN(employee.salary) &&
          employee.salary > 0  // Salary should be a number and greater than 0
        )
      })
    }

    const handleSubmit = async (e) => {
      e.preventDefault()

      // Extract employee email from updatedClients
      const emails = employeesList.map((em) => em.email)
      // Check no inputs are empty on Edit Screen
      if (!validateEmployees(employeesList)) {
        alert(translate('allFieldsRequiredInputValidationMessage', language))
        return
      }

      const getModifiedFields = (original, updated) => {
        const modifiedFields = []

        updated.forEach((updatedEmployee) => {
          const originalEmployee = original.find((emp) => emp.employee_id === updatedEmployee.employee_id)

          if (originalEmployee) {
            const changes = { employee_id: updatedEmployee.employee_id }

            for (const key in updatedEmployee) {
              if (updatedEmployee[key] !== originalEmployee[key]) {
                changes[key] = updatedEmployee[key]
              }
            }

            if (Object.keys(changes).length > 1) {
              modifiedFields.push(changes)
            }
          }
        })

        return modifiedFields
      }
      const modifiedFields = getModifiedFields(originalEmployeesList, employeesList)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/login'
        return
      }
      try {
        const response = await axios.put('http://127.0.0.1:8000/api/employees/update/', modifiedFields, {
          // const response = await axios.put('http://54.178.202.58:8000/api/employees/update/',  modifiedFields ,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        alert('Sucessfully updated')
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

    useEffect(() => {
      const fetchProjects = async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          window.location.href = '/login' // Redirect to login if no token found
          return
        }

        try {
          const response = await axios.get('http://127.0.0.1:8000/api/employees', {
            // const response = await axios.get('http://54.178.202.58:8000/api/employees', {
            headers: {
              Authorization: `Bearer ${token}`, // Add token to request headers
            },
          })
          console.log(response.data)
          setEmployeesList(response.data)
          setOriginalEmployeesList(response.data)
        } catch (error) {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('There was an error fetching the projects!', error)
          }
        }
      }

      fetchProjects()
      fetchData()
    }, [])

      // useEffect(() => {
      //   const startIndex = currentPage * rowsPerPage
      //   setPaginatedData(projects.slice(startIndex, startIndex + rowsPerPage))
      // }, [currentPage, rowsPerPage, projects])

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
        if (!isEditing) {
          const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
          setInitialLanguage(language); 
          setLanguage(newLanguage);
        }
      };

      const openModal = (employee, id) => {
        setSelectedProject(employee)
        setModalIsOpen(true);
        setDeleteEmployeeId(id)
    };

    const closeModal = () => {
        setSelectedProject(null);
        setModalIsOpen(false);
    };

    const handleConfirm = async () => {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/employees/${deleteId}/delete/`, {
          // const response = await axios.get(`http://54.178.202.58:8000/api/employees/list/<int:pk>/delete/`, {
        })
        setEmployeesList((prevList) => prevList.filter((employee) => employee.employee_id !== deleteId))
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('Error deleting project:', error)
        }
      }
      closeModal()
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const month = String(date.getMonth() + 1).padStart(2, '0') // Get month (0-indexed, so +1)
      const day = String(date.getDate()).padStart(2, '0') // Get day
      const year = date.getFullYear() // Get full year
      return `${month}/${day}/${year}`
    }

    const handleNewRegistrationClick = () => {
      navigate('/employees-registration');
    };

  return (
    <div className='EmployeesListAndEdit_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='EmployeesListAndEdit_cont_wrapper'>
        <Sidebar />
        <div className='EmployeesListAndEdit_maincontent_wrapper'>
          <div className='EmployeesListAndEdit_top_content'>
            <div className='EmployeesListAndEdit_top_body_cont'>
              <div className='EmployeesListAndEdit_mode_switch_datalist'>
                <button className='EmployeesListAndEdit_mode_switch' onClick={handleClick}>
                  {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                </button>
              </div>
            </div>
            <div className='EmployeesListAndEdit_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing? 'employeesEdit':'employeesList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'client', tabKey: 'client' },
                  { labelKey: 'employee', tabKey: 'employee' },
                  { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                  { labelKey: 'users', tabKey: 'users' },
                ]}
              />
              <div className='EmployeesListAndEdit_table_wrapper'>
                <div className='EmployeesListAndEdit_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='EmployeesListAndEdit_table_title '>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-left'>ID</th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('lastName', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('firstName', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('email', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('salary', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-left'>
                                  {translate('businessDivision', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-left'>
                                  {translate('companyName', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdBy', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdAt', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('updatedAt', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'></th>
                              </tr>
                            </thead>
                            <tbody className='EmployeesListAndEdit_table_body'>
                              {employeesList.map((employee, employeeIndex) => (
                                <tr
                                  key={employee.employee_id}
                                  className='EmployeesListAndEdit_table_body_content_horizontal'
                                >
                                  <td className='EmployeesListAndEdit_table_body_content_vertical has-text-left'>
                                    {employee.employee_id}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                    <input
                                      className='edit_input'
                                      type='text'
                                      name='last_name'
                                      value={employee.last_name}
                                      onChange={(e) => handleChange(employeeIndex, e)}
                                    />
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                    <input
                                      className='edit_input'
                                      type='text'
                                      name='first_name'
                                      value={employee.first_name}
                                      onChange={(e) => handleChange(employeeIndex, e)}
                                    />
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                    <input
                                      className='edit_input'
                                      type='text'
                                      name='email'
                                      value={employee.email}
                                      onChange={(e) => handleChange(employeeIndex, e)}
                                    />
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                    <input
                                      className='edit_input'
                                      type='number'
                                      name='salary'
                                      value={employee.salary}
                                      onChange={(e) => handleChange(employeeIndex, e)}
                                    />
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_select'>
                                    <select
                                      className='edit_select'
                                      name='business_division'
                                      value={employee.business_division_id}
                                      onChange={(e) => handleChange(employeeIndex, e)}
                                    >
                                      {businessSelection.map((division) => (
                                        <option
                                          key={division.business_division_id}
                                          value={division.business_division_id}
                                          selected={employee.business_division === division.business_division_name}
                                        >
                                          {division.business_division_name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_select'>
                                    <select
                                      className='edit_select'
                                      name='company'
                                      value={employee.company_id}
                                      onChange={(e) => handleChange(employeeIndex, e)}
                                    >
                                      {companySelection.map((company) => (
                                        <option
                                          key={company.company_id}
                                          value={company.company_id}
                                          selected={employee.company === company.company_name}
                                        >
                                          {company.company_name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {employee.auth_user}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {formatDate(employee.created_at)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {formatDate(employee.updated_at)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    <RiDeleteBin6Fill
                                      className='delete-icon'
                                      onClick={() => openModal('project', employee.employee_id)}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='EmployeesListAndEdit_table_title '>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-left'>ID</th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('lastName', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('firstName', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('email', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('salary', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('businessDivision', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('companyName', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdBy', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdAt', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('updatedAt', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='EmployeesListAndEdit_table_body'>
                            {employeesList.map((employee) => (
                              <tr
                                key={employee.employee_id}
                                className='EmployeesListAndEdit_table_body_content_horizontal'
                              >
                                <td className='EmployeesListAndEdit_table_body_content_vertical has-text-left'>
                                  {employee.employee_id}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.last_name}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.first_name}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>{employee.email}</td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>{employee.salary}</td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.business_division}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>{employee.company}</td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.auth_user}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {formatDate(employee.created_at)}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {formatDate(employee.updated_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='EmployeesListAndEdit_is_editing_wrapper'>
                <div className='EmployeesListAndEdit_is_editing_cont'>
                  {isEditing ? (
                    <div className='EmployeesListAndEdit_mode_switch_datalist'>
                      <button className='EmployeesListAndEdit_edit_submit_btn' onClick={handleSubmit}>
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
        onConfirm={handleConfirm}
        onCancel={closeModal}
        message={translate('deleteEmployeeMessage', language)}
      />
    </div>
  )
};

export default EmployeesListAndEdit;
