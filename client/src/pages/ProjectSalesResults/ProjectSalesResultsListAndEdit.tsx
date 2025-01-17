import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import ListButtons from '../../components/ListButtons/ListButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import { useDispatch } from 'react-redux'
import { UnknownAction } from 'redux'
import { fetchBusinessDivisions } from '../../reducers/businessDivisions/businessDivisionsSlice'
import { fetchMasterClient } from '../../reducers/client/clientSlice'
import { RiDeleteBin6Fill } from 'react-icons/ri'
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal'
import '../../assets/scss/Components/SliderToggle.scss'
import { getProjectSalesResults } from '../../api/ProjectSalesResultsEndpoint/GetProjectSalesResults'
import { updateProjectSalesResults } from '../../api/ProjectSalesResultsEndpoint/UpdateProjectSalesResults'
import { deleteProjectSalesResults } from '../../api/ProjectSalesResultsEndpoint/DeleteProjectSalesResults'
import { validateRecords, translateAndFormatErrors, getFieldChecks, checkForDuplicates } from '../../utils/validationUtil'
import { handleDisableKeysOnNumberInputs, formatNumberWithCommas, removeCommas } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
const ProjectSalesResultsListAndEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('projectSalesResults')
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const select = [5, 10, 100]
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isEditing, setIsEditing] = useState(false)
  const [projectSalesResults, setProjectSalesResults] = useState([])
  const [originalProjectSalesResultsList, setOriginalProjectSalesResultsList] = useState(projectSalesResults)
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
  const [formProjects, setFormProjects] = useState([
    {
      sales_revenue: '',
      indirect_employee_expense: '',
      dispatch_labor_expense: '',
      employee_expense: '',
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
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [deleteComplete, setDeleteComplete] = useState(false)
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
      case 'expensesResults':
        navigate('/expenses-results-list')
        break
      case 'projectSalesResults':
        navigate('/project-sales-results-list')
        break
      case 'employeeExpensesResults':
        navigate('/employee-expenses-results-list')
        break
      case 'costOfSalesResults':
        navigate('/cost-of-sales-results-list')
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
        setLanguage('jp')
      }

      if (!newEditingState) {
        // Reset to original values when switching to list mode
        setProjectSalesResults(originalProjectSalesResultsList)
      }

      return newEditingState
    })
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target

    // Remove commas to get the raw number
    // EG. 999,999 → 999999 in the DB
    const rawValue = removeCommas(value)

    setProjectSalesResults((prevState) => {
      const updatedProjectsData = [...prevState]
      updatedProjectsData[index] = {
        ...updatedProjectsData[index],
        [name]: rawValue,
      }

      setFormProjects(updatedProjectsData)
      console.log('inside handle change', updatedProjectsData, formProjects)
      return updatedProjectsData
    })
  }

  const handleSubmit = async () => {
    setFormProjects(projectSalesResults)
    // Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'projectResults'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateProjects = (records) => validateRecords(records, fieldChecks, 'projectResults')

    // Step 2: Validate client-side input
    const validationErrors = validateProjects(projectSalesResults)
    console.log('formProjects #2', projectSalesResults, validationErrors)

    // Step 3: Check for duplicate entries on specific fields
    // In this screen Month / Year / Project_name/ Client / Business Division cannot be edited.
    const uniqueFields = ['project_sales_result_id']
    const duplicateErrors = checkForDuplicates(projectSalesResults, uniqueFields, 'project', language)

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
        const originalProjectsSalesResults = original.find(
          (pr) => pr.project_sales_result_id === updatedProjects.project_sales_result_id,
        )

        if (originalProjectsSalesResults) {
          const changes = { project_sales_result_id: updatedProjects.project_sales_result_id }

          for (const key in updatedProjects) {
            if (updatedProjects[key] !== originalProjectsSalesResults[key]) {
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
    const modifiedFields = getModifiedFields(originalProjectSalesResultsList, projectSalesResults)
    if (!token) {
      window.location.href = '/login'
      return
    }

    updateProjectSalesResults(modifiedFields, token)
      .then(() => {
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        console.log('There was an error updating the projects sales results!', error)
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

      getProjectSalesResults(token)
        .then((data) => {
          setProjectSalesResults(data)
          setOriginalProjectSalesResultsList(data)
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('There was an error fetching the projects sales results!', error)
          }
        })
    }
    fetchDivision()
    fetchClient()
    fetchProjects()
  }, [])

  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(projectSalesResults.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, projectSalesResults])

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
    navigate('/project-sales-results-registration')
  }

  const openModal = (projectsSalesResults, id) => {
    setSelectedProject(projectsSalesResults)
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

    deleteProjectSalesResults(deleteProjectsId, token)
      .then(() => {
        updateProjectSalesResultLists(deleteProjectsId)
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
  const updateProjectSalesResultLists = (deleteId) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    setOriginalProjectSalesResultsList((prevList) => prevList.filter((pr) => pr.project_sales_result_id !== deleteProjectsId))
    setDeleteComplete(true)
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      // original list has deleted the record with deleteID
      // The updated list used on Edit screen goes back to matching orginal list.
      setProjectSalesResults(originalProjectSalesResultsList)
    }
  }, [deleteComplete])

  return (
    <div className='projectSalesResultsList_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='projectSalesResultsList_cont_wrapper'>
        <Sidebar />
        <div className={`projectSalesResultsList_wrapper ${isEditing ? 'editMode' : ''}`}>
          <div className='projectSalesResultsList_top_content'>
            <div className='projectSalesResultsList_top_body_cont'></div>
            <div className='projectSalesResultsList_mode_switch_datalist'>
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
            <div className='projectSalesResultsList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'projectsSalesResultsEdit' : 'projectsSalesResultsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'projectSalesResultsShort', tabKey: 'projectSalesResults' },
                  { labelKey: 'employeeExpensesResultsShort', tabKey: 'employeeExpensesResults' },
                  { labelKey: 'expensesResultsShort', tabKey: 'expensesResults' },
                  { labelKey: 'costOfSalesResultsShort', tabKey: 'costOfSalesResults' },
                ]}
              />
              <div className={`projectSalesResultsList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`projectSalesResultsList_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  <div>
                    <div className='columns is-mobile'>
                      <div className='column'>
                        {isEditing ? (
                          <div className='editScroll'>
                            <table className='table is-bordered is-hoverable'>
                              <thead>
                                <tr className='projectSalesResultsList_table_title '>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('year', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('month', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('projectName', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('projectType', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('client', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('businessDivision', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('saleRevenue', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('indirectEmployeeExpense', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('dispatchLaborExpense', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('employeeExpense', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('expense', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('operatingIncome', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('nonOperatingIncome', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('nonOperatingExpense', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('ordinaryIncome', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('ordinaryProfitMargin', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('delete', language)}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='projectSalesResultsList_table_body'>
                                {projectSalesResults.map((projectSalesResults, index) => (
                                  <tr key={index} className='projectSalesResultsList_table_body_content_horizontal'>
                                    <td className='projectsList_table_body_content_vertical'>
                                      {projectSalesResults.projects?.year}
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      {projectSalesResults.projects?.month}
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      {projectSalesResults.projects?.project_name}
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      {projectSalesResults.projects?.project_type}
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      {clients.map(
                                        (client) =>
                                          client.client_id === projectSalesResults.projects?.client && (
                                            <div key={client.client_id}>{client.client_name}</div>
                                          ),
                                      )}
                                    </td>
                                    <td className='projectsList_table_body_content_vertical'>
                                      {businessSelection.map(
                                        (business) =>
                                          business.business_division_id ===
                                            projectSalesResults.projects?.business_division && (
                                            <div key={business.business_division_id}>
                                              {business.business_division_name}
                                            </div>
                                          ),
                                      )}
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='sales_revenue'
                                        value={formatNumberWithCommas(projectSalesResults.sales_revenue)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='indirect_employee_expense'
                                        value={formatNumberWithCommas(projectSalesResults.indirect_employee_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='dispatch_labor_expense'
                                        value={formatNumberWithCommas(projectSalesResults.dispatch_labor_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='employee_expense'
                                        value={formatNumberWithCommas(projectSalesResults.employee_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='expense'
                                        value={formatNumberWithCommas(projectSalesResults.expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='operating_income'
                                        value={formatNumberWithCommas(projectSalesResults.operating_income)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='non_operating_income'
                                        value={formatNumberWithCommas(projectSalesResults.non_operating_income)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='non_operating_expense'
                                        value={formatNumberWithCommas(projectSalesResults.non_operating_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='ordinary_profit'
                                        value={formatNumberWithCommas(projectSalesResults.ordinary_profit)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='text'
                                        name='ordinary_profit_margin'
                                        value={formatNumberWithCommas(projectSalesResults.ordinary_profit_margin)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                      <RiDeleteBin6Fill
                                        className='delete-icon'
                                        onClick={() =>
                                          openModal('project', projectSalesResults.project_sales_result_id)
                                        }
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
                              <tr className='projectSalesResultsList_table_title '>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('year', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('month', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('projectName', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('projectType', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('client', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('businessDivision', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('saleRevenue', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('indirectEmployeeExpense', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('dispatchLaborExpense', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('employeeExpense', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('expense', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('operatingIncome', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('nonOperatingIncome', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('nonOperatingExpense', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('ordinaryIncome', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('ordinaryProfitMargin', language)}
                                </th>
                              </tr>
                            </thead>
                            <tbody className='projectSalesResultsList_table_body'>
                              {projectSalesResults.map((project, index) => (
                                <tr key={index} className='projectSalesResultsList_table_body_content_horizontal'>
                                  <td className='projectsList_table_body_content_vertical'>{project.projects?.year}</td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.projects?.month}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.projects?.project_name}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {project.projects?.project_type}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {clients.map(
                                      (client) =>
                                        client.client_id === project.projects?.client && (
                                          <div key={client.client_id}>{client.client_name}</div>
                                        ),
                                    )}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    {businessSelection.map(
                                      (business) =>
                                        business.business_division_id === project.projects?.business_division && (
                                          <div key={business.business_division_id}>
                                            {business.business_division_name}
                                          </div>
                                        ),
                                    )}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.sales_revenue)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.indirect_employee_expense)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.dispatch_labor_expense)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.employee_expense)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.expense)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.operating_income)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.non_operating_income)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.non_operating_expense)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {formatNumberWithCommas(project.ordinary_profit)}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
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
              <div className='projectSalesResultsList_is_editing_wrapper'>
                <div className='projectSalesResultsList_is_editing_cont'>
                  {isEditing ? (
                    <div className='projectSalesResultsList_edit_submit_btn_cont'>
                      <button
                        className='projectSalesResultsList_edit_submit_btn'
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
}

export default ProjectSalesResultsListAndEdit
