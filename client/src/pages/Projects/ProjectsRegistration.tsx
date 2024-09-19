import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'

const months = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const ProjectsRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('project')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
  const years = [];
  for (let year = 2000; year <= new Date().getFullYear(); year++) {
    years.push(year);
  }
  const [formData, setFormData] = useState([
    {
      client_name: '',
      business_division_name: '',
      project_name: '',
      month: '',
      sales_revenue: '',
      non_operating_income: '',
      non_operating_expenses: '',
      registered_user_id: storedUserID,
    },
  ])

  const handleAdd = () => {
    if (formData.length < 10) {
      const newFormData = [...formData]
      newFormData.push({
        client_name: '',
        business_division_name: '',
        project_name: '',
        month: '',
        sales_revenue: '',
        non_operating_income: '',
        non_operating_expenses: '',
        registered_user_id: storedUserID,
      })
      setFormData(newFormData)
      console.log('add:' + formData)
    } else {
      console.log('You can only add up to 10 forms.')
    }
  }

  const handleMinus = () => {
    if (formData.length > 1) {
      const newFormData = [...formData]
      newFormData.pop()
      setFormData(newFormData)
    }
  }
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target
    const newFormData = [...formData]
    newFormData[index] = {
      ...newFormData[index],
      [name]: value,
    }
    setFormData(newFormData)
  }

  useEffect(() => {
  }, [formData])

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning' || path === '/*') {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(formData)

    const postData = {
      client: {
        client_name: formData.map((c) => c.client_name),
        registered_user_id: formData.map((c) => c.registered_user_id),
      },
      business: {
        business_division_name: formData.map((c) => c.business_division_name),
        registered_user_id: formData.map((c) => c.registered_user_id),
        company_id: formData.map((c) => c.registered_user_id),
      },
      planning: {
        project_name: formData.map((c) => c.project_name),
        month: formData.map((c) => c.month),
        sales_revenue: formData.map((c) => c.sales_revenue),
        non_operating_income: formData.map((c) => c.non_operating_income),
        non_operating_expenses: formData.map((c) => c.non_operating_expenses),
      },
      registered_user_id: formData.map((c) => c.registered_user_id),
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      // const response = await axios.post('http://127.0.0.1:8000/api/projectplanning/create/', postData, {
        const response = await axios.post('http://54.178.202.58:8000/api/projectplanning/create/', postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      alert('Sucessfully Saved')
      setFormData([
        {
          client_name: '',
          business_division_name: '',
          project_name: '',
          month: '',
          sales_revenue: '',
          non_operating_income: '',
          non_operating_expenses: '',
          registered_user_id: localStorage.getItem('userID'),
        },
      ])
    } catch (error) {
      if (error.response && error.response.status === 401) {
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
      <div className='projectsRegistration_header_cont'>
      <div className="projectsRegistration_header-buttons">
          <Btn
            label={translate('analysis', language)}
            onClick={() => handleTabClick("/dashboard")}
            className={activeTab === "/dashboard" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label={translate('profitAndlossPlanning', language)}
            onClick={() => handleTabClick("/planning")}
            className={activeTab === "/planning" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label={translate('results', language)}
            onClick={() => handleTabClick("/*")}
            className={activeTab === "/*" ? "h-btn-active header-btn" : "header-btn"}
          />
        </div>
        <div className="projectsRegistration_language-toggle">
          <p className="projectsRegistration_pl-label">English</p>
            <label className="projectsRegistration_switch">
              <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle}/>
              <span className="projectsRegistration_slider"></span>
            </label>
        </div>
      </div>
      <div className='projectsRegistration_content_wrapper'>
        <div className='projectsRegistration_sidebar'>
          <Sidebar />
        </div>
        <div className='projectsRegistration_data_content'>
          <div className='projectsRegistration_top_body_cont'></div>
          <div className='projectsRegistration_mid_body_cont'>
            <div className='projectsRegistration_mid_btn_cont'>
              {[...Array(4)].map((_, index) => (
                <Btn
                  key={index}
                  label={translate(index === 0 ? 'project' : index === 1 ? 'employeeExpenses' : index === 2 ? 'expenses' : 'costOfSales', language)}
                  onClick={() =>
                    handleTabsClick(
                      index === 0
                        ? 'project'
                        : index === 1
                          ? 'employeeExpenses'
                          : index === 2
                            ? 'expenses'
                            : 'costOfSales',
                    )
                  }
                  className={
                    activeTabOther ===
                    (index === 0 ? 'project' : index === 1 ? 'employeeExpenses' : index === 2 ? 'expenses' : 'costOfSales')
                      ? 'projectsRegistration_body-btn-active projectsRegistration_body-btn'
                      : 'projectsRegistration_body-btn'
                  }
                />
              ))}
            </div>
            <div className='projectsRegistration_mid_form_cont'>
              <p className='projectsRegistration_form-title'>{translate('projectsRegistration', language)}</p>
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
                            value={form.client_name}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            <option value='TVS'>TVS</option>
                            <option value='TCM'>TCM</option>
                            <option value='JR'>JR</option>
                            <option value='ソルトワークス'>ソルトワークス</option>
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
                            name='non_operating_expenses'
                            value={form.non_operating_expenses}
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
                            name='business_division_name'
                            value={form.business_division_name}
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
