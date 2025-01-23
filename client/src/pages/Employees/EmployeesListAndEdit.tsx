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
import CrudModal from "../../components/CrudModal/CrudModal";
import '../../assets/scss/Components/SliderToggle.scss'
import { updateEmployee } from "../../api/EmployeeEndpoint/UpdateEmployee";
import { getSelectedBusinessDivisionCompany } from "../../api/BusinessDivisionEndpoint/GetSelectedBusinessDivisionCompany";
import { deleteEmployee } from "../../api/EmployeeEndpoint/DeleteEmployee";
import { editEmployee } from "../../api/EmployeeEndpoint/EditEmployee";
import { getEmployee } from "../../api/EmployeeEndpoint/GetEmployee";
import { getUser } from "../../api/UserEndpoint/GetUser";
import {
  validateEmployeeRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import { handleDisableKeysOnNumberInputs, formatDate, formatNumberWithCommas, removeCommas} from '../../utils/helperFunctionsUtil'
import { MAX_NUMBER_LENGTH, MAX_SAFE_INTEGER } from "../../constants";


const EmployeesListAndEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('employee')
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const select = [5, 10, 100]
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isEditing, setIsEditing] = useState(false)
  const [employeesList, setEmployeesList] = useState([])
  const [originalEmployeesList, setOriginalEmployeesList] = useState(employeesList)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [businessSelection, setBusinessSelection] = useState<any>([])
  const [companySelection, setCompanySelection] = useState<any>([])
  const [deleteId, setDeleteEmployeeId] = useState([])
  const dispatch = useDispatch()
  const totalPages = Math.ceil(100 / 10)
  const [allBusinessDivisions, setAllBusinessDivisions] = useState([])
  const token = localStorage.getItem('accessToken')
  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [selectedEmployeeType, setSelectedEmployeeType] = useState([])
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [userMap, setUserMap] = useState({})
  const [deleteComplete, setDeleteComplete] = useState(false)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'client':
        navigate('/clients-list')
        break
      case 'employee':
        navigate('/employees-list')
        break
      case 'businessDivision':
        navigate('/business-divisions-list')
        break
      case 'users':
        navigate('/users-list')
        break
      default:
        break
    }
  }

  const fetchData = async () => {
    try {
      const resMasterCompany = await dispatch(fetchMasterCompany() as unknown as UnknownAction)
      setCompanySelection(resMasterCompany.payload)
      if (isEditing) {
        editEmployee(token)
          .then((data) => {
            const businessDivisions = data.reduce((acc, item) => acc.concat(item.business_divisions), [])
            setBusinessSelection(businessDivisions)
            // Ensure employeesList is set from the fetched employee data if necessary
            const fetchedEmployeesList = data // or transform response as needed
            setEmployeesList(fetchedEmployeesList)
          })
          .catch((error) => {
            console.error(error.message)
          })
      } else {
        const resBusinessDivisions = await dispatch(fetchBusinessDivisions() as unknown as UnknownAction)
        setBusinessSelection(resBusinessDivisions.payload)
      }
    } catch (e) {
      console.error(e)
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
    setIsEditing((prevState) => !prevState)
  }

  useEffect(() => {
    if (isEditing) {
      setLanguage('jp') 
    }
  }, [isEditing])

  const handleChange = (index, e) => {
    
    const { name, value } = e.target
    // Remove commas to get the raw number
    // EG. 999,999 → 999999 in the DB
    const rawValue = removeCommas(value)

    if (name === 'salary' || name === 'executive_renumeration' || name === 'bonus_and_fuel_allowance') {
      console.log('name',name, 'value:', rawValue, 'length', rawValue.length)

      if (rawValue.length > MAX_NUMBER_LENGTH) {
        console.log('rawValue.length > MAX_NUMBER_LENGTH:', rawValue.length > MAX_NUMBER_LENGTH, rawValue.length)
        return
      }

      if (rawValue.length <= MAX_NUMBER_LENGTH && rawValue <= MAX_SAFE_INTEGER) {
      }
    }

    setEmployeesList((prevState) => {
      const updatedEmployeeData = [...prevState]

      // const rawValue = removeCommas(value)

      const previousEmployee = prevState[index].employee
      const updatedEmployee = { ...previousEmployee, [name]: rawValue }

      // Calculate non-editable fields based on type and salary or executive_renumeration
      if (name === 'salary' || name === 'executive_renumeration') {
        const baseValue = name === 'salary' ? Number(rawValue) : Number(updatedEmployee.executive_renumeration)
        updatedEmployee.statutory_welfare_expense = Math.round(baseValue * 0.1451).toString()
        updatedEmployee.welfare_expense = Math.round(baseValue * 0.0048).toString()
        updatedEmployee.insurance_premium = Math.round(baseValue * 0.0224).toString()
      }

      const changes = {}

      for (const key in updatedEmployee) {
        if (updatedEmployee[key] !== previousEmployee[key]) {
          changes[key] = updatedEmployee[key]
        }
      }

      updatedEmployeeData[index] = {
        ...updatedEmployeeData[index],
        employee: updatedEmployee,
      }

      if (name === 'company') {
        const selectedCompany = companySelection.find((company) => company.company_id === value)
        const selectedCompanyName = selectedCompany ? selectedCompany.company_name : ''

        updatedEmployeeData[index] = {
          ...updatedEmployeeData[index],
          employee: {
            ...updatedEmployeeData[index].employee,
            company_id: value,
            company: selectedCompanyName,
            business_division_id: null,
          },
          business_divisions: [],
          businessSelection: [],
        }

        setEmployeesList(updatedEmployeeData)

        getSelectedBusinessDivisionCompany(value, token)
          .then((data) => {
            const employeeBusinessDivisions = data.filter(
              (division) => division.employee_id === updatedEmployeeData[index].employee_id,
            )

            setEmployeesList((prevState) => {
              const updatedEmployeeDataAfterFetch = [...prevState]
              updatedEmployeeDataAfterFetch[index].business_divisions = employeeBusinessDivisions
              updatedEmployeeDataAfterFetch[index].businessSelection = employeeBusinessDivisions.length
                ? employeeBusinessDivisions
                : []
              updatedEmployeeDataAfterFetch[index].employee.business_division_id =
                employeeBusinessDivisions[0]?.business_division_id || null
              return updatedEmployeeDataAfterFetch
            })
          })
          .catch((error) => {
            console.error('Error fetching business divisions:', error)
          })
      } else if (name === 'business_division') {
        updatedEmployeeData[index].employee.business_division_id = value
      } else {
        updatedEmployeeData[index].employee[name] = rawValue
      }

      return updatedEmployeeData
    })
  }

  const handleSubmit = async () => {
    const emails = employeesList.map((em) => em.email)

    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'employees'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    console.log('fieldChecks', fieldChecks)

    // The format of the records from ListAndEditScreen is slightly different.
    // This gets the employee object from each record and returns an Array of employees.
    const employees = employeesList.map((record) => record.employee)

    // Validate records for the specified project fields
    const validateEmployees = (records) => validateEmployeeRecords(records, fieldChecks, 'employee')

    // Step 2: Validate client-side input
    const validationErrors = validateEmployees(employees) // Only one User can be registered but function expects an Array.
    console.log('Employees in List/Edit Screen: ', employees)
    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['email']
    const duplicateErrors = checkForDuplicates(employees, uniqueFields, 'employee', language)

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
      console.log(translatedErrors, 'trans errors')
      setCrudMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsCRUDOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }

    const getModifiedFields = (original, updated) => {
      const modifiedFields = {}

      updated.forEach((updatedEmployee, index) => {
        const originalEmployee = original.find(
          (emp) => emp.employee.employee_id === updatedEmployee.employee.employee_id,
        )

        if (originalEmployee) {
          const changes = {
            employee: { employee_id: updatedEmployee.employee.employee_id }, // Ensure employee_id is always included
          }

          // Check for changes in the 'employee' object fields
          for (const key in updatedEmployee.employee) {
            if (
              originalEmployee.employee[key] !== undefined &&
              updatedEmployee.employee[key] !== originalEmployee.employee[key]
            ) {
              changes.employee[key] = updatedEmployee.employee[key]
            }
          }

          // Check for changes in 'business_divisions' or 'businessSelection' fields
          if (
            JSON.stringify(originalEmployee.business_divisions) !== JSON.stringify(updatedEmployee.business_divisions)
          ) {
            changes['business_divisions'] = updatedEmployee.business_divisions
          }

          if (
            JSON.stringify(originalEmployee.businessSelection) !== JSON.stringify(updatedEmployee.businessSelection)
          ) {
            changes['businessSelection'] = updatedEmployee.businessSelection
          }

          if (
            Object.keys(changes.employee).length > 1 ||
            'business_divisions' in changes ||
            'businessSelection' in changes
          ) {
            modifiedFields[index] = changes
          }
        }
      })

      return modifiedFields
    }

    const modifiedFields = getModifiedFields(originalEmployeesList, employeesList)
    console.log(modifiedFields)
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    updateEmployee(modifiedFields, token)
      .then(() => {
        setOriginalEmployeesList(employeesList)
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response) {
          const { status, data } = error.response
          switch (status) {
            case 409:
              setCrudMessage(translate('emailExistsMessage', language))
              setIsCRUDOpen(true)
              break
            case 401:
              console.error('Validation error:', data)
              window.location.href = '/login'
              break
            default:
              console.error('There was an error creating the employee data!', error)
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

  const fetchEmployees = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login' // Redirect to login if no token found
      return
    }

    // Fetch users
    getUser(token)
    .then((data) => {
      const users = data
      const userMapping = users.reduce((map, user) => {
        map[user.id] = user.last_name + ' ' + user.first_name
        return map
      }, {})
      setUserMap(userMapping)
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        console.log(error)
      } else {
        console.error('There was an error fetching the projects!', error)
      }
    })

    try {
      const url = isEditing ? await editEmployee(token) : await getEmployee(token)
      const employeesListWithBusinessSelection = url.map((employee) => ({
        ...employee,
        businessSelection: [], // Initialize businessSelection as an empty array
      }))
      setEmployeesList(employeesListWithBusinessSelection)
      setOriginalEmployeesList(employeesListWithBusinessSelection)
      // Update business divisions for each employee
      employeesListWithBusinessSelection.forEach((employee, index) => {
        getSelectedBusinessDivisionCompany(employee.company_id, token)
          .then((data) => {
            const employeeBusinessDivisions = data.filter((division) => division.employee_id === employee.employee_id)
            const updatedEmployeesList = [...employeesListWithBusinessSelection]
            updatedEmployeesList[index].businessSelection = employeeBusinessDivisions
            setEmployeesList(updatedEmployeesList)
          })
          .catch((error) => {
            console.error('Error fetching business divisions:', error)
          })
      })
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login' // Redirect to login if unauthorized
      } else {
        console.error('There was an error fetching the projects!', error)
      }
    }
  }

  useEffect(() => {
    fetchEmployees()
    if (isEditing) {
      fetchData()
    }

    //test type value is being returned
    const types = employeesList.map((item) => {
      return [item]
    })
  }, [isEditing])

  // useEffect(() => {
  //   const startIndex = currentPage * rowsPerPage
  //   setPaginatedData(projects.slice(startIndex, startIndex + rowsPerPage))
  // }, [currentPage, rowsPerPage, projects])

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

  const openModal = (employee, id) => {
    setSelectedProject(employee)
    setModalIsOpen(true)
    setDeleteEmployeeId(id)
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

    deleteEmployee(deleteId, token)
      .then(() => {
        updateEmployeeLists(deleteId)
        // setEmployeesList((prevList) => prevList.filter((employee) => employee.employee_id !== deleteId))
        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('Error deleting project:', error)
        }
      })
  }

  // Set the Lists to match the DB after deletion.

  // Step #2
  const updateEmployeeLists = (deleteId) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    setOriginalEmployeesList((prevList) => prevList.filter((employee) => employee.employee_id !== deleteId))
    setDeleteComplete(true)
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      // original list has deleted the record with deleteID
      // The updated list used on Edit screen goes back to matching orginal list.
      setEmployeesList(originalEmployeesList)
    }
  }, [deleteComplete])

  const handleNewRegistrationClick = () => {
    navigate('/employees-registration')
  }

  const handleEmployeeTypePulldown = (index, e) => {
    const { name, value } = e.target // Assuming `name` is 'type' and `value` is 0 or 1
    setEmployeesList((prevState) => {
      const updatedEmployeeData = [...prevState]
      const previousEmployee = prevState[index].employee

      const updatedEmployee = {
        ...previousEmployee,
        [name]: value, // Update the type
        salary: value === '0' ? previousEmployee.salary : null, // Clear if not regularEmployee
        executive_renumeration: value === '1' ? previousEmployee.executive_renumeration : null, // Clear if not executiveEmployee
      }

      // Recalculate non-editable fields based on updated value
      const baseValue = value === '0' ? Number(updatedEmployee.salary) : Number(updatedEmployee.executive_renumeration)
      updatedEmployee.statutory_welfare_expense = Math.round(baseValue * 0.1451).toString() || ''
      updatedEmployee.welfare_expense = Math.round(baseValue * 0.0048).toString() || ''
      updatedEmployee.insurance_premium = Math.round(baseValue * 0.0224).toString() || ''

      updatedEmployeeData[index] = {
        ...updatedEmployeeData[index],
        employee: updatedEmployee,
      }

      return updatedEmployeeData
    })
  }

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
            <div className='EmployeesListAndEdit_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'employeesEdit' : 'employeesList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'client', tabKey: 'client' },
                  { labelKey: 'employee', tabKey: 'employee' },
                  { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                  { labelKey: 'users', tabKey: 'users' },
                ]}
              />
              <div className={`EmployeesListAndEdit_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`EmployeesListAndEdit_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className={`table ${isEditing ? 'is-editing' : 'is-hoverable'} is-bordered`}>
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
                                  {translate('type', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('salary', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('executiveRenumeration', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-left'>
                                  {translate('companyName', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-left'>
                                  {translate('businessDivision', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('bonusAndFuelAllowance', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('statutoryWelfareExpense', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('welfareExpense', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('insurancePremium', language)}
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
                              {employeesList.map((item, employeeIndex) => {
                                // Destructure the `employee` from each item in the list
                                const employee = item.employee
                                // Ensure `employee` is defined before trying to access its properties
                                if (!employee) return null
                                return (
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
                                        className='edit_input email'
                                        type='text'
                                        name='email'
                                        value={employee.email}
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <select
                                        className='edit-select'
                                        name='type'
                                        value={employee.type}
                                        onChange={(e) => handleEmployeeTypePulldown(employeeIndex, e)}
                                      >
                                        <option value={0}>{translate('regularEmployee', language)}</option>
                                        <option value={1}>{translate('executiveEmployee', language)}</option>
                                      </select>
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='edit_input'
                                        type='text'
                                        name='salary'
                                        value={
                                          ((employee.type === 0 || employee.type === '0') &&
                                            formatNumberWithCommas(employee.salary).toString()) ||
                                          ''
                                        }
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={employee.type.toString() !== '0'}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='edit_input'
                                        type='text'
                                        name='executive_renumeration'
                                        value={
                                          ((employee.type === 1 || employee.type === '1') &&
                                            formatNumberWithCommas(employee.executive_renumeration).toString()) ||
                                          ''
                                        }
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={employee.type.toString() !== '1'}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_select'>
                                      <select
                                        className='edit_select'
                                        name='company'
                                        value={employeesList[employeeIndex]?.employee.company_id} // Correctly bind the value
                                        onChange={(e) => handleChange(employeeIndex, e)} // Trigger state update on change
                                      >
                                        {companySelection.map((company) => (
                                          <option key={company.company_id} value={company.company_id}>
                                            {company.company_name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_select'>
                                      <select
                                        className='edit_select'
                                        name='business_division'
                                        value={employee.business_division_id || ''} // Ensure the correct value is set for editing mode
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                      >
                                        {item.business_divisions.map((division) => (
                                          <option
                                            key={division.business_division_id}
                                            value={division.business_division_id}
                                          >
                                            {division.business_division_name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='edit_input'
                                        type='text'
                                        name='bonus_and_fuel_allowance'
                                        value={formatNumberWithCommas(employee.bonus_and_fuel_allowance) || ''}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                      />
                                    </td>

                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='not-editable'
                                        type='text'
                                        name='statutory_welfare_expense'
                                        value={formatNumberWithCommas(employee.statutory_welfare_expense) || ''}
                                        readOnly
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='not-editable'
                                        type='text'
                                        name='welfare_expense'
                                        value={formatNumberWithCommas(employee.welfare_expense) || ''}
                                        readOnly
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='not-editable'
                                        type='text'
                                        name='insurance_premium'
                                        value={formatNumberWithCommas(employee.insurance_premium) || ''}
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                      {userMap[employee.auth_user_id]}
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
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className='EmployeesListAndEdit-table'>
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
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered type'>
                                  {translate('type', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('salary', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('executiveRenumeration', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('companyName', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('businessDivision', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('bonusAndFuelAllowance', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('statutoryWelfareExpense', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('welfareExpense', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('insurancePremium', language)}
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
                              {employeesList.map((employee, index) => (
                                <tr key={index} className='EmployeesListAndEdit_table_body_content_horizontal'>
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
                                  <td className='EmployeesListAndEdit_table_body_content_vertical type'>
                                    {translate(employee.type === 0 ? 'regularEmployee' : 'executiveEmployee', language)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {employee.type === 0 && formatNumberWithCommas(employee.salary)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {employee.type === 1 && formatNumberWithCommas(employee.executive_renumeration)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {employee.company}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {employee.business_division}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {formatNumberWithCommas(employee.bonus_and_fuel_allowance)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {formatNumberWithCommas(employee.statutory_welfare_expense)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {formatNumberWithCommas(employee.welfare_expense)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {formatNumberWithCommas(employee.insurance_premium)}
                                  </td>
                                  <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                    {userMap[employee.auth_user_id]}
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
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='EmployeesListAndEdit_is_editing_wrapper'>
                <div className='EmployeesListAndEdit_is_editing_cont'>
                  {isEditing ? (
                    <div className='EmployeesList_edit_submit_btn_cont'>
                      <button
                        className='EmployeesListAndEdit_edit_submit_btn'
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
        message={translate('deleteEmployeeMessage', language)}
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

export default EmployeesListAndEdit;
