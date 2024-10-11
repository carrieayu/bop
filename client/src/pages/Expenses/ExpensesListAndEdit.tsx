import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import ListButtons from "../../components/ListButtons/ListButtons";
import HeaderButtons from "../../components/HeaderButtons/HeaderButtons";
import AlertModal from '../../components/AlertModal/AlertModal'
import { RiDeleteBin6Fill } from 'react-icons/ri'

const ExpensesList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('expenses')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  // added -ed
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [deleteExpenseId, setDeleteExpenseId] = useState([])
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [expensesList, setExpensesList] = useState([])

  const [changes, setChanges] = useState({}) //ians code maybe i do not need.

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
  const monthNames: { [key: number]: { en: string; jp: string } } = {
    1: { en: 'January', jp: '1月' },
    2: { en: 'February', jp: '2月' },
    3: { en: 'March', jp: '3月' },
    4: { en: 'April', jp: '4月' },
    5: { en: 'May', jp: '5月' },
    6: { en: 'June', jp: '6月' },
    7: { en: 'July', jp: '7月' },
    8: { en: 'August', jp: '8月' },
    9: { en: 'September', jp: '9月' },
    10: { en: 'October', jp: '10月' },
    11: { en: 'November', jp: '11月' },
    12: { en: 'December', jp: '12月' },
  }
  const header: string[] = [
    'year',
    'month',
    'consumableExpenses',
    'rentExpenses',
    'taxesAndPublicCharges',
    'depreciationExpenses',
    'travelExpenses',
    'communicationExpenses',
    'utilitiesExpenses',
    'transactionFees',
    'advertisingExpenses',
    'entertainmentExpenses',
    'professionalServicesFees',
  ]

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'project':
        navigate('/projects-list')
        break
      case 'employeeExpenses':
        navigate('/employee-expenses-list')
        break
      case 'expenses':
        navigate('/expenses-list')
        break
      case 'costOfSales':
        navigate('/cost-of-sales-list')
        break
      default:
        break
    }
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

  const handleChange = (index, e) => {
    const { name, value } = e.target
    const updatedData = [...combinedData]
    updatedData[index] = {
      ...updatedData[index],
      [name]: value,
    }
    setExpensesList(updatedData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Checks if any fields are empty for entries that have a expense_id
    const areFieldsEmpty = expensesList.some((entry) => {
      // Only check entries that have a valid expense_id
      if (entry.expense_id) {
        return (
          !entry.consumable_expense ||
          !entry.rent_expense ||
          !entry.tax_and_public_charge ||
          !entry.depreciation_expense ||
          !entry.travel_expense ||
          !entry.communication_expense ||
          !entry.utilities_expense ||
          !entry.transaction_fee ||
          !entry.advertising_expense ||
          !entry.entertainment_expense ||
          !entry.professional_service_fee
        )
      }
      return false // Skip entries without an expense_id
    })

    if (areFieldsEmpty) {
      alert(translate('allFieldsRequiredInputValidationMessage', language))
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }
    try {
      await axios.put('http://127.0.0.1:8000/api/expenses/update', validData, {
        // const response = await axios.put('http://54.178.202.58:8000/api/expenses/update', validData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      alert('Successfully updated')

      setIsEditing(false)

      const response = await axios.get('http://127.0.0.1:8000/api/expenses')

      setExpensesList(response.data)
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data)
        if (error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('There was an error updating the expenses data!', error.response.data)
        }
      } else {
        console.error('Error', error.message)
      }
    }
  }

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/login' // Redirect to login if no token found
        return
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/expenses', {
          // const response = await axios.get('http://54.178.202.58:8000/api/expenses/', {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to request headers
          },
        })
        setExpensesList(response.data)
        console.log('expenses: ', response.data)
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('There was an error fetching the expenses!', error)
        }
      }
    }

    fetchExpenses()
  }, [])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  // Extract unique years from the expenses data
  const uniqueYears = Array.from(new Set(expensesList.map((item) => item.year))).sort((a, b) => a - b)

  // Combine static months with dynamic data
  const combinedData = uniqueYears.flatMap((year) => {
    return months.map((month) => {
      const foundData = expensesList.find((item) => parseInt(item.month, 10) === month && item.year === year)

      return {
        expense_id: foundData ? foundData.expense_id : null,
        month,
        year,
        consumable_expense: foundData ? foundData.consumable_expense : '',
        rent_expense: foundData ? foundData.rent_expense : '',
        tax_and_public_charge: foundData ? foundData.tax_and_public_charge : '',
        depreciation_expense: foundData ? foundData.depreciation_expense : '',
        travel_expense: foundData ? foundData.travel_expense : '',
        communication_expense: foundData ? foundData.communication_expense : '',
        utilities_expense: foundData ? foundData.utilities_expense : '',
        transaction_fee: foundData ? foundData.transaction_fee : '',
        advertising_expense: foundData ? foundData.advertising_expense : '',
        entertainment_expense: foundData ? foundData.entertainment_expense : '',
        professional_service_fee: foundData ? foundData.professional_service_fee : '',
      }
    })
  })

  const validData = combinedData.filter((data) => data.expense_id !== null)

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

  const openModal = (expense, id) => {
    setSelectedExpense(expense)
    setModalIsOpen(true)
    setDeleteExpenseId(id)
  }

  const closeModal = () => {
    setSelectedExpense(null)
    setModalIsOpen(false)
  }

  const handleConfirm = async () => {
    console.log('Confirmed action for expense:', deleteExpenseId)
    const token = localStorage.getItem('accessToken')
    try {
      await axios.delete(`http://127.0.0.1:8000/api/expenses/${deleteExpenseId}/delete/`, {
        // const response = await axios.get(`http://54.178.202.58:8000/api/expenses/${deleteExpenseId}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to request headers
        },
      })
      setIsEditing(false)

      const response = await axios.get('http://127.0.0.1:8000/api/expenses')
      // const response = await axios.get('http://54.178.202.58:8000/api/expensess');
      setExpensesList(response.data)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login' // Redirect to login if unauthorized
      } else {
        console.error('Error deleting expenses:', error)
      }
    }
    closeModal()
  }

  const handleNewRegistrationClick = () => {
    navigate('/expenses-registration')
  }

  return (
    <div className={'expensesList_wrapper'}>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className={'expensesList_cont_wrapper'}>
        <Sidebar />
        <div className={`expensesList_wrapper ${isEditing ? 'editMode' : ''}`}>
          {/* <div className='expensesList_btn_cont_wrapper'> */}
          <div className='expensesList_top_content'>
            <div className='expensesList_top_body_cont'>
              <div className='expensesList_mode_switch_datalist'>
                <button className='expensesList_mode_switch' onClick={handleClick}>
                  {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                </button>
              </div>
            </div>
            <div className='expensesList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'expensesEdit' : 'expensesList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'project', tabKey: 'project' },
                  { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                  { labelKey: 'expenses', tabKey: 'expenses' },
                  { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                ]}
              />
              <div className={`expensesList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`expensesList_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  {/* <div className='expensesList_table_cont'> */}
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div className='editScroll'>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='expensesList_table_title '>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('year', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('month', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('consumableExpenses', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('rentExpenses', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('taxesAndPublicCharges', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('depreciationExpenses', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('travelExpenses', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('communicationExpenses', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('utilitiesExpenses', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('transactionFees', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('advertisingExpenses', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('entertainmentExpenses', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate('professionalServicesFees', language)}
                                </th>
                                <th className='expensesList_table_title_content_vertical has-text-centered'></th>
                              </tr>
                            </thead>
                            <tbody className='expensesList_table_body'>
                              {combinedData.map((expense, index) => {
                                const isNewYear = index === 0 || combinedData[index - 1].year !== expense.year
                                const isLastExpenseOfYear =
                                  index !== combinedData.length - 1 && combinedData[index + 1].year !== expense.year

                                const isEditable = expense.expense_id !== null

                                return (
                                  <React.Fragment key={index}>
                                    {expense ? (
                                      <tr key={index} className='expensesList_table_body_content_horizontal'>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          {expense.year}
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          {expense.month}
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='consumable_expense'
                                            value={expense.consumable_expense}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='rent_expense'
                                            value={expense.rent_expense}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='tax_and_public_charge'
                                            value={expense.tax_and_public_charge}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='depreciation_expense'
                                            value={expense.depreciation_expense}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='travel_expense'
                                            value={expense.travel_expense}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='communication_expense'
                                            value={expense.communication_expense}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>

                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='utilities_expense'
                                            value={expense.utilities_expense}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='transaction_fee'
                                            value={expense.transaction_fee}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='advertising_expense'
                                            value={expense.advertising_expense}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='entertainment_expense'
                                            value={expense.entertainment_expense}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical has-text-centered'>
                                          <input
                                            type='number'
                                            name='professional_service_fee'
                                            value={expense.professional_service_fee}
                                            onChange={(e) => handleChange(index, e)}
                                            disabled={!isEditable}
                                          />
                                        </td>
                                        <td className='expensesList_table_body_content_vertical delete_icon'>
                                          <RiDeleteBin6Fill
                                            className='delete-icon'
                                            onClick={() => openModal('expenses', expense.expense_id)}
                                            style={{ color: 'red' }}
                                          />
                                        </td>
                                      </tr>
                                    ) : null}
                                    {isLastExpenseOfYear && (
                                      <tr className='year-separator'>
                                        <td className='horizontal-line-cell' colSpan={9}>
                                          <div className='horizontal-line' />
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='expensesList_table_title '>
                              {header.map((head, index) => (
                                <th key={index} className='expensesList_table_title_content_vertical has-text-centered'>
                                  {translate(head, language)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className='expensesList_table_body'>
                            {combinedData.map((expense, index) => {
                              const isNewYear = index === 0 || combinedData[index - 1].year !== expense.year
                              const isLastExpenseOfYear =
                                index !== combinedData.length - 1 && combinedData[index + 1].year !== expense.year

                              return (
                                <React.Fragment key={index}>
                                  <tr className='expensesList_table_body_content_horizontal'>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      {expense.year}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      {expense.month}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical'>
                                      {expense.consumable_expense || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-centered'>
                                      {expense.rent_expense || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.tax_and_public_charge || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.depreciation_expense || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.travel_expense || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.communication_expense || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.utilities_expense || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.transaction_fee || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.advertising_expense || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.entertainment_expense || 0}
                                    </td>
                                    <td className='expensesList_table_body_content_vertical has-text-right'>
                                      {expense.professional_service_fee || 0}
                                    </td>
                                  </tr>
                                  {isLastExpenseOfYear && (
                                    <tr className='year-separator'>
                                      <td className='horizontal-line-cell' colSpan={9}>
                                        <div className='horizontal-line' />
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              )
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                    {/* </div> */}
                  </div>
                </div>
              </div>
            </div>
            <div className='expensesList_is_editing_wrapper'>
              <div className='expensesList_is_editing_cont'>
                {isEditing ? (
                  <div className='expensesList_edit_submit_btn_cont'>
                    <button className='expensesList_edit_submit_btn' onClick={handleSubmit}>
                      更新
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={modalIsOpen}
        onConfirm={handleConfirm}
        onCancel={closeModal}
        message={translate('deleteMessage', language)}
      />
    </div>
  )
};

export default ExpensesList;
