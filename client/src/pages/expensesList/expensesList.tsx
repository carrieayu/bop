import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import axios from "axios";
import { HeaderDashboard } from "../../components/header/header";
import Sidebar from "../../components/SideBar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";


const header: string[] = 
  [
    'month', 
    'suppliesExpenses', 
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
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('case')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translations
    const select = [5, 10, 100]

    const totalPages = Math.ceil(100 / 10);

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }
     
    const handleTabsClick = (tab) => {
      setActiveTabOther(tab)
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

  return (
    <div className='proj_wrapper'>
      <div className='header_cont'>
        <div className='proj_top_btn_cont'>
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
      </div>
      <div className='projectlist_cont_wrapper'>
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className='projectlist_wrapper'>
          <div className='proj_top_content'>
            <div className='proj_top_body_cont'></div>
            <div className='proj_mid_body_cont'>
              <div className='proj_mid_btn_cont'>
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
                              ? 'expenses'
                              : 'cost_purchase',
                      )
                    }
                    className={
                      activeTabOther ===
                      (index === 0
                        ? 'case'
                        : index === 1
                          ? 'personnel_cost'
                          : index === 2
                            ? 'expenses'
                            : 'cost_purchase')
                        ? 'body-btn-active body-btn'
                        : 'body-btn'
                    }
                  />
                ))}
              </div>
              <div className='proj_title_table_cont'>
                <p className='proj_title'>{translate('expensesList', language)}</p>
                <Btn label={translate('newRegistration', language)} size='normal' onClick={() => ''} className='proj_btn' />
              </div>
              <div className='proj_table_wrapper'>
                <div className='proj_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      <table className='table is-bordered is-hoverable'>
                        <thead>
                          <tr className='proj_table_title '>
                            {header.map((head, index) => (
                              <th key={index} className='proj_table_title_content_vertical has-text-centered'>
                                {translate(head, language)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className='proj_table_body'>
                          {expenses.map((ex) => (
                            <tr key={ex.planning_project_id} className='proj_table_body_content_horizantal'>
                              <td className='proj_table_body_content_vertical has-text-centered'>{ex.month}</td>
                              <td className='proj_table_body_content_vertical'>{ex.consumables_expenses}</td>
                              <td className='proj_table_body_content_vertical has-text-centered'>{ex.rent}</td>
                              <td className='proj_table_body_content_vertical has-text-right'>
                                {ex.taxes_and_public_charges}
                              </td>
                              <td className='proj_table_body_content_vertical has-text-right'>
                                {ex.depreciation_expenses}
                              </td>
                              <td className='proj_table_body_content_vertical has-text-right'>{ex.travel_expenses}</td>
                              <td className='proj_table_body_content_vertical has-text-right'>
                                {ex.communication_expenses}
                              </td>
                              <td className='proj_table_body_content_vertical has-text-right'>
                                {ex.utilities_expenses}
                              </td>
                              <td className='proj_table_body_content_vertical has-text-right'>{ex.payment_fees}</td>
                              <td className='proj_table_body_content_vertical has-text-right'>
                                {ex.advertising_expenses}
                              </td>
                              <td className='proj_table_body_content_vertical has-text-right'>
                                {ex.entertainment_expenses}
                              </td>
                              <td className='proj_table_body_content_vertical has-text-right'>{ex.remuneration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className='proj_pagination_wrapper'>
                <div className='proj_pagination_cont'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    options={select}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  />
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
