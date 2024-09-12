import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/SideBar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'

const months = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const ExpensesRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('case')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translations
  const [formData, setFormData] = useState([
    {
      month: '',
      taxes_and_public_charges: '',
      communication_expenses: '',
      advertising_expenses: '',
      consumables_expenses: '',
      depreciation_expenses: '',
      utilities_expenses: '',
      entertainment_expenses: '',
      rent: '',
      travel_expenses: '',
      payment_fees: '',
      remuneration: '',
      registered_user_id: storedUserID,
    },
  ])

  const handleAdd = () => {
    if (formData.length < 10) {
      const newFormData = [...formData]
      newFormData.push({
        month: '',
        taxes_and_public_charges: '',
        communication_expenses: '',
        advertising_expenses: '',
        consumables_expenses: '',
        depreciation_expenses: '',
        utilities_expenses: '',
        entertainment_expenses: '',
        rent: '',
        travel_expenses: '',
        payment_fees: '',
        remuneration: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }
    try {
      // const response = await axios.post('http://127.0.0.1:8000/api/expenses-registration/create/', formData, {
      const response = await axios.post('http://54.178.202.58:8000/api/expenses-registration/create/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
    
      alert('Successfully Saved');
      // Reset form data after successful submission
      setFormData([{
        month: '',
        taxes_and_public_charges: '',
        communication_expenses: '',
        advertising_expenses: '',
        consumables_expenses: '',
        depreciation_expenses: '',
        utilities_expenses: '',
        entertainment_expenses: '',
        rent: '',
        travel_expenses: '',
        payment_fees: '',
        remuneration: '',
        registered_user_id: localStorage.getItem('userID'),
      }]);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // If there's a conflict (month already exists), prompt the user
        const confirmOverwrite = window.confirm("選択された月は既にデータが登録されています。 \n上書きしますか？");
        if (confirmOverwrite) {
          try {
            // const response = await axios.put('http://127.0.0.1:8000/api/expenses-registration/update/', formData, {
            const response = await axios.put('http://54.178.202.58:8000/api/expenses-registration/update/', formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
            // alert('Data successfully saved/overwritten.');
            setFormData([{
              month: '',
              taxes_and_public_charges: '',
              communication_expenses: '',
              advertising_expenses: '',
              consumables_expenses: '',
              depreciation_expenses: '',
              utilities_expenses: '',
              entertainment_expenses: '',
              rent: '',
              travel_expenses: '',
              payment_fees: '',
              remuneration: '',
              registered_user_id: localStorage.getItem('userID'),
            }]);
        } catch (overwriteError) {
            console.error('Error overwriting data:', overwriteError);
        }
        
        }
      } else {
        console.error('There was an error with expenses registration!', error);
      }
    }
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
    <div className="project_wrapper">
      <div className="header_cont">
      <div className="header-buttons">
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
        <div className="language-toggle">
          <p className="pl-label">English</p>
            <label className="switch">
              <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle}/>
              <span className="slider"></span>
            </label>
        </div>
      </div>
      <div className='proj_content_wrapper'>
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className='project_data_content'>
          <div className='top_body_cont'>
          </div>
          <div className='mid_body_cont'>
            <div className='mid_btn_cont'>
              {[...Array(4)].map((_, index) => (
                <Btn
                  key={index}
                  label={translate(index === 0 ? 'project' : index === 1 ? 'personalExpenses' : index === 2 ? 'expenses' : 'costOfSales', language)}
                  onClick={() =>
                    handleTabsClick(
                      index === 0
                        ? 'case'
                        : index === 1
                          ? 'personnel_cost'
                          : index === 2
                            ? 'expenses': 'cost_purchase'
                    )
                  }
                  className={
                    activeTabOther ===
                    (index === 0
                      ? 'case'
                      : index === 1
                        ? 'personnel_cost'
                        : index === 2
                          ? 'expenses': 'cost_purchase')
                      ? 'body-btn-active body-btn'
                      : 'body-btn'
                  }
                />
              ))}
            </div>
            <div className='mid_form_cont'>
              <p className='form-title'>{translate('expensesRegistration', language)}</p>
              <form onSubmit={handleSubmit}>
                {formData.map((form, index) => (
                <div key={index} className={`form-content ${index > 0 ? 'form-content-special' : ''}`}>
                    <div className={`form-content ${index > 0 ? 'form-line' : ''}`}></div>
                    <div className='form-content-div'>
                        <div className='left-form-div calc'>
                        <div className='client-name-div'>
                            <label className='client_name'>{translate('month', language)}</label>
                            <select
                            className='select-option'
                            name='month'
                            value={form.month}
                            onChange={(e) => handleChange(index, e)}
                            style={{ textAlign: 'center', textAlignLast: 'center' }}
                            >
                            <option value=''></option>
                                {months.map((month, idx) => (
                                    <option key={idx} value={month}>{language === "en" ? monthNames[month].en : monthNames[month].jp}</option>
                                ))}
                            </select>
                        </div>
                        <div className='business_division_name-div'>
                            <label className='business_division_name'>{translate('taxesAndpublicCharges', language)}</label>
                            <input
                            type='number'
                            name='taxes_and_public_charges'
                            value={form.taxes_and_public_charges}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        <div className='project_name-div'>
                            <label className='project_name'>{translate('communicationExpenses', language)}</label>
                            <input
                            type='number'
                            name='communication_expenses'
                            value={form.communication_expenses}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        <div className='start_date-div'>
                            <label className='start_yyyymm'>{translate('advertisingExpenses', language)}</label>
                            <input
                            type='number'
                            name='advertising_expenses'
                            value={form.advertising_expenses}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        </div>
                        <div className='middle-form-div calc'>
                        <div className='net-sales-div'>
                            <label className='net_sales'>{translate('suppliesExpenses', language)}</label>
                            <input
                            type='number'
                            name='consumables_expenses'
                            value={form.consumables_expenses}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        <div className='cost-of-sales-div'>
                            <label className='cost_of_goods_sold'>{translate('depreciationExpenses', language)}</label>
                            <input
                            type='number'
                            name='depreciation_expenses'
                            value={form.depreciation_expenses}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        <div className='personnel-expenses-div'>
                            <label className='personnel_expenses'>{translate('utilitiesExpenses', language)}</label>
                            <input
                            type='number'
                            name='utilities_expenses'
                            value={form.utilities_expenses}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        <div className='indirect-personnel-cost-div'>
                            <label className='indirect_personnel_cost'>{translate('entertainmentExpenses', language)}</label>
                            <input
                            type='number'
                            name='entertainment_expenses'
                            value={form.entertainment_expenses}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        </div>
                        <div className='right-form-div calc'>
                        <div className='non-operating-income-div'>
                            <label className='non_operating_income'>{translate('rentExpenses', language)}</label>
                            <input
                            type='number'
                            name='rent'
                            value={form.rent}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        <div className='operating-income-div'>
                            <label className='operating_income'>{translate('travelExpenses', language)}</label>
                            <input
                            type='number'
                            name='travel_expenses'
                            value={form.travel_expenses}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        <div className='ordinary-income-div'>
                            <label className='ordinary_income'>{translate('transactionFees', language)}</label>
                            <input
                            type='number'
                            name='payment_fees'
                            value={form.payment_fees}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        <div className='ordinary-income-margin-div'>
                            <label className='ordinary_income_margin'>{translate('professionalServicesFees', language)}</label>
                            <input
                            type='number'
                            name='remuneration'
                            value={form.remuneration}
                            onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        </div>
                    </div>
                  <input type='hidden' name='registered_user_id' value={form.registered_user_id} />
                </div>
                ))}
                <div className='form-content'>
                  <div className='plus-btn'>
                    <button className='inc' type='button' onClick={handleAdd}>
                      +
                    </button>
                    <button className='dec' type='button' onClick={handleMinus}>
                      -
                    </button>
                  </div>
                  <div className='options-btn'>
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

export default ExpensesRegistration
