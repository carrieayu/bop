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
import {validateRecords, translateAndFormatErrors, getFieldChecks, checkForDuplicates } from '../../utils/validationUtil'
import { getProject } from "../../api/ProjectsEndpoint/GetProject";
import { updateProject } from "../../api/ProjectsEndpoint/UpdateProject";
import { deleteProject } from "../../api/ProjectsEndpoint/DeleteProject";
import { handleDisableKeysOnNumberInputs, formatNumberWithCommas, removeCommas } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs

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
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const token = localStorage.getItem('accessToken')
  const [deleteComplete, setDeleteComplete] = useState(false)

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

      if (!newEditingState) {
        // Reset to original values when switching to list mode
        setProjects(originalProjectsList)
      }

      return newEditingState
    })
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target

    // Remove commas to get the raw number
    // EG. 999,999 → 999999 in the DB
    const rawValue = removeCommas(value)

    setProjects((prevState) => {
      const updatedProjectsData = [...prevState]
      updatedProjectsData[index] = {
        ...updatedProjectsData[index],
        [name]: rawValue,
      }
      setFormProjects(updatedProjectsData)

      return updatedProjectsData
    })
  }

  const handleSubmit = async () => {
    setFormProjects(projects)

    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'projects'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateProjects = (records) => validateRecords(records, fieldChecks, 'project')

    // Step 2: Validate client-side input
    const validationErrors = validateProjects(projects)

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month', 'project_name', 'business_division', 'client']
    const duplicateErrors = checkForDuplicates(projects, uniqueFields, 'project', language)

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
      setCrudMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsCRUDOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }
    // Continue with submission if no errors

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

  // # Handle DELETE on Edit Screen

  // STEP # 1
  const handleConfirm = async () => {
    // Sets the Validation Errors if any to empty as they are not necessary for delete.
    setCrudValidationErrors([])

    if (!token) {
      window.location.href = '/login'
      return
    }

    deleteProject(deleteProjectsId, token)
      .then(() => {
        updateProjectLists(deleteProjectsId)
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

  // Set the Lists to match the DB after deletion.

  // Step #2
  const updateProjectLists = (deleteId) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    setOriginalProjectsList((prevList) => prevList.filter((project) => project.project_id !== deleteId))
    setDeleteComplete(true)
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      // original list has deleted the record with deleteID
      // The updated list used on Edit screen goes back to matching orginal list.
      setProjects(originalProjectsList)
    }
  }, [deleteComplete])

  return (
    <div className='projectsList-wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='projectsList-cont-wrapper'>
        <Sidebar />
        <div className={`projectsList-wrapper ${isEditing ? 'editMode' : ''}`}>
          <div className='projectsList-top-content'>
            <div className='projectsList-top-body-cont'></div>
            <div className='projectsList-mode-switch-datalist'>
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
            <div className='projectsList-mid-body-cont'>
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
              <div className={`projectsList-table-wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`projectsList-table-cont ${isEditing ? 'editScrollable' : ''}`}>
                  <div>
                    <div className='columns is-mobile'>
                      <div className='column'>
                        {isEditing ? (
                          <div className='editScroll'>
                            <table className='table is-bordered is-hoverable'>
                              <thead>
                                <tr className='projectsList-table-title '>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('year', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('month', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('projectName', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('projectType', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('client', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('businessDivision', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('saleRevenue', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('dispatchLaborExpense', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('employeeExpense', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('indirectEmployeeExpense', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('expense', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('operatingIncome', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('nonOperatingIncome', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('nonOperatingExpense', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('ordinaryIncome', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'>
                                    {translate('ordinaryProfitMargin', language)}
                                  </th>
                                  <th className='projectsList-table-title-content-vertical has-text-centered'></th>
                                </tr>
                              </thead>
                              <tbody className='projectsList-table-body'>
                                {projects.map((project, index) => (
                                  <tr key={project.project_id} className='projectsList-table-body-content-horizontal'>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <select
                                        className='projectsRegistration-select-option'
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
                                    <td className='projectsList-table-body-content-vertical'>
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

                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='project_name'
                                        value={project.project_name}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='project_type'
                                        value={project.project_type}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <select
                                        className='projectsRegistration-select-option'
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
                                    <td className='projectsList-table-body-content-vertical'>
                                      <select
                                        className='projectsRegistration-select-option'
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
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='sales_revenue'
                                        value={formatNumberWithCommas(project.sales_revenue)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='dispatch_labor_expense'
                                        value={formatNumberWithCommas(project.dispatch_labor_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='employee_expense'
                                        value={formatNumberWithCommas(project.employee_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='indirect_employee_expense'
                                        value={formatNumberWithCommas(project.indirect_employee_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='expense'
                                        value={project.expense}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='operating_income'
                                        value={formatNumberWithCommas(project.operating_income)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='non_operating_income'
                                        value={formatNumberWithCommas(project.non_operating_income)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='non_operating_expense'
                                        value={formatNumberWithCommas(project.non_operating_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='ordinary_profit'
                                        value={formatNumberWithCommas(project.ordinary_profit)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectsList-table-body-content-vertical'>
                                      <input
                                        type='text'
                                        name='ordinary_profit_margin'
                                        value={formatNumberWithCommas(project.ordinary_profit_margin)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit-table-body-content-vertical'>
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
                              <tr className='projectsList-table-title '>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('year', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('month', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('projectName', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('projectType', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('client', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('businessDivision', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('saleRevenue', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('indirectEmployeeExpense', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('dispatchLaborExpense', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('employeeExpense', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('expense', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('operatingIncome', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('nonOperatingIncome', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('nonOperatingExpense', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('ordinaryIncome', language)}
                                </th>
                                <th className='projectsList-table-title-content-vertical has-text-centered'>
                                  {translate('ordinaryProfitMargin', language)}
                                </th>
                              </tr>
                            </thead>
                            <tbody className='projectsList-table-body'>
                              {projects.map((project) => (
                                <tr key={project.project_id} className='projectsList-table-body-content-horizontal'>
                                  <td className='projectsList-table-body-content-vertical'>{project.year}</td>
                                  <td className='projectsList-table-body-content-vertical'>{project.month}</td>
                                  <td className='projectsList-table-body-content-vertical'>{project.project_name}</td>
                                  <td className='projectsList-table-body-content-vertical'>{project.project_type}</td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {clients.map(
                                      (client) =>
                                        client.client_id === project.client && (
                                          <div key={client.client_id}>{client.client_name}</div>
                                        ),
                                    )}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {businessSelection.map(
                                      (business) =>
                                        business.business_division_id === project.business_division && (
                                          <div key={business.business_division_id}>
                                            {business.business_division_name}
                                          </div>
                                        ),
                                    )}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.sales_revenue)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.indirect_employee_expense)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.dispatch_labor_expense)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.employee_expense)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.expense)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.non_operating_income)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.operating_income)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.non_operating_expense)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.ordinary_profit)}
                                  </td>
                                  <td className='projectsList-table-body-content-vertical'>
                                    {formatNumberWithCommas(project.ordinary_profit_margin)}
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
              <div className='projectsList-is-editing-wrapper'>
                <div className='projectsList-is-editing-cont'>
                  {isEditing ? (
                    <div className='projectsList-edit-submit-btn-cont'>
                      <button
                        className='projectsList-edit-submit-btn'
                        onClick={() => {
                          setIsUpdateConfirmationOpen(true)
                        }}
                      >
                        {translate('update', language)}
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
