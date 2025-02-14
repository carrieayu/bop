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
import { createProject } from '../../api/ProjectsEndpoint/CreateProject'
import { overwriteProject } from '../../api/ProjectsEndpoint/OverwriteProject'
import { maximumEntries, monthNames, token, years, IDLE_TIMEOUT } from '../../constants'
import { addFormInput, closeModal, openModal, removeFormInput } from '../../actions/hooks'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import {
  handleDisableKeysOnNumberInputs,
  removeCommas,
  formatNumberWithCommas,
  formatNumberWithDecimal,
  handleInputChange,
  handlePLRegTabsClick,
  setupIdleTimer,
} from '../../utils/helperFunctionsUtil'

const ProjectsRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [clients, setClients] = useState<any>([])
  const [selectedClient, setSelectedClient] = useState([])
  const [businessSelection, setBusinessSelection] = useState<any>([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const dispatch = useDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false)
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false)
  const [isNonActiveOpen, setIsNonActiveOpen] = useState(false)
  const onTabClick = (tab) => handlePLRegTabsClick(tab, navigate, setActiveTab)

  const emptyFormData = {
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
  }
  const [formProjects, setProjects] = useState([emptyFormData])

  const handleAdd = () => {
    addFormInput(formProjects, setProjects, maximumEntries, emptyFormData)
  }

  const handleRemove = () => {
    removeFormInput(formProjects, setProjects)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal(setModalIsOpen)
  }

  const handleRemoveInputData = () => {
    setProjects([emptyFormData])
    closeModal(setModalIsOpen)
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

  const [isIdle, setIsIdle] = useState(false);
  useEffect(() => {
    const onIdle = () => {
      setIsIdle(true);
      setIsNonActiveOpen(true)
    };
    const idleTimer = setupIdleTimer(onIdle, IDLE_TIMEOUT);
    idleTimer.startListening();
    return () => {
      idleTimer.stopListening();
    };
  }, []);

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentFiscalYear = currentDate.getMonth() + 1 < 4 ? currentYear - 1 : currentYear
  const [months, setMonths] = useState<number[]>([])

  const handleChange = (index, event) => {
    const nonFinancialFieldsArray = ['year', 'month', 'project_name', 'project_type', 'client', 'business_division']
    handleInputChange(index, event, setProjects, formProjects, nonFinancialFieldsArray)

    const { name, value } = event.target

    // Remove commas to get the raw number
    // EG. 999,999 → 999999 in the DB
    const rawValue = removeCommas(value)

    if (name === 'year') {
      const selectedYear = parseInt(rawValue, 10)
      if (selectedYear === currentFiscalYear) {
        setMonths([4, 5, 6, 7, 8, 9, 10, 11, 12])
      } else if (selectedYear === currentFiscalYear + 1) {
        setMonths([1, 2, 3])
      } else {
        setMonths([])
      }
    }

    const updatedProjects = [...formProjects]
    updatedProjects[index] = {
      ...updatedProjects[index],
      [name]: removeCommas(value),
    }

    const relevantFields = [
      "sales_revenue", 
      "indirect_employee_expense", 
      "dispatch_labor_expense", 
      "employee_expense", 
      "expense", 
      "non_operating_income", 
      "non_operating_expense"
    ];
    if (relevantFields.includes(name)) {
      const { sales_revenue, indirect_employee_expense, dispatch_labor_expense, employee_expense, expense, non_operating_income } = updatedProjects[index];
      const operating_income_ = parseFloat(sales_revenue) - 
                                (
                                  (parseFloat(indirect_employee_expense)  || 0) +
                                  (parseFloat(dispatch_labor_expense)     || 0) +
                                  (parseFloat(employee_expense)           || 0) +
                                  (parseFloat(expense)                    || 0)
                                );
      updatedProjects[index].operating_income = operating_income_.toString();
      const _ordinary_profit = operating_income_ + parseFloat(non_operating_income)
      updatedProjects[index].ordinary_profit = _ordinary_profit.toString();
      const _ordinary_profit_margin = ((operating_income_ / (parseFloat(sales_revenue))) * 100)
      updatedProjects[index].ordinary_profit_margin = _ordinary_profit_margin.toFixed(2);
    }

    setProjects(updatedProjects)
  }
  useEffect(() => {}, [formProjects])

  const HandleClientChange = (e) => {
    setSelectedClient(e.target.value)
  }

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'projects'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateProjects = (records) => validateRecords(records, fieldChecks, 'project')

    // Step 2: Validate client-side input
    const validationErrors = validateProjects(formProjects)

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month', 'project_name', 'business_division', 'client']
    const duplicateErrors = checkForDuplicates(formProjects, uniqueFields, 'project', language)

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

    if (!token) {
      window.location.href = '/login'
      return
    }

    createProject(projectsData, token)
      .then((data) => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setProjects([emptyFormData])
      })
      .catch((error) => {
        if (error.response && error.response.status === 409) {
          const existingEntries = error.response.data.existingEntries

          // Map to create a string of existing entries
          const existingDetails = existingEntries
            .map(
              (entry) =>
                `'${entry.year}, ${entry.month}, ${entry.project_name}, ${entry.client}, ${entry.business_division}'`,
            )
            .join(', ')

          // Create new details based on projectsData but ensure no overlap with existing entries
          const newDetails = projectsData
            .filter((entry) => {
              // Check if the entry already exists
              const exists = existingEntries.some(
                (existing) =>
                  existing.year === entry.year &&
                  existing.month === entry.month &&
                  existing.project_name === entry.project_name &&
                  existing.client === clients.find((client) => client.client_id === entry.client)?.client_name && // Adjust this line
                  existing.business_division ===
                    businessSelection.find((division) => division.business_division_id === entry.business_division)
                      ?.business_division_name, // Adjust this line
              )

              return !exists // Keep only if it does not exist
            })
            .map((entry) => {
              const clientName = clients.find((client) => client.client_id === entry.client)?.client_name || ''
              const businessDivisionName =
                businessSelection.find((division) => division.business_division_id === entry.business_division)
                  ?.business_division_name || ''
              return `'${entry.year}, ${entry.month}, ${entry.project_name}, ${clientName}, ${businessDivisionName}'`
            })
            .join(', ') // Join the new details

          // Construct the message
          let message = translate('projectOverwriteMessage', language).replace('${existingEntries}', existingDetails)

          // Only add new entries to the message if they exist
          if (newDetails.length > 0) {
            message += translate('projectNewEntry', language).replace('${newEntries}', newDetails)
          }

          setModalMessage(message)
          setIsOverwriteModalOpen(true)
          return
        } else if (
          error.response.data.project_name &&
          Array.isArray(error.response.data.project_name) &&
          error.response.data.project_name[0] &&
          error.response.status === 400
        ) {
          // Display project name already exists alert
          setModalMessage(translate('projectNameExist', language))
          setIsModalOpen(true)
        } else {
          console.error('There was an error with expenses registration!', error)
        }
      })
  }

  // Handle overwrite confirmation
  const handleOverwriteConfirmation = async () => {
    setIsOverwriteModalOpen(false) // Close the overwrite modal
    setIsOverwriteConfirmed(true) // Set overwrite confirmed state

    // Call the submission method again after confirmation
    await handleSubmitConfirmed()
  }

  const handleNonActiveConfirm = async () => {
    setIsNonActiveOpen(false)
    window.location.href = '/login'
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

  const handleListClick = () => {
    navigate('/projects-list')
  }

  return (
    <div className='projectsRegistration-wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='projectsRegistration-content-wrapper'>
        <Sidebar />
        <div className='projectsRegistration-data-content'>
          <div className='projectsRegistration-top-body-cont'>
            <RegistrationButtons
              activeTabOther={'project'}
              message={translate('projectsRegistration', language)}
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
          <div className='projectsRegistration-mid-body-cont'>
            <form className='projectsRegistration-inputs-and-buttons' onSubmit={handleSubmit}>
              <div className='projectsRegistration-mid-form-cont'>
                {formProjects.map((form, index) => (
                  <div
                    key={index}
                    className={`projectsRegistration-form-content ${index > 0 ? 'projectsRegistration-form-content-special' : ''}`}
                  >
                    <div
                      className={`projectsRegistration-form-content ${index > 0 ? 'projectsRegistration-form-line' : ''}`}
                    ></div>
                    <div className='projectsRegistration-form-content-div'>
                      <div className='projectsRegistration-left-form-div projectsRegistration-calc'>
                        {/* LEFT COLUMN */}
                        <div className='projectsRegistration-year-div'>
                          <label className='projectsRegistration-year'>{translate('year', language)}</label>
                          <select
                            className='projectsRegistration-select-option'
                            name='year'
                            value={form.year}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectYear', language)}</option>
                            {years.map((year, idx) => (
                              <option key={idx} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectsRegistration-project-type-div'>
                          <label className='projectsRegistration-project-type'>
                            {translate('projectType', language)}
                          </label>
                          <input
                            type='text'
                            name='project_type'
                            value={form.project_type}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration-sales-revenue-div'>
                          <label className='projectsRegistration-sales-revenue'>
                            {translate('saleRevenue', language)}
                          </label>
                          <input
                            type='text'
                            name='sales_revenue'
                            value={formatNumberWithCommas(form.sales_revenue)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectsRegistration-employee-expenses-div'>
                          <label className='projectsRegistration-employee-expenses'>
                            {translate('employeeExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='employee_expense'
                            value={formatNumberWithCommas(form.employee_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectsRegistration-non-operating-income-div'>
                          <label className='projectsRegistration-non-operating-income'>
                            {translate('nonOperatingIncome', language)}
                          </label>
                          <input
                            type='text'
                            name='non_operating_income'
                            value={formatNumberWithCommas(form.non_operating_income)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectsRegistration-ordinary-income-margin-div'>
                          <label className='projectsRegistration-ordinary-income-margin'>
                            {translate('ordinaryIncomeProfitMargin', language)}
                          </label>
                          <input
                            type='text'
                            name='ordinary_profit_margin'
                            // 更新必要： This Probably Needs to be Calculated Automatically
                            value={formatNumberWithDecimal(form.ordinary_profit_margin)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            disabled
                          />
                        </div>
                      </div>
                      {/* CENTER COLUMN */}
                      <div className='projectsRegistration-middle-form-div projectsRegistration-calc'>
                        <div className='projectsRegistration-month-div'>
                          <label className='projectsRegistration-month'>{translate('month', language)}</label>
                          <select
                            className='projectsRegistration-select-option'
                            name='month'
                            value={form.month}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectMonth', language)}</option>
                            {months.map((month, idx) => (
                              <option key={idx} value={month}>
                                {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectsRegistration-client-div'>
                          <label className='projectsRegistration-client'>{translate('client', language)}</label>
                          <select
                            className='projectsRegistration-select-option'
                            name='client'
                            value={form.client}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectClient', language)}</option>
                            {clients.map((client) => (
                              <option key={client.client_id} value={client.client_id}>
                                {client.client_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectsRegistration-indirect-employee-expense-div'>
                          <label className='projectsRegistration-indirect-employee-expense'>
                            {translate('indirectEmployeeExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='indirect_employee_expense'
                            value={formatNumberWithCommas(form.indirect_employee_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectsRegistration-expense-div'>
                          <label className='projectsRegistration-expense'>{translate('expense', language)}</label>
                          <input
                            type='text'
                            name='expense'
                            value={formatNumberWithCommas(form.expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectsRegistration-non-operating-expense-div'>
                          <label className='projectsRegistration-non-operating-expense'>
                            {translate('nonOperatingExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='non_operating_expense'
                            value={formatNumberWithCommas(form.non_operating_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                      </div>
                      {/* RIGHT COLUMN */}
                      <div className='projectsRegistration-right-form-div projectsRegistration-calc'>
                        <div className='projectsRegistration-project-name-div'>
                          <label className='projectsRegistration-project-name'>
                            {translate('projectName', language)}
                          </label>
                          <input
                            type='text'
                            name='project_name'
                            value={form.project_name}
                            onChange={(e) => handleChange(index, e)}
                            style={{
                              overflowX: 'auto',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                            }}
                          />
                        </div>

                        <div className='projectsRegistration-right-form-div'>
                          <div className='projectsRegistration-business-division-name-div'>
                            <label className='projectsRegistration-business-division-name'>
                              {translate('businessDivision', language)}
                            </label>
                            <select
                              className='projectsRegistration-select-option'
                              name='business_division'
                              value={form.business_division}
                              onChange={(e) => handleChange(index, e)}
                            >
                              <option value=''>{translate('selectBusinessDivision', language)}</option>
                              {businessSelection.map((division) => (
                                <option key={division.business_division_id} value={division.business_division_id}>
                                  {division.business_division_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className='projectsRegistration-dispatch-labor-expense-div'>
                          <label className='projectsRegistration-dispatch-labor-expense'>
                            {translate('dispatchLaborExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='dispatch_labor_expense'
                            value={formatNumberWithCommas(form.dispatch_labor_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        </div>
                        <div className='projectsRegistration-operating-income-div'>
                          <label className='projectsRegistration-operating-income'>
                            {translate('operatingIncome', language)}
                          </label>
                          <input
                            type='text'
                            name='operating_income'
                            value={formatNumberWithCommas(form.operating_income)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            disabled
                          />
                        </div>
                        <div className='projectsRegistration-ordinary-income-div'>
                          <label className='projectsRegistration-ordinary-income'>
                            {translate('ordinaryIncome', language)}
                          </label>
                          <input
                            type='text'
                            name='ordinary_profit'
                            value={formatNumberWithCommas(form.ordinary_profit)}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    {/* //for testing and will be removed it not used for future use */}
                    {/* <input type='hidden' name='registered_user_id' value={form.registered_user_id} />  */}
                  </div>
                ))}
              </div>
              <div className='projectsRegistration-lower-form-cont'>
                <div className='projectsRegistration-form-content'>
                  <div className='projectsRegistration-plus-btn'>
                    {formProjects.length >= 2 ? (
                      <button className='projectsRegistration-dec' type='button' onClick={handleRemove}>
                        -
                      </button>
                    ) : (
                      <div className='projectsRegistration-dec-empty'></div>
                    )}
                    <button
                      className='projectsRegistration-inc custom-disabled'
                      type='button'
                      onClick={handleAdd}
                      disabled={formProjects.length === maximumEntries}
                    >
                      +
                    </button>
                  </div>
                  <div className='projectsRegistration-options-btn'>
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
      <CrudModal
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
        isCRUDOpen={isModalOpen}
        validationMessages={crudValidationErrors}
      />
      <AlertModal
        isOpen={isOverwriteModalOpen}
        onCancel={() => setIsOverwriteModalOpen(false)}
        onConfirm={handleOverwriteConfirmation}
        message={modalMessage}
      />
      <AlertModal
        isOpen={isNonActiveOpen}
        onConfirm={handleNonActiveConfirm}
        onCancel={() => setIsNonActiveOpen(false)}
        message={translate('nonActiveMessage', language)}
      />
    </div>
  )
}

export default ProjectsRegistration
