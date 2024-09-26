import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'

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
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState([]);
  for (let year = 2000; year <= new Date().getFullYear(); year++) {
    years.push(year);
  }
  const [formData, setFormData] = useState([
    {
      client: '', //gets client_id
      // business_division_name: '',
      project_name: '',
      project_type: '', //temporary used for the input field "Business Divisions"
      month: '',
      sales_revenue: '',
      non_operating_income: '',
      non_operating_expense: '',
      registered_user_id: storedUserID,
    },
  ])

  const handleAdd = () => {
    if (formData.length < 10) {
      setFormData([...formData, {
        client: '',
        project_type: '', //temporary used for the input field "Business Divisions"
        // business_division_name: '',
        project_name: '',
        month: '',
        sales_revenue: '',
        non_operating_income: '',
        non_operating_expense: '',
        registered_user_id: storedUserID,
      }]);
    } else {
      console.log('You can only add up to 10 forms.');
    }
  };

  const handleMinus = () => {
    if (formData.length > 1) {
      setFormData(formData.slice(0, -1));
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


  const handleChange = (index, event) => {
    const { name, value } = event.target
    const updatedFormData = [...formData]
    updatedFormData[index] = {
      ...updatedFormData[index],
      [name]: value,
    }
    setFormData(updatedFormData)
  } 
  useEffect(() => {
  }, [formData])

  const HandleClientChange = (e) => {
    setSelectedClient(e.target.value);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(formData)

    const postData = formData.map((entry) => ({
      client: entry.client,
      project_name: entry.project_name,
      project_type: entry.project_type, //temporary used for the input field "Business Divisions"
      month: entry.month,
      sales_revenue: parseFloat(entry.sales_revenue),
      non_operating_income: parseFloat(entry.non_operating_income),
      non_operating_expense: parseFloat(entry.non_operating_expense),
      registered_user_id: entry.registered_user_id,
    }));

    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/projects/create/', postData, {
        // const response = await axios.post('http://54.178.202.58:8000/api/projectplanning/create/', postData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      alert('Sucessfully Saved')
      setFormData([
        {
          client: '',
          // business_division_name: '',
          project_type: '', //temporary used for the input field "Business Divisions"
          project_name: '',
          month: '',
          sales_revenue: '',
          non_operating_income: '',
          non_operating_expense: '',
          registered_user_id: localStorage.getItem('userID'),
        },
      ])
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Validation error:', error.response.data);
        window.location.href = '/login'
      } else {
        console.error('There was an error creating the project planning data!', error)
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
    const fetchClients = async () => {
      try{
        const response = await axios.get('http://127.0.0.1:8000/api/master-clients/', {
        // const response = await axios.get('http://54.178.202.58:8000/api/master-clients/', {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
        });
        console.log("clients: ", response.data)
        setClients(response.data);
      }
      catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
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
          <div className='projectsRegistration_top_body_cont'></div>
          <div className='projectsRegistration_mid_body_cont'>
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
            <div className='projectsRegistration_mid_form_cont'>
              <form onSubmit={handleSubmit}>
                {formData.map((form, index) => (
                  <div key={index} className={`projectsRegistration_form-content ${index > 0 ? 'projectsRegistration_form-content-special' : ''}`}>
                    <div className={`projectsRegistration_form-content ${index > 0 ? 'projectsRegistration_form-line' : ''}`}></div>
                    <div className='projectsRegistration_form-content-div'>
                      <div className='projectsRegistration_left-form-div projectsRegistration_calc'>
                        <div className='projectsRegistration_client-div'>
                          <label className='projectsRegistration_client'>{translate('client', language)}</label>
                          <select
                            className='projectsRegistration_select-option'
                            name='client'
                            value={form.client}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            {/* Dynamically map the clients fetched from the database */}
                            {clients.map((client) => (
                              <option key={client.client_id} value={client.client_id}>
                                {client.client_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='projectsRegistration_sales_revenue-div'>
                          <label className='projectsRegistration_sales_revenue'>{translate('salesRevenue', language)}</label>
                          <input
                            type='number'
                            name='sales_revenue'
                            value={form.sales_revenue}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_non-operating-expenses-div'>
                          <label className='projectsRegistration_non-operating-expenses'>{translate('nonOperatingExpenses', language)}</label>
                          <input
                            type='number'
                            name='non_operating_expense'
                            value={form.non_operating_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='projectsRegistration_middle-form-div projectsRegistration_calc'>
                        <div className='projectsRegistration_project_name-div'>
                          <label className='projectsRegistration_project_name'>{translate('projectName', language)}</label>
                          <input
                            type='text'
                            name='project_name'
                            value={form.project_name}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
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
                               {language === "en" ? monthNames[month].en : monthNames[month].jp}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className='projectsRegistration_right-form-div projectsRegistration_calc'>
                        <div className='projectsRegistration_business_division_name-div'>
                          <label className='projectsRegistration_business_division_name'>{translate('businessDivision', language)}</label>
                          <input
                            type='text'
                            name='project_type'
                            value={form.project_type}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='projectsRegistration_operating-income-div'>
                          <label className='projectsRegistration_operating_income'>{translate('nonOperatingIncome', language)}</label>
                          <input
                            type='number'
                            name='non_operating_income'
                            value={form.non_operating_income}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='registered_user_id' value={form.registered_user_id} />
                  </div>
                ))}
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
                    <button type='button' className='button is-light'>
                      {translate('cancel', language)}
                    </button>
                    <button type='submit' className='button is-info'>
                      {translate('submit', language)}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsRegistration
