import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import ListButtons from "../../components/ListButtons/ListButtons";
import HeaderButtons from "../../components/HeaderButtons/HeaderButtons";


const header: string[] = 
  [
    'month', 
    'consumableExpenses', 
    'rentExpenses', 
    'taxesAndpublicCharges', 
    'depreciationExpenses', 
    'travelExpenses', 
    'communicationExpenses', 
    'utilitiesExpenses', 
    'transactionFees', 
    'advertisingExpenses', 
    'entertainmentExpenses', 
    'professionalServicesFees'
  ];

const ExpensesList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('expenses')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
    const select = [5, 10, 100]

    const totalPages = Math.ceil(100 / 10);

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }
     
    const handleTabsClick = (tab) => {
      setActiveTabOther(tab)
      switch (tab) {
        case 'project':
          navigate('/projects-list');
          break;
        case 'employeeExpenses':
          navigate('/employee-expenses-list');
          break;
        case 'expenses':
          navigate('/expenses-list');
          break;
        case 'costOfSales':
          navigate('/cost-of-sales-list');
          break;
        default:
          break;
      }
    }  

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };


    const [expenses, setExpensesList] = useState([]);



    const handleRowsPerPageChange = (numRows: number) => {
        setRowsPerPage(numRows)
        setCurrentPage(0) 
    }


    useEffect(() => {
        const fetchProjects = async () => {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            window.location.href = '/login';  // Redirect to login if no token found
            return;
          }
    
          try {
            // const response = await axios.get('http://127.0.0.1:8000/api/expenseslist/', {
              const response = await axios.get('http://54.178.202.58:8000/api/expenseslist/', {
              headers: {
                Authorization: `Bearer ${token}`, // Add token to request headers
              },
            })
            setExpensesList(response.data);
          } catch (error) {
            if (error.response && error.response.status === 401) {
              window.location.href = '/login';  // Redirect to login if unauthorized
            } else {
              console.error('There was an error fetching the projects!', error);
            }
          }
        };
    
        fetchProjects();
      }, []);

      useEffect(() => {
        const startIndex = currentPage * rowsPerPage
        setPaginatedData(expenses.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, expenses])

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

      const handleNewRegistrationClick = () => {
        navigate('/expenses-registration');
      };

  return (
    <div className='expensesList_wrapper'>
        <HeaderButtons 
            activeTab={activeTab}
            handleTabClick={handleTabClick}
            isTranslateSwitchActive={isTranslateSwitchActive}
            handleTranslationSwitchToggle={handleTranslationSwitchToggle}
        />
      <div className='expensesList_cont_wrapper'>
          <Sidebar />
        <div className='expensesList_btn_cont_wrapper'>
          <div className='expensesList_top_content'>
            <div className='expensesList_top_body_cont'></div>
            <div className='expensesList_mid_body_cont'>
              <ListButtons
                  activeTabOther={activeTabOther}
                  message={translate('expensesList', language)}
                  handleTabsClick={handleTabsClick}
                  handleNewRegistrationClick={handleNewRegistrationClick}
                  buttonConfig={[
                    { labelKey: 'project', tabKey: 'project' },
                    { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                    { labelKey: 'expenses', tabKey: 'expenses' },
                    { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                  ]}
                />
              <div className='expensesList_table_wrapper'>
                <div className='expensesList_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
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
                          {expenses.map((ex) => (
                            <tr key={ex.planning_project_id} className='expensesList_table_body_content_horizontal'>
                              <td className='expensesList_table_body_content_vertical has-text-centered'>{ex.month}</td>
                              <td className='expensesList_table_body_content_vertical'>{ex.consumables_expenses}</td>
                              <td className='expensesList_table_body_content_vertical has-text-centered'>{ex.rent}</td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>
                                {ex.taxes_and_public_charges}
                              </td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>
                                {ex.depreciation_expenses}
                              </td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>{ex.travel_expenses}</td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>
                                {ex.communication_expenses}
                              </td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>
                                {ex.utilities_expenses}
                              </td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>{ex.payment_fees}</td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>
                                {ex.advertising_expenses}
                              </td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>
                                {ex.entertainment_expenses}
                              </td>
                              <td className='expensesList_table_body_content_vertical has-text-right'>{ex.remuneration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ExpensesList;
