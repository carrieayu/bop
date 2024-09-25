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


const CostOfSalesList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('costOfSales')
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


    const [costOfSales, setCostOfSales] = useState([]);


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
            // const response = await axios.get('http://127.0.0.1:8000/api/cost-of-sales/', {
            const response = await axios.get('http://54.178.202.58:8000/api/cost-of-sales/', {
              headers: {
                'Authorization': `Bearer ${token}`  // Add token to request headers
              }
            });
            setCostOfSales(response.data);
            console.log("cost of sales: ", response.data);
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

      console.log("cost of sales: ", setCostOfSales);

      useEffect(() => {
        const startIndex = currentPage * rowsPerPage
        setPaginatedData(costOfSales.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, costOfSales])

      useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
          setActiveTab(path);
        }
      }, [location.pathname]);

      // Fixed months array
    const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

    // Combine static months with dynamic data
    const combinedData = months.map((month) => {
        const data = costOfSales.find(item => parseInt(item.month, 10) === month) || {
            cost_of_sales: 0,
            purchases: 0,
            outsourcing_costs: 0,
            product_purchases: 0,
            dispatch_labor_costs: 0,
            communication_costs: 0,
            work_in_progress: 0,
            amortization: 0
        };
        return {
            month,
            ...data
        };
    });
    console.log("Combined Data: ", combinedData)

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

    const handleNewRegistrationClick = () => {
      navigate('/cost-of-sales-registration');
    };

  return (
    <div className='costOfSalesList_wrapper'>
        <HeaderButtons 
            activeTab={activeTab}
            handleTabClick={handleTabClick}
            isTranslateSwitchActive={isTranslateSwitchActive}
            handleTranslationSwitchToggle={handleTranslationSwitchToggle}
        />
        <div className="costOfSalesList_cont_wrapper">
                <Sidebar />
            <div className="costOfSalesList_btn_wrapper">
                    <div className="costOfSalesList_top_content">
                        <div className="costOfSalesList_top_body_cont"></div>
                        <div className="costOfSalesList_mid_body_cont">
                            <ListButtons
                              activeTabOther={activeTabOther}
                              message={translate('costOfSalesList', language)}
                              handleTabsClick={handleTabsClick}
                              handleNewRegistrationClick={handleNewRegistrationClick}
                              buttonConfig={[
                                { labelKey: 'project', tabKey: 'project' },
                                { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                                { labelKey: 'expenses', tabKey: 'expenses' },
                                { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                              ]}
                            />
                            <div className="costOfSalesList_table_wrapper">
                                <div className="costOfSalesList_table_cont">
                                    <div className='columns is-mobile'>
                                        <div className='column'>
                                            <table className='table is-bordered is-hoverable'>
                                            <thead>
                                                <tr className="costOfSalesList_table_title ">
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('month', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('costOfSales', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('purchases', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('outsourcingExpenses', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('productPurchases', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('dispatchLaborExpenses', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('communicationExpenses', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('workInProgressExpenses', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('amortizationExpenses', language)}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="costOfSalesList_table_body">
                                            {combinedData.map((project, index) => (
                                                        <tr key={index} className="costOfSalesList_table_body_content_horizontal">
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.month}</td>
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.cost_of_sales || 0}</td>
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.purchases || 0}</td>
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.outsourcing_costs || 0}</td>
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.product_purchases || 0}</td>
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.dispatch_labor_costs || 0}</td>
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.communication_costs || 0}</td>
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.work_in_progress || 0}</td>
                                                            <td className="costOfSalesList_table_body_content_vertical has-text-centered">{project.amortization || 0}</td>
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

export default CostOfSalesList;
