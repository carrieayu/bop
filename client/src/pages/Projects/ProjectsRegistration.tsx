import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
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
import AlertModal from '../../components/AlertModal/AlertModal'


const months = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const ProjectsRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('project')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
  const years = [];
  const token = localStorage.getItem('accessToken')
  const [clients, setClients] = useState<any>([])
  const [selectedClient, setSelectedClient] = useState([]);
  const [businessSelection, setBusinessSelection] = useState<any>([])
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const dispatch = useDispatch()
  for (let year = 2021; year <= new Date().getFullYear(); year++) {
    years.push(year);
  }
  const [formProjects, setProjects] = useState([
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
      operating_profit: '',
      non_operating_profit: '',
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
          cost_of_sale: '',
          dispatch_labor_expense: '',
          employee_expense: '',
          indirect_employee_expense: '',
          expense: '',
          operating_profit: '',
          non_operating_profit: '',
          non_operating_expense: '',
          ordinary_profit: '',
          ordinary_profit_margin: '',
        },
      ])
    } else {
      console.log('You can only add up to 10 forms.');
    }
  };

  const handleMinus = () => {
    if (formProjects.length > 1) {
      setProjects(formProjects.slice(0, -1))
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'project':
        navigate('/projects-registration');
        break;
      case 'employeeExpenses':
        navigate('/employee-expenses-registration');
        break;
      case 'expenses':
        navigate('/expenses-registration');
        break;
      case 'costOfSales':
        navigate('/cost-of-sales-registration');
        break;
      default:
        break;
    }
  }

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal();
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
          cost_of_sale: '',
          dispatch_labor_expense: '',
          employee_expense: '',
          indirect_employee_expense: '',
          expense: '',
          operating_profit: '',
          non_operating_profit: '',
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
    }
    setProjects(updatedFormData)
  } 
  useEffect(() => {}, [formProjects])

  const HandleClientChange = (e) => {
    setSelectedClient(e.target.value);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const validateProjects = (projectsValidate) => {
    return projectsValidate.every((prj) => {
      return (
        prj.year.trim() !== '' &&
        prj.month.trim() !== '' &&
        prj.business_division.trim() !== '' &&
        prj.client.trim() !== '' &&
        !isNaN(prj.sales_revenue) &&
        prj.sales_revenue > 0 &&
        !isNaN(prj.sales_revenue) &&
        prj.cost_of_sale > 0 &&
        !isNaN(prj.cost_of_sale) &&
        prj.dispatch_labor_expense > 0 &&
        !isNaN(prj.dispatch_labor_expense) &&
        prj.employee_expense > 0 &&
        !isNaN(prj.employee_expense) &&
        prj.indirect_employee_expense > 0 &&
        !isNaN(prj.indirect_employee_expense) &&
        prj.expense > 0 &&
        !isNaN(prj.expense) &&
        prj.operating_profit > 0 &&
        !isNaN(prj.operating_profit) &&
        prj.non_operating_profit > 0 &&
        !isNaN(prj.non_operating_profit) &&
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

    const projectsData = formProjects.map((projects) => ({
      year: projects.year,
      month: projects.month,
      project_name: projects.project_name,
      project_type: projects.project_type,
      client: projects.client,
      business_division: projects.business_division,
      sales_revenue: parseFloat(projects.sales_revenue),
      cost_of_sale: parseFloat(projects.cost_of_sale),
      dispatch_labor_expense: parseFloat(projects.dispatch_labor_expense),
      employee_expense: parseFloat(projects.employee_expense),
      indirect_employee_expense: parseFloat(projects.indirect_employee_expense),
      expense: parseFloat(projects.expense),
      operating_profit: parseFloat(projects.operating_profit),
      non_operating_profit: parseFloat(projects.non_operating_profit),
      non_operating_expense: parseFloat(projects.non_operating_expense),
      ordinary_profit: parseFloat(projects.ordinary_profit),
      ordinary_profit_margin: parseFloat(projects.ordinary_profit_margin),
    }))

    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    if (!validateProjects(formProjects)) {
      alert(translate('usersValidationText6', language))
      return // Stop the submission
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/projects/create/', projectsData, {
        // const response = await axios.post('http://54.178.202.58:8000/api/projects/create/', projectsData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      alert('Sucessfully Saved')
      setProjects([
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
          operating_profit: '',
          non_operating_profit: '',
          non_operating_expense: '',
          ordinary_profit: '',
          ordinary_profit_margin: '',
        },
      ])
    } catch (error) {
      console.log(error)
      if (error.response && error.response.status === 409) {
        const confirmOverwrite = window.confirm('データはすでに登録されています。上書きしますか？')
        if (confirmOverwrite) {
          try {
            const overwriteResponse = await axios.put('http://127.0.0.1:8000/api/projects/create/', projectsData, {
              // const response = await axios.post('http://54.178.202.58:8000/api/projects/create/', formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })

            alert('Data successfully overwritten.')
          } catch (overwriteError) {
            if (overwriteError.response.status === 400) {
              alert(translate('projectNameExist', language))
            } else {
              console.error('Error overwriting data:', overwriteError)
            }
            
          }
        }
      } 
      else if (error.response.data.project_name[0] && error.response.status === 400) {
        alert(translate('projectNameExist', language))
      } else {
        console.error('There was an error with expenses registration!', error)
      }
    }
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
    setLanguage(newLanguage);
  };
  useEffect(() => {
    fetchDivision()
    fetchClients()
  }, [token]);
  const monthNames: { [key: number]: { en: string; jp: string } } = {
    1: { en: "January", jp: "1月" },
    2: { en: "February", jp: "2月" },
    3: { en: "March", jp: "3月" },
    4: { en: "April", jp: "4月" },
    5: { en: "May", jp: "5月" },
    6: { en: "June", jp: "6月" },
    7: { en: "July", jp: "7月" },
    8: { en: "August", jp: "8月" },
    9: { en: "September", jp: "9月" },
    10: { en: "October", jp: "10月" },
    11: { en: "November", jp: "11月" },
    12: { en: "December", jp: "12月" },
  };

  return (
    <div className='projectsRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='projectsRegistration_content_wrapper'>
        <Sidebar />
        <div className='projectsRegistration_data_content'>
          <div className='projectsRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('projectsRegistration', language)}
              handleTabsClick={handleTabsClick}
              buttonConfig={[
                { labelKey: 'project', tabKey: 'project' },
                { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                { labelKey: 'expenses', tabKey: 'expenses' },
                { labelKey: 'costOfSales', tabKey: 'costOfSales' },
              ]}
            />
          </div>
          <div className='projectsRegistration_mid_body_cont'>
            <form className='projectsRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='projectsRegistration_mid_form_cont'>
                {formProjects.map((form, index) => (
                  <div
                    key={index}
                    className={`projectsRegistration_form-content ${index > 0 ? 'projectsRegistration_form-content-special' : ''}`}
                  >
                    <div
                      className={`projectsRegistration_form-content ${index > 0 ? 'projectsRegistration_form-line' : ''}`}
                    ></div>
                    <div className='projectsRegistration_form-content-div'>
                      <div className='projectsRegistration_left-form-div projectsRegistration_calc'>
                        <div className='projectsRegistration_year-div'>
                          <label className='projectsRegistration_year'>{translate('year', language)}</label>
                          <select
                            className='projectsRegistration_select-option'
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
                        <div className='projectsRegistration_project-type-div'>
                          <label className='projectsRegistration_project-type'>
                            {translate('projectType', language)}
                          </label>
                          <input
                            type='text'
                            name='project_type'
                            value={form.project_type}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_sales-revenue-div'>
                          <label className='projectsRegistration_sales-revenue'>
                            {translate('saleRevenue', language)}
                          </label>
                          <input
                            type='number'
                            name='sales_revenue'
                            value={form.sales_revenue}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_employee-expenses-div'>
                          <label className='projectsRegistration_employee-expenses'>
                            {translate('employeeExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='employee_expense'
                            value={form.employee_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_operating-income-div'>
                          <label className='projectsRegistration_operating-income'>
                            {translate('operatingIncome', language)}
                          </label>
                          <input
                            type='number'
                            name='operating_profit'
                            value={form.operating_profit}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_ordinary-income-div'>
                          <label className='projectsRegistration_ordinary-income'>
                            {translate('ordinaryIncome', language)}
                          </label>
                          <input
                            type='number'
                            name='ordinary_profit'
                            value={form.ordinary_profit}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>

                      <div className='projectsRegistration_middle-form-div projectsRegistration_calc'>
                        <div className='projectsRegistration_month-div'>
                          <label className='projectsRegistration_month'>{translate('month', language)}</label>
                          <select
                            className='projectsRegistration_select-option'
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
                        <div className='projectsRegistration_client-div'>
                          <label className='projectsRegistration_client'>{translate('client', language)}</label>
                          <select
                            className='projectsRegistration_select-option'
                            name='client'
                            value={form.client}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            {clients.map((client) => (
                              <option key={client.client_id} value={client.client_id}>
                                {client.client_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectsRegistration_cost-of-sale-div'>
                          <label className='projectsRegistration_cost-of-sale'>
                            {translate('costOfSale', language)}
                          </label>
                          <input
                            type='number'
                            name='cost_of_sale'
                            value={form.cost_of_sale}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_indirect-employee-expense-div'>
                          <label className='projectsRegistration_indirect-employee-expense'>
                            {translate('indirectEmployeeExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='indirect_employee_expense'
                            value={form.indirect_employee_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_non-operating-income-div'>
                          <label className='projectsRegistration_non-operating-income'>
                            {translate('nonOperatingIncome', language)}
                          </label>
                          <input
                            type='number'
                            name='non_operating_profit'
                            value={form.non_operating_profit}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_ordinary-income-margin-div'>
                          <label className='projectsRegistration_ordinary-income-margin'>
                            {translate('ordinaryIncomeProfitMargin', language)}
                          </label>
                          <input
                            type='number'
                            name='ordinary_profit_margin'
                            value={form.ordinary_profit_margin}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>

                      <div className='projectsRegistration_right-form-div projectsRegistration_calc'>
                        <div className='projectsRegistration_project-name-div'>
                          <label className='projectsRegistration_project_name'>
                            {translate('projectName', language)}
                          </label>
                          <input
                            type='text'
                            name='project_name'
                            value={form.project_name}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>

                        <div className='projectsRegistration_right-form-div'>
                          <div className='projectsRegistration_business_division_name-div'>
                            <label className='projectsRegistration_business_division_name'>
                              {translate('businessDivision', language)}
                            </label>
                            <select
                              className='projectsRegistration_select-option'
                              name='business_division'
                              value={form.business_division}
                              onChange={(e) => handleChange(index, e)}
                            >
                              <option value=''></option>
                              {businessSelection.map((division) => (
                                <option key={division.business_division_id} value={division.business_division_id}>
                                  {division.business_division_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className='projectsRegistration_dispatch-labor-expense-div'>
                          <label className='projectsRegistration_dispatch-labor-expense'>
                            {translate('dispatchLaborExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='dispatch_labor_expense'
                            value={form.dispatch_labor_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>

                        <div className='projectsRegistration_expense-div'>
                          <label className='projectsRegistration_expense'>{translate('expenses', language)}</label>
                          <input
                            type='number'
                            name='expense'
                            value={form.expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>

                        <div className='projectsRegistration_non-operating-expense-div'>
                          <label className='projectsRegistration_non-operating-expense'>
                            {translate('nonOperatingExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='non_operating_expense'
                            value={form.non_operating_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                    </div>
                    {/* //for testing and will be removed it not used for future use */}
                    {/* <input type='hidden' name='registered_user_id' value={form.registered_user_id} />  */}
                  </div>
                ))}
              </div>
              <div className='projectsRegistration_lower_form_cont'>
                <div className='projectsRegistration_form-content'>
                  <div className='projectsRegistration_plus-btn'>
                    <button className='projectsRegistration_inc' type='button' onClick={handleAdd}>
                      +
                    </button>
                    <button className='projectsRegistration_dec' type='button' onClick={handleMinus}>
                      -
                    </button>
                  </div>
                  <div className='projectsRegistration_options-btn'>
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
    </div>
  )
}

export default ProjectsRegistration

