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
import { overwriteProjectSalesResult } from '../../api/ProjectSalesResultsEndpoint/OverwriteProjectSalesResults'
import { getProject } from '../../api/ProjectsEndpoint/GetProject'
import { maximumEntries, monthNames, months, resultsScreenTabs, token, years, ACCESS_TOKEN } from '../../constants'
import { addFormInput, closeModal, openModal } from '../../actions/hooks'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import {
  handleDisableKeysOnNumberInputs,
  formatNumberWithCommas,
  formatNumberWithDecimal,
  removeCommas,
  sortByFinancialYear,
  handleGeneralResultsInputChange,
  handleResultsRegTabsClick,
  setupIdleTimer,
} from '../../utils/helperFunctionsUtil'
import { MAX_NUMBER_LENGTH } from '../../constants'
import { useAlertPopup, checkAccessToken, handleTimeoutConfirm } from "../../routes/ProtectedRoutes";

type Project = {
  client: string
  client_name: string
  project_id: string
  project_name: string
  project_type: string
  business_division: string
}
type Projects = {
  projects: Project[]
}
type Clients = {
  clients: Client[]
}

type Client = {
  client_id: string
  client_name: string
}
type Divisions = {
  divisions: Division[]
}

type Division = {
  business_division_id: string
  business_division_name: string
}
type FilterParams = {
  month?: string
  year?: string
}
const ProjectSalesResultsRegistration = () => {
  const [activeTab, setActiveTab] = useState('/results')
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [clients, setClients] = useState<any>([])
  const [clientsFilter, setClientsFilter] = useState<Clients[]>([{ clients: [] }])
  const [selectedClient, setSelectedClient] = useState([])
  const [businessSelection, setBusinessSelection] = useState<any>([])
  const [businessDivisionFilter, setBusinessDivisionFilter] = useState<Divisions[]>([{ divisions: [] }])
  const [filteredMonth, setFilteredMonth] = useState<any>([{ month: [] }])
  const [projectYear, setProjectYear] = useState<any>([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [projectDataResult, setProjectDataResult] = useState<any>([])
  const [projectList, setProjectsList] = useState<Projects[]>([{ projects: [] }])
  const [projectListSelection, setProjectsListSelection] = useState<Projects[]>([{ projects: [] }])
  const [enable, setEnabled] = useState(false)
  const dispatch = useDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false)
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false)
  const onTabClick = (tab) => handleResultsRegTabsClick(tab, navigate, setActiveTab)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const { showAlertPopup, AlertPopupComponent } = useAlertPopup()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const emptyFormData = {
    id: 1,
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
  const uniqueYears = projectYear.reduce((acc, item) => {
    if (!acc.includes(item.year)) {
      acc.push(item.year)
    }
    return acc
  }, [])
const handleAdd = () => {
    addFormInput(formProjects, setProjects, maximumEntries, emptyFormData)
    setProjectsListSelection([...projectListSelection, { projects: [] }])
    setClientsFilter([...clientsFilter, { clients: [] }])
    setProjectsList([...projectList, { projects: [] }])
    setBusinessDivisionFilter([...businessDivisionFilter, { divisions: [] }])
    setFilteredMonth([...filteredMonth, { month: [] }])
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

  const handleChange = (index, event) => {
    const { name, value } = event.target

    const rawValue = removeCommas(value)

    const nonFinancialValuesArray = ['year', 'month']

    if (!nonFinancialValuesArray.includes(name)) {
      if (rawValue.length > MAX_NUMBER_LENGTH) {
        return
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
      const { sales_revenue, indirect_employee_expense, dispatch_labor_expense, employee_expense, expense, non_operating_income, non_operating_expense} = updatedProjects[index];
      const operating_income_ = parseFloat(sales_revenue) - 
                                (
                                  (parseFloat(indirect_employee_expense)  || 0) +
                                  (parseFloat(dispatch_labor_expense)     || 0) +
                                  (parseFloat(employee_expense)           || 0) +
                                  (parseFloat(expense)                    || 0)
                                );
      updatedProjects[index].operating_income = operating_income_.toString();
      const _ordinary_profit = operating_income_ + parseFloat(non_operating_income) - parseFloat(non_operating_expense)
      updatedProjects[index].ordinary_profit = _ordinary_profit.toString();
      const _ordinary_profit_margin = (_ordinary_profit / parseFloat(sales_revenue)) * 100
      updatedProjects[index].ordinary_profit_margin = _ordinary_profit_margin.toFixed(2);
    }
    setProjects(updatedProjects)

    setProjects((prevFormProjects) => {
      return prevFormProjects.map((form, i) => {
        if (i === index) {
          const resetFields = {
            year: ['month', 'project_name', 'client', 'business_division'],
            month: ['project_name', 'client', 'business_division'],
            project_name: ['client', 'business_division'],
          }
          let month = form.month
          if (name == 'year' && value == '') {
            form.month = ''
            setFilteredMonth((prev) => {
              return prev.map((eachMonth, monthIndex) => {
                if (index == monthIndex) {
                  return [{}]
                }
                return eachMonth
              })
            })
          }
          const fieldsToReset = resetFields[name] || []
          const resetValues = fieldsToReset.reduce((acc, field) => {
            acc[field] = ''
            return acc
          }, {})

          return {
            ...form,
            [name]: rawValue,
            ...resetValues,
          }
        }
        return form
      })
    })
  }

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

    const getRelatedProjectIDs = projectList.flatMap((projects) =>
      projects.projects.map((project) => ({
        project: project.project_id,
        client: project.client,
        business_division: project.business_division,
      })),
    )

    const projectsData = formProjects.map((projects) => ({
      year: projects.year,
      month: projects.month,
      project_name: projects.project_name,
      sales_revenue: projects.sales_revenue,
      dispatch_labor_expense: projects.dispatch_labor_expense,
      employee_expense: projects.employee_expense,
      indirect_employee_expense: projects.indirect_employee_expense,
      expense: projects.expense,
      operating_income: projects.operating_income,
      non_operating_income: projects.non_operating_income,
      non_operating_expense: projects.non_operating_expense,
      ordinary_profit: projects.ordinary_profit,
      ordinary_profit_margin: projects.ordinary_profit_margin,
    }))

    // Defines Object for validation
    let combinedObject = formProjects.map(() => ({
      year: '',
      month: '',
      project_name: '',
      // project: '',
      type: '',
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
    }))

    // Combines the data from related "project", "client", "business division" and adds data to object
    const updatedCombinedObject = combinedObject.map((item, index) => {
      const relatedProject = getRelatedProjectIDs[index] || {} // Get the related project for this index
      return {
        ...item,
        ...projectsData[index], // Merge form data
        ...relatedProject, // Merge project details if available
      }
    })

    // Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'projectResults'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateProjects = (records) => validateRecords(records, fieldChecks, 'projectResults')

    // Step 2: Validate client-side input
    const validationErrors = validateProjects(updatedCombinedObject)
    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month', 'project_name', 'business_division', 'client']
    const duplicateErrors = checkForDuplicates(updatedCombinedObject, uniqueFields, 'project', language)

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
      // setModalIsOpen(true)

      return
    } else {
      setCrudValidationErrors([])
    }
    // Continue with submission if no errors

    createProjectSalesResults(updatedCombinedObject, token)
      .then(() => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setProjects([emptyFormData])
        setProjectsListSelection([{ projects: [] }])
        setClientsFilter([{ clients: [] }])
        setProjectsList([{ projects: [] }])
        setBusinessDivisionFilter([{ divisions: [] }])
      })
      .catch((error) => {
        const existingEntries = error.response.data
        let projectNamesArray = []

        existingEntries.conflicts.forEach((conflict) => {
          if (conflict.project_name && Array.isArray(conflict.project_name)) {
            conflict.project_name.forEach((entry) => {
              projectNamesArray.push(entry.project_name)
            })
          }
        })

        let message = translate('alertMessageAboveProjectSalesResult', language).replace(
          '${existingEntries}',
          projectNamesArray.join(', '),
        )
        setModalMessage(message)
        setIsOverwriteModalOpen(true)
        return // Exit the function to wait for user input
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
    const getRelatedProjectIDs = projectList.flatMap((projects) =>
      projects.projects.map((project) => ({
        project: project.project_id,
        client: project.client,
        business_division: project.business_division,
      })),
    )

    const projectsData = formProjects.map((projects) => ({
      year: projects.year,
      month: projects.month,
      project_name: projects.project_name,
      sales_revenue: projects.sales_revenue,
      dispatch_labor_expense: projects.dispatch_labor_expense,
      employee_expense: projects.employee_expense,
      indirect_employee_expense: projects.indirect_employee_expense,
      expense: projects.expense,
      operating_income: projects.operating_income,
      non_operating_income: projects.non_operating_income,
      non_operating_expense: projects.non_operating_expense,
      ordinary_profit: projects.ordinary_profit,
      ordinary_profit_margin: projects.ordinary_profit_margin,
    }))

    // Defines Object for validation
    let combinedObject = formProjects.map(() => ({
      year: '',
      month: '',
      project_name: '',
      // project: '',
      type: '',
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
    }))

    // Combines the data from related "project", "client", "business division" and adds data to object
    const updatedCombinedObject = combinedObject.map((item, index) => {
      const relatedProject = getRelatedProjectIDs[index] || {} // Get the related project for this index
      return {
        ...item,
        ...projectsData[index], // Merge form data
        ...relatedProject, // Merge project details if available
      }
    })
    overwriteProjectSalesResult(updatedCombinedObject, token)
      .then(() => {
        setModalMessage(translate('overWrite', language))
        setIsModalOpen(true)
        setProjects([
          {
            id: 1,
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
        setProjectsListSelection([{ projects: [] }])
        setClientsFilter([{ clients: [] }])
        setProjectsList([{ projects: [] }])
        setBusinessDivisionFilter([{ divisions: [] }])
      })
      .catch((error) => {
        console.error('Error overwriting data:', error)
      })
      .finally(() => {
        setIsOverwriteConfirmed(false)
      })
  }
  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const handleListClick = () => {
    navigate('/project-sales-results-list')
  }

  const fetchGetProject = async () => {
    getProject(localStorage.getItem(ACCESS_TOKEN))
      .then((data) => {
        console.table(data);
        setProjectYear(data)
      })
      .catch((error) => {
        console.log(' error fetching project sales results data: ' + error)
      })
  }

  useEffect(() => {
    checkAccessToken(setIsAuthorized).then(result => {
      if (!result) {
        showAlertPopup(handleTimeoutConfirm);
      } else {
        fetchDivision()
        fetchClients()
        formProjects.forEach((project, index) => {
          const month = project.month || null
          const year = project.year || null
          const projectId = project.project_name || null
          if (month !== null || year !== null || projectId !== null) {
            const filterParams = {
              ...(month !== null && { month }),
              ...(year !== null && { year }),
              ...(projectId !== null && { projectId }),
            }
            if (filterParams.year) {
              getFilteredProjectSalesResults(filterParams, localStorage.getItem(ACCESS_TOKEN))
                .then((data) => {
                  const uniqueData = data.filter(
                    (item, index, self) =>
                      index === self.findIndex((t) => t.month === item.month)
                  );
                  setFilteredMonth((prev) => {
                    return prev.map((month, monthIndex) => {
                      if (index == monthIndex) {
                        return { month: uniqueData }
                      }
                      return month
                    })
                  })
                })
            }
            if (filterParams.year && filterParams.month && filterParams.projectId) {
              getFilteredProjectSalesResults(filterParams, localStorage.getItem(ACCESS_TOKEN))
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
                  setBusinessDivisionFilter((prev) => {
                    return prev.map((row, projectIndex) => {
                      if (index == projectIndex) {
                        return {
                          divisions: matchedBusinessDivision,
                        }
                      }
                      return row
                    })
                  })
                  setClientsFilter((prev) => {
                    return prev.map((row, projectIndex) => {
                      if (index == projectIndex) {
                        return {
                          clients: matchedClients,
                        }
                      }
                      return row
                    })
                  })
                  setProjectsList((prev) => {
                    return prev.map((row, projectIndex) => {
                      if (index == projectIndex) {
                        return {
                          projects: data,
                        }
                      }
                      return row
                    })
                  })
                  setProjectDataResult(data)
                })
                .catch((error) => {
                  console.error('Error fetching project sales result list:', error)
                })
            } else if (filterParams.year && filterParams.month) {
              setEnabled(true)
              getFilteredProjectSalesResults(filterParams, localStorage.getItem(ACCESS_TOKEN)).then((data) => {
                setProjectsListSelection((prev) => {
                  return prev.map((row, projectIndex) => {
                    if (index == projectIndex) {
                      return {
                        projects: data,
                      }
                    }
                    return row
                  })
                })
                setBusinessDivisionFilter((prev) => {
                  return prev.map((row, projectIndex) => {
                    if (index == projectIndex) {
                      return {
                        divisions: [],
                      }
                    }
                    return row
                  })
                })
                setClientsFilter((prev) => {
                  return prev.map((row, projectIndex) => {
                    if (index == projectIndex) {
                      return {
                        clients: [],
                      }
                    }
                    return row
                  })
                })
                setProjectsList((prev) => {
                  return prev.map((row, projectIndex) => {
                    if (index == projectIndex) {
                      return {
                        projects: [],
                      }
                    }
                    return row
                  })
                })
                setProjectDataResult(data)
              })
              console.log(projectListSelection)
            } else {
              setEnabled(false)
            }
          }
        })
        fetchGetProject()
      }
    });
  }, [token, formProjects])

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
              activeTabOther={'projectSalesResults'}
              message={translate('projectsSalesResultsRegistration', language)}
              handleTabsClick={onTabClick}
              handleListClick={handleListClick}
              buttonConfig={resultsScreenTabs}
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
                          {/* LEFT COLUMN */}
                          <label className='projectSalesResultsRegistration_year'>{translate('year', language)}</label>
                          <select
                            className='projectSalesResultsRegistration_select-option'
                            name='year'
                            value={form.year}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectYear', language)}</option>
                            {uniqueYears.map((year, idx) => (
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
                            {projectList?.[index]?.projects?.map((project, index) => (
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
                            type='text'
                            name='sales_revenue'
                            value={formatNumberWithCommas(form.sales_revenue)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_employee-expenses-div'>
                          <label className='projectSalesResultsRegistration_employee-expenses'>
                            {translate('employeeExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='employee_expense'
                            value={formatNumberWithCommas(form.employee_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_non-operating-income-div'>
                          <label className='projectSalesResultsRegistration_non-operating-income'>
                            {translate('nonOperatingIncome', language)}
                          </label>
                          <input
                            type='text'
                            name='non_operating_income'
                            value={formatNumberWithCommas(form.non_operating_income)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_ordinary-income-margin-div'>
                          <label className='projectSalesResultsRegistration_ordinary-income-margin'>
                            {translate('ordinaryIncomeProfitMargin', language)}
                          </label>
                          <input
                            type='text'
                            name='ordinary_profit_margin'
                            value={formatNumberWithDecimal(form.ordinary_profit_margin)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            disabled
                          />
                        </div>
                      </div>
                      {/* MIDDLE COLUMN */}
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
                            <option value=''>{translate('selectMonth', language)}</option>
                            {sortByFinancialYear(filteredMonth[index]?.month || []).map((month, idx) => (
                              <option key={idx} value={month.month}>
                                {language === 'en' ? monthNames[month.month].en : monthNames[month.month].jp}
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
                            {clientsFilter?.[index]?.clients?.map((client, index) => (
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
                            type='text'
                            name='indirect_employee_expense'
                            value={formatNumberWithCommas(form.indirect_employee_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_expense-div'>
                          <label className='projectSalesResultsRegistration_expense'>
                            {translate('expense', language)}
                          </label>
                          <input
                            type='text'
                            name='expense'
                            value={formatNumberWithCommas(form.expense)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_non-operating-expense-div'>
                          <label className='projectSalesResultsRegistration_non-operating-expense'>
                            {translate('nonOperatingExpense', language)}
                          </label>
                          <input
                            type='text'
                            name='non_operating_expense'
                            value={formatNumberWithCommas(form.non_operating_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                          />
                        </div>
                      </div>
                      {/* RIGHT COLUMN */}
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
                              <option value=''>{translate('selectProject', language)}</option>
                              {projectListSelection[index]?.projects?.map((project, index) => (
                                <option key={index} value={project.project_id} title={project.client_name}>
                                  {project.project_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              className='projectSalesResultsRegistration_select-option inactiveInput'
                              name='project_name'
                              value={formatNumberWithCommas(form.project_name)}
                              onChange={(e) => handleChange(index, e)}
                              disabled
                            >
                              <option value=''></option>
                              {projectList?.[index]?.projects?.map((project, index) => (
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
                              value={formatNumberWithCommas(form.business_division)}
                              onChange={(e) => handleChange(index, e)}
                              disabled
                            >
                              {businessDivisionFilter?.[index]?.divisions?.map((division, index) => (
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
                            type='text'
                            name='dispatch_labor_expense'
                            value={formatNumberWithCommas(form.dispatch_labor_expense)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_operating-income-div'>
                          <label className='projectSalesResultsRegistration_operating-income'>
                            {translate('operatingIncome', language)}
                          </label>
                          <input
                            type='text'
                            name='operating_income'
                            value={formatNumberWithCommas(form.operating_income)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
                            disabled
                          />
                        </div>
                        <div className='projectSalesResultsRegistration_ordinary-income-div'>
                          <label className='projectSalesResultsRegistration_ordinary-income'>
                            {translate('ordinaryIncome', language)}
                          </label>
                          <input
                            type='text'
                            name='ordinary_profit'
                            value={formatNumberWithCommas(form.ordinary_profit)}
                            onChange={(e) => handleChange(index, e)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onKeyDown={handleDisableKeysOnNumberInputs}
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
              <div className='projectSalesResultsRegistration_lower_form_cont'>
                <div className='projectSalesResultsRegistration_form-content'>
                  <div className='projectSalesResultsRegistration_plus-btn'>
                    {formProjects.length >= 2 ? (
                      <button className='projectSalesResultsRegistration_dec' type='button' onClick={handleMinus}>
                        -
                      </button>
                    ) : (
                      <div className='projectSalesResultsRegistration_dec_empty'></div>
                    )}
                    <button
                      className='projectSalesResultsRegistration_inc custom-disabled'
                      type='button'
                      onClick={handleAdd}
                      disabled={formProjects.length === maximumEntries}
                    >
                      +
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
      <AlertPopupComponent />
    </div>
  )
}

export default ProjectSalesResultsRegistration
