import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/temp_SideBar/Sidebar'

const ClientsRegistration = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('')
    const storedUserID = localStorage.getItem('userID')
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');

    // const [formData, setFormData] = useState([
    //     {
    //       client_name: '',
    //       business_division_name: '',
    //       project_name: '',
    //       month: '',
    //       sales_revenue: '',
    //       non_operating_income: '',
    //       non_operating_expenses: '',
    //       registered_user_id: storedUserID,
    //     },
    //   ])

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
    }

    const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
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
    //         registered_user_id: formData.map((c) => c.registered_user_id),
    //       },
    //       business: {
    //         business_division_name: formData.map((c) => c.business_division_name),
    //         registered_user_id: formData.map((c) => c.registered_user_id),
    //         company_id: formData.map((c) => c.registered_user_id),
    //       },
    //       planning: {
    //         project_name: formData.map((c) => c.project_name),
    //         month: formData.map((c) => c.month),
    //         sales_revenue: formData.map((c) => c.sales_revenue),
    //         non_operating_income: formData.map((c) => c.non_operating_income),
    //         non_operating_expenses: formData.map((c) => c.non_operating_expenses),
    //       },
    //       registered_user_id: formData.map((c) => c.registered_user_id),
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
    //           client_name: '',
    //           business_division_name: '',
    //           project_name: '',
    //           month: '',
    //           sales_revenue: '',
    //           non_operating_income: '',
    //           non_operating_expenses: '',
    //           registered_user_id: localStorage.getItem('userID'),
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
    <div className='ClientsRegistration_wrapper'>
      <div className='ClientsRegistration_header_cont'>
      <div className="ClientsRegistration_header-buttons">
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
        <div className="ClientsRegistration_language-toggle">
          <p className="ClientsRegistration_pl-label">English</p>
            <label className="ClientsRegistration_switch">
              <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle}/>
              <span className="ClientsRegistration_slider"></span>
            </label>
        </div>
      </div>
      <div className='ClientsRegistration_content_wrapper'>
        <div className='ClientsRegistration_sidebar'>
          <Sidebar />
        </div>
        <div className='ClientsRegistration_data_content'>
          <div className='ClientsRegistration_top_body_cont'></div>
          <div className='ClientsRegistration_mid_body_cont'>
            <div className='ClientsRegistration_mid_btn_cont'>
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
                      ? 'body-btn-active body-btn'
                      : 'body-btn'
                  }
                />
              ))}
            </div>
            <div className='ClientsRegistration_mid_form_cont'>
              <p className='ClientsRegistration_form-title'>{translate('clientsRegistration', language)}</p>
              {/* <form onSubmit={handleSubmit}> */}
                  <div key='' className='ClientsRegistration_ForImplementationOfPlusAndMinus'>
                    <div className='ClientsRegistration_ForImplementationOfHorizontalLineBelow'></div>
                    <div className='ClientsRegistration_form-div'>
                      <div className='ClientsRegistration_form-content-div'>
                        <div className='ClientsRegistration_client_name-div'>
                          <label className='client_name'>{translate('clientName', language)}</label>
                          <input
                            type='text'
                            name='client_name'
                            value=''
                          />
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='registered_user_id' value='' />
                  </div>
                <div className='ClientsRegistration_form-content'>
                  <div className='ClientsRegistration_plus-btn'>
                    <button className='ClientsRegistration_inc' type='button'>
                      +
                    </button>
                    <button className='ClientsRegistration_dec' type='button'>
                      -
                    </button>
                  </div>
                  <div className='ClientsRegistration_options-btn'>
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

export default ClientsRegistration
