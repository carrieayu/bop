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

const ExpensesRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('expenses')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const token = localStorage.getItem('accessToken')
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
  const [formData, setFormData] = useState([
    {
      year: '',
      month: '',
      tax_and_public_charge: '',
      communication_expense: '',
      advertising_expense: '',
      consumable_expense: '',
      depreciation_expense: '',
      utilities_expense: '',
      entertainment_expense: '',
      rent_expense: '',
      travel_expense: '',
      transaction_fee: '',
      professional_service_fee: '',
      registered_user_id: storedUserID,
      updated_at: '',
    },
  ])

  const handleTranslationSwitchToggle = () => {
     const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
     setLanguage(newLanguage)
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

  const handleAdd = () => {
    if (formData.length < 10) {
      const newFormData = [...formData]
      newFormData.push({
        year: '',
        month: '',
        tax_and_public_charge: '',
        communication_expense: '',
        advertising_expense: '',
        consumable_expense: '',
        depreciation_expense: '',
        utilities_expense: '',
        entertainment_expense: '',
        rent_expense: '',
        travel_expense: '',
        transaction_fee: '',
        professional_service_fee: '',
        registered_user_id: storedUserID,
        updated_at:'',
      })
      setFormData(newFormData)
      console.log('add:' + formData)
    } else {
      console.log('You can only add up to 10 forms.')
    }
  }

  const handleMinus = () => {
    if (formData.length > 1) {
      setFormData(formData.slice(0, -1))
    }
  }

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handleSubmit = async (e) => {
    const {
      year,
      month,
      consumable_expense,
      tax_and_public_charge,
      communication_expense,
      advertising_expense,
      depreciation_expense,
      utilities_expense,
      entertainment_expense,
      rent_expense,
      travel_expense,
      transaction_fee,
    } = formData[0]
    if (
      !year ||
      !month ||
      !consumable_expense ||
      !tax_and_public_charge ||
      !communication_expense ||
      !communication_expense ||
      !advertising_expense ||
      !depreciation_expense ||
      !utilities_expense ||
      !entertainment_expense ||
      !rent_expense ||
      !travel_expense ||
      !transaction_fee
      ) {
       alert(translate('usersValidationText6', language))
       return
     }
    
    e.preventDefault()
    if (!token) {
      window.location.href = '/login'
      return
    }
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/expenses/create', formData, {
        // const response = await axios.post('http://54.178.202.58:8000/api/create/', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      alert('Successfully Saved')
      // Reset form data after successful submission
      setFormData([
        {
          year: '',
          month: '',
          tax_and_public_charge: '',
          communication_expense: '',
          advertising_expense: '',
          consumable_expense: '',
          depreciation_expense: '',
          utilities_expense: '',
          entertainment_expense: '',
          rent_expense: '',
          travel_expense: '',
          transaction_fee: '',
          professional_service_fee: '',
          registered_user_id: localStorage.getItem('userID'),
          updated_at: '',
        },
      ])
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // If there's a conflict (month already exists), prompt the user
        const confirmOverwrite = window.confirm('選択された月は既にデータが登録されています。 \n上書きしますか？')
        if (confirmOverwrite) {
          try {
            const response = await axios.put('http://127.0.0.1:8000/api/expenses/create', formData, {
              // const response = await axios.put('http://54.178.202.58:8000/api/expenses/create', formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
            // alert('Data successfully saved/overwritten.');
            setFormData([
              {
                year: '',
                month: '',
                tax_and_public_charge: '',
                communication_expense: '',
                advertising_expense: '',
                consumable_expense: '',
                depreciation_expense: '',
                utilities_expense: '',
                entertainment_expense: '',
                rent_expense: '',
                travel_expense: '',
                transaction_fee: '',
                professional_service_fee: '',
                registered_user_id: localStorage.getItem('userID'),
                updated_at: '',
              },
            ])
          } catch (overwriteError) {
            console.error('Error overwriting data:', overwriteError)
          }
        }
      } else {
        console.error('There was an error with expenses registration!', error)
      }
    }
  }

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
  
  useEffect(() => {
  }, [formData])


  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);


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

  // Creates an Array of years for dropdown input. 5 years before AND after current year.
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 1;
  const endYear = currentYear + 2;
  const years = Array.from({length:endYear - startYear + 1},(val,index)=> (startYear + index))

  return (
    <div className='expensesRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='expensesRegistration_content_wrapper'>
        <Sidebar />
        <div className='expensesRegistration_data_content'>
          <div className='expensesRegistration_top_body_cont'></div>
          <div className='expensesRegistration_mid_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('expensesRegistration', language)}
              handleTabsClick={handleTabsClick}
              buttonConfig={[
                { labelKey: 'project', tabKey: 'project' },
                { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                { labelKey: 'expenses', tabKey: 'expenses' },
                { labelKey: 'costOfSales', tabKey: 'costOfSales' },
              ]}
            />
            <div className='expensesRegistration_mid_form_cont'>
              <form onSubmit={handleSubmit}>
                {formData.map((form, index) => (
                  <div
                    key={index}
                    className={`expensesRegistration_form-content ${index > 0 ? 'expensesRegistration_form-content-special' : ''}`}
                  >
                    <div
                      className={`expensesRegistration_form-content ${index > 0 ? 'expensesRegistration_form-line' : ''}`}
                    ></div>
                    <div className='expensesRegistration_form-content-div'>
                      <div className='expensesRegistration_left-form-div expensesRegistration_calc'>
                        <div className='expensesRegistration_year-div'>
                          <label className='expensesRegistration_year'>{translate('year', language)}</label>
                          <select
                            className='expensesRegistration_select-option'
                            name='year'
                            value={form.year}
                            onChange={(e) => handleChange(index, e)}
                            style={{ textAlign: 'center', textAlignLast: 'center' }}
                          >
                            <option value=''></option>
                            {years.map((year, idx) => (
                              <option key={idx} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='expensesRegistration_rent_expenses-div'>
                          <label className='expensesRegistration_rent_expenses'>
                            {translate('rentExpense', language)}
                          </label>
                          <input type='number' name='rent_expense' value={form.rent_expense} onChange={(e) => handleChange(index, e)} />
                        </div>
                        <div className='expensesRegistration_travel_expenses-div'>
                          <label className='expensesRegistration_travel_expenses'>
                            {translate('travelExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='travel_expense'
                            value={form.travel_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='expensesRegistration_transaction_fees-div'>
                          <label className='expensesRegistration_transaction_fees'>
                            {translate('transactionFee', language)}
                          </label>
                          <input
                            type='number'
                            name='transaction_fee'
                            value={form.transaction_fee}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='expensesRegistration_professional_services_fees-div'>
                          <label className='expensesRegistration_professional_services_fees'>
                            {translate('professionalServicesFee', language)}
                          </label>
                          <input
                            type='number'
                            name='professional_service_fee'
                            value={form.professional_service_fee}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='expensesRegistration_middle-form-div expensesRegistration_calc'>
                        <div className='expensesRegistration_month-div'>
                          <label className='expensesRegistration_month'>{translate('month', language)}</label>
                          <select
                            className='expensesRegistration_select-option'
                            name='month'
                            value={form.month}
                            onChange={(e) => handleChange(index, e)}
                            style={{ textAlign: 'center', textAlignLast: 'center' }}
                          >
                            <option value=''></option>
                            {months.map((month, idx) => (
                              <option key={idx} value={month}>
                                {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='expensesRegistration_taxes_and_public_charges-div'>
                          <label className='expensesRegistration_taxes_and_public_charges'>
                            {translate('taxAndPublicCharge', language)}
                          </label>
                          <input
                            type='number'
                            name='tax_and_public_charge'
                            value={form.tax_and_public_charge}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='expensesRegistration_communication_expenses-div'>
                          <label className='expensesRegistration_communication_expenses'>
                            {translate('communicationExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='communication_expense'
                            value={form.communication_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='expensesRegistration_advertising_expenses-div'>
                          <label className='expensesRegistration_advertising_expenses'>
                            {translate('advertisingExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='advertising_expense'
                            value={form.advertising_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='expensesRegistration_right-form-div expensesRegistration_calc'>
                        <div className='expensesRegistration_consumable_expenses-div'>
                          <label className='expensesRegistration_consumable_expenses'>
                            {translate('consumableExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='consumable_expense'
                            value={form.consumable_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='expensesRegistration_depreciation_expenses-div'>
                          <label className='expensesRegistration_depreciation_expenses'>
                            {translate('depreciationExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='depreciation_expense'
                            value={form.depreciation_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='expensesRegistration_utilities_expenses-div'>
                          <label className='expensesRegistration_utilities_expenses'>
                            {translate('utilitiesExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='utilities_expense'
                            value={form.utilities_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='expensesRegistration_entertainment_expenses-div'>
                          <label className='expensesRegistration_entertainment_expenses'>
                            {translate('entertainmentExpense', language)}
                          </label>
                          <input
                            type='number'
                            name='entertainment_expense'
                            value={form.entertainment_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='registered_user_id' value={form.registered_user_id} />
                  </div>
                ))}
                <div className='expensesRegistration_form-content'>
                  <div className='expensesRegistration_plus-btn'>
                    <button className='expensesRegistration_inc' type='button' onClick={handleAdd}>
                      +
                    </button>
                    <button className='expensesRegistration_dec' type='button' onClick={handleMinus}>
                      -
                    </button>
                  </div>
                  <div className='expensesRegistration_options-btn'>
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
