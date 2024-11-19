import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import { fetchBusinessDivisions } from '../../reducers/businessDivisions/businessDivisionsSlice'
import { UnknownAction } from 'redux'
import { useDispatch } from 'react-redux'
import { fetchMasterClient } from '../../reducers/client/clientSlice'
import CrudModal from '../../components/CrudModal/CrudModal'
import AlertModal from '../../components/AlertModal/AlertModal'
import { overwriteProject } from '../../api/ProjectsEndpoint/OverwriteProject'
import { getFilteredProjectSalesResults } from '../../api/ProjectSalesResultsEndpoint/FilteredGetProjectSalesResults'
import { createProjectSalesResults } from '../../api/ProjectSalesResultsEndpoint/CreateProjectSalesResults'


const months = ['4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3']

const ProjectSalesResultsRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('project')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const years = []
  const token = localStorage.getItem('accessToken')
  const [clients, setClients] = useState<any>([])
  const [clientsFilter, setClientsFilter] = useState<any>([])
  const [selectedClient, setSelectedClient] = useState([])
  const [businessSelection, setBusinessSelection] = useState<any>([])
  const [businessDivisionFilter, setBusinessDivisionFilter] = useState<any>([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [projectList, setProjectsList] = useState<any>([])
  const [enable , setEnabled] = useState(false)
  const dispatch = useDispatch()
  for (let year = 2021; year <= new Date().getFullYear(); year++) {
    years.push(year)
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false)
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false)

  const [formProjects, setProjects] = useState([
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

  const handleAdd = () => {
    if (formProjects.length < 10) {
      setProjects([
        ...formProjects,
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
    } else {
      console.log('You can only add up to 10 forms.')
    }
  }

  const handleMinus = () => {
    if (formProjects.length > 1) {
      setProjects(formProjects.slice(0, -1))
    }
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

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal()
  }

  const handleRemoveInputData = () => {
    setProjects([
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
    closeModal()
  }

  const openModal = () => {
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  const fetchClients = async () => {
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

  const handleChange = (index, event) => {
    const { name, value } = event.target
    const updatedFormData = [...formProjects]

    updatedFormData[index] = {
      ...updatedFormData[index],
      [name]: value,
      ...(name === 'month' && { project_name: '' }),
      ...(name === 'month' && { client: '' }),
      ...(name === 'month' && { business_division: '' }),
      ...(name === 'project_name' && { client: '' }),
      ...(name === 'project_name' && { business_division: '' }),
    }
    setProjects(updatedFormData)
  }

  useEffect(() => {
    formProjects.forEach((project) => {
      const month = project.month || null;
      const year = project.year || null;
      const projectId = project.project_name || null;

      if (month !== null || year !== null || projectId !== null ) {
        const filterParams = {
          ...(month !== null && { month }),
          ...(year !== null && { year }),
          ...(projectId !== null && { projectId }),
        }
        if (filterParams.year && filterParams.month) {
          setEnabled(true)
          getFilteredProjectSalesResults(filterParams, token)
            .then((data) => {
              let matchedClients = []
              let matchedBusinessDivision = []
              data.forEach((item) => {
                const client_id = item.client
                const business_id = item.business_division
                const filteredClients = clients.filter((client) => client.client_id === client_id)
                const filteredBusinessDivision = businessSelection.filter(
                  (business) => business.business_division_id === business_id,
                )
                if (filteredClients.length > 0) {
                  matchedClients = [...matchedClients, ...filteredClients]
                }
                if (filteredBusinessDivision.length > 0) {
                  matchedBusinessDivision = [...matchedBusinessDivision, ...filteredBusinessDivision]
                }
              })
              setBusinessDivisionFilter(matchedBusinessDivision)
              setClientsFilter(matchedClients)
              setProjectsList(data)
            })
            .catch((error) => {
              console.error('Error fetching project list:', error)
            })
        } else {
          setEnabled(false)
        }

      }
    });
  }, [
    formProjects
  ])

  const HandleClientChange = (e) => {
    setSelectedClient(e.target.value)
  }

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const validateProjects = (projectsValidate) => {
    return projectsValidate.every((prj) => {
      return (
        prj.year.trim() !== '' &&
        prj.month.trim() !== '' &&
        prj.project_name.trim() !== '' &&
        !isNaN(prj.sales_revenue) &&
        prj.sales_revenue > 0 &&
        !isNaN(prj.sales_revenue) &&
        prj.dispatch_labor_expense > 0 &&
        !isNaN(prj.dispatch_labor_expense) &&
        prj.employee_expense > 0 &&
        !isNaN(prj.employee_expense) &&
        prj.indirect_employee_expense > 0 &&
        !isNaN(prj.indirect_employee_expense) &&
        prj.expense > 0 &&
        !isNaN(prj.expense) &&
        prj.operating_income > 0 &&
        !isNaN(prj.operating_income) &&
        prj.non_operating_income > 0 &&
        !isNaN(prj.non_operating_income) &&
        prj.non_operating_expense > 0 &&
        !isNaN(prj.non_operating_expense) &&
        prj.ordinary_profit > 0 &&
        !isNaN(prj.ordinary_profit) &&
        prj.ordinary_profit_margin > 0 &&
        !isNaN(prj.ordinary_profit_margin)
      )
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const getProjectId = projectList.map((projects) => ({
      project: projects.project_id,
    }))

    const projectsData = formProjects.map((projects) => ({
      project_name: projects.project_name,
      month: projects.month,
      year: projects.year,
      sales_revenue: parseFloat(projects.sales_revenue),
      dispatch_labor_expense: parseFloat(projects.dispatch_labor_expense),
      employee_expense: parseFloat(projects.employee_expense),
      indirect_employee_expense: parseFloat(projects.indirect_employee_expense),
      expense: parseFloat(projects.expense),
      operating_income: parseFloat(projects.operating_income),
      non_operating_income: parseFloat(projects.non_operating_income),
      non_operating_expense: parseFloat(projects.non_operating_expense),
      ordinary_profit: parseFloat(projects.ordinary_profit),
      ordinary_profit_margin: parseFloat(projects.ordinary_profit_margin),
    }))

    const combinedObject = getProjectId.map((item, index) => ({
      ...item,
      ...projectsData[index],
    }))

    if (!token) {
      window.location.href = '/login'
      return
    }

    if (!validateProjects(projectsData)) {
      setModalMessage(translate('usersValidationText6', language))
      setIsModalOpen(true)
      return // Stop the submission
    }

    createProjectSalesResults(combinedObject, token)
      .then(() => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setProjects([
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
      })
      .catch((error) => {
        console.error('There was an error with project sales results registration!', error)
      })
  }

  // Handle overwrite confirmation
  const handleOverwriteConfirmation = async () => {
    setIsOverwriteModalOpen(false) // Close the overwrite modal
    setIsOverwriteConfirmed(true) // Set overwrite confirmed state

    // Call the submission method again after confirmation
    await handleSubmitConfirmed()
  }

  const handleSubmitConfirmed = async () => {
    const projectsData = formProjects.map((projects) => ({
      year: projects.year,
      month: projects.month,
      project_name: projects.project_name,
      project_type: projects.project_type,
      client: projects.client,
      business_division: projects.business_division,
      sales_revenue: parseFloat(projects.sales_revenue),
      dispatch_labor_expense: parseFloat(projects.dispatch_labor_expense),
      employee_expense: parseFloat(projects.employee_expense),
      indirect_employee_expense: parseFloat(projects.indirect_employee_expense),
      expense: parseFloat(projects.expense),
      operating_income: parseFloat(projects.operating_income),
      non_operating_income: parseFloat(projects.non_operating_income),
      non_operating_expense: parseFloat(projects.non_operating_expense),
      ordinary_profit: parseFloat(projects.ordinary_profit),
      ordinary_profit_margin: parseFloat(projects.ordinary_profit_margin),
    }))

    overwriteProject(projectsData, token)
      .then((data) => {
        setModalMessage(translate('overWrite', language))
        setIsModalOpen(true)
        setProjects([
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
      })
      .catch((overwriteError) => {
        if (overwriteError.response.status === 400) {
          // Display project name already exists alert
          setModalMessage(translate('projectNameExist', language))
          setIsModalOpen(true)
        } else {
          console.error('Error overwriting data:', overwriteError)
        }
      })
      .finally(() => {
        setIsOverwriteConfirmed(false) // Reset overwrite confirmation
      })
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }
  useEffect(() => {
    fetchDivision()
    fetchClients()
  }, [token])
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

  const handleListClick = () => {
    navigate('/project-sales-results-list')
  }

  return (
    <div className='projectSalesResultsRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='projectSalesResultsRegistration_content_wrapper'>
        <Sidebar />
        <div className='projectSalesResultsRegistration_data_content'>
          <div className='projectSalesResultsRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('projectsRegistration', language)}
              handleTabsClick={handleTabsClick}
              handleListClick={handleListClick}
              buttonConfig={[
                { labelKey: 'expensesResults', tabKey: 'expensesResults' },
                { labelKey: 'projectSalesResults', tabKey: 'projectSalesResults' },
              ]}
            />
          </div>
          <div className='projectSalesResultsRegistration_mid_body_cont'>
            <form className='projectSalesResultsRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='projectSalesResultsRegistration_mid_form_cont'>
                {formProjects.map((form, index) => (
                  <div
                    key={index}
                    className={`projectSalesResultsRegistration_form-content ${index > 0 ? 'projectSalesResultsRegistration_form-content-special' : ''}`}
                  >
                    <div
                      className={`projectSalesResultsRegistration_form-content ${index > 0 ? 'projectSalesResultsRegistration_form-line' : ''}`}
                    ></div>
                    <div className='projectSalesResultsRegistration_form-content-div'>
                      <div className='projectSalesResultsRegistration_left-form-div projectSalesResultsRegistration_calc'>
                        <div className='projectSalesResultsRegistration_year-div'>
                          <label className='projectSalesResultsRegistration_year'>{translate('year', language)}</label>
                          <select
                            className='projectSalesResultsRegistration_select-option'
                            name='year'
                            value={form.year}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            {years.map((year, idx) => (
                              <option key={idx} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectSalesResultsRegistration_project-type-div'>
                          <label className='projectSalesResultsRegistration_project-type inactiveLabel'>
                            {translate('projectType', language)}
                          </label>
                          <select
                            className='projectSalesResultsRegistration_select-option inactiveInput'
                            name='project_type'
                            value={form.project_type}
                            onChange={(e) => handleChange(index, e)}
                            disabled
                          >
                            {projectList.map((project, index) => (
                              <option key={index} value={project.project_id}>
                                {project.project_type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectSalesResultsRegistration_sales-revenue-div'>
                          <label className='projectSalesResultsRegistration_sales-revenue'>
                            {translate('saleRevenue', language)}
                          </label>
                          <input
                            type='number'
                            name='sales_revenue'
                            value={form.sales_revenue}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_employee-expenses-div'>
                          <label className='projectSalesResultsRegistration_employee-expenses'>
                            {translate('employeeExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='employee_expense'
                            value={form.employee_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_operating-income-div'>
                          <label className='projectSalesResultsRegistration_operating-income'>
                            {translate('operatingIncome', language)}
                          </label>
                          <input
                            type='number'
                            name='operating_income'
                            value={form.operating_income}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_ordinary-income-div'>
                          <label className='projectSalesResultsRegistration_ordinary-income'>
                            {translate('ordinaryIncome', language)}
                          </label>
                          <input
                            type='number'
                            name='ordinary_profit'
                            value={form.ordinary_profit}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>

                      <div className='projectSalesResultsRegistration_middle-form-div projectSalesResultsRegistration_calc'>
                        <div className='projectSalesResultsRegistration_month-div'>
                          <label className='projectSalesResultsRegistration_month'>
                            {translate('month', language)}
                          </label>
                          <select
                            className='projectSalesResultsRegistration_select-option'
                            name='month'
                            value={form.month}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            {months.map((month, idx) => (
                              <option key={idx} value={month}>
                                {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectSalesResultsRegistration_client-div'>
                          <label className='projectSalesResultsRegistration_client inactiveLabel'>
                            {translate('client', language)}
                          </label>
                          <select
                            className='projectSalesResultsRegistration_select-option inactiveInput'
                            name='client'
                            value={form.client}
                            onChange={(e) => handleChange(index, e)}
                            disabled
                          >
                            {clientsFilter.map((client, index) => (
                              <option key={index} value={client.client_id}>
                                {client.client_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectSalesResultsRegistration_indirect-employee-expense-div'>
                          <label className='projectSalesResultsRegistration_indirect-employee-expense'>
                            {translate('indirectEmployeeExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='indirect_employee_expense'
                            value={form.indirect_employee_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_non-operating-income-div'>
                          <label className='projectSalesResultsRegistration_non-operating-income'>
                            {translate('nonOperatingIncome', language)}
                          </label>
                          <input
                            type='number'
                            name='non_operating_income'
                            value={form.non_operating_income}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_ordinary-income-margin-div'>
                          <label className='projectSalesResultsRegistration_ordinary-income-margin'>
                            {translate('ordinaryIncomeProfitMargin', language)}
                          </label>
                          <input
                            type='number'
                            name='ordinary_profit_margin'
                            value={form.ordinary_profit_margin}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>

                      <div className='projectSalesResultsRegistration_right-form-div projectSalesResultsRegistration_calc'>
                        <div className='projectSalesResultsRegistration_project-name-div'>
                          <label
                            className={`projectSalesResultsRegistration_project_name ${enable ? '' : 'inactiveLabel'}`}
                          >
                            {translate('projectName', language)}
                          </label>
                          {enable ? (
                            <select
                              className='projectSalesResultsRegistration_select-option'
                              name='project_name'
                              value={form.project_name}
                              onChange={(e) => handleChange(index, e)}
                            >
                              <option value=''>-- Reset --</option>
                              {projectList.map((project, index) => (
                                <option key={index} value={project.project_id} title={project.client_name}>
                                  {project.project_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              className='projectSalesResultsRegistration_select-option inactiveInput'
                              name='project_name'
                              value={form.project_name}
                              onChange={(e) => handleChange(index, e)}
                              disabled
                            >
                              <option value=''></option>
                              {projectList.map((project, index) => (
                                <option key={index} value={project.project_id}>
                                  {project.project_name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className='projectSalesResultsRegistration_right-form-div'>
                          <div className='projectSalesResultsRegistration_business_division_name-div'>
                            <label className='projectSalesResultsRegistration_business_division_name inactiveLabel'>
                              {translate('businessDivision', language)}
                            </label>
                            <select
                              className='projectSalesResultsRegistration_select-option inactiveInput'
                              name='business_division'
                              value={form.business_division}
                              onChange={(e) => handleChange(index, e)}
                              disabled
                            >
                              {businessDivisionFilter.map((division, index) => (
                                <option key={index} value={division.business_division_id}>
                                  {division.business_division_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className='projectSalesResultsRegistration_dispatch-labor-expense-div'>
                          <label className='projectSalesResultsRegistration_dispatch-labor-expense'>
                            {translate('dispatchLaborExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='dispatch_labor_expense'
                            value={form.dispatch_labor_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>

                        <div className='projectSalesResultsRegistration_expense-div'>
                          <label className='projectSalesResultsRegistration_expense'>
                            {translate('expenses', language)}
                          </label>
                          <input
                            type='number'
                            name='expense'
                            value={form.expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>

                        <div className='projectSalesResultsRegistration_non-operating-expense-div'>
                          <label className='projectSalesResultsRegistration_non-operating-expense'>
                            {translate('nonOperatingExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='non_operating_expense'
                            value={form.non_operating_expense}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>
                    </div>
                    {/* //for testing and will be removed it not used for future use */}
                    {/* <input type='hidden' name='registered_user_id' value={form.registered_user_id} />  */}
                  </div>
                ))}
              </div>
              <div className='projectSalesResultsRegistration_lower_form_cont'>
                <div className='projectSalesResultsRegistration_form-content'>
                  <div className='projectSalesResultsRegistration_plus-btn'>
                    <button className='projectSalesResultsRegistration_inc' type='button' onClick={handleAdd}>
                      +
                    </button>
                    <button className='projectSalesResultsRegistration_dec' type='button' onClick={handleMinus}>
                      -
                    </button>
                  </div>
                  <div className='projectSalesResultsRegistration_options-btn'>
                    <button type='button' className='button is-light' onClick={handleCancel}>
                      {translate('cancel', language)}
                    </button>
                    <button type='submit' className='button is-info'>
                      {translate('submit', language)}
                    </button>
                  </div>
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
      <CrudModal message={modalMessage} onClose={() => setIsModalOpen(false)} isCRUDOpen={isModalOpen} />
      <AlertModal
        isOpen={isOverwriteModalOpen}
        onCancel={() => setIsOverwriteModalOpen(false)}
        onConfirm={handleOverwriteConfirmation}
        message={modalMessage}
      />
    </div>
  )
}

export default ProjectSalesResultsRegistration
