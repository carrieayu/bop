import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'

const EmployeesRegistration = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('employee')
    const storedUserID = localStorage.getItem('userID')
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');

    // const [formData, setFormData] = useState([
    //     {
    //       last_name: '',
    //       first_name: '',
    //       email: '',
    //       salary: '',
    //       business_division_name: '',
    //       company_name: '',
    //       auth_user_id: storedUserID,
    //     },
    //   ])

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
    }

    const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
        switch (tab) {
          case 'client':
            navigate('/clients-registration');
            break;
          case 'employee':
            navigate('/employees-registration');
            break;
          case 'businessDivision':
            navigate('/business-divisions-registration');
            break;
          case 'users':
            navigate('/users-registration');
            break;
          default:
            break;
        }
    }

    const handleTranslationSwitchToggle = () => {
        const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
        setLanguage(newLanguage);
    };

    useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning' || path === '/*') {
          setActiveTab(path);
        }
      }, [location.pathname]);

    //   const handleSubmit = async (e) => {
    //     e.preventDefault()
    //     console.log(formData)
    
    //     const postData = {
    //       client: {
    //         client_name: formData.map((c) => c.client_name),
    //         auth_user_id: formData.map((c) => c.auth_user_id),
    //       },
    //       business: {
    //         business_division_name: formData.map((c) => c.business_division_name),
    //         auth_user_id: formData.map((c) => c.auth_user_id),
    //         company_id: formData.map((c) => c.auth_user_id),
    //       },
    //       planning: {
    //         project_name: formData.map((c) => c.project_name),
    //         month: formData.map((c) => c.month),
    //         sales_revenue: formData.map((c) => c.sales_revenue),
    //         non_operating_income: formData.map((c) => c.non_operating_income),
    //         non_operating_expenses: formData.map((c) => c.non_operating_expenses),
    //       },
    //       auth_user_id: formData.map((c) => c.auth_user_id),
    //     }
    
    //     const token = localStorage.getItem('accessToken')
    //     if (!token) {
    //       window.location.href = '/login'
    //       return
    //     }
    
    //     try {
    //       // const response = await axios.post('http://127.0.0.1:8000/api/projectplanning/create/', postData, {
    //         const response = await axios.post('http://54.178.202.58:8000/api/projectplanning/create/', postData, {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       })
    //       alert('Sucessfully Saved')
    //       setFormData([
    //         {
    //           last_name: '',
    //           first_name: '',
    //           email: '',
    //           salary: '',
    //           business_division_name: '',
    //           company_name: '',
    //           auth_user_id: localStorage.getItem('userID'),
    //         },
    //       ])
    //     } catch (error) {
    //       if (error.response && error.response.status === 401) {
    //         window.location.href = '/login'
    //       } else {
    //         console.error('There was an error creating the project planning data!', error)
    //       }
    //     }
    //   }

      useEffect(() => {
        setIsTranslateSwitchActive(language === 'en');
      }, [language]);

  return (
    <div className='EmployeesRegistration_wrapper'>
      <div className='EmployeesRegistration_header_cont'>
      <div className="EmployeesRegistration_header-buttons">
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
        <div className="EmployeesRegistration_language-toggle">
          <p className="EmployeesRegistration_pl-label">English</p>
            <label className="EmployeesRegistration_switch">
              <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle}/>
              <span className="EmployeesRegistration_slider"></span>
            </label>
        </div>
      </div>
      <div className='EmployeesRegistration_content_wrapper'>
        <div className='EmployeesRegistration_sidebar'>
          <Sidebar />
        </div>
        <div className='EmployeesRegistration_data_content'>
          <div className='EmployeesRegistration_top_body_cont'></div>
          <div className='EmployeesRegistration_mid_body_cont'>
            <div className='EmployeesRegistration_mid_btn_cont'>
              {[...Array(4)].map((_, index) => (
                <Btn
                  key={index}
                  label={translate(index === 0 ? 'client' : index === 1 ? 'employee' : index === 2 ? 'businessDivision' : 'users', language)}
                  onClick={() =>
                    handleTabsClick(
                      index === 0
                        ? 'client'
                        : index === 1
                          ? 'employee'
                          : index === 2
                            ? 'businessDivision'
                            : 'users',
                    )
                  }
                  className={
                    activeTabOther ===
                    (index === 0 ? 'client' : index === 1 ? 'employee' : index === 2 ? 'businessDivision' : 'users')
                      ? 'body-btn-active body-btn'
                      : 'body-btn'
                  }
                />
              ))}
            </div>
            <div className='EmployeesRegistration_mid_form_cont'>
              <p className='EmployeesRegistration_form-title'>{translate('employeesRegistration', language)}</p>
              {/* <form onSubmit={handleSubmit}> */}
                  <div key='' className='EmployeesRegistration_form-content EmployeesRegistration_ForImplementationOfPlusAndMinus'>
                    <div className='EmployeesRegistration_form-content EmployeesRegistration_ForImplementationOfHorizontalLineBelow'></div>
                    <div className='EmployeesRegistration_form-div'>
                      <div className='EmployeesRegistration_left-form-content-div EmployeesRegistration_calc'>
                        <div className='EmployeesRegistration_last_name-div'>
                          <label className='last_name'>{translate('lastName', language)}</label>
                          <input
                            type='text'
                            name='last_name'
                            value=''
                          />
                        </div>
                        <div className='EmployeesRegistration_salary-div'>
                          <label className='salary'>{translate('salary', language)}</label>
                          <input
                            type='text'
                            name='salary'
                            value=''
                          />
                        </div>
                      </div>
                      <div className='EmployeesRegistration_mid-form-content-div EmployeesRegistration_calc'>
                        <div className='EmployeesRegistration_first_name-div'>
                          <label className='first_name'>{translate('firstName', language)}</label>
                          <input
                            type='text'
                            name='first_name'
                            value=''
                          />
                        </div>
                        <div className='EmployeesRegistration_business_division_name-div'>
                          <label className='EmployeesRegistration_business_division_name'>{translate('businessDivision', language)}</label>
                          <select
                            className='EmployeesRegistration_select-option'
                            name='business_division_name'
                            value=''
                            // onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            <option value=''>全社</option>
                            <option value=''>CS事業部</option>
                            <option value=''>PS事業部</option>
                            <option value=''>HiPE</option>
                          </select>
                        </div>
                      </div>
                      <div className='EmployeesRegistration_right-form-content-div EmployeesRegistration_calc'>
                        <div className='EmployeesRegistration_email-div'>
                          <label className='email'>{translate('email', language)}</label>
                          <input
                            type='text'
                            name='email'
                            value=''
                          />
                        </div>
                        <div className='EmployeesRegistration_company_name-div'>
                          <label className='EmployeesRegistration_company_name'>{translate('companyName', language)}</label>
                          <select
                            className='EmployeesRegistration_select-option'
                            name='company_name'
                            value=''
                            // onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            <option value=''>全社</option>
                            <option value=''>CS事業部</option>
                            <option value=''>PS事業部</option>
                            <option value=''>HiPE</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='auth_user_id' value='' />
                  </div>
                <div className='EmployeesRegistration_form-btn-content'>
                  <div className='EmployeesRegistration_plus-btn'>
                    <button className='EmployeesRegistration_inc' type='button'>
                      +
                    </button>
                    <button className='EmployeesRegistration_dec' type='button'>
                      -
                    </button>
                  </div>
                  <div className='EmployeesRegistration_options-btn'>
                    <button type='button' className='button is-light'>
                      {translate('cancel', language)}
                    </button>
                    <button type='submit' className='button is-info'>
                      {translate('submit', language)}
                    </button>
                  </div>
                </div>
              {/* </form> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeesRegistration
