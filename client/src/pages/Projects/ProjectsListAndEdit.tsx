import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import ListButtons from "../../components/ListButtons/ListButtons";
import HeaderButtons from "../../components/HeaderButtons/HeaderButtons";
import { useDispatch } from 'react-redux'
import { UnknownAction } from 'redux'
import { fetchBusinessDivisions } from "../../reducers/businessDivisions/businessDivisionsSlice";
import { fetchMasterClient } from "../../reducers/client/clientSlice";
import { RiDeleteBin6Fill } from "react-icons/ri";
import AlertModal from "../../components/AlertModal/AlertModal";
import CrudModal from "../../components/CrudModal/CrudModal";
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import '../../assets/scss/Components/SliderToggle.scss';

import { getProject } from "../../api/ProjectsEndpoint/GetProject";
import { updateProject } from "../../api/ProjectsEndpoint/UpdateProject";
import { deleteProject } from "../../api/ProjectsEndpoint/DeleteProject";

const ProjectsListAndEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('project')
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const select = [5, 10, 100]
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isEditing, setIsEditing] = useState(false)
  const [projects, setProjects] = useState([])
  const [originalProjectsList, setOriginalProjectsList] = useState(projects)
  const months = ['4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3']
  const years = []
  const [initialLanguage, setInitialLanguage] = useState(language)
  const dispatch = useDispatch()
  const [clients, setClients] = useState<any>([])
  const [businessSelection, setBusinessSelection] = useState<any>([])
  const totalPages = Math.ceil(100 / 10)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [deleteProjectsId, setDeleteProjectsId] = useState([])
  const [clientMap, setClientMap] = useState({})
  const [businessMap, setBusinessMap] = useState({})
  const [formProjects, setFormProjects] = useState([
    {
      year: '',
      month: '',
      project_name: '',
      project_type: '',
      client: '',
      business_division: '',
      sales_revenue: '',
      cost_of_sale: '',
      dispatch_labor_expense: '',
      employee_expense: '',
      indirect_employee_expense: '',
      expense: '',
      operating_income: '',
      non_operating_income: '',
      non_operating_expense: '',
      ordinary_profit: '',
      ordinary_profit_margin: '',
    },
  ])

  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [crudValidationErrors, setCrudValidationErrors] = useState([]);
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const token = localStorage.getItem('accessToken')

  for (let year = 2020; year <= new Date().getFullYear(); year++) {
    years.push(year)
  }
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'project':
        navigate('/projects-list')
        break
      case 'employeeExpenses':
        navigate('/employee-expenses-list')
        break
      case 'expenses':
        navigate('/expenses-list')
        break
      case 'costOfSales':
        navigate('/cost-of-sales-list')
        break
      default:
        break
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (numRows: number) => {
    setRowsPerPage(numRows)
    setCurrentPage(0)
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

  const handleChange = (index, event) => {
    const { name, value } = event.target
    setProjects((prevState) => {
      const updatedProjectsData = [...prevState]
      updatedProjectsData[index] = {
        ...updatedProjectsData[index],
        [name]: value,
      }
      setFormProjects(updatedProjectsData)

      return updatedProjectsData
    })
  }

  // Checks For EMPTY INPUTS & Number Values Less than 0
  const validateField = (value, fieldName, isNumber, projectId) => {
    console.log('in validate field:', value, fieldName, isNumber)
    if (!isNaN(value) && value < 0) return `${fieldName} cannotBeLessThanZero ${projectId}`
    console.log('is not number:', !isNaN(value), typeof value)
    if (typeof value === 'string' && value.trim() === '') return `${fieldName} inputCannotBeEmpty ${projectId}`
    return '' // No error
  }

  // REQUIRED FIELDS FOR CHECKS
  const validateProjects = (projectsValidate) => {
    const fieldChecks = [
      { field: 'year', fieldName: 'year', isNumber: true },
      { field: 'month', fieldName: 'month', isNumber: true },
      { field: 'project_name', fieldName: 'projectName', isNumber: false },
      // { field: 'project_type', fieldName: 'projectType', isNumber: false },
      { field: 'sales_revenue', fieldName: 'salesRevenue', isNumber: true },
      { field: 'cost_of_sale', fieldName: 'costOfSale', isNumber: true },
      { field: 'dispatch_labor_expense', fieldName: 'dispatchLaborExpense', isNumber: true },
      { field: 'employee_expense', fieldName: 'employeeExpense', isNumber: true },
      { field: 'indirect_employee_expense', fieldName: 'indirectEmployeeExpense', isNumber: true },
      { field: 'expense', fieldName: 'expense', isNumber: true },
      { field: 'operating_income', fieldName: 'operatingIncome', isNumber: true },
      { field: 'non_operating_income', fieldName: 'nonOperatingIncome', isNumber: true },
      { field: 'non_operating_expense', fieldName: 'nonOperatingExpense', isNumber: true },
      { field: 'ordinary_profit', fieldName: 'ordinaryProfit', isNumber: true },
      // { field: 'ordinary_profit_margin', fieldName: 'ordinaryProfitMargin', isNumber: true },
    ]

    let allErrors = []

    for (const prj of projectsValidate) {
      for (const check of fieldChecks) {
        console.log(prj[check.field])

        const errorMessage = validateField(prj[check.field], check.fieldName, check.isNumber, prj.project_id)

        console.log('errorMessage', errorMessage)

        if (errorMessage) {
          allErrors.push(errorMessage)
        }
      }
    }
    console.log('allerrors:', allErrors)
    return allErrors // no errors
  }

const handleSubmit = async () => {
  const validationErrors = validateProjects(formProjects); // Get the array of error messages

  if (validationErrors.length > 0) {
    console.log('validationErrors', validationErrors);

    let finalValidationMessages = [];
    // Build the message for the modal by translating each error
    const translatedErrors = validationErrors.map((validationError) => {
      const [fieldName, validationErrormessage, projectId] = validationError.split(' ');
      const translatedField = translate(fieldName, language);
      const translatedMessage = translate(validationErrormessage, language);
      const translatedProjectId = translate('projectId',language)

      // Return the combined translated error message

      const message = `${translatedProjectId}:${projectId} ${translatedField}${language === 'en' ? '' : 'は'}${translatedMessage}`
      console.log(message)
      finalValidationMessages.push(message)
      return finalValidationMessages
    });

    // Join all translated errors with a newline or another separator
    setCrudMessage(translatedErrors.join()); // '\n' adds a newline between errors
    console.log('crudMessage:', crudMessage)
    console.log('finalValidationMessages:', finalValidationMessages)

    setCrudValidationErrors(finalValidationMessages)
    setIsCRUDOpen(true);

    return;
  }

  // Continue with submission if no validation errors

    const getModifiedFields = (original, updated) => {
      const modifiedFields = []

      updated.forEach((updatedProjects) => {
        const originalProjects = original.find((pr) => pr.project_id === updatedProjects.project_id)

        if (originalProjects) {
          const changes = { project_id: updatedProjects.project_id }

          for (const key in updatedProjects) {
            if (updatedProjects[key] !== originalProjects[key]) {
              changes[key] = updatedProjects[key]
            }
          }

          if (Object.keys(changes).length > 1) {
            modifiedFields.push(changes)
          }
        }
      })

      return modifiedFields
    }
    const modifiedFields = getModifiedFields(originalProjectsList, projects)
    if (!token) {
      window.location.href = '/login'
      return
    }

    updateProject(modifiedFields, token)
      .then(() => {
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response) {
          const { status, data } = error.response
          switch (status) {
            case 409:
              setCrudMessage(translate('projectNameExist', language))
              setIsCRUDOpen(true)
              break
            case 401:
              console.error('Validation error:', data)
              window.location.href = '/login'
              break
            default:
              console.error('There was an error creating the project data!', error)
              setCrudMessage(translate('error', language))
              setIsCRUDOpen(true)
              break
          }
        }
      })
  }

  const handleUpdateConfirm = async () => {
    await handleSubmit() // Call the submit function for update
    setIsUpdateConfirmationOpen(false)
  }

  const fetchClient = async () => {
    try {
      const resMasterClients = await dispatch(fetchMasterClient() as unknown as UnknownAction)
      setClients(resMasterClients.payload)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchDivision = async () => {
    try {
      const resBusinessDivisions = await dispatch(fetchBusinessDivisions() as unknown as UnknownAction)
      setBusinessSelection(resBusinessDivisions.payload)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) {
        window.location.href = '/login' // Redirect to login if no token found
        return
      }

      getProject(token)
        .then((data) => {
          setProjects(data)
          setOriginalProjectsList(data)
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('There was an error fetching the projects!', error)
          }
        })
    }
    fetchDivision()
    fetchClient()
    fetchProjects()
  }, [])

  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(projects.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, projects])

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
      setInitialLanguage(language)
      setLanguage(newLanguage)
    }
  }

  const handleNewRegistrationClick = () => {
    navigate('/projects-registration')
  }

  const openModal = (projects, id) => {
    setSelectedProject(projects)
    setModalIsOpen(true)
    setDeleteProjectsId(id)
  }

  const closeModal = () => {
    setSelectedProject(null)
    setModalIsOpen(false)
    setIsCRUDOpen(false)
  }

  const handleConfirm = async () => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    deleteProject(deleteProjectsId, token)
      .then(() => {
        setProjects((prevList) => prevList.filter((pr) => pr.project_id !== deleteProjectsId))
        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('Error deleting projects', error)
        }
      })
  }

  return (
    <div className='projectsList_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='projectsList_cont_wrapper'>
        <Sidebar />
        <div className={`projectsList_wrapper ${isEditing ? 'editMode' : ''}`}>
          <div className='projectsList_top_content'>
            <div className='projectsList_top_body_cont'></div>
            <div className='projectsList_mode_switch_datalist'>
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
            <div className='projectsList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'projectsEdit' : 'projectsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'project', tabKey: 'project' },
                  { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                  { labelKey: 'expenses', tabKey: 'expenses' },
                  { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                ]}
              />
              <div className={`projectsList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`projectsList_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  <div>
                    <div className='columns is-mobile'>
                      <div className='column'>
                        {isEditing ? (
                          <div className='editScroll'>
                            <table className='table is-bordered is-hoverable'>
                              <thead>
                                <tr className='projectsList_table_title '>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('year', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('month', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('projectName', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('projectType', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('client', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('businessDivision', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('saleRevenue', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('costOfSale', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('dispatchLaborExpense', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('employeeExpense', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('indirectEmployeeExpense', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('expense', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('operatingIncome', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('nonOperatingIncome', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('nonOperatingExpense', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'>
                                    {translate('ordinaryIncome', language)}
                                  </th>
                                  <th className='projectsList_table_title_content_vertical has-text-centered'></th>
                                </tr>
                              </thead>
                              <tbody className='projectsList_table_body'>
                                {projects.map((project, index) => (
                                  <tr key={project.project_id} className='projectsList_table_body_content_horizontal'>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <select
                                        className='projectsRegistration_select-option'
                                        name='year'
                                        value={project.year}
                                        onChange={(e) => handleChange(index, e)}
                                      >
                                        {years.map((year, idx) => (
                                          <option key={idx} value={year} selected={year.year === project.year}>
                                            {year}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <select
                                        className='select-option'
                                        name='month'
                                        value={project.month}
                                        onChange={(e) => handleChange(index, e)}
                                      >
                                        <option value=''></option>
                                        {months.map((month, idx) => (
                                          <option key={idx} value={month} selected={month === project.month}>
                                            {month}月
                                          </option>
                                        ))}
                                      </select>
                                      {}
                                    </td>

                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='project_name'
                                        value={project.project_name}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='project_type'
                                        value={project.project_type}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <select
                                        className='projectsRegistration_select-option'
                                        name='client'
                                        value={project.client}
                                        onChange={(e) => handleChange(index, e)}
                                      >
                                        {clients.map((client) => (
                                          <option
                                            key={client.client_id}
                                            value={client.client_id}
                                            selected={client.client_id === project.client_id}
                                          >
                                            {client.client_name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <select
                                        className='projectsRegistration_select-option'
                                        name='business_division'
                                        value={project.business_division}
                                        onChange={(e) => handleChange(index, e)}
                                      >
                                        {businessSelection.map((division) => (
                                          <option
                                            key={division.business_division_id}
                                            value={division.business_division_id}
                                            selected={division.business_division_id === project.business_division_id}
                                          >
                                            {division.business_division_name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='sales_revenue'
                                        value={project.sales_revenue}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='cost_of_sale'
                                        value={project.cost_of_sale}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='dispatch_labor_expense'
                                        value={project.dispatch_labor_expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='employee_expense'
                                        value={project.employee_expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='indirect_employee_expense'
                                        value={project.indirect_employee_expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='expense'
                                        value={project.expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='operating_income'
                                        value={project.operating_income}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='non_operating_income'
                                        value={project.non_operating_income}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='non_operating_expense'
                                        value={project.non_operating_expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='ordinary_profit'
                                        value={project.ordinary_profit}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                      <RiDeleteBin6Fill
                                        className='delete-icon'
                                        onClick={() => openModal('project', project.project_id)}
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
                              <tr className='projectsList_table_title '>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('year', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('month', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('projectName', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('projectType', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('client', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('businessDivision', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('saleRevenue', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('costOfSale', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('dispatchLaborExpense', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('employeeExpense', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('indirectEmployeeExpense', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('expense', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('operatingIncome', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('nonOperatingIncome', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('nonOperatingExpense', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('ordinaryIncome', language)}
                                </th>
                              </tr>
                            </thead>
                            <tbody className='projectsList_table_body'>
                              {projects.map((project) => (
                                <tr key={project.project_id} className='projectsList_table_body_content_horizontal'>
                                  <td className='projectsList_table_body_content_vertical'>{project.year}</td>
                                  <td className='projectsList_table_body_content_vertical'>{project.month}</td>
                                  <td className='projectsList_table_body_content_vertical'>{project.project_name}</td>
                                  <td className='projectsList_table_body_content_vertical'>{project.project_type}</td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {clients.map(
                                      (client) =>
                                        client.client_id === project.client && (
                                          <div key={client.client_id}>{client.client_name}</div>
                                        ),
                                    )}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {businessSelection.map(
                                      (business) =>
                                        business.business_division_id === project.business_division && (
                                          <div key={business.business_division_id}>
                                            {business.business_division_name}
                                          </div>
                                        ),
                                    )}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>{project.sales_revenue}</td>
                                  <td className='projectsList_table_body_content_vertical'>{project.cost_of_sale}</td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.dispatch_labor_expense}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.employee_expense}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.indirect_employee_expense}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>{project.expense}</td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.operating_income}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.non_operating_income}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.non_operating_expense}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.ordinary_profit}
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
              </div>
              <div className='projectsList_is_editing_wrapper'>
                <div className='projectsList_is_editing_cont'>
                  {isEditing ? (
                    <div className='projectsList_edit_submit_btn_cont'>
                      <button
                        className='projectsList_edit_submit_btn'
                        onClick={() => {
                          setIsUpdateConfirmationOpen(true)
                        }}
                      >
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
        message={translate('deleteProjectMessage', language)}
      />
      <CrudModal
        isCRUDOpen={isCRUDOpen}
        onClose={closeModal}
        message={crudMessage}
        validationMessages={crudValidationErrors}
      />
      <AlertModal
        isOpen={isUpdateConfirmationOpen}
        onConfirm={handleUpdateConfirm}
        onCancel={() => setIsUpdateConfirmationOpen(false)}
        message={translate('updateMessage', language)}
      />
    </div>
  )
};

export default ProjectsListAndEdit;
