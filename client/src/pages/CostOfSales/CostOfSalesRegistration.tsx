import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal'

const months = [
   '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const CostOfSalesRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('costOfSales')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 1;
  const endYear = currentYear + 2;
  const years = Array.from({ length: endYear - startYear + 1 }, (val, i) => startYear + i);
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [formData, setFormData] = useState([
    {
      year: '', 
      month: '',
      purchase: '',
      outsourcing_expense: '', 
      product_purchase: '',
      dispatch_labor_expense: '',
      communication_expense: '',
      work_in_progress_expense: '',
      amortization_expense: '',
      // registered_user_id: storedUserID, //for testing and will be removed it not used for future use
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false); 
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false);

  const handleAdd = () => {
    if (formData.length < 10) {
      const newFormData = [...formData]
      newFormData.push({
        year: '', 
        month: '',
        purchase: '',
        outsourcing_expense: '', 
        product_purchase: '',
        dispatch_labor_expense: '',
        communication_expense: '',
        work_in_progress_expense: '',
        amortization_expense: '',
        // registered_user_id: storedUserID, //for testing and will be removed it not used for future use
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
    openModal()
  }

  const handleRemoveInputData = () => {
    setFormData([
      {
        year: '',
        month: '',
        purchase: '',
        outsourcing_expense: '',
        product_purchase: '',
        dispatch_labor_expense: '',
        communication_expense: '',
        work_in_progress_expense: '',
        amortization_expense: '',
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

  const handleChange = (index, event) => {
    const { name, value } = event.target
    const newFormData = [...formData]
    newFormData[index] = {
      ...newFormData[index],
      [name]: value,
    }
    setFormData(newFormData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const costOfSalesData = formData.map((cos) => ({
      year: cos.year,
      month: cos.month,
      purchase: cos.purchase,
      outsourcing_expense: cos.outsourcing_expense,
      product_purchase: cos.product_purchase,
      dispatch_labor_expense: cos.dispatch_labor_expense,
      communication_expense: cos.communication_expense,
      work_in_progress_expense: cos.work_in_progress_expense,
      amortization_expense: cos.amortization_expense,
    }));

    // Checks if any inputs are empty
    const areFieldsEmpty = costOfSalesData.some(
      (entry) => !entry.year || 
                 !entry.month || 
                 !entry.purchase || 
                 !entry.outsourcing_expense || 
                 !entry.product_purchase || 
                 !entry.dispatch_labor_expense || 
                 !entry.communication_expense || 
                 !entry.work_in_progress_expense || 
                 !entry.amortization_expense,
    );

    if (areFieldsEmpty) {
      setModalMessage(translate('allFieldsRequiredInputValidationMessage', language));
      setIsModalOpen(true);
      return;
    }

    // Combine year and month for easier duplicate checking
    const costOfSales = costOfSalesData.map((costOfSale) => ({
      yearMonth: `${costOfSale.year}-${costOfSale.month}`,
    }));

    // Check for duplicates in the submitted cost of sales (year and month combination)
    const hasDuplicateEntries = (entries, key) => {
      return entries.some((entry, index) => entries.findIndex((e) => e[key] === entry[key]) !== index);
    };

    if (hasDuplicateEntries(costOfSales, 'yearMonth')) {
      setModalMessage(translate('duplicateYearAndMonthInputValidationMessage', language));
      setIsModalOpen(true);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      // Attempt to create a new entry
      const response = await axios.post('http://127.0.0.1:8000/api/cost-of-sales/create', formData, {
        // const response = await axios.post('http://54.178.202.58:8000/api/cost-of-sales/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Form Data before submission:', formData);

      setModalMessage(translate('successfullySaved', language));
      setIsModalOpen(true);
      // Reset form data after successful save
      setFormData([{
        year: '',
        month: '',
        purchase: '',
        outsourcing_expense: '',
        product_purchase: '',
        dispatch_labor_expense: '',
        communication_expense: '',
        work_in_progress_expense: '',
        amortization_expense: '',
      }]);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Conflict: open the overwrite confirmation modal
        setModalMessage(translate('alertMessageAbove', language));
        setIsOverwriteModalOpen(true);
        return; // Exit the function to wait for user input
      } else {
        // Handle any other errors
        console.error('There was an error with expenses registration!', error);
      }
    }
  };

  // Handle overwrite confirmation
  const handleOverwriteConfirmation = async () => {
    setIsOverwriteModalOpen(false); // Close the overwrite modal
    setIsOverwriteConfirmed(true); // Set overwrite confirmed state

    // Call the submission method again after confirmation
    await handleSubmitConfirmed();
  };

  const handleSubmitConfirmed = async () => {
    const token = localStorage.getItem('accessToken');

    try {
      const overwriteResponse = await axios.put('http://127.0.0.1:8000/api/cost-of-sales/create', formData, {
        // const overwriteResponse = await axios.put('http://54.178.202.58:8000/api/cost-of-sales/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setModalMessage(translate('overWrite', language));
      setIsModalOpen(true);
      // Reset form data after successful overwrite
      setFormData([{
        year: '',
        month: '',
        purchase: '',
        outsourcing_expense: '',
        product_purchase: '',
        dispatch_labor_expense: '',
        communication_expense: '',
        work_in_progress_expense: '',
        amortization_expense: '',
      }]);
    } catch (overwriteError) {
      console.error('Error overwriting data:', overwriteError);
    } finally {
      setIsOverwriteConfirmed(false); // Reset overwrite confirmation
    }
  };

  useEffect(() => {
  }, [formData])

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
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
    <div className='costOfSalesRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='costOfSalesRegistration_content_wrapper'>
        <Sidebar />
        <div className='costOfSalesRegistration_data_content'>
          <div className='costOfSalesRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('costOfSalesRegistration', language)}
              handleTabsClick={handleTabsClick}
              buttonConfig={[
                { labelKey: 'project', tabKey: 'project' },
                { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                { labelKey: 'expenses', tabKey: 'expenses' },
                { labelKey: 'costOfSales', tabKey: 'costOfSales' },
              ]}
            />
          </div>
          <div className='costOfSalesRegistration_mid_body_cont'>
            <form className='costOfSalesRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='costOfSalesRegistration_mid_form_cont'>
                {formData.map((form, index) => (
                  <div
                    key={index}
                    className={`costOfSalesRegistration_form-content ${index > 0 ? 'costOfSalesRegistration_form-content-special' : ''}`}
                  >
                    <div
                      className={`costOfSalesRegistration_form-content ${index > 0 ? 'costOfSalesRegistration_form-line' : ''}`}
                    ></div>
                    <div className='costOfSalesRegistration_form-content-div'>
                      <div className='costOfSalesRegistration_left-form-div costOfSalesRegistration_calc'>
                        <div className='costOfSalesRegistration_year-div'>
                          <label className='costOfSalesRegistration_year'>{translate('year', language)}</label>
                          <select
                            className='costOfSalesRegistration_select-option'
                            name='year'
                            value={form.year}
                            onChange={(e) => handleChange(index, e)}
                            style={{ textAlign: 'center', textAlignLast: 'center' }}
                          >
                            <option value=''></option>
                            {years.map((year, i) => (
                              <option key={i} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='costOfSalesRegistration_outsourcing_expense-div'>
                          <label className='costOfSalesRegistration_outsourcing_expense'>
                            {translate('outsourcingExpenses', language)}
                          </label>
                          <input
                            type='number'
                            name='outsourcing_expense'
                            value={form.outsourcing_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='costOfSalesRegistration_communication_expense-div'>
                          <label className='costOfSalesRegistration_communication_expense'>
                            {translate('communicationExpenses', language)}
                          </label>
                          <input
                            type='number'
                            name='communication_expense'
                            value={form.communication_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='costOfSalesRegistration_middle-form-div costOfSalesRegistration_calc'>
                        <div className='costOfSalesRegistration_month-div'>
                          <label className='costOfSalesRegistration_month'>{translate('month', language)}</label>
                          <select
                            className='costOfSalesRegistration_select-option'
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
                        <div className='costOfSalesRegistration_product_purchase-div'>
                          <label className='costOfSalesRegistration_product_purchase'>
                            {translate('productPurchases', language)}
                          </label>
                          <input
                            type='number'
                            name='product_purchase'
                            value={form.product_purchase}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='costOfSalesRegistration_work_in_progress_expense-div'>
                          <label className='costOfSalesRegistration_work_in_progress_expense'>
                            {translate('workInProgressExpenses', language)}
                          </label>
                          <input
                            type='number'
                            name='work_in_progress_expense'
                            value={form.work_in_progress_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='costOfSalesRegistration_right-form-div costOfSalesRegistration_calc'>
                        <div className='costOfSalesRegistration_purchase-div'>
                          <label className='costOfSalesRegistration_purchase'>{translate('purchases', language)}</label>
                          <input
                            type='number'
                            name='purchase'
                            value={form.purchase}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='costOfSalesRegistration_dispatch_labor_expense-div'>
                          <label className='costOfSalesRegistration_dispatch_labor_expense'>
                            {translate('dispatchLaborExpenses', language)}
                          </label>
                          <input
                            type='number'
                            name='dispatch_labor_expense'
                            value={form.dispatch_labor_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='costOfSalesRegistration_amortization_expense-div'>
                          <label className='costOfSalesRegistration_amortization_expense'>
                            {translate('amortizationExpenses', language)}
                          </label>
                          <input
                            type='number'
                            name='amortization_expense'
                            value={form.amortization_expense}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                    </div>
                    {/* <input type='hidden' name='registered_user_id' value={form.registered_user_id} /> */}
                  </div>
                ))}
              </div>
              <div className='costOfSalesRegistration_lower_form_cont'>
                <div className='costOfSalesRegistration_form-content'>
                  <div className='costOfSalesRegistration_plus-btn'>
                    <button className='costOfSalesRegistration_inc' type='button' onClick={handleAdd}>
                      +
                    </button>
                    <button className='costOfSalesRegistration_dec' type='button' onClick={handleMinus}>
                      -
                    </button>
                  </div>
                  <div className='costOfSalesRegistration_options-btn'>
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
      />
      <AlertModal
        isOpen={isOverwriteModalOpen}
        onCancel={() => setIsOverwriteModalOpen(false)}
        onConfirm={handleOverwriteConfirmation}
        message={modalMessage}
      />
    </div>
  )
}

export default CostOfSalesRegistration
