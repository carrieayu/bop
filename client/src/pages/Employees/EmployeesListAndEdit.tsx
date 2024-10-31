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

  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [selectedEmployeeType, setSelectedEmployeeType] = useState([])

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
        const response = await axios.get(`http://127.0.0.1:8000/api/employees/edit/`, {
          // const response = await axios.get(`http://54.178.202.58:8000/api/employees/edit/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        const businessDivisions = response.data.reduce((acc, item) => acc.concat(item.business_divisions), [])
        setBusinessSelection(businessDivisions)
        // Ensure employeesList is set from the fetched employee data if necessary
        const fetchedEmployeesList = response.data // or transform response as needed
        setEmployeesList(fetchedEmployeesList)
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
    setIsEditing((prevState) => {
      const newEditingState = !prevState
      if (newEditingState) {
        setLanguage(initialLanguage)
      }

      return newEditingState
    })
  }

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/master-business-divisions/')
      // axios.get(`http://54.178.202.58:8000/api/master-business-divisions/`, {
      .then((response) => {
        setAllBusinessDivisions(response.data)
      })
      .catch((error) => {
        console.error('Error fetching business divisions:', error)
      })
  }, [])

  const handleChange = (index, e) => {
    const { name, value } = e.target

    setEmployeesList((prevState) => {
      const updatedEmployeeData = [...prevState]

      const previousEmployee = prevState[index].employee
      const updatedEmployee = { ...previousEmployee, [name]: value }

      // Calculate non-editable fields based on type and salary or executive_renumeration
      if (name === 'salary' || name === 'executive_renumeration') {
        const baseValue = name === 'salary' ? Number(value) : Number(updatedEmployee.executive_renumeration)
        updatedEmployee.statutory_welfare_expense = (baseValue * 0.1451).toFixed(2).toString()
        updatedEmployee.welfare_expense = (baseValue * 0.0048).toFixed(2).toString()
        updatedEmployee.insurance_premium = (baseValue * 0.0224).toFixed(2).toString()
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

        axios
          .get(`http://127.0.0.1:8000/api/business-divisions/?company_id=${value}`)
          .then((response) => {
            const employeeBusinessDivisions = response.data.filter(
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
        updatedEmployeeData[index].employee[name] = value
      }

      return updatedEmployeeData
    })
  }

  const validateEmployees = (employeesList, originalEmployees) => {

    return employeesList.every((item, index) => {
      const employee = item.employee
      const originalEmployee = originalEmployees[index]

      // Ensure salary and executive_renumeration are numbers or null
      const salary = employee.salary !== null ? parseInt(employee.salary, 10) : null
      const executiveRenumeration = employee.executive_renumeration !== null ? parseInt(employee.executive_renumeration, 10) : null
      // Validate name and email fields
      if (
        employee.last_name !== originalEmployee.employee.last_name ||
        employee.first_name !== originalEmployee.employee.first_name ||
        employee.email !== originalEmployee.employee.email
      ) {
        if (
          employee.last_name.trim() === '' ||
          employee.first_name.trim() === '' ||
          !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(employee.email)
        ) {
          return false // Invalid name or email
        }
      }
      // Validate based on employee type
      if (employee.type !== originalEmployee.employee.type) {
        if (employee.type === 0) {
          // Regular employee: salary should be valid, executive_renumeration should be null
          if (salary === null || isNaN(salary) || salary <= 0 || executiveRenumeration !== null) {
            return false // Invalid regular employee data
          }
        } else if (employee.type === 1) {
          // Executive employee: executive_renumeration should be valid, salary should be null
          if (
            executiveRenumeration === null ||
            isNaN(executiveRenumeration) ||
            executiveRenumeration <= 0 ||
            salary !== null
          ) {
            console.log('Invalid executive employee')
            return false // Invalid executive employee data
          }
        }
      }
      // If all validations pass, return true
      return true
    })
  }

  const handleSubmit = async () => {
    const emails = employeesList.map((em) => em.email)

    console.log(employeesList)
    if (!validateEmployees(employeesList, originalEmployeesList)) {
      setCrudMessage(translate('allFieldsRequiredInputValidationMessage', language))
      setIsCRUDOpen(true)
      return
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
    try {
      const response = await axios.put('http://127.0.0.1:8000/api/employees/update/', modifiedFields, {
        // const response = await axios.put('http://54.178.202.58:8000/api/employees/update/',  modifiedFields ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setOriginalEmployeesList(employeesList)
      setCrudMessage(translate('successfullyUpdated', language))
      setIsCRUDOpen(true)
      setIsEditing(false)
    } catch (error) {
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
    }
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

    try {
      const url = isEditing ? 'http://127.0.0.1:8000/api/employees/edit/' : 'http://127.0.0.1:8000/api/employees'
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to request headers
        },
      })

      const employeesListWithBusinessSelection = response.data.map((employee) => ({
        ...employee,
        businessSelection: [], // Initialize businessSelection as an empty array
      }))
      setEmployeesList(employeesListWithBusinessSelection)
      setOriginalEmployeesList(employeesListWithBusinessSelection)
      // Update business divisions for each employee
      employeesListWithBusinessSelection.forEach((employee, index) => {
        axios
          .get(`http://127.0.0.1:8000/api/business-divisions/?company_id=${employee.company_id}`)
          .then((response) => {
            const employeeBusinessDivisions = response.data.filter(
              (division) => division.employee_id === employee.employee_id,
            )
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

  const handleConfirm = async () => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/employees/${deleteId}/delete/`, {
        // const response = await axios.delete(`http://54.178.202.58:8000/api/employees/${deleteId}/delete/`, {
      })
      setEmployeesList((prevList) => prevList.filter((employee) => employee.employee_id !== deleteId))
      setCrudMessage(translate('successfullyDeleted', language))
      setIsCRUDOpen(true)
      setIsEditing(false)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login'
      } else {
        console.error('Error deleting project:', error)
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0') // Get month (0-indexed, so +1)
    const day = String(date.getDate()).padStart(2, '0') // Get day
    const year = date.getFullYear() // Get full year
    return `${month}/${day}/${year}`
  }

  const handleNewRegistrationClick = () => {
    navigate('/employees-registration')
  }

  const handleEmployeeTypePulldown = (employeeIndex, e) => {
    // Reset the values when switching employee type
    if (e.target.value === '0') {
      // Reset executive remuneration if switching to regular employee
      handleChange(employeeIndex, e)
      handleChange(employeeIndex, { target: { name: 'executive_renumeration', value: null } })
    } else if (e.target.value === '1') {
      // Reset salary if switching to executive employee
      handleChange(employeeIndex, { target: { name: 'salary', value: null } })
      handleChange(employeeIndex, e)
    }

    setSelectedEmployeeType((prevState) => [
      ...prevState, // Spread the previous state (the existing array) to preserve the previous items
      { employeeIndex, type: e.target.value }, // Add the new object to the array
    ])

    // Set the employee type to 0 (Regular) or 1 (Executive)
  }

  const handleStatutoryWelfare = (employeeIndex, e) => {
    // Reset the values when switching employee type
    if (e.target.value === '0') {
      // Reset executive remuneration if switching to regular employee
      handleChange(employeeIndex, e)
      handleChange(employeeIndex, { target: { name: 'executive_renumeration', value: null } })
    } else if (e.target.value === '1') {
      // Reset salary if switching to executive employee
      handleChange(employeeIndex, { target: { name: 'salary', value: null } })
      handleChange(employeeIndex, e)
    }

    setSelectedEmployeeType((prevState) => [
      ...prevState, // Spread the previous state (the existing array) to preserve the previous items
      { employeeIndex, type: e.target.value }, // Add the new object to the array
    ])
    // Set the employee type to 0 (Regular) or 1 (Executive)
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
                <button className='EmployeesListAndEdit_mode_switch' onClick={handleClick}>
                  {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                </button>
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
                                  {translate('type', language)}
                                </th>
                                <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('email', language)}
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
                                        className='edit_input email'
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
                                        value={employee.salary || ''}
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                        disabled={employee.type.toString() !== '0'}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='edit_input'
                                        type='number'
                                        name='executive_renumeration'
                                        value={employee.executive_renumeration || ''}
                                        onChange={(e) => handleChange(employeeIndex, e)}
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
                                        type='number'
                                        name='bonus_and_fuel_allowance'
                                        value={employee.bonus_and_fuel_allowance || ''}
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                      />
                                    </td>

                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='not-editable'
                                        type='text'
                                        name='statutory_welfare_expense'
                                        value={employee.statutory_welfare_expense || ''}
                                        onChange={(e) => handleStatutoryWelfare(employeeIndex, e)}
                                        readOnly
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='not-editable'
                                        type='text'
                                        name='welfare_expense'
                                        value={employee.welfare_expense || ''}
                                        onChange={(e) => handleStatutoryWelfare(employeeIndex, e)}
                                        readOnly
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical edit_td_input'>
                                      <input
                                        className='not-editable'
                                        type='number'
                                        name='insurance_premium'
                                        value={employee.insurance_premium || ''}
                                        onChange={(e) => handleChange(employeeIndex, e)}
                                      />
                                    </td>
                                    <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                      {employee.auth_user_id}
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
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered type'>
                                {translate('type', language)}
                              </th>
                              <th className='EmployeesListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('email', language)}
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
                                <td className='EmployeesListAndEdit_table_body_content_vertical type'>
                                  {translate(employee.type === 0 ? 'regularEmployee' : 'executiveEmployee', language)}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>{employee.email}</td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>{employee.salary}</td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.executive_renumeration}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>{employee.company}</td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.business_division}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.bonus_and_fuel_allowance}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.statutory_welfare_expense}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.welfare_expense}
                                </td>
                                <td className='EmployeesListAndEdit_table_body_content_vertical'>
                                  {employee.insurance_premium}
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
                    <div className='EmployeesList_edit_submit_btn_cont'>
                      <button
                        className='EmployeesListAndEdit_edit_submit_btn'
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
        message={translate('deleteEmployeeMessage', language)}
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
};

export default EmployeesListAndEdit;
