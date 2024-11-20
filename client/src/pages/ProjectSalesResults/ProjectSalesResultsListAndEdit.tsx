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
      case 'expensesResults':
        navigate('/expenses-results-list')
        break
      case 'projectSalesResults':
        navigate('/project-sales-results-list')
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
    setProjectSalesResults((prevState) => {
      const updatedProjectsData = [...prevState]
      updatedProjectsData[index] = {
        ...updatedProjectsData[index],
        [name]: value,
      }

      setFormProjects(updatedProjectsData)
      return updatedProjectsData
    })
  }

  const handleSubmit = async () => {
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
          console.log(data)
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

  const handleConfirm = async () => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    deleteProjectSalesResults(deleteProjectsId, token)
      .then(() => {
        setProjectSalesResults((prevList) => prevList.filter((pr) => pr.project_id !== deleteProjectsId))
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
            <div className='projectSalesResultsList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'projectsSalesResultsEdit' : 'projectsSalesResultsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'expensesResults', tabKey: 'expensesResults' },
                  { labelKey: 'projectSalesResults', tabKey: 'projectSalesResults' },
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
                                    {translate('dispatchLaborExpense', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('employeeExpense', language)}
                                  </th>
                                  <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                    {translate('indirectEmployeeExpense', language)}
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
                                        type='number'
                                        name='sales_revenue'
                                        value={projectSalesResults.sales_revenue}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='dispatch_labor_expense'
                                        value={projectSalesResults.dispatch_labor_expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='employee_expense'
                                        value={projectSalesResults.employee_expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='indirect_employee_expense'
                                        value={projectSalesResults.indirect_employee_expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='expense'
                                        value={projectSalesResults.expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='operating_income'
                                        value={projectSalesResults.operating_income}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='non_operating_income'
                                        value={projectSalesResults.non_operating_income}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='non_operating_expense'
                                        value={projectSalesResults.non_operating_expense}
                                        onChange={(e) => handleChange(index, e)}
                                      />
                                    </td>
                                    <td className='projectSalesResultsList_table_body_content_vertical'>
                                      <input
                                        type='number'
                                        name='ordinary_profit'
                                        value={projectSalesResults.ordinary_profit}
                                        onChange={(e) => handleChange(index, e)}
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
                                  {translate('dispatchLaborExpense', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('employeeExpense', language)}
                                </th>
                                <th className='projectSalesResultsList_table_title_content_vertical has-text-centered'>
                                  {translate('indirectEmployeeExpense', language)}
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
                                    {project.sales_revenue}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {project.dispatch_labor_expense}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {project.employee_expense}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {project.indirect_employee_expense}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {project.expense}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {project.operating_income}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {project.non_operating_income}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
                                    {project.non_operating_expense}
                                  </td>
                                  <td className='projectSalesResultsList_table_body_content_vertical'>
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
      <CrudModal isCRUDOpen={isCRUDOpen} onClose={closeModal} message={crudMessage} />
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
